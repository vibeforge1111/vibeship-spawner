# Agent Notification System Design

> Real-time terminal notifications showing agent activity, collaboration, and completion

## Goals

- **Primary**: Users see what's happening - which agents are working, on what, and how they collaborate
- **Secondary**: Beautiful terminal visuals that make using Spawner a joyful experience
- **Critical**: Reliable. Works every time, not sometimes.

## Architecture Decision

**Hooks-based, not MCP-dependent.**

MCP tools are called when Claude decides to call them - inconsistent. Hooks fire on every tool call regardless of Claude's behavior - guaranteed.

```
┌─────────────────────────────────────────────────────────┐
│                   CLAUDE CODE                           │
│                                                         │
│   Agent calls tool ──→ Hook fires (PreToolUse)          │
│                              │                          │
│                              ▼                          │
│                     ┌────────────────┐                  │
│                     │ SPAWNER HOOK   │                  │
│                     │                │                  │
│                     │ 1. Parse event │                  │
│                     │ 2. Update state│                  │
│                     │ 3. Render UI   │                  │
│                     └────────────────┘                  │
│                              │                          │
│                              ▼                          │
│                     Terminal output                     │
└─────────────────────────────────────────────────────────┘
```

## Event System

### Mandatory Events

Agents MUST emit these events. Hook detects via `spawner_event` in tool params.

| Event | When | Data |
|-------|------|------|
| `agent:spawn` | Agent starts | id, name, icon, skills[], task |
| `agent:progress` | Work updates | id, message, percent, completed[] |
| `agent:waiting` | Blocked on another | id, waiting_for, reason |
| `agent:handoff` | Passing work | from, to, payload, description |
| `agent:complete` | Task done | id, result, duration, tasks_completed |
| `agent:error` | Something broke | id, error, severity (warning/blocking) |

### Event Schema

```typescript
interface SpawnerEvent {
  type: 'agent:spawn' | 'agent:progress' | 'agent:waiting' | 'agent:handoff' | 'agent:complete' | 'agent:error';
  timestamp: number;
  data: SpawnData | ProgressData | WaitingData | HandoffData | CompleteData | ErrorData;
}

interface SpawnData {
  id: string;
  name: string;
  icon: string;
  skills: string[];
  task: string;
}

interface ProgressData {
  id: string;
  message: string;
  percent: number;
  completed: string[];
}

interface WaitingData {
  id: string;
  waiting_for: string;
  reason: string;
}

interface HandoffData {
  from: string;
  to: string;
  payload: string;
  description: string;
}

interface CompleteData {
  id: string;
  result: string;
  duration: number;
  tasks_completed: number;
}

interface ErrorData {
  id: string;
  error: string;
  severity: 'warning' | 'blocking';
}
```

## Visual Components

### Design Constraints

- **Fixed width**: 55 characters for all boxes
- **Box drawing**: Consistent use of `┌ ┐ └ ┘ │ ─` for normal, `╔ ╗ ╚ ╝ ║ ═` for emphasis
- **No morphing**: Lines always align, no broken edges
- **Colors**: Green (success), Yellow (waiting), Red (error), Cyan (info)

### 1. Agent Lane (Active Work)

Shows an agent's current state while working.

```
┌─ 🎨 Frontend ────────────────────────────────────────┐
│ Skills: react-patterns, tailwind-ui                  │
│                                                      │
│ ████████████░░░░░░░░ 60%                             │
│ ✓ Created component structure                        │
│ ✓ Added form fields                                  │
│ ⟳ Applying Tailwind styles...                        │
│                                                      │
│ ⏳ Waiting: Backend auth schema                       │
└──────────────────────────────────────────────────────┘
```

**States:**
- Active (cyan border): Currently working
- Waiting (yellow border): Blocked on another agent
- Complete (green border): Finished successfully
- Error (red border): Has issues

### 2. Handoff Callout (Collaboration)

Highlights when agents pass work to each other.

```
╔═══════════════════════════════════════════════════════╗
║  ↯ HANDOFF                                            ║
╠═══════════════════════════════════════════════════════╣
║  Backend ──→ Frontend                                 ║
║                                                       ║
║  Payload: Auth endpoint schema                        ║
║  { POST /api/auth/login → { token, user } }           ║
╚═══════════════════════════════════════════════════════╝
```

