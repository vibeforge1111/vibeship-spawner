# Patterns: Product Strategy

These are the proven approaches that consistently lead to successful products. Each pattern has been validated across hundreds of successful companies.

---

## 1. Jobs To Be Done (JTBD) Discovery

**What It Is:**
Understanding products through the "job" customers hire them to do, not features or demographics.

**When To Use:**
- Starting any new product or feature
- When traditional personas aren't yielding insights
- When you're stuck on differentiation
- Repositioning an existing product

**The Pattern:**

```
JTBD Statement Structure:
"When [situation], I want to [motivation], so I can [expected outcome]."

Example:
"When I'm commuting and want to feel productive, I want to learn something new,
so I can feel like I'm not wasting time."
→ This job is hired by: podcasts, audiobooks, news apps, language learning apps

Discovery Process:
1. Find recent "switchers" - people who recently changed solutions
2. Ask about the timeline: What triggered the search? What did you try?
3. Map the forces: Push (current pain), Pull (new solution appeal),
   Anxiety (fear of new), Habit (comfort with old)
4. Look for "firing" moments - when did they fire the old solution?
```

**Why It Works:**
People don't buy products, they hire them to make progress. Understanding the job reveals true competitors (often surprising), unmet needs, and positioning opportunities.

**Example Application:**
Milkshake study: McDonald's discovered morning milkshakes competed with bagels and bananas (commute entertainment), not other drinks. Afternoon milkshakes competed with toys and parent guilt. Same product, different jobs, different improvements needed.

---

## 2. The Riskiest Assumption Test (RAT)

**What It Is:**
Identifying and testing the single assumption that, if wrong, would kill your entire product thesis.

**When To Use:**
- Before building anything
- When deciding what to prototype first
- When you have limited resources for validation
- Prioritizing experiments

**The Pattern:**

```
Step 1: List all assumptions
- Customers have this problem
- They're willing to pay to solve it
- They'll trust us to solve it
- We can build it
- We can reach them
- They'll switch from current solution

Step 2: Rate each assumption
- Confidence (1-10): How sure are you this is true?
- Impact (1-10): How bad if you're wrong?
- Risk Score = (10 - Confidence) × Impact

Step 3: Test the highest risk score first
- Design the cheapest experiment that would change your mind
- Define success/failure criteria before running
- Time-box to 1-2 weeks max

Step 4: Pivot or proceed based on results
```

**Why It Works:**
Most startups fail by validating the easy assumptions while ignoring the fatal ones. This pattern forces you to confront what could kill you before investing.

**Example Application:**
A B2B startup assumed enterprises would buy. High confidence in the problem, low confidence in enterprise sales. They tested by getting 3 LOIs before building. Discovered legal requirements they hadn't known about. Pivoted approach before writing code.

---

## 3. The 10x Value Framework

**What It Is:**
Your product must be 10x better than the current solution in at least one dimension that matters, or customers won't switch.

**When To Use:**
- Evaluating product ideas
- Defining competitive positioning
- Prioritizing features
- Go/no-go decisions

**The Pattern:**

```
10x Dimensions (pick one to own):
- 10x Faster (Stripe vs. old payment integration)
- 10x Cheaper (Zoom vs. enterprise video conferencing)
- 10x Easier (Canva vs. Photoshop for non-designers)
- 10x More Accessible (YouTube vs. TV broadcasting)
- 10x Better Experience (iPhone vs. BlackBerry)
- 10x More Accurate (Google vs. Yahoo search)
- 10x More Connected (Facebook vs. email for friends)

Evaluation:
1. What's the current solution? (Include "do nothing" and workarounds)
2. What dimension could you be 10x better on?
3. Does your target customer care about that dimension?
4. Can you sustain the 10x advantage?

Warning Signs:
- "We're 2x better across 5 dimensions" = not enough
- "We're 10x better but customers don't care about that dimension"
- "We're 10x better but only for edge cases"
```

**Why It Works:**
Switching costs are high - learning curve, data migration, habit change, risk. A product needs to be dramatically better to overcome inertia. Incremental improvements don't trigger switching behavior.

---

## 4. The Minimum Viable Segment

**What It Is:**
The smallest market segment that can sustain your business and where you can be #1.

**When To Use:**
- Defining initial target market
- When "everyone" is currently your target
- Finding product-market fit
- Before scaling marketing

