# Sharp Edges: UX Design

Critical mistakes that make products confusing, frustrating, or unusable.

---

## 1. The Assumption Trap

**Severity:** Critical
**Situation:** Building features based on assumptions instead of research
**Why Dangerous:** You'll build the wrong thing confidently.

```
THE TRAP:
"I know what users want"
"Our competitor does it this way"
"The stakeholder said users need this"
"It's obvious what they need"

THE REALITY:
- Users don't know what they want until they use it
- Competitors may also be wrong
- Stakeholders have biases
- "Obvious" is relative to your knowledge

VALIDATION METHODS:
1. User interviews (5-8 minimum)
   Ask about behavior, not preferences
   "Tell me about the last time you..."
   NOT: "Would you use feature X?"

2. Observation
   Watch actual usage
   Look for workarounds
   Note moments of confusion

3. Prototype testing
   Clickable mockup before code
   5 users finds 80% of issues
   Fail fast, fail cheap

4. Analytics review
   Where do users actually go?
   Where do they drop off?
   What paths do they take?

RESEARCH BEFORE EVERY MAJOR FEATURE
"We don't have time" = We have time to build the wrong thing
```

---

## 2. The Happy Path Only

**Severity:** Critical
**Situation:** Only designing for ideal scenarios, ignoring edge cases
**Why Dangerous:** Real users live in the edge cases.

```
THE HAPPY PATH:
User signs up → Completes profile → Uses product → Success!

REALITY:
- User has special characters in name
- User enters email wrong
- Session expires mid-form
- Network goes down
- User closes tab accidentally
- User doesn't have required info
- User changes mind midway
- User has accessibility needs
- User is on slow connection
- User speaks different language

EDGE CASES TO DESIGN FOR:
Empty states: No data yet
Error states: Something went wrong
Loading states: Data in transit
Partial states: Incomplete data
Offline states: No connection
Timeout states: Too slow
Permission states: Access denied
First-time states: New user
Returning states: Repeat visitor
Expert states: Power user
Stressed states: User under pressure

FOR EACH FLOW, ASK:
- What if they can't continue?
- What if they want to go back?
- What if they need help?
- What if something breaks?
- What if they have nothing yet?
```

---

## 3. The Feature Overload

**Severity:** High
**Situation:** Adding features without considering cognitive load
**Why Dangerous:** More features = more confusion = fewer completions.

```
THE TRAP:
V1: Simple, focused, works great
V2: Added "requested" features
V3: Added more "power user" features
V4: Nobody can find anything

SYMPTOMS:
- Long onboarding needed
- Users ask "where is X?"
- Support tickets increase
- Core metrics decline
- New users don't convert

THE FIX - PRIORITIZATION:
For each feature, ask:
1. How many users need this?
2. How often do they need it?
3. How critical is it when needed?

Feature Priority Matrix:
              │ Many Users │ Few Users
─────────────┼────────────┼───────────
Frequent Use │ CORE       │ CONSIDER
─────────────┼────────────┼───────────
Rare Use     │ ACCESSIBLE │ HIDE/CUT

CORE: Primary navigation, always visible
CONSIDER: Could be core, needs validation
ACCESSIBLE: Settings, menus, secondary nav
HIDE/CUT: Probably don't build

HICK'S LAW:
Time to decide increases with number of options
Fewer choices = faster decisions = better UX
```

---

## 4. The Jargon Jungle

**Severity:** High
**Situation:** Using internal terminology in user-facing interfaces
**Why Dangerous:** Users don't speak your language.

```
INTERNAL LANGUAGE THAT CONFUSES:
"Workspace" → What is it?
"Instance" → Technical term
"Sync" → Vague action
"Dashboard" → Too generic
"Module" → Developer speak
"Entity" → Abstract
"Tenant" → Architecture term

USER LANGUAGE:
"Your projects"
"Your copy"
"Save changes"
"Your stats"
"Your apps"
"Your items"
"Your account"

TESTING JARGON:
1. 5-second test
   Show screen for 5 seconds
   Ask: "What is this page for?"
   If confusion → jargon problem

2. First-click test
   "Where would you click to [task]?"
   Wrong clicks → unclear language

3. Card sorting
   What do users call things?
   Group features by user mental model

RULES:
- Use verbs for actions: "Save" not "Persist"
- Use nouns users know: "Messages" not "Communications"
- Describe outcomes: "Share with team" not "Set permissions"
- Test with 5 non-expert users
```

---

## 5. The Invisible Action

