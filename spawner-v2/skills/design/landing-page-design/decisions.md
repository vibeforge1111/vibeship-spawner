# Decisions: Landing Page Design

Critical decisions that determine landing page success.

---

## Decision 1: Short-Form vs. Long-Form Page

**Context:** Determining the optimal length for your landing page.

**Options:**

| Length | Use When | Pros | Cons |
|--------|----------|------|------|
| **Short** | Warm traffic, simple offer | Fast, focused | Less info |
| **Long** | Cold traffic, complex offer | Complete story | May lose readers |
| **Modular** | Mixed traffic | Scannable depth | Harder to build |

**Framework:**
```
Page length decision:

TRAFFIC TEMPERATURE:
Hot (returning, ready to buy) → Short
Warm (familiar, considering) → Medium
Cold (new, unaware) → Long

OFFER COMPLEXITY:
Simple (newsletter, download) → Short
Medium (trial, demo) → Medium
Complex (purchase, enterprise) → Long

PRICE POINT:
Low (free-$50) → Short
Medium ($50-$500) → Medium
High ($500+) → Long

LENGTH FORMULA:
Length = Complexity × Price × Cold traffic

SHORT-FORM PAGE:
- Hero with value prop
- Quick proof
- CTA
- Maybe benefits
- Total: 1-2 scrolls

LONG-FORM PAGE:
- Hero
- Problem
- Solution
- Benefits (detailed)
- Social proof (multiple)
- How it works
- Objection handling
- Final CTA
- Total: 4-8 scrolls

MODULAR APPROACH:
Short above fold (works alone).
Depth below fold (for scrollers).
Each section complete.

DEFAULT: Start shorter, add length if needed.
```

**Default Recommendation:** Match to traffic temperature and price point. When in doubt, test both.

---

## Decision 2: Lead Gen vs. Direct Purchase

**Context:** Choosing between capturing leads vs. driving immediate purchase.

**Options:**

| Goal | Page Type | Form | CTA |
|------|-----------|------|-----|
| **Lead gen** | Capture interest | Email/Name | "Get guide" |
| **Trial start** | Product access | Email/Password | "Start trial" |
| **Direct sale** | Purchase | Payment | "Buy now" |

**Framework:**
```
Conversion goal decision:

PRODUCT TYPE:
Free content → Lead gen
SaaS product → Trial start
E-commerce → Direct purchase

CONSIDERATION TIME:
Quick decision → Direct action
Needs research → Lead gen first
Needs trial → Free trial

PRICE POINT:
Low (<$50) → Direct purchase
Medium ($50-500) → Trial/Demo
High ($500+) → Lead gen → Sales

TRAFFIC SOURCE:
Cold traffic → Lead gen
Warm traffic → Trial/Purchase
Returning → Purchase

LEAD GEN FLOW:
Landing page → Lead capture
Email nurture → Trial/Demo
Sales if needed

TRIAL FLOW:
Landing page → Trial signup
In-product onboarding → Upgrade

PURCHASE FLOW:
Landing page → Cart
Checkout → Confirmation

FORM COMPLEXITY BY TYPE:
Lead gen: 1-2 fields
Trial: 2-4 fields
Purchase: Full checkout
Demo request: 3-5 fields
```

**Default Recommendation:** SaaS = Free trial when possible. High-touch B2B = Lead gen → Sales.

---

## Decision 3: Gated vs. Ungated Content

**Context:** Whether to require email before showing content/value.

**Options:**

| Strategy | Access | Trade-off |
|----------|--------|-----------|
| **Fully gated** | Email required | Max leads, less reach |
| **Partially gated** | Preview + email for full | Balanced |
| **Ungated** | Free access | Max reach, fewer leads |

