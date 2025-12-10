# {{project_name}}

## vibeship orchestrator

This project uses vibeship orchestrator for AI-powered development orchestration.

> "You vibe. It ships."

---

### On Session Start

ALWAYS do this first:

1. Read `state.json` - check current phase, checkpoint, and custom_skills_needed
2. **If this is a fresh project (phase is "planning" and checkpoint.last_task is null):**
   - IMMEDIATELY greet the user with a project summary (see greeting below)
   - Don't wait for user input - speak first!
3. If `custom_skills_needed` has items, generate those skills first (see planner skill)
4. Based on phase:
   - `planning` -> Load `skills/planner.md`, start/continue planning
   - `building` -> Read `task_queue.json`, load skill for next pending task
   - `review` -> Show summary, ask for feedback
5. Resume from checkpoint if set

#### Fresh Project Greeting

When starting a fresh project, greet the user like this:

```
vibeship orchestrator

I've loaded your project config:
  • Project: {{project_name}}
  • Agents: {{agents}}
  • MCPs: {{mcps}}

You're in the planning phase. I'll ask a few questions to understand
your vision, then generate your PRD and architecture.

Ready to start? (or type "skip" to jump straight to building)
```

---

### State Files

| File | Purpose |
|------|---------|
| `state.json` | Current project state (phase, decisions, assumptions) |
| `task_queue.json` | All tasks and their status |
| `docs/PRD.md` | Generated requirements |
| `docs/ARCHITECTURE.md` | Technical decisions |
| `docs/PROJECT_LOG.md` | Progress narrative |

---

### Commands

| Command | Action |
|---------|--------|
| `status` | Show current phase, completed tasks, next steps |
| `continue` | Resume from checkpoint |
| `replan` | Go back to planning phase |
| `assumptions` | Show current assumptions, allow edits |
| `skip [task]` | Skip a specific task |
| `pause` | Save state and stop |

---

### Your Stack

**Agents:** {{agents}}

**MCPs:** {{mcps}}

**Behaviors:**
{{behaviors}}

---

### Status Indicators

| Symbol | Meaning |
|--------|---------|
| `>` | Active/processing |
| `+` | Completed |
| `!` | Warning |
| `*` | Needs human input |
| `x` | Error |
