/**
 * Orchestrator Core
 *
 * Main orchestration logic that routes users to the appropriate path:
 * - Resume: Known project, pick up where they left off
 * - Analyze: Unknown codebase, detect stack and load skills
 * - Brainstorm: New project, help define and plan
 */

import type { Env } from '../types.js';
import {
  buildMindContext,
  synthesizeResumeSummary,
  getStackFromMind,
  getAllBlockers,
  getRecentDecisions,
} from '../mind/index.js';
import type { MindContext } from '../mind/types.js';
import {
  detectContext,
  determineOrchestrationPath,
  createProject,
  isIdeaDescription,
} from './detector.js';
import type {
  SessionInput,
  OrchestrationResult,
  LoadedSkill,
  SharpEdge,
  MissingSkillInfo,
} from './types.js';

/**
 * Extended session input that includes Mind file contents
 */
export interface OrchestrateInput extends SessionInput {
  /** Content of .mind/MEMORY.md if available */
  memoryContent?: string;
  /** Content of .mind/SESSION.md if available */
  sessionContent?: string;
}

/**
 * Main orchestration entry point
 */
export async function orchestrate(
  env: Env,
  input: OrchestrateInput,
  fileList: string[],
  packageJson?: { dependencies?: Record<string, string>; devDependencies?: Record<string, string> }
): Promise<OrchestrationResult> {
  // 1. Detect context
  const detection = await detectContext(
    env,
    input.cwd,
    fileList,
    packageJson,
    { memory: input.memoryContent, session: input.sessionContent }
  );

  // 2. Build Mind context from file contents
  const mindContext = buildMindContext(input.memoryContent, input.sessionContent);

  // 3. Determine path
  const path = determineOrchestrationPath(detection);

  // 4. Route to appropriate handler
  switch (path) {
    case 'resume':
      return handleResume(env, input, detection, mindContext);
    case 'analyze':
      return handleAnalyze(env, input, detection, mindContext);
    case 'brainstorm':
      return handleBrainstorm(env, input, detection, mindContext);
  }
}

/**
 * Handle Resume path - known project, pick up where they left off
 */
async function handleResume(
  env: Env,
  input: OrchestrateInput,
  detection: Awaited<ReturnType<typeof detectContext>>,
  mindContext: MindContext
): Promise<OrchestrationResult> {
  // Get project from D1 (we know it exists because we're on resume path)
  const project = await getProjectFromPath(env, input.cwd);

  // Build resume context
  const resumeSummary = synthesizeResumeSummary(mindContext);
  const blockers = getAllBlockers(mindContext);
  const recentDecisions = getRecentDecisions(mindContext, 3);
  const stack = getStackFromMind(mindContext).length > 0
    ? getStackFromMind(mindContext)
    : detection.detectedStack;

  // Load skills for the stack
  const loadedSkills = await loadSkillsForStack(env, stack);

  // Get sharp edges for the stack
  const sharpEdges = await getSharpEdgesForStack(env, stack);

  // Build greeting
  const greeting = buildResumeGreeting(project, resumeSummary, blockers);

  // Build suggestions
  const suggestions = buildResumeSuggestions(blockers, recentDecisions);

  return {
    path: 'resume',
    greeting,
    loadedSkills,
    sharpEdges,
    project: project ? {
      id: project.id,
      name: project.name,
      path: project.path,
      stack: parseStack(project.stack),
      createdAt: project.created_at,
      lastSessionAt: project.updated_at,
      openIssues: blockers,
    } : undefined,
    mindContext,
    suggestions,
  };
}

/**
 * Handle Analyze path - unknown codebase, detect and load skills
 */
async function handleAnalyze(
  env: Env,
  input: OrchestrateInput,
  detection: Awaited<ReturnType<typeof detectContext>>,
  mindContext: MindContext
): Promise<OrchestrationResult> {
  const stack = detection.detectedStack;

  // Load skills for detected stack
  const loadedSkills = await loadSkillsForStack(env, stack);

  // Get sharp edges for the stack
  const sharpEdges = await getSharpEdgesForStack(env, stack);

  // Identify missing skills that need generation
  const missingDomains = await identifyMissingSkills(env, stack);

  // Build detailed missing skill info for skill generator integration
  const missingSkills = buildMissingSkillInfo(missingDomains, stack);

  // Create project in D1
  const projectName = deriveProjectName(input.cwd);
  const project = await createProject(env, {
    name: projectName,
    path: input.cwd,
    stack: JSON.stringify(stack),
  });

  // Build greeting
  const greeting = buildAnalyzeGreeting(stack, sharpEdges, missingDomains);

  // Build suggestions
  const suggestions = buildAnalyzeSuggestions(stack, missingDomains);

  return {
    path: 'analyze',
    greeting,
    loadedSkills,
    sharpEdges,
    project: {
      id: project.id,
      name: project.name,
      path: project.path,
      stack,
      createdAt: project.created_at,
    },
    mindContext,
    suggestions,
    missingSkills: missingSkills.length > 0 ? missingSkills : undefined,
  };
}

