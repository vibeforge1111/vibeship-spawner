#!/usr/bin/env node
/**
 * Spawner Notification Hook
 *
 * Main entry point for Claude Code hooks.
 * Intercepts tool calls and renders agent notifications.
 */

import type {
  HookInput,
  SpawnerEvent,
  SpawnData,
  ProgressData,
  WaitingData,
  HandoffData,
  CompleteData,
  ErrorData,
} from './types.js';

import {
  loadState,
  saveState,
  clearState,
  handleSpawn,
  handleProgress,
  handleWaiting,
  handleHandoff,
  handleComplete,
  handleError,
  allAgentsComplete,
  getAgentByName,
} from './state.js';

import {
  renderAgentLane,
  renderHandoff,
  renderBlocker,
  renderWarning,
  renderDashboard,
} from './renderer/index.js';

import { colorize, COLORS, ICONS } from './utils.js';

/**
 * Read JSON input from stdin
 */
async function readStdin(): Promise<string> {
  return new Promise((resolve) => {
    let data = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
      data += chunk;
    });
    process.stdin.on('end', () => {
      resolve(data);
    });
  });
}

/**
 * Output to terminal (stderr so Claude Code doesn't capture it)
 */
function output(text: string): void {
  console.error(text);
}

/**
 * Output error (stderr)
 */
function outputError(text: string): void {
  console.error(text);
}

/**
 * Render a skill loading notification
 */
function renderSkillLoading(skillName: string): string {
  const lines = [
    colorize(`${ICONS.spinner} Loading skill: ${skillName}`, COLORS.info),
  ];
  return lines.join('\n');
}


/**
 * Check if tool input contains a spawner event
 */
function extractSpawnerEvent(toolInput: Record<string, unknown>): SpawnerEvent | null {
  // Direct spawner_event in params
  if (toolInput.spawner_event) {
    return toolInput.spawner_event as SpawnerEvent;
  }

  // Check in nested prompt for event markers
  if (typeof toolInput.prompt === 'string') {
    // Try to find JSON event in prompt
    const match = toolInput.prompt.match(/\[SPAWNER_EVENT\](.*?)\[\/SPAWNER_EVENT\]/s);
    if (match) {
      try {
        return JSON.parse(match[1]) as SpawnerEvent;
      } catch {
        // Not valid JSON
      }
    }
  }

  return null;
}

/**
 * Map subagent types to friendly names
 */
const AGENT_NAME_MAP: Record<string, { name: string; icon: string }> = {
  'general-purpose': { name: 'Agent', icon: '🤖' },
  'Explore': { name: 'Explorer', icon: '🔍' },
  'Plan': { name: 'Planner', icon: '🎯' },
  'claude-code-guide': { name: 'Guide', icon: '📚' },
  'superpowers:code-reviewer': { name: 'Reviewer', icon: '👀' },
  // Domain agents
  'frontend': { name: 'Frontend', icon: '🎨' },
  'backend': { name: 'Backend', icon: '⚙️' },
  'database': { name: 'Database', icon: '🗄️' },
  'testing': { name: 'Testing', icon: '🧪' },
  'devops': { name: 'DevOps', icon: '☁️' },
  'payments': { name: 'Payments', icon: '💳' },
  'email': { name: 'Email', icon: '📧' },
  'search': { name: 'Search', icon: '🔍' },
  'ai': { name: 'AI', icon: '🧠' },
  'planner': { name: 'Planner', icon: '🎯' },
};

/**
 * Detect agent from Task tool call
 */
