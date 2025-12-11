---
name: auth-flow
description: Use when implementing authentication flows - enforces secure email/password handling, proper session management, and prevents common auth vulnerabilities
tags: [auth, login, signup, oauth, password-reset, session]
---

# Auth Flow Specialist

## Overview

Authentication is the foundation of application security. Weak auth flows expose user accounts to attackers. One security hole in auth means all user data is compromised.

**Core principle:** Never trust client-side auth checks. Always verify on the server. Never leak information about account existence.

## The Iron Law

```
NO CLIENT-SIDE ONLY AUTH CHECKS - ALWAYS VERIFY SERVER-SIDE
```

Client-side auth checks can be bypassed with browser dev tools. Every protected resource must verify auth on the server before returning data.

## When to Use

**Always:**
- Building login/signup forms
- Implementing password reset
- Setting up OAuth providers
- Protecting routes with middleware
- Managing user sessions

**Don't:**
- Public pages with no user data
- Static marketing sites
- Read-only public APIs

Thinking "I'll just check auth in the component"? Stop. That's a security vulnerability.

## The Process

### Step 1: Set Up Server-Side Auth Check

Before any auth UI, establish server-side verification:

```typescript
// middleware.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function middleware(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}
```

### Step 2: Build Auth Forms with Proper Error Handling

Forms should handle errors gracefully without leaking information:

```typescript
// Always show generic messages for security
if (error) {
  // Don't say "No account with this email" - reveals existence
  setError('Invalid email or password');
}
```

### Step 3: Implement Secure Session Refresh

Sessions expire. Middleware must refresh them on each request.

## Patterns

### Login Form with Server Action

<Good>
```tsx
// app/(auth)/login/page.tsx
"use client";

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const { error } = await supabase.auth.signInWithPassword({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    });

    if (error) {
      setError('Invalid email or password'); // Generic message
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh(); // Refresh server components
  };

  return (
    <form onSubmit={handleLogin}>
      {error && <div className="text-red-600">{error}</div>}
      <input name="email" type="email" required />
      <input name="password" type="password" required minLength={8} />
      <button type="submit" disabled={loading}>
        {loading ? 'Logging in...' : 'Log In'}
      </button>
    </form>
  );
}
```
Generic error message. Loading state prevents double-submit. router.refresh() updates server components.
</Good>

<Bad>
```tsx
"use client";

export default function LoginPage() {
  const handleLogin = async (e) => {
    const { error } = await supabase.auth.signInWithPassword(credentials);

    if (error) {
      if (error.message.includes('Invalid login')) {
        setError('No account with this email'); // Leaks account existence!
      }
    }
  };
}
```
Reveals whether email exists. No loading state. Allows enumeration attacks.
</Bad>

### Password Reset Flow

<Good>
```tsx
// Always show success regardless of email existence
const handleReset = async (email: string) => {
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  // Always show success - don't reveal if email exists
  setSuccess(true);
  setMessage('If an account exists for this email, you will receive a reset link.');
};
```
No information leakage. Attacker can't enumerate valid emails.
</Good>

<Bad>
```tsx
const handleReset = async (email: string) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email);

  if (error) {
    setError('No account found with this email'); // Reveals account existence!
  } else {
    setSuccess(true);
  }
};
```
Tells attacker which emails have accounts. Security vulnerability.
</Bad>

### Protected Route Verification

<Good>
```tsx
// app/(protected)/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Safe to fetch user data - auth verified server-side
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return <Dashboard profile={profile} />;
}
```
Server-side auth check. Redirect before any data access. Cannot be bypassed.
</Good>

<Bad>
```tsx
"use client";

export default function DashboardPage() {
  const { user, loading } = useUser(); // Client-side hook

  if (loading) return <Spinner />;
  if (!user) return <Redirect to="/login" />;

  // User could manipulate this check in dev tools!
  return <Dashboard />;
}
```
Client-side only check. Can be bypassed. Data may leak before redirect.
</Bad>

### OAuth Callback Handler

<Good>
```tsx
// app/(auth)/callback/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/dashboard';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Generic error - don't expose details
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
```
Exchanges code server-side. Generic error on failure. No security details leaked.
</Good>

<Bad>
```tsx
export async function GET(request: Request) {
  const code = searchParams.get('code');

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    // Exposes internal error details!
    return NextResponse.redirect(
      `/login?error=${encodeURIComponent(error.message)}`
    );
  }
}
```
Exposes Supabase error messages. Could reveal implementation details.
</Bad>

## Anti-Patterns

| Anti-Pattern | Why It Fails | What To Do Instead |
|--------------|--------------|-------------------|
| Client-only auth checks | Can be bypassed in browser | Always verify server-side |
| Revealing email existence | Enables enumeration attacks | Generic "invalid credentials" |
| Storing passwords in state | Memory can be inspected | Clear immediately after use |
| Missing session refresh | Users get logged out unexpectedly | Refresh in middleware |
| Exposing auth error details | Reveals implementation | Use generic error messages |

## Red Flags - STOP

If you catch yourself:
- Checking auth only in a client component
- Showing different errors for "wrong email" vs "wrong password"
- Not clearing password fields after submission
- Skipping server-side verification "because middleware handles it"
- Exposing Supabase/Firebase error messages directly to users

**ALL of these mean: STOP. Review auth security. Fix before continuing.**

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Middleware protects the route" | Middleware can fail or be misconfigured. Double-check in page. |
| "It's just for development" | Dev habits become prod habits. Secure from day one. |
| "Users won't notice the error message" | Attackers will. They script enumeration attacks. |
| "Client-side check is faster" | Security > speed. Server check is required regardless. |
| "OAuth handles security for me" | You still need to handle callbacks and session correctly. |
| "Nobody will try to hack this app" | Bots attack everything. Automated. Constantly. |

## Gotchas

### Email Confirmation Required

Supabase requires email confirmation by default. Handle unverified users:

```typescript
const { data: { user } } = await supabase.auth.getUser();
if (user && !user.email_confirmed_at) {
  return <VerifyEmailPrompt email={user.email} />;
}
```

### Session Refresh in Middleware

Sessions expire. Always refresh in middleware:

```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const supabase = await createClient();
  // This call refreshes the session if needed
  await supabase.auth.getUser();
  return NextResponse.next();
}
```

### OAuth Redirect URLs Must Be Configured

Add all callback URLs to Supabase Dashboard:
- Settings → Authentication → URL Configuration
- `http://localhost:3000/callback` (dev)
- `https://yourdomain.com/callback` (prod)

### Password Minimum Length

Supabase default is 6 characters. Enforce stronger on client:

```tsx
<input type="password" minLength={8} required />
```

## Verification Checklist

Before marking auth flow complete:

- [ ] Login works with email/password
- [ ] Signup sends verification email (if enabled)
- [ ] Password reset flow works end-to-end
- [ ] OAuth callback handles success and error
- [ ] Protected routes verified server-side (not just middleware)
- [ ] Session refreshes automatically
- [ ] Logout clears session and redirects
- [ ] Error messages don't reveal account existence
- [ ] Password fields cleared after submission
- [ ] Loading states prevent double-submission

Can't check all boxes? You have auth vulnerabilities. Fix them.

## Integration

**Pairs well with:**
- `nextjs-supabase-auth` - Server/client auth setup
- `supabase-backend` - User profiles and RLS
- `security-audit` - Auth security review
- `server-client-boundary` - Auth state handling

**Requires:**
- Supabase project with auth configured
- @supabase/ssr for Next.js

## References

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

---

*This specialist follows the world-class skill pattern.*
