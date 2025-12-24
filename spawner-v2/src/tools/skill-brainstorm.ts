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
    description: 'Who inspires this skill? Name real people, thought leaders, or iconic figures whose expertise this skill channels.',
    icon: '🧠',
  },
  boundaries: {
    name: 'Stay in Your Lane',
    description: 'What should this skill focus on, and when should it pass the baton to someone else?',
    icon: '🎯',
  },
  edges: {
    name: 'Common Pitfalls',
    description: 'We\'ll walk through typical scenarios together to uncover the "I wish someone told me this" moments.',
    icon: '⚠️',
  },
  collaboration: {
    name: 'Works Well With',
    description: 'How does this skill team up with other skills to get things done?',
    icon: '🤝',
  },
  audience: {
    name: 'Your Personal Touch',
    description: 'Who is this skill for, and what would YOU add to make it truly special? This is your chance to shape it.',
    icon: '✨',
  },
};

// =============================================================================
// Question Banks
// =============================================================================

const IDENTITY_QUESTIONS: BrainstormQuestion[] = [
  {
    id: 'identity-1',
    area: 'identity',
    question: 'Who are 1-3 real people that inspire this skill? Think thought leaders, practitioners, or iconic figures in this space.',
    why: 'Every world-class skill channels the wisdom of masters. Naming them helps define the voice and philosophy.',
    examples: [
      'For a React skill: Dan Abramov, Kent C. Dodds, or Ryan Florence',
      'For a copywriting skill: David Ogilvy, Gary Halbert, or Joanna Wiebe',
      'For a startup skill: Paul Graham, Marc Andreessen, or Naval Ravikant',
    ],
    followUps: [
      'What would each of them say about how to approach this?',
      'Where do they agree? Where do they disagree?',
    ],
  },
  {
    id: 'identity-2',
    area: 'identity',
    question: 'If this skill were a person with 20+ years of experience, what would their journey look like?',
    why: 'Understanding the path helps define what hard-won wisdom this skill carries.',
    examples: [
      'A Next.js expert: "Started with PHP, migrated to React, then SSR, now App Router. Seen every migration pain."',
      'A marketing expert: "Ran 500+ campaigns, burned $1M learning what doesn\'t work, now knows exactly what converts."',
    ],
  },
  {
    id: 'identity-3',
    area: 'identity',
    question: 'What strong opinions does this skill hold that others might disagree with?',
    why: 'Strong opinions backed by experience separate world-class from generic advice.',
    examples: [
      '"Always use server components by default" - controversial but defensible',
      '"Long-form always beats short-form for B2B" - strong stance backed by data',
    ],
  },
  {
    id: 'identity-4',
    area: 'identity',
    question: 'What does this skill refuse to do, even if asked?',
    why: 'Knowing when to say no shows true mastery. What lines won\'t this skill cross?',
    examples: [
      'A database skill refuses to design schemas without understanding access patterns first.',
      'A UX skill refuses to add features without user research.',
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
    question: 'Let\'s walk through a scenario: Someone is just getting started with this. What\'s the FIRST mistake they\'ll probably make?',
    why: 'The beginner\'s first stumble is often the most common pitfall. Catching it early saves hours.',
    examples: [
      'Getting started with Next.js? They\'ll probably make everything a client component.',
      'Setting up Supabase? They\'ll forget to enable Row Level Security.',
      'Writing their first landing page? They\'ll bury the call-to-action below the fold.',
    ],
    followUps: [
      'How would they discover this mistake?',
      'How long would it take them to figure out what went wrong?',
    ],
  },
  {
    id: 'edges-2',
    area: 'edges',
    question: 'Now they\'re a few weeks in and feeling confident. What mistake will bite them next?',
    why: 'The intermediate trap is often more painful because they think they know what they\'re doing.',
    examples: [
      'They\'ll start caching without thinking about invalidation.',
      'They\'ll add features without considering mobile users.',
      'They\'ll optimize for the wrong metric.',
    ],
  },
  {
    id: 'edges-3',
    area: 'edges',
    question: 'They\'re about to launch or go to production. What could go wrong that they haven\'t thought about?',
    why: 'Production surprises are the most expensive. A warning here saves real money and stress.',
    examples: [
      'Their local setup works but production fails silently.',
      'They didn\'t test on slow connections or older devices.',
      'They missed an edge case that only appears at scale.',
    ],
  },
  {
    id: 'edges-4',
    area: 'edges',
    question: 'What "best practice" advice will they follow that will actually hurt them in their specific situation?',
    why: 'Rules have exceptions. Knowing when NOT to follow advice is expert-level knowledge.',
    examples: [
      '"Always normalize your database" - except their app is read-heavy and needs speed.',
      '"Never use !important in CSS" - except they\'re fighting a third-party library.',
      '"Move fast and break things" - except they\'re handling payments or health data.',
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
    question: 'Picture the person who will use this skill. Who are they, and what\'s their day like?',
    why: 'A vivid picture of your user helps the skill speak directly to their situation.',
    examples: [
      'A solo founder juggling 10 things, needs to ship fast without breaking things.',
      'A junior dev on their first job, wants to impress their team lead.',
      'A designer learning to code, frustrated by confusing error messages.',
    ],
  },
  {
    id: 'audience-2',
    area: 'audience',
    question: 'What\'s the ONE thing they\'re trying to accomplish when they reach for this skill?',
    why: 'Knowing their immediate goal helps the skill cut straight to what matters.',
    examples: [
      'Get authentication working TODAY so they can show investors tomorrow.',
      'Fix this bug before the client notices.',
      'Understand why their page is so slow.',
    ],
  },
  {
    id: 'audience-3',
    area: 'audience',
    question: 'Now here\'s YOUR chance to shape this skill. What would YOU add to make it truly special?',
    why: 'This is where YOU put your stamp on it. Your insight, your experience, your magic.',
    examples: [
      'A specific workflow you\'ve perfected over the years.',
      'A mental model that made everything click for you.',
      'A warning about something you learned the hard way.',
      'A philosophy or approach that guides how you work.',
    ],
    followUps: [
      'What do you wish someone had told you when you started?',
      'What makes YOUR approach different from the standard advice?',
    ],
  },
  {
    id: 'audience-4',
    area: 'audience',
    question: 'Is there anything else you\'d like this skill to include? Any special touches?',
    why: 'Your personal additions make this skill uniquely valuable. Don\'t hold back!',
    examples: [
      'A favorite quote or principle that guides you.',
      'A checklist you always run through.',
      'A story about a time this knowledge saved the day.',
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
- Name the experts and thought leaders who inspire this skill
- Decide what the skill should focus on vs. leave to others
- Walk through scenarios to uncover mistakes people make
- Plan how the skill teams up with other skills
- Add YOUR personal touch to make the skill uniquely yours

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

1. **The Expert** - Name the inspirational figures and define the expertise
2. **Stay in Your Lane** - Clarify what it focuses on vs. passes to others
3. **Common Pitfalls** - Walk through scenarios to uncover mistakes to prevent
4. **Works Well With** - Define how it teams up with other skills
5. **Your Personal Touch** - Add YOUR insights to make this skill uniquely yours

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
- \`identity\` - The Expert (who inspires this skill)
- \`boundaries\` - Stay in Your Lane (focus vs. hand off)
- \`edges\` - Common Pitfalls (we'll walk through scenarios together)
- \`collaboration\` - Works Well With (teaming up with other skills)
- \`audience\` - Your Personal Touch (make it uniquely yours)`,
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
    "${questions[0]?.id ?? 'q1'}": "Your answer here",
    "${questions[1]?.id ?? 'q2'}": "Your answer here",
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
      categorizedInsights.identity!.push(insight.replace(/\[identity\]/i, '').trim());
    } else if (
      lowerInsight.includes('[boundaries]') ||
      lowerInsight.includes('owns') ||
      lowerInsight.includes('delegate') ||
      lowerInsight.includes('hand off')
    ) {
      categorizedInsights.boundaries!.push(insight.replace(/\[boundaries\]/i, '').trim());
    } else if (
      lowerInsight.includes('[edges]') ||
      lowerInsight.includes('gotcha') ||
      lowerInsight.includes('mistake') ||
      lowerInsight.includes('painful')
    ) {
      categorizedInsights.edges!.push(insight.replace(/\[edges\]/i, '').trim());
    } else if (
      lowerInsight.includes('[collaboration]') ||
      lowerInsight.includes('pairs') ||
      lowerInsight.includes('works with') ||
      lowerInsight.includes('other skill')
    ) {
      categorizedInsights.collaboration!.push(insight.replace(/\[collaboration\]/i, '').trim());
    } else if (
      lowerInsight.includes('[audience]') ||
      lowerInsight.includes('user') ||
      lowerInsight.includes('developer') ||
      lowerInsight.includes('target')
    ) {
      categorizedInsights.audience!.push(insight.replace(/\[audience\]/i, '').trim());
    } else {
      categorizedInsights.uncategorized!.push(insight);
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
  const category = input.category || 'development';

  // Convert skill idea to kebab-case ID
  const skillId = skillIdea.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

  // Parse insights into structured format for spawner_skill_research
  const brainstormInsights = {
    inspirational_figures: input.insights.filter(
      (i) => i.toLowerCase().includes('inspired by') || i.toLowerCase().includes('like') && i.toLowerCase().includes('expert')
    ),
    identity_notes: input.insights.filter(
      (i) =>
        i.toLowerCase().includes('[identity]') ||
        i.toLowerCase().includes('opinion') ||
        i.toLowerCase().includes('philosophy') ||
        i.toLowerCase().includes('approach')
    ),
    boundaries: {
      owns: input.insights.filter(
        (i) => i.toLowerCase().includes('owns') || i.toLowerCase().includes('focus on')
      ),
      delegates: input.insights.filter(
        (i) => i.toLowerCase().includes('delegate') || i.toLowerCase().includes('hand off') || i.toLowerCase().includes('pass to')
      ),
    },
    pitfalls: input.insights.filter(
      (i) =>
        i.toLowerCase().includes('[edges]') ||
        i.toLowerCase().includes('mistake') ||
        i.toLowerCase().includes('pitfall') ||
        i.toLowerCase().includes('avoid') ||
        i.toLowerCase().includes('wrong')
    ),
    collaborations: input.insights.filter(
      (i) =>
        i.toLowerCase().includes('[collaboration]') ||
        i.toLowerCase().includes('pairs') ||
        i.toLowerCase().includes('works with') ||
        i.toLowerCase().includes('teams up')
    ),
    personal_touches: input.insights.filter(
      (i) =>
        i.toLowerCase().includes('[audience]') ||
        i.toLowerCase().includes('personal') ||
        i.toLowerCase().includes('special') ||
        i.toLowerCase().includes('my') ||
        i.toLowerCase().includes('i ')
    ),
  };

  const output = `# 📤 Brainstorm Export: ${skillIdea}

## Ready for Automated Pipeline

Your brainstorming session has been synthesized and is ready to feed into the automated skill creation pipeline.

✨ **Your personal touches will be incorporated into the skill!**

---

## Brainstorm Insights Summary

**Inspirational Figures:** ${brainstormInsights.inspirational_figures.length > 0 ? brainstormInsights.inspirational_figures.join(', ') : 'None specified'}
**Identity Notes:** ${brainstormInsights.identity_notes.length} captured
**Boundaries:** ${brainstormInsights.boundaries.owns.length} owns, ${brainstormInsights.boundaries.delegates.length} delegates
**Pitfalls:** ${brainstormInsights.pitfalls.length} identified
**Collaborations:** ${brainstormInsights.collaborations.length} noted
**Personal Touches:** ${brainstormInsights.personal_touches.length} added

---

## Next Step: Start Research

The research phase will use your insights to:
1. Focus on gaps you identified
2. Validate your strong opinions
3. Find additional sharp edges
4. Discover collaboration opportunities

**Start the automated pipeline with your insights:**
\`\`\`
spawner_skill_research({
  id: "${skillId}",
  name: "${skillIdea}",
  category: "${category}",
  brainstorm_insights: ${JSON.stringify(brainstormInsights, null, 2)}
})
\`\`\`

---

## Pipeline Flow

\`\`\`
[✓] spawner_skill_brainstorm  ← You are here
    ↓
[ ] spawner_skill_research    ← Next (with your insights!)
    ↓
[ ] spawner_skill_new
    ↓
[ ] spawner_skill_score
\`\`\`

The remaining steps are automated. Your brainstorm insights will flow through the entire pipeline, making this skill uniquely yours.`;

  return { content: [{ type: 'text', text: output }] };
}
