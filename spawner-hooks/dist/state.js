/**
 * State Management
 *
 * Tracks agent activity across tool calls
 */
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
// State file location
const STATE_FILE = path.join(os.tmpdir(), 'spawner-hook-state.json');
/**
 * Create initial empty state
 */
function createInitialState() {
    return {
        activeAgents: new Map(),
        completedAgents: new Map(),
        handoffs: [],
        startTime: Date.now(),
        totalTasks: 0,
    };
}
/**
 * Serialize state for persistence
 */
function serializeState(state) {
    return JSON.stringify({
        activeAgents: Array.from(state.activeAgents.entries()),
        completedAgents: Array.from(state.completedAgents.entries()),
        handoffs: state.handoffs,
        startTime: state.startTime,
        totalTasks: state.totalTasks,
    });
}
/**
 * Deserialize state from persistence
 */
function deserializeState(json) {
    try {
        const data = JSON.parse(json);
        return {
            activeAgents: new Map(data.activeAgents || []),
            completedAgents: new Map(data.completedAgents || []),
            handoffs: data.handoffs || [],
            startTime: data.startTime || Date.now(),
            totalTasks: data.totalTasks || 0,
        };
    }
    catch {
        return createInitialState();
    }
}
/**
 * Load state from disk
 */
export function loadState() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            const content = fs.readFileSync(STATE_FILE, 'utf-8');
            return deserializeState(content);
        }
    }
    catch {
        // Ignore errors, return fresh state
    }
    return createInitialState();
}
/**
 * Save state to disk
 */
export function saveState(state) {
    try {
        fs.writeFileSync(STATE_FILE, serializeState(state));
    }
    catch {
        // Ignore errors
    }
}
/**
 * Clear state (for new session)
 */
export function clearState() {
    try {
        if (fs.existsSync(STATE_FILE)) {
            fs.unlinkSync(STATE_FILE);
        }
    }
    catch {
        // Ignore errors
    }
}
/**
 * Handle agent spawn event
 */
export function handleSpawn(state, data) {
    const agent = {
        id: data.id,
        name: data.name,
        icon: data.icon,
        skills: data.skills || [],
        task: data.task,
        status: 'active',
        progress: 0,
        completed: [],
        current: data.task,
        startTime: Date.now(),
        duration: 0,
        handoffsIn: [],
        handoffsOut: [],
    };
    state.activeAgents.set(data.id, agent);
    state.totalTasks++;
    return agent;
}
/**
 * Handle progress update event
 */
export function handleProgress(state, data) {
    const agent = state.activeAgents.get(data.id);
    if (!agent)
        return null;
    agent.progress = data.percent;
    agent.current = data.message;
    agent.completed = data.completed || agent.completed;
    return agent;
}
/**
 * Handle waiting event
 */
export function handleWaiting(state, data) {
    const agent = state.activeAgents.get(data.id);
    if (!agent)
        return null;
    agent.status = 'waiting';
    agent.waitingFor = data.waiting_for;
    agent.waitingReason = data.reason;
    return agent;
}
/**
 * Handle handoff event
 */
export function handleHandoff(state, data) {
    state.handoffs.push(data);
    // Update sender's handoffsOut
    for (const [, agent] of state.activeAgents) {
        if (agent.name === data.from) {
            agent.handoffsOut.push(data.to);
        }
        if (agent.name === data.to) {
            agent.handoffsIn.push(data.from);
            // Resume if was waiting
            if (agent.status === 'waiting' && agent.waitingFor === data.from) {
                agent.status = 'active';
                agent.waitingFor = undefined;
                agent.waitingReason = undefined;
            }
        }
    }
}
/**
 * Handle completion event
 */
export function handleComplete(state, data) {
    const agent = state.activeAgents.get(data.id);
    if (!agent)
        return null;
    agent.status = 'complete';
    agent.duration = data.duration || (Date.now() - agent.startTime);
    agent.progress = 100;
    // Move to completed
    state.activeAgents.delete(data.id);
    state.completedAgents.set(data.id, agent);
    return agent;
}
/**
 * Handle error event
 */
export function handleError(state, data) {
    const agent = state.activeAgents.get(data.id);
    if (!agent)
        return null;
    if (data.severity === 'blocking') {
        agent.status = 'error';
    }
    agent.error = data.error;
    return agent;
}
/**
 * Check if all agents are complete
 */
export function allAgentsComplete(state) {
    return state.activeAgents.size === 0 && state.completedAgents.size > 0;
}
/**
 * Get agent by name (searching both active and completed)
 */
export function getAgentByName(state, name) {
    for (const [, agent] of state.activeAgents) {
        if (agent.name === name)
            return agent;
    }
    for (const [, agent] of state.completedAgents) {
        if (agent.name === name)
            return agent;
    }
    return null;
}
