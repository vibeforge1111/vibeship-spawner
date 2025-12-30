# T0 + T1 Skill Expansion Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create 15 world-class skills for Tier 0 (critical gaps) and Tier 1 (high demand) that transform Claude into a domain expert for each technology.

**Architecture:** Each skill follows the 4-file YAML structure with research-backed content, targeting 80+ on the 100-point quality rubric.

**Tech Stack:** YAML skills, regex validations, detection patterns

---

## Skill Overview

### Tier 0 (Build Immediately - Vibe Coders Need These)

| # | Skill ID | Name | Layer | Category |
|---|----------|------|-------|----------|
| 1 | svelte5-patterns | Svelte 5 Patterns | 1 | frameworks |
| 2 | sveltekit-fullstack | SvelteKit Full-Stack | 1 | frameworks |
| 3 | vue3-composition | Vue 3 Composition API | 1 | frameworks |
| 4 | nuxt3-patterns | Nuxt 3 Patterns | 1 | frameworks |
| 5 | drizzle-orm | Drizzle ORM | 1 | data |
| 6 | playwright-testing | Playwright Testing | 1 | development |
| 7 | hono-patterns | Hono Framework | 1 | frameworks |

### Tier 1 (High Demand)

| # | Skill ID | Name | Layer | Category |
|---|----------|------|-------|----------|
| 8 | angular-signals | Angular Signals | 1 | frameworks |
| 9 | go-web-gin | Go Web with Gin | 1 | frameworks |
| 10 | go-templ-htmx | Go + Templ + HTMX | 1 | integration |
| 11 | fastapi-patterns | FastAPI Patterns | 1 | frameworks |
| 12 | rag-patterns | RAG Patterns | 1 | ai |
| 13 | cloudflare-workers | Cloudflare Workers | 1 | frameworks |
| 14 | expo-mobile | Expo Mobile | 1 | frameworks |
| 15 | trpc-patterns | tRPC Patterns | 1 | integration |

---

## Research Resource Map

### For Each Skill - Primary Research Sources

#### 1. svelte5-patterns
| Source Type | URL/Resource | What to Extract |
|-------------|--------------|-----------------|
| Official Docs | https://svelte.dev/docs/svelte | Runes syntax, migration from Svelte 4 |
| Migration Guide | https://svelte.dev/docs/svelte/v5-migration-guide | Breaking changes, new patterns |
| GitHub Issues | https://github.com/sveltejs/svelte/issues | Top pain points, common mistakes |
| Awesome List | https://github.com/TheComputerM/awesome-svelte | Community patterns, libraries |
| Reddit | r/sveltejs | Developer frustrations, gotchas |
| Expert | Rich Harris talks, Svelte Society | Philosophy, best practices |

#### 2. sveltekit-fullstack
| Source Type | URL/Resource | What to Extract |
|-------------|--------------|-----------------|
| Official Docs | https://kit.svelte.dev/docs | Load functions, form actions, hooks |
| GitHub Issues | https://github.com/sveltejs/kit/issues | SSR issues, deployment gotchas |
| Vercel Adapter | https://kit.svelte.dev/docs/adapter-vercel | Deployment patterns |
| Auth Patterns | https://github.com/nextauthjs/next-auth | SvelteKit auth (Lucia, Auth.js) |
| Reddit/Discord | Svelte Discord | Real deployment issues |

#### 3. vue3-composition
| Source Type | URL/Resource | What to Extract |
|-------------|--------------|-----------------|
| Official Docs | https://vuejs.org/guide/introduction.html | Composition API patterns |
| Migration Guide | https://v3-migration.vuejs.org/ | Vue 2 -> 3 gotchas |
| GitHub Issues | https://github.com/vuejs/core/issues | Reactivity edge cases |
| VueUse | https://vueuse.org/ | Composables patterns |
| Awesome Vue | https://github.com/vuejs/awesome-vue | Ecosystem, patterns |
| Anthony Fu | Blog posts, talks | Advanced patterns |

#### 4. nuxt3-patterns
| Source Type | URL/Resource | What to Extract |
|-------------|--------------|-----------------|
| Official Docs | https://nuxt.com/docs | Auto-imports, Nitro, layers |
| Migration Guide | https://nuxt.com/docs/migration/overview | Nuxt 2 -> 3 changes |
| GitHub Issues | https://github.com/nuxt/nuxt/issues | SSR issues, build problems |
| Nuxt Modules | https://nuxt.com/modules | Ecosystem integration |
| Daniel Roe | Talks, blog | Architecture decisions |

