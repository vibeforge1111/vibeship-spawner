# Patterns: Frontend Engineering

These are the proven approaches that consistently deliver maintainable, performant, and accessible frontend applications.

---

## 1. The Component Composition Pattern

**What It Is:**
Building complex UIs by composing simple, focused components rather than creating monolithic components with many props.

**When To Use:**
- Component has more than 5-7 props
- You're adding boolean props to toggle variants
- Same component used in very different contexts
- Prop drilling is happening

**The Pattern:**

```tsx
// BEFORE: Monolithic component with many props
<Card
  title="Product"
  image="/img.jpg"
  showImage={true}
  showFooter={true}
  footerContent={<Button>Buy</Button>}
  variant="horizontal"
  size="large"
  // ... 10 more props
/>

// AFTER: Composed from focused pieces
<Card variant="horizontal" size="large">
  <Card.Image src="/img.jpg" />
  <Card.Body>
    <Card.Title>Product</Card.Title>
    <Card.Description>...</Card.Description>
  </Card.Body>
  <Card.Footer>
    <Button>Buy</Button>
  </Card.Footer>
</Card>

// Implementation using compound components
const CardContext = createContext(null)

function Card({ children, variant, size }) {
  return (
    <CardContext.Provider value={{ variant, size }}>
      <div className={cn('card', variant, size)}>
        {children}
      </div>
    </CardContext.Provider>
  )
}

Card.Image = function CardImage({ src, alt }) {
  return <img src={src} alt={alt} className="card-image" />
}

Card.Body = function CardBody({ children }) {
  return <div className="card-body">{children}</div>
}

Card.Title = function CardTitle({ children }) {
  const { size } = useContext(CardContext)
  return <h3 className={cn('card-title', size)}>{children}</h3>
}

Card.Footer = function CardFooter({ children }) {
  return <div className="card-footer">{children}</div>
}
```

**Why It Works:**
Composition is infinitely flexible. Each piece has a single responsibility. Consumers only use what they need. New variants don't require new props - just new compositions.

---

## 2. The Container/Presenter Pattern

**What It Is:**
Separating data fetching and business logic (container) from pure presentation (presenter). Also known as "smart" and "dumb" components.

**When To Use:**
- Testing UI independent of data
- Reusing presentation with different data sources
- Complex data transformations before display
- Multiple data sources for same presentation

**The Pattern:**

```tsx
// Presenter: Pure presentation, no side effects
// Easy to test, storybook, reuse
function UserProfileView({ user, onFollow, isFollowing }) {
  return (
    <div className="profile">
      <Avatar src={user.avatar} />
      <h1>{user.name}</h1>
      <p>{user.bio}</p>
      <Button onClick={onFollow}>
        {isFollowing ? 'Unfollow' : 'Follow'}
      </Button>
    </div>
  )
}

// Container: Data fetching, business logic
function UserProfile({ userId }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  })

  const followMutation = useMutation({
    mutationFn: () => followUser(userId),
  })

  const { data: following } = useQuery({
    queryKey: ['following', userId],
    queryFn: () => checkFollowing(userId),
  })

  if (isLoading) return <ProfileSkeleton />

  return (
    <UserProfileView
      user={user}
      onFollow={followMutation.mutate}
      isFollowing={following}
    />
  )
}

// Now UserProfileView can be tested in isolation,
// displayed in Storybook, used with mock data,
// without any API calls or side effects.
```

**Why It Works:**
Separation of concerns makes each part simpler. Presenters are trivial to test. Containers centralize data logic. Changes to data fetching don't touch UI.

---

## 3. The Optimistic Update Pattern

**What It Is:**
Updating the UI immediately before the server confirms, then reconciling if the server responds differently.

**When To Use:**
- Actions that usually succeed (like, toggle, simple updates)
- Low-latency feel is important
- Server response doesn't change much
- You can handle rollback gracefully

**The Pattern:**

```tsx
function useLikePost(postId) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => likePost(postId),

    // Optimistically update BEFORE server responds
    onMutate: async () => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['post', postId] })

      // Snapshot previous value
      const previousPost = queryClient.getQueryData(['post', postId])

      // Optimistically update
      queryClient.setQueryData(['post', postId], (old) => ({
        ...old,
        isLiked: true,
        likeCount: old.likeCount + 1,
      }))

      // Return context with snapshot
      return { previousPost }
    },

    // If error, rollback to snapshot
    onError: (err, variables, context) => {
      queryClient.setQueryData(
        ['post', postId],
        context.previousPost
      )
      toast.error('Failed to like post')
    },

    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['post', postId] })
    },
  })
}

// Usage - feels instant
function LikeButton({ postId }) {
  const { mutate: like } = useLikePost(postId)
  return <Button onClick={() => like()}>Like</Button>
}
```

**Why It Works:**
Users experience zero latency for common actions. The UI feels native and responsive. Failures are handled gracefully with rollback.

---

## 4. The Render Props Pattern

**What It Is:**
Sharing code between components using a prop whose value is a function that returns React elements.

**When To Use:**
- Sharing stateful logic between components
- Component needs to control what's rendered
- More flexibility than children pattern
- When hooks can't be used (class components, libraries)

