# Anti-Patterns: UX Design

These approaches look like reasonable design decisions but consistently create confusion and frustration.

---

## 1. The False Door Test

**The Mistake:**
```
Testing demand by showing features that don't exist.

"Click here for Premium Features"
→ User clicks
→ "Thanks! Premium coming soon. Enter email."

User expectations shattered.
Trust damaged.
```

**Why It's Wrong:**
- Users feel tricked
- Damages brand trust
- Generates false demand data (clicks ≠ purchases)
- Creates negative word-of-mouth
- Users don't return when feature launches

**Better Approach:**
```
HONEST VALIDATION:
1. Landing page test
   "We're considering building X"
   "Would you be interested?"
   [Join waitlist]

   Clearly communicate it doesn't exist yet.

2. Wizard of Oz
   Feature appears to work
   But manually operated behind scenes
   Real experience, not fake promise

3. Concierge MVP
   "We'll do X for you manually"
   Test value proposition honestly
   Users know it's manual

4. Smoke test with clarity
   "Premium - Coming Soon"
   No fake button, just interest gauge
```

---

## 2. The Wizard of Overwhelm

**The Mistake:**
```
10-step onboarding wizard that users must complete.

Step 1: Enter your info
Step 2: Customize preferences
Step 3: Connect accounts
Step 4: Set up integrations
Step 5: Configure notifications
Step 6: Choose theme
Step 7: Invite team
Step 8: Complete tutorial
Step 9: Set goals
Step 10: Survey

90% drop off by step 3.
```

**Why It's Wrong:**
- Users just want to use the product
- Too much before any value
- Creates anxiety and abandonment
- Information overload before context
- Users can't make good choices yet

**Better Approach:**
```
PROGRESSIVE ONBOARDING:
Step 1: Minimum to start
  - Name, email, password
  - Or social login

Step 2: Quick win
  - Show value immediately
  - Complete one core task
  - Feel accomplishment

Step 3: Just-in-time learning
  - Explain features when relevant
  - "First time here? [Quick tip]"
  - Optional, dismissible

Ongoing: Progressive profiling
  - Ask for more info over time
  - When contextually relevant
  - "To share with your team, invite them here"

ONBOARDING METRICS:
Time to first value < 2 minutes
Required steps < 3
Optional steps = 0 (all just-in-time)
```

---

## 3. The Kitchen Sink Dashboard

**The Mistake:**
```
Dashboard showing every possible metric and widget.

┌─────────────────────────────────────────────┐
│ Users │ Revenue │ Sessions │ Bounces │ ... │
├─────────────────────────────────────────────┤
│ Chart │ Chart │ Chart │ Chart │ Chart │ ... │
├─────────────────────────────────────────────┤
│ Table │ Table │ Table │ List │ Stats │ ... │
├─────────────────────────────────────────────┤
│ More charts, more tables, more everything  │
└─────────────────────────────────────────────┘

User: "What am I supposed to look at?"
```

**Why It's Wrong:**
- No hierarchy = no focus
- Information overload
- Key insights buried
- Slow loading, cluttered interface
- Anxiety-inducing

**Better Approach:**
```
ACTIONABLE DASHBOARDS:

1. Start with questions
   "What does the user need to know?"
   "What actions might they take?"

2. Hierarchy of importance
   Primary: 1-2 key metrics
   Secondary: 3-4 supporting metrics
   Tertiary: Available on drill-down

3. Progressive disclosure
   Overview → Click for details
   Summary → Expand for breakdown

4. Clear layout
   ┌─────────────────────────────────┐
   │  KEY METRIC                     │
   │  What matters most right now    │
   ├─────────────────────────────────┤
   │ Supporting │ Supporting │ Trend │
   ├─────────────────────────────────┤
   │ Details available on request    │
   └─────────────────────────────────┘

5. Personalization
   Let users configure what they see
   Remember preferences
```

---

## 4. The Feature Announcement Bombardment

**The Mistake:**
```
Every session starts with:
"What's New! Check out these 10 features!"
[Modal blocks everything]

User dismisses.

Next day:
"Don't miss these updates!"
[Another modal]

User wants to do their work.
```

**Why It's Wrong:**
- Interrupts user's intent
- Creates announcement blindness
- Users start dismissing without reading
- Doesn't target relevant users
- Annoying

**Better Approach:**
```
CONTEXTUAL ANNOUNCEMENTS:

1. In-context notices
   When user navigates to feature
   "New! This now supports..."
   Small, dismissible badge

2. Changelog page
   Dedicated place for updates
   Users check when interested
   Searchable, organized

3. Targeted announcements
   Only show to users who'd benefit
   "You've used X a lot. Try new Y."

4. Progressive announcements
   Don't announce everything at once
   Space out over sessions
   Priority to high-impact

5. Passive indicators
   "New" badges on menu items
   Explore at user's pace
   No interruption

RULE:
Announcements should be:
- Targeted to relevant users
- Shown in relevant context
- Easily dismissible
- Not repeated after dismissal
```

---

## 5. The Settings Labyrinth

