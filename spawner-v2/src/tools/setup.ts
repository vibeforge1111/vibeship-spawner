/**
 * spawner_setup Tool
 *
 * Handles onboarding, configuration checking, and setup guidance.
 * Helps users get their marketing team (or any skill team) configured correctly.
 *
 * Actions:
 * - check: Check current setup status and available capabilities
 * - guide: Get setup instructions for a specific tool, skill, or agent
 * - requirements: Get requirements for a specific skill or agent
 * - validate: Test if configured tools are working
 */

import { z } from 'zod';
import type { Env } from '../types.js';

/**
 * Tool configuration with setup details
 */
interface ToolConfig {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'generation' | 'publishing' | 'analytics';
  required: boolean;
  signupUrl: string;
  cost: string;
  envVars: string[];
  setupGuide: string;
  testPrompt?: string;
}

/**
 * Agent configuration with MCP requirements
 */
interface AgentConfig {
  id: string;
  name: string;
  requiredMcps: string[];
  recommendedMcps: string[];
  skills: string[];
}

/**
 * Marketing tools configuration
 */
const MARKETING_TOOLS: ToolConfig[] = [
  {
    id: 'filesystem',
    name: 'Filesystem',
    description: 'Read/write local files for assets, content, and configs',
    category: 'core',
    required: true,
    signupUrl: 'N/A - included with Claude Desktop',
    cost: 'Free',
    envVars: [],
    setupGuide: `
## Filesystem MCP Setup

The filesystem MCP is essential for saving generated content.

### Configuration

Add to your Claude Desktop config:

\`\`\`json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-filesystem", "/path/to/marketing-assets"]
    }
  }
}
\`\`\`

**Replace** \`/path/to/marketing-assets\` with your actual folder:
- Mac: \`/Users/yourname/Documents/Marketing\`
- Windows: \`C:/Users/yourname/Documents/Marketing\`

### Verify

Ask Claude: "List files in my marketing folder"
`,
    testPrompt: 'List files in the configured directory',
  },
  {
    id: 'fal-ai',
    name: 'Fal.ai',
    description: 'Multi-model AI access (Flux, SDXL, video models) with one API key',
    category: 'generation',
    required: false,
    signupUrl: 'https://fal.ai',
    cost: '$0.01-0.10 per generation (pay as you go)',
    envVars: ['FAL_KEY'],
    setupGuide: `
## Fal.ai Setup

Fal.ai is the **recommended starting point** - one API key gives you access to:
- Flux Pro/Schnell (image generation)
- Stable Diffusion XL
- Video generation models
- And many more

### Step 1: Get API Key

1. Go to [fal.ai](https://fal.ai)
2. Sign up (Google/GitHub/email)
3. Go to Dashboard → API Keys
4. Create a new key

### Step 2: Configure

Add to your Claude Desktop config:

\`\`\`json
{
  "mcpServers": {
    "fal": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-fetch"],
      "env": {
        "FAL_KEY": "fal_your_key_here"
      }
    }
  }
}
\`\`\`

### Step 3: Restart Claude Desktop

### Verify

Ask Claude: "Generate a test image with Fal.ai: blue circle on white background"
`,
    testPrompt: 'Generate a simple test image',
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    description: 'Voice synthesis, cloning, and sound effects',
    category: 'generation',
    required: false,
    signupUrl: 'https://elevenlabs.io',
    cost: 'Free tier available, $5-22/month for more',
    envVars: ['ELEVENLABS_API_KEY'],
    setupGuide: `
## ElevenLabs Setup

Best-in-class voice synthesis for voiceovers, narration, and sound effects.

### Step 1: Get API Key

1. Go to [elevenlabs.io](https://elevenlabs.io)
2. Sign up (free tier available)
3. Go to Profile → API Keys
4. Copy your API key

### Step 2: Configure

Add to your Claude Desktop config:

\`\`\`json
{
  "mcpServers": {
    "elevenlabs": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-fetch"],
      "env": {
        "ELEVENLABS_API_KEY": "your_key_here"
      }
    }
  }
}
\`\`\`

### Step 3: Restart Claude Desktop

### Verify

Ask Claude: "Generate a test voiceover saying 'Hello, this is a test'"
`,
    testPrompt: 'Generate a short test voiceover',
  },
  {
    id: 'runway',
    name: 'Runway',
    description: 'AI video generation (Gen-3 Alpha Turbo)',
    category: 'generation',
    required: false,
    signupUrl: 'https://runwayml.com',
    cost: '$15-95/month subscription',
    envVars: ['RUNWAY_API_KEY'],
    setupGuide: `
## Runway Setup

Industry-leading AI video generation with Gen-3 Alpha Turbo.

### Step 1: Get API Key

1. Go to [runwayml.com](https://runwayml.com)
2. Sign up and choose a plan (no free tier)
3. Go to Settings → API
4. Create and copy API key

### Step 2: Configure

Add to your Claude Desktop config:

\`\`\`json
{
  "mcpServers": {
    "runway": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-fetch"],
      "env": {
        "RUNWAY_API_KEY": "your_key_here"
      }
    }
  }
}
\`\`\`

### Step 3: Restart Claude Desktop

### Verify

Ask Claude: "Generate a 5-second test video of abstract flowing colors"
`,
    testPrompt: 'Generate a short test video',
  },
  {
    id: 'heygen',
    name: 'HeyGen',
    description: 'AI avatar videos with digital presenters',
    category: 'generation',
    required: false,
    signupUrl: 'https://heygen.com',
    cost: '$24-120/month subscription',
    envVars: ['HEYGEN_API_KEY'],
    setupGuide: `
## HeyGen Setup

Create professional AI avatar videos without filming.

### Step 1: Get API Key

1. Go to [heygen.com](https://heygen.com)
2. Sign up (1-minute free trial available)
3. Go to Settings → API
4. Copy your API key

### Step 2: Configure

Add to your Claude Desktop config:

\`\`\`json
{
  "mcpServers": {
    "heygen": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-fetch"],
      "env": {
        "HEYGEN_API_KEY": "your_key_here"
      }
    }
  }
}
\`\`\`

### Step 3: Restart Claude Desktop

### Verify

Ask Claude: "List available HeyGen avatars"
`,
    testPrompt: 'List available avatars',
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    description: 'Best-in-class image generation',
    category: 'generation',
    required: false,
    signupUrl: 'https://midjourney.com',
    cost: '$10-60/month subscription',
    envVars: ['MIDJOURNEY_API_KEY'],
    setupGuide: `
## Midjourney Setup

Best image quality, but no official API - requires workaround.

### Option A: Manual Workflow (Recommended)

1. Subscribe at [midjourney.com](https://midjourney.com)
2. Use via Discord or web interface
3. Download images and save to marketing folder
4. Claude can reference saved images

### Option B: Third-Party API

Services like useapi.net provide unofficial API access:

1. Sign up at [useapi.net](https://useapi.net)
2. Link your Midjourney account
3. Get API token
4. Configure in Claude Desktop

\`\`\`json
{
  "mcpServers": {
    "midjourney": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-fetch"],
      "env": {
        "USEAPI_TOKEN": "your_token"
      }
    }
  }
}
\`\`\`

**Note:** Third-party APIs have additional cost and may be unreliable.
`,
    testPrompt: 'Generate a test image (if API configured)',
  },
  {
    id: 'suno',
    name: 'Suno',
    description: 'AI music generation',
    category: 'generation',
    required: false,
    signupUrl: 'https://suno.com',
    cost: 'Free tier, $10-30/month for more',
    envVars: ['SUNO_API_KEY'],
    setupGuide: `
## Suno Setup

AI music generation - currently no official API.

### Current Workflow

1. Sign up at [suno.com](https://suno.com)
2. Generate music in the web interface
3. Download tracks you like
4. Save to marketing assets folder

### Claude Integration

Until official API is available:
1. Ask Claude for optimized Suno prompts
2. Generate in Suno web interface
3. Tell Claude where you saved the file

Example:
"Generate a Suno prompt for upbeat corporate background music"

Claude will provide the prompt. You generate and save.
`,
    testPrompt: 'Provide a Suno prompt for test music',
  },
];

