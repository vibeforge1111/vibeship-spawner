# Spawner V2 Architecture Review (V1 Format)

**Reviewed Against:** code-architecture-review-v1 skill (claude-skills-generator format)
**Date:** 2025-12-12
**Codebase:** vibeship-orchestrator/spawner-v2

---

## Executive Summary

Spawner V2 is a Cloudflare Workers-based MCP server providing AI development tools. The architecture demonstrates **good separation of concerns** at the module level but has **significant issues with coupling, testability, and the single responsibility principle** in the main entry point.

**Overall Assessment:** Architecture is functional but has structural issues that will create friction as the codebase grows. The Iron Law is partially violated: hidden dependencies exist through global imports, and changes in tool implementations require edits to the main router.

---

## The Iron Law Check

> **NEVER APPROVE ARCHITECTURE THAT CREATES HIDDEN DEPENDENCIES OR MAKES CHANGE EXPENSIVE**

### Hidden Dependencies Found

1. **Environment Bindings (`Env`)**: Every tool receives the full `Env` object containing DB, SKILLS, SHARP_EDGES, CACHE, and AI bindings. Tools only use what they need, but the interface doesn't express this.

   ```typescript
   // src/tools/validate.ts - receives full Env but only uses SKILLS KV
   export async function executeValidate(env: Env, ...) {
     // Only touches env.SKILLS, but signature suggests it might touch anything
   }
   ```

2. **Global Type Imports**: Types are imported from a central `types.ts` rather than co-located with their consumers. Changes to types require checking all importers.

3. **Switch-Case Routing in index.ts**: The main entry point has a 130+ line switch statement routing tool calls. Adding a tool requires editing this file.

### Change Cost Analysis

