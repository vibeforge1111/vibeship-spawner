# Skills Directory Design

**Date:** 2025-12-21
**Status:** Approved

## Overview

A complete redesign of the skills browsing experience to make it discoverable, deep, and differentiated - without being salesy. Shows what's inside each skill and teaches users how to create their own.

## Audience

1. **Developers evaluating VibeShip** - Want to see what skills exist before adopting
2. **Active VibeShip users** - Mid-project, need to find/understand specific skills
3. **Skill creators** - Want to create their own local skills

## Problems Solved

1. **Discoverability** - Hard to find the right skill for a task
2. **Depth** - Can't see inside skills (patterns, sharp edges, validations)
3. **Differentiation** - Doesn't show what makes these skills special
4. **Education** - No clear path to create your own skills

---

## Page Structure

### `/skills` - Main Directory

```
┌─────────────────────────────────────────────────────┐
│  HEADER: "Skills Directory"                         │
│  Subhead: "55+ specialized skills. See what's      │
│  inside. Find what you need."                       │
├─────────────────────────────────────────────────────┤
│  DISCOVERY BAR                                      │
│  ┌─────────────────────────────────────────────┐   │
│  │ Search skills...                             │   │
│  └─────────────────────────────────────────────┘   │
│  [Categories ▼] [Layer ▼] [Tags ▼] [Pairs with ▼]  │
│                                                     │
│  Or: "Help me find a skill →" (task-based finder)  │
├─────────────────────────────────────────────────────┤
│  SKILLS GRID                                        │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐       │
│  │ Skill  │ │ Skill  │ │ Skill  │ │ Skill  │       │
│  │ Card   │ │ Card   │ │ Card   │ │ Card   │       │
│  └────────┘ └────────┘ └────────┘ └────────┘       │
└─────────────────────────────────────────────────────┘
```

**Skill Card contents:**
- Name + one-line description
- Category badge + Layer indicator (Core/Integration/Polish)
- 2-3 top tags
- "View Details →"

**Filters:**
- Category (Development, Frameworks, Design, Strategy...)
- Layer (Core, Integration, Polish)
- Tags (react, typescript, security...)
- Pairs with (show compatible skills)

**Mobile:** Cards stack vertically, filters collapse into bottom sheet.

---

### `/skills/[id]` - Skill Detail View

```
┌─────────────────────────────────────────────────────┐
│  ← Back to Skills                                   │
├─────────────────────────────────────────────────────┤
│  SKILL HEADER                                       │
│  ┌─────────────────────────────────────────────┐   │
│  │ SvelteKit                        [Layer: 1] │   │
│  │ Expert knowledge for full-stack SvelteKit   │   │
│  │                                              │   │
│  │ Tags: sveltekit, svelte5, ssr, runes        │   │
│  │ Pairs with: supabase-backend, tailwind-ui   │   │
│  └─────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────┤
│  TABS                                               │
│  [Identity] [Patterns] [Sharp Edges] [Validations] │
│  [Collaboration] [View All]                         │
├─────────────────────────────────────────────────────┤
│  TAB CONTENT (scrollable)                           │
└─────────────────────────────────────────────────────┘
```

**Tab contents:**

| Tab | Shows |
|-----|-------|
| **Identity** | Who this skill is, what it owns, triggers |
| **Patterns** | Best practices with code examples |
| **Sharp Edges** | Gotchas with severity, situation, fix |
| **Validations** | Code checks that run automatically |
| **Collaboration** | Prerequisites, pairs_with, handoffs |
| **View All** | Everything in one scrollable view |

**Sharp Edge card example:**
```
┌─────────────────────────────────────────────────────┐
│ ⚠️ hydration-mismatch                   [CRITICAL] │
│ SSR/Client mismatch crashes hydration               │
│                                                     │
│ When: Server and client HTML differ                 │
│ Why: React/Vue/Svelte will fail to hydrate          │
│ Fix: Ensure deterministic rendering                 │
└─────────────────────────────────────────────────────┘
```

**Mobile:** Tabs become horizontal scrollable strip or dropdown selector.

---

### Differentiation Section

Placed on `/skills` page (above or below grid):

```
┌─────────────────────────────────────────────────────┐
│  WHAT'S INSIDE EACH SKILL                           │
│                                                     │
│  Not just prompts. Each skill is a 4-file system:   │
│                                                     │
│  ┌──────────────────┐  ┌──────────────────┐        │
│  │ skill.yaml       │  │ sharp-edges.yaml │        │
│  │                  │  │                  │        │
│  │ Identity         │  │ 8-12 gotchas     │        │
│  │ Patterns         │  │ with detection   │        │
│  │ Anti-patterns    │  │ patterns         │        │
│  │ Triggers         │  │                  │        │
│  └──────────────────┘  └──────────────────┘        │
│                                                     │
│  ┌──────────────────┐  ┌──────────────────┐        │
│  │ validations.yaml │  │ collaboration    │        │
│  │                  │  │                  │        │
│  │ 8-12 code checks │  │ Prerequisites    │        │
│  │ that actually    │  │ Pairs with       │        │
│  │ run on your code │  │ Handoffs         │        │
│  └──────────────────┘  └──────────────────┘        │
│                                                     │
│  Every skill scores 80+ on our 100-point rubric.   │
│  → See the rubric                                   │
└─────────────────────────────────────────────────────┘
```

