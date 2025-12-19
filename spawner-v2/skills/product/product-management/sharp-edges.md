# Sharp Edges: Product Management

Critical mistakes that derail product development and destroy team trust.

---

## 1. The Solution-First Syndrome

**Severity:** Critical
**Situation:** Starting with a solution instead of a problem
**Why Dangerous:** You build the wrong thing—beautifully.

```
THE TRAP:
"Let's build a notification center!"
"We need to add social features!"
"Users want dark mode!"

Skipping:
- What problem does this solve?
- Who has this problem?
- Is this their top problem?
- Why do they have this problem?

Result:
Feature ships → No one uses it
"But users asked for it!" → They asked for a solution
                            to a problem you didn't explore

THE FIX:
1. Start with problem statements
   "Users are missing important updates because..."
   Not: "Users want notifications because..."

2. Validate the problem first
   How many users have this problem?
   How severe is it?
   What's the workaround today?

3. Explore solutions second
   What are 5 ways to solve this?
   Which solves the problem best?
   Which is smallest to test?

4. Flip solution requests to problems
   User: "Add export to Excel"
   PM: "What are you trying to accomplish?"
   User: "I need to share reports with my boss"
   Real problem: Report sharing, not Excel

PROBLEM VALIDATION:
- Are they doing workarounds?
- Would they pay for a solution?
- Is it mentioned unprompted?
- Top 3 problem for this persona?
```

---

## 2. The Roadmap Theater

**Severity:** Critical
**Situation:** Treating roadmaps as commitments instead of plans
**Why Dangerous:** Teams optimize for hitting roadmap instead of outcomes.

```
THE TRAP:
Q1 Roadmap:
- Feature A ✓
- Feature B ✓
- Feature C ✓
All shipped! Success!

Q1 Outcomes:
Retention: No change
Revenue: No change
NPS: Dropped

"But we hit the roadmap!"

THE REALITY:
Roadmaps are hypotheses, not promises.
Shipping features is output, not outcome.
Roadmap accuracy ≠ product success.

THE FIX:
1. Outcome-based roadmaps
   Q1 Goal: Improve activation from 30% to 45%
   Bets:
   - Simplified onboarding
   - Welcome wizard
   - Template library

   Shipping all 3 is irrelevant if activation stays at 30%

2. Continuous reprioritization
   What did we learn this week?
   Does it change our bets?
   Should we pivot mid-quarter?

3. Communicate uncertainty
   "Now" - Building (committed)
   "Next" - Planned (high confidence)
   "Later" - Exploring (will change)

4. Celebrate outcomes, not shipments
   Shipped feature → Table stakes
   Moved metric → Celebrate
   Killed a project early → Also celebrate

ROADMAP FORMAT:
Outcome: [What success looks like]
Current state: [Where we are now]
Bets: [Features we think will get us there]
Confidence: [How sure are we]
Learn by: [Date we'll know if it's working]
```

---

## 3. The Stakeholder Hostage

**Severity:** High
**Situation:** Building what stakeholders demand instead of what users need
**Why Dangerous:** Product becomes a political battlefield instead of a user solution.

```
THE TRAP:
CEO: "Add gamification!"
Sales: "We need this to close the deal!"
Support: "Users keep asking for X!"
Marketing: "Competitor has it!"

PM: "Okay, okay, I'll add it all..."

Result:
Bloated product
No coherent vision
Every feature is "urgent"
Real user problems ignored

THE REALITY:
Stakeholders have insights but not authority.
They see their slice, you see the whole.
Saying yes to everyone means no strategy.

THE FIX:
1. Separate input from decision
   Everyone can provide context
   PM synthesizes into recommendations
   Single decision-maker (you or above)

2. Translate demands to problems
   CEO: "Add gamification"
   PM: "What problem are you trying to solve?"
   CEO: "Users aren't engaged enough"
   PM: "Let me research engagement solutions"
   (Gamification might not be the answer)

3. Use data as arbiter
   "Let's test this hypothesis"
   Removes personal opinion
   Evidence-based decisions

4. Align on outcomes, negotiate features
   "We're aligned on improving retention"
   "Let me find the best solution"
   Gives you room to be right

5. Build trust bank
   Small wins build credibility
   When you say no with credibility, it sticks

STAKEHOLDER TRANSLATION:
What they said: "We need feature X"
What they mean: "I have a problem I think X solves"
Your job: Find the actual best solution
```

