/**
 * Orchestration Brainstorm Tool
 *
 * Interactive guide to help users choose the right orchestration pattern.
 * Inspired by the Superpowers skill brainstorming flow, but focused on
 * HOW skills should work together rather than WHAT skills to use.
 *
 * Flow:
 * 1. Understand the goal (what are you building?)
 * 2. Assess complexity (how many moving parts?)
 * 3. Identify dependencies (what needs what?)
 * 4. Recommend pattern (sequential/parallel/supervised/conditional)
 * 5. Suggest team or custom workflow
 */

import type { Env } from '../types.js';
import type { ToolDefinition } from './registry.js';
import { BUILTIN_TEAMS, listTeams, formatTeam } from '../orchestration/teams.js';
import { BUILTIN_WORKFLOWS, listBuiltinWorkflows } from '../orchestration/workflow.js';

// =============================================================================
// Tool Definition
// =============================================================================

export const orchestrateBrainstormDefinition: ToolDefinition = {
  name: 'spawner_orchestrate_brainstorm',
  description: `Interactive guide to choose the right orchestration pattern for your project.

Actions:
- start: Begin brainstorming session with your goal
- answer: Answer a question to refine recommendations
- recommend: Get final recommendation based on answers
- explain: Deep dive into a specific pattern

Example:
- spawner_orchestrate_brainstorm({ action: "start", goal: "Build a game with AI art" })
- spawner_orchestrate_brainstorm({ action: "answer", question_id: "complexity", answer: "medium" })
- spawner_orchestrate_brainstorm({ action: "explain", pattern: "supervised" })`,
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['start', 'answer', 'recommend', 'explain'],
        description: 'Action to perform'
      },
      goal: {
        type: 'string',
        description: 'What you want to build (for start action)'
      },
      question_id: {
        type: 'string',
        description: 'ID of question being answered'
      },
      answer: {
        type: 'string',
        description: 'Your answer to the question'
      },
      pattern: {
        type: 'string',
        enum: ['sequential', 'parallel', 'conditional', 'supervised', 'hub-spoke', 'pipeline'],
        description: 'Pattern to explain (for explain action)'
      },
      context: {
        type: 'object',
        description: 'Previous answers and state'
      }
    },
    required: ['action']
  }
};

// =============================================================================
// Types
// =============================================================================

export interface BrainstormContext {
  goal?: string;
  answers: Record<string, string>;
  detected_patterns: string[];
  recommended_team?: string;
  recommended_workflow?: string;
  stage: 'goal' | 'complexity' | 'dependencies' | 'quality' | 'speed' | 'recommend';
}

export interface BrainstormQuestion {
  id: string;
  question: string;
  why: string;
  options: Array<{
    value: string;
    label: string;
    description: string;
    implies?: string[];  // Patterns this answer suggests
  }>;
}

export interface BrainstormOutput {
  success: boolean;
  action: string;
  stage?: string;
  question?: BrainstormQuestion;
  recommendation?: {
    pattern: string;
    team?: string;
    workflow?: string;
    explanation: string;
    next_steps: string[];
  };
  context?: BrainstormContext;
  message: string;
}

// =============================================================================
// Question Bank
// =============================================================================

