# Decisions: Growth Strategy

Critical decision points that determine growth strategy success.

---

## Decision 1: Product-Led vs Sales-Led Growth

**Context:** When determining your primary growth motion.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Product-Led (PLG)** | Low CAC, scalable, users self-qualify | Requires great UX, slow enterprise, support burden | Self-serve product, low price point, easy to try |
| **Sales-Led** | High deal values, relationships, complex sales | High CAC, headcount dependency, slow to scale | Enterprise target, complex product, >$20K deals |
| **Hybrid** | Best of both, multiple paths | Complex operations, potential conflict | Mid-market, land-and-expand strategy |

**Framework:**
```
Product Complexity vs Deal Size:

                    High Complexity
                          │
           Sales-Led      │      Hybrid
           (Salesforce)   │      (Slack)
                          │
    ──────────────────────┼──────────────────────
                          │
           Hybrid         │      Product-Led
           (Zoom)         │      (Canva)
                          │
                    Low Complexity

    Low Price ───────────────────────── High Price

Decision questions:
1. Can users get value without talking to anyone?
2. Is purchase decision individual or committee?
3. What's your average deal size?
4. How long is the consideration period?
```

**Default Recommendation:** Start product-led if possible. PLG builds compounding acquisition and is more capital efficient. Add sales to capture enterprise once self-serve is working.

---

## Decision 2: Acquisition Channel Focus

**Context:** When choosing which growth channels to invest in.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Paid Acquisition** | Predictable, immediate, scalable | Expensive, no moat, diminishing returns | Proven unit economics, funding available, testing PMF |
| **Organic/SEO** | Compounds, defensible, free traffic | Slow (6-18 months), requires content | Users search for solutions, long-term horizon |
| **Viral/Referral** | Free acquisition, best CAC | Requires product fit, unpredictable | Product is inherently shareable |
| **Partnerships** | Access to audiences, credibility | Slow, dependent on others | Complementary products, enterprise market |

**Framework:**
```
The Bullseye Framework:

Outer Ring (Brainstorm all 19 channels):
Viral, PR, SEO, Content, Paid, Email, Sales,
Community, Partnerships, Events, Engineering,
Affiliate, Platforms, Trade shows, Speaking,
Offline ads, Influencers, Business dev, Licensing

Middle Ring (Test top 6):
Score each: Potential × Fit × Cost-to-test
Run $500-2K tests on top 6

Inner Ring (Double down on 1-2):
Find the ONE that works
Exhaust it before diversifying

Most growth comes from ONE channel.
```

**Default Recommendation:** Test multiple, commit to one. Spreading resources across many channels means none work well. Find your channel, then scale it.

---

## Decision 3: Free Tier vs Free Trial

**Context:** When designing your freemium strategy.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Free Forever Tier** | Low friction, viral potential, large base | Support costs, conversion challenge | Network effects, viral product, land-and-expand |
| **Free Trial (Time-limited)** | Creates urgency, qualifies buyers, clear path | Higher friction, smaller top of funnel | High-value product, clear value delivery |
| **Free Trial (Usage-limited)** | Value-based, scales with success | Complex to manage, may feel punitive | Consumption-based pricing, measurable value |
| **No Free** | Qualifies buyers, simpler ops | Smallest funnel, higher friction | Premium positioning, complex sales |

**Framework:**
```
Free Tier Decision Tree:

Does your product have network effects?
├── Yes → Free tier helps build network
│         (Slack, LinkedIn)
└── No → Continue

Is virality built into product usage?
├── Yes → Free tier enables sharing
│         (Calendly, Loom)
└── No → Continue

Can you deliver value quickly?
├── Yes → Free trial works
│         (14-day trial with clear value)
└── No → Consider demo/sales motion

Free tier metrics to watch:
- Free-to-paid conversion rate (>2% is good)
- Time to upgrade (shorter is better)
- Free user support cost
- Viral coefficient of free users
```

**Default Recommendation:** Free trial over free tier unless you have viral/network mechanics. Free tiers are expensive and rarely convert without explicit viral value.

---

## Decision 4: When to Scale Acquisition

