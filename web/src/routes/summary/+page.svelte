<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import {
    projectName,
    projectDescription,
    selectedAgentObjects,
    selectedMcpObjects,
    selectedAgents,
    selectedMcps,
    resetStack
  } from '$lib/stores/stack';
  import { goto } from '$app/navigation';

  let projectNameInput = $state($projectName || 'my-project');
  let exportFormat = $state<'claude' | 'github' | 'zip'>('claude');

  function generateConfig() {
    const config = {
      project_name: projectNameInput,
      description: $projectDescription,
      agents: $selectedAgents,
      mcps: $selectedMcps,
      generated_at: new Date().toISOString()
    };
    return JSON.stringify(config, null, 2);
  }

  function copyToClipboard() {
    const config = generateConfig();
    navigator.clipboard.writeText(config);
    alert('Configuration copied to clipboard!');
  }

  function downloadConfig() {
    const config = generateConfig();
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectNameInput}-stack.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function startOver() {
    resetStack();
    goto('/');
  }

  function editStack() {
    goto('/builder');
  }

  // Estimate build time based on agents
  let estimatedTime = $derived(() => {
    const baseTime = 30; // minutes
    const timePerAgent = 15;
    return baseTime + ($selectedAgents.length - 1) * timePerAgent;
  });
</script>

<Navbar />

