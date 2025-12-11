# Spawner V2 - Task Tracker

> Last updated: 2024-12-12

## Phase 1: Foundation ✅ COMPLETE

### 1.1 Project Setup ✅
- [x] Initialize Cloudflare Worker project
- [x] Configure wrangler.toml with D1 and KV bindings
- [x] Set up TypeScript with strict mode
- [x] Create directory structure (src/tools, src/validation, etc.)
- [x] Add MCP SDK dependency

### 1.2 Database Schema ✅
- [x] Create D1 database (spawner-db)
- [x] Write initial migration (projects, sessions, decisions, issues, telemetry)
- [x] Run migration locally
- [x] Test basic CRUD operations

### 1.3 KV Setup ✅
- [x] Create KV namespaces (SKILLS, SHARP_EDGES, CACHE)
- [x] Write skill loader utility
- [x] Write cache utilities (get/set with TTL)
- [x] Upload test skill to KV

### 1.4 Basic MCP Server ✅
- [x] Create main worker entry point
- [x] Implement tool routing
- [x] Add basic spawner_context tool
- [x] Add spawner_validate tool
- [x] Add spawner_remember tool
- [x] Add spawner_sharp_edge tool
- [x] Add spawner_unstick tool

### 1.5 Project Memory (Basic) ✅
- [x] Implement project creation/lookup
- [x] Store project in D1
- [x] Cache active project in KV
- [x] Return project context in spawner_context

---

## Phase 2: Intelligence ✅ COMPLETE

### 2.1 Skill Format ✅
- [x] Define skill.yaml schema (`skills/schema.yaml`)
- [x] Create skill parser (in upload-skills.js)
- [x] Load skills from KV on demand
- [x] Refactored loader.ts for V2 YAML format
- [x] Updated tools to use new loader API

### 2.2 First Skill: nextjs-app-router ✅
- [x] Create skill.yaml (identity, patterns, anti-patterns)
- [x] Write sharp-edges.yaml (9 edges)
- [x] Write validations.yaml (8 checks)
- [x] Upload to KV (script ready)

### 2.3 Second Skill: supabase-backend ✅
- [x] Create skill.yaml
- [x] Write sharp-edges.yaml (10 edges)
- [x] Write validations.yaml (8 checks)
- [x] Include RLS-specific gotchas

### 2.4 Integration Skill: nextjs-supabase-auth ✅
- [x] Create skill.yaml
- [x] Focus on auth flow sharp edges (8 edges)
- [x] Write validations.yaml (8 checks)
- [x] Document middleware patterns

### 2.5 Validation Runner ✅
- [x] Define check schema (regex, AST types)
- [x] Implement regex check runner
- [x] Create spawner_validate tool
- [ ] Implement basic AST checks (ts-morph) - deferred

### 2.6 Critical Checks ✅
- [x] Hardcoded secrets (regex)
- [x] Async client components (regex)
- [x] Server imports in client (regex)
- [x] Missing 'use server' directive (regex)

---

## Phase 3: Experience ✅ COMPLETE

### 3.1 Session Summaries ✅
- [x] Create spawner_remember tool (basic version done)
- [x] Store decisions with reasoning
- [x] Store session summaries
- [x] Track open/resolved issues

### 3.2 Sharp Edges Database ✅
- [x] Define sharp edge schema
- [x] Create sharp edge loader (V2 format)
- [x] Situation/keyword matching implemented
- [x] Create spawner_sharp_edge tool
- [x] Code pattern detection via regex

### 3.3 The Save Moment ✅
- [x] Integrate validation into workflow
- [x] Design interruption UX
- [x] Implement fix suggestions
- [x] Test with real code scenarios

### 3.4 The Memory Moment ✅
- [x] Implement session resume flow
- [x] Generate "picking up where we left off" context
- [x] Include open issues in resume
- [x] Include recent decisions in resume
- [x] Cache hot session data

