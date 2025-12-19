# Anti-Patterns: Codebase Optimization

Approaches that seem like good optimization but make things worse.

---

## Anti-Pattern 1: The Clever Code

**What It Looks Like:**
"I wrote this in one line. It's so elegant and efficient."

**Why It Seems Right:**
- Fewer lines = less code
- Demonstrates skill
- Looks impressive

**Why It Fails:**
```
THE PATTERN:
// "Clever" one-liner
const result = data.reduce((a,c)=>({...a,[c.k]:
(a[c.k]||[]).concat(c.v.filter(x=>x>0).map(x=>x*2))}),{})

vs.

// Clear version
const result = {}
for (const item of data) {
  const key = item.k
  const positiveDoubled = item.v
    .filter(x => x > 0)
    .map(x => x * 2)

  if (!result[key]) {
    result[key] = []
  }
  result[key].push(...positiveDoubled)
}

THE REALITY:
You read code 10x more than write it.
Future you won't remember.
New team members will be lost.
"Clever" = hard to debug.

COSTS OF CLEVER:
- Debug time: Hours wasted
- Onboarding: "What does this do?"
- Bugs: Hidden in complexity
- Refactoring: Afraid to touch it

THE FIX:
1. Clear > Clever, always

2. Name things well
   const isValidUser = user && user.id && !user.deleted
   vs
   const v = u && u.i && !u.d

3. Extract complex logic
   function calculateDiscountedPrice(item, user) {
     // Clear steps
   }

4. Comment the "why"
   // Using reduce because array is already sorted
   // and we need single-pass for performance

WHEN CLEVER IS OKAY:
- Performance critical hot paths
- With extensive comments
- With comprehensive tests
- And clear documentation

RULE:
"Anyone can write code computers understand.
Good programmers write code humans understand."
- Martin Fowler
```

---

## Anti-Pattern 2: The God Object Cache

**What It Looks Like:**
"I'll cache everything in one big object for fast access."

**Why It Seems Right:**
- One place for all data
- Easy to access
- Always available

**Why It Fails:**
```
THE PATTERN:
const globalCache = {
  users: {},
  products: {},
  orders: {},
  settings: {},
  permissions: {},
  // ... everything
}

// Used everywhere
globalCache.users[id] = userData
globalCache.products[id] = productData

THE REALITY:
- Memory grows unbounded
- Stale data nightmares
- Coupling everywhere
- Hard to test
- Invalidation impossible

PROBLEMS:
1. No eviction: Memory leak
2. No TTL: Stale forever
3. No isolation: Everything coupled
4. No type safety: Runtime errors
5. No visibility: What's cached?

THE FIX:
1. Purposeful caches
   const userCache = new LRUCache({ max: 1000 })
   const productCache = new LRUCache({ max: 500 })

2. TTLs
   cache.set(key, value, { ttl: 5 * 60 * 1000 })

3. Scoped caches
   // Request-scoped
   function handleRequest(req) {
     const requestCache = new Map()
     // Cache dies with request
   }

4. Cache layers
   Browser → CDN → App Cache → Database

5. Monitoring
   - Cache hit rate
   - Memory usage
   - Entry count
   - TTL distribution

CACHE DESIGN:
- What's being cached?
- How long should it live?
- How big can it get?
- When to invalidate?
- How to monitor?

NO ANSWERS = NO CACHE.
```

---

## Anti-Pattern 3: The Async Everywhere

**What It Looks Like:**
"Everything should be async for better performance."

**Why It Seems Right:**
- Non-blocking = fast
- Modern best practice
- Parallelism potential

