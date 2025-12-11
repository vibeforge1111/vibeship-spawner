# SaaS Starter Gotchas

> Things that will bite you if you're not careful

---

## Authentication Gotchas

### 1. Session Refresh in Middleware

**Problem:** Sessions expire and users get logged out unexpectedly.

**Solution:** Always call `getUser()` in middleware - it refreshes the session.

```typescript
// middleware.ts
const { data: { user } } = await supabase.auth.getUser();
// This refreshes the session cookie automatically
```

### 2. Email Confirmation Required by Default

**Problem:** Users can't log in immediately after signup.

**Solution:** Either:
- Enable email confirmation (recommended for production)
- Disable in Supabase Dashboard for development

**Gotcha within gotcha:** If you disable confirmation, make sure to re-enable before launch!

### 3. OAuth Redirect URLs

**Problem:** OAuth fails with "redirect_uri_mismatch"

**Solution:** Add ALL callback URLs in Supabase Dashboard:
```
http://localhost:3000/callback
https://your-domain.com/callback
https://your-preview-url.vercel.app/callback
```

### 4. Server vs Client Auth Clients

**Problem:** Weird behavior when mixing clients

**Always use:**
- `createClient()` from `server.ts` in Server Components
- `createClient()` from `client.ts` in Client Components ("use client")
- Never use browser client in Server Components

---

## Stripe Gotchas

### 5. Webhook Secret Per Environment

**Problem:** Webhooks work in dev but fail in production (or vice versa)

**Solution:** Use different webhook endpoints:
- `stripe listen --forward-to localhost:3000/api/webhooks/stripe` (dev)
- Create webhook in Stripe Dashboard for production

Each has a DIFFERENT webhook secret!

### 6. Test Mode vs Live Mode

**Problem:** "No such customer" errors in production

**Solution:** Test mode and live mode are completely separate. When going to production:
- Switch to live API keys
- Re-create webhook endpoints
- Customers from test mode don't exist in live mode

### 7. Checkout Session Metadata

**Problem:** Can't identify which user made a purchase

**Solution:** Always pass user ID in metadata:
```typescript
const session = await stripe.checkout.sessions.create({
  metadata: {
    user_id: userId,  // CRITICAL!
  },
  // ...
});
```

### 8. Idempotent Webhook Handling

**Problem:** Subscription created twice, duplicate charges

**Solution:** Check if already processed:
```typescript
// In webhook handler
const existing = await db.query(
  'SELECT id FROM subscriptions WHERE stripe_subscription_id = $1',
  [subscription.id]
);
if (existing.length > 0) {
  return; // Already processed
}
```

### 9. Webhook Event Order

**Problem:** Events can arrive out of order

**Solution:** Don't assume `checkout.session.completed` arrives before `invoice.payment_succeeded`. Check subscription status from Stripe API if unsure.

---

## Database Gotchas

### 10. RLS Blocks Service Role

**Problem:** Webhook handler can't update subscriptions

**Solution:** Use service role client for webhook handlers:
```typescript
// lib/supabase/admin.ts
import { createClient } from '@supabase/supabase-js';

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!  // Service role bypasses RLS
);
```

### 11. Trigger Function Security

**Problem:** Trigger to create profile fails

**Solution:** Trigger functions need `SECURITY DEFINER`:
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 12. Foreign Key Cascade

**Problem:** Can't delete user, "violates foreign key constraint"

**Solution:** Use `ON DELETE CASCADE`:
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  -- ...
);
```

---

## Next.js Gotchas

### 13. Route Groups Don't Affect URLs

**Problem:** Expecting `/dashboard/settings` but getting `/settings`

**Clarification:** Route groups like `(dashboard)` are for organization only:
```
app/(dashboard)/settings/page.tsx  →  /settings  (not /dashboard/settings!)
```

### 14. Middleware Matcher

**Problem:** Middleware runs on every request, slowing things down

**Solution:** Use matcher to exclude static files:
```typescript
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### 15. Server Actions Need "use server"

**Problem:** Server action works in dev, fails in production

**Solution:** Make sure file has `"use server"` at the top:
```typescript
// actions/billing.ts
"use server";  // THIS IS REQUIRED

export async function createCheckoutSession() {
  // ...
}
```

### 16. Environment Variables in Client

**Problem:** `process.env.STRIPE_SECRET_KEY` is undefined

**Reminder:** Only `NEXT_PUBLIC_*` vars available on client:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` ✓
- `STRIPE_SECRET_KEY` - server only!

---

## Deployment Gotchas

### 17. Vercel Environment Variables

**Problem:** Works locally, fails on Vercel

**Solution:** Add ALL env vars in Vercel Dashboard:
- Settings → Environment Variables
- Make sure to add for Production, Preview, AND Development

### 18. Supabase URL for Preview Deployments

**Problem:** Each Vercel preview needs different Supabase?

**Solution:** Usually you share one Supabase project for all preview deployments. Just make sure your OAuth redirect URLs include preview URLs.

### 19. Stripe Webhook for Preview Deployments

**Problem:** Can't test webhooks on preview deployments

**Solution:** For testing webhooks:
1. Use Stripe CLI locally
2. Or use a service like ngrok to expose local webhook
3. Or accept that preview deployments skip webhook testing

---

## Common Mistakes Checklist

Before launching, verify:

- [ ] Live Stripe keys configured
- [ ] Production webhook endpoint created in Stripe
- [ ] All OAuth redirect URLs added
- [ ] Email confirmation enabled
- [ ] Service role key NOT exposed to client
- [ ] All environment variables set in production
- [ ] Database migrations applied to production
- [ ] RLS policies tested with real users
