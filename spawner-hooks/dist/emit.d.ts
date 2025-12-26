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
import type { SpawnerEvent } from './types.js';
/**
 * Format an event as a marker string that hooks can parse
 */
export declare function formatEventMarker(event: SpawnerEvent): string;
/**
 * Create a spawn event
 */
export declare function emitSpawn(id: string, name: string, icon: string, skills: string[], task: string): SpawnerEvent;
/**
 * Create a progress event
 */
export declare function emitProgress(id: string, message: string, percent: number, completed?: string[]): SpawnerEvent;
/**
 * Create a waiting event
 */
export declare function emitWaiting(id: string, waitingFor: string, reason: string): SpawnerEvent;
/**
 * Create a handoff event
 */
export declare function emitHandoff(from: string, to: string, payload: string, description: string): SpawnerEvent;
/**
 * Create a complete event
 */
export declare function emitComplete(id: string, result: string, duration: number, tasksCompleted: number): SpawnerEvent;
/**
 * Create an error event
 */
export declare function emitError(id: string, error: string, severity?: 'warning' | 'blocking'): SpawnerEvent;
/**
 * Quick helper to include a progress update in output
 */
export declare function progressMarker(agentId: string, message: string, percent: number, completed?: string[]): string;
/**
 * Quick helper to include a handoff in output
 */
export declare function handoffMarker(from: string, to: string, payload: string, description: string): string;
/**
 * Quick helper to include an error in output
 */
export declare function errorMarker(agentId: string, error: string, blocking?: boolean): string;
