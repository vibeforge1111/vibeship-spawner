# Sharp Edges: Frontend Engineering

These are the frontend mistakes that ship broken experiences, kill performance, and create technical debt that haunts teams for years. Each edge represents real production incidents, accessibility lawsuits, and careers derailed by "it works on my machine."

---

## 1. The Hydration Mismatch Nightmare

**Severity:** Critical

**The Trap:**
Server renders one thing, client hydrates to another. React complains, but you suppress the warning because "it's fine in production." Except it's not. Users see flashes of wrong content, buttons don't work, and your SEO is broken because Google sees different content than users.

**Why It Happens:**
Using `Date.now()` or `Math.random()` in render. Accessing `window` or `localStorage` during initial render. Different data between server and client. Conditional rendering based on client-only state.

**The Fix:**
```tsx
// WRONG - Different on server vs client
function Component() {
  return <div>{Date.now()}</div>
}

// WRONG - window doesn't exist on server
function Component() {
  const width = window.innerWidth // Crashes on server
  return <div>{width}</div>
}

// RIGHT - Use useEffect for client-only values
function Component() {
  const [width, setWidth] = useState<number | null>(null)

  useEffect(() => {
    setWidth(window.innerWidth)
  }, [])

  return <div>{width ?? 'Loading...'}</div>
}

// RIGHT - Use suppressHydrationWarning ONLY for intentional differences
<time suppressHydrationWarning>
  {new Date().toLocaleTimeString()}
</time>
```

**Detection Pattern:**
- Console warnings about hydration mismatches
- Content flash on initial load
- Interactive elements not responding initially

---

## 2. The useEffect Data Fetching Trap

**Severity:** High

**The Trap:**
Fetching data in useEffect works, until it doesn't. You get waterfalls (component renders, then fetches, then child renders, then child fetches). Race conditions when props change faster than fetches complete. Memory leaks when components unmount mid-fetch.

**Why It Happens:**
useEffect is the hammer; every problem looks like a nail. Tutorials teach this pattern. It "works" in development where everything is fast and simple.

**The Fix:**
```tsx
// WRONG - Waterfall, race conditions, memory leaks
function UserProfile({ userId }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetch(`/api/users/${userId}`)
      .then(res => res.json())
      .then(setUser) // Memory leak if unmounted
  }, [userId]) // Race condition if userId changes quickly

  return user ? <Profile user={user} /> : <Loading />
}

// RIGHT - Use a data fetching library
function UserProfile({ userId }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  })

  if (isLoading) return <Loading />
  return <Profile user={user} />
}

// RIGHT - Use framework data loading (Next.js, Remix, etc.)
// Server components or loaders handle this properly
export async function loader({ params }) {
  return fetchUser(params.userId)
}
```

**Detection Pattern:**
- Network tab shows sequential requests instead of parallel
- Data appears in stages (waterfall visible to user)
- "Can't perform state update on unmounted component" warnings

---

## 3. The Prop Drilling Death Spiral

**Severity:** High

**The Trap:**
You pass props through 5 components that don't use them just to get data to a leaf. Every intermediate component now depends on those props. Change the prop shape and you're updating 10 files. Refactoring becomes terrifying.

**Why It Happens:**
"Context is for global state" misconception. Fear of "overusing" context. Adding one prop is easy; you don't notice the accumulation.

**The Fix:**
```tsx
// WRONG - Prop drilling
function App() {
  const user = useUser()
  return <Layout user={user} />
}
function Layout({ user }) {
  return <Sidebar user={user} />
}
function Sidebar({ user }) {
  return <UserMenu user={user} />
}
function UserMenu({ user }) {
  return <Avatar user={user} />
}

// RIGHT - Context for cross-cutting concerns
const UserContext = createContext(null)

function App() {
  const user = useUser()
  return (
    <UserContext.Provider value={user}>
      <Layout />
    </UserContext.Provider>
  )
}
function Avatar() {
  const user = useContext(UserContext)
  return <img src={user.avatar} />
}

// RIGHT - Composition (render props, children)
function Layout({ children }) {
  return <div className="layout">{children}</div>
}
function App() {
  const user = useUser()
  return (
    <Layout>
      <Sidebar>
        <UserMenu user={user} />
      </Sidebar>
    </Layout>
  )
}
```

