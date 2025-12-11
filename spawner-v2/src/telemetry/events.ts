/**
 * Telemetry Events
 *
 * Emit and query telemetry events for system improvement.
 * No PII is stored - only anonymized usage patterns.
 */

import type { EventType, TelemetryEvent } from '../types';

/**
 * Generate a unique event ID
 */
function generateEventId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `evt-${timestamp}-${random}`;
}

/**
 * Emit a telemetry event
 */
export async function emitEvent(
  db: D1Database,
  type: EventType,
  metadata: Record<string, unknown>,
  projectId?: string,
  skillId?: string
): Promise<void> {
  const event: TelemetryEvent = {
    id: generateEventId(),
    event_type: type,
    project_id: projectId ?? null,
    skill_id: skillId ?? null,
    metadata,
    created_at: new Date().toISOString(),
  };

  await db
    .prepare(
      `INSERT INTO telemetry (id, event_type, project_id, skill_id, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind(
      event.id,
      event.event_type,
      event.project_id,
      event.skill_id,
      JSON.stringify(event.metadata),
      event.created_at
    )
    .run();
}

/**
 * Get guardrail statistics
 */
export async function getGuardrailStats(
  db: D1Database,
  days = 30
): Promise<{ check_id: string; severity: string; count: number }[]> {
  const result = await db
    .prepare(
      `SELECT
         json_extract(metadata, '$.check_id') as check_id,
         json_extract(metadata, '$.severity') as severity,
         COUNT(*) as count
       FROM telemetry
       WHERE event_type = 'guardrail_block'
         AND created_at > datetime('now', '-' || ? || ' days')
       GROUP BY check_id, severity
       ORDER BY count DESC`
    )
    .bind(days)
    .all<{ check_id: string; severity: string; count: number }>();

  return result.results;
}

/**
 * Get escape hatch statistics
 */
export async function getEscapeHatchStats(
  db: D1Database,
  days = 30
): Promise<{ pattern: string; triggers: number; avg_attempts: number }[]> {
  const result = await db
    .prepare(
      `SELECT
         json_extract(metadata, '$.pattern') as pattern,
         COUNT(*) as triggers,
         AVG(json_extract(metadata, '$.attempt_count')) as avg_attempts
       FROM telemetry
       WHERE event_type = 'escape_hatch_trigger'
         AND created_at > datetime('now', '-' || ? || ' days')
       GROUP BY pattern
       ORDER BY triggers DESC`
    )
    .bind(days)
    .all<{ pattern: string; triggers: number; avg_attempts: number }>();

  return result.results;
}

/**
 * Get sharp edge surfacing statistics
 */
export async function getSharpEdgeStats(
  db: D1Database,
  days = 30
): Promise<{ edge_id: string; times_surfaced: number; had_code_match: number }[]> {
  const result = await db
    .prepare(
      `SELECT
         json_extract(metadata, '$.edges[0]') as edge_id,
         COUNT(*) as times_surfaced,
         SUM(CASE WHEN json_extract(metadata, '$.had_code_match') = 1 THEN 1 ELSE 0 END) as had_code_match
       FROM telemetry
       WHERE event_type = 'sharp_edge_surfaced'
         AND created_at > datetime('now', '-' || ? || ' days')
       GROUP BY edge_id
       ORDER BY times_surfaced DESC`
    )
    .bind(days)
    .all<{ edge_id: string; times_surfaced: number; had_code_match: number }>();

  return result.results;
}

/**
 * Get session statistics
 */
export async function getSessionStats(
  db: D1Database,
  days = 30
): Promise<{
  total_sessions: number;
  unique_projects: number;
  avg_skills_loaded: number;
}> {
  const result = await db
    .prepare(
      `SELECT
         COUNT(*) as total_sessions,
         COUNT(DISTINCT project_id) as unique_projects,
         AVG(json_array_length(json_extract(metadata, '$.skills_loaded'))) as avg_skills_loaded
       FROM telemetry
       WHERE event_type = 'session_start'
         AND created_at > datetime('now', '-' || ? || ' days')`
    )
    .bind(days)
    .first<{
      total_sessions: number;
      unique_projects: number;
      avg_skills_loaded: number;
    }>();

  return result ?? { total_sessions: 0, unique_projects: 0, avg_skills_loaded: 0 };
}

/**
 * Get event counts by type
 */
export async function getEventCountsByType(
  db: D1Database,
  days = 30
): Promise<{ event_type: string; count: number }[]> {
  const result = await db
    .prepare(
      `SELECT event_type, COUNT(*) as count
       FROM telemetry
       WHERE created_at > datetime('now', '-' || ? || ' days')
       GROUP BY event_type
       ORDER BY count DESC`
    )
    .bind(days)
    .all<{ event_type: string; count: number }>();

  return result.results;
}

/**
 * Get skill usage statistics
 */
export async function getSkillUsageStats(
  db: D1Database,
  days = 30
): Promise<{ skill_id: string; usage_count: number }[]> {
  const result = await db
    .prepare(
      `SELECT skill_id, COUNT(*) as usage_count
       FROM telemetry
       WHERE skill_id IS NOT NULL
         AND created_at > datetime('now', '-' || ? || ' days')
       GROUP BY skill_id
       ORDER BY usage_count DESC`
    )
    .bind(days)
    .all<{ skill_id: string; usage_count: number }>();

  return result.results;
}

/**
 * Cleanup old telemetry data (retention: 90 days)
 */
export async function cleanupOldTelemetry(
  db: D1Database,
  retentionDays = 90
): Promise<number> {
  const result = await db
    .prepare(
      `DELETE FROM telemetry
       WHERE created_at < datetime('now', '-' || ? || ' days')`
    )
    .bind(retentionDays)
    .run();

  return result.meta.changes;
}
