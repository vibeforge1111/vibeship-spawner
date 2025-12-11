#!/usr/bin/env node

/**
 * Upload Skills to KV
 *
 * This script reads the skill registry from the V1 skills directory
 * and uploads it to Cloudflare KV for V2 to consume.
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

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isLocal = process.argv.includes('--local');

// Paths
const REGISTRY_PATH = path.join(__dirname, '..', '..', 'skills', 'registry.json');
const SKILLS_DIR = path.join(__dirname, '..', '..', 'skills');

/**
 * Upload a key-value pair to KV
 */
async function uploadToKV(namespace, key, value) {
  const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
  const localFlag = isLocal ? '--local' : '';

  // Write value to temp file to handle escaping
  const tempFile = path.join(__dirname, '.temp-kv-value');
  await fs.writeFile(tempFile, valueStr);

  try {
    const cmd = `wrangler kv:key put --namespace-id=${namespace} "${key}" --path="${tempFile}" ${localFlag}`;
    await execAsync(cmd, { cwd: path.join(__dirname, '..') });
    console.log(`  + ${key}`);
  } finally {
    await fs.unlink(tempFile).catch(() => {});
  }
}

/**
 * Read and parse the skill registry
 */
async function loadRegistry() {
  const content = await fs.readFile(REGISTRY_PATH, 'utf-8');
  return JSON.parse(content);
}

/**
 * Read a skill file
 */
async function readSkillFile(skillPath) {
  const fullPath = path.join(SKILLS_DIR, skillPath);
  try {
    return await fs.readFile(fullPath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * Main upload function
 */
async function main() {
  console.log(`Uploading skills to KV (${isLocal ? 'local' : 'production'})...\\n`);

  // Load registry
  const registry = await loadRegistry();
  console.log(`Found ${registry.specialists.length} skills in registry\\n`);

  // For local dev, we'll create the namespace if it doesn't exist
  // In production, the namespace ID comes from wrangler.toml
  const SKILLS_NS = 'SKILLS';  // Replace with actual namespace ID for production

  console.log('Uploading skill index...');
  await uploadToKV(SKILLS_NS, 'skill_index', registry);

  console.log('\\nUploading individual skills...');
  for (const skill of registry.specialists) {
    console.log(`\\n${skill.name}:`);

    // Upload skill definition
    await uploadToKV(SKILLS_NS, `skill:${skill.id}`, skill);

    // Upload skill content
    const content = await readSkillFile(skill.path);
    if (content) {
      await uploadToKV(SKILLS_NS, `skill:${skill.id}:content`, content);
    }
  }

  // Upload sharp edges by stack
  console.log('\\nBuilding sharp edges index...');
  const edgesByStack = {};

  // For now, we'll create placeholder edges
  // In a full implementation, these would come from skill files
  const sampleEdges = [
    {
      id: 'nextjs-async-client',
      skill_id: 'nextjs-app-router',
      summary: 'Client Components cannot be async',
      severity: 'critical',
      situation: 'Adding async to a component with "use client"',
      why: 'Client Components run in the browser where top-level await is not supported in the same way',
      solution: 'Move data fetching to a Server Component parent or use useEffect',
      symptoms: ['Cannot use keyword \'await\' outside an async function'],
      detection_pattern: '"use client"[\\\\s\\\\S]*async\\\\s+function',
    },
    {
      id: 'supabase-rls-bypass',
      skill_id: 'supabase-backend',
      summary: 'Service role bypasses RLS',
      severity: 'critical',
      situation: 'Using service role key in client code',
      why: 'The service role key bypasses all RLS policies, exposing all data',
      solution: 'Use anon key for client, service role only in server/edge functions',
      symptoms: ['All rows returned instead of filtered', 'Security vulnerability'],
      detection_pattern: 'SUPABASE_SERVICE_ROLE|service_role',
    },
    {
      id: 'nextjs-hydration-mismatch',
      skill_id: 'nextjs-app-router',
      summary: 'Hydration mismatch from browser APIs',
      severity: 'high',
      situation: 'Using window, document, or localStorage during render',
      why: 'These APIs don\'t exist on the server, causing different HTML',
      solution: 'Use useEffect for browser-only code or dynamic imports with ssr: false',
      symptoms: ['Text content did not match', 'Hydration failed'],
      detection_pattern: 'window\\\\.|document\\\\.|localStorage',
    },
  ];

  // Group edges by stack
  for (const edge of sampleEdges) {
    const stack = edge.skill_id.split('-')[0]; // e.g., 'nextjs' from 'nextjs-app-router'
    if (!edgesByStack[stack]) {
      edgesByStack[stack] = [];
    }
    edgesByStack[stack].push(edge);
  }

  // Upload edges
  const EDGES_NS = 'SHARP_EDGES';  // Replace with actual namespace ID for production

  console.log('\\nUploading sharp edges...');
  for (const [stack, edges] of Object.entries(edgesByStack)) {
    await uploadToKV(EDGES_NS, `edges_by_stack:${stack}`, edges);
    console.log(`  ${stack}: ${edges.length} edges`);
  }

  // Upload edge index
  const allEdgeIds = sampleEdges.map(e => e.id);
  await uploadToKV(EDGES_NS, 'edge_index', allEdgeIds);

  console.log('\\nDone!');
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
