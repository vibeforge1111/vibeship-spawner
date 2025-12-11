/**
 * Database Entity Types
 *
 * Types for D1 database entities and their raw row representations.
 */

// =============================================================================
// Project Entity
// =============================================================================

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  stack: string[];  // Parsed from JSON
  created_at: string;
  updated_at: string;
}

export interface ProjectRow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  stack: string;  // Raw JSON string from D1
  created_at: string;
  updated_at: string;
}

// =============================================================================
// Decision Entity
// =============================================================================

export interface Decision {
  id: string;
  project_id: string;
  decision: string;
  reasoning: string | null;
  created_at: string;
}

// =============================================================================
// Session Entity
// =============================================================================

export interface Session {
  id: string;
  project_id: string;
  summary: string;
  issues_open: string[];
  issues_resolved: string[];
  validations_passed: string[];
  created_at: string;
}

export interface SessionRow {
  id: string;
  project_id: string;
  summary: string;
  issues_open: string;
  issues_resolved: string;
  validations_passed: string;
  created_at: string;
}

// =============================================================================
// Issue Entity
// =============================================================================

export interface Issue {
  id: string;
  project_id: string;
  description: string;
  status: 'open' | 'resolved';
  resolved_at: string | null;
  created_at: string;
}

// =============================================================================
// Telemetry Entity
// =============================================================================

export interface TelemetryEvent {
  id: string;
  event_type: EventType;
  project_id: string | null;
  skill_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export type EventType =
  | 'session_start'
  | 'guardrail_block'
  | 'guardrail_override'
  | 'sharp_edge_surfaced'
  | 'escape_hatch_trigger'
  | 'escape_hatch_outcome'
  | 'skill_handoff'
  | 'session_end';
