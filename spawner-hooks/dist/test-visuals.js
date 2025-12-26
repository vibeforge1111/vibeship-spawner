/**
 * Visual Test Script
 *
 * Run with: npx ts-node test-visuals.ts
 * Or after build: node dist/test-visuals.js
 */
import { renderAgentLane, renderHandoff, renderBlocker, renderWarning, renderDashboard, } from './src/renderer/index.js';
// Test Agent Lane - Active
const activeAgent = {
    id: 'frontend-1',
    name: 'Frontend',
    icon: '🎨',
    skills: ['react-patterns', 'tailwind-ui'],
    task: 'Build login component',
    status: 'active',
    progress: 60,
    completed: ['Created component structure', 'Added form fields'],
    current: 'Applying Tailwind styles...',
    startTime: Date.now() - 12000,
    duration: 0,
    handoffsIn: [],
    handoffsOut: [],
};
// Test Agent Lane - Waiting
const waitingAgent = {
    ...activeAgent,
    id: 'frontend-2',
    status: 'waiting',
    waitingFor: 'Backend',
    waitingReason: 'Need auth endpoint schema',
};
// Test Agent Lane - Complete
const completeAgent = {
    ...activeAgent,
    id: 'backend-1',
    name: 'Backend',
    icon: '⚙️',
    skills: ['api-design', 'auth-flow'],
    task: 'Create auth endpoints',
    status: 'complete',
    progress: 100,
    completed: ['Created /api/auth/login', 'Added JWT handling'],
    current: '',
    duration: 8000,
};
// Test Handoff
const handoff = {
    from: 'Backend',
    to: 'Frontend',
    payload: '{ POST /api/auth/login → { token, user } }',
    description: 'Auth endpoint schema',
};
// Test Blocker
const error = {
    id: 'frontend-1',
    error: 'Missing auth types from Backend',
    severity: 'blocking',
};
// Test Dashboard State
const dashboardState = {
    activeAgents: new Map(),
    completedAgents: new Map([
        ['frontend-1', { ...activeAgent, status: 'complete', duration: 12000, progress: 100 }],
        ['backend-1', completeAgent],
        ['database-1', {
                id: 'database-1',
                name: 'Database',
                icon: '🗄️',
                skills: ['schema-design'],
                task: 'Create user schema',
                status: 'complete',
                progress: 100,
                completed: ['Created users table'],
                current: '',
                startTime: Date.now() - 15000,
                duration: 3000,
                handoffsIn: [],
                handoffsOut: ['Backend'],
            }],
    ]),
    handoffs: [
        { from: 'Database', to: 'Backend', payload: 'User schema', description: 'Schema types' },
        { from: 'Backend', to: 'Frontend', payload: '{ token, user }', description: 'Auth schema' },
    ],
    startTime: Date.now() - 28000,
    totalTasks: 4,
};
console.log('\n=== AGENT LANE (ACTIVE) ===\n');
console.log(renderAgentLane(activeAgent));
console.log('\n=== AGENT LANE (WAITING) ===\n');
console.log(renderAgentLane(waitingAgent));
console.log('\n=== AGENT LANE (COMPLETE) ===\n');
console.log(renderAgentLane(completeAgent));
console.log('\n=== HANDOFF CALLOUT ===\n');
console.log(renderHandoff(handoff));
console.log('\n=== BLOCKER ALERT ===\n');
console.log(renderBlocker(waitingAgent, error));
console.log('\n=== WARNING ===\n');
console.log(renderWarning(activeAgent, 'Missing auth types, using fallback'));
console.log('\n=== COMPLETION DASHBOARD ===\n');
console.log(renderDashboard(dashboardState));
console.log('\n=== ALL TESTS COMPLETE ===\n');
