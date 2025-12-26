/**
 * Handoff Callout Renderer
 *
 * Renders collaboration moments when agents pass work to each other
 */
import type { HandoffData } from '../types.js';
/**
 * Render a handoff callout
 */
export declare function renderHandoff(handoff: HandoffData): string;
/**
 * Render a simple handoff indicator (for inline use)
 */
export declare function renderHandoffInline(handoff: HandoffData): string;
