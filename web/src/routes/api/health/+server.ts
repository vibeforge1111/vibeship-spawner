import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

/**
 * Health check endpoint - also shows if OAuth is configured
 */
export const GET: RequestHandler = async () => {
  const clientId = env.GITHUB_CLIENT_ID || '';
  return new Response(JSON.stringify({
    status: 'ok',
    oauth_configured: !!(env.GITHUB_CLIENT_ID && env.GITHUB_CLIENT_SECRET),
    has_client_id: !!env.GITHUB_CLIENT_ID,
    has_client_secret: !!env.GITHUB_CLIENT_SECRET,
    client_id_prefix: clientId.substring(0, 6),
    client_id_length: clientId.length
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
