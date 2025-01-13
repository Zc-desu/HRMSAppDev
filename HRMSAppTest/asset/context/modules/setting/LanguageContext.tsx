import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Language = 'en' | 'ms' | 'zh-Hans' | 'zh-Hant';

interface LanguageContextProps {
  language: Language;
  setLanguage: (language: Language) => void;
  changeLanguage: (language: Language) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState<Language>('en');

  // Load saved language on mount
  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('@user_language');
        console.log('Loading saved language:', savedLanguage); // Debug log
        
        if (savedLanguage && isValidLanguage(savedLanguage)) {
          setLanguage(savedLanguage as Language);
        }
      } catch (error) {
        console.error('Error loading language:', error);
      }
    };

    loadLanguage();
  }, []); // Empty dependency array to only run on mount

  const changeLanguage = async (newLanguage: Language) => {
    try {
      await AsyncStorage.setItem('@user_language', newLanguage);
      setLanguage(newLanguage);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  // Add type guard
  const isValidLanguage = (lang: string): lang is Language => {
    return ['en', 'ms', 'zh-Hans', 'zh-Hant'].includes(lang);
  };

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage,
      changeLanguage 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;