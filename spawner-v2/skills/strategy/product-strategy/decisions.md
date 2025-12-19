# Decisions: Product Strategy

These are the critical decision points that determine product success. Use these frameworks when facing strategic crossroads.

---

## Decision 1: Build vs. Buy vs. Partner

**Context:** When you need functionality that isn't your core competency.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Build** | Full control, custom fit, potential moat | Slow, expensive, maintenance burden | Core to differentiation, unavailable elsewhere, unique requirements |
| **Buy** | Fast, proven, someone else maintains | Dependency, cost, less control | Non-core, commodity, speed critical |
| **Partner** | Leverage expertise, shared risk | Alignment issues, dependency, rev share | Strategic synergy, market access, capabilities gap |

**Framework:**
```
Is this core to our differentiation?
├── Yes → Build (invest in competitive advantage)
└── No → Continue

Does a good solution exist?
├── No → Build (no alternative)
└── Yes → Continue

Is speed critical?
├── Yes → Buy (time > money)
└── No → Build if strategic, Buy if commodity
```

**Default Recommendation:** Buy unless it's core to your value proposition. Build creates maintenance burden; only take it on for real differentiation.

---

## Decision 2: Horizontal vs. Vertical Product Strategy

**Context:** When deciding how to expand or focus your product.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Horizontal** | Larger TAM, more use cases | Shallow expertise, more competitors | Strong platform/infrastructure, network effects |
| **Vertical** | Deep expertise, defensible position | Smaller TAM, ceiling risk | Domain expertise, complex workflows, switching costs |

**Framework:**
```
Vertical Signals:
- Industry has unique workflows
- Compliance/regulation matters
- Trust and expertise valued
- Buyers want "built for us"

Horizontal Signals:
- Problem is universal
- Workflows are similar across industries
- Integration matters more than depth
- Network effects possible
```

**Default Recommendation:** Start vertical, expand horizontal. It's easier to add industries than to deepen expertise. Vertical builds credibility that horizontal can leverage.

---

## Decision 3: Free vs. Freemium vs. Paid

**Context:** When determining pricing strategy for new products.

**Options:**

| Model | Pros | Cons | Choose When |
|-------|------|------|-------------|
| **Free (ad-supported)** | Maximum reach, low friction | Need huge scale, ad dependency | Consumer, content, virality critical |
| **Freemium** | Reach + revenue, self-serve upgrade | Conversion optimization, support costs | Product sells itself, clear value ladder |
| **Free Trial** | Qualified leads, urgency | Short evaluation window, support burden | Complex products, sales-assisted |
| **Paid Only** | Qualified customers, cleaner economics | Slower growth, higher CAC | High-value B2B, premium positioning |

**Framework:**
```
Can users experience core value without human assistance?
├── No → Free Trial + Sales
└── Yes → Continue

Is there a natural upgrade trigger?
├── Yes → Freemium (upgrade when they hit limit)
└── No → Continue

Do you need maximum reach for network effects?
├── Yes → Free tier with premium features
└── No → Paid (with trial period)
```

**Default Recommendation:** Freemium for self-serve products, Free Trial + Sales for complex B2B. Pure free only if you have network effects or ads strategy.

---

## Decision 4: Speed vs. Quality Release

**Context:** When deciding what level of polish before shipping.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Ship Fast (MVP)** | Learn quickly, first mover | Technical debt, brand risk | New market, unvalidated assumptions, reversible |
| **Ship Polish** | Better first impression, less rework | Slower learning, might build wrong thing | Known market, brand matters, irreversible |

**Framework:**
```
How confident are you in the solution?
├── Low (<50%) → Ship fast, learn, iterate
└── High (>80%) → Consider polish

Is first impression critical?
├── Yes (enterprise, premium) → Polish more
└── No (early adopters, tech-savvy) → Ship fast

Can you recover from bad v1?
├── Yes → Ship fast
└── No → Polish
```

**Default Recommendation:** When in doubt, ship faster. The learning from real users almost always exceeds the benefit of additional polish. "If you're not embarrassed by v1, you launched too late."

---

## Decision 5: Feature Depth vs. Feature Breadth

**Context:** When allocating engineering resources.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Go Deep** | Best-in-class at core, defensible | Narrow use case, market ceiling | Differentiation through excellence, expert users |
| **Go Broad** | More use cases, larger market | "Jack of all trades", harder to defend | Platform play, SMB market, price competition |

**Framework:**
```
What would make users say "this is the best X I've ever used"?
- If it's ONE thing done brilliantly → Go deep
- If it's everything working together → Go broad

Who's your customer?
- Expert users → Go deep (they notice quality)
- Generalist users → Go broad (they want convenience)

What's your moat?
- Technology/expertise → Go deep
- Distribution/ecosystem → Go broad
```

