/**
 * Tool Registry
 *
 * Type-safe registry pattern for MCP tools.
 * Eliminates switch statement by mapping tool names to executors.
 */

import type { Env } from '../types.js';

// =============================================================================
// Tool Definition Interface
// =============================================================================

export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

// =============================================================================
// Registered Tool Interface
// =============================================================================

/**
 * A registered tool combines its definition with its executor.
 * The executor receives the raw arguments and returns any result.
 */
export interface RegisteredTool<TInput = Record<string, unknown>, TOutput = unknown> {
  definition: ToolDefinition;
  execute: (env: Env, args: TInput, userId: string) => Promise<TOutput>;
}

// =============================================================================
// Tool Registry
// =============================================================================

/**
 * Registry of all tools indexed by name.
 * Adding a tool to this registry automatically makes it available via MCP.
 */
export const toolRegistry = new Map<string, RegisteredTool>();

/**
 * Register a tool in the registry
 */
export function registerTool<TInput, TOutput>(tool: RegisteredTool<TInput, TOutput>): void {
  toolRegistry.set(tool.definition.name, tool as RegisteredTool);
}

/**
 * Get all tool definitions for tools/list
 */
export function getToolDefinitions(): ToolDefinition[] {
  return Array.from(toolRegistry.values()).map(t => t.definition);
}

/**
 * Execute a tool by name
 */
export async function executeTool(
  name: string,
  env: Env,
  args: Record<string, unknown>,
  userId: string
): Promise<unknown> {
  const tool = toolRegistry.get(name);
  if (!tool) {
    throw new Error(`Unknown tool: ${name}`);
  }
  return tool.execute(env, args, userId);
}

/**
 * Check if a tool exists
 */
export function hasTool(name: string): boolean {
  return toolRegistry.has(name);
}
