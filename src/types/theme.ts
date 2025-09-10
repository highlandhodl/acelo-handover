export type Theme = 'light' | 'dark' | 'system';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark'; // resolved theme (when theme is 'system')
}

export interface ThemePreference {
  theme: Theme;
}

// Storage keys
export const THEME_STORAGE_KEY = 'acelo-theme';