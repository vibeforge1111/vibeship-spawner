# Patterns: UI Design

Proven visual design patterns that create clear, usable, and beautiful interfaces.

---

## Pattern 1: The 8-Point Grid

**Context:** Establishing consistent spacing and sizing throughout an interface.

**The Pattern:**
```
All dimensions are multiples of 8px.

SPACING SCALE:
8px   - Tight coupling (icon + text)
16px  - Related elements (form field + label)
24px  - Section content
32px  - Section boundaries
48px  - Major section breaks
64px  - Page-level separation

SIZING:
Icon sizes: 16, 24, 32, 40, 48
Button heights: 32 (small), 40 (medium), 48 (large)
Input heights: 40 (standard), 48 (touch-friendly)
Card padding: 16 or 24

EXCEPTIONS:
Typography can use 4px for fine-tuning line-height
Border widths: 1px, 2px are fine

WHY 8?
- Divisible by 2 and 4 (scaling)
- Works with common screen densities
- Easy mental math
- Industry standard

IMPLEMENTATION:
:root {
  --spacing-unit: 8px;
  --space-1: calc(var(--spacing-unit) * 1);  /* 8px */
  --space-2: calc(var(--spacing-unit) * 2);  /* 16px */
  --space-3: calc(var(--spacing-unit) * 3);  /* 24px */
  --space-4: calc(var(--spacing-unit) * 4);  /* 32px */
  --space-6: calc(var(--spacing-unit) * 6);  /* 48px */
  --space-8: calc(var(--spacing-unit) * 8);  /* 64px */
}
```

---

## Pattern 2: Visual Hierarchy Stack

**Context:** Ensuring users see the most important things first.

**The Pattern:**
```
HIERARCHY TOOLS (in order of power):

1. SIZE
   Biggest = most important
   H1 > H2 > H3 > Body
   Hero CTA > Secondary CTA

2. COLOR/CONTRAST
   High contrast = draws attention
   Primary color = action
   Muted = secondary

3. WEIGHT
   Bold = emphasis
   Regular = normal
   Light = de-emphasis

4. POSITION
   Top-left = primary (LTR cultures)
   Center = focus point
   Bottom-right = completion/next step

5. WHITE SPACE
   More space around = more importance
   Isolation draws attention

APPLICATION:
┌─────────────────────────────────────────┐
│  BIG BOLD HEADLINE                      │  ← Size + Weight
│  Subtitle with supporting context       │  ← Size (smaller)
│                                         │  ← White space
│  Body text explaining the details       │  ← Normal weight
│  with additional information here.      │
│                                         │
│  [ Primary Action ]  Secondary Link     │  ← Color + Position
└─────────────────────────────────────────┘

RULE: Only ONE primary element per viewport
If everything is emphasized, nothing is.
```

---

## Pattern 3: The Component Anatomy

**Context:** Building components that are flexible but consistent.

**The Pattern:**
```
Every component has these layers:

1. CONTAINER
   - Defines boundaries
   - Sets internal spacing
   - Handles variants (sizes, states)

2. CONTENT
   - The actual stuff inside
   - Text, icons, images
   - Follows its own rules

3. STATES
   - Default
   - Hover
   - Active/Pressed
   - Focus
   - Disabled
   - Loading
   - Error

BUTTON ANATOMY:
┌─────────────────────────────────┐
│ ┌─ Content ──────────────────┐ │
│ │  [Icon]  Button Text       │ │
│ └────────────────────────────┘ │
│ ← Padding →                     │
└─────────────────────────────────┘
↑ Border/Background

STATES DEFINITION:
.button {
  /* Default */
  background: var(--primary);

  &:hover {
    background: var(--primary-hover);
  }

  &:active {
    background: var(--primary-pressed);
    transform: scale(0.98);
  }

  &:focus-visible {
    outline: 2px solid var(--focus-ring);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &[data-loading] {
    color: transparent;
    /* Spinner overlay */
  }
}
```

---

## Pattern 4: Type Scale with Purpose

**Context:** Creating a typography system that communicates hierarchy.

