#!/usr/bin/env node

/**
 * Skill Finder - Query the skill registry
 *
 * Usage:
 *   node find-skill.js <query>           Search by keyword/tag
 *   node find-skill.js --tag <tag>       Find skills with specific tag
 *   node find-skill.js --squad <name>    Get squad configuration
 *   node find-skill.js --layer <1|2|3>   List skills in layer
 *   node find-skill.js --list            List all skills
 *   node find-skill.js --triggers        Show all trigger phrases
 */

const fs = require('fs');
const path = require('path');

const registryPath = path.join(__dirname, '..', 'skills', 'registry.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'));

const args = process.argv.slice(2);

function printSkill(skill) {
  console.log(`\n  ${skill.name} (Layer ${skill.layer})`);
  console.log(`  └─ ${skill.description}`);
  console.log(`     Tags: ${skill.tags.join(', ')}`);
  console.log(`     Pairs with: ${skill.pairs_with.join(', ')}`);
}

function searchSkills(query) {
  const q = query.toLowerCase();
  const results = registry.specialists.filter(s =>
    s.name.includes(q) ||
    s.description.toLowerCase().includes(q) ||
    s.tags.some(t => t.includes(q)) ||
    s.triggers.some(t => t.toLowerCase().includes(q))
  );

  if (results.length === 0) {
    console.log(`No skills found matching "${query}"`);
    return;
  }

  console.log(`\nFound ${results.length} skill(s) matching "${query}":`);
  results.forEach(printSkill);
}

function findByTag(tag) {
  const skills = registry.tag_index[tag.toLowerCase()];
  if (!skills || skills.length === 0) {
    console.log(`No skills with tag "${tag}"`);
    console.log('\nAvailable tags:', Object.keys(registry.tag_index).join(', '));
    return;
  }

  console.log(`\nSkills with tag "${tag}":`);
  skills.forEach(name => {
    const skill = registry.specialists.find(s => s.name === name);
    if (skill) printSkill(skill);
  });
}

function showSquad(squadName) {
  const squad = registry.squads[squadName];
  if (!squad) {
    console.log(`Squad "${squadName}" not found`);
    console.log('\nAvailable squads:', Object.keys(registry.squads).join(', '));
    return;
  }

  console.log(`\n${squadName}: ${squad.description}`);
  console.log(`\n  Lead: ${squad.lead}`);
  console.log(`  Support: ${squad.support.join(', ')}`);
  if (squad.on_call) {
    console.log(`  On-call: ${squad.on_call.join(', ')}`);
  }

  console.log('\n  Full squad configuration:');
  [squad.lead, ...squad.support].forEach(name => {
    const skill = registry.specialists.find(s => s.name === name);
    if (skill) printSkill(skill);
  });
}

function showLayer(layerNum) {
  const layer = registry.layers[layerNum];
  if (!layer) {
    console.log('Invalid layer. Use 1, 2, or 3');
    return;
  }

  console.log(`\nLayer ${layerNum}: ${layer.name}`);
  console.log(`${layer.description}\n`);

  layer.specialists.forEach(name => {
    const skill = registry.specialists.find(s => s.name === name);
    if (skill) printSkill(skill);
  });
}

function listAll() {
  console.log(`\nSkill Registry v${registry.version}`);
  console.log(`${registry.specialists.length} specialists\n`);

  [1, 2, 3].forEach(layerNum => {
    const layer = registry.layers[layerNum];
    console.log(`\n── Layer ${layerNum}: ${layer.name} ──`);
    console.log(`   ${layer.description}\n`);
    layer.specialists.forEach(name => {
      const skill = registry.specialists.find(s => s.name === name);
      if (skill) {
        console.log(`   ${skill.name}`);
        console.log(`   └─ ${skill.tags.join(', ')}`);
      }
    });
  });

  console.log('\n── Pre-configured Squads ──\n');
  Object.entries(registry.squads).forEach(([name, squad]) => {
    console.log(`   ${name}: ${squad.description}`);
  });
}

function showTriggers() {
  console.log('\nTrigger phrases by skill:\n');
  registry.specialists.forEach(skill => {
    console.log(`${skill.name}:`);
    skill.triggers.forEach(t => console.log(`  - "${t}"`));
    console.log();
  });
}

// Main
if (args.length === 0) {
  console.log('Usage: node find-skill.js <query|--tag|--squad|--layer|--list|--triggers>');
  process.exit(0);
}

if (args[0] === '--tag' && args[1]) {
  findByTag(args[1]);
} else if (args[0] === '--squad' && args[1]) {
  showSquad(args[1]);
} else if (args[0] === '--layer' && args[1]) {
  showLayer(args[1]);
} else if (args[0] === '--list') {
  listAll();
} else if (args[0] === '--triggers') {
  showTriggers();
} else {
  searchSkills(args.join(' '));
}
