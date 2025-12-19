# Sharp Edges: Backend Engineering

These are the backend mistakes that cause outages, data corruption, and 3am pages. Each edge represents real incidents, lost data, and careers changed by "it worked in dev."

---

## 1. The N+1 Query Massacre

**Severity:** Critical

**The Trap:**
Your API endpoint returns users with their posts. ORM makes it easy - just access `user.posts` in a loop. Works great with 10 users. With 1,000 users, you've just fired 1,001 queries. Database CPU spikes, response times balloon, users complain about slowness.

**Why It Happens:**
ORMs hide the queries. Lazy loading feels convenient. Testing with small datasets masks the problem. No query monitoring in development.

**The Fix:**
```typescript
// WRONG - N+1 (fires query for each user's posts)
const users = await prisma.user.findMany()
for (const user of users) {
  const posts = await prisma.post.findMany({
    where: { authorId: user.id }
  })
  // 1 + N queries
}

// WRONG - Still N+1 (ORM lazy loads)
const users = await prisma.user.findMany()
users.map(u => u.posts) // Each access fires a query

// RIGHT - Eager loading with include
const users = await prisma.user.findMany({
  include: { posts: true }
})
// 1 query with JOIN, or 2 queries with IN clause

// RIGHT - Explicit join in SQL
SELECT u.*, p.*
FROM users u
LEFT JOIN posts p ON p.author_id = u.id

// Detection: Enable query logging
// Look for repeated similar queries
// Monitor query count per request (should be low)
```

**Detection Pattern:**
- Response time grows linearly with data size
- Database CPU high, app CPU low
- Query logs show repeated similar queries
- Pagination doesn't improve performance

---

## 2. The Transaction Timeout Trap

**Severity:** Critical

**The Trap:**
You wrap a complex operation in a transaction for safety. Part of that operation calls an external API. The API is slow today. Your transaction holds locks for 30 seconds. Other requests queue up waiting for locks. Database connections exhaust. Everything freezes.

**Why It Happens:**
"Transactions make it safe" oversimplification. External calls in transactions feel logical. No timeout configuration. Testing doesn't simulate slow externals.

**The Fix:**
```typescript
// WRONG - External call inside transaction
await prisma.$transaction(async (tx) => {
  const order = await tx.order.create({ data: orderData })

  // This can take 30+ seconds if payment service is slow
  const payment = await paymentService.charge(order.total)

  await tx.order.update({
    where: { id: order.id },
    data: { paymentId: payment.id }
  })
})

// RIGHT - External calls outside transaction
// 1. Create order in pending state
const order = await prisma.order.create({
  data: { ...orderData, status: 'pending_payment' }
})

// 2. External call without transaction
const payment = await paymentService.charge(order.total)

// 3. Quick transaction to update
await prisma.order.update({
  where: { id: order.id },
  data: { paymentId: payment.id, status: 'paid' }
})

// BETTER - Saga pattern for complex flows
// Each step is independent with compensation on failure

// Always set transaction timeout
await prisma.$transaction(
  async (tx) => { /* ... */ },
  { timeout: 5000 } // 5 second max
)
```

**Detection Pattern:**
- Database lock wait timeouts
- Connection pool exhaustion
- "Waiting for lock" in slow query log
- External service latency correlates with DB issues

---

## 3. The Uncached Repeated Query

**Severity:** High

**The Trap:**
Every page load queries user preferences. Every API call validates permissions. You're hitting the database thousands of times for data that changes once a day. Database groans under the load of serving the same data repeatedly.

**Why It Happens:**
"Database is fast" assumption. Fear of stale data. No caching strategy. Each developer adds queries without seeing the full picture.

**The Fix:**
```typescript
// WRONG - Query on every request
async function getUser(req, res) {
  const user = await db.user.findUnique({
    where: { id: req.userId },
    include: { preferences: true, permissions: true }
  })
  // Called 10,000 times/minute for same user
}

// RIGHT - Cache with appropriate TTL
import { Redis } from 'ioredis'
const redis = new Redis()

async function getUser(userId: string) {
  const cacheKey = `user:${userId}`

  // Try cache first
  const cached = await redis.get(cacheKey)
  if (cached) return JSON.parse(cached)

  // Cache miss - query DB
  const user = await db.user.findUnique({
    where: { id: userId },
    include: { preferences: true }
  })

  // Cache for 5 minutes
  await redis.setex(cacheKey, 300, JSON.stringify(user))

  return user
}

// Invalidate on update
async function updateUser(userId: string, data: UserData) {
  await db.user.update({ where: { id: userId }, data })
  await redis.del(`user:${userId}`) // Invalidate cache
}

// Cache patterns by data type:
// - User session: 15-60 minutes
// - User preferences: 5-15 minutes
// - Feature flags: 1-5 minutes
// - Rate limits: Seconds
// - Static config: Hours
```

