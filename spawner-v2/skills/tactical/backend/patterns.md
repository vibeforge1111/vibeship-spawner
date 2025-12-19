# Patterns: Backend Engineering

These are the proven approaches that consistently deliver reliable, scalable, and maintainable backend systems.

---

## 1. The Repository Pattern

**What It Is:**
Abstracting data access behind a repository interface, separating business logic from database implementation.

**When To Use:**
- When you want testable business logic
- When database might change
- When queries are reused across services
- When caching needs to be transparent

**The Pattern:**

```typescript
// Repository interface
interface UserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  create(data: CreateUserData): Promise<User>
  update(id: string, data: UpdateUserData): Promise<User>
  delete(id: string): Promise<void>
}

// Prisma implementation
class PrismaUserRepository implements UserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } })
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } })
  }

  async create(data: CreateUserData): Promise<User> {
    return this.prisma.user.create({ data })
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    return this.prisma.user.update({ where: { id }, data })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } })
  }
}

// Cached implementation (decorator pattern)
class CachedUserRepository implements UserRepository {
  constructor(
    private repository: UserRepository,
    private cache: Redis
  ) {}

  async findById(id: string): Promise<User | null> {
    const cached = await this.cache.get(`user:${id}`)
    if (cached) return JSON.parse(cached)

    const user = await this.repository.findById(id)
    if (user) {
      await this.cache.setex(`user:${id}`, 300, JSON.stringify(user))
    }
    return user
  }

  async update(id: string, data: UpdateUserData): Promise<User> {
    const user = await this.repository.update(id, data)
    await this.cache.del(`user:${id}`) // Invalidate
    return user
  }
  // ... other methods
}

// Service uses interface, not implementation
class UserService {
  constructor(private users: UserRepository) {}

  async getProfile(id: string) {
    const user = await this.users.findById(id)
    if (!user) throw new NotFoundError('User not found')
    return user
  }
}

// In tests - mock repository
const mockRepo: UserRepository = {
  findById: jest.fn().mockResolvedValue({ id: '1', name: 'Test' }),
  // ...
}
const service = new UserService(mockRepo)
```

**Why It Works:**
Business logic doesn't know about Prisma, Redis, or any implementation. Testing is trivial with mocks. You can swap implementations without changing services.

---

## 2. The Service Layer Pattern

**What It Is:**
Organizing business logic into service classes that orchestrate repositories and handle domain rules.

**When To Use:**
- When business logic is complex
- When operations span multiple entities
- When you need transaction coordination
- When logic is reused across endpoints

**The Pattern:**

```typescript
// Service encapsulates business logic
class OrderService {
  constructor(
    private orders: OrderRepository,
    private products: ProductRepository,
    private payments: PaymentService,
    private notifications: NotificationService
  ) {}

  async createOrder(userId: string, items: OrderItem[]): Promise<Order> {
    // Validate inventory
    for (const item of items) {
      const product = await this.products.findById(item.productId)
      if (!product) {
        throw new ValidationError(`Product ${item.productId} not found`)
      }
      if (product.stock < item.quantity) {
        throw new ValidationError(`Insufficient stock for ${product.name}`)
      }
    }

    // Calculate totals
    const subtotal = await this.calculateSubtotal(items)
    const tax = this.calculateTax(subtotal)
    const total = subtotal + tax

    // Create order
    const order = await this.orders.create({
      userId,
      items,
      subtotal,
      tax,
      total,
      status: 'pending'
    })

    // Reserve inventory
    for (const item of items) {
      await this.products.decrementStock(item.productId, item.quantity)
    }

    // Notify
    await this.notifications.sendOrderConfirmation(order)

    return order
  }

  async processPayment(orderId: string, paymentMethod: PaymentMethod): Promise<Order> {
    const order = await this.orders.findById(orderId)
    if (!order) throw new NotFoundError('Order not found')
    if (order.status !== 'pending') {
      throw new ValidationError('Order cannot be paid')
    }

    try {
      const payment = await this.payments.charge({
        amount: order.total,
        method: paymentMethod
      })

      return await this.orders.update(orderId, {
        status: 'paid',
        paymentId: payment.id
      })
    } catch (error) {
      // Rollback inventory
      for (const item of order.items) {
        await this.products.incrementStock(item.productId, item.quantity)
      }
      throw error
    }
  }

  private async calculateSubtotal(items: OrderItem[]): Promise<number> {
    let total = 0
    for (const item of items) {
      const product = await this.products.findById(item.productId)
      total += product.price * item.quantity
    }
    return total
  }

  private calculateTax(subtotal: number): number {
    return Math.round(subtotal * 0.1) // 10% tax
  }
}

// Controller is thin - just HTTP handling
app.post('/api/orders', async (req, res, next) => {
  try {
    const order = await orderService.createOrder(
      req.userId,
      req.body.items
    )
    res.status(201).json(order)
  } catch (error) {
    next(error)
  }
})
```

