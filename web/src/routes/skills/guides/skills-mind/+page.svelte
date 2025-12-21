<!-- web/src/routes/skills/guides/skills-mind/+page.svelte -->
<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import Icon from '$lib/components/Icon.svelte';
</script>

<svelte:head>
  <title>Skills + Mind Memory | VibeShip</title>
  <meta name="description" content="Learn how Skills and Mind work together for persistent context across sessions." />
</svelte:head>

<Navbar />

<main class="guide-page">
  <header class="guide-header">
    <a href="/skills" class="back-link">
      <Icon name="arrow-left" size={16} />
      Back to Skills
    </a>
    <h1>Skills + Mind Memory</h1>
    <p class="guide-subtitle">Persistent context across sessions. Skills remember your project.</p>
  </header>

  <article class="guide-content">
    <section class="guide-section">
      <h2>The Problem Skills + Mind Solves</h2>
      <p>Without memory, every session starts fresh. Claude doesn't know:</p>
      <ul>
        <li>What decisions you made last week</li>
        <li>Why you chose one approach over another</li>
        <li>What issues you've already encountered</li>
        <li>Your project's specific patterns and preferences</li>
      </ul>
      <p>Skills + Mind changes this. Your project context persists.</p>
    </section>

    <section class="guide-section">
      <h2>How It Works</h2>
      <div class="diagram">
        <div class="diagram-row">
          <div class="diagram-box">
            <h4>Skills</h4>
            <p>Patterns, validations, sharp edges</p>
          </div>
          <div class="diagram-plus">+</div>
          <div class="diagram-box">
            <h4>Mind</h4>
            <p>Decisions, issues, learnings</p>
          </div>
          <div class="diagram-equals">=</div>
          <div class="diagram-box highlight">
            <h4>Context</h4>
            <p>Project-aware AI assistance</p>
          </div>
        </div>
      </div>
      <ul>
        <li><strong>Skills</strong> provide domain expertise (how to do things right)</li>
        <li><strong>Mind</strong> provides project memory (what you've done and why)</li>
        <li>Together, they give Claude the context to help effectively</li>
      </ul>
    </section>

    <section class="guide-section">
      <h2>Setting Up Mind</h2>
      <p>Start each session by loading context:</p>
      <div class="code-block">
        <code>mind_recall()</code>
      </div>
      <p>This loads:</p>
      <ul>
        <li>Recent decisions and their rationale</li>
        <li>Known issues and blockers</li>
        <li>Project-specific learnings</li>
        <li>Your preferred patterns and approaches</li>
      </ul>
    </section>

    <section class="guide-section">
      <h2>Logging to Memory</h2>
      <p>As you work, log important information:</p>
      <div class="code-examples">
        <div class="code-block">
          <span class="code-label">Decisions</span>
          <code>mind_log("chose Redis over Memcached - need pub/sub", type="decision")</code>
        </div>
        <div class="code-block">
          <span class="code-label">Learnings</span>
          <code>mind_log("Safari needs vendor prefix for backdrop-filter", type="learning")</code>
        </div>
        <div class="code-block">
          <span class="code-label">Issues</span>
          <code>mind_log("API returns 500 on large payloads", type="problem")</code>
        </div>
        <div class="code-block">
          <span class="code-label">Progress</span>
          <code>mind_log("auth flow complete, moving to dashboard", type="progress")</code>
        </div>
      </div>
    </section>

    <section class="guide-section">
      <h2>Skills + Mind in Practice</h2>
      <p>Example workflow:</p>
      <ol class="workflow-list">
        <li>
          <strong>Session starts</strong>
          <code>mind_recall()</code>
          <p>Claude knows: "Last session we implemented auth with Supabase. There's an open issue with email verification timing out."</p>
        </li>
        <li>
          <strong>Load relevant skill</strong>
          <code>spawner_skills(&#123; action: "load", skill: "supabase-patterns" &#125;)</code>
          <p>Claude now has Supabase-specific patterns AND your project context.</p>
        </li>
        <li>
          <strong>Work with full context</strong>
          <p>When you hit the timeout issue again, Claude already knows about it and can suggest the fix you discussed.</p>
        </li>
        <li>
          <strong>Log new learnings</strong>
          <code>mind_log("fixed timeout by increasing Supabase function limit", type="learning")</code>
        </li>
      </ol>
    </section>

    <section class="guide-section">
      <h2>Memory Types</h2>
      <div class="memory-types">
        <div class="memory-type">
          <h4>MEMORY.md (Permanent)</h4>
          <p>Cross-session knowledge that matters long-term:</p>
          <ul>
            <li>Decisions</li>
            <li>Learnings</li>
            <li>Problems</li>
            <li>Progress</li>
          </ul>
        </div>
        <div class="memory-type">
          <h4>SESSION.md (Ephemeral)</h4>
          <p>Current session context:</p>
          <ul>
            <li>Experiences</li>
            <li>Blockers</li>
            <li>Rejected approaches</li>
            <li>Assumptions</li>
          </ul>
          <p class="note">Valuable items auto-promote to MEMORY.md after 30+ minute gaps.</p>
        </div>
      </div>
    </section>

    <section class="guide-section">
      <h2>Next Steps</h2>
      <div class="next-links">
        <a href="/skills/guides/getting-started" class="next-link">
          <Icon name="book-open" size={20} />
          <div>
            <h4>Getting Started with Skills</h4>
            <p>Load your first skill</p>
          </div>
          <Icon name="arrow-right" size={16} />
        </a>
        <a href="/skills" class="next-link">
          <Icon name="grid" size={20} />
          <div>
            <h4>Browse All Skills</h4>
            <p>Explore the full skills library</p>
          </div>
          <Icon name="arrow-right" size={16} />
        </a>
      </div>
    </section>
  </article>
</main>

<Footer />

<style>
  .guide-page {
    min-height: 100vh;
    padding-top: 52px;
  }

  .guide-header {
    max-width: 700px;
    margin: 0 auto;
    padding: var(--space-8) var(--space-6) var(--space-6);
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
    margin: 0 auto;
    padding: 0 var(--space-6) var(--space-12);
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

  .guide-section ul, .guide-section ol {
    margin: 0 0 var(--space-4);
    padding-left: var(--space-6);
  }

  .guide-section li {
    color: var(--text-secondary);
    line-height: 1.7;
    margin-bottom: var(--space-2);
  }

  .diagram {
    margin-bottom: var(--space-4);
  }

  .diagram-row {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  .diagram-box {
    padding: var(--space-3);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    text-align: center;
  }

  .diagram-box.highlight {
    border-color: var(--green-dim);
    background: rgba(0, 196, 154, 0.1);
  }

  .diagram-box h4 {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--space-1);
  }

  .diagram-box.highlight h4 {
    color: var(--green-dim);
  }

  .diagram-box p {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    margin: 0;
  }

  .diagram-plus, .diagram-equals {
    font-family: var(--font-mono);
    font-size: var(--text-xl);
    color: var(--text-tertiary);
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

  .code-examples {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .code-examples .code-block {
    margin-bottom: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .code-label {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .workflow-list {
    list-style: none;
    padding: 0;
    counter-reset: workflow;
  }

  .workflow-list li {
    position: relative;
    padding: var(--space-4);
    padding-left: var(--space-8);
    margin-bottom: var(--space-3);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    counter-increment: workflow;
  }

  .workflow-list li::before {
    content: counter(workflow);
    position: absolute;
    left: var(--space-3);
    top: var(--space-4);
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--green-dim);
    color: var(--bg-primary);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 600;
  }

  .workflow-list li strong {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-primary);
    margin-bottom: var(--space-2);
  }

  .workflow-list li code {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--green-dim);
    margin-bottom: var(--space-2);
  }

  .workflow-list li p {
    font-size: var(--text-sm);
    margin: 0;
  }

  .memory-types {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-4);
  }

  .memory-type {
    padding: var(--space-4);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
  }

  .memory-type h4 {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--green-dim);
    margin: 0 0 var(--space-2);
  }

  .memory-type p {
    font-size: var(--text-sm);
    margin: 0 0 var(--space-2);
  }

  .memory-type ul {
    margin: 0;
    padding-left: var(--space-4);
    font-size: var(--text-sm);
  }

  .memory-type .note {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    font-style: italic;
    margin-top: var(--space-2);
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
    .guide-header h1 {
      font-size: var(--text-3xl);
    }

    .diagram-row {
      flex-direction: column;
    }

    .diagram-plus, .diagram-equals {
      display: none;
    }

    .memory-types {
      grid-template-columns: 1fr;
    }
  }
</style>
