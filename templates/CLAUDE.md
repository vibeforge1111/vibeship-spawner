# {project_name}

## VibeShip Orchestrator

This project uses VibeShip Orchestrator for AI-powered development orchestration.

> "You vibe. It ships."

---

### On Session Start

ALWAYS do this first:

1. Read `state.json` - check current phase
2. Based on phase:
   - `discovery` -> Load `skills/planner.md`, continue discovery
   - `planning` -> Load `skills/planner.md`, continue architecture
   - `building` -> Read `task_queue.json`, load skill for next pending task
   - `review` -> Show summary, ask for feedback
3. Resume from checkpoint if set

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

### Current State

```
Phase: {phase}
Skill: {current_skill}
Checkpoint: {checkpoint}
```

---

### Status Indicators

| Symbol | Meaning |
|--------|---------|
| `>` | Active/processing |
| `+` | Completed |
| `!` | Warning |
| `*` | Needs human input |
| `x` | Error |
