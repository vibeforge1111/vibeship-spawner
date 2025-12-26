/**
 * Handoff Callout Renderer
 *
 * Renders collaboration moments when agents pass work to each other
 */

import type { HandoffData } from '../types.js';
import {
  drawDoubleBox,
  colorize,
  COLORS,
  ICONS,
  BOX_WIDTH,
  getAgentIcon,
  truncate,
} from '../utils.js';

/**
 * Render a handoff callout
 */
export function renderHandoff(handoff: HandoffData): string {
  const lines: string[] = [
    '',
    `${handoff.from}  -->  ${handoff.to}`,
    '',
  ];

  // Payload description
  if (handoff.description) {
    lines.push(colorize(truncate(handoff.description, 48), COLORS.dim));
  }

  // Payload content (truncated)
  if (handoff.payload) {
    lines.push('');
    const payloadLines = handoff.payload.split('\n').slice(0, 2);
    for (const line of payloadLines) {
      lines.push(colorize(truncate(line, 48), COLORS.info));
    }
  }

  lines.push('');

  const title = 'HANDOFF';
  return drawDoubleBox(lines, BOX_WIDTH, title, COLORS.info);
}

/**
 * Render a simple handoff indicator (for inline use)
 */
export function renderHandoffInline(handoff: HandoffData): string {
  const fromIcon = getAgentIcon(handoff.from);
  const toIcon = getAgentIcon(handoff.to);

  return colorize(
    `${ICONS.lightning} ${fromIcon} ${handoff.from} ${ICONS.arrow} ${toIcon} ${handoff.to}: ${truncate(handoff.description, 30)}`,
    COLORS.info
  );
}
