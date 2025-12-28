# Spawner V2 - Technical Architecture

> How the pieces fit together

## System Overview

```
┌────────────────────────────────────────────────────────────────────┐
│                        USER ENVIRONMENT                            │
│                                                                    │
│   ┌──────────────────┐         ┌──────────────────┐               │
│   │  Claude Desktop  │         │   Claude Code    │               │
│   └────────┬─────────┘         └────────┬─────────┘               │
│            │                            │                          │
│            └──────────┬─────────────────┘                          │
│                       │ MCP Protocol                               │
└───────────────────────┼────────────────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────────────────┐
│                    CLOUDFLARE EDGE                                 │
│                                                                    │
│   ┌────────────────────────────────────────────────────────────┐  │
│   │                    SPAWNER MCP WORKER                       │  │
│   │                                                             │  │
│   │   Routes:                                                   │  │
│   │   POST /mcp/tools/spawner_load                             │  │
│   │   POST /mcp/tools/spawner_validate                         │  │
│   │   POST /mcp/tools/spawner_remember                         │  │
│   │   POST /mcp/tools/spawner_watch_out                        │  │
│   │   POST /mcp/tools/spawner_unstick                          │  │
│   │                                                             │  │
│   └─────────────────────────┬───────────────────────────────────┘  │
│                             │                                      │
│         ┌───────────────────┼───────────────────┐                  │
│         │                   │                   │                  │
│         ▼                   ▼                   ▼                  │
│   ┌───────────┐      ┌───────────┐      ┌───────────┐             │
│   │    D1     │      │    KV     │      │  Workers  │             │
│   │ (SQLite)  │      │  (Cache)  │      │    AI     │             │
│   │           │      │           │      │ (optional)│             │
│   │ projects  │      │ skills    │      │           │             │
│   │ sessions  │      │ edges     │      │ embedding │             │
│   │ telemetry │      │ hot cache │      │ search    │             │
│   └───────────┘      └───────────┘      └───────────┘             │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

                        +
                        │
                        ▼
┌────────────────────────────────────────────────────────────────────┐
│                     LOCAL FILESYSTEM                               │
│                                                                    │
│   ~/.spawner/skills/              ← 136 skills (YAML)              │
│   ├── development/                   Cloned from GitHub            │
│   ├── data/                          Zero API cost                 │
│   ├── ai/                            Works offline                 │
│   └── ...                                                          │
│                                                                    │
│   GitHub: vibeforge1111/vibeship-spawner-skills                    │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘
```

---

## Skill Loading Model

**Hybrid Architecture:**

| Component | Where | Purpose |
|-----------|-------|---------|
| Skill Content | Local filesystem (`~/.spawner/skills/`) | Claude reads YAML files directly. Zero API cost, works offline. |
| Validations | Cloudflare KV | MCP runs code checks server-side |
| Sharp Edges | Cloudflare KV | Quick lookup for situation-specific gotchas |
| Project Memory | Cloudflare D1 | Persistent storage for decisions, sessions, issues |

**Why Local Skills?**
- Free forever (no API calls for skill content)
- Fast (local file reads)
- Works offline after initial clone
- Easy to customize (edit YAML files)
- Easy to update (`git pull`)

**Setup:**
```bash
# One-time clone
git clone https://github.com/vibeforge1111/vibeship-spawner-skills ~/.spawner/skills

# Update skills
cd ~/.spawner/skills && git pull
```

---

## Component Details

### MCP Worker

The main entry point. Handles tool routing and orchestration.

```typescript
// src/index.ts

import { McpServer } from '@anthropic-ai/mcp'
import { contextTool } from './tools/context'
import { validateTool } from './tools/validate'
import { rememberTool } from './tools/remember'
import { sharpEdgeTool } from './tools/sharp-edge'
import { unstickTool } from './tools/unstick'

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const server = new McpServer({
      name: 'spawner',
      version: '2.0.0',
    })
    
    server.addTool(contextTool(env))
    server.addTool(validateTool(env))
    server.addTool(rememberTool(env))
    server.addTool(sharpEdgeTool(env))
    server.addTool(unstickTool(env))
    
    return server.handle(request)
  }
}
```

### Environment Bindings

