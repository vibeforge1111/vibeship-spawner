# A/B Testing Anti-Patterns

Approaches that seem like good experimentation practice but undermine learning and lead to bad decisions.

---

## 1. Test Everything Culture

**What it looks like**: Requiring A/B tests for every change, no matter how small. "We can't change the error message without a test." Testing button colors while strategy remains untested.

**Why it seems good**: Data-driven everything. Minimizing risk on every change. Maximizing experiment volume metrics.

**Why it fails**: Testing has opportunity cost. Trivial tests waste resources and create bottlenecks. Teams become afraid to make obvious improvements. Experimentation becomes bureaucracy rather than learning.

**What to do instead**: Test when there's genuine uncertainty about outcomes. Ship obvious improvements without tests. Save experimentation capacity for decisions that matter. Test big bets, not small tweaks.

---

## 2. P-Value Worship

**What it looks like**: Treating p < 0.05 as the only decision criterion. Shipping anything statistically significant. Celebrating significance without considering effect size or practical impact.

**Why it seems good**: Statistical significance is rigorous. Clear decision rule. "The data says it works."

**Why it fails**: Statistically significant effects can be practically meaningless. A 0.1% lift is significant with enough sample size but worthless strategically. P-values don't tell you if the effect matters.

**What to do instead**: Combine statistical significance with practical significance. Pre-define the minimum effect size you care about. Consider confidence interval width, not just whether it excludes zero. Ask "is this big enough to matter?"

---

## 3. HiPPO Overrides

**What it looks like**: Running experiments, then ignoring results when leadership disagrees. "The test says X, but we're going with Y because the CEO prefers it." Experiments as rubber stamps, not decision tools.

**Why it seems good**: Sometimes intuition is right. Leadership has context experiments miss. Not everything can be tested.

**Why it fails**: Destroys experimentation culture. Teams stop trusting experiments. Resources wasted on tests that don't influence decisions. Creates cynicism about data-driven claims.

**What to do instead**: If you're not going to follow results, don't run the test. Be explicit about which decisions are experimentable and which are judgment calls. When overriding, document why—and track whether the override was right.

---

## 4. Perpetual Testing

**What it looks like**: Running experiments for months "to be sure." Extending losing experiments hoping they'll turn around. Never ending tests because "we might learn more."

**Why it seems good**: More data is better. What if the effect emerges later? Ending feels like giving up.

**Why it fails**: Opportunity cost. Experiments block other experiments. Novelty effects fade and long tests capture changing contexts. If it's not significant by now, more time rarely helps.

**What to do instead**: Pre-commit to duration based on power analysis. Stop on schedule regardless of results. If results are unclear, the answer is "we couldn't detect an effect of the size we care about." Move on.

---

## 5. Success Theater

**What it looks like**: Only reporting winning experiments. Hiding or explaining away losses. Metrics that always seem to go up. "100% win rate" on experiments.

**Why it seems good**: Keeps stakeholders happy. Demonstrates team value. Avoids difficult conversations.

**Why it fails**: If everything wins, nothing is learned. Real learning comes from surprises. Hides the cost of bad ideas. Creates pressure to find wins rather than find truth. Eventually, the theater is exposed.

**What to do instead**: Celebrate learnings, not just wins. Report losses prominently—they saved you from shipping bad ideas. Track and share win rates honestly. Make it safe to report negative results.

---

## 6. Metric Hunting

**What it looks like**: Analyzing experiments across dozens of metrics until finding one that's significant. "Primary metric was flat, but look at this segment!" Post-hoc metric selection.

**Why it seems good**: Maximizing insights from experiments. Leaving no stone unturned. Finding unexpected learnings.

**Why it fails**: With enough metrics, you'll find false positives by pure chance. Post-hoc selected metrics are likely noise. You're fitting stories to randomness, not discovering truth.

