import React, { useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../setting/ThemeContext';
import { useLanguage } from '../setting/LanguageContext';

const ATMenu = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { employeeId, companyId, baseUrl } = route.params;

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
      title: getLocalizedText('attendance'),
    });
  }, [navigation, theme]);

  const getLocalizedText = (key: string) => {
    switch (language) {
      case 'ms':
        return {
          attendance: 'Kehadiran',
          clockInOut: 'Masuk/Keluar',
        }[key] || key;
      
      case 'zh-Hans':
        return {
          attendance: '考勤',
          clockInOut: '打卡',
        }[key] || key;
      
      case 'zh-Hant':
        return {
          attendance: '考勤',
          clockInOut: '打卡',
        }[key] || key;
      
      default: // 'en'
        return {
          attendance: 'Attendance',
          clockInOut: 'Clock In/Out',
        }[key] || key;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TouchableOpacity
        style={[styles.menuItem, { backgroundColor: theme.card }]}
        onPress={() => navigation.navigate('ATShowMap', {
          employeeId: employeeId,
          companyId: companyId,
          baseUrl: baseUrl
        })}
      >
        <View style={styles.menuContent}>
          <Text style={[styles.menuText, { color: theme.text }]}>
            {getLocalizedText('clockInOut')}
          </Text>
          <Image
            source={require('../../../../asset/img/icon/arrow-right.png')}
            style={[styles.arrowIcon, { tintColor: theme.primary }]}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  menuItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuText: {
    fontSize: 17,
    fontWeight: '600',
  },
  arrowIcon: {
    width: 20,
    height: 20,
  },
});

export default ATMenu;
