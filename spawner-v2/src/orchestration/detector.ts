/**
 * Context Detector
 *
 * Detects what context the user is in to route to the appropriate path:
 * - resume: Known project in D1 + Mind files
 * - analyze: Unknown codebase detected
 * - brainstorm: No codebase, user describing an idea
 */

import type { Env } from '../types.js';
import { buildMindContext } from '../mind/index.js';
import type {
  DetectionResult,
  CodebaseIndicator,
  OrchestrationPath,
  SpawnerProject,
} from './types.js';

/**
 * Config file patterns that indicate a codebase exists
 */
const CODEBASE_INDICATORS = {
  package_json: {
    files: ['package.json'],
    framework: undefined,
  },
  nextjs: {
    files: ['next.config.js', 'next.config.mjs', 'next.config.ts'],
    framework: 'nextjs',
  },
  vite: {
    files: ['vite.config.js', 'vite.config.ts'],
    framework: 'vite',
  },
  svelte: {
    files: ['svelte.config.js'],
    framework: 'svelte',
  },
  vue: {
    files: ['vue.config.js', 'nuxt.config.js', 'nuxt.config.ts'],
    framework: 'vue',
  },
  cloudflare: {
    files: ['wrangler.toml', 'wrangler.json'],
    framework: 'cloudflare',
  },
  typescript: {
    files: ['tsconfig.json'],
    framework: undefined,
  },
  python: {
    files: ['requirements.txt', 'pyproject.toml', 'setup.py'],
    framework: 'python',
  },
  rust: {
    files: ['Cargo.toml'],
    framework: 'rust',
  },
  go: {
    files: ['go.mod'],
    framework: 'go',
  },
};

/**
 * Directory patterns that indicate a codebase exists
 */
const CODEBASE_DIRECTORIES = ['src', 'lib', 'app', 'pages', 'components'];

/**
 * Stack detection from package.json dependencies
 */
const DEPENDENCY_STACK_MAP: Record<string, string> = {
  // Frameworks
  'next': 'nextjs',
  'react': 'react',
  'vue': 'vue',
  'svelte': 'svelte',
  '@angular/core': 'angular',
  // Database
  '@supabase/supabase-js': 'supabase',
  '@prisma/client': 'prisma',
  'drizzle-orm': 'drizzle',
  'firebase': 'firebase',
  'mongoose': 'mongodb',
  // Auth
  'next-auth': 'nextauth',
  '@clerk/nextjs': 'clerk',
  '@auth0/nextjs-auth0': 'auth0',
  // Payments
  'stripe': 'stripe',
  '@lemonsqueezy/lemonsqueezy.js': 'lemonsqueezy',
  // Styling
  'tailwindcss': 'tailwind',
  '@radix-ui/react-dialog': 'shadcn',
  'styled-components': 'styled-components',
  '@emotion/react': 'emotion',
  // AI
  'openai': 'openai',
  '@anthropic-ai/sdk': 'anthropic',
  'ai': 'vercel-ai',
  // Web3
  'wagmi': 'wagmi',
  'viem': 'viem',
  'ethers': 'ethers',
};

/**
 * Main detection function
 */
export async function detectContext(
  env: Env,
  cwd: string,
  fileList: string[],
  packageJson?: { dependencies?: Record<string, string>; devDependencies?: Record<string, string> },
  mindFiles?: { memory?: string; session?: string }
): Promise<DetectionResult> {
  // 1. Check for codebase indicators
  const codebaseIndicators = detectCodebaseIndicators(fileList);
  const hasCodebase = codebaseIndicators.length > 0;

  // 2. Check for existing Spawner project in D1
  const existingProject = await getProjectByPath(env, cwd);
  const hasSpawnerProject = existingProject !== null;

  // 3. Check for Mind files
  const mindContext = buildMindContext(mindFiles?.memory, mindFiles?.session);
  const hasMindFiles = mindContext.hasFiles;

  // 4. Detect stack from multiple sources
  const detectedStack = detectStack(fileList, codebaseIndicators, packageJson);

  return {
    hasCodebase,
    hasSpawnerProject,
    hasMindFiles,
    detectedStack,
    codebaseIndicators,
  };
}

/**
 * Determine which orchestration path to take
 */
export function determineOrchestrationPath(detection: DetectionResult): OrchestrationPath {
  // If we have a known Spawner project, resume
  if (detection.hasSpawnerProject) {
    return 'resume';
  }

  // If we detect a codebase but no Spawner project, analyze
  if (detection.hasCodebase) {
    return 'analyze';
  }

  // No codebase detected, start brainstorm
  return 'brainstorm';
}

