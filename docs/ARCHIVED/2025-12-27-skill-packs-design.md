# Spawner Skill Packs - Final Design

> **Status**: Approved & Implemented
> **Date**: December 27, 2025
> **Goal**: Zero-cost local skill loading with vibe-coder-first UX

---

## Executive Summary

Transform Spawner from API-based skill loading (costs money per call) to local file-based loading (free forever). Design prioritizes non-developers who are vibe coding for the first time.

**Key Simplification**: No new MCP tools needed. Claude uses its existing tools:
- `Bash` to clone the skills repo on first use
- `Read` to load skill YAML files locally
- No API calls, no new servers, no npm installs

---

## 1. Category Restructure

### Remove
- `mind/` - Product name, not a category. Redistribute skills.
- `pattern/` - Merge into `development/`

### Final Categories (11)

| Category | Purpose |
|----------|---------|
| `communications` | Writing, pitching, investor comms |
| `design` | UI, UX, branding, landing pages |
| `development` | Backend, frontend, devops, security, QA |
| `frameworks` | React, Next.js, Vue, Svelte, etc. |
| `integration` | APIs, webhooks, third-party services |
| `marketing` | Growth, content, SEO, social |
| `product` | PM, roadmapping, prioritization |
| `startup` | YC, fundraising, founder skills |
| `strategy` | Business, market, competitive analysis |
| `data` | Databases, vectors, graphs, data engineering |
| `ai` | LLM, ML, embeddings, causal inference |

### Mind Skills Redistribution

| Skill | New Category |
|-------|--------------|
| postgres-wizard | `data` |
| redis-specialist | `data` |
| vector-specialist | `data` |
| data-engineer | `data` |
| graph-engineer | `data` |
| temporal-craftsman | `data` |
| llm-architect | `ai` |
| ml-memory | `ai` |
| causal-scientist | `ai` |
| event-architect | `development` |
| api-designer | `development` |
| python-craftsman | `development` |
| auth-specialist | `development` |
| code-reviewer | `development` |
| test-architect | `development` |
| infra-architect | `development` |
| observability-sre | `development` |
| performance-hunter | `development` |
| migration-specialist | `development` |
| chaos-engineer | `development` |
| sdk-builder | `development` |
| docs-engineer | `development` |
| realtime-engineer | `development` |
| privacy-guardian | `development` |

---

## 2. Pack Structure (Hybrid)

### Tier 1: Essentials (~30 skills)

```
spawner-essentials/
├── manifest.yaml
├── backend/
├── frontend/
├── api-designer/
├── code-reviewer/
├── test-architect/
├── devops/
├── security/
├── ui-design/
├── ux-design/
├── product-manager/
├── llm-architect/
├── postgres-wizard/
└── ... (most-used skills)
```

**Installs automatically on first use.** Covers 80% of vibe coding needs.

### Tier 2: Domain Packs

| Pack | Contents | Who needs it |
|------|----------|--------------|
| `spawner-data` | postgres, redis, vectors, graphs, temporal | Data-heavy projects |
| `spawner-ai` | llm-architect, ml-memory, causal-scientist | AI/ML builders |
| `spawner-startup` | yc-partner, fundraising, pitch-deck | Founders |
| `spawner-marketing` | growth, seo, content, social-media | Marketing focus |
| `spawner-frameworks` | react, nextjs, vue, svelte | Framework-specific |
| `spawner-design` | branding, landing-page, ui, ux | Design-heavy |
| `spawner-comms` | writing, investor-updates, pitching | Communications |

**Auto-installed when needed.** Claude detects and expands conversationally.

### Tier 3: Complete

```
spawner-complete/     # All 100+ skills
```

For power users who want everything upfront.

---

## 3. Smart Install (Deduplication)

When installing a pack, skip skills already present:

