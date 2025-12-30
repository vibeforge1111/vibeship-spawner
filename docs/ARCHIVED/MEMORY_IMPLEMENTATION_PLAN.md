# Memory System Implementation Plan

> Dual-tier architecture: Free (local) + Pro (cloud) with AI curation as the premium value prop

## Executive Summary

The memory system gives Spawner persistent project context across sessions. This is the core differentiator - "AI that remembers your project."

**Free Tier**: Local Python service running on user's machine
- Zero cost to us
- User owns their data
- Basic memory (decisions, issues, sessions)
- Rule-based memory extraction

**Pro Tier**: Cloud-hosted on Cloudflare Workers
- We host, they pay
- AI-powered memory curation (Claude extracts insights from sessions)
- Semantic search (find relevant memories by meaning)
- Cross-device sync
- Enhanced session primers

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Claude Desktop / Code                         │
└─────────────────────────────────────────────────────────────────────┘
                                   │
                                   │ MCP Protocol
                                   │
        ┌──────────────────────────┴──────────────────────────┐
        │                                                      │
        ▼                                                      ▼
┌───────────────────┐                              ┌───────────────────┐
│   FREE TIER       │                              │   PRO TIER        │
│   Local Service   │                              │   Cloud Service   │
├───────────────────┤                              ├───────────────────┤
│ Python + FastAPI  │                              │ TypeScript/Hono   │
│ SQLite            │                              │ Cloudflare D1     │
│ ChromaDB (local)  │                              │ CF Vectorize      │
│ sentence-trans.   │                              │ CF AI Embeddings  │
│ Rule-based curat. │                              │ Claude AI Curat.  │
└───────────────────┘                              └───────────────────┘
        │                                                      │
        ▼                                                      ▼
┌───────────────────┐                              ┌───────────────────┐
│ ~/.vibeship/      │                              │ Cloudflare Edge   │
│ - memories.db     │                              │ - D1 Database     │
│ - vectors/        │                              │ - KV Cache        │
│ - config.json     │                              │ - Vectorize Index │
└───────────────────┘                              └───────────────────┘
```

---

## Memory Types

Unified across both tiers:

| Type | Description | Importance | Example |
|------|-------------|------------|---------|
| `project_identity` | What the project IS | 1.0 | "SaaS for freelancer invoicing" |
| `architecture_decision` | Technical choices made | 0.9 | "Using Supabase for auth because RLS" |
| `tech_stack` | Technologies in use | 0.8 | "Next.js 14, Tailwind, Stripe" |
| `current_goal` | What we're building now | 0.95 | "Implementing user dashboard" |
| `known_issue` | Problems encountered | 0.85 | "Hydration mismatch in nav" |
| `resolved_issue` | Fixed problems | 0.6 | "Fixed by adding 'use client'" |
| `guardrail_passed` | Validations that passed | 0.5 | "No hardcoded secrets found" |
| `sharp_edge_hit` | Gotchas encountered | 0.9 | "Supabase RLS needs service role for admin" |
| `session_summary` | What happened in session | 0.7 | "Built auth flow, hit RLS issue" |
| `breakthrough` | Key learnings | 0.95 | "Realized we need webhook for Stripe" |
| `user_preference` | How user likes to work | 0.8 | "Prefers detailed explanations" |
| `skill_level` | User's experience level | 0.85 | "vibe-coder" / "builder" / "developer" |

---

## Phase 1: Enhanced Schema (Both Tiers)

### 1.1 New D1 Migration: `002_memories.sql`

```sql
-- Unified memories table (replaces scattered storage)
CREATE TABLE IF NOT EXISTS memories (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,

  -- Memory content
  type TEXT NOT NULL,  -- From SpawnerMemoryType enum
  content TEXT NOT NULL,
  context TEXT,  -- Optional additional context

  -- Metadata
  importance REAL DEFAULT 0.7,  -- 0.0 to 1.0
  source TEXT DEFAULT 'user',  -- 'user' | 'ai_curated' | 'system'
  session_id TEXT,  -- Which session created this

  -- Timestamps
  created_at TEXT DEFAULT (datetime('now')),
  last_accessed_at TEXT,
  access_count INTEGER DEFAULT 0,

  -- For semantic search (Pro tier populates this)
  embedding_id TEXT  -- Reference to Vectorize
);

