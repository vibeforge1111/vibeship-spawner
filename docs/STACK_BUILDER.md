# VibeShip Stack Builder

> Build your stack like building a character in a game.

---

## Core Concept

Think of it like a character builder in a video game, but for your project. You're assembling your **crew** of AI agents and giving them **superpowers** (MCPs).

---

## The Experience Flow

```
Landing --> Describe Idea --> Pick Template (or custom) --> Customize Stack --> Generate --> Build
```

---

## How It Works

### 1. Describe Your Idea

Just type what you want to build:

```
> I want to build a marketplace for vintage watches
```

Or pick a starting point:

| Template | Best For |
|----------|----------|
| SaaS | Subscription products, dashboards |
| Game | Phaser, Unity WebGL, game jams |
| Mobile | React Native, PWAs |
| Web3 | Smart contracts, dApps |
| AI App | LLM integrations, agents |
| Data | Pipelines, analytics |
| Tool | CLIs, utilities |
| Other | Custom stack |

### 2. Quick Discovery (if needed)

If your input is vague, quick questions appear:

```
Who's this for?
  - Just me (side project)
  - Real users (needs to be solid)
  - Enterprise (needs to scale)

Core transaction?
  - Buy/sell with payments
  - Listings only (connect buyers/sellers)
  - Auctions
```

Max 3-4 questions. Skip anytime for smart defaults.

### 3. Build Your Crew

This is the fun part. Visual, tactile, game-like.

```
YOUR CREW                           AVAILABLE AGENTS
---------                           ----------------

+-------------------+               +-------------------+
| PLANNER           |               | PAYMENTS          | [+]
| Orchestrates      |               | Stripe, subs      |
| Always included   |               +-------------------+
+-------------------+
        |                           +-------------------+
        v                           | EMAIL             | [+]
+-------------------+               | Resend, templates |
| FRONTEND          |               +-------------------+
| Next.js + Tailwind|
| + browser-tools   |               +-------------------+
+-------------------+               | SEARCH            | [+]
        |                           | Algolia, filters  |
        v                           +-------------------+
+-------------------+
| BACKEND           |               AVAILABLE MCPS
| Supabase + Auth   |               --------------
| + supabase MCP    |
+-------------------+               +-------------------+
        |                           | browser-tools     | [+]
        v                           | Visual testing    |
+-------------------+               +-------------------+
| PAYMENTS          |
| Stripe            |               +-------------------+
| + stripe MCP      |               | supabase          | [+]
+-------------------+               | Auth, DB, storage |
                                    +-------------------+

Stack: 4 agents + 3 MCPs
Est. build: ~2 hours
```

### 4. Generate & Build

Your stack becomes:
- `docs/PRD.md` - Requirements
- `docs/ARCHITECTURE.md` - Technical decisions
- `task_queue.json` - Ordered tasks
- Skills loaded and ready

---

## Stack Components

### Agents (Skills)

Agents are specialized AI personas that handle specific domains:

| Agent | Expertise | Triggers |
|-------|-----------|----------|
| Planner | Orchestration, discovery | plan, start, new, idea |
| Frontend | React, Next.js, Tailwind | ui, component, page |
| Backend | APIs, auth, server logic | api, endpoint, auth |
| Database | Schemas, migrations | schema, sql, postgres |
| Testing | Unit, E2E, coverage | test, spec, coverage |
| DevOps | CI/CD, deployment | deploy, docker, ci |
| Payments | Stripe, subscriptions | stripe, checkout, billing |
| Email | Transactional, templates | email, resend, sendgrid |
| Search | Full-text, filters | search, algolia |
| AI | LLM integration | ai, llm, embeddings |

### MCPs (Superpowers)

MCPs give agents real-world capabilities:

| MCP | Category | What It Does |
|-----|----------|--------------|
| filesystem | Core | Read/write project files |
| git | Core | Version control |
| supabase | Database | Direct DB access |
| postgres | Database | SQL queries |
| browser-tools | Testing | Visual testing |
| stripe | Payments | Payment APIs |
| resend | Email | Send emails |
| puppeteer | Browser | Web automation |
| anthropic | AI | Claude API access |

---

## Stack Templates

Pre-configured stacks for common project types:

### SaaS Starter
```
Agents: planner, frontend, backend, database, testing
MCPs: filesystem, supabase, stripe
Features: Auth, dashboard, billing, settings
```

### Marketplace
```
Agents: planner, frontend, backend, database, payments, search
MCPs: filesystem, supabase, stripe, algolia
Features: Listings, search, checkout, user profiles
```

