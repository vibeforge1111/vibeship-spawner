/**
 * spawner_context Tool
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
import { loadRelevantSkills, loadSkillEdges, type Skill } from '../skills/loader';
import { emitEvent } from '../telemetry/events';

/**
 * Input schema for spawner_context
 */
export const contextInputSchema = z.object({
  project_id: z.string().optional().describe(
    'Existing project ID to load context for'
  ),
  project_description: z.string().optional().describe(
    'Description of what you\'re building - used to find or create a project'
  ),
  stack_hints: z.array(z.string()).optional().describe(
    'Technology hints to help load relevant skills (e.g., ["nextjs", "supabase"])'
  ),
});

/**
 * Tool definition for MCP
 */
export const contextToolDefinition = {
  name: 'spawner_context',
  description: 'Load project context and relevant skills for this session. Use this at the start of a session or when switching contexts.',
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
    },
  },
};

/**
 * Execute the spawner_context tool
 */
export async function executeContext(
  env: Env,
  input: ContextInput,
  userId: string
): Promise<ContextOutput | { message: string; error?: boolean }> {
  // Validate input
  const parsed = contextInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      message: `Invalid input: ${parsed.error.message}`,
      error: true,
    };
  }

  const { project_id, project_description, stack_hints } = parsed.data;

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
    skills: skillsSummary,
    sharp_edges: sharpEdges.slice(0, 10), // Top 10 most relevant
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
  const lines = [
    'Project context loaded. You now have access to:',
    `- ${skillCount} relevant skill${skillCount !== 1 ? 's' : ''}`,
    `- ${edgeCount} sharp edge${edgeCount !== 1 ? 's' : ''} for this stack`,
  ];

  if (lastSessionSummary) {
    lines.push(`- Last session context: ${lastSessionSummary}`);
  }

  if (openIssuesCount > 0) {
    lines.push(`- ${openIssuesCount} open issue${openIssuesCount !== 1 ? 's' : ''} to address`);
  }

  lines.push('');
  lines.push('Available tools:');
  lines.push('- spawner_validate: Check code before marking tasks complete');
  lines.push('- spawner_sharp_edge: Query gotchas matching your current situation');
  lines.push('- spawner_remember: Save important decisions or progress');
  lines.push('- spawner_unstick: Get help when stuck on a problem');

  return lines.join('\n');
}

/**
 * Create the tool handler
 */
export function contextTool(env: Env) {
  return {
    definition: contextToolDefinition,
    execute: (input: ContextInput, userId: string) =>
      executeContext(env, input, userId),
  };
}
