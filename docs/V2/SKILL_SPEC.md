# Skill Specification

> How to build skills that actually make a difference

## Philosophy

A skill is not a prompt. It's structured knowledge that makes Claude an expert in a specific domain.

**What makes a skill valuable:**
1. Knows things Claude doesn't know by default (sharp edges)
2. Catches mistakes Claude would miss (validations)
3. Makes decisions Claude would get wrong (decision guidance)
4. Knows when to hand off (boundaries)

**What makes a skill useless:**
- Generic best practices Claude already knows
- Vague advice without specifics
- No concrete patterns or anti-patterns
- No way to verify correctness

---

## Skill Types

### Core Skills
Deep expertise in a single technology.

Examples:
- `nextjs-app-router` - App Router patterns, server/client decisions
- `supabase-backend` - Auth, RLS, Edge Functions, Realtime
- `tailwind-ui` - Component patterns, responsive, dark mode
- `typescript-strict` - Types, generics, inference

### Integration Skills
Know how two technologies connect.

Examples:
- `nextjs-supabase-auth` - Full auth flow across both systems
- `server-client-boundary` - What runs where, hydration issues
- `stripe-nextjs` - Payment flow, webhooks, subscription management

### Pattern Skills
Solve a specific problem across technologies.

Examples:
- `crud-builder` - Generate full CRUD with proper patterns
- `file-upload` - Client → storage → DB reference flow
- `realtime-sync` - WebSockets, optimistic updates, conflicts

---

## Progressive Layers

Skills grow over time. Start minimal, add depth as needed.

```
LAYER 1 - Required (Day 1)
├── skill.yaml           # Identity and metadata
└── sharp-edges.md       # The gotchas (minimum 5)

LAYER 2 - Core (Week 1)  
├── patterns.md          # The right ways (minimum 3)
├── anti-patterns.md     # The wrong ways (minimum 3)
└── decisions.md         # When to choose what

LAYER 3 - Verification (Week 2+)
├── validations/
│   └── checks.yaml      # Machine-runnable checks
└── boundaries.md        # Handoffs and limitations

LAYER 4 - Polish (Month 1+)
├── templates/           # Reference implementations
├── benchmarks/          # Quality tests
└── examples/            # Real-world usage
```

**Rule:** A Layer 1 skill is useful. Don't wait for perfection.

---

## File Structure

```
skills/
  core/
    nextjs-app-router/
      skill.yaml
      sharp-edges.md
      patterns.md
      anti-patterns.md
      decisions.md
      validations/
        checks.yaml
      boundaries.md
      CHANGELOG.md
      
  integration/
    nextjs-supabase-auth/
      skill.yaml
      sharp-edges.md
      ...
      
  pattern/
    crud-builder/
      skill.yaml
      sharp-edges.md
      ...
```

---

## Layer 1: Identity (skill.yaml)

Required fields only. Keep it minimal.

```yaml
# skill.yaml

id: nextjs-app-router
name: Next.js App Router
version: 1.0.0
type: core  # core | integration | pattern

# What this skill is responsible for
owns:
  - App Router file structure and conventions
  - Server Component vs Client Component decisions
  - Route handlers and API routes
  - Server Actions
  - Metadata and SEO configuration
  - Loading and error boundaries

# What this skill explicitly doesn't handle
does_not_own:
  - Styling and CSS → tailwind-ui
  - Database operations → supabase-backend
  - Authentication logic → nextjs-supabase-auth
  - Deployment configuration → deployment-vercel
  - State management libraries → react-patterns

# When to activate this skill
triggers:
  - User is creating Next.js pages or routes
  - User is confused about server vs client components
  - User needs API endpoints or server actions
  - User is structuring a Next.js project
  - Errors mention 'use client' or hydration

# Required context for this skill to function
requires:
  - Next.js 13+ with App Router
  - React 18+

# Stack this skill assumes
stack:
  - nextjs: ">=13.0.0"
  - react: ">=18.0.0"
```

---

## Layer 1: Sharp Edges (sharp-edges.md)

The gotchas that bite. Minimum 5 to start.

