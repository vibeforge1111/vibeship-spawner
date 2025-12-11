/**
 * spawner_templates Tool
 *
 * List available project templates with their configurations.
 */

import type { Env } from '../types';

/**
 * Templates for different project types
 */
const TEMPLATES = {
  saas: {
    name: 'SaaS',
    description: 'Subscription products with auth, billing, and dashboards',
    stack: ['nextjs', 'supabase', 'stripe', 'tailwind'],
    agents: ['planner', 'frontend', 'backend', 'database', 'testing'],
    use_cases: ['B2B tools', 'productivity apps', 'subscription services'],
  },
  marketplace: {
    name: 'Marketplace',
    description: 'Buy/sell platforms with listings, search, and payments',
    stack: ['nextjs', 'supabase', 'stripe', 'algolia', 'tailwind'],
    agents: ['planner', 'frontend', 'backend', 'database', 'payments', 'search'],
    use_cases: ['E-commerce', 'service marketplaces', 'booking platforms'],
  },
  'ai-app': {
    name: 'AI App',
    description: 'LLM-powered applications with chat, embeddings, and RAG',
    stack: ['nextjs', 'supabase', 'openai', 'tailwind'],
    agents: ['planner', 'frontend', 'backend', 'database', 'ai'],
    use_cases: ['Chatbots', 'content generation', 'AI assistants', 'RAG apps'],
  },
  web3: {
    name: 'Web3 dApp',
    description: 'Blockchain apps with wallet connect and smart contracts',
    stack: ['nextjs', 'wagmi', 'viem', 'tailwind'],
    agents: ['planner', 'frontend', 'smart-contracts', 'testing'],
    use_cases: ['DeFi', 'NFT platforms', 'DAOs', 'token apps'],
  },
  tool: {
    name: 'Tool/CLI',
    description: 'Utilities and command-line tools',
    stack: ['typescript', 'node'],
    agents: ['planner', 'backend', 'testing'],
    use_cases: ['CLI tools', 'dev utilities', 'automation scripts'],
  },
} as const;

/**
 * Tool definition for MCP
 */
export const templatesToolDefinition = {
  name: 'spawner_templates',
  description: 'List available project templates with their default stack, agents, and use cases.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      filter: {
        type: 'string',
        description: 'Optional filter by use case keyword (e.g., "payments", "ai", "blockchain")',
      },
    },
  },
};

/**
 * Output type
 */
export interface TemplatesOutput {
  templates: {
    id: string;
    name: string;
    description: string;
    stack: string[];
    agents: string[];
    use_cases: string[];
  }[];
  _instruction: string;
}

/**
 * Execute the spawner_templates tool
 */
export async function executeTemplates(
  _env: Env,
  input: { filter?: string }
): Promise<TemplatesOutput> {
  const filter = input.filter?.toLowerCase();

  // Build template list
  const templates = Object.entries(TEMPLATES).map(([id, config]) => ({
    id,
    name: config.name,
    description: config.description,
    stack: [...config.stack],
    agents: [...config.agents],
    use_cases: [...config.use_cases],
  }));

  // Filter if provided
  const filtered = filter
    ? templates.filter(t =>
        t.id.includes(filter) ||
        t.name.toLowerCase().includes(filter) ||
        t.description.toLowerCase().includes(filter) ||
        t.stack.some(s => s.includes(filter)) ||
        t.use_cases.some(u => u.toLowerCase().includes(filter))
      )
    : templates;

  return {
    templates: filtered,
    _instruction: buildInstruction(filtered, filter),
  };
}

/**
 * Build instruction string
 */
function buildInstruction(
  templates: TemplatesOutput['templates'],
  filter?: string
): string {
  if (templates.length === 0) {
    return `No templates found matching "${filter}". Available templates: saas, marketplace, ai-app, web3, tool`;
  }

  const lines: string[] = [
    `Found ${templates.length} template${templates.length === 1 ? '' : 's'}:`,
    '',
  ];

  for (const t of templates) {
    lines.push(`**${t.name}** (\`${t.id}\`)`);
    lines.push(`  ${t.description}`);
    lines.push(`  Stack: ${t.stack.join(', ')}`);
    lines.push(`  Use cases: ${t.use_cases.join(', ')}`);
    lines.push('');
  }

  lines.push('Use `spawner_create` with template="<id>" to start a new project.');

  return lines.join('\n');
}
