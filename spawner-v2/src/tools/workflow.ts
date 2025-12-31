/**
 * Spawner Workflow Tool
 *
 * MCP tool for multi-agent orchestration.
 * Enables workflows, teams, and contract validation.
 */

import type { Env } from '../types.js';
import type { ToolDefinition, RegisteredTool } from './registry.js';
import {
  WorkflowEngine,
  BUILTIN_WORKFLOWS,
  getBuiltinWorkflow,
  listBuiltinWorkflows,
  createSequentialWorkflow,
  formatWorkflowState,
  type WorkflowDefinition,
  type WorkflowStep
} from '../orchestration/workflow.js';
import {
  BUILTIN_TEAMS,
  getTeam,
  findTeamByTrigger,
  listTeams,
  activateTeam,
  teamToWorkflow,
  formatTeam,
  formatActiveTeam,
  type SkillTeam,
  type CommunicationPattern
} from '../orchestration/teams.js';
import {
  extractContract,
  validateContract,
  createHandoffPackage,
  formatContractValidation
} from '../orchestration/contracts.js';
import {
  emitWorkflowStart,
  emitWorkflowComplete,
  emitTeamActivate,
  emitContractCheck
} from '../orchestration/events.js';
import {
  saveWorkflowState,
  loadWorkflowState,
  listActiveWorkflows,
  saveTeamState,
  formatPersistedWorkflowList
} from '../orchestration/index.js';
import { loadSkill } from '../skills/loader.js';
import { getSharpEdgesForSkill } from '../skills/sharp-edges.js';

// =============================================================================
// Tool Definition
// =============================================================================

export const workflowToolDefinition: ToolDefinition = {
  name: 'spawner_workflow',
  description: `Orchestrate skills in workflows and teams.

Actions:
- list_workflows: Show available workflow templates
- list_teams: Show available skill teams
- start_workflow: Begin a workflow
- start_team: Activate a skill team
- validate_handoff: Check if handoff data is complete
- find_team: Find team by trigger phrase
- create_team: Create a custom team from skills
- create_workflow: Create workflow from natural language description
- check_skills: Validate skills exist before starting
- list_active: List active (in-progress) workflows
- resume: Resume a saved workflow
- check_gate: Run quality gate validation on step outputs

Example usage:
- spawner_workflow({ action: "list_teams" })
- spawner_workflow({ action: "start_team", team_id: "game-jam" })
- spawner_workflow({ action: "create_team", name: "My Team", skills: ["backend", "frontend"], lead: "backend" })
- spawner_workflow({ action: "create_workflow", description: "First design API, then build backend and frontend in parallel" })
- spawner_workflow({ action: "check_skills", skills: ["backend", "frontend", "devops"] })
- spawner_workflow({ action: "list_active" })
- spawner_workflow({ action: "resume", state_id: "wf_feature-build_1234567890" })
- spawner_workflow({ action: "check_gate", validator: "code-review", criteria: ["no_critical", "tests_pass"], outputs: { code: "..." } })`,
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['list_workflows', 'list_teams', 'start_workflow', 'start_team', 'validate_handoff', 'find_team', 'create_team', 'create_workflow', 'check_skills', 'list_active', 'resume', 'check_gate'],
        description: 'Action to perform'
      },
      workflow_id: {
        type: 'string',
        description: 'Workflow ID for start_workflow action'
      },
      team_id: {
        type: 'string',
        description: 'Team ID for start_team action'
      },
      trigger: {
        type: 'string',
        description: 'Trigger phrase for find_team action'
      },
      from_skill: {
        type: 'string',
        description: 'Source skill for validate_handoff'
      },
      to_skill: {
        type: 'string',
        description: 'Target skill for validate_handoff'
      },
      data: {
        type: 'object',
        description: 'Data being handed off for validate_handoff'
      },
      initial_state: {
        type: 'object',
        description: 'Initial state for workflow/team'
      },
      // For create_team
      name: {
        type: 'string',
        description: 'Team name for create_team action'
      },
      skills: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of skill IDs for create_team or check_skills'
      },
      lead: {
        type: 'string',
        description: 'Lead skill ID for create_team'
      },
      communication: {
        type: 'string',
        enum: ['hub-spoke', 'pipeline', 'broadcast', 'mesh'],
        description: 'Communication pattern for create_team'
      },
      // For create_workflow
      description: {
        type: 'string',
        description: 'Natural language description for create_workflow'
      },
      // For resume
      state_id: {
        type: 'string',
        description: 'Workflow state ID for resume action'
      },
      // For check_gate
      validator: {
        type: 'string',
        description: 'Validator skill ID for check_gate action'
      },
      criteria: {
        type: 'array',
        items: { type: 'string' },
        description: 'Criteria to check (e.g., ["no_critical", "tests_pass"])'
      },
      outputs: {
        type: 'object',
        description: 'Step outputs to validate'
      },
      iteration: {
        type: 'number',
        description: 'Current iteration number (default: 1)'
      },
      max_iterations: {
        type: 'number',
        description: 'Maximum retry iterations (default: 3)'
      },
      on_fail: {
        type: 'string',
        enum: ['retry', 'block', 'warn'],
        description: 'Action on gate failure (default: retry)'
      }
    },
    required: ['action']
  }
};

