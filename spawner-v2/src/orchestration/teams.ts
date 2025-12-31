/**
 * Skill Teams (Squads)
 *
 * Pre-configured groups of skills that work together.
 * Like a startup team: you don't hire individuals, you hire a team
 * that already knows how to work together.
 *
 * Teams define:
 * - Which skills are included
 * - Communication patterns between them
 * - Default workflow mode
 * - Entry points (which skill starts)
 */

import type { Env } from '../types.js';
import { loadSkill, type Skill } from '../skills/loader.js';
import { WorkflowDefinition, WorkflowStep } from './workflow.js';

// =============================================================================
// Types
// =============================================================================

export interface SkillTeam {
  id: string;
  name: string;
  description: string;
  skills: string[];                    // Skill IDs in this team
  lead?: string;                       // Primary skill (entry point)
  communication: CommunicationPattern;
  workflow_mode: 'sequential' | 'parallel' | 'hierarchical';
  triggers: string[];                  // Phrases that activate this team
  use_cases: string[];                 // When to use this team
}

export type CommunicationPattern =
  | 'hub-spoke'      // Lead skill coordinates, delegates to others
  | 'pipeline'       // Skills pass work down the line
  | 'round-robin'    // Each skill gets equal time
  | 'broadcast'      // Lead sends to all, collects responses
  | 'mesh';          // Any skill can talk to any skill

export interface TeamMember {
  skill_id: string;
  skill_name: string;
  role: 'lead' | 'specialist' | 'support';
  responsibilities: string[];
  loaded?: Skill;
}

export interface ActiveTeam {
  team: SkillTeam;
  members: TeamMember[];
  state: Record<string, unknown>;
  current_lead: string;
  communication_log: CommunicationEntry[];
  started_at: number;
}

export interface CommunicationEntry {
  from: string;
  to: string;
  type: 'request' | 'response' | 'handoff' | 'broadcast';
  content: string;
  timestamp: number;
}

// =============================================================================
// Built-in Teams
// =============================================================================

export const BUILTIN_TEAMS: Record<string, SkillTeam> = {
  'full-stack-build': {
    id: 'full-stack-build',
    name: 'Full Stack Build Team',
    description: 'Complete web app development from design to deployment',
    skills: [
      'system-designer',
      'backend',
      'frontend',
      'devops',
      'testing'
    ],
    lead: 'system-designer',
    communication: 'pipeline',
    workflow_mode: 'sequential',
    triggers: [
      'build a web app',
      'full stack app',
      'create an application',
      'build from scratch'
    ],
    use_cases: [
      'New SaaS product',
      'Internal tool',
      'MVP development',
      'Side project'
    ]
  },

  'game-jam': {
    id: 'game-jam',
    name: 'Game Jam Speed Team',
    description: 'Rapid game development with AI assets',
    skills: [
      'prompt-to-game',
      'ai-game-art-generation',
      'devops'
    ],
    lead: 'prompt-to-game',
    communication: 'hub-spoke',
    workflow_mode: 'sequential',
    triggers: [
      'make a game',
      'game jam',
      'quick game',
      'vibe code a game'
    ],
    use_cases: [
      'Game jam entries',
      'Prototypes',
      'Learning projects',
      'Fun experiments'
    ]
  },

  'security-audit': {
    id: 'security-audit',
    name: 'Security Audit Team',
    description: 'Comprehensive security review and hardening',
    skills: [
      'security-owasp',
      'llm-security-audit',
      'code-review'
    ],
    lead: 'security-owasp',
    communication: 'broadcast',
    workflow_mode: 'parallel',
    triggers: [
      'security audit',
      'pentest',
      'vulnerability scan',
      'security review'
    ],
    use_cases: [
      'Pre-launch security check',
      'Compliance audit',
      'After a breach',
      'Regular security hygiene'
    ]
  },

  'ai-product': {
    id: 'ai-product',
    name: 'AI Product Team',
    description: 'Build AI-powered applications',
    skills: [
      'llm-architect',
      'prompt-engineering',
      'backend',
      'frontend'
    ],
    lead: 'llm-architect',
    communication: 'hub-spoke',
    workflow_mode: 'hierarchical',
    triggers: [
      'AI app',
      'LLM product',
      'chatbot',
      'AI assistant',
      'agent'
    ],
    use_cases: [
      'Chatbots',
      'AI assistants',
      'Content generation tools',
      'AI-augmented workflows'
    ]
  },

  'data-platform': {
    id: 'data-platform',
    name: 'Data Platform Team',
    description: 'Build data pipelines and analytics',
    skills: [
      'postgres-wizard',
      'redis-specialist',
      'backend',
      'analytics'
    ],
    lead: 'postgres-wizard',
    communication: 'pipeline',
    workflow_mode: 'sequential',
    triggers: [
      'data pipeline',
      'analytics',
      'data warehouse',
      'ETL'
    ],
    use_cases: [
      'Analytics dashboard',
      'Data warehouse',
      'Real-time processing',
      'Business intelligence'
    ]
  },

  'marketing-launch': {
    id: 'marketing-launch',
    name: 'Marketing Launch Team',
    description: 'Launch and promote products',
    skills: [
      'copywriting',
      'seo',
      'social-media-marketing',
      'ai-video-generation'
    ],
    lead: 'copywriting',
    communication: 'round-robin',
    workflow_mode: 'parallel',
    triggers: [
      'launch campaign',
      'marketing',
      'go to market',
      'promote'
    ],
    use_cases: [
      'Product launch',
      'Content marketing',
      'Brand awareness',
      'Lead generation'
    ]
  },

  'startup-mvp': {
    id: 'startup-mvp',
    name: 'Startup MVP Team',
    description: 'Rapid MVP development for startups',
    skills: [
      'yc-playbook',
      'product-discovery',
      'backend',
      'frontend',
      'devops'
    ],
    lead: 'yc-playbook',
    communication: 'hub-spoke',
    workflow_mode: 'hierarchical',
    triggers: [
      'MVP',
      'startup',
      'launch fast',
      'validate idea'
    ],
    use_cases: [
      'Startup idea validation',
      'Investor demo',
      'User testing',
      'Market validation'
    ]
  }
};

