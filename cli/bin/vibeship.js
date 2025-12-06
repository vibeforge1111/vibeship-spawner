#!/usr/bin/env node

import { program } from 'commander';
import { init } from '../src/init.js';
import { doctor } from '../src/doctor.js';

program
  .name('vibeship')
  .description('CLI for VibeShip Orchestrator - scaffold projects from your stack config')
  .version('1.0.0');

program
  .command('init <gist-id>')
  .description('Initialize a new project from a GitHub Gist config')
  .option('-d, --dir <directory>', 'Target directory (default: project name from config)')
  .option('--local <file>', 'Use local config file instead of gist')
  .action(async (gistId, options) => {
    await init(gistId, options);
  });

program
  .command('doctor')
  .description('Check your environment for required dependencies')
  .action(async () => {
    await doctor();
  });

program.parse();
