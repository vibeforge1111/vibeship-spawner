/**
 * GitHub Gist service for exporting configs
 */

export interface GistConfig {
  project_name: string;
  description: string;
  discovery: Record<string, string>;
  agents: string[];
  mcps: string[];
  behaviors: {
    mandatory: string[];
    selected: string[];
  };
  custom_skills_needed: string[];
  generated_at: string;
}

export interface GistResponse {
  id: string;
  html_url: string;
  files?: Record<string, { filename: string; content: string }>;
  owner?: string;
}

/**
 * Create an anonymous GitHub Gist with the config
 */
export async function createAnonymousGist(config: GistConfig): Promise<GistResponse> {
  const content = JSON.stringify(config, null, 2);

  const response = await fetch('https://api.github.com/gists', {
    method: 'POST',
    headers: {
      'Accept': 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      description: `VibeShip config for ${config.project_name}`,
      public: false,
      files: {
        'vibeship-config.json': {
          content
        }
      }
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create gist: ${response.status} ${error}`);
  }

  return response.json();
}

/**
 * Build the config object from stores
 */
export function buildConfig(
  projectName: string,
  description: string,
  discovery: Record<string, string>,
  agents: string[],
  mcps: string[],
  selectedBehaviors: string[] = [],
  customSkillsNeeded: string[] = []
): GistConfig {
  return {
    project_name: projectName || 'my-project',
    description: description || '',
    discovery,
    agents,
    mcps,
    behaviors: {
      mandatory: [
        'verify-before-complete',
        'follow-architecture',
        'one-task-at-a-time',
        'maintainable-code',
        'secure-code'
      ],
      selected: selectedBehaviors
    },
    custom_skills_needed: customSkillsNeeded,
    generated_at: new Date().toISOString()
  };
}

/**
 * Extract gist ID from URL or return as-is if already an ID
 */
export function extractGistId(urlOrId: string): string {
  if (urlOrId.includes('gist.github.com')) {
    // Extract ID from URL like https://gist.github.com/user/abc123
    const parts = urlOrId.split('/');
    return parts[parts.length - 1];
  }
  return urlOrId;
}

/**
 * Create an authenticated GitHub Gist via server API
 * Uses the user's OAuth token stored in httpOnly cookie
 */
export async function createAuthenticatedGist(config: GistConfig): Promise<GistResponse> {
  const response = await fetch('/api/gist', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ config })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create gist');
  }

  return response.json();
}
