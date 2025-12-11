/**
 * spawner_analyze Tool
 *
 * Analyzes existing codebase to detect stack, patterns, and recommend
 * relevant skills. Use when user has existing code or wants to add
 * features to a project.
 */

import { z } from 'zod';
import type { Env } from '../types';

/**
 * Stack detection patterns
 */
const STACK_PATTERNS = {
  // Frameworks
  'nextjs': {
    files: ['next.config.js', 'next.config.mjs', 'next.config.ts'],
    patterns: [/from ['"]next/i, /import.*next\//, /@next\//],
    category: 'framework',
  },
  'react': {
    files: [],
    patterns: [/from ['"]react['"]/, /import React/, /useState|useEffect|useContext/],
    category: 'framework',
  },
  'vue': {
    files: ['vue.config.js', 'nuxt.config.js', 'nuxt.config.ts'],
    patterns: [/from ['"]vue['"]/, /<template>/, /defineComponent/],
    category: 'framework',
  },
  'svelte': {
    files: ['svelte.config.js'],
    patterns: [/from ['"]svelte['"]/, /<script.*lang=['"]ts['"]/],
    category: 'framework',
  },

  // Backend/Database
  'supabase': {
    files: [],
    patterns: [/@supabase\/supabase-js/, /createClient.*supabase/, /supabaseClient/],
    category: 'database',
    skills: ['supabase-backend'],
  },
  'prisma': {
    files: ['prisma/schema.prisma'],
    patterns: [/@prisma\/client/, /PrismaClient/],
    category: 'database',
  },
  'drizzle': {
    files: ['drizzle.config.ts'],
    patterns: [/drizzle-orm/, /drizzle-kit/],
    category: 'database',
  },
  'firebase': {
    files: ['firebase.json', 'firebaseConfig.ts', 'firebaseConfig.js'],
    patterns: [/firebase\/app/, /initializeApp.*firebase/],
    category: 'database',
  },

  // Auth
  'nextauth': {
    files: ['auth.ts', 'auth.js', '[...nextauth].ts'],
    patterns: [/next-auth/, /NextAuth/, /getServerSession/],
    category: 'auth',
    skills: ['auth-flow'],
  },
  'clerk': {
    files: [],
    patterns: [/@clerk\/nextjs/, /ClerkProvider/, /useAuth.*clerk/],
    category: 'auth',
    skills: ['auth-flow'],
  },
  'supabase-auth': {
    files: [],
    patterns: [/supabase\.auth/, /signInWith/, /createClient.*auth/],
    category: 'auth',
    skills: ['auth-flow', 'supabase-backend'],
  },

  // Payments
  'stripe': {
    files: [],
    patterns: [/stripe/, /Stripe\(/, /stripe\.customers/, /stripe\.subscriptions/],
    category: 'payments',
    skills: ['payments-flow'],
  },
  'lemonsqueezy': {
    files: [],
    patterns: [/lemonsqueezy/, /@lemonsqueezy/],
    category: 'payments',
    skills: ['payments-flow'],
  },

  // Styling
  'tailwind': {
    files: ['tailwind.config.js', 'tailwind.config.ts'],
    patterns: [/tailwindcss/, /className=['"].*\b(flex|grid|bg-|text-|p-|m-)/],
    category: 'styling',
    skills: ['tailwind-ui'],
  },
  'shadcn': {
    files: ['components.json'],
    patterns: [/@\/components\/ui/, /from ['"]@radix-ui/],
    category: 'styling',
    skills: ['tailwind-ui'],
  },

  // AI
  'openai': {
    files: [],
    patterns: [/openai/, /OpenAI\(/, /chat\.completions/, /gpt-4|gpt-3\.5/],
    category: 'ai',
    skills: ['ai-integration'],
  },
  'anthropic': {
    files: [],
    patterns: [/@anthropic-ai\/sdk/, /Anthropic\(/, /claude/],
    category: 'ai',
    skills: ['ai-integration'],
  },
  'vercel-ai': {
    files: [],
    patterns: [/ai\/react/, /useChat/, /useCompletion/, /streamText/],
    category: 'ai',
    skills: ['ai-integration'],
  },

  // Web3
  'wagmi': {
    files: [],
    patterns: [/wagmi/, /useAccount/, /useConnect/, /WagmiConfig/],
    category: 'web3',
  },
  'viem': {
    files: [],
    patterns: [/from ['"]viem['"]/, /createPublicClient/, /createWalletClient/],
    category: 'web3',
  },
  'ethers': {
    files: [],
    patterns: [/ethers/, /JsonRpcProvider/, /parseEther/],
    category: 'web3',
  },

  // Testing
  'jest': {
    files: ['jest.config.js', 'jest.config.ts'],
    patterns: [/from ['"]@jest/, /describe\(/, /it\(.*expect/],
    category: 'testing',
  },
  'vitest': {
    files: ['vitest.config.ts'],
    patterns: [/from ['"]vitest['"]/, /import.*vitest/],
    category: 'testing',
  },
  'playwright': {
    files: ['playwright.config.ts'],
    patterns: [/@playwright\/test/, /page\.goto/],
    category: 'testing',
  },

  // API
  'trpc': {
    files: [],
    patterns: [/@trpc\/server/, /@trpc\/client/, /createTRPCRouter/],
    category: 'api',
    skills: ['api-design'],
  },
  'graphql': {
    files: [],
    patterns: [/graphql/, /gql`/, /useQuery.*graphql/],
    category: 'api',
    skills: ['api-design'],
  },

  // Deployment
  'vercel': {
    files: ['vercel.json'],
    patterns: [/@vercel\//, /VERCEL_/],
    category: 'deployment',
  },
  'cloudflare': {
    files: ['wrangler.toml', 'wrangler.json'],
    patterns: [/@cloudflare\/workers/, /Cloudflare/],
    category: 'deployment',
  },
};

type StackKey = keyof typeof STACK_PATTERNS;

/**
 * Input schema for spawner_analyze
 */
export const analyzeInputSchema = z.object({
  // File list from the project
  files: z.array(z.string()).optional().describe(
    'List of file paths in the project (from ls/find)'
  ),
  // Code snippets to analyze
  code_samples: z.array(z.object({
    path: z.string(),
    content: z.string(),
  })).optional().describe(
    'Code samples with file paths to analyze'
  ),
  // Package.json dependencies
  dependencies: z.record(z.string()).optional().describe(
    'Dependencies from package.json'
  ),
  // Specific question about the codebase
  question: z.string().optional().describe(
    'Specific question about the codebase (e.g., "what auth solution should I add?")'
  ),
});

/**
 * Tool definition for MCP
 */
export const analyzeToolDefinition = {
  name: 'spawner_analyze',
  description: 'Analyze existing codebase to detect stack, patterns, and recommend skills. Use when working with existing projects.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      files: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of file paths in the project',
      },
      code_samples: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            path: { type: 'string' },
            content: { type: 'string' },
          },
          required: ['path', 'content'],
        },
        description: 'Code samples with file paths',
      },
      dependencies: {
        type: 'object',
        additionalProperties: { type: 'string' },
        description: 'Dependencies from package.json',
      },
      question: {
        type: 'string',
        description: 'Specific question about the codebase',
      },
    },
  },
};

/**
 * Output type
 */
export interface AnalyzeOutput {
  // Detected stack
  detected_stack: {
    name: string;
    category: string;
    confidence: number;
    evidence: string[];
  }[];
  // Stack by category
  stack_summary: {
    framework?: string;
    database?: string;
    auth?: string;
    payments?: string;
    styling?: string;
    ai?: string;
    web3?: string;
    deployment?: string;
  };
  // Recommended skills based on stack
  recommended_skills: {
    name: string;
    reason: string;
    priority: 'high' | 'medium' | 'low';
  }[];
  // Potential gaps or improvements
  gaps: {
    category: string;
    suggestion: string;
    skills: string[];
  }[];
  // Answer to specific question if provided
  answer?: string;
  // Instruction for Claude
  _instruction: string;
}

/**
 * Execute the spawner_analyze tool
 */
export async function executeAnalyze(
  env: Env,
  input: z.infer<typeof analyzeInputSchema>
): Promise<AnalyzeOutput> {
  const { files, code_samples, dependencies, question } = input;

  // 1. Detect stack from all inputs
  const detectedStack = detectStack(files ?? [], code_samples ?? [], dependencies ?? {});

  // 2. Build stack summary by category
  const stackSummary = buildStackSummary(detectedStack);

  // 3. Recommend skills based on detected stack
  const recommendedSkills = recommendSkills(detectedStack, stackSummary);

  // 4. Identify gaps
  const gaps = identifyGaps(stackSummary, detectedStack);

  // 5. Answer specific question if provided
  const answer = question ? answerQuestion(question, detectedStack, stackSummary) : undefined;

  // 6. Build instruction
  const instruction = buildInstruction(detectedStack, stackSummary, recommendedSkills, gaps, answer);

  return {
    detected_stack: detectedStack,
    stack_summary: stackSummary,
    recommended_skills: recommendedSkills,
    gaps,
    answer,
    _instruction: instruction,
  };
}

/**
 * Detect stack from files, code, and dependencies
 */
function detectStack(
  files: string[],
  codeSamples: { path: string; content: string }[],
  dependencies: Record<string, string>
): { name: string; category: string; confidence: number; evidence: string[] }[] {
  const results: Map<string, { category: string; confidence: number; evidence: string[] }> = new Map();

  // Check dependencies first (highest confidence)
  for (const [stackName, pattern] of Object.entries(STACK_PATTERNS)) {
    const evidence: string[] = [];

    // Check if any pattern matches dependency names
    for (const depName of Object.keys(dependencies)) {
      if (depName.includes(stackName) || pattern.patterns.some(p => p.test(depName))) {
        evidence.push(`dependency: ${depName}`);
      }
    }

    if (evidence.length > 0) {
      results.set(stackName, {
        category: pattern.category,
        confidence: Math.min(0.9 + evidence.length * 0.05, 1),
        evidence,
      });
    }
  }

  // Check files
  for (const [stackName, pattern] of Object.entries(STACK_PATTERNS)) {
    if (pattern.files.length === 0) continue;

    const evidence: string[] = [];
    for (const configFile of pattern.files) {
      if (files.some(f => f.endsWith(configFile) || f.includes(configFile))) {
        evidence.push(`file: ${configFile}`);
      }
    }

    if (evidence.length > 0) {
      const existing = results.get(stackName);
      if (existing) {
        existing.evidence.push(...evidence);
        existing.confidence = Math.min(existing.confidence + 0.1, 1);
      } else {
        results.set(stackName, {
          category: pattern.category,
          confidence: 0.8,
          evidence,
        });
      }
    }
  }

  // Check code patterns
  for (const sample of codeSamples) {
    for (const [stackName, pattern] of Object.entries(STACK_PATTERNS)) {
      for (const regex of pattern.patterns) {
        if (regex.test(sample.content)) {
          const existing = results.get(stackName);
          const evidenceStr = `code pattern in ${sample.path}`;

          if (existing) {
            if (!existing.evidence.includes(evidenceStr)) {
              existing.evidence.push(evidenceStr);
              existing.confidence = Math.min(existing.confidence + 0.05, 1);
            }
          } else {
            results.set(stackName, {
              category: pattern.category,
              confidence: 0.6,
              evidence: [evidenceStr],
            });
          }
        }
      }
    }
  }

  // Convert to array and sort by confidence
  return Array.from(results.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.confidence - a.confidence);
}

/**
 * Build stack summary by category
 */
function buildStackSummary(
  detectedStack: { name: string; category: string; confidence: number }[]
): Record<string, string> {
  const summary: Record<string, string> = {};

  for (const item of detectedStack) {
    if (!summary[item.category] || item.confidence > 0.7) {
      summary[item.category] = item.name;
    }
  }

  return summary;
}

/**
 * Recommend skills based on detected stack
 */
function recommendSkills(
  detectedStack: { name: string; category: string; confidence: number }[],
  stackSummary: Record<string, string>
): { name: string; reason: string; priority: 'high' | 'medium' | 'low' }[] {
  const skills: { name: string; reason: string; priority: 'high' | 'medium' | 'low' }[] = [];
  const addedSkills = new Set<string>();

  // Add skills from detected stack
  for (const item of detectedStack) {
    const pattern = STACK_PATTERNS[item.name as StackKey];
    if (pattern && 'skills' in pattern && pattern.skills) {
      for (const skillName of pattern.skills) {
        if (!addedSkills.has(skillName)) {
          addedSkills.add(skillName);
          skills.push({
            name: skillName,
            reason: `You're using ${item.name}`,
            priority: item.confidence > 0.8 ? 'high' : 'medium',
          });
        }
      }
    }
  }

  // Add framework-specific skills
  if (stackSummary.framework === 'nextjs' && !addedSkills.has('nextjs-app-router')) {
    skills.push({
      name: 'nextjs-app-router',
      reason: 'Next.js detected - load App Router patterns',
      priority: 'high',
    });
    addedSkills.add('nextjs-app-router');
  }

  // Add TypeScript skill if likely using TS
  if (!addedSkills.has('typescript-strict')) {
    skills.push({
      name: 'typescript-strict',
      reason: 'TypeScript patterns and strict mode guidance',
      priority: 'medium',
    });
  }

  // Add React patterns if React-based framework
  if (['nextjs', 'react'].includes(stackSummary.framework ?? '') && !addedSkills.has('react-patterns')) {
    skills.push({
      name: 'react-patterns',
      reason: 'React-based framework detected',
      priority: 'medium',
    });
  }

  return skills;
}

/**
 * Identify gaps in the stack
 */
function identifyGaps(
  stackSummary: Record<string, string>,
  detectedStack: { name: string; category: string }[]
): { category: string; suggestion: string; skills: string[] }[] {
  const gaps: { category: string; suggestion: string; skills: string[] }[] = [];

  // Check for auth gap
  if (!stackSummary.auth && (stackSummary.database || stackSummary.framework)) {
    gaps.push({
      category: 'auth',
      suggestion: 'No authentication detected. Consider adding Supabase Auth, NextAuth, or Clerk.',
      skills: ['auth-flow'],
    });
  }

  // Check for database gap
  if (!stackSummary.database && stackSummary.framework) {
    gaps.push({
      category: 'database',
      suggestion: 'No database detected. Consider Supabase, Prisma, or Drizzle for data persistence.',
      skills: ['supabase-backend'],
    });
  }

  // Check for testing gap
  const hasTests = detectedStack.some(s => s.category === 'testing');
  if (!hasTests && detectedStack.length > 3) {
    gaps.push({
      category: 'testing',
      suggestion: 'No testing framework detected. Consider adding Vitest or Playwright for test coverage.',
      skills: [],
    });
  }

  // Check for styling gap
  if (!stackSummary.styling && stackSummary.framework) {
    gaps.push({
      category: 'styling',
      suggestion: 'Consider adding Tailwind CSS with shadcn/ui for consistent styling.',
      skills: ['tailwind-ui'],
    });
  }

  return gaps;
}

/**
 * Answer specific question about the codebase
 */
function answerQuestion(
  question: string,
  detectedStack: { name: string; category: string; confidence: number }[],
  stackSummary: Record<string, string>
): string {
  const q = question.toLowerCase();

  // Auth questions
  if (q.includes('auth') || q.includes('login') || q.includes('signup')) {
    if (stackSummary.auth) {
      return `You're already using ${stackSummary.auth} for authentication. Load the 'auth-flow' skill for best practices.`;
    }
    if (stackSummary.database === 'supabase') {
      return 'Since you\'re using Supabase, I recommend Supabase Auth. It integrates seamlessly with your existing setup. Load the \'auth-flow\' skill.';
    }
    return 'For a Next.js app, I recommend NextAuth.js or Clerk. NextAuth is more flexible, Clerk is more turnkey. Load the \'auth-flow\' skill for implementation patterns.';
  }

  // Payments questions
  if (q.includes('payment') || q.includes('stripe') || q.includes('subscription') || q.includes('billing')) {
    if (stackSummary.payments) {
      return `You're already using ${stackSummary.payments}. Load the 'payments-flow' skill for subscription patterns and webhooks.`;
    }
    return 'For payments, Stripe is the standard choice. Use Stripe Checkout for quick setup or Stripe Elements for custom UI. Load the \'payments-flow\' skill.';
  }

  // Database questions
  if (q.includes('database') || q.includes('storage') || q.includes('data')) {
    if (stackSummary.database) {
      return `You're using ${stackSummary.database}. This is a good choice for your stack.`;
    }
    return 'For database, I recommend Supabase (Postgres + Auth + Realtime) for full-stack apps, or Prisma/Drizzle as ORMs if you want more control.';
  }

  // AI questions
  if (q.includes('ai') || q.includes('llm') || q.includes('openai') || q.includes('claude')) {
    return 'For AI integration, use the Vercel AI SDK - it works with OpenAI, Anthropic, and others. Load the \'ai-integration\' skill for streaming patterns and best practices.';
  }

  // Default answer
  return `Based on your stack (${Object.values(stackSummary).filter(Boolean).join(', ')}), I can help with specific implementation questions. What feature are you trying to add?`;
}

/**
 * Build instruction for Claude
 */
function buildInstruction(
  detectedStack: { name: string; category: string; confidence: number; evidence: string[] }[],
  stackSummary: Record<string, string>,
  recommendedSkills: { name: string; reason: string; priority: 'high' | 'medium' | 'low' }[],
  gaps: { category: string; suggestion: string; skills: string[] }[],
  answer?: string
): string {
  const lines = [
    '## Codebase Analysis',
    '',
  ];

  // Stack summary
  if (Object.keys(stackSummary).length > 0) {
    lines.push('**Detected Stack:**');
    for (const [category, name] of Object.entries(stackSummary)) {
      lines.push(`- ${category}: ${name}`);
    }
    lines.push('');
  } else {
    lines.push('**No stack detected.** Provide code samples or package.json for better analysis.');
    lines.push('');
  }

  // High confidence detections
  const highConfidence = detectedStack.filter(s => s.confidence > 0.8);
  if (highConfidence.length > 0) {
    lines.push('**High Confidence:**');
    for (const item of highConfidence.slice(0, 5)) {
      lines.push(`- ${item.name} (${Math.round(item.confidence * 100)}%): ${item.evidence.slice(0, 2).join(', ')}`);
    }
    lines.push('');
  }

  // Recommended skills
  if (recommendedSkills.length > 0) {
    lines.push('**Load These Skills:**');
    const highPriority = recommendedSkills.filter(s => s.priority === 'high');
    const otherPriority = recommendedSkills.filter(s => s.priority !== 'high');

    for (const skill of highPriority) {
      lines.push(`- **${skill.name}** (high priority) - ${skill.reason}`);
    }
    for (const skill of otherPriority.slice(0, 3)) {
      lines.push(`- ${skill.name} - ${skill.reason}`);
    }
    lines.push('');
    lines.push('Use `spawner_skills` action="get" to load these skills.');
    lines.push('');
  }

  // Gaps
  if (gaps.length > 0) {
    lines.push('**Potential Gaps:**');
    for (const gap of gaps) {
      lines.push(`- ${gap.category}: ${gap.suggestion}`);
    }
    lines.push('');
  }

  // Answer
  if (answer) {
    lines.push('**Answer:**');
    lines.push(answer);
    lines.push('');
  }

  // Next steps
  lines.push('## Next Steps');
  lines.push('1. Load recommended skills with `spawner_skills`');
  lines.push('2. Use `spawner_load` to initialize project memory');
  lines.push('3. Check `spawner_watch_out` for gotchas in your stack');

  return lines.join('\n');
}
