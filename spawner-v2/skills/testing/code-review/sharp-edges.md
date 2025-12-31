# Sharp Edges: Code Review

Critical mistakes that turn code review from a force multiplier into a team destroyer.

---

## 1. The Drive-By Rejection

**Severity:** Critical
**Situation:** Reviewer leaves "Needs work" without actionable feedback
**Why Dangerous:** Author has no idea what to fix. Review becomes a guessing game.

```
THE TRAP:
PR submitted: 500 lines of feature code

Review comment:
"This doesn't look right. Please fix."

Author thinking:
- What doesn't look right?
- Which file? Which line?
- Is it naming? Logic? Architecture?
- Am I supposed to read their mind?

Result:
Author guesses, makes random changes.
Reviewer still unhappy.
Cycle repeats.
Resentment builds.

THE REALITY:
Unhelpful feedback is worse than no feedback.
It blocks the author without helping them.
It wastes everyone's time.

THE FIX:
1. Every comment must be actionable
   ✗ "This is confusing"
   ✓ "Consider renaming 'data' to 'userData'
      to clarify what this contains"

2. Point to specific lines
   ✗ "The error handling needs work"
   ✓ "Line 45: This catch block swallows
      the error. Consider logging it."

3. Explain why, not just what
   ✗ "Use const instead of let"
   ✓ "Use const here—the value is never
      reassigned, and const signals intent"

4. If you can't articulate the issue,
   maybe there isn't one
   "This feels off" = needs more thinking

ACTIONABLE FEEDBACK TEMPLATE:
What: [Specific line/file]
Why: [The problem this causes]
How: [Suggested fix or direction]
```

---

## 2. The Rubber Stamp

**Severity:** Critical
**Situation:** Approving PRs without actually reading the code
**Why Dangerous:** Bugs ship. Standards erode. Reviews become meaningless.

```
THE TRAP:
Monday morning, 15 PRs in queue.
"I trust the team, they know what they're doing."

*Clicks approve on each*
*Doesn't read any*

Result:
- Security vulnerability shipped
- Breaking change not caught
- Technical debt accumulates
- Team learns reviews don't matter

THE REALITY:
Every approval is a promise:
"I reviewed this and it's ready."

If you didn't review, don't approve.
Your approval means something.

THE FIX:
1. Actually read the diff
   Every file, every line.
   If PR is too big, request split.

2. Run the code (when appropriate)
   Checkout the branch
   Test the feature manually
   Verify it works as described

3. Ask questions if unclear
   "How does this handle X case?"
   Shows you read it.

4. If you don't have time, say so
   "I can't review this properly right now.
   Can someone else take it, or can I
   look tomorrow?"

5. Use review checklists
   Security? Performance? Tests?
   Don't rely on memory.

APPROVAL MEANS:
- I read and understood the code
- I believe it does what it claims
- I would maintain this code
- I'm comfortable if this ships

If any are false, don't approve.
```

---

## 3. The Nitpick Storm

**Severity:** High
**Situation:** Overwhelming PRs with minor style comments while missing real issues
**Why Dangerous:** Author drowns in trivia, real problems slip through.

```
THE TRAP:
PR Review:
- Line 5: "Missing trailing comma"
- Line 12: "Extra blank line"
- Line 18: "Inconsistent quotes"
- Line 24: "This could be more concise"
- Line 31: "Different naming convention"
... 47 more similar comments

Meanwhile:
- SQL injection vulnerability: not mentioned
- Missing error handling: not mentioned
- Breaking API change: not mentioned

"I gave thorough feedback!"

THE REALITY:
Nitpicks are noise.
Noise hides signal.
Important issues get lost.

THE FIX:
1. Automate style checking
   ESLint, Prettier, rubocop
   Don't manually enforce what tools catch

2. Label nitpicks as nitpicks
   "nit: trailing comma"
   Author knows it's low priority

3. Separate blocking from non-blocking
   BLOCKING: "This will crash in production"
   NON-BLOCKING: "Consider a clearer name"

4. Limit nitpicks per review
   Max 2-3 style comments per PR
   More than that = tooling problem

5. Prioritize your comments
   Lead with critical issues
   Bury nitpicks at the end
   Or batch them: "Minor style notes: ..."

COMMENT HIERARCHY:
1. Security issues (must fix)
2. Bugs (must fix)
3. Design problems (should discuss)
4. Performance (should fix)
5. Clarity (could improve)
6. Style (nit)

Comment accordingly.
```

