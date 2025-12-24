/**
 * spawner_skill_upgrade Tool
 *
 * Enhances an existing skill with additional research and content.
 * Can focus on specific areas (identity, edges, patterns, collaboration).
 * Returns upgraded skill content with before/after score comparison.
 */

import { z } from 'zod';
import type { Env } from '../types.js';

// =============================================================================
// Types
// =============================================================================

export interface UpgradeResult {
  skill_id: string;
  focus_area: string;
  before_score: number;
  after_score_estimate: number;
  improvements: UpgradeImprovement[];
  upgraded_content: {
    skill_yaml?: string;
    sharp_edges_yaml?: string;
    validations_yaml?: string;
    collaboration_yaml?: string;
  };
  research_queries: string[];
  action_items: string[];
}

interface UpgradeImprovement {
  area: string;
  before: string;
  after: string;
  impact: 'high' | 'medium' | 'low';
}

// =============================================================================
// Schema
// =============================================================================

const FOCUS_AREAS = ['identity', 'edges', 'patterns', 'collaboration', 'all'] as const;

export const skillUpgradeInputSchema = z.object({
  skill_id: z.string().describe('Skill ID to upgrade'),
  skill_content: z.object({
    skill_yaml: z.string().optional().describe('Current skill.yaml content'),
    sharp_edges_yaml: z.string().optional().describe('Current sharp-edges.yaml content'),
    validations_yaml: z.string().optional().describe('Current validations.yaml content'),
    collaboration_yaml: z.string().optional().describe('Current collaboration.yaml content'),
  }).describe('Current skill file contents'),
  focus: z.enum(FOCUS_AREAS).optional().describe(
    'Area to focus upgrade on: identity, edges, patterns, collaboration, or all. Default: all'
  ),
  current_score: z.number().optional().describe('Current quality score if already scored'),
});

// =============================================================================
// Tool Definition
// =============================================================================

export const skillUpgradeToolDefinition = {
  name: 'spawner_skill_upgrade',
  description: 'Enhance an existing skill with more research and depth. Focus on specific areas (identity, edges, patterns, collaboration) or upgrade all. Returns improved content with before/after comparison.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      skill_id: {
        type: 'string',
        description: 'Skill ID to upgrade',
      },
      skill_content: {
        type: 'object',
        properties: {
          skill_yaml: { type: 'string' },
          sharp_edges_yaml: { type: 'string' },
          validations_yaml: { type: 'string' },
          collaboration_yaml: { type: 'string' },
        },
        description: 'Current skill file contents',
      },
      focus: {
        type: 'string',
        enum: FOCUS_AREAS,
        description: 'Area to focus upgrade on',
      },
      current_score: {
        type: 'number',
        description: 'Current quality score',
      },
    },
    required: ['skill_id', 'skill_content'],
  },
};

// =============================================================================
// Output Type
// =============================================================================

export interface SkillUpgradeOutput {
  upgrade: UpgradeResult;
  _instruction: string;
}

// =============================================================================
// Executor
// =============================================================================

