#!/usr/bin/env node

/**
 * Sync skills between spawner-skills repo and spawner-v2/skills
 *
 * Usage:
 *   node scripts/sync-skills.js check     # Check for differences
 *   node scripts/sync-skills.js sync      # Copy missing skills
 *   node scripts/sync-skills.js count     # Just show counts
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths - adjust based on your environment
const SPAWNER_SKILLS_PATH = process.env.SPAWNER_SKILLS_PATH ||
  path.join(process.env.USERPROFILE || process.env.HOME, '.spawner', 'skills');
const SPAWNER_V2_SKILLS_PATH = path.join(__dirname, '..', 'spawner-v2', 'skills');

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m'
};

function findSkills(basePath) {
  const skills = new Set();

  function scan(dir, prefix = '') {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        const subPath = path.join(dir, entry.name);
        const skillPath = prefix ? `${prefix}/${entry.name}` : entry.name;

        // Check if this directory has skill.yaml
        if (fs.existsSync(path.join(subPath, 'skill.yaml'))) {
          skills.add(skillPath);
        } else {
          // Recurse into subdirectory
          scan(subPath, skillPath);
        }
      }
    }
  }

  scan(basePath);
  return skills;
}

function checkSync() {
  console.log(`${COLORS.bright}Checking skill synchronization...${COLORS.reset}\n`);

  if (!fs.existsSync(SPAWNER_SKILLS_PATH)) {
    console.log(`${COLORS.red}spawner-skills not found at: ${SPAWNER_SKILLS_PATH}${COLORS.reset}`);
    console.log(`Install with: npx vibeship-spawner-skills install`);
    process.exit(1);
  }

  if (!fs.existsSync(SPAWNER_V2_SKILLS_PATH)) {
    console.log(`${COLORS.red}spawner-v2/skills not found at: ${SPAWNER_V2_SKILLS_PATH}${COLORS.reset}`);
    process.exit(1);
  }

  const sourceSkills = findSkills(SPAWNER_SKILLS_PATH);
  const targetSkills = findSkills(SPAWNER_V2_SKILLS_PATH);

  console.log(`${COLORS.cyan}Source (spawner-skills):${COLORS.reset} ${sourceSkills.size} skills`);
  console.log(`${COLORS.cyan}Target (spawner-v2):${COLORS.reset}     ${targetSkills.size} skills\n`);

  // Find differences
  const missingInTarget = [...sourceSkills].filter(s => !targetSkills.has(s));
  const missingInSource = [...targetSkills].filter(s => !sourceSkills.has(s));

  if (missingInTarget.length > 0) {
    console.log(`${COLORS.yellow}Missing from spawner-v2 (${missingInTarget.length}):${COLORS.reset}`);
    missingInTarget.forEach(s => console.log(`  - ${s}`));
    console.log();
  }

  if (missingInSource.length > 0) {
    console.log(`${COLORS.yellow}Missing from spawner-skills (${missingInSource.length}):${COLORS.reset}`);
    missingInSource.forEach(s => console.log(`  - ${s}`));
    console.log();
  }

  if (missingInTarget.length === 0 && missingInSource.length === 0) {
    console.log(`${COLORS.green}✓ Skills are in sync!${COLORS.reset}`);
    return { inSync: true, missingInTarget, missingInSource };
  } else {
    console.log(`${COLORS.red}✗ Skills are out of sync${COLORS.reset}`);
    console.log(`Run: node scripts/sync-skills.js sync`);
    return { inSync: false, missingInTarget, missingInSource };
  }
}

function copySkill(skillPath, fromBase, toBase) {
  const sourcePath = path.join(fromBase, skillPath);
  const targetPath = path.join(toBase, skillPath);

  // Ensure parent directory exists
  const targetDir = path.dirname(targetPath);
  fs.mkdirSync(targetDir, { recursive: true });

  // Copy directory recursively
  fs.cpSync(sourcePath, targetPath, { recursive: true });
  console.log(`  ${COLORS.green}✓${COLORS.reset} ${skillPath}`);
}

function syncSkills() {
  console.log(`${COLORS.bright}Syncing skills...${COLORS.reset}\n`);

  const { missingInTarget, missingInSource } = checkSync();
  console.log();

  if (missingInTarget.length > 0) {
    console.log(`${COLORS.cyan}Copying to spawner-v2:${COLORS.reset}`);
    for (const skill of missingInTarget) {
      copySkill(skill, SPAWNER_SKILLS_PATH, SPAWNER_V2_SKILLS_PATH);
    }
    console.log();
  }

  if (missingInSource.length > 0) {
    console.log(`${COLORS.yellow}Note: ${missingInSource.length} skills exist only in spawner-v2${COLORS.reset}`);
    console.log(`These should be added to spawner-skills repo manually.`);
    console.log();
  }

  // Recheck
  const sourceSkills = findSkills(SPAWNER_SKILLS_PATH);
  const targetSkills = findSkills(SPAWNER_V2_SKILLS_PATH);

  console.log(`${COLORS.green}Done! spawner-v2 now has ${targetSkills.size} skills.${COLORS.reset}`);
}

function showCount() {
  console.log(`${COLORS.bright}Skill Counts${COLORS.reset}\n`);

  if (fs.existsSync(SPAWNER_SKILLS_PATH)) {
    const sourceSkills = findSkills(SPAWNER_SKILLS_PATH);
    console.log(`spawner-skills:    ${sourceSkills.size}`);
  } else {
    console.log(`spawner-skills:    not installed`);
  }

  if (fs.existsSync(SPAWNER_V2_SKILLS_PATH)) {
    const targetSkills = findSkills(SPAWNER_V2_SKILLS_PATH);
    console.log(`spawner-v2/skills: ${targetSkills.size}`);
  } else {
    console.log(`spawner-v2/skills: not found`);
  }
}

// Main
const command = process.argv[2] || 'check';

switch (command) {
  case 'check':
    const result = checkSync();
    process.exit(result.inSync ? 0 : 1);
    break;
  case 'sync':
    syncSkills();
    break;
  case 'count':
    showCount();
    break;
  default:
    console.log('Usage: node scripts/sync-skills.js [check|sync|count]');
    process.exit(1);
}
