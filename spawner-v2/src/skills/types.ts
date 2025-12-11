/**
 * Skills System Types
 *
 * Types for skills, skill content, and sharp edges.
 */

// =============================================================================
// Skill Entity
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
