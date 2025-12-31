# Decisions: QA Engineering

Critical decisions that determine test effectiveness and team productivity.

---

## Decision 1: Testing Framework Selection

**Context:** Choosing the right testing framework for your stack.

**Options:**

| Framework | Best For | Pros | Cons |
|-----------|----------|------|------|
| **Jest** | Node/React | Batteries-included, popular | Slower, ESM issues |
| **Vitest** | Vite/Modern | Fast, modern, ESM native | Newer, less ecosystem |
| **Playwright** | E2E | Cross-browser, powerful | Learning curve |
| **Cypress** | E2E | Developer experience | Chrome-focused |
| **pytest** | Python | Flexible, mature | Python only |

**Framework:**
```
Framework selection by layer:

UNIT TESTS:
JavaScript: Vitest or Jest
TypeScript: Vitest (ESM-native)
React: Vitest + Testing Library
Python: pytest
Go: Built-in testing

INTEGRATION TESTS:
APIs: Supertest, pytest
Components: Testing Library
Services: Same as unit

E2E TESTS:
Cross-browser needed: Playwright
Developer focus: Cypress
Mobile testing: Appium, Detox

SELECTION CRITERIA:
1. Language/framework compatibility
2. Team familiarity
3. Speed requirements
4. Browser support needs
5. CI integration

MODERN STACK DEFAULT:
Unit/Integration: Vitest + Testing Library
E2E: Playwright

MIGRATION CONSIDERATION:
Existing Jest? Stay unless issues.
New project? Consider Vitest.
E2E from scratch? Playwright.

FRAMEWORK ECOSYSTEM:
Jest: @testing-library/jest-dom
Vitest: @testing-library/react
Playwright: Built-in assertions
Cypress: cypress-testing-library
```

**Default Recommendation:** Vitest for unit/integration (new projects), Playwright for E2E.

---

## Decision 2: Test Data Strategy

**Context:** How to handle test data across the test suite.

**Options:**

| Strategy | Description | Pros | Cons |
|----------|-------------|------|------|
| **Factories** | Generate unique data | Isolated, parallel | Setup overhead |
| **Fixtures** | Pre-created static data | Simple, predictable | Shared state |
| **Snapshots** | Copy production | Realistic | Privacy, maintenance |
| **Seeding** | Script-created data | Repeatable | Ordering complexity |

**Framework:**
```
Data strategy selection:

TEST TYPE → DATA STRATEGY:

UNIT TESTS:
Factories: Generate inline
const user = createTestUser()
Quick, unique, isolated.

INTEGRATION TESTS:
Factories + Cleanup:
beforeEach: Create test data
afterEach: Clean up
Isolation per test.

E2E TESTS:
Seeding + Factories:
beforeAll: Seed base data
Each test: Create unique data
Balance speed and isolation.

DATA ISOLATION LEVELS:

FULL ISOLATION (Best):
- Each test creates own data
- Each test cleans up
- No shared state
- Parallel safe

SUITE ISOLATION (Good):
- Suite shares seed data
- Tests create unique records
- Clean between suites

SHARED DATA (Risky):
- All tests share data
- Order dependent
- Not parallel safe
- Only for read-only tests

FACTORY PATTERNS:
// Build (no persistence)
const user = UserFactory.build()

// Create (persisted)
const user = await UserFactory.create()

// With traits
const admin = await UserFactory.create('admin')

DATABASE CLEANUP:
- Transactions: Rollback after test
- Truncation: Clear tables before suite
- Deletion: Delete created records
- Containers: Fresh DB per suite
```

**Default Recommendation:** Factories for unique data, transactions for database isolation, full isolation for E2E.

---

## Decision 3: Coverage Targets

**Context:** Setting appropriate test coverage thresholds.

**Options:**

| Target | Use Case | Trade-off |
|--------|----------|-----------|
| **70%** | Baseline | Miss edge cases |
| **80%** | Standard | Good balance |
| **90%** | Critical systems | Maintenance burden |
| **100%** | Almost never | Diminishing returns |