CREATE INDEX IF NOT EXISTS idx_memories_project ON memories(project_id);
CREATE INDEX IF NOT EXISTS idx_memories_type ON memories(type);
CREATE INDEX IF NOT EXISTS idx_memories_importance ON memories(importance DESC);
CREATE INDEX IF NOT EXISTS idx_memories_user ON memories(user_id);

-- Session tracking for AI curation
CREATE TABLE IF NOT EXISTS session_transcripts (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,

  -- Transcript data
  summary TEXT,
  key_events TEXT DEFAULT '[]',  -- JSON array
  memories_extracted TEXT DEFAULT '[]',  -- JSON array of memory IDs

  -- Curation status
  curated BOOLEAN DEFAULT FALSE,
  curated_at TEXT,

  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_transcripts_project ON session_transcripts(project_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_curated ON session_transcripts(curated);
```

### 1.2 Local SQLite Schema (Free Tier)

Same schema, stored in `~/.vibeship/memories.db`

---

## Phase 2: Tool Implementation

### 2.1 Existing Tools (Enhanced)

#### `spawner_load` (Enhanced)

Add automatic session primer injection:

```typescript
// Current: loads project context
// Enhanced: generates session primer from memories

interface LoadOutput {
  // ... existing fields ...

  // NEW: Session primer
  primer: {
    project_summary: string;      // Who you are, what you're building
    last_session: string;         // What happened last time
    current_goals: string[];      // What we're working on
    open_issues: string[];        // Known problems
    key_decisions: string[];      // Important choices made
    watch_out_for: string[];      // Sharp edges for current stack
  };
}
```

#### `spawner_remember` (Enhanced)

Add memory type support:

```typescript
// Current: saves decisions, issues, summaries
// Enhanced: saves typed memories with importance

interface RememberInput {
  project_id?: string;
  memory: {
    type: SpawnerMemoryType;
    content: string;
    context?: string;
    importance?: number;  // Override default
  };
  // Keep backwards compat
  update?: { /* existing structure */ };
}
```

### 2.2 New Tools

#### `spawner_memory_search` (Pro Tier)

Semantic search across memories:

```typescript
const memorySearchToolDefinition = {
  name: 'spawner_memory_search',
  description: 'Search project memories by meaning. Pro tier only - uses AI embeddings.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Natural language search query'
      },
      project_id: {
        type: 'string',
        description: 'Optional - search specific project'
      },
      types: {
        type: 'array',
        items: { type: 'string' },
        description: 'Filter by memory types'
      },
      limit: {
        type: 'number',
        default: 10
      }
    },
    required: ['query']
  }
};
```

#### `spawner_session_end` (Both Tiers)

Explicitly end session and trigger curation:

```typescript
const sessionEndToolDefinition = {
  name: 'spawner_session_end',
  description: 'End the current session. Saves summary and triggers memory curation (Pro: AI, Free: rule-based).',
  inputSchema: {
    type: 'object',
    properties: {
      project_id: { type: 'string' },
      summary: {
        type: 'string',
        description: 'What was accomplished this session'
      },
      transcript_hint: {
        type: 'string',
        description: 'Key events to help AI curation (Pro tier)'
      }
    },
    required: ['summary']
  }
};
```

---

## Phase 3: AI Curation (Pro Tier)

### 3.1 Curation System Prompt

```typescript
const CURATION_SYSTEM_PROMPT = `You are the VibeShip Spawner memory curator.

Your job: Extract valuable memories from development sessions.

MEMORY TYPES you can create:
- project_identity: What the project fundamentally IS
- architecture_decision: Technical choices with reasoning
- tech_stack: Technologies being used
- current_goal: Active objectives
- known_issue: Problems not yet solved
- resolved_issue: Problems that were fixed (include solution)
- sharp_edge_hit: Gotchas/pitfalls encountered
- breakthrough: Key learnings or realizations
- user_preference: How the user likes to work

RULES:
1. Only extract ACTIONABLE memories that help future sessions
2. Decisions must include WHY, not just WHAT
3. Issues must be specific enough to recognize if seen again
4. Don't duplicate existing memories (check provided context)
5. Set importance based on impact (0.0-1.0)

OUTPUT FORMAT:
{
  "memories": [
    {
      "type": "architecture_decision",
      "content": "Using Supabase RLS instead of middleware auth",
      "context": "Simpler to maintain, fewer auth bugs",
      "importance": 0.9
    }
  ],
  "session_summary": "One paragraph summary of the session"
}`;
```

### 3.2 Curation Flow

```
Session End
    │
    ▼
