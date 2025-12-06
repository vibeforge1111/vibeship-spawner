# VibeShip CLI

> Scaffold projects from your VibeShip stack config

## Installation

```bash
npm install -g vibeship
```

Or use directly with npx:

```bash
npx vibeship init <gist-id>
```

## Usage

### Initialize a project from a Gist

```bash
npx vibeship init abc123def456
```

This will:
1. Fetch your config from GitHub Gist
2. Create a project directory
3. Scaffold all files (CLAUDE.md, skills, state, etc.)
4. You're ready to run `claude`

### Initialize from a local config file

```bash
npx vibeship init --local ./my-config.json
```

### Check your environment

```bash
npx vibeship doctor
```

This checks for:
- Node.js >= 18
- Claude Code CLI
- Git

## Config Format

The gist should contain a `vibeship-config.json` file:

```json
{
  "project_name": "my-app",
  "description": "My awesome app",
  "agents": ["planner", "frontend", "backend"],
  "mcps": ["filesystem", "supabase"],
  "behaviors": {
    "mandatory": ["verify-before-complete", "secure-code"],
    "selected": ["tdd-mode"]
  }
}
```

## What Gets Scaffolded

```
my-app/
├── CLAUDE.md           # Project bootloader
├── state.json          # Current phase and decisions
├── task_queue.json     # Task breakdown
├── docs/
│   ├── PRD.md          # Product requirements template
│   └── ARCHITECTURE.md # Architecture template
├── skills/
│   ├── _schema.md      # Skill protocols
│   ├── planner.md      # Orchestrator skill
│   └── [agents].md     # Skills for each agent
└── .claude/
    └── settings.json   # Claude settings
```

## License

MIT
