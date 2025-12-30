# V2 to V1 Skill Renderer

This document defines how to render V2 structured skills into V1-quality prose.

## Usage

Given a V2 skill (`skill-v2.yaml` + `sharp-edges-v2.yaml`), generate a V1 markdown document.

## Rendering Template

```markdown
---
name: {id}
description: {identity.role}
tags: [{tags joined by comma}]
---

# {name} Specialist

## Overview

{identity.role expanded into 2-3 sentences describing the specialist}

**Core principle:** {identity.core_principles[0]}

## The Iron Law

```
{identity.iron_law in CAPS}
```

{Expand iron_law into 2-3 paragraph explanation of why this matters and consequences of violation}

## When to Use

**Always:**
{For each trigger, create a bullet point}

**Don't:**
{For each does_not_own, create a bullet with arrow to correct skill}

Thinking "skip this just once"? Stop. That's rationalization.

## The Process

### Step 1: {First pattern name}

{Pattern description expanded}

### Step 2: {Second pattern name}

{Pattern description expanded}

{Continue for key patterns...}

## Patterns

{For each pattern:}

### {pattern.name}

<Good>
```typescript
{pattern.good.code}
```
{pattern.good.description expanded into explanation}
</Good>

<Bad>
```typescript
{pattern.bad.code}
```
{pattern.bad.description expanded into explanation}
</Bad>

## Anti-Patterns

| Anti-Pattern | Why It Fails | What To Do Instead |
|--------------|--------------|-------------------|
{For each anti_pattern: | **{name}** | {why joined as prose} | {instead} |}

## Red Flags - STOP

If you catch yourself:
{For each red_flag with severity >= error:}
- {Describe what the pattern means in imperative voice}

**ALL of these mean: STOP. Review the Iron Law. Start over if needed.**

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
{Generate 3-5 common excuses based on anti_patterns with rebuttals}

## Gotchas

{For each sharp_edge with severity critical or high:}

### {sharp_edge.summary}

{sharp_edge.context.when as prose paragraph}

```typescript
{sharp_edge.solution.code_before if exists}
```

{sharp_edge.why as prose paragraph}

```typescript
{sharp_edge.solution.code_after if exists}
```

## Verification Checklist

Before shipping:

{For each verification item:}
- [ ] {check}

Can't check all boxes? You skipped something. Review and fix.

## Integration

**Pairs well with:**
{For each pairs_with: bullet with description}

**Requires:**
{For each requires: bullet with description, or "Understanding of target user" etc.}

## References

{Add relevant references based on skill domain}

---

*This specialist follows the world-class skill pattern.*
```

## Rendering Rules

### Identity Section

1. `identity.role` → First paragraph of Overview
2. `identity.core_principles` → Bullet list OR weave into prose
3. `identity.iron_law` → Dedicated section with emphasis box

### Patterns Section

For each pattern:
1. `pattern.name` → H3 heading
2. `pattern.when` → Lead sentence
3. `pattern.good.code` → `<Good>` block
4. `pattern.good.description` → Explanation after code
5. `pattern.bad.code` → `<Bad>` block
6. `pattern.bad.description` → Explanation after code
7. `pattern.why` → Join as prose explaining difference

### Anti-Patterns Section

Convert to table:
| name | why (joined) | instead |

### Sharp Edges Section

For critical/high severity:
1. `summary` → H3 heading
2. `context.when` → Situation prose
3. `context.symptoms` → Bullet list of warning signs
4. `solution.code_before` → "Before" code block
5. `why` → Join as explanation
6. `solution.code_after` → "After" code block
7. `solution.steps` → Numbered list

### Red Flags Section

Filter by severity >= error:
1. Convert `pattern` to human-readable description
2. Add `meaning` as explanation
3. Format as imperative ("If you catch yourself...")

### Verification Section

Convert to checklist:
1. `check` → Checkbox item
2. `fail_action` → Implicit in phrasing

## Example Transformation

### V2 Input (pattern)

```yaml
- id: magic-first-moment
  name: Magic First Moment
  when: Designing any new MCP tool
  good:
    description: Users get value in under 60 seconds
    code: |
      inputSchema: { required: [] }
  bad:
    description: Requiring IDs before any value
    code: |
      inputSchema: { required: ["project_id"] }
  why:
    - Vibe coders are exploring
    - First failure = permanent abandonment
```

### V1 Output

```markdown
### Magic First Moment

<Good>
```typescript
inputSchema: { required: [] }
```
Users get value in under 60 seconds with no configuration required.
The user gets something useful immediately without needing to provide
any IDs or setup.
</Good>

<Bad>
```typescript
inputSchema: { required: ["project_id"] }
```
Requiring IDs before any value is delivered. User calls tool, gets
"missing required parameter: project_id". They don't have one. They leave.
</Bad>

Why this matters: Vibe coders are exploring - they don't have IDs yet.
First call failure means permanent abandonment because they assume
the tool is broken.
```

## Tone Guidelines

1. **Direct**: Use imperative voice ("Do this", not "You should do this")
2. **Confident**: State facts, don't hedge ("This is wrong" not "This might be problematic")
3. **Teaching**: Explain why, not just what
4. **Urgent**: Use "STOP" and emphasis for critical issues
5. **Empathetic**: Acknowledge rationalizations, then counter them

## Output Formats

The renderer can produce:

1. **Full Document** (default) - Complete V1-style markdown
2. **Section** - Specific section only (patterns, anti-patterns, etc.)
3. **Checklist** - Just the verification items
4. **Summary** - Overview + Iron Law + Key anti-patterns
