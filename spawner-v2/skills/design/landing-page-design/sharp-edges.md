# Sharp Edges: Landing Page Design

Critical mistakes that kill conversions and waste traffic.

---

## 1. The Navigation Trap

**Severity:** Critical
**Situation:** Including full site navigation on landing pages
**Why Dangerous:** Every link is an exit—navigation bleeds conversions.

```
THE TRAP:
Landing page includes:
[Home] [About] [Features] [Pricing] [Blog] [Contact]

Visitor clicks "Blog"
Reads article
Leaves
Never converts

You paid for that visitor.
Navigation stole them.

THE REALITY:
Landing pages have ONE goal.
Every link that isn't that goal is a leak.
Full nav can reduce conversions by 30-50%.

THE FIX:
1. Remove all navigation
   Landing page ≠ Website page
   One goal = One action

2. Logo-only header
   Logo links to homepage (minimal leak)
   Or: Logo doesn't link at all

3. Anchor links only (if needed)
   Same-page navigation okay
   Links to other pages = leaks

4. Exit intent for research
   If they try to leave
   Capture or redirect

WHAT TO KEEP:
✓ Logo (optionally linked)
✓ Same-page anchors
✓ CTA button

WHAT TO REMOVE:
✗ Full navigation
✗ Footer with links
✗ Social links
✗ "Learn more" to other pages
✗ Blog links
✗ About pages
```

---

## 2. The Slow Load Death

**Severity:** Critical
**Situation:** Page takes too long to load
**Why Dangerous:** Every second costs 7-20% conversions.

```
THE TRAP:
Page load time: 5 seconds
Mobile load time: 8 seconds

Statistics:
1s delay = 7% conversion loss
3s delay = 32% will leave
5s delay = 90% bounce probability

Your beautiful page = never seen.

THE REALITY:
Speed is conversion.
Users won't wait.
Google penalizes slow pages.
Mobile is often 2x slower.

THE FIX:
1. Optimize images
   WebP format
   Lazy loading
   Right-sized (not scaled in browser)
   Compressed (TinyPNG, Squoosh)

2. Minimize resources
   Critical CSS only
   Defer non-essential JS
   Reduce third-party scripts
   No unnecessary fonts

3. Fast hosting
   CDN for all assets
   Edge deployment (Vercel, Cloudflare)
   HTTP/2 or HTTP/3

4. Core Web Vitals
   LCP < 2.5s (Largest Contentful Paint)
   FID < 100ms (First Input Delay)
   CLS < 0.1 (Cumulative Layout Shift)

SPEED TARGETS:
Target: <2s desktop, <3s mobile
Acceptable: <3s desktop, <4s mobile
Dangerous: >4s on any device

SPEED TEST TOOLS:
- PageSpeed Insights
- GTmetrix
- WebPageTest
- Lighthouse
```

---

## 3. The CTA Cemetery

**Severity:** High
**Situation:** CTAs buried, hidden, or missing above the fold
**Why Dangerous:** If they can't find it, they can't click it.

```
THE TRAP:
Above the fold:
[Beautiful hero image]
[Long headline]
[Paragraph of text]

CTA location: Below the fold
CTA visibility: Low contrast
CTA size: Small
CTA text: "Submit"

Nobody scrolls to find your button.

THE REALITY:
Most visitors never scroll.
CTA must be immediately visible.
Visual hierarchy should point to CTA.

THE FIX:
1. CTA above the fold
   Always visible without scrolling
   Multiple CTAs down the page
   Same primary action throughout

2. Visual prominence
   High contrast color
   Larger size than other elements
   Whitespace around it
   Points to it (visual flow)

3. Action-oriented text
   Not: "Submit" or "Click here"
   But: "Start free trial" or "Get my guide"

4. Repeat CTAs
   After hero (above fold)
   After benefits
   After social proof
   Final section

CTA CHECKLIST:
□ Above the fold
□ High contrast
□ Large enough (44x44px minimum touch)
□ Action-oriented text
□ Repeated throughout page
□ Easy to find in 3 seconds

CTA PLACEMENT TEST:
Squint at your page.
Can you still find the CTA?
If not, it needs more prominence.
```

