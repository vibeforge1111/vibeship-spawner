# Anti-Patterns: Cybersecurity

Approaches that seem secure but create false confidence and real vulnerabilities.

---

## Anti-Pattern 1: Security Through Obscurity

**What It Looks Like:**
"Attackers won't find it if we hide it well enough."

**Why It Seems Right:**
- Less visible = less attacked
- Custom = harder to exploit
- Obscure = secure

**Why It Fails:**
```
THE PATTERN:
"Let's hide the admin panel at /super-secret-admin-12345"
"We'll use a custom encryption algorithm"
"The database port is non-standard, so it's safe"
"Our API endpoints are undocumented"

THE REALITY:
- Attackers scan everything
- Automated tools find hidden paths
- Custom crypto is almost always broken
- Obscurity is trivially bypassed

WHAT ATTACKERS DO:
// Directory brute force (seconds)
ffuf -w wordlist.txt -u https://target.com/FUZZ

// Port scanning (minutes)
nmap -p- target.com

// Endpoint discovery (from frontend)
grep -r "api/" bundle.js

// Reverse engineering (trivial)
Decompile custom crypto

WHY IT DOESN'T WORK:
1. Source code is accessible
2. Network traffic is observable
3. Automated scanning is cheap
4. Obscurity doesn't scale

THE FIX:
1. Assume everything is known
   Secure as if attackers have source code.

2. Use standard, proven controls
   Standard crypto, not custom.
   Standard auth, not "hidden" endpoints.

3. Defense in depth
   Multiple layers, each secure independently.

4. Obscurity as bonus, not foundation
   OK: Obscure + Secure
   BAD: Obscure instead of Secure

RULE:
"If your security depends on secrecy,
you don't have security."
```

---

## Anti-Pattern 2: The Checkbox Compliance

**What It Looks Like:**
"We're SOC 2 compliant, so we're secure."

**Why It Seems Right:**
- Third-party validation
- Industry standard
- Legal requirement met

**Why It Fails:**
```
THE PATTERN:
Compliance checklist:
☑ Password policy documented
☑ Security training conducted
☑ Access controls defined
☑ Encryption mentioned in policy
☑ Audit log exists

"We passed the audit!"

Reality:
- Password policy is "8 characters"
- Training was one video
- Access controls aren't enforced
- Encryption is MD5
- Audit log is never reviewed

THE REALITY:
Compliance ≠ Security.
Audits are point-in-time.
Policies ≠ enforcement.
Checkbox security is theater.

COMPLIANCE VS SECURITY:
Compliant, Not Secure:
- Documented password policy
- Passwords are "Password123!"

Secure, Not Compliant:
- Strong passwords enforced
- No documentation

Neither:
- No policy, weak passwords

Both (Goal):
- Strong policy + enforcement

THE FIX:
1. Security first, compliance follows
   Build secure systems.
   Compliance is evidence of security.

2. Continuous validation
   Not just annual audits.
   Daily/weekly security checks.

3. Technical enforcement
   Policies enforced by code.
   Not just documented.

4. Real testing
   Penetration tests.
   Not just questionnaires.

COMPLIANCE REALITY:
Passing audit = Minimum bar met at one time
Security = Continuous protection

Use compliance as framework.
Don't mistake the map for territory.
```

---

## Anti-Pattern 3: The One-Time Security Fix

**What It Looks Like:**
"We did a security audit last year and fixed everything."

**Why It Seems Right:**
- Problems were identified
- Fixes were made
- Experts validated