```markdown
# Sharp Edges: Next.js App Router

Sharp edges are specific gotchas that Claude doesn't know by default.
Each edge represents knowledge earned through pain.

---

## 1. Async Client Components Don't Work

**Severity:** Error (code won't run)

**The Trap:**
```tsx
'use client'
async function UserProfile() {  // ❌ This will fail
  const user = await getUser()
  return <div>{user.name}</div>
}
```

**Why It Happens:**
Client Components run in the browser. React doesn't support async 
function components on the client - there's no way to suspend while 
the promise resolves.

**The Fix:**
```tsx
// Option 1: Make it a Server Component (remove 'use client')
async function UserProfile() {
  const user = await getUser()
  return <div>{user.name}</div>
}

// Option 2: Use useEffect for client-side fetching
'use client'
function UserProfile() {
  const [user, setUser] = useState(null)
  useEffect(() => {
    getUser().then(setUser)
  }, [])
  return <div>{user?.name ?? 'Loading...'}</div>
}

// Option 3: Hybrid - Server fetches, Client receives
async function UserProfileServer() {
  const user = await getUser()
  return <UserProfileClient user={user} />
}
```

**Detection Pattern:**
`'use client'` directive + `async function` component

---

## 2. Middleware Cold Start Auth Flicker

**Severity:** Subtle (works sometimes, fails mysteriously)

**Symptoms:**
- Auth redirect flashes "unauthorized" briefly, then works
- "Works in dev, flaky in production"
- "Works on second try"

**The Trap:**
```tsx
// middleware.ts
export async function middleware(req: NextRequest) {
  const supabase = createMiddlewareClient({ req, res })
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    return NextResponse.redirect('/login')  // Fires too early!
  }
}
```

**Why It Happens:**
Edge middleware cold starts. On cold start, the auth check happens 
before Supabase client fully initializes. First request fails, 
subsequent requests work because the client is warm.

**The Fix:**
```tsx
// middleware.ts
export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  // This refreshes the session and handles cold start
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
    // Add retry buffer for cold start
    const retryUrl = new URL('/auth/verify', req.url)
    retryUrl.searchParams.set('redirect', req.nextUrl.pathname)
    return NextResponse.redirect(retryUrl)
  }
  
  return res
}
```

**When to Surface:**
User mentions auth + middleware + "flashing" or "sometimes works"

---

## 3. Server Actions in Client Components Need Explicit Import

**Severity:** Error (confusing error message)

**The Trap:**
```tsx
// app/actions.ts
'use server'
export async function submitForm(data: FormData) {
  // ...
}

// app/components/Form.tsx
'use client'
import { submitForm } from '../actions'  // ❌ Won't work as expected

function Form() {
  return <form action={submitForm}>...</form>
}
```

**Why It Happens:**
Server Actions must be explicitly marked and imported correctly. 
The 'use server' directive must be at the top of the file OR 
inside the function itself.

**The Fix:**
```tsx
// app/actions.ts
'use server'  // Must be at very top, before any imports

export async function submitForm(data: FormData) {
  // This entire file is now server-only
}

// OR inline in the component file:
// app/components/Form.tsx
'use client'

async function submitForm(data: FormData) {
  'use server'  // Marks just this function as server action
  // ...
}
```

---

## 4. generateStaticParams Returns Empty in Development

**Severity:** Confusing (different behavior dev vs prod)

**The Trap:**
```tsx
// app/posts/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await getPosts()
  return posts.map(post => ({ slug: post.slug }))
}
```

In development, this runs on every request.
In production build, it runs once at build time.

**Why It Matters:**
- If `getPosts()` fails in prod build, you get zero pages
- If database isn't accessible at build time, empty array
- No error, just missing pages

**The Fix:**
```tsx
export async function generateStaticParams() {
  try {
    const posts = await getPosts()
    if (posts.length === 0) {
      console.warn('generateStaticParams: No posts found!')
    }
    return posts.map(post => ({ slug: post.slug }))
  } catch (error) {
    console.error('generateStaticParams failed:', error)
    return []  // Fallback to dynamic rendering
  }
}

