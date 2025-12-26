/**
 * Spawner Hook Types
 *
 * Type definitions for agent events and notification state
 */

// Event types that agents emit
export type EventType =
  | 'agent:spawn'
  | 'agent:progress'
  | 'agent:waiting'
  | 'agent:handoff'
  | 'agent:complete'
  | 'agent:error';

// Main event wrapper
export interface SpawnerEvent {
  type: EventType;
  timestamp: number;
  data: SpawnData | ProgressData | WaitingData | HandoffData | CompleteData | ErrorData;
}

// Agent spawn event data
export interface SpawnData {
  id: string;
  name: string;
  icon: string;
  skills: string[];
  task: string;
}

// Progress update data
export interface ProgressData {
  id: string;
  message: string;
  percent: number;
  completed: string[];
}

// Waiting/blocked data
export interface WaitingData {
  id: string;
  waiting_for: string;
  reason: string;
}

// Handoff between agents
export interface HandoffData {
  from: string;
  to: string;
  payload: string;
  description: string;
}

// Task completion data
export interface CompleteData {
  id: string;
  result: string;
  duration: number;
  tasks_completed: number;
}

// Error data
export interface ErrorData {
  id: string;
  error: string;
  severity: 'warning' | 'blocking';
}

// Agent state tracking
export type AgentStatus = 'active' | 'waiting' | 'complete' | 'error';

export interface AgentState {
  id: string;
  name: string;
  icon: string;
  skills: string[];
  task: string;
  status: AgentStatus;
  progress: number;
  completed: string[];
  current: string;
  startTime: number;
  duration: number;
  handoffsIn: string[];
  handoffsOut: string[];
  waitingFor?: string;
  waitingReason?: string;
  error?: string;
}

// Overall notification state
export interface NotificationState {
  activeAgents: Map<string, AgentState>;
  completedAgents: Map<string, AgentState>;
  handoffs: HandoffData[];
  startTime: number;
  totalTasks: number;
}

// Hook input from Claude Code
export interface HookInput {
  tool_name: string;
  tool_input: Record<string, unknown>;
  tool_use_id?: string;
  tool_response?: Record<string, unknown>;
}

// Type guards
export function isSpawnData(data: unknown): data is SpawnData {
  return typeof data === 'object' && data !== null && 'name' in data && 'task' in data;
}

export function isProgressData(data: unknown): data is ProgressData {
  return typeof data === 'object' && data !== null && 'percent' in data && 'message' in data;
}

export function isWaitingData(data: unknown): data is WaitingData {
  return typeof data === 'object' && data !== null && 'waiting_for' in data;
}

export function isHandoffData(data: unknown): data is HandoffData {
  return typeof data === 'object' && data !== null && 'from' in data && 'to' in data;
}

export function isCompleteData(data: unknown): data is CompleteData {
  return typeof data === 'object' && data !== null && 'result' in data && 'duration' in data;
}

export function isErrorData(data: unknown): data is ErrorData {
  return typeof data === 'object' && data !== null && 'error' in data && 'severity' in data;
}
