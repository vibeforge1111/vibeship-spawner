# Anti-Patterns: Code Review

Approaches that seem like good reviewing but damage code quality and team culture.

---

## Anti-Pattern 1: The Perfectionist Reviewer

**What It Looks Like:**
"I hold code to the highest standards. I don't approve until it's perfect."

**Why It Seems Right:**
- High quality code
- Maintains standards
- Shows rigor

**Why It Fails:**
```
THE PATTERN:
Every PR gets 20+ comments.
Multiple rounds of review.
Nothing merges quickly.
"Standards are important!"

THE REALITY:
Perfect is the enemy of shipped.
Code never reaches production.
Authors burn out.
Progress stops.

SYMPTOMS:
- Average 5+ review cycles per PR
- PRs open for weeks
- Authors dread your reviews
- Velocity is zero

EXAMPLE:
PR: Add loading spinner to button

Reviewer requests:
1. Extract to reusable component
2. Add animation customization
3. Handle 47 edge cases
4. 100% test coverage
5. Add Storybook stories
6. Update design system docs
7. Add accessibility tests
8. Support RTL languages

Original task: Show spinner during load

WHY IT HAPPENS:
- Perfectionism feels virtuous
- Easier to criticize than approve
- Fear of "bad code" on your watch

THE FIX:
- Set a "good enough" bar
- Approve with comments for improvements
- Ask "Will this work?" not "Is this perfect?"
- Create follow-up tickets for nice-to-haves
- Time-box review cycles

RULE:
If it works, has tests, and follows standards:
Approve. Ship. Iterate.

Iteration beats perfection.
```

---

## Anti-Pattern 2: The Comment Count Achiever

**What It Looks Like:**
"I leave thorough feedback. Every PR gets detailed comments."

**Why It Seems Right:**
- Shows engagement
- Comprehensive review
- Value demonstrated

**Why It Fails:**
```
THE PATTERN:
Review metric: Comments per PR.
More comments = better review.
Every PR gets 15+ comments.

THE REALITY:
Comment count ≠ review quality.
Most comments are noise.
Signal buried in volume.
Authors overwhelmed.

SYMPTOMS:
- Comments on every line
- Trivial observations dominate
- Important issues lost in noise
- Authors stop reading carefully

EXAMPLE:
PR with 50 lines of code
Review: 35 comments

Comment types:
- 20x "Consider different name"
- 10x "Could use different approach"
- 4x "Style preference"
- 1x "This has a security issue"

Security issue buried at comment #27.

WHY IT HAPPENS:
- Quantity is measurable
- Quality is subjective
- More feels like more value
- Performance pressure

THE FIX:
- Quality > quantity
- Limit to important issues
- Use PR-level summary
- Prioritize by impact
- Batch minor issues: "Minor nits: ..."

METRIC THAT MATTERS:
- Bugs caught pre-merge
- Time to merge
- Author satisfaction
- Code quality over time

NOT:
- Comment count
- Lines reviewed
- Review frequency
```

---

## Anti-Pattern 3: The Async-Only Absolutist

**What It Looks Like:**
"All review should be async. Meetings are waste."

**Why It Seems Right:**
- Respects everyone's time
- Documented in PR
- Works across timezones
- No meeting overhead

**Why It Fails:**
```
THE PATTERN:
Every review is comment-only.
No calls, no pairing.
"Let's keep it async."

THE REALITY:
Complex discussions take forever.
Nuance lost in text.
Back-and-forth multiplies.
Simple issues become conflicts.

EXAMPLE:
Comment 1: "Why this approach?"
Response: "Because X"
Comment 2: "But what about Y?"
Response: "Y doesn't apply because Z"
Comment 3: "Can you explain Z?"
Response: "Z is when..."
Comment 4: "I still don't understand"

5 days of back-and-forth.
10-minute call would resolve it.

SYMPTOMS:
- Long PR discussion threads
- Same topics revisited
- Misunderstandings persist
- Weeks to merge simple PRs

WHY IT HAPPENS:
- Meetings have bad reputation
- Async is the default
- Feels more "efficient"
- Introversion preference

THE FIX:
- Know when to switch modes
- Complex topic? Quick call.
- 3+ back-and-forth = call time
- Document outcome in PR
- Async for simple, sync for complex

RULES:
Async for:
- Clear issues with obvious fixes
- Style suggestions
- Simple questions

Sync for:
- Design disagreements
- Complex explanations
- Repeated misunderstanding
- Significant changes
```

---

## Anti-Pattern 4: The Approval-Seeker Reviewer

**What It Looks Like:**
"I want to give helpful feedback that gets accepted."

**Why It Seems Right:**
- Collaborative approach
- Not confrontational
- Team harmony

