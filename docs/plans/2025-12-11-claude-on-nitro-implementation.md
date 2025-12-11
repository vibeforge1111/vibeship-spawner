# Claude on Nitro - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform vibeship-spawner into an intelligent agent system with smarter discovery, specialized agents, guardrails, and escape hatches.

**Architecture:** Four pillars working together - Discovery Flow (usefulness-first questioning), Three-Layer Specialists (Core → Integration → Pattern), Guardrails System (task/architecture/production checks), and Escape Hatch Intelligence (detect stuck, offer alternatives).

**Tech Stack:** TypeScript (Workers), Markdown (Skills), JSON (State/Config)

---

## Overview

| Phase | Tasks | Description |
|-------|-------|-------------|
| 1 | 1-5 | MCP Tools - Add discovery and assessment tools |
| 2 | 6-10 | Schema & Guardrails - Update skill schema with guardrails |
| 3 | 11-20 | Layer 1 Core Specialists - Deep domain expertise |
| 4 | 21-26 | Layer 2 Integration Specialists - Cross-cutting concerns |
| 5 | 27-33 | Layer 3 Pattern Specialists - Reusable solutions |
| 6 | 34-37 | Standalone Specialists - Domain knowledge |
| 7 | 38-42 | Planner Upgrade - Escape hatches and squad assembly |
| 8 | 43-50 | Guided Paths - Pre-built architectures |
| 9 | 51-53 | Deployment & Testing |

---

## Phase 1: MCP Tools (Tasks 1-5)

### Task 1: Add `start_discovery` tool to Workers MCP

**Files:**
- Modify: `workers/src/index.ts`

**Step 1: Add tool definition to TOOLS array**

Add after line 95 (after `list_templates` tool):

```typescript
  {
    name: 'start_discovery',
    description: 'Begin the discovery process for a new project. Guides user through usefulness framework and skill assessment before project creation.',
    inputSchema: {
      type: 'object',
      properties: {
        idea: {
          type: 'string',
          description: 'The user\'s initial project idea or description'
        },
        skill_level: {
          type: 'string',
          enum: ['vibe_coder', 'builder', 'developer', 'expert'],
          description: 'User\'s self-assessed skill level (optional - will be detected if not provided)'
        },
        is_creative_project: {
          type: 'boolean',
          description: 'If true, skip usefulness questions and focus on building'
        }
      },
      required: ['idea']
    }
  },
```

**Step 2: Add handler in handleToolCall switch**

Add after line 145:

```typescript
    case 'start_discovery':
      return startDiscovery(args);
```

**Step 3: Add startDiscovery function**

Add after `listTemplates` function (around line 294):

```typescript
function startDiscovery(args: Record<string, unknown>): unknown {
  const { idea, skill_level, is_creative_project } = args as {
    idea: string;
    skill_level?: 'vibe_coder' | 'builder' | 'developer' | 'expert';
    is_creative_project?: boolean;
  };

  // Detect skill level from idea if not provided
  const detectedLevel = skill_level || detectSkillLevel(idea);

  // Skip usefulness for creative projects
  if (is_creative_project) {
    return {
      content: [{
        type: 'text',
        text: `# Let's Build: ${idea}

## Detected Profile
- **Skill Level:** ${formatSkillLevel(detectedLevel)}
- **Mode:** Creative/Fun Project

Since this is a creative project, let's skip the business questions and focus on making it awesome.

## Quick Questions
1. What's the core experience you want? (the ONE thing that makes this fun)
2. Web, mobile, or both?
3. Any specific tech you want to use or learn?

Once I understand these, I'll recommend a template and we'll start building.`
      }]
    };
  }

  // Full usefulness framework
  return {
    content: [{
      type: 'text',
      text: `# Discovery: ${idea}

## Your Profile
- **Skill Level:** ${formatSkillLevel(detectedLevel)}
- **Guidance Mode:** ${getGuidanceMode(detectedLevel)}

## The Usefulness Framework

Before we write any code, let's make sure this will be worth building.

### Question 1: WHO has this problem?

Not "everyone" - be specific. Examples:
- "Freelance designers who..."
- "Small business owners who..."
- "Parents who..."

Who specifically will use this?

---

*After you answer, I'll ask about what's broken with current solutions, then we'll define your unique edge.*

**Tip:** If this is just for fun or learning, say "skip" and we'll jump straight to building.`
    }]
  };
}

function detectSkillLevel(idea: string): 'vibe_coder' | 'builder' | 'developer' | 'expert' {
  const lowerIdea = idea.toLowerCase();

  // Expert signals
  if (lowerIdea.includes('api route') || lowerIdea.includes('middleware') ||
      lowerIdea.includes('rls') || lowerIdea.includes('server component') ||
      lowerIdea.includes('edge function')) {
    return 'expert';
  }

  // Developer signals
  if (lowerIdea.includes('next.js') || lowerIdea.includes('react') ||
      lowerIdea.includes('supabase') || lowerIdea.includes('typescript') ||
      lowerIdea.includes('database')) {
    return 'developer';
  }

  // Builder signals
  if (lowerIdea.includes('build') || lowerIdea.includes('create') ||
      lowerIdea.includes('website') || lowerIdea.includes('app')) {
    return 'builder';
  }

  // Default to vibe coder
  return 'vibe_coder';
}

function formatSkillLevel(level: string): string {
  const labels: Record<string, string> = {
    'vibe_coder': 'Vibe Coder (I have ideas, you handle the tech)',
    'builder': 'Builder (I know basics, want to learn as we go)',
    'developer': 'Developer (I code, want to move fast)',
    'expert': 'Expert (I know what I want, just execute)'
  };
  return labels[level] || level;
}