**Key messages (concise, no hype):**
- Sharp edges have detection patterns
- Validations run on your code
- Skills know when to hand off
- 100-point quality bar

---

### `/skills/find` - Task-Based Finder

```
┌─────────────────────────────────────────────────────┐
│  FIND THE RIGHT SKILL                               │
│                                                     │
│  What are you trying to do?                         │
│  ┌─────────────────────────────────────────────┐   │
│  │ e.g., "build a landing page with React"     │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  OR PICK A SCENARIO:                                │
│                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ Starting    │ │ Building    │ │ Debugging   │   │
│  │ a new       │ │ a feature   │ │ an issue    │   │
│  │ project     │ │             │ │             │   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
│                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ Design &    │ │ Growth &    │ │ Security    │   │
│  │ UI/UX       │ │ Marketing   │ │ & DevOps    │   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
│                                                     │
├─────────────────────────────────────────────────────┤
│  RECOMMENDED SKILLS                                 │
│  Based on: "build a landing page with React"       │
│                                                     │
│  ⭐ react-patterns (primary)                        │
│  + landing-page-design (pairs well)                 │
│  + tailwind-ui (pairs well)                         │
│                                                     │
│  [Use these skills →]                               │
└─────────────────────────────────────────────────────┘
```

**How it works:**
- Text input matches against triggers, tags, descriptions
- Scenario cards pre-filter categories
- Shows primary skill + "pairs well" suggestions

---

### `/skills/create` - Skill Creation Guide

```
┌─────────────────────────────────────────────────────┐
│  CREATE YOUR OWN SKILLS                             │
│  "Don't see what you need? Build it locally."       │
├─────────────────────────────────────────────────────┤
│  THE ANATOMY OF A SKILL                             │
│                                                     │
│  my-skill/                                          │
│  ├── skill.yaml       ← who you are                │
│  ├── sharp-edges.yaml ← gotchas                    │
│  ├── validations.yaml ← code checks                │
│  └── collaboration.yaml ← handoffs                 │
│                                                     │
├─────────────────────────────────────────────────────┤
│  STEP-BY-STEP WALKTHROUGH                           │
│                                                     │
│  Step 1: Start with identity     [Current]         │
│  Step 2: Add patterns & anti-patterns              │
│  Step 3: Define sharp edges                         │
│  Step 4: Create validations                         │
│  Step 5: Set up collaboration                       │
│                                                     │
│  [Interactive annotated example for each step]      │
│                                                     │
├─────────────────────────────────────────────────────┤
│  OR USE SPAWNER                                     │
│  Run `spawner_skill_new` to generate scaffold       │
│  Run `spawner_skill_upgrade` to enhance existing    │
└─────────────────────────────────────────────────────┘
```

**Approach:** Interactive walkthrough + annotated real examples + visual guide.

---

## Navigation & URLs

**Navbar dropdown:**
```
[Skills ▼]
├── Browse All      → /skills
├── Find a Skill    → /skills/find
├── Create Your Own → /skills/create
├── ───────────────
├── Development     → /skills?category=development
├── Frameworks      → /skills?category=frameworks
├── Design          → /skills?category=design
└── Strategy        → /skills?category=strategy
```

**Deep linking:**
- `/skills` - Main directory
- `/skills/sveltekit` - Skill detail
- `/skills/sveltekit#sharp-edges` - Jump to tab
- `/skills?category=frameworks` - Category filter
- `/skills?tags=react,typescript` - Tag filter
- `/skills?pairs_with=supabase-backend` - Compatibility filter

---

## Mobile Responsiveness

| Component | Mobile Behavior |
|-----------|-----------------|
| Skill cards | Stack vertically |
| Filters | Collapse into bottom sheet |
| Tabs | Horizontal scroll strip or dropdown |
| Code examples | Horizontal scroll |
| Scenario cards | 2-column grid |
| Navigation | Hamburger menu |

---

## Technical Notes

- Skills data loaded from YAML files via Spawner API
- Search uses skill triggers, tags, and descriptions
- "Pairs with" uses `pairs_with` field from skill.yaml
- Layer indicator maps to 1=Core, 2=Integration, 3=Polish
- Tab anchors use hash routing (`#sharp-edges`)

---

## Success Criteria

1. Users can find relevant skills in <30 seconds
2. Skill detail pages show all 4 YAML files' content clearly
3. Differentiation is obvious without reading marketing copy
4. Skill creation guide is approachable for non-experts
5. Works great on mobile