**Why It Fails:**
```
THE PATTERN:
Year 1: Security audit, fix 50 issues
Year 2: No security work
Year 3: No security work
Year 4: Breach

"But we fixed everything!"
You fixed everything as of Year 1.
New code, new vulns, new attacks.

THE REALITY:
Security is not a project.
Security is a process.
New code = new vulnerabilities.
New attacks = new defenses needed.

WHAT CHANGES:
- Codebase evolves (new features)
- Dependencies update (new vulns)
- Attack techniques evolve
- Team changes (knowledge loss)
- Infrastructure changes

THE FIX:
1. Continuous security
   // In CI/CD
   - Daily dependency scanning
   - Per-PR static analysis
   - Weekly dynamic testing
   - Quarterly pentests

2. Security in development
   Security reviews in code review.
   Security requirements in tickets.
   Security tests in test suite.

3. Monitoring and response
   Real-time threat detection.
   Incident response process.
   Regular tabletop exercises.

4. Regular assessments
   Monthly: Automated scanning
   Quarterly: Internal review
   Annual: External pentest

SECURITY CALENDAR:
Daily: Automated scans
Weekly: Review alerts
Monthly: Vulnerability review
Quarterly: Architecture review
Annual: Full assessment

Not: "We'll do security next quarter"
```

---

## Anti-Pattern 4: The Client-Side Security

**What It Looks Like:**
"We validate on the frontend, so the data is clean."

**Why It Seems Right:**
- User sees validation
- Bad data rejected immediately
- Good UX

**Why It Fails:**
```
THE PATTERN:
// Frontend
if (email.match(emailRegex)) {
  submitForm(email)
}

// Backend
app.post('/users', (req, res) => {
  // No validation, frontend handles it
  db.users.create(req.body)
})

// Attacker
curl -X POST https://app.com/users \
  -d '{"email": "not-an-email; DROP TABLE users;--"}'

THE REALITY:
Attackers bypass the frontend.
They call your API directly.
Frontend is for UX, not security.
Never trust client data.

CLIENT-SIDE BYPASSABLE:
- Form validation
- Field restrictions
- Hidden fields
- Rate limiting (client-side)
- Any JavaScript logic

THE FIX:
1. Server-side validation always
   // Frontend (for UX)
   if (!emailRegex.test(email)) {
     showError('Invalid email')
   }

   // Backend (for security)
   const schema = z.object({
     email: z.string().email()
   })
   const result = schema.parse(req.body)

2. Defense in depth
   Validate on frontend (UX)
   Validate on backend (security)
   Validate on database (constraints)

3. Assume malicious input
   Every API call could be crafted.
   Every field could contain attack.

4. Test without frontend
   curl your own APIs.
   Send malformed data.
   Verify backend handles it.

RULE:
Frontend validation = Convenience
Backend validation = Security
You need both.
```

---

## Anti-Pattern 5: The Password Complexity Theater

**What It Looks Like:**
"We require uppercase, lowercase, numbers, and special characters."

**Why It Seems Right:**
- More complex = harder to guess
- Industry standard
- Users must be more creative

**Why It Fails:**
```
THE PATTERN:
Password requirements:
- Minimum 8 characters
- Must include uppercase
- Must include lowercase
- Must include number
- Must include special character

Result:
Password1!
Welcome1!
Summer2024!
Qwerty1!

THE REALITY:
Complex rules create predictable patterns.
Users choose minimum viable complexity.
"Password1!" meets all requirements.
Length > complexity for entropy.

WHAT ATTACKERS KNOW:
// Common patterns
[Capital][lowercase...][number][!]
[Season][Year][!]
[Keyboard pattern][1!]

// Dictionary with mutations
password → P@ssw0rd!
welcome → W3lcome!

THE FIX:
1. Prioritize length
   Minimum 12 characters (better: 16)
   Long passphrase > short complex

2. Check against breach lists
   import { hibp } from 'hibp'

   const breached = await hibp.pwnedPassword(password)
   if (breached) {
     return 'This password has been exposed in a data breach'
   }

3. Drop most complexity rules
   Good: 12+ characters
   Optional: Not in breach list
   Avoid: Uppercase + lowercase + number + symbol

4. Encourage passphrases
   "correct horse battery staple"
   Easy to remember, hard to guess.

5. Allow password managers
   Don't block paste.
   Support long passwords.
   This is a security feature.

MODERN PASSWORD POLICY:
- 12+ characters minimum
- Not in known breach lists
- Allow all characters (including spaces)
- Allow paste
- Recommend password manager
```

