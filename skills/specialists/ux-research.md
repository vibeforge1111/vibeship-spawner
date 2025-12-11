---
name: ux-research
description: Use when designing user flows or navigation structure - enforces clear information architecture, consistent patterns, and accessibility requirements
tags: [ux, user-flows, wireframes, navigation, accessibility]
---

# UX Research Specialist

## Overview

Good UX is invisible. Bad UX makes users think. Every unnecessary click, confusing label, or hidden action costs user trust and business metrics. Design for the user's mental model, not your data model.

**Core principle:** Users have goals. Your job is to remove obstacles between them and those goals. Test with real users, not assumptions.

## The Iron Law

```
NO USER FLOW WITHOUT CLEAR PATH FROM ENTRY TO GOAL
```

Every feature must have a documented path from entry point to completion. If you can't draw it, users can't follow it. Ambiguous flows create abandoned tasks.

## When to Use

**Always:**
- Designing new features
- Creating navigation structure
- Building onboarding flows
- Redesigning existing UX
- Before implementing UI

**Don't:**
- Purely technical changes with no UI impact
- Performance optimizations
- Backend-only features

Thinking "users will figure it out"? Stop. They won't. They'll leave.

## The Process

### Step 1: Map the User Goal

Before wireframing, identify:
- What is the user trying to accomplish?
- What's the shortest path to that goal?
- What might block them?

### Step 2: Design the Happy Path

Create the ideal flow without edge cases first:

```
Entry → Action 1 → Action 2 → Success
```

### Step 3: Add Error States and Edge Cases

Then handle what goes wrong at each step.

## Patterns

### User Flow Documentation

<Good>
```
GOAL: User creates first project

ENTRY: Dashboard (empty state)
        │
        ▼
    ┌─────────────────────────────────┐
    │       No projects yet           │
    │                                 │
    │   Create your first project     │
    │   to get started                │
    │                                 │
    │       [Create Project]          │
    └─────────────────────────────────┘
        │
        ▼
    ┌─────────────────────────────────┐
    │       Create Project            │
    │                                 │
    │   Name: [_______________]       │
    │                                 │
    │           [Cancel] [Create]     │
    └─────────────────────────────────┘
        │
        ├─── Error: Name taken ───► Show inline error
        │
        ▼ Success
    ┌─────────────────────────────────┐
    │   Project created!              │
    │   [Go to project]               │
    └─────────────────────────────────┘

ERROR STATES:
- Empty name: Inline validation "Name is required"
- Name too long: "Name must be under 50 characters"
- Network error: Toast "Couldn't create project. Try again."
```
Clear path. Error states documented. User always knows what to do.
</Good>

<Bad>
```
User creates project:
1. Click button
2. Fill form
3. Submit
```
No entry point. No error handling. No detail on what happens.
</Bad>

### Navigation Architecture

<Good>
```
Information Architecture (SaaS):

PUBLIC (No auth required)
├── / (Landing)
├── /features
├── /pricing
├── /blog
│   └── /blog/[slug]
├── /login
└── /signup

PROTECTED (Auth required)
└── /dashboard
    ├── /dashboard (Overview)
    ├── /dashboard/projects
    │   ├── /dashboard/projects/[id]
    │   └── /dashboard/projects/new
    └── /dashboard/settings
        ├── /dashboard/settings/profile
        ├── /dashboard/settings/billing
        └── /dashboard/settings/team

RULES:
- Max 3 levels deep
- Consistent URL patterns (/dashboard/entity/action)
- Group by user mental model, not technical structure
```
Logical hierarchy. Predictable URLs. Clear public/protected boundary.
</Good>

<Bad>
```
/home
/main-features-page
/price-list
/user-dashboard/main
/projects/all-projects/view
/settings-and-preferences
```
Inconsistent naming. Deep nesting. No clear pattern.
</Bad>

### Empty State Design

<Good>
```tsx
<EmptyState
  icon={<FolderIcon />}
  title="No projects yet"
  description="Projects help you organize your work. Create your first one to get started."
  action={
    <Button onClick={openCreateModal}>Create project</Button>
  }
/>

// Structure:
// 1. Visual (icon/illustration)
// 2. What's missing
// 3. Why that's okay / value proposition
// 4. Clear action
```
Explains the empty state. Provides clear next step. Not a dead end.
</Good>

<Bad>
```tsx
<div className="text-gray-500 text-center">
  No data
</div>
```
No context. No action. User stuck.
</Bad>

### Form UX Pattern

<Good>
```tsx
<form>
  {/* Label ABOVE input, not placeholder-only */}
  <label className="block text-sm font-medium">
    Email address *
  </label>
  <input
    type="email"
    placeholder="jane@company.com"
    aria-describedby="email-hint"
  />
  <p id="email-hint" className="text-sm text-gray-500">
    We'll never share your email
  </p>

  {/* Inline validation on blur */}
  {errors.email && (
    <p className="text-sm text-red-500">{errors.email}</p>
  )}

  {/* Primary action right, secondary left */}
  <div className="flex justify-end gap-3">
    <Button variant="ghost">Cancel</Button>
    <Button type="submit">Save changes</Button>
  </div>
</form>
```
Labels visible. Help text available. Errors inline. Actions positioned correctly.
</Good>

