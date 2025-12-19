# Patterns: Codebase Optimization

Proven approaches for keeping codebases fast, clean, and maintainable.

---

## Pattern 1: The Strangler Fig

**Context:** Migrating from legacy systems without big-bang rewrites.

**The Pattern:**
```
PURPOSE:
Replace systems incrementally.
Old and new coexist.
Migrate gradually.
Delete old when done.

THE APPROACH:
1. Create new implementation
2. Route traffic to new
3. Migrate piece by piece
4. Old system shrinks (strangled)
5. Delete old when empty

EXAMPLE:

BEFORE:
All traffic → Legacy Monolith

STEP 1: Proxy Layer
All traffic → Proxy → Legacy Monolith
             ↓
             New Service (nothing yet)

STEP 2: First Route
All traffic → Proxy
              ├→ /users → New Service
              └→ /* → Legacy Monolith

STEP 3: More Routes
All traffic → Proxy
              ├→ /users → New Service
              ├→ /orders → New Service
              └→ /* → Legacy Monolith

STEP 4: Complete
All traffic → Proxy → New Services
(Legacy deleted)

IMPLEMENTATION:
// Proxy routes by path
const routes = {
  '/api/users/*': 'new-user-service',
  '/api/orders/*': 'new-order-service',
  '/*': 'legacy-monolith'  // Catchall
}

// Route handler
app.use((req, res, next) => {
  const service = matchRoute(req.path, routes)
  proxyTo(service, req, res)
})

BENEFITS:
- Low risk (rollback is routing change)
- Incremental progress
- Production validated
- Team can work in parallel
- Legacy continues working

TIMELINE:
Week 1: Proxy + first route
Week 2-4: Migrate core routes
Month 2: Remaining routes
Month 3: Delete legacy

NOT:
Month 1-6: Build complete replacement
Month 7: Big bang switch
Month 8: Debug production fires
```

---

## Pattern 2: The Performance Budget

**Context:** Maintaining performance as features are added.

**The Pattern:**
```
PURPOSE:
Define performance limits.
Enforce automatically.
Prevent regression.
Budget like money.

BUDGET COMPONENTS:

PAGE LOAD:
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3s
- Total Blocking Time: < 200ms

BUNDLE SIZE:
- Main bundle: < 200KB gzipped
- Per-route chunks: < 50KB gzipped
- Total JS: < 500KB gzipped
- Total CSS: < 100KB gzipped

API RESPONSE:
- p50 latency: < 100ms
- p95 latency: < 500ms
- p99 latency: < 1000ms
- Error rate: < 0.1%

IMPLEMENTATION:
// bundlesize config
{
  "files": [
    {
      "path": "dist/main.*.js",
      "maxSize": "200 kB"
    },
    {
      "path": "dist/vendor.*.js",
      "maxSize": "150 kB"
    }
  ]
}

// Lighthouse CI config
{
  "ci": {
    "assert": {
      "assertions": {
        "first-contentful-paint": ["error", { "maxNumericValue": 1500 }],
        "interactive": ["error", { "maxNumericValue": 3000 }],
        "max-potential-fid": ["error", { "maxNumericValue": 200 }]
      }
    }
  }
}

ENFORCEMENT:
1. CI fails if budget exceeded
2. PR shows performance impact
3. Team reviews budget changes
4. Exceptions need approval

BUDGET MANAGEMENT:
Adding feature that costs 50KB?
Either:
- Find 50KB to remove elsewhere
- Get exception (rare)
- Feature isn't worth it

TRACKING:
- Historical performance graphs
- Per-commit impact
- Trend alerts
- Weekly reviews
```

---

## Pattern 3: The Parallel Optimization

**Context:** Speeding up by doing work concurrently.

**The Pattern:**
```
PURPOSE:
Independent operations in parallel.
Reduce total wait time.
Better resource utilization.

BEFORE (Sequential):
const user = await getUser(id)      // 100ms
const orders = await getOrders(id)  // 150ms
const prefs = await getPrefs(id)    // 50ms
// Total: 300ms

AFTER (Parallel):
const [user, orders, prefs] = await Promise.all([
  getUser(id),    // 100ms
  getOrders(id),  // 150ms
  getPrefs(id)    // 50ms
])
// Total: 150ms (slowest one)

PATTERNS:

PROMISE.ALL:
const results = await Promise.all([
  fetchA(),
  fetchB(),
  fetchC()
])
// All or nothing - one failure = all fail

PROMISE.ALLSETTLED:
const results = await Promise.allSettled([
  fetchA(),
  fetchB(),
  fetchC()
])
// All complete, check each status
results.forEach(r => {
  if (r.status === 'fulfilled') {
    // use r.value
  } else {
    // handle r.reason
  }
})

BATCH PROCESSING:
// Instead of 1000 sequential queries
const results = []
for (const id of ids) {
  results.push(await getItem(id))
}

// Batch with concurrency limit
const results = await pMap(ids, getItem, {
  concurrency: 10
})

WHEN TO PARALLELIZE:
- Independent operations
- I/O bound (network, disk)
- Same resource can handle load

WHEN NOT TO:
- Dependencies between operations
- Rate-limited resources
- CPU-bound operations
- Order matters

MONITORING:
- Track parallel efficiency
- Watch for resource contention
- Alert on bottlenecks
```

