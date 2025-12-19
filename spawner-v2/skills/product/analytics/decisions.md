# Analytics Decisions

Decision frameworks for building analytics that drive action and product improvement.

---

## 1. Analytics Tool Selection

**Context**: Choosing the right analytics platform for your product stage, team capabilities, and data needs.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Amplitude/Mixpanel** | Product-led growth, need behavioral analytics, cohorts, funnels | Expensive at scale, learning curve, vendor lock-in |
| **PostHog** | Want self-hosting option, feature flags + analytics together, cost-conscious | Newer, smaller community, some features less mature |
| **Google Analytics** | Marketing-focused, need web traffic analysis, limited budget | Privacy concerns, less product analytics depth, sampling |
| **Custom (Snowflake + dbt)** | Complex needs, data science team, want full ownership | High initial investment, requires dedicated team |

**Decision criteria**: Team size, budget, product type (B2B vs B2C), data ownership requirements, existing data infrastructure.

**Red flags**: Choosing enterprise tools for MVP, custom solutions without data engineering, free tools for data-sensitive products.

---

## 2. Event Tracking Scope

**Context**: Determining what to track—more isn't always better.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Track everything possible** | Very early stage, exploring product-market fit, uncertain what matters | Storage costs, noise, privacy risk, implementation burden |
| **Track to questions** | Have specific hypotheses, clear metrics, resource constraints | Might miss unexpected insights, need to add tracking later |
| **Track core journey only** | Proven product, focused optimization, limited engineering | Miss edge cases, harder to diagnose unexpected issues |
| **Progressive tracking** | Growing product, adding tracking as questions emerge | Lose historical data, reactive rather than proactive |

**Decision criteria**: Product maturity, team resources, data infrastructure costs, regulatory environment.

**Red flags**: Tracking everything without a plan to use it, tracking nothing and making decisions blind, complex tracking before product-market fit.

---

## 3. Metrics Ownership Model

**Context**: Who defines, maintains, and acts on metrics.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Centralized analytics team** | Large org, complex data, need consistency | Bottleneck risk, disconnected from product teams |
| **Embedded analysts per team** | Product-led org, teams move fast, need deep context | Inconsistent definitions, duplicated effort |
| **Self-serve with governance** | Strong data literacy, good tooling, clear standards | Requires investment in tooling and training |
| **Product managers own metrics** | Small team, limited analytics resources | Inconsistent rigor, PMs may lack analytics skills |

**Decision criteria**: Organization size, data literacy, tool sophistication, need for consistency vs speed.

**Red flags**: No clear ownership, analytics as afterthought, everyone defines their own metrics without coordination.

---

## 4. Dashboard Design Philosophy

**Context**: How to structure dashboards for maximum impact.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **One dashboard to rule them all** | Very small team, simple product, everyone needs same view | Gets overwhelming quickly, no role-specific views |
| **Layered (summary → detail)** | Need both executive overview and detailed analysis | Maintenance burden, risk of divergence between layers |
| **Role-based dashboards** | Different stakeholders, different decisions, different frequencies | Duplication, harder to maintain consistency |
| **Question-based dashboards** | Analytics-mature org, clear decision frameworks | Requires clear ownership, more upfront design |

**Decision criteria**: Number of stakeholders, decision frequency, organizational structure, tool capabilities.

**Red flags**: Dashboards nobody uses, dashboards everyone customizes differently, dashboards that only show good news.

---

## 5. Data Freshness Requirements

**Context**: How often data needs to be updated.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Real-time streaming** | Operational decisions, incident response, live products | Expensive, complex, often overkill for analytics |
| **Near real-time (minutes)** | Same-day decisions, A/B test monitoring, growth teams | Infrastructure complexity, higher costs |
| **Daily batch** | Strategic decisions, weekly reviews, reporting | Misses intraday patterns, slower feedback |
| **Weekly/monthly batch** | Executive reporting, board decks, stable metrics | Delayed insights, inappropriate for operational use |

**Decision criteria**: Decision frequency, operational vs strategic use, cost tolerance, engineering resources.

**Red flags**: Real-time data for weekly decisions, daily batch for incident response, mismatched freshness and decision cadence.

