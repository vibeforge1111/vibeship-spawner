# Auth Flow Pattern Specialist

## Identity

- **Layer**: 3 (Pattern)
- **Domain**: Login, signup, password reset, OAuth, session management
- **Triggers**: Auth features, user management, protected routes, login/signup pages

---

## Patterns

### Complete Auth Flow Structure

```
app/
  (auth)/
    login/page.tsx        # Login form
    signup/page.tsx       # Signup form
    forgot-password/page.tsx
    reset-password/page.tsx
    verify/page.tsx       # Email verification
    callback/route.ts     # OAuth callback
  (protected)/
    dashboard/page.tsx    # Requires auth
    settings/page.tsx
  middleware.ts           # Auth protection
```

### Login Form (Client Component)

```tsx
// app/(auth)/login/page.tsx
"use client";

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard');
    router.refresh();
  };

  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <h1 className="text-2xl font-bold">Log In</h1>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full p-2 border rounded"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full p-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Logging in...' : 'Log In'}
      </button>

      <div className="text-center space-y-2">
        <a href="/forgot-password" className="text-blue-500">
          Forgot password?
        </a>
        <p>
          Don't have an account?{' '}
          <a href="/signup" className="text-blue-500">Sign up</a>
        </p>
      </div>
    </form>
  );
}
```

### Signup Form with Email Verification

```tsx
// app/(auth)/signup/page.tsx
"use client";

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Check your email</h1>
        <p className="mt-2">
          We sent a verification link to <strong>{email}</strong>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      <h1 className="text-2xl font-bold">Create Account</h1>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full p-2 border rounded"
        />
        <p className="text-sm text-gray-500">
          At least 8 characters
        </p>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full p-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Creating account...' : 'Sign Up'}
      </button>

      <p className="text-center">
        Already have an account?{' '}
        <a href="/login" className="text-blue-500">Log in</a>
      </p>
    </form>
  );
}
```

### OAuth Callback Handler

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

  // Auth error - redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
```

### Password Reset Flow

```tsx
// app/(auth)/forgot-password/page.tsx
"use client";

import { createClient } from '@/lib/supabase/client';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    // Always show success (don't reveal if email exists)
    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="text-center">
        <h1 className="text-2xl font-bold">Check your email</h1>
        <p className="mt-2">
          If an account exists for {email}, you'll receive a reset link.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleReset} className="space-y-4">
      <h1 className="text-2xl font-bold">Reset Password</h1>

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full p-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Send Reset Link'}
      </button>

      <a href="/login" className="block text-center text-blue-500">
        Back to login
      </a>
    </form>
  );
}
```

### Reset Password Page (After Email Link)

```tsx
// app/(auth)/reset-password/page.tsx
"use client";

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/login?message=password_updated');
  };

  return (
    <form onSubmit={handleUpdate} className="space-y-4">
      <h1 className="text-2xl font-bold">Set New Password</h1>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="password">New Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          className="w-full p-2 border rounded"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full p-2 bg-blue-500 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Updating...' : 'Update Password'}
      </button>
    </form>
  );
}
```

### OAuth Buttons

```tsx
// components/OAuthButtons.tsx
"use client";

import { createClient } from '@/lib/supabase/client';

export function OAuthButtons() {
  const supabase = createClient();

  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/callback`,
      },
    });
  };

  const signInWithGithub = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/callback`,
      },
    });
  };

  return (
    <div className="space-y-2">
      <button
        onClick={signInWithGoogle}
        className="w-full p-2 border rounded flex items-center justify-center gap-2"
      >
        <GoogleIcon /> Continue with Google
      </button>
      <button
        onClick={signInWithGithub}
        className="w-full p-2 border rounded flex items-center justify-center gap-2"
      >
        <GithubIcon /> Continue with GitHub
      </button>
    </div>
  );
}
```

### Logout Function

```tsx
// actions/auth.ts
"use server";

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect('/login');
}

// Usage in component
<form action={signOut}>
  <button type="submit">Log Out</button>
</form>
```

---

## Anti-patterns

### Storing Passwords in State Longer Than Needed

```tsx
// BAD - Password stays in memory
const [formData, setFormData] = useState({ email: '', password: '' });
// ... used throughout component

// GOOD - Clear password after use
const handleLogin = async (e) => {
  const password = e.target.password.value;
  await login(email, password);
  e.target.password.value = ''; // Clear from DOM
};
```

### Client-Side Only Auth Checks

```tsx
// BAD - Can be bypassed
"use client";
export default function Dashboard() {
  const { user } = useUser();
  if (!user) return <Redirect />;
  // ...
}

// GOOD - Server-side check in middleware
// middleware.ts handles redirect
export default async function Dashboard() {
  const user = await getUser(); // Server-side
  // ...
}
```

### Revealing Email Existence

```tsx
// BAD
if (!userExists) {
  return "No account with this email";
}

// GOOD
return "If an account exists, you'll receive an email";
```

---

## Gotchas

### 1. Email Confirmation Required

By default, Supabase requires email confirmation. Users can't sign in until verified.

```typescript
// Check if email confirmed
const { data: { user } } = await supabase.auth.getUser();
if (user && !user.email_confirmed_at) {
  // Show "check your email" message
}
```

### 2. Session Cookie Refresh

Sessions expire! Middleware must refresh them:

```typescript
// middleware.ts
await supabase.auth.getUser(); // This refreshes the session
```

### 3. OAuth Redirect URLs

Must be configured in Supabase Dashboard:
- Settings → Authentication → URL Configuration → Redirect URLs
- Add: `http://localhost:3000/callback` (dev)
- Add: `https://yourdomain.com/callback` (prod)

### 4. Password Requirements

Default Supabase minimum is 6 characters. Consider:
- Enforcing 8+ on client
- Using password strength indicators
- Rate limiting attempts

### 5. Magic Links vs Password

Magic link auth is more secure but:
- Requires email access
- Can be confusing for users
- Links expire

---

## Checkpoints

Before marking an auth flow task complete:

- [ ] Login flow works with email/password
- [ ] Signup sends verification email
- [ ] Password reset flow complete
- [ ] OAuth callback handles success and error
- [ ] Protected routes redirect unauthenticated users
- [ ] Session refreshes in middleware
- [ ] Logout clears session and redirects
- [ ] Error messages don't reveal security info
- [ ] Loading states shown during auth operations
- [ ] Form validation on client side

---

## Escape Hatches

### When Supabase Auth is too limited
- Need custom MFA flow: Use auth.js or custom implementation
- Need SSO/SAML: Consider Auth0 or WorkOS
- Need phone auth: Twilio integration

### When email verification causes friction
- Consider magic links instead
- Add "resend verification" flow
- Allow limited access before verification

### When OAuth providers fail
- Check redirect URL configuration
- Verify provider app credentials
- Fall back to email/password

---

## Squad Dependencies

Often paired with:
- **Layer 2**: `nextjs-supabase-auth` for server/client auth handling
- **Layer 1**: `supabase-backend` for database user profiles
- **Layer 2**: `server-client-boundary` for auth state handling
- **Standalone**: `security-audit` for auth security review

---

*Last updated: 2025-12-11*
