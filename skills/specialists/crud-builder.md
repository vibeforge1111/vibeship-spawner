---
name: crud-builder
description: Use when building data management features - enforces validation at every boundary, proper RLS policies, and complete error handling for all CRUD operations
tags: [crud, forms, tables, validation, admin, list-view]
---

# CRUD Builder Specialist

## Overview

CRUD operations are the backbone of data-driven applications. Without validation, RLS, and proper error handling, you get corrupted data, security holes, and frustrated users staring at cryptic errors.

**Core principle:** Validate at every boundary. Never trust incoming data. Always handle the error case.

## The Iron Law

```
NO DATABASE OPERATION WITHOUT VALIDATION AND ERROR HANDLING
```

Every insert, update, and delete must validate input with Zod, handle potential errors, and return meaningful results. Unvalidated data in the database is a bug waiting to explode.

## When to Use

**Always:**
- Building list/detail/edit pages
- Creating forms for data entry
- Implementing admin panels
- Adding server actions for mutations
- Setting up data tables with pagination

**Don't:**
- Read-only displays of static data
- Simple config toggles
- One-off scripts

Thinking "validation is overkill for this simple form"? Stop. Simple forms become complex. Start right.

## The Process

### Step 1: Define Database Schema with Constraints

Schema is your first line of defense:

```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) <= 200),
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users CRUD own posts" ON posts
  FOR ALL USING (auth.uid() = user_id);
```

### Step 2: Create Zod Schemas for Validation

Single source of truth for types AND validation:

```typescript
const createPostSchema = z.object({
  title: z.string().min(1, 'Required').max(200, 'Too long'),
  content: z.string().min(1, 'Required'),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});

type CreatePostInput = z.infer<typeof createPostSchema>;
```

### Step 3: Implement Server Actions with Full Error Handling

Every operation validates, handles errors, and revalidates.

## Patterns

### Server Action with Validation

<Good>
```typescript
// actions/posts.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const createPostSchema = z.object({
  title: z.string().min(1, 'Title required').max(200),
  content: z.string().min(1, 'Content required'),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});

export async function createPost(input: unknown) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  // Validate input
  const validated = createPostSchema.safeParse(input);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  // Perform operation
  const { data, error } = await supabase
    .from('posts')
    .insert({
      ...validated.data,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    console.error('Create post error:', error);
    return { error: 'Failed to create post' };
  }

  revalidatePath('/posts');
  return { data };
}
```
Validates auth. Validates input with Zod. Handles database error. Revalidates cache. Returns typed result.
</Good>

<Bad>
```typescript
export async function createPost(data: any) {
  const supabase = await createClient();

  // No auth check!
  // No validation!
  await supabase.from('posts').insert(data);

  // No error handling!
  // No revalidation!
}
```
No auth. No validation. No error handling. Will fail silently or crash.
</Bad>

### Form with React Hook Form and Zod

<Good>
```tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPostSchema, CreatePostInput } from '@/schemas/post';
import { createPost } from '@/actions/posts';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function PostForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { status: 'draft' },
  });

  const onSubmit = async (data: CreatePostInput) => {
    setServerError(null);

    const result = await createPost(data);

    if (result.error) {
      if (typeof result.error === 'string') {
        setServerError(result.error);
      }
      return;
    }

    router.push('/posts');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {serverError && <div className="text-red-600">{serverError}</div>}

      <input {...register('title')} placeholder="Title" />
      {errors.title && <span className="text-red-500">{errors.title.message}</span>}

      <textarea {...register('content')} placeholder="Content" />
      {errors.content && <span className="text-red-500">{errors.content.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Create'}
      </button>
    </form>
  );
}
```
Client-side validation with Zod. Server error handling. Loading state. Field errors displayed.
</Good>

<Bad>
```tsx
export function PostForm() {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    // No client validation!
    await createPost({
      title: formData.get('title'),
      content: formData.get('content'),
    });

    // No error handling!
    // No loading state!
    window.location.href = '/posts';
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="title" />
      <textarea name="content" />
      <button type="submit">Create</button>
    </form>
  );
}
```
No validation. No error display. No loading state. Bad UX.
</Bad>

### List Page with Server Component

<Good>
```tsx
// app/(dashboard)/posts/page.tsx
import { getPosts } from '@/actions/posts';
import { PostsTable } from '@/components/posts-table';
import { Pagination } from '@/components/pagination';
import Link from 'next/link';

interface Props {
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default async function PostsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page ?? '1');

  const { data: posts, totalPages, error } = await getPosts({
    page,
    pageSize: 10,
    status: params.status,
  });

  if (error) {
    return <div className="text-red-600">Failed to load posts</div>;
  }

  return (
    <div>
      <div className="flex justify-between">
        <h1>Posts</h1>
        <Link href="/posts/new">Create Post</Link>
      </div>

      <PostsTable posts={posts} />
      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
```
Server-side data fetching. Error handling. Pagination. No useEffect.
</Good>

