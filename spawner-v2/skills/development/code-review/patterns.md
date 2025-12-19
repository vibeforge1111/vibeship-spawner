# Patterns: Code Review

Proven approaches for reviews that improve code AND developers.

---

## Pattern 1: The Tiered Comment System

**Context:** Organizing feedback by importance so authors know what matters.

**The Pattern:**
```
PURPOSE:
Not all feedback is equal.
Authors need to know priority.
Clear hierarchy = faster resolution.

COMMENT TIERS:

TIER 1: BLOCKER (Must fix)
Prefix: 🔴 or [BLOCKER]
Issues that prevent merge:
- Security vulnerabilities
- Bugs that will crash
- Data loss risks
- Breaking changes

Example:
🔴 BLOCKER: This SQL is injectable.
User input goes directly into query.
Use parameterized queries instead.

TIER 2: ISSUE (Should fix)
Prefix: 🟡 or [ISSUE]
Real problems, not catastrophic:
- Logic errors
- Missing edge cases
- Performance problems
- Missing tests

Example:
🟡 ISSUE: This will fail when list
is empty. Add empty check before
accessing list[0].

TIER 3: SUGGESTION (Consider)
Prefix: 🟢 or [SUGGESTION]
Improvements, not required:
- Better naming
- Cleaner approach
- Documentation additions

Example:
🟢 SUGGESTION: Consider extracting
this into a helper function for
readability. Not blocking.

TIER 4: NIT (Trivial)
Prefix: [nit] or 💬
Style preferences, minor:
- Spacing
- Naming preferences
- Optional improvements

Example:
nit: Extra blank line here. Minor,
feel free to ignore.

TIER 5: PRAISE (Positive)
Prefix: ✨ or [NICE]
Good stuff worth calling out:
- Clever solutions
- Good patterns
- Thorough testing

Example:
✨ NICE: Great error handling here.
The fallback approach is solid.

USAGE RULES:
- Lead with blockers
- Group by tier
- Be consistent with prefixes
- Team agrees on meaning
```

---

## Pattern 2: The Sandwich Method

**Context:** Delivering criticism constructively.

**The Pattern:**
```
PURPOSE:
Criticism without context feels like attack.
Framing matters for reception.
Balance builds trust.

THE SANDWICH:
1. POSITIVE: What's working
2. CONSTRUCTIVE: What needs work
3. POSITIVE: Overall impression

EXAMPLE:
"The overall structure of this feature
is clean and well-organized. (positive)

One concern: the error handling in
the API client could leave users
without feedback when requests fail.
Consider adding user-facing messages.
(constructive)

Really like how you handled the
edge cases in the validation logic.
Solid work overall. (positive)"

WHEN TO USE:
- Significant feedback to deliver
- Junior developers
- Sensitive refactoring
- Building relationships

WHEN TO SKIP:
- Quick, minor issues
- Established trust
- Simple bug fixes
- Time-sensitive reviews

VARIATIONS:

MICRO-SANDWICH (in-line):
"Good approach here. One improvement:
add null check. Nice handling of the
else case."

SECTION SANDWICH:
Group comments by area:
"Auth section: Great structure. See 3
suggestions below. Well done on tests."

ANTI-PATTERN:
Don't manufacture fake positives.
If everything is problematic, be direct.
Forced praise feels condescending.
```

---

## Pattern 3: The Question-First Approach

**Context:** Using questions instead of statements to create dialogue.

**The Pattern:**
```
PURPOSE:
Questions invite discussion.
Statements invite defense.
Author may have good reason.

STATEMENT VS QUESTION:

STATEMENT:
"This approach is wrong."
Author reaction: Defensive

QUESTION:
"What led you to this approach?
I'm wondering about the X case."
Author reaction: Explains reasoning

QUESTION TYPES:

CLARIFYING:
"Can you help me understand why
X was chosen over Y?"
Genuinely seeking to understand.

LEADING:
"Have you considered what happens
when the list is empty?"
Guiding toward the issue.

SOCRATIC:
"What would this return if the
user isn't authenticated?"
Author discovers issue themselves.

GENUINE:
"I don't understand this part.
Can you explain?"
Honest confusion.

EXAMPLES:

Instead of:
"This will break with null input."

Try:
"What happens if input is null?"

Instead of:
"Wrong algorithm choice."

Try:
"What were you optimizing for here?
I'm curious about the trade-offs."

Instead of:
"This isn't secure."

Try:
"How are we handling malicious input
in this endpoint?"

BENEFITS:
- Author explains reasoning (you might be wrong)
- Creates dialogue instead of confrontation
- Author learns through discovery
- Builds collaborative culture
```

