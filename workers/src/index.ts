/**
 * vibeship-spawner MCP Worker
 *
 * Remote MCP server running on Cloudflare Workers.
 * Implements SSE transport for Claude Desktop's mcp-remote proxy.
 *
 * "Claude on Nitro" - Smarter Discovery, Specialized Agents, Guardrails
 *
 * Note: This server returns project scaffolding as content (not files),
 * since remote servers can't write to the user's filesystem directly.
 * Users use the CLI (`npx vibeship-spawner create`) for actual file creation.
 */

interface Env {
  ENVIRONMENT: string;
}

// Skill levels for user assessment
type SkillLevel = 'vibe-coder' | 'builder' | 'developer' | 'expert';

// Discovery stages following the Usefulness Framework
type DiscoveryStage = 'intro' | 'who' | 'problem' | 'edge' | 'minimum' | 'complete' | 'skill-assessment';

// Discovery session state
interface DiscoverySession {
  stage: DiscoveryStage;
  skillLevel?: SkillLevel;
  responses: {
    who?: string;        // WHO has this problem?
    problem?: string;    // WHAT's broken about current solutions?
    edge?: string;       // WHY would they switch to yours?
    minimum?: string;    // WHAT's the minimum to prove that value?
  };
  projectType?: string;
  isCreative?: boolean;  // Skip usefulness for creative/fun projects
}

// Specialist definitions - flat structure with tags
interface Specialist {
  name: string;
  tags: string[];
  description: string;
  requiredFor: string[];
}