---

## 4. The Spec Mountain

**Severity:** High
**Situation:** Writing massive specs before learning anything
**Why Dangerous:** Waterfall in agile clothing.

```
THE TRAP:
Before building:
- 30-page PRD
- Complete wireframes
- Technical architecture
- All edge cases mapped
- 6 months of planning

Then:
Build for 3 months
Ship
Users don't want it
All that documentation = waste

THE REALITY:
Detailed specs are a form of procrastination.
You're avoiding uncertainty by creating false certainty.
The spec isn't the product—the product is.

THE FIX:
1. Thin specs, fast learning
   One-page brief: Problem, hypothesis, success metric
   Build the smallest thing to learn
   Add detail as you learn

2. Progressive documentation
   Discovery: One-pager
   Validation: Add details
   Building: Full spec (but still minimal)
   Never spec what you haven't validated

3. Spec for alignment, not safety
   Purpose: Get team on same page
   Not: Cover yourself if it fails

4. Living documents
   Spec changes as you learn
   Outdated spec = useless spec
   Keep it minimal to stay current

SPEC SIZE BY STAGE:
Discovery: One-pager (problem + hypothesis)
Validation: 2-3 pages (add what you learned)
Building: 5-10 pages (enough to build, no more)

SPEC ANTI-PATTERN:
"We need to spec all edge cases"
No—build the core, find edges in production
Real edges come from real usage
```

---

## 5. The Metric Trap

**Severity:** High
**Situation:** Optimizing for metrics that don't matter
**Why Dangerous:** You hit your metrics while your product fails.

```
THE TRAP:
Team metric: Daily Active Users
Strategy: Push notifications
Result: DAU up 40%!

Reality:
Users annoyed
Uninstalls up
Revenue: Unchanged
NPS: Tanking

"But we hit our metric!"

THE REALITY:
Metrics are proxies, not goals.
Any metric, optimized hard enough, breaks.
Goodhart's Law: "When a measure becomes a target..."

THE FIX:
1. North star + input metrics
   North Star: Value delivered (hard to game)
   Input metrics: Things you can influence
   Watch both—never just input

2. Counter-metrics
   If you optimize engagement, watch churn
   If you optimize signups, watch activation
   Balance keeps you honest

3. Qualitative check
   Talk to users monthly
   Do metrics tell the full story?
   Is the product actually better?

4. Leading vs lagging
   Lagging: Revenue, retention (results)
   Leading: Activation, engagement (predictors)
   Manage leading, measure lagging

METRIC STACK:
North Star: [What success ultimately looks like]
Counter: [What could go wrong if we over-optimize]
Leading: [What we can influence today]
Lagging: [What proves we were right]

METRIC TEST:
"If we hit this metric, would the business succeed?"
If no, find a better metric.
```

---

## 6. The Estimate Fiction

**Severity:** High
**Situation:** Treating engineering estimates as commitments
**Why Dangerous:** Teams pad estimates, management loses trust, death spiral.

```
THE TRAP:
PM: "How long will this take?"
Engineer: "Maybe 2 weeks?"
PM to stakeholders: "It'll be done in 2 weeks"
Stakeholders: "Great, we'll plan the launch!"

Reality: 4 weeks
Everyone angry
Engineer stops estimating honestly
Next time: "6 weeks" (padded)

THE REALITY:
Estimates are guesses about uncertain work.
Uncertainty doesn't go away by demanding certainty.
Padding just adds waste.

THE FIX:
1. Communicate ranges, not points
   "1-3 weeks depending on what we find"
   Under-promise specific, over-promise range

2. Estimate in confidence levels
   High confidence: We've done this before
   Medium confidence: Similar work, some unknowns
   Low confidence: New territory, could be anything

3. Time-box discovery
   "We'll spend 2 days spiking and then re-estimate"
   Reduces uncertainty before committing

4. Velocity over estimates
   Track what team actually delivers
   Use historical data for prediction
   More accurate than guessing

5. Reframe the question
   Not: "When will this be done?"
   But: "What can we learn in 2 weeks?"
         "What's the smallest valuable increment?"

ESTIMATE COMMUNICATION:
"Based on what we know now, 2-4 weeks."
"We'll know more after the spike."
"If scope changes, timeline changes."
Never: "It will definitely be done by X."
```

