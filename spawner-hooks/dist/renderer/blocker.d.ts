/**
 * Blocker Alert Renderer
 *
 * Renders blocking errors that require attention
 */
import type { ErrorData, AgentState } from '../types.js';
/**
 * Render a blocking error alert
 */
export declare function renderBlocker(agent: AgentState, error: ErrorData): string;
/**
 * Render an inline warning (non-blocking)
 */
export declare function renderWarning(agent: AgentState, message: string): string;
/**
 * Render a simple warning line
 */
export declare function renderWarningInline(agentName: string, message: string): string;
