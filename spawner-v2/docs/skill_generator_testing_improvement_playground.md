# Skill Generator Testing & Improvement Playground

## Status: Future Task

This document outlines a system for analyzing skills, testing their effectiveness, and identifying shortcomings before deployment.

---

## The Problem

Skills are created based on intuition and best practices, but we lack:
1. **Validation** - Does the skill actually prevent the problems it claims to?
2. **Coverage** - Are there edge cases the skill misses?
3. **Effectiveness** - When Claude uses this skill, does output quality improve?
4. **Regression** - Did a skill update break something that worked before?

---

## Proposed System: Skill Testing Framework

### 1. Test Case Repository

For each skill, maintain a collection of test cases:

```yaml
# tests/mcp-product/test-cases.yaml
test_cases:
  # Positive tests - skill should catch these
  - id: tc-001
    name: "Catches required project_id"
    type: should_catch
    input:
      code: |
        inputSchema: {
          required: ["project_id", "action"],
          properties: { ... }
        }
      file_path: "src/tools/example.ts"
    expected:
      matched_edge: first-call-id-requirement
      severity: critical

  # Negative tests - skill should NOT flag these
  - id: tc-002
    name: "Allows optional project_id"
    type: should_pass
    input:
      code: |
        inputSchema: {
          required: [],
          properties: {
            project_id: { description: "Optional" }
          }
        }
      file_path: "src/tools/example.ts"
    expected:
      matched_edge: null

  # Edge cases - tricky situations
  - id: tc-003
    name: "Catches ID in nested required"
    type: should_catch
    input:
      code: |
        const schema = z.object({
          project_id: z.string(),
          data: z.object({ ... })
        });
      file_path: "src/tools/example.ts"
    expected:
      matched_edge: first-call-id-requirement
      note: "Zod schema with required string = required param"
```

### 2. Synthetic Codebase Generator

Generate realistic codebases with known issues for testing:

```typescript
// tools/generate-test-codebase.ts
interface TestCodebaseConfig {
  name: string;
  issues_to_inject: {
    edge_id: string;
    count: number;
    locations: 'random' | 'specific';
  }[];
  clean_patterns: string[];  // Good code to include
  size: 'small' | 'medium' | 'large';
}

// Example: Generate a codebase with 3 god modules and 2 silent successes
const config: TestCodebaseConfig = {
  name: "test-mcp-server",
  issues_to_inject: [
    { edge_id: "god-module-accumulation", count: 3, locations: "random" },
    { edge_id: "silent-success-dead-end", count: 2, locations: "random" }
  ],
  clean_patterns: ["layered-architecture", "explicit-error-handling"],
  size: "medium"
};
```

### 3. Skill Evaluation Pipeline

```
┌─────────────────┐
│  Test Codebase  │
│  (with known    │
│   issues)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Run Skill      │
│  (generate      │
│   findings)     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Compare to     │
│  Ground Truth   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Score:         │
│  - Precision    │
│  - Recall       │
│  - F1           │
└─────────────────┘
```

### 4. Metrics

```yaml
skill_metrics:
  precision: 0.85      # Of findings reported, how many were real issues?
  recall: 0.92         # Of real issues, how many did we catch?
  f1_score: 0.88       # Harmonic mean

  false_positives:     # Flagged but not actually a problem
    - { edge: "god-module", file: "src/index.ts", reason: "Entry point is allowed to be large" }

  false_negatives:     # Real issues we missed
    - { edge: "silent-success", file: "src/tools/plan.ts", line: 45, reason: "Pattern variation not detected" }

  detection_coverage:
    edges_with_tests: 8
    edges_without_tests: 2
    pattern_variations_tested: 24
```

### 5. A/B Testing with Claude

Compare skill effectiveness by running the same task with/without skill:

```yaml
ab_test:
  name: "mcp-product skill effectiveness"
  task: "Review this MCP tool implementation for UX issues"

  control:
    prompt: "Review this code for issues"
    # No skill loaded

  treatment:
    prompt: "Review this code for issues"
    skill: mcp-product-v2

  evaluation:
    - metric: issues_found
      control_avg: 2.3
      treatment_avg: 5.7

    - metric: actionable_recommendations
      control_avg: 1.1
      treatment_avg: 4.2

    - metric: false_positives
      control_avg: 0.8
      treatment_avg: 0.4
```

