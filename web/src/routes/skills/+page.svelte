<!-- web/src/routes/skills/+page.svelte -->
<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import SkillsSidebar from '$lib/components/SkillsSidebar.svelte';
  import SkillRow from '$lib/components/SkillRow.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { categories, allSkills, searchSkills, filterSkills } from '$lib/stores/skills';
  import type { SkillFilters } from '$lib/stores/skills';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  // State
  let activeSection = $state('overview');
  let activeCategory = $state<string | null>($page.url.searchParams.get('category') || null);
  let searchQuery = $state($page.url.searchParams.get('q') || '');
  let activeLayer = $state<1 | 2 | 3 | null>(null);
  let expandedTip = $state<number | null>(null);

  // Filter skills based on current state
  const filteredSkills = $derived(() => {
    let skills = searchQuery ? searchSkills(searchQuery) : allSkills;
    const filters: SkillFilters = {
      category: activeCategory || undefined,
      layer: activeLayer || undefined
    };
    return filterSkills(skills, filters);
  });

  // Group by category for display
  const groupedSkills = $derived(() => {
    if (activeCategory) {
      return [{
        id: activeCategory,
        name: categories.find(c => c.id === activeCategory)?.name || activeCategory,
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

  // Quick tips data
  const quickTips = [
    {
      question: 'How do I load a skill?',
      answer: 'Use the spawner_skills tool with action "load" and the skill ID. Example: spawner_skills({ action: "load", skill: "typescript-patterns" })'
    },
    {
      question: 'What\'s the difference between patterns and sharp edges?',
      answer: 'Patterns are best practices to follow. Sharp edges are gotchas and pitfalls - specific issues Claude doesn\'t know by default, with detection patterns to catch them in your code.'
    },
    {
      question: 'Can I modify built-in skills?',
      answer: 'Yes! Copy any skill to your local skills folder, modify the YAML files, and your changes take precedence. Skills are designed to be customized.'
    }
  ];

  // Handlers
  function handleSectionChange(section: string) {
    activeSection = section;
    // Scroll to section
    const element = document.getElementById(`section-${section}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function handleCategoryChange(category: string | null) {
    activeCategory = category;
    activeSection = 'browse';
    updateUrl();
  }

  function handleSearchChange(query: string) {
    searchQuery = query;
    if (query) {
      activeSection = 'browse';
    }
    updateUrl();
  }

  function handleLayerFilter(layer: 1 | 2 | 3 | null) {
    activeLayer = activeLayer === layer ? null : layer;
  }

  function toggleTip(index: number) {
    expandedTip = expandedTip === index ? null : index;
  }

  function updateUrl() {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (activeCategory) params.set('category', activeCategory);
    const newUrl = params.toString() ? `/skills?${params}` : '/skills';
    goto(newUrl, { replaceState: true, noScroll: true });
  }
</script>

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

  <main class="skills-content">
    <!-- Overview Section -->
    <section id="section-overview" class="content-section">
      <div class="overview-hero">
        <h1>Skills: Not Just Prompts</h1>
        <p class="hero-subtitle">
          Most AI "skills" are prompts. Ours are 4-file systems with detection patterns,
          automated checks, and cross-skill collaboration.
        </p>
      </div>

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

      <div class="stats-bar">
        <div class="stat">
          <span class="stat-value">{allSkills.length}</span>
          <span class="stat-label">Skills</span>
        </div>
        <div class="stat">
          <span class="stat-value">8-12</span>
          <span class="stat-label">Sharp Edges Each</span>
        </div>
        <div class="stat">
          <span class="stat-value">80+</span>
          <span class="stat-label">Quality Score</span>
        </div>
      </div>
    </section>

    <!-- Browse Skills Section -->
    <section id="section-browse" class="content-section">
      <div class="section-header">
        <h2>Browse Skills</h2>
        <div class="layer-filters">
          <button
            class="layer-pill"
            class:active={activeLayer === null}
            onclick={() => handleLayerFilter(null)}
          >All</button>
          <button
            class="layer-pill"
            class:active={activeLayer === 1}
            onclick={() => handleLayerFilter(1)}
          >Core</button>
          <button
            class="layer-pill"
            class:active={activeLayer === 2}
            onclick={() => handleLayerFilter(2)}
          >Integration</button>
          <button
            class="layer-pill"
            class:active={activeLayer === 3}
            onclick={() => handleLayerFilter(3)}
          >Polish</button>
        </div>
      </div>

      {#if filteredSkills().length === 0}
        <div class="no-results">
          <Icon name="search" size={32} />
          <h3>No skills found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      {:else}
        {#each groupedSkills() as group}
          <div class="category-group" id="category-{group.id}">
            <div class="category-header">
              <h3>{group.name}</h3>
              <span class="category-count">{group.skills.length}</span>
            </div>
            <div class="skills-list">
              {#each group.skills as skill}
                <SkillRow {skill} />
              {/each}
            </div>
          </div>
        {/each}
      {/if}
    </section>

    <!-- Guides Section -->
    <section id="section-guides" class="content-section">
      <h2>Guides</h2>

      <div class="guides-grid">
        <a href="/skills/guides/getting-started" class="guide-card">
          <div class="guide-icon">
            <Icon name="book-open" size={24} />
          </div>
          <h3>Getting Started</h3>
          <p>Load your first skill, see it catch issues in your code.</p>
          <span class="guide-link">Read guide <Icon name="arrow-right" size={14} /></span>
        </a>

        <a href="/skills/guides/spawner-creation" class="guide-card">
          <div class="guide-icon">
            <Icon name="wrench" size={24} />
          </div>
          <h3>Creating Skills with Spawner</h3>
          <p>Use MCP tools to generate quality skills automatically.</p>
          <span class="guide-link">Read guide <Icon name="arrow-right" size={14} /></span>
        </a>

        <a href="/skills/guides/skills-mind" class="guide-card">
          <div class="guide-icon">
            <Icon name="brain" size={24} />
          </div>
          <h3>Skills + Mind Memory</h3>
          <p>Persistent context across sessions. Skills remember your project.</p>
          <span class="guide-link">Read guide <Icon name="arrow-right" size={14} /></span>
        </a>
      </div>

      <div class="quick-tips">
        <h3>Quick Tips</h3>
        {#each quickTips as tip, i}
          <div class="tip-item">
            <button class="tip-question" onclick={() => toggleTip(i)}>
              <Icon name={expandedTip === i ? 'chevron-up' : 'chevron-down'} size={16} />
              <span>{tip.question}</span>
            </button>
            {#if expandedTip === i}
              <div class="tip-answer">
                <p>{tip.answer}</p>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </section>

    <!-- Create Skills Section -->
    <section id="section-create" class="content-section">
      <h2>Create Your Own Skills</h2>

      <div class="create-cta">
        <div class="cta-icon">
          <Icon name="file-plus" size={32} />
        </div>
        <div class="cta-content">
          <h3>Build Custom Skills</h3>
          <p>Don't see what you need? Create skills locally with our step-by-step guide.</p>
          <a href="/skills/create" class="cta-btn">
            Learn to Create Skills
            <Icon name="arrow-right" size={16} />
          </a>
        </div>
      </div>
    </section>

    <!-- Resources Section -->
    <section id="section-resources" class="content-section">
      <h2>Resources</h2>

      <div class="resources-list">
        <div class="resource-group">
          <h3>External</h3>
          <a href="https://docs.anthropic.com/en/docs/claude-code" target="_blank" rel="noopener" class="resource-link">
            <Icon name="external-link" size={16} />
            <span>Claude Code Documentation</span>
          </a>
        </div>

        <div class="resource-group">
          <h3>Related</h3>
          <a href="/" class="resource-link">
            <Icon name="zap" size={16} />
            <span>Spawner MCP Tools</span>
          </a>
          <a href="/" class="resource-link">
            <Icon name="brain" size={16} />
            <span>Mind Memory System</span>
          </a>
        </div>
      </div>
    </section>
  </main>
</div>

<Footer />

<style>
  .skills-layout {
    display: flex;
    min-height: calc(100vh - 52px);
  }

  .skills-content {
    flex: 1;
    padding: var(--space-8) var(--space-6);
    max-width: 900px;
  }

  .content-section {
    margin-bottom: var(--space-12);
    scroll-margin-top: 80px;
  }

  /* Overview Section */
  .overview-hero {
    margin-bottom: var(--space-8);
  }

  .overview-hero h1 {
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
    max-width: 600px;
  }

  .files-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-4);
    margin-bottom: var(--space-6);
  }

  .file-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    padding: var(--space-4);
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

  .stats-bar {
    display: flex;
    gap: var(--space-8);
    padding: var(--space-4) 0;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .stat-value {
    font-family: var(--font-mono);
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--green-dim);
  }

  .stat-label {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  /* Browse Section */
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    margin-bottom: var(--space-6);
    flex-wrap: wrap;
  }

  .content-section h2 {
    font-family: var(--font-serif);
    font-size: var(--text-2xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0;
  }

  .layer-filters {
    display: flex;
    gap: var(--space-2);
  }

  .layer-pill {
    padding: var(--space-1) var(--space-3);
    background: transparent;
    border: 1px solid var(--border);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .layer-pill:hover {
    border-color: var(--green-dim);
    color: var(--text-primary);
  }

  .layer-pill.active {
    border-color: var(--green-dim);
    background: rgba(0, 196, 154, 0.1);
    color: var(--green-dim);
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
  }

  .skills-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  /* Guides Section */
  .guides-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--space-4);
    margin-bottom: var(--space-6);
  }

  .guide-card {
    display: block;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    padding: var(--space-5);
    text-decoration: none;
    transition: all var(--transition-fast);
  }

  .guide-card:hover {
    border-color: var(--green-dim);
  }

  .guide-icon {
    color: var(--green-dim);
    margin-bottom: var(--space-3);
  }

  .guide-card h3 {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--space-2);
  }

  .guide-card p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0 0 var(--space-3);
    line-height: 1.5;
  }

  .guide-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--green-dim);
  }

  .quick-tips h3 {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin: 0 0 var(--space-3);
  }

  .tip-item {
    border: 1px solid var(--border);
    margin-bottom: var(--space-2);
  }

  .tip-question {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    width: 100%;
    padding: var(--space-3) var(--space-4);
    background: var(--bg-secondary);
    border: none;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-primary);
    text-align: left;
    cursor: pointer;
    transition: background var(--transition-fast);
  }

  .tip-question:hover {
    background: rgba(0, 196, 154, 0.05);
  }

  .tip-answer {
    padding: var(--space-3) var(--space-4);
    padding-left: calc(var(--space-4) + 16px + var(--space-3));
    background: var(--bg-primary);
    border-top: 1px solid var(--border);
  }

  .tip-answer p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.6;
  }

  /* Create Section */
  .create-cta {
    display: flex;
    gap: var(--space-5);
    padding: var(--space-6);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
  }

  .cta-icon {
    color: var(--green-dim);
    flex-shrink: 0;
  }

  .cta-content h3 {
    font-family: var(--font-mono);
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--space-2);
  }

  .cta-content p {
    font-size: var(--text-base);
    color: var(--text-secondary);
    margin: 0 0 var(--space-4);
  }

  .cta-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    background: transparent;
    border: 1px solid var(--green-dim);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--green-dim);
    text-decoration: none;
    transition: all var(--transition-fast);
  }

  .cta-btn:hover {
    background: var(--green-dim);
    color: var(--bg-primary);
  }

  /* Resources Section */
  .resources-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .resource-group h3 {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin: 0 0 var(--space-3);
  }

  .resource-link {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) 0;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    text-decoration: none;
    transition: color var(--transition-fast);
  }

  .resource-link:hover {
    color: var(--green-dim);
  }

  /* Mobile */
  @media (max-width: 900px) {
    .skills-layout {
      flex-direction: column;
    }

    .skills-content {
      padding: var(--space-6) var(--space-4);
    }

    .overview-hero h1 {
      font-size: var(--text-3xl);
    }

    .stats-bar {
      flex-wrap: wrap;
      gap: var(--space-4);
    }

    .section-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .skills-list {
      gap: var(--space-2);
    }

    .guides-grid {
      grid-template-columns: 1fr;
    }

    .create-cta {
      flex-direction: column;
    }
  }
</style>
