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

  // Tab navigation
  type TabId = 'overview' | 'patterns' | 'gotchas' | 'collaboration';
  let activeTab = $state<TabId>('overview');

  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: 'overview', label: 'Overview', icon: 'info' },
    { id: 'patterns', label: 'Patterns', icon: 'check-circle' },
    { id: 'gotchas', label: 'Gotchas', icon: 'alert-triangle' },
    { id: 'collaboration', label: 'Collaboration', icon: 'users' }
  ];

  // Helper to split identity into paragraphs - creates natural reading breaks
  function splitIntoParagraphs(text: string): string[] {
    if (!text) return [];

    // First, filter out numbered list items and principles (e.g., "1. Something 2. Something else")
    // Stop at the first numbered item or bullet point pattern
    const numberedListPattern = /\s*\d+\.\s+[A-Z]/;
    const bulletPattern = /\s*[-•]\s+/;

    let proseText = text;
    const numberedMatch = text.search(numberedListPattern);
    const bulletMatch = text.search(bulletPattern);

    // Find where lists start and cut there
    let cutPoint = -1;
    if (numberedMatch > 50) cutPoint = numberedMatch; // Only cut if there's enough prose before
    if (bulletMatch > 50 && (cutPoint === -1 || bulletMatch < cutPoint)) cutPoint = bulletMatch;

    if (cutPoint > 0) {
      // Find the last complete sentence before the list
      const beforeList = text.slice(0, cutPoint);
      const lastSentenceEnd = Math.max(
        beforeList.lastIndexOf('. '),
        beforeList.lastIndexOf('! '),
        beforeList.lastIndexOf('? ')
      );
      if (lastSentenceEnd > 50) {
        proseText = text.slice(0, lastSentenceEnd + 1).trim();
      }
    }

    // Split on sentences
    const sentences = proseText.match(/[^.!?]+[.!?]+/g) || [proseText];
    if (sentences.length <= 2) return [proseText];

    // For longer text, aim for 2-3 paragraphs with breaks near the middle
    const totalSentences = sentences.length;
    const midpoint = Math.ceil(totalSentences / 2);

    // Find the best break point near the middle (prefer topic shifts)
    const topicShiftPattern = /^(You |This skill|Great |The best|If |When |Every |We |I |Your )/i;

    let bestBreak = midpoint;
    // Look for a topic shift within 1-2 sentences of the midpoint
    for (let offset = 0; offset <= 2; offset++) {
      const checkPoints = [midpoint + offset, midpoint - offset].filter(p => p > 0 && p < totalSentences);
      for (const point of checkPoints) {
        if (topicShiftPattern.test(sentences[point]?.trim() || '')) {
          bestBreak = point;
          break;
        }
      }
      if (bestBreak !== midpoint) break;
    }

    // Create paragraphs
    const paragraphs: string[] = [];

    // First paragraph
    const firstPara = sentences.slice(0, bestBreak).map(s => s.trim()).join(' ');
    if (firstPara) paragraphs.push(firstPara);

    // Second paragraph (and possibly third if very long)
    const remaining = sentences.slice(bestBreak);
    if (remaining.length > 4) {
      // Split remaining into two more paragraphs
      const secondBreak = Math.ceil(remaining.length / 2);
      paragraphs.push(remaining.slice(0, secondBreak).map(s => s.trim()).join(' '));
      paragraphs.push(remaining.slice(secondBreak).map(s => s.trim()).join(' '));
    } else {
      paragraphs.push(remaining.map(s => s.trim()).join(' '));
    }

    return paragraphs.filter(p => p.length > 0);
  }

  // Extract a TL;DR from the first sentence
  function getTldr(text: string): string {
    if (!text) return '';
    const firstSentence = text.match(/^[^.!?]+[.!?]/);
    return firstSentence ? firstSentence[0].trim() : text.slice(0, 80) + '...';
  }

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
        <div class="skill-description">
          {#each skill.description.split('\n\n').filter(p => p.trim()) as paragraph, i}
            <p class:lead={i === 0}>{paragraph.replace(/\n/g, ' ')}</p>
          {/each}
        </div>
      </header>

      <!-- Tab Navigation -->
      <nav class="tab-nav">
        {#each tabs as tab}
          <button
            class="tab-btn"
            class:active={activeTab === tab.id}
            onclick={() => activeTab = tab.id}
          >
            <Icon name={tab.icon} size={16} />
            <span>{tab.label}</span>
          </button>
        {/each}
      </nav>

      <!-- Tab Content -->
      <div class="tab-content">

        <!-- OVERVIEW TAB -->
        {#if activeTab === 'overview'}
          <section class="tab-panel">
            <!-- Clean intro - just the key message -->
            <div class="skill-intro">
              <p>{getTldr(skill.identity)}</p>
            </div>

            <!-- What this skill covers -->
            {#if skill.owns?.length}
              <div class="covers-section">
                <h3>
                  <Icon name="layers" size={16} />
                  What This Skill Covers
                </h3>
                <div class="covers-grid">
                  {#each skill.owns as item}
                    <span class="covers-item">
                      <Icon name="check" size={14} />
                      {item}
                    </span>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Quick stats row -->
            <div class="stats-row">
              {#if skill.patterns?.length}
                <button class="stat-pill" onclick={() => activeTab = 'patterns'}>
                  <span class="stat-num">{skill.patterns.length}</span>
                  <span>patterns</span>
                </button>
              {/if}
              {#if skill.anti_patterns?.length}
                <button class="stat-pill" onclick={() => activeTab = 'patterns'}>
                  <span class="stat-num">{skill.anti_patterns.length}</span>
                  <span>anti-patterns</span>
                </button>
              {/if}
              {#if skill.sharp_edges?.length}
                <button class="stat-pill warning" onclick={() => activeTab = 'gotchas'}>
                  <span class="stat-num">{skill.sharp_edges.length}</span>
                  <span>gotchas</span>
                </button>
              {/if}
              {#if skill.validations?.length}
                <button class="stat-pill" onclick={() => activeTab = 'gotchas'}>
                  <span class="stat-num">{skill.validations.length}</span>
                  <span>auto-checks</span>
                </button>
              {/if}
            </div>

            <!-- Related skills -->
            {#if skill.pairs_with?.length}
              <div class="related-section">
                <h3>
                  <Icon name="users" size={16} />
                  Works Well With
                </h3>
                <div class="related-links">
                  {#each skill.pairs_with as id}
                    <a href="/skills/{id}" class="related-link">{id}</a>
                  {/each}
                </div>
              </div>
            {/if}
          </section>
        {/if}

        <!-- PATTERNS TAB -->
        {#if activeTab === 'patterns'}
          <section class="tab-panel">
            <!-- Best Practices -->
            {#if skill.patterns?.length}
              <div class="content-block">
                <h3>
                  <Icon name="check-circle" size={18} />
                  Best Practices
                </h3>
                <div class="items-list">
                  {#each skill.patterns as pattern}
                    <div class="item-card pattern">
                      <h4>{pattern.name}</h4>
                      <p>{pattern.description}</p>
                      {#if pattern.when}
                        <div class="item-meta">
                          <span class="meta-label">When:</span>
                          <span>{pattern.when}</span>
                        </div>
                      {/if}
                    </div>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Anti-Patterns -->
            {#if skill.anti_patterns?.length}
              <div class="content-block">
                <h3>
                  <Icon name="x-circle" size={18} />
                  Anti-Patterns
                </h3>
                <div class="items-list">
                  {#each skill.anti_patterns as anti}
                    <div class="item-card anti-pattern">
                      <h4>{anti.name}</h4>
                      <p>{anti.description}</p>
                      {#if anti.why}
                        <div class="item-meta">
                          <span class="meta-label">Why it fails:</span>
                          <span>{anti.why}</span>
                        </div>
                      {/if}
                      {#if anti.instead}
                        <div class="item-meta success">
                          <span class="meta-label">Instead:</span>
                          <span>{anti.instead}</span>
                        </div>
                      {/if}
                    </div>
                  {/each}
                </div>
              </div>
            {/if}

            {#if !skill.patterns?.length && !skill.anti_patterns?.length}
              <div class="empty-state">
                <Icon name="info" size={24} />
                <p>No patterns documented for this skill yet.</p>
              </div>
            {/if}
          </section>
        {/if}

        <!-- GOTCHAS TAB -->
        {#if activeTab === 'gotchas'}
          <section class="tab-panel">
            <!-- Sharp Edges -->
            {#if skill.sharp_edges?.length}
              <div class="content-block">
                <h3>
                  <Icon name="alert-triangle" size={18} />
                  Sharp Edges
                </h3>
                <p class="block-description">Common pitfalls and gotchas to watch out for.</p>
                <div class="items-list">
                  {#each skill.sharp_edges as edge}
                    <div class="item-card edge severity-{edge.severity}">
                      <div class="edge-header">
                        <span class="edge-severity {edge.severity}">{edge.severity}</span>
                        <h4>{edge.summary}</h4>
                      </div>
                      <p>{edge.why}</p>
                      {#if edge.situation}
                        <div class="item-meta">
                          <span class="meta-label">Situation:</span>
                          <span>{edge.situation}</span>
                        </div>
                      {/if}
                      {#if edge.solution}
                        <div class="item-meta success">
                          <span class="meta-label">Solution:</span>
                          <span>{edge.solution}</span>
                        </div>
                      {/if}
                    </div>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Automatic Validations -->
            {#if skill.validations?.length}
              <div class="content-block">
                <h3>
                  <Icon name="shield" size={18} />
                  Automatic Checks
                </h3>
                <p class="block-description">These validations run automatically when this skill is active.</p>
                <div class="items-list">
                  {#each skill.validations as validation}
                    <div class="item-card validation">
                      <div class="validation-header">
                        <span class="validation-severity {validation.severity}">{validation.severity}</span>
                        <h4>{validation.name}</h4>
                      </div>
                      <p>{validation.description || validation.message}</p>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}

            {#if !skill.sharp_edges?.length && !skill.validations?.length}
              <div class="empty-state">
                <Icon name="check-circle" size={24} />
                <p>No gotchas documented for this skill.</p>
              </div>
            {/if}
          </section>
        {/if}

        <!-- COLLABORATION TAB -->
        {#if activeTab === 'collaboration'}
          <section class="tab-panel">
            <!-- Prerequisites -->
            {#if skill.requires?.length || skill.collaboration?.prerequisites?.length}
              <div class="content-block">
                <h3>
                  <Icon name="arrow-up-circle" size={18} />
                  Prerequisites
                </h3>
                <div class="prereq-list">
                  {#each skill.requires || skill.collaboration?.prerequisites || [] as prereq}
                    <a href="/skills/{prereq}" class="prereq-link">
                      <Icon name="arrow-right" size={14} />
                      {prereq}
                    </a>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Handoffs -->
            {#if skill.handoffs?.length}
              <div class="content-block">
                <h3>
                  <Icon name="git-branch" size={18} />
                  Handoffs
                </h3>
                <p class="block-description">When this skill should delegate to another.</p>
                <div class="items-list">
                  {#each skill.handoffs as handoff}
                    <div class="item-card handoff">
                      <div class="handoff-header">
                        <span class="handoff-trigger">{handoff.trigger}</span>
                        <Icon name="arrow-right" size={14} />
                        <a href="/skills/{handoff.to}" class="handoff-to">{handoff.to}</a>
                      </div>
                      {#if handoff.context}
                        <p class="handoff-context">{handoff.context}</p>
                      {/if}
                    </div>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Cross-Domain Insights -->
            {#if skill.collaboration?.cross_domain?.length}
              <div class="content-block">
                <h3>
                  <Icon name="layers" size={18} />
                  Cross-Domain Insights
                </h3>
                <div class="items-list">
                  {#each skill.collaboration.cross_domain as insight}
                    <div class="item-card insight">
                      <span class="insight-domain">{insight.domain}</span>
                      <p>{insight.insight}</p>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Delegates To -->
            {#if skill.collaboration?.delegates_to?.length}
              <div class="content-block">
                <h3>
                  <Icon name="send" size={18} />
                  Delegates To
                </h3>
                <div class="items-list">
                  {#each skill.collaboration.delegates_to as delegation}
                    <div class="item-card delegation">
                      <div class="delegation-header">
                        <span class="delegation-when">{delegation.when}</span>
                      </div>
                      <div class="delegation-target">
                        <Icon name="arrow-right" size={14} />
                        <a href="/skills/{delegation.to}">{delegation.to}</a>
                      </div>
                      {#if delegation.handoff}
                        <p class="delegation-handoff">{delegation.handoff}</p>
                      {/if}
                    </div>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Works Well With -->
            {#if skill.pairs_with?.length}
              <div class="content-block">
                <h3>
                  <Icon name="users" size={18} />
                  Works Well With
                </h3>
                <div class="related-links">
                  {#each skill.pairs_with as id}
                    <a href="/skills/{id}" class="related-link">{id}</a>
                  {/each}
                </div>
              </div>
            {/if}

            {#if !skill.requires?.length && !skill.handoffs?.length && !skill.collaboration && !skill.pairs_with?.length}
              <div class="empty-state">
                <Icon name="users" size={24} />
                <p>No collaboration info documented for this skill.</p>
              </div>
            {/if}
          </section>
        {/if}

      </div>
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
    margin-bottom: var(--space-6);
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
    max-width: 560px;
  }

  .skill-description p {
    font-family: var(--font-sans);
    font-size: 0.875rem;
    color: var(--text-primary);
    line-height: 1.7;
    margin: 0 0 var(--space-3) 0;
  }

  .skill-description p.lead {
    font-size: 1rem;
    color: var(--text-primary);
    line-height: 1.65;
    margin-bottom: var(--space-4);
  }

  .skill-description p:last-child {
    margin-bottom: 0;
  }

  /* Tab Navigation */
  .tab-nav {
    display: flex;
    gap: var(--space-1);
    margin-bottom: var(--space-6);
    border-bottom: 1px solid var(--border);
    padding-bottom: var(--space-1);
  }

  .tab-btn {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    background: transparent;
    border: none;
    border-bottom: 2px solid transparent;
    color: var(--text-tertiary);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
    margin-bottom: -1px;
  }

  .tab-btn:hover {
    color: var(--text-secondary);
  }

  .tab-btn.active {
    color: var(--green-dim);
    border-bottom-color: var(--green-dim);
  }

  .tab-btn :global(svg) {
    opacity: 0.7;
  }

  .tab-btn.active :global(svg) {
    opacity: 1;
  }

  /* Tab Content */
  .tab-content {
    min-height: 400px;
  }

  .tab-panel {
    animation: fadeIn 0.2s ease-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(4px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Skill intro - clean single statement */
  .skill-intro {
    margin-bottom: var(--space-6);
    background: var(--bg-secondary);
    border-left: 2px solid var(--green-dim);
    padding: var(--space-3) var(--space-4);
  }

  .skill-intro p {
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    color: var(--text-primary);
    line-height: 1.65;
    margin: 0;
    max-width: 520px;
  }

  /* What this skill covers */
  .covers-section {
    margin-bottom: var(--space-6);
  }

  .covers-section h3 {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 var(--space-3);
  }

  .covers-section h3 :global(svg) {
    color: var(--text-tertiary);
    opacity: 0.7;
  }

  .covers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--space-2);
  }

  .covers-item {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    padding: var(--space-2) var(--space-3);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
  }

  .covers-item :global(svg) {
    color: var(--green-dim);
    flex-shrink: 0;
  }

  /* Stats row (pills) */
  .stats-row {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-bottom: var(--space-6);
  }

  .stat-pill {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .stat-pill:hover {
    border-color: var(--green-dim);
    color: var(--text-primary);
  }

  .stat-pill.warning:hover {
    border-color: #ffa94d;
  }

  .stat-num {
    font-weight: 600;
    color: var(--green-dim);
  }

  .stat-pill.warning .stat-num {
    color: #ffa94d;
  }

  /* Content blocks in tabs */
  .content-block {
    margin-bottom: var(--space-8);
  }

  .content-block h3 {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 var(--space-3);
  }

  .content-block h3 :global(svg) {
    color: var(--text-tertiary);
    opacity: 0.7;
  }

  .block-description {
    font-size: var(--text-sm);
    color: var(--text-tertiary);
    margin: 0 0 var(--space-4);
  }

  /* Items list */
  .items-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .item-card {
    padding: var(--space-4);
    background: var(--bg-secondary);
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

  /* Pattern cards */
  .item-card.pattern {
    border-left: 3px solid var(--green-dim);
  }

  /* Anti-pattern cards */
  .item-card.anti-pattern {
    border-left: 3px solid #ff6b6b;
  }

  /* Item meta info */
  .item-meta {
    display: flex;
    gap: var(--space-2);
    margin-top: var(--space-3);
    padding-top: var(--space-3);
    border-top: 1px solid var(--border);
    font-size: var(--text-sm);
  }

  .meta-label {
    font-family: var(--font-mono);
    font-weight: 600;
    color: var(--text-tertiary);
    flex-shrink: 0;
  }

  .item-meta span:last-child {
    color: var(--text-secondary);
  }

  .item-meta.success .meta-label {
    color: var(--green-dim);
  }

  /* Edge cards */
  .item-card.edge {
    border-left: 3px solid var(--text-tertiary);
  }

  .item-card.severity-critical {
    border-left-color: #ff6b6b;
  }

  .item-card.severity-high {
    border-left-color: #ffa94d;
  }

  .item-card.severity-medium {
    border-left-color: #ffd43b;
  }

  .item-card.severity-low {
    border-left-color: #69db7c;
  }

  .edge-header, .validation-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-2);
  }

  .edge-severity, .validation-severity {
    font-family: var(--font-mono);
    font-size: 10px;
    font-weight: 600;
    padding: 2px 6px;
    text-transform: uppercase;
  }

  .edge-severity.critical, .validation-severity.error { background: rgba(255, 107, 107, 0.15); color: #ff6b6b; }
  .edge-severity.high { background: rgba(255, 169, 77, 0.15); color: #ffa94d; }
  .edge-severity.medium, .validation-severity.warning { background: rgba(255, 212, 59, 0.15); color: #ffd43b; }
  .edge-severity.low, .validation-severity.info { background: rgba(105, 219, 124, 0.15); color: #69db7c; }

  .edge-header h4, .validation-header h4 {
    margin: 0;
  }

  /* Validation cards */
  .item-card.validation {
    border-left: 3px solid #6496ff;
  }

  /* Handoff cards */
  .item-card.handoff {
    border-left: 3px solid #b482ff;
  }

  .handoff-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-2);
  }

  .handoff-trigger {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-primary);
  }

  .handoff-header :global(svg) {
    color: var(--text-tertiary);
  }

  .handoff-to {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--green-dim);
    text-decoration: none;
  }

  .handoff-to:hover {
    text-decoration: underline;
  }

  .handoff-context {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
  }

  /* Prerequisites */
  .prereq-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .prereq-link {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    text-decoration: none;
    transition: all var(--transition-fast);
  }

  .prereq-link:hover {
    border-color: var(--green-dim);
    color: var(--green-dim);
  }

  .prereq-link :global(svg) {
    color: var(--text-tertiary);
  }

  /* Insight cards */
  .item-card.insight {
    border-left: 3px solid #6496ff;
  }

  .insight-domain {
    display: inline-block;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 600;
    padding: 2px 8px;
    background: rgba(100, 150, 255, 0.15);
    color: #6496ff;
    text-transform: uppercase;
    margin-bottom: var(--space-2);
  }

  /* Delegation cards */
  .item-card.delegation {
    border-left: 3px solid #b482ff;
  }

  .delegation-header {
    margin-bottom: var(--space-2);
  }

  .delegation-when {
    font-size: var(--text-sm);
    color: var(--text-primary);
  }

  .delegation-target {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-2);
  }

  .delegation-target :global(svg) {
    color: var(--text-tertiary);
  }

  .delegation-target a {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--green-dim);
    text-decoration: none;
  }

  .delegation-target a:hover {
    text-decoration: underline;
  }

  .delegation-handoff {
    font-size: var(--text-sm);
    color: var(--text-tertiary);
    margin: 0;
  }

  /* Empty state */
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-12);
    text-align: center;
    color: var(--text-tertiary);
  }

  .empty-state :global(svg) {
    margin-bottom: var(--space-3);
    opacity: 0.5;
  }

  .empty-state p {
    margin: 0;
    font-size: var(--text-sm);
  }

  /* Related */
  .related-section {
    margin-top: var(--space-6);
    padding-top: var(--space-6);
    border-top: 1px solid var(--border);
  }

  .related-section h3 {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0 0 var(--space-3);
  }

  .related-section h3 :global(svg) {
    color: var(--text-tertiary);
    opacity: 0.7;
  }

  .content-block .related-section {
    margin-top: 0;
    padding-top: 0;
    border-top: none;
  }

  .content-block .related-section h3 {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-base);
    color: var(--text-primary);
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

    .tab-nav {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .tab-btn {
      padding: var(--space-2) var(--space-3);
      white-space: nowrap;
    }

    .tab-btn span {
      display: none;
    }

    .covers-grid {
      grid-template-columns: 1fr;
    }

    .stats-row {
      flex-direction: column;
    }

    .tldr {
      flex-direction: column;
      gap: var(--space-2);
    }
  }
</style>
