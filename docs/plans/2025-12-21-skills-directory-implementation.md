# Skills Directory Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the skills directory with search, filters, tabbed detail view, task-based finder, and skill creation education.

**Architecture:** SvelteKit pages with Svelte 5 runes, loading skills from YAML via static JSON at build time. Mobile-first responsive design using existing CSS variables.

**Tech Stack:** SvelteKit, Svelte 5, TypeScript, CSS (existing theme variables)

---

## Task 1: Create Skills Data Types and Static Loader

**Files:**
- Create: `web/src/lib/types/skill.ts`
- Create: `web/src/lib/data/skills.json`
- Create: `web/scripts/build-skills-json.ts`

**Step 1: Create skill type definitions**

```typescript
// web/src/lib/types/skill.ts
export interface Skill {
  id: string;
  name: string;
  version: string;
  layer: 1 | 2 | 3;
  description: string;
  category: string;
  owns: string[];
  pairs_with: string[];
  requires: string[];
  tags: string[];
  triggers: string[];
  identity: string;
  patterns: Pattern[];
  anti_patterns: AntiPattern[];
  handoffs: Handoff[];
  sharp_edges: SharpEdge[];
  validations: Validation[];
  collaboration?: Collaboration;
}

export interface Pattern {
  name: string;
  description: string;
  when: string;
  example: string;
}

export interface AntiPattern {
  name: string;
  description: string;
  why: string;
  instead: string;
}

export interface Handoff {
  trigger: string;
  to: string;
  context: string;
}

export interface SharpEdge {
  id: string;
  summary: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  situation: string;
  why: string;
  solution: string;
  detection_pattern?: string;
}

export interface Validation {
  id: string;
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  type: 'regex' | 'ast';
  pattern?: string;
  message: string;
}

export interface Collaboration {
  prerequisites: string[];
  delegates_to: DelegationTrigger[];
  cross_domain: CrossDomainInsight[];
}

export interface DelegationTrigger {
  when: string;
  to: string;
  handoff: string;
}

export interface CrossDomainInsight {
  domain: string;
  insight: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  skills: Skill[];
}

export type LayerLabel = 'Core' | 'Integration' | 'Polish';

export const LAYER_LABELS: Record<1 | 2 | 3, LayerLabel> = {
  1: 'Core',
  2: 'Integration',
  3: 'Polish'
};
```

**Step 2: Create build script to generate skills.json from YAML**

```typescript
// web/scripts/build-skills-json.ts
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

const SKILLS_DIR = path.join(__dirname, '../../spawner-v2/skills');
const OUTPUT_FILE = path.join(__dirname, '../src/lib/data/skills.json');

interface SkillFiles {
  skill: any;
  sharpEdges: any;
  validations: any;
  collaboration: any;
}

function loadYaml(filePath: string): any {
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, 'utf-8');
  return yaml.load(content);
}

function loadSkill(skillDir: string, category: string): any {
  const skillYaml = loadYaml(path.join(skillDir, 'skill.yaml'));
  if (!skillYaml) return null;

  const sharpEdgesYaml = loadYaml(path.join(skillDir, 'sharp-edges.yaml'));
  const validationsYaml = loadYaml(path.join(skillDir, 'validations.yaml'));
  const collaborationYaml = loadYaml(path.join(skillDir, 'collaboration.yaml'));

  return {
    ...skillYaml,
    category,
    sharp_edges: sharpEdgesYaml?.edges || [],
    validations: validationsYaml?.validations || [],
    collaboration: collaborationYaml || null
  };
}

function main() {
  const categories: any[] = [];

  const categoryDirs = fs.readdirSync(SKILLS_DIR).filter(
    f => fs.statSync(path.join(SKILLS_DIR, f)).isDirectory()
  );

  for (const categoryName of categoryDirs) {
    const categoryPath = path.join(SKILLS_DIR, categoryName);
    const skillDirs = fs.readdirSync(categoryPath).filter(
      f => fs.statSync(path.join(categoryPath, f)).isDirectory()
    );

    const skills = skillDirs
      .map(skillName => loadSkill(path.join(categoryPath, skillName), categoryName))
      .filter(Boolean);

    if (skills.length > 0) {
      categories.push({
        id: categoryName,
        name: categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
        skills
      });
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(categories, null, 2));
  console.log(`Generated ${OUTPUT_FILE} with ${categories.reduce((a, c) => a + c.skills.length, 0)} skills`);
}

main();
```

**Step 3: Add build script to package.json**

Add to `web/package.json` scripts:
```json
"build:skills": "npx tsx scripts/build-skills-json.ts",
"prebuild": "npm run build:skills"
```

**Step 4: Run build script and verify output**

Run: `cd web && npm run build:skills`
Expected: `skills.json` created in `src/lib/data/`

**Step 5: Commit**

```bash
git add web/src/lib/types/skill.ts web/scripts/build-skills-json.ts web/src/lib/data/skills.json web/package.json
git commit -m "feat: add skill types and YAML-to-JSON build script"
```

---

## Task 2: Create Skills Store

**Files:**
- Create: `web/src/lib/stores/skills.ts`

**Step 1: Create the skills store with search and filter logic**

```typescript
// web/src/lib/stores/skills.ts
import type { Skill, SkillCategory } from '$lib/types/skill';
import skillsData from '$lib/data/skills.json';

// Category metadata
const CATEGORY_META: Record<string, { icon: string; description: string }> = {
  frameworks: { icon: 'code', description: 'Deep expertise in specific technology frameworks' },
  development: { icon: 'terminal', description: 'Core software engineering skills' },
  design: { icon: 'palette', description: 'User experience and visual design' },
  strategy: { icon: 'target', description: 'Business and product strategy' },
  marketing: { icon: 'megaphone', description: 'Growth and customer acquisition' },
  product: { icon: 'box', description: 'Product management and analytics' },
  integration: { icon: 'link', description: 'Connecting services and systems' },
  startup: { icon: 'rocket', description: 'Startup-specific expertise' },
  pattern: { icon: 'grid', description: 'Cross-cutting patterns and practices' },
  communications: { icon: 'message-circle', description: 'Developer and stakeholder communication' }
};

// Load and enrich categories
export const categories: SkillCategory[] = (skillsData as any[]).map(cat => ({
  ...cat,
  icon: CATEGORY_META[cat.id]?.icon || 'layers',
  description: CATEGORY_META[cat.id]?.description || ''
}));

// Flat list of all skills
export const allSkills: Skill[] = categories.flatMap(cat => cat.skills);

// Get all unique tags
export const allTags: string[] = [...new Set(allSkills.flatMap(s => s.tags || []))].sort();

// Get skill by ID
export function getSkillById(id: string): Skill | undefined {
  return allSkills.find(s => s.id === id);
}

// Search skills
export function searchSkills(query: string): Skill[] {
  if (!query.trim()) return allSkills;

  const q = query.toLowerCase();
  return allSkills.filter(skill => {
    return (
      skill.name.toLowerCase().includes(q) ||
      skill.description.toLowerCase().includes(q) ||
      skill.tags?.some(t => t.toLowerCase().includes(q)) ||
      skill.triggers?.some(t => t.toLowerCase().includes(q))
    );
  });
}

// Filter skills
export interface SkillFilters {
  category?: string;
  layer?: 1 | 2 | 3;
  tags?: string[];
  pairsWith?: string;
}

export function filterSkills(skills: Skill[], filters: SkillFilters): Skill[] {
  return skills.filter(skill => {
    if (filters.category && skill.category !== filters.category) return false;
    if (filters.layer && skill.layer !== filters.layer) return false;
    if (filters.tags?.length && !filters.tags.some(t => skill.tags?.includes(t))) return false;
    if (filters.pairsWith && !skill.pairs_with?.includes(filters.pairsWith)) return false;
    return true;
  });
}

// Get skills that pair with a given skill
export function getCompatibleSkills(skillId: string): Skill[] {
  const skill = getSkillById(skillId);
  if (!skill?.pairs_with) return [];
  return skill.pairs_with.map(id => getSkillById(id)).filter(Boolean) as Skill[];
}

// Task-based skill finder
export function findSkillsForTask(task: string): { primary: Skill | null; related: Skill[] } {
  const q = task.toLowerCase();

  // Score skills based on trigger matches
  const scored = allSkills.map(skill => {
    let score = 0;

    // Check triggers
    skill.triggers?.forEach(trigger => {
      if (q.includes(trigger.toLowerCase())) score += 10;
    });

    // Check tags
    skill.tags?.forEach(tag => {
      if (q.includes(tag.toLowerCase())) score += 5;
    });

    // Check name/description
    if (q.includes(skill.name.toLowerCase())) score += 8;
    if (skill.description.toLowerCase().includes(q)) score += 2;

    return { skill, score };
  }).filter(s => s.score > 0).sort((a, b) => b.score - a.score);

  const primary = scored[0]?.skill || null;
  const related = primary
    ? getCompatibleSkills(primary.id).slice(0, 3)
    : scored.slice(1, 4).map(s => s.skill);

  return { primary, related };
}
```

