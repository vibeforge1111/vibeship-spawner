# Sharp Edges: UI Design

Critical mistakes that make interfaces confusing, inaccessible, or unusable.

---

## 1. The Contrast Crime

**Severity:** Critical
**Situation:** Using light gray text on white, or any low-contrast combination
**Why Dangerous:** WCAG requires 4.5:1 for normal text, 3:1 for large text. Low contrast fails 15% of users.

```
THE TRAP:
"Light gray looks more elegant"
"The brand colors are soft pastels"
"It looks fine on my Retina display"

THE REALITY:
- 8% of men have color vision deficiency
- Screen brightness varies wildly
- Aging eyes need more contrast
- Sunlight on mobile screens

BAD:
#999999 on #FFFFFF → 2.85:1 (FAILS)
#CCCCCC on #FFFFFF → 1.60:1 (FAILS)
Light blue on white  → Usually fails

GOOD:
#595959 on #FFFFFF → 7.0:1 (AAA)
#767676 on #FFFFFF → 4.54:1 (AA)
Use a contrast checker, every time
```

---

## 2. The Touch Target Terror

**Severity:** Critical
**Situation:** Interactive elements smaller than 44x44px on mobile
**Why Dangerous:** Small targets = misclicks, frustration, accessibility failure.

```
THE TRAP:
- Icon buttons at 24px
- Links in dense text
- Close buttons in corners
- Checkbox labels that don't work

MINIMUM SIZES:
iOS: 44x44 points
Android: 48x48 dp
Web: 44x44 CSS pixels

FIXES:
1. Padding increases hit area
   <button style="padding: 12px">
     <icon size="20px" />
   </button>
   // Icon is 20px, target is 44px

2. Invisible touch expansion
   button::before {
     content: '';
     position: absolute;
     inset: -12px;
   }

3. Full-width list items
   Entire row is clickable, not just text
```

---

## 3. The Font Size Fiasco

**Severity:** High
**Situation:** Body text below 16px, or not respecting user font settings
**Why Dangerous:** Small text is unreadable. Fixed text breaks accessibility.

```
THE TRAP:
- 12px body text "looks cleaner"
- Using px instead of rem
- !important on font sizes
- Ignoring browser zoom

MINIMUM SIZES:
Body text: 16px (1rem) minimum
Captions: 14px with good contrast
Never go below 12px for anything

RESPONSIVE TYPE:
/* Base */
html { font-size: 100%; } /* 16px default */

/* Scale with viewport, within limits */
html {
  font-size: clamp(1rem, 0.9rem + 0.5vw, 1.25rem);
}

/* Allow user preferences */
html {
  font-size: 100%; /* Respects browser setting */
}
p {
  font-size: 1rem; /* Scales with user preference */
}
```

---

## 4. The Inconsistent Component

**Severity:** High
**Situation:** Same component looks or behaves differently across the product
**Why Dangerous:** Inconsistency creates cognitive load. Users must relearn.

```
THE TRAP:
Button styles:
- Page A: Rounded, blue, 14px
- Page B: Square, green, 16px
- Page C: Pill, blue, 12px

THE FIX - DESIGN TOKENS:
/* Single source of truth */
:root {
  --button-radius: 6px;
  --button-primary-bg: #2563eb;
  --button-font-size: 0.875rem;
  --button-padding: 0.5rem 1rem;
}

/* All buttons use tokens */
.button {
  border-radius: var(--button-radius);
  background: var(--button-primary-bg);
  font-size: var(--button-font-size);
  padding: var(--button-padding);
}

COMPONENT LIBRARY:
1. Document all variants
2. Show usage guidelines
3. Explain when to use each
4. Lock down modifications
```

---

## 5. The Disabled State Disaster

**Severity:** High
**Situation:** Disabled elements that are invisible or confusing
**Why Dangerous:** Users don't understand what's wrong or what to do.

```
BAD PATTERNS:
- Light gray on light gray (invisible)
- No cursor change
- No explanation why it's disabled
- Removes the element entirely

GOOD DISABLED STATES:
1. Visible but clearly inactive
   opacity: 0.5;
   cursor: not-allowed;

2. Explain WHY it's disabled
   <button disabled aria-describedby="why">
     Submit
   </button>
   <span id="why">
     Please fill required fields
   </span>

3. Show what enables it
   "Add items to cart to checkout"

4. Consider hiding vs disabling
   If users can NEVER use it → hide
   If users need to DO something → disable + explain
```

---

## 6. The Color-Only Meaning

**Severity:** Critical (Accessibility)
**Situation:** Using color as the only way to convey information
**Why Dangerous:** Color blind users, monochrome displays, print.

```
BAD:
- Red = error, green = success (only)
- Required fields marked with red asterisk only
- Charts with colored lines only
- Status dots with no text

GOOD:
Error: Red color + icon + text
  ❌ Email is invalid

Success: Green color + icon + text
  ✓ Saved successfully

Required: Asterisk + label text
  Email* (required)

Charts: Color + pattern + labels
  [///] Revenue (green, striped)
  [===] Costs (red, dashed)

Status: Color + icon + text
  🟢 Online | 🔴 Offline
  ✓ Active | ✗ Inactive
```

---

## 7. The Modal Trap

**Severity:** High
**Situation:** Modals that trap users, stack infinitely, or lack escape
**Why Dangerous:** Users feel stuck. Keyboard users literally are stuck.