/**
 * Marketing agents configuration
 */
const MARKETING_AGENTS: AgentConfig[] = [
  {
    id: 'creative-director',
    name: 'Creative Director',
    requiredMcps: ['filesystem'],
    recommendedMcps: ['fal-ai', 'runway', 'elevenlabs', 'heygen'],
    skills: ['ai-creative-director', 'ai-brand-kit', 'prompt-engineering-creative'],
  },
  {
    id: 'visual-creator',
    name: 'Visual Creator',
    requiredMcps: ['filesystem'],
    recommendedMcps: ['fal-ai', 'midjourney', 'runway'],
    skills: ['ai-image-generation', 'ai-video-generation', 'prompt-engineering-creative'],
  },
  {
    id: 'video-producer',
    name: 'Video Producer',
    requiredMcps: ['filesystem'],
    recommendedMcps: ['runway', 'heygen', 'elevenlabs', 'suno'],
    skills: ['ai-video-generation', 'video-production', 'voiceover', 'ai-audio-production'],
  },
  {
    id: 'copywriter',
    name: 'Copywriter',
    requiredMcps: ['filesystem'],
    recommendedMcps: [],
    skills: ['copywriting', 'ad-copywriting', 'blog-writing', 'brand-storytelling'],
  },
  {
    id: 'content-strategist',
    name: 'Content Strategist',
    requiredMcps: ['filesystem'],
    recommendedMcps: [],
    skills: ['content-strategy', 'seo', 'marketing-fundamentals'],
  },
  {
    id: 'performance-marketer',
    name: 'Performance Marketer',
    requiredMcps: ['filesystem'],
    recommendedMcps: [],
    skills: ['ai-content-analytics', 'ad-copywriting', 'marketing-fundamentals'],
  },
  {
    id: 'social-media-manager',
    name: 'Social Media Manager',
    requiredMcps: ['filesystem'],
    recommendedMcps: ['fal-ai'],
    skills: ['viral-marketing', 'real-time-content', 'content-strategy'],
  },
  {
    id: 'brand-guardian',
    name: 'Brand Guardian',
    requiredMcps: ['filesystem'],
    recommendedMcps: [],
    skills: ['ai-brand-kit', 'ai-content-qa', 'marketing-fundamentals'],
  },
];

