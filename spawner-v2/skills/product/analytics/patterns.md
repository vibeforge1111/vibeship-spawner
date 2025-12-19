# Patterns: Analytics

Proven approaches for data that drives decisions.

---

## Pattern 1: The Event Tracking Framework

**Context:** Creating a consistent, scalable approach to event tracking.

**The Pattern:**
```
PURPOSE:
Consistent event naming.
Rich but structured properties.
Scalable across product.

EVENT NAMING CONVENTION:
[Object]_[Action]

Objects: user, product, order, content
Actions: created, viewed, clicked, completed

Examples:
user_signed_up
product_viewed
order_completed
content_shared

EVENT STRUCTURE:
{
  "event": "order_completed",
  "timestamp": "2024-01-15T10:30:00Z",
  "userId": "user_abc123",
  "properties": {
    "orderId": "order_xyz",
    "orderValue": 99.99,
    "currency": "USD",
    "itemCount": 3,
    "paymentMethod": "card"
  },
  "context": {
    "page": "/checkout",
    "sessionId": "session_123",
    "source": "web"
  }
}

TRACKING PLAN:
| Event | Trigger | Properties | Owner |
|-------|---------|------------|-------|
| user_signed_up | Signup complete | method, source | Growth |
| product_viewed | Product page | productId, price | Product |
| order_completed | Checkout done | value, items | Revenue |

IMPLEMENTATION:
// Track function with validation
function track(event, properties) {
  // Validate against schema
  if (!validateEvent(event, properties)) {
    console.error(`Invalid event: ${event}`)
    return
  }

  // Add context
  const fullEvent = {
    event,
    timestamp: new Date().toISOString(),
    userId: getCurrentUserId(),
    properties,
    context: getContext()
  }

  // Send to analytics
  analytics.track(fullEvent)
}

// Usage
track('order_completed', {
  orderId: order.id,
  orderValue: order.total,
  itemCount: order.items.length
})

GOVERNANCE:
- Tracking plan in shared doc
- Changes require review
- Regular audits
- Deprecation process
```

---

## Pattern 2: The Metrics Hierarchy

**Context:** Organizing metrics from company level to feature level.

**The Pattern:**
```
PURPOSE:
Clear metric ownership.
Metrics ladder to goals.
Avoid metric conflicts.

HIERARCHY LEVELS:

LEVEL 1: COMPANY METRICS
CEO/Board level
Examples:
- Annual Recurring Revenue (ARR)
- Monthly Active Users (MAU)
- Net Promoter Score (NPS)

Review: Monthly/Quarterly

LEVEL 2: NORTH STAR METRIC
Company-wide focus
Example: Weekly Active Subscribers

Criteria:
- Reflects value delivered
- Leading indicator of success
- Teams can influence

LEVEL 3: TEAM METRICS
Functional team KPIs
Examples:
- Growth: Signups, activation rate
- Product: Feature adoption, engagement
- Support: Response time, satisfaction

Review: Weekly

LEVEL 4: FEATURE METRICS
Specific feature success
Examples:
- Search: Query success rate
- Checkout: Conversion rate
- Onboarding: Completion rate

Review: Daily/Weekly

METRICS LADDER:
Feature: Onboarding completion ↑
↓
Team: Activation rate ↑
↓
North Star: Weekly active subscribers ↑
↓
Company: ARR ↑

DEFINITION TEMPLATE:
Metric: Activation Rate
Definition: % of signups completing core action in 7 days
Formula: (Users with core action D1-D7) / (Signups) × 100
Owner: Product Team
Target: 40%
Review: Weekly

GUARDRAILS:
Each metric has guardrails:
"Increase activation rate
WITHOUT decreasing quality score"

Primary: What we're optimizing
Guardrail: What we won't sacrifice
```

---

## Pattern 3: The Funnel Analysis

**Context:** Understanding where users drop off in key flows.

