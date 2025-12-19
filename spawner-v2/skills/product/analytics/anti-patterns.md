# Analytics Anti-Patterns

Anti-patterns that seem like good analytics practices but lead to poor decisions and wasted effort.

---

## 1. Dashboard Obsession

**What it looks like**: Building beautiful, comprehensive dashboards for everything. Spending weeks perfecting visualizations and adding every possible metric.

**Why it seems good**: Dashboards feel productive. They're visible, shareable, and look impressive. More metrics seem better than fewer.

**Why it fails**: Dashboards aren't insights. 90% of dashboards are viewed once and forgotten. Comprehensive dashboards overwhelm users—they can't find what matters among what doesn't.

**What to do instead**: Start with the question, not the dashboard. Build the simplest view that answers it. Add metrics only when someone asks for them AND explains what decision they'll make differently. Kill dashboards that haven't been viewed in 30 days.

---

## 2. Metric Collection Mania

**What it looks like**: Tracking everything possible "in case we need it later." Adding every available event, property, and dimension. Never removing old metrics.

**Why it seems good**: More data = more options. You can't analyze what you didn't track. Storage is cheap.

**Why it fails**: More data creates more noise. You waste engineering time maintaining tracking. Query performance degrades. Nobody can find the metrics that matter. Privacy risk increases with every data point collected.

**What to do instead**: Track only what you'll act on in the next 90 days. Every metric needs an owner and a decision it drives. Implement regular metric audits—if nobody's using it, stop tracking it.

---

## 3. Analysis Paralysis

**What it looks like**: Constantly requesting more data before making any decision. Requiring statistical significance on everything. Delaying launches for "more analysis."

**Why it seems good**: Data-driven means more data is better, right? Making decisions without complete information feels risky.

**Why it fails**: Perfect data doesn't exist. Analysis has diminishing returns. Speed often matters more than precision. You can learn more from shipping than from analyzing.

**What to do instead**: Define "good enough" before starting analysis. Set analysis timeboxes. Accept that some decisions need to be made with incomplete data. Run experiments instead of endless analysis.

---

## 4. Correlation Causation Confusion

**What it looks like**: Making strategic decisions based on correlations. "Users who do X have 50% higher retention, so let's push everyone to do X." Drawing causal conclusions from observational data.

**Why it seems good**: The data shows a clear relationship. It makes intuitive sense. Acting on correlations feels data-driven.

**Why it fails**: Correlation isn't causation. Users who do X might be inherently different—making others do X won't change their behavior. You might optimize for a symptom while ignoring the cause.

**What to do instead**: Run controlled experiments to establish causation. Look for reverse causality. Consider confounding variables. Use causal inference techniques when experiments aren't possible.

---

## 5. Real-Time Everything

**What it looks like**: Building real-time dashboards for all metrics. Refreshing data every minute. Alerting on every fluctuation.

**Why it seems good**: Faster data = faster decisions. You can catch problems immediately. Real-time feels more sophisticated.

**Why it fails**: Real-time data is noisy. Most metrics don't require real-time monitoring. The infrastructure cost is massive. People react to noise rather than signal, making worse decisions.

**What to do instead**: Match data freshness to decision frequency. Daily metrics are fine for weekly decisions. Reserve real-time for operational metrics that require immediate action. Batch everything else.

---

## 6. Segment Slicing Spiral

**What it looks like**: Endlessly slicing data by more segments to find meaningful patterns. "But what about iOS users in Europe who signed up via paid ads on weekends?"

**Why it seems good**: More granular analysis feels more insightful. Somewhere in the segments is the answer.

**Why it fails**: Small segments have high variance—you're finding noise, not signal. You'll find "significant" patterns by pure chance. Findings don't generalize. You lose sight of the big picture.

**What to do instead**: Start with aggregate metrics. Segment only when you have a hypothesis. Use appropriate sample sizes. Apply multiple comparison corrections. Focus on segments large enough to matter.

