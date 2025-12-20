/**
 * Skill Brainstorm Tool
 *
 * Optional pre-pipeline tool for users who want to deeply explore
 * skill design before the automated research → new → score flow.
 *
 * Brainstorm Areas:
 * 1. The Expert - What makes this skill truly world-class?
 * 2. Stay in Your Lane - What should this skill focus on vs. pass to others?
 * 3. Common Pitfalls - What mistakes does this skill help people avoid?
 * 4. Works Well With - How does this skill team up with other skills?
 * 5. Built For - Who is this skill designed to help?
 */

import { z } from 'zod';
import type { ToolDefinition } from './registry.js';
import type { Env } from '../types.js';

// =============================================================================
// Types
// =============================================================================

interface BrainstormQuestion {
  id: string;
  area: 'identity' | 'boundaries' | 'edges' | 'collaboration' | 'audience';
  question: string;
  why: string;
  examples?: string[];
  followUps?: string[];
}

interface BrainstormSession {
  skillIdea: string;
  category: string;
  phase: 'discovery' | 'deep_dive' | 'synthesis';
  currentArea: string;
  questions: BrainstormQuestion[];
  insights: BrainstormInsight[];
  readyForPipeline: boolean;
}

interface BrainstormInsight {
  area: string;
  insight: string;
  implications: string[];
}

interface AreaSummary {
  area: string;
  status: 'not_started' | 'in_progress' | 'complete';
  keyInsights: string[];
  openQuestions: string[];
}

// =============================================================================
// Constants
// =============================================================================

const SKILL_CATEGORIES = [
  'development',
  'frameworks',
  'integration',
  'pattern',
  'design',
  'marketing',
  'strategy',
  'product',
  'startup',
  'communications',
] as const;

const BRAINSTORM_AREAS = {
  identity: {
    name: 'The Expert',
    description: 'What makes this skill truly world-class? Think of it as a seasoned pro with decades of experience.',
    icon: '🧠',
  },
  boundaries: {
    name: 'Stay in Your Lane',
    description: 'What should this skill focus on, and when should it pass the baton to someone else?',
    icon: '🎯',
  },
  edges: {
    name: 'Common Pitfalls',
    description: 'What mistakes does this skill help people avoid? The "I wish someone told me this sooner" moments.',
    icon: '⚠️',
  },
  collaboration: {
    name: 'Works Well With',
    description: 'How does this skill team up with other skills to get things done?',
    icon: '🤝',
  },
  audience: {
    name: 'Built For',
    description: 'Who is this skill designed to help? What are they trying to accomplish?',
    icon: '👥',
  },
};

// =============================================================================
// Question Banks
// =============================================================================

const IDENTITY_QUESTIONS: BrainstormQuestion[] = [
  {
    id: 'identity-1',
    area: 'identity',
    question: 'If this skill were a person, what would their 20+ years of experience look like?',
    why: 'World-class skills embody deep expertise. Understanding the journey helps define the persona.',
    examples: [
      'A Next.js skill might have: "Started with PHP, then React, then SSR, now App Router. Seen every migration pattern."',
      'A copywriting skill might have: "Written 10,000+ headlines, run 500+ A/B tests, worked with Fortune 500s and startups."',
    ],
    followUps: [
      'What mistakes would they have made along the way?',
      'What hard-won lessons define their approach?',
    ],
  },
  {
    id: 'identity-2',
    area: 'identity',
    question: 'What are the 3-5 STRONG OPINIONS this skill holds that others might disagree with?',
    why: 'Strong opinions separate world-class from generic. These should be specific and defensible.',
    examples: [
      '"Always use server components by default" - controversial but defensible',
      '"Long-form always beats short-form for B2B" - strong stance backed by experience',
    ],
  },
  {
    id: 'identity-3',
    area: 'identity',
    question: 'What is one CONTRARIAN INSIGHT this skill knows that most practitioners get wrong?',
    why: 'The contrarian view is often where the most value lies - it shows deep understanding.',
    examples: [
      '"Most people think caching is about speed. It\'s actually about consistency."',
      '"Everyone focuses on acquisition. The money is in activation."',
    ],
  },
  {
    id: 'identity-4',
    area: 'identity',
    question: 'What does this skill REFUSE to do, even if asked?',
    why: 'Knowing limits shows mastery. A world-class expert knows when to say no.',
    examples: [
      'A database skill might refuse to design schemas without understanding access patterns first.',
      'A UX skill might refuse to add features without user research.',
    ],
  },
];