**Context:** When deciding if you're ready to scale growth investment.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Scale Now** | Capture market, hit targets, show growth | May burn money on broken funnel | Proven retention, unit economics work, clear channel |
| **Fix First** | Efficient use of capital, sustainable | May miss window, slower growth | Retention poor, economics don't work, funnel leaks |
| **Test and Scale** | Balanced approach | Complexity, slower than full scale | Some metrics good, others unknown |

**Framework:**
```
Scale Readiness Scorecard:

Retention Score (must pass):
□ D1 retention > 40% (consumer) or > 85% (B2B)
□ Month 3+ retention > 20% (consumer) or > 80% (B2B)
□ Cohort curves flatten (not declining to zero)

Unit Economics (must pass):
□ LTV:CAC > 3:1
□ Payback period < 12 months
□ Gross margin > 60%

Channel Proof (nice to have):
□ CAC stable as you 3x spend
□ Channel has headroom (not saturated)
□ Repeatable process documented

Scoring:
- All retention + economics pass → Scale
- Any retention fails → Fix retention first
- Economics fail → Fix pricing/efficiency first
- Channel unclear → Test channel first
```

**Default Recommendation:** Fix retention before scaling. Every dollar spent acquiring users who churn is wasted. Retention first, always.

---

## Decision 5: Horizontal vs Vertical Expansion

**Context:** When planning how to grow your market.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Horizontal (new segments)** | Larger TAM, diversified | Diluted positioning, spread thin | Dominant in current segment, clear adjacent need |
| **Vertical (deeper in segment)** | Strong positioning, efficient | Ceiling risk, segment dependency | Not yet dominant, segment has depth |
| **Geographic** | Market expansion, growth | Localization costs, ops complexity | Strong in home market, international demand |
| **Product Expansion** | Increase LTV, stickiness | Complexity, distraction | Core product mature, clear customer request |

**Framework:**
```
Expansion Readiness:

Before expanding horizontally, ask:
1. Are we #1 or #2 in current segment?
   No → Stay focused
2. Is current segment fully penetrated?
   No → Grow current first
3. Is there natural pull from adjacent segment?
   No → Expansion will be hard

Before product expansion, ask:
1. Are customers ASKING for new product?
   No → Don't build it
2. Is it natural extension of current value?
   No → May confuse positioning
3. Will it increase retention/LTV significantly?
   No → Not worth complexity

Sequence:
Vertical depth → Product expansion → Horizontal segments → Geographic
```

**Default Recommendation:** Go vertical first. Dominance in one segment beats mediocrity in many. Expand only after dominance, not to escape a losing position.

---

## Decision 6: Referral Program Design

**Context:** When designing incentive structure for referrals.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Two-sided (both get reward)** | Fair, encouraged sharing | More expensive, complex | High LTV supports cost, B2C products |
| **Referrer only** | Cheaper, simpler | Feels spammy, less compelling | Cost-sensitive, existing demand |
| **Referred only** | Feels generous, good impression | Less incentive for referrer | Strong organic referral exists, brand-focused |
| **Non-monetary** | Cheap, on-brand | Less motivating for some | Community-driven product, premium brand |

**Framework:**
```
Referral Program Prerequisites:

Before building referral program:
□ Do users refer WITHOUT incentives?
  No → Incentives won't help. Fix product.

□ What's the organic referral rate?
  Baseline: ___ referrals per 100 users
  (If near zero, incentives won't fix it)

□ Why do current referrers refer?
  Understand motivation before adding incentives

Incentive Design:
- Value should be 10-20% of LTV (affordable)
- Reward should match product (credits > cash)
- Timing: instant for referred, delayed for referrer
- Double-sided usually outperforms single-sided

Measure:
- Viral coefficient: K = invites × conversion
- K > 1 = viral growth
- K > 0.5 = meaningful contribution
- K < 0.3 = not working
```

**Default Recommendation:** Two-sided rewards with product credits. Only launch after proving organic referral exists. Incentives amplify behavior; they don't create it.

---

## Decision 7: Pricing Model Selection