---

## 4. The Personal Attack

**Severity:** Critical
**Situation:** Criticizing the author instead of the code
**Why Dangerous:** Destroys trust, psychological safety, and team culture.

```
THE TRAP:
Code review comment:
"Did you even think about this?"
"This is obviously wrong."
"Why would you do it this way?"
"I thought you knew better."

Impact on author:
- Feels attacked
- Defensive response
- Stops asking for feedback
- Hides mistakes
- Leaves the team

THE REALITY:
You're reviewing code, not the person.
Smart people write bad code sometimes.
The goal is better code, not punishment.

THE FIX:
1. Review the code, not the coder
   ✗ "You always do this wrong"
   ✓ "This pattern has issues because..."

2. Use "we" language
   ✗ "Your code is inefficient"
   ✓ "We could optimize this by..."

3. Assume good intent
   ✗ "Why didn't you handle this?"
   ✓ "Did we consider the X case here?"

4. Ask questions, don't accuse
   ✗ "This will break everything"
   ✓ "What happens if X is null?"

5. Remember the human
   Screen has a person behind it
   Same team, same goals

TOXIC PATTERNS TO AVOID:
- Sarcasm
- "Obviously" / "Clearly"
- Question marks as accusations
- Comparing to other developers
- Bringing up past mistakes

CONSTRUCTIVE PATTERNS:
- "I think..." / "I wonder..."
- "Have we considered..."
- "One option might be..."
- "I'd suggest..."
```

---

## 5. The Scope Creep Demand

**Severity:** High
**Situation:** Requesting changes unrelated to the PR's purpose
**Why Dangerous:** PRs never merge, authors burn out, momentum dies.

```
THE TRAP:
PR: "Fix login button alignment"
- Fixes the CSS for button alignment
- 10 lines changed

Review:
"While you're in here, can you also:
- Refactor the auth component
- Add unit tests for everything
- Update the API client
- Implement dark mode support"

Author: "...that's not what this PR is about"
Reviewer: "But it's all related!"

PR sits open for 3 weeks.

THE REALITY:
PRs should do one thing.
Scope creep kills velocity.
Every addition adds merge risk.

THE FIX:
1. Evaluate against stated purpose
   Does PR do what it claims?
   If yes, that's enough.

2. Create follow-up issues
   "This is fine as-is. Created
   issue #456 for the refactoring."

3. Separate "must have" from "nice to have"
   Must have: Works correctly
   Nice to have: File issue for later

4. Resist "while you're in here"
   Different concerns = different PRs
   Cleaner history, easier reverts

5. Time-box related improvements
   "If you have 15 min, X would be nice.
   Otherwise, this is good to merge."

SCOPE CHECK:
Original PR scope: [X]
Requested addition: [Y]

Is Y required for X to work?
No → Separate issue
Yes → Reasonable request

"Leave the campsite cleaner" doesn't
mean "rebuild the entire campground."
```

---

## 6. The Knowledge Gatekeeper

**Severity:** High
**Situation:** Using review to prove superiority rather than improve code
**Why Dangerous:** Juniors stop learning, knowledge silos, toxic culture.

```
THE TRAP:
Junior engineer's PR:

Reviewer:
"Actually, you should use the Strategy
pattern here with dependency injection,
implementing the abstract factory principle..."

Junior: "What?"

Reviewer sends 15 links to design patterns.
Doesn't explain why they matter here.
Doesn't offer to help.

Junior rewrites code 5 times.
Still doesn't understand why.
Eventually gives up.

THE REALITY:
Code review is teaching, not testing.
The goal is shared understanding.
If they don't learn, you failed.

THE FIX:
1. Explain at their level
   Meet them where they are
   Build up from their understanding

2. Link to learning resources
   "Here's a good explanation: [link]
   Happy to pair on this if helpful."

3. Offer to discuss
   "This is a complex area. Want to
   jump on a call to walk through it?"

4. Choose battles wisely
   Not every PR needs architecture lessons
   Focus on what matters for this change

5. Celebrate learning
   "Great use of X pattern!"
   Positive reinforcement works.

TEACHING FRAMEWORK:
1. What's the issue? (specific)
2. Why does it matter? (impact)
3. What's better? (alternative)
4. How to learn more? (resources)
5. Need help? (offer)

Goal: They can explain this to
the next person.
```

