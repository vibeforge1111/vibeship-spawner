/**
 * Mission Tool
 *
 * Orchestrate multi-agent workflows between spawner-ui and Claude Code.
 *
 * Actions:
 * - create: Create a new mission
 * - get: Get a mission by ID
 * - list: List user's missions
 * - update: Update mission status/data
 * - log: Add a log entry
 * - logs: Get mission logs
 * - start: Mark mission as running
 * - complete: Mark mission as completed
 * - fail: Mark mission as failed
 */

import type { Env } from '../types.js';
import type { ToolDefinition } from './registry.js';
import {
  createMission,
  getMission,
  listMissions,
  updateMission,
  deleteMission,
  addMissionLog,
  getMissionLogs,
  type Mission,
  type MissionAgent,
  type MissionTask,
  type MissionContext,
  type ExecutionMode,
  type MissionStatus,
  type LogType,
} from '../db/missions.js';

// =============================================================================
// Tool Definition
// =============================================================================

export const missionToolDefinition: ToolDefinition = {
  name: 'spawner_mission',
  description: `Manage missions for multi-agent orchestration between spawner-ui and Claude Code.

Actions:
- create: Create a new mission
- get: Get a mission by ID
- list: List your missions (optionally filter by status)
- update: Update mission data (agents, tasks, context)
- log: Add a log entry (progress, handoff, error)
- logs: Get mission logs (optionally since a timestamp)
- start: Mark mission as running (sets started_at)
- complete: Mark mission as completed
- fail: Mark mission as failed with error message
- delete: Delete a mission

Use this to coordinate work between the spawner-ui (configuration) and Claude Code (execution).`,
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['create', 'get', 'list', 'update', 'log', 'logs', 'start', 'complete', 'fail', 'delete'],
        description: 'Action to perform',
      },
      // For create
      name: {
        type: 'string',
        description: 'Mission name (for create)',
      },
      description: {
        type: 'string',
        description: 'Mission description (for create/update)',
      },
      mode: {
        type: 'string',
        enum: ['claude-code', 'api', 'sdk'],
        description: 'Execution mode (for create)',
      },
      agents: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            role: { type: 'string' },
            skills: { type: 'array', items: { type: 'string' } },
            systemPrompt: { type: 'string' },
            model: { type: 'string', enum: ['sonnet', 'opus', 'haiku'] },
          },
          required: ['name', 'role', 'skills'],
        },
        description: 'Agents for the mission (for create/update)',
      },
      tasks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            description: { type: 'string' },
            assignedTo: { type: 'string' },
            dependsOn: { type: 'array', items: { type: 'string' } },
            status: { type: 'string', enum: ['pending', 'in_progress', 'blocked', 'completed', 'failed'] },
            handoffType: { type: 'string', enum: ['sequential', 'parallel', 'conditional', 'review'] },
            handoffTo: { type: 'array', items: { type: 'string' } },
          },
          required: ['title', 'description', 'assignedTo'],
        },
        description: 'Tasks for the mission (for create/update)',
      },
      context: {
        type: 'object',
        properties: {
          projectPath: { type: 'string' },
          projectType: { type: 'string' },
          techStack: { type: 'array', items: { type: 'string' } },
          constraints: { type: 'array', items: { type: 'string' } },
          goals: { type: 'array', items: { type: 'string' } },
        },
        description: 'Mission context (for create/update)',
      },
      // For get/update/delete/logs/start/complete/fail
      mission_id: {
        type: 'string',
        description: 'Mission ID (for get/update/delete/log/logs/start/complete/fail)',
      },
      // For list
      status: {
        type: 'string',
        enum: ['draft', 'ready', 'running', 'paused', 'completed', 'failed'],
        description: 'Filter by status (for list)',
      },
      limit: {
        type: 'number',
        description: 'Max results (for list/logs)',
      },
      // For log
      log_type: {
        type: 'string',
        enum: ['start', 'progress', 'handoff', 'complete', 'error'],
        description: 'Log entry type (for log)',
      },
      message: {
        type: 'string',
        description: 'Log message (for log)',
      },
      agent_id: {
        type: 'string',
        description: 'Agent ID for log (for log)',
      },
      task_id: {
        type: 'string',
        description: 'Task ID for log (for log)',
      },
      data: {
        type: 'object',
        description: 'Additional data for log (for log)',
      },
      // For logs
      since: {
        type: 'string',
        description: 'Get logs since this timestamp (for logs)',
      },
      // For fail
      error: {
        type: 'string',
        description: 'Error message (for fail)',
      },
      // For update - task status
      current_task_id: {
        type: 'string',
        description: 'Current task being executed (for update)',
      },
      outputs: {
        type: 'object',
        description: 'Mission outputs (for update/complete)',
      },
    },
    required: ['action'],
  },
};

