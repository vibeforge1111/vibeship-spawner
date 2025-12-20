/**
 * spawner_skill_new Tool
 *
 * Generate world-class skills following our current conventions.
 * Creates complete skill directories with 4 YAML files:
 *   - skill.yaml (identity, patterns, anti_patterns, handoffs)
 *   - sharp-edges.yaml (gotchas with detection patterns)
 *   - validations.yaml (automated code checks)
 *   - collaboration.yaml (prerequisites, delegation, skill interactions)
 *
 * Skills are organized by category:
 *   - development/ (frontend, backend, devops, cybersecurity, etc.)
 *   - frameworks/ (nextjs-app-router, supabase-backend, etc.)
 *   - integration/ (nextjs-supabase-auth, vercel-deployment, etc.)
 *   - pattern/ (code-review, codebase-optimization, etc.)
 *   - design/ (ui-design, ux-design, branding, etc.)
 *   - marketing/ (copywriting, content-strategy, etc.)
 *   - strategy/ (product-strategy, growth-strategy, etc.)
 *   - product/ (product-management, analytics, etc.)
 *   - startup/ (founder-mode, yc-playbook, etc.)
 *   - communications/ (dev-communications, etc.)
 */

import { z } from 'zod';
import type { Env } from '../types.js';

// Valid skill categories matching our directory structure
const SKILL_CATEGORIES = [
  'development',
  'frameworks',
  'integration',
  'pattern',
  'design',
  'marketing',
  'strategy',
  'product',
  'startup',
  'communications',
] as const;

/**
 * Input schema for spawner_skill_new
 */
export const skillCreateInputSchema = z.object({
  action: z.enum(['scaffold', 'preview', 'validate', 'list-categories']).optional().describe(
    'Action: scaffold (default), preview (show what would be created), validate (check existing skill), list-categories (show skill categories)'
  ),
  id: z.string().optional().describe(
    'Skill ID in kebab-case (e.g., "nextjs-app-router", "cybersecurity")'
  ),
  name: z.string().optional().describe(
    'Human-readable skill name (e.g., "Next.js App Router", "Cybersecurity")'
  ),
  category: z.enum(SKILL_CATEGORIES).optional().describe(
    'Skill category: development, frameworks, integration, pattern, design, marketing, strategy, product, startup, communications'
  ),
  description: z.string().optional().describe(
    'Brief description of what the skill does'
  ),
  owns: z.array(z.string()).optional().describe(
    'Domains this skill owns (e.g., ["server-components", "client-components"])'
  ),
  triggers: z.array(z.string()).optional().describe(
    'Phrases that activate this skill (e.g., ["next.js app router", "server component"])'
  ),
  pairs_with: z.array(z.string()).optional().describe(
    'Compatible skill IDs (e.g., ["supabase-backend", "typescript-strict"])'
  ),
  tags: z.array(z.string()).optional().describe(
    'Searchable tags (e.g., ["nextjs", "react", "ssr"])'
  ),
});

/**
 * Tool definition for MCP
 */
