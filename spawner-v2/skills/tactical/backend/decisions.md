# Decisions: Backend Engineering

Critical decision points that determine backend architecture success.

---

## Decision 1: Database Selection

**Context:** When choosing your primary database.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **PostgreSQL** | Reliable, ACID, JSON support, extensions | Not best for specific workloads | Default for most apps, need transactions |
| **MySQL** | Fast reads, replication, familiarity | Less features than Postgres | High read workload, existing expertise |
| **MongoDB** | Flexible schema, scaling, developer UX | No transactions (mostly), consistency | Document-centric, schema evolving, scaling priority |
| **Redis** | Fast, data structures, pub/sub | Memory-limited, not durable by default | Caching, sessions, real-time features |

**Framework:**
```
Decision tree:

Need ACID transactions across tables?
├── Yes → PostgreSQL or MySQL
└── No → Continue

Schema changes frequently?
├── Yes → MongoDB
└── No → Continue

Primarily key-value access patterns?
├── Yes → Redis or DynamoDB
└── No → Continue

Heavy analytics/timeseries?
├── Yes → ClickHouse, TimescaleDB
└── No → PostgreSQL (default)

Multi-database is OK:
- Postgres: Primary data (users, orders, products)
- Redis: Cache, sessions, rate limits
- Elasticsearch: Full-text search
- ClickHouse: Analytics

Don't:
- MongoDB for financial data needing transactions
- Postgres for high-velocity time series
- Redis as primary database
```

**Default Recommendation:** PostgreSQL. It handles 90% of use cases, has excellent tooling, and scales further than most realize. Add specialized databases only when PostgreSQL doesn't fit the specific workload.

---

## Decision 2: API Style

**Context:** When designing your API interface.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **REST** | Familiar, cacheable, tooling | Over/under fetching, versioning | CRUD-heavy, caching important, public API |
| **GraphQL** | Flexible queries, strong typing, single endpoint | Complexity, caching hard, N+1 | Multiple clients with different needs, complex data graphs |
| **tRPC** | Type-safe, simple, no schema | TypeScript only, tight coupling | Full-stack TypeScript, internal APIs |
| **gRPC** | Performance, streaming, strong contracts | Browser support limited, learning curve | Service-to-service, high performance needed |

**Framework:**
```
Client needs assessment:

Multiple clients with different data needs?
├── Yes → GraphQL or BFF pattern
└── No → REST or tRPC

Full-stack TypeScript monorepo?
├── Yes → tRPC (simplest)
└── No → Continue

High-performance service-to-service?
├── Yes → gRPC
└── No → REST

Public API?
├── Yes → REST (most accessible)
└── No → Any works

Combination is valid:
- REST for public API
- tRPC for internal
- GraphQL for mobile app
- gRPC between microservices
```

**Default Recommendation:** REST for most cases. It's understood by everyone, works everywhere, and has excellent tooling. Use tRPC for TypeScript monorepos. GraphQL only when you have genuine multi-client query complexity.

---

## Decision 3: Authentication Strategy

**Context:** When implementing user authentication.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Session-based** | Simple, revocable, server control | Stateful, scaling complexity | Traditional web apps, need revocation |
| **JWT** | Stateless, scalable, claims in token | Can't revoke, size grows | Microservices, stateless requirement |
| **OAuth 2.0 / OIDC** | Standard, SSO, delegation | Complexity | Third-party integration, enterprise |
| **Passkeys/WebAuthn** | Phishing-resistant, no passwords | Browser support, UX learning | Security priority, modern apps |

**Framework:**
```
Authentication decision tree:

Need to integrate with identity providers?
├── Yes → OAuth 2.0 / OIDC
└── No → Continue

Microservices or multiple backend services?
├── Yes → JWT (with short expiry)
└── No → Continue

Need instant token revocation?
├── Yes → Sessions (or JWT + blocklist)
└── No → JWT fine

Enterprise customers with SSO requirements?
├── Yes → OIDC (support SAML too)
└── No → Whatever fits

Practical pattern:
- Short-lived JWT (15 min) + refresh token in httpOnly cookie
- Refresh tokens stored in DB (revocable)
- OIDC layer for third-party auth
- MFA for sensitive operations
```

