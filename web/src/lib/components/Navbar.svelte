<script lang="ts">
  import ThemeToggle from './ThemeToggle.svelte';
  import Icon from './Icon.svelte';
</script>

<nav class="navbar">
  <div class="navbar-content">
    <a href="/" class="navbar-logo-link">
      <img src="/logo.png" alt="vibeship" class="navbar-logo-img">
      <span class="navbar-logo-text">vibeship</span>
      <span class="navbar-logo-product">spawner</span>
    </a>

    <div class="navbar-right">
      <a href="/why-spawner" class="nav-btn">
        <Icon name="check-circle" size={14} />
        <span>Benefits</span>
      </a>
      <a href="/mcp-guide" class="nav-btn">
        <Icon name="book" size={14} />
        <span>Guide</span>
      </a>
      <a href="/skills" class="nav-btn">
        <Icon name="layers" size={14} />
        <span>Skills</span>
      </a>
      <ThemeToggle />
    </div>
  </div>
</nav>

<style>
  .navbar {
    position: sticky;
    top: 0;
    height: 52px;
    border-bottom: 1px solid var(--border);
    background: var(--bg-primary);
    z-index: 100;
  }

  .navbar-content {
    height: 100%;
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.625rem;
  }

  .navbar-logo-link {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    text-decoration: none;
  }

  .navbar-logo-img {
    width: 24px;
    height: 24px;
    position: relative;
    left: -1px;
  }

  /* Logo is white - invert to black in light mode, keep white in dark mode */
  :global([data-theme="light"]) .navbar-logo-img {
    filter: invert(1);
  }

  :global([data-theme="dark"]) .navbar-logo-img {
    filter: none;
  }

  .navbar-logo-text {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: 1.36rem;
    color: var(--text-primary);
    position: relative;
    top: 1px;
    left: -1px;
  }

  .navbar-logo-product {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: 1.36rem;
    color: var(--green-dim);
    position: relative;
    top: 1px;
  }

  .navbar-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .nav-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.75rem;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    text-decoration: none;
    color: var(--text-secondary);
    border: 1px solid transparent;
    transition: all 0.2s;
  }

  .nav-btn:hover {
    color: var(--text-primary);
    border-color: var(--border);
  }
</style>
