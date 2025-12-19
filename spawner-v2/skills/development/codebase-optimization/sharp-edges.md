# Sharp Edges: Codebase Optimization

Critical mistakes that turn optimization efforts into production disasters.

---

## 1. The Premature Optimization

**Severity:** Critical
**Situation:** Optimizing code before measuring or validating the problem
**Why Dangerous:** Wastes time, adds complexity, often makes things worse.

```
THE TRAP:
"This loop looks inefficient. Let me
rewrite it with a more complex algorithm."

*Spends 4 hours on optimization*
*Adds 200 lines of complex code*
*Breaks 3 tests*

Later measurement shows:
Loop runs 10 times per request.
Total time: 0.3ms.
Optimization saved: 0.1ms.
Time wasted: 4 hours.

THE REALITY:
Most code doesn't need optimization.
Intuition about bottlenecks is often wrong.
Measurement must come first.

OPTIMIZATION PROCESS:
1. MEASURE: Profile the actual system
2. IDENTIFY: Find the real bottleneck
3. VALIDATE: Confirm it's worth optimizing
4. OPTIMIZE: Make targeted change
5. MEASURE: Verify improvement
6. MONITOR: Watch for regressions

THE FIX:
Before any optimization:
- What's the measured problem?
- How much time/resources does it take?
- What's the expected improvement?
- Is it worth the complexity cost?

RULES:
- Profile before optimizing
- Target the 20% causing 80% of issues
- Simple code > clever code
- Readability > micro-optimization

WHEN TO OPTIMIZE:
- Measured performance problem
- User-impacting issue
- Cost/resource constraint
- Known algorithmic issue (O(n²) on large n)

WHEN NOT TO OPTIMIZE:
- "Looks slow"
- "Could be faster"
- "Best practice"
- "I know a better way"
```

---

## 2. The Big Bang Rewrite

**Severity:** Critical
**Situation:** Rewriting large portions of the codebase at once
**Why Dangerous:** High risk, long timeline, often fails or never finishes.

```
THE TRAP:
"This codebase is a mess. Let's rewrite it
properly this time."

*6 months later*
- Original system still in production
- New system at 60% feature parity
- Team exhausted
- Bug reports piling up
- Users frustrated
- Project cancelled

"But we were so close..."

THE REALITY:
Big rewrites almost always fail.
They take longer than estimated.
The old system keeps evolving.
You're solving last year's problems.

THE STATISTICS:
- 70% of rewrites fail or are abandoned
- Average: 3x longer than estimated
- Often reintroduce old bugs
- Team morale destroyed

THE FIX:
1. STRANGLE PATTERN
   Build new alongside old.
   Migrate piece by piece.
   Route traffic gradually.
   Old system can stay working.

2. INCREMENTAL REFACTORING
   Improve as you go.
   Boy scout rule.
   No big bang.
   Continuous improvement.

3. CLEARLY BOUNDED REWRITES
   One module at a time.
   Defined interface.
   Ship to production.
   Then next module.

SAFE REWRITE APPROACH:
Week 1: New auth module, behind flag
Week 2: 1% traffic to new auth
Week 3: 10% traffic, monitor
Week 4: 50% traffic
Week 5: 100% traffic
Week 6: Remove old auth

NOT:
Month 1-6: Rewrite everything
Month 7: Pray it works
Month 8: Debug production fires

EXCEPTION:
Small, isolated modules
< 1000 lines
Clear boundaries
Well tested after
```

---

## 3. The Optimization Without Tests

**Severity:** Critical
**Situation:** Refactoring or optimizing without adequate test coverage
**Why Dangerous:** No safety net means you don't know what you broke.

