import { execSync } from 'child_process';
import chalk from 'chalk';

/**
 * Run pre-flight checks before scaffolding
 * Returns true if all critical checks pass, false otherwise
 */
export async function runPreflight() {
  console.log(chalk.dim('  Pre-flight check:'));

  const checks = [
    { name: 'Node.js >= 18', check: checkNode, critical: true },
    { name: 'Claude CLI', check: checkClaude, critical: true },
  ];

  let allPassed = true;

  for (const { name, check, critical } of checks) {
    const result = await check();
    if (result.ok) {
      console.log(chalk.green('  ✓'), name, chalk.dim(result.version || ''));
    } else {
      console.log(chalk.red('  ✗'), name);
      console.log(chalk.dim(`    ${result.message}`));
      if (critical) {
        allPassed = false;
      }
    }
  }

  console.log('');
  return allPassed;
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
      message: `Found ${version}, need >= 18.0.0\n    Download: https://nodejs.org`
    };
  } catch {
    return {
      ok: false,
      message: 'Node.js not found\n    Download: https://nodejs.org'
    };
  }
}

function checkClaude() {
  try {
    const output = execSync('claude --version', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'pipe']
    });
    const version = output.trim();
    return { ok: true, version };
  } catch {
    return {
      ok: false,
      message: 'Claude CLI not found\n    Install: npm install -g @anthropic-ai/claude-code'
    };
  }
}