### 3. Blocker Alert (Needs Attention)

Shown when an agent cannot continue.

```
╔═══════════════════════════════════════════════════════╗
║  ⛔ BLOCKED                                           ║
╠═══════════════════════════════════════════════════════╣
║  Frontend cannot continue                             ║
║  Reason: Missing auth types from Backend              ║
║                                                       ║
║  Waiting: 12s                                         ║
╚═══════════════════════════════════════════════════════╝
```

### 4. Inline Warning

Non-blocking issues shown within agent lane.

```
┌─ 🎨 Frontend ────────────────────────────────────────┐
│ ⚠️  Warning: Missing auth types, using fallback       │
│ Continuing with default schema...                    │
└──────────────────────────────────────────────────────┘
```

### 5. Completion Dashboard (Final Summary)

Shown when all agents complete. Includes collaboration graph + stats.

```
╔═══════════════════════════════════════════════════════╗
║  ✓ COMPLETE                                           ║
╠═══════════════════════════════════════════════════════╣
║                                                       ║
║    Database ───┐                                      ║
║                ├───→ Backend ───→ Frontend            ║
║    Planner ────┘          │                           ║
║                           └───→ Testing               ║
║                                                       ║
╠═══════════════════════════════════════════════════════╣
║  Agent        │ Tasks │ Time   │ Handoffs             ║
╠═══════════════╪═══════╪════════╪══════════════════════╣
║  🎨 Frontend  │ 4     │ 12s    │ ← Backend            ║
║  ⚙️  Backend   │ 2     │ 8s     │ → Frontend, Testing  ║
║  🗄️  Database  │ 1     │ 3s     │ → Backend            ║
║  🧪 Testing   │ 2     │ 5s     │ ← Backend            ║
╠═══════════════════════════════════════════════════════╣
║  Total: 9 tasks │ 4 agents │ 3 handoffs │ 28s        ║
╚═══════════════════════════════════════════════════════╝
```

## Hook Implementation

### Hook Types Used

| Hook | When | Purpose |
|------|------|---------|
| `PreToolUse` | Before any tool runs | Detect agent spawn, show "working" state |
| `PostToolUse` | After tool completes | Update progress, show results |

### Hook Detection Logic

```typescript
// In hook handler
function handleToolUse(toolName: string, params: any) {
  // Check for spawner event metadata
  if (params.spawner_event) {
    const event = params.spawner_event as SpawnerEvent;

    switch (event.type) {
      case 'agent:spawn':
        renderAgentLane(event.data, 'active');
        break;
      case 'agent:progress':
        updateAgentLane(event.data);
        break;
      case 'agent:waiting':
        renderWaitingState(event.data);
        break;
      case 'agent:handoff':
        renderHandoffCallout(event.data);
        break;
      case 'agent:complete':
        renderAgentLane(event.data, 'complete');
        trackForSummary(event.data);
        break;
      case 'agent:error':
        if (event.data.severity === 'blocking') {
          renderBlockerAlert(event.data);
        } else {
          renderInlineWarning(event.data);
        }
        break;
    }
  }

  // Check if all agents complete → show dashboard
  if (allAgentsComplete()) {
    renderCompletionDashboard();
  }
}
```

### State Management

Hook maintains state across tool calls:

```typescript
interface NotificationState {
  activeAgents: Map<string, AgentState>;
  handoffs: HandoffData[];
  startTime: number;
  totalTasks: number;
}

interface AgentState {
  id: string;
  name: string;
  icon: string;
  skills: string[];
  status: 'active' | 'waiting' | 'complete' | 'error';
  progress: number;
  completed: string[];
  current: string;
  duration: number;
  handoffsIn: string[];
  handoffsOut: string[];
}
```

## File Structure

