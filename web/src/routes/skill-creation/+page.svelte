<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import Icon from '$lib/components/Icon.svelte';
</script>

<Navbar />

<main class="skill-creation">
  <!-- Hero -->
  <section class="hero">
    <h1>Skill Creation</h1>
    <p class="hero-subtitle">Create world-class skills with our automated pipeline</p>
  </section>

  <!-- Two Paths -->
  <section class="section">
    <div class="section-header">
      <span class="section-number">01</span>
      <h2>Two Paths</h2>
    </div>
    <div class="section-content">
      <p class="section-desc">Choose your approach based on how deeply you want to explore.</p>

      <div class="paths-grid">
        <div class="path-card">
          <div class="path-header">
            <span class="path-icon">&#9889;</span>
            <span class="path-name">Quick Path</span>
          </div>
          <div class="path-body">
            <div class="path-flow">
              <span class="flow-step">research</span>
              <span class="flow-arrow">→</span>
              <span class="flow-step">new</span>
              <span class="flow-arrow">→</span>
              <span class="flow-step">score</span>
            </div>
            <p class="path-desc">Jump straight into automated creation when you know exactly what skill you want.</p>
            <div class="path-when">
              <strong>When to use:</strong>
              <ul>
                <li>You have a clear vision</li>
                <li>The domain is well-understood</li>
                <li>You want speed over exploration</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="path-card highlight">
          <div class="path-header">
            <span class="path-icon">&#128161;</span>
            <span class="path-name">Deep Path</span>
          </div>
          <div class="path-body">
            <div class="path-flow">
              <span class="flow-step highlight">brainstorm</span>
              <span class="flow-arrow">→</span>
              <span class="flow-step">research</span>
              <span class="flow-arrow">→</span>
              <span class="flow-step">new</span>
              <span class="flow-arrow">→</span>
              <span class="flow-step">score</span>
            </div>
            <p class="path-desc">Start with exploration when you want maximum depth and your personal touch.</p>
            <div class="path-when">
              <strong>When to use:</strong>
              <ul>
                <li>You want to explore deeply</li>
                <li>You have unique insights to add</li>
                <li>Quality over speed</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Brainstorming Phase -->
  <section class="section">
    <div class="section-header">
      <span class="section-number">02</span>
      <h2>Brainstorming Phase</h2>
      <span class="optional-badge">Optional</span>
    </div>
    <div class="section-content">
      <p class="section-desc">Deep exploration before creation. Name inspirational figures, walk through pitfalls, add your personal touch.</p>

      <div class="brainstorm-areas">
        <div class="area-card">
          <div class="area-header">
            <span class="area-icon">&#128100;</span>
            <h3>The Expert</h3>
          </div>
          <p>Who inspires this skill? Name the masters whose wisdom should inform it.</p>
        </div>

        <div class="area-card">
          <div class="area-header">
            <span class="area-icon">&#128679;</span>
            <h3>Boundaries</h3>
          </div>
          <p>Stay in your lane. What does this skill own vs. hand off to others?</p>
        </div>

        <div class="area-card">
          <div class="area-header">
            <span class="area-icon">&#9888;&#65039;</span>
            <h3>Common Pitfalls</h3>
          </div>
          <p>Walk through dangerous scenarios. What mistakes do people make?</p>
        </div>

        <div class="area-card">
          <div class="area-header">
            <span class="area-icon">&#129309;</span>
            <h3>Collaboration</h3>
          </div>
          <p>Works well with. What other skills complement this one?</p>
        </div>

        <div class="area-card">
          <div class="area-header">
            <span class="area-icon">&#10024;</span>
            <h3>Personal Touch</h3>
          </div>
          <p>Make it uniquely yours. Add insights from your own experience.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Research Phase -->
  <section class="section">
    <div class="section-header">
      <span class="section-number">03</span>
      <h2>Research Phase</h2>
    </div>
    <div class="section-content">
      <p class="section-desc">Automatically gather pain points, expert content, and ecosystem mapping.</p>

      <div class="research-grid">
        <div class="research-item">
          <h4>Pain Points</h4>
          <p>Common frustrations developers face in this domain</p>
        </div>
        <div class="research-item">
          <h4>Expert Content</h4>
          <p>Best practices from industry leaders and documentation</p>
        </div>
        <div class="research-item">
          <h4>Ecosystem Mapping</h4>
          <p>Related tools, libraries, and technologies</p>
        </div>
        <div class="research-item">
          <h4>Anti-Patterns</h4>
          <p>What to avoid and why it causes problems</p>
        </div>
      </div>

      <div class="brainstorm-integration">
        <p><strong>Brainstorm insights flow in:</strong> If you used the brainstorm phase, your insights are automatically integrated into research - inspirational figures, boundaries, pitfalls, and personal touches all enrich the output.</p>
      </div>
    </div>
  </section>

  <!-- Creation Phase -->
  <section class="section">
    <div class="section-header">
      <span class="section-number">04</span>
      <h2>Creation Phase</h2>
    </div>
    <div class="section-content">
      <p class="section-desc">Generate 4 YAML files that define a world-class skill.</p>

      <div class="files-grid">
        <div class="file-card">
          <div class="file-header">
            <Icon name="file-text" size={16} />
            <span>skill.yaml</span>
          </div>
          <div class="file-body">
            <ul>
              <li>Identity (world-class template)</li>
              <li>Patterns (how to do it right)</li>
              <li>Anti-patterns (what to avoid)</li>
              <li>Handoffs (when to delegate)</li>
            </ul>
          </div>
        </div>

        <div class="file-card">
          <div class="file-header">
            <Icon name="file-text" size={16} />
            <span>sharp-edges.yaml</span>
          </div>
          <div class="file-body">
            <ul>
              <li>8-12 gotchas</li>
              <li>Detection patterns</li>
              <li>Severity levels</li>
              <li>Workarounds</li>
            </ul>
          </div>
        </div>

        <div class="file-card">
          <div class="file-header">
            <Icon name="file-text" size={16} />
            <span>validations.yaml</span>
          </div>
          <div class="file-body">
            <ul>
              <li>8-12 automated checks</li>
              <li>Code patterns to match</li>
              <li>Error messages</li>
              <li>Fix suggestions</li>
            </ul>
          </div>
        </div>

        <div class="file-card">
          <div class="file-header">
            <Icon name="file-text" size={16} />
            <span>collaboration.yaml</span>
          </div>
          <div class="file-body">
            <ul>
              <li>Prerequisites</li>
              <li>Delegation triggers</li>
              <li>Cross-domain insights</li>
              <li>Team skills</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Scoring Phase -->
  <section class="section">
    <div class="section-header">
      <span class="section-number">05</span>
      <h2>Quality Scoring</h2>
    </div>
    <div class="section-content">
      <p class="section-desc">Every skill is scored against a 100-point quality rubric. Minimum 80 to ship.</p>

      <div class="scoring-breakdown">
        <div class="score-category">
          <div class="score-header">
            <span class="score-name">Identity</span>
            <span class="score-points">25 pts</span>
          </div>
          <p>Clear purpose, unique expertise, well-defined scope</p>
        </div>

        <div class="score-category">
          <div class="score-header">
            <span class="score-name">Sharp Edges</span>
            <span class="score-points">25 pts</span>
          </div>
          <p>8-12 gotchas with detection patterns and solutions</p>
        </div>

        <div class="score-category">
          <div class="score-header">
            <span class="score-name">Validations</span>
            <span class="score-points">25 pts</span>
          </div>
          <p>8-12 automated checks that actually catch issues</p>
        </div>

        <div class="score-category">
          <div class="score-header">
            <span class="score-name">Collaboration</span>
            <span class="score-points">25 pts</span>
          </div>
          <p>Clear handoffs, prerequisites, and team dynamics</p>
        </div>
      </div>

      <div class="score-minimum">
        <div class="score-bar">
          <div class="score-fill" style="width: 80%"></div>
          <span class="score-label">80</span>
        </div>
        <p>Minimum score to ship. Skills below 80 need improvement.</p>
      </div>
    </div>
  </section>

  <!-- Tools Reference -->
  <section class="section">
    <div class="section-header">
      <span class="section-number">06</span>
      <h2>Tools Reference</h2>
    </div>
    <div class="section-content">
      <div class="tools-list">
        <div class="tool-item">
          <code>spawner_skill_brainstorm</code>
          <span class="tool-badge optional">Optional</span>
          <p>Deep exploration before creation - name experts, define boundaries, walk through pitfalls</p>
        </div>
        <div class="tool-item">
          <code>spawner_skill_research</code>
          <span class="tool-badge">Required</span>
          <p>Gather pain points, expert content, ecosystem mapping</p>
        </div>
        <div class="tool-item">
          <code>spawner_skill_new</code>
          <span class="tool-badge">Required</span>
          <p>Generate 4 YAML files (skill, sharp-edges, validations, collaboration)</p>
        </div>
        <div class="tool-item">
          <code>spawner_skill_score</code>
          <span class="tool-badge">Required</span>
          <p>Score against 100-point quality rubric (80 minimum to ship)</p>
        </div>
        <div class="tool-item">
          <code>spawner_skill_upgrade</code>
          <span class="tool-badge optional">Optional</span>
          <p>Enhance existing skills with targeted improvements</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Example -->
  <section class="section">
    <div class="section-header">
      <span class="section-number">07</span>
      <h2>Example Workflow</h2>
    </div>
    <div class="section-content">
      <div class="example-conversation">
        <div class="message user">
          <span class="message-label">You</span>
          <p>Let's brainstorm a skill for database migrations</p>
        </div>
        <div class="message claude">
          <span class="message-label">Claude</span>
          <div class="message-content">
            <p><strong>[Uses spawner_skill_brainstorm]</strong></p>
            <ul>
              <li>The Expert: Who inspires this skill?</li>
              <li>Boundaries: What does it own vs. hand off?</li>
              <li>Common Pitfalls: Walk through dangerous scenarios</li>
              <li>Collaboration: What skills does it work with?</li>
              <li>Personal Touch: Your unique insights</li>
            </ul>
          </div>
        </div>
        <div class="message claude">
          <span class="message-label">Claude</span>
          <p><strong>[Uses spawner_skill_research with brainstorm insights]</strong></p>
        </div>
        <div class="message claude">
          <span class="message-label">Claude</span>
          <p><strong>[Uses spawner_skill_new to generate skill files]</strong></p>
        </div>
        <div class="message claude">
          <span class="message-label">Claude</span>
          <p><strong>[Uses spawner_skill_score - minimum 80 to ship]</strong></p>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="cta-section">
    <h2>Ready to create skills?</h2>
    <p class="cta-desc">Start with Claude and use the skill creation tools.</p>
    <div class="cta-buttons">
      <a href="/" class="btn btn-primary">Get Started</a>
      <a href="/how-it-works" class="btn btn-secondary">How It Works</a>
    </div>
  </section>

  <footer class="footer">
    <div class="footer-links">
      <a href="https://github.com/vibeforge1111/vibeship-spawner" target="_blank" rel="noopener">GitHub</a>
      <a href="/">Home</a>
      <a href="/how-it-works">How It Works</a>
    </div>
  </footer>
