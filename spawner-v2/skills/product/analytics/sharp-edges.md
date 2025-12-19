# Sharp Edges: Analytics

Critical mistakes that turn data into noise and insights into confusion.

---

## 1. The Vanity Metric Trap

**Severity:** Critical
**Situation:** Tracking metrics that look good but don't drive decisions
**Why Dangerous:** Resources wasted, real problems hidden, false confidence.

```
THE TRAP:
Dashboard shows:
- 1M pageviews this month! ↑
- 500K registered users! ↑
- 100K app downloads! ↑

Everyone celebrates.

Reality:
- Active users: 5K (0.5%)
- Retention Day 7: 3%
- Revenue: Declining
- Core action: 2% do it

THE REALITY:
Vanity metrics make you feel good.
They don't tell you if you're winning.
They hide real problems.
They don't change behavior.

VANITY VS ACTIONABLE:
Vanity: Total registered users
Actionable: Weekly active users

Vanity: Total pageviews
Actionable: Pages per session, time on page

Vanity: App downloads
Actionable: Day 7 retention

Vanity: Total revenue
Actionable: Revenue per user, LTV/CAC

THE FIX:
1. Ask "So what?"
   "Pageviews are up 50%"
   "So what? Did that increase conversions?"
   "Did that increase revenue?"

2. Focus on actionable metrics
   What can you change based on this number?
   What decision does it inform?
   What behavior does it measure?

3. Measure outcomes, not outputs
   Output: Emails sent
   Outcome: Email conversions

   Output: Features shipped
   Outcome: Feature adoption

4. Pair metrics with context
   "10K signups" → but what's conversion to paid?
   "50% growth" → from what base?

METRICS TEST:
"If this metric changed, what would we do differently?"
No answer = vanity metric.
```

---

## 2. The Data Without Decision

**Severity:** High
**Situation:** Collecting data with no plan to use it
**Why Dangerous:** Storage costs, complexity, privacy risk, decision paralysis.

```
THE TRAP:
"Let's track everything! We might need it."

Event catalog:
- button_clicked (every button)
- page_viewed (every page)
- mouse_moved (why???)
- scroll_position (constantly)
- everything_ever (forever)

Six months later:
- 500GB of event data
- No one uses it
- No dashboards reference it
- Analysis paralysis

"We have all this data but no insights!"

THE REALITY:
Data has costs.
Storage, processing, compliance.
More data ≠ more insight.
Unused data is technical debt.

THE FIX:
1. Define questions first
   "What are we trying to learn?"
   "What decision will this inform?"
   "Who will act on this data?"

2. Start with decisions
   Decision: Should we invest in onboarding?
   Metric needed: Onboarding completion rate
   Events needed: step_started, step_completed

3. Use the 90-day rule
   If metric not viewed in 90 days, deprecate.
   If event not used in 90 days, stop tracking.

4. Document metric owners
   Every metric has an owner.
   Owner reviews quarterly.
   No owner = probably don't need it.

TRACKING TEMPLATE:
Event: signup_completed
Question: How many users complete signup?
Decision: Is signup flow optimized?
Owner: Product team
Review: Quarterly

DATA HYGIENE:
- Quarterly event audit
- Archive unused data
- Delete when appropriate
- Document retention policies
```

---

## 3. The Broken Funnel Definition

**Severity:** High
**Situation:** Funnel stages that don't match user journey
**Why Dangerous:** Misleading conversion rates, wrong optimizations.

