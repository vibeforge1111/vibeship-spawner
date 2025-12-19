# Decisions: Product Management

Critical decision points that shape product outcomes and team effectiveness.

---

## Decision 1: Build vs. Buy vs. Partner

**Context:** Deciding how to get a capability—build internally, buy a solution, or partner.

**Options:**

| Approach | Pros | Cons | Choose When |
|----------|------|------|-------------|
| **Build** | Custom fit, full control, IP ownership | Slow, expensive, maintenance burden | Core differentiator |
| **Buy** | Fast, proven, someone else maintains | Generic, ongoing cost, dependency | Commodity capability |
| **Partner** | Speed + some customization, shared risk | Less control, dependency, revenue share | Strategic but not core |

**Framework:**
```
Build vs. buy decision tree:

Is this core to our differentiation?
├── Yes → Build (own your advantage)
└── No → Does it need customization?
    ├── Heavy customization → Build or heavy partner
    └── Light/none → Buy

CRITERIA MATRIX:
                    Build   Buy    Partner
Speed               Low     High   Medium
Cost (upfront)      High    Low    Medium
Cost (ongoing)      Medium  High   Low-Med
Control             Full    Low    Medium
Differentiation     High    None   Some
Maintenance         Yours   Theirs Shared

EXAMPLES:
Core product feature → Build
Payment processing → Buy (Stripe)
Analytics → Buy (Amplitude)
Content → Partner (agencies)
Auth → Buy (unless you're an auth company)

BUILD ONLY WHEN:
1. Core differentiator
2. No good solution exists
3. You'll maintain it long-term
4. You have the expertise

DEFAULT: Buy unless proven otherwise.
```

**Default Recommendation:** Buy for anything that isn't your core product. Build only what differentiates you.

---

## Decision 2: Feature Scope Level

**Context:** Deciding how much to include in a feature release.

**Options:**

| Scope | Description | Pros | Cons |
|-------|-------------|------|------|
| **Minimal** | Smallest useful version | Fast learning, low risk | May not be compelling |
| **Standard** | Expected feature set | Meets expectations | More to build |
| **Comprehensive** | Full solution | Delights users | Slow, expensive |
| **Platform** | Enables ecosystem | Max long-term value | Very slow, complex |

**Framework:**
```
Scope decision by stage:

DISCOVERY (Unvalidated idea):
Scope: Minimal
Why: Learn if it's worth building
Risk: Don't know if it works yet

VALIDATION (Idea validated, solution unclear):
Scope: Minimal to Standard
Why: Learn what works
Risk: Still solving the how

GROWTH (Validated solution, need market fit):
Scope: Standard to Comprehensive
Why: Compete effectively
Risk: Execution, not idea

SCALE (Market fit achieved):
Scope: Comprehensive to Platform
Why: Maximize value
Risk: Maintenance, complexity

SCOPE QUESTIONS:
1. What's our confidence level?
2. What do we still need to learn?
3. What's the cost of being wrong?
4. What's the minimum to test our hypothesis?

SCOPE EXPANSION TRIGGERS:
- Validated demand for more
- Competitive pressure
- Clear ROI case
- Strategic bet (with eyes open)

DEFAULT: Minimal until proven otherwise.
```

**Default Recommendation:** Start minimal. Expand scope only when you've validated demand and approach.

---

## Decision 3: Feature Kill vs. Iterate

**Context:** Deciding whether to keep investing in an underperforming feature.

**Options:**

| Decision | Signs | Action |
|----------|-------|--------|
| **Kill** | Clear failure, wrong direction | Remove completely |
| **Pivot** | Right problem, wrong solution | Major redesign |
| **Iterate** | Close but not there | Improvement cycle |
| **Wait** | Too early to tell | Gather more data |

