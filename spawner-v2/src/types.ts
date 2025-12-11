/**
 * Spawner V2 Type Definitions
 *
 * Core types for the MCP server, database entities, and tool interfaces.
 */

// =============================================================================
// Environment Bindings (Cloudflare Workers)
// =============================================================================

export interface Env {
  // D1 Database
  DB: D1Database;

  // KV Namespaces
  SKILLS: KVNamespace;
  SHARP_EDGES: KVNamespace;
  CACHE: KVNamespace;

  // Optional: Workers AI for embeddings
  AI?: Ai;

  // Config
  ENVIRONMENT: 'development' | 'production';
}

// =============================================================================
// Database Entities
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

export interface Decision {
  id: string;
  project_id: string;
  decision: string;
  reasoning: string | null;
  created_at: string;
}

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

export interface Issue {
  id: string;
  project_id: string;
  description: string;
  status: 'open' | 'resolved';
  resolved_at: string | null;
  created_at: string;
}

export interface TelemetryEvent {
  id: string;
  event_type: EventType;
  project_id: string | null;
  skill_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// =============================================================================
// Telemetry Event Types
// =============================================================================

export type EventType =
  | 'session_start'
  | 'guardrail_block'
  | 'guardrail_override'
  | 'sharp_edge_surfaced'
  | 'escape_hatch_trigger'
  | 'escape_hatch_outcome'
  | 'skill_handoff'
  | 'session_end';

// =============================================================================
// Skills System
// =============================================================================

export interface Skill {
  id: string;
  name: string;
  description: string;
  layer: 1 | 2 | 3;
  tags: string[];
  owns: string[];        // Domains this skill owns
  pairs_with: string[];  // Skills that work well together
  triggers: string[];    // Phrases that should load this skill
  path: string;          // Path to skill file
}

export interface SkillContent extends Skill {
  content: string;        // Full skill markdown content
  sharp_edges?: SharpEdge[];
  patterns?: string;      // Patterns markdown
  anti_patterns?: string; // Anti-patterns markdown
}

// =============================================================================
// Sharp Edges
// =============================================================================

export interface SharpEdge {
  id: string;
  skill_id: string;
  summary: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  situation: string;
  why: string;
  solution: string;
  symptoms?: string[];
  detection_pattern?: string;  // Regex pattern
  version_range?: string;      // semver range (e.g., ">=13.0.0 <14.0.0")
  expires_at?: string;         // ISO date when this edge is no longer relevant
  matches_code?: boolean;      // Runtime flag for code matching
}

// =============================================================================
// Validation System
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

/**
 * Validation definition (stored in KV as validations:{skill_id})
 */
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

export interface ValidationResult {
  check_id: string;
  passed: boolean;
  severity: 'critical' | 'error' | 'warning';
  message?: string;
  line?: number;
  fix_suggestion?: string;
  auto_fixable: boolean;
}

// =============================================================================
// Tool Input/Output Types
// =============================================================================

// spawner_context
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
  skills: {
    id: string;
    name: string;
    owns: string[];
    sharp_edges_count: number;
  }[];
  sharp_edges: SharpEdge[];
  _instruction: string;
}

// spawner_validate
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
  _instruction: string;
}

export interface FormattedResult {
  check: string;
  message: string;
  line?: number;
  fix_suggestion?: string;
  auto_fixable: boolean;
}

// spawner_remember
export interface RememberInput {
  project_id: string;
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
  saved: string[];
  message: string;
}

// spawner_sharp_edge
export interface SharpEdgeInput {
  stack: string[];
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

// spawner_unstick
export interface UnstickInput {
  task_description: string;
  attempts: string[];
  errors: string[];
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
// Cache Types
// =============================================================================

export interface SessionCache {
  project: Project;
  skills: string[];  // Skill IDs
  timestamp: string;
}

// =============================================================================
// Attempt Analysis (for unstick tool)
// =============================================================================

export interface AttemptPattern {
  type: 'circular' | 'exploratory';
  circular: boolean;
  similarity: number;
}