---

## 4. The Message Mismatch

**Severity:** Critical
**Situation:** Landing page doesn't match ad that sent them there
**Why Dangerous:** Confusion = bounce. Visitors need immediate confirmation they're in the right place.

```
THE TRAP:
Ad says: "50% off running shoes"
Landing page says: "Explore our athletic collection"

Visitor thinks:
"Did I click the wrong link?"
"Where are the running shoes?"
"Where's my 50%?"
→ Bounces

THE REALITY:
Visitors arrive with expectations.
You have 3 seconds to confirm them.
Mismatch = immediate exit.

THE FIX:
1. Message match
   Ad headline → Landing page headline
   Same offer, same language
   Immediate confirmation

2. Scent trail
   Visual consistency (colors, imagery)
   Same tone and voice
   Offer clearly visible

3. Dynamic landing pages
   Different versions for different ads
   Keyword insertion
   Personalized headlines

4. Ad-to-page audit
   For every ad, check landing page
   Same promise? Same keywords?
   Same visual style?

MESSAGE MATCH EXAMPLES:

BAD:
Ad: "Free project management software"
LP: "The all-in-one productivity suite"

GOOD:
Ad: "Free project management software"
LP: "Free Project Management Software
     Start organizing your team today."

SCENT ELEMENTS:
- Headline matches ad
- Offer is immediately visible
- Same images/visuals
- Same color scheme
- Same specific terms
```

---

## 5. The Form Field Fiasco

**Severity:** High
**Situation:** Forms with too many fields
**Why Dangerous:** Every field reduces completions. Less is more.

```
THE TRAP:
Lead capture form:
- First name
- Last name
- Email
- Phone
- Company
- Company size
- Job title
- Industry
- Budget
- Message
- How did you hear about us?

Form completion rate: 2%

THE REALITY:
Each field = friction.
Each field = drop-off.
Users guard their information.

THE FIX:
1. Minimum viable fields
   Lead gen: Email only (or + first name)
   Trial signup: Email + password
   Demo request: Name + email + company

2. Progressive profiling
   Get email first
   Ask more later (in-product, email)
   Build profile over time

3. Smart defaults
   Auto-detect company from email
   Auto-fill from browser
   Pre-populate when possible

4. Field justification
   For each field ask: "Do we need this NOW?"
   If no, remove it.

FIELD REDUCTION IMPACT:
4 fields → 3 fields = 50% more conversions
Removing phone = 5% lift
Removing optional = 10% lift

LEAD GEN FIELDS:
Ideal: 1-3 fields
Acceptable: 4-5 fields
Too many: 6+ fields

B2B EXCEPTION:
Sales qualification may need more.
But: Get essentials first, qualify later.
```

---

## 6. The Mobile Afterthought

**Severity:** Critical
**Situation:** Designing for desktop first (or only)
**Why Dangerous:** 50-70% of traffic is mobile. Mobile-unfriendly = lost conversions.

```
THE TRAP:
Desktop design: Beautiful
Mobile reality:
- Hero image squashed
- Text unreadable
- CTA tiny
- Form unusable
- Load time: 12 seconds

Mobile traffic: 65%
Mobile conversions: 1%
Desktop conversions: 5%

Mobile failure = most conversions lost.

THE REALITY:
Most visitors are on mobile.
Mobile has less patience.
Mobile has more friction.
Mobile-first is survival.

THE FIX:
1. Mobile-first design
   Design for mobile first
   Expand to desktop
   Not the other way around

2. Touch-friendly
   44x44px minimum touch targets
   Spacing between tap targets
   No hover-dependent elements

3. Readable without zoom
   16px minimum font
   High contrast
   Short line lengths

4. Fast on mobile
   Test on real devices
   Test on slow connections
   Mobile load < 3 seconds

5. Thumb-zone CTA
   Button in easy thumb reach
   Not at very top or bottom
   Sticky CTA on scroll

MOBILE CHECKLIST:
□ CTA above fold on mobile
□ Text readable without zoom
□ Touch targets 44px+
□ No horizontal scroll
□ Fast load (<3s)
□ Form usable on phone
□ No hover-only actions
```

---

