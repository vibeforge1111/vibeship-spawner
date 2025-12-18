/**
 * spawner_orchestrate Tool
 *
 * Main entry point for Spawner. Auto-detects context and routes to:
 * - Resume: Known project, pick up where you left off
 * - Analyze: Unknown codebase, detect stack and load skills
 * - Brainstorm: New project, help define and plan
 *
 * Call this first when starting a session.
 */

import { z } from 'zod';
import type { Env } from '../types.js';
import { orchestrate, type OrchestrateInput } from '../orchestration/index.js';

/**
 * Input schema for spawner_orchestrate
 */
export const orchestrateInputSchema = z.object({
  // Current working directory
  cwd: z.string().describe(
    'Current working directory path'
  ),
  // File list from the project directory
  files: z.array(z.string()).optional().describe(
    'List of file paths in the project directory (from ls/find)'
  ),
  // Package.json contents if available
  package_json: z.object({
    dependencies: z.record(z.string()).optional(),
    devDependencies: z.record(z.string()).optional(),
  }).optional().describe(
    'Contents of package.json if present'
  ),
  // User message/intent if any
  user_message: z.string().optional().describe(
    'User\'s initial message or request (helps determine intent)'
  ),
  // Mind file contents (read by Claude and passed here)
  mind_memory: z.string().optional().describe(
    'Content of .mind/MEMORY.md file if it exists'
  ),
  mind_session: z.string().optional().describe(
    'Content of .mind/SESSION.md file if it exists'
  ),
});

/**
 * Tool definition for MCP
 */
export const orchestrateToolDefinition = {
  name: 'spawner_orchestrate',
  description: 'Start a Spawner session. Auto-detects context and routes to appropriate mode: resume (known project), analyze (existing codebase), or brainstorm (new project). Call this first when starting.',
  inputSchema: {
    type: 'object' as const,
    properties: {
      cwd: {
        type: 'string',
        description: 'Current working directory path',
      },
      files: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of file paths in the project directory',
      },
      package_json: {
        type: 'object',
        properties: {
          dependencies: {
            type: 'object',
            additionalProperties: { type: 'string' },
          },
          devDependencies: {
            type: 'object',
            additionalProperties: { type: 'string' },
          },
        },
        description: 'Contents of package.json if present',
      },
      user_message: {
        type: 'string',
        description: 'User\'s initial message or request',
      },
      mind_memory: {
        type: 'string',
        description: 'Content of .mind/MEMORY.md file if it exists',
      },
      mind_session: {
        type: 'string',
        description: 'Content of .mind/SESSION.md file if it exists',
      },
    },
    required: ['cwd'],
  },
};

/**
 * Output type
 */
export interface OrchestrateOutput {
  // Which path was taken
  path: 'resume' | 'analyze' | 'brainstorm';
  // Greeting to show user
  greeting: string;
  // Loaded skills
  loaded_skills: {
    id: string;
    name: string;
    version: string;
    source: 'catalog' | 'generated';
  }[];
  // Sharp edges that apply
  sharp_edges: {
    id: string;
    title: string;
    severity: 'critical' | 'warning' | 'info';
    situation: string;
  }[];
  // Project info if available
  project?: {
    id: string;
    name: string;
    path: string;
    stack: string[];
    open_issues?: string[];
  };
  // Skills that need to be generated (includes spawner_skill_new parameters)
  missing_skills?: {
    domain: string;
    suggested_id: string;
    suggested_name: string;
    type: 'core' | 'integration' | 'pattern';
    suggested_triggers: string[];
    priority: 'high' | 'medium' | 'low';
    // Ready-to-use spawner_skill_new call parameters
    skill_new_params: {
      action: 'scaffold';
      id: string;
      name: string;
      type: 'core' | 'integration' | 'pattern';
      triggers: string[];
      layer: '2';
    };
  }[];
  // Suggestions for next actions
  suggestions: string[];
  // Instruction for Claude
  _instruction: string;
}

/**
 * Execute the spawner_orchestrate tool
 */
