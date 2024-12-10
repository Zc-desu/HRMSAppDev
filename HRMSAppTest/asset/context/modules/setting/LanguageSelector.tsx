import React, { useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLanguage } from './LanguageContext';
import { useTheme } from './ThemeContext';

const LanguageSelector = ({ navigation }: any) => {
  const { language, setLanguage } = useLanguage();
  const { theme } = useTheme();

  // Update navigation header based on theme and language
  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: theme.headerBackground,
        shadowColor: 'transparent',
        elevation: 0,
      },
      headerTintColor: theme.headerText,
      headerTitleStyle: {
        color: theme.headerText,
        fontSize: 17,
        fontWeight: '600',
      },
      headerShadowVisible: false,
      // Translate the Language title
      title: language === 'zh-Hans' ? '语言' :
             language === 'zh-Hant' ? '語言' :
             language === 'ms' ? 'Bahasa' :
             'Language',
      headerTitleAlign: 'center',
    });
  }, [navigation, theme, language]);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ms', label: 'Bahasa Melayu' },
    { code: 'zh-Hans', label: '简体中文' },
    { code: 'zh-Hant', label: '繁體中文' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.section, { 
        backgroundColor: theme.card,
        shadowColor: theme.shadowColor,
      }]}>
        {languages.map((lang, index) => (
          <TouchableOpacity
            key={lang.code}
            style={[
              styles.option,
              { borderTopColor: theme.divider },
              index > 0 && styles.borderTop,
              language === lang.code && styles.selectedOption,
            ]}
            onPress={() => setLanguage(lang.code as any)}
          >
            <Text style={[
              styles.optionText,
              { color: theme.text },
              language === lang.code && { color: theme.primary }
            ]}>
              {lang.label}
            </Text>
            {language === lang.code && (
              <View style={[styles.checkmark, { backgroundColor: theme.primary }]}>
                <Text style={styles.checkmarkText}>✓</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  section: {
    borderRadius: 10,
    overflow: 'hidden',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  borderTop: {
    borderTopWidth: 1,
  },
  selectedOption: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmarkText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default LanguageSelector;