# UX Research Specialist

## Identity

- **Layer**: Standalone (No technical dependencies)
- **Domain**: User flows, wireframes, usability patterns, information architecture
- **Triggers**: Feature planning, user flow design, navigation structure, UX decisions

---

## Patterns

### User Flow Mapping

```
Flow Diagram Structure:
┌─────────────────────────────────────────────────────────┐
│                      ENTRY POINT                         │
│                    (Landing Page)                        │
└─────────────────────┬───────────────────────────────────┘
                      │
         ┌────────────┴────────────┐
         ▼                         ▼
    ┌─────────┐              ┌─────────┐
    │ Sign Up │              │  Login  │
    └────┬────┘              └────┬────┘
         │                        │
         ▼                        │
    ┌─────────┐                   │
    │ Verify  │                   │
    │  Email  │                   │
    └────┬────┘                   │
         │                        │
         └────────────┬───────────┘
                      ▼
              ┌──────────────┐
              │  Dashboard   │
              │   (Goal)     │
              └──────────────┘

Key Questions:
- What's the user's goal?
- What's the shortest path?
- Where might they get stuck?
- What are the error states?
```

### Information Architecture

```
Sitemap Pattern (SaaS):

Home (/)
├── Features (/features)
├── Pricing (/pricing)
├── Blog (/blog)
│   └── [Post] (/blog/[slug])
├── Login (/login)
├── Sign Up (/signup)
└── Dashboard (/dashboard) [Protected]
    ├── Overview (/dashboard)
    ├── Projects (/dashboard/projects)
    │   ├── [Project] (/dashboard/projects/[id])
    │   └── New (/dashboard/projects/new)
    ├── Settings (/dashboard/settings)
    │   ├── Profile (/dashboard/settings/profile)
    │   ├── Billing (/dashboard/settings/billing)
    │   └── Team (/dashboard/settings/team)
    └── Help (/dashboard/help)

Principles:
- Max 3 levels deep
- Consistent URL patterns
- Group by user mental model
- Clear naming (no jargon)
```

### Navigation Patterns

```
Top Navigation (Marketing):
┌──────────────────────────────────────────────────────────┐
│ Logo    Features  Pricing  Blog     |  Login  Sign Up   │
└──────────────────────────────────────────────────────────┘

Dashboard Sidebar:
┌────────────────────────────────────────────────────────────┐
│ ┌──────────┐                                               │
│ │          │                                               │
│ │  Logo    │  Dashboard                                    │
│ │          │  Projects                                     │
│ │          │  Analytics                                    │
│ │ Sidebar  │  ──────────                                   │
│ │          │  Settings                                     │
│ │          │  Help                                         │
│ │          │                                               │
│ │          │  ──────────                                   │
│ │          │  [User Menu]                                  │
│ └──────────┘                                               │
└────────────────────────────────────────────────────────────┘

Mobile: Hamburger menu or bottom navigation bar
```

### Common UI Patterns

```
Empty States:
┌─────────────────────────────────────┐
│                                     │
│         [Illustration]              │
│                                     │
│     No projects yet                 │
│                                     │
│   Create your first project to     │
│        get started                  │
│                                     │
│       [Create Project]              │
│                                     │
└─────────────────────────────────────┘

Loading States:
- Skeleton screens (preferred)
- Spinner for quick operations
- Progress bar for long operations
- Optimistic updates when safe

Error States:
- Inline validation (immediate)
- Toast notifications (non-blocking)
- Error pages (blocking)
- Retry buttons when recoverable
```

### Form UX Patterns

```
Form Layout:
┌─────────────────────────────────────┐
│ Create New Project                  │
│                                     │
│ Project Name *                      │
│ ┌─────────────────────────────────┐ │
│ │ My Awesome Project              │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Description                         │
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│ Optional - helps team understand    │
│                                     │
│ Visibility                          │
│ ○ Public - Anyone can view          │
│ ● Private - Only team members       │
│                                     │
│ ─────────────────────────────────── │
│                                     │
│              [Cancel]  [Create]     │
└─────────────────────────────────────┘

Form Rules:
- Label above input (not placeholder-only)
- Required fields marked with *
- Helper text below field
- Inline validation on blur
- Primary action on the right
- One column for simple forms
```

### User Feedback Patterns

```
Feedback Hierarchy (by urgency):

1. Inline/Contextual (immediate)
   - Form validation
   - Character counts
   - Real-time previews

2. Toast/Snackbar (temporary, 3-5 seconds)
   - "Settings saved"
   - "Message sent"
   - Non-critical confirmations

3. Modal (requires attention)
   - Destructive confirmations
   - Important choices
   - Complex inputs

4. Full-page (major state change)
   - Onboarding
   - Error pages
   - Success/completion screens

5. Email (asynchronous)
   - Account changes
   - Important notifications
   - Receipts
```

