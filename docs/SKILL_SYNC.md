# Skill Synchronization Architecture

> Single source of truth: **spawner-skills** repository

## The Problem This Solves

Skills exist in multiple locations. Without clear ownership, counts drift apart (we've seen 208, 245, 273 in different places). This document defines the sync architecture.

## Skill Locations

```
┌─────────────────────────────────────────────────────────────────────┐
│                        SOURCE OF TRUTH                               │
│                                                                      │
│   github.com/vibeforge1111/vibeship-spawner-skills                  │
│   └── 273 skills (development/, ai/, data/, etc.)                   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                │
                                │ git clone / git pull
                                ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        DERIVED COPIES                                │
│                                                                      │
│   1. ~/.spawner/skills/          ← User's local copy                │
│      (installed via npx vibeship-spawner-skills install)            │
│                                                                      │
│   2. vibeship-orchestrator/spawner-v2/skills/                       │
│      (MCP server's internal copy - synced manually)                 │
│                                                                      │
│   3. vibeship-orchestrator/web/src/lib/data/skills.json             │
│      (Website display - generated from spawner-skills)              │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Sync Rules

| Location | Updated By | Update Trigger |
|----------|------------|----------------|
| spawner-skills repo | Developer | When adding/modifying skills |
| ~/.spawner/skills | User | `npx vibeship-spawner-skills update` |
| spawner-v2/skills | Developer | `node scripts/sync-skills.js sync` |
| web/skills.json | Developer | `node scripts/generate-skills-json.js` |

## When to Sync

### After Adding New Skills

```bash
# 1. Add skills to spawner-skills repo
cd spawner-skills
# ... add new skill folders ...
git add -A && git commit -m "feat: add new skill X" && git push

# 2. Sync to spawner-v2
cd vibeship-orchestrator
node scripts/sync-skills.js sync

# 3. Regenerate website JSON
node scripts/generate-skills-json.js

# 4. Commit and push
git add -A && git commit -m "sync: update skills from spawner-skills" && git push
```

### Verification Checklist

Run this to verify all locations are in sync:

```bash
# From vibeship-orchestrator directory
node scripts/sync-skills.js check
```

Expected output when in sync:
```
Source (spawner-skills): 273 skills
Target (spawner-v2):     273 skills

✓ Skills are in sync!
```

## Preventing Drift

### DO
- Always add new skills to **spawner-skills** first
- Run sync-skills.js after any skill changes
- Update documentation counts using actual skill counts
- Use "273+" in marketing (allows for growth without constant updates)

### DON'T
- Add skills directly to spawner-v2/skills (they'll be overwritten)
- Hardcode specific counts in multiple places
- Assume counts are correct without running verification

## Quick Reference

| Task | Command |
|------|---------|
| Check sync status | `node scripts/sync-skills.js check` |
| Sync spawner-v2 | `node scripts/sync-skills.js sync` |
| Regenerate website | `node scripts/generate-skills-json.js` |
| Count skills | `node scripts/sync-skills.js count` |
| Update user install | `npx vibeship-spawner-skills update` |

## CI Integration (Future)

Consider adding GitHub Actions to:
1. Validate skill counts match on PR
2. Auto-regenerate skills.json when spawner-skills updates
3. Fail builds if sync check fails

## Current Status

| Location | Count | Status |
|----------|-------|--------|
| spawner-skills | 273 | Source of truth |
| spawner-v2/skills | 273 | ✓ Synced |
| web/skills.json | 273 | ✓ Synced |
| ~/.spawner/skills | - | User-managed |

Last verified: 2025-12-30
