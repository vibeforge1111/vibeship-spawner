<script lang="ts">
  import Icon from '$lib/components/Icon.svelte';

  let currentStep = $state(0);

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

<div class="create-page">
  <!-- Header -->
  <header class="page-header">
    <a href="/skills" class="back-link">
      <Icon name="arrow-left" size={16} />
      Back to Skills
    </a>
    <h1>Create Your Own Skills</h1>
    <p class="subtitle">Don't see what you need? Build it locally.</p>
  </header>

  <!-- Folder Structure -->
  <section class="section anatomy-section">
    <h2>The Anatomy of a Skill</h2>
    <p class="section-desc">Every skill is a folder with 4 YAML files. Each file has a specific purpose.</p>

    <div class="folder-structure">
      <div class="folder">
        <span class="folder-icon">📁</span>
        <span class="folder-name">my-skill/</span>
      </div>
      <div class="file" class:active={currentStep === 0}>
        <span class="file-icon">📄</span>
        <span class="file-name">skill.yaml</span>
        <span class="file-desc">← who you are</span>
      </div>
      <div class="file" class:active={currentStep === 2}>
        <span class="file-icon">📄</span>
        <span class="file-name">sharp-edges.yaml</span>
        <span class="file-desc">← gotchas</span>
      </div>
      <div class="file" class:active={currentStep === 3}>
        <span class="file-icon">📄</span>
        <span class="file-name">validations.yaml</span>
        <span class="file-desc">← code checks</span>
      </div>
      <div class="file" class:active={currentStep === 4}>
        <span class="file-icon">📄</span>
        <span class="file-name">collaboration.yaml</span>
        <span class="file-desc">← handoffs</span>
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
        <p>Generate a skill scaffold from a description. Creates all 4 YAML files with structure ready to fill in.</p>
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
    <div class="cta-options">
      <div class="cta-option">
        <h3>Start from scratch</h3>
        <p>Create a new folder and add the 4 YAML files manually.</p>
        <div class="terminal">
          <code>mkdir my-skill && cd my-skill</code>
          <code>touch skill.yaml sharp-edges.yaml validations.yaml collaboration.yaml</code>
        </div>
      </div>
      <div class="cta-option">
        <h3>Use Spawner</h3>
        <p>Let Claude generate a scaffold for you.</p>
        <div class="terminal">
          <code>spawner_skill_new("My skill for handling API rate limits")</code>
        </div>
      </div>
    </div>
  </section>
</div>