**Default Recommendation:** Use an auth library or service (NextAuth, Supabase Auth, Auth0). Don't build auth from scratch. If building, use short-lived JWT + refresh tokens with session stored server-side.

---

## Decision 4: Caching Strategy

**Context:** When determining how to cache data.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **No cache** | Simple, always fresh | Slower, more DB load | Low traffic, data changes constantly |
| **Application cache (in-memory)** | Fast, no external deps | Per-instance, lost on restart | Single instance, small dataset |
| **Redis/Memcached** | Shared, fast, data structures | Additional infra, network latency | Multiple instances, complex caching |
| **CDN** | Edge caching, global | Limited control, purge delays | Static content, geographic distribution |

**Framework:**
```
Caching decision matrix:

Read/write ratio:
- 100:1 or higher → Cache aggressively
- 10:1 → Cache hot data
- 1:1 or lower → Cache minimally

Staleness tolerance:
- Seconds → In-memory with short TTL
- Minutes → Redis with invalidation
- Hours → CDN appropriate
- Days → CDN with versioning

Cache invalidation strategy:
1. TTL-based: Simple, eventual consistency
2. Event-based: Invalidate on write
3. Version-based: Cache key includes version
4. Write-through: Update cache on write

What to cache:
- Database query results
- Computed values
- API responses
- Session data
- Rate limit counters

What NOT to cache:
- User-specific sensitive data (usually)
- Constantly changing data
- Rarely accessed data
- Large objects (unless justified)
```

**Default Recommendation:** Start without cache. Add Redis when you have a specific performance problem. Use TTL-based invalidation. Only do complex invalidation when TTL doesn't work.

---

## Decision 5: ORM vs Query Builder vs Raw SQL

**Context:** When choosing how to interact with your database.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **ORM (Prisma, SQLAlchemy)** | Type safety, migrations, productivity | Magic, performance gotchas, learning curve | Most applications, type safety priority |
| **Query builder (Drizzle, Knex)** | SQL control, type safety, lightweight | Less abstraction, more verbose | SQL knowledge, performance focus |
| **Raw SQL** | Full control, performance, no abstraction | No type safety, SQL injection risk | DBA on team, performance critical |

**Framework:**
```
Team assessment:

Team SQL proficiency:
├── Low → ORM (Prisma)
├── Medium → Query builder (Drizzle)
└── High → Query builder or raw

Application type:
├── CRUD app → ORM
├── Analytics/reporting → Query builder or raw
├── Complex joins/CTEs → Query builder
└── Simple queries at scale → ORM fine

Type safety requirements:
├── High → Prisma or Drizzle (both excellent)
└── Low → Any, including raw

Modern recommendations:
- Prisma: Best DX, great types, some performance overhead
- Drizzle: SQL-like syntax, great types, lightweight
- Knex: Mature, flexible, JS-focused

Complex queries:
// ORM for simple, raw for complex
const users = await prisma.user.findMany({ where: { active: true } })

// Complex analytics? Use raw
const stats = await prisma.$queryRaw`
  SELECT DATE_TRUNC('day', created_at) as day,
         COUNT(*) as signups
  FROM users
  WHERE created_at > ${startDate}
  GROUP BY 1
  ORDER BY 1
`
```

**Default Recommendation:** Prisma for most new projects. The DX and type safety are worth any minor performance overhead. Use raw SQL for complex reporting queries.

---

## Decision 6: Monolith vs Microservices

**Context:** When determining service architecture.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Monolith** | Simple, easy to develop, no network overhead | Harder to scale parts independently | Teams < 30, most startups |
| **Modular monolith** | Code isolation, single deploy, clear boundaries | Discipline required | Growing team, preparing for future |
| **Microservices** | Independent scaling, team ownership, tech flexibility | Operational complexity, network issues | Large teams, clear domain boundaries |