// Also set dynamicParams if you want fallback behavior
export const dynamicParams = true  // Allow slugs not in generateStaticParams
```

---

## 5. Route Handlers Don't Have Access to Request Body Twice

**Severity:** Subtle (data silently missing)

**The Trap:**
```tsx
// app/api/webhook/route.ts
export async function POST(req: Request) {
  const rawBody = await req.text()  // Read once for signature
  const body = await req.json()      // ❌ Empty! Already consumed
}
```

**Why It Happens:**
Request body is a stream. Once read, it's consumed. 
Can't read it twice.

**The Fix:**
```tsx
export async function POST(req: Request) {
  const rawBody = await req.text()
  const body = JSON.parse(rawBody)  // Parse the string you already have
  
  // Now you have both rawBody (for signature) and body (for data)
}
```

---

## Adding New Sharp Edges

When you discover a new gotcha:

1. Did it take more than 10 minutes to figure out?
2. Would Claude's default knowledge miss this?
3. Will other users hit this?

If yes to all three, document it here.

Format:
- **Severity:** Error | Warning | Subtle
- **The Trap:** Code that looks right but isn't
- **Why It Happens:** The underlying cause
- **The Fix:** Working solution with code
- **Detection Pattern:** How to spot this in user's code (optional)
- **When to Surface:** Signals that this edge is relevant (optional)
```

---

## Layer 2: Patterns (patterns.md)

The right way to do things. With code.

```markdown
# Patterns: Next.js App Router

## 1. Server Component Data Fetching

**When to Use:**
- Displaying data that doesn't need interactivity
- Data that can be fetched at request time
- SEO-important content

**The Pattern:**
```tsx
// app/products/page.tsx

// No 'use client' - this is a Server Component by default
export default async function ProductsPage() {
  // Fetch directly - no useEffect, no loading state needed
  const products = await db.products.findMany({
    orderBy: { createdAt: 'desc' }
  })
  
  // Handle empty state
  if (products.length === 0) {
    return <EmptyState message="No products yet" />
  }
  
  return (
    <div>
      <h1>Products</h1>
      <ProductList products={products} />
    </div>
  )
}
```

**Why This Works:**
- Runs on server, so direct database access
- No waterfall - data fetched before render
- No loading flash - HTML includes data
- Automatic request deduplication

---

## 2. Client Component with Server Data

**When to Use:**
- Need interactivity (clicks, forms, state)
- But also need server data

**The Pattern:**
```tsx
// app/dashboard/page.tsx (Server Component)
export default async function DashboardPage() {
  const user = await getUser()
  const initialTasks = await getTasks(user.id)
  
  // Pass server data to client component
  return <TaskManager user={user} initialTasks={initialTasks} />
}

// app/dashboard/TaskManager.tsx (Client Component)
'use client'

interface Props {
  user: User
  initialTasks: Task[]
}

export function TaskManager({ user, initialTasks }: Props) {
  const [tasks, setTasks] = useState(initialTasks)
  
  const addTask = async (title: string) => {
    // Optimistic update
    const tempTask = { id: 'temp', title, completed: false }
    setTasks(prev => [...prev, tempTask])
    
    // Server action
    const newTask = await createTask(user.id, title)
    setTasks(prev => prev.map(t => t.id === 'temp' ? newTask : t))
  }
  
  return (/* interactive UI */)
}
```

**Why This Works:**
- Initial render has data (no loading flash)
- Client component handles interactivity
- Clear separation of concerns

---

## 3. Loading and Error Boundaries

**When to Use:**
- Any page that fetches data
- Anywhere you want graceful degradation

**The Pattern:**
```
app/
  dashboard/
    page.tsx        # The actual page
    loading.tsx     # Shows while page.tsx is fetching
    error.tsx       # Shows if page.tsx throws
    layout.tsx      # Wraps all of the above
```

```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <DashboardSkeleton />
}

// app/dashboard/error.tsx
'use client'  // Error boundaries must be client components

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

**Why This Works:**
- Automatic streaming with Suspense
- Errors contained to boundary
- User always sees something

---

## 4. Route Handlers for APIs

**When to Use:**
- External webhooks (Stripe, etc)
- Public API endpoints
- When you need full Request/Response control

**The Pattern:**
```tsx
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(req: Request) {
  const body = await req.text()
  const signature = headers().get('stripe-signature')!
  
  let event: Stripe.Event
  
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed')
    return new Response('Invalid signature', { status: 400 })
  }
  
  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutComplete(event.data.object)
      break
    // ... other events
  }
  
  return new Response('OK', { status: 200 })
}
```

**Why This Works:**
- Full control over request/response
- Can read raw body for signatures
- Proper error handling with status codes
```

---

## Layer 2: Anti-Patterns (anti-patterns.md)

The wrong ways. What to catch and fix.

```markdown
# Anti-Patterns: Next.js App Router

## 1. useEffect for Server-Fetchable Data

