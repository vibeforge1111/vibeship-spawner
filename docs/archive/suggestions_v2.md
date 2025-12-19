# Spawner V2 Tool Audit Report

**Audit Date:** December 2024
**Audit Criteria:** MCP Product Design Skill (`mcp-product`)
**Focus:** Vibe coder experience, first-call friction, error messages, next steps

---

## Executive Summary

Audited all 9 Spawner tools against the mcp-product skill principles. Found **2 critical issues** that would block vibe coder adoption, **4 high-priority improvements**, and several opportunities for better UX.

### Quick Scores

| Tool | Score | Status |
|------|-------|--------|
| `spawner_plan` | ✅ Good | Ready for vibe coders |
| `spawner_analyze` | ✅ Good | Ready for vibe coders |
| `spawner_context` | ⚠️ OK | Works but could improve |
| `spawner_validate` | ⚠️ Needs Work | Has required params |
| `spawner_remember` | ❌ Broken | Requires project_id |
| `spawner_sharp_edge` | ❌ Broken | Requires stack array |
| `spawner_unstick` | ⚠️ Needs Work | Requires attempts/errors |
| `spawner_templates` | 🐛 Bug | ReferenAces wrong tool |
| `spawner_skills` | ⚠️ Needs Work | Requires action param |

---

## Critical Issues (Fix Immediately)

### 1. `spawner_remember` - Requires `project_id`

**File:** `spawner-v2/src/tools/remember.ts`

**Problem:**
```typescript
required: ["project_id", "decision_type", "summary"]
```

Vibe coders calling for the first time don't have a `project_id`. This is exactly the "ID Before Value" anti-pattern from the mcp-product skill.

**Impact:** Tool is unusable for new users. They'll get an error on first call and think Spawner is broken.

**Fix:**
```typescript
// Make project_id optional
required: ["decision_type", "summary"]

// In handler, generate temp project if not provided
const projectId = args.project_id || await createTempProject(env);
```

---

### 2. `spawner_sharp_edge` - Requires `stack` array

**File:** `spawner-v2/src/tools/sharp-edge.ts`

**Problem:**
```typescript
required: ["stack"]
```

New users don't know their stack yet. They're exploring. Requiring an array of technologies blocks discovery.

**Impact:** The tool designed to help people avoid gotchas is itself a gotcha.

**Fix:**
```typescript
// Make stack optional, default to common stacks or all
required: []

// In handler
const stack = args.stack?.length ? args.stack : ["nextjs", "react", "typescript"];
```

---

## High Priority Issues

### 3. `spawner_templates` - Wrong Tool Reference

**File:** `spawner-v2/src/tools/templates.ts`

**Problem:**
```typescript
how_to_use: "Use spawner_create with template_id to create a project"
```

`spawner_create` doesn't exist anymore - we merged it into `spawner_plan`.

**Impact:** Users following the instructions will get "tool not found" errors.

**Fix:**
```typescript
how_to_use: "Use spawner_plan with template_id to create a project"
```

---

### 4. `spawner_skills` - Requires `action` param

**File:** `spawner-v2/src/tools/skills.ts`

**Problem:**
```typescript
required: ["action"]
```

Users need to choose between "search" and "get" before they can do anything.

**Recommendation:** Default to "search" since that's what explorers want.

**Fix:**
```typescript
required: []

// In handler
const action = args.action || "search";
```

---

### 5. `spawner_validate` - Requires `code` and `file_path`

**File:** `spawner-v2/src/tools/validate.ts`

**Current:**
```typescript
required: ["code", "file_path"]
```

**Issue:** Both required is fine for the use case, but error messages could be friendlier.

**Recommendation:** Keep required, but improve error response:
```typescript
// Instead of Zod error
return {
  error: "I need the code you want me to check",
  what_to_do: "Pass the code content and the file path where it lives",
  example: 'spawner_validate(code="your code", file_path="src/app.tsx")'
};
```

---

### 6. `spawner_unstick` - Requires `attempts` and `errors`

