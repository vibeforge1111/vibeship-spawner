# Anti-Patterns: Backend Engineering

These approaches look like reasonable backend code but consistently lead to outages, data corruption, and unmaintainable systems.

---

## 1. The God Service

**The Mistake:**
```typescript
class ApplicationService {
  async createUser(data: UserData) { /* ... */ }
  async updateUser(id: string, data: UserData) { /* ... */ }
  async deleteUser(id: string) { /* ... */ }
  async createOrder(data: OrderData) { /* ... */ }
  async processPayment(orderId: string) { /* ... */ }
  async shipOrder(orderId: string) { /* ... */ }
  async sendEmail(to: string, template: string) { /* ... */ }
  async generateReport(type: string) { /* ... */ }
  async uploadFile(file: Buffer) { /* ... */ }
  async processWebhook(data: any) { /* ... */ }
  // ... 50 more methods covering everything
}

// Used everywhere
const app = new ApplicationService()
app.createUser(...)
app.processPayment(...)
app.sendEmail(...)
```

**Why It's Wrong:**
- Impossible to understand at a glance
- Can't test individual behaviors
- Changes to one domain affect everything
- No clear ownership
- Grows forever

**The Fix:**
```typescript
// Separate services by domain
class UserService {
  async create(data: UserData): Promise<User> { /* ... */ }
  async update(id: string, data: UserData): Promise<User> { /* ... */ }
  async delete(id: string): Promise<void> { /* ... */ }
}

class OrderService {
  async create(data: OrderData): Promise<Order> { /* ... */ }
  async process(id: string): Promise<Order> { /* ... */ }
  async ship(id: string): Promise<Order> { /* ... */ }
}

class PaymentService {
  async charge(amount: number): Promise<Payment> { /* ... */ }
  async refund(paymentId: string): Promise<Refund> { /* ... */ }
}

// Each service has single responsibility
// Each can be tested independently
// Each can evolve independently
```

---

## 2. The Leaky Abstraction

**The Mistake:**
```typescript
// Repository that exposes database internals
class UserRepository {
  async find(query: any): Promise<User[]> {
    // Caller needs to know MongoDB query syntax
    return this.collection.find(query).toArray()
  }

  async update(filter: any, update: any): Promise<void> {
    // Caller needs to know $set, $inc, etc.
    await this.collection.updateOne(filter, update)
  }
}

// Usage - database knowledge leaked everywhere
await userRepo.find({ 'profile.age': { $gte: 18 } })
await userRepo.update(
  { _id: userId },
  { $set: { name: newName }, $inc: { loginCount: 1 } }
)
```

**Why It's Wrong:**
- Can't change database without changing all callers
- Business logic mixed with query syntax
- Impossible to add caching transparently
- Testing requires database knowledge

**The Fix:**
```typescript
// Repository with business-oriented interface
class UserRepository {
  async findByAge(minAge: number): Promise<User[]> {
    return this.collection.find({ 'profile.age': { $gte: minAge } }).toArray()
  }

  async updateName(userId: string, name: string): Promise<void> {
    await this.collection.updateOne(
      { _id: userId },
      { $set: { name } }
    )
  }

  async recordLogin(userId: string): Promise<void> {
    await this.collection.updateOne(
      { _id: userId },
      { $inc: { loginCount: 1 }, $set: { lastLogin: new Date() } }
    )
  }
}

// Usage - no database knowledge needed
await userRepo.findByAge(18)
await userRepo.updateName(userId, newName)
await userRepo.recordLogin(userId)

// Can now change to Postgres without changing callers
```

---

## 3. The Scattered Validation

**The Mistake:**
```typescript
// Validation scattered across the codebase
async function createOrder(req, res) {
  // Validation in controller
  if (!req.body.items || req.body.items.length === 0) {
    return res.status(400).json({ error: 'Items required' })
  }

  for (const item of req.body.items) {
    // More validation
    if (!item.productId || !item.quantity) {
      return res.status(400).json({ error: 'Invalid item' })
    }
    if (item.quantity < 1) {
      return res.status(400).json({ error: 'Quantity must be positive' })
    }
  }

  // Different validation in service
  const service = new OrderService()
  // Service does its own validation...
}

// Model has its own validation
class Order {
  setItems(items: OrderItem[]) {
    // Yet another validation
    if (items.length > 100) {
      throw new Error('Too many items')
    }
  }
}
```

**Why It's Wrong:**
- Validation logic duplicated
- Easy to miss validation in some paths
- Inconsistent error messages
- Hard to know all the rules
- Testing requires checking multiple layers

