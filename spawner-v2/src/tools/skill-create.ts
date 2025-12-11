/**
 * spawner_skill_create Tool
 *
 * Generate world-class V2 skills following the SKILL_SPEC.md specification.
 * Creates skills in progressive layers with proper structure.
 *
 * Layers:
 *   Layer 1 (Required): skill.yaml + sharp-edges.md (5+ gotchas)
 *   Layer 2 (Core): patterns.md + anti-patterns.md + decisions.md
 *   Layer 3 (Verification): validations/checks.yaml + boundaries.md
 *   Layer 4 (Polish): templates/, benchmarks/, examples/
 */

import { z } from 'zod';
import type { Env } from '../types.js';

/**
 * Input schema for spawner_skill_create
 */
export const skillCreateInputSchema = z.object({
  action: z.enum(['scaffold', 'preview', 'validate', 'list-types']).optional().describe(
    'Action: scaffold (default), preview (show what would be created), validate (check existing skill), list-types (show skill types)'
  ),
  id: z.string().optional().describe(
    'Skill ID in kebab-case (e.g., "nextjs-app-router", "code-cleanup")'
  ),
  name: z.string().optional().describe(
    'Human-readable skill name (e.g., "Next.js App Router", "Code Cleanup Agent")'
  ),
  type: z.enum(['core', 'integration', 'pattern']).optional().describe(
    'Skill type: core (single tech), integration (cross-tech), pattern (problem-focused)'
  ),
  description: z.string().optional().describe(
    'Brief description of what the skill does'
  ),
  owns: z.array(z.string()).optional().describe(
    'Domains this skill owns (e.g., ["server-components", "client-components"])'
  ),
  does_not_own: z.array(z.string()).optional().describe(
    'Domains to hand off to other skills (e.g., ["styling", "database"])'
  ),
  triggers: z.array(z.string()).optional().describe(
    'Phrases that activate this skill (e.g., ["next.js app router", "server component"])'
  ),
  pairs_with: z.array(z.string()).optional().describe(
    'Compatible skill IDs (e.g., ["supabase-backend", "typescript-strict"])'
  ),
  stack: z.array(z.string()).optional().describe(
    'Required technologies (e.g., ["nextjs", "react", "typescript"])'
  ),
  tags: z.array(z.string()).optional().describe(
    'Searchable tags (e.g., ["nextjs", "react", "ssr"])'
  ),
  layer: z.enum(['1', '2', '3']).optional().describe(
    'Target layer to generate: 1 (minimal), 2 (with patterns), 3 (with validations)'
  ),
});

/**
 * Tool definition for MCP
 */
export const skillCreateToolDefinition = {
  name: 'spawner_skill_new',
  description: 'Create world-class V2 skills following the SKILL_SPEC. Generates skill.yaml, sharp-edges.md, patterns.md, anti-patterns.md based on input.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      action: {
        type: 'string',
        enum: ['scaffold', 'preview', 'validate', 'list-types'],
        description: 'Action: scaffold (default), preview (show structure), validate (check skill), list-types (show skill types)',
      },
      id: {
        type: 'string',
        description: 'Skill ID in kebab-case (e.g., "nextjs-app-router")',
      },
      name: {
        type: 'string',
        description: 'Human-readable skill name (e.g., "Next.js App Router")',
      },
      type: {
        type: 'string',
        enum: ['core', 'integration', 'pattern'],
        description: 'Skill type: core (single tech), integration (cross-tech), pattern (problem-focused)',
      },
      description: {
        type: 'string',
        description: 'Brief description of what the skill does',
      },
      owns: {
        type: 'array',
        items: { type: 'string' },
        description: 'Domains this skill owns',
      },
      does_not_own: {
        type: 'array',
        items: { type: 'string' },
        description: 'Domains to hand off to other skills',
      },
      triggers: {
        type: 'array',
        items: { type: 'string' },
        description: 'Phrases that activate this skill',
      },
      pairs_with: {
        type: 'array',
        items: { type: 'string' },
        description: 'Compatible skill IDs',
      },
      stack: {
        type: 'array',
        items: { type: 'string' },
        description: 'Required technologies',
      },
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Searchable tags',
      },
      layer: {
        type: 'string',
        enum: ['1', '2', '3'],
        description: 'Target layer: 1 (minimal), 2 (with patterns), 3 (with validations)',
      },
    },
    required: [],
  },
};