---

## Pattern 4: The Review Checklist

**Context:** Ensuring consistent, thorough reviews.

**The Pattern:**
```
PURPOSE:
Human memory is fallible.
Checklists ensure completeness.
Consistency across reviewers.

STANDARD CHECKLIST:

FUNCTIONALITY:
□ Does it do what the PR claims?
□ Are edge cases handled?
□ Are error states handled?
□ Does it meet requirements?

SECURITY:
□ Input validation present?
□ No SQL/command injection?
□ No XSS vulnerabilities?
□ Authentication required?
□ Authorization checked?
□ No secrets in code?

TESTING:
□ Tests exist for new code?
□ Tests cover edge cases?
□ Tests are meaningful (not just coverage)?
□ All tests pass?

CODE QUALITY:
□ Code is readable?
□ Naming is clear?
□ No code duplication?
□ Functions are focused?
□ Comments explain "why" not "what"?

PERFORMANCE:
□ No N+1 queries?
□ No unnecessary loops?
□ Large data handled efficiently?
□ No memory leaks?

DOCUMENTATION:
□ Public APIs documented?
□ Complex logic explained?
□ README updated if needed?

INTEGRATION:
□ Works with existing code?
□ No breaking changes (or flagged)?
□ Dependencies justified?

IMPLEMENTATION:
// Create team checklist file
const reviewChecklist = `
## Review Checklist

### Functionality
- [ ] Meets stated requirements
- [ ] Edge cases handled
- [ ] Error handling present

### Security
- [ ] No injection vulnerabilities
- [ ] Auth/authz verified
- [ ] No secrets in code

### Quality
- [ ] Tests present and meaningful
- [ ] Code is readable
- [ ] No obvious performance issues
`

CUSTOMIZATION:
Tailor for your team:
- Frontend: Accessibility, responsive
- Backend: Rate limiting, logging
- Data: PII handling, retention
- Mobile: Battery, offline
```

---

## Pattern 5: The Teach, Don't Tell Approach

**Context:** Turning code review into learning opportunities.

**The Pattern:**
```
PURPOSE:
Telling what to fix = fixes one bug.
Teaching why = prevents future bugs.
Knowledge compounds.

TELL VS TEACH:

TELL:
"Use async/await instead of .then()"

TEACH:
"async/await makes the control flow
easier to follow and error handling
more consistent with try/catch.
Here's a comparison:

// Before (Promise chains)
getData().then(x => process(x)).catch(err => ...)

// After (async/await)
try {
  const data = await getData()
  return process(data)
} catch (err) { ... }

The await version reads top-to-bottom
like synchronous code."

TEACHING COMPONENTS:

1. WHAT: The issue or suggestion
   "This could use a guard clause."

2. WHY: Reason it matters
   "Guard clauses reduce nesting and
   make the happy path clearer."

3. HOW: Example or reference
   "Like this: if (!valid) return;
   // rest of function without nesting"

4. LEARN MORE: Resources
   "Good article on this pattern:
   [link to resource]"

EXAMPLE REVIEW COMMENT:

"Consider using a Set instead of
an Array for this lookup.

WHY: Arrays use O(n) for `.includes()`
while Sets use O(1) for `.has()`.
With 10k items, that's the difference
between checking 10k items vs 1.

HOW:
// Before
const items = ['a', 'b', 'c']
if (items.includes(x)) ...

// After
const items = new Set(['a', 'b', 'c'])
if (items.has(x)) ...

More info: MDN article on Set
[link]"

WHEN TO TEACH DEEPLY:
- Junior developers
- Unfamiliar patterns
- Non-obvious issues
- Valuable knowledge

WHEN TO KEEP BRIEF:
- Senior developers
- Common knowledge
- Time pressure
- Previous discussions
```

