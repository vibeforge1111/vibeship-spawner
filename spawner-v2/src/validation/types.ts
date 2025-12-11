/**
 * Validation System Types
 *
 * Types for code checks, validations, and results.
 */

// =============================================================================
// Check Definition
// =============================================================================

export interface Check {
  id: string;
  name: string;
  severity: 'critical' | 'error' | 'warning';
  type: 'regex' | 'ast' | 'file';
  pattern?: string | string[];
  rule?: string;
  message: string;
  auto_fix?: boolean;
  fix_action?: string;
  applies_to?: string[];  // File patterns (e.g., "*.tsx")
}

// =============================================================================
// Validation Definition (stored in KV as validations:{skill_id})
// =============================================================================

export interface Validation {
  id: string;
  skill_id: string;
  name: string;
  severity: 'critical' | 'error' | 'warning';
  type: 'regex' | 'ast' | 'file';
  pattern: string | string[];
  message: string;
  fix_action: string;
  applies_to: string[];
}

// =============================================================================
// Validation Result
// =============================================================================

export interface ValidationResult {
  check_id: string;
  passed: boolean;
  severity: 'critical' | 'error' | 'warning';
  message?: string;
  line?: number;
  fix_suggestion?: string;
  auto_fixable: boolean;
}

export interface FormattedResult {
  check: string;
  message: string;
  line?: number;
  fix_suggestion?: string;
  auto_fixable: boolean;
}