**Why It Works:**
Business logic is in one place, testable in isolation. Controllers are thin. Services can be composed. Logic isn't duplicated across endpoints.

---

## 3. The Event-Driven Pattern

**What It Is:**
Decoupling components by having them communicate through events rather than direct calls.

**When To Use:**
- When actions trigger multiple side effects
- When you want loose coupling
- When operations can be async
- When you're building microservices

**The Pattern:**

```typescript
// Event emitter (simple in-process)
import { EventEmitter } from 'events'

const events = new EventEmitter()

// Define events
interface Events {
  'user.created': { user: User }
  'order.placed': { order: Order }
  'payment.completed': { payment: Payment; orderId: string }
}

// Type-safe event emitter
class TypedEventEmitter<T extends Record<string, any>> {
  private emitter = new EventEmitter()

  emit<K extends keyof T>(event: K, data: T[K]): void {
    this.emitter.emit(event as string, data)
  }

  on<K extends keyof T>(event: K, handler: (data: T[K]) => void): void {
    this.emitter.on(event as string, handler)
  }
}

const eventBus = new TypedEventEmitter<Events>()

// Service emits events
class OrderService {
  async createOrder(data: OrderData): Promise<Order> {
    const order = await this.orders.create(data)

    // Emit event instead of calling other services
    eventBus.emit('order.placed', { order })

    return order
  }
}

// Handlers subscribe to events (separate files/modules)
// notifications/handlers.ts
eventBus.on('order.placed', async ({ order }) => {
  await sendOrderConfirmationEmail(order)
})

// analytics/handlers.ts
eventBus.on('order.placed', async ({ order }) => {
  await trackEvent('order_placed', { orderId: order.id })
})

// inventory/handlers.ts
eventBus.on('order.placed', async ({ order }) => {
  await reserveInventory(order.items)
})

// For production: Use a message queue
import { Queue, Worker } from 'bullmq'

const orderQueue = new Queue('order-events')

// Producer
async function createOrder(data: OrderData): Promise<Order> {
  const order = await orders.create(data)
  await orderQueue.add('order.placed', { order })
  return order
}

// Consumer (can be separate service)
const worker = new Worker('order-events', async (job) => {
  switch (job.name) {
    case 'order.placed':
      await handleOrderPlaced(job.data.order)
      break
  }
})
```

**Why It Works:**
Adding new side effects doesn't change existing code. Handlers can fail independently. Easy to scale handlers separately. Natural fit for microservices.

---

## 4. The CQRS Pattern

**What It Is:**
Command Query Responsibility Segregation - separating read and write operations into different models.

**When To Use:**
- When reads and writes have different requirements
- When read models need to be denormalized
- When you need different scaling for reads vs writes
- When complex querying is needed

**The Pattern:**

