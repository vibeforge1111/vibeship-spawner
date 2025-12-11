/**
 * spawner_plan Tool
 *
 * Unified project planning tool that handles:
 * 1. Discovery - understand what user wants to build
 * 2. Recommendations - suggest template, stack, skills
 * 3. Creation - scaffold the project when ready
 *
 * Replaces separate discover + create flow with single tool.
 */

import { z } from 'zod';
import type { Env } from '../types';
import { emitEvent } from '../telemetry/events';

/**
 * Skill level definitions
 */
const SKILL_LEVELS = {
  'vibe-coder': {
    name: 'Vibe Coder',
    description: 'Non-technical, needs maximum guidance',
    approach: 'Make all tech decisions, explain in plain English',
  },
  'builder': {
    name: 'Builder',
    description: 'Some tech knowledge, learning',
    approach: 'Explain key decisions, teach patterns',
  },
  'developer': {
    name: 'Developer',
    description: 'Technical, familiar with patterns',
    approach: 'Skip explanations, offer options with tradeoffs',
  },
  'expert': {
    name: 'Expert',
    description: 'Senior developer, strong opinions',
    approach: 'Minimal guidance, challenge decisions, let them lead',
  },
} as const;

type SkillLevel = keyof typeof SKILL_LEVELS;

/**
 * Template configurations
 */
const TEMPLATES = {
  saas: {
    name: 'SaaS',
    description: 'Subscription products with auth, billing, and dashboards',
    stack: ['nextjs', 'supabase', 'stripe', 'tailwind'],
    skills: ['auth-flow', 'payments-flow', 'supabase-backend', 'nextjs-app-router'],
    agents: ['planner', 'frontend', 'backend', 'database', 'testing'],
  },
  marketplace: {
    name: 'Marketplace',
    description: 'Buy/sell platforms with listings, search, and payments',
    stack: ['nextjs', 'supabase', 'stripe', 'algolia', 'tailwind'],
    skills: ['payments-flow', 'crud-builder', 'supabase-backend', 'nextjs-app-router'],
    agents: ['planner', 'frontend', 'backend', 'database', 'payments', 'search'],
  },
  'ai-app': {
    name: 'AI App',
    description: 'LLM-powered applications with chat, embeddings, and RAG',
    stack: ['nextjs', 'supabase', 'openai', 'tailwind'],
    skills: ['ai-integration', 'api-design', 'supabase-backend', 'nextjs-app-router'],
    agents: ['planner', 'frontend', 'backend', 'database', 'ai'],
  },
  web3: {
    name: 'Web3 dApp',
    description: 'Blockchain apps with wallet connect and smart contracts',
    stack: ['nextjs', 'wagmi', 'viem', 'tailwind'],
    skills: ['typescript-strict', 'react-patterns', 'security-audit'],
    agents: ['planner', 'frontend', 'smart-contracts', 'testing'],
  },
  tool: {
    name: 'Tool/CLI',
    description: 'Utilities and command-line tools',
    stack: ['typescript', 'node'],
    skills: ['typescript-strict', 'api-design'],
    agents: ['planner', 'backend', 'testing'],
  },
} as const;

type TemplateId = keyof typeof TEMPLATES;

/**
 * Project patterns for detection
 */
const PROJECT_PATTERNS: Record<string, {
  keywords: string[];
  template: TemplateId;
}> = {
  saas: {
    keywords: ['subscription', 'saas', 'b2b', 'dashboard', 'billing', 'plans', 'pricing'],
    template: 'saas',
  },
  marketplace: {
    keywords: ['marketplace', 'buy', 'sell', 'listings', 'vendors', 'sellers', 'buyers', 'e-commerce'],
    template: 'marketplace',
  },
  'ai-app': {
    keywords: ['ai', 'llm', 'chatbot', 'gpt', 'claude', 'embeddings', 'rag', 'assistant'],
    template: 'ai-app',
  },
  web3: {
    keywords: ['web3', 'blockchain', 'nft', 'crypto', 'wallet', 'defi', 'smart contract', 'token'],
    template: 'web3',
  },
  tool: {
    keywords: ['cli', 'tool', 'utility', 'script', 'automation', 'internal'],
    template: 'tool',
  },
  social: {
    keywords: ['social', 'feed', 'posts', 'followers', 'community', 'comments', 'likes'],
    template: 'saas',
  },
  content: {
    keywords: ['blog', 'cms', 'content', 'articles', 'posts', 'publishing'],
    template: 'saas',
  },
};