---

## 7. The Consensus Trap

**Severity:** High
**Situation:** Waiting for everyone to agree before deciding
**Why Dangerous:** You never decide, or you decide on the safest (worst) option.

```
THE TRAP:
Meeting 1: Present idea
- "Let me think about it"
- "Have you considered..."
- "We should involve..."

Meeting 2: More discussion
- "I'm not sure about..."
- "What if we also..."
- Action: More meetings

Meeting 7: Compromise
- Original idea: Killed
- Result: Watered-down version everyone tolerates
- No one loves it

THE REALITY:
Consensus is not agreement—it's the absence of objection.
Great products require conviction, not consensus.
Someone has to decide.

THE FIX:
1. Clear decision-maker
   Whose call is this? (State it upfront)
   RACI: Responsible, Accountable, Consulted, Informed
   Consult ≠ Veto

2. Disagree and commit
   Make the decision
   Let objections be recorded
   Move forward together

3. Time-box decisions
   "We're deciding this by Friday"
   Deadline forces clarity
   No decision = a decision (usually bad)

4. One-way vs two-way doors
   Two-way (reversible): Decide fast
   One-way (irreversible): Deliberate
   Most decisions are two-way

DECISION FRAMEWORK:
1. Gather input (time-boxed)
2. Decision-maker decides
3. Communicate reasoning
4. Move forward (even with disagreement)
5. Revisit if data proves wrong

MEETING TEST:
"This meeting is to decide, not discuss."
State it at the start.
```

---

## 8. The Feature Factory

**Severity:** Critical
**Situation:** Shipping features without measuring their impact
**Why Dangerous:** You never learn what works.

```
THE TRAP:
Q1: Shipped 12 features
Q2: Shipped 15 features
Q3: Shipped 18 features

Impact: Unknown
Learnings: None
Product: Bloated mess

"But look how productive we are!"

THE REALITY:
Features are not progress—outcomes are.
Shipping without measuring is guessing.
Most features don't move the needle.

THE FIX:
1. Every feature has a hypothesis
   "We believe [feature] will [outcome] for [users]"
   Measurable outcome, specific users

2. Every feature has success criteria
   Launch: How we'll measure success
   4 weeks later: Was it successful?
   No measure = no learning

3. Kill non-performers
   Feature shipped, no impact → Remove it
   Reduces complexity
   Frees up space for what works

4. Slow down shipping, speed up learning
   Fewer features, better instrumented
   More experiments, more data
   Quality over quantity

FEATURE LIFECYCLE:
1. Hypothesis (what we believe)
2. Success criteria (how we'll know)
3. Build (minimum to test)
4. Measure (did it work?)
5. Decide (keep, iterate, kill)

FEATURE FACTORY SYMPTOMS:
- No time for discovery
- Shipped features never measured
- Backlog only grows
- "When do we get to the good stuff?"
```

---

## 9. The Scope Creep Monster

**Severity:** High
**Situation:** Scope constantly expanding during development
**Why Dangerous:** Projects never ship, or ship late and bloated.

```
THE TRAP:
Original scope: Login page
During build:
- "Add social login"
- "What about SSO?"
- "We need password strength meter"
- "Add biometrics"
- "What about MFA?"

Original timeline: 2 weeks
Actual timeline: 3 months

THE REALITY:
Scope creep feels like improvement.
It's actually failure to prioritize.
Each addition has hidden cost.

THE FIX:
1. V1 mindset
   What's the smallest thing that's useful?
   Ship it, then improve
   V1 is launch, not final

2. Explicit scope document
   In scope: [List]
   Out of scope: [Also list]
   Add to "V2 ideas" not current build

3. Trade-offs, not additions
   "We can add X if we remove Y"
   Fixed time, flexible scope
   Or: Fixed scope, flexible time (pick one)

4. Build pressure relief
   "Fast follow" list
   Week after launch, address quick wins
   Takes pressure off V1

5. Scope review ritual
   Every week: Is scope still right?
   What's trying to creep in?
   Defend the line

SCOPE DEFENSE:
"Great idea for V2!"
"What would we cut to add this?"
"Let's see if users actually need it first."
"That's a different project."
```