const QUESTIONS: Record<string, BrainstormQuestion> = {
  complexity: {
    id: 'complexity',
    question: 'How complex is what you\'re building?',
    why: 'Complexity determines whether you need simple sequential flow or sophisticated orchestration.',
    options: [
      {
        value: 'simple',
        label: 'Simple',
        description: 'One main thing to build, maybe 1-2 skills needed',
        implies: ['sequential']
      },
      {
        value: 'medium',
        label: 'Medium',
        description: 'Multiple parts that connect together (API + frontend, game + art)',
        implies: ['sequential', 'pipeline']
      },
      {
        value: 'complex',
        label: 'Complex',
        description: 'Many moving parts, some can happen at the same time',
        implies: ['parallel', 'hub-spoke']
      },
      {
        value: 'critical',
        label: 'Critical/Regulated',
        description: 'Needs quality checks, security audits, or compliance',
        implies: ['supervised']
      }
    ]
  },

  dependencies: {
    id: 'dependencies',
    question: 'How do the parts depend on each other?',
    why: 'Dependencies determine if work can happen in parallel or must be sequential.',
    options: [
      {
        value: 'linear',
        label: 'One after another',
        description: 'Each step needs the previous step\'s output (design -> build -> test)',
        implies: ['sequential', 'pipeline']
      },
      {
        value: 'independent',
        label: 'Mostly independent',
        description: 'Parts can be built separately and merged at the end',
        implies: ['parallel']
      },
      {
        value: 'mixed',
        label: 'Mixed',
        description: 'Some parts depend on others, some are independent',
        implies: ['conditional', 'hub-spoke']
      },
      {
        value: 'iterative',
        label: 'Iterative/Feedback loops',
        description: 'Work bounces back and forth until quality is met',
        implies: ['supervised']
      }
    ]
  },

  quality: {
    id: 'quality',
    question: 'How important is quality validation?',
    why: 'High-stakes work needs quality gates; fast experiments don\'t.',
    options: [
      {
        value: 'ship_fast',
        label: 'Ship fast',
        description: 'Prototype, experiment, learning project - speed over perfection',
        implies: ['sequential', 'parallel']
      },
      {
        value: 'balanced',
        label: 'Balanced',
        description: 'Want quality but not at extreme cost - reasonable checks',
        implies: ['pipeline']
      },
      {
        value: 'high_quality',
        label: 'High quality',
        description: 'Production app, paying users - needs thorough validation',
        implies: ['supervised']
      },
      {
        value: 'critical',
        label: 'Mission critical',
        description: 'Security-sensitive, regulated, or high-stakes - multiple review stages',
        implies: ['supervised']
      }
    ]
  },

  speed: {
    id: 'speed',
    question: 'What\'s your timeline?',
    why: 'Time pressure affects whether you can afford parallel work or need to keep it simple.',
    options: [
      {
        value: 'hours',
        label: 'Hours (game jam, hackathon)',
        description: 'Need something working TODAY',
        implies: ['sequential']
      },
      {
        value: 'days',
        label: 'Days (side project, MVP)',
        description: 'This week, keep momentum',
        implies: ['sequential', 'pipeline']
      },
      {
        value: 'weeks',
        label: 'Weeks (real product)',
        description: 'Proper development cycle, can parallelize',
        implies: ['parallel', 'hub-spoke']
      },
      {
        value: 'ongoing',
        label: 'Ongoing (enterprise, platform)',
        description: 'Long-term project with quality gates',
        implies: ['supervised', 'hub-spoke']
      }
    ]
  }
};

const QUESTION_ORDER = ['complexity', 'dependencies', 'quality', 'speed'];

// =============================================================================
// Pattern Explanations
// =============================================================================

