'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeCtx {
  theme: Theme;
  toggle: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeCtx | null>(null);

function readStoredTheme(): Theme {
  try {
    const stored = localStorage.getItem('lp-theme');
    return stored === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof document === 'undefined') return 'dark';
    return readStoredTheme();
  });

  useEffect(() => {
    applyTheme(theme);

    const onStorage = (event: StorageEvent) => {
      if (event.key !== 'lp-theme') return;
      const next = event.newValue === 'light' ? 'light' : 'dark';
      setThemeState(next);
    };

    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem('lp-theme', next);
    } catch {
      /* ignore */
    }
    applyTheme(next);
  }, []);

  const toggle = useCallback(() => {
    setThemeState((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem('lp-theme', next);
      } catch {
        /* ignore */
      }
      applyTheme(next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return {
      theme: 'dark' as Theme,
      toggle: () => {},
      setTheme: () => {},
    };
  }
  return ctx;
}
