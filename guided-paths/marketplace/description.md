# Marketplace Guided Path

> Pre-solved architecture for two-sided marketplace applications

---

## What This Path Builds

A production-ready marketplace foundation with:
- User authentication with role system (buyer/seller/admin)
- Seller onboarding and verification
- Product/service listings with search and filters
- Shopping cart and checkout flow
- Stripe Connect for marketplace payments
- Seller dashboard with analytics
- Review and rating system
- Order management for buyers and sellers

---

## Who This Is For

- Founders building two-sided marketplaces
- Developers needing multi-vendor e-commerce
- Products connecting service providers with customers
- Platforms requiring payment splitting

---

## Pre-Made Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js 14+ (App Router) | Server components for SEO, fast product pages |
| Auth | Supabase Auth | Supports role-based access |
| Database | Supabase PostgreSQL | Full-text search, RLS for multi-tenant |
| Payments | Stripe Connect | Built for marketplaces, handles splits |
| Search | Supabase full-text + filters | No external service needed |
| Styling | Tailwind CSS | Rapid iteration, consistent design |
| Images | Supabase Storage | Built-in CDN, integrated auth |
| Hosting | Vercel | Zero-config deployment |

---

## What You Customize

| Aspect | How to Customize |
|--------|------------------|
| **Product type** | Services vs physical goods vs digital |
| **Pricing model** | Fixed price, bidding, hourly rates |
| **Categories** | Define your marketplace categories |
| **Verification** | What sellers need to provide |
| **Fee structure** | Your platform's cut |
| **Branding** | Colors, typography, logo |

---

## Estimated Timeline

| Phase | Duration | Output |
|-------|----------|--------|
| Setup | 1-2 hours | Project scaffold, auth with roles |
| Listings | 3-4 hours | Product CRUD, search, filters |
| Payments | 3-4 hours | Stripe Connect, checkout flow |
| Seller Tools | 2-3 hours | Seller dashboard, analytics |
| Reviews | 1-2 hours | Rating system, trust signals |

**Note:** These are build times with vibeship-spawner, not development estimates.

---

## Prerequisites

- Supabase account (free tier works)
- Stripe account with Connect enabled (requires business verification)
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
│   ├── (marketplace)/
│   │   ├── layout.tsx
│   │   ├── page.tsx                  # Homepage with featured
│   │   ├── search/page.tsx           # Search results
│   │   └── [category]/page.tsx       # Category pages
│   ├── listing/
│   │   └── [id]/page.tsx             # Product detail
│   ├── seller/
│   │   ├── dashboard/page.tsx
│   │   ├── listings/page.tsx
│   │   ├── orders/page.tsx
│   │   └── onboarding/page.tsx
│   ├── buyer/
│   │   ├── orders/page.tsx
│   │   └── favorites/page.tsx
│   ├── cart/page.tsx
│   ├── checkout/page.tsx
│   └── api/
│       ├── webhooks/stripe/route.ts
│       └── connect/
│           └── onboard/route.ts
├── components/
│   ├── listings/
│   ├── search/
│   ├── checkout/
│   ├── seller/
│   └── ui/
├── lib/
│   ├── supabase/
│   └── stripe/
└── supabase/
    └── migrations/
        ├── 001_profiles_with_roles.sql
        ├── 002_listings.sql
        ├── 003_orders.sql
        ├── 004_reviews.sql
        └── 005_seller_accounts.sql
```