---

## Anti-Pattern 6: The Security Team Only

**What It Looks Like:**
"Security is the security team's responsibility."

**Why It Seems Right:**
- Specialists handle specialty
- Developers focus on features
- Clear ownership

**Why It Fails:**
```
THE PATTERN:
Dev team: Builds features
Security team: Reviews before deploy

Process:
1. Dev builds feature (no security thought)
2. Feature goes to security review
3. Security finds 47 vulnerabilities
4. Dev has to rewrite
5. Deadline missed
6. Blame and resentment

THE REALITY:
Security can't review everything.
Security as gatekeeper doesn't scale.
Finding issues late is expensive.
Security is everyone's job.

THE COST OF LATE SECURITY:
Design phase fix: 1x cost
Development fix: 10x cost
Production fix: 100x cost

THE FIX:
1. Security in development
   // Security requirements in stories
   "As a user, I want my password hashed securely"

   // Security acceptance criteria
   - Input validation implemented
   - No SQL injection
   - Auth required on endpoint

2. Security training for devs
   OWASP Top 10 training
   Secure coding guidelines
   Language-specific security

3. Security champions
   Designated dev in each team
   Security-focused training
   First line of security review

4. Automated security
   SAST in CI/CD
   Dependency scanning
   Security linting

5. Shared responsibility
   Dev writes secure code
   Security provides tools/training
   Everyone catches issues

SECURITY TEAM ROLE:
Not: Gatekeepers
But: Enablers

- Provide tools and automation
- Train developers
- Set standards
- Review high-risk changes
- Incident response
```

---

## Anti-Pattern 7: The All-or-Nothing Encryption

**What It Looks Like:**
"We encrypt everything with the same key."

**Why It Seems Right:**
- Encryption is good
- One key is simpler
- Everything protected

**Why It Fails:**
```
THE PATTERN:
// One key rules them all
const MASTER_KEY = process.env.ENCRYPTION_KEY

// Encrypt user passwords
encrypt(password, MASTER_KEY)

// Encrypt user PII
encrypt(address, MASTER_KEY)

// Encrypt session tokens
encrypt(session, MASTER_KEY)

// Key compromise = everything compromised

THE REALITY:
Single key is single point of failure.
Different data needs different protection.
Key rotation becomes impossible.
No separation of concerns.

PROBLEMS:
1. Key leak = all data exposed
2. Can't rotate without re-encrypting everything
3. No access control granularity
4. Over-encryption slows everything

THE FIX:
1. Key hierarchy
   Master Key (HSM)
   └── Data Encryption Keys (per category)
       ├── User PII Key
       ├── Payment Data Key
       └── Session Key

2. Purpose-specific keys
   // Different keys for different data
   const userDataKey = await kms.getKey('user-data')
   const paymentKey = await kms.getKey('payment-data')

3. Key rotation
   // Keys can be rotated independently
   await rotateKey('user-data')
   // Only user data needs re-encryption

4. Don't encrypt everything
   Public data: No encryption
   Sensitive data: Encrypt
   Extremely sensitive: Encrypt + additional controls

5. Use appropriate methods
   Data at rest: AES-256-GCM
   Data in transit: TLS 1.3
   Passwords: bcrypt/argon2 (not reversible)

KEY MANAGEMENT:
- Use KMS (AWS, GCP, Azure)
- Never hardcode keys
- Rotate regularly
- Audit access
- Separate environments
```

---

## Anti-Pattern 8: The Trust Your Dependencies

**What It Looks Like:**
"We use popular libraries, so they must be secure."

**Why It Seems Right:**
- Popular = many eyes
- Maintained = actively fixed
- Widely used = battle-tested

