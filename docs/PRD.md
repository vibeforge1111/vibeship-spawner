# Spawner V2 - Product Requirements Document

> The vibe coder's unfair advantage

## Executive Summary

Spawner transforms Claude from a generic coding assistant into a specialized product-building system that remembers your project, catches mistakes before you ship, knows the sharp edges of modern stacks, and detects when you're stuck.

**The Core Insight:** Claude is already smart. What it lacks is:
1. Memory across sessions
2. Actual code verification (not just suggestions)
3. Battle-scarred domain knowledge
4. Awareness of when you're spinning

Spawner adds these layers.

---

## Success Metrics

| Metric | Target | How We Measure |
|--------|--------|----------------|
| **The Save** | 3+ catches per project | Telemetry: `guardrail_block` events |
| **The Memory** | <30s to resume any project | User returns, Spawner has context |
| **The Expertise** | 1+ "how did it know that?" per session | Telemetry: `sharp_edge_surfaced` events |
| **The Unstick** | Escape hatch triggers help, not annoy | Telemetry: `escape_hatch_outcome` = resolved |
| **Word of Mouth** | Users mention specific moments | Qualitative feedback |

---

## User Personas

### Primary: The Vibe Coder
- Uses Claude Code or Claude Desktop
- Building MVPs, side projects, or internal tools
- Knows enough to prompt, not enough to debug edge cases
- Ships fast, fixes later (but "later" often means "never")
- Pain: "It worked until it didn't, and I don't know why"

### Secondary: The Builder
- Some coding experience, learning by doing
- Uses AI to accelerate, wants to understand
- Pain: "I copy-pasted the solution but don't know if it's right"

### Tertiary: The Developer
- Experienced, uses AI for speed
- Knows what good looks like, wants guardrails
- Pain: "I'm moving fast and might miss something obvious"

---

## Core Features

### 1. Project Memory

**What:** Persistent storage of project context across sessions.

**Why:** Every Claude session starts cold. Users waste time re-explaining. Spawner remembers.

**User Experience:**
```
User opens Claude, connects Spawner

Spawner: "Picking up invoice-app. Last session you finished 
the Stripe webhook but the invoice status wasn't updating. 
We identified the issue - webhook signature verification 
was failing in production. Want to fix that?"
```

**What's Stored:**
- Project manifest (name, stack, structure)
- Architecture decisions and why
- Session summaries (compressed)
- Known issues and blockers
- What's been validated

**Storage:** Cloudflare D1 (SQLite) + KV for hot data

**Privacy:** 
- Project data tied to user identifier
- No code stored, only summaries and metadata
- User can delete anytime

---

### 2. Guardrails That Run

**What:** Actual code verification, not suggestions.

**Why:** Claude says "remember to check for exposed secrets." Spawner runs a scan and says "line 47, hardcoded Stripe key."

**What We Check:**

| Check | Type | Severity |
|-------|------|----------|
| Hardcoded secrets | Regex patterns | Critical |
| Async client components | AST check | Error |
| Missing error handling | AST check | Warning |
| Console.log in production | Regex | Warning |
| .env files in .gitignore | File check | Critical |
| Missing RLS policies | Runtime (opt-in) | Warning |

**User Experience:**
```
User: "Generate the Supabase client setup"

Claude generates code...

Spawner (interrupts): "Caught an issue before that ships:
Line 12 has SUPABASE_SERVICE_ROLE_KEY hardcoded. 
Moving to environment variable now."

[Shows corrected code]
```

**Implementation:** Targeted checks via ts-morph + regex. Not a full linter - just high-value catches.

---

### 3. Sharp Edges Database

**What:** Curated knowledge of gotchas that Claude doesn't know by default.

**Why:** Claude has documentation. Spawner has "I've been burned by this."

**Example Sharp Edge:**
```yaml
id: supabase-rls-auth-timing
summary: New users see empty data right after signup
severity: subtle

situation: |
  Using Supabase with RLS policies that check auth.uid().
  User signs up, immediately queries data, gets nothing.
  
why: |
  RLS policies using auth.uid() fail during the brief window 
  between user creation and first token refresh. Race condition.
  
solution: |
  Use service_role for initial data fetch in signup flow,
  or use database trigger to create initial data on user insert.
```

