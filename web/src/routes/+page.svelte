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
  let currentExample = $state(0);

  const examples = [
    // Web3 NFT Marketplace
    {
      prompt: '"Build me a web3 NFT marketplace with Solana integration"',
      template: 'Web3 Marketplace',
      agents: 'architect, smart-contracts, frontend, backend, security',
      mcps: 'filesystem, solana, ipfs, supabase',
      agentCount: 5,
      mcpCount: 4,
      projectName: 'nft-marketplace',
      skills: ['architect.md', 'smart-contracts.md', 'security-auditor.md'],
      extraFolder: 'contracts/'
    },
    // AI Research Assistant
    {
      prompt: '"Create an AI research assistant with RAG and memory"',
      template: 'AI Application',
      agents: 'architect, ml-engineer, backend, data-pipeline, eval',
      mcps: 'filesystem, anthropic, pinecone, postgres',
      agentCount: 5,
      mcpCount: 4,
      projectName: 'research-assistant',
      skills: ['ml-engineer.md', 'data-pipeline.md', 'eval-specialist.md'],
      extraFolder: 'embeddings/'
    },
    // Developer Tools Platform
    {
      prompt: '"Build an AI-powered IDE that writes tests as you code"',
      template: 'Dev Tools',
      agents: 'architect, compiler-dev, lsp-engineer, ml-engineer, ux',
      mcps: 'filesystem, github, treesitter, anthropic, vscode',
      agentCount: 5,
      mcpCount: 5,
      projectName: 'ai-ide',
      skills: ['compiler-dev.md', 'lsp-engineer.md', 'ml-integration.md'],
      extraFolder: 'extensions/'
    },
    // Healthcare SaaS
    {
      prompt: '"Create a HIPAA-compliant telemedicine platform"',
      template: 'Healthcare SaaS',
      agents: 'architect, compliance, frontend, backend, security',
      mcps: 'filesystem, twilio, stripe, supabase, aws-health',
      agentCount: 5,
      mcpCount: 5,
      projectName: 'telehealth-app',
      skills: ['compliance.md', 'hipaa-security.md', 'video-integration.md'],
      extraFolder: 'compliance/'
    },
    // Game Development
    {
      prompt: '"Build a multiplayer roguelike with procedural dungeons"',
      template: 'Game Dev',
      agents: 'game-designer, engine-dev, netcode, procedural-gen, audio',
      mcps: 'filesystem, unity, photon, steamworks',
      agentCount: 5,
      mcpCount: 4,
      projectName: 'dungeon-crawler',
      skills: ['game-designer.md', 'procedural-gen.md', 'netcode.md'],
      extraFolder: 'assets/'
    }
  ];

  function getTerminalLines(example: typeof examples[0]) {
    return [
      { type: 'prompt', text: '> ' },
      { type: 'user', text: example.prompt, delay: 50 },
      { type: 'blank', delay: 800 },
      { type: 'system', text: '+ vibeship connected', delay: 100 },
      { type: 'system', text: '> Analyzing project scope...', delay: 400 },
      { type: 'success', text: `+ Template: ${example.template}`, delay: 200 },
      { type: 'system', text: `+ Agents: ${example.agents}`, delay: 200 },
      { type: 'system', text: `+ MCPs: ${example.mcps}`, delay: 200 },
      { type: 'blank', delay: 300 },
      { type: 'system', text: '> Spawning your agents...', delay: 500 },
      { type: 'success', text: `+ ${example.agentCount} specialized agents activated`, delay: 200 },
      { type: 'success', text: `+ ${example.mcpCount} MCPs connected`, delay: 200 },
      { type: 'blank', delay: 300 },
      { type: 'system', text: `> Scaffolding ${example.projectName}...`, delay: 400 },
      { type: 'files', text: `  ${example.projectName}/`, delay: 100 },
      { type: 'files', text: '  ├── CLAUDE.md', delay: 60 },
      { type: 'files', text: '  ├── skills/', delay: 60 },
      { type: 'files', text: `  │   ├── ${example.skills[0]}`, delay: 40 },
      { type: 'files', text: `  │   ├── ${example.skills[1]}`, delay: 40 },
      { type: 'files', text: `  │   └── ${example.skills[2]}`, delay: 40 },
      { type: 'files', text: `  └── ${example.extraFolder}`, delay: 60 },
      { type: 'blank', delay: 400 },
      { type: 'magic', text: '✨ Your agents are ready. Start vibing.', delay: 100 },
    ];
  }

  let visibleLines = $state<ReturnType<typeof getTerminalLines>>([]);

  function startAnimation() {
    visibleLines = [];
    isAnimating = true;
    animationComplete = false;

    const terminalLines = getTerminalLines(examples[currentExample]);
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
        // Auto-rotate to next example after 15 seconds
        setTimeout(() => {
          currentExample = (currentExample + 1) % examples.length;
          startAnimation();
        }, 15000);
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
    "vibeship-spawner": {
      "command": "npx",
      "args": ["vibeship-spawner"]
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
      <div class="hero-badges">
        <span class="hero-badge">MCP-FIRST DEVELOPMENT</span>
        <span class="hero-badge claude-badge">SKILL-BASED AGENTS</span>
      </div>
      <p class="hero-tagline">The MCP that spawns your <span class="claude-highlight">Claude Agents.</span></p>
      <p class="hero-subtitle">The singularity of focused, trained Claude Opus agents and MCPs, instead of the generic approach. One command to spawn your entire agent stack and tools to work for you.</p>
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
          <button class="replay-btn" class:visible={animationComplete} onclick={startAnimation} title="Replay animation">
            <Icon name="rotate-ccw" size={14} />
          </button>
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

  <!-- Divider -->
  <div class="section-divider"></div>

  <!-- The Magic: How it works -->
  <section class="magic-section">
    <h2 class="section-title">The Magic</h2>
    <p class="section-desc">Three terminal commands to vibe coding superpowers</p>

    <div class="magic-steps">
      <div class="terminal-step">
        <div class="terminal-step-header">
          <span class="step-label">01</span>
          <span class="step-title">Install the MCP</span>
        </div>
        <div class="terminal-step-body">
          <div class="terminal-line-output">
            <span class="terminal-prompt">$</span>
            <span class="terminal-cmd">Add to claude_desktop_config.json:</span>
          </div>
          <div class="terminal-code-block">
            <pre><code>{`"vibeship-spawner": {
  "command": "npx",
  "args": ["vibeship-spawner"]
}`}</code></pre>
          </div>
          <div class="terminal-line-output dim">
            <span class="terminal-prompt">#</span>
            <span>Restart Claude Desktop after adding</span>
          </div>
        </div>
      </div>

      <div class="terminal-step">
        <div class="terminal-step-header">
          <span class="step-label">02</span>
          <span class="step-title">Describe Your Vision</span>
        </div>
        <div class="terminal-step-body">
          <div class="terminal-line-output">
            <span class="terminal-prompt">$</span>
            <span class="terminal-cmd">Tell Claude what you want to build:</span>
          </div>
          <div class="terminal-prompts">
            <div class="terminal-prompt-line">
              <span class="prompt-arrow">›</span>
              <span>"Build me a marketplace for vintage watches"</span>
            </div>
            <div class="terminal-prompt-line">
              <span class="prompt-arrow">›</span>
              <span>"Create an AI-powered note-taking app"</span>
            </div>
            <div class="terminal-prompt-line">
              <span class="prompt-arrow">›</span>
              <span>"Start a web3 NFT gallery project"</span>
            </div>
          </div>
        </div>
      </div>

      <div class="terminal-step">
        <div class="terminal-step-header">
          <span class="step-label">03</span>
          <span class="step-title">Watch the Magic</span>
        </div>
        <div class="terminal-step-body">
          <div class="terminal-line-output">
            <span class="terminal-prompt">$</span>
            <span class="terminal-cmd">vibeship spawner creates:</span>
          </div>
          <div class="terminal-output-list">
            <div class="terminal-output-line success">
              <span class="output-prefix">+</span>
              <span>Spawns your specialized agents with Claude Skills tailored for your idea</span>
            </div>
            <div class="terminal-output-line success">
              <span class="output-prefix">+</span>
              <span>Connects the right tools and their MCPs to right agents, and your project</span>
            </div>
            <div class="terminal-output-line success">
              <span class="output-prefix">+</span>
              <span>Builds your Architecture, PRD, and Implementation Plan in an organized way</span>
            </div>
            <div class="terminal-output-line success">
              <span class="output-prefix">+</span>
              <span>Starts building immediately, with specialized Opus agents, instead of a generalistic one</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Divider -->
  <div class="section-divider"></div>

  <!-- Closing Statement -->
  <section class="closing-section">
    <p class="closing-text">
      Vibing solo? Try shipping with agents.
    </p>
    <div class="closing-formula">
      <span class="formula-text">your_idea</span>
      <span class="formula-op">×</span>
      <span class="formula-text highlight">(skilled_agents + mcp_powers + vibeship_spawner)</span>
      <span class="formula-op">=</span>
      <span class="formula-result">shipped<span class="claude-highlight">_on_nitro</span></span>
    </div>
    <a href="/how-it-works" class="cta-button">See How It Works</a>
  </section>

  <footer class="footer">
    <div class="footer-links">
      <a href="https://github.com/vibeforge1111/vibeship-orchestrator" target="_blank" rel="noopener">GitHub</a>
      <a href="/how-it-works">How It Works</a>
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
    padding: var(--space-16) var(--space-8);
    padding-top: 120px;
    text-align: center;
    min-height: auto;
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

  .hero-badges {
    display: flex;
    gap: var(--space-3);
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: var(--space-4);
  }

  .hero-badge {
    display: inline-block;
    padding: var(--space-1) var(--space-3);
    background: rgba(0, 196, 154, 0.1);
    border: 1px solid var(--green-dim);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 600;
    letter-spacing: 0.1em;
    color: var(--green-dim);
  }

  .hero-badge.claude-badge {
    background: rgba(217, 119, 87, 0.1);
    border-color: #D97757;
    color: #D97757;
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
    font-size: var(--text-3xl);
    font-style: italic;
    color: var(--text-primary);
    margin: 0 0 var(--space-4);
  }

  .claude-highlight {
    color: #D97757;
  }

  .hero-subtitle {
    font-size: 12px;
    color: var(--text-secondary);
    margin: 0;
    max-width: 550px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.6;
  }

  /* Terminal */
  .terminal-container {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 600px;
    height: 464px;
    overflow: hidden;
  }

  .terminal {
    background: #0d1117;
    border: 1px solid #30363d;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(0, 196, 154, 0.1);
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .terminal-header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background: #161b22;
    border-bottom: 1px solid #30363d;
    flex-shrink: 0;
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
    border: 1px solid transparent;
    color: transparent;
    padding: 4px 8px;
    border-radius: 4px;
    cursor: pointer;
    transition: all var(--transition-fast);
    pointer-events: none;
  }

  .replay-btn.visible {
    border-color: #30363d;
    color: #8b949e;
    pointer-events: auto;
  }

  .replay-btn.visible:hover {
    border-color: var(--green-dim);
    color: var(--green-dim);
  }

  .terminal-body {
    padding: var(--space-4);
    flex: 1;
    overflow-y: auto;
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
  .terminal-line.success { color: var(--green-dim); }
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

  /* Section Divider */
  .section-divider {
    width: 100%;
    max-width: 900px;
    height: 1px;
    background: var(--border);
    margin: var(--space-8) auto 0;
  }

  /* Magic Section */
  .magic-section {
    padding: var(--space-12) var(--space-8);
    max-width: 900px;
    margin: 0 auto;
  }

  .section-title {
    font-family: var(--font-serif);
    font-size: var(--text-3xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0 0 var(--space-2);
    text-align: center;
  }

  .section-desc {
    text-align: center;
    font-size: var(--text-base);
    color: var(--text-secondary);
    margin: 0 0 var(--space-8);
  }

  .magic-steps {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  /* Terminal Step Cards */
  .terminal-step {
    background: #0d1117;
    border: 1px solid #30363d;
    border-radius: 8px;
    overflow: hidden;
  }

  .terminal-step-header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background: #161b22;
    border-bottom: 1px solid #30363d;
  }

  .step-label {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 700;
    color: var(--green-dim);
    background: rgba(0, 196, 154, 0.15);
    padding: 2px 8px;
    border-radius: 4px;
  }

  .step-title {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: #e2e4e9;
  }

  .terminal-step-body {
    padding: var(--space-4);
  }

  .terminal-line-output {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: #8b949e;
    margin-bottom: var(--space-3);
  }

  .terminal-line-output.dim {
    color: #6b7489;
    margin-top: var(--space-3);
    margin-bottom: 0;
  }

  .terminal-prompt {
    color: var(--green-dim);
    font-weight: 600;
  }

  .terminal-cmd {
    color: #c9d1d9;
  }

  .terminal-code-block {
    position: relative;
    background: #0a0c10;
    border: 1px solid #21262d;
    border-radius: 6px;
    padding: var(--space-4);
  }

  .terminal-code-block pre {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: #c9d1d9;
    overflow-x: auto;
  }

  .terminal-code-block .copy-btn {
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

  .terminal-code-block .copy-btn:hover {
    border-color: var(--green-dim);
    color: var(--green-dim);
  }

  .terminal-prompts {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .terminal-prompt-line {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--green-dim);
    padding: var(--space-2) var(--space-3);
    background: rgba(0, 196, 154, 0.05);
    border-left: 2px solid var(--green-dim);
  }

  .prompt-arrow {
    color: var(--green-dim);
    font-weight: 600;
  }

  .terminal-output-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .terminal-output-line {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    padding: var(--space-1) 0;
  }

  .terminal-output-line.success {
    color: #c9d1d9;
  }

  .output-prefix {
    font-weight: 700;
    color: var(--green-dim);
  }

  /* Agents Section */
  .agents-section {
    padding: var(--space-16) var(--space-8);
    background: var(--bg-secondary);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }

  .spawn-visual {
    max-width: 600px;
    margin: 0 auto var(--space-8);
  }

  .agent-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: var(--space-3);
  }

  .agent-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-4) var(--space-2);
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 8px;
    transition: all var(--transition-fast);
  }

  .agent-card:hover {
    border-color: var(--green-dim);
    transform: translateY(-2px);
  }

  .agent-icon {
    font-size: var(--text-2xl);
  }

  .agent-name {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--text-secondary);
    text-align: center;
  }

  .templates-title {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-tertiary);
    text-align: center;
    margin: 0 0 var(--space-6);
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

  /* Closing Section */
  .closing-section {
    padding: var(--space-12) var(--space-8);
    text-align: center;
  }

  .closing-text {
    font-family: var(--font-serif);
    font-size: var(--text-2xl);
    font-style: italic;
    color: var(--text-secondary);
    margin: 0 0 var(--space-3);
  }

  .closing-text .highlight {
    color: var(--green-dim);
    font-style: normal;
    font-weight: 500;
  }

  .closing-formula {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    flex-wrap: wrap;
    font-family: var(--font-mono);
    font-size: var(--text-base);
    color: var(--text-tertiary);
  }

  .formula-text {
    color: var(--text-secondary);
  }

  .formula-text.highlight {
    color: var(--green-dim);
  }

  .formula-op {
    color: var(--text-tertiary);
  }

  .formula-result {
    color: var(--text-primary);
    font-weight: 600;
  }

  .cta-button {
    display: inline-block;
    margin-top: var(--space-8);
    padding: var(--space-4) var(--space-8);
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-secondary);
    font-family: var(--font-mono);
    font-size: var(--text-base);
    text-decoration: none;
    transition: all var(--transition-fast);
  }

  .cta-button:hover {
    border-color: var(--green-dim);
    color: var(--green-dim);
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
    .hero {
      min-height: auto;
      padding: var(--space-8) var(--space-4);
    }

    .hero-title {
      font-size: var(--text-3xl);
    }

    .hero-tagline {
      font-size: var(--text-xl);
    }

    .terminal-container {
      max-width: 100%;
    }

    .terminal-body {
      min-height: 250px;
      font-size: var(--text-xs);
    }

    .magic-section {
      padding: var(--space-8) var(--space-4);
    }

    .terminal-step-body {
      padding: var(--space-3);
    }

    .terminal-line-output {
      font-size: var(--text-xs);
    }

    .terminal-code-block pre {
      font-size: var(--text-xs);
    }

    .terminal-prompt-line {
      font-size: var(--text-xs);
    }

    .terminal-output-line {
      font-size: var(--text-xs);
    }

    .mcp-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .templates-grid {
      grid-template-columns: 1fr;
    }

    .closing-section {
      padding: var(--space-8) var(--space-4);
    }

    .closing-text {
      font-size: var(--text-xl);
    }

    .closing-formula {
      font-size: var(--text-xs);
    }
  }
</style>
