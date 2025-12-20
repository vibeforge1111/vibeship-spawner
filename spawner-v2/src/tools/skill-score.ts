/**
 * spawner_skill_score Tool
 *
 * Scores an existing skill against the world-class quality rubric.
 * Returns a 100-point score across 4 dimensions:
 * - Identity Depth (25 points)
 * - Sharp Edges Quality (25 points)
 * - Patterns & Anti-Patterns (25 points)
 * - Collaboration & Ecosystem (25 points)
 *
 * Minimum to ship: 80/100
 */

import { z } from 'zod';
import type { Env } from '../types.js';

// =============================================================================
// Types
// =============================================================================

interface ScoreCategory {
  name: string;
  max_points: number;
  earned_points: number;
  checks: ScoreCheck[];
}

interface ScoreCheck {
  name: string;
  points: number;
  earned: number;
  status: 'pass' | 'partial' | 'fail';
  feedback: string;
}

export interface SkillScoreResult {
  skill_id: string;
  total_score: number;
  max_score: number;
  percentage: number;
  passed: boolean;
  minimum_required: number;
  categories: ScoreCategory[];
  gaps: string[];
  suggestions: string[];
  summary: string;
}

// =============================================================================
// Schema
// =============================================================================

export const skillScoreInputSchema = z.object({
  skill_content: z.object({
    skill_yaml: z.string().optional().describe('Content of skill.yaml file'),
    sharp_edges_yaml: z.string().optional().describe('Content of sharp-edges.yaml file'),
    validations_yaml: z.string().optional().describe('Content of validations.yaml file'),
    collaboration_yaml: z.string().optional().describe('Content of collaboration.yaml file'),
  }).describe('Skill file contents to score'),
  skill_id: z.string().optional().describe('Skill ID for reference'),
});

// =============================================================================
// Tool Definition
// =============================================================================

export const skillScoreToolDefinition = {
  name: 'spawner_skill_score',
  description: 'Score a skill against the world-class quality rubric. Returns a 100-point score with gap analysis and improvement suggestions. Minimum 80/100 to ship.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      skill_content: {
        type: 'object',
        properties: {
          skill_yaml: { type: 'string', description: 'Content of skill.yaml' },
          sharp_edges_yaml: { type: 'string', description: 'Content of sharp-edges.yaml' },
          validations_yaml: { type: 'string', description: 'Content of validations.yaml' },
          collaboration_yaml: { type: 'string', description: 'Content of collaboration.yaml' },
        },
        description: 'Skill file contents to score',
      },
      skill_id: {
        type: 'string',
        description: 'Skill ID for reference',
      },
    },
    required: ['skill_content'],
  },
};

// =============================================================================
// Output Type
// =============================================================================

export interface SkillScoreOutput {
  score: SkillScoreResult;
  _instruction: string;
}

// =============================================================================
// Executor
// =============================================================================

export async function executeSkillScore(
  _env: Env,
  input: z.infer<typeof skillScoreInputSchema>
): Promise<SkillScoreOutput> {
  const parsed = skillScoreInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(`Invalid input: ${parsed.error.message}`);
  }

  const { skill_content, skill_id = 'unknown' } = parsed.data;
  const { skill_yaml, sharp_edges_yaml, validations_yaml, collaboration_yaml } = skill_content;

  // Score each category
  const identityScore = scoreIdentity(skill_yaml || '');
  const sharpEdgesScore = scoreSharpEdges(sharp_edges_yaml || '');
  const patternsScore = scorePatterns(skill_yaml || '');
  const collaborationScore = scoreCollaboration(collaboration_yaml || '', skill_yaml || '');

  const categories = [identityScore, sharpEdgesScore, patternsScore, collaborationScore];

  // Calculate totals
  const total_score = categories.reduce((sum, cat) => sum + cat.earned_points, 0);
  const max_score = 100;
  const percentage = total_score;
  const minimum_required = 80;
  const passed = total_score >= minimum_required;

  // Gather gaps and suggestions
  const gaps: string[] = [];
  const suggestions: string[] = [];

  categories.forEach(cat => {
    cat.checks.forEach(check => {
      if (check.status === 'fail') {
        gaps.push(`${cat.name}: ${check.name} (0/${check.points})`);
        suggestions.push(check.feedback);
      } else if (check.status === 'partial') {
        gaps.push(`${cat.name}: ${check.name} (${check.earned}/${check.points})`);
        suggestions.push(check.feedback);
      }
    });
  });

  const summary = generateSummary(total_score, passed, categories);

  const result: SkillScoreResult = {
    skill_id,
    total_score,
    max_score,
    percentage,
    passed,
    minimum_required,
    categories,
    gaps,
    suggestions,
    summary,
  };

  return {
    score: result,
    _instruction: buildScoreInstruction(result),
  };
}

