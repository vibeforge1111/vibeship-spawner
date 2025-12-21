// web/scripts/build-skills-json.ts
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SKILLS_DIR = path.join(__dirname, '../../spawner-v2/skills');
const OUTPUT_FILE = path.join(__dirname, '../src/lib/data/skills.json');

interface SkillFiles {
  skill: any;
  sharpEdges: any;
  validations: any;
  collaboration: any;
}

function loadYaml(filePath: string): any {
  if (!fs.existsSync(filePath)) return null;
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return yaml.load(content);
  } catch (err) {
    console.warn(`Warning: Failed to parse ${filePath}: ${(err as Error).message}`);
    return null;
  }
}

function loadSkill(skillDir: string, category: string): any {
  const skillYaml = loadYaml(path.join(skillDir, 'skill.yaml'));
  if (!skillYaml) return null;

  const sharpEdgesYaml = loadYaml(path.join(skillDir, 'sharp-edges.yaml'));
  const validationsYaml = loadYaml(path.join(skillDir, 'validations.yaml'));
  const collaborationYaml = loadYaml(path.join(skillDir, 'collaboration.yaml'));

  return {
    ...skillYaml,
    category,
    sharp_edges: sharpEdgesYaml?.edges || [],
    validations: validationsYaml?.validations || [],
    collaboration: collaborationYaml || null
  };
}

function main() {
  // Skip if skills directory doesn't exist (e.g., in Railway where only web/ is deployed)
  if (!fs.existsSync(SKILLS_DIR)) {
    console.log(`Skills directory not found at ${SKILLS_DIR} - skipping build (using pre-generated skills.json)`);
    return;
  }

  const categories: any[] = [];

  const categoryDirs = fs.readdirSync(SKILLS_DIR).filter(
    f => fs.statSync(path.join(SKILLS_DIR, f)).isDirectory()
  );

  for (const categoryName of categoryDirs) {
    const categoryPath = path.join(SKILLS_DIR, categoryName);
    const skillDirs = fs.readdirSync(categoryPath).filter(
      f => fs.statSync(path.join(categoryPath, f)).isDirectory()
    );

    const skills = skillDirs
      .map(skillName => loadSkill(path.join(categoryPath, skillName), categoryName))
      .filter(Boolean);

    if (skills.length > 0) {
      categories.push({
        id: categoryName,
        name: categoryName.charAt(0).toUpperCase() + categoryName.slice(1),
        skills
      });
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(categories, null, 2));
  console.log(`Generated ${OUTPUT_FILE} with ${categories.reduce((a, c) => a + c.skills.length, 0)} skills`);
}

main();
