# Spawner MCP Audit Report V2

**Audit Date:** December 2024
**Audited Against:** `mcp-product-v1` skill (claude-skills-generator framework)
**Focus Areas:** Iron Law compliance, vibe coder experience, first-call value, error messages, response quality

---

## Executive Summary

| Tool | Iron Law | First Call | Error UX | Response Quality | Overall |
|------|----------|------------|----------|------------------|---------|
| `spawner_plan` | PASS | PASS | OK | GOOD | PASS |
| `spawner_analyze` | PASS | PASS | OK | GOOD | PASS |
| `spawner_context` | PASS | PASS | OK | GOOD | PASS |
| `spawner_validate` | WARN | WARN | NEEDS WORK | OK | NEEDS WORK |
| `spawner_remember` | FAIL | FAIL | NEEDS WORK | MINIMAL | CRITICAL |
| `spawner_sharp_edge` | FAIL | FAIL | OK | GOOD | CRITICAL |
| `spawner_unstick` | FAIL | FAIL | OK | GOOD | CRITICAL |
| `spawner_templates` | PASS | PASS | OK | BUG | NEEDS WORK |
| `spawner_skills` | FAIL | FAIL | NEEDS WORK | OK | CRITICAL |

**Summary:** 3 tools PASS, 2 NEED WORK, 4 are CRITICAL (block vibe coder adoption)

---

## Iron Law Violations

> "FIRST-CALL VALUE: EVERY TOOL MUST RETURN VALUE ON THE FIRST CALL WITHOUT REQUIRING IDS OR CONFIGURATION THE USER DOESN'T HAVE YET"

### CRITICAL: `spawner_remember`

**File:** `spawner-v2/src/tools/remember.ts:88`

```typescript
required: ['project_id', 'update'],
```

**Problem:** Requires `project_id` - vibe coders don't have this on first call.

**Impact:** Tool is completely unusable for new users. They'll get an error and think Spawner is broken.

**Fix:**
```typescript
// Make project_id optional
required: ['update'],

// In handler - create temp project or use session context
const projectId = input.project_id || await getOrCreateProjectFromSession(env, userId);
```

---

### CRITICAL: `spawner_sharp_edge`

**File:** `spawner-v2/src/tools/sharp-edge.ts:98`

```typescript
required: ['stack'],
```

**Problem:** Requires `stack` array - new users don't know their stack yet.

**Impact:** The tool designed to HELP people avoid gotchas IS ITSELF A GOTCHA.

**Fix:**
```typescript
// Make stack optional with smart default
required: [],

// In handler
const stack = input.stack?.length ? input.stack : ['nextjs', 'react', 'typescript'];
```

---

### CRITICAL: `spawner_unstick`

**File:** `spawner-v2/src/tools/unstick.ts:148`

```typescript
required: ['task_description', 'attempts', 'errors'],
```

**Problem:** When users are stuck, asking them to structure attempts and errors arrays adds friction.

**Impact:** Stuck users need to format their frustration into arrays before getting help. Most will give up.

**Fix:**
```typescript
// Accept free-form situation description
required: ['task_description'],

// Make attempts/errors optional - extract from situation if not provided
properties: {
  task_description: { description: "What you're trying to do" },
  situation: { description: "Describe what's happening (optional - can replace attempts/errors)" },
  attempts: { description: "Optional: specific things you've tried" },
  errors: { description: "Optional: specific error messages" }
}
```

---

### CRITICAL: `spawner_skills`

**File:** `spawner-v2/src/tools/skills.ts:139`

```typescript
required: ['action'],
```

**Problem:** Forces users to choose between 'search', 'list', 'get', 'squad' before they can do anything.

**Impact:** New users don't know what action they want. They just want to "find skills for my project."

**Fix:**
```typescript
// Default to search
required: [],

// In handler
const action = input.action || 'search';
const query = input.query || input.name; // Allow flexible input
```

---

## Response Quality Issues

### BUG: `spawner_templates` - Wrong Tool Reference

**File:** `spawner-v2/src/tools/templates.ts:142`

```typescript
lines.push('Use `spawner_create` with template="<id>" to start a new project.');
```

**Problem:** `spawner_create` DOES NOT EXIST. We merged it into `spawner_plan`.

**Impact:** Users following these instructions get "tool not found" errors.

**Fix:**
```typescript
lines.push('Use `spawner_plan` with action="create" and template="<id>" to start a new project.');
```

---

### NEEDS WORK: `spawner_validate` - Minimal Error Response

