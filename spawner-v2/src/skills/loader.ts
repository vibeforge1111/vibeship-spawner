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
  context?: string;
  context_template?: string;
  priority?: number;
  exclude_from?: string[];
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
 * Render the handoff protocol section for a skill
 */
export function renderHandoffProtocol(skill: Skill, previousSkill?: string): string {
  if (!skill.handoffs || skill.handoffs.length === 0) {
    return '';
  }

  // Sort handoffs by priority (higher first)
  const sortedHandoffs = [...skill.handoffs].sort(
    (a, b) => (b.priority ?? 0) - (a.priority ?? 0)
  );

  // Build trigger table rows
  const triggerRows = sortedHandoffs
    .map(h => {
      // Show first 4 trigger keywords for readability
      const triggers = h.trigger.split('|').slice(0, 4).join(', ');
      const suffix = h.trigger.split('|').length > 4 ? '...' : '';
      return `| ${triggers}${suffix} | \`spawner_load({ skill_id: "${h.to}" })\` |`;
    })
    .join('\n');

  // Build the owns list (first 5 items)
  const ownsList = skill.owns.slice(0, 5).join(', ');

  // Build handoff history section if coming from another skill
  let historySection = '';
  if (previousSkill) {
    historySection = `
### Handoff History

You received this from: **${previousSkill}**
Do NOT hand back to: ${previousSkill}
`;
  }

  return `## HANDOFF PROTOCOL

You are operating as: **${skill.name}**

Your specialty: ${skill.description}

---

### BOUNDARY CHECK (Run this on every user message)

Before responding, quickly assess:
1. Is this clearly within my domain (${ownsList})? → Continue
2. Does this match a handoff trigger? → Execute handoff
3. Ambiguous? → Ask user for clarification

---

### HANDOFF TRIGGERS

| If user mentions... | Action |
|---------------------|--------|
${triggerRows}

---

### HANDOFF EXECUTION

When you detect a handoff trigger:

**Step 1: Acknowledge**
> "This involves [topic area]. Let me bring in the [specialist name] who handles this specifically."

**Step 2: Summarize Context**
Prepare a brief context for the new skill:
- What has been built so far
- Current file/component being worked on
- User's immediate goal
- Any constraints or preferences mentioned

**Step 3: Execute**
\`\`\`
spawner_load({
  skill_id: "[target-skill-id]",
  context: "Your context summary here"
})
\`\`\`

**Step 4: Stop**
Do not continue answering in your domain. The new skill will take over.

---

### STAYING IN YOUR LANE

Continue WITHOUT handoff when:
- Question is clearly about ${ownsList}
- User is asking for clarification on your previous answer
- User explicitly says "don't switch" or "stay with current"
- It's a code review of code in your domain

---

### GRACEFUL UNCERTAINTY

If you're unsure whether to hand off:

> "This touches on [topic]. I can give you general guidance, or I can bring in the [specialist] for deeper expertise. Which would you prefer?"

Let user decide. Don't block on uncertainty.
${historySection}`;
}

/**
 * Format a skill for display in context
 */
export function formatSkillContext(
  skill: Skill,
  edges: SharpEdge[],
  options?: { previousSkill?: string; includeHandoffs?: boolean }
): string {
  const sections: string[] = [];

  // 1. Identity section
  sections.push(`## ${skill.name}\n\n${skill.identity}`);

  // 2. HANDOFF PROTOCOL (critical for collaboration)
  if (options?.includeHandoffs !== false && skill.handoffs && skill.handoffs.length > 0) {
    sections.push(renderHandoffProtocol(skill, options?.previousSkill));
  }

  // 3. Domain ownership
  if (skill.owns && skill.owns.length > 0) {
    sections.push(`## Your Domain\n\nYou are authoritative on:\n${skill.owns.map(o => `- ${o}`).join('\n')}`);
  }

  // 4. Patterns
  if (skill.patterns && skill.patterns.length > 0) {
    let patternsSection = '## Patterns\n\n';
    for (const pattern of skill.patterns) {
      patternsSection += `**${pattern.name}**: ${pattern.description}\n`;
      patternsSection += `When: ${pattern.when}\n\n`;
    }
    sections.push(patternsSection);
  }

  // 5. Anti-patterns
  if (skill.anti_patterns && skill.anti_patterns.length > 0) {
    let antiSection = '## Anti-Patterns\n\n';
    for (const ap of skill.anti_patterns) {
      antiSection += `**${ap.name}**: ${ap.description}\n`;
      antiSection += `Why: ${ap.why}\n`;
      antiSection += `Instead: ${ap.instead}\n\n`;
    }
    sections.push(antiSection);
  }

  // 6. Sharp edges
  if (edges.length > 0) {
    let edgesSection = '## Sharp Edges (Gotchas)\n\n';
    for (const edge of edges) {
      edgesSection += `**[${edge.severity.toUpperCase()}] ${edge.summary}**\n`;
      edgesSection += `${edge.situation}\n\n`;
    }
    sections.push(edgesSection);
  }

  return sections.join('\n\n---\n\n');
}