/**
 * Setup levels
 */
const SETUP_LEVELS = [
  {
    level: 1,
    name: 'Basic',
    description: 'Content planning, copywriting, strategy - no AI generation',
    requiredTools: ['filesystem'],
    capabilities: ['Content strategy', 'Copywriting', 'Planning', 'Reviews'],
  },
  {
    level: 2,
    name: 'Visual Creator',
    description: 'Add AI image generation',
    requiredTools: ['filesystem', 'fal-ai'],
    capabilities: ['Everything in Basic', 'AI image generation', 'Social graphics', 'Ad creatives'],
  },
  {
    level: 3,
    name: 'Full Creative Suite',
    description: 'Complete AI creative capabilities',
    requiredTools: ['filesystem', 'fal-ai', 'runway', 'elevenlabs'],
    capabilities: ['Everything in Visual', 'AI video generation', 'Voiceovers', 'Full multimedia'],
  },
];

/**
 * Input schema
 */
export const setupInputSchema = z.object({
  action: z.enum(['check', 'guide', 'requirements', 'level']).optional().describe(
    'Action: check (current status), guide (setup instructions), requirements (for skill/agent), level (setup level info)'
  ),
  tool: z.string().optional().describe(
    'Tool ID for guide action (e.g., "fal-ai", "elevenlabs")'
  ),
  agent: z.string().optional().describe(
    'Agent ID for requirements action (e.g., "visual-creator", "video-producer")'
  ),
  skill: z.string().optional().describe(
    'Skill ID for requirements action'
  ),
  level: z.number().min(1).max(3).optional().describe(
    'Setup level for level action (1=Basic, 2=Visual, 3=Full)'
  ),
  configured_tools: z.array(z.string()).optional().describe(
    'List of tools the user has configured (for check action)'
  ),
});