```typescript
// src/types.ts

interface Env {
  // D1 Database
  DB: D1Database
  
  // KV Namespaces
  SKILLS: KVNamespace      // Skill definitions
  SHARP_EDGES: KVNamespace // Sharp edges database
  CACHE: KVNamespace       // Hot cache for sessions
  
  // Optional: Workers AI for embeddings
  AI?: Ai
  
  // Config
  ENVIRONMENT: 'development' | 'production'
}
```

---

## Data Layer

### D1 Schema

```sql
-- migrations/001_initial.sql

-- Projects
CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  stack TEXT NOT NULL DEFAULT '[]',  -- JSON array
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_projects_user ON projects(user_id);

-- Architecture Decisions
CREATE TABLE decisions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  decision TEXT NOT NULL,
  reasoning TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_decisions_project ON decisions(project_id);

-- Session Summaries
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  issues_open TEXT DEFAULT '[]',     -- JSON array
  issues_resolved TEXT DEFAULT '[]', -- JSON array
  validations_passed TEXT DEFAULT '[]', -- JSON array
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_sessions_project ON sessions(project_id);
CREATE INDEX idx_sessions_date ON sessions(created_at);

-- Known Issues
CREATE TABLE issues (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'open',  -- open | resolved
  resolved_at TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_issues_project ON issues(project_id);
CREATE INDEX idx_issues_status ON issues(status);

-- Telemetry Events
CREATE TABLE telemetry (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  project_id TEXT,
  skill_id TEXT,
  metadata TEXT DEFAULT '{}',  -- JSON
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_telemetry_type ON telemetry(event_type);
CREATE INDEX idx_telemetry_date ON telemetry(created_at);
CREATE INDEX idx_telemetry_skill ON telemetry(skill_id);
```

### KV Structure

```
SKILLS namespace:
  skill:{skill_id}           → Skill definition (JSON)
  skill:{skill_id}:patterns  → Patterns markdown
  skill:{skill_id}:edges     → Sharp edges markdown
  skill_index                → List of all skill IDs

SHARP_EDGES namespace:
  edge:{edge_id}             → Sharp edge definition (JSON)
  edges_by_stack:{stack}     → List of edge IDs for stack
  edge_index                 → List of all edge IDs

CACHE namespace:
  session:{user_id}          → Current session context (TTL: 1 hour)
  project:{project_id}       → Project hot cache (TTL: 24 hours)
```

---

## Tool Implementations

### spawner_load

Load project context and relevant skills.

```typescript
// src/tools/context.ts

import { z } from 'zod'

const inputSchema = z.object({
  project_id: z.string().optional(),
  project_description: z.string().optional(),
  stack_hints: z.array(z.string()).optional(),
})

export function loadTool(env: Env) {
  return {
    name: 'spawner_load',
    description: 'Load project context and relevant skills for this session',
    inputSchema,
    
    async execute(input: z.infer<typeof inputSchema>, userId: string) {
      // 1. Load or create project
      let project: Project
      
      if (input.project_id) {
        project = await loadProject(env.DB, input.project_id, userId)
      } else if (input.project_description) {
        project = await findOrCreateProject(env.DB, userId, input.project_description)
      } else {
        // Check cache for recent project
        const cached = await env.CACHE.get(`session:${userId}`, 'json')
        if (cached) {
          project = cached.project
        } else {
          return { 
            message: "No project context. Describe what you're building or provide a project ID." 
          }
        }
      }
      
      // 2. Determine relevant skills
      const stack = input.stack_hints || project.stack || []
      const skills = await loadRelevantSkills(env.SKILLS, stack)
      
      // 3. Load sharp edges for this stack
      const sharpEdges = await loadSharpEdges(env.SHARP_EDGES, stack)
      
      // 4. Get last session summary
      const lastSession = await getLastSession(env.DB, project.id)
      
      // 5. Get open issues
      const openIssues = await getOpenIssues(env.DB, project.id)
      
      // 6. Cache for quick access
      await env.CACHE.put(
        `session:${userId}`,
        JSON.stringify({ project, skills: skills.map(s => s.id) }),
        { expirationTtl: 3600 }
      )
      
      // 7. Emit telemetry
      await emitEvent(env.DB, 'session_start', {
        project_id: project.id,
        skills_loaded: skills.map(s => s.id),
      })
      
      return {
        project: {
          id: project.id,
          name: project.name,
          description: project.description,
          stack: project.stack,
        },
        last_session: lastSession?.summary,
        open_issues: openIssues,
        skills: skills.map(s => ({
          id: s.id,
          name: s.name,
          owns: s.owns,
          sharp_edges_count: s.sharpEdges?.length || 0,
        })),
        sharp_edges: sharpEdges.slice(0, 10),  // Top 10 most relevant
        
        // Instruction for Claude
        _instruction: `
          Project context loaded. You now have access to:
          - ${skills.length} relevant skills
          - ${sharpEdges.length} sharp edges for this stack
          ${lastSession ? `- Last session context: ${lastSession.summary}` : ''}
          ${openIssues.length > 0 ? `- ${openIssues.length} open issues to address` : ''}
          
          Use spawner_validate to check code before marking tasks complete.
          Use spawner_watch_out if you encounter issues matching known gotchas.
          Use spawner_remember to save important decisions or progress.
        `
      }
    }
  }
}
```