const PATTERN_EXPLANATIONS: Record<string, {
  name: string;
  tagline: string;
  when_to_use: string[];
  how_it_works: string;
  example: string;
  pros: string[];
  cons: string[];
}> = {
  sequential: {
    name: 'Sequential',
    tagline: 'One step at a time, like a recipe',
    when_to_use: [
      'Simple projects with clear order',
      'When each step needs previous output',
      'Fast prototypes (game jams, hackathons)',
      'Learning or exploring'
    ],
    how_it_works: `Skills execute one after another. Each skill receives data from the previous skill and passes data to the next.

\`\`\`
[Design] --> [Backend] --> [Frontend] --> [Test]
\`\`\``,
    example: 'Building a landing page: Design -> Build -> Deploy',
    pros: ['Simple to understand', 'Easy to debug', 'Clear progress tracking'],
    cons: ['Slower for complex projects', 'Bottleneck if one step is slow']
  },

  parallel: {
    name: 'Parallel',
    tagline: 'Multiple things at once, merge at the end',
    when_to_use: [
      'Independent workstreams',
      'Large projects with multiple specialists',
      'When speed matters and resources are available',
      'Marketing launch (copy + design + video simultaneously)'
    ],
    how_it_works: `Multiple skills work at the same time on different parts. Results are merged when all complete.

\`\`\`
        /--> [Backend] --\\
[Plan] --+--> [Frontend] --+--> [Integrate]
        \\--> [Mobile]   --/
\`\`\``,
    example: 'Full-stack feature: Backend + Frontend + Tests in parallel, integrate at end',
    pros: ['Faster overall', 'Good for large teams', 'Skills don\'t block each other'],
    cons: ['More complex coordination', 'Risk of integration issues', 'Needs clear contracts']
  },

  conditional: {
    name: 'Conditional',
    tagline: 'Choose the path based on the situation',
    when_to_use: [
      'When the approach depends on what you discover',
      'Multiple valid paths through a project',
      'Feature flags or A/B implementations',
      'Error handling with fallbacks'
    ],
    how_it_works: `Skills are chosen based on conditions in the current state. Different paths for different situations.

\`\`\`
             /-- if mobile --> [Mobile Dev]
[Analyze] --+--- if web --> [Web Dev]
             \\-- if both --> [Cross-Platform]
\`\`\``,
    example: 'Platform detection: If iOS, use Swift skill; if Android, use Kotlin skill',
    pros: ['Flexible', 'Handles edge cases', 'Efficient resource use'],
    cons: ['More complex to design', 'Testing all paths is harder']
  },

  supervised: {
    name: 'Supervised (Generator-Critic)',
    tagline: 'Build, review, iterate until it\'s right',
    when_to_use: [
      'Quality is critical',
      'Security-sensitive code',
      'Production systems with real users',
      'Regulated industries (fintech, healthcare)'
    ],
    how_it_works: `A generator skill creates output, a critic skill reviews it. If review fails, generator tries again until quality gate passes.

\`\`\`
[Generator] --> [Critic] --> Pass? --> Yes --> [Next Step]
     ^              |
     |              No
     \\--------------/
\`\`\``,
    example: 'Security audit: Code generation -> Security review -> Fix issues -> Re-review until clean',
    pros: ['High quality output', 'Catches issues early', 'Builds confidence'],
    cons: ['Slower', 'More iterations', 'Needs good quality criteria']
  },

  'hub-spoke': {
    name: 'Hub-Spoke (Hierarchical)',
    tagline: 'One lead skill coordinates the others',
    when_to_use: [
      'Complex projects needing coordination',
      'When one skill naturally leads (architect, PM)',
      'AI product teams (LLM architect leads)',
      'Startup MVP (founder mode leads)'
    ],
    how_it_works: `A lead skill coordinates and delegates to specialist skills. Lead maintains overview and integrates results.

\`\`\`
           /--> [Backend Specialist]
[Lead] ---+--> [Frontend Specialist]
           \\--> [DevOps Specialist]
\`\`\``,
    example: 'AI product: LLM Architect leads, delegates to Backend, Frontend, Prompt Engineering',
    pros: ['Clear leadership', 'Good for complex projects', 'Coherent vision'],
    cons: ['Lead can become bottleneck', 'Requires strong lead skill']
  },

  pipeline: {
    name: 'Pipeline',
    tagline: 'Assembly line with clear handoffs',
    when_to_use: [
      'Well-defined stages',
      'Each stage transforms and passes on',
      'Data processing flows',
      'Content creation pipelines'
    ],
    how_it_works: `Like a factory assembly line. Each skill adds something and passes to the next. Clear input/output contracts.

\`\`\`
[Raw Idea] --> [Design] --> [Implement] --> [Test] --> [Deploy]
\`\`\``,
    example: 'Feature build: Requirements -> Design -> Code -> Review -> Deploy',
    pros: ['Clear flow', 'Easy to add stages', 'Good for repeatable processes'],
    cons: ['Linear bottleneck', 'Rigid structure']
  }
};

// =============================================================================
// Executor
// =============================================================================

