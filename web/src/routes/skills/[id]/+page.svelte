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