### spawner_validate

Run guardrail checks on code.

```typescript
// src/tools/validate.ts

import { z } from 'zod'
import { runChecks, Check, ValidationResult } from '../validation/runner'

const inputSchema = z.object({
  code: z.string(),
  file_path: z.string(),
  check_types: z.array(z.enum(['security', 'patterns', 'production'])).optional(),
})

export function validateTool(env: Env) {
  return {
    name: 'spawner_validate',
    description: 'Run guardrail checks on code to catch issues before shipping',
    inputSchema,
    
    async execute(input: z.infer<typeof inputSchema>, userId: string) {
      const checkTypes = input.check_types || ['security', 'patterns', 'production']
      
      // Load relevant checks based on file type and requested types
      const checks = await loadChecks(env.SKILLS, input.file_path, checkTypes)
      
      // Run validation
      const results = await runChecks(checks, input.code, input.file_path)
      
      // Separate by severity
      const critical = results.filter(r => !r.passed && r.severity === 'critical')
      const errors = results.filter(r => !r.passed && r.severity === 'error')
      const warnings = results.filter(r => !r.passed && r.severity === 'warning')
      
      // Emit telemetry for catches
      for (const result of results.filter(r => !r.passed)) {
        await emitEvent(env.DB, 'guardrail_block', {
          check_id: result.checkId,
          severity: result.severity,
          file_path: input.file_path,
        })
      }
      
      const passed = critical.length === 0 && errors.length === 0
      
      return {
        passed,
        summary: passed 
          ? `All checks passed${warnings.length > 0 ? ` (${warnings.length} warnings)` : ''}`
          : `Found ${critical.length} critical, ${errors.length} errors, ${warnings.length} warnings`,
        
        critical: critical.map(formatResult),
        errors: errors.map(formatResult),
        warnings: warnings.map(formatResult),
        
        _instruction: passed 
          ? 'Code passed validation. Safe to proceed.'
          : `
            Issues found that should be fixed:
            ${critical.map(r => `CRITICAL: ${r.message}`).join('\n')}
            ${errors.map(r => `ERROR: ${r.message}`).join('\n')}
            
            Address critical and error issues before proceeding.
            Warnings can be addressed later but review them.
          `
      }
    }
  }
}

function formatResult(r: ValidationResult) {
  return {
    check: r.checkId,
    message: r.message,
    line: r.line,
    fix_suggestion: r.fixSuggestion,
    auto_fixable: r.autoFixable,
  }
}
```

### spawner_remember

Store project state.

