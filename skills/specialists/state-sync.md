---
name: state-sync
description: Use when managing server state or implementing optimistic updates - enforces React Query patterns, proper cache invalidation, and separation of server vs client state
tags: [state, react-query, cache, optimistic-updates, zustand]
---

# State Sync Specialist

## Overview

State is the hardest part of frontend development. Mixing server state (data from API) with client state (UI toggles) creates bugs. Stale data frustrates users. Over-fetching wastes resources.

**Core principle:** Server state belongs in React Query. Client state belongs in useState/Zustand. Never mix them.

## The Iron Law

```
NO SERVER DATA IN USESTATE - USE REACT QUERY FOR ALL REMOTE DATA
```

useState for server data means no caching, no deduplication, no automatic revalidation. When another component needs the same data, you fetch again. Use React Query for all server state.

## When to Use

**Always:**
- Fetching data from APIs
- Caching server responses
- Implementing optimistic updates
- Coordinating data across components
- Managing loading/error states

**Don't:**
- Pure UI state (modals, toggles)
- Form input values before submission
- Animation state
- Local-only preferences

Thinking "useState is simpler for this API call"? Stop. That's tech debt. React Query handles caching, deduplication, and revalidation automatically.

## The Process

### Step 1: Identify State Type

Ask: Does this data come from a server?
- Yes → React Query
- No → useState or Zustand

### Step 2: Create Query Key Factory

```typescript
export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (filters: Filters) => [...postKeys.lists(), filters] as const,
  details: () => [...postKeys.all, 'detail'] as const,
  detail: (id: string) => [...postKeys.details(), id] as const,
};
```

### Step 3: Handle All States

Always handle loading, error, and success states. Never assume data exists.

## Patterns

### Query Hooks with Key Factory

<Good>
```typescript
// Query keys factory - consistent and type-safe
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
    queryFn: () => api.get<Post[]>('/posts', { params: filters }),
  });
}

// Detail query
export function usePost(id: string) {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => api.get<Post>(`/posts/${id}`),
    enabled: !!id,
  });
}

// Create mutation with targeted invalidation
export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePostInput) => api.post<Post>('/posts', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}
```
Key factory enables targeted invalidation. Mutations only invalidate affected queries.
</Good>

<Bad>
```typescript
// Storing server data in useState
const [posts, setPosts] = useState<Post[]>([]);

useEffect(() => {
  fetchPosts().then(setPosts);
}, []);

// No caching, no deduplication, stale data everywhere
// Another component fetches the same data again
```
useState for server data means no caching, duplicate fetches, and stale data.
</Bad>

### Optimistic Updates

<Good>
```typescript
export function useToggleLike() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => api.post(`/posts/${postId}/like`),

    onMutate: async (postId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: postKeys.detail(postId) });

      // Snapshot previous value
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

      return { previousPost };
    },

    onError: (err, postId, context) => {
      // Rollback on error
      if (context?.previousPost) {
        queryClient.setQueryData(postKeys.detail(postId), context.previousPost);
      }
    },

    onSettled: (_, __, postId) => {
      // Always refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: postKeys.detail(postId) });
    },
  });
}
```
Cancels outgoing queries, snapshots for rollback, refetches on settle.
</Good>

<Bad>
```typescript
// Optimistic without rollback
onMutate: async (postId) => {
  queryClient.setQueryData(postKeys.detail(postId), (old) => ({
    ...old,
    liked: true,
  }));
  // No snapshot = no rollback on error!
},
```
No snapshot means no rollback. Errors leave UI in wrong state.
</Bad>

### Server Components + Hydration

<Good>
```tsx
// app/posts/page.tsx (Server Component)
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { makeQueryClient } from '@/lib/query-client';

export default async function PostsPage() {
  const queryClient = makeQueryClient();

  // Prefetch on server
  await queryClient.prefetchQuery({
    queryKey: postKeys.list({}),
    queryFn: async () => {
      const supabase = await createClient();
      const { data } = await supabase.from('posts').select('*');
      return data;
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

export function PostList() {
  // Uses prefetched data immediately - no loading flash
  const { data, isLoading, error } = usePosts();

  if (isLoading) return <Skeleton />;
  if (error) return <Error message={error.message} />;

  return <ul>{data?.map((post) => <li key={post.id}>{post.title}</li>)}</ul>;
}
```
Server prefetches, client hydrates. No loading flash on initial render.
</Good>

<Bad>
```tsx
// Client-only fetch = loading flash
'use client';

export function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/posts')
      .then(r => r.json())
      .then(setPosts)
      .finally(() => setLoading(false));
  }, []);

  // Always shows loading spinner on mount
}
```
Client-only fetch means loading flash on every page visit.
</Bad>

### Client State with Zustand

