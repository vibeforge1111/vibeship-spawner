/**
 * vibeship-spawner MCP Worker
 *
 * Remote MCP server running on Cloudflare Workers.
 * Implements SSE transport for Claude Desktop's mcp-remote proxy.
 *
 * Note: This server returns project scaffolding as content (not files),
 * since remote servers can't write to the user's filesystem directly.
 * Users use the CLI (`npx vibeship-spawner create`) for actual file creation.
 */

interface Env {
  ENVIRONMENT: string;
}

// Templates with their default agents and MCPs
const TEMPLATES: Record<string, { agents: string[]; mcps: string[] }> = {
  saas: {
    agents: ['planner', 'frontend', 'backend', 'database', 'testing'],
    mcps: ['filesystem', 'supabase', 'stripe']
  },
  marketplace: {
    agents: ['planner', 'frontend', 'backend', 'database', 'payments', 'search'],
    mcps: ['filesystem', 'supabase', 'stripe', 'algolia']
  },
  'ai-app': {
    agents: ['planner', 'frontend', 'backend', 'database', 'ai'],
    mcps: ['filesystem', 'supabase', 'anthropic']
  },
  web3: {
    agents: ['planner', 'frontend', 'smart-contracts', 'testing'],
    mcps: ['filesystem', 'git', 'foundry']
  },
  tool: {
    agents: ['planner', 'backend', 'testing'],
    mcps: ['filesystem', 'git']
  }
};

// MCP Protocol types
interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}

interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
}

// Tool definitions
const TOOLS = [
  {
    name: 'create_project',
    description: 'Spawn a new vibeship project with agents and MCPs. Returns project scaffolding content.',
    inputSchema: {
      type: 'object',
      properties: {
        gist_id: {
          type: 'string',
          description: 'GitHub Gist ID containing project config'
        },
        template: {
          type: 'string',
          enum: ['saas', 'marketplace', 'ai-app', 'web3', 'tool'],
          description: 'Template name (use if no gist_id)'
        },
        project_name: {
          type: 'string',
          description: 'Project name (required with template)'
        }
      }
    }
  },
  {
    name: 'check_environment',
    description: 'Check remote MCP status and available templates',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'list_templates',
    description: 'List available project templates with their agents and MCPs',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  }
];

// Handle MCP methods
async function handleMethod(method: string, params: Record<string, unknown> = {}): Promise<unknown> {
  switch (method) {
    case 'initialize':
      return {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: 'vibeship-spawner',
          version: '1.0.0'
        }
      };

    case 'tools/list':
      return { tools: TOOLS };

    case 'tools/call':
      return handleToolCall(params.name as string, params.arguments as Record<string, unknown>);

    case 'ping':
      return {};

    // Handle notifications (no response needed, return empty object)
    case 'notifications/initialized':
    case 'notifications/cancelled':
    case 'notifications/progress':
      return {};

    default:
      // For unknown methods, return empty result instead of error
      // This handles any other notifications gracefully
      if (method.startsWith('notifications/')) {
        return {};
      }
      throw { code: -32601, message: `Method not found: ${method}` };
  }
}

// Handle tool calls
async function handleToolCall(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'create_project':
      return createProject(args);
    case 'check_environment':
      return checkEnvironment();
    case 'list_templates':
      return listTemplates();
    default:
      throw { code: -32602, message: `Unknown tool: ${name}` };
  }
}

// Create project - returns content instead of writing files
async function createProject(args: Record<string, unknown>): Promise<unknown> {
  const { gist_id, template, project_name } = args as {
    gist_id?: string;
    template?: string;
    project_name?: string;
  };

  let config: {
    project_name: string;
    agents: string[];
    mcps: string[];
    behaviors: { mandatory: string[]; selected: string[] };
  };

  if (gist_id) {
    // Fetch config from gist
    const gistConfig = await fetchGist(gist_id);
    config = {
      project_name: gistConfig.project_name || 'my-project',
      agents: gistConfig.agents || ['planner'],
      mcps: gistConfig.mcps || ['filesystem'],
      behaviors: gistConfig.behaviors || {
        mandatory: ['verify-before-complete', 'follow-architecture'],
        selected: ['tdd-mode']
      }
    };
  } else if (template && project_name) {
    const templateConfig = TEMPLATES[template];
    if (!templateConfig) {
      return {
        content: [{
          type: 'text',
          text: `Unknown template: ${template}. Available: ${Object.keys(TEMPLATES).join(', ')}`
        }],
        isError: true
      };
    }
    config = {
      project_name,
      agents: templateConfig.agents,
      mcps: templateConfig.mcps,
      behaviors: {
        mandatory: ['verify-before-complete', 'follow-architecture', 'maintainable-code', 'secure-code'],
        selected: ['tdd-mode']
      }
    };
  } else {
    return {
      content: [{
        type: 'text',
        text: 'Either gist_id or (template + project_name) is required'
      }],
      isError: true
    };
  }

  // Generate scaffolding content
  const claudeMd = generateClaudeMd(config);
  const stateJson = generateStateJson(config);

  const result = `
# Project Ready to Spawn: ${config.project_name}

## Your Agents
${config.agents.map(a => `- ${a}`).join('\n')}

## Connected MCPs
${config.mcps.map(m => `- ${m}`).join('\n')}

---

## To create this project locally, run:

\`\`\`bash
npx vibeship-spawner create ${gist_id ? gist_id : `--template ${template} --name ${project_name}`}
\`\`\`

This will create the full project structure with:
- CLAUDE.md (project instructions)
- skills/ directory with agent skill files
- state.json and task_queue.json
- docs/ templates

---

## Generated CLAUDE.md Preview:

\`\`\`markdown
${claudeMd}
\`\`\`

## Generated state.json Preview:

\`\`\`json
${stateJson}
\`\`\`
`;

  return {
    content: [{
      type: 'text',
      text: result
    }]
  };
}