// =============================================================================
// Input/Output Types
// =============================================================================

export interface WorkflowToolInput {
  action: 'list_workflows' | 'list_teams' | 'start_workflow' | 'start_team' | 'validate_handoff' | 'find_team' | 'create_team' | 'create_workflow' | 'check_skills' | 'list_active' | 'resume' | 'check_gate';
  workflow_id?: string;
  team_id?: string;
  trigger?: string;
  from_skill?: string;
  to_skill?: string;
  data?: Record<string, unknown>;
  initial_state?: Record<string, unknown>;
  // For create_team
  name?: string;
  skills?: string[];
  lead?: string;
  communication?: CommunicationPattern;
  // For create_workflow
  description?: string;
  // For resume
  state_id?: string;
  // For check_gate
  validator?: string;
  criteria?: string[];
  outputs?: Record<string, unknown>;
  iteration?: number;
  max_iterations?: number;
  on_fail?: 'retry' | 'block' | 'warn';
}

export interface WorkflowToolOutput {
  success: boolean;
  action: string;
  result?: unknown;
  events?: string[];
  message?: string;
  error?: string;
}

// =============================================================================
// Executor
// =============================================================================

export async function executeWorkflow(
  env: Env,
  input: WorkflowToolInput
): Promise<WorkflowToolOutput> {
  const events: string[] = [];

  try {
    switch (input.action) {
      case 'list_workflows': {
        const workflows = listBuiltinWorkflows();
        return {
          success: true,
          action: input.action,
          result: {
            count: workflows.length,
            workflows: workflows.map(w => ({
              id: w.id,
              name: w.name,
              description: w.description
            }))
          },
          message: formatWorkflowList(workflows)
        };
      }

      case 'list_teams': {
        const teams = listTeams();
        return {
          success: true,
          action: input.action,
          result: {
            count: teams.length,
            teams
          },
          message: formatTeamList(teams)
        };
      }

      case 'start_workflow': {
        if (!input.workflow_id) {
          return {
            success: false,
            action: input.action,
            error: 'workflow_id is required'
          };
        }

        const workflow = getBuiltinWorkflow(input.workflow_id);
        if (!workflow) {
          return {
            success: false,
            action: input.action,
            error: `Workflow not found: ${input.workflow_id}`
          };
        }

        const engine = new WorkflowEngine(env);
        const state = await engine.start(workflow, input.initial_state);

        // Save state for resume capability
        const stateId = await saveWorkflowState(
          env,
          workflow.name,
          state,
          workflow.steps.length
        );

        events.push(emitWorkflowStart(workflow, state));

        return {
          success: true,
          action: input.action,
          result: {
            workflow_id: workflow.id,
            state_id: stateId,
            state,
            next_step: workflow.steps[0]
          },
          events,
          message: `## Starting Workflow: ${workflow.name}

**State ID:** \`${stateId}\` (use this to resume later)

${workflow.description || ''}

### Steps
${workflow.steps.map((s, i) => `${i + 1}. **${s.skill}**`).join('\n')}

---

**First step:** Load the \`${workflow.steps[0]?.skill || 'unknown'}\` skill and begin work.`
        };
      }

      case 'start_team': {
        if (!input.team_id) {
          return {
            success: false,
            action: input.action,
            error: 'team_id is required'
          };
        }

        const team = getTeam(input.team_id);
        if (!team) {
          return {
            success: false,
            action: input.action,
            error: `Team not found: ${input.team_id}`
          };
        }

        const activeTeam = await activateTeam(env, input.team_id, input.initial_state);
        if (!activeTeam) {
          return {
            success: false,
            action: input.action,
            error: `Failed to activate team: ${input.team_id}`
          };
        }

        // Save team state for resume
        const teamStateId = await saveTeamState(env, activeTeam);

        events.push(emitTeamActivate(team));

        const workflow = teamToWorkflow(team);

        return {
          success: true,
          action: input.action,
          result: {
            team,
            team_state_id: teamStateId,
            workflow,
            active: activeTeam
          },
          events,
          message: formatTeam(team) + `

**State ID:** \`${teamStateId}\` (use this to resume later)

---

**Team activated!** Start with the lead skill: \`${team.lead}\``
        };
      }

      case 'validate_handoff': {
        if (!input.from_skill || !input.to_skill) {
          return {
            success: false,
            action: input.action,
            error: 'from_skill and to_skill are required'
          };
        }

        const { package: handoff, validation } = await createHandoffPackage(
          env,
          input.from_skill,
          input.to_skill,
          input.data || {},
          'Handoff validation'
        );

        events.push(emitContractCheck(validation));

        return {
          success: validation.valid,
          action: input.action,
          result: {
            handoff,
            validation
          },
          events,
          message: formatContractValidation(validation)
        };
      }

      case 'find_team': {
        if (!input.trigger) {
          return {
            success: false,
            action: input.action,
            error: 'trigger phrase is required'
          };
        }

        const team = findTeamByTrigger(input.trigger);
        if (!team) {
          // List teams that might be relevant
          const allTeams = listTeams();
          return {
            success: false,
            action: input.action,
            message: `No team found for "${input.trigger}".

**Available teams:**
${allTeams.map(t => `- **${t.id}**: ${t.description}`).join('\n')}`
          };
        }

        return {
          success: true,
          action: input.action,
          result: team,
          message: formatTeam(team)
        };
      }

      case 'create_team': {
        if (!input.name || !input.skills || input.skills.length === 0) {
          return {
            success: false,
            action: input.action,
            error: 'name and skills array are required'
          };
        }

        // Validate skills exist
        const skillChecks = await checkSkillsExist(env, input.skills);
        if (skillChecks.missing.length > 0) {
          return {
            success: false,
            action: input.action,
            error: `Missing skills: ${skillChecks.missing.join(', ')}`,
            result: {
              available: skillChecks.available,
              missing: skillChecks.missing
            },
            message: `## Cannot Create Team

**Missing skills:** ${skillChecks.missing.join(', ')}

These skills need to be installed or created first.
Use \`spawner_skills({ action: "search", query: "..." })\` to find alternatives.`
          };
        }

        // Create dynamic team
        const dynamicTeam: SkillTeam = {
          id: `custom-${Date.now()}`,
          name: input.name,
          description: `Custom team: ${input.skills.join(' + ')}`,
          skills: input.skills,
          lead: input.lead || input.skills[0],
          communication: input.communication || 'hub-spoke',
          workflow_mode: 'sequential',
          triggers: [],
          use_cases: ['Custom workflow']
        };

        // Get sharp edges for all skills
        const sharpEdges = await getSharpEdgesForTeam(env, input.skills);

        events.push(emitTeamActivate(dynamicTeam));

        return {
          success: true,
          action: input.action,
          result: {
            team: dynamicTeam,
            skill_details: skillChecks.details,
            sharp_edges: sharpEdges
          },
          events,
          message: `## Custom Team Created: ${input.name}

**Skills:** ${input.skills.join(', ')}
**Lead:** ${dynamicTeam.lead}
**Communication:** ${dynamicTeam.communication}

${sharpEdges.length > 0 ? `### Sharp Edges to Watch
${sharpEdges.map(e => `- [${e.severity}] **${e.skill}**: ${e.title}`).join('\n')}` : ''}

---

**Team ready!** Start with: \`${dynamicTeam.lead}\``
        };
      }

      case 'create_workflow': {
        if (!input.description) {
          return {
            success: false,
            action: input.action,
            error: 'description is required'
          };
        }

        // Parse natural language into workflow
        const parsed = parseNaturalLanguageWorkflow(input.description);

        // Validate skills exist
        const skillChecks = await checkSkillsExist(env, parsed.skills);

        return {
          success: true,
          action: input.action,
          result: {
            parsed,
            workflow: parsed.workflow,
            skills_available: skillChecks.available,
            skills_missing: skillChecks.missing
          },
          message: `## Parsed Workflow

**Description:** ${input.description}

**Detected Pattern:** ${parsed.pattern}

### Steps
${parsed.workflow.steps.map((s, i) => `${i + 1}. **${s.skill}**${(s as WorkflowStep & { parallel?: boolean }).parallel ? ' (parallel)' : ''}`).join('\n')}

${skillChecks.missing.length > 0 ? `### Missing Skills
${skillChecks.missing.map(s => `- ${s}`).join('\n')}` : '**All skills available!**'}

---

${skillChecks.missing.length === 0 ? `To start: \`spawner_workflow({ action: "start_workflow", workflow_id: "${parsed.workflow.id}" })\`` : 'Install missing skills first.'}`
        };
      }

      case 'check_skills': {
        if (!input.skills || input.skills.length === 0) {
          return {
            success: false,
            action: input.action,
            error: 'skills array is required'
          };
        }

        const skillChecks = await checkSkillsExist(env, input.skills);
        const sharpEdges = skillChecks.available.length > 0
          ? await getSharpEdgesForTeam(env, skillChecks.available)
          : [];

        return {
          success: skillChecks.missing.length === 0,
          action: input.action,
          result: {
            requested: input.skills,
            available: skillChecks.available,
            missing: skillChecks.missing,
            details: skillChecks.details,
            sharp_edges: sharpEdges
          },
          message: `## Skill Availability Check

**Requested:** ${input.skills.join(', ')}

### Available (${skillChecks.available.length}/${input.skills.length})
${skillChecks.available.map(s => `- ${s}`).join('\n') || 'None'}

${skillChecks.missing.length > 0 ? `### Missing
${skillChecks.missing.map(s => `- ${s}`).join('\n')}` : ''}

${sharpEdges.length > 0 ? `### Sharp Edges
${sharpEdges.slice(0, 5).map(e => `- [${e.severity}] **${e.skill}**: ${e.title}`).join('\n')}` : ''}`
        };
      }

      case 'list_active': {
        const activeWorkflows = await listActiveWorkflows(env);

        return {
          success: true,
          action: input.action,
          result: {
            count: activeWorkflows.length,
            workflows: activeWorkflows
          },
          message: formatPersistedWorkflowList(activeWorkflows)
        };
      }

      case 'resume': {
        if (!input.state_id) {
          return {
            success: false,
            action: input.action,
            error: 'state_id is required'
          };
        }

        const savedState = await loadWorkflowState(env, input.state_id);
        if (!savedState) {
          return {
            success: false,
            action: input.action,
            error: `Workflow state not found: ${input.state_id}`
          };
        }

        // Get the workflow definition
        const workflow = getBuiltinWorkflow(savedState.workflow_id);
        const currentStep = workflow?.steps[savedState.current_step];

        return {
          success: true,
          action: input.action,
          result: {
            state: savedState,
            workflow_id: savedState.workflow_id,
            current_step: savedState.current_step,
            next_skill: currentStep?.skill
          },
          message: `## Resuming Workflow: ${savedState.workflow_name}

**State ID:** \`${savedState.id}\`
**Status:** ${savedState.status}
**Progress:** Step ${savedState.current_step + 1}/${savedState.total_steps}

### Completed Steps
${savedState.history.map((h, i) => `${i + 1}. **${h.skill}** - ${h.status} (${h.duration_ms}ms)`).join('\n') || 'None yet'}

---

**Next step:** Load the \`${currentStep?.skill || 'unknown'}\` skill and continue work.`
        };
      }

      case 'check_gate': {
        if (!input.validator) {
          return {
            success: false,
            action: input.action,
            error: 'validator skill ID is required'
          };
        }

        if (!input.criteria || input.criteria.length === 0) {
          return {
            success: false,
            action: input.action,
            error: 'criteria array is required'
          };
        }

        const outputs = input.outputs || {};

        // Create a workflow engine to run the quality gate
        const engine = new WorkflowEngine(env);

        // Create a synthetic step with the quality gate config
        const syntheticStep: WorkflowStep = {
          skill: 'manual-check',
          quality_gate: {
            validator: input.validator,
            criteria: input.criteria,
            max_iterations: input.max_iterations ?? 3,
            on_fail: input.on_fail ?? 'retry'
          }
        };

        // Run the quality gate check
        const gateResult = await engine.checkQualityGate(
          syntheticStep,
          outputs,
          input.iteration ?? 1
        );

        return {
          success: gateResult.passed,
          action: input.action,
          result: {
            passed: gateResult.passed,
            validator: gateResult.validator_skill,
            criteria_checked: gateResult.criteria_checked,
            validation_errors: gateResult.validation_errors,
            iteration: gateResult.iteration,
            max_iterations: gateResult.max_iterations,
            action: gateResult.action
          },
          message: gateResult.feedback,
          events: engine.getEvents().map(e => JSON.stringify(e))
        };
      }

      default:
        return {
          success: false,
          action: input.action,
          error: `Unknown action: ${input.action}`
        };
    }
  } catch (error) {
    return {
      success: false,
      action: input.action,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Check if skills exist and are available
 */
async function checkSkillsExist(
  env: Env,
  skillIds: string[]
): Promise<{
  available: string[];
  missing: string[];
  details: Record<string, { name: string; version: string } | null>;
}> {
  const available: string[] = [];
  const missing: string[] = [];
  const details: Record<string, { name: string; version: string } | null> = {};

  for (const skillId of skillIds) {
    const skill = await loadSkill(env, skillId);
    if (skill) {
      available.push(skillId);
      details[skillId] = { name: skill.name, version: skill.version };
    } else {
      missing.push(skillId);
      details[skillId] = null;
    }
  }

  return { available, missing, details };
}

/**
 * Get sharp edges for all skills in a team
 */
async function getSharpEdgesForTeam(
  env: Env,
  skillIds: string[]
): Promise<Array<{
  skill: string;
  id: string;
  title: string;
  severity: 'critical' | 'warning' | 'info';
  situation: string;
}>> {
  const allEdges: Array<{
    skill: string;
    id: string;
    title: string;
    severity: 'critical' | 'warning' | 'info';
    situation: string;
  }> = [];

  for (const skillId of skillIds) {
    try {
      const edges = await getSharpEdgesForSkill(env, skillId);
      for (const edge of edges) {
        allEdges.push({
          skill: skillId,
          id: edge.id,
          title: edge.title,
          severity: edge.severity,
          situation: edge.situation || ''
        });
      }
    } catch {
      // Skip if can't load edges
    }
  }

  // Sort by severity (critical first)
  const severityOrder = { critical: 0, warning: 1, info: 2 };
  allEdges.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return allEdges;
}

/**
 * Parse natural language workflow description into a structured workflow
 */
interface ParsedWorkflow {
  pattern: 'sequential' | 'parallel' | 'conditional' | 'supervised';
  skills: string[];
  workflow: WorkflowDefinition & { steps: Array<WorkflowStep & { parallel?: boolean }> };
}

function parseNaturalLanguageWorkflow(description: string): ParsedWorkflow {
  const desc = description.toLowerCase();

  // Detect pattern from keywords
  let pattern: ParsedWorkflow['pattern'] = 'sequential';
  if (desc.includes('parallel') || desc.includes('at the same time') || desc.includes('simultaneously')) {
    pattern = 'parallel';
  } else if (desc.includes('if ') || desc.includes('when ') || desc.includes('depending on')) {
    pattern = 'conditional';
  } else if (desc.includes('review') || desc.includes('validate') || desc.includes('audit') || desc.includes('check')) {
    pattern = 'supervised';
  }

  // Extract skills from common phrases
  const skillMappings: Record<string, string> = {
    'design': 'system-designer',
    'api': 'backend',
    'backend': 'backend',
    'frontend': 'frontend',
    'ui': 'frontend',
    'database': 'postgres-wizard',
    'deploy': 'devops',
    'deployment': 'devops',
    'test': 'testing',
    'testing': 'testing',
    'security': 'security-owasp',
    'game': 'prompt-to-game',
    'art': 'ai-game-art-generation',
    'assets': 'ai-game-art-generation',
    'auth': 'auth-specialist',
    'authentication': 'auth-specialist',
    'ai': 'llm-architect',
    'llm': 'llm-architect',
    'marketing': 'copywriting',
    'copy': 'copywriting',
    'seo': 'seo',
  };

  const detectedSkills: string[] = [];
  const parallelGroups: Set<string> = new Set();

  // Parse structure words
  const parts = desc.split(/,|then|and|after|finally|next/i);

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    // Check if this is a parallel group
    const isParallel = trimmed.includes('parallel') ||
                       trimmed.includes('same time') ||
                       trimmed.includes('simultaneously');

    for (const [keyword, skillId] of Object.entries(skillMappings)) {
      if (trimmed.includes(keyword) && !detectedSkills.includes(skillId)) {
        detectedSkills.push(skillId);
        if (isParallel) {
          parallelGroups.add(skillId);
        }
      }
    }
  }

  // If no skills detected, add some defaults based on pattern
  if (detectedSkills.length === 0) {
    detectedSkills.push('system-designer', 'backend', 'frontend');
  }

  // Build workflow
  const workflow: ParsedWorkflow['workflow'] = {
    id: `nl-workflow-${Date.now()}`,
    name: 'Natural Language Workflow',
    description: description,
    mode: pattern,
    steps: detectedSkills.map(skill => ({
      skill,
      parallel: parallelGroups.has(skill)
    }))
  };

  return {
    pattern,
    skills: detectedSkills,
    workflow
  };
}

// =============================================================================
// Formatters
// =============================================================================

function formatWorkflowList(workflows: { id: string; name: string; description?: string }[]): string {
  const lines: string[] = ['## Available Workflows', ''];

  for (const w of workflows) {
    lines.push(`### ${w.name} (\`${w.id}\`)`);
    if (w.description) {
      lines.push(w.description);
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('Use `spawner_workflow({ action: "start_workflow", workflow_id: "<id>" })` to begin.');

  return lines.join('\n');
}

function formatTeamList(teams: { id: string; name: string; description: string; skills: string[] }[]): string {
  const lines: string[] = ['## Available Teams', ''];

  for (const t of teams) {
    lines.push(`### ${t.name} (\`${t.id}\`)`);
    lines.push(t.description);
    lines.push(`**Skills:** ${t.skills.join(', ')}`);
    lines.push('');
  }

  lines.push('---');
  lines.push('Use `spawner_workflow({ action: "start_team", team_id: "<id>" })` to activate a team.');

  return lines.join('\n');
}

// =============================================================================
// Register Tool
// =============================================================================

export const workflowTool: RegisteredTool<WorkflowToolInput, WorkflowToolOutput> = {
  definition: workflowToolDefinition,
  execute: async (env, args, _userId) => executeWorkflow(env, args)
};
