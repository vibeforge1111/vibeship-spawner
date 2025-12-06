import { writable, derived } from 'svelte/store';

// Types
export interface Agent {
  id: string;
  name: string;
  icon: string;
  shortDescription: string;
  fullDescription: string;
  capabilities: string[];
  requiredMcps: string[];
  recommendedMcps: string[];
  worksWellWith: string[];
  triggers: string[];
  isOrchestrator?: boolean;
  alwaysIncluded?: boolean;
}

export interface MCP {
  id: string;
  name: string;
  icon: string;
  description: string;
  category: string;
  installCommand: string;
  isCore?: boolean;
}

export interface Template {
  id: string;
  name: string;
  icon: string;
  description: string;
  agents: string[];
  mcps: string[];
}

export interface DiscoveryAnswer {
  question: string;
  answer: string;
}

// Agent catalog
export const agents: Agent[] = [
  {
    id: 'planner',
    name: 'Planner',
    icon: 'target',
    shortDescription: 'Orchestrates the entire build',
    fullDescription: 'The brain of VibeShip. Handles discovery, planning, task decomposition, and skill coordination.',
    capabilities: ['Project discovery', 'Requirements gathering', 'Architecture planning', 'Task decomposition', 'Skill orchestration'],
    requiredMcps: ['filesystem'],
    recommendedMcps: [],
    worksWellWith: ['frontend', 'backend', 'database'],
    triggers: ['plan', 'start', 'new', 'idea', 'build'],
    isOrchestrator: true,
    alwaysIncluded: true
  },
  {
    id: 'frontend',
    name: 'Frontend',
    icon: 'palette',
    shortDescription: 'UI and components',
    fullDescription: 'Builds user interfaces with React, Next.js, and Tailwind CSS.',
    capabilities: ['React components', 'Next.js App Router', 'Tailwind CSS styling', 'Responsive design', 'State management'],
    requiredMcps: ['filesystem'],
    recommendedMcps: ['browser-tools'],
    worksWellWith: ['backend', 'testing'],
    triggers: ['ui', 'component', 'page', 'react', 'next', 'tailwind']
  },
  {
    id: 'backend',
    name: 'Backend',
    icon: 'server',
    shortDescription: 'APIs and server logic',
    fullDescription: 'Builds APIs, handles authentication, and manages server-side logic.',
    capabilities: ['REST API design', 'Authentication flows', 'API routes', 'Data validation', 'Error handling'],
    requiredMcps: ['filesystem'],
    recommendedMcps: ['supabase', 'git'],
    worksWellWith: ['frontend', 'database'],
    triggers: ['api', 'endpoint', 'auth', 'server', 'route']
  },
  {
    id: 'database',
    name: 'Database',
    icon: 'database',
    shortDescription: 'Schemas and migrations',
    fullDescription: 'Designs database schemas, writes migrations, and manages data persistence.',
    capabilities: ['Schema design', 'SQL migrations', 'Data relationships', 'Indexing', 'Query optimization'],
    requiredMcps: ['filesystem'],
    recommendedMcps: ['supabase', 'postgres'],
    worksWellWith: ['backend'],
    triggers: ['schema', 'migration', 'sql', 'database']
  },
  {
    id: 'testing',
    name: 'Testing',
    icon: 'check-circle',
    shortDescription: 'Tests and coverage',
    fullDescription: 'Ensures code quality through unit tests, integration tests, and E2E testing.',
    capabilities: ['Unit testing', 'Integration testing', 'E2E testing', 'Coverage analysis', 'Mocking'],
    requiredMcps: ['filesystem'],
    recommendedMcps: ['browser-tools'],
    worksWellWith: ['frontend', 'backend'],
    triggers: ['test', 'spec', 'coverage', 'e2e']
  },
  {
    id: 'devops',
    name: 'DevOps',
    icon: 'cloud',
    shortDescription: 'Deploy and CI/CD',
    fullDescription: 'Handles deployment, CI/CD pipelines, Docker, and infrastructure.',
    capabilities: ['Docker configuration', 'GitHub Actions', 'Vercel deployment', 'Environment config'],
    requiredMcps: ['filesystem', 'git'],
    recommendedMcps: ['vercel'],
    worksWellWith: ['testing'],
    triggers: ['deploy', 'ci', 'docker', 'config']
  },
  {
    id: 'payments',
    name: 'Payments',
    icon: 'credit-card',
    shortDescription: 'Stripe and billing',
    fullDescription: 'Handles payment integrations, subscriptions, and checkout flows.',
    capabilities: ['Stripe integration', 'Subscription management', 'Checkout flows', 'Webhook handling'],
    requiredMcps: ['filesystem'],
    recommendedMcps: ['stripe'],
    worksWellWith: ['backend', 'email'],
    triggers: ['stripe', 'payment', 'checkout', 'subscription']
  },
  {
    id: 'email',
    name: 'Email',
    icon: 'mail',
    shortDescription: 'Transactional email',
    fullDescription: 'Handles transactional emails, templates, and notifications.',
    capabilities: ['Transactional emails', 'Email templates', 'Welcome sequences', 'Notification emails'],
    requiredMcps: ['filesystem'],
    recommendedMcps: ['resend'],
    worksWellWith: ['backend', 'payments'],
    triggers: ['email', 'mail', 'notification']
  },
  {
    id: 'search',
    name: 'Search',
    icon: 'search',
    shortDescription: 'Full-text search',
    fullDescription: 'Implements full-text search, filters, and faceted navigation.',
    capabilities: ['Full-text search', 'Faceted navigation', 'Filters and sorting', 'Search suggestions'],
    requiredMcps: ['filesystem'],
    recommendedMcps: ['algolia'],
    worksWellWith: ['frontend', 'database'],
    triggers: ['search', 'filter', 'facet']
  },
  {
    id: 'ai',
    name: 'AI',
    icon: 'brain',
    shortDescription: 'LLM integration',
    fullDescription: 'Integrates AI capabilities including LLM APIs, embeddings, and chat interfaces.',
    capabilities: ['LLM API integration', 'Embeddings generation', 'Vector search', 'Chat interfaces'],
    requiredMcps: ['filesystem'],
    recommendedMcps: ['anthropic'],
    worksWellWith: ['backend', 'database'],
    triggers: ['ai', 'llm', 'embeddings', 'chat']
  },
  {
    id: 'smart-contracts',
    name: 'Smart Contracts',
    icon: 'link',
    shortDescription: 'Solidity and EVM',
    fullDescription: 'Develops and deploys smart contracts for EVM-compatible blockchains.',
    capabilities: ['Solidity development', 'Contract deployment', 'ERC tokens', 'Security patterns'],
    requiredMcps: ['filesystem', 'git'],
    recommendedMcps: ['foundry'],
    worksWellWith: ['frontend', 'testing'],
    triggers: ['solidity', 'contract', 'token', 'nft', 'web3']
  }
];

