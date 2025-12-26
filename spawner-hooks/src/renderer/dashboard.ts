/**
 * Completion Dashboard Renderer
 *
 * Renders final summary with collaboration graph and stats
 */

import type { NotificationState, AgentState, HandoffData } from '../types.js';
import {
  drawDoubleBoxWithDivider,
  colorize,
  COLORS,
  ICONS,
  BOX_WIDTH,
  getAgentIcon,
  formatDuration,
  padEnd,
  DBOX,
} from '../utils.js';

/**
 * Build collaboration graph as ASCII art (no emojis for clean alignment)
 */
function buildCollaborationGraph(
  agents: Map<string, AgentState>,
  handoffs: HandoffData[]
): string[] {
  const lines: string[] = [];

  if (agents.size === 0) {
    return ['No agents'];
  }

  // Build adjacency for graph
  const connections = new Map<string, string[]>();
  for (const handoff of handoffs) {
    const existing = connections.get(handoff.from) || [];
    if (!existing.includes(handoff.to)) {
      existing.push(handoff.to);
    }
    connections.set(handoff.from, existing);
  }

  // Find root nodes (agents with no incoming edges)
  const hasIncoming = new Set<string>();
  for (const handoff of handoffs) {
    hasIncoming.add(handoff.to);
  }

  const roots: string[] = [];

  for (const [, agent] of agents) {
    if (!hasIncoming.has(agent.name)) {
      roots.push(agent.name);
    }
  }

  // Simple graph rendering - no emojis, max width 48
  const maxWidth = 48;

  if (roots.length === 0 && agents.size > 0) {
    const agentNames = Array.from(agents.values()).map(a => a.name);
    lines.push('');
    // Join with arrows, wrap if needed
    let line = '  ';
    for (let i = 0; i < agentNames.length; i++) {
      const addition = i === 0 ? agentNames[i] : `  -->  ${agentNames[i]}`;
      if (line.length + addition.length > maxWidth && line.length > 2) {
        lines.push(line);
        line = '    -->  ' + agentNames[i];
      } else {
        line += addition;
      }
    }
    if (line.length > 2) lines.push(line);
    lines.push('');
  } else {
    lines.push('');

    for (const root of roots) {
      const targets = connections.get(root) || [];
      if (targets.length > 0) {
        // Follow the chain, wrap if needed
        let line = '  ' + root;
        let current = root;
        while (connections.get(current)?.length) {
          const next = connections.get(current)![0];
          const addition = `  -->  ${next}`;
          if (line.length + addition.length > maxWidth) {
            lines.push(line);
            line = '    -->  ' + next;
          } else {
            line += addition;
          }
          current = next;
        }
        lines.push(line);
      } else {
        lines.push(`  ${root}`);
      }
    }

    lines.push('');
  }

  return lines;
}

/**
 * Build stats table (no emojis for clean alignment)
 */
function buildStatsTable(
  agents: Map<string, AgentState>,
  handoffs: HandoffData[]
): string[] {
  const lines: string[] = [];

  // Header
  lines.push(colorize('Agent         | Tasks | Time   | In | Out', COLORS.dim));
  lines.push('──────────────┼───────┼────────┼────┼────');

  // Agent rows
  for (const [, agent] of agents) {
    const name = padEnd(agent.name, 13);
    const tasks = padEnd(String(agent.completed.length || 1), 5);
    const time = padEnd(formatDuration(agent.duration), 6);

    // Count handoffs
    const inCount = handoffs.filter(h => h.to === agent.name).length;
    const outCount = handoffs.filter(h => h.from === agent.name).length;

    lines.push(`${name} | ${tasks} | ${time} | ${padEnd(String(inCount), 2)} | ${outCount}`);
  }

  return lines;
}

/**
 * Render the completion dashboard
 */
export function renderDashboard(state: NotificationState): string {
  // Merge active and completed agents
  const allAgents = new Map<string, AgentState>();
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
  statsLines.push('──────────────┴───────┴────────┴────┴────');
  statsLines.push(
    colorize(
      `Total: ${totalTasks} tasks | ${allAgents.size} agents | ${state.handoffs.length} handoffs | ${formatDuration(totalDuration)}`,
      COLORS.success
    )
  );

  const title = 'COMPLETE';
  return drawDoubleBoxWithDivider(graphLines, statsLines, BOX_WIDTH, title, COLORS.success);
}

/**
 * Render a simple completion message
 */
export function renderCompleteSimple(agentCount: number, duration: number): string {
  return colorize(
    `${ICONS.check} Complete. ${agentCount} agents collaborated in ${formatDuration(duration)}.`,
    COLORS.success
  );
}