</main>

<style>
  .skill-creation {
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

  .optional-badge {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 600;
    color: #D97757;
    background: rgba(217, 119, 87, 0.1);
    padding: var(--space-1) var(--space-2);
    border-radius: 4px;
    text-transform: uppercase;
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

  /* Paths Grid */
  .paths-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: var(--space-4);
  }

  .path-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
  }

  .path-card.highlight {
    border-color: var(--green-dim);
  }

  .path-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-4);
    background: var(--bg-tertiary);
    border-bottom: 1px solid var(--border);
  }

  .path-icon {
    font-size: var(--text-xl);
  }

  .path-name {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
  }

  .path-body {
    padding: var(--space-4);
  }

  .path-flow {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    flex-wrap: wrap;
    margin-bottom: var(--space-4);
  }

  .flow-step {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-primary);
    background: var(--bg-tertiary);
    padding: var(--space-1) var(--space-2);
    border-radius: 4px;
    border: 1px solid var(--border);
  }

  .flow-step.highlight {
    border-color: var(--green-dim);
    color: var(--green-dim);
  }

  .flow-arrow {
    color: var(--text-tertiary);
  }

  .path-desc {
    font-size: var(--text-base);
    color: var(--text-secondary);
    margin: 0 0 var(--space-4);
  }

  .path-when {
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }

  .path-when strong {
    color: var(--text-primary);
    display: block;
    margin-bottom: var(--space-2);
  }

  .path-when ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .path-when li {
    padding: var(--space-1) 0;
    padding-left: var(--space-4);
    position: relative;
  }

  .path-when li::before {
    content: '+';
    position: absolute;
    left: 0;
    color: var(--green-dim);
  }

  /* Brainstorm Areas */
  .brainstorm-areas {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-4);
  }

  .area-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: var(--space-4);
  }

  .area-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-2);
  }

  .area-icon {
    font-size: var(--text-xl);
  }

  .area-card h3 {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .area-card p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
  }

  /* Research Grid */
  .research-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-4);
    margin-bottom: var(--space-6);
  }

  .research-item {
    padding: var(--space-4);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 8px;
  }

  .research-item h4 {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--green-dim);
    margin: 0 0 var(--space-2);
  }

  .research-item p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
  }

  .brainstorm-integration {
    padding: var(--space-4);
    background: rgba(0, 196, 154, 0.05);
    border: 1px solid rgba(0, 196, 154, 0.3);
    border-radius: 8px;
  }

  .brainstorm-integration p {
    font-size: var(--text-base);
    color: var(--text-secondary);
    margin: 0;
  }

  .brainstorm-integration strong {
    color: var(--green-dim);
  }

  /* Files Grid */
  .files-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-4);
  }

  .file-card {
    background: #0d1117;
    border: 1px solid #30363d;
    border-radius: 8px;
    overflow: hidden;
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
  }

  .file-body ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .file-body li {
    font-size: var(--text-sm);
    color: #c9d1d9;
    padding: var(--space-1) 0;
    padding-left: var(--space-4);
    position: relative;
  }

  .file-body li::before {
    content: '-';
    position: absolute;
    left: var(--space-1);
    color: var(--green-dim);
  }

  /* Scoring */
  .scoring-breakdown {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-4);
    margin-bottom: var(--space-6);
  }

  .score-category {
    padding: var(--space-4);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 8px;
  }

  .score-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-2);
  }

  .score-name {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
  }

  .score-points {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--green-dim);
    background: rgba(0, 196, 154, 0.1);
    padding: var(--space-1) var(--space-2);
    border-radius: 4px;
  }

  .score-category p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
  }

  .score-minimum {
    padding: var(--space-4);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 8px;
    text-align: center;
  }

  .score-bar {
    position: relative;
    height: 24px;
    background: var(--bg-tertiary);
    border-radius: 4px;
    overflow: hidden;
    margin-bottom: var(--space-3);
  }

  .score-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--green-dim), var(--green));
    border-radius: 4px;
  }

  .score-label {
    position: absolute;
    right: calc(20% + var(--space-2));
    top: 50%;
    transform: translateY(-50%);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--text-primary);
  }

  .score-minimum p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
  }

  /* Tools List */
  .tools-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .tool-item {
    padding: var(--space-4);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 8px;
  }

  .tool-item code {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--green-dim);
  }

  .tool-badge {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--green-dim);
    background: rgba(0, 196, 154, 0.1);
    padding: var(--space-1) var(--space-2);
    border-radius: 4px;
    margin-left: var(--space-2);
    text-transform: uppercase;
  }

  .tool-badge.optional {
    color: #D97757;
    background: rgba(217, 119, 87, 0.1);
  }

  .tool-item p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: var(--space-2) 0 0;
  }

  /* Example Conversation */
  .example-conversation {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .message {
    padding: var(--space-4);
    border-radius: 8px;
  }

  .message.user {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    margin-right: var(--space-8);
  }

  .message.claude {
    background: rgba(0, 196, 154, 0.05);
    border: 1px solid rgba(0, 196, 154, 0.2);
    margin-left: var(--space-8);
  }

  .message-label {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-tertiary);
    display: block;
    margin-bottom: var(--space-2);
  }

  .message p {
    font-size: var(--text-base);
    color: var(--text-secondary);
    margin: 0;
  }

  .message-content ul {
    list-style: none;
    padding: 0;
    margin: var(--space-2) 0 0;
  }

  .message-content li {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    padding: var(--space-1) 0;
    padding-left: var(--space-4);
    position: relative;
  }

  .message-content li::before {
    content: '-';
    position: absolute;
    left: 0;
    color: var(--green-dim);
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

    .paths-grid {
      grid-template-columns: 1fr;
    }

    .message.user {
      margin-right: 0;
    }

    .message.claude {
      margin-left: 0;
    }
  }
</style>
