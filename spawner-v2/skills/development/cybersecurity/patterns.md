# Patterns: Cybersecurity

Proven approaches for building secure applications from the ground up.

---

## Pattern 1: Defense in Depth

**Context:** Building multiple layers of security so no single failure is catastrophic.

**The Pattern:**
```
PURPOSE:
Multiple security layers.
Each layer catches what others miss.
Attacker must bypass all layers.

LAYERS:

LAYER 1: NETWORK
- Firewall rules
- DDoS protection
- WAF (Web Application Firewall)
- Rate limiting

LAYER 2: TRANSPORT
- TLS/HTTPS everywhere
- Certificate validation
- HSTS headers
- Certificate transparency

LAYER 3: APPLICATION
- Input validation
- Output encoding
- Authentication
- Authorization

LAYER 4: DATA
- Encryption at rest
- Encryption in transit
- Access controls
- Audit logging

LAYER 5: MONITORING
- Intrusion detection
- Anomaly detection
- Log analysis
- Alerting

EXAMPLE IMPLEMENTATION:
User request flow:
1. CDN/WAF filters known attacks
2. Rate limiter prevents brute force
3. TLS encrypts transport
4. Auth middleware validates token
5. Authorization checks permissions
6. Input validation sanitizes data
7. Output encoding prevents XSS
8. Database uses parameterized queries
9. Data encrypted at rest
10. Action logged for audit

EACH LAYER:
- Has specific controls
- Operates independently
- Logs its decisions
- Fails closed (deny)

PRINCIPLE:
Assume each layer will fail.
Design so that failure is contained.
No single point of failure.
```

---

## Pattern 2: Zero Trust Architecture

**Context:** Never trust, always verify—even for internal systems.

**The Pattern:**
```
PURPOSE:
Trust nothing by default.
Verify every request.
Assume breach.

PRINCIPLES:

NEVER TRUST:
- Internal network = trusted (it's not)
- VPN users = verified (verify anyway)
- Previous authentication = still valid (check again)
- Other services = safe (validate their requests)

ALWAYS VERIFY:
- Identity on every request
- Device health
- Context (location, time, behavior)
- Permissions for specific action

ZERO TRUST COMPONENTS:

IDENTITY:
- Strong authentication (MFA)
- Continuous verification
- Session validation
- Device binding

DEVICE:
- Device health checks
- Endpoint security
- Certificate-based auth
- Compliance verification

ACCESS:
- Just-in-time access
- Least privilege
- Micro-segmentation
- No standing access

IMPLEMENTATION:
// Every request checks everything
async function handleRequest(req, res, next) {
  // 1. Verify identity
  const user = await verifyToken(req.headers.authorization)
  if (!user) return res.status(401).send()

  // 2. Verify device (if applicable)
  const device = await verifyDevice(req.headers['x-device-id'])
  if (!device.trusted) return res.status(403).send()

  // 3. Verify context
  if (isAnomalousRequest(req, user)) {
    await triggerSecurityReview(user, req)
    return res.status(403).send()
  }

  // 4. Verify specific permission
  if (!user.can(req.action, req.resource)) {
    return res.status(403).send()
  }

  next()
}

LOGGING:
Log every access decision.
Log every denied request.
Log every anomaly.
Enable forensics.
```

---

## Pattern 3: Input Validation Framework

**Context:** Validating all input before processing.

**The Pattern:**
```
PURPOSE:
Validate at system boundaries.
Reject malformed input early.
Type-safe throughout.

VALIDATION LAYERS:

LAYER 1: SCHEMA VALIDATION
// Define expected shape
const userSchema = z.object({
  email: z.string().email(),
  age: z.number().min(0).max(150),
  role: z.enum(['user', 'admin'])
})

// Validate on receipt
const result = userSchema.safeParse(req.body)
if (!result.success) {
  return res.status(400).json({
    error: 'Validation failed',
    details: result.error.issues
  })
}

LAYER 2: BUSINESS VALIDATION
// Domain-specific rules
function validateOrderAmount(amount, userTier) {
  const limits = {
    basic: 1000,
    premium: 10000,
    enterprise: Infinity
  }

  if (amount > limits[userTier]) {
    throw new ValidationError('Amount exceeds limit')
  }
}

LAYER 3: SANITIZATION
// Remove dangerous content
const sanitizedHtml = DOMPurify.sanitize(userInput)

// Normalize data
const normalizedEmail = email.toLowerCase().trim()

VALIDATION RULES:

STRINGS:
- Length limits (min, max)
- Pattern matching (regex)
- Character whitelist
- Encoding validation

NUMBERS:
- Range validation
- Type checking
- Precision limits

DATES:
- Format validation
- Range checking
- Timezone handling

FILES:
- Type validation (magic bytes, not extension)
- Size limits
- Malware scanning

VALIDATION PLACEMENT:
// API layer - schema validation
app.post('/users', validate(userSchema), createUser)

// Service layer - business validation
async function createUser(data) {
  await validateBusinessRules(data)
  return db.users.create(data)
}

// Repository layer - type safety
interface UserRepository {
  create(user: ValidatedUser): Promise<User>
}
```

