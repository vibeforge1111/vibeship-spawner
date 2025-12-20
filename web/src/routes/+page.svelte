<script lang="ts">
  import { onMount } from 'svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import GuidePromo from '$lib/components/GuidePromo.svelte';
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

  const copyTexts: Record<string, string> = {
    config: `{
  "mcpServers": {
    "spawner": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.vibeship.co/sse"]
    },
    "mind": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-mind"]
    }
  }
}`,
    'new-project': 'I want to build [your idea]. Use spawner_plan to help me get started.',
    'existing-project': 'Analyze this codebase with spawner_analyze and load the right skills.',
    'gotchas': 'Use spawner_watch_out to check for sharp edges before I implement auth.',
    'unstick': "I'm going in circles. Use spawner_unstick to help me find another approach."
  };

  let copiedItem = $state<string | null>(null);

  function copyToClipboard(key: string) {
    navigator.clipboard.writeText(copyTexts[key]);
    copiedItem = key;
    setTimeout(() => copiedItem = null, 2000);
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
      <h1 class="hero-tagline">Give <span class="highlight">Claude, Skills<span class="claude-underline"></span></span> it's missing.</h1>
      <p class="hero-subtitle">Automatically spawn the right skills for your project. Overclock your outputs at every level vs the generalized approach. Claude says skills make the difference. Spawner + <a href="https://mind.vibeship.co" target="_blank" rel="noopener" class="mind-link">Mind<span class="mind-bubble"><Icon name="brain" size={14} /></span></a> automate these skills into a seamless workflow.</p>
      <a href="https://claude.com/blog/skills" target="_blank" rel="noopener" class="hero-cta">
        <span>What Claude says about Skills</span>
        <Icon name="external-link" size={14} />
      </a>
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
    </div>
  </section>

  <!-- Divider -->
  <div class="section-divider"></div>

  <!-- Instant Benefits -->
  <section class="benefits-section">
    <h2 class="section-title">One Install. Instant Superpowers.</h2>
    <p class="section-desc">Tell Claude your idea. Spawner handles the rest.</p>

    <div class="benefits-grid">
      <div class="benefit-card">
        <div class="benefit-icon"><Icon name="users" size={24} /></div>
        <h3 class="benefit-title">Right Agents</h3>
        <p class="benefit-desc">Picks the specialist agents your project needs—auth, database, UI, payments.</p>
      </div>

      <div class="benefit-card">
        <div class="benefit-icon"><Icon name="link" size={24} /></div>
        <h3 class="benefit-title">Connected Tools</h3>
        <p class="benefit-desc">Wires up each agent with the tools and context it needs to work.</p>
      </div>

      <div class="benefit-card">
        <div class="benefit-icon"><Icon name="git-branch" size={24} /></div>
        <h3 class="benefit-title">Architecture Ready</h3>
        <p class="benefit-desc">Creates your project plan and architecture before writing a line of code.</p>
      </div>

      <div class="benefit-card">
        <div class="benefit-icon"><Icon name="zap" size={24} /></div>
        <h3 class="benefit-title">Focused Expertise</h3>
        <p class="benefit-desc">Starts building with deep knowledge of your exact stack and patterns.</p>
      </div>
    </div>

    <div class="benefits-note">
      <Icon name="folder" size={16} />
      <span>Already have a project?</span>
      <span>Spawner analyzes your codebase and spawns the right skills to turbocharge your flow.</span>
    </div>
  </section>

  <!-- Divider -->
  <div class="section-divider"></div>

  <!-- Two Paths Section -->
  <section class="paths-section">
    <h2 class="paths-headline">Works Both Ways</h2>
    <p class="paths-subtitle">New idea or existing code—same superpowers</p>

    <div class="paths-grid">
      <!-- New Project Path -->
      <div class="path-card">
        <div class="path-header">
          <span class="path-icon"><Icon name="file-plus" size={20} /></span>
          <h3 class="path-title">New Project</h3>
        </div>

        <div class="path-example">
          <div class="example-input">"Build me an invoice tracking SaaS"</div>
          <div class="example-arrow"><Icon name="arrow-right" size={16} /></div>
          <div class="example-output">
            <span class="output-tag">Next.js</span>
            <span class="output-tag">Supabase</span>
            <span class="output-tag">Stripe</span>
          </div>
        </div>

        <div class="path-result">
          <Icon name="check" size={14} />
          <span>Stack chosen, skills loaded, building starts</span>
        </div>
      </div>

      <!-- Existing Project Path -->
      <div class="path-card">
        <div class="path-header">
          <span class="path-icon"><Icon name="folder" size={20} /></span>
          <h3 class="path-title">Existing Project</h3>
        </div>

        <div class="path-example">
          <div class="example-input">Point Claude at your codebase</div>
          <div class="example-arrow"><Icon name="arrow-right" size={16} /></div>
          <div class="example-output">
            <span class="output-tag">Stack detected</span>
            <span class="output-tag">Skills spawned</span>
          </div>
        </div>

        <div class="path-result">
          <Icon name="check" size={14} />
          <span>Zero ramp-up, instant expertise</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Divider -->
  <div class="section-divider"></div>

  <!-- Skills vs General Claude Section -->
  <section class="comparison-section">
    <h2 class="section-headline">Why Skills Matter</h2>
    <p class="section-subtitle">What Anthropic says about Claude Skills</p>

    <div class="anthropic-quote-banner">
      <blockquote>"Think of Skills as custom onboarding materials that let you package expertise, making Claude a specialist on what matters most to you."</blockquote>
      <cite>— <a href="https://claude.com/blog/skills" target="_blank" rel="noopener">Anthropic, Introducing Agent Skills</a></cite>
    </div>

    <div class="comparison-grid">
      <div class="comparison-card general">
        <h3 class="comparison-title">Without Skills</h3>
        <ul class="comparison-list">
          <li><Icon name="x" size={14} /> Broad knowledge, no stack-specific gotchas</li>
          <li><Icon name="x" size={14} /> Generic patterns that may be outdated</li>
          <li><Icon name="x" size={14} /> Can't validate code before you ship</li>
          <li><Icon name="x" size={14} /> Forgets your project next session</li>
        </ul>
      </div>

      <div class="comparison-card skilled">
        <h3 class="comparison-title">With Skills</h3>
        <ul class="comparison-list">
          <li><Icon name="check" size={14} /> Battle-tested patterns for your exact stack</li>
          <li><Icon name="check" size={14} /> Version-specific knowledge (Next.js 14, not 12)</li>
          <li><Icon name="check" size={14} /> Runs actual checks before code ships</li>
          <li><Icon name="check" size={14} /> Remembers your project context</li>
        </ul>
      </div>
    </div>

    <div class="skills-features">
      <div class="skill-feature">
        <span class="feature-label">Composable</span>
        <span class="feature-desc">Skills stack together. Claude identifies what's needed and coordinates their use.</span>
      </div>
      <div class="skill-feature">
        <span class="feature-label">Efficient</span>
        <span class="feature-desc">Only loads what's needed, when it's needed.</span>
      </div>
      <div class="skill-feature">
        <span class="feature-label">Powerful</span>
        <span class="feature-desc">Skills include executable code for tasks where traditional programming is more reliable.</span>
      </div>
    </div>
  </section>

  <!-- Divider -->
  <div class="section-divider"></div>

  <!-- Skills System Section -->
  <section class="skills-deep-section">
    <h2 class="section-headline">The Claude Skills System</h2>
    <p class="section-subtitle">Structured knowledge, not prompt hacks</p>

    <div class="skills-anatomy">
      <div class="skill-card-example">
        <div class="skill-header-example">
          <span class="skill-icon-example">📦</span>
          <div>
            <span class="skill-name-example">supabase-backend</span>
            <span class="skill-type-example">Core Skill</span>
          </div>
        </div>
        <div class="skill-body-example">
          <div class="skill-section-example">
            <span class="section-label">Owns</span>
            <span class="section-value">Database setup, RLS policies, auth hooks, realtime</span>
          </div>
          <div class="skill-section-example">
            <span class="section-label">Sharp Edges</span>
            <span class="section-value">12 gotchas like "RLS auth.uid() timing race condition"</span>
          </div>
          <div class="skill-section-example">
            <span class="section-label">Patterns</span>
            <span class="section-value">Server client vs browser client, service role usage</span>
          </div>
          <div class="skill-section-example">
            <span class="section-label">Anti-patterns</span>
            <span class="section-value">Exposing service key, skipping RLS, sync operations</span>
          </div>
          <div class="skill-section-example">
            <span class="section-label">Validations</span>
            <span class="section-value">Check for hardcoded keys, missing RLS, exposed routes</span>
          </div>
          <div class="skill-section-example">
            <span class="section-label">Hands off to</span>
            <span class="section-value">auth-flow for login UI, payments-flow for billing</span>
          </div>
        </div>
      </div>

      <div class="skills-list-example">
        <h3 class="skills-list-title">Available Skills</h3>
        <div class="skill-chips">
          <span class="skill-chip core">nextjs-app-router</span>
          <span class="skill-chip core">supabase-backend</span>
          <span class="skill-chip core">auth-flow</span>
          <span class="skill-chip core">payments-flow</span>
          <span class="skill-chip integration">tailwind-ui</span>
          <span class="skill-chip integration">ai-integration</span>
          <span class="skill-chip pattern">typescript-strict</span>
          <span class="skill-chip pattern">react-patterns</span>
          <span class="skill-chip pattern">api-design</span>
        </div>
        <p class="skills-note">Skills are curated, versioned, and battle-tested—not AI-generated slop</p>
      </div>
    </div>
  </section>

  <!-- Divider -->
  <div class="section-divider"></div>

  <!-- Spawner + Mind Duo Section -->
  <section class="duo-section">
    <h2 class="section-headline">Spawner + Mind = Full Stack Claude</h2>
    <p class="section-subtitle">Together they cover everything Claude needs</p>

    <div class="duo-grid">
      <div class="duo-card spawner-card">
        <div class="duo-header">
          <span class="duo-icon"><Icon name="zap" size={20} /></span>
          <h3 class="duo-title">Spawner</h3>
        </div>
        <p class="duo-role">The skill system and guardrails</p>
        <ul class="duo-provides">
          <li>Specialized skills for your stack</li>
          <li>Sharp edges and gotchas</li>
          <li>Code validation before shipping</li>
          <li>Escape hatch intelligence</li>
          <li>Project templates and scaffolding</li>
        </ul>
      </div>

      <div class="duo-plus">+</div>

      <div class="duo-card mind-card">
        <div class="duo-header">
          <span class="duo-icon"><Icon name="brain" size={20} /></span>
          <h3 class="duo-title">Mind</h3>
        </div>
        <p class="duo-role">The memory and context layer</p>
        <ul class="duo-provides">
          <li>Persistent memory across sessions</li>
          <li>Decision logging and recall</li>
          <li>Blocker tracking and resolution</li>
          <li>Session continuity</li>
          <li>Context-aware reminders</li>
        </ul>
      </div>
    </div>

    <div class="duo-result">
      <span class="result-equals">=</span>
      <div class="result-content">
        <h3 class="result-title">Claude that remembers, learns, and never makes the same mistake twice</h3>
        <p class="result-desc">Spawner gives Claude expertise. Mind gives Claude memory. Together, Claude becomes the senior dev who's seen it all and never forgets.</p>
      </div>
    </div>

    <div class="duo-install-hint">
      <span class="hint-icon">💡</span>
      <p>Both install as MCP servers—just add two config blocks to Claude Desktop</p>
    </div>
  </section>

  <!-- Divider -->
  <div class="section-divider"></div>

  <!-- What You Get Section (Refined) -->
  <section class="powers-section">
    <h2 class="powers-headline">What Claude Gets With Spawner</h2>
    <p class="powers-subtitle">The superpowers Claude doesn't have by default</p>

    <div class="powers-grid">
      <div class="power-card">
        <div class="power-demo">
          <div class="demo-bubble claude">
            <span class="demo-label">Claude</span>
            "Picking up invoice-app. Last session you fixed the Stripe webhook but invoice status wasn't updating. Want to continue?"
          </div>
        </div>
        <div class="power-info">
          <h3 class="power-title">Project Memory</h3>
          <p class="power-desc">Remembers your project across sessions. No more re-explaining.</p>
        </div>
      </div>

      <div class="power-card">
        <div class="power-demo">
          <div class="demo-bubble spawner">
            <span class="demo-label">Spawner</span>
            <span class="demo-alert"><Icon name="alert-triangle" size={14} /> Line 12: SUPABASE_KEY hardcoded</span>
            Moving to environment variable...
          </div>
        </div>
        <div class="power-info">
          <h3 class="power-title">Guardrails That Run</h3>
          <p class="power-desc">Actually catches issues. Not suggestions—real scans.</p>
        </div>
      </div>

      <div class="power-card">
        <div class="power-demo">
          <div class="demo-bubble spawner">
            <span class="demo-label">Spawner</span>
            <span class="demo-warning">Watch out:</span> New users see empty data after signup. RLS policies fail during token refresh window.
          </div>
        </div>
        <div class="power-info">
          <h3 class="power-title">Sharp Edges</h3>
          <p class="power-desc">Gotchas Claude doesn't know. Battle-scarred knowledge.</p>
        </div>
      </div>

      <div class="power-card">
        <div class="power-demo">
          <div class="demo-bubble spawner">
            <span class="demo-label">Spawner</span>
            We've tried 3 approaches and we're going in circles. <span class="demo-options">Options: 1) Move auth to layout 2) Client redirect 3) Switch to Clerk</span>
          </div>
        </div>
        <div class="power-info">
          <h3 class="power-title">Escape Hatches</h3>
          <p class="power-desc">Detects when you're stuck. Offers real alternatives.</p>
        </div>
      </div>
    </div>

    <a href="/how-it-works" class="cta-button">Get Started</a>
  </section>

  <!-- Divider -->
  <div class="section-divider"></div>

  <!-- Quick Start Section -->
  <section class="quickstart-section">
    <h2 class="section-headline">Looks Like Rocket Science?</h2>
    <p class="section-subtitle">It's actually just a few prompts. Here's the whole thing.</p>

    <div class="quickstart-terminal">
      <div class="terminal-header">
        <span class="terminal-dot"></span>
        <span class="terminal-dot"></span>
        <span class="terminal-dot"></span>
        <span class="terminal-title">Quick Start Guide</span>
      </div>
      <div class="terminal-body quickstart-body">
        <div class="qs-step">
          <span class="qs-step-label">Step 1: Add to Claude Desktop config</span>
          <div class="qs-code-block">
            <pre>{`{
  "mcpServers": {
    "spawner": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.vibeship.co/sse"]
    },
    "mind": {
      "command": "npx",
      "args": ["-y", "@anthropic/mcp-mind"]
    }
  }
}`}</pre>
            <button class="copy-btn" onclick={() => copyToClipboard('config')}>Copy</button>
          </div>
        </div>

        <div class="qs-step">
          <span class="qs-step-label">Step 2: Restart Claude Desktop</span>
          <p class="qs-instruction">Close and reopen Claude Desktop. Done.</p>
        </div>

        <div class="qs-step">
          <span class="qs-step-label">Step 3: Start building (copy-paste these)</span>

          <div class="qs-prompts">
            <div class="qs-prompt">
              <span class="prompt-label">New project:</span>
              <div class="qs-code-block small">
                <pre>"I want to build [your idea]. Use spawner_plan to help me get started."</pre>
                <button class="copy-btn small" onclick={() => copyToClipboard('new-project')}>Copy</button>
              </div>
            </div>

            <div class="qs-prompt">
              <span class="prompt-label">Existing project:</span>
              <div class="qs-code-block small">
                <pre>"Analyze this codebase with spawner_analyze and load the right skills."</pre>
                <button class="copy-btn small" onclick={() => copyToClipboard('existing-project')}>Copy</button>
              </div>
            </div>

            <div class="qs-prompt">
              <span class="prompt-label">Check for gotchas:</span>
              <div class="qs-code-block small">
                <pre>"Use spawner_watch_out to check for sharp edges before I implement auth."</pre>
                <button class="copy-btn small" onclick={() => copyToClipboard('gotchas')}>Copy</button>
              </div>
            </div>

            <div class="qs-prompt">
              <span class="prompt-label">When stuck:</span>
              <div class="qs-code-block small">
                <pre>"I'm going in circles. Use spawner_unstick to help me find another approach."</pre>
                <button class="copy-btn small" onclick={() => copyToClipboard('unstick')}>Copy</button>
              </div>
            </div>
          </div>
        </div>

        <div class="qs-result">
          <span class="qs-check">✓</span>
          <span class="qs-result-text">That's it. You now have a senior dev in Claude.</span>
        </div>
      </div>
    </div>
  </section>

  <GuidePromo />
  <Footer />
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
    padding: var(--space-8) var(--space-8);
    padding-top: 72px;
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
    font-size: 3.5rem;
    font-weight: 400;
    color: var(--text-primary);
    margin: 0 0 var(--space-4);
  }

  .highlight {
    color: var(--green-dim);
    position: relative;
    display: inline-block;
  }

  .text-accent {
    color: var(--green-dim);
  }

  .underline-only {
    position: relative;
    display: inline-block;
  }

  .claude-underline {
    position: absolute;
    bottom: calc(0.15em + 2px);
    left: -3%;
    width: 115%;
    height: 3px;
    background: linear-gradient(90deg, transparent 0%, #D97757 8%, #D97757 60%, transparent 100%);
    transform: rotate(-3deg) skewX(-15deg);
  }

  .hero-subtitle {
    font-size: var(--text-base);
    color: var(--text-secondary);
    margin: 0;
    max-width: 580px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.7;
  }

  .hero-cta {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    margin-top: var(--space-4);
    padding: var(--space-3) var(--space-5);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    border: 1px solid var(--border);
    text-decoration: none;
    transition: all var(--transition-fast);
  }

  .hero-cta:hover {
    color: var(--green-dim);
    border-color: var(--green-dim);
  }

  .mind-link {
    color: var(--text-secondary);
    text-decoration: none;
    position: relative;
    transition: color var(--transition-fast);
  }

  .mind-link:hover {
    color: var(--green-dim);
  }

  .mind-bubble {
    position: absolute;
    top: -3.2em;
    left: 50%;
    transform: translateX(-50%) scale(0);
    font-size: 1em;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 0.3em 0.5em;
    opacity: 0;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    white-space: nowrap;
  }

  .mind-bubble::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid var(--border);
  }

  .mind-link:hover .mind-bubble {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }

  /* Terminal */
  .terminal-container {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 600px;
    height: 420px;
    overflow: hidden;
  }

  .terminal {
    background: var(--terminal-bg);
    border: 1px solid var(--terminal-border);
    overflow: hidden;
    box-shadow: var(--terminal-shadow);
    height: 100%;
    display: flex;
    flex-direction: column;
    text-align: left;
  }

  .terminal-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3);
    background: var(--terminal-header);
    border-bottom: 1px solid var(--terminal-border);
    flex-shrink: 0;
  }

  .terminal-dots {
    display: flex;
    gap: 6px;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .dot.red { background: #ff5f56; }
  .dot.yellow { background: #ffbd2e; }
  .dot.green { background: #27ca40; }

  .terminal-title {
    margin-left: auto;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    opacity: 0.7;
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
    border-color: var(--terminal-border);
    color: var(--terminal-muted);
    pointer-events: auto;
  }

  .replay-btn.visible:hover {
    border-color: var(--green-dim);
    color: var(--green-dim);
  }

  .terminal-body {
    padding: var(--space-5) var(--space-5);
    flex: 1;
    overflow-y: auto;
    font-family: var(--font-mono);
    font-size: var(--text-base);
    line-height: 2;
  }

  .terminal-line {
    white-space: pre-wrap;
    color: var(--terminal-text);
    margin-bottom: 2px;
  }

  .terminal-line.prompt { color: var(--terminal-muted); }
  .terminal-line.user { color: var(--terminal-command); }
  .terminal-line.system { color: var(--terminal-item); }
  .terminal-line.success { color: var(--terminal-command); }
  .terminal-line.files { color: var(--terminal-item); }
  .terminal-line.magic { color: var(--orange); font-weight: 600; }
  .terminal-line.blank { height: 1.8em; }

  .prompt-symbol { color: var(--terminal-command); margin-right: 8px; }

  .cursor {
    color: var(--terminal-command);
    opacity: 0;
    animation: blink 1s infinite;
  }
  .cursor.visible { opacity: 1; }

  @keyframes blink {
    0%, 50% { opacity: 1; }
    51%, 100% { opacity: 0; }
  }

  /* Section Divider */
  .section-divider {
    width: 100%;
    max-width: 900px;
    height: 1px;
    background: var(--border);
    margin: var(--space-8) auto 0;
  }

  /* Benefits Section */
  .benefits-section {
    padding: var(--space-12) var(--space-8);
    max-width: 1000px;
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

  .benefits-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-6);
  }

  .benefit-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: var(--space-6);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    transition: all 0.2s;
  }

  .benefit-card:hover {
    border-color: var(--green-dim);
  }

  .benefit-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    margin-bottom: var(--space-4);
    color: var(--green-dim);
  }

  .benefit-title {
    font-family: var(--font-serif);
    font-size: var(--text-lg);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0 0 var(--space-2);
  }

  .benefit-desc {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.6;
  }

  .benefits-note {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    margin-top: var(--space-8);
    padding: var(--space-4) var(--space-6);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    text-align: center;
  }

  .benefits-note span:first-of-type {
    font-family: var(--font-serif);
    font-size: var(--text-lg);
    font-weight: 400;
    color: var(--text-primary);
  }

  .benefits-note span:last-of-type {
    line-height: 1.5;
  }

  /* Paths Section */
  .paths-section {
    padding: var(--space-12) var(--space-8);
    text-align: center;
  }

  .paths-headline {
    font-family: var(--font-serif);
    font-size: var(--text-3xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0 0 var(--space-3);
  }

  .paths-subtitle {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    color: var(--text-tertiary);
    margin: 0 0 var(--space-8);
  }

  .paths-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6);
    max-width: 800px;
    margin: 0 auto;
    text-align: left;
  }

  .path-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    padding: var(--space-5);
    transition: border-color 0.2s;
  }

  .path-card:hover {
    border-color: var(--green-dim);
  }

  .path-header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-4);
  }

  .path-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--green-dim);
  }

  .path-title {
    font-family: var(--font-serif);
    font-size: var(--text-xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0;
  }

  .path-example {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-4);
    flex-wrap: wrap;
  }

  .example-input {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    padding: var(--space-2) var(--space-3);
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
  }

  .example-arrow {
    color: var(--text-tertiary);
    display: flex;
    align-items: center;
  }

  .example-output {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .output-tag {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--green-dim);
    padding: 0.25rem 0.5rem;
    background: rgba(0, 196, 154, 0.1);
    border: 1px solid rgba(0, 196, 154, 0.3);
  }

  .path-result {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--green-dim);
  }

  /* Shared Section Styles */
  .section-headline {
    font-family: var(--font-serif);
    font-size: var(--text-3xl);
    font-weight: 400;
    color: var(--text-primary);
    text-align: center;
    margin: 0 0 var(--space-3);
  }

  .section-subtitle {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    color: var(--text-tertiary);
    text-align: center;
    margin: 0 0 var(--space-10);
  }

  /* Skills Deep Section */
  .skills-deep-section {
    padding: var(--space-12) var(--space-8);
    background: var(--bg-secondary);
  }

  .skills-anatomy {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-8);
    max-width: 1000px;
    margin: 0 auto;
  }

  .skill-card-example {
    background: var(--bg-primary);
    border: 1px solid var(--border);
  }

  .skill-header-example {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4);
    border-bottom: 1px solid var(--border);
  }

  .skill-icon-example {
    font-size: var(--text-xl);
  }

  .skill-name-example {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
  }

  .skill-type-example {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--green-dim);
  }

  .skill-body-example {
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .skill-section-example {
    display: flex;
    gap: var(--space-3);
  }

  .section-label {
    flex-shrink: 0;
    width: 80px;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
  }

  .section-value {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: 1.4;
  }

  .skills-list-example {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .skills-list-title {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin: 0;
  }

  .skill-chips {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .skill-chip {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    padding: var(--space-2) var(--space-3);
    border: 1px solid var(--border);
    background: var(--bg-primary);
  }

  .skill-chip.core {
    border-color: var(--green-dim);
    color: var(--green-dim);
  }

  .skill-chip.integration {
    border-color: var(--blue);
    color: var(--blue);
  }

  .skill-chip.pattern {
    border-color: var(--violet);
    color: var(--violet);
  }

  .skills-note {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    margin: 0;
    font-style: italic;
  }

  /* Comparison Section */
  .comparison-section {
    padding: var(--space-12) var(--space-8);
  }

  .anthropic-quote-banner {
    max-width: 800px;
    margin: 0 auto var(--space-8);
    padding: var(--space-6);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-left: 3px solid var(--green-dim);
    text-align: center;
  }

  .anthropic-quote-banner blockquote {
    font-family: var(--font-serif);
    font-size: var(--text-xl);
    color: var(--text-primary);
    margin: 0 0 var(--space-3);
    line-height: 1.5;
  }

  .anthropic-quote-banner cite {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-tertiary);
    font-style: normal;
  }

  .anthropic-quote-banner cite a {
    color: var(--green-dim);
    text-decoration: none;
  }

  .anthropic-quote-banner cite a:hover {
    text-decoration: underline;
  }

  .comparison-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-6);
    max-width: 800px;
    margin: 0 auto var(--space-8);
  }

  .comparison-card {
    padding: var(--space-5);
    border: 1px solid var(--border);
  }

  .comparison-card.general {
    background: var(--bg-secondary);
  }

  .comparison-card.skilled {
    background: rgba(0, 196, 154, 0.05);
    border-color: var(--green-dim);
  }

  .comparison-title {
    font-family: var(--font-serif);
    font-size: var(--text-xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0 0 var(--space-4);
  }

  .comparison-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .comparison-list li {
    display: flex;
    align-items: flex-start;
    gap: var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--text-base);
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .comparison-card.general .comparison-list li {
    color: var(--text-tertiary);
  }

  .comparison-card.skilled .comparison-list li {
    color: var(--text-primary);
  }

  .skills-features {
    display: flex;
    justify-content: center;
    gap: var(--space-8);
    max-width: 900px;
    margin: 0 auto;
  }

  .skill-feature {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--space-2);
  }

  .feature-label {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--green-dim);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .feature-desc {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    max-width: 250px;
    line-height: 1.5;
  }

  .claude-says {
    display: flex;
    gap: var(--space-4);
    max-width: 700px;
    margin: 0 auto;
    padding: var(--space-5);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
  }

  .claude-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--text-secondary);
  }

  .claude-message {
    flex: 1;
  }

  .claude-text {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0 0 var(--space-2);
  }

  .claude-source {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--text-tertiary);
  }

  /* Duo Section */
  .duo-section {
    padding: var(--space-12) var(--space-8);
    background: var(--bg-secondary);
  }

  .duo-grid {
    display: flex;
    align-items: stretch;
    justify-content: center;
    gap: var(--space-4);
    max-width: 800px;
    margin: 0 auto var(--space-6);
  }

  .duo-card {
    flex: 1;
    max-width: 300px;
    padding: var(--space-5);
    background: var(--bg-primary);
    border: 1px solid var(--border);
  }

  .duo-card.spawner-card {
    border-color: var(--green-dim);
  }

  .duo-card.mind-card {
    border-color: var(--violet);
  }

  .duo-header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-2);
  }

  .duo-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
  }

  .duo-title {
    font-family: var(--font-serif);
    font-size: var(--text-xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0;
  }

  .duo-role {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-tertiary);
    margin: 0 0 var(--space-4);
  }

  .duo-provides {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .duo-provides li {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    padding-left: var(--space-4);
    position: relative;
  }

  .duo-provides li::before {
    content: "•";
    position: absolute;
    left: 0;
    color: var(--text-tertiary);
  }

  .duo-plus {
    display: flex;
    align-items: center;
    font-family: var(--font-mono);
    font-size: var(--text-2xl);
    color: var(--text-tertiary);
  }

  .duo-result {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    max-width: 700px;
    margin: 0 auto var(--space-6);
    padding: var(--space-5);
    background: rgba(0, 196, 154, 0.08);
    border: 1px solid rgba(0, 196, 154, 0.3);
  }

  .result-equals {
    font-family: var(--font-mono);
    font-size: var(--text-2xl);
    color: var(--green-dim);
    flex-shrink: 0;
  }

  .result-content {
    flex: 1;
  }

  .result-title {
    font-family: var(--font-serif);
    font-size: var(--text-xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0 0 var(--space-2);
  }

  .result-desc {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
  }

  .duo-install-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-tertiary);
  }

  .hint-icon {
    font-size: var(--text-base);
  }

  .duo-install-hint p {
    margin: 0;
  }

  /* Quickstart Section */
  .quickstart-section {
    padding: var(--space-12) var(--space-8);
  }

  .quickstart-terminal {
    max-width: 700px;
    margin: 0 auto;
    background: var(--terminal-bg);
    border: 1px solid var(--terminal-border);
    box-shadow: var(--terminal-shadow);
  }

  .quickstart-body {
    padding: var(--space-6);
  }

  .qs-step {
    margin-bottom: var(--space-6);
  }

  .qs-step:last-child {
    margin-bottom: 0;
  }

  .qs-step-label {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--terminal-heading);
    margin-bottom: var(--space-3);
  }

  .qs-instruction {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--terminal-text);
    margin: 0;
  }

  .qs-code-block {
    position: relative;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    padding: var(--space-4);
    overflow-x: auto;
  }

  .qs-code-block.small {
    padding: var(--space-3);
  }

  .qs-code-block pre {
    margin: 0;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--terminal-command);
    line-height: 1.6;
    white-space: pre-wrap;
  }

  .qs-code-block.small pre {
    font-size: var(--text-xs);
  }

  .copy-btn {
    position: absolute;
    top: var(--space-2);
    right: var(--space-2);
    padding: var(--space-1) var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .copy-btn:hover {
    border-color: var(--green-dim);
    color: var(--green-dim);
  }

  .copy-btn.small {
    padding: 2px var(--space-2);
  }

  .qs-prompts {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .qs-prompt {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .prompt-label {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .qs-result {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4);
    background: rgba(0, 196, 154, 0.1);
    border: 1px solid rgba(0, 196, 154, 0.3);
    margin-top: var(--space-6);
  }

  .qs-check {
    font-size: var(--text-lg);
    color: var(--green-dim);
    font-weight: 600;
  }

  .qs-result-text {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--green-dim);
  }

  /* Agents Section (existing) */
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

  /* Powers Section */
  .powers-section {
    padding: var(--space-12) var(--space-8);
    text-align: center;
  }

  .powers-headline {
    font-family: var(--font-serif);
    font-size: var(--text-3xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0 0 var(--space-3);
  }

  .powers-subtitle {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    color: var(--text-tertiary);
    margin: 0 0 var(--space-10);
  }

  .powers-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-6);
    max-width: 900px;
    margin: 0 auto var(--space-10);
    text-align: left;
  }

  .power-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    padding: var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .power-demo {
    background: var(--terminal-bg);
    border: 1px solid var(--terminal-border);
    padding: var(--space-4);
    min-height: 100px;
  }

  .demo-bubble {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--terminal-text);
    line-height: 1.6;
  }

  .demo-bubble.claude {
    font-style: italic;
  }

  .demo-label {
    display: block;
    font-size: var(--text-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: var(--space-2);
    color: var(--text-tertiary);
  }

  .demo-bubble.spawner .demo-label {
    color: var(--green-dim);
  }

  .demo-alert {
    display: inline-flex;
    align-items: center;
    gap: 0.35rem;
    color: var(--red);
    margin-bottom: var(--space-2);
  }

  .demo-warning {
    color: var(--orange);
  }

  .demo-options {
    display: block;
    margin-top: var(--space-2);
    color: var(--text-tertiary);
    font-size: var(--text-xs);
  }

  .power-info {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .power-title {
    font-family: var(--font-serif);
    font-size: var(--text-xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0;
  }

  .power-desc {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
  }

  .cta-button {
    display: inline-block;
    margin-top: var(--space-4);
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
      font-size: 2.5rem;
    }

    .terminal-container {
      max-width: 100%;
    }

    .terminal-body {
      min-height: 250px;
      font-size: var(--text-xs);
    }

    .benefits-section {
      padding: var(--space-8) var(--space-4);
    }

    .benefits-grid {
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }

    .benefit-card {
      padding: var(--space-4);
    }

    .terminal-step-body {
      padding: var(--space-3);
    }

    .terminal-line-output {
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

    .paths-section {
      padding: var(--space-8) var(--space-4);
    }

    .paths-headline {
      font-size: var(--text-2xl);
    }

    .paths-grid {
      grid-template-columns: 1fr;
    }

    .skills-deep-section {
      padding: var(--space-8) var(--space-4);
    }

    .skills-anatomy {
      grid-template-columns: 1fr;
      gap: var(--space-6);
    }

    .comparison-section {
      padding: var(--space-8) var(--space-4);
    }

    .anthropic-quote-banner {
      padding: var(--space-4);
    }

    .anthropic-quote-banner blockquote {
      font-size: var(--text-lg);
    }

    .comparison-grid {
      grid-template-columns: 1fr;
    }

    .comparison-list li {
      font-size: var(--text-sm);
    }

    .skills-features {
      flex-direction: column;
      gap: var(--space-4);
    }

    .feature-desc {
      max-width: 100%;
    }

    .duo-section {
      padding: var(--space-8) var(--space-4);
    }

    .duo-grid {
      flex-direction: column;
      align-items: center;
    }

    .duo-card {
      max-width: 100%;
    }

    .duo-plus {
      transform: rotate(90deg);
    }

    .duo-result {
      flex-direction: column;
      text-align: center;
    }

    .powers-section {
      padding: var(--space-8) var(--space-4);
    }

    .powers-headline {
      font-size: var(--text-2xl);
    }

    .powers-grid {
      grid-template-columns: 1fr;
    }

    .quickstart-section {
      padding: var(--space-8) var(--space-4);
    }

    .section-headline {
      font-size: var(--text-2xl);
    }
  }
</style>
