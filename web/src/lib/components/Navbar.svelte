<script lang="ts">
  import ThemeToggle from './ThemeToggle.svelte';
  import Icon from './Icon.svelte';
</script>

<nav class="navbar">
  <a href="/" class="logo">
    <span class="logo-text">vibeship</span>
    <span class="logo-sub">orchestrator</span>
  </a>

  <div class="nav-links">
    <a href="/builder">Build</a>
    <a href="https://github.com/vibeforge1111/vibeship-orchestrator" target="_blank" rel="noopener">
      <Icon name="github" size={18} />
    </a>
    <ThemeToggle />
  </div>
</nav>

<style>
  .navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    padding: 0 var(--space-8);
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: var(--bg-primary);
    border-bottom: 1px solid var(--border);
    z-index: 100;
  }

  .logo {
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
    text-decoration: none;
  }

  .logo-text {
    font-family: var(--font-serif);
    font-size: var(--text-2xl);
    color: var(--text-primary);
    letter-spacing: -0.02em;
  }

  .logo-sub {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: var(--space-6);
  }

  .nav-links a {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    text-decoration: none;
    display: flex;
    align-items: center;
  }

  .nav-links a:hover {
    color: var(--text-primary);
  }
</style>
