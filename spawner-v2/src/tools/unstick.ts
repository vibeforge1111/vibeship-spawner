/**
 * spawner_unstick Tool
 *
 * Analyze stuck situation and provide alternative approaches.
 */

import { z } from 'zod';
import type { Env, UnstickInput, UnstickOutput, AttemptPattern } from '../types';
import { emitEvent } from '../telemetry/events';

/**
 * Input schema for spawner_unstick
 */
export const unstickInputSchema = z.object({
  task_description: z.string().describe(
    'Description of what you\'re trying to accomplish'
  ),
  attempts: z.array(z.string()).describe(
    'List of approaches you\'ve already tried'
  ),
  errors: z.array(z.string()).describe(
    'Error messages or symptoms you\'ve encountered'
  ),
  current_code: z.string().optional().describe(
    'Current code that\'s not working (if applicable)'
  ),
});

/**
 * Tool definition for MCP
 */
export const unstickToolDefinition = {
  name: 'spawner_unstick',
  description: 'Analyze a stuck situation and provide alternative approaches. Use this when you\'ve tried multiple solutions without success.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      task_description: {
        type: 'string',
        description: 'Description of what you\'re trying to accomplish',
      },
      attempts: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of approaches you\'ve already tried',
      },
      errors: {
        type: 'array',
        items: { type: 'string' },
        description: 'Error messages or symptoms you\'ve encountered',
      },
      current_code: {
        type: 'string',
        description: 'Current code that\'s not working (if applicable)',
      },
    },
    required: ['task_description', 'attempts', 'errors'],
  },
};

/**
 * Execute the spawner_unstick tool
 */
export async function executeUnstick(
  env: Env,
  input: UnstickInput,
  projectId?: string
): Promise<UnstickOutput> {
  // Validate input
  const parsed = unstickInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      diagnosis: `Invalid input: ${parsed.error.message}`,
      attempts_analyzed: { count: 0, pattern: 'unknown', circular: false },
      alternatives: [],
      should_reset: false,
      reset_reason: null,
      _instruction: 'Please provide valid task_description, attempts, and errors.',
    };
  }

  const { task_description, attempts, errors } = parsed.data;

  // 1. Analyze the pattern of attempts
  const attemptPatterns = analyzeAttempts(attempts);

  // 2. Generate diagnosis
  const diagnosis = generateDiagnosis(task_description, attemptPatterns, errors);

  // 3. Generate alternatives based on the situation
  const alternatives = generateAlternatives(task_description, attempts, errors);

  // 4. Determine if reset is recommended
  const shouldReset = attempts.length >= 3 && attemptPatterns.circular;

  // 5. Emit telemetry
  await emitEvent(
    env.DB,
    'escape_hatch_trigger',
    {
      task: task_description,
      attempt_count: attempts.length,
      pattern: attemptPatterns.type,
      circular: attemptPatterns.circular,
    },
    projectId
  );

  // 6. Build instruction
  const instruction = buildInstruction(diagnosis, alternatives.length, shouldReset);

  return {
    diagnosis,
    attempts_analyzed: {
      count: attempts.length,
      pattern: attemptPatterns.type,
      circular: attemptPatterns.circular,
    },
    alternatives: alternatives.map((alt, i) => ({
      approach: alt.approach,
      tradeoff: alt.tradeoff,
      recommended: i === 0,
      requires_handoff: alt.handoffTo,
    })),
    should_reset: shouldReset,
    reset_reason: shouldReset
      ? 'Code has accumulated patches that make it harder to reason about. Starting fresh with a clear approach will be faster.'
      : null,
    _instruction: instruction,
  };
}

/**
 * Analyze attempts to detect patterns
 */
function analyzeAttempts(attempts: string[]): AttemptPattern {
  if (attempts.length === 0) {
    return { type: 'exploratory', circular: false, similarity: 0 };
  }

  // Calculate similarity between attempts
  const similarity = calculateSimilarity(attempts);

  return {
    type: similarity > 0.7 ? 'circular' : 'exploratory',
    circular: similarity > 0.7,
    similarity,
  };
}

/**
 * Calculate average similarity between attempt descriptions
 */
function calculateSimilarity(attempts: string[]): number {
  if (attempts.length < 2) return 0;

  // Simple word overlap calculation
  const wordSets = attempts.map(a =>
    new Set(a.toLowerCase().split(/\s+/).filter(w => w.length > 3))
  );

  let totalSimilarity = 0;
  let comparisons = 0;

  for (let i = 0; i < wordSets.length; i++) {
    for (let j = i + 1; j < wordSets.length; j++) {
      const set1 = wordSets[i];
      const set2 = wordSets[j];

      if (!set1 || !set2) continue;

      const intersection = new Set([...set1].filter(x => set2.has(x)));
      const union = new Set([...set1, ...set2]);

      if (union.size > 0) {
        totalSimilarity += intersection.size / union.size;
        comparisons++;
      }
    }
  }

  return comparisons > 0 ? totalSimilarity / comparisons : 0;
}

