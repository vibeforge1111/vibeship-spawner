# Spawner MCP Improvements

Consolidated from `suggestions_v1.md` and `suggestions_v2.md` audits.

---

## P0 - Critical (Blocks Adoption)

### 1. `spawner_templates` - Wrong Tool Reference
**Status:** 🔴 BUG
**Effort:** 5 min

References non-existent `spawner_create` instead of `spawner_plan`.

```typescript
// File: spawner-v2/src/tools/templates.ts
// BEFORE:
'Use `spawner_create` with template="<id>" to start a new project.'

// AFTER:
'Use `spawner_plan` with action="create" and template="<id>" to start a new project.'
```

---

### 2. `spawner_remember` - Requires project_id
**Status:** 🔴 CRITICAL
**Effort:** 30 min

Vibe coders don't have project_id on first call.

```typescript
// File: spawner-v2/src/tools/remember.ts

// Schema: Make project_id optional
project_id: z.string().optional()

// Tool definition: Remove from required
required: ['update']

// Handler: Resolve project_id
const projectId = input.project_id || await resolveProjectId(env, userId);

// Add helper function
async function resolveProjectId(env: Env, userId: string): Promise<string> {
  // Check session cache
  const cached = await env.CACHE.get(`session:${userId}`, 'json');
  if (cached?.project?.id) return cached.project.id;

  // Create temporary project
  return createProject(env.DB, userId, 'Temporary Project', 'Auto-created for remembering');
}
```

---

### 3. `spawner_watch_out` (was: spawner_sharp_edge) - Optional stack array
**Status:** ✅ FIXED + RENAMED
**Effort:** 15 min

"The tool to help users avoid gotchas IS ITSELF A GOTCHA." → Now fixed!

```typescript
// File: spawner-v2/src/tools/sharp-edge.ts

// Schema: Make stack optional
stack: z.array(z.string()).optional()

// Tool definition: Nothing required
required: []

// Handler: Default to common stack
const stack = input.stack?.length ? input.stack : ['nextjs', 'react', 'typescript', 'supabase'];
```

---

### 4. `spawner_skills` - Requires action param
**Status:** 🔴 CRITICAL
**Effort:** 10 min

Users don't know what action they want - they want to "find skills."

```typescript
// File: spawner-v2/src/tools/skills.ts

// Tool definition: Nothing required
required: []

// Handler: Default to search
const action = input.action || 'search';
const searchQuery = input.query || input.name || '';
```

---

### 5. `spawner_unstick` - Requires structured attempts/errors
**Status:** 🟠 HIGH
**Effort:** 30 min

Stuck users shouldn't have to format frustration into arrays.

```typescript
// File: spawner-v2/src/tools/unstick.ts

// Schema: Add flexible situation field, make arrays optional
situation: z.string().optional().describe('Describe what\'s happening in your own words'),
attempts: z.array(z.string()).optional(),
errors: z.array(z.string()).optional(),

// Tool definition: Only task_description required
required: ['task_description']

// Handler: Parse situation into attempts/errors if not provided
if (!input.attempts?.length && !input.errors?.length && input.situation) {
  const parsed = parseUnstructuredSituation(input.situation);
  attempts = parsed.attempts;
  errors = parsed.errors;
}
```

---

## P1 - High (Improves Experience)

### 6. `spawner_validate` - Better Error Messages
**Status:** 🟠 NEEDS WORK
**Effort:** 20 min

Raw Zod errors exposed to users.

```typescript
// File: spawner-v2/src/tools/validate.ts

// Wrap validation errors
const parsed = validateInputSchema.safeParse(args);
if (!parsed.success) {
  return {
    passed: false,
    error: "I need the code you want me to check",
    what_to_do: "Pass the code content and the file path",
    example: 'spawner_validate({ code: "your code", file_path: "src/app.tsx" })',
    _instruction: "Show the user the example format.",
  };
}
```

---

### 7. `spawner_remember` - Rich Success Response
**Status:** ✅ FIXED
**Effort:** 15 min

Current response is minimal `{ saved: [...] }`.

```typescript
// File: spawner-v2/src/tools/remember.ts

// Improve response
return {
  success: true,
  saved,
  what_happened: `Saved your ${saved.join(' and ')} to project memory`,
  what_this_means: "I'll remember this across sessions",
  next_steps: [
    "Continue building - I'll reference this decision when relevant",
    "Use spawner_load to see all saved decisions",  // renamed from spawner_context
    "Use spawner_remember again to save more context"
  ],
};
```

---

### 8. Tool Renames for Better UX
**Status:** ✅ DONE
**Effort:** 30 min

Renamed tools for better vibe coder understanding:
- `spawner_context` → `spawner_load` (more intuitive action)
- `spawner_sharp_edge` → `spawner_watch_out` (clearer intent)

---

### 9. All Tools - Consistent Response Envelope (SKIPPED)
**Status:** ⏭️ SKIPPED
**Effort:** 1 hour

Not every tool needs the full envelope - only where it makes sense.
Most tools already have good contextual responses.

---

## Implementation Order

| # | Tool | Fix | Time | Status |
|---|------|-----|------|--------|
| 1 | templates | Wrong tool reference | 5 min | ✅ |
| 2 | remember | Optional project_id | 30 min | ✅ |
| 3 | watch_out | Optional stack + rename | 15 min | ✅ |
| 4 | skills | Default action | 10 min | ✅ |
| 5 | unstick | Accept situation | 30 min | ✅ |
| 6 | validate | Better errors | 20 min | ✅ |
| 7 | remember | Rich response | 15 min | ✅ |
| 8 | load | Rename from context | 15 min | ✅ |

**All P0 and P1 fixes implemented! Tool renames complete!**

---

## Testing Checklist

After implementing:

- [ ] `spawner_plan({ idea: "a todo app" })` - works without config
- [ ] `spawner_remember({ update: { decision: {...} } })` - works without project_id
- [ ] `spawner_watch_out({})` - returns common gotchas (renamed from sharp_edge)
- [ ] `spawner_skills({})` - defaults to search
- [ ] `spawner_unstick({ task_description: "I'm stuck on auth" })` - works without arrays
- [ ] `spawner_templates({})` - references spawner_plan, not spawner_create
- [ ] `spawner_load({})` - loads context (renamed from context)
- [ ] All error messages include what_to_do and example

---

*Combined from suggestions_v1.md and suggestions_v2.md*
