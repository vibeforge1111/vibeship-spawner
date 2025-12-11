# State Sync Specialist

## Identity

- **Tags**: `state`, `react-query`, `cache`, `optimistic-updates`, `zustand`
- **Domain**: Client/server state coordination, optimistic updates, cache invalidation
- **Use when**: State synchronization issues, stale data, optimistic UI, cache management

---

## Patterns

### Server State vs Client State

```typescript
// Server State: Data from the server that needs to stay in sync
// - User profile
// - Posts, comments
// - Subscription status
// → Use: React Query, SWR, or Server Components

// Client State: UI state that doesn't persist
// - Modal open/closed
// - Form inputs (before submission)
// - Theme preference
// → Use: useState, useReducer, Zustand, Context
```

### React Query Setup

```typescript
// lib/query-client.ts
import { QueryClient } from '@tanstack/react-query';

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Don't refetch on window focus in production
        refetchOnWindowFocus: process.env.NODE_ENV === 'development',
        // Keep data fresh for 1 minute
        staleTime: 60 * 1000,
        // Keep unused data in cache for 5 minutes
        gcTime: 5 * 60 * 1000,
        // Retry failed requests 3 times
        retry: 3,
      },
    },
  });
}

// app/providers.tsx
'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { makeQueryClient } from '@/lib/query-client';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => makeQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### Query Hooks Pattern

```typescript
// hooks/queries/use-posts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api/client';

// Query keys factory
export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (filters: PostFilters) => [...postKeys.lists(), filters] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
};

// List query
export function usePosts(filters: PostFilters = {}) {
  return useQuery({
    queryKey: postKeys.list(filters),
    queryFn: () => api.get<PaginatedResponse<Post>>('/posts', { params: filters }),
  });
}

// Detail query
export function usePost(id: string) {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => api.get<Post>(`/posts/${id}`),
    enabled: !!id, // Don't fetch if no id
  });
}

// Create mutation
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostInput) => api.post<Post>('/posts', data),
    onSuccess: () => {
      // Invalidate all post lists
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

// Update mutation
export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePostInput }) =>
      api.patch<Post>(`/posts/${id}`, data),
    onSuccess: (data, variables) => {
      // Update cache directly
      queryClient.setQueryData(postKeys.detail(variables.id), data);
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

// Delete mutation
export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => api.delete(`/posts/${id}`),
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: postKeys.detail(id) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}
```

### Optimistic Updates

```typescript
// hooks/mutations/use-toggle-like.ts
export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => api.post(`/posts/${postId}/like`),

    // Optimistically update the UI
    onMutate: async (postId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: postKeys.detail(postId) });

      // Snapshot the previous value
      const previousPost = queryClient.getQueryData<Post>(postKeys.detail(postId));

      // Optimistically update
      if (previousPost) {
        queryClient.setQueryData(postKeys.detail(postId), {
          ...previousPost,
          liked: !previousPost.liked,
          likeCount: previousPost.liked
            ? previousPost.likeCount - 1
            : previousPost.likeCount + 1,
        });
      }

      // Return context with snapshot
      return { previousPost };
    },

    // On error, roll back
    onError: (err, postId, context) => {
      if (context?.previousPost) {
        queryClient.setQueryData(postKeys.detail(postId), context.previousPost);
      }
    },

    // Always refetch after error or success
    onSettled: (_, __, postId) => {
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
    },
  });
}
```

### Server Components + Client Hydration

```typescript
// app/posts/page.tsx (Server Component)
import { createClient } from '@/lib/supabase/server';
import { PostList } from './post-list';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { makeQueryClient } from '@/lib/query-client';
import { postKeys } from '@/hooks/queries/use-posts';

export default async function PostsPage() {
  const supabase = await createClient();
  const queryClient = makeQueryClient();

  // Prefetch on server
  await queryClient.prefetchQuery({
    queryKey: postKeys.list({}),
    queryFn: async () => {
      const { data } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      return { data, pagination: { page: 1, pageSize: 20 } };
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <PostList />
    </HydrationBoundary>
  );
}

// components/post-list.tsx (Client Component)
'use client';

import { usePosts } from '@/hooks/queries/use-posts';

export function PostList() {
  // This will use the prefetched data immediately
  const { data, isLoading } = usePosts();

  if (isLoading) return <div>Loading...</div>;

  return (
    <ul>
      {data?.data.map((post) => (
        <li key={post.id}>{post.title}</li>
      ))}
    </ul>
  );
}
```

### Zustand for Client State

```typescript
// stores/ui-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'system',
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ theme: state.theme }), // Only persist theme
    }
  )
);

// Usage
function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  // ...
}
```

### Form State with React Hook Form

```typescript
// components/post-form.tsx
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreatePost } from '@/hooks/queries/use-posts';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  content: z.string().min(1, 'Content is required'),
});

type FormData = z.infer<typeof schema>;

export function PostForm({ onSuccess }: { onSuccess?: () => void }) {
  const createPost = useCreatePost();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await createPost.mutateAsync(data);
      reset();
      onSuccess?.();
    } catch (error) {
      // Error handled by mutation
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('title')} placeholder="Title" />
      {errors.title && <span>{errors.title.message}</span>}

      <textarea {...register('content')} placeholder="Content" />
      {errors.content && <span>{errors.content.message}</span>}

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Post'}
      </button>

      {createPost.error && (
        <div className="error">Failed to create post</div>
      )}
    </form>
  );
}
```

### Realtime Sync with Supabase

```typescript
// hooks/use-realtime-posts.ts
'use client';

