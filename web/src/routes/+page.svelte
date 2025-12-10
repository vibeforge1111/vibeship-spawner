<script lang="ts">
  import { onMount } from 'svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import TemplateCard from '$lib/components/TemplateCard.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { templates, applyTemplate, projectDescription } from '$lib/stores/stack';
  import { goto } from '$app/navigation';

  // Terminal animation state
  let showCursor = $state(true);
  let copied = $state(false);
  let isAnimating = $state(false);
  let animationComplete = $state(false);

  const terminalLines = [
    { type: 'prompt', text: '> ' },
    { type: 'user', text: '"Create a saas project called my-startup"', delay: 50 },
    { type: 'blank', delay: 800 },
    { type: 'system', text: '+ vibeship orchestrator connected', delay: 100 },
    { type: 'system', text: '> Analyzing project type...', delay: 400 },
    { type: 'system', text: '+ Template: SaaS', delay: 200 },
    { type: 'system', text: '+ Agents: planner, frontend, backend, database, testing', delay: 200 },
    { type: 'system', text: '+ MCPs: filesystem, supabase, stripe', delay: 200 },
    { type: 'blank', delay: 300 },
    { type: 'system', text: '> Scaffolding project...', delay: 500 },
    { type: 'success', text: '+ Project "my-startup" created!', delay: 300 },
    { type: 'blank', delay: 200 },
    { type: 'files', text: '  my-startup/', delay: 100 },
    { type: 'files', text: '  ├── CLAUDE.md', delay: 80 },
    { type: 'files', text: '  ├── state.json', delay: 80 },
    { type: 'files', text: '  ├── skills/', delay: 80 },
    { type: 'files', text: '  │   ├── planner.md', delay: 60 },
    { type: 'files', text: '  │   ├── frontend.md', delay: 60 },
    { type: 'files', text: '  │   └── ...', delay: 60 },
    { type: 'files', text: '  └── docs/', delay: 80 },
    { type: 'blank', delay: 400 },
    { type: 'magic', text: '✨ Ready to build. Just start vibing.', delay: 100 },
  ];

  let visibleLines = $state<typeof terminalLines>([]);

  function startAnimation() {
    visibleLines = [];
    isAnimating = true;
    animationComplete = false;
    let lineIndex = 0;

    function showNextLine() {
      if (lineIndex < terminalLines.length) {
        const line = terminalLines[lineIndex];
        visibleLines = [...visibleLines, line];
        lineIndex++;

        const nextDelay = line.delay || 100;
        setTimeout(showNextLine, nextDelay);
      } else {
        isAnimating = false;
        animationComplete = true;
      }
    }

    setTimeout(showNextLine, 500);
  }

  onMount(() => {
    // Cursor blink
    const cursorInterval = setInterval(() => {
      showCursor = !showCursor;
    }, 530);

    // Start animation after a short delay
    setTimeout(startAnimation, 800);

    return () => clearInterval(cursorInterval);
  });

  function selectTemplate(templateId: string) {
    applyTemplate(templateId);
    goto('/builder');
  }

  function copyConfig() {
    navigator.clipboard.writeText(`{
  "mcpServers": {
    "vibeship": {
      "command": "npx",
      "args": ["vibeship-orchestrator-mcp"]
    }
  }
}`);
    copied = true;
    setTimeout(() => copied = false, 2000);
  }
</script>

<Navbar />