```
THE TRAP:
Defined funnel:
Visit → Sign Up → Subscribe → Purchase

Measured conversion: 0.5%

Team: "Let's optimize signup!"
*Huge effort on signup flow*
No improvement in purchases.

Reality: Users visit → leave → come back →
research → visit pricing → leave →
come back → sign up → use free tier →
eventually purchase.

The defined funnel isn't how users actually behave.

THE REALITY:
User journeys are messy.
Linear funnels are simplifications.
Wrong funnel = wrong optimization.

FUNNEL PROBLEMS:
1. Stages don't match reality
   Defined: Linear path
   Actual: Non-linear, multiple visits

2. Too many stages
   Conversion looks terrible at each stage.
   But overall conversion is fine.

3. Too few stages
   "Visit → Purchase" shows 0.5%
   Where's the drop-off?

4. Wrong order
   Users do things in different orders.
   Forcing linear misses patterns.

THE FIX:
1. Map actual user journeys
   Session recordings
   Path analysis
   User interviews

2. Define stages by intent
   Awareness: Visited any page
   Interest: Viewed pricing
   Evaluation: Started trial
   Purchase: Converted

3. Allow for messiness
   "Completed signup in first 3 sessions"
   Not "signup immediately after first visit"

4. Multiple funnels
   New user funnel
   Return user funnel
   Mobile vs desktop funnel

5. Validate with real users
   "Does this match how you actually use the product?"

FUNNEL DESIGN:
Start from outcome, work backwards.
Purchase ← What happened before?
         ← Trial started ← Pricing viewed
         ← Feature explored ← Content read
```

---

## 4. The Improper Attribution

**Severity:** High
**Situation:** Giving credit to wrong touchpoints
**Why Dangerous:** Money wasted on wrong channels, wrong optimizations.

```
THE TRAP:
User journey:
1. Sees Facebook ad
2. Googles your brand
3. Clicks Google ad
4. Signs up

Attribution: "Google Ads gets 100% credit!"
Decision: "Kill Facebook, double Google!"

Result:
Facebook killed.
New users drop 50%.
Google wasn't creating demand, just capturing it.

THE REALITY:
Users have many touchpoints.
Last click doesn't tell the story.
First click doesn't either.
Attribution is hard.

ATTRIBUTION MODELS:
Last Click: Last touchpoint gets credit
First Click: First touchpoint gets credit
Linear: Equal credit to all
Time Decay: Recent gets more credit
Position Based: First/last get 40%, rest 20%
Data Driven: ML-based distribution

EACH HAS PROBLEMS:
Last Click: Ignores awareness building
First Click: Ignores conversion drivers
Linear: Oversimplifies
Time Decay: Arbitrary decay
Position Based: Arbitrary split
Data Driven: Black box

THE FIX:
1. Use multiple models
   Compare insights across models.
   If all agree, high confidence.
   If disagree, investigate.

2. Incrementality testing
   Hold out groups from channel.
   Measure true lift.
   Not attribution, causation.

3. Understand the journey
   Early stage: Awareness (Facebook, content)
   Mid stage: Consideration (retargeting, email)
   Late stage: Conversion (search, direct)

4. Don't over-optimize
   Some spend on "inefficient" channels
   may drive all other channels.

5. Attribution windows
   How long from touchpoint to conversion?
   7-day vs 30-day can differ hugely.

INCREMENTALITY > ATTRIBUTION:
"If we stop spending on X, what happens?"
Run the test.
Don't guess from models.
```

---

## 5. The Sampling Confusion

**Severity:** High
**Situation:** Drawing conclusions from sampled data without understanding implications
**Why Dangerous:** Wrong conclusions, especially for small segments.

```
THE TRAP:
Report shows:
"Mobile users convert at 15%"
"Desktop users convert at 8%"

Decision: "Focus everything on mobile!"

Reality:
Data was 10% sampled.
Mobile users: 50 (5 converted = ~15%)
Desktop users: 5000 (400 converted = ~8%)

Mobile sample too small.
Actual mobile rate: unknown.

THE REALITY:
Sampled data loses precision.
Small segments become noise.
Statistical significance matters.

SAMPLING ISSUES:
1. Small segments become invisible
   1% of 10% sample = 0.1%
   Statistically meaningless.

2. Variance increases
   True rate: 10%
   Sampled: Could be 5% or 20%

3. Time-based sampling fails for rare events
   "Purchases this hour"
   Sampling misses rare events.

THE FIX:
1. Know your sample rate
   GA4: Often 10-20% sampled at scale
   Check sampling indicator.

2. Understand confidence intervals
   "15% conversion" means nothing.
   "15% ± 8%" means a lot.

3. Use unsampled for critical decisions
   Export to BigQuery (unsampled)
   Pay for higher quotas
   Use warehouse directly

4. Segment carefully
   Is segment large enough?
   At 10% sampling, need 10x users.

5. Time windows
   Longer windows = more data
   More data = better precision

SAMPLING MATH:
Sample rate: 10%
Segment size: 100 users
Sampled: 10 users
Conversion: 1 out of 10 = 10%

But: 1 out of 10 could easily be 0 or 2
Range: 0% to 20%
Not useful for decisions.
```

