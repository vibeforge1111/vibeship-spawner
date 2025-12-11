---
name: nextjs-app-router
description: Use when building Next.js 13+ applications - enforces Server Component defaults, proper client boundaries, and eliminates unnecessary "use client" directives
tags: [nextjs, routing, rsc, layouts, app-router]
---

# Next.js App Router Specialist

## Overview

Next.js App Router uses Server Components by default. Fighting this model by adding "use client" everywhere destroys performance and creates hydration bugs. Work with the model, not against it.

**Core principle:** Server Components are the default. Only add "use client" when you genuinely need browser interactivity.

## The Iron Law

```
NO "USE CLIENT" WITHOUT GENUINE BROWSER INTERACTIVITY REQUIREMENT
```

Every "use client" directive should exist because the component NEEDS: event handlers, hooks that require client state, or browser APIs. Display-only components should never be client components.

## When to Use

**Always:**
- Creating new pages or layouts
- Adding data fetching
- Deciding where to place component boundaries
- Implementing loading/error states
- Setting up Server Actions

**Don't:**
- Pages Router projects (different patterns)
- Static HTML-only sites (overkill)
- Components that don't need App Router features

Thinking "I'll add 'use client' to make it work"? Stop. That's avoiding the real problem.

## The Process

### Step 1: Start with Server Components

Every component defaults to Server Component. Only consider "use client" when you hit a wall.

```tsx
// Default - Server Component
async function ProductPage({ params }: { params: { id: string } }) {
  const product = await db.products.findUnique({ where: { id: params.id } });
  return <ProductDetails product={product} />;
}
```

### Step 2: Identify True Client Needs

Ask: Does this component need to respond to user events OR maintain client state OR access browser APIs?

- Yes → Add "use client"
- No → Keep as Server Component

### Step 3: Push Client Boundary Down

Don't make a whole page client. Extract the interactive part into a small client component.

```tsx
// Server Component page
export default async function ProductPage({ params }) {
  const product = await getProduct(params.id);
  return (
    <div>
      <h1>{product.name}</h1>
      <p>{product.description}</p>
      <AddToCartButton productId={product.id} /> {/* Only this is client */}
    </div>
  );
}
```

## Patterns

### Server Component Data Fetching

<Good>
```tsx
// app/products/page.tsx - Server Component (default)
export default async function ProductsPage() {
  // Direct database access - no API route, no useEffect
  const products = await db.products.findMany();

  return (
    <ul>
      {products.map(p => <ProductCard key={p.id} product={p} />)}
    </ul>
  );
}
```
Direct data access. No loading state needed at component level. Fast initial render.
</Good>

<Bad>
```tsx
"use client";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/products')
      .then(r => r.json())
      .then(data => {
        setProducts(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <Spinner />;
  return <ul>{products.map(p => <ProductCard key={p.id} product={p} />)}</ul>;
}
```
Extra round trip. Loading flash. Unnecessary client JavaScript. Worse SEO.
</Bad>

### Client Component Boundaries

<Good>
```tsx
// Server Component
export default async function DashboardPage() {
  const stats = await getStats();

  return (
    <div>
      <h1>Dashboard</h1>
      <StatsDisplay stats={stats} />        {/* Server - display only */}
      <InteractiveChart data={stats.chart} /> {/* Client - needs interactivity */}
    </div>
  );
}

// components/InteractiveChart.tsx
"use client";
import { useState } from 'react';

export function InteractiveChart({ data }) {
  const [zoom, setZoom] = useState(1);
  return <canvas onClick={() => setZoom(z => z + 0.1)} />;
}
```
Server for data, client only for the interactive chart. Minimal client bundle.
</Good>

<Bad>
```tsx
"use client"; // Everything is client now!

export default function DashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch('/api/stats').then(r => r.json()).then(setStats);
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <StatsDisplay stats={stats} />
      <InteractiveChart data={stats?.chart} />
    </div>
  );
}
```
Whole page is client. More JavaScript shipped. Slower initial load. No server-side rendering.
</Bad>

### Server Actions for Mutations

<Good>
```tsx
// app/actions.ts
"use server";

import { revalidatePath } from 'next/cache';

export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string;

  await db.products.create({ data: { name } });
  revalidatePath('/products');
}

// In Server Component
<form action={createProduct}>
  <input name="name" required />
  <button type="submit">Create</button>
</form>
```
Progressive enhancement. Works without JavaScript. Direct database mutation.
</Good>

