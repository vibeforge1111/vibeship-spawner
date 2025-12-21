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
