# Skill Benchmark & Improvement System Design

> Multi-model jury scoring to validate and improve skills

## Overview

A semi-automated benchmark system that pits **Vanilla Opus** against **Skilled Opus** on identical tasks, then has multiple frontier models score the outputs. Results drive systematic skill improvements.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SKILL BENCHMARK SYSTEM                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  TEST CASES          CONTESTANTS           JURY                  │
│  ───────────         ───────────           ────                  │
│  • Open-ended        • Vanilla Opus        • Claude Opus         │
│  • Trap scenarios    • Skilled Opus        • GPT-4o              │
│                        (with skill)        • Gemini Pro          │
│                                            • Llama 3.1           │
│                                                                  │
│  FLOW:                                                           │
│  1. Same prompt → both contestants                               │
│  2. Collect outputs (anonymized as "Response A" / "Response B")  │
│  3. Each jury model scores both + picks winner                   │
│  4. Aggregate scores across jury                                 │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## What We Measure

- **Win rate** - How often does Skilled Opus beat Vanilla Opus?
- **Benchmark score** - 0-100 score from each jury model
- **Jury agreement** - Do all models agree, or is it split?
- **Domain breakdown** - Which skill categories show biggest lift?
- **Sharp edge detection** - In trap scenarios, did skills catch the trap?

## Test Case Design

### Two Test Types Per Skill

**Open-Ended Tests** - Real-world tasks requiring holistic skill application:

```yaml
test_id: frontend-open-01
type: open-ended
skill: frontend
prompt: |
  Build a React component for a user profile card that:
  - Shows avatar, name, bio, and social links
  - Has loading and error states
  - Is accessible
  - Works on mobile and desktop
evaluation_criteria:
  - Component structure and patterns
  - Error handling approach
  - Accessibility considerations
  - Performance awareness
```

**Trap Scenarios** - Deliberately trigger sharp edges:

```yaml
test_id: frontend-trap-01
type: trap
skill: frontend
sharp_edge_targeted: use-effect-missing-deps
prompt: |
  Fix this component - users report it's slow:

  function UserSearch({ query }) {
    const [results, setResults] = useState([])

    useEffect(() => {
      fetchUsers(query).then(setResults)
    }, [])  // <-- TRAP: missing query dep

    return <ResultsList results={results} />
  }
expected_catch: |
  Should identify the missing dependency causing stale results,
  not just suggest generic performance fixes.
```

### Coverage

**7 categories × 3 tests = 21 test cases**

| Category | Representative Skill | Why This One |
|----------|---------------------|--------------|
| frameworks/ | `nextjs-app-router` | Most complex, highest sharp edge count |
| development/ | `frontend` | Broad coverage, many gotchas |
| design/ | `ux-design` | Tests non-code expertise |
| marketing/ | `copywriting` | Clear right/wrong in output quality |
| strategy/ | `product-strategy` | High-stakes decisions |
| product/ | `a-b-testing` | Very technical non-code domain |
| communications/ | `dev-communications` | Tests documentation expertise |

**Test distribution per skill:**
- 1 open-ended (holistic application)
- 1 trap targeting most critical sharp edge
- 1 trap targeting second-most critical sharp edge

## Jury Scoring System

Each jury model receives:

```
You are evaluating two responses to the same task.
Do not assume which is better - evaluate on merit.

TASK:
{original_prompt}

RESPONSE A:
{output_vanilla_or_skilled}  # randomized position

RESPONSE B:
{output_skilled_or_vanilla}  # randomized position

Score each response 1-10 on:
1. CORRECTNESS - Is the information/code accurate?
2. COMPLETENESS - Does it address all aspects of the task?
3. EXPERTISE - Does it show deep domain knowledge?
4. GOTCHA AWARENESS - Does it anticipate/avoid common mistakes?

BENCHMARK SCORE (0-100):
Calculate an overall score out of 100 that represents the
quality of this response for a professional use case.

Then pick: Which response is better overall? (A/B/Tie)
Explain your reasoning in 2-3 sentences.
```