**File:** `spawner-v2/src/tools/validate.ts:68-76`

```typescript
return {
  passed: false,
  summary: `Invalid input: ${parsed.error.message}`,
  // ...
  _instruction: 'Please provide valid code and file_path parameters.',
};
```

**Problem:** Raw Zod error message exposed. Generic instruction doesn't help.

**Better:**
```typescript
return {
  passed: false,
  error: "I need the code you want me to check",
  what_to_do: "Pass the code content and the file path where it lives",
  example: 'spawner_validate({ code: "your code", file_path: "src/app.tsx" })',
  _instruction: "The user needs to provide code to validate. Show them the example.",
};
```

---

### NEEDS WORK: `spawner_remember` - Minimal Success Response

**File:** `spawner-v2/src/tools/remember.ts:164-169`

```typescript
return {
  saved,
  message: saved.length > 0
    ? `Remembered: ${saved.join(', ')}. This will be available in future sessions.`
    : 'Nothing to save. Provide a decision, issue, or session_summary.',
};
```

**Problem:** No `what_happened`, no `next_steps`, no context.

**Better:**
```typescript
return {
  success: true,
  saved,
  what_happened: `Saved your ${saved.join(' and ')} to project memory`,
  what_this_means: "I'll remember this across sessions. Next time you load context, this decision will be included.",
  next_steps: [
    "Continue building - I'll reference this decision when relevant",
    "Use spawner_context to see all saved decisions",
    "Use spawner_remember again to save more context"
  ],
};
```

---

## Good Patterns Found

### `spawner_plan` - Exemplary First-Call Experience

**No required params for discover action:**
```typescript
action: z.enum(['discover', 'recommend', 'create']).default('discover')
```

**Smart defaults:**
- Action defaults to 'discover'
- Template auto-detected from idea
- Skill level auto-detected from signals

**Rich responses with next steps:**
```typescript
next_steps: [
  'Ask 1-2 of the suggested questions',
  'Call spawner_plan again with answers in context',
],
```

**This is the model other tools should follow.**

---

### `spawner_analyze` - Good No-Config Start

**All params optional:**
```typescript
files: z.array(z.string()).optional()
code_samples: z.array(...).optional()
dependencies: z.record(z.string()).optional()
question: z.string().optional()
```

Works with whatever the user has available.

---

### `spawner_context` - Good Fallback Behavior

**Handles missing project gracefully:**
```typescript
if (!project_id && !project_description) {
  // Check cache for recent project
  // Return helpful message if nothing found
  return {
    message: 'No project context. Describe what you\'re building or provide a project_id.',
  };
}
```

---

## Tool Naming Audit

| Tool | Type | Name Quality | Notes |
|------|------|--------------|-------|
| `spawner_plan` | Goal | GOOD | Users think "I want to plan my project" |
| `spawner_analyze` | Goal | GOOD | "Analyze my codebase" |
| `spawner_context` | Technical | OK | Could be `spawner_start` or `spawner_load` |
| `spawner_validate` | Goal | GOOD | "Validate my code" |
| `spawner_remember` | Goal | GOOD | "Remember this decision" |
| `spawner_sharp_edge` | Technical | OK | Vibe coders don't know "sharp edges" |
| `spawner_unstick` | Goal | EXCELLENT | "I'm stuck" - perfect user language |
| `spawner_templates` | Technical | OK | "Show me templates" works |
| `spawner_skills` | Technical | OK | Might confuse with "skill level" |

**Suggested Renames:**
- `spawner_sharp_edge` → `spawner_gotchas` or `spawner_watch_out`
- `spawner_context` → `spawner_start` (more intuitive for session start)

---

## Priority Fix Order

### P0 - Blocking Adoption (Fix Immediately)

1. **`spawner_templates`** - Fix wrong tool reference (5 min)
2. **`spawner_remember`** - Make `project_id` optional (30 min)
3. **`spawner_sharp_edge`** - Make `stack` optional with defaults (30 min)
4. **`spawner_skills`** - Default action to 'search' (15 min)
5. **`spawner_unstick`** - Accept free-form situation (45 min)

### P1 - Improves Experience

6. **`spawner_validate`** - Improve error messages with examples (30 min)
7. **`spawner_remember`** - Add rich success response (30 min)
8. **All tools** - Ensure `what_happened` + `next_steps` in every response (2 hrs)

### P2 - Polish

9. Consider renaming `spawner_sharp_edge` → `spawner_gotchas`
10. Add `dry_run` option to `spawner_plan` action="create"
11. Add progress feedback for long operations

