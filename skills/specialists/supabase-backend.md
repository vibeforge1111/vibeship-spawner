# Supabase Backend Specialist

## Identity

- **Tags**: `supabase`, `database`, `rls`, `auth`, `storage`, `realtime`
- **Domain**: Supabase Auth, Database, RLS, Edge Functions, Realtime, Storage
- **Use when**: Any Supabase project, auth tasks, database schema, RLS policies

---

## Patterns

### Database Schema with RLS

```sql
-- Always enable RLS on user-facing tables
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read all profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

### RLS for Multi-tenant Data

```sql
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE todos ENABLE ROW LEVEL SECURITY;

-- Users can only see their own todos
CREATE POLICY "Users can view own todos"
  ON todos FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own todos
CREATE POLICY "Users can insert own todos"
  ON todos FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only update their own todos
CREATE POLICY "Users can update own todos"
  ON todos FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can only delete their own todos
CREATE POLICY "Users can delete own todos"
  ON todos FOR DELETE
  USING (auth.uid() = user_id);
```

### Client Setup (Next.js)

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
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}
```

### Middleware for Auth

```typescript
// middleware.ts
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
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

  // Refresh session if expired
  const { data: { user } } = await supabase.auth.getUser();

  // Protect routes
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### Edge Functions

```typescript
// supabase/functions/hello/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Get auth header for user context
  const authHeader = req.headers.get('Authorization');
  if (authHeader) {
    const { data: { user } } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    // User is authenticated
  }

  return new Response(JSON.stringify({ message: 'Hello!' }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

### Realtime Subscriptions

```typescript
// Subscribe to changes
const channel = supabase
  .channel('todos')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'todos',
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      if (payload.eventType === 'INSERT') {
        setTodos(prev => [...prev, payload.new]);
      } else if (payload.eventType === 'DELETE') {
        setTodos(prev => prev.filter(t => t.id !== payload.old.id));
      } else if (payload.eventType === 'UPDATE') {
        setTodos(prev => prev.map(t =>
          t.id === payload.new.id ? payload.new : t
        ));
      }
    }
  )
  .subscribe();

// Cleanup
return () => supabase.removeChannel(channel);
```

### Storage with Policies

```sql
-- Storage bucket policy
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Avatars are publicly viewable"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
```

```typescript
// Upload avatar
const { data, error } = await supabase.storage
  .from('avatars')
  .upload(`${userId}/${filename}`, file);

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('avatars')
  .getPublicUrl(`${userId}/${filename}`);
```

---

## Anti-patterns

### Bypassing RLS in Client Code

```typescript
// BAD - Using service role key in client
const supabase = createClient(url, SERVICE_ROLE_KEY); // NEVER!

// GOOD - Always use anon key in client
const supabase = createClient(url, ANON_KEY);
```

### RLS Without auth.uid()

```sql
-- BAD - This policy does nothing useful
CREATE POLICY "Bad policy"
  ON todos FOR SELECT
  USING (user_id IS NOT NULL);

-- GOOD - Ties to authenticated user
CREATE POLICY "Good policy"
  ON todos FOR SELECT
  USING (auth.uid() = user_id);
```

### Fetching in useEffect for Server-renderable Data

```typescript
// BAD
"use client";
useEffect(() => {
  supabase.from('posts').select('*').then(setPosts);
}, []);

// GOOD - Use Server Component
const { data: posts } = await supabase.from('posts').select('*');
```

### No Error Handling

```typescript
// BAD
const { data } = await supabase.from('todos').select('*');

// GOOD
const { data, error } = await supabase.from('todos').select('*');
if (error) throw new Error(`Failed to fetch todos: ${error.message}`);
```

---

## Gotchas

### 1. RLS Applies to Service Role Too (unless bypassed)

```sql
-- Service role bypasses RLS by default
-- But if you want RLS even for service role:
ALTER TABLE todos FORCE ROW LEVEL SECURITY;
```

### 2. auth.uid() Returns NULL for Anon Users

```sql
-- This fails for unauthenticated users
CREATE POLICY "..."
  ON public_posts FOR SELECT
  USING (auth.uid() = author_id); -- NULL = author_id is always false!

-- For public data, use:
USING (true);
```

### 3. Triggers Run as Table Owner

```sql
-- Trigger functions bypass RLS!
-- Use security definer carefully
CREATE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4. Realtime Requires Table Replication

Enable in Dashboard: Database → Replication → Enable for table

### 5. Foreign Keys Need RLS Too

```sql
-- If todos has FK to projects, user needs SELECT on projects
CREATE POLICY "Users can view their projects"
  ON projects FOR SELECT
  USING (auth.uid() = owner_id);
```

### 6. Email Templates Are Project-Wide

Custom email templates affect all auth emails for the project.

---

## Checkpoints

Before marking a Supabase task complete:

- [ ] RLS enabled on all user-facing tables
- [ ] Policies cover SELECT, INSERT, UPDATE, DELETE as needed
- [ ] Service role key NOT exposed to client
- [ ] Error handling on all database operations
- [ ] Indexes on frequently queried columns
- [ ] Foreign key constraints in place
- [ ] Migration files created and tested
- [ ] Environment variables properly set

---

## Escape Hatches

### When to use raw SQL instead of client
- Complex joins or CTEs
- Bulk operations
- Performance-critical queries

### When RLS is too complex
- Consider database functions (security definer)
- Move logic to Edge Functions
- Denormalize for simpler policies

### When Realtime isn't working
- Check table replication is enabled
- Verify RLS allows the subscription
- Consider polling as fallback

### When to consider alternatives
- If you need full-text search: add pg_trgm or use Algolia
- If you need complex caching: add Redis layer
- If you need GraphQL: use PostGraphile or Hasura

---

## Squad Dependencies

Often paired with:
- `nextjs-supabase-auth` for auth integration
- `typescript-strict` for type generation
- `auth-flow` for login/signup patterns
- `crud-builder` for data operations

---

*Last updated: 2025-12-11*
