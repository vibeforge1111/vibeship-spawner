/**
 * Pattern Checks
 *
 * Guardrails for catching common anti-patterns and mistakes.
 */

import type { Check } from '../../types';

/**
 * Next.js App Router specific checks
 */
export const nextjsChecks: Check[] = [
  {
    id: 'nextjs-async-client-component',
    name: 'Async Client Component',
    severity: 'error',
    type: 'regex',
    pattern: [
      // "use client" followed by async function/export
      '["\'"]use client["\'"]\\s*;?[\\s\\S]{0,200}export\\s+(?:default\\s+)?async\\s+function',
      '["\'"]use client["\'"]\\s*;?[\\s\\S]{0,200}async\\s+function\\s+\\w+',
    ],
    message: 'Client Components cannot be async. Move data fetching to a Server Component or use useEffect.',
    auto_fix: false,
    fix_action: 'Remove async from the component function and use useEffect for client-side data fetching',
    applies_to: ['*.tsx', '*.jsx'],
  },
  {
    id: 'nextjs-server-import-in-client',
    name: 'Server Import in Client',
    severity: 'error',
    type: 'regex',
    pattern: [
      '["\'"]use client["\'"][\\s\\S]*import[^;]*from\\s*["\'](?:fs|path|crypto|child_process)',
      '["\'"]use client["\'"][\\s\\S]*import[^;]*from\\s*["\']next/headers',
    ],
    message: 'Server-only module imported in Client Component. This will fail at runtime.',
    auto_fix: false,
    fix_action: 'Move server imports to a Server Component or API route',
    applies_to: ['*.tsx', '*.jsx'],
  },
  {
    id: 'nextjs-missing-use-server',
    name: 'Missing use server Directive',
    severity: 'warning',
    type: 'regex',
    pattern: [
      // Function that looks like a server action but missing directive
      'export\\s+async\\s+function\\s+\\w+Action\\s*\\([^)]*formData',
    ],
    message: 'Server action may be missing "use server" directive.',
    auto_fix: true,
    fix_action: 'Add "use server" at the top of the function or file',
    applies_to: ['*.ts', '*.tsx'],
  },
  {
    id: 'nextjs-client-cookies',
    name: 'Cookies in Client Component',
    severity: 'error',
    type: 'regex',
    pattern: [
      '["\'"]use client["\'"][\\s\\S]*cookies\\(\\)',
    ],
    message: 'cookies() can only be used in Server Components.',
    auto_fix: false,
    fix_action: 'Move cookie access to a Server Component or use document.cookie',
    applies_to: ['*.tsx', '*.jsx'],
  },
];

/**
 * React specific checks
 */
export const reactChecks: Check[] = [
  {
    id: 'react-missing-key',
    name: 'Missing Key in List',
    severity: 'warning',
    type: 'regex',
    pattern: [
      '\\.map\\s*\\([^)]+\\)\\s*\\.map\\s*\\(',  // Nested maps often miss keys
    ],
    message: 'Ensure all list items have unique keys.',
    auto_fix: false,
    fix_action: 'Add key prop with unique identifier',
    applies_to: ['*.tsx', '*.jsx'],
  },
  {
    id: 'react-hooks-in-condition',
    name: 'Hook in Conditional',
    severity: 'error',
    type: 'regex',
    pattern: [
      'if\\s*\\([^)]*\\)\\s*\\{[^}]*use[A-Z][a-zA-Z]*\\s*\\(',
    ],
    message: 'Hooks cannot be called conditionally. Move outside the conditional.',
    auto_fix: false,
    fix_action: 'Call the hook unconditionally, then conditionally use its result',
    applies_to: ['*.tsx', '*.jsx'],
  },
  {
    id: 'react-state-mutation',
    name: 'Direct State Mutation',
    severity: 'error',
    type: 'regex',
    pattern: [
      '\\.push\\s*\\([^)]*\\)\\s*;?\\s*set[A-Z]',
      '\\.splice\\s*\\([^)]*\\)\\s*;?\\s*set[A-Z]',
    ],
    message: 'Mutating state directly before setState. Create a new array/object instead.',
    auto_fix: false,
    fix_action: 'Use spread operator: setState([...state, newItem])',
    applies_to: ['*.tsx', '*.jsx'],
  },
];

/**
 * TypeScript specific checks
 */
export const typescriptChecks: Check[] = [
  {
    id: 'ts-any-abuse',
    name: 'Excessive any Usage',
    severity: 'warning',
    type: 'regex',
    pattern: [
      ':\\s*any\\b(?!.*\\/\\/.*@ts-)',  // : any not followed by ts- comment
    ],
    message: 'Consider using a more specific type instead of any.',
    auto_fix: false,
    fix_action: 'Define a proper interface or use unknown for truly unknown types',
    applies_to: ['*.ts', '*.tsx'],
  },
  {
    id: 'ts-non-null-assertion',
    name: 'Non-null Assertion',
    severity: 'warning',
    type: 'regex',
    pattern: [
      '[a-zA-Z_$][a-zA-Z0-9_$]*!\\.',
      '[a-zA-Z_$][a-zA-Z0-9_$]*!\\[',
    ],
    message: 'Non-null assertion (!) can hide runtime errors. Add proper null checks.',
    auto_fix: false,
    fix_action: 'Use optional chaining (?.) or add explicit null check',
    applies_to: ['*.ts', '*.tsx'],
  },
];

/**
 * Supabase specific checks
 */
export const supabaseChecks: Check[] = [
  {
    id: 'supabase-missing-rls',
    name: 'Missing RLS Check',
    severity: 'warning',
    type: 'regex',
    pattern: [
      'create\\s+table[^;]*;(?![\\s\\S]*enable\\s+row\\s+level\\s+security)',
    ],
    message: 'Table created without RLS. Consider enabling Row Level Security.',
    auto_fix: false,
    fix_action: 'Add: ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;',
    applies_to: ['*.sql'],
  },
  {
    id: 'supabase-service-role-client',
    name: 'Service Role Key in Client',
    severity: 'critical',
    type: 'regex',
    pattern: [
      'createClient\\s*\\([^)]*SUPABASE_SERVICE_ROLE',
      'createClient\\s*\\([^)]*service_role',
    ],
    message: 'Service role key should never be used in client code.',
    auto_fix: false,
    fix_action: 'Use anon key for client-side, service role only in server/edge functions',
    applies_to: ['*.tsx', '*.jsx', '*.ts', '*.js'],
  },
];

/**
 * Get all pattern checks
 */
export function getPatternChecks(): Check[] {
  return [
    ...nextjsChecks,
    ...reactChecks,
    ...typescriptChecks,
    ...supabaseChecks,
  ];
}

/**
 * Get checks for a specific technology
 */
export function getChecksForTech(tech: string): Check[] {
  switch (tech.toLowerCase()) {
    case 'nextjs':
    case 'next':
      return nextjsChecks;
    case 'react':
      return reactChecks;
    case 'typescript':
    case 'ts':
      return typescriptChecks;
    case 'supabase':
      return supabaseChecks;
    default:
      return [];
  }
}
