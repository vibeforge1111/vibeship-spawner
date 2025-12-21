# Agent Skill Collaboration System

> **Purpose:** Define how Spawner skills work together as a coordinated team, enabling seamless handoffs between specialists without bottlenecks or stability issues.

## Table of Contents

1. [Philosophy](#philosophy)
2. [Architecture Overview](#architecture-overview)
3. [The Handoff Mechanism](#the-handoff-mechanism)
4. [Skill Boundary Design](#skill-boundary-design)
5. [Implementation Specification](#implementation-specification)
6. [Prompt Templates](#prompt-templates)
7. [Stability Guarantees](#stability-guarantees)
8. [Edge Cases & Solutions](#edge-cases--solutions)
9. [Testing Protocol](#testing-protocol)
10. [Examples](#examples)

---

## Philosophy

### Core Principles

1. **Specialists Over Generalists**
   - Each skill is a deep specialist in one domain
   - Skills know their boundaries explicitly
   - No skill tries to be everything

2. **Explicit Over Implicit**
   - Handoff rules are written in the prompt, not hidden in code
   - Claude can read and follow them directly
   - No runtime pattern matching or complex orchestration

3. **Fail-Safe Over Fail-Fast**
   - If handoff detection fails, skill continues (degraded but working)
   - User can always manually request a skill
   - System never blocks on collaboration logic

4. **Context Preservation**
   - Handoffs carry forward what was being built
   - New skill understands the journey so far
   - No "starting from scratch" feeling

### Why Prompt-Based Handoffs?

| Approach | Reliability | Complexity | Latency | Testability |
|----------|-------------|------------|---------|-------------|
| Orchestrator pattern matching | Medium | High | +100ms per check | Hard |
| Separate collaboration service | Medium | Very High | +200ms | Hard |
| **Prompt-based instructions** | **High** | **Low** | **0ms** | **Easy** |

Claude is already excellent at following explicit instructions. We leverage this strength instead of building parallel systems.

---

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER MESSAGE                              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SPAWNER_ORCHESTRATE                          │
│  • Analyzes intent                                                │
│  • Loads initial skill(s)                                         │
│  • Injects skill prompt with HANDOFF RULES                        │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         ACTIVE SKILL                              │
│  ┌─────────────────────────────────────────────────────────────┐ │
│  │ Identity: "You are the Next.js App Router specialist..."    │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │ HANDOFF RULES (injected into prompt):                       │ │
│  │ • auth|login|session → nextjs-supabase-auth                 │ │
│  │ • database|query → supabase-backend                         │ │
│  │ • styling|css → tailwind-ui                                 │ │
│  ├─────────────────────────────────────────────────────────────┤ │
│  │ Patterns, Sharp Edges, Validations...                       │ │
│  └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                │
                    Claude reads handoff rules
                                │
                    ┌───────────┴───────────┐
                    │                       │
              Within domain           Outside domain
                    │                       │
                    ▼                       ▼
            Continue with             Call spawner_load()
            current skill             with new skill ID
                                            │
                                            ▼
                                    New skill loaded
                                    (with its own handoff rules)
```

### Data Flow

1. **Initial Load:** `spawner_orchestrate` or `spawner_load` is called
2. **Skill Injection:** Skill prompt injected with handoff rules section
3. **User Interaction:** Claude responds using skill knowledge
4. **Boundary Detection:** Claude recognizes topic outside current skill
5. **Handoff Execution:** Claude calls `spawner_load(new_skill_id)`
6. **Context Carry:** Handoff includes what was being built
7. **New Skill Active:** Process repeats with new skill

---

## The Handoff Mechanism

### How It Works

When a skill is loaded, its handoff rules become explicit instructions:

```markdown
## HANDOFF PROTOCOL

You are operating as: **Next.js App Router Specialist**

### Your Domain (stay in your lane)
- App Router file conventions
- Server Components vs Client Components
- Data fetching with async components
- Route handlers and middleware
- Next.js-specific patterns

### When to Hand Off (do this immediately)

When the user's request involves these topics, **STOP** and call the appropriate specialist:

| Trigger Pattern | Call This | Why |
|-----------------|-----------|-----|
| authentication, login, signup, session, JWT, OAuth | `spawner_load({ skill_id: "nextjs-supabase-auth" })` | Auth requires security expertise |
| database, query, SQL, migration, schema, Prisma, Drizzle | `spawner_load({ skill_id: "supabase-backend" })` | Database design is specialized |
| styling, CSS, Tailwind, design system, responsive | `spawner_load({ skill_id: "tailwind-ui" })` | UI/styling has its own patterns |
| deployment, hosting, CI/CD, preview, production | `spawner_load({ skill_id: "vercel-deployment" })` | DevOps is a specialty |

### How to Hand Off

When you detect a handoff trigger:

1. **Acknowledge** the topic shift: "This involves [topic] - let me bring in the specialist."
2. **Summarize context** for the new skill: what was built, current state, user's goal
3. **Call spawner_load** with context parameter:
   ```
   spawner_load({
     skill_id: "nextjs-supabase-auth",
     context: "User is building a SaaS dashboard. Has App Router setup with /dashboard route. Now needs login."
   })
   ```
4. **Let the new skill take over** - don't continue answering in the old domain

### What NOT to Hand Off

Stay in your lane for:
- Next.js-specific questions (even if they touch other areas lightly)
- Clarifying questions about your domain
- Code reviews of App Router code
- Debugging Next.js-specific issues
```

### Why This Works

1. **Explicit Rules:** Claude sees exactly when to hand off
2. **No Ambiguity:** Trigger patterns are clear
3. **Context Carrying:** Handoff includes summary of work so far
4. **User Transparency:** User sees "bringing in specialist" message
5. **Graceful Degradation:** If Claude misses a handoff, user can still ask for skill

---

## Skill Boundary Design

### The Boundary Principle

Every skill must answer three questions:

1. **What do I own?** (authoritative domain)
2. **What do I NOT own?** (explicit exclusions)
3. **Who do I call for help?** (handoff targets)

### Designing Good Boundaries

**Bad Boundary (too vague):**
```yaml
owns:
  - frontend
  - react
  - web development
```

**Good Boundary (specific):**
```yaml
owns:
  - next.js app router (13.4+)
  - react server components in next.js context
  - next.js file-based routing
  - next.js data fetching patterns

does_not_own:
  - general React (→ react-patterns)
  - authentication (→ nextjs-supabase-auth)
  - database queries (→ supabase-backend)
  - CSS/styling (→ tailwind-ui)
```

### Handoff Trigger Design

Triggers should be:
- **Specific enough** to avoid false positives
- **Broad enough** to catch variations
- **Mutually exclusive** across skills (no overlaps)

**Bad Triggers:**
```yaml
handoffs:
  - trigger: "help"  # Too vague, matches everything
    to: general-assistant
```

**Good Triggers:**
```yaml
handoffs:
  - trigger: "authentication|login|signup|logout|session|JWT|OAuth|SSO"
    to: nextjs-supabase-auth

  - trigger: "database|query|SQL|migration|schema|table|foreign key|Prisma|Drizzle"
    to: supabase-backend
```

### Avoiding Trigger Collisions

Skills should not have overlapping triggers. If collision exists:

1. **More specific skill wins** - "Supabase auth" beats "general auth"
2. **Context determines** - If user is in Next.js, use Next.js-specific skill
3. **User clarifies** - Ask if ambiguous

---

## Implementation Specification

### skill.yaml Handoff Section

Every skill.yaml must include:

```yaml
# Required: Defines what this skill owns
owns:
  - next.js app router
  - server components
  - client components
  - next.js data fetching

# Required: Explicit handoff rules
handoffs:
  - trigger: "authentication|login|signup|session|auth"
    to: nextjs-supabase-auth
    priority: 1  # Higher = check first
    context_template: "User is in Next.js App Router. Needs auth for: {user_goal}"

  - trigger: "database|query|SQL|migration|schema"
    to: supabase-backend
    priority: 1
    context_template: "Building Next.js app. Database need: {user_goal}"

  - trigger: "styling|CSS|Tailwind|design|responsive|dark mode"
    to: tailwind-ui
    priority: 2
    context_template: "Next.js frontend needs styling: {user_goal}"

  - trigger: "deploy|hosting|Vercel|CI|CD|preview|production"
    to: vercel-deployment
    priority: 2
    context_template: "Ready to deploy Next.js app: {user_goal}"

# Optional: Skills that enhance this one
pairs_with:
  - typescript-strict
  - tailwind-ui
  - supabase-backend

# Optional: Prerequisites
requires:
  - javascript-fundamentals  # Knowledge, not necessarily a skill
  - react-basics
```

### spawner_load Rendering

When `spawner_load` renders a skill, it must inject the handoff section:

```typescript
function renderSkillPrompt(skill: Skill, context?: string): string {
  const sections = [];

  // 1. Identity section
  sections.push(`## Your Identity\n\n${skill.identity}`);

  // 2. HANDOFF PROTOCOL (critical for collaboration)
  if (skill.handoffs && skill.handoffs.length > 0) {
    sections.push(renderHandoffProtocol(skill));
  }

  // 3. Domain ownership
  sections.push(`## Your Domain\n\nYou are authoritative on:\n${skill.owns.map(o => `- ${o}`).join('\n')}`);

  // 4. Patterns, anti-patterns, sharp edges...
  sections.push(renderPatterns(skill));
  sections.push(renderAntiPatterns(skill));
  sections.push(renderSharpEdges(skill));

  // 5. Context from previous skill (if handoff)
  if (context) {
    sections.push(`## Context From Previous Skill\n\n${context}`);
  }

  return sections.join('\n\n---\n\n');
}

function renderHandoffProtocol(skill: Skill): string {
  const triggers = skill.handoffs
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))
    .map(h => `| ${h.trigger.split('|').slice(0, 4).join(', ')}... | \`spawner_load({ skill_id: "${h.to}" })\` |`)
    .join('\n');

  return `## HANDOFF PROTOCOL

You are operating as: **${skill.name}**

### When to Hand Off

When the user's request matches these patterns, **STOP** and load the specialist:

| If user mentions... | Action |
|---------------------|--------|
${triggers}

### How to Execute Handoff

1. Say: "This involves [topic] - bringing in the [specialist name]."
2. Call: \`spawner_load({ skill_id: "skill-id", context: "summary of current work" })\`
3. Stop responding in current domain - let new skill take over.

### Staying In Your Lane

If the topic is clearly within your domain (${skill.owns.slice(0, 3).join(', ')}), continue without handoff.`;
}
```

### MCP Tool Enhancement

The `spawner_load` tool should accept optional context:

```typescript
const spawnerLoadSchema = z.object({
  skill_id: z.string().describe("ID of skill to load"),
  context: z.string().optional().describe("Context from previous skill - what was being built, current state"),
});
```

---

## Prompt Templates

### Handoff Protocol Template (Injected into Every Skill)

```markdown
## HANDOFF PROTOCOL

You are operating as: **{skill_name}**

Your specialty: {skill_description}

---

### BOUNDARY CHECK (Run this on every user message)

Before responding, quickly assess:
1. Is this clearly within my domain ({owns_list})? → Continue
2. Does this match a handoff trigger? → Execute handoff
3. Ambiguous? → Ask user for clarification

---

### HANDOFF TRIGGERS

| Topic Pattern | Specialist to Load | Why Hand Off |
|---------------|-------------------|--------------|
{handoff_table}

---

### HANDOFF EXECUTION

When you detect a handoff trigger:

**Step 1: Acknowledge**
> "This involves [topic area]. Let me bring in the [specialist name] who handles this specifically."

**Step 2: Summarize Context**
Prepare a brief context for the new skill:
- What has been built so far
- Current file/component being worked on
- User's immediate goal
- Any constraints or preferences mentioned

**Step 3: Execute**
```
spawner_load({
  skill_id: "{target_skill_id}",
  context: "Your context summary here"
})
```

**Step 4: Stop**
Do not continue answering in your domain. The new skill will take over.

---

### STAYING IN YOUR LANE

Continue WITHOUT handoff when:
- Question is clearly about {owns_list}
- User is asking for clarification on your previous answer
- User explicitly says "don't switch" or "stay with current"
- It's a code review of code in your domain

---

### GRACEFUL UNCERTAINTY

If you're unsure whether to hand off:

> "This touches on [topic]. I can give you general guidance, or I can bring in the [specialist] for deeper expertise. Which would you prefer?"

Let user decide. Don't block on uncertainty.
```

### Context Handoff Template

When handing off, structure context like this:

```markdown
## Handoff Context

**Previous Skill:** {from_skill_name}
**New Skill:** {to_skill_name}

### What Was Being Built
{project_description}

### Current State
- Files created: {file_list}
- Current focus: {current_file_or_feature}
- Last action: {what_was_just_done}

### User's Goal
{what_user_wants_to_achieve}

### Relevant Decisions Made
- {decision_1}
- {decision_2}

### Continue From Here
{specific_next_step}
```

---

## Stability Guarantees

### No Single Point of Failure

| Failure Mode | System Behavior | User Impact |
|--------------|-----------------|-------------|
| Handoff not detected | Skill continues, slightly generic | Degraded but functional |
| Target skill not found | Error message, stay in current skill | User can retry or pick manually |
| Context not passed | New skill asks for context | Minor friction, recoverable |
| User overrides handoff | Skill respects user preference | User in control |

### Graceful Degradation

The system degrades gracefully:

1. **Best Case:** Handoff detected → specialist loaded → perfect response
2. **Good Case:** Handoff missed → generalist response → user can request specialist
3. **Fallback:** Everything fails → Claude's base knowledge → still helpful

### No Blocking Operations

- Handoff detection is **in the prompt** (no API calls)
- Pattern matching is **Claude's inference** (no regex engine)
- Skill loading is **single MCP call** (already fast)

### Idempotency

- Loading the same skill twice is safe (replaces, doesn't duplicate)
- Handoffs can be retried without side effects
- No state corruption possible

---

## Edge Cases & Solutions

### Edge Case 1: Circular Handoffs

**Problem:** Skill A hands to Skill B, which hands back to Skill A.

**Solution:** Include "don't hand back" rule:

```yaml
handoffs:
  - trigger: "frontend|components"
    to: frontend-skill
    exclude_from: [frontend-skill]  # Don't suggest this if coming FROM frontend
```

In prompt:
```markdown
### Handoff History
You received this from: {previous_skill}
Do NOT hand back to: {previous_skill}
```

### Edge Case 2: Multi-Domain Request

**Problem:** User asks for something spanning multiple skills.

**Solution:** Sequential handoffs with context accumulation:

```markdown
User: "Add login with Google OAuth and store user in database"

Skill (Next.js) response:
> "This involves two specialists:
> 1. Authentication (Google OAuth) → nextjs-supabase-auth
> 2. Database (user storage) → supabase-backend
>
> I'll start with auth, then we'll move to database. Loading auth specialist..."

[spawner_load({ skill_id: "nextjs-supabase-auth", context: "..." })]
```

### Edge Case 3: User Disagrees with Handoff

**Problem:** Claude suggests handoff, user wants to continue.

**Solution:** Always respect user preference:

```markdown
### User Override

If user says any of:
- "Stay with current"
- "Don't switch"
- "You handle it"
- "I want you to do it"

Then: Continue in current skill, do your best. Note limitations if relevant.
```

### Edge Case 4: Skill Not Available

**Problem:** Target skill doesn't exist or fails to load.

**Solution:** Fallback with transparency:

```typescript
// In spawner_load implementation
try {
  const skill = await loadSkill(skill_id);
  return renderSkill(skill, context);
} catch (error) {
  return `The ${skill_id} specialist isn't available right now.
          I'll continue with general knowledge.
          For best results, you can try: spawner_skills({ query: "${skill_id}" })`;
}
```

### Edge Case 5: Context Too Large

**Problem:** Context from previous skill is too long.

**Solution:** Structured summary with size limit:

```typescript
function summarizeContext(context: string, maxLength: number = 500): string {
  if (context.length <= maxLength) return context;

  // Extract key points
  const lines = context.split('\n');
  const summary = [];
  let length = 0;

  for (const line of lines) {
    if (line.startsWith('###') || line.startsWith('- ') || line.startsWith('**')) {
      if (length + line.length > maxLength) break;
      summary.push(line);
      length += line.length;
    }
  }

  return summary.join('\n') + '\n\n[Context truncated for brevity]';
}
```

---

## Testing Protocol

### Unit Tests

Each skill should have handoff tests:

```typescript
describe('Skill Handoffs', () => {
  it('should trigger auth handoff for login mentions', () => {
    const skill = loadSkill('nextjs-app-router');
    const triggers = ['add login', 'user authentication', 'session management'];

    for (const trigger of triggers) {
      const handoff = findMatchingHandoff(skill.handoffs, trigger);
      expect(handoff?.to).toBe('nextjs-supabase-auth');
    }
  });

  it('should NOT trigger handoff for in-domain topics', () => {
    const skill = loadSkill('nextjs-app-router');
    const inDomain = ['server component', 'app router', 'loading.tsx'];

    for (const topic of inDomain) {
      const handoff = findMatchingHandoff(skill.handoffs, topic);
      expect(handoff).toBeUndefined();
    }
  });
});
```

### Integration Tests

Test actual handoff flow:

```typescript
describe('Handoff Flow', () => {
  it('should execute handoff with context', async () => {
    // 1. Load initial skill
    const response1 = await spawner_load({ skill_id: 'nextjs-app-router' });
    expect(response1).toContain('HANDOFF PROTOCOL');

    // 2. Simulate handoff call
    const response2 = await spawner_load({
      skill_id: 'nextjs-supabase-auth',
      context: 'Building dashboard, needs login'
    });

    expect(response2).toContain('Context From Previous Skill');
    expect(response2).toContain('Building dashboard');
  });
});
```

### Manual Testing Checklist

For each skill, verify:

- [ ] Skill loads without error
- [ ] Handoff section visible in rendered prompt
- [ ] Each trigger pattern works (test 2-3 variations)
- [ ] Context passes through correctly
- [ ] "Stay in lane" cases don't trigger handoff
- [ ] User override is respected

---

## Examples

### Example 1: Next.js to Auth Handoff

**User:** "Now I need to add Google login to my app"

**Claude (with Next.js skill):**
> This involves authentication with Google OAuth. Let me bring in the auth specialist who handles this specifically.
>
> *Calling spawner_load...*

```
spawner_load({
  skill_id: "nextjs-supabase-auth",
  context: "User building Next.js App Router app. Has /dashboard route. Needs Google OAuth login. Using Supabase for backend."
})
```

**Claude (with Auth skill now loaded):**
> I'm the authentication specialist. I see you're adding Google OAuth to your Next.js app. Here's the implementation...

### Example 2: Multi-Step Handoff

**User:** "Build a complete checkout flow with payments and email confirmation"

**Claude (with initial skill):**
> This involves multiple specialists:
> 1. **Payments** (Stripe integration) - I'll start here
> 2. **Email** (confirmation emails) - We'll hand off after payments
>
> Loading payments specialist...

*[Stripe skill handles payment implementation]*

**Claude (with Stripe skill):**
> Payments are set up. Now for email confirmation, let me bring in the email specialist...

*[Email skill handles email implementation]*

### Example 3: User Override

**User:** "Add login functionality"

**Claude (with Next.js skill):**
> This involves authentication. Would you like me to:
> 1. Bring in the auth specialist for best practices
> 2. Give you a quick implementation here
>
> The specialist has deeper knowledge of security edge cases.

**User:** "Just do it quick, don't switch"

**Claude:**
> Got it, staying here. Here's a basic auth setup...
>
> *Note: For production auth, consider using the auth specialist for security review.*

---

## Rollout Plan

### Phase 1: Foundation (Week 1)
- [ ] Update `spawner_load` to render handoff protocol
- [ ] Add handoffs to top 10 most-used skills
- [ ] Test handoff flow end-to-end

### Phase 2: Coverage (Week 2)
- [ ] Add handoffs to remaining skills
- [ ] Validate no trigger collisions
- [ ] Add integration tests

### Phase 3: Refinement (Week 3)
- [ ] Monitor handoff success rate
- [ ] Tune trigger patterns based on usage
- [ ] Add user feedback mechanism

---

## Summary

The Agent Skill Collaboration System works by:

1. **Embedding handoff rules in prompts** - Claude reads and follows them
2. **Clear trigger patterns** - Unambiguous detection
3. **Context preservation** - Handoffs carry forward state
4. **Graceful degradation** - Never blocks, always recovers
5. **User control** - Override always possible

This approach is:
- **Simple** - No new services, uses existing primitives
- **Reliable** - Claude follows explicit instructions well
- **Testable** - Easy to verify handoffs work
- **Stable** - No runtime dependencies, no blocking calls

The result: Skills work as a coordinated team, each going deep in their domain, seamlessly handing off at boundaries.
