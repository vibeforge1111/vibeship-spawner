# Anti-Patterns: Product Management

These approaches look like good product management but consistently fail to deliver outcomes.

---

## 1. The Customer-Said Trap

**The Mistake:**
```
User interview:
"I want export to Excel"

PM action:
Build export to Excel

Reality:
Feature unused
User actually needed better reporting
Excel was a familiar solution, not the right one

THE PATTERN:
Customer says X → PM builds X → Doesn't work
```

**Why It's Wrong:**
- Customers describe solutions, not problems
- They use familiar references
- They don't know what's possible
- Surface request ≠ underlying need

**Better Approach:**
```
PROBLEM EXTRACTION:

Customer says: "I want export to Excel"

PM asks: "Tell me about the last time you
         exported data. What did you do with it?"

Customer: "I sent it to my boss for the weekly report"

PM asks: "What does your boss need to see?"

Customer: "Key metrics and trends"

Real problem: Boss needs visibility into metrics

Solutions:
1. Export to Excel (what they asked)
2. Auto-email report (easier for user)
3. Dashboard access for boss (solves root cause)
4. Scheduled PDF report (middle ground)

BEST SOLUTION:
Often not what they asked for.
Requires understanding the problem.

INTERVIEW TECHNIQUE:
Never: "Would you use X?"
Always: "What do you do today?"
        "Tell me about the last time..."
        "What happened after that?"
```

---

## 2. The Roadmap Religion

**The Mistake:**
```
January: Create detailed Q1-Q4 roadmap
February: Execute roadmap
...
December: Execute roadmap

Nothing learned in 12 months
Market changed
Roadmap unchanged
Product irrelevant
```

**Why It's Wrong:**
- Roadmaps are predictions, not certainties
- Learning should change plans
- Rigidity kills adaptation
- False certainty is worse than uncertainty

**Better Approach:**
```
ADAPTIVE ROADMAPPING:

NOW (Committed - 2-4 weeks)
├── Specific features
├── Team allocated
├── Estimates confident
└── Low flexibility

NEXT (Planned - 1-2 months)
├── Validated problems
├── Solution hypotheses
├── Scope flexible
└── Medium flexibility

LATER (Exploring - 3-6 months)
├── Problem areas
├── Research needed
├── Solutions unknown
└── High flexibility

ROADMAP REVIEWS:
Weekly: Check NOW
Bi-weekly: Review NEXT
Monthly: Evaluate LATER
Quarterly: Major reprioritization

CHANGE IS SUCCESS:
Roadmap changed because we learned?
That's the point.
Static roadmap = not learning.
```

---

## 3. The Competitive Paranoia

**The Mistake:**
```
Monday: "Competitor launched feature X!"
Tuesday: PM adds X to backlog (HIGH PRIORITY)
Wednesday: Engineering starts building X
Month later: Feature shipped

Result:
Users don't care
Competitor's feature also flopped
You copied a mistake
```

**Why It's Wrong:**
- Competitor decisions aren't validated
- You don't know their strategy
- Copying is always behind
- Their users ≠ your users

**Better Approach:**
```
COMPETITIVE INTELLIGENCE:

WATCH:
- What they're doing
- How customers respond
- Where they're going

DON'T:
- Copy features directly
- Assume they're right
- React to every move
- Let them set your agenda

COMPETITIVE RESPONSE FRAMEWORK:

Competitor does X:
1. Does this affect our users? (Often: no)
2. Is there evidence it's working?
3. What problem does it solve?
4. Do our users have that problem?
5. Is there a better solution for our users?

RESULT:
Usually: Keep building your roadmap
Sometimes: Accelerate something already planned
Rarely: Add something new
Never: React without understanding

COMPETITIVE ADVANTAGE:
Don't compete on features.
Compete on understanding your users.
They can copy features.
They can't copy your user insight.
```

---

## 4. The MVP Misunderstanding

**The Mistake:**
```
"It's just an MVP, it doesn't need to be good"

Result:
Crappy product
Users hate it
"See, the idea doesn't work"

Reality:
The idea might work
The execution killed it
```

**Why It's Wrong:**
- MVP ≠ Crappy product
- Minimum doesn't mean incomplete
- Viable means actually usable
- First impressions matter

**Better Approach:**
```
MVP DEFINED CORRECTLY:

Minimum:
Smallest feature set that tests the hypothesis
Not: Smallest we can build
But: Smallest that tests the question

Viable:
Actually works end-to-end
Not: Half-finished
But: Complete but narrow

Product:
Usable by real users
Not: Prototype
But: Something people can actually use

GOOD MVP:
✓ Solves one problem completely
✓ Works reliably
✓ Decent (not great) UX
✓ Can test the hypothesis
✓ Can be used in anger

BAD MVP:
✗ Many features, all broken
✗ Beautiful UI, no functionality
✗ Feature complete, unusable
✗ Technical demo, not user-facing

MVP QUESTION:
"What's the smallest thing we can build that
teaches us whether this works?"
```

