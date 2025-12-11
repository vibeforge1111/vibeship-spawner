/**
 * Validation Checks Index
 */

export * from './security';
export * from './patterns';
export * from './production';

import type { Check } from '../../types';
import { getSecurityChecks } from './security';
import { getPatternChecks } from './patterns';
import { getProductionChecks } from './production';

/**
 * Get all checks by type
 */
export function getChecksByType(
  types: ('security' | 'patterns' | 'production')[]
): Check[] {
  const checks: Check[] = [];

  if (types.includes('security')) {
    checks.push(...getSecurityChecks());
  }

  if (types.includes('patterns')) {
    checks.push(...getPatternChecks());
  }

  if (types.includes('production')) {
    checks.push(...getProductionChecks());
  }

  return checks;
}

/**
 * Get all available checks
 */
export function getAllChecks(): Check[] {
  return [
    ...getSecurityChecks(),
    ...getPatternChecks(),
    ...getProductionChecks(),
  ];
}