---

## Pattern 4: The Dead Code Elimination

**Context:** Removing unused code to reduce complexity and bundle size.

**The Pattern:**
```
PURPOSE:
Find unused code.
Delete safely.
Reduce bundle/complexity.
Less code = less bugs.

FINDING DEAD CODE:

STATIC ANALYSIS:
npx knip            # Full project analysis
npx depcheck        # Unused dependencies
npx unimported      # Unused files
npx ts-prune        # Unused exports

BUNDLE ANALYSIS:
npx webpack-bundle-analyzer
npx source-map-explorer

COVERAGE ANALYSIS:
# Run tests with coverage
npm test -- --coverage

# Uncovered code = possibly dead

PRODUCTION ANALYTICS:
// Track feature usage
analytics.track('feature_used', { feature: 'old-dashboard' })

// If never tracked → probably dead

ELIMINATION PROCESS:

1. IDENTIFY
   Run dead code analysis tools
   List candidates for removal

2. VERIFY
   Search for:
   - String references ("oldFunction")
   - Dynamic imports
   - Reflection usage
   - Config references

3. DEPRECATE
   Add deprecation warning
   Monitor for usage
   Wait period (1-2 weeks)

4. REMOVE
   Delete code
   Update tests
   Clean imports

5. VERIFY
   Full test suite passes
   Production monitoring clean
   No error reports

SAFE DELETION:
// Add before removing
console.warn('DEPRECATED: oldFunction called')
// or
throw new Error('oldFunction removed in v2')

// Monitor for warnings/errors
// If none after 2 weeks, safe to delete

TOOLS:
- knip: Comprehensive dead code finder
- depcheck: Unused npm packages
- madge: Circular dependencies
- unimported: Unused files
- ts-prune: Unused TypeScript exports

SCHEDULE:
Weekly: Review dead code reports
Monthly: Dedicated cleanup sprint
Quarterly: Dependency audit
```

---

## Pattern 5: The Caching Strategy

**Context:** Using caching to reduce expensive operations.

**The Pattern:**
```
PURPOSE:
Store computed results.
Avoid repeated work.
Reduce latency and load.

CACHE LEVELS:

BROWSER:
Cache-Control headers
Service workers
LocalStorage/IndexedDB
Session data

CDN:
Static assets
API responses (carefully)
Edge caching

APPLICATION:
In-memory cache
Memoization
Request-scoped

DATABASE:
Query cache
Connection pool
Materialized views

CACHING STRATEGIES:

CACHE-ASIDE:
function getData(key) {
  let data = cache.get(key)
  if (!data) {
    data = fetchFromSource(key)
    cache.set(key, data, TTL)
  }
  return data
}

WRITE-THROUGH:
function saveData(key, value) {
  source.save(key, value)
  cache.set(key, value)
}

CACHE INVALIDATION:
// Time-based
cache.set(key, value, { ttl: 3600 })

// Event-based
on('user.updated', (userId) => {
  cache.delete(`user:${userId}`)
})

// Version-based
const cacheKey = `user:${userId}:v${version}`

MEMOIZATION:
const memoizedExpensive = memoize(expensiveOperation)

// React
const value = useMemo(() => expensive(a, b), [a, b])

// Manual
const cache = new Map()
function memoized(input) {
  if (!cache.has(input)) {
    cache.set(input, compute(input))
  }
  return cache.get(input)
}

CACHE SIZING:
- Set maximum entries
- Use LRU eviction
- Monitor hit rates
- Adjust based on memory

const cache = new LRUCache({
  max: 500,           // Max entries
  ttl: 1000 * 60 * 5, // 5 minute TTL
})

MONITORING:
- Hit rate (target: >90%)
- Miss latency
- Memory usage
- Eviction rate
```

---

## Pattern 6: The Query Optimization

**Context:** Improving database query performance.

