#!/usr/bin/env node

/**
 * Upload V1 Skills to Cloudflare KV
 *
 * This script uploads:
 * 1. The V1 registry.json as v1:registry
 * 2. Each specialist skill markdown file as v1:skill:{name}
 *
 * Usage: node scripts/upload-v1-skills.js [--local]
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Paths
const SKILLS_DIR = path.join(__dirname, '..', '..', 'skills');
const REGISTRY_PATH = path.join(SKILLS_DIR, 'registry.json');
const SPECIALISTS_DIR = path.join(SKILLS_DIR, 'specialists');

// KV namespace (from wrangler.toml)
const KV_NAMESPACE = 'SKILLS';

// Check if running locally
const isLocal = process.argv.includes('--local');
const kvFlag = isLocal ? '--local' : '';

console.log(`Uploading V1 skills to KV ${isLocal ? '(local)' : '(production)'}...\n`);

// 1. Upload registry.json
console.log('1. Uploading V1 registry...');
try {
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
  const registryJson = JSON.stringify(registry);

  // Write to temp file for wrangler
  const tempFile = path.join(__dirname, 'temp-registry.json');
  fs.writeFileSync(tempFile, registryJson);

  execSync(
    `npx wrangler kv:key put "v1:registry" --path="${tempFile}" --binding=${KV_NAMESPACE} ${kvFlag}`,
    { cwd: path.join(__dirname, '..'), stdio: 'inherit' }
  );

  fs.unlinkSync(tempFile);
  console.log(`   ✓ Uploaded registry with ${registry.specialists.length} specialists\n`);
} catch (error) {
  console.error(`   ✗ Failed to upload registry: ${error.message}\n`);
  process.exit(1);
}

// 2. Upload each specialist skill
console.log('2. Uploading specialist skills...');
try {
  const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
  let uploaded = 0;
  let failed = 0;

  for (const specialist of registry.specialists) {
    const skillPath = path.join(SKILLS_DIR, specialist.path);

    if (!fs.existsSync(skillPath)) {
      console.log(`   ⚠ Skill file not found: ${specialist.path}`);
      failed++;
      continue;
    }

    const content = fs.readFileSync(skillPath, 'utf-8');
    const tempFile = path.join(__dirname, `temp-skill-${specialist.name}.md`);
    fs.writeFileSync(tempFile, content);

    try {
      execSync(
        `npx wrangler kv:key put "v1:skill:${specialist.name}" --path="${tempFile}" --binding=${KV_NAMESPACE} ${kvFlag}`,
        { cwd: path.join(__dirname, '..'), stdio: 'pipe' }
      );
      console.log(`   ✓ ${specialist.name}`);
      uploaded++;
    } catch (err) {
      console.log(`   ✗ ${specialist.name}: ${err.message}`);
      failed++;
    }

    fs.unlinkSync(tempFile);
  }

  console.log(`\n   Uploaded: ${uploaded}, Failed: ${failed}\n`);
} catch (error) {
  console.error(`   ✗ Failed to upload skills: ${error.message}\n`);
  process.exit(1);
}

// 3. Create V2 skills index (for unified search)
console.log('3. Creating V2 skills index...');
try {
  // Read existing V2 skills from the skills directory
  const v2SkillsDir = path.join(__dirname, '..', 'skills');
  const v2Index = [];

  // Check core skills
  const coreDir = path.join(v2SkillsDir, 'core');
  if (fs.existsSync(coreDir)) {
    for (const skillDir of fs.readdirSync(coreDir)) {
      const skillYaml = path.join(coreDir, skillDir, 'skill.yaml');
      if (fs.existsSync(skillYaml)) {
        v2Index.push({
          id: skillDir,
          name: skillDir,
          description: `V2 skill: ${skillDir}`,
          layer: 1,
          tags: [],
          owns: [],
          pairs_with: [],
          triggers: [],
          has_validations: fs.existsSync(path.join(coreDir, skillDir, 'validations.yaml')),
          has_sharp_edges: fs.existsSync(path.join(coreDir, skillDir, 'sharp-edges.yaml')),
        });
      }
    }
  }

  // Check integration skills
  const integrationDir = path.join(v2SkillsDir, 'integration');
  if (fs.existsSync(integrationDir)) {
    for (const skillDir of fs.readdirSync(integrationDir)) {
      const skillYaml = path.join(integrationDir, skillDir, 'skill.yaml');
      if (fs.existsSync(skillYaml)) {
        v2Index.push({
          id: skillDir,
          name: skillDir,
          description: `V2 skill: ${skillDir}`,
          layer: 2,
          tags: [],
          owns: [],
          pairs_with: [],
          triggers: [],
          has_validations: fs.existsSync(path.join(integrationDir, skillDir, 'validations.yaml')),
          has_sharp_edges: fs.existsSync(path.join(integrationDir, skillDir, 'sharp-edges.yaml')),
        });
      }
    }
  }

  const indexJson = JSON.stringify(v2Index);
  const tempFile = path.join(__dirname, 'temp-v2-index.json');
  fs.writeFileSync(tempFile, indexJson);

  execSync(
    `npx wrangler kv:key put "v2:index" --path="${tempFile}" --binding=${KV_NAMESPACE} ${kvFlag}`,
    { cwd: path.join(__dirname, '..'), stdio: 'inherit' }
  );

  fs.unlinkSync(tempFile);
  console.log(`   ✓ Created V2 index with ${v2Index.length} skills\n`);
} catch (error) {
  console.error(`   ✗ Failed to create V2 index: ${error.message}\n`);
}

console.log('Done!');
