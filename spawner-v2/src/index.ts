/**
 * Spawner V2 - MCP Server Entry Point
 *
 * Cloudflare Worker that provides MCP tools for AI-powered development.
 *
 * V2 Original Tools:
 * - spawner_load: Load project context and relevant skills (was: spawner_context)
 * - spawner_validate: Run guardrail checks on code
 * - spawner_remember: Save decisions and session progress
 * - spawner_watch_out: Get gotchas for current situation (was: spawner_sharp_edge)
 * - spawner_unstick: Get help when stuck
 *
 * V1 Ported Tools:
 * - spawner_templates: List available project templates
 * - spawner_skills: Search and retrieve skills (V1 markdown + V2 YAML)
 *
 * Planning & Analysis Tools:
 * - spawner_plan: Unified project planning (discover + recommend + create)
 * - spawner_analyze: Codebase analysis for stack/skill recommendations
 */

import type { Env } from './types.js';
import { getToolDefinitions, executeTool, hasTool } from './tools/index.js';
import {
  checkRateLimit,
  createRateLimitError,
  getClientIp,
} from './middleware/rate-limit.js';

/**
 * MCP Protocol types
 */
interface McpRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

interface McpResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

/**
 * Main worker entry point
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCors();
    }

    // Only accept POST requests
    if (request.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        {
          status: 405,
          headers: corsHeaders(),
        }
      );
    }

    try {
      const body = await request.json() as McpRequest;

      // Route to appropriate handler
      const response = await handleMcpRequest(body, env, request);

      return new Response(JSON.stringify(response), {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders(),
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return new Response(
        JSON.stringify({
          jsonrpc: '2.0',
          id: null,
          error: {
            code: -32700,
            message: `Parse error: ${message}`,
          },
        }),
        {
          status: 400,
          headers: corsHeaders(),
        }
      );
    }
  },
};

/**
 * Handle MCP JSON-RPC request
 */
async function handleMcpRequest(
  request: McpRequest,
  env: Env,
  httpRequest: Request
): Promise<McpResponse> {
  const { jsonrpc, id, method, params } = request;

  // Validate JSON-RPC version
  if (jsonrpc !== '2.0') {
    return {
      jsonrpc: '2.0',
      id,
      error: { code: -32600, message: 'Invalid Request: Must be JSON-RPC 2.0' },
    };
  }

  // Extract user ID from header or generate one
  const userId = httpRequest.headers.get('X-User-ID') ?? generateUserId();

  // Extract client IP for rate limiting
  const clientIp = getClientIp(httpRequest);

  // Route by method
  switch (method) {
    case 'initialize':
      return handleInitialize(id);

    case 'tools/list':
      return handleListTools(id);

    case 'tools/call':
      return await handleCallTool(id, params, env, userId, clientIp);

    case 'ping':
      return { jsonrpc: '2.0', id, result: { status: 'ok' } };

    default:
      return {
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Method not found: ${method}` },
      };
  }
}

/**
 * Handle initialize request
 */
function handleInitialize(id: string | number): McpResponse {
  return {
    jsonrpc: '2.0',
    id,
    result: {
      protocolVersion: '2024-11-05',
      capabilities: {
        tools: {},
      },
      serverInfo: {
        name: 'spawner',
        version: '2.0.0',
      },
    },
  };
}

/**
 * Handle tools/list request
 */
function handleListTools(id: string | number): McpResponse {
  const definitions = getToolDefinitions();
  return {
    jsonrpc: '2.0',
    id,
    result: {
      tools: definitions.map(t => ({
        name: t.name,
        description: t.description,
        inputSchema: t.inputSchema,
      })),
    },
  };
}

/**
 * Handle tools/call request
 */
async function handleCallTool(
  id: string | number,
  params: Record<string, unknown> | undefined,
  env: Env,
  userId: string,
  clientIp: string
): Promise<McpResponse> {
  if (!params || typeof params.name !== 'string') {
    return {
      jsonrpc: '2.0',
      id,
      error: { code: -32602, message: 'Invalid params: name required' },
    };
  }

  const toolName = params.name;
  const toolArgs = (params.arguments ?? {}) as Record<string, unknown>;

  // Check if tool exists
  if (!hasTool(toolName)) {
    return {
      jsonrpc: '2.0',
      id,
      error: { code: -32602, message: `Unknown tool: ${toolName}` },
    };
  }

  // Check rate limit before executing tool
  const rateLimitResult = await checkRateLimit(env, clientIp, toolName);
  if (!rateLimitResult.allowed) {
    return {
      jsonrpc: '2.0',
      id,
      error: createRateLimitError(rateLimitResult),
    };
  }

  try {
    // Execute tool via registry
    const result = await executeTool(toolName, env, toolArgs, userId);

    return {
      jsonrpc: '2.0',
      id,
      result: {
        content: [
          {
            type: 'text',
            text: typeof result === 'string' ? result : JSON.stringify(result, null, 2),
          },
        ],
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return {
      jsonrpc: '2.0',
      id,
      error: { code: -32603, message: `Internal error: ${message}` },
    };
  }
}

/**
 * Generate a user ID for anonymous users
 */
function generateUserId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `anon-${timestamp}-${random}`;
}

/**
 * CORS headers
 */
function corsHeaders(): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-User-ID',
  };
}

/**
 * Handle CORS preflight
 */
function handleCors(): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeaders(),
  });
}
