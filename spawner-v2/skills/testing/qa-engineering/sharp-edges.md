# Sharp Edges: QA Engineering

Critical mistakes that undermine test reliability and let bugs through.

---

## 1. The Flaky Test Infestation

**Severity:** Critical
**Situation:** Test suite with intermittent failures that pass on retry
**Why Dangerous:** Team ignores test failures. Real bugs slip through.

```
THE TRAP:
Test run 1: 95 passed, 5 failed
Test run 2: 98 passed, 2 failed (same code)
Test run 3: 100 passed (same code)

Team response:
"Just re-run the tests"
"That one's always flaky"
"Works on my machine"

Real bug hides among flaky failures.
Team stops trusting tests.
Tests become useless.

THE REALITY:
Flaky tests are worse than no tests.
They train the team to ignore failures.
When real bugs fail, they get dismissed.

THE FIX:
1. Zero tolerance for flakiness
   Flaky test = broken test
   Fix or delete immediately
   Never just "re-run"

2. Quarantine flaky tests
   Move to quarantine suite
   Don't block CI
   Track and fix

3. Find root causes
   Race conditions → Add proper waits
   Shared state → Isolate tests
   Timing issues → Deterministic waits
   Order dependency → Independent tests

4. Test infrastructure
   Retry once in CI (flag as flaky)
   Track flakiness metrics
   Prioritize fixing

FLAKY TEST CAUSES:
- Race conditions
- Hardcoded waits
- Shared test data
- Network dependencies
- Order-dependent tests
- Time-dependent tests
- Floating-point comparisons

FLAKINESS RULE:
If a test fails once for no reason,
it will fail again for no reason.
Fix it now, not later.
```

---

## 2. The E2E Test Addiction

**Severity:** High
**Situation:** Over-reliance on end-to-end tests at the expense of unit/integration tests
**Why Dangerous:** Slow CI, hard to debug, expensive to maintain.

```
THE TRAP:
Test distribution:
Unit tests: 10
Integration tests: 20
E2E tests: 500

Test run time: 45 minutes
Failure debugging: Hours
Maintenance: Painful

"We need to test everything end-to-end
to really know it works!"

THE REALITY:
E2E tests are expensive.
They're slow to run, hard to debug, and fragile.
Most bugs can be caught cheaper, earlier.

THE TEST PYRAMID:

          E2E
        (Few, slow)
         /    \
       /        \
      ----------
     Integration
    (Some, medium)
    --------------
       Unit Tests
    (Many, fast)
    ----------------

THE FIX:
1. Follow the pyramid
   Many unit tests (fast, isolated)
   Some integration tests (modules)
   Few E2E tests (critical paths)

2. E2E for critical paths only
   Happy path through core flows
   Key user journeys
   NOT every edge case

3. Push tests down
   Can unit test catch this? → Unit test
   Need to test integration? → Integration test
   Critical user journey? → E2E test

4. E2E test scope
   10-20 critical E2E tests, not 500
   Each covers a complete user journey
   Broad coverage, not deep

TEST DISTRIBUTION TARGET:
Unit: 70%
Integration: 20%
E2E: 10%

E2E TESTS SHOULD COVER:
- User can sign up
- User can complete core action
- User can purchase/subscribe
- Critical integrations work

NOT:
- Every form validation
- Every error state
- Every edge case
```

---

## 3. The Hardcoded Wait Nightmare

**Severity:** High
**Situation:** Using fixed time delays instead of condition-based waits
**Why Dangerous:** Slow tests that are still flaky.

```
THE TRAP:
// Bad: Hardcoded wait
await page.click('.submit')
await page.waitForTimeout(5000)  // Hope it's loaded
expect(page.locator('.result')).toBeVisible()

What happens:
Fast server: Waits 4s too long
Slow server: Still fails
Always: Slow CI

THE REALITY:
Fixed waits are guesses.
Too short = flaky.
Too long = slow.
Both = broken tests.

THE FIX:
1. Wait for conditions, not time
   // Good: Wait for element
   await page.click('.submit')
   await page.waitForSelector('.result', { state: 'visible' })
   expect(page.locator('.result')).toBeVisible()

2. Built-in auto-waiting
   Most modern frameworks auto-wait
   Playwright: Built-in waits
   Cypress: Automatic retry

3. Custom wait helpers
   async function waitForApi(path) {
     await page.waitForResponse(
       response => response.url().includes(path)
     )
   }

4. Network idle waits
   await page.waitForLoadState('networkidle')
   Only when appropriate

WAIT TYPES:
✓ Wait for selector
✓ Wait for response
✓ Wait for condition
✓ Wait for load state
✗ Wait for fixed time
✗ Sleep/delay

WHEN FIXED WAIT IS OKAY:
Almost never.
Animation timing (very short).
Debounce testing.
Even then: Prefer condition.
```

