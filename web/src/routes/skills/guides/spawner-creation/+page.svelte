<!-- web/src/routes/skills/guides/spawner-creation/+page.svelte -->
<script lang="ts">
  import { goto } from '$app/navigation';
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import SkillsSidebar from '$lib/components/SkillsSidebar.svelte';
  import Icon from '$lib/components/Icon.svelte';

  let activeSection = $state('guides');
  let activeCategory = $state<string | null>(null);
  let searchQuery = $state('');

  function handleSectionChange(section: string) {
    goto(`/skills?section=${section}`);
  }

  function handleCategoryChange(category: string | null) {
    goto(`/skills?category=${category || ''}`);
  }

  function handleSearchChange(query: string) {
    searchQuery = query;
    if (query) {
      goto(`/skills?search=${encodeURIComponent(query)}`);
    }
  }
</script>

<svelte:head>
  <title>Creating Skills with Spawner | VibeShip</title>
  <meta name="description" content="Use Spawner MCP tools to generate quality skills automatically." />
</svelte:head>

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

  <main class="guide-page">
  <header class="guide-header">
    <a href="/skills" class="back-link">
      <Icon name="arrow-left" size={16} />
      Back to Skills
    </a>
    <h1>Creating Skills with Spawner</h1>
    <p class="guide-subtitle">Use MCP tools to generate quality skills automatically.</p>
  </header>

  <article class="guide-content">
    <section class="guide-section">
      <h2>The Skill Creation Pipeline</h2>
      <p>Spawner provides a structured pipeline for creating high-quality skills:</p>
      <div class="pipeline-grid">
        <div class="pipeline-step">
          <span class="step-number">1</span>
          <div class="step-content">
            <h4>Brainstorm (Optional)</h4>
            <p>Explore the skill domain</p>
          </div>
        </div>
        <div class="pipeline-step">
          <span class="step-number">2</span>
          <div class="step-content">
            <h4>Research</h4>
            <p>Gather patterns and gotchas</p>
          </div>
        </div>
        <div class="pipeline-step">
          <span class="step-number">3</span>
          <div class="step-content">
            <h4>Create</h4>
            <p>Generate the 4 YAML files</p>
          </div>
        </div>
        <div class="pipeline-step">
          <span class="step-number">4</span>
          <div class="step-content">
            <h4>Score</h4>
            <p>Validate against rubric</p>
          </div>
        </div>
      </div>
    </section>

    <section class="guide-section">
      <h2>Step 1: Brainstorm (Optional)</h2>
      <p>If you're not sure what the skill should cover, start with brainstorming:</p>
      <div class="code-block">
        <code>spawner_skill_brainstorm(&#123; topic: "API rate limiting patterns" &#125;)</code>
      </div>
      <p>This explores the domain and identifies:</p>
      <ul>
        <li>Key patterns to include</li>
        <li>Common mistakes developers make</li>
        <li>Related skills that pair well</li>
        <li>Scope boundaries</li>
      </ul>
    </section>

    <section class="guide-section">
      <h2>Step 2: Research</h2>
      <p>Gather deep knowledge about the skill domain:</p>
      <div class="code-block">
        <code>spawner_skill_research(&#123; skill: "api-rate-limiting" &#125;)</code>
      </div>
      <p>Research produces:</p>
      <ul>
        <li>8-12 patterns with real code examples</li>
        <li>8-12 sharp edges with detection patterns</li>
        <li>Validation checks for common issues</li>
        <li>Collaboration points with other skills</li>
      </ul>
    </section>

    <section class="guide-section">
      <h2>Step 3: Create</h2>
      <p>Generate the skill's 4 YAML files:</p>
      <div class="code-block">
        <code>spawner_skill_new(&#123; description: "Expert in API rate limiting, backoff strategies, and quota management" &#125;)</code>
      </div>
      <p>This creates:</p>
      <div class="file-list">
        <div class="file-item">
          <Icon name="file-text" size={16} />
          <span>skill.yaml</span>
          <span class="file-desc">Identity, patterns, anti-patterns</span>
        </div>
        <div class="file-item">
          <Icon name="alert-triangle" size={16} />
          <span>sharp-edges.yaml</span>
          <span class="file-desc">Gotchas with detection</span>
        </div>
        <div class="file-item">
          <Icon name="shield" size={16} />
          <span>validations.yaml</span>
          <span class="file-desc">Automated code checks</span>
        </div>
        <div class="file-item">
          <Icon name="git-branch" size={16} />
          <span>collaboration.yaml</span>
          <span class="file-desc">Prerequisites and handoffs</span>
        </div>
      </div>
    </section>

    <section class="guide-section">
      <h2>Step 4: Score</h2>
      <p>Validate your skill against the 100-point quality rubric:</p>
      <div class="code-block">
        <code>spawner_skill_score(&#123; skill: "api-rate-limiting" &#125;)</code>
      </div>
      <p>The scorer checks:</p>
      <ul>
        <li><strong>Identity (15 pts)</strong> - Clear role, specific ownership, actionable triggers</li>
        <li><strong>Patterns (20 pts)</strong> - 8+ patterns with real code examples</li>
        <li><strong>Sharp Edges (25 pts)</strong> - 8-12 gotchas with working detection</li>
        <li><strong>Validations (25 pts)</strong> - 8-12 checks with actionable fixes</li>
        <li><strong>Collaboration (15 pts)</strong> - Prerequisites, pairs-with, handoffs</li>
      </ul>
      <div class="example-box">
        <h4>Minimum Score: 80/100</h4>
        <p>Skills in our library score 80+. If your skill scores lower, the scorer provides specific feedback on what to improve.</p>
      </div>
    </section>

    <section class="guide-section">
      <h2>Upgrading Existing Skills</h2>
      <p>Enhance an existing skill with more depth:</p>
      <div class="code-block">
        <code>spawner_skill_upgrade(&#123; skill: "react-patterns", focus: "hooks and suspense" &#125;)</code>
      </div>
      <p>This adds:</p>
      <ul>
        <li>More patterns for the focus area</li>
        <li>Additional sharp edges</li>
        <li>New validation checks</li>
      </ul>
    </section>

    <section class="guide-section">
      <h2>Next Steps</h2>
      <div class="next-links">
        <a href="/skills/create" class="next-link">
          <Icon name="file-plus" size={20} />
          <div>
            <h4>Manual Skill Creation</h4>
            <p>Step-by-step guide to writing skills by hand</p>
          </div>
          <Icon name="arrow-right" size={16} />
        </a>
        <a href="/skills/guides/skills-mind" class="next-link">
          <Icon name="brain" size={20} />
          <div>
            <h4>Skills + Mind Memory</h4>
            <p>Persistent context across sessions</p>
          </div>
          <Icon name="arrow-right" size={16} />
        </a>
      </div>
    </section>
    </article>
  </main>
</div>

<Footer />

<style>
  .skills-layout {
    display: flex;
    min-height: calc(100vh - 52px);
    gap: 2rem;
  }

  .guide-page {
    flex: 1;
    max-width: 800px;
    padding: var(--space-8) var(--space-6);
  }

  .guide-header {
    max-width: 700px;
    margin-bottom: var(--space-6);
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--text-secondary);
    text-decoration: none;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    margin-bottom: var(--space-4);
    transition: color var(--transition-fast);
  }

  .back-link:hover {
    color: var(--green-dim);
  }

  .guide-header h1 {
    font-family: var(--font-serif);
    font-size: var(--text-4xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0 0 var(--space-3);
  }

  .guide-subtitle {
    font-size: var(--text-lg);
    color: var(--text-secondary);
    margin: 0;
  }

  .guide-content {
    max-width: 700px;
  }

  .guide-section {
    margin-bottom: var(--space-8);
    padding-bottom: var(--space-8);
    border-bottom: 1px solid var(--border);
  }

  .guide-section:last-child {
    border-bottom: none;
  }

  .guide-section h2 {
    font-family: var(--font-serif);
    font-size: var(--text-xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0 0 var(--space-4);
  }

  .guide-section p {
    color: var(--text-secondary);
    line-height: 1.7;
    margin: 0 0 var(--space-4);
  }

  .guide-section ul {
    margin: 0 0 var(--space-4);
    padding-left: var(--space-6);
  }

  .guide-section li {
    color: var(--text-secondary);
    line-height: 1.7;
    margin-bottom: var(--space-2);
  }

  .pipeline-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-3);
    margin-bottom: var(--space-4);
  }

  .pipeline-step {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
  }

  .step-number {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--green-dim);
    color: var(--bg-primary);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    flex-shrink: 0;
  }

  .step-content h4 {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--space-1);
  }

  .step-content p {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    margin: 0;
  }

  .code-block {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    padding: var(--space-4);
    margin-bottom: var(--space-4);
    overflow-x: auto;
  }

  .code-block code {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--green-dim);
  }

  .file-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    margin-bottom: var(--space-4);
  }

  .file-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-3);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-tertiary);
  }

  .file-item span:nth-child(2) {
    color: var(--text-primary);
  }

  .file-desc {
    margin-left: auto;
    font-size: var(--text-xs);
  }

  .example-box {
    background: rgba(0, 196, 154, 0.1);
    border-left: 3px solid var(--green-dim);
    padding: var(--space-4);
    margin-bottom: var(--space-4);
  }

  .example-box h4 {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--green-dim);
    margin: 0 0 var(--space-2);
  }

  .example-box p {
    margin: 0;
    font-size: var(--text-sm);
  }

  .next-links {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .next-link {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-4);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    text-decoration: none;
    transition: border-color var(--transition-fast);
  }

  .next-link:hover {
    border-color: var(--green-dim);
  }

  .next-link > :first-child {
    color: var(--green-dim);
    flex-shrink: 0;
  }

  .next-link > div {
    flex: 1;
  }

  .next-link h4 {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--space-1);
  }

  .next-link p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
  }

  .next-link > :last-child {
    color: var(--text-tertiary);
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    .skills-layout {
      flex-direction: column;
    }

    .guide-header h1 {
      font-size: var(--text-3xl);
    }

    .pipeline-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
