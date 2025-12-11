# SaaS Starter Architecture

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              NEXT.JS APP                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                         ROUTE GROUPS                             │   │
│  │  (marketing)         (auth)              (dashboard)             │   │
│  │  - Landing page      - Login             - User dashboard        │   │
│  │  - Pricing           - Signup            - Settings              │   │
│  │  - About             - Callback          - Billing               │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                    │
│                                    │ Server Components                  │
│                                    │ Server Actions                     │
│                                    │                                    │
└────────────────────────────────────┼────────────────────────────────────┘
                                     │
         ┌───────────────────────────┼───────────────────────────┐
         │                           │                           │
         ▼                           ▼                           ▼
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│    SUPABASE     │      │     STRIPE      │      │     VERCEL      │
│  - Auth         │      │  - Checkout     │      │  - Hosting      │
│  - Database     │      │  - Subscriptions│      │  - Edge         │
│  - RLS          │      │  - Webhooks     │      │  - Analytics    │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

---

## Tech Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js (App Router) | 14.x |
| Runtime | Node.js | 18.x+ |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.x |
| Auth | Supabase Auth | Latest |
| Database | PostgreSQL (via Supabase) | 15.x |
| Payments | Stripe | Latest |
| Hosting | Vercel | N/A |

---

## File Structure

```
saas-project/
├── app/
│   ├── (marketing)/           # Public pages
│   │   ├── layout.tsx         # Marketing layout (header, footer)
│   │   ├── page.tsx           # Landing page
│   │   ├── pricing/
│   │   │   └── page.tsx       # Pricing with plan comparison
│   │   └── about/
│   │       └── page.tsx
│   │
│   ├── (auth)/                # Auth pages
│   │   ├── login/
│   │   │   └── page.tsx       # Email/password + OAuth
│   │   ├── signup/
│   │   │   └── page.tsx       # Registration
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   └── callback/
│   │       └── route.ts       # OAuth callback
│   │
│   ├── (dashboard)/           # Protected pages
│   │   ├── layout.tsx         # Dashboard layout (sidebar, nav)
│   │   ├── page.tsx           # Main dashboard
│   │   ├── settings/
│   │   │   └── page.tsx       # User settings
│   │   └── billing/
│   │       └── page.tsx       # Subscription management
│   │
│   ├── api/
│   │   └── webhooks/
│   │       └── stripe/
│   │           └── route.ts   # Stripe webhook handler
│   │
│   ├── layout.tsx             # Root layout
│   ├── globals.css
│   └── not-found.tsx
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   └── OAuthButtons.tsx
│   ├── billing/
│   │   ├── PricingCard.tsx
│   │   ├── SubscriptionStatus.tsx
│   │   └── ManageSubscription.tsx
│   ├── dashboard/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── UserMenu.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       └── ...
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts          # Browser client
│   │   ├── server.ts          # Server client
│   │   └── admin.ts           # Service role client
│   ├── stripe/
│   │   ├── client.ts          # Stripe client
│   │   ├── pricing.ts         # Pricing configuration
│   │   └── webhooks.ts        # Webhook handlers
│   └── utils/
│       └── cn.ts              # Classname utility
│
├── actions/
│   ├── auth.ts                # Server actions for auth
│   └── billing.ts             # Server actions for billing
│
├── middleware.ts              # Auth middleware
│
├── supabase/
│   └── migrations/
│       ├── 00001_profiles.sql
│       └── 00002_subscriptions.sql
│
├── .env.local.example
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.js
```

---

## Data Models

### Users & Profiles

```sql
-- Supabase handles auth.users
-- We extend with profiles

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Users can only read/update their own profile
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE USING (auth.uid() = id);

-- Trigger to create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

### Subscriptions

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT NOT NULL DEFAULT 'free',  -- 'free', 'pro', 'enterprise'
  status TEXT NOT NULL DEFAULT 'active',  -- 'active', 'canceled', 'past_due'
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Users can only view their own subscription
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT USING (auth.uid() = user_id);

-- Index for customer lookup
CREATE INDEX idx_subscriptions_stripe_customer
  ON subscriptions(stripe_customer_id);
```

---

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Key Decisions

### Why Supabase over separate auth + database?

- **Single service:** Auth and database in one
- **RLS built-in:** Security at database level
- **Free tier:** Generous for early stage
- **Good DX:** Dashboard, CLI, client libraries

### Why Stripe Checkout over custom forms?

- **PCI compliance:** Stripe handles it
- **Trust:** Users recognize Stripe UI
- **Less code:** No payment form to build
- **Features:** Promo codes, tax handling, etc.

### Why Route Groups?

- **Separate layouts:** Marketing vs dashboard
- **Clean URLs:** `/pricing` not `/marketing/pricing`
- **Middleware targeting:** Different auth rules per group

---

## API Routes

### Stripe Webhook

```
POST /api/webhooks/stripe
```

Handles:
- `checkout.session.completed` - New subscription
- `customer.subscription.updated` - Plan changes
- `customer.subscription.deleted` - Cancellation
- `invoice.payment_failed` - Failed payment

---

## Authentication Flow

```
1. User clicks "Sign Up"
2. Fills form or clicks OAuth
3. Supabase creates auth.users record
4. Trigger creates profiles record
5. If OAuth, callback route handles token exchange
6. Middleware refreshes session on each request
7. Protected routes check session in layout
```

---

## Billing Flow

```
1. User clicks "Upgrade" on pricing page
2. Server action creates Stripe Checkout session
3. User redirected to Stripe Checkout
4. User enters payment details
5. Stripe processes payment
6. Webhook receives `checkout.session.completed`
7. Webhook handler updates subscriptions table
8. User redirected back to dashboard
```