### 3.5 Escape Hatch Detection ✅
- [x] Define stuck patterns (retry, circular, complexity growth)
- [x] Create spawner_unstick tool (basic version)
- [x] Implement attempt tracking (persisted to KV CACHE)
- [x] Generate alternatives
- [x] Track time stuck

### 3.6 Skill Handoffs 🟡
- [x] Define handoff triggers in skills
- [ ] Implement handoff context generation
- [ ] Test skill-to-skill transitions

---

## Phase 4: Architecture Refactor ✅ COMPLETE

### 4.1 Type System Refactor ✅
- [x] Split monolithic types.ts into domain-specific files
- [x] Created src/types/env.ts (Env bindings)
- [x] Created src/types/db.ts (database row types)
- [x] Created src/types/project.ts (Project-related types)
- [x] Created src/types/session.ts (Session types)
- [x] Created src/types/skill.ts (Skill & Validation types)
- [x] Created src/types/tool-io.ts (Tool input/output types)
- [x] Created src/types/index.ts (barrel export)

### 4.2 Tool Registry Pattern ✅
- [x] Created src/tools/registry.ts
- [x] Centralized tool registration
- [x] Type-safe tool execution
- [x] Clean separation of concerns

### 4.3 New Tools ✅
- [x] Renamed spawner_context → spawner_load
- [x] Renamed spawner_sharp_edge → spawner_watch_out
- [x] Created spawner_plan tool (project planning)
- [x] Created spawner_analyze tool (codebase analysis)
- [x] Created spawner_templates tool (list templates)
- [x] Created spawner_skills tool (unified skill search)
- [x] Created spawner_skill_new tool (skill scaffolding)

### 4.4 Code Cleanup Skill ✅
- [x] Created skills/pattern/code-cleanup/
- [x] Wrote skill.yaml with identity
- [x] Wrote sharp-edges.md (10 gotchas)
- [x] Wrote patterns.md (best practices)
- [x] Wrote anti-patterns.md (common mistakes)

---

## Phase 5: Memory System 🟡 IN PROGRESS

> See: `docs/V2/MEMORY_IMPLEMENTATION_PLAN.md` for full details

### 5.1 Enhanced Schema ⬜ NOT STARTED
- [ ] Create `002_memories.sql` migration
- [ ] Add `SpawnerMemoryType` enum to types
- [ ] Create `src/db/memories.ts` CRUD operations
- [ ] Create `src/db/transcripts.ts` for session transcripts

### 5.2 Memory Types ⬜ NOT STARTED
12 memory types to implement:
- [ ] `project_identity` - What the project IS
- [ ] `architecture_decision` - Technical choices made
- [ ] `tech_stack` - Technologies in use
- [ ] `current_goal` - What we're building now
- [ ] `known_issue` - Problems encountered
- [ ] `resolved_issue` - Fixed problems
- [ ] `guardrail_passed` - Validations that passed
- [ ] `sharp_edge_hit` - Gotchas encountered
- [ ] `session_summary` - What happened in session
- [ ] `breakthrough` - Key learnings
- [ ] `user_preference` - How user likes to work
- [ ] `skill_level` - User's experience level

### 5.3 Tool Enhancements ⬜ NOT STARTED
- [ ] Enhance `spawner_remember` for typed memories
- [ ] Enhance `spawner_load` with session primer
- [ ] Create `spawner_session_end` tool
- [ ] Create `spawner_memory_search` tool (Pro tier)

### 5.4 Session Primer ⬜ NOT STARTED
- [ ] Create `src/memory/primer.ts`
- [ ] Generate context from memories
- [ ] Include last session summary
- [ ] Include current goals and open issues
- [ ] Include relevant sharp edges for stack

### 5.5 AI Curation (Pro Tier) ⬜ NOT STARTED
- [ ] Create `src/memory/curator.ts`
- [ ] Implement Claude-based memory extraction
- [ ] Define curation system prompt
- [ ] Test with real session transcripts