```
MODAL REQUIREMENTS:

1. Focus trap (accessibility)
   Focus must stay inside modal
   Tab cycles through modal elements

2. Escape routes
   - X button (obvious)
   - Escape key (keyboard)
   - Click outside (optional but expected)

3. Return focus
   When modal closes, focus returns to trigger

4. No modal inception
   Modal → Modal → Modal = UX nightmare
   If you need this, rethink the flow

5. Scroll lock
   Body doesn't scroll behind modal
   Modal content scrolls if needed

6. Mobile consideration
   Full screen or bottom sheet
   Not a tiny box in the middle

ARIA REQUIREMENTS:
<div role="dialog"
     aria-modal="true"
     aria-labelledby="modal-title"
     aria-describedby="modal-desc">
```

---

## 8. The Invisible Focus

**Severity:** Critical (Accessibility)
**Situation:** Removing focus outlines with `outline: none`
**Why Dangerous:** Keyboard users cannot navigate. WCAG violation.

```
THE CRIME:
*:focus {
  outline: none; /* NEVER DO THIS */
}

button:focus {
  outline: 0; /* STILL BAD */
}

THE FIX - FOCUS-VISIBLE:
/* Only hide for mouse users */
button:focus {
  outline: none;
}

button:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}

/* Or use a custom focus style */
button:focus-visible {
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.5);
}

REQUIREMENTS:
- Clearly visible
- High contrast
- Consistent across site
- Works on all interactive elements
```

---

## 9. The Animation Assault

**Severity:** High
**Situation:** Animations that are too fast, too slow, or too much
**Why Dangerous:** Motion sickness, vestibular disorders, distraction.

```
BAD ANIMATIONS:
- Duration > 500ms (feels slow)
- Duration < 100ms (feels jarring)
- Parallax scrolling
- Auto-playing video backgrounds
- Infinite loading spinners
- Bounce/elastic that's too bouncy

GOOD ANIMATION PRINCIPLES:
Duration: 150-300ms for most UI
Easing: ease-out for entrances
        ease-in for exits
        ease-in-out for position changes

RESPECT PREFERENCES:
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}

PURPOSE OF MOTION:
✓ Showing connection (this came from there)
✓ Confirming action (button pressed)
✓ Guiding attention (notification appeared)
✗ Decoration (things floating around)
```

---

## 10. The Spacing Chaos

**Severity:** High
**Situation:** Inconsistent spacing throughout the interface
**Why Dangerous:** Creates visual disorder, breaks grouping, looks amateur.

```
THE CHAOS:
margin: 17px; /* why 17? */
padding: 13px 22px; /* random */
gap: 9px; /* no rhythm */

THE SYSTEM - 4px/8px BASE:
4px   - Minimal (icon to text)
8px   - Tight (related items)
16px  - Standard (form fields)
24px  - Relaxed (sections)
32px  - Spacious (major sections)
48px  - Dramatic (page breaks)
64px  - Maximum (hero sections)

IMPLEMENTATION:
:root {
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 1rem;     /* 16px */
  --space-4: 1.5rem;   /* 24px */
  --space-5: 2rem;     /* 32px */
  --space-6: 3rem;     /* 48px */
  --space-7: 4rem;     /* 64px */
}

LAW OF PROXIMITY:
Related items: Close together
Unrelated items: Far apart
The space BETWEEN tells users what BELONGS together
```

---

## 11. The Hover-Only Action

**Severity:** Critical
**Situation:** Important actions only visible on hover
**Why Dangerous:** Touch devices have no hover. Discovery impossible.

```
BAD PATTERNS:
- Delete button appears on row hover
- Edit controls hidden until hover
- Navigation submenus on hover only
- Tooltips with essential info

THE PROBLEM:
- Mobile: No hover state exists
- Keyboard: No cursor to trigger
- Discoverability: Users don't know to hover

ALTERNATIVES:
1. Always visible (best for critical actions)
   [Item Name]  [Edit] [Delete]

2. Progressive disclosure
   [Item Name]  [...] → [Edit] [Delete]
   Three-dot menu is discoverable

3. Swipe actions (mobile)
   ← Swipe reveals actions →
   With visual hint it's possible

4. Long press (touch)
   Context menu on long press
   But provide alternative

5. Selection mode
   [□] Select items → bulk action bar appears
```

---

## 12. The Z-Index War

**Severity:** Medium
**Situation:** Z-index values spiraling: 999, 9999, 99999...
**Why Dangerous:** Unmaintainable. Components fight. Bugs appear randomly.

```
THE WAR:
.dropdown { z-index: 100; }
.modal { z-index: 999; }
.toast { z-index: 9999; }
.tooltip { z-index: 99999; }
/* New dev adds emergency fix */
.important { z-index: 999999999; }

THE PEACE - STACKING CONTEXT SCALE:
:root {
  --z-dropdown: 100;
  --z-sticky: 200;
  --z-fixed: 300;
  --z-modal-backdrop: 400;
  --z-modal: 500;
  --z-popover: 600;
  --z-tooltip: 700;
  --z-toast: 800;
}

RULES:
1. Use the scale, nothing outside it
2. Create stacking contexts intentionally
3. Document the hierarchy
4. Review z-index in code review

STACKING CONTEXT RESET:
.modal {
  isolation: isolate; /* New stacking context */
}
/* Children z-index only compete within modal */
```