┌─────────────────┐
│ Collect Context │
│ - User messages │
│ - Tool calls    │
│ - Outcomes      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│   FREE TIER     │     │   PRO TIER      │
│ Rule-based      │     │ Claude API      │
│ extraction      │     │ extraction      │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │
                     ▼
           ┌─────────────────┐
           │ Store Memories  │
           │ - To DB         │
           │ - To Vectorize  │
           │   (Pro only)    │
           └─────────────────┘
```

### 3.3 Rule-Based Extraction (Free Tier)

```python
# Pattern matching for common memory types
EXTRACTION_PATTERNS = {
    'architecture_decision': [
        r"(?:decided|chose|going with|using)\s+(\w+)\s+(?:because|for|since)",
        r"(?:let's|we'll|I'll)\s+use\s+(\w+)",
    ],
    'known_issue': [
        r"(?:bug|issue|problem|error):\s*(.+)",
        r"(?:doesn't|won't|can't)\s+(.+)",
    ],
    'resolved_issue': [
        r"(?:fixed|resolved|solved)\s+(?:by|with)\s+(.+)",
    ],
    'tech_stack': [
        r"(?:using|with|stack:)\s*((?:Next|React|Vue|Svelte|Supabase|Stripe|Tailwind)[\w\s,]+)",
    ],
}
```

---

## Phase 4: Session Primer Generation

### 4.1 Primer Template

```typescript
const SESSION_PRIMER_TEMPLATE = `
## Project Context: {project_name}

### What We're Building
{project_identity}

### Tech Stack
{tech_stack}

### Last Session ({last_session_date})
{last_session_summary}

### Current Goals
{current_goals}

### Open Issues
{open_issues}

### Key Decisions Made
{recent_decisions}

### Watch Out For
{relevant_sharp_edges}

---
Ready to continue. What would you like to work on?
`;
```

### 4.2 Primer Generation Logic

```typescript
async function generateSessionPrimer(
  env: Env,
  projectId: string,
  userId: string
): Promise<string> {
  // 1. Load project
  const project = await loadProject(env.DB, projectId, userId);

  // 2. Get recent memories by type
  const memories = await getRecentMemories(env.DB, projectId, {
    types: ['project_identity', 'tech_stack', 'current_goal', 'known_issue'],
    limit: 20,
    orderBy: 'importance'
  });

  // 3. Get last session
  const lastSession = await getLastSession(env.DB, projectId);

  // 4. Get relevant sharp edges for stack
  const sharpEdges = await getSharpEdgesForStack(env.SHARP_EDGES, project.stack);

  // 5. Format primer
  return formatPrimer({
    project,
    memories,
    lastSession,
    sharpEdges
  });
}
```

---

## Phase 5: Monetization Integration

### 5.1 Tier Detection

```typescript
interface UserTier {
  tier: 'free' | 'pro' | 'team';
  features: {
    ai_curation: boolean;
    semantic_search: boolean;
    cloud_sync: boolean;
    max_projects: number;
    max_memories_per_project: number;
  };
}