export async function executeOrchestrateBrainstorm(
  _env: Env,
  input: {
    action: 'start' | 'answer' | 'recommend' | 'explain';
    goal?: string;
    question_id?: string;
    answer?: string;
    pattern?: string;
    context?: BrainstormContext;
  }
): Promise<BrainstormOutput> {
  switch (input.action) {
    case 'start':
      return handleStart(input.goal);

    case 'answer':
      return handleAnswer(input.question_id, input.answer, input.context);

    case 'recommend':
      return handleRecommend(input.context);

    case 'explain':
      return handleExplain(input.pattern);

    default:
      return {
        success: false,
        action: input.action,
        message: `Unknown action: ${input.action}`
      };
  }
}

function handleStart(goal?: string): BrainstormOutput {
  const context: BrainstormContext = {
    goal: goal || '',
    answers: {},
    detected_patterns: [],
    stage: 'complexity'
  };

  // Try to auto-detect team from goal
  if (goal) {
    const goalLower = goal.toLowerCase();
    for (const [teamId, team] of Object.entries(BUILTIN_TEAMS)) {
      if (team.triggers.some(t => goalLower.includes(t))) {
        context.recommended_team = teamId;
        break;
      }
    }
  }

  const firstQuestion = QUESTIONS['complexity']!;

  return {
    success: true,
    action: 'start',
    stage: 'complexity',
    question: firstQuestion,
    context,
    message: formatStartMessage(goal, context.recommended_team, firstQuestion)
  };
}

function handleAnswer(
  questionId?: string,
  answer?: string,
  context?: BrainstormContext
): BrainstormOutput {
  if (!questionId || !answer || !context) {
    return {
      success: false,
      action: 'answer',
      message: 'Missing question_id, answer, or context'
    };
  }

  const question = QUESTIONS[questionId];
  if (!question) {
    return {
      success: false,
      action: 'answer',
      message: `Unknown question: ${questionId}`
    };
  }

  // Record answer and update detected patterns
  const updatedContext = { ...context };
  updatedContext.answers[questionId] = answer;

  const selectedOption = question.options.find(o => o.value === answer);
  if (selectedOption?.implies) {
    updatedContext.detected_patterns = [
      ...new Set([...updatedContext.detected_patterns, ...selectedOption.implies])
    ];
  }

  // Find next question
  const currentIndex = QUESTION_ORDER.indexOf(questionId);
  const nextQuestionId = QUESTION_ORDER[currentIndex + 1];

  if (nextQuestionId) {
    const nextQuestion = QUESTIONS[nextQuestionId];
    if (!nextQuestion) {
      return handleRecommend(updatedContext);
    }
    updatedContext.stage = nextQuestionId as BrainstormContext['stage'];

    return {
      success: true,
      action: 'answer',
      stage: nextQuestionId,
      question: nextQuestion,
      context: updatedContext,
      message: formatQuestionMessage(nextQuestion, updatedContext)
    };
  }

  // No more questions - generate recommendation
  return handleRecommend(updatedContext);
}

function handleRecommend(context?: BrainstormContext): BrainstormOutput {
  if (!context) {
    return {
      success: false,
      action: 'recommend',
      message: 'No context provided. Start a brainstorming session first.'
    };
  }

  // Score patterns based on how often they appeared
  const patternScores: Record<string, number> = {};
  for (const pattern of context.detected_patterns) {
    patternScores[pattern] = (patternScores[pattern] || 0) + 1;
  }

  // Find best pattern
  const sortedPatterns = Object.entries(patternScores)
    .sort((a, b) => b[1] - a[1]);

  const recommendedPattern = sortedPatterns[0]?.[0] || 'sequential';
  const patternInfo = PATTERN_EXPLANATIONS[recommendedPattern];

  // Find matching team and workflow
  let matchedTeam: string | undefined;
  let matchedWorkflow: string | undefined;

  // Check if we already detected a team from the goal
  if (context.recommended_team) {
    matchedTeam = context.recommended_team;
  }

  // Find workflow that uses recommended pattern
  for (const [workflowId, workflow] of Object.entries(BUILTIN_WORKFLOWS)) {
    if (workflow.mode === recommendedPattern ||
        (recommendedPattern === 'pipeline' && workflow.mode === 'sequential')) {
      matchedWorkflow = workflowId;
      break;
    }
  }

  const recommendation = {
    pattern: recommendedPattern,
    team: matchedTeam,
    workflow: matchedWorkflow,
    explanation: patternInfo?.tagline || recommendedPattern,
    next_steps: generateNextSteps(recommendedPattern, matchedTeam, matchedWorkflow)
  };

  return {
    success: true,
    action: 'recommend',
    stage: 'recommend',
    recommendation,
    context: { ...context, stage: 'recommend' },
    message: formatRecommendation(context, recommendation, patternInfo)
  };
}