**Context:** When designing how to capture value.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Flat subscription** | Simple, predictable revenue | May leave money on table, low price anchor | Simple product, individual users |
| **Usage-based** | Scales with value, low barrier | Revenue volatility, harder to predict | Variable value delivery, API/infrastructure |
| **Per-seat** | Natural expansion, clear metric | Discourages adoption, gaming | Collaboration tools, team products |
| **Tiered** | Segmented capture, upgrade path | Complexity, feature gating decisions | Diverse customer segments, feature depth |

**Framework:**
```
Pricing Model Decision Tree:

Does value scale with usage?
├── Yes (API, storage, messages)
│   → Usage-based component
└── No → Continue

Does value scale with team size?
├── Yes (collaboration, communication)
│   → Per-seat component
└── No → Continue

Do you have distinct customer segments?
├── Yes (SMB, mid-market, enterprise)
│   → Tiered pricing
└── No → Flat subscription

Hybrid is often best:
- Base subscription + usage = predictable + scalable
- Per-seat with tier caps = expansion + segmentation
- Tier + usage = segmentation + value capture

The goal: Pricing that grows with customer success.
```

**Default Recommendation:** Start simple, add complexity as you learn. Flat subscription gets you started; optimize pricing model after you have data on how customers get value.

---

## Decision 8: Growth Team Structure

**Context:** When building your growth organization.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Centralized Growth Team** | Focused, specialized, clear ownership | Siloed, may lack product context | Growth is distinct discipline, clear scope |
| **Embedded in Product** | Product context, integrated | No dedicated focus, deprioritized | Product IS growth, early stage |
| **Growth Pods** | Best of both, cross-functional | Coordination overhead, complexity | Scale, multiple growth bets |
| **CEO-Owned** | Ultimate priority, no politics | CEO bandwidth, no specialization | Early stage, pre-PMF |

**Framework:**
```
Growth Organization Evolution:

Stage 1 (Pre-PMF):
CEO + one growth-minded person
Focus: Retention, activation
Don't scale acquisition yet

Stage 2 (Early Growth):
Small growth team (2-5)
PM + Engineer + Designer + Data
Focus: Growth loops, channel testing
Still embedded with product

Stage 3 (Scaling):
Growth pods by lever
- Acquisition pod
- Activation pod
- Monetization pod
Each: PM + Eng + Design + Data
Focus: Optimize each stage

Stage 4 (Mature):
Centralized strategy + embedded execution
Growth leadership sets strategy
Growth engineers on product teams
Focus: Compounding growth systems

Key principle: Growth needs engineering.
If growth can't change the product, it fails.
```

**Default Recommendation:** Start embedded, separate later. Growth that can't ship product changes is just marketing. Embed growth in product until you have dedicated engineering capacity.

---

## Decision 9: International Expansion Timing

**Context:** When considering geographic growth.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Global from Day 1** | First mover advantage, larger market | Resource spread, localization debt | Digital product, English-first works globally |
| **Dominate Home First** | Focus, proven model, efficiency | May miss markets, slower total growth | Local market large enough, model unproven |
| **Follow Demand** | Organic pull, lower risk | Reactive, may miss opportunities | Strong organic international signal |
| **Strategic Market Entry** | Planned, resourced properly | Slow, high investment | Clear strategic markets, resources available |

**Framework:**
```
International Expansion Checklist:

Prerequisites:
□ Dominant position in home market? (or clear ceiling)
□ Product-market fit proven?
□ Unit economics work?
□ Organic international demand exists?

Market Selection Criteria:
1. Market size and growth
2. Competition landscape
3. Localization complexity (language, payments, legal)
4. Cultural product fit
5. Existing organic traction

Entry Approach:
Low localization (digital, English): Launch and see
Medium localization: Local marketing, support
High localization: Local team, product changes

Common mistake: Expanding to escape home market problems.
International amplifies success, doesn't create it.
```

**Default Recommendation:** Follow organic demand. If you're seeing signups/usage from a region, lean in. Proactive expansion without demand signal is expensive.

---

## Decision 10: Growth Metric North Star