<main class="landing">
  <!-- Hero with animated terminal -->
  <section class="hero">
    <div class="hero-glow"></div>
    <div class="hero-content">
      <div class="hero-badge">MCP-FIRST DEVELOPMENT</div>
      <h1 class="hero-title">vibeship orchestrator</h1>
      <p class="hero-tagline">You vibe. It ships.</p>
      <p class="hero-subtitle">The singularity of AI agents and MCPs. One command to summon your entire dev crew.</p>
    </div>

    <!-- Animated Terminal -->
    <div class="terminal-container">
      <div class="terminal">
        <div class="terminal-header">
          <div class="terminal-dots">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
          </div>
          <span class="terminal-title">claude</span>
          {#if animationComplete}
            <button class="replay-btn" onclick={startAnimation} title="Replay animation">
              <Icon name="rotate-ccw" size={14} />
            </button>
          {/if}
        </div>
        <div class="terminal-body">
          {#each visibleLines as line}
            <div class="terminal-line {line.type}">
              {#if line.type === 'prompt'}
                <span class="prompt-symbol">›</span>
              {/if}
              <span>{line.text}</span>
            </div>
          {/each}
          {#if isAnimating}
            <div class="terminal-line">
              <span class="cursor" class:visible={showCursor}>▋</span>
            </div>
          {/if}
        </div>
      </div>
      {#if !isAnimating && visibleLines.length === 0}
        <button class="play-btn" onclick={startAnimation}>
          <Icon name="play" size={24} />
          <span>Watch the magic</span>
        </button>
      {/if}
    </div>
  </section>

  <!-- The Magic: How it works -->
  <section class="magic-section">
    <h2 class="section-title">
      <span class="title-icon">✨</span>
      The Magic
    </h2>
    <p class="section-desc">Three steps to vibe coding wizardry</p>

    <div class="magic-steps">
      <div class="magic-step">
        <div class="step-number">1</div>
        <div class="step-content">
          <h3>Install the MCP</h3>
          <p>One-time setup. Add this to your Claude Desktop config:</p>
          <div class="code-block">
            <pre><code>{`"vibeship": {
  "command": "npx",
  "args": ["vibeship-orchestrator-mcp"]
}`}</code></pre>
            <button class="copy-btn" onclick={copyConfig}>
              {#if copied}
                <Icon name="check" size={14} />
              {:else}
                <Icon name="copy" size={14} />
              {/if}
            </button>
          </div>
          <p class="step-hint">Restart Claude Desktop after adding</p>
        </div>
      </div>

      <div class="magic-step">
        <div class="step-number">2</div>
        <div class="step-content">
          <h3>Describe Your Vision</h3>
          <p>Just tell Claude what you want to build:</p>
          <div class="prompt-examples">
            <div class="prompt-example">"Build me a marketplace for vintage watches"</div>
            <div class="prompt-example">"Create an AI-powered note-taking app"</div>
            <div class="prompt-example">"Start a web3 NFT gallery project"</div>
          </div>
        </div>
      </div>

      <div class="magic-step">
        <div class="step-number">3</div>
        <div class="step-content">
          <h3>Watch the Magic</h3>
          <p>vibeship orchestrates everything:</p>
          <div class="magic-list">
            <div class="magic-item">
              <span class="magic-icon">🤖</span>
              <span>Assembles your AI agent crew</span>
            </div>
            <div class="magic-item">
              <span class="magic-icon">⚡</span>
              <span>Connects the right MCPs</span>
            </div>
            <div class="magic-item">
              <span class="magic-icon">📁</span>
              <span>Scaffolds your project</span>
            </div>
            <div class="magic-item">
              <span class="magic-icon">🚀</span>
              <span>Starts building immediately</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- The Crew: Templates/Agents visualization -->
  <section class="crew-section">
    <h2 class="section-title">
      <span class="title-icon">👥</span>
      Your Crew
    </h2>
    <p class="section-desc">AI agents that work together, orchestrated by vibeship</p>

    <div class="crew-visual">
      <div class="crew-center">
        <div class="orchestrator-node">
          <span class="node-icon">🎯</span>
          <span class="node-label">vibeship</span>
        </div>
      </div>
      <div class="crew-orbit">
        <div class="agent-node" style="--delay: 0s; --position: 0;">
          <span class="node-icon">📋</span>
          <span class="node-label">Planner</span>
        </div>
        <div class="agent-node" style="--delay: 0.5s; --position: 1;">
          <span class="node-icon">🎨</span>
          <span class="node-label">Frontend</span>
        </div>
        <div class="agent-node" style="--delay: 1s; --position: 2;">
          <span class="node-icon">⚙️</span>
          <span class="node-label">Backend</span>
        </div>
        <div class="agent-node" style="--delay: 1.5s; --position: 3;">
          <span class="node-icon">🗄️</span>
          <span class="node-label">Database</span>
        </div>
        <div class="agent-node" style="--delay: 2s; --position: 4;">
          <span class="node-icon">🧪</span>
          <span class="node-label">Testing</span>
        </div>
        <div class="agent-node" style="--delay: 2.5s; --position: 5;">
          <span class="node-icon">💳</span>
          <span class="node-label">Payments</span>
        </div>
      </div>
    </div>

    <div class="templates-grid">
      {#each templates as template}
        <TemplateCard
          {template}
          selected={false}
          onClick={() => selectTemplate(template.id)}
        />
      {/each}
    </div>
  </section>

  <!-- MCP Constellation -->
  <section class="mcp-section">
    <h2 class="section-title">
      <span class="title-icon">🔌</span>
      MCP Superpowers
    </h2>
    <p class="section-desc">Connect to any service. vibeship knows which MCPs you need.</p>

    <div class="mcp-grid">
      <div class="mcp-card">
        <span class="mcp-icon">📂</span>
        <span class="mcp-name">filesystem</span>
        <span class="mcp-desc">Read & write files</span>
      </div>
      <div class="mcp-card">
        <span class="mcp-icon">🔷</span>
        <span class="mcp-name">supabase</span>
        <span class="mcp-desc">Database & auth</span>
      </div>
      <div class="mcp-card">
        <span class="mcp-icon">💳</span>
        <span class="mcp-name">stripe</span>
        <span class="mcp-desc">Payments</span>
      </div>
      <div class="mcp-card">
        <span class="mcp-icon">🐙</span>
        <span class="mcp-name">github</span>
        <span class="mcp-desc">Version control</span>
      </div>
      <div class="mcp-card">
        <span class="mcp-icon">🤖</span>
        <span class="mcp-name">anthropic</span>
        <span class="mcp-desc">AI integration</span>
      </div>
      <div class="mcp-card">
        <span class="mcp-icon">🔍</span>
        <span class="mcp-name">algolia</span>
        <span class="mcp-desc">Search</span>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="cta-section">
    <div class="cta-glow"></div>
    <h2>Ready to become a vibe coding wizard?</h2>
    <p>Install the MCP and start building with just your words.</p>
    <button class="cta-btn" onclick={copyConfig}>
      {#if copied}
        <Icon name="check" size={20} />
        <span>Copied!</span>
      {:else}
        <Icon name="copy" size={20} />
        <span>Copy MCP Config</span>
      {/if}
    </button>
    <p class="cta-hint">Add to claude_desktop_config.json → Restart Claude → Start vibing</p>
  </section>

  <!-- Advanced section for web builder -->
  <section class="advanced">
    <h3>Want more control?</h3>
    <p>Use the web builder to customize agents, MCPs, and behaviors.</p>
    <button class="btn btn-secondary" onclick={() => goto('/builder')}>
      Open Builder
      <Icon name="arrow-right" size={16} />
    </button>
  </section>

  <footer class="footer">
    <p class="footer-tagline">"You vibe. It ships."</p>
    <div class="footer-links">
      <a href="https://github.com/vibeforge1111/vibeship-orchestrator" target="_blank" rel="noopener">GitHub</a>
      <a href="/builder">Builder</a>
    </div>
  </footer>
</main>

<style>
  .landing {
    min-height: 100vh;
    padding-top: 60px;
    overflow-x: hidden;
  }

  /* Hero Section */
  .hero {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-12) var(--space-8);
    text-align: center;
    min-height: 90vh;
    overflow: hidden;
  }

  .hero-glow {
    position: absolute;
    top: 20%;
    left: 50%;
    transform: translateX(-50%);
    width: 600px;
    height: 600px;
    background: radial-gradient(circle, rgba(0, 196, 154, 0.15) 0%, transparent 70%);
    pointer-events: none;
    animation: pulse 4s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.5; transform: translateX(-50%) scale(1); }
    50% { opacity: 0.8; transform: translateX(-50%) scale(1.1); }
  }

  .hero-content {
    position: relative;
    z-index: 1;
    max-width: 700px;
    width: 100%;
    margin-bottom: var(--space-8);
  }

  .hero-badge {
    display: inline-block;
    padding: var(--space-1) var(--space-3);
    background: rgba(0, 196, 154, 0.1);
    border: 1px solid var(--green-dim);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 600;
    letter-spacing: 0.15em;
    color: var(--green-dim);
    margin-bottom: var(--space-4);
  }

  .hero-title {
    font-family: var(--font-serif);
    font-size: var(--text-5xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0 0 var(--space-3);
    letter-spacing: -0.02em;
  }

  .hero-tagline {
    font-family: var(--font-serif);
    font-size: var(--text-2xl);
    font-style: italic;
    color: var(--green-dim);
    margin: 0 0 var(--space-4);
  }

  .hero-subtitle {
    font-size: var(--text-lg);
    color: var(--text-secondary);
    margin: 0;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }

  /* Terminal */
  .terminal-container {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 600px;
  }

  .terminal {
    background: #0d1117;
    border: 1px solid #30363d;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 196, 154, 0.1);
  }

  .terminal-header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background: #161b22;
    border-bottom: 1px solid #30363d;
  }

  .terminal-dots {
    display: flex;
    gap: 6px;
  }

  .dot {
    width: 12px;
    height: 12px;
    border-radius: 50%;
  }

  .dot.red { background: #ff5f56; }
  .dot.yellow { background: #ffbd2e; }
  .dot.green { background: #27ca40; }

  .terminal-title {
    flex: 1;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: #8b949e;
    text-align: center;
  }

  .replay-btn {
    background: transparent;
    border: 1px solid #30363d;
    color: #8b949e;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .replay-btn:hover {
    border-color: var(--green-dim);
    color: var(--green-dim);
  }

  .terminal-body {
    padding: var(--space-4);
    min-height: 300px;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    line-height: 1.6;
  }

  .terminal-line {
    white-space: pre;
  }

  .terminal-line.prompt { color: #8b949e; }
  .terminal-line.user { color: var(--green-dim); }
  .terminal-line.system { color: #8b949e; }
  .terminal-line.success { color: #3fb950; }
  .terminal-line.files { color: #58a6ff; }
  .terminal-line.magic { color: #f0883e; font-weight: 600; }
  .terminal-line.blank { height: 1.6em; }

  .prompt-symbol { color: var(--green-dim); margin-right: 8px; }

  .cursor {
    color: var(--green-dim);
    opacity: 0;
  }
  .cursor.visible { opacity: 1; }

  .play-btn {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-6);
    background: rgba(0, 196, 154, 0.1);
    border: 2px solid var(--green-dim);
    border-radius: 50%;
    color: var(--green-dim);
    cursor: pointer;
    transition: all var(--transition-fast);
    width: 120px;
    height: 120px;
    justify-content: center;
  }

  .play-btn span {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .play-btn:hover {
    background: var(--green-dim);
    color: #0d1117;
    box-shadow: 0 0 30px rgba(0, 196, 154, 0.4);
  }

  /* Magic Section */
  .magic-section {
    padding: var(--space-16) var(--space-8);
    max-width: 900px;
    margin: 0 auto;
  }

  .section-title {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    font-family: var(--font-serif);
    font-size: var(--text-2xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0 0 var(--space-2);
  }

  .title-icon {
    font-size: var(--text-xl);
  }

  .section-desc {
    text-align: center;
    font-size: var(--text-base);
    color: var(--text-secondary);
    margin: 0 0 var(--space-10);
  }

  .magic-steps {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
  }

  .magic-step {
    display: flex;
    gap: var(--space-6);
    align-items: flex-start;
  }

  .step-number {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--green-dim);
    color: var(--bg-primary);
    font-family: var(--font-mono);
    font-size: var(--text-xl);
    font-weight: 700;
    border-radius: 50%;
  }

  .step-content {
    flex: 1;
  }

  .step-content h3 {
    font-family: var(--font-mono);
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--space-2);
  }

  .step-content > p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0 0 var(--space-3);
  }

  .step-hint {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    margin-top: var(--space-2);
  }

  .code-block {
    position: relative;
    background: #0d1117;
    border: 1px solid #30363d;
    border-radius: 6px;
    padding: var(--space-4);
    margin-bottom: var(--space-2);
  }

  .code-block pre {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: #c9d1d9;
    overflow-x: auto;
  }

  .code-block .copy-btn {
    position: absolute;
    top: var(--space-2);
    right: var(--space-2);
    background: transparent;
    border: 1px solid #30363d;
    color: #8b949e;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .code-block .copy-btn:hover {
    border-color: var(--green-dim);
    color: var(--green-dim);
  }

  .prompt-examples {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .prompt-example {
    padding: var(--space-3) var(--space-4);
    background: var(--bg-secondary);
    border-left: 3px solid var(--green-dim);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--green-dim);
    font-style: italic;
  }

  .magic-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .magic-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-3);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
  }

  .magic-icon {
    font-size: var(--text-lg);
  }

  .magic-item span:last-child {
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }

  /* Crew Section */
  .crew-section {
    padding: var(--space-16) var(--space-8);
    background: var(--bg-secondary);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }

  .crew-visual {
    position: relative;
    height: 300px;
    max-width: 400px;
    margin: 0 auto var(--space-10);
  }

  .crew-center {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
  }

  .orchestrator-node {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-4);
    background: var(--green-dim);
    border-radius: 50%;
    width: 80px;
    height: 80px;
    justify-content: center;
    box-shadow: 0 0 40px rgba(0, 196, 154, 0.4);
  }

  .orchestrator-node .node-icon {
    font-size: var(--text-xl);
  }

  .orchestrator-node .node-label {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--bg-primary);
  }

  .crew-orbit {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    animation: rotate 30s linear infinite;
  }

  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .agent-node {
    position: absolute;
    top: 50%;
    left: 50%;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding: var(--space-2);
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 8px;
    transform-origin: center;
    animation: counter-rotate 30s linear infinite;
  }

  @keyframes counter-rotate {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(-360deg); }
  }

  .agent-node:nth-child(1) { transform: translate(-50%, -50%) translateY(-120px); }
  .agent-node:nth-child(2) { transform: translate(-50%, -50%) translateY(-120px) rotate(60deg) translateY(120px) rotate(-60deg) translateY(-120px); }
  .agent-node:nth-child(3) { transform: translate(-50%, -50%) rotate(60deg) translateY(-120px); }
  .agent-node:nth-child(4) { transform: translate(-50%, -50%) rotate(120deg) translateY(-120px); }
  .agent-node:nth-child(5) { transform: translate(-50%, -50%) rotate(180deg) translateY(-120px); }
  .agent-node:nth-child(6) { transform: translate(-50%, -50%) rotate(240deg) translateY(-120px); }

  .agent-node .node-icon {
    font-size: var(--text-lg);
  }

  .agent-node .node-label {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-tertiary);
  }

  .templates-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: var(--space-4);
    max-width: 1200px;
    margin: 0 auto;
  }

  /* MCP Section */
  .mcp-section {
    padding: var(--space-16) var(--space-8);
    max-width: 900px;
    margin: 0 auto;
  }

  .mcp-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: var(--space-4);
  }

  .mcp-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-5);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    transition: all var(--transition-fast);
  }

  .mcp-card:hover {
    border-color: var(--green-dim);
    transform: translateY(-2px);
  }

  .mcp-icon {
    font-size: var(--text-2xl);
  }

  .mcp-name {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
  }

  .mcp-desc {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
  }

  /* CTA Section */
  .cta-section {
    position: relative;
    padding: var(--space-16) var(--space-8);
    text-align: center;
    background: var(--bg-secondary);
    border-top: 1px solid var(--border);
    overflow: hidden;
  }

  .cta-glow {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 500px;
    height: 500px;
    background: radial-gradient(circle, rgba(0, 196, 154, 0.1) 0%, transparent 70%);
    pointer-events: none;
  }

  .cta-section h2 {
    position: relative;
    font-family: var(--font-serif);
    font-size: var(--text-2xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0 0 var(--space-2);
  }

  .cta-section > p {
    position: relative;
    font-size: var(--text-base);
    color: var(--text-secondary);
    margin: 0 0 var(--space-6);
  }

  .cta-btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-4) var(--space-8);
    background: var(--green-dim);
    border: none;
    color: var(--bg-primary);
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .cta-btn:hover {
    box-shadow: 0 0 30px rgba(0, 196, 154, 0.4);
    transform: translateY(-2px);
  }

  .cta-hint {
    position: relative;
    font-size: var(--text-sm);
    color: var(--text-tertiary);
    margin-top: var(--space-4);
  }

  /* Advanced section */
  .advanced {
    text-align: center;
    padding: var(--space-12) var(--space-8);
    border-top: 1px solid var(--border);
  }

  .advanced h3 {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-secondary);
    margin: 0 0 var(--space-2);
  }

  .advanced p {
    font-size: var(--text-sm);
    color: var(--text-tertiary);
    margin: 0 0 var(--space-4);
  }

  .btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-5);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
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

  .footer-tagline {
    font-family: var(--font-serif);
    font-size: var(--text-lg);
    font-style: italic;
    color: var(--text-secondary);
    margin: 0 0 var(--space-4);
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
    .hero-title {
      font-size: var(--text-3xl);
    }

    .hero-tagline {
      font-size: var(--text-xl);
    }

    .magic-step {
      flex-direction: column;
      align-items: center;
      text-align: center;
    }

    .step-content {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .prompt-examples,
    .magic-list,
    .code-block {
      width: 100%;
    }

    .crew-visual {
      height: 250px;
    }

    .agent-node:nth-child(1) { transform: translate(-50%, -50%) translateY(-100px); }
    .agent-node:nth-child(3) { transform: translate(-50%, -50%) rotate(60deg) translateY(-100px); }
    .agent-node:nth-child(4) { transform: translate(-50%, -50%) rotate(120deg) translateY(-100px); }
    .agent-node:nth-child(5) { transform: translate(-50%, -50%) rotate(180deg) translateY(-100px); }
    .agent-node:nth-child(6) { transform: translate(-50%, -50%) rotate(240deg) translateY(-100px); }
  }
</style>
