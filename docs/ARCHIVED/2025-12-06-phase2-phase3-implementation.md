# VibeShip Orchestrator Phase 2 & 3 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add GitHub OAuth for authenticated gists, intelligent recommendations engine, and custom skill generation flagging.

**Architecture:**
- Phase 2 adds GitHub OAuth flow using SvelteKit server routes, storing tokens in localStorage, and creating authenticated gists on user's account
- Phase 3 adds a rules-based intelligence layer that analyzes project descriptions and recommends agents/MCPs/behaviors with explanations
- Custom skill flagging marks skills not in catalog for generation during CLI init

**Tech Stack:** SvelteKit, TypeScript, GitHub OAuth API, localStorage for auth tokens

---

## Phase 2: GitHub OAuth + Authenticated Gists

### Task 1: Create GitHub OAuth Configuration

**Files:**
- Create: `web/src/lib/config/github.ts`

**Step 1: Write the configuration file**

```typescript
// web/src/lib/config/github.ts
export const GITHUB_CONFIG = {
  clientId: import.meta.env.VITE_GITHUB_CLIENT_ID || '',
  redirectUri: import.meta.env.VITE_GITHUB_REDIRECT_URI || 'http://localhost:5174/auth/callback',
  scope: 'gist',
  authUrl: 'https://github.com/login/oauth/authorize'
};

export function getAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: GITHUB_CONFIG.clientId,
    redirect_uri: GITHUB_CONFIG.redirectUri,
    scope: GITHUB_CONFIG.scope,
    state
  });
  return `${GITHUB_CONFIG.authUrl}?${params.toString()}`;
}
```

**Step 2: Create environment file template**

Create: `web/.env.example`
```
VITE_GITHUB_CLIENT_ID=your_github_oauth_app_client_id
VITE_GITHUB_REDIRECT_URI=http://localhost:5174/auth/callback
```

**Step 3: Commit**

```bash
git add web/src/lib/config/github.ts web/.env.example
git commit -m "feat: add GitHub OAuth configuration"
```

---

### Task 2: Create Auth Store

**Files:**
- Create: `web/src/lib/stores/auth.ts`

**Step 1: Write the auth store**

```typescript
// web/src/lib/stores/auth.ts
import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

export interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string | null;
}

export interface AuthState {
  token: string | null;
  user: GitHubUser | null;
}

function createAuthStore() {
  // Load from localStorage on init
  const initial: AuthState = {
    token: browser ? localStorage.getItem('github_token') : null,
    user: browser ? JSON.parse(localStorage.getItem('github_user') || 'null') : null
  };

  const { subscribe, set, update } = writable<AuthState>(initial);

  return {
    subscribe,
    login: (token: string, user: GitHubUser) => {
      if (browser) {
        localStorage.setItem('github_token', token);
        localStorage.setItem('github_user', JSON.stringify(user));
      }
      set({ token, user });
    },
    logout: () => {
      if (browser) {
        localStorage.removeItem('github_token');
        localStorage.removeItem('github_user');
      }
      set({ token: null, user: null });
    }
  };
}

export const auth = createAuthStore();
export const isAuthenticated = derived(auth, $auth => !!$auth.token);
export const currentUser = derived(auth, $auth => $auth.user);
```

**Step 2: Commit**

```bash
git add web/src/lib/stores/auth.ts
git commit -m "feat: add GitHub auth store with localStorage persistence"
```

---

### Task 3: Create OAuth Callback Route

**Files:**
- Create: `web/src/routes/auth/callback/+page.svelte`
- Create: `web/src/routes/auth/callback/+page.server.ts`

**Step 1: Write the server-side token exchange**

```typescript
// web/src/routes/auth/callback/+page.server.ts
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ url, fetch }) => {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');

  if (error) {
    throw redirect(302, `/summary?error=${encodeURIComponent(error)}`);
  }

  if (!code) {
    throw redirect(302, '/summary?error=no_code');
  }

  // Note: In production, token exchange should happen server-side
  // For now, we pass the code to the client to complete the flow
  // A proper implementation would use a backend or serverless function

  return {
    code,
    state
  };
};
```

