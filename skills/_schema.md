# VibeShip Orchestrator - Shared Schema

> All skills MUST read this file first to understand state management.

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
