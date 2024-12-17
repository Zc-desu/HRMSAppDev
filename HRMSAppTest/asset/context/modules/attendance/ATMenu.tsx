import React, { useLayoutEffect, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useTheme } from '../setting/ThemeContext';
import { useLanguage } from '../setting/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ATMenu = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { employeeId, companyId, baseUrl } = route.params;
  const [hasApprovalRole, setHasApprovalRole] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const userRole = await AsyncStorage.getItem('userRole');
        setHasApprovalRole(userRole === 'Approval');
      } catch (error) {
        console.error('Error checking user role:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserRole();
  }, []);

  const getLocalizedText = (key: string) => {
    switch (language) {
      case 'ms':
        return {
          attendance: 'Kehadiran',
          clockInOut: 'Masuk/Keluar',
          attendanceManagement: 'Pengurusan Kehadiran',
          timeLogListing: 'Senarai Log Masa',
          pendingApplications: 'Permohonan Tertunda',
          overtimeApplications: 'Sejarah Kerja Lebih Masa',
          createOvertime: 'Cipta Kerja Lebih Masa',
        }[key] || key;
      
      case 'zh-Hans':
        return {
          attendance: '考勤',
          clockInOut: '打卡',
          attendanceManagement: '考勤管理',
          timeLogListing: '时间记录列表',
          pendingApplications: '待处理申请',
          overtimeApplications: '加班记录',
          createOvertime: '创建加班申请',
        }[key] || key;
      
      case 'zh-Hant':
        return {
          attendance: '考勤',
          clockInOut: '打卡',
          attendanceManagement: '考勤管理',
          timeLogListing: '時間記錄列表',
          pendingApplications: '待處理申請',
          overtimeApplications: '加班紀錄',
          createOvertime: '創建加班申請',
        }[key] || key;
      
      default: // 'en'
        return {
          attendance: 'Attendance',
          clockInOut: 'Clock In/Out',
          attendanceManagement: 'Attendance Management',
          timeLogListing: 'Time Log Listing',
          pendingApplications: 'Pending Applications',
          overtimeApplications: 'Overtime History',
          createOvertime: 'Create Overtime',
        }[key] || key;
    }
  };

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

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const baseMenuItems = [
    {
      title: getLocalizedText('clockInOut'),
      onPress: () => navigation.navigate('ATShowMap', {
        employeeId,
        companyId,
        baseUrl
      }),
      icon: require('../../../../asset/img/icon/arrow-right.png'),
    },
    {
      title: getLocalizedText('timeLogListing'),
      onPress: () => navigation.navigate('ATTimeLogListing', {
        employeeId,
        baseUrl
      }),
      icon: require('../../../../asset/img/icon/arrow-right.png'),
    },
    {
      title: getLocalizedText('createOvertime'),
      onPress: () => navigation.navigate('OTCreateApplication'),
      icon: require('../../../../asset/img/icon/arrow-right.png'),
    },
    {
      title: getLocalizedText('overtimeApplications'),
      onPress: () => navigation.navigate('OTApplicationListing'),
      icon: require('../../../../asset/img/icon/arrow-right.png'),
    },
  ];

  const menuItems = hasApprovalRole ? [
    ...baseMenuItems,
    {
      title: getLocalizedText('pendingApplications'),
      onPress: () => navigation.navigate('ATPendingApplicationListing'),
      icon: require('../../../../asset/img/icon/arrow-right.png'),
    }
  ] : baseMenuItems;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>
        {getLocalizedText('attendanceManagement')}
      </Text>
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.menuCard, { backgroundColor: theme.card }]}
            onPress={item.onPress}
          >
            <View style={styles.menuContent}>
              <Text style={[styles.menuText, { color: theme.text }]}>
                {item.title}
              </Text>
              <Image
                source={item.icon}
                style={[styles.icon, { tintColor: theme.primary }]}
              />
            </View>
          </TouchableOpacity>
        ))}
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
