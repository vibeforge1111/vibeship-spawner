# React Patterns Specialist

## Identity

- **Tags**: `react`, `hooks`, `state`, `performance`, `components`
- **Domain**: Hooks, state management, performance optimization, component composition
- **Use when**: Component architecture, state bugs, performance issues, hook patterns

---

## Patterns

### Custom Hooks for Logic Extraction

```tsx
// hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    window.localStorage.setItem(key, JSON.stringify(valueToStore));
  };

  return [storedValue, setValue] as const;
}

// Usage
const [theme, setTheme] = useLocalStorage('theme', 'light');
```

### Data Fetching Hook

```tsx
// hooks/useFetch.ts
import { useState, useEffect } from 'react';

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export function useFetch<T>(url: string): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      setData(json);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  return { data, loading, error, refetch: fetchData };
}
```

### Compound Components

```tsx
// components/Tabs.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

function useTabs() {
  const context = useContext(TabsContext);
  if (!context) throw new Error('useTabs must be used within Tabs');
  return context;
}

interface TabsProps {
  defaultTab: string;
  children: ReactNode;
}

export function Tabs({ defaultTab, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </TabsContext.Provider>
  );
}

export function TabList({ children }: { children: ReactNode }) {
  return <div role="tablist" className="flex gap-2">{children}</div>;
}

export function Tab({ value, children }: { value: string; children: ReactNode }) {
  const { activeTab, setActiveTab } = useTabs();
  return (
    <button
      role="tab"
      aria-selected={activeTab === value}
      onClick={() => setActiveTab(value)}
      className={activeTab === value ? 'font-bold' : ''}
    >
      {children}
    </button>
  );
}

export function TabPanel({ value, children }: { value: string; children: ReactNode }) {
  const { activeTab } = useTabs();
  if (activeTab !== value) return null;
  return <div role="tabpanel">{children}</div>;
}

// Usage
<Tabs defaultTab="account">
  <TabList>
    <Tab value="account">Account</Tab>
    <Tab value="settings">Settings</Tab>
  </TabList>
  <TabPanel value="account">Account content</TabPanel>
  <TabPanel value="settings">Settings content</TabPanel>
</Tabs>
```

### Render Props

```tsx
// components/Toggle.tsx
interface ToggleProps {
  children: (props: { on: boolean; toggle: () => void }) => ReactNode;
}

export function Toggle({ children }: ToggleProps) {
  const [on, setOn] = useState(false);
  const toggle = () => setOn(!on);
  return <>{children({ on, toggle })}</>;
}

// Usage
<Toggle>
  {({ on, toggle }) => (
    <button onClick={toggle}>{on ? 'ON' : 'OFF'}</button>
  )}
</Toggle>
```

### Controlled vs Uncontrolled

```tsx
// Controlled - parent owns state
interface ControlledInputProps {
  value: string;
  onChange: (value: string) => void;
}

function ControlledInput({ value, onChange }: ControlledInputProps) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

// Uncontrolled - component owns state with optional external control
interface InputProps {
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
}

function Input({ defaultValue, value, onChange }: InputProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? '');
  const isControlled = value !== undefined;

  const currentValue = isControlled ? value : internalValue;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (!isControlled) setInternalValue(newValue);
    onChange?.(newValue);
  };

  return <input value={currentValue} onChange={handleChange} />;
}
```

### Memoization

```tsx
// Memoize expensive calculations
const expensiveResult = useMemo(() => {
  return heavyComputation(data);
}, [data]); // Only recompute when data changes

// Memoize callbacks to prevent child re-renders
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

// Memoize components
const MemoizedComponent = memo(function Component({ data }: Props) {
  return <div>{data.name}</div>;
});

// With custom comparison
const MemoizedComponent = memo(
  function Component({ data }: Props) {
    return <div>{data.name}</div>;
  },
  (prevProps, nextProps) => prevProps.data.id === nextProps.data.id
);
```

### useReducer for Complex State

```tsx
interface State {
  items: Item[];
  loading: boolean;
  error: string | null;
}

type Action =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Item[] }
  | { type: 'FETCH_ERROR'; payload: string }
  | { type: 'ADD_ITEM'; payload: Item }
  | { type: 'REMOVE_ITEM'; payload: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, items: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.payload] };
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.id !== action.payload) };
    default:
      return state;
  }
}

function ItemList() {
  const [state, dispatch] = useReducer(reducer, {
    items: [],
    loading: false,
    error: null,
  });

  // dispatch({ type: 'ADD_ITEM', payload: newItem });
}
```

### Refs for DOM Access

