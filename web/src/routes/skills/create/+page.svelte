<script lang="ts">
  import { goto } from '$app/navigation';
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import SkillsSidebar from '$lib/components/SkillsSidebar.svelte';
  import Icon from '$lib/components/Icon.svelte';

  let currentStep = $state(0);

  // Sidebar state - 'create' is active on this page
  let activeSection = $state('create');
  let activeCategory = $state<string | null>(null);
  let searchQuery = $state('');

  function handleSectionChange(section: string) {
    if (section === 'create') return; // Already here
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

  const steps = [
    { id: 'identity', title: 'Identity', description: 'Who your skill is and what it owns' },
    { id: 'patterns', title: 'Patterns', description: 'Best practices with code examples' },
    { id: 'sharp-edges', title: 'Sharp Edges', description: 'Gotchas with detection patterns' },
    { id: 'validations', title: 'Validations', description: 'Automated code checks' },
    { id: 'collaboration', title: 'Collaboration', description: 'Prerequisites and handoffs' }
  ];

  const skillYamlExample = `# skill.yaml - The identity of your skill
id: my-awesome-skill
name: My Awesome Skill
version: "1.0.0"
layer: 2  # 1=Core, 2=Integration, 3=Polish

identity:
  role: "World-class expert in [your domain]"
  owns:
    - "Feature A implementation"
    - "Pattern B enforcement"
  triggers:
    - "When user asks about [topic]"
    - "When implementing [feature]"

patterns:
  - id: pattern-1
    name: "Use X Instead of Y"
    description: "Always prefer X because..."
    examples:
      - description: "Good example"
        code: |
          // Do this
          const result = doThingRight();
      - description: "Bad example"
        code: |
          // Not this
          const result = doThingWrong();

anti_patterns:
  - id: anti-1
    name: "Never Do This"
    description: "This causes problems because..."
    detection: "pattern to match"
    severity: high

handoffs:
  - trigger: "When user needs [related topic]"
    to: other-skill-id
    context: "Pass along relevant context"

tags:
  - typescript
  - react
  - performance`;

  const sharpEdgesExample = `# sharp-edges.yaml - Gotchas Claude doesn't know
edges:
  - id: edge-1
    summary: "API v2 breaks pagination"
    severity: critical  # info, warning, critical
    situation: "When using API v2 with large datasets"
    why: |
      The v2 API changed pagination from offset-based to
      cursor-based. Old code will silently skip records.
    solution: |
      Use cursor-based pagination:
      \`\`\`typescript
      const cursor = response.nextCursor;
      const next = await api.list({ cursor });
      \`\`\`
    detection:
      patterns:
        - "api.list\\\\(.*offset"
        - "page:\\\\s*\\\\d+"
      files:
        - "**/*.ts"
        - "**/*.js"

  - id: edge-2
    summary: "SSR hydration mismatch"
    severity: warning
    situation: "Server/client HTML differs"
    why: "Framework will fail to hydrate properly"
    solution: "Ensure deterministic rendering"
    detection:
      patterns:
        - "Math.random\\\\(\\\\)"
        - "new Date\\\\(\\\\)"
      files:
        - "**/components/**"`;

  const validationsExample = `# validations.yaml - Code checks that run automatically
validations:
  - id: val-1
    name: "No hardcoded API keys"
    description: "API keys should come from environment"
    severity: critical
    check:
      type: regex
      pattern: "(api_key|apiKey)\\\\s*[:=]\\\\s*['\"][^'\"]{20,}"
      files:
        - "**/*.ts"
        - "**/*.js"
      exclude:
        - "**/*.test.*"
        - "**/*.spec.*"
    message: "Found hardcoded API key. Use process.env instead."
    fix: |
      Replace with environment variable:
      \`\`\`typescript
      const apiKey = process.env.API_KEY;
      \`\`\`

  - id: val-2
    name: "Async functions must be awaited"
    description: "Prevent fire-and-forget async calls"
    severity: warning
    check:
      type: regex
      pattern: "(?<!await\\\\s)fetch\\\\("
      files:
        - "**/*.ts"
    message: "fetch() call without await"
    fix: "Add await before fetch()"`;

  const collaborationExample = `# collaboration.yaml - How your skill works with others
prerequisites:
  - skill: typescript-basics
    reason: "Need TS fundamentals first"
  - skill: react-patterns
    optional: true
    reason: "Helpful but not required"

pairs_with:
  - skill: testing-patterns
    synergy: "Use together for TDD workflow"
  - skill: security-checks
    synergy: "Catches vulnerabilities early"

delegation_triggers:
  - condition: "User asks about database design"
    delegate_to: database-patterns
    handoff_context: "Pass schema requirements"

  - condition: "User needs deployment help"
    delegate_to: devops-basics
    handoff_context: "Include current stack info"

cross_domain_insights:
  - domain: performance
    insight: "This pattern affects bundle size"
  - domain: security
    insight: "Watch for XSS in user content"`;

  const rubricCategories = [
    { name: 'Identity', maxPoints: 15, items: ['Clear role definition (5)', 'Specific ownership (5)', 'Actionable triggers (5)'] },
    { name: 'Patterns', maxPoints: 20, items: ['8+ patterns with examples (10)', 'Real code, not pseudo-code (5)', 'Clear rationale (5)'] },
    { name: 'Sharp Edges', maxPoints: 25, items: ['8-12 gotchas (10)', 'Detection patterns that work (10)', 'Specific solutions (5)'] },
    { name: 'Validations', maxPoints: 25, items: ['8-12 checks (10)', 'Regex or AST patterns (10)', 'Actionable fix suggestions (5)'] },
    { name: 'Collaboration', maxPoints: 15, items: ['Prerequisites defined (5)', 'Pairs-with relationships (5)', 'Handoff triggers (5)'] }
  ];
</script>

<svelte:head>
  <title>Create Your Own Skills | VibeShip</title>
  <meta name="description" content="Learn how to create your own VibeShip skills locally. Step-by-step guide with examples." />
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

  <main class="create-page">
    <!-- Header -->
    <header class="page-header">
    <h1>Create Your Own Skills</h1>
    <p class="subtitle">Don't see what you need? Build it locally.</p>
  </header>

  <!-- Folder Structure -->
  <section class="section anatomy-section">
    <h2>The Anatomy of a Skill</h2>
    <p class="section-desc">Every skill is a folder with 8 files: 4 YAML for structured data, 4 MD for deep-dive content.</p>

    <div class="folder-structure">
      <div class="folder">
        <span class="folder-icon">📁</span>
        <span class="folder-name">my-skill/</span>
      </div>
      <div class="file-group">
        <span class="group-label">YAML (structured)</span>
      </div>
      <div class="file" class:active={currentStep === 0}>
        <span class="file-icon">📄</span>
        <span class="file-name">skill.yaml</span>
        <span class="file-desc">← identity & triggers</span>
      </div>
      <div class="file" class:active={currentStep === 2}>
        <span class="file-icon">📄</span>
        <span class="file-name">sharp-edges.yaml</span>
        <span class="file-desc">← gotchas list</span>
      </div>
      <div class="file" class:active={currentStep === 3}>
        <span class="file-icon">📄</span>
        <span class="file-name">validations.yaml</span>
        <span class="file-desc">← code checks</span>
      </div>
      <div class="file" class:active={currentStep === 4}>
        <span class="file-icon">📄</span>
        <span class="file-name">collaboration.yaml</span>
        <span class="file-desc">← agent handoffs</span>
      </div>
      <div class="file-group">
        <span class="group-label">Markdown (deep-dive)</span>
      </div>
      <div class="file">
        <span class="file-icon">📝</span>
        <span class="file-name">patterns.md</span>
        <span class="file-desc">← best practices</span>
      </div>
      <div class="file">
        <span class="file-icon">📝</span>
        <span class="file-name">anti-patterns.md</span>
        <span class="file-desc">← what to avoid</span>
      </div>
      <div class="file">
        <span class="file-icon">📝</span>
        <span class="file-name">decisions.md</span>
        <span class="file-desc">← architecture choices</span>
      </div>
      <div class="file">
        <span class="file-icon">📝</span>
        <span class="file-name">sharp-edges.md</span>
        <span class="file-desc">← detailed gotchas</span>
      </div>
    </div>
  </section>

  <!-- Step-by-Step Walkthrough -->
  <section class="section walkthrough-section">
    <h2>Step-by-Step Guide</h2>

    <!-- Step Navigation -->
    <div class="step-nav">
      {#each steps as step, i}
        <button
          class="step-btn"
          class:active={currentStep === i}
          class:completed={i < currentStep}
          onclick={() => currentStep = i}
        >
          <span class="step-number">{i + 1}</span>
          <span class="step-title">{step.title}</span>
        </button>
      {/each}
    </div>

    <!-- Step Content -->
    <div class="step-content">
      {#if currentStep === 0}
        <div class="step-panel">
          <h3>Step 1: Define Identity</h3>
          <p>Start with <code>skill.yaml</code>. This defines who your skill is, what it owns, and when it should activate.</p>

          <div class="key-points">
            <h4>Key sections:</h4>
            <ul>
              <li><strong>identity.role</strong> - A "world-class expert" statement</li>
              <li><strong>identity.owns</strong> - What this skill is responsible for</li>
              <li><strong>identity.triggers</strong> - When to activate this skill</li>
              <li><strong>patterns</strong> - Best practices with code examples</li>
              <li><strong>anti_patterns</strong> - Things to avoid</li>
              <li><strong>handoffs</strong> - When to delegate to other skills</li>
            </ul>
          </div>

          <div class="code-example">
            <div class="code-header">
              <span>skill.yaml</span>
            </div>
            <pre><code>{skillYamlExample}</code></pre>
          </div>
        </div>

      {:else if currentStep === 1}
        <div class="step-panel">
          <h3>Step 2: Add Patterns & Anti-Patterns</h3>
          <p>Patterns are the best practices you want to enforce. Anti-patterns are the mistakes you want to prevent.</p>

          <div class="key-points">
            <h4>Pattern requirements:</h4>
            <ul>
              <li>Include <strong>real code examples</strong>, not pseudo-code</li>
              <li>Show both <strong>good and bad</strong> examples</li>
              <li>Explain <strong>why</strong> the pattern matters</li>
              <li>Aim for <strong>8+ patterns</strong> per skill</li>
            </ul>
          </div>

          <div class="tip-box">
            <strong>Tip:</strong> The best patterns come from real bugs you've encountered or mistakes you've made. If you learned it the hard way, document it.
          </div>

          <div class="code-example">
            <div class="code-header">
              <span>Patterns in skill.yaml</span>
            </div>
            <pre><code>{`patterns:
  - id: use-const-assertions
    name: "Use const assertions for literals"
    description: "Prevents type widening in TypeScript"
    examples:
      - description: "Good: const assertion preserves literal type"
        code: |
          const config = {
            env: 'production',
            debug: false
          } as const;
          // Type: { env: 'production', debug: false }

      - description: "Bad: type widens to string/boolean"
        code: |
          const config = {
            env: 'production',
            debug: false
          };
          // Type: { env: string, debug: boolean }`}</code></pre>
          </div>
        </div>

      {:else if currentStep === 2}
        <div class="step-panel">
          <h3>Step 3: Define Sharp Edges</h3>
          <p>Sharp edges are the gotchas that Claude doesn't know. These are version-specific issues, undocumented behaviors, and common pitfalls.</p>

          <div class="key-points">
            <h4>What makes a good sharp edge:</h4>
            <ul>
              <li><strong>Specific situation</strong> - When does this happen?</li>
              <li><strong>Clear why</strong> - Why is this a problem?</li>
              <li><strong>Actionable solution</strong> - How to fix it</li>
              <li><strong>Detection pattern</strong> - Regex to find the issue</li>
              <li>Aim for <strong>8-12 edges</strong> per skill</li>
            </ul>
          </div>

          <div class="code-example">
            <div class="code-header">
              <span>sharp-edges.yaml</span>
            </div>
            <pre><code>{sharpEdgesExample}</code></pre>
          </div>
        </div>

      {:else if currentStep === 3}
        <div class="step-panel">
          <h3>Step 4: Create Validations</h3>
          <p>Validations are automated code checks that run on your codebase. They catch issues before they become bugs.</p>

          <div class="key-points">
            <h4>Validation components:</h4>
            <ul>
              <li><strong>Regex pattern</strong> - What to look for</li>
              <li><strong>File globs</strong> - Where to look</li>
              <li><strong>Severity</strong> - info, warning, or critical</li>
              <li><strong>Message</strong> - What to tell the user</li>
              <li><strong>Fix</strong> - How to resolve the issue</li>
              <li>Aim for <strong>8-12 validations</strong> per skill</li>
            </ul>
          </div>

          <div class="tip-box">
            <strong>Pro tip:</strong> Start with regex patterns. Only use AST when regex can't express the check. Regex catches 80% of issues with 10% of the complexity.
          </div>

          <div class="code-example">
            <div class="code-header">
              <span>validations.yaml</span>
            </div>
            <pre><code>{validationsExample}</code></pre>
          </div>
        </div>

      {:else if currentStep === 4}
        <div class="step-panel">
          <h3>Step 5: Set Up Collaboration</h3>
          <p>Skills work best together. Define how your skill relates to others.</p>

          <div class="key-points">
            <h4>Collaboration components:</h4>
            <ul>
              <li><strong>prerequisites</strong> - Skills needed before this one</li>
              <li><strong>pairs_with</strong> - Skills that work well together</li>
              <li><strong>delegation_triggers</strong> - When to hand off</li>
              <li><strong>cross_domain_insights</strong> - Related concerns</li>
            </ul>
          </div>

          <div class="code-example">
            <div class="code-header">
              <span>collaboration.yaml</span>
            </div>
            <pre><code>{collaborationExample}</code></pre>
          </div>
        </div>
      {/if}

      <!-- Step Navigation -->
      <div class="step-actions">
        {#if currentStep > 0}
          <button class="btn btn-secondary" onclick={() => currentStep--}>
            <Icon name="arrow-left" size={16} />
            Previous
          </button>
        {/if}
        {#if currentStep < steps.length - 1}
          <button class="btn btn-primary" onclick={() => currentStep++}>
            Next
            <Icon name="arrow-right" size={16} />
          </button>
        {/if}
      </div>
    </div>
  </section>

  <!-- Spawner Integration -->
  <section class="section spawner-section">
    <h2>Or Use Spawner</h2>
    <p class="section-desc">Let Spawner help you create skills with these MCP tools:</p>

    <div class="spawner-tools">
      <div class="tool-card">
        <code>spawner_skill_new</code>
        <p>Generate a complete skill scaffold. Creates 8 files (4 YAML + 4 MD) with structure ready to fill in.</p>
        <div class="usage">
          <strong>Usage:</strong> "Create a skill for Next.js App Router patterns"
        </div>
      </div>

      <div class="tool-card">
        <code>spawner_skill_upgrade</code>
        <p>Enhance an existing skill with more depth. Adds patterns, sharp edges, and validations based on analysis.</p>
        <div class="usage">
          <strong>Usage:</strong> "Upgrade the react-patterns skill with more hooks patterns"
        </div>
      </div>

      <div class="tool-card">
        <code>spawner_skill_score</code>
        <p>Score your skill against our 100-point quality rubric. Get specific feedback on what to improve.</p>
        <div class="usage">
          <strong>Usage:</strong> "Score my new skill and tell me what's missing"
        </div>
      </div>
    </div>
  </section>

  <!-- Quality Rubric -->
  <section class="section rubric-section">
    <h2>The 100-Point Quality Rubric</h2>
    <p class="section-desc">Every skill in our library scores 80+ on this rubric. Use it to check your own skills.</p>

    <div class="rubric-grid">
      {#each rubricCategories as category}
        <div class="rubric-category">
          <div class="rubric-header">
            <span class="rubric-name">{category.name}</span>
            <span class="rubric-points">{category.maxPoints} pts</span>
          </div>
          <ul class="rubric-items">
            {#each category.items as item}
              <li>{item}</li>
            {/each}
          </ul>
        </div>
      {/each}
    </div>

    <div class="rubric-total">
      <span>Total: 100 points</span>
      <span class="minimum">Minimum to ship: 80 points</span>
    </div>
  </section>

  <!-- Getting Started CTA -->
  <section class="section cta-section">
    <h2>Ready to Create?</h2>
    <p class="cta-desc">Use Spawner to generate world-class skills with all 8 files.</p>
    <div class="cta-single">
      <div class="terminal">
        <code class="comment"># Step 1: Generate the skill scaffold</code>
        <code>spawner_skill_new(id: "api-rate-limits", name: "API Rate Limits", category: "development")</code>
        <code class="comment"># Step 2: Spawner returns 8 files - ask Claude to create them</code>
        <code>"Create these skill files in my project"</code>
      </div>
      <p class="cta-note">Spawner generates 4 YAML files (skill.yaml, sharp-edges.yaml, validations.yaml, collaboration.yaml) + 4 MD files (patterns.md, anti-patterns.md, decisions.md, sharp-edges.md) with templates ready to fill in.</p>
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

  .create-page {
    flex: 1;
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .page-header {
    margin-bottom: 3rem;
  }

  h1 {
    font-family: var(--font-serif);
    font-size: var(--text-4xl);
    font-weight: 400;
    margin: 0 0 0.5rem 0;
    color: var(--text-primary);
  }

  .subtitle {
    font-size: var(--text-lg);
    color: var(--text-secondary);
    margin: 0;
  }

  .section {
    margin-bottom: 4rem;
  }

  .section h2 {
    font-family: var(--font-serif);
    font-size: var(--text-2xl);
    font-weight: 400;
    margin: 0 0 0.5rem 0;
    color: var(--text-primary);
  }

  .section-desc {
    color: var(--text-secondary);
    margin: 0 0 1.5rem 0;
  }

  /* Folder Structure */
  .folder-structure {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    padding: 1.5rem;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
  }

  .folder, .file {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0;
  }

  .file {
    padding-left: 1.5rem;
    transition: background var(--transition-fast);
    margin: 2px 0;
    padding-right: 0.5rem;
  }

  .file.active {
    background: rgba(0, 196, 154, 0.1);
  }

  .folder-icon, .file-icon {
    flex-shrink: 0;
  }

  .folder-name {
    font-weight: 600;
  }

  .file-desc {
    color: var(--text-secondary, #888);
    margin-left: auto;
  }

  .file-group {
    padding: 0.75rem 0 0.25rem 0;
    margin-top: 0.5rem;
  }

  .group-label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-tertiary);
    font-weight: 600;
  }

  /* Step Navigation */
  .step-nav {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    overflow-x: auto;
    padding-bottom: 0.5rem;
  }

  .step-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border: 1px solid var(--border);
    background: var(--bg-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
    white-space: nowrap;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }

  .step-btn:hover {
    border-color: var(--green-dim);
    color: var(--text-primary);
  }

  .step-btn.active {
    background: rgba(0, 196, 154, 0.1);
    border-color: var(--green-dim);
    color: var(--green-dim);
  }

  .step-btn.completed {
    border-color: var(--green-dim);
    background: rgba(0, 196, 154, 0.05);
  }

  .step-number {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    font-size: 0.75rem;
    font-weight: 600;
  }

  .step-btn.active .step-number {
    background: var(--green-dim);
    border-color: var(--green-dim);
    color: var(--bg-primary);
  }

  .step-title {
    font-weight: 500;
  }

  /* Step Content */
  .step-content {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    padding: 2rem;
  }

  .step-panel h3 {
    font-family: var(--font-serif);
    font-size: var(--text-xl);
    font-weight: 400;
    margin: 0 0 1rem 0;
    color: var(--text-primary);
  }

  .step-panel > p {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
  }

  .key-points {
    background: var(--bg-primary);
    border: 1px solid var(--border);
    padding: 1rem 1.5rem;
    margin-bottom: 1.5rem;
  }

  .key-points h4 {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    margin: 0 0 0.75rem 0;
    color: var(--green-dim);
  }

  .key-points ul {
    margin: 0;
    padding-left: 1.25rem;
  }

  .key-points li {
    margin-bottom: 0.5rem;
    color: var(--text-secondary);
  }

  .key-points li:last-child {
    margin-bottom: 0;
  }

  .tip-box {
    background: rgba(0, 196, 154, 0.1);
    border-left: 3px solid var(--green-dim);
    padding: 1rem;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
    color: var(--text-secondary);
  }

  /* Code Examples */
  .code-example {
    background: var(--terminal-bg);
    border: 1px solid var(--terminal-border);
    overflow: hidden;
    margin-bottom: 1.5rem;
  }

  .code-header {
    background: var(--terminal-header);
    padding: 0.5rem 1rem;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--terminal-muted);
    border-bottom: 1px solid var(--terminal-border);
  }

  .code-example pre {
    margin: 0;
    padding: 1rem;
    overflow-x: auto;
  }

  .code-example code {
    font-family: var(--font-mono);
    font-size: 0.8rem;
    line-height: 1.5;
    color: var(--terminal-text);
  }

  .step-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border);
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 500;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .btn-primary {
    background: transparent;
    border: 1px solid var(--green-dim);
    color: var(--green-dim);
  }

  .btn-primary:hover {
    background: var(--green-dim);
    color: var(--bg-primary);
  }

  .btn-secondary {
    background: var(--bg-primary);
    border: 1px solid var(--border);
    color: var(--text-secondary);
  }

  .btn-secondary:hover {
    border-color: var(--green-dim);
    color: var(--text-primary);
  }

  /* Spawner Section */
  .spawner-tools {
    display: grid;
    gap: 1rem;
  }

  .tool-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    padding: 1.5rem;
  }

  .tool-card code {
    display: inline-block;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    padding: 0.25rem 0.75rem;
    font-family: var(--font-mono);
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--green-dim);
    margin-bottom: 0.75rem;
  }

  .tool-card p {
    margin: 0 0 1rem 0;
    color: var(--text-secondary);
  }

  .tool-card .usage {
    font-size: 0.875rem;
    color: var(--text-tertiary);
    background: var(--bg-primary);
    border: 1px solid var(--border);
    padding: 0.75rem;
  }

  /* Rubric Section */
  .rubric-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  @media (max-width: 768px) {
    .rubric-grid {
      grid-template-columns: 1fr;
    }
  }

  @media (min-width: 769px) and (max-width: 1024px) {
    .rubric-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  .rubric-category {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    padding: 1rem;
  }

  .rubric-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border);
  }

  .rubric-name {
    font-weight: 600;
    color: var(--text-primary);
  }

  .rubric-points {
    font-size: 0.875rem;
    color: var(--green-dim);
    font-weight: 600;
  }

  .rubric-items {
    margin: 0;
    padding-left: 1.25rem;
    font-size: 0.875rem;
  }

  .rubric-items li {
    color: var(--text-secondary);
    margin-bottom: 0.25rem;
  }

  .rubric-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    padding: 1rem 1.5rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .minimum {
    color: var(--green-dim);
  }

  /* CTA Section */
  .cta-section {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    padding: 2rem;
    text-align: center;
  }

  .cta-section h2 {
    margin-bottom: 0.5rem;
    color: var(--text-primary);
  }

  .cta-desc {
    color: var(--text-secondary);
    margin: 0 0 1.5rem 0;
  }

  .cta-single {
    max-width: 600px;
    margin: 0 auto;
    text-align: left;
  }

  .cta-note {
    font-size: 0.875rem;
    color: var(--text-tertiary);
    margin: 1rem 0 0 0;
    text-align: center;
  }

  .terminal {
    background: var(--terminal-bg);
    border: 1px solid var(--terminal-border);
    padding: 1rem 1.25rem;
  }

  .terminal code {
    display: block;
    font-family: var(--font-mono);
    font-size: 0.8rem;
    color: var(--terminal-command);
    line-height: 1.8;
  }

  .terminal code.comment {
    color: var(--terminal-muted);
  }

  /* Mobile Responsive */
  @media (max-width: 768px) {
    h1 {
      font-size: 2rem;
    }

    .step-nav {
      flex-wrap: nowrap;
    }

    .step-btn {
      padding: 0.5rem 0.75rem;
    }

    .step-title {
      display: none;
    }

    .step-content {
      padding: 1.5rem;
    }

    .skills-layout {
      flex-direction: column;
    }
  }
</style>
