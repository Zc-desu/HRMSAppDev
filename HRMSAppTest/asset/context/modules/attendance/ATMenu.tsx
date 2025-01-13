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
          timeAndAttendance: 'Masa & Kehadiran',
          clockInOut: 'Masuk/Keluar',
          attendanceManagement: 'Pengurusan Kehadiran',
          timeLogListing: 'Sejarah Log Masa',
          pendingApplications: 'Permohonan Tertunda',
          overtimeApplications: 'Sejarah Kerja Lebih Masa',
          createOvertime: 'Buat Kerja Lebih Masa',
          attendancePendingApplications: 'Kelulusan Log Masa',
          overtimePendingApplications: 'Kelulusan Kerja Lebih Masa',
          attendanceSection: 'Kehadiran',
          overtimeManagement: 'Kerja Lebih Masa',
          backDateApplication: 'Permohonan Tarikh Lampau',
          dutyRosterCalendar: 'Kalendar Jadual Tugas',
        }[key] || key;
      
      case 'zh-Hans':
        return {
          attendance: '考勤',
          timeAndAttendance: '时间和考勤',
          clockInOut: '打卡',
          attendanceManagement: '考勤管理',
          timeLogListing: '打卡记录',
          pendingApplications: '待处理申请',
          overtimeApplications: '加班记录',
          createOvertime: '创建加班申请',
          attendancePendingApplications: '考勤审批',
          overtimePendingApplications: '加班审批',
          attendanceSection: '考勤管理',
          overtimeManagement: '加班管理',
          backDateApplication: '补打卡申请',
          dutyRosterCalendar: '值班日历',
        }[key] || key;
      
      case 'zh-Hant':
        return {
          attendance: '考勤',
          timeAndAttendance: '時間和考勤',
          clockInOut: '打卡',
          attendanceManagement: '考勤管理',
          timeLogListing: '打卡記錄',
          pendingApplications: '待處理申請',
          overtimeApplications: '加班紀錄',
          createOvertime: '創建加班申請',
          attendancePendingApplications: '考勤審批',
          overtimePendingApplications: '加班審批',
          attendanceSection: '考勤管理',
          overtimeManagement: '加班管理',
          backDateApplication: '補打卡申請',
          dutyRosterCalendar: '值班日曆',
        }[key] || key;
      
      default: // 'en'
        return {
          attendance: 'Attendance',
          timeAndAttendance: 'Time & Attendance',
          clockInOut: 'Clock In/Out',
          attendanceManagement: 'Attendance Management',
          timeLogListing: 'Time Log History',
          pendingApplications: 'Pending Applications',
          overtimeApplications: 'Overtime History',
          createOvertime: 'Create Overtime',
          attendancePendingApplications: 'Time Log Approvals',
          overtimePendingApplications: 'Overtime Approvals',
          attendanceSection: 'Attendance',
          overtimeManagement: 'Overtime',
          backDateApplication: 'Back Date Application',
          dutyRosterCalendar: 'Duty Roster Calendar',
        }[key] || key;
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: getLocalizedText('attendance'),
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
    });
  }, [navigation, theme, language]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  const attendanceMenuItems = [
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
      title: getLocalizedText('backDateApplication'),
      onPress: () => navigation.navigate('ATBackDateTLApplication', {
        employeeId,
        companyId,
        baseUrl
      }),
      icon: require('../../../../asset/img/icon/arrow-right.png'),
    },
    {
      title: getLocalizedText('dutyRosterCalendar'),
      onPress: () => navigation.navigate('ATDutyRoasterCalendar', {
        employeeId,
        companyId,
        baseUrl
      }),
      icon: require('../../../../asset/img/icon/arrow-right.png'),
    },
  ];

  const overtimeMenuItems = [
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

  const approvalMenuItems = hasApprovalRole ? [
    {
      section: 'attendance',
      title: getLocalizedText('attendancePendingApplications'),
      onPress: () => navigation.navigate('ATPendingApplicationListing'),
      icon: require('../../../../asset/img/icon/arrow-right.png'),
    },
    {
      section: 'overtime',
      title: getLocalizedText('overtimePendingApplications'),
      onPress: () => navigation.navigate('OTPendingApplicationListing'),
      icon: require('../../../../asset/img/icon/arrow-right.png'),
    }
  ] : [];

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.menuContainer}>
        {/* Time & Attendance Section */}
        <Text style={[styles.sectionHeader, { color: theme.text }]}>
          {getLocalizedText('timeAndAttendance')}
        </Text>
        {[...attendanceMenuItems, 
          ...approvalMenuItems.filter(item => item.section === 'attendance')
        ].map((item, index) => (
          <TouchableOpacity
            key={`attendance-${index}`}
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

        {/* Overtime Section */}
        <Text style={[styles.sectionHeader, { color: theme.text, marginTop: 24 }]}>
          {getLocalizedText('overtimeManagement')}
        </Text>
        {[...overtimeMenuItems,
          ...approvalMenuItems.filter(item => item.section === 'overtime')
        ].map((item, index) => (
          <TouchableOpacity
            key={`overtime-${index}`}
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
  menuContainer: {
    flex: 1,
    paddingTop: 8,
  },
  menuCard: {
    borderRadius: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 12,
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
  sectionHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
});

export default ATMenu;
