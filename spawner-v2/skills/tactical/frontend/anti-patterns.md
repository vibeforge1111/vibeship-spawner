# Anti-Patterns: Frontend Engineering

These approaches look like good frontend code but consistently lead to bugs, poor performance, and maintenance nightmares.

---

## 1. The God Component

**The Mistake:**
```tsx
function Dashboard() {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [filters, setFilters] = useState({})
  const [sortOrder, setSortOrder] = useState('asc')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState({})
  // ... 20 more useState calls

  useEffect(() => { /* fetch users */ }, [])
  useEffect(() => { /* filter users */ }, [filters])
  useEffect(() => { /* sort users */ }, [sortOrder])
  useEffect(() => { /* search users */ }, [searchQuery])
  // ... 10 more useEffect calls

  const handleUserClick = () => { /* ... */ }
  const handleFilterChange = () => { /* ... */ }
  const handleSort = () => { /* ... */ }
  // ... 15 more handlers

  return (
    <div>
      {/* 500 lines of JSX */}
    </div>
  )
}
```

**Why It's Wrong:**
- Impossible to understand at a glance
- Can't test individual pieces
- Every change risks breaking something
- Re-renders the entire tree on any state change
- No reusability

**The Fix:**
```tsx
// Split into focused components
function Dashboard() {
  return (
    <div>
      <DashboardHeader />
      <DashboardTabs />
      <DashboardContent />
      <UserModal />
    </div>
  )
}

function DashboardContent() {
  const { activeTab } = useDashboardContext()

  switch (activeTab) {
    case 'overview': return <OverviewTab />
    case 'users': return <UsersTab />
    case 'settings': return <SettingsTab />
  }
}

function UsersTab() {
  return (
    <>
      <UserFilters />
      <UserList />
    </>
  )
}

// Each component: < 100 lines, single responsibility
```

---

## 2. The useEffect Abuse

**The Mistake:**
```tsx
function Profile({ userId }) {
  const [user, setUser] = useState(null)
  const [fullName, setFullName] = useState('')
  const [initials, setInitials] = useState('')

  // Fetch user
  useEffect(() => {
    fetchUser(userId).then(setUser)
  }, [userId])

  // Derive full name (WRONG - should be derived directly)
  useEffect(() => {
    if (user) {
      setFullName(`${user.firstName} ${user.lastName}`)
    }
  }, [user])

  // Derive initials (WRONG - chains effects)
  useEffect(() => {
    if (fullName) {
      setInitials(fullName.split(' ').map(n => n[0]).join(''))
    }
  }, [fullName])

  // Now we have: fetch → setUser → effect → setFullName
  // → effect → setInitials = 3 render cycles!
}
```

**Why It's Wrong:**
- Derived state should be calculated, not synchronized
- Effect chains cause multiple re-renders
- Race conditions when dependencies change
- Harder to trace data flow

**The Fix:**
```tsx
function Profile({ userId }) {
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId)
  })

  // Derived values calculated during render (no effect!)
  const fullName = user ? `${user.firstName} ${user.lastName}` : ''
  const initials = fullName.split(' ').map(n => n[0]).join('')

  // Use useMemo if calculation is expensive
  const expensiveValue = useMemo(() => {
    return computeExpensive(user)
  }, [user])

  return <div>{fullName} ({initials})</div>
}
```

---

## 3. The Prop Spreading Surprise

**The Mistake:**
```tsx
function Button({ children, ...props }) {
  return (
    <button {...props}>
      {children}
    </button>
  )
}

// Usage - anything can be passed
<Button
  onClick={handleClick}
  className="btn"
  dataTestId="submit"  // Oops, should be data-testid
  onClikc={handler}    // Typo passes silently
  foo="bar"            // Unknown prop passes to DOM
>
  Click me
</Button>
```

**Why It's Wrong:**
- No type safety for props
- Typos pass silently
- Unknown props leak to DOM (React warnings)
- Hard to know what's supported
- Security risk (event handlers can be injected)