---

## 7. Proxy Metric Worship

**What it looks like**: Optimizing proxy metrics while ignoring true outcomes. Celebrating page views, time on site, or engagement scores while revenue and retention decline.

**Why it seems good**: Proxy metrics are easier to move. They respond faster than outcome metrics. They make progress visible.

**Why it fails**: Proxies can diverge from outcomes. You can game proxies without creating value. Teams optimize the proxy instead of the real goal. Eventually, proxies become ends in themselves.

**What to do instead**: Always tie proxies to outcomes. Regularly validate that proxies predict outcomes. Be suspicious when proxies improve but outcomes don't. Report proxies alongside outcomes, never alone.

---

## 8. Historical Comparison Trap

**What it looks like**: Comparing every metric to last year, last month, or last week. Flagging any deviation from historical patterns as concerning or celebrating.

**Why it seems good**: Historical comparison provides context. It's easy to understand and explain. Trends feel meaningful.

**Why it fails**: Context changes. Last year's baseline may be irrelevant. Seasonality creates false signals. External factors (competition, economy, pandemic) make comparisons meaningless. You might be comparing to a terrible baseline.

**What to do instead**: Understand what's driving the comparison period. Use appropriate baselines (adjust for seasonality, external factors). Compare to targets based on current context, not just history. Ask "compared to what we expected" not just "compared to before."

---

## 9. Self-Reported Data Trust

**What it looks like**: Heavily relying on surveys, NPS scores, and user-reported intent. Making major decisions based on what users say they want or will do.

**Why it seems good**: Direct user feedback feels authentic. Survey data is cheap to collect. Users know what they want.

**Why it fails**: People lie. Not maliciously—they predict their future behavior poorly. What people say they'll do and what they actually do diverge dramatically. Survey respondents aren't representative.

**What to do instead**: Trust behavioral data over stated preferences. Use surveys to understand "why," not to predict "what." Validate survey findings with behavioral data. Be skeptical of stated intent.

---

## 10. Tool Shopping

**What it looks like**: Constantly evaluating and switching analytics tools. Believing the right tool will solve analytics problems. Spending more time on tool setup than on actual analysis.

**Why it seems good**: Better tools should mean better analytics. The current tool is clearly limiting us. New tools have exciting features.

**Why it fails**: Tools don't solve process problems. Migrations lose historical data and create gaps. Teams spend time learning new tools instead of doing analysis. The best analytics come from analysts, not tools.

**What to do instead**: Master your current tools before switching. Define the specific problem the new tool solves. Calculate the true cost of migration. Focus on process and people first, tools second.

---

## 11. Attribution Model Obsession

**What it looks like**: Endless debates about attribution models. Complex multi-touch attribution setups. Trying to give precise credit to every marketing touchpoint.

**Why it seems good**: Better attribution = better marketing spend. Multi-touch feels more accurate than last-click. You need to know what's working.

**Why it fails**: Perfect attribution is impossible. Attribution models are all wrong—some are just useful. The complexity creates false precision. You'll never resolve the debates. Meanwhile, incrementality tests would give you actual answers.

**What to do instead**: Accept that attribution is imprecise. Use simpler models consistently rather than complex models poorly. Run incrementality tests for important channels. Focus on directional correctness, not precision.

---

## 12. Vanity Report Automation

**What it looks like**: Automated reports sent to executives showing metrics that always look good. Carefully curated metrics that can only go up. Reports designed to impress rather than inform.

**Why it seems good**: Executives are happy. Reports are professional and polished. The analytics team looks competent.

**Why it fails**: Nobody learns anything. Bad news gets hidden until it's a crisis. Trust erodes when reality diverges from reports. The analytics team becomes a marketing function instead of a truth-telling function.

**What to do instead**: Report metrics that can go down. Include context and caveats. Surface problems early. Make reports useful for decisions, not just comfortable to read. Build trust through honesty, not through positive numbers.
