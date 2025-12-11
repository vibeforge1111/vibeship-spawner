---
name: tailwind-ui
description: Use when building UI components with Tailwind CSS - enforces consistent spacing, proper class merging, responsive patterns, and dark mode implementation
tags: [tailwind, css, ui, responsive, dark-mode, components]
---

# Tailwind UI Specialist

## Overview

Tailwind's utility classes become chaos without discipline. Inconsistent spacing, broken dark mode, purged classes, and specificity wars create UIs that are painful to maintain.

**Core principle:** Use consistent spacing scales, cn() for class merging, and mobile-first responsive design. No arbitrary values without justification.

## The Iron Law

```
NO DYNAMIC CLASS NAMES WITHOUT SAFELIST OR FULL CLASS MAPPING
```

Tailwind purges unused classes in production. `bg-${color}-500` won't work because the full class name isn't in your source code. Always use complete class names or safelist them.

## When to Use

**Always:**
- Building UI components
- Implementing responsive layouts
- Adding dark mode support
- Creating design system components
- Styling forms and interactive elements

**Don't:**
- Complex animations (use CSS/Framer Motion)
- Highly dynamic styles (use CSS variables)
- Third-party component libraries with their own styling

Thinking "I'll add arbitrary values for speed"? Stop. Use the spacing scale. Consistency matters.

## The Process

### Step 1: Set Up cn() Utility

Essential for merging classes without conflicts:

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

### Step 2: Use Consistent Spacing Scale

Stick to Tailwind's scale: 0, 1, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24, 32, 40, 48, 64

### Step 3: Mobile-First Responsive

Start with mobile styles, add breakpoints for larger screens.

## Patterns

### Component with Variants

<Good>
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
        'inline-flex items-center justify-center rounded-md font-medium',
        'transition-colors focus-visible:outline-none focus-visible:ring-2',
        'disabled:pointer-events-none disabled:opacity-50',
        // Variants
        {
          'bg-blue-600 text-white hover:bg-blue-700': variant === 'primary',
          'bg-gray-100 text-gray-900 hover:bg-gray-200': variant === 'secondary',
          'hover:bg-gray-100 text-gray-700': variant === 'ghost',
          'bg-red-600 text-white hover:bg-red-700': variant === 'danger',
        },
        // Sizes
        {
          'h-8 px-3 text-sm': size === 'sm',
          'h-10 px-4 text-sm': size === 'md',
          'h-12 px-6 text-base': size === 'lg',
        },
        className // Allow overrides
      )}
      {...props}
    >
      {children}
    </button>
  );
}
```
Uses cn() for merging. Variant objects for clarity. Accepts className for customization.
</Good>

<Bad>
```tsx
export function Button({ variant, className, ...props }) {
  return (
    <button
      className={`
        inline-flex items-center justify-center rounded-md
        ${variant === 'primary' ? 'bg-blue-600' : ''}
        ${variant === 'secondary' ? 'bg-gray-100' : ''}
        ${className}
      `}
      {...props}
    />
  );
}
```
Template literals don't handle conflicts. Missing base styles. Inconsistent.
</Bad>

### Dark Mode Implementation

<Good>
```tsx
// tailwind.config.ts
export default {
  darkMode: 'class',
  // ...
}

// Component with dark mode
export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        // Light mode
        'bg-white border-gray-200 text-gray-900',
        // Dark mode
        'dark:bg-gray-950 dark:border-gray-800 dark:text-gray-100',
        // Shared
        'rounded-lg border shadow-sm',
        className
      )}
      {...props}
    />
  );
}

// Prevent flash with script in layout
<html suppressHydrationWarning>
  <head>
    <script dangerouslySetInnerHTML={{
      __html: `
        if (localStorage.theme === 'dark' ||
            (!localStorage.theme && matchMedia('(prefers-color-scheme: dark)').matches)) {
          document.documentElement.classList.add('dark')
        }
      `
    }} />
  </head>
```
Dark mode classes paired with light. Flash prevention script.
</Good>

<Bad>
```tsx
// Missing dark mode variants
<div className="bg-white text-gray-900">
  {/* Broken in dark mode! */}
</div>

// Using opacity for dark mode
<div className="bg-black/10 dark:bg-white/10">
  {/* Inconsistent, hard to maintain */}
</div>
```
Missing dark variants. Opacity tricks are fragile.
</Bad>

### Responsive Layout

<Good>
```tsx
// Mobile-first grid
<div className="
  grid
  grid-cols-1
  sm:grid-cols-2
  lg:grid-cols-3
  xl:grid-cols-4
  gap-4
  sm:gap-6
">
  {items.map(item => <Card key={item.id} />)}
</div>

// Responsive text
<h1 className="
  text-2xl
  sm:text-3xl
  lg:text-4xl
  font-bold
  tracking-tight
">
  Title
</h1>

// Responsive container
<div className="
  mx-auto
  max-w-7xl
  px-4 sm:px-6 lg:px-8
  py-8 sm:py-12 lg:py-16
