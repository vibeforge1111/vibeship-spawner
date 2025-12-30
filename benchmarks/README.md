# Skill Benchmark System

A multi-model jury scoring system to validate and improve skills. Tests Vanilla Opus against Skilled Opus on identical tasks, then has multiple frontier models score the outputs.

## Quick Start

```bash
# 1. Set up API keys
export ANTHROPIC_API_KEY="your-key"
export OPENAI_API_KEY="your-key"        # Optional
export GOOGLE_API_KEY="your-key"        # Optional
export TOGETHER_API_KEY="your-key"      # Optional

# 2. Install dependencies
pip install anthropic openai google-generativeai pyyaml

# 3. Run contestants (Vanilla vs Skilled)
python scripts/run-contestants.py --skills all

# 4. Run jury scoring
python scripts/run-jury.py --run-id <run-id-from-step-3>

# 5. Generate report
python scripts/generate-report.py --run-id <run-id>
```

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                    BENCHMARK FLOW                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. CONTESTANTS                                                  │
│     Same prompt → Vanilla Opus (no skill)                       │
│                 → Skilled Opus (with skill injected)            │
│                                                                  │
│  2. JURY SCORING                                                 │
│     Outputs anonymized as "Response A" / "Response B"           │
│     Position randomized to prevent bias                         │
│     Multiple models score: Claude, GPT-4o, Gemini, Llama        │
│                                                                  │
│  3. REPORT                                                       │
│     Win rates, score deltas, jury agreement                     │
│     Per-skill improvement areas                                  │
│     Global learnings for skill generation                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
benchmarks/
├── config.yaml              # API settings, jury models, thresholds
├── test-cases/              # Test cases per skill (3 per skill)
│   ├── frontend.yaml
│   ├── nextjs-app-router.yaml
│   ├── ux-design.yaml
│   ├── copywriting.yaml
│   ├── product-strategy.yaml
│   ├── a-b-testing.yaml
│   └── dev-communications.yaml
├── scripts/
│   ├── run-contestants.py   # Step 1: Run vanilla vs skilled
│   ├── run-jury.py          # Step 2: Multi-model scoring
│   └── generate-report.py   # Step 3: Aggregate results
├── outputs/
│   └── {run-id}/
│       ├── contestants/     # Raw outputs
│       ├── jury-scores/     # Scores from each jury model
│       ├── metadata.json    # Run configuration
│       └── report.md        # Final benchmark report
└── README.md
```

## Test Case Format

Each skill has 3 tests:
- **1 open-ended test** - Holistic skill application
- **2 trap tests** - Target specific sharp edges

```yaml
# test-cases/frontend.yaml
skill_id: frontend
skill_path: development/frontend

tests:
  - id: frontend-open-01
    type: open-ended
    name: Build a user profile card component
    prompt: |
      Build a React component for a user profile card...
    evaluation_criteria:
      - Component structure
      - Error handling
      - Accessibility

  - id: frontend-trap-01
    type: trap
    name: Fix SSR hydration issue
    sharp_edge_targeted: hydration-mismatch
    prompt: |
      This component works in development but users report a "flash"...
    expected_catch: |
      Should identify SSR hydration mismatch issues...
```

## Jury Scoring

Each jury model scores on:
- **Correctness** (1-10) - Is the information accurate?
- **Completeness** (1-10) - Does it address all aspects?
- **Expertise** (1-10) - Does it show domain knowledge?
- **Gotcha Awareness** (1-10) - Does it anticipate mistakes?
- **Benchmark Score** (0-100) - Overall professional quality

Plus: **Winner pick** (A/B/Tie) with reasoning.

## Success Criteria

| Metric | Target |
|--------|--------|
| Skilled Win Rate | ≥ 70% |
| Jury Agreement | ≥ 3/4 models |
| Score Delta | > +5 points |

## Configuration

Copy `config.yaml` to `config.local.yaml` and customize:

```yaml
# Jury models to use
jury:
  - name: claude-opus
    provider: anthropic
    model: claude-sonnet-4-20250514
  - name: gpt-4o
    provider: openai
    model: gpt-4o
  # ...

# Success thresholds
thresholds:
  win_rate_target: 0.70
  jury_agreement_target: 0.75
  score_delta_significant: 5
```

## Outputs

### Main Report (`report.md`)

```markdown
## Overall Results

                    Vanilla    Skilled    Delta
Avg Benchmark:      71         84        +13
Win Rate:           18%        76%

## Results by Skill

### frontend ✅
Win Rate: 78% | Avg Delta: +11
```

### Per-Skill Improvement (`improvement-areas.md`)

Generated in each skill folder with:
- Tests where skill lost + root cause analysis
- Tests where skill won (reinforce)
- Improvement backlog

### Global Learnings (`skill-generator-improvement-tips.md`)

Updated in `docs/` with patterns that work/don't work.

## Workflow

1. **Run benchmark** → Get results
2. **Analyze failures** → Why did skilled lose?
3. **Fix skills** → Add sharp edges, improve identity
4. **Re-run specific tests** → Validate fixes
5. **Update global learnings** → Improve all future skills

## Command Reference

```bash
# Run all skills
python scripts/run-contestants.py --skills all

# Run specific skills
python scripts/run-contestants.py --skills frontend,copywriting

# Run specific test
python scripts/run-contestants.py --skills frontend --test-id frontend-trap-01

# Run jury with subset of models
python scripts/run-jury.py --run-id <id> --jury claude-opus,gpt-4o

# Generate report without per-skill files
python scripts/generate-report.py --run-id <id> --no-improvement-files
```

## Adding New Test Cases

1. Create `test-cases/{skill-id}.yaml`
2. Add 1 open-ended + 2 trap tests
3. Reference specific sharp edges in trap tests
4. Run benchmark to validate

## Interpreting Results

| Scenario | Meaning | Action |
|----------|---------|--------|
| Skilled wins 80%+ | Skill adds clear value | Document what works |
| Skilled wins 50-70% | Some value, room to improve | Analyze losses, fix gaps |
| Skilled wins <50% | Skill may be hurting | Major review needed |
| Jury disagrees (2-2) | Test case is ambiguous | Refine test case |
| Low gotcha_awareness | Missing sharp edges | Add more edges |
| Low expertise | Weak identity | Strengthen identity |

---

*For detailed design, see: `docs/plans/2024-12-19-skill-benchmark-system-design.md`*