/**
 * Input schema for spawner_plan
 */
export const planInputSchema = z.object({
  // Action: discover (ask questions), recommend (show plan), create (scaffold)
  action: z.enum(['discover', 'recommend', 'create']).default('discover').describe(
    'Action: discover (understand idea), recommend (show plan), create (scaffold project)'
  ),
  // User's project idea
  idea: z.string().optional().describe(
    'User\'s project idea or description'
  ),
  // For create action
  project_name: z.string().optional().describe(
    'Project name (required for create action)'
  ),
  template: z.enum(['saas', 'marketplace', 'ai-app', 'web3', 'tool']).optional().describe(
    'Template to use (optional - will be auto-detected from idea)'
  ),
  // Conversation context
  context: z.object({
    previous_questions: z.array(z.string()).optional(),
    answers: z.record(z.string()).optional(),
    detected_skill_level: z.enum(['vibe-coder', 'builder', 'developer', 'expert']).optional(),
    detected_template: z.enum(['saas', 'marketplace', 'ai-app', 'web3', 'tool']).optional(),
  }).optional().describe(
    'Context from previous planning turns'
  ),
  // User signals for skill level detection
  user_signals: z.array(z.string()).optional().describe(
    'Phrases from user that indicate their skill level'
  ),
});

/**
 * Tool definition for MCP
 */
export const planToolDefinition = {
  name: 'spawner_plan',
  description: 'Plan and create new projects. Use at project start to understand what user wants, recommend stack/skills, and scaffold when ready.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      action: {
        type: 'string',
        enum: ['discover', 'recommend', 'create'],
        description: 'discover = ask questions, recommend = show plan, create = scaffold project',
        default: 'discover',
      },
      idea: {
        type: 'string',
        description: 'User\'s project idea or description',
      },
      project_name: {
        type: 'string',
        description: 'Project name (required for create action)',
      },
      template: {
        type: 'string',
        enum: ['saas', 'marketplace', 'ai-app', 'web3', 'tool'],
        description: 'Template (auto-detected if not provided)',
      },
      context: {
        type: 'object',
        description: 'Context from previous planning turns',
        properties: {
          previous_questions: { type: 'array', items: { type: 'string' } },
          answers: { type: 'object', additionalProperties: { type: 'string' } },
          detected_skill_level: { type: 'string', enum: ['vibe-coder', 'builder', 'developer', 'expert'] },
          detected_template: { type: 'string', enum: ['saas', 'marketplace', 'ai-app', 'web3', 'tool'] },
        },
      },
      user_signals: {
        type: 'array',
        items: { type: 'string' },
        description: 'Phrases indicating user skill level',
      },
    },
  },
};

/**
 * Output type
 */
export interface PlanOutput {
  action: 'discover' | 'recommend' | 'create';
  // Discovery results
  understanding?: {
    clarity: 'vague' | 'partial' | 'clear';
    detected_type: string | null;
    confidence: number;
  };
  skill_level?: {
    detected: SkillLevel;
    confidence: number;
    signals: string[];
  };
  questions?: {
    question: string;
    why: string;
    options?: string[];
  }[];
  // Recommendation results
  recommendations?: {
    template: TemplateId;
    template_name: string;
    stack: string[];
    skills: string[];
    squad: { lead: string; support: string[] };
  };
  // Creation results
  project?: {
    id: string;
    name: string;
    template: string;
    stack: string[];
    agents: string[];
    scaffolding: { files: string[]; directories: string[] };
  };
  next_steps: string[];
  _instruction: string;
}

/**
 * Execute the spawner_plan tool
 */
export async function executePlan(
  env: Env,
  input: z.infer<typeof planInputSchema>,
  userId: string
): Promise<PlanOutput> {
  const { action, idea, project_name, template, context, user_signals } = input;

  // Detect skill level
  const skillLevel = detectSkillLevel(user_signals ?? [], context?.detected_skill_level);

  // Analyze idea to detect project type
  const analysis = analyzeIdea(idea ?? '', context?.answers ?? {});

  // Determine template (explicit > context > detected > default)
  const resolvedTemplate: TemplateId = template
    ?? context?.detected_template
    ?? (analysis.detected_type ? PROJECT_PATTERNS[analysis.detected_type]?.template : undefined)
    ?? 'saas';

  switch (action) {
    case 'discover':
      return handleDiscover(analysis, skillLevel, context?.previous_questions ?? []);

    case 'recommend':
      return handleRecommend(analysis, skillLevel, resolvedTemplate);

    case 'create':
      if (!project_name) {
        throw new Error('project_name is required for create action');
      }
      return handleCreate(env, userId, project_name, resolvedTemplate, idea, skillLevel);

    default:
      return handleDiscover(analysis, skillLevel, context?.previous_questions ?? []);
  }
}

