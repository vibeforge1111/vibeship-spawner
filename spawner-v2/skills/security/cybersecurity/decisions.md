# Decisions: Cybersecurity

Critical security decisions that determine your application's security posture.

---

## Decision 1: Authentication Method

**Context:** Choosing how users prove their identity.

**Options:**

| Method | Security | UX | Best For |
|--------|----------|-----|----------|
| **Password only** | Low | Simple | Low-risk apps |
| **Password + MFA** | High | Moderate | Standard apps |
| **Passwordless** | High | Good | Modern apps |
| **SSO/OAuth** | High | Great | Enterprise |

**Framework:**
```
Authentication selection:

PASSWORD ONLY:
When: Low-risk, internal tools
Requirements: Strong password policy
Risk: Credential stuffing, phishing

PASSWORD + MFA:
When: Standard applications
Implementation:
- TOTP (recommended)
- Hardware keys (best)
- SMS (fallback only)
Risk: MFA fatigue, recovery bypass

PASSWORDLESS:
When: Modern consumer apps
Methods:
- Magic links (email)
- WebAuthn (biometrics, keys)
- Passkeys (cross-device)
Risk: Email security dependency

SSO/OAUTH:
When: Enterprise, B2B
Providers: Okta, Auth0, Azure AD
Benefits: Centralized identity
Risk: Provider dependency

DECISION FACTORS:
1. Risk level of data/actions
2. User technical sophistication
3. Compliance requirements
4. Integration needs

IMPLEMENTATION PRIORITY:
1. Get auth working
2. Add MFA
3. Consider passwordless
4. Add SSO if needed

PASSWORD REQUIREMENTS:
- 12+ characters minimum
- Breach list checking
- Rate limiting on attempts
- Account lockout policy
```

**Default Recommendation:** Password + TOTP MFA for most apps. Passwordless for consumer. SSO for enterprise.

---

## Decision 2: Session Management Strategy

**Context:** How to manage authenticated sessions.

**Options:**

| Strategy | Statefulness | Scalability | Security |
|----------|--------------|-------------|----------|
| **Server sessions** | Stateful | Lower | Higher |
| **JWT tokens** | Stateless | Higher | Moderate |
| **Hybrid** | Mixed | High | High |
| **OAuth tokens** | External | Variable | High |

**Framework:**
```
Session strategy selection:

SERVER SESSIONS:
Storage: Redis, database
Pros:
- Easy revocation
- Server controls validity
- No token size limits
Cons:
- Requires session store
- Scaling complexity

Implementation:
const session = await sessions.create({
  userId: user.id,
  expiresAt: addHours(now, 24)
})
res.cookie('session', session.id, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax'
})

JWT TOKENS:
Pros:
- Stateless
- Easy to scale
- Self-contained
Cons:
- Hard to revoke
- Token size in requests
- Refresh token complexity

Implementation:
const token = jwt.sign(
  { userId: user.id },
  SECRET,
  { expiresIn: '15m' }
)
// Plus refresh token flow

HYBRID (Recommended):
Short-lived JWT (15min) + long-lived refresh
Access: Stateless, fast
Refresh: Stateful, revocable

Implementation:
Access token: 15 min, JWT
Refresh token: 7 days, server-stored
Revocation: Delete refresh token

EXPIRATION SETTINGS:
Access token: 15-60 minutes
Refresh token: 1-30 days
Inactive timeout: 15-60 minutes
Absolute timeout: 24 hours - 30 days

COOKIE FLAGS:
HttpOnly: true (always)
Secure: true (always in prod)
SameSite: lax or strict
Path: / or specific
```

**Default Recommendation:** Hybrid (short-lived JWT + server-stored refresh tokens) for most apps.

---

## Decision 3: Authorization Model

**Context:** How to control access to resources.

**Options:**

