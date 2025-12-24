/**
 * spawner_skills Tool
 *
 * Search and retrieve skills from both V1 (markdown) and V2 (YAML) formats.
 * Provides unified access to all specialist skills.
 */

import { z } from 'zod';
import type { Env } from '../types';
import { loadSkill, loadSkillEdges, formatSkillContext, type Skill } from '../skills/loader';

/**
 * V1 Skill Registry structure (from /skills/registry.json)
 */
interface V1SkillRegistry {
  version: string;
  specialists: V1Specialist[];
  tag_index: Record<string, string[]>;
  layers: Record<string, {
    name: string;
    description: string;
    specialists: string[];
  }>;
  squads: Record<string, {
    description: string;
    lead: string;
    support: string[];
    on_call?: string[];
  }>;
}

interface V1Specialist {
  name: string;
  path: string;
  description: string;
  tags: string[];
  triggers: string[];
  pairs_with: string[];
  layer: number;
}

/**
 * V2 Skill structure (from KV)
 */
interface V2Skill {
  id: string;
  name: string;
  description: string;
  layer: number;
  tags: string[];
  owns: string[];
  pairs_with: string[];
  triggers: string[];
  has_validations: boolean;
  has_sharp_edges: boolean;
}

/**
 * Unified skill result
 */
interface UnifiedSkill {
  name: string;
  description: string;
  layer: number;
  tags: string[];
  pairs_with: string[];
  source: 'v1' | 'v2';
  has_validations: boolean;
  has_sharp_edges: boolean;
}

/**
 * Input schema for spawner_skills
 */
export const skillsInputSchema = z.object({
  action: z.enum(['search', 'list', 'get', 'squad']).optional().describe(
    'Action: search (default), list (all skills), get (specific skill), squad (get skill squad)'
  ),
  query: z.string().optional().describe(
    'Search query - matches names, descriptions, tags, triggers'
  ),
  name: z.string().optional().describe(
    'Skill name for get action'
  ),
  tag: z.string().optional().describe(
    'Filter by tag'
  ),
  layer: z.number().min(1).max(3).optional().describe(
    'Filter by layer: 1=Core, 2=Integration, 3=Polish'
  ),
  squad: z.string().optional().describe(
    'Squad name for squad action (e.g., "auth-complete", "payments-complete")'
  ),
  source: z.enum(['all', 'v1', 'v2']).optional().describe(
    'Filter by source: all (default), v1 (markdown), v2 (yaml)'
  ),
  context: z.string().optional().describe(
    'Context from previous skill when handing off - describes what was being built'
  ),
  previous_skill: z.string().optional().describe(
    'ID of the skill that initiated the handoff - prevents circular handoffs'
  ),
});

/**
 * Tool definition for MCP
 */
export const skillsToolDefinition = {
  name: 'spawner_skills',
  description: 'Search, list, and retrieve specialist skills. Skills include handoff protocols for seamless collaboration between specialists.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      action: {
        type: 'string',
        enum: ['search', 'list', 'get', 'squad'],
        description: 'Action: search (default), list (all skills), get (specific skill content), squad (get skill squad)',
      },
      query: {
        type: 'string',
        description: 'Search query - matches names, descriptions, tags, triggers',
      },
      name: {
        type: 'string',
        description: 'Skill name for get action (e.g., "nextjs-app-router", "supabase-backend")',
      },
      tag: {
        type: 'string',
        description: 'Filter by tag (e.g., "auth", "supabase", "react")',
      },
      layer: {
        type: 'integer',
        enum: [1, 2, 3],
        description: 'Filter by layer: 1=Core, 2=Integration, 3=Polish',
      },
      squad: {
        type: 'string',
        description: 'Squad name (e.g., "auth-complete", "payments-complete", "crud-feature")',
      },
      source: {
        type: 'string',
        enum: ['all', 'v1', 'v2'],
        description: 'Filter by source: all (default), v1 (markdown skills), v2 (yaml skills with validations)',
      },
      context: {
        type: 'string',
        description: 'Context from previous skill when handing off - describes what was being built, current state, user goal',
      },
      previous_skill: {
        type: 'string',
        description: 'ID of the skill that initiated the handoff - prevents circular handoffs back to the originating skill',
      },
    },
    required: [],
  },
};