**The Fix:**
```typescript
// Single source of truth for validation
import { z } from 'zod'

const OrderItemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(100)
})

const CreateOrderSchema = z.object({
  items: z.array(OrderItemSchema).min(1).max(100)
})

// Validation middleware
const validate = (schema: ZodSchema) => (req, res, next) => {
  try {
    req.body = schema.parse(req.body)
    next()
  } catch (error) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.errors
      })
    }
    next(error)
  }
}

// Controller just uses validated data
app.post('/orders', validate(CreateOrderSchema), async (req, res) => {
  // req.body is validated and typed
  const order = await orderService.create(req.body)
  res.json(order)
})

// Service trusts input is validated
class OrderService {
  async create(data: z.infer<typeof CreateOrderSchema>) {
    // Data is already validated
    return this.orders.create(data)
  }
}
```

---

## 4. The HTTP-in-Service

**The Mistake:**
```typescript
// Service knows about HTTP
class UserService {
  async createUser(req: Request, res: Response) {
    try {
      const user = await this.db.users.create({ data: req.body })
      res.status(201).json(user)
    } catch (error) {
      if (error.code === 'P2002') {
        res.status(409).json({ error: 'Email already exists' })
      } else {
        res.status(500).json({ error: 'Server error' })
      }
    }
  }

  async getUser(req: Request, res: Response) {
    const user = await this.db.users.findUnique({
      where: { id: req.params.id }
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json(user)
  }
}
```

**Why It's Wrong:**
- Can't use service from CLI, tests, or other services
- HTTP status codes mixed with business logic
- Service is coupled to Express
- Testing requires mocking Request/Response
- Can't reuse logic

**The Fix:**
```typescript
// Domain errors (no HTTP knowledge)
class EmailExistsError extends Error {
  constructor(email: string) {
    super(`Email ${email} already exists`)
  }
}

class UserNotFoundError extends Error {
  constructor(id: string) {
    super(`User ${id} not found`)
  }
}

// Service is pure business logic
class UserService {
  async createUser(data: CreateUserData): Promise<User> {
    try {
      return await this.db.users.create({ data })
    } catch (error) {
      if (error.code === 'P2002') {
        throw new EmailExistsError(data.email)
      }
      throw error
    }
  }

  async getUser(id: string): Promise<User> {
    const user = await this.db.users.findUnique({ where: { id } })
    if (!user) {
      throw new UserNotFoundError(id)
    }
    return user
  }
}

// Controller handles HTTP translation
app.post('/users', async (req, res, next) => {
  try {
    const user = await userService.createUser(req.body)
    res.status(201).json(user)
  } catch (error) {
    next(error) // To error middleware
  }
})

// Error middleware translates to HTTP
app.use((error, req, res, next) => {
  if (error instanceof EmailExistsError) {
    return res.status(409).json({ error: error.message })
  }
  if (error instanceof UserNotFoundError) {
    return res.status(404).json({ error: error.message })
  }
  res.status(500).json({ error: 'Server error' })
})
```

---

## 5. The Synchronous Everything

**The Mistake:**
```typescript
// Everything happens in the request
app.post('/api/orders', async (req, res) => {
  // Create order
  const order = await orderService.create(req.body)

  // Process payment (external API, slow)
  const payment = await paymentService.charge(order.total)

  // Send confirmation email (external API, slow)
  await emailService.sendConfirmation(order)

  // Update inventory (database operations)
  await inventoryService.reserve(order.items)

  // Create shipping label (external API, slow)
  const label = await shippingService.createLabel(order)

  // Update analytics (external API)
  await analyticsService.trackOrder(order)

  // Generate invoice PDF (CPU intensive)
  const invoice = await pdfService.generateInvoice(order)

  res.json({ order, label, invoice })
  // Total time: 15+ seconds, user staring at spinner
})
```

**Why It's Wrong:**
- Request takes forever
- Any failure fails the whole request
- User has to wait for non-critical operations
- Can't retry individual steps
- Timeout issues

**The Fix:**
```typescript
// Only critical operations in request
app.post('/api/orders', async (req, res) => {
  // Create order with pending status
  const order = await orderService.create({
    ...req.body,
    status: 'pending'
  })

  // Queue background jobs
  await queue.add('order:process', { orderId: order.id })

  // Return immediately
  res.status(202).json({
    order,
    message: 'Order received, processing'
  })
})

// Background worker handles the rest
const worker = new Worker('order:process', async (job) => {
  const { orderId } = job.data

  // Steps can be individual jobs
  await queue.add('payment:charge', { orderId })
  await queue.add('email:confirmation', { orderId })
  await queue.add('inventory:reserve', { orderId })
  await queue.add('shipping:label', { orderId })
  await queue.add('analytics:track', { orderId })
  await queue.add('pdf:invoice', { orderId })
})

// Each job is independent, retryable
const paymentWorker = new Worker('payment:charge', async (job) => {
  const { orderId } = job.data
  const order = await orderService.get(orderId)
  const payment = await paymentService.charge(order.total)
  await orderService.update(orderId, { paymentId: payment.id })
}, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 }
})
```

