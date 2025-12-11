---
name: copywriting
description: Use when writing UI text, error messages, or marketing copy - enforces clear microcopy, action-oriented buttons, and consistent voice throughout the product
tags: [copy, microcopy, cta, error-messages, onboarding]
---

# Copywriting Specialist

## Overview

Words are interface. Confusing labels, robotic errors, and vague buttons frustrate users. Good copy is invisible - users accomplish their goals without thinking about the words.

**Core principle:** Write for clarity, not cleverness. Every word should help users accomplish their goal. Delete words that don't.

## The Iron Law

```
NO BUTTON WITHOUT ACTION VERB DESCRIBING WHAT HAPPENS
```

"Submit", "OK", "Yes" tell users nothing. "Create project", "Send message", "Delete file" tell users exactly what will happen when they click.

## When to Use

**Always:**
- Writing button labels
- Creating form labels and help text
- Writing error messages
- Designing empty states
- Creating onboarding flows
- Writing notification text

**Don't:**
- Technical documentation (different style)
- Legal text (lawyers handle this)
- SEO keyword stuffing (that's marketing)

Thinking "users will understand what I mean"? Stop. Say exactly what you mean.

## The Process

### Step 1: Identify the User's Context

Before writing, ask:
- What is the user trying to do?
- What do they already know?
- What might confuse them?

### Step 2: Write the Clearest Version

Say exactly what happens. No jargon. No passive voice.

### Step 3: Cut Words

Read it aloud. Cut every word that doesn't add meaning.

## Patterns

### Button Copy

<Good>
```tsx
// Primary actions - Verb + Noun
<Button>Create project</Button>
<Button>Send message</Button>
<Button>Save changes</Button>
<Button>Start free trial</Button>

// Destructive actions - Specific
<Button variant="danger">Delete project</Button>
<Button variant="danger">Remove from team</Button>
<Button variant="danger">Cancel subscription</Button>

// Confirmation - Repeat the action
<Dialog>
  <p>Delete this project? This can't be undone.</p>
  <Button variant="ghost">Keep project</Button>
  <Button variant="danger">Yes, delete</Button>
</Dialog>
```
Action verbs. Specific nouns. Users know what will happen.
</Good>

<Bad>
```tsx
// Generic - What happens?
<Button>Submit</Button>
<Button>OK</Button>
<Button>Done</Button>
<Button>Click here</Button>

// Confirmation - Ambiguous
<Dialog>
  <p>Are you sure?</p>
  <Button>No</Button>
  <Button>Yes</Button> {/* Yes to what?! */}
</Dialog>
```
"Submit" tells users nothing. "Yes" to what? Unclear.
</Bad>

### Error Messages

<Good>
```tsx
// Structure: What happened + How to fix it

// Form validation
<ErrorMessage>
  Email is already registered. <Link href="/login">Sign in instead?</Link>
</ErrorMessage>

<ErrorMessage>
  Password needs at least 8 characters and a number.
</ErrorMessage>

// Connection error
<ErrorMessage>
  Couldn't save. Check your connection and try again.
</ErrorMessage>

// Not found
<ErrorMessage>
  This page doesn't exist. It may have been moved or deleted.
  <Link href="/">Go home</Link>
</ErrorMessage>

// Permission
<ErrorMessage>
  You don't have access to this project.
  <Link href="/request-access">Request access</Link>
</ErrorMessage>
```
Explains what happened. Tells user what to do. No blame.
</Good>

<Bad>
```tsx
// Technical jargon
<ErrorMessage>Error: 403 Forbidden</ErrorMessage>
<ErrorMessage>Invalid credentials</ErrorMessage>
<ErrorMessage>Network error</ErrorMessage>

// Blaming user
<ErrorMessage>You entered an invalid email</ErrorMessage>
<ErrorMessage>You don't have permission</ErrorMessage>

// No help
<ErrorMessage>Something went wrong</ErrorMessage>
```
Jargon confuses. Blame frustrates. No next step leaves users stuck.
</Bad>

### Form Labels and Help Text

<Good>
```tsx
// Labels - What to enter
<Label>Email address</Label>
<Label>Full name</Label>
<Label>Company website</Label>

// Placeholders - Example format
<Input placeholder="jane@company.com" />
<Input placeholder="https://..." />

// Help text - Why we ask / format hints
<HelpText>We'll never share your email with anyone.</HelpText>
<HelpText>8+ characters with at least one number.</HelpText>
<HelpText>This will be visible on your public profile.</HelpText>

// Required indicator
<Label>Email address *</Label>
```
Labels describe the field. Help text provides context. Placeholders show format.
</Good>

<Bad>
```tsx
// Placeholder as label (disappears when typing)
<Input placeholder="Enter your email" />

// Vague labels
<Label>Name</Label> {/* First? Last? Full? */}
<Label>URL</Label> {/* What URL? */}

// Useless help text
<HelpText>Enter a valid email address</HelpText> {/* Obviously */}
```
Placeholders disappear. Vague labels confuse. Useless help wastes space.
</Bad>

### Empty States

<Good>
```tsx
<EmptyState>
  <Icon as={FolderIcon} />
  <Title>No projects yet</Title>
  <Description>
    Projects help you organize your work.
    Create your first one to get started.
  </Description>
  <Button>Create project</Button>
</EmptyState>

// No search results
<EmptyState>
  <Title>No results for "xyz"</Title>
  <Description>
    Try different keywords or check your filters.
  </Description>
</EmptyState>

// No notifications
<EmptyState>
  <Title>You're all caught up!</Title>
  <Description>
    We'll notify you when something needs attention.
  </Description>
</EmptyState>
```
Explains what's missing. Provides value proposition. Offers next step.
</Good>

<Bad>
```tsx
<EmptyState>
  <p>No data</p>
</EmptyState>

<EmptyState>
  <p>Nothing here yet</p>
</EmptyState>
```
No context. No action. Dead end.
</Bad>

### Success Messages

<Good>
```tsx
// Specific confirmation
<Toast>Project created</Toast>
<Toast>Settings saved</Toast>
<Toast>Message sent to Alex</Toast>
<Toast>Password updated. You'll use this next time you sign in.</Toast>

// Celebration moments (use sparingly)
<Toast>Welcome to Acme! Let's get you set up.</Toast>
<Toast>First project created!</Toast>
```
Specific. Confirms the action. Sets expectations when needed.
</Good>

<Bad>
```tsx
// Generic
<Toast>Success!</Toast>
<Toast>Operation completed successfully</Toast>
<Toast>Your request has been processed</Toast>
```
"Success" at what? Robotic and unhelpful.
</Bad>

## Anti-Patterns

| Anti-Pattern | Why It Fails | What To Do Instead |
|--------------|--------------|-------------------|
| "Submit" button | Tells user nothing | "Create account", "Send message" |
| "Invalid input" error | No help | "Email needs @ symbol" |
| Placeholder-only labels | Disappear when typing | Label above, placeholder as example |
| Technical jargon | Users don't understand | Plain language |
| Passive voice | Wordy, unclear | Active voice |

## Red Flags - STOP

If you catch yourself:
- Using "Submit", "OK", "Done" as button labels
- Writing error messages without next steps
- Using technical terms like "invalid", "error", "forbidden"
- Blaming users ("You entered...", "You don't have...")
- Writing more than 2 sentences for a simple message

**ALL of these mean: STOP. Rewrite in plain language from user's perspective.**

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Users will understand" | They won't. Be explicit. |
| "It's industry standard" | Industry standards are often bad. Be better. |
| "There's no space" | Cut other words. Action verb is non-negotiable. |
| "The developer wrote it" | Rewrite it. Copy is part of UX. |
| "It's just a button" | Every word is interface. Every word matters. |
| "Legal made us" | Work with legal to simplify. It's possible. |

## Gotchas

### Consistent Terminology

Pick one term and stick to it throughout:
- "Project" not sometimes "workspace"
- "Team" not sometimes "organization"
- "Delete" not sometimes "remove" (unless meaningfully different)

### Capitalization

```tsx
// Sentence case for UI
<Button>Create new project</Button>
<MenuItem>Account settings</MenuItem>

// Title case only for proper nouns
<span>Connect to Google Drive</span>

// NEVER all caps (except abbreviations)
<Button>CREATE PROJECT</Button> // Don't do this
```

### Punctuation

- No period for single sentences
- Use periods for multiple sentences
- No exclamation marks in errors
- One exclamation mark max per screen

### Numbers

- One through nine: spell out
- 10+: use numerals
- Always numerals for: prices, dates, statistics

## Verification Checklist

Before marking copy complete:

- [ ] All buttons have action verbs ("Create X", not "Submit")
- [ ] Error messages explain how to fix the problem
- [ ] Empty states have clear next step
- [ ] Form labels above inputs (not placeholder-only)
- [ ] No jargon or technical terms
- [ ] No blaming language ("You" doing something wrong)
- [ ] Consistent terminology throughout
- [ ] Success messages specific to action
- [ ] Loading states describe what's happening
- [ ] Sentence case for UI elements

Can't check all boxes? You have copy problems. Fix them.

## Integration

**Pairs well with:**
- `brand-identity` - Voice and tone
- `ux-research` - User flows to write for
- `auth-flow` - Login/signup copy
- `tailwind-ui` - Implementation

**Requires:**
- Understanding of user goals
- Product vocabulary defined
- Voice/tone guidelines (casual vs formal)

## References

- [Microcopy: The Complete Guide](https://www.microcopybook.com/)
- [Writing for the Web (NN/g)](https://www.nngroup.com/topic/writing-web/)
- [Polaris Content Guidelines](https://polaris.shopify.com/content/)
- [Mailchimp Content Style Guide](https://styleguide.mailchimp.com/)

---

*This specialist follows the world-class skill pattern.*
