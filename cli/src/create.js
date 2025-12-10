import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import chalk from 'chalk';
import ora from 'ora';
import { input, select, checkbox } from '@inquirer/prompts';
import { scaffoldProject } from './scaffold.js';
import { fetchGist, parseGistConfig, validateConfig } from './gist.js';
import { runPreflight } from './preflight.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CATALOGS_DIR = path.join(__dirname, '..', '..', 'catalogs');

// Load templates from catalog
const templates = [
  {
    id: 'saas',
    name: 'SaaS',
    description: 'Subscription products',
    agents: ['planner', 'frontend', 'backend', 'database', 'testing'],
    mcps: ['filesystem', 'supabase', 'stripe']
  },
  {
    id: 'marketplace',
    name: 'Marketplace',
    description: 'Buy/sell platforms',
    agents: ['planner', 'frontend', 'backend', 'database', 'payments', 'search'],
    mcps: ['filesystem', 'supabase', 'stripe', 'algolia']
  },
  {
    id: 'ai-app',
    name: 'AI App',
    description: 'LLM-powered apps',
    agents: ['planner', 'frontend', 'backend', 'database', 'ai'],
    mcps: ['filesystem', 'supabase', 'anthropic']
  },
  {
    id: 'web3',
    name: 'Web3 dApp',
    description: 'Blockchain apps',
    agents: ['planner', 'frontend', 'smart-contracts', 'testing'],
    mcps: ['filesystem', 'git', 'foundry']
  },
  {
    id: 'tool',
    name: 'Tool/CLI',
    description: 'Utilities and CLIs',
    agents: ['planner', 'backend', 'testing'],
    mcps: ['filesystem', 'git']
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Configure in browser',
    agents: ['planner'],
    mcps: ['filesystem'],
    openBrowser: true
  }
];

// Load agents catalog
async function loadAgentsCatalog() {
  try {
    const content = await fs.readFile(path.join(CATALOGS_DIR, 'agents.json'), 'utf-8');
    return JSON.parse(content).agents;
  } catch {
    // Fallback to basic list if catalog not found
    return [
      { id: 'planner', name: 'Planner', alwaysIncluded: true },
      { id: 'frontend', name: 'Frontend' },
      { id: 'backend', name: 'Backend' },
      { id: 'database', name: 'Database' },
      { id: 'testing', name: 'Testing' },
      { id: 'devops', name: 'DevOps' },
      { id: 'payments', name: 'Payments' },
      { id: 'email', name: 'Email' },
      { id: 'search', name: 'Search' },
      { id: 'ai', name: 'AI' },
      { id: 'smart-contracts', name: 'Smart Contracts' }
    ];
  }
}

export async function create(gistIdOrOptions, options = {}) {
  console.log('');
  console.log(chalk.dim('  vibeship crew'));
  console.log(chalk.dim('  "You vibe. It ships."'));
  console.log('');

  // If gist ID provided, use the existing init flow
  if (typeof gistIdOrOptions === 'string' && !gistIdOrOptions.startsWith('-')) {
    return createFromGist(gistIdOrOptions, options);
  }

  // Merge options if first arg was options object
  if (typeof gistIdOrOptions === 'object') {
    options = { ...gistIdOrOptions, ...options };
  }

  // Quick mode with flags
  if (options.template && options.name) {
    return createFromFlags(options);
  }

  // Interactive mode
  return createInteractive(options);
}

async function createFromGist(gistId, options) {
  const spinner = ora();

  try {
    // Run pre-flight checks first
    const preflightOk = await runPreflight();
    if (!preflightOk) {
      console.log('');
      console.log(chalk.yellow('  Fix the issues above before continuing.'));
      console.log(chalk.dim('  Run `npx vibeship-crew doctor` for more details.'));
      console.log('');
      process.exit(1);
    }

    spinner.start('Fetching config from GitHub Gist...');
    const gist = await fetchGist(gistId);
    const config = parseGistConfig(gist);
    spinner.succeed('Config fetched successfully');

    // Determine target directory
    const targetDir = options.dir || config.project_name;
    const absoluteTarget = path.resolve(process.cwd(), targetDir);

    // Check if directory already exists
    try {
      await fs.access(absoluteTarget);
      spinner.fail(`Directory already exists: ${targetDir}`);
      console.log(chalk.yellow('  Use --dir to specify a different directory'));
      process.exit(1);
    } catch {
      // Directory doesn't exist, good to proceed
    }

    // Show what we're building
    showProjectSummary(config);

    // Scaffold the project
    spinner.start('Scaffolding project...');
    await scaffoldProject(config, absoluteTarget);
    spinner.succeed('Project scaffolded');

    // Show next steps
    showNextSteps(targetDir, config.project_name);

  } catch (error) {
    spinner.fail('Failed to create project');
    console.log('');
    console.log(chalk.red(`  Error: ${error.message}`));
    console.log('');
    process.exit(1);
  }
}

