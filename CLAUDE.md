# CLAUDE.md - VibeShip Spawner Development Context

> Read this first when working on the Spawner MCP server

## Documentation (Single Source of Truth)

| Doc | Purpose |
|-----|---------|
| `docs/PRD.md` | Product requirements - what and why |
| `docs/ARCHITECTURE.md` | Technical architecture - how it works |
| `docs/SKILL_CREATION_GUIDE.md` | How to create world-class skills |
| `docs/SKILL_SPEC_V2.md` | Technical skill YAML format |
| `docs/SKILL_SYNC.md` | Keeping skill repos in sync |
| `docs/SECURITY.md` | Security guidelines |
| `docs/ROADMAP.md` | Build plan and priorities |
| `docs/TUTORIAL.md` | Getting started guide |

**Skills Documentation** (in spawner-skills repo):
| Doc | Purpose |
|-----|---------|
| `GETTING_STARTED.md` | User onboarding |
| `SKILLS_DIRECTORY.md` | Complete skill catalog |
| `SKILLS_ROADMAP.md` | Planned future skills |

## What Is Spawner?

Spawner is an MCP server that transforms Claude into a specialized product-building system:

1. **Project Memory** - Remembers your project across sessions
2. **Guardrails** - Catches code issues (security, patterns, production readiness)
3. **Sharp Edges** - Knows gotchas Claude doesn't know
4. **Skill System** - 273 specialist skills in YAML format
5. **Skill Level Detection** - Adapts guidance to user experience

## Skills

**Install:** `npx vibeship-spawner-skills install`
**Update:** `npx vibeship-spawner-skills update`
**Full guide:** https://github.com/vibeforge1111/vibeship-spawner-skills

### Quick Reference

| Need | Path |
|------|------|
| Backend/API | `development/backend`, `development/api-designer` |
| Frontend/UI | `development/frontend`, `design/ui-design` |
| Database | `data/postgres-wizard`, `data/redis-specialist` |
| AI/LLM | `ai/llm-architect`, `ai/ml-memory` |
| Auth | `development/auth-specialist` |
| Testing | `development/test-architect` |
| DevOps | `development/devops`, `development/infra-architect` |

### Skill Format

Each skill has 4 YAML files:
- `skill.yaml` - Identity, patterns, anti-patterns
- `sharp-edges.yaml` - Gotchas with detection patterns
- `validations.yaml` - Automated code checks
- `collaboration.yaml` - Prerequisites, delegation triggers

## Tech Stack

- **Runtime:** Cloudflare Workers
- **Database:** Cloudflare D1 (SQLite)
- **Cache:** Cloudflare KV
- **Protocol:** MCP (Model Context Protocol)
- **Language:** TypeScript + Zod

## Project Structure

```
vibeship-spawner/
├── spawner-v2/              # MCP Server (Cloudflare Worker)
│   ├── src/
│   │   ├── index.ts         # Main worker, MCP routing
│   │   ├── tools/           # MCP tool implementations
│   │   ├── validation/      # Code checking
│   │   └── skills/          # Skill loading
│   ├── skills/              # 273 Skills (synced from spawner-skills)
│   └── migrations/          # D1 schema
├── docs/                    # All documentation (flat structure)
│   ├── ARCHITECTURE.md
│   ├── PRD.md
│   ├── SKILL_CREATION_GUIDE.md
│   ├── SKILL_SPEC_V2.md
│   ├── SKILL_SYNC.md
│   ├── SECURITY.md
│   ├── ROADMAP.md
│   ├── TUTORIAL.md
│   └── ARCHIVED/            # Historical docs only
├── scripts/
│   ├── sync-skills.js       # Keep spawner-v2/skills in sync
│   └── generate-skills-json.js  # Update website
├── web/                     # Website (SvelteKit)
└── catalogs/                # Agent and MCP catalogs
```

## MCP Tools

| Tool | Purpose |
|------|---------|
| `spawner_orchestrate` | Main entry point - auto-routes |
| `spawner_plan` | Plan and create projects |
| `spawner_analyze` | Analyze codebase for recommendations |
| `spawner_validate` | Run guardrail checks |
| `spawner_remember` | Save decisions and progress |
| `spawner_watch_out` | Query gotchas |
| `spawner_unstick` | Get help when stuck |
| `spawner_skills` | Search and get skills |
| `spawner_skill_new` | Create world-class skills |
| `spawner_skill_score` | Score skill quality |

**Skill Creation Pipeline:** `brainstorm?` → `research` → `new` → `score`

## Development

```bash
# Start local dev
cd spawner-v2 && npm install && wrangler dev

# Deploy
wrangler deploy

# Sync skills from spawner-skills repo
node scripts/sync-skills.js sync

# Regenerate website skills
node scripts/generate-skills-json.js
```

## Keeping Skills in Sync

**Source of truth:** `spawner-skills` repo (github.com/vibeforge1111/vibeship-spawner-skills)

```bash
# Check sync status
node scripts/sync-skills.js check

# Fix sync issues
node scripts/sync-skills.js sync
```

See `docs/SKILL_SYNC.md` for full sync architecture.

## Code Style

- TypeScript strict mode
- Zod for all input validation
- Explicit try/catch on async
- No console.log in production

## Architecture Decisions

| Decision | Reason |
|----------|--------|
| D1 for projects | Relational data fits SQL, cheap, fast |
| Local skills | Zero API cost, works offline |
| Regex before AST | 80% of checks with 10% complexity |
| Cloudflare | Edge runtime, integrated D1+KV |

## The Differentiation Test

Before adding any feature:
> "Would Claude alone do this? If yes, cut it. If no, ship it."

---

**Questions?** Check docs first: `docs/PRD.md` (what), `docs/ARCHITECTURE.md` (how), `docs/SKILL_CREATION_GUIDE.md` (skills).