function getGuidanceMode(level: string): string {
  const modes: Record<string, string> = {
    'vibe_coder': 'Maximum guidance - I\'ll explain everything and make tech decisions',
    'builder': 'Balanced - I\'ll explain key decisions, you make some choices',
    'developer': 'Efficient - Skip explanations, offer options, trust your judgment',
    'expert': 'Direct - Minimal talk, maximum output, I\'ll challenge bad decisions'
  };
  return modes[level] || 'Balanced';
}
```

**Step 4: Verify TypeScript compiles**

Run: `cd workers && npm run build`
Expected: No errors

**Step 5: Commit**

```bash
git add workers/src/index.ts
git commit -m "feat(mcp): add start_discovery tool with usefulness framework"
```

---

### Task 2: Add `continue_discovery` tool

**Files:**
- Modify: `workers/src/index.ts`

**Step 1: Add tool definition**

Add after `start_discovery` tool:

```typescript
  {
    name: 'continue_discovery',
    description: 'Continue the discovery conversation. Process user answers and guide toward next question or template recommendation.',
    inputSchema: {
      type: 'object',
      properties: {
        stage: {
          type: 'string',
          enum: ['who', 'problem', 'edge', 'minimum', 'template'],
          description: 'Current stage in discovery process'
        },
        answer: {
          type: 'string',
          description: 'User\'s answer to the current question'
        },
        context: {
          type: 'object',
          description: 'Accumulated context from previous answers'
        }
      },
      required: ['stage', 'answer']
    }
  },
```

**Step 2: Add handler**

```typescript
    case 'continue_discovery':
      return continueDiscovery(args);
```

**Step 3: Add continueDiscovery function**

```typescript
function continueDiscovery(args: Record<string, unknown>): unknown {
  const { stage, answer, context = {} } = args as {
    stage: 'who' | 'problem' | 'edge' | 'minimum' | 'template';
    answer: string;
    context?: Record<string, string>;
  };

  const newContext = { ...context, [stage]: answer };

  switch (stage) {
    case 'who':
      return {
        content: [{
          type: 'text',
          text: `## Target User: ${answer}

Got it. Now let's understand the pain.

### Question 2: What's BROKEN about current solutions?

What do ${answer} struggle with today? What's frustrating about existing tools?

Examples:
- "Too complex, takes forever to do simple things"
- "Expensive, paying for features they don't use"
- "Doesn't work well on mobile"
- "Can't share or collaborate easily"

What's the pain?`
        }],
        context: newContext
      };

    case 'problem':
      return {
        content: [{
          type: 'text',
          text: `## The Problem: ${answer}

That's a real pain point. Now the key question.

### Question 3: Why would they switch to YOURS?

With ${context.who} frustrated by "${answer}", what's the ONE thing your solution does better?

Not 5 things. ONE thing that makes them say "finally, this is what I needed."

**The tweet test:** If someone tweeted about your product, what would they say that made them excited enough to share?`
        }],
        context: newContext
      };

    case 'edge':
      return {
        content: [{
          type: 'text',
          text: `## Your Edge: ${answer}

Now we're getting somewhere.

### Question 4: What's the MINIMUM to prove that?

To validate that "${answer}" resonates with ${context.who}, what's the smallest thing we could build?

Think MVP - not "version 1 with all features", but "one feature that proves the idea works."

What absolutely MUST be in the first version?`
        }],
        context: newContext
      };

    case 'minimum':
      return {
        content: [{
          type: 'text',
          text: `## MVP Scope: ${answer}

Excellent. Here's what I understand:

---

### Discovery Summary

| Question | Answer |
|----------|--------|
| **Who** | ${context.who} |
| **Problem** | ${context.problem} |
| **Your Edge** | ${context.edge} |
| **MVP** | ${answer} |

---

### Recommended Template

Based on your answers, I recommend: **${recommendTemplate(newContext)}**

This gives you:
${getTemplateFeatures(recommendTemplate(newContext))}

### Next Steps

Say **"go"** to create the project with this template, or tell me what to adjust.`
        }],
        context: newContext
      };

    default:
      return {
        content: [{
          type: 'text',
          text: 'Discovery complete. Use create_project to start building.'
        }],
        context: newContext
      };
  }
}

function recommendTemplate(context: Record<string, string>): string {
  const combined = Object.values(context).join(' ').toLowerCase();

  if (combined.includes('subscription') || combined.includes('saas') || combined.includes('monthly')) {
    return 'saas';
  }
  if (combined.includes('marketplace') || combined.includes('buy') || combined.includes('sell') || combined.includes('two-sided')) {
    return 'marketplace';
  }
  if (combined.includes('ai') || combined.includes('llm') || combined.includes('gpt') || combined.includes('chat')) {
    return 'ai-app';
  }
  if (combined.includes('web3') || combined.includes('blockchain') || combined.includes('wallet') || combined.includes('nft')) {
    return 'web3';
  }
  if (combined.includes('cli') || combined.includes('tool') || combined.includes('utility') || combined.includes('script')) {
    return 'tool';
  }

  // Default to saas as most common
  return 'saas';
}

function getTemplateFeatures(template: string): string {
  const features: Record<string, string> = {
    'saas': `- User authentication (email + social)
- Stripe subscription billing
- User dashboard
- Landing page with pricing`,
    'marketplace': `- Two-sided auth (buyers + sellers)
- Listing creation and search
- Payment processing with fees
- Messaging between users`,
    'ai-app': `- Prompt management
- Streaming responses
- Usage tracking
- API key handling`,
    'web3': `- Wallet connection
- Smart contract interaction
- Transaction handling
- Chain switching`,
    'tool': `- CLI interface
- Core functionality
- Configuration
- Documentation`
  };
  return features[template] || features['saas'];
}
```

**Step 4: Verify and commit**

```bash
cd workers && npm run build
git add workers/src/index.ts
git commit -m "feat(mcp): add continue_discovery tool for guided questioning"
```

---

### Task 3: Add `assess_skill_level` tool

**Files:**
- Modify: `workers/src/index.ts`

**Step 1: Add tool definition**

```typescript
  {
    name: 'assess_skill_level',
    description: 'Assess user skill level through a simple choice rather than interrogation.',
    inputSchema: {
      type: 'object',
      properties: {
        choice: {
          type: 'string',
          enum: ['A', 'B', 'C'],
          description: 'User choice: A=vibe_coder, B=builder, C=developer/expert'
        }
      }
    }
  },