async function createFromFlags(options) {
  const spinner = ora();

  // Run pre-flight checks first
  const preflightOk = await runPreflight();
  if (!preflightOk) {
    console.log('');
    console.log(chalk.yellow('  Fix the issues above before continuing.'));
    console.log('');
    process.exit(1);
  }

  const template = templates.find(t => t.id === options.template);
  if (!template) {
    console.log(chalk.red(`  Unknown template: ${options.template}`));
    console.log(chalk.dim(`  Available: ${templates.map(t => t.id).join(', ')}`));
    process.exit(1);
  }

  const config = {
    project_name: options.name,
    description: options.description || '',
    agents: template.agents,
    mcps: template.mcps,
    behaviors: {
      mandatory: ['verify-before-complete', 'follow-architecture', 'maintainable-code', 'secure-code'],
      selected: ['tdd-mode']
    }
  };

  const targetDir = options.dir || config.project_name;
  const absoluteTarget = path.resolve(process.cwd(), targetDir);

  // Check if directory already exists
  try {
    await fs.access(absoluteTarget);
    console.log(chalk.red(`  Directory already exists: ${targetDir}`));
    console.log(chalk.yellow('  Use --dir to specify a different directory'));
    process.exit(1);
  } catch {
    // Directory doesn't exist, good to proceed
  }

  showProjectSummary(config);

  spinner.start('Scaffolding project...');
  await scaffoldProject(config, absoluteTarget);
  spinner.succeed('Project scaffolded');

  showNextSteps(targetDir, config.project_name);
}

async function createInteractive(options) {
  // Run pre-flight checks first
  const preflightOk = await runPreflight();
  if (!preflightOk) {
    console.log('');
    console.log(chalk.yellow('  Fix the issues above before continuing.'));
    console.log(chalk.dim('  Or continue anyway if you know what you\'re doing.'));
    console.log('');

    const continueAnyway = await select({
      message: 'Continue anyway?',
      choices: [
        { name: 'No, I\'ll fix the issues first', value: false },
        { name: 'Yes, continue anyway', value: true }
      ]
    });

    if (!continueAnyway) {
      process.exit(1);
    }
    console.log('');
  }

  const spinner = ora();
  const agents = await loadAgentsCatalog();

  // Step 1: Project name
  const projectName = await input({
    message: 'Project name:',
    default: 'my-project',
    validate: (value) => {
      if (!value.trim()) return 'Project name is required';
      if (!/^[a-z0-9-]+$/i.test(value)) return 'Use only letters, numbers, and hyphens';
      return true;
    }
  });

  // Step 2: Template selection
  const templateChoices = templates.map(t => ({
    name: `${t.name} - ${t.description} (${t.agents.join(', ')})`,
    value: t.id
  }));

  const selectedTemplateId = await select({
    message: 'Choose a starting point:',
    choices: templateChoices
  });

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  // If custom, open browser (TODO: implement browser flow)
  if (selectedTemplate.openBrowser) {
    console.log('');
    console.log(chalk.cyan('  Opening browser for full customization...'));
    console.log(chalk.dim('  Configure your stack at: https://vibeship.dev'));
    console.log('');
    console.log(chalk.dim('  After configuring, run:'));
    console.log(chalk.cyan('  npx vibeship-crew create <gist-id>'));
    console.log('');
    // TODO: Actually open browser and wait for config
    process.exit(0);
  }

  // Step 3: Agent customization
  let selectedAgents = [...selectedTemplate.agents];

  const availableAgents = agents
    .filter(a => !selectedAgents.includes(a.id) && !a.alwaysIncluded)
    .map(a => ({ name: a.name, value: a.id }));

  console.log('');
  console.log(chalk.dim(`  Your crew: ${selectedAgents.join(', ')}`));

  if (availableAgents.length > 0) {
    const addMore = await select({
      message: 'Add more agents?',
      choices: [
        { name: 'No, this looks good', value: 'none' },
        { name: 'Yes, let me add some', value: 'add' }
      ]
    });

    if (addMore === 'add') {
      const additions = await checkbox({
        message: 'Select agents to add:',
        choices: availableAgents
      });

      selectedAgents = [...selectedAgents, ...additions];
    }
  }

  // Build config
  const config = {
    project_name: projectName,
    description: '',
    agents: selectedAgents,
    mcps: selectedTemplate.mcps,
    behaviors: {
      mandatory: ['verify-before-complete', 'follow-architecture', 'maintainable-code', 'secure-code'],
      selected: ['tdd-mode']
    }
  };

  // Check target directory
  const targetDir = options.dir || projectName;
  const absoluteTarget = path.resolve(process.cwd(), targetDir);

  try {
    await fs.access(absoluteTarget);
    console.log('');
    console.log(chalk.red(`  Directory already exists: ${targetDir}`));
    console.log(chalk.yellow('  Use --dir to specify a different directory'));
    process.exit(1);
  } catch {
    // Directory doesn't exist, good to proceed
  }

  console.log('');
  showProjectSummary(config);

  // Scaffold
  spinner.start('Scaffolding project...');
  await scaffoldProject(config, absoluteTarget);
  spinner.succeed('Project scaffolded');

  showNextSteps(targetDir, config.project_name);
}

function showProjectSummary(config) {
  console.log('');
  console.log(chalk.bold('  Project:'), config.project_name);
  console.log(chalk.bold('  Agents:'), config.agents.join(', '));
  console.log(chalk.bold('  MCPs:'), config.mcps.join(', '));
  console.log('');
}

function showNextSteps(targetDir, projectName) {
  console.log('');
  console.log(chalk.green.bold('  Ready to build!'));
  console.log('');
  console.log('  This created a folder called', chalk.cyan(`"${projectName}"`));
  console.log('');
  console.log(chalk.bold('  Next steps:'));
  console.log('');
  console.log('  1. Open your IDE (VS Code, Cursor, etc.)');
  console.log(`  2. File → Open Folder → select ${chalk.cyan(`"${projectName}"`)}`);
  console.log(`     ${chalk.dim(`(it's in: ${path.resolve(process.cwd(), targetDir)})`)}`);
  console.log('  3. Open terminal in your IDE: View → Terminal');
  console.log(`  4. Type ${chalk.cyan('claude')} and press Enter`);
  console.log('  5. Claude greets you and starts building!');
  console.log('');
}
