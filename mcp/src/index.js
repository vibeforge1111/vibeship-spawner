#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load skill registry
let skillRegistry = null;
async function getSkillRegistry() {
  if (!skillRegistry) {
    const registryPath = path.join(__dirname, '..', '..', 'skills', 'registry.json');
    const data = await fs.readFile(registryPath, 'utf-8');
    skillRegistry = JSON.parse(data);
  }
  return skillRegistry;
}

// Templates for different project types
const templates = {
  saas: {
    name: 'SaaS',
    description: 'Subscription products',
    agents: ['planner', 'frontend', 'backend', 'database', 'testing'],
    mcps: ['filesystem', 'supabase', 'stripe']
  },
  marketplace: {
    name: 'Marketplace',
    description: 'Buy/sell platforms',
    agents: ['planner', 'frontend', 'backend', 'database', 'payments', 'search'],
    mcps: ['filesystem', 'supabase', 'stripe', 'algolia']
  },
  'ai-app': {
    name: 'AI App',
    description: 'LLM-powered apps',
    agents: ['planner', 'frontend', 'backend', 'database', 'ai'],
    mcps: ['filesystem', 'supabase', 'anthropic']
  },
  web3: {
    name: 'Web3 dApp',
    description: 'Blockchain apps',
    agents: ['planner', 'frontend', 'smart-contracts', 'testing'],
    mcps: ['filesystem', 'git', 'foundry']
  },
  tool: {
    name: 'Tool/CLI',
    description: 'Utilities and CLIs',
    agents: ['planner', 'backend', 'testing'],
    mcps: ['filesystem', 'git']
  }
};

