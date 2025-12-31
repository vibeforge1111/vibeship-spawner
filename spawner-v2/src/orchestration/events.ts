/**
 * Orchestration Events
 *
 * Extended event system for workflow, team, and contract events.
 * These events are parsed by the notification hook to show real-time
 * status to users.
 *
 * Event Types:
 * - workflow:start    - Workflow begins
 * - workflow:step     - A step is executing
 * - workflow:complete - Workflow finished
 * - workflow:error    - Workflow failed
 * - workflow:gate     - Quality gate check
 * - team:activate     - Team activated
 * - team:delegate     - Lead delegates to member
 * - team:complete     - Team finished work
 * - contract:check    - Contract validation
 * - contract:fail     - Contract not satisfied
 */

import type { WorkflowState, StepResult, WorkflowDefinition } from './workflow.js';
import type { SkillTeam, ActiveTeam, CommunicationEntry } from './teams.js';
import type { ContractValidation } from './contracts.js';

// =============================================================================
// Event Types
// =============================================================================

export type OrchestrationEventType =
  | 'workflow:start'
  | 'workflow:step'
  | 'workflow:complete'
  | 'workflow:error'
  | 'workflow:gate'
  | 'team:activate'
  | 'team:delegate'
  | 'team:complete'
  | 'contract:check'
  | 'contract:fail';

export interface OrchestrationEvent {
  type: OrchestrationEventType;
  timestamp: number;
  data: Record<string, unknown>;
}

// =============================================================================
// Event Marker Format
// =============================================================================

const EVENT_PREFIX = '[SPAWNER_EVENT]';
const EVENT_SUFFIX = '[/SPAWNER_EVENT]';

/**
 * Format an event as a marker string for hook parsing
 */
export function formatEvent(event: OrchestrationEvent): string {
  return `${EVENT_PREFIX}${JSON.stringify(event)}${EVENT_SUFFIX}`;
}

/**
 * Parse event markers from text
 */
export function parseEvents(text: string): OrchestrationEvent[] {
  const events: OrchestrationEvent[] = [];
  const regex = /\[SPAWNER_EVENT\](.*?)\[\/SPAWNER_EVENT\]/g;

  let match;
  while ((match = regex.exec(text)) !== null) {
    try {
      const eventJson = match[1];
      if (eventJson) {
        events.push(JSON.parse(eventJson));
      }
    } catch {
      // Skip malformed events
    }
  }

  return events;
}

// =============================================================================
// Workflow Events
// =============================================================================

export function emitWorkflowStart(
  workflow: WorkflowDefinition,
  state: WorkflowState
): string {
  const event: OrchestrationEvent = {
    type: 'workflow:start',
    timestamp: Date.now(),
    data: {
      workflow_id: workflow.id,
      name: workflow.name,
      mode: workflow.mode,
      total_steps: workflow.steps.length,
      skills: workflow.steps.map(s => s.skill)
    }
  };
  return formatEvent(event);
}

export function emitWorkflowStep(
  workflow: WorkflowDefinition,
  stepIndex: number,
  skillId: string,
  skillName: string
): string {
  const total = workflow.steps.length;
  const percent = Math.round(((stepIndex + 1) / total) * 100);

  const event: OrchestrationEvent = {
    type: 'workflow:step',
    timestamp: Date.now(),
    data: {
      workflow_id: workflow.id,
      step: stepIndex + 1,
      total,
      percent,
      skill: skillId,
      skill_name: skillName
    }
  };
  return formatEvent(event);
}

export function emitWorkflowComplete(
  workflow: WorkflowDefinition,
  state: WorkflowState
): string {
  const duration = Date.now() - state.started_at;

  const event: OrchestrationEvent = {
    type: 'workflow:complete',
    timestamp: Date.now(),
    data: {
      workflow_id: workflow.id,
      name: workflow.name,
      duration_ms: duration,
      steps_completed: state.history.length,
      status: state.status
    }
  };
  return formatEvent(event);
}

export function emitWorkflowError(
  workflow: WorkflowDefinition,
  state: WorkflowState,
  error: string
): string {
  const event: OrchestrationEvent = {
    type: 'workflow:error',
    timestamp: Date.now(),
    data: {
      workflow_id: workflow.id,
      step: state.current_step,
      error,
      last_skill: state.history[state.history.length - 1]?.skill || 'unknown'
    }
  };
  return formatEvent(event);
}

export function emitWorkflowGate(
  workflow: WorkflowDefinition,
  stepIndex: number,
  validatorSkill: string,
  passed: boolean,
  feedback?: string
): string {
  const event: OrchestrationEvent = {
    type: 'workflow:gate',
    timestamp: Date.now(),
    data: {
      workflow_id: workflow.id,
      step: stepIndex,
      validator: validatorSkill,
      passed,
      feedback
    }
  };
  return formatEvent(event);
}

// =============================================================================
// Team Events
// =============================================================================