```
spawner-v2/
├── src/
│   └── hooks/
│       ├── index.ts              # Hook registration
│       ├── notification-hook.ts  # Main hook handler
│       ├── state.ts              # State management
│       └── renderer/
│           ├── index.ts          # Renderer exports
│           ├── agent-lane.ts     # Agent lane component
│           ├── handoff.ts        # Handoff callout
│           ├── blocker.ts        # Blocker alert
│           ├── warning.ts        # Inline warning
│           ├── dashboard.ts      # Completion dashboard
│           ├── graph.ts          # Collaboration graph
│           └── utils.ts          # Box drawing, colors
```

## Integration Points

### 1. Agent Tool Calls

When spawning agents via Task tool, include event metadata:

```typescript
// In skill/agent dispatcher
await task({
  description: "Build login component",
  prompt: "...",
  spawner_event: {
    type: 'agent:spawn',
    timestamp: Date.now(),
    data: {
      id: 'frontend-1',
      name: 'Frontend',
      icon: '🎨',
      skills: ['react-patterns', 'tailwind-ui'],
      task: 'Build login component'
    }
  }
});
```

### 2. Progress Updates

Agents emit progress during work:

```typescript
// During agent execution
emitEvent({
  type: 'agent:progress',
  data: {
    id: 'frontend-1',
    message: 'Applying Tailwind styles...',
    percent: 60,
    completed: ['Created component structure', 'Added form fields']
  }
});
```

### 3. Handoffs

When passing work between agents:

```typescript
emitEvent({
  type: 'agent:handoff',
  data: {
    from: 'Backend',
    to: 'Frontend',
    payload: '{ POST /api/auth/login → { token, user } }',
    description: 'Auth endpoint schema'
  }
});
```

## Colors (ANSI)

```typescript
const COLORS = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',

  // Status colors
  success: '\x1b[32m',    // Green
  warning: '\x1b[33m',    // Yellow
  error: '\x1b[31m',      // Red
  info: '\x1b[36m',       // Cyan

  // Dim for secondary text
  dim: '\x1b[2m',

  // Agent icons get their natural colors
  frontend: '\x1b[35m',   // Magenta
  backend: '\x1b[34m',    // Blue
  database: '\x1b[33m',   // Yellow
  testing: '\x1b[32m',    // Green
};
```

## Progress Bar Rendering

```typescript
function renderProgressBar(percent: number, width: number = 20): string {
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  return '█'.repeat(filled) + '░'.repeat(empty) + ` ${percent}%`;
}
```

## Box Drawing Utilities

```typescript
const BOX = {
  // Single line (normal)
  topLeft: '┌',
  topRight: '┐',
  bottomLeft: '└',
  bottomRight: '┘',
  horizontal: '─',
  vertical: '│',

  // Double line (emphasis)
  dTopLeft: '╔',
  dTopRight: '╗',
  dBottomLeft: '╚',
  dBottomRight: '╝',
  dHorizontal: '═',
  dVertical: '║',

  // Connectors
  teeRight: '├',
  teeLeft: '┤',
  cross: '┼',
  dTeeRight: '╠',
  dTeeLeft: '╣',
};

function drawBox(content: string[], width: number, double: boolean = false): string {
  const b = double ?
    { tl: BOX.dTopLeft, tr: BOX.dTopRight, bl: BOX.dBottomLeft, br: BOX.dBottomRight, h: BOX.dHorizontal, v: BOX.dVertical } :
    { tl: BOX.topLeft, tr: BOX.topRight, bl: BOX.bottomLeft, br: BOX.bottomRight, h: BOX.horizontal, v: BOX.vertical };

  const lines: string[] = [];
  lines.push(b.tl + b.h.repeat(width - 2) + b.tr);

  for (const line of content) {
    const padded = line.padEnd(width - 4);
    lines.push(b.v + ' ' + padded + ' ' + b.v);
  }

  lines.push(b.bl + b.h.repeat(width - 2) + b.br);
  return lines.join('\n');
}
```

## Success Criteria

1. **Reliability**: Notifications appear 100% of the time when agents work
2. **Performance**: No noticeable lag in terminal rendering
3. **Clarity**: Users understand what's happening at a glance
4. **Beauty**: Visuals are polished and consistent
5. **Collaboration visibility**: Handoffs and agent coordination are clear

## Out of Scope (for now)

- Persistent notification history/log file
- Web UI mirroring terminal notifications
- Custom notification preferences per user
- Sound/system notifications