/**
 * Tool definition for MCP
 */
export const setupToolDefinition = {
  name: 'spawner_setup',
  description: 'Check setup status, get configuration guides, and verify tool requirements for marketing team onboarding',
  inputSchema: {
    type: 'object' as const,
    properties: {
      action: {
        type: 'string',
        enum: ['check', 'guide', 'requirements', 'level'],
        description: 'Action: check (current status), guide (setup instructions), requirements (for skill/agent), level (setup level info)',
      },
      tool: {
        type: 'string',
        description: 'Tool ID for guide action (e.g., "fal-ai", "elevenlabs", "runway")',
      },
      agent: {
        type: 'string',
        description: 'Agent ID for requirements action (e.g., "visual-creator", "video-producer")',
      },
      skill: {
        type: 'string',
        description: 'Skill ID for requirements action',
      },
      level: {
        type: 'integer',
        enum: [1, 2, 3],
        description: 'Setup level for level action (1=Basic, 2=Visual, 3=Full)',
      },
      configured_tools: {
        type: 'array',
        items: { type: 'string' },
        description: 'List of tools the user has configured (helps check action)',
      },
    },
    required: [],
  },
};

/**
 * Output type
 */
export interface SetupOutput {
  status?: {
    level: number;
    levelName: string;
    configuredTools: string[];
    missingForNextLevel: string[];
    capabilities: string[];
    recommendations: string[];
  };
  guide?: string;
  requirements?: {
    agent?: string;
    skill?: string;
    required: string[];
    recommended: string[];
    missingRequired: string[];
    missingRecommended: string[];
  };
  levelInfo?: {
    level: number;
    name: string;
    description: string;
    requiredTools: ToolConfig[];
    capabilities: string[];
  };
  availableTools?: ToolConfig[];
  _instruction: string;
}

/**
 * Execute the spawner_setup tool
 */
