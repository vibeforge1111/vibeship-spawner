# World-Class Skill Creation System

> Design for automatically creating top 0.00001% expert-level skills through research, validation, and quality enforcement.

**Date:** 2025-12-20
**Status:** Design Complete - Ready for Implementation

---

## Relationship to Existing Spawner System

**This is an upgrade layer, not a replacement.**

The existing Spawner system provides:
- ✅ Skill YAML schema (`skill.yaml`, `sharp-edges.yaml`, `validations.yaml`)
- ✅ Category-based organization (development, frameworks, integration, etc.)
- ✅ Skill loading and matching infrastructure
- ✅ KV storage and upload scripts
- ✅ MCP tool interface (`spawner_skill_new`, `spawner_skills`, etc.)

**This design adds:**
- 🆕 Automatic research phase before skill generation
- 🆕 Validation gates to enforce depth
- 🆕 Richer identity structure (battle scars, opinions, history, limits)
- 🆕 `collaboration.yaml` for skill interaction and delegation
- 🆕 Quality scoring rubric (100-point scale, 80 minimum)
- 🆕 New tools: `spawner_skill_research`, `spawner_skill_score`, `spawner_skill_upgrade`

**All existing conventions remain:**
- Skills still live in `spawner-v2/skills/{category}/{skill-id}/`
- YAML schema is extended, not replaced
- Upload to KV works the same way
- Existing skills remain valid (can be upgraded with new tools)