const BOUNDARY_QUESTIONS: BrainstormQuestion[] = [
  {
    id: 'boundary-1',
    area: 'boundaries',
    question: 'What are the 3-5 things this skill OWNS completely and should never delegate?',
    why: 'Clear ownership prevents overlap and ensures depth. These are the skill\'s core responsibilities.',
    examples: [
      'A Supabase skill owns: Row Level Security, Realtime subscriptions, Edge functions, Auth flows, Database design',
      'A landing page skill owns: Hero sections, Social proof, CTAs, Above-the-fold optimization',
    ],
  },
  {
    id: 'boundary-2',
    area: 'boundaries',
    question: 'What are 3-5 things this skill explicitly DOES NOT own and must hand off?',
    why: 'Knowing boundaries prevents scope creep and ensures proper delegation.',
    examples: [
      'A Supabase skill does NOT own: Frontend components, Business logic, Payment processing',
      'A copywriting skill does NOT own: Visual design, Technical implementation, SEO strategy',
    ],
  },
  {
    id: 'boundary-3',
    area: 'boundaries',
    question: 'What triggers an immediate handoff to another skill?',
    why: 'Clear delegation triggers ensure smooth collaboration and prevent the skill from overreaching.',
    examples: [
      '"When user mentions Stripe or payments" → hand off to payments skill',
      '"When discussing visual hierarchy" → hand off to design skill',
    ],
  },
];

const EDGES_QUESTIONS: BrainstormQuestion[] = [
  {
    id: 'edges-1',
    area: 'edges',
    question: 'What are the 3 most PAINFUL mistakes you\'ve seen people make in this domain?',
    why: 'Sharp edges come from real pain. These become the most valuable warnings.',
    examples: [
      'Next.js: Using client components everywhere → bundle bloat',
      'Supabase: Not setting up RLS → security nightmare',
    ],
    followUps: [
      'How long did it take to discover each mistake?',
      'What was the cost of each mistake?',
    ],
  },
  {
    id: 'edges-2',
    area: 'edges',
    question: 'What gotchas are NOT in the official documentation but everyone learns the hard way?',
    why: 'These undocumented edges are where world-class skills add the most value.',
    examples: [
      'Vercel: Edge functions have no native fetch retry → add your own',
      'Stripe: Webhook signature verification fails silently → explicit logging needed',
    ],
  },
  {
    id: 'edges-3',
    area: 'edges',
    question: 'What version-specific or environment-specific gotchas exist?',
    why: 'Context-specific edges prevent wasted debugging time.',
    examples: [
      'React 18 vs 19 hydration differences',
      'Safari-specific CSS issues',
      'Local vs production environment differences',
    ],
  },
  {
    id: 'edges-4',
    area: 'edges',
    question: 'What common "best practices" are actually harmful in specific situations?',
    why: 'Blindly following best practices without context causes problems. Skills should know when rules don\'t apply.',
    examples: [
      '"Always normalize your database" → except for read-heavy analytics',
      '"Never use !important in CSS" → except for utility overrides',
    ],
  },
];

