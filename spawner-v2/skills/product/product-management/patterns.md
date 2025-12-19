# Patterns: Product Management

Proven approaches that help PMs discover what's worth building and get it shipped.

---

## Pattern 1: The Opportunity Canvas

**Context:** Evaluating whether a problem is worth solving before committing resources.

**The Pattern:**
```
PURPOSE:
Before building anything, assess the opportunity.
Is this worth our time? Is now the right time?
One page that forces the right questions.

OPPORTUNITY CANVAS:

┌─────────────────────────────────────────┐
│ PROBLEM                                 │
│ What problem are we solving?            │
│ Who has this problem?                   │
│ How do they solve it today?             │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│ EVIDENCE                                │
│ How do we know this is real?            │
│ Quantitative: [data]                    │
│ Qualitative: [interviews]               │
│ Behavioral: [what users do]             │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│ OPPORTUNITY SIZE                        │
│ How many users affected?                │
│ How often do they have this problem?    │
│ How severe is it when they do?          │
│ Size = Reach × Frequency × Severity     │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│ BUSINESS VALUE                          │
│ How does solving this help us?          │
│ Revenue? Retention? Acquisition?        │
│ Strategic importance?                   │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│ SOLUTION SPACE                          │
│ What are possible solutions? (3-5)      │
│ What's the smallest we could build?     │
│ Technical feasibility?                  │
└─────────────────────────────────────────┘

DECISION:
Pursue / Park / Kill

USE THIS WHEN:
- Evaluating new opportunities
- Prioritizing backlog items
- Challenging "we should build X"
- Starting discovery on an area
```

---

## Pattern 2: The RICE Framework

**Context:** Prioritizing a backlog of opportunities or features.

**The Pattern:**
```
PURPOSE:
Objective prioritization framework.
Reduces emotional attachment.
Makes trade-offs explicit.

RICE COMPONENTS:

R - REACH
How many users will this impact?
Per time period (quarter, month)
Use data: MAU affected, segment size

I - IMPACT
How much will it impact each user?
Scale: 3 = massive, 2 = high, 1 = medium,
       0.5 = low, 0.25 = minimal

C - CONFIDENCE
How sure are we about these estimates?
100% = proven, 80% = strong evidence,
50% = some evidence, 20% = speculation

E - EFFORT
Person-months to complete
Include design, eng, QA, launch

FORMULA:
Score = (Reach × Impact × Confidence) / Effort

EXAMPLE:

Feature A: New onboarding
- Reach: 5,000 users/month
- Impact: 2 (high)
- Confidence: 80%
- Effort: 2 person-months
- Score: (5000 × 2 × 0.8) / 2 = 4,000

Feature B: Dark mode
- Reach: 50,000 users/month
- Impact: 0.5 (low)
- Confidence: 100%
- Effort: 1 person-month
- Score: (50000 × 0.5 × 1) / 1 = 25,000

Dark mode wins mathematically.
But! Check qualitative factors.

USING RICE:
1. Score everything
2. Rank by score
3. Apply judgment on top
4. RICE informs, doesn't decide

RICE TRAPS:
- Gaming the numbers
- Ignoring strategic fit
- Taking scores too literally
- Forgetting confidence matters
```

---

## Pattern 3: The Dual-Track Agile

**Context:** Running discovery and delivery in parallel.

**The Pattern:**
```
PURPOSE:
Never stop learning while building.
Separate discovery from delivery.
Always have validated work ready.

TWO TRACKS:

DISCOVERY TRACK
├── This Sprint
│   └── Test hypotheses for future sprints
├── Activities
│   ├── User interviews
│   ├── Prototyping
│   ├── Data analysis
│   └── Experiment design
└── Output
    └── Validated ideas ready for delivery

DELIVERY TRACK
├── This Sprint
│   └── Build validated ideas from past discovery
├── Activities
│   ├── Development
│   ├── QA
│   └── Release
└── Output
    └── Shipped features + learnings

THE CONNECTION:
Discovery → Validates → Delivery → Informs → Discovery

Sprint N Discovery: Validate ideas A, B, C
Sprint N Delivery: Build previously validated X, Y

Sprint N+1 Discovery: Explore new areas
Sprint N+1 Delivery: Build A (validated in Sprint N)

PM TIME ALLOCATION:
Discovery: 60%
Delivery: 30%
Strategic: 10%

DISCOVERY CADENCE:
- 5 user conversations minimum per week
- Weekly hypothesis review
- Prototype testing cycle: 2 weeks max
- Data review every sprint

ANTI-PATTERN:
Discovery → Everything validated →
Then delivery
(This is waterfall disguised)
```

---

## Pattern 4: The One-Pager Brief

**Context:** Aligning team on what to build without over-documenting.

