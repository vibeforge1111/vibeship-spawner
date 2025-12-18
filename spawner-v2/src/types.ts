/**
 * Spawner V2 Type Definitions
 *
 * Central type hub - re-exports domain types for convenience.
 * Domain-specific types live in their respective modules.
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
// Re-exports from domain modules
// =============================================================================

// Database entities
export type {
  Project,
  ProjectRow,
  Decision,
  Session,
  SessionRow,
  Issue,
  TelemetryEvent,
  EventType,
} from './db/types.js';

// Skills system
export type {
  Skill,
  SkillContent,
  SharpEdge,
} from './skills/types.js';

// Validation system
export type {
  Check,
  Validation,
  ValidationResult,
  FormattedResult,
} from './validation/types.js';

// Tool I/O types
export type {
  ContextInput,
  ContextOutput,
  ValidateInput,
  ValidateOutput,
  RememberInput,
  RememberOutput,
  SharpEdgeInput,
  SharpEdgeOutput,
  UnstickInput,
  UnstickOutput,
  AttemptPattern,
  SessionCache,
} from './tools/types.js';

// Mind integration types
export type {
  MindMemory,
  MindSession,
  MindContext,
  MindDecision,
  MindSessionEntry,
} from './mind/types.js';

// Orchestration types
export type {
  DetectionResult,
  OrchestrationPath,
  OrchestrationResult,
  SessionInput,
  LoadedSkill,
  ProjectInfo,
  ResumeContext,
  AnalyzeContext,
  BrainstormContext,
  SkillLevel,
  RecommendedStack,
} from './orchestration/types.js';
