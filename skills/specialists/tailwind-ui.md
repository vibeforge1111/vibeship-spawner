# Tailwind UI Specialist

## Identity

- **Tags**: `tailwind`, `css`, `ui`, `responsive`, `dark-mode`, `components`
- **Domain**: Component patterns, responsive design, dark mode, design systems
- **Use when**: UI components, styling tasks, responsive layouts, theme implementation

---

## Patterns

### Component Structure

```tsx
// components/ui/Button.tsx
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        // Base styles
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        // Variants
        {
          'bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-500':
            variant === 'primary',
          'bg-gray-100 text-gray-900 hover:bg-gray-200 focus-visible:ring-gray-500':
            variant === 'secondary',
          'hover:bg-gray-100 focus-visible:ring-gray-500':
            variant === 'ghost',
          'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500':
            variant === 'danger',
        },
        // Sizes
        {
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4 text-sm': size === 'md',
          'h-12 px-6 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```

### cn Utility (Class Merging)

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Card Component

```tsx
// components/ui/Card.tsx
import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-white shadow-sm',
        'dark:border-gray-800 dark:bg-gray-950',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: CardProps) {
  return (
    <div
      className={cn('flex flex-col space-y-1.5 p-6', className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: CardProps) {
  return (
    <h3
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }: CardProps) {
  return <div className={cn('p-6 pt-0', className)} {...props} />;
}
```

### Input Component

```tsx
// components/ui/Input.tsx
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export function Input({ className, error, ...props }: InputProps) {
  return (
    <div className="space-y-1">
      <input
        className={cn(
          'flex h-10 w-full rounded-md border px-3 py-2 text-sm',
          'bg-white ring-offset-white',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-gray-500',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'dark:border-gray-800 dark:bg-gray-950 dark:ring-offset-gray-950',
          error
            ? 'border-red-500 focus-visible:ring-red-500'
            : 'border-gray-200 focus-visible:ring-blue-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
```

### Responsive Patterns

```tsx
// Mobile-first responsive design
<div className="
  grid
  grid-cols-1      // Mobile: 1 column
  sm:grid-cols-2   // Small: 2 columns
  lg:grid-cols-3   // Large: 3 columns
  xl:grid-cols-4   // XL: 4 columns
  gap-4
">
  {items.map(item => <Card key={item.id} />)}
</div>

// Responsive text
<h1 className="
  text-2xl         // Mobile
  sm:text-3xl      // Small
  lg:text-4xl      // Large
  font-bold
">
  Title
</h1>

// Responsive spacing
<section className="
  px-4             // Mobile padding
  sm:px-6          // Small
  lg:px-8          // Large
  py-12
  sm:py-16
  lg:py-24
">
```

### Dark Mode

```tsx
// tailwind.config.ts
export default {
  darkMode: 'class', // or 'media' for system preference
  // ...
}

// Component with dark mode
<div className="
  bg-white dark:bg-gray-900
  text-gray-900 dark:text-gray-100
  border-gray-200 dark:border-gray-800
">
  Content
</div>

// Dark mode toggle (with next-themes)
"use client";
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
      {theme === 'dark' ? '☀️' : '🌙'}
    </button>
  );
}
```

### Layout Patterns

```tsx
// Sidebar layout
<div className="flex min-h-screen">
  <aside className="w-64 border-r bg-gray-50 dark:bg-gray-900">
    <nav className="p-4">...</nav>
  </aside>
  <main className="flex-1 p-6">
    {children}
  </main>
</div>

// Sticky header
<header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur dark:bg-gray-950/95">
  <div className="container flex h-16 items-center">
    ...
  </div>
</header>

// Centered content with max-width
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  {children}
</div>
```

### Animation Classes

```tsx
// Hover effects
<button className="transition-colors hover:bg-gray-100">

// Scale on hover
<div className="transition-transform hover:scale-105">

// Fade in
<div className="animate-in fade-in duration-500">

// Custom animation in tailwind.config.ts
theme: {
  extend: {
    animation: {
      'spin-slow': 'spin 3s linear infinite',
      'bounce-slow': 'bounce 2s infinite',
    },
  },
}
```

---

## Anti-patterns

### Using @apply Excessively

```css
/* BAD - Defeats Tailwind's purpose */
.btn {
  @apply px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600;
}

/* GOOD - Use component with className */
// Create a Button component instead
```

### Inconsistent Spacing

```tsx
// BAD - Random spacing values
<div className="p-3 mt-7 mb-5 gap-9">

// GOOD - Use consistent scale (4, 8, 12, 16, 24, 32, 48)
<div className="p-4 mt-8 mb-4 gap-8">
```

### Not Using Container

```tsx
// BAD - Content spans full width
<main className="px-4">

// GOOD - Consistent container
<main className="container mx-auto px-4">
```

### Overriding with !important

```tsx
// BAD
<div className="!p-0">

// GOOD - Fix specificity at source or use cn()
<div className={cn('p-4', nopadding && 'p-0')}>
```

---

## Gotchas

### 1. Class Order Matters (Sometimes)

```tsx
// Tailwind processes left-to-right, but twMerge fixes conflicts
// Using cn() handles this:
cn('p-4', 'p-2') // Results in 'p-2'
cn('text-red-500', props.className) // Props override base
```

### 2. Purging in Production

Tailwind purges unused classes. Dynamic classes won't be included:

```tsx
// BAD - Class won't be in production bundle
const color = 'red';
<div className={`bg-${color}-500`}> // Purged!

// GOOD - Full class name
const bgColors = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
};
<div className={bgColors[color]}>
```

### 3. Custom Colors Need Full Definition

```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      brand: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        // ... all shades needed
        500: '#0ea5e9',
        600: '#0284c7',
        // ...
      },
    },
  },
}
```

### 4. Dark Mode Flash

On page load, there can be a flash of wrong theme:

```tsx
// Add to html tag to prevent flash
<html suppressHydrationWarning>
  <head>
    <script dangerouslySetInnerHTML={{
      __html: `
        if (localStorage.theme === 'dark' || (!localStorage.theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('dark')
        }
      `
    }} />
  </head>
```

### 5. Prose for Markdown Content

```tsx
// For rendered markdown/HTML content
<article className="prose dark:prose-invert max-w-none">
  {markdownContent}
</article>
```

---

## Checkpoints

Before marking a Tailwind UI task complete:

- [ ] Components use cn() for class merging
- [ ] Responsive design tested on mobile, tablet, desktop
- [ ] Dark mode implemented and tested
- [ ] Interactive states work (hover, focus, disabled)
- [ ] No hardcoded colors (use theme colors)
- [ ] Consistent spacing scale used
- [ ] Accessibility: focus states visible, sufficient contrast

---

## Escape Hatches

### When Tailwind is fighting you
- Custom CSS for complex animations
- CSS modules for highly specific overrides
- Inline styles for truly dynamic values (e.g., `style={{ width: `${percent}%` }}`)

### When you need a design system
- Consider shadcn/ui (copy-paste Tailwind components)
- Radix UI + Tailwind for accessible primitives
- Headless UI for complex interactions

### When dark mode is too complex
- Use CSS variables for theming
- Consider `prefers-color-scheme` media query only

---

## Squad Dependencies

Often paired with:
- `react-patterns` for component logic
- `nextjs-app-router` for layouts
- `brand-identity` for color/typography decisions
- `crud-builder` for consistent form styling

---

*Last updated: 2025-12-11*
