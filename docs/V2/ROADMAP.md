# Spawner V2 Roadmap

> From vision to shipped product

## Overview

```
Week 1-2:  Foundation (Infrastructure)
Week 3-4:  Intelligence (Skills + Validation)
Week 5-6:  Experience (Memory + Moments)
Week 7-8:  Polish (Telemetry + Dogfooding)
```

---

## Phase 1: Foundation (Week 1-2)

### Goal
Get the infrastructure running. MCP server with D1/KV persistence.

### Tasks

#### 1.1 Project Setup
```
□ Initialize Cloudflare Worker project
□ Configure wrangler.toml with D1 and KV bindings
□ Set up TypeScript with strict mode
□ Create directory structure (src/tools, src/validation, etc.)
□ Add MCP SDK dependency
```

**Success:** `wrangler dev` runs without errors

#### 1.2 Database Schema
```
□ Create D1 database (spawner-db)
□ Write initial migration (projects, sessions, decisions, issues, telemetry)
□ Run migration locally
□ Test basic CRUD operations
```

**Files:**
- `migrations/001_initial.sql`
- `src/db/projects.ts`
- `src/db/sessions.ts`

**Success:** Can create/read/update projects in D1

#### 1.3 KV Setup
```
□ Create KV namespaces (SKILLS, SHARP_EDGES, CACHE)
□ Write skill loader utility
□ Write cache utilities (get/set with TTL)
□ Upload test skill to KV
```

**Files:**
- `src/skills/loader.ts`
- `src/cache/index.ts`
- `scripts/upload-skills.ts`

**Success:** Can load skill from KV

#### 1.4 Basic MCP Server
```
□ Create main worker entry point
□ Implement tool routing
□ Add basic spawner_load tool (hardcoded response for now)
□ Test with Claude Desktop
```

**Files:**
- `src/index.ts`
- `src/tools/context.ts`

**Success:** Claude Desktop can call spawner_load and get response

#### 1.5 Project Memory (Basic)
```
□ Implement project creation/lookup
□ Store project in D1
□ Cache active project in KV
□ Return project context in spawner_load
```

**Success:** Create project, close Claude, reopen, project is remembered

---

## Phase 2: Intelligence (Week 3-4)

### Goal
Skills with real knowledge. Validation that catches issues.

### Tasks

#### 2.1 Skill Format
```
□ Define skill.yaml schema
□ Create skill parser
□ Load skills from KV on demand
□ Match skills to project stack
```

**Files:**
- `src/skills/schema.ts`
- `src/skills/parser.ts`
- `src/skills/matcher.ts`

**Success:** Given stack ["nextjs", "supabase"], correct skills load

#### 2.2 First Skill: nextjs-app-router
```
□ Create skill.yaml (identity)
□ Write sharp-edges.md (5+ edges)
□ Write patterns.md (3+ patterns)
□ Write anti-patterns.md (3+ anti-patterns)
□ Upload to KV
```

**Files:**
- `skills/core/nextjs-app-router/*`

**Success:** Skill loads and provides context to Claude

#### 2.3 Second Skill: supabase-backend
```
□ Create skill.yaml
□ Write sharp-edges.md (5+ edges)
□ Write patterns.md
□ Write anti-patterns.md
□ Include RLS-specific gotchas
```

**Files:**
- `skills/core/supabase-backend/*`

**Success:** Two skills can load together

#### 2.4 Integration Skill: nextjs-supabase-auth
```
□ Create skill.yaml
□ Focus on auth flow sharp edges
□ Document middleware patterns
□ Include cold start gotcha
```

**Files:**
- `skills/integration/nextjs-supabase-auth/*`

**Success:** Integration skill provides cross-cutting knowledge

#### 2.5 Validation Runner
```
□ Define check schema (regex, AST types)
□ Implement regex check runner
□ Implement basic AST checks (ts-morph)
□ Create spawner_validate tool
```

**Files:**
- `src/validation/runner.ts`
- `src/validation/checks/security.ts`
- `src/validation/checks/patterns.ts`
- `src/tools/validate.ts`

**Success:** spawner_validate catches hardcoded secrets

#### 2.6 Critical Checks
```
□ Hardcoded secrets (regex)
□ Async client components (regex)
□ Server imports in client (regex)
□ Missing 'use server' directive (regex)
```

**Files:**
- `src/validation/checks/*.ts`
- `skills/*/validations/checks.yaml`

**Success:** All 4 checks catch their respective issues

---

## Phase 3: Experience (Week 5-6)

### Goal
Make it feel magical. Memory, saves, and expertise moments.

### Tasks

#### 3.1 Session Summaries
```
□ Create spawner_remember tool
□ Store decisions with reasoning
□ Store session summaries
□ Track open/resolved issues
```

**Files:**
- `src/tools/remember.ts`
- `src/db/decisions.ts`
- `src/db/issues.ts`

**Success:** End session, start new one, get summary of previous work

#### 3.2 Sharp Edges Database
```
□ Define sharp edge schema
□ Create sharp edge loader
□ Implement situation matching
□ Create spawner_watch_out tool
```

**Files:**
- `src/sharp-edges/schema.ts`
- `src/sharp-edges/loader.ts`
- `src/sharp-edges/matcher.ts`
- `src/tools/sharp-edge.ts`

**Success:** "auth redirect flashing" triggers middleware cold start edge

#### 3.3 The Save Moment
```
□ Integrate validation into workflow
□ Design interruption UX
□ Implement fix suggestions
□ Test with real code scenarios
```