---

## Pattern 4: Secure Session Management

**Context:** Managing user sessions securely throughout their lifecycle.

**The Pattern:**
```
PURPOSE:
Sessions are security tokens.
Treat them as secrets.
Manage lifecycle carefully.

SESSION LIFECYCLE:

CREATION:
// Generate cryptographically random ID
const sessionId = crypto.randomBytes(32).toString('hex')

// Store with metadata
await sessions.create({
  id: sessionId,
  userId: user.id,
  createdAt: new Date(),
  expiresAt: addHours(new Date(), 24),
  ip: req.ip,
  userAgent: req.headers['user-agent']
})

// Set secure cookie
res.cookie('session', sessionId, {
  httpOnly: true,       // No JS access
  secure: true,         // HTTPS only
  sameSite: 'lax',      // CSRF protection
  maxAge: 86400000      // 24 hours
})

VALIDATION:
async function validateSession(sessionId) {
  const session = await sessions.get(sessionId)

  if (!session) return null
  if (session.expiresAt < new Date()) return null
  if (session.revoked) return null

  // Update activity timestamp
  await sessions.touch(sessionId)

  return session
}

ROTATION:
// After authentication
async function rotateSession(oldSessionId, user) {
  // Invalidate old
  await sessions.revoke(oldSessionId)

  // Create new
  const newSessionId = await createSession(user)

  return newSessionId
}

// After privilege change
async function onPrivilegeChange(userId) {
  await sessions.revokeAllForUser(userId)
}

TERMINATION:
async function logout(sessionId) {
  await sessions.revoke(sessionId)  // Server-side
  res.clearCookie('session')         // Client-side
}

async function logoutAllDevices(userId) {
  await sessions.revokeAllForUser(userId)
}

MONITORING:
// Track active sessions
const activeSessions = await sessions.getByUser(userId)

// Alert on anomalies
if (activeSessions.length > 10) {
  await alertSecurityTeam(userId, 'many_sessions')
}

// Log session events
logger.info('session_created', { userId, sessionId, ip })
logger.info('session_revoked', { userId, sessionId, reason })
```

---

## Pattern 5: Role-Based Access Control (RBAC)

**Context:** Managing permissions through role assignments.

**The Pattern:**
```
PURPOSE:
Define roles with permissions.
Assign roles to users.
Check permissions on actions.

RBAC STRUCTURE:

PERMISSIONS:
// Atomic actions
const permissions = [
  'users:read',
  'users:write',
  'users:delete',
  'orders:read',
  'orders:write',
  'admin:access'
]

ROLES:
const roles = {
  viewer: ['users:read', 'orders:read'],
  editor: ['users:read', 'users:write', 'orders:read', 'orders:write'],
  admin: ['users:*', 'orders:*', 'admin:access']
}

USER-ROLE ASSIGNMENT:
// Users have roles
const user = {
  id: 1,
  roles: ['editor']
}

PERMISSION CHECK:
function hasPermission(user, permission) {
  const userPermissions = user.roles
    .flatMap(role => roles[role])

  // Handle wildcards
  return userPermissions.some(p =>
    p === permission ||
    p.endsWith(':*') && permission.startsWith(p.slice(0, -2))
  )
}

// Usage
if (!hasPermission(user, 'orders:delete')) {
  throw new ForbiddenError()
}

MIDDLEWARE:
function requirePermission(...permissions) {
  return (req, res, next) => {
    const hasAll = permissions.every(p =>
      hasPermission(req.user, p)
    )

    if (!hasAll) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    next()
  }
}

// Route usage
app.delete('/orders/:id',
  authenticate,
  requirePermission('orders:delete'),
  deleteOrder
)

HIERARCHY (Optional):
const roleHierarchy = {
  admin: ['manager', 'editor', 'viewer'],
  manager: ['editor', 'viewer'],
  editor: ['viewer'],
  viewer: []
}

// Admin has all permissions of child roles

AUDIT:
// Log permission checks
logger.info('permission_check', {
  userId: user.id,
  permission: 'orders:delete',
  granted: true
})
```

---

## Pattern 6: API Security Standards

**Context:** Securing API endpoints consistently.