```typescript
// Commands (writes) - modify state
interface CreateOrderCommand {
  userId: string
  items: OrderItem[]
}

class OrderCommandHandler {
  async handle(command: CreateOrderCommand): Promise<string> {
    // Validate
    // Apply business rules
    // Persist to write store (normalized)
    const order = await this.writeDb.orders.create({
      data: {
        userId: command.userId,
        items: { create: command.items },
        status: 'pending'
      }
    })

    // Emit event for read model update
    await this.eventBus.emit('order.created', { order })

    return order.id
  }
}

// Queries (reads) - return data
interface GetOrdersQuery {
  userId: string
  status?: OrderStatus
  page: number
  limit: number
}

class OrderQueryHandler {
  async handle(query: GetOrdersQuery): Promise<PaginatedResult<OrderView>> {
    // Read from denormalized view optimized for querying
    const orders = await this.readDb.orderViews.findMany({
      where: {
        userId: query.userId,
        status: query.status
      },
      skip: (query.page - 1) * query.limit,
      take: query.limit
    })

    return { data: orders, ... }
  }
}

// Read model (denormalized for fast queries)
interface OrderView {
  id: string
  userId: string
  userName: string // Denormalized from user
  items: {
    productId: string
    productName: string // Denormalized from product
    quantity: number
    price: number
  }[]
  total: number
  status: string
  createdAt: Date
}

// Event handler updates read model
eventBus.on('order.created', async ({ order }) => {
  const user = await users.findById(order.userId)
  const products = await products.findByIds(order.items.map(i => i.productId))

  await readDb.orderViews.create({
    data: {
      id: order.id,
      userId: order.userId,
      userName: user.name,
      items: order.items.map(item => ({
        ...item,
        productName: products.find(p => p.id === item.productId).name
      })),
      total: order.total,
      status: order.status,
      createdAt: order.createdAt
    }
  })
})

// Controller uses both
app.post('/api/orders', async (req, res) => {
  const orderId = await commandHandler.handle({
    userId: req.userId,
    items: req.body.items
  })
  res.status(201).json({ orderId })
})

app.get('/api/orders', async (req, res) => {
  const orders = await queryHandler.handle({
    userId: req.userId,
    page: req.query.page,
    limit: req.query.limit
  })
  res.json(orders)
})
```

**Why It Works:**
Reads and writes can be optimized independently. Complex queries don't slow down writes. Read models can be cached aggressively. Scales reads and writes separately.

---

## 5. The Circuit Breaker Pattern

**What It Is:**
Preventing cascading failures by failing fast when a dependency is down.

**When To Use:**
- When calling external services
- When a failure in one service can cascade
- When you want graceful degradation
- When recovery time matters

**The Pattern:**

```typescript
enum CircuitState {
  CLOSED = 'CLOSED',   // Normal operation
  OPEN = 'OPEN',       // Failing fast
  HALF_OPEN = 'HALF_OPEN' // Testing recovery
}

class CircuitBreaker {
  private state = CircuitState.CLOSED
  private failureCount = 0
  private lastFailureTime: number = 0
  private successCount = 0

  constructor(
    private options: {
      failureThreshold: number    // Failures before opening
      resetTimeout: number        // Time before trying again (ms)
      successThreshold: number    // Successes before closing
    }
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === CircuitState.OPEN) {
      if (Date.now() - this.lastFailureTime > this.options.resetTimeout) {
        this.state = CircuitState.HALF_OPEN
      } else {
        throw new CircuitOpenError('Circuit is open')
      }
    }

    try {
      const result = await fn()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }

  private onSuccess(): void {
    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++
      if (this.successCount >= this.options.successThreshold) {
        this.state = CircuitState.CLOSED
        this.failureCount = 0
        this.successCount = 0
      }
    } else {
      this.failureCount = 0
    }
  }

  private onFailure(): void {
    this.failureCount++
    this.lastFailureTime = Date.now()

    if (this.failureCount >= this.options.failureThreshold) {
      this.state = CircuitState.OPEN
    }
  }
}

// Usage
const paymentCircuit = new CircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 30000, // 30 seconds
  successThreshold: 3
})

class PaymentService {
  async charge(amount: number): Promise<Payment> {
    try {
      return await paymentCircuit.execute(() =>
        this.stripeClient.charges.create({ amount })
      )
    } catch (error) {
      if (error instanceof CircuitOpenError) {
        // Fallback behavior
        return this.queueForLaterProcessing(amount)
      }
      throw error
    }
  }
}

// With libraries (opossum)
import CircuitBreaker from 'opossum'

const breaker = new CircuitBreaker(async () => {
  return fetch('https://api.example.com/data')
}, {
  timeout: 3000,
  errorThresholdPercentage: 50,
  resetTimeout: 30000
})

breaker.fallback(() => cachedData)
breaker.on('open', () => logger.warn('Circuit opened'))
breaker.on('close', () => logger.info('Circuit closed'))

const result = await breaker.fire()
```

**Why It Works:**
Prevents cascading failures. Gives failing services time to recover. Provides fallback behavior. Makes system resilient.