import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { createClient } from '@/lib/supabase/client';
import { postKeys } from '@/hooks/queries/use-posts';

export function useRealtimePosts() {
  const queryClient = useQueryClient();
  const supabase = createClient();

  useEffect(() => {
    const channel = supabase
      .channel('posts-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'posts',
        },
        (payload) => {
          // Invalidate queries on any change
          queryClient.invalidateQueries({ queryKey: postKeys.all });

          // For more granular updates:
          if (payload.eventType === 'INSERT') {
            queryClient.invalidateQueries({ queryKey: postKeys.lists() });
          } else if (payload.eventType === 'UPDATE') {
            // Update specific post in cache
            const updatedPost = payload.new as Post;
            queryClient.setQueryData(
              postKeys.detail(updatedPost.id),
              updatedPost
            );
          } else if (payload.eventType === 'DELETE') {
            const deletedId = payload.old.id;
            queryClient.removeQueries({ queryKey: postKeys.detail(deletedId) });
            queryClient.invalidateQueries({ queryKey: postKeys.lists() });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, supabase]);
}

// Usage - Add to a layout or page
function PostsLayout({ children }) {
  useRealtimePosts();
  return <>{children}</>;
}
```

---

## Anti-patterns

### Mixing Server and Client State

```typescript
// BAD - Storing server data in local state
const [posts, setPosts] = useState<Post[]>([]);

useEffect(() => {
  fetchPosts().then(setPosts);
}, []);

// Updates don't sync, stale data everywhere

// GOOD - Use React Query for server state
const { data: posts } = usePosts();
// Automatic caching, deduplication, revalidation
```

### Over-Invalidating

```typescript
// BAD - Nuclear option on every mutation
onSuccess: () => {
  queryClient.invalidateQueries(); // Invalidates EVERYTHING
}

// GOOD - Targeted invalidation
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: postKeys.lists() });
}
```

### Not Handling Loading/Error States

```typescript
// BAD - Only happy path
const { data } = usePosts();
return <div>{data.map(...)}</div>; // Crashes if loading

// GOOD - Handle all states
const { data, isLoading, error } = usePosts();

if (isLoading) return <Skeleton />;
if (error) return <Error message={error.message} />;
return <div>{data.map(...)}</div>;
```

### Stale Closure in Subscriptions

```typescript
// BAD - Stale reference
useEffect(() => {
  const unsub = subscribe((newData) => {
    setData([...data, newData]); // data is always initial value!
  });
  return unsub;
}, []); // Empty deps = stale closure

// GOOD - Use functional update
useEffect(() => {
  const unsub = subscribe((newData) => {
    setData((prev) => [...prev, newData]); // Always current
  });
  return unsub;
}, []);
```

---

## Gotchas

### 1. React Query Keys Must Be Serializable

```typescript
// BAD - Function in key
useQuery({
  queryKey: ['posts', { filter: (p) => p.active }], // Won't work!
});

// GOOD - Primitive values only
useQuery({
  queryKey: ['posts', { status: 'active' }],
});
```

### 2. Mutations Don't Retry by Default

```typescript
// Queries retry 3 times, mutations don't
useMutation({
  mutationFn: createPost,
  retry: 3, // Add if you want retries
});
```

### 3. Hydration Mismatch

```typescript
// If server and client render differently:
// - Check that queryClient is created the same way
// - Ensure data isn't time-sensitive (timestamps)
// - Use suppressHydrationWarning for unavoidable mismatches
```

### 4. Infinite Loops with Dependencies

```typescript
// BAD - Object recreated every render
const filters = { page, limit };
const { data } = useQuery({
  queryKey: ['posts', filters], // New object = new query every render!
});

// GOOD - Stable reference
const { data } = useQuery({
  queryKey: ['posts', { page, limit }], // Primitives in object
});

// Or memoize
const filters = useMemo(() => ({ page, limit }), [page, limit]);
```

### 5. SSR and Client-Only State

```typescript
// Zustand with SSR needs special handling
const useStore = create(
  persist(
    (set) => ({ count: 0 }),
    {
      name: 'store',
      skipHydration: true, // Handle manually
    }
  )
);

// In component
useEffect(() => {
  useStore.persist.rehydrate();
}, []);
```

---

## Checkpoints

Before marking a state sync task complete:

- [ ] Server state uses React Query (not useState)
- [ ] Query keys follow factory pattern
- [ ] Mutations invalidate relevant queries
- [ ] Optimistic updates have rollback handling
- [ ] Loading and error states handled
- [ ] No stale closures in subscriptions
- [ ] Form state separated from server state
- [ ] Realtime subscriptions cleaned up

---

## Escape Hatches

### When React Query is too heavy
- Use SWR for simpler needs
- Server Components + revalidatePath for forms
- Direct fetch for one-off requests

### When Zustand is too simple
- Consider Jotai for atomic state
- Redux Toolkit for complex state machines
- XState for state machines with side effects

### When optimistic updates are fragile
- Skip optimistic UI for critical operations
- Show pending state instead
- Use server response as source of truth

---

## Squad Dependencies

Often paired with:
- `react-patterns` for hooks and state patterns
- `api-design` for API calls
- `server-client-boundary` for RSC patterns
- `realtime-sync` for live updates

---

*Last updated: 2025-12-11*