**Why It Fails:**
```
THE PATTERN:
Soften all feedback.
Avoid blocking.
Don't want to upset anyone.
"It's fine if you disagree..."

THE REALITY:
Real issues get missed.
Problems ship to production.
Standards erode.
Reviews become meaningless.

EXAMPLES:
"I think there might possibly be an
issue here, but feel free to ignore
if you disagree."
(It's a security vulnerability)

"You could maybe consider a test
if you have time, but no pressure."
(There are no tests at all)

"This is just my opinion, but maybe
error handling would be nice."
(Errors crash the app)

SYMPTOMS:
- Issues ship despite review
- "Reviewed" but bugs still found
- Approval means nothing
- No one trusts reviews

WHY IT HAPPENS:
- Conflict avoidance
- Want to be liked
- Don't trust own judgment
- Fear of being wrong

THE FIX:
- Trust your expertise
- Blocking issues are blocking
- Be direct, not mean
- Use tiered comment system
- Separate preference from requirement

EXAMPLE FIX:
Instead of:
"Maybe consider security, if you have time?"

Use:
"🔴 BLOCKER: This endpoint has no
auth check. Anyone can access user data.
Must add authentication before merge."

Direct ≠ mean.
Clarity helps everyone.
```

---

## Anti-Pattern 5: The Codebase Historian

**What It Looks Like:**
"I know this codebase inside out. I'll share all that context."

**Why It Seems Right:**
- Knowledge sharing
- Historical context
- Prevent past mistakes

**Why It Fails:**
```
THE PATTERN:
Every PR gets a history lesson.
"Back in 2019, we tried..."
"Let me explain the entire module..."
"Here's context you didn't ask for..."

THE REALITY:
Irrelevant history slows reviews.
Author drowns in context.
Review becomes lecture.
Focus lost.

EXAMPLE:
PR: Fix typo in error message

Review:
"Ah, this error handler. In 2018, we
had a major incident where errors weren't
being logged properly. We decided to add
this abstraction layer because of the
distributed nature of our system. The
original author left in 2020, but I
remember the design meetings where we
debated synchronous vs async error
handling. There's actually a document
somewhere about this..."

(750 words later, no feedback on the PR)

SYMPTOMS:
- Reviews become monologues
- Simple PRs take days
- Authors stop reading
- Relevant feedback buried

WHY IT HAPPENS:
- Institutional knowledge is valuable
- Want to share expertise
- Like explaining things
- Lost sight of review purpose

THE FIX:
- Context that affects THIS PR only
- Link to docs for background
- Offer discussion separately
- Focus on the code changes
- Brief context when relevant

RELEVANT CONTEXT:
"Note: This error handler has some
quirks. See the gotchas doc here: [link]
Your change looks fine."

NOT:
"Let me tell you the entire history of
error handling at this company..."
```

---

## Anti-Pattern 6: The Merge Blocker Collector

**What It Looks Like:**
"I found issues, so I should request changes."

**Why It Seems Right:**
- Issues found = changes needed
- Thorough review
- Quality gate

**Why It Fails:**
```
THE PATTERN:
Any issue → Request changes.
15 nits? Request changes.
One typo? Request changes.
Everything blocks merge.

THE REALITY:
Not all issues are blocking.
Request Changes should be rare.
Overuse dilutes meaning.
Authors can't triage.

GITHUB REVIEW STATES:
Comment: "I have thoughts, not blocking"
Approve: "Good to merge"
Request Changes: "Don't merge until fixed"

WHEN TO USE:
Comment: Most feedback
Approve: Ready to ship
Request Changes: Dangerous to merge as-is

EXAMPLE OF MISUSE:
PR: Add new feature (works, tested)

Feedback:
- 3 naming suggestions
- 2 style preferences
- 1 possible optimization

Reviewer: *Request Changes*

"I found issues!"

But: None are blocking.
Should be: Approve with comments.

SYMPTOMS:
- Request Changes on every PR
- Authors always blocked
- No clear severity signal
- "Changes" feels punitive

THE FIX:
Request Changes ONLY for:
- Will break production
- Security vulnerabilities
- Missing required tests
- Violates critical standards

Everything else:
- Approve with comments
- Suggestions marked as optional
- Trust author to address or not

RULE:
"Would I block a release for this?"
No? Then don't block the PR.
```

---

## Anti-Pattern 7: The Style Enforcer

**What It Looks Like:**
"Consistent style is important. I enforce our conventions."

**Why It Seems Right:**
- Consistency matters
- Standards exist
- Clean codebase

