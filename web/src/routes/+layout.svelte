<script lang="ts">
  import '$lib/styles/theme.css';
  import { browser } from '$app/environment';
  import { theme } from '$lib/stores/theme';
  import { onMount } from 'svelte';

  let { children } = $props();

  onMount(() => {
    document.documentElement.setAttribute('data-theme', $theme);
  });

  $effect(() => {
    if (browser) {
      document.documentElement.setAttribute('data-theme', $theme);
    }
  });
</script>

<svelte:head>
  <title>VibeShip Orchestrator</title>
  <meta name="description" content="Build your stack like a video game character. Assemble AI agents and MCPs to ship your MVP." />
</svelte:head>

{@render children()}