// =============================================================================
// Scoring Functions
// =============================================================================

function scoreIdentity(skillYaml: string): ScoreCategory {
  const checks: ScoreCheck[] = [];

  // Check 1: Battle scars specific, not generic (5 points)
  const hasBattleScars = skillYaml.includes('battle scar') ||
    skillYaml.includes("You've") ||
    skillYaml.includes('learned the hard way') ||
    skillYaml.includes('worked at') ||
    /\d+\s*(years?|decades?)/.test(skillYaml);
  const battleScarsGeneric = skillYaml.includes('[role]') || skillYaml.includes('[experience]');

  checks.push({
    name: 'Battle scars specific',
    points: 5,
    earned: hasBattleScars && !battleScarsGeneric ? 5 : battleScarsGeneric ? 0 : 2,
    status: hasBattleScars && !battleScarsGeneric ? 'pass' : battleScarsGeneric ? 'fail' : 'partial',
    feedback: battleScarsGeneric
      ? 'Replace generic [role] and [experience] placeholders with specific battle scars'
      : hasBattleScars
        ? 'Battle scars are specific and believable'
        : 'Add specific experiences that shaped this expertise',
  });

  // Check 2: Strong opinions with reasoning (5 points)
  const hasOpinions = skillYaml.includes('principle') || skillYaml.includes('core belief');
  const hasBecause = (skillYaml.match(/because|since|due to|this is why/gi) || []).length >= 3;
  const opinionCount = (skillYaml.match(/^\s*\d+\.\s+/gm) || []).length;

  checks.push({
    name: 'Strong opinions with reasoning',
    points: 5,
    earned: hasOpinions && hasBecause && opinionCount >= 4 ? 5 : hasOpinions ? 3 : 0,
    status: hasOpinions && hasBecause && opinionCount >= 4 ? 'pass' : hasOpinions ? 'partial' : 'fail',
    feedback: hasOpinions && hasBecause && opinionCount >= 4
      ? 'Strong opinions are well-reasoned'
      : hasOpinions
        ? 'Add "because" reasoning to each principle'
        : 'Add 5-7 numbered core principles with reasoning',
  });

  // Check 3: Contrarian insights (5 points)
  const hasContrarian = skillYaml.includes('CONTRARIAN') ||
    skillYaml.includes('get wrong') ||
    skillYaml.includes('most people') ||
    skillYaml.includes('conventional wisdom') ||
    skillYaml.includes('contrary to');

  checks.push({
    name: 'Contrarian insights included',
    points: 5,
    earned: hasContrarian ? 5 : 0,
    status: hasContrarian ? 'pass' : 'fail',
    feedback: hasContrarian
      ? 'Includes contrarian perspective'
      : 'Add section on what most practitioners get wrong',
  });

  // Check 4: History/evolution documented (5 points)
  const hasHistory = skillYaml.includes('HISTORY') ||
    skillYaml.includes('evolution') ||
    skillYaml.includes('evolved from') ||
    skillYaml.includes('tried before');
  const hasEvolution = skillYaml.includes('heading') || skillYaml.includes('future');

  checks.push({
    name: 'History/evolution documented',
    points: 5,
    earned: hasHistory && hasEvolution ? 5 : hasHistory ? 3 : 0,
    status: hasHistory && hasEvolution ? 'pass' : hasHistory ? 'partial' : 'fail',
    feedback: hasHistory && hasEvolution
      ? 'History and future direction documented'
      : hasHistory
        ? 'Add where the field is heading'
        : 'Add history of the field and where it is heading',
  });

  // Check 5: Limits & prerequisites clear (5 points)
  const hasLimits = skillYaml.includes('LIMITS') ||
    skillYaml.includes("don't cover") ||
    skillYaml.includes('defer to') ||
    skillYaml.includes('out of scope');
  const hasPrerequisites = skillYaml.includes('PREREQUISITE') ||
    skillYaml.includes('should understand');

  checks.push({
    name: 'Limits & prerequisites clear',
    points: 5,
    earned: hasLimits && hasPrerequisites ? 5 : hasLimits || hasPrerequisites ? 3 : 0,
    status: hasLimits && hasPrerequisites ? 'pass' : hasLimits || hasPrerequisites ? 'partial' : 'fail',
    feedback: hasLimits && hasPrerequisites
      ? 'Limits and prerequisites are defined'
      : 'Add what this skill does NOT cover and what knowledge is required',
  });

  return {
    name: 'Identity Depth',
    max_points: 25,
    earned_points: checks.reduce((sum, c) => sum + c.earned, 0),
    checks,
  };
}