// All available specialists - flat structure with tags
const SPECIALISTS: Record<string, Specialist> = {
  'nextjs-app-router': {
    name: 'Next.js App Router',
    tags: ['nextjs', 'routing', 'rsc', 'app-router', 'layouts', 'loading-states'],
    description: 'App Router patterns, server/client components, routing',
    requiredFor: ['saas', 'marketplace', 'ai-app', 'web-app']
  },
  'supabase-backend': {
    name: 'Supabase Backend',
    tags: ['supabase', 'database', 'auth', 'rls', 'edge-functions', 'realtime', 'postgres'],
    description: 'Auth, RLS, Edge Functions, Realtime',
    requiredFor: ['saas', 'marketplace', 'ai-app']
  },
  'tailwind-ui': {
    name: 'Tailwind UI',
    tags: ['tailwind', 'css', 'styling', 'responsive', 'dark-mode', 'components', 'ui'],
    description: 'Component patterns, responsive design, dark mode',
    requiredFor: ['saas', 'marketplace', 'ai-app', 'web-app', 'web3']
  },
  'typescript-strict': {
    name: 'TypeScript Strict',
    tags: ['typescript', 'types', 'generics', 'validation', 'zod', 'type-guards'],
    description: 'Types, generics, inference, strict mode',
    requiredFor: ['saas', 'marketplace', 'ai-app', 'tool']
  },
  'react-patterns': {
    name: 'React Patterns',
    tags: ['react', 'hooks', 'state', 'performance', 'memoization', 'context'],
    description: 'Hooks, state management, performance optimization',
    requiredFor: ['saas', 'marketplace', 'ai-app', 'web-app']
  },
  'nextjs-supabase-auth': {
    name: 'Next.js + Supabase Auth',
    tags: ['nextjs', 'supabase', 'auth', 'ssr-auth', 'middleware', 'session', 'protected-routes'],
    description: 'Full auth flow across both systems',
    requiredFor: ['saas', 'marketplace', 'ai-app']
  },
  'server-client-boundary': {
    name: 'Server/Client Boundary',
    tags: ['nextjs', 'rsc', 'hydration', 'use-client', 'data-fetching', 'server-components'],
    description: 'What runs where, hydration, "use client"',
    requiredFor: ['saas', 'marketplace', 'ai-app', 'web-app']
  },
  'api-design': {
    name: 'API Design',
    tags: ['api', 'rest', 'validation', 'error-handling', 'versioning', 'endpoints'],
    description: 'REST patterns, error handling, validation',
    requiredFor: ['saas', 'marketplace', 'ai-app', 'tool']
  },
  'state-sync': {
    name: 'State Sync',
    tags: ['state', 'sync', 'optimistic-updates', 'cache', 'realtime', 'invalidation'],
    description: 'Client/server state coordination',
    requiredFor: ['marketplace', 'ai-app']
  },
  'crud-builder': {
    name: 'CRUD Builder',
    tags: ['crud', 'forms', 'validation', 'list-views', 'tables', 'data-management'],
    description: 'Generate full CRUD with proper patterns',
    requiredFor: ['saas', 'marketplace', 'tool']
  },
  'realtime-sync': {
    name: 'Realtime Sync',
    tags: ['realtime', 'websockets', 'subscriptions', 'presence', 'live-updates'],
    description: 'WebSockets, optimistic updates, conflict resolution',
    requiredFor: ['marketplace', 'ai-app']
  },
  'file-upload': {
    name: 'File Upload',
    tags: ['upload', 'storage', 'files', 'images', 'presigned-urls', 's3'],
    description: 'Client → storage → DB reference flow',
    requiredFor: ['saas', 'marketplace']
  },
  'payments-flow': {
    name: 'Payments Flow',
    tags: ['payments', 'stripe', 'checkout', 'webhooks', 'subscriptions', 'billing'],
    description: 'Stripe checkout, webhooks, subscription management',
    requiredFor: ['saas', 'marketplace']
  },
  'auth-flow': {
    name: 'Auth Flow',
    tags: ['auth', 'login', 'signup', 'password-reset', 'oauth', 'session'],
    description: 'Login, signup, password reset, sessions',
    requiredFor: ['saas', 'marketplace', 'ai-app']
  },
  'ai-integration': {
    name: 'AI Integration',
    tags: ['ai', 'llm', 'streaming', 'prompts', 'embeddings', 'openai', 'anthropic'],
    description: 'LLM APIs, streaming, prompt management',
    requiredFor: ['ai-app']
  },
  'brand-identity': {
    name: 'Brand Identity',
    tags: ['brand', 'colors', 'typography', 'voice', 'visual-identity', 'design-system'],
    description: 'Colors, typography, voice & tone',
    requiredFor: []
  },
  'ux-research': {
    name: 'UX Research',
    tags: ['ux', 'user-flows', 'wireframes', 'navigation', 'accessibility', 'usability'],
    description: 'User flows, information architecture',
    requiredFor: []
  },
  'security-audit': {
    name: 'Security Audit',
    tags: ['security', 'audit', 'vulnerabilities', 'owasp', 'hardening', 'pen-testing'],
    description: 'Vulnerability checks, best practices',
    requiredFor: []
  },
  'copywriting': {
    name: 'Copywriting',
    tags: ['copy', 'landing-pages', 'onboarding', 'microcopy', 'cta', 'content'],
    description: 'Landing pages, onboarding, microcopy',
    requiredFor: []
  }
};

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
    name: 'get_started',
    description: 'ALWAYS CALL THIS FIRST when user mentions vibeship-spawner or wants to create/work on a project. Detects whether this is a new project (needs discovery) or existing codebase (needs analysis). Returns the right next step.',
    inputSchema: {
      type: 'object',
      properties: {
        has_existing_codebase: {
          type: 'boolean',
          description: 'True if user has an existing project/codebase they want help with'
        },
        codebase_summary: {
          type: 'string',
          description: 'If existing codebase: brief description of what you found (tech stack, main files, etc.)'
        },
        idea: {
          type: 'string',
          description: 'If new project: the user\'s project idea or description'
        }
      },
      required: []
    }
  },
  {
    name: 'start_discovery',
    description: 'Begin discovery for a NEW project idea. Guides through WHO/PROBLEM/EDGE/MINIMUM framework. Use when get_started indicates new project.',
    inputSchema: {
      type: 'object',
      properties: {
        idea: {
          type: 'string',
          description: 'The user\'s initial project idea or description'
        },
        is_creative: {
          type: 'boolean',
          description: 'Set to true if this is a creative/fun project (skips usefulness questions)'
        }
      },
      required: ['idea']
    }
  },
  {
    name: 'continue_discovery',
    description: 'Continue the discovery process with user\'s response. Progresses through WHO -> PROBLEM -> EDGE -> MINIMUM stages. Use after start_discovery.',
    inputSchema: {
      type: 'object',
      properties: {
        stage: {
          type: 'string',
          enum: ['who', 'problem', 'edge', 'minimum'],
          description: 'Current stage of discovery'
        },
        response: {
          type: 'string',
          description: 'User\'s response to the previous question'
        },
        session: {
          type: 'object',
          description: 'Current discovery session state'
        }
      },
      required: ['stage', 'response']
    }
  },
  {
    name: 'assess_skill_level',
    description: 'Assess user skill level. Called after discovery is complete (user answered WHO/PROBLEM/EDGE/MINIMUM or chose creative project).',
    inputSchema: {
      type: 'object',
      properties: {
        choice: {
          type: 'string',
          enum: ['handle-tech', 'learn-as-build', 'move-fast'],
          description: 'User\'s self-selected approach: "handle-tech" (vibe-coder), "learn-as-build" (builder), "move-fast" (developer/expert)'
        },
        context_clues: {
          type: 'array',
          items: { type: 'string' },
          description: 'Optional: technical terms or patterns noticed in user\'s messages'
        }
      },
      required: ['choice']
    }
  },
  {
    name: 'recommend_squad',
    description: 'Recommend specialists AFTER discovery and skill assessment are complete. Requires project_type which should be determined from discovery answers.',
    inputSchema: {
      type: 'object',
      properties: {
        project_type: {
          type: 'string',
          enum: ['saas', 'marketplace', 'ai-app', 'web3', 'tool', 'web-app', 'custom'],
          description: 'Type of project being built'
        },
        features: {
          type: 'array',
          items: { type: 'string' },
          description: 'Key features needed (e.g., "auth", "payments", "realtime", "file-upload")'
        },
        skill_level: {
          type: 'string',
          enum: ['vibe-coder', 'builder', 'developer', 'expert'],
          description: 'User\'s skill level (affects specialist recommendations)'
        }
      },
      required: ['project_type']
    }
  },
  {
    name: 'create_project',
    description: 'FINAL STEP - Create project scaffolding AFTER completing: 1) start_discovery, 2) continue_discovery (all stages), 3) assess_skill_level, 4) recommend_squad. Do NOT call this first.',
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
        },
        skill_level: {
          type: 'string',
          enum: ['vibe-coder', 'builder', 'developer', 'expert'],
          description: 'User skill level (affects guidance level)'
        },
        discovery_session: {
          type: 'object',
          description: 'Completed discovery session with usefulness insights'
        }
      }
    }
  },
  {
    name: 'check_environment',
    description: 'Check MCP server status. Use for debugging or when user asks about vibeship-spawner capabilities.',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'list_templates',
    description: 'List available templates. Only use if user specifically asks "what templates are available" - do NOT use this when starting a new project (use start_discovery instead).',
    inputSchema: {
      type: 'object',
      properties: {}
    }
  },
  {
    name: 'list_specialists',
    description: 'List all specialists. Only use if user asks about specialists specifically - do NOT use when starting a new project.',
    inputSchema: {
      type: 'object',
      properties: {
        tag: {
          type: 'string',
          description: 'Filter by tag (optional, e.g., "auth", "payments", "ai")'
        },
        project_type: {
          type: 'string',
          description: 'Filter specialists relevant to a project type (optional)'
        }
      }
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
          version: '2.0.0'
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
    case 'get_started':
      return getStarted(args);
    case 'start_discovery':
      return startDiscovery(args);
    case 'continue_discovery':
      return continueDiscovery(args);
    case 'assess_skill_level':
      return assessSkillLevel(args);
    case 'recommend_squad':
      return recommendSquad(args);
    case 'create_project':
      return createProject(args);
    case 'check_environment':
      return checkEnvironment();
    case 'list_templates':
      return listTemplates();
    case 'list_specialists':
      return listSpecialists(args);
    default:
      throw { code: -32602, message: `Unknown tool: ${name}` };
  }
}