**Why It Fails:**
```
THE PATTERN:
Human reviews for style.
Comment on every formatting issue.
Enforce via review comments.
"Use spaces not tabs..."

THE REALITY:
Machines should check style.
Human review is expensive.
Style debates waste time.
Automation exists for this.

EXAMPLE:
PR Review comments:
- Line 12: trailing whitespace
- Line 18: use single quotes
- Line 23: missing semicolon
- Line 31: 2 space indent
- Line 45: line too long
... 40 more style comments

Author: "Why doesn't the linter catch this?"
Reviewer: "We don't have one configured."

3 hours of manual style review.
1 hour to configure ESLint.
Which is the better investment?

SYMPTOMS:
- Reviews dominated by style
- Same style comments repeatedly
- No linter/formatter configured
- Human doing machine work

WHY IT HAPPENS:
- Style issues are easy to spot
- Feels productive
- Tools not set up
- "It's not my job to set up tools"

THE FIX:
1. Configure linter (ESLint, Prettier)
2. Run in CI
3. Auto-format on commit
4. Style issues = tool failure
5. Never manually review style

IF YOU'RE COMMENTING ON STYLE:
Stop. Go configure a tool.
That comment will become obsolete.
The tool won't.

ACCEPTABLE STYLE COMMENTS:
"Can we add this rule to ESLint?"
(Improve the tool)

"Linter allows this but I think we
should discuss as a team"
(Standards discussion)
```

---

## Anti-Pattern 8: The Ghost Commenter

**What It Looks Like:**
"I left my feedback. My job is done."

**Why It Seems Right:**
- Review complete
- Comments are clear
- Author can proceed

**Why It Fails:**
```
THE PATTERN:
Leave comments.
Move on to other work.
Never check back.
No follow-up.

THE REALITY:
Review is conversation.
Comments need resolution.
One-way feedback doesn't help.
PR rots in limbo.

EXAMPLE:
Day 1: Reviewer leaves 5 comments
Day 2: Author addresses 4, asks question on 1
Day 3: *silence*
Day 4: *silence*
Day 5: Author pings reviewer
Day 6: "Oh sorry, busy. Let me look."
Day 7: Reviewer leaves new comments
Day 8: *silence*
...

2-week PR cycle.
Could be 2 days with engagement.

SYMPTOMS:
- PRs open for days/weeks
- Authors chasing reviewers
- "Did you see my response?"
- Context lost by time reviewer returns

WHY IT HAPPENS:
- Comments = done feeling
- Other work takes priority
- No follow-up system
- Review not prioritized

THE FIX:
1. Review is not done until merged
   Initial review → Follow-up → Approve

2. Set follow-up expectations
   "I'll check back tomorrow for your response"

3. Prioritize review queue
   In-progress PRs before new work

4. Use review reminders
   GitHub notifications, Slack alerts

5. Own the review to completion
   You started it, you finish it

REVIEW COMPLETE WHEN:
- All comments resolved
- All discussions concluded
- PR merged or closed

NOT WHEN:
- Comments left
- "Ball in their court"
```

---

## Anti-Pattern 9: The "I Would Have" Reviewer

**What It Looks Like:**
"This works, but here's how I would have done it."

**Why It Seems Right:**
- Sharing experience
- Alternative approaches
- Teaching opportunity

**Why It Fails:**
```
THE PATTERN:
Every PR gets alternatives.
"I would have used X instead of Y."
"When I built Z, I did it this way..."
"Have you considered my approach?"

THE REALITY:
Working code shouldn't be rewritten
for reviewer preference.
Multiple valid approaches exist.
Your way isn't the only way.

EXAMPLE:
PR: Add user search feature (works, tested)

Reviewer:
"I would have used a different ORM method"
"I prefer Redux over Context for this"
"I would have named this differently"
"I would have structured the files like..."
"When I did this last year..."

Code works. Tests pass.
But reviewer wants it their way.

SYMPTOMS:
- "This works, but..." feedback
- Constant rewrites
- Authors feel controlled
- One "correct" way enforced

WHY IT HAPPENS:
- Ego in code style
- Preference confused with requirement
- Desire to teach
- Habit from past experience

THE FIX:
Ask yourself:
1. Does it work? → If no, that's the issue
2. Does it follow standards? → If no, cite standard
3. Is it maintainable? → If no, explain why
4. Is it secure? → If no, explain risk

If yes to all: Approve.

VALID ALTERNATIVE SUGGESTIONS:
"This works. FYI, there's also [X]
approach if you want to explore.
Not blocking, just sharing."

NOT:
"I would have done it differently.
Please rewrite to my preference."

RULE:
Working code > your preferences.
Standards > your preferences.
Your preferences are just preferences.
```

---

## Anti-Pattern 10: The Checkbox Reviewer

**What It Looks Like:**
"I go through our review checklist every time."

**Why It Seems Right:**
- Consistent process
- Nothing missed
- Thorough approach

