# API Design Specialist

## Identity

- **Layer**: 2 (Integration)
- **Domain**: REST conventions, error handling, pagination, rate limiting, versioning
- **Triggers**: API endpoint design, response structure, error handling, API best practices

---

## Patterns

### API Route Structure (Next.js App Router)

```
app/
  api/
    v1/
      users/
        route.ts           # GET (list), POST (create)
        [id]/
          route.ts         # GET, PATCH, DELETE
      posts/
        route.ts
        [id]/
          route.ts
          comments/
            route.ts       # Nested resource
```

### Standard Response Envelope

```typescript
// types/api.ts
interface ApiResponse<T> {
  data: T;
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}
```

### Response Helpers

```typescript
// lib/api/responses.ts
import { NextResponse } from 'next/server';

export function success<T>(data: T, status = 200) {
  return NextResponse.json(
    {
      data,
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}

export function created<T>(data: T) {
  return success(data, 201);
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function error(
  code: string,
  message: string,
  status = 400,
  details?: Record<string, string[]>
) {
  return NextResponse.json(
    {
      error: { code, message, details },
      meta: {
        timestamp: new Date().toISOString(),
      },
    },
    { status }
  );
}

export function notFound(resource = 'Resource') {
  return error('NOT_FOUND', `${resource} not found`, 404);
}

export function unauthorized(message = 'Unauthorized') {
  return error('UNAUTHORIZED', message, 401);
}

export function forbidden(message = 'Forbidden') {
  return error('FORBIDDEN', message, 403);
}

export function validationError(details: Record<string, string[]>) {
  return error('VALIDATION_ERROR', 'Validation failed', 400, details);
}

export function serverError(message = 'Internal server error') {
  return error('INTERNAL_ERROR', message, 500);
}
```

### CRUD Route Handler

```typescript
// app/api/v1/posts/route.ts
import { createClient } from '@/lib/supabase/server';
import { success, created, validationError, unauthorized } from '@/lib/api/responses';
import { z } from 'zod';

const CreatePostSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  published: z.boolean().default(false),
});

// GET /api/v1/posts
export async function GET(request: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(request.url);

  // Pagination
  const page = parseInt(searchParams.get('page') ?? '1');
  const pageSize = Math.min(parseInt(searchParams.get('pageSize') ?? '20'), 100);
  const offset = (page - 1) * pageSize;

  // Filtering
  const published = searchParams.get('published');

  let query = supabase
    .from('posts')
    .select('*', { count: 'exact' });

  if (published !== null) {
    query = query.eq('published', published === 'true');
  }

  const { data, error, count } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + pageSize - 1);

  if (error) {
    return serverError(error.message);
  }

  const total = count ?? 0;
  const totalPages = Math.ceil(total / pageSize);

  return NextResponse.json({
    data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  });
}

// POST /api/v1/posts
export async function POST(request: Request) {
  const supabase = await createClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return unauthorized();
  }

  // Parse and validate body
  const body = await request.json();
  const result = CreatePostSchema.safeParse(body);

  if (!result.success) {
    const details = result.error.flatten().fieldErrors as Record<string, string[]>;
    return validationError(details);
  }

  // Create post
  const { data, error } = await supabase
    .from('posts')
    .insert({
      ...result.data,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return serverError(error.message);
  }

  return created(data);
}
```

### Single Resource Route

```typescript
// app/api/v1/posts/[id]/route.ts
import { createClient } from '@/lib/supabase/server';
import { success, noContent, notFound, unauthorized, forbidden, validationError } from '@/lib/api/responses';
import { z } from 'zod';

const UpdatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  published: z.boolean().optional(),
});

// GET /api/v1/posts/[id]
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return notFound('Post');
  }

  return success(data);
}

// PATCH /api/v1/posts/[id]
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return unauthorized();
  }

  // Check ownership
  const { data: existing } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!existing) {
    return notFound('Post');
  }

  if (existing.user_id !== user.id) {
    return forbidden('You can only edit your own posts');
  }

  // Validate body
  const body = await request.json();
  const result = UpdatePostSchema.safeParse(body);

  if (!result.success) {
    const details = result.error.flatten().fieldErrors as Record<string, string[]>;
    return validationError(details);
  }

  // Update
  const { data, error } = await supabase
    .from('posts')
    .update({
      ...result.data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return serverError(error.message);
  }

  return success(data);
}

// DELETE /api/v1/posts/[id]
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  // Check auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return unauthorized();
  }

  // Check ownership
  const { data: existing } = await supabase
    .from('posts')
    .select('user_id')
    .eq('id', id)
    .single();

  if (!existing) {
    return notFound('Post');
  }

  if (existing.user_id !== user.id) {
    return forbidden('You can only delete your own posts');
  }

  await supabase.from('posts').delete().eq('id', id);

  return noContent();
}
```

### Error Codes Reference

```typescript
// lib/api/error-codes.ts
export const ErrorCodes = {
  // Client errors (4xx)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',

  // Server errors (5xx)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',

  // Business logic errors
  INSUFFICIENT_CREDITS: 'INSUFFICIENT_CREDITS',
  SUBSCRIPTION_REQUIRED: 'SUBSCRIPTION_REQUIRED',
  LIMIT_EXCEEDED: 'LIMIT_EXCEEDED',
} as const;
```

### Rate Limiting

