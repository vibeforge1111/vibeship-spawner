# CLAUDE.md - VibeShip Spawner Development Context

> Read this first when working on the Spawner MCP server

## Documentation

| Doc | Purpose |
|-----|---------|
| `docs/V2/PRD.md` | Product requirements - what and why |
| `docs/V2/ARCHITECTURE.md` | Technical architecture - how it works |
| `docs/V2/SKILL_CREATION_GUIDE.md` | Skill creation guide - building skills |
| `docs/V2/ROADMAP.md` | Build plan - week by week tasks |
| `docs/TUTORIAL.md` | Getting started guide |

## What Is Spawner?

Spawner is an MCP server that transforms Claude into a specialized product-building system. It adds capabilities Claude doesn't have by default:

1. **Project Memory** - Remembers your project across sessions (decisions, issues, progress)
2. **Guardrails** - Actually catches code issues (security, patterns, production readiness)
3. **Sharp Edges** - Knows gotchas Claude doesn't know (versioned, situation-matched)
4. **Escape Hatches** - Detects when you're stuck and offers alternatives
5. **Skill System** - 35+ specialist skills in YAML format
6. **Skill Level Detection** - Adapts guidance to user experience level

## Tech Stack

- **Runtime:** Cloudflare Workers
- **Database:** Cloudflare D1 (SQLite)
- **Cache/Skills:** Cloudflare KV
- **Protocol:** MCP (Model Context Protocol)
- **Language:** TypeScript
- **Validation:** Zod

## Project Structure

```
vibeship-spawner/
├── spawner-v2/              # MCP Server (Cloudflare Worker) - ACTIVE CODE
│   ├── src/
│   │   ├── index.ts         # Main worker, MCP routing
│   │   ├── types.ts         # Type definitions
│   │   ├── tools/           # MCP tool implementations (9 tools)
│   │   ├── validation/      # Code checking (regex + AST)
│   │   ├── skills/          # Skill loading and matching
│   │   ├── telemetry/       # Event tracking
│   │   └── db/              # D1 database operations
│   ├── skills/              # 35+ Skills (YAML format)
│   └── migrations/          # D1 schema
├── benchmarks/              # Skill benchmark system
├── catalogs/                # Agent and MCP catalogs
├── docs/
│   ├── V2/                  # Active documentation
│   └── archive/             # Historical docs
├── archive/                 # Archived code
│   ├── workers-v1/          # Original monolithic worker
│   ├── v1-skills/           # V1 markdown skills
│   └── v1-scripts/          # V1 skill finder script
├── mcp-registry.json        # MCP tool/template registry
└── web/                     # Web UI (SvelteKit)
```

## Key Concepts

### Skill System

**V2 Skills (YAML)** - The primary skill format:
- Stored in `spawner-v2/skills/` by category (development/, frameworks/, marketing/, etc.)
- Each skill has: `skill.yaml`, `sharp-edges.yaml`, `validations.yaml`
- Optional markdown files for deep-dive content
- Loaded to KV as `v2:index` and `skill:{id}`
- Include: structured validations, sharp edges with detection patterns

**35+ skills** across categories: frameworks, development, design, marketing, strategy, product, communications

### Squads

Pre-configured skill combinations for common tasks:
- `auth-complete` - Full authentication implementation
- `payments-complete` - Stripe/payments integration
- `crud-feature` - Database CRUD operations

Use: `spawner_skills({ action: "squad", squad: "auth-complete" })`

### Skill Levels

The system detects user experience level and adapts guidance:
- **vibe-coder** - Non-technical, needs maximum guidance
- **builder** - Some tech knowledge, learning
- **developer** - Technical, familiar with patterns
- **expert** - Senior developer, strong opinions

Detection uses pattern matching on user phrases (e.g., "I don't know code", "let's use", "in my experience").

### Project Templates

Available templates with pre-configured stack, skills, and agents:

| Template | Use Case | Stack |
|----------|----------|-------|
| `saas` | Subscription products | Next.js, Supabase, Stripe, Tailwind |
| `marketplace` | Buy/sell platforms | Next.js, Supabase, Stripe, Algolia |
| `ai-app` | LLM-powered apps | Next.js, Supabase, OpenAI |
| `web3` | Blockchain apps | Next.js, wagmi, viem |
| `tool` | CLIs and utilities | TypeScript, Node |

### Sharp Edges

Specific gotchas Claude doesn't know by default - the real moat.
Each edge has: severity, situation, why, fix, detection pattern.

### Guardrails

Machine-runnable checks that catch issues:
- **Security:** Hardcoded secrets, injection vulnerabilities
- **Patterns:** Async client components, server imports in client
- **Production:** Missing 'use server' directives, env validation

### Stack Detection