**Framework:**
```
Kill vs. iterate decision:

USAGE DATA:
How are people using it?
├── Not at all → Kill or Pivot
├── Wrong way → Pivot
├── Partially → Iterate
└── As intended → Iterate or Wait

SUCCESS METRICS:
Did it hit targets?
├── Way below → Kill or Pivot
├── Somewhat below → Iterate
├── Close → Iterate
└── Waiting for data → Wait

EFFORT ESTIMATE:
What would improvement take?
├── Complete rebuild → Kill
├── Major rework → Pivot
├── Medium effort → Iterate
└── Small tweaks → Iterate

KILL CRITERIA (any 2+ true):
- Less than 10% of target users using
- Key metric not moving at all
- Would require complete rebuild
- Team has lost faith
- Problem was wrong

ITERATE CRITERIA:
- Some positive signal
- Clear what to improve
- Reasonable effort
- Team believes in it

THE SUNK COST TRAP:
Don't keep it just because you built it.
"We already invested 3 months" ≠ reason to keep.
Evaluate based on future potential, not past cost.

DECISION RITUAL:
4 weeks post-launch: Kill/Iterate/Continue check
```

**Default Recommendation:** Decide at 4 weeks. Most features need iteration, not killing. But kill decisively when it's clearly wrong.

---

## Decision 4: Speed vs. Quality Trade-off

**Context:** Deciding how to balance moving fast against building well.

**Options:**

| Balance | Speed | Quality | Choose When |
|---------|-------|---------|-------------|
| **Move fast** | Max | Acceptable | Exploring, testing |
| **Balanced** | Good | Good | Normal development |
| **Quality focus** | Acceptable | High | Core features, scale |
| **Tech debt paydown** | Low | Max | Stability needed |

**Framework:**
```
Speed vs. quality by context:

EXPLORATION (0→1 stage):
Speed: Max
Quality: Minimum viable
Why: Learning what works
Debt: Acceptable, expect to throw away

VALIDATION (1→10 stage):
Speed: High
Quality: Good enough
Why: Proving market fit
Debt: Accumulating, track it

GROWTH (10→100 stage):
Speed: Balanced
Quality: High
Why: Scale requires reliability
Debt: Pay down actively

SCALE (100+ stage):
Speed: Acceptable
Quality: Very high
Why: Stability is competitive advantage
Debt: Minimal tolerance

DEBT SIGNALS:
- Increasing bug rate
- Slowing velocity
- Engineer complaints
- Fragility in changes

DEBT PAYDOWN TRIGGERS:
- Velocity dropped 30%+
- Major feature requires refactor
- Reliability becoming issue
- Quarterly debt sprint

CONTEXT MATTERS:
Internal tools: Lower quality OK
Customer-facing: Higher quality needed
Core product: Highest quality
Experimental: Low quality OK

NEVER SKIP:
- Security fundamentals
- Data integrity
- Core user flows
- Error handling
```

**Default Recommendation:** Exploration = speed, Growth = balance, Scale = quality. Know where you are.

---

## Decision 5: Horizontal vs. Vertical Expansion

**Context:** Deciding whether to expand features for current users or expand to new user segments.

**Options:**

| Strategy | Description | Pros | Cons |
|----------|-------------|------|------|
| **Horizontal** | More features, same users | Deepen value, reduce churn | Feature bloat, complexity |
| **Vertical** | Same features, new users | Market expansion, growth | Diluted focus, different needs |
| **Hybrid** | Both strategically | Maximum growth | Resource intensive |

**Framework:**
```
Expansion direction decision:

HORIZONTAL (Same users, more features):
Signal to expand:
- High retention
- Users requesting more
- Upsell opportunity
- Competitor catching up

Choose when:
- Current users are happy
- Clear adjacent needs
- Can deepen moat

VERTICAL (New users, same features):
Signal to expand:
- Current market saturated
- Clear adjacent segment
- Feature set is mature

Choose when:
- Core product is stable
- New segment well understood
- Feature adaptation is minimal

PRIORITIZATION:

Current user needs:
├── Retention risk? → Horizontal first
├── Growth ceiling? → Vertical first
└── Neither? → Horizontal (deepen value)

HYBRID APPROACH:
- Pick one primary direction
- Limit investment in secondary
- Revisit quarterly

ANTI-PATTERNS:
- Expanding vertically before product works
- Horizontal bloat without validation
- Both at once, neither well

SEQUENCE:
1. Nail core product
2. Horizontal to deepen value
3. Vertical when market ceiling hit
```