---

## 6. The Survivor Bias

**Severity:** High
**Situation:** Only analyzing users who stayed, ignoring those who left
**Why Dangerous:** Miss reasons for churn, overestimate satisfaction.

```
THE TRAP:
Survey results:
"95% of users are satisfied!"
"Average session length: 45 minutes!"
"NPS: +60!"

Reality:
Surveyed: Active users (survivors)
Ignored: 80% who churned

Churned users:
"Couldn't figure out the product"
"Too expensive"
"Missing key feature"

THE REALITY:
Survivors aren't representative.
Churned users have the answers.
Happy users are already won.

SURVIVOR BIAS EXAMPLES:
1. Feature usage
   "80% of users use feature X"
   But: 80% of remaining users
   Feature X caused others to leave.

2. Satisfaction surveys
   High satisfaction!
   ...among users who stayed.

3. Session length
   Long sessions!
   ...for engaged users.
   Others bounced.

4. NPS scores
   Great NPS!
   ...from users who love it.
   Haters already left.

THE FIX:
1. Track churned users
   Exit surveys
   Churn analysis
   Win-back campaigns (with learning)

2. Include all users in analysis
   Not: "Active users spend X"
   But: "Of users who signed up, X% became active"

3. Cohort analysis
   Track cohorts over time.
   See who drops and when.

4. Segment by behavior
   Power users
   Casual users
   Churned users
   Compare segments.

5. Proactive churn research
   Interview users at risk.
   Don't wait until they're gone.

CHURN ANALYSIS:
Day 1: 1000 users sign up
Day 7: 300 still active (30% retention)
Day 30: 100 still active (10% retention)

Where did 700 go between Day 1-7?
Why?
This matters more than active user behavior.
```

---

## 7. The Metric Conflict

**Severity:** High
**Situation:** Teams optimize conflicting metrics
**Why Dangerous:** Suboptimal outcomes, internal conflict, gaming.

```
THE TRAP:
Growth team: Maximize signups
Product team: Maximize engagement
Finance team: Maximize revenue

Growth: Adds friction-free signup
Product: Adds onboarding requirements
Finance: Adds upsells everywhere

Result:
- Tons of low-quality signups
- Users confused by onboarding
- Annoyed by upsells
- Everyone hits their metric
- Business struggles

THE REALITY:
Metrics drive behavior.
Conflicting metrics drive conflicting behavior.
Local optimization ≠ global optimization.

METRIC CONFLICTS:
1. Quantity vs quality
   Signups vs engaged signups
   Content volume vs content quality

2. Short-term vs long-term
   Revenue now vs LTV
   Clicks vs satisfaction

3. Team vs company
   Team metric vs company outcome
   Department KPI vs business goal

THE FIX:
1. North Star Metric
   One metric everyone aligns to.
   All team metrics ladder up.

   North Star: Weekly active paid users
   Growth: Quality signups that convert
   Product: Engagement that leads to payment
   Finance: Revenue from retained users

2. Input vs output metrics
   Output: Revenue (shared)
   Inputs: Each team's contribution

3. Guardrail metrics
   "Maximize X without hurting Y"
   Growth: Signups, guardrail: Day 7 retention
   Marketing: Leads, guardrail: Lead quality

4. Regular alignment
   Cross-team metric review
   Catch conflicts early
   Adjust together

5. Shared outcomes
   Bonus tied to company metric
   Not just team metric

METRIC HIERARCHY:
Company: Revenue + growth
↓
North Star: Weekly paying users
↓
Team metrics (laddering up)
```

---

## 8. The Average Illusion

**Severity:** High
**Situation:** Relying on averages that hide distribution
**Why Dangerous:** Miss segments, wrong optimizations, false confidence.

