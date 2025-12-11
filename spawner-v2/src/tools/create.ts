/**
 * spawner_create Tool
 *
 * Create a new project with scaffolding and D1 initialization.
 * Combines V1 project creation with V2 database persistence.
 */

import { z } from 'zod';
import type { Env } from '../types';
import { emitEvent } from '../telemetry/events';

/**
 * Templates for different project types (from V1)
 */
const TEMPLATES = {
  saas: {
    name: 'SaaS',
    description: 'Subscription products with auth, billing, and dashboards',
    stack: ['nextjs', 'supabase', 'stripe', 'tailwind'],
    agents: ['planner', 'frontend', 'backend', 'database', 'testing'],
  },
  marketplace: {
    name: 'Marketplace',
    description: 'Buy/sell platforms with listings, search, and payments',
    stack: ['nextjs', 'supabase', 'stripe', 'algolia', 'tailwind'],
    agents: ['planner', 'frontend', 'backend', 'database', 'payments', 'search'],
  },
  'ai-app': {
    name: 'AI App',
    description: 'LLM-powered applications with chat, embeddings, and RAG',
    stack: ['nextjs', 'supabase', 'openai', 'tailwind'],
    agents: ['planner', 'frontend', 'backend', 'database', 'ai'],
  },
  web3: {
    name: 'Web3 dApp',
    description: 'Blockchain apps with wallet connect and smart contracts',
    stack: ['nextjs', 'wagmi', 'viem', 'tailwind'],
    agents: ['planner', 'frontend', 'smart-contracts', 'testing'],
  },
  tool: {
    name: 'Tool/CLI',
    description: 'Utilities and command-line tools',
    stack: ['typescript', 'node'],
    agents: ['planner', 'backend', 'testing'],
  },
} as const;

type TemplateId = keyof typeof TEMPLATES;

/**
 * Input schema for spawner_create
 */
export const createInputSchema = z.object({
  template: z.enum(['saas', 'marketplace', 'ai-app', 'web3', 'tool']).describe(
    'Template to use for the project'
  ),
  project_name: z.string().min(1).describe(
    'Name for the project'
  ),
  description: z.string().optional().describe(
    'Brief description of what you\'re building'
  ),
  stack_overrides: z.array(z.string()).optional().describe(
    'Override default stack technologies (optional)'
  ),
});

/**
 * Tool definition for MCP
 */
export const createToolDefinition = {
  name: 'spawner_create',
  description: 'Create a new project with scaffolding. Use this at the start of a new project to set up the foundation.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      template: {
        type: 'string',
        enum: ['saas', 'marketplace', 'ai-app', 'web3', 'tool'],
        description: 'Template to use: saas (subscription products), marketplace (buy/sell), ai-app (LLM-powered), web3 (blockchain), tool (CLI/utilities)',
      },
      project_name: {
        type: 'string',
        description: 'Name for the project (used for folder and database)',
      },
      description: {
        type: 'string',
        description: 'Brief description of what you\'re building',
      },
      stack_overrides: {
        type: 'array',
        items: { type: 'string' },
        description: 'Override default stack technologies (optional)',
      },
    },
    required: ['template', 'project_name'],
  },
};

/**
 * Output type
 */
export interface CreateOutput {
  project_id: string;
  project_name: string;
  template: string;
  stack: string[];
  agents: string[];
  scaffolding: {
    files: string[];
    directories: string[];
  };
  next_steps: string[];
  _instruction: string;
}

/**
 * Execute the spawner_create tool
 */