const COLLABORATION_QUESTIONS: BrainstormQuestion[] = [
  {
    id: 'collab-1',
    area: 'collaboration',
    question: 'What other skills does this skill ALWAYS work well with?',
    why: 'Understanding natural pairings helps build effective skill squads.',
    examples: [
      'Supabase pairs with: Auth, Row Level Security, Edge Functions',
      'Landing Pages pairs with: Copywriting, Conversion Optimization, Analytics',
    ],
  },
  {
    id: 'collab-2',
    area: 'collaboration',
    question: 'What other skills might CONFLICT with this one, and how should conflicts be resolved?',
    why: 'Anticipating conflicts prevents confusion and establishes clear hierarchy.',
    examples: [
      'REST vs GraphQL - establish API style early',
      'Tailwind vs CSS-in-JS - pick one approach',
    ],
  },
  {
    id: 'collab-3',
    area: 'collaboration',
    question: 'What does this skill need to receive FROM other skills to do its job well?',
    why: 'Understanding prerequisites ensures proper sequencing.',
    examples: [
      'Database skill needs: Data model from product skill, Access patterns from frontend',
      'Deployment skill needs: Environment config from DevOps, Build output from framework',
    ],
  },
  {
    id: 'collab-4',
    area: 'collaboration',
    question: 'What does this skill provide TO other skills that they can\'t get elsewhere?',
    why: 'Unique contributions define the skill\'s value in the ecosystem.',
    examples: [
      'Auth skill provides: User identity, Session management, Permission context',
      'Analytics skill provides: User behavior data, Conversion metrics, Performance baselines',
    ],
  },
];

const AUDIENCE_QUESTIONS: BrainstormQuestion[] = [
  {
    id: 'audience-1',
    area: 'audience',
    question: 'Who is the PRIMARY user of this skill? Be specific about their experience level.',
    why: 'Clear audience targeting shapes the depth and style of guidance.',
    examples: [
      'Junior developers learning their first framework',
      'Senior engineers scaling to millions of users',
      'Non-technical founders building MVPs',
    ],
  },
  {
    id: 'audience-2',
    area: 'audience',
    question: 'What does the target user already know vs. what do they need to learn?',
    why: 'Understanding prerequisites prevents over-explaining basics or assuming too much.',
    examples: [
      'Knows: JavaScript, React basics. Needs to learn: Server components, App Router',
      'Knows: Business fundamentals. Needs to learn: Technical constraints, MVP scoping',
    ],
  },
  {
    id: 'audience-3',
    area: 'audience',
    question: 'What is the user trying to achieve when they invoke this skill?',
    why: 'Goal-oriented skills are more actionable than abstract ones.',
    examples: [
      'Ship a production-ready auth system in 2 hours',
      'Write a landing page that converts at 5%+',
      'Debug a performance issue in production',
    ],
  },
];

// =============================================================================
// Tool Definition
// =============================================================================

export const skillBrainstormToolDefinition: ToolDefinition = {
  name: 'spawner_skill_brainstorm',
  description:
    'Optional brainstorming session before skill creation. Explore what makes a skill world-class, what it should focus on, common pitfalls to avoid, how it works with other skills, and who it helps. Use when you want to think deeply before the automated pipeline runs.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      action: {
        type: 'string',
        enum: ['start', 'explore', 'synthesize', 'export'],
        description:
          'start = begin new brainstorm, explore = deep dive into area, synthesize = combine insights, export = generate research input',
        default: 'start',
      },
      skill_idea: {
        type: 'string',
        description: 'The skill concept to brainstorm (required for start)',
      },
      category: {
        type: 'string',
        enum: SKILL_CATEGORIES,
        description: 'Skill category (required for start)',
      },
      area: {
        type: 'string',
        enum: ['identity', 'boundaries', 'edges', 'collaboration', 'audience'],
        description: 'Area to explore: identity (the expert), boundaries (stay in lane), edges (pitfalls), collaboration (works with), audience (built for)',
      },
      insights: {
        type: 'array',
        items: { type: 'string' },
        description: 'Insights gathered during exploration (for synthesize/export)',
      },
      answers: {
        type: 'object',
        description: 'Answers to brainstorm questions (question_id: answer)',
      },
    },
    required: [],
  },
};

