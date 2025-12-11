# VibeShip Spawner

> "You vibe. It ships."

An MCP server that transforms Claude into a specialized product-building system with project memory, guardrails, sharp edges, and escape hatches.

---

## What It Does

Spawner adds capabilities Claude doesn't have by default:

1. **Project Memory** - Remembers your project across sessions
2. **Guardrails** - Actually catches code issues (not just suggests)
3. **Sharp Edges** - Knows gotchas Claude doesn't know
4. **Escape Hatches** - Detects when you're stuck and offers alternatives

---

## Quick Start

### 1. Configure Claude Desktop

Add to your Claude Desktop MCP configuration:

```json
{
  "mcpServers": {
    "spawner": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.vibeship.co"]
    }
  }
}
```

Restart Claude Desktop.

### 2. Start Building

Open Claude and describe your idea:

```
You: I want to build a marketplace for selling digital art
```

Spawner automatically:
1. Detects your skill level
2. Asks clarifying questions (max 3)
3. Recommends template, stack, and skills
4. Creates your project when ready

---

## MCP Tools

| Tool | Purpose |
|------|---------|
| `spawner_plan` | Plan and create projects (discover → recommend → create) |
| `spawner_analyze` | Analyze existing codebase for stack/skill recommendations |
| `spawner_load` | Load project context and skills for session |
| `spawner_validate` | Run guardrail checks on code |
| `spawner_remember` | Save decisions and session progress |
| `spawner_watch_out` | Query gotchas for your current situation |
| `spawner_unstick` | Get help when stuck on a problem |
| `spawner_templates` | List available project templates |
| `spawner_skills` | Search and retrieve skills |

**Production endpoint:** https://mcp.vibeship.co

---

## Project Templates

| Template | Use Case | Stack |
|----------|----------|-------|
| `saas` | Subscription products | Next.js, Supabase, Stripe |
| `marketplace` | Buy/sell platforms | Next.js, Supabase, Stripe, Algolia |
| `ai-app` | LLM-powered apps | Next.js, Supabase, OpenAI |
| `web3` | Blockchain apps | Next.js, wagmi, viem |
| `tool` | CLIs and utilities | TypeScript, Node |

---

## Example Workflows

### New Project

```
You: I want to build a SaaS for team task management

Claude: [Uses spawner_plan to understand your needs]
Claude: Based on your idea, I recommend the SaaS template with...
Claude: [Creates project with spawner_plan action="create"]
```

### Existing Project

```
You: Analyze my codebase and suggest improvements

Claude: [Uses spawner_analyze with your package.json and files]
Claude: I detected Next.js + Supabase. Missing auth. Recommend adding...
```

### When Stuck

```
You: I've been trying to fix this auth redirect for hours

Claude: [Uses spawner_unstick]
Claude: Here are 3 alternative approaches...
```

### Watch Out for Gotchas

```
You: What should I watch out for with Supabase RLS?

Claude: [Uses spawner_watch_out]
Claude: Found 3 sharp edges for your stack...
```

---

## Tech Stack

- **Runtime:** Cloudflare Workers
- **Database:** Cloudflare D1 (SQLite)
- **Cache/Skills:** Cloudflare KV
- **Protocol:** MCP (Model Context Protocol)
- **Language:** TypeScript

---

## Project Structure

```
vibeship-spawner/
├── spawner-v2/           # V2 MCP Server (Cloudflare Worker)
│   ├── src/
│   │   ├── index.ts      # Main worker, MCP routing
│   │   ├── tools/        # MCP tool implementations
│   │   ├── validation/   # Code checking
│   │   ├── skills/       # Skill loading
│   │   └── db/           # D1 database operations
│   ├── skills/           # Skill definitions (YAML)
│   └── migrations/       # D1 schema
├── docs/
│   ├── TUTORIAL.md       # Getting started guide
│   └── V2/               # V2 documentation
│       ├── PRD.md        # Product requirements
│       ├── ARCHITECTURE.md
│       ├── SKILL_SPEC.md
│       └── ROADMAP.md
├── skills/               # V1 Skills (markdown)
├── catalogs/             # Agent and MCP catalogs
└── web/                  # Web UI (SvelteKit)
```

---

## Documentation

| Doc | Purpose |
|-----|---------|
| [Tutorial](docs/TUTORIAL.md) | Getting started guide |
| [PRD](docs/V2/PRD.md) | Product requirements |
| [Architecture](docs/V2/ARCHITECTURE.md) | Technical deep dive |
| [Skill Spec](docs/V2/SKILL_SPEC.md) | How to build skills |
| [Roadmap](docs/V2/ROADMAP.md) | What to build when |

---

## Development

### Local Development

```bash
cd spawner-v2
npm install
wrangler dev
```

### Deploy

```bash
wrangler deploy
```

### Test with Claude Desktop

1. Run `wrangler dev`
2. Update MCP config to use `http://localhost:8787/mcp`
3. Restart Claude Desktop

---

## Requirements

- Claude Desktop or Claude Code
- Node.js 18+
- Wrangler CLI (for development)

---

## License

MIT

---

Built with VibeShip. "You vibe. It ships."
