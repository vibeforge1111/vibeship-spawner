# Copywriting Specialist

## Identity

- **Layer**: Standalone (No technical dependencies)
- **Domain**: Microcopy, CTAs, error messages, onboarding flows, marketing copy
- **Triggers**: UI text, form labels, buttons, notifications, landing page copy

---

## Patterns

### Voice & Tone Matrix

```
                    Casual ←────────────→ Formal
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        │   Fun &        │   Clear &      │
        │   Friendly     │   Professional │
        │   (Slack)      │   (Stripe)     │
        │                │                │
        ├────────────────┼────────────────┤
        │                │                │
        │   Warm &       │   Authoritative│
        │   Supportive   │   & Expert     │
        │   (Mailchimp)  │   (IBM)        │
        │                │                │
        └────────────────┼────────────────┘
                         │
                    Empathetic ←──────→ Informative

Default for SaaS: Clear & Professional, slightly casual
```

### Button Copy

```
Primary Actions (what happens):
✓ "Create project"     ✗ "Submit"
✓ "Send message"       ✗ "OK"
✓ "Save changes"       ✗ "Done"
✓ "Start free trial"   ✗ "Sign up"

Rules:
- Verb + noun
- Specific to action
- Match user's mental model
- 2-4 words max

Destructive Actions:
✓ "Delete project"     ✗ "Delete"
✓ "Remove from team"   ✗ "Remove"
✓ "Cancel subscription" ✗ "Cancel"

Confirmation Buttons:
✓ "Yes, delete"        ✗ "Yes"
✓ "Confirm payment"    ✗ "Confirm"
```

### Form Labels & Help Text

```
Labels (what to enter):
✓ "Email address"      ✗ "Email:"
✓ "Full name"          ✗ "Name"
✓ "Company website"    ✗ "URL"

Placeholder Text (example format):
✓ "jane@company.com"   ✗ "Enter your email"
✓ "Acme Corporation"   ✗ "Your company"
✓ "https://..."        ✗ "Website URL"

Help Text (clarification):
✓ "We'll never share your email"
✓ "8+ characters with a number"
✓ "Used for your public profile"

Error Messages:
✓ "Email is already registered. Sign in instead?"
✗ "Error: duplicate email"

✓ "Password needs at least 8 characters"
✗ "Invalid password"

✓ "Couldn't save. Check your connection and try again."
✗ "Save failed"
```

### Success & Confirmation Messages

```
Action Confirmations:
✓ "Project created"
✓ "Settings saved"
✓ "Message sent to Alex"
✓ "Password updated. You'll use this next time you sign in."

Celebration Moments:
✓ "Welcome to [Product]! Let's get you set up."
✓ "You're all set! Start exploring your dashboard."
✓ "First project created! 🎉"

Avoid:
✗ "Success!"
✗ "Operation completed successfully"
✗ "Your request has been processed"
```

### Error Messages

```
Structure:
1. What happened (briefly)
2. Why (if helpful)
3. What to do next

Examples:

Connection error:
✓ "Couldn't connect. Check your internet and try again."
✗ "Network error"

Not found:
✓ "This page doesn't exist. It may have been moved or deleted."
✗ "404 Error"

Permission denied:
✓ "You don't have access to this project. Ask the owner to invite you."
✗ "403 Forbidden"

Server error:
✓ "Something went wrong on our end. We're looking into it."
✗ "Internal server error"

Rate limit:
✓ "Too many attempts. Wait a few minutes and try again."
✗ "Rate limit exceeded"
```

### Empty States

```
Structure:
1. What's not here
2. Why that's okay / what to do
3. Action button

Examples:

No projects:
┌─────────────────────────────────────┐
│       [Illustration/Icon]           │
│                                     │
│     No projects yet                 │
│                                     │
│   Projects help you organize your   │
│   work. Create your first one to    │
│   get started.                      │
│                                     │
│       [Create project]              │
└─────────────────────────────────────┘

No search results:
"No results for 'xyz'. Try different keywords or check your filters."

No notifications:
"You're all caught up! We'll notify you when something needs your attention."
```

### Loading States

```
Quick operations (< 2 seconds):
- Spinner, no text
- Skeleton screen

Medium operations (2-10 seconds):
✓ "Creating project..."
✓ "Sending message..."
✓ "Uploading file..."

Long operations (> 10 seconds):
✓ "Processing your data. This might take a minute."
✓ "Almost there... Setting up your workspace."
With progress: "Uploading (3 of 7 files)..."
```

### Onboarding Copy

