# CLAUDE.md - Spawner V2 Development Context

> Read this first when working on Spawner V2

## Documentation

All V2 documentation lives in `/docs/v2/`:

| Doc | Purpose |
|-----|---------|
| `docs/v2/PRD.md` | Product requirements - what and why |
| `docs/v2/ARCHITECTURE.md` | Technical architecture - how it works |
| `docs/v2/SKILL_SPEC.md` | Skill creation guide - building skills |
| `docs/v2/ROADMAP.md` | Build plan - week by week tasks |
| `docs/v2/skills/` | Skill definitions and examples |

Read these when you need deeper context on specific areas.

## What Is Spawner?

Spawner is an MCP server that transforms Claude into a specialized product-building system. It adds capabilities Claude doesn't have by default:

1. **Project Memory** - Remembers your project across sessions
2. **Guardrails** - Actually catches code issues (not just suggests)
3. **Sharp Edges** - Knows gotchas Claude doesn't know
4. **Escape Hatches** - Detects when you're stuck and offers alternatives

## Tech Stack

- **Runtime:** Cloudflare Workers
- **Database:** Cloudflare D1 (SQLite)
- **Cache/Skills:** Cloudflare KV
- **Protocol:** MCP (Model Context Protocol)
- **Language:** TypeScript

## Project Structure

```
spawner-v2/
├── src/
│   ├── index.ts              # Main worker, MCP routing
│   ├── types.ts              # Type definitions
│   ├── tools/                # MCP tool implementations
│   │   ├── context.ts        # spawner_context
│   │   ├── validate.ts       # spawner_validate
│   │   ├── remember.ts       # spawner_remember
│   │   ├── sharp-edge.ts     # spawner_sharp_edge
│   │   └── unstick.ts        # spawner_unstick
│   ├── validation/           # Code checking
│   │   ├── runner.ts         # Runs checks on code
│   │   └── checks/           # Individual checks
│   ├── skills/               # Skill loading and matching
│   ├── telemetry/            # Event tracking
│   └── db/                   # D1 database operations
├── skills/                   # Skill definitions (uploaded to KV)
│   ├── core/
│   ├── integration/
│   └── pattern/
├── migrations/               # D1 schema
└── wrangler.toml            # Cloudflare config
```

## Key Concepts

### Skills
Structured knowledge modules that make Claude expert in specific domains.
Each skill has: identity, sharp edges, patterns, anti-patterns, validations.

Skills are stored in KV and loaded based on project stack.

### Sharp Edges
Specific gotchas Claude doesn't know by default. The real moat.
Each edge has: situation, why it happens, the fix, detection patterns.

### Guardrails
Machine-runnable checks that catch issues. Not suggestions - actual catches.
Types: regex patterns, AST checks (ts-morph), file existence checks.

### Project Memory
D1 stores: project manifest, decisions, session summaries, known issues.
KV caches: hot session data, active project context.

## MCP Tools (9 total)

| Tool | Purpose |
|------|---------|
| `spawner_plan` | Plan and create projects (discover → recommend → create) |
| `spawner_analyze` | Analyze existing codebase for stack/skill recommendations |
| `spawner_context` | Load project + skills for session |
| `spawner_validate` | Run checks on code |
| `spawner_remember` | Save decisions/progress |
| `spawner_sharp_edge` | Query relevant gotchas |
| `spawner_unstick` | Analyze stuck state, offer alternatives |
| `spawner_templates` | List available project templates |
| `spawner_skills` | Search and retrieve skills |

**Production endpoint:** https://mcp.vibeship.co/mcp

## Environment Variables

```
# wrangler.toml
[vars]
ENVIRONMENT = "development" | "production"

# D1 binding
[[d1_databases]]
binding = "DB"

# KV bindings
[[kv_namespaces]]
binding = "SKILLS"
binding = "SHARP_EDGES"
binding = "CACHE"
```

## Development Commands

```bash
# Start local dev
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
- No console.log in production (use proper logging)
- Comments for non-obvious logic only

## Testing With Claude Desktop

1. Run `wrangler dev`
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

1. Create folder in `skills/core/` or `skills/integration/`
2. Add `skill.yaml` with identity
3. Add `sharp-edges.md` with 5+ gotchas
4. Add `patterns.md` and `anti-patterns.md`
5. Run upload script: `node scripts/upload-skills.js`

### Adding a New Check

1. Add check definition to relevant skill's `validations/checks.yaml`
2. If new check type, implement in `src/validation/checks/`
3. Register in validation runner
4. Test with real code that should fail

### Adding a New Sharp Edge

1. Add to skill's `sharp-edges.md`
2. Include: severity, situation, why, fix, detection pattern
3. Update KV with upload script

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

## Reference Docs

- `docs/v2/PRD.md` - Full product requirements
- `docs/v2/SKILL_SPEC.md` - How to build skills
- `docs/v2/ARCHITECTURE.md` - Technical deep dive
- `docs/v2/ROADMAP.md` - What to build when
- `docs/v2/skills/core/nextjs-app-router/` - Example skill

## Questions?

If something isn't clear, check the docs first:
1. `docs/v2/PRD.md` for "what" and "why"
2. `docs/v2/ARCHITECTURE.md` for "how"
3. `docs/v2/SKILL_SPEC.md` for skills specifically
4. `docs/v2/ROADMAP.md` for priorities

If still unclear, that's a docs gap - fix it when you figure it out.
