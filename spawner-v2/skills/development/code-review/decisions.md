# Decisions: Code Review

Critical decisions that determine review effectiveness and team velocity.

---

## Decision 1: Review Scope

**Context:** Deciding what should be reviewed and how deeply.

**Options:**

| Scope | Description | Pros | Cons |
|-------|-------------|------|------|
| **All code** | Every line reviewed | Complete coverage | Slow, bottleneck |
| **Changed code only** | Only diff reviewed | Fast | Miss context |
| **Risk-based** | Depth varies by risk | Efficient | Requires judgment |
| **Sample-based** | Random sampling | Fast | Gaps in coverage |

**Framework:**
```
Review scope by code type:

ALWAYS DEEP REVIEW:
- Security-sensitive code
- Authentication/Authorization
- Payment processing
- Data handling (PII)
- Public APIs
- Database migrations

STANDARD REVIEW:
- Feature code
- Business logic
- API endpoints
- State management
- Error handling

LIGHT REVIEW:
- Tests (review but less depth)
- Documentation
- Configuration
- Styling changes

TRUST-BASED SKIP:
- Auto-generated code
- Dependency updates (automated)
- Typo fixes
- Formatting changes

DEPTH LEVELS:
DEEP: Read every line, test mentally
STANDARD: Understand logic, check patterns
LIGHT: Skim for obvious issues
VERIFY: Confirm change matches description

RISK ASSESSMENT:
What breaks if this fails?
- User data exposed → Deep
- Feature doesn't work → Standard
- Formatting off → Light

WHO'S AUTHORING:
- New team member → Deeper
- Senior on familiar code → Standard
- Anyone on unfamiliar code → Deeper
```

**Default Recommendation:** Risk-based review. Deep for security/data, standard for features, light for tests/docs.

---

## Decision 2: Number of Reviewers

**Context:** How many people should review each PR.

**Options:**

| Count | When | Pros | Cons |
|-------|------|------|------|
| **1** | Simple changes | Fast | Single point of failure |
| **2** | Standard work | Good coverage | Slower |
| **3+** | Critical code | Maximum coverage | Bottleneck |
| **CODEOWNERS** | Auto-assigned | Domain expertise | Complex setup |

**Framework:**
```
Reviewer count by PR type:

ONE REVIEWER:
- Bug fixes (non-critical)
- Documentation updates
- Minor features
- Styling changes
- Test additions
- Config changes

TWO REVIEWERS:
- New features
- API changes
- Database changes
- Cross-team changes
- Refactoring
- Performance changes

THREE+ REVIEWERS:
- Security changes
- Architecture changes
- Breaking changes
- Production hotfixes
- Core system changes

REQUIRED REVIEWERS:
Security changes → Security team member
Database → DBA or senior backend
API → API owner
Frontend → Frontend lead
Breaking change → Tech lead

CODEOWNERS STRATEGY:
/src/auth/** @security-team
/src/payments/** @payments-team @security-team
/api/** @api-team
/.github/** @platform-team

REVIEWER ASSIGNMENT:
Primary: Domain expert
Secondary: Different perspective
Tertiary: (for critical) Senior/lead

DON'T:
- Require 5 reviewers for everything
- Let anyone review anything
- Skip required reviewers for speed
```

**Default Recommendation:** 1 for simple, 2 for standard features, 2+ with required reviewers for critical paths.

---

## Decision 3: Review Turnaround Time

**Context:** Setting expectations for review response time.

**Options:**

| SLA | Target | Pros | Cons |
|-----|--------|------|------|
| **Same day** | < 8 hours | Fast iteration | May be shallow |
| **Next day** | < 24 hours | Balanced | Slower velocity |
| **48 hours** | < 48 hours | Thorough | Blocks authors |
| **ASAP for critical** | < 2 hours | Urgent handled | Disruptive |

