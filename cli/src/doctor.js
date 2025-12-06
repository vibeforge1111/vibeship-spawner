import { execSync } from 'child_process';
import chalk from 'chalk';

export async function doctor() {
  console.log('');
  console.log(chalk.dim('  VibeShip Doctor'));
  console.log(chalk.dim('  Checking your environment...'));
  console.log('');

  const checks = [
    { name: 'Node.js >= 18', check: checkNode },
    { name: 'Claude Code CLI', check: checkClaude },
    { name: 'Git', check: checkGit },
  ];

  let allPassed = true;

  for (const { name, check } of checks) {
    const result = await check();
    if (result.ok) {
      console.log(chalk.green('  ✓'), name, chalk.dim(result.version || ''));
    } else {
      console.log(chalk.red('  ✗'), name);
      console.log(chalk.yellow(`    ${result.message}`));
      allPassed = false;
    }
  }

  console.log('');

  if (allPassed) {
    console.log(chalk.green.bold('  All checks passed!'));
    console.log(chalk.dim('  You\'re ready to use VibeShip.'));
  } else {
    console.log(chalk.yellow.bold('  Some checks failed.'));
    console.log(chalk.dim('  Fix the issues above and run `vibeship doctor` again.'));
  }

  console.log('');
}

function checkNode() {
  try {
    const version = process.version;
    const major = parseInt(version.slice(1).split('.')[0], 10);
    if (major >= 18) {
      return { ok: true, version };
    }
    return {
      ok: false,
      message: `Found ${version}, need >= 18.0.0. Upgrade at https://nodejs.org`
    };
  } catch {
    return { ok: false, message: 'Node.js not found' };
  }
}

function checkClaude() {
  try {
    const output = execSync('claude --version', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
    const version = output.trim();
    return { ok: true, version };
  } catch {
    return {
      ok: false,
      message: 'Claude Code CLI not found. Install: npm install -g @anthropic-ai/claude-code'
    };
  }
}

function checkGit() {
  try {
    const output = execSync('git --version', { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] });
    const version = output.trim().replace('git version ', '');
    return { ok: true, version };
  } catch {
    return {
      ok: false,
      message: 'Git not found. Install from https://git-scm.com'
    };
  }
}