**The Pattern:**
```
TYPE SCALE (Major Third - 1.25 ratio):
12px  - Caption, labels
14px  - Small body, metadata
16px  - Body (base)
20px  - Lead paragraph
25px  - H4
31px  - H3
39px  - H2
49px  - H1
61px  - Display

PRACTICAL IMPLEMENTATION:
:root {
  --text-xs: 0.75rem;   /* 12px */
  --text-sm: 0.875rem;  /* 14px */
  --text-base: 1rem;    /* 16px */
  --text-lg: 1.25rem;   /* 20px */
  --text-xl: 1.563rem;  /* 25px */
  --text-2xl: 1.953rem; /* 31px */
  --text-3xl: 2.441rem; /* 39px */
  --text-4xl: 3.052rem; /* 49px */
}

LINE HEIGHTS:
Headings: 1.1 - 1.3 (tight)
Body: 1.5 - 1.7 (readable)
Captions: 1.4 (moderate)

LETTER SPACING:
Large headings: -0.02em (tighten)
Body: 0 (default)
All caps: 0.05em (loosen)
Small text: 0.01em (slight loosen)

USAGE RULES:
- Never skip heading levels (H1 → H3)
- Only one H1 per page
- Use weight, not just size, for hierarchy
```

---

## Pattern 5: Color System Architecture

**Context:** Building a color system that scales and adapts.

**The Pattern:**
```
THREE COLOR LAYERS:

1. PRIMITIVES (Raw palette)
   Blue-50, Blue-100, Blue-200...Blue-900
   Gray-50, Gray-100...Gray-900
   Red, Green, Yellow scales

2. SEMANTIC TOKENS (Meaning)
   --color-primary: var(--blue-600)
   --color-error: var(--red-600)
   --color-success: var(--green-600)
   --color-warning: var(--yellow-600)

3. COMPONENT TOKENS (Context)
   --button-primary-bg: var(--color-primary)
   --button-primary-text: white
   --input-border: var(--gray-300)
   --input-error-border: var(--color-error)

DARK MODE ARCHITECTURE:
:root {
  --bg-primary: white;
  --bg-secondary: var(--gray-50);
  --text-primary: var(--gray-900);
  --text-secondary: var(--gray-600);
}

[data-theme="dark"] {
  --bg-primary: var(--gray-900);
  --bg-secondary: var(--gray-800);
  --text-primary: white;
  --text-secondary: var(--gray-300);
}

/* Components use semantic tokens */
.card {
  background: var(--bg-primary);
  color: var(--text-primary);
}
/* Automatically adapts to dark mode */

ACCESSIBLE COLOR PAIRS:
Always define foreground + background together
Test contrast ratios for each pair
Document minimum requirements
```

---

## Pattern 6: Responsive Layout Strategy

**Context:** Designing layouts that work across all screen sizes.

**The Pattern:**
```
BREAKPOINT STRATEGY:
Mobile-first (start small, enhance up)

320px  - Minimum (never design smaller)
375px  - Common mobile
640px  - Large mobile / small tablet
768px  - Tablet
1024px - Small desktop
1280px - Desktop
1536px - Large desktop

LAYOUT SHIFTS:
Mobile (320-639):
  - Single column
  - Stacked navigation (hamburger)
  - Full-width cards
  - Bottom-fixed CTAs

Tablet (640-1023):
  - 2-column where appropriate
  - Visible navigation (possibly collapsed)
  - Side-by-side forms

Desktop (1024+):
  - Multi-column layouts
  - Persistent navigation
  - More information density

FLUID DESIGN RULES:
1. Use relative units (%, vw, rem)
2. Set max-width on containers (1280px typical)
3. Let content breathe with padding
4. Test at awkward widths (600px, 900px)

CONTAINER:
.container {
  width: 100%;
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 16px;
}

@media (min-width: 640px) {
  .container { padding: 0 24px; }
}

@media (min-width: 1024px) {
  .container { padding: 0 32px; }
}
```

---

## Pattern 7: Progressive Disclosure

**Context:** Managing complexity by revealing information as needed.

**The Pattern:**
```
LEVELS OF DISCLOSURE:

Level 1: Essential (always visible)
  - Primary action
  - Key information
  - Navigation essentials

Level 2: Important (one click/tap away)
  - Settings and preferences
  - Additional actions
  - Supporting details

Level 3: Advanced (buried intentionally)
  - Rarely used options
  - Technical settings
  - Destructive actions

IMPLEMENTATION PATTERNS:

1. ACCORDION
   [+] Section Title
       Expanded content here...
   [+] Another Section

2. TABS
   [Tab 1] [Tab 2] [Tab 3]
   ╔═══════════════════════════╗
   ║ Content for selected tab  ║
   ╚═══════════════════════════╝

3. SHOW MORE
   First paragraph visible...
   [Show more ↓]

4. PROGRESSIVE FORM
   Step 1: Basic info
   Step 2: Details (appears after step 1)
   Step 3: Confirmation

5. OVERFLOW MENU
   [Primary] [Secondary] [⋮]
                         ├─ Option 1
                         ├─ Option 2
                         └─ Option 3

RULES:
- Primary action never hidden
- Critical info never behind interaction
- Related items disclosed together
- Clear path to find hidden items
```

