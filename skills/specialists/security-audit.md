# Security Audit Specialist

## Identity

- **Tags**: `security`, `owasp`, `validation`, `rls`, `secrets`, `audit`
- **Domain**: OWASP top 10, input validation, authentication, authorization, secrets management
- **Use when**: Security reviews, before deployment, handling sensitive data, auth implementation

---

## Patterns

### OWASP Top 10 Checklist

```
1. Broken Access Control
   ☐ RLS enabled on all tables
   ☐ Authorization checked server-side
   ☐ No direct object reference vulnerabilities
   ☐ Rate limiting on sensitive endpoints

2. Cryptographic Failures
   ☐ HTTPS everywhere
   ☐ Sensitive data encrypted at rest
   ☐ No secrets in code/logs
   ☐ Strong password hashing (bcrypt/argon2)

3. Injection
   ☐ Parameterized queries (Supabase handles this)
   ☐ Input validation on all user data
   ☐ Output encoding

4. Insecure Design
   ☐ Threat modeling done
   ☐ Defense in depth
   ☐ Fail securely

5. Security Misconfiguration
   ☐ Security headers set
   ☐ No default credentials
   ☐ Error messages don't leak info
   ☐ Unnecessary features disabled

6. Vulnerable Components
   ☐ Dependencies up to date
   ☐ No known vulnerabilities (npm audit)
   ☐ Minimal dependencies

7. Authentication Failures
   ☐ Strong password requirements
   ☐ Account lockout after failures
   ☐ Session management secure
   ☐ MFA available

8. Software/Data Integrity
   ☐ Webhook signatures verified
   ☐ Dependencies from trusted sources
   ☐ CI/CD pipeline secured

9. Logging/Monitoring Failures
   ☐ Security events logged
   ☐ Logs don't contain sensitive data
   ☐ Alerting configured

10. Server-Side Request Forgery
    ☐ URL validation on user-supplied URLs
    ☐ Allowlist for external requests
```

### Input Validation

```typescript
// Always validate on SERVER, display errors on client

// lib/validation.ts
import { z } from 'zod';

// Sanitize strings
export const safeString = z.string()
  .trim()
  .max(10000) // Reasonable limit
  .transform((str) => str.replace(/[<>]/g, '')); // Basic XSS prevention

// Email validation
export const emailSchema = z.string()
  .email()
  .toLowerCase()
  .max(254);

// Password requirements
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128)
  .regex(/[a-z]/, 'Must contain lowercase letter')
  .regex(/[A-Z]/, 'Must contain uppercase letter')
  .regex(/[0-9]/, 'Must contain number');

// URL validation
export const urlSchema = z.string()
  .url()
  .refine((url) => {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  }, 'Must be HTTP or HTTPS');

// File validation
export const fileSchema = z.object({
  name: z.string().max(255),
  type: z.enum(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']),
  size: z.number().max(5 * 1024 * 1024), // 5MB
});
```

### Authorization Patterns

```typescript
// lib/auth.ts
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// Get authenticated user
export async function getUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

// Require authentication
export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }
  return user;
}

// Require specific role
export async function requireRole(role: 'admin' | 'member') {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== role && profile?.role !== 'admin') {
    redirect('/unauthorized');
  }

  return user;
}

// Check resource ownership
export async function requireOwnership(resourceTable: string, resourceId: string) {
  const user = await requireAuth();
  const supabase = await createClient();

  const { data: resource } = await supabase
    .from(resourceTable)
    .select('user_id')
    .eq('id', resourceId)
    .single();

  if (!resource || resource.user_id !== user.id) {
    redirect('/unauthorized');
  }

  return user;
}
```

### RLS Policy Patterns

```sql
-- Authenticated users only
CREATE POLICY "Authenticated users can read"
ON public.posts FOR SELECT
TO authenticated
USING (true);

-- Owner only
CREATE POLICY "Users can update own posts"
ON public.posts FOR UPDATE
USING (auth.uid() = user_id);

-- Role-based
CREATE POLICY "Admins can delete any post"
ON public.posts FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Team-based
CREATE POLICY "Team members can view team posts"
ON public.posts FOR SELECT
USING (
  team_id IN (
    SELECT team_id FROM team_members
    WHERE user_id = auth.uid()
  )
);
```