**Framework:**
```
Review SLA by PR type:

URGENT (< 2 hours):
- Production hotfixes
- Security patches
- Critical bug fixes
Signal: "urgent" label, direct message

PRIORITY (< 4 hours):
- Release blockers
- User-facing bugs
- Dependency on other work
Signal: "priority" label

STANDARD (< 24 hours):
- Normal features
- Non-urgent bugs
- Improvements
Default for most PRs

BATCH (48-72 hours):
- Large refactors
- Non-urgent improvements
- Documentation
Signal: "no-rush" label

SLA EXPECTATIONS:
Initial response: Within SLA
Full review: May take longer
Follow-up: Same day after author response

COMMUNICATION:
"Can't review today. Will look tomorrow."
"Started review, will finish this afternoon."
"Complex PR, need 2 hours to review properly."

SLA BREAKERS:
If you can't meet SLA:
- Notify author immediately
- Suggest alternate reviewer
- Commit to new timeline

TRACKING:
Measure: Time from request to first response
Target: 90% within SLA
Review: Monthly metrics
```

**Default Recommendation:** 24-hour SLA for standard PRs, same-day for priority, 2-hour for urgent. Track and report.

---

## Decision 4: Review Approval Requirements

**Context:** What's needed to merge a PR.

**Options:**

| Requirement | Description | Pros | Cons |
|-------------|-------------|------|------|
| **1 approval** | Single LGTM | Fast | Less coverage |
| **2 approvals** | Two LGTMs | Better coverage | Slower |
| **Passing CI** | Required green | Automated quality | May slow down |
| **All resolved** | Discussions closed | Complete review | Can bottleneck |

**Framework:**
```
Merge requirements by branch:

MAIN/PRODUCTION:
- 2 approvals (1 from CODEOWNER)
- CI passing
- All conversations resolved
- No "Request Changes"
- Security scan passed

DEVELOP/STAGING:
- 1 approval
- CI passing
- Critical conversations resolved
- Security scan passed

FEATURE BRANCHES:
- 1 approval
- Tests passing
- Linting passing

RELEASE BRANCHES:
- 2 approvals
- Full CI pipeline
- QA sign-off
- Security sign-off

HOTFIX FLOW:
- 1 approval from senior
- Critical tests passing
- Post-merge full test
- Follow-up PR for full tests

APPROVAL MEANINGS:
☐ Comment: Feedback, not blocking
☑ Approve: Ready to merge
☒ Request Changes: Don't merge

RESOLVED CONVERSATIONS:
- Author addressed or explained
- Reviewer confirmed resolution
- Won't fix documented with reason

AUTO-MERGE RULES:
Enable for:
- Approved PRs
- All checks passed
- No unresolved conversations
```

**Default Recommendation:** 2 approvals + passing CI + resolved conversations for main. 1 approval for feature branches.

---

## Decision 5: PR Size Limits

**Context:** Managing PR size for effective review.

**Options:**

| Size | Lines Changed | Pros | Cons |
|------|---------------|------|------|
| **Small** | < 100 lines | Easy review | More PRs |
| **Medium** | 100-400 lines | Balanced | Some complexity |
| **Large** | 400-1000 lines | Complete features | Hard to review |
| **XL** | 1000+ lines | Rare, complex | Nearly impossible |

**Framework:**
```
PR size recommendations:

IDEAL SIZE:
100-400 lines changed
Single logical change
Reviewable in 30-60 minutes

SIZE LIMITS:
< 50 lines: Quick review
50-200 lines: Standard review
200-400 lines: Extended review
400-800 lines: Consider splitting
800+ lines: Should split

LARGE PR HANDLING:
If large PR unavoidable:
1. Add summary/walkthrough
2. Suggest review order
3. Mark key areas
4. Offer pair review
5. Allow staged approval

SPLITTING STRATEGIES:

VERTICAL SLICE:
One feature end-to-end
Data → Logic → UI

HORIZONTAL LAYER:
Infrastructure first
Business logic second
UI third

PREP + FEATURE:
Refactoring PR first
Feature PR after

FEATURE FLAGS:
Ship incomplete behind flag
Multiple small PRs
Flag enabled when done

EXCEPTIONS:
Large PRs acceptable for:
- Auto-generated code
- Bulk migrations
- Major refactors (with discussion)
- Initial project setup

TRACKING:
Measure average PR size
Target: 80% under 400 lines
Review large PR reasons
```

**Default Recommendation:** Target 100-400 lines. Require explanation for 400+. Block 1000+ without exception approval.

---

## Decision 6: Review Automation

**Context:** What to automate vs. human review.

**Options:**

| Automation | Handles | Pros | Cons |
|------------|---------|------|------|
| **Linting** | Style | Fast, consistent | Setup required |
| **Type checking** | Types | Catch type errors | Build time |
| **Tests** | Logic | Verify behavior | Coverage varies |
| **Security scan** | Vulnerabilities | Consistent | False positives |

