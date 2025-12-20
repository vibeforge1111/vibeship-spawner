/**
 * spawner_skill_research Tool
 *
 * Conducts automatic research before skill generation.
 * Uses web search to gather:
 * - Technical skills: Official docs, GitHub issues, Stack Overflow, expert content
 * - Non-technical skills: Practitioners, case studies, frameworks, contrarian views
 *
 * Returns structured research findings that feed into skill generation.
 */

import { z } from 'zod';
import type { Env } from '../types.js';

// =============================================================================
// Types
// =============================================================================

/**
 * Research source types for technical skills
 */
interface TechnicalSource {
  type: 'docs' | 'github_issues' | 'stackoverflow' | 'expert_content' | 'ecosystem';
  title: string;
  url?: string;
  summary: string;
  relevance: 'high' | 'medium' | 'low';
}

/**
 * Research source types for non-technical skills
 */
interface NonTechnicalSource {
  type: 'practitioner' | 'case_study' | 'framework' | 'contrarian';
  title: string;
  url?: string;
  summary: string;
  relevance: 'high' | 'medium' | 'low';
}

/**
 * Pain point discovered during research
 */
interface PainPoint {
  summary: string;
  source: string;
  frequency: 'common' | 'occasional' | 'rare';
  severity: 'critical' | 'high' | 'medium' | 'low';
  potential_edge_id?: string;
}

/**
 * Ecosystem mapping for technical skills
 */
interface EcosystemEntry {
  name: string;
  type: 'primary' | 'alternative' | 'deprecated' | 'complementary';
  description: string;
  use_when?: string;
  avoid_when?: string;
}

/**
 * Expert insight or framework
 */
interface ExpertInsight {
  author?: string;
  insight: string;
  source?: string;
  category: 'principle' | 'pattern' | 'anti_pattern' | 'contrarian';
}

/**
 * Complete research findings
 */
export interface ResearchFindings {
  skill_id: string;
  skill_name: string;
  skill_type: 'technical' | 'non_technical';
  category: string;

  // Sources gathered
  sources: (TechnicalSource | NonTechnicalSource)[];

  // Pain points for sharp edges
  pain_points: PainPoint[];

  // Ecosystem for handoffs and collaboration
  ecosystem: EcosystemEntry[];

  // Expert insights for patterns and identity
  insights: ExpertInsight[];

  // Raw findings for identity generation
  identity_material: {
    battle_scars: string[];
    strong_opinions: string[];
    contrarian_views: string[];
    history_evolution: string[];
    known_limits: string[];
  };

  // Validation gate results
  validation: {
    passed: boolean;
    score: number;
    requirements_met: string[];
    requirements_missing: string[];
  };

  // Metadata
  research_timestamp: string;
  search_queries_used: string[];
}

// =============================================================================
// Schema
// =============================================================================

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

const TECHNICAL_CATEGORIES = ['development', 'frameworks', 'integration', 'pattern'] as const;
const NON_TECHNICAL_CATEGORIES = ['design', 'marketing', 'strategy', 'product', 'startup', 'communications'] as const;

export const skillResearchInputSchema = z.object({
  id: z.string().describe('Skill ID in kebab-case (e.g., "nextjs-app-router")'),
  name: z.string().describe('Human-readable skill name (e.g., "Next.js App Router")'),
  category: z.enum(SKILL_CATEGORIES).describe('Skill category'),
  description: z.string().optional().describe('Brief description to guide research focus'),
  depth: z.enum(['quick', 'standard', 'deep']).optional().describe(
    'Research depth: quick (3-5 sources), standard (8-12 sources), deep (15+ sources). Default: standard'
  ),
  focus_areas: z.array(z.string()).optional().describe(
    'Specific areas to focus research on (e.g., ["authentication", "performance"])'
  ),
});

// =============================================================================
// Tool Definition
// =============================================================================