export const skillCreateToolDefinition = {
  name: 'spawner_skill_new',
  description: 'Create world-class skills with 4 YAML files: skill.yaml (identity + patterns + anti-patterns + handoffs), sharp-edges.yaml (gotchas with detection), validations.yaml (automated checks), collaboration.yaml (prerequisites + delegation + skill interactions). Skills are organized by category (development, frameworks, integration, etc.).',
  inputSchema: {
    type: 'object' as const,
    properties: {
      action: {
        type: 'string',
        enum: ['scaffold', 'preview', 'validate', 'list-categories'],
        description: 'Action: scaffold (default), preview (show structure), validate (check skill), list-categories (show categories)',
      },
      id: {
        type: 'string',
        description: 'Skill ID in kebab-case (e.g., "nextjs-app-router")',
      },
      name: {
        type: 'string',
        description: 'Human-readable skill name (e.g., "Next.js App Router")',
      },
      category: {
        type: 'string',
        enum: SKILL_CATEGORIES,
        description: 'Skill category: development, frameworks, integration, pattern, design, marketing, strategy, product, startup, communications',
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
      tags: {
        type: 'array',
        items: { type: 'string' },
        description: 'Searchable tags',
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
  category?: string;
  files?: {
    path: string;
    content: string;
    description: string;
  }[];
  validation_result?: {
    valid: boolean;
    issues: string[];
    suggestions: string[];
  };
  categories?: {
    name: string;
    description: string;
    examples: string[];
  }[];
  _instruction: string;
}

/**
 * Execute the spawner_skill_new tool
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
    case 'list-categories':
      return handleListCategories();

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
 * List skill categories
 */
function handleListCategories(): SkillCreateOutput {
  return {
    action: 'list-categories',
    categories: [
      {
        name: 'development',
        description: 'General development practices - frontend, backend, devops, security, etc.',
        examples: ['frontend', 'backend', 'devops', 'cybersecurity', 'game-development', 'qa-engineering'],
      },
      {
        name: 'frameworks',
        description: 'Specific technology expertise - deep knowledge of one framework/tool.',
        examples: ['nextjs-app-router', 'supabase-backend', 'react-patterns', 'tailwind-ui', 'typescript-strict'],
      },
      {
        name: 'integration',
        description: 'Cross-technology knowledge - combining multiple technologies.',
        examples: ['nextjs-supabase-auth', 'vercel-deployment', 'stripe-integration'],
      },
      {
        name: 'pattern',
        description: 'Problem-focused skills - solving specific recurring problems.',
        examples: ['code-review', 'codebase-optimization', 'mcp-product', 'code-architecture-review'],
      },
      {
        name: 'design',
        description: 'Visual and experience design - UI, UX, branding.',
        examples: ['ui-design', 'ux-design', 'branding', 'landing-page-design'],
      },
      {
        name: 'marketing',
        description: 'Growth and communication - copywriting, content, SEO.',
        examples: ['copywriting', 'content-strategy', 'viral-marketing', 'seo'],
      },
      {
        name: 'strategy',
        description: 'High-level direction - product strategy, growth, positioning.',
        examples: ['product-strategy', 'growth-strategy', 'brand-positioning', 'creative-strategy'],
      },
      {
        name: 'product',
        description: 'Product development practices - management, analytics, testing.',
        examples: ['product-management', 'analytics', 'a-b-testing', 'customer-success'],
      },
      {
        name: 'startup',
        description: 'Startup-specific knowledge - founder skills, fundraising, operations.',
        examples: ['founder-mode', 'yc-playbook', 'burn-rate-management'],
      },
      {
        name: 'communications',
        description: 'Developer and team communications.',
        examples: ['dev-communications'],
      },
    ],
    _instruction: `## Skill Categories

Choose a category that best fits your skill. Use action="scaffold" with id, name, and category to create a skill.

**Example:**
\`\`\`json
{
  "action": "scaffold",
  "id": "rust-async",
  "name": "Rust Async",
  "category": "frameworks",
  "description": "Expert knowledge for async Rust programming",
  "owns": ["async-await", "tokio", "futures"],
  "triggers": ["rust async", "tokio", "futures"]
}
\`\`\``,
  };
}

/**
 * Preview what would be created
 */
function handlePreview(input: z.infer<typeof skillCreateInputSchema>): SkillCreateOutput {
  const { id, name, category } = input;

  if (!id || !name || !category) {
    return {
      action: 'preview',
      _instruction: buildMissingFieldsInstruction(['id', 'name', 'category'].filter(f => !input[f as keyof typeof input])),
    };
  }

  const files = generateSkillFiles(input);

  return {
    action: 'preview',
    skill_id: id,
    category,
    files: files.map(f => ({
      path: f.path,
      content: f.content.substring(0, 800) + (f.content.length > 800 ? '\n... (truncated for preview)' : ''),
      description: f.description,
    })),
    _instruction: buildPreviewInstruction(id, category, files),
  };
}

/**
 * Generate skill scaffold
 */
function handleScaffold(input: z.infer<typeof skillCreateInputSchema>): SkillCreateOutput {
  const { id, name, category } = input;

  if (!id || !name || !category) {
    return {
      action: 'scaffold',
      _instruction: buildMissingFieldsInstruction(['id', 'name', 'category'].filter(f => !input[f as keyof typeof input])),
    };
  }

  const files = generateSkillFiles(input);

  return {
    action: 'scaffold',
    skill_id: id,
    category,
    files,
    _instruction: buildScaffoldInstruction(id, category, files),
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

  return {
    action: 'validate',
    skill_id: id,
    validation_result: {
      valid: false,
      issues: ['Cannot validate remotely - skill must be read from filesystem'],
      suggestions: [
        'Use Claude to read the skill files directly',
        'Check skill.yaml has: id, name, version, layer, description, owns, pairs_with, tags, triggers, identity, patterns, anti_patterns, handoffs',
        'Check sharp-edges.yaml has 8-12 edges with: id, summary, severity, situation, why, solution, symptoms, detection_pattern',
        'Check validations.yaml has 8-12 validations with: id, name, severity, type, pattern, message, fix_action, applies_to',
      ],
    },
    _instruction: buildValidationChecklist(id),
  };
}

/**
 * Generate all skill files (always generates 4 YAML files)
 */
function generateSkillFiles(
  input: z.infer<typeof skillCreateInputSchema>
): { path: string; content: string; description: string }[] {
  const {
    id,
    name,
    category,
    description = `Expert knowledge for ${name}`,
    owns = [],
    triggers = [],
    pairs_with = [],
    tags = [],
  } = input as Required<Pick<typeof input, 'id' | 'name' | 'category'>> & typeof input;

  const baseDir = `skills/${category}/${id}`;
  const files: { path: string; content: string; description: string }[] = [];

  // Always generate all 4 YAML files
  files.push({
    path: `${baseDir}/skill.yaml`,
    content: generateSkillYaml({
      id: id!,
      name: name!,
      description,
      owns,
      triggers,
      pairs_with,
      tags,
    }),
    description: 'Skill identity, patterns, anti-patterns, and handoffs',
  });

  files.push({
    path: `${baseDir}/sharp-edges.yaml`,
    content: generateSharpEdgesYaml(id!, name!),
    description: 'Gotchas with detection patterns (8-12 required)',
  });

  files.push({
    path: `${baseDir}/validations.yaml`,
    content: generateValidationsYaml(id!, name!),
    description: 'Automated code checks (8-12 required)',
  });

  files.push({
    path: `${baseDir}/collaboration.yaml`,
    content: generateCollaborationYaml(id!, name!, pairs_with),
    description: 'Skill prerequisites, complementary skills, and delegation triggers',
  });

  return files;
}

/**
 * Generate skill.yaml content (with embedded patterns, anti_patterns, handoffs)
 */
function generateSkillYaml(opts: {
  id: string;
  name: string;
  description: string;
  owns: string[];
  triggers: string[];
  pairs_with: string[];
  tags: string[];
}): string {
  const { id, name, description, owns, triggers, pairs_with, tags } = opts;

  const ownsSection = owns.length > 0
    ? owns.map(o => `  - ${o}`).join('\n')
    : `  - # Add domains this skill owns
  - # Example: component-design
  - # Example: state-management`;

  const triggersSection = triggers.length > 0
    ? triggers.map(t => `  - ${t}`).join('\n')
    : `  - ${name.toLowerCase()}
  - # Add activation phrases
  - # Example: related technology terms`;

  const pairsWithSection = pairs_with.length > 0
    ? pairs_with.map(p => `  - ${p}`).join('\n')
    : `  - # Add compatible skill IDs
  - # Example: frontend
  - # Example: backend`;

  const tagsSection = tags.length > 0
    ? tags.map(t => `  - ${t}`).join('\n')
    : `  - ${id}
  - # Add searchable tags`;

  return `id: ${id}
name: ${name}
version: 1.0.0
layer: 1
description: ${description}

owns:
${ownsSection}

pairs_with:
${pairsWithSection}

requires: []

tags:
${tagsSection}

triggers:
${triggersSection}

identity: |
  # WHO YOU ARE
  You are a [role] with [X+ years/decades] of experience. You've worked at
  [types of companies/contexts] where [high-stakes situation that shaped you].
  You've [specific battle scar #1] and [specific battle scar #2].

  # STRONG OPINIONS (earned through experience)
  Your core principles:
  1. [First non-negotiable principle] - because [reasoning]
  2. [Second principle] - because [reasoning]
  3. [Third principle] - because [reasoning]
  4. [Fourth principle] - because [reasoning]
  5. [Fifth principle] - because [reasoning]

  # CONTRARIAN INSIGHT
  What most practitioners get wrong: [common misconception and why it's wrong]

  # HISTORY & EVOLUTION
  The field evolved from [previous approach] to [current state] because [why].
  What was tried before and failed: [failed approaches and lessons].
  Where things are heading: [future direction].

  # KNOWING YOUR LIMITS
  What you explicitly don't cover: [out of scope areas].
  When to defer to other expertise: [delegation triggers].

  # PREREQUISITE KNOWLEDGE
  To use this skill effectively, you should understand:
  - [Prerequisite concept #1]
  - [Prerequisite concept #2]
  - [Cross-domain insight that informs this expertise]

patterns:
  - name: [Pattern Name]
    description: [What this pattern achieves]
    when: [Situations where this applies]
    example: |
      // Good example showing the pattern
      const example = doItRight()

  - name: [Second Pattern]
    description: [What it achieves]
    when: [When to use]
    example: |
      // Working code example

  - name: [Third Pattern]
    description: [What it achieves]
    when: [When to use]
    example: |
      // Working code example

  - name: [Fourth Pattern]
    description: [What it achieves]
    when: [When to use]
    example: |
      // Working code example

anti_patterns:
  - name: [Anti-Pattern Name]
    description: [What people do wrong]
    why: [Why this causes problems - be specific]
    instead: [What to do instead]

  - name: [Second Anti-Pattern]
    description: [What's wrong]
    why: [The real consequences]
    instead: [The fix]

  - name: [Third Anti-Pattern]
    description: [What's wrong]
    why: [The real consequences]
    instead: [The fix]

  - name: [Fourth Anti-Pattern]
    description: [What's wrong]
    why: [The real consequences]
    instead: [The fix]

handoffs:
  - trigger: [keyword or phrase that indicates need for different skill]
    to: [other-skill-id]
    context: [Why this handoff makes sense]

  - trigger: [another trigger]
    to: [skill-id]
    context: [Context for handoff]
`;
}

/**
 * Generate sharp-edges.yaml content
 */
function generateSharpEdgesYaml(id: string, name: string): string {
  return `# ${name} Sharp Edges
# Real gotchas that catch people working with ${name}

sharp_edges:
  - id: ${id}-edge-1
    summary: "[One-line description of the gotcha]"
    severity: critical  # critical | high | medium | low
    situation: |
      [When/how people typically encounter this problem.
      Be specific about the context.]
    why: |
      [The real consequences - what actually breaks, costs money,
      causes outages, loses users. Be concrete.]
    solution: |
      # WRONG - What people typically do
      bad_example_code()

      # RIGHT - What they should do
      good_example_code()

      # Step by step if complex:
      # 1. First step
      # 2. Second step
    symptoms:
      - [Observable sign this is happening]
      - [Error message pattern]
      - [User-visible symptom]
    detection_pattern: 'regex-to-find-this-in-code'

  - id: ${id}-edge-2
    summary: "[Second gotcha]"
    severity: high
    situation: |
      [Description of the situation]
    why: |
      [Why this is painful]
    solution: |
      # Solution with code
    symptoms:
      - [Symptom 1]
      - [Symptom 2]
    detection_pattern: 'regex-pattern'

  - id: ${id}-edge-3
    summary: "[Third gotcha]"
    severity: high
    situation: |
      [Description]
    why: |
      [Consequences]
    solution: |
      # Solution
    symptoms:
      - [Symptoms]
    detection_pattern: 'regex-pattern'

  - id: ${id}-edge-4
    summary: "[Fourth gotcha]"
    severity: medium
    situation: |
      [Description]
    why: |
      [Consequences]
    solution: |
      # Solution
    symptoms:
      - [Symptoms]
    detection_pattern: null  # Use null if can't detect automatically

  - id: ${id}-edge-5
    summary: "[Fifth gotcha]"
    severity: medium
    situation: |
      [Description]
    why: |
      [Consequences]
    solution: |
      # Solution
    symptoms:
      - [Symptoms]
    detection_pattern: null

  # Add 3-7 more edges to reach 8-12 total
  # Each edge should be something you learned the hard way
  # Severity guide:
  #   critical = Will definitely cause major failure (data loss, security, revenue)
  #   high = Likely significant problems, hard to fix once shipped
  #   medium = Causes friction and rework, but recoverable
  #   low = Minor issues, nice to fix but not urgent
`;
}

/**
 * Generate validations.yaml content
 */
function generateValidationsYaml(id: string, name: string): string {
  return `# ${name} Validations
# Automated checks to catch common ${name} mistakes

validations:
  - id: ${id}-check-1
    name: "[Check Name]"
    severity: error  # error | warning | info
    type: regex  # regex | ast | file
    pattern:
      - 'first-regex-pattern'
      - 'alternative-pattern'
    message: "What's wrong and why it matters"
    fix_action: "Specific action to fix it"
    applies_to:
      - "*.ts"
      - "*.tsx"

  - id: ${id}-check-2
    name: "[Second Check]"
    severity: error
    type: regex
    pattern:
      - 'pattern-to-match'
    message: "Error message"
    fix_action: "How to fix"
    applies_to:
      - "*.ts"
      - "*.tsx"

  - id: ${id}-check-3
    name: "[Third Check]"
    severity: warning
    type: regex
    pattern:
      - 'warning-pattern'
    message: "Warning message"
    fix_action: "Suggestion"
    applies_to:
      - "*.ts"

  - id: ${id}-check-4
    name: "[Fourth Check]"
    severity: warning
    type: regex
    pattern:
      - 'pattern'
    message: "Message"
    fix_action: "Fix"
    applies_to:
      - "*.ts"

  - id: ${id}-check-5
    name: "[Fifth Check]"
    severity: warning
    type: regex
    pattern:
      - 'pattern'
    message: "Message"
    fix_action: "Fix"
    applies_to:
      - "*.ts"

  # Add 3-7 more validations to reach 8-12 total
  # Severity guide:
  #   error = Will cause bugs/security issues, must fix
  #   warning = Bad practice, likely problems
  #   info = Suggestion for improvement
  #
  # Pattern tips:
  #   - Test regex against real code samples
  #   - Avoid false positives (better to miss some than cry wolf)
  #   - Use applies_to to target specific file types
`;
}

/**
 * Generate collaboration.yaml content
 */
function generateCollaborationYaml(id: string, name: string, pairsWith: string[]): string {
  const pairsWithSection = pairsWith.length > 0
    ? pairsWith.map(skill => `  - skill: ${skill}
    relationship: "[How these skills work together]"
    brings: "[What this skill contributes]"`).join('\n')
    : `  - skill: "[complementary-skill-id]"
    relationship: "[How these skills work together]"
    brings: "[What this skill contributes]"
  - skill: "[another-skill-id]"
    relationship: "[Relationship description]"
    brings: "[What it contributes]"`;

  return `# ${name} Collaboration Model
# How this skill works with other skills, prerequisites, and delegation

# PREREQUISITE SKILLS
# Skills and knowledge this skill assumes or builds upon
prerequisites:
  skills:
    - # Skill IDs this skill assumes access to
    - # Example: backend (for a security skill)
  knowledge:
    - "[Foundational concept the user should understand]"
    - "[Another prerequisite concept]"
    - "[Cross-domain knowledge that informs this skill]"

# COMPLEMENTARY SKILLS MAP
# 5-10 related skills and how they interact with this one
complementary_skills:
${pairsWithSection}

# DELEGATION TRIGGERS
# When to let another skill take over completely (not just hand off context)
delegation:
  - trigger: "[Phrase or situation that triggers delegation]"
    delegate_to: "[skill-id]"
    pattern: sequential  # sequential | parallel | review
    context: "[What context to pass to the other skill]"
    receive: "[What you expect back from the delegation]"

  - trigger: "[Another trigger]"
    delegate_to: "[skill-id]"
    pattern: parallel
    context: "[Context to share]"
    receive: "[Expected output]"

# COLLABORATION PATTERNS
# How this skill works with others on complex tasks
collaboration_patterns:
  sequential:
    - "[I do X, then Y skill does Z]"
  parallel:
    - "[I handle A while Y skill handles B simultaneously]"
  review:
    - "[Y skill reviews my output for their domain expertise]"

# CROSS-DOMAIN INSIGHTS
# Knowledge from adjacent fields that informs this skill
cross_domain_insights:
  - domain: "[Adjacent field, e.g., psychology, economics, design]"
    insight: "[What you know from this domain that helps]"
    applies_when: "[Situations where this insight is valuable]"

  - domain: "[Another domain]"
    insight: "[Cross-domain knowledge]"
    applies_when: "[When it applies]"

# SKILL ECOSYSTEM
# For technical skills: related tools, alternatives, what's deprecated
ecosystem:
  primary_tools:
    - "[Main tool/library this skill uses]"
  alternatives:
    - name: "[Alternative tool]"
      use_when: "[When to prefer this alternative]"
      avoid_when: "[When not to use it]"
  deprecated:
    - "[Tools/approaches to avoid and why]"
`;
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
  "category": "development",
  "description": "What this skill does",
  "owns": ["domain-1", "domain-2"],
  "triggers": ["phrase 1", "phrase 2"],
  "tags": ["tag1", "tag2"]
}
\`\`\`

Use action="list-categories" to see available categories.`;
}

/**
 * Build preview instruction
 */
function buildPreviewInstruction(
  id: string,
  category: string,
  files: { path: string; description: string }[]
): string {
  return `## Skill Preview: ${id}

**Category:** ${category}

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
  category: string,
  files: { path: string }[]
): string {
  return `## Skill Scaffold Generated: ${id}

**Category:** ${category}
**Files:** ${files.length}

### Next Steps

1. **Create the files** in spawner-v2/skills/${category}/${id}/:
   ${files.map(f => f.path.split('/').pop()).join('\n   ')}

2. **Fill in the placeholders** in each file:
   - skill.yaml: Complete identity, add real patterns/anti-patterns/handoffs
   - sharp-edges.yaml: Document 8-12 real gotchas with detection patterns
   - validations.yaml: Add 8-12 automated checks with tested regex
   - collaboration.yaml: Define prerequisites, delegation triggers, skill interactions

3. **Quality requirements:**
   - [ ] Identity sounds like a real expert with battle scars
   - [ ] 4-6 patterns with copy-paste ready code
   - [ ] 4-6 anti-patterns with clear "why" and alternatives
   - [ ] 8-12 sharp edges with specific situations and solutions
   - [ ] 8-12 validations with tested regex patterns
   - [ ] Handoffs to related skills defined
   - [ ] 3-5 delegation triggers with context
   - [ ] 2-3 cross-domain insights

4. **Upload to KV:**
   \`\`\`bash
   cd spawner-v2
   node scripts/upload-skills.js
   \`\`\`

### Quality Checklist

Sharp Edges:
- [ ] Each is a real gotcha learned the hard way
- [ ] Specific situations, not generic advice
- [ ] Working code in solutions
- [ ] Detection patterns tested

Validations:
- [ ] Regex tested against real code
- [ ] No excessive false positives
- [ ] Fix actions are specific and actionable

---

Ship early, iterate based on real usage.`;
}

/**
 * Build validation checklist
 */
function buildValidationChecklist(id: string): string {
  return `## Skill Validation: ${id}

### skill.yaml Checklist
- [ ] id is kebab-case
- [ ] name is human-readable
- [ ] version follows semver (1.0.0)
- [ ] layer is set (usually 1)
- [ ] description is concise
- [ ] owns has domains this skill is authoritative on
- [ ] pairs_with lists compatible skills
- [ ] triggers has 5+ activation phrases
- [ ] tags has searchable keywords
- [ ] identity sounds like a real expert
- [ ] 4-6 patterns with working code examples
- [ ] 4-6 anti-patterns with clear alternatives
- [ ] handoffs to related skills defined

### sharp-edges.yaml Checklist
- [ ] 8-12 sharp edges documented
- [ ] Each has: id, summary, severity, situation, why, solution, symptoms
- [ ] detection_pattern is regex or null
- [ ] Edges are specific (not generic advice)
- [ ] Code examples actually work

### validations.yaml Checklist
- [ ] 8-12 validations defined
- [ ] Each has: id, name, severity, type, pattern, message, fix_action, applies_to
- [ ] Regex patterns tested against real code
- [ ] No excessive false positives
- [ ] File types correctly targeted

### collaboration.yaml Checklist
- [ ] Prerequisites list foundational skills/knowledge
- [ ] 5-10 complementary skills with relationships
- [ ] 3-5 delegation triggers with context
- [ ] Cross-domain insights documented
- [ ] Ecosystem (tools/alternatives/deprecated) for tech skills

### Quality Check
- [ ] Tested on real project
- [ ] Sharp edges catch real issues
- [ ] Validations don't cry wolf`;
}