### Security Headers

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

### Secrets Management

```bash
# .env.local - NEVER commit
SUPABASE_SERVICE_ROLE_KEY=your-key
STRIPE_SECRET_KEY=sk_live_xxx
OPENAI_API_KEY=sk-xxx

# .env.example - Commit this template
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
OPENAI_API_KEY=

# .gitignore
.env
.env.local
.env.*.local
```

```typescript
// Access secrets only in server code
// lib/secrets.ts
export function getSecret(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// Never expose to client
// BAD: process.env.STRIPE_SECRET_KEY in client component
// GOOD: Use in API routes only
```

### Rate Limiting

```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export async function middleware(request: NextRequest) {
  // Rate limit API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }
  }

  return NextResponse.next();
}
```

### Webhook Security

```typescript
// app/api/webhooks/stripe/route.ts
import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature) {
    return new Response('Missing signature', { status: 400 });
  }

  try {
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    // Process verified event
    // ...

  } catch (err) {
    console.error('Webhook signature verification failed');
    return new Response('Invalid signature', { status: 400 });
  }
}
```

### Logging Without Secrets

```typescript
// lib/logger.ts
const SENSITIVE_KEYS = [
  'password',
  'token',
  'secret',
  'key',
  'authorization',
  'cookie',
  'credit_card',
  'ssn',
];

function sanitize(obj: unknown): unknown {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some(k => lowerKey.includes(k))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      sanitized[key] = sanitize(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export function log(message: string, data?: unknown) {
  console.log(message, data ? sanitize(data) : '');
}
```

---

## Anti-patterns

### Client-Side Authorization

```typescript
// BAD - Authorization on client
'use client';
if (user.role === 'admin') {
  // Show admin panel - easily bypassed!
}

// GOOD - Server-side check
export default async function AdminPage() {
  await requireRole('admin');
  return <AdminPanel />;
}
```

### Trusting Client Data

```typescript
// BAD - Trust user input
const { userId, amount } = await request.json();
await transferFunds(userId, amount);

// GOOD - Use authenticated user
const user = await getUser();
const { amount } = await request.json();
await transferFunds(user.id, amount);
```

### Secrets in Client Code

```typescript
// BAD - Secret exposed
'use client';
const response = await fetch('https://api.openai.com/v1/...', {
  headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } // Visible!
});

// GOOD - Call your API
const response = await fetch('/api/ai', { body: prompt });
```

---

## Gotchas

### 1. NEXT_PUBLIC_ Variables Are Public

Any variable prefixed with `NEXT_PUBLIC_` is exposed to the browser.

### 2. getSession() vs getUser()

`getSession()` reads from storage and can be tampered. Always use `getUser()` for authorization.

### 3. RLS Off By Default

New Supabase tables have RLS disabled. Always enable it.

### 4. SQL Injection in Raw Queries

Supabase client is safe, but raw SQL needs parameterization:
```typescript
// BAD
supabase.rpc('my_function', { query: userInput })

// GOOD - use parameterized queries
supabase.from('table').select().eq('id', userInput)
```

---

## Checkpoints

Before marking security complete:

- [ ] RLS enabled on all tables with appropriate policies
- [ ] All inputs validated server-side
- [ ] Authentication required on protected routes
- [ ] Authorization checked for resource access
- [ ] No secrets in client code
- [ ] Security headers configured
- [ ] Rate limiting on sensitive endpoints
- [ ] Webhook signatures verified
- [ ] `npm audit` shows no critical vulnerabilities
- [ ] Error messages don't leak sensitive info

---

## Escape Hatches

### When RLS is too complex
- Start with simple owner-based policies
- Add complexity incrementally
- Use service role key for admin operations (carefully)

### When performance is critical
- Cache authorization decisions
- Use database roles for read-heavy operations
- Consider moving checks to database level

### When you need to debug production
- Use structured logging
- Never log raw user data
- Use request IDs for tracing

---

## Squad Dependencies

Often paired with:
- `nextjs-supabase-auth` for auth implementation
- `supabase-backend` for RLS
- `api-design` for secure endpoints
- `payments-flow` for payment security

---

*Last updated: 2025-12-11*
