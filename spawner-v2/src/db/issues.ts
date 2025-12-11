/**
 * Issues Database Operations
 *
 * CRUD operations for issues table - tracks known problems.
 */

import type { Issue } from '../types';

/**
 * Generate a unique issue ID
 */
function generateIssueId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `issue-${timestamp}-${random}`;
}

/**
 * Get open issues for a project
 */
export async function getOpenIssues(
  db: D1Database,
  projectId: string
): Promise<Issue[]> {
  const result = await db
    .prepare(
      `SELECT * FROM issues
       WHERE project_id = ? AND status = 'open'
       ORDER BY created_at DESC`
    )
    .bind(projectId)
    .all<Issue>();

  return result.results;
}

/**
 * Get all issues for a project
 */
export async function getAllIssues(
  db: D1Database,
  projectId: string,
  options?: { status?: 'open' | 'resolved'; limit?: number }
): Promise<Issue[]> {
  let query = `SELECT * FROM issues WHERE project_id = ?`;
  const binds: (string | number)[] = [projectId];

  if (options?.status) {
    query += ` AND status = ?`;
    binds.push(options.status);
  }

  query += ` ORDER BY created_at DESC`;

  if (options?.limit) {
    query += ` LIMIT ?`;
    binds.push(options.limit);
  }

  const result = await db.prepare(query).bind(...binds).all<Issue>();
  return result.results;
}

/**
 * Create a new issue
 */
export async function createIssue(
  db: D1Database,
  projectId: string,
  description: string
): Promise<Issue> {
  const id = generateIssueId();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO issues (id, project_id, description, status, created_at)
       VALUES (?, ?, ?, 'open', ?)`
    )
    .bind(id, projectId, description, now)
    .run();

  return {
    id,
    project_id: projectId,
    description,
    status: 'open',
    resolved_at: null,
    created_at: now,
  };
}

/**
 * Resolve an issue by ID
 */
export async function resolveIssue(
  db: D1Database,
  issueId: string
): Promise<boolean> {
  const result = await db
    .prepare(
      `UPDATE issues
       SET status = 'resolved', resolved_at = datetime('now')
       WHERE id = ? AND status = 'open'`
    )
    .bind(issueId)
    .run();

  return result.meta.changes > 0;
}

/**
 * Resolve issues matching a description pattern
 * Used when we don't have the exact issue ID
 */
export async function resolveIssueByDescription(
  db: D1Database,
  projectId: string,
  descriptionPattern: string
): Promise<number> {
  const result = await db
    .prepare(
      `UPDATE issues
       SET status = 'resolved', resolved_at = datetime('now')
       WHERE project_id = ? AND description LIKE ? AND status = 'open'`
    )
    .bind(projectId, `%${descriptionPattern.slice(0, 50)}%`)
    .run();

  return result.meta.changes;
}

/**
 * Get issue count by status
 */
export async function getIssueCounts(
  db: D1Database,
  projectId: string
): Promise<{ open: number; resolved: number }> {
  const result = await db
    .prepare(
      `SELECT status, COUNT(*) as count
       FROM issues
       WHERE project_id = ?
       GROUP BY status`
    )
    .bind(projectId)
    .all<{ status: string; count: number }>();

  const counts = { open: 0, resolved: 0 };
  for (const row of result.results) {
    if (row.status === 'open') counts.open = row.count;
    if (row.status === 'resolved') counts.resolved = row.count;
  }

  return counts;
}

/**
 * Reopen a resolved issue
 */
export async function reopenIssue(
  db: D1Database,
  issueId: string
): Promise<boolean> {
  const result = await db
    .prepare(
      `UPDATE issues
       SET status = 'open', resolved_at = NULL
       WHERE id = ? AND status = 'resolved'`
    )
    .bind(issueId)
    .run();

  return result.meta.changes > 0;
}
