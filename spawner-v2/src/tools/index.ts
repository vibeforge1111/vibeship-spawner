/**
 * Tools Module Index
 *
 * V2 Original Tools:
 * - load (was: context), validate, remember, watch-out (was: sharp-edge), unstick
 *
 * V1 Ported Tools:
 * - templates (list project templates)
 * - skills (unified skill search)
 *
 * Planning & Analysis Tools:
 * - plan (unified: discover + recommend + create)
 * - analyze (codebase analysis for existing projects)
 *
 * Skill Creation Tools (Pipeline: brainstorm? → research → new → score):
 * - spawner_skill_brainstorm (optional pre-pipeline deep exploration)
 * - spawner_skill_research (research phase for world-class skills)
 * - spawner_skill_new (scaffold new skills with 4 YAML files)
 * - spawner_skill_score (quality scoring against 100-point rubric)
 * - spawner_skill_upgrade (enhance existing skills)
 *
 * Orchestration Tool:
 * - orchestrate (main entry point - auto-detects context)
 */

import {
  registerTool,
  getToolDefinitions,
  executeTool,
  hasTool,
  type RegisteredTool,
  type ToolDefinition,
} from './registry.js';

// Import tool definitions and executors
import { loadToolDefinition, executeLoad } from './context.js';
import { validateToolDefinition, executeValidate } from './validate.js';
import { rememberToolDefinition, executeRemember } from './remember.js';
import { watchOutToolDefinition, executeWatchOut } from './sharp-edge.js';
import { unstickToolDefinition, executeUnstick } from './unstick.js';
import { templatesToolDefinition, executeTemplates } from './templates.js';
import { skillsToolDefinition, executeSkills } from './skills.js';
import { planToolDefinition, executePlan } from './plan.js';
import { analyzeToolDefinition, executeAnalyze } from './analyze.js';
import { skillCreateToolDefinition, executeSkillCreate } from './skill-create.js';
import { skillResearchToolDefinition, executeSkillResearch } from './skill-research.js';
import { skillScoreToolDefinition, executeSkillScore } from './skill-score.js';
import { skillUpgradeToolDefinition, executeSkillUpgrade } from './skill-upgrade.js';
import { skillBrainstormToolDefinition, executeSkillBrainstorm } from './skill-brainstorm.js';
import { orchestrateToolDefinition, executeOrchestrate } from './orchestrate.js';

// =============================================================================
// Register all tools
// =============================================================================

// V2 Original Tools
registerTool({
  definition: loadToolDefinition,
  execute: (env, args, userId) => executeLoad(env, args as Parameters<typeof executeLoad>[1], userId),
});

registerTool({
  definition: validateToolDefinition,
  execute: (env, args, userId) => executeValidate(env, args as Parameters<typeof executeValidate>[1], userId),
});

registerTool({
  definition: rememberToolDefinition,
  execute: (env, args, userId) => executeRemember(env, args as Parameters<typeof executeRemember>[1], userId),
});

registerTool({
  definition: watchOutToolDefinition,
  execute: (env, args, _userId) => executeWatchOut(env, args as Parameters<typeof executeWatchOut>[1]),
});

registerTool({
  definition: unstickToolDefinition,
  execute: (env, args, _userId) => executeUnstick(env, args as Parameters<typeof executeUnstick>[1]),
});

// V1 Ported Tools
registerTool({
  definition: templatesToolDefinition,
  execute: (env, args, _userId) => executeTemplates(env, args as Parameters<typeof executeTemplates>[1]),
});

registerTool({
  definition: skillsToolDefinition,
  execute: (env, args, _userId) => executeSkills(env, args as Parameters<typeof executeSkills>[1]),
});

// Planning & Analysis Tools
registerTool({
  definition: planToolDefinition,
  execute: (env, args, userId) => executePlan(env, args as Parameters<typeof executePlan>[1], userId),
});

registerTool({
  definition: analyzeToolDefinition,
  execute: (env, args, _userId) => executeAnalyze(env, args as Parameters<typeof executeAnalyze>[1]),
});

// Skill Creation Tools
registerTool({
  definition: skillCreateToolDefinition,
  execute: (env, args, _userId) => executeSkillCreate(env, args as Parameters<typeof executeSkillCreate>[1]),
});

registerTool({
  definition: skillResearchToolDefinition,
  execute: (env, args, _userId) => executeSkillResearch(env, args as Parameters<typeof executeSkillResearch>[1]),
});

registerTool({
  definition: skillScoreToolDefinition,
  execute: (env, args, _userId) => executeSkillScore(env, args as Parameters<typeof executeSkillScore>[1]),
});

registerTool({
  definition: skillUpgradeToolDefinition,
  execute: (env, args, _userId) => executeSkillUpgrade(env, args as Parameters<typeof executeSkillUpgrade>[1]),
});

registerTool({
  definition: skillBrainstormToolDefinition,
  execute: (env, args, _userId) => executeSkillBrainstorm(env, args as Parameters<typeof executeSkillBrainstorm>[1]),
});

// Orchestration Tool (main entry point)
registerTool({
  definition: orchestrateToolDefinition,
  execute: (env, args, _userId) => executeOrchestrate(env, args as Parameters<typeof executeOrchestrate>[1]),
});

// =============================================================================
// Re-exports for backwards compatibility
// =============================================================================

// Re-export from registry
export { getToolDefinitions, executeTool, hasTool };
export type { RegisteredTool, ToolDefinition };

// Re-export definitions for direct access if needed
export {
  loadToolDefinition,
  validateToolDefinition,
  rememberToolDefinition,
  watchOutToolDefinition,
  unstickToolDefinition,
  templatesToolDefinition,
  skillsToolDefinition,
  planToolDefinition,
  analyzeToolDefinition,
  skillCreateToolDefinition,
  skillResearchToolDefinition,
  skillScoreToolDefinition,
  skillUpgradeToolDefinition,
  skillBrainstormToolDefinition,
  orchestrateToolDefinition,
};

// Re-export executors for direct access if needed
export {
  executeLoad,
  executeValidate,
  executeRemember,
  executeWatchOut,
  executeUnstick,
  executeTemplates,
  executeSkills,
  executePlan,
  executeAnalyze,
  executeSkillCreate,
  executeSkillResearch,
  executeSkillScore,
  executeSkillUpgrade,
  executeSkillBrainstorm,
  executeOrchestrate,
};