---

## 5. The Data Worship

**The Mistake:**
```
PM: "The data says users want feature X"

Data:
- 500 support tickets mention X
- Survey shows 60% want X
- Competitor has X

PM builds X
Users don't use it

"But the data!"
```

**Why It's Wrong:**
- Data tells you what, not why
- Stated preference ≠ revealed preference
- Data can be misleading
- Correlation ≠ causation

**Better Approach:**
```
DATA + INSIGHT:

DATA tells you:
- What is happening
- How often
- Who is affected
- Correlations

DATA doesn't tell you:
- Why it's happening
- What to do about it
- What users actually want
- What will work

COMBINE:
Quantitative (Data):
"30% of users drop off at step 3"

Qualitative (Insight):
"They don't understand what to do next"

Action (Synthesis):
"Improve step 3 guidance"

DATA HIERARCHY:
1. Behavioral data (what they do)
2. Outcome data (what happened)
3. Survey data (what they say)
4. Interview data (what they explain)

USE ALL FOUR:
Behavioral: They clicked X
Outcome: Then they churned
Survey: They said they were confused
Interview: They explained the confusion

NOW you understand.
```

---

## 6. The Perfect Spec

**The Mistake:**
```
Before building:
- 40-page PRD
- Every edge case documented
- All screens wireframed
- Technical approach specified
- 8 weeks of writing

During building:
- "That's not in the spec"
- "The spec says..."
- "We need to update the spec"

Result:
More time speccing than building
Spec is wrong anyway
Inflexible to learning
```

**Why It's Wrong:**
- Specs can't predict reality
- Detailed specs are out of date immediately
- Time writing is time not learning
- False certainty is paralyzing

**Better Approach:**
```
PROGRESSIVE SPECIFICATION:

Discovery stage:
One-pager: Problem + hypothesis
That's it.

Validation stage:
Add: What we learned
Add: Solution approach
3-5 pages max

Building stage:
Add: Implementation details
Add: Edge cases (as discovered)
Living document

SPEC PRINCIPLES:
1. Spec to align, not to cover ass
2. Spec the uncertain, skip the obvious
3. Update as you learn
4. Kill the spec when building

WHAT TO SPEC:
✓ The problem (why are we doing this)
✓ Success metrics (how we'll know it worked)
✓ User experience (what they see/do)
✓ Key decisions (and why)

WHAT NOT TO SPEC:
✗ Every edge case
✗ Technical implementation
✗ Things that are obvious
✗ Things you haven't validated
```

---

## 7. The Stakeholder Pleaser

**The Mistake:**
```
CEO: "Add gamification"
PM: "Sure!"

Sales: "Enterprise SSO"
PM: "Absolutely!"

Marketing: "Referral program"
PM: "Of course!"

Customer: "Dark mode"
PM: "You got it!"

Result:
Roadmap = everyone's wishlist
No prioritization
Nothing ships
Everyone unhappy
```

**Why It's Wrong:**
- Can't build everything
- Stakeholders see their slice
- PM should synthesize, not just collect
- Saying yes to all = strategy of none

**Better Approach:**
```
STAKEHOLDER MANAGEMENT:

LISTEN to everyone
DECIDE based on evidence
COMMUNICATE the reasoning

STAKEHOLDER INPUT:
1. Collect requests
2. Translate to problems
3. Evaluate against priorities
4. Decide based on strategy
5. Explain decisions

SAYING NO:

Template:
"I hear you want [X] because [their reason].
We're not doing it now because [your reason].
What we ARE doing to address this: [alternative].
Let's revisit in [timeline]."

NO TOOLS:
- Not now (defer)
- Different approach (solve differently)
- Trade-off (if this, not that)
- Evidence needed (prove the need)

BUILDING CREDIBILITY:
Ship things that work → Trust builds
Make good calls → Authority grows
Then "no" is accepted
```

---

## 8. The Launch and Forget

**The Mistake:**
```
Q1: Build feature A
Q2: Build feature B
Q3: Build feature C
Q4: Build feature D

Feature A: Unused, unloved, bugs unfixed
Feature B: Kinda working
Feature C: Just shipped
Feature D: Building

"We need to build new things!"
```

**Why It's Wrong:**
- First version is rarely right
- Iteration improves products
- Abandoned features hurt experience
- Learning happens post-launch

**Better Approach:**
```
BUILD → MEASURE → LEARN → ITERATE

POST-LAUNCH PROCESS:

Week 1: Bug fixes, hot fixes
Week 2: Data review, first insights
Week 4: Full analysis, iteration decision

ITERATION DECISION:
Working great → Maintain
Working but issues → Iterate
Not working → Kill or major pivot

CAPACITY ALLOCATION:
New features: 60%
Iteration: 25%
Maintenance: 15%

KILL CRITERIA:
Define before launch:
"If after 4 weeks, [metric] isn't [target],
we'll [kill / major pivot / minor iterate]"

ITERATION BACKLOG:
Every feature has iteration items
Review quarterly
Don't just add, also subtract
```