#### 5. drizzle-orm
| Source Type | URL/Resource | What to Extract |
|-------------|--------------|-----------------|
| Official Docs | https://orm.drizzle.team/docs/overview | Schema, queries, relations |
| GitHub Issues | https://github.com/drizzle-team/drizzle-orm/issues | Migration gotchas, edge cases |
| Drizzle Kit | https://orm.drizzle.team/kit-docs/overview | Migration workflow |
| Comparison | Prisma vs Drizzle discussions | When to use which |
| Discord | Drizzle Discord | Common mistakes |

#### 6. playwright-testing
| Source Type | URL/Resource | What to Extract |
|-------------|--------------|-----------------|
| Official Docs | https://playwright.dev/docs/intro | Locators, assertions, fixtures |
| Best Practices | https://playwright.dev/docs/best-practices | Anti-patterns, reliability |
| GitHub Issues | https://github.com/microsoft/playwright/issues | Flaky test patterns |
| Testing Library | https://testing-library.com/ | Query priorities |
| Checkly Blog | https://www.checklyhq.com/blog/ | Real-world patterns |

#### 7. hono-patterns
| Source Type | URL/Resource | What to Extract |
|-------------|--------------|-----------------|
| Official Docs | https://hono.dev/docs/ | Middleware, RPC, adapters |
| GitHub | https://github.com/honojs/hono | Examples, edge cases |
| Yusuke Wada | Creator talks | Philosophy, patterns |
| Cloudflare | Workers + Hono patterns | Edge deployment |
| Bun/Deno | Runtime-specific patterns | Multi-runtime gotchas |

#### 8. angular-signals
| Source Type | URL/Resource | What to Extract |
|-------------|--------------|-----------------|
| Official Docs | https://angular.dev/guide/signals | Signals, effects, computed |
| Migration Guide | https://angular.dev/guide/signals/migration | RxJS -> Signals patterns |
| GitHub Issues | https://github.com/angular/angular/issues | Signal edge cases |
| Blog | Angular Blog | Zoneless patterns |
| Minko Gechev | Talks | Angular roadmap |

#### 9. go-web-gin
| Source Type | URL/Resource | What to Extract |
|-------------|--------------|-----------------|
| Official Docs | https://gin-gonic.com/docs/ | Routing, middleware, binding |
| GitHub | https://github.com/gin-gonic/gin | Examples, issues |
| Go Blog | https://go.dev/blog/ | Idiomatic patterns |
| Awesome Go | https://github.com/avelino/awesome-go | Ecosystem |
| JetBrains Survey | Go ecosystem 2025 | Trends, practices |

#### 10. go-templ-htmx
| Source Type | URL/Resource | What to Extract |
|-------------|--------------|-----------------|
| Templ Docs | https://templ.guide/ | Component patterns |
| HTMX Docs | https://htmx.org/docs/ | Attributes, patterns |
| GitHub | https://github.com/a-h/templ | Integration patterns |
| HTMX Essays | https://htmx.org/essays/ | Philosophy, anti-patterns |
| ThePrimeagen | Go + HTMX content | Real-world patterns |

#### 11. fastapi-patterns
| Source Type | URL/Resource | What to Extract |
|-------------|--------------|-----------------|
| Official Docs | https://fastapi.tiangolo.com/ | Async patterns, Pydantic |
| GitHub Issues | https://github.com/tiangolo/fastapi/issues | Common mistakes |
| SQLAlchemy | https://docs.sqlalchemy.org/ | Async SQLAlchemy patterns |
| Real Python | FastAPI tutorials | Practical patterns |
| Awesome FastAPI | https://github.com/mjhea0/awesome-fastapi | Ecosystem |

#### 12. rag-patterns
| Source Type | URL/Resource | What to Extract |
|-------------|--------------|-----------------|
| LangChain Docs | https://python.langchain.com/docs/ | Retrieval patterns |
| LlamaIndex | https://docs.llamaindex.ai/ | Indexing strategies |
| OpenAI Cookbook | https://cookbook.openai.com/ | Embedding patterns |
| Pinecone Blog | https://www.pinecone.io/learn/ | Vector DB patterns |
| Anthropic Docs | https://docs.anthropic.com/ | Claude-specific patterns |

