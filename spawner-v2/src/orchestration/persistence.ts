/**
 * Workflow State Persistence
 *
 * Save and restore workflow/team state to D1 for resume capability.
 */

import type { Env } from '../types.js';
import type { WorkflowState } from './workflow.js';
import type { ActiveTeam } from './teams.js';

// =============================================================================
// Types
// =============================================================================

export interface PersistedWorkflowState {
  id: string;
  workflow_id: string;
  workflow_name: string;
  status: string;
  current_step: number;
  total_steps: number;
  state_data: Record<string, unknown>;
  history: Array<{
    step_index: number;
    skill: string;
    status: string;
    duration_ms: number;
  }>;
  started_at: number;
  updated_at: number;
  completed_at?: number;
  error?: string;
  user_id?: string;
}

export interface PersistedTeamState {
  id: string;
  team_id: string;
  team_name: string;
  current_lead: string;
  members: string[];
  state_data: Record<string, unknown>;
  communication_log: Array<{
    from: string;
    to: string;
    message: string;
    timestamp: number;
  }>;
  started_at: number;
  updated_at: number;
  user_id?: string;
}

// =============================================================================
// Workflow Persistence
// =============================================================================

/**
 * Save workflow state to D1
 */
export async function saveWorkflowState(
  env: Env,
  workflowName: string,
  state: WorkflowState,
  totalSteps: number,
  userId?: string
): Promise<string> {
  const id = `wf_${state.workflow_id}_${state.started_at}`;

  await env.DB.prepare(`
    INSERT OR REPLACE INTO workflow_state (
      id, workflow_id, workflow_name, status, current_step, total_steps,
      state_data, history, started_at, updated_at, completed_at, error, user_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    state.workflow_id,
    workflowName,
    state.status,
    state.current_step,
    totalSteps,
    JSON.stringify(state.data),
    JSON.stringify(state.history),
    state.started_at,
    state.updated_at,
    state.status === 'completed' ? Date.now() : null,
    state.error || null,
    userId || null
  ).run();

  return id;
}

/**
 * Load workflow state from D1
 */
export async function loadWorkflowState(
  env: Env,
  id: string
): Promise<PersistedWorkflowState | null> {
  const result = await env.DB.prepare(`
    SELECT * FROM workflow_state WHERE id = ?
  `).bind(id).first();

  if (!result) return null;

  return {
    id: result.id as string,
    workflow_id: result.workflow_id as string,
    workflow_name: result.workflow_name as string,
    status: result.status as string,
    current_step: result.current_step as number,
    total_steps: result.total_steps as number,
    state_data: JSON.parse(result.state_data as string || '{}'),
    history: JSON.parse(result.history as string || '[]'),
    started_at: result.started_at as number,
    updated_at: result.updated_at as number,
    completed_at: result.completed_at as number | undefined,
    error: result.error as string | undefined,
    user_id: result.user_id as string | undefined
  };
}

/**
 * List active (non-completed) workflows
 */
export async function listActiveWorkflows(
  env: Env,
  userId?: string
): Promise<PersistedWorkflowState[]> {
  let query = `
    SELECT * FROM workflow_state
    WHERE status IN ('running', 'pending', 'blocked')
  `;

  if (userId) {
    query += ` AND user_id = ?`;
  }

  query += ` ORDER BY updated_at DESC LIMIT 10`;

  const results = userId
    ? await env.DB.prepare(query).bind(userId).all()
    : await env.DB.prepare(query).all();

  return (results.results || []).map(row => ({
    id: row.id as string,
    workflow_id: row.workflow_id as string,
    workflow_name: row.workflow_name as string,
    status: row.status as string,
    current_step: row.current_step as number,
    total_steps: row.total_steps as number,
    state_data: JSON.parse(row.state_data as string || '{}'),
    history: JSON.parse(row.history as string || '[]'),
    started_at: row.started_at as number,
    updated_at: row.updated_at as number,
    completed_at: row.completed_at as number | undefined,
    error: row.error as string | undefined,
    user_id: row.user_id as string | undefined
  }));
}

/**
 * Update workflow status
 */
export async function updateWorkflowStatus(
  env: Env,
  id: string,
  status: string,
  currentStep?: number,
  error?: string
): Promise<void> {
  let query = `
    UPDATE workflow_state
    SET status = ?, updated_at = ?
  `;
  const params: (string | number | null)[] = [status, Date.now()];

  if (currentStep !== undefined) {
    query += `, current_step = ?`;
    params.push(currentStep);
  }

  if (error !== undefined) {
    query += `, error = ?`;
    params.push(error);
  }

  if (status === 'completed') {
    query += `, completed_at = ?`;
    params.push(Date.now());
  }

  query += ` WHERE id = ?`;
  params.push(id);

  await env.DB.prepare(query).bind(...params).run();
}

// =============================================================================
// Team Persistence
// =============================================================================

/**
 * Save team state to D1
 */
export async function saveTeamState(
  env: Env,
  activeTeam: ActiveTeam,
  userId?: string
): Promise<string> {
  const id = `team_${activeTeam.team.id}_${activeTeam.started_at}`;

  await env.DB.prepare(`
    INSERT OR REPLACE INTO team_state (
      id, team_id, team_name, current_lead, members,
      state_data, communication_log, started_at, updated_at, user_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    activeTeam.team.id,
    activeTeam.team.name,
    activeTeam.current_lead,
    JSON.stringify(activeTeam.members.map(m => m.skill_id)),
    JSON.stringify(activeTeam.state),
    JSON.stringify(activeTeam.communication_log),
    activeTeam.started_at,
    Date.now(),
    userId || null
  ).run();

  return id;
}

/**
 * Load team state from D1
 */
export async function loadTeamState(
  env: Env,
  id: string
): Promise<PersistedTeamState | null> {
  const result = await env.DB.prepare(`
    SELECT * FROM team_state WHERE id = ?
  `).bind(id).first();

  if (!result) return null;

  return {
    id: result.id as string,
    team_id: result.team_id as string,
    team_name: result.team_name as string,
    current_lead: result.current_lead as string,
    members: JSON.parse(result.members as string || '[]'),
    state_data: JSON.parse(result.state_data as string || '{}'),
    communication_log: JSON.parse(result.communication_log as string || '[]'),
    started_at: result.started_at as number,
    updated_at: result.updated_at as number,
    user_id: result.user_id as string | undefined
  };
}

/**
 * List active teams
 */
export async function listActiveTeams(
  env: Env,
  userId?: string
): Promise<PersistedTeamState[]> {
  let query = `SELECT * FROM team_state`;

  if (userId) {
    query += ` WHERE user_id = ?`;
  }

  query += ` ORDER BY updated_at DESC LIMIT 10`;

  const results = userId
    ? await env.DB.prepare(query).bind(userId).all()
    : await env.DB.prepare(query).all();

  return (results.results || []).map(row => ({
    id: row.id as string,
    team_id: row.team_id as string,
    team_name: row.team_name as string,
    current_lead: row.current_lead as string,
    members: JSON.parse(row.members as string || '[]'),
    state_data: JSON.parse(row.state_data as string || '{}'),
    communication_log: JSON.parse(row.communication_log as string || '[]'),
    started_at: row.started_at as number,
    updated_at: row.updated_at as number,
    user_id: row.user_id as string | undefined
  }));
}

// =============================================================================
// Formatters
// =============================================================================

/**
 * Format workflow state for display
 */
export function formatPersistedWorkflow(state: PersistedWorkflowState): string {
  const progress = Math.round((state.current_step / state.total_steps) * 100);
  const duration = Date.now() - state.started_at;
  const durationStr = duration < 60000
    ? `${Math.round(duration / 1000)}s`
    : `${Math.round(duration / 60000)}m`;

  return `**${state.workflow_name}** (\`${state.id}\`)
Status: ${state.status} | Step ${state.current_step + 1}/${state.total_steps} | ${progress}%
Duration: ${durationStr}${state.error ? `\nError: ${state.error}` : ''}`;
}

/**
 * Format list of workflows for display
 */
export function formatWorkflowList(workflows: PersistedWorkflowState[]): string {
  if (workflows.length === 0) {
    return 'No active workflows.';
  }

  const lines = ['## Active Workflows', ''];

  for (const wf of workflows) {
    lines.push(formatPersistedWorkflow(wf));
    lines.push('');
  }

  lines.push('---');
  lines.push('Use `spawner_workflow({ action: "resume", state_id: "<id>" })` to resume.');

  return lines.join('\n');
}
