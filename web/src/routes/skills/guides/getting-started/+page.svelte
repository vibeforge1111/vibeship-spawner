<!-- web/src/routes/skills/guides/getting-started/+page.svelte -->
<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import Icon from '$lib/components/Icon.svelte';
</script>

<svelte:head>
  <title>Getting Started with Skills | VibeShip</title>
  <meta name="description" content="Learn how to load your first skill and see it catch issues in your code." />
</svelte:head>

<Navbar />

<main class="guide-page">
  <header class="guide-header">
    <a href="/skills" class="back-link">
      <Icon name="arrow-left" size={16} />
      Back to Skills
    </a>
    <h1>Getting Started with Skills</h1>
    <p class="guide-subtitle">Load your first skill, see it catch issues in your code.</p>
  </header>

  <article class="guide-content">
    <section class="guide-section">
      <h2>What You'll Learn</h2>
      <ul class="checklist">
        <li>How to load a skill using Spawner MCP tools</li>
        <li>What happens when a skill is active</li>
        <li>How to see skills catching issues in real-time</li>
        <li>How to customize skill behavior</li>
      </ul>
    </section>

    <section class="guide-section">
      <h2>Prerequisites</h2>
      <p>Before you begin, make sure you have:</p>
      <ul>
        <li>Claude Code or Claude Desktop installed</li>
        <li>Spawner MCP server connected (see <a href="/">setup guide</a>)</li>
        <li>A project to work on</li>
      </ul>
    </section>

    <section class="guide-section">
      <h2>Step 1: List Available Skills</h2>
      <p>First, see what skills are available:</p>
      <div class="code-block">
        <code>spawner_skills(&#123; action: "list" &#125;)</code>
      </div>
      <p>This returns all 43+ skills organized by category. You'll see skills for development, frameworks, design, marketing, and more.</p>
    </section>

    <section class="guide-section">
      <h2>Step 2: Load a Skill</h2>
      <p>Load a skill that matches what you're working on. For example, if you're building a TypeScript project:</p>
      <div class="code-block">
        <code>spawner_skills(&#123; action: "load", skill: "typescript-patterns" &#125;)</code>
      </div>
      <p>When a skill loads, Claude receives:</p>
      <ul>
        <li><strong>Identity</strong> - The expert persona and what it owns</li>
        <li><strong>Patterns</strong> - Best practices to follow with code examples</li>
        <li><strong>Anti-patterns</strong> - Things to avoid</li>
        <li><strong>Sharp edges</strong> - Gotchas and pitfalls to watch for</li>
        <li><strong>Validations</strong> - Automated checks to run on your code</li>
      </ul>
    </section>

    <section class="guide-section">
      <h2>Step 3: See It In Action</h2>
      <p>With the skill loaded, start coding. The skill will:</p>
      <ul>
        <li>Catch common mistakes before they become bugs</li>
        <li>Suggest better patterns when it sees anti-patterns</li>
        <li>Warn you about sharp edges specific to your tech stack</li>
        <li>Run validations on code you write</li>
      </ul>
      <div class="example-box">
        <h4>Example: TypeScript Patterns Skill</h4>
        <p>If you write code with implicit `any` types, the skill will catch it and suggest explicit typing.</p>
      </div>
    </section>

    <section class="guide-section">
      <h2>Step 4: Load Multiple Skills</h2>
      <p>Skills are designed to work together. Load a "squad" for complex tasks:</p>
      <div class="code-block">
        <code>spawner_skills(&#123; action: "squad", squad: "auth-complete" &#125;)</code>
      </div>
      <p>Squads are pre-configured skill combinations. The "auth-complete" squad loads authentication, security, and database skills together.</p>
    </section>

    <section class="guide-section">
      <h2>Next Steps</h2>
      <div class="next-links">
        <a href="/skills/guides/spawner-creation" class="next-link">
          <Icon name="wrench" size={20} />
          <div>
            <h4>Creating Skills with Spawner</h4>
            <p>Learn to generate custom skills</p>
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

  .guide-section ul {
    margin: 0 0 var(--space-4);
    padding-left: var(--space-6);
  }

  .guide-section li {
    color: var(--text-secondary);
    line-height: 1.7;
    margin-bottom: var(--space-2);
  }

  .guide-section a {
    color: var(--green-dim);
    text-decoration: none;
  }

  .guide-section a:hover {
    text-decoration: underline;
  }

  .checklist {
    list-style: none;
    padding: 0;
  }

  .checklist li {
    position: relative;
    padding-left: var(--space-6);
  }

  .checklist li::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.5em;
    width: 16px;
    height: 16px;
    border: 1px solid var(--green-dim);
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
    .guide-header h1 {
      font-size: var(--text-3xl);
    }
  }
</style>
