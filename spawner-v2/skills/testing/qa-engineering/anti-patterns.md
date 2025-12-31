# Anti-Patterns: QA Engineering

These approaches seem like good testing practices but consistently undermine test reliability.

---

## 1. The Coverage Obsession

**The Mistake:**
```
Target: 100% code coverage
Strategy: Test everything

Result:
- Tests for getters and setters
- Tests for config files
- Tests for trivial code
- Meaningful tests deprioritized

Coverage: 100%
Bugs in production: Still happening
```

**Why It's Wrong:**
- Coverage measures execution, not quality
- 100% coverage can be gamed
- Diminishing returns past 80%
- Focus shifts from catching bugs to hitting numbers

**Better Approach:**
```
COVERAGE STRATEGY:

TARGET BY RISK:
Critical code (payments, auth): 100%
Core features: 85%+
Utilities: 70%+
Config/setup: 0% (don't test)

MEANINGFUL COVERAGE:
- Test behavior, not implementation
- Test what can break
- Skip trivial code

COVERAGE QUESTIONS:
Before writing test, ask:
"What bug would this catch?"
If answer is "none" → Skip

DON'T TEST:
- Simple getters/setters
- Framework code
- Third-party libraries
- Config constants
- Type declarations

DO TEST:
- Business logic
- Edge cases
- Error handling
- Integration points
- Complex conditionals

COVERAGE RULE:
80% meaningful > 100% pointless
```

---

## 2. The Test-After-Everything

**The Mistake:**
```
Development timeline:
Week 1-4: Build feature
Week 5: "Now let's add tests"

Reality:
- Code is untestable
- Tests are afterthought
- Tests written to pass, not to verify
- Edge cases forgotten
```

**Why It's Wrong:**
- Untestable code requires refactoring
- Testing feels like chore, not design
- Easy paths tested, hard paths skipped
- Tests verify implementation, not requirements

**Better Approach:**
```
TEST-FIRST (TDD):
1. Write failing test
2. Write minimal code to pass
3. Refactor
4. Repeat

TDD BENEFITS:
- Code is testable by design
- Tests define requirements
- Fast feedback loop
- Better design emerges

IF NOT FULL TDD:
At minimum: Test alongside code.
Not: Build everything, then test.

TEST TIMING:
Bad: Feature done → Add tests
Good: Test → Code → Test
Best: Failing test → Code → Passing test

TESTABLE CODE:
Writing tests first forces:
- Smaller functions
- Clearer interfaces
- Dependency injection
- Single responsibility

COVERAGE HAPPENS:
When you test first,
coverage is natural,
not a chore.
```

---

## 3. The Brittle Selector Syndrome

**The Mistake:**
```
Test selectors:
await page.click('.btn-primary.submit-form.mt-4')
await page.click('div > form > button:nth-child(3)')
await page.click('#root > div > div.container > form > button')

CSS changes:
Button moves → Tests break
Class renamed → Tests break
Layout changed → Tests break
```

**Why It's Wrong:**
- Styling changes break tests
- Implementation details in tests
- Tests are maintenance burden
- Team stops trusting tests

**Better Approach:**
```
SELECTOR STRATEGY:

BEST: Data test IDs
<button data-testid="submit-button">Submit</button>
await page.click('[data-testid="submit-button"]')

GOOD: Accessible selectors
await page.getByRole('button', { name: 'Submit' })
await page.getByLabel('Email')
await page.getByText('Sign Up')

ACCEPTABLE: Semantic selectors
await page.click('button[type="submit"]')
await page.click('form#signup button')

AVOID: Implementation selectors
await page.click('.btn-primary.mt-4')
await page.click('div:nth-child(3) > button')

SELECTOR HIERARCHY:
1. data-testid (explicit, stable)
2. Role + name (accessible)
3. Label text (accessible)
4. Semantic HTML (structural)
5. CSS classes (AVOID)

DATA-TESTID CONVENTION:
<button data-testid="signup-submit">Submit</button>
<input data-testid="signup-email" />
<div data-testid="error-message">{error}</div>

Only add test IDs for tested elements.
Not every element needs one.
```

---

## 4. The Mocking Madness

**The Mistake:**
```
Test setup:
vi.mock('./database')
vi.mock('./api')
vi.mock('./cache')
vi.mock('./logger')
vi.mock('./config')
vi.mock('./utils')

test('it works', () => {
  // Test code that doesn't actually run real code
})

Result:
All mocks return success.
Real code paths untested.
Bugs in real integrations missed.
```