export const skillResearchToolDefinition = {
  name: 'spawner_skill_research',
  description: 'Research a skill topic before generation. Gathers pain points from GitHub/SO, expert content, ecosystem mapping, and practitioner insights. Returns structured findings to feed into world-class skill generation.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      id: {
        type: 'string',
        description: 'Skill ID in kebab-case',
      },
      name: {
        type: 'string',
        description: 'Human-readable skill name',
      },
      category: {
        type: 'string',
        enum: SKILL_CATEGORIES,
        description: 'Skill category',
      },
      description: {
        type: 'string',
        description: 'Brief description to guide research',
      },
      depth: {
        type: 'string',
        enum: ['quick', 'standard', 'deep'],
        description: 'Research depth level',
      },
      focus_areas: {
        type: 'array',
        items: { type: 'string' },
        description: 'Specific areas to focus on',
      },
    },
    required: ['id', 'name', 'category'],
  },
};

// =============================================================================
// Output Type
// =============================================================================

export interface SkillResearchOutput {
  research: ResearchFindings;
  _instruction: string;
}

// =============================================================================
// Executor
// =============================================================================

export async function executeSkillResearch(
  _env: Env,
  input: z.infer<typeof skillResearchInputSchema>
): Promise<SkillResearchOutput> {
  const parsed = skillResearchInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(`Invalid input: ${parsed.error.message}`);
  }

  const { id, name, category, description, depth = 'standard', focus_areas = [] } = parsed.data;

  // Determine skill type
  const isTechnical = (TECHNICAL_CATEGORIES as readonly string[]).includes(category);
  const skillType = isTechnical ? 'technical' : 'non_technical';

  // Generate search queries based on skill type
  const searchQueries = generateSearchQueries(name, category, skillType, focus_areas);

  // Build research findings structure
  // NOTE: In production, this would make actual web searches
  // For now, we generate a template that guides the research process
  const findings = buildResearchTemplate(id, name, category, skillType, description, depth, searchQueries);

  // Validate research depth
  const validation = validateResearchDepth(findings, skillType, depth);
  findings.validation = validation;

  return {
    research: findings,
    _instruction: buildResearchInstruction(findings, skillType),
  };
}

// =============================================================================
// Helper Functions
// =============================================================================

function generateSearchQueries(
  name: string,
  category: string,
  skillType: 'technical' | 'non_technical',
  focusAreas: string[]
): string[] {
  const queries: string[] = [];
  const baseTerms = name.toLowerCase().split(/\s+/).filter(t => t.length > 2);

  if (skillType === 'technical') {
    // Official docs and getting started
    queries.push(`${name} official documentation`);
    queries.push(`${name} getting started guide 2024 2025`);

    // Pain points
    queries.push(`${name} common issues site:github.com`);
    queries.push(`${name} common mistakes site:stackoverflow.com`);
    queries.push(`${name} "gotcha" OR "pitfall" OR "mistake"`);

    // Best practices
    queries.push(`${name} best practices 2024`);
    queries.push(`${name} patterns site:dev.to OR site:medium.com`);

    // Ecosystem
    queries.push(`${name} vs alternative comparison`);
    queries.push(`${name} "pairs well with" OR "works great with"`);

    // Expert content
    queries.push(`${name} conference talk OR tutorial advanced`);
    queries.push(`awesome-${baseTerms[0]} site:github.com`);

    // Focus areas
    focusAreas.forEach(area => {
      queries.push(`${name} ${area} best practices`);
      queries.push(`${name} ${area} common issues`);
    });
  } else {
    // Non-technical: Practitioners and thought leaders
    queries.push(`${name} expert advice`);
    queries.push(`${name} lessons learned`);

    // Case studies
    queries.push(`${name} case study success`);
    queries.push(`${name} "we learned" OR "post-mortem"`);
    queries.push(`${name} failure lessons`);

    // Frameworks and mental models
    queries.push(`${name} framework checklist`);
    queries.push(`${name} mental model decision`);
    queries.push(`${name} principles rules`);

    // Contrarian views
    queries.push(`${name} "overrated" OR "myth" OR "wrong"`);
    queries.push(`${name} "actually" OR "contrary to"`);

    // Focus areas
    focusAreas.forEach(area => {
      queries.push(`${name} ${area} strategy`);
      queries.push(`${name} ${area} mistakes`);
    });
  }

  return queries;
}