**Detection Pattern:**
- Same query appears thousands of times in logs
- Database load doesn't match business logic complexity
- Adding Redis dramatically improves performance
- Query is simple but takes significant total time

---

## 4. The Missing Idempotency Key

**Severity:** Critical

**The Trap:**
User clicks "Pay" twice. Network hiccup causes retry. Webhook fires twice. Without idempotency, you've just charged them twice, created duplicate orders, or sent the email twice. Now you're dealing with angry customers and refunds.

**Why It Happens:**
Happy path thinking. "Users won't do that." Network is assumed reliable. Retry logic without deduplication. Webhooks don't guarantee once-delivery.

**The Fix:**
```typescript
// WRONG - No idempotency
app.post('/api/charge', async (req, res) => {
  const { userId, amount } = req.body
  await paymentService.charge(userId, amount) // Can double-charge
  await db.order.create({ data: { userId, amount } }) // Duplicate order
})

// RIGHT - Idempotency key
app.post('/api/charge', async (req, res) => {
  const { userId, amount, idempotencyKey } = req.body

  // Check if we've seen this request before
  const existing = await db.payment.findUnique({
    where: { idempotencyKey }
  })

  if (existing) {
    // Return cached response, don't process again
    return res.json(existing.response)
  }

  // Process payment
  const result = await paymentService.charge(userId, amount)

  // Store idempotency record
  await db.payment.create({
    data: {
      idempotencyKey,
      userId,
      amount,
      response: result
    }
  })

  res.json(result)
})

// For webhooks - use event ID as idempotency key
app.post('/webhook/stripe', async (req, res) => {
  const { id: eventId, type, data } = req.body

  const processed = await db.webhookEvent.findUnique({
    where: { eventId }
  })

  if (processed) {
    return res.status(200).send('Already processed')
  }

  await processWebhook(type, data)
  await db.webhookEvent.create({ data: { eventId } })

  res.status(200).send('OK')
})
```

**Detection Pattern:**
- Customer complaints about double charges
- Duplicate records in database
- Audit logs show same operation twice close together
- Payment disputes for duplicates

---

## 5. The Unvalidated Input Injection

**Severity:** Critical

**The Trap:**
User input goes into a query without sanitization. Attacker crafts special input. Your database executes their commands. They've just downloaded your entire user table, or worse, dropped it.

**Why It Happens:**
String concatenation is easy. ORMs give false security sense. Input "looks fine" in testing. Validation is tedious.

**The Fix:**
```typescript
// WRONG - SQL Injection vulnerable
const query = `SELECT * FROM users WHERE email = '${email}'`
// Attacker sends: email = "'; DROP TABLE users; --"

// WRONG - NoSQL Injection
const user = await db.users.findOne({
  email: req.body.email // If email is {$gt: ""}, returns all users
})

// RIGHT - Parameterized queries
const query = 'SELECT * FROM users WHERE email = $1'
const result = await db.query(query, [email])

// RIGHT - ORM with proper typing
const user = await prisma.user.findUnique({
  where: { email: String(req.body.email) } // Explicit type coercion
})

// RIGHT - Input validation with Zod
import { z } from 'zod'

const UserInput = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().positive().optional()
})

app.post('/users', async (req, res) => {
  const input = UserInput.parse(req.body) // Throws if invalid
  const user = await prisma.user.create({ data: input })
  res.json(user)
})

// Validate EVERYTHING from user:
// - Query params
// - Body
// - Headers (some attacks via headers)
// - File uploads
```

**Detection Pattern:**
- String concatenation with user input in queries
- No input validation middleware
- Errors contain SQL syntax
- WAF logs show injection attempts

---

## 6. The Unbounded Query

**Severity:** High

**The Trap:**
Admin requests "all users." There are 10 million users. Query runs for 60 seconds, uses 8GB RAM, crashes the server. Or worse, it succeeds and returns a 2GB JSON response that crashes the client.

**Why It Happens:**
"We don't have that much data" assumption. No pagination by default. Endpoints work in dev with 100 records. No resource limits.