**Detection Pattern:**
- Same prop appears in 4+ component signatures
- Intermediate components don't use the prop
- Changing prop requires touching many files

---

## 4. The Re-render Avalanche

**Severity:** High

**The Trap:**
Parent re-renders, all children re-render, React does a ton of work, performance tanks. You add memo() everywhere, but it doesn't help because you're creating new objects/functions every render.

**Why It Happens:**
Misunderstanding how React's reconciliation works. Creating new objects/arrays inline. Not understanding reference equality. Over-colocating state.

**The Fix:**
```tsx
// WRONG - New object every render breaks memo
function Parent() {
  const style = { color: 'red' } // New object every render!
  return <Child style={style} />
}
const Child = memo(({ style }) => <div style={style} />)

// RIGHT - Stable reference
const style = { color: 'red' } // Outside component

function Parent() {
  return <Child style={style} />
}

// WRONG - New function every render
function Parent() {
  return <Child onClick={() => doThing()} /> // New function!
}

// RIGHT - useCallback for stable function reference
function Parent() {
  const handleClick = useCallback(() => doThing(), [])
  return <Child onClick={handleClick} />
}

// BETTER - Lift state down, avoid needing memo at all
function Parent() {
  return <Child /> // Child manages its own click handler
}
```

**Detection Pattern:**
- React DevTools shows many components re-rendering
- Profiler shows long render times
- UI feels sluggish on interactions

---

## 5. The CSS Specificity War

**Severity:** Medium

**The Trap:**
You need to override a style. You add a class. Doesn't work. Add !important. Works! Then you need to override that. Add more !important. Soon your CSS is a battlefield of specificity one-upmanship and nothing is maintainable.

**Why It Happens:**
CSS specificity is not intuitive. Global styles leak. Third-party components have their own opinions. Quick fixes accumulate.

**The Fix:**
```css
/* WRONG - Specificity arms race */
.button { color: blue; }
.header .button { color: red; }
.header .nav .button { color: green; }
.header .nav .button.active { color: purple !important; }
/* Now how do you override .active? */

/* RIGHT - Flat specificity with BEM or similar */
.button { color: blue; }
.button--header { color: red; }
.button--nav { color: green; }
.button--active { color: purple; }

/* RIGHT - CSS Modules / Tailwind (scoped by design) */
/* Specificity wars impossible when styles are scoped */

/* RIGHT - CSS Layers (modern approach) */
@layer base, components, utilities;

@layer base {
  .button { color: blue; }
}
@layer utilities {
  .text-red { color: red; } /* Always wins over base */
}
```

**Detection Pattern:**
- Multiple !important in codebase
- Overly specific selectors (.a .b .c .d .e)
- Styles that don't apply without understanding why

---

## 6. The Bundle Size Blindness

**Severity:** High

**The Trap:**
You import a utility library. It's fine. Add another. And another. Ship a date picker. Suddenly your bundle is 2MB, mobile users wait 10 seconds for your app, and Core Web Vitals are red across the board.

**Why It Happens:**
npm install is frictionless. Tree shaking doesn't always work. Nobody checks bundle size until it's too late. "It's just one library."

**The Fix:**
```tsx
// WRONG - Import entire library
import _ from 'lodash' // 70KB
import moment from 'moment' // 290KB
import { Table } from 'antd' // 500KB+

// RIGHT - Import only what you need
import debounce from 'lodash/debounce' // 2KB

// RIGHT - Use smaller alternatives
import { format } from 'date-fns' // 13KB
// or use Intl.DateTimeFormat (0KB, built-in)

// RIGHT - Dynamic import for heavy components
const Table = lazy(() => import('./Table'))

// RIGHT - Analyze and monitor
// Add bundle analysis to CI
// Set performance budgets
// Alert when budget exceeded
```

**Detection Pattern:**
- First meaningful paint > 3 seconds on 3G
- bundle-analyzer shows unexpected large chunks
- Importing from barrel files (index.ts that re-exports everything)

---

## 7. The Accessibility Afterthought

**Severity:** Critical

**The Trap:**
You build the feature. It works great with a mouse. Ship it! Then you learn: 15% of users can't use it. Screen readers announce nonsense. Keyboard users are trapped. Lawsuit incoming.

