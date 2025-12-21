<script lang="ts">
  import ThemeToggle from './ThemeToggle.svelte';
  import Icon from './Icon.svelte';

  let skillsDropdownOpen = $state(false);

  function toggleSkillsDropdown() {
    skillsDropdownOpen = !skillsDropdownOpen;
  }

  function closeDropdown() {
    skillsDropdownOpen = false;
  }
</script>

<svelte:window onclick={(e) => {
  const target = e.target as HTMLElement;
  if (!target.closest('.skills-dropdown-container')) {
    skillsDropdownOpen = false;
  }
}} />

<nav class="navbar">
  <div class="navbar-content">
    <a href="/" class="navbar-logo-link">
      <img src="/logo.png" alt="vibeship" class="navbar-logo-img">
      <span class="navbar-logo-text">vibeship</span>
      <span class="navbar-logo-product">spawner</span>
    </a>

    <div class="navbar-right">
      <a href="/why-spawner" class="nav-btn">
        <Icon name="check-circle" size={14} />
        <span>Benefits</span>
      </a>
      <a href="/mcp-guide" class="nav-btn">
        <Icon name="book" size={14} />
        <span>Guide</span>
      </a>

      <!-- Skills Dropdown -->
      <div class="skills-dropdown-container">
        <button class="nav-btn skills-trigger" onclick={toggleSkillsDropdown}>
          <Icon name="layers" size={14} />
          <span>Skills</span>
          <Icon name="chevron-down" size={12} />
        </button>

        {#if skillsDropdownOpen}
          <div class="skills-dropdown">
            <a href="/skills" class="dropdown-item" onclick={closeDropdown}>
              <Icon name="grid" size={14} />
              <span>Browse All</span>
            </a>
            <a href="/skills/find" class="dropdown-item" onclick={closeDropdown}>
              <Icon name="compass" size={14} />
              <span>Find a Skill</span>
            </a>
            <a href="/skills/create" class="dropdown-item" onclick={closeDropdown}>
              <Icon name="plus" size={14} />
              <span>Create Your Own</span>
            </a>

            <div class="dropdown-divider"></div>

            <div class="dropdown-label">Categories</div>
            <a href="/skills?category=development" class="dropdown-item" onclick={closeDropdown}>
              <span>Development</span>
            </a>
            <a href="/skills?category=frameworks" class="dropdown-item" onclick={closeDropdown}>
              <span>Frameworks</span>
            </a>
            <a href="/skills?category=design" class="dropdown-item" onclick={closeDropdown}>
              <span>Design</span>
            </a>
            <a href="/skills?category=strategy" class="dropdown-item" onclick={closeDropdown}>
              <span>Strategy</span>
            </a>
          </div>
        {/if}
      </div>

      <ThemeToggle />
    </div>
  </div>
</nav>

<style>
  .navbar {
    position: sticky;
    top: 0;
    height: 52px;
    border-bottom: 1px solid var(--border);
    background: var(--bg-primary);
    z-index: 100;
  }

  .navbar-content {
    height: 100%;
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 1.625rem;
  }

  .navbar-logo-link {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    text-decoration: none;
  }

  .navbar-logo-img {
    width: 24px;
    height: 24px;
    position: relative;
    left: -1px;
  }

  /* Logo is white - invert to black in light mode, keep white in dark mode */
  :global([data-theme="light"]) .navbar-logo-img {
    filter: invert(1);
  }

  :global([data-theme="dark"]) .navbar-logo-img {
    filter: none;
  }

  .navbar-logo-text {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: 1.36rem;
    color: var(--text-primary);
    position: relative;
    top: 1px;
    left: -1px;
  }

  .navbar-logo-product {
    font-family: 'Instrument Serif', Georgia, serif;
    font-size: 1.36rem;
    color: var(--green-dim);
    position: relative;
    top: 1px;
  }

  .navbar-right {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .nav-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.4rem 0.75rem;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    text-decoration: none;
    color: var(--text-secondary);
    border: 1px solid transparent;
    background: transparent;
    cursor: pointer;
    transition: all 0.2s;
  }

  .nav-btn:hover {
    color: var(--text-primary);
    border-color: var(--border);
  }

  /* Skills Dropdown */
  .skills-dropdown-container {
    position: relative;
  }

  .skills-dropdown {
    position: absolute;
    top: calc(100% + 4px);
    right: 0;
    min-width: 180px;
    background: var(--bg-primary);
    border: 1px solid var(--border);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    padding: 0.5rem 0;
    z-index: 200;
  }

  .dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    text-decoration: none;
    transition: all 0.15s;
  }

  .dropdown-item:hover {
    background: var(--bg-secondary);
    color: var(--text-primary);
  }

  .dropdown-divider {
    height: 1px;
    background: var(--border);
    margin: 0.5rem 0;
  }

  .dropdown-label {
    padding: 0.25rem 1rem 0.5rem;
    font-family: var(--font-mono);
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-tertiary);
  }

  /* Mobile: hide text on smaller screens */
  @media (max-width: 640px) {
    .nav-btn span {
      display: none;
    }

    .nav-btn {
      padding: 0.4rem 0.5rem;
    }

    .skills-dropdown {
      right: -1rem;
    }

    .dropdown-item span {
      display: inline;
    }
  }
</style>
