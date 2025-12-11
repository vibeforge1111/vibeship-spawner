/**
 * Skill Loader (V2)
 *
 * Load skills from KV namespace based on project stack.
 * Works with the new YAML-based skill format.
 */

import type { Env, SharpEdge, Validation } from '../types';

/**
 * Skill definition (stored in KV as skill:{id})
 */
export interface Skill {
  id: string;
  name: string;
  version: string;
  layer: 1 | 2 | 3;
  description: string;
  owns: string[];
  pairs_with: string[];
  requires: string[];
  tags: string[];
  triggers: string[];
  identity: string;
  patterns?: Pattern[];
  anti_patterns?: AntiPattern[];
  handoffs?: Handoff[];
  sharp_edges_count: number;
  validations_count: number;
}

export interface Pattern {
  name: string;
  description: string;
  when: string;
  example: string;
}

export interface AntiPattern {
  name: string;
  description: string;
  why: string;
  instead: string;
}

export interface Handoff {
  trigger: string;
  to: string;
  context: string;
}

// Re-export SharpEdge and Validation from types for convenience
export type { SharpEdge, Validation };

/**
 * Skill index structure (stored in KV as skill_index)
 */
interface SkillIndex {
  version: string;
  updated_at: string;
  total: number;
  by_layer: {
    core: string[];
    integration: string[];
    pattern: string[];
  };
  skills: {
    id: string;
    name: string;
    layer: number;
    owns: string[];
    tags: string[];
    triggers: string[];
  }[];
}

/**
 * Edge index structure (stored in KV as edge_index)
 */
interface EdgeIndex {
  version: string;
  updated_at: string;
  total: number;
  by_skill: Record<string, string[]>;
  by_severity: {
    critical: string[];
    high: string[];
    medium: string[];
    low: string[];
  };
  all_ids: string[];
}

/**
 * Load the skill index from KV
 */
export async function loadSkillIndex(
  env: Env
): Promise<SkillIndex | null> {
  return env.SKILLS.get<SkillIndex>('skill_index', 'json');
}

/**
 * Load a specific skill by ID
 */
export async function loadSkill(
  env: Env,
  skillId: string
): Promise<Skill | null> {
  return env.SKILLS.get<Skill>(`skill:${skillId}`, 'json');
}

/**
 * Load sharp edges for a skill
 */
export async function loadSkillEdges(
  env: Env,
  skillId: string
): Promise<SharpEdge[]> {
  const edges = await env.SHARP_EDGES.get<SharpEdge[]>(`edges:${skillId}`, 'json');
  return edges ?? [];
}

/**
 * Load validations for a skill
 */
export async function loadSkillValidations(
  env: Env,
  skillId: string
): Promise<Validation[]> {
  const validations = await env.SKILLS.get<Validation[]>(`validations:${skillId}`, 'json');
  return validations ?? [];
}

/**
 * Load all edges across all skills
 */
export async function loadAllEdges(
  env: Env
): Promise<SharpEdge[]> {
  const edges = await env.SHARP_EDGES.get<SharpEdge[]>('all_edges', 'json');
  return edges ?? [];
}

/**
 * Load all validations across all skills
 */
export async function loadAllValidations(
  env: Env
): Promise<Validation[]> {
  const validations = await env.SKILLS.get<Validation[]>('all_validations', 'json');
  return validations ?? [];
}

/**
 * Load skills relevant to a given stack
 */
export async function loadRelevantSkills(
  env: Env,
  stack: string[]
): Promise<Skill[]> {
  const index = await loadSkillIndex(env);
  if (!index) return [];

  // Find skills that match the stack
  const matchedIds = new Set<string>();

  for (const stackItem of stack) {
    const normalized = stackItem.toLowerCase().replace(/[^a-z0-9]/g, '');

    for (const skill of index.skills) {
      // Check owns
      if (skill.owns.some(own =>
        own.toLowerCase().replace(/[^a-z0-9]/g, '').includes(normalized) ||
        normalized.includes(own.toLowerCase().replace(/[^a-z0-9]/g, ''))
      )) {
        matchedIds.add(skill.id);
      }

      // Check tags
      if (skill.tags.some(tag =>
        tag.toLowerCase().replace(/[^a-z0-9]/g, '').includes(normalized) ||
        normalized.includes(tag.toLowerCase().replace(/[^a-z0-9]/g, ''))
      )) {
        matchedIds.add(skill.id);
      }

      // Check triggers
      if (skill.triggers.some(trigger =>
        trigger.toLowerCase().replace(/[^a-z0-9]/g, '').includes(normalized) ||
        normalized.includes(trigger.toLowerCase().replace(/[^a-z0-9]/g, ''))
      )) {
        matchedIds.add(skill.id);
      }
    }
  }

  // Load matched skills
  const loadedSkills: Skill[] = [];
  for (const id of matchedIds) {
    const skill = await loadSkill(env, id);
    if (skill) {
      loadedSkills.push(skill);
    }
  }

  // Sort by layer (core first)
  loadedSkills.sort((a, b) => a.layer - b.layer);

  return loadedSkills;
}