**The Mistake:**
```tsx
'use client'

export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data)
        setLoading(false)
      })
  }, [])
  
  if (loading) return <Spinner />
  return <ProductList products={products} />
}
```

**Why It's Wrong:**
- Waterfall: HTML → JS → fetch → render
- Loading flash on every page load
- No SEO (empty HTML until JS loads)
- Extra API route needed

**The Fix:**
```tsx
// Remove 'use client', fetch directly
export default async function Products() {
  const products = await db.products.findMany()
  return <ProductList products={products} />
}
```

**When It's Actually OK:**
- Data changes frequently (real-time)
- User-specific data after interaction
- Infinite scroll / pagination

---

## 2. Putting 'use client' at the Top of Every File

**The Mistake:**
```tsx
'use client'  // "Just to be safe"

export default function Header() {
  return (
    <header>
      <Logo />
      <Navigation />
    </header>
  )
}
```

**Why It's Wrong:**
- Opts out of server rendering benefits
- Increases JavaScript bundle size
- Loses ability to fetch data directly
- Usually unnecessary

**The Rule:**
Only add 'use client' when you USE client features:
- useState, useEffect, useRef
- onClick, onChange, onSubmit
- Browser APIs (window, localStorage)
- Third-party client libraries

---

## 3. Fetching in Layout Without Deduplication Awareness

**The Mistake:**
```tsx
// app/layout.tsx
export default async function RootLayout({ children }) {
  const user = await getUser()  // Fetches user
  return (
    <html>
      <body>
        <Header user={user} />
        {children}  {/* Page might also fetch user */}
      </body>
    </html>
  )
}

// app/dashboard/page.tsx
export default async function Dashboard() {
  const user = await getUser()  // Fetches user AGAIN?
  return <DashboardContent user={user} />
}
```

**Why It's Confusing:**
React/Next.js automatically deduplicates fetch requests in the 
same render pass. But only if using fetch() or if your data 
function is properly cached.

**The Fix:**
```tsx
// lib/data.ts
import { cache } from 'react'

export const getUser = cache(async () => {
  const session = await getSession()
  if (!session) return null
  return db.users.findUnique({ where: { id: session.userId } })
})

// Now both layout and page can call getUser() - only one DB query
```

---

## 4. Mixing Server and Client Code in Same File

**The Mistake:**
```tsx
// This file tries to do everything
import { db } from '@/lib/db'  // Server-only!

'use client'  // But this makes it client!

export default function UserProfile() {
  const user = await db.users.findFirst()  // 💥 db doesn't exist on client
  return <div>{user.name}</div>
}
```

**Why It Breaks:**
'use client' means this code runs in browser.
Database clients, file system, etc. don't exist there.

**The Fix:**
Separate server and client concerns:
```tsx
// app/profile/page.tsx (Server)
import { db } from '@/lib/db'
import { ProfileEditor } from './ProfileEditor'

export default async function ProfilePage() {
  const user = await db.users.findFirst()
  return <ProfileEditor user={user} />
}

// app/profile/ProfileEditor.tsx (Client)
'use client'

export function ProfileEditor({ user }: { user: User }) {
  const [name, setName] = useState(user.name)
  // Client-side interactivity here
}
```
```

---

## Layer 2: Decisions (decisions.md)

When to choose what.

```markdown
# Decision Guide: Next.js App Router

## Server Component vs Client Component

```
START: Does this component need...?

├─ useState or useEffect?
│  └─ YES → Client Component
│  
├─ onClick, onChange, or event handlers?
│  └─ YES → Client Component
│
├─ Browser APIs (window, localStorage, navigator)?
│  └─ YES → Client Component
│
├─ Third-party client library (e.g., chart library, drag-drop)?
│  └─ YES → Client Component
│
└─ None of the above?
   └─ Server Component (default, no directive needed)
```

**When Unclear:**
Start with Server Component. Add 'use client' when you hit an error 
that says you need it. Don't preemptively add it.

---

## Route Handler vs Server Action

```
START: What are you building?

├─ External webhook (Stripe, GitHub, etc)?
│  └─ Route Handler (need raw request access)
│
├─ Public API for external consumers?
│  └─ Route Handler (REST conventions)
│
├─ Form submission from your own UI?
│  └─ Server Action (simpler, progressive enhancement)
│
├─ Mutation triggered by button click?
│  └─ Server Action (direct function call)
│
└─ Need full Request/Response control?
   └─ Route Handler
```

