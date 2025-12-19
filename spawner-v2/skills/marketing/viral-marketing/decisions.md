# Viral Marketing Decisions

Decision frameworks for designing and optimizing viral growth mechanics.

---

## 1. Referral Incentive Type

**Context**: Choosing what to offer for successful referrals.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Monetary (cash/credit)** | Transactional product, clear LTV, users respond to money | Attracts reward hunters, can be gamed, expensive |
| **Product value (extended trial, extra features)** | SaaS/subscription, high product love, engaged users | Only works if product is valued, no cash cost |
| **Status/recognition** | Community-driven, gamification fits, power users | Hard to value, limited audience, requires community |
| **Two-sided with product** | Need to motivate both parties, referee benefit matters | Complex to explain, requires clear value proposition |

**Decision criteria**: User motivation, product economics, fraud risk, audience characteristics.

**Red flags**: Cash incentives for products people don't naturally recommend, high rewards that break unit economics, single-sided incentives.

---

## 2. Referral Program Visibility

**Context**: How prominently to feature referral/invite mechanics.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Always visible (nav, dashboard)** | Referral is major growth channel, high engagement expected | Can feel pushy, clutters interface |
| **Contextual (after value moments)** | Product has clear success moments, want quality over quantity | Fewer impressions, need good timing logic |
| **Hidden (settings, account)** | Referral is secondary, don't want to distract | Low discovery, underutilized program |
| **Triggered prompts** | Want to prompt without permanent UI, can detect good moments | Can be annoying if poorly timed, requires instrumentation |

**Decision criteria**: Referral importance to growth, user experience sensitivity, product UX philosophy.

**Red flags**: Aggressive prompts that annoy users, hidden programs with no discovery, permanent UI that nobody uses.

---

## 3. Viral Loop Type

**Context**: Choosing the fundamental viral mechanic for your product.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Inherent (product requires sharing)** | Collaboration, communication, multiplayer core value | Only works for certain products, can feel forced |
| **Word-of-mouth (organic recommendations)** | Exceptional product, strong satisfaction, social proof | Slow, unpredictable, hard to optimize directly |
| **Incentivized referral** | Clear value exchange, measurable, any product type | Can attract wrong users, costs money |
| **Content/embed virality** | Shareable outputs, user-generated content | Requires shareable artifacts, may not drive signups |
| **Network effect flywheel** | Value increases with users, marketplace/social | Chicken-and-egg problem, needs bootstrapping |

**Decision criteria**: Product type, natural sharing behavior, growth stage, resources.

**Red flags**: Forcing inherent virality on solo products, relying only on word-of-mouth for urgent growth, incentives without product love.

---

## 4. Share Channel Strategy

**Context**: Where to focus sharing capabilities.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Social-first (Twitter, LinkedIn, FB)** | B2C, shareable moments, wide audience | Platform dependent, declining organic reach |
| **Direct message (WhatsApp, SMS, email)** | Personal recommendations, high-intent, B2B | Lower volume, requires personal network |
| **Embed/widget** | Users have websites/blogs, product has embeddable component | Requires technical integration, niche audience |
| **Multi-channel (all of above)** | Want to maximize options, different users prefer different channels | Complexity, diluted optimization effort |

**Decision criteria**: User behavior, product type, B2B vs B2C, where your users communicate.

**Red flags**: Social-only for B2B professional products, ignoring direct channels for personal recommendations, too many options creating paralysis.

---

## 5. Reward Timing

**Context**: When the referrer receives their incentive.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Immediate (on signup)** | Low-friction, volume focus, simple tracking | Higher fraud risk, low-quality referrals |
| **On activation** | Want quality referrals, have clear activation metric | Delayed gratification, more complex tracking |
| **On first purchase/conversion** | Transactional product, want to ensure real value | Even longer delay, higher dropout before reward |
| **Recurring (ongoing value share)** | Subscription, want ongoing referral relationship | Complex to explain, accounting complexity |