| Model | Granularity | Complexity | Best For |
|-------|-------------|------------|----------|
| **RBAC** | Role-level | Low | Most apps |
| **ABAC** | Attribute-level | High | Complex rules |
| **ReBAC** | Relationship | Medium | Social/collab |
| **ACL** | Resource-level | Medium | File systems |

**Framework:**
```
Authorization model selection:

RBAC (Role-Based):
Define: Roles have permissions
Assign: Users have roles
Check: User's roles have permission?

Example:
roles = {
  admin: ['*'],
  editor: ['read', 'write'],
  viewer: ['read']
}

Best for:
- Clear role hierarchies
- Moderate permission needs
- Most applications

ABAC (Attribute-Based):
Define: Policies with conditions
Check: Evaluate against context

Example:
policy: allow if
  user.department == resource.department
  AND time.hour >= 9 AND time.hour <= 17
  AND user.clearance >= resource.classification

Best for:
- Complex access rules
- Dynamic conditions
- Compliance requirements

ReBAC (Relationship-Based):
Define: Relationships between entities
Check: Traverse relationship graph

Example:
user -> member_of -> team -> owns -> document
Can user read document? Follow the graph.

Best for:
- Collaborative apps
- Social platforms
- Shared resources

IMPLEMENTATION:
// Simple RBAC
function can(user, action, resource) {
  const permissions = getRolePermissions(user.role)
  return permissions.includes(action)
    || permissions.includes('*')
}

// With resource ownership
function can(user, action, resource) {
  if (resource.ownerId === user.id) return true
  return checkRolePermission(user.role, action)
}

AUTHORIZATION CHECKLIST:
□ Every endpoint checked
□ Resource ownership verified
□ Admin bypass explicit
□ Denial logged
□ Tested with different roles
```

**Default Recommendation:** RBAC for most apps. Add ownership checks. Consider ABAC for complex compliance.

---

## Decision 4: Data Encryption Strategy

**Context:** What to encrypt and how.

**Options:**

| Level | Coverage | Performance | Complexity |
|-------|----------|-------------|------------|
| **Transport only** | In transit | Minimal | Low |
| **At rest** | Stored data | Low | Medium |
| **Field-level** | Sensitive fields | Medium | High |
| **End-to-end** | Full path | Higher | Very high |

**Framework:**
```
Encryption levels:

TRANSPORT (TLS):
Always required.
TLS 1.2 minimum, 1.3 preferred.
Covers: Data in transit.

AT REST:
Database encryption (transparent).
File system encryption.
Covers: Stored data.

FIELD-LEVEL:
Specific sensitive fields.
Application manages keys.
Covers: PII, financial data.

END-TO-END:
Client encrypts, server can't read.
For: Messaging, sensitive docs.
Complexity: Key management.

WHAT TO ENCRYPT:

ALWAYS (At minimum):
- Transport: TLS everywhere
- Passwords: bcrypt/argon2 (hash, not encrypt)
- PII: Field-level encryption

RECOMMENDED:
- Database at rest encryption
- Backup encryption
- File storage encryption

CONSIDER:
- End-to-end for messaging
- Client-side encryption for sensitive docs

ALGORITHM SELECTION:
Symmetric: AES-256-GCM
Asymmetric: RSA-2048+, Ed25519
Hashing: SHA-256, SHA-3
Password: bcrypt, argon2id

KEY MANAGEMENT:
Development: Environment variables
Production: KMS (AWS, GCP, Azure, Vault)
Rotation: Annual minimum, automated preferred

ENCRYPTION CHECKLIST:
□ TLS everywhere
□ Strong cipher suites
□ Passwords hashed (not encrypted)
□ PII encrypted at rest
□ Keys in secure storage
□ Rotation plan exists
```

**Default Recommendation:** TLS everywhere, database encryption at rest, field-level for PII, KMS for key management.

---

## Decision 5: Secrets Management Approach

**Context:** How to store and access application secrets.

**Options:**

