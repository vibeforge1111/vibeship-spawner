---
name: ai-integration
description: Use when building AI features with LLMs - enforces API key security, rate limiting, token management, and proper streaming patterns with Vercel AI SDK
tags: [ai, llm, openai, anthropic, streaming, rag, embeddings]
---

# AI Integration Specialist

## Overview

AI features are expensive to run and easy to abuse. Exposed API keys get exploited within minutes. Unbounded prompts drain budgets. Poor error handling frustrates users mid-conversation.

**Core principle:** AI calls happen server-side only. Rate limit everything. Track usage. Handle failures gracefully.

## The Iron Law

```
NO AI API CALLS FROM CLIENT-SIDE CODE - ALL CALLS GO THROUGH SERVER ROUTES
```

API keys in client code get stolen. Every AI call must go through your server where you control rate limiting, authentication, and token budgets.

## When to Use

**Always:**
- Chat interfaces
- Text generation
- Structured data extraction
- Embeddings and RAG
- AI-powered features

**Don't:**
- Simple string manipulation (use code)
- Deterministic transformations (AI is overkill)
- High-frequency calls without rate limiting

Thinking "I'll just call OpenAI from the frontend"? Stop. Your API key will be stolen and you'll get a $10,000 bill.

## The Process

### Step 1: Set Up Server-Side Providers

```typescript
// lib/ai.ts
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';

export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});
```

### Step 2: Create API Route with Auth

Always verify the user before making AI calls.

### Step 3: Implement Rate Limiting

Use Upstash or similar to prevent abuse.

## Patterns

### Streaming Chat API

<Good>
```typescript
// app/api/chat/route.ts
import { streamText } from 'ai';
import { anthropic } from '@/lib/ai';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 30;

export async function POST(request: Request) {
  // Verify authentication
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Check rate limit
  const { success } = await ratelimit.limit(user.id);
  if (!success) {
    return new Response('Rate limit exceeded', { status: 429 });
  }

  const { messages } = await request.json();

  const result = streamText({
    model: anthropic('claude-3-5-sonnet-20241022'),
    system: 'You are a helpful assistant. Be concise.',
    messages,
    maxTokens: 1000,
  });

  return result.toDataStreamResponse();
}
```
Authenticated, rate limited, token capped, streaming response.
</Good>

<Bad>
```typescript
// BAD - Client-side API call
'use client';

async function chat(message: string) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    headers: {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_KEY}`, // EXPOSED!
    },
    body: JSON.stringify({ messages: [{ role: 'user', content: message }] }),
  });
}
```
API key exposed in client bundle. Will be stolen.
</Bad>

### Chat UI with useChat

<Good>
```tsx
'use client';

import { useChat } from 'ai/react';