">
  {children}
</div>
```
Mobile first. Progressive enhancement. Consistent breakpoints.
</Good>

<Bad>
```tsx
// Desktop-first (overriding down)
<div className="grid-cols-4 md:grid-cols-3 sm:grid-cols-2 max-sm:grid-cols-1">
  {/* Confusing, error-prone */}
</div>

// Arbitrary breakpoints
<div className="grid-cols-1 min-[847px]:grid-cols-2 min-[1123px]:grid-cols-3">
  {/* Non-standard, hard to maintain */}
</div>
```
Desktop-first is confusing. Arbitrary breakpoints are unmaintainable.
</Bad>

### Consistent Spacing

<Good>
```tsx
// Using Tailwind's spacing scale consistently
<section className="py-12 sm:py-16 lg:py-24">
  <div className="space-y-8">
    <header className="space-y-4">
      <h2 className="text-3xl font-bold">Title</h2>
      <p className="text-lg text-gray-600">Description</p>
    </header>
    <div className="grid gap-6">
      {/* Cards */}
    </div>
  </div>
</section>
```
Consistent scale (4, 6, 8, 12, 16, 24). Predictable spacing.
</Good>

<Bad>
```tsx
// Random spacing values
<section className="py-[47px] mb-[13px]">
  <div className="mt-7 gap-9 p-[22px]">
    {/* No consistency */}
  </div>
</section>
```
Arbitrary values create visual inconsistency.
</Bad>

## Anti-Patterns

| Anti-Pattern | Why It Fails | What To Do Instead |
|--------------|--------------|-------------------|
| Dynamic class names | Purged in production | Use full class names or safelist |
| @apply everywhere | Defeats Tailwind's purpose | Create components instead |
| Arbitrary values | Breaks design consistency | Stick to spacing scale |
| !important overrides | Specificity wars | Fix at source with cn() |
| Missing dark mode | Broken appearance | Add dark: variants to everything |

## Red Flags - STOP

If you catch yourself:
- Using template literals for dynamic class names like `bg-${color}-500`
- Adding arbitrary values like `p-[17px]` without strong justification
- Using @apply to create utility classes
- Adding !important to force styles
- Skipping dark mode variants on any color/background

**ALL of these mean: STOP. Reconsider the approach. Follow the patterns.**

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Arbitrary values are faster" | They create tech debt. Use the scale. |
| "@apply keeps code clean" | It defeats the purpose of utilities. Use components. |
| "Dark mode can wait" | It's 10x harder to add later. Do it now. |
| "This spacing is close enough" | Close enough creates visual inconsistency. |
| "The class name is obvious" | Future you won't remember. Use cn(). |
| "I'll safelist it later" | You'll forget. Use complete class names now. |

## Gotchas

### Class Names Are Purged

Tailwind purges classes not found as complete strings:

```tsx
// BAD - purged in production
const color = 'red';
<div className={`bg-${color}-500`} /> // Class doesn't exist!

// GOOD - complete class names
const bgColors = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  green: 'bg-green-500',
} as const;
<div className={bgColors[color]} />
```

### Class Order with cn()

cn() (tailwind-merge) resolves conflicts by keeping the last one:

```tsx
cn('p-4', 'p-2'); // Results in 'p-2'
cn('text-red-500', className); // Props override base
```

### Custom Colors Need All Shades

```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      brand: {
        50: '#f0f9ff',
        100: '#e0f2fe',
        // ... need ALL shades you'll use
        500: '#0ea5e9',
        600: '#0284c7',
      },
    },
  },
}
```

### Focus States for Accessibility

Always include focus-visible styles:

```tsx
<button className="
  focus-visible:outline-none
  focus-visible:ring-2
  focus-visible:ring-blue-500
  focus-visible:ring-offset-2
">
```

## Verification Checklist

Before marking Tailwind UI work complete:

- [ ] cn() used for class merging in components
- [ ] Dark mode variants on all colors/backgrounds
- [ ] Responsive design tested on mobile, tablet, desktop
- [ ] Spacing uses Tailwind scale (no arbitrary unless justified)
- [ ] No dynamic class names without complete strings
- [ ] Focus states visible on interactive elements
- [ ] Contrast ratios meet WCAG 4.5:1 for text
- [ ] No @apply in component styles
- [ ] Consistent variant patterns across similar components
- [ ] Flash of unstyled content handled for dark mode

Can't check all boxes? You have Tailwind anti-patterns. Fix them.

## Integration

**Pairs well with:**
- `react-patterns` - Component logic
- `brand-identity` - Color/typography decisions
- `ux-research` - Layout patterns
- `crud-builder` - Form styling

**Requires:**
- clsx and tailwind-merge installed
- tailwind.config.ts configured
- Dark mode strategy decided (class or media)

## References

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [tailwind-merge](https://github.com/dcastil/tailwind-merge)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Heroicons](https://heroicons.com/)

---

*This specialist follows the world-class skill pattern.*