**The Pattern:**
```
PURPOSE:
Identify drop-off points.
Prioritize optimizations.
Measure improvement.

FUNNEL DESIGN:

1. DEFINE STAGES
   Based on user intent, not clicks:
   - Awareness: Visited any page
   - Interest: Viewed key content
   - Intent: Started action
   - Conversion: Completed action

2. SET BOUNDARIES
   Time window: Within same session? 7 days?
   Order: Strict sequence or any order?
   Counting: Unique users or events?

3. MEASURE
   Stage | Users | Conversion | Drop-off
   Visit | 10000 | - | -
   Signup | 2000 | 20% | 80%
   Onboard | 1000 | 50% | 50%
   Activate | 400 | 40% | 60%
   Purchase | 100 | 25% | 75%

   Overall: 1% (100/10000)

ANALYSIS APPROACH:
1. Find biggest drop-off
   Signup → Onboard: 50% drop
   This is the bottleneck.

2. Segment the drop-off
   Mobile: 70% drop
   Desktop: 30% drop
   Mobile is the problem.

3. Investigate
   Session recordings
   User interviews
   Heatmaps

4. Hypothesize
   "Mobile signup form too long"

5. Test
   A/B test shorter form
   Measure impact

FUNNEL VARIATIONS:
By source:
- Organic funnel
- Paid funnel
- Referral funnel

By cohort:
- New user funnel
- Returning user funnel

By segment:
- Enterprise funnel
- SMB funnel

FUNNEL MONITORING:
// Alert on significant changes
if (conversionRate < baseline * 0.8) {
  alert("Funnel conversion dropped 20%")
}

VISUALIZATION:
Use: Funnel charts (Amplitude, Mixpanel)
Show: Stage-by-stage conversion
Compare: Periods, segments
```

---

## Pattern 4: The Cohort Analysis

**Context:** Understanding how user behavior changes over time.

**The Pattern:**
```
PURPOSE:
Track user groups over time.
Compare cohort performance.
Identify improvements.

COHORT TYPES:

ACQUISITION COHORT:
Group by: When they signed up
Track: Behavior over time
Example: January 2024 signup cohort

BEHAVIORAL COHORT:
Group by: What they did
Track: Subsequent behavior
Example: Users who used feature X

REVENUE COHORT:
Group by: First purchase
Track: Lifetime value

RETENTION TABLE:
          Week 1  Week 2  Week 3  Week 4
Jan 1-7   100%    45%     35%     30%
Jan 8-14  100%    50%     40%     32%
Jan 15-21 100%    55%     45%     38%

Reading: Jan cohort retained 30% by week 4

ANALYSIS:
1. Compare cohorts
   "Feb cohort retains 10% better than Jan"
   What changed? Investigate.

2. Find retention curves
   Where do users drop off?
   Day 1? Day 7? Day 30?

3. Identify improvements
   New feature → Better retention?
   Onboarding change → Faster activation?

IMPLEMENTATION:
// Assign cohort on signup
user.cohort = {
  acquisition: '2024-W03',  // Week of signup
  source: 'organic',
  plan: 'free'
}

// Track retention
function checkRetention(cohort, week) {
  const retained = activeUsers.filter(u =>
    u.cohort.acquisition === cohort &&
    u.lastActive >= cohortStart.add(week, 'weeks')
  )
  return retained.length / cohortSize
}

COHORT METRICS:
- Retention (% still active)
- Resurrection (% returned after inactive)
- LTV (cumulative revenue)
- Feature adoption (% using feature)

REPORTING:
Weekly: Retention table update
Monthly: Cohort comparison
Quarterly: LTV analysis
```

---

## Pattern 5: The North Star Framework

**Context:** Aligning the organization around one key metric.

**The Pattern:**
```
PURPOSE:
Single focus for company.
Clear success measure.
Alignment across teams.

NORTH STAR CRITERIA:
1. Reflects customer value
2. Leading indicator of revenue
3. Actionable by teams
4. Measurable consistently

GOOD NORTH STARS:
Spotify: Time spent listening
Facebook: Daily active users
Airbnb: Nights booked
Slack: Weekly active teams
HubSpot: Weekly active teams using 5+ features

BAD NORTH STARS:
- Revenue (lagging, not value)
- Signups (quantity, not value)
- NPS (survey, not behavior)

FRAMEWORK:

NORTH STAR:
Weekly Active Subscribers

INPUT METRICS (what drives North Star):
Breadth: New subscribers
Depth: Engagement frequency
Quality: Feature adoption
Efficiency: Time to value

TEAM OWNERSHIP:
Growth → Breadth metrics
Product → Depth, Quality metrics
Onboarding → Efficiency metrics

VISUALIZATION:
                    [North Star]
                         |
    +---------+---------+---------+
    |         |         |         |
[Breadth] [Depth] [Quality] [Efficiency]
    |         |         |         |
   Growth   Product  Product  Onboarding

CADENCE:
Daily: Input metrics
Weekly: North Star movement
Monthly: Deep dive
Quarterly: Strategy review

NORTH STAR REVIEW:
"North Star is up 15%"
Input analysis:
- Breadth: Up 20% (strong acquisition)
- Depth: Flat (engagement stagnant)
- Quality: Down 5% (concern)
Focus: Improve quality and depth
```

---

## Pattern 6: The Diagnostic Dashboard

**Context:** Building dashboards that enable action.