**Why It Happens:**
Accessibility isn't in designs. Testing only with mouse. No screen reader testing. "We'll fix it later." Low priority until legal gets involved.

**The Fix:**
```tsx
// WRONG - div with click handler
<div onClick={handleClick}>Click me</div>

// RIGHT - semantic button
<button onClick={handleClick}>Click me</button>

// WRONG - image without alt
<img src="chart.png" />

// RIGHT - descriptive alt (or empty for decorative)
<img src="chart.png" alt="Sales increased 40% in Q4" />
<img src="decorative.png" alt="" role="presentation" />

// WRONG - form without labels
<input type="email" placeholder="Email" />

// RIGHT - properly labeled
<label>
  Email
  <input type="email" />
</label>

// WRONG - custom dropdown that's not keyboard accessible
<div className="dropdown" onClick={toggle}>
  {options.map(o => <div onClick={() => select(o)}>{o}</div>)}
</div>

// RIGHT - use native or accessible library
<select onChange={handleChange}>
  {options.map(o => <option key={o} value={o}>{o}</option>)}
</select>
// Or use Radix, Headless UI, etc. for custom styling
```

**Detection Pattern:**
- Can't use feature with keyboard only
- Screen reader announces "clickable" or nothing
- Missing focus indicators
- axe-core audit shows errors

---

## 8. The State Synchronization Hell

**Severity:** High

**The Trap:**
You have the same data in two places. Component state AND URL params. Local state AND server state. Form state AND validation state. They get out of sync. Bugs appear where the UI shows one thing but another thing happens.

**Why It Happens:**
Copying server data to local state. Not using URL as source of truth. Multiple components tracking the same thing independently. "I need this data here, so I'll add state."

**The Fix:**
```tsx
// WRONG - Duplicating server state locally
function UserList() {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null) // Stale!

  useEffect(() => { fetchUsers().then(setUsers) }, [])

  // selectedUser is a copy, doesn't update when users refetches
}

// RIGHT - Derive from single source
function UserList() {
  const { data: users } = useQuery({ queryKey: ['users'], queryFn: fetchUsers })
  const [selectedId, setSelectedId] = useState(null)

  const selectedUser = users?.find(u => u.id === selectedId) // Always fresh
}

// WRONG - Component state for URL-driven UI
function ProductFilters() {
  const [category, setCategory] = useState('all')
  // User can't share URL, back button doesn't work
}

// RIGHT - URL as source of truth
function ProductFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') ?? 'all'

  const setCategory = (cat) => {
    setSearchParams({ ...Object.fromEntries(searchParams), category: cat })
  }
}
```

**Detection Pattern:**
- "It shows the old data sometimes"
- Back button doesn't work as expected
- Refreshing page loses state it shouldn't lose
- Same data fetched in multiple components

---

## 9. The "Works in Chrome" Fallacy

**Severity:** High

**The Trap:**
You develop in Chrome. Test in Chrome. Ship. Users on Safari report it's completely broken. Mobile users can't scroll. Firefox users see wrong fonts. Edge cases in every browser you didn't test.

**Why It Happens:**
Chrome's devtools are best. Safari/Firefox/Edge usage seems low. "Who uses Safari anyway?" (Answer: every iPhone user.) Testing is tedious.

**The Fix:**
```
Cross-Browser Testing Checklist:

Must test in:
□ Chrome (latest)
□ Safari (desktop AND iOS)
□ Firefox (latest)
□ Edge (Chromium)
□ Safari iOS (in-app browsers differ!)

Common issues:
Safari:
- Date parsing differs ('2024-01-01' vs '2024/01/01')
- Flex gap support differs
- 100vh includes address bar (use 100dvh)
- Video autoplay restrictions

Firefox:
- Scrollbar styling limited
- Some transform behaviors differ
- Container queries support timing

iOS Safari:
- Touch events differ
- Fixed positioning quirks
- Input zoom on focus (<16px font)

Tooling:
- BrowserStack for real device testing
- Playwright for automated cross-browser
- Can I Use for feature support
```

**Detection Pattern:**
- Bug reports only from specific browsers
- CSS features without fallbacks
- Using browser APIs without feature detection