/**
 * Generate a diagnosis based on the situation
 */
function generateDiagnosis(
  task: string,
  patterns: AttemptPattern,
  errors: string[]
): string {
  if (patterns.circular) {
    return 'We\'re trying variations of the same approach. The core issue isn\'t being addressed by these attempts.';
  }

  // Look for common error patterns
  const errorText = errors.join(' ').toLowerCase();

  if (errorText.includes('hydration')) {
    return 'This is a server/client boundary issue. The component is rendering differently on server vs client.';
  }

  if (errorText.includes('async') || errorText.includes('await')) {
    return 'This involves async/await patterns that may not work in this context (e.g., Client Components).';
  }

  if (errorText.includes('undefined') || errorText.includes('cannot read property')) {
    return 'Data is undefined at some point in the flow. Check the data fetching sequence and component rendering order.';
  }

  if (errorText.includes('module') || errorText.includes('import')) {
    return 'This is a module resolution issue. The import may not be compatible with the current environment.';
  }

  if (errorText.includes('type') || errorText.includes('typescript')) {
    return 'This is a TypeScript type issue. The types don\'t match what the code expects.';
  }

  if (errorText.includes('cors') || errorText.includes('cross-origin')) {
    return 'This is a CORS issue. The server needs to allow requests from your origin.';
  }

  return `After ${patterns.similarity > 0.5 ? 'similar' : 'different'} attempts, the task "${task}" remains unresolved. Let\'s try a different approach.`;
}

/**
 * Generate alternative approaches
 */
function generateAlternatives(
  task: string,
  attempts: string[],
  errors: string[]
): { approach: string; tradeoff: string; handoffTo?: string }[] {
  const errorText = errors.join(' ').toLowerCase();
  const alternatives: { approach: string; tradeoff: string; handoffTo?: string }[] = [];

  // General alternatives based on error patterns
  if (errorText.includes('hydration')) {
    alternatives.push({
      approach: 'Move the dynamic content to a Client Component and use useEffect for client-only logic',
      tradeoff: 'Slightly more code separation but resolves SSR/CSR mismatch',
    });
    alternatives.push({
      approach: 'Use Suspense with a fallback for the dynamic content',
      tradeoff: 'Better UX with loading states, but requires restructuring',
    });
  }

  if (errorText.includes('async') || errorText.includes('await')) {
    alternatives.push({
      approach: 'Move async logic to a Server Component and pass data as props',
      tradeoff: 'Cleaner separation but requires component restructuring',
    });
    alternatives.push({
      approach: 'Use React Query or SWR for client-side data fetching',
      tradeoff: 'Adds a dependency but provides caching and better DX',
    });
  }

  if (errorText.includes('undefined')) {
    alternatives.push({
      approach: 'Add explicit null checks and fallback values throughout the data flow',
      tradeoff: 'More defensive code but prevents runtime errors',
    });
    alternatives.push({
      approach: 'Restructure to use loading states that prevent rendering until data is ready',
      tradeoff: 'Better UX and type safety at the cost of complexity',
    });
  }

  // Generic alternatives if no specific pattern matched
  if (alternatives.length === 0) {
    alternatives.push({
      approach: 'Simplify the implementation - remove optimizations and start with the most basic version that works',
      tradeoff: 'Less optimal but easier to debug and iterate on',
    });
    alternatives.push({
      approach: 'Break the task into smaller, testable pieces and verify each works independently',
      tradeoff: 'More time upfront but reduces debugging surface',
    });
    alternatives.push({
      approach: 'Check if there\'s an official example or documentation that shows the exact pattern needed',
      tradeoff: 'May require adapting example to your use case',
    });
  }

  // Always add the reset option for circular patterns
  if (attempts.length >= 3) {
    alternatives.push({
      approach: 'Start fresh: delete the problematic code and reimplement with a clear plan',
      tradeoff: 'Loses current work but removes accumulated complexity',
    });
  }

  return alternatives;
}

/**
 * Build the instruction string
 */
function buildInstruction(
  diagnosis: string,
  alternativeCount: number,
  shouldReset: boolean
): string {
  const lines = [
    'We\'ve detected a stuck pattern. Here\'s the situation:',
    '',
    diagnosis,
    '',
    `${alternativeCount} alternative approaches available.`,
  ];

  if (shouldReset) {
    lines.push('Recommend starting fresh after choosing an approach.');
  }

  lines.push('');
  lines.push('Present these options to the user and let them choose direction.');

  return lines.join('\n');
}

/**
 * Create the tool handler
 */
export function unstickTool(env: Env) {
  return {
    definition: unstickToolDefinition,
    execute: (input: UnstickInput, projectId?: string) =>
      executeUnstick(env, input, projectId),
  };
}