```typescript
// src/tools/remember.ts

import { z } from 'zod'

const inputSchema = z.object({
  project_id: z.string(),
  update: z.object({
    decision: z.object({
      what: z.string(),
      why: z.string(),
    }).optional(),
    issue: z.object({
      description: z.string(),
      status: z.enum(['open', 'resolved']),
    }).optional(),
    session_summary: z.string().optional(),
    validated: z.array(z.string()).optional(),
  }),
})

export function rememberTool(env: Env) {
  return {
    name: 'spawner_remember',
    description: 'Save project decisions, issues, or session progress for future sessions',
    inputSchema,
    
    async execute(input: z.infer<typeof inputSchema>, userId: string) {
      const { project_id, update } = input
      
      // Verify project ownership
      const project = await loadProject(env.DB, project_id, userId)
      if (!project) {
        return { error: 'Project not found or access denied' }
      }
      
      const saved: string[] = []
      
      // Save decision
      if (update.decision) {
        await env.DB.prepare(`
          INSERT INTO decisions (id, project_id, decision, reasoning)
          VALUES (?, ?, ?, ?)
        `).bind(
          crypto.randomUUID(),
          project_id,
          update.decision.what,
          update.decision.why
        ).run()
        saved.push('decision')
      }
      
      // Save or update issue
      if (update.issue) {
        if (update.issue.status === 'resolved') {
          // Try to find and resolve existing issue
          await env.DB.prepare(`
            UPDATE issues 
            SET status = 'resolved', resolved_at = datetime('now')
            WHERE project_id = ? AND description LIKE ? AND status = 'open'
          `).bind(project_id, `%${update.issue.description.slice(0, 50)}%`).run()
        } else {
          await env.DB.prepare(`
            INSERT INTO issues (id, project_id, description, status)
            VALUES (?, ?, ?, ?)
          `).bind(
            crypto.randomUUID(),
            project_id,
            update.issue.description,
            update.issue.status
          ).run()
        }
        saved.push('issue')
      }
      
      // Save session summary
      if (update.session_summary) {
        await env.DB.prepare(`
          INSERT INTO sessions (id, project_id, summary, validations_passed)
          VALUES (?, ?, ?, ?)
        `).bind(
          crypto.randomUUID(),
          project_id,
          update.session_summary,
          JSON.stringify(update.validated || [])
        ).run()
        saved.push('session')
      }
      
      // Update project timestamp
      await env.DB.prepare(`
        UPDATE projects SET updated_at = datetime('now') WHERE id = ?
      `).bind(project_id).run()
      
      // Invalidate cache
      await env.CACHE.delete(`project:${project_id}`)
      
      return {
        saved,
        message: `Remembered: ${saved.join(', ')}. This will be available in future sessions.`
      }
    }
  }
}
```

### spawner_watch_out

Query relevant sharp edges.

```typescript
// src/tools/sharp-edge.ts

import { z } from 'zod'

const inputSchema = z.object({
  stack: z.array(z.string()),
  situation: z.string().optional(),
  code_context: z.string().optional(),
})

export function watchOutTool(env: Env) {
  return {
    name: 'spawner_watch_out',
    description: 'Query sharp edges (gotchas) relevant to current situation',
    inputSchema,
    
    async execute(input: z.infer<typeof inputSchema>) {
      // 1. Get all edges for this stack
      let edges: SharpEdge[] = []
      for (const stack of input.stack) {
        const stackEdges = await env.SHARP_EDGES.get(`edges_by_stack:${stack}`, 'json')
        if (stackEdges) {
          edges = edges.concat(stackEdges)
        }
      }
      
      // 2. Filter by situation if provided
      if (input.situation) {
        const keywords = input.situation.toLowerCase().split(/\s+/)
        edges = edges.filter(edge => {
          const edgeText = `${edge.summary} ${edge.situation} ${edge.symptoms?.join(' ')}`.toLowerCase()
          return keywords.some(kw => edgeText.includes(kw))
        })
      }
      
      // 3. Check code against detection patterns
      if (input.code_context) {
        edges = edges.map(edge => {
          if (edge.detection_pattern) {
            const matches = new RegExp(edge.detection_pattern).test(input.code_context!)
            return { ...edge, matches_code: matches }
          }
          return edge
        })
        
        // Sort matching edges first
        edges.sort((a, b) => {
          if (a.matches_code && !b.matches_code) return -1
          if (!a.matches_code && b.matches_code) return 1
          return 0
        })
      }
      
      // 4. Emit telemetry
      if (edges.length > 0) {
        await emitEvent(env.DB, 'sharp_edge_surfaced', {
          edges: edges.slice(0, 3).map(e => e.id),
          situation: input.situation,
          had_code_match: edges.some(e => e.matches_code),
        })
      }
      
      return {
        edges: edges.slice(0, 5).map(e => ({
          id: e.id,
          summary: e.summary,
          severity: e.severity,
          situation: e.situation,
          why: e.why,
          solution: e.solution,
          matches_current_code: e.matches_code,
        })),
        
        _instruction: edges.length > 0
          ? `Found ${edges.length} relevant sharp edges. Review these before proceeding - they represent common gotchas for this stack.`
          : 'No sharp edges match this situation. Proceed with normal patterns.'
      }
    }
  }
}
```

