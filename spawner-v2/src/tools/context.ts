/**
 * spawner_load Tool (was: spawner_context)
 *
 * Load project context and relevant skills for this session.
 * This is the primary entry point for establishing session context.
 */

import { z } from 'zod';
import type { Env, ContextInput, ContextOutput, Project, Issue } from '../types';
import {
  loadProject,
  findOrCreateProject,
  touchProject,
} from '../db/projects';
import { getLastSession } from '../db/sessions';
import { getOpenIssues } from '../db/issues';
import { getRecentDecisions } from '../db/decisions';
import {
  loadRelevantSkills,
  loadSkillEdges,
  loadSkill,
  formatSkillContext,
  type Skill,
} from '../skills/loader';
import { emitEvent } from '../telemetry/events';

/**
 * Input schema for spawner_load
 */
export const loadInputSchema = z.object({
  project_id: z.string().optional().describe(
    'Existing project ID to load context for'
  ),
  project_description: z.string().optional().describe(
    'Description of what you\'re building - used to find or create a project'
  ),
  stack_hints: z.array(z.string()).optional().describe(
    'Technology hints to help load relevant skills (e.g., ["nextjs", "supabase"])'
  ),
  // Handoff parameters - for loading a specific skill during collaboration
  skill_id: z.string().optional().describe(
    'Load a specific skill by ID - used for handoffs between specialists'
  ),
  context: z.string().optional().describe(
    'Context from previous skill - what was being built, current state, user goal'
  ),
  previous_skill: z.string().optional().describe(
    'ID of the skill that initiated the handoff - prevents circular handoffs'
  ),
});

/**
 * Tool definition for MCP
 */
export const loadToolDefinition = {
  name: 'spawner_load',
  description: 'Load project context and skills, or load a specific skill for handoffs between specialists. Use skill_id for handoffs.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      project_id: {
        type: 'string',
        description: 'Existing project ID to load context for',
      },
      project_description: {
        type: 'string',
        description: 'Description of what you\'re building - used to find or create a project',
      },
      stack_hints: {
        type: 'array',
        items: { type: 'string' },
        description: 'Technology hints to help load relevant skills (e.g., ["nextjs", "supabase"])',
      },
      skill_id: {
        type: 'string',
        description: 'Load a specific skill by ID - used for handoffs between specialists (e.g., "nextjs-supabase-auth")',
      },
      context: {
        type: 'string',
        description: 'Context from previous skill - what was being built, current state, user goal',
      },
      previous_skill: {
        type: 'string',
        description: 'ID of the skill that initiated the handoff - prevents circular handoffs',
      },
    },
  },
};

/**
 * Output type for skill handoff loading
 */
interface SkillHandoffOutput {
  skill_content: string;
  _instruction: string;
}

/**
 * Execute the spawner_load tool
 */
export async function executeLoad(
  env: Env,
  input: ContextInput,
  userId: string
): Promise<ContextOutput | SkillHandoffOutput | { message: string; error?: boolean }> {
  // Validate input
  const parsed = loadInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      message: `Invalid input: ${parsed.error.message}`,
      error: true,
    };
  }

  const {
    project_id,
    project_description,
    stack_hints,
    skill_id,
    context,
    previous_skill,
  } = parsed.data;

  // HANDOFF MODE: If skill_id is provided, load that specific skill
  if (skill_id) {
    return await executeSkillHandoff(env, skill_id, context, previous_skill);
  }

  // 1. Load or create project
  let project: Project | null = null;

  if (project_id) {
    project = await loadProject(env.DB, project_id, userId);
    if (!project) {
      return {
        message: `Project not found: ${project_id}. It may not exist or you may not have access.`,
        error: true,
      };
    }
  } else if (project_description) {
    project = await findOrCreateProject(env.DB, userId, project_description);
  } else {
    // Check cache for recent project
    const cached = await env.CACHE.get<{ project: Project; skills: string[] }>(
      `session:${userId}`,
      'json'
    );

    if (cached?.project) {
      project = cached.project;
    } else {
      return {
        message: 'No project context. Describe what you\'re building or provide a project_id.',
      };
    }
  }

  // 2. Determine relevant skills
  const stack = stack_hints ?? project.stack ?? [];
  const skills = await loadRelevantSkills(env, stack);

  // 3. Load sharp edges for matched skills
  const sharpEdges: Awaited<ReturnType<typeof loadSkillEdges>> = [];
  for (const skill of skills) {
    const edges = await loadSkillEdges(env, skill.id);
    sharpEdges.push(...edges);
  }

  // 4. Get last session summary
  const lastSession = await getLastSession(env.DB, project.id);

  // 5. Get open issues
  const openIssues = await getOpenIssues(env.DB, project.id);

  // 5b. Get recent decisions (for session resume)
  const recentDecisions = await getRecentDecisions(env.DB, project.id, 3);

  // 6. Cache for quick access
  await env.CACHE.put(
    `session:${userId}`,
    JSON.stringify({
      project,
      skills: skills.map(s => s.id),
      timestamp: new Date().toISOString(),
    }),
    { expirationTtl: 3600 } // 1 hour
  );

  // 7. Touch project (update timestamp)
  await touchProject(env.DB, project.id);

  // 8. Emit telemetry
  await emitEvent(
    env.DB,
    'session_start',
    {
      skills_loaded: skills.map(s => s.id),
      stack,
      has_last_session: !!lastSession,
      open_issues_count: openIssues.length,
    },
    project.id
  );

  // 9. Build response
  const skillsSummary = skills.map(s => ({
    id: s.id,
    name: s.name,
    owns: s.owns,
    sharp_edges_count: s.sharp_edges_count,
  }));

  const instruction = buildInstruction(
    skills.length,
    sharpEdges.length,
    lastSession?.summary,
    openIssues.length
  );

  return {
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      stack: project.stack,
    },
    last_session: lastSession?.summary,
    open_issues: openIssues,
    recent_decisions: recentDecisions.map(d => ({
      what: d.decision,
      why: d.reasoning,
      when: d.created_at,
    })),
    skills: skillsSummary,
    sharp_edges: sharpEdges.slice(0, 10), // Top 10 most relevant
    _instruction: instruction,
  };
}