const inputSchema = z.object({
  action: z.enum(['start', 'explore', 'synthesize', 'export']).default('start'),
  skill_idea: z.string().optional(),
  category: z.enum(SKILL_CATEGORIES).optional(),
  area: z.enum(['identity', 'boundaries', 'edges', 'collaboration', 'audience']).optional(),
  insights: z.array(z.string()).optional(),
  answers: z.record(z.string()).optional(),
});

type BrainstormInput = z.infer<typeof inputSchema>;

// =============================================================================
// Main Executor
// =============================================================================

export async function executeSkillBrainstorm(
  _env: Env,
  args: BrainstormInput
): Promise<{ content: Array<{ type: 'text'; text: string }> }> {
  const input = inputSchema.parse(args);

  switch (input.action) {
    case 'start':
      return handleStart(input);
    case 'explore':
      return handleExplore(input);
    case 'synthesize':
      return handleSynthesize(input);
    case 'export':
      return handleExport(input);
    default:
      throw new Error(`Unknown action: ${input.action}`);
  }
}

// =============================================================================
// Action Handlers
// =============================================================================

function handleStart(input: BrainstormInput): {
  content: Array<{ type: 'text'; text: string }>;
} {
  if (!input.skill_idea) {
    return {
      content: [
        {
          type: 'text',
          text: `# 🧠 Skill Brainstorm

## Missing Required Input

Please provide a \`skill_idea\` to start brainstorming.

**Example:**
\`\`\`
spawner_skill_brainstorm({
  action: "start",
  skill_idea: "Next.js App Router",
  category: "frameworks"
})
\`\`\`

## What is Skill Brainstorming?

This is an **optional** step before the automated skill creation pipeline.

**Use brainstorming when you want to:**
- Think through what makes this skill truly great
- Decide what the skill should focus on vs. leave to others
- Capture common mistakes people make (so the skill can warn them)
- Plan how the skill teams up with other skills
- Get clear on who this skill is built for

**Pipeline Flow:**
\`\`\`
[Optional] spawner_skill_brainstorm
    ↓
spawner_skill_research  (always automated)
    ↓
spawner_skill_new       (always automated)
    ↓
spawner_skill_score     (always automated)
\`\`\`

If you're confident about the skill design, skip straight to \`spawner_skill_research\`.`,
        },
      ],
    };
  }

  const category = input.category || 'development';

  const output = `# 🧠 Skill Brainstorm: ${input.skill_idea}

## Session Started

**Skill Idea:** ${input.skill_idea}
**Category:** ${category}
**Phase:** Discovery

---

## Brainstorming Areas

We'll explore 5 key areas to ensure this skill is world-class:

${Object.entries(BRAINSTORM_AREAS)
  .map(
    ([key, area]) => `### ${area.icon} ${area.name}
${area.description}
→ Use \`action: "explore", area: "${key}"\` to dive deep`
  )
  .join('\n\n')}

---

## Recommended Flow

1. **The Expert** - Define what makes this skill world-class
2. **Stay in Your Lane** - Clarify what it focuses on vs. passes to others
3. **Common Pitfalls** - Document mistakes people make that this skill prevents
4. **Works Well With** - Define how it teams up with other skills
5. **Built For** - Get clear on who this skill helps

---

## Next Step

Explore an area to start brainstorming:

\`\`\`
spawner_skill_brainstorm({
  action: "explore",
  skill_idea: "${input.skill_idea}",
  area: "identity"
})
\`\`\`

Or if you want to explore all areas, use the questions below as a guide and then synthesize your insights.`;

  return { content: [{ type: 'text', text: output }] };
}