```tsx
function TextInput() {
  const inputRef = useRef<HTMLInputElement>(null);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <>
      <input ref={inputRef} />
      <button onClick={focusInput}>Focus</button>
    </>
  );
}

// Forward refs to child components
const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return <input ref={ref} {...props} />;
});

// Imperative handle for custom ref API
const Input = forwardRef<{ focus: () => void }, InputProps>((props, ref) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  return <input ref={inputRef} {...props} />;
});
```

### Error Boundaries

```tsx
// components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary fallback={<div>Something went wrong</div>}>
  <RiskyComponent />
</ErrorBoundary>
```

---

## Anti-patterns

### useEffect for Derived State

```tsx
// BAD - useEffect for computation
const [items, setItems] = useState([]);
const [filteredItems, setFilteredItems] = useState([]);

useEffect(() => {
  setFilteredItems(items.filter(i => i.active));
}, [items]);

// GOOD - Compute during render
const [items, setItems] = useState([]);
const filteredItems = items.filter(i => i.active);

// Or useMemo for expensive computations
const filteredItems = useMemo(
  () => items.filter(i => i.active),
  [items]
);
```

### Props Drilling

```tsx
// BAD - Passing props through many levels
<App user={user}>
  <Layout user={user}>
    <Header user={user}>
      <UserMenu user={user} />
    </Header>
  </Layout>
</App>

// GOOD - Use context
const UserContext = createContext<User | null>(null);

<UserContext.Provider value={user}>
  <App>
    <Layout>
      <Header>
        <UserMenu /> {/* Uses useContext(UserContext) */}
      </Header>
    </Layout>
  </App>
</UserContext.Provider>
```

### Unnecessary State

```tsx
// BAD - State that's always derived
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const [fullName, setFullName] = useState('');

useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);

// GOOD - Just compute it
const [firstName, setFirstName] = useState('');
const [lastName, setLastName] = useState('');
const fullName = `${firstName} ${lastName}`;
```

### Object/Array Dependencies

```tsx
// BAD - Creates new object every render
useEffect(() => {
  fetchData(options);
}, [{ page: 1, limit: 10 }]); // Always triggers!

// GOOD - Stable reference
const options = useMemo(() => ({ page, limit }), [page, limit]);
useEffect(() => {
  fetchData(options);
}, [options]);

// Or destructure
useEffect(() => {
  fetchData({ page, limit });
}, [page, limit]);
```

---

## Gotchas

### 1. Stale Closures

```tsx
// BAD - count is stale in interval
function Counter() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setCount(count + 1); // Always uses initial count!
    }, 1000);
    return () => clearInterval(id);
  }, []); // Empty deps = stale closure
}

// GOOD - Use functional update
setCount(c => c + 1);

// Or include in deps
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1);
  }, 1000);
  return () => clearInterval(id);
}, [count]); // But this resets interval every count change
```

### 2. useEffect Runs After Paint

```tsx
// useEffect runs after browser paints
useEffect(() => {
  // This causes a flash
  setVisible(true);
}, []);

// useLayoutEffect runs before paint (use sparingly)
useLayoutEffect(() => {
  // Measure DOM before paint
  const height = ref.current?.offsetHeight;
}, []);
```

### 3. State Updates Are Batched

```tsx
// React 18+ batches all updates
function handleClick() {
  setA(1);
  setB(2);
  setC(3);
  // Only ONE re-render, not three
}

// If you need immediate state, use flushSync (rarely needed)
import { flushSync } from 'react-dom';
flushSync(() => setCount(1));
```

### 4. Keys Reset Component State

```tsx
// Changing key resets component entirely
<UserProfile key={userId} userId={userId} />
// New userId = fresh component with fresh state
```

### 5. Strict Mode Runs Effects Twice

In development with React.StrictMode, effects run twice to catch bugs. This is intentional - make effects idempotent.

---

## Checkpoints

Before marking a React task complete:

- [ ] No unnecessary useEffect for derived state
- [ ] Custom hooks extracted for reusable logic
- [ ] Expensive computations memoized
- [ ] Context used instead of deep prop drilling
- [ ] Keys are stable and unique
- [ ] Error boundaries wrap risky components
- [ ] No stale closure issues
- [ ] Dependencies arrays accurate

---

## Escape Hatches

### When Context re-renders too much
- Split context into smaller pieces
- Use state management library (Zustand, Jotai)
- Use React Query/SWR for server state

### When memo/useMemo doesn't help
- Check if parent is re-rendering unnecessarily
- Consider component structure changes
- Profile with React DevTools

### When refs aren't enough
- Use state for things that need re-renders
- Consider uncontrolled form inputs
- Use form libraries (react-hook-form)

---

## Squad Dependencies

Often paired with:
- `typescript-strict` for type-safe props
- `nextjs-app-router` for Server Components
- `state-sync` for client/server state
- `server-client-boundary` for RSC patterns

---

*Last updated: 2025-12-11*
