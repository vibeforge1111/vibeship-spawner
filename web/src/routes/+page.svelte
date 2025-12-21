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

  // Skills directory preview state
  let expandedCategory = $state<string | null>(null);

  function toggleCategory(catId: string) {
    expandedCategory = expandedCategory === catId ? null : catId;
  }

  // Skills data for the interactive preview
  const previewCategories = [
    {
      id: 'frameworks',
      name: 'Frameworks',
      preview: 'Next.js, React, Supabase, Tailwind, TypeScript',
      count: 5,
      skills: [
        { id: 'nextjs-app-router', name: 'Next.js App Router', desc: 'Server Components, App Router, Server Actions' },
        { id: 'react-patterns', name: 'React Patterns', desc: 'Hooks, state management, performance' },
        { id: 'supabase-backend', name: 'Supabase Backend', desc: 'RLS, auth, realtime, storage' },
        { id: 'tailwind-ui', name: 'Tailwind UI', desc: 'Utility-first CSS, responsive design' },
        { id: 'typescript-strict', name: 'TypeScript Strict', desc: 'Type safety, generics, strict mode' }
      ]
    },
    {
      id: 'development',
      name: 'Development',
      preview: 'Frontend, Backend, DevOps, Security, QA, AI...',
      count: 12,
      skills: [
        { id: 'frontend', name: 'Frontend', desc: 'UI development, component architecture' },
        { id: 'backend', name: 'Backend', desc: 'API design, database operations' },
        { id: 'devops', name: 'DevOps', desc: 'CI/CD, infrastructure, deployment' },
        { id: 'cybersecurity', name: 'Cybersecurity', desc: 'App security, OWASP, encryption' },
        { id: 'qa-engineering', name: 'QA Engineering', desc: 'Testing strategies, automation' },
        { id: 'ai-product', name: 'AI Product', desc: 'LLM integration, prompting' }
      ]
    },
    {
      id: 'integration',
      name: 'Integration',
      preview: 'Stripe, Auth, Vercel, Email Systems',
      count: 4,
      skills: [
        { id: 'stripe-integration', name: 'Stripe Integration', desc: 'Payments, subscriptions, webhooks' },
        { id: 'nextjs-supabase-auth', name: 'Next.js + Supabase Auth', desc: 'Auth flow, session management' },
        { id: 'vercel-deployment', name: 'Vercel Deployment', desc: 'Deploy, env vars, edge functions' },
        { id: 'email-systems', name: 'Email Systems', desc: 'Transactional email, templates' }
      ]
    },
    {
      id: 'design',
      name: 'Design',
      preview: 'UI, UX, Branding, Landing Pages',
      count: 4,
      skills: [
        { id: 'ui-design', name: 'UI Design', desc: 'Visual design, component systems' },
        { id: 'ux-design', name: 'UX Design', desc: 'User research, flows, usability' },
        { id: 'branding', name: 'Branding', desc: 'Brand identity, voice, visual language' },
        { id: 'landing-page-design', name: 'Landing Page Design', desc: 'Conversion-focused design, CTAs' }
      ]
    },
    {
      id: 'marketing',
      name: 'Marketing',
      preview: 'Copy, Content, SEO, Viral, Blog Writing...',
      count: 8,
      skills: [
        { id: 'copywriting', name: 'Copywriting', desc: 'Headlines, CTAs, conversion copy' },
        { id: 'content-strategy', name: 'Content Strategy', desc: 'Planning, audience, distribution' },
        { id: 'seo', name: 'SEO', desc: 'Search optimization, technical SEO' },
        { id: 'viral-marketing', name: 'Viral Marketing', desc: 'Viral loops, growth hacking' },
        { id: 'blog-writing', name: 'Blog Writing', desc: 'Technical writing, thought leadership' }
      ]
    },
    {
      id: 'product',
      name: 'Product',
      preview: 'PM, Analytics, A/B Testing, Customer Success',
      count: 4,
      skills: [
        { id: 'product-management', name: 'Product Management', desc: 'Roadmaps, prioritization' },
        { id: 'analytics', name: 'Analytics', desc: 'Metrics, dashboards, data-driven' },
        { id: 'a-b-testing', name: 'A/B Testing', desc: 'Experimentation, hypothesis testing' },
        { id: 'customer-success', name: 'Customer Success', desc: 'Onboarding, retention' }
      ]
    },
    {
      id: 'strategy',
      name: 'Strategy',
      preview: 'Growth, Brand, Founder OS, Idea Maze, Pivot...',
      count: 10,
      skills: [
        { id: 'growth-strategy', name: 'Growth Strategy', desc: 'Growth models, channels, scaling' },
        { id: 'brand-positioning', name: 'Brand Positioning', desc: 'Market positioning, differentiation' },
        { id: 'founder-operating-system', name: 'Founder OS', desc: 'Productivity, decision-making' },
        { id: 'idea-maze', name: 'Idea Maze', desc: 'Problem exploration, opportunity sizing' },
        { id: 'pivot-patterns', name: 'Pivot Patterns', desc: 'When to pivot, how to pivot' }
      ]
    },
    {
      id: 'startup',
      name: 'Startup',
      preview: 'YC Playbook, Founder Mode, Burn Rate',
      count: 3,
      skills: [
        { id: 'yc-playbook', name: 'YC Playbook', desc: 'Y Combinator tactics, launch, feedback' },
        { id: 'founder-mode', name: 'Founder Mode', desc: 'When to delegate vs. dive deep' },
        { id: 'burn-rate-management', name: 'Burn Rate', desc: 'Runway, costs, financial planning' }
      ]
    }
  ];

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
    if (isAnimating) return; // Prevent double-start
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
    "spawner": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://mcp.vibeship.co/sse"]
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
    }
  }
}`,
    'new-project': 'I want to build [your idea]. Use spawner_plan to help me get started.',
    'existing-project': 'Analyze this codebase with spawner_analyze and load the right skills.',
    'gotchas': 'Use spawner_watch_out to check for sharp edges before I implement [feature].',
    'unstick': "I'm going in circles. Use spawner_unstick to help me find another approach.",
    'validate': 'Run spawner_validate on this file to check for issues.',
    'remember': 'Use spawner_remember to save this decision: [what you decided].'
  };

  let copiedItem = $state<string | null>(null);

  function copyToClipboard(key: string) {
    navigator.clipboard.writeText(copyTexts[key]);
    copiedItem = key;
    setTimeout(() => copiedItem = null, 2000);
  }

  // ========== SPAWNER + MIND STORY ANIMATION ==========

  type StoryStep = 'connect' | 'analyze' | 'build' | 'catch' | 'flow';

  interface ChatMessage {
    id: string;
    type: 'user' | 'spawner' | 'mind' | 'claude' | 'result';
    text: string;
    code?: string;
    highlight?: string;
  }

  const storySteps: { id: StoryStep; label: string; duration: number }[] = [
    { id: 'connect', label: 'Request', duration: 3500 },
    { id: 'analyze', label: 'Orchestrate', duration: 4500 },
    { id: 'build', label: 'Execute', duration: 5000 },
    { id: 'catch', label: 'Validate', duration: 4500 },
    { id: 'flow', label: 'Ship', duration: 4000 },
  ];

  const storyMessages: Record<StoryStep, ChatMessage[]> = {
    connect: [
      { id: 'c1', type: 'user', text: 'Add user dashboard with activity feed and notifications' }
    ],
    analyze: [
      { id: 'a1', type: 'spawner', text: '[product-lead] Breaking down feature requirements...' },
      { id: 'a2', type: 'spawner', text: '→ Delegating to backend, frontend, database' },
      { id: 'a3', type: 'mind', text: 'Tracking task assignments and decisions.' }
    ],
    build: [
      { id: 'b1', type: 'claude', text: '[backend] Building API endpoints...', code: `// Activity feed endpoint
