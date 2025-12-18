/**
 * Mind Integration Module
 *
 * Reads .mind/ files that Mind MCP creates. Spawner uses this to:
 * 1. Get context when Mind MCP isn't connected
 * 2. Synthesize "picking up where we left off" summaries
 * 3. Extract stack info from Mind's project state
 *
 * Note: In Cloudflare Workers, file reading happens via the tool input.
 * The orchestrate tool receives file contents from Claude who reads them.
 */

import { parseMemory, parseSession } from './parser.js';
import type { MindContext, MindMemory, MindSession, MindDecision } from './types.js';

export * from './types.js';
export { parseMemory, parseSession } from './parser.js';

/**
 * Build Mind context from file contents
 * In Workers, we can't read files directly - content is passed from Claude
 */
export function buildMindContext(
  memoryContent?: string,
  sessionContent?: string
): MindContext {
  let memory: MindMemory | null = null;
  let session: MindSession | null = null;
  let hasFiles = false;

  // Parse MEMORY.md if content provided
  if (memoryContent) {
    try {
      memory = parseMemory(memoryContent);
      hasFiles = true;
    } catch {
      // Invalid content, skip
    }
  }

  // Parse SESSION.md if content provided
  if (sessionContent) {
    try {
      session = parseSession(sessionContent);
      hasFiles = true;
    } catch {
      // Invalid content, skip
    }
  }

  return { memory, session, hasFiles };
}

/**
 * Async version that just wraps the sync version
 * Kept for API compatibility
 */
export async function buildMindContextAsync(
  memoryContent?: string,
  sessionContent?: string
): Promise<MindContext> {
  return buildMindContext(memoryContent, sessionContent);
}

/**
 * Synthesize a "picking up where we left off" summary
 */
export function synthesizeResumeSummary(context: MindContext): string | null {
  if (!context.hasFiles) {
    return null;
  }

  const parts: string[] = [];

  // Add project goal if available
  if (context.memory?.projectState.goal) {
    parts.push(`Working on: ${context.memory.projectState.goal}`);
  }

  // Add blocker if exists
  if (context.memory?.projectState.blocked) {
    parts.push(`Blocked on: ${context.memory.projectState.blocked}`);
  }

  // Add current session blockers
  if (context.session?.blockers && context.session.blockers.length > 0) {
    parts.push(`Session blockers: ${context.session.blockers.join(', ')}`);
  }

  // Add recent session content (last session log entry)
  if (context.memory?.sessionLog && context.memory.sessionLog.length > 0) {
    const lastSession = context.memory.sessionLog[context.memory.sessionLog.length - 1];
    if (lastSession) {
      // Get first 200 chars of last session content
      const preview = lastSession.content.substring(0, 200);
      if (preview) {
        parts.push(`Last session (${lastSession.date}): ${preview}${lastSession.content.length > 200 ? '...' : ''}`);
      }
    }
  }

  // Add gotchas if any
  if (context.memory?.gotchas && context.memory.gotchas.length > 0) {
    parts.push(`Gotchas to remember: ${context.memory.gotchas.slice(0, 3).join('; ')}`);
  }

  if (parts.length === 0) {
    return null;
  }

  return parts.join('\n\n');
}

/**
 * Extract stack from Mind context
 */
export function getStackFromMind(context: MindContext): string[] {
  if (!context.memory?.projectState.stack) {
    return [];
  }
  return context.memory.projectState.stack;
}

/**
 * Get recent decisions from Mind
 */
export function getRecentDecisions(context: MindContext, limit = 5): MindDecision[] {
  if (!context.memory?.decisions) {
    return [];
  }
  return context.memory.decisions.slice(-limit);
}

/**
 * Check if Mind context indicates project is blocked
 */
export function isProjectBlocked(context: MindContext): boolean {
  return !!(
    context.memory?.projectState.blocked ||
    (context.session?.blockers && context.session.blockers.length > 0)
  );
}

/**
 * Get all blockers from Mind context
 */
export function getAllBlockers(context: MindContext): string[] {
  const blockers: string[] = [];

  if (context.memory?.projectState.blocked) {
    blockers.push(context.memory.projectState.blocked);
  }

  if (context.session?.blockers) {
    blockers.push(...context.session.blockers);
  }

  return blockers;
}
