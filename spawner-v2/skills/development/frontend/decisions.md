# Decisions: Frontend Engineering

Critical decision points that determine frontend architecture success.

---

## Decision 1: Framework Selection

**Context:** When starting a new frontend project or considering migration.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **React + Next.js** | Huge ecosystem, RSC, Vercel, hiring pool | Large bundle, complexity | Full-stack apps, need SSR/SSG, team knows React |
| **Vue + Nuxt** | Gentle learning curve, good DX, batteries included | Smaller ecosystem, fewer jobs | Team new to frontend, rapid prototyping |
| **Svelte + SvelteKit** | Small bundle, great perf, simple | Smaller ecosystem, less mature | Performance critical, smaller team |
| **React (SPA)** | Simpler than Next, control | No SSR/SSG by default, SEO harder | Admin dashboards, internal tools |

**Framework:**
```
Decision Tree:

Need SSR/SSG for SEO or performance?
├── Yes → Meta-framework (Next.js, Nuxt, SvelteKit)
└── No → SPA is fine

What does team know?
├── React → Next.js or React SPA
├── Vue → Nuxt or Vue SPA
├── Nothing → Vue (easiest) or Svelte (simplest)
└── Performance obsessed → SvelteKit or Solid

What's your deployment target?
├── Vercel → Next.js (best integration)
├── Cloudflare → SvelteKit or Remix
├── AWS → Any (but Next.js has good support)
└── Self-hosted → Consider complexity

Long-term considerations:
- React has most ecosystem and jobs
- Svelte has best DX and performance
- Vue is most approachable
- Solid is most performant React-like
```

**Default Recommendation:** Next.js for most projects. The ecosystem, tooling, and hiring pool make it the safe choice. Only deviate with clear reason.

---

## Decision 2: State Management Approach

**Context:** When determining how to manage application state.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **React Query + Context** | Server state separate, minimal boilerplate | Learning curve for Query | API-heavy apps, most modern apps |
| **Zustand** | Simple, flexible, small | DIY structure | Need global client state, want simplicity |
| **Redux Toolkit** | Predictable, DevTools, large apps | Boilerplate, steep learning | Large team, complex client state, need time-travel |
| **Jotai/Recoil** | Atomic, fine-grained updates | Learning curve, less ecosystem | Performance sensitive, complex derived state |

**Framework:**
```
State Categories (handle separately):

Server State (data from API):
→ React Query or SWR (always)
Handles: caching, refetch, stale, error, loading

Global UI State (theme, sidebar open, user):
→ Context (simple) or Zustand (complex)

Local UI State (form input, dropdown open):
→ useState (component) or React Hook Form (forms)

URL State (filters, pagination, selected tab):
→ useSearchParams or router state

Decision flow:

How much client state do you have?
├── Mostly server data → React Query + Context
├── Complex client state → Zustand or Redux Toolkit
└── Real-time updates → Consider Jotai

Team experience:
├── Knows Redux → Redux Toolkit
├── Wants simple → Zustand
└── Performance needs → Jotai
```

**Default Recommendation:** React Query for server state + Zustand for client state. This covers 90% of cases with minimal overhead.

---

## Decision 3: CSS/Styling Approach

**Context:** When choosing how to style your application.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Tailwind CSS** | Fast dev, consistent, no runtime | Verbose classes, learning curve | Most projects, design system, team alignment |
| **CSS Modules** | Scoped, familiar, zero runtime | More files, no dynamic styling | Simple apps, team knows CSS |
| **Styled-Components** | Dynamic, component coupling, theming | Runtime cost, SSR complexity | Highly dynamic theming, component library |
| **vanilla-extract** | Type-safe, zero runtime, theming | Build complexity | Type-safe styling, static styling needs |