export async function executeSetup(
  _env: Env,
  input: z.infer<typeof setupInputSchema>
): Promise<SetupOutput> {
  const parsed = setupInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(`Invalid input: ${parsed.error.message}`);
  }

  const { tool, agent, skill, level, configured_tools = [] } = parsed.data;

  // Infer action from provided params
  let action = parsed.data.action;
  if (!action) {
    if (tool) {
      action = 'guide';
    } else if (agent || skill) {
      action = 'requirements';
    } else if (level) {
      action = 'level';
    } else {
      action = 'check';
    }
  }

  switch (action) {
    case 'check':
      return handleCheck(configured_tools);

    case 'guide':
      if (!tool) {
        // Return list of available tools
        return {
          availableTools: MARKETING_TOOLS,
          _instruction: buildToolListInstruction(),
        };
      }
      return handleGuide(tool);

    case 'requirements':
      return handleRequirements(agent, skill, configured_tools);

    case 'level':
      return handleLevel(level ?? 1);

    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

/**
 * Handle check action - determine current setup level and capabilities
 */
function handleCheck(configuredTools: string[]): SetupOutput {
  // Determine current level based on configured tools
  let currentLevel = 0;
  let currentLevelInfo = SETUP_LEVELS[0];

  for (const levelInfo of SETUP_LEVELS) {
    const hasAll = levelInfo.requiredTools.every(t => configuredTools.includes(t));
    if (hasAll) {
      currentLevel = levelInfo.level;
      currentLevelInfo = levelInfo;
    } else {
      break;
    }
  }

  // Find missing tools for next level
  const nextLevel = SETUP_LEVELS.find(l => l.level === currentLevel + 1);
  const missingForNextLevel = nextLevel
    ? nextLevel.requiredTools.filter(t => !configuredTools.includes(t))
    : [];

  // Build recommendations
  const recommendations: string[] = [];

  if (currentLevel === 0) {
    recommendations.push('Start by configuring the filesystem MCP to enable file saving');
  } else if (currentLevel === 1) {
    recommendations.push('Add Fal.ai to unlock AI image generation');
    recommendations.push('This enables the Visual Creator agent');
  } else if (currentLevel === 2) {
    recommendations.push('Add Runway for video generation');
    recommendations.push('Add ElevenLabs for voiceovers');
  }

  // Build capabilities based on level
  const capabilities = currentLevel > 0 && currentLevelInfo ? currentLevelInfo.capabilities : ['None - setup required'];
  const levelName = currentLevel > 0 && currentLevelInfo ? currentLevelInfo.name : 'Not Configured';

  return {
    status: {
      level: currentLevel,
      levelName,
      configuredTools,
      missingForNextLevel,
      capabilities,
      recommendations,
    },
    _instruction: buildCheckInstruction(currentLevel, currentLevelInfo ?? null, configuredTools, missingForNextLevel),
  };
}

/**
 * Handle guide action - return setup guide for specific tool
 */
function handleGuide(toolId: string): SetupOutput {
  const tool = MARKETING_TOOLS.find(t => t.id === toolId);
  if (!tool) {
    const available = MARKETING_TOOLS.map(t => t.id).join(', ');
    throw new Error(`Tool "${toolId}" not found. Available: ${available}`);
  }

  return {
    guide: tool.setupGuide,
    _instruction: `Setup guide for ${tool.name}. Follow the steps above to configure.`,
  };
}

/**
 * Handle requirements action - get requirements for agent or skill
 */
function handleRequirements(
  agentId?: string,
  skillId?: string,
  configuredTools: string[] = []
): SetupOutput {
  if (agentId) {
    const agent = MARKETING_AGENTS.find(a => a.id === agentId);
    if (!agent) {
      const available = MARKETING_AGENTS.map(a => a.id).join(', ');
      throw new Error(`Agent "${agentId}" not found. Available: ${available}`);
    }

    const missingRequired = agent.requiredMcps.filter(t => !configuredTools.includes(t));
    const missingRecommended = agent.recommendedMcps.filter(t => !configuredTools.includes(t));

    return {
      requirements: {
        agent: agent.name,
        required: agent.requiredMcps,
        recommended: agent.recommendedMcps,
        missingRequired,
        missingRecommended,
      },
      _instruction: buildRequirementsInstruction(agent.name, missingRequired, missingRecommended),
    };
  }

  if (skillId) {
    // For skills, we check if they need specific tools
    // Most marketing skills just need filesystem
    return {
      requirements: {
        skill: skillId,
        required: ['filesystem'],
        recommended: [],
        missingRequired: configuredTools.includes('filesystem') ? [] : ['filesystem'],
        missingRecommended: [],
      },
      _instruction: `Skill "${skillId}" requires filesystem MCP. Most skills work with just filesystem - generation tools are optional enhancements.`,
    };
  }

  throw new Error('Either agent or skill must be provided for requirements action');
}

/**
 * Handle level action - get detailed info about a setup level
 */
function handleLevel(level: number): SetupOutput {
  const levelInfo = SETUP_LEVELS.find(l => l.level === level);
  if (!levelInfo) {
    throw new Error(`Level ${level} not found. Available: 1, 2, 3`);
  }

  const requiredToolConfigs = levelInfo.requiredTools.map(toolId => {
    const tool = MARKETING_TOOLS.find(t => t.id === toolId);
    return tool!;
  }).filter(Boolean);

  return {
    levelInfo: {
      level: levelInfo.level,
      name: levelInfo.name,
      description: levelInfo.description,
      requiredTools: requiredToolConfigs,
      capabilities: levelInfo.capabilities,
    },
    _instruction: buildLevelInstruction(levelInfo, requiredToolConfigs),
  };
}

/**
 * Build check instruction
 */
function buildCheckInstruction(
  level: number,
  levelInfo: typeof SETUP_LEVELS[0] | null,
  configured: string[],
  missing: string[]
): string {
  const lines: string[] = [];

  if (level === 0 || !levelInfo) {
    lines.push('## Setup Required');
    lines.push('');
    lines.push('No tools configured yet. Start with:');
    lines.push('');
    lines.push('```');
    lines.push('spawner_setup({ action: "guide", tool: "filesystem" })');
    lines.push('```');
  } else {
    lines.push(`## Setup Level ${level}: ${levelInfo.name}`);
    lines.push('');
    lines.push(`**Configured:** ${configured.join(', ') || 'None'}`);
    lines.push('');
    lines.push('**Capabilities:**');
    for (const cap of levelInfo.capabilities) {
      lines.push(`- ${cap}`);
    }

    if (missing.length > 0) {
      lines.push('');
      lines.push('**To unlock next level, add:**');
      for (const tool of missing) {
        const toolInfo = MARKETING_TOOLS.find(t => t.id === tool);
        lines.push(`- ${tool}: ${toolInfo?.description ?? ''}`);
      }
      lines.push('');
      lines.push(`Use: \`spawner_setup({ action: "guide", tool: "${missing[0]}" })\``);
    }
  }

  return lines.join('\n');
}

/**
 * Build tool list instruction
 */
function buildToolListInstruction(): string {
  const lines: string[] = [
    '## Available Tools',
    '',
    'Get setup guide with: `spawner_setup({ action: "guide", tool: "<id>" })`',
    '',
  ];

  const byCategory: Record<string, ToolConfig[]> = {};
  for (const tool of MARKETING_TOOLS) {
    const category = tool.category;
    if (!byCategory[category]) {
      byCategory[category] = [];
    }
    byCategory[category]!.push(tool);
  }

  for (const [category, tools] of Object.entries(byCategory)) {
    lines.push(`### ${category.charAt(0).toUpperCase() + category.slice(1)}`);
    for (const tool of tools) {
      lines.push(`- **${tool.id}**: ${tool.name} - ${tool.description} (${tool.cost})`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Build requirements instruction
 */
function buildRequirementsInstruction(
  name: string,
  missingRequired: string[],
  missingRecommended: string[]
): string {
  const lines: string[] = [`## Requirements for ${name}`];

  if (missingRequired.length === 0 && missingRecommended.length === 0) {
    lines.push('');
    lines.push('✅ All requirements met! Ready to use.');
    return lines.join('\n');
  }

  if (missingRequired.length > 0) {
    lines.push('');
    lines.push('❌ **Missing Required:**');
    for (const tool of missingRequired) {
      lines.push(`- ${tool}`);
    }
    lines.push('');
    lines.push(`Setup required tools first: \`spawner_setup({ action: "guide", tool: "${missingRequired[0]}" })\``);
  }

  if (missingRecommended.length > 0) {
    lines.push('');
    lines.push('⚠️ **Missing Recommended (optional but enhances capabilities):**');
    for (const tool of missingRecommended) {
      const toolInfo = MARKETING_TOOLS.find(t => t.id === tool);
      lines.push(`- ${tool}: ${toolInfo?.description ?? ''}`);
    }
  }

  return lines.join('\n');
}

/**
 * Build level instruction
 */
function buildLevelInstruction(
  levelInfo: typeof SETUP_LEVELS[0],
  tools: ToolConfig[]
): string {
  const lines: string[] = [
    `## Level ${levelInfo.level}: ${levelInfo.name}`,
    '',
    levelInfo.description,
    '',
    '### Capabilities',
  ];

  for (const cap of levelInfo.capabilities) {
    lines.push(`- ${cap}`);
  }

  lines.push('');
  lines.push('### Required Tools');

  for (const tool of tools) {
    lines.push(`- **${tool.name}** (${tool.id}): ${tool.cost}`);
  }

  lines.push('');
  lines.push('### Setup');
  lines.push('');
  lines.push('Configure each tool in order:');

  for (const tool of tools) {
    lines.push(`1. \`spawner_setup({ action: "guide", tool: "${tool.id}" })\``);
  }

  return lines.join('\n');
}