function scoreSharpEdges(sharpEdgesYaml: string): ScoreCategory {
  const checks: ScoreCheck[] = [];

  // Check 1: 8-12 edges from real pain points (5 points)
  const edgeCount = (sharpEdgesYaml.match(/^\s*-\s*id:/gm) || []).length;
  const hasPlaceholders = sharpEdgesYaml.includes('[RESEARCH:') || sharpEdgesYaml.includes('[Description]');

  checks.push({
    name: '8-12 edges from real pain',
    points: 5,
    earned: edgeCount >= 8 && !hasPlaceholders ? 5 : edgeCount >= 5 ? 3 : edgeCount >= 3 ? 1 : 0,
    status: edgeCount >= 8 && !hasPlaceholders ? 'pass' : edgeCount >= 3 ? 'partial' : 'fail',
    feedback: edgeCount >= 8 && !hasPlaceholders
      ? `${edgeCount} sharp edges documented`
      : `Add ${Math.max(0, 8 - edgeCount)} more sharp edges (have ${edgeCount}, need 8-12)`,
  });

  // Check 2: Each has specific situation (5 points)
  const situationCount = (sharpEdgesYaml.match(/situation:\s*\|/g) || []).length;
  const situationsSpecific = !sharpEdgesYaml.includes('[When/how') && situationCount > 0;

  checks.push({
    name: 'Specific situations documented',
    points: 5,
    earned: situationsSpecific && situationCount >= 5 ? 5 : situationCount >= 3 ? 3 : situationCount >= 1 ? 1 : 0,
    status: situationsSpecific && situationCount >= 5 ? 'pass' : situationCount >= 1 ? 'partial' : 'fail',
    feedback: situationsSpecific && situationCount >= 5
      ? 'Situations are specific'
      : 'Add specific situations (not generic) to each edge',
  });

  // Check 3: Solutions are copy-paste ready (5 points)
  const solutionCount = (sharpEdgesYaml.match(/solution:\s*\|/g) || []).length;
  const hasCodeInSolutions = /```|# (WRONG|RIGHT)|good_example|bad_example/.test(sharpEdgesYaml);

  checks.push({
    name: 'Solutions are copy-paste ready',
    points: 5,
    earned: hasCodeInSolutions && solutionCount >= 5 ? 5 : solutionCount >= 3 ? 3 : solutionCount >= 1 ? 1 : 0,
    status: hasCodeInSolutions && solutionCount >= 5 ? 'pass' : solutionCount >= 1 ? 'partial' : 'fail',
    feedback: hasCodeInSolutions && solutionCount >= 5
      ? 'Solutions include working code'
      : 'Add WRONG/RIGHT code examples to solutions',
  });

  // Check 4: Detection patterns present (5 points)
  const detectionCount = (sharpEdgesYaml.match(/detection_pattern:\s*['"]?[^'"\n]+['"]?/g) || []).length;
  const nullPatterns = (sharpEdgesYaml.match(/detection_pattern:\s*null/g) || []).length;

  checks.push({
    name: 'Detection patterns defined',
    points: 5,
    earned: detectionCount >= 5 ? 5 : detectionCount >= 3 ? 3 : detectionCount >= 1 ? 2 : 0,
    status: detectionCount >= 5 ? 'pass' : detectionCount >= 1 ? 'partial' : 'fail',
    feedback: detectionCount >= 5
      ? `${detectionCount} detection patterns defined (${nullPatterns} null for process issues)`
      : `Add regex detection patterns where possible (${detectionCount} found, ${nullPatterns} null)`,
  });

  // Check 5: Sourced from real issues (5 points)
  const hasSymptoms = (sharpEdgesYaml.match(/symptoms:/g) || []).length >= 3;
  const symptomsSpecific = !sharpEdgesYaml.includes('[Observable sign') && hasSymptoms;

  checks.push({
    name: 'Real symptoms documented',
    points: 5,
    earned: symptomsSpecific ? 5 : hasSymptoms ? 3 : 0,
    status: symptomsSpecific ? 'pass' : hasSymptoms ? 'partial' : 'fail',
    feedback: symptomsSpecific
      ? 'Symptoms are observable and specific'
      : 'Add specific observable symptoms (error messages, user feedback)',
  });

  return {
    name: 'Sharp Edges Quality',
    max_points: 25,
    earned_points: checks.reduce((sum, c) => sum + c.earned, 0),
    checks,
  };
}

function scorePatterns(skillYaml: string): ScoreCategory {
  const checks: ScoreCheck[] = [];

  // Check 1: Patterns from expert content (5 points)
  const patternCount = (skillYaml.match(/^\s*-\s*name:\s*[^\n]+\n\s*description:/gm) || []).length;
  const hasPlaceholders = skillYaml.includes('[Pattern Name]');

  checks.push({
    name: 'Expert patterns documented',
    points: 5,
    earned: patternCount >= 4 && !hasPlaceholders ? 5 : patternCount >= 2 ? 3 : patternCount >= 1 ? 1 : 0,
    status: patternCount >= 4 && !hasPlaceholders ? 'pass' : patternCount >= 1 ? 'partial' : 'fail',
    feedback: patternCount >= 4 && !hasPlaceholders
      ? `${patternCount} patterns documented`
      : `Add ${Math.max(0, 4 - patternCount)} more patterns (have ${patternCount}, need 4-6)`,
  });

  // Check 2: Anti-patterns from real failures (5 points)
  const antiPatternSection = skillYaml.includes('anti_patterns:');
  const antiPatternCount = antiPatternSection
    ? (skillYaml.split('anti_patterns:')[1]?.match(/^\s*-\s*name:/gm) || []).length
    : 0;

  checks.push({
    name: 'Anti-patterns from real failures',
    points: 5,
    earned: antiPatternCount >= 4 ? 5 : antiPatternCount >= 2 ? 3 : antiPatternCount >= 1 ? 1 : 0,
    status: antiPatternCount >= 4 ? 'pass' : antiPatternCount >= 1 ? 'partial' : 'fail',
    feedback: antiPatternCount >= 4
      ? `${antiPatternCount} anti-patterns documented`
      : `Add ${Math.max(0, 4 - antiPatternCount)} more anti-patterns (have ${antiPatternCount}, need 4-6)`,
  });

  // Check 3: Code examples work (5 points)
  const hasExamples = skillYaml.includes('example: |') || skillYaml.includes('example:');
  const exampleCount = (skillYaml.match(/example:\s*\|/g) || []).length;

  checks.push({
    name: 'Working code examples',
    points: 5,
    earned: exampleCount >= 4 ? 5 : exampleCount >= 2 ? 3 : hasExamples ? 1 : 0,
    status: exampleCount >= 4 ? 'pass' : hasExamples ? 'partial' : 'fail',
    feedback: exampleCount >= 4
      ? 'Patterns include code examples'
      : 'Add copy-paste ready code examples to patterns',
  });

  // Check 4: Why is non-obvious (5 points)
  const hasWhy = (skillYaml.match(/why:\s*\|?/g) || []).length;
  const whySpecific = !skillYaml.includes('[Why this') && hasWhy >= 2;

  checks.push({
    name: 'Non-obvious "why" explained',
    points: 5,
    earned: whySpecific && hasWhy >= 4 ? 5 : hasWhy >= 2 ? 3 : hasWhy >= 1 ? 1 : 0,
    status: whySpecific && hasWhy >= 4 ? 'pass' : hasWhy >= 1 ? 'partial' : 'fail',
    feedback: whySpecific && hasWhy >= 4
      ? 'Anti-patterns explain non-obvious consequences'
      : 'Explain WHY each anti-pattern is bad (consequences, not just "bad practice")',
  });

  // Check 5: Trade-offs documented (5 points)
  const hasTradeoffs = skillYaml.includes('instead:') || skillYaml.includes('trade') || skillYaml.includes('when:');
  const tradeoffCount = (skillYaml.match(/when:\s*[^\n]+/g) || []).length;

  checks.push({
    name: 'Trade-offs documented',
    points: 5,
    earned: tradeoffCount >= 3 ? 5 : hasTradeoffs ? 3 : 0,
    status: tradeoffCount >= 3 ? 'pass' : hasTradeoffs ? 'partial' : 'fail',
    feedback: tradeoffCount >= 3
      ? 'When-to-use documented for patterns'
      : 'Add "when:" clauses showing when each pattern applies',
  });

  return {
    name: 'Patterns & Anti-Patterns',
    max_points: 25,
    earned_points: checks.reduce((sum, c) => sum + c.earned, 0),
    checks,
  };
}

function scoreCollaboration(collaborationYaml: string, skillYaml: string): ScoreCategory {
  const checks: ScoreCheck[] = [];

  // Check 1: Prerequisites identified (5 points)
  const hasPrereqs = collaborationYaml.includes('prerequisites:') || skillYaml.includes('requires:');
  const prereqSkills = (collaborationYaml.match(/skills:\s*\n(\s*-\s*[^\n]+\n)+/g) || []).length > 0;
  const prereqKnowledge = (collaborationYaml.match(/knowledge:\s*\n(\s*-\s*[^\n]+\n)+/g) || []).length > 0;

  checks.push({
    name: 'Prerequisites identified',
    points: 5,
    earned: prereqSkills && prereqKnowledge ? 5 : hasPrereqs ? 3 : 0,
    status: prereqSkills && prereqKnowledge ? 'pass' : hasPrereqs ? 'partial' : 'fail',
    feedback: prereqSkills && prereqKnowledge
      ? 'Prerequisite skills and knowledge defined'
      : 'Add prerequisite skills and foundational knowledge',
  });

  // Check 2: 5+ complementary skills mapped (5 points)
  const complementaryCount = (collaborationYaml.match(/^\s*-\s*skill:/gm) || []).length;
  const hasRelationship = collaborationYaml.includes('relationship:');

  checks.push({
    name: '5+ complementary skills mapped',
    points: 5,
    earned: complementaryCount >= 5 && hasRelationship ? 5 : complementaryCount >= 3 ? 3 : complementaryCount >= 1 ? 1 : 0,
    status: complementaryCount >= 5 && hasRelationship ? 'pass' : complementaryCount >= 1 ? 'partial' : 'fail',
    feedback: complementaryCount >= 5 && hasRelationship
      ? `${complementaryCount} complementary skills mapped`
      : `Add ${Math.max(0, 5 - complementaryCount)} more complementary skills with relationships`,
  });

  // Check 3: Delegation triggers defined (5 points)
  const hasDelegation = collaborationYaml.includes('delegation:');
  const delegationCount = (collaborationYaml.match(/delegate_to:/g) || []).length;

  checks.push({
    name: 'Delegation triggers defined',
    points: 5,
    earned: delegationCount >= 3 ? 5 : delegationCount >= 1 ? 3 : 0,
    status: delegationCount >= 3 ? 'pass' : delegationCount >= 1 ? 'partial' : 'fail',
    feedback: delegationCount >= 3
      ? `${delegationCount} delegation triggers defined`
      : 'Add delegation triggers for when to hand off to other skills',
  });

  // Check 4: Cross-domain insights captured (5 points)
  const hasCrossDomain = collaborationYaml.includes('cross_domain') || collaborationYaml.includes('domain:');
  const domainCount = (collaborationYaml.match(/^\s*-\s*domain:/gm) || []).length;

  checks.push({
    name: 'Cross-domain insights captured',
    points: 5,
    earned: domainCount >= 2 ? 5 : domainCount >= 1 ? 3 : 0,
    status: domainCount >= 2 ? 'pass' : hasCrossDomain ? 'partial' : 'fail',
    feedback: domainCount >= 2
      ? `${domainCount} cross-domain insights documented`
      : 'Add insights from adjacent fields (psychology, economics, etc.)',
  });

  // Check 5: Ecosystem alternatives known (5 points)
  const hasEcosystem = collaborationYaml.includes('ecosystem:');
  const hasPrimary = collaborationYaml.includes('primary_tools:');
  const hasAlternatives = collaborationYaml.includes('alternatives:');
  const hasDeprecated = collaborationYaml.includes('deprecated:');

  checks.push({
    name: 'Ecosystem documented',
    points: 5,
    earned: hasPrimary && hasAlternatives && hasDeprecated ? 5 : hasEcosystem ? 3 : 0,
    status: hasPrimary && hasAlternatives && hasDeprecated ? 'pass' : hasEcosystem ? 'partial' : 'fail',
    feedback: hasPrimary && hasAlternatives && hasDeprecated
      ? 'Primary tools, alternatives, and deprecated listed'
      : 'Add primary_tools, alternatives, and deprecated to ecosystem',
  });

  return {
    name: 'Collaboration & Ecosystem',
    max_points: 25,
    earned_points: checks.reduce((sum, c) => sum + c.earned, 0),
    checks,
  };
}

function generateSummary(score: number, passed: boolean, categories: ScoreCategory[]): string {
  const weakest = categories.reduce((min, cat) =>
    (cat.earned_points / cat.max_points) < (min.earned_points / min.max_points) ? cat : min
  );
  const strongest = categories.reduce((max, cat) =>
    (cat.earned_points / cat.max_points) > (max.earned_points / max.max_points) ? cat : max
  );

  if (passed) {
    return `Score: ${score}/100 - READY TO SHIP. Strongest: ${strongest.name}. Consider improving: ${weakest.name}.`;
  } else {
    return `Score: ${score}/100 - NEEDS WORK (minimum 80). Focus on: ${weakest.name} (${weakest.earned_points}/${weakest.max_points}).`;
  }
}

function buildScoreInstruction(result: SkillScoreResult): string {
  const categoryBreakdown = result.categories.map(cat => {
    const pct = Math.round((cat.earned_points / cat.max_points) * 100);
    const icon = pct >= 80 ? '✅' : pct >= 50 ? '⚠️' : '❌';
    return `${icon} ${cat.name}: ${cat.earned_points}/${cat.max_points} (${pct}%)`;
  }).join('\n');

  return `## Skill Quality Score: ${result.skill_id}

### Overall Score
**${result.total_score}/${result.max_score}** (${result.percentage}%)
**Status:** ${result.passed ? '✅ READY TO SHIP' : '❌ NEEDS WORK'}
**Minimum Required:** ${result.minimum_required}

---

### Category Breakdown

${categoryBreakdown}

---

${result.gaps.length > 0 ? `### Gaps to Address

${result.gaps.map(g => `- ${g}`).join('\n')}

---` : ''}

${result.suggestions.length > 0 ? `### Improvement Suggestions

${result.suggestions.slice(0, 5).map((s, i) => `${i + 1}. ${s}`).join('\n')}

---` : ''}

### Summary

${result.summary}

${!result.passed ? `
Use \`spawner_skill_upgrade\` to improve the weakest areas, or manually enhance the skill files.
` : `
Skill is ready to upload to KV. Run: \`node scripts/upload-skills.js\`
`}`;
}
