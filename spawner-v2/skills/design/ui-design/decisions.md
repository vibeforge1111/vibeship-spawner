# Decisions: UI Design

Critical decision points that determine interface success.

---

## Decision 1: Design Tool Selection

**Context:** Choosing the primary design tool for your team.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Figma** | Collaborative, web-based, industry standard | Subscription cost, Adobe ownership | Default choice for teams |
| **Sketch** | Mac-native, mature ecosystem | Mac only, collaboration requires plugins | Mac-only team, existing Sketch files |
| **Adobe XD** | Adobe integration, free tier | Smaller ecosystem, uncertain future | Heavy Adobe suite users |
| **Framer** | Code-like components, real interactions | Learning curve, expensive | Design-to-code, advanced prototypes |

**Framework:**
```
Design tool selection:

Team size?
├── Solo → Figma (free for individuals)
├── Team → Figma (collaboration built-in)
└── Enterprise → Figma or Sketch (depends on ecosystem)

Existing ecosystem?
├── Adobe suite → Consider XD
├── Heavy prototyping → Framer
└── Standard UI work → Figma

Developer handoff?
├── Need production code → Framer
├── Standard specs → Figma Dev Mode
└── Custom tooling → Any (export to tokens)

Cross-platform team?
├── Windows + Mac → Figma (web-based)
└── Mac only → Sketch is option

FIGMA ADVANTAGES:
1. Real-time collaboration (like Google Docs)
2. Web-based (no installs, any OS)
3. Free for individuals
4. Largest plugin ecosystem
5. Built-in prototyping
6. Dev mode for handoff
7. Industry standard (hiring, resources)
```

**Default Recommendation:** Figma. It's the industry standard, works everywhere, and handles collaboration best. Only consider alternatives with specific justification.

---

## Decision 2: Color Palette Approach

**Context:** Building a color system for your product.

**Options:**

| Approach | Pros | Cons | Choose When |
|----------|------|------|-------------|
| **Brand-derived** | Strong identity, cohesive | May lack functional colors | Consumer products, brand-heavy |
| **Functional-first** | Clear meaning, accessible | May feel generic | Enterprise, utility apps |
| **Tailwind defaults** | Proven, comprehensive | Same as everyone else | Speed, no designer, MVP |
| **Custom palette** | Unique, precise | Time-consuming, error-prone | Strong design vision, resources |

**Framework:**
```
Color system decision:

Starting point?
├── Strong brand colors → Derive system from brand
├── No brand yet → Start functional, add personality
└── Speed priority → Tailwind or Radix colors

Application type?
├── Consumer/lifestyle → Brand expression important
├── Enterprise/utility → Functional clarity priority
├── Dashboard/data → Neutral base + accent

Required colors:

NEUTRAL SCALE (Gray):
- Background levels (3-4 shades)
- Text levels (3-4 shades)
- Border levels (2-3 shades)

PRIMARY (Brand):
- Main action color
- Hover/active states
- Light variant for backgrounds

SEMANTIC:
- Success (green)
- Warning (yellow/orange)
- Error (red)
- Info (blue)

EXTENDED (optional):
- Secondary brand color
- Accent colors
- Data visualization palette

ACCESSIBILITY CHECK:
Every color pairing must pass contrast
Use tools: Contrast plugin, accessibleweb.com
Minimum 4.5:1 for text, 3:1 for large text/icons
```

**Default Recommendation:** Start with Tailwind or Radix color palette, customize primary to brand. This gives you proven accessible colors with room for identity.

---

## Decision 3: Typography System

**Context:** Selecting and scaling typefaces for your interface.

**Options:**

| Approach | Pros | Cons | Choose When |
|----------|------|------|-------------|
| **System fonts** | Zero load time, native feel | Less unique, varies by OS | Performance priority, utility apps |
| **Single webfont** | Consistent, brand expression | Load time, licensing cost | Brand consistency matters |
| **Font pair** | Hierarchy, visual interest | Complexity, more loading | Content-heavy, editorial |
| **Variable font** | Flexibility, single file | Browser support, complexity | Modern browsers, design flexibility |