function handleExplain(pattern?: string): BrainstormOutput {
  if (!pattern) {
    return {
      success: false,
      action: 'explain',
      message: 'No pattern specified. Choose: sequential, parallel, conditional, supervised, hub-spoke, or pipeline'
    };
  }

  const info = PATTERN_EXPLANATIONS[pattern];
  if (!info) {
    return {
      success: false,
      action: 'explain',
      message: `Unknown pattern: ${pattern}`
    };
  }

  return {
    success: true,
    action: 'explain',
    message: formatPatternExplanation(info)
  };
}

// =============================================================================
// Message Formatters
// =============================================================================

function formatStartMessage(
  goal: string | undefined,
  detectedTeam: string | undefined,
  firstQuestion: BrainstormQuestion
): string {
  const lines: string[] = [];

  lines.push('## Orchestration Brainstorm');
  lines.push('');
  lines.push('Let\'s figure out the best way to orchestrate your project.');
  lines.push('');

  if (goal) {
    lines.push(`**Goal:** ${goal}`);
    lines.push('');
  }

  if (detectedTeam) {
    const team = BUILTIN_TEAMS[detectedTeam];
    if (team) {
      lines.push(`> I noticed this sounds like a **${team.name}** project!`);
      lines.push(`> Skills: ${team.skills.join(', ')}`);
      lines.push('');
    }
  }

  lines.push('I\'ll ask a few questions to recommend the right orchestration pattern.');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push(`### ${firstQuestion.question}`);
  lines.push('');
  lines.push(`*${firstQuestion.why}*`);
  lines.push('');

  for (const opt of firstQuestion.options) {
    lines.push(`- **${opt.label}**: ${opt.description}`);
  }

  lines.push('');
  lines.push('*Answer with: simple, medium, complex, or critical*');

  return lines.join('\n');
}

function formatQuestionMessage(
  question: BrainstormQuestion,
  context: BrainstormContext
): string {
  const lines: string[] = [];

  const answeredCount = Object.keys(context.answers).length;
  const totalQuestions = QUESTION_ORDER.length;

  lines.push(`### Question ${answeredCount + 1}/${totalQuestions}: ${question.question}`);
  lines.push('');
  lines.push(`*${question.why}*`);
  lines.push('');

  for (const opt of question.options) {
    lines.push(`- **${opt.label}**: ${opt.description}`);
  }

  lines.push('');

  if (context.detected_patterns.length > 0) {
    lines.push(`*Leaning toward: ${context.detected_patterns.join(', ')}*`);
  }

  return lines.join('\n');
}