---

## 4. The Test Data Nightmare

**Severity:** High
**Situation:** Tests sharing or depending on production-like data
**Why Dangerous:** Order-dependent, impossible to run in parallel, environment-specific failures.

```
THE TRAP:
// Test 1
test('create user', () => {
  createUser('john@test.com')  // Creates in DB
})

// Test 2
test('user can login', () => {
  login('john@test.com')  // Depends on Test 1!
})

// Test 3
test('delete user', () => {
  deleteUser('john@test.com')  // Now Test 2 breaks!
})

Tests depend on each other.
Running in different order = fails.
Running in parallel = fails.
Different environment = fails.

THE REALITY:
Shared test data creates hidden dependencies.
Each test must be independent.
Tests must create and clean up their own data.

THE FIX:
1. Test isolation
   Each test creates its own data
   Each test cleans up after itself
   No test depends on another

2. Factory pattern
   // Before each test
   const user = await createTestUser()
   // After each test
   await cleanupTestUser(user.id)

3. Unique identifiers
   const email = `test-${uuid()}@test.com`
   Prevents collisions in parallel

4. Database isolation strategies
   Transactions: Roll back after test
   Truncation: Clear tables before suite
   Containers: Fresh DB per suite

TEST DATA PRINCIPLES:
- Each test is independent
- Tests can run in any order
- Tests can run in parallel
- Data is created fresh, not assumed
- Cleanup is automatic

ISOLATION LEVELS:
Test-level: Each test isolated
Suite-level: Suite shares setup
None: Shared state (AVOID)
```

---

## 5. The Missing Error Path

**Severity:** High
**Situation:** Only testing the happy path, ignoring error states
**Why Dangerous:** Errors are inevitable. Untested error handling is unpredictable.

```
THE TRAP:
Test suite:
✓ User can create account
✓ User can add item
✓ User can checkout
✓ User receives confirmation

Production:
User enters invalid email → Unhandled error
Payment fails → Blank screen
Server timeout → App crashes
Network offline → Data lost

"We tested all the features!"
But not the failures.

THE REALITY:
Happy paths are easy.
Error paths are where bugs hide.
Users will find every error path.

THE FIX:
1. Error path coverage
   For each feature, test:
   - Invalid input
   - Network failure
   - Server error
   - Timeout
   - Unauthorized

2. Boundary testing
   Empty inputs
   Maximum lengths
   Special characters
   Unexpected types

3. Failure injection
   Mock API errors
   Simulate network issues
   Test timeout handling

4. Error UI testing
   Error messages display
   Recovery options work
   No sensitive data exposed

ERROR TEST EXAMPLES:
- Submit with empty form
- Submit with invalid email
- API returns 500
- Network request times out
- Server returns unexpected data
- Session expires mid-action

TEST COVERAGE QUESTION:
For each test, ask:
"What if this fails?"
Then test that.
```

---

## 6. The Screenshot Comparison Trap

**Severity:** Medium
**Situation:** Over-relying on visual regression tests
**Why Dangerous:** Brittle, slow, catches wrong things.

```
THE TRAP:
Visual regression for everything:
- Every component
- Every page
- Every state

Results:
1000s of screenshots to maintain
Tiny changes break everything
False positives overwhelm real bugs
Team starts approving blindly

THE REALITY:
Visual regression is a tool, not a strategy.
Too much = noise.
Catches the wrong things.
Misses the right things.

THE FIX:
1. Selective visual testing
   Key pages only
   Design system components
   Not every permutation

2. Component-level
   Test components in isolation
   Storybook + visual regression
   Not full pages

3. Threshold settings
   Allow small differences
   Focus on structural changes
   Not pixel-perfect

4. Complement, don't replace
   Visual tests + functional tests
   Catch layout issues
   Not replacement for assertions

VISUAL TESTING GOOD FOR:
- Design system components
- Critical marketing pages
- Branding consistency
- Layout regressions

VISUAL TESTING BAD FOR:
- Dynamic content
- Date/time displays
- User-generated content
- Every page state

VISUAL TESTING TOOLS:
- Percy
- Chromatic
- Applitools
- BackstopJS

KEEP VISUAL TESTS:
Under 50 for most apps
Under 200 for large apps
Above 500 = maintenance hell
```

