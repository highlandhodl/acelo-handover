/**
 * Applies the specified theme to the document element
 * @param theme - The theme to apply ('light' or 'dark')
 */
export const applyTheme = (theme: 'light' | 'dark'): void => {
  const root = document.documentElement;
  
  // Remove existing theme classes
  root.classList.remove('light', 'dark');
  
  // Add the new theme class
  root.classList.add(theme);
};

/**
 * Gets the current theme from the document element
 * @returns The current theme ('light' or 'dark')
 */
export const getCurrentTheme = (): 'light' | 'dark' => {
  const root = document.documentElement;
  return root.classList.contains('dark') ? 'dark' : 'light';
};

/**
 * Cycles through theme options: light -> dark -> system -> light
 * @param currentTheme - The current theme setting
 * @returns The next theme in the cycle
 */
export const cycleTheme = (currentTheme: 'light' | 'dark' | 'system'): 'light' | 'dark' | 'system' => {
  switch (currentTheme) {
    case 'light':
      return 'dark';
    case 'dark':
      return 'system';
    case 'system':
      return 'light';
    default:
      return 'light';
  }
};