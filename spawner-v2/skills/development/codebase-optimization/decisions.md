# Decisions: Codebase Optimization

Critical decisions that determine optimization effectiveness and long-term maintainability.

---

## Decision 1: Refactor vs. Rewrite

**Context:** Deciding between improving existing code or starting fresh.

**Options:**

| Approach | When | Pros | Cons |
|----------|------|------|------|
| **Refactor** | Code is working | Low risk | Slower improvement |
| **Rewrite** | Fundamentally broken | Clean slate | High risk |
| **Strangler** | Large systems | Incremental | Two systems |
| **Patch** | Time constrained | Quick | Adds debt |

**Framework:**
```
Decision matrix:

REFACTOR WHEN:
- Code works but is hard to change
- Structure is fundamentally sound
- Team understands the code
- Tests exist or can be added
- Changes can be incremental

REWRITE WHEN:
- Technology is obsolete
- Original assumptions are invalid
- Team cannot understand code
- Performance is fundamentally limited
- Smaller than you think (< 1 month)

STRANGLER WHEN:
- System too large for rewrite
- Can't stop for rewrite
- Clear module boundaries exist
- Gradual migration possible

PATCH WHEN:
- Emergency fix needed
- Rewrite not feasible now
- Document the debt
- Plan proper fix later

REWRITE RISK FACTORS:
- Size: Lines of code
- Complexity: Business logic
- Dependencies: External systems
- Knowledge: Team familiarity
- Time: Deadline pressure

SCORING:
Low risk (0-3): Consider rewrite
Medium risk (4-6): Prefer refactor
High risk (7+): Must refactor/strangler

REWRITE ESTIMATION:
Estimated time × 3 = Realistic time
If realistic time > 3 months: Don't rewrite

RULE:
"If you can refactor, refactor.
Rewrites are for when you can't."
```

**Default Recommendation:** Refactor unless system is small or technology is obsolete. Use strangler for large systems.

---

## Decision 2: When to Optimize

**Context:** Deciding if and when to invest in optimization.

**Options:**

| Timing | When | Pros | Cons |
|--------|------|------|------|
| **Proactive** | Before problems | Prevents issues | May be premature |
| **Reactive** | When problems occur | Proven need | May be urgent |
| **Scheduled** | Regular intervals | Predictable | May not align with need |
| **Never** | Accept performance | Zero overhead | User impact |

**Framework:**
```
Optimization triggers:

OPTIMIZE NOW:
- User complaints about speed
- SLA violations
- Error rate spikes
- Cost exceeds budget
- Measured bottleneck confirmed

OPTIMIZE SOON:
- Performance trending down
- Approaching capacity limits
- New feature needs headroom
- Technical debt affecting velocity

OPTIMIZE LATER:
- Performance is acceptable
- Other priorities higher
- Need more data
- System is changing

DON'T OPTIMIZE:
- "Might be slow someday"
- "I know a faster way"
- "Best practice says..."
- No measured problem

MEASUREMENT REQUIREMENTS:
Before optimizing, you need:
1. Baseline metrics
2. Target metrics
3. Bottleneck identified
4. Impact estimation

PRIORITY CALCULATION:
Impact = Users affected × Severity × Frequency
Effort = Dev time + Risk + Complexity

Priority = Impact / Effort

High Impact / Low Effort → Do now
Low Impact / High Effort → Probably never

TIME BUDGET:
Optimization should pay for itself.
Hours spent < Hours saved (over 1 year)

10 hour optimization saving 1s per request:
Requests/day × 1s × 365 > 10 hours
Requests/day > 100 → Worth it
```

**Default Recommendation:** Optimize when there's a measured problem affecting users. Measure first, always.

---

## Decision 3: Abstraction Level

**Context:** Choosing the right level of abstraction for code.

**Options:**

| Level | Approach | Pros | Cons |
|-------|----------|------|------|
| **Minimal** | Inline everything | Simple, clear | Duplication |
| **Moderate** | Extract when needed | Balanced | Judgment required |
| **High** | Abstract everything | Flexible | Complex, indirect |
| **Framework** | Build internal framework | Consistent | Overkill |