### spawner_unstick

Escape hatch analysis.

```typescript
// src/tools/unstick.ts

import { z } from 'zod'

const inputSchema = z.object({
  task_description: z.string(),
  attempts: z.array(z.string()),
  errors: z.array(z.string()),
  current_code: z.string().optional(),
})

export function unstickTool(env: Env) {
  return {
    name: 'spawner_unstick',
    description: 'Analyze stuck situation and provide alternative approaches',
    inputSchema,
    
    async execute(input: z.infer<typeof inputSchema>) {
      const { task_description, attempts, errors } = input
      
      // 1. Analyze the pattern of attempts
      const attemptPatterns = analyzeAttempts(attempts)
      
      // 2. Look for known stuck patterns
      const knownPatterns = await findKnownStuckPatterns(env.SKILLS, errors)
      
      // 3. Generate diagnosis
      const diagnosis = generateDiagnosis(task_description, attemptPatterns, errors)
      
      // 4. Generate alternatives
      const alternatives = await generateAlternatives(
        env.SKILLS,
        task_description,
        attempts,
        knownPatterns
      )
      
      // 5. Determine if reset is recommended
      const shouldReset = attempts.length >= 3 && attemptPatterns.circular
      
      // 6. Emit telemetry
      await emitEvent(env.DB, 'escape_hatch_trigger', {
        task: task_description,
        attempt_count: attempts.length,
        pattern: attemptPatterns.type,
        known_pattern_match: knownPatterns.length > 0,
      })
      
      return {
        diagnosis: diagnosis,
        
        attempts_analyzed: {
          count: attempts.length,
          pattern: attemptPatterns.type,
          circular: attemptPatterns.circular,
        },
        
        alternatives: alternatives.map((alt, i) => ({
          approach: alt.approach,
          tradeoff: alt.tradeoff,
          recommended: i === 0,
          requires_handoff: alt.handoffTo,
        })),
        
        should_reset: shouldReset,
        reset_reason: shouldReset 
          ? 'Code has accumulated patches that make it harder to reason about. Starting fresh with a clear approach will be faster.'
          : null,
        
        _instruction: `
          We've detected a stuck pattern. Here's the situation:
          
          ${diagnosis}
          
          ${alternatives.length} alternative approaches available.
          ${shouldReset ? 'Recommend starting fresh after choosing an approach.' : ''}
          
          Present these options to the user and let them choose direction.
        `
      }
    }
  }
}

function analyzeAttempts(attempts: string[]): AttemptPattern {
  // Detect if attempts are variations of same approach
  const similarity = calculateSimilarity(attempts)
  
  return {
    type: similarity > 0.7 ? 'circular' : 'exploratory',
    circular: similarity > 0.7,
    similarity,
  }
}

function generateDiagnosis(task: string, patterns: AttemptPattern, errors: string[]): string {
  if (patterns.circular) {
    return `We're trying variations of the same approach. The core issue isn't being addressed by these attempts.`
  }
  
  // Look for common error patterns
  const hasHydration = errors.some(e => e.includes('hydration'))
  const hasAsync = errors.some(e => e.includes('async') || e.includes('await'))
  const hasUndefined = errors.some(e => e.includes('undefined'))
  
  if (hasHydration) {
    return 'This is a server/client boundary issue. The component is rendering differently on server vs client.'
  }
  
  if (hasAsync) {
    return 'This involves async/await patterns that may not work in this context (e.g., Client Components).'
  }
  
  if (hasUndefined) {
    return 'Data is undefined at some point in the flow. Check the data fetching sequence and component rendering order.'
  }
  
  return `After ${patterns.similarity > 0.5 ? 'similar' : 'different'} attempts, the task "${task}" remains unresolved.`
}
```

