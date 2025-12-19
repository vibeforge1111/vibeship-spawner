# Decisions: UX Design

Critical decision points that determine user experience success.

---

## Decision 1: Research Method Selection

**Context:** Choosing how to learn about users for a specific question.

**Options:**

| Method | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **User Interviews** | Deep insights, context, "why" | Time-intensive, small sample | Understanding motivations, new problems |
| **Usability Testing** | Observes real behavior | Lab vs. reality gap | Validating designs, finding issues |
| **Surveys** | Large sample, quantifiable | Surface-level, bias-prone | Measuring attitudes, demographics |
| **Analytics** | Real behavior, scale | No "why," what happened only | Understanding patterns, funnel analysis |
| **A/B Testing** | Causal, production real | Needs traffic, narrow scope | Optimizing specific elements |

**Framework:**
```
Research method selection:

What do you need to learn?
├── Why users do something → Interviews
├── If users can do something → Usability testing
├── How many users do something → Analytics
├── What users prefer → Survey or A/B test
└── What performs better → A/B test

Stage of product:
├── Concept (does problem exist?) → Interviews
├── Design (does solution work?) → Usability testing
├── Live (is it working?) → Analytics + A/B
└── Ongoing (what's changing?) → All methods

Available resources:
├── Time: Days → Analytics, surveys
├── Time: Weeks → Interviews, usability
├── Budget: Low → Guerrilla testing, surveys
├── Budget: High → Formal studies, recruiting

SAMPLE SIZES:
Usability testing: 5 users (finds 80% issues)
Interviews: 5-8 users (patterns emerge)
Surveys: 100+ for statistical significance
A/B tests: Depends on effect size, calculate power

RESEARCH COMBINATION:
Best insights = quant + qual together
Analytics: Shows what's happening
Interviews: Explains why it's happening
```

**Default Recommendation:** Start with 5 user interviews for new problems, usability testing for existing designs. Add analytics for ongoing measurement. Surveys only for large-scale questions.

---

## Decision 2: Information Architecture Approach

**Context:** Structuring content and navigation for a product.

**Options:**

| Approach | Pros | Cons | Choose When |
|----------|------|------|-------------|
| **Task-based** | Maps to user goals | May split related content | Productivity apps, tools |
| **Topic-based** | Logical groupings | May not match user goals | Content-heavy sites |
| **Audience-based** | Personalized experience | Duplicate content possible | Multiple distinct personas |
| **Hybrid** | Flexible, covers bases | More complex | Large products, multiple contexts |

**Framework:**
```
Information architecture decision:

Primary user goal?
├── Complete tasks → Task-based
├── Learn/explore → Topic-based
├── Different user types → Audience-based
└── Mixed goals → Hybrid

Content type?
├── Actions/tools → Task-based
├── Information/articles → Topic-based
├── Products/services → Varies by audience
└── Mixed → Hybrid

TASK-BASED STRUCTURE:
Navigation reflects what users do:
├── Create project
├── Invite team
├── Track progress
└── Generate reports

TOPIC-BASED STRUCTURE:
Navigation reflects content categories:
├── Projects
├── Team
├── Analytics
└── Settings

AUDIENCE-BASED STRUCTURE:
Navigation by user type:
├── For Developers
├── For Designers
├── For Managers
└── Enterprise

VALIDATION METHODS:
1. Card sorting (open)
   Give users content cards
   Ask them to group
   Learn their mental model

2. Card sorting (closed)
   Give users cards + categories
   Ask them to place
   Validate your model

3. Tree testing
   Text-only navigation
   "Where would you find X?"
   Validates hierarchy without design bias
```

**Default Recommendation:** Start task-based for products, topic-based for content sites. Validate with card sorting before committing. Hybrid when product matures.

---

## Decision 3: Navigation Pattern

**Context:** Choosing the primary navigation structure.

**Options:**

| Pattern | Pros | Cons | Choose When |
|---------|------|------|-------------|
| **Top nav** | Standard, visible, scan-friendly | Limited items, takes vertical space | Marketing sites, simple apps |
| **Side nav** | Many items, persistent | Uses horizontal space, mobile challenge | Complex apps, dashboards |
| **Bottom nav (mobile)** | Thumb-friendly, visible | Limited to 5 items | Mobile-first apps |
| **Hamburger menu** | Saves space | Hidden, poor discovery | Secondary nav, space-constrained |
| **Tab bar** | Clear sections, easy switching | Limited items | Single-purpose apps |