// Create the MCP server
const server = new Server(
  {
    name: 'vibeship-spawner',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'create_project',
        description: 'Spawn a new vibeship project with agents and MCPs. Can use a gist ID from the web configurator, a template name (saas, marketplace, ai-app, web3, tool), or a custom config.',
        inputSchema: {
          type: 'object',
          properties: {
            gist_id: {
              type: 'string',
              description: 'GitHub Gist ID containing the project config (from vibeship web configurator)'
            },
            template: {
              type: 'string',
              enum: ['saas', 'marketplace', 'ai-app', 'web3', 'tool'],
              description: 'Template to use if no gist_id provided'
            },
            project_name: {
              type: 'string',
              description: 'Name for the project (required if using template)'
            },
            target_dir: {
              type: 'string',
              description: 'Directory to create project in (defaults to project_name in current directory)'
            },
            agents: {
              type: 'array',
              items: { type: 'string' },
              description: 'Override template agents (optional)'
            },
            mcps: {
              type: 'array',
              items: { type: 'string' },
              description: 'Override template MCPs (optional)'
            }
          }
        }
      },
      {
        name: 'check_environment',
        description: 'Check if the environment has all required dependencies for vibeship spawner (Node.js, Claude CLI, etc.)',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'list_templates',
        description: 'List available project templates with their default agents and MCPs',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'find_skill',
        description: 'Search for specialist skills by keyword, tag, or get squad recommendations. Use this to find the right skill for a task.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search query - matches skill names, descriptions, tags, and trigger phrases'
            },
            tag: {
              type: 'string',
              description: 'Find skills with a specific tag (e.g., "auth", "supabase", "react")'
            },
            squad: {
              type: 'string',
              description: 'Get a pre-configured squad for a feature type (e.g., "auth-complete", "payments-complete", "crud-feature", "ai-feature")'
            },
            layer: {
              type: 'integer',
              enum: [1, 2, 3],
              description: 'List skills by layer: 1=Core, 2=Integration, 3=Polish'
            }
          }
        }
      },
      {
        name: 'list_skills',
        description: 'List all available specialist skills organized by layer',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'get_skill',
        description: 'Get the full content of a specific specialist skill file',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Name of the skill (e.g., "auth-flow", "supabase-backend", "typescript-strict")'
            }
          },
          required: ['name']
        }
      }
    ]
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'create_project':
      return await handleCreateProject(args);
    case 'check_environment':
      return await handleCheckEnvironment();
    case 'list_templates':
      return handleListTemplates();
    case 'find_skill':
      return await handleFindSkill(args);
    case 'list_skills':
      return await handleListSkills();
    case 'get_skill':
      return await handleGetSkill(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function handleCreateProject(args) {
  try {
    let config;

    // Get config from gist or template
    if (args.gist_id) {
      config = await fetchGistConfig(args.gist_id);
    } else if (args.template) {
      if (!args.project_name) {
        return {
          content: [{
            type: 'text',
            text: 'Error: project_name is required when using a template'
          }],
          isError: true
        };
      }
      const template = templates[args.template];
      if (!template) {
        return {
          content: [{
            type: 'text',
            text: `Error: Unknown template "${args.template}". Available: ${Object.keys(templates).join(', ')}`
          }],
          isError: true
        };
      }
      config = {
        project_name: args.project_name,
        description: args.description || '',
        agents: args.agents || template.agents,
        mcps: args.mcps || template.mcps,
        behaviors: {
          mandatory: ['verify-before-complete', 'follow-architecture', 'maintainable-code', 'secure-code'],
          selected: ['tdd-mode']
        }
      };
    } else {
      return {
        content: [{
          type: 'text',
          text: 'Error: Either gist_id or template (with project_name) is required'
        }],
        isError: true
      };
    }

    // Determine target directory
    const targetDir = args.target_dir || config.project_name;
    const absoluteTarget = path.resolve(process.cwd(), targetDir);

    // Check if directory exists
    try {
      await fs.access(absoluteTarget);
      return {
        content: [{
          type: 'text',
          text: `Error: Directory already exists: ${absoluteTarget}\n\nUse a different target_dir or project_name.`
        }],
        isError: true
      };
    } catch {
      // Directory doesn't exist, good to proceed
    }

    // Scaffold the project
    await scaffoldProject(config, absoluteTarget);

    return {
      content: [{
        type: 'text',
        text: `Project "${config.project_name}" created successfully!

Location: ${absoluteTarget}

Your agents:
  Agents: ${config.agents.join(', ')}
  MCPs: ${config.mcps.join(', ')}

Files created:
  - CLAUDE.md (project instructions)
  - state.json (project state)
  - task_queue.json (task tracking)
  - docs/PRD.md (requirements template)
  - docs/ARCHITECTURE.md (architecture template)
  - skills/ (agent skill files)

The project is in "planning" phase. I'll greet the user and start asking discovery questions to understand what they want to build.

Ready to start building!`
      }]
    };
  } catch (error) {
    return {
      content: [{
        type: 'text',
        text: `Error creating project: ${error.message}`
      }],
      isError: true
    };
  }
}

async function handleCheckEnvironment() {
  const checks = [];
  let allPassed = true;

  // Check Node.js version
  try {
    const { stdout } = await execAsync('node --version');
    const version = stdout.trim();
    const major = parseInt(version.slice(1).split('.')[0]);
    if (major >= 18) {
      checks.push({ name: 'Node.js', status: 'pass', detail: version });
    } else {
      checks.push({ name: 'Node.js', status: 'fail', detail: `${version} (need >= 18)` });
      allPassed = false;
    }
  } catch {
    checks.push({ name: 'Node.js', status: 'fail', detail: 'Not found' });
    allPassed = false;
  }

  // Check Claude CLI
  try {
    await execAsync('claude --version');
    checks.push({ name: 'Claude CLI', status: 'pass', detail: 'Installed' });
  } catch {
    checks.push({ name: 'Claude CLI', status: 'fail', detail: 'Not found - install with: npm install -g @anthropic-ai/claude-code' });
    allPassed = false;
  }

  // Check git
  try {
    const { stdout } = await execAsync('git --version');
    checks.push({ name: 'Git', status: 'pass', detail: stdout.trim() });
  } catch {
    checks.push({ name: 'Git', status: 'warn', detail: 'Not found (optional but recommended)' });
  }

  // Format output
  const lines = ['Environment Check', '================', ''];
  for (const check of checks) {
    const icon = check.status === 'pass' ? '+' : check.status === 'fail' ? 'x' : '!';
    lines.push(`${icon} ${check.name}: ${check.detail}`);
  }
  lines.push('');
  lines.push(allPassed ? 'All required dependencies installed!' : 'Some dependencies are missing. Please install them before continuing.');

  return {
    content: [{
      type: 'text',
      text: lines.join('\n')
    }]
  };
}

function handleListTemplates() {
  const lines = ['Available Templates', '==================', ''];

  for (const [id, template] of Object.entries(templates)) {
    lines.push(`${template.name} (${id})`);
    lines.push(`  ${template.description}`);
    lines.push(`  Agents: ${template.agents.join(', ')}`);
    lines.push(`  MCPs: ${template.mcps.join(', ')}`);
    lines.push('');
  }

  lines.push('Usage: create_project with template="saas" and project_name="my-app"');

  return {
    content: [{
      type: 'text',
      text: lines.join('\n')
    }]
  };
}

async function fetchGistConfig(gistId) {
  const url = `https://api.github.com/gists/${gistId}`;

  const response = await fetch(url, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'vibeship-spawner-mcp'
    }
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`Gist not found: ${gistId}`);
    }
    throw new Error(`Failed to fetch gist: ${response.status}`);
  }

  const gist = await response.json();
  const files = Object.values(gist.files);

  let configFile = files.find(f => f.filename === 'vibeship-config.json');
  if (!configFile) {
    configFile = files.find(f => f.filename.endsWith('.json'));
  }

  if (!configFile) {
    throw new Error('No config file found in gist');
  }

  const config = JSON.parse(configFile.content);

  // Validate required fields
  if (!config.project_name) {
    throw new Error('Config missing required field: project_name');
  }

  // Ensure arrays
  config.agents = config.agents || [];
  config.mcps = config.mcps || [];
  config.behaviors = config.behaviors || { mandatory: [], selected: [] };

  return config;
}