**The Pattern:**

```tsx
// Render prop component
function Mouse({ render }) {
  const [position, setPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [])

  return render(position)
}

// Usage - consumer controls rendering
function App() {
  return (
    <Mouse render={({ x, y }) => (
      <div>Mouse is at ({x}, {y})</div>
    )} />
  )
}

// Can also use children as function
function Mouse({ children }) {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  // ... same logic
  return children(position)
}

// Usage
<Mouse>
  {({ x, y }) => <Cursor x={x} y={y} />}
</Mouse>

// Modern alternative: Custom hook
function useMouse() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  // ... same logic
  return position
}

// Usage
function App() {
  const { x, y } = useMouse()
  return <div>Mouse is at ({x}, {y})</div>
}
```

**Why It Works:**
Maximum flexibility in what gets rendered. Logic is reusable. Consumer has full control. Works when hooks aren't available.

---

## 5. The Controlled vs Uncontrolled Pattern

**What It Is:**
Choosing between the parent controlling component state (controlled) or the component managing its own state (uncontrolled).

**When To Use:**
- Controlled: When parent needs to know/control value
- Controlled: When value needs to affect other UI
- Uncontrolled: When you don't need the value until submit
- Uncontrolled: For better performance (fewer re-renders)

**The Pattern:**

```tsx
// UNCONTROLLED: Component manages own state
// Parent doesn't know value until submit
function UncontrolledInput({ defaultValue, onSubmit }) {
  const inputRef = useRef()

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(inputRef.current.value)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} defaultValue={defaultValue} />
      <button type="submit">Submit</button>
    </form>
  )
}

// CONTROLLED: Parent controls state
// Every keystroke updates parent
function ControlledInput({ value, onChange }) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

function Parent() {
  const [query, setQuery] = useState('')

  return (
    <>
      <ControlledInput value={query} onChange={setQuery} />
      {/* Value available for live filtering */}
      <Results query={query} />
    </>
  )
}

// HYBRID: Support both patterns
function FlexibleInput({ value, defaultValue, onChange }) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? '')
  const isControlled = value !== undefined

  const currentValue = isControlled ? value : internalValue

  const handleChange = (e) => {
    if (!isControlled) {
      setInternalValue(e.target.value)
    }
    onChange?.(e.target.value)
  }

  return <input value={currentValue} onChange={handleChange} />
}
```

**Why It Works:**
Right pattern for right use case. Uncontrolled avoids unnecessary re-renders. Controlled provides full control when needed. Hybrid supports both consumers.

---

## 6. The Error Boundary Pattern

**What It Is:**
Catching JavaScript errors in component trees and displaying fallback UI instead of crashing the whole app.

**When To Use:**
- Always (every app needs error boundaries)
- Around route components
- Around third-party components
- Around user-generated content
- Around features that can fail independently

**The Pattern:**

```tsx
// Error boundary (must be class component)
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Log to error reporting service
    logErrorToService(error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div>
          <h2>Something went wrong.</h2>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Usage - wrap around risky components
function App() {
  return (
    <ErrorBoundary fallback={<FullPageError />}>
      <Header />
      <ErrorBoundary fallback={<SidebarError />}>
        <Sidebar />
      </ErrorBoundary>
      <ErrorBoundary fallback={<ContentError />}>
        <MainContent />
      </ErrorBoundary>
    </ErrorBoundary>
  )
}

// React Query error boundaries
function Page() {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => (
        <ErrorBoundary
          onReset={reset}
          fallback={({ resetErrorBoundary }) => (
            <div>
              Error loading data.
              <button onClick={resetErrorBoundary}>Retry</button>
            </div>
          )}
        >
          <DataComponent />
        </ErrorBoundary>
      )}
    </QueryErrorResetBoundary>
  )
}
```

**Why It Works:**
Errors are contained, not catastrophic. Users see helpful fallbacks. App remains usable even when parts fail. Errors are logged for debugging.

---

## 7. The Skeleton Loading Pattern

**What It Is:**
Showing placeholder shapes that match the content layout while data loads, rather than spinners or blank states.

**When To Use:**
- When layout is predictable
- For better perceived performance
- To prevent layout shift
- For content-heavy pages

**The Pattern:**

```tsx
// Skeleton component
function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse bg-gray-200 rounded",
        className
      )}
      {...props}
    />
  )
}

// Content-matched skeleton
function PostCardSkeleton() {
  return (
    <div className="card">
      {/* Image placeholder - same aspect ratio as real image */}
      <Skeleton className="w-full aspect-video" />
      <div className="p-4">
        {/* Title - approximate text height and width */}
        <Skeleton className="h-6 w-3/4 mb-2" />
        {/* Description - multiple lines */}
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  )
}

// Usage with data fetching
function PostCard({ postId }) {
  const { data: post, isLoading } = useQuery({
    queryKey: ['post', postId],
    queryFn: () => fetchPost(postId),
  })

  if (isLoading) {
    return <PostCardSkeleton />
  }

  return (
    <div className="card">
      <img src={post.image} alt="" className="w-full aspect-video" />
      <div className="p-4">
        <h2 className="h-6">{post.title}</h2>
        <p>{post.description}</p>
      </div>
    </div>
  )
}

// List skeleton - match expected count
function PostListSkeleton({ count = 5 }) {
  return (
    <div className="grid gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <PostCardSkeleton key={i} />
      ))}
    </div>
  )
}
```

