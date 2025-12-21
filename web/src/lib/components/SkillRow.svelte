<!-- web/src/lib/components/SkillRow.svelte -->
<script lang="ts">
  import type { Skill } from '$lib/types/skill';
  import { LAYER_LABELS } from '$lib/types/skill';
  import Icon from './Icon.svelte';

  interface Props {
    skill: Skill;
  }

  let { skill }: Props = $props();
</script>

<a href="/skills/{skill.id}" class="skill-row">
  <div class="skill-main">
    <div class="skill-header">
      <span class="skill-name">{skill.name}</span>
      <span class="skill-layer layer-{skill.layer}">{LAYER_LABELS[skill.layer]}</span>
    </div>
    <p class="skill-description">{skill.description}</p>
  </div>

  <div class="skill-arrow">
    <Icon name="arrow-right" size={16} />
  </div>
</a>

<style>
  .skill-row {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-4) var(--space-5);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    text-decoration: none;
    transition: border-color var(--transition-fast);
  }

  .skill-row:hover {
    border-color: var(--green-dim);
  }

  .skill-main {
    flex: 1;
    min-width: 0;
  }

  .skill-header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    margin-bottom: var(--space-2);
  }

  .skill-name {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--text-primary);
  }

  .skill-layer {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    padding: 3px 8px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .layer-1 {
    background: rgba(0, 196, 154, 0.15);
    color: var(--green-dim);
  }

  .layer-2 {
    background: rgba(100, 150, 255, 0.15);
    color: #6496ff;
  }

  .layer-3 {
    background: rgba(180, 130, 255, 0.15);
    color: #b482ff;
  }

  .skill-description {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .skill-arrow {
    color: var(--text-tertiary);
    flex-shrink: 0;
    opacity: 0;
    transition: opacity var(--transition-fast);
  }

  .skill-row:hover .skill-arrow {
    opacity: 1;
  }
</style>