// ============================================================================
// GET STARTED - Smart routing between new project and existing codebase
// ============================================================================

/**
 * Smart entry point that detects whether user has:
 * - New project idea → Routes to discovery flow
 * - Existing codebase → Analyzes and recommends specialists directly
 */
function getStarted(args: Record<string, unknown>): unknown {
  const { has_existing_codebase, codebase_summary, idea } = args as {
    has_existing_codebase?: boolean;
    codebase_summary?: string;
    idea?: string;
  };

  // CASE 1: Existing codebase - analyze and recommend specialists
  if (has_existing_codebase && codebase_summary) {
    // Detect tech stack and features from the summary
    const detectedTags = detectTagsFromCodebase(codebase_summary);
    const detectedProjectType = detectProjectType(codebase_summary);

    return {
      content: [{
        type: 'text',
        text: `
# Existing Codebase Detected

I've analyzed your project. Here's what I found:

**Detected Stack:** ${detectedTags.slice(0, 6).join(', ') || 'Could not detect'}
**Project Type:** ${detectedProjectType}

---

## Recommended Next Steps

Based on your codebase, I recommend loading these specialists:

${getTopSpecialistsForTags(detectedTags).map(s => `- **${s.name}**: ${s.description}`).join('\n')}

---

**Quick question - which sounds more like you?**

A) "I have the idea, you handle the tech stuff"
B) "I know some coding, want to learn as we build"
C) "I'm technical, let's move fast"

Once you pick, I'll tailor my guidance and we can start working on your project.

---

*Analysis:*
\`\`\`json
${JSON.stringify({
  mode: 'existing-codebase',
  detectedTags,
  detectedProjectType,
  nextStep: 'assess_skill_level'
}, null, 2)}
\`\`\`
`
      }]
    };
  }

  // CASE 2: New project with idea - route to discovery
  if (idea) {
    return {
      content: [{
        type: 'text',
        text: `
# New Project: "${idea}"

Great! Before we dive into tech decisions, let's make sure we build something people actually want.

---

**Is this a serious project or just for fun?**

1. **Serious** - I want to build something useful (I'll ask a few questions first)
2. **Creative/Fun** - Just vibing, skip the business questions

---

*Next step: Call \`start_discovery\` with the idea and is_creative flag based on user's answer*
`
      }]
    };
  }

  // CASE 3: No context - ask what they want to do
  return {
    content: [{
      type: 'text',
      text: `
# Welcome to vibeship-spawner! 🚀

"You vibe. It ships."

---

**What would you like to do?**

1. **Start a new project** - I'll help you discover what to build and set up the right stack
2. **Work on existing code** - I'll analyze your codebase and recommend the right specialists

---

*Tip: If you have an existing project, share the folder path or describe the tech stack, and I'll analyze it.*
`
    }]
  };
}