/**
 * Handle Brainstorm path - new project, help define and plan
 */
async function handleBrainstorm(
  _env: Env,
  input: OrchestrateInput,
  _detection: Awaited<ReturnType<typeof detectContext>>,
  mindContext: MindContext
): Promise<OrchestrationResult> {
  // Check if user message indicates an idea
  const hasIdea = isIdeaDescription(input.userMessage || '');

  // Build greeting based on whether they have an idea
  const greeting = buildBrainstormGreeting(hasIdea, input.userMessage);

  // Build suggestions for brainstorm
  const suggestions = buildBrainstormSuggestions(hasIdea);

  return {
    path: 'brainstorm',
    greeting,
    loadedSkills: [],
    sharpEdges: [],
    mindContext,
    suggestions,
  };
}

/**
 * Get project from D1 by path
 */
async function getProjectFromPath(env: Env, path: string): Promise<{
  id: string;
  name: string;
  path: string;
  stack: string;
  created_at: string;
  updated_at: string;
} | null> {
  try {
    const result = await env.DB.prepare(
      'SELECT * FROM projects WHERE path = ? LIMIT 1'
    ).bind(path).first();

    return result as {
      id: string;
      name: string;
      path: string;
      stack: string;
      created_at: string;
      updated_at: string;
    } | null;
  } catch {
    return null;
  }
}

/**
 * Parse stack from JSON string
 */
function parseStack(stack: string): string[] {
  try {
    return JSON.parse(stack);
  } catch {
    return [];
  }
}

/**
 * Load skills for a given stack from KV
 */
async function loadSkillsForStack(env: Env, stack: string[]): Promise<LoadedSkill[]> {
  const skills: LoadedSkill[] = [];

  // Skill mapping from stack items to skill IDs
  const stackToSkillMap: Record<string, string[]> = {
    'nextjs': ['nextjs-app-router'],
    'react': ['react-patterns'],
    'supabase': ['supabase-backend'],
    'tailwind': ['tailwind-ui'],
    'shadcn': ['tailwind-ui'],
    'stripe': ['payments-flow'],
    'nextauth': ['auth-flow'],
    'clerk': ['auth-flow'],
    'openai': ['ai-integration'],
    'anthropic': ['ai-integration'],
    'vercel-ai': ['ai-integration'],
    'wagmi': ['web3-integration'],
    'viem': ['web3-integration'],
    'prisma': ['database-patterns'],
    'drizzle': ['database-patterns'],
  };

  const loadedIds = new Set<string>();

  for (const tech of stack) {
    const skillIds = stackToSkillMap[tech] || [];
    for (const skillId of skillIds) {
      if (loadedIds.has(skillId)) continue;

      try {
        // Try V2 skill first
        const v2Skill = await env.SKILLS.get(`skill:${skillId}`);
        if (v2Skill) {
          const parsed = JSON.parse(v2Skill);
          skills.push({
            id: skillId,
            name: parsed.identity?.name || skillId,
            version: parsed.identity?.version || '1.0.0',
            source: 'catalog',
          });
          loadedIds.add(skillId);
          continue;
        }

        // Try V1 skill
        const v1Skill = await env.SKILLS.get(`v1:skill:${skillId}`);
        if (v1Skill) {
          skills.push({
            id: skillId,
            name: skillId,
            version: '1.0.0',
            source: 'catalog',
          });
          loadedIds.add(skillId);
        }
      } catch {
        // Skill not found, continue
      }
    }
  }

  return skills;
}

/**
 * Get sharp edges for a given stack from KV
 */
async function getSharpEdgesForStack(env: Env, stack: string[]): Promise<SharpEdge[]> {
  const edges: SharpEdge[] = [];

  for (const tech of stack) {
    try {
      const edgesJson = await env.SHARP_EDGES?.get(`edges:${tech}`);
      if (edgesJson) {
        const parsed = JSON.parse(edgesJson);
        edges.push(...parsed.slice(0, 3)); // Max 3 per tech
      }
    } catch {
      // No edges for this tech
    }
  }

  // Limit total edges
  return edges.slice(0, 10);
}