async function getUserTier(userId: string): Promise<UserTier> {
  // Check subscription status
  // Could be Stripe lookup, JWT claim, or DB check
}
```

### 5.2 Feature Gating

```typescript
// In spawner_memory_search
export async function executeMemorySearch(
  env: Env,
  input: MemorySearchInput,
  userId: string
): Promise<MemorySearchOutput> {
  const tier = await getUserTier(userId);

  if (!tier.features.semantic_search) {
    return {
      error: 'Semantic search is a Pro feature',
      upgrade_url: 'https://vibeship.co/upgrade',
      alternative: 'Use spawner_load to see recent memories, or filter by type with spawner_remember'
    };
  }

  // ... proceed with search
}
```

### 5.3 Usage Tracking

```typescript
// Track feature usage for analytics and limits
await trackUsage(env.DB, {
  user_id: userId,
  feature: 'ai_curation',
  project_id: projectId,
  tokens_used: response.usage?.total_tokens
});
```

---

## Implementation Order

### Week 1: Foundation
1. [ ] Create `002_memories.sql` migration
2. [ ] Add `SpawnerMemoryType` enum to types
3. [ ] Create `src/db/memories.ts` CRUD operations
4. [ ] Enhance `spawner_remember` for typed memories
5. [ ] Enhance `spawner_load` with basic primer

### Week 2: Session Management
1. [ ] Create `spawner_session_end` tool
2. [ ] Implement rule-based memory extraction
3. [ ] Add session transcript storage
4. [ ] Wire up primer generation in `spawner_load`

### Week 3: Pro Features
1. [ ] Set up Cloudflare Vectorize index
2. [ ] Implement embedding generation
3. [ ] Create `spawner_memory_search` tool
4. [ ] Implement AI curation with Claude API

### Week 4: Monetization
1. [ ] Add tier detection system
2. [ ] Implement feature gating
3. [ ] Add usage tracking
4. [ ] Create upgrade prompts

---

## File Structure

```
spawner-v2/
├── src/
│   ├── tools/
│   │   ├── remember.ts        # Enhanced with memory types
│   │   ├── context.ts         # Enhanced with primer
│   │   ├── session-end.ts     # NEW
│   │   └── memory-search.ts   # NEW (Pro)
│   ├── db/
│   │   ├── memories.ts        # NEW - memory CRUD
│   │   └── transcripts.ts     # NEW - session transcripts
│   ├── memory/
│   │   ├── types.ts           # SpawnerMemoryType enum
│   │   ├── primer.ts          # Session primer generation
│   │   ├── curator.ts         # AI curation (Pro)
│   │   └── extractor.ts       # Rule-based extraction (Free)
│   ├── billing/
│   │   ├── tiers.ts           # Tier definitions
│   │   └── usage.ts           # Usage tracking
│   └── types/
│       └── memory.ts          # Memory-specific types
├── migrations/
│   └── 002_memories.sql       # NEW
└── scripts/
    └── migrate-memories.ts    # Migrate existing data
```

---

## Local Service (Free Tier)

Separate repo: `vibeship-memory-local`

```
vibeship-memory-local/
├── src/
│   ├── main.py               # FastAPI + MCP server
│   ├── storage/
│   │   ├── sqlite.py         # Local SQLite
│   │   └── chroma.py         # Local ChromaDB
│   ├── extraction/
│   │   └── rules.py          # Rule-based extraction
│   └── config.py             # Configuration
├── pyproject.toml
└── README.md
```

**Why separate repo?**
- Different runtime (Python vs TypeScript)
- Runs locally, not deployed
- User installs via pip/uv
- Can be open-sourced independently

---

## Success Metrics

| Metric | Target | Why |
|--------|--------|-----|
| Session continuity | 80% of users return within 7 days | Memory is working |
| Primer usefulness | 70% sessions use primer context | Primer is relevant |
| Pro conversion | 10% of active users upgrade | Value prop is clear |
| Memory accuracy | 90% user-confirmed useful | AI curation is good |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI curation extracts wrong memories | User frustration | Allow manual memory CRUD, show extracted memories |
| Local service too complex to install | No free tier adoption | Excellent docs, one-line install, fallback to cloud |
| Vector search too slow | Poor UX | Cache frequent queries, limit search scope |
| Costs exceed revenue | Business failure | Strict usage limits, efficient embedding models |

---

## Next Steps

1. **Review this plan** - Any adjustments needed?
2. **Start Phase 1** - Schema and basic memory types
3. **Dogfood immediately** - Use memory while building memory
4. **Track friction** - Every pain point is a feature

---

*"AI that remembers your project" - This is the moat.*