/**
 * Detect relevant tags from a codebase description
 */
function detectTagsFromCodebase(summary: string): string[] {
  const summaryLower = summary.toLowerCase();
  const detected: string[] = [];

  const tagPatterns: Record<string, string[]> = {
    'nextjs': ['next.js', 'nextjs', 'next js', 'app router', 'pages router'],
    'react': ['react', 'jsx', 'tsx', 'component'],
    'typescript': ['typescript', '.ts', '.tsx', 'tsconfig'],
    'supabase': ['supabase', '@supabase'],
    'tailwind': ['tailwind', 'tailwindcss'],
    'auth': ['auth', 'login', 'signup', 'authentication', 'session'],
    'payments': ['stripe', 'payment', 'checkout', 'billing'],
    'ai': ['openai', 'anthropic', 'llm', 'gpt', 'claude', 'ai'],
    'database': ['prisma', 'drizzle', 'postgres', 'mysql', 'mongodb', 'database'],
    'api': ['api', 'rest', 'endpoint', 'route handler'],
    'realtime': ['realtime', 'websocket', 'socket.io', 'pusher'],
    'forms': ['form', 'react-hook-form', 'formik', 'zod'],
    'ui': ['shadcn', 'radix', 'headless ui', 'component library'],
    'testing': ['jest', 'vitest', 'cypress', 'playwright', 'test']
  };

  for (const [tag, patterns] of Object.entries(tagPatterns)) {
    if (patterns.some(p => summaryLower.includes(p))) {
      detected.push(tag);
    }
  }

  return detected;
}

