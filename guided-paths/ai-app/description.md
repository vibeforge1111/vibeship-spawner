# AI App Guided Path

> Pre-solved architecture for AI-powered applications

---

## What This Path Builds

A production-ready AI app foundation with:
- User authentication with usage tracking
- Streaming chat interface with multiple models
- Token/credit management system
- Prompt templates and history
- RAG (Retrieval Augmented Generation) setup
- API key management for power users
- Rate limiting and abuse prevention
- Cost tracking and billing integration

---

## Who This Is For

- Founders building AI-powered products
- Developers wrapping LLMs with custom UI
- Products needing embeddings/RAG
- AI features that need usage-based billing

---

## Pre-Made Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Framework | Next.js 14+ (App Router) | Server components + streaming |
| AI SDK | Vercel AI SDK | Best streaming DX, multi-provider |
| Primary LLM | Claude / GPT-4o | Best quality, good pricing |
| Embeddings | OpenAI text-embedding-3-small | Cost-effective, good quality |
| Vector Store | Supabase pgvector | No separate service needed |
| Auth | Supabase Auth | Integrates with usage tracking |
| Database | Supabase PostgreSQL | Vectors + auth + data |
| Rate Limiting | Upstash Redis | Edge-compatible, affordable |
| Styling | Tailwind CSS | Rapid iteration |

---

## What You Customize

| Aspect | How to Customize |
|--------|------------------|
| **LLM Provider** | OpenAI, Anthropic, or both |
| **System Prompts** | Define your AI's personality |
| **Use Cases** | Chat, completion, agents |
| **Knowledge Base** | Your domain-specific content |
| **Pricing** | Token-based, message-based, or subscription |
| **Branding** | Colors, typography, logo |

---

## Estimated Timeline

| Phase | Duration | Output |
|-------|----------|--------|
| Setup | 1-2 hours | Project scaffold, streaming chat |
| Usage System | 2-3 hours | Credits, rate limiting |
| RAG Setup | 2-4 hours | Embeddings, vector search |
| Billing | 2-3 hours | Credit purchase, subscriptions |
| Polish | 2-3 hours | Loading states, error handling |

**Note:** These are build times with vibeship-spawner, not development estimates.

---

## Prerequisites

- OpenAI API key (or Anthropic)
- Supabase account (free tier works)
- Upstash account (for rate limiting)
- Stripe account (for billing)
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
│   ├── (app)/
│   │   ├── layout.tsx
│   │   ├── page.tsx               # Chat interface
│   │   ├── history/page.tsx       # Conversation history
│   │   └── settings/
│   │       ├── page.tsx
│   │       ├── api-keys/page.tsx
│   │       └── usage/page.tsx
│   ├── api/
│   │   ├── chat/route.ts          # Streaming chat endpoint
│   │   ├── complete/route.ts      # Completion endpoint
│   │   ├── embed/route.ts         # Embedding endpoint
│   │   └── webhooks/stripe/route.ts
│   └── (marketing)/
│       ├── page.tsx
│       └── pricing/page.tsx
├── components/
│   ├── chat/
│   │   ├── chat-interface.tsx
│   │   ├── message.tsx
│   │   └── input.tsx
│   ├── rag/
│   │   └── document-upload.tsx
│   └── ui/
├── lib/
│   ├── ai/
│   │   ├── providers.ts
│   │   ├── prompts.ts
│   │   └── embeddings.ts
│   ├── supabase/
│   └── stripe/
└── supabase/
    └── migrations/
        ├── 001_profiles.sql
        ├── 002_conversations.sql
        ├── 003_usage.sql
        ├── 004_documents.sql
        └── 005_api_keys.sql
```
