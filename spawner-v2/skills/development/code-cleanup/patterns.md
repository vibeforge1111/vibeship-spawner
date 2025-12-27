# Patterns: Code Cleanup

Best practices for systematic code cleanup that doesn't break things.

---

## 1. The Safe Cleanup Pipeline

Always follow this order. Each step validates the previous.

```
1. Build       → Verify starting state works
2. Lint        → Identify candidates
3. Change      → Make one category of change
4. Build       → Verify still works
5. Test        → Verify behavior unchanged
6. Commit      → Atomic, revertible change
7. Repeat      → Next category
```

**Why This Order:**
- Build first proves baseline works (not your fault if it doesn't)
- Lint identifies low-risk targets
- One category at a time = easy reverts
- Build after each change catches breaks immediately
- Test confirms behavior unchanged
- Atomic commits allow surgical reverts

---

## 2. Import Organization Pattern

Organize imports into consistent groups with blank line separators:

```typescript
// 1. Side-effect imports (order matters!)
import './polyfills';
import './globals.css';

// 2. External packages (node_modules)
import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import clsx from 'clsx';

// 3. Internal absolute imports (aliases)
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks';
import type { User } from '@/types';

// 4. Relative imports (local to this module)
import { validateForm } from './utils';
import { FormFields } from './FormFields';
import type { FormProps } from './types';
```

**Rules:**
- Side effects at top, never reorder
- Type imports separate or inline (`import type`)
- Sort alphabetically within groups
- Remove unused imports

---

## 3. Dead Code Identification Pattern

Systematic approach to finding dead code:

```bash
# 1. Find unused exports
npx ts-prune

# 2. Find unused files
npx unimported

# 3. Find circular dependencies
npx madge --circular src/

# 4. Find unused dependencies
npx depcheck

# 5. Find duplicate code
npx jscpd src/
```

**Verification before removal:**
```bash
# Search entire codebase
grep -r "symbolName" --include="*.ts" --include="*.tsx"

# Check for dynamic usage
grep -r "import(" --include="*.ts" --include="*.tsx"

# Check test files separately
grep -r "symbolName" --include="*.test.ts" --include="*.spec.ts"
```

---

## 4. Type Improvement Pattern

Progressive type strengthening:

```typescript
// Stage 1: Replace any with unknown
- function process(data: any)
+ function process(data: unknown)

// Stage 2: Add type guards
function process(data: unknown) {
  if (typeof data === 'string') {
    // data is string here
  }
}

// Stage 3: Define specific types
interface ProcessInput {
  type: 'create' | 'update';
  payload: Record<string, unknown>;
}

function process(data: ProcessInput) {
  // Fully typed
}

// Stage 4: Add return types
function process(data: ProcessInput): ProcessResult {
  // Return type explicit
}
```

**Priority:**
1. Function parameters (prevents misuse)
2. Return types (documents contract)
3. Narrow union types (better autocomplete)
4. Remove `as` casts (find root cause instead)

---

## 5. File Splitting Pattern

When a file is too large, split by responsibility:

```
// Before: one big file
components/Dashboard.tsx (800 lines)

// After: split by concern
components/dashboard/
├── index.ts              # Public exports only
├── Dashboard.tsx         # Main component (orchestration)
├── DashboardHeader.tsx   # Header section
├── DashboardStats.tsx    # Stats section
├── DashboardChart.tsx    # Chart section
├── useDashboard.ts       # Data fetching hook
├── dashboard.utils.ts    # Pure utility functions
└── dashboard.types.ts    # Type definitions
```

**Split triggers:**
- File > 300 lines
- Multiple unrelated concerns
- Multiple people editing same file
- Difficult to test in isolation

**Split rules:**
- One component per file
- Hooks in separate files
- Types in separate files
- Utils in separate files
- Index only re-exports

---

## 6. Naming Consistency Pattern

Establish and enforce conventions:

```typescript
// Files
component.tsx       // React components: PascalCase
hook.ts             // Hooks: camelCase, use- prefix
util.ts             // Utilities: camelCase
type.ts             // Types: camelCase
constant.ts         // Constants: camelCase file, UPPER_CASE values

// Variables
const userName = '';           // camelCase
const MAX_RETRIES = 3;        // UPPER_CASE constants
const _internalVar = '';      // _ prefix for intentionally unused

// Functions
function getUserById() {}     // camelCase
async function fetchUser() {} // async implies Promise return

// Types
interface UserProfile {}      // PascalCase
type UserId = string;        // PascalCase
enum UserRole {}             // PascalCase

// React
function UserCard() {}        // PascalCase components
function useUser() {}         // camelCase hooks with use- prefix
```

---

## 7. Comment Cleanup Pattern

Comments to keep vs remove:

**Remove:**
```typescript
// Obvious
i++; // increment i

// Outdated
// TODO: remove this after v2 launch (launched 2 years ago)

// Changelog in code
// Added by John on 2023-01-15 (use git history instead)

// Commented code
// function oldImplementation() { ... }
```

**Keep:**
```typescript
// Why, not what
// Skip validation for admin users per compliance requirement SEC-123

// Non-obvious behavior
// Note: order matters here - polyfills must load before components

// External requirements
// Required by PCI-DSS: mask all but last 4 digits

// Workarounds with context
// HACK: Safari doesn't support X, remove when Safari 17 is min version
```

---

## 8. Incremental Cleanup Pattern

For large codebases, clean incrementally:

```
Week 1: Unused imports (safe, automated)
Week 2: Unused files (higher risk, manual verify)
Week 3: Type improvements (may surface bugs)
Week 4: Naming consistency (cosmetic, low risk)
Week 5: File organization (medium risk)
Week 6: Dead code removal (higher risk)
```

**Per-session approach:**
1. Pick ONE file or ONE category
2. Make changes
3. Full build + test
4. Commit with descriptive message
5. Done for this session

**Never:**
- Clean entire codebase in one commit
- Mix cleanup types in one commit
- Clean and add features in same PR