**Why It Fails:**
```
THE PATTERN:
npm install everything
pip install whatever-looks-good
No version pinning
No security scanning

"It's on npm/PyPI, so it's safe."

THE REALITY:
- Popular packages get compromised
- Typosquatting attacks
- Malicious maintainer takeovers
- Vulnerable transitive dependencies
- Abandoned but still used

REAL INCIDENTS:
- event-stream: Bitcoin theft
- ua-parser-js: Cryptominer
- node-ipc: Protestware
- colors: Deliberate breakage
- Log4Shell: Everywhere

THE FIX:
1. Scan dependencies
   # Daily/weekly
   npm audit
   snyk test
   safety check (Python)

2. Pin versions
   // package.json
   "lodash": "4.17.21"   // Exact
   "lodash": "~4.17.21"  // Patch only
   // Not: "lodash": "*"

3. Review before adding
   - How many maintainers?
   - When was last update?
   - How many dependencies does it have?
   - Can you implement yourself?

4. Lock files
   Commit package-lock.json
   Commit requirements.txt (pip freeze)
   Reproducible builds

5. Monitor for advisories
   Dependabot
   Snyk
   npm audit in CI

DEPENDENCY CHECKLIST:
□ Do we really need this?
□ Who maintains it?
□ What's the security history?
□ What does it depend on?
□ Can we update easily?
```

---

## Anti-Pattern 9: The Log Everything Forever

**What It Looks Like:**
"We log all data for security and debugging."

**Why It Seems Right:**
- More data = better investigation
- Never know what you'll need
- Can't log too much

**Why It Fails:**
```
THE PATTERN:
// Log everything
logger.info('User action', {
  userId: user.id,
  email: user.email,
  password: req.body.password,  // OH NO
  ssn: user.ssn,
  creditCard: user.card,
  session: req.session,
  cookies: req.cookies
})

// Store forever
// Never rotate
// Everyone can access

THE REALITY:
- Logs become liability
- Sensitive data in logs = breach
- Retention = exposure window
- Log access is often uncontrolled

WHAT NOT TO LOG:
- Passwords (any form)
- API keys
- Tokens
- PII (unless necessary)
- Credit card numbers
- Health information
- Session contents

THE FIX:
1. Sanitize before logging
   function sanitizeForLogging(data) {
     const { password, ssn, creditCard, ...safe } = data
     return {
       ...safe,
       email: maskEmail(safe.email)
     }
   }

2. Structured logging with care
   logger.info('User login', {
     userId: user.id,
     ip: req.ip,
     success: true
     // No credentials
   })

3. Retention policies
   Security logs: 1 year
   Access logs: 90 days
   Debug logs: 30 days
   Auto-delete after

4. Access control on logs
   Who can read logs?
   Audit log access.
   Protect like production data.

5. Separate sensitive logs
   Audit logs: Secure storage
   Debug logs: Standard storage
   Different access controls

LOG HYGIENE:
□ Never log credentials
□ Mask PII
□ Set retention periods
□ Control access
□ Encrypt at rest
```

---

## Anti-Pattern 10: The Blocking Innovation

**What It Looks Like:**
"Security says no to everything."

**Why It Seems Right:**
- Reducing attack surface
- Being cautious
- Preventing problems

**Why It Fails:**
```
THE PATTERN:
Dev: "Can we use WebSockets?"
Sec: "No, security risk."

Dev: "Can we integrate with OAuth?"
Sec: "No, third-party dependency."

Dev: "Can we accept file uploads?"
Sec: "No, malware risk."

Dev: "Can we do anything?"
Sec: "No."

THE REALITY:
Business needs features.
Security blocking = shadow IT.
Teams work around security.
Result: Less secure, not more.

CONSEQUENCES:
- Developers find workarounds
- Security team bypassed
- No visibility into actual risks
- Adversarial relationship
- Security seen as blocker

THE FIX:
1. Yes, with conditions
   "Yes, with input validation and rate limiting"
   "Yes, if we use the approved OAuth provider"
   "Yes, with file type restrictions and scanning"

2. Enable, don't block
   Provide secure patterns.
   Create reusable components.
   Make secure = easy.

3. Risk-based decisions
   What's the risk?
   What's the mitigation?
   What's the business need?
   Balance, don't block.

4. Be a partner
   Understand business goals.
   Propose solutions.
   Help implement securely.

5. Pick battles
   Block: Critical security issues
   Discuss: Significant risks
   Enable: Everything else

SECURITY TEAM VALUE:
Not: "No"
But: "Here's how to do it securely"

"We don't say no, we say how."
```