**Default Recommendation:** Horizontal first (depth before breadth). Vertical only when core market is well-served.

---

## Decision 6: Self-Serve vs. Sales-Assisted

**Context:** Deciding how users should adopt and pay for the product.

**Options:**

| Model | Pros | Cons | Choose When |
|-------|------|------|-------------|
| **Self-serve** | Scale, low cost, fast | Limited deal size, support burden | SMB, simple product |
| **Sales-assisted** | Larger deals, relationship | Expensive, doesn't scale | Enterprise, complex |
| **Hybrid** | Both markets | Complexity, internal conflict | Mature product |

**Framework:**
```
Motion decision matrix:

Product complexity?
├── Simple → Self-serve
├── Medium → Self-serve with support
└── Complex → Sales-assisted

Deal size?
├── <$1K/year → Self-serve only
├── $1K-$20K → Self-serve or low-touch sales
├── $20K-$100K → Sales-assisted
└── >$100K → Enterprise sales

Customer type?
├── Individual → Self-serve
├── SMB → Self-serve + support
├── Mid-market → Sales-assisted
└── Enterprise → Sales-led

SELF-SERVE REQUIREMENTS:
- Product is self-explanatory
- Value is immediate
- Trial can show value
- Price point is low enough

SALES REQUIREMENTS:
- Complex implementation
- Multiple stakeholders
- Customization needed
- High price point

HYBRID MODEL:
Self-serve for SMB → Grows to sales for upgrade
Sales for Enterprise → Self-serve for expansion
Different products/tiers for each motion

TRANSITION INDICATORS:
Self-serve hitting ceiling → Add sales
Sales bottleneck → Invest in self-serve
Both → Hybrid strategy
```

**Default Recommendation:** Start self-serve if possible—it forces product simplicity. Add sales when deal size justifies it.

---

## Decision 7: Platform vs. Product

**Context:** Deciding whether to build a complete product or an open platform.

**Options:**

| Approach | Description | Pros | Cons |
|----------|-------------|------|------|
| **Pure product** | Complete solution | Full control, clear value | Limited extensibility |
| **Platform** | Ecosystem enabled | Leverage, lock-in | Slow, complex |
| **Productized platform** | Product with integrations | Balance | May not excel at either |

**Framework:**
```
Platform decision:

PLATFORM PREREQUISITES:
1. Product already works standalone
2. Clear value prop for builders
3. Enough market for ecosystem
4. Commitment to maintain APIs
5. Developer relations capability

PLATFORM SIGNALS:
- Users asking for integrations
- Building workarounds
- Market expects ecosystem
- Use cases beyond your capacity

PRODUCT-FIRST:
Most startups should stay product-first.
Platform is expensive.
Platform without users is useless.

PLATFORM TIMING:
Too early: No one builds on it
Too late: Missed the opportunity
Right time: Strong product + demand + resources

PLATFORM STRATEGY:
1. Build great product (no platform)
2. Identify integration pain
3. Build integrations (first-party)
4. Open APIs (limited)
5. Platform investment (when validated)

PLATFORM RISK:
- Maintenance burden
- Security surface
- Breaking changes
- Support burden
- Developer relations cost

DEFAULT: Product first. Platform only when demanded.
```

**Default Recommendation:** Build product until users demand extensibility. Platforms are a distraction until then.

---

## Decision 8: Pricing Model

**Context:** Choosing how to charge for the product.

**Options:**

| Model | Pros | Cons | Choose When |
|-------|------|------|-------------|
| **Freemium** | Growth, low friction | Conversion challenge | Viral product, large market |
| **Free trial** | Qualified leads | Time pressure | Complex product |
| **Subscription** | Predictable revenue | Need constant value | Ongoing service |
| **Usage-based** | Aligns with value | Unpredictable revenue | Variable usage |
| **One-time** | Simple | Limited LTV | Solve once problem |