---

## Pattern 8: Feedback Loop Design

**Context:** Showing users the system is responding to their actions.

**The Pattern:**
```
EVERY ACTION NEEDS FEEDBACK:

1. IMMEDIATE (0-100ms)
   Button press: Visual change
   Click: State change
   Hover: Cursor + highlight

   .button:active {
     transform: scale(0.98);
     background: darker;
   }

2. PROGRESS (100ms - 3s)
   Loading: Spinner or skeleton
   Saving: "Saving..." indicator
   Processing: Progress bar

   <button>
     {loading ? <Spinner /> : 'Submit'}
   </button>

3. COMPLETION (instant when done)
   Success: Confirmation + checkmark
   Error: Clear message + recovery
   Warning: Explanation + options

   <Toast type="success">
     ✓ Saved successfully
   </Toast>

4. PERSISTENT STATE
   Saved indicator: "Last saved 2m ago"
   Sync status: Cloud icon with state
   Connection: Online/offline badge

FEEDBACK TYPES:
- Visual: Color, icon, animation
- Textual: Status messages
- Positional: Progress indicators
- Temporal: Timestamps, durations

ANTI-PATTERNS:
✗ Silent failures
✗ Infinite spinners
✗ Success without confirmation
✗ Error without explanation
✗ Action without any response
```

---

## Pattern 9: Form Design Excellence

**Context:** Creating forms that are easy to complete correctly.

**The Pattern:**
```
FORM PRINCIPLES:

1. LABELS
   - Always visible (not just placeholder)
   - Above the field (most scannable)
   - Clear and concise

   <label for="email">Email address</label>
   <input id="email" type="email" />

2. PLACEHOLDER
   - Example, not instruction
   - Disappears on focus

   placeholder="john@example.com"
   NOT: "Enter your email"

3. HELP TEXT
   - Below field
   - Before user makes mistake

   <input id="password" />
   <span class="help">
     Minimum 8 characters
   </span>

4. VALIDATION
   - Real-time when helpful
   - On blur for most fields
   - On submit as backup

   <input id="email" aria-invalid="true" />
   <span class="error" role="alert">
     Please enter a valid email
   </span>

5. LAYOUT
   Single column (usually best)
   Group related fields
   Logical tab order

FIELD SIZING:
- Email/Text: Full width
- Phone: Sized for content (smaller)
- Dates: Sized for content
- State/Country: Sized for dropdown

SUBMIT:
- Clear primary action
- Disabled until valid (with explanation)
- Loading state on submit
```

---

## Pattern 10: Empty State Design

**Context:** What users see when there's no content yet.

**The Pattern:**
```
EMPTY STATE COMPONENTS:

1. ILLUSTRATION
   Friendly, relevant visual
   Not too large (not the point)
   Optional for subtle empty states

2. MESSAGE
   What is this space for?
   Why is it empty?
   "No messages yet"
   "Your cart is empty"

3. ACTION
   How to fill it
   Clear, specific CTA
   "Send your first message"
   "Start shopping"

EXAMPLES:

FIRST-TIME USER:
┌─────────────────────────────────────────┐
│            [Illustration]               │
│                                         │
│        Welcome to Messages!             │
│   Connect with your team in real time   │
│                                         │
│        [ Start a conversation ]         │
└─────────────────────────────────────────┘

SEARCH NO RESULTS:
┌─────────────────────────────────────────┐
│   No results for "xyz123"               │
│                                         │
│   Suggestions:                          │
│   • Check your spelling                 │
│   • Try different keywords              │
│   • Browse categories                   │
│                                         │
│   [ Clear search ]                      │
└─────────────────────────────────────────┘

ERROR STATE:
┌─────────────────────────────────────────┐
│            [Error icon]                 │
│                                         │
│     Unable to load your messages        │
│                                         │
│   [ Try again ]   [ Contact support ]   │
└─────────────────────────────────────────┘

ZERO DATA (Dashboard):
┌─────────────────────────────────────────┐
│   Analytics                             │
│   ┌─────────────────────────────────┐   │
│   │  Once you have visitors,        │   │
│   │  your data will appear here.    │   │
│   │  [Share your site]              │   │
│   └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```