```

**Step 2: Add handler and function**

```typescript
    case 'assess_skill_level':
      return assessSkillLevel(args);
```

```typescript
function assessSkillLevel(args: Record<string, unknown>): unknown {
  const { choice } = args as { choice?: 'A' | 'B' | 'C' };

  if (!choice) {
    return {
      content: [{
        type: 'text',
        text: `## Quick Question

Before we start, which sounds more like you?

**A)** "I have the idea, you handle the tech stuff"

**B)** "I know some coding, want to learn as we build"

**C)** "I'm technical, let's move fast"

Just reply with A, B, or C.`
      }]
    };
  }

  const levels: Record<string, { level: string; description: string }> = {
    'A': {
      level: 'vibe_coder',
      description: `**Vibe Coder Mode Activated**

I'll:
- Make all technical decisions for you
- Explain things in plain English
- Guide you step by step
- Handle the complex stuff automatically

You focus on your vision. I'll handle the code.`
    },
    'B': {
      level: 'builder',
      description: `**Builder Mode Activated**

I'll:
- Explain key decisions so you learn
- Let you make some choices
- Point out trade-offs when they matter
- Help you understand what we're building

You'll come out of this knowing more than when you started.`
    },
    'C': {
      level: 'developer',
      description: `**Developer Mode Activated**

I'll:
- Skip basic explanations
- Offer options and let you choose
- Trust your judgment on implementation
- Move fast, challenge questionable decisions

Let's ship this thing.`
    }
  };

  const result = levels[choice];

  return {
    content: [{
      type: 'text',
      text: result.description
    }],
    skill_level: result.level
  };
}
```

**Step 3: Commit**

```bash
git add workers/src/index.ts
git commit -m "feat(mcp): add assess_skill_level tool"
```

---

### Task 4: Add `recommend_squad` tool

**Files:**
- Modify: `workers/src/index.ts`

**Step 1: Add squad recommendation types and tool**

```typescript
  {
    name: 'recommend_squad',
    description: 'Recommend a squad of specialist agents and MCPs based on project requirements.',
    inputSchema: {
      type: 'object',
      properties: {
        template: {
          type: 'string',
          enum: ['saas', 'marketplace', 'ai-app', 'web3', 'tool'],
          description: 'Project template'
        },
        features: {
          type: 'array',
          items: { type: 'string' },
          description: 'Specific features needed (e.g., "realtime", "payments", "file-upload")'
        }
      },
      required: ['template']
    }
  },
```

**Step 2: Add handler and function**

```typescript
    case 'recommend_squad':
      return recommendSquad(args);
```

```typescript
// Squad configuration by template
const SQUAD_CONFIG: Record<string, {
  core: string[];
  integration: string[];
  pattern: string[];
  mcps: string[];
}> = {
  'saas': {
    core: ['nextjs-app-router', 'supabase-backend', 'tailwind-ui', 'typescript-strict'],
    integration: ['nextjs-supabase-auth', 'server-client-boundary'],
    pattern: ['auth-flow', 'crud-builder'],
    mcps: ['filesystem', 'supabase', 'stripe']
  },
  'marketplace': {
    core: ['nextjs-app-router', 'supabase-backend', 'tailwind-ui', 'typescript-strict'],
    integration: ['nextjs-supabase-auth', 'server-client-boundary', 'api-design'],
    pattern: ['auth-flow', 'crud-builder', 'payments-flow'],
    mcps: ['filesystem', 'supabase', 'stripe', 'algolia']
  },
  'ai-app': {
    core: ['nextjs-app-router', 'supabase-backend', 'tailwind-ui', 'typescript-strict'],
    integration: ['nextjs-supabase-auth', 'api-design', 'state-sync'],
    pattern: ['auth-flow', 'realtime-sync'],
    mcps: ['filesystem', 'supabase', 'anthropic']
  },
  'web3': {
    core: ['nextjs-app-router', 'tailwind-ui', 'typescript-strict'],
    integration: ['server-client-boundary'],
    pattern: ['auth-flow'],
    mcps: ['filesystem', 'git', 'foundry']
  },
  'tool': {
    core: ['typescript-strict'],
    integration: ['api-design'],
    pattern: ['crud-builder'],
    mcps: ['filesystem', 'git']
  }
};

// Feature to specialist mapping
const FEATURE_SPECIALISTS: Record<string, { pattern: string; mcp?: string }> = {
  'realtime': { pattern: 'realtime-sync' },
  'payments': { pattern: 'payments-flow', mcp: 'stripe' },
  'file-upload': { pattern: 'file-upload' },
  'search': { pattern: 'crud-builder', mcp: 'algolia' },
  'email': { pattern: 'crud-builder', mcp: 'resend' },
  'ai': { pattern: 'realtime-sync', mcp: 'anthropic' }
};

