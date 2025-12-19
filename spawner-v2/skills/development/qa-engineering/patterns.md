# Patterns: QA Engineering

Proven approaches for building reliable, maintainable test suites.

---

## Pattern 1: The Testing Pyramid

**Context:** Structuring test distribution for optimal coverage and speed.

**The Pattern:**
```
THE PYRAMID:

              /\
             /  \
            / E2E \      (Few - 10%)
           /______\      Critical paths only
          /        \
         /  INTEG   \    (Some - 20%)
        /____________\   Component integration
       /              \
      /     UNIT       \ (Many - 70%)
     /__________________\ Fast, isolated

UNIT TESTS (70%):
Purpose: Test individual functions/components
Speed: Milliseconds
Isolation: Complete
Coverage: All edge cases
Tools: Jest, Vitest, pytest

INTEGRATION TESTS (20%):
Purpose: Test component interactions
Speed: Seconds
Isolation: Module level
Coverage: Key integrations
Tools: Testing Library, Supertest

E2E TESTS (10%):
Purpose: Test critical user journeys
Speed: Seconds to minutes
Isolation: None (full stack)
Coverage: Happy paths
Tools: Playwright, Cypress

PYRAMID BENEFITS:
- Fast feedback (most tests are fast)
- Easy debugging (unit failures are specific)
- Comprehensive coverage (pyramid shape)
- Sustainable maintenance

ANTI-PYRAMID (ICE CREAM CONE):
Many E2E, few unit tests
Slow CI, hard debugging
Don't do this.

WHEN TO BREAK PYRAMID:
- Heavy UI product: More E2E okay
- API product: More integration okay
- But always have unit test base
```

---

## Pattern 2: The Page Object Model

**Context:** Organizing E2E tests for maintainability.

**The Pattern:**
```
PURPOSE:
Separate page structure from test logic.
One place to update when UI changes.
Reusable page interactions.

STRUCTURE:
tests/
  pages/
    LoginPage.ts
    DashboardPage.ts
    CheckoutPage.ts
  specs/
    login.spec.ts
    checkout.spec.ts

PAGE OBJECT EXAMPLE:
// pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  // Selectors
  private emailInput = '[data-testid="email"]'
  private passwordInput = '[data-testid="password"]'
  private submitButton = '[data-testid="submit"]'
  private errorMessage = '[data-testid="error"]'

  // Actions
  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.page.fill(this.emailInput, email)
    await this.page.fill(this.passwordInput, password)
    await this.page.click(this.submitButton)
  }

  // Assertions
  async expectError(message: string) {
    await expect(this.page.locator(this.errorMessage))
      .toHaveText(message)
  }
}

TEST USING PAGE OBJECT:
// specs/login.spec.ts
test('shows error for invalid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page)

  await loginPage.goto()
  await loginPage.login('wrong@email.com', 'wrong')
  await loginPage.expectError('Invalid credentials')
})

BENEFITS:
- UI changes update one file
- Tests are readable
- Actions are reusable
- Selectors are centralized
```

---

## Pattern 3: The Test Data Factory

**Context:** Creating test data that is isolated and realistic.

**The Pattern:**
```
PURPOSE:
Generate unique test data.
Avoid test collisions.
Make tests independent.

FACTORY EXAMPLE:
// factories/userFactory.ts
import { faker } from '@faker-js/faker'

export function createTestUser(overrides = {}) {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    createdAt: new Date().toISOString(),
    ...overrides
  }
}

export function createTestProduct(overrides = {}) {
  return {
    id: faker.string.uuid(),
    name: faker.commerce.productName(),
    price: parseFloat(faker.commerce.price()),
    ...overrides
  }
}

USAGE IN TESTS:
test('displays user name', async () => {
  const user = createTestUser({ name: 'John Doe' })
  await createUserInDB(user)

  await page.goto(`/users/${user.id}`)
  await expect(page.locator('.name')).toHaveText('John Doe')
})

FACTORY BENEFITS:
- Unique data per test
- Realistic test data
- Overridable for specific cases
- No collisions in parallel

FACTORY PATTERNS:

BASIC FACTORY:
createUser() → Returns user object

BUILD FACTORY:
User.build() → Object (not in DB)
User.create() → Object + saved to DB

SEQUENCE FACTORY:
let seq = 0
createUser() → user_{seq++}@test.com
Unique emails without randomness

TRAIT FACTORY:
createUser('admin') → Admin user
createUser('unverified') → Unverified user
```