**Step 2: Write the callback page component**

```svelte
<!-- web/src/routes/auth/callback/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth';

  export let data;

  onMount(async () => {
    // In a real implementation, you'd exchange the code for a token
    // This requires a backend since GitHub doesn't support CORS for token exchange
    // For demo purposes, show instructions

    const storedState = sessionStorage.getItem('oauth_state');
    if (data.state !== storedState) {
      goto('/summary?error=state_mismatch');
      return;
    }

    // Show message about needing backend for token exchange
    // In production, this would call your backend API
    goto('/summary?oauth=pending&code=' + data.code);
  });
</script>

<main class="callback">
  <div class="loading">
    <p>Completing authentication...</p>
  </div>
</main>

<style>
  .callback {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loading {
    text-align: center;
    color: var(--text-secondary);
  }
</style>
```

**Step 3: Commit**

```bash
git add web/src/routes/auth/callback/
git commit -m "feat: add OAuth callback route for GitHub authentication"
```

---

### Task 4: Update Gist Service for Authenticated Requests

**Files:**
- Modify: `web/src/lib/services/gist.ts`

**Step 1: Add authenticated gist creation**

```typescript
// Add to web/src/lib/services/gist.ts

/**
 * Create an authenticated GitHub Gist (on user's account)
 */
export async function createAuthenticatedGist(config: GistConfig, token: string): Promise<GistResponse> {
  const content = JSON.stringify(config, null, 2);

  const response = await fetch('https://api.github.com/gists', {
    method: 'POST',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      description: `VibeShip config for ${config.project_name}`,
      public: false,
      files: {
        'vibeship-config.json': {
          content
        }
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create gist: ${response.status} ${error}`);
  }

  return response.json();
}

/**
 * Fetch GitHub user info
 */
export async function fetchGitHubUser(token: string) {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch user info');
  }

  return response.json();
}
```

**Step 2: Commit**

```bash
git add web/src/lib/services/gist.ts
git commit -m "feat: add authenticated gist creation and user fetch"
```

---

### Task 5: Update Summary Page with Auth Options

**Files:**
- Modify: `web/src/routes/summary/+page.svelte`

**Step 1: Add auth import and state**

Add to the `<script>` section after existing imports:

```typescript
import { auth, isAuthenticated, currentUser } from '$lib/stores/auth';
import { createAuthenticatedGist } from '$lib/services/gist';
import { getAuthUrl } from '$lib/config/github';
```

**Step 2: Add auth-aware export options**

Replace the export options section with:

```svelte
<!-- Export Options -->
<div class="section">
  <h2 class="section-title">Export</h2>

  <div class="export-options">
    <button
      class="export-option"
      class:selected={exportFormat === 'gist'}
      onclick={() => exportFormat = 'gist'}
    >
      <div class="option-icon">
        <Icon name="zap" size={24} />
      </div>
      <div class="option-info">
        <h3>Quick Export</h3>
        <p>Anonymous gist (no login)</p>
      </div>
    </button>

    <button
      class="export-option"
      class:selected={exportFormat === 'github'}
      onclick={() => exportFormat = 'github'}
    >
      <div class="option-icon">
        <Icon name="github" size={24} />
      </div>
      <div class="option-info">
        <h3>Save to GitHub</h3>
        <p>{$isAuthenticated ? `Signed in as ${$currentUser?.login}` : 'Login to save to your account'}</p>
      </div>
    </button>

    <button
      class="export-option"
      class:selected={exportFormat === 'download'}
      onclick={() => exportFormat = 'download'}
    >
      <div class="option-icon">
        <Icon name="download" size={24} />
      </div>
      <div class="option-info">
        <h3>Download</h3>
        <p>Save JSON file locally</p>
      </div>
    </button>
  </div>
