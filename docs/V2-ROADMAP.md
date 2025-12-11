# vibeship-spawner V2 Roadmap

## Priority 1: Telemetry & Analytics System

### Why This Matters
Understanding where users hit rabbit holes and which skills fall short allows us to continuously improve the agent system based on real usage patterns.

### What We'll Track (Anonymized)
- Guardrail failures (which check, which skill)
- Escape hatch triggers (circular behavior detection)
- Task retries (same task attempted multiple times)
- Skill switches (frequent back-and-forth patterns)
- Project type + user level correlations

### Implementation
1. **Local logging** - `telemetry.json` in project (always on, stays local)
2. **Opt-in sharing** - User explicitly enables "Share with vibeship"
3. **Anonymous aggregation** - No code, no ideas, just patterns
4. **Workers endpoint** - `POST /analytics` to Cloudflare Worker
5. **Dashboard** - View aggregate patterns to improve skills

### Privacy First
- Opt-in only (not opt-out)
- No actual code or project content captured
- Only pattern data (skill X failed check Y)
- Clear explanation of what's shared when enabling

### Insights We'll Gain
- Which skills need better patterns/anti-patterns
- Which integration points cause most friction
- Where beginners vs experts struggle differently
- Which guardrails catch issues most often

---

## Other V2 Ideas (Unprioritized)

- [ ] Community skill marketplace
- [ ] Custom skill builder UI
- [ ] Skill performance benchmarking
- [ ] Integration with vibeship pro features
