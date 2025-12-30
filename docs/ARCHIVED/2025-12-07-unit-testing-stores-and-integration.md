# Unit Testing: Stores & Integration Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add comprehensive unit tests for stack store, auth store, and run manual integration test of full flow.

**Architecture:** Pure TypeScript unit tests using Vitest for stores. Manual browser testing for integration.

**Tech Stack:** Vitest, Node test runner (CLI)

---

## Task 1: Test Stack Store - Agent Management

**Files:**
- Create: `web/src/lib/stores/stack.test.ts`

**Step 1: Write the test file**

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import {
  selectedAgents,
  selectedMcps,
  addAgent,
  removeAgent,
  resetStack,
  agents
} from './stack';

describe('Stack Store - Agent Management', () => {
  beforeEach(() => {
    resetStack();
  });

  it('should start with planner agent', () => {
    expect(get(selectedAgents)).toContain('planner');
  });

  it('should add agent to selection', () => {
    addAgent('frontend');
    expect(get(selectedAgents)).toContain('frontend');
  });

  it('should not duplicate agents', () => {
    addAgent('frontend');
    addAgent('frontend');
    const frontendCount = get(selectedAgents).filter(a => a === 'frontend').length;
    expect(frontendCount).toBe(1);
  });

  it('should auto-add required MCPs when adding agent', () => {
    addAgent('devops'); // devops requires filesystem and git
    expect(get(selectedMcps)).toContain('filesystem');
    expect(get(selectedMcps)).toContain('git');
  });

  it('should not remove planner (alwaysIncluded)', () => {
    removeAgent('planner');
    expect(get(selectedAgents)).toContain('planner');
  });

  it('should remove non-required agents', () => {
    addAgent('frontend');
    removeAgent('frontend');
    expect(get(selectedAgents)).not.toContain('frontend');
  });
});
```

**Step 2: Run test to verify**

```bash
cd web && npm run test:run
```

Expected: All 6 tests pass

**Step 3: Commit**

```bash
git add web/src/lib/stores/stack.test.ts
git commit -m "test: add stack store agent management tests"
```

---

## Task 2: Test Stack Store - MCP Management

**Files:**
- Modify: `web/src/lib/stores/stack.test.ts`

**Step 1: Add MCP tests to existing file**

```typescript
describe('Stack Store - MCP Management', () => {
  beforeEach(() => {
    resetStack();
  });

  it('should start with filesystem MCP', () => {
    expect(get(selectedMcps)).toContain('filesystem');
  });

  it('should add MCP to selection', () => {
    addMcp('supabase');
    expect(get(selectedMcps)).toContain('supabase');
  });

  it('should not duplicate MCPs', () => {
    addMcp('supabase');
    addMcp('supabase');
    const count = get(selectedMcps).filter(m => m === 'supabase').length;
    expect(count).toBe(1);
  });

  it('should not remove core MCP (filesystem)', () => {
    removeMcp('filesystem');
    expect(get(selectedMcps)).toContain('filesystem');
  });

  it('should remove non-core MCPs', () => {
    addMcp('stripe');
    removeMcp('stripe');
    expect(get(selectedMcps)).not.toContain('stripe');
  });
});
```

Add to imports: `addMcp, removeMcp`

**Step 2: Run tests**

```bash
cd web && npm run test:run
```

**Step 3: Commit**

```bash
git add web/src/lib/stores/stack.test.ts
git commit -m "test: add stack store MCP management tests"
```

---

## Task 3: Test Stack Store - Template Application

**Files:**
- Modify: `web/src/lib/stores/stack.test.ts`

**Step 1: Add template tests**

```typescript
describe('Stack Store - Templates', () => {
  beforeEach(() => {
    resetStack();
  });

  it('should apply marketplace template', () => {
    applyTemplate('marketplace');
    const agents = get(selectedAgents);
    const mcps = get(selectedMcps);

    expect(agents).toContain('planner');
    expect(agents).toContain('payments');
    expect(agents).toContain('search');
    expect(mcps).toContain('stripe');
    expect(mcps).toContain('algolia');
  });

  it('should apply ai-app template', () => {
    applyTemplate('ai-app');
    const agents = get(selectedAgents);
    const mcps = get(selectedMcps);

    expect(agents).toContain('ai');
    expect(mcps).toContain('anthropic');
  });

  it('should update selectedTemplate store', () => {
    applyTemplate('saas');
    expect(get(selectedTemplate)).toBe('saas');
  });

  it('should do nothing for invalid template', () => {
    const before = get(selectedAgents);
    applyTemplate('nonexistent');
    expect(get(selectedAgents)).toEqual(before);
  });
});
```

Add to imports: `applyTemplate, selectedTemplate`

**Step 2: Run tests**

```bash
cd web && npm run test:run
```

**Step 3: Commit**

```bash
git add web/src/lib/stores/stack.test.ts
git commit -m "test: add stack store template tests"
```

---

## Task 4: Test Stack Store - Recommendations & Custom Skills

**Files:**
- Modify: `web/src/lib/stores/stack.test.ts`

**Step 1: Add recommendations tests**

```typescript
describe('Stack Store - Recommendations', () => {
  beforeEach(() => {
    resetStack();
  });

  it('should update recommendations from project description', () => {
    const result = updateRecommendations('Build a marketplace with payments');

    expect(result.agents.length).toBeGreaterThan(0);
    expect(result.agents.some(a => a.id === 'payments')).toBe(true);
  });

  it('should detect project type', () => {
    updateRecommendations('A SaaS subscription billing dashboard');
    expect(get(detectedProjectType)).toBe('saas');
  });

  it('should populate customSkillsNeeded for realtime features', () => {
    updateRecommendations('Real-time collaborative editor with websockets');
    expect(get(customSkillsNeeded)).toContain('realtime');
  });

  it('should apply all recommendations', () => {
    const result = updateRecommendations('marketplace buy sell payments');
    applyAllRecommendations(result);

    expect(get(selectedAgents)).toContain('payments');
  });
});
```

Add to imports: `updateRecommendations, detectedProjectType, customSkillsNeeded, applyAllRecommendations`

**Step 2: Run tests**

```bash
cd web && npm run test:run
```

**Step 3: Commit**

```bash
git add web/src/lib/stores/stack.test.ts
git commit -m "test: add stack store recommendations tests"
```

---

## Task 5: Test Stack Store - Reset

**Files:**
- Modify: `web/src/lib/stores/stack.test.ts`

**Step 1: Add reset tests**

```typescript
describe('Stack Store - Reset', () => {
  it('should reset all stores to defaults', () => {
    // Setup: modify stores
    addAgent('frontend');
    addAgent('backend');
    addMcp('stripe');
    updateRecommendations('marketplace');

    // Reset
    resetStack();

    // Verify defaults
    expect(get(selectedAgents)).toEqual(['planner']);
    expect(get(selectedMcps)).toEqual(['filesystem']);
    expect(get(customSkillsNeeded)).toEqual([]);
    expect(get(detectedProjectType)).toBe(null);
    expect(get(projectName)).toBe('');
    expect(get(projectDescription)).toBe('');
  });
});
```

Add to imports: `projectName, projectDescription`

**Step 2: Run tests**

```bash
cd web && npm run test:run
```

**Step 3: Commit**

```bash
git add web/src/lib/stores/stack.test.ts
git commit -m "test: add stack store reset tests"
```

---

## Task 6: Test Auth Store

**Files:**
- Create: `web/src/lib/stores/auth.test.ts`

**Step 1: Write auth store tests**

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';

// Mock $app/environment before importing auth
vi.mock('$app/environment', () => ({
  browser: false
}));

import { githubUser, isAuthenticated, clearAuth } from './auth';

describe('Auth Store', () => {
  beforeEach(() => {
    clearAuth();
  });

  it('should start with no user', () => {
    expect(get(githubUser)).toBe(null);
  });

  it('should derive isAuthenticated as false when no user', () => {
    expect(get(isAuthenticated)).toBe(false);
  });

  it('should clear auth state', () => {
    githubUser.set('testuser');
    expect(get(githubUser)).toBe('testuser');

    clearAuth();
    expect(get(githubUser)).toBe(null);
    expect(get(isAuthenticated)).toBe(false);
  });

  it('should derive isAuthenticated as true when user exists', () => {
    githubUser.set('testuser');
    expect(get(isAuthenticated)).toBe(true);
  });
});
```