---

## 6. The String SQL

**The Mistake:**
```typescript
// String concatenation SQL
async function findUsers(filters: UserFilters) {
  let sql = 'SELECT * FROM users WHERE 1=1'

  if (filters.name) {
    sql += ` AND name LIKE '%${filters.name}%'`
  }
  if (filters.email) {
    sql += ` AND email = '${filters.email}'`
  }
  if (filters.role) {
    sql += ` AND role = '${filters.role}'`
  }
  if (filters.sortBy) {
    sql += ` ORDER BY ${filters.sortBy}`
  }
  if (filters.limit) {
    sql += ` LIMIT ${filters.limit}`
  }

  return db.query(sql)
}

// Attacker: filters.email = "'; DROP TABLE users; --"
// Result: All users deleted
```

**Why It's Wrong:**
- SQL injection vulnerability
- Can lead to data breach or deletion
- Hard to maintain and debug
- Type information lost

**The Fix:**
```typescript
// Parameterized queries
async function findUsers(filters: UserFilters) {
  const conditions: string[] = []
  const params: any[] = []
  let paramCount = 0

  if (filters.name) {
    paramCount++
    conditions.push(`name ILIKE $${paramCount}`)
    params.push(`%${filters.name}%`)
  }
  if (filters.email) {
    paramCount++
    conditions.push(`email = $${paramCount}`)
    params.push(filters.email)
  }
  if (filters.role) {
    paramCount++
    conditions.push(`role = $${paramCount}`)
    params.push(filters.role)
  }

  // Whitelist for ORDER BY (not parameterizable)
  const allowedSorts = ['name', 'email', 'created_at']
  const sortBy = allowedSorts.includes(filters.sortBy)
    ? filters.sortBy
    : 'created_at'

  const where = conditions.length > 0
    ? `WHERE ${conditions.join(' AND ')}`
    : ''

  const sql = `
    SELECT * FROM users
    ${where}
    ORDER BY ${sortBy}
    LIMIT $${paramCount + 1}
  `

  return db.query(sql, [...params, filters.limit || 100])
}

// Better: Use query builder or ORM
async function findUsers(filters: UserFilters) {
  return prisma.user.findMany({
    where: {
      name: filters.name ? { contains: filters.name } : undefined,
      email: filters.email,
      role: filters.role
    },
    orderBy: { [filters.sortBy || 'createdAt']: 'asc' },
    take: filters.limit || 100
  })
}
```

---

## 7. The Missing Transaction

**The Mistake:**
```typescript
// Multiple related operations without transaction
async function transferMoney(fromId: string, toId: string, amount: number) {
  // What if the second update fails?
  await db.accounts.update({
    where: { id: fromId },
    data: { balance: { decrement: amount } }
  })

  // Crash here = money disappeared!

  await db.accounts.update({
    where: { id: toId },
    data: { balance: { increment: amount } }
  })
}

// Creating related records
async function createOrderWithItems(orderData: OrderData, items: ItemData[]) {
  const order = await db.orders.create({ data: orderData })

  // If this fails, orphaned order exists
  for (const item of items) {
    await db.orderItems.create({
      data: { ...item, orderId: order.id }
    })
  }

  return order
}
```

**Why It's Wrong:**
- Partial failures leave inconsistent state
- Data integrity violations
- Money can disappear
- Orphaned records
- Race conditions

**The Fix:**
```typescript
// Use transactions for related operations
async function transferMoney(fromId: string, toId: string, amount: number) {
  await prisma.$transaction(async (tx) => {
    // Check balance
    const from = await tx.accounts.findUnique({ where: { id: fromId } })
    if (from.balance < amount) {
      throw new InsufficientBalanceError()
    }

    await tx.accounts.update({
      where: { id: fromId },
      data: { balance: { decrement: amount } }
    })

    await tx.accounts.update({
      where: { id: toId },
      data: { balance: { increment: amount } }
    })
  })
  // Either both succeed or both fail
}

// Create related records atomically
async function createOrderWithItems(orderData: OrderData, items: ItemData[]) {
  return prisma.order.create({
    data: {
      ...orderData,
      items: {
        create: items // Nested create in same transaction
      }
    },
    include: { items: true }
  })
}

// Or explicit transaction
async function createOrderWithItems(orderData: OrderData, items: ItemData[]) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.orders.create({ data: orderData })

    await tx.orderItems.createMany({
      data: items.map(item => ({ ...item, orderId: order.id }))
    })

    return order
  })
}
```