export async function GET(req: Request) {
  const activities = await db.activity
    .findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 20
    });
  return Response.json(activities);
}` },
      { id: 'b2', type: 'spawner', text: '[database] Sharp edge: Missing index on user_id', highlight: 'Fixed: Added composite index' }
    ],
    catch: [
      { id: 'ct1', type: 'claude', text: '[qa] Running test suite... 47/47 passed' },
      { id: 'ct2', type: 'claude', text: '[security] Audit complete. No vulnerabilities.' }
    ],
    flow: [
      { id: 'f1', type: 'result', text: '[deploy] Pushing to production...' },
      { id: 'f2', type: 'mind', text: 'Feature shipped. All decisions logged.' }
    ]
  };

  const mindActions: Record<StoryStep, string[]> = {
    connect: [],
    analyze: ['Tracking assignments...', 'Logging context...'],
    build: ['Recording decisions...'],
    catch: ['Saving test results...'],
    flow: ['Session complete', 'Ready for next task']
  };

  const spawnerActions: Record<StoryStep, string[]> = {
    connect: ['Connecting...'],
    analyze: ['product-lead active', 'Delegating tasks...'],
    build: ['backend building...', 'database optimizing...'],
    catch: ['qa testing...', 'security scanning...'],
    flow: ['deploy ready']
  };

  let currentStoryStep = $state<number>(0);
  let visibleMessages = $state<ChatMessage[]>([]);
  let storyStarted = $state(false);
  let typingMessage = $state<string | null>(null);

  function getCurrentStep(): StoryStep {
    return storySteps[currentStoryStep].id;
  }

  function startStoryAnimation() {
    if (storyStarted) return;
    storyStarted = true;
    currentStoryStep = 0;
    visibleMessages = [];
    runStoryStep();
  }

  function runStoryStep() {
    const step = storySteps[currentStoryStep];
    const messages = storyMessages[step.id];

    // Add messages one by one with typing effect
    let messageIndex = 0;

    function showNextMessage() {
      if (messageIndex < messages.length) {
        const msg = messages[messageIndex];
        typingMessage = msg.id;

        setTimeout(() => {
          visibleMessages = [...visibleMessages, msg];
          typingMessage = null;
          messageIndex++;
          setTimeout(showNextMessage, 800);
        }, 600);
      } else {
        // Step complete, wait then move to next
        setTimeout(() => {
          if (currentStoryStep < storySteps.length - 1) {
            currentStoryStep++;
            runStoryStep();
          } else {
            // Story complete, pause then restart
            setTimeout(() => {
              currentStoryStep = 0;
              visibleMessages = [];
              runStoryStep();
            }, 3000);
          }
        }, step.duration - (messages.length * 1400));
      }
    }

    setTimeout(showNextMessage, 500);
  }

  // Start story when section comes into view
  function handleStoryIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting && !storyStarted) {
        startStoryAnimation();
      }
    });
  }

  let storySection: HTMLElement;

  onMount(() => {
    // Cursor blink (existing)
    const cursorInterval = setInterval(() => {
      showCursor = !showCursor;
    }, 530);

    // Start terminal animation after a short delay (existing)
    setTimeout(startAnimation, 800);

    // Story intersection observer
    if (storySection) {
      const observer = new IntersectionObserver(handleStoryIntersection, {
        threshold: 0.3
      });
      observer.observe(storySection);

      return () => {
        clearInterval(cursorInterval);
        observer.disconnect();
      };
    }

    return () => clearInterval(cursorInterval);
  });
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

    <!-- What you get -->
    <div class="superpowers-grid">
      <div class="superpower-item">
        <Icon name="layers" size={20} />
        <div class="superpower-text">
          <span class="superpower-label">50+ Skills</span>
          <span class="superpower-desc">Expert specialists for your stack</span>
        </div>
      </div>
      <div class="superpower-item">
        <Icon name="brain" size={20} />
        <div class="superpower-text">
          <span class="superpower-label">Memory</span>
          <span class="superpower-desc">Remembers across sessions</span>
        </div>
      </div>
      <div class="superpower-item">
        <Icon name="check-circle" size={20} />
        <div class="superpower-text">
          <span class="superpower-label">Validation</span>
          <span class="superpower-desc">Catches issues before shipping</span>
        </div>
      </div>
      <div class="superpower-item">
        <Icon name="alert-triangle" size={20} />
        <div class="superpower-text">
          <span class="superpower-label">Sharp Edges</span>
          <span class="superpower-desc">Warns before you hit gotchas</span>
        </div>
      </div>
      <div class="superpower-item">
        <Icon name="life-buoy" size={20} />
        <div class="superpower-text">
          <span class="superpower-label">Escape Hatches</span>
          <span class="superpower-desc">Detects loops, offers alternatives</span>
        </div>
      </div>
      <div class="superpower-item">
        <Icon name="zap" size={20} />
        <div class="superpower-text">
          <span class="superpower-label">Auto-Spawning</span>
          <span class="superpower-desc">Skills matched to your stack</span>
        </div>
      </div>
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
    <h2 class="section-headline">Why Skills Matter (Claude's Take)</h2>
    <p class="section-subtitle">We asked Claude itself — here's why Skills, according to Anthropic's own documentation</p>

    <div class="comparison-table">
      <div class="comparison-header">
        <div class="comparison-col topic-col"></div>
        <div class="comparison-col without-col">Without Skills</div>
        <div class="comparison-col with-col">With Skills</div>
      </div>

      <div class="comparison-row">
        <div class="comparison-col topic-col">Stack Knowledge</div>
        <div class="comparison-col without-col">
          <Icon name="x" size={14} />
          <span>Generic advice across all frameworks</span>
        </div>
        <div class="comparison-col with-col">
          <Icon name="check" size={14} />
          <span>Battle-tested patterns for your exact stack</span>
        </div>
      </div>

      <div class="comparison-row">
        <div class="comparison-col topic-col">Sharp Edges</div>
        <div class="comparison-col without-col">
          <Icon name="x" size={14} />
          <span>Learns gotchas after you hit them</span>
        </div>
        <div class="comparison-col with-col">
          <Icon name="check" size={14} />
          <span>Warns you before you hit them</span>
        </div>
      </div>

      <div class="comparison-row">
        <div class="comparison-col topic-col">Anti-patterns</div>
        <div class="comparison-col without-col">
          <Icon name="x" size={14} />
          <span>Learns mistakes after you ship</span>
        </div>
        <div class="comparison-col with-col">
          <Icon name="check" size={14} />
          <span>Knows what NOT to do upfront</span>
        </div>
      </div>

      <div class="comparison-row">
        <div class="comparison-col topic-col">Versioning</div>
        <div class="comparison-col without-col">
          <Icon name="x" size={14} />
          <span>May suggest outdated implementations</span>
        </div>
        <div class="comparison-col with-col partial">
          <Icon name="check" size={14} />
          <span>Current version patterns <em>(partially—base training still bleeds through)</em></span>
        </div>
      </div>

      <div class="comparison-row">
        <div class="comparison-col topic-col">Context Persistence</div>
        <div class="comparison-col without-col">
          <Icon name="x" size={14} />
          <span>Re-explain your stack every conversation</span>
        </div>
        <div class="comparison-col with-col">
          <Icon name="check" size={14} />
          <span>Your project structure, preferences, and conventions are just there</span>
        </div>
      </div>

      <div class="comparison-row">
        <div class="comparison-col topic-col">Output Format Control</div>
        <div class="comparison-col without-col">
          <Icon name="x" size={14} />
          <span>Inconsistent component structures, folder patterns</span>
        </div>
        <div class="comparison-col with-col">
          <Icon name="check" size={14} />
          <span>"Always do it this way" actually sticks across sessions</span>
        </div>
      </div>

      <div class="comparison-row">
        <div class="comparison-col topic-col">Workflow Encoding</div>
        <div class="comparison-col without-col">
          <Icon name="x" size={14} />
          <span>You manually sequence every multi-step task</span>
        </div>
        <div class="comparison-col with-col">
          <Icon name="check" size={14} />
          <span>Step-by-step procedures survive between conversations</span>
        </div>
      </div>

      <div class="comparison-row">
        <div class="comparison-col topic-col">Tool-Specific Instructions</div>
        <div class="comparison-col without-col">
          <Icon name="x" size={14} />
          <span>Zero knowledge of your internal CLIs, MCPs, custom APIs</span>
        </div>
        <div class="comparison-col with-col">
          <Icon name="check" size={14} />
          <span>Your proprietary tools documented and usable</span>
        </div>
      </div>

      <div class="comparison-row">
        <div class="comparison-col topic-col">Business Logic</div>
        <div class="comparison-col without-col">
          <Icon name="x" size={14} />
          <span>Guesses at your domain rules</span>
        </div>
        <div class="comparison-col with-col">
          <Icon name="check" size={14} />
          <span>Knows "users need X before Y because Z"</span>
        </div>
      </div>
    </div>

    <div class="anthropic-quote-banner">
      <blockquote>"Think of Skills as custom onboarding materials that let you package expertise, making Claude a specialist on what matters most to you."</blockquote>
      <cite>— <a href="https://claude.com/blog/skills" target="_blank" rel="noopener">Anthropic, Introducing Agent Skills</a></cite>
    </div>
  </section>

  <!-- Divider -->
  <div class="section-divider"></div>

  <!-- Skills System Section -->
  <section class="skills-deep-section">
    <h2 class="section-headline">The Skill System</h2>
    <p class="section-subtitle">YAML-powered expertise, not markdown fluff</p>

    <div class="skills-two-col">
      <!-- Left: YAML Anatomy -->
      <div class="yaml-anatomy">
        <div class="yaml-intro">
          <p>Each skill is a structured YAML package with <strong>4 files</strong> that give Claude real expertise:</p>
        </div>

        <div class="yaml-files">
          <div class="yaml-file">
            <div class="yaml-file-header">
              <Icon name="file-text" size={16} />
              <span class="yaml-filename">skill.yaml</span>
            </div>
            <ul class="yaml-contents">
              <li><strong>Identity</strong> — Who is this expert? Core principles, battle scars</li>
              <li><strong>Patterns</strong> — Proven approaches with code examples</li>
              <li><strong>Anti-patterns</strong> — What NOT to do and why</li>
              <li><strong>Handoffs</strong> — When to delegate to other skills</li>
            </ul>
          </div>

          <div class="yaml-file">
            <div class="yaml-file-header">
              <Icon name="alert-triangle" size={16} />
              <span class="yaml-filename">sharp-edges.yaml</span>
            </div>
            <ul class="yaml-contents">
              <li><strong>Gotchas</strong> — Real pitfalls that catch developers</li>
              <li><strong>Detection</strong> — Spots issues in your code</li>
              <li><strong>Severity</strong> — Critical, high, medium warnings</li>
              <li><strong>Solutions</strong> — Exact fix with examples</li>
            </ul>
          </div>

          <div class="yaml-file">
            <div class="yaml-file-header">
              <Icon name="check-circle" size={16} />
              <span class="yaml-filename">validations.yaml</span>
            </div>
            <ul class="yaml-contents">
              <li><strong>Checks</strong> — Automated validation on your code</li>
              <li><strong>Patterns</strong> — Catches bugs before shipping</li>
              <li><strong>Fix actions</strong> — What to do when check fails</li>
              <li><strong>Targeting</strong> — Knows which files to scan</li>
            </ul>
          </div>

          <div class="yaml-file">
            <div class="yaml-file-header">
              <Icon name="git-branch" size={16} />
              <span class="yaml-filename">collaboration.yaml</span>
            </div>
            <ul class="yaml-contents">
              <li><strong>Prerequisites</strong> — What skills this needs</li>
              <li><strong>Delegation triggers</strong> — When to hand off</li>
              <li><strong>Cross-domain insights</strong> — Shared knowledge</li>
            </ul>
          </div>
        </div>

        <div class="yaml-vs-markdown">
          <span class="vs-label">vs Basic Skills:</span>
          <span class="vs-text">Markdown docs are human-readable. YAML skills are <em>machine-actionable</em> — Claude can match situations, scan code, and warn proactively.</span>
        </div>
      </div>

      <!-- Skills Directory -->
      <div class="skills-directory-preview">
        <div class="directory-header-preview">
          <span class="directory-count">54 Skills</span>
          <a href="/skills" class="directory-link">View All →</a>
        </div>

        <div class="category-list">
          {#each previewCategories as cat}
            <div class="category-item" class:expanded={expandedCategory === cat.id}>
              <button class="category-row" onclick={() => toggleCategory(cat.id)}>
                <div class="cat-info">
                  <span class="cat-name">{cat.name}</span>
                  <span class="cat-skills">{cat.preview}</span>
                </div>
                <span class="cat-count">{cat.count}</span>
                <span class="cat-toggle">{expandedCategory === cat.id ? '−' : '+'}</span>
              </button>

              {#if expandedCategory === cat.id}
                <div class="category-skills">
                  {#each cat.skills as skill}
                    <a href="/skills#{skill.id}" class="mini-skill">
                      <span class="mini-skill-name">{skill.name}</span>
                      <span class="mini-skill-desc">{skill.desc}</span>
                    </a>
                  {/each}
                  {#if cat.skills.length < cat.count}
                    <a href="/skills#{cat.id}" class="mini-skill more">
                      <span class="mini-skill-name">+ {cat.count - cat.skills.length} more</span>
                      <span class="mini-skill-desc">View all in Skills Directory</span>
                    </a>
                  {/if}
                </div>
              {/if}
            </div>
          {/each}
        </div>

        <div class="directory-footer">
          <p class="directory-tagline">Curated, versioned, battle-tested — not AI-generated slop</p>
          <ul class="directory-bullets">
            <li>4 YAML files per skill — not a single markdown persona</li>
            <li>Sharp edges, validations, patterns from real production use</li>
            <li>Machine-actionable expertise Claude can execute, not just read</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- Divider -->
  <div class="section-divider"></div>

  <!-- Unified Spawner + Mind Flow Section -->
  <section class="flow-section" bind:this={storySection}>
    <h2 class="section-headline">Spawner + Mind = Full Stack Claude</h2>
    <p class="section-subtitle">Watch how they work together</p>

    <!-- Story Animation Stage -->
    <div class="story-stage">
      <!-- Mind Panel (Left) -->
      <div class="side-panel mind-panel" class:active={getCurrentStep() === 'analyze' || getCurrentStep() === 'flow'}>
        <div class="panel-header">
          <Icon name="brain" size={16} />
          <span>Mind</span>
        </div>
        <div class="panel-actions">
          {#each mindActions[getCurrentStep()] as action, i}
            <span class="panel-action" style="--delay: {i * 0.3}s">{action}</span>
          {/each}
        </div>
        <div class="panel-pulse"></div>
      </div>

      <!-- Central Chat Stage -->
      <div class="chat-stage">
        <div class="chat-header">
          <div class="chat-dots">
            <span class="dot"></span>
            <span class="dot"></span>
            <span class="dot"></span>
          </div>
          <span class="chat-title">Claude Session</span>
        </div>
        <div class="chat-messages">
          {#each visibleMessages as msg (msg.id)}
            <div class="chat-message {msg.type}" class:has-code={msg.code}>
              <div class="message-badge">
                {#if msg.type === 'user'}
                  <Icon name="user" size={12} />
                {:else if msg.type === 'spawner'}
                  <Icon name="zap" size={12} />
                {:else if msg.type === 'mind'}
                  <Icon name="brain" size={12} />
                {:else if msg.type === 'claude'}
                  <Icon name="terminal" size={12} />
                {:else if msg.type === 'result'}
                  <Icon name="check-circle" size={12} />
                {/if}
              </div>
              <div class="message-content">
                <span class="message-text">{msg.text}</span>
                {#if msg.code}
                  <pre class="message-code"><code>{msg.code}</code></pre>
                {/if}
                {#if msg.highlight}
                  <span class="message-highlight">
                    <Icon name="check" size={10} />
                    {msg.highlight}
                  </span>
                {/if}
              </div>
            </div>
          {/each}
          {#if typingMessage}
            <div class="typing-indicator">
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
              <span class="typing-dot"></span>
            </div>
          {/if}
        </div>
      </div>

      <!-- Spawner Panel (Right) -->
      <div class="side-panel spawner-panel" class:active={getCurrentStep() === 'connect' || getCurrentStep() === 'analyze' || getCurrentStep() === 'build' || getCurrentStep() === 'catch' || getCurrentStep() === 'flow'}>
        <div class="panel-header">
          <Icon name="zap" size={16} />
          <span>Spawner</span>
        </div>
        <div class="panel-actions">
          {#each spawnerActions[getCurrentStep()] as action, i}
            <span class="panel-action" style="--delay: {i * 0.3}s">{action}</span>
          {/each}
        </div>
        <div class="panel-pulse"></div>
      </div>
    </div>

    <!-- Timeline Rail -->
    <div class="timeline-rail">
      {#each storySteps as step, i}
        <div class="timeline-node" class:active={currentStoryStep === i} class:completed={currentStoryStep > i}>
          <div class="node-dot">
            {#if currentStoryStep > i}
              <Icon name="check" size={10} />
            {/if}
          </div>
          <span class="node-label">{step.label}</span>
        </div>
        {#if i < storySteps.length - 1}
          <div class="timeline-connector" class:active={currentStoryStep > i}></div>
        {/if}
      {/each}
    </div>

    <!-- Result Summary -->
    <div class="flow-result">
      <p class="result-text">Spawner gives Claude <strong>expertise</strong>. Mind gives Claude <strong>memory</strong>. Together, they level up every session—seamlessly, right in your terminal. Quick setup below. They run quietly as MCPs—like superpowers you didn't know you needed.</p>
    </div>
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
          <span class="qs-step-label">Step 3: Start building</span>

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
          </div>
        </div>

        <div class="qs-result">
          <span class="qs-check">✓</span>
          <span class="qs-result-text">That's it. Claude now has 50+ expert skills and real-time validation.</span>
        </div>

        <div class="mind-recommend">
          <span class="recommend-text">We recommend pairing Spawner with</span>
          <a href="https://mind.vibeship.co" target="_blank" rel="noopener" class="mind-link-big">
            <span class="mind-text">Mind</span>
            <span class="mind-brain-big">🧠</span>
          </a>
          <span class="recommend-text">for persistent memory across sessions.</span>
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

  /* Superpowers Grid */
  .superpowers-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-4);
    margin-top: var(--space-8);
    max-width: 900px;
    margin-left: auto;
    margin-right: auto;
  }

  .superpower-item {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    transition: border-color 0.2s;
  }

  .superpower-item:hover {
    border-color: var(--green-dim);
  }

  .superpower-item > :global(svg) {
    flex-shrink: 0;
    color: var(--green-dim);
    margin-top: 2px;
  }

  .superpower-text {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .superpower-label {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
  }

  .superpower-desc {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    line-height: 1.4;
  }

  @media (max-width: 768px) {
    .superpowers-grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 500px) {
    .superpowers-grid {
      grid-template-columns: 1fr;
    }
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

  .skills-two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-8);
    max-width: 1100px;
    margin: 0 auto;
  }

  /* YAML Anatomy - Left Side */
  .yaml-anatomy {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .yaml-intro p {
    font-size: var(--text-base);
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.6;
  }

  .yaml-intro strong {
    color: var(--green-dim);
  }

  .yaml-files {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .yaml-file {
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 0;
    padding: var(--space-3);
  }

  .yaml-file-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-2);
    color: var(--green-dim);
  }

  .yaml-filename {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
  }

  .yaml-contents {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .yaml-contents li {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: 1.4;
    padding-left: var(--space-4);
    position: relative;
  }

  .yaml-contents li::before {
    content: '•';
    position: absolute;
    left: 0;
    color: var(--text-tertiary);
  }

  .yaml-contents strong {
    color: var(--text-primary);
    font-weight: 500;
  }

  .yaml-vs-markdown {
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-radius: 0;
    padding: var(--space-3);
    margin-top: var(--space-2);
  }

  .vs-label {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    display: block;
    margin-bottom: var(--space-1);
  }

  .vs-text {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: 1.5;
  }

  .vs-text em {
    color: var(--green-dim);
    font-style: normal;
    font-weight: 500;
  }

  /* Skills Directory Preview */
  .skills-directory-preview {
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .directory-header-preview {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--border);
    background: var(--bg-tertiary);
  }

  .directory-count {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
  }

  .directory-link {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--green-dim);
    text-decoration: none;
  }

  .directory-link:hover {
    text-decoration: underline;
  }

  .category-list {
    flex: 1;
    padding: 0;
    min-height: 0;
    overflow-y: auto;
  }

  .category-item {
    border-bottom: 1px solid var(--border);
  }

  .category-item:last-child {
    border-bottom: none;
  }

  .category-item.expanded {
    background: var(--bg-secondary);
  }

  .category-item.expanded .category-row {
    border-bottom: 1px solid var(--border);
  }

  .category-row {
    display: grid;
    grid-template-columns: 1fr 28px 28px;
    gap: var(--space-2);
    padding: var(--space-4);
    align-items: center;
    width: 100%;
    background: transparent;
    border: none;
    cursor: pointer;
    font-family: inherit;
    text-align: left;
    min-height: 56px;
    transition: background 0.15s, border-color 0.15s;
    border-left: 3px solid transparent;
  }

  .category-row:hover {
    background: rgba(0, 196, 154, 0.08);
    border-left-color: var(--green-dim);
  }

  .category-row:hover .cat-name {
    color: var(--green-dim);
  }

  .category-row:hover .cat-toggle {
    background: rgba(0, 196, 154, 0.2);
    transform: scale(1.1);
  }

  .cat-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;
  }

  .cat-name {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
    transition: color 0.15s;
  }

  .cat-skills {
    font-size: var(--text-sm);
    color: var(--text-tertiary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .cat-count {
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-secondary);
    background: transparent;
    width: 28px;
    height: 28px;
    border-radius: 0;
    border: 1px solid var(--border);
  }

  .cat-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    font-family: var(--font-mono);
    font-size: var(--text-lg);
    font-weight: 700;
    color: var(--green-dim);
    background: rgba(0, 196, 154, 0.1);
    border-radius: 0;
    border: 1px solid rgba(0, 196, 154, 0.3);
    transition: transform 0.2s, background 0.15s, color 0.15s;
  }

  .category-item.expanded .category-row {
    background: rgba(0, 196, 154, 0.05);
    border-left-color: var(--green-dim);
  }

  .category-item.expanded .cat-toggle {
    background: var(--green-dim);
    color: var(--bg-primary);
    transform: rotate(0deg);
  }

  /* Expanded category skills */
  .category-skills {
    padding: var(--space-2) var(--space-3);
    padding-left: var(--space-6);
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    background: var(--bg-tertiary);
    border-top: 1px solid var(--border);
  }

  .mini-skill {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-1) var(--space-2);
    border-radius: 0;
    text-decoration: none;
    transition: background 0.15s;
  }

  .mini-skill:hover {
    background: var(--bg-primary);
  }

  .mini-skill-name {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--text-primary);
  }

  .mini-skill-desc {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    text-align: right;
    flex-shrink: 0;
  }

  .mini-skill.more {
    border-top: 1px dashed var(--border);
    margin-top: var(--space-1);
    padding-top: var(--space-2);
  }

  .mini-skill.more .mini-skill-name {
    color: var(--green-dim);
  }

  .directory-footer {
    margin-top: auto;
    padding: var(--space-3) var(--space-4);
    border-top: 1px solid var(--border);
    background: var(--bg-tertiary);
  }

  .directory-tagline {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-primary);
    margin: 0 0 var(--space-2) 0;
    font-weight: 500;
  }

  .directory-bullets {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .directory-bullets li {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    padding-left: var(--space-3);
    position: relative;
  }

  .directory-bullets li::before {
    content: '→';
    position: absolute;
    left: 0;
    color: var(--green-dim);
  }

  /* Comparison Section */
  .comparison-section {
    padding: var(--space-12) var(--space-8);
  }

  .anthropic-quote-banner {
    max-width: 900px;
    margin: 0 auto;
    padding: var(--space-4) var(--space-8);
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    border-top: none;
    text-align: center;
  }

  .anthropic-quote-banner blockquote {
    font-family: var(--font-serif);
    font-size: var(--text-base);
    color: var(--text-secondary);
    margin: 0 0 var(--space-2);
    line-height: 1.5;
  }

  .anthropic-quote-banner cite {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    font-style: normal;
  }

  .anthropic-quote-banner cite a {
    color: var(--text-primary);
    text-decoration: none;
  }

  .anthropic-quote-banner cite a:hover {
    text-decoration: underline;
  }

  /* Spawner + Mind Benefits */
  .combo-divider {
    max-width: 900px;
    margin: var(--space-8) auto;
    height: 1px;
    background: var(--border);
  }

  .combo-benefits {
    max-width: 900px;
    margin: 0 auto;
  }

  .combo-title {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--green-dim);
    margin: 0 0 var(--space-4);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    text-align: center;
  }

  .combo-boxes {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-3);
  }

  .combo-box {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    padding: var(--space-4) var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .combo-label {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
  }

  .combo-desc {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-muted);
    line-height: 1.5;
  }

  .comparison-table {
    max-width: 900px;
    margin: 0 auto;
    border: 1px solid var(--border);
    background: var(--bg-secondary);
  }

  .comparison-header {
    display: grid;
    grid-template-columns: 140px 1fr 1fr;
    background: var(--bg-tertiary);
    border-bottom: 1px solid var(--border);
  }

  .comparison-header .comparison-col {
    padding: var(--space-3) var(--space-4);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
  }

  .comparison-header .without-col {
    color: var(--text-tertiary);
  }

  .comparison-header .with-col {
    color: var(--green-dim);
  }

  .comparison-row {
    display: grid;
    grid-template-columns: 140px 1fr 1fr;
    border-bottom: 1px solid var(--border);
  }

  .comparison-row:last-child {
    border-bottom: none;
  }

  .comparison-col {
    padding: var(--space-3) var(--space-4);
    display: flex;
    align-items: flex-start;
    gap: var(--space-2);
  }

  .comparison-col.topic-col {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
    background: var(--bg-tertiary);
    border-right: 1px solid var(--border);
  }

  .comparison-col.without-col {
    background: var(--bg-secondary);
    color: var(--text-tertiary);
    border-right: 1px solid var(--border);
  }

  .comparison-col.without-col span {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    line-height: 1.5;
  }

  .comparison-col.with-col {
    background: rgba(0, 196, 154, 0.03);
    color: var(--text-primary);
  }

  .comparison-col.with-col span {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    line-height: 1.5;
  }

  .comparison-col.with-col em {
    color: var(--text-muted);
    font-style: normal;
    font-size: var(--text-xs);
  }

  .comparison-col.with-col.partial {
    background: rgba(0, 196, 154, 0.03);
  }

  .comparison-row:hover .comparison-col.without-col,
  .comparison-row:hover .comparison-col.with-col {
    background: var(--bg-primary);
  }

  .comparison-row:hover .comparison-col.with-col {
    background: rgba(0, 196, 154, 0.08);
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

  /* Flow Section */
  .flow-section {
    padding: var(--space-12) var(--space-8);
    background: var(--bg-secondary);
  }

  /* Flow Diagram */
  .flow-diagram {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-4);
    max-width: 900px;
    margin: 0 auto var(--space-10);
    padding: var(--space-6) 0;
  }

  .flow-node {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    position: relative;
  }

  .node-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    background: var(--bg-primary);
    border: 2px solid var(--border);
    border-radius: 50%;
    color: var(--text-secondary);
    transition: all 0.3s;
  }

  .user-node .node-icon {
    border-color: var(--text-tertiary);
  }

  .claude-node .node-icon {
    width: 80px;
    height: 80px;
    border-color: var(--green-dim);
    color: var(--green-dim);
    box-shadow: 0 0 20px rgba(0, 196, 154, 0.2);
  }

  .output-node .node-icon {
    border-color: var(--green-dim);
    color: var(--green-dim);
  }

  .node-label {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Flow Arrows */
  .flow-arrow {
    position: relative;
    width: 60px;
    height: 2px;
  }

  .arrow-line {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--border);
  }

  .arrow-pulse {
    position: absolute;
    top: -3px;
    left: 0;
    width: 8px;
    height: 8px;
    background: var(--green-dim);
    border-radius: 50%;
    animation: pulse-flow 2s ease-in-out infinite;
  }

  @keyframes pulse-flow {
    0% { left: 0; opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { left: calc(100% - 8px); opacity: 0; }
  }

  /* Capability Feeds on Claude Node */
  .capability-feed {
    position: absolute;
    width: 160px;
    padding: var(--space-3);
    background: var(--bg-primary);
    border: 1px solid var(--border);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
  }

  .spawner-feed {
    top: -10px;
    right: calc(100% + 20px);
    border-color: var(--green-dim);
  }

  .mind-feed {
    top: -10px;
    left: calc(100% + 20px);
    border-color: var(--violet);
  }

  .feed-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-2);
    padding-bottom: var(--space-2);
    border-bottom: 1px solid var(--border);
    font-weight: 600;
  }

  .spawner-feed .feed-header {
    color: var(--green-dim);
  }

  .mind-feed .feed-header {
    color: var(--violet);
  }

  .feed-items {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .feed-item {
    color: var(--text-tertiary);
    opacity: 0;
    animation: feed-appear 3s ease-in-out infinite;
    animation-delay: var(--delay);
  }

  @keyframes feed-appear {
    0%, 20% { opacity: 0; transform: translateX(-5px); }
    30%, 70% { opacity: 1; transform: translateX(0); }
    80%, 100% { opacity: 0; transform: translateX(5px); }
  }

  /* Capabilities Demo Grid */
  .capabilities-demo {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
    max-width: 900px;
    margin: 0 auto var(--space-8);
  }

  .capability-card {
    background: var(--bg-primary);
    border: 1px solid var(--border);
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .capability-card.mind-capability {
    border-left: 3px solid var(--violet);
  }

  .capability-card.spawner-capability {
    border-left: 3px solid var(--green-dim);
  }

  .capability-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .mind-capability .capability-header {
    color: var(--violet);
  }

  .spawner-capability .capability-header {
    color: var(--green-dim);
  }

  .capability-example {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: 1.5;
    padding: var(--space-3);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
  }

  .example-alert {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--red);
    margin-bottom: var(--space-2);
  }

  .example-warning {
    color: var(--orange);
  }

  .example-options {
    display: block;
    margin-top: var(--space-2);
    color: var(--text-tertiary);
    font-size: var(--text-xs);
  }

  .capability-name {
    font-family: var(--font-serif);
    font-size: var(--text-lg);
    color: var(--text-primary);
  }

  /* Flow Result */
  .flow-result {
    text-align: center;
    max-width: 600px;
    margin: 0 auto var(--space-6);
  }

  .result-text {
    font-size: var(--text-base);
    color: var(--text-secondary);
    margin: 0 0 var(--space-3);
    max-width: 650px;
    line-height: 1.7;
  }

  .result-text strong {
    color: var(--green-dim);
  }

  .result-cta {
    font-size: var(--text-base);
    color: var(--text-tertiary);
    margin: var(--space-3) 0 0 0;
    max-width: 550px;
    line-height: 1.5;
  }

  .flow-install-hint {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-tertiary);
    margin-bottom: var(--space-6);
  }

  /* Story Stage - 3 Column Layout */
  .story-stage {
    display: grid;
    grid-template-columns: 180px 1fr 180px;
    gap: var(--space-4);
    max-width: 1000px;
    margin: 0 auto var(--space-6);
    height: 450px;
    align-items: start;
  }

  /* Side Panels */
  .side-panel {
    background: var(--bg-primary);
    border: 1px solid var(--border);
    padding: var(--space-4);
    position: relative;
    opacity: 0.5;
    transition: all 0.4s ease;
    height: fit-content;
    max-height: 200px;
  }

  .side-panel.active {
    opacity: 1;
  }

  .mind-panel {
    border-color: var(--border);
  }

  .mind-panel.active {
    border-color: var(--violet);
    box-shadow: 0 0 20px rgba(139, 92, 246, 0.15);
  }

  .spawner-panel {
    border-color: var(--border);
  }

  .spawner-panel.active {
    border-color: var(--green-dim);
    box-shadow: 0 0 20px rgba(0, 196, 154, 0.15);
  }

  .panel-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    margin-bottom: var(--space-3);
    padding-bottom: var(--space-3);
    border-bottom: 1px solid var(--border);
  }

  .mind-panel .panel-header {
    color: var(--violet);
  }

  .spawner-panel .panel-header {
    color: var(--green-dim);
  }

  .panel-actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    min-height: 80px;
  }

  .panel-action {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--text-secondary);
    opacity: 0;
    transform: translateX(-5px);
    animation: panel-action-appear 0.5s ease forwards;
    animation-delay: var(--delay);
  }

  @keyframes panel-action-appear {
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .panel-pulse {
    position: absolute;
    bottom: var(--space-3);
    left: 50%;
    transform: translateX(-50%);
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--border);
    opacity: 0;
  }

  .side-panel.active .panel-pulse {
    opacity: 1;
    animation: panel-pulse-glow 1.5s ease-in-out infinite;
  }

  .mind-panel.active .panel-pulse {
    background: var(--violet);
  }

  .spawner-panel.active .panel-pulse {
    background: var(--green-dim);
  }

  @keyframes panel-pulse-glow {
    0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.5; }
    50% { transform: translateX(-50%) scale(1.5); opacity: 1; }
  }

  /* Chat Stage */
  .chat-stage {
    background: var(--bg-primary);
    border: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    height: 450px;
  }

  .chat-header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background: var(--bg-tertiary);
    border-bottom: 1px solid var(--border);
  }

  .chat-dots {
    display: flex;
    gap: 6px;
  }

  .chat-dots .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--border);
  }

  .chat-dots .dot:nth-child(1) { background: #ff5f56; }
  .chat-dots .dot:nth-child(2) { background: #ffbd2e; }
  .chat-dots .dot:nth-child(3) { background: #27ca40; }

  .chat-title {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    margin-left: auto;
  }

  .chat-messages {
    flex: 1;
    padding: var(--space-4);
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  /* Chat Messages */
  .chat-message {
    display: flex;
    gap: var(--space-3);
    animation: message-appear 0.4s ease;
    max-width: 90%;
  }

  .chat-message.user {
    align-self: flex-end;
    flex-direction: row-reverse;
  }

  .chat-message.has-code {
    max-width: 100%;
  }

  @keyframes message-appear {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .message-badge {
    flex-shrink: 0;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
  }

  .chat-message.user .message-badge {
    background: var(--bg-tertiary);
    color: var(--text-secondary);
  }

  .chat-message.spawner .message-badge {
    border-color: var(--green-dim);
    color: var(--green-dim);
  }

  .chat-message.mind .message-badge {
    border-color: var(--violet);
    color: var(--violet);
  }

  .chat-message.claude .message-badge {
    border-color: #D97757;
    color: #D97757;
  }

  .chat-message.result .message-badge {
    border-color: var(--green-dim);
    color: var(--green-dim);
    background: rgba(0, 196, 154, 0.1);
  }

  .message-content {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .message-text {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: 1.5;
    padding: var(--space-3);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 2px;
  }

  .chat-message.user .message-text {
    background: var(--bg-tertiary);
  }

  .chat-message.spawner .message-text {
    border-left: 2px solid var(--green-dim);
  }

  .chat-message.mind .message-text {
    border-left: 2px solid var(--violet);
  }

  .chat-message.result .message-text {
    background: rgba(0, 196, 154, 0.05);
    border-color: var(--green-dim);
    color: var(--green-dim);
  }

  .message-code {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    line-height: 1.6;
    padding: var(--space-3);
    background: var(--terminal-bg);
    border: 1px solid var(--terminal-border);
    overflow-x: auto;
    margin: 0;
  }

  .message-code code {
    color: var(--terminal-text);
  }

  .message-highlight {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--green-dim);
    padding: var(--space-2);
    background: rgba(0, 196, 154, 0.1);
    border: 1px solid rgba(0, 196, 154, 0.3);
  }

  /* Typing Indicator */
  .typing-indicator {
    display: flex;
    gap: 4px;
    padding: var(--space-3);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    width: fit-content;
    border-radius: 2px;
  }

  .typing-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--text-tertiary);
    animation: typing-bounce 1.4s ease-in-out infinite;
  }

  .typing-dot:nth-child(2) {
    animation-delay: 0.2s;
  }

  .typing-dot:nth-child(3) {
    animation-delay: 0.4s;
  }

  @keyframes typing-bounce {
    0%, 60%, 100% {
      transform: translateY(0);
    }
    30% {
      transform: translateY(-4px);
    }
  }

  /* Timeline Rail */
  .timeline-rail {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0;
    max-width: 600px;
    margin: 0 auto var(--space-8);
    padding: var(--space-4) 0;
  }

  .timeline-node {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
  }

  .node-dot {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 2px solid var(--border);
    background: var(--bg-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    color: transparent;
    transition: all 0.3s ease;
  }

  .timeline-node.active .node-dot {
    border-color: var(--green-dim);
    background: var(--bg-primary);
    box-shadow: 0 0 12px rgba(0, 196, 154, 0.4);
    position: relative;
  }

  .timeline-node.active .node-dot::before {
    content: '';
    position: absolute;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--green-dim);
    animation: node-pulse 1.2s ease-in-out infinite;
  }

  @keyframes node-pulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.4); opacity: 0.6; }
  }

  .timeline-node.completed .node-dot {
    border-color: var(--green-dim);
    background: rgba(0, 196, 154, 0.2);
    color: var(--green-dim);
  }

  .timeline-node .node-label {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    transition: color 0.3s ease;
  }

  .timeline-node.active .node-label,
  .timeline-node.completed .node-label {
    color: var(--green-dim);
  }

  .timeline-connector {
    width: 60px;
    height: 2px;
    background: var(--border);
    margin: 0 var(--space-2);
    margin-bottom: var(--space-6);
    position: relative;
    overflow: hidden;
  }

  .timeline-connector.active::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
    background: var(--green-dim);
    animation: connector-fill 0.5s ease forwards;
  }

  @keyframes connector-fill {
    from { width: 0; }
    to { width: 100%; }
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

  /* Mind Recommendation */
  .mind-recommend {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: var(--space-2);
    padding: var(--space-4);
    margin-top: var(--space-4);
    border-top: 1px solid var(--border);
    background: var(--bg-tertiary);
  }

  .recommend-text {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-muted);
  }

  .mind-link-big {
    position: relative;
    display: inline;
    color: var(--green-dim);
    text-decoration: none;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
  }

  .mind-link-big:hover {
    color: var(--green);
  }

  .mind-text {
    position: relative;
    z-index: 1;
  }

  .mind-brain-big {
    position: absolute;
    top: -3.2em;
    left: 50%;
    transform: translateX(-50%) scale(0);
    opacity: 0;
    font-size: 2rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    padding: 0.4em 0.5em;
    z-index: 10;
    transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
    pointer-events: none;
    white-space: nowrap;
    line-height: 1;
  }

  .mind-brain-big::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid var(--border);
  }

  .mind-link-big:hover .mind-brain-big {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }

  /* Prompts Directory Section */
  .prompts-section {
    padding: var(--space-12) var(--space-8);
    background: var(--bg-primary);
  }

  .prompts-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
    max-width: 900px;
    margin: 0 auto;
  }

  .prompt-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    padding: var(--space-4);
  }

  .prompt-card-label {
    display: block;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--space-2);
  }

  .prompt-card-code {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    padding: var(--space-2) var(--space-3);
  }

  .prompt-card-code pre {
    flex: 1;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--text-secondary);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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

    .skills-two-col {
      grid-template-columns: 1fr;
      gap: var(--space-6);
    }

    .yaml-file {
      padding: var(--space-2);
    }

    .yaml-contents li {
      font-size: var(--text-xs);
    }

    .category-row {
      grid-template-columns: 1fr 36px 28px;
      gap: var(--space-2);
      padding: var(--space-3);
      min-height: 52px;
    }

    .cat-name {
      font-size: var(--text-sm);
    }

    .cat-skills {
      font-size: var(--text-xs);
    }

    .cat-count {
      font-size: var(--text-xs);
      padding: 3px 8px;
    }

    .cat-toggle {
      width: 24px;
      height: 24px;
      font-size: var(--text-base);
    }

    .category-skills {
      padding: var(--space-2);
      padding-left: var(--space-4);
    }

    .mini-skill {
      flex-direction: column;
      align-items: flex-start;
      gap: 2px;
    }

    .mini-skill-desc {
      text-align: left;
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

    .combo-boxes {
      grid-template-columns: repeat(2, 1fr);
    }

    .comparison-header {
      display: none;
    }

    .comparison-row {
      grid-template-columns: 1fr;
      gap: 0;
    }

    .comparison-col.topic-col {
      border-right: none;
      border-bottom: 1px solid var(--border);
      font-size: var(--text-base);
      padding: var(--space-3) var(--space-4);
    }

    .comparison-col.without-col,
    .comparison-col.with-col {
      border-right: none;
      padding: var(--space-3) var(--space-4);
    }

    .comparison-col.without-col {
      border-bottom: 1px solid var(--border);
    }

    .comparison-col.without-col::before {
      content: "Without: ";
      font-weight: 600;
      color: var(--text-tertiary);
    }

    .comparison-col.with-col::before {
      content: "With: ";
      font-weight: 600;
      color: var(--green-dim);
    }

    .flow-section {
      padding: var(--space-8) var(--space-4);
    }

    .flow-diagram {
      flex-direction: column;
      gap: var(--space-6);
      padding: var(--space-4) 0;
    }

    .flow-arrow {
      width: 2px;
      height: 40px;
    }

    .arrow-pulse {
      top: 0;
      left: -3px;
      animation: pulse-flow-vertical 2s ease-in-out infinite;
    }

    @keyframes pulse-flow-vertical {
      0% { top: 0; opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 1; }
      100% { top: calc(100% - 8px); opacity: 0; }
    }

    .capability-feed {
      position: relative;
      top: auto;
      left: auto;
      right: auto;
      width: 100%;
      max-width: 200px;
      margin-top: var(--space-3);
    }

    .spawner-feed {
      order: 1;
    }

    .mind-feed {
      order: 2;
    }

    .claude-node {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .claude-node .node-icon {
      order: 0;
    }

    .claude-node .node-label {
      order: 3;
    }

    .capabilities-demo {
      grid-template-columns: 1fr;
    }

    .flow-result {
      text-align: center;
    }

    /* Story Stage Mobile */
    .story-stage {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto auto;
      gap: var(--space-3);
      height: auto;
    }

    .chat-stage {
      grid-column: 1 / -1;
      grid-row: 1;
      height: 350px;
    }

    .side-panel {
      max-height: 120px;
    }

    .mind-panel,
    .spawner-panel {
      padding: var(--space-3);
    }

    .panel-actions {
      min-height: 50px;
    }

    .panel-action {
      font-size: 10px;
    }

    /* Timeline mobile */
    .timeline-rail {
      flex-wrap: wrap;
      gap: var(--space-2);
      padding: var(--space-3) 0;
    }

    .timeline-connector {
      width: 30px;
      margin: 0 var(--space-1);
      margin-bottom: var(--space-5);
    }

    .timeline-node .node-label {
      font-size: 9px;
    }

    .node-dot {
      width: 20px;
      height: 20px;
    }

    /* Chat messages mobile */
    .chat-messages {
      padding: var(--space-3);
    }

    .chat-message {
      max-width: 95%;
    }

    .message-text {
      font-size: var(--text-xs);
      padding: var(--space-2);
    }

    .message-code {
      font-size: 10px;
      padding: var(--space-2);
    }

    .message-badge {
      width: 20px;
      height: 20px;
    }

    .quickstart-section {
      padding: var(--space-8) var(--space-4);
    }

    .prompts-section {
      padding: var(--space-8) var(--space-4);
    }

    .prompts-grid {
      grid-template-columns: 1fr;
    }

    .section-headline {
      font-size: var(--text-2xl);
    }
  }
</style>