---

## 6. The Saga Pattern

**What It Is:**
Coordinating distributed transactions through a sequence of local transactions with compensating actions.

**When To Use:**
- When transactions span multiple services
- When you can't use distributed transactions
- When operations need to be reversible
- When eventual consistency is acceptable

**The Pattern:**

```typescript
// Saga step definition
interface SagaStep<TData> {
  execute(data: TData): Promise<void>
  compensate(data: TData): Promise<void>
}

// Order saga with compensation
class OrderSaga {
  private steps: SagaStep<OrderData>[] = []
  private executedSteps: SagaStep<OrderData>[] = []

  constructor() {
    // Define steps in order
    this.steps = [
      {
        name: 'reserve-inventory',
        execute: async (data) => {
          await inventoryService.reserve(data.items)
        },
        compensate: async (data) => {
          await inventoryService.release(data.items)
        }
      },
      {
        name: 'process-payment',
        execute: async (data) => {
          data.paymentId = await paymentService.charge(data.total)
        },
        compensate: async (data) => {
          if (data.paymentId) {
            await paymentService.refund(data.paymentId)
          }
        }
      },
      {
        name: 'create-shipment',
        execute: async (data) => {
          data.shipmentId = await shippingService.createShipment(data)
        },
        compensate: async (data) => {
          if (data.shipmentId) {
            await shippingService.cancelShipment(data.shipmentId)
          }
        }
      },
      {
        name: 'send-confirmation',
        execute: async (data) => {
          await notificationService.sendConfirmation(data)
        },
        compensate: async () => {
          // Notifications don't need compensation
        }
      }
    ]
  }

  async execute(data: OrderData): Promise<void> {
    for (const step of this.steps) {
      try {
        await step.execute(data)
        this.executedSteps.push(step)
      } catch (error) {
        // Compensate in reverse order
        await this.rollback(data)
        throw error
      }
    }
  }

  private async rollback(data: OrderData): Promise<void> {
    // Execute compensations in reverse order
    for (const step of this.executedSteps.reverse()) {
      try {
        await step.compensate(data)
      } catch (error) {
        // Log but continue - best effort compensation
        logger.error(`Compensation failed for ${step.name}:`, error)
      }
    }
  }
}

// Usage
const saga = new OrderSaga()
try {
  await saga.execute(orderData)
} catch (error) {
  // Saga automatically rolled back
  throw new OrderFailedError('Order could not be completed')
}

// For production: Use orchestrator with persistence
class SagaOrchestrator {
  async execute(sagaId: string, steps: SagaStep[]): Promise<void> {
    // Persist saga state for recovery
    await this.db.sagas.create({
      id: sagaId,
      status: 'running',
      currentStep: 0
    })

    for (let i = 0; i < steps.length; i++) {
      await this.db.sagas.update({
        where: { id: sagaId },
        data: { currentStep: i }
      })

      try {
        await steps[i].execute()
      } catch (error) {
        await this.db.sagas.update({
          where: { id: sagaId },
          data: { status: 'compensating' }
        })
        await this.compensate(sagaId, steps, i)
        throw error
      }
    }

    await this.db.sagas.update({
      where: { id: sagaId },
      data: { status: 'completed' }
    })
  }
}
```

**Why It Works:**
Maintains consistency across services without distributed transactions. Each step is reversible. Progress is trackable. Recovery is possible after crashes.

---

## 7. The Middleware Pattern

**What It Is:**
Processing requests through a chain of handlers, each adding functionality.

**When To Use:**
- When you need cross-cutting concerns (auth, logging, validation)
- When processing is composable
- When you want to separate concerns
- When the same logic applies to many routes

**The Pattern:**