**Framework:**
```
Typography selection:

Performance budget?
├── Strict → System fonts (Inter for cross-platform consistency)
├── Moderate → Single font, 2-3 weights
└── Flexible → Font pair, variable fonts

Content type?
├── Data/UI heavy → Sans-serif (Inter, Roboto)
├── Editorial/reading → Serif or humanist sans
├── Technical/code → Monospace available
└── Brand expression → Custom selection

FONT STACK PATTERNS:

System fonts (fastest):
font-family: system-ui, -apple-system, sans-serif;

Modern fallback:
font-family: 'Inter', system-ui, sans-serif;

Safe web fonts:
font-family: 'Inter', 'Roboto', 'Helvetica Neue', sans-serif;

SCALE APPROACH:
1. Choose base size (16px standard)
2. Choose ratio (1.25 major third, 1.2 minor third)
3. Generate scale: base × ratio^n
4. Round to practical values
5. Limit to 6-8 sizes

WEIGHT USAGE:
400 (Regular) - Body text
500 (Medium) - Subtle emphasis
600 (Semibold) - Strong emphasis, subheadings
700 (Bold) - Headlines, CTAs
```

**Default Recommendation:** Inter (or system fonts) with a major third scale (1.25). Inter is free, designed for screens, and widely supported.

---

## Decision 4: Component Library Strategy

**Context:** Building or adopting a component library.

**Options:**

| Approach | Pros | Cons | Choose When |
|----------|------|------|-------------|
| **Build from scratch** | Fully custom, exact needs | Expensive, slow, maintenance | Large team, unique needs, long-term |
| **Headless (Radix, Headless UI)** | Accessible, unstyled, flexible | Need design skills | Custom design, accessibility priority |
| **Styled (Chakra, MUI)** | Fast start, full ecosystem | Customization friction, bundle size | MVP, standard design, speed |
| **Tailwind UI** | Beautiful, well-designed | Cost, Tailwind dependency | Tailwind already in stack |

**Framework:**
```
Component library decision:

Team design resources?
├── No designer → Styled library (Chakra, Shadcn)
├── Designer → Headless + custom styles
└── Design team → Consider custom system

Timeline?
├── MVP (weeks) → Styled library
├── Launch (months) → Headless + design
└── Long-term → Custom or hybrid

Unique design requirements?
├── Standard UI → Any library works
├── Custom brand → Headless required
└── Highly unique → Custom build

Tech stack alignment?
├── React → Most options
├── Vue → Vuetify, Headless Vue
├── Svelte → Skeleton, custom

RECOMMENDED APPROACH (React):
shadcn/ui + Radix primitives
- Radix: Accessible headless components
- shadcn: Copy-paste styled components
- Result: Customizable, accessible, owned

COMPONENT OWNERSHIP:
- Copy into your codebase (shadcn model)
- Full control over styling
- Update on your schedule
- No breaking changes from upstream
```

**Default Recommendation:** shadcn/ui for React projects. It gives you beautiful, accessible components that you own and can customize. For non-React, use Radix-style headless libraries.

---

## Decision 5: Responsive Breakpoint Strategy

**Context:** Defining breakpoints for responsive design.

**Options:**

| Approach | Pros | Cons | Choose When |
|----------|------|------|-------------|
| **Device-based** | Matches real devices | Fragile, devices change | Specific device targets |
| **Content-based** | Breaks where design needs it | Non-standard, harder to communicate | Custom layouts |
| **Framework default** | Standard, documented | May not fit all designs | Using CSS framework |

**Framework:**
```
Breakpoint strategy:

STANDARD BREAKPOINTS (Tailwind):
sm:  640px  - Large phones, portrait tablets
md:  768px  - Tablets
lg:  1024px - Small desktops, landscape tablets
xl:  1280px - Desktops
2xl: 1536px - Large desktops

COMMON DEVICE WIDTHS (2024):
320px  - Older iPhones (SE)
375px  - iPhone 12/13 mini
390px  - iPhone 14/15
428px  - iPhone 14/15 Plus/Pro Max
768px  - iPad Mini
820px  - iPad Air
1024px - iPad Pro 11"
1366px - Common laptop
1920px - Full HD desktop

MOBILE-FIRST APPROACH:
/* Base styles (mobile) */
.component { width: 100%; }

/* Tablet and up */
@media (min-width: 768px) {
  .component { width: 50%; }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .component { width: 33.33%; }
}

BREAKPOINT RULES:
1. Mobile-first (start small, enhance)
2. Major layout shifts only (2-3 breakpoints)
3. Container max-width (1280-1440px)
4. Test at awkward sizes (600px, 900px)
5. Don't forget landscape mobile
```

