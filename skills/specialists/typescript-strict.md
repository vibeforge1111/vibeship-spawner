---
name: typescript-strict
description: Use when writing TypeScript code or fixing type errors - enforces strict typing, eliminates any/unknown abuse, and ensures runtime safety through proper type guards and validation
tags: [typescript, types, generics, validation, zod]
---

# TypeScript Strict Specialist

## Overview

TypeScript's value is catching bugs at compile time. Using `any`, ignoring errors, or bypassing the type system defeats this purpose entirely.

**Core principle:** Types are contracts. Breaking contracts breaks trust and ships bugs.

## The Iron Law

```
NO ANY TYPES WITHOUT EXPLICIT JUSTIFICATION AND ESCAPE HATCH COMMENT
```

Every `any` is a bug waiting to happen. If you truly need escape, use `unknown` and narrow with type guards.

## When to Use

**Always:**
- Writing new TypeScript code
- Fixing type errors
- Defining API contracts
- Handling external data (APIs, user input)
- Creating generic utilities

**Don't:**
- Quick prototypes (but convert before merging)
- Generated code (configure generator instead)
- Legacy JavaScript migration (add types incrementally)

Thinking "I'll fix the types later"? Stop. That's technical debt that compounds.

## The Process

### Step 1: Enable Strict Mode

Start with strict tsconfig. Non-negotiable for new projects.

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### Step 2: Define Types First

Before writing implementation, define the types. This forces you to think about the contract.

### Step 3: Validate at Boundaries

External data is `unknown`. Validate with Zod or type guards before trusting it.

## Patterns

### Type Inference (Let TypeScript Work)

<Good>
```typescript
const numbers = [1, 2, 3];
const doubled = numbers.map(n => n * 2);
// TypeScript infers: numbers is number[], doubled is number[]
```
TypeScript infers correctly. Redundant annotations add noise.
</Good>

<Bad>
```typescript
const numbers: number[] = [1, 2, 3];
const doubled: number[] = numbers.map((n: number): number => n * 2);
```
Redundant type annotations. TypeScript already knows.
</Bad>

### Handling Unknown Data

<Good>
```typescript
function processData(data: unknown) {
  if (isUser(data)) {
    return data.name; // Type-safe after guard
  }
  throw new Error('Invalid data');
}

function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value
  );
}
```
Uses `unknown` and narrows with type guard. Runtime safe.
</Good>

<Bad>
```typescript
function processData(data: any) {
  return data.name; // No type safety, crashes if data is wrong
}
```
`any` bypasses all checks. Will crash at runtime with wrong data.
</Bad>

### Discriminated Unions

<Good>
```typescript
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

function handleState<T>(state: AsyncState<T>) {
  switch (state.status) {
    case 'success':
      return state.data; // TypeScript knows data exists
    case 'error':
      return state.error.message; // TypeScript knows error exists
  }
}
```
Discriminated union provides exhaustive type narrowing.
</Good>

<Bad>
```typescript
interface State<T> {
  loading: boolean;
  error?: Error;
  data?: T;
}

function handleState<T>(state: State<T>) {
  if (state.data) {
    return state.data; // But what if loading is true AND data exists?
  }
}
```
Ambiguous state. Multiple booleans create impossible combinations.
</Bad>

### Runtime Validation with Zod

<Good>
```typescript
import { z } from 'zod';

const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
});

type User = z.infer<typeof UserSchema>;

function createUser(data: unknown): User {
  return UserSchema.parse(data); // Throws if invalid
}
```
Single source of truth for types AND runtime validation.
</Good>

<Bad>
```typescript
interface User {
  id: string;
  email: string;
  name: string;
}

function createUser(data: unknown): User {
  return data as User; // Lying to TypeScript
}
```
Type assertion without validation. Will accept invalid data.
</Bad>

## Anti-Patterns

| Anti-Pattern | Why It Fails | What To Do Instead |
|--------------|--------------|-------------------|
| `any` everywhere | Bypasses all type checking | Use `unknown` + type guards |
| `as Type` casting | Lies to compiler, crashes at runtime | Validate with Zod or guards |
| `!` non-null assertion | Hides potential null bugs | Handle null explicitly |
| `@ts-ignore` | Silences errors, doesn't fix them | Fix the actual type issue |
| Redundant type annotations | Noise, can diverge from inferred | Let TypeScript infer |

## Red Flags - STOP

If you catch yourself:
- Adding `any` to "fix" a type error
- Using `as Type` without validation
- Adding `@ts-ignore` or `@ts-expect-error`
- Using `!` non-null assertion without checking
- Thinking "the types are wrong, I know better"

**ALL of these mean: STOP. The type error is telling you something. Understand it first.**

## Common Rationalizations

| Excuse | Reality |
|--------|---------|
| "Types are wrong, I know the data is correct" | Runtime crashes prove otherwise. Validate. |
| "I'll fix the types later" | You won't. Tech debt compounds. Fix now. |
| "any is faster for prototyping" | And creates bugs. Use `unknown` instead. |
| "The library types are wrong" | Create `.d.ts` override. Don't use `any`. |
| "It's just one any" | Every `any` spreads. It infects everything it touches. |
| "Type guards are too verbose" | Less verbose than debugging runtime crashes. |

## Gotchas

### Array Index Access Returns Undefined

With `noUncheckedIndexedAccess: true`:

```typescript
const arr = [1, 2, 3];
const first = arr[0]; // Type: number | undefined

// Handle it
if (first !== undefined) {
  console.log(first * 2);
}

// Or check length first
if (arr.length > 0) {
  const first = arr[0]!; // Safe assertion after length check
}
```

### Object.keys Returns string[]

```typescript
const user = { name: 'John', age: 30 };
Object.keys(user); // Type: string[], not ('name' | 'age')[]

// Type-safe iteration
(Object.keys(user) as Array<keyof typeof user>).forEach(key => {
  console.log(user[key]);
});
```

### Excess Property Checking Only on Literals

```typescript
interface User { name: string }

// Error - excess property
const user: User = { name: 'John', age: 30 }; // Error!

// No error - assigned from variable (structural typing)
const data = { name: 'John', age: 30 };
const user: User = data; // No error!
```

## Verification Checklist

Before marking TypeScript work complete:

- [ ] No `any` types (use `unknown` if truly unknown)
- [ ] No `as Type` assertions without validation
- [ ] No `!` non-null assertions without null checks
- [ ] No `@ts-ignore` without documented reason
- [ ] Strict mode enabled in tsconfig
- [ ] External data validated with Zod or type guards
- [ ] Types exported from central location
- [ ] Generic functions properly constrained

Can't check all boxes? You have type safety gaps. Fix them.

## Integration

**Pairs well with:**
- `supabase-backend` - Database types from schema
- `api-design` - API contract types
- `react-patterns` - Component prop types

**Requires:**
- Node.js with TypeScript
- Zod for runtime validation

## References

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/)
- [Zod Documentation](https://zod.dev/)
- [Total TypeScript](https://www.totaltypescript.com/)

---

*This specialist follows the world-class skill pattern.*