// =============================================================================
// Team Operations
// =============================================================================

/**
 * Get a built-in team by ID
 */
export function getTeam(id: string): SkillTeam | null {
  return BUILTIN_TEAMS[id] || null;
}

/**
 * Find team by trigger phrase
 */
export function findTeamByTrigger(phrase: string): SkillTeam | null {
  const normalized = phrase.toLowerCase();

  for (const team of Object.values(BUILTIN_TEAMS)) {
    for (const trigger of team.triggers) {
      if (normalized.includes(trigger.toLowerCase())) {
        return team;
      }
    }
  }

  return null;
}

/**
 * List all available teams
 */
export function listTeams(): { id: string; name: string; description: string; skills: string[] }[] {
  return Object.values(BUILTIN_TEAMS).map(t => ({
    id: t.id,
    name: t.name,
    description: t.description,
    skills: t.skills
  }));
}

/**
 * Activate a team - load all skills and prepare for work
 */
export async function activateTeam(
  env: Env,
  teamId: string,
  initialState?: Record<string, unknown>
): Promise<ActiveTeam | null> {
  const team = getTeam(teamId);
  if (!team) return null;

  const members: TeamMember[] = [];

  for (const skillId of team.skills) {
    const skill = await loadSkill(env, skillId);

    members.push({
      skill_id: skillId,
      skill_name: skill?.name || skillId,
      role: skillId === team.lead ? 'lead' : 'specialist',
      responsibilities: skill?.owns || [],
      loaded: skill || undefined
    });
  }

  const leadSkill = team.lead || team.skills[0];

  return {
    team,
    members,
    state: initialState || {},
    current_lead: leadSkill || '',
    communication_log: [],
    started_at: Date.now()
  };
}

/**
 * Convert team to workflow definition
 */
export function teamToWorkflow(team: SkillTeam): WorkflowDefinition {
  const steps: WorkflowStep[] = team.skills.map(skill => ({ skill }));

  // If pipeline communication, add input/output chains
  if (team.communication === 'pipeline') {
    for (let i = 1; i < steps.length; i++) {
      const currentStep = steps[i];
      const prevStep = steps[i - 1];
      if (currentStep && prevStep) {
        currentStep.inputs = [`${prevStep.skill}_output`];
      }
    }
  }

  return {
    id: `team-${team.id}`,
    name: team.name,
    description: team.description,
    mode: team.workflow_mode === 'hierarchical' ? 'supervised' : team.workflow_mode,
    steps
  };
}

// =============================================================================
// Communication Helpers
// =============================================================================

/**
 * Log communication between team members
 */
export function logCommunication(
  activeTeam: ActiveTeam,
  from: string,
  to: string,
  type: CommunicationEntry['type'],
  content: string
): void {
  activeTeam.communication_log.push({
    from,
    to,
    type,
    content,
    timestamp: Date.now()
  });
}

/**
 * Get next skill in pipeline
 */
export function getNextInPipeline(team: SkillTeam, currentSkill: string): string | null {
  const idx = team.skills.indexOf(currentSkill);
  if (idx === -1 || idx === team.skills.length - 1) {
    return null;
  }
  return team.skills[idx + 1] ?? null;
}

/**
 * Get all skills except current (for broadcast)
 */
export function getBroadcastTargets(team: SkillTeam, sender: string): string[] {
  return team.skills.filter(s => s !== sender);
}

// =============================================================================
// Display Helpers
// =============================================================================

/**
 * Format team for display
 */
export function formatTeam(team: SkillTeam): string {
  const lines: string[] = [];

  lines.push(`## ${team.name}`);
  lines.push('');
  lines.push(team.description);
  lines.push('');

  lines.push('### Team Members');
  for (const skill of team.skills) {
    const isLead = skill === team.lead;
    lines.push(`- ${isLead ? '**' : ''}${skill}${isLead ? '** (Lead)' : ''}`);
  }
  lines.push('');

  lines.push(`**Communication:** ${team.communication}`);
  lines.push(`**Workflow:** ${team.workflow_mode}`);
  lines.push('');

  lines.push('### Use Cases');
  for (const uc of team.use_cases) {
    lines.push(`- ${uc}`);
  }

  return lines.join('\n');
}

/**
 * Format active team status
 */
export function formatActiveTeam(active: ActiveTeam): string {
  const lines: string[] = [];
  const elapsed = Math.round((Date.now() - active.started_at) / 1000);

  lines.push(`## Active Team: ${active.team.name}`);
  lines.push(`*Running for ${elapsed}s*`);
  lines.push('');

  lines.push('### Members');
  for (const member of active.members) {
    const status = member.skill_id === active.current_lead ? '(Active)' : '';
    lines.push(`- **${member.skill_name}** ${status}`);
  }
  lines.push('');

  if (active.communication_log.length > 0) {
    lines.push('### Recent Communication');
    const recent = active.communication_log.slice(-5);
    for (const entry of recent) {
      lines.push(`- ${entry.from} → ${entry.to}: ${entry.type}`);
    }
  }

  return lines.join('\n');
}