**Why It Fails:**
```
THE PATTERN:
// Making sync code async "for performance"
async function add(a, b) {
  return a + b
}

async function getUserName(user) {
  return user.name
}

// Then in calling code
const name = await getUserName(user)
const sum = await add(1, 2)

THE REALITY:
Async has overhead.
Unnecessary async adds complexity.
Harder to debug.
Harder to reason about.

ASYNC OVERHEAD:
- Promise creation
- Microtask queuing
- Stack trace complexity
- Error handling ceremony

WHEN ASYNC MAKES SENSE:
- I/O operations (network, disk)
- Long-running computations
- Real parallelism opportunities
- Event-based operations

WHEN SYNC IS BETTER:
- Pure computation
- Simple transformations
- Immediate operations
- Data access

THE FIX:
// Sync for sync operations
function add(a, b) {
  return a + b
}

function getUserName(user) {
  return user.name
}

// Async for I/O
async function fetchUser(id) {
  return await db.users.find(id)
}

// Use sync unless you need async
const name = getUserName(user)  // No await
const sum = add(1, 2)           // No await
const user = await fetchUser(1) // Actually async

RULE:
Async for I/O.
Sync for computation.
Don't add async "just in case."
```

---

## Anti-Pattern 4: The Over-Normalized Database

**What It Looks Like:**
"We need to eliminate all data duplication for data integrity."

**Why It Seems Right:**
- DRY principle
- No update anomalies
- "Proper" database design

**Why It Fails:**
```
THE PATTERN:
Tables: users, profiles, addresses, address_types,
cities, states, countries, country_codes, ...

Simple query becomes:
SELECT u.name, p.bio, a.street, at.name,
       c.name, s.name, co.name
FROM users u
JOIN profiles p ON p.user_id = u.id
JOIN user_addresses ua ON ua.user_id = u.id
JOIN addresses a ON a.id = ua.address_id
JOIN address_types at ON at.id = a.type_id
JOIN cities c ON c.id = a.city_id
JOIN states s ON s.id = c.state_id
JOIN countries co ON co.id = s.country_id
WHERE u.id = 1

THE REALITY:
Over-normalization kills performance.
JOINs are expensive.
Complexity explodes.
Queries become unreadable.

PROBLEMS:
- Multiple JOINs per query
- Query planner confusion
- Index complexity
- Maintenance burden
- Developer confusion

THE FIX:
1. Denormalize strategically
   // Store city name with address
   addresses(street, city, state, country)
   // Instead of foreign keys to each

2. Materialized views
   CREATE MATERIALIZED VIEW user_full AS
   SELECT ... FROM users JOIN ... JOIN ...

3. JSONB for flexible data
   users(id, name, preferences JSONB)

4. Cache computed data
   // Store order_total with order
   // Instead of computing each time

5. Accept some duplication
   // User name in orders table
   // Faster reads, acceptable staleness

NORMALIZATION LEVELS:
- 1NF-3NF: Usually good
- BCNF: Sometimes too far
- 4NF-5NF: Rarely needed

RULE:
Normalize for writes.
Denormalize for reads.
Know your access patterns.
```

---

## Anti-Pattern 5: The Micro-Optimization Obsession

**What It Looks Like:**
"I replaced all for loops with while loops because they're 0.1% faster."

**Why It Seems Right:**
- Every bit of performance counts
- Best practices
- Shows attention to detail

**Why It Fails:**
```
THE PATTERN:
// "Optimizing" array iteration
// Using while instead of forEach because "faster"
let i = 0
while (i < arr.length) {
  process(arr[i])
  i++
}

// Instead of clear version
arr.forEach(item => process(item))

// Time saved: 0.001ms
// Readability lost: Significant

THE REALITY:
Micro-optimizations are rarely impactful.
Modern runtimes optimize common patterns.
Readability cost outweighs speed gain.
Real bottlenecks are elsewhere.

WHERE TIME ACTUALLY GOES:
- Network requests: 100-500ms
- Database queries: 10-100ms
- Disk I/O: 1-10ms
- Loop micro-opt: 0.001ms

MICRO-OPTIMIZATION EXAMPLES:
- for vs forEach (negligible)
- let vs const (same)
- ++i vs i++ (same)
- String concat methods (negligible)

THE FIX:
1. Profile first
   Where is actual time spent?
   Optimize THAT.

2. Macro before micro
   Database query taking 500ms?
   Fix that, not loop syntax.

3. Readability wins
   Clear code can be optimized.
   Clever code is risky to change.

4. Trust the runtime
   V8, SpiderMonkey optimize hot paths
   Your micro-opt might prevent theirs

WHEN MICRO-OPTIMIZATION MATTERS:
- Hot loops (millions of iterations)
- Real-time systems
- Proven bottleneck (profiled)
- After macro optimizations done

RULE:
"Make it work, make it right, make it fast."
In that order.
```