---

## Pattern 6: The Two-Pass Review

**Context:** Separating big-picture review from detail review.

**The Pattern:**
```
PURPOSE:
Architecture issues found late = wasted effort.
See forest before examining trees.
Catch design problems early.

TWO-PASS PROCESS:

PASS 1: BIG PICTURE (5-10 min)
Don't look at line-by-line details.
Ask:
- Is the approach right?
- Is the structure sound?
- Are the components correct?
- Does this belong here?

Look at:
- File structure
- Class/function breakdown
- Data flow
- Dependencies

If Pass 1 fails:
Stop. Provide architectural feedback.
Don't waste time on details of
code that will be rewritten.

PASS 2: DETAILS (remaining time)
Once approach is sound:
- Line-by-line review
- Logic correctness
- Edge cases
- Code quality

PASS 1 QUESTIONS:

DESIGN:
- Right level of abstraction?
- Correct responsibility placement?
- Appropriate coupling?

APPROACH:
- Is this solving the right problem?
- Is this the best approach?
- Will this scale?

STRUCTURE:
- Files in right location?
- Module boundaries correct?
- Dependencies appropriate?

PASS 2 QUESTIONS:

LOGIC:
- Will this work correctly?
- What about edge cases?
- Error handling present?

QUALITY:
- Is code readable?
- Is naming clear?
- Are there code smells?

TESTING:
- Are tests meaningful?
- Is coverage sufficient?
- Do tests test the right things?

EXAMPLE:
PR adds new payment feature.

Pass 1: "The payment logic is in
the UI component. This should be
in a service layer. Let's discuss
the architecture before going further."

→ Save detailed review until structure fixed
```

---

## Pattern 7: The Living PR Description

**Context:** PR descriptions that enable effective review.

**The Pattern:**
```
PURPOSE:
Good PR descriptions = faster reviews.
Context enables understanding.
Reviewers aren't mind readers.

PR DESCRIPTION TEMPLATE:

## What
[One-line summary of change]

## Why
[Problem being solved or feature being added]
[Link to issue/ticket if exists]

## How
[Approach taken and key decisions]
[Why this approach over alternatives]

## Testing
[How this was tested]
[Manual testing steps if needed]

## Screenshots (if UI)
[Before/after or demo]

## Checklist
- [ ] Tests added/updated
- [ ] Documentation updated
- [ ] No breaking changes (or noted below)
- [ ] Security considerations reviewed

## Breaking Changes
[List any or "None"]

## Follow-up
[Future work or known limitations]

EXAMPLE:

## What
Add rate limiting to API endpoints

## Why
Users can spam endpoints, causing
performance issues. Addresses #234.

## How
Using token bucket algorithm with
Redis for distributed rate limiting.
Chose this over sliding window for
better burst handling.

## Testing
- Unit tests for rate limiter
- Integration tests with Redis
- Manual testing: verified 429 returned

## Screenshots
N/A (backend change)

## Breaking Changes
API now returns 429 when rate limited.
Clients should handle this status code.

## Follow-up
- Per-endpoint limits (future PR)
- Dashboard for rate limit monitoring

---

UPDATING THE DESCRIPTION:
Update as review progresses:
- "Added tests per @reviewer feedback"
- "Refactored X based on discussion"
- "Note: Y was intentionally left as-is
  because Z"

Living document, not static.
```

---

## Pattern 8: The Incremental Approval

**Context:** Approving in stages for large PRs.

