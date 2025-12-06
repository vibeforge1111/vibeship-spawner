<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import TemplateCard from '$lib/components/TemplateCard.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { templates, applyTemplate, projectDescription } from '$lib/stores/stack';
  import { goto } from '$app/navigation';

  let inputValue = $state('');

  function handleSubmit() {
    if (inputValue.trim()) {
      projectDescription.set(inputValue.trim());
      goto('/discovery');
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function selectTemplate(templateId: string) {
    applyTemplate(templateId);
    goto('/builder');
  }
</script>

<Navbar />

<main class="landing">
  <section class="hero">
    <div class="hero-content">
      <h1 class="hero-title">vibeship orchestrator</h1>
      <p class="hero-tagline">Describe it. We'll architect it.</p>

      <div class="input-container">
        <label class="input-label" for="idea">I want to build...</label>
        <textarea
          id="idea"
          class="idea-input"
          bind:value={inputValue}
          onkeydown={handleKeydown}
          placeholder="a marketplace for vintage watches"
          rows="3"
        ></textarea>
        <button class="submit-btn" onclick={handleSubmit} disabled={!inputValue.trim()}>
          <span>Start Building</span>
          <Icon name="arrow-right" size={18} />
        </button>
      </div>

      <p class="or-text">or pick a starting point</p>
    </div>
  </section>

  <section class="templates">
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

  <section class="features">
    <div class="feature">
      <div class="feature-icon">
        <Icon name="target" size={24} />
      </div>
      <h3>Smart Discovery</h3>
      <p>Max 5 questions to understand your vision. Then we make smart assumptions.</p>
    </div>
    <div class="feature">
      <div class="feature-icon">
        <Icon name="zap" size={24} />
      </div>
      <h3>Build Your Crew</h3>
      <p>Assemble AI agents like a game character. Add superpowers with MCPs.</p>
    </div>
    <div class="feature">
      <div class="feature-icon">
        <Icon name="download" size={24} />
      </div>
      <h3>Export & Ship</h3>
      <p>Generate your project scaffold. Push to GitHub. Start building.</p>
    </div>
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
  }

  .hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-12) var(--space-8);
    text-align: center;
    min-height: 60vh;
  }

  .hero-content {
    max-width: 600px;
    width: 100%;
  }

  .hero-title {
    font-family: var(--font-serif);
    font-size: var(--text-4xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0 0 var(--space-2);
  }

  .hero-tagline {
    font-size: var(--text-lg);
    color: var(--text-secondary);
    margin: 0 0 var(--space-8);
  }

  .input-container {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    text-align: left;
  }

  .input-label {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .idea-input {
    width: 100%;
    padding: var(--space-4);
    font-family: var(--font-mono);
    font-size: var(--text-base);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    color: var(--text-primary);
    resize: none;
    transition: border-color var(--transition-fast);
  }

  .idea-input:focus {
    outline: none;
    border-color: var(--green-dim);
  }

  .idea-input::placeholder {
    color: var(--text-tertiary);
  }

  .submit-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    width: 100%;
    padding: var(--space-4);
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    background: transparent;
    border: 1px solid var(--green-dim);
    color: var(--green-dim);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .submit-btn:hover:not(:disabled) {
    background: var(--green-dim);
    color: var(--bg-primary);
    box-shadow: var(--shadow-glow-green);
  }

  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .or-text {
    margin-top: var(--space-8);
    font-size: var(--text-sm);
    color: var(--text-tertiary);
  }

  .templates {
    padding: var(--space-8);
    max-width: 1200px;
    margin: 0 auto;
  }

  .templates-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: var(--space-4);
  }

  .features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: var(--space-6);
    padding: var(--space-12) var(--space-8);
    max-width: 1000px;
    margin: 0 auto;
    border-top: 1px solid var(--border);
  }

  .feature {
    text-align: center;
    padding: var(--space-6);
  }

  .feature-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    color: var(--green-dim);
    margin-bottom: var(--space-4);
  }

  .feature h3 {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--space-2);
  }

  .feature p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
  }

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
</style>
