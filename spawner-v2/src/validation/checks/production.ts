/**
 * Production Readiness Checks
 *
 * Guardrails for catching issues before deploying to production.
 */

import type { Check } from '../../types';

/**
 * Production readiness checks
 */
export const productionChecks: Check[] = [
  {
    id: 'prod-console-log',
    name: 'Console Log in Production',
    severity: 'warning',
    type: 'regex',
    pattern: [
      'console\\.(?:log|debug|info|warn)\\s*\\(',
    ],
    message: 'console.log found. Remove or replace with proper logging before production.',
    auto_fix: true,
    fix_action: 'Remove console.log or use a logging library with log levels',
    applies_to: ['*.ts', '*.tsx', '*.js', '*.jsx'],
  },
  {
    id: 'prod-todo-comment',
    name: 'TODO Comment',
    severity: 'warning',
    type: 'regex',
    pattern: [
      '\\/\\/\\s*TODO(?!.*\\[done\\])',
      '\\/\\*\\s*TODO',
      '\\/\\/\\s*FIXME',
      '\\/\\/\\s*HACK',
    ],
    message: 'TODO/FIXME comment found. Address before production deployment.',
    auto_fix: false,
    fix_action: 'Complete the TODO or create a tracking issue',
    applies_to: ['*.ts', '*.tsx', '*.js', '*.jsx'],
  },
  {
    id: 'prod-debugger',
    name: 'Debugger Statement',
    severity: 'error',
    type: 'regex',
    pattern: [
      '\\bdebugger\\b\\s*;?',
    ],
    message: 'debugger statement found. Remove before production.',
    auto_fix: true,
    fix_action: 'Remove the debugger statement',
    applies_to: ['*.ts', '*.tsx', '*.js', '*.jsx'],
  },
  {
    id: 'prod-localhost',
    name: 'Hardcoded Localhost',
    severity: 'error',
    type: 'regex',
    pattern: [
      'http:\\/\\/localhost(?::\\d+)?(?!\\/\\/)',
      'http:\\/\\/127\\.0\\.0\\.1',
      '["\'"]localhost["\'"]\\s*:',
    ],
    message: 'Hardcoded localhost found. Use environment variables for URLs.',
    auto_fix: false,
    fix_action: 'Use process.env.NEXT_PUBLIC_API_URL or similar',
    applies_to: ['*.ts', '*.tsx', '*.js', '*.jsx'],
  },
  {
    id: 'prod-disabled-eslint',
    name: 'Disabled ESLint Rule',
    severity: 'warning',
    type: 'regex',
    pattern: [
      'eslint-disable(?!.*-- Approved)',
      '@ts-ignore(?!.*-- Approved)',
      '@ts-nocheck',
    ],
    message: 'Linter rule disabled. Document reason or fix the underlying issue.',
    auto_fix: false,
    fix_action: 'Fix the linting error or document why it\'s disabled',
    applies_to: ['*.ts', '*.tsx', '*.js', '*.jsx'],
  },
  {
    id: 'prod-empty-catch',
    name: 'Empty Catch Block',
    severity: 'error',
    type: 'regex',
    pattern: [
      'catch\\s*\\([^)]*\\)\\s*\\{\\s*\\}',
    ],
    message: 'Empty catch block found. Handle errors or re-throw.',
    auto_fix: false,
    fix_action: 'Log the error, handle it, or re-throw with context',
    applies_to: ['*.ts', '*.tsx', '*.js', '*.jsx'],
  },
  {
    id: 'prod-test-only',
    name: 'Test-only Code',
    severity: 'error',
    type: 'regex',
    pattern: [
      '\\.only\\s*\\(',
      'describe\\.only',
      'it\\.only',
      'test\\.only',
    ],
    message: 'test.only/describe.only found. Remove to run all tests.',
    auto_fix: true,
    fix_action: 'Remove .only to run all tests',
    applies_to: ['*.test.ts', '*.test.tsx', '*.spec.ts', '*.spec.tsx'],
  },
  {
    id: 'prod-skip-test',
    name: 'Skipped Test',
    severity: 'warning',
    type: 'regex',
    pattern: [
      '\\.skip\\s*\\(',
      'describe\\.skip',
      'it\\.skip',
      'test\\.skip',
    ],
    message: 'Skipped test found. Fix or remove the test.',
    auto_fix: false,
    fix_action: 'Fix the test or remove it if no longer needed',
    applies_to: ['*.test.ts', '*.test.tsx', '*.spec.ts', '*.spec.tsx'],
  },
];

/**
 * Get all production checks
 */
export function getProductionChecks(): Check[] {
  return productionChecks;
}