#### 13. cloudflare-workers
| Source Type | URL/Resource | What to Extract |
|-------------|--------------|-----------------|
| Official Docs | https://developers.cloudflare.com/workers/ | D1, KV, R2, Queues |
| GitHub | https://github.com/cloudflare/workers-sdk | Wrangler, examples |
| Cloudflare Blog | https://blog.cloudflare.com/ | New features, patterns |
| Discord | Cloudflare Discord | Common issues |
| Hono Integration | https://hono.dev/docs/getting-started/cloudflare-workers | Framework patterns |

#### 14. expo-mobile
| Source Type | URL/Resource | What to Extract |
|-------------|--------------|-----------------|
| Official Docs | https://docs.expo.dev/ | Managed workflow, EAS |
| GitHub Issues | https://github.com/expo/expo/issues | Build issues, gotchas |
| Expo Blog | https://blog.expo.dev/ | New features |
| React Native | https://reactnative.dev/docs/getting-started | Underlying concepts |
| App.js Conf | Talks | Community patterns |

#### 15. trpc-patterns
| Source Type | URL/Resource | What to Extract |
|-------------|--------------|-----------------|
| Official Docs | https://trpc.io/docs | Routers, procedures, React Query |
| GitHub Issues | https://github.com/trpc/trpc/issues | Type inference gotchas |
| T3 Stack | https://create.t3.gg/ | Integration patterns |
| Theo | T3 videos | Practical patterns |
| Discord | tRPC Discord | Common mistakes |

---

## Collaboration & Handoff Map

### Skill Relationships Diagram

```
                    ┌─────────────────┐
                    │   frontend      │
                    │   (Layer 2)     │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ svelte5       │   │ vue3          │   │ angular       │
│ sveltekit     │   │ nuxt3         │   │ signals       │
└───────┬───────┘   └───────┬───────┘   └───────────────┘
        │                   │
        └─────────┬─────────┘
                  │
                  ▼
          ┌───────────────┐
          │ playwright    │ ◄─── Testing for all frameworks
          └───────────────┘


┌─────────────────┐         ┌─────────────────┐
│   backend       │         │   data          │
│   (Layer 2)     │         │   (Layer 2)     │
└────────┬────────┘         └────────┬────────┘
         │                           │
    ┌────┴────┐                      │
    │         │                      │
    ▼         ▼                      ▼
┌───────┐ ┌───────┐          ┌───────────────┐
│ hono  │ │gin/go │          │ drizzle-orm   │
│fastapi│ │templ  │          │               │
└───────┘ └───────┘          └───────────────┘


┌─────────────────┐         ┌─────────────────┐
│   ai            │         │   integration   │
│   (Layer 2)     │         │                 │
└────────┬────────┘         └────────┬────────┘
         │                           │
         ▼                      ┌────┴────┐
┌───────────────┐               │         │
│ rag-patterns  │               ▼         ▼
└───────────────┘         ┌───────┐ ┌─────────────┐
                          │ trpc  │ │ go-templ    │
                          │       │ │ -htmx       │
                          └───────┘ └─────────────┘


┌─────────────────┐         ┌─────────────────┐
│ cloudflare      │         │ expo-mobile     │
│ workers         │         │                 │
└─────────────────┘         └─────────────────┘
```

### Delegation Triggers Between Skills

| From Skill | Trigger | Delegate To | What's Passed | What's Received |
|------------|---------|-------------|---------------|-----------------|
| svelte5-patterns | "routing" or "SSR" | sveltekit-fullstack | Component requirements | Full-stack integration |
| sveltekit-fullstack | "database" | drizzle-orm | Data model needs | Schema + queries |
| vue3-composition | "routing" or "SSR" | nuxt3-patterns | Component requirements | Full-stack integration |
| nuxt3-patterns | "database" | drizzle-orm | Data model needs | Schema + queries |
| drizzle-orm | "API layer" | hono-patterns / fastapi | Schema | API endpoints |
| playwright-testing | "unit tests" | (vitest/jest skill) | Test patterns | Unit test coverage |
| hono-patterns | "edge deployment" | cloudflare-workers | API code | Deployed worker |
| go-web-gin | "templates" | go-templ-htmx | Handler patterns | Full-stack Go |
| fastapi-patterns | "LLM integration" | rag-patterns | API structure | RAG implementation |
| rag-patterns | "vector storage" | (vector-db skill) | Embedding needs | Storage patterns |
| trpc-patterns | "frontend" | (react/vue skill) | Type definitions | Client integration |
| expo-mobile | "native modules" | (react-native skill) | Feature needs | Native code |
| cloudflare-workers | "framework" | hono-patterns | Worker needs | Framework patterns |
| angular-signals | "state management" | (ngrx skill) | State needs | Store patterns |

