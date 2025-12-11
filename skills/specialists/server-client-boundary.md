---
name: server-client-boundary
description: Use when deciding between Server and Client Components - enforces minimal "use client" usage, proper data flow, and composition patterns to avoid hydration errors
tags: [rsc, hydration, server-components, client-components, nextjs]
---

# Server/Client Boundary Specialist

## Overview

Server Components are the default in Next.js App Router. They run on the server, have zero JavaScript bundle impact, and can directly access databases. Client Components are for interactivity. Most components should be Server Components.

**Core principle:** Start with Server Components. Add "use client" only where you need interactivity. Push client boundaries as low as possible in the tree.

## The Iron Law

```
NO "USE CLIENT" WITHOUT GENUINE BROWSER INTERACTIVITY REQUIREMENT
```

"use client" is a one-way door. Everything imported into a client component becomes client-side code. Adding it "just in case" bloats your bundle and defeats the purpose of Server Components.

## When to Use

**Needs "use client":**
- useState, useEffect, useRef
- onClick, onChange, onSubmit handlers
- Browser APIs (window, document, localStorage)
- Context providers

**Keep as Server Component:**
- Data fetching
- Database queries
- Environment variables (non-NEXT_PUBLIC_)
- Heavy dependencies that don't need interactivity
- Static content

Thinking "I'll just add use client to be safe"? Stop. That's bundle bloat. Only add it when you have a genuine need.

## The Process

### Step 1: Start with Server Component

Every component is a Server Component by default. Don't add "use client" until you hit a wall.

### Step 2: Identify the Interactive Part

When you need interactivity, ask: does the WHOLE component need it, or just a small part?

### Step 3: Extract the Client Boundary

Move only the interactive part to a Client Component. Keep data fetching and static content in Server Components.

## Patterns

### Minimal Client Boundaries

<Good>
```tsx
// page.tsx (Server Component - fetches data)
export default async function ProductsPage() {
  const products = await db.products.findMany();

  return (
    <div>
      <h1>Products</h1>
      {products.map((product) => (
        <ProductCard key={product.id} product={product}>
          <AddToCartButton productId={product.id} />
        </ProductCard>
      ))}
    </div>
  );
}

// ProductCard.tsx (Server Component - just displays data)
function ProductCard({ product, children }) {
  return (
    <div>
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      {children}
    </div>
  );
}

// AddToCartButton.tsx (Client Component - needs onClick)
'use client';

export function AddToCartButton({ productId }: { productId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    await addToCart(productId);
    setLoading(false);
  }

  return (
    <button onClick={handleClick} disabled={loading}>
      {loading ? 'Adding...' : 'Add to cart'}
    </button>
  );
}
```
Only the button is a Client Component. Data fetching and display stay on server.
</Good>

<Bad>
```tsx
// BAD - Entire page becomes client
'use client';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(setProducts);
  }, []);

  return (
    <div>
      {products.map((product) => (
        <div key={product.id}>
          <h2>{product.name}</h2>
          <button onClick={() => addToCart(product.id)}>Add to cart</button>
        </div>
      ))}
    </div>
  );
}
```
Entire page is client-side. No SSR, loading flash, larger bundle.
</Bad>

### Composition: Server Children in Client Parent

<Good>
```tsx
// page.tsx (Server)
export default async function Dashboard() {
  const user = await getUser();
  const stats = await getStats();

  return (
    <DashboardShell>
      <ServerStats stats={stats} />
      <ServerUserInfo user={user} />
    </DashboardShell>
  );
}

// DashboardShell.tsx (Client - manages sidebar state)
'use client';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex">
      <button onClick={() => setSidebarOpen(!sidebarOpen)}>Toggle</button>
      {sidebarOpen && <Sidebar />}
      <main>{children}</main>
    </div>
  );
}
```
Children passed to Client Component can still be Server Components!
</Good>

<Bad>
```tsx
// BAD - Prop drilling server data through client components
<ClientA user={user}>
  <ClientB user={user}>
    <ClientC user={user} />
  </ClientB>
</ClientA>
```
Passing server data through many client layers. Use composition instead.
</Bad>

### Server Actions for Mutations

<Good>
```tsx
// actions.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function createPost(formData: FormData) {
  const title = formData.get('title') as string;

  await db.posts.create({ data: { title } });

  revalidatePath('/posts');
}

// Client Component using the action
'use client';

import { createPost } from './actions';

export function CreatePostForm() {
  return (
    <form action={createPost}>
      <input name="title" required />
      <button type="submit">Create post</button>
    </form>
  );
}
```
Server Action handles mutation. Form works without JavaScript.
</Good>