**Framework:**
```
Key Factors:

Runtime cost tolerance?
├── Zero runtime → Tailwind, CSS Modules, vanilla-extract
└── Runtime OK → styled-components, Emotion

Dynamic styling needs?
├── Heavy (themes, animations) → styled-components or vanilla-extract
├── Light (variants) → Tailwind variants or CSS Modules
└── None → CSS Modules

Developer experience priority?
├── Speed → Tailwind (no context switch)
├── Type safety → vanilla-extract
├── Familiarity → CSS Modules
└── Component coupling → styled-components

Design system?
├── Building one → Tailwind + CVA or vanilla-extract
├── Using one → Match their approach
└── None → Any works

Tailwind variants for components:
import { cva } from 'class-variance-authority'

const button = cva('rounded font-medium', {
  variants: {
    intent: {
      primary: 'bg-blue-500 text-white',
      secondary: 'bg-gray-200 text-gray-900',
    },
    size: {
      sm: 'px-2 py-1 text-sm',
      md: 'px-4 py-2',
    },
  },
  defaultVariants: {
    intent: 'primary',
    size: 'md',
  },
})
```

**Default Recommendation:** Tailwind CSS. The productivity gains outweigh the learning curve. Combine with CVA for component variants.

---

## Decision 4: Component Library vs Custom

**Context:** When deciding whether to use a component library.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Headless (Radix, Headless UI)** | Full control, accessible, unstyled | Need to style everything | Custom design, accessibility critical |
| **Styled (shadcn/ui)** | Great defaults, customizable, copy-paste | Less control, Tailwind dependency | Fast development, good defaults OK |
| **Full Library (Chakra, MUI)** | Complete system, theming, consistent | Lock-in, hard to customize, bundle size | Internal tools, fast MVP, design not priority |
| **Custom Only** | Total control, no dependencies | Accessibility work, slow | Unique design, small scope |

**Framework:**
```
Decision flow:

Is design unique/custom?
├── Yes → Headless or Custom
└── No → Styled or Full Library

Is accessibility critical?
├── Yes → Headless (Radix) or Full Library (Chakra)
└── Sort of → shadcn/ui (built on Radix)

Development speed priority?
├── Very fast → Full Library
├── Fast → shadcn/ui
├── Balanced → Headless
└── Quality over speed → Custom with Headless base

Bundle size concerns?
├── Yes → Headless or shadcn/ui (tree-shakeable)
└── No → Full Library OK

Modern recommendation:
shadcn/ui = Best balance
- Built on Radix (accessible)
- Copy-paste (you own code)
- Tailwind styling (fast)
- Customizable (not locked in)
```

**Default Recommendation:** shadcn/ui for most projects. It gives you accessible components you own, styled with Tailwind, customizable without fighting a library.

---

## Decision 5: Data Fetching Pattern

**Context:** When determining how to fetch and manage server data.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **React Query** | Caching, deduplication, devtools, mature | Learning curve | Most apps, complex data needs |
| **SWR** | Simpler API, Vercel integration | Less features than Query | Simple needs, Vercel/Next.js |
| **Server Components** | No client JS, direct data access | RSC paradigm shift, Next.js specific | Next.js 13+, static/semi-static content |
| **useEffect** | Simple, no dependencies | Manual everything, bugs | Learning, very simple apps |

**Framework:**
```
React Query vs SWR:

React Query when:
- Complex cache invalidation
- Optimistic updates
- Infinite scroll
- Need mutations
- Large scale app

SWR when:
- Simpler needs
- Already using Next.js
- Prefer minimal API

Server Components when:
- Using Next.js 13+
- Content doesn't need interactivity
- Want minimal client JS
- SEO important

Pattern with Next.js 13+:
// Server Component - fetch directly
async function ProductPage({ id }) {
  const product = await db.products.find(id)
  return <ProductDetails product={product} />
}

// Client Component - React Query for interactive parts
'use client'
function AddToCart({ productId }) {
  const mutation = useMutation({
    mutationFn: () => addToCart(productId),
  })
  return <Button onClick={mutation.mutate}>Add to Cart</Button>
}
```

