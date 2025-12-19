# Patterns: UX Design

Proven patterns that create intuitive, efficient, and delightful user experiences.

---

## Pattern 1: Progressive Disclosure

**Context:** Managing complexity by revealing information and options gradually.

**The Pattern:**
```
PRINCIPLE:
Show only what users need at each moment.
More options available as they go deeper.

LEVELS:
Level 0 (Visible): Essential, always shown
Level 1 (One click): Common options
Level 2 (Two clicks): Advanced options
Level 3 (Buried): Rarely used, expert

IMPLEMENTATION EXAMPLES:

Text Editor:
Level 0: Bold, Italic, Link
Level 1: Headings, Lists, Images
Level 2: Tables, Code blocks, Embeds
Level 3: HTML editing, Advanced formatting

Settings:
Level 0: Account, Notifications
Level 1: Privacy, Appearance
Level 2: Developer settings, Integrations
Level 3: Export data, Delete account

Search:
Level 0: Search box
Level 1: Filters appear on results
Level 2: Advanced search operators
Level 3: API access, saved queries

BENEFITS:
- Reduces initial overwhelm
- Faster task completion for simple needs
- Power available for power users
- Cleaner interfaces
- Lower learning curve

RULES:
1. Default to simple
2. Make depth discoverable
3. Remember user preferences
4. Don't hide essential features
```

---

## Pattern 2: Familiar Metaphors

**Context:** Using real-world concepts to make digital interfaces intuitive.

**The Pattern:**
```
PRINCIPLE:
Users understand new things through familiar things.
Leverage existing mental models.

SUCCESSFUL METAPHORS:

Desktop:
Files, Folders, Trash
Users understand organization

Shopping Cart:
Add items, Checkout, Receipt
Users understand purchasing

Inbox:
Messages, Read/Unread, Archive
Users understand communication

Dashboard:
Gauges, Metrics, Alerts
Users understand monitoring

APPLYING METAPHORS:

1. Find the real-world equivalent
   What physical activity is this like?
   What existing digital pattern fits?

2. Use familiar language
   "Add to cart" not "Queue for purchase"
   "Send message" not "Transmit communication"

3. Match expected behavior
   Trash → recoverable, not permanent
   Save → preserves work reliably
   Undo → reverses last action

CAUTION:
- Don't stretch metaphors too far
- "Skeuomorphism" can become dated
- Digital can improve on physical
- Test if metaphor translates across cultures

BAD METAPHOR:
Floppy disk icon for "Save"
- Users don't know floppy disks
- But: It works because everyone learned it
- New metaphor might be worse (cloud? checkmark?)
```

---

## Pattern 3: Recognition Over Recall

**Context:** Designing so users recognize options rather than remember commands.

**The Pattern:**
```
PRINCIPLE:
Seeing options is easier than remembering them.
Show, don't make them guess.

RECALL (Hard):
Command line: Type "git commit -m 'message'"
User must remember exact syntax

RECOGNITION (Easy):
GUI: Click [Commit], type message, click [Confirm]
User sees and chooses from options

IMPLEMENTATION:

Navigation:
✗ User must remember where things are
✓ Categories visible, labeled clearly

Search:
✗ Empty search box, no guidance
✓ Recent searches, suggestions, categories

Forms:
✗ "Enter date in YYYY-MM-DD format"
✓ Date picker with calendar

Actions:
✗ Keyboard shortcuts only
✓ Visible buttons with shortcut hints

Content:
✗ "Click here to continue"
✓ Preview of what's next

PRACTICAL APPLICATIONS:
- Show recently used items
- Provide autocomplete
- Display available commands
- Use visual icons + text labels
- Show related actions on hover
- Provide contextual suggestions

BALANCE:
Too much showing = cluttered
Too little = users lost
Show primary options, hint at secondary
```

---

## Pattern 4: Forgiving Inputs

**Context:** Accepting varied input formats and recovering from errors gracefully.