<Bad>
```tsx
"use client";

export default function CreateProduct() {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    await fetch('/api/products', {
      method: 'POST',
      body: JSON.stringify({ name: formData.get('name') }),
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" />
      <button type="submit">Create</button>
    </form>
  );
}
```
Requires JavaScript. Extra API route. Manual revalidation. More code.
</Bad>

### Composition with Server Children

<Good>
```tsx
// Client component that accepts server component as child
"use client";

export function Modal({ children, trigger }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>{trigger}</button>
      {open && <div className="modal">{children}</div>}
    </>
  );
}

// Usage - server component passed as child
<Modal trigger="View Details">
  <ProductDetails product={product} /> {/* This stays a Server Component! */}
</Modal>
```
Server component stays server. Only Modal logic runs on client.
</Good>

<Bad>
```tsx
// Server Component rendered inside Client after client boundary
"use client";

export function ProductPage() {
  return (
    <ClientWrapper>
      <ServerComponent /> {/* WRONG: This is actually a client component now! */}
    </ClientWrapper>
  );
}
```
Once inside client boundary, children become client too. Import chain matters.
</Bad>

## Anti-Patterns

| Anti-Pattern | Why It Fails | What To Do Instead |
|--------------|--------------|-------------------|
| "use client" on display components | Ships unnecessary JS, worse performance | Keep as Server Component |
| useEffect for initial data | Extra round trip, loading flash | Use async Server Component |
| API routes for Server Component data | Unnecessary hop | Query database directly |
| Whole page as client | Kills SSR benefits | Extract small interactive parts |
| Passing functions to client | Can't serialize | Use Server Actions |

## Red Flags - STOP

If you catch yourself:
- Adding "use client" to fix an error without understanding why
- Using useEffect + useState for data that could be fetched on server
- Creating API routes just to fetch data for Server Components
- Making a whole page/layout a client component
- Fighting hydration errors by making more things client

**ALL of these mean: STOP. Re-examine component boundaries. Push "use client" to smallest possible scope.**

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "It's easier to just add 'use client'" | It's technical debt. Server Components exist for good reasons. |
| "I need useEffect for data" | No you don't. async Server Components fetch directly. |
| "Client components are what I know" | App Router requires learning Server Components. Adapt. |
| "Hydration errors are hard to debug" | Usually caused by wrong client/server boundary. Fix the architecture. |
| "The whole page needs interactivity" | Rarely true. Identify the actual interactive elements. |
| "Server Components are slow" | They're faster. Less JS shipped to client. |

## Gotchas

### Hydration Mismatches

Server and client must render identical initial HTML.

```tsx
// BAD - Date differs between server and client
export default function Page() {
  return <div>{new Date().toLocaleString()}</div>;
}

// GOOD - Handle client-only values
"use client";
import { useState, useEffect } from 'react';

export default function Page() {
  const [date, setDate] = useState<string>();
  useEffect(() => setDate(new Date().toLocaleString()), []);
  return <div>{date ?? 'Loading...'}</div>;
}
```

### Params Are Async in Next.js 15+

```tsx
// Next.js 15+
export default async function Page({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params; // Must await!
  // ...
}
```

### cookies()/headers() Make Route Dynamic

```tsx
import { cookies } from 'next/headers';

export default async function Page() {
  const cookieStore = await cookies();
  // This page is now dynamically rendered (not statically cached)
}
```

### Environment Variables

```tsx
// Server Component - all env vars accessible
const apiKey = process.env.SECRET_API_KEY; // Works

// Client Component - only NEXT_PUBLIC_ vars
const publicKey = process.env.NEXT_PUBLIC_APP_ID; // Works
const secretKey = process.env.SECRET_KEY; // undefined!
```

## Verification Checklist

Before marking Next.js App Router work complete:

- [ ] Server Components used by default (no unnecessary "use client")
- [ ] "use client" only on components with genuine interactivity
- [ ] Data fetching done in Server Components (not useEffect)
- [ ] Loading states exist for async pages (loading.tsx)
- [ ] Error boundaries in place (error.tsx)
- [ ] Metadata defined for SEO pages
- [ ] No hydration mismatch warnings in console
- [ ] Environment variables properly prefixed
- [ ] Parallel data fetching where possible (Promise.all)

Can't check all boxes? You have App Router anti-patterns. Fix them.

## Integration

**Pairs well with:**
- `server-client-boundary` - Complex RSC patterns
- `nextjs-supabase-auth` - Authentication flows
- `react-patterns` - Client component optimization
- `typescript-strict` - Type safety

**Requires:**
- Next.js 13+ with App Router
- Understanding of Server vs Client Components

## References

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [Server Components RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md)
- [Thinking in Server Components](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns)

---

*This specialist follows the world-class skill pattern.*