---

## Validation Runner

```typescript
// src/validation/runner.ts

export interface Check {
  id: string
  name: string
  severity: 'critical' | 'error' | 'warning'
  type: 'regex' | 'ast' | 'file'
  pattern?: string | string[]
  rule?: string
  message: string
  autoFix?: boolean
  fixAction?: string
}

export interface ValidationResult {
  checkId: string
  passed: boolean
  severity: 'critical' | 'error' | 'warning'
  message?: string
  line?: number
  fixSuggestion?: string
  autoFixable: boolean
}

export async function runChecks(
  checks: Check[],
  code: string,
  filePath: string
): Promise<ValidationResult[]> {
  const results: ValidationResult[] = []
  
  for (const check of checks) {
    let result: ValidationResult
    
    switch (check.type) {
      case 'regex':
        result = runRegexCheck(check, code)
        break
      case 'ast':
        result = await runAstCheck(check, code, filePath)
        break
      case 'file':
        result = await runFileCheck(check, filePath)
        break
      default:
        continue
    }
    
    results.push(result)
  }
  
  return results
}

function runRegexCheck(check: Check, code: string): ValidationResult {
  const patterns = Array.isArray(check.pattern) ? check.pattern : [check.pattern!]
  
  for (const pattern of patterns) {
    const regex = new RegExp(pattern, 'gm')
    const match = regex.exec(code)
    
    if (match) {
      // Find line number
      const lineNumber = code.slice(0, match.index).split('\n').length
      
      return {
        checkId: check.id,
        passed: false,
        severity: check.severity,
        message: check.message,
        line: lineNumber,
        autoFixable: check.autoFix || false,
        fixSuggestion: check.fixAction,
      }
    }
  }
  
  return {
    checkId: check.id,
    passed: true,
    severity: check.severity,
    autoFixable: false,
  }
}

async function runAstCheck(check: Check, code: string, filePath: string): Promise<ValidationResult> {
  // Only run AST checks for TypeScript/JavaScript files
  if (!filePath.match(/\.(tsx?|jsx?)$/)) {
    return { checkId: check.id, passed: true, severity: check.severity, autoFixable: false }
  }
  
  try {
    const { Project } = await import('ts-morph')
    const project = new Project({ useInMemoryFileSystem: true })
    const sourceFile = project.createSourceFile(filePath, code)
    
    // Run check-specific AST analysis
    // This would be expanded based on check.rule
    
    return {
      checkId: check.id,
      passed: true,
      severity: check.severity,
      autoFixable: false,
    }
  } catch (error) {
    // If AST parsing fails, skip check
    return {
      checkId: check.id,
      passed: true,
      severity: check.severity,
      autoFixable: false,
    }
  }
}
```

---

## Telemetry

```typescript
// src/telemetry/events.ts

type EventType = 
  | 'session_start'
  | 'guardrail_block'
  | 'guardrail_override'
  | 'sharp_edge_surfaced'
  | 'escape_hatch_trigger'
  | 'escape_hatch_outcome'
  | 'skill_handoff'
  | 'session_end'

interface TelemetryEvent {
  id: string
  type: EventType
  projectId?: string
  skillId?: string
  metadata: Record<string, unknown>
  timestamp: string
}

export async function emitEvent(
  db: D1Database,
  type: EventType,
  metadata: Record<string, unknown>,
  projectId?: string,
  skillId?: string
): Promise<void> {
  const event: TelemetryEvent = {
    id: crypto.randomUUID(),
    type,
    projectId,
    skillId,
    metadata,
    timestamp: new Date().toISOString(),
  }
  
  await db.prepare(`
    INSERT INTO telemetry (id, event_type, project_id, skill_id, metadata, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).bind(
    event.id,
    event.type,
    event.projectId,
    event.skillId,
    JSON.stringify(event.metadata),
    event.timestamp
  ).run()
}