---

## 9. The Process Theater

**The Mistake:**
```
"We need better process!"

Adds:
- Daily standups
- Weekly roadmap reviews
- Bi-weekly retros
- Monthly planning
- Quarterly OKRs
- Annual planning

Engineers: "All we do is meet"
PM: "But we have great process!"
Outcome: Nothing ships faster
```

**Why It's Wrong:**
- Process serves outcomes, not vice versa
- Too much process is as bad as none
- Meetings aren't work
- Ritual without purpose is waste

**Better Approach:**
```
MINIMAL VIABLE PROCESS:

For small team (< 5):
- Weekly planning (30min)
- Daily async standups
- That's it

For medium team (5-15):
- Weekly planning
- Daily standups (if helpful)
- Bi-weekly retro
- Quarterly planning

PROCESS PRINCIPLES:
1. Start minimal, add only when needed
2. Every meeting has clear purpose
3. If outcome unclear, don't meet
4. Async when possible

MEETING AUDIT:
For every meeting:
- What decision does this meeting make?
- Who needs to be there?
- Can this be async?
- What happens if we skip it?

PROCESS SMELLS:
- "We've always done it"
- "Because process"
- "The ritual matters"
- No clear output
```

---

## 10. The Feature Parity Fallacy

**The Mistake:**
```
Product planning:
"Competitor has X, Y, Z"
"We need X, Y, Z for parity"
"Then we can innovate"

3 years later:
Still building parity
No differentiation
Competitor still ahead
```

**Why It's Wrong:**
- You'll never catch up this way
- Parity isn't differentiation
- Your users might not need those features
- Chasing = following

**Better Approach:**
```
ASYMMETRIC STRATEGY:

Instead of parity:
Find what THEY can't do

YOUR STRENGTHS:
- What can you do better?
- What's your unfair advantage?
- What do your specific users need?

BUILD ON STRENGTHS:
Not: Match competitor + innovate
But: Differentiate from day one

PARITY QUESTION:
"Do OUR users need this?"
Not: "Does competitor have this?"

COMPETITIVE POSITIONING:
We do [X] better than anyone
They do [Y] better than us
Our users care about [X]
Their users care about [Y]
Different products for different users

ESCAPE PARITY TRAP:
1. Pick a segment that's underserved
2. Build exactly what they need
3. Be the best for that segment
4. Expand from strength, not weakness
```

---

## 11. The Infinite Discovery

**The Mistake:**
```
Month 1: Research
Month 2: More research
Month 3: Getting closer...
Month 4: Just a few more interviews
Month 5: Need to validate one more thing
Month 6: Maybe we should research more

Nothing shipped.
Team frustrated.
"But we need to be sure!"
```

**Why It's Wrong:**
- You can't research your way to certainty
- At some point, you need to ship and learn
- Research has diminishing returns
- The market is the real test

**Better Approach:**
```
TIME-BOXED DISCOVERY:

Phase 1: Problem discovery (2 weeks)
- Is there a problem?
- Who has it?
- How severe?
Decision: Pursue or not

Phase 2: Solution discovery (2 weeks)
- What might work?
- Quick prototypes
- Test reactions
Decision: Which direction

Phase 3: Build and learn (2-4 weeks)
- Ship something
- Real usage data
- Iterate from there

RESEARCH LIMITS:
"We have enough to take a bet"
Not: "We have certainty"

RESEARCH SIGNALS:
Stop when you see the same patterns
5 interviews, same answer = pattern
More interviews = diminishing returns

SHIP OVER CERTAINTY:
Certainty is impossible
Educated bets are possible
Ship → Learn → Iterate
Faster than Research → Research → Research
```

---

## 12. The Democracy PM

**The Mistake:**
```
Priority decision:
"Let's vote!"
Team votes: Feature A wins

Strategy decision:
"What does everyone think?"
Diverse opinions, no resolution

Trade-off decision:
"Let's find consensus"
Meeting ends, no decision

"I don't want to be a dictator"
```

**Why It's Wrong:**
- Not all opinions are equal
- PM is accountable, PM should decide
- Consensus produces mediocrity
- Votes don't create ownership

**Better Approach:**
```
DECISION OWNERSHIP:

PM DECIDES (with input):
- What to build
- Priority order
- Scope trade-offs
- Ship/kill decisions

TEAM DECIDES:
- How to build it
- Technical approach
- Implementation details
- Engineering trade-offs

DECISION PROCESS:
1. Gather input (everyone)
2. Consider perspectives
3. Make decision (PM)
4. Communicate reasoning
5. Disagree and commit (team)

CONSULTATION ≠ VOTING:
Consult: "I want your input"
Decide: "Here's what we're doing and why"
Execute: "Let's make it happen"

PM ACCOUNTABILITY:
You decide, you own the outcome.
Good PMs make more right calls than wrong.
Wrong calls + right process = okay.
Avoiding calls = not okay.
```