**Framework:**
```
Gating decision:

CONTENT VALUE:
High (unique, valuable) → Gate
Medium (useful) → Partial gate
Low (basic info) → Ungate

TRAFFIC GOAL:
Lead generation → Gate
SEO/Awareness → Ungate
Both → Partial gate

BUYER STAGE:
Top of funnel → Lighter gate
Mid funnel → Can gate
Bottom funnel → Already have email

GATING OPTIONS:

FULL GATE:
Content hidden entirely.
Email required to access.
Works for: Ebooks, reports, tools

PARTIAL GATE:
Preview visible (intro, chapters).
Email for full access.
Works for: Guides, templates

PROGRESSIVE GATE:
Free content builds relationship.
Gate for premium/additional.
Works for: Blog → Ebook

UNGATED WITH OPTION:
Full content available.
"Get PDF version" captures email.
Works for: Blog posts, resources

GATE BY CONTENT TYPE:
Blog posts → Never gate
How-to guides → Partial gate
Industry reports → Full gate
Tools/calculators → Full gate
Webinars → Full gate
Templates → Full or partial

CONVERSION MATH:
Gated: Higher conversion, lower reach
Ungated: Lower conversion, higher reach
Test to find balance
```

**Default Recommendation:** Gate premium content, ungate awareness content. Use partial gating as middle ground.

---

## Decision 4: Video vs. Static Content

**Context:** Choosing whether to include video content.

**Options:**

| Content | Best For | Pros | Cons |
|---------|----------|------|------|
| **Static** | Simple products | Fast load, scannable | Less engaging |
| **Video** | Complex products | Demo, emotion | Slow, not watched |
| **Both** | Most cases | Options | More to produce |

**Framework:**
```
Video decision:

PRODUCT COMPLEXITY:
Simple (obvious value) → Static works
Complex (needs demo) → Video helps
Visual (design tools) → Video essential

VIDEO BENEFITS:
- Explain complex features
- Show product in action
- Build emotional connection
- Demonstrate personality
- Feature testimonials

VIDEO COSTS:
- Production time/cost
- Page load speed
- Many users won't watch
- Harder to update

VIDEO TYPES:
Product demo: 60-90 sec
Explainer: 60-120 sec
Testimonial: 30-60 sec
Hero background: 10-30 sec (muted loop)

VIDEO PLACEMENT:

HERO AREA:
Static content + Video thumbnail
"Watch demo (90 sec)"
Click to play

SUPPORTING SECTION:
"See how it works"
[Video player]

TESTIMONIALS:
Video testimonial > Text

VIDEO BEST PRACTICES:
- Click to play (not autoplay)
- Keep short (<90 sec for hero)
- Include captions
- Fast loading (lazy load)
- Works without sound
- Mobile-optimized
```

**Default Recommendation:** Include video for complex products. Always have static alternative. Never auto-play with sound.

---

## Decision 5: Single CTA vs. Multiple Options

**Context:** Deciding how many action paths to offer visitors.

**Options:**

| Strategy | CTAs | Focus | Use When |
|----------|------|-------|----------|
| **Single** | 1 action | Maximum | Clear primary goal |
| **Primary + Secondary** | 2 actions | High | Different intent levels |
| **Multiple** | 3+ actions | Split | Different audiences |

**Framework:**
```
CTA strategy decision:

SINGLE CTA:
When: One clear goal
Example: "Start free trial"
All focus on one action.

PRIMARY + SECONDARY:
When: Two intent levels
Primary: "Start free trial"
Secondary: "or Book a demo"
Both serve conversion goal.

MULTIPLE CTAs:
When: Different audience needs
- Start trial (self-serve)
- Book demo (high-touch)
- View pricing (researching)

CTA HIERARCHY:
Primary: 80% of visual weight
Secondary: 15% of visual weight
Tertiary: 5% of visual weight

WHEN TO USE SINGLE:
- Simple product
- Clear buyer journey
- High-intent traffic
- Single audience type

WHEN TO ADD SECONDARY:
- Mix of self-serve and sales-led
- Different buyer stages
- Some need hand-holding

CTA EXAMPLES:

SINGLE:
[Start Free Trial]

PRIMARY + SECONDARY:
[Start Free Trial]
or talk to sales

MULTIPLE:
[Start Free] [View Pricing] [Book Demo]

VISUAL HIERARCHY:
Primary button: Colored, large
Secondary: Outlined or text link
Tertiary: Small text link

MAXIMUM: 3 CTAs. More = confusion.
```

**Default Recommendation:** One primary CTA. Add secondary only for clearly different needs (self-serve vs. sales-led).

---

## Decision 6: Form Placement

**Context:** Where to place lead capture forms on the page.

**Options:**