**Step 2: Commit**

```bash
git add web/src/lib/stores/skills.ts
git commit -m "feat: add skills store with search, filter, and task finder"
```

---

## Task 3: Create SkillCard Component

**Files:**
- Create: `web/src/lib/components/SkillCard.svelte`

**Step 1: Create the skill card component**

```svelte
<!-- web/src/lib/components/SkillCard.svelte -->
<script lang="ts">
  import type { Skill } from '$lib/types/skill';
  import { LAYER_LABELS } from '$lib/types/skill';
  import Icon from './Icon.svelte';

  interface Props {
    skill: Skill;
    compact?: boolean;
  }

  let { skill, compact = false }: Props = $props();
</script>

<a href="/skills/{skill.id}" class="skill-card" class:compact>
  <div class="skill-header">
    <h3 class="skill-name">{skill.name}</h3>
    <span class="skill-layer layer-{skill.layer}">{LAYER_LABELS[skill.layer]}</span>
  </div>

  <p class="skill-description">{skill.description}</p>

  {#if !compact}
    <div class="skill-meta">
      <span class="skill-category">
        <Icon name="folder" size={12} />
        {skill.category}
      </span>

      {#if skill.tags?.length}
        <div class="skill-tags">
          {#each skill.tags.slice(0, 3) as tag}
            <span class="skill-tag">{tag}</span>
          {/each}
          {#if skill.tags.length > 3}
            <span class="skill-tag-more">+{skill.tags.length - 3}</span>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</a>

<style>
  .skill-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-4);
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 6px;
    text-decoration: none;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .skill-card:hover {
    border-color: var(--green-dim);
  }

  .skill-card.compact {
    padding: var(--space-3);
  }

  .skill-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
  }

  .skill-name {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .skill-layer {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    padding: 2px 6px;
    border-radius: 3px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .layer-1 {
    background: rgba(0, 196, 154, 0.15);
    color: var(--green-dim);
  }

  .layer-2 {
    background: rgba(100, 150, 255, 0.15);
    color: #6496ff;
  }

  .layer-3 {
    background: rgba(180, 130, 255, 0.15);
    color: #b482ff;
  }

  .skill-description {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
  }

  .compact .skill-description {
    font-size: var(--text-xs);
  }

  .skill-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3);
    margin-top: var(--space-1);
  }

  .skill-category {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    font-size: var(--text-xs);
    color: var(--text-tertiary);
  }

  .skill-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
  }

  .skill-tag {
    font-family: var(--font-mono);
    font-size: 10px;
    padding: 2px 6px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 3px;
    color: var(--text-tertiary);
  }

  .skill-tag-more {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-tertiary);
  }
</style>
```

**Step 2: Commit**

```bash
git add web/src/lib/components/SkillCard.svelte
git commit -m "feat: add SkillCard component"
```

---

## Task 4: Create FilterBar Component

**Files:**
- Create: `web/src/lib/components/FilterBar.svelte`

**Step 1: Create the filter bar component**

```svelte
<!-- web/src/lib/components/FilterBar.svelte -->
<script lang="ts">
  import Icon from './Icon.svelte';
  import { categories, allTags, allSkills } from '$lib/stores/skills';
  import type { SkillFilters } from '$lib/stores/skills';

  interface Props {
    filters: SkillFilters;
    onFilterChange: (filters: SkillFilters) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
  }

  let { filters, onFilterChange, searchQuery, onSearchChange }: Props = $props();

  let showMobileFilters = $state(false);

  function updateFilter<K extends keyof SkillFilters>(key: K, value: SkillFilters[K]) {
    onFilterChange({ ...filters, [key]: value || undefined });
  }

  function clearFilters() {
    onFilterChange({});
    onSearchChange('');
  }

  const hasActiveFilters = $derived(
    filters.category || filters.layer || filters.tags?.length || filters.pairsWith || searchQuery
  );
</script>

<div class="filter-bar">
  <div class="search-wrapper">
    <Icon name="search" size={16} />
    <input
      type="text"
      placeholder="Search skills..."
      value={searchQuery}
      oninput={(e) => onSearchChange(e.currentTarget.value)}
      class="search-input"
    />
  </div>

  <button class="mobile-filter-toggle" onclick={() => showMobileFilters = !showMobileFilters}>
    <Icon name="filter" size={16} />
    Filters
    {#if hasActiveFilters}
      <span class="filter-badge"></span>
    {/if}
  </button>

  <div class="filters" class:show={showMobileFilters}>
    <select
      value={filters.category || ''}
      onchange={(e) => updateFilter('category', e.currentTarget.value)}
      class="filter-select"
    >
      <option value="">All Categories</option>
      {#each categories as cat}
        <option value={cat.id}>{cat.name} ({cat.skills.length})</option>
      {/each}
    </select>

    <select
      value={filters.layer?.toString() || ''}
      onchange={(e) => updateFilter('layer', e.currentTarget.value ? Number(e.currentTarget.value) as 1|2|3 : undefined)}
      class="filter-select"
    >
      <option value="">All Layers</option>
      <option value="1">Core</option>
      <option value="2">Integration</option>
      <option value="3">Polish</option>
    </select>

    <select
      value={filters.pairsWith || ''}
      onchange={(e) => updateFilter('pairsWith', e.currentTarget.value)}
      class="filter-select"
    >
      <option value="">Pairs with...</option>
      {#each allSkills as skill}
        <option value={skill.id}>{skill.name}</option>
      {/each}
    </select>

    {#if hasActiveFilters}
      <button class="clear-btn" onclick={clearFilters}>
        <Icon name="x" size={14} />
        Clear
      </button>
    {/if}
  </div>

  <a href="/skills/find" class="finder-link">
    <Icon name="compass" size={16} />
    Help me find a skill
  </a>
</div>

<style>
  .filter-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 8px;
  }

  .search-wrapper {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex: 1;
    min-width: 200px;
    padding: var(--space-2) var(--space-3);
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--text-tertiary);
  }

  .search-wrapper:focus-within {
    border-color: var(--green-dim);
  }

  .search-input {
    flex: 1;
    background: none;
    border: none;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-primary);
    outline: none;
  }

  .search-input::placeholder {
    color: var(--text-tertiary);
  }

  .mobile-filter-toggle {
    display: none;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 4px;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    cursor: pointer;
    position: relative;
  }

  .filter-badge {
    position: absolute;
    top: -4px;
    right: -4px;
    width: 8px;
    height: 8px;
    background: var(--green-dim);
    border-radius: 50%;
  }

  .filters {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
  }

  .filter-select {
    padding: var(--space-2) var(--space-3);
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 4px;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    cursor: pointer;
  }

  .filter-select:focus {
    border-color: var(--green-dim);
    outline: none;
  }

  .clear-btn {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-2) var(--space-3);
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 4px;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-tertiary);
    cursor: pointer;
  }

  .clear-btn:hover {
    border-color: var(--red);
    color: var(--red);
  }

  .finder-link {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: rgba(0, 196, 154, 0.1);
    border: 1px solid var(--green-dim);
    border-radius: 4px;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--green-dim);
    text-decoration: none;
    white-space: nowrap;
  }

  .finder-link:hover {
    background: rgba(0, 196, 154, 0.2);
  }

  @media (max-width: 768px) {
    .filter-bar {
      flex-direction: column;
      align-items: stretch;
    }

    .search-wrapper {
      min-width: 100%;
    }

    .mobile-filter-toggle {
      display: flex;
    }

    .filters {
      display: none;
      flex-direction: column;
      align-items: stretch;
      width: 100%;
    }

    .filters.show {
      display: flex;
    }

    .filter-select {
      width: 100%;
    }

    .finder-link {
      justify-content: center;
    }
  }
</style>
```

