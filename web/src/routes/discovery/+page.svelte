<script lang="ts">
  import Navbar from '$lib/components/Navbar.svelte';
  import Icon from '$lib/components/Icon.svelte';
  import { projectDescription, discoveryAnswers } from '$lib/stores/stack';
  import { goto } from '$app/navigation';

  interface Question {
    id: string;
    question: string;
    options: { value: string; label: string }[];
  }

  const questions: Question[] = [
    {
      id: 'audience',
      question: "Who's this for?",
      options: [
        { value: 'personal', label: 'Just me (side project)' },
        { value: 'users', label: 'Real users (needs to be solid)' },
        { value: 'enterprise', label: 'Enterprise (needs to scale)' }
      ]
    },
    {
      id: 'platform',
      question: 'What platform?',
      options: [
        { value: 'web', label: 'Web app' },
        { value: 'mobile', label: 'Mobile app' },
        { value: 'both', label: 'Both (web + mobile)' }
      ]
    },
    {
      id: 'auth',
      question: 'Need user accounts?',
      options: [
        { value: 'no', label: 'No auth needed' },
        { value: 'simple', label: 'Email/password only' },
        { value: 'social', label: 'Social login (Google, etc.)' }
      ]
    },
    {
      id: 'data',
      question: 'Where to store data?',
      options: [
        { value: 'none', label: 'No database needed' },
        { value: 'simple', label: 'Simple storage (Supabase)' },
        { value: 'complex', label: 'Custom database setup' }
      ]
    }
  ];

  let currentQuestion = $state(0);
  let answers = $state<Record<string, string>>({});

  function selectAnswer(questionId: string, value: string) {
    answers[questionId] = value;

    if (currentQuestion < questions.length - 1) {
      currentQuestion++;
    }
  }

  function goBack() {
    if (currentQuestion > 0) {
      currentQuestion--;
    }
  }

  function skip() {
    // Set default answers and go to builder
    discoveryAnswers.set([
      { question: 'audience', answer: 'users' },
      { question: 'platform', answer: 'web' },
      { question: 'auth', answer: 'simple' },
      { question: 'data', answer: 'simple' }
    ]);
    goto('/builder');
  }

  function finish() {
    const answersArray = Object.entries(answers).map(([question, answer]) => ({
      question,
      answer
    }));
    discoveryAnswers.set(answersArray);
    goto('/builder');
  }

  let isComplete = $derived(Object.keys(answers).length === questions.length);
</script>

<Navbar />

<main class="discovery">
  <div class="discovery-container">
    <div class="discovery-header">
      <p class="project-idea">"{$projectDescription}"</p>
      <h1 class="page-title">Let's nail down the details.</h1>
    </div>

    <div class="progress-dots">
      {#each questions as _, i}
        <span
          class="dot"
          class:active={i === currentQuestion}
          class:completed={i < currentQuestion}
        ></span>
      {/each}
    </div>

    <div class="question-card">
      <h2 class="question">{questions[currentQuestion].question}</h2>

      <div class="options">
        {#each questions[currentQuestion].options as option}
          <button
            class="option"
            class:selected={answers[questions[currentQuestion].id] === option.value}
            onclick={() => selectAnswer(questions[currentQuestion].id, option.value)}
          >
            <span class="option-radio">
              {#if answers[questions[currentQuestion].id] === option.value}
                <span class="radio-dot"></span>
              {/if}
            </span>
            <span class="option-label">{option.label}</span>
          </button>
        {/each}
      </div>
    </div>

    <div class="actions">
      {#if currentQuestion > 0}
        <button class="btn btn-ghost" onclick={goBack}>
          Back
        </button>
      {:else}
        <div></div>
      {/if}

      <div class="actions-right">
        <button class="btn btn-ghost" onclick={skip}>
          Skip - Smart defaults
        </button>

        {#if isComplete}
          <button class="btn btn-primary" onclick={finish}>
            <span>Continue</span>
            <Icon name="arrow-right" size={16} />
          </button>
        {/if}
      </div>
    </div>
  </div>
</main>

<style>
  .discovery {
    min-height: 100vh;
    padding-top: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .discovery-container {
    max-width: 600px;
    width: 100%;
    padding: var(--space-8);
  }

  .discovery-header {
    text-align: center;
    margin-bottom: var(--space-8);
  }

  .project-idea {
    font-family: var(--font-serif);
    font-size: var(--text-lg);
    font-style: italic;
    color: var(--text-secondary);
    margin: 0 0 var(--space-4);
  }

  .page-title {
    font-family: var(--font-serif);
    font-size: var(--text-2xl);
    font-weight: 400;
    color: var(--text-primary);
    margin: 0;
  }

  .progress-dots {
    display: flex;
    justify-content: center;
    gap: var(--space-2);
    margin-bottom: var(--space-8);
  }

  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--border);
    transition: all var(--transition-fast);
  }

  .dot.active {
    background: var(--green-dim);
    transform: scale(1.25);
  }

  .dot.completed {
    background: var(--green-dim);
    opacity: 0.5;
  }

  .question-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    padding: var(--space-8);
    margin-bottom: var(--space-6);
  }

  .question {
    font-family: var(--font-mono);
    font-size: var(--text-lg);
    font-weight: 500;
    color: var(--text-primary);
    margin: 0 0 var(--space-6);
    text-align: center;
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .option {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-4);
    background: var(--bg-primary);
    border: 1px solid var(--border);
    cursor: pointer;
    transition: all var(--transition-fast);
    text-align: left;
    width: 100%;
  }

  .option:hover {
    border-color: var(--text-primary);
  }

  .option.selected {
    border-color: var(--green-dim);
    background: rgba(0, 196, 154, 0.05);
  }

  .option-radio {
    width: 18px;
    height: 18px;
    border: 2px solid var(--border);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .option.selected .option-radio {
    border-color: var(--green-dim);
  }

  .radio-dot {
    width: 8px;
    height: 8px;
    background: var(--green-dim);
    border-radius: 50%;
  }

  .option-label {
    font-family: var(--font-mono);
    font-size: var(--text-base);
    color: var(--text-primary);
  }

  .actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .actions-right {
    display: flex;
    gap: var(--space-3);
  }
</style>
