# AI Integration Specialist

## Identity

- **Layer**: 3 (Pattern)
- **Domain**: OpenAI/Anthropic APIs, streaming responses, token management, prompt engineering
- **Triggers**: AI features, chat interfaces, text generation, embeddings, RAG

---

## Patterns

### AI SDK Setup (Vercel AI SDK)

```typescript
// lib/ai.ts
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';

// OpenAI
export const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

// Anthropic
export const anthropic = createAnthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Model shortcuts
export const gpt4o = openai('gpt-4o');
export const gpt4oMini = openai('gpt-4o-mini');
export const claude = anthropic('claude-3-5-sonnet-20241022');
export const claudeHaiku = anthropic('claude-3-5-haiku-20241022');
```

### Streaming Chat API Route

```typescript
// app/api/chat/route.ts
import { streamText } from 'ai';
import { claude } from '@/lib/ai';
import { createClient } from '@/lib/supabase/server';

export const maxDuration = 30; // Allow longer responses

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { messages } = await request.json();

  const result = streamText({
    model: claude,
    system: `You are a helpful assistant. Be concise and accurate.`,
    messages,
  });

  return result.toDataStreamResponse();
}
```

### Chat UI with useChat

```tsx
// components/chat.tsx
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
  } = useChat({
    api: '/api/chat',
  });

  return (
    <div className="flex flex-col h-[600px]">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <TypingIndicator />
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 text-red-600">
          Error: {error.message}
          <button onClick={reload} className="ml-2 underline">
            Retry
          </button>
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 border rounded-lg px-4 py-2"
            disabled={isLoading}
          />
          {isLoading ? (
            <button
              type="button"
              onClick={stop}
              className="px-4 py-2 bg-red-600 text-white rounded-lg"
            >
              Stop
            </button>
          ) : (
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Send
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
```

### Completion (Non-Chat)

```typescript
// app/api/generate/route.ts
import { generateText } from 'ai';
import { gpt4oMini } from '@/lib/ai';

export async function POST(request: Request) {
  const { prompt } = await request.json();

  const { text } = await generateText({
    model: gpt4oMini,
    prompt,
    maxTokens: 500,
  });

  return Response.json({ text });
}
```

### Structured Output with Zod

```typescript
// app/api/extract/route.ts
import { generateObject } from 'ai';
import { claude } from '@/lib/ai';
import { z } from 'zod';

const ContactSchema = z.object({
  name: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
});

export async function POST(request: Request) {
  const { text } = await request.json();

  const { object } = await generateObject({
    model: claude,
    schema: ContactSchema,
    prompt: `Extract contact information from the following text:\n\n${text}`,
  });

  return Response.json(object);
}
```

### Token Usage Tracking

```typescript
// app/api/chat/route.ts
import { streamText } from 'ai';
import { claude } from '@/lib/ai';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Check user's token budget
  const { data: usage } = await supabase
    .from('ai_usage')
    .select('tokens_used')
    .eq('user_id', user.id)
    .single();

  const MONTHLY_LIMIT = 100000;
  if ((usage?.tokens_used ?? 0) >= MONTHLY_LIMIT) {
    return new Response('Token limit exceeded', { status: 429 });
  }

  const { messages } = await request.json();

  const result = streamText({
    model: claude,
    messages,
    onFinish: async ({ usage }) => {
      // Track usage
      await supabase.from('ai_usage').upsert({
        user_id: user.id,
        tokens_used: (usage?.totalTokens ?? 0) + (usage?.tokens_used ?? 0),
        updated_at: new Date().toISOString(),
      });
    },
  });

  return result.toDataStreamResponse();
}
```

### RAG with Embeddings

```typescript
// lib/embeddings.ts
import { openai } from '@/lib/ai';
import { embed, embedMany } from 'ai';

export async function getEmbedding(text: string) {
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: text,
  });
  return embedding;
}

export async function getEmbeddings(texts: string[]) {
  const { embeddings } = await embedMany({
    model: openai.embedding('text-embedding-3-small'),
    values: texts,
  });
  return embeddings;
}
```