**Default Recommendation:** Go deep first, then broaden. It's easier to expand a product people love than to fix a product people tolerate.

---

## Decision 6: Own vs. Integrate

**Context:** When adjacent functionality is needed.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Own** | Full control, seamless UX, margin | Build + maintain cost, slower | Core to experience, competitive advantage |
| **Integrate** | Faster, leverage existing, ecosystem | Dependency, rev share, UX gaps | Non-core, strong partners exist, speed critical |

**Framework:**
```
Does owning this make our core product significantly better?
├── Yes → Lean toward own
└── No → Lean toward integrate

Would users prefer a specialist solution?
├── Yes → Integrate (don't fight user preference)
└── No → Own (capture value)

Can we do this better than partners?
├── No → Integrate
└── Yes → Consider own (if strategic)
```

**Default Recommendation:** Integrate by default. Own only when it's strategic to the core product experience. "Not Invented Here" syndrome kills companies.

---

## Decision 7: Self-Serve vs. Sales-Assisted

**Context:** When determining go-to-market model.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Self-Serve** | Scalable, lower CAC, faster feedback | Limited ASP, support burden | Simple product, SMB market, viral potential |
| **Sales-Assisted** | Higher ASP, handle complexity, enterprise | Expensive, slower, requires sales org | Complex product, enterprise market, high ACV |
| **Hybrid** | Best of both, segment coverage | Operational complexity, channel conflict | Wide market range, multiple segments |

**Framework:**
```
Can a user get value without talking to a human?
├── Yes → Self-serve viable
└── No → Sales-assisted required

Target ACV:
- <$1K/year → Self-serve only
- $1K-$25K/year → Self-serve + inside sales
- >$25K/year → Sales-assisted
- >$100K/year → Enterprise sales

Buyer complexity:
- Single buyer → Self-serve
- Multiple stakeholders → Sales-assisted
```

**Default Recommendation:** Start self-serve, add sales when you see larger deals getting stuck. It's easier to add sales than to make a sales-dependent product self-serve.

---

## Decision 8: Platform vs. Product

**Context:** When you see potential for others to build on your work.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Product** | Focused, faster iteration, simpler | Limited scale, do everything yourself | Early stage, unproven market, execution speed |
| **Platform** | Ecosystem leverage, network effects | Complexity, chicken-egg problem, loss of control | Proven product, ecosystem demand, can't do everything yourself |

**Framework:**
```
Do you have a successful product already?
├── No → Build product first
└── Yes → Continue

Are others building workarounds/integrations?
├── No → Stay product
└── Yes → Consider platform

Can you attract quality developers/partners?
├── No → Stay product
└── Yes → Platform viable
```

**Default Recommendation:** Product first, platform later. Extract the platform from a working product, don't build it speculatively. Every successful platform started as a successful product.

---

## Decision 9: Single Product vs. Multi-Product

**Context:** When considering expanding product portfolio.

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| **Single Product** | Focus, simpler org, clear brand | Growth ceiling, single point of failure | Pre-PMF, limited resources, core product not mature |
| **Multi-Product** | Multiple growth vectors, cross-sell, resilience | Complexity, resource split, org challenges | Strong core product, natural adjacencies, excess resources |

**Framework:**
```
Is your core product at full potential?
├── No → Focus on core
└── Yes → Continue

Do you have clear product-market fit?
├── No → Focus on core
└── Yes → Continue

Is there natural adjacency?
├── Yes → Second product viable
└── No → Stay single product

Can you resource it without hurting core?
├── No → Stay single product
└── Yes → Consider second product
```

**Default Recommendation:** Single product until it's clearly working. Most second products are distractions from fixing the first. Be honest about whether core is truly mature.

---

## Decision 10: Pricing: Value-Based vs. Cost-Plus vs. Competitive

**Context:** When setting prices for products.

**Options:**

| Approach | Pros | Cons | Choose When |
|----------|------|------|-------------|
| **Value-Based** | Capture more value, premium positioning | Requires quantifying value, harder to explain | Clear ROI, differentiated product, sophisticated buyers |
| **Cost-Plus** | Simple, defensible margin | Leaves money on table, commoditizes | Commodity product, price-sensitive market |
| **Competitive** | Easy to justify, market-validated | Race to bottom, no differentiation | Crowded market, similar products, must win on price |

**Framework:**
```
Can you quantify the value you create?
├── Yes → Value-based pricing
└── No → Continue

Is your product differentiated?
├── No → Competitive pricing
└── Yes → Value-based or premium positioning

How sophisticated are buyers?
├── Enterprise/sophisticated → Value-based
└── SMB/consumers → Simple tiers
```

**Default Recommendation:** Value-based pricing whenever possible. It forces you to articulate and deliver clear value. Cost-plus and competitive pricing are races to the bottom.