**Success:** User generates code with secret, Spawner catches before completion

#### 3.4 The Memory Moment
```
□ Implement session resume flow
□ Generate "picking up where we left off" context
□ Include open issues in resume
□ Cache hot session data
```

**Success:** "Picking up [project]. Last session you were working on [task]."

#### 3.5 Escape Hatch Detection
```
□ Define stuck patterns (retry, circular, complexity growth)
□ Implement attempt tracking
□ Create spawner_unstick tool
□ Generate alternatives
```

**Files:**
- `src/tools/unstick.ts`
- `src/unstick/patterns.ts`
- `src/unstick/alternatives.ts`

**Success:** After 3 similar errors, Spawner offers to step back and suggests alternatives

#### 3.6 Skill Handoffs
```
□ Define handoff triggers in skills
□ Implement handoff context generation
□ Test skill-to-skill transitions
```

**Success:** Auth question in Next.js context triggers handoff to auth skill

---

## Phase 4: Polish (Week 7-8)

### Goal
Learn from usage. Smooth rough edges.

### Tasks

#### 4.1 Telemetry Pipeline
```
□ Define event types
□ Implement emitEvent utility
□ Store events in D1
□ Add telemetry to all tools
```

**Files:**
- `src/telemetry/events.ts`
- `src/telemetry/types.ts`

**Success:** Events recorded for guardrail_block, sharp_edge_surfaced, etc.

#### 4.2 Telemetry Dashboard (Basic)
```
□ Create aggregation queries
□ Build simple stats endpoint
□ Generate weekly summary
```

**Files:**
- `src/telemetry/aggregation.ts`
- `src/api/stats.ts`

**Success:** Can see which checks catch most issues

#### 4.3 More Skills
```
□ tailwind-ui skill
□ typescript-strict skill
□ deployment-vercel skill
```

**Goal:** 5 total skills for launch

#### 4.4 More Sharp Edges
```
□ Add 5+ edges per skill
□ Total 30+ edges across skills
□ Verify version ranges
□ Set expiry dates
```

**Goal:** 30+ sharp edges total

#### 4.5 Dogfooding
```
□ Build real project using Spawner
□ Document pain points
□ Fix critical issues
□ Add missing patterns/edges
```

**Projects:**
- Build a simple SaaS landing page
- Build a dashboard with auth
- Build an API with webhooks

**Success:** Ship 2+ real projects using Spawner

#### 4.6 Documentation
```
□ Installation guide
□ Quick start tutorial
□ Skill creation guide
□ Configuration reference
```

**Files:**
- `docs/installation.md`
- `docs/quickstart.md`
- `docs/creating-skills.md`
- `docs/configuration.md`

---

## Launch Checklist

### Infrastructure
- [ ] D1 database deployed
- [ ] KV namespaces created
- [ ] Worker deployed to production
- [ ] Custom domain configured (optional)

### Skills
- [ ] nextjs-app-router (complete)
- [ ] supabase-backend (complete)
- [ ] nextjs-supabase-auth (complete)
- [ ] tailwind-ui (complete)
- [ ] typescript-strict (complete)

### Validation
- [ ] Hardcoded secrets check
- [ ] Async client component check
- [ ] Server import in client check
- [ ] Missing 'use server' check
- [ ] 10+ total checks

### Sharp Edges
- [ ] 30+ edges documented
- [ ] Version ranges set
- [ ] Expiry dates set
- [ ] Situation matching tested

### Experience
- [ ] Project memory working
- [ ] Session resume working
- [ ] Save moments firing
- [ ] Escape hatch detection working

### Telemetry
- [ ] Events recording
- [ ] Aggregation queries working
- [ ] No PII in events

### Documentation
- [ ] Installation guide
- [ ] Quick start
- [ ] Skill creation guide

### Testing
- [ ] 3+ projects built with Spawner
- [ ] Pain points addressed
- [ ] Core flows tested

---

## Post-Launch (V2.1+)

### Based on Telemetry
- Skills that need improvement (high escape hatch triggers)
- Checks that are too strict (high override rates)
- Missing sharp edges (common errors not caught)

### Community
- Sharp edge submission process
- Skill contribution guidelines
- Feedback collection

### Features
- Custom skill builder
- Team sharing
- IDE integration exploration

---

## Development Commands

```bash
# Local development
wrangler dev

# Deploy to production
wrangler deploy

# Run migrations
wrangler d1 execute spawner-db --file=./migrations/001_initial.sql

# Upload skills to KV
node scripts/upload-skills.js

# View telemetry stats
wrangler d1 execute spawner-db --command="SELECT event_type, COUNT(*) FROM telemetry GROUP BY event_type"
```

---

## Key Files Quick Reference

| Purpose | File |
|---------|------|
| Main entry | `src/index.ts` |
| Context tool | `src/tools/context.ts` |
| Validate tool | `src/tools/validate.ts` |
| Remember tool | `src/tools/remember.ts` |
| Sharp edge tool | `src/tools/sharp-edge.ts` |
| Unstick tool | `src/tools/unstick.ts` |
| Validation runner | `src/validation/runner.ts` |
| Skill loader | `src/skills/loader.ts` |
| Telemetry | `src/telemetry/events.ts` |
| DB schema | `migrations/001_initial.sql` |

---

## Daily Standup Questions

1. What did I ship yesterday?
2. What's blocking me?
3. What will I ship today?
4. Did I use Spawner to build Spawner? (dogfooding)

---

*Let's build something special.*
