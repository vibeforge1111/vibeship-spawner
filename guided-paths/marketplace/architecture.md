# Marketplace Architecture

> Technical decisions and patterns for marketplace apps

---

## Database Schema

### Core Tables

```sql
-- User profiles with roles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  role TEXT NOT NULL DEFAULT 'buyer' CHECK (role IN ('buyer', 'seller', 'admin')),
  name TEXT,
  avatar_url TEXT,
  stripe_customer_id TEXT,
  stripe_connect_id TEXT,        -- For sellers
  connect_onboarding_complete BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Listings (products/services)
CREATE TABLE listings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_id UUID NOT NULL REFERENCES profiles(id),
  title TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  category TEXT NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'sold')),
  images TEXT[], -- Array of storage URLs
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable full-text search
ALTER TABLE listings ADD COLUMN search_vector tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) STORED;

CREATE INDEX listings_search_idx ON listings USING gin(search_vector);

-- Orders
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  buyer_id UUID NOT NULL REFERENCES profiles(id),
  seller_id UUID NOT NULL REFERENCES profiles(id),
  listing_id UUID NOT NULL REFERENCES listings(id),
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending', 'paid', 'confirmed', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded'
  )),
  amount_cents INTEGER NOT NULL,
  platform_fee_cents INTEGER NOT NULL,
  stripe_payment_intent_id TEXT,
  stripe_transfer_id TEXT,
  shipping_address JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id),
  reviewer_id UUID NOT NULL REFERENCES profiles(id),
  seller_id UUID NOT NULL REFERENCES profiles(id),
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(order_id, reviewer_id)
);

-- Cart items (for logged-in users)
CREATE TABLE cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id),
  listing_id UUID NOT NULL REFERENCES listings(id),
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);
```

### RLS Policies

```sql
-- Listings: Anyone can read active, sellers manage own
CREATE POLICY "Anyone can read active listings"
  ON listings FOR SELECT
  USING (status = 'active');

CREATE POLICY "Sellers can read own listings"
  ON listings FOR SELECT
  USING (seller_id = auth.uid());

CREATE POLICY "Sellers can insert own listings"
  ON listings FOR INSERT
  WITH CHECK (
    seller_id = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'seller')
  );

CREATE POLICY "Sellers can update own listings"
  ON listings FOR UPDATE
  USING (seller_id = auth.uid());

-- Orders: Buyers and sellers see their own
CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  USING (buyer_id = auth.uid() OR seller_id = auth.uid());

-- Reviews: Anyone can read, buyers can write for completed orders
CREATE POLICY "Anyone can read reviews"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Buyers can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (
    reviewer_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM orders
      WHERE id = order_id
      AND buyer_id = auth.uid()
      AND status = 'completed'
    )
  );
```

---

## Payment Architecture

### Stripe Connect Flow

```
1. Seller Onboarding
   [Seller] → [Your App] → [Stripe Connect Onboarding]
                                     ↓
   [Stripe Account Created] → [Webhook] → [Update profile]

2. Checkout Flow
   [Buyer adds to cart] → [Checkout page]
                                ↓
   [Create PaymentIntent with transfer]
                                ↓
   [Buyer pays] → [Webhook: payment_intent.succeeded]
                                ↓
   [Create order] → [Transfer to seller (minus platform fee)]

3. Platform Fee Structure
   - Buyer pays: $100
   - Platform fee: 10% ($10)
   - Seller receives: $90 (via Stripe Connect transfer)
```

### Payment Implementation

```typescript
// lib/stripe/checkout.ts
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';

export async function createMarketplacePayment({
  buyerId,
  sellerId,
  listingId,
  amountCents,
  sellerConnectId,
}: {
  buyerId: string;
  sellerId: string;
  listingId: string;
  amountCents: number;
  sellerConnectId: string;
}) {
  const platformFee = Math.round(amountCents * 0.10); // 10% platform fee

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: 'usd',
    payment_method_types: ['card'],
    transfer_data: {
      destination: sellerConnectId,
    },
    application_fee_amount: platformFee,
    metadata: {
      buyerId,
      sellerId,
      listingId,
    },
  });

  return paymentIntent;
}
```