---

## 10. The User Research Vacuum

**Severity:** Critical
**Situation:** Building based on assumptions instead of user evidence
**Why Dangerous:** You build for imaginary users.

```
THE TRAP:
PM: "Users want this"
Interviewer: "How do you know?"
PM: "It's obvious"
     "I would want it"
     "The CEO said so"
     "Competitor has it"

Evidence: None

THE REALITY:
You are not your user.
Your intuition is built on your experience.
Users are surprising—that's the point.

THE FIX:
1. Continuous discovery
   Talk to users every week
   Not a phase—a habit
   Doesn't have to be formal

2. Multiple evidence types
   Quantitative: Usage data, surveys
   Qualitative: Interviews, observation
   Behavioral: What they do, not say

3. Problem interviews, not solution interviews
   "Tell me about last time you..."
   Not: "Would you use feature X?"

4. Jobs-to-be-done
   What job is the user trying to do?
   What makes it hard?
   What would make it easier?

5. Kill assumptions explicitly
   List assumptions behind the feature
   Which are validated? Which are risks?
   Validate the risky ones

USER RESEARCH MINIMUM:
- 5 user conversations per week
- Data review every sprint
- Persona validation quarterly
- Usability testing before launch

ASSUMPTION LOG:
For every major decision:
"We believe [X] because [evidence]"
No evidence = needs research
```

---

## 11. The Launch and Forget

**Severity:** High
**Situation:** Shipping features and immediately moving to the next thing
**Why Dangerous:** You never improve what's shipped.

```
THE TRAP:
Sprint 1: Build feature A
Sprint 2: Build feature B
Sprint 3: Build feature C

Feature A problems:
- "We'll fix it later"
- "We're focused on new stuff"
- Later never comes

Feature A: Abandoned, broken, useless

THE REALITY:
Launch is the beginning, not the end.
Real product work is iteration.
The first version is rarely right.

THE FIX:
1. Post-launch review
   2-4 weeks after launch: How's it doing?
   What's working? What's not?
   What did we learn?

2. Iteration budget
   20-30% of capacity for improving existing
   Not just bugs—actual improvement
   Protect this time

3. Feature owner mindset
   Someone owns each feature
   Responsible for its success
   Advocates for improvements

4. Kill features
   If it's not working, remove it
   Less is more
   Dead features hurt the product

LAUNCH CHECKLIST:
□ Success metrics defined
□ Instrumentation in place
□ 2-week review scheduled
□ Feedback channel ready
□ Kill criteria defined

POST-LAUNCH:
Week 2: Check metrics, quick fixes
Week 4: Full review, iterate or kill
Ongoing: Monitor and maintain
```

---

## 12. The Stakeholder Surprise

**Severity:** High
**Situation:** Surprising stakeholders with decisions at the last minute
**Why Dangerous:** Kills trust, invites micro-management, slows you down.

```
THE TRAP:
PM: *Works heads down for 2 months*
Launch day presentation:
Stakeholders: "Why wasn't I consulted?"
              "This isn't what I expected"
              "We need to go back to the drawing board"

All work: Wasted
Trust: Broken
Future: Micro-management

THE REALITY:
Stakeholder surprises create stakeholder anxiety.
Anxiety creates control.
Control slows everything down.

THE FIX:
1. Early and ugly
   Share early, when it's rough
   "Here's our thinking, what are we missing?"
   Ugly prototypes prevent polished surprises

2. Regular updates
   Weekly status (async is fine)
   What we did, what we learned, what's next
   No news is not good news

3. Explicit decision points
   "We're deciding X next week"
   "Here are the options"
   "Here's our recommendation"

4. Disagree before, commit after
   Get disagreement out early
   Once decided, move forward together

5. No launch day surprises
   Everyone's seen it
   Everyone's been heard
   Launch is execution, not reveal

STAKEHOLDER CADENCE:
Weekly: Async status update
Bi-weekly: Key decision review
Monthly: Full roadmap review
Before launch: Demo and sign-off

SURPRISE PREVENTION:
"You're going to see this eventually"
"See it now, when we can still change it"
```