**The Fix:**
```typescript
// WRONG - No limits
app.get('/api/users', async (req, res) => {
  const users = await db.user.findMany() // All 10 million
  res.json(users)
})

// RIGHT - Always paginate
app.get('/api/users', async (req, res) => {
  const page = parseInt(req.query.page) || 1
  const limit = Math.min(parseInt(req.query.limit) || 20, 100) // Max 100
  const skip = (page - 1) * limit

  const [users, total] = await Promise.all([
    db.user.findMany({ skip, take: limit }),
    db.user.count()
  ])

  res.json({
    data: users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  })
})

// RIGHT - Cursor pagination for large datasets
app.get('/api/users', async (req, res) => {
  const cursor = req.query.cursor
  const limit = Math.min(parseInt(req.query.limit) || 20, 100)

  const users = await db.user.findMany({
    take: limit + 1, // Fetch one extra to check if more exist
    cursor: cursor ? { id: cursor } : undefined,
    orderBy: { id: 'asc' }
  })

  const hasMore = users.length > limit
  const data = hasMore ? users.slice(0, -1) : users

  res.json({
    data,
    nextCursor: hasMore ? data[data.length - 1].id : null
  })
})

// Also protect internal queries
async function processAllUsers() {
  let cursor = undefined
  while (true) {
    const batch = await db.user.findMany({
      take: 1000,
      cursor,
      orderBy: { id: 'asc' }
    })
    if (batch.length === 0) break

    await processBatch(batch)
    cursor = { id: batch[batch.length - 1].id }
  }
}
```

**Detection Pattern:**
- Endpoints that can return unlimited data
- Memory spikes during certain requests
- Client timeouts on list endpoints
- Database slow queries on SELECT without LIMIT

---

## 7. The Race Condition Balance

**Severity:** Critical

**The Trap:**
User has $100 balance. Two concurrent requests each check balance, see $100, each deduct $80. Both succeed. Balance is now -$60. You've given away free money.

**Why It Happens:**
Check-then-act patterns. Optimistic concurrency feels fast. No transaction isolation understanding. Hard to reproduce in testing.

**The Fix:**
```typescript
// WRONG - Race condition
async function withdraw(userId: string, amount: number) {
  const user = await db.user.findUnique({ where: { id: userId } })

  if (user.balance >= amount) { // Check
    await db.user.update({
      where: { id: userId },
      data: { balance: user.balance - amount } // Act with stale value
    })
  }
}

// RIGHT - Atomic update with condition
async function withdraw(userId: string, amount: number) {
  const result = await db.user.updateMany({
    where: {
      id: userId,
      balance: { gte: amount } // Condition in WHERE
    },
    data: {
      balance: { decrement: amount } // Atomic decrement
    }
  })

  if (result.count === 0) {
    throw new Error('Insufficient balance')
  }
}

// RIGHT - Pessimistic locking
async function withdraw(userId: string, amount: number) {
  await prisma.$transaction(async (tx) => {
    // SELECT ... FOR UPDATE
    const user = await tx.$queryRaw`
      SELECT * FROM users WHERE id = ${userId} FOR UPDATE
    `

    if (user.balance < amount) {
      throw new Error('Insufficient balance')
    }

    await tx.user.update({
      where: { id: userId },
      data: { balance: { decrement: amount } }
    })
  })
}

// RIGHT - Optimistic locking with version
async function withdraw(userId: string, amount: number, expectedVersion: number) {
  const result = await db.user.updateMany({
    where: {
      id: userId,
      version: expectedVersion // Only update if version matches
    },
    data: {
      balance: { decrement: amount },
      version: { increment: 1 }
    }
  })

  if (result.count === 0) {
    throw new ConcurrencyError('Please retry')
  }
}
```

**Detection Pattern:**
- Financial discrepancies in audits
- "Impossible" states in data
- Check-then-act patterns in code
- No locking or atomic operations on shared resources

---

## 8. The Cascading Delete Disaster

**Severity:** Critical

**The Trap:**
User deletes their account. CASCADE DELETE triggers. Their posts delete. Comments on posts delete. Replies to comments delete. Likes delete. Notifications delete. Suddenly you've deleted half your database and the transaction takes 10 minutes.

**Why It Happens:**
CASCADE feels like the right default. Didn't consider data volume. No testing with production-like data. Implicit side effects.