function buildResearchTemplate(
  id: string,
  name: string,
  category: string,
  skillType: 'technical' | 'non_technical',
  description: string | undefined,
  depth: string,
  searchQueries: string[]
): ResearchFindings {
  const depthConfig = {
    quick: { sources: 5, painPoints: 3, insights: 3 },
    standard: { sources: 10, painPoints: 6, insights: 5 },
    deep: { sources: 15, painPoints: 10, insights: 8 },
  }[depth] || { sources: 10, painPoints: 6, insights: 5 };

  // Generate template sources based on skill type
  const sources: (TechnicalSource | NonTechnicalSource)[] = [];
  const painPoints: PainPoint[] = [];
  const insights: ExpertInsight[] = [];
  const ecosystem: EcosystemEntry[] = [];

  if (skillType === 'technical') {
    // Template technical sources
    sources.push(
      {
        type: 'docs',
        title: `Official ${name} Documentation`,
        url: `[RESEARCH: Find official docs URL]`,
        summary: `[RESEARCH: Key concepts and setup from official docs]`,
        relevance: 'high',
      },
      {
        type: 'github_issues',
        title: `Top GitHub Issues for ${name}`,
        url: `[RESEARCH: Link to issues search]`,
        summary: `[RESEARCH: 3-5 most common issues people encounter]`,
        relevance: 'high',
      },
      {
        type: 'stackoverflow',
        title: `Stack Overflow: Common ${name} Questions`,
        url: `[RESEARCH: SO search link]`,
        summary: `[RESEARCH: Most upvoted questions reveal common pain]`,
        relevance: 'high',
      },
      {
        type: 'expert_content',
        title: `Expert Tutorial/Talk on ${name}`,
        url: `[RESEARCH: Find quality tutorial]`,
        summary: `[RESEARCH: Key patterns and insights from experts]`,
        relevance: 'medium',
      },
      {
        type: 'ecosystem',
        title: `${name} Ecosystem and Alternatives`,
        url: `[RESEARCH: Comparison article]`,
        summary: `[RESEARCH: What pairs well, what's alternative, what's deprecated]`,
        relevance: 'medium',
      }
    );

    // Template pain points
    for (let i = 1; i <= Math.min(5, depthConfig.painPoints); i++) {
      painPoints.push({
        summary: `[RESEARCH: Pain point ${i} - specific issue from GH/SO]`,
        source: `[Source URL]`,
        frequency: i <= 2 ? 'common' : 'occasional',
        severity: i === 1 ? 'critical' : i <= 3 ? 'high' : 'medium',
        potential_edge_id: `${id}-edge-${i}`,
      });
    }

    // Template ecosystem
    ecosystem.push(
      {
        name: name,
        type: 'primary',
        description: description || `The main ${name} library/framework`,
      },
      {
        name: `[RESEARCH: Alternative 1]`,
        type: 'alternative',
        description: `[RESEARCH: When to use this alternative]`,
        use_when: `[RESEARCH: Specific use case]`,
        avoid_when: `[RESEARCH: When not to use]`,
      },
      {
        name: `[RESEARCH: Complementary tool]`,
        type: 'complementary',
        description: `[RESEARCH: How it enhances ${name}]`,
      },
      {
        name: `[RESEARCH: Deprecated approach]`,
        type: 'deprecated',
        description: `[RESEARCH: Why it's deprecated and what replaced it]`,
      }
    );
  } else {
    // Template non-technical sources
    sources.push(
      {
        type: 'practitioner',
        title: `Expert Perspective on ${name}`,
        url: `[RESEARCH: Find expert article/interview]`,
        summary: `[RESEARCH: Key insights from someone who's done this at scale]`,
        relevance: 'high',
      },
      {
        type: 'case_study',
        title: `${name} Success Story`,
        url: `[RESEARCH: Real case study with specifics]`,
        summary: `[RESEARCH: What worked, what metrics improved]`,
        relevance: 'high',
      },
      {
        type: 'case_study',
        title: `${name} Failure/Lesson`,
        url: `[RESEARCH: Post-mortem or failure analysis]`,
        summary: `[RESEARCH: What went wrong and lessons learned]`,
        relevance: 'high',
      },
      {
        type: 'framework',
        title: `${name} Framework/Mental Model`,
        url: `[RESEARCH: Decision framework or checklist]`,
        summary: `[RESEARCH: Structured approach to ${name}]`,
        relevance: 'medium',
      },
      {
        type: 'contrarian',
        title: `Contrarian View on ${name}`,
        url: `[RESEARCH: Find opposing viewpoint]`,
        summary: `[RESEARCH: What conventional wisdom gets wrong]`,
        relevance: 'medium',
      }
    );

    // Template pain points for non-technical
    for (let i = 1; i <= Math.min(5, depthConfig.painPoints); i++) {
      painPoints.push({
        summary: `[RESEARCH: Mistake ${i} - what practitioners commonly get wrong]`,
        source: `[Source URL]`,
        frequency: i <= 2 ? 'common' : 'occasional',
        severity: i === 1 ? 'critical' : i <= 3 ? 'high' : 'medium',
        potential_edge_id: `${id}-edge-${i}`,
      });
    }
  }

  // Template expert insights
  insights.push(
    {
      insight: `[RESEARCH: Core principle 1 - non-negotiable rule from experience]`,
      category: 'principle',
      author: `[Expert name]`,
      source: `[Source URL]`,
    },
    {
      insight: `[RESEARCH: Pattern 1 - proven approach that works]`,
      category: 'pattern',
      source: `[Source URL]`,
    },
    {
      insight: `[RESEARCH: Anti-pattern 1 - common mistake to avoid]`,
      category: 'anti_pattern',
      source: `[Source URL]`,
    },
    {
      insight: `[RESEARCH: Contrarian view - what most people get wrong]`,
      category: 'contrarian',
      source: `[Source URL]`,
    }
  );

  return {
    skill_id: id,
    skill_name: name,
    skill_type: skillType,
    category,
    sources,
    pain_points: painPoints,
    ecosystem,
    insights,
    identity_material: {
      battle_scars: [
        `[RESEARCH: Specific painful experience that shaped expertise]`,
        `[RESEARCH: Another battle scar from real-world experience]`,
      ],
      strong_opinions: [
        `[RESEARCH: Core principle 1 - "[opinion]" because [reasoning]]`,
        `[RESEARCH: Core principle 2 - "[opinion]" because [reasoning]]`,
        `[RESEARCH: Core principle 3 - "[opinion]" because [reasoning]]`,
      ],
      contrarian_views: [
        `[RESEARCH: What most practitioners get wrong about ${name}]`,
      ],
      history_evolution: [
        `[RESEARCH: How ${name} evolved from previous approaches]`,
        `[RESEARCH: What was tried before and failed]`,
        `[RESEARCH: Where the field is heading]`,
      ],
      known_limits: [
        `[RESEARCH: What this skill explicitly doesn't cover]`,
        `[RESEARCH: When to defer to other expertise]`,
      ],
    },
    validation: {
      passed: false,
      score: 0,
      requirements_met: [],
      requirements_missing: [],
    },
    research_timestamp: new Date().toISOString(),
    search_queries_used: searchQueries,
  };
}