/**
 * Detect project type from codebase description
 */
function detectProjectType(summary: string): string {
  const summaryLower = summary.toLowerCase();

  if (summaryLower.includes('marketplace') || summaryLower.includes('e-commerce') || summaryLower.includes('shop')) {
    return 'marketplace';
  }
  if (summaryLower.includes('saas') || summaryLower.includes('subscription') || summaryLower.includes('dashboard')) {
    return 'saas';
  }
  if (summaryLower.includes('ai') || summaryLower.includes('llm') || summaryLower.includes('chat') || summaryLower.includes('gpt')) {
    return 'ai-app';
  }
  if (summaryLower.includes('web3') || summaryLower.includes('blockchain') || summaryLower.includes('smart contract')) {
    return 'web3';
  }
  if (summaryLower.includes('cli') || summaryLower.includes('tool') || summaryLower.includes('utility')) {
    return 'tool';
  }

  return 'web-app';
}

/**
 * Get top specialists matching detected tags
 */
function getTopSpecialistsForTags(tags: string[]): Specialist[] {
  const matches: Array<{ specialist: Specialist; score: number }> = [];

  for (const specialist of Object.values(SPECIALISTS)) {
    const score = specialist.tags.filter(t =>
      tags.some(detected => t.includes(detected) || detected.includes(t))
    ).length;

    if (score > 0) {
      matches.push({ specialist, score });
    }
  }

  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(m => m.specialist);
}

// ============================================================================
// DISCOVERY FLOW - Usefulness Framework Implementation
// ============================================================================

/**
 * Start the discovery process for a new project
 * Uses the Usefulness Framework: WHO -> PROBLEM -> EDGE -> MINIMUM
 */
function startDiscovery(args: Record<string, unknown>): unknown {
  const { idea, is_creative } = args as { idea: string; is_creative?: boolean };

  // For creative/fun projects, skip the usefulness questions
  if (is_creative) {
    return {
      content: [{
        type: 'text',
        text: `
# Let's Build Something Fun! 🎨

I love it: "${idea}"

Since this is a creative project, let's skip the business questions and dive straight into building.

**Quick question before we start - which sounds more like you?**

A) "I have the idea, you handle the tech stuff"
B) "I know some coding, want to learn as we build"
C) "I'm technical, let's move fast"

Pick one and I'll tailor my approach accordingly.

---

*Session State:*
\`\`\`json
${JSON.stringify({
  stage: 'skill-assessment',
  isCreative: true,
  idea: idea,
  responses: {}
} as DiscoverySession, null, 2)}
\`\`\`
`
      }]
    };
  }

  // Start with the WHO question - but first, a gentle check
  return {
    content: [{
      type: 'text',
      text: `
# Let's Make Something Useful

"${idea}" - interesting!

Before we dive into the tech, let me ask a few questions to make sure we build something people actually want.

**Who specifically has this problem?**

Not "everyone" or "people who..." - think of ONE real person you know (or could describe in detail) who would use this.

Example: "My friend Sarah who runs a small bakery and spends 3 hours every Sunday manually calculating ingredient orders"

---

*Discovery Progress: WHO → problem → edge → minimum*

*Session State:*
\`\`\`json
${JSON.stringify({
  stage: 'who',
  isCreative: false,
  idea: idea,
  responses: {}
} as DiscoverySession, null, 2)}
\`\`\`
`
    }]
  };
}

/**
 * Continue the discovery process with user's response
 */