## 7. The Social Proof Desert

**Severity:** High
**Situation:** Landing page with no credibility signals
**Why Dangerous:** No proof = no trust = no conversion.

```
THE TRAP:
Landing page says:
"The best project management tool"
"Trusted by teams worldwide"
"Amazing results guaranteed"

Proof: None
Logos: None
Testimonials: None
Numbers: None

Visitor: "Says who? Prove it."

THE REALITY:
Claims without proof are ignored.
Trust must be established.
Other customers' voices > your voice.

THE FIX:
1. Customer logos
   5-7 recognizable logos
   Mix of aspirational and relatable
   "Trusted by" section

2. Testimonials
   Real quotes with real names
   Specific results, not vague praise
   Photos when possible

3. Numbers
   "10,000+ teams"
   "4.9/5 rating"
   "Saved $2M in aggregate"

4. Trust badges
   Security certifications
   Industry awards
   Media mentions

5. Strategic placement
   Near decision points
   Next to CTAs
   After objection areas

SOCIAL PROOF TYPES:
- Customer logos (trust)
- Testimonials (relatability)
- Case studies (depth)
- Reviews/ratings (validation)
- Media mentions (authority)
- Certifications (safety)

SOCIAL PROOF PLACEMENT:
Hero: Logo bar
Benefits: Testimonials
CTA: Reviews/ratings
Footer: Full logos
```

---

## 8. The Value Prop Vacuum

**Severity:** Critical
**Situation:** Headline doesn't communicate value proposition
**Why Dangerous:** If they don't understand what you do in 5 seconds, they leave.

```
THE TRAP:
Hero headline:
"Welcome to our platform"
"Innovation meets simplicity"
"The future of [vague category]"

Visitor in 5 seconds:
"What is this?"
"What does it do?"
"Why should I care?"
→ Bounces

THE REALITY:
You have 5 seconds to communicate value.
Headline is your most important copy.
Clarity > cleverness. Every time.

THE FIX:
1. Clear value proposition
   What is it?
   Who is it for?
   What's the benefit?

2. Specific > generic
   Not: "Powerful software"
   But: "Close deals 40% faster"

3. Test with strangers
   Show for 5 seconds
   Ask: "What does this company do?"
   If they can't answer, rewrite

4. Headline formula
   [End result customer wants]
   [Specific period of time]
   [Address objection]

   "Close more deals in less time
    without the CRM complexity"

VALUE PROP COMPONENTS:
- Target audience (who)
- Problem/desire (what)
- Solution (how)
- Differentiator (why you)

BAD HEADLINES:
"Welcome to Acme"
"The future of work"
"Next-generation platform"

GOOD HEADLINES:
"Project management for teams who ship"
"Send invoices in 30 seconds"
"Email marketing that grows with you"
```

---

## 9. The Distraction Disaster

**Severity:** High
**Situation:** Too many competing elements on the page
**Why Dangerous:** Confused minds don't convert. Focus drives action.

```
THE TRAP:
Landing page contains:
- Three different offers
- Seven different CTAs
- Blog sidebar
- Newsletter popup
- Chat widget
- Social feeds
- Related products
- Partner links
- Video autoplay
- Animation everywhere

Visitor attention: Shattered
Conversion: Near zero

THE REALITY:
One page, one goal.
Every distraction costs conversions.
Simplicity wins.

THE FIX:
1. Single goal
   Define the ONE thing you want them to do
   Remove everything that isn't that

2. Visual hierarchy
   One primary focus (CTA)
   Supporting elements secondary
   Clear path for the eye

3. Remove distractions
   No unrelated links
   No competing offers
   No extraneous widgets

4. Whitespace is good
   Let elements breathe
   Whitespace focuses attention
   Crowded = confusing

DISTRACTION AUDIT:
For every element ask:
"Does this help them convert?"
If no → remove it.

ELEMENTS TO QUESTION:
- Popup immediately on load?
- Chat widget visible?
- Sidebar content?
- Multiple offers?
- Autoplay video?
- Excessive animations?

FOCUS TEST:
Squint at your page.
Is there ONE obvious focal point?
If not, simplify.
```

---

## 10. The Scroll Assumption