async function handleFindSkill(args) {
  try {
    const registry = await getSkillRegistry();
    const lines = [];

    // Search by query
    if (args.query) {
      const q = args.query.toLowerCase();
      const results = registry.specialists.filter(s =>
        s.name.includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.tags.some(t => t.includes(q)) ||
        s.triggers.some(t => t.toLowerCase().includes(q))
      );

      if (results.length === 0) {
        return {
          content: [{ type: 'text', text: `No skills found matching "${args.query}"` }]
        };
      }

      lines.push(`Found ${results.length} skill(s) matching "${args.query}":\n`);
      for (const skill of results) {
        lines.push(`${skill.name} (Layer ${skill.layer})`);
        lines.push(`  ${skill.description}`);
        lines.push(`  Tags: ${skill.tags.join(', ')}`);
        lines.push(`  Pairs with: ${skill.pairs_with.join(', ')}`);
        lines.push('');
      }
    }

    // Search by tag
    if (args.tag) {
      const skills = registry.tag_index[args.tag.toLowerCase()];
      if (!skills || skills.length === 0) {
        return {
          content: [{
            type: 'text',
            text: `No skills with tag "${args.tag}"\n\nAvailable tags: ${Object.keys(registry.tag_index).join(', ')}`
          }]
        };
      }

      lines.push(`Skills with tag "${args.tag}":\n`);
      for (const name of skills) {
        const skill = registry.specialists.find(s => s.name === name);
        if (skill) {
          lines.push(`${skill.name} (Layer ${skill.layer})`);
          lines.push(`  ${skill.description}`);
          lines.push('');
        }
      }
    }

    // Get squad
    if (args.squad) {
      const squad = registry.squads[args.squad];
      if (!squad) {
        return {
          content: [{
            type: 'text',
            text: `Squad "${args.squad}" not found\n\nAvailable squads: ${Object.keys(registry.squads).join(', ')}`
          }]
        };
      }

      lines.push(`Squad: ${args.squad}`);
      lines.push(`${squad.description}\n`);
      lines.push(`Lead: ${squad.lead}`);
      lines.push(`Support: ${squad.support.join(', ')}`);
      if (squad.on_call) {
        lines.push(`On-call: ${squad.on_call.join(', ')}`);
      }
      lines.push('\nRecommended loading order:');
      lines.push(`1. ${squad.lead} (lead)`);
      squad.support.forEach((s, i) => {
        lines.push(`${i + 2}. ${s}`);
      });
    }

    // List by layer
    if (args.layer) {
      const layer = registry.layers[args.layer];
      if (!layer) {
        return {
          content: [{ type: 'text', text: 'Invalid layer. Use 1, 2, or 3' }]
        };
      }

      lines.push(`Layer ${args.layer}: ${layer.name}`);
      lines.push(`${layer.description}\n`);
      for (const name of layer.specialists) {
        const skill = registry.specialists.find(s => s.name === name);
        if (skill) {
          lines.push(`${skill.name}`);
          lines.push(`  ${skill.tags.join(', ')}`);
        }
      }
    }

    return {
      content: [{ type: 'text', text: lines.join('\n') }]
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error finding skill: ${error.message}` }],
      isError: true
    };
  }
}

async function handleListSkills() {
  try {
    const registry = await getSkillRegistry();
    const lines = [
      `Skill Registry v${registry.version}`,
      `${registry.specialists.length} specialists\n`
    ];

    for (const layerNum of [1, 2, 3]) {
      const layer = registry.layers[layerNum];
      lines.push(`── Layer ${layerNum}: ${layer.name} ──`);
      lines.push(`   ${layer.description}\n`);
      for (const name of layer.specialists) {
        const skill = registry.specialists.find(s => s.name === name);
        if (skill) {
          lines.push(`   ${skill.name}`);
          lines.push(`   └─ ${skill.tags.join(', ')}`);
        }
      }
      lines.push('');
    }

    lines.push('── Pre-configured Squads ──\n');
    for (const [name, squad] of Object.entries(registry.squads)) {
      lines.push(`   ${name}: ${squad.description}`);
    }

    return {
      content: [{ type: 'text', text: lines.join('\n') }]
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error listing skills: ${error.message}` }],
      isError: true
    };
  }
}

