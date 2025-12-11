<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import Icon from '$lib/components/Icon.svelte';
</script>

<Navbar />

<main class="how-it-works">
  <!-- Hero -->
  <section class="hero">
    <h1>How It Works</h1>
    <p class="hero-subtitle">The architecture behind your vibe coding superpowers</p>
  </section>

  <!-- Why Agents -->
  <section class="section">
    <div class="section-header">
      <span class="section-number">00</span>
      <h2>Why Agents</h2>
    </div>
    <div class="section-content">
      <div class="problem-grid">
        <div class="problem-card">
          <h3>Generic Claude</h3>
          <ul>
            <li><strong>Context Loss</strong> - Forgets what was decided<br/>50 messages ago</li>
            <li><strong>No Conventions</strong> - Different patterns<br/>every time it writes code</li>
            <li><strong>No Memory</strong> - Can't remember decisions<br/>across sessions</li>
            <li><strong>Skips Steps</strong> - Tests, docs, security<br/>checks get "forgotten"</li>
            <li><strong>Generic Output</strong> - One-size-fits-all<br/>approach to every project</li>
            <li><strong>Surface Level</strong> - Knows a bit of everything,<br/>master of nothing</li>
            <li><strong>Bad Architecture</strong> - Drifts from patterns,<br/>ignores best practices</li>
            <li><strong>No Verification</strong> - "It's completed"<br/>without actually testing</li>
          </ul>
        </div>
        <div class="vs">vs</div>
        <div class="problem-card highlight">
          <h3>Claude with Agents</h3>
          <ul>
            <li><strong>Focused Agents</strong> - One task per agent,<br/>no context loss</li>
            <li><strong>Skill Files</strong> - Enforce conventions<br/>and best practices</li>
            <li><strong>State Tracking</strong> - Decisions persist<br/>in state.json</li>
            <li><strong>Task Queue</strong> - Every step tracked,<br/>nothing gets skipped</li>
            <li><strong>Specialized</strong> - Agents configured<br/>for your project type</li>
            <li><strong>Deep Expertise</strong> - Agents master Solidity,<br/>RAG, auth, and more</li>
            <li><strong>Good Architecture</strong> - Follows patterns,<br/>enforces best practices</li>
            <li><strong>Verified</strong> - Must pass tests<br/>before marking complete</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- The Architecture -->
  <section class="section">
    <div class="section-header">
      <span class="section-number">01</span>
      <h2>The Architecture</h2>
    </div>
    <div class="section-content">
      <div class="architecture-diagram">
        <div class="arch-layer">
          <span class="layer-label">You</span>
          <div class="arch-box user">
            <span>"Build me a marketplace"</span>
          </div>
        </div>
        <div class="arch-arrow">↓</div>
        <div class="arch-layer">
          <span class="layer-label">MCP</span>
          <div class="arch-box mcp">
            <span>vibeship-spawner</span>
          </div>
        </div>
        <div class="arch-arrow">↓</div>
        <div class="arch-layer">
          <span class="layer-label">Scaffolding</span>
          <div class="arch-box-group">
            <div class="arch-box small">CLAUDE.md</div>
            <div class="arch-box small">state.json</div>
            <div class="arch-box small">skills/</div>
            <div class="arch-box small">docs/</div>
          </div>
        </div>
        <div class="arch-arrow">↓</div>
        <div class="arch-layer">
          <span class="layer-label">Agents</span>
          <div class="arch-box-group">
            <div class="arch-box small agent">planner</div>
            <div class="arch-box small agent">frontend</div>
            <div class="arch-box small agent">backend</div>
            <div class="arch-box small agent">testing</div>
          </div>
        </div>
        <div class="arch-arrow">↓</div>
        <div class="arch-layer">
          <span class="layer-label">Output</span>
          <div class="arch-box output">
            <span>Your shipped product</span>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Project Phases -->
  <section class="section">
    <div class="section-header">
      <span class="section-number">02</span>
      <h2>Project Phases</h2>
    </div>
    <div class="section-content">
      <div class="phases">
        <div class="phase">
          <div class="phase-header">
            <span class="phase-status active"></span>
            <span class="phase-name">Planning</span>
          </div>
          <div class="phase-body">
            <p>Claude greets you and asks discovery questions to understand your vision.</p>
            <ul>
              <li>Generates PRD (Product Requirements)</li>
              <li>Creates Architecture document</li>
              <li>Breaks down into tasks</li>
              <li>Identifies custom skills needed</li>
            </ul>
          </div>
        </div>
        <div class="phase-arrow">→</div>
        <div class="phase">
          <div class="phase-header">
            <span class="phase-status"></span>
            <span class="phase-name">Building</span>
          </div>
          <div class="phase-body">
            <p>Specialized agents execute tasks from the queue, one by one.</p>
            <ul>
              <li>Each agent loads its skill file</li>
              <li>Follows architecture decisions</li>
              <li>Updates task status on completion</li>
              <li>Checkpoints progress automatically</li>
            </ul>
          </div>
        </div>
        <div class="phase-arrow">→</div>
        <div class="phase">
          <div class="phase-header">
            <span class="phase-status"></span>
            <span class="phase-name">Review and Testing</span>
          </div>
          <div class="phase-body">
            <p>Summary of what was built, with opportunity for feedback.</p>
            <ul>
              <li>Shows completed tasks</li>
              <li>Highlights decisions made</li>
              <li>Lists assumptions</li>
              <li>Allows replan if needed</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- State Management -->
  <section class="section">
    <div class="section-header">
      <span class="section-number">03</span>
      <h2>State Management</h2>
    </div>
    <div class="section-content">
      <p class="section-desc">Unlike vanilla Claude, vibeship maintains persistent state across sessions.</p>

      <div class="state-files">
        <div class="state-file-wrapper">
          <div class="state-file">
            <div class="file-header">
              <Icon name="file-text" size={16} />
              <span>state.json</span>
            </div>
            <div class="file-body">
              <pre><code>{`{
  "phase": "building",
  "checkpoint": { "last_task": "setup-db" },
  "decisions": [...],
  "assumptions": [...]
}`}</code></pre>
            </div>
          </div>
          <p class="file-desc">Tracks current phase, decisions made,<br/>and where to resume from</p>
        </div>

        <div class="state-file-wrapper">
          <div class="state-file">
            <div class="file-header">
              <Icon name="file-text" size={16} />
              <span>task_queue.json</span>
            </div>
            <div class="file-body">
              <pre><code>{`{
  "tasks": [
    { "id": 1, "status": "completed" },
    { "id": 2, "status": "in_progress" },
    { "id": 3, "status": "pending" }
  ]
}`}</code></pre>
            </div>
          </div>
          <p class="file-desc">Nothing gets skipped - critical for<br/>backend, security, and architecture</p>
        </div>

        <div class="state-file-wrapper">
          <div class="state-file">
            <div class="file-header">
              <Icon name="file-text" size={16} />
              <span>CLAUDE.md</span>
            </div>
            <div class="file-body">
              <pre><code>{`# Project Instructions
On session start:
1. Read state.json
2. Load appropriate skill
3. Resume from checkpoint`}</code></pre>
            </div>
          </div>
          <p class="file-desc">Project instructions Claude reads<br/>on every session start</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Skills System -->
  <section class="section">
    <div class="section-header">
      <span class="section-number">04</span>
      <h2>Skills System</h2>
    </div>
    <div class="section-content">
      <p class="section-desc">Each agent has a skill file that defines its identity, capabilities, and workflow.</p>

      <div class="skills-example">
        <div class="skill-card">
          <div class="skill-header">
            <span class="skill-icon">🏗️</span>
            <span class="skill-name">planner.md</span>
          </div>
          <div class="skill-body">
            <p>Orchestrates the project. Asks discovery questions, generates PRD and Architecture, creates task queue.</p>
          </div>
        </div>
        <div class="skill-card">
          <div class="skill-header">
            <span class="skill-icon">🎨</span>
            <span class="skill-name">frontend.md</span>
          </div>
          <div class="skill-body">
            <p>Builds UI components following the architecture. Uses designated frameworks and styling conventions.</p>
          </div>
        </div>
        <div class="skill-card">
          <div class="skill-header">
            <span class="skill-icon">⚙️</span>
            <span class="skill-name">backend.md</span>
          </div>
          <div class="skill-body">
            <p>Implements API routes, business logic, and integrations. Follows security best practices.</p>
          </div>
        </div>
        <div class="skill-card">
          <div class="skill-header">
            <span class="skill-icon">🧪</span>
            <span class="skill-name">testing.md</span>
          </div>
          <div class="skill-body">
            <p>Writes tests before marking features complete. Ensures code quality and coverage.</p>
          </div>
        </div>
      </div>

      <div class="custom-skills">
        <h3>Custom Skills</h3>
        <p>If your project needs specialized knowledge (e.g., "solana-nft-minting" or "hipaa-compliance"), vibeship detects this during planning and generates custom skills automatically.</p>
      </div>
    </div>
  </section>

  <!-- Behaviors -->
  <section class="section">
    <div class="section-header">
      <span class="section-number">05</span>
      <h2>Behaviors & Constraints</h2>
    </div>
    <div class="section-content">
      <p class="section-desc">Configure how your agents work with enforced behaviors.</p>

      <div class="behaviors-grid">
        <div class="behavior mandatory">
          <div class="behavior-header">
            <span class="behavior-badge">Mandatory</span>
          </div>
          <ul>
            <li><strong>verify-before-complete</strong> - Must run code/tests before marking done</li>
            <li><strong>follow-architecture</strong> - No deviating from ARCHITECTURE.md</li>
            <li><strong>maintainable-code</strong> - Clear naming, no magic numbers</li>
            <li><strong>secure-code</strong> - Check for secrets, validate inputs</li>
          </ul>
        </div>
        <div class="behavior optional">
          <div class="behavior-header">
            <span class="behavior-badge optional">Optional</span>
          </div>
          <ul>
            <li><strong>tdd-mode</strong> - Write tests before implementation</li>
            <li><strong>verbose-logging</strong> - Detailed progress updates</li>
            <li><strong>ask-before-major</strong> - Confirm big decisions with user</li>
            <li><strong>minimal-dependencies</strong> - Avoid unnecessary packages</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- Commands -->
  <section class="section">
    <div class="section-header">
      <span class="section-number">06</span>
      <h2>Commands</h2>
    </div>
    <div class="section-content">
      <p class="section-desc">Control your project with simple commands.</p>

      <div class="commands-list">
        <div class="command">
          <code>status</code>
          <span>Show current phase, completed tasks, next steps</span>
        </div>
        <div class="command">
          <code>continue</code>
          <span>Resume from last checkpoint</span>
        </div>
        <div class="command">
          <code>replan</code>
          <span>Go back to planning phase</span>
        </div>
        <div class="command">
          <code>assumptions</code>
          <span>View and edit current assumptions</span>
        </div>
        <div class="command">
          <code>skip [task]</code>
          <span>Skip a specific task</span>
        </div>
        <div class="command">
          <code>pause</code>
          <span>Save state and stop</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Templates -->
  <section class="section">
    <div class="section-header">
      <span class="section-number">07</span>
      <h2>Built-in Templates</h2>
    </div>
    <div class="section-content">
      <p class="section-desc">Start fast with pre-configured agent/MCP combinations.</p>

      <div class="templates-grid">
        <div class="template-card">
          <h3>SaaS</h3>
          <p>Subscription products</p>
          <div class="template-stack">
            <span class="stack-label">Agents:</span>
            <span>planner, frontend, backend, database, testing</span>
          </div>
          <div class="template-stack">
            <span class="stack-label">MCPs:</span>
            <span>filesystem, supabase, stripe</span>
          </div>
        </div>
        <div class="template-card">
          <h3>Marketplace</h3>
          <p>Buy/sell platforms</p>
          <div class="template-stack">
            <span class="stack-label">Agents:</span>
            <span>planner, frontend, backend, database, payments, search</span>
          </div>
          <div class="template-stack">
            <span class="stack-label">MCPs:</span>
            <span>filesystem, supabase, stripe, algolia</span>
          </div>
        </div>
        <div class="template-card">
          <h3>AI App</h3>
          <p>LLM-powered apps</p>
          <div class="template-stack">
            <span class="stack-label">Agents:</span>
            <span>planner, frontend, backend, database, ai</span>
          </div>
          <div class="template-stack">
            <span class="stack-label">MCPs:</span>
            <span>filesystem, supabase, anthropic</span>
          </div>
        </div>
        <div class="template-card">
          <h3>Web3 dApp</h3>
          <p>Blockchain apps</p>
          <div class="template-stack">
            <span class="stack-label">Agents:</span>
            <span>planner, frontend, smart-contracts, testing</span>
          </div>
          <div class="template-stack">
            <span class="stack-label">MCPs:</span>
            <span>filesystem, git, foundry</span>
          </div>
        </div>
        <div class="template-card">
          <h3>Tool / CLI</h3>
          <p>Utilities and CLIs</p>
          <div class="template-stack">
            <span class="stack-label">Agents:</span>
            <span>planner, backend, testing</span>
          </div>
          <div class="template-stack">
            <span class="stack-label">MCPs:</span>
            <span>filesystem, git</span>
          </div>
        </div>
        <div class="template-card">
          <h3>Mobile App</h3>
          <p>iOS and Android apps</p>
          <div class="template-stack">
            <span class="stack-label">Agents:</span>
            <span>planner, mobile, backend, database, testing</span>
          </div>
          <div class="template-stack">
            <span class="stack-label">MCPs:</span>
            <span>filesystem, supabase, firebase, expo</span>
          </div>
        </div>
      </div>

      <div class="custom-config">
        <p>Need a custom configuration? Use the <a href="/builder">Builder</a> to create your own stack.</p>
      </div>
    </div>
  </section>

  <!-- MCPs Explained -->
  <section class="section">
    <div class="section-header">
      <span class="section-number">08</span>
      <h2>MCPs Explained</h2>
    </div>
    <div class="section-content">
      <p class="section-desc">Model Context Protocol servers give Claude real capabilities.</p>

      <div class="mcps-grid">
        <div class="mcp-item">
          <span class="mcp-name">filesystem</span>
          <span class="mcp-desc">Read/write files, create directories</span>
        </div>
        <div class="mcp-item">
          <span class="mcp-name">supabase</span>
          <span class="mcp-desc">Database, auth, storage, realtime</span>
        </div>
        <div class="mcp-item">
          <span class="mcp-name">stripe</span>
          <span class="mcp-desc">Payments, subscriptions, invoices</span>
        </div>
        <div class="mcp-item">
          <span class="mcp-name">github</span>
          <span class="mcp-desc">Repos, PRs, issues, actions</span>
        </div>
        <div class="mcp-item">
          <span class="mcp-name">anthropic</span>
          <span class="mcp-desc">Claude API for AI features</span>
        </div>
        <div class="mcp-item">
          <span class="mcp-name">pinecone</span>
          <span class="mcp-desc">Vector database for RAG</span>
        </div>
        <div class="mcp-item">
          <span class="mcp-name">twilio</span>
          <span class="mcp-desc">SMS, voice, video</span>
        </div>
        <div class="mcp-item">
          <span class="mcp-name">algolia</span>
          <span class="mcp-desc">Search and discovery</span>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="cta-section">
    <h2>Ready to orchestrate?</h2>
    <div class="cta-buttons">
      <a href="/" class="btn btn-primary">Get Started</a>
      <a href="/builder" class="btn btn-secondary">Build Custom Stack</a>
    </div>
  </section>

  <footer class="footer">
    <div class="footer-links">
      <a href="https://github.com/vibeforge1111/vibeship-orchestrator" target="_blank" rel="noopener">GitHub</a>
      <a href="/">Home</a>
      <a href="/builder">Builder</a>
    </div>
  </footer>