**Default Recommendation:** Use Tailwind's breakpoints (640, 768, 1024, 1280) with mobile-first approach. They're well-tested and standard enough for team communication.

---

## Decision 6: Icon System

**Context:** Selecting and implementing icons throughout the product.

**Options:**

| Approach | Pros | Cons | Choose When |
|----------|------|------|-------------|
| **Icon font (FontAwesome)** | Easy, widely supported | All icons loaded, styling limits | Quick implementation |
| **SVG library (Heroicons, Lucide)** | Tree-shakable, full control | Setup required | Modern projects, performance |
| **Custom icons** | Unique, exact match | Expensive, maintenance | Strong brand, specific needs |
| **Icon component library** | React/Vue components | Framework lock-in | Component-based apps |

**Framework:**
```
Icon system decision:

Performance priority?
├── High → SVG library (tree-shakable)
├── Medium → Icon fonts okay
└── Low → Either works

Customization needs?
├── Color/size only → Any
├── Animations → SVG required
└── Custom designs → Custom icons

Framework?
├── React → Lucide React, Heroicons React
├── Vue → Heroicons Vue
├── Vanilla → SVG sprites or inline

RECOMMENDED: LUCIDE ICONS
- 1000+ icons
- MIT license (free)
- Tree-shakable
- Consistent style
- React/Vue/Svelte packages
- Active development

IMPLEMENTATION:
// React component approach
import { Home, Settings, User } from 'lucide-react';

<Home size={24} strokeWidth={2} />

// Size system
const iconSizes = {
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
};

// Wrapper component
function Icon({ name, size = 'md', ...props }) {
  const IconComponent = icons[name];
  return <IconComponent size={iconSizes[size]} {...props} />;
}
```

**Default Recommendation:** Lucide Icons (React/Vue package). Free, comprehensive, tree-shakable, and maintained. Heroicons is also excellent if you prefer that style.

---

## Decision 7: Motion/Animation Strategy

**Context:** Defining how and when to use animation.

**Options:**

| Approach | Pros | Cons | Choose When |
|----------|------|------|-------------|
| **Minimal (CSS only)** | Performance, simple | Less polished | Performance priority, utility |
| **Systematic (CSS + JS library)** | Consistent, reusable | Bundle size, learning curve | Refined experience |
| **Heavy animation** | Delightful, impressive | Performance, motion sickness | Marketing, first impressions |
| **None** | Simplest, accessible | Feels static | Accessibility priority |

**Framework:**
```
Animation strategy:

ANIMATION PURPOSES:
1. Feedback - Confirm user action
2. Orientation - Show where elements came from/go
3. Attention - Draw eye to changes
4. Delight - Make experience enjoyable

TIMING GUIDELINES:
Micro (buttons, inputs): 100-150ms
Small (dropdowns, tooltips): 150-200ms
Medium (modals, panels): 200-300ms
Large (page transitions): 300-500ms

Never exceed 500ms for UI animation

EASING:
ease-out: Entrances (element arriving)
ease-in: Exits (element leaving)
ease-in-out: Position changes (moving)
linear: Opacity, looping animations

CSS-FIRST APPROACH:
.button {
  transition:
    background-color 150ms ease-out,
    transform 100ms ease-out;
}

.button:hover {
  background-color: var(--primary-hover);
}

.button:active {
  transform: scale(0.98);
}

REDUCED MOTION:
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

**Default Recommendation:** Minimal CSS-first with systematic tokens. Use Framer Motion or similar only for complex interactions. Always respect prefers-reduced-motion.

---

## Decision 8: Dark Mode Strategy

**Context:** Whether and how to implement dark mode.

**Options:**

| Approach | Pros | Cons | Choose When |
|----------|------|------|-------------|
| **Light only** | Simpler, less maintenance | Missing user preference | MVP, resource constraints |
| **Dark only** | Trendy, less eye strain | Limits audience | Developer tools, media apps |
| **System preference** | Respects user, automatic | Less control | Most products |
| **User toggle + system** | Maximum control | Most complex | Full product |

**Framework:**
```
Dark mode decision:

User expectations?
├── Developer/tech audience → Dark mode expected
├── General consumer → Nice to have
├── Professional/enterprise → Light typically preferred

Implementation complexity budget?
├── Low → Skip or light-only
├── Medium → System preference only
├── High → Full toggle + system

