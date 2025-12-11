/**
 * Tool Input/Output Types
 *
 * Types for MCP tool interfaces.
 */

import type { Issue } from '../db/types.js';
import type { SharpEdge } from '../skills/types.js';
import type { FormattedResult } from '../validation/types.js';

// =============================================================================
// spawner_load (formerly spawner_context)
// =============================================================================

export interface ContextInput {
  project_id?: string;
  project_description?: string;
  stack_hints?: string[];
}

export interface ContextOutput {
  project: {
    id: string;
    name: string;
    description: string | null;
    stack: string[];
  };
  last_session?: string;
  open_issues: Issue[];
  recent_decisions?: {
    what: string;
    why: string | null;
    when: string;
  }[];
  skills: {
    id: string;
    name: string;
    owns: string[];
    sharp_edges_count: number;
  }[];
  sharp_edges: SharpEdge[];
  _instruction: string;
}

// =============================================================================
// spawner_validate
// =============================================================================

export interface ValidateInput {
  code: string;
  file_path: string;
  check_types?: ('security' | 'patterns' | 'production')[];
}

export interface ValidateOutput {
  passed: boolean;
  summary: string;
  critical: FormattedResult[];
  errors: FormattedResult[];
  warnings: FormattedResult[];
  what_to_do?: string;
  example?: string;
  _instruction: string;
}

// =============================================================================
// spawner_remember
// =============================================================================

export interface RememberInput {
  project_id?: string;
  update: {
    decision?: {
      what: string;
      why: string;
    };
    issue?: {
      description: string;
      status: 'open' | 'resolved';
    };
    session_summary?: string;
    validated?: string[];
  };
}

export interface RememberOutput {
  success: boolean;
  saved: string[];
  project_id: string;
  project_name: string;
  was_project_created: boolean;
  what_happened: string;
  what_this_means: string;
  next_steps: string[];
  message: string;
}

// =============================================================================
// spawner_watch_out (sharp edges)
// =============================================================================

export interface SharpEdgeInput {
  stack?: string[];
  situation?: string;
  code_context?: string;
}

export interface SharpEdgeOutput {
  edges: {
    id: string;
    summary: string;
    severity: string;
    situation: string;
    why: string;
    solution: string;
    matches_current_code?: boolean;
  }[];
  _instruction: string;
}

// =============================================================================
// spawner_unstick
// =============================================================================

export interface UnstickInput {
  task_description: string;
  situation?: string;
  attempts?: string[];
  errors?: string[];
  current_code?: string;
}

export interface UnstickOutput {
  diagnosis: string;
  attempts_analyzed: {
    count: number;
    pattern: string;
    circular: boolean;
  };
  alternatives: {
    approach: string;
    tradeoff: string;
    recommended: boolean;
    requires_handoff?: string;
  }[];
  should_reset: boolean;
  reset_reason: string | null;
  _instruction: string;
}

// =============================================================================
// Attempt Analysis (for unstick tool)
// =============================================================================

export interface AttemptPattern {
  type: 'circular' | 'exploratory';
  circular: boolean;
  similarity: number;
}

// =============================================================================
// Cache Types
// =============================================================================

export interface SessionCache {
  project_id: string;
  skills: string[];  // Skill IDs
  timestamp: string;
}
