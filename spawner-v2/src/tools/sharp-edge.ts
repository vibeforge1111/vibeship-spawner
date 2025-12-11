/**
 * spawner_sharp_edge Tool
 *
 * Query sharp edges (gotchas) relevant to current situation.
 */

import { z } from 'zod';
import type { Env, SharpEdgeInput, SharpEdgeOutput, SharpEdge } from '../types';
import { loadRelevantSkills, loadSkillEdges } from '../skills/loader';
import { emitEvent } from '../telemetry/events';

type EdgeWithMatch = SharpEdge & { matches_code?: boolean };

/**
 * Filter edges by situation keywords
 */
function filterEdgesBySituation(
  edges: EdgeWithMatch[],
  situation: string
): EdgeWithMatch[] {
  const keywords = situation.toLowerCase().split(/\s+/);

  return edges.filter(edge => {
    const edgeText = [
      edge.summary,
      edge.situation,
      ...(edge.symptoms ?? []),
    ].join(' ').toLowerCase();

    return keywords.some(kw => edgeText.includes(kw));
  });
}

/**
 * Match edges against code
 */
function matchEdgesAgainstCode(
  edges: EdgeWithMatch[],
  code: string
): EdgeWithMatch[] {
  return edges.map(edge => {
    if (edge.detection_pattern) {
      try {
        const matches = new RegExp(edge.detection_pattern).test(code);
        return { ...edge, matches_code: matches };
      } catch {
        // Invalid regex pattern, skip matching
        return edge;
      }
    }
    return edge;
  }).sort((a, b) => {
    // Sort matching edges first
    if (a.matches_code && !b.matches_code) return -1;
    if (!a.matches_code && b.matches_code) return 1;
    return 0;
  });
}

/**
 * Default stack when none provided - covers common vibe coder setup
 */
const DEFAULT_STACK = ['nextjs', 'react', 'typescript', 'supabase'];

/**
 * Input schema for spawner_sharp_edge
 */
export const sharpEdgeInputSchema = z.object({
  stack: z.array(z.string()).optional().describe(
    'Technology stack to get sharp edges for. Defaults to common stack: nextjs, react, typescript, supabase'
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
        description: 'Technology stack to get sharp edges for. Defaults to common stack: nextjs, react, typescript, supabase',
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
    required: [],
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

  const { situation, code_context } = parsed.data;

  // Use provided stack or default to common setup
  const stack = parsed.data.stack?.length ? parsed.data.stack : DEFAULT_STACK;

  // 1. Get skills for this stack
  const skills = await loadRelevantSkills(env, stack);

  // 2. Load edges for all matched skills
  let edges: EdgeWithMatch[] = [];
  for (const skill of skills) {
    const skillEdges = await loadSkillEdges(env, skill.id);
    edges.push(...skillEdges);
  }

  // 3. Filter by situation if provided
  if (situation) {
    edges = filterEdgesBySituation(edges, situation);
  }

  // 4. Check code against detection patterns if provided
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