| Placement | Conversion | Use When |
|-----------|------------|----------|
| **Hero inline** | Highest | High-intent traffic |
| **After benefits** | Medium | Need to explain value first |
| **Exit intent** | Capture abandoners | Additional capture |
| **Sticky** | Persistent option | Long pages |

**Framework:**
```
Form placement decision:

TRAFFIC INTENT:
High intent → Inline (hero area)
Medium intent → After value explanation
Low intent → Multiple touchpoints

PAGE TYPE:
Lead gen → Prominent (hero or dedicated)
Trial → After value prop
Demo → After explaining product

FORM PLACEMENT OPTIONS:

HERO INLINE:
[Headline + Value prop]
[Form inline in hero]
[Social proof below]

DEDICATED SECTION:
[Hero + benefits]
[Dedicated form section]
[FAQ below]

MODAL/POPUP:
[Content page]
[CTA button] → Opens modal with form

TWO-STEP:
Step 1: [Get Started] button
Step 2: Form appears

EXIT INTENT:
Popup when leaving.
Last chance capture.

STICKY FORM:
Form visible while scrolling.
Fixed to side or bottom.
Good for long pages.

PLACEMENT TESTING:
Above fold: Higher visibility
Below benefits: After understanding value
Test which converts better

MOBILE CONSIDERATION:
Inline forms work.
Sticky can be intrusive.
Modals okay if simple.
```

**Default Recommendation:** Inline for high-intent, after benefits for explanation-needed products. Always test.

---

## Decision 7: Page Speed vs. Visual Richness

**Context:** Balancing visual quality with load time performance.

**Options:**

| Priority | Speed | Visuals | Trade-off |
|----------|-------|---------|-----------|
| **Speed-first** | <2s | Minimal | Less engaging |
| **Balanced** | 2-3s | Good | Best for most |
| **Visual-first** | >3s | Rich | Mobile issues |

**Framework:**
```
Speed vs. richness decision:

TRAFFIC SOURCE:
Paid ads → Speed critical (every second costs)
Organic → Slightly more flexibility
Retargeting → Known users, can be slower

DEVICE BREAKDOWN:
High mobile % → Speed priority
Mostly desktop → More flexibility
Mixed → Mobile-first design

SPEED TARGETS:
Critical: <2s desktop, <3s mobile
Good: 2-3s desktop, 3-4s mobile
Acceptable: 3-4s desktop, 4-5s mobile
Danger: >4s on any device

SPEED IMPACT:
1s delay = 7% conversion loss
3s delay = 32% will leave
5s+ = 90% bounce probability

OPTIMIZATION TACTICS:

IMAGES:
- WebP format
- Proper sizing (not scaled in browser)
- Lazy loading below fold
- Compressed (TinyPNG)

VIDEOS:
- Thumbnail + click to play
- Lazy load video player
- External hosting (YouTube, Vimeo)

CODE:
- Critical CSS inline
- JS deferred
- Minimize third-party scripts
- CDN for assets

TESTING:
- PageSpeed Insights
- GTmetrix
- Test on real mobile devices
- Test on slow connections

VISUAL RICHNESS OPTIONS:
Essential: Hero image, product shots
Nice-to-have: Animation, video, illustrations
Cut if needed: Background video, parallax
```

**Default Recommendation:** Speed-first for paid traffic. Stay under 3 seconds on mobile. Optimize aggressively.

---

## Decision 8: Social Proof Type

**Context:** Choosing which type of social proof to feature.

**Options:**

| Type | Strength | Best For |
|------|----------|----------|
| **Logos** | Quick credibility | B2B, known brands |
| **Testimonials** | Relatability | All |
| **Numbers** | Scale | Established products |
| **Reviews** | Authenticity | Consumer products |