**Severity:** High
**Situation:** Important actions that users can't find
**Why Dangerous:** Users can't use features they can't find.

```
HIDING PATTERNS:
- Actions in hover-only menus
- Important settings buried deep
- CTAs that look like text
- Actions behind icons without labels
- Mobile features requiring gestures

DISCOVERY PROBLEMS:
User: "I didn't know I could do that"
User: "Where is the button for X?"
User: "I looked everywhere"
User: "I had to ask someone"

MAKING ACTIONS DISCOVERABLE:
1. Primary actions = always visible
   Save, Submit, Next, Add

2. Secondary actions = one click away
   Edit, Delete, Share, Settings

3. Tertiary actions = in menus
   Export, Advanced options, Rarely used

VISIBILITY HIERARCHY:
Most important → Prominent button
Important → Visible link/button
Useful → Discoverable in menu
Rare → Settings or help

TESTING DISCOVERABILITY:
First-click test:
"How would you [action]?"
Track where users click
>70% correct = discoverable
<50% correct = hidden
```

---

## 6. The Infinite Options

**Severity:** High
**Situation:** Presenting too many choices at once
**Why Dangerous:** Choice paralysis prevents action.

```
THE PROBLEM:
Pick your plan:
□ Starter ($9)
□ Basic ($19)
□ Standard ($29)
□ Professional ($49)
□ Business ($79)
□ Enterprise ($149)
□ Custom (Contact us)

User: *closes tab*

THE FIX:
Pick your plan:
□ Free (Try it out)
□ Pro - Most Popular ($29)
□ Team (Contact us)

RESEARCH SHOWS:
2-4 options: Users can evaluate
5-7 options: Decisions slow down
8+ options: Paralysis sets in

REDUCING OPTIONS:
1. Smart defaults
   Pre-select the best option for most
   "Recommended for you"

2. Progressive disclosure
   Show basics first
   "Show more options" for power users

3. Categorization
   Group similar options
   "Popular" vs "Advanced"

4. Recommendations
   "Most popular"
   "Best for teams"
   "Recommended based on your usage"

5. Elimination
   If <5% use an option, remove it
   Or hide it in "Advanced"
```

---

## 7. The Broken Flow

**Severity:** Critical
**Situation:** User flows that don't match user mental models
**Why Dangerous:** Users get lost, frustrated, and leave.

```
BROKEN FLOW EXAMPLE:
User wants to: Send money to friend
App requires:
1. Add friend as contact
2. Verify contact's identity
3. Set up payment method
4. Configure transfer settings
5. Initiate transfer
6. Confirm with SMS
7. Wait for approval
8. Get confirmation

User expectation:
1. Enter friend's email
2. Enter amount
3. Send

MENTAL MODEL MISMATCH:
You think: Security is paramount
User thinks: I just want to send $20

FLOW DESIGN PRINCIPLES:
1. Start with the goal, work backward
   What does user want to achieve?
   What's the minimum path?

2. Progressive complexity
   Easy path for simple cases
   Advanced options for edge cases

3. Forgiving format
   Accept input flexibly
   Don't reject valid variations

4. Clear progress
   Where am I in this process?
   How much is left?

5. Easy recovery
   Go back without losing progress
   Edit previous steps
   Save and continue later
```

---

## 8. The Feedback Void

**Severity:** High
**Situation:** No feedback when users take actions
**Why Dangerous:** Users don't know if actions worked.

```
THE VOID:
User clicks button
...nothing visible happens...
User clicks again
...still nothing...
User refreshes page
Data is duplicated

FEEDBACK REQUIREMENTS:
Every action needs visible feedback within:
0-100ms: Visual acknowledgment (button press)
100ms-1s: Progress indicator
1-10s: Clear loading state with progress
10s+: Background processing with notification

FEEDBACK TYPES:
Immediate:
- Button state change
- Cursor change
- Ripple/click effect

Progress:
- Spinner
- Progress bar
- Skeleton screens
- Optimistic UI

Completion:
- Success message
- Confirmation screen
- Toast notification
- State change visible

Error:
- Clear error message
- What went wrong
- How to fix it
- Option to retry

IMPLEMENTATION PATTERN:
onClick = async () => {
  setLoading(true)      // Immediate feedback
  try {
    await action()
    showSuccess()       // Completion feedback
  } catch (e) {
    showError(e)        // Error feedback
  } finally {
    setLoading(false)
  }
}
```

---

## 9. The Forced Registration

**Severity:** High
**Situation:** Requiring account creation before value is shown
**Why Dangerous:** Users leave before seeing why they should sign up.