### 5.6 Rule-Based Extraction (Free Tier) ⬜ NOT STARTED
- [ ] Create `src/memory/extractor.ts`
- [ ] Pattern matching for common memory types
- [ ] Decision detection (decided, chose, using)
- [ ] Issue detection (bug, problem, error)
- [ ] Resolution detection (fixed, resolved, solved)

### 5.7 Semantic Search (Pro Tier) ⬜ NOT STARTED
- [ ] Set up Cloudflare Vectorize index
- [ ] Implement embedding generation
- [ ] Add semantic search to `spawner_memory_search`
- [ ] Test search relevance

### 5.8 Monetization Integration ⬜ NOT STARTED
- [ ] Add tier detection system
- [ ] Implement feature gating
- [ ] Add usage tracking
- [ ] Create upgrade prompts

---

## Phase 6: Local Service (Free Tier) ⬜ NOT STARTED

> Separate repo: `vibeship-memory-local`

### 6.1 Python Service Setup
- [ ] Create project structure
- [ ] Set up FastAPI + MCP server
- [ ] Configure pyproject.toml

### 6.2 Local Storage
- [ ] Implement SQLite storage
- [ ] Implement ChromaDB for vectors
- [ ] Set up sentence-transformers

### 6.3 Local Extraction
- [ ] Port rule-based extraction to Python
- [ ] Test with sample sessions

### 6.4 Documentation
- [ ] Installation guide
- [ ] One-line install script
- [ ] Configuration reference

---

## Phase 7: Polish ⬜ NOT STARTED

### 7.1 Telemetry Pipeline
- [x] Define event types
- [x] Implement emitEvent utility
- [x] Store events in D1
- [ ] Add telemetry to all tools

### 7.2 Telemetry Dashboard (Basic)
- [ ] Create aggregation queries
- [ ] Build simple stats endpoint
- [ ] Generate weekly summary

### 7.3 More Skills
- [x] tailwind-ui skill (8 edges, 8 checks)
- [x] typescript-strict skill (8 edges, 8 checks)
- [x] vercel-deployment skill (8 edges, 8 checks)
- [x] react-patterns skill (8 edges, 9 checks)
- [x] code-cleanup skill (10 edges)

### 7.4 Dogfooding
- [ ] Build real project using Spawner
- [ ] Document pain points
- [ ] Fix critical issues
- [ ] Add missing patterns/edges

### 7.5 Documentation
- [ ] Installation guide
- [ ] Quick start tutorial
- [ ] Skill creation guide
- [ ] Configuration reference

---

## Launch Checklist

