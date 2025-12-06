import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

/**
 * Initiates GitHub OAuth flow
 * Redirects user to GitHub authorization page
 */
export const GET: RequestHandler = async ({ url }) => {
  const clientId = env.GITHUB_CLIENT_ID;

  if (!clientId) {
    return new Response('GitHub OAuth not configured', { status: 500 });
  }

  // Generate state for CSRF protection
  const state = crypto.randomUUID();

  // Store state in a cookie for verification on callback
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${url.origin}/api/auth/callback`,
    scope: 'gist',
    state
  });

  const authUrl = `https://github.com/login/oauth/authorize?${params}`;

  return new Response(null, {
    status: 302,
    headers: {
      'Location': authUrl,
      'Set-Cookie': `oauth_state=${state}; Path=/; HttpOnly; SameSite=Lax; Max-Age=600`
    }
  });
};