**Default Recommendation:** React Query for client components, Server Components for static/fetched content. Use both together.

---

## Decision 6: Form Handling Approach

**Context:** When implementing forms in your application.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **React Hook Form** | Performance, minimal re-renders, Zod integration | Learning curve | Most forms, complex validation |
| **Formik** | Mature, well documented | Re-renders on every change, slower | Legacy codebases |
| **useState** | Simple, no dependencies | Manual validation, re-render issues | Single field, trivial forms |
| **Server Actions** | No client state, progressive enhancement | Next.js specific, new patterns | Next.js 14+, simple forms |

**Framework:**
```
Decision flow:

How complex is the form?
├── Single field → useState fine
├── Multiple fields → React Hook Form
├── Very complex (wizard, dynamic) → React Hook Form + state machine

Validation needs?
├── Complex → React Hook Form + Zod
├── Simple → React Hook Form (built-in)
└── Server-side → Server Actions

Performance sensitive?
├── Yes → React Hook Form (doesn't re-render on input)
└── No → Any works

React Hook Form + Zod setup:
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      <input {...register('password')} type="password" />
      {errors.password && <span>{errors.password.message}</span>}
      <button type="submit">Submit</button>
    </form>
  )
}
```

**Default Recommendation:** React Hook Form with Zod. The combination provides great DX, performance, and type-safe validation.

---

## Decision 7: Testing Strategy

**Context:** When establishing your frontend testing approach.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Vitest + Testing Library** | Fast, modern, good DX | Limited E2E | Unit/integration testing |
| **Playwright** | Real browser, reliable E2E | Slower, setup complexity | E2E testing, critical flows |
| **Cypress** | Great DX, visual feedback | Slower than Playwright, flaky history | E2E when DX priority |
| **Jest + Testing Library** | Mature, established | Slower than Vitest | Legacy projects |

**Framework:**
```
Testing pyramid for frontend:

Many:   Unit tests (pure functions, hooks)
        → Vitest, fast, cheap
        → Utils, calculations, formatters

Medium: Integration tests (components)
        → Testing Library, user-focused
        → Components with user interactions

Few:    E2E tests (critical paths)
        → Playwright, real browser
        → Auth flow, checkout, key journeys

Testing strategy:
1. Pure functions: Unit test everything
2. Components: Test user behavior, not implementation
3. E2E: Only critical user journeys

Don't test:
- Implementation details (state shape, method names)
- Third-party libraries
- Styles (unless visual regression)
- What the framework already tests

Test setup:
// vitest.config.ts
export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
  },
})

// Component test
test('submits form with user data', async () => {
  const onSubmit = vi.fn()
  render(<LoginForm onSubmit={onSubmit} />)

  await userEvent.type(screen.getByLabelText('Email'), 'test@test.com')
  await userEvent.type(screen.getByLabelText('Password'), 'password123')
  await userEvent.click(screen.getByRole('button', { name: 'Submit' }))

  expect(onSubmit).toHaveBeenCalledWith({
    email: 'test@test.com',
    password: 'password123',
  })
})
```

**Default Recommendation:** Vitest for unit/integration, Playwright for E2E. Skip Jest unless already using it.

---

## Decision 8: Project Structure

**Context:** When organizing your frontend codebase.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Feature-based** | Colocation, clear ownership, scalable | May duplicate, harder to share | Large apps, multiple features |
| **Type-based** | Clear separation, familiar | Files far from use, harder to delete features | Small apps, clear boundaries |
| **Hybrid** | Balance of both | Can be confusing | Most medium-large apps |