</main>

<style>
  .how-it-works {
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
    border-radius: 4px;
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

  /* Problem Section */
  .problem-grid {
    display: flex;
    align-items: stretch;
    gap: var(--space-4);
  }

  .problem-card {
    flex: 1;
    padding: var(--space-5);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 8px;
  }

  .problem-card.highlight {
    border-color: var(--green-dim);
    background: rgba(0, 196, 154, 0.05);
  }

  .problem-icon {
    font-size: var(--text-2xl);
    margin-bottom: var(--space-3);
  }

  .problem-card h3 {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--space-3);
  }

  .problem-card ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .problem-card li {
    font-size: var(--text-base);
    color: var(--text-secondary);
    padding: var(--space-2) 0;
    padding-left: var(--space-4);
    position: relative;
  }

  .problem-card li::before {
    content: '×';
    position: absolute;
    left: 0;
    color: var(--red);
    font-weight: 600;
  }

  .problem-card.highlight li::before {
    content: '+';
    color: var(--green-dim);
  }

  .vs {
    display: flex;
    align-items: center;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-tertiary);
    padding: 0 var(--space-2);
  }

  /* Architecture Diagram */
  .architecture-diagram {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
  }

  .arch-layer {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    width: 100%;
    max-width: 500px;
  }

  .layer-label {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-tertiary);
    width: 80px;
    text-align: right;
  }

  .arch-box {
    flex: 1;
    padding: var(--space-3) var(--space-4);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 6px;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    text-align: center;
  }

  .arch-box.user {
    border-color: var(--border-strong);
    color: var(--text-primary);
  }

  .arch-box.mcp {
    border-color: var(--green-dim);
    color: var(--text-primary);
  }

  .arch-box.output {
    border-color: var(--green-dim);
    color: var(--text-primary);
  }

  .arch-box-group {
    flex: 1;
    display: flex;
    gap: var(--space-2);
    flex-wrap: wrap;
    justify-content: center;
  }

  .arch-box.small {
    flex: 0 1 auto;
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-sm);
  }

  .arch-box.agent {
    border-color: var(--border-strong);
    color: var(--text-primary);
  }

  .arch-arrow {
    font-family: var(--font-mono);
    color: var(--text-tertiary);
    margin-left: 84px;
  }

  /* Phases */
  .phases {
    display: flex;
    align-items: stretch;
    gap: var(--space-3);
  }

  .phase {
    flex: 1;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
  }

  .phase-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-4);
    background: var(--bg-tertiary);
    border-bottom: 1px solid var(--border);
  }

  .phase-status {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--text-tertiary);
  }

  .phase-status.active {
    background: var(--green);
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .phase-name {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
  }

  .phase-body {
    padding: var(--space-4);
  }

  .phase-body p {
    font-size: var(--text-base);
    color: var(--text-secondary);
    margin: 0 0 var(--space-3);
  }

  .phase-body ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .phase-body li {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    padding: var(--space-1) 0;
    padding-left: var(--space-4);
    position: relative;
  }

  .phase-body li::before {
    content: '›';
    position: absolute;
    left: 0;
    color: var(--green-dim);
  }

  .phase-arrow {
    display: flex;
    align-items: center;
    font-family: var(--font-mono);
    color: var(--text-tertiary);
    padding: 0 var(--space-1);
  }

  /* State Files */
  .state-files {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--space-4);
  }

  .state-file-wrapper {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .state-file {
    background: #0d1117;
    border: 1px solid #30363d;
    border-radius: 8px;
    overflow: hidden;
    height: 180px;
    display: flex;
    flex-direction: column;
  }

  .file-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: #161b22;
    border-bottom: 1px solid #30363d;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: #8b949e;
  }

  .file-body {
    padding: var(--space-3);
    flex: 1;
    overflow: hidden;
  }

  .file-body pre {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: #c9d1d9;
    overflow-x: auto;
  }

  .file-desc {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
    padding-left: var(--space-1);
  }

  /* Skills */
  .skills-example {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-4);
    margin-bottom: var(--space-6);
  }

  .skill-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
  }

  .skill-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3);
    background: var(--bg-tertiary);
    border-bottom: 1px solid var(--border);
  }

  .skill-icon {
    font-size: var(--text-base);
  }

  .skill-name {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
  }

  .skill-body {
    padding: var(--space-3);
  }

  .skill-body p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.6;
  }

  .custom-skills {
    background: rgba(217, 119, 87, 0.05);
    border: 1px solid rgba(217, 119, 87, 0.3);
    border-radius: 8px;
    padding: var(--space-4);
  }

  .custom-skills h3 {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: #D97757;
    margin: 0 0 var(--space-2);
  }

  .custom-skills p {
    font-size: var(--text-base);
    color: var(--text-secondary);
    margin: 0;
  }

  /* Behaviors */
  .behaviors-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--space-4);
  }

  .behavior {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: var(--space-4);
  }

  .behavior.mandatory {
    border-color: var(--green-dim);
  }

  .behavior-header {
    margin-bottom: var(--space-3);
  }

  .behavior-badge {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--green-dim);
    background: rgba(0, 196, 154, 0.1);
    padding: var(--space-1) var(--space-2);
    border-radius: 4px;
  }

  .behavior-badge.optional {
    color: var(--text-secondary);
    background: var(--bg-tertiary);
  }

  .behavior ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .behavior li {
    font-size: var(--text-base);
    color: var(--text-secondary);
    padding: var(--space-2) 0;
    border-bottom: 1px solid var(--border);
  }

  .behavior li:last-child {
    border-bottom: none;
  }

  .behavior li strong {
    color: var(--text-primary);
    font-weight: 500;
  }

  /* Commands */
  .commands-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .command {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-3) var(--space-4);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 6px;
  }

  .command code {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--green-dim);
    background: rgba(0, 196, 154, 0.1);
    padding: var(--space-1) var(--space-3);
    border-radius: 4px;
    min-width: 120px;
  }

  .command span {
    font-size: var(--text-base);
    color: var(--text-secondary);
  }

  /* Templates */
  .templates-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: var(--space-4);
    margin-bottom: var(--space-6);
  }

  .template-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: var(--space-4);
  }

  .template-card h3 {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--space-1);
  }

  .template-card > p {
    font-size: var(--text-sm);
    color: var(--text-tertiary);
    margin: 0 0 var(--space-3);
  }

  .template-stack {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin-bottom: var(--space-2);
  }

  .stack-label {
    color: var(--text-tertiary);
    margin-right: var(--space-1);
  }

  .custom-config {
    text-align: center;
    padding: var(--space-4);
    background: var(--bg-secondary);
    border: 1px dashed var(--border);
    border-radius: 8px;
  }

  .custom-config p {
    font-size: var(--text-base);
    color: var(--text-secondary);
    margin: 0;
  }

  .custom-config a {
    color: var(--green-dim);
    font-weight: 500;
  }

  /* MCPs */
  .mcps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-3);
  }

  .mcp-item {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    padding: var(--space-3);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 6px;
  }

  .mcp-item .mcp-name {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--green-dim);
  }

  .mcp-item .mcp-desc {
    font-size: var(--text-sm);
    color: var(--text-secondary);
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
    border-radius: 4px;
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

    .problem-grid {
      flex-direction: column;
    }

    .vs {
      padding: var(--space-2) 0;
    }

    .phases {
      flex-direction: column;
    }

    .phase-arrow {
      transform: rotate(90deg);
      margin: 0;
      justify-content: center;
    }

    .arch-layer {
      flex-direction: column;
      gap: var(--space-2);
    }

    .layer-label {
      width: auto;
      text-align: center;
    }

    .arch-arrow {
      margin-left: 0;
    }

    .command {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-2);
    }

    .command code {
      min-width: auto;
    }
  }
</style>