**The Pattern:**
```
PURPOSE:
Answer key questions.
Enable quick diagnosis.
Drive action.

DASHBOARD STRUCTURE:

SECTION 1: HEALTH CHECK
"Is everything okay?"
- Key metrics vs targets
- Red/yellow/green indicators
- Trends vs last period

SECTION 2: PERFORMANCE
"How are we doing?"
- Primary KPIs
- Secondary metrics
- Leading indicators

SECTION 3: DIAGNOSTICS
"Why is it this way?"
- Breakdown by dimension
- Comparison to benchmark
- Anomaly highlights

SECTION 4: ACTION ITEMS
"What should we do?"
- Top opportunities
- Problems to investigate
- Recent changes

DESIGN PRINCIPLES:

ANSWER ONE QUESTION:
"Which channels drive quality signups?"
Every chart answers this question.

TOP-DOWN LAYOUT:
Summary at top.
Details below.
Drilldown on click.

5-SECOND TEST:
User should understand state in 5 seconds.
Green = good, Red = bad.
Clear at a glance.

EXAMPLE DASHBOARD:
┌─────────────────────────────────────┐
│ SIGNUP HEALTH          Today: 🟢   │
│ Target: 100  Actual: 127  +27%     │
├─────────────────────────────────────┤
│ BY CHANNEL                          │
│ Organic: 45 (35%) 🟢 Above target   │
│ Paid: 52 (41%) 🟢 Above target      │
│ Referral: 30 (24%) 🟡 Flat         │
├─────────────────────────────────────┤
│ QUALITY CHECK                       │
│ Activation Rate: 42% 🟢             │
│ Day 7 Retention: 35% 🟢             │
├─────────────────────────────────────┤
│ ACTION ITEMS                        │
│ 🔍 Referral signups flat - investigate
│ 📈 Paid performing well - increase? │
└─────────────────────────────────────┘

MAINTENANCE:
- Monthly review with users
- Remove unused charts
- Update targets quarterly
- Validate data quality
```

---

## Pattern 7: The Tracking Plan

**Context:** Documenting what to track and how.

**The Pattern:**
```
PURPOSE:
Single source of truth.
Consistent implementation.
Governance and quality.

TRACKING PLAN COMPONENTS:

EVENTS:
| Event | Description | Trigger | Properties |
|-------|-------------|---------|------------|
| page_viewed | User views page | Page load | page_name, referrer |
| button_clicked | User clicks CTA | Click | button_name, location |
| signup_completed | User signs up | Form submit | method, source |

PROPERTIES:
| Property | Type | Required | Description |
|----------|------|----------|-------------|
| page_name | string | yes | URL path |
| button_name | string | yes | Button identifier |
| source | string | no | Attribution source |

USER PROPERTIES:
| Property | Type | Set When | Description |
|----------|------|----------|-------------|
| plan | string | Signup, upgrade | Current plan |
| signup_date | date | Signup | First registration |
| total_orders | int | Order complete | Cumulative orders |

OWNERSHIP:
| Event Category | Owner | Approver |
|----------------|-------|----------|
| User events | Product | Data lead |
| Revenue events | Revenue | Finance |
| Marketing events | Marketing | Marketing lead |

CHANGE PROCESS:
1. Request: Fill out proposal
2. Review: Data team reviews
3. Approve: Owner signs off
4. Implement: Dev adds tracking
5. Verify: QA confirms
6. Document: Update plan

TEMPLATE:

## Event: signup_completed

**Description:** Fires when user completes signup

**Trigger:** Form submission success

**Properties:**
- signup_method (string, required): "email", "google", "github"
- source (string, optional): Attribution source
- referral_code (string, optional): If referred

**Example:**
```json
{
  "event": "signup_completed",
  "properties": {
    "signup_method": "email",
    "source": "organic"
  }
}
```

**Owner:** Growth team
**Added:** 2024-01-15
**Last updated:** 2024-01-15
```

---

## Pattern 8: The Retention Framework

**Context:** Measuring and improving user retention.