```
THE TRAP:
Report shows:
"Average session length: 5 minutes"
"Average revenue per user: $50"
"Average page load: 2 seconds"

Decisions made based on "average user."

Reality:
Session length:
- 70% of users: 30 seconds
- 20% of users: 5 minutes
- 10% of users: 45 minutes
Average: 5 minutes (meaningless)

Revenue:
- 90% of users: $0
- 9% of users: $50
- 1% of users: $4500
Average: $50 (misleading)

THE REALITY:
Averages hide bimodal distributions.
Averages hide outliers.
No user is "average."

AVERAGE PROBLEMS:
1. Bimodal distributions
   Users either love it or leave.
   No one is "medium engaged."

2. Power law distributions
   Few users drive most revenue.
   Average doesn't represent anyone.

3. Outlier influence
   One whale skews entire average.
   Median might be $0.

THE FIX:
1. Use distributions
   Show histograms, not averages.
   Understand the shape.

2. Use percentiles
   p50: Median
   p90: Most users
   p99: Worst case

   "p50 load time: 1s, p95: 5s"
   Better than "average: 2s"

3. Segment users
   Don't average across segments.
   Power users: 45 min sessions
   Casual: 2 min sessions
   Churned: 30 sec sessions

4. Use appropriate central tendency
   Normal distribution: Mean okay
   Skewed: Use median
   Power law: Don't summarize

5. Ask "who does this represent?"
   "Average revenue is $50"
   "Who actually pays $50?"
   Nobody? Then useless metric.

BETTER METRICS:
Instead of: Average session length
Use: Session length distribution by user type

Instead of: Average revenue
Use: Revenue by cohort/segment

Instead of: Average load time
Use: p50, p75, p90, p99 load times
```

---

## 9. The Recency Bias

**Severity:** Medium
**Situation:** Overweighting recent data, ignoring historical patterns
**Why Dangerous:** React to noise, miss trends, seasonal blindness.

```
THE TRAP:
Monday report:
"Traffic down 20% week-over-week!"
Emergency meeting called.
New initiatives launched.

Tuesday:
Traffic recovers.
Was normal weekend dip.
Initiatives wasted.

Or:

December report:
"Revenue up 100%!"
Massive celebration.
Forecasts adjusted.

January:
Revenue crashes.
Was holiday seasonality.
Forecasts embarrassingly wrong.

THE REALITY:
Recent data is noisy.
Short-term changes are often random.
Trends need time to confirm.

RECENCY PROBLEMS:
1. Weekly fluctuations
   Weekend dips
   Monday spikes
   Natural variation

2. Seasonal patterns
   Holiday bumps
   Summer slumps
   Annual cycles

3. Random noise
   Statistical variation
   Sampling effects
   External events

THE FIX:
1. Compare same periods
   Week-over-week (WoW): Same day last week
   Year-over-year (YoY): Same period last year
   Not: Yesterday vs two days ago

2. Use rolling averages
   7-day rolling average
   28-day rolling average
   Smooths out noise

3. Document seasonality
   "December is always +100%"
   "Sundays are always -30%"
   Expected, not news.

4. Statistical significance
   Is this change real or noise?
   How confident are we?

5. Longer time windows
   Don't react to one day.
   Look at weekly trends.
   Confirm with monthly patterns.

COMPARISON FRAMEWORK:
Today vs yesterday: Noise
This week vs last week: Getting better
This month vs last month: Trend emerging
This quarter vs same quarter last year: Confirmed
```

---

## 10. The Implementation Drift

**Severity:** High
**Situation:** Tracking code breaks or changes without notice
**Why Dangerous:** Decisions based on broken data.

```
THE TRAP:
Q1: Tracking works great
Q2: Dev refactors checkout, breaks tracking
Q3: "Checkout conversion dropped 50%!"
    Emergency meeting
    New checkout team formed
Q4: Someone notices tracking broke
    Q3 data useless
    Team disbanded
    Time wasted

THE REALITY:
Tracking code is code.
Code breaks.
Nobody monitors analytics code.
Decisions made on broken data.

DRIFT CAUSES:
1. Code refactoring
   Button renamed, event not updated
   Page restructured, tracking missed

2. New features
   New flow added, not tracked
   A/B test variant not tracked

3. Third-party changes
   SDK updated, breaks tracking
   Tag manager changes

4. Silent failures
   Event stops firing
   No errors thrown
   Nobody notices

THE FIX:
1. Tracking as code
   Track in code review.
   Test tracking.
   Include in QA.

2. Monitoring
   Alert if event volume drops
   Alert if key events missing
   Daily data quality checks

   // Example alert
   if (signups.today < signups.7dayAvg * 0.5) {
     alert("Signup tracking may be broken")
   }

3. Data contracts
   Define expected events.
   Validate against contract.
   Fail loudly on violations.

4. Tracking tests
   E2E tests include analytics.
   "When user clicks X, event Y fires"

5. Regular audits
   Quarterly tracking review.
   Walk through key flows.
   Verify events fire.

MONITORING CHECKLIST:
□ Volume monitoring (sudden drops)
□ Property validation (expected values)
□ Coverage checks (all flows tracked)
□ Freshness checks (data arriving)
□ Automated alerts on anomalies
```

