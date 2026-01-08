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
  id?: string;
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
 * Normalize skill ID for consistent lookups
 * Handles: "Event Architect" -> "event-architect", "EventArchitect" -> "event-architect"
 */
function normalizeSkillId(input: string): string {
  return input
    .toLowerCase()
    .replace(/([a-z])([A-Z])/g, '$1-$2')  // camelCase to kebab
    .replace(/\s+/g, '-')                  // spaces to dashes
    .replace(/[^a-z0-9-]/g, '')            // remove special chars
    .replace(/-+/g, '-')                   // collapse multiple dashes
    .replace(/^-|-$/g, '');                // trim dashes
}

/**
 * Safely check if array contains query (handles undefined/non-array)
 */
function safeArrayIncludes(arr: unknown, query: string): boolean {
  if (!Array.isArray(arr)) return false;
  return arr.some(item => typeof item === 'string' && item.toLowerCase().includes(query));
}

/**
 * Find similar skills using fuzzy matching
 */
function findSimilarSkills(
  query: string,
  v1Registry: V1SkillRegistry | null,
  v2Skills: V2Skill[]
): string[] {
  const normalized = normalizeSkillId(query);
  const allNames = [
    ...(v1Registry?.specialists.map(s => s.name).filter(Boolean) ?? []),
    ...v2Skills.map(s => s.name).filter(Boolean),
    ...v2Skills.map(s => s.id).filter(Boolean),
  ] as string[];

  // Simple similarity: contains or starts with
  return allNames
    .filter(name => {
      if (!name) return false;
      const n = normalizeSkillId(name);
      return n.includes(normalized) || normalized.includes(n) ||
        n.split('-').some(part => normalized.includes(part));
    })
    .slice(0, 5);
}

/**
 * Local skill paths - where skills are installed on user's machine
 * Users clone: https://github.com/vibeforge1111/vibeship-spawner-skills
 */
const LOCAL_SKILLS_PATH = '~/.spawner/skills';
const LOCAL_SKILLS_REPO = 'https://github.com/vibeforge1111/vibeship-spawner-skills';

/**
 * Fallback: infer category from skill.layer
 * Layer mapping:
 *   1 → development (core skills)
 *   2 → frameworks (framework-specific)
 *   3 → marketing (quality/completion - polish layer)
 */
function inferCategoryFromLayer(layer?: number): string | null {
  if (!layer) return null;

  const layerMap: Record<number, string> = {
    1: 'development',
    2: 'frameworks',
    3: 'marketing'
  };

  return layerMap[layer] || null;
}

/**
 * Map skill ID to its local filesystem path
 * Enhanced with multi-step fallback logic
 */
async function getLocalSkillPath(
  skillId: string,
  category?: string,
  v2Skills?: V2Skill[]
): Promise<string> {
  // 1. Try explicit category
  if (category) {
    return `${LOCAL_SKILLS_PATH}/${category}/${skillId}`;
  }

  // 2. Try V2 skills index for layer-based category inference
  if (v2Skills && v2Skills.length > 0) {
    const v2Skill = v2Skills.find(s =>
      (s.id && normalizeSkillId(s.id) === normalizeSkillId(skillId)) ||
      (s.name && normalizeSkillId(s.name) === normalizeSkillId(skillId))
    );

    if (v2Skill && v2Skill.layer) {
      const layerCategory = inferCategoryFromLayer(v2Skill.layer);
      if (layerCategory) {
        return `${LOCAL_SKILLS_PATH}/${layerCategory}/${skillId}`;
      }
    }
  }

  // 3. Try pattern inference
  try {
    const inferredCategory = inferCategoryFromSkillId(skillId);
    return `${LOCAL_SKILLS_PATH}/${inferredCategory}/${skillId}`;
  } catch (error) {
    // 4. Final fallback: throw error with helpful message
    throw new Error(
      `Cannot determine category for skill: ${skillId}. ` +
      `Please specify category explicitly.`
    );
  }
}

/**
 * Infer category from skill ID patterns
 */
function inferCategoryFromSkillId(skillId: string): string {
  // Check categoryPatterns
  const categoryPatterns: Record<string, string[]> = {
    'ai': ['llm-', 'ml-', 'causal-', 'vector-', 'rag-', 'ai-agents'],
    'data': ['postgres-', 'redis-', 'graph-', 'temporal-', 'data-', 'drizzle-', 'vector-specialist'],
    'frameworks': ['nextjs-', 'supabase-', 'sveltekit', 'tailwind-', 'react-', 'typescript-'],
    'marketing': ['ai-video', 'ai-image', 'ai-audio', 'content-', 'seo', 'copywriting', 'video-', 'brand-'],
    'strategy': ['growth-', 'product-strategy', 'brand-positioning', 'founder-', 'pivot-', 'idea-maze'],
    'startup': ['yc-', 'burn-rate', 'founder-mode'],
    'integration': ['stripe-', 'email-', 'vercel-', 'nextjs-supabase'],
    'design': ['ui-', 'ux-', 'branding', 'landing-page'],
    'product': ['a-b-', 'analytics', 'product-management', 'customer-success'],
    'communications': ['dev-communications', 'community-'],
  };

  for (const [category, patterns] of Object.entries(categoryPatterns)) {
    if (patterns.some(p => skillId.startsWith(p) || skillId.includes(p))) {
      return category;
    }
  }

  // Default: throw error instead of returning hardcoded 'development'
  throw new Error(`Category not found for skill: ${skillId}. Please add to categoryPatterns.`);
}

