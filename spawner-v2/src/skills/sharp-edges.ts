/**
 * Sharp Edges Loader
 *
 * Load and query sharp edges (gotchas) from KV.
 */

import type { SharpEdge } from '../types';

/**
 * Load sharp edges for a given stack
 */
export async function loadSharpEdges(
  sharpEdges: KVNamespace,
  stack: string[]
): Promise<SharpEdge[]> {
  const edges: SharpEdge[] = [];
  const seenIds = new Set<string>();

  for (const stackItem of stack) {
    const normalized = stackItem.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const stackEdges = await sharpEdges.get<SharpEdge[]>(
      `edges_by_stack:${normalized}`,
      'json'
    );

    if (stackEdges) {
      for (const edge of stackEdges) {
        if (!seenIds.has(edge.id)) {
          seenIds.add(edge.id);
          edges.push(edge);
        }
      }
    }
  }

  // Sort by severity (critical first)
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  edges.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return edges;
}

/**
 * Load a specific sharp edge by ID
 */
export async function loadSharpEdge(
  sharpEdges: KVNamespace,
  edgeId: string
): Promise<SharpEdge | null> {
  return sharpEdges.get<SharpEdge>(`edge:${edgeId}`, 'json');
}

/**
 * Filter edges by situation keywords
 */
export function filterEdgesBySituation(
  edges: SharpEdge[],
  situation: string
): SharpEdge[] {
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
export function matchEdgesAgainstCode(
  edges: SharpEdge[],
  code: string
): SharpEdge[] {
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
 * Check if an edge is still valid (not expired, within version range)
 */
export function isEdgeValid(
  edge: SharpEdge,
  currentVersion?: string
): boolean {
  // Check expiry
  if (edge.expires_at) {
    const expiryDate = new Date(edge.expires_at);
    if (expiryDate < new Date()) {
      return false;
    }
  }

  // Version range check would require semver library
  // For now, we'll trust the edge is valid if no expiry
  return true;
}

/**
 * Get all edge IDs in the index
 */
export async function getAllEdgeIds(
  sharpEdges: KVNamespace
): Promise<string[]> {
  const index = await sharpEdges.get<string[]>('edge_index', 'json');
  return index ?? [];
}

/**
 * Get sharp edges for a specific skill
 */
export async function getSharpEdgesForSkill(
  env: { SHARP_EDGES: KVNamespace },
  skillId: string
): Promise<Array<{
  id: string;
  title: string;
  severity: 'critical' | 'warning' | 'info';
  situation?: string;
}>> {
  // Try to load from KV by skill ID
  const edges = await env.SHARP_EDGES.get<SharpEdge[]>(
    `edges_by_skill:${skillId}`,
    'json'
  );

  if (edges) {
    return edges.map(e => ({
      id: e.id,
      title: e.summary,
      severity: e.severity === 'high' ? 'critical' : e.severity === 'medium' ? 'warning' : 'info',
      situation: e.situation
    }));
  }

  // Fallback: try by stack name (skill might be in stack index)
  const stackEdges = await env.SHARP_EDGES.get<SharpEdge[]>(
    `edges_by_stack:${skillId.toLowerCase()}`,
    'json'
  );

  if (stackEdges) {
    return stackEdges.map(e => ({
      id: e.id,
      title: e.summary,
      severity: e.severity === 'high' ? 'critical' : e.severity === 'medium' ? 'warning' : 'info',
      situation: e.situation
    }));
  }

  return [];
}