---

## Search Architecture

### Full-Text Search with Filters

```typescript
// lib/search.ts
interface SearchParams {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'rating';
  page?: number;
  pageSize?: number;
}

export async function searchListings(params: SearchParams) {
  const supabase = await createClient();
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const offset = (page - 1) * pageSize;

  let query = supabase
    .from('listings')
    .select('*, seller:profiles!seller_id(name, avatar_url)', { count: 'exact' })
    .eq('status', 'active');

  // Full-text search
  if (params.query) {
    query = query.textSearch('search_vector', params.query, {
      type: 'websearch',
      config: 'english',
    });
  }

  // Filters
  if (params.category) {
    query = query.eq('category', params.category);
  }

  if (params.minPrice) {
    query = query.gte('price_cents', params.minPrice * 100);
  }

  if (params.maxPrice) {
    query = query.lte('price_cents', params.maxPrice * 100);
  }

  // Sorting
  switch (params.sortBy) {
    case 'price_asc':
      query = query.order('price_cents', { ascending: true });
      break;
    case 'price_desc':
      query = query.order('price_cents', { ascending: false });
      break;
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    default:
      query = query.order('created_at', { ascending: false });
  }

  // Pagination
  query = query.range(offset, offset + pageSize - 1);

  return query;
}
```

---

## Route Structure

```
Public Routes:
/                      # Homepage with featured listings
/search                # Search results with filters
/category/[slug]       # Category browse
/listing/[id]          # Listing detail page

Buyer Routes (protected):
/cart                  # Shopping cart
/checkout              # Checkout flow
/buyer/orders          # Order history
/buyer/favorites       # Saved listings

Seller Routes (protected, seller role):
/seller/onboarding     # Stripe Connect setup
/seller/dashboard      # Overview, analytics
/seller/listings       # Manage listings
/seller/listings/new   # Create listing
/seller/orders         # Order management
/seller/payouts        # Payout history

Admin Routes (protected, admin role):
/admin/users           # User management
/admin/listings        # Content moderation
/admin/orders          # All orders
/admin/disputes        # Handle disputes
```

---

## Key Patterns

### Optimistic Cart Updates

```typescript
// Use React Query with optimistic updates for cart
const addToCart = useMutation({
  mutationFn: addCartItem,
  onMutate: async (item) => {
    await queryClient.cancelQueries(['cart']);
    const previous = queryClient.getQueryData(['cart']);
    queryClient.setQueryData(['cart'], (old) => [...old, item]);
    return { previous };
  },
  onError: (err, item, context) => {
    queryClient.setQueryData(['cart'], context.previous);
  },
});
```

### Seller Verification

```typescript
// Middleware for seller routes
export function requireSeller() {
  return async (req: NextRequest) => {
    const user = await getUser();
    if (!user) redirect('/login');

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, connect_onboarding_complete')
      .eq('id', user.id)
      .single();

    if (profile?.role !== 'seller') {
      redirect('/become-seller');
    }

    if (!profile?.connect_onboarding_complete) {
      redirect('/seller/onboarding');
    }

    return user;
  };
}
```

### Rating Aggregation

```sql
-- View for seller ratings
CREATE VIEW seller_ratings AS
SELECT
  seller_id,
  COUNT(*) as review_count,
  ROUND(AVG(rating), 1) as avg_rating
FROM reviews
GROUP BY seller_id;
```

---

## Third-Party Integrations

| Service | Purpose | When to Add |
|---------|---------|-------------|
| Algolia | Advanced search | >10K listings |
| SendGrid | Transactional email | Day 1 |
| Shippo | Shipping labels | Physical goods |
| Twilio | SMS notifications | High-touch marketplace |
| Intercom | Support chat | When scaling support |