// MCP catalog
export const mcps: MCP[] = [
  { id: 'filesystem', name: 'Filesystem', icon: 'folder', description: 'Read/write project files', category: 'core', installCommand: 'Built-in', isCore: true },
  { id: 'git', name: 'Git', icon: 'git-branch', description: 'Version control', category: 'devtools', installCommand: 'npx @anthropic/mcp install git' },
  { id: 'supabase', name: 'Supabase', icon: 'database', description: 'Auth, DB, and storage', category: 'database', installCommand: 'npx @anthropic/mcp install supabase' },
  { id: 'postgres', name: 'PostgreSQL', icon: 'database', description: 'Direct SQL access', category: 'database', installCommand: 'npx @anthropic/mcp install postgres' },
  { id: 'browser-tools', name: 'Browser Tools', icon: 'globe', description: 'Visual testing', category: 'browser', installCommand: 'npx @anthropic/mcp install browser-tools' },
  { id: 'stripe', name: 'Stripe', icon: 'credit-card', description: 'Payment processing', category: 'api', installCommand: 'npx @anthropic/mcp install stripe' },
  { id: 'resend', name: 'Resend', icon: 'mail', description: 'Email sending', category: 'mail', installCommand: 'npx @anthropic/mcp install resend' },
  { id: 'algolia', name: 'Algolia', icon: 'search', description: 'Full-text search', category: 'api', installCommand: 'npx @anthropic/mcp install algolia' },
  { id: 'anthropic', name: 'Anthropic', icon: 'brain', description: 'Claude API access', category: 'ai', installCommand: 'npx @anthropic/mcp install anthropic' },
  { id: 'foundry', name: 'Foundry', icon: 'hammer', description: 'Smart contract toolkit', category: 'devtools', installCommand: 'npx @anthropic/mcp install foundry' },
  { id: 'vercel', name: 'Vercel', icon: 'cloud', description: 'Deployment', category: 'devtools', installCommand: 'npx @anthropic/mcp install vercel' }
];

