# User-Friendly Onboarding Design

> Date: 2025-12-10

## Problem

New users face multiple friction points when trying to use vibeship orchestrator:

1. **npm naming conflict** - `npx vibeship` runs a different published package
2. **Unclear where to run commands** - "Open your terminal" assumes knowledge
3. **Placeholder text** - Instructions say "my-app" instead of their actual project name
4. **Jargon** - `cd my-app` means nothing to non-developers
5. **No auto-start** - After running `claude`, users stare at blank prompt not knowing what to type
6. **Missing prerequisites** - No guidance on Node.js, Claude CLI requirements

## Solution Overview

Two paths, same destination:

- **Website-first** (new users): Visual config → export → one command
- **CLI-first** (experienced): `npx vibeship-orchestrator create` with smart defaults

Both generate the same config, same scaffolded project.

---

## CLI Design

### New Command: `create`

```bash
# Interactive mode (no args)
npx vibeship-orchestrator create

# From gist (existing flow, renamed)
npx vibeship-orchestrator create <gist-id>

# Quick mode with flags
npx vibeship-orchestrator create --template saas --name my-app
```

### Interactive Flow

```
  vibeship orchestrator
  "You vibe. It ships."

? Project name: vintage-watch-marketplace
? Choose a starting point:
  > SaaS - subscription products (planner, frontend, backend, database, testing)
    Marketplace - buy/sell platforms
    AI App - LLM-powered apps
    Web3 dApp - blockchain apps
    Custom - configure in browser

? Your crew: planner, frontend, backend, database, testing
  Add/remove? (enter to continue, or type agent name)

  Pre-flight check:
  ✓ Node.js v20.10.0
  ✓ Claude CLI installed

  Scaffolding project...
  ✓ Created vintage-watch-marketplace/
  ✓ Generated CLAUDE.md, state.json, task_queue.json
  ✓ Copied skills: planner, frontend, backend, database, testing

  Ready! Next steps:
  1. Open vintage-watch-marketplace in your IDE
  2. Open terminal in your IDE (View → Terminal)
  3. Type: claude
  4. Claude will greet you and start building!
```

### Pre-flight Checks

Before scaffolding, check:

1. **Node.js >= 18** - Required for CLI
2. **Claude CLI** - Required to build

If missing, show clear install instructions:

```
  Pre-flight check:
  ✓ Node.js v20.10.0
  ✗ Claude CLI not found

  To install Claude CLI:
    npm install -g @anthropic-ai/claude-code

  Then run this command again.
```

### Doctor Command

Detailed diagnostics for troubleshooting:

```bash
npx vibeship-orchestrator doctor
```

```
  vibeship orchestrator - Environment Check

  Node.js:     ✓ v20.10.0 (requires >= 18)
  npm:         ✓ v10.2.0
  Claude CLI:  ✓ installed (v1.2.3)
  Git:         ✓ installed

  All checks passed!
```

---

## Web Design

### Post-Export Instructions (Summary Page)

Replace current vague instructions with clear, contextual guidance:

```
✓ Ready to Build!

WHERE TO RUN THIS
Open any terminal - this command creates a new folder for you.

  • VS Code/Cursor: View → Terminal (then paste command below)
  • Mac: Open Terminal app
  • Windows: Open PowerShell or Command Prompt

┌─────────────────────────────────────────────────────────────┐
│  npx vibeship-orchestrator create abc123def                 │
│                                                    [Copy]   │
└─────────────────────────────────────────────────────────────┘

This will create a folder called "vintage-watch-marketplace" containing:
  • CLAUDE.md - Your project config
  • 5 agent skills (planner, frontend, backend, database, testing)
  • 3 MCPs configured (filesystem, supabase, stripe)
  • PRD and architecture templates

THEN
  1. Open your IDE (VS Code, Cursor, etc.)
  2. File → Open Folder → select "vintage-watch-marketplace"
     (it's in the folder where you ran the command)
  3. Open terminal in your IDE: View → Terminal
  4. Type `claude` and press Enter
  5. Claude greets you and starts the discovery process!

▸ First time? What you'll need...
  └─ Node.js 18 or higher (download: nodejs.org)
  └─ Claude CLI: npm install -g @anthropic-ai/claude-code
  └─ An Anthropic API key (for Claude CLI)

▸ Using Windows?
  └─ Use PowerShell, Command Prompt, or VS Code's built-in terminal
  └─ All commands work the same way

▸ Something not working?
  └─ Run: npx vibeship-orchestrator doctor
  └─ This checks your environment and shows what's missing
```