<Good>
```typescript
// stores/ui-store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIState {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'system';
  toggleSidebar: () => void;
  setTheme: (theme: UIState['theme']) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      theme: 'system',
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-storage',
      partialize: (state) => ({ theme: state.theme }), // Only persist theme
    }
  )
);
```
Zustand for UI state, persists only what's needed.
</Good>

<Bad>
```typescript
// Using React Query for UI state
const { data: sidebarOpen } = useQuery({
  queryKey: ['sidebar'],
  queryFn: () => localStorage.getItem('sidebar') === 'true',
});
```
React Query for local state is overkill. Use Zustand or useState.
</Bad>

### Handling All States

<Good>
```tsx
export function PostList() {
  const { data, isLoading, error, refetch } = usePosts();

  if (isLoading) {
    return <PostListSkeleton />;
  }

  if (error) {
    return (
      <ErrorState
        message="Couldn't load posts"
        action={<Button onClick={() => refetch()}>Try again</Button>}
      />
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState message="No posts yet" />;
  }

  return (
    <ul>
      {data.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </ul>
  );
}
```
Handles loading, error, empty, and success states.
</Good>

<Bad>
```tsx
export function PostList() {
  const { data } = usePosts();
  return <ul>{data.map(...)}</ul>; // Crashes if loading or error!
}
```
Not handling loading/error states causes runtime crashes.
</Bad>

## Anti-Patterns

| Anti-Pattern | Why It Fails | What To Do Instead |
|--------------|--------------|-------------------|
| Server data in useState | No caching, stale data | Use React Query |
| Nuclear invalidation | Refetches everything | Use query key factory for targeted invalidation |
| Missing loading/error states | Runtime crashes | Always handle all states |
| Stale closures in subscriptions | Updates use old values | Use functional setState |
| Object in dependency array | New reference every render | Use primitives or useMemo |

## Red Flags - STOP

If you catch yourself:
- Using useState + useEffect for API data
- Calling `queryClient.invalidateQueries()` with no arguments
- Accessing `data` without checking `isLoading` and `error`
- Creating new objects in query keys without memoization
- Mixing server data mutations with client state

**ALL of these mean: STOP. Use React Query properly with query key factory.**

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "useState is simpler" | Simpler now, tech debt later. React Query handles edge cases. |
| "I'll add caching later" | You won't. Or you'll implement it badly. Use React Query now. |
| "Invalidating everything is safe" | Safe but slow. Targeted invalidation is better UX. |
| "Data won't be stale" | Data is always stale. Handle it. |
| "It's just one component" | Other components will need the same data. They always do. |
| "Zustand can cache server data" | It can, but React Query does it better with deduplication and revalidation. |

## Gotchas

### Query Keys Must Be Serializable

```typescript
// BAD - Function in key
useQuery({ queryKey: ['posts', { filter: (p) => p.active }] });

// GOOD - Primitive values
useQuery({ queryKey: ['posts', { status: 'active' }] });
```

### Mutations Don't Retry by Default

```typescript
// Add retry if you want it
useMutation({
  mutationFn: createPost,
  retry: 3,
});
```

### Infinite Loops from Object Dependencies

```typescript
// BAD - New object every render = infinite loop
const filters = { page, limit };
useQuery({ queryKey: ['posts', filters] });

// GOOD - Primitives or memoized
useQuery({ queryKey: ['posts', { page, limit }] });
// Or
const filters = useMemo(() => ({ page, limit }), [page, limit]);
```

### Hydration Mismatch

Server and client must render the same data. Don't include timestamps or random values in initial render.

### SSR and Zustand

```typescript
// Handle SSR with skipHydration
const useStore = create(
  persist(
    (set) => ({ count: 0 }),
    { name: 'store', skipHydration: true }
  )
);

// Rehydrate in useEffect
useEffect(() => {
  useStore.persist.rehydrate();
}, []);
```

## Verification Checklist

Before marking state sync task complete:

- [ ] Server state uses React Query (not useState)
- [ ] Query keys follow factory pattern
- [ ] Mutations invalidate relevant queries only
- [ ] Optimistic updates have rollback handling
- [ ] Loading, error, and empty states handled
- [ ] No stale closures in subscriptions
- [ ] Form state separated from server state
- [ ] Hydration from Server Components where possible

Can't check all boxes? You have state issues. Fix them.

## Integration

**Pairs well with:**
- `react-patterns` - Custom hooks patterns
- `api-design` - API client setup
- `server-client-boundary` - RSC hydration
- `realtime-sync` - Live updates with invalidation

**Requires:**
- @tanstack/react-query
- Query client provider in app

## References

- [TanStack Query Documentation](https://tanstack.com/query/latest)
- [Zustand Documentation](https://zustand-demo.pmnd.rs/)
- [Practical React Query](https://tkdodo.eu/blog/practical-react-query)

---

*This specialist follows the world-class skill pattern.*
