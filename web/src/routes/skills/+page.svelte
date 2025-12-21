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