---

## 10. The Memory Leak Time Bomb

**Severity:** High

**The Trap:**
App works great for 5 minutes. After 2 hours, it's slow. After 8 hours, it crashes. Event listeners not cleaned up. Subscriptions never unsubscribed. Intervals never cleared. Memory usage grows until the tab dies.

**Why It Happens:**
Effects without cleanup. Adding listeners without removing. Closures holding references. Not testing long-running sessions.

**The Fix:**
```tsx
// WRONG - Listener never removed
useEffect(() => {
  window.addEventListener('resize', handleResize)
}, [])

// RIGHT - Cleanup on unmount
useEffect(() => {
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}, [])

// WRONG - Interval never cleared
useEffect(() => {
  setInterval(poll, 1000)
}, [])

// RIGHT - Clear interval
useEffect(() => {
  const id = setInterval(poll, 1000)
  return () => clearInterval(id)
}, [])

// WRONG - Subscription never unsubscribed
useEffect(() => {
  const sub = eventEmitter.subscribe(handler)
}, [])

// RIGHT - Unsubscribe on cleanup
useEffect(() => {
  const sub = eventEmitter.subscribe(handler)
  return () => sub.unsubscribe()
}, [])

// Detection: Chrome DevTools > Memory > Heap snapshot
// Take snapshot, do actions, take another, compare
```

**Detection Pattern:**
- Memory usage grows over time (DevTools Performance Monitor)
- "Detached DOM elements" in heap snapshot
- Slow UI after extended use

---

## 11. The Form Validation Nightmare

**Severity:** Medium

**The Trap:**
You build a form. Add validation. It validates on blur. No wait, on change. No, on submit. Actually, different fields need different timing. Error messages flash annoyingly. Form state is a maze of booleans. Submission happens twice somehow.

**Why It Happens:**
Forms are genuinely hard. Multiple sources of truth (DOM, React state, server). UX requirements conflict. Building from scratch instead of using battle-tested libraries.

**The Fix:**
```tsx
// WRONG - Manual form state management
function Form() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  // ... 10 more fields, 30 more state variables
}

// RIGHT - Use a form library
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
})

function Form() {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
    </form>
  )
}

// Form library handles:
// - Validation timing
// - Error state
// - Touched/dirty state
// - Submission state
// - Re-render optimization
```

**Detection Pattern:**
- Form component has 10+ useState calls
- Validation logic duplicated client and server
- Edge cases in form behavior (double submit, flash errors)

---

## 12. The Layout Shift Jank

**Severity:** High

**The Trap:**
Page loads. Content appears. Then an image loads and everything shifts down. An ad injects itself and the article jumps. User clicks a button but it moves as they click. Cumulative Layout Shift (CLS) tanks your Core Web Vitals.

**Why It Happens:**
Images without dimensions. Dynamically injected content. Fonts loading and changing text size. Async content pushing things around.

**The Fix:**
```tsx
// WRONG - Image without dimensions
<img src="photo.jpg" />

// RIGHT - Reserve space with dimensions
<img src="photo.jpg" width={800} height={600} />

// RIGHT - Aspect ratio for responsive
<img
  src="photo.jpg"
  style={{ aspectRatio: '4/3', width: '100%', height: 'auto' }}
/>

// WRONG - Font swap causes shift
@font-face {
  font-family: 'Fancy';
  src: url('fancy.woff2');
}

// RIGHT - font-display to control behavior
@font-face {
  font-family: 'Fancy';
  src: url('fancy.woff2');
  font-display: swap; /* Or 'optional' to prevent shift entirely */
}

// WRONG - Skeleton that's different size than content
<div className="skeleton h-10" /> /* Actual content is h-12 */

// RIGHT - Skeleton matches content dimensions
<div className="skeleton h-12" /> /* Matches actual content */

// WRONG - Injecting content above fold
{adLoaded && <Ad />} /* Pushes content down */

// RIGHT - Reserve space for async content
<div style={{ minHeight: 250 }}> /* Ad slot height */
  {adLoaded && <Ad />}
</div>
```

**Detection Pattern:**
- CLS score > 0.1 in Lighthouse
- User complains "I clicked the wrong thing"
- Content visibly jumps during page load

