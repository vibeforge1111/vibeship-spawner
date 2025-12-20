<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import Icon from '$lib/components/Icon.svelte';
</script>

<Navbar />

<main class="why-spawner">
  <!-- Hero -->
  <section class="hero">
    <h1>Why Spawner?</h1>
    <p class="hero-subtitle">What Claude can't do alone - and how Spawner + Mind changes everything</p>
  </section>

  <!-- The Problem -->
  <section class="section problem-section">
    <div class="section-header">
      <span class="section-number">01</span>
      <h2>The Problem with Vanilla Claude</h2>
    </div>
    <div class="section-content">
      <p class="section-desc">Claude is brilliant. But for shipping products, it has real limitations.</p>

      <div class="problems-grid">
        <div class="problem-card">
          <div class="problem-icon">&#128534;</div>
          <h4>Context Loss</h4>
          <p>Forgets what was decided 50 messages ago. You repeat yourself constantly.</p>
        </div>
        <div class="problem-card">
          <div class="problem-icon">&#128260;</div>
          <h4>No Memory</h4>
          <p>New session = blank slate. Decisions, issues, progress - all gone.</p>
        </div>
        <div class="problem-card">
          <div class="problem-icon">&#129300;</div>
          <h4>Generic Advice</h4>
          <p>Knows a bit of everything, master of nothing. Surface-level patterns.</p>
        </div>
        <div class="problem-card">
          <div class="problem-icon">&#128683;</div>
          <h4>Misses Gotchas</h4>
          <p>Doesn't know the sharp edges that only come from production experience.</p>
        </div>
        <div class="problem-card">
          <div class="problem-icon">&#9888;&#65039;</div>
          <h4>Skips Steps</h4>
          <p>Tests, security checks, edge cases - they get "forgotten" without enforcement.</p>
        </div>
        <div class="problem-card">
          <div class="problem-icon">&#128300;</div>
          <h4>No Validation</h4>
          <p>"It's complete" without actually checking. Ships bugs you don't notice.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- Spawner Benefits -->
  <section class="section benefits-section">
    <div class="section-header">
      <span class="section-number">02</span>
      <h2>What Spawner Adds</h2>
    </div>
    <div class="section-content">
      <p class="section-desc">Six capabilities Claude doesn't have by default.</p>

      <div class="benefits-grid">
        <div class="benefit-card">
          <div class="benefit-header">
            <span class="benefit-icon">&#128205;</span>
            <h4>Project Memory</h4>
          </div>
          <p>Decisions, issues, and progress persist across sessions. Pick up exactly where you left off.</p>
          <div class="benefit-example">
            <strong>Without:</strong> "Remind me what auth strategy we picked..."<br/>
            <strong>With:</strong> Context loaded automatically. Claude knows.
          </div>
        </div>

        <div class="benefit-card">
          <div class="benefit-header">
            <span class="benefit-icon">&#128737;</span>
            <h4>Real Guardrails</h4>
          </div>
          <p>Automated checks that actually catch issues - security vulnerabilities, anti-patterns, production problems.</p>
          <div class="benefit-example">
            <strong>Without:</strong> Ships code with hardcoded API keys<br/>
            <strong>With:</strong> Catches it before commit
          </div>
        </div>

        <div class="benefit-card">
          <div class="benefit-header">
            <span class="benefit-icon">&#9888;&#65039;</span>
            <h4>Sharp Edges</h4>
          </div>
          <p>Specific gotchas from production systems - the things Claude doesn't know because they're not in docs.</p>
          <div class="benefit-example">
            <strong>Without:</strong> Hits Supabase RLS edge case after 2 hours<br/>
            <strong>With:</strong> Warned before you start
          </div>
        </div>

        <div class="benefit-card">
          <div class="benefit-header">
            <span class="benefit-icon">&#128161;</span>
            <h4>Escape Hatches</h4>
          </div>
          <p>When you're stuck, Spawner offers alternative approaches you haven't tried.</p>
          <div class="benefit-example">
            <strong>Without:</strong> Stuck in the same debugging loop<br/>
            <strong>With:</strong> 3 new approaches, ordered by likelihood
          </div>
        </div>

        <div class="benefit-card">
          <div class="benefit-header">
            <span class="benefit-icon">&#127891;</span>
            <h4>54 Specialist Skills</h4>
          </div>
          <p>Deep expertise in specific domains - not generic advice, but battle-tested patterns and anti-patterns.</p>
          <div class="benefit-example">
            <strong>Without:</strong> Generic React advice<br/>
            <strong>With:</strong> Knows useEffect dep array causes infinite loops, catches it
          </div>
        </div>

        <div class="benefit-card">
          <div class="benefit-header">
            <span class="benefit-icon">&#127919;</span>
            <h4>Skill Level Detection</h4>
          </div>
          <p>Adapts guidance to your experience. Vibe-coders get hand-holding. Experts get concise answers.</p>
          <div class="benefit-example">
            <strong>Without:</strong> Same explanation for everyone<br/>
            <strong>With:</strong> Right depth for your level
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Spawner + Mind -->
  <section class="section combo-section">
    <div class="section-header">
      <span class="section-number">03</span>
      <h2>Spawner + Mind: The Full Stack</h2>
    </div>
    <div class="section-content">
      <p class="section-desc">When you combine Spawner with Mind, you get persistent memory that compounds.</p>

      <div class="combo-intro">
        <div class="combo-card spawner">
          <h4>Spawner</h4>
          <p>Domain expertise, sharp edges, validations, escape hatches</p>
          <span class="focus">WHAT to build + HOW to build it right</span>
        </div>
        <div class="combo-plus">+</div>
        <div class="combo-card mind">
          <h4>Mind</h4>
          <p>Session memory, decision logging, context persistence, blockers tracking</p>
          <span class="focus">REMEMBERS everything across sessions</span>
        </div>
        <div class="combo-equals">=</div>
        <div class="combo-card result">
          <h4>Full Stack AI</h4>
          <p>Claude that knows your project, remembers decisions, catches issues, and grows with you</p>
          <span class="focus">COMPOUNDS over time</span>
        </div>
      </div>

      <div class="combo-benefits">
        <h4>What the Combo Unlocks</h4>
        <div class="combo-grid">
          <div class="combo-benefit">
            <span class="combo-icon">&#128218;</span>
            <h5>Cross-Session Context</h5>
            <p>Mind remembers decisions. Spawner applies skills. Next session, Claude knows your auth strategy AND the sharp edges for it.</p>
          </div>
          <div class="combo-benefit">
            <span class="combo-icon">&#128736;</span>
            <h5>Blockers Get Solved</h5>
            <p>Mind tracks blockers. Spawner's unstick tool offers alternatives. Mind logs what worked for next time.</p>
          </div>
          <div class="combo-benefit">
            <span class="combo-icon">&#128200;</span>
            <h5>Progress Compounds</h5>
            <p>Every session, Mind captures learnings. Every session, Spawner validates code. Quality improves over time.</p>
          </div>
          <div class="combo-benefit">
            <span class="combo-icon">&#129309;</span>
            <h5>Seamless Handoffs</h5>
            <p>Mind keeps session state. Spawner loads relevant skills. Resume work without "where were we?"</p>
          </div>
        </div>
      </div>

      <div class="combo-workflow">
        <h4>How They Work Together</h4>
        <div class="workflow-timeline">
          <div class="timeline-item">
            <span class="timeline-step">1</span>
            <div class="timeline-content">
              <strong>Session Start</strong>
              <p>Mind loads context. Spawner loads skills. Claude knows your project + has domain expertise.</p>
            </div>
          </div>
          <div class="timeline-item">
            <span class="timeline-step">2</span>
            <div class="timeline-content">
              <strong>During Work</strong>
              <p>Spawner validates code, warns about sharp edges. Mind logs decisions and blockers.</p>
            </div>
          </div>
          <div class="timeline-item">
            <span class="timeline-step">3</span>
            <div class="timeline-content">
              <strong>When Stuck</strong>
              <p>Mind tracks the blocker. Spawner offers alternatives. Mind logs what worked.</p>
            </div>
          </div>
          <div class="timeline-item">
            <span class="timeline-step">4</span>
            <div class="timeline-content">
              <strong>Session End</strong>
              <p>Mind saves progress. Next time, everything is there - no context lost.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Comparison -->
  <section class="section comparison-section">
    <div class="section-header">
      <span class="section-number">04</span>
      <h2>The Difference</h2>
    </div>
    <div class="section-content">
      <div class="comparison-table">
        <div class="comparison-header">
          <div class="col-feature">Feature</div>
          <div class="col-vanilla">Vanilla Claude</div>
          <div class="col-spawner">Claude + Spawner</div>
          <div class="col-combo">Claude + Spawner + Mind</div>
        </div>

        <div class="comparison-row">
          <div class="col-feature">Session Memory</div>
          <div class="col-vanilla"><span class="status-bad">None</span></div>
          <div class="col-spawner"><span class="status-ok">Project-level</span></div>
          <div class="col-combo"><span class="status-good">Full persistence</span></div>
        </div>

        <div class="comparison-row">
          <div class="col-feature">Domain Expertise</div>
          <div class="col-vanilla"><span class="status-bad">Generic</span></div>
          <div class="col-spawner"><span class="status-good">54 specialist skills</span></div>
          <div class="col-combo"><span class="status-good">54 skills + your learnings</span></div>
        </div>

        <div class="comparison-row">
          <div class="col-feature">Code Validation</div>
          <div class="col-vanilla"><span class="status-bad">Suggestions only</span></div>
          <div class="col-spawner"><span class="status-good">Automated checks</span></div>
          <div class="col-combo"><span class="status-good">Checks + history</span></div>
        </div>

        <div class="comparison-row">
          <div class="col-feature">Sharp Edges</div>
          <div class="col-vanilla"><span class="status-bad">Unknown</span></div>
          <div class="col-spawner"><span class="status-good">Proactive warnings</span></div>
          <div class="col-combo"><span class="status-good">Warnings + your gotchas</span></div>
        </div>

        <div class="comparison-row">
          <div class="col-feature">When Stuck</div>
          <div class="col-vanilla"><span class="status-bad">Same suggestions</span></div>
          <div class="col-spawner"><span class="status-good">Alternative approaches</span></div>
          <div class="col-combo"><span class="status-good">Alternatives + past solutions</span></div>
        </div>

        <div class="comparison-row">
          <div class="col-feature">Decision Tracking</div>
          <div class="col-vanilla"><span class="status-bad">Lost each session</span></div>
          <div class="col-spawner"><span class="status-ok">Saved in project</span></div>
          <div class="col-combo"><span class="status-good">Logged + searchable</span></div>
        </div>

        <div class="comparison-row">
          <div class="col-feature">Skill Level Adaptation</div>
          <div class="col-vanilla"><span class="status-bad">One size fits all</span></div>
          <div class="col-spawner"><span class="status-good">Detects your level</span></div>
          <div class="col-combo"><span class="status-good">Learns your preferences</span></div>
        </div>
      </div>
    </div>
  </section>

  <!-- Who It's For -->
  <section class="section audience-section">
    <div class="section-header">
      <span class="section-number">05</span>
      <h2>Who It's For</h2>
    </div>
    <div class="section-content">
      <div class="audience-grid">
        <div class="audience-card">
          <div class="audience-icon">&#127793;</div>
          <h4>Vibe-Coders</h4>
          <p>You have ideas but not code experience. Spawner gives you guardrails so you don't ship broken code. Mind remembers everything so you don't get lost.</p>
          <span class="audience-benefit">Build real products without the learning curve</span>
        </div>

        <div class="audience-card">
          <div class="audience-icon">&#128736;</div>
          <h4>Builders</h4>
          <p>You're learning and shipping. Spawner's skills teach you patterns as you go. Mind tracks your progress so you compound learning.</p>
          <span class="audience-benefit">Learn faster by doing, with expert guidance</span>
        </div>

        <div class="audience-card">
          <div class="audience-icon">&#128187;</div>
          <h4>Developers</h4>
          <p>You know the basics but want speed. Spawner's sharp edges save you from gotchas. Mind keeps context so you don't waste time re-explaining.</p>
          <span class="audience-benefit">Ship faster with fewer surprises</span>
        </div>

        <div class="audience-card">
          <div class="audience-icon">&#9889;</div>
          <h4>Founders</h4>
          <p>You're building alone or with a tiny team. Spawner is your senior dev. Mind is your documentation. Together, they're your co-founder that never forgets.</p>
          <span class="audience-benefit">Solo-founder productivity with team-level memory</span>
        </div>
      </div>
    </div>
  </section>

  <!-- CTA -->
  <section class="cta-section">
    <h2>Ready to level up?</h2>
    <p class="cta-desc">Connect Spawner + Mind and transform how you build.</p>
    <div class="cta-buttons">
      <a href="/mcp-guide" class="btn btn-primary">Setup Guide</a>
      <a href="/skills" class="btn btn-secondary">Browse Skills</a>
    </div>
  </section>

  <footer class="footer">
    <div class="footer-links">
      <a href="https://github.com/vibeforge1111/vibeship-spawner" target="_blank" rel="noopener">GitHub</a>
      <a href="/">Home</a>
      <a href="/skills">Skills</a>
      <a href="/mcp-guide">MCP Guide</a>
    </div>
  </footer>