**The Mistake:**
```
Settings buried in endless nesting:

Settings
└── Account
    └── Preferences
        └── Notifications
            └── Email
                └── Frequency
                    └── Marketing
                        └── The thing you wanted

User: "Where is the setting to turn off emails?"
```

**Why It's Wrong:**
- Impossible to find things
- Mental model mismatch
- Creates support requests
- Users give up
- Settings become undiscoverable

**Better Approach:**
```
SETTINGS ORGANIZATION:

1. Flat when possible
   Settings page with clear sections
   No more than 2 levels deep

2. Searchable settings
   [Search settings...]
   "notifications" → jumps to section

3. Grouped by task
   Not by system architecture
   "Email preferences" not "SMTP configuration"

4. Most common = most visible
   Settings users need frequently → top
   Advanced/rare → bottom or hidden

5. Smart shortcuts
   Link to settings from relevant places
   Error message → link to fix setting
   Feature → link to configure it

STRUCTURE:
Settings
├── Account (name, email, password)
├── Notifications (all types, one place)
├── Appearance (theme, layout)
├── Privacy (data, sharing)
├── Integrations (connected apps)
└── Advanced (rarely used, clearly labeled)
```

---

## 6. The Infinite Personalization

**The Mistake:**
```
"Make it your own!"

Choose your:
- Theme (50 options)
- Layout (10 options)
- Font (30 options)
- Color scheme (unlimited)
- Widget arrangement (customizable)
- Dashboard modules (20+ options)
- Sidebar configuration
- ... more customization

User just wants to use the product.
```

**Why It's Wrong:**
- Paradox of choice
- Decision fatigue before value
- Creates maintenance burden
- Makes support harder (infinite configs)
- Users rarely change defaults anyway

**Better Approach:**
```
MEANINGFUL CUSTOMIZATION:

1. Smart defaults first
   Work great out of the box
   Customization optional

2. Curated options
   3-5 themes, not 50
   "Light / Dark / System" not color pickers

3. Progressive access
   Basics visible
   "Advanced customization" for power users

4. Presets over granular
   "Minimal" "Balanced" "Information Dense"
   Not 100 individual toggles

5. Learn from behavior
   "You use feature X a lot"
   "Would you like it on your dashboard?"

CUSTOMIZATION HIERARCHY:
Essential: 2-3 options (theme, notifications)
Common: 5-10 options (layout preferences)
Advanced: Hidden until requested
Power user: API/config file access
```

---

## 7. The Modal Madness

**The Mistake:**
```
Modal → Button → Another Modal → Button → Another Modal

"Are you sure?"
  [Yes]
    "This will affect..."
      [Continue]
        "Please confirm..."
          [OK]
            "Final warning..."
              [I'm Sure]
                Finally does the thing
```

**Why It's Wrong:**
- Exhausting
- Trains users to click through blindly
- Real warnings get ignored
- Shows lack of design effort
- Creates anxiety

**Better Approach:**
```
MODAL ALTERNATIVES:

1. Undo instead of confirm
   Just do it → offer undo
   Faster, less intrusive

2. Inline expansion
   Expand in place, no modal
   Keep user in context

3. Bottom sheets (mobile)
   Less disruptive
   Easy dismiss

4. Slide panels
   Related content in panel
   Main view still visible

5. Confirmation in-flow
   "Deleting 5 items" [Cancel] [Delete]
   No separate modal needed

WHEN MODALS ARE OK:
- Truly destructive actions
- Important decisions that need focus
- First-time critical information
- When you must interrupt

MODAL RULES:
- One modal at a time (never stack)
- Clear close/escape options
- Focused, minimal content
- Obvious primary action
```

---

## 8. The Perfection Paralysis

**The Mistake:**
```
Spending 6 months perfecting every pixel of a design
that users will actually hate when they use it.

"We need to get this perfect before showing users"
"Let's add one more design review"
"The animation needs more polish"

Meanwhile, building the wrong thing perfectly.
```

**Why It's Wrong:**
- User feedback comes too late
- Assumptions go unchallenged
- Expensive to change late
- Perfect design for wrong problem
- Teams fall in love with solutions

**Better Approach:**
```
TEST EARLY, TEST OFTEN:

Week 1: Problem validation
  Do users have this problem?
  Talk to 5-8 users

Week 2: Concept testing
  Paper sketches, rough wireframes
  "What do you think this does?"

Week 3: Usability testing
  Clickable prototype (not polished)
  5 users, observe, learn

Week 4+: Iterate based on feedback
  Polish what's validated
  Cut what doesn't work

TESTING ARTIFACTS:
- Paper sketches (earliest)
- Wireframes
- Clickable prototypes (Figma)
- Coded prototypes
- Beta features (production)

RULE:
If you're more than 2 weeks from user feedback,
you're too far from reality.

"Perfect" after feedback > "Perfect" before
```

---

## 9. The Research Theater

**The Mistake:**
```
"We did user research"

Research: 2-hour meeting where stakeholders
discussed what they think users want.

Or: Survey with leading questions.
"Would you use a feature that helps you save time?"
100% said yes. Ship it.

Or: Focus group with recruited participants
who say what they think you want to hear.
```