function validateResearchDepth(
  findings: ResearchFindings,
  skillType: 'technical' | 'non_technical',
  depth: string
): ResearchFindings['validation'] {
  const requirements_met: string[] = [];
  const requirements_missing: string[] = [];

  // Check for placeholder content (indicates research not done yet)
  const hasPlaceholders = JSON.stringify(findings).includes('[RESEARCH:');

  if (hasPlaceholders) {
    requirements_missing.push('Research not completed - contains placeholder content');
  } else {
    requirements_met.push('No placeholder content found');
  }

  if (skillType === 'technical') {
    // Technical skill requirements
    const hasOfficialDocs = findings.sources.some(s => s.type === 'docs' && !s.summary.includes('[RESEARCH:'));
    const hasPainPoints = findings.pain_points.filter(p => !p.summary.includes('[RESEARCH:')).length >= 5;
    const hasAlternatives = findings.ecosystem.filter(e => e.type === 'alternative' && !e.description.includes('[RESEARCH:')).length >= 2;
    const hasExpertContent = findings.sources.filter(s => s.type === 'expert_content' && !s.summary.includes('[RESEARCH:')).length >= 1;

    if (hasOfficialDocs) requirements_met.push('Official docs fetched');
    else requirements_missing.push('Official docs not fetched');

    if (hasPainPoints) requirements_met.push('5+ pain points identified');
    else requirements_missing.push('Need 5+ pain points from GitHub/SO');

    if (hasAlternatives) requirements_met.push('Alternatives identified');
    else requirements_missing.push('Need 2+ alternative tools identified');

    if (hasExpertContent) requirements_met.push('Expert content found');
    else requirements_missing.push('Need 1+ expert source');
  } else {
    // Non-technical skill requirements
    const hasPractitioners = findings.sources.filter(s => s.type === 'practitioner' && !s.summary.includes('[RESEARCH:')).length >= 2;
    const hasCaseStudies = findings.sources.filter(s => s.type === 'case_study' && !s.summary.includes('[RESEARCH:')).length >= 2;
    const hasFrameworks = findings.sources.filter(s => s.type === 'framework' && !s.summary.includes('[RESEARCH:')).length >= 1;
    const hasContrarian = findings.insights.some(i => i.category === 'contrarian' && !i.insight.includes('[RESEARCH:'));

    if (hasPractitioners) requirements_met.push('Practitioner sources found');
    else requirements_missing.push('Need 2+ practitioner sources');

    if (hasCaseStudies) requirements_met.push('Case studies documented');
    else requirements_missing.push('Need 2+ case studies');

    if (hasFrameworks) requirements_met.push('Frameworks documented');
    else requirements_missing.push('Need 1+ framework/mental model');

    if (hasContrarian) requirements_met.push('Contrarian insight captured');
    else requirements_missing.push('Need contrarian insight');
  }

  // Common requirements
  const hasPrerequisites = findings.identity_material.known_limits.some(l => !l.includes('[RESEARCH:'));
  if (hasPrerequisites) requirements_met.push('Prerequisites identified');
  else requirements_missing.push('Need to identify prerequisites/limits');

  const score = Math.round((requirements_met.length / (requirements_met.length + requirements_missing.length)) * 100);

  return {
    passed: requirements_missing.length === 0 && !hasPlaceholders,
    score,
    requirements_met,
    requirements_missing,
  };
}