<main class="summary">
  <div class="summary-container">
    <div class="summary-header">
      <h1 class="page-title">Your Stack is Ready</h1>
      <p class="subtitle">Review your configuration and export</p>
    </div>

    <!-- Project Name -->
    <div class="section">
      <label class="section-label" for="project-name">Project Name</label>
      <input
        id="project-name"
        type="text"
        class="name-input"
        bind:value={projectNameInput}
        placeholder="my-project"
      />
    </div>

    <!-- Stack Overview -->
    <div class="stack-overview">
      <div class="overview-visual">
        <div class="flow-diagram">
          {#each $selectedAgentObjects as agent, i}
            <div class="flow-node">
              <div class="node-icon">
                <Icon name={agent.icon} size={20} />
              </div>
              <span class="node-name">{agent.name}</span>
            </div>
            {#if i < $selectedAgentObjects.length - 1}
              <div class="flow-arrow">
                <Icon name="arrow-right" size={16} />
              </div>
            {/if}
          {/each}
        </div>

        <div class="mcps-row">
          {#each $selectedMcpObjects as mcp}
            <div class="mcp-chip">
              <Icon name={mcp.icon} size={14} />
              <span>{mcp.name}</span>
            </div>
          {/each}
        </div>
      </div>

      <div class="overview-stats">
        <div class="stat">
          <span class="stat-value">{$selectedAgents.length}</span>
          <span class="stat-label">Agents</span>
        </div>
        <div class="stat">
          <span class="stat-value">{$selectedMcps.length}</span>
          <span class="stat-label">MCPs</span>
        </div>
        <div class="stat">
          <span class="stat-value">~{estimatedTime()}m</span>
          <span class="stat-label">Est. Build</span>
        </div>
      </div>
    </div>

    <!-- Export Options -->
    <div class="section">
      <h2 class="section-title">Export Options</h2>

      <div class="export-options">
        <button
          class="export-option"
          class:selected={exportFormat === 'claude'}
          onclick={() => exportFormat = 'claude'}
        >
          <div class="option-icon">
            <Icon name="zap" size={24} />
          </div>
          <div class="option-info">
            <h3>Build with Claude</h3>
            <p>Copy config and paste into Claude Code</p>
          </div>
        </button>

        <button
          class="export-option"
          class:selected={exportFormat === 'github'}
          onclick={() => exportFormat = 'github'}
        >
          <div class="option-icon">
            <Icon name="github" size={24} />
          </div>
          <div class="option-info">
            <h3>Push to GitHub</h3>
            <p>Create repo with full scaffold</p>
          </div>
        </button>

        <button
          class="export-option"
          class:selected={exportFormat === 'zip'}
          onclick={() => exportFormat = 'zip'}
        >
          <div class="option-icon">
            <Icon name="download" size={24} />
          </div>
          <div class="option-info">
            <h3>Download Config</h3>
            <p>Get JSON configuration file</p>
          </div>
        </button>
      </div>
    </div>

    <!-- Config Preview -->
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">Configuration</h2>
        <button class="btn btn-sm btn-ghost" onclick={copyToClipboard}>
          Copy
        </button>
      </div>
      <pre class="config-preview">{generateConfig()}</pre>
    </div>

    <!-- Actions -->
    <div class="actions">
      <button class="btn btn-ghost" onclick={editStack}>
        Edit Stack
      </button>
      <div class="actions-right">
        <button class="btn btn-ghost" onclick={startOver}>
          Start Over
        </button>
        {#if exportFormat === 'claude'}
          <button class="btn btn-primary" onclick={copyToClipboard}>
            <span>Copy Config</span>
            <Icon name="arrow-right" size={16} />
          </button>
        {:else if exportFormat === 'zip'}
          <button class="btn btn-primary" onclick={downloadConfig}>
            <span>Download</span>
            <Icon name="download" size={16} />
          </button>
        {:else}
          <button class="btn btn-primary" disabled>
            <span>Coming Soon</span>
          </button>
        {/if}
      </div>
    </div>

    <!-- Next Steps -->
    <div class="next-steps">
      <h3>Next Steps</h3>
      <ol>
        <li>Initialize your project: <code>./init.sh {projectNameInput}</code></li>
        <li>Enter the project: <code>cd {projectNameInput}</code></li>
        <li>Start Claude Code: <code>claude</code></li>
        <li>Paste your configuration and start building!</li>
      </ol>
    </div>
  </div>
</main>

<style>
  .summary {
    min-height: 100vh;
    padding-top: 60px;
  }

  .summary-container {
    max-width: 800px;
    margin: 0 auto;
    padding: var(--space-8);
  }

  .summary-header {
    text-align: center;
    margin-bottom: var(--space-8);
  }

  .page-title {
    font-family: var(--font-serif);
    font-size: var(--text-3xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0 0 var(--space-2);
  }

  .subtitle {
    font-size: var(--text-base);
    color: var(--text-secondary);
    margin: 0;
  }

  .section {
    margin-bottom: var(--space-8);
  }

  .section-label {
    display: block;
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
    margin-bottom: var(--space-2);
  }

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-3);
  }

  .section-title {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-primary);
    margin: 0;
  }

  .name-input {
    width: 100%;
    padding: var(--space-4);
    font-family: var(--font-mono);
    font-size: var(--text-lg);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    color: var(--text-primary);
  }

  .name-input:focus {
    outline: none;
    border-color: var(--green-dim);
  }

  .stack-overview {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    padding: var(--space-6);
    margin-bottom: var(--space-8);
  }

  .overview-visual {
    margin-bottom: var(--space-6);
  }

  .flow-diagram {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: var(--space-2);
    margin-bottom: var(--space-4);
  }

  .flow-node {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3);
    background: var(--bg-primary);
    border: 1px solid var(--border);
  }

  .node-icon {
    color: var(--green-dim);
  }

  .node-name {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .flow-arrow {
    color: var(--text-tertiary);
  }

  .mcps-row {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: var(--space-2);
  }

  .mcp-chip {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    padding: var(--space-1) var(--space-2);
    background: var(--bg-tertiary);
    border: 1px solid var(--border);
    font-size: var(--text-xs);
    color: var(--text-secondary);
  }

  .overview-stats {
    display: flex;
    justify-content: center;
    gap: var(--space-8);
    padding-top: var(--space-6);
    border-top: 1px solid var(--border);
  }

  .stat {
    text-align: center;
  }

  .stat-value {
    display: block;
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--green-dim);
  }

  .stat-label {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .export-options {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-3);
  }

  .export-option {
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
  }

  .export-option:hover {
    border-color: var(--text-primary);
  }

  .export-option.selected {
    border-color: var(--green-dim);
    background: rgba(0, 196, 154, 0.05);
  }

  .option-icon {
    color: var(--text-secondary);
  }

  .export-option.selected .option-icon {
    color: var(--green-dim);
  }

  .option-info h3 {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 var(--space-1);
  }

  .option-info p {
    font-size: var(--text-xs);
    color: var(--text-secondary);
    margin: 0;
  }

  .config-preview {
    background: var(--bg-inverse);
    color: var(--text-inverse);
    padding: var(--space-4);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    overflow-x: auto;
    margin: 0;
  }

  .actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-8);
  }

  .actions-right {
    display: flex;
    gap: var(--space-3);
  }

  .next-steps {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    padding: var(--space-6);
  }

  .next-steps h3 {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-primary);
    margin: 0 0 var(--space-4);
  }

  .next-steps ol {
    margin: 0;
    padding-left: var(--space-6);
    color: var(--text-secondary);
  }

  .next-steps li {
    margin-bottom: var(--space-2);
  }

  .next-steps code {
    background: var(--bg-tertiary);
    padding: var(--space-1) var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--green-dim);
  }

  @media (max-width: 768px) {
    .export-options {
      grid-template-columns: 1fr;
    }

    .flow-diagram {
      flex-direction: column;
    }

    .flow-arrow {
      transform: rotate(90deg);
    }
  }
</style>
