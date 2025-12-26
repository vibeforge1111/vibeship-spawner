#!/usr/bin/env node
/**
 * Spawner Post-Tool Hook
 *
 * Runs after Task/Skill tools complete to handle agent completion and results.
 */
import { loadState, saveState, clearState, handleComplete, handleProgress, handleHandoff, allAgentsComplete, } from './state.js';
import { renderAgentLane, renderHandoff, renderDashboard, } from './renderer/index.js';
import { colorize, COLORS, ICONS } from './utils.js';
/**
 * Read JSON input from stdin
 */
async function readStdin() {
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
function output(text) {
    console.error(text);
}
/**
 * Render skill loaded confirmation
 */
function renderSkillLoaded(skillName) {
    return colorize(`${ICONS.check} Skill loaded: ${skillName}`, COLORS.success);
}
/**
 * Parse subagent response for embedded events
 */
function parseResponseForEvents(response) {
    const events = [];
    if (typeof response !== 'object' || response === null) {
        return events;
    }
    // Check for string content that might contain event markers
    const responseStr = JSON.stringify(response);
    // Find all event markers
    const eventMatches = responseStr.matchAll(/\[SPAWNER_EVENT\](.*?)\[\/SPAWNER_EVENT\]/gs);
    for (const match of eventMatches) {
        try {
            const event = JSON.parse(match[1]);
            events.push(event);
        }
        catch {
            // Invalid JSON, skip
        }
    }
    return events;
}
/**
 * Main handler
 */
async function main() {
    try {
        const input = await readStdin();
        if (!input.trim()) {
            process.exit(0);
        }
        const hookInput = JSON.parse(input);
        const toolInput = hookInput.tool_input || {};
        const toolUseId = hookInput.tool_use_id || '';
        const toolResponse = hookInput.tool_response || {};
        // Handle Skill tool completion
        if (hookInput.tool_name === 'Skill') {
            const skillName = toolInput.skill ? String(toolInput.skill) : null;
            if (skillName && !toolResponse.error) {
                output('');
                output(renderSkillLoaded(skillName));
            }
            process.exit(0);
        }
        // Handle spawner_emit MCP tool - parse event from response
        if (hookInput.tool_name.includes('spawner_emit')) {
            const embeddedEvents = parseResponseForEvents(toolResponse);
            const state = loadState();
            for (const event of embeddedEvents) {
                switch (event.type) {
                    case 'agent:progress': {
                        const data = event.data;
                        const progressAgent = handleProgress(state, data);
                        if (progressAgent) {
                            output('');
                            output(renderAgentLane(progressAgent));
                        }
                        break;
                    }
                    case 'agent:handoff': {
                        const data = event.data;
                        handleHandoff(state, data);
                        output('');
                        output(renderHandoff(data));
                        break;
                    }
                    case 'agent:waiting': {
                        // Handle waiting state
                        break;
                    }
                    case 'agent:error': {
                        // Handle error
                        break;
                    }
                }
            }
            saveState(state);
            process.exit(0);
        }
        // Only process Task tool
        if (hookInput.tool_name !== 'Task') {
            process.exit(0);
        }
        const state = loadState();
        // Find agent by tool_use_id
        const agent = state.activeAgents.get(toolUseId);
        if (!agent) {
            // Try to find by matching description
            const description = String(toolInput.description || '');
            for (const [id, a] of state.activeAgents) {
                if (a.task.toLowerCase().includes(description.toLowerCase().substring(0, 20))) {
                    // Found a match
                    const isSuccess = !toolResponse.error;
                    if (isSuccess) {
                        const completeData = {
                            id,
                            result: 'Task completed',
                            duration: Date.now() - a.startTime,
                            tasks_completed: a.completed.length + 1,
                        };
                        const completedAgent = handleComplete(state, completeData);
                        if (completedAgent) {
                            output('');
                            output(renderAgentLane(completedAgent));
                        }
                    }
                    break;
                }
            }
        }
        else {
            // Direct match by ID
            const isSuccess = !toolResponse.error;
            if (isSuccess) {
                const completeData = {
                    id: toolUseId,
                    result: 'Task completed',
                    duration: Date.now() - agent.startTime,
                    tasks_completed: agent.completed.length + 1,
                };
                const completedAgent = handleComplete(state, completeData);
                if (completedAgent) {
                    output('');
                    output(renderAgentLane(completedAgent));
                }
            }
        }
        // Parse response for embedded events
        const embeddedEvents = parseResponseForEvents(toolResponse);
        for (const event of embeddedEvents) {
            switch (event.type) {
                case 'agent:progress': {
                    const data = event.data;
                    const progressAgent = handleProgress(state, data);
                    if (progressAgent) {
                        output('');
                        output(renderAgentLane(progressAgent));
                    }
                    break;
                }
                case 'agent:handoff': {
                    const data = event.data;
                    handleHandoff(state, data);
                    output('');
                    output(renderHandoff(data));
                    break;
                }
            }
        }
        // Check if all done
        if (allAgentsComplete(state)) {
            output('');
            output(renderDashboard(state));
            clearState();
            process.exit(0);
        }
        saveState(state);
        process.exit(0);
    }
    catch (err) {
        // Silent failure
        process.exit(0);
    }
}
main();