<Bad>
```tsx
<form>
  <input placeholder="Enter your email" />
  <input placeholder="Enter your name" />
  <button>Submit</button>
</form>
```
Placeholder-only labels disappear. Generic button. No error handling.
</Bad>

### Loading State Strategy

<Good>
```tsx
// Quick operations (< 1s): No indicator
// Medium operations (1-3s): Spinner/skeleton
// Long operations (> 3s): Progress + message

// Skeleton for page content
<div className="animate-pulse">
  <div className="h-8 bg-gray-200 rounded w-1/4 mb-4" />
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
  <div className="h-4 bg-gray-200 rounded w-1/2" />
</div>

// Button loading state
<Button disabled={loading}>
  {loading ? (
    <>
      <Spinner className="mr-2" />
      Saving...
    </>
  ) : (
    'Save changes'
  )}
</Button>

// Long operation with progress
<ProgressModal>
  <p>Processing your data...</p>
  <p className="text-sm text-gray-500">This may take a minute</p>
  <ProgressBar value={progress} />
</ProgressModal>
```
Appropriate feedback for operation length. Users know something is happening.
</Good>

<Bad>
```tsx
// No loading state
<button onClick={save}>Save</button>
// User clicks multiple times, no feedback

// Spinner everywhere
{loading && <Spinner />} // Even for 50ms operations
```
No feedback causes double-clicks. Over-feedback is distracting.
</Bad>

## Anti-Patterns

| Anti-Pattern | Why It Fails | What To Do Instead |
|--------------|--------------|-------------------|
| Icon-only navigation | Users don't know what icons mean | Add labels or tooltips |
| Modal inside modal | Confusing, lose context | Use pages for complex flows |
| Hidden actions (hover-only) | Mobile can't hover | Always-visible or menu |
| Placeholder-only labels | Disappear when typing | Label above, placeholder as example |
| Generic buttons | "Submit", "OK" mean nothing | "Create project", "Send message" |

## Red Flags - STOP

If you catch yourself:
- Designing UI without documenting the user flow first
- Using icon-only buttons without labels/tooltips
- Nesting modals more than one level deep
- Hiding essential actions behind hover states
- Using placeholder text as the only label

**ALL of these mean: STOP. Document the flow. Test with a real person.**

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Users will learn the icons" | No they won't. Add labels. |
| "The flow is obvious" | Only to you who built it. Document and test. |
| "Mobile is edge case" | Mobile is 50%+ of traffic. Design for it. |
| "We'll fix UX after launch" | After launch is too late. Users already churned. |
| "More features = better" | More features = more confusion. Simplify. |
| "Power users will figure it out" | Power users are 5%. Design for the 95%. |

## Gotchas

### Touch Target Sizes

Minimum 44x44px for touch targets. 8px minimum spacing between.

```tsx
// Too small
<button className="p-1">X</button>

// Correct
<button className="p-3 min-w-[44px] min-h-[44px]">X</button>
```

### Form Autofill

Don't break browser autofill with custom inputs:

```tsx
// Support autofill
<input
  type="email"
  name="email"
  autoComplete="email"
/>
```

### Infinite Scroll vs Pagination

- **Infinite scroll**: Good for browsing (social feeds, images)
- **Pagination**: Good for tasks (search results, data tables)

### Loading Perception

Users perceive no feedback after 100ms as slow. Show loading indicator for anything longer.

## Verification Checklist

Before marking UX design complete:

- [ ] User flow documented from entry to goal
- [ ] Empty states have illustration + explanation + action
- [ ] Loading states for all async operations
- [ ] Error states explain what happened + what to do
- [ ] Form labels above inputs (not placeholder-only)
- [ ] Touch targets minimum 44x44px
- [ ] Navigation has text labels (not icon-only)
- [ ] Modals don't nest more than one level
- [ ] Primary action distinguishable from secondary
- [ ] Tested on mobile viewport

Can't check all boxes? You have UX issues. Fix them before building.

## Integration

**Pairs well with:**
- `brand-identity` - Visual consistency
- `copywriting` - UI text and microcopy
- `tailwind-ui` - Implementation
- `auth-flow` - Login/signup UX

**Requires:**
- User goals documented
- Competitor analysis (optional but recommended)
- Access to real users for testing

## References

- [Nielsen Norman Group](https://www.nngroup.com/)
- [Laws of UX](https://lawsofux.com/)
- [WCAG Guidelines](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [Refactoring UI](https://www.refactoringui.com/)

---

*This specialist follows the world-class skill pattern.*
