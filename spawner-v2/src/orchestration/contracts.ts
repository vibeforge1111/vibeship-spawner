/**
 * State Contract Enforcement
 *
 * Validates that skills receive the data they're supposed to receive
 * before executing. Based on collaboration.yaml definitions.
 *
 * This makes the collaboration protocol REAL instead of just documentation.
 */

import type { Env } from '../types.js';
import { loadSkill, type Collaboration } from '../skills/loader.js';

// =============================================================================
// Types
// =============================================================================

export interface ContractRequirement {
  key: string;
  description: string;
  required: boolean;
  validator?: (value: unknown) => boolean;
}

export interface StateContract {
  skill_id: string;
  from_skill?: string;
  requirements: ContractRequirement[];
}

export interface ContractValidation {
  valid: boolean;
  skill_id: string;
  from_skill?: string;
  missing: string[];
  warnings: string[];
  data_received: Record<string, unknown>;
}

export interface HandoffPackage {
  from_skill: string;
  to_skill: string;
  data: Record<string, unknown>;
  context: string;
  timestamp: number;
}

// =============================================================================
// Contract Extraction from Collaboration YAML
// =============================================================================

/**
 * Extract contract requirements from a skill's collaboration.yaml
 */
export async function extractContract(
  env: Env,
  skillId: string,
  fromSkill?: string
): Promise<StateContract | null> {
  const skill = await loadSkill(env, skillId);
  if (!skill || !skill.collaboration) {
    return null;
  }

  const collab = skill.collaboration;
  const requirements: ContractRequirement[] = [];

  // If coming from a specific skill, get those requirements
  if (fromSkill && collab.receives_from) {
    const receiveSpec = collab.receives_from.find(
      r => r.skill === fromSkill || r.skill === fromSkill.replace(/-/g, '_')
    );

    if (receiveSpec && receiveSpec.receives) {
      for (const item of receiveSpec.receives) {
        requirements.push({
          key: normalizeKey(item),
          description: item,
          required: true
        });
      }
    }
  }

  // Also add prerequisites from collaboration
  if (collab.prerequisites) {
    const prereqs = collab.prerequisites as Record<string, unknown>;

    if (prereqs.required_knowledge) {
      // These are soft requirements - just log as warnings
    }

    if (prereqs.required_data) {
      const reqData = prereqs.required_data as string[];
      for (const item of reqData) {
        if (!requirements.find(r => r.key === normalizeKey(item))) {
          requirements.push({
            key: normalizeKey(item),
            description: item,
            required: true
          });
        }
      }
    }
  }

  return {
    skill_id: skillId,
    from_skill: fromSkill,
    requirements
  };
}

/**
 * Normalize a description to a key (for state lookup)
 */
function normalizeKey(description: string): string {
  return description
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .slice(0, 50);
}

// =============================================================================
// Contract Validation
// =============================================================================

/**
 * Validate that state satisfies a contract
 */
export function validateContract(
  contract: StateContract,
  state: Record<string, unknown>
): ContractValidation {
  const missing: string[] = [];
  const warnings: string[] = [];
  const dataReceived: Record<string, unknown> = {};

  for (const req of contract.requirements) {
    // Try multiple key formats
    const possibleKeys = [
      req.key,
      req.key.replace(/_/g, '-'),
      req.key.replace(/_/g, ''),
      toCamelCase(req.key)
    ];

    let found = false;
    for (const key of possibleKeys) {
      if (state[key] !== undefined) {
        dataReceived[req.key] = state[key];
        found = true;
        break;
      }
    }

    if (!found) {
      if (req.required) {
        missing.push(req.description);
      } else {
        warnings.push(`Optional data missing: ${req.description}`);
      }
    } else if (req.validator && !req.validator(dataReceived[req.key])) {
      missing.push(`${req.description} (invalid format)`);
    }
  }

  return {
    valid: missing.length === 0,
    skill_id: contract.skill_id,
    from_skill: contract.from_skill,
    missing,
    warnings,
    data_received: dataReceived
  };
}

function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

// =============================================================================
// Handoff Package Creation
// =============================================================================

/**
 * Create a handoff package from one skill to another
 * Ensures the sending skill provides what the receiving skill expects
 */
export async function createHandoffPackage(
  env: Env,
  fromSkill: string,
  toSkill: string,
  data: Record<string, unknown>,
  context: string
): Promise<{ package: HandoffPackage; validation: ContractValidation }> {
  // Get what the receiving skill expects
  const contract = await extractContract(env, toSkill, fromSkill);

  const handoff: HandoffPackage = {
    from_skill: fromSkill,
    to_skill: toSkill,
    data,
    context,
    timestamp: Date.now()
  };

  if (!contract) {
    // No contract defined - pass through with warning
    return {
      package: handoff,
      validation: {
        valid: true,
        skill_id: toSkill,
        from_skill: fromSkill,
        missing: [],
        warnings: ['No contract defined - data passed without validation'],
        data_received: data
      }
    };
  }

  const validation = validateContract(contract, data);

  return {
    package: handoff,
    validation
  };
}

// =============================================================================
// Contract Display (for notifications)
// =============================================================================

/**
 * Format contract validation for display
 */
export function formatContractValidation(validation: ContractValidation): string {
  const lines: string[] = [];

  if (validation.from_skill) {
    lines.push(`## Handoff: ${validation.from_skill} → ${validation.skill_id}`);
  } else {
    lines.push(`## Contract Check: ${validation.skill_id}`);
  }

  lines.push('');

  if (validation.valid) {
    lines.push('✓ All required data received');
    lines.push('');
    lines.push('### Data Received:');
    for (const [key, value] of Object.entries(validation.data_received)) {
      const preview = typeof value === 'string'
        ? value.slice(0, 50) + (value.length > 50 ? '...' : '')
        : typeof value;
      lines.push(`- **${key}**: ${preview}`);
    }
  } else {
    lines.push('⚠️ Missing required data:');
    for (const item of validation.missing) {
      lines.push(`- ❌ ${item}`);
    }
    lines.push('');
    lines.push('**Action Required:** Provide missing data before proceeding.');
  }

  if (validation.warnings.length > 0) {
    lines.push('');
    lines.push('### Warnings:');
    for (const warning of validation.warnings) {
      lines.push(`- ⚠️ ${warning}`);
    }
  }

  return lines.join('\n');
}

/**
 * Create a contract enforcement message for the notification system
 */
export function createContractEvent(
  validation: ContractValidation
): { type: 'handoff' | 'error'; data: Record<string, unknown> } {
  if (validation.valid) {
    return {
      type: 'handoff',
      data: {
        from: validation.from_skill || 'user',
        to: validation.skill_id,
        payload: `${Object.keys(validation.data_received).length} data items`,
        description: 'Contract satisfied - handoff complete'
      }
    };
  } else {
    return {
      type: 'error',
      data: {
        agent_id: validation.skill_id,
        error: `Missing: ${validation.missing.join(', ')}`,
        severity: 'warning'
      }
    };
  }
}

// =============================================================================
// Quick Validators
// =============================================================================

export const validators = {
  isString: (v: unknown): boolean => typeof v === 'string' && v.length > 0,
  isArray: (v: unknown): boolean => Array.isArray(v) && v.length > 0,
  isObject: (v: unknown): boolean => typeof v === 'object' && v !== null,
  isUrl: (v: unknown): boolean => typeof v === 'string' && /^https?:\/\//.test(v),
  isCode: (v: unknown): boolean => typeof v === 'string' && v.length > 10
};
