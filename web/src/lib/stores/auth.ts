import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

// Auth state store
export const githubUser = writable<string | null>(null);

// Derived store for checking if authenticated
export const isAuthenticated = derived(githubUser, ($user) => $user !== null);

/**
 * Initialize auth state from cookies (client-side only)
 */
export function initAuth() {
  if (!browser) return;

  const user = getCookie('github_user');
  if (user) {
    githubUser.set(user);
  }
}

/**
 * Clear auth state (used after logout)
 */
export function clearAuth() {
  githubUser.set(null);
}

/**
 * Get cookie value by name
 */
function getCookie(name: string): string | null {
  if (!browser) return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
}

/**
 * Create an authenticated gist via the server API
 */
export async function createAuthenticatedGist(config: Record<string, unknown>): Promise<{
  id: string;
  html_url: string;
  owner: string;
}> {
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
