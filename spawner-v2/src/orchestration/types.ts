/**
 * Orchestration Layer Types
 *
 * Types for the entry point logic that detects context and routes users
 * to the appropriate path: resume, analyze, or brainstorm.
 */

import type { MindContext } from '../mind/types.js';

/**
 * Detection results from analyzing the current directory
 */
export interface DetectionResult {
  /** Whether an existing codebase was detected */
  hasCodebase: boolean;
  /** Whether a Spawner project exists in D1 */
  hasSpawnerProject: boolean;
  /** Whether Mind files exist locally */
  hasMindFiles: boolean;
  /** Detected tech stack (if codebase exists) */
  detectedStack: string[];
  /** Codebase indicators found */
  codebaseIndicators: CodebaseIndicator[];
}

export interface CodebaseIndicator {
  type: 'package_json' | 'config_file' | 'src_directory' | 'framework_file';
  path: string;
  framework?: string;
}

/**
 * The three orchestration paths
 */
export type OrchestrationPath = 'resume' | 'analyze' | 'brainstorm';

/**
 * Input to the orchestration system
 */
export interface SessionInput {
  /** Current working directory */
  cwd: string;
  /** User's initial message (if any) */
  userMessage?: string;
}

/**
 * Orchestration result returned to the user
 */
export interface OrchestrationResult {
  /** Which path was taken */
  path: OrchestrationPath;
  /** Greeting/summary to show user */
  greeting: string;
  /** Loaded skills for this context */
  loadedSkills: LoadedSkill[];
  /** Sharp edges that apply to this stack */
  sharpEdges: SharpEdge[];
  /** Project info (if resume or analyze) */
  project?: ProjectInfo;
  /** Mind context (if available) */
  mindContext?: MindContext;
  /** Suggested next actions */
  suggestions: string[];
  /** Skills that need to be generated (for analyze path) */
  missingSkills?: MissingSkillInfo[];
}

/**
 * Info about a missing skill that can be generated
 */
export interface MissingSkillInfo {
  /** Technology/domain identifier */
  domain: string;
  /** Suggested skill ID */
  suggestedId: string;
  /** Suggested skill name */
  suggestedName: string;
  /** Skill type to generate */
  type: 'core' | 'integration' | 'pattern';
  /** Suggested triggers for activation */
  suggestedTriggers: string[];
  /** Priority based on stack position */
  priority: 'high' | 'medium' | 'low';
}

export interface LoadedSkill {
  id: string;
  name: string;
  version: string;
  source: 'catalog' | 'generated';
}

export interface SharpEdge {
  id: string;
  title: string;
  severity: 'critical' | 'warning' | 'info';
  situation: string;
  why: string;
  fix: string;
}

export interface ProjectInfo {
  id: string;
  name: string;
  path: string;
  stack: string[];
  createdAt: string;
  lastSessionAt?: string;
  openIssues?: string[];
}

/**
 * Resume path specific types
 */
export interface ResumeContext {
  project: ProjectInfo;
  mindContext: MindContext;
  lastSession?: SessionSummary;
  openIssues: string[];
  recentDecisions: RecentDecision[];
}

export interface SessionSummary {
  date: string;
  summary: string;
  completedTasks: string[];
  blockers: string[];
}

export interface RecentDecision {
  date: string;
  what: string;
  why: string;
  risk?: string;
}

/**
 * Analyze path specific types
 */
export interface AnalyzeContext {
  detectedStack: string[];
  matchedSkills: MatchedSkill[];
  missingSkills: string[];
  sharpEdges: SharpEdge[];
  codebaseStructure: CodebaseStructure;
}

export interface MatchedSkill {
  id: string;
  name: string;
  matchReason: string;
}

export interface CodebaseStructure {
  hasPackageJson: boolean;
  hasSrcDirectory: boolean;
  hasTestsDirectory: boolean;
  configFiles: string[];
  entryPoints: string[];
}

/**
 * Brainstorm path specific types
 */
export interface BrainstormContext {
  userIdea?: string;
  clarifyingQuestions: string[];
  detectedSkillLevel?: SkillLevel;
  recommendedStack?: RecommendedStack;
  generatedPRD?: string;
  taskQueue?: TaskQueueItem[];
}

export type SkillLevel = 'vibe-coder' | 'builder' | 'developer' | 'expert';

export interface RecommendedStack {
  framework: string;
  database: string;
  auth?: string;
  styling: string;
  rationale: string;
}

export interface TaskQueueItem {
  id: string;
  title: string;
  description: string;
  priority: number;
  dependencies: string[];
  skillsNeeded: string[];
}

/**
 * Skill generation request (for Skills Generator integration)
 */
export interface SkillGenerationRequest {
  domain: string;
  detectedPatterns: string[];
  existingStack: string[];
  priority: 'high' | 'medium' | 'low';
}

/**
 * Database bindings for D1 operations
 */
export interface SpawnerProject {
  id: string;
  name: string;
  path: string;
  stack: string;
  created_at: string;
  updated_at: string;
}

export interface SpawnerSession {
  id: string;
  project_id: string;
  started_at: string;
  ended_at?: string;
  summary?: string;
}