<Bad>
```tsx
// BAD - API route for simple mutation
// app/api/posts/route.ts
export async function POST(request: Request) {
  const { title } = await request.json();
  await db.posts.create({ data: { title } });
  return Response.json({ success: true });
}

// Client component with fetch
'use client';

async function handleSubmit(e) {
  e.preventDefault();
  await fetch('/api/posts', {
    method: 'POST',
    body: JSON.stringify({ title }),
  });
}
```
API route is unnecessary. Server Actions are simpler and more type-safe.
</Bad>

### Context Providers at Root

<Good>
```tsx
// providers.tsx
'use client';

import { ThemeProvider } from 'next-themes';
import { QueryClientProvider } from '@tanstack/react-query';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

// app/layout.tsx (Server Component)
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```
Providers are client, but children can still be Server Components.
</Good>

<Bad>
```tsx
// BAD - Making layout a client component
'use client';

export default function RootLayout({ children }) {
  return (
    <QueryClientProvider>
      <ThemeProvider>
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
```
Layout becomes client, affecting all children. Extract providers instead.
</Bad>

## Anti-Patterns

| Anti-Pattern | Why It Fails | What To Do Instead |
|--------------|--------------|-------------------|
| "use client" on page components | No SSR, loading flash | Keep pages as Server Components |
| Fetching in useEffect | Extra round trip | Use Server Components for data |
| API routes for simple mutations | Unnecessary complexity | Use Server Actions |
| Heavy libraries in client boundary | Bloats bundle | Dynamic import with ssr: false |
| Prop drilling server data | Verbose, fragile | Use composition pattern |

## Red Flags - STOP

If you catch yourself:
- Adding "use client" to a page or layout
- Using useEffect to fetch data
- Creating an API route for a form submission
- Importing a heavy library in a client component
- Passing props through 3+ levels of client components

**ALL of these mean: STOP. Re-think the boundary. Push client code down the tree.**

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "use client is easier" | Easier now, slower app later. Start server-side. |
| "I might need interactivity later" | Add it later when you actually need it. |
| "Everything is client in my old app" | That's why this approach exists. Server Components are better. |
| "Server Components are confusing" | They're simpler once you understand the boundary. |
| "I need this hook" | Only the component using the hook needs "use client". |
| "The data needs to update" | Use Server Actions + revalidatePath, not client state. |

## Gotchas

### Children of Client Components Can Be Server Components

```tsx
// ClientWrapper.tsx
'use client';
export function ClientWrapper({ children }) {
  return <div onClick={handleClick}>{children}</div>;
}

// page.tsx (Server)
<ClientWrapper>
  <ServerContent /> {/* Still runs on server! */}
</ClientWrapper>
```

### "use client" Creates a Boundary, Not a Type

Everything IMPORTED into a "use client" file becomes client-side code:

```tsx
// BAD - Heavy library in client boundary
'use client';
import { heavyChart } from 'heavy-chart-lib'; // All 500KB in client bundle!

// GOOD - Dynamic import
'use client';
import dynamic from 'next/dynamic';
const HeavyChart = dynamic(() => import('heavy-chart-lib'), { ssr: false });
```

### Async Components Must Be Server Components

```tsx
// GOOD - Server Component
async function ServerData() {
  const data = await getData();
  return <div>{data}</div>;
}

// BAD - Can't be async
'use client';
async function ClientData() { // Error!
  const data = await getData();
}
```

### Forms Work Differently

```tsx
// Server Component - action attribute
<form action={serverAction}>
  <button type="submit">Submit</button>
</form>

// Client Component - onSubmit handler
'use client';
<form onSubmit={(e) => {
  e.preventDefault();
  // handle
}}>
```

### Hydration Mismatches

```tsx
// BAD - Different on server and client
function Timestamp() {
  return <span>{new Date().toLocaleString()}</span>; // Different on server!
}

// GOOD - Consistent or client-only
'use client';
function Timestamp() {
  const [time, setTime] = useState<string>();
  useEffect(() => setTime(new Date().toLocaleString()), []);
  return <span>{time ?? 'Loading...'}</span>;
}
```

## Verification Checklist

Before marking boundary-related task complete:

- [ ] "use client" only on components that need interactivity
- [ ] No hydration warnings in browser console
- [ ] Data fetched on server where possible
- [ ] Server Actions used for form mutations
- [ ] Heavy libraries dynamically imported
- [ ] Props between server/client are serializable (JSON-compatible)
- [ ] No useState/useEffect for data that could be server-fetched
- [ ] Providers extracted to separate client file

Can't check all boxes? You have boundary issues. Fix them.

## Integration

**Pairs well with:**
- `nextjs-app-router` - Routing patterns
- `react-patterns` - Client component optimization
- `state-sync` - React Query hydration
- `supabase-backend` - Server-side data fetching

**Requires:**
- Next.js 13+ with App Router
- Understanding of React Server Components

## References

- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [React Server Components RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
- [Patterns for Server Components](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns)

---

*This specialist follows the world-class skill pattern.*