**What to do instead**: Pre-register primary and secondary metrics. Apply multiple comparison corrections to exploratory analysis. Treat post-hoc findings as hypotheses for future experiments, not conclusions. Be deeply skeptical of cherry-picked wins.

---

## 7. Complexity Addiction

**What it looks like**: Insisting on multi-armed bandits, Bayesian methods, or complex statistical techniques when simple A/B tests would work. Over-engineering experimentation infrastructure.

**Why it seems good**: Advanced methods are theoretically better. Shows sophistication. Keeps up with latest research.

**Why it fails**: Complex methods have more assumptions and failure modes. Implementation bugs are harder to catch. Most organizations don't have the traffic or expertise to use them correctly. Simple methods work for most cases.

**What to do instead**: Use the simplest method that works. Standard frequentist A/B tests are fine for most experiments. Add complexity only when you've hit specific limitations of simple methods. Master the basics before advancing.

---

## 8. Segment Obsession

**What it looks like**: Cutting every experiment by every possible segment. Launching features only for segments where it "won." Building complex targeting based on experiment segments.

**Why it seems good**: Personalization. Different users have different needs. Maximize impact by targeting winners.

**Why it fails**: Segment analysis multiplies false positives. Small segments are underpowered. Winners in segments often don't replicate. You're over-fitting to noise.

**What to do instead**: Pre-register segment hypotheses. Only analyze segments you predicted would differ. Apply appropriate corrections. Require segment effects to replicate before acting. Be deeply skeptical of segment-only wins.

---

## 9. Minimum Viable Experiments

**What it looks like**: Running crude, half-built experiments to "test quickly." Shipping buggy variants. "It's just a test, we'll fix it later."

**Why it seems good**: Speed. Learning fast. Don't over-invest before validation.

**Why it fails**: Broken variants bias results. You're testing your bugs, not your ideas. Users have bad experiences. Even if you learn the variant works, you haven't validated a quality implementation.

**What to do instead**: Build variants to production quality. Test the thing you'd actually ship. Speed comes from scope reduction, not quality reduction. A broken test is worse than no test.

---

## 10. Novelty Ignorance

**What it looks like**: Launching features based on short-term experiment wins without considering novelty effects. "Week 1 shows 20% lift—ship it!"

**Why it seems good**: Fast learning. Results are significant. Time is money.

**Why it fails**: Novelty effects fade. Initial excitement isn't sustained engagement. Users adapt. Your 20% week-1 lift becomes 2% at steady state—or negative.

**What to do instead**: Run experiments long enough for novelty to fade (often 2-4 weeks). Compare early vs late experiment performance. Use holdout groups to measure long-term impact. Be skeptical of dramatic early wins.

---

## 11. Correlation Causation Conflation

**What it looks like**: Using experiment data to make causal claims that experiments can't support. "Users who clicked feature X had higher retention, so feature X improves retention."

**Why it seems good**: Experiments are causal. You have data from experiments. The correlation is in experiment data.

**Why it fails**: Only the treatment assignment is randomized. Post-treatment behaviors are correlated, not causal. Users who choose to use a feature are different from those who don't. You're back to observational analysis.

**What to do instead**: Focus on intent-to-treat effects (treatment vs control, not engaged vs not engaged). Use instrumental variables if analyzing mechanism. Be clear about what the experiment can and can't tell you.

---

## 12. Decision Paralysis

**What it looks like**: Never shipping without statistical significance. Refusing to make judgment calls. "We need to run another test" as a default response.

**Why it seems good**: Data-driven. Avoiding mistakes. Scientific rigor.

**Why it fails**: Not all decisions can wait for data. Opportunity cost of delay. Sometimes you have to act on judgment. Perfect information doesn't exist. Experiments are for reducing uncertainty, not eliminating it.

**What to do instead**: Match evidence requirements to decision stakes. For reversible decisions, act on judgment when experiments are impractical. Accept that some decisions must be made with incomplete data. Use experiments to reduce risk on high-stakes, hard-to-reverse decisions.