---

## Implementation Order

### Phase 1: Foundation (Week 1)
Build skills that have no dependencies first:

1. **drizzle-orm** - Database layer, no dependencies
2. **playwright-testing** - Testing layer, no dependencies
3. **hono-patterns** - Minimal framework, no dependencies

### Phase 2: Frontend Frameworks (Week 1-2)
Build frontend skills that pair with foundation:

4. **svelte5-patterns** - Standalone framework skill
5. **vue3-composition** - Standalone framework skill
6. **angular-signals** - Standalone framework skill

### Phase 3: Full-Stack Extensions (Week 2)
Build skills that extend frontend frameworks:

7. **sveltekit-fullstack** - Extends svelte5, uses drizzle
8. **nuxt3-patterns** - Extends vue3, uses drizzle
9. **trpc-patterns** - API layer, uses drizzle

### Phase 4: Backend & AI (Week 2-3)
Build backend and specialized skills:

10. **fastapi-patterns** - Python backend
11. **go-web-gin** - Go backend
12. **rag-patterns** - AI/LLM patterns

### Phase 5: Integration & Platform (Week 3)
Build platform-specific and integration skills:

13. **go-templ-htmx** - Integrates Go + templates
14. **cloudflare-workers** - Edge platform
15. **expo-mobile** - Mobile platform

---

## Task Breakdown Per Skill

### For Each Skill (Repeat 15 times):

#### Step 1: Research Phase
**Files:** None (output to memory)
**Time:** 30-45 min

1. Fetch official documentation
2. Search GitHub issues for "top pain points"
3. Search Stack Overflow for common questions
4. Find awesome-lists and expert content
5. Document findings in research object

#### Step 2: Validation Gate
**Files:** None (validation check)
**Time:** 5 min

Verify:
- [ ] 5+ real pain points documented
- [ ] 3+ alternatives identified
- [ ] 2+ expert sources found
- [ ] Breaking changes noted

#### Step 3: Create skill.yaml
**Files:** `skills/{category}/{skill-id}/skill.yaml`
**Time:** 45-60 min

1. Write world-class identity (battle scars, opinions, history)
2. Document 4-6 patterns with copy-paste code
3. Document 4-6 anti-patterns with real consequences
4. Define handoffs to related skills

#### Step 4: Create sharp-edges.yaml
**Files:** `skills/{category}/{skill-id}/sharp-edges.yaml`
**Time:** 30-45 min

1. Document 8-12 sharp edges from research
2. Write detection patterns (regex)
3. Include symptoms and solutions
4. Assign severity levels

#### Step 5: Create validations.yaml
**Files:** `skills/{category}/{skill-id}/validations.yaml`
**Time:** 20-30 min

1. Convert sharp edges to automated checks
2. Test regex patterns
3. Write actionable fix messages
4. Target correct file types

#### Step 6: Create collaboration.yaml
**Files:** `skills/{category}/{skill-id}/collaboration.yaml`
**Time:** 20-30 min

1. Define prerequisites
2. Map 5-10 complementary skills
3. Define delegation triggers
4. Add cross-domain insights

#### Step 7: Quality Scoring
**Files:** None (scoring check)
**Time:** 10 min

Score against 100-point rubric:
- Identity Depth: /25
- Sharp Edges Quality: /25
- Patterns & Anti-Patterns: /25
- Collaboration & Ecosystem: /25

**Minimum: 80/100 to ship**

---

## Quality Checklist (Apply to Each Skill)

### Before Completing Each Skill:

**Identity:**
- [ ] Sounds like a real 10-year expert
- [ ] Has 5-7 concrete principles with reasoning
- [ ] Includes contrarian insights
- [ ] Documents history and evolution
- [ ] States explicit limits and prerequisites

**Sharp Edges (8-12):**
- [ ] Each from real GitHub issues/SO questions
- [ ] Specific situation, not theoretical
- [ ] Real consequences (not "it's bad practice")
- [ ] Working solutions with code
- [ ] Detection patterns tested
- [ ] Symptoms are observable

