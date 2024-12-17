import React, { useLayoutEffect, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useTheme } from '../setting/ThemeContext';
import { useLanguage } from '../setting/LanguageContext';

interface Translation {
  approvalManagement: string;
  approval: string;
  leaveApprovals: string;
  attendanceApprovals: string;
}

const ApproveManagement = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);

  const getLocalizedText = (key: keyof Translation): string => {
    switch (language) {
      case 'ms':
        return {
          approvalManagement: 'Pengurusan Kelulusan',
          approval: 'Kelulusan',
          leaveApprovals: 'Kelulusan Cuti',
          attendanceApprovals: 'Kelulusan Kehadiran',
        }[key] || key;

      case 'zh-Hans':
        return {
          approvalManagement: '审批管理',
          approval: '审批',
          leaveApprovals: '请假审批',
          attendanceApprovals: '考勤审批',
        }[key] || key;

      case 'zh-Hant':
        return {
          approvalManagement: '審批管理',
          approval: '審批',
          leaveApprovals: '請假審批',
          attendanceApprovals: '考勤審批',
        }[key] || key;

      default: // 'en'
        return {
          approvalManagement: 'Approval Management',
          approval: 'Approval',
          leaveApprovals: 'Leave Approvals',
          attendanceApprovals: 'Attendance Approvals',
        }[key] || key;
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: getLocalizedText('approval'),
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

  const menuItems = [
    {
      title: getLocalizedText('leaveApprovals'),
      screen: 'ApproveLeaveApplicationListing',
      icon: require('../../../../asset/img/icon/arrow-right.png'),
    },
    {
      title: getLocalizedText('attendanceApprovals'),
      screen: 'ATPendingApplicationListing',
      icon: require('../../../../asset/img/icon/arrow-right.png'),
    },
  ];

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>
        {getLocalizedText('approvalManagement')}
      </Text>
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
            onPress={() => navigation.navigate(item.screen)}
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

export default ApproveManagement;
