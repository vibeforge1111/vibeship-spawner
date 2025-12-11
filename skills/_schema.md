# VibeShip Orchestrator - Shared Schema

> All skills MUST read this file first to understand state management.

**Version:** 2.0.0 - "Claude on Nitro"

---

## The Four Pillars

This schema implements the vibeship-spawner "Claude on Nitro" system:

1. **Smarter Discovery** - Usefulness Framework before tech decisions
2. **Specialized Agents** - 3-layer specialist architecture
3. **Guardrails System** - Verify before marking done
4. **Escape Hatch Intelligence** - Detect stuck, offer alternatives, reset clean

---

## state.json

The central state file tracking project phase, decisions, and context.

```json
{
  "project_name": "string",
  "phase": "discovery" | "planning" | "building" | "review",
  "current_skill": "string | null",
  "checkpoint": "string | null",  // format: "{skill}:{task}:{status}"

  "confidence": {
    "ready": "boolean",           // true when OK to start building
    "gaps": ["string"]            // what's still unclear
  },

  "assumptions": [
    {
      "id": "string",
      "text": "string",
      "confirmed": "boolean"
    }
  ],

  "decisions": [
    {
      "question": "string",
      "answer": "string",
      "by": "user" | "planner",
      "reason": "string"
    }
  ],

  "mcps": {
    "required": ["string"],
    "available": ["string"],
    "missing": ["string"]
  }
}
```

### Phase Definitions

| Phase | Description |
|-------|-------------|
| `discovery` | Gathering requirements, asking questions |
| `planning` | Generating PRD, architecture, task breakdown |
| `building` | Executing tasks via skills |
| `review` | Summarizing, getting feedback, iterating |

---

## task_queue.json

The task execution queue with dependencies and status.

```json
{
  "tasks": [
    {
      "id": "string",           // "t1", "t2", etc.
      "title": "string",
      "skill": "string",        // must match skill id in registry
      "status": "pending" | "in-progress" | "completed" | "blocked",
      "depends_on": ["string"], // task ids that must complete first
      "outputs": ["string"],    // files created
      "blockers": ["string"]    // why stuck, if blocked
    }
  ]
}
```

### Task Status Flow

```
pending --> in-progress --> completed
                |
                +--> blocked (with blockers array populated)
```

---

## Reading State Protocol

At the start of ANY task:

1. Read `state.json` for current phase and context
2. Read `task_queue.json` for your assigned task
3. Verify all `depends_on` tasks are `completed`
4. If dependencies incomplete, return `blocked` status

---

## Writing State Protocol

After completing ANY task:

1. Update task status in `task_queue.json`
2. Add created files to `task.outputs`
3. Update `checkpoint` in `state.json`
4. If blocked, populate `task.blockers` and set `status: "blocked"`

---

## Handoff Protocol

When completing a task, skills MUST:

1. **Update task_queue.json:**
   ```json
   {
     "status": "completed",
     "outputs": ["/src/file1.ts", "/src/file2.ts"]
   }
   ```

2. **Update state.json:**
   ```json
   {
     "checkpoint": "{skill}:{task_id}:completed"
   }
   ```

3. **Log to docs/PROJECT_LOG.md:**
   ```
   ## [Timestamp]

   Completed: {task title}
   Outputs: {list of files}
   Decisions: {any decisions made}
   ```

4. **Return control to planner** - DO NOT start next task

---

## Status Indicators

When logging or displaying status, use these prefixes:

| Symbol | Meaning |
|--------|---------|
| `>` | Active/processing |
| `+` | Completed successfully |
| `!` | Warning |
| `*` | Escalation to human |
| `x` | Error/failed |

---

## Color Semantics (for UI/logging)