**Why It Works:**
Users perceive faster loading (content appears to load progressively). No layout shift when content arrives. Better than spinners for predictable content.

---

## 8. The Portal Pattern

**What It Is:**
Rendering children into a different part of the DOM tree, outside the parent component's DOM hierarchy.

**When To Use:**
- Modals and dialogs
- Tooltips and popovers
- Toasts and notifications
- Dropdown menus (to escape overflow: hidden)
- Any UI that should break out of container

**The Pattern:**

```tsx
import { createPortal } from 'react-dom'

// Basic portal
function Modal({ children, isOpen }) {
  if (!isOpen) return null

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        {children}
      </div>
    </div>,
    document.body // Renders here, not in parent DOM
  )
}

// Usage - Modal escapes any overflow:hidden ancestors
function Card() {
  const [showModal, setShowModal] = useState(false)

  return (
    <div style={{ overflow: 'hidden' }}> {/* Doesn't trap modal! */}
      <button onClick={() => setShowModal(true)}>Open</button>
      <Modal isOpen={showModal}>
        <h2>Modal Content</h2>
        <button onClick={() => setShowModal(false)}>Close</button>
      </Modal>
    </div>
  )
}

// Portal to specific container
function TooltipPortal({ children }) {
  const [container, setContainer] = useState(null)

  useEffect(() => {
    const el = document.getElementById('tooltip-root')
    setContainer(el)
  }, [])

  if (!container) return null

  return createPortal(children, container)
}

// In HTML:
// <body>
//   <div id="root">...</div>
//   <div id="tooltip-root"></div>
// </body>
```

**Why It Works:**
Escapes CSS constraints (overflow, z-index stacking contexts). DOM position doesn't affect React component tree. Events still bubble through React tree, not DOM tree.

---

## 9. The Custom Hook Pattern

**What It Is:**
Extracting component logic into reusable functions that can use hooks.

**When To Use:**
- Same logic used in multiple components
- Complex logic cluttering component
- Logic needs to be tested independently
- Stateful logic that isn't UI-specific

**The Pattern:**

```tsx
// Extract complex logic into custom hook
function useLocalStorage<T>(key: string, initialValue: T) {
  // Get from local storage then parse stored json or return initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })

  // Return a wrapped version of useState's setter
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function
        ? value(storedValue)
        : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue] as const
}

// Usage - same API as useState, but persists
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light')

  return (
    <select value={theme} onChange={(e) => setTheme(e.target.value)}>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  )
}

// More examples
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const media = window.matchMedia(query)
    setMatches(media.matches)

    const listener = (e) => setMatches(e.matches)
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}
```

**Why It Works:**
Logic is reusable without HOCs or render props. Hooks compose naturally. Testing is straightforward. Components stay focused on UI.

---

## 10. The State Machine Pattern

**What It Is:**
Modeling component state as explicit states with defined transitions, rather than multiple boolean flags.

**When To Use:**
- Complex UI with multiple states
- States that are mutually exclusive
- Logic errors from invalid state combinations
- When you find yourself with many boolean flags

**The Pattern:**

```tsx
// BEFORE: Boolean soup
const [isLoading, setIsLoading] = useState(false)
const [isError, setIsError] = useState(false)
const [isSuccess, setIsSuccess] = useState(false)
const [data, setData] = useState(null)
// What if isLoading AND isError are both true? Invalid!

// AFTER: State machine
type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: Data }
  | { status: 'error'; error: Error }

function useDataFetch(url) {
  const [state, setState] = useState<State>({ status: 'idle' })

  const fetch = async () => {
    setState({ status: 'loading' })
    try {
      const data = await fetchData(url)
      setState({ status: 'success', data })
    } catch (error) {
      setState({ status: 'error', error })
    }
  }

  return { state, fetch }
}

// Usage - exhaustive switch ensures all states handled
function Component() {
  const { state, fetch } = useDataFetch('/api/data')

  switch (state.status) {
    case 'idle':
      return <button onClick={fetch}>Load</button>
    case 'loading':
      return <Spinner />
    case 'success':
      return <DataView data={state.data} />
    case 'error':
      return <Error message={state.error.message} />
  }
}

// For complex state machines, use XState
import { createMachine, useMachine } from 'xstate'

const toggleMachine = createMachine({
  id: 'toggle',
  initial: 'inactive',
  states: {
    inactive: { on: { TOGGLE: 'active' } },
    active: { on: { TOGGLE: 'inactive' } },
  },
})

function Toggle() {
  const [state, send] = useMachine(toggleMachine)
  return (
    <button onClick={() => send('TOGGLE')}>
      {state.matches('active') ? 'ON' : 'OFF'}
    </button>
  )
}
```

**Why It Works:**
Impossible states are impossible. Transitions are explicit. TypeScript catches missing state handling. Complex flows become manageable.