---

## Anti-Pattern 6: The Copy-Paste Refactor

**What It Looks Like:**
"I'll refactor by copying this working code and modifying it."

**Why It Seems Right:**
- Faster than writing from scratch
- Known to work
- Lower risk

**Why It Fails:**
```
THE PATTERN:
// Original working code
function processOrders(orders) {
  // 100 lines of logic
  return processedOrders
}

// "Refactored" version
function processOrdersV2(orders) {
  // Same 100 lines, slightly modified
  // Now two versions to maintain
}

// 3 months later
function processOrdersV3(orders) {
  // Yet another copy
  // Bug fixed in V1, not in V2 or V3
}

THE REALITY:
Copy-paste multiplies maintenance.
Changes needed in all copies.
Bugs fixed in one, not others.
Which version is canonical?

SYMPTOMS:
- Multiple "versions" of functions
- Inconsistent behavior
- "I think that's the old one"
- Bug fixes that don't stick

THE FIX:
1. Extract common logic
   function processOrders(orders, options) {
     // One version, configurable
   }

2. Use composition
   const processOrdersV2 = pipe(
     validateOrders,
     transformV2,
     processCore  // Shared
   )

3. Refactor, don't copy
   - Make changes to existing
   - Use feature flags for variants
   - Delete old code

4. DRY with judgment
   Not everything should be deduplicated.
   But copies should be intentional.

ACCEPTABLE DUPLICATION:
- Test setup code
- Boilerplate (sometimes)
- Temporary during migration

NEVER DUPLICATE:
- Business logic
- Security code
- Validation rules

RULE:
If you're about to copy-paste:
1. Can I parameterize instead?
2. Can I compose instead?
3. Can I refactor in place?
```

---

## Anti-Pattern 7: The Framework Obsession

**What It Looks Like:**
"We should use [framework] for everything—it's the best."

**Why It Seems Right:**
- Consistency
- Team expertise
- Proven solution

**Why It Fails:**
```
THE PATTERN:
Team knows React:
- Admin dashboard → React
- Static marketing site → React
- Cron job with no UI → React SSR somehow
- CLI tool → React Ink (yes, really)

"We're a React shop!"

THE REALITY:
Different problems need different tools.
Frameworks have appropriate scopes.
Over-applying creates overhead.
Wrong tool = fighting the tool.

EXAMPLES:
React for static site:
- 200KB JavaScript
- SSR complexity
- Hydration bugs
vs.
Plain HTML: 2KB, works everywhere

Redux for simple state:
- Boilerplate explosion
- Action/reducer ceremony
- Learning curve
vs.
useState: Built-in, simple

THE FIX:
1. Match tool to problem
   - Static content → HTML/Static gen
   - Interactive app → React/Vue
   - Simple data → SQL query
   - Complex transforms → Stream processing

2. Evaluate overhead
   What does the framework cost?
   What does it give?
   Is the trade-off worth it?

3. Keep options open
   Different services can use different tools.
   Teams can specialize.

4. Right-size solutions
   Small problem → Small tool
   Big problem → Consider framework

TOOL SELECTION:
Problem: Static marketing pages
Options:
- React SSR (overkill)
- Next.js static export (reasonable)
- Astro (great fit)
- Plain HTML (perfect fit)

Ask: What's the simplest that works?
```

---

## Anti-Pattern 8: The Performance Theater

**What It Looks Like:**
"We implemented lazy loading, code splitting, and caching everywhere."

**Why It Seems Right:**
- Best practices
- Proactive optimization
- Shows we care about performance

