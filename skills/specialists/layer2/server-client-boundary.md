# Server/Client Boundary Specialist

## Identity

- **Layer**: 2 (Integration)
- **Domain**: RSC boundaries, hydration, data flow between server/client, "use client" decisions
- **Triggers**: Hydration errors, client/server confusion, data passing issues, performance optimization

---

## Patterns

### The Boundary Mental Model

```
┌─────────────────────────────────────────────────────────────┐
│                         SERVER                              │
│  - Direct database access                                   │
│  - Environment variables (all)                              │
│  - No hooks, no events, no browser APIs                     │
│  - Can await async data                                     │
│  - Renders to HTML string                                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Serializable props only
                              │ (JSON-compatible)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT                              │
│  - useState, useEffect, useRef                              │
│  - onClick, onChange, onSubmit                              │
│  - window, document, localStorage                           │
│  - NEXT_PUBLIC_ env vars only                               │
│  - Hydrates from server HTML                                │
└─────────────────────────────────────────────────────────────┘
```

### Props Crossing the Boundary

Only JSON-serializable data can cross:

```tsx
// SERVER
async function ProductPage() {
  const product = await db.products.findUnique({ id: 1 });

  // GOOD - Serializable
  return <ProductActions product={product} />;

  // BAD - Functions can't serialize
  return <ProductActions onSave={async () => db.save()} />;
}

// CLIENT
"use client";
function ProductActions({ product }: { product: Product }) {
  // Has the serialized product data
}
```

### Composition Pattern: Server in Client Slots

```tsx
// SERVER - Parent component
async function Dashboard() {
  const user = await getUser();

  return (
    <DashboardShell
      // Pass server content as props
      sidebar={<ServerSidebar user={user} />}
      header={<ServerHeader user={user} />}
    >
      <DashboardContent />
    </DashboardShell>
  );
}

// CLIENT - Shell component
"use client";
function DashboardShell({
  sidebar,
  header,
  children,
}: {
  sidebar: React.ReactNode;
  header: React.ReactNode;
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex">
      {sidebarOpen && <aside>{sidebar}</aside>}
      <main>
        {header}
        {children}
      </main>
    </div>
  );
}
```

### Server Actions for Mutations

```tsx
// actions.ts
"use server";

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;

  await db.posts.create({ data: { title } });

  revalidatePath('/posts');
  redirect('/posts');
}

// CLIENT - Using the action
"use client";
import { createPost } from './actions';

function CreatePostForm() {
  return (
    <form action={createPost}>
      <input name="title" />
      <button type="submit">Create</button>
    </form>
  );
}
```

### Optimistic Updates with useOptimistic

```tsx
"use client";
import { useOptimistic } from 'react';

function TodoList({ todos, addTodo }) {
  const [optimisticTodos, addOptimisticTodo] = useOptimistic(
    todos,
    (state, newTodo) => [...state, { ...newTodo, pending: true }]
  );

  async function handleSubmit(formData: FormData) {
    const title = formData.get('title') as string;
    addOptimisticTodo({ id: Date.now(), title });
    await addTodo(formData);
  }

  return (
    <form action={handleSubmit}>
      <input name="title" />
      <button type="submit">Add</button>
      <ul>
        {optimisticTodos.map(todo => (
          <li key={todo.id} style={{ opacity: todo.pending ? 0.5 : 1 }}>
            {todo.title}
          </li>
        ))}
      </ul>
    </form>
  );
}
```

### Context Providers at the Boundary

```tsx
// providers.tsx
"use client";

import { ThemeProvider } from 'next-themes';
import { QueryClientProvider } from '@tanstack/react-query';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

// app/layout.tsx (SERVER)
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

---

## Anti-patterns

### Wrapping Everything in "use client"

```tsx
// BAD - Entire page becomes client
"use client";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(setProducts);
  }, []);
  // ...
}

// GOOD - Server page, client interactions
// page.tsx (SERVER)
export default async function ProductsPage() {
  const products = await db.products.findMany();
  return <ProductList products={products} />;
}

