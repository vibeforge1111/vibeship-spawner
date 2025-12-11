# Payments Flow Specialist

## Identity

- **Tags**: `payments`, `stripe`, `checkout`, `webhooks`, `subscriptions`, `billing`
- **Domain**: Stripe integration, checkout, webhooks, subscription management
- **Use when**: Payment implementation, subscription features, billing portal, webhooks

---

## Patterns

### Stripe Setup

```typescript
// lib/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

// Price IDs from Stripe Dashboard
export const PLANS = {
  free: {
    name: 'Free',
    priceId: null,
    price: 0,
    features: ['5 projects', 'Basic support'],
  },
  pro: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    price: 29,
    features: ['Unlimited projects', 'Priority support', 'API access'],
  },
  enterprise: {
    name: 'Enterprise',
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID!,
    price: 99,
    features: ['Everything in Pro', 'Custom integrations', 'Dedicated support'],
  },
} as const;

export type PlanId = keyof typeof PLANS;
```

### Database Schema

```sql
-- Subscriptions table
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Index for Stripe lookups
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription ON subscriptions(stripe_subscription_id);
```

### Create Checkout Session

```typescript
// app/api/stripe/checkout/route.ts
import { createClient } from '@/lib/supabase/server';
import { stripe, PLANS } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { priceId } = await request.json();

    // Validate priceId
    const plan = Object.values(PLANS).find(p => p.priceId === priceId);
    if (!plan || !plan.priceId) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 });
    }

    // Get or create Stripe customer
    let { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    let customerId = subscription?.stripe_customer_id;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { userId: user.id },
      });
      customerId = customer.id;

      // Create subscription record
      await supabase.from('subscriptions').insert({
        user_id: user.id,
        stripe_customer_id: customerId,
        plan: 'free',
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      metadata: { userId: user.id },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
```

### Webhook Handler

```typescript
// app/api/stripe/webhook/route.ts
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import type Stripe from 'stripe';

// Use service role for webhook (no user context)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutComplete(event.data.object);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}

async function handleCheckoutComplete(session: Stripe.Checkout.Session) {
  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;

  // Get subscription details
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0].price.id;

  // Determine plan from price
  const plan = priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID
    ? 'enterprise'
    : 'pro';

  await supabase
    .from('subscriptions')
    .update({
      stripe_subscription_id: subscriptionId,
      plan,
      status: 'active',
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    })
    .eq('stripe_customer_id', customerId);
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  const priceId = subscription.items.data[0].price.id;

  const plan = priceId === process.env.STRIPE_ENTERPRISE_PRICE_ID
    ? 'enterprise'
    : priceId === process.env.STRIPE_PRO_PRICE_ID
    ? 'pro'
    : 'free';

  await supabase
    .from('subscriptions')
    .update({
      plan,
      status: subscription.status,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq('stripe_customer_id', customerId);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  await supabase
    .from('subscriptions')
    .update({
      plan: 'free',
      status: 'canceled',
      stripe_subscription_id: null,
    })
    .eq('stripe_customer_id', customerId);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  await supabase
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_customer_id', customerId);

  // TODO: Send email notification
}
```

### Billing Portal

```typescript
// app/api/stripe/portal/route.ts
import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (!subscription?.stripe_customer_id) {
      return NextResponse.json(
        { error: 'No billing account found' },
        { status: 400 }
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Portal error:', error);
    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
```

### Pricing Page

```tsx
// app/(marketing)/pricing/page.tsx
import { PLANS } from '@/lib/stripe';
import { PricingCard } from '@/components/pricing-card';
import { createClient } from '@/lib/supabase/server';

export default async function PricingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let currentPlan = 'free';
  if (user) {
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('plan')
      .eq('user_id', user.id)
      .single();
    currentPlan = subscription?.plan ?? 'free';
  }

  return (
    <div className="py-24">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold">Simple, transparent pricing</h1>
        <p className="text-gray-600 mt-4">Choose the plan that works for you</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
        {Object.entries(PLANS).map(([id, plan]) => (
          <PricingCard
            key={id}
            planId={id}
            plan={plan}
            isCurrentPlan={currentPlan === id}
            isLoggedIn={!!user}
          />
        ))}
      </div>
    </div>
  );
}
```

### Pricing Card Component