```typescript
// Express-style middleware
type Middleware = (req: Request, res: Response, next: NextFunction) => void

// Authentication middleware
const authenticate: Middleware = async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET)
    req.userId = payload.sub
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// Validation middleware factory
const validate = (schema: ZodSchema): Middleware => (req, res, next) => {
  try {
    req.body = schema.parse(req.body)
    next()
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ errors: error.errors })
    } else {
      next(error)
    }
  }
}

// Rate limiting middleware
const rateLimit = (options: RateLimitOptions): Middleware => {
  const limiter = new RateLimiter(options)

  return async (req, res, next) => {
    const key = req.ip
    const allowed = await limiter.check(key)

    if (!allowed) {
      return res.status(429).json({ error: 'Too many requests' })
    }

    next()
  }
}

// Logging middleware
const requestLogger: Middleware = (req, res, next) => {
  const start = Date.now()

  res.on('finish', () => {
    logger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: Date.now() - start
    })
  })

  next()
}

// Error handling middleware (last in chain)
const errorHandler: ErrorMiddleware = (error, req, res, next) => {
  logger.error('Request error:', error)

  if (error instanceof ValidationError) {
    return res.status(400).json({ error: error.message })
  }

  if (error instanceof NotFoundError) {
    return res.status(404).json({ error: error.message })
  }

  res.status(500).json({ error: 'Internal server error' })
}

// Compose middleware
app.use(requestLogger)
app.use(rateLimit({ windowMs: 60000, max: 100 }))

app.post('/api/orders',
  authenticate,
  validate(CreateOrderSchema),
  async (req, res, next) => {
    try {
      const order = await orderService.create(req.body)
      res.status(201).json(order)
    } catch (error) {
      next(error)
    }
  }
)

app.use(errorHandler)
```

**Why It Works:**
Cross-cutting concerns are centralized. Routes stay focused on business logic. Middleware is reusable. Order of execution is explicit.

---

## 8. The Outbox Pattern

**What It Is:**
Ensuring reliable event publishing by storing events in the same transaction as the business operation.

**When To Use:**
- When you need exactly-once event delivery
- When database and message queue must stay in sync
- When events are critical
- When network failures could cause inconsistency

**The Pattern:**

```typescript
// Problem: Database and queue can get out of sync
async function createOrder(data: OrderData): Promise<Order> {
  const order = await db.orders.create({ data })
  await messageQueue.publish('order.created', order) // What if this fails?
  return order
}

// Solution: Outbox pattern
// 1. Store event in same transaction as business operation
async function createOrder(data: OrderData): Promise<Order> {
  return await db.$transaction(async (tx) => {
    const order = await tx.orders.create({ data })

    // Store event in outbox (same transaction)
    await tx.outboxEvents.create({
      data: {
        type: 'order.created',
        payload: JSON.stringify(order),
        status: 'pending'
      }
    })

    return order
  })
  // Either both succeed or both fail
}

// 2. Background worker publishes events from outbox
class OutboxProcessor {
  async process(): Promise<void> {
    // Get pending events
    const events = await db.outboxEvents.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' },
      take: 100
    })

    for (const event of events) {
      try {
        // Publish to queue
        await messageQueue.publish(event.type, JSON.parse(event.payload))

        // Mark as published
        await db.outboxEvents.update({
          where: { id: event.id },
          data: { status: 'published' }
        })
      } catch (error) {
        // Will retry on next run
        logger.error(`Failed to publish event ${event.id}:`, error)
      }
    }
  }
}

// Run processor periodically
setInterval(() => {
  outboxProcessor.process().catch(logger.error)
}, 1000)

// Or use database triggers + polling
// CREATE TABLE outbox_events (
//   id SERIAL PRIMARY KEY,
//   type VARCHAR(255) NOT NULL,
//   payload JSONB NOT NULL,
//   status VARCHAR(50) DEFAULT 'pending',
//   created_at TIMESTAMP DEFAULT NOW()
// );

// Or use Change Data Capture (Debezium)
// Capture INSERT to outbox table → publish to Kafka
```

**Why It Works:**
Event and data change are atomic. No lost events. No duplicate events (with idempotent consumers). Works with any message queue.

---

## 9. The API Versioning Pattern

**What It Is:**
Managing breaking changes to your API while maintaining backward compatibility.

**When To Use:**
- When you have external consumers
- When you need to make breaking changes
- When clients can't update immediately
- When you want controlled deprecation

**The Pattern:**

