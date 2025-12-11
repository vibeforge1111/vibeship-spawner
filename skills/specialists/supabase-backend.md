---
name: supabase-backend
description: Use when working with Supabase database, auth, or storage - enforces RLS policies on all tables, proper client setup, and secure data access patterns
tags: [supabase, database, rls, auth, storage, realtime]
---

# Supabase Backend Specialist

## Overview

Supabase provides Postgres with Row Level Security (RLS). Without RLS, your database is open to any authenticated user. With bad RLS, it's open to attackers.

**Core principle:** Every user-facing table MUST have RLS enabled with policies that restrict access to appropriate data.

## The Iron Law

```
NO USER-FACING TABLE WITHOUT RLS ENABLED AND POLICIES DEFINED
```

A table without RLS is a security vulnerability. A table with RLS but no policies blocks all access. Both are wrong. Enable RLS AND create appropriate policies.

## When to Use

**Always:**
- Creating database tables
- Setting up authentication
- Implementing data access
- Configuring storage buckets
- Adding realtime subscriptions

**Don't:**
- Client-side only features (no backend)
- Non-Supabase databases
- Admin-only internal tools (but still consider RLS)

Thinking "I'll add RLS later"? Stop. That's a security vulnerability waiting to be exploited.

## The Process

### Step 1: Create Table with RLS

Every table creation includes RLS enablement:

```sql
CREATE TABLE todos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ALWAYS enable RLS immediately
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
```

### Step 2: Create Policies for Each Operation

Define what users can SELECT, INSERT, UPDATE, DELETE:

```sql
CREATE POLICY "Users can view own todos" ON todos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own todos" ON todos
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Step 3: Test Policies

Query as different users to verify policies work correctly.

## Patterns

### RLS for User-Owned Data

<Good>
```sql
-- Table with user ownership
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Each operation explicitly tied to auth.uid()
CREATE POLICY "Users can view own posts"
  ON posts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);
```
Explicit policy for each CRUD operation. auth.uid() ties to authenticated user.
</Good>

<Bad>
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL
);

-- RLS not enabled! Any authenticated user can access ALL posts!
-- Or worse:
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
-- No policies = NO ONE can access (including owner)
```
Missing RLS = security hole. RLS without policies = broken app.
</Bad>

### Public Read, Private Write

<Good>
```sql
-- Profiles visible to everyone, editable by owner
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Anyone can read profiles
CREATE POLICY "Profiles are publicly viewable"
  ON profiles FOR SELECT
  USING (true);

-- Only owner can update
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```
Public content uses `USING (true)`. Write operations check ownership.
</Good>

<Bad>
```sql
CREATE POLICY "Bad policy"
  ON profiles FOR SELECT
  USING (user_id IS NOT NULL); -- This allows ALL rows!

CREATE POLICY "Another bad policy"
  ON profiles FOR SELECT
  USING (auth.uid() IS NOT NULL); -- Allows any authenticated user to see all!
```
These policies don't actually restrict anything meaningful.
</Bad>

### Server Client Setup (Next.js)

<Good>
```typescript
// lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, // ANON key, not service role
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
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
Uses anon key. RLS applies. User context from cookies.
</Good>

<Bad>
```typescript
// NEVER do this in client-accessible code
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // BYPASSES ALL RLS!
);
```
Service role key bypasses RLS. Never expose to client or use in client-accessible routes.
</Bad>

### Error Handling

<Good>
```typescript
const { data, error } = await supabase
  .from('todos')
  .select('*')
  .eq('id', todoId)
  .single();

if (error) {
  console.error('Database error:', error);
  throw new Error('Failed to fetch todo');
}

if (!data) {
  throw new Error('Todo not found');
}

return data;
```
Always check error. Always check data exists. Log internally.
</Good>

<Bad>
```typescript
const { data } = await supabase.from('todos').select('*');
return data; // Could be null! Error ignored!
```
Ignoring error. Not checking if data exists. Will crash downstream.
</Bad>

## Anti-Patterns

| Anti-Pattern | Why It Fails | What To Do Instead |
|--------------|--------------|-------------------|
| Tables without RLS | Anyone can access all data | Enable RLS on every table |
| Service role key in client | Bypasses all security | Use anon key, rely on RLS |
| Policies with `USING (true)` for writes | Anyone can write anything | Check `auth.uid() = user_id` |
| No error handling on queries | Silent failures, null crashes | Always check `error` and `data` |
| Fetching in useEffect | Extra round trip, loading flash | Use Server Components |

## Red Flags - STOP

If you catch yourself:
- Creating a table without immediately enabling RLS
- Using service role key outside of admin scripts
- Writing a policy without `auth.uid()` for user data
- Ignoring the `error` return from Supabase queries
- Storing service role key in NEXT_PUBLIC_ variable

**ALL of these mean: STOP. You have a security vulnerability. Fix it before continuing.**

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "It's just for development" | Dev habits become prod habits. Add RLS now. |
| "Only admins use this table" | Add RLS anyway. Defense in depth. |
| "I'll add policies after I test" | You'll forget. App will break or leak data. |
| "Service role is faster" | Security > speed. Use anon key + RLS. |
| "The error won't happen" | It will. In production. At 3am. Handle it. |
| "RLS is too complex" | RLS is simpler than fixing a data breach. |

## Gotchas

### auth.uid() Returns NULL for Anon Users

```sql
-- This fails for unauthenticated requests
CREATE POLICY "..." ON posts FOR SELECT
  USING (auth.uid() = author_id); -- NULL = author_id is always false!

-- For public data, use:
USING (true);

-- Or for "public OR owner":
USING (is_public = true OR auth.uid() = author_id);
```

### Triggers Bypass RLS

```sql
-- Trigger functions run as table owner, bypassing RLS!
CREATE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; -- Be careful with this
```

### Realtime Requires Table Replication

Enable in Supabase Dashboard: Database → Replication → Enable for table

### Foreign Keys Need RLS Too

```sql
-- If todos references projects, user needs SELECT on projects
CREATE POLICY "Users can view their projects"
  ON projects FOR SELECT
  USING (auth.uid() = owner_id);
```

## Verification Checklist

Before marking Supabase work complete:

- [ ] RLS enabled on ALL user-facing tables
- [ ] Policies exist for SELECT, INSERT, UPDATE, DELETE as needed
- [ ] Service role key NOT used in client code
- [ ] Error handling on every database operation
- [ ] Foreign key tables also have appropriate RLS
- [ ] Tested policies with different user contexts
- [ ] Migration files created and version controlled
- [ ] Environment variables properly configured

Can't check all boxes? You have security gaps. Fix them.

## Integration

**Pairs well with:**
- `nextjs-supabase-auth` - Authentication flows
- `typescript-strict` - Type generation from schema
- `api-design` - API routes with Supabase
- `realtime-sync` - Live subscriptions

**Requires:**
- Supabase project
- @supabase/ssr for Next.js

## References

- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Auth Helpers](https://supabase.com/docs/guides/auth/auth-helpers)
- [Postgres RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

---

*This specialist follows the world-class skill pattern.*