function handleExplore(input: BrainstormInput): {
  content: Array<{ type: 'text'; text: string }>;
} {
  if (!input.area) {
    return {
      content: [
        {
          type: 'text',
          text: `# Missing Area

Please specify an area to explore:
- \`identity\` - The Expert (what makes it world-class)
- \`boundaries\` - Stay in Your Lane (focus vs. hand off)
- \`edges\` - Common Pitfalls (mistakes to avoid)
- \`collaboration\` - Works Well With (teaming up with other skills)
- \`audience\` - Built For (who this helps)`,
        },
      ],
    };
  }

  const areaInfo = BRAINSTORM_AREAS[input.area];
  let questions: BrainstormQuestion[];

  switch (input.area) {
    case 'identity':
      questions = IDENTITY_QUESTIONS;
      break;
    case 'boundaries':
      questions = BOUNDARY_QUESTIONS;
      break;
    case 'edges':
      questions = EDGES_QUESTIONS;
      break;
    case 'collaboration':
      questions = COLLABORATION_QUESTIONS;
      break;
    case 'audience':
      questions = AUDIENCE_QUESTIONS;
      break;
    default:
      throw new Error(`Unknown area: ${input.area}`);
  }

  // Check if answers were provided
  const hasAnswers = input.answers && Object.keys(input.answers).length > 0;

  if (hasAnswers) {
    return generateInsightsFromAnswers(input.skill_idea || 'Skill', input.area, areaInfo, questions, input.answers!);
  }

  const output = `# ${areaInfo.icon} ${areaInfo.name}

## Skill: ${input.skill_idea || 'Not specified'}

${areaInfo.description}

---

## Brainstorming Questions

${questions
  .map(
    (q, i) => `### ${i + 1}. ${q.question}

**Why this matters:** ${q.why}

${
  q.examples
    ? `**Examples:**
${q.examples.map((e) => `- ${e}`).join('\n')}`
    : ''
}

${
  q.followUps
    ? `**Follow-up questions:**
${q.followUps.map((f) => `- ${f}`).join('\n')}`
    : ''
}

---`
  )
  .join('\n\n')}

## How to Proceed

**Option 1:** Answer these questions conversationally, then call synthesize:
\`\`\`
spawner_skill_brainstorm({
  action: "synthesize",
  skill_idea: "${input.skill_idea}",
  insights: [
    "Key insight 1 from our discussion",
    "Key insight 2 from our discussion",
    ...
  ]
})
\`\`\`

**Option 2:** Provide structured answers:
\`\`\`
spawner_skill_brainstorm({
  action: "explore",
  skill_idea: "${input.skill_idea}",
  area: "${input.area}",
  answers: {
    "${questions[0].id}": "Your answer here",
    "${questions[1].id}": "Your answer here",
    ...
  }
})
\`\`\`

**Option 3:** Explore another area:
\`\`\`
spawner_skill_brainstorm({
  action: "explore",
  skill_idea: "${input.skill_idea}",
  area: "boundaries"  // or edges, collaboration, audience
})
\`\`\``;

  return { content: [{ type: 'text', text: output }] };
}

function generateInsightsFromAnswers(
  skillIdea: string,
  area: string,
  areaInfo: { name: string; icon: string; description: string },
  questions: BrainstormQuestion[],
  answers: Record<string, string>
): { content: Array<{ type: 'text'; text: string }> } {
  const answeredQuestions = questions.filter((q) => answers[q.id]);

  const insights: string[] = [];

  // Generate insights from answers
  answeredQuestions.forEach((q) => {
    const answer = answers[q.id];
    if (answer && answer.trim()) {
      insights.push(`[${area}] ${q.question.split('?')[0]}: ${answer}`);
    }
  });

  const output = `# ${areaInfo.icon} ${areaInfo.name} - Insights Captured

## Skill: ${skillIdea}

---

## Answers Recorded

${answeredQuestions
  .map(
    (q) => `### ${q.question}
> ${answers[q.id]}`
  )
  .join('\n\n')}

---

## Extracted Insights

${insights.map((i, idx) => `${idx + 1}. ${i}`).join('\n')}

---

## Next Steps

**Explore more areas:**
${Object.entries(BRAINSTORM_AREAS)
  .filter(([key]) => key !== area)
  .map(([key, a]) => `- \`area: "${key}"\` - ${a.name}`)
  .join('\n')}

