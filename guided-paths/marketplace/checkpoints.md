# Marketplace Checkpoints

> Verification points throughout the build process

---

## Phase 1: Project Setup

### Checkpoint 1.1: Development Environment
- [ ] `npm run dev` starts without errors
- [ ] App loads at `http://localhost:3000`
- [ ] Tailwind styles apply correctly
- [ ] TypeScript compiles without errors

### Checkpoint 1.2: Supabase Connection
- [ ] Can read from Supabase in a Server Component
- [ ] Environment variables loading correctly
- [ ] No "missing SUPABASE_URL" errors

---

## Phase 2: Authentication & Roles

### Checkpoint 2.1: Database Schema
- [ ] `profiles` table exists with role column
- [ ] RLS enabled on profiles table
- [ ] Trigger creates profile on signup

### Checkpoint 2.2: Auth Flow
- [ ] User can sign up as buyer (default)
- [ ] User can sign in
- [ ] Session persists across refresh
- [ ] Middleware redirects unauthenticated users

### Checkpoint 2.3: Role System
- [ ] "Become a Seller" flow updates role
- [ ] Seller routes check for seller role
- [ ] Admin routes check for admin role
- [ ] Role change reflects immediately

---

## Phase 3: Listings

### Checkpoint 3.1: Listing Database
- [ ] `listings` table created with all fields
- [ ] Full-text search index works
- [ ] RLS allows public read of active listings
- [ ] RLS restricts seller to own listings

### Checkpoint 3.2: Create Listing
- [ ] Form renders with all fields
- [ ] Image upload works
- [ ] Validation prevents invalid data
- [ ] Listing saves with correct seller_id

### Checkpoint 3.3: Listing Display
- [ ] Homepage shows featured listings
- [ ] Category pages filter correctly
- [ ] Detail page shows all info
- [ ] Seller info displays on listing

### Checkpoint 3.4: Search
- [ ] Text search returns relevant results
- [ ] Category filter works
- [ ] Price filter works
- [ ] Sorting works (price, date)
- [ ] Pagination works

---

## Phase 4: Stripe Connect

### Checkpoint 4.1: Platform Setup
- [ ] Stripe Connect enabled in dashboard
- [ ] Platform profile complete
- [ ] Test mode works

### Checkpoint 4.2: Seller Onboarding
- [ ] Onboarding button generates link
- [ ] Redirect after completing Stripe flow
- [ ] Webhook updates `connect_onboarding_complete`
- [ ] Seller dashboard accessible after onboarding

### Checkpoint 4.3: Connect Account Status
- [ ] Can check if seller can accept payments
- [ ] Dashboard shows payout status
- [ ] Handles deauthorized accounts

---

## Phase 5: Cart & Checkout

### Checkpoint 5.1: Cart
- [ ] Can add items to cart
- [ ] Cart persists (database or local storage)
- [ ] Can update quantity
- [ ] Can remove items
- [ ] Cart shows in header

### Checkpoint 5.2: Checkout
- [ ] Checkout page shows cart summary
- [ ] Shipping address collection (if physical)
- [ ] Payment form renders
- [ ] "Pay" button creates PaymentIntent

### Checkpoint 5.3: Payment Flow
- [ ] Test card (4242...) completes payment
- [ ] Webhook receives payment_intent.succeeded
- [ ] Order created in database
- [ ] Transfer scheduled to seller
- [ ] Success page shows order details

---

## Phase 6: Orders

### Checkpoint 6.1: Buyer Orders
- [ ] Order history shows all orders
- [ ] Order detail page with status
- [ ] Can contact seller

### Checkpoint 6.2: Seller Orders
- [ ] New orders appear in dashboard
- [ ] Can mark as shipped (with tracking)
- [ ] Can see buyer shipping address
- [ ] Order status updates correctly

### Checkpoint 6.3: Order Lifecycle
- [ ] pending → paid (on payment)
- [ ] paid → confirmed (seller confirms)
- [ ] confirmed → shipped (seller ships)
- [ ] shipped → delivered
- [ ] delivered → completed

---

## Phase 7: Reviews

### Checkpoint 7.1: Review System
- [ ] Can leave review after order completes
- [ ] Star rating (1-5) works
- [ ] Comment optional
- [ ] One review per order enforced

### Checkpoint 7.2: Display
- [ ] Reviews show on listing page
- [ ] Seller average rating calculated
- [ ] Review count displays
- [ ] Recent reviews on seller profile

---

## Phase 8: Seller Dashboard

### Checkpoint 8.1: Overview
- [ ] Total sales displayed
- [ ] Pending orders count
- [ ] Recent activity feed
- [ ] Rating summary

### Checkpoint 8.2: Listings Management
- [ ] All listings with status
- [ ] Can edit listings
- [ ] Can pause/activate listings
- [ ] Can delete listings

### Checkpoint 8.3: Payouts
- [ ] Balance displayed
- [ ] Payout history from Stripe
- [ ] Pending transfers shown

---

## Phase 9: Integration Testing

### Checkpoint 9.1: Buyer Journey
Test complete flow:
1. [ ] Browse listings
2. [ ] Search and filter
3. [ ] View listing detail
4. [ ] Add to cart
5. [ ] Checkout with test card
6. [ ] View order confirmation
7. [ ] Track order status
8. [ ] Leave review after completion

### Checkpoint 9.2: Seller Journey
Test complete flow:
1. [ ] Sign up
2. [ ] Become seller
3. [ ] Complete Stripe onboarding
4. [ ] Create listing with images
5. [ ] Receive order notification
6. [ ] Fulfill order (mark shipped)
7. [ ] View payout

### Checkpoint 9.3: Edge Cases
- [ ] Out of stock handling
- [ ] Seller not onboarded error
- [ ] Payment failure recovery
- [ ] Refund flow works
- [ ] Dispute handling

---

## Launch Checklist

### Environment
- [ ] Production environment variables set
- [ ] Stripe live mode keys configured
- [ ] Supabase production project configured

### Stripe Connect
- [ ] Platform verification complete
- [ ] Live webhook endpoint configured
- [ ] Payout schedule configured

### Supabase
- [ ] Email templates customized
- [ ] Storage bucket permissions correct
- [ ] RLS policies tested with real users

### Vercel
- [ ] Domain configured
- [ ] Environment variables set
- [ ] Edge functions working

### Trust & Safety
- [ ] Terms of service page
- [ ] Seller agreement
- [ ] Privacy policy
- [ ] Content policy
- [ ] Dispute resolution process documented

### Final Verification
- [ ] Complete buyer journey in production
- [ ] Complete seller journey in production
- [ ] Real payment test (refund immediately)
- [ ] Email notifications working
