/**
 * Mission Database Operations
 *
 * CRUD operations for missions and mission logs.
 */

import type { Env } from '../types.js';

// =============================================================================
// Types
// =============================================================================

export type ExecutionMode = 'claude-code' | 'api' | 'sdk';
export type MissionStatus = 'draft' | 'ready' | 'running' | 'paused' | 'completed' | 'failed';
export type TaskStatus = 'pending' | 'in_progress' | 'blocked' | 'completed' | 'failed';
export type HandoffType = 'sequential' | 'parallel' | 'conditional' | 'review';
export type LogType = 'start' | 'progress' | 'handoff' | 'complete' | 'error';

export interface MissionAgent {
  id: string;
  name: string;
  role: string;
  skills: string[];
  systemPrompt?: string;
  model?: 'sonnet' | 'opus' | 'haiku';
}

export interface MissionTask {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  dependsOn?: string[];
  status: TaskStatus;
  handoffType: HandoffType;
  handoffTo?: string[];
}

export interface MissionContext {
  projectPath: string;
  projectType: string;
  techStack?: string[];
  constraints?: string[];
  goals: string[];
}

export interface Mission {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  mode: ExecutionMode;
  status: MissionStatus;
  agents: MissionAgent[];
  tasks: MissionTask[];
  context: MissionContext;
  current_task_id: string | null;
  outputs: Record<string, unknown>;
  error: string | null;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface MissionRow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  mode: string;
  status: string;
  agents: string;      // JSON
  tasks: string;       // JSON
  context: string;     // JSON
  current_task_id: string | null;
  outputs: string;     // JSON
  error: string | null;
  created_at: string;
  updated_at: string;
  started_at: string | null;
  completed_at: string | null;
}

export interface MissionLog {
  id: string;
  mission_id: string;
  agent_id: string | null;
  task_id: string | null;
  type: LogType;
  message: string;
  data: Record<string, unknown>;
  created_at: string;
}

export interface MissionLogRow {
  id: string;
  mission_id: string;
  agent_id: string | null;
  task_id: string | null;
  type: string;
  message: string;
  data: string;        // JSON
  created_at: string;
}

// =============================================================================
// Helpers
// =============================================================================

function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

function rowToMission(row: MissionRow): Mission {
  return {
    ...row,
    mode: row.mode as ExecutionMode,
    status: row.status as MissionStatus,
    agents: JSON.parse(row.agents),
    tasks: JSON.parse(row.tasks),
    context: JSON.parse(row.context),
    outputs: JSON.parse(row.outputs),
  };
}

function rowToLog(row: MissionLogRow): MissionLog {
  return {
    ...row,
    type: row.type as LogType,
    data: JSON.parse(row.data),
  };
}

// =============================================================================
// Mission CRUD
// =============================================================================

/**
 * Create a new mission
 */
