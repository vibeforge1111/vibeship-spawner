<script lang="ts">
  import Icon from './Icon.svelte';
  import type { Agent } from '$lib/stores/stack';

  export let agent: Agent;
  export let selected: boolean = false;
  export let showAdd: boolean = false;
  export let onAdd: (() => void) | null = null;
  export let onRemove: (() => void) | null = null;
</script>

<div class="agent-card" class:selected class:always-included={agent.alwaysIncluded}>
  <div class="agent-header">
    <div class="agent-icon">
      <Icon name={agent.icon} size={20} />
    </div>
    <div class="agent-info">
      <h4 class="agent-name">{agent.name}</h4>
      <p class="agent-desc">{agent.shortDescription}</p>
    </div>
  </div>

  {#if agent.alwaysIncluded}
    <span class="always-badge">Always included</span>
  {:else if showAdd && onAdd}
    <button class="add-btn" on:click={onAdd}>
      <Icon name="plus" size={16} />
    </button>
  {:else if selected && onRemove}
    <button class="remove-btn" on:click={onRemove}>
      <Icon name="x" size={16} />
    </button>
  {/if}

  {#if agent.requiredMcps.length > 0}
    <div class="agent-mcps">
      {#each agent.requiredMcps as mcp}
        <span class="mcp-tag">{mcp}</span>
      {/each}
    </div>
  {/if}
</div>

<style>
  .agent-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    transition: all var(--transition-fast);
    position: relative;
  }

  .agent-card:hover {
    border-color: var(--border-strong);
  }

  .agent-card.selected {
    border-color: var(--green-dim);
    background: rgba(0, 196, 154, 0.05);
  }

  .agent-card.always-included {
    border-color: var(--green-dim);
    opacity: 0.8;
  }

  .agent-header {
    display: flex;
    gap: var(--space-3);
    align-items: flex-start;
  }

  .agent-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    color: var(--green-dim);
    flex-shrink: 0;
  }

  .agent-info {
    flex: 1;
    min-width: 0;
  }

  .agent-name {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .agent-desc {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: var(--space-1) 0 0;
  }

  .always-badge {
    position: absolute;
    top: var(--space-2);
    right: var(--space-2);
    font-size: var(--text-xs);
    color: var(--green-dim);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .add-btn, .remove-btn {
    position: absolute;
    top: var(--space-2);
    right: var(--space-2);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: transparent;
    border: 1px solid var(--border);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
  }

  .add-btn:hover {
    border-color: var(--green-dim);
    color: var(--green-dim);
  }

  .remove-btn:hover {
    border-color: var(--red);
    color: var(--red);
  }

  .agent-mcps {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-top: var(--space-1);
  }

  .mcp-tag {
    font-size: var(--text-xs);
    padding: var(--space-1) var(--space-2);
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    color: var(--text-tertiary);
  }
</style>
