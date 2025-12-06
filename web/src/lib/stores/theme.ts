import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark';

function getInitialTheme(): Theme {
  if (!browser) return 'dark';

  const stored = localStorage.getItem('vibeship-theme');
  if (stored === 'light' || stored === 'dark') return stored;

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function createThemeStore() {
  const { subscribe, set, update } = writable<Theme>(getInitialTheme());

  return {
    subscribe,
    toggle: () => {
      update(current => {
        const next = current === 'light' ? 'dark' : 'light';
        if (browser) {
          localStorage.setItem('vibeship-theme', next);
          document.documentElement.setAttribute('data-theme', next);
        }
        return next;
      });
    },
    set: (theme: Theme) => {
      if (browser) {
        localStorage.setItem('vibeship-theme', theme);
        document.documentElement.setAttribute('data-theme', theme);
      }
      set(theme);
    }
  };
}

export const theme = createThemeStore();