**Or synthesize all insights:**
\`\`\`
spawner_skill_brainstorm({
  action: "synthesize",
  skill_idea: "${skillIdea}",
  insights: [
    ${insights.map((i) => `"${i.replace(/"/g, '\\"')}"`).join(',\n    ')}
  ]
})
\`\`\``;

  return { content: [{ type: 'text', text: output }] };
}

function handleSynthesize(input: BrainstormInput): {
  content: Array<{ type: 'text'; text: string }>;
} {
  if (!input.insights || input.insights.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: `# Synthesis Requires Insights

Please provide insights gathered during exploration:

\`\`\`
spawner_skill_brainstorm({
  action: "synthesize",
  skill_idea: "Your skill",
  insights: [
    "Insight about identity...",
    "Insight about boundaries...",
    "Sharp edge discovered...",
    "Collaboration pattern...",
    "Audience insight..."
  ]
})
\`\`\`

**Tip:** Insights can come from:
- Answers to brainstorm questions
- Conversation with Claude about the skill
- Your own domain knowledge`,
        },
      ],
    };
  }

  // Categorize insights by area
  const categorizedInsights: Record<string, string[]> = {
    identity: [],
    boundaries: [],
    edges: [],
    collaboration: [],
    audience: [],
    uncategorized: [],
  };

  input.insights.forEach((insight) => {
    const lowerInsight = insight.toLowerCase();
    if (
      lowerInsight.includes('[identity]') ||
      lowerInsight.includes('persona') ||
      lowerInsight.includes('expert') ||
      lowerInsight.includes('opinion')
    ) {
      categorizedInsights.identity.push(insight.replace(/\[identity\]/i, '').trim());
    } else if (
      lowerInsight.includes('[boundaries]') ||
      lowerInsight.includes('owns') ||
      lowerInsight.includes('delegate') ||
      lowerInsight.includes('hand off')
    ) {
      categorizedInsights.boundaries.push(insight.replace(/\[boundaries\]/i, '').trim());
    } else if (
      lowerInsight.includes('[edges]') ||
      lowerInsight.includes('gotcha') ||
      lowerInsight.includes('mistake') ||
      lowerInsight.includes('painful')
    ) {
      categorizedInsights.edges.push(insight.replace(/\[edges\]/i, '').trim());
    } else if (
      lowerInsight.includes('[collaboration]') ||
      lowerInsight.includes('pairs') ||
      lowerInsight.includes('works with') ||
      lowerInsight.includes('other skill')
    ) {
      categorizedInsights.collaboration.push(insight.replace(/\[collaboration\]/i, '').trim());
    } else if (
      lowerInsight.includes('[audience]') ||
      lowerInsight.includes('user') ||
      lowerInsight.includes('developer') ||
      lowerInsight.includes('target')
    ) {
      categorizedInsights.audience.push(insight.replace(/\[audience\]/i, '').trim());
    } else {
      categorizedInsights.uncategorized.push(insight);
    }
  });

  const skillIdea = input.skill_idea || 'Skill';

  const output = `# 🧠 Brainstorm Synthesis: ${skillIdea}

## Insights Summary

${Object.entries(categorizedInsights)
  .filter(([_, insights]) => insights.length > 0)
  .map(([area, insights]) => {
    const areaInfo = BRAINSTORM_AREAS[area as keyof typeof BRAINSTORM_AREAS] || {
      icon: '📝',
      name: 'Uncategorized',
    };
    return `### ${areaInfo.icon} ${areaInfo.name}
${insights.map((i) => `- ${i}`).join('\n')}`;
  })
  .join('\n\n')}

---

## Coverage Assessment

${Object.entries(BRAINSTORM_AREAS)
  .map(([key, area]) => {
    const insights = categorizedInsights[key] || [];
    const status =
      insights.length >= 3 ? '✅ Well covered' : insights.length > 0 ? '🔶 Partially covered' : '❌ Not covered';
    return `- ${area.icon} ${area.name}: ${status} (${insights.length} insights)`;
  })
  .join('\n')}

---

## Readiness for Pipeline

${
  Object.values(categorizedInsights).flat().length >= 10
    ? `✅ **Ready to proceed!** You have ${Object.values(categorizedInsights).flat().length} insights captured.