### Progressive Disclosure

```
Show complexity gradually:

Level 1 - Essential (visible by default)
┌─────────────────────────────────────┐
│ Email: [________________]           │
│ Password: [________________]        │
│                                     │
│ ▼ Advanced options                  │
│                                     │
│              [Login]                │
└─────────────────────────────────────┘

Level 2 - Advanced (on demand)
┌─────────────────────────────────────┐
│ Email: [________________]           │
│ Password: [________________]        │
│                                     │
│ ▲ Advanced options                  │
│   ☐ Remember me                     │
│   ☐ Use 2FA                         │
│                                     │
│              [Login]                │
└─────────────────────────────────────┘
```

### Responsive Breakpoints

```
Mobile First Approach:

Mobile (< 640px):
- Single column
- Bottom navigation
- Full-width buttons
- Collapsed menus

Tablet (640px - 1024px):
- Two columns max
- Side navigation possible
- Medium touch targets

Desktop (> 1024px):
- Multi-column layouts
- Sidebar navigation
- Hover states
- Keyboard shortcuts
```

### Accessibility Checklist

```
WCAG 2.1 Level AA Minimum:

Perceivable:
☐ Color contrast 4.5:1 (text), 3:1 (large text)
☐ Text resizable to 200%
☐ Alt text for images
☐ Captions for video

Operable:
☐ Keyboard navigable (Tab, Enter, Escape)
☐ Focus indicators visible
☐ No keyboard traps
☐ Skip links for main content

Understandable:
☐ Clear labels
☐ Error identification
☐ Consistent navigation

Robust:
☐ Valid HTML
☐ ARIA where needed
☐ Works with screen readers
```

### User Testing Questions

```
Task-Based Testing:
1. "Find [feature] and use it"
2. "Complete [common task]"
3. "What would you do if [scenario]?"

Observation Points:
- Where did they hesitate?
- What did they click first?
- Did they find what they expected?
- What questions did they ask?

Post-Task Questions:
- "Was that what you expected?"
- "What was confusing?"
- "What would make this easier?"
- "How would you rate the difficulty? (1-5)"
```

---

## Anti-patterns

### Mystery Meat Navigation

```
// BAD - Icon-only navigation
[🏠] [⚙️] [📊] [👤]
// Users don't know what icons mean

// GOOD - Labels or tooltips
[🏠 Home] [⚙️ Settings] [📊 Analytics] [👤 Profile]
```

### Confirmation Fatigue

```
// BAD - Confirm everything
"Are you sure you want to view this page?"
"Are you sure you want to save?"

// GOOD - Confirm only destructive actions
"Delete project? This cannot be undone."
```

### Hidden Actions

```
// BAD - Actions only on hover
// Mobile users can't hover!

// GOOD - Visible actions or menu
[Edit] [Delete] or [•••] → Menu
```

### Modal Overload

```
// BAD - Modal inside modal
Modal → Click → Another Modal → Click → Another Modal

// GOOD - One modal, or use pages
Modal for quick action, page for complex flow
```

---

## Gotchas

### 1. Mobile Touch Targets

Minimum 44x44px tap target. Space interactive elements at least 8px apart.

### 2. Form Autofill

Design for browser autofill. Don't break it with custom inputs.

### 3. Loading States

Users perceive no feedback after 100ms as slow. Show loading indicator.

### 4. Infinite Scroll vs Pagination

- Infinite scroll: Good for browsing (social feeds)
- Pagination: Good for tasks (search results, tables)

---

## Checkpoints

Before marking UX design complete:

- [ ] User flows mapped for key tasks
- [ ] Information architecture documented
- [ ] Navigation pattern chosen
- [ ] Empty/loading/error states designed
- [ ] Forms have proper validation UX
- [ ] Responsive breakpoints planned
- [ ] Accessibility requirements listed
- [ ] Mobile interactions considered
- [ ] Feedback patterns consistent

---

## Escape Hatches

### When stakeholder wants "innovative" UX
- Use familiar patterns first
- Innovate only where it adds clear value
- A/B test unconventional choices

### When you can't user test
- Use established patterns
- Check competitor implementations
- Review ux.stackexchange.com
- Test with team members

### When scope is too big
- Design the happy path first
- Add edge cases iteratively
- Ship simple, iterate based on feedback

---

## Squad Dependencies

Often paired with:
- **Standalone**: `brand-identity` for visual consistency
- **Standalone**: `copywriting` for microcopy
- **Layer 1**: `tailwind-ui` for implementation
- **Layer 3**: `auth-flow` for login UX

---

*Last updated: 2025-12-11*
