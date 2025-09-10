import React, { createContext, useContext, useEffect } from 'react';
import { ThemeContextType } from '../types/theme';
import { useTheme } from '../hooks/theme/useTheme';
import { applyTheme } from '../lib/themeUtils';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { theme, setTheme, actualTheme } = useTheme();

  // Apply theme to DOM on mount and when actualTheme changes
  useEffect(() => {
    applyTheme(actualTheme);
  }, [actualTheme]);

  const contextValue: ThemeContextType = {
    theme,
    setTheme,
    actualTheme
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};