function continueDiscovery(args: Record<string, unknown>): unknown {
  const { stage, response, session } = args as {
    stage: DiscoveryStage;
    response: string;
    session?: DiscoverySession;
  };

  const currentSession: DiscoverySession = session || {
    stage: 'who',
    responses: {},
    isCreative: false
  };

  // Update session with response
  currentSession.responses[stage as keyof typeof currentSession.responses] = response;

  // Progress to next stage
  switch (stage) {
    case 'who':
      currentSession.stage = 'problem';
      return {
        content: [{
          type: 'text',
          text: `
Got it: "${response}"

**What's broken about how they handle this today?**

What's the pain they feel? The time they waste? The frustration that makes them say "there has to be a better way"?

---

*Discovery Progress: ✓ who → PROBLEM → edge → minimum*

*Session State:*
\`\`\`json
${JSON.stringify(currentSession, null, 2)}
\`\`\`
`
        }]
      };

    case 'problem':
      currentSession.stage = 'edge';
      return {
        content: [{
          type: 'text',
          text: `
The pain point: "${response}"

**Why would they switch to YOUR solution?**

There are probably other tools out there. What's the ONE thing you'll do better that makes switching worth it?

Think about it this way: "Unlike [existing solutions], mine will..."

---

*Discovery Progress: ✓ who → ✓ problem → EDGE → minimum*

*Session State:*
\`\`\`json
${JSON.stringify(currentSession, null, 2)}
\`\`\`
`
        }]
      };

    case 'edge':
      currentSession.stage = 'minimum';
      return {
        content: [{
          type: 'text',
          text: `
Your edge: "${response}"

**What's the absolute minimum to prove that value?**

If you could only ship ONE feature that proves your edge, what is it?

Not a "minimum viable product" with 10 features - the ONE thing that, if it works, proves your idea has legs.

---

*Discovery Progress: ✓ who → ✓ problem → ✓ edge → MINIMUM*

*Session State:*
\`\`\`json
${JSON.stringify(currentSession, null, 2)}
\`\`\`
`
        }]
      };

    case 'minimum':
      currentSession.stage = 'complete';
      return {
        content: [{
          type: 'text',
          text: `
# Discovery Complete ✓

Here's what we uncovered:

| Question | Your Answer |
|----------|-------------|
| **WHO** has this problem? | ${currentSession.responses.who} |
| **WHAT's** broken today? | ${currentSession.responses.problem} |
| **WHY** switch to yours? | ${currentSession.responses.edge} |
| **MINIMUM** to prove it? | ${response} |

---

## The Unlock Test

Imagine this is live and someone tweets about it:

> "Just found [your product] - finally something that ${currentSession.responses.edge?.toLowerCase()}. Been looking for this forever."

Does that sound like something they'd actually say? If yes, we're on the right track.

---

**Quick question before we start building - which sounds more like you?**

A) "I have the idea, you handle the tech stuff"
B) "I know some coding, want to learn as we build"
C) "I'm technical, let's move fast"

---

*Session State:*
\`\`\`json
${JSON.stringify({ ...currentSession, responses: { ...currentSession.responses, minimum: response } }, null, 2)}
\`\`\`
`
        }]
      };

    default:
      return {
        content: [{
          type: 'text',
          text: `Discovery stage "${stage}" not recognized. Please start a new discovery session.`
        }],
        isError: true
      };
  }
}

/**
 * Assess user skill level without interrogation
 */