/**
 * Output type
 */
export interface SkillsOutput {
  skills?: UnifiedSkill[];
  skill_content?: string;
  squad?: {
    name: string;
    description: string;
    lead: string;
    support: string[];
    on_call?: string[];
  };
  layers?: {
    layer: number;
    name: string;
    description: string;
    count: number;
  }[];
  _instruction: string;
}

/**
 * Execute the spawner_skills tool
 */
export async function executeSkills(
  env: Env,
  input: z.infer<typeof skillsInputSchema>
): Promise<SkillsOutput> {
  const parsed = skillsInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(`Invalid input: ${parsed.error.message}`);
  }

  const {
    query,
    name,
    tag,
    layer,
    squad,
    source = 'all',
    context,
    previous_skill,
  } = parsed.data;

  // Infer action from provided params if not specified
  let action = parsed.data.action;
  if (!action) {
    if (name) {
      action = 'get';
    } else if (squad) {
      action = 'squad';
    } else {
      action = 'search';  // Default
    }
  }

  // Load V1 registry from KV
  const v1Registry = await loadV1Registry(env);

  // Load V2 skills index from KV
  const v2Skills = await loadV2SkillsIndex(env);

  switch (action) {
    case 'search':
      return handleSearch(v1Registry, v2Skills, query, tag, layer, source);

    case 'list':
      return handleList(v1Registry, v2Skills, layer, source);

    case 'get':
      if (!name) {
        throw new Error('name is required for get action');
      }
      return await handleGet(env, v1Registry, v2Skills, name, {
        context,
        previousSkill: previous_skill,
      });

    case 'squad':
      if (!squad) {
        throw new Error('squad is required for squad action');
      }
      return handleSquad(v1Registry, squad);

    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

/**
 * Load V1 registry from KV
 */
async function loadV1Registry(env: Env): Promise<V1SkillRegistry | null> {
  const registry = await env.SKILLS.get<V1SkillRegistry>('v1:registry', 'json');
  return registry;
}

/**
 * Load V2 skills index from KV
 */
async function loadV2SkillsIndex(env: Env): Promise<V2Skill[]> {
  // The skill_index contains a skills array with the skill metadata
  const index = await env.SKILLS.get<{ skills: V2Skill[] }>('skill_index', 'json');
  return index?.skills ?? [];
}

/**
 * Handle search action
 */
function handleSearch(
  v1Registry: V1SkillRegistry | null,
  v2Skills: V2Skill[],
  query?: string,
  tag?: string,
  layer?: number,
  source: string = 'all'
): SkillsOutput {
  const results: UnifiedSkill[] = [];
  const q = query?.toLowerCase();

  // Search V1 skills
  if (source === 'all' || source === 'v1') {
    if (v1Registry) {
      for (const skill of v1Registry.specialists) {
        if (matchesFilters(skill, q, tag, layer)) {
          results.push({
            name: skill.name,
            description: skill.description,
            layer: skill.layer,
            tags: skill.tags,
            pairs_with: skill.pairs_with,
            source: 'v1',
            has_validations: false,
            has_sharp_edges: false, // V1 has them in markdown, not structured
          });
        }
      }
    }
  }

  // Search V2 skills
  if (source === 'all' || source === 'v2') {
    for (const skill of v2Skills) {
      if (matchesFiltersV2(skill, q, tag, layer)) {
        results.push({
          name: skill.name,
          description: skill.description,
          layer: skill.layer,
          tags: skill.tags,
          pairs_with: skill.pairs_with,
          source: 'v2',
          has_validations: skill.has_validations,
          has_sharp_edges: skill.has_sharp_edges,
        });
      }
    }
  }

  // Sort by relevance (exact name match first, then layer)
  results.sort((a, b) => {
    if (q) {
      const aExact = a.name.toLowerCase() === q;
      const bExact = b.name.toLowerCase() === q;
      if (aExact && !bExact) return -1;
      if (bExact && !aExact) return 1;
    }
    return a.layer - b.layer;
  });

  return {
    skills: results,
    _instruction: buildSearchInstruction(results, query, tag, layer),
  };
}

/**
 * Handle list action
 */
function handleList(
  v1Registry: V1SkillRegistry | null,
  v2Skills: V2Skill[],
  layer?: number,
  source: string = 'all'
): SkillsOutput {
  const results: UnifiedSkill[] = [];

  // Add V1 skills
  if (source === 'all' || source === 'v1') {
    if (v1Registry) {
      for (const skill of v1Registry.specialists) {
        if (!layer || skill.layer === layer) {
          results.push({
            name: skill.name,
            description: skill.description,
            layer: skill.layer,
            tags: skill.tags,
            pairs_with: skill.pairs_with,
            source: 'v1',
            has_validations: false,
            has_sharp_edges: false,
          });
        }
      }
    }
  }

  // Add V2 skills
  if (source === 'all' || source === 'v2') {
    for (const skill of v2Skills) {
      if (!layer || skill.layer === layer) {
        // Skip if already in results (V2 overrides V1 for same name)
        if (!results.some(r => r.name === skill.name)) {
          results.push({
            name: skill.name,
            description: skill.description,
            layer: skill.layer,
            tags: skill.tags,
            pairs_with: skill.pairs_with,
            source: 'v2',
            has_validations: skill.has_validations,
            has_sharp_edges: skill.has_sharp_edges,
          });
        }
      }
    }
  }

  // Sort by layer then name
  results.sort((a, b) => {
    if (a.layer !== b.layer) return a.layer - b.layer;
    return a.name.localeCompare(b.name);
  });

  // Build layer summary
  const layers = [
    { layer: 1, name: 'Core', description: 'Foundation - language, framework, data layer', count: results.filter(r => r.layer === 1).length },
    { layer: 2, name: 'Integration', description: 'Features - combine core skills into complete features', count: results.filter(r => r.layer === 2).length },
    { layer: 3, name: 'Polish', description: 'Quality - security, UX, design refinement', count: results.filter(r => r.layer === 3).length },
  ];

  return {
    skills: results,
    layers,
    _instruction: buildListInstruction(results, layers, layer),
  };
}

/**
 * Handle get action - retrieve full skill content with handoff protocol
 */
async function handleGet(
  env: Env,
  v1Registry: V1SkillRegistry | null,
  v2Skills: V2Skill[],
  name: string,
  options?: { context?: string; previousSkill?: string }
): Promise<SkillsOutput> {
  // Check V2 first (preferred)
  const v2SkillMeta = v2Skills.find(s => s.name === name || s.id === name);
  if (v2SkillMeta) {
    // Load full skill object for rendering
    const skill = await loadSkill(env, v2SkillMeta.id);
    if (skill) {
      // Load sharp edges for this skill
      const edges = await loadSkillEdges(env, skill.id);

      // Render skill with handoff protocol
      let content = formatSkillContext(skill, edges, {
        previousSkill: options?.previousSkill,
        includeHandoffs: true,
      });

      // Add context from previous skill if provided
      if (options?.context) {
        content += `\n\n---\n\n## Context From Previous Skill\n\n${options.context}`;
      }

      const hasHandoffs = skill.handoffs && skill.handoffs.length > 0;

      // Check if this is a marketing skill that may need tool setup
      const setupHint = getSetupHintForSkill(skill.id, skill.tags ?? []);

      const instruction = [
        `Loaded skill: **${skill.name}**`,
        '',
        hasHandoffs ? '✓ Handoff protocol active - will route to specialists when needed' : '',
        edges.length > 0 ? `✓ ${edges.length} sharp edge${edges.length !== 1 ? 's' : ''} loaded` : '',
        skill.patterns?.length ? `✓ ${skill.patterns.length} pattern${skill.patterns.length !== 1 ? 's' : ''} available` : '',
        '',
        'Use spawner_validate to check code against this skill\'s validations.',
        setupHint ? `\n---\n\n${setupHint}` : '',
      ].filter(Boolean).join('\n');

      return {
        skill_content: content,
        _instruction: instruction,
      };
    }
  }

  // Check V1 (legacy markdown skills - no handoff protocol)
  if (v1Registry) {
    const v1Skill = v1Registry.specialists.find(s => s.name === name);
    if (v1Skill) {
      const content = await env.SKILLS.get(`v1:skill:${name}`);
      if (content) {
        return {
          skill_content: content,
          _instruction: `Loaded V1 skill: ${v1Skill.name}\n\nThis is a markdown skill without handoff protocol. Use spawner_watch_out for gotchas.`,
        };
      }
    }
  }

  // Not found
  const available = [
    ...(v1Registry?.specialists.map(s => s.name) ?? []),
    ...v2Skills.map(s => s.name),
  ].filter((v, i, a) => a.indexOf(v) === i).sort();

  if (available.length === 0) {
    throw new Error(`Skill "${name}" not found. No skills loaded - run 'node scripts/upload-skills.js' to populate KV.`);
  }
  throw new Error(`Skill "${name}" not found. Available: ${available.join(', ')}`);
}

/**
 * Handle squad action
 */
function handleSquad(
  v1Registry: V1SkillRegistry | null,
  squadName: string
): SkillsOutput {
  if (!v1Registry?.squads) {
    throw new Error('Squad registry not available');
  }

  const squad = v1Registry.squads[squadName];
  if (!squad) {
    const available = Object.keys(v1Registry.squads);
    throw new Error(`Squad "${squadName}" not found. Available: ${available.join(', ')}`);
  }

  return {
    squad: {
      name: squadName,
      ...squad,
    },
    _instruction: buildSquadInstruction(squadName, squad),
  };
}

/**
 * Check if V1 skill matches filters
 */
function matchesFilters(
  skill: V1Specialist,
  query?: string,
  tag?: string,
  layer?: number
): boolean {
  if (layer && skill.layer !== layer) return false;
  if (tag && !skill.tags.includes(tag.toLowerCase())) return false;

  if (query) {
    const q = query.toLowerCase();
    return (
      skill.name.includes(q) ||
      skill.description.toLowerCase().includes(q) ||
      skill.tags.some(t => t.includes(q)) ||
      skill.triggers.some(t => t.toLowerCase().includes(q))
    );
  }

  return true;
}

/**
 * Check if V2 skill matches filters
 */
function matchesFiltersV2(
  skill: V2Skill,
  query?: string,
  tag?: string,
  layer?: number
): boolean {
  if (layer && skill.layer !== layer) return false;
  if (tag && !skill.tags.includes(tag.toLowerCase())) return false;

  if (query) {
    const q = query.toLowerCase();
    return (
      skill.name.includes(q) ||
      skill.id.includes(q) ||
      skill.description.toLowerCase().includes(q) ||
      skill.tags.some(t => t.includes(q)) ||
      skill.triggers.some(t => t.toLowerCase().includes(q))
    );
  }

  return true;
}

/**
 * Build search instruction
 */
function buildSearchInstruction(
  results: UnifiedSkill[],
  query?: string,
  tag?: string,
  layer?: number
): string {
  if (results.length === 0) {
    const filters = [query, tag, layer ? `layer ${layer}` : null].filter(Boolean);
    return `No skills found matching: ${filters.join(', ')}\n\nTry a broader search or use action="list" to see all skills.`;
  }

  const lines: string[] = [
    `Found ${results.length} skill${results.length === 1 ? '' : 's'}:`,
    '',
  ];

  for (const skill of results) {
    const badge = skill.source === 'v2' ? '[V2]' : '[V1]';
    const extras = [];
    if (skill.has_validations) extras.push('validations');
    if (skill.has_sharp_edges) extras.push('sharp-edges');

    lines.push(`${badge} **${skill.name}** (Layer ${skill.layer})`);
    lines.push(`    ${skill.description}`);
    if (extras.length) lines.push(`    Features: ${extras.join(', ')}`);
  }

  lines.push('');
  lines.push('Use action="get" with name="<skill>" to load full content.');

  return lines.join('\n');
}

/**
 * Build list instruction
 */
function buildListInstruction(
  results: UnifiedSkill[],
  layers: { layer: number; name: string; count: number }[],
  filterLayer?: number
): string {
  const lines: string[] = [];

  if (filterLayer) {
    const layerInfo = layers.find(l => l.layer === filterLayer);
    lines.push(`Layer ${filterLayer}: ${layerInfo?.name} (${results.length} skills)`);
  } else {
    lines.push(`All Skills: ${results.length} total`);
    lines.push('');
    for (const l of layers) {
      lines.push(`  Layer ${l.layer} (${l.name}): ${l.count} skills`);
    }
  }

  lines.push('');
  lines.push('Skills by layer:');

  let currentLayer = 0;
  for (const skill of results) {
    if (skill.layer !== currentLayer) {
      currentLayer = skill.layer;
      const layerInfo = layers.find(l => l.layer === currentLayer);
      lines.push('');
      lines.push(`── Layer ${currentLayer}: ${layerInfo?.name} ──`);
    }
    const badge = skill.source === 'v2' ? '[V2]' : '[V1]';
    lines.push(`  ${badge} ${skill.name}`);
  }

  lines.push('');
  lines.push('[V2] = Has structured validations/sharp-edges');
  lines.push('[V1] = Markdown format');

  return lines.join('\n');
}

/**
 * Skills that need specific tools for full functionality
 */
const SKILL_TOOL_REQUIREMENTS: Record<string, {
  tools: string[];
  message: string;
}> = {
  // Image generation skills
  'ai-image-generation': {
    tools: ['fal-ai', 'midjourney'],
    message: 'This skill works best with image generation tools. Run `spawner_setup({ tool: "fal-ai" })` for setup.',
  },
  'prompt-engineering-creative': {
    tools: ['fal-ai', 'midjourney', 'runway'],
    message: 'For hands-on prompt testing, configure generation tools via `spawner_setup({ action: "check" })`.',
  },
  // Video generation skills
  'ai-video-generation': {
    tools: ['runway', 'fal-ai'],
    message: 'Video generation requires Runway or Fal.ai. Run `spawner_setup({ tool: "runway" })` for setup.',
  },
  'video-production': {
    tools: ['runway', 'heygen'],
    message: 'For AI video features, configure Runway. Run `spawner_setup({ tool: "runway" })` for setup.',
  },
  // Audio/voice skills
  'voiceover': {
    tools: ['elevenlabs'],
    message: 'AI voiceover requires ElevenLabs. Run `spawner_setup({ tool: "elevenlabs" })` for setup.',
  },
  'ai-audio-production': {
    tools: ['elevenlabs', 'suno'],
    message: 'AI audio tools enhance this skill. Run `spawner_setup({ tool: "elevenlabs" })` to start.',
  },
  'digital-humans': {
    tools: ['heygen', 'elevenlabs'],
    message: 'AI avatar creation requires HeyGen. Run `spawner_setup({ tool: "heygen" })` for setup.',
  },
  // Creative direction skills
  'ai-creative-director': {
    tools: ['fal-ai', 'runway', 'elevenlabs'],
    message: 'Full creative orchestration benefits from all generation tools. Run `spawner_setup({ action: "level", level: 3 })` for full setup.',
  },
};

/**
 * Get setup hint for a skill based on its ID and tags
 */
function getSetupHintForSkill(skillId: string, tags: string[]): string | null {
  // Check direct skill ID match
  const directMatch = SKILL_TOOL_REQUIREMENTS[skillId];
  if (directMatch) {
    return `**Tool Setup:** ${directMatch.message}`;
  }

  // Check if it's a marketing/AI skill that might need tools
  const isAISkill = tags.some(t =>
    ['ai', 'generation', 'video', 'audio', 'image', 'voice', 'avatar'].includes(t.toLowerCase())
  );

  if (isAISkill) {
    return '**Note:** This skill may work better with AI generation tools configured. Run `spawner_setup({ action: "check" })` to see your current setup.';
  }

  return null;
}

/**
 * Build squad instruction
 */
function buildSquadInstruction(
  name: string,
  squad: { description: string; lead: string; support: string[]; on_call?: string[] }
): string {
  const lines: string[] = [
    `Squad: ${name}`,
    squad.description,
    '',
    `Lead: ${squad.lead}`,
    `Support: ${squad.support.join(', ')}`,
  ];

  if (squad.on_call?.length) {
    lines.push(`On-call: ${squad.on_call.join(', ')}`);
  }

  lines.push('');
  lines.push('Recommended loading order:');
  lines.push(`1. ${squad.lead} (lead)`);
  squad.support.forEach((s, i) => {
    lines.push(`${i + 2}. ${s}`);
  });

  lines.push('');
  lines.push('Use action="get" with each skill name to load the full content.');

  return lines.join('\n');
}