**Framework:**
```
Pricing model selection:

Product type?
├── Continuous value → Subscription
├── Variable usage → Usage-based
├── One-time need → One-time
└── Network effects → Freemium

Customer type?
├── Consumer → Freemium or subscription
├── SMB → Subscription
├── Enterprise → Subscription + usage

FREEMIUM:
When: Large market, viral potential
Free tier: Enough value to create habit
Upgrade trigger: Clear limit that power users hit

FREE TRIAL:
When: Value takes time to realize
Trial length: Long enough to see value
Focus: Activation and conversion

SUBSCRIPTION:
When: Ongoing value delivery
Pricing: Based on value, not cost
Tiers: Clear differentiation

USAGE-BASED:
When: Value scales with usage
Metric: Clear, understood, valuable
Risk: Revenue unpredictability

HYBRID OPTIONS:
Subscription + usage: Base + overage
Freemium + subscription: Free tier + paid tiers
Trial + subscription: Try then buy

PRICING MISTAKES:
- Underpricing (leaves money, signals low value)
- Overcomplicating (confusion reduces conversion)
- Cost-based (should be value-based)
- Static (should evolve with market)
```

**Default Recommendation:** SaaS = subscription with free trial. Adjust based on value delivery pattern.

---

## Decision 9: Segmentation Strategy

**Context:** Deciding how to segment users and prioritize segments.

**Options:**

| Strategy | Description | Pros | Cons |
|----------|-------------|------|------|
| **Single segment** | One target user | Focus, simplicity | Limited market |
| **Sequential** | One at a time | Deep understanding | Slow growth |
| **Multiple** | Several simultaneously | Broader market | Complexity |
| **Mass market** | Everyone | Scale | No differentiation |

**Framework:**
```
Segmentation decision:

SEGMENT CRITERIA:
1. Problem severity (do they need it?)
2. Ability to pay (can they buy?)
3. Accessibility (can we reach them?)
4. Size (is it big enough?)

IDEAL FIRST SEGMENT:
- Intense pain point
- Budget available
- Easy to reach
- References to bigger market

SEGMENT SEQUENCE:
1. Beachhead (first 100 customers)
   - Most desperate
   - Willing to work with MVP
   - Provide feedback

2. Expansion (100 → 1000)
   - Adjacent to beachhead
   - Similar needs
   - Different context

3. Scale (1000+)
   - Broader market
   - Adapted product
   - Refined positioning

SEGMENTATION TRAPS:
- Too broad (can't be specific)
- Too narrow (can't grow)
- Wrong beachhead (can't expand)
- Too many at once (can't focus)

SEGMENT SIGNALS:
Right segment:
- They find you
- They pay full price
- They tell others
- They forgive mistakes

Wrong segment:
- Heavy convincing needed
- Price resistance
- Lots of feature requests
- High churn
```

**Default Recommendation:** Single segment first. Be the best for one group before expanding.

---

## Decision 10: Roadmap Communication Level

**Context:** Deciding how much roadmap to share and with whom.

**Options:**

| Level | Audience | Detail | Commitment |
|-------|----------|--------|------------|
| **Internal only** | Team | Full detail | Working document |
| **Themes** | Customers | Problem areas | Directional |
| **Specific** | Partners | Features + timing | Soft commitment |
| **Public** | Market | Highlights | Reputation |

**Framework:**
```
Roadmap transparency by audience:

INTERNAL (Team):
Share: Everything
Detail: Full
Why: Alignment, ownership

LEADERSHIP:
Share: Priorities, decisions, risks
Detail: High
Why: Support, context

CUSTOMERS:
Share: Problem areas, themes
Detail: Directional
Why: Trust, feedback
Avoid: Specific dates, feature details

PARTNERS:
Share: Integration-relevant items
Detail: Timeline ranges
Why: Planning dependency
Avoid: Internal prioritization debates

PUBLIC:
Share: Vision, major themes
Detail: Minimal
Why: Market positioning
Avoid: Specifics that create obligations

COMMUNICATION PRINCIPLES:
1. Never promise what you can't control
2. Themes are safer than features
3. Directions are safer than dates
4. Acknowledge uncertainty

ROADMAP PRESENTATION:
Now: We're building these things
Next: We're planning these things
Later: We're exploring these areas
(Commitment decreases at each level)

ROADMAP CHANGE:
Changes are normal → Communicate early
Big changes → Explain reasoning
Don't hide changes → Trust breaks
```

