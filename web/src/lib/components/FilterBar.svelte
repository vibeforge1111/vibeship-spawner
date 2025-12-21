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