**Severity:** High
**Situation:** Assuming visitors will scroll to see important content
**Why Dangerous:** Many visitors never scroll. Above the fold is critical.

```
THE TRAP:
Page structure:
Hero: Beautiful image (no copy)
Scroll 1: What we do
Scroll 2: Benefits
Scroll 3: Social proof
Scroll 4: CTA

85% of visitors: See hero only
85% of value: Hidden below

THE REALITY:
Many never scroll.
Those who do scroll skim.
Above-the-fold real estate is gold.

THE FIX:
1. Complete story above fold
   Value prop: Clear
   What you do: Clear
   Who it's for: Clear
   Primary CTA: Visible

2. Give scroll motivation
   Partial content visible
   Visual cue to scroll
   Promise more value below

3. Key info at multiple points
   CTA: Multiple placements
   Value prop: Reinforced
   Social proof: Throughout

4. Sticky elements
   Sticky CTA button
   Persistent header
   Follow as they scroll

ABOVE-THE-FOLD MUST-HAVES:
□ Clear headline
□ Subheadline with benefit
□ Primary CTA button
□ Some form of proof
□ Basic "what it is"

SCROLL CUES:
- Partial content visible below fold
- "Scroll for more" indicator
- Animation pointing down
- Numbered sections
```

---

## 11. The Generic Image Graveyard

**Severity:** Medium
**Situation:** Using stock photos that feel inauthentic
**Why Dangerous:** Generic images signal generic product. Authenticity builds trust.

```
THE TRAP:
Image choices:
- Handshake photo
- Smiling people at laptop
- Multicultural boardroom
- Woman looking at chart
- Puzzle pieces connecting

Visitor: "This looks like every other site."
Trust: Decreases
Conversion: Suffers

THE REALITY:
Stock photos are recognized.
Generic = forgettable.
Authentic visuals build trust.

THE FIX:
1. Product screenshots
   Show the actual product
   Real interface, real data
   What they'll actually get

2. Real team photos
   Actual team members
   Authentic environments
   Builds human connection

3. Customer photos
   Real users (with permission)
   Real results
   Authentic testimonials

4. Custom illustrations
   Brand-specific style
   Unique and ownable
   Better than bad photos

5. If stock is necessary
   Choose realistic, unstaged
   Diverse but natural
   Avoid clichés

STOCK PHOTO CLICHÉS TO AVOID:
✗ Business handshake
✗ Happy office workers at laptops
✗ Light bulb / brain
✗ Puzzle pieces
✗ Target with arrow
✗ Rocket ship
✗ Gears and cogs

BETTER OPTIONS:
✓ Product screenshots
✓ Real team
✓ Real customers
✓ Custom illustration
✓ Abstract/geometric
```

---

## 12. The Objection Silence

**Severity:** High
**Situation:** Not addressing common objections before the CTA
**Why Dangerous:** Unanswered objections prevent conversion.

```
THE TRAP:
Landing page covers:
✓ Features
✓ Benefits
✓ Social proof
✓ CTA

Doesn't address:
✗ "Is this secure?"
✗ "What if I don't like it?"
✗ "Is this too expensive?"
✗ "How hard is setup?"

Visitor thinks objection → Doesn't convert

THE REALITY:
Every visitor has hesitations.
Unaddressed objections = friction.
Overcome before they become blockers.

THE FIX:
1. Identify common objections
   Talk to sales
   Read support tickets
   Survey abandoners
   Check reviews

2. Address proactively
   Near relevant sections
   Before the CTA
   FAQ section

3. Risk reversal
   Money-back guarantee
   Free trial
   Cancel anytime
   "No credit card required"

4. Trust signals
   Security badges
   Privacy commitment
   Testimonials about concerns

COMMON OBJECTIONS:
- Price: "Is it worth it?"
- Risk: "What if it doesn't work?"
- Complexity: "Is it hard to set up?"
- Trust: "Is my data safe?"
- Fit: "Is this for me?"

OBJECTION HANDLING:
Place guarantee near CTA
"30-day money-back guarantee"
"Cancel anytime. No questions."
"Free trial. No credit card."

This reduces perceived risk
and increases conversion.
```