| Approach | Security | Complexity | Best For |
|----------|----------|------------|----------|
| **Env vars** | Low | Low | Development |
| **Config files** | Low | Low | Legacy |
| **Secret manager** | High | Medium | Production |
| **Vault** | Highest | High | Enterprise |

**Framework:**
```
Secrets management:

ENVIRONMENT VARIABLES:
When: Development, simple deployments
Risks: Can leak in logs, process lists
Better than: Hardcoded secrets

Implementation:
DATABASE_URL=postgres://localhost/dev
# Set by platform, not in code

SECRET MANAGER:
When: Production applications
Options:
- AWS Secrets Manager
- GCP Secret Manager
- Azure Key Vault
- Doppler

Implementation:
const secret = await secretsManager.getSecretValue({
  SecretId: 'prod/database/password'
})

VAULT (HashiCorp):
When: Enterprise, complex requirements
Features:
- Dynamic secrets
- Fine-grained access
- Audit logging
- Automatic rotation

Implementation:
const { data } = await vault.read('secret/data/database')
const password = data.password

SECRETS CATEGORIES:
Database credentials: Secret manager
API keys: Secret manager
Encryption keys: KMS
JWT signing: Secret manager or KMS
OAuth secrets: Secret manager

ROTATION:
Automatic: Preferred
Manual: Scheduled (quarterly)
Emergency: On suspicion of leak

NEVER:
- Hardcode in source
- Commit to git
- Log secret values
- Share in Slack/email
- Store in plain text files

ACCESS CONTROL:
Principle of least privilege.
Service A only accesses its secrets.
Audit who accessed what.
```

**Default Recommendation:** Secret manager for production (AWS/GCP/Azure native). Vault for enterprise with dynamic secrets.

---

## Decision 6: Security Scanning Strategy

**Context:** What security testing to automate.

**Options:**

| Type | Finds | When | Coverage |
|------|-------|------|----------|
| **SAST** | Code issues | Build time | Source code |
| **DAST** | Runtime issues | Deploy time | Running app |
| **SCA** | Dependencies | Build time | Libraries |
| **Container** | Image issues | Build time | Containers |

**Framework:**
```
Security scanning stack:

SAST (Static Analysis):
Tools: Semgrep, CodeQL, SonarQube
Runs: Every PR, before merge
Finds:
- SQL injection patterns
- XSS vulnerabilities
- Hardcoded secrets
- Insecure patterns

Integration:
# GitHub Actions
- uses: returntocorp/semgrep-action@v1
  with:
    config: p/owasp-top-ten

SCA (Software Composition):
Tools: Snyk, Dependabot, npm audit
Runs: Daily, on PR
Finds:
- Vulnerable dependencies
- Outdated packages
- License issues

Integration:
- run: npm audit --audit-level=high
- uses: snyk/actions/node@master

DAST (Dynamic Analysis):
Tools: OWASP ZAP, Burp Suite, Nuclei
Runs: Post-deploy, nightly
Finds:
- Missing headers
- Misconfigurations
- Runtime vulnerabilities

Integration:
- uses: zaproxy/action-full-scan@v0
  with:
    target: 'https://staging.example.com'

CONTAINER SCANNING:
Tools: Trivy, Snyk Container, Clair
Runs: On image build
Finds:
- OS vulnerabilities
- Package vulnerabilities
- Misconfigurations

Integration:
- uses: aquasecurity/trivy-action@master
  with:
    image-ref: 'myapp:${{ github.sha }}'

SECRET SCANNING:
Tools: Gitleaks, TruffleHog
Runs: Pre-commit, on push
Finds: Leaked credentials

SCAN PRIORITY:
1. SCA (dependencies) - daily
2. SAST (code) - every PR
3. Secret scanning - every commit
4. Container scanning - every build
5. DAST - nightly/weekly
```

**Default Recommendation:** SAST + SCA on every PR. Secret scanning pre-commit. DAST on staging. Container scanning on build.

---

## Decision 7: Vulnerability Handling Policy