**Why It's Wrong:**
- Confirms existing biases
- Doesn't represent real behavior
- Leading questions = useless data
- Group dynamics skew responses
- "Would you" ≠ "Do you"

**Better Approach:**
```
REAL USER RESEARCH:

1. Behavioral observation
   Watch users use the product
   Note struggles, workarounds
   Don't intervene or explain

2. Contextual inquiry
   Talk to users in their environment
   See how they actually work
   Understand real context

3. Unbiased interview questions
   "Tell me about the last time you..."
   "What happened next?"
   "Why did you do it that way?"
   NOT: "Would you like feature X?"

4. Prototype testing
   Give users tasks
   Watch them try
   "Think aloud"

5. Analytics + Observation
   Data shows what
   Observation shows why
   Both together = insight

SAMPLE SIZE:
Qualitative research: 5-8 users finds 80% of issues
Survey/quantitative: Statistical significance needed

RULE:
If you haven't watched users struggle,
you don't understand the problem.
```

---

## 10. The Metric Obsession

**The Mistake:**
```
"We need to increase clicks on Feature X"

Designer adds:
- Pop-up prompting Feature X
- Banner advertising Feature X
- Notification about Feature X
- Tooltip pointing to Feature X

Clicks on X: ⬆️ 200%
User satisfaction: ⬇️ 50%
Referrals: ⬇️ 30%
But we hit the metric!
```

**Why It's Wrong:**
- Metrics are proxies, not goals
- Easy to game metrics badly
- Short-term gain, long-term damage
- Ignores holistic experience
- Dark patterns emerge

**Better Approach:**
```
BALANCED METRICS:

1. North Star metric
   Single metric representing user value
   "Weekly active users completing core task"

2. Supporting metrics (balanced)
   Engagement: Are they using it?
   Satisfaction: Are they happy?
   Retention: Do they come back?
   Virality: Do they recommend?

3. Counter-metrics
   For every metric you push, track counter
   Push sign-ups → track activation rate
   Push engagement → track churn
   Push clicks → track satisfaction

4. Qualitative check
   Numbers tell what
   Conversations tell why
   Both required

METRIC HIERARCHY:
User value > Business value > Vanity metrics

QUESTIONS TO ASK:
"Would a user thank us for this change?"
"Would we be proud to tell users about this?"
"Does this make the product better, or just bump a number?"
```

---

## 11. The Edge Case Neglect

**The Mistake:**
```
Design looks great with sample data:
- Perfect product photos
- Ideal-length titles
- Complete user profiles
- Standard use cases

Production reality:
- No image uploaded
- Title with 200 characters
- Profile with only email
- User from unexpected country
- User on 3G network
- User with screen reader

Interface breaks everywhere.
```

**Why It's Wrong:**
- Real users don't match samples
- Edge cases are common in aggregate
- Creates poor first impressions
- Accessibility failures
- Support burden increases

**Better Approach:**
```
DESIGN FOR EDGES:

1. Empty states
   What if no data yet?
   What if data deleted?
   What if loading forever?

2. Extreme content
   Very long text (truncation)
   Very short text (min-width)
   No image (placeholder)
   Many items (pagination)

3. Error states
   Network failure
   Server error
   Validation failure
   Permission denied

4. User variations
   New user, power user
   Mobile, desktop, tablet
   Slow connection, offline
   Screen reader, keyboard-only

5. Stress testing designs
   Before dev, test with:
   - Real content (not lorem ipsum)
   - Edge case content
   - Error scenarios
   - Diverse user types

CHECKLIST FOR EVERY FEATURE:
□ Empty state designed
□ Error state designed
□ Loading state designed
□ Long content handled
□ Missing data handled
□ Mobile variation considered
□ Accessibility verified
```

---

## 12. The Consistency Trap

**The Mistake:**
```
"We must be consistent!"

Same pattern applied everywhere:
- Checkout has full navigation (distracting)
- Error pages have full navigation (user is lost)
- Onboarding has same density as dashboard
- Destructive action uses same button as safe action
- Every form has same layout (even when wrong)
```

**Why It's Wrong:**
- Consistency is a means, not an end
- Different contexts need different solutions
- Foolish consistency hurts usability
- Ignores user's current mental state
- Blocks appropriate innovation

**Better Approach:**
```
PURPOSEFUL CONSISTENCY:

Consistent (across all contexts):
- Brand voice and tone
- Core interactions (how buttons work)
- Visual language (colors, typography)
- Navigation patterns
- Terminology

Contextual (varies by situation):
- Information density
- Navigation visibility
- Distraction level
- Emphasis and hierarchy
- Error handling approach

EXAMPLES:
Checkout: Hide navigation, focus on task
Dashboard: Show all navigation options
Onboarding: Progressive, limited options
Error recovery: Clear path forward, not full nav

RULE:
"Does consistency serve the user here?"
If no, break it intentionally.
Document why.

PREDICTABLE > CONSISTENT
Users should predict behavior
Not see identical interfaces everywhere
```
