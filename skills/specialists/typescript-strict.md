# TypeScript Strict Specialist

## Identity

- **Tags**: `typescript`, `types`, `generics`, `validation`, `zod`
- **Domain**: Type safety, generics, type inference, strict mode, type guards
- **Use when**: Type errors, generic functions, complex type definitions, type-safe APIs

---

## Patterns

### Strict tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Type Inference (Let TypeScript Work)

```typescript
// BAD - Redundant type annotation
const numbers: number[] = [1, 2, 3];
const doubled: number[] = numbers.map((n: number): number => n * 2);

// GOOD - Let TypeScript infer
const numbers = [1, 2, 3];
const doubled = numbers.map(n => n * 2);
// TypeScript knows: numbers is number[], doubled is number[]
```

### Interface vs Type

```typescript
// Use interface for objects that may be extended
interface User {
  id: string;
  name: string;
}

interface AdminUser extends User {
  permissions: string[];
}

// Use type for unions, intersections, mapped types
type Status = 'pending' | 'active' | 'inactive';
type UserWithStatus = User & { status: Status };
type Nullable<T> = T | null;
```

### Discriminated Unions

```typescript
// Define a discriminated union for state
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };

// TypeScript narrows the type based on status
function handleState<T>(state: AsyncState<T>) {
  switch (state.status) {
    case 'idle':
      return 'Not started';
    case 'loading':
      return 'Loading...';
    case 'success':
      return state.data; // TypeScript knows data exists
    case 'error':
      return state.error.message; // TypeScript knows error exists
  }
}
```

### Type Guards

```typescript
// Type predicate
function isUser(value: unknown): value is User {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value
  );
}

// Usage
function processData(data: unknown) {
  if (isUser(data)) {
    console.log(data.name); // TypeScript knows it's User
  }
}

// Using 'in' operator
function handleResponse(response: SuccessResponse | ErrorResponse) {
  if ('error' in response) {
    console.log(response.error); // ErrorResponse
  } else {
    console.log(response.data); // SuccessResponse
  }
}
```

### Generics

```typescript
// Generic function
function first<T>(array: T[]): T | undefined {
  return array[0];
}

// Generic with constraint
function getProperty<T, K extends keyof T>(obj: T, key: K): T[K] {
  return obj[key];
}

// Generic component
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return <ul>{items.map(renderItem)}</ul>;
}

// Usage - TypeScript infers T from items
<List
  items={users}
  renderItem={(user) => <li>{user.name}</li>} // user is typed!
/>
```

### Utility Types

```typescript
// Partial - all properties optional
type PartialUser = Partial<User>;
// { id?: string; name?: string; }

// Required - all properties required
type RequiredUser = Required<PartialUser>;

// Pick - select specific properties
type UserName = Pick<User, 'name'>;
// { name: string }

// Omit - exclude properties
type UserWithoutId = Omit<User, 'id'>;
// { name: string }

// Record - typed object
type UserRoles = Record<string, User>;
// { [key: string]: User }

// ReturnType - extract function return type
type ApiResponse = ReturnType<typeof fetchUser>;

// Parameters - extract function parameters
type FetchParams = Parameters<typeof fetchUser>;
```

### const Assertions

```typescript
// Without as const - type is string[]
const statuses = ['pending', 'active'];
// Type: string[]

// With as const - type is readonly tuple
const statuses = ['pending', 'active'] as const;
// Type: readonly ['pending', 'active']

// Useful for object literals
const config = {
  endpoint: '/api',
  timeout: 5000,
} as const;
// Type: { readonly endpoint: '/api'; readonly timeout: 5000 }
```

### Zod for Runtime Validation

```typescript
import { z } from 'zod';

// Define schema
const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  age: z.number().int().positive().optional(),
});

// Infer TypeScript type from schema
type User = z.infer<typeof UserSchema>;

// Validate at runtime
function createUser(data: unknown): User {
  return UserSchema.parse(data); // Throws if invalid
}

// Safe parse (doesn't throw)
const result = UserSchema.safeParse(data);
if (result.success) {
  console.log(result.data); // Typed as User
} else {
  console.log(result.error);
}
```

### API Response Types