**Framework:**
```
Automation strategy:

AUTOMATE (No human needed):
- Formatting (Prettier)
- Linting (ESLint)
- Type checking (TypeScript)
- Test execution
- Security scanning
- Dependency updates
- Coverage thresholds
- Build verification

ASSIST (Human + machine):
- Complexity analysis
- Code duplication
- Pattern suggestions
- PR description check
- Review reminders

HUMAN REQUIRED:
- Logic correctness
- Architecture decisions
- Business requirements
- Edge case coverage
- Code clarity
- Naming quality
- Design patterns

TOOL STACK:
// .github/workflows/pr-checks.yml
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - run: npm run type-check

  test:
    runs-on: ubuntu-latest
    steps:
      - run: npm test -- --coverage

  security:
    runs-on: ubuntu-latest
    steps:
      - run: npm audit
      - uses: snyk/actions/node@master

AUTOMATION RULES:
- Fail fast (lint before test)
- Block merge on failure
- No human override for security
- Allow override for coverage (with comment)

DON'T AUTOMATE:
- "Is this the right approach?"
- "Is this maintainable?"
- "Does this solve the problem?"
```

**Default Recommendation:** Automate style, types, tests, security. Require human for logic, architecture, completeness.

---

## Decision 7: Feedback Style Guidelines

**Context:** How to write review comments.

**Options:**

| Style | Approach | Pros | Cons |
|-------|----------|------|------|
| **Direct** | Clear, brief | Efficient | May feel harsh |
| **Socratic** | Questions | Learning | Slower |
| **Sandwich** | Positive first | Soft | Can be insincere |
| **Tiered** | Labeled severity | Clear priority | Extra work |

**Framework:**
```
Feedback style guide:

COMMENT STRUCTURE:
[TIER] What + Why + How

TIER PREFIXES:
🔴 BLOCKER: Must fix before merge
🟡 ISSUE: Should fix
🟢 SUGGESTION: Consider
💬 NIT: Optional, minor
✨ NICE: Positive callout

EXAMPLE:
🟡 ISSUE: This could fail with empty array.
The `[0]` access will throw if `items`
is empty. Consider adding a guard check:
`if (!items.length) return null`

TONE:
- "Consider..." not "You should..."
- "This might..." not "This will..."
- "We could..." not "You need to..."
- Ask questions when uncertain

POSITIVE FEEDBACK:
Required, not optional.
Every PR should have something positive.
"Nice test coverage"
"Clean separation of concerns"
"Good error handling"

HARSH VS DIRECT:
HARSH: "This is wrong"
DIRECT: "This has a bug: X case fails"

HARSH: "Why would you do this?"
DIRECT: "What led to this approach?
I'm curious about the Y trade-off."

THREADING:
- Start new thread for new topic
- Keep discussion in original thread
- Resolve when addressed

TIMING:
Give all feedback at once
Don't drip-feed comments
Author can batch responses
```

**Default Recommendation:** Tiered comments with direct-but-kind tone. Always include positive feedback.

---

## Decision 8: Handling Disagreements

**Context:** Resolving conflicts between reviewer and author.

**Options:**

| Approach | When | Pros | Cons |
|----------|------|------|------|
| **Author decides** | Opinion matters | Fast | Standards may slip |
| **Reviewer decides** | Blocker | Quality maintained | May frustrate |
| **Tech lead decides** | Escalation | Authoritative | Bottleneck |
| **Team discussion** | Architecture | Shared understanding | Slow |

**Framework:**
```
Disagreement resolution:

SEVERITY-BASED:

BLOCKING ISSUES (Reviewer wins):
- Security vulnerabilities
- Bugs that will break production
- Standard violations
Author must fix or explain why not.

SUGGESTIONS (Author decides):
- Style preferences
- Alternative approaches
- Optional improvements
Author can accept or decline.

DESIGN DISAGREEMENTS (Escalate):
- Architecture decisions
- Trade-off debates
- Significant divergence
Bring in third party.

RESOLUTION PROCESS:

Step 1: Clarify positions
"Help me understand why you chose X"
"My concern is that Y will happen"

Step 2: Find common ground
"We both want Z, right?"
"The disagreement is about approach"

Step 3: Evaluate trade-offs
"X gives us A but costs B"
"Y gives us C but costs D"

Step 4: Decide or escalate
If consensus: Document and proceed
If not: Bring in third party

ESCALATION LADDER:
1. Peer discussion (1 round)
2. Senior/tech lead (1 opinion)
3. Team discussion (if needed)
4. Tech lead decision (final)

TIME-BOX:
Max 2 async back-and-forth
Then: Call or escalate
Don't let PRs rot in debate

DOCUMENTATION:
Document decision in PR
"Discussed with @reviewer. Decided to
proceed with X because Y. See thread."
```