The automated pipeline will use these insights to:
1. Guide research toward gaps and opportunities
2. Shape the skill identity
3. Prioritize sharp edges
4. Define collaboration patterns

**Export for pipeline:**
\`\`\`
spawner_skill_brainstorm({
  action: "export",
  skill_idea: "${skillIdea}",
  insights: ${JSON.stringify(input.insights, null, 2)}
})
\`\`\``
    : `🔶 **Consider exploring more areas.** You have ${Object.values(categorizedInsights).flat().length} insights.

Aim for at least 10 insights across all areas for a well-defined skill.

**Explore uncovered areas:**
${Object.entries(BRAINSTORM_AREAS)
  .filter(([key]) => (categorizedInsights[key] || []).length === 0)
  .map(([key, area]) => `- \`area: "${key}"\` - ${area.name}`)
  .join('\n')}`
}`;

  return { content: [{ type: 'text', text: output }] };
}

function handleExport(input: BrainstormInput): {
  content: Array<{ type: 'text'; text: string }>;
} {
  if (!input.insights || input.insights.length === 0) {
    return {
      content: [
        {
          type: 'text',
          text: `# Export Requires Insights

Please synthesize your brainstorming first:

\`\`\`
spawner_skill_brainstorm({
  action: "synthesize",
  skill_idea: "Your skill",
  insights: [...]
})
\`\`\`

Then export the results.`,
        },
      ],
    };
  }

  const skillIdea = input.skill_idea || 'Skill';

  // Generate research input from insights
  const researchInput = {
    skill_idea: skillIdea,
    category: input.category || 'development',
    brainstorm_insights: input.insights,
    focus_areas: {
      identity_hints: input.insights.filter(
        (i) =>
          i.toLowerCase().includes('identity') ||
          i.toLowerCase().includes('persona') ||
          i.toLowerCase().includes('opinion')
      ),
      boundary_hints: input.insights.filter(
        (i) =>
          i.toLowerCase().includes('owns') ||
          i.toLowerCase().includes('boundary') ||
          i.toLowerCase().includes('delegate')
      ),
      edge_hints: input.insights.filter(
        (i) =>
          i.toLowerCase().includes('gotcha') ||
          i.toLowerCase().includes('mistake') ||
          i.toLowerCase().includes('edge')
      ),
      collaboration_hints: input.insights.filter(
        (i) =>
          i.toLowerCase().includes('pairs') ||
          i.toLowerCase().includes('collaborate') ||
          i.toLowerCase().includes('works with')
      ),
    },
  };

  const output = `# 📤 Brainstorm Export: ${skillIdea}

## Ready for Automated Pipeline

Your brainstorming session has been synthesized and is ready to feed into the automated skill creation pipeline.

---

## Research Input Package

\`\`\`json
${JSON.stringify(researchInput, null, 2)}
\`\`\`

---

## Next Step: Start Research

The research phase will use your insights to:
1. Focus on gaps you identified
2. Validate your strong opinions
3. Find additional sharp edges
4. Discover collaboration opportunities

**Start the automated pipeline:**
\`\`\`
spawner_skill_research({
  skill_idea: "${skillIdea}",
  category: "${input.category || 'development'}",
  brainstorm_insights: ${JSON.stringify(input.insights)}
})
\`\`\`

---

## Pipeline Flow

\`\`\`
[✓] spawner_skill_brainstorm  ← You are here
    ↓
[ ] spawner_skill_research    ← Next
    ↓
[ ] spawner_skill_new
    ↓
[ ] spawner_skill_score
\`\`\`

The remaining steps are automated. The research phase will complete, then automatically feed into skill generation, which will be scored against our 100-point rubric.`;

  return { content: [{ type: 'text', text: output }] };
}
