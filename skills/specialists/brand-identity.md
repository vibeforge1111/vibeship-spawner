# Brand Identity Specialist

## Identity

- **Tags**: `brand`, `colors`, `typography`, `design-system`, `theming`
- **Domain**: Color palettes, typography, visual language, brand guidelines
- **Use when**: New project styling, brand decisions, design system setup

---

## Patterns

### Color Palette Structure

```typescript
// Brand colors should have:
// 1. Primary color (main brand color)
// 2. Secondary color (accent/CTA)
// 3. Neutral scale (grays for text/backgrounds)
// 4. Semantic colors (success, warning, error, info)

// tailwind.config.ts
const colors = {
  // Primary - Your brand color
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

  // Secondary - Accent/CTA
  secondary: {
    // ... similar scale
  },

  // Neutral - Gray scale
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

  // Semantic
  success: { /* green scale */ },
  warning: { /* yellow scale */ },
  error: { /* red scale */ },
  info: { /* blue scale */ },
};
```

### Color Selection Guidelines

```
Primary Color Selection:
- SaaS/Tech: Blue (#0ea5e9) - Trust, professionalism
- Health/Wellness: Green (#10b981) - Growth, health
- Finance: Navy (#1e40af) - Security, stability
- Creative: Purple (#8b5cf6) - Innovation, creativity
- E-commerce: Orange (#f97316) - Energy, action
- Enterprise: Gray-blue (#475569) - Sophistication

Contrast Requirements:
- Text on background: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum
```

### Typography Scale

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
  '6xl': ['3.75rem', { lineHeight: '1' }],        // 60px - display
};

// Font family recommendations
const fontFamily = {
  // Modern SaaS
  sans: ['Inter', 'system-ui', 'sans-serif'],

  // Technical/Developer
  mono: ['JetBrains Mono', 'Fira Code', 'monospace'],

  // Editorial/Content
  serif: ['Merriweather', 'Georgia', 'serif'],

  // Headings (if different from body)
  display: ['Cal Sans', 'Inter', 'sans-serif'],
};
```

### Typography Hierarchy

```css
/* Heading styles */
h1, .h1 {
  @apply text-4xl font-bold tracking-tight;
  /* 36px, bold, tight letter-spacing */
}

h2, .h2 {
  @apply text-3xl font-semibold tracking-tight;
  /* 30px, semibold */
}

h3, .h3 {
  @apply text-2xl font-semibold;
  /* 24px, semibold */
}

h4, .h4 {
  @apply text-xl font-medium;
  /* 20px, medium */
}

/* Body styles */
.body-large {
  @apply text-lg text-gray-700;
}

.body {
  @apply text-base text-gray-600;
}

.body-small {
  @apply text-sm text-gray-500;
}

/* Utility */
.caption {
  @apply text-xs text-gray-400 uppercase tracking-wider;
}
```

### Spacing Scale

```typescript
// Use 4px base unit (Tailwind default)
// 1 = 4px, 2 = 8px, 4 = 16px, 8 = 32px, etc.

const spacing = {
  // Component internal spacing
  'component-xs': '0.25rem',  // 4px
  'component-sm': '0.5rem',   // 8px
  'component-md': '0.75rem',  // 12px
  'component-lg': '1rem',     // 16px

  // Section spacing
  'section-sm': '2rem',       // 32px
  'section-md': '4rem',       // 64px
  'section-lg': '6rem',       // 96px
  'section-xl': '8rem',       // 128px
};

// Consistent spacing pattern:
// - Cards: p-4 (16px) or p-6 (24px)
// - Sections: py-16 (64px) or py-24 (96px)
// - Form fields: space-y-4 (16px)
// - List items: space-y-2 (8px)
```

### Component Visual Language

```typescript
// Border radius scale
const borderRadius = {
  none: '0',
  sm: '0.25rem',    // 4px - subtle
  DEFAULT: '0.5rem', // 8px - standard
  md: '0.5rem',
  lg: '0.75rem',    // 12px - cards
  xl: '1rem',       // 16px - modals
  '2xl': '1.5rem',  // 24px - large cards
  full: '9999px',   // pills, avatars
};