function detectAgentFromTask(
  toolInput: Record<string, unknown>,
  toolUseId: string
): SpawnData | null {
  // Task tool has subagent_type and description
  if (toolInput.subagent_type && toolInput.description) {
    const agentType = String(toolInput.subagent_type);
    const description = String(toolInput.description);

    // Get agent info from map
    const agentInfo = AGENT_NAME_MAP[agentType] ||
                      AGENT_NAME_MAP[agentType.toLowerCase()] ||
                      AGENT_NAME_MAP[agentType.split(':').pop() || ''];

    // Determine name and icon
    let name: string;
    let icon: string;

    if (agentInfo) {
      name = agentInfo.name;
      icon = agentInfo.icon;
    } else {
      // Parse from subagent_type
      const typePart = agentType.split(':').pop() || agentType;
      name = typePart.charAt(0).toUpperCase() + typePart.slice(1);
      icon = '🤖';
    }

    return {
      id: toolUseId, // Use the actual tool_use_id for tracking
      name,
      icon,
      skills: [], // Will be populated if skill info is available
      task: description,
    };
  }

  return null;
}

/**
 * Detect skill loading from Skill tool call
 */
function detectSkillFromToolCall(toolInput: Record<string, unknown>): string | null {
  if (toolInput.skill) {
    return String(toolInput.skill);
  }
  return null;
}

/**
 * Process a spawner event
 */
function processEvent(event: SpawnerEvent): void {
  const state = loadState();

  switch (event.type) {
    case 'agent:spawn': {
      const data = event.data as SpawnData;
      const agent = handleSpawn(state, data);
      output('');
      output(renderAgentLane(agent));
      break;
    }

    case 'agent:progress': {
      const data = event.data as ProgressData;
      const agent = handleProgress(state, data);
      if (agent) {
        output('');
        output(renderAgentLane(agent));
      }
      break;
    }

    case 'agent:waiting': {
      const data = event.data as WaitingData;
      const agent = handleWaiting(state, data);
      if (agent) {
        output('');
        output(renderAgentLane(agent));
      }
      break;
    }

    case 'agent:handoff': {
      const data = event.data as HandoffData;
      handleHandoff(state, data);
      output('');
      output(renderHandoff(data));
      break;
    }

    case 'agent:complete': {
      const data = event.data as CompleteData;
      const agent = handleComplete(state, data);
      if (agent) {
        output('');
        output(renderAgentLane(agent));
      }

      // Check if all done
      if (allAgentsComplete(state)) {
        output('');
        output(renderDashboard(state));
        clearState();
        return;
      }
      break;
    }

    case 'agent:error': {
      const data = event.data as ErrorData;
      const agent = handleError(state, data);
      if (agent) {
        output('');
        if (data.severity === 'blocking') {
          output(renderBlocker(agent, data));
        } else {
          output(renderWarning(agent, data.error));
        }
      }
      break;
    }
  }

  saveState(state);
}

/**
 * Main hook handler
 */
async function main(): Promise<void> {
  try {
    const input = await readStdin();
    if (!input.trim()) {
      process.exit(0);
    }

    const hookInput = JSON.parse(input) as HookInput;
    const toolInput = hookInput.tool_input || {};
    const toolUseId = hookInput.tool_use_id || `gen-${Date.now()}`;

    // Handle Skill tool - show skill loading
    if (hookInput.tool_name === 'Skill') {
      const skillName = detectSkillFromToolCall(toolInput);
      if (skillName) {
        output('');
        output(renderSkillLoading(skillName));
      }
      process.exit(0);
    }

    // Only process Task tool calls for agent spawning
    if (hookInput.tool_name !== 'Task') {
      process.exit(0);
    }

    // Try to extract explicit spawner event
    const event = extractSpawnerEvent(toolInput);
    if (event) {
      processEvent(event);
      process.exit(0);
    }

    // Try to detect agent from Task tool call
    const agentData = detectAgentFromTask(toolInput, toolUseId);
    if (agentData) {
      // Track in state and render full agent lane with box
      const state = loadState();
      const agent = handleSpawn(state, agentData);
      saveState(state);

      output('');
      output(renderAgentLane(agent));
    }

    process.exit(0);
  } catch (err) {
    // Silent failure - don't break Claude Code
    outputError(`Hook error: ${err}`);
    process.exit(0);
  }
}

main();
