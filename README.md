# VibeShip Spawner

> **"You vibe. It ships."**

Transform Claude into a specialist that actually knows your stack's gotchas, remembers your project decisions, and catches issues before they become problems.

---

## Why Spawner?

**Claude is brilliant, but it doesn't know what it doesn't know.**

| Problem | How Spawner Fixes It |
|---------|---------------------|
| Claude forgets your project between sessions | **Project Memory** - decisions, issues, and progress persist |
| Claude suggests patterns that break in production | **Sharp Edges** - 2,000+ gotchas from real-world failures |
| Claude misses security issues in code | **Guardrails** - automated checks catch vulnerabilities |
| Claude gives generic advice | **273 Specialist Skills** - deep expertise in specific domains |
| Claude doesn't know when to hand off | **Skill Collaboration** - knows when another skill should take over |

### The Differentiation

Most AI coding tools give you a generalist. Spawner gives you a **team of specialists** that:

- Know the specific gotchas for Next.js 14, Supabase RLS, Stripe webhooks
- Remember that you chose Drizzle over Prisma and why
- Catch the `'use server'` directive you forgot
- Hand off authentication work to the auth-specialist when needed

---

## Quick Start

### 1. Add Spawner to Claude

**Claude Code (CLI):**

```bash
claude mcp add --transport http spawner https://mcp.vibeship.co/mcp
```

**Claude Desktop:**

Add to your MCP configuration (`claude_desktop_config.json`):

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

### 2. Install Skills (One Command)

```bash
npx vibeship-spawner-skills install
```

This installs **273 specialist skills** to `~/.spawner/skills/`. Zero cost, works offline.

### 3. Start Building

```
You: I want to build a marketplace for digital art

Claude: [Detects your skill level, asks 2-3 questions, recommends stack]
        I recommend the marketplace template with Next.js, Supabase, and Stripe...
```

---

## How It Works

### Loading a Skill

Tell Claude to read a skill when you need specialist knowledge:

```
You: Read ~/.spawner/skills/development/backend/skill.yaml

Claude: [Now has deep backend expertise, patterns, anti-patterns, and gotchas]
```

### Quick Skill Commands

| Need | Command |
|------|---------|
| Backend API | `Read ~/.spawner/skills/development/backend/skill.yaml` |
| Authentication | `Read ~/.spawner/skills/development/auth-specialist/skill.yaml` |
| Database | `Read ~/.spawner/skills/data/postgres-wizard/skill.yaml` |
| Frontend | `Read ~/.spawner/skills/development/frontend/skill.yaml` |
| AI/LLM | `Read ~/.spawner/skills/ai/llm-architect/skill.yaml` |

### Using MCP Tools

| Tool | When to Use |
|------|-------------|
| `spawner_orchestrate` | Start of any session - auto-detects context |
| `spawner_analyze` | Analyze existing codebase |
| `spawner_validate` | Check code for issues |
| `spawner_watch_out` | Get gotchas for your current stack |
| `spawner_unstick` | When you've been stuck for 30+ minutes |
| `spawner_remember` | Save important decisions |

---

## Updating Skills

Skills are updated regularly with new gotchas and patterns.

```bash
npx vibeship-spawner-skills update
```

Or manually:
```bash
cd ~/.spawner/skills && git pull
```

---

## Why YAML Skills?

### The Problem with Prompts

Traditional prompt libraries are:
- **Monolithic** - one giant prompt tries to do everything
- **Stale** - no versioning, no updates
- **Generic** - not tailored to specific technologies

### Our Approach: Structured YAML

Each skill has **4 focused files**:

```
postgres-wizard/
├── skill.yaml           # Identity, patterns, what it owns
├── sharp-edges.yaml     # Specific gotchas (not generic advice)
├── validations.yaml     # Machine-checkable rules
└── collaboration.yaml   # When to hand off to other skills
```

**Why this works:**
- **Modular** - load only what you need
- **Versionable** - track changes over time
- **Specific** - each gotcha has detection patterns
- **Collaborative** - skills know their boundaries

### Why 25 Categories?

We organize by **domain expertise**, not file type:

```
~/.spawner/skills/
├── development/     # 57 skills - the builders
├── data/            # 10 skills - database specialists
├── ai/              # 12 skills - ML/LLM experts
├── marketing/       # 33 skills - growth & content
├── strategy/        # 15 skills - business thinking
└── ...              # 20 more categories
```

This mirrors how **real teams work** - you don't ask a frontend dev about database indexing.

---

## Skills Directory

### Development (57 skills)
Building software, from backend to deployment.