```
THE TRAP:
"I'll just refactor this function.
It's pretty straightforward."

*Refactors without tests*
*Ships to production*
*Edge case breaks*
*Customer data corrupted*

"But it worked in my testing..."

THE REALITY:
Refactoring without tests is gambling.
You might win, but you'll eventually lose big.
Tests are your safety net.

THE FIX:
1. TEST FIRST
   Write tests before refactoring.
   Characterization tests capture behavior.
   Then refactor with confidence.

2. TEST PYRAMID
   Unit tests for logic
   Integration tests for connections
   E2E tests for critical paths

3. GOLDEN MASTER TESTING
   For complex/unknown code:
   Record current outputs
   Run refactored code
   Compare outputs
   Any difference = potential bug

CHARACTERIZATION TEST EXAMPLE:
// Before understanding the code
test('calculatePrice current behavior', () => {
  // Record what it currently does
  expect(calculatePrice(100, 'premium')).toBe(85)
  expect(calculatePrice(100, 'basic')).toBe(100)
  expect(calculatePrice(0, 'premium')).toBe(0)
  // ... more cases

  // Now you know what to preserve
})

THEN REFACTOR.

MINIMUM TEST COVERAGE:
- Happy path tested
- Edge cases covered
- Error paths verified
- Performance baseline if relevant

NO TESTS = NO REFACTOR.
"I don't have time for tests."
Then you don't have time to refactor.
```

---

## 4. The Hidden Side Effect

**Severity:** Critical
**Situation:** Optimization changes behavior in unexpected ways
**Why Dangerous:** Subtle bugs that only appear in production edge cases.

```
THE TRAP:
Original code:
function processItems(items) {
  items.forEach(item => {
    process(item)      // Sync, sequential
    logItem(item)      // Logging happens
    notifyWatchers()   // Side effect
  })
}

"Optimized" code:
function processItems(items) {
  await Promise.all(items.map(item =>
    process(item)      // Now parallel!
  ))
  // Logging gone, notifications wrong order
}

"It's faster!"
But behavior changed.

THE REALITY:
Side effects are everywhere.
Order matters more than you think.
"Equivalent" isn't always equivalent.

HIDDEN SIDE EFFECTS:
- Logging and monitoring
- Analytics and tracking
- Cache updates
- Event emissions
- State mutations
- Database writes
- External API calls

THE FIX:
1. Document side effects
   // SIDE EFFECTS: Updates cache, logs to analytics
   function saveUser(user) { ... }

2. Test for side effects
   test('saveUser logs analytics event', () => {
     saveUser(testUser)
     expect(analytics.track).toHaveBeenCalledWith('user_saved')
   })

3. Preserve behavior explicitly
   // Optimization maintains:
   // - Sequential processing (required by downstream)
   // - Individual logging (required for debugging)
   // - Notification order (required by UI)

4. Check after optimization
   - Same logs generated?
   - Same events emitted?
   - Same external calls made?
   - Same error behavior?

RULE:
Before: List all side effects
After: Verify all still happen
```

---

## 5. The Memory Leak Introduction

**Severity:** Critical
**Situation:** Optimization introduces memory leaks
**Why Dangerous:** Slow degradation, crashes, hard to diagnose.

```
THE TRAP:
"I'll cache this for performance."

const cache = new Map()
function getData(id) {
  if (!cache.has(id)) {
    cache.set(id, expensiveQuery(id))
  }
  return cache.get(id)
}

*Runs for 2 weeks*
*Memory usage: 98%*
*OOM killer strikes*

"But caching should help..."
It did, until memory ran out.

THE REALITY:
Caches without limits are memory leaks.
Event listeners without cleanup leak.
Closures holding references leak.
"Optimization" often introduces leaks.

COMMON LEAK PATTERNS:

UNBOUNDED CACHE:
const cache = {}  // Grows forever
cache[id] = data  // Never cleared

FIX:
const cache = new LRUCache({ max: 1000 })

EVENT LISTENER LEAK:
window.addEventListener('resize', handler)
// Component unmounts, handler stays

FIX:
useEffect(() => {
  window.addEventListener('resize', handler)
  return () => window.removeEventListener('resize', handler)
}, [])

CLOSURE LEAK:
function setup() {
  const bigData = loadBigData()
  return () => {
    // bigData held in closure forever
    console.log('setup done')
  }
}

FIX:
Let go of references when done
bigData = null

THE FIX:
1. Set cache limits and TTLs
2. Clean up event listeners
3. Cancel subscriptions
4. Clear intervals/timeouts
5. Profile memory over time
6. Test for leaks with long runs
```