<style>
  .create-page {
    max-width: 900px;
    margin: 0 auto;
    padding: 2rem 1rem;
  }

  .page-header {
    margin-bottom: 3rem;
  }

  .back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-secondary, #666);
    text-decoration: none;
    font-size: 0.875rem;
    margin-bottom: 1rem;
  }

  .back-link:hover {
    color: var(--text-primary, #333);
  }

  h1 {
    font-size: 2.5rem;
    font-weight: 700;
    margin: 0 0 0.5rem 0;
    color: var(--text-primary, #111);
  }

  .subtitle {
    font-size: 1.25rem;
    color: var(--text-secondary, #666);
    margin: 0;
  }

  .section {
    margin-bottom: 4rem;
  }

  .section h2 {
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
    color: var(--text-primary, #111);
  }

  .section-desc {
    color: var(--text-secondary, #666);
    margin: 0 0 1.5rem 0;
  }

  /* Folder Structure */
  .folder-structure {
    background: var(--bg-secondary, #f5f5f5);
    border-radius: 8px;
    padding: 1.5rem;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
    font-size: 0.9rem;
  }

  .folder, .file {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0;
  }

  .file {
    padding-left: 1.5rem;
    transition: background 0.2s;
    border-radius: 4px;
    margin: 2px 0;
    padding-right: 0.5rem;
  }

  .file.active {
    background: var(--accent-light, #e0f0ff);
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
    border: 1px solid var(--border-color, #ddd);
    background: white;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .step-btn:hover {
    border-color: var(--accent-color, #0066cc);
  }

  .step-btn.active {
    background: var(--accent-color, #0066cc);
    border-color: var(--accent-color, #0066cc);
    color: white;
  }

  .step-btn.completed {
    border-color: var(--success-color, #22c55e);
    background: var(--success-light, #dcfce7);
  }

  .step-number {
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-secondary, #f5f5f5);
    border-radius: 50%;
    font-size: 0.75rem;
    font-weight: 600;
  }

  .step-btn.active .step-number {
    background: white;
    color: var(--accent-color, #0066cc);
  }

  .step-title {
    font-weight: 500;
  }

  /* Step Content */
  .step-content {
    background: white;
    border: 1px solid var(--border-color, #ddd);
    border-radius: 12px;
    padding: 2rem;
  }

  .step-panel h3 {
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
  }

  .step-panel > p {
    color: var(--text-secondary, #666);
    margin-bottom: 1.5rem;
  }

  .key-points {
    background: var(--bg-secondary, #f9fafb);
    border-radius: 8px;
    padding: 1rem 1.5rem;
    margin-bottom: 1.5rem;
  }

  .key-points h4 {
    font-size: 0.875rem;
    font-weight: 600;
    margin: 0 0 0.75rem 0;
    color: var(--text-primary, #111);
  }

  .key-points ul {
    margin: 0;
    padding-left: 1.25rem;
  }

  .key-points li {
    margin-bottom: 0.5rem;
    color: var(--text-secondary, #555);
  }

  .key-points li:last-child {
    margin-bottom: 0;
  }

  .tip-box {
    background: var(--info-light, #dbeafe);
    border-left: 3px solid var(--info-color, #3b82f6);
    padding: 1rem;
    border-radius: 0 8px 8px 0;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
  }

  /* Code Examples */
  .code-example {
    background: #1e1e1e;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 1.5rem;
  }

  .code-header {
    background: #2d2d2d;
    padding: 0.5rem 1rem;
    font-size: 0.75rem;
    color: #999;
  }

  .code-example pre {
    margin: 0;
    padding: 1rem;
    overflow-x: auto;
  }

  .code-example code {
    font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
    font-size: 0.8rem;
    line-height: 1.5;
    color: #d4d4d4;
  }

  .step-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid var(--border-color, #eee);
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    border: none;
  }

  .btn-primary {
    background: var(--accent-color, #0066cc);
    color: white;
  }

  .btn-primary:hover {
    background: var(--accent-dark, #0055aa);
  }

  .btn-secondary {
    background: var(--bg-secondary, #f5f5f5);
    color: var(--text-primary, #333);
  }

  .btn-secondary:hover {
    background: var(--bg-tertiary, #eee);
  }

  /* Spawner Section */
  .spawner-tools {
    display: grid;
    gap: 1rem;
  }

  .tool-card {
    background: white;
    border: 1px solid var(--border-color, #ddd);
    border-radius: 8px;
    padding: 1.5rem;
  }

  .tool-card code {
    display: inline-block;
    background: var(--bg-secondary, #f5f5f5);
    padding: 0.25rem 0.75rem;
    border-radius: 4px;
    font-family: 'SF Mono', Monaco, monospace;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--accent-color, #0066cc);
    margin-bottom: 0.75rem;
  }

  .tool-card p {
    margin: 0 0 1rem 0;
    color: var(--text-secondary, #666);
  }

  .tool-card .usage {
    font-size: 0.875rem;
    color: var(--text-tertiary, #888);
    background: var(--bg-secondary, #f9fafb);
    padding: 0.75rem;
    border-radius: 4px;
  }

  /* Rubric Section */
  .rubric-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .rubric-category {
    background: white;
    border: 1px solid var(--border-color, #ddd);
    border-radius: 8px;
    padding: 1rem;
  }

  .rubric-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border-color, #eee);
  }

  .rubric-name {
    font-weight: 600;
  }

  .rubric-points {
    font-size: 0.875rem;
    color: var(--accent-color, #0066cc);
    font-weight: 600;
  }

  .rubric-items {
    margin: 0;
    padding-left: 1.25rem;
    font-size: 0.875rem;
  }

  .rubric-items li {
    color: var(--text-secondary, #666);
    margin-bottom: 0.25rem;
  }

  .rubric-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: var(--bg-secondary, #f5f5f5);
    padding: 1rem 1.5rem;
    border-radius: 8px;
    font-weight: 600;
  }

  .minimum {
    color: var(--accent-color, #0066cc);
  }

  /* CTA Section */
  .cta-section {
    background: var(--bg-secondary, #f9fafb);
    border-radius: 12px;
    padding: 2rem;
    text-align: center;
  }

  .cta-section h2 {
    margin-bottom: 1.5rem;
  }

  .cta-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
    text-align: left;
  }

  .cta-option {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    border: 1px solid var(--border-color, #ddd);
  }

  .cta-option h3 {
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
  }

  .cta-option p {
    font-size: 0.875rem;
    color: var(--text-secondary, #666);
    margin: 0 0 1rem 0;
  }

  .terminal {
    background: #1e1e1e;
    border-radius: 6px;
    padding: 0.75rem 1rem;
  }

  .terminal code {
    display: block;
    font-family: 'SF Mono', Monaco, monospace;
    font-size: 0.8rem;
    color: #4ade80;
    line-height: 1.6;
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

    .rubric-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