**Step 2: Commit**

```bash
git add web/src/lib/components/FilterBar.svelte
git commit -m "feat: add FilterBar component with search and filters"
```

---

## Task 5: Rebuild /skills Page with New Components

**Files:**
- Modify: `web/src/routes/skills/+page.svelte`

**Step 1: Rewrite the skills page**

```svelte
<!-- web/src/routes/skills/+page.svelte -->
<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import SkillCard from '$lib/components/SkillCard.svelte';
  import FilterBar from '$lib/components/FilterBar.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { categories, allSkills, searchSkills, filterSkills } from '$lib/stores/skills';
  import type { SkillFilters } from '$lib/stores/skills';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  // Get initial filters from URL
  let filters = $state<SkillFilters>({
    category: $page.url.searchParams.get('category') || undefined,
    layer: $page.url.searchParams.get('layer') ? Number($page.url.searchParams.get('layer')) as 1|2|3 : undefined,
    pairsWith: $page.url.searchParams.get('pairs_with') || undefined
  });

  let searchQuery = $state($page.url.searchParams.get('q') || '');

  // Computed filtered skills
  const filteredSkills = $derived(() => {
    let skills = searchQuery ? searchSkills(searchQuery) : allSkills;
    return filterSkills(skills, filters);
  });

  // Group by category for display
  const groupedSkills = $derived(() => {
    if (filters.category) {
      return [{
        id: filters.category,
        name: categories.find(c => c.id === filters.category)?.name || filters.category,
        skills: filteredSkills()
      }];
    }

    const groups: Record<string, typeof filteredSkills extends () => infer T ? T : never> = {};
    filteredSkills().forEach(skill => {
      if (!groups[skill.category]) groups[skill.category] = [];
      groups[skill.category].push(skill);
    });

    return Object.entries(groups).map(([id, skills]) => ({
      id,
      name: categories.find(c => c.id === id)?.name || id,
      skills
    }));
  });

  function handleFilterChange(newFilters: SkillFilters) {
    filters = newFilters;
    updateUrl();
  }

  function handleSearchChange(query: string) {
    searchQuery = query;
    updateUrl();
  }

  function updateUrl() {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (filters.category) params.set('category', filters.category);
    if (filters.layer) params.set('layer', filters.layer.toString());
    if (filters.pairsWith) params.set('pairs_with', filters.pairsWith);

    const newUrl = params.toString() ? `/skills?${params}` : '/skills';
    goto(newUrl, { replaceState: true, noScroll: true });
  }
</script>

<Navbar />

<main class="skills-directory">
  <section class="hero">
    <h1>Skills Directory</h1>
    <p class="hero-subtitle">{allSkills.length} specialized skills. See what's inside. Find what you need.</p>
  </section>

  <!-- What's Inside Section -->
  <section class="whats-inside">
    <h2>What's Inside Each Skill</h2>
    <p class="section-desc">Not just prompts. Each skill is a 4-file system:</p>

    <div class="files-grid">
      <div class="file-card">
        <div class="file-header">
          <Icon name="file-text" size={18} />
          <span>skill.yaml</span>
        </div>
        <h4>Identity</h4>
        <p>Who this expert is. Patterns they follow. Anti-patterns they avoid.</p>
      </div>

      <div class="file-card">
        <div class="file-header">
          <Icon name="alert-triangle" size={18} />
          <span>sharp-edges.yaml</span>
        </div>
        <h4>Sharp Edges</h4>
        <p>8-12 gotchas with detection patterns. Catches issues in your code.</p>
      </div>

      <div class="file-card">
        <div class="file-header">
          <Icon name="shield" size={18} />
          <span>validations.yaml</span>
        </div>
        <h4>Validations</h4>
        <p>8-12 automated checks that run on your code. Not just advice.</p>
      </div>

      <div class="file-card">
        <div class="file-header">
          <Icon name="git-branch" size={18} />
          <span>collaboration.yaml</span>
        </div>
        <h4>Collaboration</h4>
        <p>Prerequisites. Handoffs. When to delegate to other skills.</p>
      </div>
    </div>

    <p class="quality-note">Every skill scores 80+ on our 100-point quality rubric.</p>
  </section>

  <!-- Filter Bar -->
  <section class="filter-section">
    <FilterBar
      {filters}
      onFilterChange={handleFilterChange}
      {searchQuery}
      onSearchChange={handleSearchChange}
    />
  </section>

  <!-- Skills Grid -->
  <section class="skills-section">
    {#if filteredSkills().length === 0}
      <div class="no-results">
        <Icon name="search" size={32} />
        <h3>No skills found</h3>
        <p>Try adjusting your search or filters</p>
      </div>
    {:else}
      {#each groupedSkills() as group}
        <div class="category-group">
          <div class="category-header">
            <h3>{group.name}</h3>
            <span class="category-count">{group.skills.length}</span>
          </div>
          <div class="skills-grid">
            {#each group.skills as skill}
              <SkillCard {skill} />
            {/each}
          </div>
        </div>
      {/each}
    {/if}
  </section>

  <!-- Create Your Own CTA -->
  <section class="cta-section">
    <h2>Create Your Own Skills</h2>
    <p>Don't see what you need? Build it locally with our step-by-step guide.</p>
    <a href="/skills/create" class="cta-btn">
      <Icon name="plus" size={16} />
      Learn to Create Skills
    </a>
  </section>
</main>

<Footer />

<style>
  .skills-directory {
    min-height: 100vh;
    padding-top: 52px;
  }

  .hero {
    text-align: center;
    padding: var(--space-12) var(--space-6);
    border-bottom: 1px solid var(--border);
  }

  .hero h1 {
    font-family: var(--font-serif);
    font-size: var(--text-4xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0 0 var(--space-3);
  }

  .hero-subtitle {
    font-size: var(--text-lg);
    color: var(--text-secondary);
    margin: 0;
  }

  /* What's Inside Section */
  .whats-inside {
    max-width: 1000px;
    margin: 0 auto;
    padding: var(--space-10) var(--space-6);
    text-align: center;
  }

  .whats-inside h2 {
    font-family: var(--font-serif);
    font-size: var(--text-2xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0 0 var(--space-2);
  }

  .section-desc {
    color: var(--text-secondary);
    margin: 0 0 var(--space-6);
  }

  .files-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-4);
    margin-bottom: var(--space-4);
  }

  .file-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: var(--space-4);
    text-align: left;
  }

  .file-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--text-tertiary);
    margin-bottom: var(--space-2);
  }

  .file-header span {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
  }

  .file-card h4 {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--green-dim);
    margin: 0 0 var(--space-2);
  }

  .file-card p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
  }

  .quality-note {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-tertiary);
    margin: 0;
  }

  /* Filter Section */
  .filter-section {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 var(--space-6) var(--space-6);
  }

  /* Skills Section */
  .skills-section {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 var(--space-6) var(--space-10);
  }

  .no-results {
    text-align: center;
    padding: var(--space-12);
    color: var(--text-tertiary);
  }

  .no-results h3 {
    margin: var(--space-4) 0 var(--space-2);
    color: var(--text-secondary);
  }

  .category-group {
    margin-bottom: var(--space-8);
  }

  .category-header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-4);
    padding-bottom: var(--space-2);
    border-bottom: 1px solid var(--border);
  }

  .category-header h3 {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    text-transform: capitalize;
  }

  .category-count {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--green-dim);
    background: rgba(0, 196, 154, 0.1);
    padding: 2px 8px;
    border-radius: 4px;
  }

  .skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-4);
  }

  /* CTA Section */
  .cta-section {
    text-align: center;
    padding: var(--space-12) var(--space-6);
    background: var(--bg-secondary);
    border-top: 1px solid var(--border);
  }

  .cta-section h2 {
    font-family: var(--font-serif);
    font-size: var(--text-2xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0 0 var(--space-2);
  }

  .cta-section p {
    color: var(--text-secondary);
    margin: 0 0 var(--space-6);
  }

  .cta-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-6);
    background: var(--green-dim);
    border: none;
    border-radius: 4px;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 500;
    color: #0d1117;
    text-decoration: none;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    cursor: pointer;
  }

  .cta-btn:hover {
    box-shadow: 0 0 20px rgba(0, 196, 154, 0.4);
  }

  @media (max-width: 768px) {
    .hero h1 {
      font-size: var(--text-3xl);
    }

    .files-grid {
      grid-template-columns: 1fr 1fr;
    }

    .skills-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 480px) {
    .files-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
```