**The Pattern:**

```
Segment Definition:
- Specific person (role/title, not demographic)
- Specific situation (trigger event, current state)
- Specific problem (urgent, frequent, expensive)
- Willingness to try new solutions (early adopter traits)

Selection Criteria:
1. Can you reach them? (channels, access, credibility)
2. Can you serve them better than anyone? (unique capability)
3. Will they tell others? (network effects within segment)
4. Can segment expand? (adjacent segments reachable)
5. Is segment big enough? (can sustain business at 30%+ share)

Wrong Way:
"Small businesses that need CRM"

Right Way:
"Solo real estate agents in Texas who are overwhelmed managing
leads from Zillow and losing deals to faster responders"
```

**Why It Works:**
Dominating a small segment creates reference customers, proves the model, generates word-of-mouth, and builds a beachhead for expansion. Trying to serve everyone means serving no one deeply.

---

## 5. The "Hair on Fire" Problem Test

**What It Is:**
Evaluating whether a problem is urgent enough that customers are actively seeking solutions.

**When To Use:**
- Validating problem severity
- Prioritizing which problems to solve
- Distinguishing vitamins from painkillers
- Qualifying opportunities

**The Pattern:**

```
Problem Severity Levels:

Level 5: Hair on Fire (IDEAL)
- Actively searching for solutions right now
- Willing to use ugly/incomplete solutions
- Will pay premium for speed
- Example: "Our payment processor just dropped us"

Level 4: Painful
- Budgeted to solve
- Comparing solutions
- Example: "We lose 2 hours/day to manual data entry"

Level 3: Annoying
- Complains about it
- Would like it solved
- Won't prioritize budget
- Example: "Our reporting could be better"

Level 2: Meh
- Acknowledges when asked
- Not top of mind
- Example: "I guess that's not ideal"

Level 1: Unaware
- Doesn't recognize the problem
- Requires education
- Example: Most "visionary" products start here

Evidence to Look For:
- Are they currently paying for alternatives? (Level 4+)
- Have they built internal workarounds? (Level 3+)
- Is it in their OKRs/KPIs? (Level 4+)
- Would they take a call this week? (Level 5)
```

**Why It Works:**
Level 5 problems sell themselves. Level 1-2 problems require massive education budgets and long sales cycles. Most startups overestimate their problem severity.

---

## 6. The Product Principle Stack

**What It Is:**
A hierarchy of non-negotiable principles that guide every product decision.

**When To Use:**
- Setting up product culture
- Making difficult trade-off decisions
- Aligning team on priorities
- Onboarding new team members

**The Pattern:**

```
Structure:
1. Core Belief (Why we exist)
2. Primary Principle (When in doubt, optimize for this)
3. Supporting Principles (3-5 more specific guidelines)
4. Anti-Principles (What we explicitly reject)

Example - Stripe:
- Core Belief: Developers deserve beautiful, powerful tools
- Primary Principle: Developer experience above all
- Supporting Principles:
  - Make the complex simple
  - Documentation is product
  - 7 lines of code to integrate
- Anti-Principles:
  - Won't optimize for enterprise at expense of DX
  - Won't compromise API elegance for features

Usage:
"We're debating feature X vs Y. Which better serves our primary principle?"
"This request violates our anti-principles - it's an automatic no."
```

**Why It Works:**
Principles enable autonomous decision-making. Without them, every decision escalates or creates inconsistency. They're the product's immune system against feature creep.

---

## 7. The Value Proposition Canvas

**What It Is:**
A structured way to ensure your product creates value that customers actually want.

**When To Use:**
- Designing new products
- Improving product-market fit
- Creating marketing messaging
- Competitive positioning

**The Pattern:**

```
Customer Profile (Right Side):
┌─────────────────────────────┐
│     Customer Jobs           │
│  - Functional (tasks)       │
│  - Social (how seen)        │
│  - Emotional (how feel)     │
├─────────────────────────────┤
│     Pains                   │
│  - Obstacles                │
│  - Risks                    │
│  - Bad outcomes             │
├─────────────────────────────┤
│     Gains                   │
│  - Required outcomes        │
│  - Expected benefits        │
│  - Desired delights        │
└─────────────────────────────┘

Value Map (Left Side):
┌─────────────────────────────┐
│   Products & Services       │
│  - Core offering            │
│  - Supporting features      │
├─────────────────────────────┤
│   Pain Relievers            │
│  - How you eliminate pains  │
│  - Which pains addressed    │
├─────────────────────────────┤
│   Gain Creators             │
│  - How you create gains     │
│  - Which gains addressed    │
└─────────────────────────────┘

Fit Check:
Draw lines connecting Pain Relievers → Pains
Draw lines connecting Gain Creators → Gains
Gaps = opportunity or positioning problem
```