/**
 * Identify skills that need to be generated
 */
async function identifyMissingSkills(env: Env, stack: string[]): Promise<string[]> {
  const missing: string[] = [];

  for (const tech of stack) {
    try {
      // Check if V2 skill exists
      const v2Skill = await env.SKILLS.get(`skill:${tech}`);
      const v1Skill = await env.SKILLS.get(`v1:skill:${tech}`);

      if (!v2Skill && !v1Skill) {
        missing.push(tech);
      }
    } catch {
      missing.push(tech);
    }
  }

  return missing;
}

/**
 * Domain metadata for skill generation
 */
const DOMAIN_METADATA: Record<string, {
  name: string;
  type: 'core' | 'integration' | 'pattern';
  triggers: string[];
}> = {
  // Frameworks
  nextjs: { name: 'Next.js App Router', type: 'core', triggers: ['next.js', 'nextjs', 'app router', 'server components'] },
  react: { name: 'React Patterns', type: 'core', triggers: ['react', 'hooks', 'components', 'useState'] },
  vue: { name: 'Vue.js', type: 'core', triggers: ['vue', 'vuex', 'composition api'] },
  svelte: { name: 'SvelteKit', type: 'core', triggers: ['svelte', 'sveltekit', 'svelte stores'] },
  // Database
  supabase: { name: 'Supabase Backend', type: 'core', triggers: ['supabase', 'postgres', 'row level security'] },
  prisma: { name: 'Prisma ORM', type: 'core', triggers: ['prisma', 'orm', 'database schema'] },
  drizzle: { name: 'Drizzle ORM', type: 'core', triggers: ['drizzle', 'drizzle-orm', 'sql'] },
  mongodb: { name: 'MongoDB', type: 'core', triggers: ['mongodb', 'mongoose', 'nosql'] },
  // Auth
  nextauth: { name: 'NextAuth.js', type: 'integration', triggers: ['nextauth', 'authentication', 'oauth'] },
  clerk: { name: 'Clerk Auth', type: 'integration', triggers: ['clerk', 'user management', 'authentication'] },
  auth0: { name: 'Auth0', type: 'integration', triggers: ['auth0', 'identity', 'sso'] },
  // Payments
  stripe: { name: 'Stripe Payments', type: 'integration', triggers: ['stripe', 'payments', 'subscriptions', 'checkout'] },
  lemonsqueezy: { name: 'LemonSqueezy', type: 'integration', triggers: ['lemonsqueezy', 'payments', 'digital products'] },
  // Styling
  tailwind: { name: 'Tailwind CSS', type: 'core', triggers: ['tailwind', 'utility classes', 'responsive design'] },
  shadcn: { name: 'shadcn/ui', type: 'core', triggers: ['shadcn', 'radix', 'ui components'] },
  // AI
  openai: { name: 'OpenAI Integration', type: 'integration', triggers: ['openai', 'gpt', 'chatgpt', 'embeddings'] },
  anthropic: { name: 'Anthropic Claude', type: 'integration', triggers: ['anthropic', 'claude', 'ai assistant'] },
  'vercel-ai': { name: 'Vercel AI SDK', type: 'integration', triggers: ['vercel ai', 'ai sdk', 'streaming'] },
  // Web3
  wagmi: { name: 'wagmi Web3', type: 'core', triggers: ['wagmi', 'web3', 'wallet connect'] },
  viem: { name: 'viem', type: 'core', triggers: ['viem', 'ethereum', 'contract calls'] },
  ethers: { name: 'ethers.js', type: 'core', triggers: ['ethers', 'web3', 'blockchain'] },
  // Deployment
  cloudflare: { name: 'Cloudflare Workers', type: 'core', triggers: ['cloudflare', 'workers', 'd1', 'kv'] },
  vercel: { name: 'Vercel Deployment', type: 'integration', triggers: ['vercel', 'deployment', 'edge functions'] },
  // Languages
  typescript: { name: 'TypeScript Strict', type: 'core', triggers: ['typescript', 'types', 'strict mode'] },
  python: { name: 'Python', type: 'core', triggers: ['python', 'pip', 'virtualenv'] },
  rust: { name: 'Rust', type: 'core', triggers: ['rust', 'cargo', 'ownership'] },
  go: { name: 'Go', type: 'core', triggers: ['golang', 'go modules', 'goroutines'] },
};