</div>
```

**Step 3: Commit**

```bash
git add web/src/routes/summary/+page.svelte
git commit -m "feat: add GitHub auth export option to summary page"
```

---

## Phase 3: Intelligent Recommendations

### Task 6: Create Recommendation Engine

**Files:**
- Create: `web/src/lib/services/intelligence.ts`

**Step 1: Write the recommendation rules engine**

```typescript
// web/src/lib/services/intelligence.ts

export interface Recommendation {
  type: 'agent' | 'mcp' | 'behavior';
  id: string;
  reason: string;
  required?: boolean;
}

export interface CustomSkillFlag {
  name: string;
  reason: string;
}

export interface IntelligenceResult {
  recommendations: Recommendation[];
  customSkillsNeeded: CustomSkillFlag[];
}

interface Rule {
  keywords: string[];
  agents?: string[];
  mcps?: string[];
  behaviors?: string[];
  customSkill?: string;
  reason: string;
}

const RULES: Rule[] = [
  // Marketplace patterns
  {
    keywords: ['marketplace', 'buy', 'sell', 'listings', 'e-commerce', 'ecommerce', 'shop', 'store'],
    agents: ['payments', 'search'],
    mcps: ['stripe', 'algolia'],
    behaviors: ['tdd-mode'],
    reason: 'Marketplaces need payment processing and search'
  },
  // AI patterns
  {
    keywords: ['ai', 'llm', 'gpt', 'claude', 'chatbot', 'assistant', 'embeddings', 'vector'],
    agents: ['ai'],
    mcps: ['anthropic'],
    reason: 'AI features require LLM integration'
  },
  // Real-time patterns
  {
    keywords: ['real-time', 'realtime', 'live', 'websocket', 'chat', 'collaborative'],
    customSkill: 'websockets',
    reason: 'Real-time features need WebSocket handling'
  },
  // Auth patterns
  {
    keywords: ['auth', 'login', 'signup', 'user', 'account', 'profile'],
    agents: ['backend'],
    mcps: ['supabase'],
    reason: 'User accounts require authentication'
  },
  // Payment patterns
  {
    keywords: ['payment', 'checkout', 'subscription', 'billing', 'pricing', 'premium'],
    agents: ['payments'],
    mcps: ['stripe'],
    behaviors: ['tdd-mode'],
    reason: 'Payment handling is critical and needs testing'
  },
  // Email patterns
  {
    keywords: ['email', 'notification', 'newsletter', 'invite', 'welcome'],
    agents: ['email'],
    mcps: ['resend'],
    reason: 'Email features need transactional email service'
  },
  // Search patterns
  {
    keywords: ['search', 'filter', 'find', 'browse', 'discover'],
    agents: ['search'],
    mcps: ['algolia'],
    reason: 'Search functionality benefits from dedicated search service'
  },
  // Database patterns
  {
    keywords: ['data', 'database', 'store', 'save', 'persist', 'crud'],
    agents: ['database'],
    mcps: ['supabase'],
    reason: 'Data persistence requires database setup'
  },
  // Web3 patterns
  {
    keywords: ['web3', 'blockchain', 'crypto', 'nft', 'token', 'wallet', 'smart contract', 'solidity'],
    agents: ['smart-contracts'],
    mcps: ['foundry'],
    reason: 'Blockchain features require smart contract development'
  },
  // Testing patterns
  {
    keywords: ['enterprise', 'production', 'scale', 'reliable', 'robust'],
    behaviors: ['tdd-mode', 'commit-per-task'],
    reason: 'Production apps benefit from rigorous testing'
  },
  // API patterns
  {
    keywords: ['api', 'rest', 'graphql', 'endpoint', 'backend'],
    agents: ['backend'],
    reason: 'API development needs backend expertise'
  },
  // Dashboard patterns
  {
    keywords: ['dashboard', 'admin', 'analytics', 'metrics', 'charts'],
    agents: ['frontend', 'backend'],
    reason: 'Dashboards need frontend visualization and backend data'
  }
];