/**
 * Handle discover action - ask questions to understand the idea
 */
function handleDiscover(
  analysis: { clarity: 'vague' | 'partial' | 'clear'; detected_type: string | null; confidence: number },
  skillLevel: { detected: SkillLevel; confidence: number; signals: string[] },
  previousQuestions: string[]
): PlanOutput {
  // If clear enough, suggest moving to recommend
  if (analysis.clarity === 'clear' || (analysis.clarity === 'partial' && analysis.confidence > 0.7)) {
    const template = analysis.detected_type
      ? PROJECT_PATTERNS[analysis.detected_type]?.template ?? 'saas'
      : 'saas';

    return {
      action: 'discover',
      understanding: analysis,
      skill_level: skillLevel,
      next_steps: [
        `Ready to show recommendations - use action="recommend"`,
        `Or continue refining with more details`,
      ],
      _instruction: buildReadyInstruction(analysis, skillLevel, template),
    };
  }

  // Generate questions
  const questions = generateQuestions(analysis, previousQuestions);

  return {
    action: 'discover',
    understanding: analysis,
    skill_level: skillLevel,
    questions,
    next_steps: [
      'Ask 1-2 of the suggested questions',
      'Call spawner_plan again with answers in context',
    ],
    _instruction: buildQuestionInstruction(analysis, skillLevel, questions),
  };
}

/**
 * Handle recommend action - show the plan
 */
function handleRecommend(
  analysis: { clarity: string; detected_type: string | null; confidence: number },
  skillLevel: { detected: SkillLevel; confidence: number; signals: string[] },
  template: TemplateId
): PlanOutput {
  const templateConfig = TEMPLATES[template];
  const lead = templateConfig.skills[0] ?? 'nextjs-app-router';
  const support = templateConfig.skills.slice(1, 3);

  return {
    action: 'recommend',
    understanding: {
      clarity: analysis.clarity as 'vague' | 'partial' | 'clear',
      detected_type: analysis.detected_type,
      confidence: analysis.confidence,
    },
    skill_level: skillLevel,
    recommendations: {
      template,
      template_name: templateConfig.name,
      stack: [...templateConfig.stack],
      skills: [...templateConfig.skills],
      squad: { lead, support },
    },
    next_steps: [
      'Confirm this plan with the user',
      `To create: spawner_plan action="create" project_name="your-project" template="${template}"`,
    ],
    _instruction: buildRecommendInstruction(templateConfig, skillLevel, template),
  };
}

/**
 * Handle create action - scaffold the project
 */
async function handleCreate(
  env: Env,
  userId: string,
  projectName: string,
  template: TemplateId,
  description: string | undefined,
  skillLevel: { detected: SkillLevel; confidence: number; signals: string[] }
): Promise<PlanOutput> {
  const templateConfig = TEMPLATES[template];

  // Generate project ID
  const projectId = generateProjectId(projectName);

  // Create project in D1
  await env.DB.prepare(`
    INSERT INTO projects (id, user_id, name, description, stack, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
  `).bind(
    projectId,
    userId,
    projectName,
    description ?? null,
    JSON.stringify(templateConfig.stack)
  ).run();

  // Cache project in KV
  await env.CACHE.put(
    `project:${projectId}`,
    JSON.stringify({
      id: projectId,
      user_id: userId,
      name: projectName,
      description: description ?? null,
      stack: templateConfig.stack,
      template,
      agents: templateConfig.agents,
      skill_level: skillLevel.detected,
    }),
    { expirationTtl: 86400 * 7 }
  );

  // Emit telemetry
  await emitEvent(env.DB, 'session_start', {
    template,
    stack: templateConfig.stack,
    agents: templateConfig.agents,
    skill_level: skillLevel.detected,
  }, projectId);

  // Generate scaffolding
  const scaffolding = generateScaffolding(template, projectName, [...templateConfig.stack]);

  return {
    action: 'create',
    skill_level: skillLevel,
    project: {
      id: projectId,
      name: projectName,
      template,
      stack: [...templateConfig.stack],
      agents: [...templateConfig.agents],
      scaffolding,
    },
    recommendations: {
      template,
      template_name: templateConfig.name,
      stack: [...templateConfig.stack],
      skills: [...templateConfig.skills],
      squad: {
        lead: templateConfig.skills[0] ?? 'nextjs-app-router',
        support: templateConfig.skills.slice(1, 3),
      },
    },
    next_steps: [
      `Project "${projectName}" created with ID: ${projectId}`,
      'Load skills with spawner_skills action="get"',
      'Use spawner_load to initialize session',
      'Start building!',
    ],
    _instruction: buildCreateInstruction(projectName, projectId, templateConfig, skillLevel),
  };
}