<Bad>
```tsx
'use client';

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  // No error handling!
  return <PostsTable posts={posts} />;
}
```
Client-side fetch. Loading flash. No error handling. Unnecessary API route.
</Bad>

### Delete with Confirmation

<Good>
```tsx
'use client';

import { deletePost } from '@/actions/posts';
import { useState } from 'react';

export function DeleteButton({ postId }: { postId: string }) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Delete this post? This cannot be undone.')) {
      return;
    }

    setDeleting(true);
    const result = await deletePost(postId);
    setDeleting(false);

    if (result.error) {
      alert(result.error);
    }
    // Revalidation happens in server action
  };

  return (
    <button
      onClick={handleDelete}
      disabled={deleting}
      className="text-red-600 disabled:opacity-50"
    >
      {deleting ? 'Deleting...' : 'Delete'}
    </button>
  );
}
```
Confirmation before delete. Loading state. Error feedback.
</Good>

<Bad>
```tsx
export function DeleteButton({ postId }) {
  const handleDelete = async () => {
    // No confirmation!
    await deletePost(postId);
    // No error handling!
    // No loading state!
  };

  return <button onClick={handleDelete}>Delete</button>;
}
```
No confirmation. No loading state. No error handling. Dangerous.
</Bad>

## Anti-Patterns

| Anti-Pattern | Why It Fails | What To Do Instead |
|--------------|--------------|-------------------|
| No input validation | Invalid data in database | Validate with Zod on every mutation |
| useEffect for initial data | Loading flash, extra round trip | Use Server Components |
| Ignoring error returns | Silent failures | Check error, show feedback |
| Missing revalidatePath | Stale data after mutations | Always revalidate affected paths |
| Delete without confirmation | Accidental data loss | Confirm destructive actions |

## Red Flags - STOP

If you catch yourself:
- Passing `any` typed data to database operations
- Not checking the `error` return from Supabase
- Fetching list data in useEffect
- Skipping validation "because the form has required fields"
- Not showing loading states during mutations

**ALL of these mean: STOP. Add validation and error handling before continuing.**

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "The form has HTML validation" | HTML validation is bypassed with dev tools. Validate server-side. |
| "It's just an admin panel" | Admins make mistakes too. Validate everything. |
| "Supabase validates at DB level" | DB errors are cryptic. Validate first for good UX. |
| "I'll add error handling later" | You won't. Or you'll miss cases. |
| "The error won't happen" | It will. In production. When you're sleeping. |
| "Loading states are polish" | Loading states prevent double-submits and confusion. |

## Gotchas

### RLS Must Match Your Queries

If RLS requires `user_id = auth.uid()`, you must set `user_id` on insert:

```typescript
// RLS will fail if user_id not set
await supabase.from('posts').insert({
  ...data,
  user_id: user.id, // Required for RLS
});
```

### Always Revalidate After Mutations

```typescript
import { revalidatePath } from 'next/cache';

// After create/update/delete
revalidatePath('/posts');
revalidatePath(`/posts/${id}`);
```

### Form State Preserved on Error

React Hook Form keeps values on error. Make sure you don't accidentally reset:

```typescript
const onSubmit = async (data) => {
  const result = await createPost(data);
  if (result.error) {
    // Form values preserved - user can fix and retry
    return;
  }
  // Only navigate on success
  router.push('/posts');
};
```

### Optimistic Updates Need Rollback

If using optimistic updates, handle rollback on error:

```typescript
// For non-critical UI updates only
// For critical data, wait for server confirmation
```

## Verification Checklist

Before marking CRUD feature complete:

- [ ] Database schema with proper constraints
- [ ] RLS policies for all CRUD operations
- [ ] Zod schemas for input validation
- [ ] Server actions validate input before database operations
- [ ] All database errors caught and handled
- [ ] revalidatePath called after mutations
- [ ] List page uses Server Component (no useEffect)
- [ ] Forms show field-level validation errors
- [ ] Loading states on all mutations
- [ ] Delete requires confirmation

Can't check all boxes? You have CRUD anti-patterns. Fix them.

## Integration

**Pairs well with:**
- `supabase-backend` - Database and RLS
- `typescript-strict` - Type safety
- `api-design` - REST endpoints
- `react-patterns` - Form components

**Requires:**
- Zod for validation
- Supabase for database
- React Hook Form (optional but recommended)

## References

- [React Hook Form](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

---

*This specialist follows the world-class skill pattern.*
