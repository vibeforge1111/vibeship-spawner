#!/usr/bin/env node

/**
 * Upload Skills to KV (V2)
 *
 * Reads skills from the new YAML format structure:
 *   skills/
 *     core/
 *       skill-id/
 *         skill.yaml
 *         sharp-edges.yaml
 *         validations.yaml
 *     integration/
 *       skill-id/
 *         ...
 *
 * Usage:
 *   node scripts/upload-skills.js --local  # Upload to local dev
 *   node scripts/upload-skills.js          # Upload to production
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';
import { parse as parseYaml } from 'yaml';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isLocal = process.argv.includes('--local');

// Paths
const SKILLS_DIR = path.join(__dirname, '..', 'skills');
const SKILL_LAYERS = ['core', 'integration', 'pattern'];

/**
 * Upload a key-value pair to KV
 */
async function uploadToKV(binding, key, value) {
  const valueStr = typeof value === 'string' ? value : JSON.stringify(value, null, 2);

  // Write value to temp file to handle escaping
  const tempFile = path.join(__dirname, '.temp-kv-value');
  await fs.writeFile(tempFile, valueStr);

  try {
    // For local dev, use --binding flag; for production, use --namespace-id
    const namespaceArg = isLocal
      ? `--binding=${binding}`
      : `--namespace-id=${process.env[`${binding}_KV_ID`] || binding}`;
    const localFlag = isLocal ? '--local' : '';

    const cmd = `npx wrangler kv:key put ${namespaceArg} "${key}" --path="${tempFile}" ${localFlag}`;
    await execAsync(cmd, { cwd: path.join(__dirname, '..') });
    console.log(`  ✓ ${key}`);
  } finally {
    await fs.unlink(tempFile).catch(() => {});
  }
}

/**
 * Read and parse a YAML file
 */
async function readYaml(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return parseYaml(content);
  } catch {
    return null;
  }
}

/**
 * Discover all skills from the directory structure
 */
async function discoverSkills() {
  const skills = [];

  for (const layer of SKILL_LAYERS) {
    const layerPath = path.join(SKILLS_DIR, layer);

    try {
      const entries = await fs.readdir(layerPath, { withFileTypes: true });

      for (const entry of entries) {
        if (!entry.isDirectory()) continue;

        const skillPath = path.join(layerPath, entry.name);
        const skillYamlPath = path.join(skillPath, 'skill.yaml');

        const skill = await readYaml(skillYamlPath);
        if (skill) {
          skills.push({
            ...skill,
            layer_name: layer,
            dir: skillPath,
          });
        }
      }
    } catch {
      // Layer directory doesn't exist
      console.log(`  (no ${layer}/ directory)`);
    }
  }

  return skills;
}

/**
 * Load sharp edges for a skill
 */
async function loadSharpEdges(skillDir) {
  const edgesPath = path.join(skillDir, 'sharp-edges.yaml');
  const data = await readYaml(edgesPath);
  return data?.sharp_edges || [];
}

/**
 * Load validations for a skill
 */
async function loadValidations(skillDir) {
  const validationsPath = path.join(skillDir, 'validations.yaml');
  const data = await readYaml(validationsPath);
  return data?.validations || [];
}

/**
 * Build the skill index for fast lookup
 */
function buildSkillIndex(skills) {
  return {
    version: '2.0.0',
    updated_at: new Date().toISOString(),
    total: skills.length,
    by_layer: {
      core: skills.filter(s => s.layer === 1).map(s => s.id),
      integration: skills.filter(s => s.layer === 2).map(s => s.id),
      pattern: skills.filter(s => s.layer === 3).map(s => s.id),
    },
    skills: skills.map(s => ({
      id: s.id,
      name: s.name,
      layer: s.layer,
      owns: s.owns || [],
      tags: s.tags || [],
      triggers: s.triggers || [],
    })),
  };
}

/**
 * Build edge index grouped by skill
 */