---

## 6. The Dependency Upgrade Disaster

**Severity:** High
**Situation:** Upgrading dependencies without understanding breaking changes
**Why Dangerous:** Subtle bugs, security issues, production failures.

```
THE TRAP:
"Dependencies are outdated. Let me
upgrade everything."

npm update --latest

*100 packages updated*
*Build passes*
*Ship to production*
*Everything breaks*

"But the tests passed!"
Breaking changes don't always fail tests.

THE REALITY:
Dependency updates are risky.
Major versions have breaking changes.
Even minor versions can break things.
Transitive dependencies are invisible.

UPGRADE PROCESS:
1. ONE AT A TIME
   Upgrade one dependency
   Run full test suite
   Manual testing if needed
   Ship, monitor
   Then next dependency

2. READ CHANGELOGS
   What changed?
   Breaking changes?
   Migration guide?
   Known issues?

3. TEST THOROUGHLY
   - All tests pass
   - Manual smoke test
   - Check specific features
   - Performance comparison

4. HAVE ROLLBACK PLAN
   Lock file in version control
   Know how to downgrade
   Monitor after deploy

THE FIX:
// package.json - Lock versions
"dependencies": {
  "react": "18.2.0",      // Exact version
  "lodash": "~4.17.21",   // Patch only
  "express": "^4.18.0"    // Minor okay
}

UPGRADE PRIORITY:
1. Security patches (ASAP)
2. Bug fixes (soon)
3. Features (when needed)
4. Major versions (carefully planned)

TOOLS:
- npm outdated (see what's old)
- npm audit (security issues)
- dependabot (automated PRs)
- renovate (smarter automation)

RULE:
Update regularly, in small batches.
Big upgrade dumps are bombs waiting to explode.
```

---

## 7. The Premature Abstraction

**Severity:** High
**Situation:** Creating abstractions before patterns emerge
**Why Dangerous:** Wrong abstraction is worse than no abstraction. Harder to change later.

```
THE TRAP:
First use of a pattern:
"I should make this generic for future use."

*Creates elaborate abstraction*
*Adds configuration options*
*Makes it flexible for all cases*

Second use case arrives:
Doesn't fit the abstraction.
Now have to work around it.
Abstraction becomes burden.

THE REALITY:
Abstractions are expensive.
Wrong abstractions are very expensive.
You can't predict future needs.
Wait for patterns to emerge.

RULE OF THREE:
1st occurrence: Just write it
2nd occurrence: Note the duplication
3rd occurrence: NOW abstract

THE FIX:
1. DUPLICATION IS OKAY
   Until you see the pattern.
   Copy-paste is fine temporarily.
   Wrong abstraction is worse.

2. WAIT FOR CLARITY
   What's actually common?
   What varies?
   What's the stable interface?

3. EXTRACT, DON'T PREDICT
   // Bad: Predict future needs
   function createDataFetcher({
     cache, retry, timeout, transform,
     onError, onSuccess, ...maybeMore
   })

   // Good: Extract what you need now
   function fetchUserData(userId) {
     // Simple, specific
   }

4. INLINE FIRST
   Make the specific thing work.
   Copy if needed again.
   Third time: Extract the pattern.

AHA (Avoid Hasty Abstraction):
"Duplication is far cheaper than
the wrong abstraction."
- Sandi Metz

SIGNALS OF WRONG ABSTRACTION:
- Options/params growing
- If/else for different cases
- Callers working around it
- Nobody understands it
```

---

## 8. The Broken Incremental Migration

**Severity:** High
**Situation:** Starting a migration that never finishes
**Why Dangerous:** Two systems to maintain forever, compounding complexity.

