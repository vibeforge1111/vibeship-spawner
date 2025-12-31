# Orchestration System Documentation

> Multi-agent coordination for Spawner skills

---

## Overview

The orchestration system enables multiple skills to work together as coordinated teams. Instead of loading skills one at a time, users can activate entire teams that know how to communicate and hand off work to each other.

### Key Concepts

| Concept | Description |
|---------|-------------|
| **Workflow** | A sequence of skills with defined inputs/outputs and optional quality gates |
| **Team** | A group of skills that work together with a lead and communication pattern |
| **Pattern** | How skills coordinate: sequential, parallel, conditional, supervised |
| **Contract** | Data requirements for handoffs between skills |
| **Quality Gate** | Validation checkpoint with generator-critic loops |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     MCP Tools (User Interface)                   │
├─────────────────────────────────────────────────────────────────┤
│  spawner_orchestrate    │  spawner_workflow  │  spawner_orchestrate_brainstorm  │
│  (entry point)          │  (execution)       │  (pattern selection)             │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Orchestration Engine                          │
├─────────────────────────────────────────────────────────────────┤
│  workflow.ts   │  teams.ts   │  contracts.ts  │  events.ts      │
│  (execution)   │  (groups)   │  (validation)  │  (notifications)│
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Skills Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  273 skills with collaboration.yaml defining handoff protocols  │
└─────────────────────────────────────────────────────────────────┘
```

### File Structure

```
spawner-v2/src/orchestration/
├── workflow.ts      # Workflow engine, execution modes, built-in workflows
├── teams.ts         # Skill teams, activation, communication patterns
├── contracts.ts     # State contracts, handoff validation
├── events.ts        # Event emission, parsing, formatting
└── index.ts         # Re-exports all modules

spawner-v2/src/tools/
├── workflow.ts              # spawner_workflow MCP tool
├── orchestrate-brainstorm.ts # spawner_orchestrate_brainstorm MCP tool
└── orchestrate.ts           # spawner_orchestrate (entry point)
```

---

## Orchestration Patterns

### 1. Sequential

**One step at a time, like a recipe**

```
[Skill A] → [Skill B] → [Skill C] → Done
```

**When to use:**
- Simple projects with clear order
- Each step needs previous step's output
- Fast prototypes (game jams, hackathons)

**Example:** Design → Build → Test

### 2. Parallel

**Multiple skills work at the same time**

```
           ┌→ [Skill A] ─┐
[Start] ───┼→ [Skill B] ─┼→ [Merge] → Done
           └→ [Skill C] ─┘
```

**When to use:**
- Independent components
- Time-critical projects
- Large teams

**Example:** Backend + Frontend + Mobile built simultaneously

### 3. Conditional

**Choose path based on context**

```
              ┌→ [Path A] ─┐
[Evaluate] ───┤            ├→ Done
              └→ [Path B] ─┘
```

**When to use:**
- Different approaches for different situations
- Feature flags
- A/B testing workflows

**Example:** If mobile → React Native, else → Web

### 4. Supervised (Generator-Critic)

**Build, review, iterate until quality passes**

```
[Generator] → [Critic] → Pass? → Yes → Done
     ↑            │
     └──── No ────┘
```

**When to use:**
- Quality-critical code
- Security-sensitive work
- Regulated industries

**Example:** Code gen → Security audit → Fix issues → Re-audit

### 5. Hub-Spoke

**Lead skill coordinates specialists**

```
              [Specialist A]
                    ↑
[Lead Skill] ←→ [Specialist B]
                    ↓
              [Specialist C]
```

**When to use:**
- Complex projects needing coordination
- One skill has full context
- Dynamic delegation

**Example:** System designer coordinates backend, frontend, devops

### 6. Pipeline

**Assembly line with strict handoffs**

```
[Step 1] ──data──→ [Step 2] ──data──→ [Step 3]
   │                  │                  │
   └── output A       └── output B       └── output C