**Framework:**
```
Coverage target by code type:

CRITICAL CODE (90-100%):
- Authentication
- Payment processing
- Data encryption
- Access control
- Core business logic

STANDARD CODE (80%):
- Feature logic
- API handlers
- UI components
- Services

UTILITIES (70%):
- Helper functions
- Format utilities
- Validation

SKIP TESTING (0%):
- Configuration files
- Type definitions
- Generated code
- Third-party wrappers

COVERAGE CONFIGURATION:
// vitest.config.ts
{
  coverage: {
    thresholds: {
      global: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80
      },
      'src/auth/**': {
        statements: 95,
        branches: 90
      }
    }
  }
}

COVERAGE METRICS:

LINES: Was line executed?
Baseline metric.

BRANCHES: Were all paths taken?
More meaningful.

FUNCTIONS: Were all functions called?
Catch unused code.

STATEMENTS: Individual statements.
Most granular.

COVERAGE RULE:
Coverage should increase or stay stable.
New code requires tests.
Don't let coverage decrease.
```

**Default Recommendation:** 80% overall, 90%+ for critical paths, enforce on new code.

---

## Decision 4: E2E Test Scope

**Context:** Deciding what to cover with E2E tests.

**Options:**

| Scope | Coverage | Trade-off |
|-------|----------|-----------|
| **Critical paths only** | 5-10 tests | Fast, focused | Less coverage |
| **User journeys** | 20-50 tests | Complete flows | Slower CI |
| **Feature coverage** | 100+ tests | Comprehensive | Maintenance heavy |

**Framework:**
```
E2E scope decision:

CRITICAL PATHS ONLY (Recommended):
5-10 E2E tests covering:
- Sign up and login
- Core product action
- Payment flow
- Key integration

USER JOURNEYS (If resources):
20-50 E2E tests covering:
- All critical paths
- Major user flows
- Happy paths per feature
- Key error states

FEATURE COVERAGE (Avoid):
100+ E2E tests
Slow, fragile, expensive.
Push to lower pyramid levels.

E2E TEST SELECTION:
Ask: "If this broke, would we lose money?"
Yes → E2E test
No → Lower level test

CRITICAL PATH EXAMPLES:
1. New user signup + first action
2. Returning user login + main flow
3. Purchase/subscribe flow
4. Core feature happy path

E2E TIMING:
CI: Critical paths only (fast)
Nightly: User journeys (comprehensive)
Release: Full suite

E2E MAINTENANCE:
Each E2E test = maintenance cost.
More tests = more maintenance.
Keep E2E count minimal.

E2E QUALITY > QUANTITY:
10 reliable tests > 100 flaky tests
Fast CI > comprehensive CI
Trust in tests > test count
```

**Default Recommendation:** 10-20 critical path E2E tests. Push everything else to unit/integration.

---

## Decision 5: CI Test Execution Strategy

**Context:** How to run tests in continuous integration.

**Options:**

| Strategy | Speed | Coverage | Trade-off |
|----------|-------|----------|-----------|
| **All tests every commit** | Slow | Full | Long CI times |
| **Affected tests only** | Fast | Partial | May miss issues |
| **Tiered** | Balanced | Smart | Complexity |
| **Parallel shards** | Fast | Full | Resource cost |

**Framework:**
```
CI execution strategy:

TIERED APPROACH (Recommended):
PR: Unit + Integration + Critical E2E
Merge: Full E2E suite
Nightly: Performance + Extended

TIER CONFIGURATION:

TIER 1 (Every push):
- Unit tests
- Integration tests
- Linting
- Type checking
Target: < 5 minutes

TIER 2 (Every PR):
- All of Tier 1
- Critical E2E tests
- Build verification
Target: < 15 minutes

TIER 3 (Merge to main):
- Full E2E suite
- Visual regression
- Smoke tests
Target: < 30 minutes

TIER 4 (Nightly/Weekly):
- Performance tests
- Load tests
- Full regression
- Cross-browser
Target: < 2 hours

PARALLEL EXECUTION:
# GitHub Actions
jobs:
  test:
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
    steps:
      - run: npm test -- --shard ${{ matrix.shard }}/4

AFFECTED TESTS:
Run tests for changed files.
Use: nx affected, turborepo
Risk: May miss integration issues.
Solution: Full suite on merge.

CI TIME TARGETS:
Push feedback: < 5 min
PR feedback: < 15 min
Merge verification: < 30 min
```

**Default Recommendation:** Tiered execution with parallel shards. Unit tests on every push, full E2E on merge.

---

## Decision 6: Browser Coverage