**Why It's Wrong:**
- Mocking everything = testing nothing
- Mocks can become out of sync
- Real bugs happen at integration points
- False confidence from passing tests

**Better Approach:**
```
MOCK SPARINGLY:

MOCK:
✓ External services (payment APIs)
✓ Non-deterministic (time, random)
✓ Expensive operations (email sending)
✓ Unavailable in test (production APIs)

DON'T MOCK:
✗ Your own code
✗ Database (use test database)
✗ Internal services (run them)
✗ Utilities and helpers

MOCK BOUNDARY RULE:
Mock at the edges of your system.
Test real code in the middle.

EXAMPLE:
// DON'T: Mock your own function
vi.mock('./calculateTotal', () => ({
  calculateTotal: () => 100
}))

// DO: Test calculateTotal with real inputs
expect(calculateTotal([{ price: 50 }, { price: 50 }]))
  .toBe(100)

// DO: Mock external API
vi.mock('./stripeClient', () => ({
  charge: vi.fn().mockResolvedValue({ success: true })
}))

INTEGRATION TESTS:
Run real database.
Run real services (Docker).
Mock only truly external.
```

---

## 5. The Giant Test File

**The Mistake:**
```
user.test.ts:
- 2000 lines
- 50 tests
- Covers login, signup, profile, settings,
  preferences, notifications, billing...

One file for everything.
Slow to run.
Hard to navigate.
Impossible to parallelize.
```

**Why It's Wrong:**
- Can't run subset of tests
- Hard to find tests
- Can't parallelize
- One failure = debug entire file

**Better Approach:**
```
TEST FILE STRUCTURE:

BY FEATURE:
tests/
  auth/
    login.test.ts
    signup.test.ts
    password-reset.test.ts
  billing/
    checkout.test.ts
    subscriptions.test.ts
  profile/
    settings.test.ts
    preferences.test.ts

FILE SIZE LIMITS:
- Under 200 lines per file
- Under 10 tests per file
- One "describe" block typically

NAMING CONVENTION:
[feature].[type].test.ts
login.unit.test.ts
login.integration.test.ts
login.e2e.test.ts

ORGANIZATION:
describe('Login', () => {
  describe('with valid credentials', () => {
    test('logs in successfully', ...)
    test('redirects to dashboard', ...)
  })

  describe('with invalid credentials', () => {
    test('shows error message', ...)
    test('allows retry', ...)
  })
})

BENEFITS:
- Run single file: npm test login
- Parallel execution
- Easy to find tests
- Clear scope per file
```

---

## 6. The Retry-Until-Green

**The Mistake:**
```
CI behavior:
Test fails → Retry
Test fails → Retry
Test fails → Retry
Test passes → "Success!"

Test marked as passing.
Bug not investigated.
Same flakiness next run.
```

**Why It's Wrong:**
- Flaky tests are broken tests
- Retries hide real failures
- Team ignores test results
- Bugs slip through

**Better Approach:**
```
FLAKY TEST POLICY:

DETECTION:
Track tests that fail then pass on retry.
Flag as flaky.
Report in CI output.

ACTION:
Flaky test → Immediately investigated
Either: Fix the test
Or: Quarantine the test

QUARANTINE:
Move to separate suite.
Runs but doesn't block.
Time limit to fix (1 week).
Delete if not fixed.

RETRY CONFIG:
// Allow retry but flag as flaky
{
  retries: 1,
  retryLog: true  // Log retried tests
}

FLAKY TEST CAUSES:
- Race conditions
- Timing dependencies
- Shared state
- Network issues
- Order dependencies

FIX STRATEGIES:
Race condition → Proper waits
Timing → Condition-based waits
Shared state → Isolation
Network → Mock or retry logic

NO RETRY IDEAL:
Best suite: Zero retries needed.
Every test passes first time.
Flakiness = broken test.
```

---

## 7. The Test Comment Novel

**The Mistake:**
```
test('user signup', async () => {
  // First we need to set up the test environment
  // by creating a new browser context and navigating
  // to the signup page. We use incognito to ensure
  // clean state.

  const context = await browser.newContext()
  const page = await context.newPage()

  // Now we navigate to the signup page. We use the
  // base URL from config plus the signup path...

  await page.goto('/signup')

  // ... 200 lines of comments ...
})

Comments > Code
```

**Why It's Wrong:**
- Comments that restate code are useless
- Good tests are self-documenting
- Excessive comments mask unclear tests
- Maintenance burden

