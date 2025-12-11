---
name: brand-identity
description: Use when setting up design systems or making visual decisions - enforces systematic color palettes, typography scales, and consistent spacing tokens
tags: [brand, colors, typography, design-system, theming]
---

# Brand Identity Specialist

## Overview

Visual inconsistency screams "amateur." Random colors, arbitrary spacing, and font soup destroy trust. A systematic design language makes your product feel polished and intentional.

**Core principle:** Define tokens once, use everywhere. Colors, typography, spacing, and shadows should come from a constrained system, not arbitrary values.

## The Iron Law

```
NO COLOR OR SPACING VALUE WITHOUT A DEFINED TOKEN
```

Every color should be from your palette. Every spacing value should be from your scale. Arbitrary values like `#3b82f6` or `p-7` scattered through code are bugs waiting to happen.

## When to Use

**Always:**
- Starting a new project
- Setting up Tailwind config
- Creating a design system
- Defining dark mode tokens
- Selecting fonts and type scale

**Don't:**
- One-off scripts or tools
- Backend-only code
- Prototypes that will be discarded

Thinking "I'll just use this one color here"? Stop. Add it to your palette or use an existing token.

## The Process

### Step 1: Define Core Palette

Choose primary, secondary, and neutral colors with full shade scales.

### Step 2: Set Up Typography

Select 1-2 fonts maximum. Define a consistent type scale.

### Step 3: Create Spacing System

Use a 4px or 8px base. Define component and section spacing tokens.

### Step 4: Add Semantic Tokens

Define success, warning, error, and info colors. Set up dark mode if needed.

## Patterns

### Systematic Color Palette

<Good>
```typescript
// tailwind.config.ts
const colors = {
  // Primary - main brand color with full scale
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',  // Main
    600: '#0284c7',  // Hover
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49',
  },

  // Neutral - gray scale for text/backgrounds
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712',
  },

  // Semantic - consistent across all projects
  success: { 500: '#10b981', 600: '#059669' },
  warning: { 500: '#f59e0b', 600: '#d97706' },
  error: { 500: '#ef4444', 600: '#dc2626' },
};
```
Full shade scales. Consistent naming. Semantic colors defined.
</Good>

<Bad>
```typescript
// Random colors scattered everywhere
colors: {
  brandBlue: '#1e40af',
  accentBlue: '#3b82f6',
  lightBlue: '#60a5fa',
  ctaOrange: '#f97316',
  headerGreen: '#10b981',
  textGray: '#374151',
  lightGray: '#f3f4f6',
  // 20 more random colors
}
```
No system. No scales. Impossible to maintain consistency.
</Bad>

### Typography Scale

<Good>
```typescript
// tailwind.config.ts
const fontSize = {
  xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px - labels
  sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px - small text
  base: ['1rem', { lineHeight: '1.5rem' }],     // 16px - body
  lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px - large body
  xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px - h4
  '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px - h3
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px - h2
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px - h1
  '5xl': ['3rem', { lineHeight: '1' }],           // 48px - hero
};

// 1-2 fonts maximum
const fontFamily = {
  sans: ['Inter', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'monospace'],
};
```
Consistent scale. Line heights defined. Limited font families.
</Good>

<Bad>
```css
/* Font soup */
h1 { font-family: 'Playfair Display'; font-size: 38px; }
h2 { font-family: 'Montserrat'; font-size: 28px; }
body { font-family: 'Open Sans'; font-size: 15px; }
.button { font-family: 'Roboto'; font-size: 14px; }
```
Too many fonts. Arbitrary sizes. No system.
</Bad>

### Spacing System

<Good>
```tsx
// Use Tailwind's 4px base consistently
// Component spacing: p-4 (16px), p-6 (24px)
// Section spacing: py-16 (64px), py-24 (96px)
// Form fields: space-y-4 (16px)
// List items: space-y-2 (8px)

// Card with consistent spacing
<div className="p-6 space-y-4">
  <h2 className="text-xl font-semibold">Title</h2>
  <p className="text-gray-600">Description</p>
  <div className="flex gap-4">
    <Button>Primary</Button>
    <Button variant="ghost">Secondary</Button>
  </div>
</div>
```
Consistent values from the scale. Predictable spacing.
</Good>

<Bad>
```tsx
// Random spacing values
<div className="p-3 mt-7 mb-5 gap-9 px-11">
  <h2 className="text-xl mb-3">Title</h2>
  <p className="mt-2 mb-7">Description</p>
</div>
```
Arbitrary values. No consistency. Visual chaos.
</Bad>

### Dark Mode with CSS Variables

