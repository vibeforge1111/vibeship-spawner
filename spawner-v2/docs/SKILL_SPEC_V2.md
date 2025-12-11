# Spawner Skill Specification V2

## Design Philosophy

**V2 as data, V1 as presentation.**

Skills are structured YAML that machines can parse, filter, and act on. Human-readable prose is generated from the structured data, not stored in it.

## Schema

### skill.yaml

```yaml
# ============================================================================
# METADATA - Required fields for skill identification
# ============================================================================
id: string                    # Unique identifier (kebab-case)
name: string                  # Human-readable name
version: string               # Semver (1.0.0)
layer: 1 | 2 | 3              # 1=core, 2=integration, 3=pattern

# ============================================================================
# CLASSIFICATION - What this skill covers
# ============================================================================
owns: string[]                # Domains this skill is authoritative for
does_not_own: string[]        # Explicit boundaries (with arrows to correct skill)
tags: string[]                # Searchable keywords
triggers: string[]            # Phrases that should activate this skill

# ============================================================================
# RELATIONSHIPS - How this skill connects to others
# ============================================================================
pairs_with: string[]          # Skills that work well together
requires: string[]            # Skills that must be loaded first
handoffs:                     # When to transfer to another skill
  - trigger: string           # Phrase that triggers handoff
    to: string                # Target skill id
    context: string           # What to pass along

# ============================================================================
# IDENTITY - Core philosophy (structured, not prose)
# ============================================================================
identity:
  role: string                # One-line role definition
  core_principles: string[]   # 3-5 bullet points, imperative voice
  iron_law: string            # The ONE rule that cannot be broken (optional)

# ============================================================================
# PATTERNS - The right ways to do things
# ============================================================================
patterns:
  - id: string                # Unique pattern identifier
    name: string              # Short name
    when: string              # When to apply (one line)
    good:
      description: string     # What makes this good (one line)
      code: string            # Code example
    bad:
      description: string     # What makes this bad (one line)
      code: string            # Code example
    why: string[]             # Bullet points explaining the difference

# ============================================================================
# ANTI-PATTERNS - What to avoid
# ============================================================================
anti_patterns:
  - id: string
    name: string
    description: string       # One line
    why: string[]             # Bullet points
    instead: string           # One line fix

# ============================================================================
# RED FLAGS - Quick checks that indicate problems
# ============================================================================
red_flags:
  - pattern: string           # What to look for (can be regex)
    meaning: string           # What it indicates
    severity: critical | error | warning

# ============================================================================
# VERIFICATION - Checklist before shipping
# ============================================================================
verification:
  - check: string             # Question to ask
    fail_action: string       # What to do if check fails

# ============================================================================
# OUTPUT FORMAT - How this skill produces artifacts
# ============================================================================
output:
  type: structured | narrative | hybrid
  audience: engineers | agents | executives | vibe-coders
  # If structured, findings follow this schema
  # If narrative, use renderer template
  # If hybrid, structured data with narrative sections
```

### sharp-edges.yaml

```yaml
# ============================================================================
# SHARP EDGES - Gotchas that trip up developers
# ============================================================================
sharp_edges:
  - id: string                # Unique edge identifier
    summary: string           # One line (< 80 chars)
    severity: critical | high | medium | low

    # Structured situation data (NOT prose)
    context:
      when: string[]          # Bullet points: when this happens
      symptoms: string[]      # What you'll observe

    # Why this is a problem (bullet points)
    why: string[]

    # Solution (structured)
    solution:
      approach: string        # One line summary
      steps: string[]         # Numbered steps
      code_before: string     # Optional: bad code
      code_after: string      # Optional: fixed code

    # Detection (machine-readable)
    detection:
      pattern: string         # Regex pattern
      file_types: string[]    # Which files to check

    # Lifecycle
    version_range: string     # Optional: semver range when relevant
    expires_at: string        # Optional: ISO date when obsolete

# ============================================================================
# CONFIG - How to use these edges
# ============================================================================
config:
  always_check: string[]      # Edge IDs to always run
  exclude_paths: string[]     # Glob patterns to skip
```

## Key Differences from V1

| Aspect | V1 (Old) | V2 (New) |
|--------|----------|----------|
| Identity | Multi-line prose blob | Structured: role + principles + iron_law |
| Patterns | description + example blobs | Structured: good/bad with separate code blocks |
| Sharp edges | situation/why/solution as prose | Structured: context.when, why[], solution.steps |
| Output | Implicit (always prose) | Explicit: type + audience |