**Context:** Which browsers to test in E2E.

**Options:**

| Coverage | Browsers | Trade-off |
|----------|----------|-----------|
| **Chrome only** | 1 | Fast, 65% coverage |
| **Major browsers** | 3 | Balanced, 95% coverage |
| **All browsers** | 5+ | Complete, slow |
| **Mobile included** | +2 | Responsive, complex |

**Framework:**
```
Browser coverage decision:

USAGE DATA FIRST:
Check your analytics.
Focus on actual user browsers.
Don't test unused browsers.

TYPICAL DISTRIBUTION:
Chrome: 65%
Safari: 20%
Firefox: 10%
Edge: 5%

RECOMMENDED COVERAGE:

MINIMUM:
- Chrome (most users)
- Safari (significant, different engine)
Run: Every E2E test

EXTENDED:
- Add Firefox
- Add Edge
Run: Nightly or release

MOBILE:
- Chrome Mobile
- Safari iOS
Run: For responsive products

CONFIGURATION:
// playwright.config.ts
projects: [
  { name: 'chrome', use: { ...devices['Desktop Chrome'] }},
  { name: 'safari', use: { ...devices['Desktop Safari'] }},
  { name: 'mobile', use: { ...devices['iPhone 14'] }},
]

CI STRATEGY:
Every PR: Chrome only
Merge: Chrome + Safari
Release: All browsers

BROWSER-SPECIFIC TESTS:
Most tests: Run on all browsers
Some tests: Browser-specific behavior
Few tests: Skip incompatible browsers

MOBILE TESTING:
Responsive design: Viewport testing
Native features: Emulator testing
Real devices: For release
```

**Default Recommendation:** Chrome + Safari for CI. All browsers for releases. Include mobile viewport.

---

## Decision 7: Flaky Test Policy

**Context:** How to handle intermittently failing tests.

**Options:**

| Policy | Approach | Trade-off |
|--------|----------|-----------|
| **Zero tolerance** | Fail CI on any flakiness | Blocks progress |
| **Quarantine** | Isolate flaky tests | Tests accumulate |
| **Auto-retry** | Retry failed tests | Hides issues |
| **Track and fix** | Flag, don't fail | Requires discipline |

**Framework:**
```
Flaky test policy:

RECOMMENDED APPROACH:
1. Detect: Flag tests that pass on retry
2. Track: Record flaky test rate
3. Quarantine: Move to separate suite
4. Fix: Time-boxed fix period
5. Delete: Remove if not fixed

DETECTION:
// playwright.config.ts
{
  retries: 1,
  reporter: [['html'], ['./flaky-reporter.js']]
}

// Track test that needed retry
if (testInfo.retry > 0) {
  flagAsFlaky(testInfo.title)
}

QUARANTINE PROCESS:
1. Test fails intermittently
2. Move to quarantine suite
3. Runs but doesn't block CI
4. 2-week fix deadline
5. Delete if not fixed

QUARANTINE RULES:
- Max 10 tests in quarantine
- Visible in CI output
- Weekly review
- Owner assigned

FIX STRATEGIES:
Race condition → Proper waits
Timing → Condition-based waits
Shared state → Isolation
Network → Mock or stabilize

METRICS:
- Flaky test count (trend down)
- Time in quarantine
- Fix rate
- False positive rate

ZERO TOLERANCE GOAL:
Ultimate goal: Zero flaky tests
Reality: Some will exist
Balance: Quarantine + fix cadence
```

**Default Recommendation:** Quarantine policy with 2-week fix window. Delete unfixed tests.

---

## Decision 8: Test Review Process

**Context:** How to review tests in code review.

**Options:**

| Process | Rigor | Trade-off |
|---------|-------|-----------|
| **No review** | None | Fast but risky |
| **Same as code** | Medium | Balanced |
| **Dedicated QA review** | High | Slower, specialized |
| **Test-first review** | Highest | Tests drive code |

