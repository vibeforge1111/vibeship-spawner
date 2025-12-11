/**
 * spawner_remember Tool
 *
 * Save project decisions, issues, or session progress for future sessions.
 */

import { z } from 'zod';
import type { Env, RememberInput, RememberOutput } from '../types';
import { loadProject, touchProject, findProjectsByUser, createProject } from '../db/projects';
import { createSession } from '../db/sessions';
import { createDecision } from '../db/decisions';
import { createIssue, resolveIssueByDescription } from '../db/issues';

/**
 * Input schema for spawner_remember
 */
export const rememberInputSchema = z.object({
  project_id: z.string().optional().describe('Optional project ID - will use most recent project or create one if not provided'),
  update: z.object({
    decision: z.object({
      what: z.string().describe('What was decided'),
      why: z.string().describe('Why this decision was made'),
    }).optional().describe('A decision to record'),
    issue: z.object({
      description: z.string().describe('Description of the issue'),
      status: z.enum(['open', 'resolved']).describe('Current status'),
    }).optional().describe('An issue to track or resolve'),
    session_summary: z.string().optional().describe(
      'Summary of what was accomplished in this session'
    ),
    validated: z.array(z.string()).optional().describe(
      'List of validation checks that passed'
    ),
  }),
});

/**
 * Tool definition for MCP
 */
export const rememberToolDefinition = {
  name: 'spawner_remember',
  description: 'Save project decisions, issues, or session progress for future sessions. Use this to record important context that should persist.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      project_id: {
        type: 'string',
        description: 'Optional project ID - will use most recent project or create one if not provided',
      },
      update: {
        type: 'object',
        properties: {
          decision: {
            type: 'object',
            properties: {
              what: { type: 'string', description: 'What was decided' },
              why: { type: 'string', description: 'Why this decision was made' },
            },
            required: ['what', 'why'],
            description: 'A decision to record',
          },
          issue: {
            type: 'object',
            properties: {
              description: { type: 'string', description: 'Description of the issue' },
              status: {
                type: 'string',
                enum: ['open', 'resolved'],
                description: 'Current status',
              },
            },
            required: ['description', 'status'],
            description: 'An issue to track or resolve',
          },
          session_summary: {
            type: 'string',
            description: 'Summary of what was accomplished in this session',
          },
          validated: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of validation checks that passed',
          },
        },
        description: 'Updates to save',
      },
    },
    required: ['update'],
  },
};

/**
 * Resolve project_id: use provided, find most recent, or create new
 */
async function resolveProjectId(
  env: Env,
  userId: string,
  providedId?: string
): Promise<{ projectId: string; wasCreated: boolean; projectName: string }> {
  // If provided, verify it exists
  if (providedId) {
    const project = await loadProject(env.DB, providedId, userId);
    if (project) {
      return { projectId: providedId, wasCreated: false, projectName: project.name };
    }
    // Project not found, will create new one
  }

  // Try to find most recent project
  const recentProjects = await findProjectsByUser(env.DB, userId, 1);
  const recentProject = recentProjects[0];
  if (recentProject) {
    return {
      projectId: recentProject.id,
      wasCreated: false,
      projectName: recentProject.name,
    };
  }

  // Create new project
  const newProject = await createProject(
    env.DB,
    userId,
    'My Project',
    'Auto-created for saving decisions and progress'
  );

  return {
    projectId: newProject.id,
    wasCreated: true,
    projectName: newProject.name,
  };
}

/**
 * Execute the spawner_remember tool
 */
export async function executeRemember(
  env: Env,
  input: RememberInput,
  userId: string
): Promise<RememberOutput | { error: string; what_to_do: string; example: string }> {
  // Validate input
  const parsed = rememberInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      error: 'I need to know what to remember',
      what_to_do: 'Pass an update object with a decision, issue, or session_summary',
      example: 'spawner_remember({ update: { decision: { what: "Use Supabase for auth", why: "Built-in RLS and easy setup" } } })',
    };
  }

  const { project_id, update } = parsed.data;

  // Resolve project ID (auto-create if needed)
  const { projectId, wasCreated, projectName } = await resolveProjectId(
    env,
    userId,
    project_id
  );

  const saved: string[] = [];

  // Save decision
  if (update.decision) {
    await createDecision(
      env.DB,
      projectId,
      update.decision.what,
      update.decision.why
    );
    saved.push('decision');
  }

  // Save or update issue
  if (update.issue) {
    if (update.issue.status === 'resolved') {
      // Try to find and resolve existing issue
      const resolved = await resolveIssueByDescription(
        env.DB,
        projectId,
        update.issue.description
      );
      if (resolved > 0) {
        saved.push(`issue resolved (${resolved} matched)`);
      } else {
        // No matching issue found, create as resolved
        const issue = await createIssue(env.DB, projectId, update.issue.description);
        await resolveIssueByDescription(env.DB, projectId, issue.description);
        saved.push('issue (created and resolved)');
      }
    } else {
      await createIssue(env.DB, projectId, update.issue.description);
      saved.push('issue');
    }
  }

  // Save session summary
  if (update.session_summary) {
    await createSession(env.DB, projectId, update.session_summary, {
      validations_passed: update.validated,
    });
    saved.push('session');
  }

  // Touch project (update timestamp)
  await touchProject(env.DB, projectId);

  // Invalidate cache
  await env.CACHE.delete(`project:${projectId}`);

  // Build rich response
  const savedDescription = saved.join(' and ');

  return {
    success: true,
    saved,
    project_id: projectId,
    project_name: projectName,
    was_project_created: wasCreated,
    what_happened: wasCreated
      ? `Created project "${projectName}" and saved your ${savedDescription}`
      : `Saved your ${savedDescription} to "${projectName}"`,
    what_this_means: "I'll remember this across sessions and reference it when relevant",
    next_steps: [
      'Continue building - I\'ll use this context when it\'s relevant',
      `Load full context with: spawner_load({ project_id: "${projectId}" })`,
      'Use spawner_remember again to save more decisions or progress',
    ],
    message: saved.length > 0
      ? `Remembered: ${saved.join(', ')}. This will be available in future sessions.`
      : 'Nothing to save. Provide a decision, issue, or session_summary.',
  };
}

/**
 * Create the tool handler
 */
export function rememberTool(env: Env) {
  return {
    definition: rememberToolDefinition,
    execute: (input: RememberInput, userId: string) =>
      executeRemember(env, input, userId),
  };
}
