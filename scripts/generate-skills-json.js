#!/usr/bin/env node
/**
 * Generate skills.json for the web UI from local skills repo
 *
 * Usage: node scripts/generate-skills-json.js
 */

const fs = require('fs');
const path = require('path');

// Paths
const SKILLS_REPO = path.join(process.env.USERPROFILE || process.env.HOME, '.spawner', 'skills');
const ALT_SKILLS_REPO = path.resolve(__dirname, '../../spawner-skills');
const OUTPUT_FILE = path.resolve(__dirname, '../web/src/lib/data/skills.json');

// Category display names
const CATEGORY_NAMES = {
  'ai': 'AI & Machine Learning',
  'ai-agents': 'AI Agents & Automation',
  'ai-tools': 'AI Tools & Utilities',
  'backend': 'Backend & APIs',
  'biotech': 'Biotech & Life Sciences',
  'blockchain': 'Blockchain & Web3',
  'climate': 'Climate & Sustainability',
  'communications': 'Communications',
  'community': 'Community Building',
  'creative': 'Creative & Fun',
  'data': 'Data & Databases',
  'design': 'Design & UX',
  'development': 'Development',
  'devops': 'DevOps & Infrastructure',
  'education': 'Education & Learning',
  'enterprise': 'Enterprise Architecture',
  'finance': 'Finance & Fintech',
  'frameworks': 'Frameworks',
  'frontend': 'Frontend & Mobile',
  'game-dev': 'Game Development',
  'hardware': 'Hardware & Robotics',
  'integrations': 'Integrations',
  'legal': 'Legal & Compliance',
  'maker': 'Maker Tools',
  'marketing': 'Marketing & Content',
  'mind': 'Thinking & Decision Making',
  'product': 'Product Management',
  'science': 'Science & Research',
  'security': 'Security & Auth',
  'simulation': 'Simulation & Modeling',
  'space': 'Space & Aerospace',
  'startup': 'Startup & Founder',
  'strategy': 'Strategy & Growth',
  'testing': 'Testing & QA',
  'trading': 'Trading & Quant'
};

// Simple YAML parser for skill files (handles our specific format)
function parseYaml(content) {
  const result = {};
  let currentKey = null;
  let currentArray = null;
  let inMultiline = false;
  let multilineValue = '';

  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) {
      if (inMultiline) multilineValue += '\n';
      continue;
    }

    // Check for multiline end
    if (inMultiline) {
      if (!line.startsWith('  ') && !line.startsWith('\t') && line.match(/^[a-z_]+:/)) {
        result[currentKey] = multilineValue.trim();
        inMultiline = false;
        currentKey = null;
      } else {
        multilineValue += line.replace(/^  /, '') + '\n';
        continue;
      }
    }

    // Key: value pairs
    const kvMatch = trimmed.match(/^([a-z_]+):\s*(.*)$/);
    if (kvMatch) {
      const [, key, value] = kvMatch;

      // Check for multiline indicator
      if (value === '|') {
        currentKey = key;
        inMultiline = true;
        multilineValue = '';
        currentArray = null;
        continue;
      }

      // Check for array start
      if (value === '' || value === '[]') {
        currentKey = key;
        currentArray = [];
        result[key] = currentArray;
        continue;
      }

      // Simple value
      result[key] = value.replace(/^["']|["']$/g, '');
      currentKey = key;
      currentArray = null;
      continue;
    }

    // Array items
    const arrayMatch = trimmed.match(/^-\s+(.+)$/);
    if (arrayMatch && currentArray !== null) {
      currentArray.push(arrayMatch[1].replace(/^["']|["']$/g, ''));
    }
  }

  // Handle trailing multiline
  if (inMultiline && currentKey) {
    result[currentKey] = multilineValue.trim();
  }

  return result;
}

function getSkillsRepo() {
  // Try local spawner-skills first
  if (fs.existsSync(ALT_SKILLS_REPO)) {
    console.log(`Using skills from: ${ALT_SKILLS_REPO}`);
    return ALT_SKILLS_REPO;
  }
  // Then try ~/.spawner/skills
  if (fs.existsSync(SKILLS_REPO)) {
    console.log(`Using skills from: ${SKILLS_REPO}`);
    return SKILLS_REPO;
  }
  throw new Error('Skills repo not found. Clone it first.');
}

function loadSkillsFromCategory(repoPath, category) {
  const categoryPath = path.join(repoPath, category);
  if (!fs.existsSync(categoryPath)) return [];

  const skills = [];
  const skillDirs = fs.readdirSync(categoryPath, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .map(d => d.name);

  for (const skillDir of skillDirs) {
    const skillPath = path.join(categoryPath, skillDir, 'skill.yaml');
    if (!fs.existsSync(skillPath)) continue;

    try {
      const content = fs.readFileSync(skillPath, 'utf8');
      const skill = parseYaml(content);

      skills.push({
        id: skill.id || skillDir,
        name: skill.name || skillDir,
        version: skill.version || '1.0.0',
        layer: parseInt(skill.layer) || 1,
        description: skill.description || '',
        principles: skill.principles || [],
        owns: skill.owns || [],
        does_not_own: skill.does_not_own || [],
        triggers: skill.triggers || [],
        tags: skill.tags || [],
        pairs_with: skill.pairs_with || [],
        requires: skill.requires || [],
        category
      });
    } catch (err) {
      console.error(`Error parsing ${skillPath}:`, err.message);
    }
  }

  return skills;
}

function main() {
  const repoPath = getSkillsRepo();

  // Get all category directories
  const categories = fs.readdirSync(repoPath, { withFileTypes: true })
    .filter(d => d.isDirectory() && !d.name.startsWith('.'))
    .map(d => d.name)
    .sort();

  console.log(`Found categories: ${categories.join(', ')}`);

  // Build output structure
  const output = [];
  let totalSkills = 0;

  for (const category of categories) {
    const skills = loadSkillsFromCategory(repoPath, category);
    if (skills.length === 0) continue;

    output.push({
      id: category,
      name: CATEGORY_NAMES[category] || category.charAt(0).toUpperCase() + category.slice(1),
      skills: skills.sort((a, b) => a.name.localeCompare(b.name))
    });

    totalSkills += skills.length;
    console.log(`  ${category}: ${skills.length} skills`);
  }

  // Ensure output directory exists
  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write output
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`\nGenerated ${OUTPUT_FILE}`);
  console.log(`Total: ${totalSkills} skills across ${output.length} categories`);
}

main();