| Color | Meaning |
|-------|---------|
| Green (#2ECC71) | AI active, success, agent working |
| Teal (#00C49A) | Primary accent, available |
| Orange (#FFB020) | Warning, pending, human involved |
| Red (#FF4D4D) | Error, critical, escalation |

---

## File Conventions

| Type | Pattern |
|------|---------|
| State files | `state.json`, `task_queue.json` |
| Documentation | `docs/*.md` |
| Skills | `skills/*.md` |
| Project log | `docs/PROJECT_LOG.md` |

---

## Guardrails System

### Three Levels of Verification

Every skill MUST implement guardrail checks before marking tasks complete.

#### Level 1: Task Guardrails
*Before marking ANY task complete*

```json
{
  "guardrails": {
    "level1": {
      "code_runs": false,        // Did it execute without errors?
      "matches_request": false,  // Does it do what was asked?
      "files_exist": false       // Are created files present and non-empty?
    }
  }
}
```

#### Level 2: Architecture Guardrails
*Checked by Integration specialists*

```json
{
  "guardrails": {
    "level2": {
      "follows_architecture": false,  // Matches ARCHITECTURE.md patterns?
      "data_flows_correct": false,    // Data goes where it should?
      "boundaries_respected": false,  // No client/server violations?
      "auth_applied": false           // Permissions checked where needed?
    }
  }
}
```

#### Level 3: Production Guardrails
*Before "ready to ship" call*

```json
{
  "guardrails": {
    "level3": {
      "not_client_only": false,    // Needs backend where appropriate?
      "env_vars_handled": false,   // No hardcoded secrets?
      "errors_handled": false,     // Graceful failure paths?
      "multi_user_safe": false,    // Works beyond localhost/single user?
      "security_basics": false     // No OWASP top 10 issues?
    }
  }
}
```

### The "Not Done" Response Pattern

When a guardrail fails, respond with:

```
Guardrail: {Level Name}

Issue found: {What failed}
Problem: {Why it matters}

Options:
1. [Recommended] {Fix approach}
2. {Alternative approach}
3. Explain more - help me understand the tradeoffs

Which direction?
```

---

## Escape Hatch Intelligence

### Detecting "Stuck" Behavior

Track these signals in `state.json`:

```json
{
  "escape_hatch": {
    "retry_count": 0,           // Same task attempted
    "error_ping_pong": [],      // [{"fix": "A broke B"}, {"fix": "B broke A"}]
    "complexity_growth": 0,     // Lines added without resolution
    "time_multiplier": 1.0      // Time vs similar tasks
  }
}
```

#### Trigger Conditions

| Signal | Threshold |
|--------|-----------|
| `retry_count` | >= 3 |
| `error_ping_pong` | >= 2 cycles |
| `complexity_growth` | > 100 lines without passing tests |
| `time_multiplier` | > 5x similar tasks |

### Escape Hatch Flow

When triggered:

1. **Admit the struggle**
   ```
   I'm noticing we're going in circles on this {issue}.
   Let me step back.
   ```

2. **Explain why it's hard**
   ```
   What's happening:
   - {Root cause 1}
   - {Root cause 2}
   - We've tried {N} approaches, each has tradeoffs
   ```

3. **Offer real alternatives** (not variations of broken approach)
   ```
   Options from here:

   1. [Simpler] {Approach}
      - {Benefit}
      - Tradeoff: {Cost}

   2. [Different approach] {Approach}
      - {Benefit}
      - Tradeoff: {Cost}

   3. [Service/Library] {External solution}
      - {Benefit}
      - Tradeoff: {Cost}

   Which direction feels right?
   ```

4. **Recommend reset**
   ```
   I recommend starting fresh with your choice rather than
   patching current code - it's gotten tangled. OK to reset?
   ```

5. **User confirms** - Always ask before resetting

6. **Execute reset**
   ```bash
   # Git revert touched files to last known good state
   git checkout HEAD -- {files}
   ```

7. **Build fresh** with chosen alternative

---

## Specialist Architecture

### Three Layers of Specialists

```
┌─────────────────────────────────────────────────────────────┐
│                    PLANNER (Orchestrator)                   │
│         Assesses task → Assembles squad → Coordinates       │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   LAYER 1     │    │   LAYER 2     │    │   LAYER 3     │
│    Core       │    │  Integration  │    │   Pattern     │
│ Specialists   │    │  Specialists  │    │  Specialists  │
└───────────────┘    └───────────────┘    └───────────────┘
```

### Specialist Skill Schema

Each specialist skill file MUST include:

```markdown
# {Specialist Name}

## Identity
- **Layer**: 1 | 2 | 3 | standalone
- **Domain**: {What this specialist owns}
- **Triggers**: {When to load this specialist}

## Patterns
{The RIGHT way to do things with code examples}

## Anti-patterns
{Common mistakes to catch and correct}

## Gotchas
{Non-obvious issues that will bite you}

## Checkpoints
{Verification steps before marking done}

## Escape Hatches
{When to bail and try different approach}

## Squad Dependencies
{Other specialists often needed alongside}
```

### Squad Assembly

The planner assembles squads based on task requirements:

```json
{
  "squad": {
    "lead": "auth-flow",              // Primary specialist for the feature
    "support": [
      "supabase-backend",             // Supporting specialists
      "nextjs-supabase-auth"
    ],
    "on_call": ["security-audit"]     // Available if needed
  }
}
```

### Specialist Selection

Match feature requirements to specialist tags. Each specialist has tags in their Identity section:

```markdown
## Identity
- **Tags**: `auth`, `login`, `signup`, `oauth`
- **Domain**: Login, signup, password reset
- **Use when**: Auth features, protected routes
```

Example matching:
- User needs "payments" → find specialists with `payments`, `stripe` tags
- User needs "auth" → find specialists with `auth`, `login`, `session` tags

---

## Skill Level Adaptation

Skills MUST adapt guidance based on user skill level:

```json
{
  "skill_level": "vibe-coder" | "builder" | "developer" | "expert"
}
```

| Level | Guidance Style |
|-------|---------------|
| `vibe-coder` | Maximum - explain everything, make all tech decisions |
| `builder` | Moderate - explain key decisions, let them make some choices |
| `developer` | Low - skip explanations, offer options, trust judgment |
| `expert` | Minimal - maximum output, challenge bad decisions |

---

## Discovery Session Schema

Before building, capture usefulness insights:

```json
{
  "discovery": {
    "who": "string",           // WHO has this problem?
    "problem": "string",       // WHAT's broken about current solutions?
    "edge": "string",          // WHY would they switch to yours?
    "minimum": "string",       // WHAT's the minimum to prove that value?
    "is_creative": false       // Skip usefulness for creative/fun projects
  }
}
```

The planner should reference these insights when:
- Prioritizing features (does it serve the "who"?)
- Making tradeoffs (does it strengthen the "edge"?)
- Cutting scope (is it part of the "minimum"?)
