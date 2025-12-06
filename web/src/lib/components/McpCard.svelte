<script lang="ts">
  import Icon from './Icon.svelte';
  import type { MCP } from '$lib/stores/stack';

  export let mcp: MCP;
  export let selected: boolean = false;
  export let required: boolean = false;
  export let recommended: boolean = false;
  export let showAdd: boolean = false;
  export let onAdd: (() => void) | null = null;
  export let onRemove: (() => void) | null = null;
</script>

<div class="mcp-card" class:selected class:required class:recommended>
  <div class="mcp-header">
    <div class="mcp-icon">
      <Icon name={mcp.icon} size={16} />
    </div>
    <div class="mcp-info">
      <h5 class="mcp-name">{mcp.name}</h5>
      <p class="mcp-desc">{mcp.description}</p>
    </div>
  </div>

  {#if mcp.isCore}
    <span class="core-badge">Core</span>
  {:else if required}
    <span class="required-badge">Required</span>
  {:else if recommended}
    <span class="recommended-badge">Recommended</span>
  {:else if showAdd && onAdd}
    <button class="add-btn" on:click={onAdd}>
      <Icon name="plus" size={14} />
    </button>
  {:else if selected && onRemove && !mcp.isCore}
    <button class="remove-btn" on:click={onRemove}>
      <Icon name="x" size={14} />
    </button>
  {/if}

  <div class="mcp-category">{mcp.category}</div>
</div>

<style>
  .mcp-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-3);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    transition: all var(--transition-fast);
    position: relative;
  }

  .mcp-card:hover {
    border-color: var(--border-strong);
  }

  .mcp-card.selected {
    border-color: var(--green-dim);
    background: rgba(0, 196, 154, 0.05);
  }

  .mcp-card.required {
    border-color: var(--green-dim);
  }

  .mcp-card.recommended {
    border-color: var(--orange);
  }

  .mcp-header {
    display: flex;
    gap: var(--space-2);
    align-items: flex-start;
  }

  .mcp-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    color: var(--text-secondary);
    flex-shrink: 0;
  }

  .mcp-info {
    flex: 1;
    min-width: 0;
  }

  .mcp-name {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .mcp-desc {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    margin: var(--space-1) 0 0;
  }

  .core-badge, .required-badge, .recommended-badge {
    position: absolute;
    top: var(--space-2);
    right: var(--space-2);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .core-badge {
    color: var(--text-tertiary);
  }

  .required-badge {
    color: var(--green-dim);
  }

  .recommended-badge {
    color: var(--orange);
  }

  .add-btn, .remove-btn {
    position: absolute;
    top: var(--space-2);
    right: var(--space-2);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
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

  .mcp-category {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
</style>