function formatRecommendation(
  context: BrainstormContext,
  recommendation: {
    pattern: string;
    team?: string;
    workflow?: string;
    explanation: string;
    next_steps: string[];
  },
  patternInfo?: typeof PATTERN_EXPLANATIONS[string]
): string {
  const lines: string[] = [];

  lines.push('## Recommendation');
  lines.push('');

  if (context.goal) {
    lines.push(`**For:** ${context.goal}`);
    lines.push('');
  }

  lines.push(`### Recommended Pattern: **${recommendation.pattern.toUpperCase()}**`);
  lines.push('');
  lines.push(`> ${recommendation.explanation}`);
  lines.push('');

  if (patternInfo) {
    lines.push('**Why this pattern?**');
    for (const reason of patternInfo.when_to_use.slice(0, 3)) {
      lines.push(`- ${reason}`);
    }
    lines.push('');
  }

  if (recommendation.team) {
    const team = BUILTIN_TEAMS[recommendation.team];
    if (team) {
      lines.push(`### Suggested Team: **${team.name}**`);
      lines.push('');
      lines.push(`Skills: ${team.skills.join(' -> ')}`);
      lines.push('');
      lines.push('```');
      lines.push(`spawner_workflow({ action: "start_team", team_id: "${recommendation.team}" })`);
      lines.push('```');
      lines.push('');
    }
  }

  if (recommendation.workflow) {
    const workflow = BUILTIN_WORKFLOWS[recommendation.workflow];
    if (workflow) {
      lines.push(`### Or use workflow: **${workflow.name}**`);
      lines.push('');
      lines.push('```');
      lines.push(`spawner_workflow({ action: "start_workflow", workflow_id: "${recommendation.workflow}" })`);
      lines.push('```');
      lines.push('');
    }
  }

  lines.push('### Next Steps');
  lines.push('');
  for (let i = 0; i < recommendation.next_steps.length; i++) {
    lines.push(`${i + 1}. ${recommendation.next_steps[i]}`);
  }

  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push('*Want to learn more about patterns? Use:*');
  lines.push('```');
  lines.push(`spawner_orchestrate_brainstorm({ action: "explain", pattern: "${recommendation.pattern}" })`);
  lines.push('```');

  return lines.join('\n');
}

function formatPatternExplanation(info: typeof PATTERN_EXPLANATIONS[string]): string {
  const lines: string[] = [];

  lines.push(`## ${info.name} Pattern`);
  lines.push('');
  lines.push(`**${info.tagline}**`);
  lines.push('');
  lines.push('### When to Use');
  for (const use of info.when_to_use) {
    lines.push(`- ${use}`);
  }
  lines.push('');

  lines.push('### How It Works');
  lines.push('');
  lines.push(info.how_it_works);
  lines.push('');

  lines.push('### Example');
  lines.push('');
  lines.push(info.example);
  lines.push('');

  lines.push('### Pros');
  for (const pro of info.pros) {
    lines.push(`- ${pro}`);
  }
  lines.push('');

  lines.push('### Cons');
  for (const con of info.cons) {
    lines.push(`- ${con}`);
  }

  return lines.join('\n');
}

function generateNextSteps(
  pattern: string,
  team?: string,
  workflow?: string
): string[] {
  const steps: string[] = [];

  if (team) {
    steps.push(`Start the **${team}** team to get a pre-configured skill group`);
  } else if (workflow) {
    steps.push(`Start the **${workflow}** workflow for a guided process`);
  } else {
    steps.push('Choose skills that match your project needs');
  }

  switch (pattern) {
    case 'sequential':
      steps.push('List your skills in order of dependency');
      steps.push('Start with the first skill and work through the list');
      break;
    case 'parallel':
      steps.push('Identify which parts can be built independently');
      steps.push('Define clear contracts between parallel workstreams');
      steps.push('Plan an integration step at the end');
      break;
    case 'supervised':
      steps.push('Define quality criteria upfront (what does "good" look like?)');
      steps.push('Choose a validator skill for each quality gate');
      steps.push('Plan for iteration - first pass rarely passes review');
      break;
    case 'hub-spoke':
      steps.push('Identify your lead skill (the coordinator)');
      steps.push('List specialist skills that will do focused work');
      steps.push('Define how the lead will integrate results');
      break;
    case 'pipeline':
      steps.push('Map out each stage of transformation');
      steps.push('Define input/output contracts between stages');
      steps.push('Consider adding quality checks between stages');
      break;
    default:
      steps.push('Use `spawner_skills` to find skills for your project');
  }

  steps.push('Use `spawner_emit` to track progress as you work');

  return steps;
}

// =============================================================================
// Register Tool
// =============================================================================

export const orchestrateBrainstormTool = {
  definition: orchestrateBrainstormDefinition,
  execute: async (env: Env, args: Parameters<typeof executeOrchestrateBrainstorm>[1], _userId: string) =>
    executeOrchestrateBrainstorm(env, args)
};
