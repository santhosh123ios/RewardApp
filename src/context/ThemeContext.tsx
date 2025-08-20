import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme, Appearance } from 'react-native';
import { lightColors, darkColors } from '../theme/colors';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  colors: typeof lightColors;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [theme, setTheme] = useState<'light' | 'dark'>(systemColorScheme || 'light');

  // Update theme when system color scheme changes
  useEffect(() => {
    if (themeMode === 'system') {
      setTheme(systemColorScheme || 'light');
    }
  }, [systemColorScheme, themeMode]);

  // Update theme when theme mode changes
  useEffect(() => {
    if (themeMode === 'system') {
      setTheme(systemColorScheme || 'light');
    } else {
      setTheme(themeMode);
    }
  }, [themeMode, systemColorScheme]);

  // Listen for system appearance changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (themeMode === 'system') {
        setTheme(colorScheme || 'light');
      }
    });

    return () => subscription?.remove();
  }, [themeMode]);

  const colors = theme === 'dark' ? darkColors : lightColors;
  const isDark = theme === 'dark';

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setThemeMode(newTheme);
  };

  const handleSetThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
  };

  const value: ThemeContextType = {
    theme,
    themeMode,
    colors,
    isDark,
    toggleTheme,
    setThemeMode: handleSetThemeMode,
  };

  // Debug logging to help identify the issue
  console.log('ThemeProvider value:', { theme, themeMode, hasColors: !!colors, colorsKeys: colors ? Object.keys(colors) : 'undefined' });

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    console.error('useTheme must be used within a ThemeProvider');
    // Return a fallback theme to prevent crashes
    return {
      theme: 'light',
      themeMode: 'light',
      colors: lightColors,
      isDark: false,
      toggleTheme: () => {},
      setThemeMode: () => {},
    };
  }
  
  // Debug logging to help identify the issue
  if (!context.colors) {
    console.error('Theme context is missing colors property:', context);
  }
  
  return context;
};

export default ThemeContext;
