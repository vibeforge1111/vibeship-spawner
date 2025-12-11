---
name: payments-flow
description: Use when implementing Stripe payments - enforces webhook signature verification, server-side plan validation, and secure checkout flow patterns
tags: [payments, stripe, checkout, webhooks, subscriptions, billing]
---

# Payments Flow Specialist

## Overview

Payment systems handle money. Bugs mean lost revenue, angry customers, or security breaches. Stripe provides the rails, but incorrect implementation causes subscription leaks and billing chaos.

**Core principle:** Never trust client-side plan status. Always verify webhooks. Always check server-side before granting access.

## The Iron Law

```
NO PLAN ACCESS GRANTED WITHOUT SERVER-SIDE DATABASE VERIFICATION
```

Client localStorage, cookies, and frontend state can be manipulated. The only source of truth for subscription status is your database, updated by verified webhooks.

## When to Use

**Always:**
- Setting up Stripe checkout
- Implementing subscription management
- Handling payment webhooks
- Building billing portal
- Gating features by plan

**Don't:**
- Free-only applications
- One-time purchases (simpler patterns exist)
- Non-Stripe payment processors (different patterns)

Thinking "I'll check the plan client-side for speed"? Stop. That's how users get free access to paid features.

## The Process

### Step 1: Set Up Stripe with Proper API Version

Lock API version to prevent breaking changes:

```typescript
// lib/stripe.ts
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});
```

### Step 2: Create Database Schema for Subscriptions

Store subscription state in your database:

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  plan TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
```

### Step 3: Implement Webhook Handler with Signature Verification

Webhooks must verify signatures. No exceptions.

## Patterns

### Checkout Session Creation

<Good>
```typescript
// app/api/stripe/checkout/route.ts
import { createClient } from '@/lib/supabase/server';
import { stripe, PLANS } from '@/lib/stripe';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { priceId } = await request.json();

  // Validate priceId against known prices
  const validPrice = Object.values(PLANS).find(p => p.priceId === priceId);
  if (!validPrice) {
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

    await supabase.from('subscriptions').insert({
      user_id: user.id,
      stripe_customer_id: customerId,
    });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
  });

  return NextResponse.json({ url: session.url });
}
```
Validates user auth. Validates price against known list. Creates customer if needed.
</Good>

<Bad>
```typescript
export async function POST(request: Request) {
  const { priceId, email } = await request.json();

  // No auth check - anyone can create checkout!
  // No price validation - arbitrary prices accepted!

  const session = await stripe.checkout.sessions.create({
    customer_email: email, // User controls email!
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
  });

  return NextResponse.json({ url: session.url });
}
```
No auth. No price validation. User controls email. Security nightmare.
</Bad>

### Webhook Handler with Signature Verification

<Good>
```typescript
// app/api/stripe/webhook/route.ts
import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

// Service role for webhook - no user context
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature')!;

  let event;

  try {
    // CRITICAL: Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

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
  }

  return NextResponse.json({ received: true });
}
```
Signature verified before processing. Service role for database access. All relevant events handled.
</Good>

<Bad>
```typescript
export async function POST(request: Request) {
  // No signature verification!
  const event = await request.json();

  // Anyone can send fake webhook events!
  if (event.type === 'checkout.session.completed') {
    await grantAccess(event.data.object);
  }

  return NextResponse.json({ received: true });
}
```
No signature verification. Attacker can grant themselves paid access.
</Bad>

### Plan Verification for Feature Access

<Good>
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
    throw new Error(`Requires ${requiredPlan} plan`);
  }

  return subscription;
}

// Usage in page
export default async function ProFeaturePage() {
  await requirePlan('pro'); // Throws if not pro
  return <ProFeature />;
}
```
Server-side check. Queries database. Cannot be bypassed.
</Good>

<Bad>
```typescript
"use client";

export function ProFeature() {
  // Client-side check - can be bypassed!
  const plan = localStorage.getItem('plan');

  if (plan !== 'pro') {
    return <UpgradePrompt />;
  }

  return <ActualFeature />; // User can edit localStorage to see this!
}
```
Client-side only. localStorage can be edited. Free users access paid features.
</Bad>