**Framework:**
```
Abstraction decision:

RULE OF THREE:
1st time: Write inline
2nd time: Note duplication
3rd time: Extract abstraction

ABSTRACTION LEVELS:

LEVEL 0: Inline
// Direct, specific
function processOrder(order) {
  // All logic inline
}

LEVEL 1: Extract Function
// Reusable operations
function calculateDiscount(price, rules) {...}
function applyTax(amount, region) {...}

LEVEL 2: Extract Class/Module
// Related operations grouped
class OrderProcessor {
  calculateDiscount() {...}
  applyTax() {...}
}

LEVEL 3: Pattern/Interface
// Pluggable implementations
interface PricingStrategy {...}
class DiscountStrategy implements PricingStrategy {...}

LEVEL 4: Framework
// Internal mini-framework
class AbstractProcessor<T> {...}

WHEN TO ABSTRACT:

EXTRACT FUNCTION:
- 3+ uses of same logic
- Logic is complex (> 10 lines)
- Logic might change independently

EXTRACT CLASS:
- Related functions operate on same data
- State needs to be managed
- Different concerns to separate

CREATE INTERFACE:
- Multiple implementations exist
- Need to swap implementations
- Testing requires mocks

BUILD FRAMEWORK:
- Almost never
- Only if team is large
- Only if pattern is stable

WARNING SIGNS OF OVER-ABSTRACTION:
- Can't explain what code does
- Jump through 5+ files for simple flow
- Need framework knowledge to change
- Abstraction options mostly unused
```

**Default Recommendation:** Start minimal, extract when you see the pattern 3 times. Prefer functions over classes, classes over frameworks.

---

## Decision 4: Performance Trade-offs

**Context:** Choosing between competing performance characteristics.

**Options:**

| Trade-off | Favoring | Sacrificing |
|-----------|----------|-------------|
| **Speed vs. Memory** | Response time | RAM usage |
| **CPU vs. I/O** | Computation | Network/Disk |
| **Latency vs. Throughput** | Fast response | Total volume |
| **Consistency vs. Availability** | Data accuracy | Uptime |

**Framework:**
```
Performance trade-off matrix:

SPEED VS MEMORY:
Choose Speed when:
- Response time critical
- Memory is cheap/available
- User-facing operations
- Small data sets

Choose Memory when:
- Memory constrained (mobile, edge)
- Large data sets
- Background processing
- Long-running processes

Example:
// Speed: Cache in memory
const cache = new Map()
cache.set(key, expensiveCompute())

// Memory: Compute each time
function getData(key) {
  return expensiveCompute(key)
}

LATENCY VS THROUGHPUT:
Choose Latency when:
- Interactive applications
- Real-time requirements
- User-perceived actions
- Small payloads

Choose Throughput when:
- Batch processing
- Background jobs
- Large data moves
- Cost optimization

Example:
// Latency: Process immediately
queue.on('message', processImmediately)

// Throughput: Batch process
queue.batchReceive(100, processBatch)

CONSISTENCY VS AVAILABILITY:
Choose Consistency when:
- Financial transactions
- User data updates
- Order processing
- Inventory management

Choose Availability when:
- Content serving
- Analytics/metrics
- Read-heavy workloads
- Non-critical data

CAP THEOREM:
Can have 2 of 3:
- Consistency
- Availability
- Partition tolerance

Know which 2 you need.
```

**Default Recommendation:** User-facing → latency. Background → throughput. Financial → consistency. Content → availability.

---

## Decision 5: Dependency Management Strategy

**Context:** How to handle external dependencies.

**Options:**

| Strategy | Approach | Pros | Cons |
|----------|----------|------|------|
| **Conservative** | Lock versions | Stable | Miss updates |
| **Aggressive** | Always latest | Current | Breaking changes |
| **Automated** | Dependabot/Renovate | Consistent | Still need review |
| **Vendored** | Copy into repo | Control | Maintenance |

**Framework:**
```
Dependency management:

VERSION LOCKING:
// Exact: Most stable
"react": "18.2.0"

// Patch: Bug fixes only
"react": "~18.2.0"

// Minor: Features OK
"react": "^18.2.0"

STRATEGY BY DEPENDENCY TYPE:

FRAMEWORK (React, Next.js):
- Conservative (exact)
- Upgrade deliberately
- Read changelogs
- Test thoroughly

UTILITIES (lodash, date-fns):
- Patch updates auto
- Minor updates weekly
- Major manual

DEV DEPENDENCIES:
- More aggressive
- Less risk
- Patch/minor auto

SECURITY:
- Always update immediately
- Automate detection
- Block vulnerable versions

UPDATE PROCESS:
1. Weekly: Review automated PRs
2. Monthly: Check for new majors
3. Quarterly: Dependency audit
4. Immediately: Security patches

DEPENDENCY AUDIT:
npm audit
- Fix critical immediately
- Fix high within week
- Review moderate

REDUCING DEPENDENCIES:
Before adding:
1. Do we really need it?
2. Can we write it ourselves? (if simple)
3. Is it maintained?
4. What does it bring in?

VENDORING:
Consider for:
- Critical dependencies
- Unmaintained but needed
- Custom modifications needed

LOCK FILE:
- Always commit lock file
- Use exact versions
- Don't manually edit
```

**Default Recommendation:** Lock production dependencies. Automate security updates. Monthly minor updates. Quarterly major review.

---

## Decision 6: Technical Debt Prioritization