---

## 8. The Massive Migration

**The Mistake:**
```sql
-- One migration that modifies millions of rows
ALTER TABLE users ADD COLUMN preferences JSONB;

UPDATE users
SET preferences = json_build_object(
  'theme', 'light',
  'notifications', true,
  'language', 'en'
);

ALTER TABLE users ALTER COLUMN preferences SET NOT NULL;

-- Locks table for 30 minutes, site is down
```

**Why It's Wrong:**
- Long-running table lock
- Downtime for users
- Can't be easily rolled back
- Overwhelms database resources
- Blocks all writes to table

**The Fix:**
```sql
-- Migration 1: Add nullable column (instant)
ALTER TABLE users ADD COLUMN preferences JSONB;

-- Migration 2: Backfill in batches (background job)
-- Run during low traffic, can pause/resume
DO $$
DECLARE
  batch_size INT := 10000;
  last_id INT := 0;
  rows_updated INT;
BEGIN
  LOOP
    UPDATE users
    SET preferences = json_build_object(
      'theme', 'light',
      'notifications', true,
      'language', 'en'
    )
    WHERE id > last_id
      AND id <= last_id + batch_size
      AND preferences IS NULL;

    GET DIAGNOSTICS rows_updated = ROW_COUNT;
    EXIT WHEN rows_updated = 0;

    last_id := last_id + batch_size;

    -- Brief pause to let other operations through
    PERFORM pg_sleep(0.1);
  END LOOP;
END $$;

-- Migration 3: Add NOT NULL (after backfill complete)
ALTER TABLE users ALTER COLUMN preferences SET NOT NULL;

-- Or use application default during transition
class User {
  get preferences() {
    return this._preferences ?? DEFAULT_PREFERENCES
  }
}
```

---

## 9. The Chatty Service

**The Mistake:**
```typescript
// Many small requests to get related data
async function getOrderDetails(orderId: string) {
  const order = await db.orders.findUnique({ where: { id: orderId } })

  // N+1 on items
  const items = []
  for (const itemId of order.itemIds) {
    const item = await db.items.findUnique({ where: { id: itemId } })
    items.push(item)
  }

  // Separate call for user
  const user = await db.users.findUnique({ where: { id: order.userId } })

  // Separate call for shipping
  const shipping = await db.shipping.findUnique({
    where: { orderId: order.id }
  })

  // Separate call for payment
  const payment = await db.payments.findUnique({
    where: { orderId: order.id }
  })

  return { order, items, user, shipping, payment }
}
// 5+ database round trips minimum
```

**Why It's Wrong:**
- Many round trips to database
- High latency
- More network overhead
- Database connection pool exhaustion
- Scales poorly

**The Fix:**
```typescript
// Single query with includes
async function getOrderDetails(orderId: string) {
  return db.orders.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      user: true,
      shipping: true,
      payment: true
    }
  })
}
// 1 round trip (or 2 with some ORMs)

// For complex cases, use DataLoader
import DataLoader from 'dataloader'

const userLoader = new DataLoader(async (userIds: string[]) => {
  const users = await db.users.findMany({
    where: { id: { in: userIds } }
  })
  // Return in same order as input
  return userIds.map(id => users.find(u => u.id === id))
})

// Usage - batches and caches automatically
const user1 = await userLoader.load('user-1')
const user2 = await userLoader.load('user-2')
// Only one query: SELECT * FROM users WHERE id IN ('user-1', 'user-2')

// For cross-service: GraphQL federation or API composition
async function getOrderDetails(orderId: string) {
  const [order, shipping, payment] = await Promise.all([
    orderService.get(orderId),
    shippingService.getByOrderId(orderId),
    paymentService.getByOrderId(orderId)
  ])
  // Parallel calls instead of sequential
  return { order, shipping, payment }
}
```

---

## 10. The Implicit Coupling

**The Mistake:**
```typescript
// Services coupled through shared database
class OrderService {
  async createOrder(data: OrderData) {
    // Directly updates inventory table
    await db.inventory.update({
      where: { productId: data.productId },
      data: { quantity: { decrement: data.quantity } }
    })

    return db.orders.create({ data })
  }
}

class InventoryService {
  async checkStock(productId: string) {
    // Doesn't know orders modifies this
    return db.inventory.findUnique({ where: { productId } })
  }

  async restockProduct(productId: string, quantity: number) {
    // Order service also touches this table
    await db.inventory.update({
      where: { productId },
      data: { quantity: { increment: quantity } }
    })
  }
}
```

