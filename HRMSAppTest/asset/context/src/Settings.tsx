import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Settings = ({ navigation }: any) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAutoLogin, setIsAutoLogin] = useState(false);
  const [isNotificationsOn, setIsNotificationsOn] = useState(true);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);

  // Example language options
  const [selectedLanguage, setSelectedLanguage] = useState('English');

  const handleThemeChange = () => {
    setIsDarkMode(!isDarkMode);
    // You can implement logic to save the theme setting here
  };

  const handleAutoLoginChange = () => {
    setIsAutoLogin(!isAutoLogin);
    AsyncStorage.setItem('autoLogin', JSON.stringify(!isAutoLogin));
  };

  const handleNotificationsChange = () => {
    setIsNotificationsOn(!isNotificationsOn);
    // Implement logic for notification preferences here
  };

  const handleTwoFactorChange = () => {
    setIsTwoFactorEnabled(!isTwoFactorEnabled);
    // Implement 2FA setup or settings here
  };

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    // You can implement language switcher logic here
  };

  const handleClearCache = () => {
    console.log('Clear cache clicked');
  };

  const handleChangeTheme = () => {
    console.log('Change theme clicked');
  };

  return (
    <View style={styles.container}>
      {/* Clear Cache */}
      <TouchableOpacity style={styles.settingItem} onPress={handleClearCache}>
        <Text style={styles.settingText}>Clear Cache</Text>
        <Image source={require('../../img/icon/arrow-right.png')} style={styles.arrowIcon} />
      </TouchableOpacity>

      {/* Change Theme */}
      <TouchableOpacity style={styles.settingItem} onPress={handleChangeTheme}>
        <Text style={styles.settingText}>Change Theme ({isDarkMode ? 'Dark' : 'Light'})</Text>
        <Image source={require('../../img/icon/arrow-right.png')} style={styles.arrowIcon} />
      </TouchableOpacity>

      {/* Language Setting */}
      <TouchableOpacity style={styles.settingItem} onPress={() => handleLanguageChange('Spanish')}>
        <Text style={styles.settingText}>Language ({selectedLanguage})</Text>
        <Image source={require('../../img/icon/arrow-right.png')} style={styles.arrowIcon} />
      </TouchableOpacity>

      {/* Notifications Preferences */}
      <TouchableOpacity style={styles.settingItem} onPress={handleNotificationsChange}>
        <Text style={styles.settingText}>Notifications Preferences</Text>
        <Image source={require('../../img/icon/arrow-right.png')} style={styles.arrowIcon} />
      </TouchableOpacity>

      {/* Profile Settings */}
      <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
        <Text style={styles.settingText}>Profile Settings</Text>
        <Image source={require('../../img/icon/arrow-right.png')} style={styles.arrowIcon} />
      </TouchableOpacity>

      {/* Security Settings */}
      <TouchableOpacity style={styles.settingItem} onPress={handleTwoFactorChange}>
        <Text style={styles.settingText}>Security Settings (2FA)</Text>
        <Image source={require('../../img/icon/arrow-right.png')} style={styles.arrowIcon} />
      </TouchableOpacity>

      {/* Auto-Login */}
      <TouchableOpacity style={styles.settingItem} onPress={handleAutoLoginChange}>
        <Text style={styles.settingText}>Auto-Login (Remember Me)</Text>
        <Image source={require('../../img/icon/arrow-right.png')} style={styles.arrowIcon} />
      </TouchableOpacity>

      <View style={styles.separator}></View>

      {/* Toggle Switches */}
      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Enable Auto-Login</Text>
        <Switch
          value={isAutoLogin}
          onValueChange={handleAutoLoginChange}
        />
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Enable 2FA</Text>
        <Switch
          value={isTwoFactorEnabled}
          onValueChange={handleTwoFactorChange}
        />
      </View>

      <View style={styles.switchContainer}>
        <Text style={styles.switchLabel}>Enable Notifications</Text>
        <Switch
          value={isNotificationsOn}
          onValueChange={handleNotificationsChange}
        />
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  settingText: { fontSize: 16 },
  arrowIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  separator: { height: 20 },
  switchContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  switchLabel: { fontSize: 16 },
});

export default Settings;