**Framework:**
```
Social proof selection:

AUDIENCE:
B2B Enterprise → Logos + Case studies
B2B SMB → Testimonials + Numbers
B2C → Reviews + User count
Developer → GitHub stars + Integrations

PRODUCT STAGE:
Early (few customers) → Quality testimonials
Growing → Numbers + Logos
Established → All types

AVAILABLE PROOF:
Big name customers? → Logos
Specific results? → Testimonials with data
Large user base? → Numbers
Good reviews? → Ratings/Reviews

PROOF PLACEMENT:

LOGOS (Near hero):
"Trusted by" + 5-7 logos
Immediate credibility

NUMBERS (Inline):
"10,000+ teams" (near CTA)
"4.9/5 rating" (trust signal)

TESTIMONIALS (Mid-page):
After benefits
Near objection areas

REVIEWS (Near CTA):
"★★★★★ 4.8 on G2"
Third-party validation

CASE STUDIES (Deep proof):
Link to dedicated page
For serious prospects

PROOF STRENGTH HIERARCHY:
1. Named customer + Specific result
2. Third-party review rating
3. Customer logos
4. User count
5. Generic testimonials
```

**Default Recommendation:** Logo bar near hero. Testimonials mid-page. Numbers near CTA. Use what you have.

---

## Decision 9: Mobile vs. Desktop Priority

**Context:** Which device to optimize for first.

**Options:**

| Priority | Design | Best When |
|----------|--------|-----------|
| **Mobile-first** | Design for mobile, expand | High mobile traffic |
| **Desktop-first** | Design for desktop, shrink | Complex B2B |
| **Responsive equal** | Both together | Mixed traffic |

**Framework:**
```
Device priority decision:

TRAFFIC BREAKDOWN:
>60% mobile → Mobile-first
40-60% mobile → Responsive equal
<40% mobile → Desktop acceptable

INDUSTRY PATTERNS:
Consumer: Mobile-first
B2B: More desktop
SaaS: Mixed (research on desktop)
E-commerce: Mobile-first

MOBILE-FIRST DESIGN:
1. Design for mobile constraints
2. Expand for desktop
3. Mobile is baseline

MOBILE CONSTRAINTS:
- Small touch targets
- Limited space
- Slower connections
- Shorter attention
- Thumb reach zones

MOBILE-FIRST BENEFITS:
- Forces simplicity
- Ensures mobile works
- Progressive enhancement
- Better performance

MOBILE ADAPTATIONS:
- Larger touch targets (44px+)
- Stacked layouts
- Simplified navigation
- Compressed content
- Thumb-friendly CTA

DESKTOP ENHANCEMENTS:
- Multi-column layouts
- More visual richness
- Expanded content
- Sidebar elements
- Larger imagery

TESTING REQUIREMENT:
Test on real devices.
Both iOS and Android.
Slow connection simulation.
```

**Default Recommendation:** Mobile-first unless B2B enterprise with <30% mobile traffic. Always test both devices.

---

## Decision 10: A/B Test Priority

**Context:** Deciding what to test first for conversion improvement.

**Options:**

| Element | Impact | Effort | Priority |
|---------|--------|--------|----------|
| **Headline** | High | Low | Test first |
| **CTA** | High | Low | Test early |
| **Form** | High | Medium | Test early |
| **Layout** | Medium | High | Test later |
| **Images** | Medium | Low | Test mid |
| **Copy** | Medium | Medium | Test ongoing |

**Framework:**
```
A/B testing priority:

HIGH IMPACT, LOW EFFORT (Test first):
1. Headline (value prop)
2. CTA button (text + color)
3. Form (fields, placement)
4. Hero layout
5. Social proof placement

MEDIUM IMPACT (Test second):
6. Subheadline
7. Hero image/visual
8. Benefit order
9. Testimonial selection
10. Form copy

LOWER IMPACT (Test later):
11. Color schemes
12. Font choices
13. Button shapes
14. Minor copy tweaks

TESTING PRINCIPLES:
One variable at a time.
Statistical significance required.
Run long enough (2+ weeks).
Traffic minimum: 1000+ visitors per variant.

TEST HIERARCHY:

BEFORE TESTING:
Fix obvious issues first.
Technical bugs.
Broken user flows.
Mobile problems.

THEN TEST:
Big swings first.
Headline variations.
Different CTAs.
Layout changes.

THEN REFINE:
Smaller optimizations.
Copy tweaks.
Visual adjustments.

WHAT NOT TO TEST:
Things with <5% impact potential.
Tiny changes on low traffic pages.
Things you should just fix.
```

**Default Recommendation:** Test headlines first. Then CTA. Then form. Big changes before small tweaks.