// Templates
export const templates: Template[] = [
  { id: 'saas', name: 'SaaS Starter', icon: 'shopping-cart', description: 'Subscription products and dashboards', agents: ['planner', 'frontend', 'backend', 'database', 'testing'], mcps: ['filesystem', 'supabase', 'stripe'] },
  { id: 'marketplace', name: 'Marketplace', icon: 'store', description: 'Buy/sell platforms with payments', agents: ['planner', 'frontend', 'backend', 'database', 'payments', 'search'], mcps: ['filesystem', 'supabase', 'stripe', 'algolia'] },
  { id: 'ai-app', name: 'AI App', icon: 'brain', description: 'LLM-powered applications', agents: ['planner', 'frontend', 'backend', 'database', 'ai'], mcps: ['filesystem', 'supabase', 'anthropic'] },
  { id: 'web3', name: 'Web3 dApp', icon: 'link', description: 'Blockchain applications', agents: ['planner', 'frontend', 'smart-contracts', 'testing'], mcps: ['filesystem', 'git', 'foundry'] },
  { id: 'mobile-pwa', name: 'Mobile PWA', icon: 'smartphone', description: 'Progressive web apps', agents: ['planner', 'frontend', 'backend', 'database', 'devops'], mcps: ['filesystem', 'supabase'] },
  { id: 'game', name: 'Game', icon: 'gamepad', description: 'Browser games', agents: ['planner', 'frontend', 'testing'], mcps: ['filesystem', 'browser-tools'] },
  { id: 'tool', name: 'Tool', icon: 'wrench', description: 'CLIs and utilities', agents: ['planner', 'backend', 'testing'], mcps: ['filesystem', 'git'] },
  { id: 'data', name: 'Data Pipeline', icon: 'bar-chart', description: 'Data processing', agents: ['planner', 'backend', 'database', 'testing'], mcps: ['filesystem', 'postgres'] }
];

// Stores
export const projectName = writable<string>('');
export const projectDescription = writable<string>('');
export const selectedTemplate = writable<string | null>(null);
export const selectedAgents = writable<string[]>(['planner']);
export const selectedMcps = writable<string[]>(['filesystem']);
export const discoveryAnswers = writable<DiscoveryAnswer[]>([]);
export const currentStep = writable<number>(1);

// Derived stores
export const selectedAgentObjects = derived(selectedAgents, ($selectedAgents) =>
  agents.filter(a => $selectedAgents.includes(a.id))
);

export const selectedMcpObjects = derived(selectedMcps, ($selectedMcps) =>
  mcps.filter(m => $selectedMcps.includes(m.id))
);

export const requiredMcps = derived(selectedAgentObjects, ($agents) => {
  const required = new Set<string>();
  $agents.forEach(agent => {
    agent.requiredMcps.forEach(mcp => required.add(mcp));
  });
  return Array.from(required);
});

export const recommendedMcps = derived(selectedAgentObjects, ($agents) => {
  const recommended = new Set<string>();
  $agents.forEach(agent => {
    agent.recommendedMcps.forEach(mcp => recommended.add(mcp));
  });
  return Array.from(recommended);
});

// Actions
export function applyTemplate(templateId: string) {
  const template = templates.find(t => t.id === templateId);
  if (template) {
    selectedTemplate.set(templateId);
    selectedAgents.set(template.agents);
    selectedMcps.set(template.mcps);
  }
}

export function addAgent(agentId: string) {
  selectedAgents.update(agents => {
    if (!agents.includes(agentId)) {
      return [...agents, agentId];
    }
    return agents;
  });

  // Auto-add required MCPs
  const agent = agents.find(a => a.id === agentId);
  if (agent) {
    agent.requiredMcps.forEach(mcpId => {
      selectedMcps.update(mcps => {
        if (!mcps.includes(mcpId)) {
          return [...mcps, mcpId];
        }
        return mcps;
      });
    });
  }
}

export function removeAgent(agentId: string) {
  const agent = agents.find(a => a.id === agentId);
  if (agent?.alwaysIncluded) return;

  selectedAgents.update(agents => agents.filter(id => id !== agentId));
}

export function addMcp(mcpId: string) {
  selectedMcps.update(mcps => {
    if (!mcps.includes(mcpId)) {
      return [...mcps, mcpId];
    }
    return mcps;
  });
}

export function removeMcp(mcpId: string) {
  const mcp = mcps.find(m => m.id === mcpId);
  if (mcp?.isCore) return;

  selectedMcps.update(mcps => mcps.filter(id => id !== mcpId));
}

export function resetStack() {
  projectName.set('');
  projectDescription.set('');
  selectedTemplate.set(null);
  selectedAgents.set(['planner']);
  selectedMcps.set(['filesystem']);
  discoveryAnswers.set([]);
  currentStep.set(1);
}