---

## Testing Checklist

After implementing fixes, verify:

- [ ] New user can call `spawner_plan` with just an idea
- [ ] New user can call `spawner_remember` without project_id
- [ ] New user can call `spawner_sharp_edge` without stack array
- [ ] New user can call `spawner_skills` without specifying action
- [ ] New user can call `spawner_unstick` with just a description
- [ ] Following `spawner_templates` instructions works (spawner_plan, not spawner_create)
- [ ] All error messages tell users what to do (not just what failed)
- [ ] All success responses include what_happened and next_steps

---

## Appendix: mcp-product-v1 Principles Applied

| Principle | Current State | Violations |
|-----------|---------------|------------|
| **Iron Law** (first-call value) | 4 tools violate | remember, sharp_edge, unstick, skills |
| **Goal-based naming** | Mostly good | sharp_edge is technical jargon |
| **Progressive disclosure** | Good in plan | Others expose too much upfront |
| **Explain as you go** | Inconsistent | remember has minimal response |
| **Human error messages** | Needs work | validate exposes Zod errors |
| **No ID before value** | 4 violations | Same as Iron Law |

---

## Recommended Code Changes

### 1. Fix `spawner_templates` (5 min)

```typescript
// spawner-v2/src/tools/templates.ts:142
// BEFORE:
lines.push('Use `spawner_create` with template="<id>" to start a new project.');

// AFTER:
lines.push('Use `spawner_plan` with action="create" and template="<id>" to start a new project.');
```

### 2. Fix `spawner_remember` (30 min)

```typescript
// spawner-v2/src/tools/remember.ts

// Change schema
export const rememberInputSchema = z.object({
  project_id: z.string().optional().describe(
    'Project ID (optional - will use current session or create temporary)'
  ),
  // ... rest unchanged
});

// Change required in tool definition
required: ['update'],  // Remove project_id

// In handler, add project resolution
const projectId = input.project_id || await resolveProjectId(env, userId);

async function resolveProjectId(env: Env, userId: string): Promise<string> {
  // Check session cache first
  const cached = await env.CACHE.get<{ project: { id: string } }>(`session:${userId}`, 'json');
  if (cached?.project?.id) return cached.project.id;

  // Create temporary project
  const tempId = `temp-${Date.now().toString(36)}`;
  // ... create temp project
  return tempId;
}
```

### 3. Fix `spawner_sharp_edge` (30 min)

```typescript
// spawner-v2/src/tools/sharp-edge.ts

// Change schema
export const sharpEdgeInputSchema = z.object({
  stack: z.array(z.string()).optional().describe(
    'Technology stack (optional - defaults to common web stack)'
  ),
  // ... rest unchanged
});

// Remove from required
required: [],  // Nothing required!

// In handler
const stack = input.stack?.length ? input.stack : ['nextjs', 'react', 'typescript', 'supabase'];
```

### 4. Fix `spawner_skills` (15 min)

```typescript
// spawner-v2/src/tools/skills.ts

// Remove from required
required: [],  // Nothing required!

// In handler, default action
const { action = 'search', query, name, ... } = parsed.data;

// Allow name as query fallback
const searchQuery = query || name;
```

### 5. Fix `spawner_unstick` (45 min)

```typescript
// spawner-v2/src/tools/unstick.ts

// New schema with flexible input
export const unstickInputSchema = z.object({
  task_description: z.string().describe(
    'What you\'re trying to accomplish'
  ),
  situation: z.string().optional().describe(
    'Describe the problem in your own words (alternative to attempts/errors)'
  ),
  attempts: z.array(z.string()).optional().describe(
    'List of approaches you\'ve tried (optional)'
  ),
  errors: z.array(z.string()).optional().describe(
    'Error messages encountered (optional)'
  ),
  // ... rest unchanged
});

// Only task_description required
required: ['task_description'],

// In handler, parse situation into attempts/errors if structured input not provided
function parseUnstructuredSituation(situation: string): { attempts: string[], errors: string[] } {
  const attempts: string[] = [];
  const errors: string[] = [];

  // Look for "tried" phrases
  const triedMatches = situation.match(/tried\s+([^.!?]+)/gi);
  if (triedMatches) attempts.push(...triedMatches);

  // Look for error patterns
  const errorMatches = situation.match(/error:?\s+([^.!?]+)/gi);
  if (errorMatches) errors.push(...errorMatches);

  return { attempts, errors };
}
```

---

*Audit conducted against mcp-product-v1 skill from claude-skills-generator framework*