function recommendSquad(args: Record<string, unknown>): unknown {
  const { template, features = [] } = args as {
    template: string;
    features?: string[];
  };

  const baseSquad = SQUAD_CONFIG[template] || SQUAD_CONFIG['saas'];

  // Add specialists for requested features
  const additionalPatterns: string[] = [];
  const additionalMcps: string[] = [];

  for (const feature of features) {
    const specialist = FEATURE_SPECIALISTS[feature.toLowerCase()];
    if (specialist) {
      if (!baseSquad.pattern.includes(specialist.pattern)) {
        additionalPatterns.push(specialist.pattern);
      }
      if (specialist.mcp && !baseSquad.mcps.includes(specialist.mcp)) {
        additionalMcps.push(specialist.mcp);
      }
    }
  }

  const finalSquad = {
    core: baseSquad.core,
    integration: baseSquad.integration,
    pattern: [...baseSquad.pattern, ...additionalPatterns],
    mcps: [...baseSquad.mcps, ...additionalMcps]
  };

  return {
    content: [{
      type: 'text',
      text: `# Your Squad

## Layer 1: Core Specialists
${finalSquad.core.map(s => `- \`${s}\``).join('\n')}

## Layer 2: Integration Specialists
${finalSquad.integration.map(s => `- \`${s}\``).join('\n')}

## Layer 3: Pattern Specialists
${finalSquad.pattern.map(s => `- \`${s}\``).join('\n')}

## MCPs (Superpowers)
${finalSquad.mcps.map(m => `- \`${m}\``).join('\n')}

---

This squad is optimized for **${template}** projects${features.length > 0 ? ` with ${features.join(', ')}` : ''}.

Say **"confirm"** to proceed or **"customize"** to adjust.`
    }],
    squad: finalSquad
  };
}
```

**Step 3: Commit**

```bash
git add workers/src/index.ts
git commit -m "feat(mcp): add recommend_squad tool for agent assembly"
```

---

### Task 5: Update version and deploy Workers

**Files:**
- Modify: `workers/src/index.ts`

**Step 1: Update version to 2.0.0**

Change line 108:

```typescript
          version: '2.0.0'
```

And update health check (around line 392):

```typescript
        version: '2.0.0'
```

**Step 2: Deploy to Cloudflare**

```bash
cd workers && npx wrangler deploy
```

Expected: Successful deployment to mcp.vibeship.co

**Step 3: Verify deployment**

```bash
curl https://mcp.vibeship.co/
```

Expected: `{"status":"ok","service":"vibeship-spawner-mcp","version":"2.0.0"}`

**Step 4: Commit**

```bash
git add workers/
git commit -m "feat(mcp): deploy v2.0.0 with discovery tools"
git push
```

---

## Phase 2: Schema & Guardrails (Tasks 6-10)

### Task 6: Update _schema.md with guardrails system

**Files:**
- Modify: `skills/_schema.md`

**Step 1: Add guardrails section after "Writing State Protocol"**

Add after line 108:

```markdown
---

## Guardrails System

All skills MUST run guardrails before marking tasks complete.

### Level 1: Task Guardrails (Every Task)

Before setting `status: "completed"`:

```
□ Code runs without errors
  - Run: npm run build / npm run typecheck
  - Expected: No errors

□ Matches what was asked
  - Re-read task description
  - Verify all requirements met

□ Files exist and aren't empty
  - Check all files in outputs array
  - Verify they have meaningful content
```

### Level 2: Architecture Guardrails (Integration Tasks)

For tasks touching multiple components:

```
□ Follows ARCHITECTURE.md patterns
  - Check data flow matches design
  - Verify file locations match structure

□ No client/server boundary violations
  - "use client" only where needed
  - Server data not exposed to client unnecessarily

□ Auth/permissions applied
  - Protected routes have auth checks
  - RLS policies in place for data access
```

### Level 3: Production Guardrails (Before "Ship")

Final checks before marking project complete:

```
□ Not client-only when backend needed
  - Data persists across sessions
  - Multiple users see shared data

□ Environment variables handled
  - No hardcoded secrets
  - .env.example exists

□ Error handling exists
  - Try/catch around external calls
  - User-friendly error messages

□ Basic security
  - No exposed API keys
  - Input validation on forms
  - SQL injection prevention (use parameterized queries)

□ Works for multiple users
  - Test with different accounts
  - No user ID hardcoding
```

---

## Guardrail Failure Protocol

When a guardrail fails:

1. **Do NOT mark task complete**
2. **Log the failure:**
   ```
   ! Guardrail Failed: [Level] - [Check]
   Issue: [What's wrong]
   Fix needed: [What to do]
   ```
3. **Fix the issue**
4. **Re-run guardrails**
5. **Only then mark complete**

---

## Guardrail Response Template

When catching an issue:

```
⚠️ Guardrail: [Level Name]

Issue found: [Specific problem]
Problem: [Why this matters]

Options:
1. [Recommended fix] - I'll do this
2. [Alternative] - Tradeoff: [what you lose]
3. [Explain more] - Help me understand

Which direction?
```
```

**Step 2: Commit**

```bash
git add skills/_schema.md
git commit -m "feat(schema): add 3-level guardrails system"
```

---

### Task 7: Add escape hatch protocol to schema

**Files:**
- Modify: `skills/_schema.md`

**Step 1: Add escape hatch section**

Add after Guardrails section:

```markdown
---

## Escape Hatch Intelligence

### Detecting "Stuck" Behavior

Monitor for these signals during task execution:

| Signal | Detection | Threshold |
|--------|-----------|-----------|
| Retry loop | Same task attempted multiple times | 3+ attempts |
| Error ping-pong | Fix A breaks B, fix B breaks A | 2 cycles |
| Growing complexity | Solution keeps adding code | 50%+ more code than expected |
| Time spiral | Task taking too long | 5x similar task time |

### Escape Hatch Trigger

When stuck signals detected:

1. **Stop current approach**
2. **Acknowledge the struggle:**
   ```
   I'm noticing we're going in circles on [issue].
   Let me step back.
   ```

3. **Explain what's happening:**
   ```
   What's going on:
   - [Attempted approach 1] → [Why it failed]
   - [Attempted approach 2] → [Why it failed]
   - The core challenge: [Root cause]
   ```

4. **Offer alternatives:**
   ```
   Options from here:

   1. [Simpler approach]
      - How: [Brief description]
      - Tradeoff: [What you lose]

   2. [Different approach]
      - How: [Brief description]
      - Tradeoff: [What you lose]

   3. [Use a service/library]
      - How: [Brief description]
      - Tradeoff: [What you lose]

   Which direction feels right?
   ```

5. **Recommend reset if needed:**
   ```
   I recommend starting fresh with your choice rather than
   patching current code - it's gotten tangled.

   This means:
   - I'll revert [files] to last working state
   - Fresh implementation of [chosen approach]
   - Your other code stays untouched

   OK to reset?
   ```

### Reset Protocol

When user confirms reset:

1. **Identify files to revert:**
   - Files modified during failed attempts
   - NOT files that were working before

2. **Git revert:**
   ```bash
   git checkout HEAD~N -- [file1] [file2]
   ```

3. **Update state:**
   - Clear checkpoint to pre-attempt state
   - Log reset in PROJECT_LOG.md

4. **Start fresh:**
   - Begin chosen approach from clean state
   - Do NOT reference failed approach

### When NOT to Reset

- If 80%+ of work is solid, fix the broken piece
- If user explicitly says "keep what we have"
- If issue is a simple bug, not architectural
```

**Step 2: Commit**

```bash
git add skills/_schema.md
git commit -m "feat(schema): add escape hatch intelligence protocol"
```

---

### Task 8: Add skill level adaptation to schema

**Files:**
- Modify: `skills/_schema.md`

**Step 1: Add skill level section**

Add after "File Conventions":

```markdown
---

## Skill Level Adaptation

Skills should adapt their output based on user skill level stored in `state.json`.

### Skill Levels

| Level | Stored As | Behavior |
|-------|-----------|----------|
| Vibe Coder | `skill_level: "vibe_coder"` | Maximum guidance, explain everything |
| Builder | `skill_level: "builder"` | Explain key decisions, some choices |
| Developer | `skill_level: "developer"` | Skip explanations, offer options |
| Expert | `skill_level: "expert"` | Minimal talk, maximum output |

### Reading Skill Level

At task start, check `state.json`:

```json
{
  "user": {
    "skill_level": "builder"
  }
}
```

### Adapting Output

**Vibe Coder:**
```
I'm creating your login page. Here's what's happening:

1. First, I'll make a form where users type their email and password
2. When they click "Login", we'll check if their password is correct
3. If it's right, they get into the app. If not, we show an error.

[Full code with lots of comments explaining each part]
```

**Builder:**
```
Creating the login page with Supabase auth.

Key decision: Using server actions instead of API routes because
it's simpler and Next.js 14 recommends this pattern.

[Code with key comments]
```

**Developer:**
```
Login page with Supabase auth + server actions.

[Clean code, minimal comments]

Options:
- Add "remember me"? (adds cookie complexity)
- Social login? (need to configure OAuth)
```

**Expert:**
```
[Code only, assumes they know what they're looking at]
```
```

**Step 2: Commit**

```bash
git add skills/_schema.md
git commit -m "feat(schema): add skill level adaptation protocol"
```

---

### Task 9: Add squad assembly protocol to schema

**Files:**
- Modify: `skills/_schema.md`

**Step 1: Add squad section**

```markdown
---

## Squad Assembly

The Planner assembles specialist squads based on task requirements.

### Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PLANNER (Orchestrator)                   │
│         Assesses task → Assembles squad → Coordinates       │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
   Layer 1: Core       Layer 2: Integration    Layer 3: Pattern
   (Deep domain)       (Cross-cutting)         (Reusable solutions)
```

### Layer Definitions

**Layer 1 - Core Specialists:**
- Own one technology deeply
- Know patterns, anti-patterns, gotchas
- Examples: `nextjs-app-router`, `supabase-backend`, `tailwind-ui`

**Layer 2 - Integration Specialists:**
- Know how technologies connect
- Handle boundary concerns
- Examples: `nextjs-supabase-auth`, `server-client-boundary`

**Layer 3 - Pattern Specialists:**
- Solve specific recurring problems
- Provide proven implementations
- Examples: `crud-builder`, `payments-flow`, `file-upload`

### Squad Selection Logic

```
For each task:
1. Identify primary technology → Add Layer 1 specialist
2. Check for integrations → Add Layer 2 specialists
3. Match to known patterns → Add Layer 3 specialists
4. Verify required MCPs are available
```

### Example Squad Assembly

Task: "Add Stripe subscription billing"

```
Analysis:
- Primary: Stripe API, Next.js routes
- Integration: Server actions, webhook handling
- Pattern: payments-flow

Squad:
- Layer 1: nextjs-app-router, typescript-strict
- Layer 2: api-design, server-client-boundary
- Layer 3: payments-flow

MCPs needed: stripe, filesystem
```

### Squad Handoff

When Planner assigns task to squad:

```json
{
  "task_id": "t5",
  "assigned_squad": {
    "primary": "payments-flow",
    "support": ["nextjs-app-router", "api-design"],
    "mcps": ["stripe", "filesystem"]
  },
  "context": {
    "architecture": "See docs/ARCHITECTURE.md#payments",
    "dependencies": ["t3-auth-complete", "t4-db-schema"]
  }
}
```
```

**Step 2: Commit**

```bash
git add skills/_schema.md
git commit -m "feat(schema): add squad assembly protocol"
```

---

### Task 10: Update state.json schema for new features

**Files:**
- Modify: `skills/_schema.md`
- Modify: `templates/state.json`

**Step 1: Update state.json schema in _schema.md**

Replace existing state.json section:

```markdown
## state.json

The central state file tracking project phase, decisions, and context.

```json
{
  "version": 2,
  "project_name": "string",
  "phase": "discovery" | "planning" | "building" | "review",
  "current_skill": "string | null",
  "checkpoint": "string | null",

  "user": {
    "skill_level": "vibe_coder" | "builder" | "developer" | "expert",
    "preferences": {
      "explain_decisions": "boolean",
      "show_alternatives": "boolean"
    }
  },

  "discovery": {
    "who": "string | null",
    "problem": "string | null",
    "edge": "string | null",
    "minimum": "string | null",
    "is_creative": "boolean"
  },

  "squad": {
    "core": ["string"],
    "integration": ["string"],
    "pattern": ["string"]
  },

  "confidence": {
    "ready": "boolean",
    "gaps": ["string"]
  },

  "assumptions": [{
    "id": "string",
    "text": "string",
    "confirmed": "boolean"
  }],

  "decisions": [{
    "question": "string",
    "answer": "string",
    "by": "user" | "planner",
    "reason": "string"
  }],

  "mcps": {
    "required": ["string"],
    "available": ["string"],
    "missing": ["string"]
  },

  "escape_hatches": {
    "triggered_count": "number",
    "last_trigger": {
      "task_id": "string",
      "reason": "string",
      "resolution": "string"
    }
  }
}
```
```

**Step 2: Update templates/state.json**

```json
{
  "version": 2,
  "project_name": "",
  "phase": "discovery",
  "current_skill": null,
  "checkpoint": null,
  "user": {
    "skill_level": "builder",
    "preferences": {
      "explain_decisions": true,
      "show_alternatives": true
    }
  },
  "discovery": {
    "who": null,
    "problem": null,
    "edge": null,
    "minimum": null,
    "is_creative": false
  },
  "squad": {
    "core": [],
    "integration": [],
    "pattern": []
  },
  "confidence": {
    "ready": false,
    "gaps": []
  },
  "assumptions": [],
  "decisions": [],
  "mcps": {
    "required": ["filesystem"],
    "available": [],
    "missing": []
  },
  "escape_hatches": {
    "triggered_count": 0,
    "last_trigger": null
  }
}
```

**Step 3: Commit**

```bash
git add skills/_schema.md templates/state.json
git commit -m "feat(schema): update state.json for v2 with discovery and squads"
```

---

## Phase 3: Layer 1 Core Specialists (Tasks 11-20)

### Task 11: Create specialist skill template

**Files:**
- Create: `skills/specialists/_template.md`

**Step 1: Create specialists directory**

```bash
mkdir -p skills/specialists
```

**Step 2: Create template file**

```markdown
# {Specialist Name}

> Layer {1|2|3}: {Core|Integration|Pattern} Specialist

---

## Read First

Before any work:
1. Read `skills/_schema.md` for protocols
2. Check `state.json` for user skill level
3. Review `docs/ARCHITECTURE.md` for project context

---

## Identity

**I am:** {One sentence description}

**I own:** {What this specialist is responsible for}

**I don't:** {What to hand off to other specialists}

---

## Patterns (Do This)

### Pattern 1: {Name}

**When:** {Situation}

**Do:**
```{language}
{Code example}
```

**Why:** {Brief explanation}

### Pattern 2: {Name}

{Same structure}

---

## Anti-Patterns (Don't Do This)

### Anti-Pattern 1: {Name}

**Wrong:**
```{language}
{Bad code}
```

**Problem:** {Why it's bad}

**Instead:**
```{language}
{Good code}
```

---

## Gotchas

| Gotcha | What Happens | How to Avoid |
|--------|--------------|--------------|
| {Name} | {Symptom} | {Prevention} |

---

## Checkpoints

Before marking task complete:

```
□ {Check 1}
□ {Check 2}
□ {Check 3}
```

---

## Escape Hatches

**When to bail:**
- {Signal 1}
- {Signal 2}

**Alternatives to suggest:**
1. {Alternative approach 1}
2. {Alternative approach 2}

---

## Works With

| Specialist | How We Collaborate |
|------------|-------------------|
| {Name} | {Integration point} |

---

## MCPs

| MCP | Required | Purpose |
|-----|----------|---------|
| {name} | Yes/No | {Why} |
```

**Step 3: Commit**

```bash
git add skills/specialists/
git commit -m "feat(skills): add specialist template"
```

---

### Task 12: Create nextjs-app-router specialist

**Files:**
- Create: `skills/specialists/nextjs-app-router.md`

**Step 1: Create the specialist file**

```markdown
# Next.js App Router

> Layer 1: Core Specialist

---

## Read First

Before any work:
1. Read `skills/_schema.md` for protocols
2. Check `state.json` for user skill level
3. Review `docs/ARCHITECTURE.md` for project context

---

## Identity

**I am:** The Next.js 14+ App Router expert. I know server components, client components, routing, layouts, and data fetching patterns.

**I own:** All routing, page structure, layouts, loading/error states, and server/client component decisions.

**I don't:** Database queries (→ supabase-backend), styling (→ tailwind-ui), auth logic (→ nextjs-supabase-auth)

---

## Patterns (Do This)

### Pattern 1: Server Components by Default

**When:** Creating any new component

**Do:**
```tsx
// app/dashboard/page.tsx
// NO "use client" = Server Component (default)
import { getUser } from '@/lib/auth'
import { Dashboard } from '@/components/Dashboard'

export default async function DashboardPage() {
  const user = await getUser()
  return <Dashboard user={user} />
}
```

**Why:** Server components are faster, don't ship JS to client, and can directly access backend.

### Pattern 2: Client Components Only When Needed

**When:** Component needs interactivity (useState, useEffect, onClick, etc.)

**Do:**
```tsx
// components/Counter.tsx
'use client'

import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  )
}
```

**Why:** Keep "use client" at the leaf level. Don't make whole pages client components.

### Pattern 3: Loading States

**When:** Page fetches data

**Do:**
```tsx
// app/dashboard/loading.tsx
export default function Loading() {
  return <DashboardSkeleton />
}
```

**Why:** Automatic loading UI while server component fetches data.

### Pattern 4: Error Boundaries

**When:** Page might fail

**Do:**
```tsx
// app/dashboard/error.tsx
'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
```

**Why:** Graceful error handling without crashing the whole app.

### Pattern 5: Server Actions for Mutations

**When:** Form submissions, data mutations

**Do:**
```tsx
// app/actions.ts
'use server'

import { revalidatePath } from 'next/cache'

export async function createTodo(formData: FormData) {
  const title = formData.get('title')
  await db.todos.create({ title })
  revalidatePath('/todos')
}

// app/todos/page.tsx
import { createTodo } from '../actions'

export default function TodosPage() {
  return (
    <form action={createTodo}>
      <input name="title" />
      <button type="submit">Add</button>
    </form>
  )
}
```

**Why:** No API routes needed, automatic form handling, works without JS.

---

## Anti-Patterns (Don't Do This)

### Anti-Pattern 1: "use client" on Pages

**Wrong:**
```tsx
// app/dashboard/page.tsx
'use client' // ❌ Don't do this!

export default function DashboardPage() {
  const [data, setData] = useState(null)
  useEffect(() => {
    fetch('/api/data').then(...)
  }, [])
  return <div>{data}</div>
}
```

**Problem:** Slower, requires extra API route, ships more JS.

**Instead:**
```tsx
// app/dashboard/page.tsx
// Server component - no "use client"
import { getData } from '@/lib/data'

export default async function DashboardPage() {
  const data = await getData()
  return <div>{data}</div>
}
```

### Anti-Pattern 2: Fetching in useEffect

**Wrong:**
```tsx
'use client'
useEffect(() => {
  fetch('/api/users').then(r => r.json()).then(setUsers)
}, [])
```

**Problem:** Loading spinners, waterfalls, SEO issues.

**Instead:** Fetch in server component or use server action.

### Anti-Pattern 3: Prop Drilling Through Layouts

**Wrong:**
```tsx
// Passing user through every layout
<RootLayout user={user}>
  <DashboardLayout user={user}>
    <Page user={user} />
```

**Instead:** Fetch in each server component that needs it, or use React Context for client components.

---

## Gotchas

| Gotcha | What Happens | How to Avoid |
|--------|--------------|--------------|
| Async Server Components | Forget `async` keyword | Always add `async` when using `await` |
| Hydration Mismatch | Server and client render differently | Don't use `Date.now()` or `Math.random()` in shared components |
| Router Cache | Old data shows after mutation | Call `revalidatePath()` or `revalidateTag()` |
| Dynamic Routes | `[id]` not working | Check file is `app/items/[id]/page.tsx` not `app/items/id/page.tsx` |

---

## Checkpoints

Before marking task complete:

```
□ No TypeScript errors (npm run typecheck)
□ Pages load without errors
□ Loading states exist for data-fetching pages
□ Error boundaries exist for risky operations
□ "use client" only on interactive components
□ Server actions have proper validation
```

---

## Escape Hatches

**When to bail:**
- Hydration errors that persist after 3 attempts
- Complex client-side state that keeps breaking

**Alternatives to suggest:**
1. Convert to client component with proper data fetching (SWR/React Query)
2. Use route handlers instead of server actions
3. Split into smaller components to isolate the issue

---

## Works With

| Specialist | How We Collaborate |
|------------|-------------------|
| supabase-backend | I call their data functions in server components |
| tailwind-ui | They style the components I create |
| nextjs-supabase-auth | They handle auth, I handle protected routes |
| server-client-boundary | They verify my component boundaries are correct |

---

## MCPs

| MCP | Required | Purpose |
|-----|----------|---------|
| filesystem | Yes | Read/write component files |
| browser-tools | No | Visual testing |
```

**Step 2: Commit**

```bash
git add skills/specialists/nextjs-app-router.md
git commit -m "feat(skills): add nextjs-app-router specialist"
```

---

### Task 13: Create supabase-backend specialist

**Files:**
- Create: `skills/specialists/supabase-backend.md`

**Full content in same format as Task 12, covering:**
- Server-side Supabase client creation
- RLS policies
- Edge Functions
- Realtime subscriptions
- Storage
- Common gotchas (RLS blocking queries, service role key exposure)

**Step 2: Commit**

```bash
git add skills/specialists/supabase-backend.md
git commit -m "feat(skills): add supabase-backend specialist"
```

---

### Task 14: Create tailwind-ui specialist

**Files:**
- Create: `skills/specialists/tailwind-ui.md`

**Content covers:**
- Utility-first patterns
- Component composition
- Responsive design (mobile-first)
- Dark mode
- Animation utilities
- Common gotchas (class order, purging)

**Commit:**
```bash
git add skills/specialists/tailwind-ui.md
git commit -m "feat(skills): add tailwind-ui specialist"
```

---

### Task 15: Create typescript-strict specialist

**Files:**
- Create: `skills/specialists/typescript-strict.md`

**Content covers:**
- Strict mode configuration
- Type inference patterns
- Generic usage
- Discriminated unions
- Type guards
- Common gotchas (any escape hatch, assertion overuse)

**Commit:**
```bash
git add skills/specialists/typescript-strict.md
git commit -m "feat(skills): add typescript-strict specialist"
```

---

### Task 16: Create react-patterns specialist

**Files:**
- Create: `skills/specialists/react-patterns.md`

**Content covers:**
- Custom hooks
- State management patterns
- Performance (memo, useMemo, useCallback)
- Composition over inheritance
- Common gotchas (stale closures, infinite loops)

**Commit:**
```bash
git add skills/specialists/react-patterns.md
git commit -m "feat(skills): add react-patterns specialist"
```

---

## Phase 4: Layer 2 Integration Specialists (Tasks 17-22)

### Task 17: Create nextjs-supabase-auth specialist

**Files:**
- Create: `skills/specialists/nextjs-supabase-auth.md`

**Content covers:**
- Full auth flow (signup, login, logout, password reset)
- Middleware for protected routes
- Server component auth
- Client component auth
- Session management
- Common gotchas (cookie handling, middleware vs layout checks)

---

### Task 18: Create server-client-boundary specialist

**Files:**
- Create: `skills/specialists/server-client-boundary.md`

**Content covers:**
- When to use server vs client components
- Data passing patterns
- Serialization requirements
- Common gotchas (passing functions, Date objects)

---

### Task 19: Create api-design specialist

**Files:**
- Create: `skills/specialists/api-design.md`

**Content covers:**
- REST patterns
- Error handling
- Validation (zod)
- Response formats
- Rate limiting considerations

---

### Task 20: Create state-sync specialist

**Files:**
- Create: `skills/specialists/state-sync.md`

**Content covers:**
- Server/client state coordination
- Optimistic updates
- Cache invalidation
- Realtime sync patterns

---

## Phase 5: Layer 3 Pattern Specialists (Tasks 21-27)

### Task 21: Create auth-flow specialist

**Files:**
- Create: `skills/specialists/auth-flow.md`

**Content provides complete implementations for:**
- Sign up form + validation
- Login form + error handling
- Password reset flow
- Protected route pattern
- Session persistence

---

### Task 22: Create crud-builder specialist

**Files:**
- Create: `skills/specialists/crud-builder.md`

**Content provides:**
- List view with pagination
- Create form with validation
- Edit form with optimistic updates
- Delete with confirmation
- Filter and search

---

### Task 23: Create payments-flow specialist

**Files:**
- Create: `skills/specialists/payments-flow.md`

**Content covers:**
- Stripe Checkout integration
- Webhook handling
- Subscription management
- Customer portal
- Error handling

---

### Task 24: Create file-upload specialist

**Files:**
- Create: `skills/specialists/file-upload.md`

**Content covers:**
- Client-side file selection
- Upload to Supabase Storage
- Progress tracking
- Image optimization
- Security (file type validation)

---

### Task 25: Create realtime-sync specialist

**Files:**
- Create: `skills/specialists/realtime-sync.md`

**Content covers:**
- Supabase Realtime subscriptions
- Optimistic updates
- Conflict resolution
- Presence (who's online)
- Typing indicators

---

## Phase 6: Standalone Specialists (Tasks 26-29)

### Task 26: Create brand-identity specialist

**Files:**
- Create: `skills/specialists/brand-identity.md`

**Content covers:**
- Color system design
- Typography selection
- Voice and tone guidelines
- Logo usage
- Design tokens

---

### Task 27: Create ux-research specialist

**Files:**
- Create: `skills/specialists/ux-research.md`

**Content covers:**
- User flow mapping
- Information architecture
- Wireframe patterns
- Usability heuristics
- Accessibility basics

---

### Task 28: Create security-audit specialist

**Files:**
- Create: `skills/specialists/security-audit.md`

**Content covers:**
- OWASP top 10 checks
- Auth vulnerabilities
- Data exposure risks
- Dependency auditing
- Security headers

---

### Task 29: Create copywriting specialist

**Files:**
- Create: `skills/specialists/copywriting.md`

**Content covers:**
- Landing page copy
- Onboarding flows
- Error messages
- CTAs
- Microcopy patterns

---

## Phase 7: Planner Upgrade (Tasks 30-34)

### Task 30: Update planner with discovery flow

**Files:**
- Modify: `skills/planner.md`

**Add discovery orchestration that:**
- Runs usefulness framework
- Detects skill level
- Guides to template selection
- Assembles squad

---

### Task 31: Add escape hatch detection to planner

**Files:**
- Modify: `skills/planner.md`

**Add monitoring for:**
- Retry loops
- Error ping-pong
- Time spirals
- Trigger escape hatch protocol when detected

---

### Task 32: Add squad assembly logic to planner

**Files:**
- Modify: `skills/planner.md`

**Add logic to:**
- Map tasks to specialists
- Assemble squads per task
- Coordinate handoffs between specialists

---

### Task 33: Add guardrail enforcement to planner

**Files:**
- Modify: `skills/planner.md`

**Add verification that:**
- Tasks aren't marked complete without guardrails passing
- Production guardrails run before "ship" phase
- Failures trigger proper responses

---

## Phase 8: Guided Paths (Tasks 34-41)

### Task 34: Create guided-paths directory structure

**Files:**
- Create: `guided-paths/README.md`
- Create: `guided-paths/_template/`

**Structure:**
```
guided-paths/
  README.md
  _template/
    description.md
    architecture.md
    schema.sql
    task-sequence.json
    gotchas.md
    checkpoints.md
```

---

### Task 35: Create SaaS Starter guided path

**Files:**
- Create: `guided-paths/saas-starter/`

**Complete path with:**
- Pre-built architecture for subscription SaaS
- Supabase schema with users, subscriptions, plans
- Task sequence for building auth → billing → dashboard
- Common gotchas specific to SaaS

---

### Task 36: Create Marketplace guided path

**Files:**
- Create: `guided-paths/marketplace/`

**Complete path for two-sided marketplaces**

---

### Task 37: Create AI Wrapper guided path

**Files:**
- Create: `guided-paths/ai-wrapper/`

**Complete path for LLM-powered apps**

---

### Task 38: Create Web3 dApp guided path

**Files:**
- Create: `guided-paths/web3-dapp/`

**Complete path for blockchain apps**

---

### Task 39: Create Internal Tool guided path

**Files:**
- Create: `guided-paths/internal-tool/`

**Complete path for admin panels and internal tools**

---

## Phase 9: Deployment & Testing (Tasks 40-43)

### Task 40: Update local MCP server

**Files:**
- Modify: `mcp/src/index.js`

**Add same tools as Workers:**
- start_discovery
- continue_discovery
- assess_skill_level
- recommend_squad

---

### Task 41: Update registry.json with new specialists

**Files:**
- Modify: `registry.json`

**Add all new specialists to registry**

---

### Task 42: Deploy and test full flow

**Steps:**
1. Deploy Workers MCP
2. Test discovery flow end-to-end
3. Test squad assembly
4. Test guardrails
5. Verify escape hatch triggers

---

### Task 43: Final commit and push

**Steps:**
```bash
git add -A
git commit -m "feat: complete Claude on Nitro implementation

- Discovery flow with usefulness framework
- 3-layer specialist architecture (Core, Integration, Pattern)
- Guardrails system (task, architecture, production)
- Escape hatch intelligence
- 5 guided paths (SaaS, Marketplace, AI, Web3, Internal Tool)
- Squad assembly and coordination

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>"

git push
```

---

## Summary

**Total Tasks:** 43
**Estimated Implementation:** Execute in order, commit after each task

**Key Milestones:**
- Task 5: MCP tools deployed
- Task 10: Schema complete
- Task 20: Core specialists done
- Task 25: All specialists done
- Task 33: Planner upgraded
- Task 39: Guided paths complete
- Task 43: Full deployment

---

*Plan created: 2025-12-11*
