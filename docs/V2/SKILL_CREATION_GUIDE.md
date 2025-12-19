# World-Class Skill Creation Guide

> The definitive guide to creating skills that transform Claude into a domain expert

## TL;DR

A world-class skill has **3 YAML files**:

| File | Purpose | Machine Use |
|------|---------|-------------|
| `skill.yaml` | Identity, patterns, anti-patterns, handoffs | Skill matching, context loading |
| `sharp-edges.yaml` | Gotchas with detection patterns | Proactive warnings, code scanning |
| `validations.yaml` | Automated checks | Real-time code validation |

Optional markdown files (`patterns.md`, `anti-patterns.md`, `decisions.md`, `sharp-edges.md`) provide deeper prose for complex topics.

---

## Part 1: Understanding Skills

### What is a Skill?

A skill transforms Claude from a general assistant into a **domain expert with battle scars**. It's not documentation—it's crystallized experience.

**Without skill:** Claude gives generic React advice
**With skill:** Claude knows that `useEffect` with missing deps causes infinite loops, catches it in your code, and shows the exact fix

### The Three Pillars

```
┌─────────────────────────────────────────────────────────┐
│                    SKILL ANATOMY                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  1. IDENTITY (skill.yaml)                              │
│     WHO is this expert? What do they believe?          │
│     → Patterns they follow                             │
│     → Anti-patterns they avoid                         │
│     → When to hand off to other experts                │
│                                                         │
│  2. SHARP EDGES (sharp-edges.yaml)                     │
│     WHAT mistakes cause real pain?                     │
│     → Specific gotchas with detection patterns         │
│     → Why it hurts (consequences)                      │
│     → How to fix it (solutions)                        │
│                                                         │
│  3. VALIDATIONS (validations.yaml)                     │
│     HOW do we catch problems automatically?            │
│     → Regex patterns for common mistakes               │
│     → File-type targeting                              │
│     → Actionable fix suggestions                       │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Why YAML?

**Markdown = Human-readable documentation**
```markdown
## Don't Use eval()
Using eval() is dangerous because...
```

**YAML = Machine-actionable intelligence**
```yaml
- id: dangerous-eval
  severity: critical
  detection_pattern: 'eval\s*\('
  situation: User input passed to eval
  fix_action: "Use JSON.parse() for data or explicit logic"
```

With YAML, the system can:
- **Match situations** → Surface relevant warnings proactively
- **Scan code** → Find problems before they ship
- **Filter by severity** → Show critical issues first
- **Trigger handoffs** → Know when to involve other skills

---

## Part 2: The Schema

### skill.yaml

```yaml
# Required metadata
id: skill-name                    # kebab-case, unique identifier
name: Skill Display Name          # Human-readable name
version: 1.0.0                    # Semantic versioning
layer: 1                          # 1=execution, 2=tactical, 3=strategic
description: One-line description of what this skill covers

# Classification
owns:                             # Concepts this skill is authoritative on
  - concept-one
  - concept-two

pairs_with:                       # Skills that complement this one
  - related-skill-one
  - related-skill-two

requires: []                      # Dependencies (usually empty)

tags:                             # Searchable keywords
  - tag1
  - tag2

triggers:                         # Phrases that activate this skill
  - "trigger phrase one"
  - "trigger phrase two"

# The Expert's Voice
identity: |
  You're a [role] who has [experience]. You've [battle scars].

  Your core principles:
  1. First principle
  2. Second principle
  3. Third principle

# Best Practices (3-6 patterns)
patterns:
  - name: Pattern Name
    description: What this pattern achieves
    when: Situations where this applies
    example: |
      // Code example showing the pattern
      const good = doItRight()

# Common Mistakes (3-6 anti-patterns)
anti_patterns:
  - name: Anti-Pattern Name
    description: What people do wrong
    why: Why this causes problems
    instead: What to do instead

# When to Involve Other Skills
handoffs:
  - trigger: "keyword or phrase"
    to: other-skill-id
    context: Why this handoff makes sense
```

### sharp-edges.yaml

```yaml
# Sharp Edges - The Gotchas That Cause Real Pain
# Each edge should be something you learned the hard way

