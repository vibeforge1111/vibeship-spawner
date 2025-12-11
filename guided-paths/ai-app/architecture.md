# AI App Architecture

> Technical decisions and patterns for AI applications

---

## Database Schema

### Core Tables

```sql
-- User profiles with AI settings
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  name TEXT,
  avatar_url TEXT,
  credits INTEGER DEFAULT 100,      -- Starting credits
  plan TEXT DEFAULT 'free',         -- free, pro, enterprise
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Conversations (chat sessions)
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  model TEXT DEFAULT 'gpt-4o-mini',
  system_prompt TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages within conversations
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  tokens_used INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Usage tracking
CREATE TABLE usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('chat', 'completion', 'embedding')),
  model TEXT NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER,
  cost_cents INTEGER,               -- Actual cost in cents
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Monthly usage aggregation
CREATE INDEX idx_usage_user_month ON usage (user_id, DATE_TRUNC('month', created_at));

-- Documents for RAG
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document chunks with embeddings
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE document_chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536),           -- OpenAI text-embedding-3-small
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chunks_embedding ON document_chunks
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- API keys for power users
CREATE TABLE api_keys (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL,           -- Hashed API key
  last_used TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### RLS Policies

```sql
-- Users can only access their own data
CREATE POLICY "Users access own conversations"
  ON conversations FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users access own messages"
  ON messages FOR ALL
  USING (
    conversation_id IN (
      SELECT id FROM conversations WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users access own documents"
  ON documents FOR ALL
  USING (user_id = auth.uid());

CREATE POLICY "Users access own usage"
  ON usage FOR SELECT
  USING (user_id = auth.uid());
```

---

## AI Architecture

### Provider Setup

```typescript
// lib/ai/providers.ts
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Model mappings
export const MODELS = {
  'gpt-4o': openai('gpt-4o'),
  'gpt-4o-mini': openai('gpt-4o-mini'),
  'claude-3.5-sonnet': anthropic('claude-3-5-sonnet-20241022'),
  'claude-3.5-haiku': anthropic('claude-3-5-haiku-20241022'),
} as const;

export type ModelId = keyof typeof MODELS;

// Pricing per 1M tokens (in cents)
export const MODEL_PRICING = {
  'gpt-4o': { input: 250, output: 1000 },
  'gpt-4o-mini': { input: 15, output: 60 },
  'claude-3.5-sonnet': { input: 300, output: 1500 },
  'claude-3.5-haiku': { input: 25, output: 125 },
} as const;
```

### Streaming Chat Endpoint

```typescript
// app/api/chat/route.ts
import { streamText } from 'ai';
import { MODELS, MODEL_PRICING, type ModelId } from '@/lib/ai/providers';
import { createClient } from '@/lib/supabase/server';
import { rateLimit, checkCredits, deductCredits, trackUsage } from '@/lib/usage';

export const maxDuration = 60;

export async function POST(request: Request) {
  // Rate limiting
  const rateLimitResult = await rateLimit(request);
  if (rateLimitResult.limited) {
    return rateLimitResult.response;
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Check credits
  const hasCredits = await checkCredits(user.id, 1);
  if (!hasCredits) {
    return new Response('Insufficient credits', { status: 402 });
  }

  const { messages, conversationId, model = 'gpt-4o-mini' } = await request.json();

  // Get system prompt if conversation exists
  let systemPrompt = 'You are a helpful assistant.';
  if (conversationId) {
    const { data: conversation } = await supabase
      .from('conversations')
      .select('system_prompt')
      .eq('id', conversationId)
      .single();
    if (conversation?.system_prompt) {
      systemPrompt = conversation.system_prompt;
    }
  }

  const result = streamText({
    model: MODELS[model as ModelId],
    system: systemPrompt,
    messages,
    onFinish: async ({ usage }) => {
      // Track usage
      const inputTokens = usage?.promptTokens ?? 0;
      const outputTokens = usage?.completionTokens ?? 0;

      const pricing = MODEL_PRICING[model as ModelId];
      const costCents = Math.ceil(
        (inputTokens * pricing.input + outputTokens * pricing.output) / 1_000_000
      );

      // Deduct credits (1 credit = ~1 cent)
      await deductCredits(user.id, Math.max(1, costCents));

      // Track for analytics
      await trackUsage({
        userId: user.id,
        type: 'chat',
        model,
        inputTokens,
        outputTokens,
        costCents,
      });

      // Save assistant message
      if (conversationId) {
        const assistantContent = await result.text;
        await supabase.from('messages').insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: assistantContent,
          tokens_used: inputTokens + outputTokens,
        });
      }
    },
  });

  return result.toDataStreamResponse();
}
```

### RAG Implementation

```typescript
// lib/ai/embeddings.ts
import { embed, embedMany } from 'ai';
import { openai } from './providers';
import { createClient } from '@/lib/supabase/server';

const embeddingModel = openai.embedding('text-embedding-3-small');

export async function embedDocument(documentId: string, content: string) {
  // Split into chunks (simple approach - use tiktoken for production)
  const chunks = splitIntoChunks(content, 500);

  // Generate embeddings
  const { embeddings } = await embedMany({
    model: embeddingModel,
    values: chunks,
  });

  // Store chunks with embeddings
  const supabase = await createClient();
  const chunkRecords = chunks.map((chunk, i) => ({
    document_id: documentId,
    content: chunk,
    embedding: embeddings[i],
  }));

  await supabase.from('document_chunks').insert(chunkRecords);
}

export async function searchSimilar(query: string, userId: string, limit = 5) {
  const { embedding } = await embed({
    model: embeddingModel,
    value: query,
  });

  const supabase = await createClient();

  // Use pgvector similarity search
  const { data: chunks } = await supabase.rpc('match_user_documents', {
    query_embedding: embedding,
    match_user_id: userId,
    match_count: limit,
    match_threshold: 0.7,
  });

  return chunks;
}

// Helper function
function splitIntoChunks(text: string, chunkSize: number): string[] {
  const sentences = text.split(/[.!?]+/);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > chunkSize && currentChunk) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence + '. ';
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}
```

```sql
-- Similarity search function
CREATE OR REPLACE FUNCTION match_user_documents(
  query_embedding vector(1536),
  match_user_id UUID,
  match_count INT DEFAULT 5,
  match_threshold FLOAT DEFAULT 0.7
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.content,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM document_chunks dc
  JOIN documents d ON dc.document_id = d.id
  WHERE d.user_id = match_user_id
    AND 1 - (dc.embedding <=> query_embedding) > match_threshold
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

---

## Usage & Billing Architecture

### Credit System

```typescript
// lib/usage.ts
import { createClient } from '@/lib/supabase/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

// Rate limiters by plan
const rateLimiters = {
  free: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, '1 h'), // 20/hour
  }),
  pro: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(200, '1 h'), // 200/hour
  }),
  enterprise: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1000, '1 h'), // 1000/hour
  }),
};

export async function rateLimit(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { limited: true, response: new Response('Unauthorized', { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan')
    .eq('id', user.id)
    .single();

  const plan = (profile?.plan as keyof typeof rateLimiters) || 'free';
  const { success, limit, remaining, reset } = await rateLimiters[plan].limit(user.id);

  if (!success) {
    return {
      limited: true,
      response: new Response('Rate limit exceeded', {
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString(),
        },
      }),
    };
  }

  return { limited: false };
}

export async function checkCredits(userId: string, required: number) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', userId)
    .single();

  return (profile?.credits ?? 0) >= required;
}

export async function deductCredits(userId: string, amount: number) {
  const supabase = await createClient();
  await supabase.rpc('deduct_credits', { user_id: userId, amount });
}

export async function trackUsage(data: {
  userId: string;
  type: 'chat' | 'completion' | 'embedding';
  model: string;
  inputTokens: number;
  outputTokens?: number;
  costCents: number;
}) {
  const supabase = await createClient();
  await supabase.from('usage').insert({
    user_id: data.userId,
    type: data.type,
    model: data.model,
    input_tokens: data.inputTokens,
    output_tokens: data.outputTokens,
    cost_cents: data.costCents,
  });
}
```

### Credit Purchase

```typescript
// app/api/credits/purchase/route.ts
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

const CREDIT_PACKAGES = {
  small: { credits: 100, price: 500 },     // $5 for 100 credits
  medium: { credits: 500, price: 2000 },   // $20 for 500 credits
  large: { credits: 2000, price: 7000 },   // $70 for 2000 credits
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { package: packageId } = await request.json();
  const pkg = CREDIT_PACKAGES[packageId as keyof typeof CREDIT_PACKAGES];

  if (!pkg) {
    return new Response('Invalid package', { status: 400 });
  }

  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  let customerId = profile?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id);
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{
      price_data: {
        currency: 'usd',
        product_data: {
          name: `${pkg.credits} Credits`,
        },
        unit_amount: pkg.price,
      },
      quantity: 1,
    }],
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/usage?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/usage`,
    metadata: {
      userId: user.id,
      credits: pkg.credits.toString(),
    },
  });

  return Response.json({ url: session.url });
}
```

---

## Chat UI Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Sidebar              │  Chat Area                      │
│  ─────────────────    │  ───────────────────────────    │
│  [+ New Chat]         │  [Model: GPT-4o-mini ▼]         │
│                       │                                 │
│  Today                │  ┌─────────────────────────┐   │
│  • Chat about X       │  │ User message             │   │
│  • Help with Y        │  └─────────────────────────┘   │
│                       │                                 │
│  Yesterday            │  ┌─────────────────────────┐   │
│  • Previous chat      │  │ AI response              │   │
│                       │  │ (streaming...)           │   │
│                       │  └─────────────────────────┘   │
│  ─────────────────    │                                 │
│  [Settings]           │  ┌─────────────────────────┐   │
│  [Credits: 50]        │  │ Type a message...  [→]  │   │
│                       │  └─────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Key Components

```typescript
// components/chat/chat-interface.tsx
'use client';

import { useChat } from 'ai/react';
import { useState } from 'react';

export function ChatInterface({ conversationId }: { conversationId?: string }) {
  const [model, setModel] = useState<ModelId>('gpt-4o-mini');

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    stop,
  } = useChat({
    api: '/api/chat',
    body: { conversationId, model },
  });

  return (
    <div className="flex flex-col h-full">
      {/* Model selector */}
      <div className="border-b p-4">
        <ModelSelector value={model} onChange={setModel} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m) => (
          <Message key={m.id} message={m} />
        ))}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 border rounded-lg px-4 py-2"
          />
          <button type="submit" disabled={isLoading}>
            {isLoading ? 'Stop' : 'Send'}
          </button>
        </div>
      </form>
    </div>
  );
}
```

---

## Third-Party Integrations

| Service | Purpose | When to Add |
|---------|---------|-------------|
| LangSmith | LLM observability | Day 1 for debugging |
| Helicone | Cost tracking | When spending >$100/mo |
| Pinecone | Vector DB | >100K documents |
| Resend | Email notifications | Usage alerts |
| PostHog | Analytics | Understanding usage patterns |
