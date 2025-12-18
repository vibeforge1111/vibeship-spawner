/**
 * Mind File Parser
 *
 * Parses .mind/MEMORY.md and .mind/SESSION.md files that Mind MCP creates.
 * Spawner uses this to read context even when Mind MCP isn't connected.
 */

import type { MindMemory, MindSession } from './types.js';

/**
 * Parse MEMORY.md content
 */
export function parseMemory(content: string): MindMemory {
  const memory: MindMemory = {
    projectState: {
      goal: null,
      stack: [],
      blocked: null,
    },
    gotchas: [],
    decisions: [],
    sessionLog: [],
  };

  // Parse Project State section
  const goalMatch = content.match(/- Goal:\s*(.+)/);
  if (goalMatch && goalMatch[1] && goalMatch[1].trim()) {
    memory.projectState.goal = goalMatch[1].trim();
  }

  const stackMatch = content.match(/- Stack:\s*(.+)/);
  if (stackMatch && stackMatch[1] && stackMatch[1].trim()) {
    memory.projectState.stack = stackMatch[1]
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
  }

  const blockedMatch = content.match(/- Blocked:\s*(.+)/);
  if (blockedMatch && blockedMatch[1] && blockedMatch[1].trim().toLowerCase() !== 'none') {
    memory.projectState.blocked = blockedMatch[1].trim();
  }

  // Parse Gotchas section
  const gotchasSection = extractSection(content, '## Gotchas', '##');
  if (gotchasSection) {
    const gotchaLines = gotchasSection
      .split('\n')
      .filter(line => line.startsWith('- '))
      .map(line => line.substring(2).trim());
    memory.gotchas = gotchaLines;
  }

  // Parse Decisions (format: "- YYYY-MM-DD: what | why | risk")
  const decisionsMatches = content.matchAll(/- (\d{4}-\d{2}-\d{2}):\s*(.+)/g);
  for (const match of decisionsMatches) {
    const dateStr = match[1];
    const restStr = match[2];
    if (dateStr && restStr) {
      const parts = restStr.split('|').map(p => p.trim());
      memory.decisions.push({
        date: dateStr,
        what: parts[0] || '',
        why: parts[1] || '',
        risk: parts[2],
      });
    }
  }

  // Parse Session Log entries (## YYYY-MM-DD headers)
  const sessionLogMatches = content.matchAll(/## (\d{4}-\d{2}-\d{2})\n([\s\S]*?)(?=\n## \d{4}|<!--|---\s*$|$)/g);
  for (const match of sessionLogMatches) {
    const dateStr = match[1];
    const contentStr = match[2];
    if (dateStr && contentStr) {
      memory.sessionLog.push({
        date: dateStr,
        content: contentStr.trim(),
      });
    }
  }

  return memory;
}

/**
 * Parse SESSION.md content
 */
export function parseSession(content: string): MindSession {
  const session: MindSession = {
    date: '',
    experience: [],
    blockers: [],
    rejected: [],
    assumptions: [],
  };

  // Parse date from header
  const dateMatch = content.match(/# Session:\s*(\d{4}-\d{2}-\d{2})/);
  if (dateMatch && dateMatch[1]) {
    session.date = dateMatch[1];
  }

  // Parse Experience section
  const experienceSection = extractSection(content, '## Experience', '##');
  if (experienceSection) {
    session.experience = extractListItems(experienceSection);
  }

  // Parse Blockers section
  const blockersSection = extractSection(content, '## Blockers', '##');
  if (blockersSection) {
    session.blockers = extractListItems(blockersSection);
  }

  // Parse Rejected section
  const rejectedSection = extractSection(content, '## Rejected', '##');
  if (rejectedSection) {
    session.rejected = extractListItems(rejectedSection);
  }

  // Parse Assumptions section
  const assumptionsSection = extractSection(content, '## Assumptions', '##');
  if (assumptionsSection) {
    session.assumptions = extractListItems(assumptionsSection);
  }

  return session;
}

/**
 * Extract a section between two headers
 */
function extractSection(content: string, startHeader: string, endPattern: string): string | null {
  const startIndex = content.indexOf(startHeader);
  if (startIndex === -1) return null;

  const contentAfterStart = content.substring(startIndex + startHeader.length);
  const endRegex = new RegExp(`\n${endPattern}`);
  const endMatch = contentAfterStart.match(endRegex);

  if (endMatch && endMatch.index !== undefined) {
    return contentAfterStart.substring(0, endMatch.index).trim();
  }

  return contentAfterStart.trim();
}

/**
 * Extract list items from markdown
 */
function extractListItems(section: string): string[] {
  return section
    .split('\n')
    .filter(line => line.match(/^[-*]\s+/))
    .map(line => line.replace(/^[-*]\s+/, '').trim())
    .filter(Boolean);
}