export function analyzeProject(
  description: string,
  currentAgents: string[],
  currentMcps: string[]
): IntelligenceResult {
  const lowerDesc = description.toLowerCase();
  const recommendations: Recommendation[] = [];
  const customSkillsNeeded: CustomSkillFlag[] = [];
  const seen = new Set<string>();

  for (const rule of RULES) {
    const matches = rule.keywords.some(kw => lowerDesc.includes(kw));
    if (!matches) continue;

    // Add agent recommendations
    if (rule.agents) {
      for (const agent of rule.agents) {
        if (!currentAgents.includes(agent) && !seen.has(`agent:${agent}`)) {
          seen.add(`agent:${agent}`);
          recommendations.push({
            type: 'agent',
            id: agent,
            reason: rule.reason
          });
        }
      }
    }

    // Add MCP recommendations
    if (rule.mcps) {
      for (const mcp of rule.mcps) {
        if (!currentMcps.includes(mcp) && !seen.has(`mcp:${mcp}`)) {
          seen.add(`mcp:${mcp}`);
          recommendations.push({
            type: 'mcp',
            id: mcp,
            reason: rule.reason
          });
        }
      }
    }

    // Add behavior recommendations
    if (rule.behaviors) {
      for (const behavior of rule.behaviors) {
        if (!seen.has(`behavior:${behavior}`)) {
          seen.add(`behavior:${behavior}`);
          recommendations.push({
            type: 'behavior',
            id: behavior,
            reason: rule.reason
          });
        }
      }
    }

    // Flag custom skills
    if (rule.customSkill && !seen.has(`skill:${rule.customSkill}`)) {
      seen.add(`skill:${rule.customSkill}`);
      customSkillsNeeded.push({
        name: rule.customSkill,
        reason: rule.reason
      });
    }
  }

  return { recommendations, customSkillsNeeded };
}
```

**Step 2: Commit**

```bash
git add web/src/lib/services/intelligence.ts
git commit -m "feat: add intelligent recommendations engine with rules"
```

---

### Task 7: Create Recommendations Component

**Files:**
- Create: `web/src/lib/components/Recommendations.svelte`

**Step 1: Write the recommendations component**

```svelte
<!-- web/src/lib/components/Recommendations.svelte -->
<script lang="ts">
  import Icon from './Icon.svelte';
  import type { Recommendation, CustomSkillFlag } from '$lib/services/intelligence';

  interface Props {
    recommendations: Recommendation[];
    customSkillsNeeded: CustomSkillFlag[];
    onAddAgent: (id: string) => void;
    onAddMcp: (id: string) => void;
    onToggleBehavior: (id: string) => void;
  }

  let { recommendations, customSkillsNeeded, onAddAgent, onAddMcp, onToggleBehavior }: Props = $props();

  function handleAdd(rec: Recommendation) {
    if (rec.type === 'agent') {
      onAddAgent(rec.id);
    } else if (rec.type === 'mcp') {
      onAddMcp(rec.id);
    } else if (rec.type === 'behavior') {
      onToggleBehavior(rec.id);
    }
  }

  function getIcon(type: string): string {
    switch (type) {
      case 'agent': return 'user';
      case 'mcp': return 'plug';
      case 'behavior': return 'shield';
      default: return 'zap';
    }
  }

  function getTypeLabel(type: string): string {
    switch (type) {
      case 'agent': return 'Agent';
      case 'mcp': return 'MCP';
      case 'behavior': return 'Behavior';
      default: return type;
    }
  }
</script>

