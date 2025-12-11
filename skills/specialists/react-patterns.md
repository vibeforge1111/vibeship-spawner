---
name: react-patterns
description: Use when building React components or debugging state/render issues - enforces proper hook usage, prevents unnecessary re-renders, and guides component composition patterns
tags: [react, hooks, state, performance, components]
---

# React Patterns Specialist

## Overview

React's power comes from its simple model: state changes trigger renders. Fighting this model with useEffect hacks, prop drilling, and premature memoization creates bugs and performance issues.

**Core principle:** Work with React's model, not against it. Derive state during render, lift state up, push effects down.

## The Iron Law

```
NO USEEFFECT FOR DERIVED STATE - COMPUTE DURING RENDER
```

If a value can be calculated from props or state, calculate it during render. useEffect for derivation causes extra renders, race conditions, and stale data.

## When to Use

**Always:**
- Building new components
- Debugging re-render issues
- Extracting custom hooks
- Optimizing performance
- Fixing stale closure bugs

**Don't:**
- Server Components (different patterns)
- Simple static components (don't over-engineer)
- One-off scripts (not React)

Thinking "useEffect will sync this data"? Stop. That's almost always wrong.

## The Process

### Step 1: Identify State Ownership

Before writing a component, ask: who owns this state?
- Parent owns → controlled component (value + onChange props)
- Component owns → internal state
- Multiple components need it → lift to common ancestor or context

### Step 2: Derive What You Can

For any value, ask: can this be calculated from existing state/props?
- Yes → compute during render (with useMemo if expensive)
- No → it's actual state

### Step 3: Push Effects Down

If you need useEffect, push it to the smallest component possible. This isolates re-renders.

## Patterns

### Derived State

<Good>
```tsx
function ProductList({ products, filter }) {
  // Derive during render - always in sync
  const filteredProducts = products.filter(p => p.category === filter);

  // Memoize only if filtering is expensive
  const expensiveFiltered = useMemo(
    () => products.filter(p => expensiveCheck(p, filter)),
    [products, filter]
  );

  return <ul>{filteredProducts.map(p => <li key={p.id}>{p.name}</li>)}</ul>;
}
```
Computed during render. Always up to date. No extra re-renders.
</Good>

<Bad>
```tsx
function ProductList({ products, filter }) {
  const [filteredProducts, setFilteredProducts] = useState([]);

  // BAD: useEffect for derived state
  useEffect(() => {
    setFilteredProducts(products.filter(p => p.category === filter));
  }, [products, filter]);

  return <ul>{filteredProducts.map(p => <li key={p.id}>{p.name}</li>)}</ul>;
}
```
Extra state, extra render, potential stale data during first render.
</Bad>

### Custom Hooks for Logic

<Good>
```tsx
// Extract reusable logic into hooks
function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initial;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initial;
  });

  const setStoredValue = (newValue: T | ((v: T) => T)) => {
    setValue(prev => {
      const resolved = newValue instanceof Function ? newValue(prev) : newValue;
      localStorage.setItem(key, JSON.stringify(resolved));
      return resolved;
    });
  };

  return [value, setStoredValue] as const;
}

// Usage
const [theme, setTheme] = useLocalStorage('theme', 'light');
```
Reusable, testable, encapsulates complexity.
</Good>

<Bad>
```tsx
function Settings() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Duplicated in every component that needs localStorage
}
```
Logic scattered across component. Not reusable. Double effects.
</Bad>

### Controlled vs Uncontrolled

<Good>
```tsx
// Supports both controlled and uncontrolled usage
function Input({ value, defaultValue, onChange }: InputProps) {
  const [internal, setInternal] = useState(defaultValue ?? '');
  const isControlled = value !== undefined;

  const currentValue = isControlled ? value : internal;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInternal(e.target.value);
    onChange?.(e.target.value);
  };

  return <input value={currentValue} onChange={handleChange} />;
}
```
Works as controlled or uncontrolled. Flexible for consumers.
</Good>

<Bad>
```tsx
// Forces controlled-only usage
function Input({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <input value={value} onChange={e => onChange(e.target.value)} />;
}

// Consumer MUST manage state, even for simple cases
const [value, setValue] = useState('');
<Input value={value} onChange={setValue} />
```
Inflexible. Consumers can't use defaultValue pattern.
</Bad>

### Context for Cross-Cutting State

<Good>
```tsx
// Create focused context
const ThemeContext = createContext<{ theme: string; toggle: () => void } | null>(null);

function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}

// Provider at appropriate level
function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState('light');
  const toggle = () => setTheme(t => t === 'light' ? 'dark' : 'light');

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
```
Focused context. Throws helpful error if misused.
</Good>

<Bad>
```tsx
// Prop drilling through many levels
function App({ user }) {
  return <Layout user={user}><Header user={user}><UserMenu user={user} /></Header></Layout>;
}
```
Every intermediate component must accept and forward props.
</Bad>

## Anti-Patterns

| Anti-Pattern | Why It Fails | What To Do Instead |
|--------------|--------------|-------------------|
| useEffect for derived state | Extra render, stale data | Compute during render |
| Object/array in deps array | Creates new reference every render | useMemo or destructure |
| Prop drilling 3+ levels | Fragile, verbose, hard to refactor | Use Context |
| Memoizing everything | Overhead often exceeds benefit | Profile first, then optimize |
| State for computed values | Out of sync, extra renders | Derive from source state |

## Red Flags - STOP

If you catch yourself:
- Writing `useEffect` + `setState` for something computable
- Creating state that mirrors props
- Passing props through 3+ component levels
- Adding `useMemo`/`useCallback` without measuring first
- Fighting stale closures with refs

**ALL of these mean: STOP. Re-think the component design. Usually state is in wrong place.**

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "useEffect keeps it in sync" | Computation during render IS in sync. useEffect adds delay. |
| "useMemo/useCallback everywhere is safe" | It has overhead. Only use when measured benefit. |
| "Prop drilling is simpler than Context" | For 2 levels, yes. For 3+, Context is simpler. |
| "This component needs all this state" | Does it? Or should state be lifted/split? |
| "I need useEffect for this fetch" | In App Router, use Server Components. In client, use React Query/SWR. |
| "Refs avoid stale closures" | Refs are escape hatch. Fix the closure instead. |

## Gotchas

### Stale Closures in Intervals

```tsx
// BAD - count is stale
useEffect(() => {
  const id = setInterval(() => {
    setCount(count + 1); // Always uses initial count!
  }, 1000);
  return () => clearInterval(id);
}, []); // Empty deps = stale closure

// GOOD - functional update
setCount(c => c + 1);
```

### State Updates Are Batched

```tsx
// React 18+ batches all updates
function handleClick() {
  setA(1);
  setB(2);
  setC(3);
  // Only ONE re-render, not three
}
```

### Keys Reset Component State

```tsx
// Changing key resets component entirely
<UserProfile key={userId} userId={userId} />
// New userId = fresh component with fresh state
```

## Verification Checklist

Before marking React work complete:

- [ ] No useEffect for derived/computed state
- [ ] Custom hooks extracted for reusable logic
- [ ] Context used instead of 3+ level prop drilling
- [ ] Keys are stable and unique (not array index for dynamic lists)
- [ ] Dependencies arrays are accurate (no eslint-disable)
- [ ] No stale closure issues in callbacks/effects
- [ ] Memoization only where profiling showed benefit
- [ ] Error boundaries wrap risky component subtrees

Can't check all boxes? You have React anti-patterns. Fix them.

## Integration

**Pairs well with:**
- `typescript-strict` - Type-safe props and hooks
- `nextjs-app-router` - Server/Client component split
- `state-sync` - Client/server state management

**Requires:**
- Understanding of React render cycle
- React 18+ for automatic batching

## References

- [React Documentation](https://react.dev/)
- [You Might Not Need an Effect](https://react.dev/learn/you-might-not-need-an-effect)
- [Thinking in React](https://react.dev/learn/thinking-in-react)

---

*This specialist follows the world-class skill pattern.*