export async function executeCreate(
  env: Env,
  input: z.infer<typeof createInputSchema>,
  userId: string
): Promise<CreateOutput> {
  // Validate input
  const parsed = createInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(`Invalid input: ${parsed.error.message}`);
  }

  const { template, project_name, description, stack_overrides } = parsed.data;

  // Get template config
  const templateConfig = TEMPLATES[template as TemplateId];
  if (!templateConfig) {
    throw new Error(`Unknown template: ${template}`);
  }

  // Determine stack (use overrides or defaults)
  const stack = stack_overrides && stack_overrides.length > 0
    ? stack_overrides
    : [...templateConfig.stack];

  // Generate project ID
  const projectId = generateProjectId(project_name);

  // Create project in D1
  await env.DB.prepare(`
    INSERT INTO projects (id, user_id, name, description, stack, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).bind(
    projectId,
    userId,
    project_name,
    description ?? null,
    JSON.stringify(stack)
  ).run();

  // Cache project in KV for quick access
  await env.CACHE.put(
    `project:${projectId}`,
    JSON.stringify({
      id: projectId,
      user_id: userId,
      name: project_name,
      description: description ?? null,
      stack,
      template,
      agents: templateConfig.agents,
    }),
    { expirationTtl: 86400 * 7 } // 7 days
  );

  // Emit telemetry
  await emitEvent(env.DB, 'session_start', {
    template,
    stack,
    agents: templateConfig.agents,
  }, projectId);

  // Build scaffolding instructions
  const scaffolding = generateScaffolding(template, project_name, stack);
  const nextSteps = generateNextSteps(template, templateConfig.agents);

  return {
    project_id: projectId,
    project_name,
    template,
    stack,
    agents: [...templateConfig.agents],
    scaffolding,
    next_steps: nextSteps,
    _instruction: buildInstruction(project_name, template, stack, templateConfig.agents),
  };
}

/**
 * Generate a project ID from the name
 */
function generateProjectId(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 32);
  const timestamp = Date.now().toString(36);
  return `${slug}-${timestamp}`;
}

/**
 * Generate scaffolding file list based on template
 */
function generateScaffolding(
  template: string,
  projectName: string,
  stack: string[]
): { files: string[]; directories: string[] } {
  const directories = [
    `${projectName}/`,
    `${projectName}/src/`,
    `${projectName}/docs/`,
    `${projectName}/.claude/`,
  ];

  const files = [
    `${projectName}/CLAUDE.md`,
    `${projectName}/state.json`,
    `${projectName}/task_queue.json`,
    `${projectName}/docs/PRD.md`,
    `${projectName}/docs/ARCHITECTURE.md`,
  ];

  // Add template-specific files
  if (stack.includes('nextjs')) {
    directories.push(
      `${projectName}/src/app/`,
      `${projectName}/src/components/`,
      `${projectName}/src/lib/`,
    );
    files.push(
      `${projectName}/src/app/layout.tsx`,
      `${projectName}/src/app/page.tsx`,
      `${projectName}/next.config.js`,
      `${projectName}/tailwind.config.js`,
    );
  }

  if (stack.includes('supabase')) {
    directories.push(`${projectName}/supabase/`);
    files.push(
      `${projectName}/supabase/config.toml`,
      `${projectName}/src/lib/supabase/client.ts`,
      `${projectName}/src/lib/supabase/server.ts`,
    );
  }

  if (stack.includes('stripe')) {
    files.push(
      `${projectName}/src/lib/stripe.ts`,
      `${projectName}/src/app/api/webhooks/stripe/route.ts`,
    );
  }

  return { files, directories };
}

/**
 * Generate next steps based on template
 */
function generateNextSteps(template: string, agents: readonly string[]): string[] {
  const steps: string[] = [
    'Run `spawner_context` with this project_id to load skills',
    'Describe your product vision for the planning phase',
  ];

  if (template === 'saas') {
    steps.push(
      'Define your core features and pricing tiers',
      'Set up Supabase project and configure auth',
      'Create Stripe account and set up products',
    );
  } else if (template === 'marketplace') {
    steps.push(
      'Define listing types and user roles (buyer/seller)',
      'Plan search and discovery flow',
      'Set up payment split logic',
    );
  } else if (template === 'ai-app') {
    steps.push(
      'Define AI features and interaction patterns',
      'Set up OpenAI/Anthropic API keys',
      'Plan token usage and rate limiting',
    );
  } else if (template === 'web3') {
    steps.push(
      'Define supported chains and wallets',
      'Plan smart contract interactions',
      'Set up testnet configuration',
    );
  } else if (template === 'tool') {
    steps.push(
      'Define CLI commands and options',
      'Plan input/output formats',
      'Set up testing strategy',
    );
  }

  return steps;
}

/**
 * Build instruction string for Claude
 */
function buildInstruction(
  projectName: string,
  template: string,
  stack: string[],
  agents: readonly string[]
): string {
  return `Project "${projectName}" created successfully!

Template: ${template}
Stack: ${stack.join(', ')}
Agents: ${agents.join(', ')}

This project is now tracked in Spawner's database. Use spawner_context with this project_id to load relevant skills and resume sessions.

Next: Start the planning phase by describing what you want to build. I'll help you:
1. Define requirements (PRD)
2. Plan architecture
3. Break down into tasks
4. Build iteratively with validation

What would you like to build?`;
}