{#if recommendations.length > 0 || customSkillsNeeded.length > 0}
  <div class="recommendations">
    <div class="rec-header">
      <Icon name="sparkles" size={16} />
      <h3>Recommended for your project</h3>
    </div>

    {#if recommendations.length > 0}
      <div class="rec-list">
        {#each recommendations as rec}
          <div class="rec-item">
            <div class="rec-info">
              <span class="rec-type">{getTypeLabel(rec.type)}</span>
              <span class="rec-name">{rec.id}</span>
              <span class="rec-reason">{rec.reason}</span>
            </div>
            <button class="rec-add" onclick={() => handleAdd(rec)}>
              <Icon name="plus" size={14} />
              Add
            </button>
          </div>
        {/each}
      </div>
    {/if}

    {#if customSkillsNeeded.length > 0}
      <div class="custom-skills">
        <h4>Custom skills needed</h4>
        <p class="custom-note">These will be generated during project setup</p>
        {#each customSkillsNeeded as skill}
          <div class="skill-item">
            <Icon name="zap" size={14} />
            <span class="skill-name">{skill.name}</span>
            <span class="skill-reason">{skill.reason}</span>
          </div>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  .recommendations {
    background: var(--bg-secondary);
    border: 1px solid var(--green-dim);
    padding: var(--space-4);
    margin-bottom: var(--space-6);
  }

  .rec-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--green-dim);
    margin-bottom: var(--space-4);
  }

  .rec-header h3 {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    margin: 0;
  }

  .rec-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .rec-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-3);
    background: var(--bg-primary);
    border: 1px solid var(--border);
  }

  .rec-info {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
  }

  .rec-type {
    font-size: var(--text-xs);
    text-transform: uppercase;
    color: var(--text-tertiary);
    background: var(--bg-tertiary);
    padding: 2px 6px;
  }

  .rec-name {
    font-family: var(--font-mono);
    font-weight: 600;
    color: var(--text-primary);
  }

  .rec-reason {
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }

  .rec-add {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-sm);
    background: transparent;
    border: 1px solid var(--green-dim);
    color: var(--green-dim);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .rec-add:hover {
    background: var(--green-dim);
    color: var(--bg-primary);
  }

  .custom-skills {
    margin-top: var(--space-4);
    padding-top: var(--space-4);
    border-top: 1px solid var(--border);
  }

  .custom-skills h4 {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-primary);
    margin: 0 0 var(--space-1);
  }

  .custom-note {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    margin: 0 0 var(--space-3);
  }

  .skill-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2);
    color: var(--orange);
  }

  .skill-name {
    font-family: var(--font-mono);
    font-weight: 600;
  }

  .skill-reason {
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }
</style>
```

**Step 2: Commit**

```bash
git add web/src/lib/components/Recommendations.svelte
git commit -m "feat: add Recommendations component for intelligent suggestions"
```

---

### Task 8: Integrate Recommendations into Builder Page

**Files:**
- Modify: `web/src/routes/builder/+page.svelte`

**Step 1: Add intelligence imports**

Add to the `<script>` section:

```typescript
import Recommendations from '$lib/components/Recommendations.svelte';
import { analyzeProject, type IntelligenceResult } from '$lib/services/intelligence';
```

**Step 2: Add intelligence state and effect**

Add after imports:

```typescript
let intelligence = $state<IntelligenceResult>({ recommendations: [], customSkillsNeeded: [] });

$effect(() => {
  if ($projectDescription) {
    intelligence = analyzeProject($projectDescription, $selectedAgents, $selectedMcps);
  }
});