### Billing Portal Access

<Good>
```typescript
// app/api/stripe/portal/route.ts
export async function POST() {
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
    return NextResponse.json({ error: 'No billing account' }, { status: 400 });
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: subscription.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing`,
  });

  return NextResponse.json({ url: session.url });
}
```
Verifies auth. Looks up customer from database. Secure portal access.
</Good>

<Bad>
```typescript
export async function POST(request: Request) {
  const { customerId } = await request.json();

  // User controls customerId - can access any customer's portal!
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: '/billing',
  });

  return NextResponse.json({ url: session.url });
}
```
User-controlled customerId. Can access other users' billing.
</Bad>

## Anti-Patterns

| Anti-Pattern | Why It Fails | What To Do Instead |
|--------------|--------------|-------------------|
| Client-side plan checks | Can be bypassed | Query database server-side |
| No webhook signature verification | Fake events grant access | Always verify signatures |
| Hardcoding prices in code | Can't update without deploy | Use Stripe Dashboard prices |
| Trusting checkout success URL | URL can be visited directly | Only trust webhooks |
| Storing plan in localStorage | User can edit | Store in database only |

## Red Flags - STOP

If you catch yourself:
- Checking plan status from localStorage or cookies
- Processing webhooks without signature verification
- Granting access based on checkout success URL visit
- Accepting arbitrary priceIds without validation
- Using user-provided customerId for portal access

**ALL of these mean: STOP. You have payment security vulnerabilities. Fix immediately.**

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Webhook signature check is overkill" | It's required. Attackers send fake webhooks. |
| "Client-side check is just for UI" | Users will find and exploit it. |
| "I'll add server check later" | You'll forget. Someone will get free access. |
| "Nobody knows our webhook URL" | Security through obscurity fails. Always. |
| "We can fix it if someone exploits it" | You won't know until you've lost money. |
| "It's a small app, who cares" | Bots scan for Stripe endpoints automatically. |

## Gotchas

### Webhook Must Return 200 Quickly

Stripe times out webhooks. Return immediately, process async if needed:

```typescript
export async function POST(request: Request) {
  // Verify signature
  // Return immediately
  return NextResponse.json({ received: true });
  // Heavy processing should be queued
}
```

### Test Mode vs Live Mode

Different API keys, different data. Never mix them:
- Use Stripe CLI for local webhook testing
- `stripe listen --forward-to localhost:3000/api/stripe/webhook`

### Handle All Subscription States

Subscriptions can be: `active`, `past_due`, `canceled`, `unpaid`, `trialing`:

```typescript
const hasAccess = ['active', 'trialing'].includes(subscription.status);
```

### Price IDs Change Between Environments

Use environment variables for price IDs:

```typescript
const PLANS = {
  pro: { priceId: process.env.STRIPE_PRO_PRICE_ID! },
};
```

## Verification Checklist

Before marking payments complete:

- [ ] Stripe SDK configured with locked API version
- [ ] Database schema for subscriptions with RLS
- [ ] Webhook signature verification implemented
- [ ] All webhook events handled (created, updated, deleted, failed)
- [ ] Plan checks are server-side only
- [ ] Price validation against known list
- [ ] Billing portal with proper customer lookup
- [ ] Test mode checkout works end-to-end
- [ ] Webhook tested with Stripe CLI locally
- [ ] No client-side plan status checks

Can't check all boxes? You have payment vulnerabilities. Fix them.

## Integration

**Pairs well with:**
- `supabase-backend` - Subscription storage
- `nextjs-supabase-auth` - User context
- `api-design` - API routes
- `auth-flow` - Gated features

**Requires:**
- Stripe account with products/prices
- Webhook endpoint configured
- Database for subscription state

## References

- [Stripe Webhooks Documentation](https://stripe.com/docs/webhooks)
- [Stripe Checkout](https://stripe.com/docs/payments/checkout)
- [Stripe Billing Portal](https://stripe.com/docs/customer-management)

---

*This specialist follows the world-class skill pattern.*