**Why It Fails:**
```
THE PATTERN:
Added all the "performance" things:
- Lazy loading (nothing heavy to lazy load)
- Code splitting (200KB total bundle)
- Service workers (10 users per day)
- Redis cache (10 queries per minute)
- CDN (local traffic only)

Result:
- Complexity: 3x
- Performance: Same
- Bugs: More
- Maintenance: Harder

THE REALITY:
Performance optimization has costs.
Only optimize measured problems.
"Best practices" aren't universal.
Complexity ≠ performance.

PREMATURE OPTIMIZATIONS:
- Caching data that's never reused
- Splitting bundles that are tiny
- Lazy loading instantly-needed code
- CDN for single-region traffic
- Connection pooling for 10 users

THE FIX:
1. Measure first
   What's actually slow?
   Where are real bottlenecks?

2. Size-appropriate solutions
   10 users: Single server, simple code
   10,000 users: Maybe add caching
   1M users: Definitely need optimization

3. Cost-benefit analysis
   Caching adds: Complexity, invalidation
   Caching saves: (nothing, low traffic)
   Worth it? No.

4. Start simple
   Optimize when you have data.
   Not when you imagine problems.

OPTIMIZATION WHEN:
- Measured problem exists
- Users are impacted
- Cost is justified
- Benefits exceed complexity

NOT WHEN:
- "Might need it someday"
- "Best practice says so"
- "Other companies do it"
- "Looks impressive"
```

---

## Anti-Pattern 9: The Migration Without End

**What It Looks Like:**
"We're in the middle of migrating to the new system."

**Why It Seems Right:**
- Incremental is safer
- Can't rush quality
- Business continues

**Why It Fails:**
```
THE PATTERN:
"We started migrating 2 years ago..."

Current state:
- 60% on new system
- 40% on old system
- Some features on both
- Nobody knows which is source of truth
- Double maintenance
- Double bugs
- Double confusion

"We'll finish when we have time."
(Time never comes)

THE REALITY:
Infinite migrations cost more than they save.
Two systems is worse than either one.
"Migrating" becomes permanent state.

COMPOUNDING COSTS:
Year 1: Old system + new system
Year 2: Old (aging) + new (features)
Year 3: Old (legacy) + new (tech debt)
Year 4: Two legacy systems

Each year the migration gets harder.

THE FIX:
1. Deadlines are real
   Migration complete by [date].
   Not "when we can."

2. Feature freeze old system
   No new features on old.
   Bug fixes only.
   Creates pressure to migrate.

3. Track progress visibly
   Migration: 75% complete
   Remaining: 15 features
   Deadline: March 1
   Owner: @person

4. Celebrate completion
   Day old system turns off:
   Party.
   It actually matters.

5. Sunset date
   Old system deleted on [date].
   Communicate to all.
   Actually do it.

MIGRATION TIMELINE:
Week 1-2: Foundation + first migration
Week 3-6: Core features
Week 7-8: Edge cases
Week 9: Old system deprecated
Week 10: Old system deleted

NOT:
Year 1: Started
Year 2: Continuing
Year 3: "Almost done"
Year 4: Still "almost done"
```

---

## Anti-Pattern 10: The Invisible Optimization

**What It Looks Like:**
"I optimized the database queries last month. Everything is faster now."

**Why It Seems Right:**
- Work was done
- Should be better
- Memory says it improved

**Why It Fails:**
```
THE PATTERN:
"I added indexes to all the slow queries."

"How much faster?"
"I don't know, but it should be faster."

"Is it still performing well?"
"I assume so."

"Can you prove the optimization worked?"
"..."

THE REALITY:
Unmeasured optimizations might:
- Not have worked at all
- Have regressed since
- Have caused other problems
- Be placebo

PROBLEMS:
- No baseline for comparison
- No way to detect regression
- Can't justify time spent
- Can't learn from it

THE FIX:
1. Before: Capture baseline
   p50: 234ms
   p95: 567ms
   p99: 890ms
   Queries/sec: 100

2. After: Measure impact
   p50: 45ms (-80%)
   p95: 120ms (-78%)
   p99: 234ms (-73%)
   Queries/sec: 450 (+350%)

3. Monitor: Watch for regression
   Alert if p95 > 150ms
   Dashboard showing trends
   Regular review

4. Document: Record the change
   Date: 2024-01-15
   Change: Added index on orders.user_id
   Before: p95 567ms
   After: p95 120ms
   Monitoring: Link to dashboard

OPTIMIZATION LOG:
| Date | Change | Before | After | Link |
|------|--------|--------|-------|------|
| 1/15 | Index orders.user_id | 567ms p95 | 120ms p95 | /dashboard/1 |

RULE:
No metrics before = Can't prove it worked
No metrics after = Can't prove it stayed
No monitoring = Can't know if regressed
```

