# Next.js + Supabase Auth Specialist

## Identity

- **Tags**: `auth`, `nextjs`, `supabase`, `ssr`, `middleware`, `session`
- **Domain**: Full auth flow across Next.js and Supabase, SSR auth, middleware, session handling
- **Use when**: Auth integration issues, session problems, protected routes, SSR auth

---

## Patterns

### Complete Auth Setup

```
lib/
  supabase/
    client.ts        # Browser client
    server.ts        # Server Component client
    middleware.ts    # Middleware client
middleware.ts        # Auth middleware
app/
  (auth)/
    login/page.tsx
    signup/page.tsx
    callback/route.ts
  (protected)/
    layout.tsx       # Auth check
    dashboard/page.tsx
```

### Browser Client

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### Server Client (Server Components & Server Actions)

```typescript
// lib/supabase/server.ts
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
            // Called from Server Component - ignore
          }
        },
      },
    }
  );
}
```

### Middleware Client

```typescript
// lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

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
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: DO NOT use getSession() - use getUser() instead
  // getUser() hits the auth server every time and ensures fresh session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { user, supabaseResponse };
}
```

### Auth Middleware

```typescript
// middleware.ts
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { user, supabaseResponse } = await updateSession(request);

  // Protected routes
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Redirect logged-in users away from auth pages
  if (user && (
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/signup'
  )) {
    const redirect = request.nextUrl.searchParams.get('redirect') || '/dashboard';
    return NextResponse.redirect(new URL(redirect, request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
```

### OAuth Callback Handler

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

### Getting User in Server Components

```typescript
// app/(protected)/dashboard/page.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const supabase = await createClient();

  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  // Fetch user-specific data
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

### Getting User in Client Components

```typescript
// components/UserMenu.tsx
"use client";

import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';

export function UserMenu() {
  const [user, setUser] = useState<User | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  if (!user) return null;

  return <div>{user.email}</div>;
}
```

### Server Actions for Auth

```typescript
// actions/auth.ts
"use server";

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
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/callback`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: 'Check your email for verification link' };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath('/', 'layout');
  redirect('/login');
}
```

### Protected Layout Pattern

```typescript
// app/(protected)/layout.tsx
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return <>{children}</>;
}
```

---

## Anti-patterns

### Using getSession() Instead of getUser()

```typescript
// BAD - getSession() reads from storage, can be stale/tampered
const { data: { session } } = await supabase.auth.getSession();
const user = session?.user;

// GOOD - getUser() validates with auth server
const { data: { user } } = await supabase.auth.getUser();
```

### Client-Side Only Auth Checks

```typescript
// BAD - Can be bypassed
"use client";
export default function Dashboard() {
  const { user } = useUser();
  if (!user) return <Redirect />;
  // Attacker can modify client code
}

// GOOD - Server-side check
export default async function Dashboard() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
}
```

### Not Refreshing Sessions in Middleware

```typescript
// BAD - Sessions expire silently
export async function middleware(request: NextRequest) {
  // No session refresh
  return NextResponse.next();
}

// GOOD - Always call getUser() to refresh
export async function middleware(request: NextRequest) {
  const { user, supabaseResponse } = await updateSession(request);
  // Session refreshed automatically
  return supabaseResponse;
}
```

---

## Gotchas

### 1. Cookies Must Be Passed Correctly

The cookie handling between Next.js and Supabase is complex. Always use the patterns above exactly.

### 2. Server Actions Can't Set Cookies Directly

Server Actions called from Client Components can't set cookies. The middleware handles cookie refresh automatically.

### 3. Route Handlers Need Different Cookie Handling

```typescript
// app/api/something/route.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // Route handlers CAN set cookies
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  // ...
}
```

### 4. Email Confirmation Blocks Sign In

By default, users can't sign in until email is confirmed. Handle this:

```typescript
const { error } = await supabase.auth.signInWithPassword({ email, password });
if (error?.message === 'Email not confirmed') {
  return { error: 'Please verify your email first' };
}
```

### 5. OAuth Redirect URLs

Add ALL possible callback URLs in Supabase Dashboard:
- `http://localhost:3000/callback` (dev)
- `https://your-domain.com/callback` (prod)
- `https://*.vercel.app/callback` (preview deployments)

---

## Checkpoints

Before marking an auth integration task complete:

- [ ] Browser, Server, and Middleware clients set up correctly
- [ ] Middleware refreshes sessions
- [ ] Protected routes redirect unauthenticated users
- [ ] Auth pages redirect authenticated users
- [ ] OAuth callback handles success and error
- [ ] Server Actions handle errors gracefully
- [ ] RLS policies work with authenticated users
- [ ] User can sign up, sign in, sign out

---

## Escape Hatches

### When cookie handling breaks
- Check all three clients are using the correct cookie configuration
- Verify middleware is running (check matcher)
- Clear all cookies and try again

### When sessions keep expiring
- Middleware must call getUser()
- Check Supabase JWT expiry settings
- Ensure middleware runs on protected routes

### When OAuth fails
- Verify redirect URLs in Supabase Dashboard
- Check callback route is handling code correctly
- Verify environment variables

---

## Squad Dependencies

Often paired with:
- `supabase-backend` for RLS and database
- `nextjs-app-router` for routing patterns
- `auth-flow` for UI implementation
- `server-client-boundary` for component decisions

---

*Last updated: 2025-12-11*