**The Pattern:**
```
PURPOSE:
Minimal viable documentation.
Align on the important stuff.
Easy to write, easy to read, easy to update.

ONE-PAGER STRUCTURE:

# [Feature Name]

## Problem
[1-2 sentences describing the problem]
Who has it? How severe?

## Evidence
- [Data point 1]
- [User quote 1]
- [Behavioral observation]

## Hypothesis
We believe [solution] will [outcome] for [users].
We'll know we're right when [measurable signal].

## Solution
[High-level description]
[Link to prototype/wireframe if exists]

## Success Metrics
Primary: [The one metric that matters]
Secondary: [Supporting metrics]
Counter: [What could go wrong]

## Scope
In: [What we're building]
Out: [What we're explicitly not building]

## Open Questions
- [Question 1]
- [Question 2]

## Timeline
Target: [Date or sprint]
Dependencies: [What needs to happen first]

---

THAT'S IT.

One page. If you need more:
- Link to research documents
- Link to prototype
- Link to technical doc (if engineer wrote it)

WHEN TO WRITE MORE:
Only after validating the hypothesis.
Add detail as you learn.
Never write ahead of your knowledge.
```

---

## Pattern 5: The Assumption Mapping

**Context:** Identifying and testing the riskiest assumptions.

**The Pattern:**
```
PURPOSE:
Every idea is built on assumptions.
Untested assumptions = risk.
Test the risky ones before building.

ASSUMPTION MATRIX:

                   CERTAIN ◄──────────► UNCERTAIN
                        │
             ┌──────────┼──────────┐
    HIGH     │ KNOWN    │ TEST     │
    IMPACT   │ Execute  │ FIRST    │
             │          │ !!!!!    │
             ├──────────┼──────────┤
    LOW      │ KNOWN    │ TEST     │
    IMPACT   │ Execute  │ LATER    │
             │          │          │
             └──────────┴──────────┘

PROCESS:

1. List all assumptions
   "Users want to share reports"
   "They'll find the share button"
   "People will accept shared reports"
   "Mobile is important"

2. Rate each assumption
   Impact: How bad if wrong? (H/M/L)
   Certainty: How sure are we? (H/M/L)

3. Prioritize testing
   High Impact + Low Certainty = Test first
   Low Impact + High Certainty = Don't test

4. Design tests
   What's the fastest way to validate?
   Prototype? Interview? Data analysis?

ASSUMPTION TYPES:
- User assumptions (they have this problem)
- Problem assumptions (it's severe enough)
- Solution assumptions (this will work)
- Business assumptions (it helps us)
- Technical assumptions (we can build it)

TEST DESIGN:
Assumption: "Users want to share reports"
Test: Ask 5 users: "What do you do with reports?"
Listen for: Do they mention sharing unprompted?
Decision: If 3+ mention it, validated
```

---

## Pattern 6: The User Story Mapping

**Context:** Visualizing the full user journey and slicing releases.

**The Pattern:**
```
PURPOSE:
See the forest and the trees.
Understand the full journey.
Slice horizontal releases that are usable.

STORY MAP STRUCTURE:

USER ACTIVITIES (Big steps in journey)
═══════════════════════════════════════════
│ Discover │ Sign Up │ Set Up │ Use Daily │ Share │
═══════════════════════════════════════════
           │
TASKS (Steps within each activity)
───────────────────────────────────────────
│ Search  │ Create  │ Add     │ View     │ Invite │
│ Browse  │ Account │ First   │ Dashboard│ Export │
│ Compare │ Verify  │ Project │ Create   │ Collab │
───────────────────────────────────────────
           │
STORIES (Specific implementations)
───────────────────────────────────────────
│ Google  │ Email   │ Template│ Charts   │ Email  │
│ search  │ signup  │ import  │ metrics  │ invite │
│ Landing │ Social  │ Manual  │ Alerts   │ Link   │
│ page    │ login   │ entry   │ Reports  │ share  │
───────────────────────────────────────────

RELEASE SLICING:

Release 1 (Walking skeleton)
────────────────────────────
│ Landing│ Email  │ Manual │ Basic   │ Email  │
│ page   │ signup │ entry  │ charts  │ invite │
────────────────────────────

Release 2 (Add value)
────────────────────────────
│ Search │ Social │Template│Dashboard│ Link   │
│        │ login  │ import │ metrics │ share  │
────────────────────────────

SLICING RULES:
- Each release is a complete journey
- Users can accomplish their goal
- Not just frontend + backend later
- Walking skeleton first
```

---

## Pattern 7: The Jobs-to-be-Done Framework

**Context:** Understanding what users really want to accomplish.