/**
 * Execute skill handoff - load a specific skill with handoff protocol
 */
async function executeSkillHandoff(
  env: Env,
  skillId: string,
  context?: string,
  previousSkill?: string
): Promise<SkillHandoffOutput | { message: string; error?: boolean }> {
  // Load the requested skill
  const skill = await loadSkill(env, skillId);
  if (!skill) {
    return {
      message: `Skill "${skillId}" not found. Use spawner_skills to search for available skills.`,
      error: true,
    };
  }

  // Load sharp edges for this skill
  const edges = await loadSkillEdges(env, skillId);

  // Render skill with handoff protocol
  let skillContent = formatSkillContext(skill, edges, {
    previousSkill,
    includeHandoffs: true,
  });

  // Add context from previous skill if provided
  if (context) {
    skillContent += `\n\n---\n\n## Context From Previous Skill\n\n${context}`;
  }

  // Build instruction
  const hasHandoffs = skill.handoffs && skill.handoffs.length > 0;
  const instruction = [
    previousSkill
      ? `🔄 **Handoff received from ${previousSkill}**`
      : `✓ Loaded skill: **${skill.name}**`,
    '',
    hasHandoffs ? '✓ Handoff protocol active - will route to specialists when needed' : '',
    edges.length > 0 ? `✓ ${edges.length} sharp edge${edges.length !== 1 ? 's' : ''} loaded` : '',
    skill.patterns?.length ? `✓ ${skill.patterns.length} pattern${skill.patterns.length !== 1 ? 's' : ''} available` : '',
    '',
    'You are now operating as this specialist. Follow the handoff protocol when topics go outside your domain.',
  ].filter(Boolean).join('\n');

  return {
    skill_content: skillContent,
    _instruction: instruction,
  };
}

/**
 * Build the instruction string for Claude
 */
function buildInstruction(
  skillCount: number,
  edgeCount: number,
  lastSessionSummary: string | undefined,
  openIssuesCount: number
): string {
  const lines: string[] = [];

  // Session resume header
  if (lastSessionSummary || openIssuesCount > 0) {
    lines.push('📍 **Picking up where we left off:**');
    if (lastSessionSummary) {
      lines.push(`Last session: ${lastSessionSummary}`);
    }
    if (openIssuesCount > 0) {
      lines.push(`⚠️ ${openIssuesCount} open issue${openIssuesCount !== 1 ? 's' : ''} need attention`);
    }
    lines.push('');
  }

  // Context loaded
  lines.push('Project context loaded:');
  lines.push(`- ${skillCount} relevant skill${skillCount !== 1 ? 's' : ''} active`);
  lines.push(`- ${edgeCount} sharp edge${edgeCount !== 1 ? 's' : ''} (gotchas to watch for)`);

  lines.push('');
  lines.push('Available tools:');
  lines.push('- spawner_validate: Check code before marking tasks complete');
  lines.push('- spawner_watch_out: Query gotchas for your current situation');
  lines.push('- spawner_remember: Save decisions or session progress');
  lines.push('- spawner_unstick: Get help when stuck on a problem');

  return lines.join('\n');
}

/**
 * Create the tool handler
 */
export function loadTool(env: Env) {
  return {
    definition: loadToolDefinition,
    execute: (input: ContextInput, userId: string) =>
      executeLoad(env, input, userId),
  };
}
