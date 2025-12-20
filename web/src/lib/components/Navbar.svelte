<script lang="ts">
  import { onMount } from 'svelte';
  import ThemeToggle from './ThemeToggle.svelte';
  import Icon from './Icon.svelte';
  import { githubUser, isAuthenticated, initAuth } from '$lib/stores/auth';

  onMount(() => {
    initAuth();
  });

  function handleLogout() {
    window.location.href = '/api/auth/logout';
  }
</script>

<nav class="navbar">
  <div class="navbar-content">
    <a href="/" class="navbar-logo-link">
      <img src="/logo.png" alt="vibeship" class="navbar-logo-img">
      <span class="navbar-logo-text">vibeship</span>
      <span class="navbar-logo-product">spawner</span>
    </a>

    <div class="navbar-right">
      <a href="/how-it-works">How It Works</a>
      <a href="/skill-creation">Skills</a>
      <a href="/builder">Build</a>
      {#if $isAuthenticated}
        <span class="user-info">
          <Icon name="github" size={16} />
          <span class="username">{$githubUser}</span>
        </span>
        <button class="logout-btn" onclick={handleLogout}>Logout</button>
      {:else}
        <a href="/api/auth/github" class="login-btn">
          <Icon name="github" size={16} />
          <span>Login</span>
        </a>
      {/if}
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
    filter: invert(var(--logo-invert, 0));
  }

  .navbar-logo-text {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: 1.44rem;
    color: var(--text-primary);
  }

  .navbar-logo-product {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: 1.44rem;
    color: var(--green-dim);
  }

  .navbar-right {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .navbar-right a:not(.login-btn) {
    font-size: var(--text-sm);
    text-decoration: none;
    color: var(--text-secondary);
    transition: color 0.2s;
  }

  .navbar-right a:not(.login-btn):hover {
    color: var(--text-primary);
  }

  .login-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: var(--text-xs);
    font-weight: 500;
    text-decoration: none;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.15s;
  }

  .login-btn:hover {
    border-color: var(--text-primary);
    color: var(--text-primary);
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }

  .username {
    color: var(--green-dim);
  }

  .logout-btn {
    padding: 0.5rem 0.75rem;
    font-family: 'JetBrains Mono', monospace;
    font-size: var(--text-xs);
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-tertiary);
    cursor: pointer;
    transition: all 0.15s;
  }

  .logout-btn:hover {
    border-color: var(--text-primary);
    color: var(--text-primary);
  }
</style>
