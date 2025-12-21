<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import Icon from '$lib/components/Icon.svelte';

  // Track expanded skill
  let expandedSkill = $state<string | null>(null);

  function toggleSkill(skillId: string) {
    expandedSkill = expandedSkill === skillId ? null : skillId;
  }

  // Skill details data (sample of real YAML content)
  const skillDetails: Record<string, {
    patterns?: string[];
    antiPatterns?: string[];
    sharpEdges?: string[];
    validations?: string[];
    handoffs?: string[];
  }> = {
    'supabase-backend': {
      patterns: [
        'Basic RLS Policy — Enable RLS and create policies for authenticated access',
        'Public Read, Auth Write — Anyone can read, only authenticated users can write',
        'Server Action with Service Role — Use service role for admin operations',
        'Realtime with RLS — Set up realtime subscriptions that respect RLS',
        'Storage with RLS — Protect storage buckets with RLS policies'
      ],
      antiPatterns: [
        'Disabled RLS — Leaving RLS disabled on tables with user data',
        'Service Role on Client — Using SUPABASE_SERVICE_ROLE_KEY in client code',
        'Complex Policy Logic — Writing complex business logic in RLS policies',
        'Missing Index on Policy Column — RLS policy filters on non-indexed column',
        'Trusting Client Data — Using client-provided data in RLS decisions'
      ],
      sharpEdges: [
        'CRITICAL: Table has RLS disabled - completely exposed to anyone with anon key',
        'CRITICAL: Service role key exposed in client code bypasses ALL RLS',
        'HIGH: RLS enabled but no policies - table is completely inaccessible',
        'HIGH: RLS policy filters on non-indexed column - slow full table scans',
        'HIGH: Policy checks user_id but doesn\'t use auth.uid() - trusts client data',
        'MEDIUM: Realtime subscription receives all changes without proper RLS'
      ],
      validations: [
        'Service Role in Client Code — Detect SUPABASE_SERVICE_ROLE patterns',
        'Table Without RLS — Check for create table without enable row level security',
        'Hardcoded Supabase Key — Detect JWT tokens and sb-*.supabase.co URLs',
        'Query Without Select — Supabase .from() without .select() returns all columns',
        'Supabase Call Without Error Check — Must destructure { data, error }',
        'Realtime Subscription Without Cleanup — Memory leak risk'
      ],
      handoffs: [
        'authentication or auth login → nextjs-supabase-auth',
        'next.js or app router → nextjs-app-router',
        'edge function or serverless → supabase-edge-functions'
      ]
    },
    'nextjs-app-router': {
      patterns: [
        'Server Component by Default — Keep components server-side unless interactivity needed',
        'Client Component Boundary — Add "use client" only at the interactivity boundary',
        'Server Actions for Mutations — Use "use server" for data mutations',
        'Loading States — Use loading.tsx for Suspense boundaries',
        'Error Boundaries — Use error.tsx for error handling per route'
      ],
      antiPatterns: [
        'use client at Page Level — Making entire pages client components unnecessarily',
        'Fetching in Client Components — Data fetching should happen in Server Components',
        'Not Using Server Actions — Using API routes when Server Actions are simpler',
        'Ignoring Streaming — Not using Suspense for progressive loading'
      ],
      sharpEdges: [
        'CRITICAL: Using "use client" on layout.tsx makes ALL child pages client components',
        'HIGH: Importing server-only code in client components causes build failures',
        'HIGH: Using useState/useEffect in Server Components causes runtime errors',
        'MEDIUM: Not revalidating cache after mutations leads to stale data',
        'MEDIUM: Using cookies() or headers() in cached pages breaks caching'
      ],
      validations: [
        'Server Import in Client — Detect server-only imports in "use client" files',
        'Missing use server — Server Actions without "use server" directive',
        'useState in Server Component — React hooks in non-client components',
        'Direct Database in Client — Database calls outside server context'
      ],
      handoffs: [
        'database or supabase → supabase-backend',
        'authentication → nextjs-supabase-auth',
        'styling or tailwind → tailwind-ui'
      ]
    },
    'stripe-integration': {
      patterns: [
        'Webhook Verification — Always verify webhook signatures before processing',
        'Idempotency Keys — Use idempotency keys for payment creation',
        'Price Objects — Use Stripe Price objects, not inline amounts',
        'Customer Portal — Let Stripe handle subscription management UI'
      ],
      antiPatterns: [
        'Storing Card Details — Never store raw card numbers, use Stripe tokens',
        'Skipping Webhook Verification — Processing unverified webhook events',
        'Hardcoding Prices — Using inline amounts instead of Price objects',
        'Sync Checkout — Blocking UI while waiting for payment confirmation'
      ],
      sharpEdges: [
        'CRITICAL: Webhook endpoint without signature verification - payment fraud risk',
        'CRITICAL: Secret key in client code - full Stripe account access exposed',
        'HIGH: Not handling payment_intent.succeeded - orders never fulfilled',
        'HIGH: Missing idempotency - duplicate charges on retry',
        'MEDIUM: Not using test mode keys in development - real charges'
      ],
      validations: [
        'Stripe Secret in Client — Detect sk_live or sk_test in browser-accessible code',
        'Webhook Without Verification — constructEvent without signature check',
        'Missing Idempotency Key — create calls without idempotencyKey option',
        'Hardcoded Amount — amount: {number} instead of price reference'
      ],
      handoffs: [
        'database or users → supabase-backend',
        'frontend UI → nextjs-app-router',
        'email notifications → email-systems'
      ]
    },
    'typescript-strict': {
      patterns: [
        'Strict Mode — Enable all strict compiler options',
        'Discriminated Unions — Use type narrowing with literal types',
        'Branded Types — Create nominal types for type safety',
        'Exhaustive Checks — Use never for exhaustive switch statements'
      ],
      antiPatterns: [
        'Using any — Defeats the purpose of TypeScript',
        'Type Assertions Without Validation — as SomeType without runtime check',
        'Ignoring Errors — Using @ts-ignore without explanation',
        'Optional Chaining Overuse — Using ?. when value should exist'
      ],
      sharpEdges: [
        'HIGH: Using "any" silently disables type checking for entire call chain',
        'HIGH: Type assertion (as) bypasses compiler checks - can cause runtime crashes',
        'MEDIUM: Missing return type on async functions - Promise<any> inferred',
        'MEDIUM: Object spread loses type narrowing - need explicit type guards'
      ],
      validations: [
        'Any Type Usage — Detect : any or as any patterns',
        'Missing Return Types — Functions without explicit return type',
        'Type Assertion — Detect "as" casts without preceding type guard',
        '@ts-ignore Without Comment — Suppressing errors without explanation'
      ],
      handoffs: [
        'react patterns → react-patterns',
        'api design → api-design'
      ]
    },
    'cybersecurity': {
      patterns: [
        'Input Validation — Validate and sanitize all user input at boundaries',
        'Parameterized Queries — Use prepared statements for database queries',
        'HTTPS Everywhere — Enforce TLS for all connections',
        'Least Privilege — Grant minimum necessary permissions'
      ],
      antiPatterns: [
        'String Concatenation in Queries — SQL injection vulnerability',
        'Storing Plaintext Passwords — Use bcrypt or argon2',
        'Trusting Client Headers — X-Forwarded-For can be spoofed',
        'Exposing Stack Traces — Detailed errors leak implementation details'
      ],
      sharpEdges: [
        'CRITICAL: SQL string concatenation - injection attacks can dump entire database',
        'CRITICAL: eval() with user input - remote code execution',
        'CRITICAL: Missing CSRF protection - state-changing actions via GET',
        'HIGH: Hardcoded secrets in code - exposed in version control',
        'HIGH: Missing rate limiting - brute force and DDoS vulnerability'
      ],
      validations: [
        'SQL Injection Patterns — Detect string concatenation in queries',
        'Hardcoded Secrets — API keys, passwords in source code',
        'eval() Usage — Dynamic code execution patterns',
        'Missing Input Validation — Raw req.body usage without schema'
      ],
      handoffs: [
        'authentication → nextjs-supabase-auth',
        'database security → supabase-backend',
        'deployment → vercel-deployment'
      ]
    },
    'react-patterns': {
      patterns: [
        'Custom Hooks — Extract reusable logic into custom hooks',
        'Compound Components — Create flexible component APIs',
        'Render Props — Share logic between components',
        'Context for Global State — Avoid prop drilling with context'
      ],
      antiPatterns: [
        'Props Drilling — Passing props through many layers',
        'Inline Object Creation — Creating objects in render causes re-renders',
        'Missing Keys — Lists without stable unique keys',
        'useEffect for Derived State — Computing values that should be derived'
      ],
      sharpEdges: [
        'HIGH: Missing dependency array in useEffect - infinite re-render loop',
        'HIGH: Object/array as useEffect dependency - always triggers effect',
        'MEDIUM: useState for derived state - unnecessary re-renders',
        'MEDIUM: Mutating state directly - React won\'t detect changes'
      ],
      validations: [
        'Missing useEffect Dependencies — Empty array with referenced variables',
        'Object in Dependency Array — {} or [] in dependency array',
        'setState in useEffect Without Cleanup — Memory leak on unmount',
        'Direct State Mutation — state.push() or state.property = value'
      ],
      handoffs: [
        'styling → tailwind-ui',
        'state management → frontend',
        'typescript → typescript-strict'
      ]
    },
    'yc-playbook': {
      patterns: [
        'Talk to Users — 100 conversations before building features',
        'Launch Fast — Get something in users hands in weeks, not months',
        'Do Things That Don\'t Scale — Manual processes before automation',
        'Focus on One Metric — Choose one number and move it'
      ],
      antiPatterns: [
        'Building in Secret — Stealth mode prevents learning from users',
        'Premature Scaling — Optimizing before product-market fit',
        'Too Many Features — Building everything users ask for',
        'Ignoring Churn — Acquiring users without understanding why they leave'
      ],
      sharpEdges: [
        'HIGH: Building features without talking to users first',
        'HIGH: Measuring vanity metrics instead of engagement/retention',
        'MEDIUM: Spending on growth before retention is working',
        'MEDIUM: Hiring too fast before finding product-market fit'
      ],
      validations: [],
      handoffs: [
        'product strategy → product-strategy',
        'growth → growth-strategy',
        'burn rate → burn-rate-management'
      ]
    },
    'founder-mode': {
      patterns: [
        'Stay Close to the Work — Maintain deep involvement in key areas',
        'Skip-Level Meetings — Talk directly to ICs, not just managers',
        'Own the Details — Know the product better than anyone',
        'Move Fast on Decisions — Bias toward action over consensus'
      ],
      antiPatterns: [
        'Full Delegation Too Early — Handing off before you understand deeply',
        'Management by Metrics Only — Losing touch with qualitative reality',
        'Avoiding Conflict — Not giving hard feedback directly',
        'Building Empire — Hiring for headcount instead of outcomes'
      ],
      sharpEdges: [
        'HIGH: Delegating strategy before you understand the problem space',
        'MEDIUM: Trusting reports over direct observation',
        'MEDIUM: Letting process replace judgment'
      ],
      validations: [],
      handoffs: [
        'operating system → founder-operating-system',
        'team building → early-stage-hustle',
        'decision making → idea-maze'
      ]
    }
  };

  // Skill data organized by category
  const skillCategories = [
    {
      id: 'frameworks',
      name: 'Frameworks',
      description: 'Deep expertise in specific technology frameworks',
      icon: '&#128736;',
      skills: [
        { id: 'nextjs-app-router', name: 'Next.js App Router', description: 'Server Components, Client Components, Server Actions, App Router architecture' },
        { id: 'react-patterns', name: 'React Patterns', description: 'Component patterns, hooks, state management, performance optimization' },
        { id: 'supabase-backend', name: 'Supabase Backend', description: 'Database, auth, storage, realtime, Row Level Security' },
        { id: 'tailwind-ui', name: 'Tailwind UI', description: 'Utility-first CSS, component styling, responsive design' },
        { id: 'typescript-strict', name: 'TypeScript Strict', description: 'Type safety, strict mode, generics, utility types' }
      ]
    },
    {
      id: 'development',
      name: 'Development',
      description: 'Core software engineering skills',
      icon: '&#128187;',
      skills: [
        { id: 'frontend', name: 'Frontend', description: 'UI development, state management, component architecture' },
        { id: 'backend', name: 'Backend', description: 'API design, database operations, server architecture' },
        { id: 'devops', name: 'DevOps', description: 'CI/CD, infrastructure, deployment, monitoring' },
        { id: 'cybersecurity', name: 'Cybersecurity', description: 'Application security, authentication, OWASP, encryption' },
        { id: 'security', name: 'Security', description: 'Security engineering, threat modeling, secure coding' },
        { id: 'qa-engineering', name: 'QA Engineering', description: 'Testing strategies, automation, quality assurance' },
        { id: 'code-review', name: 'Code Review', description: 'Review practices, feedback, code quality standards' },
        { id: 'game-development', name: 'Game Development', description: 'Game engines, mechanics, performance optimization' },
        { id: 'ai-product', name: 'AI Product', description: 'LLM integration, prompting, AI-powered features' },
        { id: 'codebase-optimization', name: 'Codebase Optimization', description: 'Performance, refactoring, technical debt reduction' },
        { id: 'analytics-architecture', name: 'Analytics Architecture', description: 'Data pipelines, metrics, tracking, dashboards' },
        { id: 'technical-debt-strategy', name: 'Technical Debt Strategy', description: 'Debt prioritization, refactoring roadmaps' }
      ]
    },
    {
      id: 'integration',
      name: 'Integration',
      description: 'Connecting services and systems',
      icon: '&#128279;',
      skills: [
        { id: 'nextjs-supabase-auth', name: 'Next.js + Supabase Auth', description: 'Authentication flow, session management, SSR auth' },
        { id: 'stripe-integration', name: 'Stripe Integration', description: 'Payments, subscriptions, webhooks, checkout' },
        { id: 'vercel-deployment', name: 'Vercel Deployment', description: 'Deployment, environment variables, edge functions' },
        { id: 'email-systems', name: 'Email Systems', description: 'Transactional email, templates, deliverability' }
      ]
    },
    {
      id: 'design',
      name: 'Design',
      description: 'User experience and visual design',
      icon: '&#127912;',
      skills: [
        { id: 'ui-design', name: 'UI Design', description: 'Visual design, component systems, design tokens' },
        { id: 'ux-design', name: 'UX Design', description: 'User research, flows, wireframes, usability' },
        { id: 'branding', name: 'Branding', description: 'Brand identity, voice, visual language' },
        { id: 'landing-page-design', name: 'Landing Page Design', description: 'Conversion-focused design, hero sections, CTAs' }
      ]
    },
    {
      id: 'marketing',
      name: 'Marketing',
      description: 'Growth and customer acquisition',
      icon: '&#128226;',
      skills: [
        { id: 'copywriting', name: 'Copywriting', description: 'Persuasive writing, headlines, CTAs, conversion copy' },
        { id: 'content-strategy', name: 'Content Strategy', description: 'Content planning, audience, distribution' },
        { id: 'viral-marketing', name: 'Viral Marketing', description: 'Viral loops, referrals, growth hacking' },
        { id: 'seo', name: 'SEO', description: 'Search optimization, keywords, technical SEO' },
        { id: 'blog-writing', name: 'Blog Writing', description: 'Technical writing, thought leadership, content marketing' },
        { id: 'marketing-fundamentals', name: 'Marketing Fundamentals', description: 'Marketing basics, channels, metrics' },
        { id: 'marketing', name: 'Marketing', description: 'Full-stack marketing, campaigns, analytics' },
        { id: 'creative-communications', name: 'Creative Communications', description: 'Brand voice, messaging, creative direction' }
      ]
    },
    {
      id: 'product',
      name: 'Product',
      description: 'Product management and analytics',
      icon: '&#128230;',
      skills: [
        { id: 'product-management', name: 'Product Management', description: 'Roadmaps, prioritization, stakeholder management' },
        { id: 'analytics', name: 'Analytics', description: 'Metrics, dashboards, data-driven decisions' },
        { id: 'a-b-testing', name: 'A/B Testing', description: 'Experimentation, hypothesis testing, statistical significance' },
        { id: 'customer-success', name: 'Customer Success', description: 'Onboarding, retention, customer health' }
      ]
    },
    {
      id: 'strategy',
      name: 'Strategy',
      description: 'Business and product strategy',
      icon: '&#9813;',
      skills: [
        { id: 'product-strategy', name: 'Product Strategy', description: 'Vision, positioning, competitive analysis' },
        { id: 'growth-strategy', name: 'Growth Strategy', description: 'Growth models, channels, scaling' },
        { id: 'brand-positioning', name: 'Brand Positioning', description: 'Market positioning, differentiation, messaging' },
        { id: 'creative-strategy', name: 'Creative Strategy', description: 'Creative direction, campaign strategy' },
        { id: 'founder-character', name: 'Founder Character', description: 'Founder brand, authenticity, storytelling' },
        { id: 'founder-operating-system', name: 'Founder Operating System', description: 'Productivity, decision-making, focus' },
        { id: 'early-stage-hustle', name: 'Early Stage Hustle', description: 'Pre-product tactics, validation, scrappiness' },
        { id: 'idea-maze', name: 'Idea Maze', description: 'Problem exploration, market mapping, opportunity sizing' },
        { id: 'pivot-patterns', name: 'Pivot Patterns', description: 'When to pivot, how to pivot, pivot types' },
        { id: 'taste-and-craft', name: 'Taste and Craft', description: 'Quality standards, attention to detail, excellence' }
      ]
    },
    {
      id: 'startup',
      name: 'Startup',
      description: 'Startup-specific expertise',
      icon: '&#128640;',
      skills: [
        { id: 'yc-playbook', name: 'YC Playbook', description: 'Y Combinator tactics, launch, user feedback' },
        { id: 'founder-mode', name: 'Founder Mode', description: 'When to delegate vs. dive deep, staying close to work' },
        { id: 'burn-rate-management', name: 'Burn Rate Management', description: 'Runway, costs, financial planning' }
      ]
    },
    {
      id: 'pattern',
      name: 'Pattern',
      description: 'Cross-cutting patterns and practices',
      icon: '&#128200;',
      skills: [
        { id: 'code-architecture-review', name: 'Code Architecture Review', description: 'Architecture assessment, patterns, improvements' },
        { id: 'code-cleanup', name: 'Code Cleanup', description: 'Refactoring, dead code removal, consistency' },
        { id: 'mcp-product', name: 'MCP Product', description: 'Building MCP servers and tools' }
      ]
    },
    {
      id: 'communications',
      name: 'Communications',
      description: 'Developer and stakeholder communication',
      icon: '&#128172;',
      skills: [
        { id: 'dev-communications', name: 'Dev Communications', description: 'Technical writing, documentation, changelogs' }
      ]
    }
  ];

  // Calculate total skills
  const totalSkills = skillCategories.reduce((sum, cat) => sum + cat.skills.length, 0);
