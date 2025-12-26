/**
 * Completion Dashboard Renderer
 *
 * Renders final summary with collaboration graph and stats
 */
import type { NotificationState } from '../types.js';
/**
 * Render the completion dashboard
 */
export declare function renderDashboard(state: NotificationState): string;
/**
 * Render a simple completion message
 */
export declare function renderCompleteSimple(agentCount: number, duration: number): string;