**The Fix:**
```typescript
// WRONG - Cascading delete can spiral
// schema.prisma
model User {
  posts Post[] @relation(onDelete: Cascade)
}

model Post {
  comments Comment[] @relation(onDelete: Cascade)
}
// Deleting user → all posts → all comments → could be millions of rows

// RIGHT - Soft delete
model User {
  deletedAt DateTime?
  posts     Post[]
}

async function deleteUser(userId: string) {
  await db.user.update({
    where: { id: userId },
    data: { deletedAt: new Date() }
  })

  // Background job handles cleanup in batches
  await queue.add('cleanup-user', { userId })
}

// RIGHT - Explicit batched deletion
async function hardDeleteUser(userId: string) {
  // Delete in batches to avoid long transactions
  while (true) {
    const deleted = await db.post.deleteMany({
      where: { authorId: userId },
      take: 1000
    })
    if (deleted.count === 0) break
    await sleep(100) // Don't hammer DB
  }

  await db.user.delete({ where: { id: userId } })
}

// RIGHT - Foreign keys without cascade
// Use RESTRICT or NO ACTION, handle in application
model Post {
  author   User   @relation(fields: [authorId], references: [id], onDelete: Restrict)
  authorId String
}
```

**Detection Pattern:**
- Long-running DELETE statements
- Transaction timeouts on deletes
- Database locks during deletes
- CASCADE DELETE in schema without volume analysis

---

## 9. The Unhandled Async Error

**Severity:** High

**The Trap:**
Background job throws an error. Nobody catches it. Process crashes, or worse, continues in corrupted state. Errors silently swallowed. Data ends up inconsistent and you find out days later.

**Why It Happens:**
Fire-and-forget patterns. Promise rejections not caught. Callbacks without error handling. No global error handlers.

**The Fix:**
```typescript
// WRONG - Unhandled promise rejection
app.post('/api/signup', (req, res) => {
  createUser(req.body) // Not awaited, errors lost
  sendWelcomeEmail(req.body.email) // Not awaited, errors lost
  res.json({ success: true }) // Returns before work done
})

// WRONG - setTimeout/setInterval without error handling
setTimeout(() => {
  processQueue() // If this throws, nobody knows
}, 1000)

// RIGHT - Await and handle errors
app.post('/api/signup', async (req, res, next) => {
  try {
    const user = await createUser(req.body)

    // Background task - use job queue, not fire-and-forget
    await queue.add('send-welcome-email', { userId: user.id })

    res.json({ success: true })
  } catch (error) {
    next(error) // Pass to error handler
  }
})

// RIGHT - Global unhandled rejection handler
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', { reason, promise })
  // Don't exit - but log and alert
})

// RIGHT - Wrap async intervals
async function safeInterval(fn: () => Promise<void>, ms: number) {
  const wrapped = async () => {
    try {
      await fn()
    } catch (error) {
      logger.error('Interval error:', error)
      // Alert, don't crash
    }
  }

  setInterval(wrapped, ms)
}

// RIGHT - Express async wrapper
const asyncHandler = (fn: AsyncHandler) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next)

app.post('/api/users', asyncHandler(async (req, res) => {
  const user = await createUser(req.body)
  res.json(user)
}))
```

**Detection Pattern:**
- UnhandledPromiseRejectionWarning in logs
- Missing data that should exist
- Jobs that "ran" but had no effect
- Silent failures in background processes

---

## 10. The Secrets in Code

**Severity:** Critical

**The Trap:**
API key committed to repo. Database password in config file. JWT secret hardcoded for "convenience." Someone clones the repo, has all your production credentials. Or worse, repo becomes public.

**Why It Happens:**
"Just for development" that goes to production. Copy-paste from docs. No secrets management setup. Not in .gitignore.

**The Fix:**
```typescript
// WRONG - Hardcoded secrets
const STRIPE_KEY = 'sk_live_abc123...'
const JWT_SECRET = 'super-secret-key'
const DB_URL = 'postgres://admin:password123@prod-db.com/main'

// WRONG - Checked into repo
// config.js
module.exports = {
  stripe: 'sk_live_...',
  database: 'postgres://...'
}

// RIGHT - Environment variables
const STRIPE_KEY = process.env.STRIPE_SECRET_KEY
const JWT_SECRET = process.env.JWT_SECRET
const DB_URL = process.env.DATABASE_URL

if (!STRIPE_KEY) {
  throw new Error('STRIPE_SECRET_KEY is required')
}

// RIGHT - .env files (local only, gitignored)
// .env.example (committed, no real values)
STRIPE_SECRET_KEY=sk_test_...
DATABASE_URL=postgres://localhost/dev

// .env (gitignored, real values)
STRIPE_SECRET_KEY=sk_live_...
DATABASE_URL=postgres://user:pass@host/db

// .gitignore
.env
.env.local
.env.*.local

// RIGHT - Secret manager in production
import { SecretManagerServiceClient } from '@google-cloud/secret-manager'

async function getSecret(name: string) {
  const client = new SecretManagerServiceClient()
  const [version] = await client.accessSecretVersion({ name })
  return version.payload.data.toString()
}

// Pre-commit hook to catch secrets
// Use tools like gitleaks, trufflehog
```