| Skill | What It Knows |
|-------|---------------|
| `backend` | API design, server patterns, error handling |
| `frontend` | React patterns, state management, performance |
| `api-designer` | REST/GraphQL design, versioning, documentation |
| `auth-specialist` | OAuth, JWT, session management, security |
| `devops` | CI/CD, deployment, infrastructure |
| `security` | OWASP, vulnerability prevention, hardening |
| `test-architect` | Testing strategies, coverage, mocking |
| `docker-specialist` | Containerization, compose, optimization |
| `kubernetes-deployment` | K8s patterns, scaling, monitoring |
| `mcp-developer` | Building MCP servers and tools |
| `prompt-engineer` | LLM prompting, chain-of-thought, evaluation |
| `rag-engineer` | Retrieval augmented generation, embeddings |
| `realtime-engineer` | WebSockets, SSE, live updates |
| `performance-hunter` | Profiling, optimization, bottlenecks |
| `migration-specialist` | Database migrations, zero-downtime |
| `...and 42 more` | |

### Data (10 skills)
Databases, caching, and data pipelines.

| Skill | What It Knows |
|-------|---------------|
| `postgres-wizard` | Query optimization, indexing, RLS |
| `redis-specialist` | Caching patterns, pub/sub, sessions |
| `vector-specialist` | Embeddings, similarity search, pgvector |
| `graph-engineer` | Neo4j, graph modeling, traversals |
| `drizzle-orm` | Schema design, migrations, type safety |
| `temporal-craftsman` | Workflow orchestration, durable execution |
| `pg-boss` | Job queues, background processing |
| `graphile-worker` | PostgreSQL job queues |
| `data-engineer` | ETL, pipelines, data quality |
| `database-schema-design` | Normalization, relationships, indexes |

### AI & ML (24 skills)
Machine learning, LLMs, and AI applications.

| Skill | What It Knows |
|-------|---------------|
| `llm-architect` | Model selection, prompting, fine-tuning |
| `llm-fine-tuning` | LoRA, PEFT, training data |
| `ml-memory` | Vector stores, context management |
| `computer-vision-deep` | CNNs, object detection, segmentation |
| `nlp-advanced` | Transformers, NER, sentiment |
| `distributed-training` | Multi-GPU, DeepSpeed, FSDP |
| `model-optimization` | Quantization, pruning, ONNX |
| `ai-safety-alignment` | RLHF, red-teaming, guardrails |
| `multimodal-ai` | Vision-language models, CLIP |
| `semantic-search` | Embeddings, reranking, hybrid search |
| `...and 14 more` | |

### Agents (10 skills)
Autonomous systems and automation.

| Skill | What It Knows |
|-------|---------------|
| `autonomous-agents` | Agent loops, tool use, planning |
| `multi-agent-orchestration` | Agent coordination, handoffs |
| `browser-automation` | Playwright, scraping, testing |
| `computer-use-agents` | Screen interaction, GUI automation |
| `voice-agents` | Speech-to-text, TTS, voice UX |
| `workflow-automation` | n8n, Zapier, custom workflows |
| `agent-memory-systems` | Long-term memory, retrieval |
| `agent-tool-builder` | Tool design, function calling |
| `agent-evaluation` | Benchmarking, evals, metrics |
| `zapier-make-patterns` | No-code automation patterns |

### Marketing (33 skills)
Content, growth, and creative production.

| Skill | What It Knows |
|-------|---------------|
| `copywriting` | Headlines, CTAs, conversion copy |
| `seo` | Technical SEO, content optimization |
| `content-strategy` | Editorial calendars, audience research |
| `ai-video-generation` | Runway, Pika, video workflows |
| `ai-image-generation` | Midjourney, DALL-E, Flux prompts |
| `viral-marketing` | Hooks, distribution, shareability |
| `brand-storytelling` | Narrative, voice, positioning |
| `...and 26 more` | |

### Integration (8 skills)
Connecting services and APIs.

| Skill | What It Knows |
|-------|---------------|
| `stripe-integration` | Payments, subscriptions, webhooks |
| `email-systems` | Transactional, marketing, deliverability |
| `bullmq-specialist` | Redis queues, job processing |
| `inngest` | Event-driven functions, workflows |
| `trigger-dev` | Background jobs, scheduling |
| `upstash-qstash` | Serverless messaging, rate limiting |
| `nextjs-supabase-auth` | Auth integration patterns |
| `vercel-deployment` | Edge functions, ISR, analytics |

### Integrations (14 skills)
Platform-specific expertise.

| Skill | What It Knows |
|-------|---------------|
| `aws-serverless` | Lambda, API Gateway, DynamoDB |
| `gcp-cloud-run` | Cloud Run, Pub/Sub, Firestore |
| `azure-functions` | Azure Functions, Cosmos DB |
| `discord-bot-architect` | Discord.js, slash commands, bots |
| `slack-bot-builder` | Slack API, Block Kit, workflows |
| `twilio-communications` | SMS, voice, WhatsApp |
| `shopify-apps` | Shopify API, Liquid, embedded apps |
| `...and 7 more` | |

