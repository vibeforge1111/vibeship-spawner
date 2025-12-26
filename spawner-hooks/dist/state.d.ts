/**
 * State Management
 *
 * Tracks agent activity across tool calls
 */
import type { NotificationState, AgentState, SpawnData, ProgressData, WaitingData, HandoffData, CompleteData, ErrorData } from './types.js';
/**
 * Load state from disk
 */
export declare function loadState(): NotificationState;
/**
 * Save state to disk
 */
export declare function saveState(state: NotificationState): void;
/**
 * Clear state (for new session)
 */
export declare function clearState(): void;
/**
 * Handle agent spawn event
 */
export declare function handleSpawn(state: NotificationState, data: SpawnData): AgentState;
/**
 * Handle progress update event
 */
export declare function handleProgress(state: NotificationState, data: ProgressData): AgentState | null;
/**
 * Handle waiting event
 */
export declare function handleWaiting(state: NotificationState, data: WaitingData): AgentState | null;
/**
 * Handle handoff event
 */
export declare function handleHandoff(state: NotificationState, data: HandoffData): void;
/**
 * Handle completion event
 */
export declare function handleComplete(state: NotificationState, data: CompleteData): AgentState | null;
/**
 * Handle error event
 */
export declare function handleError(state: NotificationState, data: ErrorData): AgentState | null;
/**
 * Check if all agents are complete
 */
export declare function allAgentsComplete(state: NotificationState): boolean;
/**
 * Get agent by name (searching both active and completed)
 */
export declare function getAgentByName(state: NotificationState, name: string): AgentState | null;
