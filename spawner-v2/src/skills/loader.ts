/**
 * Skill Loader
 *
 * Load skills from KV namespace based on project stack.
 * Integrates with the existing V1 skill registry format.
 */

import type { Skill, SkillContent, SharpEdge } from '../types';

/**
 * Skill index structure (stored in KV)
 */
interface SkillIndex {
  version: string;
  specialists: Skill[];
  layers: Record<number, { name: string; description: string; specialists: string[] }>;
  tag_index: Record<string, string[]>;
  squads: Record<string, { description: string; lead: string; support: string[]; on_call?: string[] }>;
}

/**
 * Load the skill index from KV
 */
export async function loadSkillIndex(
  skills: KVNamespace
): Promise<SkillIndex | null> {
  return skills.get<SkillIndex>('skill_index', 'json');
}

/**
 * Load a specific skill by ID
 */
export async function loadSkill(
  skills: KVNamespace,
  skillId: string
): Promise<SkillContent | null> {
  // Load skill definition
  const skill = await skills.get<Skill>(`skill:${skillId}`, 'json');
  if (!skill) return null;

  // Load skill content (markdown)
  const content = await skills.get(`skill:${skillId}:content`, 'text');

  // Load patterns and sharp edges if available
  const patterns = await skills.get(`skill:${skillId}:patterns`, 'text');
  const antiPatterns = await skills.get(`skill:${skillId}:anti_patterns`, 'text');
  const sharpEdges = await skills.get<SharpEdge[]>(`skill:${skillId}:edges`, 'json');

  return {
    ...skill,
    content: content ?? '',
    patterns: patterns ?? undefined,
    anti_patterns: antiPatterns ?? undefined,
    sharp_edges: sharpEdges ?? undefined,
  };
}

/**
 * Load skills relevant to a given stack
 */
export async function loadRelevantSkills(
  skills: KVNamespace,
  stack: string[]
): Promise<SkillContent[]> {
  const index = await loadSkillIndex(skills);
  if (!index) return [];

  // Find skills that match the stack
  const matchedIds = new Set<string>();

  for (const stackItem of stack) {
    const normalized = stackItem.toLowerCase().replace(/[^a-z0-9]/g, '-');

    for (const skill of index.specialists) {
      // Check tags
      if (skill.tags.some(tag => tag.includes(normalized) || normalized.includes(tag))) {
        matchedIds.add(skill.id);
      }

      // Check triggers
      if (skill.triggers.some(trigger =>
        trigger.toLowerCase().includes(normalized) ||
        normalized.includes(trigger.toLowerCase())
      )) {
        matchedIds.add(skill.id);
      }
    }
  }

  // Load matched skills
  const loadedSkills: SkillContent[] = [];
  for (const id of matchedIds) {
    const skill = await loadSkill(skills, id);
    if (skill) {
      loadedSkills.push(skill);
    }
  }

  // Sort by layer (core first)
  loadedSkills.sort((a, b) => a.layer - b.layer);

  return loadedSkills;
}

/**
 * Find skills by tag
 */
export async function findSkillsByTag(
  skills: KVNamespace,
  tag: string
): Promise<Skill[]> {
  const index = await loadSkillIndex(skills);
  if (!index) return [];

  const skillIds = index.tag_index[tag.toLowerCase()];
  if (!skillIds) return [];

  return index.specialists.filter(s => skillIds.includes(s.name));
}

/**
 * Get a pre-configured squad
 */
export async function getSquad(
  skills: KVNamespace,
  squadName: string
): Promise<{
  description: string;
  lead: Skill | null;
  support: Skill[];
  on_call: Skill[];
} | null> {
  const index = await loadSkillIndex(skills);
  if (!index) return null;

  const squad = index.squads[squadName];
  if (!squad) return null;

  const findSkill = (name: string) =>
    index.specialists.find(s => s.name === name) ?? null;

  return {
    description: squad.description,
    lead: findSkill(squad.lead),
    support: squad.support.map(findSkill).filter((s): s is Skill => s !== null),
    on_call: (squad.on_call ?? []).map(findSkill).filter((s): s is Skill => s !== null),
  };
}

/**
 * List all skills by layer
 */
export async function listSkillsByLayer(
  skills: KVNamespace,
  layer: 1 | 2 | 3
): Promise<Skill[]> {
  const index = await loadSkillIndex(skills);
  if (!index) return [];

  const layerInfo = index.layers[layer];
  if (!layerInfo) return [];

  return index.specialists.filter(s => layerInfo.specialists.includes(s.name));
}

/**
 * Search skills by query
 */
export async function searchSkills(
  skills: KVNamespace,
  query: string
): Promise<Skill[]> {
  const index = await loadSkillIndex(skills);
  if (!index) return [];

  const q = query.toLowerCase();

  return index.specialists.filter(s =>
    s.name.includes(q) ||
    s.description.toLowerCase().includes(q) ||
    s.tags.some(t => t.includes(q)) ||
    s.triggers.some(t => t.toLowerCase().includes(q))
  );
}

/**
 * Get skills that pair well with a given skill
 */
export async function getPairedSkills(
  skills: KVNamespace,
  skillId: string
): Promise<Skill[]> {
  const skill = await loadSkill(skills, skillId);
  if (!skill || !skill.pairs_with.length) return [];

  const index = await loadSkillIndex(skills);
  if (!index) return [];

  return index.specialists.filter(s => skill.pairs_with.includes(s.name));
}