/**
 * Detect skill level from signals
 */
function detectSkillLevel(
  signals: string[],
  previousDetection?: SkillLevel
): { detected: SkillLevel; confidence: number; signals: string[] } {
  const signalText = signals.join(' ').toLowerCase();
  const detectedSignals: string[] = [];

  const patterns: Record<SkillLevel, RegExp[]> = {
    'vibe-coder': [
      /i don'?t know (code|programming|tech)/i,
      /what (does|is) .+ mean/i,
      /you (decide|pick|choose)/i,
      /i'?m not technical/i,
    ],
    'builder': [
      /is this the right way/i,
      /should i use/i,
      /i'?ve used .+ before/i,
      /learning/i,
    ],
    'developer': [
      /i prefer/i,
      /let'?s use/i,
      /trade-?offs/i,
      /architecture/i,
    ],
    'expert': [
      /actually,? (i think|we should)/i,
      /have you considered/i,
      /in my experience/i,
      /i'?d rather/i,
    ],
  };

  const scores: Record<SkillLevel, number> = {
    'vibe-coder': 0,
    'builder': 0,
    'developer': 0,
    'expert': 0,
  };

  for (const [level, levelPatterns] of Object.entries(patterns)) {
    for (const pattern of levelPatterns) {
      if (pattern.test(signalText)) {
        scores[level as SkillLevel]++;
        detectedSignals.push(pattern.source);
      }
    }
  }

  let maxScore = 0;
  let detected: SkillLevel = previousDetection ?? 'builder';

  for (const [level, score] of Object.entries(scores)) {
    if (score > maxScore) {
      maxScore = score;
      detected = level as SkillLevel;
    }
  }

  return {
    detected,
    confidence: maxScore > 0 ? Math.min(maxScore / 3, 1) : 0.3,
    signals: detectedSignals.slice(0, 3),
  };
}

/**
 * Analyze the project idea
 */
function analyzeIdea(
  idea: string,
  previousAnswers: Record<string, string>
): { clarity: 'vague' | 'partial' | 'clear'; detected_type: string | null; confidence: number } {
  const text = (idea + ' ' + Object.values(previousAnswers).join(' ')).toLowerCase();

  if (!text.trim()) {
    return { clarity: 'vague', detected_type: null, confidence: 0 };
  }

  let bestMatch: { type: string; score: number } | null = null;

  for (const [type, pattern] of Object.entries(PROJECT_PATTERNS)) {
    let score = 0;
    for (const keyword of pattern.keywords) {
      if (text.includes(keyword)) score++;
    }
    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { type, score };
    }
  }

  const hasUserAction = /user.*(can|will|should)/.test(text) || /(allow|enable|let).*user/.test(text);
  const hasPlatform = /(web|mobile|app|desktop|cli)/.test(text);
  const hasFeatures = text.split(/[,.]/).filter(s => s.trim().length > 10).length >= 2;

  const clarityScore = (hasUserAction ? 1 : 0) + (hasPlatform ? 1 : 0) + (hasFeatures ? 1 : 0) + (bestMatch ? 1 : 0);

  return {
    clarity: clarityScore >= 3 ? 'clear' : clarityScore >= 1 ? 'partial' : 'vague',
    detected_type: bestMatch?.type ?? null,
    confidence: bestMatch ? Math.min(bestMatch.score / 3, 1) : 0.2,
  };
}

/**
 * Generate targeted questions
 */