```typescript
// lib/api/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

// Different limiters for different endpoints
export const rateLimiters = {
  // 10 requests per 10 seconds
  api: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, '10 s'),
    analytics: true,
    prefix: 'ratelimit:api',
  }),

  // 5 requests per minute for auth
  auth: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: true,
    prefix: 'ratelimit:auth',
  }),

  // 100 requests per day for AI endpoints
  ai: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 d'),
    analytics: true,
    prefix: 'ratelimit:ai',
  }),
};

// Rate limit middleware
export async function rateLimit(
  request: Request,
  limiter: Ratelimit = rateLimiters.api
) {
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const { success, limit, reset, remaining } = await limiter.limit(ip);

  const headers = {
    'X-RateLimit-Limit': limit.toString(),
    'X-RateLimit-Remaining': remaining.toString(),
    'X-RateLimit-Reset': reset.toString(),
  };

  if (!success) {
    return {
      limited: true,
      response: NextResponse.json(
        {
          error: {
            code: 'RATE_LIMITED',
            message: 'Too many requests',
          },
        },
        { status: 429, headers }
      ),
    };
  }

  return { limited: false, headers };
}

// Usage in route
export async function POST(request: Request) {
  const { limited, response, headers } = await rateLimit(request);
  if (limited) return response;

  // ... rest of handler
  // Include headers in response
}
```

### API Versioning

```typescript
// middleware.ts - Version routing
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect unversioned API calls to latest version
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/v')) {
    const newPath = pathname.replace('/api/', '/api/v1/');
    return NextResponse.redirect(new URL(newPath, request.url));
  }

  return NextResponse.next();
}
```

### Typed API Client

```typescript
// lib/api/client.ts
type HttpMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE';

interface RequestOptions {
  body?: unknown;
  headers?: Record<string, string>;
}

async function apiRequest<T>(
  method: HttpMethod,
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const response = await fetch(`/api/v1${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new ApiError(error.error.code, error.error.message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const json = await response.json();
  return json.data;
}

export const api = {
  get: <T>(path: string) => apiRequest<T>('GET', path),
  post: <T>(path: string, body: unknown) => apiRequest<T>('POST', path, { body }),
  patch: <T>(path: string, body: unknown) => apiRequest<T>('PATCH', path, { body }),
  delete: (path: string) => apiRequest<void>('DELETE', path),
};

// Usage
const posts = await api.get<Post[]>('/posts?page=1');
const newPost = await api.post<Post>('/posts', { title: 'Hello' });
await api.delete(`/posts/${id}`);
```

---

## Anti-patterns

### Inconsistent Response Structure

```typescript
// BAD - Different structures
return NextResponse.json(user);           // Direct data
return NextResponse.json({ user });       // Wrapped differently
return NextResponse.json({ data: user }); // Standard envelope

// GOOD - Always use envelope
return success(user);
```

### Exposing Internal Errors

```typescript
// BAD - Leaks implementation details
return NextResponse.json({
  error: error.message, // "relation 'users' does not exist"
}, { status: 500 });

// GOOD - Generic message, log internally
console.error('Database error:', error);
return serverError('An unexpected error occurred');
```

### Not Validating Input

```typescript
// BAD - Trusting client data
const { title, content } = await request.json();
await db.posts.create({ title, content });

// GOOD - Validate everything
const body = await request.json();
const result = CreatePostSchema.safeParse(body);
if (!result.success) {
  return validationError(result.error.flatten().fieldErrors);
}
```

### Mixing Auth Patterns

```typescript
// BAD - Inconsistent auth checks
export async function GET(request: Request) {
  const token = request.headers.get('Authorization');
  // Manual JWT validation...
}

// GOOD - Use Supabase consistently
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
}
```

---

## Gotchas

### 1. Request Body Can Only Be Read Once

```typescript
// BAD - Body already consumed
const body1 = await request.json();
const body2 = await request.json(); // Error!

// GOOD - Parse once, reuse
const body = await request.json();
// Use body throughout handler
```

### 2. Params Are Async in App Router

```typescript
// Next.js 15+ - params is a Promise
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // Must await!
}
```

### 3. Response Headers Must Be Set Before Body

```typescript
// For streaming or custom headers
const response = new NextResponse(body, {
  status: 200,
  headers: {
    'Content-Type': 'application/json',
    'X-Custom-Header': 'value',
  },
});
```

### 4. CORS for External Clients

```typescript
// app/api/v1/[...path]/route.ts
export async function OPTIONS(request: Request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
```

### 5. Supabase RLS Still Applies

Even in API routes, RLS policies are enforced. The API user's auth context determines what data they can access.

---

## Checkpoints

Before marking an API design task complete:

- [ ] All endpoints follow REST conventions
- [ ] Response envelope is consistent
- [ ] Input validation with Zod on all endpoints
- [ ] Proper error codes and messages
- [ ] Auth checks on protected routes
- [ ] Pagination implemented for list endpoints
- [ ] Rate limiting configured
- [ ] No internal errors exposed to clients

---

## Escape Hatches

### When REST doesn't fit
- Consider GraphQL for complex nested queries
- Use RPC-style endpoints for actions (`/api/v1/posts/[id]/publish`)
- Server Actions for form submissions

### When validation is complex
- Create reusable schema fragments
- Use Zod's `.refine()` for custom validation
- Split into multiple schemas

### When rate limiting is overkill
- Start without it for MVP
- Add only to expensive/sensitive endpoints
- Use Supabase's built-in rate limiting

---

## Squad Dependencies

Often paired with:
- **Layer 1**: `supabase-backend` for database operations
- **Layer 1**: `typescript-strict` for type definitions
- **Layer 2**: `nextjs-supabase-auth` for auth context
- **Layer 3**: `crud-builder` for CRUD patterns

---

*Last updated: 2025-12-11*