### Frameworks (6 skills)
Framework-specific patterns and gotchas.

| Skill | What It Knows |
|-------|---------------|
| `nextjs-app-router` | App Router, RSC, Server Actions |
| `react-patterns` | Hooks, state, performance |
| `sveltekit` | SvelteKit routing, SSR, forms |
| `supabase-backend` | Auth, RLS, Edge Functions |
| `tailwind-ui` | Utility-first CSS, components |
| `typescript-strict` | Type safety, generics, inference |

### Finance (6 skills)
Trading, DeFi, and fintech.

| Skill | What It Knows |
|-------|---------------|
| `algorithmic-trading` | Backtesting, execution, risk |
| `blockchain-defi` | Smart contracts, AMMs, yield |
| `derivatives-pricing` | Options, Greeks, Monte Carlo |
| `fintech-integration` | Plaid, payment rails, KYC |
| `portfolio-optimization` | Mean-variance, factor models |
| `risk-modeling` | VaR, stress testing, limits |

### Mind (10 skills)
Thinking frameworks and problem-solving.

| Skill | What It Knows |
|-------|---------------|
| `debugging-master` | Root cause analysis, systematic debugging |
| `system-designer` | Architecture, trade-offs, scaling |
| `decision-maker` | Framework for technical decisions |
| `refactoring-guide` | Safe refactoring patterns |
| `tech-debt-manager` | Prioritization, payoff strategies |
| `incident-responder` | On-call, postmortems, recovery |
| `performance-thinker` | Optimization mindset |
| `code-quality` | Maintainability, readability |
| `test-strategist` | What to test, coverage strategy |
| `technical-writer` | Documentation, ADRs, RFCs |

### Mind-V5 (22 skills)
Enhanced memory-enabled versions of core skills.

These are upgraded versions of popular skills with deeper context awareness and memory integration.

### Additional Categories

| Category | Count | Focus |
|----------|-------|-------|
| Strategy | 15 | Product strategy, growth, positioning |
| Enterprise | 6 | Compliance, governance, architecture |
| Legal | 5 | GDPR, contracts, patents |
| Space | 5 | Orbital mechanics, mission planning |
| Biotech | 6 | Genomics, drug discovery, lab automation |
| Hardware | 6 | Embedded, FPGA, robotics |
| Climate | 5 | Carbon accounting, sustainability |
| Simulation | 5 | Monte Carlo, digital twin, physics |
| Science | 4 | Experimental design, statistics |
| Communications | 5 | Developer relations, crisis comms |
| Startup | 3 | YC playbook, founder mode |
| Design | 4 | UI, UX, branding |
| Product | 4 | A/B testing, analytics, PM |

---

## Creating Skills

Want to add a skill? We have a pipeline that creates world-class skills:

```
spawner_skill_research → spawner_skill_new → spawner_skill_score
```

Skills must score **80+** on our 100-point rubric to ship.

See [SKILL_CREATION_GUIDE.md](docs/SKILL_CREATION_GUIDE.md) for details.

---

## Project Structure

```
vibeship-spawner/
├── spawner-v2/              # MCP Server (Cloudflare Worker)
│   ├── src/                 # TypeScript source
│   └── skills/              # 273 skills (synced)
├── docs/                    # Documentation
│   ├── ARCHITECTURE.md      # How it works
│   ├── SKILL_CREATION_GUIDE.md
│   └── SKILL_SYNC.md        # Keeping repos aligned
├── scripts/                 # Automation
│   ├── sync-skills.js       # Sync skills between repos
│   └── generate-skills-json.js
└── web/                     # Website (SvelteKit)
```

**Skills repo:** [vibeship-spawner-skills](https://github.com/vibeforge1111/vibeship-spawner-skills)

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Runtime | Cloudflare Workers |
| Database | Cloudflare D1 (SQLite) |
| Cache | Cloudflare KV |
| Skills | Local YAML files (zero API cost) |
| Protocol | MCP (Model Context Protocol) |
| Language | TypeScript + Zod |

---

## Development

```bash
# Clone and install
git clone https://github.com/vibeforge1111/vibeship-spawner
cd vibeship-spawner/spawner-v2
npm install

# Run locally
wrangler dev

# Deploy
wrangler deploy
```

---

## Documentation

| Doc | Purpose |
|-----|---------|
| [Tutorial](docs/TUTORIAL.md) | Getting started |
| [Architecture](docs/ARCHITECTURE.md) | How it works |
| [Skill Creation](docs/SKILL_CREATION_GUIDE.md) | Building skills |
| [Skill Sync](docs/SKILL_SYNC.md) | Keeping repos aligned |

---

## License

Apache 2.0

---

<p align="center">
  <strong>Built with VibeShip</strong><br>
  "You vibe. It ships."
</p>