---

## Pattern 4: The Arrange-Act-Assert Pattern

**Context:** Structuring individual tests for clarity.

**The Pattern:**
```
AAA = Arrange → Act → Assert

STRUCTURE:
test('description of expected behavior', async () => {
  // ARRANGE: Set up test conditions
  const user = await createTestUser()
  await page.goto('/dashboard')

  // ACT: Perform the action being tested
  await page.click('.create-project')
  await page.fill('.project-name', 'My Project')
  await page.click('.save')

  // ASSERT: Verify expected outcomes
  await expect(page.locator('.project-list'))
    .toContainText('My Project')
})

SECTIONS:

ARRANGE:
- Create test data
- Set up mocks
- Navigate to starting point
- Configure test state

ACT:
- Single action or user flow
- The thing being tested
- Usually one logical step

ASSERT:
- Verify outcomes
- Check state changes
- Validate UI updates
- Confirm data changes

EXAMPLE BREAKDOWN:

// ARRANGE
const mockProducts = [
  createTestProduct({ name: 'Laptop' }),
  createTestProduct({ name: 'Phone' })
]
await seedProducts(mockProducts)
await page.goto('/shop')

// ACT
await page.fill('.search', 'Laptop')
await page.click('.search-button')

// ASSERT
await expect(page.locator('.results')).toContainText('Laptop')
await expect(page.locator('.results')).not.toContainText('Phone')

AAA BENEFITS:
- Clear test structure
- Easy to read
- Easy to maintain
- Clear failure points
```

---

## Pattern 5: The Given-When-Then Pattern

**Context:** Writing behavior-driven tests from user perspective.

**The Pattern:**
```
GWT = Given → When → Then

PURPOSE:
Tests read like requirements.
User-focused, not implementation-focused.
Self-documenting tests.

STRUCTURE:
// Given [preconditions]
// When [action]
// Then [expected outcome]

EXAMPLE:
test('logged-in user can add items to cart', async () => {
  // Given a logged-in user on the product page
  await loginAsUser()
  await page.goto('/products/laptop-pro')

  // When they click Add to Cart
  await page.click('.add-to-cart')

  // Then the cart shows 1 item
  await expect(page.locator('.cart-count')).toHaveText('1')
})

BDD STYLE WITH COMMENTS:
test('User can checkout with saved card', async () => {
  // Given a user with a saved payment method
  const user = await createUserWithPayment()
  await loginAs(user)

  // And items in their cart
  await addItemToCart('product-1')

  // When they complete checkout
  await page.goto('/checkout')
  await page.click('.use-saved-card')
  await page.click('.place-order')

  // Then they see confirmation
  await expect(page.locator('.confirmation')).toBeVisible()

  // And their order is created
  const orders = await getOrdersForUser(user.id)
  expect(orders.length).toBe(1)
})

GWT BENEFITS:
- Requirements become tests
- Non-technical stakeholders can read
- Focus on behavior, not implementation
- Self-documenting
```

---

## Pattern 6: The Test Fixture Pattern

**Context:** Setting up and tearing down test environments consistently.