export async function executeOrchestrate(
  env: Env,
  input: z.infer<typeof orchestrateInputSchema>
): Promise<OrchestrateOutput> {
  const { cwd, files, package_json, user_message, mind_memory, mind_session } = input;

  // Build orchestrate input
  const orchestrateInput: OrchestrateInput = {
    cwd,
    userMessage: user_message,
    memoryContent: mind_memory,
    sessionContent: mind_session,
  };

  // Run orchestration
  const result = await orchestrate(
    env,
    orchestrateInput,
    files ?? [],
    package_json
  );

  // Build instruction based on path
  const instruction = buildInstruction(result);

  // Build missing skills with spawner_skill_new parameters
  const missingSkills = result.missingSkills?.map(skill => ({
    domain: skill.domain,
    suggested_id: skill.suggestedId,
    suggested_name: skill.suggestedName,
    type: skill.type,
    suggested_triggers: skill.suggestedTriggers,
    priority: skill.priority,
    skill_new_params: {
      action: 'scaffold' as const,
      id: skill.suggestedId,
      name: skill.suggestedName,
      type: skill.type,
      triggers: skill.suggestedTriggers,
      layer: '2' as const,
    },
  }));

  return {
    path: result.path,
    greeting: result.greeting,
    loaded_skills: result.loadedSkills.map(s => ({
      id: s.id,
      name: s.name,
      version: s.version,
      source: s.source,
    })),
    sharp_edges: result.sharpEdges.map(e => ({
      id: e.id,
      title: e.title,
      severity: e.severity,
      situation: e.situation,
    })),
    project: result.project ? {
      id: result.project.id,
      name: result.project.name,
      path: result.project.path,
      stack: result.project.stack,
      open_issues: result.project.openIssues,
    } : undefined,
    missing_skills: missingSkills && missingSkills.length > 0 ? missingSkills : undefined,
    suggestions: result.suggestions,
    _instruction: instruction,
  };
}

/**
 * Build instruction for Claude based on orchestration result
 */
function buildInstruction(result: Awaited<ReturnType<typeof orchestrate>>): string {
  const lines: string[] = [];

  lines.push('## Spawner Session Started');
  lines.push('');
  lines.push(`**Mode:** ${result.path}`);
  lines.push('');

  // Show greeting
  lines.push('---');
  lines.push('');
  lines.push(result.greeting);
  lines.push('');
  lines.push('---');

  // Path-specific instructions
  switch (result.path) {
    case 'resume':
      lines.push('');
      lines.push('## Resume Mode');
      lines.push('');
      lines.push('This is a known project. Context has been loaded from previous sessions.');
      lines.push('');
      if (result.project?.openIssues && result.project.openIssues.length > 0) {
        lines.push('**Open Issues:**');
        for (const issue of result.project.openIssues) {
          lines.push(`- ${issue}`);
        }
        lines.push('');
      }
      lines.push('**Next:** Ask what the user wants to work on, or suggest tackling an open issue.');
      break;

    case 'analyze':
      lines.push('');
      lines.push('## Analyze Mode');
      lines.push('');
      lines.push('New codebase detected and analyzed. Project created in Spawner.');
      lines.push('');
      if (result.loadedSkills.length > 0) {
        lines.push('**Loaded Skills:**');
        for (const skill of result.loadedSkills) {
          lines.push(`- ${skill.name} (${skill.version})`);
        }
        lines.push('');
      }
      if (result.sharpEdges.length > 0) {
        lines.push('**Sharp Edges to Watch:**');
        for (const edge of result.sharpEdges.slice(0, 5)) {
          lines.push(`- [${edge.severity}] ${edge.title}`);
        }
        lines.push('');
      }
      // Add missing skills with generation instructions
      if (result.missingSkills && result.missingSkills.length > 0) {
        lines.push('**Missing Skills (can generate on demand):**');
        for (const skill of result.missingSkills) {
          lines.push(`- ${skill.suggestedName} (${skill.domain}) [${skill.priority}]`);
        }
        lines.push('');
        lines.push('To generate a missing skill, use `spawner_skill_new` with the `skill_new_params` from the response.');
        lines.push('');
      }
      lines.push('**Next:** Ask what the user wants to build or fix.');
      break;

    case 'brainstorm':
      lines.push('');
      lines.push('## Brainstorm Mode');
      lines.push('');
      lines.push('No existing codebase detected. Ready to help plan a new project.');
      lines.push('');
      lines.push('**Next Steps:**');
      lines.push('1. Ask clarifying questions about the idea (max 5)');
      lines.push('2. Detect skill level from language patterns');
      lines.push('3. Make assumptions and confirm with user');
      lines.push('4. Generate PRD and recommend stack');
      lines.push('5. Create task queue');
      lines.push('');
      lines.push('Use `spawner_plan` once idea is refined.');
      break;
  }

  // Add suggestions
  if (result.suggestions.length > 0) {
    lines.push('');
    lines.push('**Suggestions:**');
    for (const suggestion of result.suggestions) {
      lines.push(`- ${suggestion}`);
    }
  }

  // Add tool reminders
  lines.push('');
  lines.push('## Available Tools');
  lines.push('- `spawner_validate` - Run code checks before committing');
  lines.push('- `spawner_watch_out` - Get gotchas for current situation');
  lines.push('- `spawner_remember` - Save decisions and learnings');
  lines.push('- `spawner_skills` - Load additional skills');
  lines.push('- `spawner_skill_new` - Generate V2 skills for missing technologies');
  lines.push('- `spawner_unstick` - Get help when stuck');

  return lines.join('\n');
}
