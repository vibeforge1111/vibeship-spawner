<!-- web/src/routes/skills/+page.svelte -->
<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import SkillsSidebar from '$lib/components/SkillsSidebar.svelte';
  import SkillRow from '$lib/components/SkillRow.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { categories, allSkills, searchSkills, filterSkills } from '$lib/stores/skills';
  import type { SkillFilters } from '$lib/stores/skills';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  // State
  let activeSection = $state('overview');
  let activeCategory = $state<string | null>($page.url.searchParams.get('category') || null);
  let searchQuery = $state($page.url.searchParams.get('q') || '');
  let activeLayer = $state<1 | 2 | 3 | null>(null);
  let expandedTip = $state<number | null>(null);

  // Filter skills based on current state
  const filteredSkills = $derived(() => {
    let skills = searchQuery ? searchSkills(searchQuery) : allSkills;
    const filters: SkillFilters = {
      category: activeCategory || undefined,
      layer: activeLayer || undefined
    };
    return filterSkills(skills, filters);
  });

  // Group by category for display
  const groupedSkills = $derived(() => {
    if (activeCategory) {
      return [{
        id: activeCategory,
        name: categories.find(c => c.id === activeCategory)?.name || activeCategory,
        skills: filteredSkills()
      }];
    }

    const groups: Record<string, typeof filteredSkills extends () => infer T ? T : never> = {};
    filteredSkills().forEach(skill => {
      if (!groups[skill.category]) groups[skill.category] = [];
      groups[skill.category].push(skill);
    });

    return Object.entries(groups).map(([id, skills]) => ({
      id,
      name: categories.find(c => c.id === id)?.name || id,
      skills
    }));
  });

  // Quick tips data
  const quickTips = [
    {
      question: 'How do I load a skill?',
      answer: 'Use the spawner_skills tool with action "load" and the skill ID. Example: spawner_skills({ action: "load", skill: "typescript-patterns" })'
    },
    {
      question: 'What\'s the difference between patterns and sharp edges?',
      answer: 'Patterns are best practices to follow. Sharp edges are gotchas and pitfalls - specific issues Claude doesn\'t know by default, with detection patterns to catch them in your code.'
    },
    {
      question: 'Can I modify built-in skills?',
      answer: 'Yes! Copy any skill to your local skills folder, modify the YAML files, and your changes take precedence. Skills are designed to be customized.'
    }
  ];

  // Handlers
  function handleSectionChange(section: string) {
    activeSection = section;
    // Scroll to section
    const element = document.getElementById(`section-${section}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function handleCategoryChange(category: string | null) {
    activeCategory = category;
    activeSection = 'browse';
    updateUrl();
  }

  function handleSearchChange(query: string) {
    searchQuery = query;
    if (query) {
      activeSection = 'browse';
    }
    updateUrl();
  }

  function handleLayerFilter(layer: 1 | 2 | 3 | null) {
    activeLayer = activeLayer === layer ? null : layer;
  }

  function toggleTip(index: number) {
    expandedTip = expandedTip === index ? null : index;
  }

  function updateUrl() {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (activeCategory) params.set('category', activeCategory);
    const newUrl = params.toString() ? `/skills?${params}` : '/skills';
    goto(newUrl, { replaceState: true, noScroll: true });
  }
</script>

<Navbar />

<div class="skills-layout">
  <SkillsSidebar
    {activeSection}
    {activeCategory}
    {searchQuery}
    onSectionChange={handleSectionChange}
    onCategoryChange={handleCategoryChange}
    onSearchChange={handleSearchChange}
  />

  <main class="skills-content">
    <!-- Overview Section -->
    <section id="section-overview" class="content-section">
      <div class="overview-hero">
        <h1>A Team of World-Class Experts</h1>
        <p class="hero-subtitle">
          Each skill is a specialist agent with deep domain knowledge,
          working together through intelligent handoffs.
        </p>
      </div>

      <!-- Animated Workflow Terminal -->
      <div class="workflow-terminal">
        <div class="terminal-header">
          <div class="terminal-dots">
            <span class="dot red"></span>
            <span class="dot yellow"></span>
            <span class="dot green"></span>
          </div>
          <span class="terminal-title">skill-collaboration.flow</span>
        </div>

        <div class="terminal-body">
          <!-- The animated flow -->
          <div class="flow-pipeline">
            <!-- Stage 1: Input -->
            <div class="pipeline-stage">
              <div class="flow-node skill-node secondary">
                <div class="node-content">
                  <div class="skill-avatar">
                    <Icon name="folder" size={18} />
                  </div>
                  <span class="skill-name">Your Project</span>
                </div>
              </div>
            </div>

            <div class="flow-arrow">
              <Icon name="chevron-down" size={16} />
            </div>

            <!-- Stage 2: Product Lead -->
            <div class="pipeline-stage">
              <div class="stage-label">orchestration</div>
              <div class="flow-node skill-node primary">
                <div class="node-badge">Lead</div>
                <div class="node-content">
                  <div class="skill-avatar">
                    <Icon name="compass" size={18} />
                  </div>
                  <span class="skill-name">product-lead</span>
                </div>
                <div class="skill-files">
                  <span class="file-dot identity"></span>
                  <span class="file-dot edges"></span>
                  <span class="file-dot validations"></span>
                  <span class="file-dot collab"></span>
                </div>
              </div>
            </div>

            <div class="flow-arrow">
              <Icon name="chevrons-down" size={16} />
            </div>

            <!-- Stage 3: Development Team -->
            <div class="pipeline-stage wide">
              <div class="stage-label">development</div>
              <div class="stage-nodes">
                <div class="flow-node skill-node secondary">
                  <div class="node-content">
                    <div class="skill-avatar">
                      <Icon name="server" size={18} />
                    </div>
                    <span class="skill-name">backend</span>
                  </div>
                </div>

                <div class="flow-node skill-node secondary">
                  <div class="node-content">
                    <div class="skill-avatar">
                      <Icon name="monitor" size={18} />
                    </div>
                    <span class="skill-name">frontend</span>
                  </div>
                </div>

                <div class="flow-node skill-node secondary">
                  <div class="node-content">
                    <div class="skill-avatar">
                      <Icon name="database" size={18} />
                    </div>
                    <span class="skill-name">database</span>
                  </div>
                </div>

                <div class="flow-node skill-node secondary">
                  <div class="node-content">
                    <div class="skill-avatar">
                      <Icon name="git-branch" size={18} />
                    </div>
                    <span class="skill-name">devops</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="flow-arrow">
              <Icon name="chevrons-down" size={16} />
            </div>

            <!-- Stage 4: Review Team -->
            <div class="pipeline-stage wide">
              <div class="stage-label">review</div>
              <div class="stage-nodes">
                <div class="flow-node skill-node review">
                  <div class="node-content">
                    <div class="skill-avatar">
                      <Icon name="clipboard-check" size={18} />
                    </div>
                    <span class="skill-name">qa</span>
                  </div>
                </div>

                <div class="flow-node skill-node review">
                  <div class="node-content">
                    <div class="skill-avatar">
                      <Icon name="file-search" size={18} />
                    </div>
                    <span class="skill-name">code-review</span>
                  </div>
                </div>

                <div class="flow-node skill-node review">
                  <div class="node-content">
                    <div class="skill-avatar">
                      <Icon name="shield" size={18} />
                    </div>
                    <span class="skill-name">security</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="flow-arrow">
              <Icon name="chevron-down" size={16} />
            </div>

            <!-- Stage 5: Production -->
            <div class="pipeline-stage">
              <div class="flow-node skill-node production">
                <div class="node-content">
                  <div class="skill-avatar">
                    <Icon name="rocket" size={18} />
                  </div>
                  <span class="skill-name">Production</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Live log output -->
          <div class="flow-log">
            <div class="log-line">
              <span class="log-time">00:01</span>
              <span class="log-skill lead">product-lead</span>
              <span class="log-msg">Breaking down feature requirements...</span>
            </div>
            <div class="log-line">
              <span class="log-time">00:02</span>
              <span class="log-skill handoff">→ backend, frontend</span>
              <span class="log-msg">Delegating implementation tasks</span>
            </div>
            <div class="log-line">
              <span class="log-time">00:03</span>
              <span class="log-skill">backend</span>
              <span class="log-msg">Building API endpoints...</span>
            </div>
            <div class="log-line">
              <span class="log-time">00:04</span>
              <span class="log-skill edge">database</span>
              <span class="log-msg">Sharp edge: Missing index on user_id</span>
            </div>
            <div class="log-line">
              <span class="log-time">00:05</span>
              <span class="log-skill review">qa</span>
              <span class="log-msg">Running test suite... 47/47 passed</span>
            </div>
            <div class="log-line">
              <span class="log-time">00:06</span>
              <span class="log-skill review">security</span>
              <span class="log-msg">Audit complete. No vulnerabilities.</span>
            </div>
            <div class="log-line typing">
              <span class="log-time">00:07</span>
              <span class="log-skill success">deploy</span>
              <span class="log-msg">Pushing to production<span class="cursor">_</span></span>
            </div>
          </div>
        </div>
      </div>

      <!-- What makes a skill -->
      <div class="skill-anatomy">
        <h3>Each Skill Contains</h3>
        <div class="anatomy-grid">
          <div class="anatomy-item">
            <span class="anatomy-dot identity"></span>
            <div class="anatomy-content">
              <span class="anatomy-file">skill.yaml</span>
              <span class="anatomy-desc">Identity & patterns</span>
            </div>
          </div>
          <div class="anatomy-item">
            <span class="anatomy-dot edges"></span>
            <div class="anatomy-content">
              <span class="anatomy-file">sharp-edges.yaml</span>
              <span class="anatomy-desc">8-12 gotchas to catch</span>
            </div>
          </div>
          <div class="anatomy-item">
            <span class="anatomy-dot validations"></span>
            <div class="anatomy-content">
              <span class="anatomy-file">validations.yaml</span>
              <span class="anatomy-desc">Automated code checks</span>
            </div>
          </div>
          <div class="anatomy-item">
            <span class="anatomy-dot collab"></span>
            <div class="anatomy-content">
              <span class="anatomy-file">collaboration.yaml</span>
              <span class="anatomy-desc">Handoffs & delegation</span>
            </div>
          </div>
        </div>
      </div>

      <div class="stats-bar">
        <div class="stat">
          <span class="stat-value">{allSkills.length}</span>
          <span class="stat-label">Skills</span>
        </div>
        <div class="stat">
          <span class="stat-value">8-12</span>
          <span class="stat-label">Sharp Edges Each</span>
        </div>
        <div class="stat">
          <span class="stat-value">80+</span>
          <span class="stat-label">Quality Score</span>
        </div>
      </div>
    </section>

    <!-- Browse Skills Section -->
    <section id="section-browse" class="content-section">
      <div class="section-header">
        <h2>Browse Skills</h2>
        <div class="layer-filters">
          <button
            class="layer-pill"
            class:active={activeLayer === null}
            onclick={() => handleLayerFilter(null)}
          >All</button>
          <button
            class="layer-pill"
            class:active={activeLayer === 1}
            onclick={() => handleLayerFilter(1)}
          >Core</button>
          <button
            class="layer-pill"
            class:active={activeLayer === 2}
            onclick={() => handleLayerFilter(2)}
          >Integration</button>
          <button
            class="layer-pill"
            class:active={activeLayer === 3}
            onclick={() => handleLayerFilter(3)}
          >Polish</button>
        </div>
      </div>

      {#if filteredSkills().length === 0}
        <div class="no-results">
          <Icon name="search" size={32} />
          <h3>No skills found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      {:else}
        {#each groupedSkills() as group}
          <div class="category-group" id="category-{group.id}">
            <div class="category-header">
              <h3>{group.name}</h3>
              <span class="category-count">{group.skills.length}</span>
            </div>
            <div class="skills-list">
              {#each group.skills as skill}
                <SkillRow {skill} />
              {/each}
            </div>
          </div>
        {/each}
      {/if}
    </section>

    <!-- Guides Section -->
    <section id="section-guides" class="content-section">
      <h2>Guides</h2>

      <div class="guides-grid">
        <a href="/skills/guides/getting-started" class="guide-card">
          <div class="guide-icon">
            <Icon name="book-open" size={24} />
          </div>
          <h3>Getting Started</h3>
          <p>Load your first skill, see it catch issues in your code.</p>
          <span class="guide-link">Read guide <Icon name="arrow-right" size={14} /></span>
        </a>

        <a href="/skills/guides/spawner-creation" class="guide-card">
          <div class="guide-icon">
            <Icon name="wrench" size={24} />
          </div>
          <h3>Creating Skills with Spawner</h3>
          <p>Use MCP tools to generate quality skills automatically.</p>
          <span class="guide-link">Read guide <Icon name="arrow-right" size={14} /></span>
        </a>

        <a href="/skills/guides/skills-mind" class="guide-card">
          <div class="guide-icon">
            <Icon name="brain" size={24} />
          </div>
          <h3>Skills + Mind Memory</h3>
          <p>Persistent context across sessions. Skills remember your project.</p>
          <span class="guide-link">Read guide <Icon name="arrow-right" size={14} /></span>
        </a>
      </div>

      <div class="quick-tips">
        <h3>Quick Tips</h3>
        {#each quickTips as tip, i}
          <div class="tip-item">
            <button class="tip-question" onclick={() => toggleTip(i)}>
              <Icon name={expandedTip === i ? 'chevron-up' : 'chevron-down'} size={16} />
              <span>{tip.question}</span>
            </button>
            {#if expandedTip === i}
              <div class="tip-answer">
                <p>{tip.answer}</p>
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </section>

    <!-- Create Skills Section -->
    <section id="section-create" class="content-section">
      <h2>Create Your Own Skills</h2>

      <div class="create-cta">
        <div class="cta-icon">
          <Icon name="file-plus" size={32} />
        </div>
        <div class="cta-content">
          <h3>Build Custom Skills</h3>
          <p>Don't see what you need? Create skills locally with our step-by-step guide.</p>
          <a href="/skills/create" class="cta-btn">
            Learn to Create Skills
            <Icon name="arrow-right" size={16} />
          </a>
        </div>
      </div>
    </section>

    <!-- Resources Section -->
    <section id="section-resources" class="content-section">
      <h2>Resources</h2>

      <div class="resources-list">
        <div class="resource-group">
          <h3>External</h3>
          <a href="https://code.claude.com/docs/en/skills" target="_blank" rel="noopener" class="resource-link">
            <Icon name="external-link" size={16} />
            <span>Claude Code Skills Documentation</span>
          </a>
        </div>

        <div class="resource-group">
          <h3>Related</h3>
          <a href="/" class="resource-link">
            <Icon name="zap" size={16} />
            <span>Spawner MCP Tools</span>
          </a>
          <a href="https://mind.vibeship.co" target="_blank" rel="noopener" class="resource-link">
            <Icon name="brain" size={16} />
            <span>Mind - Memory Layer</span>
          </a>
        </div>
      </div>
    </section>
  </main>
</div>

<Footer />

<style>
  .skills-layout {
    display: flex;
    min-height: calc(100vh - 52px);
  }

  .skills-content {
    flex: 1;
    padding: var(--space-8) var(--space-6);
    max-width: 900px;
  }

  .content-section {
    margin-bottom: var(--space-12);
    scroll-margin-top: 80px;
  }

  /* Overview Section */
  .overview-hero {
    margin-bottom: var(--space-8);
  }

  .overview-hero h1 {
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
    max-width: 600px;
  }

  /* Workflow Terminal */
  .workflow-terminal {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    margin-bottom: var(--space-6);
    overflow: hidden;
  }

  .terminal-header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid var(--border);
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

  .dot.red { background: #ff5f57; }
  .dot.yellow { background: #febc2e; }
  .dot.green { background: #28c840; }

  .terminal-title {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--text-tertiary);
  }

  .terminal-body {
    padding: var(--space-6);
  }

  /* Flow Pipeline */
  .flow-pipeline {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-6);
  }

  .pipeline-stage {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    position: relative;
  }

  .pipeline-stage.wide {
    width: 100%;
  }

  .stage-label {
    font-family: var(--font-mono);
    font-size: 9px;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .stage-nodes {
    display: flex;
    justify-content: center;
    gap: var(--space-3);
    flex-wrap: wrap;
  }

  /* Flow Arrows - Simple chevron icons */
  .flow-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-tertiary);
    animation: arrow-pulse 2s ease-in-out infinite;
  }

  .flow-arrow.success {
    color: #22c55e;
  }

  @keyframes arrow-pulse {
    0%, 100% { opacity: 0.4; transform: translateY(0); }
    50% { opacity: 1; transform: translateY(2px); }
  }

  /* Flow Nodes */
  .flow-node {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: var(--space-3) var(--space-4);
    background: var(--bg-primary);
    border: 1px solid var(--text-tertiary);
    position: relative;
    min-width: 90px;
    min-height: 70px;
  }

  .flow-node.input-node,
  .flow-node.output-node {
    background: var(--bg-primary);
    border: 1px solid var(--border);
    min-width: 120px;
  }

  .flow-node.skill-node.primary {
    border-color: var(--green-dim);
    box-shadow: 0 0 20px rgba(0, 196, 154, 0.1);
    min-width: 130px;
  }

  .flow-node.skill-node.secondary,
  .flow-node.skill-node.review {
    min-width: 90px;
    min-height: 70px;
  }

  .flow-node.skill-node.review {
    border-color: #3b82f6;
  }

  .flow-node.skill-node.review .skill-avatar {
    color: #3b82f6;
  }

  .flow-node.skill-node.production {
    border-color: #22c55e;
    border-width: 2px;
  }

  .flow-node.skill-node.production .skill-avatar {
    color: #22c55e;
  }

  .node-badge {
    position: absolute;
    top: -8px;
    left: 50%;
    transform: translateX(-50%);
    padding: 2px 8px;
    background: var(--green-dim);
    color: var(--bg-primary);
    font-family: var(--font-mono);
    font-size: 9px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .node-icon {
    color: var(--text-tertiary);
  }

  .node-label {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--text-tertiary);
  }

  .node-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .skill-avatar {
    color: var(--green-dim);
  }

  .skill-name {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-primary);
  }

  .skill-files {
    display: flex;
    gap: 4px;
    margin-top: var(--space-1);
  }

  .file-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .file-dot.identity { background: var(--green-dim); }
  .file-dot.edges { background: #f59e0b; }
  .file-dot.validations { background: #3b82f6; }
  .file-dot.collab { background: #a855f7; }

  /* Flow Log */
  .flow-log {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid var(--border);
    padding: var(--space-3);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
  }

  .log-line {
    display: flex;
    gap: var(--space-3);
    padding: var(--space-1) 0;
    opacity: 0;
    animation: log-appear 0.3s ease-out forwards;
  }

  .log-line:nth-child(1) { animation-delay: 0.5s; }
  .log-line:nth-child(2) { animation-delay: 1.2s; }
  .log-line:nth-child(3) { animation-delay: 1.9s; }
  .log-line:nth-child(4) { animation-delay: 2.6s; }
  .log-line:nth-child(5) { animation-delay: 3.3s; }
  .log-line:nth-child(6) { animation-delay: 4.0s; }
  .log-line:nth-child(7) { animation-delay: 4.7s; }

  @keyframes log-appear {
    from { opacity: 0; transform: translateY(5px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .log-time {
    color: var(--text-tertiary);
    min-width: 35px;
  }

  .log-skill {
    color: var(--text-primary);
    min-width: 120px;
  }

  .log-skill.lead {
    font-weight: 600;
  }

  .log-msg {
    color: var(--text-secondary);
  }

  .log-line.typing .cursor {
    animation: blink 0.8s step-end infinite;
  }

  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  /* Skill Anatomy */
  .skill-anatomy {
    margin-bottom: var(--space-6);
  }

  .skill-anatomy h3 {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin: 0 0 var(--space-3);
  }

  .anatomy-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: var(--space-3);
  }

  .anatomy-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
  }

  .anatomy-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .anatomy-dot.identity { background: var(--green-dim); }
  .anatomy-dot.edges { background: #f59e0b; }
  .anatomy-dot.validations { background: #3b82f6; }
  .anatomy-dot.collab { background: #a855f7; }

  .anatomy-content {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .anatomy-file {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-primary);
  }

  .anatomy-desc {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--text-tertiary);
  }

  .stats-bar {
    display: flex;
    gap: var(--space-8);
    padding: var(--space-4) 0;
    border-top: 1px solid var(--border);
    border-bottom: 1px solid var(--border);
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .stat-value {
    font-family: var(--font-mono);
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--green-dim);
  }

  .stat-label {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  /* Browse Section */
  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-4);
    margin-bottom: var(--space-6);
    flex-wrap: wrap;
  }

  .content-section h2 {
    font-family: var(--font-serif);
    font-size: var(--text-2xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0;
  }

  .layer-filters {
    display: flex;
    gap: var(--space-2);
  }

  .layer-pill {
    padding: var(--space-1) var(--space-3);
    background: transparent;
    border: 1px solid var(--border);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .layer-pill:hover {
    border-color: var(--green-dim);
    color: var(--text-primary);
  }

  .layer-pill.active {
    border-color: var(--green-dim);
    background: rgba(0, 196, 154, 0.1);
    color: var(--green-dim);
  }

  .no-results {
    text-align: center;
    padding: var(--space-12);
    color: var(--text-tertiary);
  }

  .no-results h3 {
    margin: var(--space-4) 0 var(--space-2);
    color: var(--text-secondary);
  }

  .category-group {
    margin-bottom: var(--space-8);
  }

  .category-header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-4);
    padding-bottom: var(--space-2);
    border-bottom: 1px solid var(--border);
  }

  .category-header h3 {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
    text-transform: capitalize;
  }

  .category-count {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--green-dim);
    background: rgba(0, 196, 154, 0.1);
    padding: 2px 8px;
  }

  .skills-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  /* Guides Section */
  .guides-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--space-4);
    margin-bottom: var(--space-6);
  }

  .guide-card {
    display: block;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    padding: var(--space-5);
    text-decoration: none;
    transition: all var(--transition-fast);
  }

  .guide-card:hover {
    border-color: var(--green-dim);
  }

  .guide-icon {
    color: var(--green-dim);
    margin-bottom: var(--space-3);
  }

  .guide-card h3 {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--space-2);
  }

  .guide-card p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0 0 var(--space-3);
    line-height: 1.5;
  }

  .guide-link {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--green-dim);
  }

  .quick-tips h3 {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin: 0 0 var(--space-3);
  }

  .tip-item {
    border: 1px solid var(--border);
    margin-bottom: var(--space-2);
  }

  .tip-question {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    width: 100%;
    padding: var(--space-3) var(--space-4);
    background: var(--bg-secondary);
    border: none;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-primary);
    text-align: left;
    cursor: pointer;
    transition: background var(--transition-fast);
  }

  .tip-question:hover {
    background: rgba(0, 196, 154, 0.05);
  }

  .tip-answer {
    padding: var(--space-3) var(--space-4);
    padding-left: calc(var(--space-4) + 16px + var(--space-3));
    background: var(--bg-primary);
    border-top: 1px solid var(--border);
  }

  .tip-answer p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.6;
  }

  /* Create Section */
  .create-cta {
    display: flex;
    gap: var(--space-5);
    padding: var(--space-6);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
  }

  .cta-icon {
    color: var(--green-dim);
    flex-shrink: 0;
  }

  .cta-content h3 {
    font-family: var(--font-mono);
    font-size: var(--text-lg);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--space-2);
  }

  .cta-content p {
    font-size: var(--text-base);
    color: var(--text-secondary);
    margin: 0 0 var(--space-4);
  }

  .cta-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
    background: transparent;
    border: 1px solid var(--green-dim);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--green-dim);
    text-decoration: none;
    transition: all var(--transition-fast);
  }

  .cta-btn:hover {
    background: var(--green-dim);
    color: var(--bg-primary);
  }

  /* Resources Section */
  .resources-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
  }

  .resource-group h3 {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin: 0 0 var(--space-3);
  }

  .resource-link {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) 0;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    text-decoration: none;
    transition: color var(--transition-fast);
  }

  .resource-link:hover {
    color: var(--green-dim);
  }

  /* Mobile */
  @media (max-width: 900px) {
    .skills-layout {
      flex-direction: column;
    }

    .skills-content {
      padding: var(--space-6) var(--space-4);
    }

    .overview-hero h1 {
      font-size: var(--text-3xl);
    }

    .stats-bar {
      flex-wrap: wrap;
      gap: var(--space-4);
    }

    .section-header {
      flex-direction: column;
      align-items: flex-start;
    }

    .skills-list {
      gap: var(--space-2);
    }

    .guides-grid {
      grid-template-columns: 1fr;
    }

    .create-cta {
      flex-direction: column;
    }

    /* Workflow Terminal Mobile */
    .terminal-body {
      padding: var(--space-4);
    }

    .stage-nodes {
      gap: var(--space-2);
    }

    .flow-node.skill-node.secondary,
    .flow-node.skill-node.review {
      padding: var(--space-2);
    }

    .skill-name {
      font-size: var(--text-xs);
    }

    .log-skill {
      min-width: 90px;
    }

    .anatomy-grid {
      grid-template-columns: 1fr 1fr;
    }
  }
</style>