**Framework:**
```
Team size heuristic:
- 1-10 engineers → Monolith
- 10-30 engineers → Modular monolith
- 30+ engineers → Consider microservices

Questions to answer YES before microservices:
□ Do you have clear domain boundaries?
□ Do you have separate teams that could own services?
□ Do you have operational maturity (monitoring, CI/CD, logging)?
□ Do different parts need to scale differently?
□ Do parts need different technology choices?

If not all yes → Stay monolith

Modular monolith pattern:
src/
├── modules/
│   ├── users/     # Could become microservice
│   │   ├── api/
│   │   ├── domain/
│   │   └── infra/
│   ├── orders/    # Could become microservice
│   └── payments/  # Could become microservice
└── shared/        # Stays shared

Extraction criteria:
- Module has different team
- Module has different scaling needs
- Module has different deployment frequency
- Module is genuinely independent
```

**Default Recommendation:** Monolith until proven otherwise. The operational overhead of microservices is not justified until you have the team size and clear domain boundaries. Modular monolith gives you the best of both.

---

## Decision 7: Background Job Processing

**Context:** When implementing async task processing.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **In-process (setTimeout)** | Simple, no deps | Lost on restart, no retry | Non-critical, dev only |
| **Database-backed (Agenda, pg-boss)** | Use existing DB, transactional | Limited throughput, polling | Simple needs, one database |
| **Redis-backed (BullMQ)** | Fast, features, UI | Additional infra | Most production needs |
| **Cloud queues (SQS, Cloud Tasks)** | Managed, scalable | Vendor lock-in, latency | Cloud-native, scaling needs |

**Framework:**
```
Job requirements assessment:

Volume per day:
- < 1,000 → Database-backed fine
- 1,000-100,000 → Redis-backed (BullMQ)
- > 100,000 → Cloud queues or dedicated

Need guaranteed delivery?
├── Yes → Any except in-process
└── No → Simple works

Need transactional outbox pattern?
├── Yes → Database-backed or manual
└── No → Any works

BullMQ is the sweet spot:
- Redis-backed (fast)
- Retry with backoff
- Rate limiting
- Priority queues
- Job scheduling (cron)
- UI dashboard (Bull Board)
- TypeScript support

// Example
const queue = new Queue('emails')

// Add job
await queue.add('send-welcome', { userId }, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 },
  priority: 1
})

// Process
const worker = new Worker('emails', async (job) => {
  await sendEmail(job.data.userId)
})
```

**Default Recommendation:** BullMQ for most production needs. It's the right balance of features and complexity. Use database-backed for very simple needs, cloud queues for very high scale.

---

## Decision 8: Error Handling Strategy

**Context:** When designing your error handling approach.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Exceptions** | Familiar, stack traces, propagation | Hidden control flow, performance | Default for most languages |
| **Result types (Either)** | Explicit, type-safe, composable | Verbose, learning curve | Functional style, critical paths |
| **Error codes** | Simple, portable | No stack trace, magic numbers | Cross-language, simple cases |

**Framework:**
```
Layered error handling:

1. Domain errors (explicit):
class InsufficientBalanceError extends Error {
  constructor(public required: number, public available: number) {
    super(`Insufficient balance: need ${required}, have ${available}`)
  }
}

class OrderNotFoundError extends Error {
  constructor(public orderId: string) {
    super(`Order ${orderId} not found`)
  }
}

2. Service layer (catches and wraps):
async function processOrder(orderId: string) {
  try {
    const order = await orders.get(orderId)
    // ...
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw new ServiceUnavailableError('Database unavailable')
    }
    throw error // Propagate known errors
  }
}

3. Controller layer (maps to HTTP):
app.use((error, req, res, next) => {
  if (error instanceof InsufficientBalanceError) {
    return res.status(422).json({
      error: 'insufficient_balance',
      message: error.message,
      details: { required: error.required, available: error.available }
    })
  }

  if (error instanceof OrderNotFoundError) {
    return res.status(404).json({
      error: 'order_not_found',
      message: error.message
    })
  }

  // Unknown error - don't expose details
  logger.error('Unhandled error:', error)
  res.status(500).json({ error: 'internal_error' })
})

API error format:
{
  "error": "insufficient_balance",
  "message": "Human readable message",
  "details": { ... }  // Optional context
}
```

