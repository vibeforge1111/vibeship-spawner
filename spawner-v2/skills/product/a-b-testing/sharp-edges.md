# A/B Testing Sharp Edges

Critical mistakes in experimentation that lead to wrong decisions and wasted resources.

---

## 1. Peeking Problem

**The mistake**: Checking results before the experiment reaches planned sample size, then stopping early when results look significant.

**Why it happens**: Impatience. Pressure to ship. Results look "obviously" significant. "We already have 10,000 users."

**Why it's devastating**: Statistical significance fluctuates wildly early in experiments. Peeking dramatically inflates false positive rates—what looks like a 5% significance level becomes 30%+. You'll declare winners that aren't winners.

**The fix**: Pre-commit to sample size and duration. Use sequential testing methods if early stopping is required. Don't look at primary metrics until experiment ends. Automate experiment completion.

---

## 2. Underpowered Tests

**The mistake**: Running experiments without enough sample size to detect meaningful effects. Testing on 500 users to detect a 2% lift.

**Why it happens**: Impatience. Don't understand power analysis. "We'll just run it longer if needed." Small user base.

**Why it's devastating**: Underpowered tests usually show no effect—not because there isn't one, but because you couldn't detect it. You'll kill good ideas that actually work. Or worse, you'll use small sample p-hacking to "find" effects.

**The fix**: Always calculate required sample size before starting. Know your baseline conversion rate and minimum detectable effect. If you can't reach required sample size, either accept a larger MDE or don't run the test.

---

## 3. Multiple Comparison Inflation

**The mistake**: Testing many metrics without adjusting for multiple comparisons. Running 20 metrics, celebrating the one that's significant.

**Why it happens**: "More metrics = more learning." Post-hoc storytelling. Cherry-picking favorable results.

**Why it's devastating**: With 20 metrics at 5% significance level, you expect 1 false positive by pure chance. That "significant" metric might be noise. You'll ship changes that actually hurt because one random metric looked good.

**The fix**: Pre-register primary metrics. Apply Bonferroni or Benjamini-Hochberg corrections for multiple comparisons. Distinguish confirmatory (hypothesis-testing) from exploratory (hypothesis-generating) analysis.

---

## 4. Sample Ratio Mismatch

**The mistake**: Not validating that your experiment is actually splitting traffic correctly. Assuming a 50/50 split is actually 50/50.

**Why it happens**: Trust the tooling. Don't check. Assignment bugs are invisible without monitoring.

**Why it's devastating**: SRM indicates broken randomization. Your groups aren't comparable. Any observed difference might be from broken assignment, not your treatment. Results are uninterpretable.

**The fix**: Always check sample ratio before analyzing results. Alert on significant deviations from expected split. Investigate any SRM before trusting results. Common causes: bot traffic, caching, assignment bugs.

---

## 5. Carryover Effects

**The mistake**: Running experiments too long, or not accounting for users who experience multiple variants over time, or testing on the same users repeatedly.

**Why it happens**: Long experiments capture more data. User pools are limited. Features change over time.

**Why it's devastating**: Users develop habits with the first experience. Novelty effects fade. A "better" variant might only be better because it's new. Long-running experiments accumulate external changes.

**The fix**: Account for novelty effects—initial lifts often fade. Use holdout groups for long-term effects. Be cautious with experiments on repeat behaviors. Consider between-subjects vs within-subjects designs carefully.

---

## 6. Selection Bias in Assignment

**The mistake**: Assigning users to variants in a way that creates systematic differences between groups. Using user ID mod for assignment when IDs aren't random.

**Why it happens**: Simple assignment seems fine. Don't understand randomization requirements. Technical constraints lead to non-random approaches.

**Why it's devastating**: Groups differ before the experiment starts. Treatment and control aren't comparable. You're measuring pre-existing differences, not treatment effects.

**The fix**: Use proper randomization (hashing with salt). Validate covariate balance between groups. Check for pre-treatment differences in key metrics. Use stratified randomization for small samples.

---

## 7. Survivor Bias

**The mistake**: Analyzing only users who complete a flow, ignoring those who dropped out. "Conversion rate among users who saw the checkout page."

**Why it happens**: Complete data feels cleaner. Drop-offs seem like a different problem. Analysis is easier on complete cohorts.

**Why it's devastating**: You're conditioning on a post-treatment outcome. If your variant causes more people to reach checkout, the survivors are different populations. Comparisons are invalid.

**The fix**: Use intent-to-treat analysis—analyze all users assigned, not just those who completed. Track the full funnel. If analyzing subgroups, ensure the subgroup definition can't be affected by treatment.

---

## 8. Network Effects Ignorance

**The mistake**: Running user-level randomization when the feature has network effects or interference between users.

**Why it happens**: User randomization is standard. Don't think about user interactions. Network effects seem rare.

**Why it's devastating**: Users in treatment affect users in control (and vice versa). Effects spill over. Your measured effect underestimates (or overestimates) the true effect of full rollout.

**The fix**: Use cluster randomization (by geography, by workplace, by network cluster). Run switchback experiments (time-based randomization). Model and account for interference. When in doubt, run regional rollouts.

---

## 9. Local Maximum Chasing

**The mistake**: Only running incremental tests on existing designs. A/B testing button colors while missing that the entire flow is wrong.

**Why it happens**: Small tests are safe. Big changes are scary. Incremental improvement feels productive.

**Why it's devastating**: You'll optimize to a local maximum while missing the global maximum. Thousands of small tests can't find what one bold test would reveal. You're polishing a suboptimal design.

**The fix**: Balance incremental optimization with bold exploration. Periodically test radically different approaches. Use holdout groups to measure cumulative effect of optimizations. Question the fundamentals, not just the details.

---

## 10. Metric Definition Drift

**The mistake**: Changing how you define or calculate metrics mid-experiment, or using different definitions across experiments.

**Why it happens**: "This metric definition is better." Discovered an issue with the current definition. Different teams use different definitions.

**Why it's devastating**: You can't compare pre/post changes. Historical learnings become invalid. Different experiments can't be compared. You might be optimizing different things than you think.

**The fix**: Lock metric definitions before experiment starts. Document definitions precisely (SQL or code, not prose). Use a metrics layer or semantic layer. If you must change definitions, clearly mark the break in continuity.

---

## 11. Winner's Curse

**The mistake**: Trusting the observed effect size of a winning experiment as the true effect. "We saw a 15% lift, so we'll plan for 15%."

**Why it happens**: The number is right there. Significant means real. Planning needs numbers.

**Why it's devastating**: Winning experiments have upward-biased effect estimates—you selected them because they showed large effects. True effects are typically 20-50% smaller. Your projections will disappoint.

**The fix**: Expect effect shrinkage. Use holdout groups to validate long-term impact. Build in conservatism when projecting experiment impact. Don't bet the company on point estimates.

---

## 12. Guardrail Negligence

**The mistake**: Only measuring the metric you're trying to improve, ignoring broader impact on user experience, engagement, or revenue.

**Why it happens**: Focus on the goal. Guardrails seem like extra work. "What could go wrong?"

**Why it's devastating**: You might improve clicks while destroying engagement. Increase signups while tanking retention. Win on one metric while losing on everything else. Ship changes that hurt the business overall.

**The fix**: Define guardrail metrics before every experiment. Include revenue, engagement, satisfaction, and technical performance. Treat guardrail failures as experiment failures, regardless of primary metric wins.