/**
 * Build detailed missing skill info for the skill generator
 */
function buildMissingSkillInfo(missingDomains: string[], stack: string[]): MissingSkillInfo[] {
  return missingDomains.map((domain, index) => {
    const metadata = DOMAIN_METADATA[domain];
    const priority = index < 2 ? 'high' : index < 4 ? 'medium' : 'low';

    if (metadata) {
      return {
        domain,
        suggestedId: `${domain}-skill`,
        suggestedName: metadata.name,
        type: metadata.type,
        suggestedTriggers: metadata.triggers,
        priority,
      };
    }

    // Fallback for unknown domains
    return {
      domain,
      suggestedId: `${domain}-skill`,
      suggestedName: domain.charAt(0).toUpperCase() + domain.slice(1),
      type: 'core' as const,
      suggestedTriggers: [domain],
      priority,
    };
  });
}

/**
 * Derive project name from path
 */
function deriveProjectName(path: string): string {
  const parts = path.replace(/\\/g, '/').split('/').filter(Boolean);
  return parts[parts.length - 1] || 'project';
}

/**
 * Build greeting for resume path
 */
function buildResumeGreeting(
  project: { name: string } | null,
  resumeSummary: string | null,
  blockers: string[]
): string {
  const lines: string[] = [];

  if (project) {
    lines.push(`Picking up **${project.name}**.`);
  } else {
    lines.push('Resuming your project.');
  }

  if (resumeSummary) {
    lines.push('');
    lines.push(resumeSummary);
  }

  if (blockers.length > 0) {
    lines.push('');
    lines.push('**Open issues:**');
    for (const blocker of blockers.slice(0, 3)) {
      lines.push(`- ${blocker}`);
    }
  }

  lines.push('');
  lines.push('Ready to tackle something, or something else?');

  return lines.join('\n');
}

/**
 * Build greeting for analyze path
 */
function buildAnalyzeGreeting(
  stack: string[],
  sharpEdges: SharpEdge[],
  missingSkills: string[]
): string {
  const lines: string[] = [];

  lines.push("I've analyzed your codebase.");
  lines.push('');

  if (stack.length > 0) {
    lines.push(`**Stack:** ${stack.join(', ')}`);
    lines.push('');
    lines.push('Loaded skills for all detected technologies.');
  }

  if (sharpEdges.length > 0) {
    lines.push('');
    lines.push(`**${sharpEdges.length} sharp edges** apply to your setup:`);
    for (const edge of sharpEdges.slice(0, 3)) {
      lines.push(`- ${edge.title}`);
    }
  }

  if (missingSkills.length > 0) {
    lines.push('');
    lines.push(`Skills needed for: ${missingSkills.join(', ')} (will generate on demand)`);
  }

  lines.push('');
  lines.push('What are you working on?');

  return lines.join('\n');
}

/**
 * Build greeting for brainstorm path
 */
function buildBrainstormGreeting(hasIdea: boolean, userMessage?: string): string {
  if (hasIdea && userMessage) {
    return `Got it - let me help you build that.\n\nBefore we start, I have a few questions to make sure we build the right thing.`;
  }

  return `No existing codebase detected.\n\nAre you starting a new project? Tell me what you want to build, and I'll help you plan it out.`;
}

/**
 * Build suggestions for resume path
 */
function buildResumeSuggestions(blockers: string[], _decisions: ReturnType<typeof getRecentDecisions>): string[] {
  const suggestions: string[] = [];

  if (blockers.length > 0) {
    suggestions.push(`Tackle the blocker: "${blockers[0]}"`);
  }

  suggestions.push('Continue where you left off');
  suggestions.push('Start something new');

  return suggestions;
}

/**
 * Build suggestions for analyze path
 */
function buildAnalyzeSuggestions(stack: string[], missingSkills: string[]): string[] {
  const suggestions: string[] = [];

  suggestions.push('Add a new feature');
  suggestions.push('Fix a bug');

  if (missingSkills.length > 0) {
    suggestions.push(`Generate skills for: ${missingSkills[0]}`);
  }

  suggestions.push('Ask about the codebase');

  return suggestions;
}

/**
 * Build suggestions for brainstorm path
 */
function buildBrainstormSuggestions(hasIdea: boolean): string[] {
  if (hasIdea) {
    return [
      'Answer the questions to refine the idea',
      'Skip to stack recommendations',
      'Show me similar projects',
    ];
  }

  return [
    'Describe your idea',
    'Browse project templates',
    'Get inspiration from examples',
  ];
}