function generateQuestions(
  analysis: { clarity: string; detected_type: string | null },
  previousQuestions: string[]
): { question: string; why: string; options?: string[] }[] {
  const questions: { question: string; why: string; options?: string[] }[] = [];
  const asked = new Set(previousQuestions);

  const questionPool = [
    {
      id: 'main_action',
      question: "What's the ONE main thing a user does in your app?",
      why: 'Identifies core feature and project type',
      options: ['Browse/search', 'Create/manage data', 'Buy/sell', 'Chat/communicate', 'Track/monitor'],
    },
    {
      id: 'users',
      question: 'Do users need accounts?',
      why: 'Determines auth requirements',
      options: ['Yes, login required', 'No, anonymous', 'Both options'],
    },
    {
      id: 'payments',
      question: 'Will users pay for anything?',
      why: 'Determines payment integration',
      options: ['Subscriptions', 'One-time', 'Marketplace', 'No payments'],
    },
  ];

  for (const q of questionPool) {
    if (questions.length >= 3) break;
    if (asked.has(q.question)) continue;
    questions.push({ question: q.question, why: q.why, options: q.options });
  }

  return questions;
}

/**
 * Generate project ID
 */
function generateProjectId(name: string): string {
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 32);
  const timestamp = Date.now().toString(36);
  return `${slug}-${timestamp}`;
}

/**
 * Generate scaffolding
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
  ];

  const files = [
    `${projectName}/CLAUDE.md`,
    `${projectName}/docs/PRD.md`,
  ];

  if (stack.includes('nextjs')) {
    directories.push(`${projectName}/src/app/`, `${projectName}/src/components/`);
    files.push(`${projectName}/src/app/page.tsx`, `${projectName}/next.config.js`);
  }

  if (stack.includes('supabase')) {
    directories.push(`${projectName}/supabase/`);
    files.push(`${projectName}/src/lib/supabase.ts`);
  }

  return { files, directories };
}

/**
 * Instruction builders
 */
function buildReadyInstruction(
  analysis: { detected_type: string | null; confidence: number },
  skillLevel: { detected: SkillLevel },
  template: TemplateId
): string {
  const levelInfo = SKILL_LEVELS[skillLevel.detected];
  return `## Ready to Plan

**Detected:** ${analysis.detected_type ?? 'general'} project (${Math.round(analysis.confidence * 100)}% confidence)
**User Level:** ${levelInfo.name}
**Recommended Template:** ${template}

Call \`spawner_plan\` with action="recommend" to see the full plan, or action="create" to scaffold now.`;
}

function buildQuestionInstruction(
  analysis: { clarity: string; detected_type: string | null },
  skillLevel: { detected: SkillLevel },
  questions: { question: string; options?: string[] }[]
): string {
  const levelInfo = SKILL_LEVELS[skillLevel.detected];
  const lines = [
    `## Need More Information`,
    ``,
    `**Clarity:** ${analysis.clarity} | **User:** ${levelInfo.name}`,
    ``,
    `**Ask 1-2 questions:**`,
  ];

  for (const q of questions) {
    if (!q) continue;
    lines.push(`- ${q.question}`);
    if (q.options) lines.push(`  (${q.options.join(' / ')})`);
  }

  lines.push(``, `For ${levelInfo.name}: ${levelInfo.approach}`);
  return lines.join('\n');
}

function buildRecommendInstruction(
  templateConfig: typeof TEMPLATES[TemplateId],
  skillLevel: { detected: SkillLevel },
  template: TemplateId
): string {
  const levelInfo = SKILL_LEVELS[skillLevel.detected];
  return `## Project Plan

**Template:** ${templateConfig.name}
**Stack:** ${templateConfig.stack.join(', ')}
**Skills:** ${templateConfig.skills.join(', ')}
**User Level:** ${levelInfo.name}

To create: \`spawner_plan action="create" project_name="your-project" template="${template}"\``;
}

function buildCreateInstruction(
  projectName: string,
  projectId: string,
  templateConfig: typeof TEMPLATES[TemplateId],
  skillLevel: { detected: SkillLevel }
): string {
  const levelInfo = SKILL_LEVELS[skillLevel.detected];
  return `## Project Created!

**${projectName}** (ID: ${projectId})
**Template:** ${templateConfig.name}
**Stack:** ${templateConfig.stack.join(', ')}
**User Level:** ${levelInfo.name} - ${levelInfo.approach}

**Next:**
1. \`spawner_skills action="get" name="${templateConfig.skills[0]}"\`
2. \`spawner_load project_id="${projectId}"\`
3. Start building!`;
}
