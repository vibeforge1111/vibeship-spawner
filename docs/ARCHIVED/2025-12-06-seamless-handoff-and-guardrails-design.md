# VibeShip Orchestrator Evolution: Seamless Handoff & Execution Guardrails

> Design document for the next phase of VibeShip Orchestrator

---

## Problem Statement

VibeShip Orchestrator currently guides vibe coders through discovery and stack building, but:

1. **Friction cliff at export** - Users must copy JSON, run shell commands, and paste config manually
2. **No execution discipline** - Once in Claude Code, there's no enforcement of best practices
3. **Static recommendations** - The stack builder doesn't intelligently suggest based on project needs
4. **Limited to catalog** - Users can't get custom skills for niche use cases

---

## Solution Overview

### Part A: Seamless Handoff

Eliminate friction between web UI and Claude Code via GitHub Gist + CLI.

### Part B: Execution Guardrails

Enforce discipline during building via mandatory behaviors and skill-based workflows.

### Part C: Intelligent Recommendations

Smart system that recommends agents, MCPs, and behaviors based on project analysis.

### Part D: Custom Skills on Demand

Generate custom skills in Claude Code when catalog doesn't cover the need.

---

## Part A: Seamless Handoff

### User Flow

```
1. User completes web UI (discovery → stack builder → summary)
2. User chooses export method:
   - "Quick export" → Anonymous GitHub Gist
   - "Save to my GitHub" → OAuth, gist on their account
3. Web UI creates gist with full config
4. User sees one-liner: npx vibeship init <gist-id>
5. CLI fetches gist, scaffolds project
6. User runs `claude` and starts building
```

### Why GitHub Gist

- Users trust GitHub (perceived security)
- Transparent - users can inspect before running
- Free infrastructure - no backend to maintain
- Gist can be viewed, forked, edited

### Export Options

| Option | Auth Required | User Owns Gist | Can Edit Later |
|--------|---------------|----------------|----------------|
| Quick export | No | No (anonymous) | No |
| Save to GitHub | Yes (OAuth) | Yes | Yes |

### CLI: `vibeship`

Published to npm as `vibeship`.

**Commands:**

```bash
npx vibeship init <gist-id>    # Scaffold from gist
npx vibeship init --local      # Scaffold from local config file
npx vibeship doctor            # Verify setup, check MCPs
```

**What `init` scaffolds:**

```
my-project/
├── CLAUDE.md              # Bootloader with stack config
├── state.json             # Initialized with decisions
├── task_queue.json        # Empty, ready for planning
├── docs/
│   ├── PRD.md             # Template
│   └── ARCHITECTURE.md    # Template
├── skills/
│   ├── _schema.md         # State management protocols
│   ├── planner.md         # Always included
│   └── [selected].md      # Based on stack
└── .claude/
    └── settings.json      # Hooks if needed
```

### Gist Structure

```json
{
  "project_name": "vintage-watch-marketplace",
  "description": "A marketplace for buying and selling vintage watches",
  "discovery": {
    "audience": "users",
    "platform": "web",
    "auth": "social",
    "data": "simple"
  },
  "agents": ["planner", "frontend", "backend", "database", "payments", "search"],
  "mcps": ["filesystem", "supabase", "stripe", "algolia"],
  "behaviors": {
    "mandatory": ["verify-before-complete", "follow-architecture", "one-task-at-a-time", "maintainable-code", "secure-code"],
    "selected": ["tdd-mode", "commit-per-task"]
  },
  "custom_skills_needed": ["vintage-valuation"],
  "generated_at": "2025-12-06T18:30:00Z"
}
```

---

## Part B: Execution Guardrails

### Mandatory Behaviors (Always Enforced)

These are non-negotiable and baked into every skill:

| Behavior | Description |
|----------|-------------|
| **Verify before complete** | Run the code, confirm it works, before marking task done |
| **Follow the architecture** | Don't deviate from ARCHITECTURE.md without user approval |
| **One task at a time** | Complete current task before starting next |
| **Write maintainable code** | Clear naming, logical structure, no magic numbers, DRY |
| **Write secure code** | OpenGrep/Semgrep standards, input validation, no secrets in code, OWASP basics |