/**
 * Output type
 */
export interface SkillCreateOutput {
  action: string;
  skill_id?: string;
  files?: {
    path: string;
    content: string;
    description: string;
  }[];
  validation_result?: {
    valid: boolean;
    layer: number;
    issues: string[];
    suggestions: string[];
  };
  types?: {
    name: string;
    description: string;
    directory: string;
    examples: string[];
  }[];
  _instruction: string;
}

/**
 * Execute the spawner_skill_create tool
 */
export async function executeSkillCreate(
  _env: Env,
  input: z.infer<typeof skillCreateInputSchema>
): Promise<SkillCreateOutput> {
  const parsed = skillCreateInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(`Invalid input: ${parsed.error.message}`);
  }

  const action = parsed.data.action ?? 'scaffold';

  switch (action) {
    case 'list-types':
      return handleListTypes();

    case 'preview':
      return handlePreview(parsed.data);

    case 'scaffold':
      return handleScaffold(parsed.data);

    case 'validate':
      return handleValidate(parsed.data);

    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

/**
 * List skill types
 */
function handleListTypes(): SkillCreateOutput {
  return {
    action: 'list-types',
    types: [
      {
        name: 'core',
        description: 'Deep expertise in a single technology. The foundation layer.',
        directory: 'skills/core/',
        examples: ['nextjs-app-router', 'typescript-strict', 'supabase-backend', 'tailwind-ui'],
      },
      {
        name: 'integration',
        description: 'Cross-technology knowledge. Combines multiple core skills.',
        directory: 'skills/integration/',
        examples: ['nextjs-supabase-auth', 'vercel-deployment', 'stripe-nextjs'],
      },
      {
        name: 'pattern',
        description: 'Problem-focused skills that solve specific recurring problems.',
        directory: 'skills/pattern/',
        examples: ['code-cleanup', 'code-architecture-review', 'mcp-product'],
      },
    ],
    _instruction: buildTypesInstruction(),
  };
}

/**
 * Preview what would be created
 */
function handlePreview(input: z.infer<typeof skillCreateInputSchema>): SkillCreateOutput {
  const { id, name, type, layer = '1' } = input;

  if (!id || !name || !type) {
    return {
      action: 'preview',
      _instruction: buildMissingFieldsInstruction(['id', 'name', 'type'].filter(f => !input[f as keyof typeof input])),
    };
  }

  const files = generateSkillFiles(input, parseInt(layer, 10));

  return {
    action: 'preview',
    skill_id: id,
    files: files.map(f => ({
      path: f.path,
      content: f.content.substring(0, 500) + (f.content.length > 500 ? '\n... (truncated for preview)' : ''),
      description: f.description,
    })),
    _instruction: buildPreviewInstruction(id, type, files, parseInt(layer, 10)),
  };
}

/**
 * Generate skill scaffold
 */
function handleScaffold(input: z.infer<typeof skillCreateInputSchema>): SkillCreateOutput {
  const { id, name, type, layer = '1' } = input;

  if (!id || !name || !type) {
    return {
      action: 'scaffold',
      _instruction: buildMissingFieldsInstruction(['id', 'name', 'type'].filter(f => !input[f as keyof typeof input])),
    };
  }

  const files = generateSkillFiles(input, parseInt(layer, 10));

  return {
    action: 'scaffold',
    skill_id: id,
    files,
    _instruction: buildScaffoldInstruction(id, type, files, parseInt(layer, 10)),
  };
}

/**
 * Validate existing skill
 */
function handleValidate(input: z.infer<typeof skillCreateInputSchema>): SkillCreateOutput {
  const { id } = input;

  if (!id) {
    return {
      action: 'validate',
      _instruction: 'Provide skill id to validate an existing skill.',
    };
  }

  // This would typically load and validate an existing skill
  // For now, return validation checklist
  return {
    action: 'validate',
    skill_id: id,
    validation_result: {
      valid: false,
      layer: 0,
      issues: ['Cannot validate - skill must be loaded from filesystem'],
      suggestions: [
        'Use Claude to read the skill files directly',
        'Check skill.yaml has: id, name, version, type, owns, does_not_own, triggers',
        'Check sharp-edges.md has 5+ edges with Severity, The Trap, Why, The Fix',
        'Check patterns.md has 3+ patterns with code examples',
        'Check anti-patterns.md has 3+ anti-patterns with fixes',
      ],
    },
    _instruction: buildValidationChecklist(id),
  };
}

/**
 * Generate all skill files for a given layer
 */
function generateSkillFiles(
  input: z.infer<typeof skillCreateInputSchema>,
  targetLayer: number
): { path: string; content: string; description: string }[] {
  const {
    id,
    name,
    type,
    description = `Expert knowledge for ${name}`,
    owns = [],
    does_not_own = [],
    triggers = [],
    pairs_with = [],
    stack = [],
    tags = [],
  } = input as Required<Pick<typeof input, 'id' | 'name' | 'type'>> & typeof input;

  const baseDir = `skills/${type}/${id}`;
  const files: { path: string; content: string; description: string }[] = [];

  // Layer 1: skill.yaml (always required)
  files.push({
    path: `${baseDir}/skill.yaml`,
    content: generateSkillYaml({
      id: id!,
      name: name!,
      type: type!,
      description,
      owns,
      does_not_own,
      triggers,
      pairs_with,
      stack,
      tags,
    }),
    description: 'Skill identity and metadata',
  });

  // Layer 1: sharp-edges.md (always required)
  files.push({
    path: `${baseDir}/sharp-edges.md`,
    content: generateSharpEdges(id!, name!),
    description: 'Gotchas Claude doesn\'t know by default (5+ required)',
  });

  // Layer 2: patterns.md
  if (targetLayer >= 2) {
    files.push({
      path: `${baseDir}/patterns.md`,
      content: generatePatterns(id!, name!),
      description: 'Best practices and proven patterns (3+ required)',
    });

    files.push({
      path: `${baseDir}/anti-patterns.md`,
      content: generateAntiPatterns(id!, name!),
      description: 'Common mistakes to avoid (3+ required)',
    });

    files.push({
      path: `${baseDir}/decisions.md`,
      content: generateDecisions(id!, name!),
      description: 'Decision guidance for choosing approaches',
    });
  }

  // Layer 3: validations
  if (targetLayer >= 3) {
    files.push({
      path: `${baseDir}/validations/checks.yaml`,
      content: generateValidationsYaml(id!, name!),
      description: 'Machine-runnable validation checks',
    });

    files.push({
      path: `${baseDir}/boundaries.md`,
      content: generateBoundaries(id!, name!, does_not_own),
      description: 'Handoff triggers and limitations',
    });
  }

  return files;
}

/**
 * Generate skill.yaml content
 */
function generateSkillYaml(opts: {
  id: string;
  name: string;
  type: string;
  description: string;
  owns: string[];
  does_not_own: string[];
  triggers: string[];
  pairs_with: string[];
  stack: string[];
  tags: string[];
}): string {
  const {
    id,
    name,
    type,
    description,
    owns,
    does_not_own,
    triggers,
    pairs_with,
    stack,
    tags,
  } = opts;

  // Generate owns if empty
  const ownsSection = owns.length > 0
    ? owns.map(o => `  - ${o}`).join('\n')
    : `  - # Add domains this skill owns
  - # Example: server-components
  - # Example: data-fetching`;

  // Generate does_not_own if empty
  const doesNotOwnSection = does_not_own.length > 0
    ? does_not_own.map(o => `  - ${o} → relevant-skill`).join('\n')
    : `  - styling → tailwind-ui
  - database → supabase-backend
  - deployment → vercel-deployment`;

  // Generate triggers if empty
  const triggersSection = triggers.length > 0
    ? triggers.map(t => `  - ${t}`).join('\n')
    : `  - # Add activation phrases
  - # Example: "${name.toLowerCase()}"
  - # Example: related technology terms`;

  // Generate pairs_with if empty
  const pairsWithSection = pairs_with.length > 0
    ? pairs_with.map(p => `  - ${p}`).join('\n')
    : `  - # Add compatible skill IDs`;

  // Generate stack if empty
  const stackSection = stack.length > 0
    ? stack.map(s => `  ${s}: ">=1.0.0"`).join('\n')
    : `  # Add required technologies with versions
  # example-tech: ">=1.0.0"`;

  // Generate tags if empty
  const tagsSection = tags.length > 0
    ? tags.map(t => `  - ${t}`).join('\n')
    : `  - ${id}
  - # Add searchable tags`;

  return `id: ${id}
name: ${name}
version: 1.0.0
type: ${type}

description: |
  ${description}

owns:
${ownsSection}

does_not_own:
${doesNotOwnSection}

triggers:
${triggersSection}

pairs_with:
${pairsWithSection}

requires:
  # Add hard requirements (won't load without these)
  # - nextjs: ">=13.0.0"

stack:
${stackSection}

tags:
${tagsSection}
`;
}

/**
 * Generate sharp-edges.md content
 */
function generateSharpEdges(id: string, name: string): string {
  return `# Sharp Edges: ${name}

Sharp edges are specific gotchas that can bite developers working with ${name}.
Each edge represents knowledge earned through broken builds and reverted commits.

---

## 1. [Edge Title]

**Severity:** Critical | High | Medium | Low

**The Trap:**
\`\`\`typescript
// Code that looks right but isn't
\`\`\`

**Why It Happens:**
Explain the root cause and why this catches people off guard.

**The Fix:**
\`\`\`typescript
// Working solution
\`\`\`

**Detection Pattern:**
\`regex-to-spot-in-code\`

---

## 2. [Second Edge Title]

**Severity:** High

**The Trap:**
\`\`\`typescript
// Another common mistake
\`\`\`

**Why It Happens:**
Root cause explanation.

**The Fix:**
\`\`\`typescript
// Correct approach
\`\`\`

---

## 3. [Third Edge Title]

**Severity:** Medium

**The Trap:**
Document the subtle issue.

**Why It Happens:**
Why developers miss this.

**The Fix:**
The solution.

---

## 4. [Fourth Edge Title]

**Severity:** Warning

**The Trap:**
The problematic pattern.

**Why It Happens:**
Root cause.

**The Fix:**
Resolution.

---

## 5. [Fifth Edge Title]

**Severity:** Subtle

**The Trap:**
Hard-to-spot issue.

**Why It Happens:**
Why it's easy to miss.

**The Fix:**
How to address it.

---

<!--
CHECKLIST for Sharp Edges:
- [ ] 5+ edges documented
- [ ] Each edge has Severity, The Trap, Why, The Fix
- [ ] Code examples are copy-pastable
- [ ] Detection patterns are regex-compatible
- [ ] Edges are specific (not generic advice)
- [ ] Version-specific edges note version ranges
-->
`;
}

/**
 * Generate patterns.md content
 */
function generatePatterns(id: string, name: string): string {
  return `# Patterns: ${name}

Best practices for working with ${name}.

---

## 1. [Pattern Name]

Description of what this pattern achieves.

**When to Use:**
- Condition 1
- Condition 2

**Implementation:**
\`\`\`typescript
// Working code example
\`\`\`

**Why This Works:**
Explanation of why this is the right approach.

---

## 2. [Second Pattern Name]

Description.

**When to Use:**
- Conditions

**Implementation:**
\`\`\`typescript
// Code example
\`\`\`

---

## 3. [Third Pattern Name]

Description.

**When to Use:**
- Conditions

**Implementation:**
\`\`\`typescript
// Code example
\`\`\`

---

<!--
CHECKLIST for Patterns:
- [ ] 3+ patterns documented
- [ ] Each pattern has When, Implementation, Why
- [ ] Code examples actually work
- [ ] Patterns are actionable (not just theory)
-->
`;
}

/**
 * Generate anti-patterns.md content
 */
function generateAntiPatterns(id: string, name: string): string {
  return `# Anti-Patterns: ${name}

Common mistakes that turn ${name} work into chaos.

---

## 1. [Anti-Pattern Name]

**The Mistake:**
\`\`\`typescript
// Code showing the wrong way
\`\`\`

**Why It's Wrong:**
- Problem 1
- Problem 2
- Problem 3

**The Fix:**
\`\`\`typescript
// The correct approach
\`\`\`

---

## 2. [Second Anti-Pattern Name]

**The Mistake:**
\`\`\`typescript
// Wrong approach
\`\`\`

**Why It's Wrong:**
- Issues caused

**The Fix:**
\`\`\`typescript
// Right approach
\`\`\`

---

## 3. [Third Anti-Pattern Name]

**The Mistake:**
Description of common error.

**Why It's Wrong:**
- Consequences

**The Fix:**
Resolution.

---

<!--
CHECKLIST for Anti-Patterns:
- [ ] 3+ anti-patterns documented
- [ ] Each has The Mistake, Why Wrong, The Fix
- [ ] Code examples show wrong AND right way
- [ ] Problems are concrete (not vague warnings)
-->
`;
}

/**
 * Generate decisions.md content
 */
function generateDecisions(id: string, name: string): string {
  return `# Decisions: ${name}

Decision guidance for choosing between approaches when working with ${name}.

---

## Decision 1: [Choice Title]

**Context:** When you need to...

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| Option A | Pro 1, Pro 2 | Con 1 | Condition 1 |
| Option B | Pro 1 | Con 1, Con 2 | Condition 2 |

**Default Recommendation:** Option A unless [specific condition].

---

## Decision 2: [Second Choice]

**Context:** When deciding between...

**Options:**

| Option | Pros | Cons | Choose When |
|--------|------|------|-------------|
| Option A | Benefits | Drawbacks | When to use |
| Option B | Benefits | Drawbacks | When to use |

**Default Recommendation:** Your guidance here.

---

<!--
CHECKLIST for Decisions:
- [ ] Key decisions documented
- [ ] Each has Context, Options, Recommendation
- [ ] Trade-offs are honest (no "always do X")
- [ ] Defaults help when unsure
-->
`;
}

/**
 * Generate validations/checks.yaml content
 */
function generateValidationsYaml(id: string, name: string): string {
  return `# Validations: ${name}
# Machine-runnable checks for ${name}

validations:
  - id: ${id}-check-1
    name: "[Check Name]"
    description: "What this check validates"
    severity: critical  # critical, high, warning, low
    type: regex  # regex, ast, custom
    pattern: "pattern-to-match"
    message: "Error message when pattern matches"
    fix_hint: "How to resolve this issue"

  - id: ${id}-check-2
    name: "[Second Check]"
    description: "Description"
    severity: high
    type: regex
    pattern: "another-pattern"
    message: "Error message"
    fix_hint: "Resolution guidance"

  - id: ${id}-check-3
    name: "[Third Check]"
    description: "Description"
    severity: warning
    type: regex
    pattern: "warning-pattern"
    message: "Warning message"
    fix_hint: "Suggestion"

# Check types:
# - regex: Simple pattern matching (80% of cases)
# - ast: TypeScript AST analysis for complex checks
# - custom: Custom validation function

# Severity levels:
# - critical: Must fix before deploy
# - high: Should fix, significant risk
# - warning: Consider fixing
# - low: Minor improvement
`;
}

/**
 * Generate boundaries.md content
 */
function generateBoundaries(id: string, name: string, doesNotOwn: string[]): string {
  const handoffs = doesNotOwn.length > 0
    ? doesNotOwn.map((d, i) => `
## Handoff ${i + 1}: ${d}

**Trigger:** When user mentions ${d}...

**Hand to:** [skill-id]

**Context to Provide:**
- What was being worked on
- Relevant decisions made
- Any constraints identified
`).join('\n---\n')
    : `
## Handoff 1: [Domain]

**Trigger:** When user mentions...

**Hand to:** [skill-id]

**Context to Provide:**
- What was being worked on
- Relevant decisions made
`;

  return `# Boundaries: ${name}

Clear handoff points and limitations for ${name}.

---
${handoffs}

---

## Limitations

What this skill explicitly does NOT handle:

1. **[Limitation 1]** - Reason and what handles it instead
2. **[Limitation 2]** - Reason and alternative
3. **[Limitation 3]** - Reason and where to go

---

## Escape Hatches

When to abandon this skill's approach:

1. **[Situation 1]** - Consider [alternative]
2. **[Situation 2]** - May need [different approach]

---

<!--
CHECKLIST for Boundaries:
- [ ] All does_not_own items have handoffs
- [ ] Handoffs specify what context to pass
- [ ] Limitations are honest
- [ ] Escape hatches documented
-->
`;
}

/**
 * Build instruction for list-types action
 */
function buildTypesInstruction(): string {
  return `## Skill Types

**core** - Single technology expertise (Layer 1)
Foundation skills with deep knowledge of one technology.
Directory: skills/core/

**integration** - Cross-technology knowledge (Layer 2)
Skills that combine multiple core skills for complete features.
Directory: skills/integration/

**pattern** - Problem-focused skills (Layer 3)
Skills that solve specific recurring problems across technologies.
Directory: skills/pattern/

---

Use action="scaffold" with id, name, and type to create a skill.
Example: { "action": "scaffold", "id": "react-hooks", "name": "React Hooks", "type": "core" }`;
}

/**
 * Build instruction for missing fields
 */
function buildMissingFieldsInstruction(missing: string[]): string {
  return `## Missing Required Fields

The following fields are required: ${missing.join(', ')}

**Example call:**
\`\`\`json
{
  "action": "scaffold",
  "id": "my-skill",
  "name": "My Skill Name",
  "type": "core",
  "description": "What this skill does",
  "owns": ["domain-1", "domain-2"],
  "triggers": ["phrase 1", "phrase 2"],
  "tags": ["tag1", "tag2"]
}
\`\`\`

Use action="list-types" to see skill type options.`;
}

/**
 * Build preview instruction
 */
function buildPreviewInstruction(
  id: string,
  type: string,
  files: { path: string; description: string }[],
  layer: number
): string {
  const layerNames = ['', 'Minimal (skill.yaml + sharp-edges)', 'Core (+ patterns + anti-patterns)', 'Complete (+ validations + boundaries)'];

  return `## Skill Preview: ${id}

**Type:** ${type}
**Layer:** ${layer} - ${layerNames[layer]}

**Files to be created:**
${files.map(f => `- ${f.path}\n  ${f.description}`).join('\n')}

---

This preview shows truncated file contents.
Use action="scaffold" to generate full file contents.`;
}

/**
 * Build scaffold instruction
 */
function buildScaffoldInstruction(
  id: string,
  type: string,
  files: { path: string }[],
  layer: number
): string {
  const layerNames = ['', 'Minimal', 'Core', 'Complete'];

  return `## Skill Scaffold Generated: ${id}

**Type:** ${type}
**Layer:** ${layer} - ${layerNames[layer]}
**Files:** ${files.length}

### Next Steps

1. **Create the files** in your spawner-v2 directory:
   ${files.map(f => f.path).join('\n   ')}

2. **Fill in the placeholders** in each file:
   - skill.yaml: Add your owns, triggers, tags
   - sharp-edges.md: Document 5+ real gotchas with code examples
   - patterns.md: Add 3+ best practices (if layer >= 2)
   - anti-patterns.md: Add 3+ common mistakes (if layer >= 2)

3. **Test your skill** on a real task

4. **Upload to KV:**
   \`\`\`bash
   cd spawner-v2
   node scripts/upload-skills.js --local
   \`\`\`

### Quality Checklist

Layer 1 (Required):
- [ ] skill.yaml has clear owns/does_not_own
- [ ] 5+ sharp edges with code examples
- [ ] Edges are specific (not generic advice)

${layer >= 2 ? `Layer 2 (Core):
- [ ] 3+ patterns with working code
- [ ] 3+ anti-patterns with fixes
- [ ] Decisions documented
` : ''}
${layer >= 3 ? `Layer 3 (Complete):
- [ ] Critical validations implemented
- [ ] Handoff triggers defined
- [ ] Escape hatches documented
` : ''}

---

A Layer 1 skill is useful. Ship early, iterate often.`;
}

/**
 * Build validation checklist
 */
function buildValidationChecklist(id: string): string {
  return `## Skill Validation: ${id}

### Layer 1 Checklist (Required)
- [ ] skill.yaml exists with valid structure
- [ ] id is kebab-case
- [ ] name is human-readable
- [ ] version follows semver
- [ ] type is core/integration/pattern
- [ ] owns has at least 1 domain
- [ ] does_not_own has clear handoffs
- [ ] triggers has at least 3 activation phrases

- [ ] sharp-edges.md exists
- [ ] 5+ sharp edges documented
- [ ] Each edge has: Severity, The Trap, Why, The Fix
- [ ] Code examples are copy-pastable
- [ ] Edges are specific (not generic)

### Layer 2 Checklist (Core)
- [ ] patterns.md with 3+ patterns
- [ ] anti-patterns.md with 3+ anti-patterns
- [ ] decisions.md with key choices

### Layer 3 Checklist (Complete)
- [ ] validations/checks.yaml with regex patterns
- [ ] boundaries.md with handoff triggers

### Quality Check
- [ ] Dogfooded on real project
- [ ] Sharp edges catch real issues
- [ ] Code examples actually work
- [ ] Version ranges specified where needed`;
}