**Framework:**
```
Navigation pattern decision:

Platform priority?
├── Desktop-first → Top nav or side nav
├── Mobile-first → Bottom nav or tabs
└── Both equally → Adaptive (different per device)

Number of primary destinations?
├── 2-5 items → Top nav, tabs, bottom nav
├── 5-10 items → Side nav, mega menu
├── 10+ items → Side nav with grouping

User behavior?
├── Frequent section switching → Visible nav always
├── Deep work in one section → Collapsible nav
├── Browsing/exploring → Sticky visible nav

MOBILE CONSIDERATIONS:
Top of screen: Hard to reach (one-handed)
Bottom of screen: Easy thumb access
Hamburger: 3-click tax, poor discovery
Gesture navigation: Hidden, conflicts with OS

RESPONSIVE PATTERNS:
Desktop: Side nav (expanded)
Tablet: Side nav (collapsed) or top nav
Mobile: Bottom nav or hamburger

NAVIGATION TESTING:
- First-click test: Do users click right?
- Time to find: How long to reach sections?
- Navigation confidence: Do users feel oriented?
```

**Default Recommendation:** Top nav for marketing/simple sites, side nav for complex web apps, bottom nav for mobile apps. Always test with real users.

---

## Decision 4: Onboarding Strategy

**Context:** Designing the new user experience.

**Options:**

| Strategy | Pros | Cons | Choose When |
|----------|------|------|-------------|
| **No onboarding** | Immediate value, no barrier | Users may be lost | Simple, self-explanatory products |
| **Guided tour** | Teaches features, low effort | Can be skippable/ignored | Complex products, many features |
| **Progressive disclosure** | Learn by doing, contextual | May miss features | Moderate complexity |
| **Checklist** | Clear goals, flexible pace | Can feel like homework | Products needing setup |
| **Interactive tutorial** | Hands-on learning | Longer time to value | Complex workflows |

**Framework:**
```
Onboarding strategy selection:

Product complexity?
├── Simple → No onboarding or minimal tooltips
├── Moderate → Progressive disclosure
├── Complex → Guided tour or tutorial
└── Very complex → Combination approach

Setup requirements?
├── None needed → Skip straight to value
├── Some setup → Minimum viable, then just-in-time
└── Significant setup → Checklist with progress

User motivation?
├── High (paid, committed) → Can handle longer onboarding
├── Low (free, exploring) → Minimal friction, show value fast
└── Mixed → Optional depth

ONBOARDING PRINCIPLES:
1. Value before work
   Show outcome → teach input
   "Here's what you can do"

2. Minimum viable onboarding
   Only absolute requirements upfront
   Everything else later

3. Contextual learning
   Teach when relevant
   Not everything at once

4. Progress indication
   "Step 2 of 3"
   Completion motivation

5. Easy skip/revisit
   Don't trap users
   Help always available

METRICS:
Time to first value
Onboarding completion rate
Feature discovery rate
7-day retention by onboarding path
```

**Default Recommendation:** Progressive disclosure with minimum upfront requirements. Add checklist for setup-heavy products. Always measure time to first value.

---

## Decision 5: Error Handling Approach

**Context:** Designing how the system communicates and recovers from errors.

**Options:**

| Approach | Pros | Cons | Choose When |
|----------|------|------|-------------|
| **Prevent errors** | Best UX, no recovery needed | Not always possible | High-stakes, predictable inputs |
| **Inline validation** | Immediate feedback | Can be noisy | Form inputs, known formats |
| **Error messages** | Clear communication | Reactive, not proactive | After-the-fact errors |
| **Error recovery** | Keeps users moving | May mask underlying issues | Common, recoverable errors |
| **Fallback/degradation** | Something works | May confuse expectations | System-level failures |

**Framework:**
```
Error handling decision:

Can error be prevented?
├── Yes (constraints, validation) → Prevent it
├── Partially → Prevent + handle remainder
└── No (system failure, network) → Handle gracefully

Error type?
├── User input error → Inline validation + help
├── System error → Clear message + recovery
├── Network error → Retry + offline support
├── Authentication → Clear path to fix

Error severity?
├── Critical (data loss) → Block + confirm + help
├── Recoverable → Message + action
├── Informational → Toast/subtle alert
└── Silent → Log, don't show user

ERROR MESSAGE ANATOMY:
1. What happened (clear, non-technical)
2. Why it happened (if helpful)
3. How to fix it (specific action)
4. Alternative paths (if fix not possible)

EXAMPLES:
Bad: "Error 500"
Good: "We couldn't save your changes. Check your
      connection and try again. [Retry] [Save locally]"

Bad: "Invalid input"
Good: "Please enter a valid email address.
      Example: name@company.com"

PREVENTION METHODS:
- Constraints (dropdowns vs. free text)
- Smart defaults (pre-fill known values)
- Real-time validation (before submit)
- Confirmation for destructive actions
- Undo instead of confirm
```

**Default Recommendation:** Prevent errors first (constraints, defaults). Inline validation for user input. Clear error messages with specific recovery actions. Always test error states.

---

