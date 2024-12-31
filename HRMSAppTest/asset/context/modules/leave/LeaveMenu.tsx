import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../setting/ThemeContext';
import { useLanguage } from '../setting/LanguageContext';

interface Translation {
  leaveManagement: string;
  leave: string;
  viewLeaveApplication: string;
  createLeaveApplication: string;
  viewLeaveEntitlements: string;
  approveLeaveApplication: string;
  error: string;
  baseUrlError: string;
  employeeIdError: string;
  fetchDataError: string;
}

const LeaveMenu = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [baseUrl, setBaseUrl] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasApprovalRole, setHasApprovalRole] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const getLocalizedText = (key: keyof Translation): string => {
    switch (language) {
      case 'ms':
        return {
          leaveManagement: 'Pengurusan Cuti',
          leave: 'Cuti',
          viewLeaveApplication: 'Lihat Permohonan Cuti',
          createLeaveApplication: 'Buat Permohonan Cuti',
          viewLeaveEntitlements: 'Lihat Baki Cuti',
          approveLeaveApplication: 'Luluskan Permohonan Cuti',
          error: 'Ralat',
          baseUrlError: 'URL asas tidak tersedia',
          employeeIdError: 'ID pekerja tidak tersedia',
          fetchDataError: 'Gagal mendapatkan data dari AsyncStorage',
        }[key] || key;

      case 'zh-Hans':
        return {
          leaveManagement: '请假管理',
          leave: '请假',
          viewLeaveApplication: '查看请假申请',
          createLeaveApplication: '创建请假申请',
          viewLeaveEntitlements: '查看休假余额',
          approveLeaveApplication: '批准请假申请',
          error: '错误',
          baseUrlError: '基本URL不可用',
          employeeIdError: '员工ID不可用',
          fetchDataError: '从AsyncStorage获取数据失败',
        }[key] || key;

      case 'zh-Hant':
        return {
          leaveManagement: '請假管理',
          leave: '請假',
          viewLeaveApplication: '查看請假申請',
          createLeaveApplication: '創建請假申請',
          viewLeaveEntitlements: '查看休假餘額',
          approveLeaveApplication: '批准請假申請',
          error: '錯誤',
          baseUrlError: '基本URL不可用',
          employeeIdError: '員工ID不可用',
          fetchDataError: '從AsyncStorage獲取數據失敗',
        }[key] || key;

      default: // 'en'
        return {
          leaveManagement: 'Leave Management',
          leave: 'Leave',
          viewLeaveApplication: 'View Leave Application',
          createLeaveApplication: 'Create Leave Application',
          viewLeaveEntitlements: 'View Leave Balance',
          approveLeaveApplication: 'Approve Leave Application',
          error: 'Error',
          baseUrlError: 'Base URL is not available',
          employeeIdError: 'Employee ID is not available',
          fetchDataError: 'Failed to fetch data from AsyncStorage',
        }[key] || key;
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: getLocalizedText('leave'),
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
    });
  }, [navigation, theme, language]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('LeaveMenu - Route params:', route.params);
        const storedBaseUrl = await AsyncStorage.getItem('baseUrl');
        const storedEmployeeId = await AsyncStorage.getItem('employeeId');
        const storedUserId = await AsyncStorage.getItem('userId');
        console.log('LeaveMenu - Stored userId:', storedUserId);
        console.log('LeaveMenu - Route params userId:', route.params?.userId);

        if (route.params?.userId) {
          setUserId(route.params.userId);
          console.log('LeaveMenu - Set userId from params:', route.params.userId);
        } else if (storedUserId) {
          setUserId(storedUserId);
          console.log('LeaveMenu - Set userId from storage:', storedUserId);
        }

        const userRole = await AsyncStorage.getItem('userRole');

        if (userRole === 'Approval') {
          setHasApprovalRole(true);
        }

        if (storedBaseUrl) {
          setBaseUrl(storedBaseUrl);
        } else {
          Alert.alert(getLocalizedText('error'), getLocalizedText('baseUrlError'));
        }

        if (storedEmployeeId) {
          setEmployeeId(storedEmployeeId);
        } else {
          Alert.alert(getLocalizedText('error'), getLocalizedText('employeeIdError'));
        }
      } catch (error) {
        console.error('LeaveMenu - Error:', error);
        Alert.alert(getLocalizedText('error'), getLocalizedText('fetchDataError'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const baseMenuItems = [
    {
      title: getLocalizedText('createLeaveApplication'),
      screen: 'CreateLeaveApplication',
      icon: require('../../../../asset/img/icon/arrow-right.png'),
    },
    {
      title: getLocalizedText('viewLeaveApplication'),
      screen: 'LeaveApplicationListing',
      icon: require('../../../../asset/img/icon/arrow-right.png'),
    },
    {
      title: getLocalizedText('viewLeaveEntitlements'),
      screen: 'LeaveEntitlementListing',
      icon: require('../../../../asset/img/icon/arrow-right.png'),
    },
  ];

  const menuItems = hasApprovalRole ? [
    ...baseMenuItems,
    {
      title: getLocalizedText('approveLeaveApplication'),
      screen: 'ApproveLeaveApplicationListing',
      icon: require('../../../../asset/img/icon/arrow-right.png'),
    }
  ] : baseMenuItems;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>{getLocalizedText('leaveManagement')}</Text>
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuCard, 
              { 
                backgroundColor: theme.card,
                shadowColor: theme.shadowColor,
              }
            ]}
            onPress={() => {
              console.log('LeaveMenu - Navigating to', item.screen, 'with userId:', userId);
              navigation.navigate(item.screen, { 
                baseUrl, 
                employeeId,
                userId
              });
            }}
          >
            <View style={styles.menuContent}>
              <Text style={[styles.menuText, { color: theme.text }]}>{item.title}</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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

export default LeaveMenu;