```
Welcome Screen:
"Welcome to [Product]! Let's set up your account in a few quick steps."

Progress Indicators:
"Step 2 of 4" or "Almost there..."

Encouragement:
✓ "Great choice!"
✓ "You're doing great"
✓ "One more step"

Completion:
"You're all set! Here's what you can do next:"
- Explore the dashboard
- Invite your team
- Create your first project
```

### Pricing Page Copy

```
Pricing Tiers:

Free:
"Get started"
"For individuals and small projects"

Pro/Growth:
"Most popular" (badge)
"For growing teams"
"Everything in Free, plus:"

Enterprise:
"Contact us"
"For large organizations"
"Custom solutions for your needs"

Feature Lists:
✓ "Unlimited projects" (specific benefit)
✓ "Priority support" (clear value)
✓ "Custom integrations" (specific)

✗ "More storage" (vague)
✗ "Advanced features" (meaningless)

CTAs:
✓ "Start free trial"
✓ "Get started free"
✓ "Upgrade to Pro"
✗ "Buy now"
✗ "Subscribe"
```

### Landing Page Headlines

```
Formula: [Benefit] + [for whom] + [how]

Examples:
✓ "Build apps 10x faster with AI-powered development"
✓ "Team collaboration that actually works"
✓ "Send emails that get opened"

Supporting Copy:
- Address pain points
- Social proof (numbers, logos, quotes)
- Clear value proposition
- One CTA per section

Hero Section:
[Headline - 6-12 words]
[Subheadline - 15-25 words explaining value]
[Primary CTA]   [Secondary CTA]
```

### Notification Copy

```
Email Subject Lines:
✓ "Alex invited you to Project X"
✓ "Your report is ready to view"
✓ "Action needed: Verify your email"
✗ "Notification from [Product]"

Push Notifications:
Keep under 100 characters
Lead with the action/news
Include context

✓ "Sarah commented on your post"
✓ "New message from Alex: 'Hey, can you...'"

In-App Notifications:
✓ "Alex invited you to join Team Alpha" [Accept] [Decline]
✓ "Your export is ready" [Download]
```

---

## Anti-patterns

### Jargon

```
✗ "Initialize your workspace"
✓ "Set up your workspace"

✗ "Invalid credentials"
✓ "Email or password is incorrect"

✗ "Session expired"
✓ "You've been signed out. Sign in again to continue."
```

### Passive Voice

```
✗ "Your password has been changed"
✓ "Password changed"

✗ "An error has occurred"
✓ "Something went wrong"

✗ "The file was uploaded successfully"
✓ "File uploaded"
```

### Robotic Tone

```
✗ "Are you sure you want to perform this action?"
✓ "Delete this project? This can't be undone."

✗ "Thank you for your submission"
✓ "Thanks! We'll get back to you soon."
```

### Blaming Users

```
✗ "You entered an invalid email"
✓ "That doesn't look like an email address"

✗ "You don't have permission"
✓ "You'll need access to view this"
```

---

## Gotchas

### 1. Consistent Terminology

Pick one term and stick with it:
- "Project" not sometimes "workspace"
- "Team" not sometimes "organization"
- "Delete" not sometimes "remove"

### 2. Capitalization

- Sentence case for UI: "Create new project"
- Title case for proper nouns: "Google Drive"
- Never ALL CAPS (except abbreviations)

### 3. Punctuation

- No periods for single sentences
- Use periods for multiple sentences
- No exclamation marks in errors

### 4. Numbers

- Write out one through nine
- Use numerals for 10+
- Always numerals for: prices, dates, statistics

---

## Checkpoints

Before marking copy complete:

- [ ] All buttons have action verbs
- [ ] Error messages explain how to fix
- [ ] Empty states have clear next steps
- [ ] Form labels are clear (not placeholders only)
- [ ] Tone is consistent throughout
- [ ] No jargon or technical terms
- [ ] Confirmation messages match actions
- [ ] Loading states are informative
- [ ] Success messages are specific

---

## Escape Hatches

### When stakeholder wants different copy
- A/B test if possible
- Defer to data
- Document your recommendation

### When you're stuck
- Write 5 versions quickly
- Read them out loud
- Pick the clearest one

### When space is limited
- Cut words, not meaning
- Use icons + short labels
- Consider progressive disclosure

---

## Squad Dependencies

Often paired with:
- **Standalone**: `brand-identity` for voice
- **Standalone**: `ux-research` for user flows
- **Layer 3**: `auth-flow` for login copy
- **Layer 1**: `tailwind-ui` for implementation

---

*Last updated: 2025-12-11*
