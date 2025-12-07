import { describe, it, expect, beforeEach, vi } from 'vitest';
import { get } from 'svelte/store';
import { githubUser, isAuthenticated, clearAuth } from './auth';

// Mock $app/environment
vi.mock('$app/environment', () => ({
  browser: false
}));

describe('Auth Store', () => {
  beforeEach(() => {
    // Reset the store before each test
    clearAuth();
  });

  it('should start with no user', () => {
    const user = get(githubUser);
    expect(user).toBe(null);
  });

  it('should derive isAuthenticated as false when no user', () => {
    const authenticated = get(isAuthenticated);
    expect(authenticated).toBe(false);
  });

  it('should clear auth state', () => {
    // Set a user
    githubUser.set('testuser');
    expect(get(githubUser)).toBe('testuser');

    // Clear auth
    clearAuth();
    expect(get(githubUser)).toBe(null);
    expect(get(isAuthenticated)).toBe(false);
  });

  it('should derive isAuthenticated as true when user exists', () => {
    githubUser.set('testuser');
    const authenticated = get(isAuthenticated);
    expect(authenticated).toBe(true);
  });
});