```

**When to use:**
- Data transformation chains
- Clear input/output contracts
- Quality checkpoints between stages

**Example:** Research → Design → Implement → Test → Deploy

---

## Built-in Teams

| Team ID | Name | Skills | Use Cases |
|---------|------|--------|-----------|
| `full-stack-build` | Full Stack Build Team | system-designer, backend, frontend, devops, testing | Complete web apps |
| `game-jam` | Game Jam Speed Team | prompt-to-game, ai-game-art-generation, devops | Game jams, prototypes |
| `security-audit` | Security Audit Team | security-owasp, llm-security-audit, code-review | Security reviews |
| `ai-product` | AI Product Team | llm-architect, prompt-engineering, backend, frontend | AI-powered apps |
| `data-platform` | Data Platform Team | postgres-wizard, redis-specialist, backend, analytics | Data pipelines |
| `marketing-launch` | Marketing Launch Team | copywriting, seo, social-media-marketing, ai-video-generation | Product launches |
| `startup-mvp` | Startup MVP Team | yc-playbook, product-discovery, backend, frontend, devops | Rapid MVPs |

### Team Structure

```yaml
team:
  id: game-jam
  name: Game Jam Speed Team
  description: Rapid game development with AI assets
  skills:
    - prompt-to-game      # Lead
    - ai-game-art-generation
    - devops
  lead: prompt-to-game
  communication: hub-spoke
  workflow_mode: sequential
  triggers:
    - "make a game"
    - "game jam"
    - "vibe code a game"
  use_cases:
    - Game jam entries
    - Prototypes
    - Learning projects
```

---

## Built-in Workflows

| Workflow ID | Name | Steps | Mode |
|-------------|------|-------|------|
| `feature-build` | Feature Build Pipeline | product-discovery → backend → frontend → testing | sequential |
| `security-audit` | Security Audit Pipeline | security-owasp → llm-security-audit (with quality gate) | supervised |
| `game-jam` | Game Jam Speed Build | prompt-to-game → ai-game-art-generation → devops | sequential |
| `research-to-code` | Research to Implementation | product-discovery → system-designer → backend | sequential |

### Workflow Structure

```typescript
interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  mode: 'sequential' | 'parallel' | 'conditional' | 'supervised';
  steps: WorkflowStep[];
  initial_state?: Record<string, unknown>;
  final_outputs?: string[];
}

interface WorkflowStep {
  skill: string;
  inputs?: string[];      // Required keys from state
  outputs?: string[];     // Keys this step adds to state
  condition?: string;     // JS expression for conditional execution
  quality_gate?: QualityGate;
  timeout_ms?: number;
}

interface QualityGate {
  validator: string;      // Skill ID that validates output
  criteria: string[];     // What must pass
  max_iterations?: number;
  on_fail: 'retry' | 'block' | 'warn';
}
```

---

## MCP Tools

### spawner_orchestrate_brainstorm

Interactive guide to choose the right orchestration pattern.

**Actions:**

| Action | Description | Parameters |
|--------|-------------|------------|
| `start` | Begin brainstorming session | `goal` (project description) |
| `answer` | Answer a question | `question_id`, `answer`, `context` |
| `recommend` | Get pattern recommendation | `context` |
| `explain` | Explain a pattern in detail | `pattern` |

**Example Flow:**

```typescript
// 1. Start
spawner_orchestrate_brainstorm({
  action: "start",
  goal: "Build a multiplayer game"
})

// 2. Answer questions (4 total)
spawner_orchestrate_brainstorm({
  action: "answer",
  question_id: "complexity",
  answer: "medium",
  context: { /* from previous response */ }
})

// 3. Get recommendation
// Returns: pattern, workflow suggestion, next steps
```

**Questions Asked:**

1. **Complexity** - Simple / Medium / Complex / Critical
2. **Dependencies** - Linear / Independent / Mixed / Iterative
3. **Quality** - Ship fast / Balanced / High quality / Mission critical
4. **Speed** - Hours / Days / Weeks / Ongoing

### spawner_workflow

Execute workflows and manage teams.

**Actions:**

| Action | Description | Parameters |
|--------|-------------|------------|
| `list_workflows` | List available workflows | - |
| `list_teams` | List available teams | - |
| `start_workflow` | Begin a workflow | `workflow_id`, `initial_state?` |
| `start_team` | Activate a skill team | `team_id`, `initial_state?` |
| `validate_handoff` | Check handoff data | `from_skill`, `to_skill`, `data` |
| `find_team` | Find team by trigger phrase | `trigger` |
| `create_team` | Create custom team from skills | `name`, `skills`, `lead`, `communication?` |
| `create_workflow` | Create workflow from natural language | `description` |
| `check_skills` | Validate skills exist | `skills` (array) |
| `list_active` | List active workflows | - |
| `resume` | Resume saved workflow | `state_id` |
| `check_gate` | Run quality gate validation | `validator`, `criteria`, `outputs`, `iteration?`, `on_fail?` |

**Examples:**

```typescript
// List all teams
spawner_workflow({ action: "list_teams" })

