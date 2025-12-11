---
name: security-audit
description: Use when reviewing code for security vulnerabilities - enforces OWASP Top 10 compliance, proper input validation, secrets management, and RLS verification
tags: [security, owasp, validation, rls, secrets, audit]
---

# Security Audit Specialist

## Overview

Security vulnerabilities compound. One SQL injection, one exposed secret, one missing RLS policy can compromise your entire application and user data. Security is not a feature you add later.

**Core principle:** Assume all input is malicious. Verify authorization server-side. Never expose secrets to clients.

## The Iron Law

```
NO USER INPUT PROCESSED WITHOUT VALIDATION AND SANITIZATION
```

Every piece of user input - form fields, URL params, headers, file uploads - must be validated and sanitized before use. Trust nothing from the client.

## When to Use

**Always:**
- Before deploying any feature
- When handling user authentication
- When processing user input
- When accessing database with user-provided data
- When integrating third-party services

**Don't:**
- Internal-only tools with no user input (but still consider it)
- Static sites with no backend
- Read-only public data displays

Thinking "it's just an internal tool"? Stop. Internal tools get exposed. Bake security in from day one.

## The Process

### Step 1: Input Validation Audit

Every endpoint must validate all inputs:

```typescript
import { z } from 'zod';

const inputSchema = z.object({
  email: z.string().email().max(254),
  name: z.string().min(1).max(100).trim(),
  url: z.string().url().refine(u => ['http:', 'https:'].includes(new URL(u).protocol)),
});

// In handler
const validated = inputSchema.safeParse(input);
if (!validated.success) {
  return { error: 'Invalid input' };
}
```

### Step 2: Authorization Check Audit

Every protected resource verified server-side:

```typescript
export default async function ProtectedPage({ params }) {
  const user = await requireAuth();
  const resource = await getResource(params.id);

  if (resource.user_id !== user.id) {
    redirect('/unauthorized');
  }

  return <Resource data={resource} />;
}
```

### Step 3: RLS Policy Audit

Every table must have RLS enabled with appropriate policies.

## Patterns

### OWASP Top 10 Checklist

<Good>
```typescript
// 1. Broken Access Control - Server-side auth
export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  // ...
}

// 2. Cryptographic Failures - Secrets in env
const apiKey = process.env.API_SECRET_KEY; // Never NEXT_PUBLIC_

// 3. Injection - Parameterized queries
await supabase.from('users').select().eq('id', userId); // Safe

// 4. Insecure Design - Defense in depth
// RLS + server auth + input validation

// 5. Security Misconfiguration - Headers set
// next.config.js with security headers

// 6. Vulnerable Components - Regular audits
// npm audit --production

// 7. Auth Failures - Proper session handling
await supabase.auth.getUser(); // Not getSession()

// 8. Data Integrity - Webhook signature verification
stripe.webhooks.constructEvent(body, sig, secret);

// 9. Logging Failures - Sanitized logs
console.log('User action:', { userId, action }); // Not passwords

// 10. SSRF - URL allowlists
const ALLOWED_HOSTS = ['api.example.com'];
if (!ALLOWED_HOSTS.includes(new URL(url).host)) throw new Error('Invalid URL');
```
Systematic security at every layer. No single point of failure.
</Good>

<Bad>
```typescript
// Client-side auth check
if (!user) return <Redirect />; // Bypassable!

// Secret in client code
const key = process.env.NEXT_PUBLIC_SECRET; // Exposed!

// String concatenation in query
db.query(`SELECT * FROM users WHERE id = '${userId}'`); // SQL injection!

// No webhook verification
const event = await request.json(); // Fake events accepted!

// Logging sensitive data
console.log('Login attempt:', { email, password }); // Password in logs!
```
Every line is a security vulnerability waiting to be exploited.
</Bad>

### Input Validation Schema Library

<Good>
```typescript
// lib/validation.ts
import { z } from 'zod';

// Safe string - trimmed, limited length, XSS prevention
export const safeString = (max = 1000) => z.string()
  .trim()
  .max(max)
  .transform(s => s.replace(/[<>]/g, ''));

// Email validation
export const emailSchema = z.string()
  .email()
  .toLowerCase()
  .max(254);

// Strong password
export const passwordSchema = z.string()
  .min(8, 'At least 8 characters')
  .max(128)
  .regex(/[a-z]/, 'Need lowercase')
  .regex(/[A-Z]/, 'Need uppercase')
  .regex(/[0-9]/, 'Need number');

// Safe URL
export const urlSchema = z.string()
  .url()
  .refine(url => {
    const { protocol, host } = new URL(url);
    return ['http:', 'https:'].includes(protocol) && !host.includes('localhost');
  }, 'Must be valid HTTP(S) URL');

// UUID validation
export const uuidSchema = z.string().uuid();

// Usage
const CreateUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: safeString(100),
});
```
Reusable, consistent validation across the entire application.
</Good>

<Bad>
```typescript
// Trust user input directly
const { email, password, name } = await request.json();
await db.users.create({ email, password, name }); // No validation!

// Weak validation
if (email.includes('@')) { /* good enough? */ } // Not good enough!

// No length limits
const bio = formData.get('bio'); // Could be 10GB of text!
```
No validation means attackers control your data.
</Bad>

