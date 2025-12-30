<script lang="ts">
  import Icon from './Icon.svelte';
</script>

<footer class="footer">
  <div class="footer-install">
    <code class="install-cmd">npx github:vibeforge1111/vibeship-spawner-skills install --mcp</code>
    <button class="copy-install" onclick={() => navigator.clipboard.writeText('npx github:vibeforge1111/vibeship-spawner-skills install --mcp')}>
      Copy
    </button>
  </div>

  <div class="footer-content">
    <div class="footer-brand">
      <a href="/" class="footer-logo-link">
        <img src="/logo.png" alt="vibeship" class="footer-logo-img">
        <span class="footer-logo-text">vibeship</span>
        <span class="footer-logo-product">spawner</span>
      </a>
      <p class="footer-tagline">Give Claude the skills it's missing.</p>
    </div>

    <div class="footer-links">
      <div class="footer-column">
        <h4 class="footer-heading">Product</h4>
        <a href="/skills">
          <Icon name="layers" size={12} />
          <span>Skills</span>
        </a>
        <a href="/mcp-guide">
          <Icon name="book" size={12} />
          <span>Guide</span>
        </a>
      </div>

      <div class="footer-column">
        <h4 class="footer-heading">Resources</h4>
        <a href="https://github.com/vibeforge1111/vibeship-spawner-skills" target="_blank" rel="noopener">
          <Icon name="github" size={12} />
          <span>GitHub</span>
        </a>
        <a href="https://mind.vibeship.co" target="_blank" rel="noopener">
          <Icon name="brain" size={12} />
          <span>Mind</span>
        </a>
        <a href="https://claude.com/blog/skills" target="_blank" rel="noopener">
          <Icon name="external-link" size={12} />
          <span>Claude on Skills</span>
        </a>
      </div>
    </div>
  </div>

  <div class="footer-bottom">
    <span class="footer-copyright">© 2025 vibeship</span>
  </div>
</footer>

<style>
  .footer {
    border-top: 1px solid var(--border);
    background: var(--bg-secondary);
    padding: 0 var(--space-8) var(--space-4);
  }

  .footer-install {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    padding: var(--space-4) var(--space-4);
    background: var(--bg-tertiary);
    border-bottom: 1px solid var(--border);
    margin: 0 calc(-1 * var(--space-8));
    margin-bottom: var(--space-6);
  }

  .install-cmd {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--green-dim);
    background: var(--bg-primary);
    padding: var(--space-2) var(--space-4);
    border-radius: 6px;
    border: 1px solid var(--border);
  }

  .copy-install {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--text-secondary);
    background: var(--bg-primary);
    border: 1px solid var(--border);
    padding: var(--space-2) var(--space-3);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .copy-install:hover {
    background: var(--green-dim);
    color: var(--bg-primary);
    border-color: var(--green-dim);
  }

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    gap: var(--space-8);
  }

  .footer-brand {
    max-width: 280px;
  }

  .footer-logo-link {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    text-decoration: none;
    margin-bottom: var(--space-3);
  }

  .footer-logo-img {
    width: 20px;
    height: 20px;
  }

  :global([data-theme="light"]) .footer-logo-img {
    filter: invert(1);
  }

  :global([data-theme="dark"]) .footer-logo-img {
    filter: none;
  }

  .footer-logo-text {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: 1.1rem;
    color: var(--text-primary);
  }

  .footer-logo-product {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: 1.1rem;
    color: var(--green-dim);
  }

  .footer-tagline {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-tertiary);
    margin: 0;
    line-height: 1.5;
  }

  .footer-links {
    display: flex;
    gap: var(--space-10);
  }

  .footer-column {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .footer-heading {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-tertiary);
    margin: 0 0 var(--space-2);
  }

  .footer-column a {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    text-decoration: none;
    transition: color 0.2s;
  }

  .footer-column a:hover {
    color: var(--green-dim);
  }

  .footer-bottom {
    max-width: 1200px;
    margin: var(--space-6) auto 0;
    padding-top: var(--space-4);
    border-top: 1px solid var(--border);
    text-align: center;
  }

  .footer-copyright {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--text-tertiary);
  }

  @media (max-width: 768px) {
    .footer-content {
      flex-direction: column;
      gap: var(--space-6);
    }

    .footer-brand {
      max-width: 100%;
    }

    .footer-links {
      gap: var(--space-6);
    }
  }
</style>
