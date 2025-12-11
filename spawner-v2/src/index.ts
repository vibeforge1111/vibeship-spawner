/**
 * Spawner V2 - MCP Server Entry Point
 *
 * Cloudflare Worker that provides MCP tools for AI-powered development.
 *
 * Tools:
 * - spawner_context: Load project context and relevant skills
 * - spawner_validate: Run guardrail checks on code
 * - spawner_remember: Save decisions and session progress
 * - spawner_sharp_edge: Query gotchas for current situation
 * - spawner_unstick: Get help when stuck
 */

import type { Env } from './types';
import {
  contextToolDefinition,
  executeContext,
  validateToolDefinition,
  executeValidate,
  rememberToolDefinition,
  executeRemember,
  sharpEdgeToolDefinition,
  executeSharpEdge,
  unstickToolDefinition,
  executeUnstick,
} from './tools';

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
 * Tool definitions for MCP
 */
const TOOLS = [
  contextToolDefinition,
  validateToolDefinition,
  rememberToolDefinition,
  sharpEdgeToolDefinition,
  unstickToolDefinition,
];

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

  // Route by method
  switch (method) {
    case 'initialize':
      return handleInitialize(id);

    case 'tools/list':
      return handleListTools(id);

    case 'tools/call':
      return await handleCallTool(id, params, env, userId);

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
  return {
    jsonrpc: '2.0',
    id,
    result: {
      tools: TOOLS.map(t => ({
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
  userId: string
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

  try {
    let result: unknown;

    switch (toolName) {
      case 'spawner_context':
        result = await executeContext(
          env,
          {
            project_id: toolArgs.project_id as string | undefined,
            project_description: toolArgs.project_description as string | undefined,
            stack_hints: toolArgs.stack_hints as string[] | undefined,
          },
          userId
        );
        break;

      case 'spawner_validate':
        result = await executeValidate(
          env,
          {
            code: toolArgs.code as string,
            file_path: toolArgs.file_path as string,
            check_types: toolArgs.check_types as ('security' | 'patterns' | 'production')[] | undefined,
          },
          userId
        );
        break;

      case 'spawner_remember':
        result = await executeRemember(
          env,
          {
            project_id: toolArgs.project_id as string,
            update: toolArgs.update as {
              decision?: { what: string; why: string };
              issue?: { description: string; status: 'open' | 'resolved' };
              session_summary?: string;
              validated?: string[];
            },
          },
          userId
        );
        break;

      case 'spawner_sharp_edge':
        result = await executeSharpEdge(
          env,
          {
            stack: toolArgs.stack as string[],
            situation: toolArgs.situation as string | undefined,
            code_context: toolArgs.code_context as string | undefined,
          }
        );
        break;

      case 'spawner_unstick':
        result = await executeUnstick(
          env,
          {
            task_description: toolArgs.task_description as string,
            attempts: toolArgs.attempts as string[],
            errors: toolArgs.errors as string[],
            current_code: toolArgs.current_code as string | undefined,
          }
        );
        break;

      default:
        return {
          jsonrpc: '2.0',
          id,
          error: { code: -32602, message: `Unknown tool: ${toolName}` },
        };
    }

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