**Default Recommendation:** Author decides on suggestions, reviewer decides on blockers, escalate design disagreements quickly.

---

## Decision 9: Review Focus Areas

**Context:** What to prioritize during review.

**Options:**

| Focus | Priority | When |
|-------|----------|------|
| **Correctness** | Always | All PRs |
| **Security** | High | All PRs |
| **Performance** | Medium | Data/scale changes |
| **Style** | Low | Automated |
| **Readability** | Medium | All PRs |

**Framework:**
```
Review priority checklist:

ALWAYS CHECK (Every PR):
1. Does it work correctly?
2. Is it secure?
3. Does it have tests?
4. Is it readable?
5. Does it match requirements?

CHECK FOR SPECIFIC CHANGES:

DATABASE CHANGES:
- Migration reversibility
- Index performance
- Data integrity
- Deadlock potential

API CHANGES:
- Breaking changes
- Documentation
- Error responses
- Rate limiting

AUTHENTICATION:
- Session handling
- Token security
- Permission checks
- Logout behavior

PERFORMANCE CRITICAL:
- Algorithm complexity
- Memory usage
- Database queries
- Caching strategy

UI CHANGES:
- Accessibility
- Responsive design
- Error states
- Loading states

FOCUS ORDER:
1. Blockers (security, bugs)
2. Logic (correctness)
3. Testing (coverage, quality)
4. Design (maintainability)
5. Style (let tools handle)

TIME ALLOCATION:
60%: Logic and correctness
20%: Security and edge cases
15%: Design and maintainability
5%: Style and naming

DON'T FOCUS ON:
- Formatting (automated)
- Import order (automated)
- Spacing (automated)
```

**Default Recommendation:** Correctness > Security > Testing > Maintainability > Style. Let tools handle style.

---

## Decision 10: Handling Legacy Code Changes

**Context:** Reviewing changes to old or problematic code.

**Options:**

| Approach | Rule | Pros | Cons |
|----------|------|------|------|
| **Boy scout** | Leave better | Gradual improvement | Scope creep |
| **Minimal touch** | Change only needed | Focused | Debt remains |
| **Big bang** | Full refactor | Clean code | Risky, slow |
| **Document debt** | Track issues | Awareness | No improvement |

**Framework:**
```
Legacy code review policy:

THE QUESTION:
PR touches legacy code.
Should we require cleanup?

MINIMAL TOUCH (Default):
PR does X.
Reviewer evaluates X.
Don't require unrelated cleanup.

BOY SCOUT (Optional):
"While you're here, could you..."
Small improvements welcome.
Don't mandate.

WHEN TO ENCOURAGE CLEANUP:
- Obvious bug nearby
- Clear security issue
- Simple improvement
- Related to change

WHEN NOT TO EXPAND SCOPE:
- Major refactoring needed
- Different responsibility
- Time-sensitive change
- Would need new tests

LEGACY CODE RULES:

FOR AUTHOR:
- Don't refactor while fixing
- Separate PRs for cleanup
- Note tech debt discovered
- "Found issue X, created ticket Y"

FOR REVIEWER:
- Review the change, not the file
- Don't block for existing issues
- Create tickets for future work
- "This file has issues. Created #456
  for future cleanup. This PR is fine."

TECH DEBT HANDLING:
1. Note in review (don't block)
2. Create tracking ticket
3. Add to backlog
4. Prioritize separately

EXAMPLE:
PR: Fix date parsing bug

Reviewer sees: 500 lines of messy code

DON'T: "Refactor this entire file"
DO: "Bug fix looks good. Created ticket
#789 for the broader file cleanup."

EXCEPTIONS:
Require cleanup if:
- Security vulnerability
- Will cause bug
- Can't understand change otherwise
```

**Default Recommendation:** Minimal touch for legacy. Create tickets for tech debt. Don't scope-creep PRs.
