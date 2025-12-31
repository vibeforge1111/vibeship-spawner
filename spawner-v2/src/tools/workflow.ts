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
  type WorkflowDefinition
} from '../orchestration/workflow.js';
import {
  BUILTIN_TEAMS,
  getTeam,
  findTeamByTrigger,
  listTeams,
  activateTeam,
  teamToWorkflow,
  formatTeam,
  formatActiveTeam
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

Example usage:
- spawner_workflow({ action: "list_teams" })
- spawner_workflow({ action: "start_team", team_id: "game-jam" })
- spawner_workflow({ action: "validate_handoff", from_skill: "backend", to_skill: "frontend", data: {...} })`,
  inputSchema: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        enum: ['list_workflows', 'list_teams', 'start_workflow', 'start_team', 'validate_handoff', 'find_team'],
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
      }
    },
    required: ['action']
  }
};

// =============================================================================
// Input/Output Types
// =============================================================================

export interface WorkflowToolInput {
  action: 'list_workflows' | 'list_teams' | 'start_workflow' | 'start_team' | 'validate_handoff' | 'find_team';
  workflow_id?: string;
  team_id?: string;
  trigger?: string;
  from_skill?: string;
  to_skill?: string;
  data?: Record<string, unknown>;
  initial_state?: Record<string, unknown>;
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

        events.push(emitWorkflowStart(workflow, state));

        return {
          success: true,
          action: input.action,
          result: {
            workflow_id: workflow.id,
            state,
            next_step: workflow.steps[0]
          },
          events,
          message: `## Starting Workflow: ${workflow.name}

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

        events.push(emitTeamActivate(team));

        const workflow = teamToWorkflow(team);

        return {
          success: true,
          action: input.action,
          result: {
            team,
            workflow,
            active: activeTeam
          },
          events,
          message: formatTeam(team) + `

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
