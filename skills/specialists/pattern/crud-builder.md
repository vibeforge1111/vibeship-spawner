# CRUD Builder Specialist

## Identity

- **Layer**: Pattern
- **Domain**: Complete CRUD patterns with forms, validation, tables, pagination
- **Triggers**: Building data management features, admin panels, list/detail views

---

## Patterns

### Database Schema First

```sql
-- migrations/001_create_posts.sql
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Users can read their own posts
CREATE POLICY "Users can read own posts"
  ON posts FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own posts
CREATE POLICY "Users can insert own posts"
  ON posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own posts
CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts"
  ON posts FOR DELETE
  USING (auth.uid() = user_id);

-- Update trigger
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

### TypeScript Types from Database

```typescript
// types/database.ts
export interface Post {
  id: string;
  user_id: string;
  title: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

// For forms - omit auto-generated fields
export type CreatePostInput = Pick<Post, 'title' | 'content' | 'status'>;
export type UpdatePostInput = Partial<CreatePostInput>;
```

### Zod Schemas for Validation

```typescript
// schemas/post.ts
import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
});

export const updatePostSchema = createPostSchema.partial();

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
```

### Server Actions (Full CRUD)

```typescript
// actions/posts.ts
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { createPostSchema, updatePostSchema } from '@/schemas/post';