---

## 7. The Premature Approve

**Severity:** High
**Situation:** Approving before CI passes or discussions resolve
**Why Dangerous:** Broken code merges, discussions cut short.

```
THE TRAP:
PR has:
- 3 open discussion threads
- Failing CI pipeline
- No tests for new code

Reviewer:
"Code looks good! Approved."
*Author merges immediately*

Result:
- CI failures now in main
- Discussions never resolved
- Missing tests forgotten
- Technical debt added

THE REALITY:
Approval signals "ready to merge."
If it's not ready, don't approve.

THE FIX:
1. Wait for CI to pass
   Green pipeline = prerequisite
   Don't approve red builds

2. Resolve all threads
   Every discussion should conclude
   "Resolved" or "Won't fix" with reason

3. Verify test coverage
   New code needs new tests
   No tests = not done

4. Use "Approve with comments"
   "LGTM after CI passes"
   "Approve pending test addition"

5. Check merge requirements
   Does your team require:
   - X approvals?
   - Passing CI?
   - Test coverage threshold?
   Don't circumvent them.

APPROVAL CHECKLIST:
□ CI pipeline green
□ All discussions resolved
□ Tests exist for new code
□ Documentation updated if needed
□ No security concerns
□ I would maintain this code

All checked? Then approve.
```

---

## 8. The Asynch-Hole

**Severity:** High
**Situation:** Leaving reviews that require back-and-forth when synchronous would be faster
**Why Dangerous:** Days of comments when 10-minute call would resolve it.

```
THE TRAP:
PR Comment 1: "Not sure about this approach"
Response: "Why not?"
Comment 2: "Well, because X"
Response: "But what about Y?"
Comment 3: "Y doesn't apply because..."
Response: "Can you explain?"
...

3 days of back-and-forth
Could have been 10-minute conversation

THE REALITY:
Async is great for clear feedback.
Async is terrible for complex discussion.
Know when to switch modes.

THE FIX:
1. Recognize complex discussions early
   Multiple valid approaches?
   Architecture decisions?
   → Needs real-time discussion

2. Suggest synchronous when needed
   "This is getting complex. Can we
   do a quick call to align?"

3. Document outcomes
   After call, update PR:
   "Discussed with @reviewer. Agreed
   to approach X because Y."

4. Set timeboxes for async
   If not resolved in 2 round-trips,
   escalate to meeting.

5. Share screen, don't describe
   "Look at line 45..." → Share screen
   Visual is faster than text

ASYNC VS SYNC:
ASYNC (comments):
- Clear issues with obvious fixes
- Style and naming suggestions
- Documentation requests

SYNC (call):
- Design disagreements
- Multiple valid approaches
- Complex explanations
- Repeated back-and-forth
```

---

## 9. The Context Ignorer

**Severity:** High
**Situation:** Reviewing code without understanding the problem it solves
**Why Dangerous:** Wrong feedback, missed issues, frustrated authors.

```
THE TRAP:
PR: "Implement user search feature"

Reviewer (didn't read description):
"Why are you using ElasticSearch here?
Just use a database query."

Author:
"Because we need fuzzy matching,
faceted search, and sub-100ms response
times across 10M records. It's in the
description."

Reviewer: "Oh."

THE REALITY:
Code without context is meaningless.
The "right" solution depends on requirements.
Read the PR description first.

THE FIX:
1. Read description before code
   What problem does this solve?
   What approach was chosen?
   What alternatives were considered?

2. Understand requirements
   What are the constraints?
   Performance needs?
   Scale expectations?

3. Check linked issues/tickets
   Original requirements
   Discussion history
   Design decisions

4. Ask for context if missing
   "Can you add context about why
   this approach was chosen?"

5. Review against requirements
   Does it solve the stated problem?
   Not "is this how I'd do it?"

CONTEXT CHECKLIST:
□ Read PR description
□ Understand problem being solved
□ Check linked issues
□ Know constraints/requirements
□ Understand chosen approach reasoning

THEN review the code.
```

---

## 10. The Ghost Reviewer

