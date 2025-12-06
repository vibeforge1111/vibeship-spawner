# VibeShip Planner Tutorial

**From idea to MVP, with the ability to extend as you go.**

---

## Table of Contents

1. [Quick Start (5 min)](#quick-start)
2. [Your First Project](#your-first-project)
3. [Understanding the Flow](#understanding-the-flow)
4. [Commands Reference](#commands-reference)
5. [Adding New Skills](#adding-new-skills)
6. [Adding MCP Integrations](#adding-mcp-integrations)
7. [Tips & Tricks](#tips--tricks)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Install

```bash
git clone https://github.com/vibeship/planner
cd planner
```

### Create a new project

```bash
./init.sh my-app
cd my-app
```

### Start building

```bash
claude
```

Then just tell Claude what you want to build:

```
You: I want to build a recipe sharing app
```

That's it. The planner takes over from here.

---

## Your First Project

Let's walk through building a habit tracker step by step.

### Step 1: Initialize

```bash
./init.sh habit-tracker
cd habit-tracker
claude
```

### Step 2: Describe Your Idea

You can be as vague or detailed as you want:

**Vague (planner will ask questions):**
```
I want to build a habit tracker
```

**Detailed (planner will confirm and go):**
```
I want to build a web-based habit tracker with:
- Daily habit check-ins
- Streak tracking
- Simple stats dashboard
- Email/password auth
- Using Next.js and Supabase
```

### Step 3: Answer Questions (if any)

The planner asks max 5 questions to understand your vision:

```
Planner: Nice - habit tracking is a great project. Quick questions:

1. Web or mobile?
2. Personal only, or social features?
3. Any specific habits, or general purpose?

Or say 'you pick' and I'll make smart defaults.
```

Just answer naturally:

```
You: Web, personal only, general purpose
```

### Step 4: Confirm Assumptions

Before building, the planner shows its plan:

```
Planner: Here's my plan:

Building: Web app (Next.js + Tailwind)
Backend: Supabase (auth + database)
Features:
- Add/edit/delete habits
- Daily check-in
- Streak tracking
- Simple stats

Assumptions:
- Email/password auth only
- No notifications for V1
- No mobile app yet

Say 'go' or tell me what to change.
```

If it looks good:
```
You: go
```

Or adjust:
```
You: Actually add Google login too
```

### Step 5: Watch It Build

The planner generates your PRD, architecture, and task list, then starts executing:

```
✓ Generated docs/PRD.md
✓ Generated docs/ARCHITECTURE.md
✓ Created 10 tasks in task_queue.json

Starting build...

✓ Initialized Next.js project
✓ Configured Supabase client
✓ Created database schema
→ Building auth flow...
```

### Step 6: Get Your MVP

When done:

```
Planner: MVP complete! 

Built:
- Landing page with auth
- Dashboard with habit list
- Add/complete/delete habits
- 7-day streak tracking
- Basic stats view

Run: npm run dev
Open: http://localhost:3000

What's next?
```

---

## Understanding the Flow

### The Four Phases

```
┌─────────────┐     ┌──────────┐     ┌──────────┐     ┌────────┐
│  Discovery  │ ──▶ │ Planning │ ──▶ │ Building │ ──▶ │ Review │
└─────────────┘     └──────────┘     └──────────┘     └────────┘
   Questions          PRD              Tasks            Summary
   Assumptions        Architecture     Execution        Next steps
```

### Key Files

| File | What it does | When to look at it |
|------|--------------|-------------------|
| `state.json` | Current phase, decisions, assumptions | Debug issues |
| `task_queue.json` | All tasks and their status | See progress |
| `docs/PRD.md` | What you're building | Share with others |
| `docs/ARCHITECTURE.md` | How it's built | Understand structure |
| `docs/PROJECT_LOG.md` | What happened | Review history |

### How Skills Work

The planner delegates tasks to specialized skills:

```
Planner
  ├── frontend (UI, components, styling)
  ├── backend (APIs, auth, server logic)
  ├── database (schemas, migrations, queries)
  ├── testing (tests, coverage)
  └── devops (deploy, CI/CD, config)
```

Each skill knows its domain and follows the same handoff protocol.

---

## Commands Reference

Use these anytime during a session:

| Command | What it does |
|---------|--------------|
| `status` | Show current phase, progress, next steps |
| `continue` | Resume from where you left off |
| `replan` | Go back to planning phase |
| `assumptions` | View/edit current assumptions |
| `skip [task]` | Skip a specific task |
| `pause` | Save state and stop |

### Examples

**Check progress:**
```
You: status

Planner: 
Phase: Building
Progress: 7/12 tasks complete

Completed:
✓ Project setup
✓ Database schema
✓ Auth flow

In Progress:
→ Dashboard UI

Remaining:
○ Habit CRUD
○ Stats view
○ Testing
```

**Resume next day:**
```
You: continue

Planner: Welcome back! Resuming from Dashboard UI...
```

**Change direction:**
```
You: Actually I want to add a mobile app too

Planner: That's a scope change. I'll replan to include React Native.
Want me to finish the web MVP first, or pivot now?
```

---

## Adding New Skills

When you need capabilities beyond the core 5 skills, you can add new ones.

### Option 1: Let the Planner Generate It

If you request something outside existing skills:

```
You: Add Stripe payments

Planner: I don't have a payments skill. I can:
1. Generate one based on my knowledge
2. Attempt with general backend skill

Recommend: Generate new skill. Save for future projects?

You: Yes, generate and save
```

The planner creates `skills/payments.md` automatically.

### Option 2: Create Manually

Create a new file in `skills/`:

```bash
touch skills/payments.md
```

Use this template:

```markdown
# Payments

## Read First

Before any work, read `skills/_schema.md` for state management protocols.

## Identity

You are the Payments specialist. You handle all payment integrations,
subscriptions, and financial transactions.

## Expertise

- Stripe integration
- Subscription management
- Webhook handling
- Payment forms (Stripe Elements)
- Invoicing

## Approach

1. Check docs/ARCHITECTURE.md for payment requirements
2. Set up Stripe client and environment variables
3. Create payment endpoints/routes
4. Build checkout UI components
5. Set up webhook handlers
6. Test with Stripe test mode

## File Patterns

- Stripe client: `/src/lib/stripe.ts`
- API routes: `/src/app/api/payments/`
- Webhooks: `/src/app/api/webhooks/stripe/`
- Components: `/src/components/payments/`

## Quality Checks

Before marking task complete:
- [ ] API keys in environment variables (not hardcoded)
- [ ] Webhook signature verification implemented
- [ ] Test mode working
- [ ] Error handling for failed payments

## Common Blockers

- **No Stripe account** → Guide user to create one at stripe.com
- **Webhook not receiving** → Check ngrok/tunnel for local dev
- **Type errors** → Install @types/stripe

## MCPs

- `filesystem` - Required
- `stripe` - Recommended (if available)

## Handoff Protocol

When task is complete:

1. Update task_queue.json:
   - Set status: "completed"
   - Add outputs: [list of files created]
   - Set completed_at: current timestamp

2. Update state.json:
   - Set checkpoint: "payments:{task_id}:completed"

3. Log to docs/PROJECT_LOG.md

4. Return control to planner
```

### Option 3: Register the Skill

Add to `registry.json`:

```json
{
  "id": "payments",
  "name": "Payments",
  "file": "skills/payments.md",
  "triggers": ["stripe", "payment", "checkout", "subscription", "billing", "invoice"],
  "mcps": {
    "required": ["filesystem"],
    "recommended": ["stripe"]
  }
}
```

Now the planner will automatically use this skill when it detects payment-related tasks.

---

## Adding MCP Integrations

MCPs (Model Context Protocol) give Claude superpowers - database access, browser control, etc.

### Check Available MCPs

```
You: What MCPs do I have?

Planner: 
Available: filesystem, git
Missing: supabase, browser-tools

Want me to suggest installations?
```

### Install an MCP

Outside of Claude, in your terminal:

```bash
# Supabase
npx @anthropic/mcp install supabase

# Browser tools  
npx @anthropic/mcp install browser-tools

# Git
npx @anthropic/mcp install git
```

Then restart Claude Code.

### Create a Custom MCP Skill

If you're using an MCP that doesn't have a matching skill:

**1. Create the skill file:**

```markdown
# Supabase

## Read First

Read `skills/_schema.md` for state management.

## Identity

You are the Supabase specialist. You handle all Supabase operations
including database, auth, storage, and edge functions.

## Expertise

- Supabase client setup
- Row Level Security (RLS) policies
- Database schema design
- Supabase Auth
- Storage buckets
- Edge Functions
- Real-time subscriptions

## MCP Usage

This skill uses the `supabase` MCP. Available commands:

- `supabase.query(sql)` - Run SQL queries
- `supabase.migrate(file)` - Run migrations
- `supabase.auth.*` - Auth operations

## Approach

1. Initialize Supabase client in /src/lib/supabase.ts
2. Create tables via migrations
3. Set up RLS policies for security
4. Generate TypeScript types from schema
5. Implement auth flows

## Quality Checks

- [ ] RLS policies on all tables
- [ ] Types generated and up to date
- [ ] Environment variables set
- [ ] Auth redirects configured

## Common Blockers

- **Connection refused** → Check SUPABASE_URL and SUPABASE_ANON_KEY
- **RLS blocking queries** → Review policies, check auth state
- **Types out of sync** → Run `supabase gen types typescript`

## Handoff Protocol

[Standard handoff - see _schema.md]
```

**2. Register in registry.json:**

```json
{
  "id": "supabase",
  "name": "Supabase",
  "file": "skills/supabase.md",
  "triggers": ["supabase", "rls", "edge function", "realtime", "storage bucket"],
  "mcps": {
    "required": ["filesystem", "supabase"]
  }
}
```

### MCP + Skill Combinations

Common pairings that work well:

| Use Case | Skill | MCP |
|----------|-------|-----|
| Database ops | database | supabase, postgres |
| Visual testing | testing | browser-tools |
| Git operations | devops | git |
| File search | any | filesystem |
| Web scraping | backend | puppeteer |
| AI features | backend | anthropic |

---

## Tips & Tricks

### 1. Be Specific About What You DON'T Want

```
You: Build a blog, but no comments system, no newsletter, 
     no analytics - just posts and an admin panel
```

This prevents scope creep and speeds up planning.

### 2. Use "You Pick" for Speed

```
You: Build an invoice generator, you pick the stack
```

The planner makes fast, sensible defaults.

### 3. Check Status Often

```
You: status
```

Keeps you oriented, especially in long sessions.

### 4. Resume Anytime

Close Claude, come back tomorrow:

```
You: continue
```

State is saved. It picks up exactly where you left off.

### 5. Adjust Mid-Build

```
You: Actually make the buttons rounded instead of square
```

Small tweaks don't require replanning.

```
You: Actually add a whole team collaboration feature
```

Big changes trigger a replan of affected tasks.

### 6. Save Good Skills

When the planner generates a skill that works well:

```
You: Save this skill to my library

Planner: Saved skills/payments.md and updated registry.json
```

Now it's available for all future projects.

### 7. Review Generated Docs

Your `docs/PRD.md` and `docs/ARCHITECTURE.md` are great for:
- Sharing with collaborators
- Onboarding developers later
- Remembering what you built

---

## Troubleshooting

### "Planner is stuck"

```
You: status
```

Check for blockers. If stuck:

```
You: skip [task-id]
```

Or:

```
You: replan
```

### "Wrong skill being used"

The planner matches tasks to skills via triggers. If it's wrong:

```
You: Use the backend skill for this task, not frontend
```

### "State seems corrupted"

Check `state.json` is valid JSON. If broken:

```bash
# Reset to discovery phase
./init.sh my-project --reset
```

### "MCP not working"

1. Check it's installed: `npx @anthropic/mcp list`
2. Restart Claude Code
3. Check `state.json` → `mcps.available`

### "Task keeps failing"

```
You: Show me the blocker for task t5
```

Then either:
- Fix the underlying issue
- `skip t5` and handle manually
- `replan` to try a different approach

---

## What's Next?

Once your MVP is built, the VibeShip ecosystem continues:

1. **VibeShip Scanner** - Security scan your AI-generated code
2. **VibeShip Marketplace** - Connect with devs for production hardening

---

## Quick Reference Card

```
COMMANDS
  status      - Where am I?
  continue    - Keep going
  replan      - Start over (planning)
  assumptions - View/edit
  skip [id]   - Skip task
  pause       - Stop and save

FILES
  state.json       - Current state
  task_queue.json  - All tasks
  docs/PRD.md      - Requirements
  docs/ARCH...md   - Technical spec
  skills/*.md      - Skill definitions
  registry.json    - Skill catalog

ADDING SKILLS
  1. Create skills/[name].md
  2. Add to registry.json
  3. Include triggers and MCPs

PHASES
  Discovery → Planning → Building → Review
```

---

*You vibe. It ships.*