**The Pattern:**
```
PURPOSE:
Faster database queries.
Less database load.
Better user experience.

COMMON ISSUES:

N+1 QUERIES:
// Bad: 1 + N queries
const users = await User.findAll()
for (const user of users) {
  user.orders = await Order.findByUser(user.id)  // N queries
}

// Good: 2 queries with preloading
const users = await User.findAll({
  include: [{ model: Order }]
})

MISSING INDEXES:
-- Slow: Full table scan
SELECT * FROM orders WHERE user_id = 123

-- After index
CREATE INDEX idx_orders_user_id ON orders(user_id)
-- Fast: Index lookup

OVERFETCHING:
// Bad: Get all columns
SELECT * FROM users WHERE id = 1

// Good: Get what you need
SELECT id, name, email FROM users WHERE id = 1

OPTIMIZATION PROCESS:

1. FIND SLOW QUERIES
   - Query logs with timing
   - APM tools (Datadog, New Relic)
   - pg_stat_statements (Postgres)

2. ANALYZE
   EXPLAIN ANALYZE SELECT ...
   Look for:
   - Seq Scan (often bad)
   - Nested Loop on large tables
   - High cost estimates

3. OPTIMIZE
   - Add indexes
   - Rewrite queries
   - Add preloading
   - Use pagination

4. MEASURE
   Before: 500ms p95
   After: 50ms p95
   Improvement: 10x

INDEXING STRATEGY:
- Index foreign keys
- Index WHERE clause columns
- Index ORDER BY columns
- Composite indexes for multi-column
- Don't over-index (write penalty)

PAGINATION:
// Offset (slow for large offsets)
SELECT * FROM items LIMIT 10 OFFSET 10000

// Cursor (consistent performance)
SELECT * FROM items
WHERE id > :last_seen_id
ORDER BY id
LIMIT 10

TOOLS:
- EXPLAIN ANALYZE (Postgres)
- slow query log (MySQL)
- Query analyzer (ORMs)
- APM tools
```

---

## Pattern 7: The Bundle Splitting

**Context:** Reducing initial JavaScript payload.

**The Pattern:**
```
PURPOSE:
Load less JavaScript initially.
Load more on demand.
Faster first paint.

SPLITTING STRATEGIES:

ROUTE-BASED:
// React Router lazy loading
const Dashboard = lazy(() => import('./Dashboard'))
const Settings = lazy(() => import('./Settings'))

<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/dashboard" element={
    <Suspense fallback={<Loading />}>
      <Dashboard />
    </Suspense>
  } />
</Routes>

COMPONENT-BASED:
// Heavy component loaded on demand
const HeavyChart = lazy(() => import('./HeavyChart'))

function Report({ showChart }) {
  return (
    <div>
      <ReportHeader />
      {showChart && (
        <Suspense fallback={<ChartSkeleton />}>
          <HeavyChart />
        </Suspense>
      )}
    </div>
  )
}

VENDOR SPLITTING:
// webpack.config.js
optimization: {
  splitChunks: {
    cacheGroups: {
      vendor: {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all'
      }
    }
  }
}

DYNAMIC IMPORTS:
// Load on interaction
async function onExport() {
  const { exportToPDF } = await import('./pdf-export')
  exportToPDF(data)
}

PREFETCHING:
// Load after initial paint
<link rel="prefetch" href="/settings-chunk.js" />

// Or programmatically
useEffect(() => {
  import('./Settings')  // Prefetch
}, [])

ANALYSIS:
npx webpack-bundle-analyzer dist/stats.json

Look for:
- Large chunks (> 100KB)
- Duplicate dependencies
- Unused exports
- Library alternatives

TARGETS:
- Main bundle: < 200KB gzipped
- Per-route: < 50KB gzipped
- Initial load: < 400KB total
```

---

## Pattern 8: The Incremental Refactoring

**Context:** Improving code without big-bang rewrites.

**The Pattern:**
```
PURPOSE:
Continuous improvement.
Low risk changes.
Steady progress.
Never block features.

REFACTORING LOOP:

1. IDENTIFY
   "This code is hard to change"
   "This pattern appears in 5 places"
   "New feature needs this to be flexible"

2. SCOPE
   Smallest change that helps.
   One concept at a time.
   Fits in one PR.

3. TEST
   Ensure tests exist for behavior.
   Add tests if missing.
   Characterization tests if unclear.

4. REFACTOR
   Small, safe steps.
   Run tests after each step.
   Commit frequently.

5. VERIFY
   All tests pass.
   Code review.
   Deploy and monitor.

REFACTORING TECHNIQUES:

EXTRACT FUNCTION:
// Before
function process(data) {
  // 50 lines of validation
  // 50 lines of transformation
  // 50 lines of saving
}

// After
function process(data) {
  validate(data)
  const transformed = transform(data)
  save(transformed)
}

RENAME:
// Before
const d = getData()
const r = process(d)

// After
const userData = getUserData()
const processedResult = processUserData(userData)

EXTRACT VARIABLE:
// Before
if (user.age >= 21 && user.country === 'US' && user.verified) {
  // ...
}

// After
const canPurchaseAlcohol = user.age >= 21
  && user.country === 'US'
  && user.verified

if (canPurchaseAlcohol) {
  // ...
}

INLINE:
// Before (unnecessary abstraction)
function getFullName(user) {
  return getUserFullNameString(user)
}
function getUserFullNameString(u) {
  return `${u.first} ${u.last}`
}

// After
function getFullName(user) {
  return `${user.first} ${user.last}`
}

SCHEDULING:
- 20% time for refactoring
- Or: refactor as you go
- Never: "refactoring sprint"
```