export async function createMission(
  env: Env,
  userId: string,
  data: {
    name: string;
    description?: string;
    mode?: ExecutionMode;
    agents?: MissionAgent[];
    tasks?: MissionTask[];
    context?: Partial<MissionContext>;
  }
): Promise<Mission> {
  const id = generateId('mission');
  const now = new Date().toISOString();

  const context: MissionContext = {
    projectPath: data.context?.projectPath || '',
    projectType: data.context?.projectType || 'other',
    techStack: data.context?.techStack || [],
    constraints: data.context?.constraints || [],
    goals: data.context?.goals || [],
  };

  await env.DB.prepare(`
    INSERT INTO missions (id, user_id, name, description, mode, status, agents, tasks, context, outputs, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    userId,
    data.name,
    data.description || null,
    data.mode || 'claude-code',
    'draft',
    JSON.stringify(data.agents || []),
    JSON.stringify(data.tasks || []),
    JSON.stringify(context),
    '{}',
    now,
    now
  ).run();

  return getMission(env, id) as Promise<Mission>;
}

/**
 * Get a mission by ID
 */
export async function getMission(env: Env, id: string): Promise<Mission | null> {
  const result = await env.DB.prepare(`
    SELECT * FROM missions WHERE id = ?
  `).bind(id).first<MissionRow>();

  return result ? rowToMission(result) : null;
}

/**
 * List missions for a user
 */
export async function listMissions(
  env: Env,
  userId: string,
  options?: { status?: MissionStatus; limit?: number }
): Promise<Mission[]> {
  let query = 'SELECT * FROM missions WHERE user_id = ?';
  const params: (string | number)[] = [userId];

  if (options?.status) {
    query += ' AND status = ?';
    params.push(options.status);
  }

  query += ' ORDER BY updated_at DESC';

  if (options?.limit) {
    query += ' LIMIT ?';
    params.push(options.limit);
  }

  const result = await env.DB.prepare(query).bind(...params).all<MissionRow>();
  return (result.results || []).map(rowToMission);
}

/**
 * Update a mission
 */
export async function updateMission(
  env: Env,
  id: string,
  data: Partial<{
    name: string;
    description: string;
    mode: ExecutionMode;
    status: MissionStatus;
    agents: MissionAgent[];
    tasks: MissionTask[];
    context: MissionContext;
    current_task_id: string | null;
    outputs: Record<string, unknown>;
    error: string | null;
    started_at: string | null;
    completed_at: string | null;
  }>
): Promise<Mission | null> {
  const updates: string[] = [];
  const params: (string | null)[] = [];

  if (data.name !== undefined) {
    updates.push('name = ?');
    params.push(data.name);
  }
  if (data.description !== undefined) {
    updates.push('description = ?');
    params.push(data.description);
  }
  if (data.mode !== undefined) {
    updates.push('mode = ?');
    params.push(data.mode);
  }
  if (data.status !== undefined) {
    updates.push('status = ?');
    params.push(data.status);
  }
  if (data.agents !== undefined) {
    updates.push('agents = ?');
    params.push(JSON.stringify(data.agents));
  }
  if (data.tasks !== undefined) {
    updates.push('tasks = ?');
    params.push(JSON.stringify(data.tasks));
  }
  if (data.context !== undefined) {
    updates.push('context = ?');
    params.push(JSON.stringify(data.context));
  }
  if (data.current_task_id !== undefined) {
    updates.push('current_task_id = ?');
    params.push(data.current_task_id);
  }
  if (data.outputs !== undefined) {
    updates.push('outputs = ?');
    params.push(JSON.stringify(data.outputs));
  }
  if (data.error !== undefined) {
    updates.push('error = ?');
    params.push(data.error);
  }
  if (data.started_at !== undefined) {
    updates.push('started_at = ?');
    params.push(data.started_at);
  }
  if (data.completed_at !== undefined) {
    updates.push('completed_at = ?');
    params.push(data.completed_at);
  }

  if (updates.length === 0) return getMission(env, id);

  updates.push('updated_at = ?');
  params.push(new Date().toISOString());
  params.push(id);

  await env.DB.prepare(`
    UPDATE missions SET ${updates.join(', ')} WHERE id = ?
  `).bind(...params).run();

  return getMission(env, id);
}

/**
 * Delete a mission
 */
export async function deleteMission(env: Env, id: string): Promise<boolean> {
  const result = await env.DB.prepare(`
    DELETE FROM missions WHERE id = ?
  `).bind(id).run();

  return (result.meta?.changes ?? 0) > 0;
}

// =============================================================================
// Mission Logs
// =============================================================================

/**
 * Add a log entry to a mission
 */
export async function addMissionLog(
  env: Env,
  missionId: string,
  data: {
    agentId?: string;
    taskId?: string;
    type: LogType;
    message: string;
    data?: Record<string, unknown>;
  }
): Promise<MissionLog> {
  const id = generateId('log');
  const now = new Date().toISOString();

  await env.DB.prepare(`
    INSERT INTO mission_logs (id, mission_id, agent_id, task_id, type, message, data, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    missionId,
    data.agentId || null,
    data.taskId || null,
    data.type,
    data.message,
    JSON.stringify(data.data || {}),
    now
  ).run();

  return {
    id,
    mission_id: missionId,
    agent_id: data.agentId || null,
    task_id: data.taskId || null,
    type: data.type,
    message: data.message,
    data: data.data || {},
    created_at: now,
  };
}

/**
 * Get logs for a mission
 */
export async function getMissionLogs(
  env: Env,
  missionId: string,
  options?: { since?: string; limit?: number }
): Promise<MissionLog[]> {
  let query = 'SELECT * FROM mission_logs WHERE mission_id = ?';
  const params: (string | number)[] = [missionId];

  if (options?.since) {
    query += ' AND created_at > ?';
    params.push(options.since);
  }

  query += ' ORDER BY created_at ASC';

  if (options?.limit) {
    query += ' LIMIT ?';
    params.push(options.limit);
  }

  const result = await env.DB.prepare(query).bind(...params).all<MissionLogRow>();
  return (result.results || []).map(rowToLog);
}

/**
 * Get the latest log entry for a mission
 */
export async function getLatestLog(env: Env, missionId: string): Promise<MissionLog | null> {
  const result = await env.DB.prepare(`
    SELECT * FROM mission_logs WHERE mission_id = ? ORDER BY created_at DESC LIMIT 1
  `).bind(missionId).first<MissionLogRow>();

  return result ? rowToLog(result) : null;
}