```typescript
// URL versioning (most common)
app.use('/api/v1', v1Router)
app.use('/api/v2', v2Router)

// v1 endpoints
const v1Router = Router()
v1Router.get('/users/:id', async (req, res) => {
  const user = await userService.getUser(req.params.id)
  res.json({
    id: user.id,
    name: user.fullName, // Old format
    email: user.email
  })
})

// v2 endpoints
const v2Router = Router()
v2Router.get('/users/:id', async (req, res) => {
  const user = await userService.getUser(req.params.id)
  res.json({
    id: user.id,
    firstName: user.firstName, // New format
    lastName: user.lastName,
    email: user.email
  })
})

// Header versioning
const versionMiddleware: Middleware = (req, res, next) => {
  const version = req.headers['api-version'] || 'v1'
  req.apiVersion = version
  next()
}

app.get('/users/:id', versionMiddleware, async (req, res) => {
  const user = await userService.getUser(req.params.id)

  if (req.apiVersion === 'v1') {
    return res.json(transformToV1(user))
  }

  res.json(transformToV2(user))
})

// Response transformers
function transformToV1(user: User): V1User {
  return {
    id: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email
  }
}

function transformToV2(user: User): V2User {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email
  }
}

// Deprecation headers
app.use('/api/v1', (req, res, next) => {
  res.set('Deprecation', 'true')
  res.set('Sunset', 'Sat, 1 Jan 2025 00:00:00 GMT')
  res.set('Link', '</api/v2>; rel="successor-version"')
  next()
})

// Track version usage for migration
const versionMetrics = new Counter({
  name: 'api_requests_by_version',
  help: 'API requests by version',
  labelNames: ['version', 'endpoint']
})

app.use((req, res, next) => {
  versionMetrics.inc({
    version: req.apiVersion,
    endpoint: req.path
  })
  next()
})
```

**Why It Works:**
Clients can migrate at their own pace. Breaking changes don't break existing integrations. Clear deprecation path. Usage metrics inform migration timeline.

---

## 10. The Retry with Backoff Pattern

**What It Is:**
Automatically retrying failed operations with increasing delays between attempts.

**When To Use:**
- When calling external services
- When failures are transient
- When immediate retry won't help
- When you want self-healing behavior

**The Pattern:**

```typescript
interface RetryOptions {
  maxAttempts: number
  initialDelay: number
  maxDelay: number
  factor: number // Exponential factor
  retryOn?: (error: Error) => boolean
}

async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions
): Promise<T> {
  let lastError: Error
  let delay = options.initialDelay

  for (let attempt = 1; attempt <= options.maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      // Check if error is retryable
      if (options.retryOn && !options.retryOn(lastError)) {
        throw lastError
      }

      if (attempt === options.maxAttempts) {
        throw lastError
      }

      // Wait with exponential backoff + jitter
      const jitter = Math.random() * 0.3 * delay // 0-30% jitter
      await sleep(delay + jitter)

      // Increase delay for next attempt
      delay = Math.min(delay * options.factor, options.maxDelay)

      logger.warn(`Attempt ${attempt} failed, retrying in ${delay}ms`, {
        error: lastError.message
      })
    }
  }

  throw lastError!
}

// Usage
const result = await withRetry(
  () => externalApiCall(),
  {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    factor: 2,
    retryOn: (error) => {
      // Only retry on transient errors
      if (error instanceof HttpError) {
        return [408, 429, 500, 502, 503, 504].includes(error.status)
      }
      return false
    }
  }
)

// With libraries (p-retry)
import pRetry from 'p-retry'

const result = await pRetry(
  async () => {
    const response = await fetch('https://api.example.com/data')
    if (!response.ok) {
      throw new pRetry.AbortError('Not retryable') // Or throw normally to retry
    }
    return response.json()
  },
  {
    retries: 3,
    onFailedAttempt: (error) => {
      logger.warn(`Attempt ${error.attemptNumber} failed. ${error.retriesLeft} retries left.`)
    }
  }
)

// Retry patterns:
// - Exponential backoff: 1s, 2s, 4s, 8s...
// - Linear backoff: 1s, 2s, 3s, 4s...
// - Constant: 1s, 1s, 1s, 1s...
// - Fibonacci: 1s, 1s, 2s, 3s, 5s...

// Always add jitter to prevent thundering herd
function addJitter(delay: number, factor = 0.3): number {
  return delay + (Math.random() * factor * delay)
}
```

**Why It Works:**
Transient failures are handled automatically. Backoff prevents overwhelming failing services. Jitter prevents synchronized retries. Gives services time to recover.

