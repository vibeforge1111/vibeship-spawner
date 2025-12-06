import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

/**
 * Logout handler - clears GitHub auth cookies
 */
export const GET: RequestHandler = async ({ cookies }) => {
  cookies.delete('github_token', { path: '/' });
  cookies.delete('github_user', { path: '/' });

  throw redirect(302, '/summary');
};
