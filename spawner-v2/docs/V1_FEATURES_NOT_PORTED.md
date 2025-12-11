# V1 Features Not Ported to V2

> Tracking document for V1 features that weren't ported to V2, with rationale and future considerations.

Last updated: 2024-12-11

---

## 1. `check_environment` Tool

**What it does (V1):**
- Checks if Node.js >= 18 is installed
- Checks if Claude CLI is installed
- Checks if git is available
- Returns pass/fail status for each

**Why not ported:**
- V2 is cloud-hosted (Cloudflare Workers), not local
- Can't execute shell commands from edge runtime
- Environment checks are client-side concerns

**Where it would be beneficial:**
- Local development setup validation
- Onboarding new developers
- CI/CD pre-flight checks

**Future consideration:**
- Could add a separate local CLI tool for env checks
- Or document requirements in README instead
- Priority: Low

---

## 2. Gist Config Loading

**What it does (V1):**
- Accepts a GitHub Gist ID as input
- Fetches `vibeship-config.json` from the gist
- Uses that config to create project

**Why not ported:**
- Adds complexity for edge case usage
- Most users use templates directly
- Web configurator could be rebuilt differently

**Where it would be beneficial:**
- Sharing project configs between users
- Web-based project configurator
- Team project templates

**Future consideration:**
- Could add `spawner_import` tool that accepts gist/URL
- Or store configs in D1 with shareable IDs
- Priority: Medium (if web configurator is revived)

---

## 3. File Scaffolding (Actual File Creation)

**What it does (V1):**
- Creates actual directories on disk (`mkdir`)
- Writes files: CLAUDE.md, state.json, task_queue.json
- Writes docs/PRD.md, docs/ARCHITECTURE.md
- Creates skill files for each agent

**Why not ported:**
- V2 runs on Cloudflare edge, no filesystem access
- MCP protocol doesn't support file creation remotely
- Would need client-side execution

**Where it would be beneficial:**
- Zero-config project setup
- Consistent project structure
- Pre-populated templates

**Current V2 approach:**
- `spawner_create` returns scaffolding instructions
- Claude Code creates files based on instructions
- D1 tracks project metadata

**Future consideration:**
- Hybrid: V2 returns file contents, client writes them
- Or: Local companion CLI that syncs with V2
- Priority: Medium

---

## 4. MCPs List Per Template

**What it does (V1):**
- Each template has recommended MCPs array
- Example: saas → ['filesystem', 'supabase', 'stripe']
- Tells user which MCP servers to configure

**Why not ported:**
- V2 uses `stack` array instead (technologies)
- MCP configuration is environment-specific
- Less relevant for cloud-hosted MCP

**Where it would be beneficial:**
- Guiding MCP server setup
- Ensuring required integrations are available
- Documentation/onboarding

**Current V2 approach:**
- Stack hints load relevant skills
- Skills mention required integrations
- No explicit MCP recommendations

**Future consideration:**
- Add `recommended_mcps` to template output
- Or create setup guide per template
- Priority: Low

---

## 5. Behaviors System

**What it does (V1):**
- Templates have `behaviors.mandatory` and `behaviors.selected`
- Mandatory: verify-before-complete, follow-architecture, maintainable-code, secure-code
- Selected: tdd-mode, etc.
- Written to project state

**Why not ported:**
- Behaviors are implicit in V2 tools
- `spawner_validate` enforces code quality
- `spawner_sharp_edge` catches security issues

**Where it would be beneficial:**
- Explicit behavior toggles
- Project-specific rules
- Team preferences

**Current V2 approach:**
- Validation checks handle most behaviors
- Sharp edges handle security concerns
- No explicit toggle system

**Future consideration:**
- Add `project_settings` to D1 with behavior flags
- Let `spawner_validate` respect project settings
- Priority: Low

---

## 6. Agent Skill Files (Per-Project)

**What it does (V1):**
- Creates `skills/{agent}.md` for each agent in template
- Pre-populated with agent identity and workflow
- Project-specific skill customization

**Why not ported:**
- V2 skills are centralized in KV
- Skills aren't project-specific (yet)
- Reduces duplication

**Where it would be beneficial:**
- Project-specific skill customization
- Agent identity per project
- Custom workflows

**Current V2 approach:**
- Skills loaded from KV based on stack
- Same skills across all projects
- Customization via project description

