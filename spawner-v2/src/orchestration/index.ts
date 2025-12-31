/**
 * Orchestration Layer
 *
 * Entry point detection and routing for Spawner.
 * Determines context and routes to: resume, analyze, or brainstorm.
 *
 * Multi-Agent Orchestration (new):
 * - Workflows: Sequential/parallel/supervised execution patterns
 * - Teams: Pre-configured skill groups that work together
 * - Contracts: Runtime enforcement of collaboration requirements
 * - Events: Observable notifications for all orchestration activities
 */

export * from './types.js';
export * from './detector.js';
export { orchestrate, type OrchestrateInput } from './orchestrator.js';

// Workflow Engine
export {
  WorkflowEngine,
  BUILTIN_WORKFLOWS,
  getBuiltinWorkflow,
  listBuiltinWorkflows,
  createSequentialWorkflow,
  formatWorkflowState,
  type WorkflowStep,
  type QualityGate,
  type WorkflowDefinition,
  type WorkflowState,
  type StepResult,
  type WorkflowEvent,
  type QualityGateResult
} from './workflow.js';

// Team System
export {
  BUILTIN_TEAMS,
  getTeam,
  findTeamByTrigger,
  listTeams,
  activateTeam,
  teamToWorkflow,
  logCommunication,
  getNextInPipeline,
  getBroadcastTargets,
  formatTeam,
  formatActiveTeam,
  type SkillTeam,
  type CommunicationPattern,
  type TeamMember,
  type ActiveTeam,
  type CommunicationEntry
} from './teams.js';

// State Contracts
export {
  extractContract,
  validateContract,
  createHandoffPackage,
  formatContractValidation,
  createContractEvent,
  validators,
  type ContractRequirement,
  type StateContract,
  type ContractValidation,
  type HandoffPackage
} from './contracts.js';

// Orchestration Events
export {
  formatEvent,
  parseEvents,
  emitWorkflowStart,
  emitWorkflowStep,
  emitWorkflowComplete,
  emitWorkflowError,
  emitWorkflowGate,
  emitTeamActivate,
  emitTeamDelegate,
  emitTeamComplete,
  emitContractCheck,
  formatEventForTerminal,
  summarizeEvents,
  type OrchestrationEventType,
  type OrchestrationEvent
} from './events.js';

// State Persistence
export {
  saveWorkflowState,
  loadWorkflowState,
  listActiveWorkflows,
  updateWorkflowStatus,
  saveTeamState,
  loadTeamState,
  listActiveTeams,
  formatPersistedWorkflow,
  formatWorkflowList as formatPersistedWorkflowList,
  type PersistedWorkflowState,
  type PersistedTeamState
} from './persistence.js';