**Context:** Deciding which technical debt to pay down and when.

**Options:**

| Approach | Focus | Pros | Cons |
|----------|-------|------|------|
| **Boy Scout** | Improve as you go | Continuous | Slow progress |
| **Dedicated Sprint** | Scheduled cleanup | Focused | Blocks features |
| **Threshold** | When debt hits limit | Clear trigger | May be too late |
| **Ignore** | Never pay down | All features | Compounding cost |

**Framework:**
```
Technical debt prioritization:

DEBT CATEGORIES:
A: Blocking (Fix now)
B: Impeding (Fix soon)
C: Annoying (Fix when convenient)
D: Cosmetic (Maybe never)

CATEGORY A - FIX NOW:
- Security vulnerabilities
- Data corruption risks
- Production outages
- Blocked deployments

CATEGORY B - FIX SOON:
- Slow developer velocity
- Flaky tests blocking CI
- Performance degradation
- Difficult onboarding

CATEGORY C - FIX WHEN CONVENIENT:
- Code duplication
- Missing tests
- Unclear naming
- Old patterns

CATEGORY D - MAYBE NEVER:
- Style preferences
- Minor inconsistencies
- "I would have done differently"
- Unused code (if not hurting)

PRIORITIZATION MATRIX:
            High Impact   Low Impact
High Effort     B            D
Low Effort      A            C

DEBT BUDGET:
Option 1: 20% of sprint
Option 2: Every 4th sprint
Option 3: As part of related work

WHEN TO PAY:
- When working in the area anyway
- When it's blocking something
- When it reaches category A
- When new team member struggles

TRACKING:
Maintain debt register:
| ID | Description | Category | Owner | Created |
| TD-1 | N+1 in orders | B | @dev | 2024-01 |

Review monthly, reprioritize quarterly.
```

**Default Recommendation:** 20% ongoing for debt. Address Category A immediately. Work Category B into related features.

---

## Decision 7: Caching Strategy

**Context:** Deciding what to cache, where, and for how long.

**Options:**

| Layer | Location | Speed | Staleness Risk |
|-------|----------|-------|----------------|
| **Browser** | Client | Fastest | Client control |
| **CDN** | Edge | Very fast | Minutes |
| **Application** | Server memory | Fast | Seconds |
| **Database** | Query cache | Medium | Real-time |

**Framework:**
```
Caching decision matrix:

WHAT TO CACHE:

ALWAYS CACHE:
- Static assets (images, CSS, JS)
- Computed values (expensive calculations)
- External API responses (if allowed)
- Database query results (read-heavy)

SOMETIMES CACHE:
- User session data
- Configuration
- Aggregated data
- Search results

RARELY CACHE:
- User-specific data (if rapidly changing)
- Real-time data
- Write-heavy data

NEVER CACHE:
- Sensitive data (without encryption)
- Highly personalized real-time data
- Data that must be consistent

CACHE LAYER SELECTION:

Browser cache:
- Static assets
- API responses (with care)
- User preferences
Headers: Cache-Control, ETag

CDN cache:
- Public content
- Static resources
- Shared API responses
- Marketing pages

Application cache:
- Session data
- Computed results
- Rate limiting
- Feature flags

Database cache:
- Query results
- Materialized views
- Session storage

TTL GUIDELINES:
Static assets: 1 year (versioned)
API responses: 1-5 minutes
User data: 1-30 seconds
Real-time: No cache

INVALIDATION STRATEGY:
Time-based: Simple, slight staleness
Event-based: Accurate, complex
Version-based: Atomic, requires deployment
Manual: Emergency, error-prone
```

**Default Recommendation:** Cache at the edge for static, app layer for dynamic, aggressive for reads, conservative for writes.

---

## Decision 8: Monitoring and Observability

**Context:** What to monitor and at what level of detail.

**Options:**

| Level | Detail | Cost | Use Case |
|-------|--------|------|----------|
| **Basic** | Uptime + errors | Low | Simple apps |
| **Standard** | + Performance + logs | Medium | Most apps |
| **Advanced** | + Tracing + profiling | High | Complex systems |
| **Full** | Everything | Very high | Critical systems |

