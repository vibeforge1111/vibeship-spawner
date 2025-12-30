# vibeship-spawner: Claude on Nitro

> Design document for the next evolution of vibeship-spawner

## Mission

Help more great, useful products come to life through vibe coding.

**Success:** Founders saying "I built this with vibeship-spawner" about products that actually matter to people.

---

## The 4 Pillars

### 1. Smarter Discovery
- Assess user skill level (without interrogating)
- Extract real intent (not just surface request)
- Guide toward usefulness (thought partner, not director)
- Match to appropriate guided path

### 2. Specialized Agents
- Deep expertise, not shallow generalists
- Three-layer architecture (Core → Integration → Pattern)
- Pre-loaded with patterns, anti-patterns, gotchas
- Connected to right MCPs automatically

### 3. Guardrails System
- Verify before marking done
- Architecture compliance checks
- Production-readiness gates
- Catch "done but not done" syndrome

### 4. Escape Hatch Intelligence
- Detect circular/stuck behavior
- Zoom out, explain the situation
- Offer 2-3 real alternatives with tradeoffs
- Reset to clean state when needed

---

## Agent Architecture

### Three Layers of Specialists

```
┌─────────────────────────────────────────────────────────────┐
│                    PLANNER (Orchestrator)                   │
│         Assesses task → Assembles squad → Coordinates       │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   LAYER 1     │    │   LAYER 2     │    │   LAYER 3     │
│    Core       │    │  Integration  │    │   Pattern     │
│ Specialists   │    │  Specialists  │    │  Specialists  │
└───────────────┘    └───────────────┘    └───────────────┘
```

### Layer 1: Core Specialists (deep in their domain)
- `nextjs-app-router` - App Router patterns, server/client components
- `supabase-backend` - Auth, RLS, Edge Functions, Realtime
- `tailwind-ui` - Component patterns, responsive, dark mode
- `typescript-strict` - Types, generics, inference
- `react-patterns` - Hooks, state management, performance

### Layer 2: Integration Specialists (know how things connect)
- `nextjs-supabase-auth` - Full auth flow across both systems
- `server-client-boundary` - What runs where, hydration, "use client"
- `api-design` - REST patterns, error handling, validation
- `state-sync` - Client/server state coordination

### Layer 3: Pattern Specialists (solve specific problems)
- `crud-builder` - Generate full CRUD with proper patterns
- `realtime-sync` - WebSockets, optimistic updates, conflicts
- `file-upload` - Client → storage → DB reference flow
- `payments-flow` - Stripe checkout, webhooks, subscription management
- `auth-flow` - Login, signup, password reset, sessions

### Standalone Specialists (pure domain knowledge)
- `brand-identity` - Colors, typography, voice & tone
- `ux-research` - User flows, information architecture
- `security-audit` - Vulnerability checks, best practices
- `copywriting` - Landing pages, onboarding, microcopy

### What Makes a Specialist "Deep"

Each specialist contains:

| Section | Purpose |
|---------|---------|
| **Identity** | What it is, what it owns |
| **Patterns** | The RIGHT way to do things (with code examples) |
| **Anti-patterns** | Common mistakes to avoid |
| **Gotchas** | "This will bite you" warnings |
| **Checkpoints** | Verify before marking done |
| **Escape hatches** | When to bail and try different approach |

---

## Discovery Flow

### The Usefulness Framework

Before tech, understand value:

```
┌─────────────────────────────────────────────────────────────┐
│  1. WHO has this problem?                                   │
│     (specific person, not "everyone")                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  2. WHAT'S broken about current solutions?                  │
│     (the pain they feel today)                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  3. WHY would they switch to yours?                         │
│     (the ONE thing you do better)                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  4. WHAT's the minimum to prove that value?                 │
│     (features derived from usefulness, not wishlist)        │
└─────────────────────────────────────────────────────────────┘
```

### Skill Level Assessment

| Level | Signal | Claude Behavior |
|-------|--------|-----------------|
| **Vibe Coder** | "I have an idea but no code experience" | Maximum guidance, explain everything, make all tech decisions |
| **Builder** | "I've built some things, know basics" | Explain key decisions, let them make some choices |
| **Developer** | "I code but want to move faster" | Skip explanations, offer options, trust their judgment |
| **Expert** | "I know what I want, just execute" | Minimal talk, maximum output, challenge bad decisions |

### Detection Without Interrogation

Instead of asking "what's your skill level?", offer a simple choice:

```
"Quick question before we start - which sounds more like you?"

A) "I have the idea, you handle the tech stuff"
B) "I know some coding, want to learn as we build"
C) "I'm technical, let's move fast"
```

### The Thought Partner Tone

Not a director. Not a yes-man. Help users discover better ideas themselves.

| Situation | Approach |
|-----------|----------|
| Unfocused idea | "What's the ONE thing that makes this valuable?" |
| Crowded market | "Who's underserved by current options?" |
| Feature overload | "If you could only ship ONE feature, which proves the idea?" |
| Copy of existing | "What would make someone switch from [competitor]?" |
| Creative/fun project | Skip usefulness questions, just help build |

**The unlock question:**
```
"Imagine this is live and someone tweets about it.
What do they say that made them excited enough to share?"
```

---

## Guardrails System

### Three Levels

