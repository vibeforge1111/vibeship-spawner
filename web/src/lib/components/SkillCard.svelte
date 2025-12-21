<!-- web/src/lib/components/SkillCard.svelte -->
<script lang="ts">
  import type { Skill } from '$lib/types/skill';
  import { LAYER_LABELS } from '$lib/types/skill';
  import Icon from './Icon.svelte';

  interface Props {
    skill: Skill;
    compact?: boolean;
  }

  let { skill, compact = false }: Props = $props();
</script>

<a href="/skills/{skill.id}" class="skill-card" class:compact>
  <div class="skill-header">
    <h3 class="skill-name">{skill.name}</h3>
    <span class="skill-layer layer-{skill.layer}">{LAYER_LABELS[skill.layer]}</span>
  </div>

  <p class="skill-description">{skill.description}</p>

  {#if !compact}
    <div class="skill-meta">
      <span class="skill-category">
        <Icon name="folder" size={12} />
        {skill.category}
      </span>

      {#if skill.tags?.length}
        <div class="skill-tags">
          {#each skill.tags.slice(0, 3) as tag}
            <span class="skill-tag">{tag}</span>
          {/each}
          {#if skill.tags.length > 3}
            <span class="skill-tag-more">+{skill.tags.length - 3}</span>
          {/if}
        </div>
      {/if}
    </div>
  {/if}
</a>

<style>
  .skill-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-4);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    text-decoration: none;
    transition: border-color var(--transition-fast);
  }

  .skill-card:hover {
    border-color: var(--green-dim);
  }

  .skill-card.compact {
    padding: var(--space-3);
  }

  .skill-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
  }

  .skill-name {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0;
  }

  .skill-layer {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    padding: 2px 6px;
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
    line-height: 1.5;
  }

  .compact .skill-description {
    font-size: var(--text-xs);
  }

  .skill-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--space-3);
    margin-top: var(--space-1);
  }

  .skill-category {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    font-size: var(--text-xs);
    color: var(--text-tertiary);
  }

  .skill-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-1);
  }

  .skill-tag {
    font-family: var(--font-mono);
    font-size: 10px;
    padding: 2px 6px;
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    color: var(--text-secondary);
  }

  .skill-tag-more {
    font-family: var(--font-mono);
    font-size: 10px;
    color: var(--text-tertiary);
  }
</style>