export function Chat() {
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    reload,
    stop,
  } = useChat({ api: '/api/chat' });

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={msg.role === 'user' ? 'text-right' : 'text-left'}
          >
            <div className={`inline-block p-3 rounded-lg ${
              msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && <TypingIndicator />}
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-600">
          Something went wrong.
          <button onClick={reload} className="ml-2 underline">Retry</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-4 border-t flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Message..."
          className="flex-1 border rounded-lg px-4 py-2"
          disabled={isLoading}
        />
        <button
          type={isLoading ? 'button' : 'submit'}
          onClick={isLoading ? stop : undefined}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          {isLoading ? 'Stop' : 'Send'}
        </button>
      </form>
    </div>
  );
}
```
Handles loading, error, stop functionality. Clean UI.
</Good>

<Bad>
```tsx
// BAD - No error handling, no loading state
const { messages, input, handleSubmit } = useChat();

return (
  <form onSubmit={handleSubmit}>
    <input value={input} />
    <button>Send</button>
    {messages.map(m => <div>{m.content}</div>)}
  </form>
);
```
No error handling, no loading indicator, no stop button.
</Bad>

### Token Usage Tracking

<Good>
```typescript
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Check user's token budget
  const { data: usage } = await supabase
    .from('ai_usage')
    .select('tokens_used, token_limit')
    .eq('user_id', user.id)
    .single();

  if (usage && usage.tokens_used >= usage.token_limit) {
    return new Response('Token limit exceeded', { status: 429 });
  }

  const { messages } = await request.json();

  const result = streamText({
    model: claude,
    messages,
    maxTokens: 1000,
    onFinish: async ({ usage: tokenUsage }) => {
      await supabase
        .from('ai_usage')
        .update({
          tokens_used: (usage?.tokens_used ?? 0) + (tokenUsage?.totalTokens ?? 0),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);
    },
  });

  return result.toDataStreamResponse();
}
```
Checks budget before call, tracks usage after completion.
</Good>

<Bad>
```typescript
// BAD - No limits
const result = await generateText({
  model: gpt4o,
  prompt: userInput, // Could be 100K tokens!
});
```
No input limit, no output limit, no budget tracking. Recipe for huge bills.
</Bad>

### Structured Output with Zod

<Good>
```typescript
import { generateObject } from 'ai';
import { z } from 'zod';

const ContactSchema = z.object({
  name: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
});

export async function POST(request: Request) {
  const { text } = await request.json();

  try {
    const { object } = await generateObject({
      model: claude,
      schema: ContactSchema,
      prompt: `Extract contact info from: ${text.slice(0, 5000)}`,
    });

    return Response.json(object);
  } catch (error) {
    console.error('AI extraction failed:', error);
    return Response.json({ error: 'Extraction failed' }, { status: 500 });
  }
}
```
Typed output, input truncated, error handling.
</Good>

<Bad>
```typescript
// BAD - Parsing JSON from raw output
const { text } = await generateText({
  model: gpt4o,
  prompt: `Return JSON with name, email: ${input}`,
});
const data = JSON.parse(text); // May not be valid JSON!
```
Raw JSON parsing fails when model doesn't return valid JSON.
</Bad>

### RAG with Embeddings

<Good>
```typescript
// lib/embeddings.ts
import { openai } from '@/lib/ai';
import { embed } from 'ai';

export async function getEmbedding(text: string) {
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: text.slice(0, 8000), // Respect token limits
  });
  return embedding;
}

// app/api/rag/route.ts
export async function POST(request: Request) {
  const { query } = await request.json();

  const queryEmbedding = await getEmbedding(query);

  const { data: documents } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_count: 5,
    match_threshold: 0.7,
  });

  const context = documents?.map(d => d.content).join('\n\n---\n\n');

  const result = streamText({
    model: claude,
    system: `Answer based on this context. If not in context, say "I don't know."

Context:
${context}`,
    prompt: query,
  });

  return result.toDataStreamResponse();
}
```
Embeds query, retrieves relevant docs, grounds response in context.
</Good>

<Bad>
```typescript
// BAD - No context, just raw LLM
const result = await generateText({
  model: claude,
  prompt: query, // LLM hallucinates without context
});
```
No RAG = hallucinations about your specific data.
</Bad>

## Anti-Patterns

| Anti-Pattern | Why It Fails | What To Do Instead |
|--------------|--------------|-------------------|
| API key in client code | Gets stolen instantly | Server-side calls only |
| No token limits | Huge bills from long prompts | Set maxTokens, truncate input |
| No rate limiting | Abuse, denial of service | Use Upstash or similar |
| Ignoring errors | Silent failures, bad UX | Handle all error states |
| No usage tracking | Can't bill users, surprise costs | Track tokens per user |

## Red Flags - STOP

If you catch yourself:
- Using `NEXT_PUBLIC_` for an AI API key
- Not setting `maxTokens` on generation calls
- Making AI calls without authentication
- Not handling the error case from AI calls
- Allowing unlimited message history in context

**ALL of these mean: STOP. Secure the endpoint, add limits, handle errors.**

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "It's just for testing" | Stolen keys don't care about your intent. |
| "I'll add rate limiting later" | Later = after someone abuses it. |
| "Token limits restrict functionality" | Unlimited tokens restrict your bank account. |
| "Errors are rare" | API errors happen constantly. Handle them. |
| "I trust my users" | Your users' browsers can be compromised. |
| "Streaming is complicated" | AI SDK makes it simple. Use it. |

## Gotchas

### Streaming Requires Special Response

```typescript
// BAD - Won't stream
return Response.json({ result: await generateText(...) });

// GOOD - Streams properly
return result.toDataStreamResponse();
```

### Context Window Limits

- GPT-4o: 128K tokens
- Claude 3.5: 200K tokens

Track conversation length and truncate old messages to stay within limits.

### Tool Calls May Loop Infinitely

```typescript
const result = streamText({
  model: claude,
  tools: { ... },
  maxSteps: 5, // Prevent infinite loops
});
```

### Embeddings Have Different Dimensions

- text-embedding-3-small: 1536 dimensions
- text-embedding-3-large: 3072 dimensions

Your vector database column must match the embedding model dimensions.

### Cold Starts

First AI call after deployment may be slow. Consider warming up endpoints in production.

## Verification Checklist

Before marking AI integration complete:

- [ ] API keys in environment variables only (no NEXT_PUBLIC_)
- [ ] Authentication required on all AI endpoints
- [ ] Rate limiting implemented
- [ ] Token usage tracking (if billing users)
- [ ] Input validation and length limits
- [ ] Output maxTokens set
- [ ] Error handling for API failures
- [ ] Streaming UI with loading/stop states
- [ ] Conversation history truncation
- [ ] System prompts secured (not user-editable)

Can't check all boxes? You have AI security issues. Fix them.

## Integration

**Pairs well with:**
- `supabase-backend` - RAG storage, usage tracking
- `api-design` - API route structure
- `payments-flow` - Usage-based billing
- `react-patterns` - Chat UI components

**Requires:**
- Vercel AI SDK (`ai` package)
- Provider SDK (@ai-sdk/openai, @ai-sdk/anthropic)
- Rate limiting service (Upstash recommended)

## References

- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Anthropic API Reference](https://docs.anthropic.com/claude/reference)
- [Upstash Rate Limiting](https://upstash.com/docs/oss/sdks/ts/ratelimit)

---

*This specialist follows the world-class skill pattern.*