// =============================================================================
// Input Types
// =============================================================================

interface MissionInput {
  action: 'create' | 'get' | 'list' | 'update' | 'log' | 'logs' | 'start' | 'complete' | 'fail' | 'delete';
  name?: string;
  description?: string;
  mode?: ExecutionMode;
  agents?: MissionAgent[];
  tasks?: MissionTask[];
  context?: Partial<MissionContext>;
  mission_id?: string;
  status?: MissionStatus;
  limit?: number;
  log_type?: LogType;
  message?: string;
  agent_id?: string;
  task_id?: string;
  data?: Record<string, unknown>;
  since?: string;
  error?: string;
  current_task_id?: string;
  outputs?: Record<string, unknown>;
}

// =============================================================================
// Executor
// =============================================================================

export async function executeMission(
  env: Env,
  input: MissionInput,
  userId: string
): Promise<unknown> {
  const { action } = input;

  switch (action) {
    case 'create':
      return handleCreate(env, input, userId);
    case 'get':
      return handleGet(env, input);
    case 'list':
      return handleList(env, input, userId);
    case 'update':
      return handleUpdate(env, input);
    case 'log':
      return handleLog(env, input);
    case 'logs':
      return handleLogs(env, input);
    case 'start':
      return handleStart(env, input);
    case 'complete':
      return handleComplete(env, input);
    case 'fail':
      return handleFail(env, input);
    case 'delete':
      return handleDelete(env, input);
    default:
      return { error: `Unknown action: ${action}` };
  }
}

// =============================================================================
// Action Handlers
// =============================================================================

async function handleCreate(env: Env, input: MissionInput, userId: string) {
  if (!input.name) {
    return { error: 'name is required for create' };
  }

  const mission = await createMission(env, userId, {
    name: input.name,
    description: input.description,
    mode: input.mode,
    agents: input.agents,
    tasks: input.tasks,
    context: input.context,
  });

  return {
    success: true,
    mission,
    _instruction: `Mission created: ${mission.id}

To start this mission in Claude Code, run:
\`\`\`
spawner_mission({ action: "get", mission_id: "${mission.id}" })
\`\`\`

Then execute each task following the agent assignments.`,
  };
}

async function handleGet(env: Env, input: MissionInput) {
  if (!input.mission_id) {
    return { error: 'mission_id is required for get' };
  }

  const mission = await getMission(env, input.mission_id);
  if (!mission) {
    return { error: `Mission not found: ${input.mission_id}` };
  }

  // Generate execution prompt for Claude Code
  const prompt = generateExecutionPrompt(mission);

  return {
    mission,
    execution_prompt: prompt,
    _instruction: mission.status === 'running'
      ? `Mission is running. Current task: ${mission.current_task_id || 'none'}`
      : `Mission is ${mission.status}. ${mission.status === 'draft' ? 'Update with agents and tasks, then start.' : ''}`,
  };
}

async function handleList(env: Env, input: MissionInput, userId: string) {
  const missions = await listMissions(env, userId, {
    status: input.status,
    limit: input.limit,
  });

  return {
    missions,
    count: missions.length,
    _instruction: missions.length === 0
      ? 'No missions found. Create one with action: "create"'
      : `Found ${missions.length} mission(s). Use action: "get" with mission_id to see details.`,
  };
}

async function handleUpdate(env: Env, input: MissionInput) {
  if (!input.mission_id) {
    return { error: 'mission_id is required for update' };
  }

  const mission = await updateMission(env, input.mission_id, {
    name: input.name,
    description: input.description,
    mode: input.mode,
    agents: input.agents,
    tasks: input.tasks,
    context: input.context as MissionContext | undefined,
    current_task_id: input.current_task_id,
    outputs: input.outputs,
  });

  if (!mission) {
    return { error: `Mission not found: ${input.mission_id}` };
  }

  return {
    success: true,
    mission,
  };
}

async function handleLog(env: Env, input: MissionInput) {
  if (!input.mission_id) {
    return { error: 'mission_id is required for log' };
  }
  if (!input.log_type) {
    return { error: 'log_type is required for log' };
  }
  if (!input.message) {
    return { error: 'message is required for log' };
  }

  const log = await addMissionLog(env, input.mission_id, {
    agentId: input.agent_id,
    taskId: input.task_id,
    type: input.log_type,
    message: input.message,
    data: input.data,
  });

  return { success: true, log };
}