---

## Implementation Phases

### Phase 1: Test Case Infrastructure (Week 1)
- [ ] Define test case schema
- [ ] Create test runner that executes detection patterns against code
- [ ] Build initial test cases for mcp-product skill (10-20 cases)
- [ ] Generate precision/recall metrics

### Phase 2: Synthetic Codebase Generator (Week 2)
- [ ] Build code generator that can inject known issues
- [ ] Create templates for common patterns (MCP server, Next.js app, etc.)
- [ ] Generate 5 test codebases with varying complexity

### Phase 3: Claude A/B Testing (Week 3)
- [ ] Set up evaluation harness using Claude API
- [ ] Define task prompts and evaluation criteria
- [ ] Run comparison tests: with skill vs without skill
- [ ] Measure improvement in output quality

### Phase 4: Continuous Integration (Week 4)
- [ ] Add skill tests to CI pipeline
- [ ] Fail PR if skill update reduces precision/recall
- [ ] Auto-generate coverage reports
- [ ] Alert on detection pattern regressions

---

## File Structure

```
skill-testing/
├── test-cases/
│   ├── mcp-product/
│   │   ├── positive.yaml      # Should catch
│   │   ├── negative.yaml      # Should pass
│   │   └── edge-cases.yaml    # Tricky situations
│   └── code-architecture/
│       └── ...
├── synthetic-codebases/
│   ├── mcp-server-small/
│   ├── mcp-server-with-issues/
│   └── nextjs-app-clean/
├── evaluation/
│   ├── metrics.yaml           # Latest scores
│   ├── history/               # Historical metrics
│   └── ab-tests/              # A/B test results
├── tools/
│   ├── run-tests.ts           # Test runner
│   ├── generate-codebase.ts   # Synthetic generator
│   ├── evaluate-skill.ts      # Metrics calculator
│   └── ab-test-runner.ts      # Claude comparison
└── reports/
    └── skill-quality-report.md
```

---

## Example: Testing a Detection Pattern

```typescript
// tools/test-detection-pattern.ts
import { testPattern } from './lib/pattern-tester';

const results = await testPattern({
  pattern: 'required.*\\[.*"(project_id|user_id|session_id)"',

  shouldMatch: [
    'required: ["project_id", "action"]',
    'required: ["user_id"]',
    'required: ["session_id", "data"]',
  ],

  shouldNotMatch: [
    'required: ["action"]',
    'required: []',
    '// required: ["project_id"]  // commented out',
    'description: "project_id is optional"',
  ],

  edgeCases: [
    { input: 'required:["project_id"]', expected: true, note: 'no spaces' },
    { input: "required: ['project_id']", expected: true, note: 'single quotes' },
    { input: 'REQUIRED: ["project_id"]', expected: false, note: 'case sensitive' },
  ]
});

console.log(results);
// {
//   passed: 9,
//   failed: 1,
//   failures: [{ input: "required: ['project_id']", expected: true, actual: false }]
// }
```

---

## Success Criteria

A skill is "production ready" when:

| Metric | Threshold |
|--------|-----------|
| Precision | ≥ 85% |
| Recall | ≥ 80% |
| F1 Score | ≥ 82% |
| Test coverage | ≥ 90% of edges have tests |
| A/B improvement | ≥ 50% more issues found with skill |
| False positive rate | ≤ 15% |

---

## Open Questions

1. **How do we test "soft" skill aspects?** (tone, explanation quality, not just detection)
2. **How do we version test cases?** (when skill changes, do old tests still apply?)
3. **How do we handle subjective findings?** (some issues are judgment calls)
4. **Should this be a separate repo?** (skill-testing-framework)
5. **Can we use Claude to generate test cases?** (bootstrap coverage faster)

---

## Related

- `SKILL_SPEC_V2.md` - The skill schema being tested
- `SKILL_RENDERER.md` - How skills produce output
- `superpowers:testing-skills-with-subagents` - Existing skill for manual testing

---

*This is a future task. Implementation TBD.*
