# Skill Conventions & Standards

> Enforced conventions for consistent, high-quality skills

---

## Quick Reference

| Convention | Rule | Rationale |
|------------|------|-----------|
| Naming | `receives_from:` not `receives_context_from:` | Tooling compatibility |
| Files | 4 YAML files per skill (no exceptions) | Machine-parsable |
| Handoffs | `trigger`, `to`, `context` format | Consistent routing |
| Categories | 25 official categories | Organization |
| Severity | critical/high/medium/low | 3 AM test |

---

## 1. File Structure

### Required Files (All Skills)

Every skill MUST have exactly 4 YAML files:

```
skills/{category}/{skill-name}/
├── skill.yaml           # Identity, patterns, anti-patterns, handoffs
├── sharp-edges.yaml     # Gotchas with detection patterns
├── validations.yaml     # Automated code checks
└── collaboration.yaml   # Prerequisites, delegation, skill interactions
```

**No exceptions.** Skills with missing files are considered incomplete.

### Optional Files

```
├── patterns.md          # Deep-dive prose on patterns
├── anti-patterns.md     # Deep-dive prose on anti-patterns
├── decisions.md         # Decision frameworks
└── sharp-edges.md       # Prose version of edges
```

---

## 2. Naming Conventions

### Field Names

| Correct | Incorrect | Notes |
|---------|-----------|-------|
| `receives_from:` | `receives_context_from:` | Standard in collaboration.yaml |
| `hands_to:` | `provides_to:`, `delegates_to:` | For outbound handoffs |
| `trigger:` | `triggers:`, `pattern:` | In handoff definitions |
| `to:` | `target:`, `skill:` | Handoff target (simple format) |
| `skill:` | - | Handoff target (structured format) |

### ID Formats

| Type | Format | Example |
|------|--------|---------|
| Skill ID | kebab-case | `nextjs-supabase-auth` |
| Pattern ID | kebab-case | `server-component-data-fetching` |
| Sharp Edge ID | kebab-case | `implicit-any-explosion` |
| Validation ID | kebab-case | `sql-injection-template-literal` |

### Category Names

Official categories (25 total):

```
agents/          ai/              ai-ml/           biotech/
blockchain/      climate/         communications/  creative-tech/
data/            design/          development/     enterprise/
finance/         frameworks/      game-development/ hardware/
integrations/    legal/           marketing/       mind/
product/         science/         simulation/      space/
startup/         strategy/        trading/
```

---

## 3. Handoff Formats

### Simple Format (skill.yaml)

```yaml
handoffs:
  - trigger: "keyword|phrase|pattern"
    to: target-skill-id
    context: Why this handoff makes sense
```

### Structured Format (skill.yaml)

```yaml
handoffs:
  receives_from:
    - skill: upstream-skill
      receives: "What data/context you get"

  hands_to:
    - skill: downstream-skill
      trigger: "pattern|phrase"
      provides: "What you pass along"
```

### Collaboration Format (collaboration.yaml)

```yaml
receives_from:
  - skill: skill-id
    context: "When this happens"
    receives:
      - "Data item 1"
      - "Data item 2"
    provides:
      - "What we give back"

delegation_triggers:
  - trigger: "pattern|phrase"
    delegate_to: skill-id
    pattern: sequential | parallel | review
    context: "Pass these requirements"
    handoff_data:
      - "Item to pass"
    receive:
      - "What to get back"
```

---

## 4. Severity Levels

### Sharp Edges & Validations

| Level | Definition | 3 AM Test |
|-------|------------|-----------|
| `critical` | Will cause major failure - data loss, security breach, revenue loss | Would wake someone up |
| `high` | Likely significant problems - hard to fix, compounds over time | Would cause difficult post-mortem |
| `medium` | Causes friction and rework - annoying but recoverable | Would frustrate during code review |
| `low` | Minor issues - nice to fix but not urgent | Nice-to-have improvement |

### Validation Severity

| Level | When to Use |
|-------|-------------|
| `error` | Will cause bugs or security issues |
| `warning` | Bad practice, likely problems |
| `info` | Suggestion for improvement |

---

## 5. Enhanced Patterns (2025)

### Symptom Index (sharp-edges.yaml)

Maps error messages to solutions for faster debugging:

```yaml
symptom_index:
  - error_pattern: "Text content did not match"
    edge_id: hydration-mismatch
    quick_fix: "Add 'use client' or fix server/client mismatch"
    solution:
      - "Check for browser-only APIs in server components"
      - "Ensure consistent data between server and client"

  - error_pattern: "Invalid API key"
    edge_id: hardcoded-secrets
    quick_fix: "Move to environment variables"
    solution:
      - "Use process.env.API_KEY"
      - "Add to .env.local for development"
```

### Red Flags (sharp-edges.yaml)

Critical patterns requiring immediate attention:

```yaml
red_flags:
  - id: eval-user-input
    pattern: 'eval\s*\([^)]*(?:req\.|params\.|query\.)'
    severity: critical
    risk: "Remote Code Execution"
    action: "STOP - Never eval user input"

  - id: hardcoded-production-secrets
    pattern: '(?:api[_-]?key|secret|password)\s*[=:]\s*["\'][a-zA-Z0-9]{20,}["\']'
    severity: critical
    risk: "Credential Exposure"
    action: "Move to environment variables immediately"
```

### Quick Wins (skill.yaml)