---

## Anti-Pattern 11: The Penetration Test Theater

**What It Looks Like:**
"We had a pentest and only found 3 low-severity issues."

**Why It Seems Right:**
- External validation
- Professional assessment
- Low findings = secure

**Why It Fails:**
```
THE PATTERN:
Annual pentest:
- 5 days of testing
- Sanitized scope
- No access to source
- Known IP addresses
- Off-hours only
- Pre-announced

Results:
"3 low-severity findings"
"Great job, team!"

Reality:
- Tester had no time
- Scope excluded sensitive areas
- Real attackers have no limits

THE REALITY:
Pentest quality varies wildly.
Scope limits findings.
Time limits depth.
Good pentests find things.

PENTEST LIMITATIONS:
- Time-boxed (attackers aren't)
- Scoped (attackers aren't)
- Announced (attackers aren't)
- Legal constraints (attackers none)

RED FLAGS:
- "No findings" (unlikely)
- Very short engagement
- No source code access
- Excluded important systems
- Same firm every year

THE FIX:
1. Quality over checkbox
   Choose firm for skill, not price.
   Reference check.
   Review sample reports.

2. Realistic scope
   Include critical systems.
   Test production (carefully).
   Allow social engineering.

3. Adequate time
   Complex app: 2-4 weeks
   Not: 2 days

4. Support the testers
   Provide documentation.
   Source code access.
   Answer questions.

5. Vary approaches
   External pentest
   Internal pentest
   Red team (full scope)
   Bug bounty (continuous)

PENTEST QUALITY SIGNS:
- Found real issues
- Clear reproduction steps
- Business impact explained
- Remediation guidance
- Deep technical detail
```

---

## Anti-Pattern 12: The False Sense of MFA

**What It Looks Like:**
"We have MFA, so accounts are secure."

**Why It Seems Right:**
- Second factor required
- Industry best practice
- Adds protection

**Why It Fails:**
```
THE PATTERN:
MFA enabled:
- SMS codes ✓
- Recovery via email ✓
- Remember device for 30 days ✓
- MFA optional for users ✓

"We have MFA!"

Reality:
- SMS is vulnerable (SIM swap)
- Email MFA is not MFA
- Long remember = no MFA
- Optional = not used

THE REALITY:
Not all MFA is equal.
Weak MFA is security theater.
Implementation matters.
Attackers bypass weak MFA.

MFA STRENGTH:
Strong:
- Hardware keys (YubiKey)
- TOTP (Authenticator apps)

Weak:
- SMS (SIM swap, SS7)
- Email (same account compromise)
- Push notifications (fatigue attacks)
- "Remember me" forever

THE FIX:
1. Strong factors
   // Priority order
   1. Hardware keys (FIDO2)
   2. Authenticator apps (TOTP)
   3. Push notifications (if rate-limited)
   4. SMS (better than nothing)

2. Mandatory for sensitive
   Admin accounts: Always MFA
   Financial access: Always MFA
   PII access: Always MFA

3. Short remember periods
   "Remember device": 7 days max
   Re-verify for sensitive actions

4. Phishing-resistant options
   WebAuthn/FIDO2 keys.
   Can't be phished.

5. MFA everywhere
   Login: MFA
   Password change: MFA
   Email change: MFA
   Admin actions: MFA

MFA CHECKLIST:
□ Strong second factor (not SMS-only)
□ Mandatory for privileged access
□ Reasonable remember periods
□ Phishing-resistant option available
□ Backup codes stored securely
```
