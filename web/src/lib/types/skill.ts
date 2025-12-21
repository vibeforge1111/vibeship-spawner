// web/src/lib/types/skill.ts
export interface Skill {
  id: string;
  name: string;
  version: string;
  layer: 1 | 2 | 3;
  description: string;
  category: string;
  owns: string[];
  pairs_with: string[];
  requires: string[];
  tags: string[];
  triggers: string[];
  identity: string;
  patterns: Pattern[];
  anti_patterns: AntiPattern[];
  handoffs: Handoff[];
  sharp_edges: SharpEdge[];
  validations: Validation[];
  collaboration?: Collaboration;
}

export interface Pattern {
  name: string;
  description: string;
  when: string;
  example: string;
}

export interface AntiPattern {
  name: string;
  description: string;
  why: string;
  instead: string;
}

export interface Handoff {
  trigger: string;
  to: string;
  context: string;
}

export interface SharpEdge {
  id: string;
  summary: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  situation: string;
  why: string;
  solution: string;
  detection_pattern?: string;
}

export interface Validation {
  id: string;
  name: string;
  description: string;
  severity: 'error' | 'warning' | 'info';
  type: 'regex' | 'ast';
  pattern?: string;
  message: string;
}

export interface Collaboration {
  prerequisites: string[];
  delegates_to: DelegationTrigger[];
  cross_domain: CrossDomainInsight[];
}

export interface DelegationTrigger {
  when: string;
  to: string;
  handoff: string;
}

export interface CrossDomainInsight {
  domain: string;
  insight: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  skills: Skill[];
}

export type LayerLabel = 'Core' | 'Integration' | 'Polish';

export const LAYER_LABELS: Record<1 | 2 | 3, LayerLabel> = {
  1: 'Core',
  2: 'Integration',
  3: 'Polish'
};