**The Pattern:**
```
PURPOSE:
Reusable test setup.
Consistent test environment.
Clean state between tests.

PLAYWRIGHT FIXTURES:
// fixtures.ts
import { test as base } from '@playwright/test'

type Fixtures = {
  authenticatedPage: Page
  testUser: User
}

export const test = base.extend<Fixtures>({
  testUser: async ({}, use) => {
    const user = await createTestUser()
    await use(user)
    await deleteUser(user.id)  // Cleanup
  },

  authenticatedPage: async ({ page, testUser }, use) => {
    await loginAs(page, testUser)
    await use(page)
  }
})

USING FIXTURES:
test('authenticated user sees dashboard', async ({
  authenticatedPage,
  testUser
}) => {
  await authenticatedPage.goto('/dashboard')
  await expect(authenticatedPage.locator('.welcome'))
    .toContainText(testUser.name)
})

JEST FIXTURES:
// fixtures/database.ts
beforeAll(async () => {
  await setupTestDatabase()
})

afterAll(async () => {
  await teardownTestDatabase()
})

beforeEach(async () => {
  await clearTables()
})

FIXTURE TYPES:
- Database fixtures (seed data)
- Authentication fixtures (logged-in state)
- Mock fixtures (API mocks)
- State fixtures (app state)

FIXTURE PRINCIPLES:
- Fast setup and teardown
- Independent tests
- Clean state per test
- Reusable across tests
```

---

## Pattern 7: The API Testing Contract

**Context:** Testing API interfaces systematically.

**The Pattern:**
```
PURPOSE:
Verify API contracts.
Test request/response structure.
Catch breaking changes.

API TEST STRUCTURE:

describe('GET /api/users/:id', () => {
  test('returns user for valid ID', async () => {
    const user = await createTestUser()

    const response = await api.get(`/api/users/${user.id}`)

    expect(response.status).toBe(200)
    expect(response.body).toMatchObject({
      id: user.id,
      email: user.email,
      name: user.name
    })
  })

  test('returns 404 for unknown ID', async () => {
    const response = await api.get('/api/users/unknown-id')

    expect(response.status).toBe(404)
    expect(response.body.error).toBe('User not found')
  })

  test('returns 401 without auth', async () => {
    const response = await api
      .get('/api/users/some-id')
      .set('Authorization', '')

    expect(response.status).toBe(401)
  })
})

API TEST CHECKLIST:
□ Success cases (200, 201)
□ Client errors (400, 401, 403, 404)
□ Server errors (500 handling)
□ Request validation
□ Response structure
□ Authentication
□ Authorization
□ Rate limiting

CONTRACT TESTING:
// Define contract
const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string()
})

// Validate response
const result = userSchema.safeParse(response.body)
expect(result.success).toBe(true)

TOOLS:
- Supertest (Express testing)
- Pact (Contract testing)
- Dredd (API Blueprint)
- Zod (Schema validation)
```

---

## Pattern 8: The Mock Boundary Pattern

**Context:** Deciding what to mock and what to test with real dependencies.

**The Pattern:**
```
PRINCIPLE:
Mock at boundaries.
Test real code.
Mock external dependencies.

MOCK BOUNDARIES:

┌─────────────────────────────────────┐
│         Your Application            │
│  ┌─────────┐      ┌─────────┐      │
│  │  Code   │──────│  Code   │      │
│  └─────────┘      └─────────┘      │
│        │                │          │
│        ▼                ▼          │
│  ┌─────────┐      ┌─────────┐      │
│  │ Database│      │  API    │      │
│  └────┬────┘      └────┬────┘      │
└───────┼────────────────┼───────────┘
        │    MOCK HERE   │
        ▼                ▼
   ┌─────────┐     ┌─────────┐
   │ Real DB │     │Real API │
   └─────────┘     └─────────┘

WHAT TO MOCK:
✓ External APIs (payment, email)
✓ Third-party services
✓ Time-dependent operations
✓ Random number generation
✓ File system (sometimes)

WHAT NOT TO MOCK:
✗ Your own code
✗ Framework code
✗ Simple utilities
✗ The thing you're testing

MOCK EXAMPLE:
// Mock external payment API
vi.mock('./paymentClient', () => ({
  processPayment: vi.fn().mockResolvedValue({
    success: true,
    transactionId: 'mock-123'
  })
}))

// Test your code with mock
test('checkout processes payment', async () => {
  const result = await checkout(cart, paymentDetails)

  expect(result.success).toBe(true)
  expect(paymentClient.processPayment)
    .toHaveBeenCalledWith(paymentDetails)
})

MOCK PRINCIPLES:
- Mock dependencies, not internals
- Real code paths tested
- External failures simulated
- Deterministic tests
```

