import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Theme, THEME_STORAGE_KEY } from '../../types/theme';
import { useSystemTheme } from './useSystemTheme';
import { applyTheme } from '../../lib/themeUtils';

const DEFAULT_THEME: Theme = 'system';

const getStoredTheme = (): Theme => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored as Theme;
    }
  } catch {
    // Handle localStorage errors gracefully
  }
  return DEFAULT_THEME;
};

export const useTheme = () => {
  const queryClient = useQueryClient();
  const systemIsDark = useSystemTheme();

  const { data: theme = DEFAULT_THEME } = useQuery({
    queryKey: ['theme'],
    queryFn: getStoredTheme,
    staleTime: Infinity // Theme doesn't change unless user changes it
  });

  const setThemeMutation = useMutation({
    mutationFn: async (newTheme: Theme) => {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      return newTheme;
    },
    onSuccess: (newTheme) => {
      queryClient.setQueryData(['theme'], newTheme);
      // Apply theme to DOM
      const actualTheme = newTheme === 'system' ? (systemIsDark ? 'dark' : 'light') : newTheme;
      applyTheme(actualTheme);
    }
  });

  // Resolve actual theme (when theme is 'system')
  const actualTheme = theme === 'system' ? (systemIsDark ? 'dark' : 'light') : theme;

  return {
    theme,
    setTheme: setThemeMutation.mutate,
    actualTheme,
    isLoading: setThemeMutation.isPending
  };
};