async function handleLogs(env: Env, input: MissionInput) {
  if (!input.mission_id) {
    return { error: 'mission_id is required for logs' };
  }

  const logs = await getMissionLogs(env, input.mission_id, {
    since: input.since,
    limit: input.limit,
  });

  return {
    logs,
    count: logs.length,
    mission_id: input.mission_id,
  };
}

async function handleStart(env: Env, input: MissionInput) {
  if (!input.mission_id) {
    return { error: 'mission_id is required for start' };
  }

  const mission = await updateMission(env, input.mission_id, {
    status: 'running',
    started_at: new Date().toISOString(),
  });

  if (!mission) {
    return { error: `Mission not found: ${input.mission_id}` };
  }

  // Add start log
  await addMissionLog(env, input.mission_id, {
    type: 'start',
    message: 'Mission started',
  });

  return {
    success: true,
    mission,
    _instruction: 'Mission is now running. Execute tasks and update progress with action: "log"',
  };
}

async function handleComplete(env: Env, input: MissionInput) {
  if (!input.mission_id) {
    return { error: 'mission_id is required for complete' };
  }

  const mission = await updateMission(env, input.mission_id, {
    status: 'completed',
    completed_at: new Date().toISOString(),
    outputs: input.outputs,
  });

  if (!mission) {
    return { error: `Mission not found: ${input.mission_id}` };
  }

  // Add complete log
  await addMissionLog(env, input.mission_id, {
    type: 'complete',
    message: 'Mission completed successfully',
    data: input.outputs,
  });

  return {
    success: true,
    mission,
    _instruction: 'Mission completed! Results are saved.',
  };
}

async function handleFail(env: Env, input: MissionInput) {
  if (!input.mission_id) {
    return { error: 'mission_id is required for fail' };
  }

  const mission = await updateMission(env, input.mission_id, {
    status: 'failed',
    completed_at: new Date().toISOString(),
    error: input.error || 'Unknown error',
  });

  if (!mission) {
    return { error: `Mission not found: ${input.mission_id}` };
  }

  // Add error log
  await addMissionLog(env, input.mission_id, {
    type: 'error',
    message: input.error || 'Unknown error',
  });

  return {
    success: true,
    mission,
    _instruction: 'Mission marked as failed.',
  };
}

async function handleDelete(env: Env, input: MissionInput) {
  if (!input.mission_id) {
    return { error: 'mission_id is required for delete' };
  }

  const deleted = await deleteMission(env, input.mission_id);

  return {
    success: deleted,
    message: deleted ? 'Mission deleted' : 'Mission not found',
  };
}

// =============================================================================
// Helpers
// =============================================================================

function generateExecutionPrompt(mission: Mission): string {
  const agentList = mission.agents
    .map(a => `- **${a.name}** (${a.role}): Skills: ${a.skills.join(', ')}`)
    .join('\n');

  const taskList = mission.tasks
    .map(t => {
      const agent = mission.agents.find(a => a.id === t.assignedTo);
      const deps = t.dependsOn?.length
        ? `(after: ${t.dependsOn.join(', ')})`
        : '';
      const status = t.status === 'completed' ? '✅' : t.status === 'in_progress' ? '🔄' : '⏳';
      return `${status} **${t.title}** → ${agent?.name || 'Unassigned'} ${deps}\n   ${t.description}`;
    })
    .join('\n');

  return `# Mission: ${mission.name}

${mission.description || ''}

## Context
- **Project Path:** ${mission.context.projectPath || 'Not specified'}
- **Project Type:** ${mission.context.projectType}
- **Tech Stack:** ${mission.context.techStack?.join(', ') || 'Not specified'}

## Goals
${mission.context.goals?.map(g => `- ${g}`).join('\n') || '- Not specified'}

## Team
${agentList || 'No agents assigned'}

## Tasks
${taskList || 'No tasks defined'}

## Instructions

1. Load each agent's skills using \`spawner_load({ skill_id: "skill-name" })\`
2. Execute tasks in order (respecting dependencies)
3. Log progress: \`spawner_mission({ action: "log", mission_id: "${mission.id}", log_type: "progress", message: "..." })\`
4. On handoff: \`spawner_mission({ action: "log", mission_id: "${mission.id}", log_type: "handoff", message: "..." })\`
5. When done: \`spawner_mission({ action: "complete", mission_id: "${mission.id}" })\`
`;
}
