<!-- web/src/lib/components/SkillsSidebar.svelte -->
<script lang="ts">
  import Icon from './Icon.svelte';
  import { categories } from '$lib/stores/skills';

  interface Props {
    activeSection: string;
    activeCategory: string | null;
    searchQuery: string;
    onSectionChange: (section: string) => void;
    onCategoryChange: (category: string | null) => void;
    onSearchChange: (query: string) => void;
  }

  let {
    activeSection,
    activeCategory,
    searchQuery,
    onSectionChange,
    onCategoryChange,
    onSearchChange
  }: Props = $props();

  let mobileOpen = $state(false);

  const sections = [
    { id: 'overview', label: 'Overview', icon: 'home' },
    { id: 'browse', label: 'Browse Skills', icon: 'grid' },
    { id: 'guides', label: 'Guides', icon: 'book-open' },
    { id: 'create', label: 'Create Skills', icon: 'plus' },
    { id: 'resources', label: 'Resources', icon: 'external-link' }
  ];

  function handleSectionClick(sectionId: string) {
    onSectionChange(sectionId);
    mobileOpen = false;
  }

  function handleCategoryClick(categoryId: string | null) {
    onCategoryChange(categoryId);
    onSectionChange('browse');
    mobileOpen = false;
  }

  function handleSearchInput(e: Event) {
    const target = e.target as HTMLInputElement;
    onSearchChange(target.value);
  }

  function handleSearchKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && searchQuery.trim()) {
      onSectionChange('browse');
      mobileOpen = false;
    }
  }

  // Calculate total skills count
  const totalSkills = $derived(categories.reduce((sum, cat) => sum + cat.skills.length, 0));
</script>

<!-- Mobile Toggle -->
<button class="mobile-toggle" onclick={() => mobileOpen = !mobileOpen}>
  <Icon name={mobileOpen ? 'x' : 'menu'} size={20} />
  <span>Skills Menu</span>
</button>

<!-- Sidebar -->
<aside class="skills-sidebar" class:open={mobileOpen}>
  <div class="sidebar-content">
    <!-- Page Title -->
    <div class="sidebar-header">
      <h2>Skills</h2>
    </div>

    <!-- Page Sections -->
    <nav class="sidebar-sections">
      {#each sections as section}
        <button
          class="section-link"
          class:active={activeSection === section.id}
          onclick={() => handleSectionClick(section.id)}
        >
          <Icon name={section.icon} size={16} />
          <span>{section.label}</span>
        </button>
      {/each}
    </nav>

    <!-- Divider -->
    <div class="sidebar-divider"></div>

    <!-- Categories -->
    <div class="sidebar-categories">
      <h3>Categories</h3>
      <button
        class="category-link"
        class:active={activeCategory === null}
        onclick={() => handleCategoryClick(null)}
      >
        <span>All</span>
        <span class="count">{totalSkills}</span>
      </button>
      {#each categories as category}
        <button
          class="category-link"
          class:active={activeCategory === category.id}
          onclick={() => handleCategoryClick(category.id)}
        >
          <span>{category.name}</span>
          <span class="count">{category.skills.length}</span>
        </button>
      {/each}
    </div>

    <!-- Search -->
    <div class="sidebar-search">
      <div class="search-box">
        <Icon name="search" size={16} />
        <input
          type="text"
          placeholder="Search skills..."
          value={searchQuery}
          oninput={handleSearchInput}
          onkeydown={handleSearchKeydown}
        />
      </div>
    </div>
  </div>
</aside>

<!-- Overlay for mobile -->
{#if mobileOpen}
  <button
    type="button"
    class="sidebar-overlay"
    onclick={() => mobileOpen = false}
    aria-label="Close sidebar"
  ></button>
{/if}

<style>
  .mobile-toggle {
    display: none;
    align-items: center;
    gap: var(--space-2);
    position: fixed;
    bottom: var(--space-4);
    right: var(--space-4);
    z-index: 100;
    padding: var(--space-3) var(--space-4);
    background: var(--bg-secondary);
    border: 1px solid var(--green-dim);
    color: var(--green-dim);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .mobile-toggle:hover {
    background: var(--green-dim);
    color: var(--bg-primary);
  }

  .skills-sidebar {
    position: sticky;
    top: 52px;
    width: 260px;
    height: calc(100vh - 52px);
    flex-shrink: 0;
    background: var(--bg-secondary);
    border-right: 1px solid var(--border);
    overflow-y: auto;
    align-self: flex-start;
  }

  .sidebar-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: var(--space-4);
  }

  .sidebar-header {
    margin-bottom: var(--space-4);
  }

  .sidebar-header h2 {
    font-family: var(--font-serif);
    font-size: var(--text-xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0;
  }

  .sidebar-sections {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .section-link {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-3);
    background: transparent;
    border: none;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    text-align: left;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .section-link:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.05);
  }

  .section-link.active {
    color: var(--green-dim);
    background: rgba(0, 196, 154, 0.1);
  }

  .sidebar-divider {
    height: 1px;
    background: var(--border);
    margin: var(--space-4) 0;
  }

  .sidebar-categories {
    flex: 1;
    overflow-y: auto;
  }

  .sidebar-categories h3 {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin: 0 0 var(--space-2) var(--space-3);
  }

  .category-link {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: var(--space-2) var(--space-3);
    background: transparent;
    border: none;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    text-align: left;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .category-link:hover {
    color: var(--text-primary);
    background: rgba(255, 255, 255, 0.05);
  }

  .category-link.active {
    color: var(--green-dim);
    background: rgba(0, 196, 154, 0.1);
  }

  .category-link .count {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
  }

  .category-link.active .count {
    color: var(--green-dim);
  }

  .sidebar-search {
    margin-top: var(--space-4);
    padding-top: var(--space-4);
    border-top: 1px solid var(--border);
  }

  .search-box {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: var(--bg-primary);
    border: 1px solid var(--border);
    color: var(--text-tertiary);
  }

  .search-box:focus-within {
    border-color: var(--green-dim);
  }

  .search-box input {
    flex: 1;
    background: none;
    border: none;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-primary);
    outline: none;
  }

  .search-box input::placeholder {
    color: var(--text-tertiary);
  }

  .sidebar-overlay {
    display: none;
    border: none;
    padding: 0;
    margin: 0;
    cursor: pointer;
  }

  @media (max-width: 900px) {
    .mobile-toggle {
      display: flex;
    }

    .skills-sidebar {
      position: fixed;
      top: 0;
      left: 0;
      width: 280px;
      height: 100vh;
      z-index: 101;
      transform: translateX(-100%);
      transition: transform var(--transition-base);
    }

    .skills-sidebar.open {
      transform: translateX(0);
    }

    .sidebar-overlay {
      display: block;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 100;
    }
  }
</style>
