# A/B Testing Patterns

Proven approaches for running experiments that generate reliable, actionable learnings.

---

## 1. Pre-Registration Protocol

**The pattern**: Document your hypothesis, metrics, sample size, and analysis plan before starting any experiment.

**How it works**:
1. Write the hypothesis: "Changing X will increase Y because Z"
2. Define primary metric (one) and secondary metrics (few)
3. Calculate required sample size for your MDE
4. Specify analysis approach and decision criteria
5. Lock the document before experiment starts
6. Run experiment exactly as planned
7. Analyze exactly as pre-registered

**Why it works**: Prevents p-hacking, post-hoc rationalization, and metric cherry-picking. Forces clarity of thinking before commitment. Makes negative results as valid as positive results.

**Indicators for use**: Any experiment where you'll make a ship/no-ship decision. Experiments with organizational visibility. When you need to trust results.

---

## 2. Guardrail Metrics Framework

**The pattern**: Define what must NOT happen alongside what you want to happen.

**How it works**:
1. Define primary metric (what you're trying to improve)
2. Define guardrail metrics (what must not get worse):
   - Revenue/monetization guardrails
   - Engagement/retention guardrails
   - User experience guardrails
   - Technical performance guardrails
3. Set thresholds for guardrail violations (usually "no statistically significant negative")
4. Any guardrail violation = experiment failure, regardless of primary metric

**Why it works**: Prevents local optimization at the expense of global health. Catches hidden costs of "improvements." Forces thinking about trade-offs before shipping.

**Indicators for use**: Any experiment that touches user experience. High-stakes changes. Monetization experiments.

---

## 3. Power Analysis Discipline

**The pattern**: Calculate required sample size before starting, and refuse to run underpowered experiments.

**How it works**:
1. Define your minimum detectable effect (MDE)—smallest effect you care about
2. Know your baseline conversion rate
3. Choose significance level (usually 0.05) and power (usually 0.8)
4. Calculate required sample size: n = f(baseline, MDE, α, power)
5. Calculate how long experiment needs to run given your traffic
6. If duration is too long, either: accept larger MDE, find higher-traffic surface, or don't run the test

**Why it works**: Prevents wasted experiments that can't detect real effects. Forces prioritization—you can't test everything. Sets realistic expectations about what you can learn.

**Indicators for use**: Every experiment. No exceptions.

---

## 4. Sequential Testing Methods

**The pattern**: Use statistical methods that allow valid early stopping or continuous monitoring.

**How it works**:
1. Use sequential analysis methods (SPRT, always-valid p-values, Bayesian methods)
2. Pre-define stopping boundaries (both for stopping early AND for required minimum runtime)
3. Monitor continuously if desired—methods account for multiple looks
4. Stop when boundaries are crossed, with valid inference

**Why it works**: Legitimate early stopping without inflated false positives. Faster learning cycles when effects are large. Formal framework for what people do anyway (peek at results).

**Indicators for use**: When early results could inform urgent decisions. High-velocity experimentation. Large expected effects. Resource-constrained environments.

---

## 5. Stratified Randomization

**The pattern**: Ensure balance on important covariates by randomizing within strata.

**How it works**:
1. Identify key covariates that predict your outcome (e.g., platform, user tenure, geography)
2. Define strata (e.g., iOS + New Users, iOS + Old Users, Android + New Users, etc.)
3. Randomize separately within each stratum
4. Analyze with stratification to reduce variance

**Why it works**: Ensures balanced groups even in small experiments. Reduces variance and increases precision. Prevents accidental imbalance on important factors.

**Indicators for use**: Small sample sizes. Known important covariates. High-stakes experiments. When pure randomization might create imbalance.

---

## 6. Holdout Groups

**The pattern**: Maintain a persistent control group that never sees any new features.

**How it works**:
1. Reserve a small percentage of users (1-5%) who never get new features
2. This group remains on "old" experience
3. Periodically compare holdout to everyone else
4. Measure cumulative impact of all changes over time

**Why it works**: Catches cumulative negative effects that individual tests miss. Validates that your experimentation program is net positive. Provides ground truth against optimization theater.

**Indicators for use**: High-velocity experimentation (many changes per month). Long-term strategy evaluation. Validating experimentation ROI.

---

## 7. Interaction Effect Detection

**The pattern**: Design experiments to detect when features interact, rather than assuming independence.

**How it works**:
1. When running multiple concurrent experiments, analyze for interactions
2. Use factorial designs when interaction effects are expected
3. Monitor for unexpected interactions between running experiments
4. Create "conflict rules" that prevent known interactions

**Why it works**: Independent experiments on the same users can interact unpredictably. What wins alone might lose in combination. Critical for high-velocity testing.

**Indicators for use**: Multiple concurrent experiments. Features that could logically interact. Changes to the same user flow.

---

## 8. Experiment Velocity Framework

**The pattern**: Optimize for learning velocity, not just individual experiment success.

**How it works**:
1. Set a learning goal: experiments completed per time period
2. Create templates and infrastructure that minimize experiment setup time
3. Prioritize experiments by learning value, not just expected impact
4. Kill losing experiments quickly, don't extend hoping for wins
5. Track and celebrate learnings, not just wins
6. Build an experiment backlog and groom it regularly

**Why it works**: More experiments = more learning = better products. Speed compounds. A culture of testing beats individual test outcomes.

**Indicators for use**: Product organizations seeking to build experimentation culture. Teams with experiment backlog. Growth-stage companies.

---

## 9. Metric Sensitivity Analysis

**The pattern**: Validate that your metrics can actually detect changes before running experiments.

**How it works**:
1. Before committing to a metric, run AA tests (two identical groups)
2. Verify the metric is stable (low variance, no drift)
3. Understand the variance to calculate realistic MDEs
4. Consider metric transformations that reduce variance (capping outliers, log transforms)
5. If the metric is too noisy, find a proxy or change the experimental design

**Why it works**: Noisy metrics require huge sample sizes. Some metrics are unmeasurable with realistic traffic. Knowing this before the experiment saves time.

**Indicators for use**: New metrics being used for the first time. Metrics with known high variance. Before committing to long-running experiments.

---

## 10. Learning Documentation System

**The pattern**: Capture and index experiment learnings in a searchable, reusable format.

**How it works**:
1. After every experiment, document: hypothesis, result, learning, implications
2. Tag with: feature area, metric type, user segment, outcome (positive/negative/null)
3. Make the repository searchable
4. Before designing new experiments, search for relevant prior learnings
5. Periodically review learnings for patterns and insights

**Why it works**: Organizations forget what they've learned. Teams repeat experiments others have run. Patterns emerge across experiments that single experiments miss. Institutional knowledge compounds.

**Indicators for use**: Teams running many experiments. Multiple teams experimenting in the same product. Any organization that wants to learn faster.
