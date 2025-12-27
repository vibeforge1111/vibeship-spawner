 # Spawner Skill Management - Recommended Improvements

  ## Current Issues to Fix

  ### 1. Skill Discovery Problems
  - `skill.triggers.some is not a function` error during search
  - Skills in directory not appearing in list/search results
  - Inconsistent skill naming (kebab-case vs Title Case)

  ### 2. File Access Limitations
  - `get` action only returns combined markdown, not individual files
  - No way to access raw skill.yaml, sharp-edges.yaml, validations.yaml, etc.  
  - Can't do 1:1 file copies between projects

  ### 3. Create vs Get Confusion
  - Spawner defaults to creating new skills even when they exist
  - No clear "does this skill exist?" check before scaffold

  ---

  ## Recommended Spawner MCP Enhancements

  ### A. New Action: `get_files`

  Return all individual files for a skill:

  ```typescript
  spawner_skills({
    action: "get_files",
    name: "Event Architect"  // or id: "event-architect"
  })

  // Returns:
  {
    "skill_id": "event-architect",
    "files": {
      "skill.yaml": "id: event-architect\nname: Event Architect\n...",
      "sharp-edges.yaml": "sharp_edges:\n  - id: ...",
      "validations.yaml": "validations:\n  - id: ...",
      "collaboration.yaml": "prerequisites:\n  skills: ...",
      "patterns.md": "# Patterns: Event Architect\n...",
      "anti-patterns.md": "# Anti-Patterns: Event Architect\n...",
      "decisions.md": "# Decisions: Event Architect\n...",
      "sharp-edges.md": "# Sharp Edges: Event Architect\n..."
    },
    "source_path": "skills/development/event-architect/"
  }

  B. New Action: exists

  Check if skill exists before any create operation:

  spawner_skills({
    action: "exists",
    name: "graph-engineer"  // accepts id or name
  })

  // Returns:
  {
    "exists": true,
    "skill_id": "graph-engineer",
    "name": "Graph Engineer",
    "source": "v2",
    "path": "skills/development/graph-engineer/"
  }

  // Or if not found:
  {
    "exists": false,
    "similar": ["graph-database", "knowledge-graph"],  // fuzzy matches        
    "suggestion": "Did you mean 'graph-database'?"
  }

  C. Improved list Action

  Include file paths and completeness check:

  spawner_skills({
    action: "list",
    tag: "ai-memory",
    include_paths: true
  })

  // Returns:
  {
    "skills": [
      {
        "id": "event-architect",
        "name": "Event Architect",
        "path": "skills/development/event-architect/",
        "files": ["skill.yaml", "sharp-edges.yaml", "collaboration.yaml"],     
        "missing_files": ["validations.yaml", "patterns.md"],
        "source": "v2",
        "complete": false
      },
      ...
    ]
  }

  D. Fix search Action

  Handle missing/malformed triggers gracefully:

  // In skill indexing code:
  function indexSkill(skill) {
    // Defensive handling of triggers
    const triggers = Array.isArray(skill.triggers)
      ? skill.triggers
      : (typeof skill.triggers === 'string' ? [skill.triggers] : []);

    // Safe search
    return triggers.some(t => typeof t === 'string' && t.includes(query));     
  }

  E. Skill ID Normalization

  Consistent handling of skill identifiers:

  function normalizeSkillId(input: string): string {
    // Handle various formats
    // "Event Architect" -> "event-architect"
    // "event-architect" -> "event-architect"
    // "EventArchitect" -> "event-architect"

    return input
      .toLowerCase()
      .replace(/([a-z])([A-Z])/g, '$1-$2')  // camelCase
      .replace(/\s+/g, '-')                   // spaces
      .replace(/[^a-z0-9-]/g, '')             // special chars
      .replace(/-+/g, '-');                   // multiple dashes
  }

  // Use in all skill lookups
  function findSkill(idOrName: string) {
    const normalized = normalizeSkillId(idOrName);
    return skills.find(s =>
      normalizeSkillId(s.id) === normalized ||
      normalizeSkillId(s.name) === normalized
    );
  }

  ---
  Recommended Spawner Prompt Addition

  Add this to Spawner's system prompt or CLAUDE.md:

  ## Skill Management Rules

  ### Before Creating Any Skill
  1. ALWAYS check if skill exists first: `spawner_skills({ action: "exists", name: "..." })`
  2. If exists, use `get` or `get_files` to retrieve it
  3. Only use `spawner_skill_new` if skill definitively does not exist

  ### Skill Naming
  - IDs are kebab-case: `event-architect`, `ml-memory`
  - Names are Title Case: `Event Architect`, `ML Memory Engineer`
  - Both should resolve to the same skill

  ### File Structure for V2 Skills
  Every complete V2 skill has 8 files:
  skill-name/
  ├── skill.yaml           # Identity, patterns, anti-patterns, handoffs       
  ├── sharp-edges.yaml     # Machine-readable gotchas with detection
  ├── validations.yaml     # Automated code checks
  ├── collaboration.yaml   # Cross-skill collaboration rules
  ├── patterns.md          # Deep-dive patterns with code examples
  ├── anti-patterns.md     # What to avoid and why
  ├── decisions.md         # Decision frameworks
  └── sharp-edges.md       # Detailed gotchas in prose

  ### When User Asks for a Skill
  1. First: `spawner_skills({ action: "exists", name: "..." })`
  2. If exists: `spawner_skills({ action: "get_files", name: "..." })`
  3. If not exists: Ask user if they want to create it
  4. Never assume a skill doesn't exist just because search failed

  ### Error Recovery
  - If `search` fails with function error, fall back to `list` with filters    
  - If skill not found by ID, try by name (and vice versa)
  - Log and report indexing errors, don't silently fail

  ---
  Implementation Priority

  1. Critical: Fix search function error (skill.triggers.some)
  2. Critical: Add exists action to prevent duplicate creation
  3. High: Add get_files action for raw file access
  4. High: Normalize skill ID/name handling
  5. Medium: Improve list with file completeness info
  6. Medium: Add fuzzy matching for skill lookup

  ---
  Testing Checklist

  After implementing, verify:
  - spawner_skills({ action: "search", query: "graph" }) works without error   
  - spawner_skills({ action: "exists", name: "graph-engineer" }) returns correct result
  - spawner_skills({ action: "get_files", name: "Event Architect" }) returns all 8 files
  - spawner_skills({ action: "list", tag: "ai-memory" }) shows all relevant skills
  - Creating a skill that exists shows warning/error instead of duplicating 