**Future consideration:**
- Allow project-level skill overrides in D1
- Store custom instructions per project
- Priority: Medium

---

## 7. Task Queue System

**What it does (V1):**
- Creates `task_queue.json` with task structure
- Tracks: pending, in_progress, completed, blocked
- Persisted to file

**Why not ported:**
- V2 uses D1 sessions/decisions tables
- No explicit task queue in V2
- Claude Code has its own task management

**Where it would be beneficial:**
- Explicit task tracking
- Progress visibility
- Resume from specific task

**Current V2 approach:**
- Sessions track what was done
- Decisions track what was decided
- No pending task queue

**Future consideration:**
- Add `tasks` table to D1
- Create `spawner_tasks` tool
- Priority: Medium (for complex projects)

---

## 8. State.json Project State

**What it does (V1):**
- Tracks: phase (planning/building/review)
- Tracks: discovery answers, stack decisions
- Tracks: checkpoint for resume
- Tracks: assumptions made

**Why partially ported:**
- V2 has `projects` table with basic info
- V2 has `decisions` table for decisions
- V2 has `sessions` for checkpoints
- Missing: phase tracking, assumptions

**Where gaps exist:**
- No explicit phase (planning → building → review)
- No assumptions tracking
- No discovery Q&A storage

**Future consideration:**
- Add `phase` column to projects
- Add `assumptions` table
- Add `discovery` JSON column
- Priority: Medium

---

## 9. Planner Skill (Orchestration)

**What it does (V1):**
- Complex orchestration brain in `skills/planner.md`
- Skill level detection (beginner/intermediate/advanced)
- Usefulness Framework for prioritization
- Discovery question flow
- Task breakdown logic

**Why not ported:**
- V2 skills are domain-specific, not orchestration
- Planner logic would need significant adaptation
- Current focus is on validation/memory

**Where it would be beneficial:**
- Guided project planning
- Automatic task breakdown
- Skill-appropriate communication

**Future consideration:**
- Create orchestration layer on top of V2
- Or integrate planner patterns into `spawner_context`
- Priority: High (core differentiator)

---

## 10. Squad System

**What it does (V1):**
- Pre-configured skill combinations
- Example: auth-complete → auth-flow + nextjs-supabase-auth + supabase-backend
- Lead + support + on-call structure

**Why not ported:**
- V2 loads skills individually
- No squad concept yet
- `pairs_with` exists but not enforced

**Where it would be beneficial:**
- Loading related skills together
- Ensuring complete coverage
- Reducing tool calls

**Current V2 approach:**
- Stack hints load multiple skills
- `pairs_with` metadata exists
- No automatic squad loading

**Future consideration:**
- Add `spawner_squad` tool
- Or enhance `spawner_context` to load squads
- Priority: Medium

---

## Summary

| Feature | Priority | Effort | Impact |
|---------|----------|--------|--------|
| Planner Skill (Orchestration) | High | High | High |
| Task Queue System | Medium | Medium | Medium |
| Squad System | Medium | Low | Medium |
| State.json (full) | Medium | Medium | Medium |
| Agent Skill Files | Medium | Medium | Low |
| File Scaffolding | Medium | High | Medium |
| Gist Config Loading | Medium | Low | Low |
| Behaviors System | Low | Low | Low |
| MCPs List | Low | Low | Low |
| check_environment | Low | Low | Low |

---

## Skills: V1 vs V2 Format Comparison

**Not migrating V1 skills yet.** Keeping both formats to benchmark:

### V1 Skills (`/skills/specialists/*.md`)
- 19 specialist skills
- Markdown format
- Stored in git repo
- Loaded via file system (local MCP)

### V2 Skills (`/spawner-v2/skills/**/*.yaml`)
- 7 skills (5 core + 2 integration)
- YAML format with structure
- Stored in Cloudflare KV
- Has sharp-edges.yaml + validations.yaml

### Benchmarking Plan
1. Both accessible via `spawner_skills` tool
2. Track which format Claude prefers
3. Track which format produces better outcomes
4. Decide on single format after data

---

## Next Steps

1. ✅ Document what's not ported (this file)
2. 🔄 Complete `spawner_skills` tool (searches both)
3. 🔄 Register new tools in index.ts
4. 🔄 Deploy and test
5. ⏳ Benchmark V1 vs V2 skill formats
6. ⏳ Port high-priority features based on usage
