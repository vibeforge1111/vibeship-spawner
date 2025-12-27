// web/src/lib/stores/skills.ts
import type { Skill, SkillCategory } from '$lib/types/skill';
import skillsData from '$lib/data/skills.json';

// Category metadata
const CATEGORY_META: Record<string, { icon: string; description: string }> = {
  ai: { icon: 'brain', description: 'AI/ML architecture, LLMs, and intelligent systems' },
  communications: { icon: 'message-circle', description: 'Developer and stakeholder communication' },
  data: { icon: 'database', description: 'Databases, vectors, graphs, and data engineering' },
  design: { icon: 'palette', description: 'User experience and visual design' },
  development: { icon: 'terminal', description: 'Core software engineering skills' },
  frameworks: { icon: 'code', description: 'Deep expertise in specific technology frameworks' },
  integration: { icon: 'link', description: 'Connecting services and systems' },
  marketing: { icon: 'megaphone', description: 'Growth and customer acquisition' },
  product: { icon: 'box', description: 'Product management and analytics' },
  startup: { icon: 'rocket', description: 'Startup-specific expertise' },
  strategy: { icon: 'target', description: 'Business and product strategy' }
};

// Load and enrich categories
export const categories: SkillCategory[] = (skillsData as any[]).map(cat => ({
  ...cat,
  icon: CATEGORY_META[cat.id]?.icon || 'layers',
  description: CATEGORY_META[cat.id]?.description || ''
}));

// Flat list of all skills
export const allSkills: Skill[] = categories.flatMap(cat => cat.skills);

// Get all unique tags
export const allTags: string[] = [...new Set(allSkills.flatMap(s => s.tags || []))].sort();

// Get skill by ID
export function getSkillById(id: string): Skill | undefined {
  return allSkills.find(s => s.id === id);
}

// Search skills
export function searchSkills(query: string): Skill[] {
  if (!query.trim()) return allSkills;

  const q = query.toLowerCase();
  return allSkills.filter(skill => {
    return (
      skill.name.toLowerCase().includes(q) ||
      skill.description.toLowerCase().includes(q) ||
      skill.tags?.some(t => t.toLowerCase().includes(q)) ||
      skill.triggers?.some(t => t.toLowerCase().includes(q))
    );
  });
}

// Filter skills
export interface SkillFilters {
  category?: string;
  layer?: 1 | 2 | 3;
  tags?: string[];
  pairsWith?: string;
}

export function filterSkills(skills: Skill[], filters: SkillFilters): Skill[] {
  return skills.filter(skill => {
    if (filters.category && skill.category !== filters.category) return false;
    if (filters.layer && skill.layer !== filters.layer) return false;
    if (filters.tags?.length && !filters.tags.some(t => skill.tags?.includes(t))) return false;
    if (filters.pairsWith && !skill.pairs_with?.includes(filters.pairsWith)) return false;
    return true;
  });
}

// Get skills that pair with a given skill
export function getCompatibleSkills(skillId: string): Skill[] {
  const skill = getSkillById(skillId);
  if (!skill?.pairs_with) return [];
  return skill.pairs_with.map(id => getSkillById(id)).filter(Boolean) as Skill[];
}

// Task-based skill finder
export function findSkillsForTask(task: string): { primary: Skill | null; related: Skill[] } {
  const q = task.toLowerCase();

  // Score skills based on trigger matches
  const scored = allSkills.map(skill => {
    let score = 0;

    // Check triggers
    skill.triggers?.forEach(trigger => {
      if (q.includes(trigger.toLowerCase())) score += 10;
    });

    // Check tags
    skill.tags?.forEach(tag => {
      if (q.includes(tag.toLowerCase())) score += 5;
    });

    // Check name/description
    if (q.includes(skill.name.toLowerCase())) score += 8;
    if (skill.description.toLowerCase().includes(q)) score += 2;

    return { skill, score };
  }).filter(s => s.score > 0).sort((a, b) => b.score - a.score);

  const primary = scored[0]?.skill || null;
  const related = primary
    ? getCompatibleSkills(primary.id).slice(0, 3)
    : scored.slice(1, 4).map(s => s.skill);

  return { primary, related };
}