## Rendering V1 from V2

The V2 structure contains all data needed to generate V1-quality prose:

```
V2 identity.role → V1 "## Overview" first paragraph
V2 identity.iron_law → V1 "## The Iron Law" section
V2 identity.core_principles → V1 bullet list under overview
V2 patterns[].good/bad → V1 <Good>/<Bad> blocks with explanation
V2 anti_patterns → V1 table with columns
V2 red_flags → V1 "## Red Flags - STOP" section
V2 verification → V1 "## Verification Checklist" with checkboxes
```

## Migration Guide

### Converting identity

**Before (V1):**
```yaml
identity: |
  You are a Next.js App Router expert. You understand the nuances of
  Server Components vs Client Components, when to use each...

  Your core principles:
  1. Server Components by default
  2. Fetch data where it's needed
```

**After (V2):**
```yaml
identity:
  role: Next.js App Router expert specializing in Server/Client Component architecture
  core_principles:
    - Server Components by default - only use 'use client' when needed
    - Fetch data where it's needed, not at the top
    - Compose Client Components inside Server Components
  iron_law: null  # Not all skills have an iron law
```

### Converting patterns

**Before (V1):**
```yaml
patterns:
  - name: Server Component Data Fetching
    description: |
      Fetch data directly in Server Components using async/await
    when: You need to fetch data that doesn't require client interactivity
    example: |
      // app/users/page.tsx
      export default async function UsersPage() {
        const users = await db.user.findMany()
        return <UserList users={users} />
      }
```

**After (V2):**
```yaml
patterns:
  - id: server-component-data-fetching
    name: Server Component Data Fetching
    when: Fetching data that doesn't require client interactivity
    good:
      description: Fetch directly in Server Component with async/await
      code: |
        // app/users/page.tsx
        export default async function UsersPage() {
          const users = await db.user.findMany()
          return <UserList users={users} />
        }
    bad:
      description: Using useEffect in Client Component for static data
      code: |
        'use client'
        export default function UsersPage() {
          const [users, setUsers] = useState([])
          useEffect(() => {
            fetch('/api/users').then(r => r.json()).then(setUsers)
          }, [])
          return <UserList users={users} />
        }
    why:
      - Server fetch has no client bundle cost
      - No loading spinner needed
      - Better SEO - content is in initial HTML
      - Direct database access without API layer
```

### Converting sharp edges

**Before (V1):**
```yaml
- id: god-module-accumulation
  summary: One module grows to handle everything
  severity: critical
  situation: |
    A module starts small but grows to 1000+ lines because it's easier
    to add code there than to create proper structure.
  why: |
    God modules become impossible to test, impossible to understand,
    merge conflict magnets, and performance problems.
  solution: |
    Split by responsibility, not by size:
    1. Identify distinct responsibilities
    2. Group related functions together
    3. Extract each group to its own module
```

**After (V2):**
```yaml
- id: god-module-accumulation
  summary: One module grows to handle everything
  severity: critical
  context:
    when:
      - Module exceeds 500 lines
      - New code keeps getting added to same file
      - File has multiple unrelated exports
    symptoms:
      - "Where does this go? Just put it in utils"
      - Tests for module take forever
      - Frequent merge conflicts
  why:
    - Impossible to test (too many dependencies)
    - Impossible to understand (too many responsibilities)
    - Merge conflict magnet (everyone touches it)
    - Performance problems (load everything for anything)
  solution:
    approach: Split by responsibility, not by size
    steps:
      - Identify distinct responsibilities (list them)
      - Group related functions together
      - Extract each group to its own module
      - Use a facade if you need backward compatibility
    code_before: |
      // UserManager.ts (1500 lines)
      export function login() { ... }
      export function logout() { ... }
      export function updateProfile() { ... }
      export function subscribe() { ... }
    code_after: |
      // userAuth.ts
      export function login() { ... }
      export function logout() { ... }

      // userProfile.ts
      export function updateProfile() { ... }

      // userBilling.ts
      export function subscribe() { ... }
  detection:
    pattern: 'export (function|const|class).*\n.*export.*\n.*export'
    file_types: ['*.ts', '*.tsx', '*.js', '*.jsx']
```

## Benefits

1. **Machine-parsable**: Agents can filter by severity, search patterns, match symptoms
2. **Consistent structure**: Every skill follows same schema
3. **Render to any format**: V1 prose, JSON API, dashboard, tickets
4. **Trackable**: IDs on everything for cross-referencing
5. **Composable**: Patterns and edges can be reused across skills