// ProductList.tsx (CLIENT - only the interactive part)
"use client";
export function ProductList({ products }) {
  const [selected, setSelected] = useState(null);
  // ...
}
```

### Prop Drilling Server Data Through Many Client Components

```tsx
// BAD - Passing user through every component
<ClientA user={user}>
  <ClientB user={user}>
    <ClientC user={user} />
  </ClientB>
</ClientA>

// GOOD - Use composition
<ClientA
  content={
    <ServerContent user={user}>
      <ClientInteraction />
    </ServerContent>
  }
/>
```

### Using useEffect for Data That Could Be Server-Fetched

```tsx
// BAD
"use client";
export function Profile({ userId }) {
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    fetch(`/api/users/${userId}`).then(r => r.json()).then(setProfile);
  }, [userId]);
}

// GOOD - If this needs to be client, use useSWR/React Query for caching
// Or better, make it a Server Component
export async function Profile({ userId }) {
  const profile = await db.users.findUnique({ where: { id: userId } });
  return <ProfileDisplay profile={profile} />;
}
```

---

## Gotchas

### 1. Children of Client Components Aren't Automatically Client

```tsx
// ClientComponent.tsx
"use client";
export function ClientComponent({ children }) {
  return <div>{children}</div>; // children can be Server Components!
}

// page.tsx (SERVER)
export default async function Page() {
  const data = await getData();
  return (
    <ClientComponent>
      <ServerContent data={data} /> {/* This is still server! */}
    </ClientComponent>
  );
}
```

### 2. "use client" Creates a Boundary, Not a Component Type

Files with "use client" mark the entry point to client territory. Everything imported INTO that file becomes part of the client bundle.

```tsx
// BAD - Heavy library in client boundary
"use client";
import { heavyChart } from 'heavy-chart-lib'; // All in client bundle!

// GOOD - Dynamic import
"use client";
import dynamic from 'next/dynamic';
const HeavyChart = dynamic(() => import('heavy-chart-lib'), { ssr: false });
```

### 3. Server Components Can't Use Client Hooks

```tsx
// This will error
async function ServerComponent() {
  const [state, setState] = useState(); // Error! No hooks in Server Components
}
```

### 4. Async Components Must Be Server Components

```tsx
// GOOD - Server Components can be async
async function ServerComponent() {
  const data = await getData();
  return <div>{data}</div>;
}

// BAD - Client Components cannot be async
"use client";
async function ClientComponent() { // Error!
  const data = await getData();
}
```

### 5. Forms Work Differently

```tsx
// SERVER - Native form with Server Action
<form action={serverAction}>
  <button type="submit">Submit</button>
</form>

// CLIENT - Need onSubmit handler
"use client";
<form onSubmit={(e) => {
  e.preventDefault();
  // handle submission
}}>
```

---

## Checkpoints

Before marking a boundary-related task complete:

- [ ] "use client" only where necessary (interactive components)
- [ ] No hydration warnings in browser console
- [ ] Data fetched on server where possible
- [ ] Server Actions used for mutations (not API routes)
- [ ] Heavy libraries dynamically imported
- [ ] Props between server/client are serializable
- [ ] No useState/useEffect for static data

---

## Escape Hatches

### When hydration errors won't resolve
1. Check for browser-only values (Date, Math.random)
2. Look for conditional rendering differences
3. Use `suppressHydrationWarning` as last resort
4. Move to `dynamic(..., { ssr: false })`

### When client-only is simpler
- Real-time collaboration features
- Complex drag-and-drop
- Canvas/WebGL rendering

### When to use API routes instead of Server Actions
- Need to call from non-React client
- Complex streaming responses
- Third-party webhooks

---

## Squad Dependencies

Often paired with:
- **Layer 1**: `nextjs-app-router` for routing patterns
- **Layer 1**: `react-patterns` for client optimization
- **Layer 2**: `nextjs-supabase-auth` for auth at boundary
- **Layer 2**: `state-sync` for real-time state

---

*Last updated: 2025-12-11*