function checkEnvironment(): unknown {
  return {
    content: [{
      type: 'text',
      text: `
vibeship-spawner MCP (Remote)

Status: Connected
Transport: SSE (Cloudflare Workers)
Version: 1.0.0

Available Templates:
${Object.entries(TEMPLATES).map(([name, config]) =>
  `- ${name}: ${config.agents.length} agents, ${config.mcps.length} MCPs`
).join('\n')}

Note: This remote MCP returns project content.
For file creation, use: npx vibeship-spawner create
`
    }]
  };
}

function listTemplates(): unknown {
  const templateList = Object.entries(TEMPLATES).map(([name, config]) => ({
    name,
    agents: config.agents,
    mcps: config.mcps
  }));

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({ templates: templateList }, null, 2)
    }]
  };
}

// Fetch gist from GitHub
async function fetchGist(gistId: string): Promise<Record<string, unknown>> {
  const response = await fetch(`https://api.github.com/gists/${gistId}`, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'vibeship-spawner-mcp'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch gist: ${response.status}`);
  }

  const gist = await response.json() as { files: Record<string, { content: string }> };
  const configFile = gist.files['vibeship-config.json'] || gist.files['config.json'];

  if (!configFile) {
    throw new Error('No config file found in gist');
  }

  return JSON.parse(configFile.content);
}

// Generate CLAUDE.md content
function generateClaudeMd(config: { project_name: string; agents: string[]; mcps: string[]; behaviors: { mandatory: string[]; selected: string[] } }): string {
  return `# ${config.project_name}

## vibeship spawner

This project uses vibeship spawner for AI-powered development.

> "You vibe. It ships."

---

### On Session Start

ALWAYS do this first:

1. Read \`state.json\` - check current phase, checkpoint, and custom_skills_needed
2. If this is a fresh project, greet the user with a project summary
3. Based on phase:
   - \`planning\` -> Load \`skills/planner.md\`, start/continue planning
   - \`building\` -> Read \`task_queue.json\`, load skill for next pending task
   - \`review\` -> Show summary, ask for feedback

---

### Your Stack

**Agents:** ${config.agents.join(', ')}

**MCPs:** ${config.mcps.join(', ')}

**Behaviors:**
${config.behaviors.mandatory.map(b => `- [mandatory] ${b}`).join('\n')}
${config.behaviors.selected.map(b => `- [selected] ${b}`).join('\n')}
`;
}

// Generate state.json content
function generateStateJson(config: { project_name: string; agents: string[]; mcps: string[] }): string {
  return JSON.stringify({
    project_name: config.project_name,
    phase: 'planning',
    agents: config.agents,
    mcps: config.mcps,
    checkpoint: { last_task: null },
    decisions: [],
    assumptions: [],
    custom_skills_needed: []
  }, null, 2);
}

// Main worker handler
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    };

    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Health check
    if (url.pathname === '/' || url.pathname === '/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        service: 'vibeship-spawner-mcp',
        version: '1.0.0'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // SSE endpoint for MCP
    if (url.pathname === '/sse' || url.pathname === '/mcp') {
      // For SSE, we need to handle the MCP protocol over HTTP
      if (request.method === 'POST') {
        try {
          const body = await request.json() as JsonRpcRequest;
          const result = await handleMethod(body.method, body.params);

          const response: JsonRpcResponse = {
            jsonrpc: '2.0',
            id: body.id,
            result
          };

          return new Response(JSON.stringify(response), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        } catch (error) {
          const err = error as { code?: number; message?: string };
          const response: JsonRpcResponse = {
            jsonrpc: '2.0',
            id: 0,
            error: {
              code: err.code || -32603,
              message: err.message || 'Internal error'
            }
          };

          return new Response(JSON.stringify(response), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      // GET request - return SSE stream info
      return new Response(JSON.stringify({
        message: 'vibeship-spawner MCP endpoint',
        usage: 'POST JSON-RPC requests to this endpoint',
        methods: ['initialize', 'tools/list', 'tools/call', 'ping']
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  }
};