**When spawning new skills, this system ensures:**
1. Research happens automatically (not optional)
2. Quality is enforced (can't ship shallow skills)
3. Skills collaborate (not isolated islands)
4. Every skill represents elite expertise

---

## Overview

When `spawner_skill_new` is called, it triggers a 4-phase pipeline that ensures every skill represents elite expertise - the kind that comes from decades of battle scars, not just reading docs.

```
┌─────────────────────────────────────────────────────────────┐
│  1. RESEARCH PHASE                                          │
│     Auto-fetch docs, issues, pain points, ecosystem         │
│     Output: Research findings document                      │
├─────────────────────────────────────────────────────────────┤
│  2. VALIDATION GATE                                         │
│     Verify research depth is sufficient                     │
│     Minimum: X sources, Y pain points, Z alternatives       │
├─────────────────────────────────────────────────────────────┤
│  3. GENERATION PHASE                                        │
│     Generate skill files pre-filled with research findings  │
│     Identity, patterns, edges, validations all informed     │
├─────────────────────────────────────────────────────────────┤
│  4. QUALITY SCORING                                         │
│     Score skill against world-class criteria                │
│     Flag gaps, suggest improvements                         │
└─────────────────────────────────────────────────────────────┘
```

**Key shift:** Research is automatic and mandatory, not optional or deferred. The skill comes out pre-filled with real findings, not placeholders.

---

## Research Phase

### Technical Skills (frameworks, development, integration)

```
┌─────────────────────────────────────────────────────────────┐
│  TECHNICAL SKILL RESEARCH                                   │
├─────────────────────────────────────────────────────────────┤
│  1. OFFICIAL SOURCES (Priority 1)                           │
│     • Fetch official docs / API reference                   │
│     • Recent changelog / breaking changes                   │
│     • Migration guides                                      │
├─────────────────────────────────────────────────────────────┤
│  2. COMMUNITY PAIN POINTS (Priority 2)                      │
│     • Top GitHub issues (most 👍, most commented)           │
│     • Stack Overflow top questions for [skill]              │
│     • Reddit/HN complaints and frustrations                 │
├─────────────────────────────────────────────────────────────┤
│  3. ECOSYSTEM MAPPING (Priority 3)                          │
│     • Top 3-5 alternative libraries/tools                   │
│     • What pairs well (complementary tools)                 │
│     • What's deprecated / avoid                             │
├─────────────────────────────────────────────────────────────┤
│  4. EXPERT CONTENT (Priority 4)                             │
│     • "awesome-[skill]" lists                               │
│     • Blog posts from known practitioners                   │
│     • Conference talks / tutorials                          │
└─────────────────────────────────────────────────────────────┘

Output: research_findings with structured sections
```

This feeds directly into skill generation:
- Sharp edges come from real GitHub issues
- Patterns from expert content
- Ecosystem becomes the handoffs map

### Non-Technical Skills (strategy, marketing, startup, product, design)

```
┌─────────────────────────────────────────────────────────────┐
│  NON-TECHNICAL SKILL RESEARCH                               │
├─────────────────────────────────────────────────────────────┤
│  1. PRACTITIONERS & THOUGHT LEADERS (Priority 1)            │
│     • Essays from known experts (PG, Naval, etc.)           │
│     • Interviews, podcast transcripts                       │
│     • Twitter threads from practitioners                    │
├─────────────────────────────────────────────────────────────┤
│  2. CASE STUDIES & POST-MORTEMS (Priority 2)                │
│     • Real success stories with specifics                   │
│     • Failure post-mortems ("what we learned")              │
│     • Before/after transformations                          │
├─────────────────────────────────────────────────────────────┤
│  3. FRAMEWORKS & MENTAL MODELS (Priority 3)                 │
│     • Decision frameworks experts use                       │
│     • Heuristics and rules of thumb                         │
│     • Checklists from practitioners                         │
├─────────────────────────────────────────────────────────────┤
│  4. CONTRARIAN & EDGE CASES (Priority 4)                    │
│     • What conventional wisdom gets wrong                   │
│     • When the "best practice" fails                        │
│     • Minority opinions that turned out right               │
└─────────────────────────────────────────────────────────────┘

Output: research_findings with structured sections
```

This feeds into skill generation:
- Sharp edges come from post-mortems
- Patterns from frameworks
- Identity from practitioner insights
- Contrarian views become the "strong opinions"

---

## Validation Gate

After research, before generation, validate that we have enough depth:

```
┌─────────────────────────────────────────────────────────────┐
│  VALIDATION GATE - Minimum Requirements                     │
├─────────────────────────────────────────────────────────────┤
│  TECHNICAL SKILLS                                           │
│  □ Official docs fetched and parsed                         │
│  □ 5+ real pain points from GitHub/SO/Reddit                │
│  □ 3+ alternative tools/libraries identified                │
│  □ 2+ expert sources referenced                             │
│  □ Recent version / breaking changes noted                  │
├─────────────────────────────────────────────────────────────┤
│  NON-TECHNICAL SKILLS                                       │
│  □ 3+ practitioner sources identified                       │
│  □ 2+ real case studies (success or failure)                │
│  □ 2+ frameworks/mental models documented                   │
│  □ 1+ contrarian insight captured                           │
├─────────────────────────────────────────────────────────────┤
│  BOTH                                                       │
│  □ Adjacent skills identified (prerequisites)               │
│  □ Handoff triggers mapped (delegation points)              │
│  □ "What most people get wrong" captured                    │
└─────────────────────────────────────────────────────────────┘

If validation fails → prompt for more research
If validation passes → proceed to generation
```

This gate ensures no shallow skills get through.

---

## Generation Phase

### World-Class Identity Structure

The identity section gets generated with enforced depth:

```
┌─────────────────────────────────────────────────────────────┐
│  WORLD-CLASS IDENTITY STRUCTURE                             │
├─────────────────────────────────────────────────────────────┤
│  WHO YOU ARE                                                │
│  • Role with specific experience level (decades, not years) │
│  • Battle scars that shaped your perspective                │
│  • Companies/contexts where you earned this knowledge       │
├─────────────────────────────────────────────────────────────┤
│  STRONG OPINIONS (from research)                            │
│  • 5-7 non-negotiable principles                            │
│  • Each with reasoning, not just assertion                  │
│  • Contrarian views that most practitioners get wrong       │
├─────────────────────────────────────────────────────────────┤
│  HISTORY & EVOLUTION                                        │
│  • Why things are the way they are                          │
│  • What was tried before and failed                         │
│  • Where the field is heading                               │
├─────────────────────────────────────────────────────────────┤
│  KNOWING YOUR LIMITS                                        │
│  • What you explicitly don't know                           │
│  • When to defer to other expertise                         │
│  • Adjacent skills that complement yours                    │
├─────────────────────────────────────────────────────────────┤
│  PREREQUISITE KNOWLEDGE                                     │
│  • What someone must understand to use this skill well      │
│  • Cross-domain insights that inform your expertise         │
└─────────────────────────────────────────────────────────────┘
```

This replaces the current generic "You are a [role] who has [experience]" placeholder.

### Skill Collaboration & Delegation Model

Skills need to know how to work with other skills, not just hand off context:

```
┌─────────────────────────────────────────────────────────────┐
│  SKILL COLLABORATION MODEL                                  │
├─────────────────────────────────────────────────────────────┤
│  PREREQUISITE SKILLS                                        │
│  • Skills you assume the user has access to                 │
│  • Knowledge domains you build upon                         │
│  • Example: "cybersecurity" assumes "backend" basics        │
├─────────────────────────────────────────────────────────────┤
│  COMPLEMENTARY SKILLS MAP                                   │
│  • 5-10 related skills and how they interact                │
│  • What each skill brings to the collaboration              │
│  • Example: "frontend" + "ui-design" + "accessibility"      │
├─────────────────────────────────────────────────────────────┤
│  DELEGATION TRIGGERS                                        │
│  • When to let another skill take over completely           │
│  • Not just "hand off context" but "you do this part"       │
│  • Example: "When user needs database schema → delegate     │
│    to backend skill, receive completed schema back"         │
├─────────────────────────────────────────────────────────────┤
│  COLLABORATION PATTERNS                                     │
│  • Sequential: "I do X, then Y skill does Z"                │
│  • Parallel: "I handle A while Y skill handles B"           │
│  • Review: "Y skill reviews my output for their domain"     │
├─────────────────────────────────────────────────────────────┤
│  CROSS-DOMAIN INSIGHTS                                      │
│  • What you know about adjacent fields that informs yours   │
│  • Example: "Security expert understands attacker psychology│
│    not just technical exploits"                             │
└─────────────────────────────────────────────────────────────┘
```

This replaces the simple `handoffs:` with a richer collaboration model.

---

## Quality Scoring

After generation, score the skill against world-class criteria:

```
┌─────────────────────────────────────────────────────────────┐
│  WORLD-CLASS SKILL SCORECARD                                │
├─────────────────────────────────────────────────────────────┤
│  IDENTITY DEPTH                           /25 points        │
│  □ Battle scars specific, not generic         (5)           │
│  □ Strong opinions with reasoning             (5)           │
│  □ Contrarian insights included               (5)           │
│  □ History/evolution documented               (5)           │
│  □ Limits & prerequisites clear               (5)           │
├─────────────────────────────────────────────────────────────┤
│  SHARP EDGES QUALITY                      /25 points        │
│  □ 8-12 edges from real pain points           (5)           │
│  □ Each has specific situation, not generic   (5)           │
│  □ Solutions are copy-paste ready             (5)           │
│  □ Detection patterns tested                  (5)           │
│  □ Sourced from real issues/complaints        (5)           │
├─────────────────────────────────────────────────────────────┤
│  PATTERNS & ANTI-PATTERNS                 /25 points        │
│  □ Patterns from expert content               (5)           │
│  □ Anti-patterns from real failures           (5)           │
│  □ Code examples actually work                (5)           │
│  □ "Why" is non-obvious                       (5)           │
│  □ Trade-offs documented                      (5)           │
├─────────────────────────────────────────────────────────────┤
│  COLLABORATION & ECOSYSTEM                /25 points        │
│  □ Prerequisites identified                   (5)           │
│  □ 5+ complementary skills mapped             (5)           │
│  □ Delegation triggers defined                (5)           │
│  □ Cross-domain insights captured             (5)           │
│  □ Ecosystem alternatives known               (5)           │
├─────────────────────────────────────────────────────────────┤
│  MINIMUM TO SHIP: 80/100                                    │
│  Below 80 → Flag gaps, require improvements                 │
└─────────────────────────────────────────────────────────────┘
```

This ensures no mediocre skills get through.

---

## Tool Flow

### Complete Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│  spawner_skill_new({ id, name, category, ... })             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  STEP 1: DETECT SKILL TYPE                                  │
│  └─→ Technical (frameworks, development, integration)       │
│  └─→ Non-technical (strategy, marketing, startup, etc.)     │
│                                                             │
│  STEP 2: AUTO-RESEARCH (based on type)                      │
│  └─→ Web search official docs, GitHub issues, SO, experts   │
│  └─→ Fetch and parse key sources                            │
│  └─→ Output: research_findings object                       │
│                                                             │
│  STEP 3: VALIDATION GATE                                    │
│  └─→ Check minimum requirements met                         │
│  └─→ If insufficient: prompt for more research              │
│  └─→ If sufficient: proceed                                 │
│                                                             │
│  STEP 4: GENERATE PRE-FILLED SKILL                          │
│  └─→ skill.yaml (rich identity, patterns, anti-patterns)    │
│  └─→ sharp-edges.yaml (from real pain points found)         │
│  └─→ validations.yaml (detection patterns from research)    │
│  └─→ collaboration.yaml (NEW: skill interaction map)        │
│                                                             │
│  STEP 5: QUALITY SCORE                                      │
│  └─→ Score against 100-point rubric                         │
│  └─→ Flag gaps if below 80                                  │
│  └─→ Return skill + score + improvement suggestions         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Output:** 4 files instead of 3, plus a quality score.

### Complete Tool Suite

```
┌─────────────────────────────────────────────────────────────┐
│  WORLD-CLASS SKILL CREATION TOOL SUITE                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  spawner_skill_new({ id, name, category, ... })             │
│  └─→ Full pipeline: research → validate → generate → score  │
│  └─→ Returns: 4 files + quality score + suggestions         │
│                                                             │
│  spawner_skill_research({ id, name, category })             │
│  └─→ Just the research phase                                │
│  └─→ Returns: research_findings object for review           │
│                                                             │
│  spawner_skill_score({ skill_path })                        │
│  └─→ Score existing skill against rubric                    │
│  └─→ Returns: score + gaps + improvement suggestions        │
│                                                             │
│  spawner_skill_upgrade({ skill_path, focus? })              │
│  └─→ Enhance existing skill with more research              │
│  └─→ Optional focus: "identity", "edges", "collaboration"   │
│  └─→ Returns: upgraded skill + before/after score           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Approach

**Hybrid Architecture (Recommended):**

- `spawner_skill_new` orchestrates internally, but research/score are separate functions
- External API stays simple (one call), internals are modular
- Can expose `spawner_skill_research` separately for manual control

**User calls `spawner_skill_new`** → it internally calls research → validates → generates → scores → returns complete skill with score.

**Power users can call `spawner_skill_research` separately** if they want to review findings before generation.

**`spawner_skill_upgrade` allows iterating** on existing skills to fix gaps or deepen specific areas.

---

## New File Structure

Each skill now has 4 files:

```
skills/{category}/{skill-id}/
├── skill.yaml           # Identity + patterns + anti-patterns + handoffs
├── sharp-edges.yaml     # Gotchas with detection (8-12)
├── validations.yaml     # Automated checks (8-12)
└── collaboration.yaml   # NEW: Prerequisites, skill map, delegation
```

### collaboration.yaml Schema

```yaml
# Skill Collaboration Model
prerequisites:
  skills:
    - backend           # Must understand backend basics
    - networking        # TCP/IP, HTTP fundamentals
  knowledge:
    - "How web requests flow from client to server"
    - "Basic authentication concepts"

complementary_skills:
  - skill: frontend
    relationship: "Often pair when building full-stack features"
    brings: "Client-side security, input validation"
  - skill: devops
    relationship: "Deploy and monitor security controls"
    brings: "Infrastructure security, secrets management"
  - skill: qa-engineering
    relationship: "Security testing integration"
    brings: "Penetration testing, vulnerability scanning"

delegation:
  - trigger: "database schema design"
    delegate_to: backend
    pattern: sequential
    context: "Security requirements to enforce in schema"
    receive: "Completed schema with RLS policies"

  - trigger: "infrastructure security"
    delegate_to: devops
    pattern: parallel
    context: "Application security requirements"
    receive: "Infrastructure security controls"

cross_domain_insights:
  - domain: psychology
    insight: "Attackers exploit human behavior, not just code"
    applies_when: "Designing auth flows, error messages, social engineering defenses"
  - domain: economics
    insight: "Security is about making attacks more expensive than rewards"
    applies_when: "Prioritizing security investments, threat modeling"
```

---

## What Makes This World-Class

1. **Research is automatic** - No more placeholder templates, real findings baked in
2. **Validation enforces depth** - Can't skip research, minimum requirements enforced
3. **Identity is elite** - Battle scars, strong opinions, history, limits - not generic
4. **Collaboration is rich** - Skills delegate, review each other, share insights
5. **Quality is scored** - 100-point rubric, 80 minimum to ship
6. **Upgrades are possible** - Iterate on existing skills to deepen them

The goal: **Every skill represents top 0.00001% expertise - the knowledge that takes decades to accumulate, automatically researched and enforced.**