**Better Approach:**
```
SELF-DOCUMENTING TESTS:

// BAD: Comment explains code
// Click the submit button
await page.click('.submit')

// GOOD: Code explains itself
await signupPage.submit()

// BAD: Explain what, not why
// Set email to test@test.com
await page.fill('#email', 'test@test.com')

// GOOD: Test name explains intent
test('shows error for invalid email format', async () => {
  await signupPage.fillEmail('invalid-email')
  await signupPage.submit()
  await signupPage.expectError('Invalid email format')
})

WHEN TO COMMENT:
- Non-obvious workarounds
- Important context
- Explain "why", not "what"

COMMENT EXAMPLES:
// Workaround: API is slow in test env
await page.waitForResponse('/api/users')

// Must clear cookies first due to SSO
await context.clearCookies()

BETTER THAN COMMENTS:
- Descriptive test names
- Page objects with clear methods
- Helper functions with good names
- Clear arrange-act-assert structure
```

---

## 8. The Test Data Hardcoding

**The Mistake:**
```
test('login works', async () => {
  await page.fill('#email', 'john@company.com')
  await page.fill('#password', 'password123')
  await page.click('#submit')
  await expect(page.locator('.welcome'))
    .toContainText('John')
})

Run in parallel: Both use same user
Run twice: User might be deleted
Different env: User doesn't exist
```

**Why It's Wrong:**
- Tests conflict in parallel
- Environment-dependent failures
- Brittle to data changes
- Order-dependent tests

**Better Approach:**
```
DYNAMIC TEST DATA:

// Factory creates unique user
test('login works', async () => {
  const user = await createTestUser()

  await page.fill('#email', user.email)
  await page.fill('#password', user.password)
  await page.click('#submit')

  await expect(page.locator('.welcome'))
    .toContainText(user.name)
})

DATA FACTORY:
function createTestUser(overrides = {}) {
  const id = uuidv4()
  return {
    email: `test-${id}@test.com`,
    password: 'SecurePass123!',
    name: `Test User ${id.slice(0, 8)}`,
    ...overrides
  }
}

DATA ISOLATION:
- Unique identifiers per test
- Create fresh data per test
- Clean up after test
- No shared state

ENVIRONMENT HANDLING:
// Use env-specific URLs
const baseUrl = process.env.TEST_URL || 'http://localhost:3000'

// Seed data per environment
await seedTestData(env)

DATA STRATEGIES:
1. Create → Test → Delete (clean up)
2. Transaction → Rollback (DB tests)
3. Fresh container per suite
4. Unique data per test (UUID)
```

---

## 9. The Assertion Avalanche

**The Mistake:**
```
test('user profile page', async () => {
  expect(page.locator('.name')).toBeVisible()
  expect(page.locator('.name')).toHaveText('John')
  expect(page.locator('.email')).toBeVisible()
  expect(page.locator('.email')).toHaveText('john@test.com')
  expect(page.locator('.avatar')).toBeVisible()
  expect(page.locator('.avatar')).toHaveAttribute('src', '...')
  expect(page.locator('.bio')).toBeVisible()
  expect(page.locator('.joined')).toBeVisible()
  expect(page.locator('.posts')).toBeVisible()
  expect(page.locator('.followers')).toBeVisible()
  // ... 50 more assertions
})

First assertion fails → No idea what's broken
All visible assertions → Redundant with text assertions
```

**Why It's Wrong:**
- One test, many assertions = unclear failures
- Visible + text = redundant
- Hard to maintain
- Not focused on specific behavior

**Better Approach:**
```
FOCUSED ASSERTIONS:

ONE BEHAVIOR PER TEST:
test('displays user name', async () => {
  await page.goto(`/profile/${user.id}`)
  await expect(page.locator('.name')).toHaveText(user.name)
})

test('displays user email', async () => {
  await page.goto(`/profile/${user.id}`)
  await expect(page.locator('.email')).toHaveText(user.email)
})

RELATED ASSERTIONS:
test('displays user info', async () => {
  const profile = page.locator('.profile')

  await expect(profile.locator('.name')).toHaveText(user.name)
  await expect(profile.locator('.email')).toHaveText(user.email)
  // Related assertions about the same concept
})

ASSERTION GUIDELINES:
- 1-5 assertions per test
- Related assertions can group
- Each test has clear purpose
- Failure points to specific issue

AVOID:
- Asserting same thing twice
- toBeVisible + toHaveText
- Asserting implementation details
- Asserting unrelated things

ASSERTION PATTERN:
Assert outcome, not journey.
Assert behavior, not structure.
Assert requirements, not implementation.
```

---

## 10. The Screenshot Cemetery

