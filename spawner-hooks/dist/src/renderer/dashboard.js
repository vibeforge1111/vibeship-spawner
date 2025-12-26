/**
 * Completion Dashboard Renderer
 *
 * Renders final summary with collaboration graph and stats
 */
import { drawDoubleBoxWithDivider, colorize, COLORS, ICONS, BOX_WIDTH, getAgentIcon, formatDuration, padEnd, DBOX, } from '../utils.js';
/**
 * Build collaboration graph as ASCII art
 */
function buildCollaborationGraph(agents, handoffs) {
    const lines = [];
    if (agents.size === 0) {
        return ['No agents'];
    }
    // Build adjacency for graph
    const connections = new Map();
    for (const handoff of handoffs) {
        const existing = connections.get(handoff.from) || [];
        if (!existing.includes(handoff.to)) {
            existing.push(handoff.to);
        }
        connections.set(handoff.from, existing);
    }
    // Find root nodes (agents with no incoming edges)
    const hasIncoming = new Set();
    for (const handoff of handoffs) {
        hasIncoming.add(handoff.to);
    }
    const roots = [];
    const nonRoots = [];
    for (const [id, agent] of agents) {
        if (!hasIncoming.has(agent.name)) {
            roots.push(agent.name);
        }
        else {
            nonRoots.push(agent.name);
        }
    }
    // Simple graph rendering
    if (roots.length === 0 && agents.size > 0) {
        // No clear hierarchy, show all agents
        const agentNames = Array.from(agents.values()).map(a => a.name);
        lines.push('');
        lines.push(`  ${agentNames.map(n => `${getAgentIcon(n)} ${n}`).join('  ')}`);
        lines.push('');
    }
    else {
        lines.push('');
        // Draw roots connecting to their targets
        for (let i = 0; i < roots.length; i++) {
            const root = roots[i];
            const icon = getAgentIcon(root);
            const targets = connections.get(root) || [];
            if (i === 0 && roots.length > 1) {
                lines.push(`  ${icon} ${root} ${'─'.repeat(2)}┐`);
            }
            else if (i === roots.length - 1 && roots.length > 1) {
                lines.push(`  ${icon} ${root} ${'─'.repeat(2)}┘`);
            }
            else if (roots.length === 1) {
                // Single root with targets
                if (targets.length > 0) {
                    const targetStr = targets.map(t => `${getAgentIcon(t)} ${t}`).join(' → ');
                    lines.push(`  ${icon} ${root} ───→ ${targetStr}`);
                }
                else {
                    lines.push(`  ${icon} ${root}`);
                }
            }
            else {
                lines.push(`  ${icon} ${root} ${'─'.repeat(2)}┤`);
            }
        }
        // If multiple roots converge, show convergence
        if (roots.length > 1) {
            // Find common targets
            const allTargets = new Set();
            for (const root of roots) {
                const targets = connections.get(root) || [];
                for (const t of targets)
                    allTargets.add(t);
            }
            if (allTargets.size > 0) {
                const padding = ' '.repeat(Math.max(...roots.map(r => r.length)) + 6);
                const targetArr = Array.from(allTargets);
                let targetLine = `${padding}├───→ `;
                for (let i = 0; i < targetArr.length; i++) {
                    const t = targetArr[i];
                    const icon = getAgentIcon(t);
                    const nextTargets = connections.get(t) || [];
                    if (i > 0)
                        targetLine += ' → ';
                    targetLine += `${icon} ${t}`;
                    // Show secondary connections
                    if (nextTargets.length > 0) {
                        for (const nt of nextTargets) {
                            if (!targetArr.includes(nt)) {
                                targetLine += ` ───→ ${getAgentIcon(nt)} ${nt}`;
                            }
                        }
                    }
                }
                lines.push(targetLine);
            }
        }
        lines.push('');
    }
    return lines;
}
/**
 * Build stats table
 */
function buildStatsTable(agents, handoffs) {
    const lines = [];
    // Header
    const headerLine = `Agent        ${DBOX.vertical} Tasks ${DBOX.vertical} Time   ${DBOX.vertical} Handoffs`;
    lines.push(colorize(headerLine, COLORS.dim));
    // Divider using regular characters for inner table
    lines.push(`${'─'.repeat(13)}┼${'─'.repeat(7)}┼${'─'.repeat(8)}┼${'─'.repeat(20)}`);
    // Agent rows
    for (const [, agent] of agents) {
        const icon = getAgentIcon(agent.name);
        const name = padEnd(`${icon} ${agent.name}`, 11);
        const tasks = padEnd(String(agent.completed.length || 1), 5);
        const time = padEnd(formatDuration(agent.duration), 6);
        // Calculate handoffs
        const handoffsIn = handoffs.filter(h => h.to === agent.name).map(h => `← ${h.from}`);
        const handoffsOut = handoffs.filter(h => h.from === agent.name).map(h => `→ ${h.to}`);
        const handoffStr = [...handoffsIn, ...handoffsOut].join(', ') || '-';
        lines.push(`${name} │ ${tasks} │ ${time} │ ${handoffStr}`);
    }
    return lines;
}
/**
 * Render the completion dashboard
 */
export function renderDashboard(state) {
    // Merge active and completed agents
    const allAgents = new Map();
    for (const [id, agent] of state.activeAgents) {
        allAgents.set(id, agent);
    }
    for (const [id, agent] of state.completedAgents) {
        allAgents.set(id, agent);
    }
    // Build graph section
    const graphLines = buildCollaborationGraph(allAgents, state.handoffs);
    // Build stats section
    const statsLines = buildStatsTable(allAgents, state.handoffs);
    // Calculate totals
    const totalDuration = Date.now() - state.startTime;
    let totalTasks = 0;
    for (const [, agent] of allAgents) {
        totalTasks += agent.completed.length || 1;
    }
    // Total line
    statsLines.push(`${'─'.repeat(13)}┴${'─'.repeat(7)}┴${'─'.repeat(8)}┴${'─'.repeat(20)}`);
    statsLines.push(colorize(`Total: ${totalTasks} tasks │ ${allAgents.size} agents │ ${state.handoffs.length} handoffs │ ${formatDuration(totalDuration)}`, COLORS.success));
    const title = `${ICONS.check} COMPLETE`;
    return drawDoubleBoxWithDivider(graphLines, statsLines, BOX_WIDTH, title, COLORS.success);
}
/**
 * Render a simple completion message
 */
export function renderCompleteSimple(agentCount, duration) {
    return colorize(`${ICONS.check} Complete. ${agentCount} agents collaborated in ${formatDuration(duration)}.`, COLORS.success);
}