// Start game jam team
spawner_workflow({
  action: "start_team",
  team_id: "game-jam"
})

// Validate handoff between skills
spawner_workflow({
  action: "validate_handoff",
  from_skill: "backend",
  to_skill: "frontend",
  data: { api_endpoints: [...], auth_flow: "jwt" }
})

// Create a custom team
spawner_workflow({
  action: "create_team",
  name: "My Custom Team",
  skills: ["backend", "frontend", "devops"],
  lead: "backend",
  communication: "pipeline"
})

// Create workflow from natural language
spawner_workflow({
  action: "create_workflow",
  description: "First design the API, then build backend and frontend in parallel, finally deploy"
})

// Check skill availability before starting
spawner_workflow({
  action: "check_skills",
  skills: ["backend", "frontend", "nonexistent-skill"]
})

// List active workflows
spawner_workflow({ action: "list_active" })

// Resume a saved workflow
spawner_workflow({
  action: "resume",
  state_id: "wf_feature-build_1234567890"
})

// Run quality gate validation
spawner_workflow({
  action: "check_gate",
  validator: "code-review",
  criteria: ["no_critical", "tests_pass"],
  outputs: { code: "...", tests_passed: true },
  on_fail: "retry"
})
```

---

## State Contracts

Contracts ensure skills receive required data during handoffs.

### Contract Definition (in collaboration.yaml)

```yaml
receives_from:
  - skill: backend
    context: "API ready for frontend integration"
    receives:
      - API endpoints
      - Authentication flow
      - Data models
    provides: Integrated frontend application

delegation_triggers:
  - trigger: "deployment|hosting|infrastructure"
    delegate_to: devops
    pattern: sequential
    handoff_data:
      - Built application
      - Environment requirements
      - Domain configuration
```

### Contract Validation

```typescript
const { package, validation } = await createHandoffPackage(
  env,
  "backend",
  "frontend",
  { api_endpoints: [...], auth_flow: "jwt" },
  "API integration handoff"
);

if (!validation.valid) {
  console.log("Missing:", validation.missing_fields);
  console.log("Warnings:", validation.warnings);
}
```

---

## Event System

Events notify the terminal about orchestration progress.

### Event Types

| Event | Description | Data |
|-------|-------------|------|
| `workflow:start` | Workflow began | name, mode, total_steps |
| `workflow:step` | Step executing | step_index, skill, inputs |
| `workflow:complete` | Workflow finished | total_duration_ms, steps_completed |
| `workflow:error` | Error occurred | step, error, recoverable |
| `workflow:gate` | Quality gate check | step, validator, passed |
| `team:activate` | Team activated | team_id, lead, members |
| `contract:check` | Contract validated | from, to, valid, missing |

### Event Format

Events are embedded in tool output as markers:

```
[SPAWNER_EVENT]{"type":"team:activate","timestamp":1234567890,"data":{...}}[/SPAWNER_EVENT]
```

### Parsing Events

```typescript
import { parseEvents } from './orchestration/events.js';

const events = parseEvents(toolOutput);
// Returns array of WorkflowEvent objects
```

---

## Usage Examples

### Example 1: Game Jam Workflow

```typescript
// 1. Start with brainstorm
const brainstorm = await spawner_orchestrate_brainstorm({
  action: "start",
  goal: "Build a puzzle game for a 48-hour game jam"
});
// Answers: complexity=medium, dependencies=linear, quality=ship_fast, speed=hours

// 2. Get recommendation
// Result: Sequential pattern, game-jam team

// 3. Activate team
const team = await spawner_workflow({
  action: "start_team",
  team_id: "game-jam"
});
// Team activated with prompt-to-game as lead

// 4. Work through skills in order
// - Load prompt-to-game skill
// - Generate game code
// - Load ai-game-art-generation
// - Generate sprites and textures
// - Load devops
// - Deploy to itch.io
```

### Example 2: Security Audit with Quality Gates

```typescript
// 1. Start supervised workflow
const workflow = await spawner_workflow({
  action: "start_workflow",
  workflow_id: "security-audit"
});

