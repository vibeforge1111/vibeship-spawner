import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

/**
 * GitHub OAuth callback handler
 * Exchanges authorization code for access token
 */
export const GET: RequestHandler = async ({ url, cookies }) => {
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  const storedState = cookies.get('oauth_state');

  // Clear the state cookie
  cookies.delete('oauth_state', { path: '/' });

  // Verify state to prevent CSRF
  if (!state || state !== storedState) {
    return new Response('Invalid state parameter', { status: 400 });
  }

  if (!code) {
    return new Response('No authorization code provided', { status: 400 });
  }

  const clientId = env.GITHUB_CLIENT_ID;
  const clientSecret = env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return new Response('GitHub OAuth not configured', { status: 500 });
  }

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code
      })
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      throw new Error(tokenData.error_description || tokenData.error);
    }

    const accessToken = tokenData.access_token;

    // Fetch user info to get username
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'vibeship-orchestrator'
      }
    });

    if (!userResponse.ok) {
      throw new Error('Failed to fetch user info');
    }

    const userData = await userResponse.json();

    // Store token in httpOnly cookie (expires in 8 hours)
    cookies.set('github_token', accessToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: url.protocol === 'https:',
      maxAge: 60 * 60 * 8 // 8 hours
    });

    // Store username in a readable cookie for the client
    cookies.set('github_user', userData.login, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      secure: url.protocol === 'https:',
      maxAge: 60 * 60 * 8
    });

    // Redirect back to summary page
    throw redirect(302, '/summary?auth=success');

  } catch (error) {
    if (error instanceof Response) throw error;

    console.error('OAuth error:', error);
    throw redirect(302, '/summary?auth=error');
  }
};
