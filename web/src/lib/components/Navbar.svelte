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
  <a href="/" class="logo">
    <span class="logo-text">vibeship</span>
    <span class="logo-sub">crew</span>
  </a>

  <div class="nav-links">
    <a href="/how-it-works">How It Works</a>
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

  .login-btn {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-3);
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-secondary);
    font-size: var(--text-sm);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .login-btn:hover {
    border-color: var(--green-dim);
    color: var(--green-dim);
  }

  .user-info {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }

  .username {
    color: var(--green-dim);
  }

  .logout-btn {
    padding: var(--space-1) var(--space-2);
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-tertiary);
    font-size: var(--text-xs);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .logout-btn:hover {
    border-color: var(--red-dim, #ff6b6b);
    color: var(--red-dim, #ff6b6b);
  }
</style>