function buildResearchInstruction(
  findings: ResearchFindings,
  skillType: 'technical' | 'non_technical'
): string {
  const hasPlaceholders = JSON.stringify(findings).includes('[RESEARCH:');

  if (hasPlaceholders) {
    return `## Research Template Generated: ${findings.skill_name}

**Skill Type:** ${skillType === 'technical' ? 'Technical' : 'Non-Technical'}
**Category:** ${findings.category}

---

### Research Action Required

This template contains **[RESEARCH: ...]** placeholders that need to be filled with actual research.

**Recommended Search Queries:**
${findings.search_queries_used.slice(0, 10).map(q => `- \`${q}\``).join('\n')}

---

### How to Complete Research

${skillType === 'technical' ? `
**For Technical Skills:**
1. **Official Docs:** Find and read official documentation
2. **GitHub Issues:** Search for common issues and pain points
3. **Stack Overflow:** Look at top-voted questions
4. **Expert Content:** Find tutorials from known practitioners
5. **Ecosystem:** Map alternatives, complementary tools, deprecated approaches
` : `
**For Non-Technical Skills:**
1. **Practitioners:** Find essays/interviews from domain experts
2. **Case Studies:** Real success stories and post-mortems
3. **Frameworks:** Decision frameworks and mental models
4. **Contrarian Views:** What conventional wisdom gets wrong
`}

---

### Validation Gate Status

**Score:** ${findings.validation.score}%
**Status:** ${findings.validation.passed ? '✅ Passed' : '❌ Not Passed'}

**Requirements Met:**
${findings.validation.requirements_met.map(r => `- ✅ ${r}`).join('\n') || '- None yet'}

**Requirements Missing:**
${findings.validation.requirements_missing.map(r => `- ❌ ${r}`).join('\n')}

---

Complete the research by replacing all [RESEARCH: ...] placeholders with actual findings, then use \`spawner_skill_new\` to generate the skill.`;
  }

  return `## Research Complete: ${findings.skill_name}

**Skill Type:** ${skillType === 'technical' ? 'Technical' : 'Non-Technical'}
**Category:** ${findings.category}
**Score:** ${findings.validation.score}%

---

### Research Summary

**Sources Found:** ${findings.sources.length}
**Pain Points:** ${findings.pain_points.length}
**Expert Insights:** ${findings.insights.length}
**Ecosystem Entries:** ${findings.ecosystem.length}

---

### Next Step

Research is complete. Use \`spawner_skill_new\` with action="scaffold" to generate the skill files pre-filled with these findings.`;
}