**The Mistake:**
```
Screenshot folder:
- screenshot_1.png
- screenshot_2.png
- screenshot_1_retry.png
- screenshot_2_retry.png
- screenshot_before.png
- screenshot_after.png
- debug_screenshot.png
- test_failed_screenshot.png
... 500 files, 2GB

Never reviewed.
Never deleted.
Storage full.
```

**Why It's Wrong:**
- Screenshots without purpose
- No one reviews them
- Storage accumulates
- Slows down CI

**Better Approach:**
```
SCREENSHOT STRATEGY:

CAPTURE ON FAILURE ONLY:
// playwright.config.ts
{
  screenshot: 'only-on-failure',
  trace: 'retain-on-failure'
}

MEANINGFUL NAMES:
screenshot_login_failed_2024-01-15.png
checkout_error_missing_address.png

CLEANUP POLICY:
- Delete after 7 days
- Keep only failed tests
- Archive for investigation

TRACE > SCREENSHOT:
Playwright trace = Full recording
Better than static screenshot.
Shows what happened before failure.

VIDEO FOR FLAKY:
Record video for flaky tests.
Watch what actually happened.
Not just final state.

SCREENSHOT USE CASES:
✓ Failure investigation
✓ Visual regression (specific)
✓ Bug reports

✗ Every test
✗ Success states
✗ "Just in case"

CI CLEANUP:
# Delete screenshots older than 7 days
find ./screenshots -mtime +7 -delete
```

---

## 11. The Timeout Trap

**The Mistake:**
```
// Global timeout: 30 seconds
test('quick api call', async () => {
  // Waits 30s even if it should fail in 1s
  await api.get('/fast-endpoint')
})

test('slow operation', async () => {
  // Times out at 30s, but operation takes 45s
  await processLargeFile()
})

All tests use same timeout.
Wrong timeout for each test.
```

**Why It's Wrong:**
- Fast tests wait too long to fail
- Slow tests fail incorrectly
- Wastes CI time
- Hides performance issues

**Better Approach:**
```
APPROPRIATE TIMEOUTS:

PER-TEST TIMEOUT:
test('quick check', async () => {
  await api.get('/health')
}, 5000)  // 5 seconds

test('slow import', async () => {
  await importLargeDataset()
}, 120000)  // 2 minutes

DEFAULT BY TYPE:
// Unit tests: 5s
// Integration: 30s
// E2E: 60s

TIMEOUT STRATEGY:
Default: 30 seconds
Override for specific cases.
Never just increase global.

TIMEOUT AS SIGNAL:
If test needs long timeout:
- Is the operation too slow?
- Should it be async?
- Is there a bug?

TIMEOUT CONFIG:
// playwright.config.ts
{
  timeout: 30000,
  expect: { timeout: 5000 },
}

// Per test
test.setTimeout(60000)

TIMEOUT BEST PRACTICES:
- Shortest timeout that works
- Explicit timeout for slow tests
- Investigate timeouts as bugs
- Don't just increase blindly
```

---

## 12. The Environment Assumption

**The Mistake:**
```
test('sends email', async () => {
  // Assumes SMTP server is running
  // Assumes email will arrive
  // Assumes mailbox is accessible
  await signup('test@example.com')
  await checkEmailArrived('test@example.com')
})

Works locally (mailhog).
Fails in CI (no SMTP).
Fails in prod (real emails!).
```

**Why It's Wrong:**
- Tests depend on environment
- Same test, different results
- Production side effects
- CI failures are mysteries

**Better Approach:**
```
ENVIRONMENT ISOLATION:

MOCK EXTERNAL SERVICES:
test('sends email', async () => {
  const mockEmail = vi.fn()
  vi.mock('./emailClient', () => ({
    send: mockEmail
  }))

  await signup('test@test.com')

  expect(mockEmail).toHaveBeenCalledWith({
    to: 'test@test.com',
    template: 'welcome'
  })
})

CONTAINER SERVICES:
// docker-compose.test.yml
services:
  mailhog:
    image: mailhog/mailhog
  postgres:
    image: postgres:15

ENVIRONMENT DETECTION:
const config = {
  email: process.env.CI
    ? mockEmailClient
    : realEmailClient
}

ENVIRONMENT CHECKLIST:
□ Tests work in CI
□ Tests work locally
□ No production side effects
□ External services mocked or containerized
□ Environment variables documented

CONFIGURATION:
// Test config
export const testConfig = {
  database: process.env.TEST_DATABASE_URL,
  apiUrl: process.env.TEST_API_URL || 'http://localhost:3000',
  mockExternalAPIs: true
}
```