```python
def install_pack(pack_name: str) -> Result:
    installed_skills = get_all_installed_skill_ids()

    for skill in pack.skills:
        if skill.id in installed_skills:
            source = find_source_pack(skill.id)
            log(f"Skipping {skill.id} (already in {source})")
            continue
        install_skill(skill)

    update_registry(pack_name, installed_count)
```

**First-installed wins.** No version conflicts between packs.

---

## 4. Directory Structure

### Cross-Platform Paths

```
Windows:  %USERPROFILE%\.spawner\skills\
macOS:    ~/.spawner/skills/
Linux:    ~/.spawner/skills/
```

### Layout

```
~/.spawner/
├── registry.yaml              # Installed packs tracker
├── skills/
│   ├── spawner-essentials/
│   │   ├── manifest.yaml
│   │   ├── backend/
│   │   │   ├── skill.yaml
│   │   │   ├── sharp-edges.yaml
│   │   │   ├── validations.yaml
│   │   │   └── collaboration.yaml
│   │   └── ...
│   └── spawner-data/
│       └── ...
└── cache/                     # Temporary downloads
```

### Registry Format

```yaml
installed:
  - pack: spawner-essentials
    version: 1.0.0
    installed_at: 2025-12-27T10:30:00Z
    skills_count: 30
    skills: [backend, frontend, api-designer, ...]

  - pack: spawner-data
    version: 1.0.0
    installed_at: 2025-12-27T11:00:00Z
    skills_count: 6
    skills: [postgres-wizard, redis-specialist, ...]

settings:
  auto_update_check: true
  last_update_check: 2025-12-27T10:30:00Z
```

### Pack Manifest Format

```yaml
id: spawner-essentials
name: Spawner Essentials
version: 1.0.0
description: Core skills for building apps
author: Vibeship

skills:
  - id: backend
    checksum: sha256:abc123...
  - id: frontend
    checksum: sha256:def456...

min_spawner_version: "2.0.0"
```

---

## 5. Vibe-Coder UX

### Design Principles

1. **Zero config** - First use installs essentials automatically
2. **No jargon** - "skills" not "packs", "expertise" not "manifests"
3. **Auto-expand** - Need a skill? Claude installs it conversationally
4. **Invisible paths** - User never sees file operations
5. **Friendly errors** - Plain English with auto-recovery
6. **One happy path** - Setup → Build → Ship

### Simplified API

| Tool | Purpose | UX |
|------|---------|-----|
| `spawner_setup()` | First-time install | "Want me to set up my skills?" → "Done!" |
| `spawner_expand({ need })` | Auto-install domain pack | Invisible, conversational |
| `spawner_become({ expert })` | Load a skill | "Let me put on my backend hat..." |
| `spawner_status()` | Check what's installed | "You have 45 skills ready" |

### Conversation Flow

**First time:**
```
User: "Help me build an app"

Claude: "I notice my skills aren't set up yet. Want me to grab them?
         This gives me expertise in building apps, design, and more."

User: "yes"

Claude: [spawner_setup()]
        "Done! I now have 30 expert skills ready. Let's build your app."
```

**Auto-expansion:**
```
User: "I need vector search for my AI app"

Claude: [detects vector-specialist not installed]
        "I need to grab my vector database expertise. One sec..."

        [spawner_expand({ need: "vector search" })]

        "Got it! I now know vector databases, embeddings, and similarity search."
```

### Error Handling

**Before (technical):**
```
Error: Pack 'spawner-data' not found in registry.
Run: spawner_skills({ action: 'available' }) to see all packs
```

**After (friendly):**
```
"Hmm, I couldn't find that expertise. Let me check what's available..."
[auto-recovers and suggests alternatives]
```

### Power User Escape Hatch

Full control API for developers:
```javascript
spawner_skills({ action: "list-packs" })
spawner_skills({ action: "install", pack: "spawner-ai" })
spawner_skills({ action: "uninstall", pack: "spawner-marketing" })
spawner_skills({ action: "check-updates" })
spawner_skills({ action: "update", pack: "spawner-essentials" })
```

