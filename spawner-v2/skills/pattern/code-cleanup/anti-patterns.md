# Anti-Patterns: Code Cleanup

Common mistakes that turn cleanup into chaos.

---

## 1. The Big Bang Cleanup

**The Mistake:**
```bash
# "I'll just clean up everything at once"
git add -A
git commit -m "Major cleanup"
# 2000 files changed, 50000 insertions, 48000 deletions
```

**Why It's Wrong:**
- Can't revert specific changes
- Can't bisect to find what broke
- Reviewers can't meaningfully review
- Merge conflicts with everyone
- High risk of introducing bugs

**The Fix:**
One commit per category, one category per session:
```bash
git commit -m "chore: remove unused imports in src/components"
git commit -m "chore: organize imports in src/hooks"
git commit -m "chore: remove dead code in src/utils"
```

---

## 2. Cleanup Without Baseline

**The Mistake:**
```bash
# Start cleaning without checking if it builds
vim src/index.ts
# Make changes
npm run build
# ERROR: Cannot find module...
# Was this your change or pre-existing?
```

**Why It's Wrong:**
- No proof changes caused the break
- Wasted debugging time
- False confidence in changes

**The Fix:**
```bash
# Always establish baseline first
npm run build     # Must pass
npm run test      # Must pass
npm run lint      # Note existing issues

# Now make changes
# Re-run all three after
```

---

## 3. IDE-Driven Deletion

**The Mistake:**
```typescript
// IDE says "0 references" - delete it!
export function helperFunction() {
  // This is used via dynamic import
  // Or re-exported from index.ts
  // Or used in test files
  // Or used by external consumers
}
```

**Why It's Wrong:**
- IDE only sees direct imports in open tsconfig
- Misses dynamic imports
- Misses test file usage
- Misses re-exports
- Misses external consumers

**The Fix:**
```bash
# Verify with grep, not IDE
grep -r "helperFunction" --include="*.ts" --include="*.tsx"
grep -r "helperFunction" --include="*.test.ts"
grep -r "from.*utils" --include="*.ts"  # Check re-exports
```

---

## 4. Mixing Cleanup with Features

**The Mistake:**
```bash
git commit -m "Add user profile + cleanup imports + fix types"
# Three unrelated things in one commit
```

**Why It's Wrong:**
- Can't revert cleanup without losing feature
- Can't revert feature without losing cleanup
- Review is confusing
- Blame history is meaningless

**The Fix:**
```bash
# Feature branch
git commit -m "feat: add user profile"

# Cleanup branch (separate PR)
git commit -m "chore: organize imports"
git commit -m "chore: fix type annotations"
```

---

## 5. Auto-Fix Everything

**The Mistake:**
```bash
# "Let's just auto-fix all lint errors"
npm run lint --fix
# 500 files modified
# Silent failures everywhere
```

**Why It's Wrong:**
- Some auto-fixes change behavior
- Import ordering can break side effects
- Type coercion fixes can mask bugs
- Too many changes to review

**The Fix:**
```bash
# Fix one rule at a time
npm run lint --fix --rule no-unused-vars
git commit -m "chore: remove unused variables"

npm run lint --fix --rule import/order
# Review changes carefully for side effects
git commit -m "chore: organize imports"
```

---

## 6. Removing "Unused" Without Verification

**The Mistake:**
```typescript
// Analysis says this is unused
export interface LegacyUser {
  // Used by external service
  // Used by database migration
  // Used by type inference elsewhere
}
// Deleted! Now external service breaks
```

**Why It's Wrong:**
- Static analysis has blind spots
- Types can be used for inference without direct import
- External systems may depend on exports
- Runtime behavior differs from static analysis

**The Fix:**
1. Comment out instead of delete
2. Deploy to staging
3. Monitor for errors
4. Wait at least one release cycle
5. Then delete

---

## 7. Renaming Without Find-Replace All

**The Mistake:**
```typescript
// Rename for "consistency"
- export function getData()
+ export function fetchData()

// But missed the usage in another file
import { getData } from './utils';  // Still uses old name
```

**Why It's Wrong:**
- IDE rename misses dynamic references
- Misses string references in tests
- Misses documentation
- Misses configuration files

**The Fix:**
```bash
# Use comprehensive search
grep -r "getData" --include="*.ts" --include="*.tsx" --include="*.md" --include="*.json"

# Or use codemod tools
npx jscodeshift -t rename-transform.js
```

---

## 8. Cleanup in Main Branch

**The Mistake:**
```bash
# Making cleanup changes directly in main
git checkout main
# ... make changes ...
git push origin main
# Oops, broke the build for everyone
```

**Why It's Wrong:**
- No PR review
- No CI validation
- Everyone affected immediately
- Hard to revert cleanly

**The Fix:**
```bash
git checkout -b cleanup/organize-imports
# ... make changes ...
git push origin cleanup/organize-imports
# Create PR, get review, merge after CI passes
```

---

## 9. Trusting "No References" for Types

**The Mistake:**
```typescript
// "0 references" - delete it!
export interface UserResponse {
  id: string;
  name: string;
}

// Actually used for type inference
function getUser(): UserResponse {  // Return type inferred
  return api.get('/user');
}
```

**Why It's Wrong:**
- Types are used for inference without explicit import
- Return types may reference types implicitly
- Generic constraints may reference types
- Declaration merging may use types

**The Fix:**
- Search for type name as string, not just imports
- Check function return types
- Check generic constraints
- Keep types that match API response shapes

---

## 10. Deleting "Dead" Feature Flags

**The Mistake:**
```typescript
// Flag is always true now, delete it!
- if (FEATURE_FLAGS.NEW_DASHBOARD) {
-   return <NewDashboard />;
- }
- return <OldDashboard />;
+ return <NewDashboard />;

// But flag is controlled by remote config
// And some users still have it disabled
```

**Why It's Wrong:**
- Feature flags may be controlled externally
- Gradual rollouts need the flag
- Rollback capability lost
- Some users intentionally on old version

**The Fix:**
1. Verify flag is 100% rolled out in all environments
2. Verify no users need old behavior
3. Remove flag evaluation, keep both code paths
4. Wait one release cycle
5. Then remove old code path
