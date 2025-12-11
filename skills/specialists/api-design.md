---
name: api-design
description: Use when designing REST APIs or handling HTTP endpoints - enforces consistent response envelopes, proper error codes, validation at boundaries, and rate limiting patterns
tags: [api, rest, endpoints, validation, error-handling]
---

# API Design Specialist

## Overview

APIs are contracts between systems. Inconsistent responses, leaked internal errors, and unvalidated input create fragile integrations that break in production.

**Core principle:** Every API response should be predictable, secure, and helpful to the consumer.

## The Iron Law

```
NO API RESPONSE WITHOUT CONSISTENT ENVELOPE AND PROPER STATUS CODE
```

Every response uses the same structure. Every error has a code, message, and appropriate HTTP status. No exceptions.

## When to Use

**Always:**
- Designing new API endpoints
- Adding error handling to routes
- Implementing pagination
- Setting up rate limiting
- Creating API response helpers

**Don't:**
- Internal function calls (not HTTP boundaries)
- GraphQL APIs (different patterns)
- WebSocket messages (different protocol)

Thinking "I'll standardize the API later"? Stop. Inconsistent APIs compound technical debt with every consumer.

## The Process

### Step 1: Define Response Envelope

Before writing any endpoint, establish your standard response structure:

```typescript
interface ApiResponse<T> {
  data: T;
  meta?: { timestamp: string; requestId: string; };
}

interface ApiError {
  error: { code: string; message: string; details?: Record<string, string[]>; };
}
```

### Step 2: Create Response Helpers

Build reusable functions for every response type:

```typescript
export function success<T>(data: T, status = 200) { ... }
export function created<T>(data: T) { return success(data, 201); }
export function notFound(resource = 'Resource') { ... }
export function validationError(details: Record<string, string[]>) { ... }
```

### Step 3: Validate All Input

Every endpoint validates input with Zod before processing:

```typescript
const result = Schema.safeParse(body);
if (!result.success) {
  return validationError(result.error.flatten().fieldErrors);
}
```

## Patterns

### Response Envelope

<Good>
```typescript
// Consistent envelope for all responses
return NextResponse.json({
  data: user,
  meta: { timestamp: new Date().toISOString() }
}, { status: 200 });

// Consistent error envelope
return NextResponse.json({
  error: { code: 'NOT_FOUND', message: 'User not found' }
}, { status: 404 });
```
Every consumer knows exactly what structure to expect.
</Good>

<Bad>
```typescript
// Inconsistent - different structures
return NextResponse.json(user);           // Raw data
return NextResponse.json({ user });       // Wrapped differently
return NextResponse.json({ data: user }); // Yet another way
return NextResponse.json({ error: 'Not found' }); // String error
```
Consumers must handle multiple formats. Bugs guaranteed.
</Bad>

### Error Handling

<Good>
```typescript
const { data, error } = await supabase.from('users').select('*');

if (error) {
  console.error('Database error:', error); // Log internally
  return serverError('An unexpected error occurred'); // Generic to client
}

return success(data);
```
Logs full error for debugging, returns safe message to client.
</Good>

<Bad>
```typescript
const { data, error } = await supabase.from('users').select('*');

if (error) {
  return NextResponse.json({
    error: error.message // "relation 'users' does not exist"
  }, { status: 500 });
}
```
Leaks database implementation details. Security risk.
</Bad>

### Input Validation

<Good>
```typescript
const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

export async function POST(request: Request) {
  const body = await request.json();
  const result = CreateUserSchema.safeParse(body);

  if (!result.success) {
    return validationError(result.error.flatten().fieldErrors);
  }

  // Safe to use result.data
}
```
Validates before use. Type-safe after validation.
</Good>

<Bad>
```typescript
export async function POST(request: Request) {
  const { email, name } = await request.json();
  await db.users.create({ email, name }); // Trust client data
}
```
No validation. SQL injection, invalid data, crashes waiting to happen.
</Bad>

## Anti-Patterns

| Anti-Pattern | Why It Fails | What To Do Instead |
|--------------|--------------|-------------------|
| Inconsistent response structure | Consumers can't rely on format | Use envelope helpers everywhere |
| Exposing internal errors | Security risk, confusing for users | Log internally, return generic message |
| No input validation | Crashes, injection, invalid state | Validate with Zod at boundary |
| Different auth patterns per route | Confusion, security gaps | Use consistent middleware |
| Missing pagination | Memory issues, slow responses | Always paginate list endpoints |

## Red Flags - STOP

If you catch yourself:
- Returning raw data without envelope
- Exposing database error messages to clients
- Skipping validation "because it's internal"
- Using different status codes for same error type
- Not handling the error case from database calls

**ALL of these mean: STOP. Review the response helpers. Use them consistently.**

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "It's just an internal API" | Internal APIs become external. Start consistent. |
| "The client will handle the error" | Clients can't handle what they can't predict. |
| "Validation slows things down" | Invalid data in database slows things down more. |
| "I'll add error handling later" | You won't. Or you'll miss cases. Do it now. |
| "The framework handles errors" | Framework errors expose internals. Handle explicitly. |
| "It's obvious what the response means" | Not to the next developer. Or the client at 3am. |

## Gotchas

### Request Body Can Only Be Read Once

```typescript
// BAD
const body1 = await request.json();
const body2 = await request.json(); // Error!

// GOOD - Parse once
const body = await request.json();
```

### Params Are Async in Next.js 15+

```typescript
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; // Must await!
}
```

### Rate Limit Headers Before Body

```typescript
const response = new NextResponse(body, {
  status: 200,
  headers: {
    'X-RateLimit-Remaining': remaining.toString(),
  },
});
```

## Verification Checklist

Before marking API work complete:

- [ ] All endpoints use response envelope helpers
- [ ] All errors have consistent code + message structure
- [ ] Input validation with Zod on every endpoint
- [ ] No internal error messages exposed to clients
- [ ] Auth checks on all protected routes
- [ ] Pagination on list endpoints
- [ ] Proper HTTP status codes (201 for create, 204 for delete, etc.)
- [ ] Rate limiting on public/expensive endpoints

Can't check all boxes? Your API has inconsistencies. Fix them.

## Integration

**Pairs well with:**
- `supabase-backend` - Database operations
- `typescript-strict` - Type definitions for API contracts
- `auth-flow` - Authentication middleware

**Requires:**
- Zod for validation
- Response helper utilities

## References

- [HTTP Status Codes](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status)
- [REST API Best Practices](https://restfulapi.net/)
- [Zod Documentation](https://zod.dev/)

---

*This specialist follows the world-class skill pattern.*
