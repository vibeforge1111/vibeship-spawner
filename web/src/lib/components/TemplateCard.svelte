<script lang="ts">
  import Icon from './Icon.svelte';
  import type { Template } from '$lib/stores/stack';

  export let template: Template;
  export let selected: boolean = false;
  export let onClick: () => void;
</script>

<button class="template-card" class:selected on:click={onClick}>
  <div class="template-icon">
    <Icon name={template.icon} size={24} />
  </div>
  <div class="template-info">
    <h4 class="template-name">{template.name}</h4>
    <p class="template-desc">{template.description}</p>
  </div>
  <div class="template-meta">
    <span class="meta-item">{template.agents.length} agents</span>
    <span class="meta-item">{template.mcps.length} MCPs</span>
  </div>
</button>

<style>
  .template-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-5);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    cursor: pointer;
    transition: all var(--transition-fast);
    text-align: center;
    width: 100%;
  }

  .template-card:hover {
    border-color: var(--text-primary);
    transform: translateY(-2px);
  }

  .template-card.selected {
    border-color: var(--green-dim);
    background: rgba(0, 196, 154, 0.05);
  }

  .template-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    color: var(--text-primary);
  }

  .template-card:hover .template-icon,
  .template-card.selected .template-icon {
    color: var(--green-dim);
    border-color: var(--green-dim);
  }

  .template-info {
    flex: 1;
  }

  .template-name {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .template-desc {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: var(--space-1) 0 0;
  }

  .template-meta {
    display: flex;
    gap: var(--space-4);
  }

  .meta-item {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
</style>