**Why It Fails:**
```
THE PATTERN:
Checklist is the review.
Check boxes, approve.
No thinking beyond list.
"Checklist complete!"

THE REALITY:
Checklists catch common issues.
They don't catch everything.
Thinking is required.
Novel problems exist.

EXAMPLE:
Checklist:
☑ Tests exist
☑ No console.logs
☑ Types correct
☑ No hardcoded values
☑ Linting passes

APPROVED!

What checklist missed:
- Logic error in business rules
- Race condition in async code
- N+1 query in loop
- Missing authorization check
- Poor algorithm choice

SYMPTOMS:
- Bugs pass despite review
- Novel issues never caught
- Review is mechanical
- Checklist is ceiling, not floor

WHY IT HAPPENS:
- Checklists feel complete
- Thinking is hard
- Process substitutes for judgment
- Safety in following process

THE FIX:
Checklist = minimum, not maximum.

AFTER checklist:
- Do I understand what this does?
- Does the logic make sense?
- What could go wrong?
- Is this the right approach?
- What would break this?

CHECKLIST USE:
- Before deep review (catch basics)
- As reminder (don't forget X)
- For consistency (same bar)

NOT:
- Replacement for thinking
- Complete review criteria
- Excuse to not understand code

RULE:
Checklist catches known issues.
Thinking catches unknown issues.
You need both.
```

---

## Anti-Pattern 11: The Silent Approver

**What It Looks Like:**
"LGTM" (no comments, no context)

**Why It Seems Right:**
- Code is good
- No issues found
- Quick turnaround

**Why It Fails:**
```
THE PATTERN:
Review PR.
No comments.
"LGTM" ✓ Approved

THE REALITY:
No comments = did you review?
No comments = no teaching
No comments = no recognition
Authors doubt you read it.

EXAMPLE:
Junior engineer's first major PR.
200 lines of careful code.
First time using new pattern.

Review: "LGTM"

Junior thinking:
- Did they actually read it?
- Is my approach good or just acceptable?
- Did I do the pattern right?
- No feedback = no learning

SYMPTOMS:
- Authors don't know if reviewed
- No positive reinforcement
- No learning opportunity
- Trust erodes

WHY IT HAPPENS:
- Efficiency pressure
- Code was good
- Nothing to critique
- Positive feedback feels unnecessary

THE FIX:
Even when approving, comment:

MINIMAL:
"Reviewed the auth changes. Logic is
clean, tests cover the cases. LGTM."

BETTER:
"Nice work on the error handling.
The retry logic is solid. One thing
I learned: the backoff pattern you
used is cleaner than what I've done.
Approved!"

GOOD APPROVALS INCLUDE:
- Confirmation you read it
- What worked well
- Anything you learned
- Questions for your learning

"LGTM" ALTERNATIVES:
- "Clean implementation, well tested"
- "Good use of X pattern here"
- "Reviewed, logic is sound"
- "Looks good. I like the approach to Y."

RULE:
Good code deserves recognition.
Positive feedback is feedback.
Authors need to know you engaged.
```

---

## Anti-Pattern 12: The Pre-Commit Reviewer

**What It Looks Like:**
"Let me see your code before you make the PR."

**Why It Seems Right:**
- Catch issues early
- Save time later
- Help junior devs

**Why It Fails:**
```
THE PATTERN:
Review work-in-progress.
Comment before PR exists.
"Show me before you submit."
Informal review replaces formal.

THE REALITY:
No documentation of review.
No record of discussion.
Duplicated effort when PR happens.
Process bypassed.

EXAMPLE:
"Let me look at your branch..."
*Reviews locally*
"Looks good, make the PR"

PR created, new reviewer assigned.
No record of first review.
Second reviewer finds same issues.
"Why didn't review catch this?"

First review: Undocumented, informal.
No one knows it happened.

SYMPTOMS:
- Informal reviews before PRs
- Real PRs rubber-stamped
- No audit trail
- Review duplication

WHY IT HAPPENS:
- Want to help early
- Informal feels friendly
- Process feels slow
- Just being helpful

THE FIX:
1. Review in the PR
   Discussion is documented
   History is preserved
   Process is followed

2. Use draft PRs for early feedback
   GitHub: Draft PR
   Author gets feedback
   Conversation in one place

3. If informal review needed:
   Document it in PR later
   "Pre-reviewed with @person, changes
   already incorporated."

4. Pair programming is different
   That's collaboration, not review
   Still needs formal review after

WHEN INFORMAL IS OK:
- Pairing (collaboration)
- Quick question ("will X work?")
- Architecture discussion

ALWAYS FORMAL:
- Anything that will be merged
- Security-sensitive code
- Production deployments
```
