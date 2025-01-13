import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Image,
  useColorScheme,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../modules/setting/ChangeTheme';
import { useLanguage } from '../modules/setting/LanguageContext';

const Settings = ({ navigation }: any) => {
  const systemTheme = useColorScheme();
  const [currentTheme, setCurrentTheme] = useState<string>('system');
  const { language, changeLanguage } = useLanguage();

  useEffect(() => {
    loadThemePreference();
    // Add listener for when screen comes into focus
    const unsubscribe = navigation.addListener('focus', () => {
      loadThemePreference();
    });

    return unsubscribe;
  }, [navigation]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('themePreference');
      if (savedTheme) {
        setCurrentTheme(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const getLocalizedText = (key: string) => {
    switch (language) {
      case 'ms':
        return {
          theme: 'Tema',
          language: 'Bahasa',
          system: 'Sistem',
          light: 'Cerah',
          dark: 'Gelap',
          help: 'Bantuan'
        }[key] || key;
      
      case 'zh-Hans':
        return {
          theme: '主题',
          language: '语言',
          system: '系统',
          light: '浅色',
          dark: '深色',
          help: '帮助'
        }[key] || key;
      
      case 'zh-Hant':
        return {
          theme: '主題',
          language: '語言',
          system: '系統',
          light: '淺色',
          dark: '深色',
          help: '幫助'
        }[key] || key;
      
      default: // 'en'
        return {
          theme: 'Theme',
          language: 'Language',
          system: 'System',
          light: 'Light',
          dark: 'Dark',
          help: 'Help'
        }[key] || key;
    }
  };

  const getThemeText = () => {
    switch (currentTheme) {
      case 'light':
        return getLocalizedText('light');
      case 'dark':
        return getLocalizedText('dark');
      default:
        return getLocalizedText('system');
    }
  };

  const getActiveTheme = () => {
    if (currentTheme === 'system') {
      return systemTheme === 'dark' ? darkTheme : lightTheme;
    }
    return currentTheme === 'dark' ? darkTheme : lightTheme;
  };

  const theme = getActiveTheme();

  // Update navigation header based on theme and language
  useEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: theme.headerBackground,
        shadowColor: 'transparent',
        elevation: 0,
      },
      headerTintColor: theme.text,
      headerTitleStyle: {
        color: theme.text,
      },
      headerShadowVisible: false,
      // Translate the Settings title
      title: language === 'zh-Hans' ? '设置' :
             language === 'zh-Hant' ? '設置' :
             language === 'ms' ? 'Tetapan' :
             'Settings'
    });
  }, [currentTheme, systemTheme, language]);

  const getLanguageText = () => {
    switch (language) {
      case 'en':
        return 'English';
      case 'ms':
        return 'Bahasa Melayu';
      case 'zh-Hans':
        return '简体中文';
      case 'zh-Hant':
        return '繁體中文';
      default:
        return 'English';
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.section, { 
        backgroundColor: theme.card,
        shadowColor: theme.shadowColor,
      }]}>
        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => navigation.navigate('ChangeTheme')}
        >
          <View style={styles.settingLeft}>
            <Image
              source={require('../../../asset/img/icon/theme.png')}
              style={[styles.icon, { tintColor: theme.text }]}
            />
            <Text style={[styles.settingText, { color: theme.text }]}>
              {getLocalizedText('theme')}
            </Text>
          </View>
          <View style={styles.settingRight}>
            <Text style={[styles.themeText, { color: theme.subText }]}>
              {getThemeText()}
            </Text>
            <Image
              source={require('../../../asset/img/icon/arrow-right.png')}
              style={[styles.arrowIcon, { tintColor: theme.subText }]}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.settingItem, { borderTopWidth: 1, borderTopColor: theme.divider }]}
          onPress={async () => {
            try {
              await changeLanguage(language);
              console.log('Language saved in Settings:', language);
              navigation.navigate('LanguageSelector');
            } catch (error) {
              console.error('Error saving language in Settings:', error);
            }
          }}
        >
          <View style={styles.settingLeft}>
            <Image
              source={require('../../../asset/img/icon/translate.png')}
              style={[styles.icon, { tintColor: theme.text }]}
            />
            <Text style={[styles.settingText, { color: theme.text }]}>
              {getLocalizedText('language')}
            </Text>
          </View>
          <View style={styles.settingRight}>
            <Text style={[styles.themeText, { color: theme.subText }]}>
              {getLanguageText()}
            </Text>
            <Image
              source={require('../../../asset/img/icon/arrow-right.png')}
              style={[styles.arrowIcon, { tintColor: theme.subText }]}
            />
          </View>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.settingItem, { borderTopWidth: 1, borderTopColor: theme.divider }]}
          onPress={() => navigation.navigate('Help')}
        >
          <View style={styles.settingLeft}>
            <Image
              source={require('../../../asset/img/icon/bangzhu.png')}
              style={[styles.icon, { tintColor: theme.text }]}
            />
            <Text style={[styles.settingText, { color: theme.text }]}>
              {getLocalizedText('help')}
            </Text>
          </View>
          <View style={styles.settingRight}>
            <Image
              source={require('../../../asset/img/icon/arrow-right.png')}
              style={[styles.arrowIcon, { tintColor: theme.subText }]}
            />
          </View>
        </TouchableOpacity>
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
    padding: 15,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  arrowIcon: {
    width: 20,
    height: 20,
    marginLeft: 8,
  },
  settingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  themeText: {
    fontSize: 16,
  },
});

export default Settings;
