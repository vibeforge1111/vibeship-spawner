<script lang="ts">
  import Icon from './Icon.svelte';
</script>

<section class="guide-promo">
  <div class="guide-promo-content">
    <div class="guide-promo-text">
      <h3 class="guide-promo-title">Ready to get started?</h3>
      <p class="guide-promo-desc">Follow our step-by-step guide to set up Spawner and supercharge your Claude workflow.</p>
    </div>
    <a href="/mcp-guide" class="guide-promo-btn">
      <Icon name="book" size={16} />
      <span>Read the Guide</span>
      <Icon name="arrow-right" size={14} />
    </a>
  </div>
</section>

<style>
  .guide-promo {
    padding: var(--space-8) var(--space-8);
    background: var(--bg-primary);
    border-top: 1px solid var(--border);
  }

  .guide-promo-content {
    max-width: 800px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-6);
  }

  .guide-promo-text {
    flex: 1;
  }

  .guide-promo-title {
    font-family: var(--font-serif);
    font-size: var(--text-2xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0 0 var(--space-2);
  }

  .guide-promo-desc {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--text-secondary);
    margin: 0;
    line-height: 1.6;
  }

  .guide-promo-btn {
    display: inline-flex;
    align-items: center;
    gap: var(--space-2);
    padding: var(--space-3) var(--space-5);
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--green-dim);
    border: 1px solid var(--green-dim);
    text-decoration: none;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .guide-promo-btn:hover {
    background: var(--green-dim);
    color: var(--bg-primary);
  }

  @media (max-width: 768px) {
    .guide-promo-content {
      flex-direction: column;
      text-align: center;
    }

    .guide-promo-btn {
      width: 100%;
      justify-content: center;
    }
  }
</style>
