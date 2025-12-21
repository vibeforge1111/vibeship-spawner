<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import Icon from '$lib/components/Icon.svelte';
</script>

<Navbar />

<main class="mcp-guide">
  <!-- Hero -->
  <section class="hero">
    <h1>Spawner MCP Guide</h1>
    <p class="hero-subtitle">How to get the most out of Spawner's 14 tools</p>
  </section>

  <!-- Quick Setup -->
  <section class="section">
    <div class="section-header">
      <span class="section-number">01</span>
      <h2>Quick Setup</h2>
    </div>
    <div class="section-content">
      <p class="section-desc">Connect Spawner to Claude Desktop in 2 minutes.</p>

      <div class="setup-steps">
        <div class="step">
          <span class="step-number">1</span>
          <div class="step-content">
            <h4>Open Claude Desktop Config</h4>
            <p>Find your MCP configuration file:</p>
            <div class="code-block">
              <code>~/Library/Application Support/Claude/claude_desktop_config.json</code>
            </div>
          </div>
        </div>

        <div class="step">
          <span class="step-number">2</span>
          <div class="step-content">
            <h4>Add Spawner</h4>
            <p>Add this to your mcpServers:</p>
            <div class="code-block">
<pre><code>{`{
  "mcpServers": {
    "spawner": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.vibeship.co"]
    }
  }
}`}</code></pre>
            </div>
          </div>
        </div>

        <div class="step">
          <span class="step-number">3</span>
          <div class="step-content">
            <h4>Restart Claude Desktop</h4>
            <p>Fully quit and reopen Claude Desktop. You'll see Spawner's tools available.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Core Workflows -->
  <section class="section">
    <div class="section-header">
      <span class="section-number">02</span>
      <h2>Core Workflows</h2>
    </div>
    <div class="section-content">
      <p class="section-desc">The most powerful ways to use Spawner.</p>

      <div class="workflows">
        <!-- New Project -->
        <div class="workflow-card">
          <div class="workflow-header">
            <Icon name="rocket" size={20} />
            <h3>Starting a New Project</h3>
          </div>
          <div class="workflow-body">
            <p class="workflow-desc">Let Spawner guide you from idea to scaffolded project.</p>

            <div class="conversation">
              <div class="message user">
                <span class="label">You</span>
                <p>"I want to build a marketplace for vintage watches"</p>
              </div>
              <div class="message claude">
                <span class="label">Claude + Spawner</span>
                <p>Uses <code>spawner_plan</code> to understand your idea, detect your skill level, and ask clarifying questions (max 3).</p>
              </div>
              <div class="message claude">
                <span class="label">Claude + Spawner</span>
                <p>Recommends: Marketplace template, Next.js + Supabase + Stripe stack, plus relevant skills.</p>
              </div>
            </div>

            <div class="workflow-tips">
              <strong>Pro Tips:</strong>
              <ul>
                <li>Be specific about your domain - "vintage watches" helps Spawner pick better skills</li>
                <li>Mention constraints early - "I need it in 2 weeks" or "I have $0 budget"</li>
                <li>Say if you're technical - Spawner adapts its guidance to your level</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Existing Project -->
        <div class="workflow-card">
          <div class="workflow-header">
            <Icon name="search" size={20} />
            <h3>Analyzing Existing Code</h3>
          </div>
          <div class="workflow-body">
            <p class="workflow-desc">Get Spawner to understand your codebase and recommend improvements.</p>

            <div class="conversation">
              <div class="message user">
                <span class="label">You</span>
                <p>"Analyze my codebase and tell me what skills would help"</p>
              </div>
              <div class="message claude">
                <span class="label">Claude + Spawner</span>
                <p>Uses <code>spawner_analyze</code> to detect your stack from package.json, file patterns, and imports.</p>
              </div>
              <div class="message claude">
                <span class="label">Claude + Spawner</span>
                <p>Returns: Detected stack (Next.js + Supabase), missing pieces (no auth detected), recommended skills.</p>
              </div>
            </div>

            <div class="workflow-tips">
              <strong>Pro Tips:</strong>
              <ul>
                <li>Share your package.json for accurate detection</li>
                <li>Mention what you're trying to add - "I want to add payments"</li>
                <li>Ask about specific problems - "Why is my auth flow breaking?"</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- When Stuck -->
        <div class="workflow-card">
          <div class="workflow-header">
            <Icon name="life-buoy" size={20} />
            <h3>Getting Unstuck</h3>
          </div>
          <div class="workflow-body">
            <p class="workflow-desc">When you've been stuck on a problem, Spawner offers alternative approaches.</p>

            <div class="conversation">
              <div class="message user">
                <span class="label">You</span>
                <p>"I've been trying to fix this auth redirect for 2 hours"</p>
              </div>
              <div class="message claude">
                <span class="label">Claude + Spawner</span>
                <p>Uses <code>spawner_unstick</code> to analyze your attempts and generate alternative approaches.</p>
              </div>
              <div class="message claude">
                <span class="label">Claude + Spawner</span>
                <p>Returns 3-5 different approaches you haven't tried, ordered by likelihood of success.</p>
              </div>
            </div>

            <div class="workflow-tips">
              <strong>Pro Tips:</strong>
              <ul>
                <li>Describe what you've already tried - Spawner won't repeat failed approaches</li>
                <li>Share error messages - they help narrow down the problem</li>
                <li>Mention your constraints - "I can't change the database schema"</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Watch Out -->
        <div class="workflow-card">
          <div class="workflow-header">
            <Icon name="alert-triangle" size={20} />
            <h3>Avoiding Gotchas</h3>
          </div>
          <div class="workflow-body">
            <p class="workflow-desc">Proactively get warnings about common pitfalls before you hit them.</p>

            <div class="conversation">
              <div class="message user">
                <span class="label">You</span>
                <p>"What should I watch out for with Supabase RLS?"</p>
              </div>
              <div class="message claude">
                <span class="label">Claude + Spawner</span>
                <p>Uses <code>spawner_watch_out</code> to query sharp edges for your stack and situation.</p>
              </div>
              <div class="message claude">
                <span class="label">Claude + Spawner</span>
                <p>Returns specific gotchas with severity, why they hurt, and how to avoid them.</p>
              </div>
            </div>

            <div class="workflow-tips">
              <strong>Pro Tips:</strong>
              <ul>
                <li>Ask before you start implementing - prevention beats debugging</li>
                <li>Be specific - "Stripe webhooks" gets better results than just "payments"</li>
                <li>Ask about integrations - "Next.js + Supabase auth" surfaces cross-tech issues</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- All Tools -->
  <section class="section">
    <div class="section-header">
      <span class="section-number">03</span>
      <h2>All 14 Tools</h2>
    </div>
    <div class="section-content">
      <p class="section-desc">Complete reference for every Spawner tool.</p>

      <div class="tools-grid">
        <!-- Project Tools -->
        <div class="tool-category">
          <h4>Project Tools</h4>
          <div class="tools-list">
            <div class="tool-item">
              <code>spawner_plan</code>
              <p>Plan and create new projects. Goes through discover (understand idea) → recommend (suggest stack) → create (scaffold project).</p>
              <span class="tool-usage">Use: "I want to build..."</span>
            </div>
            <div class="tool-item">
              <code>spawner_analyze</code>
              <p>Analyze existing codebase. Detects technologies from files, package.json, and code patterns.</p>
              <span class="tool-usage">Use: "Analyze my project..."</span>
            </div>
            <div class="tool-item">
              <code>spawner_load</code>
              <p>Load project context and relevant skills for the current session. Restores memory from previous sessions.</p>
              <span class="tool-usage">Use: "Load my project context..."</span>
            </div>
            <div class="tool-item">
              <code>spawner_remember</code>
              <p>Save decisions, issues, and session progress. Persists context for future sessions.</p>
              <span class="tool-usage">Use: Happens automatically as you work</span>
            </div>
            <div class="tool-item">
              <code>spawner_templates</code>
              <p>List available project templates with their default stack, agents, and use cases.</p>
              <span class="tool-usage">Use: "What templates are available?"</span>
            </div>
          </div>
        </div>

        <!-- Guidance Tools -->
        <div class="tool-category">
          <h4>Guidance Tools</h4>
          <div class="tools-list">
            <div class="tool-item">
              <code>spawner_watch_out</code>
              <p>Query gotchas for your current stack and situation. Returns sharp edges with detection patterns.</p>
              <span class="tool-usage">Use: "What should I watch out for with..."</span>
            </div>
            <div class="tool-item">
              <code>spawner_unstick</code>
              <p>Get alternative approaches when you're stuck. Analyzes your attempts and offers new directions.</p>
              <span class="tool-usage">Use: "I've been stuck on... for X hours"</span>
            </div>
            <div class="tool-item">
              <code>spawner_validate</code>
              <p>Run guardrail checks on code. Catches security issues, anti-patterns, and production problems.</p>
              <span class="tool-usage">Use: "Check this code for issues..."</span>
            </div>
            <div class="tool-item">
              <code>spawner_skills</code>
              <p>Search, list, and get skills and squads. Load specialist knowledge for specific domains.</p>
              <span class="tool-usage">Use: "What skills do you have for auth?"</span>
            </div>
          </div>
        </div>

        <!-- Skill Creation Tools -->
        <div class="tool-category">
          <h4>Skill Creation Tools</h4>
          <div class="tools-list">
            <div class="tool-item">
              <code>spawner_skill_brainstorm</code>
              <span class="optional-badge">Optional</span>
              <p>Deep exploration before skill creation. Name experts, define boundaries, walk through pitfalls.</p>
              <span class="tool-usage">Use: "Let's brainstorm a skill for..."</span>
            </div>
            <div class="tool-item">
              <code>spawner_skill_research</code>
              <p>Research phase for skill creation. Gathers pain points, expert content, ecosystem mapping.</p>
              <span class="tool-usage">Use: "Research what makes a good X skill"</span>
            </div>
            <div class="tool-item">
              <code>spawner_skill_new</code>
              <p>Generate 4 YAML files for a world-class skill (skill.yaml, sharp-edges.yaml, validations.yaml, collaboration.yaml).</p>
              <span class="tool-usage">Use: "Create the skill files"</span>
            </div>
            <div class="tool-item">
              <code>spawner_skill_score</code>
              <p>Score skill against 100-point quality rubric. Minimum 80 to ship.</p>
              <span class="tool-usage">Use: "Score this skill"</span>
            </div>
            <div class="tool-item">
              <code>spawner_skill_upgrade</code>
              <p>Enhance existing skills with targeted improvements. Focus on identity, edges, patterns, or collaboration.</p>
              <span class="tool-usage">Use: "Upgrade the X skill"</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="cta-section">
    <h2>Ready to use Spawner?</h2>
    <p class="cta-desc">Connect to Claude Desktop and start building.</p>
    <div class="cta-buttons">
      <a href="/" class="btn btn-primary">Get Started</a>
      <a href="/skills" class="btn btn-secondary">Browse Skills</a>
    </div>
  </section>

  <footer class="footer">
    <div class="footer-links">
      <a href="https://github.com/vibeforge1111/vibeship-spawner" target="_blank" rel="noopener">GitHub</a>
      <a href="/">Home</a>
      <a href="/skills">Skills</a>
      <a href="/skill-creation">Skill Creation</a>
    </div>
  </footer>