---

## Pattern 9: The Feature Flag Rollout

**Context:** Safely deploying and testing optimizations.

**The Pattern:**
```
PURPOSE:
Deploy optimizations safely.
A/B test performance.
Quick rollback.
Gradual rollout.

IMPLEMENTATION:

BASIC FLAG:
const optimizedQuery = featureFlags.isEnabled('optimized-query')

if (optimizedQuery) {
  return fastQuery(params)
} else {
  return originalQuery(params)
}

PERCENTAGE ROLLOUT:
// 10% of users get optimization
const isEnabled = featureFlags.isEnabled('optimization', {
  userId: user.id,
  percentage: 10
})

TARGETING:
// Power users get it first
const isEnabled = featureFlags.isEnabled('optimization', {
  userId: user.id,
  rules: [
    { attribute: 'plan', value: 'enterprise' },
    { attribute: 'country', value: 'US' }
  ]
})

ROLLOUT STAGES:

Stage 1: Internal (employees only)
- Catch obvious issues
- Duration: 1-2 days

Stage 2: Canary (1% of users)
- Production traffic
- Monitor closely
- Duration: 1-3 days

Stage 3: Gradual (10% → 50% → 100%)
- Increase if metrics healthy
- Pause if issues
- Duration: 1-2 weeks

MONITORING:
// Track both paths
analytics.track('query_executed', {
  version: optimizedQuery ? 'optimized' : 'original',
  duration: elapsed,
  success: !error
})

// Compare in dashboard
Original p95: 450ms
Optimized p95: 120ms
Error rate: Same

ROLLBACK:
// If issues, disable immediately
featureFlags.disable('optimization')

// Traffic reverts to original
// No deploy needed
// Instant rollback

CLEANUP:
After 100% rollout stable for 2 weeks:
1. Remove flag check
2. Remove old code path
3. Remove flag definition
```

---

## Pattern 10: The Technical Debt Register

**Context:** Tracking and prioritizing technical debt.

**The Pattern:**
```
PURPOSE:
Make debt visible.
Prioritize systematically.
Pay down strategically.
Prevent accumulation.

DEBT CATEGORIES:

ARCHITECTURAL:
Wrong abstraction, poor boundaries
Impact: High, Fix effort: High

PERFORMANCE:
Slow queries, missing indexes
Impact: Medium, Fix effort: Medium

CODE QUALITY:
Duplication, complexity
Impact: Low, Fix effort: Low

DEPENDENCIES:
Outdated, vulnerable
Impact: Varies, Fix effort: Medium

TESTING:
Missing coverage, flaky tests
Impact: Medium, Fix effort: Medium

REGISTER FORMAT:
| ID | Description | Category | Impact | Effort | Priority |
|----|-------------|----------|--------|--------|----------|
| TD-001 | N+1 in orders page | Performance | High | Low | P1 |
| TD-002 | Legacy auth system | Architecture | High | High | P2 |
| TD-003 | No tests on payments | Testing | High | Medium | P1 |

PRIORITIZATION MATRIX:
             High Impact   Low Impact
High Effort     P2           P4
Low Effort      P1           P3

P1: Quick wins (do now)
P2: Strategic (schedule)
P3: When convenient
P4: Maybe never

DEBT BUDGET:
- 20% of sprint capacity for debt
- Or: Every 4th sprint is debt
- Or: Friday afternoons

ADDING DEBT:
// When taking on intentional debt
/**
 * TECH DEBT: TD-045
 * This duplicates logic from UserService
 * Reason: Shipping deadline, will consolidate next sprint
 * Owner: @person
 * Created: 2024-01-15
 */

TRACKING:
- Total debt items
- Age of oldest items
- Debt added vs paid per sprint
- Impact on velocity

REVIEW CADENCE:
Weekly: Review P1 items
Monthly: Prioritization review
Quarterly: Full audit
```