---

## 6. Privacy and Consent Approach

**Context**: Balancing analytics needs with user privacy and regulations.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Privacy-first (anonymized)** | Strong privacy stance, EU users, limited need for user-level data | Can't do cohort analysis, limited personalization |
| **Consent-based full tracking** | User-level analysis needed, willing to implement consent | Lower opt-in rates, implementation complexity |
| **Essential-only tracking** | Minimal viable analytics, maximum privacy | Limited insights, may miss important patterns |
| **Aggregated with sampling** | High volume, cost-conscious, accept directional accuracy | Lose individual user journeys, statistical noise |

**Decision criteria**: User base geography, product type, regulatory requirements, analytics maturity.

**Red flags**: Ignoring GDPR/CCPA, dark patterns for consent, tracking PII without need, no data retention policy.

---

## 7. Attribution Model Selection

**Context**: How to credit marketing channels for conversions.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Last-touch** | Simple funnel, short sales cycle, limited resources | Ignores awareness, favors bottom-of-funnel |
| **First-touch** | Brand awareness focus, long sales cycle, top-of-funnel investment | Ignores closing channels, hard to optimize |
| **Linear multi-touch** | Multiple significant touchpoints, want fairness | Arbitrary equal weighting, doesn't reflect reality |
| **Data-driven/algorithmic** | High volume, sophisticated team, willing to invest | Complex to implement, black box, requires volume |
| **Incrementality testing** | Want true causal impact, willing to run experiments | Complex to run, requires holdouts, slower |

**Decision criteria**: Sales cycle length, channel diversity, volume, team sophistication, tolerance for complexity.

**Red flags**: Obsessing over perfect attribution, complex models without volume to support, never validating with incrementality.

---

## 8. Metric Definition Precision

**Context**: How precisely to define metrics—especially for cross-team use.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Strict SQL definitions** | Data warehouse, need reproducibility, analytics-mature | Rigid, harder to adjust, requires SQL knowledge |
| **Semantic layer (dbt metrics)** | Want consistency + accessibility, moderate complexity | Setup investment, another tool to maintain |
| **Tool-native definitions** | Simple needs, single analytics tool, small team | Vendor lock-in, harder to migrate |
| **Documentation + guidelines** | Flexible needs, trust teams to interpret | Inconsistency, metrics drift, comparison problems |

**Decision criteria**: Team size, tool diversity, need for consistency, data maturity.

**Red flags**: Same metric defined differently in multiple places, no source of truth, can't reproduce key metrics.

---

## 9. Experiment Analysis Responsibility

**Context**: Who analyzes A/B tests and experiments.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Automated in tool** | High experiment velocity, simple metrics, trust tooling | Miss nuance, false confidence in p-values |
| **Dedicated data scientist** | Complex experiments, causal inference needed, high stakes | Bottleneck, expensive, may be overkill |
| **Product manager analysis** | PM is analytically skilled, simple experiments, fast iteration | Confirmation bias risk, may miss issues |
| **Experiment review board** | High-stakes decisions, need rigor, cross-functional alignment | Slow, overhead, may discourage experimentation |

**Decision criteria**: Experiment complexity, stakes, PM analytical sophistication, velocity needs.

**Red flags**: Shipping without analysis, cherry-picking results, ignoring negative experiments, no standards.

---

## 10. Analytics Documentation Standard

**Context**: How to document tracking, metrics, and analyses.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Tracking plan in spreadsheet** | Early stage, simple product, small team | Gets stale, version control issues, not integrated |
| **Data catalog tool** | Large data estate, multiple teams, compliance needs | Cost, adoption challenges, maintenance burden |
| **In-code documentation** | Engineering-driven, want documentation to travel with code | Hard for non-engineers, may get outdated |
| **Wiki/Notion with standards** | Collaborative team, moderate complexity, flexible needs | Discoverability issues, staleness risk |
| **Schema-as-code (tracked plans)** | Sophisticated team, want validation, CI/CD integration | High investment, engineering dependency |

**Decision criteria**: Team size, data complexity, engineering culture, compliance requirements.

**Red flags**: No documentation, documentation nobody reads, multiple conflicting sources, documentation without ownership.
