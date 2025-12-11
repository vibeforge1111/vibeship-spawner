# Next.js App Router Specialist

## Identity

- **Layer**: Core
- **Domain**: App Router patterns, Server/Client components, routing, layouts
- **Triggers**: Any Next.js 13+ project, routing tasks, page creation, layout setup

---

## Patterns

### Server Components (Default)

Server Components are the default in App Router. Use them for:

```tsx
// app/products/page.tsx - Server Component (default)
async function ProductsPage() {
  // Direct database/API access - no useEffect needed
  const products = await db.products.findMany();

  return (
    <ul>
      {products.map(p => <li key={p.id}>{p.name}</li>)}
    </ul>
  );
}

export default ProductsPage;
```

### Client Components

Add `"use client"` only when you NEED:
- Event handlers (onClick, onChange)
- useState, useEffect, useRef
- Browser APIs (window, document)

```tsx
// components/AddToCart.tsx
"use client";

import { useState } from 'react';

export function AddToCart({ productId }: { productId: string }) {
  const [adding, setAdding] = useState(false);

  const handleClick = async () => {
    setAdding(true);
    await addToCart(productId);
    setAdding(false);
  };

  return (
    <button onClick={handleClick} disabled={adding}>
      {adding ? 'Adding...' : 'Add to Cart'}
    </button>
  );
}
```

### Layout Pattern

```tsx
// app/layout.tsx - Root layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
```

### Loading States

```tsx
// app/products/loading.tsx
export default function Loading() {
  return <ProductsSkeleton />;
}
```

### Error Handling

```tsx
// app/products/error.tsx
"use client"; // Error components must be client components

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

### Route Groups

```
app/
  (marketing)/
    page.tsx          # / - marketing landing
    about/page.tsx    # /about
  (app)/
    dashboard/page.tsx # /dashboard - app section
    layout.tsx         # Shared app layout
```

### Parallel Routes

```tsx
// app/@modal/(.)products/[id]/page.tsx - Intercepted modal
export default function ProductModal({ params }: { params: { id: string } }) {
  return <Modal><ProductDetails id={params.id} /></Modal>;
}
```

### Server Actions

```tsx
// app/actions.ts
"use server";

import { revalidatePath } from 'next/cache';

export async function createProduct(formData: FormData) {
  const name = formData.get('name') as string;
  await db.products.create({ data: { name } });
  revalidatePath('/products');
}

// Usage in Server Component
<form action={createProduct}>
  <input name="name" />
  <button type="submit">Create</button>
</form>
```

---

## Anti-patterns

### Adding "use client" everywhere

```tsx
// BAD - Don't do this
"use client";
export default function ProductCard({ product }) {
  // No interactivity, no hooks - doesn't need "use client"
  return <div>{product.name}</div>;
}

// GOOD - Let it be a Server Component
export default function ProductCard({ product }) {
  return <div>{product.name}</div>;
}
```

### Fetching in useEffect

```tsx
// BAD - Old pattern
"use client";
export default function Products() {
  const [products, setProducts] = useState([]);
  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(setProducts);
  }, []);
  // ...
}

// GOOD - Server Component
export default async function Products() {
  const products = await db.products.findMany();
  // ...
}
```

### Passing functions to Client Components

```tsx
// BAD - Can't serialize functions
<ClientComponent onSubmit={async () => { await db.save() }} />

// GOOD - Use Server Actions
<ClientComponent action={serverAction} />
```

### Nesting Client in Server after Server

```tsx
// BAD - Once you go client, children are client
<ServerComponent>
  <ClientComponent>
    <AnotherServerComponent /> // This is actually client!
  </ClientComponent>
</ServerComponent>

// GOOD - Pass server component as prop
<ClientComponent serverSlot={<ServerComponent />} />
```

---

## Gotchas

### 1. Hydration Mismatches

Server and client must render the same initial HTML.

```tsx
// BAD - Date differs between server and client
export default function Page() {
  return <div>{new Date().toLocaleString()}</div>;
}

// GOOD - Render on client only
"use client";
export default function Page() {
  const [date, setDate] = useState<string>();
  useEffect(() => setDate(new Date().toLocaleString()), []);
  return <div>{date ?? 'Loading...'}</div>;
}
```

### 2. Environment Variables

```tsx
// Server Component - Can access all env vars
const apiKey = process.env.SECRET_API_KEY; // Works

// Client Component - Only NEXT_PUBLIC_ vars
const publicKey = process.env.NEXT_PUBLIC_APP_ID; // Works
const secretKey = process.env.SECRET_KEY; // undefined!
```

### 3. Metadata Must Be in Server Components

```tsx
// app/products/[id]/page.tsx
export async function generateMetadata({ params }) {
  const product = await getProduct(params.id);
  return { title: product.name };
}
```

### 4. cookies() and headers() Make Route Dynamic

```tsx
import { cookies } from 'next/headers';

export default async function Page() {
  const cookieStore = cookies();
  // This page is now dynamically rendered (not cached)
}
```

### 5. Parallel Data Fetching

```tsx
// BAD - Sequential
const user = await getUser();
const posts = await getPosts();

// GOOD - Parallel
const [user, posts] = await Promise.all([getUser(), getPosts()]);
```

---

## Checkpoints

Before marking a Next.js App Router task complete:

- [ ] Server Components used by default (no unnecessary "use client")
- [ ] Loading states exist for async pages
- [ ] Error boundaries in place for user-facing pages
- [ ] Metadata defined for SEO-important pages
- [ ] No hydration mismatch warnings in console
- [ ] Environment variables properly prefixed (NEXT_PUBLIC_ for client)
- [ ] Data fetching parallelized where possible
- [ ] Route segments properly organized (groups, layouts)

---

## Escape Hatches

### When to use Pages Router instead
- Need getServerSideProps with specific caching control
- Team more familiar with Pages Router patterns
- Migrating incrementally from Pages Router

### When to skip Server Components
- Real-time features that need WebSocket state
- Complex client-side animations
- Heavy use of browser APIs

### When RSC is causing issues
- Hydration errors you can't resolve
- Build times becoming too long
- Bundle size concerns with large Server Components

If stuck on RSC patterns for > 30 minutes, consider:
1. Move to Client Component (simpler, works)
2. Use route handlers for data (API routes)
3. Check Next.js examples repo for the pattern

---

## Squad Dependencies

Often paired with:
- **Integration** `server-client-boundary` for complex patterns
- **Integration** `nextjs-supabase-auth` for auth flows
- **Core** `react-patterns` for client component optimization
- **Core** `typescript-strict` for type safety

---

*Last updated: 2025-12-11*