**The Pattern:**
```
PRINCIPLE:
Accept what users give, interpret generously.
Don't reject valid variations.

PHONE NUMBER:
User enters: (555) 123-4567
User enters: 555-123-4567
User enters: 5551234567
User enters: +1 555 123 4567

All are the same number. Accept all.

DATE:
12/25/2024
25/12/2024
Dec 25, 2024
Christmas 2024

Show date picker, accept text flexibly.

EMAIL:
john@example.com
JOHN@EXAMPLE.COM
  john@example.com  (with spaces)

Normalize: trim, lowercase where appropriate.

IMPLEMENTATION:
// Phone input
function normalizePhone(input) {
  const digits = input.replace(/\D/g, '');
  return digits.slice(-10); // Last 10 digits
}

// Always store normalized
// Display formatted for user preference

FORGIVING SEARCH:
"iphone case" → matches "iPhone Case"
"jon smith" → suggests "John Smith"
"teh" → suggests "the"

FORGIVING FORMS:
- Don't reject on format initially
- Validate on submit, not on input
- Offer to fix obvious errors
- "Did you mean john@gmail.com?"

THE GOAL:
Convert user intention to correct data.
User should never fail due to formatting.
```

---

## Pattern 5: Contextual Help

**Context:** Providing assistance exactly when and where users need it.

**The Pattern:**
```
PRINCIPLE:
Help should appear where confusion might occur.
Preemptive, not reactive.

TYPES OF CONTEXTUAL HELP:

1. Inline Hints
   Appear near form fields
   Explain what's expected
   Example: "Minimum 8 characters"

2. Tooltips
   Hover/tap for more info
   Explain unfamiliar terms
   Example: "API Key: A unique identifier..."

3. Placeholder Examples
   Show expected format
   Example: "john@example.com"

4. Inline Validation Guidance
   Real-time feedback
   Example: ✓ Email format valid

5. Contextual Tutorials
   Appear for new users
   Point to key features
   Dismissible, remembers state

6. Empty State Guidance
   When no content exists
   Explain how to get started
   Example: "No projects yet. Create one!"

PLACEMENT HIERARCHY:
Best: Inline, always visible
Good: Tooltip, one click/hover
Okay: Help page link
Worst: Separate documentation

IMPLEMENTATION:
<label>Password</label>
<input type="password" />
<span class="hint">
  Minimum 8 characters, one number required
</span>
<span class="error" hidden>
  Password too short (4/8 characters)
</span>
<span class="success" hidden>
  ✓ Password meets requirements
</span>

RULE:
If users frequently ask about something,
add contextual help there.
```

---

## Pattern 6: Task-Focused Views

**Context:** Designing interfaces that support specific tasks without distraction.

**The Pattern:**
```
PRINCIPLE:
Remove everything that doesn't help complete the task.
Focus enables flow.

EXAMPLES:

Checkout Flow:
- Hide main navigation
- Hide footer promotions
- Show only: Cart, Payment, Confirm
- Clear progress indicator
- Single focus per step

Writing Mode:
- Hide toolbar
- Hide sidebar
- Full-screen content
- Minimal distractions
- Zen mode

Video Player:
- Controls fade when not needed
- Full-screen option
- Picture-in-picture
- Focus on content

Onboarding:
- No navigation to skip ahead
- One question per screen
- Progress visible
- Can't get lost

IMPLEMENTATION:
if (mode === 'checkout') {
  hideNavigation();
  hideFooter();
  showProgressBar();
  focusCTAs();
}

WHEN TO USE TASK MODE:
- Multi-step processes
- High-concentration activities
- New user onboarding
- Critical flows (payment, signup)
- Creative tasks (writing, designing)

WHEN NOT TO USE:
- Exploration/browsing
- Dashboard views
- Reference content
- Users need quick escape

ESCAPE HATCH:
Always provide a way out.
[X] Close, [←] Back, Save & Exit
```

---

## Pattern 7: Undo Over Confirmation

**Context:** Allowing recovery from actions instead of confirming every action.

**The Pattern:**
```
PRINCIPLE:
Let users act quickly and recover easily.
Undo is faster than "Are you sure?"

CONFIRMATION FATIGUE:
"Are you sure?" [OK] [Cancel]
"Are you sure?" [OK] [Cancel]
"Are you sure?" [OK] [Cancel]

User starts clicking OK without reading.

UNDO PATTERN:
[Delete] → "Item deleted. [Undo]"
[Archive] → "Archived. [Undo]"
[Send] → "Sent! [Undo] (10 seconds)"

BENEFITS:
- Faster workflow
- Less cognitive load
- Recovery possible
- No dialog interruption
- Users feel confident

IMPLEMENTATION:
function deleteItem(id) {
  // Soft delete
  markAsDeleted(id);

  // Show undo option
  showToast("Item deleted", {
    action: "Undo",
    onAction: () => restoreItem(id),
    duration: 10000, // 10 seconds
  });

  // Actually delete after timeout
  setTimeout(() => permanentDelete(id), 30000);
}

WHEN TO USE CONFIRMATION:
- Irreversible actions (close account)
- High-stakes actions (send money)
- Data affecting others
- Actions that take time to undo

CONFIRMATION DESIGN:
- Describe consequences, not just action
- "Delete project and all 47 files?"
- Require typing to confirm destructive
- "Type 'DELETE' to confirm"
```