---

## 6. Simplified Architecture (Final)

**No new MCP tools needed.** Claude handles everything with existing capabilities:

### How It Works

```
First time:
  User: "Help me build an app"
  Claude: [Bash] git clone https://github.com/vibeforge1111/vibeship-spawner-skills ~/.spawner/skills
          "Ready! I have 105 skills loaded."

Every time after:
  User: "Help me with the backend"
  Claude: [Read] ~/.spawner/skills/development/backend/skill.yaml
          → Uses skill knowledge, zero API cost
```

### What Each Tool Does

| Claude Tool | Spawner Purpose |
|-------------|-----------------|
| `Bash` | Clone repo, update skills (`git pull`) |
| `Read` | Load skill YAML files from local disk |
| `Glob` | Find skills by pattern |

### MCP Server Role (Minimal)

The cloud MCP server (`mcp.vibeship.co`) only handles:
- Project memory (D1 database)
- Code validation
- Orchestration hints

**Skills are NEVER loaded from MCP.** Always local.

---

## 7. GitHub Repository Structure (Implemented)

```
github.com/vibeforge1111/vibeship-spawner-skills/
├── README.md                     # Setup instructions
├── registry.yaml                 # Pack definitions
├── CLAUDE_INSTRUCTIONS.md        # How Claude loads skills
├── .gitignore
│
├── development/                  # 31 skills
│   ├── backend/
│   ├── frontend/
│   ├── api-designer/
│   └── ...
│
├── data/                         # 6 skills
│   ├── postgres-wizard/
│   ├── vector-specialist/
│   └── ...
│
├── ai/                           # 3 skills
│   ├── llm-architect/
│   ├── ml-memory/
│   └── causal-scientist/
│
├── design/                       # 4 skills
├── frameworks/                   # 6 skills
├── marketing/                    # 33 skills
├── startup/                      # 3 skills
├── strategy/                     # 2 skills
├── communications/               # ? skills
├── integration/                  # ? skills
└── product/                      # 4 skills
```

**Total: 105 skills across 11 categories**

---

## 8. Implementation Status

### Phase 1: Category Restructure [DONE]
- [x] Create `data/` and `ai/` categories
- [x] Move 25 Mind skills to proper categories
- [x] Merge `pattern/` into `development/`
- [x] Delete empty `mind/` and `pattern/` directories

### Phase 2: GitHub Repo [DONE]
- [x] Create `spawner-skills/` repo structure
- [x] Copy all 105 skills to new repo
- [x] Create `registry.yaml` with pack definitions
- [x] Create `README.md` and `CLAUDE_INSTRUCTIONS.md`
- [x] Initialize git repo

### Phase 3: Deployment [TODO]
- [ ] Push `spawner-skills` to GitHub
- [ ] Test clone flow on fresh machine
- [ ] Add to CLAUDE.md instructions

### Phase 4: Integration [TODO]
- [ ] Update Spawner MCP to reference local skills
- [ ] Deprecate KV-based skill loading
- [ ] Monitor adoption

---

## 9. Cost Analysis

| Operation | Before (KV API) | After (Local) |
|-----------|-----------------|---------------|
| First-time setup | N/A | **$0** (git clone) |
| Load skill | ~$0.02-0.05 | **$0** (file read) |
| Load 10 skills/session | ~$0.20-0.50 | **$0** |
| Update skills | N/A | **$0** (git pull) |
| Monthly (heavy use) | ~$50-100 | **$0** |

**Total infrastructure cost: $0**

---

## 10. Success Metrics

- **Setup success rate**: >95% first-time users complete setup
- **Time to first skill**: <5 seconds after setup
- **Auto-expand accuracy**: >90% correct pack for stated need
- **Zero jargon exposure**: Non-devs never see paths/manifests/versions