function assessSkillLevel(args: Record<string, unknown>): unknown {
  const { choice, context_clues } = args as {
    choice: 'handle-tech' | 'learn-as-build' | 'move-fast';
    context_clues?: string[];
  };

  let skillLevel: SkillLevel;
  let guidance: string;
  let approach: string;

  switch (choice) {
    case 'handle-tech':
      skillLevel = 'vibe-coder';
      guidance = 'maximum';
      approach = `
**Got it - I'll handle the tech, you focus on the vision.**

Here's how we'll work:
- I'll explain key decisions in plain English
- I'll make all technical choices (you can always ask "why")
- I'll tell you what to run, you tell me if it works
- We'll build in small steps so you can see progress

You don't need to understand HOW it works - just WHAT it does.
`;
      break;

    case 'learn-as-build':
      skillLevel = 'builder';
      guidance = 'moderate';
      approach = `
**Perfect - we'll build AND learn together.**

Here's how we'll work:
- I'll explain the "why" behind important decisions
- You make some choices, I'll guide when needed
- I'll point out patterns you can reuse later
- Feel free to ask "what does this do?" anytime

By the end, you'll understand not just WHAT we built, but HOW it works.
`;
      break;

    case 'move-fast':
      // Check context clues to distinguish developer from expert
      const expertSignals = ['architecture', 'rsc', 'hydration', 'rls', 'edge functions', 'webhooks'];
      const hasExpertClues = context_clues?.some(clue =>
        expertSignals.some(signal => clue.toLowerCase().includes(signal))
      );

      if (hasExpertClues) {
        skillLevel = 'expert';
        guidance = 'minimal';
        approach = `
**Expert mode - let's ship fast.**

Here's how we'll work:
- Minimal explanation, maximum output
- I'll offer options, you decide
- I'll challenge questionable decisions
- Tell me what you want, I'll make it happen

Let's build.
`;
      } else {
        skillLevel = 'developer';
        guidance = 'low';
        approach = `
**Developer mode - efficient and focused.**

Here's how we'll work:
- Skip the basics, focus on the interesting parts
- I'll offer options with tradeoffs
- You make the calls, I'll execute
- Ask if you want more detail on anything

Ready when you are.
`;
      }
      break;

    default:
      skillLevel = 'builder';
      guidance = 'moderate';
      approach = 'I\'ll adapt as we go.';
  }

  return {
    content: [{
      type: 'text',
      text: `
${approach}

---

*Skill Assessment:*
\`\`\`json
${JSON.stringify({
  skillLevel,
  guidanceLevel: guidance,
  contextClues: context_clues || []
}, null, 2)}
\`\`\`
`
    }]
  };
}

/**
 * Recommend a squad of specialists based on project requirements
 * Uses tag-based matching for flat specialist structure
 */
function recommendSquad(args: Record<string, unknown>): unknown {
  const { project_type, features, skill_level } = args as {
    project_type: string;
    features?: string[];
    skill_level?: SkillLevel;
  };

  // Find specialists for this project type using tag matching
  const recommended: string[] = [];
  const onDemand: string[] = [];

  // Feature-to-tag mapping for better matching
  const featureTagMap: Record<string, string[]> = {
    'auth': ['auth', 'login', 'signup', 'session', 'oauth'],
    'payments': ['payments', 'stripe', 'checkout', 'billing', 'subscriptions'],
    'realtime': ['realtime', 'websockets', 'subscriptions', 'live-updates'],
    'file-upload': ['upload', 'storage', 'files', 'images', 's3'],
    'ai': ['ai', 'llm', 'streaming', 'prompts', 'embeddings', 'openai', 'anthropic'],
    'database': ['database', 'supabase', 'postgres', 'rls'],
    'api': ['api', 'rest', 'endpoints', 'validation'],
    'forms': ['forms', 'crud', 'validation', 'data-management'],
    'ui': ['ui', 'components', 'tailwind', 'styling', 'responsive'],
    'ux': ['ux', 'user-flows', 'wireframes', 'accessibility'],
    'security': ['security', 'audit', 'vulnerabilities', 'owasp'],
    'branding': ['brand', 'colors', 'typography', 'design-system'],
    'copy': ['copy', 'landing-pages', 'microcopy', 'content']
  };

  // Expand features to tags
  const expandedTags = new Set<string>();
  features?.forEach(feature => {
    const featureLower = feature.toLowerCase();
    // Add the feature itself
    expandedTags.add(featureLower);
    // Add mapped tags if available
    const mappedTags = featureTagMap[featureLower];
    if (mappedTags) {
      mappedTags.forEach(t => expandedTags.add(t));
    }
  });

  for (const [id, specialist] of Object.entries(SPECIALISTS)) {
    const isRequiredForProject = specialist.requiredFor.includes(project_type);
    const matchesFeature = specialist.tags.some(tag => expandedTags.has(tag));

    if (isRequiredForProject || matchesFeature) {
      recommended.push(id);
    } else if (specialist.requiredFor.length === 0) {
      // On-demand specialists (no requiredFor = available when needed)
      onDemand.push(id);
    }
  }

  // Build the recommendation
  const formatSpecialist = (id: string) => {
    const s = SPECIALISTS[id];
    return `- **${s.name}**: ${s.description}\n  Tags: \`${s.tags.slice(0, 4).join('`, `')}\``;
  };

  const guidanceNote = skill_level === 'vibe-coder'
    ? '\n> Don\'t worry about understanding all these - I\'ll load the right one for each task automatically.\n'
    : skill_level === 'expert'
    ? '\n> These are the specialists I\'ll pull from. Override any if you have preferences.\n'
    : '';

  return {
    content: [{
      type: 'text',
      text: `
# Recommended Squad for ${project_type.toUpperCase()}

${guidanceNote}

## Recommended Specialists
*Matched to your project type and features*

${recommended.length > 0 ? recommended.map(formatSpecialist).join('\n\n') : '- None matched'}

${onDemand.length > 0 ? `
## On-Demand Specialists
*Available when needed*

${onDemand.map(formatSpecialist).join('\n\n')}
` : ''}

---

*Squad Configuration:*
\`\`\`json
${JSON.stringify({
  projectType: project_type,
  features: features || [],
  expandedTags: Array.from(expandedTags),
  skillLevel: skill_level,
  squad: {
    recommended,
    onDemand
  }
}, null, 2)}
\`\`\`
`
    }]
  };
}