// 2. First step: security-owasp generates vulnerability report
// 3. Quality gate: llm-security-audit reviews
// 4. If issues found: retry with fixes
// 5. If passed: workflow complete
```

### Example 3: Full Stack Build

```typescript
// 1. Activate full-stack team
await spawner_workflow({
  action: "start_team",
  team_id: "full-stack-build",
  initial_state: {
    project_name: "My SaaS App",
    requirements: ["auth", "payments", "dashboard"]
  }
});

// 2. System designer creates architecture
// 3. Backend builds API (with contract for frontend)
// 4. Frontend builds UI (receives API contract)
// 5. DevOps deploys
// 6. Testing validates
```

---

## Quality Gate Enforcement

Quality gates validate step outputs before allowing workflow progression.

### How Quality Gates Work

1. **After a step completes**, the gate's validator skill is loaded
2. **Validator's validations.yaml patterns** are run against outputs
3. **Criteria are checked** against output data
4. **Based on result and `on_fail` setting:**
   - `retry`: Re-run the step with feedback (up to `max_iterations`)
   - `block`: Stop workflow, require manual intervention
   - `warn`: Log warning but continue

### Built-in Criteria

| Criterion | What It Checks |
|-----------|----------------|
| `no_critical` | No critical-severity validation errors |
| `no_high` | No critical or error-severity validation errors |
| `tests_pass` | `outputs.tests_passed === true` or `outputs.test_status === 'passed'` |
| `no_warnings` | Zero validation errors of any severity |
| `has_tests` | `outputs.tests` or `outputs.test_files` is defined |
| `has_docs` | `outputs.documentation` or `outputs.docs` is defined |
| `<custom_key>` | Check if `outputs[key]` is truthy |

### Quality Gate Result

```typescript
interface QualityGateResult {
  passed: boolean;
  validator_skill: string;
  criteria_checked: Array<{
    criterion: string;
    passed: boolean;
    details?: string;
  }>;
  validation_errors: Array<{
    validation_id: string;
    severity: 'critical' | 'error' | 'warning';
    message: string;
    matched_pattern?: string;
  }>;
  iteration: number;
  max_iterations: number;
  action: 'continue' | 'retry' | 'block' | 'warn';
  feedback: string;
}
```

### Example Quality Gate Check

```typescript
// Run quality gate manually
const result = await spawner_workflow({
  action: "check_gate",
  validator: "security-owasp",
  criteria: ["no_critical", "no_high"],
  outputs: {
    code: `
      function login(user, pass) {
        const query = "SELECT * FROM users WHERE name='" + user + "'";
        // SQL injection vulnerability!
      }
    `
  },
  on_fail: "block"
});

// Result:
// {
//   passed: false,
//   validation_errors: [{ severity: "critical", message: "SQL injection vulnerability" }],
//   action: "block",
//   feedback: "❌ Quality Gate FAILED\n..."
// }
```

---

## State Persistence

Workflows and teams can be saved and resumed across sessions.

### Database Schema

```sql
-- Workflow state (D1)
CREATE TABLE workflow_state (
  id TEXT PRIMARY KEY,
  workflow_id TEXT NOT NULL,
  workflow_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  current_step INTEGER NOT NULL DEFAULT 0,
  total_steps INTEGER NOT NULL,
  state_data TEXT,    -- JSON blob
  history TEXT,       -- JSON array of step results
  started_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  completed_at INTEGER,
  error TEXT,
  user_id TEXT
);

-- Team state (D1)
CREATE TABLE team_state (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  team_name TEXT NOT NULL,
  current_lead TEXT NOT NULL,
  members TEXT NOT NULL,         -- JSON array
  state_data TEXT,               -- JSON blob
  communication_log TEXT,        -- JSON array
  started_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  user_id TEXT
);
```

### Persistence Actions

```typescript
// List active workflows
const active = await spawner_workflow({ action: "list_active" });
// Returns: { count: 2, workflows: [...] }

