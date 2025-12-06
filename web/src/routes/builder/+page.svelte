<script lang="ts">
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
    projectDescription
  } from '$lib/stores/stack';
  import { goto } from '$app/navigation';

  // Filter out already selected agents for the available list
  $effect(() => {
    availableAgents = agents.filter(a => !$selectedAgents.includes(a.id) && !a.alwaysIncluded);
  });

  let availableAgents = $state(agents.filter(a => !$selectedAgents.includes(a.id) && !a.alwaysIncluded));
  let availableMcps = $derived(mcps.filter(m => !$selectedMcps.includes(m.id)));
  let showMcpPanel = $state(false);

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

  @media (max-width: 1024px) {
    .builder-content {
      grid-template-columns: 1fr;
    }
  }
</style>
