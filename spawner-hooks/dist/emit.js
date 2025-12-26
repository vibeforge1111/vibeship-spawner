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
/**
 * Format an event as a marker string that hooks can parse
 */
export function formatEventMarker(event) {
    return `[SPAWNER_EVENT]${JSON.stringify(event)}[/SPAWNER_EVENT]`;
}
/**
 * Create a spawn event
 */
export function emitSpawn(id, name, icon, skills, task) {
    return {
        type: 'agent:spawn',
        timestamp: Date.now(),
        data: { id, name, icon, skills, task },
    };
}
/**
 * Create a progress event
 */
export function emitProgress(id, message, percent, completed = []) {
    return {
        type: 'agent:progress',
        timestamp: Date.now(),
        data: { id, message, percent, completed },
    };
}
/**
 * Create a waiting event
 */
export function emitWaiting(id, waitingFor, reason) {
    return {
        type: 'agent:waiting',
        timestamp: Date.now(),
        data: { id, waiting_for: waitingFor, reason },
    };
}
/**
 * Create a handoff event
 */
export function emitHandoff(from, to, payload, description) {
    return {
        type: 'agent:handoff',
        timestamp: Date.now(),
        data: { from, to, payload, description },
    };
}
/**
 * Create a complete event
 */
export function emitComplete(id, result, duration, tasksCompleted) {
    return {
        type: 'agent:complete',
        timestamp: Date.now(),
        data: { id, result, duration, tasks_completed: tasksCompleted },
    };
}
/**
 * Create an error event
 */
export function emitError(id, error, severity = 'warning') {
    return {
        type: 'agent:error',
        timestamp: Date.now(),
        data: { id, error, severity },
    };
}
/**
 * Quick helper to include a progress update in output
 */
export function progressMarker(agentId, message, percent, completed = []) {
    return formatEventMarker(emitProgress(agentId, message, percent, completed));
}
/**
 * Quick helper to include a handoff in output
 */
export function handoffMarker(from, to, payload, description) {
    return formatEventMarker(emitHandoff(from, to, payload, description));
}
/**
 * Quick helper to include an error in output
 */
export function errorMarker(agentId, error, blocking = false) {
    return formatEventMarker(emitError(agentId, error, blocking ? 'blocking' : 'warning'));
}