**The Pattern:**
```
PURPOSE:
Secure all API endpoints.
Consistent security controls.
Defense against common attacks.

SECURITY HEADERS:
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY')

  // Prevent XSS
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-XSS-Protection', '1; mode=block')

  // CSP
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; script-src 'self'"
  )

  // HSTS
  res.setHeader('Strict-Transport-Security',
    'max-age=31536000; includeSubDomains'
  )

  next()
})

RATE LIMITING:
const rateLimit = require('express-rate-limit')

// Global rate limit
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100                    // 100 requests
}))

// Stricter for auth endpoints
app.use('/auth', rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 5                // 5 attempts
}))

REQUEST VALIDATION:
// Validate content type
app.use((req, res, next) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const contentType = req.get('Content-Type')
    if (!contentType?.includes('application/json')) {
      return res.status(415).json({
        error: 'Unsupported Media Type'
      })
    }
  }
  next()
})

// Validate request size
app.use(express.json({ limit: '10kb' }))

AUTHENTICATION:
app.use('/api/*', async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '')

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    req.user = await verifyToken(token)
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' })
  }
})

RESPONSE SANITIZATION:
// Remove internal fields
function sanitizeUser(user) {
  const { passwordHash, internalId, ...safe } = user
  return safe
}

// Consistent error format
function errorResponse(error) {
  return {
    error: error.message,
    code: error.code
    // Never include stack traces in production
  }
}
```

---

## Pattern 7: Secrets Management

**Context:** Handling sensitive configuration securely.

**The Pattern:**
```
PURPOSE:
Never hardcode secrets.
Rotate regularly.
Audit access.

SECRET TYPES:
- Database credentials
- API keys
- Encryption keys
- JWT signing keys
- OAuth secrets
- Service account keys

STORAGE HIERARCHY:

DEVELOPMENT:
# .env (git-ignored)
DATABASE_URL=postgres://localhost/dev
API_KEY=dev-key

STAGING/PRODUCTION:
// Environment variables (set by platform)
process.env.DATABASE_URL

// Secrets manager (preferred)
const { SecretsManager } = require('@aws-sdk/client-secrets-manager')
const secret = await secretsManager.getSecretValue({
  SecretId: 'production/database'
})

SECRET ACCESS:
// Centralized secret loading
class Secrets {
  private cache = new Map()

  async get(name) {
    if (!this.cache.has(name)) {
      const value = await this.load(name)
      this.cache.set(name, value)
    }
    return this.cache.get(name)
  }

  private async load(name) {
    if (process.env.NODE_ENV === 'development') {
      return process.env[name]
    }
    return await secretsManager.getSecretValue({ SecretId: name })
  }
}

ROTATION:
// Secrets should be rotatable without deploy
async function rotateApiKey() {
  // Generate new key
  const newKey = generateKey()

  // Update in secrets manager
  await secretsManager.updateSecret({ newKey })

  // Invalidate cache
  secrets.invalidate('API_KEY')

  // Old key valid during transition
  // Then revoked
}

AUDIT:
// Log secret access
logger.info('secret_accessed', {
  secretName: 'database-password',
  accessedBy: 'order-service',
  timestamp: new Date()
})

// Alert on anomalies
if (accessCount > threshold) {
  alert('Unusual secret access pattern')
}

NEVER:
- Commit secrets to git
- Log secret values
- Include in error messages
- Send in query parameters
- Store in frontend code
```

---

## Pattern 8: Security Logging and Monitoring

**Context:** Detecting and investigating security incidents.

**The Pattern:**
```
PURPOSE:
Log security events.
Detect anomalies.
Enable investigation.

WHAT TO LOG:

AUTHENTICATION:
- Login attempts (success and failure)
- Password changes
- MFA events
- Session creation/destruction
- Token generation

AUTHORIZATION:
- Permission checks
- Access denied events
- Privilege escalation
- Role changes

DATA ACCESS:
- Sensitive data reads
- Bulk data exports
- Cross-tenant access attempts
- Admin operations

SECURITY EVENTS:
- Input validation failures
- Rate limit hits
- Suspicious patterns
- Security header violations

LOG FORMAT:
const securityLog = {
  timestamp: new Date().toISOString(),
  level: 'SECURITY',
  event: 'login_failed',
  userId: 'unknown',
  ip: '1.2.3.4',
  userAgent: 'Mozilla/5.0...',
  details: {
    reason: 'invalid_password',
    email: 'user@example.com',
    attemptCount: 3
  },
  requestId: 'abc123'
}

DETECTION RULES:
// Brute force detection
if (failedLogins > 5 in 10 minutes) {
  lockAccount(email)
  alert('Potential brute force attack')
}

// Impossible travel
if (login from NYC, then Tokyo in 1 hour) {
  requireMFA(user)
  alert('Impossible travel detected')
}

// Anomalous behavior
if (user downloads 10x normal data) {
  alert('Data exfiltration risk')
}

RETENTION:
- Security logs: 1 year minimum
- Access logs: 90 days
- Audit logs: 7 years (compliance)

ALERTING:
// Critical: Immediate notification
- Successful admin compromise
- Mass data access
- Security control bypass

// High: Same-day response
- Multiple failed logins
- Privilege escalation attempts
- Unusual access patterns

// Medium: Weekly review
- Configuration changes
- New admin accounts
- Policy violations
```

