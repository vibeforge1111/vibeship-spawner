<!-- web/src/routes/skills/[id]/+page.svelte -->
<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { getSkillById, categories } from '$lib/stores/skills';
  import { LAYER_LABELS } from '$lib/types/skill';
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import SkillsSidebar from '$lib/components/SkillsSidebar.svelte';
  import Icon from '$lib/components/Icon.svelte';

  const skill = $derived(getSkillById($page.params.id));

  // Expandable sections
  let showPatterns = $state(false);
  let showEdges = $state(false);
  let showValidations = $state(false);

  // Sidebar state - highlight the current skill's category
  let activeSection = $state('browse');
  const activeCategory = $derived(skill?.category || null);
  let searchQuery = $state('');

  // Sidebar handlers
  function handleSectionChange(section: string) {
    goto(`/skills#section-${section}`);
  }

  function handleCategoryChange(category: string | null) {
    const params = category ? `?category=${category}` : '';
    goto(`/skills${params}`);
  }

  function handleSearchChange(query: string) {
    searchQuery = query;
    if (query) {
      goto(`/skills?q=${encodeURIComponent(query)}`);
    }
  }
</script>

{#if !skill}
  <Navbar />
  <div class="skills-layout">
    <SkillsSidebar
      {activeSection}
      activeCategory={null}
      {searchQuery}
      onSectionChange={handleSectionChange}
      onCategoryChange={handleCategoryChange}
      onSearchChange={handleSearchChange}
    />
    <main class="skill-detail">
      <div class="not-found">
        <h1>Skill not found</h1>
        <p>The skill "{$page.params.id}" doesn't exist.</p>
        <a href="/skills" class="back-btn">Back to Skills</a>
      </div>
    </main>
  </div>
{:else}
  <Navbar />

  <div class="skills-layout">
    <SkillsSidebar
      {activeSection}
      {activeCategory}
      {searchQuery}
      onSectionChange={handleSectionChange}
      onCategoryChange={handleCategoryChange}
      onSearchChange={handleSearchChange}
    />

    <main class="skill-detail">

      <!-- Header: Clean and simple -->
      <header class="skill-header">
        <div class="skill-title">
          <h1>{skill.name}</h1>
          <span class="skill-layer layer-{skill.layer}">{LAYER_LABELS[skill.layer]}</span>
        </div>
        <p class="skill-description">{skill.description}</p>
      </header>

      <!-- Main content: What this skill does -->
      <section class="skill-about">
        <h2>About This Skill</h2>
        <div class="about-content">
          <p>{skill.identity}</p>
        </div>
      </section>

      <!-- Quick stats -->
      <section class="skill-stats">
        <div class="stat-row">
          {#if skill.patterns?.length}
            <button class="stat-card" onclick={() => showPatterns = !showPatterns}>
              <span class="stat-number">{skill.patterns.length}</span>
              <span class="stat-label">Best Practices</span>
              <Icon name={showPatterns ? 'chevron-up' : 'chevron-down'} size={16} />
            </button>
          {/if}
          {#if skill.sharp_edges?.length}
            <button class="stat-card" onclick={() => showEdges = !showEdges}>
              <span class="stat-number">{skill.sharp_edges.length}</span>
              <span class="stat-label">Gotchas to Avoid</span>
              <Icon name={showEdges ? 'chevron-up' : 'chevron-down'} size={16} />
            </button>
          {/if}
          {#if skill.validations?.length}
            <button class="stat-card" onclick={() => showValidations = !showValidations}>
              <span class="stat-number">{skill.validations.length}</span>
              <span class="stat-label">Auto Checks</span>
              <Icon name={showValidations ? 'chevron-up' : 'chevron-down'} size={16} />
            </button>
          {/if}
        </div>
      </section>

      <!-- Expandable: Patterns -->
      {#if showPatterns && skill.patterns?.length}
        <section class="expandable-section">
          <h3>Best Practices</h3>
          <div class="items-list">
            {#each skill.patterns as pattern}
              <div class="item-card">
                <h4>{pattern.name}</h4>
                <p>{pattern.description}</p>
              </div>
            {/each}
          </div>
        </section>
      {/if}

      <!-- Expandable: Sharp Edges -->
      {#if showEdges && skill.sharp_edges?.length}
        <section class="expandable-section">
          <h3>Gotchas to Avoid</h3>
          <div class="items-list">
            {#each skill.sharp_edges as edge}
              <div class="item-card edge">
                <div class="edge-header">
                  <span class="edge-severity {edge.severity}">{edge.severity}</span>
                  <h4>{edge.summary}</h4>
                </div>
                <p>{edge.why}</p>
              </div>
            {/each}
          </div>
        </section>
      {/if}

      <!-- Expandable: Validations -->
      {#if showValidations && skill.validations?.length}
        <section class="expandable-section">
          <h3>Automatic Checks</h3>
          <div class="items-list">
            {#each skill.validations as validation}
              <div class="item-card">
                <h4>{validation.name}</h4>
                <p>{validation.description || validation.message}</p>
              </div>
            {/each}
          </div>
        </section>
      {/if}

      <!-- Related skills -->
      {#if skill.pairs_with?.length}
        <section class="related-section">
          <h3>Works Well With</h3>
          <div class="related-links">
            {#each skill.pairs_with as id}
              <a href="/skills/{id}" class="related-link">{id}</a>
            {/each}
          </div>
        </section>
      {/if}
    </main>
  </div>

  <Footer />
{/if}

<style>
  .skills-layout {
    display: flex;
    min-height: calc(100vh - 52px);
  }

  .skill-detail {
    flex: 1;
    max-width: 800px;
    padding: var(--space-8) var(--space-6);
  }

  .not-found {
    text-align: center;
    padding: var(--space-12);
  }

  .back-btn {
    display: inline-block;
    padding: var(--space-2) var(--space-4);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    color: var(--text-primary);
    text-decoration: none;
  }

  /* Header */
  .skill-header {
    margin-bottom: var(--space-8);
  }

  .skill-title {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-3);
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
    padding: 4px 10px;
    text-transform: uppercase;
  }

  .layer-1 { background: rgba(0, 196, 154, 0.15); color: var(--green-dim); }
  .layer-2 { background: rgba(100, 150, 255, 0.15); color: #6496ff; }
  .layer-3 { background: rgba(180, 130, 255, 0.15); color: #b482ff; }

  .skill-description {
    font-size: var(--text-lg);
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0;
  }

  /* About section */
  .skill-about {
    margin-bottom: var(--space-8);
  }

  .skill-about h2 {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 var(--space-3);
  }

  .about-content {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    padding: var(--space-5);
  }

  .about-content p {
    font-size: var(--text-base);
    color: var(--text-secondary);
    line-height: 1.7;
    margin: 0;
  }

  /* Stats */
  .skill-stats {
    margin-bottom: var(--space-6);
  }

  .stat-row {
    display: flex;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  .stat-card {
    flex: 1;
    min-width: 150px;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    cursor: pointer;
    transition: border-color var(--transition-fast);
  }

  .stat-card:hover {
    border-color: var(--green-dim);
  }

  .stat-number {
    font-family: var(--font-mono);
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--green-dim);
  }

  .stat-label {
    flex: 1;
    font-size: var(--text-sm);
    color: var(--text-secondary);
    text-align: left;
  }

  .stat-card :global(svg) {
    color: var(--text-tertiary);
  }

  /* Expandable sections */
  .expandable-section {
    margin-bottom: var(--space-6);
    padding: var(--space-5);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
  }

  .expandable-section h3 {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--space-4);
  }

  .items-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .item-card {
    padding: var(--space-4);
    background: var(--bg-primary);
    border: 1px solid var(--border);
  }

  .item-card h4 {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--space-2);
  }

  .item-card p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0;
  }

  .item-card.edge {
    border-left: 3px solid var(--text-tertiary);
  }

  .edge-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-2);
  }

  .edge-severity {
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    text-transform: uppercase;
  }

  .edge-severity.critical { background: rgba(255, 107, 107, 0.15); color: #ff6b6b; }
  .edge-severity.high { background: rgba(255, 169, 77, 0.15); color: #ffa94d; }
  .edge-severity.medium { background: rgba(255, 212, 59, 0.15); color: #ffd43b; }
  .edge-severity.low { background: rgba(105, 219, 124, 0.15); color: #69db7c; }

  .edge-header h4 {
    margin: 0;
  }

  /* Related */
  .related-section {
    margin-top: var(--space-8);
    padding-top: var(--space-6);
    border-top: 1px solid var(--border);
  }

  .related-section h3 {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 var(--space-3);
  }

  .related-links {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .related-link {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    padding: var(--space-2) var(--space-3);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    color: var(--text-secondary);
    text-decoration: none;
    transition: all var(--transition-fast);
  }

  .related-link:hover {
    border-color: var(--green-dim);
    color: var(--green-dim);
  }

  @media (max-width: 900px) {
    .skills-layout {
      flex-direction: column;
    }

    .skill-detail {
      padding: var(--space-6) var(--space-4);
    }
  }

  @media (max-width: 600px) {
    .skill-detail {
      padding: var(--space-4);
    }

    .skill-title {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-2);
    }

    .skill-title h1 {
      font-size: var(--text-2xl);
    }

    .stat-row {
      flex-direction: column;
    }

    .stat-card {
      min-width: 100%;
    }
  }
</style>