---

## Pattern 8: Skeleton Loading

**Context:** Showing content structure while data loads.

**The Pattern:**
```
PRINCIPLE:
Show something immediately.
Perceived speed > actual speed.

LOADING PATTERNS:

Blank Screen (Bad):
[                    ]
User wonders if it's broken

Spinner (Okay):
[      ⟳ Loading...      ]
User knows something is happening

Skeleton (Good):
[████████████]  ← Will be title
[██  ████  ██████]  ← Will be text
[█████████████████]
Shows structure, feels faster

SKELETON DESIGN:
1. Match final layout exactly
2. Use subtle animation (shimmer)
3. Neutral gray placeholders
4. Show before any data loads
5. Fade into real content

IMPLEMENTATION:
// React example
function UserCard({ user, loading }) {
  if (loading) {
    return (
      <div className="card skeleton">
        <div className="avatar-placeholder" />
        <div className="text-placeholder" />
        <div className="text-placeholder short" />
      </div>
    );
  }

  return (
    <div className="card">
      <img src={user.avatar} />
      <h3>{user.name}</h3>
      <p>{user.bio}</p>
    </div>
  );
}

CSS SHIMMER:
.skeleton {
  background: linear-gradient(
    90deg,
    #f0f0f0 25%,
    #e0e0e0 50%,
    #f0f0f0 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## Pattern 9: Smart Defaults

**Context:** Pre-selecting the option most users would choose.

**The Pattern:**
```
PRINCIPLE:
Make the most common choice require no effort.
Defaults are powerful.

TYPES OF DEFAULTS:

1. Pre-filled Values
   Country: [🇺🇸 United States ▼] (detected)
   Timezone: [Pacific Time ▼] (detected)

2. Pre-selected Options
   Plan: ○ Free ● Pro ○ Enterprise
   (Most popular highlighted)

3. Common Configurations
   Notifications: [On by default]
   (What most users want)

4. Sensible Starting Points
   New document: Untitled - Today's Date
   New project: My Project

CHOOSING DEFAULTS:
1. What do most users pick? (data)
2. What's safest/least risky?
3. What gets them to value fastest?
4. What do they expect?

EXAMPLES:
Calendar: Default view = Week (most useful)
Email: Default reply = Reply (not Reply All)
Maps: Default transit = Drive (most common)
Editor: Default font = Safe, readable

DARK PATTERNS TO AVOID:
✗ Pre-checked marketing consent
✗ Default to most expensive plan
✗ Opt-out instead of opt-in for data
✗ Hidden fees as default

GOOD DEFAULT RULES:
- User's best interest
- Can be changed easily
- Clearly indicated
- Remembered when changed
```

---

## Pattern 10: Clear Feedback States

**Context:** Communicating system status for every user action.

**The Pattern:**
```
PRINCIPLE:
User should always know:
What happened, what's happening, what will happen.

STATE PROGRESSION:
Default → Interaction → Processing → Result

BUTTON STATES:
Default: [Submit]
Hover: [Submit] (highlighted)
Active: [Submit] (pressed)
Loading: [⟳ Submitting...]
Success: [✓ Submitted]
Error: [⚠ Failed - Retry]
Disabled: [Submit] (grayed, explanation)

FORM FIELD STATES:
Default: Empty, waiting for input
Focused: Highlighted border, cursor active
Filled: Shows entered data
Validating: Checking in progress
Valid: Green check, success state
Invalid: Red, error message shown
Disabled: Grayed, not editable

SYSTEM STATES:
Online: Normal operation
Offline: "You're offline. Changes saved locally."
Syncing: "Syncing changes..."
Synced: "All changes saved"
Error: "Could not save. [Retry]"

IMPLEMENTATION:
function submitForm() {
  setState('loading');    // [⟳ Submitting...]

  try {
    await api.submit(data);
    setState('success');  // [✓ Submitted]

    setTimeout(() => {
      setState('default'); // [Submit]
    }, 2000);

  } catch (error) {
    setState('error');    // [⚠ Failed - Retry]
  }
}

RULE:
Every action = visible feedback
Every state = clear indication
Never leave user guessing
```