**Step 2: Commit**

```bash
git add web/src/routes/skills/+page.svelte
git commit -m "feat: rebuild /skills page with search, filters, and new layout"
```

---

## Task 6: Create Skill Detail Page with Tabs

**Files:**
- Create: `web/src/routes/skills/[id]/+page.svelte`

**Step 1: Create the skill detail page**

```svelte
<!-- web/src/routes/skills/[id]/+page.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { getSkillById, getCompatibleSkills } from '$lib/stores/skills';
  import { LAYER_LABELS } from '$lib/types/skill';
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import SkillCard from '$lib/components/SkillCard.svelte';
  import Icon from '$lib/components/Icon.svelte';

  const skill = $derived(getSkillById($page.params.id));
  const compatibleSkills = $derived(skill ? getCompatibleSkills(skill.id) : []);

  type TabId = 'identity' | 'patterns' | 'sharp-edges' | 'validations' | 'collaboration' | 'all';

  let activeTab = $state<TabId>('identity');

  // Check for hash on load
  $effect(() => {
    const hash = $page.url.hash.slice(1) as TabId;
    if (['identity', 'patterns', 'sharp-edges', 'validations', 'collaboration', 'all'].includes(hash)) {
      activeTab = hash;
    }
  });

  function setTab(tab: TabId) {
    activeTab = tab;
    history.replaceState(null, '', `#${tab}`);
  }

  const severityColors: Record<string, string> = {
    critical: '#ff6b6b',
    high: '#ffa94d',
    medium: '#ffd43b',
    low: '#69db7c'
  };
</script>