**Context:** How to respond to discovered vulnerabilities.

**Options:**

| Severity | Response Time | Action |
|----------|---------------|--------|
| **Critical** | < 24 hours | Immediate fix |
| **High** | < 7 days | Prioritize |
| **Medium** | < 30 days | Schedule |
| **Low** | < 90 days | Backlog |

**Framework:**
```
Vulnerability response:

SEVERITY DEFINITIONS:
Critical (CVSS 9.0-10.0):
- Remote code execution
- Authentication bypass
- Data breach risk
Timeline: Fix within 24 hours

High (CVSS 7.0-8.9):
- Privilege escalation
- Sensitive data exposure
- Significant impact
Timeline: Fix within 7 days

Medium (CVSS 4.0-6.9):
- Limited impact
- Requires conditions
- Defense in depth gap
Timeline: Fix within 30 days

Low (CVSS 0.1-3.9):
- Minimal impact
- Hard to exploit
- Information disclosure
Timeline: Fix within 90 days

RESPONSE PROCESS:
1. Triage (< 1 hour)
   - Assess severity
   - Assign owner
   - Notify stakeholders

2. Investigate (< 4 hours for critical)
   - Confirm vulnerability
   - Assess impact
   - Identify affected systems

3. Mitigate (immediate for critical)
   - Temporary fix if possible
   - Reduce exposure
   - Monitor for exploitation

4. Fix (per timeline)
   - Develop patch
   - Test thoroughly
   - Deploy with monitoring

5. Verify (after fix)
   - Confirm remediation
   - Regression testing
   - Update documentation

EXCEPTION PROCESS:
If can't meet timeline:
- Document reason
- Implement mitigations
- Get approval
- Set new deadline

METRICS:
- Mean time to remediate
- Aging vulnerabilities
- Recurrence rate
```

**Default Recommendation:** Critical < 24h, High < 7d, Medium < 30d, Low < 90d. Track and report metrics.

---

## Decision 8: Logging and Monitoring Scope

**Context:** What to log for security purposes.

**Options:**

| Level | Coverage | Storage | Analysis |
|-------|----------|---------|----------|
| **Minimal** | Auth only | Short | Manual |
| **Standard** | Auth + access | Medium | Basic alerts |
| **Comprehensive** | All security | Long | SIEM |
| **Full** | Everything | Very long | Advanced |

**Framework:**
```
Security logging strategy:

ALWAYS LOG:
- Authentication attempts (success/fail)
- Authorization decisions
- Admin actions
- Configuration changes
- Security events

STANDARD LOGGING:
- Resource access
- API calls
- Data exports
- User actions (sensitive)

COMPREHENSIVE:
- All API requests
- Database queries (summarized)
- File access
- Network connections

LOG FORMAT:
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "SECURITY",
  "event": "login_attempt",
  "userId": "user-123",
  "ip": "1.2.3.4",
  "userAgent": "Mozilla/5.0...",
  "success": false,
  "reason": "invalid_password",
  "requestId": "req-abc"
}

RETENTION:
Security logs: 1 year minimum
Auth logs: 1 year
Access logs: 90 days
Debug logs: 30 days

ALERTING:
Critical:
- Multiple failed logins
- Admin privilege changes
- Security control bypass
- Unusual data access

High:
- Configuration changes
- New admin accounts
- Bulk data access

MONITORING STACK:
Collection: Fluentd, Vector
Storage: Elasticsearch, Loki
Analysis: Kibana, Grafana
Alerting: PagerDuty, Opsgenie

COMPLIANCE:
PCI-DSS: 1 year retention
HIPAA: 6 years
SOC 2: 1 year
GDPR: Justify retention
```

**Default Recommendation:** Standard logging with 1-year retention. Alert on auth anomalies and admin actions.

---

## Decision 9: API Rate Limiting Strategy

**Context:** Protecting APIs from abuse.

**Options:**