**When It Surfaces:**
- User is working on auth + data fetching
- User mentions "empty data after signup"
- User's code matches the pattern

**Maintenance:**
- Sharp edges have version ranges and expiry dates
- Auto-flagged for review when expired
- Community can submit new edges

---

### 4. Escape Hatch Intelligence

**What:** Detects when you're stuck in a loop and offers real alternatives.

**Why:** Users spend 30 minutes trying variations of the same broken approach. Spawner notices and intervenes.

**Detection Signals:**
- Same error 3+ times
- Reverting changes repeatedly  
- Growing code complexity without resolution
- User frustration signals ("this still doesn't work")

**User Experience:**
```
Spawner: "We've tried 3 approaches to this auth issue and 
we're going in circles. Let me step back.

The core problem: Middleware runs before session is available.

Options:
1. Move auth check to layout (server-side, restructures routes)
2. Use client-side redirect as fallback (simpler, flash possible)
3. Switch to Clerk (handles these edge cases, adds dependency)

Which direction? I'd recommend starting fresh with whichever 
you pick rather than patching current code."
```

---

### 5. Specialized Skills

**What:** Domain-specific knowledge modules that make Claude an expert in specific stacks.

**Why:** A generalist that knows a little about everything loses to a specialist that knows a lot about your stack.

**How Skills Work:**
- Skills are structured knowledge (not prompts)
- Loaded based on project context
- Provide patterns, anti-patterns, sharp edges, validations
- Know their boundaries and hand off appropriately

**Example:** `nextjs-app-router` skill knows:
- Server vs Client component decisions
- App Router file structure patterns
- Common mistakes (async client components)
- When to hand off to `supabase-backend`

See: `SKILL_SPEC.md` for full specification.

---

## Technical Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USER'S ENVIRONMENT                       │
│              Claude Desktop / Claude Code                   │
└─────────────────────────────────────────────────────────────┘
                              │
                         MCP Protocol
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   SPAWNER MCP SERVER                        │
│                  (Cloudflare Workers)                       │
├─────────────────────────────────────────────────────────────┤
│  Tools:                                                     │
│  - spawner_load       (load project + relevant skills)      │
│  - spawner_validate   (run guardrail checks)                │
│  - spawner_remember   (store project state)                 │
│  - spawner_watch_out  (query sharp edges)                   │
│  - spawner_unstick    (escape hatch analysis)               │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
          ┌─────────────────┐  ┌─────────────────┐
          │  Cloudflare D1  │  │  Cloudflare KV  │
          │   (Projects,    │  │  (Sharp Edges,  │
          │    Sessions,    │  │   Skills,       │
          │    Telemetry)   │  │   Hot Cache)    │
          └─────────────────┘  └─────────────────┘
```

### MCP Tools

#### `spawner_load`
Load project context and relevant skills for current session.

```typescript
interface SpawnerContextInput {
  project_id?: string        // Resume existing project
  project_description?: string  // Or describe new project
  stack_hints?: string[]     // ["nextjs", "supabase", "vercel"]
}

interface SpawnerContextOutput {
  project: ProjectManifest
  relevant_skills: Skill[]
  last_session_summary?: string
  known_issues?: Issue[]
  sharp_edges: SharpEdge[]   // Pre-loaded for this stack
}
```

#### `spawner_validate`
Run guardrail checks on code.

```typescript
interface SpawnerValidateInput {
  code: string
  file_path: string
  check_types?: ('security' | 'patterns' | 'production')[]
}

interface SpawnerValidateOutput {
  passed: boolean
  issues: {
    severity: 'critical' | 'error' | 'warning'
    message: string
    line?: number
    fix_suggestion?: string
    auto_fixable: boolean
  }[]
}
```

#### `spawner_remember`
Store project state for future sessions.

```typescript
interface SpawnerRememberInput {
  project_id: string
  update: {
    decision?: { what: string, why: string }
    issue?: { description: string, status: 'open' | 'resolved' }
    session_summary?: string
    validated?: string[]  // What checks passed
  }
}
```

#### `spawner_watch_out`
Query relevant sharp edges.

```typescript
interface SpawnerSharpEdgeInput {
  stack: string[]           // ["nextjs", "supabase"]
  situation?: string        // "auth redirect flashing"
  code_context?: string     // Code that might trigger an edge
}