```sql
-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Documents table with embedding
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for similarity search
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Function for similarity search
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
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
    documents.id,
    documents.content,
    1 - (documents.embedding <=> query_embedding) AS similarity
  FROM documents
  WHERE 1 - (documents.embedding <=> query_embedding) > match_threshold
  ORDER BY documents.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

```typescript
// app/api/rag/route.ts
import { streamText } from 'ai';
import { claude } from '@/lib/ai';
import { getEmbedding } from '@/lib/embeddings';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const supabase = await createClient();
  const { query } = await request.json();

  // Get embedding for query
  const queryEmbedding = await getEmbedding(query);

  // Find similar documents
  const { data: documents } = await supabase.rpc('match_documents', {
    query_embedding: queryEmbedding,
    match_count: 5,
    match_threshold: 0.7,
  });

  // Build context from documents
  const context = documents
    ?.map((doc) => doc.content)
    .join('\n\n---\n\n');

  const result = streamText({
    model: claude,
    system: `Answer questions based on the following context. If the answer isn't in the context, say "I don't have information about that."

Context:
${context}`,
    prompt: query,
  });

  return result.toDataStreamResponse();
}
```

### Tool Calling

```typescript
// app/api/agent/route.ts
import { streamText, tool } from 'ai';
import { claude } from '@/lib/ai';
import { z } from 'zod';

export async function POST(request: Request) {
  const { messages } = await request.json();

  const result = streamText({
    model: claude,
    messages,
    tools: {
      getWeather: tool({
        description: 'Get the current weather for a location',
        parameters: z.object({
          location: z.string().describe('City name'),
        }),
        execute: async ({ location }) => {
          // Call weather API
          const response = await fetch(
            `https://api.weatherapi.com/v1/current.json?key=${process.env.WEATHER_API_KEY}&q=${location}`
          );
          const data = await response.json();
          return {
            location,
            temperature: data.current.temp_c,
            condition: data.current.condition.text,
          };
        },
      }),
      searchWeb: tool({
        description: 'Search the web for information',
        parameters: z.object({
          query: z.string().describe('Search query'),
        }),
        execute: async ({ query }) => {
          // Call search API
          return { results: ['Result 1', 'Result 2'] };
        },
      }),
    },
    maxSteps: 5, // Allow multiple tool calls
  });

  return result.toDataStreamResponse();
}
```

### Rate Limiting AI Endpoints

```typescript
// middleware.ts or in route
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'), // 10 requests per minute
});

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new Response('Rate limit exceeded', { status: 429 });
  }

  // Continue with AI call...
}
```

---

## Anti-patterns

### Exposing API Keys

```typescript
// BAD - Client-side API call
'use client';
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, // Exposed!
});

// GOOD - Server-side only
// Always call AI APIs from API routes or Server Actions
```

### No Token Limits

```typescript
// BAD - Unlimited tokens
const result = await generateText({
  model: gpt4o,
  prompt: userInput, // Could be huge!
});

// GOOD - Set limits
const result = await generateText({
  model: gpt4o,
  prompt: userInput.slice(0, 10000), // Truncate input
  maxTokens: 1000, // Limit output
});
```

### Not Handling Errors

```typescript
// BAD - Assumes success
const { text } = await generateText({ model, prompt });
return Response.json({ text });

// GOOD - Handle errors
try {
  const { text } = await generateText({ model, prompt });
  return Response.json({ text });
} catch (error) {
  if (error.message.includes('rate limit')) {
    return new Response('Too many requests', { status: 429 });
  }
  console.error('AI error:', error);
  return new Response('AI service error', { status: 500 });
}
```

---

## Gotchas

### 1. Streaming Requires Special Response

Don't use `Response.json()` for streaming. Use `toDataStreamResponse()`.

### 2. Context Window Limits

- GPT-4o: 128K tokens
- Claude 3.5: 200K tokens

Track conversation length and truncate old messages.

### 3. Tool Calls May Loop

Set `maxSteps` to prevent infinite tool call loops.

### 4. Embeddings Dimensions

Different models have different dimensions:
- text-embedding-3-small: 1536
- text-embedding-3-large: 3072

### 5. Cold Starts

First AI call may be slow. Consider warming up endpoints.

---

## Checkpoints

Before marking AI integration complete:

- [ ] API keys stored in environment variables
- [ ] Rate limiting implemented
- [ ] Token usage tracking (if billing users)
- [ ] Input validation and sanitization
- [ ] Output length limits
- [ ] Error handling for API failures
- [ ] Streaming UI with loading states
- [ ] Conversation history management
- [ ] System prompts secured (not user-editable)

---

## Squad Dependencies

Often paired with:
- **Layer 1**: `supabase-backend` for RAG storage
- **Layer 2**: `api-design` for API structure
- **Layer 3**: `payments-flow` for usage billing
- **Layer 1**: `react-patterns` for chat UI

---

*Last updated: 2025-12-11*