**The Pattern:**
```
PURPOSE:
Understand retention patterns.
Identify churn drivers.
Improve long-term engagement.

RETENTION TYPES:

DAY N RETENTION:
% of users active on exactly day N
D1: Day after signup
D7: Week after signup
D30: Month after signup

ROLLING RETENTION:
% of users active on or after day N
D7+: Active day 7 or later
More forgiving than Day N

BRACKET RETENTION:
% active within a range
Week 1: Active days 1-7
Week 2: Active days 8-14

RETENTION CURVE:
Day 1:  100% ████████████████████
Day 2:  60%  ████████████
Day 7:  40%  ████████
Day 14: 30%  ██████
Day 30: 25%  █████
Day 90: 20%  ████

SHAPE ANALYSIS:
Cliff: Steep drop early
- Problem: Poor first experience

Slow bleed: Gradual decline
- Problem: Not enough value

Flat: Stabilizes
- Good: Found core users

IMPROVEMENT LEVERS:

ONBOARDING:
- Faster time to value
- Better first experience
- Clear next steps

ENGAGEMENT:
- Notifications (helpful, not annoying)
- Email sequences
- Feature discovery

HABIT FORMATION:
- Daily use cases
- Triggers and rewards
- Social features

RE-ENGAGEMENT:
- Win-back campaigns
- "We miss you" emails
- New feature announcements

RETENTION METRICS:
// Core retention
D1, D7, D30 retention

// Engagement
Sessions per week
Actions per session

// Churn prediction
Days since last active
Engagement score
```

---

## Pattern 9: The Data Quality Framework

**Context:** Ensuring analytics data is trustworthy.

**The Pattern:**
```
PURPOSE:
Trust in data.
Reliable decisions.
Catch issues early.

QUALITY DIMENSIONS:

COMPLETENESS:
All expected data present?
No missing events?
All properties filled?

Check: Event volume vs expected
Alert: If volume drops >20%

ACCURACY:
Data reflects reality?
Values make sense?
No corruption?

Check: Validate against source
Alert: If impossible values

TIMELINESS:
Data arrives when expected?
Freshness acceptable?
No delays?

Check: Timestamp vs received
Alert: If delay > threshold

CONSISTENCY:
Same definitions used?
No conflicts between sources?
Historical data stable?

Check: Compare sources
Alert: If discrepancy found

MONITORING:
// Daily checks
checks = {
  volume: compareToBaseline(events),
  nulls: countNullProperties(events),
  types: validateTypes(events),
  freshness: checkTimestamps(events)
}

// Alert on failures
if (checks.volume.change > 0.2) {
  alert('Event volume changed significantly')
}

VALIDATION RULES:
// Schema validation
eventSchema = {
  user_signed_up: {
    properties: {
      method: { type: 'string', enum: ['email', 'google'] },
      source: { type: 'string', optional: true }
    }
  }
}

// Runtime validation
function validateEvent(event, properties) {
  const schema = eventSchema[event]
  return validate(properties, schema)
}

DATA QUALITY DASHBOARD:
┌─────────────────────────────────────┐
│ DATA QUALITY SCORE: 94%       🟢   │
├─────────────────────────────────────┤
│ Completeness: 98% 🟢               │
│ Accuracy: 95% 🟢                   │
│ Timeliness: 92% 🟡                 │
│ Consistency: 89% 🟡                │
├─────────────────────────────────────┤
│ ISSUES:                            │
│ ⚠ signup_completed null rate: 3%   │
│ ⚠ order_completed delay: 5min avg  │
└─────────────────────────────────────┘
```

---

## Pattern 10: The Experimentation Framework

**Context:** Structured approach to learning from data.

**The Pattern:**
```
PURPOSE:
Learn from data systematically.
Avoid false conclusions.
Build knowledge over time.

EXPERIMENTATION LOOP:

1. OBSERVE
   What does data show?
   What's unexpected?
   What questions arise?

2. HYPOTHESIZE
   "We believe [change] will [impact]
   because [reason]"

3. PREDICT
   If hypothesis true:
   - Metric X will change by Y%
   - We'll see Z behavior

4. TEST
   A/B test or analysis
   Control vs treatment
   Statistical rigor

5. LEARN
   Hypothesis confirmed or rejected?
   What did we learn?
   What's next?

6. DOCUMENT
   Record findings
   Update knowledge base
   Share with team

HYPOTHESIS TEMPLATE:
We believe that [adding onboarding tooltips]
will [increase activation rate by 20%]
because [users don't discover key features].

We will know this is true when
[D7 activation rate increases 20%]
and [feature discovery events increase 50%].

EXPERIMENT TRACKING:
| ID | Hypothesis | Metric | Status | Result |
|----|------------|--------|--------|--------|
| E1 | Tooltips → activation | D7 activation | Complete | +15% 🟢 |
| E2 | Shorter form → signups | Signup rate | Running | - |
| E3 | Gamification → retention | D30 retention | Planned | - |

LEARNING LOG:
Date: 2024-01-15
Experiment: Onboarding tooltips
Result: +15% activation (expected +20%)
Learning: Tooltips help, but not enough alone
Next: Add interactive tutorial
Confidence: High (p < 0.01)

KNOWLEDGE BASE:
Build cumulative knowledge:
- What works for our users
- What doesn't work
- Contextual factors
- Counterintuitive findings

Review quarterly.
Share broadly.
```