async function handleGetSkill(args) {
  try {
    if (!args.name) {
      return {
        content: [{ type: 'text', text: 'Error: skill name is required' }],
        isError: true
      };
    }

    const registry = await getSkillRegistry();
    const skill = registry.specialists.find(s => s.name === args.name);

    if (!skill) {
      const available = registry.specialists.map(s => s.name).join(', ');
      return {
        content: [{
          type: 'text',
          text: `Skill "${args.name}" not found\n\nAvailable skills: ${available}`
        }],
        isError: true
      };
    }

    // Read the skill file
    const skillPath = path.join(__dirname, '..', '..', 'skills', skill.path);
    const content = await fs.readFile(skillPath, 'utf-8');

    return {
      content: [{
        type: 'text',
        text: `# ${skill.name}\n\nPath: ${skill.path}\nLayer: ${skill.layer}\nTags: ${skill.tags.join(', ')}\nPairs with: ${skill.pairs_with.join(', ')}\n\n---\n\n${content}`
      }]
    };
  } catch (error) {
    return {
      content: [{ type: 'text', text: `Error getting skill: ${error.message}` }],
      isError: true
    };
  }
}

async function scaffoldProject(config, targetDir) {
  // Create directories
  await fs.mkdir(targetDir, { recursive: true });
  await fs.mkdir(path.join(targetDir, 'docs'), { recursive: true });
  await fs.mkdir(path.join(targetDir, 'skills'), { recursive: true });
  await fs.mkdir(path.join(targetDir, '.claude'), { recursive: true });

  const behaviors = config.behaviors || { mandatory: [], selected: [] };
  const allBehaviors = [...(behaviors.mandatory || []), ...(behaviors.selected || [])];

  // Write CLAUDE.md
  const claudeMd = `# ${config.project_name}

## vibeship orchestrator

This project uses vibeship orchestrator for AI-powered development orchestration.

> "You vibe. It ships."

---

### On Session Start

ALWAYS do this first:

1. Read \`state.json\` - check current phase, checkpoint, and custom_skills_needed
2. **If this is a fresh project (phase is "planning" and checkpoint.last_task is null):**
   - IMMEDIATELY greet the user with a project summary (see greeting below)
   - Don't wait for user input - speak first!
3. If \`custom_skills_needed\` has items, generate those skills first (see planner skill)
4. Based on phase:
   - \`planning\` -> Load \`skills/planner.md\`, start/continue planning
   - \`building\` -> Read \`task_queue.json\`, load skill for next pending task
   - \`review\` -> Show summary, ask for feedback
5. Resume from checkpoint if set

#### Fresh Project Greeting

When starting a fresh project, greet the user like this:

\`\`\`
vibeship orchestrator

I've loaded your project config:
  - Project: ${config.project_name}
  - Agents: ${config.agents.join(', ')}
  - MCPs: ${config.mcps.join(', ')}

You're in the planning phase. I'll ask a few questions to understand
your vision, then generate your PRD and architecture.

Ready to start? (or type "skip" to jump straight to building)
\`\`\`

---

### State Files

| File | Purpose |
|------|---------|
| \`state.json\` | Current project state (phase, decisions, assumptions) |
| \`task_queue.json\` | All tasks and their status |
| \`docs/PRD.md\` | Generated requirements |
| \`docs/ARCHITECTURE.md\` | Technical decisions |
| \`docs/PROJECT_LOG.md\` | Progress narrative |

---

### Commands

| Command | Action |
|---------|--------|
| \`status\` | Show current phase, completed tasks, next steps |
| \`continue\` | Resume from checkpoint |
| \`replan\` | Go back to planning phase |
| \`assumptions\` | Show current assumptions, allow edits |
| \`skip [task]\` | Skip a specific task |
| \`pause\` | Save state and stop |

---

### Your Stack

**Agents:** ${config.agents.join(', ')}

**MCPs:** ${config.mcps.join(', ')}

**Behaviors:**
${allBehaviors.map(b => `- ${b}`).join('\n') || '- None selected'}

---

### Status Indicators

| Symbol | Meaning |
|--------|---------|
| \`>\` | Active/processing |
| \`+\` | Completed |
| \`!\` | Warning |
| \`*\` | Needs human input |
| \`x\` | Error |
`;

  await fs.writeFile(path.join(targetDir, 'CLAUDE.md'), claudeMd);

  // Write state.json
  const state = {
    version: 1,
    project_name: config.project_name,
    description: config.description || '',
    phase: 'planning',
    discovery: {},
    stack: {
      agents: config.agents,
      mcps: config.mcps
    },
    behaviors: config.behaviors,
    custom_skills_needed: [],
    checkpoint: {
      last_task: null,
      timestamp: new Date().toISOString()
    },
    decisions: [],
    assumptions: []
  };

  await fs.writeFile(path.join(targetDir, 'state.json'), JSON.stringify(state, null, 2));

  // Write task_queue.json
  await fs.writeFile(path.join(targetDir, 'task_queue.json'), JSON.stringify({ version: 1, tasks: [] }, null, 2));

  // Write PRD template
  const prd = `# Product Requirements Document

## Project: ${config.project_name}

### Overview

${config.description || '[To be filled by planner]'}

---

### Problem Statement

[What problem does this solve?]

---

### Target User

[Who is this for?]

---

### Core Features

[Priority ordered list of features]

1.
2.
3.

---

### Out of Scope (V1)

[What are we NOT building?]

-

---

### Success Criteria

[How do we know this works?]

-

---

*Generated by vibeship spawn*
`;

  await fs.writeFile(path.join(targetDir, 'docs', 'PRD.md'), prd);

  // Write Architecture template
  const arch = `# Architecture

## Project: ${config.project_name}

---

### System Overview

[High-level system diagram]

---

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | [TBD] |
| Backend | [TBD] |
| Database | [TBD] |
| Auth | [TBD] |

---

### File Structure

\`\`\`
${config.project_name}/
├── src/
├── docs/
└── ...
\`\`\`

---

### Data Models

[Key entities and relationships]

---

### API Routes

[Key endpoints]

---

### Key Decisions

| Decision | Rationale |
|----------|-----------|
| | |

---

*Generated by vibeship spawn*
`;

  await fs.writeFile(path.join(targetDir, 'docs', 'ARCHITECTURE.md'), arch);

  // Write skill schema
  const schema = `# Skill Schema

> Shared protocols for all skills

---

## State Management

All skills must read/write state through these files:

| File | Purpose |
|------|---------|
| \`state.json\` | Current phase, decisions, assumptions |
| \`task_queue.json\` | Tasks and their status |

---

## Mandatory Behaviors

Before marking ANY task complete:

1. **Verify** - Run the code/tests, confirm working
2. **Architecture check** - Confirm no deviation from ARCHITECTURE.md
3. **Security scan** - Check for secrets, validate inputs
4. **Maintainability** - Clear naming, no magic numbers, logical structure

---

## Task Status

| Status | Meaning |
|--------|---------|
| \`pending\` | Not started |
| \`in_progress\` | Currently working |
| \`completed\` | Done and verified |
| \`blocked\` | Waiting on something |

---

## Handoff Protocol

When completing a task:

1. Update task status in \`task_queue.json\`
2. Update checkpoint in \`state.json\`
3. Return control to planner

---

*vibeship spawn Schema v1*
`;

  await fs.writeFile(path.join(targetDir, 'skills', '_schema.md'), schema);

  // Write placeholder skills for each agent
  for (const agent of config.agents) {
    const skill = `# ${agent.charAt(0).toUpperCase() + agent.slice(1)} Skill

> Agent: ${agent}

---

## Read First

Before any work, read \`skills/_schema.md\` for state management protocols.

---

## Identity

You are the ${agent} agent for this project.

---

## Capabilities

[To be customized based on project needs]

---

## Workflow

1. Read your assigned task from task_queue.json
2. Execute the task following architecture guidelines
3. Update task status when complete
4. Return control to planner

---

*Always read skills/_schema.md first*
`;

    await fs.writeFile(path.join(targetDir, 'skills', `${agent}.md`), skill);
  }

  // Write .claude/settings.json
  const settings = {
    version: 1,
    project: config.project_name,
    mcps: config.mcps
  };

  await fs.writeFile(path.join(targetDir, '.claude', 'settings.json'), JSON.stringify(settings, null, 2));
}

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch(console.error);