</main>

<style>
  .mcp-guide {
    min-height: 100vh;
    padding-top: 60px;
  }

  /* Hero */
  .hero {
    text-align: center;
    padding: var(--space-12) var(--space-8);
    border-bottom: 1px solid var(--border);
  }

  .hero h1 {
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
  }

  /* Sections */
  .section {
    max-width: 900px;
    margin: 0 auto;
    padding: var(--space-10) var(--space-6);
    border-bottom: 1px solid var(--border);
  }

  .section-header {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    margin-bottom: var(--space-6);
  }

  .section-number {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--green-dim);
    background: rgba(0, 196, 154, 0.1);
    padding: var(--space-1) var(--space-3);
  }

  .section-header h2 {
    font-family: var(--font-serif);
    font-size: var(--text-2xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0;
  }

  .section-content {
    color: var(--text-secondary);
    line-height: 1.7;
  }

  .section-desc {
    font-size: var(--text-lg);
    color: var(--text-secondary);
    margin: 0 0 var(--space-6);
  }

  /* Setup Steps */
  .setup-steps {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .step {
    display: flex;
    gap: var(--space-4);
    padding: var(--space-4);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
  }

  .step-number {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--green-dim);
    background: rgba(0, 196, 154, 0.1);
  }

  .step-content h4 {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--space-2);
  }

  .step-content p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0 0 var(--space-2);
  }

  .code-block {
    background: #0d1117;
    border: 1px solid #30363d;
    padding: var(--space-3);
    overflow-x: auto;
  }

  .code-block code, .code-block pre {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: #c9d1d9;
    margin: 0;
  }

  /* Workflows */
  .workflows {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .workflow-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    overflow: hidden;
  }

  .workflow-header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--bg-tertiary);
    border-bottom: 1px solid var(--border);
  }

  .workflow-header > :global(svg) {
    color: var(--green-dim);
    flex-shrink: 0;
  }

  .workflow-header h3 {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .workflow-body {
    padding: var(--space-4);
  }

  .workflow-desc {
    font-size: var(--text-base);
    color: var(--text-secondary);
    margin: 0 0 var(--space-4);
  }

  .conversation {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    margin-bottom: var(--space-4);
  }

  .message {
    padding: var(--space-3);
  }

  .message.user {
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    margin-right: var(--space-6);
  }

  .message.claude {
    background: rgba(0, 196, 154, 0.05);
    border: 1px solid rgba(0, 196, 154, 0.2);
    margin-left: var(--space-6);
  }

  .message .label {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--text-tertiary);
    display: block;
    margin-bottom: var(--space-1);
  }

  .message p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
  }

  .message code {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--green-dim);
    background: rgba(0, 196, 154, 0.1);
    padding: 0 var(--space-1);
  }

  .workflow-tips {
    background: var(--bg-tertiary);
    padding: var(--space-3);
  }

  .workflow-tips strong {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-primary);
    display: block;
    margin-bottom: var(--space-2);
  }

  .workflow-tips ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .workflow-tips li {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    padding: var(--space-1) 0;
    padding-left: var(--space-4);
    position: relative;
  }

  .workflow-tips li::before {
    content: '+';
    position: absolute;
    left: 0;
    color: var(--green-dim);
  }

  /* Tools Grid */
  .tools-grid {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .tool-category h4 {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--green-dim);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin: 0 0 var(--space-3);
  }

  .tools-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .tool-item {
    padding: var(--space-4);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
  }

  .tool-item code {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--green-dim);
  }

  .optional-badge {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 600;
    color: #D97757;
    background: rgba(217, 119, 87, 0.1);
    padding: var(--space-1) var(--space-2);
    margin-left: var(--space-2);
    text-transform: uppercase;
  }

  .tool-item p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: var(--space-2) 0;
  }

  .tool-usage {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--text-tertiary);
  }

  /* CTA Section */
  .cta-section {
    text-align: center;
    padding: var(--space-12) var(--space-8);
    background: var(--bg-secondary);
  }

  .cta-section h2 {
    font-family: var(--font-serif);
    font-size: var(--text-2xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0 0 var(--space-2);
  }

  .cta-desc {
    font-size: var(--text-base);
    color: var(--text-secondary);
    margin: 0 0 var(--space-6);
  }

  .cta-buttons {
    display: flex;
    gap: var(--space-4);
    justify-content: center;
    flex-wrap: wrap;
  }

  .btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-6);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    cursor: pointer;
    transition: all var(--transition-fast);
    text-decoration: none;
  }

  .btn-primary {
    background: var(--green-dim);
    border: 1px solid var(--green-dim);
    color: #0d1117;
  }

  .btn-primary:hover {
    box-shadow: 0 0 20px rgba(0, 196, 154, 0.4);
  }

  .btn-secondary {
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-secondary);
  }

  .btn-secondary:hover {
    border-color: var(--green-dim);
    color: var(--green-dim);
  }

  /* Footer */
  .footer {
    padding: var(--space-8);
    text-align: center;
    border-top: 1px solid var(--border);
  }

  .footer-links {
    display: flex;
    justify-content: center;
    gap: var(--space-6);
  }

  .footer-links a {
    font-size: var(--text-sm);
    color: var(--text-tertiary);
  }

  .footer-links a:hover {
    color: var(--green-dim);
  }

  /* Responsive */
  @media (max-width: 768px) {
    .hero h1 {
      font-size: var(--text-3xl);
    }

    .section {
      padding: var(--space-8) var(--space-4);
    }

    .step {
      flex-direction: column;
      gap: var(--space-3);
    }

    .message.user {
      margin-right: 0;
    }

    .message.claude {
      margin-left: 0;
    }
  }
</style>
