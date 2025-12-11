/**
 * Session Database Operations
 *
 * CRUD operations for sessions table - tracks session summaries.
 */

import type { Session, SessionRow } from '../types';

/**
 * Parse a session row from D1 into a Session object
 */
function parseSession(row: SessionRow): Session {
  return {
    ...row,
    issues_open: JSON.parse(row.issues_open) as string[],
    issues_resolved: JSON.parse(row.issues_resolved) as string[],
    validations_passed: JSON.parse(row.validations_passed) as string[],
  };
}

/**
 * Generate a unique session ID
 */
function generateSessionId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `sess-${timestamp}-${random}`;
}

/**
 * Get the most recent session for a project
 */
export async function getLastSession(
  db: D1Database,
  projectId: string
): Promise<Session | null> {
  const result = await db
    .prepare(
      `SELECT * FROM sessions
       WHERE project_id = ?
       ORDER BY created_at DESC
       LIMIT 1`
    )
    .bind(projectId)
    .first<SessionRow>();

  return result ? parseSession(result) : null;
}

/**
 * Get recent sessions for a project
 */
export async function getRecentSessions(
  db: D1Database,
  projectId: string,
  limit = 5
): Promise<Session[]> {
  const result = await db
    .prepare(
      `SELECT * FROM sessions
       WHERE project_id = ?
       ORDER BY created_at DESC
       LIMIT ?`
    )
    .bind(projectId, limit)
    .all<SessionRow>();

  return result.results.map(parseSession);
}

/**
 * Create a new session summary
 */
export async function createSession(
  db: D1Database,
  projectId: string,
  summary: string,
  options?: {
    issues_open?: string[];
    issues_resolved?: string[];
    validations_passed?: string[];
  }
): Promise<Session> {
  const id = generateSessionId();
  const now = new Date().toISOString();
  const issuesOpen = options?.issues_open ?? [];
  const issuesResolved = options?.issues_resolved ?? [];
  const validationsPassed = options?.validations_passed ?? [];

  await db
    .prepare(
      `INSERT INTO sessions (id, project_id, summary, issues_open, issues_resolved, validations_passed, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      projectId,
      summary,
      JSON.stringify(issuesOpen),
      JSON.stringify(issuesResolved),
      JSON.stringify(validationsPassed),
      now
    )
    .run();

  return {
    id,
    project_id: projectId,
    summary,
    issues_open: issuesOpen,
    issues_resolved: issuesResolved,
    validations_passed: validationsPassed,
    created_at: now,
  };
}

/**
 * Get session count for a project
 */
export async function getSessionCount(
  db: D1Database,
  projectId: string
): Promise<number> {
  const result = await db
    .prepare(
      `SELECT COUNT(*) as count FROM sessions WHERE project_id = ?`
    )
    .bind(projectId)
    .first<{ count: number }>();

  return result?.count ?? 0;
}