</main>

<style>
  .why-spawner {
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
    max-width: 1000px;
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

  /* Problems Grid */
  .problems-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: var(--space-4);
  }

  .problem-card {
    padding: var(--space-4);
    background: rgba(255, 100, 100, 0.05);
    border: 1px solid rgba(255, 100, 100, 0.2);
    border-radius: 8px;
    text-align: center;
  }

  .problem-icon {
    font-size: var(--text-2xl);
    margin-bottom: var(--space-2);
  }

  .problem-card h4 {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: #ff6666;
    margin: 0 0 var(--space-2);
  }

  .problem-card p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
  }

  /* Benefits Grid */
  .benefits-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--space-4);
  }

  .benefit-card {
    padding: var(--space-5);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 8px;
  }

  .benefit-header {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-bottom: var(--space-3);
  }

  .benefit-icon {
    font-size: var(--text-xl);
  }

  .benefit-card h4 {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--green-dim);
    margin: 0;
  }

  .benefit-card > p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0 0 var(--space-4);
  }

  .benefit-example {
    font-size: var(--text-sm);
    color: var(--text-tertiary);
    padding: var(--space-3);
    background: var(--bg-tertiary);
    border-radius: 6px;
  }

  .benefit-example strong {
    color: var(--text-secondary);
  }

  /* Combo Section */
  .combo-intro {
    display: flex;
    align-items: stretch;
    gap: var(--space-3);
    margin-bottom: var(--space-8);
    flex-wrap: wrap;
    justify-content: center;
  }

  .combo-card {
    flex: 1;
    min-width: 180px;
    max-width: 250px;
    padding: var(--space-4);
    border-radius: 8px;
    text-align: center;
  }

  .combo-card.spawner {
    background: rgba(0, 196, 154, 0.05);
    border: 1px solid rgba(0, 196, 154, 0.3);
  }

  .combo-card.mind {
    background: rgba(147, 112, 219, 0.05);
    border: 1px solid rgba(147, 112, 219, 0.3);
  }

  .combo-card.result {
    background: rgba(255, 215, 0, 0.05);
    border: 1px solid rgba(255, 215, 0, 0.3);
  }

  .combo-card h4 {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    margin: 0 0 var(--space-2);
  }

  .combo-card.spawner h4 {
    color: var(--green-dim);
  }

  .combo-card.mind h4 {
    color: #9370DB;
  }

  .combo-card.result h4 {
    color: #FFD700;
  }

  .combo-card p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0 0 var(--space-3);
  }

  .combo-card .focus {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    text-transform: uppercase;
  }

  .combo-plus, .combo-equals {
    display: flex;
    align-items: center;
    font-family: var(--font-mono);
    font-size: var(--text-xl);
    font-weight: 700;
    color: var(--text-tertiary);
  }

  .combo-benefits {
    margin-bottom: var(--space-8);
  }

  .combo-benefits h4 {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--space-4);
    text-align: center;
  }

  .combo-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: var(--space-4);
  }

  .combo-benefit {
    padding: var(--space-4);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 8px;
  }

  .combo-icon {
    font-size: var(--text-xl);
    display: block;
    margin-bottom: var(--space-2);
  }

  .combo-benefit h5 {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--space-2);
  }

  .combo-benefit p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
  }

  .combo-workflow h4 {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--space-4);
    text-align: center;
  }

  .workflow-timeline {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .timeline-item {
    display: flex;
    gap: var(--space-4);
    padding: var(--space-4);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 8px;
  }

  .timeline-step {
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
    border-radius: 50%;
  }

  .timeline-content strong {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
    display: block;
    margin-bottom: var(--space-1);
  }

  .timeline-content p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
  }

  /* Comparison Table */
  .comparison-table {
    border: 1px solid var(--border);
    border-radius: 8px;
    overflow: hidden;
  }

  .comparison-header {
    display: grid;
    grid-template-columns: 1.5fr 1fr 1fr 1fr;
    background: var(--bg-tertiary);
    border-bottom: 1px solid var(--border);
  }

  .comparison-header div {
    padding: var(--space-3);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
  }

  .comparison-row {
    display: grid;
    grid-template-columns: 1.5fr 1fr 1fr 1fr;
    border-bottom: 1px solid var(--border);
  }

  .comparison-row:last-child {
    border-bottom: none;
  }

  .comparison-row div {
    padding: var(--space-3);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    display: flex;
    align-items: center;
  }

  .col-feature {
    font-weight: 500;
    color: var(--text-primary);
  }

  .status-bad {
    color: #ff6666;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
  }

  .status-ok {
    color: #FFD700;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
  }

  .status-good {
    color: var(--green-dim);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
  }

  /* Audience Grid */
  .audience-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: var(--space-4);
  }

  .audience-card {
    padding: var(--space-5);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 8px;
  }

  .audience-icon {
    font-size: var(--text-2xl);
    display: block;
    margin-bottom: var(--space-3);
  }

  .audience-card h4 {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--space-2);
  }

  .audience-card p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0 0 var(--space-3);
  }

  .audience-benefit {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--green-dim);
    background: rgba(0, 196, 154, 0.1);
    padding: var(--space-1) var(--space-2);
    border-radius: 4px;
    display: inline-block;
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

    .combo-intro {
      flex-direction: column;
      align-items: center;
    }

    .combo-card {
      max-width: 100%;
    }

    .combo-plus, .combo-equals {
      transform: rotate(90deg);
      margin: var(--space-2) 0;
    }

    .comparison-header,
    .comparison-row {
      grid-template-columns: 1fr;
    }

    .comparison-header div:first-child,
    .comparison-row div:first-child {
      background: var(--bg-tertiary);
      font-weight: 600;
    }
  }
</style>
