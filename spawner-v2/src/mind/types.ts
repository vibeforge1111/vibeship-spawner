/**
 * Mind Integration Types
 *
 * Mind is a separate MCP (vibeship-mind) that handles session memory.
 * These types represent what Spawner reads from .mind/ files that Mind creates.
 *
 * Spawner reads Mind's files for context; Mind handles the writing/management.
 */

/**
 * Parsed content from .mind/MEMORY.md
 */
export interface MindMemory {
  projectState: {
    goal: string | null;
    stack: string[];
    blocked: string | null;
  };
  gotchas: string[];
  decisions: MindDecision[];
  sessionLog: MindSessionEntry[];
}

export interface MindDecision {
  date: string;
  what: string;
  why: string;
  risk?: string;
}

export interface MindSessionEntry {
  date: string;
  content: string;
}

/**
 * Parsed content from .mind/SESSION.md
 */
export interface MindSession {
  date: string;
  experience: string[];
  blockers: string[];
  rejected: string[];
  assumptions: string[];
}

/**
 * Combined Mind context that Spawner uses
 */
export interface MindContext {
  memory: MindMemory | null;
  session: MindSession | null;
  hasFiles: boolean;
}