---

## 7. The "Works In Isolation" Blindspot

**Severity:** High
**Situation:** Components pass unit tests but fail together
**Why Dangerous:** Integration bugs are the hardest to find.

```
THE TRAP:
Unit tests:
✓ PaymentForm validates correctly
✓ PaymentService processes correctly
✓ PaymentConfirmation displays correctly

Integration:
PaymentForm → PaymentService → PaymentConfirmation
??? (never tested together)

Production:
Form submits wrong format.
Service expects different structure.
Confirmation shows wrong data.

"All unit tests passed!"

THE REALITY:
Unit tests test units.
They don't test integration.
Interfaces are where bugs hide.

THE FIX:
1. Integration tests for seams
   Test where components connect
   Test API contracts
   Test data flow

2. Contract testing
   Define and test interfaces
   Provider tests
   Consumer tests

3. Vertical slice tests
   Test one feature end-to-end
   Through all layers
   Real(ish) integration

4. Test the boundaries
   Between frontend and API
   Between services
   Between your code and libraries

INTEGRATION TEST TARGETS:
- API response handling
- Data transformation
- Authentication flow
- Payment processing
- Third-party integrations

INTEGRATION TEST APPROACH:
Not full E2E (expensive)
Not unit (too isolated)
Test the seams specifically

CONTRACT TESTING:
Frontend expects: { name: string, id: number }
Backend provides: { name: string, id: number }
Contract test: Validates both match
```

---

## 8. The "Test What You Built" Trap

**Severity:** High
**Situation:** Developer writes tests for their implementation, not requirements
**Why Dangerous:** Tests pass, but requirements aren't met.

```
THE TRAP:
Requirement: "User can search products"

Developer implements:
Search only works for exact matches.

Developer tests:
test('search finds exact match', () => {
  expect(search('iPhone')).toContain('iPhone')
})
✓ Test passes

User searches: "iphone" → No results
User searches: "phone" → No results
User searches: "iphne" → No results

"But the test passed!"

THE REALITY:
Tests validate implementation.
They should validate requirements.
Easy to test what you built, not what was needed.

THE FIX:
1. Test requirements, not implementation
   Start with requirements
   Write tests from requirements
   Not from the code

2. Write tests before code (TDD)
   Tests define expected behavior
   Code implements to pass tests
   Tests are the specification

3. Independent test perspective
   Someone else reviews tests
   QA writes acceptance tests
   Don't just test what you wrote

4. User-perspective testing
   Test as user would use it
   Not as developer knows it works
   Include realistic variations

REQUIREMENT TRANSLATION:
Requirement: "Search products"
Tests should cover:
- Exact match
- Case insensitive
- Partial match
- Typo tolerance (if specified)
- Empty results
- Special characters

TESTING PRINCIPLE:
Test the contract, not the implementation.
Tests should be stable when
implementation changes but requirements don't.
```

---

## 9. The Ignored Console Error

**Severity:** High
**Situation:** Tests pass despite console errors and warnings
**Why Dangerous:** Errors accumulate, real problems hidden in noise.

```
THE TRAP:
Test output:
✓ All 50 tests passed!

Console during tests:
[Error] Cannot read property 'map' of undefined
[Warning] Each child should have a unique key
[Error] Failed to load resource
[Warning] A component is changing a controlled input
...30 more errors

"Tests passed, so it's fine!"

THE REALITY:
Console errors indicate problems.
Ignoring them lets bugs through.
Noise hides signal.

THE FIX:
1. Fail on console errors
   Configure test runner to fail
   Any console.error fails test
   Any unhandled exception fails test

   // Jest example
   beforeEach(() => {
     jest.spyOn(console, 'error')
       .mockImplementation((msg) => {
         throw new Error(msg)
       })
   })

2. Assert no errors
   // Playwright example
   page.on('console', msg => {
     if (msg.type() === 'error') {
       throw new Error(msg.text())
     }
   })

3. Clean up warnings
   Fix React key warnings
   Fix deprecation warnings
   Clean console = real signals visible

4. Categorize and act
   Errors: Fix immediately
   Warnings: Fix soon
   Info/debug: Ignore in tests

CONSOLE ERROR POLICY:
Production code: Zero console.error
Test code: Fail on console.error
Third-party noise: Explicitly filter
```

---

## 10. The Unmaintained Test Suite

