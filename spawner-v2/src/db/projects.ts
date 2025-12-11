/**
 * Project Database Operations
 *
 * CRUD operations for projects table.
 */

import type { Project, ProjectRow, Env } from '../types';

/**
 * Parse a project row from D1 into a Project object
 */
function parseProject(row: ProjectRow): Project {
  return {
    ...row,
    stack: JSON.parse(row.stack) as string[],
  };
}

/**
 * Generate a unique project ID (kebab-case format)
 */
function generateProjectId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `proj-${timestamp}-${random}`;
}

/**
 * Load a project by ID, verifying user ownership
 */
export async function loadProject(
  db: D1Database,
  projectId: string,
  userId: string
): Promise<Project | null> {
  const result = await db
    .prepare(
      `SELECT * FROM projects WHERE id = ? AND user_id = ?`
    )
    .bind(projectId, userId)
    .first<ProjectRow>();

  return result ? parseProject(result) : null;
}

/**
 * Find projects by user
 */
export async function findProjectsByUser(
  db: D1Database,
  userId: string,
  limit = 10
): Promise<Project[]> {
  const result = await db
    .prepare(
      `SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC LIMIT ?`
    )
    .bind(userId, limit)
    .all<ProjectRow>();

  return result.results.map(parseProject);
}

/**
 * Find a project by description match (for auto-matching)
 */
export async function findProjectByDescription(
  db: D1Database,
  userId: string,
  description: string
): Promise<Project | null> {
  // Simple keyword matching - could be enhanced with embeddings
  const keywords = description.toLowerCase().split(/\s+/).slice(0, 5);

  for (const keyword of keywords) {
    if (keyword.length < 3) continue;

    const result = await db
      .prepare(
        `SELECT * FROM projects
         WHERE user_id = ?
         AND (LOWER(name) LIKE ? OR LOWER(description) LIKE ?)
         ORDER BY updated_at DESC
         LIMIT 1`
      )
      .bind(userId, `%${keyword}%`, `%${keyword}%`)
      .first<ProjectRow>();

    if (result) {
      return parseProject(result);
    }
  }

  return null;
}

/**
 * Create a new project
 */
export async function createProject(
  db: D1Database,
  userId: string,
  name: string,
  description?: string,
  stack?: string[]
): Promise<Project> {
  const id = generateProjectId();
  const now = new Date().toISOString();

  await db
    .prepare(
      `INSERT INTO projects (id, user_id, name, description, stack, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      id,
      userId,
      name,
      description ?? null,
      JSON.stringify(stack ?? []),
      now,
      now
    )
    .run();

  return {
    id,
    user_id: userId,
    name,
    description: description ?? null,
    stack: stack ?? [],
    created_at: now,
    updated_at: now,
  };
}

/**
 * Find or create a project based on description
 */
export async function findOrCreateProject(
  db: D1Database,
  userId: string,
  description: string
): Promise<Project> {
  // Try to find existing project
  const existing = await findProjectByDescription(db, userId, description);
  if (existing) {
    return existing;
  }

  // Create new project with description as name
  const name = description.split(/[.!?]/)[0]?.trim().slice(0, 100) || 'New Project';
  return createProject(db, userId, name, description);
}

/**
 * Update project stack
 */
export async function updateProjectStack(
  db: D1Database,
  projectId: string,
  userId: string,
  stack: string[]
): Promise<boolean> {
  const result = await db
    .prepare(
      `UPDATE projects
       SET stack = ?, updated_at = datetime('now')
       WHERE id = ? AND user_id = ?`
    )
    .bind(JSON.stringify(stack), projectId, userId)
    .run();

  return result.meta.changes > 0;
}

/**
 * Update project metadata
 */
export async function updateProject(
  db: D1Database,
  projectId: string,
  userId: string,
  updates: { name?: string; description?: string; stack?: string[] }
): Promise<boolean> {
  const setClauses: string[] = ['updated_at = datetime(\'now\')'];
  const binds: (string | null)[] = [];

  if (updates.name !== undefined) {
    setClauses.push('name = ?');
    binds.push(updates.name);
  }

  if (updates.description !== undefined) {
    setClauses.push('description = ?');
    binds.push(updates.description);
  }

  if (updates.stack !== undefined) {
    setClauses.push('stack = ?');
    binds.push(JSON.stringify(updates.stack));
  }

  binds.push(projectId, userId);

  const result = await db
    .prepare(
      `UPDATE projects SET ${setClauses.join(', ')} WHERE id = ? AND user_id = ?`
    )
    .bind(...binds)
    .run();

  return result.meta.changes > 0;
}

/**
 * Touch project (update timestamp)
 */
export async function touchProject(
  db: D1Database,
  projectId: string
): Promise<void> {
  await db
    .prepare(
      `UPDATE projects SET updated_at = datetime('now') WHERE id = ?`
    )
    .bind(projectId)
    .run();
}

/**
 * Delete a project
 */
export async function deleteProject(
  db: D1Database,
  projectId: string,
  userId: string
): Promise<boolean> {
  const result = await db
    .prepare(
      `DELETE FROM projects WHERE id = ? AND user_id = ?`
    )
    .bind(projectId, userId)
    .run();

  return result.meta.changes > 0;
}
