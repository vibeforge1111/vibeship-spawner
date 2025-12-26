/**
 * Event Emission Helpers
 *
 * Use these in skills/agents to emit events that the notification system will render.
 *
 * Two ways to emit events:
 * 1. Include event markers in agent output (parsed from response)
 * 2. Call spawner_emit MCP tool (when available)
 *
 * Usage in a skill:
 * ```
 * import { emitProgress, emitHandoff, formatEventMarker } from './emit.js';
 *
 * // Option 1: Include in response (parsed by post-hook)
 * console.log(formatEventMarker(emitProgress('frontend-1', 'Building UI', 50, ['Setup complete'])));
 *
 * // Option 2: As part of your output that gets returned
 * return `Work in progress...\n${formatEventMarker(emitProgress(...))}`;
 * ```
 */

import type {
  SpawnerEvent,
  SpawnData,
  ProgressData,
  WaitingData,
  HandoffData,
  CompleteData,
  ErrorData,
} from './types.js';

/**
 * Format an event as a marker string that hooks can parse
 */
export function formatEventMarker(event: SpawnerEvent): string {
  return `[SPAWNER_EVENT]${JSON.stringify(event)}[/SPAWNER_EVENT]`;
}

/**
 * Create a spawn event
 */
export function emitSpawn(
  id: string,
  name: string,
  icon: string,
  skills: string[],
  task: string
): SpawnerEvent {
  return {
    type: 'agent:spawn',
    timestamp: Date.now(),
    data: { id, name, icon, skills, task } as SpawnData,
  };
}

/**
 * Create a progress event
 */
export function emitProgress(
  id: string,
  message: string,
  percent: number,
  completed: string[] = []
): SpawnerEvent {
  return {
    type: 'agent:progress',
    timestamp: Date.now(),
    data: { id, message, percent, completed } as ProgressData,
  };
}

/**
 * Create a waiting event
 */
export function emitWaiting(
  id: string,
  waitingFor: string,
  reason: string
): SpawnerEvent {
  return {
    type: 'agent:waiting',
    timestamp: Date.now(),
    data: { id, waiting_for: waitingFor, reason } as WaitingData,
  };
}

/**
 * Create a handoff event
 */
export function emitHandoff(
  from: string,
  to: string,
  payload: string,
  description: string
): SpawnerEvent {
  return {
    type: 'agent:handoff',
    timestamp: Date.now(),
    data: { from, to, payload, description } as HandoffData,
  };
}

/**
 * Create a complete event
 */
export function emitComplete(
  id: string,
  result: string,
  duration: number,
  tasksCompleted: number
): SpawnerEvent {
  return {
    type: 'agent:complete',
    timestamp: Date.now(),
    data: { id, result, duration, tasks_completed: tasksCompleted } as CompleteData,
  };
}

/**
 * Create an error event
 */
export function emitError(
  id: string,
  error: string,
  severity: 'warning' | 'blocking' = 'warning'
): SpawnerEvent {
  return {
    type: 'agent:error',
    timestamp: Date.now(),
    data: { id, error, severity } as ErrorData,
  };
}

/**
 * Quick helper to include a progress update in output
 */
export function progressMarker(
  agentId: string,
  message: string,
  percent: number,
  completed: string[] = []
): string {
  return formatEventMarker(emitProgress(agentId, message, percent, completed));
}

/**
 * Quick helper to include a handoff in output
 */
export function handoffMarker(
  from: string,
  to: string,
  payload: string,
  description: string
): string {
  return formatEventMarker(emitHandoff(from, to, payload, description));
}

/**
 * Quick helper to include an error in output
 */
export function errorMarker(
  agentId: string,
  error: string,
  blocking: boolean = false
): string {
  return formatEventMarker(emitError(agentId, error, blocking ? 'blocking' : 'warning'));
}