**Key principles:**
- Use their actual project name everywhere (no "my-app" placeholders)
- GUI actions (File → Open) instead of terminal commands where possible
- Expandable sections for help, visible but not overwhelming
- Tell them exactly what gets created

---

## CLAUDE.md Design

### Auto-Greet on Fresh Project

When Claude starts in a fresh vibeship project (phase: discovery), it should speak first:

```
vibeship orchestrator

I've loaded your project config:
  • Project: vintage-watch-marketplace
  • Agents: planner, frontend, backend, database, testing
  • MCPs: filesystem, supabase, stripe

You're in the discovery phase. I'll ask a few questions to understand
your vision, then generate your PRD and architecture.

Ready to start? (or type "skip" to jump straight to building)
```

This requires updating the CLAUDE.md template to instruct Claude to auto-greet.

### Updated CLAUDE.md Template

Add to "On Session Start" section:

```markdown
### On Session Start

ALWAYS do this first:

1. Read `state.json` - check current phase
2. **If phase is "discovery" and no checkpoint exists (fresh project):**
   - Greet the user with project summary
   - Show: project name, agents, MCPs from state
   - Explain you're in discovery phase
   - Ask if ready to start (or offer "skip" to jump to building)
3. Based on phase:
   - `discovery` -> Load `skills/planner.md`, continue discovery
   - `planning` -> Load `skills/planner.md`, continue architecture
   - `building` -> Read `task_queue.json`, load skill for next pending task
   - `review` -> Show summary, ask for feedback
4. Resume from checkpoint if set
```

---

## Package Changes

### Rename to `vibeship-orchestrator`

Already done in `cli/package.json`:
- `name`: `vibeship-orchestrator`
- `bin`: `vibeship-orchestrator`

### Command Structure

```
vibeship-orchestrator
├── create [gist-id]     # Create new project (replaces init)
│   ├── --template       # Use template directly
│   ├── --name           # Project name
│   └── --dir            # Target directory
├── doctor               # Environment diagnostics
└── help                 # Usage info
```

Keep `init` as alias for backwards compatibility, but document `create` as primary.

---

## Implementation Tasks

### CLI

1. [ ] Add `create` command with interactive prompts
2. [ ] Add template selection (inquirer/prompts library)
3. [ ] Add agent add/remove flow
4. [ ] Add pre-flight checks (Node version, Claude CLI)
5. [ ] Improve `doctor` command output
6. [ ] Add `--template` and `--name` flags for quick mode
7. [ ] Update success message with clear next steps

### Web

1. [ ] Redesign summary page post-export section
2. [ ] Use actual project name in all instructions
3. [ ] Add expandable help sections
4. [ ] Add OS detection for tailored terminal instructions
5. [ ] Update command from `npx vibeship init` to `npx vibeship-orchestrator create`

### Templates

1. [ ] Update CLAUDE.md with auto-greet instructions
2. [ ] Add fresh project detection logic
3. [ ] Include project summary in greeting

### Documentation

1. [ ] Update README with new commands
2. [ ] Add troubleshooting section
3. [ ] Document both web and CLI flows

---

## Success Criteria

A first-time user should be able to:

1. Visit website → configure stack → export
2. Copy one command, paste in any terminal
3. Open folder in IDE
4. Run `claude`
5. Claude greets them and starts building

No guessing. No jargon. No "what do I type now?"