export async function executeSkillUpgrade(
  _env: Env,
  input: z.infer<typeof skillUpgradeInputSchema>
): Promise<SkillUpgradeOutput> {
  const parsed = skillUpgradeInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(`Invalid input: ${parsed.error.message}`);
  }

  const { skill_id, skill_content, focus = 'all', current_score = 0 } = parsed.data;

  // Analyze current skill and determine upgrade opportunities
  const improvements: UpgradeImprovement[] = [];
  const researchQueries: string[] = [];
  const actionItems: string[] = [];
  const upgradedContent: UpgradeResult['upgraded_content'] = {};

  // Extract skill name from content if possible
  const skillNameMatch = skill_content.skill_yaml?.match(/name:\s*(.+)/);
  const skillName = skillNameMatch?.[1]?.trim() ?? skill_id;

  // Process based on focus area
  if (focus === 'identity' || focus === 'all') {
    const identityUpgrade = analyzeIdentityForUpgrade(skill_content.skill_yaml || '', skillName, skill_id);
    improvements.push(...identityUpgrade.improvements);
    researchQueries.push(...identityUpgrade.queries);
    actionItems.push(...identityUpgrade.actions);
    if (identityUpgrade.suggestions) {
      upgradedContent.skill_yaml = skill_content.skill_yaml; // Would contain enhanced version
    }
  }

  if (focus === 'edges' || focus === 'all') {
    const edgesUpgrade = analyzeEdgesForUpgrade(skill_content.sharp_edges_yaml || '', skillName, skill_id);
    improvements.push(...edgesUpgrade.improvements);
    researchQueries.push(...edgesUpgrade.queries);
    actionItems.push(...edgesUpgrade.actions);
  }

  if (focus === 'patterns' || focus === 'all') {
    const patternsUpgrade = analyzePatternsForUpgrade(skill_content.skill_yaml || '', skillName);
    improvements.push(...patternsUpgrade.improvements);
    researchQueries.push(...patternsUpgrade.queries);
    actionItems.push(...patternsUpgrade.actions);
  }

  if (focus === 'collaboration' || focus === 'all') {
    const collabUpgrade = analyzeCollaborationForUpgrade(skill_content.collaboration_yaml || '', skillName);
    improvements.push(...collabUpgrade.improvements);
    researchQueries.push(...collabUpgrade.queries);
    actionItems.push(...collabUpgrade.actions);
  }

  // Estimate score improvement
  const highImpactCount = improvements.filter(i => i.impact === 'high').length;
  const mediumImpactCount = improvements.filter(i => i.impact === 'medium').length;
  const estimatedGain = (highImpactCount * 5) + (mediumImpactCount * 2);
  const afterScoreEstimate = Math.min(100, current_score + estimatedGain);

  const result: UpgradeResult = {
    skill_id,
    focus_area: focus,
    before_score: current_score,
    after_score_estimate: afterScoreEstimate,
    improvements,
    upgraded_content: upgradedContent,
    research_queries: researchQueries,
    action_items: actionItems,
  };

  return {
    upgrade: result,
    _instruction: buildUpgradeInstruction(result),
  };
}

// =============================================================================
// Analysis Functions
// =============================================================================

interface UpgradeAnalysis {
  improvements: UpgradeImprovement[];
  queries: string[];
  actions: string[];
  suggestions?: string;
}

function analyzeIdentityForUpgrade(skillYaml: string, skillName: string, skillId: string): UpgradeAnalysis {
  const improvements: UpgradeImprovement[] = [];
  const queries: string[] = [];
  const actions: string[] = [];

  // Check for placeholder content
  if (skillYaml.includes('[role]') || skillYaml.includes('[experience]')) {
    improvements.push({
      area: 'Identity - Battle Scars',
      before: 'Generic placeholder template',
      after: 'Specific experiences with years, contexts, and lessons',
      impact: 'high',
    });
    queries.push(`${skillName} expert interview lessons learned`);
    queries.push(`${skillName} "years of experience" OR "decade"`);
    actions.push('Replace [role] with specific expertise description');
    actions.push('Add 2-3 specific battle scars (painful lessons)');
  }

  // Check for missing contrarian section
  if (!skillYaml.includes('CONTRARIAN') && !skillYaml.includes('get wrong')) {
    improvements.push({
      area: 'Identity - Contrarian Insight',
      before: 'No contrarian perspective',
      after: 'What most practitioners misunderstand',
      impact: 'high',
    });
    queries.push(`${skillName} "overrated" OR "myth" OR "wrong"`);
    queries.push(`${skillName} "actually" OR "contrary"`);
    actions.push('Add CONTRARIAN INSIGHT section');
  }

  // Check for missing history
  if (!skillYaml.includes('HISTORY') && !skillYaml.includes('evolved from')) {
    improvements.push({
      area: 'Identity - History',
      before: 'No evolution context',
      after: 'Field history and future direction',
      impact: 'medium',
    });
    queries.push(`${skillName} history evolution`);
    queries.push(`${skillName} "used to" OR "evolved from"`);
    actions.push('Add HISTORY & EVOLUTION section');
  }

  // Check for weak principles
  const principleCount = (skillYaml.match(/^\s*\d+\.\s+/gm) || []).length;
  if (principleCount < 5) {
    improvements.push({
      area: 'Identity - Strong Opinions',
      before: `Only ${principleCount} principles`,
      after: '5-7 numbered principles with reasoning',
      impact: 'medium',
    });
    queries.push(`${skillName} best practices principles`);
    actions.push(`Add ${5 - principleCount} more core principles with "because" reasoning`);
  }

  return { improvements, queries, actions };
}