**Rule of Thumb:**
- Internal mutations → Server Actions
- External integrations → Route Handlers

---

## Static vs Dynamic Rendering

```
START: How often does this data change?

├─ Never (marketing pages, docs)?
│  └─ Static (generateStaticParams)
│
├─ Per-user (dashboard, profile)?
│  └─ Dynamic (no caching)
│
├─ Rarely (blog posts, product pages)?
│  └─ Static with revalidation (revalidate: 3600)
│
├─ Frequently (stock prices, live scores)?
│  └─ Dynamic + client-side updates
│
└─ Unknown?
   └─ Start dynamic, optimize later
```

**The Escape Hatch:**
```tsx
// Force dynamic when you need it
export const dynamic = 'force-dynamic'

// Force static when you're sure
export const dynamic = 'force-static'
```
```

---

## Layer 3: Validations (validations/checks.yaml)

Machine-runnable checks.

```yaml
# validations/checks.yaml

checks:
  # --- CRITICAL (block shipping) ---
  
  - id: async-client-component
    name: "Async Client Component"
    severity: critical
    type: pattern
    
    pattern:
      # Match 'use client' followed by async function component
      regex: "'use client'[\\s\\S]{0,500}async\\s+(function\\s+[A-Z]|const\\s+[A-Z]\\w*\\s*=\\s*async)"
      files: ["**/*.tsx", "**/*.jsx"]
    
    message: |
      Client Components cannot be async. Found async component in a 'use client' file.
      
      Fix: Either remove 'use client' (make it a Server Component) or use useEffect 
      for data fetching.
    
    auto_fix: false  # Needs human decision
    
  - id: hardcoded-env-vars
    name: "Hardcoded Environment Variables"
    severity: critical
    type: pattern
    
    pattern:
      regexes:
        - "SUPABASE_SERVICE_ROLE[_KEY]*\\s*[:=]\\s*['\"][^'\"]{20,}['\"]"
        - "STRIPE_SECRET_KEY\\s*[:=]\\s*['\"]sk_live_[^'\"]+['\"]"
        - "OPENAI_API_KEY\\s*[:=]\\s*['\"]sk-[^'\"]+['\"]"
        - "DATABASE_URL\\s*[:=]\\s*['\"]postgres://[^'\"]+['\"]"
      files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"]
      exclude: ["**/*.example.*", "**/.env.example"]
    
    message: |
      Hardcoded secret detected. This will be exposed in your repository.
      Move to environment variable in .env.local
    
    auto_fix: false  # Security issue, needs review
    
  # --- ERROR (will break) ---
  
  - id: use-client-with-server-imports
    name: "Client Component Importing Server-Only Modules"
    severity: error
    type: import_check
    
    rule:
      in_files_with: "'use client'"
      cannot_import:
        - "server-only"
        - "@/lib/db"
        - "fs"
        - "path"
    
    message: |
      This Client Component imports server-only code. 
      Move the import to a Server Component and pass data as props.
    
  # --- WARNING (code smell) ---
  
  - id: useeffect-data-fetching
    name: "useEffect for Initial Data Fetch"
    severity: warning
    type: pattern
    
    pattern:
      # useEffect with fetch/axios and setState
      regex: "useEffect\\([^)]*\\{[^}]*fetch\\([^}]*set[A-Z]"
      files: ["**/*.tsx", "**/*.jsx"]
    
    message: |
      Consider using a Server Component for initial data fetching.
      This causes a loading flash and extra client-side JavaScript.
      
      Exception: This is fine for data that updates after initial load.
    
    auto_fix: false
    
  - id: missing-error-boundary
    name: "Page Without Error Boundary"
    severity: warning
    type: file_exists
    
    rule:
      for_each: "app/**/page.tsx"
      should_have_sibling: "error.tsx"
      max_depth: 2  # Check up to 2 directories up
    
    message: |
      This page has no error boundary. If it throws, users see a broken page.
      Create error.tsx in this directory or a parent directory.

# Validation runner configuration
config:
  # Run critical checks on every save
  always_run:
    - async-client-component
    - hardcoded-env-vars
  
  # Run full suite before shipping
  pre_ship:
    - all
  
  # Skip these in test files
  exclude_patterns:
    - "**/*.test.*"
    - "**/*.spec.*"
    - "**/__tests__/**"