{#if !skill}
  <Navbar />
  <main class="skill-detail">
    <div class="not-found">
      <h1>Skill not found</h1>
      <p>The skill "{$page.params.id}" doesn't exist.</p>
      <a href="/skills">Back to Skills</a>
    </div>
  </main>
{:else}
  <Navbar />

  <main class="skill-detail">
    <a href="/skills" class="back-link">
      <Icon name="arrow-left" size={16} />
      Back to Skills
    </a>

    <header class="skill-header">
      <div class="skill-title">
        <h1>{skill.name}</h1>
        <span class="skill-layer layer-{skill.layer}">{LAYER_LABELS[skill.layer]}</span>
      </div>
      <p class="skill-description">{skill.description}</p>

      <div class="skill-meta">
        {#if skill.tags?.length}
          <div class="skill-tags">
            {#each skill.tags as tag}
              <a href="/skills?tags={tag}" class="skill-tag">{tag}</a>
            {/each}
          </div>
        {/if}

        {#if skill.pairs_with?.length}
          <div class="pairs-with">
            <span class="pairs-label">Pairs with:</span>
            {#each skill.pairs_with as id}
              <a href="/skills/{id}" class="pair-link">{id}</a>
            {/each}
          </div>
        {/if}
      </div>
    </header>

    <nav class="tabs">
      <button class="tab" class:active={activeTab === 'identity'} onclick={() => setTab('identity')}>
        <Icon name="user" size={14} />
        Identity
      </button>
      <button class="tab" class:active={activeTab === 'patterns'} onclick={() => setTab('patterns')}>
        <Icon name="check-circle" size={14} />
        Patterns
        {#if skill.patterns?.length}
          <span class="tab-count">{skill.patterns.length}</span>
        {/if}
      </button>
      <button class="tab" class:active={activeTab === 'sharp-edges'} onclick={() => setTab('sharp-edges')}>
        <Icon name="alert-triangle" size={14} />
        Sharp Edges
        {#if skill.sharp_edges?.length}
          <span class="tab-count">{skill.sharp_edges.length}</span>
        {/if}
      </button>
      <button class="tab" class:active={activeTab === 'validations'} onclick={() => setTab('validations')}>
        <Icon name="shield" size={14} />
        Validations
        {#if skill.validations?.length}
          <span class="tab-count">{skill.validations.length}</span>
        {/if}
      </button>
      <button class="tab" class:active={activeTab === 'collaboration'} onclick={() => setTab('collaboration')}>
        <Icon name="git-branch" size={14} />
        Collaboration
      </button>
      <button class="tab" class:active={activeTab === 'all'} onclick={() => setTab('all')}>
        <Icon name="layers" size={14} />
        View All
      </button>
    </nav>

    <div class="tab-content">
      {#if activeTab === 'identity' || activeTab === 'all'}
        <section class="content-section" id="identity">
          <h2>Identity</h2>
          <div class="identity-content">
            <pre>{skill.identity}</pre>
          </div>

          {#if skill.owns?.length}
            <h3>Owns</h3>
            <div class="owns-list">
              {#each skill.owns as domain}
                <span class="owns-tag">{domain}</span>
              {/each}
            </div>
          {/if}

          {#if skill.triggers?.length}
            <h3>Triggers</h3>
            <div class="triggers-list">
              {#each skill.triggers as trigger}
                <code class="trigger-tag">{trigger}</code>
              {/each}
            </div>
          {/if}
        </section>
      {/if}

      {#if activeTab === 'patterns' || activeTab === 'all'}
        <section class="content-section" id="patterns">
          <h2>Patterns</h2>
          {#if skill.patterns?.length}
            {#each skill.patterns as pattern}
              <div class="pattern-card">
                <h3>{pattern.name}</h3>
                <p class="pattern-desc">{pattern.description}</p>
                <p class="pattern-when"><strong>When:</strong> {pattern.when}</p>
                {#if pattern.example}
                  <pre class="pattern-example">{pattern.example}</pre>
                {/if}
              </div>
            {/each}
          {:else}
            <p class="empty-state">No patterns defined yet.</p>
          {/if}

          {#if skill.anti_patterns?.length}
            <h2>Anti-Patterns</h2>
            {#each skill.anti_patterns as antiPattern}
              <div class="anti-pattern-card">
                <h3>{antiPattern.name}</h3>
                <p class="anti-desc">{antiPattern.description}</p>
                <p class="anti-why"><strong>Why avoid:</strong> {antiPattern.why}</p>
                <p class="anti-instead"><strong>Instead:</strong> {antiPattern.instead}</p>
              </div>
            {/each}
          {/if}
        </section>
      {/if}

      {#if activeTab === 'sharp-edges' || activeTab === 'all'}
        <section class="content-section" id="sharp-edges">
          <h2>Sharp Edges</h2>
          {#if skill.sharp_edges?.length}
            {#each skill.sharp_edges as edge}
              <div class="edge-card" style="--severity-color: {severityColors[edge.severity]}">
                <div class="edge-header">
                  <span class="edge-severity">{edge.severity.toUpperCase()}</span>
                  <h3>{edge.summary}</h3>
                </div>
                <p class="edge-situation"><strong>When:</strong> {edge.situation}</p>
                <p class="edge-why"><strong>Why:</strong> {edge.why}</p>
                <div class="edge-solution">
                  <strong>Solution:</strong>
                  <pre>{edge.solution}</pre>
                </div>
                {#if edge.detection_pattern}
                  <p class="edge-detection">
                    <strong>Detection:</strong> <code>{edge.detection_pattern}</code>
                  </p>
                {/if}
              </div>
            {/each}
          {:else}
            <p class="empty-state">No sharp edges defined yet.</p>
          {/if}
        </section>
      {/if}

      {#if activeTab === 'validations' || activeTab === 'all'}
        <section class="content-section" id="validations">
          <h2>Validations</h2>
          {#if skill.validations?.length}
            {#each skill.validations as validation}
              <div class="validation-card">
                <div class="validation-header">
                  <span class="validation-severity {validation.severity}">{validation.severity}</span>
                  <h3>{validation.name}</h3>
                </div>
                <p>{validation.description || validation.message}</p>
                {#if validation.pattern}
                  <p class="validation-pattern">
                    <strong>Pattern:</strong> <code>{validation.pattern}</code>
                  </p>
                {/if}
              </div>
            {/each}
          {:else}
            <p class="empty-state">No validations defined yet.</p>
          {/if}
        </section>
      {/if}

      {#if activeTab === 'collaboration' || activeTab === 'all'}
        <section class="content-section" id="collaboration">
          <h2>Collaboration</h2>

          {#if skill.handoffs?.length}
            <h3>Handoffs</h3>
            {#each skill.handoffs as handoff}
              <div class="handoff-card">
                <p><strong>When:</strong> {handoff.trigger}</p>
                <p><strong>Hand off to:</strong> <a href="/skills/{handoff.to}">{handoff.to}</a></p>
                <p><strong>Context:</strong> {handoff.context}</p>
              </div>
            {/each}
          {/if}

          {#if skill.requires?.length}
            <h3>Prerequisites</h3>
            <div class="prereq-list">
              {#each skill.requires as req}
                <a href="/skills/{req}" class="prereq-link">{req}</a>
              {/each}
            </div>
          {/if}

          {#if !skill.handoffs?.length && !skill.requires?.length}
            <p class="empty-state">No collaboration data defined yet.</p>
          {/if}
        </section>
      {/if}
    </div>

    {#if compatibleSkills.length > 0}
      <section class="compatible-section">
        <h2>Works Well With</h2>
        <div class="compatible-grid">
          {#each compatibleSkills as compatSkill}
            <SkillCard skill={compatSkill} compact />
          {/each}
        </div>
      </section>
    {/if}
  </main>

  <Footer />
{/if}

<style>
  .skill-detail {
    min-height: 100vh;
    padding-top: 52px;
  }

  .not-found {
    text-align: center;
    padding: var(--space-12);
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-4) var(--space-6);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    text-decoration: none;
  }

  .back-link:hover {
    color: var(--green-dim);
  }

  .skill-header {
    padding: 0 var(--space-6) var(--space-6);
    max-width: 1000px;
    margin: 0 auto;
    border-bottom: 1px solid var(--border);
  }

  .skill-title {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-2);
  }

  .skill-title h1 {
    font-family: var(--font-serif);
    font-size: var(--text-3xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0;
  }

  .skill-layer {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    padding: 4px 8px;
    border-radius: 4px;
    text-transform: uppercase;
  }

  .layer-1 { background: rgba(0, 196, 154, 0.15); color: var(--green-dim); }
  .layer-2 { background: rgba(100, 150, 255, 0.15); color: #6496ff; }
  .layer-3 { background: rgba(180, 130, 255, 0.15); color: #b482ff; }

  .skill-description {
    font-size: var(--text-lg);
    color: var(--text-secondary);
    margin: 0 0 var(--space-4);
  }

  .skill-meta {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .skill-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .skill-tag {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    padding: 2px 8px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 3px;
    color: var(--text-tertiary);
    text-decoration: none;
  }

  .skill-tag:hover {
    border-color: var(--green-dim);
    color: var(--green-dim);
  }

  .pairs-with {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-2);
  }

  .pairs-label {
    font-size: var(--text-sm);
    color: var(--text-tertiary);
  }

  .pair-link {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--green-dim);
    text-decoration: none;
  }

  .pair-link:hover {
    text-decoration: underline;
  }

  /* Tabs */
  .tabs {
    display: flex;
    gap: var(--space-1);
    padding: var(--space-4) var(--space-6);
    max-width: 1000px;
    margin: 0 auto;
    overflow-x: auto;
    border-bottom: 1px solid var(--border);
  }

  .tab {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: transparent;
    border: 1px solid transparent;
    border-radius: 4px;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    cursor: pointer;
    white-space: nowrap;
  }

  .tab:hover {
    background: var(--bg-secondary);
  }

  .tab.active {
    background: var(--bg-secondary);
    border-color: var(--green-dim);
    color: var(--green-dim);
  }

  .tab-count {
    font-size: var(--text-xs);
    padding: 1px 6px;
    background: var(--bg-tertiary);
    border-radius: 10px;
  }

  /* Tab Content */
  .tab-content {
    max-width: 1000px;
    margin: 0 auto;
    padding: var(--space-6);
  }

  .content-section {
    margin-bottom: var(--space-8);
  }

  .content-section h2 {
    font-family: var(--font-mono);
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--space-4);
    padding-bottom: var(--space-2);
    border-bottom: 1px solid var(--border);
  }

  .content-section h3 {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
    margin: var(--space-4) 0 var(--space-2);
  }

  .empty-state {
    color: var(--text-tertiary);
    font-style: italic;
  }

  /* Identity */
  .identity-content pre {
    background: var(--bg-secondary);
    padding: var(--space-4);
    border-radius: 6px;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    white-space: pre-wrap;
    overflow-x: auto;
  }

  .owns-list, .triggers-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .owns-tag, .trigger-tag {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    padding: 2px 8px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 3px;
    color: var(--text-tertiary);
  }

  /* Patterns */
  .pattern-card, .anti-pattern-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: var(--space-4);
    margin-bottom: var(--space-4);
  }

  .pattern-card h3, .anti-pattern-card h3 {
    margin: 0 0 var(--space-2);
  }

  .pattern-desc, .anti-desc {
    color: var(--text-secondary);
    margin: 0 0 var(--space-2);
  }

  .pattern-when, .anti-why, .anti-instead {
    font-size: var(--text-sm);
    color: var(--text-tertiary);
    margin: 0 0 var(--space-2);
  }

  .pattern-example {
    background: var(--bg-tertiary);
    padding: var(--space-3);
    border-radius: 4px;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    overflow-x: auto;
    white-space: pre-wrap;
    margin: var(--space-2) 0 0;
  }

  .anti-pattern-card {
    border-left: 3px solid #ff6b6b;
  }

  /* Sharp Edges */
  .edge-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-left: 3px solid var(--severity-color);
    border-radius: 6px;
    padding: var(--space-4);
    margin-bottom: var(--space-4);
  }

  .edge-header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-2);
  }

  .edge-severity {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 3px;
    color: var(--severity-color);
    background: color-mix(in srgb, var(--severity-color) 15%, transparent);
  }

  .edge-header h3 {
    margin: 0;
    font-size: var(--text-base);
  }

  .edge-situation, .edge-why {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0 0 var(--space-2);
  }

  .edge-solution {
    margin: var(--space-3) 0;
  }

  .edge-solution pre {
    background: var(--bg-tertiary);
    padding: var(--space-3);
    border-radius: 4px;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    overflow-x: auto;
    white-space: pre-wrap;
    margin: var(--space-2) 0 0;
  }

  .edge-detection {
    font-size: var(--text-sm);
    color: var(--text-tertiary);
    margin: 0;
  }

  .edge-detection code {
    background: var(--bg-tertiary);
    padding: 2px 6px;
    border-radius: 3px;
  }

  /* Validations */
  .validation-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: var(--space-4);
    margin-bottom: var(--space-4);
  }

  .validation-header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-2);
  }

  .validation-severity {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 600;
    padding: 2px 6px;
    border-radius: 3px;
    text-transform: uppercase;
  }

  .validation-severity.error {
    background: rgba(255, 107, 107, 0.15);
    color: #ff6b6b;
  }

  .validation-severity.warning {
    background: rgba(255, 169, 77, 0.15);
    color: #ffa94d;
  }

  .validation-severity.info {
    background: rgba(100, 150, 255, 0.15);
    color: #6496ff;
  }

  .validation-header h3 {
    margin: 0;
    font-size: var(--text-base);
  }

  .validation-pattern {
    font-size: var(--text-sm);
    color: var(--text-tertiary);
    margin: var(--space-2) 0 0;
  }

  .validation-pattern code {
    background: var(--bg-tertiary);
    padding: 2px 6px;
    border-radius: 3px;
  }

  /* Handoffs */
  .handoff-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: var(--space-4);
    margin-bottom: var(--space-3);
  }

  .handoff-card p {
    font-size: var(--text-sm);
    margin: 0 0 var(--space-1);
  }

  .handoff-card a {
    color: var(--green-dim);
  }

  .prereq-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .prereq-link {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    padding: var(--space-2) var(--space-3);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 4px;
    color: var(--text-secondary);
    text-decoration: none;
  }

  .prereq-link:hover {
    border-color: var(--green-dim);
    color: var(--green-dim);
  }

  /* Compatible Skills */
  .compatible-section {
    max-width: 1000px;
    margin: 0 auto;
    padding: var(--space-6);
    border-top: 1px solid var(--border);
  }

  .compatible-section h2 {
    font-family: var(--font-serif);
    font-size: var(--text-xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0 0 var(--space-4);
  }

  .compatible-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: var(--space-4);
  }

  @media (max-width: 768px) {
    .skill-title {
      flex-direction: column;
      align-items: flex-start;
    }

    .tabs {
      padding: var(--space-2) var(--space-4);
    }

    .tab {
      padding: var(--space-2);
      font-size: var(--text-xs);
    }

    .tab span:not(.tab-count) {
      display: none;
    }
  }
</style>
```

**Step 2: Commit**

```bash
git add web/src/routes/skills/\[id\]/+page.svelte
git commit -m "feat: add skill detail page with tabbed view"
```

---

## Task 7: Create Task-Based Skill Finder

**Files:**
- Create: `web/src/routes/skills/find/+page.svelte`

**Step 1: Create the skill finder page**

```svelte
<!-- web/src/routes/skills/find/+page.svelte -->
<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import SkillCard from '$lib/components/SkillCard.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { findSkillsForTask } from '$lib/stores/skills';

  let query = $state('');
  let selectedScenario = $state<string | null>(null);

  const scenarios = [
    { id: 'new-project', label: 'Starting a new project', icon: 'rocket', query: 'new project setup architecture' },
    { id: 'feature', label: 'Building a feature', icon: 'code', query: 'implement feature development' },
    { id: 'debug', label: 'Debugging an issue', icon: 'bug', query: 'debug fix error' },
    { id: 'design', label: 'Design & UI/UX', icon: 'palette', query: 'design ui ux interface' },
    { id: 'growth', label: 'Growth & Marketing', icon: 'trending-up', query: 'marketing growth users' },
    { id: 'security', label: 'Security & DevOps', icon: 'shield', query: 'security devops deployment' }
  ];

  const results = $derived(() => {
    const searchQuery = selectedScenario
      ? scenarios.find(s => s.id === selectedScenario)?.query || ''
      : query;

    if (!searchQuery.trim()) return null;
    return findSkillsForTask(searchQuery);
  });

  function selectScenario(id: string) {
    selectedScenario = selectedScenario === id ? null : id;
    query = '';
  }

  function handleSearch() {
    selectedScenario = null;
  }
</script>

<Navbar />

<main class="skill-finder">
  <section class="finder-hero">
    <h1>Find the Right Skill</h1>
    <p>Tell us what you're working on and we'll recommend the best skills.</p>
  </section>

  <section class="finder-input">
    <div class="search-box">
      <Icon name="search" size={20} />
      <input
        type="text"
        placeholder="e.g., 'build a landing page with React'"
        bind:value={query}
        oninput={handleSearch}
      />
    </div>
  </section>

  <section class="scenarios">
    <h2>Or pick a scenario:</h2>
    <div class="scenario-grid">
      {#each scenarios as scenario}
        <button
          class="scenario-card"
          class:active={selectedScenario === scenario.id}
          onclick={() => selectScenario(scenario.id)}
        >
          <Icon name={scenario.icon} size={24} />
          <span>{scenario.label}</span>
        </button>
      {/each}
    </div>
  </section>

  {#if results()}
    <section class="results">
      <h2>Recommended Skills</h2>

      {#if results().primary}
        <div class="primary-result">
          <span class="result-label">Primary Match</span>
          <SkillCard skill={results().primary} />
        </div>
      {/if}

      {#if results().related.length > 0}
        <div class="related-results">
          <span class="result-label">Pairs Well With</span>
          <div class="related-grid">
            {#each results().related as skill}
              <SkillCard skill={skill} compact />
            {/each}
          </div>
        </div>
      {/if}

      {#if !results().primary && results().related.length === 0}
        <div class="no-results">
          <Icon name="search" size={32} />
          <p>No skills found for that query. Try different keywords.</p>
        </div>
      {/if}
    </section>
  {/if}
</main>

<Footer />

<style>
  .skill-finder {
    min-height: 100vh;
    padding-top: 52px;
  }

  .finder-hero {
    text-align: center;
    padding: var(--space-12) var(--space-6) var(--space-6);
  }

  .finder-hero h1 {
    font-family: var(--font-serif);
    font-size: var(--text-3xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0 0 var(--space-2);
  }

  .finder-hero p {
    color: var(--text-secondary);
    margin: 0;
  }

  .finder-input {
    max-width: 600px;
    margin: 0 auto;
    padding: 0 var(--space-6) var(--space-6);
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--bg-secondary);
    border: 2px solid var(--border);
    border-radius: 8px;
    color: var(--text-tertiary);
  }

  .search-box:focus-within {
    border-color: var(--green-dim);
  }

  .search-box input {
    flex: 1;
    background: none;
    border: none;
    font-size: var(--text-lg);
    color: var(--text-primary);
    outline: none;
  }

  .search-box input::placeholder {
    color: var(--text-tertiary);
  }

  .scenarios {
    max-width: 800px;
    margin: 0 auto;
    padding: var(--space-6);
    text-align: center;
  }

  .scenarios h2 {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 400;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin: 0 0 var(--space-4);
  }

  .scenario-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--space-3);
  }

  .scenario-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-4);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 8px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.2s;
  }

  .scenario-card:hover {
    border-color: var(--green-dim);
    color: var(--text-primary);
  }

  .scenario-card.active {
    border-color: var(--green-dim);
    background: rgba(0, 196, 154, 0.1);
    color: var(--green-dim);
  }

  .scenario-card span {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    text-align: center;
  }

  .results {
    max-width: 800px;
    margin: 0 auto;
    padding: var(--space-8) var(--space-6);
    border-top: 1px solid var(--border);
  }

  .results h2 {
    font-family: var(--font-serif);
    font-size: var(--text-xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0 0 var(--space-6);
    text-align: center;
  }

  .result-label {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--green-dim);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: var(--space-2);
  }

  .primary-result {
    margin-bottom: var(--space-6);
  }

  .related-results {
    margin-top: var(--space-6);
  }

  .related-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-3);
  }

  .no-results {
    text-align: center;
    padding: var(--space-8);
    color: var(--text-tertiary);
  }

  .no-results p {
    margin: var(--space-4) 0 0;
  }

  @media (max-width: 600px) {
    .scenario-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }
</style>
```

**Step 2: Commit**

```bash
git add web/src/routes/skills/find/+page.svelte
git commit -m "feat: add task-based skill finder page"
```

---

## Task 8: Create Skill Creation Education Page

**Files:**
- Create: `web/src/routes/skills/create/+page.svelte`

**Step 1: Create the skill creation guide page**

```svelte
<!-- web/src/routes/skills/create/+page.svelte -->
<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import Icon from '$lib/components/Icon.svelte';

  let currentStep = $state(1);
  const totalSteps = 5;

  const steps = [
    {
      title: 'Start with Identity',
      file: 'skill.yaml',
      description: 'Define who this expert is. What do they know? What are their principles?',
      example: `id: my-skill
name: My Custom Skill
version: 1.0.0
layer: 1  # 1=Core, 2=Integration, 3=Polish
description: Expert knowledge for...

identity: |
  You are an expert who has shipped...
  Your core principles:
  1. Always prefer X over Y
  2. Never do Z without checking...

tags:
  - my-skill
  - relevant-topic

triggers:
  - "my skill"
  - "relevant phrase"`
    },
    {
      title: 'Add Patterns & Anti-Patterns',
      file: 'skill.yaml',
      description: 'What should people do? What should they avoid?',
      example: `patterns:
  - name: Pattern Name
    description: What this pattern does
    when: When to use it
    example: |
      // Code example here
      const result = doTheThing();

anti_patterns:
  - name: Anti-Pattern Name
    description: What this is
    why: Why it's bad
    instead: What to do instead`
    },
    {
      title: 'Define Sharp Edges',
      file: 'sharp-edges.yaml',
      description: 'What gotchas trip people up? Include detection patterns when possible.',
      example: `id: my-skill-sharp-edges
skill: my-skill
version: 1.0.0

edges:
  - id: common-mistake
    summary: Brief description of the gotcha
    severity: critical  # critical, high, medium, low
    situation: When this happens
    why: |
      Explanation of why this is
      a problem and what goes wrong
    solution: |
      How to fix or avoid it:
      \`\`\`typescript
      // Good code example
      \`\`\`
    detection_pattern: 'regex-to-find-this'`
    },
    {
      title: 'Create Validations',
      file: 'validations.yaml',
      description: 'Automated checks that run against code. 8-12 validations recommended.',
      example: `id: my-skill-validations
skill: my-skill
version: 1.0.0

validations:
  - id: missing-check
    name: Missing Important Check
    description: Catches when X is missing
    severity: error  # error, warning, info
    type: regex  # regex or ast
    pattern: 'pattern-to-match'
    message: What to tell the user`
    },
    {
      title: 'Set Up Collaboration',
      file: 'collaboration.yaml',
      description: 'When should this skill hand off to others? What does it need?',
      example: `id: my-skill-collaboration
skill: my-skill

prerequisites:
  - typescript-strict  # Skills that should be loaded first

delegates_to:
  - when: user mentions database
    to: supabase-backend
    handoff: Passing database work to Supabase expert

handoffs:
  - trigger: styling or css
    to: tailwind-ui
    context: User needs UI styling help`
    }
  ];
</script>

<Navbar />

<main class="create-skills">
  <section class="hero">
    <h1>Create Your Own Skills</h1>
    <p>Don't see what you need? Build it locally. Here's how.</p>
  </section>

  <!-- Folder Structure -->
  <section class="anatomy">
    <h2>The Anatomy of a Skill</h2>
    <div class="folder-tree">
      <div class="folder">
        <Icon name="folder" size={18} />
        <span class="folder-name">my-skill/</span>
      </div>
      <div class="file">
        <Icon name="file-text" size={16} />
        <span class="file-name">skill.yaml</span>
        <span class="file-desc">who you are</span>
      </div>
      <div class="file">
        <Icon name="alert-triangle" size={16} />
        <span class="file-name">sharp-edges.yaml</span>
        <span class="file-desc">gotchas</span>
      </div>
      <div class="file">
        <Icon name="shield" size={16} />
        <span class="file-name">validations.yaml</span>
        <span class="file-desc">code checks</span>
      </div>
      <div class="file">
        <Icon name="git-branch" size={16} />
        <span class="file-name">collaboration.yaml</span>
        <span class="file-desc">handoffs</span>
      </div>
    </div>
  </section>

  <!-- Step by Step -->
  <section class="walkthrough">
    <h2>Step-by-Step Walkthrough</h2>

    <div class="steps-nav">
      {#each steps as step, i}
        <button
          class="step-btn"
          class:active={currentStep === i + 1}
          class:completed={currentStep > i + 1}
          onclick={() => currentStep = i + 1}
        >
          <span class="step-num">{i + 1}</span>
          <span class="step-title">{step.title}</span>
        </button>
      {/each}
    </div>

    <div class="step-content">
      <div class="step-header">
        <h3>Step {currentStep}: {steps[currentStep - 1].title}</h3>
        <span class="step-file">
          <Icon name="file-text" size={14} />
          {steps[currentStep - 1].file}
        </span>
      </div>

      <p class="step-desc">{steps[currentStep - 1].description}</p>

      <div class="code-example">
        <div class="code-header">
          <span>Example</span>
        </div>
        <pre>{steps[currentStep - 1].example}</pre>
      </div>

      <div class="step-navigation">
        <button
          class="nav-btn"
          disabled={currentStep === 1}
          onclick={() => currentStep--}
        >
          <Icon name="arrow-left" size={16} />
          Previous
        </button>
        <span class="step-indicator">{currentStep} / {totalSteps}</span>
        <button
          class="nav-btn primary"
          disabled={currentStep === totalSteps}
          onclick={() => currentStep++}
        >
          Next
          <Icon name="arrow-right" size={16} />
        </button>
      </div>
    </div>
  </section>

  <!-- Spawner Integration -->
  <section class="spawner-section">
    <h2>Or Use Spawner</h2>
    <p>Let Spawner generate the skill scaffold for you:</p>

    <div class="command-cards">
      <div class="command-card">
        <h4>spawner_skill_new</h4>
        <p>Generate a complete skill scaffold with all 4 YAML files</p>
        <code>Use spawner_skill_new to create a new skill</code>
      </div>

      <div class="command-card">
        <h4>spawner_skill_upgrade</h4>
        <p>Enhance an existing skill with more patterns and edge cases</p>
        <code>Use spawner_skill_upgrade to improve my-skill</code>
      </div>

      <div class="command-card">
        <h4>spawner_skill_score</h4>
        <p>Score your skill against the 100-point quality rubric</p>
        <code>Use spawner_skill_score to evaluate my-skill</code>
      </div>
    </div>
  </section>

  <!-- Quality Bar -->
  <section class="quality-section">
    <h2>Quality Bar</h2>
    <p>Skills must score 80+ on our 100-point rubric to ship:</p>

    <div class="rubric-grid">
      <div class="rubric-item">
        <span class="rubric-points">10</span>
        <span class="rubric-label">Identity</span>
      </div>
      <div class="rubric-item">
        <span class="rubric-points">20</span>
        <span class="rubric-label">Patterns</span>
      </div>
      <div class="rubric-item">
        <span class="rubric-points">15</span>
        <span class="rubric-label">Anti-Patterns</span>
      </div>
      <div class="rubric-item">
        <span class="rubric-points">20</span>
        <span class="rubric-label">Sharp Edges</span>
      </div>
      <div class="rubric-item">
        <span class="rubric-points">20</span>
        <span class="rubric-label">Validations</span>
      </div>
      <div class="rubric-item">
        <span class="rubric-points">10</span>
        <span class="rubric-label">Handoffs</span>
      </div>
      <div class="rubric-item">
        <span class="rubric-points">5</span>
        <span class="rubric-label">Documentation</span>
      </div>
    </div>
  </section>
</main>

<Footer />

<style>
  .create-skills {
    min-height: 100vh;
    padding-top: 52px;
  }

  .hero {
    text-align: center;
    padding: var(--space-12) var(--space-6);
    border-bottom: 1px solid var(--border);
  }

  .hero h1 {
    font-family: var(--font-serif);
    font-size: var(--text-3xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0 0 var(--space-2);
  }

  .hero p {
    color: var(--text-secondary);
    margin: 0;
  }

  /* Anatomy Section */
  .anatomy {
    max-width: 600px;
    margin: 0 auto;
    padding: var(--space-8) var(--space-6);
    text-align: center;
  }

  .anatomy h2 {
    font-family: var(--font-serif);
    font-size: var(--text-xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0 0 var(--space-6);
  }

  .folder-tree {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: var(--space-4);
    text-align: left;
    font-family: var(--font-mono);
  }

  .folder, .file {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) 0;
  }

  .file {
    padding-left: var(--space-6);
  }

  .folder-name {
    color: var(--text-primary);
    font-weight: 600;
  }

  .file-name {
    color: var(--text-secondary);
  }

  .file-desc {
    color: var(--text-tertiary);
    font-size: var(--text-sm);
    margin-left: auto;
  }

  /* Walkthrough Section */
  .walkthrough {
    max-width: 800px;
    margin: 0 auto;
    padding: var(--space-8) var(--space-6);
  }

  .walkthrough h2 {
    font-family: var(--font-serif);
    font-size: var(--text-xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0 0 var(--space-6);
    text-align: center;
  }

  .steps-nav {
    display: flex;
    gap: var(--space-2);
    margin-bottom: var(--space-6);
    overflow-x: auto;
    padding-bottom: var(--space-2);
  }

  .step-btn {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 4px;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    cursor: pointer;
    white-space: nowrap;
  }

  .step-btn:hover {
    border-color: var(--green-dim);
  }

  .step-btn.active {
    border-color: var(--green-dim);
    background: rgba(0, 196, 154, 0.1);
    color: var(--green-dim);
  }

  .step-btn.completed .step-num {
    background: var(--green-dim);
    color: #0d1117;
  }

  .step-num {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: var(--bg-tertiary);
    border-radius: 50%;
    font-size: var(--text-xs);
    font-weight: 600;
  }

  .step-title {
    display: none;
  }

  @media (min-width: 768px) {
    .step-title {
      display: inline;
    }
  }

  .step-content {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: var(--space-6);
  }

  .step-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-4);
  }

  .step-header h3 {
    font-family: var(--font-mono);
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .step-file {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-tertiary);
  }

  .step-desc {
    color: var(--text-secondary);
    margin: 0 0 var(--space-4);
  }

  .code-example {
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: var(--space-4);
  }

  .code-header {
    padding: var(--space-2) var(--space-3);
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    text-transform: uppercase;
  }

  .code-example pre {
    padding: var(--space-4);
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    overflow-x: auto;
    white-space: pre-wrap;
  }

  .step-navigation {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
  }

  .nav-btn {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    background: transparent;
    border: 1px solid var(--border);
    border-radius: 4px;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    cursor: pointer;
  }

  .nav-btn:hover:not(:disabled) {
    border-color: var(--green-dim);
    color: var(--green-dim);
  }

  .nav-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .nav-btn.primary {
    background: var(--green-dim);
    border-color: var(--green-dim);
    color: #0d1117;
  }

  .step-indicator {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-tertiary);
  }

  /* Spawner Section */
  .spawner-section {
    max-width: 800px;
    margin: 0 auto;
    padding: var(--space-8) var(--space-6);
    text-align: center;
    border-top: 1px solid var(--border);
  }

  .spawner-section h2 {
    font-family: var(--font-serif);
    font-size: var(--text-xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0 0 var(--space-2);
  }

  .spawner-section > p {
    color: var(--text-secondary);
    margin: 0 0 var(--space-6);
  }

  .command-cards {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: var(--space-4);
  }

  .command-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: var(--space-4);
    text-align: left;
  }

  .command-card h4 {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--green-dim);
    margin: 0 0 var(--space-2);
  }

  .command-card p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0 0 var(--space-3);
  }

  .command-card code {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    background: var(--bg-tertiary);
    padding: var(--space-2);
    border-radius: 4px;
  }

  /* Quality Section */
  .quality-section {
    max-width: 600px;
    margin: 0 auto;
    padding: var(--space-8) var(--space-6);
    text-align: center;
    border-top: 1px solid var(--border);
  }

  .quality-section h2 {
    font-family: var(--font-serif);
    font-size: var(--text-xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0 0 var(--space-2);
  }

  .quality-section > p {
    color: var(--text-secondary);
    margin: 0 0 var(--space-6);
  }

  .rubric-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-3);
  }

  .rubric-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-3);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 6px;
    min-width: 80px;
  }

  .rubric-points {
    font-family: var(--font-mono);
    font-size: var(--text-xl);
    font-weight: 600;
    color: var(--green-dim);
  }

  .rubric-label {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--text-tertiary);
  }
</style>
```

**Step 2: Commit**

```bash
git add web/src/routes/skills/create/+page.svelte
git commit -m "feat: add skill creation education page with step-by-step walkthrough"
```

---

## Task 9: Update Navbar with Skills Dropdown

**Files:**
- Modify: `web/src/lib/components/Navbar.svelte`

**Step 1: Update navbar with dropdown menu**

Replace the Skills link with a dropdown:

```svelte
<!-- Update the navbar-right section in Navbar.svelte -->
<script lang="ts">
  import ThemeToggle from './ThemeToggle.svelte';
  import Icon from './Icon.svelte';

  let skillsDropdownOpen = $state(false);
</script>

<nav class="navbar">
  <div class="navbar-content">
    <a href="/" class="navbar-logo-link">
      <img src="/logo.png" alt="vibeship" class="navbar-logo-img">
      <span class="navbar-logo-text">vibeship</span>
      <span class="navbar-logo-product">spawner</span>
    </a>

    <div class="navbar-right">
      <a href="/why-spawner" class="nav-btn">
        <Icon name="check-circle" size={14} />
        <span>Benefits</span>
      </a>
      <a href="/mcp-guide" class="nav-btn">
        <Icon name="book" size={14} />
        <span>Guide</span>
      </a>

      <div class="nav-dropdown"
        onmouseenter={() => skillsDropdownOpen = true}
        onmouseleave={() => skillsDropdownOpen = false}
      >
        <button class="nav-btn dropdown-trigger">
          <Icon name="layers" size={14} />
          <span>Skills</span>
          <Icon name="chevron-down" size={12} />
        </button>

        {#if skillsDropdownOpen}
          <div class="dropdown-menu">
            <a href="/skills" class="dropdown-item">
              <Icon name="grid" size={14} />
              Browse All
            </a>
            <a href="/skills/find" class="dropdown-item">
              <Icon name="compass" size={14} />
              Find a Skill
            </a>
            <a href="/skills/create" class="dropdown-item">
              <Icon name="plus" size={14} />
              Create Your Own
            </a>
            <div class="dropdown-divider"></div>
            <a href="/skills?category=frameworks" class="dropdown-item secondary">Frameworks</a>
            <a href="/skills?category=development" class="dropdown-item secondary">Development</a>
            <a href="/skills?category=design" class="dropdown-item secondary">Design</a>
            <a href="/skills?category=strategy" class="dropdown-item secondary">Strategy</a>
          </div>
        {/if}
      </div>

      <ThemeToggle />
    </div>
  </div>
</nav>
```

Add these styles to the existing `<style>` block:

```css
  .nav-dropdown {
    position: relative;
  }

  .dropdown-trigger {
    cursor: pointer;
  }

  .dropdown-menu {
    position: absolute;
    top: 100%;
    right: 0;
    min-width: 180px;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: var(--space-2);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 200;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    text-decoration: none;
    border-radius: 4px;
  }

  .dropdown-item:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }

  .dropdown-item.secondary {
    padding-left: var(--space-6);
    font-size: var(--text-xs);
    color: var(--text-tertiary);
  }

  .dropdown-divider {
    height: 1px;
    background: var(--border);
    margin: var(--space-2) 0;
  }
```

**Step 2: Commit**

```bash
git add web/src/lib/components/Navbar.svelte
git commit -m "feat: add skills dropdown menu to navbar"
```

---

## Task 10: Install Dependencies and Test

**Step 1: Install js-yaml for build script**

Run: `cd web && npm install --save-dev js-yaml @types/js-yaml tsx`

**Step 2: Build skills JSON**

Run: `npm run build:skills`
Expected: `src/lib/data/skills.json` created with all skills

**Step 3: Start dev server and test**

Run: `npm run dev`

Test checklist:
- [ ] `/skills` shows all skills with filters
- [ ] Search filters skills in real-time
- [ ] Category/Layer/Pairs-with filters work
- [ ] `/skills/[id]` shows skill detail with tabs
- [ ] All tabs display correct content
- [ ] Deep links with hash work (`#sharp-edges`)
- [ ] `/skills/find` shows task-based finder
- [ ] Scenario buttons filter results
- [ ] `/skills/create` shows step-by-step guide
- [ ] Navbar dropdown works
- [ ] Mobile responsive on all pages

**Step 4: Commit verification**

```bash
git add -A
git commit -m "feat: complete skills directory implementation"
```

---

## Summary

This implementation creates:

1. **Type definitions** - Full TypeScript types for skills
2. **Build script** - Converts YAML skills to JSON at build time
3. **Skills store** - Search, filter, and task-based finder logic
4. **SkillCard component** - Reusable skill card display
5. **FilterBar component** - Search and filter UI
6. **Skills page** - Rebuilt with new components and layout
7. **Skill detail page** - Tabbed view with all skill content
8. **Task-based finder** - Interactive skill discovery
9. **Creation guide** - Step-by-step skill creation education
10. **Navbar dropdown** - Easy navigation to all skill pages

All pages are mobile-responsive and follow existing design patterns.