**Severity:** High
**Situation:** Assigned as reviewer but never responds
**Why Dangerous:** PRs age, authors blocked, resentment builds.

```
THE TRAP:
PR assigned Tuesday.
Ping Thursday: "Hey, any update?"
Ping Monday: "Still waiting..."
Ping next Thursday: "?"

Two weeks later:
"Oh sorry, been busy. Looking now."

*Requests major changes*

Author: Has already moved on to other work

THE REALITY:
Review delay is team delay.
Author is blocked.
Context is lost.
Momentum dies.

THE FIX:
1. Set review SLAs
   Review within 24 hours (business)
   Or explicitly decline

2. If too busy, say so immediately
   "Can't review this week.
   Please reassign to @other"

3. Partial reviews > no reviews
   "Looked at auth changes (LGTM).
   Will review API changes tomorrow."

4. Use review request properly
   Don't accept if you can't do it
   Reassign quickly if blocked

5. Automate reminders
   PR older than 24h → Slack reminder
   Make aging visible

REVIEWER RESPONSIBILITIES:
- Respond within SLA
- If blocked, communicate immediately
- If need reassignment, arrange it
- If doing later, commit to timeframe

"I'll get to it" is not a commitment.
"I'll review by EOD Thursday" is.
```

---

## 11. The Approval Hostage

**Severity:** High
**Situation:** Blocking merge for personal preferences, not actual issues
**Why Dangerous:** Personal taste becomes law, velocity dies.

```
THE TRAP:
PR is:
- Functionally correct
- Has tests
- Follows standards
- CI passing

Reviewer blocks:
"I prefer a different variable name"
"I would have done this differently"
"This isn't how we usually do it"

Author:
"But it works and meets requirements..."

Reviewer:
"I just don't like it. Not approving."

PR blocked for personal preference.

THE REALITY:
Your preferences aren't requirements.
Working code that meets standards = good.
Perfect is the enemy of shipped.

THE FIX:
1. Distinguish blocking from preference
   BLOCKING: Will break, is insecure, violates standard
   PREFERENCE: I would do it differently

2. Mark preferences as non-blocking
   "nit: I'd prefer X, but fine either way"
   "suggestion: Consider Y, not blocking"

3. Accept multiple valid solutions
   Your way isn't the only way
   Working code > your preferences

4. Define what's actually blocking
   Security issues
   Clear bugs
   Standard violations
   Missing requirements

5. Know when to let go
   "I'd do it differently, but this works.
   Approved."

BLOCKING VS PREFERENCE:
BLOCKING:
- Security vulnerability
- Will cause bugs
- Breaks existing functionality
- Missing requirements
- Violates team standards

NON-BLOCKING:
- Style preferences
- Alternative approaches
- Different naming
- "I would have..."

If it's not in the blocking list,
don't block the merge.
```

---

## 12. The Missing Security Eye

**Severity:** Critical
**Situation:** Reviewing code without checking for security issues
**Why Dangerous:** Vulnerabilities ship to production.

```
THE TRAP:
PR Review:
✓ "Logic looks correct"
✓ "Good naming"
✓ "Tests pass"
*Approved*

Shipped code contains:
- SQL injection in line 23
- XSS vulnerability in line 45
- Hardcoded credentials in config
- Missing auth check on endpoint

"But I reviewed the code!"
Yes, but not for security.

THE REALITY:
Security review is code review.
Every PR is a potential vulnerability.
If you're not checking, who is?

THE FIX:
1. Security checklist per PR
   □ Input validation
   □ Output encoding
   □ Authentication required
   □ Authorization checked
   □ No secrets in code
   □ SQL parameterized
   □ Dependencies vetted

2. Know OWASP Top 10
   SQL injection
   XSS
   Broken authentication
   Sensitive data exposure
   etc.

3. Check common patterns
   User input → database?
   User input → HTML output?
   User input → system command?
   External data → trust?

4. Use automated tools
   Snyk, Dependabot, CodeQL
   But don't rely on them alone

5. When in doubt, ask security team
   "This handles user input. Can
   security team take a look?"

SECURITY REVIEW MINIMUM:
□ Auth/authz on all endpoints
□ Input validated before use
□ No SQL string concatenation
□ No eval() with user data
□ No secrets in code
□ Dependencies up to date
□ Sensitive data handled properly
```