**Default Recommendation:** Use typed exceptions for domain errors. Catch and translate at boundaries. Never expose internal errors to clients. Always log with context.

---

## Decision 9: Logging and Observability

**Context:** When setting up your observability stack.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Console + Cloud Logging** | Simple, free tier | Limited analysis | Early stage, low volume |
| **ELK Stack** | Powerful, open source | Operational overhead | On-prem, existing expertise |
| **Cloud-native (CloudWatch, Stackdriver)** | Integrated, managed | Vendor lock-in, cost | Cloud-native, integration priority |
| **Third-party (Datadog, New Relic)** | Features, UX, support | Cost at scale | Budget available, need features |

**Framework:**
```
Three pillars of observability:

1. Logs (what happened):
- Structured logging (JSON)
- Log levels (error, warn, info, debug)
- Correlation IDs for request tracing
- No PII in logs

2. Metrics (how much):
- Request rate, latency, errors (RED)
- Resource usage (CPU, memory, connections)
- Business metrics (signups, orders)
- Prometheus + Grafana or cloud equivalent

3. Traces (how it flowed):
- Distributed tracing for request flow
- OpenTelemetry for instrumentation
- Jaeger, Zipkin, or cloud equivalent

Minimum setup:
const logger = pino({
  level: process.env.LOG_LEVEL || 'info'
})

// Request logging middleware
app.use((req, res, next) => {
  req.id = crypto.randomUUID()
  req.log = logger.child({ requestId: req.id })

  const start = Date.now()
  res.on('finish', () => {
    req.log.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: Date.now() - start
    })
  })
  next()
})

// In handlers
req.log.info({ orderId }, 'Processing order')
```

**Default Recommendation:** Start with structured logging (Pino) + cloud logging. Add metrics (Prometheus) when you need dashboards. Add tracing when you have multiple services. Upgrade to Datadog/New Relic when budget allows and you're past early stage.

---

## Decision 10: Testing Strategy

**Context:** When establishing your backend testing approach.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Unit tests only** | Fast, isolated | Miss integration issues | Pure functions, libraries |
| **Integration tests only** | Test real behavior | Slower, complex setup | API-focused apps |
| **Unit + Integration** | Balanced coverage | More tests to maintain | Most applications |
| **E2E only** | Real user scenarios | Very slow, flaky | Simple apps, limited resources |

**Framework:**
```
Testing pyramid for backend:

       /\
      /E2E\        Few: Critical paths only
     /------\
    /  API   \     Medium: Key endpoints
   /----------\
  /Integration \   Some: Service + DB
 /--------------\
/      Unit      \ Many: Pure functions

What to test where:

Unit tests:
- Business logic functions
- Validation functions
- Utility functions
- Data transformations

Integration tests:
- Repository methods (with real DB)
- Service methods (with real deps)
- API endpoints (with real server)

E2E tests:
- Critical user flows (signup, purchase)
- Smoke tests after deploy

// Test database setup
beforeAll(async () => {
  await migrate(testDb)
})

beforeEach(async () => {
  await testDb.$executeRaw`TRUNCATE users, orders CASCADE`
})

// Integration test example
describe('OrderService', () => {
  it('creates order with inventory check', async () => {
    // Arrange
    await testDb.products.create({ data: { id: 'p1', stock: 10 } })

    // Act
    const order = await orderService.create({
      items: [{ productId: 'p1', quantity: 5 }]
    })

    // Assert
    expect(order.status).toBe('pending')
    const product = await testDb.products.findUnique({ where: { id: 'p1' } })
    expect(product.stock).toBe(5) // Decremented
  })
})
```

**Default Recommendation:** Focus on integration tests for backend. Unit test complex business logic. Few E2E tests for critical paths. Use real database in tests, not mocks.