**Why It Works:**
Forces explicit connection between what you build and what customers need. Exposes assumptions and gaps. Creates shared language for product discussions.

---

## 8. The Competitive Wedge Strategy

**What It Is:**
Finding the specific angle where you can win against established players by being different, not better.

**When To Use:**
- Entering established markets
- Competing with well-funded players
- Finding differentiation
- Strategic positioning

**The Pattern:**

```
Wedge Types:

1. Segment Wedge
   - Serve ignored segment brilliantly
   - Example: Shopify → "Stripe for physical products"

2. Use Case Wedge
   - Own one use case completely
   - Example: Zoom → "Video meetings that just work"

3. Simplicity Wedge
   - Remove features to serve specific need
   - Example: Basecamp → "We don't have Gantt charts, that's the point"

4. Integration Wedge
   - Be the best at connecting to specific ecosystem
   - Example: Pipedrive → "CRM for salespeople, not sales managers"

5. Business Model Wedge
   - Same value, different model
   - Example: Open source vs. proprietary

Wedge Selection:
1. Where does the incumbent's strength become weakness?
2. What would they never do (incentives, brand, org structure)?
3. What's valuable to some customers but not others?
```

**Why It Works:**
Direct competition with established players is expensive and usually loses. Wedge strategy uses their strength against them by finding spaces they can't or won't occupy.

---

## 9. The Pre-Mortem Analysis

**What It Is:**
Imagining your product has failed and working backwards to identify likely causes.

**When To Use:**
- Before major launches
- Making go/no-go decisions
- Risk mitigation planning
- Strategy stress-testing

**The Pattern:**

```
Setup:
"It's one year from now. Our product has completely failed.
What happened?"

Process:
1. Individual brainstorm (10 min)
   - Each person writes 3-5 failure scenarios
   - Be specific: "We failed because X happened leading to Y"

2. Share and cluster (15 min)
   - Group similar failure modes
   - Categories: Market, Product, Execution, Team, External

3. Likelihood and impact assessment
   - Rate each: Likely/Unlikely × Catastrophic/Manageable

4. Address high-likelihood, high-impact scenarios
   - Can we prevent it?
   - Can we detect it early?
   - Can we mitigate the damage?

5. Define tripwires
   - What signals would indicate this failure mode is emerging?
   - What's our response plan?

Example Failure Modes:
- "We built features instead of solving the core problem"
- "We scaled before we had product-market fit"
- "Our sales cycle was 3x longer than our runway"
- "A competitor launched with $50M in funding"
```

**Why It Works:**
It's psychologically easier to imagine failure than predict success. Pre-mortems surface risks that optimism bias normally hides. Creates contingency plans before they're needed.

---

## 10. The North Star Metric Framework

**What It Is:**
Defining the single metric that best captures the value you create for customers.

**When To Use:**
- Aligning teams on success
- Prioritizing product work
- Creating dashboards
- Strategic planning

**The Pattern:**

```
North Star Metric Criteria:
1. Measures value delivered to customer (not your revenue)
2. Leading indicator of revenue (not revenue itself)
3. Reflects product vision
4. Actionable by the product team
5. Understandable by everyone

Examples:
- Airbnb: Nights booked
- Spotify: Time listening
- Slack: Messages sent in channels
- Facebook: Daily active users
- Amplitude: Weekly learning users (users who query data)

Structure:
                    North Star Metric
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
    Input Metric 1    Input Metric 2    Input Metric 3
    (Activation)      (Engagement)      (Retention)

Input Metrics:
- Levers you can pull to improve North Star
- Team-level accountability
- More granular and actionable

Anti-Patterns:
- Revenue as North Star (lagging indicator)
- Vanity metrics (users, downloads)
- Metrics team can't influence
```

**Why It Works:**
Without a North Star, teams optimize local metrics at expense of global value. The right metric creates alignment without coordination overhead.