---

## Anti-Pattern 11: The Configuration Complexity

**What It Looks Like:**
"It's flexible—you can configure everything."

**Why It Seems Right:**
- Flexibility is good
- Users can customize
- Anticipates future needs

**Why It Fails:**
```
THE PATTERN:
function createDataProcessor(config) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    retryBackoff = 'exponential',
    timeout = 5000,
    timeoutBehavior = 'throw',
    cacheEnabled = true,
    cacheTTL = 3600,
    cacheStrategy = 'lru',
    cacheSize = 1000,
    loggingEnabled = true,
    logLevel = 'info',
    logFormat = 'json',
    // ... 47 more options
  } = config

  // Complexity to handle all options
}

THE REALITY:
Every configuration option:
- Is code to maintain
- Is a bug surface
- Needs testing
- Needs documentation
- Confuses users

80/20 RULE:
80% of users use defaults.
15% change 1-2 options.
5% need advanced config.
You're building for 5%.

THE FIX:
1. Start with sensible defaults
   function createDataProcessor(options = {}) {
     const timeout = options.timeout ?? 5000
     // Few options, good defaults
   }

2. Add options when requested
   Not when imagined.
   Users will tell you what they need.

3. Layer configuration
   // Simple
   createProcessor()

   // Custom timeout
   createProcessor({ timeout: 10000 })

   // Advanced (rare)
   createProcessor({ advanced: {...} })

4. Prefer conventions
   // Instead of configuring everything
   // Use conventional patterns
   /api/v1/users → maps to users handler
   // Zero configuration

OPTION COUNT:
0-3 options: Simple, good
4-7 options: Getting complex
8+ options: Probably too many
20+ options: Definitely wrong

RULE:
Add the second option when the first
user requests it. Not before.
```

---

## Anti-Pattern 12: The Metrics Vanity

**What It Looks Like:**
"Our code coverage is 95% and our Lighthouse score is 100."

**Why It Seems Right:**
- High numbers = good
- Measurable progress
- Easy to report

**Why It Fails:**
```
THE PATTERN:
Metrics dashboard:
- Code coverage: 98% ✓
- Lighthouse: 100 ✓
- Bundle size: On budget ✓
- Build time: 30s ✓

Production:
- Page loads in 8 seconds
- Users complaining
- Conversion dropping
- Real performance: Poor

"But our metrics are great!"

THE REALITY:
Synthetic metrics ≠ Real experience.
Lab conditions ≠ Field conditions.
Coverage ≠ Quality.
Metrics can be gamed.

VANITY METRICS:
- Lighthouse lab score (ignores real users)
- Coverage % (can test nothing meaningful)
- Build size (if not measured correctly)
- Response time (average, not percentiles)

MEANINGFUL METRICS:
- Real User Monitoring (RUM)
- Field Core Web Vitals
- Actual user journey timing
- Error rates in production
- Conversion funnel drops

THE FIX:
1. Measure real users
   // RUM data
   const timing = performance.timing
   const loadTime = timing.loadEventEnd - timing.navigationStart
   analytics.track('page_load', { loadTime })

2. Use field data
   Not: Lighthouse lab score
   But: Chrome UX Report data

3. Percentiles not averages
   Not: Average 200ms
   But: p50: 100ms, p95: 800ms, p99: 2000ms

4. Outcome metrics
   Not: Page is fast
   But: Conversion rate, bounce rate, engagement

METRICS THAT MATTER:
- p75 LCP (Core Web Vital)
- Field FID/INP
- Bounce rate
- Task completion rate
- User satisfaction (NPS)

Ask: "What do users actually experience?"
```