---

## Pattern 9: Secure File Handling

**Context:** Safely handling user-uploaded files.

**The Pattern:**
```
PURPOSE:
Files are attack vectors.
Validate everything.
Store securely.

UPLOAD VALIDATION:
async function validateUpload(file) {
  // 1. Check size
  if (file.size > MAX_SIZE) {
    throw new ValidationError('File too large')
  }

  // 2. Validate type by magic bytes, not extension
  const fileType = await fileTypeFromBuffer(file.buffer)
  if (!ALLOWED_TYPES.includes(fileType?.mime)) {
    throw new ValidationError('Invalid file type')
  }

  // 3. Scan for malware (production)
  const scanResult = await virusScan(file.buffer)
  if (scanResult.infected) {
    throw new SecurityError('Malware detected')
  }

  // 4. Generate safe filename
  const safeFilename = `${uuid()}.${fileType.ext}`

  return { safeFilename, contentType: fileType.mime }
}

STORAGE:
// Store outside web root
const UPLOAD_DIR = '/var/uploads'  // Not /public/uploads

// Or use object storage
await s3.putObject({
  Bucket: 'user-uploads',
  Key: `uploads/${userId}/${safeFilename}`,
  Body: file.buffer,
  ContentType: contentType,
  // Make private by default
  ACL: 'private'
})

SERVING:
// Never serve directly from user input
app.get('/files/:id', async (req, res) => {
  const file = await db.files.findOne({
    id: req.params.id,
    userId: req.user.id  // Authorization
  })

  if (!file) return res.status(404).send()

  // Set safe headers
  res.setHeader('Content-Type', file.contentType)
  res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`)
  res.setHeader('X-Content-Type-Options', 'nosniff')

  // Serve from safe location or signed URL
  const stream = await s3.getObject({ Key: file.key })
  stream.pipe(res)
})

IMAGE PROCESSING:
// Re-encode images to strip metadata/payloads
const sharp = require('sharp')

const processedImage = await sharp(uploadedBuffer)
  .resize(1920, 1080, { fit: 'inside' })
  .jpeg({ quality: 80 })
  .toBuffer()

FILE TYPE WHITELIST:
const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf'
]

// Block executables, scripts, etc.
```

---

## Pattern 10: Security Testing Integration

**Context:** Automated security testing in CI/CD.

**The Pattern:**
```
PURPOSE:
Find vulnerabilities early.
Automate security checks.
Block insecure deploys.

TESTING LAYERS:

STATIC ANALYSIS (SAST):
// Find vulnerabilities in code
// Run on every PR

# .github/workflows/security.yml
- name: Run Semgrep
  uses: returntocorp/semgrep-action@v1
  with:
    config: p/owasp-top-ten

- name: Run ESLint Security
  run: npx eslint --config .eslintrc.security.js

DEPENDENCY SCANNING:
// Find vulnerable dependencies
// Run daily and on PR

- name: Run npm audit
  run: npm audit --audit-level=high

- name: Run Snyk
  uses: snyk/actions/node@master
  with:
    args: --severity-threshold=high

SECRET SCANNING:
// Find leaked secrets
// Block commits with secrets

- name: Run Gitleaks
  uses: gitleaks/gitleaks-action@v2

- name: Run TruffleHog
  run: trufflehog git file://. --since-commit HEAD~1

DYNAMIC ANALYSIS (DAST):
// Test running application
// Run on staging after deploy

- name: Run OWASP ZAP
  uses: zaproxy/action-full-scan@v0
  with:
    target: 'https://staging.example.com'

CONTAINER SCANNING:
// Find vulnerabilities in containers
// Run on image build

- name: Run Trivy
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'myapp:${{ github.sha }}'
    severity: 'CRITICAL,HIGH'

BLOCKING RULES:
# Block deploy if:
on:
  push:
    branches: [main]

jobs:
  security:
    steps:
      - run: npm audit --audit-level=critical
      # Exit 1 = block merge

SECURITY GATES:
Critical vulnerability → Block deploy
High vulnerability → Block to main
Medium vulnerability → Warning
Low vulnerability → Log only

REPORTING:
// Aggregate findings
// Track trends
// Alert on new criticals
```