`spawner_analyze` detects technologies from:
- File existence (next.config.js, wrangler.toml)
- Package.json dependencies
- Code patterns (imports, API usage)

Detected categories: framework, database, auth, payments, styling, ai, web3, testing, api, deployment

## MCP Tools (9 total)

| Tool | Purpose |
|------|---------|
| `spawner_plan` | Plan and create projects (discover → recommend → create) |
| `spawner_analyze` | Analyze existing codebase for stack/skill recommendations |
| `spawner_load` | Load project context and skills for session |
| `spawner_validate` | Run guardrail checks on code |
| `spawner_remember` | Save decisions, issues, and session progress |
| `spawner_watch_out` | Query gotchas for your current situation |
| `spawner_unstick` | Get help when stuck on a problem |
| `spawner_templates` | List available project templates |
| `spawner_skills` | Search, list, get skills and squads |

**Production endpoint:** https://mcp.vibeship.co

## Environment Variables

```toml
# wrangler.toml
[vars]
ENVIRONMENT = "development" | "production"

[[d1_databases]]
binding = "DB"

[[kv_namespaces]]
binding = "SKILLS"
binding = "SHARP_EDGES"
binding = "CACHE"
```

## Development Commands

```bash
# Start local dev (from spawner-v2/)
cd spawner-v2
npm install
wrangler dev

# Deploy
wrangler deploy

# Run D1 migrations
wrangler d1 execute spawner-db --file=./migrations/001_initial.sql

# Upload skills to KV
node scripts/upload-skills.js
```

## Code Style

- TypeScript strict mode
- Zod for input validation on all tools
- Explicit error handling (try/catch on all async)
- No console.log in production
- Comments for non-obvious logic only

## Testing With Claude Desktop

1. Run `wrangler dev` in spawner-v2/
2. Add to Claude Desktop config:
```json
{
  "mcpServers": {
    "spawner": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "http://localhost:8787/mcp"]
    }
  }
}
```
3. Restart Claude Desktop
4. Test tools in conversation

## Common Tasks

### Adding a New Skill

1. Choose category folder in `spawner-v2/skills/` (development/, frameworks/, marketing/, etc.)
2. Create skill folder with kebab-case name
3. Add required files:
   - `skill.yaml` - identity, patterns, anti-patterns, handoffs
   - `sharp-edges.yaml` - gotchas with detection patterns (8-12)
   - `validations.yaml` - automated code checks (8-12)
4. Optional: Add `.md` files for deeper prose content
5. Run upload script: `node scripts/upload-skills.js`

See `docs/V2/SKILL_CREATION_GUIDE.md` for full guide.

### Adding a New Check

1. Add check definition to relevant skill's `validations/checks.yaml`
2. If new check type, implement in `src/validation/checks/`
3. Register in validation runner
4. Test with real code that should fail

### Adding a New Sharp Edge

1. Add to skill's `sharp-edges.yaml`
2. Include: id, summary, severity, situation, why, solution, detection_pattern
3. Run upload script to update KV

## Debugging

### MCP Tool Not Responding
- Check wrangler logs: `wrangler tail`
- Verify tool registered in `src/index.ts`
- Check input validation (Zod schema)

### D1 Query Failing
- Test query directly: `wrangler d1 execute spawner-db --command="..."`
- Check binding name in wrangler.toml
- Verify migration ran

### KV Not Loading
- Check namespace binding
- Verify upload script ran
- Check key format matches loader

## Architecture Decisions

### Why D1 for Projects?
Relational data (projects → sessions → decisions) fits SQL.
D1 is cheap, fast, and co-located with Workers.

### Why KV for Skills?
Skills are read-heavy, rarely updated.
KV is optimized for this access pattern.

### Why Not Full AST for All Checks?
ts-morph is powerful but slow.
Regex catches 80% of issues with 10% of complexity.
Use AST only when regex can't express the check.

### Why Cloudflare?
- Edge runtime (fast cold starts for MCP)
- D1 + KV in one platform
- Generous free tier
- Workers AI available if needed later

## What Not To Do

- Don't add checks that Claude already catches consistently
- Don't create skills for things Claude knows well by default
- Don't store actual user code (privacy, storage costs)
- Don't add complexity without proven user need
- Don't skip telemetry (it's how we learn)

## The Differentiation Test

Before adding any feature, ask:
> "Would Claude alone do this? If yes, cut it. If no, ship it."

## Questions?

If something isn't clear, check the docs first:
1. `docs/V2/PRD.md` for "what" and "why"
2. `docs/V2/ARCHITECTURE.md` for "how"
3. `docs/V2/SKILL_CREATION_GUIDE.md` for skills specifically
4. `docs/V2/ROADMAP.md` for priorities

If still unclear, that's a docs gap - fix it when you figure it out.
