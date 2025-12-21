<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import Icon from '$lib/components/Icon.svelte';

  // Tool explorer state
  let selectedTool = $state('spawner_plan');

  const tools: Record<string, {
    name: string;
    category: string;
    desc: string;
    output: string;
    explain: {
      what: string;
      auto: boolean;
      autoWhen: string | null;
      manual: string;
    };
    optional?: boolean;
  }> = {
    spawner_plan: {
      name: 'spawner_plan',
      category: 'project',
      desc: 'Plan and create new projects',
      output: `> spawner_plan("marketplace for vintage watches")

## Discovery Phase
Detected skill level: builder
Project type: marketplace

## Questions (max 3)
1. What's your primary revenue model?
2. Do you need seller verification?
3. Any specific payment requirements?

## Recommendation
Template: marketplace
Stack: Next.js + Supabase + Stripe + Algolia
Skills: supabase-auth, stripe-payments, search-indexing`,
      explain: {
        what: "Guides you from idea to scaffolded project. Detects your skill level, asks clarifying questions, then recommends template, stack, and skills.",
        auto: false,
        autoWhen: null,
        manual: "Say 'I want to build...' and Spawner takes over"
      }
    },
    spawner_analyze: {
      name: 'spawner_analyze',
      category: 'project',
      desc: 'Analyze existing codebase',
      output: `> spawner_analyze()

## Detected Stack
- Framework: Next.js 14 (App Router)
- Database: Supabase
- Auth: Not detected
- Payments: Not detected
- Styling: Tailwind CSS

## Missing Pieces
- No authentication setup
- No payment integration

## Recommended Skills
- supabase-auth (high priority)
- stripe-payments
- nextjs-patterns`,
      explain: {
        what: "Scans your codebase to detect technologies from package.json, file patterns, and imports. Identifies gaps and recommends skills.",
        auto: false,
        autoWhen: null,
        manual: "Ask Claude to analyze your project when joining an existing codebase"
      }
    },
    spawner_load: {
      name: 'spawner_load',
      category: 'project',
      desc: 'Load project context and skills',
      output: `> spawner_load("vintage-watches")

## Project Context
Last session: 2 days ago
Decisions: 12 saved
Issues: 3 tracked

## Active Skills
- marketplace-core
- stripe-payments
- supabase-auth

## Continue From
Last: implementing seller dashboard`,
      explain: {
        what: "Loads project context and relevant skills for your session. Restores memory from previous sessions so Claude remembers your project.",
        auto: true,
        autoWhen: "Called automatically when you start working on a known project",
        manual: "Load explicitly when switching between projects"
      }
    },
    spawner_remember: {
      name: 'spawner_remember',
      category: 'project',
      desc: 'Save decisions and progress',
      output: `> spawner_remember({
  type: "decision",
  content: "Using Stripe Connect for marketplace payouts"
})

{
  "success": true,
  "saved": "decision",
  "project": "vintage-watches",
  "persisted": true
}`,
      explain: {
        what: "Saves decisions, issues, and session progress. Persists context for future sessions so Claude remembers why you made choices.",
        auto: true,
        autoWhen: "Claude saves important decisions as you work",
        manual: "Explicitly save something you want remembered"
      }
    },
    spawner_templates: {
      name: 'spawner_templates',
      category: 'project',
      desc: 'List available templates',
      output: `## Available Templates

saas
  Subscription products and dashboards
  Stack: Next.js, Supabase, Stripe, Tailwind

marketplace
  Buy/sell platforms with search
  Stack: Next.js, Supabase, Stripe, Algolia

ai-app
  LLM-powered applications
  Stack: Next.js, Supabase, OpenAI

web3
  Blockchain applications
  Stack: Next.js, wagmi, viem

tool
  CLIs and utilities
  Stack: TypeScript, Node.js`,
      explain: {
        what: "Lists all available project templates with their default stack, skills, and use cases.",
        auto: false,
        autoWhen: null,
        manual: "Ask 'What templates are available?' to see options"
      }
    },
    spawner_watch_out: {
      name: 'spawner_watch_out',
      category: 'guidance',
      desc: 'Query gotchas for your stack',
      output: `> spawner_watch_out("Supabase RLS")

## Sharp Edges Found

[critical] RLS policies don't apply to service role
  Why: Service key bypasses all RLS
  Fix: Never expose service key to client

[warning] RLS on joined tables
  Why: Each table needs its own policy
  Fix: Test queries with anon role

[info] RLS performance on large tables
  Why: Complex policies can slow queries
  Fix: Add indexes for policy columns`,
      explain: {
        what: "Returns specific gotchas with severity, why they hurt, and how to avoid them. Like a senior dev warning you before you hit issues.",
        auto: false,
        autoWhen: null,
        manual: "Ask before implementing auth, payments, file upload, or any tricky feature"
      }
    },
    spawner_unstick: {
      name: 'spawner_unstick',
      category: 'guidance',
      desc: 'Get help when stuck',
      output: `> spawner_unstick({
  problem: "Auth redirect loop",
  tried: ["checking cookies", "clearing cache"]
})

## Alternative Approaches

1. Check middleware matcher patterns
   Likelihood: High
   Often misconfigured for auth routes

2. Verify callback URL in provider
   Likelihood: High
   Must match exactly including protocol

3. Session cookie domain mismatch
   Likelihood: Medium
   Check if localhost vs 127.0.0.1`,
      explain: {
        what: "Analyzes what you've tried and generates 3-5 alternative approaches you haven't considered, ordered by likelihood of success.",
        auto: false,
        autoWhen: null,
        manual: "Say 'I've been stuck on X for Y hours' and describe what you tried"
      }
    },
    spawner_validate: {
      name: 'spawner_validate',
      category: 'guidance',
      desc: 'Run guardrail checks on code',
      output: `> spawner_validate(code)

## Validation Results

[fail] Hardcoded API key detected
  Line 15: const key = "sk_live_..."
  Fix: Use environment variable

[fail] SQL injection vulnerability
  Line 42: query(\`SELECT * WHERE id=\${id}\`)
  Fix: Use parameterized query

[pass] No client-side secrets
[pass] Proper error handling`,
      explain: {
        what: "Runs guardrail checks on your code. Catches security issues, anti-patterns, and production problems before they ship.",
        auto: true,
        autoWhen: "Runs automatically on code changes in known risk areas",
        manual: "Ask Claude to validate code before committing"
      }
    },
    spawner_skills: {
      name: 'spawner_skills',
      category: 'guidance',
      desc: 'Search and load skills',
      output: `> spawner_skills({ action: "search", query: "auth" })

## Found 4 Skills

supabase-auth (95% match)
  Full auth implementation with Supabase
  Includes: RLS, social login, session handling

nextjs-auth (82% match)
  Auth patterns for Next.js App Router
  Includes: middleware, protected routes

clerk-integration (75% match)
  Clerk authentication setup
  Includes: webhooks, user sync

auth-patterns (70% match)
  General authentication patterns
  Includes: JWT, sessions, refresh tokens`,
      explain: {
        what: "Search, list, and load skills and squads. Skills are specialist knowledge for specific domains loaded on demand.",
        auto: false,
        autoWhen: null,
        manual: "Ask 'What skills do you have for X?' or 'Load the auth squad'"
      }
    },
    spawner_skill_brainstorm: {
      name: 'spawner_skill_brainstorm',
      category: 'creation',
      desc: 'Deep skill exploration',
      output: `> spawner_skill_brainstorm("e-commerce")

## Expert Panel
- Shopify theme developer
- Stripe integration specialist
- Inventory management architect

## Key Domains
- Product catalog management
- Cart and checkout flow
- Order fulfillment
- Returns and refunds

## Common Pitfalls
- Stock synchronization race conditions
- Tax calculation complexity
- Payment failure handling`,
      explain: {
        what: "Optional deep exploration before creating a skill. Names experts, defines boundaries, and walks through common pitfalls.",
        auto: false,
        autoWhen: null,
        manual: "Use when creating a complex skill and want thorough exploration first"
      },
      optional: true
    },
    spawner_skill_research: {
      name: 'spawner_skill_research',
      category: 'creation',
      desc: 'Research phase for skill creation',
      output: `> spawner_skill_research("redis-caching")

## Pain Points Found
- Cache invalidation strategies
- Connection pooling in serverless
- Serialization overhead

## Expert Content
- Redis best practices (official docs)
- Upstash serverless patterns
- Cache-aside vs write-through

## Ecosystem
- ioredis, redis, @upstash/redis
- Related: bull, bullmq (queues)`,
      explain: {
        what: "Research phase that gathers pain points, expert content, and ecosystem mapping before creating a skill.",
        auto: false,
        autoWhen: null,
        manual: "Run after brainstorm (or directly) to gather research for skill creation"
      }
    },
    spawner_skill_new: {
      name: 'spawner_skill_new',
      category: 'creation',
      desc: 'Generate skill YAML files',
      output: `> spawner_skill_new("redis-caching", research)

## Generated Files

skill.yaml
  Identity, patterns, anti-patterns, handoffs
  Quality: World-class template applied

sharp-edges.yaml
  12 gotchas with detection patterns
  Severity: 2 critical, 5 warning, 5 info

validations.yaml
  10 automated code checks
  Coverage: connections, serialization, TTL

collaboration.yaml
  Prerequisites, triggers, cross-domain insights`,
      explain: {
        what: "Generates all 4 YAML files for a world-class skill using research and the quality template.",
        auto: false,
        autoWhen: null,
        manual: "Run after research to generate the actual skill files"
      }
    },
    spawner_skill_score: {
      name: 'spawner_skill_score',
      category: 'creation',
      desc: 'Score against quality rubric',
      output: `> spawner_skill_score("redis-caching")

## Quality Score: 87/100

Identity (22/25)
  Strong expert persona
  Clear boundaries
  -3: Handoffs could be more specific

Sharp Edges (24/25)
  12 edges with detection patterns
  Good severity distribution
  -1: Missing one common gotcha

Validations (21/25)
  10 checks implemented
  -4: Could add more edge cases

Collaboration (20/25)
  Prerequisites defined
  -5: Cross-domain insights sparse

Status: READY TO SHIP (>80)`,
      explain: {
        what: "Scores a skill against the 100-point quality rubric. Minimum 80 points required to ship.",
        auto: false,
        autoWhen: null,
        manual: "Run after creating a skill to check if it meets quality bar"
      }
    },
    spawner_skill_upgrade: {
      name: 'spawner_skill_upgrade',
      category: 'creation',
      desc: 'Enhance existing skills',
      output: `> spawner_skill_upgrade("redis-caching", focus="edges")

## Upgrade Applied

Added 3 new sharp edges:
- Connection timeout in Lambda cold starts
- Memory limits with large values
- Pub/sub reconnection handling

Updated detection patterns:
- More specific regex for timeouts
- Added code context matching

New score: 91/100 (+4)`,
      explain: {
        what: "Enhances existing skills with targeted improvements. Can focus on identity, edges, patterns, or collaboration.",
        auto: false,
        autoWhen: null,
        manual: "Run when a skill needs improvement in a specific area"
      }
    }
  };

  const categories = [
    { id: 'project', label: 'Project' },
    { id: 'guidance', label: 'Guidance' },
    { id: 'creation', label: 'Skill Creation' }
  ];

  // Syntax highlighter for terminal output
  function highlightOutput(text: string): string {
    // First escape HTML to prevent XSS
    let result = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    return result
      // Commands (> spawner_...)
      .replace(/^(&gt;)\s*(spawner_\w+\(.*?\))$/gm, '<span class="hl-command">$1 $2</span>')
      // Headers (## ...)
      .replace(/^(##\s+.*)$/gm, '<span class="hl-header">$1</span>')
      // Success indicators
      .replace(/\[pass\]/g, '<span class="hl-pass">[pass]</span>')
      .replace(/\[success\]/g, '<span class="hl-pass">[success]</span>')
      // Fail/Critical indicators
      .replace(/\[fail\]/g, '<span class="hl-fail">[fail]</span>')
      .replace(/\[critical\]/g, '<span class="hl-critical">[critical]</span>')
      // Warning indicators
      .replace(/\[warning\]/g, '<span class="hl-warning">[warning]</span>')
      // Info indicators
      .replace(/\[info\]/g, '<span class="hl-info">[info]</span>')
      // Boolean/special values (before other patterns)
      .replace(/:\s*(true|false|null)/g, ': <span class="hl-bool">$1</span>')
      // Keys in JSON-like output
      .replace(/&quot;(\w+)&quot;:/g, '<span class="hl-key">"$1"</span>:')
      .replace(/"(\w+)":/g, '<span class="hl-key">"$1"</span>:')
      // String values in JSON
      .replace(/:\s*&quot;([^&]+)&quot;/g, ': <span class="hl-string">"$1"</span>')
      .replace(/:\s*"([^"]+)"/g, ': <span class="hl-string">"$1"</span>')
      // Numbers with % or /
      .replace(/(\d+%|\d+\/\d+)/g, '<span class="hl-number">$1</span>')
      // Stack technologies (word boundaries)
      .replace(/\b(Next\.js|Supabase|Stripe|Algolia|Tailwind|OpenAI|wagmi|viem|TypeScript|Node\.js)\b/g, '<span class="hl-tech">$1</span>')
      // Likelihood indicators
      .replace(/Likelihood:\s*(High|Medium|Low)/g, 'Likelihood: <span class="hl-likelihood-$1">$1</span>')
      // Line numbers and references
      .replace(/Line\s+(\d+):/g, '<span class="hl-line">Line $1:</span>')
      // Status ready to ship
      .replace(/Status:\s*(READY TO SHIP[^<]*)/g, '<span class="hl-status">Status: $1</span>');
  }
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
  <section class="section tools-section">
    <div class="section-header">
      <span class="section-number">03</span>
      <h2>All 14 Tools</h2>
    </div>
    <div class="section-content">
      <p class="section-desc">Click a command to see what it does and use the commands in your IDEs. Auto commands automatically work, whereas manual ones need to be triggered by you. Try them in your IDE to get familiar with them.</p>

      <div class="tool-explorer">
        <div class="tool-list">
          {#each categories as cat}
            <div class="tool-category-section">
              <div class="tool-category-label">{cat.label}</div>
              {#each Object.entries(tools).filter(([_, t]) => t.category === cat.id) as [key, tool]}
                <button
                  class="tool-btn"
                  class:active={selectedTool === key}
                  onclick={() => selectedTool = key}
                >
                  <code>{tool.name}</code>
                  {#if tool.optional}
                    <span class="optional-badge">Optional</span>
                  {/if}
                  <span class="tool-desc">{tool.desc}</span>
                </button>
              {/each}
            </div>
          {/each}
        </div>
        <div class="tool-output-wrapper">
          <div class="tool-output">
            <div class="tool-output-header">
              <span class="tool-output-dot"></span>
              <span class="tool-output-dot"></span>
              <span class="tool-output-dot"></span>
              <span class="tool-output-title">{tools[selectedTool].name}</span>
            </div>
            <div class="tool-output-body">
              <pre>{@html highlightOutput(tools[selectedTool].output)}</pre>
            </div>
          </div>
          <div class="tool-explain">
            <div class="tool-explain-what">
              <p>{tools[selectedTool].explain.what}</p>
            </div>
            <div class="tool-explain-usage">
              {#if tools[selectedTool].explain.auto}
                <div class="usage-tag auto">
                  <span class="tag-label">Auto</span>
                  <span class="tag-desc">{tools[selectedTool].explain.autoWhen}</span>
                </div>
              {/if}
              <div class="usage-tag manual">
                <span class="tag-label">Manual</span>
                <span class="tag-desc">{tools[selectedTool].explain.manual}</span>
              </div>
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

  /* Tool Explorer */
  .tools-section {
    max-width: 1000px;
  }

  .tool-explorer {
    display: grid;
    grid-template-columns: 280px 1fr;
    gap: var(--space-4);
    align-items: stretch;
  }

  .tool-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .tool-category-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .tool-category-label {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: var(--space-1) 0;
  }

  .tool-btn {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: var(--space-2) var(--space-3);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    cursor: pointer;
    text-align: left;
    transition: all var(--transition-fast);
  }

  .tool-btn:hover {
    border-color: var(--green-dim);
  }

  .tool-btn.active {
    border-color: var(--green-dim);
    background: rgba(0, 196, 154, 0.1);
  }

  .tool-btn code {
    color: var(--green-dim);
    background: transparent;
    padding: 0;
    font-size: var(--text-sm);
  }

  .tool-btn .tool-desc {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    margin-top: 4px;
  }

  .tool-btn .optional-badge {
    font-family: var(--font-mono);
    font-size: 9px;
    font-weight: 600;
    color: #D97757;
    background: rgba(217, 119, 87, 0.1);
    padding: 2px 6px;
    text-transform: uppercase;
    align-self: flex-start;
    margin-top: 2px;
  }

  .tool-output-wrapper {
    display: flex;
    flex-direction: column;
  }

  .tool-output {
    background: #0d1117;
    border: 1px solid #30363d;
    border-bottom: none;
    display: flex;
    flex-direction: column;
    flex: 1;
    min-height: 0;
  }

  .tool-output-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    border-bottom: 1px solid #30363d;
    background: #161b22;
  }

  .tool-output-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  .tool-output-dot:nth-child(1) { background: #ff5f56; }
  .tool-output-dot:nth-child(2) { background: #ffbd2e; }
  .tool-output-dot:nth-child(3) { background: #27ca40; }

  .tool-output-title {
    margin-left: auto;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--green-dim);
    opacity: 0.8;
  }

  .tool-output-body {
    padding: var(--space-4);
    flex: 1;
    overflow: auto;
  }

  .tool-output-body pre {
    margin: 0;
    background: transparent;
    border: none;
    padding: 0;
    font-size: var(--text-sm);
    color: #c9d1d9;
    white-space: pre-wrap;
    line-height: 1.6;
  }

  /* Syntax highlighting */
  .tool-output-body :global(.hl-command) {
    color: #7ee787;
    font-weight: 600;
  }

  .tool-output-body :global(.hl-header) {
    color: #79c0ff;
    font-weight: 600;
  }

  .tool-output-body :global(.hl-pass) {
    color: #3fb950;
    font-weight: 600;
  }

  .tool-output-body :global(.hl-fail) {
    color: #f85149;
    font-weight: 600;
  }

  .tool-output-body :global(.hl-critical) {
    color: #f85149;
    font-weight: 700;
    background: rgba(248, 81, 73, 0.15);
    padding: 0 4px;
  }

  .tool-output-body :global(.hl-warning) {
    color: #d29922;
    font-weight: 600;
  }

  .tool-output-body :global(.hl-info) {
    color: #58a6ff;
  }

  .tool-output-body :global(.hl-key) {
    color: #79c0ff;
  }

  .tool-output-body :global(.hl-string) {
    color: #a5d6ff;
  }

  .tool-output-body :global(.hl-bool) {
    color: #ff7b72;
  }

  .tool-output-body :global(.hl-number) {
    color: #ffa657;
    font-weight: 600;
  }

  .tool-output-body :global(.hl-tech) {
    color: #d2a8ff;
  }

  .tool-output-body :global(.hl-skill) {
    color: #7ee787;
  }

  .tool-output-body :global(.hl-likelihood-High) {
    color: #3fb950;
    font-weight: 600;
  }

  .tool-output-body :global(.hl-likelihood-Medium) {
    color: #d29922;
    font-weight: 600;
  }

  .tool-output-body :global(.hl-likelihood-Low) {
    color: #8b949e;
  }

  .tool-output-body :global(.hl-line) {
    color: #ffa657;
  }

  .tool-output-body :global(.hl-status) {
    color: #3fb950;
    font-weight: 700;
  }

  .tool-explain {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-top: 1px dashed var(--border);
    padding: var(--space-4);
    flex-shrink: 0;
  }

  .tool-explain-what {
    margin-bottom: var(--space-3);
    padding-bottom: var(--space-3);
    border-bottom: 1px dashed var(--border);
  }

  .tool-explain-what p {
    font-size: var(--text-base);
    color: var(--text-primary);
    opacity: 0.93;
    line-height: 1.7;
    margin: 0;
  }

  .tool-explain-usage {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .usage-tag {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
  }

  .usage-tag .tag-label {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    text-transform: uppercase;
    padding: 2px 8px;
    border: 1px solid;
    flex-shrink: 0;
    min-width: 60px;
    text-align: center;
  }

  .usage-tag.auto .tag-label {
    color: var(--green-dim);
    border-color: var(--green-dim);
  }

  .usage-tag.manual .tag-label {
    color: var(--text-tertiary);
    border-color: var(--border);
  }

  .usage-tag .tag-desc {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: 1.6;
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

    .tool-explorer {
      grid-template-columns: 1fr;
    }

    .tool-output {
      min-height: 300px;
    }
  }
</style>