sharp_edges:
  - id: kebab-case-identifier
    summary: One-line description of the mistake
    severity: critical | high | medium | low
    situation: |
      When/how people typically encounter this problem
    why: |
      The real consequences - what actually breaks, costs money,
      causes outages, loses users, etc.
    solution: |
      # WRONG: What people typically do
      bad_code_example()

      # RIGHT: What they should do instead
      good_code_example()

      # Step-by-step fix if complex
    symptoms:
      - Observable sign this is happening
      - Another symptom
      - Error message patterns
    detection_pattern: 'regex_to_find_this_problem'
```

**Severity Level Criteria:**

| Level | Definition | Examples |
|-------|------------|----------|
| `critical` | Will definitely cause major failure - data loss, security breach, user churn, revenue loss | SQL injection, shipping without testing, ignoring churn signals |
| `high` | Likely to cause significant problems - hard to fix once shipped, compounds over time | Feature bloat, technical debt accumulation, misleading metrics |
| `medium` | Causes friction and rework - annoying but recoverable | Inconsistent naming, missing documentation, suboptimal patterns |
| `low` | Minor issues - nice to fix but not urgent | Style preferences, minor optimizations, edge cases |

**The Severity Test:**
- "Would this wake someone up at 3 AM?" → **critical**
- "Would this cause a difficult post-mortem?" → **high**
- "Would this cause frustration during code review?" → **medium**
- "Would this be a nice-to-have improvement?" → **low**

**Detection Pattern Guidelines:**

| Pattern Type | Example | Use When |
|--------------|---------|----------|
| Simple literal | `eval\(` | Exact function/keyword match |
| With context | `innerHTML\s*=\s*[^"']` | Need surrounding context |
| Negative lookahead | `\.x\s*\+=\s*\d+(?!\s*\*)` | Catch missing multiplier |
| Multiple variants | `(md5\|sha1)\s*\(` | Same issue, different forms |
| `null` | `null` | Can't detect automatically (process issue) |

### validations.yaml

```yaml
# Validations - Automated Checks That Run on Code
# These catch problems in real-time as users write code

validations:
  - id: check-identifier
    name: Human-Readable Check Name
    severity: error | warning | info
    type: regex                    # regex | ast | file
    pattern:
      - 'first_regex_pattern'
      - 'second_pattern_variant'
    message: "What's wrong and why it matters"
    fix_action: "Specific action to fix it"
    applies_to:
      - "*.ts"
      - "*.js"
      - "*.tsx"
```

**Severity Levels:**

| Level | Meaning | Example |
|-------|---------|---------|
| `error` | Will cause bugs/security issues | SQL injection, hardcoded secrets |
| `warning` | Bad practice, likely problems | Missing error handling |
| `info` | Suggestion for improvement | Could use newer API |

---

## Part 3: Writing World-Class Content

### Identity: The Expert's Voice

The identity is NOT a job description. It's the **internal monologue of a seasoned expert**.

**Bad identity:**
```yaml
identity: |
  You are a frontend developer who writes React code.
  You should follow best practices and write clean code.
```

**Good identity:**
```yaml
identity: |
  You're a frontend architect who's mass-shipped React apps for a decade.
  You've built products for millions of users, debugged production render
  loops at 2 AM, and learned that cleverness is technical debt in disguise.
  You know that the component that's easiest to delete is the one you never
  wrote, and that premature abstraction kills more projects than copy-paste.

  Your core principles:
  1. Boring technology wins - use what works
  2. Delete code before you add it
  3. The best component is no component
  4. Types are documentation that compiles
  5. If it's not tested, it's broken
```

### Sharp Edges: Real Pain, Not Theory

Sharp edges must pass the **"I learned this the hard way" test**.

**Bad sharp edge:**
```yaml
- id: use-typescript
  summary: TypeScript is better than JavaScript
  why: Types help catch errors
```

**Good sharp edge:**
```yaml
- id: implicit-any-explosion
  summary: Disabling strict mode to "move fast" creates invisible bugs
  severity: high
  situation: |
    Team disables TypeScript strict mode because existing code has errors.
    "We'll fix it later." Later never comes.
  why: |
    Implicit any spreads through codebase like cancer. By the time you notice,
    refactoring is impossible. Every function call is a prayer. Runtime errors
    that TypeScript was supposed to catch now hit production.
  solution: |
    # Enable strict mode from day one
    {
      "compilerOptions": {
        "strict": true,
        "noImplicitAny": true,
        "strictNullChecks": true
      }
    }

    # For existing codebases, enable incrementally:
    1. Start with noImplicitAny in new files only
    2. Fix one module at a time
    3. Add strict: true after 80% coverage
  symptoms:
    - "any" scattered throughout codebase
    - Runtime type errors in production
    - Fear of refactoring
    - "unknown" function return types
  detection_pattern: '"strict":\s*false|"noImplicitAny":\s*false'
```

### Patterns: Proven Solutions

Patterns should be **copy-paste ready**, not abstract advice.

**Bad pattern:**
```yaml
- name: Error Handling
  description: Handle errors properly
  when: When errors might occur
  example: |
    try {
      // do stuff
    } catch (e) {
      // handle error
    }
```

**Good pattern:**
```yaml
- name: Error Boundary with Recovery
  description: Catch React errors without crashing entire app, with user recovery path
  when: Wrapping feature boundaries, third-party components, or user-generated content
  example: |
    class FeatureErrorBoundary extends React.Component {
      state = { hasError: false, error: null }

      static getDerivedStateFromError(error) {
        return { hasError: true, error }
      }

      componentDidCatch(error, errorInfo) {
        // Log to error service, not console
        errorService.capture(error, {
          componentStack: errorInfo.componentStack,
          feature: this.props.featureName
        })
      }

      handleRetry = () => {
        this.setState({ hasError: false, error: null })
      }

      render() {
        if (this.state.hasError) {
          return (
            <FeatureErrorFallback
              error={this.state.error}
              onRetry={this.handleRetry}
              featureName={this.props.featureName}
            />
          )
        }
        return this.props.children
      }
    }

    // Usage: Wrap feature boundaries, not the whole app
    <FeatureErrorBoundary featureName="comments">
      <CommentSection />
    </FeatureErrorBoundary>
```

### Anti-Patterns: What NOT To Do

Anti-patterns need the **"why" that isn't obvious**.

**Bad anti-pattern:**
```yaml
- name: God Component
  description: Components that do too much
  why: Hard to maintain
  instead: Split into smaller components
```

**Good anti-pattern:**
```yaml
- name: Prop Drilling Through Display Components
  description: Passing props through 5+ levels to reach deeply nested components
  why: |
    Every intermediate component becomes coupled to data it doesn't use.
    Refactoring any component requires updating the entire chain.
    Adding a new prop means editing 6 files. One typo breaks everything
    with no clear error message.
  instead: |
    Use React Context for truly global state (theme, user, locale).
    Use composition - pass components as children instead of data.
    Colocate state with the components that actually need it.

    // WRONG: Prop drilling
    <App user={user}>
      <Layout user={user}>
        <Sidebar user={user}>
          <UserMenu user={user} />  // 4 levels deep
        </Sidebar>
      </Layout>
    </App>

    // RIGHT: Composition
    <App>
      <Layout sidebar={<Sidebar><UserMenu /></Sidebar>}>
        <Content />
      </Layout>
    </App>

    // Or Context for truly global state
    <UserProvider>
      <App />  // UserMenu accesses context directly
    </UserProvider>
```

---

## Part 4: Skill Types & Layers

### Skill Types

| Type | Purpose | Examples |
|------|---------|----------|
| **frameworks/** | Specific technology expertise | nextjs-app-router, supabase-backend |
| **development/** | General development practices | frontend, backend, devops, cybersecurity |
| **integration/** | Combining multiple technologies | nextjs-supabase-auth, vercel-deployment |
| **pattern/** | Cross-cutting approaches | code-review, codebase-optimization |
| **design/** | Visual and experience design | ui-design, ux-design, branding |
| **marketing/** | Growth and communication | copywriting, content-strategy |
| **strategy/** | High-level business direction | product-strategy, growth-strategy |
| **product/** | Product development practices | product-management, analytics |

### Layer System

```
Layer 3: Strategic (Visionaries)
├── Business strategy, market positioning, long-term vision
├── Example: product-strategy, brand-positioning
└── Guides WHAT to build and WHY

Layer 2: Tactical (Architects)
├── System design, technical decisions, trade-offs
├── Example: frontend, backend, devops
└── Guides HOW to structure solutions

Layer 1: Execution (Craftspeople)
├── Implementation details, specific technologies
├── Example: nextjs-app-router, supabase-backend
└── Guides HOW to build it right
```

**Layer determines handoff direction:**
- Layer 3 hands down to Layer 2 for implementation approach
- Layer 2 hands down to Layer 1 for specific technology guidance
- Layer 1 hands up to Layer 2 when hitting architectural decisions

### Non-Technical Skills

Skills aren't just for code. Non-technical skills (marketing, strategy, product, design) follow the same structure with domain-specific adaptations:

**Key Differences from Code Skills:**

| Aspect | Code Skills | Non-Technical Skills |
|--------|-------------|---------------------|
| Examples | Runnable code snippets | Frameworks, templates, checklists |
| Detection patterns | Regex for code | Regex for copy/docs, or `null` |
| Symptoms | Error messages, bugs | Business metrics, user feedback |
| Solutions | Code fixes | Process changes, mental models |

**Non-Technical Sharp Edge Example:**

```yaml
# From marketing/copywriting/sharp-edges.yaml
- id: feature-vomit
  summary: Listing features instead of communicating benefits
  severity: high
  situation: |
    Homepage: "AI-powered. Real-time sync. 256-bit encryption. API access."
    User: "But what does it DO for me?"
  why: |
    Features are ingredients. Benefits are the meal. Users don't buy features,
    they buy outcomes. Feature-focused copy requires users to do translation
    work. Most won't. They'll bounce.
  solution: |
    # Feature → Benefit Translation:
    Feature: "256-bit encryption"
    Benefit: "Your data stays private, period."

    Feature: "Real-time sync"
    Benefit: "Work on any device. Never lose progress."

    # The "So What" Test:
    After every feature, ask "So what?"
    Answer that question instead.

    # Formula:
    [Feature] so you can [benefit] which means [emotional outcome]
  symptoms:
    - Spec-sheet homepage
    - High bounce rate
    - "What does it do?" support tickets
    - Competitors with worse products winning
  detection_pattern: null  # Can't regex-detect bad copy
```

**Non-Technical Pattern Example:**

```yaml
# From strategy/product-strategy/skill.yaml
patterns:
  - name: Problem-First Discovery
    description: Starting with user pain, not solution ideas
    when: Beginning any new feature or product
    example: |
      # WRONG: Solution-first
      "Let's build a notification system!"

      # RIGHT: Problem-first
      1. What problem are users having?
         → "Users miss important updates"
      2. How severe is it?
         → 40% of users cited this in churn interviews
      3. What's the current workaround?
         → Email, which they check less frequently
      4. What outcomes would solve it?
         → Users see critical updates within 1 hour
      5. NOW consider solutions
```

**Non-Technical Identity Example:**

```yaml
# From product/product-management/skill.yaml
identity: |
  You're a product manager who's shipped 15 products, killed 10, and learned
  that the features you didn't build often mattered more than the ones you did.
  You've sat in rooms where executives demanded features that would've killed
  the product, and you found ways to redirect to what users actually needed.

  Your core principles:
  1. Outcomes over outputs - shipping features isn't success
  2. Problem validation before solution design - always
  3. The roadmap is a hypothesis, not a promise
  4. Say no to 90% of ideas - that's the job
  5. User evidence beats stakeholder opinions
```

---

## Part 5: Creating a New Skill

### Step 1: Define the Skill Identity

Ask yourself:
1. **What domain does this cover?** (Be specific, not broad)
2. **What would a 10-year expert in this domain know that a junior doesn't?**
3. **What are the 3-5 non-negotiable principles?**
4. **What skills does this pair with?**

### Step 2: Gather Sharp Edges

Sources for sharp edges:
- **Stack Overflow** - Top-voted questions reveal common pain
- **GitHub Issues** - Real bugs people encounter
- **Post-mortems** - What caused production incidents
- **Your own experience** - What did you learn the hard way?
- **Reddit/Twitter/HN** - Developer complaints and frustrations

For each sharp edge, document:
1. The exact situation when it occurs
2. The real consequences (not theoretical)
3. A working solution with code
4. How to detect it automatically (if possible)

### Step 3: Document Patterns

For each pattern:
1. Give it a memorable name
2. Explain what it achieves
3. Describe when to use it
4. Provide copy-paste ready code
5. Show the transformation (before/after)

### Step 4: Document Anti-Patterns

For each anti-pattern:
1. Name the bad practice clearly
2. Explain WHY it's bad (non-obvious consequences)
3. Show what to do instead with code
4. Link to patterns that solve it

### Step 5: Create Validations

For each common mistake:
1. Write a regex to detect it
2. Test against real code samples
3. Avoid false positives
4. Provide actionable fix message

### Step 6: Define Handoffs

Identify:
1. What triggers needing another skill?
2. Which skill should handle it?
3. What context should be passed?

---

## Part 6: Quality Checklist

### Before Shipping a Skill

**Identity:**
- [ ] Sounds like a real expert, not a job description
- [ ] Has 3-5 concrete principles
- [ ] Principles are opinionated, not generic

**Sharp Edges (minimum 8-12):**
- [ ] Each is a real gotcha, not theoretical risk
- [ ] Has specific situation description
- [ ] Explains real consequences
- [ ] Provides working solution with code
- [ ] Has detection pattern (where possible)
- [ ] Symptoms are observable

**Patterns (minimum 4-6):**
- [ ] Each has memorable name
- [ ] Code is copy-paste ready
- [ ] Explains when to use
- [ ] Shows transformation

**Anti-Patterns (minimum 4-6):**
- [ ] Each explains non-obvious "why"
- [ ] Shows what to do instead
- [ ] Links to solving pattern

**Validations (minimum 8-12):**
- [ ] Regex tested against real code
- [ ] No excessive false positives
- [ ] Fix action is specific and actionable
- [ ] File types correctly targeted

**Handoffs:**
- [ ] All edge cases have handoffs
- [ ] Target skills exist
- [ ] Context is clear

---

## Part 7: File Structure

```
spawner-v2/skills/
├── development/
│   └── frontend/
│       ├── skill.yaml           # Required: identity + patterns + anti-patterns
│       ├── sharp-edges.yaml     # Required: structured gotchas
│       ├── validations.yaml     # Required: automated checks
│       ├── patterns.md          # Optional: deep-dive on patterns
│       ├── anti-patterns.md     # Optional: deep-dive on anti-patterns
│       ├── decisions.md         # Optional: decision frameworks
│       └── sharp-edges.md       # Optional: prose version of edges
```

**Required files:** `skill.yaml`, `sharp-edges.yaml`, `validations.yaml`
**Optional files:** Markdown files for deeper prose when YAML isn't enough

---

## Part 8: Examples

### Minimal Skill (Layer 1 Framework)

```yaml
# skill.yaml
id: vue-composition-api
name: Vue Composition API
version: 1.0.0
layer: 1
description: Building Vue 3 applications with the Composition API

owns:
  - vue-reactivity
  - vue-composables
  - vue-lifecycle

pairs_with:
  - typescript-strict
  - frontend

requires: []

tags:
  - vue
  - frontend
  - javascript
  - composition-api

triggers:
  - vue
  - vue 3
  - composition api
  - composables
  - ref
  - reactive

identity: |
  You're a Vue developer who transitioned from Options API and never looked back.
  You've built design systems, migrated legacy apps, and learned that composables
  are the key to maintainable Vue code.

  Your core principles:
  1. Composables over mixins - always
  2. ref() for primitives, reactive() for objects
  3. Extract logic early - before it tangles
  4. TypeScript makes Vue bearable at scale

patterns:
  - name: Composable Extraction
    description: Extract reusable logic into composables
    when: Logic is used in multiple components or is complex enough to test alone
    example: |
      // composables/useCounter.ts
      export function useCounter(initial = 0) {
        const count = ref(initial)
        const increment = () => count.value++
        const decrement = () => count.value--
        return { count, increment, decrement }
      }

anti_patterns:
  - name: Reactive Primitives
    description: Using reactive() for primitive values
    why: reactive() only works with objects. Primitives lose reactivity.
    instead: Use ref() for primitives, reactive() for objects.

handoffs:
  - trigger: state management or pinia
    to: vue-pinia
    context: User needs app-level state management
```

### Complete Skill (Layer 2 Development)

See existing skills in `development/` folder for full examples:
- `development/frontend/` - Complete frontend development skill
- `development/cybersecurity/` - Security-focused skill with validations
- `development/game-development/` - Domain-specific skill

---

## Part 9: Common Mistakes in Skill Creation

### 1. Too Broad
**Bad:** "JavaScript" skill covering everything
**Good:** "React Patterns" skill focused on one framework

### 2. Too Theoretical
**Bad:** Sharp edges that describe risks without real examples
**Good:** Sharp edges with "I deployed this and lost $10k" stories

### 3. Generic Advice
**Bad:** "Write clean code" pattern
**Good:** "Extract hooks at 3+ useState calls" pattern with code

### 4. Missing Detection
**Bad:** Sharp edge with no way to catch it
**Good:** Sharp edge with regex that finds it in code (or explicit `null` for process issues)

### 5. Untested Regex
**Bad:** Pattern that matches too much or too little
**Good:** Pattern tested against 10+ real code samples

### 6. No Handoffs
**Bad:** Skill tries to cover everything
**Good:** Skill knows its boundaries and hands off appropriately

### 7. Code-Only Thinking (for non-technical skills)
**Bad:** Leaving detection_pattern blank because "it's not code"
**Good:** Use `null` explicitly for process issues, or regex for docs/copy patterns

### 8. Abstract Symptoms (for non-technical skills)
**Bad:** "Product fails" or "Marketing doesn't work"
**Good:** Observable symptoms like "High bounce rate", "Churned users cite X", "'What does it do?' support tickets"

### 9. Missing the Real Consequences
**Bad:** "This is a bad practice" (why should I care?)
**Good:** "This cost us $50k in wasted development" or "40% of churned users cited this"

---

## Appendix A: Regex Pattern Library

Common detection patterns for reference:

```yaml
# Security
hardcoded_secret: 'password\s*=\s*["\'][^"\']{8,}["\']'
api_key_in_code: 'api[_-]?key\s*=\s*["\'][^"\']{16,}["\']'
sql_injection: 'SELECT.*\$\{|query\s*\(`[^`]*\$\{'
eval_usage: 'eval\s*\('

# React
use_effect_no_deps: 'useEffect\s*\([^)]+\)\s*;?\s*$'
use_state_object: 'useState\s*\(\s*\{[^}]+\}\s*\)'

# Performance
console_log: 'console\.(log|debug|info)\s*\('
sync_in_async: 'async[^{]*\{[^}]*readFileSync'

# TypeScript
any_type: ':\s*any\b'
ts_ignore: '@ts-ignore|@ts-nocheck'

# Game Dev
frame_dependent: '\.x\s*\+=\s*\d+(?!\s*\*)'
new_in_update: 'update\s*\([^)]*\)\s*\{[^}]*new\s+[A-Z]'
```

---

## Appendix B: Skill Generator Usage

The skill generator creates scaffolds. Use it to start, then fill with real content:

```bash
# Create new skill scaffold
spawner_skills({ action: "scaffold", type: "development", name: "rust-async" })

# Validate existing skill
spawner_skills({ action: "validate", skill: "frontend" })

# Preview what would be created
spawner_skills({ action: "preview", type: "framework", name: "sveltekit" })
```

---

## Summary

World-class skills have:

1. **An expert identity** that sounds like a real person with battle scars
2. **8-12 sharp edges** with detection patterns and real solutions
3. **4-6 patterns** with copy-paste ready code
4. **4-6 anti-patterns** with non-obvious "why"
5. **8-12 validations** that catch real problems
6. **Clear handoffs** to related skills

The goal: **Claude should know what you know, catch what you'd catch, and fix what you'd fix.**
