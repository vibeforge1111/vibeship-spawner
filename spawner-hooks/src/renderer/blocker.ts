/**
 * Blocker Alert Renderer
 *
 * Renders blocking errors that require attention
 */

import type { ErrorData, AgentState } from '../types.js';
import {
  drawDoubleBox,
  colorize,
  COLORS,
  ICONS,
  BOX_WIDTH,
  getAgentIcon,
  formatDuration,
  truncate,
} from '../utils.js';

/**
 * Render a blocking error alert
 */
export function renderBlocker(agent: AgentState, error: ErrorData): string {
  const icon = agent.icon || getAgentIcon(agent.name);

  const lines: string[] = [
    '',
    colorize(`${icon} ${agent.name} cannot continue`, COLORS.error),
    '',
  ];

  // Error reason
  lines.push(`Reason: ${truncate(error.error, 45)}`);
  lines.push('');

  // Waiting time
  if (agent.waitingFor) {
    const waitTime = Date.now() - agent.startTime;
    lines.push(colorize(`Waiting: ${formatDuration(waitTime)}`, COLORS.warning));
  }

  lines.push('');

  const title = `${ICONS.stop} BLOCKED`;
  return drawDoubleBox(lines, BOX_WIDTH, title, COLORS.error);
}

/**
 * Render an inline warning (non-blocking)
 */
export function renderWarning(agent: AgentState, message: string): string {
  const icon = agent.icon || getAgentIcon(agent.name);
  const title = `${icon} ${agent.name}`;

  const lines: string[] = [
    colorize(`${ICONS.warning} Warning: ${truncate(message, 40)}`, COLORS.warning),
    colorize('Continuing with fallback...', COLORS.dim),
  ];

  return drawDoubleBox(lines, BOX_WIDTH, title, COLORS.warning);
}

/**
 * Render a simple warning line
 */
export function renderWarningInline(agentName: string, message: string): string {
  const icon = getAgentIcon(agentName);
  return colorize(
    `${ICONS.warning} ${icon} ${agentName}: ${truncate(message, 40)}`,
    COLORS.warning
  );
}
