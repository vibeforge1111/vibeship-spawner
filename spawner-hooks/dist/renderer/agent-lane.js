/**
 * Agent Lane Renderer
 *
 * Renders an agent's current state as a bordered box
 */
import { drawBox, progressBar, colorize, COLORS, ICONS, getAgentColor, getAgentIcon, BOX_WIDTH, truncate, } from '../utils.js';
/**
 * Get border color based on agent status
 */
function getStatusColor(status) {
    switch (status) {
        case 'active':
            return COLORS.info;
        case 'waiting':
            return COLORS.warning;
        case 'complete':
            return COLORS.success;
        case 'error':
            return COLORS.error;
        default:
            return COLORS.default;
    }
}
/**
 * Render an agent lane showing current state
 */
export function renderAgentLane(agent) {
    const lines = [];
    const icon = agent.icon || getAgentIcon(agent.name);
    const color = getAgentColor(agent.name);
    // Skills line
    if (agent.skills.length > 0) {
        const skillsStr = agent.skills.join(', ');
        lines.push(colorize(`Skills: ${truncate(skillsStr, 45)}`, COLORS.dim));
    }
    // Empty line for spacing
    lines.push('');
    // Progress bar (if active or has progress)
    if (agent.status === 'active' || agent.progress > 0) {
        lines.push(progressBar(agent.progress, 20));
    }
    // Completed tasks
    for (const task of agent.completed.slice(-3)) {
        lines.push(colorize(`${ICONS.check} ${truncate(task, 45)}`, COLORS.success));
    }
    // Current task (if active)
    if (agent.status === 'active' && agent.current) {
        lines.push(colorize(`${ICONS.spinner} ${truncate(agent.current, 45)}`, COLORS.info));
    }
    // Waiting indicator
    if (agent.status === 'waiting' && agent.waitingFor) {
        lines.push('');
        lines.push(colorize(`${ICONS.waiting} Waiting: ${agent.waitingFor}`, COLORS.warning));
        if (agent.waitingReason) {
            lines.push(colorize(`   ${truncate(agent.waitingReason, 42)}`, COLORS.dim));
        }
    }
    // Error indicator
    if (agent.status === 'error' && agent.error) {
        lines.push('');
        lines.push(colorize(`${ICONS.warning} ${truncate(agent.error, 45)}`, COLORS.error));
    }
    // Complete indicator (duration only, tasks already have checkmarks)
    if (agent.status === 'complete') {
        lines.push('');
        lines.push(colorize(`Done in ${Math.round(agent.duration / 1000)}s`, COLORS.dim));
    }
    // Build title with icon and name
    const title = `${icon} ${agent.name}`;
    const statusColor = getStatusColor(agent.status);
    return drawBox(lines, BOX_WIDTH, title, statusColor);
}
/**
 * Render a minimal agent lane (for summary views)
 */
export function renderAgentLaneMinimal(agent) {
    const icon = agent.icon || getAgentIcon(agent.name);
    const statusIcon = agent.status === 'complete' ? ICONS.check :
        agent.status === 'waiting' ? ICONS.waiting :
            agent.status === 'error' ? ICONS.cross :
                ICONS.spinner;
    const statusColor = getStatusColor(agent.status);
    const durationStr = agent.duration > 0 ? ` (${Math.round(agent.duration / 1000)}s)` : '';
    return colorize(`${icon} ${agent.name} ${statusIcon}${durationStr}`, statusColor);
}
