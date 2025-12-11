# Sharp Edges: Code Cleanup

Sharp edges are specific gotchas that can bite during code cleanup operations.
Each edge represents knowledge earned through broken builds and reverted commits.

---

## 1. Re-exported Types Look Unused But Aren't

**Severity:** Critical (breaks dependent code)

**The Trap:**
```typescript
// types.ts - Looks unused according to IDE
export interface User {
  id: string;
  name: string;
}

// index.ts
export * from './types';  // User is re-exported here!
```

Removing `User` from types.ts breaks all consumers importing from index.ts.

**Why It Happens:**
IDE "unused" detection only looks at direct imports within the file.
Re-exports create invisible dependency chains.

**The Fix:**
1. Before removing "unused" exports, grep the entire codebase
2. Check all `export * from` and `export { X } from` patterns
3. Search for the symbol name in consuming packages/repos
4. Use `--dry-run` when available

**Detection Pattern:**
`export \* from` or `export { .* } from` in index files

---

## 2. Dynamic Imports Hide Usage

**Severity:** Critical (runtime errors, no build-time warning)

**The Trap:**
```typescript
// Looks unused - no static import anywhere
function loadComponent() {
  return import(`./components/${name}`)  // Dynamic!
}
```

Removing the "unused" component breaks the dynamic import at runtime.

**Why It Happens:**
Static analysis can't resolve dynamic import paths.
Build tools mark files as unused when they're dynamically loaded.

**The Fix:**
1. Search for `import(` patterns before removing files
2. Check for lazy loading patterns: `React.lazy`, `dynamic()`
3. Check route configurations for dynamic segments
4. Preserve files referenced in configuration objects

**Detection Pattern:**
`import\(.*\$\{` or `import\(.*\+`

---

## 3. Removing "Unused" ENV Variables Breaks Production

**Severity:** Critical (production only)

**The Trap:**
```typescript
// Looks unused in code
const API_KEY = process.env.API_KEY;  // Never used in current files

// But it's used in:
// - Build scripts
// - CI/CD pipelines
// - External service configurations
// - Runtime environment
```

**Why It Happens:**
ENV variables often serve purposes outside the main codebase:
- Docker compose files
- Kubernetes secrets
- Terraform configs
- CI scripts

**The Fix:**
1. Check ALL configuration files before removing ENV references
2. Search: Dockerfile, docker-compose.yml, .github/workflows/*
3. Ask: "Is this used by any deployment or build process?"
4. Comment out first, deploy, wait, then remove

**Detection Pattern:**
`process\.env\.|import\.meta\.env\.`

---

## 4. Test Utilities Flagged as Unused

**Severity:** High (breaks test suite)

**The Trap:**
```typescript
// test-utils.ts - "0 references" in IDE
export function renderWithProviders(ui: React.ReactElement) {
  return render(ui, { wrapper: AllProviders });
}

// Used in test files that aren't in tsconfig include
// __tests__/components/*.test.tsx
```

**Why It Happens:**
Test files are often excluded from main tsconfig.
IDE doesn't see test file imports in "unused" analysis.

**The Fix:**
1. Check if there's a separate `tsconfig.test.json`
2. Search test directories: `__tests__/`, `*.test.ts`, `*.spec.ts`
3. Run test suite before confirming removal
4. Check test setup files: `jest.setup.js`, `vitest.config.ts`

**Detection Pattern:**
Files in `__tests__`, `test/`, or `*.test.ts` patterns

---

## 5. Import Organization Breaks Side Effects

**Severity:** High (silent failures)

**The Trap:**
```typescript
// Before "cleanup"
import './polyfills';      // Side effect: adds Array.at()
import './globals.css';    // Side effect: applies styles
import { App } from './app';

// After "organizing" imports - sorted alphabetically
import { App } from './app';  // Now runs BEFORE polyfills!
import './globals.css';
import './polyfills';  // Too late, App already used Array.at()
```

**Why It Happens:**
Import order matters for side-effect imports.
Auto-formatters and import organizers don't understand this.

**The Fix:**
1. Keep side-effect imports at the top, separated by blank line
2. Add eslint-disable for import order on those lines
3. Document why order matters in a comment
4. Consider explicit initialization instead of import side effects

**Detection Pattern:**
`import ['"]\.` (relative side-effect imports)

---

## 6. Barrel Files Create Circular Dependencies When Reorganized

**Severity:** High (build failures or infinite loops)

**The Trap:**
```typescript
// components/index.ts (barrel file)
export * from './Button';
export * from './Modal';
export * from './Form';  // Form imports Button internally

// Reorganizing imports in Form to use barrel
import { Button } from '../components';  // Circular!
```

**Why It Happens:**
Barrel files (`index.ts`) re-export everything from a directory.
Internal components importing from the barrel creates cycles.

**The Fix:**
1. Internal imports should use direct paths, not barrel
2. Only external consumers use barrel imports
3. Use `madge --circular` to detect cycles
4. Consider removing barrel files for large directories

**Detection Pattern:**
Barrel file + internal import from same directory

---

## 7. Removing "Backwards Compat" Code Breaks Consumers

**Severity:** Critical (breaks dependent repos)

**The Trap:**
```typescript
// "Dead code" - was renamed
export const oldFunctionName = newFunctionName;  // Alias

// "Unused export" - type was moved
export type { User } from './new-location';  // Re-export for compat
```

If other repos/packages depend on the old names, removing them breaks semver.

**Why It Happens:**
Internal "unused" doesn't mean external unused.
Published packages need deprecation cycles.

**The Fix:**
1. Check if this is a published package
2. Search dependent repos for the symbol
3. Use `@deprecated` JSDoc before removal
4. Follow semver: removals are breaking changes
5. Keep for at least one major version with deprecation warning

**Detection Pattern:**
Look for explicit alias patterns, re-exports, or `@deprecated` comments

---

## Cleanup Safety Checklist

Before removing ANY code:

1. [ ] Grep entire codebase for the symbol name
2. [ ] Check for dynamic imports and lazy loading
3. [ ] Check barrel files and re-exports
4. [ ] Check test files (may have separate tsconfig)
5. [ ] Check build/deploy scripts
6. [ ] Run full build
7. [ ] Run full test suite
8. [ ] If published: check downstream consumers

**Rule:** If in doubt, comment out and deploy to staging first.