```tsx
// components/pricing-card.tsx
'use client';

import { PLANS, type PlanId } from '@/lib/stripe';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Props {
  planId: string;
  plan: (typeof PLANS)[PlanId];
  isCurrentPlan: boolean;
  isLoggedIn: boolean;
}

export function PricingCard({ planId, plan, isCurrentPlan, isLoggedIn }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!isLoggedIn) {
      router.push('/login?redirect=/pricing');
      return;
    }

    if (!plan.priceId) return;

    setLoading(true);
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: plan.priceId }),
      });

      const { url, error } = await response.json();
      if (error) throw new Error(error);
      if (url) window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`
      border rounded-lg p-6
      ${isCurrentPlan ? 'border-blue-500 ring-2 ring-blue-200' : ''}
    `}>
      <h3 className="text-xl font-bold">{plan.name}</h3>
      <div className="mt-4">
        <span className="text-4xl font-bold">${plan.price}</span>
        {plan.price > 0 && <span className="text-gray-500">/month</span>}
      </div>

      <ul className="mt-6 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <CheckIcon className="w-5 h-5 text-green-500" />
            {feature}
          </li>
        ))}
      </ul>

      <button
        onClick={handleUpgrade}
        disabled={loading || isCurrentPlan || !plan.priceId}
        className={`
          mt-8 w-full py-2 px-4 rounded font-medium
          ${isCurrentPlan
            ? 'bg-gray-100 text-gray-500 cursor-default'
            : 'bg-blue-600 text-white hover:bg-blue-700'}
          disabled:opacity-50
        `}
      >
        {loading
          ? 'Loading...'
          : isCurrentPlan
          ? 'Current Plan'
          : plan.price === 0
          ? 'Get Started'
          : 'Upgrade'}
      </button>
    </div>
  );
}
```

### Check Subscription in Server Components

```typescript
// lib/subscription.ts
import { createClient } from '@/lib/supabase/server';

export async function getSubscription() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return subscription;
}

export async function requirePlan(requiredPlan: 'pro' | 'enterprise') {
  const subscription = await getSubscription();

  const planHierarchy = { free: 0, pro: 1, enterprise: 2 };
  const currentLevel = planHierarchy[subscription?.plan ?? 'free'];
  const requiredLevel = planHierarchy[requiredPlan];

  if (currentLevel < requiredLevel) {
    throw new Error(`This feature requires ${requiredPlan} plan`);
  }

  return subscription;
}
```

### Billing Page

```tsx
// app/(dashboard)/dashboard/billing/page.tsx
import { getSubscription } from '@/lib/subscription';
import { ManageSubscriptionButton } from '@/components/manage-subscription-button';
import { PLANS } from '@/lib/stripe';

export default async function BillingPage() {
  const subscription = await getSubscription();
  const plan = PLANS[subscription?.plan as keyof typeof PLANS] ?? PLANS.free;

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Billing</h1>

      <div className="border rounded-lg p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-lg font-semibold">{plan.name} Plan</h2>
            <p className="text-gray-500">
              {plan.price > 0
                ? `$${plan.price}/month`
                : 'Free forever'}
            </p>
          </div>

          {subscription?.stripe_subscription_id && (
            <ManageSubscriptionButton />
          )}
        </div>

        {subscription?.current_period_end && (
          <p className="mt-4 text-sm text-gray-500">
            {subscription.cancel_at_period_end
              ? `Cancels on ${new Date(subscription.current_period_end).toLocaleDateString()}`
              : `Renews on ${new Date(subscription.current_period_end).toLocaleDateString()}`}
          </p>
        )}

        <div className="mt-6">
          <h3 className="font-medium mb-2">Plan Features</h3>
          <ul className="space-y-1 text-gray-600">
            {plan.features.map((feature) => (
              <li key={feature}>• {feature}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
```

---

## Anti-patterns

### Trusting Client for Plan Status

```typescript
// BAD - Client can lie about plan
'use client';
const isPro = localStorage.getItem('plan') === 'pro';

// GOOD - Always check server-side
const subscription = await getSubscription();
const isPro = subscription?.plan === 'pro';
```

### Not Validating Webhook Signatures

```typescript
// BAD - Trusting any request
export async function POST(request: Request) {
  const event = await request.json();
  // Process event...
}

// GOOD - Verify signature
const event = stripe.webhooks.constructEvent(
  body,
  signature,
  process.env.STRIPE_WEBHOOK_SECRET!
);
```

### Hardcoding Prices

```typescript
// BAD - Prices in code
const session = await stripe.checkout.sessions.create({
  line_items: [{ price_data: { unit_amount: 2900 } }],
});

// GOOD - Use Stripe Dashboard prices
const session = await stripe.checkout.sessions.create({
  line_items: [{ price: process.env.STRIPE_PRO_PRICE_ID }],
});
```

---

## Gotchas

### 1. Webhook Must Return Quickly

Return 200 immediately, process async if needed:
```typescript
export async function POST(request: Request) {
  // Verify signature
  // Queue for processing
  return NextResponse.json({ received: true }); // Return fast!
}
```

### 2. Test Mode vs Live Mode

Different API keys, different data. Use Stripe CLI for local testing:
```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 3. Subscription Status States

Handle all states: `active`, `past_due`, `canceled`, `unpaid`, `trialing`

### 4. Currency Consistency

Pick one currency and stick with it. Stripe amounts are in cents.

---

## Checkpoints

Before marking payments complete:

- [ ] Stripe SDK configured with correct API version
- [ ] Database schema for subscriptions
- [ ] Checkout session creation works
- [ ] Webhook handler validates signatures
- [ ] All webhook events handled
- [ ] Billing portal integration
- [ ] Plan checks in protected features
- [ ] Test mode checkout works end-to-end
- [ ] Webhook tested with Stripe CLI

---

## Squad Dependencies

Often paired with:
- `supabase-backend` for subscription storage
- `nextjs-supabase-auth` for user context
- `api-design` for API routes
- `auth-flow` for gated features

---

*Last updated: 2025-12-11*