**The Fix:**
```tsx
interface ButtonProps {
  children: React.ReactNode
  variant?: 'primary' | 'secondary'
  size?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
  className?: string
}

function Button({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled,
  type = 'button',
  className,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(buttonStyles({ variant, size }), className)}
    >
      {children}
    </button>
  )
}

// Now typos are caught, unknown props are rejected
```

---

## 4. The Index Key Disaster

**The Mistake:**
```tsx
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo, index) => (
        <li key={index}> {/* WRONG */}
          <input
            type="checkbox"
            checked={todo.done}
            onChange={() => toggle(todo.id)}
          />
          {todo.text}
        </li>
      ))}
    </ul>
  )
}

// When a todo is deleted from the middle:
// - React thinks items just shifted
// - Checkbox state gets mixed up
// - Wrong item appears selected
```

**Why It's Wrong:**
- Index changes when items are added/removed/reordered
- React reuses elements incorrectly
- Input state gets attached to wrong items
- Animation bugs
- Performance issues (can't optimize reconciliation)

**The Fix:**
```tsx
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}> {/* Stable, unique identifier */}
          <input
            type="checkbox"
            checked={todo.done}
            onChange={() => toggle(todo.id)}
          />
          {todo.text}
        </li>
      ))}
    </ul>
  )
}

// If no natural ID exists, generate one when item is created:
const newTodo = { id: crypto.randomUUID(), text: input }
```

---

## 5. The Inline Handler Creation

**The Mistake:**
```tsx
function ParentList({ items }) {
  return (
    <div>
      {items.map(item => (
        <MemoizedChild
          key={item.id}
          item={item}
          onClick={() => handleClick(item.id)} // New function every render!
          onHover={() => handleHover(item.id)} // Breaks memo
          style={{ color: 'red' }} // New object every render!
        />
      ))}
    </div>
  )
}

const MemoizedChild = memo(({ item, onClick, onHover, style }) => {
  // memo is useless - props always "change"
  return <div style={style} onClick={onClick}>{item.name}</div>
})
```

**Why It's Wrong:**
- New function/object reference every render
- Memo is defeated
- Child re-renders unnecessarily
- Performance degrades with list size

**The Fix:**
```tsx
function ParentList({ items }) {
  // Stable handler - pass id as parameter
  const handleClick = useCallback((id: string) => {
    // handle click with id
  }, [])

  return (
    <div>
      {items.map(item => (
        <MemoizedChild
          key={item.id}
          item={item}
          onClick={handleClick}
        />
      ))}
    </div>
  )
}

// Child gets id from item, calls handler with it
const MemoizedChild = memo(({ item, onClick }) => {
  return (
    <div onClick={() => onClick(item.id)}>
      {item.name}
    </div>
  )
})

// For style objects, define outside component or use useMemo
const itemStyle = { color: 'red' } // Stable reference
```

---

## 6. The Premature Abstraction

**The Mistake:**
```tsx
// First button needed
function PrimaryButton({ children, onClick }) { /* ... */ }

// "Let's make it reusable!"
function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'medium',
  icon,
  iconPosition = 'left',
  loading,
  disabled,
  fullWidth,
  rounded,
  outline,
  gradient,
  animateOnHover,
  tooltip,
  tooltipPosition,
  // ... 20 more props for "flexibility"
}) {
  // 200 lines of conditional logic
}

// Now simple buttons are complex:
<Button
  variant="primary"
  size="medium"
  iconPosition="left"
  loading={false}
  disabled={false}
  fullWidth={false}
  rounded={false}
  outline={false}
  gradient={false}
  animateOnHover={true}
>
  Click me
</Button>
```

**Why It's Wrong:**
- Optimizing for flexibility you don't need
- Complex API for simple use cases
- Hard to maintain all the combinations
- Each new need adds more props
- Probably only 2 variants are used

**The Fix:**
```tsx
// Start simple, add complexity ONLY when needed
function Button({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="btn btn-primary"
    >
      {children}
    </button>
  )
}

// When you ACTUALLY need a variant, add it
function Button({ children, onClick, disabled, variant = 'primary' }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn('btn', `btn-${variant}`)}
    >
      {children}
    </button>
  )
}

// Duplication is better than the wrong abstraction
// Three similar buttons is fine. Don't abstract until third use.
```

---

## 7. The Global State Everything

**The Mistake:**
```tsx
// Every piece of state in Redux/global store
const store = {
  user: { ... },
  todos: { ... },
  ui: {
    sidebarOpen: false,
    modalOpen: false,
    activeTab: 'home',
    searchQuery: '',
    filterValue: '',
    dropdownOpen: false,
    tooltipVisible: false,
    // Every UI state globally!
  }
}

// Component needs to dispatch for everything
function SearchBox() {
  const dispatch = useDispatch()
  const query = useSelector(state => state.ui.searchQuery)

  return (
    <input
      value={query}
      onChange={(e) => dispatch(setSearchQuery(e.target.value))}
    />
  )
}
```

**Why It's Wrong:**
- UI state doesn't need global access
- More boilerplate for simple state
- Harder to trace state changes
- Performance issues (selectors, re-renders)
- Tight coupling to global store

**The Fix:**
```tsx
// Global state for truly global concerns
const store = {
  user: { ... },        // Global - many components need
  todos: { ... },       // Global - shared data
}

// Local state for UI state
function SearchBox({ onSearch }) {
  const [query, setQuery] = useState('')

  return (
    <input
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && onSearch(query)}
    />
  )
}

// Rule of thumb:
// - Server data: React Query/SWR
// - Global UI: Context or Zustand
// - Component UI: useState
// - Form state: React Hook Form
```

---

## 8. The TypeScript Any Escape

**The Mistake:**
```tsx
function fetchData(): any {
  // Returns any - no safety
}

function processUser(user: any) {
  return user.nmae // Typo - no error!
}

function Component({ data }: { data: any }) {
  // data could be anything
  return <div>{data.items.map((i: any) => i.name)}</div>
}

// @ts-ignore
const result = brokenCode()

// as any
const forced = (value as any).someProperty
```

**Why It's Wrong:**
- Defeats the purpose of TypeScript
- Bugs caught at runtime instead of compile time
- No autocomplete or documentation
- any spreads (return type of function using any is any)
- Technical debt that compounds

**The Fix:**
```tsx
interface User {
  id: string
  name: string
  email: string
}

function fetchUser(id: string): Promise<User> {
  return fetch(`/api/users/${id}`).then(r => r.json())
}

function processUser(user: User) {
  return user.name // Autocomplete, typos caught
}

// For unknown data, use unknown and narrow
function processUnknown(data: unknown) {
  if (typeof data === 'object' && data !== null && 'name' in data) {
    return (data as { name: string }).name
  }
  throw new Error('Invalid data')
}

// For third-party without types
declare module 'untyped-lib' {
  export function doThing(input: string): number
}
```

---

## 9. The CSS-in-JS Runtime Cost

**The Mistake:**
```tsx
// Styled-components in a list
function ListItem({ item, isActive }) {
  return (
    <ItemContainer active={isActive}>
      <Title size={item.size}>{item.title}</Title>
      <Description color={item.color}>{item.desc}</Description>
    </ItemContainer>
  )
}

const ItemContainer = styled.div`
  padding: 16px;
  background: ${props => props.active ? 'blue' : 'white'};
`

const Title = styled.h3`
  font-size: ${props => props.size}px;
`

const Description = styled.p`
  color: ${props => props.color};
`

// 1000 items = 1000 style computations per render
```

**Why It's Wrong:**
- Runtime style computation on every render
- Generates new class names dynamically
- Can't be cached effectively
- SSR complexity
- Large bundle size

**The Fix:**
```tsx
// Option 1: Tailwind (zero runtime)
function ListItem({ item, isActive }) {
  return (
    <div className={cn('p-4', isActive ? 'bg-blue-500' : 'bg-white')}>
      <h3 style={{ fontSize: item.size }}>{item.title}</h3>
      <p style={{ color: item.color }}>{item.desc}</p>
    </div>
  )
}

// Option 2: CSS Modules (zero runtime)
import styles from './ListItem.module.css'

function ListItem({ item, isActive }) {
  return (
    <div className={cn(styles.container, isActive && styles.active)}>
      <h3 className={styles.title}>{item.title}</h3>
    </div>
  )
}

// Option 3: Build-time CSS-in-JS (vanilla-extract, Panda)
import { container, title } from './styles.css'

function ListItem({ item, isActive }) {
  return (
    <div className={container({ active: isActive })}>
      <h3 className={title}>{item.title}</h3>
    </div>
  )
}
```

---

## 10. The Missing Loading States

**The Mistake:**
```tsx
function UserProfile({ userId }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    fetchUser(userId).then(setUser)
  }, [userId])

  // No loading state - just shows nothing then pops in
  return (
    <div>
      <h1>{user?.name}</h1>
      <p>{user?.bio}</p>
    </div>
  )
}

// Or worse, the blank state of doom:
function Dashboard() {
  const { data } = useQuery(...)

  // Renders empty div while loading
  return (
    <div>
      {data?.items.map(item => <Item key={item.id} item={item} />)}
    </div>
  )
}
```

**Why It's Wrong:**
- User sees blank screen, thinks it's broken
- Layout shift when content loads
- No feedback that anything is happening
- Accessibility issue (no status announcement)

**The Fix:**
```tsx
function UserProfile({ userId }) {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  })

  if (isLoading) {
    return <ProfileSkeleton />
  }

  if (error) {
    return <ErrorMessage error={error} />
  }

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.bio}</p>
    </div>
  )
}

// Or with Suspense
function UserProfile({ userId }) {
  return (
    <Suspense fallback={<ProfileSkeleton />}>
      <UserProfileContent userId={userId} />
    </Suspense>
  )
}

function UserProfileContent({ userId }) {
  const { data: user } = useSuspenseQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  })

  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.bio}</p>
    </div>
  )
}
```

---

## 11. The Direct DOM Manipulation

**The Mistake:**
```tsx
function Modal({ isOpen }) {
  useEffect(() => {
    if (isOpen) {
      // Direct DOM manipulation
      document.body.style.overflow = 'hidden'
      document.querySelector('.header').classList.add('blurred')
    } else {
      document.body.style.overflow = ''
      document.querySelector('.header').classList.remove('blurred')
    }
  }, [isOpen])

  return isOpen ? <div className="modal">...</div> : null
}
```

**Why It's Wrong:**
- Breaks React's mental model
- Can conflict with React's updates
- Cleanup is error-prone
- Not tracked in React DevTools
- Can cause memory leaks

**The Fix:**
```tsx
// Use refs for direct DOM access when needed
function Modal({ isOpen }) {
  // For body scroll lock, use a hook or library
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow
      }
    }
  }, [isOpen])

  // For related components, use context
  const { setBlurred } = useHeaderContext()

  useEffect(() => {
    setBlurred(isOpen)
  }, [isOpen, setBlurred])

  return isOpen ? <div className="modal">...</div> : null
}

// Better: Use a library that handles this
import { Dialog } from '@headlessui/react'

function Modal({ isOpen, onClose }) {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      {/* Body scroll lock handled automatically */}
    </Dialog>
  )
}
```

---

## 12. The Async Event Handler Bug

**The Mistake:**
```tsx
function Form() {
  const handleSubmit = async (e) => {
    e.preventDefault()

    // Async operation
    await submitForm(data)

    // By now, e.target might be null (event pooling)
    console.log(e.target.value) // Might be undefined!
  }

  // Or worse:
  const handleChange = async (e) => {
    const value = e.target.value
    await validateAsync(value)
    setValue(e.target.value) // e is synthetic, might be reused!
  }
}
```

**Why It's Wrong:**
- React synthetic events are pooled (reused)
- Event properties become null after handler returns
- Async code accesses stale/null event properties
- Intermittent bugs that are hard to reproduce

**The Fix:**
```tsx
function Form() {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Extract what you need BEFORE async
    const formData = new FormData(e.target as HTMLFormElement)

    await submitForm(formData)

    // Now use the extracted data
    console.log(formData.get('email'))
  }

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Extract value immediately
    const value = e.target.value

    // Now safe to use in async code
    await validateAsync(value)
    setValue(value)
  }
}
```