function handleToggleBehavior(id: string) {
  // For now, just log - behaviors are handled on summary page
  console.log('Behavior suggested:', id);
}
```

**Step 3: Add Recommendations component to template**

Add after the builder-header, before builder-content:

```svelte
{#if intelligence.recommendations.length > 0 || intelligence.customSkillsNeeded.length > 0}
  <div class="recommendations-container">
    <Recommendations
      recommendations={intelligence.recommendations}
      customSkillsNeeded={intelligence.customSkillsNeeded}
      onAddAgent={addAgent}
      onAddMcp={addMcp}
      onToggleBehavior={handleToggleBehavior}
    />
  </div>
{/if}
```

**Step 4: Add styles**

```css
.recommendations-container {
  padding: 0 var(--space-8);
  max-width: 1600px;
  margin: 0 auto;
}
```

**Step 5: Commit**

```bash
git add web/src/routes/builder/+page.svelte
git commit -m "feat: integrate intelligent recommendations into builder page"
```

---

### Task 9: Update Stack Store to Track Custom Skills

**Files:**
- Modify: `web/src/lib/stores/stack.ts`

**Step 1: Add custom skills store**

Add to the stores section:

```typescript
export const customSkillsNeeded = writable<string[]>([]);
```

**Step 2: Add function to update custom skills**

```typescript
export function setCustomSkills(skills: string[]) {
  customSkillsNeeded.set(skills);
}
```

**Step 3: Update resetStack function**

```typescript
export function resetStack() {
  projectName.set('');
  projectDescription.set('');
  selectedTemplate.set(null);
  selectedAgents.set(['planner']);
  selectedMcps.set(['filesystem']);
  discoveryAnswers.set([]);
  customSkillsNeeded.set([]);
  currentStep.set(1);
}
```

**Step 4: Commit**

```bash
git add web/src/lib/stores/stack.ts
git commit -m "feat: add custom skills tracking to stack store"
```

---

### Task 10: Update Gist Service to Include Custom Skills

**Files:**
- Modify: `web/src/lib/services/gist.ts`

**Step 1: Update buildConfig function**

Update the function signature and body:

```typescript
export function buildConfig(
  projectName: string,
  description: string,
  discovery: Record<string, string>,
  agents: string[],
  mcps: string[],
  selectedBehaviors: string[] = [],
  customSkillsNeeded: string[] = []
): GistConfig {
  return {
    project_name: projectName || 'my-project',
    description: description || '',
    discovery,
    agents,
    mcps,
    behaviors: {
      mandatory: [
        'verify-before-complete',
        'follow-architecture',
        'one-task-at-a-time',
        'maintainable-code',
        'secure-code'
      ],
      selected: selectedBehaviors
    },
    custom_skills_needed: customSkillsNeeded,
    generated_at: new Date().toISOString()
  };
}
```

**Step 2: Commit**

```bash
git add web/src/lib/services/gist.ts
git commit -m "feat: include custom skills in gist config"
```

---

### Task 11: Update Summary Page to Pass Custom Skills

**Files:**
- Modify: `web/src/routes/summary/+page.svelte`

**Step 1: Import custom skills store**

Add to imports:

```typescript
import { customSkillsNeeded as customSkillsStore } from '$lib/stores/stack';
```

**Step 2: Update generateConfig function**

```typescript
function generateConfig(): GistConfig {
  const discovery: Record<string, string> = {};
  $discoveryAnswers.forEach(a => {
    discovery[a.question] = a.answer;
  });

  return buildConfig(
    projectNameInput,
    $projectDescription,
    discovery,
    $selectedAgents,
    $selectedMcps,
    selectedBehaviors,
    $customSkillsStore
  );
}
```

**Step 3: Add custom skills display in stack overview**

Add after the MCPs row:

```svelte
{#if $customSkillsStore.length > 0}
  <div class="custom-skills-row">
    <span class="label">Custom skills:</span>
    {#each $customSkillsStore as skill}
      <div class="skill-chip">
        <Icon name="zap" size={14} />
        <span>{skill}</span>
      </div>
    {/each}
  </div>
{/if}
```

**Step 4: Add styles**

```css
.custom-skills-row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-3);
}

.custom-skills-row .label {
  font-size: var(--text-xs);
  color: var(--text-tertiary);
  text-transform: uppercase;
}

.skill-chip {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  background: rgba(255, 176, 32, 0.1);
  border: 1px solid var(--orange);
  font-size: var(--text-xs);
  color: var(--orange);
}
```

**Step 5: Commit**

```bash
git add web/src/routes/summary/+page.svelte
git commit -m "feat: display and include custom skills in export"
```

---

### Task 12: Update Builder to Sync Custom Skills

**Files:**
- Modify: `web/src/routes/builder/+page.svelte`

**Step 1: Import setCustomSkills**

Add to imports:

```typescript
import { setCustomSkills } from '$lib/stores/stack';
```

**Step 2: Update effect to sync custom skills**

```typescript
$effect(() => {
  if ($projectDescription) {
    intelligence = analyzeProject($projectDescription, $selectedAgents, $selectedMcps);
    setCustomSkills(intelligence.customSkillsNeeded.map(s => s.name));
  }
});
```

**Step 3: Commit**

```bash
git add web/src/routes/builder/+page.svelte
git commit -m "feat: sync custom skills from intelligence to store"
```

---

### Task 13: Update CLI to Generate Custom Skills

**Files:**
- Modify: `cli/src/scaffold.js`

**Step 1: Update copySkills function**

Add custom skill placeholder generation:

```javascript
async function copySkills(config, targetDir) {
  // ... existing code for planner and agent skills ...

  // Generate placeholders for custom skills
  if (config.custom_skills_needed && config.custom_skills_needed.length > 0) {
    for (const skillName of config.custom_skills_needed) {
      const skillContent = `# ${skillName.charAt(0).toUpperCase() + skillName.slice(1)} Skill

> Custom skill for ${config.project_name}
> This skill will be fully generated when you start Claude

---

## Status

⚡ **PENDING GENERATION**

This skill was flagged as needed for your project but doesn't exist in the catalog.
When you run \`claude\`, the planner will generate this skill based on your project needs.

---

## Expected Capabilities

Based on your project description, this skill should handle:
- [To be determined by planner]

---

*Auto-generated placeholder by VibeShip CLI*
`;

      await fs.writeFile(path.join(targetDir, 'skills', `${skillName}.md`), skillContent);
    }
  }
}
```

**Step 2: Commit**

```bash
git add cli/src/scaffold.js
git commit -m "feat: generate custom skill placeholders in CLI"
```

---

### Task 14: Final Integration Test

**Step 1: Start dev server**

```bash
cd web && npm run dev
```

**Step 2: Test the full flow**

1. Go to http://localhost:5174
2. Enter: "A marketplace for vintage watches with search and payments"
3. Go through discovery
4. On builder page, verify recommendations appear:
   - payments agent
   - search agent
   - stripe MCP
   - algolia MCP
5. Click "Add" on recommendations
6. Continue to summary
7. Select "Build Discipline" options
8. Export to gist
9. Copy the command
10. Run: `npx vibeship init <gist-id>` (from cli folder for testing)
11. Verify custom skills are listed in output
12. Check scaffolded project has skill placeholders

**Step 3: Final commit**

```bash
git add -A
git commit -m "feat: complete Phase 2 & 3 - OAuth prep, intelligence, custom skills"
```

---

## Summary

### Phase 2 Deliverables
- GitHub OAuth configuration (ready for backend token exchange)
- Auth store with localStorage persistence
- Authenticated gist creation function
- Export options for anonymous vs authenticated

### Phase 3 Deliverables
- Rules-based intelligence engine
- Recommendations component
- Integration in builder page
- Custom skills tracking in store
- Custom skills in export config
- CLI generates skill placeholders

### Note on GitHub OAuth
Full OAuth requires a backend for token exchange (GitHub doesn't support CORS for the token endpoint). The implementation provides:
- Client-side OAuth flow initiation
- Callback route ready for token handling
- Authenticated gist function ready to use once token is obtained

For production, you'll need either:
- A serverless function (Vercel/Netlify) to handle token exchange
- A backend API endpoint