---

## Pattern 9: The Test Coverage Strategy

**Context:** Measuring and improving test coverage meaningfully.

**The Pattern:**
```
COVERAGE TYPES:

LINE COVERAGE:
Which lines were executed.
Easy to game, useful as baseline.
Target: 80%+

BRANCH COVERAGE:
Which if/else paths taken.
More meaningful than line.
Target: 70%+

FUNCTION COVERAGE:
Which functions called.
Baseline metric.
Target: 80%+

COVERAGE STRATEGY:

CRITICAL PATH COVERAGE:
Ensure critical paths are 100%.
- Authentication
- Payments
- Core features
- Data handling

NEW CODE COVERAGE:
Require coverage on new code.
80%+ for new files.
Prevent coverage decline.

COVERAGE GAPS:
Identify uncovered code.
Prioritize by risk.
Don't chase 100%.

COVERAGE TOOLS:
- NYC/Istanbul (JavaScript)
- c8 (Node.js native)
- pytest-cov (Python)
- Codecov, Coveralls (CI integration)

COVERAGE CONFIG:
// vitest.config.ts
export default {
  coverage: {
    provider: 'v8',
    reporter: ['text', 'html'],
    exclude: ['tests/**', '*.config.*'],
    thresholds: {
      lines: 80,
      branches: 70
    }
  }
}

COVERAGE ANTI-PATTERNS:
- Targeting 100% (diminishing returns)
- Testing getters/setters
- Testing config files
- Gaming metrics

COVERAGE REALITY:
80% meaningful coverage > 100% meaningless
Critical paths fully tested > All code touched
Tests that catch bugs > Tests that pass
```

---

## Pattern 10: The Parallel Test Execution

**Context:** Running tests in parallel for faster CI.

**The Pattern:**
```
PURPOSE:
Reduce test runtime.
Utilize CI resources.
Faster feedback loops.

PARALLEL STRATEGIES:

FILE-LEVEL PARALLEL:
Each test file runs in parallel.
Simplest approach.
Works with good isolation.

// playwright.config.ts
export default {
  workers: 4,  // Parallel workers
  fullyParallel: true
}

TEST-LEVEL PARALLEL:
Individual tests in parallel.
Maximum parallelism.
Requires excellent isolation.

// jest.config.js
module.exports = {
  maxWorkers: '50%',  // Use 50% of CPU
}

SHARD PARALLEL:
Split tests across CI machines.
For large test suites.
Reduces wall-clock time.

# CI configuration
npx playwright test --shard=1/4
npx playwright test --shard=2/4
npx playwright test --shard=3/4
npx playwright test --shard=4/4

PARALLEL REQUIREMENTS:
- Test isolation (no shared state)
- Independent data (unique per test)
- No order dependency
- Resource isolation

ISOLATION TECHNIQUES:
- Unique test data (UUID-based)
- Database transactions (rollback)
- Test containers (fresh per worker)
- Separate databases per worker

PARALLEL ANTI-PATTERNS:
- Shared test users
- Sequential assumptions
- Global state
- File system conflicts
- Port conflicts

CI PARALLEL:
# GitHub Actions
strategy:
  matrix:
    shard: [1, 2, 3, 4]
steps:
  - run: npx playwright test --shard=${{ matrix.shard }}/4
```
