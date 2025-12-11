# Marketplace Gotchas

> Common pitfalls and their solutions for marketplace builds

---

## Payment Gotchas

### 1. Stripe Connect Requires Business Verification

**Problem:** Can't enable Stripe Connect in test mode without completing platform setup.

**Solution:**
- Complete platform profile in Stripe Dashboard → Connect → Settings
- Use test mode for development
- Plan 3-5 days for live mode verification

### 2. Transfer Timing with Connect

**Problem:** Transfers fail because seller hasn't completed onboarding.

**Solution:**
```typescript
// Always check before creating payment
const { data: seller } = await supabase
  .from('profiles')
  .select('stripe_connect_id, connect_onboarding_complete')
  .eq('id', sellerId)
  .single();

if (!seller?.connect_onboarding_complete) {
  return { error: 'Seller not ready to accept payments' };
}
```

### 3. Refunds Split Differently

**Problem:** When refunding, platform fee handling is confusing.

**Solution:**
```typescript
// Refund the full amount (Stripe reverses transfer automatically)
await stripe.refunds.create({
  payment_intent: paymentIntentId,
  // Optional: refund_application_fee: true to also refund platform fee
});
```

### 4. Currency Mismatches

**Problem:** Seller in EUR, buyer pays USD, math gets weird.

**Solution:**
- Start with single currency (USD)
- If multi-currency: set listing currency, convert at checkout
- Use Stripe's automatic currency conversion for Connect

---

## Multi-Tenant Gotchas

### 5. RLS Doesn't Cover Views

**Problem:** Created a view but RLS policies don't apply.

**Solution:**
```sql
-- Use security_invoker for views (PostgreSQL 15+)
CREATE VIEW seller_dashboard WITH (security_invoker = true) AS
SELECT * FROM orders WHERE seller_id = auth.uid();

-- Or use a function
CREATE FUNCTION get_seller_orders()
RETURNS SETOF orders
SECURITY DEFINER
AS $$
  SELECT * FROM orders WHERE seller_id = auth.uid();
$$ LANGUAGE sql;
```

### 6. Seller Can See Other Sellers' Data

**Problem:** Forgot RLS on a table, data leaks.

**Solution:**
- Enable RLS on EVERY table: `ALTER TABLE x ENABLE ROW LEVEL SECURITY`
- Default deny: Create explicit policies for access
- Test by signing in as different users

### 7. Admin Access Blocked by RLS

**Problem:** Admin can't moderate content due to RLS.

**Solution:**
```sql
-- Add admin override to policies
CREATE POLICY "Admins can do anything"
  ON listings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Or use service role key for admin operations (carefully!)
```

---

## Search Gotchas

### 8. Full-Text Search Doesn't Match Partial Words

**Problem:** Searching "lap" doesn't find "laptop".

**Solution:**
```sql
-- Use prefix matching
SELECT * FROM listings
WHERE search_vector @@ to_tsquery('english', 'lap:*');

-- Or combine with ILIKE for partial
WHERE title ILIKE '%lap%' OR search_vector @@ to_tsquery('lap:*')
```

### 9. Category Filtering Performance

**Problem:** Search + category filter is slow.

**Solution:**
```sql
-- Add composite index
CREATE INDEX idx_listings_category_search
ON listings (category, status)
WHERE status = 'active';

-- Consider partial index for common queries
CREATE INDEX idx_active_listings
ON listings (created_at DESC)
WHERE status = 'active';
```

---

## Order Management Gotchas

### 10. Race Condition: Same Item Sold Twice

**Problem:** Two buyers purchase the same one-of-a-kind item.

**Solution:**
```sql
-- Use row-level lock when creating order
BEGIN;
SELECT * FROM listings WHERE id = $1 AND status = 'active' FOR UPDATE;
-- If found, create order and update status
UPDATE listings SET status = 'sold' WHERE id = $1;
INSERT INTO orders (...) VALUES (...);
COMMIT;
```

### 11. Order Status Machine Gets Messy

**Problem:** Orders end up in impossible states.

**Solution:**
```typescript
// Define valid transitions
const ORDER_TRANSITIONS = {
  pending: ['paid', 'cancelled'],
  paid: ['confirmed', 'refunded'],
  confirmed: ['shipped', 'refunded'],
  shipped: ['delivered'],
  delivered: ['completed'],
  completed: [], // terminal
  cancelled: [], // terminal
  refunded: [], // terminal
};

async function updateOrderStatus(orderId: string, newStatus: string) {
  const order = await getOrder(orderId);
  if (!ORDER_TRANSITIONS[order.status].includes(newStatus)) {
    throw new Error(`Invalid transition: ${order.status} → ${newStatus}`);
  }
  // ... update
}
```

---

## Trust & Safety Gotchas

### 12. Reviews Can Be Gamed

**Problem:** Seller creates fake accounts to review themselves.

**Solution:**
- Only allow reviews after completed orders
- Add review velocity limits
- Flag accounts with unusual patterns
- Consider verified purchase badges

### 13. Seller Uploads Malicious Content

**Problem:** Seller uploads harmful images or content.

**Solution:**
- Validate file types server-side
- Use image moderation API (AWS Rekognition, Google Vision)
- Add content reporting feature
- Queue new listings for manual review initially

### 14. Buyer Claims Item Never Arrived

**Problem:** Disputes with no tracking.

**Solution:**
- Require tracking numbers for physical goods
- Hold funds until delivery confirmed
- Build in dispute resolution flow
- Consider escrow period before releasing funds

---

## Performance Gotchas

### 15. Listing Images Load Slowly

**Problem:** Product images are slow, especially galleries.

**Solution:**
```typescript
// Use Next.js Image with Supabase
import Image from 'next/image';

// Configure in next.config.js
images: {
  remotePatterns: [
    { hostname: '*.supabase.co' }
  ]
}

// Use responsive sizes
<Image
  src={imageUrl}
  width={400}
  height={300}
  sizes="(max-width: 768px) 100vw, 400px"
/>
```

### 16. Search Page Re-fetches on Every Filter Change

**Problem:** Every checkbox triggers full reload.

**Solution:**
- Debounce filter changes
- Use URL params for filter state (shareable!)
- Prefetch common filter combinations
- Show loading skeleton, not spinner

---

## Quick Reference

| Gotcha | Quick Fix |
|--------|-----------|
| Connect not working | Complete platform setup in Stripe Dashboard |
| Seller can see others' data | Check RLS on all tables |
| Search too slow | Add composite indexes |
| Item sold twice | Use FOR UPDATE lock |
| Reviews fake | Require completed order |
| Images slow | Use Next.js Image optimization |
