# A/B Testing Decisions

Decision frameworks for designing, running, and acting on experiments.

---

## 1. Test vs Ship Decision

**Context**: Deciding whether to run an A/B test or just ship the change.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **A/B test** | Uncertain outcome, high stakes, enough traffic, decision is reversible | Time cost, implementation complexity, opportunity cost |
| **Ship directly** | Obvious improvement, low risk, bug fix, minor change | Miss learnings, risk of negative impact undetected |
| **Staged rollout (no test)** | Need gradual deployment, testing infrastructure, monitoring | No control group, can't measure causal impact |
| **Qualitative validation only** | Low traffic, explorative feature, deep insight needed | No quantitative signal, biased feedback |

**Decision criteria**: Traffic volume, decision stakes, reversibility, confidence level, opportunity cost of testing.

**Red flags**: Testing everything (paralysis), shipping everything (recklessness), testing when you'll ignore results.

---

## 2. Experiment Duration

**Context**: How long to run an experiment before making a decision.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Minimum for power** | High traffic, urgent decision, simple change | May miss novelty fade, weekly patterns |
| **Full business cycle** | Weekly patterns matter, business seasonality | Longer time, opportunity cost |
| **Extended (novelty fade)** | Behavioral change, habit-forming feature | Extended timeline, external changes compound |
| **Continuous (sequential)** | Early stopping desired, using appropriate methods | Complexity, need proper statistical framework |

**Decision criteria**: Traffic levels, novelty concerns, business cycles, urgency.

**Red flags**: Stopping early without valid sequential methods, running indefinitely hoping for significance, ignoring weekly patterns in short tests.

---

## 3. Primary Metric Selection

**Context**: Choosing the one metric that determines experiment success.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Revenue/monetization** | Business-critical decision, monetization feature | Noisy, long feedback loop, may hurt user experience |
| **Conversion rate** | Funnel optimization, clear user action | May not capture value quality, can be gamed |
| **Engagement metric** | User behavior change, product stickiness | Doesn't always correlate with business outcomes |
| **Retention/activation** | Early user experience, long-term value | Long observation window, noisy |
| **Composite/ratio metric** | Multiple effects, want one number | Complex to interpret, obscures trade-offs |

**Decision criteria**: Feature purpose, decision timeframe, metric stability, business alignment.

**Red flags**: Multiple primary metrics, changing primary metric post-hoc, primary metric not aligned with business goals.

---

## 4. Minimum Detectable Effect Size

**Context**: How small an effect you're willing/able to detect.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Very small (1-2%)** | High traffic, major changes, precise optimization | Long experiments, high sample size needed |
| **Small (5%)** | Moderate traffic, meaningful improvements | Balance of precision and practicality |
| **Medium (10-15%)** | Lower traffic, exploratory tests | May miss real but small effects |
| **Large (20%+)** | Very low traffic, big bet validation | Only detects dramatic changes |

**Decision criteria**: Available traffic, test duration tolerance, what size effect would change your decision.

**Red flags**: Setting MDE based on what you hope to see, ignoring sample size constraints, claiming precision you can't achieve.

---

## 5. Randomization Unit

**Context**: What to randomize—users, sessions, clusters, or time periods.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **User-level** | Independent users, long-term effects, most experiments | Need user ID, mobile vs web complexity |
| **Session-level** | Anonymous users, session-bound features | Same user sees different variants, harder to interpret |
| **Cluster (geography, org)** | Network effects, shared resources, interference | Lower power, fewer clusters than users |
| **Time-based (switchback)** | Marketplace, inventory, can't do user-level | Time confounds, need many switches |

**Decision criteria**: Presence of network effects, user identification capability, interference concerns.

**Red flags**: User-level when there's interference, cluster-level when user-level would work (wasting power), session-level for habit-forming features.

---

## 6. Statistical Framework

**Context**: Choosing the statistical approach for experiment analysis.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Frequentist (fixed horizon)** | Simple tests, commit to duration, standard practice | Can't peek validly, rigid timeline |
| **Sequential testing** | Want valid early stopping, continuous monitoring | More complex, need right implementation |
| **Bayesian** | Want probability statements, prior information, credible intervals | Requires prior specification, less familiar |
| **Multi-armed bandit** | Regret minimization, ongoing optimization, not pure testing | Not optimized for inference, complicates analysis |

**Decision criteria**: Team expertise, tooling available, need for early stopping, interpretability requirements.

**Red flags**: Bayesian without understanding priors, sequential without proper implementation, bandits when you need clean causal inference.

---

## 7. Handling Inconclusive Results

**Context**: What to do when an experiment doesn't reach significance.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Ship anyway (judgment)** | Low risk, other reasons to prefer variant, directionally positive | No validated learning, risk of shipping worse |
| **Ship control** | Feature adds complexity without benefit, resources needed elsewhere | Miss potentially good features (underpowered) |
| **Run larger test** | Underpowered original, effect exists but small, worth knowing | Time cost, may find effect was noise |
| **Declare "no effect"** | Well-powered test, answer is "no detectable difference at this size" | May discourage iteration on the idea |

**Decision criteria**: Power of original test, cost of being wrong, opportunity cost, judgment about variant quality.

**Red flags**: Treating inconclusive as failure, extending hoping to find effect, shipping based on "directional" without acknowledging uncertainty.

---

## 8. Multi-Variant Experiment Design

**Context**: Testing more than two variants at once.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Simple A/B** | One hypothesis, clear variant, focused learning | Limited exploration per experiment |
| **A/B/C (few variants)** | 2-3 distinct approaches, enough traffic, want comparison | Split traffic, longer for significance |
| **Multi-armed (many variants)** | Exploring option space, optimization, less about inference | Each variant underpowered for inference |
| **Factorial design** | Testing multiple factors, interested in interactions | Complex, needs high traffic, harder to interpret |

**Decision criteria**: Number of hypotheses, traffic available, exploration vs inference goals.

**Red flags**: Too many variants for traffic (all underpowered), factorial designs without interaction hypotheses, not pre-registering comparisons.

---

## 9. Experiment Prioritization

**Context**: Choosing which experiments to run from a backlog.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Expected impact** | Maximizing business value, clear hypotheses | May miss bold experiments, focuses on incremental |
| **Learning value** | Building knowledge, uncertain hypotheses | May not prioritize impact, slower to demonstrate value |
| **Urgency/dependency** | Blocking decisions, team needs answer | May deprioritize higher-value tests |
| **Risk reduction** | High-stakes launches, validating before commitment | Resource-intensive for risk mitigation |

**Decision criteria**: Business priorities, team capacity, knowledge gaps, decision timelines.

**Red flags**: Only prioritizing safe/likely winners, never running bold experiments, testing what's easy vs what matters.

---

## 10. Communicating Experiment Results

**Context**: How to share and act on experiment findings.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Ship/no-ship recommendation** | Clear outcome, need decision, stakeholders want clarity | Loses nuance, doesn't share learnings |
| **Detailed analysis report** | Complex experiment, multiple learnings, needs context | Time-consuming, may not get read |
| **Confidence interval + context** | Statistical audience, want to convey uncertainty | Requires statistical literacy |
| **Learning-focused summary** | Building knowledge base, informing future work | May not drive immediate action |
| **Automated dashboard** | High experiment velocity, self-serve stakeholders | Miss nuance, requires good tooling |

**Decision criteria**: Audience sophistication, decision urgency, organizational learning culture.

**Red flags**: Reporting only significant results, hiding confidence intervals, not sharing negative results, overconfidence in point estimates.
