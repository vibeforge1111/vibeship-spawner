# SaaS Starter Guided Path

> Pre-solved architecture for subscription-based web applications

---

## What This Path Builds

A production-ready SaaS foundation with:
- User authentication (email/password + OAuth)
- Stripe subscription billing
- User dashboard
- Pricing page with plan comparison
- Settings page with billing management
- Admin overview (optional)

---

## Who This Is For

- Founders building subscription products
- Developers who want to skip auth/billing boilerplate
- Products with tiered pricing (free/pro/enterprise)

---

## Pre-Made Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js 14+ (App Router) | Best balance of SSR/SSG, DX, and ecosystem |
| Auth | Supabase Auth | Free tier, good DX, handles OAuth |
| Database | Supabase PostgreSQL | Matches auth, includes RLS |
| Payments | Stripe | Industry standard, great docs |
| Styling | Tailwind CSS | Rapid iteration, consistent design |
| Hosting | Vercel | Zero-config Next.js deployment |

---

## What You Customize

| Aspect | How to Customize |
|--------|------------------|
| **Data models** | Add your domain-specific tables |
| **Pricing tiers** | Define what each tier unlocks |
| **Dashboard** | Build your core product UI |
| **Branding** | Colors, typography, logo |

---

## Estimated Timeline

| Phase | Duration | Output |
|-------|----------|--------|
| Setup | 1-2 hours | Project scaffold, auth working |
| Billing | 2-3 hours | Stripe integration, pricing page |
| Dashboard | 2-4 hours | Basic dashboard shell |
| Your Features | Varies | Your actual product |

**Note:** These are build times with vibeship-spawner, not development estimates.

---

## Prerequisites

- Supabase account (free tier works)
- Stripe account (test mode for development)
- Vercel account (for deployment)

---

## Files This Path Creates

```
your-project/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── signup/page.tsx
│   │   └── callback/route.ts
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── settings/page.tsx
│   ├── (marketing)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── pricing/page.tsx
│   └── api/
│       └── webhooks/stripe/route.ts
├── components/
│   ├── auth/
│   ├── billing/
│   └── ui/
├── lib/
│   ├── supabase/
│   └── stripe/
└── supabase/
    └── migrations/
```