/**
 * Detect codebase indicators from file list
 */
function detectCodebaseIndicators(fileList: string[]): CodebaseIndicator[] {
  const indicators: CodebaseIndicator[] = [];
  const normalizedFiles = fileList.map(f => f.toLowerCase().replace(/\\/g, '/'));

  // Check for config files
  for (const [type, config] of Object.entries(CODEBASE_INDICATORS)) {
    for (const file of config.files) {
      const found = normalizedFiles.find(f =>
        f.endsWith(`/${file}`) || f === file
      );
      if (found) {
        indicators.push({
          type: type === 'package_json' ? 'package_json' : 'config_file',
          path: found,
          framework: config.framework,
        });
      }
    }
  }

  // Check for src directories
  for (const dir of CODEBASE_DIRECTORIES) {
    const hasDir = normalizedFiles.some(f =>
      f.includes(`/${dir}/`) || f.startsWith(`${dir}/`)
    );
    if (hasDir) {
      indicators.push({
        type: 'src_directory',
        path: dir,
      });
      break; // Only add one src_directory indicator
    }
  }

  return indicators;
}

/**
 * Detect stack from various sources
 */
function detectStack(
  fileList: string[],
  indicators: CodebaseIndicator[],
  packageJson?: { dependencies?: Record<string, string>; devDependencies?: Record<string, string> }
): string[] {
  const stack = new Set<string>();

  // Add frameworks from config file indicators
  for (const indicator of indicators) {
    if (indicator.framework) {
      stack.add(indicator.framework);
    }
  }

  // Add from package.json dependencies
  if (packageJson) {
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    for (const dep of Object.keys(allDeps)) {
      if (DEPENDENCY_STACK_MAP[dep]) {
        stack.add(DEPENDENCY_STACK_MAP[dep]);
      }
    }
  }

  return Array.from(stack);
}

/**
 * Get project from D1 by path
 */
async function getProjectByPath(env: Env, path: string): Promise<SpawnerProject | null> {
  try {
    const result = await env.DB.prepare(
      'SELECT * FROM projects WHERE path = ? LIMIT 1'
    ).bind(path).first<SpawnerProject>();

    return result || null;
  } catch {
    // Table might not exist or other DB error
    return null;
  }
}

/**
 * Get project from D1 by ID
 */
export async function getProjectById(env: Env, id: string): Promise<SpawnerProject | null> {
  try {
    const result = await env.DB.prepare(
      'SELECT * FROM projects WHERE id = ? LIMIT 1'
    ).bind(id).first<SpawnerProject>();

    return result || null;
  } catch {
    return null;
  }
}

/**
 * Create a new project in D1
 */
export async function createProject(
  env: Env,
  project: Omit<SpawnerProject, 'id' | 'created_at' | 'updated_at'>
): Promise<SpawnerProject> {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  // Use 'anonymous' for user_id when not authenticated
  const userId = 'anonymous';

  await env.DB.prepare(`
    INSERT INTO projects (id, user_id, name, path, stack, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).bind(
    id,
    userId,
    project.name,
    project.path,
    project.stack,
    now,
    now
  ).run();

  return {
    id,
    name: project.name,
    path: project.path,
    stack: project.stack,
    created_at: now,
    updated_at: now,
  };
}

/**
 * Check if user message indicates idea description vs question
 */
export function isIdeaDescription(message: string): boolean {
  if (!message) return false;

  const ideaPatterns = [
    /i want to build/i,
    /i'm building/i,
    /i need (a|an)/i,
    /build (me|a)/i,
    /create (a|an)/i,
    /make (a|an)/i,
    /let's build/i,
    /help me (build|create|make)/i,
    /idea for/i,
    /app that/i,
    /website that/i,
    /platform (for|that)/i,
    /saas (for|that)/i,
    /tool (for|that)/i,
  ];

  return ideaPatterns.some(pattern => pattern.test(message));
}

/**
 * Check if user message is asking a question
 */
export function isQuestion(message: string): boolean {
  if (!message) return false;

  const questionPatterns = [
    /^(what|how|why|when|where|who|which|can|could|should|would|is|are|do|does|did)/i,
    /\?$/,
  ];

  return questionPatterns.some(pattern => pattern.test(message.trim()));
}