```
┌─────────────────────────────────────────────────────────────┐
│                 LEVEL 1: TASK GUARDRAILS                    │
│            (Before marking any task complete)               │
├─────────────────────────────────────────────────────────────┤
│ □ Code runs without errors                                  │
│ □ Matches what was asked                                    │
│ □ Files created exist and aren't empty                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│               LEVEL 2: ARCHITECTURE GUARDRAILS              │
│              (Checked by Integration specialists)           │
├─────────────────────────────────────────────────────────────┤
│ □ Follows patterns in ARCHITECTURE.md                       │
│ □ Data flows as designed                                    │
│ □ No accidental client/server boundary violations           │
│ □ Auth/permissions applied where needed                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│             LEVEL 3: PRODUCTION GUARDRAILS                  │
│               (Before "ready to ship" call)                 │
├─────────────────────────────────────────────────────────────┤
│ □ Not client-only when it needs backend                     │
│ □ Environment variables handled properly                    │
│ □ Error handling exists                                     │
│ □ Basic security (no exposed keys, SQL injection, etc.)     │
│ □ Works for multiple users (not just localhost)             │
└─────────────────────────────────────────────────────────────┘
```

### Common Catches

| Issue | Guardrail |
|-------|-----------|
| "Auth works" but only checks on frontend | Architecture: client/server boundary |
| "CRUD done" but no error handling | Task: code runs without errors |
| "Feature complete" but hardcoded to one user | Production: works for multiple users |
| Uses localStorage for shared data | Production: not client-only |

### The "Not Done" Response

```
Guardrail: Production Readiness

Issue found: Data stored in localStorage
Problem: Other users won't see habits created by this user

This needs a database. Options:
1. [Recommended] Move to Supabase - I'll migrate the code
2. Keep local-only - becomes personal tool, not shareable
3. Explain more - help me understand the tradeoffs

Which direction?
```

---

## Escape Hatch Intelligence

### Detecting "Stuck" Behavior

| Signal | Detection |
|--------|-----------|
| **Retry loop** | Same task attempted 3+ times |
| **Error ping-pong** | Fix A breaks B, fix B breaks A |
| **Growing complexity** | Solution keeps adding code without resolution |
| **Time spiral** | Task taking 5x longer than similar tasks |

### The Escape Hatch Flow

1. **Admit the struggle** - "We're going in circles"
2. **Explain why it's hard** - User learns something
3. **Offer real alternatives** - Not variations of same broken approach
4. **Include tradeoffs** - Informed choice
5. **Recommend reset + explain why** - Avoid building on spaghetti
6. **User confirms** - Always ask before resetting
7. **Reset to clean state** - Git revert touched files
8. **Build fresh** - Start chosen alternative cleanly

### Example Response

```
I'm noticing we're going in circles on this auth issue.
Let me step back.

What's happening:
- Server component needs user session
- Middleware sets cookie, but component can't read it
- We've tried 3 approaches, each has tradeoffs

Options from here:

1. [Simpler] Use client component with useEffect
   - Works reliably
   - Tradeoff: Loading flash on page load

2. [Different approach] Move auth check to layout
   - Server-side, no flash
   - Tradeoff: Restructures your routes

3. [Service] Use Clerk/Auth.js instead of raw Supabase auth
   - Battle-tested, handles edge cases
   - Tradeoff: Another dependency

Which direction feels right?

I recommend starting fresh with your choice rather than
patching current code - it's gotten tangled. OK to reset?
```

---

## Guided Paths

### What They Solve

Beginners don't know what they don't know. Guided paths are **proven architectures** that handle the "I don't know what I don't know" problem.

### Example Paths

| Path | What's Pre-Solved |
|------|-------------------|
| **SaaS Starter** | Auth, Stripe subscriptions, user dashboard, pricing page |
| **Marketplace** | Two-sided auth, listings, search, payments with fees |
| **AI Wrapper** | Prompt management, streaming, usage tracking, API keys |
| **Web3 dApp** | Wallet connect, contract interaction, transactions |
| **Internal Tool** | Simple auth, CRUD admin panels, data tables |

### Path Structure

```
guided-paths/
  saas-starter/
    description.md      # What this path builds
    architecture.md     # Pre-made architecture decisions
    schema.sql          # Starting database schema
    task-sequence.json  # Ordered tasks that work
    gotchas.md          # "Here's what trips people up"
    checkpoints.md      # Verification points
```

### How It Works

```
User: "I want to build a SaaS for invoice management"

Planner:
"Invoice management - there's a lot out there. Let's figure
out what makes yours worth using.

Who's this for specifically? And what's broken about
current options for them?"

User: "Freelance designers who hate chasing payments"

Planner:
"So your edge is: dead simple + clients actually pay.

I'll use the SaaS Starter path, customized for invoices:
- One-click invoice creation (simpler than anything)
- SMS delivery (emails get ignored, texts don't)
- Pay-by-link (no login required for client)

That's the MVP. Prove those 3 things work, then expand.

Sound right?"
```

---

## Summary

**vibeship-spawner transforms Claude from a generic assistant into a product-building machine by:**

1. **Understanding usefulness first** - Features flow from value, not wishlists
2. **Assembling specialist squads** - Deep expertise where it matters
3. **Enforcing quality gates** - Can't say "done" until it's actually done
4. **Escaping rabbit holes** - Recognize stuck, offer alternatives, reset clean
5. **Guiding without directing** - Users discover better ideas themselves

**The goal:** More great products shipped. Founders proud of what they built with vibeship.

---

*Design created: 2025-12-11*
