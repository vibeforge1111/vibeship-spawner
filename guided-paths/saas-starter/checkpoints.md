# SaaS Starter Checkpoints

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

## Phase 2: Authentication

### Checkpoint 2.1: Database Schema
- [ ] `profiles` table exists with RLS enabled
- [ ] `subscriptions` table exists with RLS enabled
- [ ] Profile creation trigger works (test by creating user in Supabase dashboard)

### Checkpoint 2.2: Middleware
- [ ] Visiting `/dashboard` without auth redirects to `/login`
- [ ] Visiting `/login` while authenticated redirects to `/dashboard`
- [ ] Session refresh works (check Network tab for cookie updates)

### Checkpoint 2.3: Login Flow
- [ ] Login form renders with email/password fields
- [ ] Invalid credentials show error message
- [ ] Valid credentials redirect to dashboard
- [ ] "Forgot password" link visible

### Checkpoint 2.4: Signup Flow
- [ ] Signup form renders correctly
- [ ] Form validates email format
- [ ] Form validates password length (8+ characters)
- [ ] Successful signup shows "check your email" message
- [ ] Profile record created in database

### Checkpoint 2.5: Password Reset
- [ ] Forgot password page renders
- [ ] Submitting email shows success (regardless of existence)
- [ ] Reset link in email works
- [ ] New password saves correctly

### Checkpoint 2.6: OAuth (if configured)
- [ ] OAuth buttons render
- [ ] Clicking button redirects to provider
- [ ] Callback handles successful auth
- [ ] Profile created for OAuth users

---

## Phase 3: Marketing Pages

### Checkpoint 3.1: Layout
- [ ] Header displays on all marketing pages
- [ ] Footer displays on all marketing pages
- [ ] Navigation links work
- [ ] Responsive on mobile

### Checkpoint 3.2: Landing Page
- [ ] Hero section renders
- [ ] Call-to-action buttons work
- [ ] Page loads quickly (< 3s)

### Checkpoint 3.3: Pricing Page
- [ ] All pricing tiers display
- [ ] Features listed for each tier
- [ ] "Get Started" buttons visible
- [ ] Price formatting correct

---

## Phase 4: Billing

### Checkpoint 4.1: Stripe Setup
- [ ] Stripe SDK initializes without errors
- [ ] Products and prices created in Stripe Dashboard
- [ ] Pricing config matches Stripe prices

### Checkpoint 4.2: Checkout Flow
- [ ] Clicking "Upgrade" creates checkout session
- [ ] Redirects to Stripe Checkout
- [ ] Can complete test purchase (use Stripe test cards)
- [ ] Success URL redirects back to app

### Checkpoint 4.3: Webhook Processing
- [ ] Webhook endpoint returns 200
- [ ] `checkout.session.completed` creates/updates subscription
- [ ] `customer.subscription.updated` updates subscription
- [ ] `customer.subscription.deleted` handles cancellation

### Checkpoint 4.4: Billing UI
- [ ] Subscription status displays correctly
- [ ] "Manage Subscription" opens Stripe portal
- [ ] Plan upgrade/downgrade works
- [ ] Cancellation flow works

---

## Phase 5: Dashboard

### Checkpoint 5.1: Layout
- [ ] Sidebar renders with navigation
- [ ] Header shows user info
- [ ] Logout button works
- [ ] Responsive on mobile (sidebar collapses)

### Checkpoint 5.2: Main Dashboard
- [ ] User's name displayed
- [ ] Subscription status shown
- [ ] Quick actions available

### Checkpoint 5.3: Settings
- [ ] Profile form loads with current data
- [ ] Can update name
- [ ] Can update avatar (if implemented)
- [ ] Changes persist after refresh

### Checkpoint 5.4: Billing Page
- [ ] Current plan displayed
- [ ] Next billing date shown
- [ ] Upgrade options visible for free users
- [ ] Cancel option visible for paid users

---

## Phase 6: Integration Testing

### Checkpoint 6.1: Full User Journey
Test the complete flow:
1. [ ] Visit landing page
2. [ ] Click "Get Started"
3. [ ] Sign up with email
4. [ ] Verify email (or skip if disabled)
5. [ ] Log in
6. [ ] View dashboard
7. [ ] Go to settings, update profile
8. [ ] Go to billing, upgrade to Pro
9. [ ] Complete Stripe checkout
10. [ ] Return to app with Pro status
11. [ ] Log out
12. [ ] Log back in, verify Pro still active

### Checkpoint 6.2: Edge Cases
- [ ] Invalid login shows proper error
- [ ] Expired session redirects to login
- [ ] Failed payment shows error message
- [ ] Can log in on mobile browser

### Checkpoint 6.3: Security
- [ ] No API keys in client-side code
- [ ] RLS prevents unauthorized data access
- [ ] Webhook validates Stripe signature
- [ ] CORS configured correctly

---

## Launch Checklist

Before going live:

### Environment
- [ ] Production environment variables set
- [ ] Stripe live mode keys configured
- [ ] Supabase production project configured

### Stripe
- [ ] Live products and prices created
- [ ] Production webhook endpoint configured
- [ ] Webhook secret updated

### Supabase
- [ ] Email templates customized
- [ ] OAuth redirect URLs include production domain
- [ ] RLS policies tested

### Vercel
- [ ] Domain configured
- [ ] Environment variables set for production
- [ ] Analytics enabled (optional)

### Final Verification
- [ ] Complete user journey works in production
- [ ] Emails sent from your domain
- [ ] Can accept real payments