**Context:** When choosing the metric that drives growth focus.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Weekly Active Users** | Clear, engagement-focused | May miss monetization | Consumer, engagement-driven |
| **Monthly Recurring Revenue** | Revenue-focused, clear value | May optimize for extraction | B2B SaaS, subscription business |
| **Activated Users** | Quality over quantity | May under-invest in acquisition | Activation is bottleneck, new product |
| **Retained Cohort %** | Health-focused, sustainable | Harder to communicate, slower | Retention is broken, needs fixing |

**Framework:**
```
North Star Selection:

The North Star must:
1. Reflect customer value (not vanity)
2. Correlate with business success
3. Be actionable by the team
4. Be measurable in real-time

North Star Candidates:

Consumer products:
- Weekly Active Users (WAU)
- Time spent in app
- Core actions taken

B2B SaaS:
- Monthly Recurring Revenue (MRR)
- Net Revenue Retention (NRR)
- Active accounts (by tier)

Marketplaces:
- Gross Merchandise Value (GMV)
- Transactions completed
- Active buyers AND sellers

Test: "If this metric doubled, would the business
      clearly be twice as successful?"

If no, it's not your North Star.
```

**Default Recommendation:** Choose ONE metric, communicate relentlessly. Different teams with different metrics creates chaos. One North Star aligns everyone.

---

## Decision 11: Organic vs Paid Mix

**Context:** When allocating resources between organic and paid growth.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Paid-Heavy (70%+)** | Fast, predictable, controllable | Expensive, no moat, treadmill | Testing PMF, time-sensitive, funded |
| **Organic-Heavy (70%+)** | Sustainable, compounds, defensible | Slow, unpredictable | Long runway, strong content/viral fit |
| **Balanced (50/50)** | Diversified, flexible | Neither optimized | Transitioning, testing both |
| **Shift Over Time** | Strategic evolution | Requires planning, discipline | Building sustainable engine |

**Framework:**
```
Healthy Mix Evolution:

Early Stage (Pre-PMF):
- 80% organic (scrappy, testing)
- 20% paid (small tests only)
Why: Learning, not scaling

Growth Stage (PMF-found):
- 50% paid (proven unit economics)
- 50% organic (building moat)
Why: Scale what works, build sustainability

Scale Stage (Market leader):
- 30% paid (marginal growth)
- 70% organic (compounding moat)
Why: Moat matters more than marginal growth

Warning Signs:
- Paid > 80%: "Growth stops when spending stops"
- No organic working: Vulnerable to CAC inflation
- Only organic: May be leaving growth on table

The goal: Paid buys time while organic compounds.
```

**Default Recommendation:** Build organic first, amplify with paid. Paid should accelerate working organic loops, not replace them. If organic doesn't work, paid won't save you.

---

## Decision 12: Build vs Buy for Growth Tools

**Context:** When deciding how to get growth infrastructure.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Buy (SaaS tools)** | Fast, maintained, battle-tested | Cost, dependency, generic | Speed matters, commodity capability |
| **Build Custom** | Tailored, owned, competitive advantage | Time, maintenance, expertise | Differentiated need, core to strategy |
| **Build on OSS** | Flexible, owned, cheaper | Maintenance, integration work | Technical team, cost-sensitive |

**Framework:**
```
Build vs Buy for Growth Stack:

Almost always buy:
- Email/messaging (Sendgrid, Customer.io)
- Analytics (Amplitude, Mixpanel)
- A/B testing (LaunchDarkly, Optimizely)
- Attribution (Segment, AppsFlyer)
- CRM (HubSpot, Salesforce)

Consider building:
- Referral systems (if core to growth)
- Custom onboarding (if differentiated)
- Engagement mechanics (if competitive advantage)
- Growth algorithms (if unique logic)

Decision criteria:
1. Is this a competitive advantage?
   Yes → Consider building
   No → Buy

2. Does off-the-shelf meet 80% of needs?
   Yes → Buy
   No → Build or heavily customize

3. Do you have engineering capacity?
   No → Buy
   Yes → Evaluate build

Growth team time is the scarcest resource.
Buy commodity, build competitive advantage.
```

**Default Recommendation:** Buy almost everything. Growth engineering time should go to product changes that drive growth, not infrastructure that exists as SaaS.