**Decision criteria**: Fraud risk tolerance, user quality needs, product economics, activation timeline.

**Red flags**: Immediate rewards for easy-to-create accounts, overly delayed rewards that frustrate referrers, no fraud prevention.

---

## 6. Referee Incentive Framing

**Context**: How to position the benefit to the referred person.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Discount ("Save X%")** | Price-sensitive audience, clear value, transactional | Can cheapen brand, attracts deal seekers |
| **Bonus value ("Extra month free")** | Want to increase trial, subscription product | Delays monetization, requires time investment |
| **Exclusive access ("Skip the waitlist")** | Scarcity real, desirable product, status matters | Only works if there's genuine exclusivity |
| **Gift framing ("Your friend gave you...")** | Social relationship matters, want warm intro | Requires genuine relationship, can feel forced |

**Decision criteria**: Brand positioning, user motivation, product stage (scarcity), relationship dynamics.

**Red flags**: Exclusive access when there's no scarcity, discounts that destroy margins, gift framing for impersonal relationships.

---

## 7. Contact Import Approach

**Context**: Whether and how to let users import contacts for inviting.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **No import (manual only)** | Privacy-conscious, quality over quantity, minimal friction | Lower volume, more work for user |
| **Email contact import** | High-intent users, clear value to recipients | Privacy concerns, can feel spammy |
| **Phone contact import** | Mobile-first, SMS invites work well | Very sensitive, high spam potential |
| **Social graph import** | Social product, API available | Platform-dependent, declining availability |

**Decision criteria**: Privacy stance, user trust, platform policies, spam risk tolerance.

**Red flags**: Importing without clear consent, auto-sending without preview, accessing more data than needed.

---

## 8. Fraud Prevention Level

**Context**: How much to invest in preventing referral fraud.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Minimal (trust users)** | Small scale, low rewards, community-based | Vulnerable to abuse, hard to add later |
| **Basic (same-device, same-IP checks)** | Moderate rewards, some scale | Catches obvious fraud, sophisticated attacks pass |
| **Moderate (device fingerprint, behavior analysis)** | Significant rewards, meaningful volume | Implementation cost, some false positives |
| **Aggressive (manual review, delayed payouts)** | High rewards, proven fraud problem | Slows legitimate referrals, creates friction |

**Decision criteria**: Reward size, scale, fraud history, resources for fraud prevention.

**Red flags**: No fraud prevention with cash rewards, aggressive checks for low-value rewards, never revisiting as you scale.

---

## 9. Viral Metric Focus

**Context**: Which metric to optimize for viral growth.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **K-factor (viral coefficient)** | True viral growth is goal, have enough volume | May sacrifice quality for spread |
| **Invite conversion rate** | Improving invite effectiveness, quality focus | Ignores upstream (getting invites sent) |
| **Time to first share** | New user virality, quick loop | May push sharing before value delivered |
| **Net referral revenue** | Business outcome focus, sustainable growth | Complex to measure, lagging indicator |

**Decision criteria**: Growth stage, current bottleneck in viral funnel, data availability.

**Red flags**: Optimizing K-factor with junk users, ignoring business outcomes, measuring what's easy vs what matters.

---

## 10. Scaling Referral Investment

**Context**: How much to invest in referral as a growth channel.

| Option | When to Choose | Trade-offs |
|--------|----------------|------------|
| **Minimal (basic program exists)** | Referral is secondary channel, limited resources | Underinvestment if high potential |
| **Moderate (dedicated optimization)** | Referral shows promise, worth testing investment | May compete with other channels for resources |
| **Major (referral-led growth)** | Referral is or could be primary channel | Risk if referral underperforms, other channels neglected |
| **Experimental (testing potential)** | Unknown if referral can work, want to learn | Investment may not pay off |

**Decision criteria**: Referral channel performance, alternative channel costs, product fit for sharing.

**Red flags**: Major investment without proven economics, minimal investment when referral is outperforming paid, never testing referral potential.