**The Pattern:**
```
PURPOSE:
Large PRs are hard to review.
Staged approval maintains momentum.
Progress visible to author.

APPROACH:

Instead of:
PR with 50 files, one review.
All-or-nothing approval.

Do:
Review in sections.
Approve progressively.
Clear progress markers.

IMPLEMENTATION:

SECTION-BASED:
"Reviewed auth module ✅
Reviewed API handlers ✅
Reviewing data layer...

Auth and API look great.
See comments on data layer."

FILE-BASED (for GitHub):
Use "Viewed" checkbox per file.
Author sees progress.
Reviewer tracks progress.

STAGED COMMENTS:
1. First pass: Architecture
   "Structure looks good. Proceeding
   to detailed review."

2. Second pass: Logic
   "Logic review complete. Few
   issues in error handling."

3. Third pass: Polish
   "Minor nits, good to merge after
   addressing."

WHEN TO USE:
- PRs > 400 lines
- Multiple logical sections
- Long-running reviews
- Multiple reviewers

COMMUNICATION:
"This is a big PR. I'll review
in sections over today/tomorrow.
Will comment as I go so you can
start addressing issues."

AUTHOR COOPERATION:
"If possible, split future changes
this large into smaller PRs.
Each section could be its own PR."

PROGRESS TRACKING:
Day 1: Reviewed auth (✅), comments left
Day 2: Reviewed API (✅), looks good
Day 3: Reviewed UI (✅), minor nits
Day 3: Approved

vs.

Day 1-5: *silence*
Day 5: "Major issues throughout"
```

---

## Pattern 9: The Context Comment

**Context:** Adding explanatory comments that future reviewers need.

**The Pattern:**
```
PURPOSE:
Future you won't remember why.
Next reviewer needs context.
Document unusual decisions.

TYPES OF CONTEXT COMMENTS:

IN-CODE CONTEXT:
// Using parseInt with radix because API returns
// string numbers with leading zeros (e.g., "007")
// See: https://issue-tracker.com/456
const id = parseInt(value, 10)

PR CONTEXT:
"Note: This looks more complex than needed,
but the simpler version caused race conditions
in production. See incident #789."

REVIEW CONTEXT:
"Discussed with @architect. Agreed this
abstraction is worth the complexity for
future extensibility. Documented in ADR-23."

WHEN TO ADD CONTEXT:

NON-OBVIOUS DECISIONS:
"Why not use library X?"
Add comment explaining trade-off.

WORKAROUNDS:
"This is weird because..."
Document the constraint.

TEMPORARY CODE:
"TODO: Remove after migration"
Date and ticket number.

LEARNED LESSONS:
"Tried Y, caused Z problem"
Prevent others from repeating.

CONTEXT TEMPLATE:
// [What]: Brief description of decision
// [Why]: Reason for this approach
// [Alternatives]: What was considered
// [Reference]: Link to discussion/docs

EXAMPLE:
// Using raw SQL instead of ORM
// Why: ORM doesn't support recursive CTE
// Considered: Stored procedure (rejected for
//   portability), multiple queries (too slow)
// Ref: ADR-15, Issue #234

REVIEW COMMENT VERSION:
"I know raw SQL looks wrong here given our
ORM standards. Explained in code comment.
Happy to discuss, but ORM limitation is real."
```

---

## Pattern 10: The Pair Review

**Context:** Reviewing together for complex changes.

**The Pattern:**
```
PURPOSE:
Some code needs discussion.
Async comments aren't enough.
Real-time review for complex PRs.

WHEN TO PAIR REVIEW:

COMPLEX CHANGES:
- New architecture patterns
- Significant refactoring
- Security-sensitive code
- Performance-critical paths

LEARNING OPPORTUNITIES:
- Junior dev's first major PR
- Unfamiliar technology
- Team knowledge sharing

DISAGREEMENT RESOLUTION:
- Multiple review rounds
- Comment back-and-forth
- Design disagreements

PAIR REVIEW PROCESS:

1. PREPARE:
   Both parties review code first.
   Come with questions/observations.

2. WALK THROUGH:
   Author walks through changes.
   Reviewer asks questions.
   Screen share or same machine.

3. DISCUSS:
   Design decisions
   Trade-offs
   Alternatives considered

4. AGREE:
   What changes are needed?
   What's accepted as-is?
   Document decisions.

5. DOCUMENT:
   Update PR with outcomes:
   "Pair reviewed with @reviewer.
   Agreed to: X, Y, Z.
   Will not change: A (reason)."

FORMAT OPTIONS:

SYNCHRONOUS:
- Video call with screen share
- Same room, same screen

ASYNCHRONOUS PAIR:
- Loom video walkthrough
- Reviewer responds with video
- Async but richer than text

STRUCTURE:
30-45 min typically
Longer for major changes
Author drives, reviewer questions

BENEFITS:
- Faster than async for complex code
- Shared understanding
- Knowledge transfer
- Better relationship
- Documented in PR after
```
