# Anti-Patterns: Product Strategy

These approaches look reasonable but consistently lead to product failure. Avoid them ruthlessly.

---

## 1. The Feature Roadmap

**The Mistake:**
```
Q1 Roadmap:
- User profiles
- Social sharing
- Dark mode
- Export to PDF
- Team workspaces
- Mobile app
```

**Why It's Wrong:**
- No connection to outcomes or strategy
- Features become the goal, not customer value
- Team executes without understanding why
- No prioritization framework
- Success = shipping, not impact
- Invites stakeholder feature requests

**The Fix:**
```
Q1 Roadmap:
Objective: Improve activation rate from 20% → 35%

Key Results:
1. New user completes core action within 24 hours (+15%)
2. Week 1 retention > 40%
3. Time to first value < 5 minutes

Bets we're making:
- Bet 1: Simplified onboarding (hypothesis: confusion is top drop-off cause)
- Bet 2: Personalized first experience (hypothesis: generic feels irrelevant)

What we're NOT doing this quarter:
- Mobile app (retention problem first)
- Export features (nice to have, not activation blocker)
```

---

## 2. The Persona Poster

**The Mistake:**
```
Meet Sarah!
- 32 years old
- Lives in San Francisco
- Marketing Manager at a tech startup
- Loves yoga and craft coffee
- Uses iPhone
- Shops at Whole Foods
- Values work-life balance
```

**Why It's Wrong:**
- Demographics don't predict behavior
- "Marketing Manager" tells you nothing about her problems
- Fabricated attributes feel real but are fiction
- No insight into why she'd buy your product
- Encourages designing for imaginary people
- Different "Sarahs" have wildly different needs

**The Fix:**
```
Struggling Moment Profile:

WHO: Marketing leads at B2B startups (20-100 employees)

WHEN this matters: After closing Series A, when board asks for
"predictable pipeline" and they realize their scrappy approach won't scale.

STRUGGLING MOMENT: "I just got asked for our marketing attribution
model in the board meeting and I had no answer. I look incompetent
but I actually don't know what's working."

CURRENT BEHAVIOR:
- Cobbled together Google Analytics + spreadsheets
- Asks sales "how did this deal find us" in Slack
- Guesses when asked about ROI

EMOTIONAL STATE: Anxious about job security, overwhelmed, imposter syndrome

TRIGGER TO SEARCH: Board meeting question or CFO asking for justification
```

---

## 3. The Consensus Roadmap

**The Mistake:**
"Let's get input from all stakeholders and build a roadmap everyone agrees on."

Process:
- Sales wants CRM integration
- Marketing wants better analytics
- Support wants self-service tools
- CEO wants AI features
- Engineering wants tech debt cleanup

Result: A roadmap that tries to do everything, pleases no one, and lacks strategic coherence.

**Why It's Wrong:**
- Distributes resources across too many initiatives
- Optimizes for internal politics, not customer value
- Nobody is fully committed to anything
- Creates internal competition for resources
- Lacks bold bets that could win the market
- Consensus kills conviction

**The Fix:**
```
Strategy dictates roadmap, not stakeholders.

1. Define strategic objective for the quarter
2. Identify the #1 bet that would achieve it
3. Commit 70% of resources to that bet
4. Allocate 30% to maintenance and small wins
5. Say no to everything else

"We're betting on activation this quarter. That means we're NOT doing
CRM integration, NOT doing AI features, NOT doing mobile. If activation
doesn't improve, we'll revisit. But right now, focus wins."
```

---

## 4. The "Me Too" Feature

**The Mistake:**
```
Competitive Analysis:
- Competitor A has feature X ✓
- Competitor B has feature X ✓
- Competitor C has feature X ✓
- We don't have feature X ✗

Conclusion: We need to build feature X!
```

**Why It's Wrong:**
- You're always behind (they're not stopping)
- Features without strategy = bloat
- You're letting competitors set your agenda
- Same features = compete on price
- Their feature serves their strategy, not yours
- Assumes their customers are your customers