Immediate improvements with effort/impact ratings:

```yaml
quick_wins:
  - id: add-security-headers
    action: "Add security headers to responses"
    effort: "15 minutes"
    impact: high
    code_before: |
      // No security headers
      res.send(data)
    code_after: |
      res.set({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'Strict-Transport-Security': 'max-age=31536000'
      })
      res.send(data)
    related_edge: missing-security-headers
```

### Test Cases (validations.yaml)

Verify validation patterns work correctly:

```yaml
validations:
  - id: sql-injection-template-literal
    pattern: 'query\s*\(`[^`]*\$\{'
    # ... other fields ...
    test_cases:
      should_match:
        - "const q = `SELECT * FROM users WHERE id = ${userId}`"
        - "db.query(`DELETE FROM ${table}`)"
      should_not_match:
        - "db.query('SELECT * FROM users WHERE id = $1', [userId])"
        - "const template = `Hello ${name}`"  # Not SQL
```

---

## 6. Collaboration File Structure

### Required Sections

```yaml
version: 1.0.0
skill_id: skill-name

# Who can call you
receives_from:
  - skill: skill-id
    context: "When this happens"
    receives: ["What you get"]
    provides: ["What you give back"]

# When to delegate
delegation_triggers:
  - trigger: "pattern"
    delegate_to: skill-id
    pattern: sequential | parallel | review
    context: "What to pass"

# Bidirectional communication
feedback_loops:
  receives_feedback_from:
    - skill: skill-id
      signal: "What triggers feedback"
      incorporates: "How you use it"
  sends_feedback_to:
    - skill: skill-id
      signal: "What you send"
      frequency: per_request | periodic | on_change
```

### Recommended Sections

```yaml
# When to escalate
escalation_paths:
  - situation: "Performance degradation"
    escalate_to: devops
    urgency: high | medium | low | critical
    context: "What to provide"

# Step-by-step workflows
workflow_integration:
  typical_sequence:
    - step: 1
      action: "First action"
      skills_involved: [skill-1, skill-2]
      output: "Expected result"
  decision_points:
    - question: "Which approach?"
      options:
        - choice: "Option A"
          when: "Situation A"
        - choice: "Option B"
          when: "Situation B"

# Knowledge from other fields
cross_domain_insights:
  - domain: "psychology"
    insight: "Cognitive load limits inform UI complexity"
    applies_when: "Designing user-facing components"
```

---

## 7. Quality Checklist

### Before Creating a Skill

- [ ] Check if skill already exists (search by triggers)
- [ ] Define clear boundaries (owns/does_not_own)
- [ ] Identify 3-5 skills to pair with
- [ ] Gather 8-12 sharp edges from real experience

### Before Committing

- [ ] All 4 YAML files present
- [ ] Uses `receives_from:` not `receives_context_from:`
- [ ] Handoffs use correct format
- [ ] All handoff targets exist as skills
- [ ] Severity levels match 3 AM test
- [ ] Detection patterns tested against real code
- [ ] Collaboration file has escalation_paths

### World-Class Skill Additions

- [ ] `symptom_index` in sharp-edges.yaml
- [ ] `red_flags` in sharp-edges.yaml
- [ ] `quick_wins` in skill.yaml
- [ ] `test_cases` for all validations
- [ ] `workflow_integration` in collaboration.yaml
- [ ] `decision_points` for complex choices

---

## 8. Common Mistakes

### Naming

| Wrong | Right |
|-------|-------|
| `receives_context_from:` | `receives_from:` |
| `integration/stripe` | `integrations/stripe-integration` |
| `Docker` (folder name) | `docker-containerization` |

### Structure

| Wrong | Right |
|-------|-------|
| Missing collaboration.yaml | All 4 files required |
| Empty validations | Minimum 8 validations |
| No handoffs defined | At least 3-5 handoffs |

### Content

| Wrong | Right |
|-------|-------|
| "Handle errors properly" | Specific pattern with code |
| severity: critical for minor issues | Use 3 AM test |
| Regex not tested | Test against 10+ samples |

---

## 9. Migration Guide

### From receives_context_from to receives_from

```yaml
# Before (deprecated)
receives_context_from:
  - skill: backend
    receives:
      - "API endpoints"

# After (standard)
receives_from:
  - skill: backend
    receives:
      - "API endpoints"
```

### Adding New Patterns

When adding symptom_index, red_flags, or quick_wins:

1. Add at the end of the file (after existing content)
2. Follow the exact structure in section 5
3. Test detection patterns before committing
4. Link to related sharp edges/validations

---

## 10. Validation Commands

```bash
# Check for naming inconsistencies
grep -r "receives_context_from:" skills/

# Find skills missing files
find skills -type d -mindepth 2 -maxdepth 2 | while read d; do
  [ ! -f "$d/collaboration.yaml" ] && echo "Missing: $d/collaboration.yaml"
done

# Verify handoff targets exist
# (Run spawner_skill_new with action: "validate")
```

---

## Changelog

| Date | Change |
|------|--------|
| 2025-12-31 | Added symptom_index, red_flags, quick_wins, test_cases patterns |
| 2025-12-31 | Standardized receives_from naming (56 files updated) |
| 2025-12-31 | Added escalation_paths, workflow_integration to collaboration |
| 2025-12-31 | Created game-development category (7 skills) |

---

*Last updated: 2025-12-31*