```

---

## Layer 3: Boundaries (boundaries.md)

When to hand off and when to bail.

```markdown
# Boundaries: Next.js App Router

## Handoffs

### → supabase-backend
**When:**
- User needs database queries beyond basic fetch
- User needs RLS policies
- User needs realtime subscriptions
- User mentions "Supabase" + database terms

**Context to Pass:**
- Current component structure
- What data is needed
- Auth requirements

**Example Trigger:**
User: "I need the tasks to update in real-time when others add them"

Response: "Real-time updates need Supabase's subscription system. 
Let me hand this to the Supabase specialist for the subscription setup, 
then I'll help integrate it into your component."

---

### → tailwind-ui
**When:**
- User asks about styling, colors, spacing
- User wants responsive design help
- User mentions "make it look better"

**Context to Pass:**
- Component structure
- Current styling (if any)
- Design requirements

---

### → deployment-vercel
**When:**
- User mentions "deploy" or "production"
- User has environment variable questions for production
- User encounters build errors

**Context to Pass:**
- Project structure
- Environment variables needed
- Build configuration

---

## Limitations (Things I Don't Do Well)

### Pages Router
I know App Router deeply. Pages Router is different enough that I might 
give wrong advice. If user has `pages/` directory:

Response: "I see you're using Pages Router. My expertise is App Router - 
the patterns are quite different. I can try to help, but you might get 
better results from documentation or Pages Router-specific guidance."

### React Native / Expo  
Next.js patterns don't apply. Don't pretend they do.

### Non-React Frameworks
Nuxt, SvelteKit, etc. have different conventions. Acknowledge the gap.

---

## Escape Hatches

### Stuck on Server/Client Boundary
**Signal:** 3+ attempts to fix hydration or "Cannot read properties of undefined"

**Response:**
"We're going in circles on this server/client issue. Let me explain what's happening:

The core problem is: [specific issue]

Options:
1. Make it fully server-rendered (loses interactivity)
2. Make it fully client-rendered (loses SEO/initial load)
3. Split into two components (more files, cleaner separation)

I'd recommend option 3. Want me to show the split pattern?"

### Stuck on Data Fetching Pattern  
**Signal:** Multiple rewrites of the same component's data loading

**Response:**
"We've tried a few approaches here. Let me step back:

Your data needs:
- [list actual requirements]

The simplest pattern that meets those needs is: [specific recommendation]

Want me to rebuild this component fresh with that pattern?"
```

---

## Creating a New Skill

### Step 1: Research
Spend 2-4 hours building something with this technology.
Document every:
- "Wait, that's weird" moment
- Error message that took time to understand
- Thing the docs didn't mention

### Step 2: Create Layer 1
```bash
mkdir -p skills/core/my-new-skill
```

Create `skill.yaml`:
```yaml
id: my-new-skill
name: My New Skill
version: 1.0.0
type: core

owns:
  - [What this skill is responsible for]

does_not_own:
  - [What to hand off]

triggers:
  - [When to activate]
```

Create `sharp-edges.md` with minimum 5 edges.

### Step 3: Test It
Use the skill on a real task. Ask:
- Did it know something Claude alone wouldn't?
- Did it catch something useful?
- What was missing?

### Step 4: Add Layer 2
Based on what you learned, add:
- `patterns.md` (3+ patterns)
- `anti-patterns.md` (3+ anti-patterns)
- `decisions.md` (key decision points)

### Step 5: Add Verification
Create `validations/checks.yaml` for automated catches.
Create `boundaries.md` for handoffs.

### Step 6: Maintain
- Review sharp edges quarterly
- Update after major version releases
- Add community-reported edges

---

## Quality Checklist

Before a skill is "ready":

**Layer 1 (Required):**
- [ ] skill.yaml has clear owns/does_not_own
- [ ] 5+ sharp edges documented
- [ ] Each edge has concrete code examples

**Layer 2 (Expected):**
- [ ] 3+ patterns with working code
- [ ] 3+ anti-patterns with fixes
- [ ] Key decisions documented

**Layer 3 (Complete):**
- [ ] Critical validations implemented
- [ ] Handoff triggers defined
- [ ] Escape hatches documented

**Quality:**
- [ ] Dogfooded on real project
- [ ] Sharp edges are specific (not generic advice)
- [ ] Code examples actually work
- [ ] Version ranges specified where relevant
