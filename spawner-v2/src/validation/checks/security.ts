/**
 * Security Checks
 *
 * Guardrails for catching security issues before they ship.
 */

import type { Check } from '../../types';

/**
 * Security checks - these are critical and should block
 */
export const securityChecks: Check[] = [
  {
    id: 'sec-hardcoded-secret',
    name: 'Hardcoded Secret',
    severity: 'critical',
    type: 'regex',
    pattern: [
      // API keys with common prefixes
      '(sk|pk)_(live|test)_[a-zA-Z0-9]{20,}',
      // Supabase keys
      'eyJ[a-zA-Z0-9_-]{50,}\\.[a-zA-Z0-9_-]{20,}',
      // Generic API key assignments
      '(api[_-]?key|apikey|secret[_-]?key|auth[_-]?token|access[_-]?token)\\s*[:=]\\s*["\'][a-zA-Z0-9_-]{20,}["\']',
      // AWS keys
      'AKIA[0-9A-Z]{16}',
      // Private keys
      '-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----',
    ],
    message: 'Hardcoded secret detected. Use environment variables instead.',
    auto_fix: false,
    fix_action: 'Replace with process.env.YOUR_SECRET_NAME',
    applies_to: ['*.ts', '*.tsx', '*.js', '*.jsx', '*.json'],
  },
  {
    id: 'sec-exposed-env',
    name: 'Exposed Environment Variable',
    severity: 'error',
    type: 'regex',
    pattern: [
      // Using sensitive env vars in client code
      'process\\.env\\.(?:DATABASE_URL|SUPABASE_SERVICE_ROLE_KEY|OPENAI_API_KEY|STRIPE_SECRET_KEY)',
    ],
    message: 'Sensitive environment variable may be exposed to client. Use NEXT_PUBLIC_ prefix only for public values.',
    auto_fix: false,
    fix_action: 'Move to server-side code or use a public variant',
    applies_to: ['*.tsx', '*.jsx'],
  },
  {
    id: 'sec-sql-injection',
    name: 'Potential SQL Injection',
    severity: 'critical',
    type: 'regex',
    pattern: [
      // String interpolation in SQL
      '(query|execute|run)\\s*\\(\\s*`[^`]*\\$\\{',
      // Direct concatenation
      '\\.(?:query|execute|run)\\s*\\([^)]*\\+\\s*(?:req|request|params|body)',
    ],
    message: 'Potential SQL injection vulnerability. Use parameterized queries.',
    auto_fix: false,
    fix_action: 'Use prepared statements with parameter placeholders',
    applies_to: ['*.ts', '*.js'],
  },
  {
    id: 'sec-unsafe-eval',
    name: 'Unsafe eval Usage',
    severity: 'critical',
    type: 'regex',
    pattern: [
      '\\beval\\s*\\(',
      'new\\s+Function\\s*\\([^)]*\\+',
    ],
    message: 'eval() or Function constructor with dynamic input is unsafe.',
    auto_fix: false,
    fix_action: 'Use safer alternatives like JSON.parse for data parsing',
    applies_to: ['*.ts', '*.tsx', '*.js', '*.jsx'],
  },
  {
    id: 'sec-insecure-cookie',
    name: 'Insecure Cookie',
    severity: 'error',
    type: 'regex',
    pattern: [
      'document\\.cookie\\s*=(?![^;]*secure)',
      'setCookie\\s*\\([^)]*(?!secure)',
    ],
    message: 'Cookie set without secure flag. Add secure: true for production.',
    auto_fix: false,
    fix_action: 'Add secure: true and httpOnly: true to cookie options',
    applies_to: ['*.ts', '*.tsx', '*.js', '*.jsx'],
  },
  {
    id: 'sec-xss-innerhtml',
    name: 'Potential XSS via innerHTML',
    severity: 'error',
    type: 'regex',
    pattern: [
      '\\.innerHTML\\s*=(?!\\s*["\'][^"\']*["\']\\s*[;,)])',
      'dangerouslySetInnerHTML\\s*=\\s*\\{\\s*\\{\\s*__html\\s*:(?!\\s*DOMPurify)',
    ],
    message: 'innerHTML with dynamic content may enable XSS. Sanitize input or use textContent.',
    auto_fix: false,
    fix_action: 'Use DOMPurify.sanitize() or textContent for plain text',
    applies_to: ['*.ts', '*.tsx', '*.js', '*.jsx'],
  },
];

/**
 * Get all security checks
 */
export function getSecurityChecks(): Check[] {
  return securityChecks;
}