## Decision 6: Mobile Design Strategy

**Context:** Deciding how to approach mobile design relative to desktop.

**Options:**

| Strategy | Pros | Cons | Choose When |
|----------|------|------|-------------|
| **Mobile-first** | Forces prioritization, clean | Desktop may feel sparse | Mobile is primary platform |
| **Desktop-first** | Familiar workflow | Mobile often afterthought | Desktop is primary platform |
| **Responsive** | One codebase, adapts | Compromise in both contexts | Similar experiences needed |
| **Separate apps** | Optimized per platform | Expensive, maintenance burden | Very different needs per platform |

**Framework:**
```
Mobile strategy decision:

Where do users access?
├── Primarily mobile → Mobile-first
├── Primarily desktop → Desktop-first
├── Mixed → Responsive with breakpoints
└── Very different contexts → Consider separate

Nature of tasks?
├── Quick actions → Mobile-optimized essential
├── Complex workflows → Desktop may be required
├── Content consumption → Responsive works well
└── Creation/editing → Desktop-first often better

MOBILE-FIRST PRINCIPLES:
1. Start with mobile constraints
2. Add complexity for larger screens
3. Touch-first interactions
4. Performance priority

RESPONSIVE BREAKPOINTS:
320px: Minimum mobile
375px: Common phones
768px: Tablets
1024px: Small desktop
1280px: Desktop
1536px: Large desktop

MOBILE CONSIDERATIONS:
- Touch targets: 44x44px minimum
- Thumb zone: Bottom of screen preferred
- Connection: Handle slow/offline
- Context: Users may be distracted
- Screen time: Quick interactions

RESPONSIVE PATTERNS:
Navigation: Top → hamburger on mobile
Layout: Multi-column → single column
Tables: → Cards or horizontal scroll
Forms: → Full width, larger inputs
Touch: → Larger tap targets
```

**Default Recommendation:** Mobile-first for consumer products, desktop-first for complex B2B tools. Always design both, not just scale one down.

---

## Decision 7: Accessibility Level

**Context:** Choosing how thoroughly to implement accessibility.

**Options:**

| Level | Pros | Cons | Choose When |
|-------|------|------|-------------|
| **WCAG A** | Basic access, legal minimum | Excludes many users | Minimum legal requirement |
| **WCAG AA** | Most users included | Some investment needed | Standard for most products |
| **WCAG AAA** | Maximum inclusion | Significant effort | Government, education, healthcare |
| **Beyond WCAG** | Exceptional experience | Custom work required | When a11y is competitive advantage |

**Framework:**
```
Accessibility level decision:

Legal requirements?
├── Government/education → AA minimum, often AAA
├── Healthcare → AA minimum
├── Finance → AA minimum
├── Consumer → AA strongly recommended
└── B2B → AA recommended

User base?
├── General public → AA minimum
├── Known demographics → Tailor to needs
├── Older users → Consider AAA
└── High-stakes decisions → Higher standards

WCAG LEVELS:
Level A (minimum):
- Alt text for images
- Keyboard navigation
- Form labels
- Page titles

Level AA (standard):
- Color contrast (4.5:1 text)
- Resize to 200% without loss
- Skip navigation links
- Error identification

Level AAA (enhanced):
- Higher contrast (7:1)
- Sign language for video
- Extended audio description
- Reading level guidance

QUICK WINS (do immediately):
□ Semantic HTML (headings, lists, landmarks)
□ Alt text on images
□ Form labels (not just placeholders)
□ Focus indicators visible
□ Color contrast checked
□ Keyboard navigation works

TESTING:
- Automated: axe, Lighthouse, WAVE
- Manual: Keyboard navigation test
- Screen reader: VoiceOver, NVDA
- User testing: Include disabled users
```

**Default Recommendation:** WCAG AA as baseline for all products. Test with automated tools + keyboard navigation. Include users with disabilities in research when possible.

---

## Decision 8: Feedback and Notification Strategy

**Context:** Deciding how to communicate with users proactively.

**Options:**

| Channel | Pros | Cons | Choose When |
|---------|------|------|-------------|
| **In-app toast** | Contextual, non-intrusive | Missed if not in app | UI feedback, confirmations |
| **In-app badge** | Persistent, draws attention | Can be noisy | Actionable items awaiting |
| **Push notification** | Reaches outside app | Can be annoying, opt-out | Time-sensitive, important |
| **Email** | Permanent record, reaches all | Slow, inbox competition | Not time-sensitive, formal |
| **SMS** | High open rate, urgent | Very intrusive, costly | Critical, time-sensitive |