**The Pattern:**
```
PURPOSE:
People don't buy products, they hire them.
Focus on the job, not the solution.
Compete with real alternatives.

JTBD FORMULA:
When [situation], I want to [motivation],
so I can [expected outcome].

EXAMPLE:
"When I'm commuting to work,
I want something to pass the time,
so I can arrive feeling prepared and informed."

Possible hires:
- Podcast
- News app
- Audiobook
- Radio
- Sleeping

JTBD INTERVIEW:

1. Find a recent decision
   "Tell me about the last time you [bought/started/switched]"

2. Map the timeline
   First thought → Active search → Decision → Use

3. Push and pull forces
   Push: What pushed you away from old solution?
   Pull: What attracted you to new solution?
   Anxiety: What worried you about switching?
   Habit: What kept you with the old way?

4. Extract the job
   What were you really trying to accomplish?
   What would success look like?

FORCES DIAGRAM:
                 SWITCH
                   ↑
    Push ──────────┼────────── Pull
    (old pain)     │     (new attraction)
                   │
    Anxiety ───────┼────────── Habit
    (new fear)     │     (old comfort)
                   ↓
               STAY PUT

USING JTBD:
- Competitive analysis (real alternatives)
- Messaging (speak to the job)
- Features (serve the job better)
- Segments (same job, different contexts)
```

---

## Pattern 8: The OKR Framework

**Context:** Setting and tracking meaningful goals.

**The Pattern:**
```
PURPOSE:
Align team on outcomes.
Measure what matters.
Ambitious but achievable.

OKR STRUCTURE:

OBJECTIVE (What we want to achieve)
- Qualitative, inspiring
- Answers: "What matters most?"
- Time-bound (quarterly)

KEY RESULTS (How we'll know we achieved it)
- Quantitative, measurable
- 3-5 per objective
- Stretch: 70% achievement is success

EXAMPLE:

Objective: Make onboarding delightful
Key Results:
1. Increase activation rate from 30% to 45%
2. Reduce time-to-value from 7 days to 2 days
3. Improve onboarding NPS from 30 to 50
4. Decrease support tickets about setup by 60%

OKR PRINCIPLES:

1. Outcomes, not outputs
   Bad KR: Ship 5 features
   Good KR: Improve retention by 10%

2. Stretch goals
   Set KR at 70% likely achievement
   100% means not ambitious enough

3. Cascade alignment
   Company OKRs → Team OKRs → Individual
   Each level supports the above

4. Weekly check-ins
   Are we on track?
   What's blocking us?
   Do we need to adjust?

OKR CADENCE:
Quarter start: Set OKRs
Weekly: Check progress
Mid-quarter: Course correct
Quarter end: Score and learn

SCORING:
0.0-0.3: Failed
0.4-0.6: Made progress
0.7-1.0: Success
```

---

## Pattern 9: The Working Backwards Document

**Context:** Starting with the customer outcome and working backwards to requirements.

**The Pattern:**
```
PURPOSE:
Start with the customer experience.
Write the press release first.
Forces clarity on value proposition.

WORKING BACKWARDS DOC:

1. PRESS RELEASE
[Write as if launching to the public]

FOR IMMEDIATE RELEASE

[Product/Feature Name]: [Tagline]

[City, Date] — [Company] today announced [product],
which lets [target customer] do [main benefit].

[Customer quote about the problem]

[Product] works by [how it works in plain language].
Unlike [alternatives], [product] [key differentiator].

[Internal quote about why we built it]

[Product] is available [when/where/how].

2. FAQ - EXTERNAL
Questions customers will ask:
Q: How does it work?
Q: How much does it cost?
Q: What about [concern]?

3. FAQ - INTERNAL
Questions stakeholders will ask:
Q: Why now?
Q: Why not [alternative approach]?
Q: What's the risk?

4. CUSTOMER EXPERIENCE
Walk through the customer journey:
- How do they discover it?
- What's their first experience?
- What makes them come back?
- How do they become advocates?

5. SUCCESS METRICS
How will we know this succeeded?
Launch metrics vs 6-month metrics

WRITING RULES:
- Write for customer, not stakeholders
- Use simple language
- If you can't explain it simply, rethink it
- Constraints force clarity
```

---

## Pattern 10: The Experiment Framework

**Context:** Validating ideas through structured experimentation.

**The Pattern:**
```
PURPOSE:
Learn before you build.
Reduce risk through experiments.
Evidence over opinion.

EXPERIMENT STRUCTURE:

HYPOTHESIS:
We believe [this change] will [this outcome]
for [these users] because [this reasoning].

TEST:
[What we'll do to test]
Duration: [How long]
Sample: [How many users]
Method: [How we'll measure]

METRICS:
Primary: [The one metric we're testing]
Secondary: [Supporting signals]
Counter: [What could go wrong]

SUCCESS CRITERIA:
We'll consider this validated if [specific threshold].
Example: "Activation increases by 10% with 95% confidence"

RESULTS:
[What happened]
[Data/evidence]

DECISION:
Ship / Iterate / Kill

EXPERIMENT TYPES:

1. Fake Door
   Build the button, not the feature
   Measure clicks
   Validates demand

2. Wizard of Oz
   Human behind the curtain
   Looks automated
   Validates the experience

3. Concierge
   Do it manually first
   Learn deeply from few users
   Validates the value

4. A/B Test
   Randomized comparison
   Statistical significance
   Validates the difference

5. Prototype Test
   Clickable mockup
   User sessions
   Validates usability

EXPERIMENT FLOW:
Question → Hypothesis → Experiment →
Data → Decision → Next question
```