```typescript
// Define API response types
interface ApiResponse<T> {
  data: T;
  meta: {
    timestamp: string;
    requestId: string;
  };
}

interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    hasMore: boolean;
  };
}

// Type-safe fetch wrapper
async function fetchApi<T>(url: string): Promise<ApiResponse<T>> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}

// Usage
const { data: user } = await fetchApi<User>('/api/users/1');
// user is typed as User
```

---

## Anti-patterns

### Using `any`

```typescript
// BAD
function processData(data: any) {
  return data.foo.bar; // No type safety
}

// GOOD - Use unknown and narrow
function processData(data: unknown) {
  if (isValidData(data)) {
    return data.foo.bar; // Type-safe after guard
  }
  throw new Error('Invalid data');
}
```

### Non-null Assertion Abuse

```typescript
// BAD - Hiding potential null
const name = user!.name;

// GOOD - Handle the null case
const name = user?.name ?? 'Unknown';

// Or throw explicitly
if (!user) throw new Error('User required');
const name = user.name;
```

### Type Casting Instead of Guards

```typescript
// BAD - Lying to TypeScript
const user = data as User;

// GOOD - Validate at runtime
const user = UserSchema.parse(data);
// or
if (!isUser(data)) throw new Error('Invalid user');
const user = data;
```

### Ignoring Strictness

```typescript
// BAD
// @ts-ignore
const value = thing.property;

// GOOD - Fix the actual issue
const value = thing?.property;
```

---

## Gotchas

### 1. Objects Are Mutable by Default

```typescript
const user = { name: 'John' };
user.name = 'Jane'; // Allowed!

// Use readonly for immutability
const user: Readonly<User> = { name: 'John' };
user.name = 'Jane'; // Error!
```

### 2. Array Index Access Can Be Undefined

```typescript
// With noUncheckedIndexedAccess: true
const arr = [1, 2, 3];
const first = arr[0]; // Type: number | undefined

// Handle it
const first = arr[0];
if (first !== undefined) {
  console.log(first * 2);
}

// Or use assertion after checking length
if (arr.length > 0) {
  const first = arr[0]!; // Safe here
}
```

### 3. Object.keys Returns string[]

```typescript
const user = { name: 'John', age: 30 };
Object.keys(user); // Type: string[], not ('name' | 'age')[]

// Type-safe iteration
(Object.keys(user) as Array<keyof typeof user>).forEach(key => {
  console.log(user[key]); // Works
});

// Or use Object.entries
Object.entries(user).forEach(([key, value]) => {
  console.log(key, value);
});
```

### 4. Excess Property Checking Only on Literals

```typescript
interface User { name: string }

// Error - excess property
const user: User = { name: 'John', age: 30 }; // Error!

// No error - assigned from variable
const data = { name: 'John', age: 30 };
const user: User = data; // No error!
```

### 5. Function Parameter Bivariance

```typescript
// This is allowed but can cause runtime errors
interface Handler {
  (event: MouseEvent): void;
}

// This handler expects more specific event
const handler: Handler = (event: KeyboardEvent) => {
  event.key; // Runtime error if passed MouseEvent!
};
```

---

## Checkpoints

Before marking a TypeScript task complete:

- [ ] No `any` types (use `unknown` if truly unknown)
- [ ] No non-null assertions (`!`) without validation
- [ ] No `@ts-ignore` or `@ts-expect-error` without comment
- [ ] Strict mode enabled in tsconfig
- [ ] Types exported from a central location
- [ ] Zod schemas for external data validation
- [ ] Generic functions properly constrained

---

## Escape Hatches

### When types are truly impossible
```typescript
// Document WHY and use ts-expect-error
// @ts-expect-error - Library types don't match runtime behavior
const result = weirdLibraryFunction();
```

### When dealing with legacy code
- Add types incrementally
- Use `unknown` instead of `any`
- Create type guards for existing data

### When third-party types are wrong
- Create declaration file (`.d.ts`) with overrides
- Use module augmentation
- Report issue to DefinitelyTyped

---

## Squad Dependencies

Often paired with:
- `supabase-backend` for database types
- `api-design` for API type contracts
- `crud-builder` for form types
- `react-patterns` for component props

---

*Last updated: 2025-12-11*