| Change | Files Touched | Risk |
|--------|--------------|------|
| Add new tool | index.ts, tools/index.ts, new tool file | Medium |
| Modify tool interface | types.ts, tool file, index.ts | High |
| Add new check type | validation/checks/, runner.ts | Low |
| Change database schema | types.ts, db/*.ts, tools using data | High |

---

## Dependency Graph Analysis

```
index.ts (entry point)
    |
    +-- tools/index.ts (barrel export)
    |       |
    |       +-- context.ts --> db/, skills/
    |       +-- validate.ts --> validation/
    |       +-- remember.ts --> db/
    |       +-- sharp-edge.ts --> skills/sharp-edges.ts
    |       +-- unstick.ts --> (pure logic)
    |       +-- templates.ts --> (static data)
    |       +-- skills.ts --> skills/loader.ts
    |       +-- plan.ts --> db/projects.ts, skills/
    |       +-- analyze.ts --> validation/, skills/
    |
    +-- db/index.ts (barrel export)
    |       +-- projects.ts (Project CRUD)
    |       +-- sessions.ts (Session CRUD)
    |       +-- decisions.ts (Decision CRUD)
    |       +-- issues.ts (Issue CRUD)
    |
    +-- validation/index.ts
    |       +-- runner.ts
    |       +-- checks/*.ts
    |
    +-- skills/
            +-- loader.ts (KV access)
            +-- sharp-edges.ts (edge matching)
```

### Circular Dependencies

**None detected.** The dependency graph is acyclic. This is a strength.

### Coupling Assessment

- **db/ modules**: Well isolated. Each entity has its own file. Good.
- **tools/ modules**: Each tool imports what it needs. Acceptable coupling.
- **validation/ modules**: Clean separation between runner and check implementations.
- **index.ts**: **High coupling**. Knows about every tool, routes by name, casts arguments manually.

---

## Separation of Concerns Evaluation

### Business Logic Separate from Presentation?

**Partially.** Tool handlers contain both business logic and MCP response formatting.

```typescript
// src/tools/context.ts
export async function executeContext(...): Promise<ContextOutput> {
  // Business logic: load project, match skills
  // Also includes: _instruction field for Claude (presentation concern)
  return {
    project: { ... },
    skills: [ ... ],
    _instruction: "Use these skills..." // Presentation leaked into domain
  };
}
```

The `_instruction` field mixing domain data with LLM instructions violates separation.

### Data Access Isolated?

**Yes.** The `db/` module cleanly isolates D1 operations. Tools don't contain raw SQL.

```typescript
// Good: db/projects.ts handles all SQL
export async function loadProject(db: D1Database, projectId: string, userId: string)

// Tools call this, don't write SQL themselves
const project = await loadProject(env.DB, projectId, userId);
```

### Side Effects Contained?

**Mostly.** Database writes and KV reads are contained in appropriate modules. However, telemetry is scattered (referenced in types but implementation unclear from the codebase read).

---

## Single Responsibility Analysis

### Violations Found

1. **index.ts** - Has at least 4 responsibilities:
   - HTTP request handling
   - CORS management
   - JSON-RPC protocol parsing
   - Tool routing and argument casting

   **Should be:** Split into `http.ts`, `cors.ts`, `mcp-router.ts`.

2. **types.ts** - Contains:
   - Environment bindings
   - Database entities (4 types)
   - Telemetry types
   - Skills system types
   - Sharp edges types
   - Validation types
   - Tool input/output types (6 tools)
   - Cache types

   **Should be:** Split by domain: `db/types.ts`, `skills/types.ts`, `validation/types.ts`, etc.

### Modules That Pass

- `db/projects.ts` - Only handles Project CRUD
- `db/sessions.ts` - Only handles Session CRUD
- `validation/runner.ts` - Only runs checks on code
- `skills/loader.ts` - Only loads skills from KV

---

## Dependency Direction Analysis

### Do Dependencies Point Toward Stability?

**Analysis:**
- Stable: `types.ts`, `db/`, `validation/checks/`
- Volatile: `tools/`, `index.ts`

The direction is **mostly correct**. Tools depend on stable database and validation modules. However:

```
index.ts --> tools/* (correct: volatile depends on stable)
tools/* --> types.ts (correct: volatile depends on stable)
types.ts is monolithic (problem: all changes ripple everywhere)
```

### Can You Swap Implementations?

**No.** There are no interfaces. Everything is concrete.

```typescript
// Cannot swap database implementation
// db/projects.ts directly uses D1Database type
export async function loadProject(db: D1Database, ...)

// Should be:
interface ProjectRepository {
  load(id: string, userId: string): Promise<Project | null>;
}
```

---

## Anti-Pattern Detection

### God Module

**Found:** `src/index.ts` (425 lines)

This file handles HTTP, CORS, JSON-RPC parsing, initialization, tool listing, and tool execution routing. It knows about every tool and how to call each one.

**Recommendation:** Extract:
- `handleCors()` to `cors.ts`
- `handleMcpRequest()` to `mcp-router.ts`
- Tool routing to a registry pattern

### Shotgun Surgery Risk

**Found:** Adding a new tool requires editing:
1. `tools/new-tool.ts` (create file)
2. `tools/index.ts` (add export)
3. `index.ts` (add to TOOLS array, add switch case, add argument parsing)

**Recommendation:** Implement tool registry pattern:
```typescript
// tools/registry.ts
const registry = new Map<string, ToolExecutor>();
export const registerTool = (name: string, executor: ToolExecutor) => ...
```

### Leaky Abstraction

**Found:** The `_instruction` field in tool outputs:
```typescript
export interface ContextOutput {
  project: { ... };
  _instruction: string;  // LLM-specific, leaks into domain
}
```

This leaks the "Claude is consuming this" detail into every tool output type.

### Utils/Helpers Dumping Ground

**Not found.** The codebase avoids generic `utils.ts` files. Each module has specific purpose.

---

## Positive Patterns Observed

### Layered Structure

The codebase has clear layers:
```
tools/      (application layer - use cases)
db/         (infrastructure layer - persistence)
validation/ (domain layer - business rules)
skills/     (infrastructure layer - external data)
```

### Explicit Error Handling

All async operations use try/catch with informative error messages:
```typescript
try {
  const body = await request.json() as McpRequest;
  ...
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  return new Response(JSON.stringify({ error: { message: `Parse error: ${message}` } }), ...);
}
```

### Repository Pattern (Partial)

The `db/` module approaches the repository pattern by isolating all database operations:
```typescript
// All project operations in one place
db/projects.ts: loadProject, createProject, findProjectByDescription, ...
```

---

## Verification Checklist

| Check | Status | Notes |
|-------|--------|-------|
| Can each module be tested in isolation? | PARTIAL | db/* and validation/* can. tools/* need Env mocking. |
| Are dependencies explicit (injected, not imported globals)? | NO | Env passed but contains everything. No DI. |
| Does dependency direction point toward stability? | MOSTLY | types.ts is too monolithic. |
| Is there clear separation between layers? | PARTIAL | tools layer mixes domain and presentation. |
| Can you explain each module's purpose in one sentence? | YES | All modules have clear, singular purposes except index.ts. |
| Are there no circular dependencies? | YES | Dependency graph is clean. |
| Is the blast radius of changes contained? | NO | types.ts and index.ts are change magnets. |

**Result:** 3/7 pass, 2/7 partial, 2/7 fail

---

## Priority Recommendations

### Critical (Address Now)

1. **Split index.ts** into separate concerns (http, cors, mcp-router)
2. **Remove `_instruction` from domain types** - return it at the MCP response level instead

### High (Address Soon)

3. **Split types.ts by domain** - Each module owns its types
4. **Implement tool registry** - Eliminate switch statement, make adding tools a single-file change

### Medium (Address When Convenient)

5. **Define interfaces for repositories** - Enable testability and swappability
6. **Add explicit dependency types** - Each tool declares what parts of Env it needs

---

## Conclusion

Spawner V2 has a solid foundation with good module separation in the data and validation layers. However, the main entry point has accumulated too many responsibilities, and the type system is too centralized. The codebase will become increasingly painful to modify as more tools are added.

The architecture is **acceptable for current scale** but will not scale well past 15-20 tools without refactoring the routing and type organization.

**Recommendation:** Prioritize splitting index.ts before adding more tools. This is a low-risk refactor with high payoff.

---

*Review conducted using the code-architecture-review-v1 skill methodology.*