IMPLEMENTATION:

CSS Variables approach:
:root {
  --bg-primary: white;
  --text-primary: #1a1a1a;
}

[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --text-primary: #fafafa;
}

/* Or system preference */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1a1a1a;
    --text-primary: #fafafa;
  }
}

DARK MODE PITFALLS:
1. Don't just invert colors
2. Reduce contrast slightly (not pure white on black)
3. Use darker shadows, not lighter
4. Images may need adjustment
5. Test every screen

COLOR ADJUSTMENT:
Light mode: Gray-900 on White
Dark mode: Gray-100 on Gray-900 (not pure)

Light shadows: rgba(0,0,0,0.1)
Dark shadows: rgba(0,0,0,0.3)
```

**Default Recommendation:** System preference detection with CSS custom properties. Add user toggle if audience expects it. Don't skip the work of properly adapting colors.

---

## Decision 9: Form Field Style

**Context:** Choosing how form inputs look and behave.

**Options:**

| Style | Pros | Cons | Choose When |
|-------|------|------|-------------|
| **Outlined** | Clear boundaries, accessible | Takes more space | Default, most forms |
| **Filled** | Compact, material design | Less distinct boundaries | Dense forms, Material |
| **Underlined** | Minimal, elegant | Less clear, accessibility | Simple forms, minimal aesthetic |
| **Floating label** | Saves space, animated | Complex, accessibility issues | Space constraints |

**Framework:**
```
Form field decision:

OUTLINED (Recommended default):
┌─────────────────────────────────┐
│ placeholder                     │
└─────────────────────────────────┘

Label above:
Email
┌─────────────────────────────────┐
│ john@example.com                │
└─────────────────────────────────┘

FILLED:
╔═════════════════════════════════╗
║ placeholder                     ║
╚═════════════════════════════════╝

UNDERLINED:
placeholder
─────────────────────────────────

FLOATING LABEL:
      Email
┌─────────────────────────────────┐
│ john@example.com                │
└─────────────────────────────────┘

ACCESSIBILITY CHECKLIST:
□ Label always visible (not placeholder-only)
□ Error state clear and described
□ Focus state visible
□ Touch target 44px minimum
□ Contrast meets WCAG

RECOMMENDED PATTERN:
<div class="field">
  <label for="email">Email</label>
  <input id="email" type="email" />
  <span class="error" role="alert" hidden>
    Please enter a valid email
  </span>
</div>
```

**Default Recommendation:** Outlined inputs with labels above. Most accessible, clearest, and works in all contexts. Avoid floating labels unless absolutely necessary for space.

---

## Decision 10: Design Token Organization

**Context:** Structuring design tokens for scalability.

**Options:**

| Approach | Pros | Cons | Choose When |
|----------|------|------|-------------|
| **Flat** | Simple, quick | Doesn't scale, no theming | Small project |
| **Semantic** | Meaningful names | More abstraction | Medium project |
| **Multi-tier** | Maximum flexibility | Complex | Large project, multi-brand |

**Framework:**
```
Token architecture:

TIER 1: PRIMITIVES (Raw values)
--blue-500: #3b82f6;
--gray-900: #111827;
--space-4: 1rem;

TIER 2: SEMANTIC (Meaning)
--color-primary: var(--blue-500);
--color-text: var(--gray-900);
--spacing-md: var(--space-4);

TIER 3: COMPONENT (Context)
--button-bg: var(--color-primary);
--button-padding: var(--spacing-md);

ORGANIZATION:
tokens/
├── primitives/
│   ├── colors.css
│   ├── spacing.css
│   └── typography.css
├── semantic/
│   ├── colors.css
│   └── spacing.css
├── components/
│   ├── button.css
│   ├── input.css
│   └── card.css
└── themes/
    ├── light.css
    └── dark.css

THEMING WITH TIERS:
/* Base theme */
:root {
  --color-bg: var(--white);
  --color-text: var(--gray-900);
}

/* Dark theme overrides semantic, not primitive */
[data-theme="dark"] {
  --color-bg: var(--gray-900);
  --color-text: var(--gray-100);
}

/* Component tokens use semantic */
.card {
  background: var(--color-bg);
  color: var(--color-text);
}
/* Automatically themed */
```

**Default Recommendation:** Two-tier (primitives + semantic) for most projects. Add component tier when you have a design system with multiple products or themes.
