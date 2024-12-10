import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  useColorScheme,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from './CustomAlert';
import { useTheme } from './ThemeContext';

// Define theme types
type ThemeType = 'light' | 'dark' | 'system';

interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

// Define theme colors
export const lightTheme = {
  primary: '#007AFF',
  background: '#F5F5F5',
  card: '#FFFFFF',
  text: '#333333',
  subText: '#666666',
  border: '#E5E5EA',
  success: '#34C759',
  error: '#FF3B30',
  warning: '#FFCC00',
  buttonBackground: '#FFFFFF',
  buttonText: '#007AFF',
  shadowColor: '#000000',
  headerBackground: '#FFFFFF',
  divider: '#F0F0F0',
  headerText: '#000000',
  statusBarStyle: 'dark-content',
};

export const darkTheme = {
  primary: '#0A84FF',
  background: '#000000',
  card: '#1C1C1E',
  text: '#FFFFFF',
  subText: '#EBEBF5',
  border: '#38383A',
  success: '#32D74B',
  error: '#FF453A',
  warning: '#FFD60A',
  buttonBackground: '#1C1C1E',
  buttonText: '#0A84FF',
  shadowColor: '#000000',
  headerBackground: '#000000',
  divider: '#38383A',
  headerText: '#FFFFFF',
  statusBarStyle: 'light-content',
};

const ChangeTheme = ({ navigation }: any) => {
  const { theme, currentTheme, setCurrentTheme } = useTheme();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message: string;
    buttons: AlertButton[];
  }>({
    title: '',
    message: '',
    buttons: [],
  });

  const showCustomAlert = (title: string, message: string, buttons: AlertButton[] = []) => {
    setAlertConfig({
      title,
      message,
      buttons: buttons.map(btn => ({
        text: btn.text,
        style: btn.style,
        onPress: () => {
          setAlertVisible(false);
          btn.onPress?.();
        },
      })),
    });
    setAlertVisible(true);
  };

  const handleThemeChange = async (newTheme: ThemeType) => {
    await setCurrentTheme(newTheme);
    showCustomAlert(
      'Theme Updated',
      `Theme has been changed to ${newTheme === 'system' ? 'system default' : newTheme} mode.`,
      [{
        text: 'OK',
        style: 'default',
      }]
    );
  };

  // Add header styling based on theme
  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: theme.headerBackground,
        shadowColor: 'transparent', // iOS
        elevation: 0, // Android
      },
      headerTintColor: theme.text,
      headerTitleStyle: {
        color: theme.text,
      },
      headerShadowVisible: false, // iOS
    });
  }, [currentTheme, theme]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.title, { color: theme.text }]}>Theme Settings</Text>
        
        <TouchableOpacity
          style={[
            styles.option,
            { borderBottomColor: theme.divider },
            currentTheme === 'light' && styles.selectedOption,
          ]}
          onPress={() => handleThemeChange('light')}
        >
          <View style={styles.optionContent}>
            <Image
              source={require('../../../../asset/img/icon/sun.png')}
              style={[styles.icon, { tintColor: theme.text }]}
            />
            <Text style={[styles.optionText, { color: theme.text }]}>Light Theme</Text>
          </View>
          {currentTheme === 'light' && (
            <Image
              source={require('../../../../asset/img/icon/a-check.png')}
              style={[styles.checkIcon, { tintColor: theme.primary }]}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.option,
            { borderBottomColor: theme.divider },
            currentTheme === 'dark' && styles.selectedOption,
          ]}
          onPress={() => handleThemeChange('dark')}
        >
          <View style={styles.optionContent}>
            <Image
              source={require('../../../../asset/img/icon/moon.png')}
              style={[styles.icon, { tintColor: theme.text }]}
            />
            <Text style={[styles.optionText, { color: theme.text }]}>Dark Theme</Text>
          </View>
          {currentTheme === 'dark' && (
            <Image
              source={require('../../../../asset/img/icon/a-check.png')}
              style={[styles.checkIcon, { tintColor: theme.primary }]}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.option,
            currentTheme === 'system' && styles.selectedOption,
          ]}
          onPress={() => handleThemeChange('system')}
        >
          <View style={styles.optionContent}>
            <Image
              source={require('../../../../asset/img/icon/system.png')}
              style={[styles.icon, { tintColor: theme.text }]}
            />
            <Text style={[styles.optionText, { color: theme.text }]}>System Default</Text>
          </View>
          {currentTheme === 'system' && (
            <Image
              source={require('../../../../asset/img/icon/a-check.png')}
              style={[styles.checkIcon, { tintColor: theme.primary }]}
            />
          )}
        </TouchableOpacity>
      </View>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onDismiss={() => setAlertVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 12,
  },
  checkIcon: {
    width: 20,
    height: 20,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  selectedOption: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
});

export default ChangeTheme;