### AI App
```
Agents: planner, frontend, backend, database, ai
MCPs: filesystem, supabase, anthropic
Features: Chat interface, embeddings, conversation history
```

### Web3 dApp
```
Agents: planner, frontend, smart-contracts, testing
MCPs: filesystem, foundry
Features: Wallet connect, contract interaction, transactions
```

### Mobile PWA
```
Agents: planner, frontend, backend, database, devops
MCPs: filesystem, supabase
Features: Offline support, push notifications, app shell
```

---

## Customizing Your Stack

### Adding an Agent

```
You: Add payments to my stack

Planner: Adding Payments agent.
Required MCP: stripe
Recommended: Also add email for receipts?

[Add both] [Just payments] [Cancel]
```

### Removing an Agent

```
You: Remove testing for now

Planner: Removed Testing agent.
Note: You can add it back anytime with 'add testing'
```

### Swapping MCPs

```
You: Use postgres instead of supabase

Planner: Switching database MCP.
This affects: Database agent, Backend agent
Proceeding? [Yes] [No]
```

---

## Agent Details

When you click on an agent, you see:

```
+-------------------------------------------+
|  PAYMENTS                                 |
|                                           |
|  Handles all payment flows, subscriptions,|
|  and financial transactions.              |
|                                           |
|  CAPABILITIES                             |
|  - Stripe integration                     |
|  - Subscription management                |
|  - Webhook handling                       |
|  - Checkout flows                         |
|  - Invoice generation                     |
|                                           |
|  REQUIRES                                 |
|  + stripe MCP                             |
|                                           |
|  WORKS WELL WITH                          |
|  [Email] [Analytics] [Notifications]      |
|                                           |
+-------------------------------------------+
```

---

## MCP Browser

Search and discover MCPs:

```
+-------------------------------------------+
|  Search MCPs...                           |
+-------------------------------------------+

CATEGORIES
[All] [Database] [APIs] [Browser] [AI] [Mail]

+----------------+ +----------------+ +----------------+
| supabase       | | postgres       | | mongodb        |
|                | |                | |                |
| Auth, DB,      | | Direct SQL     | | Document store |
| storage        | | access         | |                |
|                | |                | |                |
| Used by 1.5k   | | Used by 1.2k   | | Used by 670    |
| [+ Add]        | | [+ Add]        | | [+ Add]        |
+----------------+ +----------------+ +----------------+
```

---

## Stack Summary

Before generating, review your stack:

```
+-------------------------------------------+
|  VINTAGE WATCH MARKETPLACE                |
|  4 agents + 3 MCPs + ~2 hour build        |
|                                           |
|  Planner -> Frontend -> Backend -> Payments|
|     |          |          |          |    |
|     v          v          v          v    |
|  filesystem  browser   supabase   stripe  |
|                                           |
|  EXPORT OPTIONS                           |
|  - Build with Claude (in browser)         |
|  - Push to GitHub (full scaffold)         |
|  - Download ZIP                           |
|                                           |
|            [Edit Stack] [Generate]        |
+-------------------------------------------+
```

---

## Data Models

### Agent Definition

```typescript
interface Agent {
  id: string
  name: string
  icon: string
  shortDescription: string
  fullDescription: string
  capabilities: string[]
  requiredMcps: string[]
  recommendedMcps: string[]
  worksWellWith: string[]
  triggers: string[]
  skillFile: string
  usageCount: number
}
```

### MCP Definition

```typescript
interface MCP {
  id: string
  name: string
  icon: string
  description: string
  category: 'database' | 'api' | 'browser' | 'devtools' | 'ai' | 'mail'
  installCommand: string
  docsUrl: string
  usageCount: number
}
```

### Project Stack

```typescript
interface ProjectStack {
  id: string
  name: string
  description: string
  template: string | null
  agents: string[]
  mcps: string[]
  discoveryAnswers: Record<string, string>
  createdAt: Date
}
```

---

## Status Indicators

| Symbol | Meaning |
|--------|---------|
| `>` | Active/processing |
| `+` | Completed/Added |
| `!` | Warning |
| `*` | Needs input |
| `x` | Error/Removed |

---

## Color Semantics

| Color | Usage |
|-------|-------|
| Green (#2ECC71) | AI active, success, agent working |
| Teal (#00C49A) | Primary accent, available |
| Orange (#FFB020) | Warning, pending, human needed |
| Red (#FF4D4D) | Error, blocked, removed |
| Violet (#9D8CFF) | Analytics, metrics |

---

*You vibe. It ships.*