// Shadow scale
const boxShadow = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
};

// When to use:
// - Cards: shadow-sm or shadow
// - Dropdowns: shadow-lg
// - Modals: shadow-xl
// - Hover states: shadow-md
```

### Dark Mode Tokens

```typescript
// CSS Variables approach (recommended)
// globals.css
:root {
  /* Light mode */
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

// Usage in Tailwind
// bg-background text-foreground
// border-border
```

### Brand Voice Elements

```
Tone Matrix:
┌─────────────────────────────────────────┐
│ Formal ◄─────────────────────► Casual   │
│ Technical ◄───────────────► Accessible  │
│ Serious ◄─────────────────► Playful     │
│ Authoritative ◄───────────► Friendly    │
└─────────────────────────────────────────┘

SaaS Default: Slightly casual, accessible, friendly but professional

Copy Patterns:
- Headlines: Clear value proposition, action-oriented
- Body: Benefit-focused, scannable, concise
- CTAs: Action verbs, urgency without pressure
- Error messages: Helpful, blame-free, solution-focused
```

---

## Anti-patterns

### Too Many Colors

```typescript
// BAD - Color chaos
colors: {
  brandBlue: '#1e40af',
  accentBlue: '#3b82f6',
  lightBlue: '#60a5fa',
  ctaOrange: '#f97316',
  headerGreen: '#10b981',
  // ... 20 more random colors
}

// GOOD - Systematic palette
colors: {
  primary: { /* one color, 10 shades */ },
  gray: { /* neutral scale */ },
  // Semantic only as needed
}
```

### Inconsistent Spacing

```tsx
// BAD - Random values
<div className="p-3 mt-7 mb-5 gap-9 px-11">

// GOOD - Use scale consistently
<div className="p-4 mt-8 mb-4 gap-8 px-4">
```

### Font Soup

```css
/* BAD - Too many fonts */
h1 { font-family: 'Playfair Display'; }
h2 { font-family: 'Montserrat'; }
body { font-family: 'Open Sans'; }
.button { font-family: 'Roboto'; }

/* GOOD - 1-2 fonts max */
body { font-family: 'Inter', sans-serif; }
code { font-family: 'JetBrains Mono', monospace; }
```

---

## Gotchas

### 1. Color Accessibility

Test all color combinations for WCAG compliance. Use tools like WebAIM Contrast Checker.

### 2. System Font Fallbacks

Always include fallbacks for custom fonts:
```css
font-family: 'Inter', system-ui, -apple-system, sans-serif;
```

### 3. Dark Mode Isn't Just Inverted

Don't just invert colors. Reduce contrast slightly, use different accent intensities.

### 4. Brand Color ≠ UI Color

Your brand color might be too saturated for large UI areas. Use tints for backgrounds.

---

## Checkpoints

Before marking brand setup complete:

- [ ] Primary color with full shade scale
- [ ] Neutral gray scale defined
- [ ] Semantic colors (success, error, warning)
- [ ] Typography scale with hierarchy
- [ ] Spacing scale consistent
- [ ] Border radius tokens
- [ ] Shadow scale
- [ ] Dark mode tokens (if needed)
- [ ] All colors pass contrast checks
- [ ] Fonts loading correctly

---

## Escape Hatches

### When the brand colors are ugly
- Desaturate for UI, use vibrant only for accents
- Consider a secondary neutral palette
- Ask stakeholder to reconsider

### When dark mode breaks everything
- Start with light mode, add dark later
- Use CSS variables from the start
- Consider "auto" only (system preference)

### When fonts don't load
- Use system fonts for MVP
- Add custom fonts as enhancement
- Ensure font-display: swap

---

## Squad Dependencies

Often paired with:
- `tailwind-ui` for implementation
- `crud-builder` for consistent forms
- `copywriting` for voice consistency

---

*Last updated: 2025-12-11*