**Why It's Wrong:**
- Hidden dependencies
- Inventory logic in two places
- Can't change inventory table without checking all services
- Race conditions possible
- Testing requires full database

**The Fix:**
```typescript
// Explicit dependencies through interfaces
class OrderService {
  constructor(
    private orders: OrderRepository,
    private inventory: InventoryService // Explicit dependency
  ) {}

  async createOrder(data: OrderData) {
    // Use inventory service, don't touch its table
    const available = await this.inventory.checkAndReserve(
      data.productId,
      data.quantity
    )

    if (!available) {
      throw new InsufficientStockError()
    }

    return this.orders.create(data)
  }
}

class InventoryService {
  constructor(private inventory: InventoryRepository) {}

  async checkStock(productId: string): Promise<number> {
    const item = await this.inventory.findById(productId)
    return item?.quantity ?? 0
  }

  async checkAndReserve(productId: string, quantity: number): Promise<boolean> {
    // Single owner of inventory logic
    const result = await this.inventory.decrementIfSufficient(
      productId,
      quantity
    )
    return result.success
  }

  async restockProduct(productId: string, quantity: number): Promise<void> {
    await this.inventory.increment(productId, quantity)
  }
}
```

---

## 11. The Logging Afterthought

**The Mistake:**
```typescript
// Minimal or missing logging
async function processPayment(orderId: string) {
  try {
    const order = await db.orders.findUnique({ where: { id: orderId } })
    const payment = await stripe.charges.create({ amount: order.total })
    await db.orders.update({
      where: { id: orderId },
      data: { paymentId: payment.id, status: 'paid' }
    })
    return payment
  } catch (error) {
    console.log('Payment failed') // Useless
    throw error
  }
}

// Or worse, logging sensitive data
console.log('Processing payment for user:', user)
// Logs entire user object including password hash
```

**Why It's Wrong:**
- Can't debug production issues
- No context when things fail
- Sensitive data in logs
- Can't trace request flow
- No performance metrics

**The Fix:**
```typescript
import { logger } from './logger' // Structured logger

async function processPayment(orderId: string) {
  const logContext = { orderId, operation: 'processPayment' }

  logger.info('Starting payment processing', logContext)

  try {
    const order = await db.orders.findUnique({ where: { id: orderId } })

    if (!order) {
      logger.warn('Order not found', logContext)
      throw new OrderNotFoundError(orderId)
    }

    logger.info('Charging payment', {
      ...logContext,
      amount: order.total,
      currency: 'usd'
    })

    const payment = await stripe.charges.create({ amount: order.total })

    logger.info('Payment successful', {
      ...logContext,
      paymentId: payment.id
    })

    await db.orders.update({
      where: { id: orderId },
      data: { paymentId: payment.id, status: 'paid' }
    })

    return payment
  } catch (error) {
    logger.error('Payment processing failed', {
      ...logContext,
      error: error.message,
      stack: error.stack,
      // Never log full error if it might contain sensitive data
    })
    throw error
  }
}

// Structured logging with correlation
const requestLogger = (req, res, next) => {
  const requestId = crypto.randomUUID()
  req.logger = logger.child({ requestId })

  req.logger.info('Request started', {
    method: req.method,
    path: req.path,
    // Don't log body (might contain sensitive data)
  })

  next()
}
```

---

## 12. The Premature Microservices

**The Mistake:**
```
# "Let's start with microservices for scalability"

services/
├── user-service/
├── order-service/
├── payment-service/
├── notification-service/
├── inventory-service/
├── shipping-service/
├── analytics-service/
├── auth-service/
└── api-gateway/

# For a team of 3 people, with 100 users
```

**Why It's Wrong:**
- Operational overhead before you need it
- Network latency between every call
- Distributed debugging nightmare
- Team is too small to own all services
- Premature boundaries often wrong

**The Fix:**
```
# Start monolithic, extract when needed

src/
├── modules/
│   ├── users/
│   │   ├── user.service.ts
│   │   ├── user.controller.ts
│   │   └── user.repository.ts
│   ├── orders/
│   ├── payments/
│   └── notifications/
├── shared/
│   ├── database/
│   ├── auth/
│   └── utils/
└── app.ts

# Extract to microservice when:
# - Module has different scaling needs
# - Module has different team ownership
# - Module has different deployment frequency
# - Module is genuinely independent
# - You have operational maturity (CI/CD, monitoring, logging)

# Usually: When you have 50+ engineers, not before
```

