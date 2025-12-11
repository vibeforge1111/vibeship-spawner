---
name: nextjs-supabase-auth
description: Use when implementing authentication with Next.js and Supabase - enforces proper client setup, middleware session refresh, and server-side verification patterns
tags: [auth, nextjs, supabase, ssr, middleware, session]
---

# Next.js + Supabase Auth Specialist

## Overview

Auth in Next.js App Router with Supabase requires three different clients: browser, server, and middleware. Using the wrong client or skipping session refresh causes auth bugs, security holes, and frustrated users.

**Core principle:** Always verify auth server-side with getUser(). Never trust getSession(). Middleware must refresh tokens on every request.

## The Iron Law

```
NO AUTH CHECK WITH GETSESSION - ALWAYS USE GETUSER FOR SERVER-SIDE VERIFICATION
```

getSession() reads from local storage - it can be stale or tampered. getUser() validates with Supabase's auth server every time. For security-critical checks, always use getUser().

## When to Use

**Always:**
- Setting up auth in a new project
- Protecting routes
- Getting user data server-side
- Handling OAuth callbacks
- Managing session refresh

**Don't:**
- Non-Supabase auth systems
- Client-only apps without SSR
- Static sites without protected content

Thinking "getSession is faster"? Stop. The milliseconds saved aren't worth the security risk.

## The Process

### Step 1: Create Three Clients

Browser client, Server client, and Middleware client - each with specific cookie handling.

### Step 2: Set Up Middleware

Middleware must run on all routes to refresh sessions before they expire.

### Step 3: Protect Routes

Use server-side checks in layouts/pages. Middleware handles redirects.

## Patterns

### Complete Client Setup

<Good>
```typescript
// lib/supabase/client.ts - Browser client
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// lib/supabase/server.ts - Server Components & Actions
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component - can't set cookies
          }
        },
      },
    }
  );
}
```
Separate clients with correct cookie handling for each context.
</Good>

<Bad>
```typescript
// Single client for everything
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```
No SSR support. Sessions won't persist. Auth will break.
</Bad>

### Middleware with Session Refresh

<Good>
```typescript
// lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // CRITICAL: Use getUser(), not getSession()
  const { data: { user } } = await supabase.auth.getUser();

  return { user, supabaseResponse };
}

// middleware.ts
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { user, supabaseResponse } = await updateSession(request);

  // Protect dashboard routes
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from auth pages
  if (user && ['/login', '/signup'].includes(request.nextUrl.pathname)) {
    const redirect = request.nextUrl.searchParams.get('redirect') || '/dashboard';
    return NextResponse.redirect(new URL(redirect, request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg)$).*)',
  ],
};
```
Session refreshed on every request. Uses getUser() for verification. Proper redirect handling.
</Good>

<Bad>
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  // No session refresh!
  // Sessions will expire silently
  return NextResponse.next();
}

// Or using getSession
const { data: { session } } = await supabase.auth.getSession();
if (!session?.user) redirect('/login'); // Can be spoofed!
```
No session refresh = expired sessions. getSession = security vulnerability.
</Bad>

### Server Component Auth Check

<Good>
```typescript
// app/(protected)/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();

  // Use getUser() - verifies with auth server
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  // Safe to fetch user-specific data
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return (
    <div>
      <h1>Welcome, {profile?.name || user.email}</h1>
    </div>
  );
}
```
Server-side verification with getUser(). Redirects if not authenticated.
</Good>

<Bad>
```typescript
// Client-side only check - can be bypassed
'use client';

export default function Dashboard() {
  const { user } = useUser(); // Client-side hook

  if (!user) {
    redirect('/login'); // Too late - component already rendered
  }

  return <div>Dashboard</div>;
}
```
Client-side checks can be bypassed. Server must verify.
</Bad>

### OAuth Callback Handler

<Good>
```typescript
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
      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