function buildEdgeIndex(allEdges) {
  const bySkill = {};
  const bySeverity = {
    critical: [],
    high: [],
    medium: [],
    low: [],
  };

  for (const edge of allEdges) {
    // Group by skill
    if (!bySkill[edge.skill_id]) {
      bySkill[edge.skill_id] = [];
    }
    bySkill[edge.skill_id].push(edge.id);

    // Group by severity
    if (bySeverity[edge.severity]) {
      bySeverity[edge.severity].push(edge.id);
    }
  }

  return {
    version: '2.0.0',
    updated_at: new Date().toISOString(),
    total: allEdges.length,
    by_skill: bySkill,
    by_severity: bySeverity,
    all_ids: allEdges.map(e => e.id),
  };
}

/**
 * Main upload function
 */
async function main() {
  console.log(`\n📦 Uploading skills to KV (${isLocal ? 'local' : 'production'})...\n`);

  // Discover all skills
  console.log('🔍 Discovering skills...');
  const skills = await discoverSkills();
  console.log(`   Found ${skills.length} skills\n`);

  if (skills.length === 0) {
    console.log('⚠️  No skills found. Make sure skills/ directory has the correct structure.');
    return;
  }

  // For local dev, we use the namespace binding name
  // In production, replace with actual namespace IDs from wrangler.toml
  const SKILLS_NS = isLocal ? 'SKILLS' : process.env.SKILLS_KV_ID || 'SKILLS';
  const EDGES_NS = isLocal ? 'SHARP_EDGES' : process.env.EDGES_KV_ID || 'SHARP_EDGES';

  // Collect all edges for the index
  const allEdges = [];
  const allValidations = [];

  // Upload each skill
  console.log('📤 Uploading skills...\n');
  for (const skill of skills) {
    console.log(`  ${skill.name} (${skill.id}):`);

    // Load sharp edges
    const edges = await loadSharpEdges(skill.dir);
    const validations = await loadValidations(skill.dir);

    // Tag edges with skill_id
    const taggedEdges = edges.map(e => ({ ...e, skill_id: skill.id }));
    allEdges.push(...taggedEdges);

    // Tag validations with skill_id
    const taggedValidations = validations.map(v => ({ ...v, skill_id: skill.id }));
    allValidations.push(...taggedValidations);

    // Prepare skill data for KV (without dir)
    const { dir, layer_name, ...skillData } = skill;

    // Upload skill definition
    await uploadToKV(SKILLS_NS, `skill:${skill.id}`, {
      ...skillData,
      sharp_edges_count: edges.length,
      validations_count: validations.length,
    });

    // Upload skill's sharp edges
    if (edges.length > 0) {
      await uploadToKV(EDGES_NS, `edges:${skill.id}`, taggedEdges);
    }

    // Upload skill's validations
    if (validations.length > 0) {
      await uploadToKV(SKILLS_NS, `validations:${skill.id}`, taggedValidations);
    }

    console.log(`     ${edges.length} edges, ${validations.length} validations\n`);
  }

  // Upload skill index
  console.log('📋 Uploading skill index...');
  const skillIndex = buildSkillIndex(skills);
  await uploadToKV(SKILLS_NS, 'skill_index', skillIndex);

  // Upload edge index
  console.log('\n📋 Uploading edge index...');
  const edgeIndex = buildEdgeIndex(allEdges);
  await uploadToKV(EDGES_NS, 'edge_index', edgeIndex);

  // Upload all edges (for search)
  console.log('\n📋 Uploading all edges...');
  await uploadToKV(EDGES_NS, 'all_edges', allEdges);

  // Upload all validations
  console.log('\n📋 Uploading all validations...');
  await uploadToKV(SKILLS_NS, 'all_validations', allValidations);

  // Summary
  console.log('\n✅ Done!\n');
  console.log(`   Skills: ${skills.length}`);
  console.log(`   Sharp Edges: ${allEdges.length}`);
  console.log(`   Validations: ${allValidations.length}`);
  console.log('');
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