**Patterns (4-6):**
- [ ] Copy-paste ready code
- [ ] Explains when to use
- [ ] From expert content, not generic

**Anti-Patterns (4-6):**
- [ ] Non-obvious "why"
- [ ] Shows transformation (wrong -> right)
- [ ] From real failure post-mortems

**Validations (8-12):**
- [ ] Regex tested against 5+ samples
- [ ] No false positives
- [ ] Fix action is specific
- [ ] File types correctly targeted

**Collaboration:**
- [ ] Prerequisites listed (skills + knowledge)
- [ ] 5-10 complementary skills with relationships
- [ ] 3-5 delegation triggers with context
- [ ] Cross-domain insights (2-3 minimum)
- [ ] Ecosystem defined (tools, alternatives, deprecated)

---

## Execution Options

**Plan complete and saved to `docs/plans/2025-12-28-t0-t1-skill-expansion.md`.**

### Two execution options:

**1. Subagent-Driven (this session)**
- Dispatch fresh subagent per skill
- Review between skills
- Fast iteration

**2. Parallel Session (separate)**
- Open new session with executing-plans
- Batch execution with checkpoints

**Which approach?**

---

## Appendix A: Skill Template

```yaml
# skill.yaml template
id: {skill-id}
name: {Skill Name}
version: 1.0.0
layer: 1
description: {One-line description}

owns:
  - {concept-1}
  - {concept-2}

pairs_with:
  - {related-skill-1}
  - {related-skill-2}

requires: []

tags:
  - {tag1}
  - {tag2}

triggers:
  - "{trigger phrase 1}"
  - "{trigger phrase 2}"

identity: |
  # WHO YOU ARE
  You're a {role} who's {specific experience}. You've {battle scars}.

  # STRONG OPINIONS
  Your core principles:
  1. {Principle with reasoning}
  2. {Principle with reasoning}
  3. {Principle with reasoning}

  # CONTRARIAN INSIGHT
  What most {domain} developers get wrong: {insight}

  # HISTORY & EVOLUTION
  The field evolved from {past} -> {present} because {why}.
  Where it's heading: {future}

  # KNOWING YOUR LIMITS
  What you don't cover: {limits}
  When to defer: {handoff triggers}

patterns:
  - name: {Pattern Name}
    description: {What it achieves}
    when: {When to use}
    example: |
      // Code example

anti_patterns:
  - name: {Anti-Pattern Name}
    description: {What people do wrong}
    why: {Non-obvious consequences}
    instead: |
      // Correct approach

handoffs:
  - trigger: "{keyword}"
    to: {other-skill}
    context: {Why this handoff}
```

## Appendix B: Detection Pattern Library

```yaml
# Common patterns for these skills

# Svelte 5
svelte4_reactive: '\$:\s*\w+\s*='  # Old reactive syntax
svelte_store_import: "from 'svelte/store'"  # May need $state instead

# Vue 3
options_api: 'export default \{[^}]*data\s*\(\)'  # Options API
vue2_reactive: 'Vue\.set\('  # Vue 2 reactivity

# Angular
zone_change_detection: 'ChangeDetectorRef'  # May not need with signals
rxjs_subscribe_leak: '\.subscribe\([^)]+\)(?![^;]*unsubscribe)'

# Drizzle
raw_sql_in_drizzle: 'sql`[^`]*\$\{'  # SQL injection risk
missing_relation: 'references\(\)'  # Missing foreign key

# Playwright
page_wait_timeout: 'waitForTimeout\('  # Anti-pattern
bad_locator: 'page\.\$\('  # Should use getByRole

# Hono
sync_handler: 'c\.json\([^)]*await'  # Missing async
missing_middleware: 'Hono\(\)(?![^;]*use)'

# Go
goroutine_leak: 'go func\(\)[^{]*\{(?![^}]*done)'
gin_no_validation: 'ShouldBind(?!JSON)'

# FastAPI
sync_route: 'def \w+\([^)]*\):'  # Should be async
no_response_model: '@app\.\w+\([^)]*\)(?![^)]*response_model)'

# RAG
chunk_too_large: 'chunk_size\s*=\s*[5-9]\d{3}'  # >5000 tokens
no_overlap: 'chunk_overlap\s*=\s*0'

# tRPC
any_in_procedure: 'input\s*:\s*z\.any\(\)'
missing_error_handler: 'publicProcedure(?![^;]*onError)'
```