function analyzeEdgesForUpgrade(sharpEdgesYaml: string, skillName: string, skillId: string): UpgradeAnalysis {
  const improvements: UpgradeImprovement[] = [];
  const queries: string[] = [];
  const actions: string[] = [];

  // Check edge count
  const edgeCount = (sharpEdgesYaml.match(/^\s*-\s*id:/gm) || []).length;
  if (edgeCount < 8) {
    improvements.push({
      area: 'Sharp Edges - Count',
      before: `Only ${edgeCount} edges`,
      after: '8-12 documented edges',
      impact: 'high',
    });
    queries.push(`${skillName} common mistakes site:github.com`);
    queries.push(`${skillName} gotcha pitfall site:stackoverflow.com`);
    queries.push(`${skillName} "bug" OR "issue" site:reddit.com`);
    actions.push(`Research and add ${8 - edgeCount} more sharp edges`);
  }

  // Check for placeholder content
  if (sharpEdgesYaml.includes('[RESEARCH:') || sharpEdgesYaml.includes('[Description]')) {
    improvements.push({
      area: 'Sharp Edges - Content',
      before: 'Contains placeholder text',
      after: 'Specific situations and solutions',
      impact: 'high',
    });
    actions.push('Replace all [RESEARCH: ...] placeholders with real findings');
  }

  // Check for missing detection patterns
  const detectionCount = (sharpEdgesYaml.match(/detection_pattern:\s*['"][^'"]+['"]/g) || []).length;
  const nullCount = (sharpEdgesYaml.match(/detection_pattern:\s*null/g) || []).length;
  if (detectionCount < 5 && edgeCount >= 5) {
    improvements.push({
      area: 'Sharp Edges - Detection',
      before: `Only ${detectionCount} regex patterns`,
      after: 'Detection patterns for automatable checks',
      impact: 'medium',
    });
    actions.push('Add regex detection patterns where code can be scanned');
  }

  // Check for code examples in solutions
  const hasCodeExamples = /# (WRONG|RIGHT)|```|good_example|bad_example/.test(sharpEdgesYaml);
  if (!hasCodeExamples && edgeCount > 0) {
    improvements.push({
      area: 'Sharp Edges - Solutions',
      before: 'Text-only solutions',
      after: 'WRONG/RIGHT code examples',
      impact: 'medium',
    });
    actions.push('Add # WRONG and # RIGHT code examples to solutions');
  }

  return { improvements, queries, actions };
}

function analyzePatternsForUpgrade(skillYaml: string, skillName: string): UpgradeAnalysis {
  const improvements: UpgradeImprovement[] = [];
  const queries: string[] = [];
  const actions: string[] = [];

  // Check pattern count
  const patternSection = skillYaml.split('patterns:')[1]?.split('anti_patterns:')[0] || '';
  const patternCount = (patternSection.match(/^\s*-\s*name:/gm) || []).length;

  if (patternCount < 4) {
    improvements.push({
      area: 'Patterns - Count',
      before: `Only ${patternCount} patterns`,
      after: '4-6 proven patterns',
      impact: 'high',
    });
    queries.push(`${skillName} design patterns`);
    queries.push(`${skillName} best practices examples`);
    actions.push(`Add ${4 - patternCount} more patterns with code examples`);
  }

  // Check anti-pattern count
  const antiPatternSection = skillYaml.split('anti_patterns:')[1]?.split('handoffs:')[0] || '';
  const antiPatternCount = (antiPatternSection.match(/^\s*-\s*name:/gm) || []).length;

  if (antiPatternCount < 4) {
    improvements.push({
      area: 'Anti-Patterns - Count',
      before: `Only ${antiPatternCount} anti-patterns`,
      after: '4-6 common mistakes',
      impact: 'medium',
    });
    queries.push(`${skillName} anti-patterns mistakes`);
    queries.push(`${skillName} "don't do" OR "avoid"`);
    actions.push(`Add ${4 - antiPatternCount} more anti-patterns`);
  }

  // Check for example code
  const exampleCount = (skillYaml.match(/example:\s*\|/g) || []).length;
  if (exampleCount < patternCount) {
    improvements.push({
      area: 'Patterns - Examples',
      before: 'Missing code examples',
      after: 'Every pattern has working code',
      impact: 'medium',
    });
    actions.push('Add example: | code blocks to each pattern');
  }

  // Check for "when" clauses
  const whenCount = (patternSection.match(/when:\s*[^\n]+/g) || []).length;
  if (whenCount < patternCount && patternCount > 0) {
    improvements.push({
      area: 'Patterns - Context',
      before: 'Missing when-to-use guidance',
      after: 'Each pattern has "when" clause',
      impact: 'low',
    });
    actions.push('Add "when:" clause to each pattern');
  }

  return { improvements, queries, actions };
}

