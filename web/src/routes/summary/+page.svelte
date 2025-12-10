<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import Navbar from '$lib/components/Navbar.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import {
    projectName,
    projectDescription,
    selectedAgentObjects,
    selectedMcpObjects,
    selectedAgents,
    selectedMcps,
    discoveryAnswers,
    customSkillsNeeded,
    resetStack
  } from '$lib/stores/stack';
  import { createAnonymousGist, createAuthenticatedGist, buildConfig, type GistConfig } from '$lib/services/gist';
  import { githubUser, initAuth } from '$lib/stores/auth';
  import { goto } from '$app/navigation';

  let projectNameInput = $state($projectName || 'my-project');
  let exportFormat = $state<'github' | 'download'>('github');
  let selectedBehaviors = $state<string[]>(['tdd-mode']);
  let isExporting = $state(false);
  let exportedGist = $state<{ id: string; url: string; owner?: string } | null>(null);
  let exportError = $state<string | null>(null);

  // Initialize auth state on mount
  onMount(() => {
    initAuth();

    // Check for auth callback status
    const authStatus = $page.url.searchParams.get('auth');
    if (authStatus === 'success') {
      initAuth(); // Re-init to pick up new cookie
      exportFormat = 'github';
    } else if (authStatus === 'error') {
      exportError = 'GitHub authentication failed. Please try again.';
    }
  });

  // Available optional behaviors
  const optionalBehaviors = [
    { id: 'tdd-mode', label: 'TDD Mode', description: 'Write tests first, then implement' },
    { id: 'commit-per-task', label: 'Commit per Task', description: 'Auto-commit after each task' },
    { id: 'explain-as-you-go', label: 'Explain as You Go', description: 'Add comments explaining decisions' }
  ];

  function toggleBehavior(id: string) {
    if (selectedBehaviors.includes(id)) {
      selectedBehaviors = selectedBehaviors.filter(b => b !== id);
    } else {
      selectedBehaviors = [...selectedBehaviors, id];
    }
  }

  function generateConfig(): GistConfig {
    // Convert discovery answers to record
    const discovery: Record<string, string> = {};
    $discoveryAnswers.forEach(a => {
      discovery[a.question] = a.answer;
    });

    return buildConfig(
      projectNameInput,
      $projectDescription,
      discovery,
      $selectedAgents,
      $selectedMcps,
      selectedBehaviors,
      $customSkillsNeeded
    );
  }

  function generateConfigJson() {
    return JSON.stringify(generateConfig(), null, 2);
  }

  async function exportToGist(authenticated: boolean = false) {
    isExporting = true;
    exportError = null;
    exportedGist = null;

    try {
      const config = generateConfig();

      if (authenticated) {
        const gist = await createAuthenticatedGist(config);
        exportedGist = {
          id: gist.id,
          url: gist.html_url,
          owner: gist.owner
        };
      } else {
        const gist = await createAnonymousGist(config);
        exportedGist = {
          id: gist.id,
          url: gist.html_url
        };
      }
    } catch (e) {
      exportError = e instanceof Error ? e.message : 'Failed to create gist';
    } finally {
      isExporting = false;
    }
  }

  function loginWithGitHub() {
    window.location.href = '/api/auth/github';
  }

  function logout() {
    window.location.href = '/api/auth/logout';
  }

  function copyCommand() {
    if (exportedGist) {
      navigator.clipboard.writeText(`npx vibeship-orchestrator create ${exportedGist.id}`);
    }
  }

  // Expandable help sections state
  let showFirstTimeHelp = $state(false);
  let showWindowsHelp = $state(false);
  let showTroubleshootHelp = $state(false);

  function copyConfig() {
    navigator.clipboard.writeText(generateConfigJson());
  }

  function downloadConfig() {
    const config = generateConfigJson();
    const blob = new Blob([config], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectNameInput}-vibeship-config.json`;
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
    const baseTime = 30;
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

    <!-- Build Discipline -->
    <div class="section">
      <h2 class="section-title">Build Discipline</h2>
      <p class="section-desc">These behaviors guide how Claude builds your project</p>

      <div class="behaviors">
        <div class="behavior-group">
          <h4 class="behavior-label">Always On</h4>
          <div class="behavior-list">
            <div class="behavior mandatory">
              <Icon name="check" size={14} />
              <span>Verify before complete</span>
            </div>
            <div class="behavior mandatory">
              <Icon name="check" size={14} />
              <span>Follow architecture</span>
            </div>
            <div class="behavior mandatory">
              <Icon name="check" size={14} />
              <span>Maintainable code</span>
            </div>
            <div class="behavior mandatory">
              <Icon name="check" size={14} />
              <span>Secure code (OpenGrep)</span>
            </div>
          </div>
        </div>

        <div class="behavior-group">
          <h4 class="behavior-label">Optional</h4>
          <div class="behavior-list">
            {#each optionalBehaviors as behavior}
              <button
                class="behavior optional"
                class:selected={selectedBehaviors.includes(behavior.id)}
                onclick={() => toggleBehavior(behavior.id)}
              >
                <span class="behavior-checkbox">
                  {#if selectedBehaviors.includes(behavior.id)}
                    <Icon name="check" size={12} />
                  {/if}
                </span>
                <span class="behavior-text">
                  <strong>{behavior.label}</strong>
                  <small>{behavior.description}</small>
                </span>
              </button>
            {/each}
          </div>
        </div>
      </div>
    </div>

    <!-- Export Options -->
    <div class="section">
      <h2 class="section-title">Export</h2>

      <div class="export-options">
        <button
          class="export-option"
          class:selected={exportFormat === 'github'}
          onclick={() => exportFormat = 'github'}
        >
          <div class="option-icon">
            <Icon name="github" size={24} />
          </div>
          <div class="option-info">
            <h3>Save to GitHub</h3>
            <p>Your gist, editable later</p>
            {#if $githubUser}
              <span class="auth-badge">Logged in as {$githubUser}</span>
            {/if}
          </div>
        </button>

        <button
          class="export-option"
          class:selected={exportFormat === 'download'}
          onclick={() => exportFormat = 'download'}
        >
          <div class="option-icon">
            <Icon name="download" size={24} />
          </div>
          <div class="option-info">
            <h3>Download Config</h3>
            <p>Save JSON file locally</p>
          </div>
        </button>
      </div>
    </div>

    <!-- Export Result / Actions -->
    {#if exportFormat === 'github'}
      {#if exportedGist}
        <div class="export-success">
          <div class="success-header">
            <Icon name="check-circle" size={24} />
            <h3>Ready to Build!</h3>
          </div>

          {#if exportedGist.owner}
            <p class="owner-note">Saved to your GitHub account (@{exportedGist.owner})</p>
          {/if}

          <!-- Where to run section -->
          <div class="where-to-run">
            <h4>WHERE TO RUN THIS</h4>
            <p>Open any terminal - this command creates a new folder for you.</p>
            <ul class="terminal-examples">
              <li><strong>VS Code / Cursor:</strong> View → Terminal (then paste command below)</li>
              <li><strong>Mac:</strong> Open Terminal app</li>
              <li><strong>Windows:</strong> Open PowerShell or Command Prompt</li>
            </ul>
          </div>

          <div class="command-box">
            <code>npx vibeship-orchestrator create {exportedGist.id}</code>
            <button class="copy-btn" onclick={copyCommand}>
              <Icon name="copy" size={16} />
            </button>
          </div>

          <div class="what-this-creates">
            <p>This will create a folder called <strong>"{projectNameInput}"</strong> containing:</p>
            <ul>
              <li>CLAUDE.md - Your project config</li>
              <li>{$selectedAgents.length} agent skills ({$selectedAgents.join(', ')})</li>
              <li>{$selectedMcps.length} MCPs configured ({$selectedMcps.join(', ')})</li>
              <li>PRD and architecture templates</li>
            </ul>
          </div>

          <div class="gist-link">
            <a href={exportedGist.url} target="_blank" rel="noopener">
              View config on GitHub
              <Icon name="external-link" size={14} />
            </a>
          </div>

          <div class="next-steps">
            <h4>THEN</h4>
            <ol>
              <li>Open your IDE (VS Code, Cursor, etc.)</li>
              <li>File → Open Folder → select <strong>"{projectNameInput}"</strong>
                <span class="step-hint">(it's in the folder where you ran the command)</span>
              </li>
              <li>Open terminal in your IDE: View → Terminal</li>
              <li>Type <code>claude</code> and press Enter</li>
              <li>Claude greets you and starts the discovery process!</li>
            </ol>
          </div>

          <!-- Expandable help sections -->
          <div class="help-sections">
            <button class="help-toggle" onclick={() => showFirstTimeHelp = !showFirstTimeHelp}>
              <Icon name={showFirstTimeHelp ? 'chevron-down' : 'chevron-right'} size={16} />
              <span>First time? What you'll need...</span>
            </button>
            {#if showFirstTimeHelp}
              <div class="help-content">
                <ul>
                  <li><strong>Node.js 18 or higher</strong> - Download at <a href="https://nodejs.org" target="_blank" rel="noopener">nodejs.org</a></li>
                  <li><strong>Claude CLI</strong> - Install with: <code>npm install -g @anthropic-ai/claude-code</code></li>
                  <li><strong>Anthropic API key</strong> - For Claude CLI to work</li>
                </ul>
              </div>
            {/if}

            <button class="help-toggle" onclick={() => showWindowsHelp = !showWindowsHelp}>
              <Icon name={showWindowsHelp ? 'chevron-down' : 'chevron-right'} size={16} />
              <span>Using Windows?</span>
            </button>
            {#if showWindowsHelp}
              <div class="help-content">
                <ul>
                  <li>Use PowerShell, Command Prompt, or VS Code's built-in terminal</li>
                  <li>All commands work the same way</li>
                  <li>If using Git Bash, the commands also work identically</li>
                </ul>
              </div>
            {/if}

            <button class="help-toggle" onclick={() => showTroubleshootHelp = !showTroubleshootHelp}>
              <Icon name={showTroubleshootHelp ? 'chevron-down' : 'chevron-right'} size={16} />
              <span>Something not working?</span>
            </button>
            {#if showTroubleshootHelp}
              <div class="help-content">
                <ul>
                  <li>Run <code>npx vibeship-orchestrator doctor</code> to check your environment</li>
                  <li>This shows what's installed and what's missing</li>
                  <li>Common issues: Node.js too old, Claude CLI not installed</li>
                </ul>
              </div>
            {/if}
          </div>
        </div>
      {:else if exportFormat === 'github' && !$githubUser}
        <div class="export-action">
          {#if exportError}
            <div class="error-message">
              <Icon name="alert-circle" size={16} />
              <span>{exportError}</span>
            </div>
          {/if}

          <button
            class="btn btn-primary btn-large"
            onclick={loginWithGitHub}
          >
            <Icon name="github" size={18} />
            <span>Login with GitHub</span>
          </button>

          <p class="export-note">Connect your GitHub account to save gists you own</p>
        </div>
      {:else}
        <div class="export-action">
          {#if exportError}
            <div class="error-message">
              <Icon name="alert-circle" size={16} />
              <span>{exportError}</span>
            </div>
          {/if}

          {#if exportFormat === 'github' && $githubUser}
            <div class="auth-status">
              <span>Logged in as <strong>{$githubUser}</strong></span>
              <button class="btn btn-sm btn-ghost" onclick={logout}>Logout</button>
            </div>
          {/if}

          <button
            class="btn btn-primary btn-large"
            onclick={() => exportToGist(true)}
            disabled={isExporting}
          >
            {#if isExporting}
              <span class="spinner"></span>
              <span>Creating Gist...</span>
            {:else}
              <Icon name="github" size={18} />
              <span>Save to My GitHub</span>
            {/if}
          </button>

          <p class="export-note">Creates a gist in your GitHub account</p>
        </div>
      {/if}
    {:else}
      <div class="export-action">
        <button class="btn btn-primary btn-large" onclick={downloadConfig}>
          <Icon name="download" size={18} />
          <span>Download {projectNameInput}-vibeship-config.json</span>
        </button>

        <p class="export-note">Then run: <code>npx vibeship-orchestrator create --local ./{projectNameInput}-vibeship-config.json</code></p>
      </div>
    {/if}

    <!-- Config Preview -->
    <div class="section">
      <div class="section-header">
        <h2 class="section-title">Configuration Preview</h2>
        <button class="btn btn-sm btn-ghost" onclick={copyConfig}>
          <Icon name="copy" size={14} />
          Copy
        </button>
      </div>
      <pre class="config-preview">{generateConfigJson()}</pre>
    </div>

    <!-- Bottom Actions -->
    <div class="actions">
      <button class="btn btn-ghost" onclick={editStack}>
        <Icon name="arrow-left" size={16} />
        Edit Stack
      </button>
      <button class="btn btn-ghost" onclick={startOver}>
        Start Over
      </button>
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

  .section-desc {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: var(--space-2) 0 var(--space-4);
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

  /* Behaviors */
  .behaviors {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-6);
  }

  .behavior-group {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    padding: var(--space-4);
  }

  .behavior-label {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-tertiary);
    margin: 0 0 var(--space-3);
  }

  .behavior-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .behavior {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-2);
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }

  .behavior.mandatory {
    color: var(--green-dim);
  }

  .behavior.optional {
    background: var(--bg-primary);
    border: 1px solid var(--border);
    cursor: pointer;
    transition: all var(--transition-fast);
    text-align: left;
    width: 100%;
  }

  .behavior.optional:hover {
    border-color: var(--text-primary);
  }

  .behavior.optional.selected {
    border-color: var(--green-dim);
  }

  .behavior-checkbox {
    width: 18px;
    height: 18px;
    border: 2px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    color: var(--green-dim);
  }

  .behavior.optional.selected .behavior-checkbox {
    border-color: var(--green-dim);
    background: var(--green-dim);
    color: var(--bg-primary);
  }

  .behavior-text {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .behavior-text strong {
    color: var(--text-primary);
    font-weight: 500;
  }

  .behavior-text small {
    font-size: var(--text-xs);
    color: var(--text-tertiary);
  }

  /* Export Options */
  .export-options {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
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

  .auth-badge {
    display: inline-block;
    margin-top: var(--space-1);
    padding: 2px var(--space-2);
    background: var(--green-dim);
    color: var(--bg-primary);
    font-size: var(--text-xs);
    font-weight: 500;
    border-radius: 2px;
  }

  .auth-status {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    margin-bottom: var(--space-4);
    font-size: var(--text-sm);
    color: var(--text-secondary);
  }

  .auth-status strong {
    color: var(--text-primary);
  }

  .owner-note {
    text-align: center;
    font-size: var(--text-sm);
    color: var(--green-dim);
    margin: 0 0 var(--space-4);
  }

  /* Export Action */
  .export-action {
    text-align: center;
    padding: var(--space-8);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    margin-bottom: var(--space-8);
  }

  .btn-large {
    padding: var(--space-4) var(--space-8);
    font-size: var(--text-base);
  }

  .export-note {
    font-size: var(--text-sm);
    color: var(--text-tertiary);
    margin-top: var(--space-4);
  }

  .export-note code {
    background: var(--bg-tertiary);
    padding: var(--space-1) var(--space-2);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
  }

  .error-message {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    color: var(--red);
    margin-bottom: var(--space-4);
  }

  .spinner {
    width: 18px;
    height: 18px;
    border: 2px solid var(--bg-primary);
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  /* Export Success */
  .export-success {
    background: var(--bg-secondary);
    border: 1px solid var(--green-dim);
    padding: var(--space-6);
    margin-bottom: var(--space-8);
  }

  .success-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-2);
    color: var(--green-dim);
    margin-bottom: var(--space-6);
  }

  .success-header h3 {
    font-family: var(--font-serif);
    font-size: var(--text-xl);
    font-weight: 400;
    margin: 0;
  }

  .command-box {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-3);
    background: var(--bg-inverse);
    padding: var(--space-4);
    margin-bottom: var(--space-4);
  }

  .command-box code {
    font-family: var(--font-mono);
    font-size: var(--text-lg);
    color: var(--green-dim);
  }

  .copy-btn {
    background: transparent;
    border: 1px solid var(--text-inverse);
    color: var(--text-inverse);
    padding: var(--space-2);
    cursor: pointer;
    opacity: 0.7;
    transition: opacity var(--transition-fast);
  }

  .copy-btn:hover {
    opacity: 1;
  }

  .gist-link {
    text-align: center;
    margin-bottom: var(--space-6);
  }

  .gist-link a {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    color: var(--text-secondary);
    font-size: var(--text-sm);
  }

  .gist-link a:hover {
    color: var(--green-dim);
  }

  .next-steps {
    border-top: 1px solid var(--border);
    padding-top: var(--space-6);
  }

  .next-steps h4 {
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

  /* Config Preview */
  .config-preview {
    background: var(--bg-inverse);
    color: var(--text-inverse);
    padding: var(--space-4);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    overflow-x: auto;
    margin: 0;
    max-height: 300px;
    overflow-y: auto;
  }

  /* Actions */
  .actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  @media (max-width: 900px) {
    .export-options {
      grid-template-columns: 1fr;
    }
  }

  @media (max-width: 768px) {
    .export-options {
      grid-template-columns: 1fr;
    }

    .behaviors {
      grid-template-columns: 1fr;
    }

    .flow-diagram {
      flex-direction: column;
    }

    .flow-arrow {
      transform: rotate(90deg);
    }
  }

  /* Where to run section */
  .where-to-run {
    margin-bottom: var(--space-4);
    padding: var(--space-4);
    background: var(--bg-tertiary);
    border-left: 3px solid var(--green-dim);
  }

  .where-to-run h4 {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--green-dim);
    margin: 0 0 var(--space-2);
  }

  .where-to-run p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0 0 var(--space-3);
  }

  .terminal-examples {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .terminal-examples li {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    padding: var(--space-1) 0;
  }

  .terminal-examples li strong {
    color: var(--text-primary);
  }

  /* What this creates section */
  .what-this-creates {
    margin-bottom: var(--space-4);
    padding: var(--space-4);
    background: var(--bg-tertiary);
  }

  .what-this-creates p {
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0 0 var(--space-2);
  }

  .what-this-creates strong {
    color: var(--green-dim);
  }

  .what-this-creates ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .what-this-creates li {
    font-size: var(--text-sm);
    color: var(--text-tertiary);
    padding: var(--space-1) 0;
    padding-left: var(--space-4);
    position: relative;
  }

  .what-this-creates li::before {
    content: '•';
    position: absolute;
    left: var(--space-1);
    color: var(--green-dim);
  }

  /* Step hints */
  .step-hint {
    display: block;
    font-size: var(--text-xs);
    color: var(--text-tertiary);
    margin-top: 2px;
  }

  /* Help sections */
  .help-sections {
    margin-top: var(--space-6);
    border-top: 1px solid var(--border);
    padding-top: var(--space-4);
  }

  .help-toggle {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    width: 100%;
    padding: var(--space-3);
    background: transparent;
    border: none;
    color: var(--text-secondary);
    font-size: var(--text-sm);
    cursor: pointer;
    text-align: left;
    transition: color var(--transition-fast);
  }

  .help-toggle:hover {
    color: var(--green-dim);
  }

  .help-content {
    padding: 0 var(--space-3) var(--space-3) var(--space-8);
  }

  .help-content ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .help-content li {
    font-size: var(--text-sm);
    color: var(--text-tertiary);
    padding: var(--space-1) 0;
  }

  .help-content li strong {
    color: var(--text-secondary);
  }

  .help-content li a {
    color: var(--green-dim);
  }

  .help-content li code {
    background: var(--bg-tertiary);
    padding: 2px var(--space-1);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
  }
</style>