**File:** `spawner-v2/src/tools/unstick.ts`

**Problem:**
```typescript
required: ["attempts", "errors"]
```

When users are stuck, asking them to structure their attempts and errors is extra friction.

**Recommendation:**
```typescript
required: []

// Accept free-form description instead
properties: {
  situation: {
    type: "string",
    description: "Describe what you're trying to do and what's not working"
  },
  attempts: { /* optional */ },
  errors: { /* optional */ }
}
```

---

## Good Patterns Found

### `spawner_plan` ✅

- No required params for `discover` action
- Smart defaults (action defaults to "discover")
- Progressive disclosure (simple → detailed)
- Returns next steps

### `spawner_analyze` ✅

- Works with just files/package.json
- Returns actionable recommendations
- Explains what it found and why

### `spawner_context` ⚠️

- `project_id` is optional
- Can create from description
- Could improve: add what_happened and next_steps to response

---

## Response Format Improvements

Several tools return minimal success responses. Per mcp-product skill, every response should include:

1. **what_happened** - Confirmation of what was done
2. **context** - Why it matters
3. **next_steps** - What to do next

### Example Improvement

**Before (spawner_remember):**
```typescript
return {
  success: true,
  decision_id: newId
};
```

**After:**
```typescript
return {
  success: true,
  decision_id: newId,
  what_happened: "Saved your decision about authentication",
  what_this_means: "I'll remember this for future sessions",
  next_steps: [
    "Continue building - I'll reference this decision",
    "Use spawner_context to see all saved decisions",
    "Use spawner_remember again to save more decisions"
  ]
};
```

---

## Error Message Audit

Current error handling uses Zod validation errors directly. These are technical and confusing for vibe coders.

### Recommendations

1. **Wrap Zod errors** with human-readable messages
2. **Always include** `what_to_do` or `suggestion` field
3. **Provide examples** of correct usage

**Pattern:**
```typescript
try {
  const args = schema.parse(input);
} catch (e) {
  if (e instanceof ZodError) {
    return {
      error: translateZodError(e), // Human readable
      what_to_do: "Try again with...",
      example: "spawner_tool(param=\"value\")"
    };
  }
}
```

---

## Priority Fix Order

1. **Immediate** (blocks adoption):
   - [ ] Fix `spawner_templates` wrong tool reference
   - [ ] Make `spawner_remember` work without project_id
   - [ ] Make `spawner_sharp_edge` work without stack

2. **High** (improves first experience):
   - [ ] Add default action to `spawner_skills`
   - [ ] Make `spawner_unstick` accept free-form situation
   - [ ] Improve error messages across all tools

3. **Medium** (polish):
   - [ ] Add what_happened/next_steps to all responses
   - [ ] Add examples to error messages
   - [ ] Consistent response envelope across tools

---

## Testing Checklist

After fixes, test these scenarios:

- [ ] New user calls `spawner_plan` with just an idea - should work
- [ ] New user calls `spawner_remember` without project_id - should create temp project
- [ ] New user calls `spawner_sharp_edge` without stack - should return common gotchas
- [ ] User follows `spawner_templates` instructions - should work with spawner_plan
- [ ] User calls `spawner_skills` without action - should default to search
- [ ] User calls any tool with wrong params - should get helpful error message

---

## Appendix: MCP Product Skill Principles Applied

| Principle | Current State | Target State |
|-----------|---------------|--------------|
| Magic First Moment | ⚠️ Some tools block | ✅ All tools return value |
| Progressive Disclosure | ✅ spawner_plan does this | ✅ All tools follow |
| Explain As You Go | ⚠️ Minimal responses | ✅ Rich responses |
| Sensible Defaults | ⚠️ Some require choices | ✅ Smart defaults |
| Error Messages Are UX | ❌ Zod errors exposed | ✅ Human readable |
| No ID Before Value | ❌ 2 tools broken | ✅ All work first-call |

---

*Generated from audit against `spawner-v2/skills/pattern/mcp-product/` skill*