function analyzeCollaborationForUpgrade(collaborationYaml: string, skillName: string): UpgradeAnalysis {
  const improvements: UpgradeImprovement[] = [];
  const queries: string[] = [];
  const actions: string[] = [];

  // Check if collaboration.yaml exists/has content
  if (!collaborationYaml || collaborationYaml.length < 100) {
    improvements.push({
      area: 'Collaboration - Missing',
      before: 'No collaboration.yaml',
      after: 'Full skill interaction model',
      impact: 'high',
    });
    queries.push(`${skillName} "works well with" OR "pairs with"`);
    actions.push('Create collaboration.yaml with full schema');
    return { improvements, queries, actions };
  }

  // Check complementary skills
  const complementaryCount = (collaborationYaml.match(/^\s*-\s*skill:/gm) || []).length;
  if (complementaryCount < 5) {
    improvements.push({
      area: 'Collaboration - Skills Map',
      before: `Only ${complementaryCount} complementary skills`,
      after: '5-10 related skills mapped',
      impact: 'medium',
    });
    queries.push(`${skillName} ecosystem related tools`);
    actions.push(`Add ${5 - complementaryCount} more complementary skills`);
  }

  // Check delegation triggers
  const delegationCount = (collaborationYaml.match(/delegate_to:/g) || []).length;
  if (delegationCount < 3) {
    improvements.push({
      area: 'Collaboration - Delegation',
      before: `Only ${delegationCount} delegation triggers`,
      after: '3-5 handoff scenarios',
      impact: 'medium',
    });
    actions.push('Add delegation triggers for when to hand off work');
  }

  // Check cross-domain insights
  const domainCount = (collaborationYaml.match(/^\s*-\s*domain:/gm) || []).length;
  if (domainCount < 2) {
    improvements.push({
      area: 'Collaboration - Cross-Domain',
      before: `Only ${domainCount} cross-domain insights`,
      after: '2-3 adjacent field insights',
      impact: 'medium',
    });
    queries.push(`${skillName} interdisciplinary insights`);
    actions.push('Add cross-domain insights from psychology, economics, etc.');
  }

  // Check ecosystem
  const hasEcosystem = collaborationYaml.includes('ecosystem:');
  if (!hasEcosystem) {
    improvements.push({
      area: 'Collaboration - Ecosystem',
      before: 'No ecosystem mapping',
      after: 'Primary tools, alternatives, deprecated',
      impact: 'low',
    });
    queries.push(`${skillName} vs alternatives comparison`);
    actions.push('Add ecosystem section with tools and alternatives');
  }

  return { improvements, queries, actions };
}

// =============================================================================
// Instruction Builder
// =============================================================================

function buildUpgradeInstruction(result: UpgradeResult): string {
  const improvementsByImpact = {
    high: result.improvements.filter(i => i.impact === 'high'),
    medium: result.improvements.filter(i => i.impact === 'medium'),
    low: result.improvements.filter(i => i.impact === 'low'),
  };

  return `## Skill Upgrade Plan: ${result.skill_id}

### Score Impact
**Before:** ${result.before_score}/100
**After (estimated):** ${result.after_score_estimate}/100
**Focus Area:** ${result.focus_area}

---

### High-Impact Improvements (${improvementsByImpact.high.length})
${improvementsByImpact.high.map(i => `
**${i.area}**
- Before: ${i.before}
- After: ${i.after}
`).join('') || 'None identified'}

### Medium-Impact Improvements (${improvementsByImpact.medium.length})
${improvementsByImpact.medium.map(i => `
**${i.area}**
- Before: ${i.before}
- After: ${i.after}
`).join('') || 'None identified'}

${improvementsByImpact.low.length > 0 ? `
### Low-Impact Improvements (${improvementsByImpact.low.length})
${improvementsByImpact.low.map(i => `- ${i.area}`).join('\n')}
` : ''}

---

### Research Queries

Run these searches to find content for improvements:

${result.research_queries.slice(0, 8).map(q => `- \`${q}\``).join('\n')}

---

### Action Items

${result.action_items.map((a, i) => `${i + 1}. ${a}`).join('\n')}

---

### Next Steps

1. Run the research queries above
2. Update skill files with findings
3. Use \`spawner_skill_score\` to verify improvement
4. Repeat until score >= 80`;
}
