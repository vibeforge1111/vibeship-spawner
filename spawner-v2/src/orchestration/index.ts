/**
 * Orchestration Layer
 *
 * Entry point detection and routing for Spawner.
 * Determines context and routes to: resume, analyze, or brainstorm.
 */

export * from './types.js';
export * from './detector.js';
export { orchestrate, type OrchestrateInput } from './orchestrator.js';