**Framework:**
```
Notification strategy:

Urgency?
├── Immediate action needed → Push/SMS
├── Soon but not urgent → Push or badge
├── Eventually → Email or badge
└── Nice to know → In-app only

User expectation?
├── Requested (alerts they set up) → Push/email
├── System-generated → In-app first
├── Marketing → Email only, opt-in

NOTIFICATION HIERARCHY:
1. Critical: Security, money, status change
   → All channels, immediate

2. Important: Messages, deadlines
   → Push + badge + email

3. Useful: Updates, activity
   → Badge + optional push

4. Nice: Tips, suggestions
   → In-app only

NOTIFICATION PRINCIPLES:
- Default conservative (opt-in for most)
- Granular controls (by type)
- Easy unsubscribe
- Respect quiet hours
- Batch non-urgent

ANTI-PATTERNS TO AVOID:
✗ Push for marketing without consent
✗ Irreversible notification settings
✗ No way to mute temporarily
✗ Same priority for all notifications
✗ Notifications that don't deep-link

NOTIFICATION CONTENT:
- Clear, specific subject
- Actionable when possible
- Links to right place
- Easy to dismiss/act
```

**Default Recommendation:** In-app for UI feedback, push for time-sensitive and user-configured, email for records and non-urgent. Always provide granular controls.

---

## Decision 9: Empty State Design

**Context:** Deciding what to show when there's no content.

**Options:**

| Approach | Pros | Cons | Choose When |
|----------|------|------|-------------|
| **Educational** | Teaches users what to do | May feel like homework | New users, complex features |
| **Motivational** | Encourages action | Can feel pushy | Creating content, goals |
| **Template/starter** | Quick start, shows value | May not match needs | Creative tools, documents |
| **Minimal** | Clean, not overwhelming | No guidance | Power users, simple actions |

**Framework:**
```
Empty state decision:

User context?
├── First time ever → Educational + motivational
├── Returning, empty section → Lighter guidance
├── Cleared/deleted content → Minimal + undo
└── No results (search) → Helpful alternatives

Feature complexity?
├── Simple (add button obvious) → Minimal
├── Moderate → Light guidance
├── Complex → Tutorial or templates
└── Creative → Templates + examples

EMPTY STATE COMPONENTS:
1. Visual (optional)
   - Illustration or icon
   - Relevant to context
   - Not too large

2. Message
   - What this space is for
   - Why it's empty
   - Encouraging tone

3. Action
   - Primary CTA to fill it
   - Alternative paths if relevant

4. Help (optional)
   - Link to documentation
   - Example content

EXAMPLES:

New user, projects:
[Illustration]
"No projects yet"
"Projects help you organize your work"
[Create your first project] [Import from other tool]

Search, no results:
"No results for 'xyz'"
"Try different keywords or browse categories"
[Clear search] [Browse all]

Cleared content:
"All done!"
[Task completed illustration]
"Nice work clearing your inbox"
[Archive] [View completed]
```

**Default Recommendation:** Educational for first-time empty states, minimal for returning users. Always include a clear primary action. Test that users understand what to do.

---

## Decision 10: User Testing Frequency

**Context:** Deciding how often to test designs with users.

**Options:**

| Frequency | Pros | Cons | Choose When |
|-----------|------|------|-------------|
| **Per feature** | Validates each before dev | Time/resource intensive | High-risk features |
| **Per sprint** | Regular cadence | May not align with design work | Agile teams |
| **Weekly standing** | Continuous learning | Overhead of recruiting | Mature product, dedicated researcher |
| **As needed** | Flexible, resource-efficient | May skip important tests | Resource-constrained teams |

**Framework:**
```
Testing frequency decision:

Resources available?
├── Dedicated researcher → Weekly standing
├── Designer does testing → Per sprint or feature
├── Limited time → As needed, prioritized
└── No resources → Guerrilla testing

Risk level?
├── High stakes (money, health) → Every change
├── Core flows → Per feature minimum
├── Edge features → Per sprint or less
└── Minor changes → As needed

TESTING APPROACHES BY RESOURCE:

Full resources (researcher):
- Weekly usability sessions
- Continuous recruitment
- Mix of moderated/unmoderated
- Regular synthesis and share-out

Limited resources (designer tests):
- Test major features before dev
- Guerrilla testing for quick checks
- Unmoderated tools (Maze, UserTesting)
- Share recordings with team

Minimal resources:
- Test core flows quarterly
- Hallway testing (grab anyone)
- Internal testing with fresh eyes
- Customer support feedback review

WHAT TO ALWAYS TEST:
□ New user onboarding
□ Core conversion flows
□ Major feature redesigns
□ Confusing existing flows (from analytics)
□ High-risk features

WHAT CAN SKIP TESTING:
- Minor copy changes
- Bug fixes
- Internal tools
- Exact replicas of proven patterns
```

**Default Recommendation:** Test every major feature before development, with lightweight testing (5 users) being sufficient for most usability questions. Establish regular rhythm over sporadic testing.
