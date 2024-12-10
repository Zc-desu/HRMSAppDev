import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from './ChangeTheme';

type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: typeof lightTheme;
  currentTheme: ThemeType;
  setCurrentTheme: (theme: ThemeType) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const systemTheme = useColorScheme();
  const [currentTheme, setCurrentTheme] = useState<ThemeType>('system');

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('themePreference');
      if (savedTheme) {
        setCurrentTheme(savedTheme as ThemeType);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const handleThemeChange = async (newTheme: ThemeType) => {
    try {
      await AsyncStorage.setItem('themePreference', newTheme);
      setCurrentTheme(newTheme);
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  const getActiveTheme = () => {
    if (currentTheme === 'system') {
      return systemTheme === 'dark' ? darkTheme : lightTheme;
    }
    return currentTheme === 'dark' ? darkTheme : lightTheme;
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: getActiveTheme(),
        currentTheme,
        setCurrentTheme: handleThemeChange,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};