---

## 11. The Dashboard Graveyard

**Severity:** Medium
**Situation:** Building dashboards nobody uses
**Why Dangerous:** Time wasted, data distrust, missed insights.

```
THE TRAP:
Year 1: Build 50 dashboards
Year 2: Build 30 more
Year 3: "Let me build a dashboard for this!"

Reality:
- 5 dashboards used regularly
- 20 checked occasionally
- 55 never opened

Cost:
- Maintenance overhead
- Query costs
- Confusion
- "Which dashboard is right?"

THE REALITY:
Dashboards are products.
Products need users.
Most dashboards fail.

GRAVEYARD CAUSES:
1. No defined user
   "Someone might need this"
   Nobody does.

2. Wrong questions
   Answers questions nobody asked.
   Doesn't answer questions people have.

3. Too complex
   50 charts per dashboard.
   Users don't know where to look.

4. Stale data
   Data stops updating.
   Users stop trusting.

5. No action path
   "Numbers went down"
   "Now what?"
   Nothing.

THE FIX:
1. Define user and question
   "Marketing team wants to know:
   Which channels drive signups?"
   Build for that.

2. Start simple
   3-5 metrics per dashboard.
   One key question answered.
   Add more only when needed.

3. Review and retire
   Quarterly: Check dashboard usage.
   Not viewed in 90 days? Archive.

4. Maintain actively
   Dashboards need owners.
   Owners review monthly.
   Update or deprecate.

5. Dashboards as products
   Who's the user?
   What's the use case?
   How often will they use it?
   What action will they take?

DASHBOARD TEMPLATE:
Name: Channel Performance
User: Marketing team
Question: Which channels drive quality signups?
Frequency: Daily check
Action: Budget allocation decisions
```

---

## 12. The Privacy Oversight

**Severity:** Critical
**Situation:** Tracking personal data without proper consent or protection
**Why Dangerous:** Legal liability, user trust damage, data breaches.

```
THE TRAP:
"Let's track everything about the user!"
- Email in events
- IP addresses stored
- Location tracked
- Behavior profiled
- Cross-site tracking
- No consent asked

Two years later:
- GDPR audit happens
- $50M in fines
- Data breach exposes everything
- Users flee
- Trust destroyed

THE REALITY:
Analytics must respect privacy.
Laws require consent.
Data minimization is required.
Breaches of analytics = breaches of trust.

PRIVACY PROBLEMS:
1. PII in events
   email, name, phone in event properties

2. No consent
   Tracking before consent given

3. Retention forever
   User requests deletion, data persists

4. Third-party leakage
   GA sends data to Google
   Mixing analytics with ads

THE FIX:
1. Anonymize by default
   // Bad
   track('purchase', { email: user.email })

   // Good
   track('purchase', { userId: hash(user.id) })

2. Consent before tracking
   // Don't track until consent
   if (hasAnalyticsConsent()) {
     initializeTracking()
   }

3. Data minimization
   Only collect what's needed.
   Delete when no longer needed.
   Purpose limitation.

4. Retention policies
   Analytics data: 2 years max
   Able to delete on request
   Regular purging

5. First-party analytics
   Consider: Plausible, Fathom, Posthog
   Privacy-focused alternatives
   User data stays with you

COMPLIANCE CHECKLIST:
□ Consent before tracking
□ No PII in events
□ Retention limits set
□ Deletion capability exists
□ Privacy policy accurate
□ DPA with vendors
□ DSAR process defined
```
