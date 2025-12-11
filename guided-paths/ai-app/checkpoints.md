# AI App Checkpoints

> Verification points throughout the build process

---

## Phase 1: Project Setup

### Checkpoint 1.1: Development Environment
- [ ] `npm run dev` starts without errors
- [ ] App loads at `http://localhost:3000`
- [ ] Tailwind styles apply correctly
- [ ] TypeScript compiles without errors

### Checkpoint 1.2: Supabase Connection
- [ ] Can read from Supabase in Server Component
- [ ] Environment variables loading correctly
- [ ] Auth works (can sign up/login)

### Checkpoint 1.3: AI Provider Setup
- [ ] OpenAI API key configured
- [ ] (Optional) Anthropic API key configured
- [ ] Can make test completion request

---

## Phase 2: Basic Chat

### Checkpoint 2.1: Chat API
- [ ] POST `/api/chat` returns streaming response
- [ ] Response streams word by word
- [ ] Error returns proper JSON

### Checkpoint 2.2: Chat UI
- [ ] Messages display correctly
- [ ] Input field works
- [ ] Response streams in real-time
- [ ] Stop button works
- [ ] Loading state shows during generation

### Checkpoint 2.3: Model Selection
- [ ] Model dropdown renders
- [ ] Changing model affects response
- [ ] Model persists during conversation

---

## Phase 3: Conversations

### Checkpoint 3.1: Database Schema
- [ ] `conversations` table created
- [ ] `messages` table created
- [ ] RLS enabled and working

### Checkpoint 3.2: Save Conversations
- [ ] New conversation creates on first message
- [ ] Messages save to database
- [ ] Can load previous conversations

### Checkpoint 3.3: Conversation History
- [ ] Sidebar shows conversation list
- [ ] Can click to load old conversation
- [ ] Can create new conversation
- [ ] Can delete conversations

---

## Phase 4: Usage Tracking

### Checkpoint 4.1: Credit System
- [ ] `profiles` table has credits column
- [ ] New users get starting credits (e.g., 100)
- [ ] Credits display in UI

### Checkpoint 4.2: Usage Deduction
- [ ] Each request deducts credits
- [ ] Deduction based on actual tokens used
- [ ] Insufficient credits shows error

### Checkpoint 4.3: Usage Dashboard
- [ ] Shows credit balance
- [ ] Shows usage history
- [ ] Charts/stats for usage patterns

---

## Phase 5: Rate Limiting

### Checkpoint 5.1: Redis Setup
- [ ] Upstash Redis connected
- [ ] Environment variables configured

### Checkpoint 5.2: Rate Limits Work
- [ ] Requests limited per time window
- [ ] Rate limit headers returned
- [ ] 429 response when exceeded
- [ ] Reset time communicated

### Checkpoint 5.3: Plan-Based Limits
- [ ] Free users have lower limits
- [ ] Pro users have higher limits
- [ ] Upgrade path clear

---

## Phase 6: RAG (if needed)

### Checkpoint 6.1: Vector Setup
- [ ] pgvector extension enabled
- [ ] `document_chunks` table created
- [ ] Embedding index created

### Checkpoint 6.2: Document Upload
- [ ] Can upload text/PDF document
- [ ] Document chunks correctly
- [ ] Embeddings generate and store

### Checkpoint 6.3: Retrieval
- [ ] Similar chunks retrieved for query
- [ ] Context injected into prompt
- [ ] Response uses retrieved context

---

## Phase 7: Billing

### Checkpoint 7.1: Stripe Setup
- [ ] Stripe keys configured
- [ ] Test mode works

### Checkpoint 7.2: Credit Purchase
- [ ] Can select credit package
- [ ] Checkout redirects to Stripe
- [ ] Webhook adds credits on success

### Checkpoint 7.3: Subscription (if applicable)
- [ ] Plan tiers defined
- [ ] Subscription checkout works
- [ ] Plan upgrades/downgrades work

---

## Phase 8: API Keys (if needed)

### Checkpoint 8.1: API Key Management
- [ ] Can generate API key
- [ ] Key hashed in database
- [ ] Key shown once on creation

### Checkpoint 8.2: API Key Auth
- [ ] API accepts key in header
- [ ] Invalid key returns 401
- [ ] Rate limits apply to API

---

## Phase 9: Integration Testing

### Checkpoint 9.1: Full User Journey
Test complete flow:
1. [ ] Sign up for account
2. [ ] See starting credits
3. [ ] Send first message
4. [ ] Watch streaming response
5. [ ] Credits decrease
6. [ ] View usage dashboard
7. [ ] Start new conversation
8. [ ] View conversation history
9. [ ] Purchase more credits
10. [ ] Use RAG with uploaded doc

### Checkpoint 9.2: Edge Cases
- [ ] Empty message handled
- [ ] Very long message handled
- [ ] API error shows user-friendly message
- [ ] Rate limit shows countdown
- [ ] Zero credits shows upgrade prompt

### Checkpoint 9.3: Performance
- [ ] First token arrives quickly (<1s)
- [ ] No memory leaks with long conversations
- [ ] Large documents chunk without timeout

---

## Phase 10: Security

### Checkpoint 10.1: Auth Protection
- [ ] Chat API requires authentication
- [ ] Can't access others' conversations
- [ ] API keys scoped to user

### Checkpoint 10.2: Input Validation
- [ ] Max message length enforced
- [ ] Max tokens per request limited
- [ ] System prompt protected

### Checkpoint 10.3: Cost Protection
- [ ] Credits required to chat
- [ ] Rate limits prevent abuse
- [ ] Alerts for unusual usage (optional)

---

## Launch Checklist

### Environment
- [ ] Production environment variables set
- [ ] API keys are production keys
- [ ] Redis production instance
- [ ] Stripe live mode configured

### Monitoring
- [ ] Error logging configured
- [ ] Usage tracking working
- [ ] Cost monitoring in place (LangSmith/Helicone)

### Legal
- [ ] Terms of service page
- [ ] Privacy policy (data retention, AI usage)
- [ ] AI-specific disclaimers

### Performance
- [ ] Edge functions for low latency
- [ ] Response caching where appropriate
- [ ] Database indexes optimized

### Final Verification
- [ ] Complete user journey in production
- [ ] Credit purchase with real card
- [ ] Verify token tracking accuracy
- [ ] Load test with multiple users
