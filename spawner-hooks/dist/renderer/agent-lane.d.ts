/**
 * Agent Lane Renderer
 *
 * Renders an agent's current state as a bordered box
 */
import type { AgentState } from '../types.js';
/**
 * Render an agent lane showing current state
 */
export declare function renderAgentLane(agent: AgentState): string;
/**
 * Render a minimal agent lane (for summary views)
 */
export declare function renderAgentLaneMinimal(agent: AgentState): string;
