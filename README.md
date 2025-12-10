# VibeShip Crew

> "You vibe. It ships."

A file-based crew framework for Claude Code. No backend. No database. Just markdown, JSON, and one shell script.

---

## What It Does

VibeShip Crew transforms Claude Code into an intelligent planning and execution system:

1. **Discovery** - Asks smart questions to understand what you want to build
2. **Stack Builder** - Assemble your crew of agents and MCPs (like a game character builder)
3. **Planning** - Generates PRD, architecture, and task breakdown
4. **Building** - Executes via specialized skill-based agents
5. **Review** - Summarizes, gets feedback, iterates

---

## Quick Start

### Initialize a New Project

```bash
./init.sh my-app
cd my-app
claude
```

### Tell Claude What to Build

```
> I want to build a marketplace for vintage watches
```

Or pick a template:

```
> Use the marketplace template
```

Claude will:
- Offer you a stack of agents + MCPs to customize
- Ask max 5 clarifying questions
- Surface assumptions for confirmation
- Generate PRD and architecture
- Build it skill by skill

---

## The Stack Builder

Think of it like a character builder in a video game. You're assembling your **crew** of AI agents and giving them **superpowers** (MCPs).

### Templates

| Template | Best For | Agents | MCPs |
|----------|----------|--------|------|
| SaaS | Subscription products | planner, frontend, backend, database, testing | supabase, stripe |
| Marketplace | Buy/sell platforms | planner, frontend, backend, database, payments, search | supabase, stripe, algolia |
| AI App | LLM-powered apps | planner, frontend, backend, database, ai | supabase, anthropic |
| Web3 dApp | Blockchain apps | planner, frontend, smart-contracts, testing | git, foundry |
| Mobile PWA | Progressive web apps | planner, frontend, backend, database, devops | supabase |
| Game | Browser games | planner, frontend, testing | browser-tools |
| Tool | CLIs and utilities | planner, backend, testing | git |

### Stack Commands

```
add payments      # Add an agent
remove testing    # Remove an agent
swap postgres for supabase  # Replace an agent
show mcps         # List available MCPs
looks good        # Confirm and continue
```

---

## Project Structure

```
/vibeship-crew
├── templates/
│   ├── CLAUDE.md           # Bootloader (copied to new projects)
│   ├── state.json          # Initial state template
│   ├── task_queue.json     # Empty queue template
│   └── docs/
│       ├── PRD.md          # PRD template
│       └── ARCHITECTURE.md # Architecture template
├── skills/
│   ├── _schema.md          # Shared state schema
│   ├── planner.md          # The brain
│   ├── frontend.md         # React/Next.js/Tailwind
│   ├── backend.md          # APIs/auth/server
│   ├── database.md         # Schema/migrations
│   ├── testing.md          # Unit/E2E tests
│   ├── devops.md           # CI/CD/deployment
│   ├── payments.md         # Stripe/billing
│   ├── email.md            # Transactional email
│   ├── search.md           # Full-text search
│   ├── ai.md               # LLM integration
│   └── smart-contracts.md  # Solidity/Web3
├── catalogs/
│   ├── agents.json         # Full agent catalog
│   └── mcps.json           # Full MCP catalog
├── docs/
│   ├── STACK_BUILDER.md    # Stack builder documentation
│   └── TUTORIAL.md         # Getting started guide
├── registry.json           # Skills + templates registry
├── init.sh                 # Project initializer
└── README.md               # This file
```

---

## Commands

Once in a project, use these commands:

| Command | Action |
|---------|--------|
| `status` | Show current phase, completed tasks, next steps |
| `continue` | Resume from checkpoint |
| `replan` | Go back to planning phase |
| `assumptions` | Show current assumptions, allow edits |
| `skip [task]` | Skip a specific task |
| `pause` | Save state and stop |
| `add [agent]` | Add an agent to your stack |
| `remove [agent]` | Remove an agent from your stack |
| `show mcps` | List available MCPs |

---

## Agents (Skills)

| Agent | Expertise |
|-------|-----------|
| **Planner** | Orchestration, discovery, task decomposition |
| **Frontend** | React, Next.js, Tailwind, components |
| **Backend** | APIs, auth, Node.js, Supabase |
| **Database** | PostgreSQL, schema design, migrations |
| **Testing** | Jest, Playwright, coverage |
| **DevOps** | CI/CD, Docker, deployment |
| **Payments** | Stripe, subscriptions, checkout |
| **Email** | Transactional, templates, notifications |
| **Search** | Algolia, filters, facets |
| **AI** | LLMs, embeddings, chat interfaces |
| **Smart Contracts** | Solidity, Foundry, ERC tokens |

---

## MCPs (Superpowers)

| MCP | Category | Purpose |
|-----|----------|---------|
| `filesystem` | Core | Read/write files |
| `git` | DevTools | Version control |
| `supabase` | Database | Auth + DB + storage |
| `postgres` | Database | Direct SQL access |
| `browser-tools` | Browser | Visual testing |
| `stripe` | API | Payment processing |
| `resend` | Mail | Email sending |
| `algolia` | API | Full-text search |
| `anthropic` | AI | Claude API access |
| `foundry` | DevTools | Smart contract toolkit |

---

## State Files

| File | Purpose |
|------|---------|
| `state.json` | Current phase, decisions, assumptions |
| `task_queue.json` | All tasks and their status |
| `docs/PRD.md` | Generated requirements |
| `docs/ARCHITECTURE.md` | Technical decisions |
| `docs/PROJECT_LOG.md` | Progress narrative |

---

## How It Works

### Phase 1: Discovery

The planner assesses your input:
- **Vague** ("I want an app") -> Full discovery, 5 questions
- **Partial** ("habit tracker") -> Clarification, 2-3 questions
- **Complete** (detailed spec) -> Validation, move to stack builder

### Phase 2: Stack Builder

Assemble your crew:
```
Your Crew:
+ PLANNER (always included)
+ FRONTEND (Next.js + Tailwind)
+ BACKEND (Supabase + Auth)

MCPs:
+ filesystem (core)
+ supabase (database)

Want to add more? [add payments] [add email] [looks good]
```

### Phase 3: Planning

Generates:
- `docs/PRD.md` - Requirements document
- `docs/ARCHITECTURE.md` - Technical decisions
- `task_queue.json` - Atomic, ordered tasks

### Phase 4: Building

Executes tasks via agents:
```
+ Project scaffolded
+ Database schema created
+ Auth flow complete
> Building dashboard UI...
```

### Phase 5: Review

Summarizes what was built, asks for feedback, offers next steps.

---

## Status Indicators

| Symbol | Meaning |
|--------|---------|
| `>` | Active/processing |
| `+` | Completed |
| `!` | Warning |
| `*` | Needs human input |
| `x` | Error |

---

## Design System

VibeShip Orchestrator follows the VibeShip design language:

**Colors:**
- Green (#2ECC71) - AI active, success
- Teal (#00C49A) - Primary accent
- Orange (#FFB020) - Warning, pending
- Red (#FF4D4D) - Error, escalation

**Typography:**
- JetBrains Mono for all output (terminal aesthetic)
- Minimal, functional, no decoration

---

## Requirements

- Claude Code CLI (`claude`)
- Bash shell (macOS, Linux, or Git Bash on Windows)

---

## Learn More

- [Stack Builder Guide](docs/STACK_BUILDER.md)
- [Full Tutorial](docs/TUTORIAL.md)

---

## License

MIT

---

Built with VibeShip. "You vibe. It ships."
