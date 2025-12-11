/**
 * spawner_validate Tool
 *
 * Run guardrail checks on code to catch issues before shipping.
 */

import { z } from 'zod';
import type { Env, ValidateInput, ValidateOutput, FormattedResult } from '../types';
import { runChecks, formatResult, categorizeResults } from '../validation/runner';
import { getChecksByType } from '../validation/checks';
import { emitEvent } from '../telemetry/events';

/**
 * Input schema for spawner_validate
 */
export const validateInputSchema = z.object({
  code: z.string().describe('The code to validate'),
  file_path: z.string().describe('The file path (used to determine which checks apply)'),
  check_types: z.array(
    z.enum(['security', 'patterns', 'production'])
  ).optional().describe(
    'Types of checks to run. Defaults to all types.'
  ),
});

/**
 * Tool definition for MCP
 */
export const validateToolDefinition = {
  name: 'spawner_validate',
  description: 'Run guardrail checks on code to catch issues before shipping. Checks for security vulnerabilities, anti-patterns, and production readiness.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      code: {
        type: 'string',
        description: 'The code to validate',
      },
      file_path: {
        type: 'string',
        description: 'The file path (used to determine which checks apply)',
      },
      check_types: {
        type: 'array',
        items: {
          type: 'string',
          enum: ['security', 'patterns', 'production'],
        },
        description: 'Types of checks to run. Defaults to all types.',
      },
    },
    required: ['code', 'file_path'],
  },
};

/**
 * Execute the spawner_validate tool
 */
export async function executeValidate(
  env: Env,
  input: ValidateInput,
  userId?: string,
  projectId?: string
): Promise<ValidateOutput> {
  // Validate input with human-friendly error messages
  const parsed = validateInputSchema.safeParse(input);
  if (!parsed.success) {
    // Generate human-friendly error message
    const missingFields: string[] = [];
    if (!input.code) missingFields.push('code');
    if (!input.file_path) missingFields.push('file_path');

    const errorMessage = missingFields.length > 0
      ? `I need ${missingFields.join(' and ')} to check your code`
      : 'I need valid code to check';

    return {
      passed: false,
      summary: errorMessage,
      critical: [],
      errors: [],
      warnings: [],
      what_to_do: 'Pass the code content and the file path so I know which checks to run',
      example: 'spawner_validate({ code: "your code here", file_path: "src/app.tsx" })',
      _instruction: `${errorMessage}. ${missingFields.length > 0 ? `Missing: ${missingFields.join(', ')}` : ''}`,
    };
  }

  const { code, file_path, check_types } = parsed.data;
  const types = check_types ?? ['security', 'patterns', 'production'];

  // Get relevant checks
  const checks = getChecksByType(types);

  // Run validation
  const results = await runChecks(checks, code, file_path);

  // Categorize results
  const { critical, errors, warnings, passed } = categorizeResults(results);

  // Emit telemetry for each failed check
  for (const result of [...critical, ...errors]) {
    await emitEvent(
      env.DB,
      'guardrail_block',
      {
        check_id: result.check_id,
        severity: result.severity,
        file_path,
      },
      projectId
    );
  }

  // Format results
  const formattedCritical = critical.map(formatResult) as FormattedResult[];
  const formattedErrors = errors.map(formatResult) as FormattedResult[];
  const formattedWarnings = warnings.map(formatResult) as FormattedResult[];

  // Determine if passed
  const isPassed = critical.length === 0 && errors.length === 0;

  // Build summary
  const summary = isPassed
    ? `All checks passed${warnings.length > 0 ? ` (${warnings.length} warning${warnings.length !== 1 ? 's' : ''})` : ''}`
    : `Found ${critical.length} critical, ${errors.length} error${errors.length !== 1 ? 's' : ''}, ${warnings.length} warning${warnings.length !== 1 ? 's' : ''}`;

  // Build instruction
  const instruction = buildInstruction(isPassed, formattedCritical, formattedErrors);

  return {
    passed: isPassed,
    summary,
    critical: formattedCritical,
    errors: formattedErrors,
    warnings: formattedWarnings,
    _instruction: instruction,
  };
}

/**
 * Build the instruction string for Claude
 */
function buildInstruction(
  passed: boolean,
  critical: FormattedResult[],
  errors: FormattedResult[]
): string {
  if (passed) {
    return 'Code passed validation. Safe to proceed.';
  }

  const lines = ['Issues found that should be fixed:'];

  for (const issue of critical) {
    lines.push(`CRITICAL: ${issue.message}`);
    if (issue.fix_suggestion) {
      lines.push(`  Fix: ${issue.fix_suggestion}`);
    }
  }

  for (const issue of errors) {
    lines.push(`ERROR: ${issue.message}`);
    if (issue.fix_suggestion) {
      lines.push(`  Fix: ${issue.fix_suggestion}`);
    }
  }

  lines.push('');
  lines.push('Address critical and error issues before proceeding.');
  lines.push('Warnings can be addressed later but review them.');

  return lines.join('\n');
}

/**
 * Create the tool handler
 */
export function validateTool(env: Env) {
  return {
    definition: validateToolDefinition,
    execute: (input: ValidateInput, userId?: string, projectId?: string) =>
      executeValidate(env, input, userId, projectId),
  };
}
