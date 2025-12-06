<script lang="ts">
  import { onMount } from 'svelte';
  import Navbar from '$lib/components/Navbar.svelte';
  import AgentCard from '$lib/components/AgentCard.svelte';
  import McpCard from '$lib/components/McpCard.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import {
    agents,
    mcps,
    selectedAgents,
    selectedMcps,
    selectedAgentObjects,
    selectedMcpObjects,
    requiredMcps,
    recommendedMcps,
    addAgent,
    removeAgent,
    addMcp,
    removeMcp,
    projectDescription,
    discoveryAnswers,
    recommendations,
    detectedProjectType,
    customSkillsNeeded,
    updateRecommendations,
    applyRecommendation
  } from '$lib/stores/stack';
  import { getProjectTypeLabel } from '$lib/services/recommendations';
  import { goto } from '$app/navigation';

  // Filter out already selected agents for the available list
  $effect(() => {
    availableAgents = agents.filter(a => !$selectedAgents.includes(a.id) && !a.alwaysIncluded);
  });

  let availableAgents = $state(agents.filter(a => !$selectedAgents.includes(a.id) && !a.alwaysIncluded));
  let availableMcps = $derived(mcps.filter(m => !$selectedMcps.includes(m.id)));
  let showMcpPanel = $state(false);
  let showRecommendations = $state(true);

  // Update recommendations when page loads
  onMount(() => {
    if ($projectDescription) {
      updateRecommendations($projectDescription, $discoveryAnswers);
    }
  });

  // Check if a recommendation is already in the stack
  function isRecommendationApplied(type: 'agent' | 'mcp', id: string): boolean {
    if (type === 'agent') {
      return $selectedAgents.includes(id);
    }
    return $selectedMcps.includes(id);
  }

  // Get pending recommendations (not yet applied)
  let pendingAgentRecs = $derived(
    $recommendations.agents.filter(r => !$selectedAgents.includes(r.id))
  );
  let pendingMcpRecs = $derived(
    $recommendations.mcps.filter(r => !$selectedMcps.includes(r.id))
  );
  let hasRecommendations = $derived(
    pendingAgentRecs.length > 0 || pendingMcpRecs.length > 0 || $customSkillsNeeded.length > 0
  );

  function handleContinue() {
    goto('/summary');
  }
</script>

<Navbar />