**Key design decisions:**
- Position randomized (A/B) to prevent bias
- Scores + winner + reasoning captured
- "Gotcha awareness" directly tests skill value
- Benchmark /100 for headline number

## Report Format

```
SKILL BENCHMARK RESULTS - Frontend
──────────────────────────────────
                    Vanilla    Skilled    Delta
Avg Benchmark:        71         84        +13
Win Rate:             18%        76%       (6% ties)

By Jury:
  Claude Opus:        Skilled wins 3/3
  GPT-4o:             Skilled wins 2/3
  Gemini Pro:         Skilled wins 2/3
  Llama 3.1:          Skilled wins 2/3
```

## Directory Structure

```
benchmarks/
├── config.yaml              # API keys, model endpoints, settings
├── test-cases/
│   ├── frontend.yaml        # 3 tests for frontend skill
│   ├── nextjs-app-router.yaml
│   ├── ux-design.yaml
│   ├── copywriting.yaml
│   ├── product-strategy.yaml
│   ├── a-b-testing.yaml
│   └── dev-communications.yaml
├── scripts/
│   ├── run-contestants.py   # Runs vanilla vs skilled, saves outputs
│   ├── run-jury.py          # Sends to jury models, collects scores
│   └── generate-report.py   # Aggregates into final report
├── outputs/
│   └── {run-id}/
│       ├── contestants/     # Raw outputs from vanilla/skilled
│       ├── jury-scores/     # Raw scores from each jury model
│       └── report.md        # Final aggregated report
└── README.md                # How to run benchmarks
```

## Workflow (3 Steps)

```bash
# Step 1: Generate contestant outputs (you review before proceeding)
python scripts/run-contestants.py --skills all

# Step 2: Run jury scoring (costs API calls)
python scripts/run-jury.py --run-id 2024-12-19-01

# Step 3: Generate report
python scripts/generate-report.py --run-id 2024-12-19-01
```

## Improvement Feedback Loop

```
┌─────────────────────────────────────────────────────────────────┐
│                    IMPROVEMENT CYCLE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  BENCHMARK RESULTS                                               │
│        │                                                         │
│        ▼                                                         │
│  ┌─────────────────┐                                            │
│  │ Skill wins?     │──YES──► Document what worked               │
│  └────────┬────────┘         Update SKILL_CREATION_GUIDE        │
│           │ NO                                                   │
│           ▼                                                      │
│  ┌─────────────────┐                                            │
│  │ Analyze WHY     │                                            │
│  │ - Missing edge? │                                            │
│  │ - Weak identity?│                                            │
│  │ - Bad example?  │                                            │
│  └────────┬────────┘                                            │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────┐                                            │
│  │ Fix the skill   │──► Re-run that specific test               │
│  └─────────────────┘                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Diagnostic questions when skill loses:**
1. Did jury cite something the skill should've caught? → Add sharp edge
2. Did skilled output miss obvious expertise? → Strengthen identity
3. Did vanilla actually do fine? → Maybe this isn't a real edge
4. Did jury disagree? → Test case might be ambiguous

## Improvement Documentation

### Global: `docs/V2/skill-generator-improvement-tips.md`

Learnings that apply to ALL skills:
- What works (keep doing)
- What doesn't work (stop doing)
- Identity improvements
- Sharp edge improvements
- Example quality learnings

### Per-Skill: `improvement-areas.md`

Lives in each skill folder:
- Benchmark summary (win rate, scores)
- Tests where skill lost + root cause + action
- Tests where skill won (reinforce)
- Improvement backlog

## Success Criteria (Phase 1)

- Skilled Opus wins 70%+ of head-to-heads
- At least 3/4 jury models agree on winner
- Trap scenarios show clear skill advantage
- Clear improvement backlog generated per skill

## Deliverables

1. `benchmarks/` folder with scripts and test cases
2. `docs/V2/skill-generator-improvement-tips.md`
3. `improvement-areas.md` in each tested skill folder
4. Updated `SKILL_CREATION_GUIDE.md` with learnings

---

*Design created: 2024-12-19*
