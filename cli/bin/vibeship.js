#!/usr/bin/env node

import { program } from 'commander';
import { init } from '../src/init.js';
import { create } from '../src/create.js';
import { doctor } from '../src/doctor.js';

program
  .name('vibeship-orchestrator')
  .description('CLI for vibeship orchestrator - scaffold projects from your stack config')
  .version('1.0.0');

// Primary command: create
program
  .command('create [gist-id]')
  .description('Create a new project (interactive or from gist)')
  .option('-t, --template <template>', 'Use template directly (saas, marketplace, ai-app, web3, tool)')
  .option('-n, --name <name>', 'Project name')
  .option('-d, --dir <directory>', 'Target directory (default: project name)')
  .option('--description <desc>', 'Project description')
  .action(async (gistId, options) => {
    if (gistId) {
      await create(gistId, options);
    } else {
      await create(options);
    }
  });

// Legacy command: init (alias for create with gist)
program
  .command('init <gist-id>')
  .description('Initialize from a GitHub Gist config (alias for create)')
  .option('-d, --dir <directory>', 'Target directory (default: project name from config)')
  .option('--local <file>', 'Use local config file instead of gist')
  .action(async (gistId, options) => {
    await init(gistId, options);
  });

// Doctor command
program
  .command('doctor')
  .description('Check your environment for required dependencies')
  .action(async () => {
    await doctor();
  });

program.parse();