/**
 * Search skills by query
 */
export async function searchSkills(
  env: Env,
  query: string
): Promise<Skill[]> {
  const index = await loadSkillIndex(env);
  if (!index) return [];

  const q = query.toLowerCase();
  const matchedIds: string[] = [];

  for (const skill of index.skills) {
    if (
      skill.name.toLowerCase().includes(q) ||
      skill.id.includes(q) ||
      skill.tags.some(t => t.toLowerCase().includes(q)) ||
      skill.triggers.some(t => t.toLowerCase().includes(q)) ||
      skill.owns.some(o => o.toLowerCase().includes(q))
    ) {
      matchedIds.push(skill.id);
    }
  }

  const skills: Skill[] = [];
  for (const id of matchedIds) {
    const skill = await loadSkill(env, id);
    if (skill) skills.push(skill);
  }

  return skills;
}

/**
 * Search sharp edges by situation/symptoms
 */
export async function searchEdges(
  env: Env,
  query: string
): Promise<SharpEdge[]> {
  const allEdges = await loadAllEdges(env);
  const q = query.toLowerCase();

  return allEdges.filter(edge =>
    edge.summary.toLowerCase().includes(q) ||
    edge.situation.toLowerCase().includes(q) ||
    (edge.symptoms ?? []).some(s => s.toLowerCase().includes(q)) ||
    edge.why.toLowerCase().includes(q)
  );
}

/**
 * Get edges by severity
 */
export async function getEdgesBySeverity(
  env: Env,
  severity: 'critical' | 'high' | 'medium' | 'low'
): Promise<SharpEdge[]> {
  const allEdges = await loadAllEdges(env);
  return allEdges.filter(edge => edge.severity === severity);
}

/**
 * Get skills that pair well with a given skill
 */
export async function getPairedSkills(
  env: Env,
  skillId: string
): Promise<Skill[]> {
  const skill = await loadSkill(env, skillId);
  if (!skill || !skill.pairs_with.length) return [];

  const paired: Skill[] = [];
  for (const pairedId of skill.pairs_with) {
    const pairedSkill = await loadSkill(env, pairedId);
    if (pairedSkill) paired.push(pairedSkill);
  }

  return paired;
}

/**
 * Get skills by layer
 */
export async function getSkillsByLayer(
  env: Env,
  layer: 1 | 2 | 3
): Promise<Skill[]> {
  const index = await loadSkillIndex(env);
  if (!index) return [];

  const layerName = layer === 1 ? 'core' : layer === 2 ? 'integration' : 'pattern';
  const skillIds = index.by_layer[layerName];

  const skills: Skill[] = [];
  for (const id of skillIds) {
    const skill = await loadSkill(env, id);
    if (skill) skills.push(skill);
  }

  return skills;
}

/**
 * Get validations that apply to a specific file type
 */
export async function getValidationsForFile(
  env: Env,
  filename: string
): Promise<Validation[]> {
  const allValidations = await loadAllValidations(env);

  return allValidations.filter(validation =>
    validation.applies_to.some((pattern: string) => {
      // Simple glob matching
      if (pattern.startsWith('*')) {
        return filename.endsWith(pattern.slice(1));
      }
      if (pattern.includes('**')) {
        const suffix = pattern.split('**').pop() ?? '';
        return filename.endsWith(suffix.replace(/^\/?/, ''));
      }
      return filename.includes(pattern);
    })
  );
}

/**
 * Format a skill for display in context
 */
export function formatSkillContext(skill: Skill, edges: SharpEdge[]): string {
  let context = `## ${skill.name}\n\n`;
  context += skill.identity + '\n\n';

  if (skill.patterns && skill.patterns.length > 0) {
    context += '### Patterns\n\n';
    for (const pattern of skill.patterns) {
      context += `**${pattern.name}**: ${pattern.description}\n`;
      context += `When: ${pattern.when}\n\n`;
    }
  }

  if (skill.anti_patterns && skill.anti_patterns.length > 0) {
    context += '### Anti-Patterns\n\n';
    for (const ap of skill.anti_patterns) {
      context += `**${ap.name}**: ${ap.description}\n`;
      context += `Why: ${ap.why}\n`;
      context += `Instead: ${ap.instead}\n\n`;
    }
  }

  if (edges.length > 0) {
    context += '### Sharp Edges (Gotchas)\n\n';
    for (const edge of edges) {
      context += `**[${edge.severity.toUpperCase()}] ${edge.summary}**\n`;
      context += `${edge.situation}\n\n`;
    }
  }

  return context;
}