```
THE WALL:
User lands on page
"Create an account to continue"
[Sign up with email]
[Sign up with Google]

User has no idea what they're signing up for.

BETTER PATTERN:
1. Show value first
   Let users explore, try, experience

2. Prompt at value moment
   "Save your progress" → Sign up
   "Share with team" → Sign up
   "Unlock feature" → Sign up

3. Progressive registration
   Start as guest
   Convert when necessary
   Preserve their work

EXAMPLES:
Duolingo: Complete first lesson → then sign up
Canva: Create design → sign up to save
Spotify: Listen to music → sign up for features
Notion: Use templates → sign up to save

VALUE FIRST FLOW:
Landing → Try product → Experience value →
Natural prompt → Easy signup → Continue

VS WALL FLOW:
Landing → Signup wall → 80% bounce

DATA:
Removing forced registration can increase
conversion 20-50% because users who sign up
actually want to, having seen the value
```

---

## 10. The Form From Hell

**Severity:** High
**Situation:** Long, complex forms that overwhelm users
**Why Dangerous:** Every field is a chance to drop off.

```
THE HELL FORM:
Name:           [_______________]
Email:          [_______________]
Phone:          [_______________]
Address Line 1: [_______________]
Address Line 2: [_______________]
City:           [_______________]
State:          [dropdown with 50 options]
ZIP:            [_______________]
Country:        [dropdown with 195 options]
Password:       [_______________]
Confirm:        [_______________]
Birthday:       [_______________]
Gender:         [_______________]
Occupation:     [_______________]
Company:        [_______________]
How heard:      [_______________]
[Terms checkbox wall of text]
[Submit]

DROP-OFF RATE: 70%+

THE FIX:
1. Minimum viable fields
   Only ask what's essential
   Ask the rest later, or never

2. Progressive profiling
   Get email first
   Ask more over time
   "Complete your profile" later

3. Smart defaults
   Auto-detect country
   Auto-complete address
   Social sign-in

4. Multi-step with progress
   Step 1 of 3: Basic info
   Step 2 of 3: Preferences
   Step 3 of 3: Confirm

5. Inline validation
   Validate as they go
   Green checkmark on valid
   Error before submit

EVERY FIELD REMOVED:
+5-10% completion rate
```

---

## 11. The Dead End

**Severity:** High
**Situation:** Flows that end without clear next steps
**Why Dangerous:** Users don't know what to do next.

```
DEAD ENDS:
Error page: "Something went wrong" [blank]
Empty state: [blank page with no guidance]
Success: "Done!" [nothing else]
404: "Page not found" [go home only]
Confirmation: "Thank you" [end]

EVERY END NEEDS:
1. What happened (status)
2. What to do next (action)
3. Alternative paths (options)

FIXING DEAD ENDS:

Error page:
"Something went wrong"
→ "We couldn't load your data."
→ [Try again] [Go to dashboard] [Contact support]

Empty state:
[blank]
→ "No projects yet"
→ "Create your first project to get started"
→ [Create project] [Import existing]

Success:
"Done!"
→ "Your order is confirmed!"
→ "Confirmation email sent to you@email.com"
→ [View order] [Continue shopping] [Track delivery]

404:
"Page not found"
→ "We couldn't find that page"
→ "Try searching or browse popular pages:"
→ [Search] [Home] [Products] [Help]

RULE:
No screen should be a dead end.
Always provide at least one forward path.
```

---

## 12. The Permission Ambush

**Severity:** High
**Situation:** Asking for permissions without context
**Why Dangerous:** Users deny permissions they'd otherwise grant.

```
THE AMBUSH:
App loads
"Allow notifications?" [Allow] [Don't Allow]
"Allow location?" [Allow] [Don't Allow]
"Allow camera?" [Allow] [Don't Allow]

User: Denies all (defensive)

THE FIX - CONTEXTUAL PERMISSION:
1. Wait until the feature is used
   User taps "Take Photo" → camera permission
   User taps "Find nearby" → location permission

2. Explain the benefit first
   "Enable notifications to get updates on your order"
   Not: "Enable notifications"

3. Pre-permission education
   "To scan documents, we need camera access"
   [Enable Camera] [Not now]

4. Graceful degradation
   If denied, work without it
   Offer alternative methods
   "You can also enter the code manually"

PERMISSION FLOW:
User initiates action →
Explain why permission needed →
System permission prompt →
If denied → offer alternative →
If granted → continue with feature

STAT:
Contextual permission requests
have 2-3x higher grant rates
```