**The Fix:**
```
Competitive Analysis (right way):

Question: Does Feature X serve OUR strategy?

Our strategy: Simplest solution for solo creators
Competitor A's strategy: Enterprise-grade for teams
Their Feature X: Team permission management

Assessment: Feature X is ANTI our strategy. Adding it would:
- Complicate our simple UX
- Attract wrong customers
- Distract from solo creator needs

Decision: Do NOT build Feature X. Instead, double down on
solo creator workflows that competitors ignore.
```

---

## 5. The Solution-First PRD

**The Mistake:**
```
PRD: Team Workspaces Feature

Overview: We're building team workspaces that allow multiple users
to collaborate in real-time on projects.

Requirements:
- Users can create workspaces
- Users can invite team members
- Role-based permissions (Admin, Editor, Viewer)
- Real-time sync
- Activity feed
- @mentions
...
```

**Why It's Wrong:**
- Starts with solution, not problem
- No success criteria
- No discussion of alternatives
- No indication of customer need
- Team will build exactly this (even if it's wrong)
- No learning orientation

**The Fix:**
```
PRD: Enable Team Collaboration

Problem Statement:
Users in teams (2-10 people) report our product is "great for solo
work" but they "outgrow it" when they need to collaborate. We lose
40% of our team leads at month 3 for this reason.

Jobs To Be Done:
"When our team needs to work on a project together, I want to see
what everyone is doing, so we don't duplicate work or step on toes."

Success Metrics:
- Team lead retention at month 3: 60% → 80%
- Teams with 2+ active users: +50%

Riskiest Assumptions:
1. Teams need real-time sync (vs. async updates)
2. Permissions matter (vs. trust-based access)
3. Users will invite teammates (vs. create separate accounts)

Proposed Approach (v1):
[Lightweight description - subject to change based on learning]

Experiments Before Building:
1. Survey churned team leads about collaboration needs
2. Prototype test: real-time vs. async with 10 users
3. Fake door test: measure clicks on "invite team" button
```

---

## 6. The HiPPO-Driven Decision

**The Mistake:**
```
Team Meeting:

Product Manager: "User research shows X approach would work best."
Designer: "Yes, and my prototype tests confirmed X."
Engineer: "X is feasible in our timeline."
CEO: "I've been thinking about this, and I think Y is better."
Everyone: "...Yeah, Y sounds good actually."
```

**Why It's Wrong:**
- Highest Paid Person's Opinion (HiPPO) overrides data
- Team stops bringing real insights (learned helplessness)
- Bad decisions compound
- Kills psychological safety
- CEO/founders often most out of touch with users
- Wastes research and expertise

**The Fix:**
```
Establish decision rights BEFORE the meeting:

"This is a Type 2 decision (reversible). Product manager has decision rights.
CEO can advise but not override unless there's new information."

When HiPPO speaks:
"Interesting perspective. Can you share the data or customer insight
behind that? Let's add it to our consideration."

Create culture:
- "Strong opinions, loosely held"
- Disagree and commit
- Decisions logged with reasoning
- Post-mortems review decision quality
```

---

## 7. The "Let's A/B Test Everything" Paralysis

**The Mistake:**
"We can't decide between X and Y. Let's A/B test it!"

Every decision becomes an A/B test:
- Button color: A/B test
- Pricing tiers: A/B test
- Onboarding flow: A/B test
- Feature inclusion: A/B test
- Copy variations: A/B test

**Why It's Wrong:**
- A/B tests require statistical significance (lots of traffic)
- Most early-stage products lack traffic for valid tests
- Testing slows decisions that could be intuition calls
- Optimizes for local maxima (button clicks vs. overall value)
- Avoids accountability for decisions
- Tests execution, not strategy

**The Fix:**
```
A/B Testing Decision Tree:

Is this a reversible decision?
├── Yes → Make a call, learn from results, adjust
└── No → Continue

Do we have enough traffic for significance?
├── No → Make a call based on qualitative research
└── Yes → Continue

Is this testing execution (how) or strategy (what)?
├── Strategy → Don't A/B test. Make a strategic call.
└── Execution → Continue

A/B test ONLY when:
- High traffic
- Execution optimization (not strategy)
- Clear metric to optimize
- Willing to implement winner regardless of opinion
```

---

## 8. The Feature Factory Sprint

**The Mistake:**
```
Sprint 23 Completed:
- Added user profiles ✓
- Built notification system ✓
- Created admin dashboard ✓
- Implemented search filters ✓
- Added export to CSV ✓

Velocity: 47 story points
Team morale: High (shipped a lot!)
Business impact: Unknown
```

**Why It's Wrong:**
- Output measured, not outcomes
- Team disconnected from impact
- Features accumulate without strategy
- "Did we make things better?" never asked
- Creates organizational debt
- Rewards busywork over impact

**The Fix:**
```
Sprint 23 Review:

Objective: Improve activation rate from 20% → 35%

What we shipped:
- Simplified onboarding (reduced steps from 7 → 3)
- Added progress indicator
- Implemented "quick win" first action

Results (preliminary):
- Activation: 20% → 26% (+6%)
- Drop-off at step 2: 40% → 25%
- User feedback: "Way clearer now"

Assessment: Positive signal but not hitting target
Next sprint: Double down on activation. Try personalized first experience.

What we learned:
- Form fields were biggest friction (removed 4)
- Users want quick win before account creation
```

---

## 9. The Swiss Army Knife Product

**The Mistake:**
"Our product does everything:
- Project management
- Time tracking
- Invoicing
- Client communication
- File storage
- Team chat
- Analytics
- Reporting
- Scheduling
- CRM

Everything in one place!"

**Why It's Wrong:**
- Competes with specialists on every dimension (loses all)
- Confusing positioning ("What do you do?" "Everything!")
- Attracts users who churn because one piece doesn't work
- Engineering resources spread thin
- Can't be best at anything
- Vulnerable to focused competitors

**The Fix:**
```
Product Focus Framework:

Core Job (do ONE thing brilliantly):
"Help freelancers get paid faster"

Support Jobs (do adequately to enable core):
- Invoice creation (must have, good enough)
- Payment tracking (must have, good enough)

Adjacent Jobs (integrate, don't build):
- Time tracking → integrate with Toggl
- Project management → integrate with Asana
- Communication → integrate with email

Explicitly NOT our jobs:
- Team collaboration (we're for solos)
- Full accounting (use QuickBooks)
- CRM (use your existing)

Ruthless focus test:
"Does this feature make us better at getting freelancers paid?"
├── Yes → Consider building
└── No → Integrate or ignore
```

---

## 10. The Premature Platform

**The Mistake:**
```
Phase 1: "We'll build the platform/infrastructure first"
Phase 2: "Then we'll build the first use case on top"
Phase 3: "Then we'll open the platform to others"

18 months later: Powerful platform, zero users
```

**Why It's Wrong:**
- Platforms without use cases are speculation
- You're guessing what the platform needs
- No revenue during build phase
- Platform flexibility often wrong for actual needs
- Talented engineers love building platforms (bias)
- Phase 3 never comes because Phase 2 never works

**The Fix:**
```
Build Product First, Extract Platform Later:

Phase 1: Build ONE specific solution for ONE customer segment
- Get it working end to end
- Make it successful
- Learn what's actually needed

Phase 2: Build second use case, find patterns
- What's reusable?
- What needs to be different?
- Where does flexibility matter?

Phase 3: Extract platform from working products
- Now you KNOW what the platform needs
- You have customers to migrate
- Revenue funds development

Examples:
- AWS: Amazon's infrastructure → extracted to platform
- Stripe: Own payment processing → platform for others
- Shopify: Own stores → platform for merchants

Never:
- "Platform first, use cases later"
- "Flexible now so we don't have to refactor"
```