```
Handles code exchange. Respects forwarded host for proxies. Error fallback.
</Good>

<Bad>
```typescript
// Missing error handling
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get('code');
  const supabase = await createClient();
  await supabase.auth.exchangeCodeForSession(code!);
  return NextResponse.redirect('/dashboard');
}
```
No null check. No error handling. No forwarded host support.
</Bad>

### Server Actions for Auth

<Good>
```typescript
// actions/auth.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  });

  if (error) {
    // Don't reveal if email exists
    return { error: 'Invalid email or password' };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
```
Validates server-side. Revalidates cache. Secure error messages.
</Good>

<Bad>
```typescript
// Revealing information in errors
if (error?.message === 'Invalid login credentials') {
  return { error: 'Wrong password' }; // Confirms email exists!
}
```
Reveals whether email exists. Security vulnerability.
</Bad>

## Anti-Patterns

| Anti-Pattern | Why It Fails | What To Do Instead |
|--------------|--------------|-------------------|
| Using getSession() for auth checks | Can be stale/tampered | Use getUser() always |
| Client-side only protection | Can be bypassed | Server-side verification |
| No middleware session refresh | Sessions expire silently | Call getUser() in middleware |
| Single Supabase client | SSR doesn't work | Three clients: browser, server, middleware |
| Revealing email existence | Security vulnerability | Generic "invalid credentials" message |

## Red Flags - STOP

If you catch yourself:
- Using `getSession()` instead of `getUser()` for auth checks
- Protecting routes only with client-side redirects
- Creating a middleware that doesn't refresh sessions
- Using a single Supabase client instance
- Showing different errors for wrong email vs wrong password

**ALL of these mean: STOP. Use the correct patterns above.**

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "getSession is faster" | Milliseconds don't matter. Security does. |
| "Middleware is optional" | Without it, sessions expire unexpectedly. |
| "Client check is enough" | Client code can be modified. Server must verify. |
| "One client is simpler" | One client breaks SSR. Three clients work correctly. |
| "Users should know their email exists" | That helps attackers enumerate accounts. |
| "Cookie handling is too complex" | Copy the patterns exactly. They work. |

## Gotchas

### Server Actions Can't Set Cookies

Server Actions called from Client Components can't reliably set cookies. The middleware handles session refresh automatically.

### Route Handlers Need Different Cookie Handling

```typescript
// app/api/something/route.ts
export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient(/* ... */, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        // Route handlers CAN set cookies
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
      },
    },
  });
}
```

### Email Confirmation Blocks Sign In

By default, Supabase requires email confirmation before sign in:

```typescript
if (error?.message === 'Email not confirmed') {
  return { error: 'Please check your email for the confirmation link' };
}
```

### OAuth Redirect URLs Must Be Configured

Add ALL callback URLs in Supabase Dashboard → Authentication → URL Configuration:
- `http://localhost:3000/callback` (development)
- `https://your-domain.com/callback` (production)
- `https://*.vercel.app/callback` (preview deployments)

### Middleware Matcher Excludes Static Files

```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg)$).*)',
  ],
};
```

## Verification Checklist

Before marking auth integration complete:

- [ ] Browser client in lib/supabase/client.ts
- [ ] Server client in lib/supabase/server.ts
- [ ] Middleware client with updateSession helper
- [ ] Middleware runs on all routes (check matcher)
- [ ] getUser() used for all auth checks (not getSession)
- [ ] Protected routes redirect unauthenticated users
- [ ] Auth pages redirect authenticated users
- [ ] OAuth callback handles success and error
- [ ] Generic error messages (don't reveal email existence)
- [ ] RLS policies work with authenticated user.id

Can't check all boxes? You have auth security gaps. Fix them.

## Integration

**Pairs well with:**
- `supabase-backend` - RLS policies and database
- `auth-flow` - Login/signup UI implementation
- `server-client-boundary` - Component placement decisions
- `nextjs-app-router` - Routing patterns

**Requires:**
- @supabase/ssr package
- Environment variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY
- Supabase project with Auth enabled

## References

- [Supabase Auth with Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
- [Supabase SSR Package](https://supabase.com/docs/guides/auth/server-side)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)

---

*This specialist follows the world-class skill pattern.*
