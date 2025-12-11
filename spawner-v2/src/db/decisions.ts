/**
 * Decisions Database Operations
 *
 * CRUD operations for decisions table - tracks architecture decisions.
 */

import type { Decision } from '../types';

/**
 * Generate a unique decision ID
 */
function generateDecisionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `dec-${timestamp}-${random}`;
}

/**
 * Get all decisions for a project
 */
export async function getDecisions(
  db: D1Database,
  projectId: string,
  limit = 50
): Promise<Decision[]> {
  const result = await db
    .prepare(
      `SELECT * FROM decisions
       WHERE project_id = ?
       ORDER BY created_at DESC
       LIMIT ?`
    )
    .bind(projectId, limit)
    .all<Decision>();

  return result.results;
}

/**
 * Get recent decisions (for context loading)
 */
export async function getRecentDecisions(
  db: D1Database,
  projectId: string,
  limit = 10
): Promise<Decision[]> {
  return getDecisions(db, projectId, limit);
}

/**
 * Create a new decision
 */
export async function createDecision(
  db: D1Database,
  projectId: string,
  decision: string,
  reasoning?: string
): Promise<Decision> {
  const id = generateDecisionId();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO decisions (id, project_id, decision, reasoning, created_at)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(id, projectId, decision, reasoning ?? null, now)
    .run();

  return {
    id,
    project_id: projectId,
    decision,
    reasoning: reasoning ?? null,
    created_at: now,
  };
}

/**
 * Search decisions by keyword
 */
export async function searchDecisions(
  db: D1Database,
  projectId: string,
  keyword: string
): Promise<Decision[]> {
  const result = await db
    .prepare(
      `SELECT * FROM decisions
       WHERE project_id = ?
       AND (decision LIKE ? OR reasoning LIKE ?)
       ORDER BY created_at DESC
       LIMIT 20`
    )
    .bind(projectId, `%${keyword}%`, `%${keyword}%`)
    .all<Decision>();

  return result.results;
}

/**
 * Delete a decision
 */
export async function deleteDecision(
  db: D1Database,
  decisionId: string,
  projectId: string
): Promise<boolean> {
  const result = await db
    .prepare(
      `DELETE FROM decisions WHERE id = ? AND project_id = ?`
    )
    .bind(decisionId, projectId)
    .run();

  return result.meta.changes > 0;
}

/**
 * Get decision count for a project
 */
export async function getDecisionCount(
  db: D1Database,
  projectId: string
): Promise<number> {
  const result = await db
    .prepare(
      `SELECT COUNT(*) as count FROM decisions WHERE project_id = ?`
    )
    .bind(projectId)
    .first<{ count: number }>();

  return result?.count ?? 0;
}