export function emitTeamActivate(team: SkillTeam): string {
  const event: OrchestrationEvent = {
    type: 'team:activate',
    timestamp: Date.now(),
    data: {
      team_id: team.id,
      name: team.name,
      lead: team.lead,
      members: team.skills,
      communication: team.communication,
      workflow: team.workflow_mode
    }
  };
  return formatEvent(event);
}

export function emitTeamDelegate(
  team: SkillTeam,
  from: string,
  to: string,
  task: string
): string {
  const event: OrchestrationEvent = {
    type: 'team:delegate',
    timestamp: Date.now(),
    data: {
      team_id: team.id,
      from,
      to,
      task
    }
  };
  return formatEvent(event);
}

export function emitTeamComplete(activeTeam: ActiveTeam): string {
  const duration = Date.now() - activeTeam.started_at;

  const event: OrchestrationEvent = {
    type: 'team:complete',
    timestamp: Date.now(),
    data: {
      team_id: activeTeam.team.id,
      name: activeTeam.team.name,
      duration_ms: duration,
      communication_count: activeTeam.communication_log.length
    }
  };
  return formatEvent(event);
}

// =============================================================================
// Contract Events
// =============================================================================

export function emitContractCheck(validation: ContractValidation): string {
  const event: OrchestrationEvent = {
    type: validation.valid ? 'contract:check' : 'contract:fail',
    timestamp: Date.now(),
    data: {
      skill: validation.skill_id,
      from_skill: validation.from_skill || 'direct',
      valid: validation.valid,
      missing: validation.missing,
      warnings: validation.warnings,
      received_count: Object.keys(validation.data_received).length
    }
  };
  return formatEvent(event);
}

// =============================================================================
// Human-Readable Formatters (for CLI display)
// =============================================================================

/**
 * Format event for terminal display with colors (ANSI)
 */
export function formatEventForTerminal(event: OrchestrationEvent): string {
  const reset = '\x1b[0m';
  const bold = '\x1b[1m';
  const dim = '\x1b[2m';
  const green = '\x1b[32m';
  const yellow = '\x1b[33m';
  const red = '\x1b[31m';
  const blue = '\x1b[34m';
  const cyan = '\x1b[36m';

  switch (event.type) {
    case 'workflow:start':
      return `${cyan}${bold}WORKFLOW${reset} ${event.data.name} started (${event.data.total_steps} steps)`;

    case 'workflow:step':
      const bar = progressBar(event.data.percent as number);
      return `${blue}STEP${reset} ${event.data.step}/${event.data.total} ${bar} ${event.data.skill_name}`;

    case 'workflow:complete':
      const durationSec = ((event.data.duration_ms as number) / 1000).toFixed(1);
      return `${green}${bold}COMPLETE${reset} ${event.data.name} (${durationSec}s)`;

    case 'workflow:error':
      return `${red}${bold}ERROR${reset} ${event.data.error} (step ${event.data.step})`;

    case 'workflow:gate':
      const icon = event.data.passed ? `${green}PASS${reset}` : `${yellow}FAIL${reset}`;
      return `${dim}GATE${reset} ${icon} Validator: ${event.data.validator}`;

    case 'team:activate':
      return `${cyan}${bold}TEAM${reset} ${event.data.name} activated (${(event.data.members as string[]).length} members)`;

    case 'team:delegate':
      return `${blue}DELEGATE${reset} ${event.data.from} -> ${event.data.to}: ${event.data.task}`;

    case 'team:complete':
      return `${green}${bold}TEAM DONE${reset} ${event.data.name}`;

    case 'contract:check':
      return `${green}CONTRACT${reset} ${event.data.skill} received ${event.data.received_count} items`;

    case 'contract:fail':
      return `${yellow}${bold}CONTRACT${reset} ${event.data.skill} missing: ${(event.data.missing as string[]).join(', ')}`;

    default:
      return `${dim}EVENT${reset} ${event.type}`;
  }
}

function progressBar(percent: number): string {
  const width = 20;
  const filled = Math.round((percent / 100) * width);
  const empty = width - filled;
  return `[${'='.repeat(filled)}${' '.repeat(empty)}] ${percent}%`;
}

/**
 * Aggregate events into summary for session end
 */
export function summarizeEvents(events: OrchestrationEvent[]): string {
  const lines: string[] = [];

  const workflows = events.filter(e => e.type === 'workflow:complete');
  const teams = events.filter(e => e.type === 'team:complete');
  const errors = events.filter(e => e.type === 'workflow:error');
  const contractFails = events.filter(e => e.type === 'contract:fail');

  if (workflows.length > 0) {
    lines.push(`**Workflows completed:** ${workflows.length}`);
  }

  if (teams.length > 0) {
    lines.push(`**Teams completed:** ${teams.length}`);
  }

  if (errors.length > 0) {
    lines.push(`**Errors:** ${errors.length}`);
  }

  if (contractFails.length > 0) {
    lines.push(`**Contract issues:** ${contractFails.length}`);
  }

  return lines.length > 0 ? lines.join('\n') : 'No orchestration events';
}
