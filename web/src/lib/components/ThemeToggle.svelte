<script lang="ts">
  import { theme } from '$lib/stores/theme';
  import Icon from './Icon.svelte';
</script>

<button class="theme-toggle" on:click={() => theme.toggle()} aria-label="Toggle theme">
  {#if $theme === 'light'}
    <Icon name="moon" size={18} />
  {:else}
    <Icon name="sun" size={18} />
  {/if}
</button>

<style>
  .theme-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .theme-toggle:hover {
    border-color: var(--text-primary);
    color: var(--text-primary);
  }
</style>