// Resume a workflow
const resumed = await spawner_workflow({
  action: "resume",
  state_id: "wf_feature-build_1234567890"
});
// Returns: state, current_step, next_skill
```

### Auto-Save Behavior

- Workflows are auto-saved when started via `start_workflow`
- Teams are auto-saved when activated via `start_team`
- State is updated on each step completion
- Completed/failed workflows remain in database for reference

---

## Extending the System

### Adding a New Team

1. Edit `src/orchestration/teams.ts`:

```typescript
export const BUILTIN_TEAMS: Record<string, SkillTeam> = {
  // ... existing teams
  'my-new-team': {
    id: 'my-new-team',
    name: 'My New Team',
    description: 'What this team does',
    skills: ['skill-a', 'skill-b', 'skill-c'],
    lead: 'skill-a',
    communication: 'hub-spoke',
    workflow_mode: 'sequential',
    triggers: ['trigger phrase 1', 'trigger phrase 2'],
    use_cases: ['Use case 1', 'Use case 2']
  }
};
```

### Adding a New Workflow

1. Edit `src/orchestration/workflow.ts`:

```typescript
export const BUILTIN_WORKFLOWS: Record<string, WorkflowDefinition> = {
  // ... existing workflows
  'my-new-workflow': {
    id: 'my-new-workflow',
    name: 'My New Workflow',
    description: 'What this workflow does',
    mode: 'sequential',
    steps: [
      { skill: 'step-1', outputs: ['output_a'] },
      { skill: 'step-2', inputs: ['output_a'], outputs: ['output_b'] },
      {
        skill: 'step-3',
        inputs: ['output_b'],
        quality_gate: {
          validator: 'validator-skill',
          criteria: ['criterion_1', 'criterion_2'],
          on_fail: 'retry',
          max_iterations: 3
        }
      }
    ]
  }
};
```

### Adding New Questions to Brainstorm

1. Edit `src/tools/orchestrate-brainstorm.ts`:

```typescript
const QUESTIONS: Record<string, BrainstormQuestion> = {
  // ... existing questions
  'my_question': {
    id: 'my_question',
    question: 'What is your question?',
    why: 'Why this matters for pattern selection',
    options: [
      { value: 'option_a', label: 'Option A', description: '...', implies: ['pattern1'] },
      { value: 'option_b', label: 'Option B', description: '...', implies: ['pattern2'] }
    ]
  }
};
```

---

## Roadmap

### Implemented

- [x] Workflow engine with 4 execution modes
- [x] 7 pre-built teams
- [x] 4 built-in workflows
- [x] Interactive orchestration brainstorm
- [x] Contract validation for handoffs
- [x] Event emission system
- [x] Team activation with skill loading
- [x] Pattern explanation
- [x] Auto-detection in spawner_orchestrate
- [x] Dynamic team creation (`create_team` action)
- [x] Workflow state persistence (D1)
- [x] Contextual sharp edges during workflow
- [x] Natural language workflow definition (`create_workflow` action)
- [x] Skill availability validation (`check_skills` action)
- [x] Quality gate enforcement (`check_gate` action)
- [x] Workflow checkpoints & resume (`list_active`, `resume` actions)

### Planned

- [ ] Skill performance analytics
- [ ] Auto-retry with alternative skills
- [ ] Progress tracking terminal UI
- [ ] Multi-user team coordination
- [ ] Cost/token estimation

---

## Troubleshooting

### Team won't activate

1. Check skill exists: `spawner_skills({ action: "get", name: "skill-id" })`
2. Verify team ID: `spawner_workflow({ action: "list_teams" })`
3. Check for typos in team_id

### Workflow stuck

1. Check current state
2. Verify inputs are available for current step
3. Check if quality gate is blocking

### Contract validation fails

1. Review required fields in collaboration.yaml
2. Ensure all required data is in handoff package
3. Check for naming mismatches

### Events not showing

1. Verify event markers in output: `[SPAWNER_EVENT]...[/SPAWNER_EVENT]`
2. Check terminal parser is running
3. Ensure events are being emitted (check tool response)

---

## API Reference

See TypeScript types in:
- `src/orchestration/workflow.ts` - WorkflowDefinition, WorkflowStep, WorkflowState, QualityGateResult
- `src/orchestration/teams.ts` - SkillTeam, TeamMember, ActiveTeam
- `src/orchestration/contracts.ts` - StateContract, HandoffPackage, ContractValidation
- `src/orchestration/events.ts` - WorkflowEvent, event emitters
- `src/orchestration/persistence.ts` - PersistedWorkflowState, PersistedTeamState, save/load functions

---

*Last updated: 2025-12-31*