**Severity:** High
**Situation:** Tests written and abandoned, not updated with code changes
**Why Dangerous:** Tests become useless, then deleted, then bugs escape.

```
THE TRAP:
Month 1: 100 tests, all passing
Month 3: 95 tests passing, 5 skipped
Month 6: 80 tests passing, 20 skipped
Month 12: 50 tests "temporarily" disabled

"We'll fix them later"
Later: Never
Tests: Useless

THE REALITY:
Tests require maintenance.
Unmaintained tests rot.
Skipped tests are deleted tests.

THE FIX:
1. Tests in Definition of Done
   Feature not done until tests updated
   Code review includes tests
   No merging with failing tests

2. Zero skipped tests policy
   Skipped = blocked or deleted
   No indefinite skipping
   Time limit: 2 weeks max

3. Test health metrics
   Track passing/failing/skipped
   Trend over time
   Alert on degradation

4. Test ownership
   Tests owned by team
   Part of code review
   Refactored with code

TEST MAINTENANCE RULES:
- Update tests with code changes
- Delete obsolete tests
- Fix or delete skipped tests
- Review tests in code review

TEST DEBT SIGNS:
- Increasing skip count
- Tests commented out
- "TODO: Fix this test"
- Tests that nobody understands

SKIPPED TEST POLICY:
Skipped test needs:
- JIRA ticket
- Owner
- Deadline
- Reason documented
```

---

## 11. The Missing Test Environment

**Severity:** High
**Situation:** Tests only run locally, not in CI/staging-like environment
**Why Dangerous:** "Works on my machine" doesn't help users.

```
THE TRAP:
Developer machine:
- Latest Chrome
- 32GB RAM
- Fast SSD
- Localhost backend
- All dependencies installed

Tests: ✓ All pass!

CI/Production:
- Different Chrome version
- Limited resources
- Network latency
- Different environment variables
- Container restrictions

Tests: ✗ Fail intermittently

"It works on my machine!"

THE REALITY:
Local environment ≠ Production environment.
Tests must run in production-like conditions.
Environment differences hide bugs.

THE FIX:
1. CI as source of truth
   If it fails in CI, it's broken
   Local passing is not enough
   CI must pass to merge

2. Environment parity
   CI matches production
   Same browser versions
   Same dependencies
   Same constraints

3. Container-based testing
   Docker for test environment
   Reproducible everywhere
   Same container as CI

4. Multiple environments
   Run in multiple browsers
   Run in multiple OS
   Run in resource-constrained mode

ENVIRONMENT CHECKLIST:
□ CI runs all tests
□ CI uses same browser versions
□ CI has resource limits
□ CI uses real(ish) backend
□ Environment variables match
□ Dependencies locked

CI PRIORITY:
CI failures are real failures.
Local success is just hopeful.
Fix CI first, local second.
```

---

## 12. The Assertion-Free Test

**Severity:** High
**Situation:** Tests that execute code but don't assert anything meaningful
**Why Dangerous:** Tests pass even when code is broken.

```
THE TRAP:
test('user can checkout', async () => {
  await page.goto('/cart')
  await page.click('.checkout')
  await page.fill('#email', 'test@test.com')
  await page.fill('#card', '4242424242424242')
  await page.click('.submit')
  // No assertion!
})

Test result: ✓ Passed!

Reality:
- Did checkout succeed?
- Was order created?
- Was confirmation shown?
- Was payment processed?

Unknown. The test doesn't check.

THE REALITY:
Execution without assertion = useless test.
Tests must verify expected outcomes.
"No error" is not success.

THE FIX:
1. Every test has assertions
   What should happen?
   Assert that it happened.
   No assertion = not a test.

2. Assert outcomes, not execution
   // Bad
   await page.click('.submit')
   // "test passed" = click happened

   // Good
   await page.click('.submit')
   await expect(page.locator('.success')).toBeVisible()
   // "test passed" = success message shown

3. Multiple assertions for user journeys
   test('user can checkout', async () => {
     // ... steps ...
     await expect(page.locator('.confirmation')).toBeVisible()
     await expect(page.locator('.order-number')).toHaveText(/ORD-\d+/)
     // Could also verify API call, database, etc.
   })

4. Assert state, not action
   Don't: Assert button was clicked
   Do: Assert button click result is visible

ASSERTION CHECKLIST:
□ Test has at least one assertion
□ Assertion checks outcome, not execution
□ Assertion is specific enough
□ Test would fail if feature broke
```
