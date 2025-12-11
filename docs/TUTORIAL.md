# Spawner V2 Tutorial

**From idea to MVP with AI-powered development.**

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

| Tool | When to Use |
|------|-------------|
| `spawner_plan` | Starting a new project |
| `spawner_analyze` | Working with existing code |
| `spawner_context` | Loading project for a session |
| `spawner_validate` | Checking code for issues |
| `spawner_sharp_edge` | Learning gotchas for your stack |
| `spawner_skills` | Finding relevant skills |
| `spawner_templates` | Browsing project templates |
| `spawner_remember` | Saving decisions for later |
| `spawner_unstick` | Getting help when stuck |

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

## Example Workflow

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

---

## Documentation

- `docs/V2/PRD.md` - Product requirements
- `docs/V2/ARCHITECTURE.md` - Technical architecture
- `docs/V2/SKILL_SPEC.md` - Building skills

---

## Troubleshooting

### MCP Not Connecting
1. Verify config in Claude Desktop
2. Check endpoint: https://mcp.vibeship.co
3. Restart Claude Desktop

### Tool Not Found
- Confirm spawner MCP is enabled
- Check tools/list response

---

**Endpoint:** https://mcp.vibeship.co