### User-Selected Behaviors (Toggles)

Shown in "Build Discipline" section of stack builder:

| Behavior | Description | Recommended When |
|----------|-------------|------------------|
| **TDD mode** | Write test first, watch it fail, then implement | Production apps, APIs |
| **Commit per task** | Auto-commit after each completed task | Team projects, audit trails |
| **Explain as you go** | Add comments explaining decisions | Learning, handoff to others |

### Implementation

Behaviors are enforced via skill instructions. Example in `skills/_schema.md`:

```markdown
## Mandatory Behaviors

Before marking ANY task complete:

1. **Verify** - Run the code/tests, confirm working
2. **Architecture check** - Confirm no deviation from ARCHITECTURE.md
3. **Security scan** - Run `npx opengrep` on changed files
4. **Maintainability** - Review for clear naming, no magic numbers
```

---

## Part C: Intelligent Recommendations

### Overview

An intelligence layer that analyzes the project description and makes contextual recommendations for:

1. Agents (skills)
2. MCPs
3. Behaviors
4. Custom skills needed

### How It Works

**Input:** Project description + discovery answers

**Processing:**
1. Parse description for keywords and intent
2. Match against project type patterns (marketplace, SaaS, AI app, etc.)
3. Identify required capabilities
4. Map to agents, MCPs, behaviors
5. Detect gaps requiring custom skills

**Output:** Recommendations with explanations

### Example Recommendations

**User input:** "A marketplace for vintage watches with authentication, payments, and search"

**Intelligence output:**

```
Based on your project, I recommend:

AGENTS:
✓ planner (always included)
✓ frontend - You'll need UI for listings, search, checkout
✓ backend - API for listings, auth, transactions
✓ database - Store users, listings, orders
✓ payments - Stripe integration for purchases
✓ search - Algolia for finding watches

MCPs:
✓ filesystem (core)
✓ supabase - Auth + database in one
✓ stripe - Payment processing
✓ algolia - Full-text search

BEHAVIORS:
✓ TDD mode - Recommended for marketplace (money involved)
✓ Commit per task - Recommended for complex projects

CUSTOM SKILLS NEEDED:
⚡ vintage-valuation - For pricing guidance (will be generated during setup)
```

### Intelligence Rules (Examples)

```javascript
// Pattern matching rules
const rules = [
  {
    keywords: ["marketplace", "buy", "sell", "listings"],
    recommendAgents: ["payments", "search"],
    recommendMcps: ["stripe", "algolia"],
    recommendBehaviors: ["tdd-mode"]
  },
  {
    keywords: ["ai", "llm", "chat", "assistant"],
    recommendAgents: ["ai"],
    recommendMcps: ["anthropic"],
    recommendBehaviors: []
  },
  {
    keywords: ["real-time", "live", "websocket"],
    flagCustomSkill: "websockets"
  },
  {
    keywords: ["payments", "checkout", "subscription"],
    requireMcps: ["stripe"],
    recommendAgents: ["email"] // for receipts
  }
];
```

### UI Integration

In the stack builder, show recommendations with reasoning:

```
┌─────────────────────────────────────────────────┐
│ RECOMMENDED FOR YOUR PROJECT                    │
├─────────────────────────────────────────────────┤
│ + payments                                      │
│   "You mentioned buying/selling"                │
│                                                 │
│ + search                                        │
│   "Marketplaces need search for listings"       │
│                                                 │
│ ⚡ vintage-valuation (custom)                   │
│   "Will be created during setup"                │
└─────────────────────────────────────────────────┘
```

---

## Part D: Custom Skills on Demand

### Philosophy

- Curated catalog covers 90%+ of use cases
- Custom skills fill gaps for niche needs
- Creation happens in Claude Code (no API cost in web UI)
- Skills live in the project, can be shared later

### Flow

**In Web UI:**
1. Intelligence detects need for skill not in catalog
2. Flags it: "Custom skill needed: exchange-api"
3. Adds to config under `custom_skills_needed`

