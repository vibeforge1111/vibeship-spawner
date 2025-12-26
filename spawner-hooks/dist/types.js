/**
 * Spawner Hook Types
 *
 * Type definitions for agent events and notification state
 */
// Type guards
export function isSpawnData(data) {
    return typeof data === 'object' && data !== null && 'name' in data && 'task' in data;
}
export function isProgressData(data) {
    return typeof data === 'object' && data !== null && 'percent' in data && 'message' in data;
}
export function isWaitingData(data) {
    return typeof data === 'object' && data !== null && 'waiting_for' in data;
}
export function isHandoffData(data) {
    return typeof data === 'object' && data !== null && 'from' in data && 'to' in data;
}
export function isCompleteData(data) {
    return typeof data === 'object' && data !== null && 'result' in data && 'duration' in data;
}
export function isErrorData(data) {
    return typeof data === 'object' && data !== null && 'error' in data && 'severity' in data;
}