export async function getPosts(options?: {
  page?: number;
  pageSize?: number;
  status?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { data: [], count: 0 };

  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 10;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from('posts')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (options?.status) {
    query = query.eq('status', options.status);
  }

  const { data, error, count } = await query.range(offset, offset + pageSize - 1);

  if (error) throw error;

  return {
    data: data ?? [],
    count: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

export async function getPost(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

export async function createPost(input: CreatePostInput) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'Unauthorized' };
  }

  const validated = createPostSchema.safeParse(input);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  const { data, error } = await supabase
    .from('posts')
    .insert({
      ...validated.data,
      user_id: user.id,
      published_at: validated.data.status === 'published' ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/posts');
  return { data };
}

export async function updatePost(id: string, input: UpdatePostInput) {
  const supabase = await createClient();

  const validated = updatePostSchema.safeParse(input);
  if (!validated.success) {
    return { error: validated.error.flatten().fieldErrors };
  }

  const updateData: Record<string, unknown> = { ...validated.data };

  // Set published_at when publishing
  if (validated.data.status === 'published') {
    const existing = await getPost(id);
    if (existing.status !== 'published') {
      updateData.published_at = new Date().toISOString();
    }
  }

  const { data, error } = await supabase
    .from('posts')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/posts');
  revalidatePath(`/posts/${id}`);
  return { data };
}

export async function deletePost(id: string) {
  const supabase = await createClient();

  const { error } = await supabase.from('posts').delete().eq('id', id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/posts');
  return { success: true };
}
```

### List Page with Pagination

```tsx
// app/(dashboard)/posts/page.tsx
import { getPosts } from '@/actions/posts';
import { PostsTable } from '@/components/posts/posts-table';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Props {
  searchParams: Promise<{ page?: string; status?: string }>;
}

export default async function PostsPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = parseInt(params.page ?? '1');
  const status = params.status;

  const { data: posts, count, totalPages } = await getPosts({
    page,
    pageSize: 10,
    status,
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Posts</h1>
        <Link href="/posts/new">
          <Button>Create Post</Button>
        </Link>
      </div>

      <PostsTable posts={posts} />

      <Pagination currentPage={page} totalPages={totalPages} />
    </div>
  );
}
```

### Data Table Component

```tsx
// components/posts/posts-table.tsx
'use client';

import { Post } from '@/types/database';
import { deletePost } from '@/actions/posts';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

interface Props {
  posts: Post[];
}

export function PostsTable({ posts }: Props) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    setDeleting(id);
    const result = await deletePost(id);
    setDeleting(null);

    if (result.error) {
      alert(result.error);
    }
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No posts yet. Create your first post!
      </div>
    );
  }

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b">
          <th className="text-left py-3 px-4">Title</th>
          <th className="text-left py-3 px-4">Status</th>
          <th className="text-left py-3 px-4">Created</th>
          <th className="text-right py-3 px-4">Actions</th>
        </tr>
      </thead>
      <tbody>
        {posts.map((post) => (
          <tr key={post.id} className="border-b hover:bg-gray-50">
            <td className="py-3 px-4">
              <Link
                href={`/posts/${post.id}`}
                className="text-blue-600 hover:underline"
              >
                {post.title}
              </Link>
            </td>
            <td className="py-3 px-4">
              <StatusBadge status={post.status} />
            </td>
            <td className="py-3 px-4 text-gray-500">
              {new Date(post.created_at).toLocaleDateString()}
            </td>
            <td className="py-3 px-4 text-right space-x-2">
              <Link href={`/posts/${post.id}/edit`}>
                <button className="text-gray-600 hover:text-gray-900">
                  Edit
                </button>
              </Link>
              <button
                onClick={() => handleDelete(post.id)}
                disabled={deleting === post.id}
                className="text-red-600 hover:text-red-900 disabled:opacity-50"
              >
                {deleting === post.id ? 'Deleting...' : 'Delete'}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function StatusBadge({ status }: { status: Post['status'] }) {
  const colors = {
    draft: 'bg-gray-100 text-gray-800',
    published: 'bg-green-100 text-green-800',
    archived: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <span className={`px-2 py-1 rounded text-sm ${colors[status]}`}>
      {status}
    </span>
  );
}
```

### Create/Edit Form

```tsx
// components/posts/post-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPostSchema, type CreatePostInput } from '@/schemas/post';
import { createPost, updatePost } from '@/actions/posts';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Post } from '@/types/database';

interface Props {
  post?: Post;
}

export function PostForm({ post }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const isEditing = !!post;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreatePostInput>({
    resolver: zodResolver(createPostSchema),
    defaultValues: post
      ? { title: post.title, content: post.content, status: post.status }
      : { status: 'draft' },
  });

  const onSubmit = async (data: CreatePostInput) => {
    setServerError(null);

    const result = isEditing
      ? await updatePost(post.id, data)
      : await createPost(data);

    if (result.error) {
      if (typeof result.error === 'string') {
        setServerError(result.error);
      }
      return;
    }

    router.push('/posts');
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {serverError && (
        <div className="p-4 bg-red-50 text-red-600 rounded">{serverError}</div>
      )}

      <div>
        <label htmlFor="title" className="block font-medium mb-1">
          Title
        </label>
        <input
          id="title"
          {...register('title')}
          className="w-full border rounded px-3 py-2"
          placeholder="Post title"
        />
        {errors.title && (
          <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="content" className="block font-medium mb-1">
          Content
        </label>
        <textarea
          id="content"
          {...register('content')}
          rows={10}
          className="w-full border rounded px-3 py-2"
          placeholder="Write your content..."
        />
        {errors.content && (
          <p className="text-red-500 text-sm mt-1">{errors.content.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="status" className="block font-medium mb-1">
          Status
        </label>
        <select
          id="status"
          {...register('status')}
          className="w-full border rounded px-3 py-2"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {isSubmitting
            ? 'Saving...'
            : isEditing
            ? 'Update Post'
            : 'Create Post'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
```

### Create Page

```tsx
// app/(dashboard)/posts/new/page.tsx
import { PostForm } from '@/components/posts/post-form';

export default function NewPostPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Create Post</h1>
      <PostForm />
    </div>
  );
}
```

### Edit Page

```tsx
// app/(dashboard)/posts/[id]/edit/page.tsx
import { getPost } from '@/actions/posts';
import { PostForm } from '@/components/posts/post-form';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Edit Post</h1>
      <PostForm post={post} />
    </div>
  );
}
```

### Detail Page

```tsx
// app/(dashboard)/posts/[id]/page.tsx
import { getPost } from '@/actions/posts';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: Props) {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    notFound();
  }

  return (
    <article className="max-w-2xl">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{post.title}</h1>
          <p className="text-gray-500 mt-2">
            {new Date(post.created_at).toLocaleDateString()}
          </p>
        </div>
        <Link
          href={`/posts/${post.id}/edit`}
          className="px-4 py-2 border rounded hover:bg-gray-50"
        >
          Edit
        </Link>
      </div>

      <div className="prose">{post.content}</div>
    </article>
  );
}
```

---

## Anti-patterns

### No Validation

```typescript
// BAD - Trust client data
export async function createPost(data: any) {
  await supabase.from('posts').insert(data);
}

// GOOD - Always validate
export async function createPost(input: unknown) {
  const validated = createPostSchema.safeParse(input);
  if (!validated.success) return { error: validated.error };
  // ...
}
```

### Fetch in Client Component

```tsx
// BAD - Client-side fetch for initial data
'use client';
export function PostsPage() {
  const [posts, setPosts] = useState([]);
  useEffect(() => { fetchPosts().then(setPosts); }, []);
}

// GOOD - Server Component fetch
export default async function PostsPage() {
  const posts = await getPosts();
  return <PostsTable posts={posts} />;
}
```

### Missing Error Handling

```typescript
// BAD - Ignores errors
export async function deletePost(id: string) {
  await supabase.from('posts').delete().eq('id', id);
  revalidatePath('/posts');
}

// GOOD - Handle and return errors
export async function deletePost(id: string) {
  const { error } = await supabase.from('posts').delete().eq('id', id);
  if (error) return { error: error.message };
  revalidatePath('/posts');
  return { success: true };
}
```

---

## Gotchas

### 1. RLS Must Match Your Queries

If RLS policy requires `user_id = auth.uid()`, make sure you're setting `user_id` on insert.

### 2. Revalidation After Mutations

Always call `revalidatePath()` after mutations to refresh cached data.

### 3. Optimistic vs Server Updates

For critical data, wait for server confirmation. For UI state (likes, votes), use optimistic updates.

### 4. Form State on Error

React Hook Form preserves input on error by default. Make sure your form doesn't reset on server errors.

---

## Checkpoints

Before marking a CRUD feature complete:

- [ ] Database schema with proper constraints
- [ ] RLS policies for all operations
- [ ] Zod schemas for validation
- [ ] Server Actions for all CRUD operations
- [ ] List page with pagination
- [ ] Create/Edit form with validation
- [ ] Detail page
- [ ] Delete with confirmation
- [ ] Error handling throughout
- [ ] Loading states on all actions

---

## Squad Dependencies

Often paired with:
- **Core** `supabase-backend` for database setup
- **Core** `typescript-strict` for type safety
- **Integration** `api-design` for REST endpoints
- **Integration** `server-client-boundary` for component split

---

*Last updated: 2025-12-11*