**After `npx vibeship init`:**
1. CLI scaffolds project with catalog skills
2. Notes custom skills needed in `state.json`
3. When user runs `claude`, planner sees the flag
4. Planner generates custom skill based on project context
5. Saves to `skills/[custom].md`
6. Adds to agent roster

### Custom Skill Template

Generated skills follow this structure:

```markdown
# [Skill Name]

> Auto-generated for [project-name]

---

## Identity

You are the [Name] agent. Your expertise: [description]

---

## Capabilities

- [capability 1]
- [capability 2]

---

## Workflow

1. [step 1]
2. [step 2]

---

## Integration

Works with: [other agents]
Required MCPs: [mcps]
```

### Sharing Custom Skills

Future feature: Users can submit their custom skills back to the catalog.

```bash
npx vibeship share skills/exchange-api.md
```

---

## UI Changes Required

### Stack Builder Updates

1. **Add "Build Discipline" section** after MCPs
   - Toggles for user-selected behaviors
   - Show which are mandatory (greyed out, always on)

2. **Add intelligence recommendations**
   - "Recommended for your project" section
   - One-click to add recommended agents/MCPs
   - Show reasoning for each recommendation

3. **Show custom skills flag**
   - Alert when custom skill will be needed
   - Explain it will be generated during setup

### Summary Page Updates

1. **Add behaviors to config preview**
2. **Show custom skills that will be generated**
3. **Update export options**
   - "Quick export (anonymous gist)"
   - "Save to my GitHub"
4. **Show the one-liner command**

---

## CLI Implementation

### Package: `vibeship`

```json
{
  "name": "vibeship",
  "version": "1.0.0",
  "bin": {
    "vibeship": "./bin/vibeship.js"
  },
  "dependencies": {
    "commander": "^12.0.0",
    "ora": "^8.0.0",
    "chalk": "^5.0.0"
  }
}
```

### Commands

**`vibeship init <gist-id>`**
1. Fetch gist from GitHub API
2. Parse config JSON
3. Create project directory
4. Copy template files
5. Write CLAUDE.md with config
6. Copy relevant skills
7. Initialize state.json
8. Run `npm init` if needed
9. Print success message with next steps

**`vibeship doctor`**
1. Check Node.js version
2. Check if `claude` CLI installed
3. Check required MCPs installed
4. Report any issues

---

## Security Considerations

### Gist Content
- Project descriptions may contain business ideas
- Anonymous gists are public but unlisted
- Recommend authenticated gists for sensitive projects

### Code Security
- OpenGrep/Semgrep scans on all generated code
- No secrets in code (enforced by mandatory behavior)
- Input validation enforced by skill instructions

### CLI Security
- Only fetch from GitHub gist API (trusted source)
- Validate JSON structure before processing
- No arbitrary code execution from config

---

## Success Metrics

1. **Handoff completion rate** - % of users who successfully run `npx vibeship init`
2. **Time to first build** - Minutes from export to Claude Code running
3. **Security scan pass rate** - % of projects passing OpenGrep on first build
4. **Custom skill generation rate** - How often custom skills are needed

---

## Implementation Phases

### Phase 1: CLI + Basic Handoff
- Build `vibeship` CLI
- Add gist export (anonymous only) to web UI
- Update summary page with one-liner

### Phase 2: GitHub OAuth + Behaviors
- Add GitHub OAuth for authenticated gists
- Add "Build Discipline" section to stack builder
- Implement mandatory behaviors in skills

### Phase 3: Intelligent Recommendations
- Build recommendation engine
- Add recommendations UI to stack builder
- Implement custom skill flagging

### Phase 4: Custom Skill Generation
- Update planner skill to generate custom skills
- Add custom skill templates
- Test with edge cases

---

## Open Questions

1. Should we offer a "preview" mode where users can see what will be scaffolded before running init?
2. Rate limiting: GitHub API has limits for anonymous requests - do we need caching?
3. Should custom skills be auto-submitted to catalog for review after successful project completion?

---

*Design created: 2025-12-06*
*Status: Ready for implementation*