/**
 * Input schema for spawner_skills
 */
export { normalizeSkillId, inferCategoryFromLayer };
export const skillsInputSchema = z.object({
  action: z.enum(['search', 'list', 'get', 'squad', 'pack', 'exists', 'get_files', 'health', 'sync', 'local']).optional().describe(
    'Action: search (default), list, get, squad, pack (load skill pack from registry), exists, get_files, health, sync, local (get local paths for Claude to read)'
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
  pack: z.string().optional().describe(
    'Skill pack name for pack action (e.g., "essentials", "agents", "marketing-ai", "enterprise", "finance", "mind", "specialized")'
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
  description: 'Search, list, and retrieve specialist skills. Skills are stored LOCALLY at ~/.spawner/skills/ - use action="local" to get paths for the Read tool. Use exists to check before creating.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      action: {
        type: 'string',
        enum: ['search', 'list', 'get', 'squad', 'pack', 'exists', 'get_files', 'health', 'sync', 'local'],
        description: 'Action: search (default), list, get, squad, pack (load skill pack), exists, get_files, health, sync, local (RECOMMENDED: get local paths for Claude to read with Read tool)',
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
      pack: {
        type: 'string',
        description: 'Skill pack name from registry.yaml (e.g., "essentials", "agents", "marketing-ai", "enterprise", "finance", "mind", "specialized", "complete")',
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
  // For exists action
  exists?: boolean;
  skill_id?: string;
  skill_name?: string;
  skill_path?: string;
  similar?: string[];
  suggestion?: string;
  // For get_files action
  files?: Record<string, string>;
  source_path?: string;
  // For health action
  health?: {
    total: number;
    healthy: number;
    incomplete: number;
    issues: Array<{
      skill_id: string;
      skill_name: string;
      source: 'v1' | 'v2';
      missing_files: string[];
      warnings: string[];
    }>;
    summary: string;
  };
  // For sync action
  sync?: {
    skills: Array<{
      id: string;
      name: string;
      source: 'v1' | 'v2';
      path: string;
      files: Record<string, string>;
    }>;
    total_skills: number;
    total_files: number;
  };
  // For local action - paths for Claude to read with Read tool
  local?: {
    skill_id: string;
    skill_name: string;
    local_path: string;
    files: {
      skill: string;
      sharp_edges: string;
      validations: string;
      collaboration: string;
    };
    read_commands: string[];
  };
  // Local path hint included in all responses
  local_path?: string;
  local_hint?: string;
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
    pack,
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
    } else if (pack) {
      action = 'pack';
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

    case 'pack':
      if (!pack) {
        return handlePackList(env);
      }
      return handlePack(env, pack, v2Skills);

    case 'exists':
      if (!name) {
        throw new Error('name is required for exists action');
      }
      return await handleExists(v1Registry, v2Skills, name);

    case 'get_files':
      if (!name) {
        throw new Error('name is required for get_files action');
      }
      return await handleGetFiles(env, v1Registry, v2Skills, name);

    case 'health':
      return await handleHealth(env, v1Registry, v2Skills);

    case 'sync':
      return await handleSync(env, v1Registry, v2Skills);

    case 'local':
      if (!name) {
        return await handleLocalList(v1Registry, v2Skills, query, tag);
      }
      return await handleLocal(v1Registry, v2Skills, name);

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
    local_hint: `💡 Skills are stored locally at ${LOCAL_SKILLS_PATH}. Use action="local" with name="<skill>" to get paths for the Read tool.`,
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

  // Sort by layer then name (handle undefined names)
  results.sort((a, b) => {
    if (a.layer !== b.layer) return (a.layer || 99) - (b.layer || 99);
    const nameA = a.name || a.id || '';
    const nameB = b.name || b.id || '';
    return nameA.localeCompare(nameB);
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
    local_hint: `💡 Skills are stored locally at ${LOCAL_SKILLS_PATH}. Use action="local" to browse with Read tool paths.`,
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
  const normalized = normalizeSkillId(name);

  // Check V2 first (preferred) - with normalized matching and defensive checks
  const v2SkillMeta = v2Skills.find(s =>
    (s.name && normalizeSkillId(s.name) === normalized) ||
    (s.id && normalizeSkillId(s.id) === normalized)
  );
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

      // Get local path for this skill
      const localPath = await getLocalSkillPath(skill.id, undefined, v2Skills);

      const instruction = [
        `Loaded skill: **${skill.name}**`,
        '',
        hasHandoffs ? '✓ Handoff protocol active - will route to specialists when needed' : '',
        edges.length > 0 ? `✓ ${edges.length} sharp edge${edges.length !== 1 ? 's' : ''} loaded` : '',
        skill.patterns?.length ? `✓ ${skill.patterns.length} pattern${skill.patterns.length !== 1 ? 's' : ''} available` : '',
        '',
        `📁 **Local path:** \`${localPath}\``,
        'Use spawner_validate to check code against this skill\'s validations.',
        setupHint ? `\n---\n\n${setupHint}` : '',
      ].filter(Boolean).join('\n');

      return {
        skill_content: content,
        local_path: localPath,
        local_hint: `💡 Prefer reading skills locally with: Read: ${localPath}/skill.yaml`,
        _instruction: instruction,
      };
    }
  }

  // Check V1 (legacy markdown skills - no handoff protocol) - with normalized matching
  if (v1Registry) {
    const v1Skill = v1Registry.specialists.find(s =>
      s.name && normalizeSkillId(s.name) === normalized
    );
    if (v1Skill) {
      const content = await env.SKILLS.get(`v1:skill:${v1Skill.name}`);
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
 * Skill Pack definitions from registry.yaml
 * These are curated collections of skills for specific use cases
 */
const SKILL_PACKS: Record<string, {
  name: string;
  description: string;
  skills: string[];
  auto_install?: boolean;
}> = {
  essentials: {
    name: 'Spawner Essentials',
    description: 'Core skills for building apps. Auto-installed on first use.',
    auto_install: true,
    skills: [
      'backend/backend', 'frontend/frontend', 'backend/api-designer',
      'security/auth-specialist', 'devops/devops', 'security/security',
      'testing/code-reviewer', 'testing/test-architect', 'development/docs-engineer',
      'data/postgres-wizard', 'ai/llm-architect',
      'frameworks/nextjs-app-router', 'frameworks/react-patterns', 'frameworks/supabase-backend',
      'frameworks/tailwind-ui', 'frameworks/typescript-strict',
      'design/ui-design', 'design/ux-design', 'product/product-management',
    ],
  },
  data: {
    name: 'Data & Databases',
    description: 'Database, vector search, graphs, and data engineering.',
    skills: [
      'data/postgres-wizard', 'data/redis-specialist', 'data/vector-specialist',
      'data/data-engineer', 'data/graph-engineer', 'data/temporal-craftsman',
    ],
  },
  ai: {
    name: 'AI & Machine Learning',
    description: 'LLM architecture, ML systems, embeddings, causal inference.',
    skills: [
      'ai/llm-architect', 'ai/ml-memory', 'ai/causal-scientist',
      'ai/art-consistency', 'ai-agents/ai-product',
    ],
  },
  startup: {
    name: 'Startup & Founder',
    description: 'YC playbook, fundraising, founder skills.',
    skills: [
      'startup/yc-playbook', 'startup/founder-mode', 'startup/burn-rate-management',
      'strategy/fundraising-strategy', 'strategy/competitive-intelligence', 'strategy/go-to-market',
    ],
  },
  marketing: {
    name: 'Marketing & Growth',
    description: 'Content, SEO, ads, growth strategies.',
    skills: [
      'marketing/marketing-fundamentals', 'marketing/content-strategy', 'marketing/seo',
      'marketing/copywriting', 'marketing/blog-writing', 'marketing/ad-copywriting',
      'marketing/viral-marketing', 'marketing/brand-storytelling',
    ],
  },
  'marketing-ai': {
    name: 'AI Marketing Suite',
    description: 'AI-powered content creation, video, audio, and creative tools.',
    skills: [
      'marketing/ai-creative-director', 'marketing/ai-image-generation', 'marketing/ai-video-generation',
      'marketing/ai-audio-production', 'marketing/ai-content-analytics', 'marketing/ai-brand-kit',
      'marketing/ai-localization', 'marketing/digital-humans', 'marketing/voiceover',
      'marketing/video-production', 'marketing/motion-graphics', 'marketing/prompt-engineering-creative',
      'ai/art-consistency',
    ],
  },
  agents: {
    name: 'AI Agents',
    description: 'Build autonomous agents, multi-agent systems, and automation.',
    skills: [
      'ai-agents/autonomous-agents', 'ai-agents/multi-agent-orchestration', 'ai-agents/agent-memory-systems',
      'ai-agents/agent-tool-builder', 'ai-agents/browser-automation', 'ai-agents/computer-use-agents',
      'ai-agents/voice-agents', 'ai-agents/workflow-automation', 'ai-agents/zapier-make-patterns',
      'ai-agents/agent-evaluation',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    description: 'Compliance, governance, and enterprise architecture.',
    skills: [
      'enterprise/compliance-automation', 'enterprise/data-governance', 'enterprise/disaster-recovery',
      'enterprise/enterprise-architecture', 'enterprise/integration-patterns', 'enterprise/multi-tenancy',
      'legal/gdpr-privacy', 'legal/sox-compliance',
    ],
  },
  finance: {
    name: 'Finance & Fintech',
    description: 'Algorithmic trading, DeFi, and financial modeling.',
    skills: [
      'finance/algorithmic-trading', 'finance/blockchain-defi', 'finance/derivatives-pricing',
      'finance/fintech-integration', 'finance/portfolio-optimization', 'finance/risk-modeling',
    ],
  },
  specialized: {
    name: 'Specialized Domains',
    description: 'Biotech, space, climate, hardware, and simulation.',
    skills: [
      'biotech/genomics-pipelines', 'biotech/drug-discovery-informatics',
      'space/orbital-mechanics', 'space/mission-planning',
      'climate/carbon-accounting', 'climate/sustainability-metrics',
      'hardware/embedded-systems', 'hardware/ros2-robotics',
      'simulation/monte-carlo', 'simulation/digital-twin',
    ],
  },
  mind: {
    name: 'Mind & Thinking',
    description: 'Debugging, decision-making, and system design thinking.',
    skills: [
      'mind/debugging-master', 'mind/decision-maker', 'mind/system-designer',
      'mind/refactoring-guide', 'mind/performance-thinker', 'mind/tech-debt-manager',
      'mind/test-strategist', 'mind/code-quality', 'mind/incident-responder',
      'mind/technical-writer',
    ],
  },
  devops: {
    name: 'DevOps & Infrastructure',
    description: 'CI/CD, infrastructure, observability, chaos engineering.',
    skills: [
      'devops/devops', 'devops/infra-architect', 'devops/observability-sre',
      'testing/chaos-engineer', 'development/performance-hunter',
    ],
  },
  frameworks: {
    name: 'Frameworks',
    description: 'React, Next.js, Svelte, and more.',
    skills: [
      'frameworks/nextjs-app-router', 'frameworks/react-patterns', 'frameworks/supabase-backend',
      'frameworks/sveltekit', 'frameworks/tailwind-ui', 'frameworks/typescript-strict',
    ],
  },
  design: {
    name: 'Design & Branding',
    description: 'UI design, UX research, branding, landing pages.',
    skills: [
      'design/ui-design', 'design/ux-design', 'design/branding', 'design/landing-page-design',
    ],
  },
};

/**
 * Handle pack action - load a curated skill pack
 */
async function handlePack(
  env: Env,
  packName: string,
  v2Skills: V2Skill[]
): Promise<SkillsOutput> {
  const pack = SKILL_PACKS[packName];
  if (!pack) {
    const available = Object.keys(SKILL_PACKS);
    throw new Error(`Pack "${packName}" not found. Available: ${available.join(', ')}`);
  }

  // Build local paths for all skills in the pack
  const skillPaths: Array<{
    id: string;
    local_path: string;
    files: { skill: string; sharp_edges: string; collaboration: string };
  }> = [];

  for (const skillPath of pack.skills) {
    // skillPath is like "development/backend" - extract category and skill id
    const parts = skillPath.split('/');
    const skillId = parts[parts.length - 1] ?? skillPath;
    const category = parts.slice(0, -1).join('/');
    const localPath = `${LOCAL_SKILLS_PATH}/${skillPath}`;

    skillPaths.push({
      id: skillId,
      local_path: localPath,
      files: {
        skill: `${localPath}/skill.yaml`,
        sharp_edges: `${localPath}/sharp-edges.yaml`,
        collaboration: `${localPath}/collaboration.yaml`,
      },
    });
  }

  // Build read commands for the first few skills
  const readCommands = skillPaths.slice(0, 5).map(s => `Read: ${s.files.skill}`);

  const lines: string[] = [
    `# Skill Pack: ${pack.name}`,
    '',
    pack.description,
    '',
    `**Skills in this pack:** ${pack.skills.length}`,
    pack.auto_install ? '**Auto-install:** Yes (essentials pack)' : '',
    '',
    '## Local Paths',
    '',
    'Use the Read tool with these paths to load skills:',
    '',
  ];

  for (const skill of skillPaths.slice(0, 10)) {
    lines.push(`- \`${skill.files.skill}\``);
  }

  if (skillPaths.length > 10) {
    lines.push(`  ... and ${skillPaths.length - 10} more skills`);
  }

  lines.push('');
  lines.push('## Quick Start');
  lines.push('');
  lines.push('```');
  for (const cmd of readCommands) {
    lines.push(cmd);
  }
  lines.push('```');
  lines.push('');
  lines.push('---');
  lines.push('');
  lines.push(`**Install skills locally:** \`git clone ${LOCAL_SKILLS_REPO} ~/.spawner/skills\``);

  return {
    local_hint: `Pack "${packName}" contains ${pack.skills.length} skills. Load with Read tool.`,
    _instruction: lines.filter(Boolean).join('\n'),
  };
}

/**
 * Handle pack list action - show all available packs
 */
async function handlePackList(env: Env): Promise<SkillsOutput> {
  const lines: string[] = [
    '# Skill Packs',
    '',
    'Curated collections of skills for specific use cases.',
    '',
    '| Pack | Skills | Description |',
    '|------|--------|-------------|',
  ];

  for (const [id, pack] of Object.entries(SKILL_PACKS)) {
    const autoTag = pack.auto_install ? ' (auto)' : '';
    lines.push(`| \`${id}\`${autoTag} | ${pack.skills.length} | ${pack.description} |`);
  }

  lines.push('');
  lines.push('## Usage');
  lines.push('');
  lines.push('```');
  lines.push('spawner_skills({ action: "pack", pack: "essentials" })');
  lines.push('spawner_skills({ action: "pack", pack: "agents" })');
  lines.push('spawner_skills({ action: "pack", pack: "marketing-ai" })');
  lines.push('```');
  lines.push('');
  lines.push('Each pack returns local file paths for the Read tool.');

  return {
    _instruction: lines.join('\n'),
  };
}

/**
 * Handle exists action - check if a skill exists
 */
async function handleExists(
  v1Registry: V1SkillRegistry | null,
  v2Skills: V2Skill[],
  name: string
): Promise<SkillsOutput> {
  const normalized = normalizeSkillId(name);

  // Check V2 first (preferred) - defensive check for undefined id/name
  const v2Match = v2Skills.find(s =>
    (s.id && normalizeSkillId(s.id) === normalized) ||
    (s.name && normalizeSkillId(s.name) === normalized)
  );

  if (v2Match) {
    // Determine path based on layer
    const layerFolder = v2Match.layer === 1 ? 'development' :
      v2Match.layer === 2 ? 'frameworks' : 'marketing';
    const localPath = await getLocalSkillPath(v2Match.id, undefined, v2Skills);

    return {
      exists: true,
      skill_id: v2Match.id,
      skill_name: v2Match.name,
      skill_path: `skills/${layerFolder}/${v2Match.id}/`,
      local_path: localPath,
      local_hint: `💡 Read locally: ${localPath}/skill.yaml`,
      _instruction: `Skill "${v2Match.name}" exists (V2). Use action="local" to get Read tool paths, or action="get" for remote.`,
    };
  }

  // Check V1
  if (v1Registry) {
    const v1Match = v1Registry.specialists.find(s =>
      s.name && normalizeSkillId(s.name) === normalized
    );

    if (v1Match) {
      const skillId = v1Match.name ? normalizeSkillId(v1Match.name) : 'unknown';
      const localPath = await getLocalSkillPath(skillId, undefined, v2Skills);
      return {
        exists: true,
        skill_id: skillId,
        skill_name: v1Match.name,
        skill_path: v1Match.path,
        local_path: localPath,
        _instruction: `Skill "${v1Match.name}" exists (V1 markdown). Use action="get" to retrieve it.`,
      };
    }
  }

  // Not found - provide similar suggestions and local setup instructions
  const similar = findSimilarSkills(name, v1Registry, v2Skills);
  const suggestion = similar.length > 0
    ? `Did you mean: ${similar.join(', ')}?`
    : 'No similar skills found.';

  return {
    exists: false,
    similar,
    suggestion,
    local_hint: `💡 Skills should be installed at ${LOCAL_SKILLS_PATH}. Clone: git clone ${LOCAL_SKILLS_REPO} ~/.spawner/skills`,
    _instruction: `Skill "${name}" not found. ${suggestion}\n\nUse spawner_skill_new to create a new skill, or ensure local skills are installed.`,
  };
}

/**
 * Handle get_files action - return raw YAML files for a skill
 */
async function handleGetFiles(
  env: Env,
  v1Registry: V1SkillRegistry | null,
  v2Skills: V2Skill[],
  name: string
): Promise<SkillsOutput> {
  const normalized = normalizeSkillId(name);

  // Check V2 first (only V2 has structured files) - defensive checks
  const v2Match = v2Skills.find(s =>
    (s.id && normalizeSkillId(s.id) === normalized) ||
    (s.name && normalizeSkillId(s.name) === normalized)
  );

  if (v2Match) {
    const skillId = v2Match.id;
    const files: Record<string, string> = {};

    // Load all possible files from KV
    // skill:{id} contains the main skill data
    const skillData = await env.SKILLS.get(`skill:${skillId}`, 'text');
    if (skillData) {
      files['skill.yaml'] = skillData;
    }

    // Load sharp edges
    const edgesData = await env.SHARP_EDGES.get(`edges:${skillId}`, 'text');
    if (edgesData) {
      files['sharp-edges.yaml'] = edgesData;
    }

    // Load validations
    const validationsData = await env.SKILLS.get(`validations:${skillId}`, 'text');
    if (validationsData) {
      files['validations.yaml'] = validationsData;
    }

    // Load collaboration
    const collabData = await env.SKILLS.get(`collaboration:${skillId}`, 'text');
    if (collabData) {
      files['collaboration.yaml'] = collabData;
    }

    // Determine path based on layer
    const layerFolder = v2Match.layer === 1 ? 'development' :
      v2Match.layer === 2 ? 'frameworks' : 'marketing';
    const localPath = await getLocalSkillPath(skillId, undefined, v2Skills);

    const fileList = Object.keys(files);
    const expectedFiles = ['skill.yaml', 'sharp-edges.yaml', 'validations.yaml', 'collaboration.yaml'];
    const missingFiles = expectedFiles.filter(f => !fileList.includes(f));

    return {
      skill_id: skillId,
      skill_name: v2Match.name,
      files,
      source_path: `skills/${layerFolder}/${skillId}/`,
      local_path: localPath,
      local_hint: `💡 Prefer reading directly from local: ${localPath}/`,
      _instruction: [
        `Retrieved ${fileList.length} files for skill "${v2Match.name}":`,
        ...fileList.map(f => `  - ${f}`),
        missingFiles.length > 0 ? `\nMissing files: ${missingFiles.join(', ')}` : '',
        '',
        `📁 **Local path:** \`${localPath}\``,
        '\nPrefer reading skills locally with the Read tool for zero-latency access.',
      ].filter(Boolean).join('\n'),
    };
  }

  // V1 skills don't have structured files
  if (v1Registry) {
    const v1Match = v1Registry.specialists.find(s =>
      s.name && normalizeSkillId(s.name) === normalized
    );

    if (v1Match) {
      // V1 skills are single markdown files
      const content = await env.SKILLS.get(`v1:skill:${v1Match.name}`);
      if (content) {
        return {
          skill_id: v1Match.name ? normalizeSkillId(v1Match.name) : 'unknown',
          skill_name: v1Match.name,
          files: {
            'skill.md': content,
          },
          source_path: v1Match.path,
          _instruction: `V1 skill "${v1Match.name}" is a single markdown file. Consider upgrading to V2 format with spawner_skill_upgrade.`,
        };
      }
    }
  }

  // Not found
  const similar = findSimilarSkills(name, v1Registry, v2Skills);
  throw new Error(`Skill "${name}" not found. Similar: ${similar.join(', ') || 'none'}`);
}

/**
 * Handle health action - scan all skills for completeness
 */
async function handleHealth(
  env: Env,
  v1Registry: V1SkillRegistry | null,
  v2Skills: V2Skill[]
): Promise<SkillsOutput> {
  const issues: Array<{
    skill_id: string;
    skill_name: string;
    source: 'v1' | 'v2';
    missing_files: string[];
    warnings: string[];
  }> = [];

  // Check V2 skills (expected: skill.yaml, sharp-edges.yaml, validations.yaml, collaboration.yaml)
  for (const skill of v2Skills) {
    const skillIssue = {
      skill_id: skill.id,
      skill_name: skill.name,
      source: 'v2' as const,
      missing_files: [] as string[],
      warnings: [] as string[],
    };

    // Check for each expected file
    const skillData = await env.SKILLS.get(`skill:${skill.id}`);
    if (!skillData) {
      skillIssue.missing_files.push('skill.yaml');
    }

    const edgesData = await env.SHARP_EDGES.get(`edges:${skill.id}`);
    if (!edgesData) {
      skillIssue.missing_files.push('sharp-edges.yaml');
    }

    const validationsData = await env.SKILLS.get(`validations:${skill.id}`);
    if (!validationsData) {
      skillIssue.missing_files.push('validations.yaml');
    }

    const collabData = await env.SKILLS.get(`collaboration:${skill.id}`);
    if (!collabData) {
      skillIssue.missing_files.push('collaboration.yaml');
    }

    // Check metadata quality
    if (!skill.description || skill.description.length < 10) {
      skillIssue.warnings.push('Description too short or missing');
    }
    if (!skill.tags || skill.tags.length === 0) {
      skillIssue.warnings.push('No tags defined');
    }
    if (!skill.triggers || skill.triggers.length === 0) {
      skillIssue.warnings.push('No triggers defined');
    }
    if (!skill.has_validations) {
      skillIssue.warnings.push('No validations (has_validations=false)');
    }
    if (!skill.has_sharp_edges) {
      skillIssue.warnings.push('No sharp edges (has_sharp_edges=false)');
    }

    // Only add to issues if there are problems
    if (skillIssue.missing_files.length > 0 || skillIssue.warnings.length > 0) {
      issues.push(skillIssue);
    }
  }

  // Check V1 skills
  if (v1Registry) {
    for (const skill of v1Registry.specialists) {
      const skillIssue = {
        skill_id: normalizeSkillId(skill.name),
        skill_name: skill.name,
        source: 'v1' as const,
        missing_files: [] as string[],
        warnings: [] as string[],
      };

      // Check if skill content exists
      const content = await env.SKILLS.get(`v1:skill:${skill.name}`);
      if (!content) {
        skillIssue.missing_files.push('skill.md');
      }

      // Check metadata quality
      if (!skill.description || skill.description.length < 10) {
        skillIssue.warnings.push('Description too short or missing');
      }
      if (!skill.tags || skill.tags.length === 0) {
        skillIssue.warnings.push('No tags defined');
      }

      // V1 skills inherently lack structured validations
      skillIssue.warnings.push('V1 format - consider upgrading to V2');

      if (skillIssue.missing_files.length > 0 || skillIssue.warnings.length > 0) {
        issues.push(skillIssue);
      }
    }
  }

  // Calculate totals
  const totalV1 = v1Registry?.specialists.length ?? 0;
  const totalV2 = v2Skills.length;
  const total = totalV1 + totalV2;
  const incomplete = issues.filter(i => i.missing_files.length > 0).length;
  const healthy = total - incomplete;

  const summary = `${healthy}/${total} skills healthy, ${incomplete} incomplete`;

  // Build instruction with details
  const lines: string[] = [
    `**Skill Health Check**`,
    '',
    `Total skills: ${total} (V1: ${totalV1}, V2: ${totalV2})`,
    `Healthy: ${healthy}`,
    `Incomplete: ${incomplete}`,
    '',
  ];

  if (issues.length > 0) {
    lines.push('**Issues Found:**');
    lines.push('');

    // Group by severity (missing files first)
    const critical = issues.filter(i => i.missing_files.length > 0);
    const warnings = issues.filter(i => i.missing_files.length === 0);

    if (critical.length > 0) {
      lines.push('*Missing Files (Critical):*');
      for (const issue of critical) {
        lines.push(`  - [${issue.source.toUpperCase()}] ${issue.skill_name}`);
        lines.push(`    Missing: ${issue.missing_files.join(', ')}`);
      }
      lines.push('');
    }

    if (warnings.length > 0) {
      lines.push('*Warnings:*');
      for (const issue of warnings) {
        lines.push(`  - [${issue.source.toUpperCase()}] ${issue.skill_name}: ${issue.warnings.join('; ')}`);
      }
    }
  } else {
    lines.push('All skills are complete and healthy!');
  }

  return {
    health: {
      total,
      healthy,
      incomplete,
      issues,
      summary,
    },
    _instruction: lines.join('\n'),
  };
}

/**
 * Handle sync action - export all skills with their files
 */
async function handleSync(
  env: Env,
  v1Registry: V1SkillRegistry | null,
  v2Skills: V2Skill[]
): Promise<SkillsOutput> {
  const syncedSkills: Array<{
    id: string;
    name: string;
    source: 'v1' | 'v2';
    path: string;
    files: Record<string, string>;
  }> = [];

  let totalFiles = 0;

  // Export V2 skills
  for (const skill of v2Skills) {
    const files: Record<string, string> = {};

    // Load all files
    const skillData = await env.SKILLS.get(`skill:${skill.id}`, 'text');
    if (skillData) {
      files['skill.yaml'] = skillData;
      totalFiles++;
    }

    const edgesData = await env.SHARP_EDGES.get(`edges:${skill.id}`, 'text');
    if (edgesData) {
      files['sharp-edges.yaml'] = edgesData;
      totalFiles++;
    }

    const validationsData = await env.SKILLS.get(`validations:${skill.id}`, 'text');
    if (validationsData) {
      files['validations.yaml'] = validationsData;
      totalFiles++;
    }

    const collabData = await env.SKILLS.get(`collaboration:${skill.id}`, 'text');
    if (collabData) {
      files['collaboration.yaml'] = collabData;
      totalFiles++;
    }

    // Determine path based on layer
    const layerFolder = skill.layer === 1 ? 'development' :
      skill.layer === 2 ? 'frameworks' : 'marketing';

    syncedSkills.push({
      id: skill.id,
      name: skill.name,
      source: 'v2',
      path: `skills/${layerFolder}/${skill.id}/`,
      files,
    });
  }

  // Export V1 skills
  if (v1Registry) {
    for (const skill of v1Registry.specialists) {
      const content = await env.SKILLS.get(`v1:skill:${skill.name}`, 'text');
      if (content) {
        syncedSkills.push({
          id: normalizeSkillId(skill.name),
          name: skill.name,
          source: 'v1',
          path: skill.path,
          files: {
            'skill.md': content,
          },
        });
        totalFiles++;
      }
    }
  }

  const lines: string[] = [
    `**Skill Sync Export**`,
    '',
    `Total skills: ${syncedSkills.length}`,
    `Total files: ${totalFiles}`,
    '',
    'Skills by source:',
    `  V2: ${syncedSkills.filter(s => s.source === 'v2').length}`,
    `  V1: ${syncedSkills.filter(s => s.source === 'v1').length}`,
    '',
    'To sync to local directory:',
    '1. Parse the sync.skills array',
    '2. For each skill, create the directory at skill.path',
    '3. Write each file in skill.files to that directory',
    '',
    'Example paths:',
  ];

  // Show first few examples
  for (const skill of syncedSkills.slice(0, 3)) {
    lines.push(`  ${skill.path}`);
    for (const file of Object.keys(skill.files)) {
      lines.push(`    └─ ${file}`);
    }
  }

  if (syncedSkills.length > 3) {
    lines.push(`  ... and ${syncedSkills.length - 3} more skills`);
  }

  return {
    sync: {
      skills: syncedSkills,
      total_skills: syncedSkills.length,
      total_files: totalFiles,
    },
    _instruction: lines.join('\n'),
  };
}

/**
 * Handle local action - return local filesystem paths for Claude to read
 * This is the RECOMMENDED way to load skills - directly from local disk
 */
async function handleLocal(
  v1Registry: V1SkillRegistry | null,
  v2Skills: V2Skill[],
  name: string
): Promise<SkillsOutput> {
  const normalized = normalizeSkillId(name);

  // Find skill in V2 first
  const v2Match = v2Skills.find(s =>
    (s.id && normalizeSkillId(s.id) === normalized) ||
    (s.name && normalizeSkillId(s.name) === normalized)
  );

  if (v2Match) {
    const localPath = await getLocalSkillPath(v2Match.id, undefined, v2Skills);
    const files = {
      skill: `${localPath}/skill.yaml`,
      sharp_edges: `${localPath}/sharp-edges.yaml`,
      validations: `${localPath}/validations.yaml`,
      collaboration: `${localPath}/collaboration.yaml`,
    };

    const readCommands = [
      `Read: ${files.skill}`,
      `Read: ${files.sharp_edges}`,
      `Read: ${files.collaboration}`,
    ];

    return {
      local: {
        skill_id: v2Match.id,
        skill_name: v2Match.name,
        local_path: localPath,
        files,
        read_commands: readCommands,
      },
      local_path: localPath,
      _instruction: buildLocalInstruction(v2Match.id, v2Match.name, localPath, files),
    };
  }

  // Check V1
  if (v1Registry) {
    const v1Match = v1Registry.specialists.find(s =>
      s.name && normalizeSkillId(s.name) === normalized
    );

    if (v1Match) {
      const skillId = normalizeSkillId(v1Match.name);
      const localPath = await getLocalSkillPath(skillId, undefined, v2Skills);

      return {
        local_path: localPath,
        _instruction: `**V1 Skill: ${v1Match.name}**

This is a V1 (markdown) skill. Check if it exists locally:

\`\`\`
Read: ${localPath}/skill.md
\`\`\`

If not found, the skill may only be in the MCP's KV storage. Use \`action="get"\` to retrieve from remote.`,
      };
    }
  }

  // Not found - provide installation instructions
  const similar = findSimilarSkills(name, v1Registry, v2Skills);
  return {
    _instruction: buildNotFoundLocalInstruction(name, similar),
  };
}

/**
 * Handle local list - show all skills with their local paths
 */
async function handleLocalList(
  v1Registry: V1SkillRegistry | null,
  v2Skills: V2Skill[],
  query?: string,
  tag?: string
): Promise<SkillsOutput> {
  const results: Array<{
    id: string;
    name: string;
    local_path: string;
    files: string[];
  }> = [];

  // Filter and map V2 skills
  for (const skill of v2Skills) {
    // Apply filters if provided
    if (query) {
      const q = query.toLowerCase();
      const matches =
        skill.name?.toLowerCase().includes(q) ||
        skill.id?.toLowerCase().includes(q) ||
        safeArrayIncludes(skill.tags, q);
      if (!matches) continue;
    }
    if (tag && !safeArrayIncludes(skill.tags, tag.toLowerCase())) continue;

    const localPath = await getLocalSkillPath(skill.id, undefined, v2Skills);
    results.push({
      id: skill.id,
      name: skill.name,
      local_path: localPath,
      files: ['skill.yaml', 'sharp-edges.yaml', 'validations.yaml', 'collaboration.yaml'],
    });
  }

  // Sort by name (handle undefined)
  results.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

  const lines: string[] = [
    '# Local Skills Directory',
    '',
    `**Location:** \`${LOCAL_SKILLS_PATH}\``,
    `**Repository:** ${LOCAL_SKILLS_REPO}`,
    '',
    '## Quick Start',
    '',
    'To load a skill, use the Read tool with the path below:',
    '',
    '```',
    `Read: ${LOCAL_SKILLS_PATH}/<category>/<skill-id>/skill.yaml`,
    '```',
    '',
    '---',
    '',
    `## Available Skills (${results.length})`,
    '',
  ];

  // Group by inferred category
  const byCategory = new Map<string, typeof results>();
  for (const skill of results) {
    const category = inferCategoryFromSkillId(skill.id);
    if (!byCategory.has(category)) {
      byCategory.set(category, []);
    }
    byCategory.get(category)!.push(skill);
  }

  for (const [category, skills] of byCategory) {
    lines.push(`### ${category} (${skills.length})`);
    lines.push('');
    for (const skill of skills.slice(0, 10)) {
      lines.push(`- **${skill.name}**: \`${skill.local_path}\``);
    }
    if (skills.length > 10) {
      lines.push(`  ... and ${skills.length - 10} more`);
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('');
  lines.push('**To load a specific skill:** `spawner_skills({ action: "local", name: "skill-id" })`');

  return {
    local_hint: `Skills are stored at ${LOCAL_SKILLS_PATH}. Use the Read tool to load them.`,
    _instruction: lines.join('\n'),
  };
}

/**
 * Build instruction for local skill loading
 */
function buildLocalInstruction(
  skillId: string,
  skillName: string,
  localPath: string,
  files: { skill: string; sharp_edges: string; validations: string; collaboration: string }
): string {
  return `# Load Skill: ${skillName}

**Skill ID:** ${skillId}
**Local Path:** ${localPath}

## Read Commands (copy these)

To load this skill, use the Read tool with these paths:

\`\`\`
Read: ${files.skill}
Read: ${files.sharp_edges}
Read: ${files.collaboration}
\`\`\`

## What Each File Contains

| File | Purpose |
|------|---------|
| skill.yaml | Identity, patterns, anti-patterns, handoffs |
| sharp-edges.yaml | Gotchas with detection patterns |
| validations.yaml | Automated code checks |
| collaboration.yaml | Prerequisites, delegation, cross-domain insights |

---

**IMPORTANT:** The files above are on your LOCAL filesystem at \`${LOCAL_SKILLS_PATH}\`.
If not found, clone the skills repo:

\`\`\`bash
git clone ${LOCAL_SKILLS_REPO} ~/.spawner/skills
\`\`\``;
}

/**
 * Build instruction when skill not found locally
 */
function buildNotFoundLocalInstruction(name: string, similar: string[]): string {
  const lines = [
    `# Skill Not Found: ${name}`,
    '',
    'This skill was not found in the skills index.',
    '',
  ];

  if (similar.length > 0) {
    lines.push('**Did you mean:**');
    for (const s of similar) {
      lines.push(`- ${s}`);
    }
    lines.push('');
  }

  lines.push('## Install Skills');
  lines.push('');
  lines.push('Skills should be installed locally at `~/.spawner/skills/`.');
  lines.push('');
  lines.push('**Quick install (recommended):**');
  lines.push('```bash');
  lines.push('npx vibeship-spawner-skills install');
  lines.push('```');
  lines.push('');
  lines.push('**Alternative (manual clone):**');
  lines.push('```bash');
  lines.push(`git clone ${LOCAL_SKILLS_REPO} ~/.spawner/skills`);
  lines.push('```');
  lines.push('');
  lines.push('**Update existing:**');
  lines.push('```bash');
  lines.push('npx vibeship-spawner-skills update');
  lines.push('# or: cd ~/.spawner/skills && git pull');
  lines.push('```');
  lines.push('');
  lines.push('After installation, try again with:');
  lines.push(`\`spawner_skills({ action: "local", name: "${name}" })\``);

  return lines.join('\n');
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
  if (tag && !safeArrayIncludes(skill.tags, tag.toLowerCase())) return false;

  if (query) {
    const q = query.toLowerCase();
    return (
      (skill.name?.toLowerCase().includes(q) ?? false) ||
      (skill.description?.toLowerCase().includes(q) ?? false) ||
      safeArrayIncludes(skill.tags, q) ||
      safeArrayIncludes(skill.triggers, q)
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
  if (tag && !safeArrayIncludes(skill.tags, tag.toLowerCase())) return false;

  if (query) {
    const q = query.toLowerCase();
    return (
      (skill.name?.toLowerCase().includes(q) ?? false) ||
      (skill.id?.toLowerCase().includes(q) ?? false) ||
      (skill.description?.toLowerCase().includes(q) ?? false) ||
      safeArrayIncludes(skill.tags, q) ||
      safeArrayIncludes(skill.triggers, q)
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
  lines.push('**To load a skill:**');
  lines.push('- `action="local", name="<skill>"` → Get local paths for Read tool (RECOMMENDED)');
  lines.push('- `action="get", name="<skill>"` → Load from remote KV');

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
  lines.push('');
  lines.push('**To load a skill:**');
  lines.push(`- \`action="local", name="<skill>"\` → Get local paths for Read tool (RECOMMENDED)`);
  lines.push(`- Skills are stored at: \`${LOCAL_SKILLS_PATH}\``);

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