interface SpawnerSharpEdgeOutput {
  edges: SharpEdge[]
  relevance_reason: string  // Why these edges apply
}
```

#### `spawner_unstick`
Analyze stuck state and provide alternatives.

```typescript
interface SpawnerUnstickInput {
  task_description: string
  attempts: string[]        // What we've tried
  errors: string[]          // Errors encountered
  current_code?: string
}

interface SpawnerUnstickOutput {
  diagnosis: string         // What's actually wrong
  alternatives: {
    approach: string
    tradeoff: string
    recommended: boolean
  }[]
  should_reset: boolean     // Is current code too tangled?
}
```

---

## Data Models

### Project

```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  stack TEXT,              -- JSON array of stack items
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_decisions (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id),
  decision TEXT NOT NULL,
  reasoning TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_sessions (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id),
  summary TEXT NOT NULL,
  issues_discussed TEXT,   -- JSON array
  validations_passed TEXT, -- JSON array
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE project_issues (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id),
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  resolved_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Telemetry

```sql
CREATE TABLE telemetry_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,  -- guardrail_block, sharp_edge_surfaced, etc
  project_id TEXT,
  skill_id TEXT,
  metadata TEXT,             -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for aggregation queries
CREATE INDEX idx_telemetry_type ON telemetry_events(event_type);
CREATE INDEX idx_telemetry_date ON telemetry_events(created_at);
CREATE INDEX idx_telemetry_skill ON telemetry_events(skill_id);
```

---

## Telemetry Events

| Event | When | What We Learn |
|-------|------|---------------|
| `guardrail_block` | Validation catches issue | Which checks earn their keep |
| `guardrail_override` | User says "ship anyway" | Which checks are too strict |
| `sharp_edge_surfaced` | Edge shown to user | Which edges are relevant |
| `sharp_edge_timing` | Before vs after problem | Are we surfacing too late? |
| `escape_hatch_trigger` | Stuck detection fires | Where users struggle |
| `escape_hatch_outcome` | Which alternative chosen | Which escapes actually help |
| `skill_handoff` | One skill hands to another | Integration quality |
| `session_resume` | User returns to project | Memory is working |

---

## Privacy & Security

### Data Handling
- No user code stored in database
- Only summaries, decisions, and metadata
- Project data isolated by user_id
- User can delete all data via `spawner_forget` tool

### Telemetry
- Opt-in only (not opt-out)
- No code content in events
- Only pattern data (skill X, check Y, outcome Z)
- Aggregated for analysis, individual events ephemeral

### Secrets in Code
- Spawner scans FOR secrets to warn users
- Spawner never stores or transmits detected secrets
- Detection is regex-based, no external calls

---

## Non-Goals (V2)

- **IDE integration** - MCP works with Claude Desktop/Code, no VS Code plugin
- **Team collaboration** - Solo vibe coders first
- **Full test generation** - Maybe V3
- **Deployment automation** - Guide, don't execute
- **Custom skill creation UI** - Users edit markdown files

---

## Open Questions

1. **Skill selection:** How does Spawner know which skills to load? User declares stack? Auto-detect from files?

2. **Context window management:** Skills add tokens. How many skills can load before crowding out user's code?

3. **Validation frequency:** Every code block? End of task? User-triggered? Balance helpfulness vs annoyance.

4. **Reset mechanics:** When escape hatch recommends reset, what exactly happens? Need to integrate with user's git.

---

## Success Criteria for V2 Launch

- [ ] 5 core skills complete (Layer 1+2)
- [ ] Project memory working across sessions
- [ ] 10+ guardrail checks implemented
- [ ] 30+ sharp edges documented
- [ ] Escape hatch detection functional
- [ ] Telemetry pipeline operational
- [ ] Dogfooded on 3+ real projects
- [ ] Documentation complete

---

*Document version: 2.0*
*Last updated: 2024-12-11*