// Aggregation queries for analysis
export async function getGuardrailStats(db: D1Database, days: number = 30) {
  return db.prepare(`
    SELECT 
      json_extract(metadata, '$.check_id') as check_id,
      json_extract(metadata, '$.severity') as severity,
      COUNT(*) as count
    FROM telemetry
    WHERE event_type = 'guardrail_block'
      AND created_at > datetime('now', '-' || ? || ' days')
    GROUP BY check_id, severity
    ORDER BY count DESC
  `).bind(days).all()
}

export async function getEscapeHatchStats(db: D1Database, days: number = 30) {
  return db.prepare(`
    SELECT 
      json_extract(metadata, '$.pattern') as pattern,
      COUNT(*) as triggers,
      AVG(json_extract(metadata, '$.attempt_count')) as avg_attempts
    FROM telemetry
    WHERE event_type = 'escape_hatch_trigger'
      AND created_at > datetime('now', '-' || ? || ' days')
    GROUP BY pattern
    ORDER BY triggers DESC
  `).bind(days).all()
}
```

---

## Directory Structure

```
spawner-v2/
├── src/
│   ├── index.ts                 # Main worker entry
│   ├── types.ts                 # Type definitions
│   │
│   ├── tools/
│   │   ├── context.ts           # spawner_load
│   │   ├── validate.ts          # spawner_validate
│   │   ├── remember.ts          # spawner_remember
│   │   ├── sharp-edge.ts        # spawner_watch_out
│   │   └── unstick.ts           # spawner_unstick
│   │
│   ├── validation/
│   │   ├── runner.ts            # Validation engine
│   │   ├── checks/
│   │   │   ├── security.ts      # Security checks
│   │   │   ├── patterns.ts      # Pattern checks
│   │   │   └── production.ts    # Production readiness
│   │   └── ast/
│   │       └── typescript.ts    # TypeScript AST helpers
│   │
│   ├── skills/
│   │   ├── loader.ts            # Load skills from KV
│   │   └── matcher.ts           # Match skills to context
│   │
│   ├── telemetry/
│   │   ├── events.ts            # Event emission
│   │   └── aggregation.ts       # Stats queries
│   │
│   └── db/
│       ├── projects.ts          # Project CRUD
│       ├── sessions.ts          # Session management
│       └── issues.ts            # Issue tracking
│
├── migrations/
│   └── 001_initial.sql          # D1 schema
│
├── skills/                       # Skill definitions (copied to KV)
│   ├── core/
│   │   ├── nextjs-app-router/
│   │   ├── supabase-backend/
│   │   └── ...
│   ├── integration/
│   └── pattern/
│
├── wrangler.toml                # Cloudflare config
├── package.json
└── tsconfig.json
```

---

## Deployment

### wrangler.toml

```toml
name = "spawner-mcp"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[vars]
ENVIRONMENT = "production"

[[d1_databases]]
binding = "DB"
database_name = "spawner-db"
database_id = "xxx"

[[kv_namespaces]]
binding = "SKILLS"
id = "xxx"

[[kv_namespaces]]
binding = "SHARP_EDGES"
id = "xxx"

[[kv_namespaces]]
binding = "CACHE"
id = "xxx"

[ai]
binding = "AI"  # Optional
```

### Deployment Commands

```bash
# Create D1 database
wrangler d1 create spawner-db

# Run migrations
wrangler d1 execute spawner-db --file=./migrations/001_initial.sql

# Create KV namespaces
wrangler kv:namespace create SKILLS
wrangler kv:namespace create SHARP_EDGES
wrangler kv:namespace create CACHE

# Upload skills to KV
node scripts/upload-skills.js

# Deploy worker
wrangler deploy
```

---

## Cost Estimates

Based on Cloudflare pricing (as of 2024):

| Resource | Free Tier | Paid Tier | Estimated Monthly Cost |
|----------|-----------|-----------|------------------------|
| Workers requests | 100k/day | $0.30/million | ~$1-5 |
| D1 reads | 5M/day | $0.001/million | ~$1-2 |
| D1 writes | 100k/day | $0.001/million | ~$0.50 |
| D1 storage | 5GB | $0.75/GB | ~$1 |
| KV reads | 100k/day | $0.50/million | ~$0.50 |
| KV storage | 1GB | $0.50/GB | ~$0.50 |

**Estimated total: $5-10/month** for moderate usage (1000 active users)

Heavy usage (10k+ users) might reach $20-50/month.
