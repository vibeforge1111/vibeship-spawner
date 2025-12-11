/**
 * spawner_sharp_edge Tool
 *
 * Query sharp edges (gotchas) relevant to current situation.
 */

import { z } from 'zod';
import type { Env, SharpEdgeInput, SharpEdgeOutput } from '../types';
import {
  loadSharpEdges,
  filterEdgesBySituation,
  matchEdgesAgainstCode,
} from '../skills/sharp-edges';
import { emitEvent } from '../telemetry/events';

/**
 * Input schema for spawner_sharp_edge
 */
export const sharpEdgeInputSchema = z.object({
  stack: z.array(z.string()).describe(
    'Technology stack to get sharp edges for (e.g., ["nextjs", "supabase"])'
  ),
  situation: z.string().optional().describe(
    'Description of the current situation or problem to match against'
  ),
  code_context: z.string().optional().describe(
    'Code snippet to check against detection patterns'
  ),
});

/**
 * Tool definition for MCP
 */
export const sharpEdgeToolDefinition = {
  name: 'spawner_sharp_edge',
  description: 'Query sharp edges (gotchas) relevant to current situation. Use this when you encounter issues or want to proactively check for common pitfalls.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      stack: {
        type: 'array',
        items: { type: 'string' },
        description: 'Technology stack to get sharp edges for (e.g., ["nextjs", "supabase"])',
      },
      situation: {
        type: 'string',
        description: 'Description of the current situation or problem to match against',
      },
      code_context: {
        type: 'string',
        description: 'Code snippet to check against detection patterns',
      },
    },
    required: ['stack'],
  },
};

/**
 * Execute the spawner_sharp_edge tool
 */
export async function executeSharpEdge(
  env: Env,
  input: SharpEdgeInput,
  projectId?: string
): Promise<SharpEdgeOutput> {
  // Validate input
  const parsed = sharpEdgeInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      edges: [],
      _instruction: `Invalid input: ${parsed.error.message}`,
    };
  }

  const { stack, situation, code_context } = parsed.data;

  // 1. Get all edges for this stack
  let edges = await loadSharpEdges(env.SHARP_EDGES, stack);

  // 2. Filter by situation if provided
  if (situation) {
    edges = filterEdgesBySituation(edges, situation);
  }

  // 3. Check code against detection patterns if provided
  if (code_context) {
    edges = matchEdgesAgainstCode(edges, code_context);
  }

  // 4. Emit telemetry
  if (edges.length > 0) {
    await emitEvent(
      env.DB,
      'sharp_edge_surfaced',
      {
        edges: edges.slice(0, 3).map(e => e.id),
        situation,
        had_code_match: edges.some(e => e.matches_code),
        stack,
      },
      projectId
    );
  }

  // 5. Build response
  const formattedEdges = edges.slice(0, 5).map(e => ({
    id: e.id,
    summary: e.summary,
    severity: e.severity,
    situation: e.situation,
    why: e.why,
    solution: e.solution,
    matches_current_code: e.matches_code,
  }));

  const instruction = edges.length > 0
    ? `Found ${edges.length} relevant sharp edge${edges.length !== 1 ? 's' : ''}. Review these before proceeding - they represent common gotchas for this stack.${edges.some(e => e.matches_code) ? ' Some match patterns in your code!' : ''}`
    : 'No sharp edges match this situation. Proceed with normal patterns.';

  return {
    edges: formattedEdges,
    _instruction: instruction,
  };
}

/**
 * Create the tool handler
 */
export function sharpEdgeTool(env: Env) {
  return {
    definition: sharpEdgeToolDefinition,
    execute: (input: SharpEdgeInput, projectId?: string) =>
      executeSharpEdge(env, input, projectId),
  };
}