```
THE TRAP:
"We'll migrate from System A to System B
incrementally."

Month 1: Migrate module 1 ✓
Month 2: Migrate module 2 ✓
Month 3: Priority shift
Month 4: New feature on System A
Month 5: Another feature on System A
Month 6: "We'll finish the migration later"

Year 2: Both systems in production
Year 3: Nobody remembers why
Year 5: "Legacy" has two meanings now

THE REALITY:
Incomplete migrations compound costs.
Every day with two systems:
- Double maintenance
- Double bugs
- Double confusion
- Double documentation

THE FIX:
1. COMMIT TO COMPLETION
   Migration isn't done until old is gone.
   Set deadline, make it real.
   No new features on old system.

2. TIMEBOX STRICTLY
   Max 3 months for any migration.
   If not done, evaluate:
   - Finish faster
   - Abandon migration
   - But not "pause indefinitely"

3. FEATURE FREEZE OLD SYSTEM
   All new work on new system.
   Bug fixes only on old.
   Creates pressure to finish.

4. BURN THE BOATS
   Set removal date.
   Communicate widely.
   Actually remove on date.

5. TRACK PROGRESS VISIBLY
   Migration: 60% complete
   Deadline: March 15
   Remaining: 4 modules
   Owner: @person

INCREMENTAL DONE RIGHT:
Week 1: Migrate + remove Module A
Week 2: Migrate + remove Module B
Week 3: Migrate + remove Module C
Week 4: Old system deleted

NOT:
Month 1: Migrate Module A
Month 6: Migrate Module B
Month 12: What were we migrating again?
```

---

## 9. The Performance Cliff

**Severity:** High
**Situation:** Optimization works until a threshold, then fails catastrophically
**Why Dangerous:** Works in testing, fails in production at scale.

```
THE TRAP:
"I optimized the query. Look how fast!"

Test: 100 records, 5ms
Stage: 1,000 records, 50ms
Prod: 100,000 records, timeout

Or:

Cache hits: fast
Cache miss: 30-second cold start
Thundering herd: site down

THE REALITY:
Linear testing misses exponential failures.
Edge cases in testing are common cases in production.
Optimizations often have cliffs.

COMMON CLIFFS:

ALGORITHMIC:
O(n) looks fine at n=100
O(n²) explodes at n=10000

MEMORY:
Fits in RAM: fast
Swaps to disk: 1000x slower

CACHE:
Cache hit: 1ms
Cache miss: 500ms

CONCURRENT:
1 connection: works
100 connections: deadlock

THE FIX:
1. TEST AT SCALE
   Test with production-like data volumes
   Test with production-like traffic
   Test at 10x expected load

2. IDENTIFY CLIFFS
   What happens when cache misses?
   What if this grows 10x?
   What if all requests arrive at once?

3. GRACEFUL DEGRADATION
   // Bad: Works or fails
   return cache.get(key) || loadFromDB(key)

   // Better: Degrades gracefully
   try {
     return cache.get(key)
   } catch {
     return fallbackValue  // Fast fallback
   }

4. CIRCUIT BREAKERS
   Fail fast when overwhelmed.
   Don't cascade failures.

5. LOAD SHEDDING
   When overloaded:
   Reject new requests gracefully
   Instead of trying and failing slowly
```

---

## 10. The Optimization Coupling

**Severity:** High
**Situation:** Performance optimization tightly couples components
**Why Dangerous:** Harder to change, harder to understand, harder to test.

```
THE TRAP:
"I can make this faster by accessing
the database directly."

Before:
UserService → UserRepository → Database

After:
UserService → Database (direct SQL)
UserService knows about table structure
UserService has SQL embedded
Repository bypassed for "performance"

THE REALITY:
Tight coupling for performance
trades future velocity for current speed.
Technical debt with interest.

COUPLING EXAMPLES:
- Direct DB access bypassing ORM
- Shared mutable state for speed
- Inlined code for call reduction
- Global variables for access
- Breaking module boundaries

THE FIX:
1. OPTIMIZE WITHIN BOUNDARIES
   Make Repository faster.
   Don't bypass Repository.

   // Bad: Bypass for performance
   const result = await db.raw('SELECT...')

   // Better: Optimize Repository
   class UserRepository {
     findWithPreload() { // Optimized method
       return this.query()
         .preload('profile')
         .preload('settings')
     }
   }

2. USE COMPOSITION
   Combine fast primitives.
   Don't create monoliths.

3. CACHE AT BOUNDARIES
   Cache interface results.
   Not internal state.

4. MEASURE THE COST
   How much speed gained?
   How much coupling added?
   Is it worth the trade-off?

5. DOCUMENT THE DEBT
   // PERF: Direct SQL for 10x speedup
   // TODO: Refactor when ORM supports batch load
   // Added: 2024-01-15, Owner: @person

RULE:
If optimization requires breaking
module boundaries, question if it's
worth it. Usually it's not.
```