**Framework:**
```
Observability levels:

LEVEL 1: BASIC
Metrics:
- Is it up? (health checks)
- Error rate
- Response time (average)

When: Simple apps, early stage

LEVEL 2: STANDARD
Metrics:
+ Percentiles (p50, p95, p99)
+ Request rate
+ Database performance
+ Memory/CPU usage

Logs:
- Structured logging
- Error stack traces
- Request/response logs

When: Most production apps

LEVEL 3: ADVANCED
+ Distributed tracing
+ Custom business metrics
+ Dependency tracking
+ Query analysis

When:
- Microservices
- Performance-critical
- Debugging complex issues

LEVEL 4: FULL
+ Continuous profiling
+ Flame graphs
+ Memory snapshots
+ Traffic analysis

When:
- Financial systems
- High-scale systems
- Optimization projects

KEY METRICS BY TYPE:

WEB APPLICATION:
- Response time (p50, p95, p99)
- Error rate
- Throughput
- Apdex score

API:
- Latency by endpoint
- Error rate by status
- Rate limit hits
- Auth failures

DATABASE:
- Query time
- Connection pool
- Lock waits
- Slow query log

ALERTING:
Critical: Wake someone up
Warning: Look in business hours
Info: Review daily

Alert fatigue is real.
Only alert on actionable issues.
```

**Default Recommendation:** Standard monitoring for most apps. Add tracing for microservices. Alert only on actionable issues.

---

## Decision 9: Code Splitting Approach

**Context:** How to split code for optimal loading.

**Options:**

| Approach | Splitting By | Pros | Cons |
|----------|--------------|------|------|
| **Route-based** | URL paths | Natural | Large routes |
| **Component-based** | Heavy components | Granular | Many chunks |
| **Feature-based** | User features | Business aligned | Complex setup |
| **Vendor-based** | Dependencies | Cache friendly | May be large |

**Framework:**
```
Code splitting strategies:

ROUTE-BASED (Default):
// Each route is its own chunk
const Dashboard = lazy(() => import('./Dashboard'))
const Settings = lazy(() => import('./Settings'))

Best for:
- Single-page apps
- Clear page boundaries
- Different feature sets per route

COMPONENT-BASED:
// Heavy components loaded on demand
const HeavyChart = lazy(() => import('./HeavyChart'))
const RichTextEditor = lazy(() => import('./RichTextEditor'))

Best for:
- Specific heavy components
- Features not all users use
- Libraries with large footprint

FEATURE-BASED:
// Feature flags determine loading
if (features.isEnabled('analytics')) {
  const Analytics = await import('./Analytics')
}

Best for:
- A/B testing
- Enterprise features
- Gradual rollout

VENDOR SPLITTING:
// Separate vendor bundle
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

Best for:
- Dependencies change less
- Better caching
- Parallel loading

CHUNK SIZE TARGETS:
Initial: < 200KB gzipped
Per-route: < 50KB gzipped
Vendor: < 150KB gzipped
Total: < 500KB gzipped

PREFETCHING:
// After initial load
<link rel="prefetch" href="/settings-chunk.js" />

// On hover/intent
onMouseEnter={() => import('./Settings')}
```

**Default Recommendation:** Route-based for structure, component-based for heavy items, vendor splitting for caching.

---

## Decision 10: Database Query Strategy

**Context:** Optimizing database access patterns.

**Options:**

| Strategy | Approach | Pros | Cons |
|----------|----------|------|------|
| **ORM default** | Generated queries | Simple | May be slow |
| **Optimized ORM** | Tuned queries | Balanced | ORM limits |
| **Raw SQL** | Hand-written | Maximum control | More work |
| **Stored Procedures** | Database-side | Fastest | Hard to maintain |

**Framework:**
```
Database query strategy:

ORM DEFAULTS:
Good for:
- Simple CRUD
- Early development
- Team with ORM expertise
- Non-critical paths

Watch for:
- N+1 queries
- Overfetching
- Missing indexes
- Inefficient joins

OPTIMIZED ORM:
// Use preloading
User.findAll({
  include: [Profile, Order]
})

// Select specific fields
User.findAll({
  attributes: ['id', 'name', 'email']
})

// Use raw for complex
const results = await sequelize.query(
  'SELECT ... complex query ...'
)

RAW SQL:
When:
- Complex aggregations
- Performance critical
- ORM can't express query
- Specific optimization needed

Example:
const orders = await db.query(`
  SELECT o.*, SUM(i.price) as total
  FROM orders o
  JOIN items i ON i.order_id = o.id
  WHERE o.created_at > $1
  GROUP BY o.id
  HAVING COUNT(*) > 5
`, [startDate])

QUERY OPTIMIZATION CHECKLIST:
□ Check EXPLAIN ANALYZE
□ Verify index usage
□ Avoid SELECT *
□ Use appropriate indexes
□ Limit result sets
□ Use pagination (cursor > offset)
□ Consider materialized views
□ Cache repeated queries

INDEX STRATEGY:
- Index foreign keys
- Index WHERE clause columns
- Index ORDER BY columns
- Composite for multi-column queries
- Don't over-index (write penalty)

MONITORING:
- Log slow queries (> 100ms)
- Track query frequency
- Monitor connection pool
- Review regularly
```

**Default Recommendation:** Start with ORM, optimize when measured slow. Use raw SQL for complex reports. Always use EXPLAIN ANALYZE.
