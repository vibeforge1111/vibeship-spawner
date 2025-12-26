/**
 * Spawner Hook Types
 *
 * Type definitions for agent events and notification state
 */
export type EventType = 'agent:spawn' | 'agent:progress' | 'agent:waiting' | 'agent:handoff' | 'agent:complete' | 'agent:error';
export interface SpawnerEvent {
    type: EventType;
    timestamp: number;
    data: SpawnData | ProgressData | WaitingData | HandoffData | CompleteData | ErrorData;
}
export interface SpawnData {
    id: string;
    name: string;
    icon: string;
    skills: string[];
    task: string;
}
export interface ProgressData {
    id: string;
    message: string;
    percent: number;
    completed: string[];
}
export interface WaitingData {
    id: string;
    waiting_for: string;
    reason: string;
}
export interface HandoffData {
    from: string;
    to: string;
    payload: string;
    description: string;
}
export interface CompleteData {
    id: string;
    result: string;
    duration: number;
    tasks_completed: number;
}
export interface ErrorData {
    id: string;
    error: string;
    severity: 'warning' | 'blocking';
}
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
export interface NotificationState {
    activeAgents: Map<string, AgentState>;
    completedAgents: Map<string, AgentState>;
    handoffs: HandoffData[];
    startTime: number;
    totalTasks: number;
}
export interface HookInput {
    tool_name: string;
    tool_input: Record<string, unknown>;
    tool_use_id?: string;
    tool_response?: Record<string, unknown>;
}
export declare function isSpawnData(data: unknown): data is SpawnData;
export declare function isProgressData(data: unknown): data is ProgressData;
export declare function isWaitingData(data: unknown): data is WaitingData;
export declare function isHandoffData(data: unknown): data is HandoffData;
export declare function isCompleteData(data: unknown): data is CompleteData;
export declare function isErrorData(data: unknown): data is ErrorData;