---

## 11. The Metrics Lie

**Severity:** High
**Situation:** Optimizing for metrics that don't represent real user experience
**Why Dangerous:** Numbers improve while users suffer.

```
THE TRAP:
"Average response time: 200ms. Great!"

Reality:
- 90% of requests: 50ms
- 10% of requests: 1550ms
- p99: 2000ms
- Timeouts: 5%

"But the average is good..."
Users experiencing 2-second loads disagree.

THE REALITY:
Averages hide problems.
Outliers matter.
Metrics can mislead.

METRICS THAT LIE:

AVERAGE:
Hides tail latency.
One slow request in 100 affects 1% of users.
p50, p95, p99 tell more.

TOTAL TIME:
"Page loads in 2 seconds"
But time-to-interactive is 8 seconds.
Users wait 8 seconds.

SYNTHETIC TESTS:
"Lighthouse score: 100"
Real user data: Median 4 seconds.
Lab ≠ Field.

THROUGHPUT:
"1000 requests/second"
With 20% error rate.
Successful throughput: 800.

THE FIX:
1. USE PERCENTILES
   p50: Typical experience
   p90: Most users
   p99: Worst common case
   p99.9: Your angriest users

2. MEASURE REAL USERS
   RUM (Real User Monitoring)
   Not just synthetic tests

3. MEASURE WHAT MATTERS
   Time to interactive
   First contentful paint
   Core Web Vitals
   Not just "load time"

4. MEASURE ERRORS
   Success rate, not just speed
   Errors count as infinite latency

5. SEGMENT DATA
   By device, location, network
   "Fast for desktop, slow for mobile"
   Average hides this.

BETTER METRICS:
- p95 latency (most users)
- Success rate (errors matter)
- Time to interactive (user experience)
- RUM data (real users)
```

---

## 12. The Optimization Without Monitoring

**Severity:** High
**Situation:** Shipping optimizations without visibility into their effect
**Why Dangerous:** Can't know if it helped, hurt, or if it regresses later.

```
THE TRAP:
"Shipped the optimization. Moving on."

Week later:
"Is the optimization working?"
"I think so?"
"Any metrics?"
"We didn't set up monitoring..."

THE REALITY:
Unmonitored optimizations might:
- Not work at all
- Work then regress
- Cause problems elsewhere
- Be removed accidentally

THE FIX:
1. BEFORE/AFTER METRICS
   Baseline before change
   Measure after change
   Compare with statistical rigor

2. DASHBOARDS
   Key performance metrics visible
   Trends over time
   Alerts on regression

3. FEATURE FLAGS
   Deploy behind flag
   Compare flagged vs unflagged
   Gradual rollout

4. A/B TESTING
   "Optimized" vs "original"
   Statistically significant difference?
   Real user impact?

5. ALERTS
   Performance below threshold?
   Alert immediately.
   Don't find out from users.

MONITORING CHECKLIST:
□ Baseline metrics captured
□ New metrics tracking change
□ Dashboard created/updated
□ Alerts configured
□ Rollback plan ready
□ Success criteria defined

OPTIMIZATION LOG:
Date: 2024-01-15
Change: Optimized user query
Baseline p95: 450ms
After p95: 120ms
Improvement: 73%
Monitoring: dashboard.example/user-query
Alert: Fires if p95 > 200ms

RULE:
No metrics = No optimization.
If you can't measure it,
you can't improve it.
```
