# Spawner V2 Documentation

> Everything you need to build Spawner V2

## Quick Start

1. **Read first:** `CLAUDE.md` - Project context for Claude Code
2. **Understand the product:** `PRD.md` - What we're building and why
3. **Understand the tech:** `ARCHITECTURE.md` - How it all fits together
4. **Build skills:** `SKILL_SPEC.md` - How to create great skills
5. **Start building:** `ROADMAP.md` - Week by week tasks

## Document Index

| Document | Purpose | Read When |
|----------|---------|-----------|
| `CLAUDE.md` | Context for Claude Code | Starting any session |
| `PRD.md` | Product requirements | Understanding what to build |
| `ARCHITECTURE.md` | Technical architecture | Implementing features |
| `SKILL_SPEC.md` | Skill creation guide | Building or improving skills |
| `ROADMAP.md` | Prioritized task list | Planning work |
| `skills/core/nextjs-app-router/SKILL_EXAMPLE.md` | Reference skill | Creating new skills |

## The Vision

**Spawner transforms Claude from a generic assistant into a product-building machine.**

It adds four things Claude doesn't have:
1. **Memory** - Remembers your project across sessions
2. **Catches** - Actually runs code checks, not just suggests them
3. **Expertise** - Knows sharp edges and gotchas Claude doesn't
4. **Escape Hatches** - Detects when you're stuck and helps you out

## The Stack

- **Runtime:** Cloudflare Workers
- **Database:** Cloudflare D1
- **Cache:** Cloudflare KV
- **Protocol:** MCP

## The Timeline

| Week | Focus |
|------|-------|
| 1-2 | Infrastructure (D1, KV, basic MCP) |
| 3-4 | Intelligence (Skills, Validation) |
| 5-6 | Experience (Memory, Moments) |
| 7-8 | Polish (Telemetry, Dogfooding) |

## Key Principles

1. **Start simple** - Layer 1 skill is useful, don't wait for perfection
2. **Differentiate** - Only build what Claude can't do alone
3. **Learn fast** - Telemetry tells you what to improve
4. **Dogfood** - Build Spawner with Spawner

## Getting Started

```bash
# Clone and setup
cd spawner-v2
npm install

# Start local dev
wrangler dev

# Feed docs to Claude Code
# Copy CLAUDE.md content to your project's context
```

## File Tree After Setup

```
spawner-v2/
├── docs/
│   ├── CLAUDE.md           # ← You are here
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── SKILL_SPEC.md
│   └── ROADMAP.md
├── src/
│   ├── index.ts
│   ├── tools/
│   ├── validation/
│   ├── skills/
│   └── telemetry/
├── skills/
│   ├── core/
│   ├── integration/
│   └── pattern/
├── migrations/
└── wrangler.toml
```

---

*Let's build something special.*