/**
 * List all available specialists with their tags
 */
function listSpecialists(args: Record<string, unknown>): unknown {
  const { tag, project_type } = args as { tag?: string; project_type?: string };

  let filtered = Object.entries(SPECIALISTS);

  // Filter by tag if provided
  if (tag) {
    const tagLower = tag.toLowerCase();
    filtered = filtered.filter(([_, s]) =>
      s.tags.some(t => t.includes(tagLower) || tagLower.includes(t))
    );
  }

  // Filter by project type if provided
  if (project_type) {
    filtered = filtered.filter(([_, s]) =>
      s.requiredFor.includes(project_type) || s.requiredFor.length === 0
    );
  }

  const specialists = filtered.map(([id, s]) => ({
    id,
    name: s.name,
    description: s.description,
    tags: s.tags,
    requiredFor: s.requiredFor
  }));

  return {
    content: [{
      type: 'text',
      text: JSON.stringify({ specialists, total: specialists.length }, null, 2)
    }]
  };
}

// ============================================================================
// PROJECT CREATION
// ============================================================================

// Create project - returns content instead of writing files
async function createProject(args: Record<string, unknown>): Promise<unknown> {
  const { gist_id, template, project_name, skill_level, discovery_session } = args as {
    gist_id?: string;
    template?: string;
    project_name?: string;
    skill_level?: SkillLevel;
    discovery_session?: DiscoverySession;
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
      project_name: (gistConfig.project_name as string) || 'my-project',
      agents: (gistConfig.agents as string[]) || ['planner'],
      mcps: (gistConfig.mcps as string[]) || ['filesystem'],
      behaviors: (gistConfig.behaviors as { mandatory: string[]; selected: string[] }) || {
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
  const specialistCount = Object.keys(SPECIALISTS).length;

  // Collect all unique tags
  const allTags = new Set<string>();
  Object.values(SPECIALISTS).forEach(s => s.tags.forEach(t => allTags.add(t)));

  return {
    content: [{
      type: 'text',
      text: `
vibeship-spawner MCP (Remote)
"Claude on Nitro" - Smarter Discovery, Specialized Agents, Guardrails

Status: Connected
Transport: SSE (Cloudflare Workers)
Version: 2.0.0

## Discovery Tools
- start_discovery: Begin usefulness framework conversation
- continue_discovery: Progress through WHO → PROBLEM → EDGE → MINIMUM
- assess_skill_level: Detect user skill level without interrogation
- recommend_squad: Suggest specialists based on project needs (tag-matched)

## Specialists Available: ${specialistCount}
Total unique tags: ${allTags.size}

Common tags: auth, payments, ai, realtime, database, api, ui, forms

## Templates
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
        version: '2.0.0',
        features: ['discovery', 'skill-assessment', 'specialist-squads', 'guardrails']
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