| Strategy | Granularity | Complexity | Protection |
|----------|-------------|------------|------------|
| **Global** | All requests | Low | Basic |
| **Per-IP** | By IP address | Low | Moderate |
| **Per-user** | By account | Medium | Good |
| **Per-endpoint** | By route | Medium | Targeted |

**Framework:**
```
Rate limiting strategy:

GLOBAL LIMITS:
Purpose: Prevent overall overload
Implementation:
app.use(rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 1000             // 1000 total requests
}))

PER-IP LIMITS:
Purpose: Prevent individual abuse
Implementation:
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 100,              // 100 per IP
  keyGenerator: (req) => req.ip
}))

PER-USER LIMITS:
Purpose: Fair usage enforcement
Implementation:
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  keyGenerator: (req) => req.user?.id || req.ip
}))

PER-ENDPOINT LIMITS:
Purpose: Protect sensitive operations
Implementation:
// Auth endpoints: Strict
app.use('/auth/*', rateLimit({
  windowMs: 60 * 1000,
  max: 5
}))

// API endpoints: Moderate
app.use('/api/*', rateLimit({
  windowMs: 60 * 1000,
  max: 100
}))

RATE LIMIT VALUES:
Login: 5 per minute
Signup: 3 per minute
Password reset: 3 per hour
API (authenticated): 100 per minute
API (unauthenticated): 20 per minute
Uploads: 10 per hour

RESPONSE:
429 Too Many Requests
{
  "error": "Rate limit exceeded",
  "retryAfter": 60
}

Headers:
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1705320000

BYPASS CONSIDERATIONS:
- Internal services
- Monitoring/health checks
- Trusted partners
- Premium tiers
```

**Default Recommendation:** Per-IP baseline, per-user for authenticated, strict per-endpoint for sensitive operations.

---

## Decision 10: Third-Party Integration Security

**Context:** Securely integrating with external services.

**Options:**

| Approach | Trust Level | Isolation | Risk |
|----------|-------------|-----------|------|
| **Direct** | Full trust | None | High |
| **Validated** | Verify responses | Moderate | Medium |
| **Sandboxed** | Isolated | High | Low |
| **Proxied** | Through gateway | Very high | Very low |

**Framework:**
```
Third-party security:

EVALUATION CRITERIA:
Before integrating:
1. Security posture (SOC 2, certifications)
2. Data handling (what do they access?)
3. API security (auth, encryption)
4. Breach history
5. Vendor stability

CREDENTIAL SECURITY:
- Store in secrets manager
- Use least privilege
- Rotate regularly
- Monitor usage

Request security:
const response = await fetch(thirdPartyUrl, {
  headers: {
    'Authorization': `Bearer ${await getSecret('api-key')}`
  },
  timeout: 5000  // Don't hang forever
})

RESPONSE VALIDATION:
// Never trust third-party data
const schema = z.object({
  userId: z.string(),
  status: z.enum(['active', 'inactive'])
})

const validated = schema.safeParse(response.data)
if (!validated.success) {
  logger.error('Invalid third-party response')
  throw new Error('Invalid response')
}

WEBHOOK SECURITY:
// Verify signatures
function verifyWebhook(req) {
  const signature = req.headers['x-webhook-signature']
  const expected = hmac(req.body, webhookSecret)
  return crypto.timingSafeEqual(signature, expected)
}

SANDBOXING:
// Isolate third-party JavaScript
<iframe
  sandbox="allow-scripts"
  src="https://third-party.com/widget"
/>

// CSP for third-party resources
Content-Security-Policy:
  script-src 'self' https://trusted-cdn.com;

MONITORING:
- Track API calls to third parties
- Alert on failures
- Monitor for unusual patterns
- Log sensitive operations

FALLBACK PLANNING:
What if third party is down?
- Graceful degradation
- Cached responses
- Alternative providers
```

**Default Recommendation:** Validate all responses, use secrets manager for credentials, verify webhooks, monitor usage, plan for failures.
