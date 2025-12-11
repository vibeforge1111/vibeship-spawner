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
 */

import type { Env } from '../types.js';
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

// =============================================================================
// Register all tools
// =============================================================================

// V2 Original Tools
registerTool({
  definition: loadToolDefinition,
  execute: (env, args, userId) => executeLoad(env, args, userId),
});

registerTool({
  definition: validateToolDefinition,
  execute: (env, args, userId) => executeValidate(env, args, userId),
});

registerTool({
  definition: rememberToolDefinition,
  execute: (env, args, userId) => executeRemember(env, args, userId),
});

registerTool({
  definition: watchOutToolDefinition,
  execute: (env, args, _userId) => executeWatchOut(env, args),
});

registerTool({
  definition: unstickToolDefinition,
  execute: (env, args, _userId) => executeUnstick(env, args),
});

// V1 Ported Tools
registerTool({
  definition: templatesToolDefinition,
  execute: (env, args, _userId) => executeTemplates(env, args),
});

registerTool({
  definition: skillsToolDefinition,
  execute: (env, args, _userId) => executeSkills(env, args),
});

// Planning & Analysis Tools
registerTool({
  definition: planToolDefinition,
  execute: (env, args, userId) => executePlan(env, args, userId),
});

registerTool({
  definition: analyzeToolDefinition,
  execute: (env, args, _userId) => executeAnalyze(env, args),
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
};