**Framework:**
```
Type-based (traditional):
src/
├── components/
│   ├── Button.tsx
│   ├── Modal.tsx
│   └── ...
├── hooks/
│   ├── useAuth.ts
│   └── ...
├── utils/
├── types/
└── pages/

Feature-based:
src/
├── features/
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api.ts
│   │   └── types.ts
│   ├── dashboard/
│   │   └── ...
│   └── settings/
├── shared/
│   ├── components/
│   ├── hooks/
│   └── utils/
└── pages/

Hybrid (recommended):
src/
├── app/              # Routes (Next.js app router)
├── features/         # Feature modules
│   ├── auth/
│   ├── products/
│   └── checkout/
├── components/       # Shared UI components
│   ├── ui/          # Primitives (Button, Input)
│   └── layout/      # Layout components
├── lib/             # Shared utilities
│   ├── api.ts
│   └── utils.ts
├── hooks/           # Shared hooks
└── types/           # Shared types

Rules:
- Feature can import from shared, not other features
- Shared cannot import from features
- Delete feature = delete folder
```

**Default Recommendation:** Hybrid structure. Features for domain logic, shared for reusable pieces. Scales well and keeps related code together.

---

## Decision 9: Monorepo vs Polyrepo

**Context:** When deciding how to organize multiple frontend projects.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Monorepo (Turborepo)** | Shared code, atomic changes, one CI | Tooling complexity, scale issues | Multiple related apps, shared design system |
| **Monorepo (Nx)** | Powerful, computation caching | Steep learning curve | Large org, many teams |
| **Polyrepo** | Simple, independent, clear boundaries | Code duplication, coordination overhead | Independent apps, separate teams |

**Framework:**
```
Decision flow:

How many apps/packages?
├── 1 → Single repo (not monorepo)
├── 2-5 → Turborepo (simpler)
└── 5+ → Nx (more features)

Shared code between apps?
├── Lots → Monorepo (share packages)
├── Some → Monorepo or npm packages
└── None → Polyrepo fine

Team structure:
├── One team, multiple apps → Monorepo
├── Multiple teams, some overlap → Monorepo with ownership
└── Independent teams → Polyrepo

Turborepo setup (simpler):
apps/
├── web/          # Main website
├── admin/        # Admin dashboard
└── docs/         # Documentation

packages/
├── ui/           # Shared component library
├── config/       # Shared configs (ESLint, TS)
└── utils/        # Shared utilities

turbo.json:
{
  "pipeline": {
    "build": { "dependsOn": ["^build"] },
    "dev": { "cache": false },
    "lint": {}
  }
}
```

**Default Recommendation:** Turborepo if you need a monorepo. It's simpler than Nx and sufficient for most use cases. Start with single repo and migrate if needed.

---

## Decision 10: Animation Library

**Context:** When implementing animations in your application.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **CSS/Tailwind** | Zero runtime, simple, performant | Limited capabilities | Simple transitions, micro-interactions |
| **Framer Motion** | Declarative, feature-rich, gestures | Large bundle (50KB+) | Complex animations, gestures, layout |
| **React Spring** | Physics-based, performant | Learning curve | Natural feeling animations |
| **GSAP** | Industry standard, powerful | Imperative, learning curve | Complex timelines, scroll effects |

**Framework:**
```
Animation needs assessment:

Micro-interactions (hover, focus, transitions)?
→ CSS/Tailwind (no library needed)

.button {
  transition: transform 150ms ease;
}
.button:hover {
  transform: scale(1.05);
}

Component mount/unmount animations?
→ Framer Motion (AnimatePresence)

<AnimatePresence>
  {isOpen && (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
    >
      Modal content
    </motion.div>
  )}
</AnimatePresence>

Layout animations (shared layout)?
→ Framer Motion (LayoutGroup)

Physics-based (springs, drag)?
→ React Spring or Framer Motion

Complex timelines, scroll-triggered?
→ GSAP

Bundle size sensitivity?
├── High → CSS only, or React Spring
└── Normal → Framer Motion fine

Default approach:
1. Start with CSS transitions
2. Add Framer Motion when needed
3. Use GSAP only for complex scroll/timelines
```

**Default Recommendation:** CSS for simple animations, Framer Motion when you need more. Don't add animation libraries preemptively.