### RLS Policy Verification

<Good>
```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
-- All should show rowsecurity = true

-- User owns their data
CREATE POLICY "Users own their data"
ON public.todos
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Team-based access
CREATE POLICY "Team members can access"
ON public.projects
FOR SELECT
USING (
  team_id IN (
    SELECT team_id FROM team_members
    WHERE user_id = auth.uid()
  )
);

-- Admin override
CREATE POLICY "Admins can do anything"
ON public.posts
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```
Explicit policies for every operation. No gaps.
</Good>

<Bad>
```sql
-- RLS disabled!
ALTER TABLE todos DISABLE ROW LEVEL SECURITY;

-- Overly permissive
CREATE POLICY "Anyone can do anything"
ON public.todos
FOR ALL
USING (true); -- Everyone sees everything!

-- Missing WITH CHECK
CREATE POLICY "Select only"
ON public.todos
FOR SELECT
USING (auth.uid() = user_id);
-- No INSERT/UPDATE/DELETE policies = blocked or open?
```
Missing or weak RLS policies = data breach waiting to happen.
</Bad>

### Security Headers Configuration

<Good>
```typescript
// next.config.js
const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Content-Security-Policy', value: "default-src 'self'; script-src 'self' 'unsafe-inline'" },
];

module.exports = {
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};
```
Defense in depth. Browser enforces security policies.
</Good>

<Bad>
```typescript
// No security headers at all
module.exports = {};

// Or disabled for "convenience"
// "CSP breaks my inline scripts" -> Fix the scripts, don't disable security
```
Missing headers means browsers can't help protect users.
</Bad>

## Anti-Patterns

| Anti-Pattern | Why It Fails | What To Do Instead |
|--------------|--------------|-------------------|
| Client-side only validation | Bypassed with dev tools | Server validates everything |
| `getSession()` for auth | Can be spoofed | Use `getUser()` always |
| Secrets in NEXT_PUBLIC_ | Exposed to browser | Keep in server-only env |
| String concatenation in SQL | SQL injection | Use parameterized queries |
| Generic error messages internally | Can't debug | Log details server-side, generic to client |

## Red Flags - STOP

If you catch yourself:
- Using string concatenation anywhere near a database query
- Checking auth only on the client side
- Putting secrets in environment variables starting with NEXT_PUBLIC_
- Skipping RLS "because the API handles it"
- Logging user passwords, tokens, or API keys
- Trusting the `origin` or `referer` header

**ALL of these mean: STOP. You have a security vulnerability. Fix it before shipping.**

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "It's behind authentication" | Auth can be bypassed. Add RLS anyway. |
| "No one knows this endpoint" | Attackers scan everything. Secure it. |
| "We'll add security later" | You won't. And you'll ship vulnerabilities. |
| "It's just for internal use" | Internal tools get exposed. Secure them. |
| "The framework handles it" | Frameworks have defaults. Verify they're secure. |
| "We've never had an incident" | You haven't detected one. Different thing. |

## Gotchas

### getSession() vs getUser()

`getSession()` reads from cookies and can be tampered. Always use `getUser()`:

```typescript
// BAD - session can be forged
const { data: { session } } = await supabase.auth.getSession();

// GOOD - server validates the token
const { data: { user } } = await supabase.auth.getUser();
```

### NEXT_PUBLIC_ Means Public

Any env var with NEXT_PUBLIC_ prefix is sent to the browser:

```bash
# Secret - server only
STRIPE_SECRET_KEY=sk_live_xxx

# Public - visible to everyone
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
```

### RLS is Off by Default

New Supabase tables have RLS disabled. First thing after creating a table:

```sql
ALTER TABLE new_table ENABLE ROW LEVEL SECURITY;
-- Then add policies!
```

### Error Messages Leak Information

```typescript
// BAD - reveals internal state
return { error: error.message }; // "relation 'users' does not exist"

// GOOD - generic external, detailed internal
console.error('DB error:', error);
return { error: 'Something went wrong' };
```

## Verification Checklist

Before marking security audit complete:

- [ ] RLS enabled on ALL tables (check with SQL query)
- [ ] All inputs validated with Zod on server
- [ ] `getUser()` used everywhere (not `getSession()`)
- [ ] No secrets in NEXT_PUBLIC_ variables
- [ ] Security headers configured in next.config.js
- [ ] Webhook signatures verified before processing
- [ ] `npm audit` shows no critical/high vulnerabilities
- [ ] Error messages don't leak internal details
- [ ] Rate limiting on authentication endpoints
- [ ] File uploads validate type AND size server-side

Can't check all boxes? You have security gaps. Fix them before deployment.

## Integration

**Pairs well with:**
- `nextjs-supabase-auth` - Auth implementation
- `supabase-backend` - RLS configuration
- `api-design` - Secure endpoint patterns
- `file-upload` - Secure file handling

**Requires:**
- Zod for validation
- Supabase with RLS configured
- Security headers in next.config.js

## References

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [OWASP Cheat Sheets](https://cheatsheetseries.owasp.org/)

---

*This specialist follows the world-class skill pattern.*