### Infrastructure ✅
- [x] D1 database deployed to production (a2dae866-9e54-4d49-98a3-1078f089bd9f)
- [x] KV namespaces created in production (SKILLS, SHARP_EDGES, CACHE)
- [x] Worker deployed to production (https://spawner-mcp.spawner.workers.dev)
- [x] Custom domain configured (mcp.vibeship.co)

### Skills (5 required for launch) - 8 DONE!
- [x] nextjs-app-router
- [x] supabase-backend
- [x] nextjs-supabase-auth
- [x] tailwind-ui
- [x] typescript-strict
- [x] react-patterns
- [x] vercel-deployment
- [x] code-cleanup (pattern skill)

### MCP Tools - 10 DONE!
- [x] spawner_load (was: spawner_context)
- [x] spawner_validate
- [x] spawner_remember
- [x] spawner_watch_out (was: spawner_sharp_edge)
- [x] spawner_unstick
- [x] spawner_templates
- [x] spawner_skills
- [x] spawner_plan
- [x] spawner_analyze
- [x] spawner_skill_new

### Validation ✅
- [x] Hardcoded secrets check
- [x] Async client component check
- [x] Server import in client check
- [x] Missing 'use server' check
- [x] 10+ total checks (57 checks done!)

### Sharp Edges ✅
- [x] 59+ edges documented
- [x] 30+ edges total
- [ ] Version ranges verified
- [ ] Expiry dates set where needed

### Experience ✅
- [x] Project memory tested end-to-end
- [x] Session resume working
- [x] Save moments firing (validation tool works)
- [x] Escape hatch detection tested

### Testing
- [x] Test with Claude Desktop locally (curl tests passing)
- [ ] Build 1+ project using Spawner
- [ ] Pain points documented

---

## Summary

| Phase | Status | Progress |
|-------|--------|----------|
| Phase 1: Foundation | ✅ Complete | 100% |
| Phase 2: Intelligence | ✅ Complete | 100% |
| Phase 3: Experience | ✅ Complete | 95% |
| Phase 4: Architecture Refactor | ✅ Complete | 100% |
| Phase 5: Memory System | 🟡 Planning | 5% |
| Phase 6: Local Service | ⬜ Not Started | 0% |
| Phase 7: Polish | 🟡 In Progress | 40% |

### Stats
- **8 Skills:** nextjs-app-router, supabase-backend, nextjs-supabase-auth, tailwind-ui, typescript-strict, react-patterns, vercel-deployment, code-cleanup
- **59+ Sharp Edges:** Gotchas and pitfalls documented
- **57 Validations:** Machine-runnable checks
- **10 MCP Tools:** load, validate, remember, watch_out, unstick, templates, skills, plan, analyze, skill_new

### Recent Updates (2024-12-12)
- ✅ Split types.ts into domain-specific modules
- ✅ Created tool registry pattern
- ✅ Renamed tools for clarity (context→load, sharp_edge→watch_out)
- ✅ Added spawner_plan tool
- ✅ Added spawner_analyze tool
- ✅ Added spawner_templates tool
- ✅ Added spawner_skills tool
- ✅ Added spawner_skill_new tool (was skill_create)
- ✅ Created code-cleanup pattern skill
- ✅ Created MEMORY_IMPLEMENTATION_PLAN.md
- ✅ Defined dual-tier architecture (Free local + Pro cloud)
- ✅ Pushed to GitHub (commit 405264d)

### Previous Updates (2024-12-11)
- ✅ Refactored skill loader for V2 YAML format
- ✅ Updated context.ts and sharp-edge.ts to use new loader API
- ✅ Added Validation interface to types.ts
- ✅ TypeScript compiles cleanly
- ✅ Fixed YAML parsing errors (quoting colons and @ symbols)
- ✅ Uploaded all 7 skills (59 edges, 57 validations) to KV
- ✅ Enhanced session resume with "Picking up where we left off" header
- ✅ Added recent_decisions to context output
- ✅ Implemented attempt tracking in spawner_unstick (persisted to CACHE KV)
- ✅ Track time stuck across multiple unstick calls
- ✅ Ran D1 migrations locally
- ✅ All 5 MCP tools tested and working via curl
- ✅ **DEPLOYED TO PRODUCTION!**
  - D1 database: spawner-db (APAC region)
  - KV namespaces: SKILLS, SHARP_EDGES, CACHE
  - Worker: https://spawner-mcp.spawner.workers.dev/mcp
  - All tools verified working in production

### Next Priority
1. **Memory System Phase 5** - This is the core differentiator
   - Start with `002_memories.sql` migration
   - Add memory types to codebase
   - Enhance spawner_remember and spawner_load
2. Test with Claude Desktop MCP integration
3. Build a real project using Spawner for dogfooding

---

## Business Model

### Free Tier (Local)
- Local Python service (user runs)
- SQLite + ChromaDB storage
- Rule-based memory extraction
- Zero cost to us

### Pro Tier (Cloud)
- Hosted on Cloudflare Workers
- D1 + Vectorize storage
- AI curation (Claude extracts memories)
- Semantic search
- Cross-device sync
- $X/month subscription

### Value Prop
> "AI that remembers your project"

This is what people pay for. Start with memory, not skills.