<main class="builder">
  <div class="builder-header">
    <div class="header-left">
      <h1 class="page-title">Build Your Crew</h1>
      {#if $projectDescription}
        <p class="project-desc">{$projectDescription}</p>
      {/if}
      {#if $detectedProjectType}
        <span class="project-type-badge">
          <Icon name="zap" size={12} />
          {getProjectTypeLabel($detectedProjectType)}
        </span>
      {/if}
    </div>
    <div class="header-right">
      <span class="stack-summary">
        {$selectedAgents.length} agents · {$selectedMcps.length} MCPs
      </span>
      <button class="btn btn-primary" onclick={handleContinue}>
        <span>Continue</span>
        <Icon name="arrow-right" size={16} />
      </button>
    </div>
  </div>

  <!-- Recommendations Panel -->
  {#if hasRecommendations && showRecommendations}
    <div class="recommendations-banner">
      <div class="rec-header">
        <div class="rec-title">
          <Icon name="zap" size={18} />
          <span>Recommendations based on your project</span>
        </div>
        <button class="btn btn-sm btn-ghost" onclick={() => showRecommendations = false}>
          Dismiss
        </button>
      </div>

      <div class="rec-content">
        {#if pendingAgentRecs.length > 0}
          <div class="rec-section">
            <h4 class="rec-section-title">Suggested Agents</h4>
            <div class="rec-items">
              {#each pendingAgentRecs as rec}
                {@const agent = agents.find(a => a.id === rec.id)}
                {#if agent}
                  <button class="rec-item" onclick={() => applyRecommendation('agent', rec.id)}>
                    <div class="rec-item-icon">
                      <Icon name={agent.icon} size={16} />
                    </div>
                    <div class="rec-item-info">
                      <strong>{agent.name}</strong>
                      <small>{rec.reason}</small>
                    </div>
                    <div class="rec-item-action">
                      <Icon name="plus" size={14} />
                    </div>
                  </button>
                {/if}
              {/each}
            </div>
          </div>
        {/if}

        {#if pendingMcpRecs.length > 0}
          <div class="rec-section">
            <h4 class="rec-section-title">Suggested MCPs</h4>
            <div class="rec-items">
              {#each pendingMcpRecs as rec}
                {@const mcp = mcps.find(m => m.id === rec.id)}
                {#if mcp}
                  <button class="rec-item" onclick={() => applyRecommendation('mcp', rec.id)}>
                    <div class="rec-item-icon">
                      <Icon name={mcp.icon} size={16} />
                    </div>
                    <div class="rec-item-info">
                      <strong>{mcp.name}</strong>
                      <small>{rec.reason}</small>
                    </div>
                    <div class="rec-item-action">
                      <Icon name="plus" size={14} />
                    </div>
                  </button>
                {/if}
              {/each}
            </div>
          </div>
        {/if}

        {#if $customSkillsNeeded.length > 0}
          <div class="rec-section">
            <h4 class="rec-section-title">Custom Skills Needed</h4>
            <div class="custom-skills-note">
              <Icon name="info" size={14} />
              <span>These will be generated during project setup:</span>
            </div>
            <div class="custom-skills-list">
              {#each $customSkillsNeeded as skill}
                <span class="custom-skill-tag">{skill}</span>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <div class="builder-content">
    <!-- Your Crew (Selected) -->
    <div class="panel crew-panel">
      <div class="panel-header">
        <h2 class="panel-title">Your Crew</h2>
        <span class="panel-count">{$selectedAgents.length}</span>
      </div>
      <div class="panel-content">
        <div class="crew-flow">
          {#each $selectedAgentObjects as agent, i}
            <div class="crew-item">
              <AgentCard
                {agent}
                selected={true}
                onRemove={agent.alwaysIncluded ? null : () => removeAgent(agent.id)}
              />
              {#if i < $selectedAgentObjects.length - 1}
                <div class="flow-connector">
                  <Icon name="chevron-down" size={16} />
                </div>
              {/if}
            </div>
          {/each}
        </div>

        <div class="mcps-section">
          <div class="section-header">
            <h3 class="section-title">MCPs</h3>
            <button class="btn btn-sm btn-ghost" onclick={() => showMcpPanel = !showMcpPanel}>
              {showMcpPanel ? 'Hide' : 'Browse'}
            </button>
          </div>
          <div class="mcps-grid">
            {#each $selectedMcpObjects as mcp}
              <McpCard
                {mcp}
                selected={true}
                required={$requiredMcps.includes(mcp.id)}
                onRemove={mcp.isCore ? null : () => removeMcp(mcp.id)}
              />
            {/each}
          </div>
        </div>
      </div>
    </div>

    <!-- Available Agents -->
    <div class="panel available-panel">
      <div class="panel-header">
        <h2 class="panel-title">Available Agents</h2>
      </div>
      <div class="panel-content">
        <div class="agents-grid">
          {#each availableAgents as agent}
            <AgentCard
              {agent}
              showAdd={true}
              onAdd={() => addAgent(agent.id)}
            />
          {/each}
        </div>

        {#if showMcpPanel}
          <div class="mcps-browse">
            <h3 class="section-title">Available MCPs</h3>
            <div class="mcps-grid">
              {#each availableMcps as mcp}
                <McpCard
                  {mcp}
                  showAdd={true}
                  recommended={$recommendedMcps.includes(mcp.id)}
                  onAdd={() => addMcp(mcp.id)}
                />
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</main>

<style>
  .builder {
    min-height: 100vh;
    padding-top: 60px;
  }

  .builder-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-6) var(--space-8);
    border-bottom: 1px solid var(--border);
    background: var(--bg-primary);
    position: sticky;
    top: 60px;
    z-index: 50;
  }

  .header-left {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .page-title {
    font-family: var(--font-serif);
    font-size: var(--text-2xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0;
  }

  .project-desc {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
  }

  .project-type-badge {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    padding: 2px var(--space-2);
    background: rgba(0, 196, 154, 0.15);
    color: var(--green-dim);
    font-size: var(--text-xs);
    font-weight: 500;
    border-radius: 2px;
    margin-top: var(--space-1);
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: var(--space-4);
  }

  .stack-summary {
    font-size: var(--text-sm);
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .builder-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-6);
    padding: var(--space-6) var(--space-8);
    max-width: 1600px;
    margin: 0 auto;
  }

  .panel {
    background: var(--bg-primary);
    border: 1px solid var(--border);
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4) var(--space-5);
    border-bottom: 1px solid var(--border);
  }

  .panel-title {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-primary);
    margin: 0;
  }

  .panel-count {
    font-size: var(--text-sm);
    color: var(--green-dim);
    font-weight: 600;
  }

  .panel-content {
    padding: var(--space-5);
    max-height: calc(100vh - 220px);
    overflow-y: auto;
  }

  .crew-flow {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .crew-item {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .flow-connector {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 24px;
    color: var(--text-tertiary);
  }

  .mcps-section {
    margin-top: var(--space-6);
    padding-top: var(--space-6);
    border-top: 1px solid var(--border);
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-4);
  }

  .section-title {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-secondary);
    margin: 0;
  }

  .mcps-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: var(--space-3);
  }

  .agents-grid {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .mcps-browse {
    margin-top: var(--space-6);
    padding-top: var(--space-6);
    border-top: 1px solid var(--border);
  }

  /* Recommendations Banner */
  .recommendations-banner {
    margin: var(--space-4) var(--space-8);
    background: var(--bg-secondary);
    border: 1px solid var(--green-dim);
    border-left: 4px solid var(--green-dim);
  }

  .rec-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-3) var(--space-4);
    border-bottom: 1px solid var(--border);
  }

  .rec-title {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--green-dim);
    font-weight: 500;
    font-size: var(--text-sm);
  }

  .rec-content {
    padding: var(--space-4);
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-6);
  }

  .rec-section {
    flex: 1;
    min-width: 250px;
  }

  .rec-section-title {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-tertiary);
    margin: 0 0 var(--space-3);
  }

  .rec-items {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .rec-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-3);
    background: var(--bg-primary);
    border: 1px solid var(--border);
    cursor: pointer;
    transition: all var(--transition-fast);
    text-align: left;
    width: 100%;
  }

  .rec-item:hover {
    border-color: var(--green-dim);
    background: rgba(0, 196, 154, 0.05);
  }

  .rec-item-icon {
    color: var(--text-secondary);
    flex-shrink: 0;
  }

  .rec-item-info {
    flex: 1;
    min-width: 0;
  }

  .rec-item-info strong {
    display: block;
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--text-primary);
  }

  .rec-item-info small {
    display: block;
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .rec-item-action {
    color: var(--green-dim);
    flex-shrink: 0;
  }

  .custom-skills-note {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    margin-bottom: var(--space-2);
  }

  .custom-skills-list {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .custom-skill-tag {
    padding: var(--space-1) var(--space-2);
    background: var(--orange);
    color: var(--bg-primary);
    font-size: var(--text-xs);
    font-weight: 500;
    border-radius: 2px;
  }

  @media (max-width: 1024px) {
    .builder-content {
      grid-template-columns: 1fr;
    }

    .recommendations-banner {
      margin: var(--space-4);
    }

    .rec-content {
      flex-direction: column;
    }
  }
</style>
