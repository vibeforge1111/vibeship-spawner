/**
 * Handoff Callout Renderer
 *
 * Renders collaboration moments when agents pass work to each other
 */
import { drawDoubleBox, colorize, COLORS, ICONS, BOX_WIDTH, getAgentIcon, truncate, } from '../utils.js';
/**
 * Render a handoff callout
 */
export function renderHandoff(handoff) {
    const fromIcon = getAgentIcon(handoff.from);
    const toIcon = getAgentIcon(handoff.to);
    const lines = [
        '',
        `${fromIcon} ${handoff.from} ${ICONS.arrow}${ICONS.arrow} ${toIcon} ${handoff.to}`,
        '',
    ];
    // Payload description
    if (handoff.description) {
        lines.push(colorize(`Payload: ${handoff.description}`, COLORS.dim));
    }
    // Payload content (truncated)
    if (handoff.payload) {
        const payloadLines = handoff.payload.split('\n').slice(0, 3);
        for (const line of payloadLines) {
            lines.push(colorize(truncate(line, 48), COLORS.info));
        }
        if (handoff.payload.split('\n').length > 3) {
            lines.push(colorize('...', COLORS.dim));
        }
    }
    lines.push('');
    const title = `${ICONS.lightning} HANDOFF`;
    return drawDoubleBox(lines, BOX_WIDTH, title, COLORS.info);
}
/**
 * Render a simple handoff indicator (for inline use)
 */
export function renderHandoffInline(handoff) {
    const fromIcon = getAgentIcon(handoff.from);
    const toIcon = getAgentIcon(handoff.to);
    return colorize(`${ICONS.lightning} ${fromIcon} ${handoff.from} ${ICONS.arrow} ${toIcon} ${handoff.to}: ${truncate(handoff.description, 30)}`, COLORS.info);
}
