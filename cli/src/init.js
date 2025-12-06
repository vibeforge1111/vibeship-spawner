import fs from 'fs/promises';
import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { fetchGist, parseGistConfig, validateConfig } from './gist.js';
import { scaffoldProject } from './scaffold.js';

export async function init(gistIdOrFile, options = {}) {
  console.log('');
  console.log(chalk.dim('  VibeShip Orchestrator'));
  console.log(chalk.dim('  "You vibe. It ships."'));
  console.log('');

  let config;
  const spinner = ora();

  try {
    // Load config from gist or local file
    if (options.local) {
      spinner.start('Reading local config...');
      const content = await fs.readFile(options.local, 'utf-8');
      config = validateConfig(JSON.parse(content));
      spinner.succeed('Config loaded from local file');
    } else {
      spinner.start('Fetching config from GitHub Gist...');
      const gist = await fetchGist(gistIdOrFile);
      config = parseGistConfig(gist);
      spinner.succeed('Config fetched successfully');
    }

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
    console.log('');
    console.log(chalk.bold('  Project:'), config.project_name);
    console.log(chalk.bold('  Agents:'), config.agents.join(', '));
    console.log(chalk.bold('  MCPs:'), config.mcps.join(', '));
    if (config.custom_skills_needed?.length) {
      console.log(chalk.bold('  Custom skills:'), config.custom_skills_needed.join(', '));
    }
    console.log('');

    // Scaffold the project
    spinner.start('Scaffolding project...');
    await scaffoldProject(config, absoluteTarget);
    spinner.succeed('Project scaffolded');

    // Check for custom skills needed
    if (config.custom_skills_needed?.length) {
      console.log('');
      console.log(chalk.yellow('  Note: Custom skills will be generated when you start Claude:'));
      config.custom_skills_needed.forEach(skill => {
        console.log(chalk.yellow(`    - ${skill}`));
      });
    }

    // Success message
    console.log('');
    console.log(chalk.green.bold('  Ready to build!'));
    console.log('');
    console.log('  Next steps:');
    console.log(chalk.cyan(`    cd ${targetDir}`));
    console.log(chalk.cyan('    claude'));
    console.log('');

  } catch (error) {
    spinner.fail('Failed to initialize project');
    console.log('');
    console.log(chalk.red(`  Error: ${error.message}`));
    console.log('');
    process.exit(1);
  }
}
