/**
 * spawner_remember Tool
 *
 * Save project decisions, issues, or session progress for future sessions.
 */

import { z } from 'zod';
import type { Env, RememberInput, RememberOutput } from '../types';
import { loadProject, touchProject } from '../db/projects';
import { createSession } from '../db/sessions';
import { createDecision } from '../db/decisions';
import { createIssue, resolveIssueByDescription } from '../db/issues';

/**
 * Input schema for spawner_remember
 */
export const rememberInputSchema = z.object({
  project_id: z.string().describe('The project ID to save to'),
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
        description: 'The project ID to save to',
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
    required: ['project_id', 'update'],
  },
};

/**
 * Execute the spawner_remember tool
 */
export async function executeRemember(
  env: Env,
  input: RememberInput,
  userId: string
): Promise<RememberOutput | { error: string }> {
  // Validate input
  const parsed = rememberInputSchema.safeParse(input);
  if (!parsed.success) {
    return { error: `Invalid input: ${parsed.error.message}` };
  }

  const { project_id, update } = parsed.data;

  // Verify project ownership
  const project = await loadProject(env.DB, project_id, userId);
  if (!project) {
    return { error: 'Project not found or access denied' };
  }

  const saved: string[] = [];

  // Save decision
  if (update.decision) {
    await createDecision(
      env.DB,
      project_id,
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
        project_id,
        update.issue.description
      );
      if (resolved > 0) {
        saved.push(`issue resolved (${resolved} matched)`);
      } else {
        // No matching issue found, create as resolved
        const issue = await createIssue(env.DB, project_id, update.issue.description);
        await resolveIssueByDescription(env.DB, project_id, issue.description);
        saved.push('issue (created and resolved)');
      }
    } else {
      await createIssue(env.DB, project_id, update.issue.description);
      saved.push('issue');
    }
  }

  // Save session summary
  if (update.session_summary) {
    await createSession(env.DB, project_id, update.session_summary, {
      validations_passed: update.validated,
    });
    saved.push('session');
  }

  // Touch project (update timestamp)
  await touchProject(env.DB, project_id);

  // Invalidate cache
  await env.CACHE.delete(`project:${project_id}`);

  return {
    saved,
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