**Step 2: Run tests**

```bash
cd web && npm run test:run
```

**Step 3: Commit**

```bash
git add web/src/lib/stores/auth.test.ts
git commit -m "test: add auth store tests"
```

---

## Task 7: Manual Integration Test

**No code changes - browser testing**

**Step 1: Start dev server**

```bash
cd web && npm run dev
```

**Step 2: Test full flow in browser**

Open http://localhost:5173 and verify:

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Enter "marketplace for vintage watches with payments and search" | Text appears in input |
| 2 | Click "Start Building" | Navigate to /discovery |
| 3 | Answer discovery questions or skip | Navigate to /builder |
| 4 | Check recommendations banner | Shows: payments agent, search agent, stripe MCP, algolia MCP |
| 5 | Click "Add" on payment recommendation | Payments agent appears in crew |
| 6 | Click "Continue" | Navigate to /summary |
| 7 | Toggle "TDD Mode" in Build Discipline | Checkbox toggles |
| 8 | Check JSON preview | Contains `custom_skills_needed: []` and selected agents |
| 9 | If logged in: Click "Export to GitHub" | Gist created, command shown |
| 10 | Copy command, run in terminal | Project scaffolds correctly |
| 11 | Check `state.json` in scaffolded project | Contains `custom_skills_needed` array |

**Step 3: Test custom skills flow**

Enter description: "Real-time collaborative game with scores and social features"

Verify:
- Recommendations show `game-engine`, `realtime`, `social-features` as custom skills
- After export, `custom_skills_needed` in JSON contains these skills

**Step 4: Document any issues found**

Create issue on GitHub if bugs discovered.

---

## Summary

| Task | Tests | Focus |
|------|-------|-------|
| 1 | 6 | Agent add/remove |
| 2 | 5 | MCP add/remove |
| 3 | 4 | Template application |
| 4 | 4 | Recommendations & custom skills |
| 5 | 1 | Reset functionality |
| 6 | 4 | Auth store |
| 7 | Manual | Full integration |

**Total unit tests: 24 new tests**

After completion, run all tests:

```bash
cd web && npm run test:run
cd ../cli && npm test
```

Expected: 61+ tests passing (30 existing + 24 new + 7 CLI)