**Default Recommendation:** Share themes externally, details internally. Never commit to specific features publicly.

---

## Decision 11: Discovery vs. Delivery Balance

**Context:** Allocating team time between discovering what to build and building it.

**Options:**

| Balance | Discovery | Delivery | Choose When |
|---------|-----------|----------|-------------|
| **Discovery heavy** | 60% | 40% | Early stage, uncertain |
| **Balanced** | 40% | 60% | Normal operation |
| **Delivery heavy** | 20% | 80% | Validated, execution mode |
| **Discovery minimal** | 10% | 90% | Scaling proven product |

**Framework:**
```
Balance by stage:

0→1 (Finding product):
Discovery: 60%+
Delivery: 40%
Why: Most things won't work

1→10 (Finding fit):
Discovery: 40-50%
Delivery: 50-60%
Why: Iterating on what works

10→100 (Scaling):
Discovery: 20-30%
Delivery: 70-80%
Why: Executing what's proven

DISCOVERY ACTIVITIES:
- User interviews
- Data analysis
- Prototyping
- Competitive research
- Experiment design

DELIVERY ACTIVITIES:
- Building features
- Bug fixing
- Tech debt
- Documentation
- Support

PM TIME ALLOCATION:
Discovery: 60% (talk to users, analyze, prioritize)
Delivery: 30% (unblock, review, coordinate)
Strategic: 10% (roadmap, stakeholders)

BALANCE SIGNALS:
Too much discovery:
- Nothing shipping
- Analysis paralysis
- Ideas without execution

Too much delivery:
- Building wrong things
- Surprised by outcomes
- Feature factory mode

CONTINUOUS DISCOVERY:
Discovery isn't a phase.
It runs alongside delivery.
Always learning, always building.
```

**Default Recommendation:** Default to balanced (40/60). Shift discovery-heavy when uncertain, delivery-heavy when scaling.

---

## Decision 12: Feature Flag Strategy

**Context:** Deciding how to use feature flags for rollouts and experiments.

**Options:**

| Strategy | Description | Pros | Cons |
|----------|-------------|------|------|
| **No flags** | Ship to everyone | Simplicity | Risk, no rollback |
| **Release flags** | Gradual rollout | Safety, quick rollback | Code complexity |
| **Experiment flags** | A/B testing | Data-driven | Statistical complexity |
| **Permission flags** | User-specific | Flexibility | Management overhead |

**Framework:**
```
Feature flag decision:

Flag types:

RELEASE FLAGS:
Purpose: Gradual rollout
Lifecycle: Temporary (remove after 100%)
Control: Percentage-based

EXPERIMENT FLAGS:
Purpose: A/B testing
Lifecycle: Until decision made
Control: User cohort-based

PERMISSION FLAGS:
Purpose: Entitlements
Lifecycle: Permanent
Control: User/account-based

OPS FLAGS:
Purpose: Kill switches
Lifecycle: Permanent
Control: Global on/off

WHEN TO FLAG:

Always flag:
- Major features
- Risky changes
- External integrations
- New user flows

Maybe flag:
- Medium features
- Internal tools
- Straightforward changes

Don't flag:
- Bug fixes
- Copy changes
- Minor UI tweaks
- Internal refactors

ROLLOUT STRATEGY:
1. 5% - Canary (catch obvious issues)
2. 25% - Early majority (validate behavior)
3. 50% - Majority (performance at scale)
4. 100% - Full release (complete rollout)

FLAG HYGIENE:
- Remove flags after full rollout
- Document flag purpose
- Review flags quarterly
- Dead flags = tech debt
```

**Default Recommendation:** Use release flags for major features, experiment flags for hypotheses, remove flags post-rollout.