<Good>
```css
/* globals.css */
:root {
  --background: 255 255 255;      /* white */
  --foreground: 17 24 39;         /* gray-900 */
  --card: 255 255 255;
  --card-foreground: 17 24 39;
  --primary: 14 165 233;          /* sky-500 */
  --primary-foreground: 255 255 255;
  --muted: 243 244 246;           /* gray-100 */
  --muted-foreground: 107 114 128; /* gray-500 */
  --border: 229 231 235;          /* gray-200 */
}

.dark {
  --background: 3 7 18;           /* gray-950 */
  --foreground: 249 250 251;      /* gray-50 */
  --card: 17 24 39;               /* gray-900 */
  --card-foreground: 249 250 251;
  --primary: 56 189 248;          /* sky-400 */
  --primary-foreground: 3 7 18;
  --muted: 31 41 55;              /* gray-800 */
  --muted-foreground: 156 163 175; /* gray-400 */
  --border: 55 65 81;             /* gray-700 */
}
```
Semantic variable names. Dark mode doesn't just invert. Proper contrast.
</Good>

<Bad>
```css
/* Just inverting colors */
.dark {
  background: black;
  color: white;
}

/* Or using Tailwind dark: everywhere */
<div className="bg-white dark:bg-black text-black dark:text-white">
```
No semantic tokens. Dark mode is just inverted. Hard to maintain.
</Bad>

### Component Visual Language

<Good>
```typescript
// Consistent border radius
const borderRadius = {
  sm: '0.25rem',    // 4px - subtle
  DEFAULT: '0.5rem', // 8px - buttons, inputs
  lg: '0.75rem',    // 12px - cards
  xl: '1rem',       // 16px - modals
  full: '9999px',   // pills, avatars
};

// Consistent shadows
const boxShadow = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',     // subtle
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1)', // cards
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',   // hover
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)', // dropdowns
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)', // modals
};
```
Defined scale. Clear use cases. Consistent application.
</Good>

<Bad>
```tsx
// Random values
<div className="rounded-[7px] shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
<div className="rounded-md shadow">
<div className="rounded-2xl shadow-lg">
```
Arbitrary border radius. Inconsistent shadows. No system.
</Bad>

## Anti-Patterns

| Anti-Pattern | Why It Fails | What To Do Instead |
|--------------|--------------|-------------------|
| Random hex colors in code | Impossible to maintain | Use color tokens from palette |
| More than 2 fonts | Visual chaos | Pick 1 sans, 1 mono maximum |
| Arbitrary spacing (p-7, mt-9) | Inconsistent rhythm | Stick to scale: 2, 4, 6, 8, 12, 16 |
| Dark mode by inversion | Poor contrast, looks wrong | Design dark mode intentionally |
| No semantic colors | Error red hardcoded everywhere | Define success/warning/error tokens |

## Red Flags - STOP

If you catch yourself:
- Using a hex color not in your palette
- Adding a third font family
- Using spacing values like 3, 5, 7, 9
- Adding `dark:` classes without CSS variables
- Using arbitrary values like `text-[15px]`

**ALL of these mean: STOP. Add the token to your system or use an existing one.**

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "This color is close enough" | Close enough = inconsistent. Add it to the palette. |
| "I need this specific size" | You probably don't. Use the scale. |
| "We'll consolidate later" | You won't. The mess will grow. Do it now. |
| "The designer gave me these values" | Work with design to systematize them. |
| "It's just one place" | One place becomes ten. Use tokens. |
| "Dark mode is too much work" | CSS variables make it trivial. Set them up. |

## Gotchas

### Color Accessibility

Test all color combinations for WCAG compliance:
- Text on background: 4.5:1 minimum
- Large text: 3:1 minimum
- Use WebAIM Contrast Checker

### Font Loading

```css
/* Always include fallbacks */
font-family: 'Inter', system-ui, -apple-system, sans-serif;

/* Use font-display: swap */
@font-face {
  font-family: 'Inter';
  font-display: swap;
}
```

### Brand Color ≠ UI Color

Your brand color might be too saturated for large UI areas. Use tints (lighter shades) for backgrounds.

### Dark Mode Contrast

Dark mode often needs LESS contrast than light mode. Pure white on pure black is harsh. Use gray-50 on gray-900.

## Verification Checklist

Before marking brand setup complete:

- [ ] Primary color with full shade scale (50-950)
- [ ] Neutral gray scale defined
- [ ] Semantic colors (success, warning, error)
- [ ] Typography scale with line heights
- [ ] 1-2 font families maximum
- [ ] Spacing scale using 4px base
- [ ] Border radius tokens
- [ ] Shadow scale
- [ ] CSS variables for dark mode
- [ ] All color combinations pass contrast checks
- [ ] Fonts loading with fallbacks

Can't check all boxes? You have brand system gaps. Fill them.

## Integration

**Pairs well with:**
- `tailwind-ui` - Implementation of design system
- `copywriting` - Voice and tone consistency
- `ux-research` - User flow visuals
- `server-client-boundary` - Theme provider setup

**Requires:**
- Tailwind CSS configuration
- CSS variables in globals.css
- Font files or Google Fonts setup

## References

- [Tailwind Color Palette Generator](https://uicolors.app/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Refactoring UI](https://www.refactoringui.com/)
- [Inter Font](https://rsms.me/inter/)

---

*This specialist follows the world-class skill pattern.*
