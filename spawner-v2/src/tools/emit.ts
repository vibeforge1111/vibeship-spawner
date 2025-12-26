/**
 * Spawner Emit Tool
 *
 * Allows agents to emit notification events that the hooks will render.
 * Events are embedded in the response for the post-hook to parse.
 */

import type { Env } from '../types.js';
import type { ToolDefinition } from './registry.js';

// =============================================================================
// Tool Definition
// =============================================================================

export const emitToolDefinition: ToolDefinition = {
  name: 'spawner_emit',
  description: `Emit an agent notification event. Use this to signal progress, handoffs, or status changes that will be displayed in the terminal.

Event types:
- progress: Update work progress (percent, completed tasks, current task)
- handoff: Signal passing work to another agent
- waiting: Indicate waiting for another agent
- error: Report an error (warning or blocking)

Examples:
- spawner_emit({ type: "progress", agent_id: "frontend-1", message: "Building components", percent: 50, completed: ["Setup done"] })
- spawner_emit({ type: "handoff", from: "Backend", to: "Frontend", payload: "API schema", description: "Auth endpoints ready" })
- spawner_emit({ type: "error", agent_id: "frontend-1", error: "Missing types", severity: "warning" })`,
  inputSchema: {
    type: 'object',
    properties: {
      type: {
        type: 'string',
        enum: ['progress', 'handoff', 'waiting', 'error'],
        description: 'Type of event to emit',
      },
      agent_id: {
        type: 'string',
        description: 'ID of the agent emitting this event (for progress, waiting, error)',
      },
      message: {
        type: 'string',
        description: 'Progress message or current task (for progress)',
      },
      percent: {
        type: 'number',
        description: 'Progress percentage 0-100 (for progress)',
      },
      completed: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of completed tasks (for progress)',
      },
      from: {
        type: 'string',
        description: 'Agent handing off (for handoff)',
      },
      to: {
        type: 'string',
        description: 'Agent receiving handoff (for handoff)',
      },
      payload: {
        type: 'string',
        description: 'What is being handed off (for handoff)',
      },
      description: {
        type: 'string',
        description: 'Description of the handoff (for handoff)',
      },
      waiting_for: {
        type: 'string',
        description: 'Agent being waited on (for waiting)',
      },
      reason: {
        type: 'string',
        description: 'Why waiting (for waiting)',
      },
      error: {
        type: 'string',
        description: 'Error message (for error)',
      },
      severity: {
        type: 'string',
        enum: ['warning', 'blocking'],
        description: 'Error severity (for error)',
      },
    },
    required: ['type'],
  },
};

// =============================================================================
// Input/Output Types
// =============================================================================

export interface EmitInput {
  type: 'progress' | 'handoff' | 'waiting' | 'error';
  agent_id?: string;
  message?: string;
  percent?: number;
  completed?: string[];
  from?: string;
  to?: string;
  payload?: string;
  description?: string;
  waiting_for?: string;
  reason?: string;
  error?: string;
  severity?: 'warning' | 'blocking';
}

export interface EmitOutput {
  success: boolean;
  event_type: string;
  event_marker: string;
  _instruction: string;
}

// =============================================================================
// Event Formatting
// =============================================================================

interface SpawnerEvent {
  type: string;
  timestamp: number;
  data: Record<string, unknown>;
}

function formatEventMarker(event: SpawnerEvent): string {
  return `[SPAWNER_EVENT]${JSON.stringify(event)}[/SPAWNER_EVENT]`;
}

// =============================================================================
// Executor
// =============================================================================

export async function executeEmit(
  _env: Env,
  input: EmitInput
): Promise<EmitOutput> {
  let event: SpawnerEvent;

  switch (input.type) {
    case 'progress':
      if (!input.agent_id) {
        throw new Error('agent_id is required for progress events');
      }
      event = {
        type: 'agent:progress',
        timestamp: Date.now(),
        data: {
          id: input.agent_id,
          message: input.message || 'Working...',
          percent: input.percent || 0,
          completed: input.completed || [],
        },
      };
      break;

    case 'handoff':
      if (!input.from || !input.to) {
        throw new Error('from and to are required for handoff events');
      }
      event = {
        type: 'agent:handoff',
        timestamp: Date.now(),
        data: {
          from: input.from,
          to: input.to,
          payload: input.payload || '',
          description: input.description || 'Handoff',
        },
      };
      break;

    case 'waiting':
      if (!input.agent_id || !input.waiting_for) {
        throw new Error('agent_id and waiting_for are required for waiting events');
      }
      event = {
        type: 'agent:waiting',
        timestamp: Date.now(),
        data: {
          id: input.agent_id,
          waiting_for: input.waiting_for,
          reason: input.reason || 'Waiting for dependency',
        },
      };
      break;

    case 'error':
      if (!input.agent_id || !input.error) {
        throw new Error('agent_id and error are required for error events');
      }
      event = {
        type: 'agent:error',
        timestamp: Date.now(),
        data: {
          id: input.agent_id,
          error: input.error,
          severity: input.severity || 'warning',
        },
      };
      break;

    default:
      throw new Error(`Unknown event type: ${input.type}`);
  }

  const marker = formatEventMarker(event);

  return {
    success: true,
    event_type: event.type,
    event_marker: marker,
    _instruction: `Event emitted. The notification system will display this in the terminal.

${marker}`,
  };
}
