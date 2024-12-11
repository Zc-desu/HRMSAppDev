import React, { useLayoutEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
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
          attendanceManagement: 'Pengurusan Kehadiran'
        }[key] || key;
      
      case 'zh-Hans':
        return {
          attendance: '考勤',
          clockInOut: '打卡',
          attendanceManagement: '考勤管理'
        }[key] || key;
      
      case 'zh-Hant':
        return {
          attendance: '考勤',
          clockInOut: '打卡',
          attendanceManagement: '考勤管理'
        }[key] || key;
      
      default: // 'en'
        return {
          attendance: 'Attendance',
          clockInOut: 'Clock In/Out',
          attendanceManagement: 'Attendance Management'
        }[key] || key;
    }
  };

  const handleClockInOut = () => {
    navigation.navigate('ATShowMap', {
      employeeId,
      companyId,
      baseUrl
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>
        {getLocalizedText('attendanceManagement')}
      </Text>
      <View style={styles.menuContainer}>
        <TouchableOpacity
          style={[styles.menuCard, { backgroundColor: theme.card }]}
          onPress={handleClockInOut}
        >
          <View style={styles.menuContent}>
            <Text style={[styles.menuText, { color: theme.text }]}>
              {getLocalizedText('clockInOut')}
            </Text>
            <Image
              source={require('../../../../asset/img/icon/arrow-right.png')}
              style={[styles.icon, { tintColor: theme.primary }]}
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
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 10,
  },
  menuContainer: {
    flex: 1,
    gap: 12,
  },
  menuCard: {
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  menuText: {
    fontSize: 16,
    fontWeight: '500',
  },
  icon: {
    width: 20,
    height: 20,
  },
});

export default ATMenu;