</script>

<Navbar />

<main class="skills-directory">
  <!-- Hero -->
  <section class="hero">
    <h1>Skills Directory</h1>
    <p class="hero-subtitle">{totalSkills} specialist skills that transform Claude into domain experts</p>
  </section>

  <!-- Philosophy Section -->
  <section class="philosophy">
    <div class="philosophy-content">
      <div class="philosophy-header">
        <span class="section-label">Our Philosophy</span>
        <h2>What Makes a Spawner Skill Different?</h2>
      </div>

      <div class="philosophy-grid">
        <div class="philosophy-card">
          <div class="card-icon">&#128161;</div>
          <h3>Battle-Tested, Not Theoretical</h3>
          <p>Every skill captures <strong>real experience</strong> from people who've shipped. Not documentation reworded - actual lessons learned from production systems, failed deployments, and 3 AM debugging sessions.</p>
        </div>

        <div class="philosophy-card">
          <div class="card-icon">&#9888;&#65039;</div>
          <h3>Sharp Edges First</h3>
          <p>We obsess over <strong>gotchas</strong>. Every skill has 8-12 specific pitfalls with detection patterns. Claude doesn't just know React - it knows that missing useEffect deps cause infinite loops and catches it in your code.</p>
        </div>

        <div class="philosophy-card">
          <div class="card-icon">&#9881;&#65039;</div>
          <h3>Machine-Actionable, Not Just Readable</h3>
          <p>Basic skills are markdown documentation. Spawner skills are <strong>YAML with detection patterns</strong>. The system can match situations, scan code, filter by severity, and trigger warnings proactively.</p>
        </div>

        <div class="philosophy-card">
          <div class="card-icon">&#129309;</div>
          <h3>Skills Work Together</h3>
          <p>Every skill knows its <strong>boundaries</strong>. When you're working on auth and hit a database question, the nextjs-supabase-auth skill hands off to supabase-backend. Seamless collaboration.</p>
        </div>

        <div class="philosophy-card">
          <div class="card-icon">&#10003;&#65039;</div>
          <h3>Automated Validations</h3>
          <p>Each skill includes <strong>8-12 automated checks</strong> that catch issues in real-time. Not suggestions - actual pattern matching that prevents bugs before they ship.</p>
        </div>

        <div class="philosophy-card">
          <div class="card-icon">&#128100;</div>
          <h3>Expert Identity</h3>
          <p>Skills have <strong>personality and opinions</strong>. A cybersecurity skill thinks like a security engineer who's responded to breaches. It has principles, patterns it follows, and anti-patterns it avoids.</p>
        </div>
      </div>

      <div class="philosophy-comparison">
        <div class="comparison-side basic">
          <h4>Basic AI Skills</h4>
          <ul>
            <li>Generic documentation</li>
            <li>Static advice</li>
            <li>No detection patterns</li>
            <li>Works in isolation</li>
            <li>Human-readable only</li>
          </ul>
        </div>
        <div class="comparison-vs">vs</div>
        <div class="comparison-side spawner">
          <h4>Spawner Skills</h4>
          <ul>
            <li>Battle-tested experience</li>
            <li>Proactive warnings</li>
            <li>Code scanning + detection</li>
            <li>Skill collaboration</li>
            <li>Machine-actionable YAML</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- Skills Directory -->
  <section class="directory">
    <div class="directory-header">
      <h2>All Skills</h2>
      <p class="directory-desc">Browse all {totalSkills} skills across {skillCategories.length} categories</p>
    </div>

    <div class="categories">
      {#each skillCategories as category}
        <div class="category" id={category.id}>
          <div class="category-header">
            <span class="category-icon">{@html category.icon}</span>
            <div class="category-info">
              <h3>{category.name}</h3>
              <p>{category.description}</p>
            </div>
            <span class="category-count">{category.skills.length}</span>
          </div>
          <div class="skills-grid">
            {#each category.skills as skill}
              <div class="skill-card" class:expanded={expandedSkill === skill.id} class:has-details={!!skillDetails[skill.id]}>
                <button class="skill-card-header" onclick={() => toggleSkill(skill.id)}>
                  <div class="skill-card-main">
                    <h4>{skill.name}</h4>
                    <p>{skill.description}</p>
                  </div>
                  <div class="skill-card-meta">
                    <span class="skill-id">{skill.id}</span>
                    {#if skillDetails[skill.id]}
                      <span class="expand-icon">{expandedSkill === skill.id ? '−' : '+'}</span>
                    {/if}
                  </div>
                </button>

                {#if expandedSkill === skill.id && skillDetails[skill.id]}
                  <div class="skill-details">
                    {#if skillDetails[skill.id].patterns?.length}
                      <div class="detail-section">
                        <h5>
                          <Icon name="check-circle" size={14} />
                          Patterns
                        </h5>
                        <ul>
                          {#each skillDetails[skill.id].patterns as pattern}
                            <li>{pattern}</li>
                          {/each}
                        </ul>
                      </div>
                    {/if}

                    {#if skillDetails[skill.id].antiPatterns?.length}
                      <div class="detail-section">
                        <h5>
                          <Icon name="x" size={14} />
                          Anti-Patterns
                        </h5>
                        <ul>
                          {#each skillDetails[skill.id].antiPatterns as antiPattern}
                            <li>{antiPattern}</li>
                          {/each}
                        </ul>
                      </div>
                    {/if}

                    {#if skillDetails[skill.id].sharpEdges?.length}
                      <div class="detail-section">
                        <h5>
                          <Icon name="alert-triangle" size={14} />
                          Sharp Edges
                        </h5>
                        <ul class="sharp-edges-list">
                          {#each skillDetails[skill.id].sharpEdges as edge}
                            <li class:critical={edge.startsWith('CRITICAL')} class:high={edge.startsWith('HIGH')} class:medium={edge.startsWith('MEDIUM')}>{edge}</li>
                          {/each}
                        </ul>
                      </div>
                    {/if}

                    {#if skillDetails[skill.id].validations?.length}
                      <div class="detail-section">
                        <h5>
                          <Icon name="shield" size={14} />
                          Validations
                        </h5>
                        <ul>
                          {#each skillDetails[skill.id].validations as validation}
                            <li>{validation}</li>
                          {/each}
                        </ul>
                      </div>
                    {/if}

                    {#if skillDetails[skill.id].handoffs?.length}
                      <div class="detail-section">
                        <h5>
                          <Icon name="git-branch" size={14} />
                          Handoffs
                        </h5>
                        <ul class="handoffs-list">
                          {#each skillDetails[skill.id].handoffs as handoff}
                            <li>{handoff}</li>
                          {/each}
                        </ul>
                      </div>
                    {/if}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/each}
    </div>
  </section>

  <!-- Four Pillars -->
  <section class="pillars">
    <div class="pillars-content">
      <h2>Skill Anatomy</h2>
      <p class="pillars-desc">Every world-class skill has four essential components</p>

      <div class="pillars-grid">
        <div class="pillar">
          <div class="pillar-header">
            <Icon name="file-text" size={20} />
            <span>skill.yaml</span>
          </div>
          <h4>Identity</h4>
          <p>WHO is this expert? Battle scars, principles, patterns they follow, anti-patterns they avoid.</p>
        </div>

        <div class="pillar">
          <div class="pillar-header">
            <Icon name="file-text" size={20} />
            <span>sharp-edges.yaml</span>
          </div>
          <h4>Sharp Edges</h4>
          <p>WHAT mistakes cause real pain? 8-12 gotchas with detection patterns and solutions.</p>
        </div>

        <div class="pillar">
          <div class="pillar-header">
            <Icon name="file-text" size={20} />
            <span>validations.yaml</span>
          </div>
          <h4>Validations</h4>
          <p>HOW do we catch problems? 8-12 automated checks that run against your code.</p>
        </div>

        <div class="pillar">
          <div class="pillar-header">
            <Icon name="file-text" size={20} />
            <span>collaboration.yaml</span>
          </div>
          <h4>Collaboration</h4>
          <p>HOW does this skill work with others? Prerequisites, handoffs, cross-domain insights.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="cta-section">
    <h2>Create Your Own Skills</h2>
    <p class="cta-desc">Use our automated pipeline to build world-class skills</p>
    <div class="cta-buttons">
      <a href="/skill-creation" class="btn btn-primary">Skill Creation Guide</a>
      <a href="/" class="btn btn-secondary">Get Started</a>
    </div>
  </section>

  <footer class="footer">
    <div class="footer-links">
      <a href="https://github.com/vibeforge1111/vibeship-spawner" target="_blank" rel="noopener">GitHub</a>
      <a href="/">Home</a>
      <a href="/how-it-works">How It Works</a>
      <a href="/skill-creation">Skill Creation</a>
    </div>
  </footer>
</main>

<style>
  .skills-directory {
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

  /* Philosophy Section */
  .philosophy {
    background: var(--bg-secondary);
    padding: var(--space-12) var(--space-6);
    border-bottom: 1px solid var(--border);
  }

  .philosophy-content {
    max-width: 1000px;
    margin: 0 auto;
  }

  .philosophy-header {
    text-align: center;
    margin-bottom: var(--space-8);
  }

  .section-label {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--green-dim);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    display: block;
    margin-bottom: var(--space-2);
  }

  .philosophy-header h2 {
    font-family: var(--font-serif);
    font-size: var(--text-2xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0;
  }

  .philosophy-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--space-4);
    margin-bottom: var(--space-8);
  }

  .philosophy-card {
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: var(--space-5);
  }

  .card-icon {
    font-size: var(--text-2xl);
    margin-bottom: var(--space-3);
  }

  .philosophy-card h3 {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--space-2);
  }

  .philosophy-card p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.6;
  }

  .philosophy-card strong {
    color: var(--green-dim);
  }

  /* Comparison */
  .philosophy-comparison {
    display: flex;
    align-items: stretch;
    gap: var(--space-4);
    padding: var(--space-6);
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 8px;
  }

  .comparison-side {
    flex: 1;
    padding: var(--space-4);
    border-radius: 6px;
  }

  .comparison-side.basic {
    background: rgba(255, 100, 100, 0.05);
    border: 1px solid rgba(255, 100, 100, 0.2);
  }

  .comparison-side.spawner {
    background: rgba(0, 196, 154, 0.05);
    border: 1px solid rgba(0, 196, 154, 0.3);
  }

  .comparison-side h4 {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    margin: 0 0 var(--space-3);
  }

  .comparison-side.basic h4 {
    color: #ff6666;
  }

  .comparison-side.spawner h4 {
    color: var(--green-dim);
  }

  .comparison-side ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .comparison-side li {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    padding: var(--space-1) 0;
    padding-left: var(--space-4);
    position: relative;
  }

  .comparison-side.basic li::before {
    content: 'x';
    position: absolute;
    left: 0;
    color: #ff6666;
    font-weight: 600;
  }

  .comparison-side.spawner li::before {
    content: '+';
    position: absolute;
    left: 0;
    color: var(--green-dim);
    font-weight: 600;
  }

  .comparison-vs {
    display: flex;
    align-items: center;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-tertiary);
    padding: 0 var(--space-2);
  }

  /* Directory Section */
  .directory {
    max-width: 1000px;
    margin: 0 auto;
    padding: var(--space-10) var(--space-6);
  }

  .directory-header {
    text-align: center;
    margin-bottom: var(--space-8);
  }

  .directory-header h2 {
    font-family: var(--font-serif);
    font-size: var(--text-2xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0 0 var(--space-2);
  }

  .directory-desc {
    font-size: var(--text-base);
    color: var(--text-secondary);
    margin: 0;
  }

  /* Categories */
  .categories {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
  }

  .category {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
  }

  .category-header {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-4) var(--space-5);
    background: var(--bg-tertiary);
    border-bottom: 1px solid var(--border);
  }

  .category-icon {
    font-size: var(--text-2xl);
  }

  .category-info {
    flex: 1;
  }

  .category-info h3 {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .category-info p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
  }

  .category-count {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--green-dim);
    background: rgba(0, 196, 154, 0.1);
    padding: var(--space-1) var(--space-2);
    border-radius: 4px;
  }

  .skills-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-3);
    padding: var(--space-4);
  }

  .skill-card.expanded {
    grid-column: 1 / -1;
  }

  .skill-card {
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 6px;
    transition: border-color 0.2s, box-shadow 0.2s;
    overflow: hidden;
  }

  .skill-card.has-details {
    cursor: pointer;
  }

  .skill-card.has-details:hover {
    border-color: var(--green-dim);
  }

  .skill-card.expanded {
    border-color: var(--green-dim);
    box-shadow: 0 0 0 1px var(--green-dim);
  }

  .skill-card-header {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--space-3);
    padding: var(--space-4);
    background: transparent;
    border: none;
    text-align: left;
    cursor: pointer;
    font-family: inherit;
  }

  .skill-card:not(.has-details) .skill-card-header {
    cursor: default;
  }

  .skill-card-main {
    flex: 1;
  }

  .skill-card-main h4 {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--space-2);
  }

  .skill-card-main p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
  }

  .skill-card-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: var(--space-1);
  }

  .skill-id {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--text-tertiary);
  }

  .expand-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--green-dim);
    background: rgba(0, 196, 154, 0.1);
    border-radius: 4px;
  }

  /* Skill Details - Expanded Content */
  .skill-details {
    border-top: 1px solid var(--border);
    padding: var(--space-4);
    background: var(--bg-secondary);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .detail-section h5 {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--space-2);
  }

  .detail-section h5 :global(svg) {
    color: var(--green-dim);
  }

  .detail-section ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .detail-section li {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    line-height: 1.4;
    padding-left: var(--space-4);
    position: relative;
  }

  .detail-section li::before {
    content: '•';
    position: absolute;
    left: 0;
    color: var(--text-tertiary);
  }

  /* Sharp Edges Severity Colors */
  .sharp-edges-list li.critical {
    color: #ff6b6b;
  }

  .sharp-edges-list li.critical::before {
    color: #ff6b6b;
  }

  .sharp-edges-list li.high {
    color: #ffa94d;
  }

  .sharp-edges-list li.high::before {
    color: #ffa94d;
  }

  .sharp-edges-list li.medium {
    color: #ffd43b;
  }

  .sharp-edges-list li.medium::before {
    color: #ffd43b;
  }

  /* Handoffs List */
  .handoffs-list li {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
  }

  /* Pillars Section */
  .pillars {
    background: var(--bg-secondary);
    padding: var(--space-12) var(--space-6);
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }

  .pillars-content {
    max-width: 900px;
    margin: 0 auto;
    text-align: center;
  }

  .pillars-content h2 {
    font-family: var(--font-serif);
    font-size: var(--text-2xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0 0 var(--space-2);
  }

  .pillars-desc {
    font-size: var(--text-base);
    color: var(--text-secondary);
    margin: 0 0 var(--space-8);
  }

  .pillars-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-4);
  }

  .pillar {
    background: var(--bg-primary);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: var(--space-4);
    text-align: left;
  }

  .pillar-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-3);
    color: var(--text-tertiary);
  }

  .pillar-header span {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
  }

  .pillar h4 {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--green-dim);
    margin: 0 0 var(--space-2);
  }

  .pillar p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.5;
  }

  /* CTA Section */
  .cta-section {
    text-align: center;
    padding: var(--space-12) var(--space-8);
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

    .philosophy {
      padding: var(--space-8) var(--space-4);
    }

    .philosophy-comparison {
      flex-direction: column;
    }

    .comparison-vs {
      padding: var(--space-2) 0;
      justify-content: center;
    }

    .directory {
      padding: var(--space-8) var(--space-4);
    }

    .category-header {
      flex-wrap: wrap;
    }

    .skills-grid {
      grid-template-columns: 1fr;
    }

    .skill-card-header {
      padding: var(--space-3);
    }

    .skill-details {
      padding: var(--space-3);
    }

    .detail-section li {
      font-size: var(--text-xs);
    }

    .detail-section h5 {
      font-size: var(--text-xs);
    }
  }
</style>
