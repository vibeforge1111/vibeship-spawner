import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Create a gist with the user's GitHub token
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
  const token = cookies.get('github_token');

  if (!token) {
    return json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { config } = await request.json();

    if (!config) {
      return json({ error: 'No config provided' }, { status: 400 });
    }

    const content = JSON.stringify(config, null, 2);

    const response = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'vibeship-orchestrator'
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
      console.error('GitHub API error:', response.status, error);
      return json({ error: `Failed to create gist: ${error}` }, { status: response.status });
    }

    const gist = await response.json();

    return json({
      id: gist.id,
      html_url: gist.html_url,
      owner: gist.owner?.login
    });

  } catch (error) {
    console.error('Gist creation error:', error);
    return json({ error: 'Internal server error' }, { status: 500 });
  }
};