**Framework:**
```
Test review process:

RECOMMENDED APPROACH:
Tests reviewed same as code.
Focus areas differ.

CODE REVIEW:
- Logic correctness
- Performance
- Security
- Style

TEST REVIEW:
- Coverage of requirements
- Edge cases covered
- Test isolation
- Assertion quality
- Flakiness risk

TEST REVIEW CHECKLIST:
□ Tests requirements, not implementation
□ Edge cases covered
□ No flakiness risks (hardcoded waits)
□ Good test isolation
□ Clear test names
□ Meaningful assertions
□ No test duplication

REVIEW QUESTIONS:
"What bug would this catch?"
"What if this was deleted?"
"Would this break if feature changed?"

NO TESTS = NO MERGE:
Feature changes → Test changes
New feature → New tests
Bug fix → Regression test

TEST-FIRST IN REVIEW:
Review tests before code.
Tests should explain what code does.
Tests are the specification.

QA INVOLVEMENT:
QA reviews E2E tests.
Developers review unit tests.
Cross-review catches more.
```

**Default Recommendation:** Same rigor as code review. Use checklist. QA reviews E2E tests.

---

## Decision 9: Test Naming Convention

**Context:** How to name tests for clarity and organization.

**Options:**

| Style | Example | Trade-off |
|-------|---------|-----------|
| **Descriptive** | `should return user when id exists` | Readable, long |
| **BDD** | `given valid id, returns user` | Spec-like |
| **Short** | `getUser_validId` | Concise, less clear |
| **Hierarchical** | `describe > context > test` | Organized |

**Framework:**
```
Test naming convention:

RECOMMENDED: Descriptive + Hierarchical

STRUCTURE:
describe('Component/Function', () => {
  describe('when [context]', () => {
    it('should [expected behavior]', () => {
      // test
    })
  })
})

EXAMPLE:
describe('UserService', () => {
  describe('getUser', () => {
    describe('when user exists', () => {
      it('should return user object', () => {})
      it('should include user profile', () => {})
    })

    describe('when user does not exist', () => {
      it('should return null', () => {})
    })
  })
})

NAMING RULES:
- Start with "should" or action verb
- Describe expected behavior
- Include relevant context
- Avoid implementation details

GOOD NAMES:
✓ "should display error for invalid email"
✓ "returns empty array when no results"
✓ "redirects to login when unauthenticated"

BAD NAMES:
✗ "test1"
✗ "works correctly"
✗ "calls the API"

TEST OUTPUT:
UserService
  getUser
    when user exists
      ✓ should return user object
      ✓ should include user profile
    when user does not exist
      ✓ should return null

NAME-AS-DOCUMENTATION:
Test names = specification.
Reading tests explains feature.
No additional docs needed.
```

**Default Recommendation:** Hierarchical describe blocks with descriptive "should" statements.

---

## Decision 10: Mock vs. Real Dependencies

**Context:** When to mock dependencies vs. use real implementations.

**Options:**

| Approach | Description | Trade-off |
|----------|-------------|-----------|
| **Mock everything** | All deps mocked | Fast, brittle |
| **Mock external only** | External services mocked | Balanced |
| **Minimal mocking** | Only when necessary | Realistic, slower |
| **Integration envs** | Real services in containers | Slowest, most realistic |

**Framework:**
```
Mocking decision matrix:

ALWAYS MOCK:
- External APIs (payment, email)
- Time (Date.now, timers)
- Random (Math.random, crypto)
- Environment variables

MOCK OR REAL (Context-dependent):
- Database → Mock for unit, real for integration
- Internal APIs → Mock for unit, real for integration
- File system → Mock for unit, real for integration

NEVER MOCK:
- The code being tested
- Pure utility functions
- Framework code
- Simple transformations

TESTING LAYER → MOCK LEVEL:

UNIT TESTS:
Mock: All external dependencies
Real: Code under test

INTEGRATION TESTS:
Mock: External services
Real: Your services, database

E2E TESTS:
Mock: External APIs
Real: Everything else

MOCK BOUNDARIES:
┌────────────────────────────────┐
│     Your Application           │
│  Real code tested here         │
│                                │
│  ┌──────────┐  ┌──────────┐   │
│  │ Database │  │  Cache   │   │
│  │  (real)  │  │  (real)  │   │
│  └──────────┘  └──────────┘   │
│                                │
└────────────────────────────────┘
        │                │
        ▼ Mock here      ▼ Mock here
   External API     External Service

CONTAINER STRATEGY:
// docker-compose.test.yml
services:
  postgres: image: postgres:15
  redis: image: redis:7
  mailhog: image: mailhog

Run real services, mock only external.
```

**Default Recommendation:** Mock external services only. Use containers for databases and caches.