**Detection Pattern:**
- Strings that look like keys/passwords in code
- No .env.example in repo
- Secrets in docker-compose.yml
- git log shows sensitive values

---

## 11. The Missing Rate Limit

**Severity:** High

**The Trap:**
Login endpoint has no rate limit. Attacker brute-forces passwords at 1000 requests/second. Either they get in, or your auth service falls over. Either way, you lose.

**Why It Happens:**
"We'll add security later." Didn't seem urgent. Rate limiting is "ops work." Testing doesn't simulate attacks.

**The Fix:**
```typescript
// WRONG - No rate limiting
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body
  const user = await authenticate(email, password)
  res.json({ token: createToken(user) })
})

// RIGHT - Rate limiting with Redis
import rateLimit from 'express-rate-limit'
import RedisStore from 'rate-limit-redis'

// Global rate limit
const globalLimiter = rateLimit({
  store: new RedisStore({ client: redis }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per window
})

// Strict limit for auth endpoints
const authLimiter = rateLimit({
  store: new RedisStore({ client: redis }),
  windowMs: 15 * 60 * 1000,
  max: 5, // Only 5 attempts
  keyGenerator: (req) => req.body.email || req.ip, // Per email
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many login attempts. Try again later.'
    })
  }
})

app.use(globalLimiter)
app.post('/api/login', authLimiter, loginHandler)

// RIGHT - Progressive delays
const failedAttempts = new Map<string, number>()

app.post('/api/login', async (req, res) => {
  const { email } = req.body
  const attempts = failedAttempts.get(email) || 0

  // Progressive delay: 0, 1, 2, 4, 8, 16... seconds
  const delay = Math.min(Math.pow(2, attempts - 1), 60) * 1000
  if (delay > 0) {
    await sleep(delay)
  }

  try {
    const user = await authenticate(req.body)
    failedAttempts.delete(email)
    res.json({ token: createToken(user) })
  } catch {
    failedAttempts.set(email, attempts + 1)
    res.status(401).json({ error: 'Invalid credentials' })
  }
})
```

**Detection Pattern:**
- Auth endpoints without rate limiting
- No failed attempt tracking
- High volume of 401 responses from same IP
- Login success after many failures (brute force succeeded)

---

## 12. The Sync File Processing

**Severity:** High

**The Trap:**
User uploads a file. Server processes it synchronously - parsing, validating, resizing, storing. For a large file, request takes 2 minutes. Connection times out. User retries. Now you're processing the same file twice.

**Why It Happens:**
Synchronous feels simpler. Works fine with small files. No job queue set up. "It's fast enough for now."

**The Fix:**
```typescript
// WRONG - Synchronous processing
app.post('/api/upload', async (req, res) => {
  const file = req.file

  // These can take minutes for large files
  const processed = await processImage(file)
  const uploaded = await uploadToS3(processed)
  const indexed = await indexContent(file)

  res.json({ url: uploaded.url }) // Times out
})

// RIGHT - Async with job queue
import { Queue } from 'bullmq'

const fileQueue = new Queue('file-processing')

app.post('/api/upload', async (req, res) => {
  const file = req.file

  // Quick: Store raw file, create job
  const rawUrl = await uploadRawToS3(file)
  const job = await fileQueue.add('process', {
    fileUrl: rawUrl,
    userId: req.userId
  })

  // Respond immediately
  res.json({
    jobId: job.id,
    status: 'processing',
    checkUrl: `/api/jobs/${job.id}`
  })
})

// Worker processes in background
const worker = new Worker('file-processing', async (job) => {
  const { fileUrl, userId } = job.data

  const file = await downloadFromS3(fileUrl)
  const processed = await processImage(file)
  const finalUrl = await uploadProcessedToS3(processed)

  // Notify user (webhook, websocket, email)
  await notifyUser(userId, { status: 'complete', url: finalUrl })

  return { url: finalUrl }
})

// Status endpoint
app.get('/api/jobs/:id', async (req, res) => {
  const job = await fileQueue.getJob(req.params.id)

  res.json({
    status: await job.getState(),
    progress: job.progress,
    result: job.returnvalue
  })
})
```

**Detection Pattern:**
- Request timeouts on upload endpoints
- Long-running synchronous processes
- No job queue in architecture
- User complaints about "stuck" uploads

