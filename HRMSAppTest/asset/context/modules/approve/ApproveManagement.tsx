import React, { useLayoutEffect, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useTheme } from '../setting/ThemeContext';
import { useLanguage } from '../setting/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import SwipeLeftRightAnimation from '../../anim/swipeLeftRightAnimation';

interface Translation {
  approvalManagement: string;
  approval: string;
  leaveApprovals: string;
  timeLogApprovals: string;
  overtimeApprovals: string;
}

const ApproveManagement = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [counts, setCounts] = useState({
    leave: 0,
    attendance: 0,
    overtime: 0
  });
  const [showSwipeAnimation, setShowSwipeAnimation] = useState(false);

  const fetchCounts = async () => {
    try {
      setLoading(true);
      const baseUrl = await AsyncStorage.getItem('baseUrl');
      const token = await AsyncStorage.getItem('userToken');

      if (!baseUrl || !token) {
        throw new Error('Missing baseUrl or token');
      }

      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      };

      // Fetch all three counts in parallel
      const [leaveRes, attendanceRes, overtimeRes] = await Promise.all([
        fetch(`${baseUrl}/apps/api/v1/leaves/approvals/pending-applications`, { headers }),
        fetch(`${baseUrl}/apps/api/v1/attendance/time-logs/pending-applications`, { headers }),
        fetch(`${baseUrl}/apps/api/v1/overtime/approvals/pending-applications`, { headers })
      ]);

      const [leaveData, attendanceData, overtimeData] = await Promise.all([
        leaveRes.json(),
        attendanceRes.json(),
        overtimeRes.json()
      ]);

      setCounts({
        leave: leaveData.success ? leaveData.data.length : 0,
        attendance: attendanceData.success ? attendanceData.data.length : 0,
        overtime: overtimeData.success ? overtimeData.data.length : 0
      });
    } catch (error) {
      console.error('Error fetching counts:', error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchCounts();
    }, [])
  );

  useEffect(() => {
    checkSwipeAnimation();
  }, []);

  const checkSwipeAnimation = async () => {
    try {
      const neverShow = await AsyncStorage.getItem('approveManagement_neverShowSwipe');
      const lastShown = await AsyncStorage.getItem('approveManagement_lastShownSwipe');
      
      if (neverShow === 'true') {
        return;
      }

      const today = new Date().toDateString();
      if (lastShown !== today) {
        setShowSwipeAnimation(true);
      }
    } catch (error) {
      console.error('Error checking swipe animation status:', error);
    }
  };

  const handleSwipeAnimationDismiss = async (neverShowAgain: boolean) => {
    try {
      if (neverShowAgain) {
        await AsyncStorage.setItem('approveManagement_neverShowSwipe', 'true');
      } else {
        await AsyncStorage.setItem('approveManagement_lastShownSwipe', new Date().toDateString());
      }
      setShowSwipeAnimation(false);
    } catch (error) {
      console.error('Error saving swipe animation preference:', error);
    }
  };

  const getLocalizedText = (key: keyof Translation): string => {
    switch (language) {
      case 'ms':
        return {
          approvalManagement: 'Pengurusan Kelulusan',
          approval: 'Kelulusan',
          leaveApprovals: 'Kelulusan Cuti',
          timeLogApprovals: 'Kelulusan Log Masa',
          overtimeApprovals: 'Kelulusan Kerja Lebih Masa',
        }[key] || key;

      case 'zh-Hans':
        return {
          approvalManagement: '审批管理',
          approval: '审批',
          leaveApprovals: '请假审批',
          timeLogApprovals: '考勤审批',
          overtimeApprovals: '加班审批',
        }[key] || key;

      case 'zh-Hant':
        return {
          approvalManagement: '審批管理',
          approval: '審批',
          leaveApprovals: '請假審批',
          timeLogApprovals: '考勤審批',
          overtimeApprovals: '加班審批',
        }[key] || key;

      default: // 'en'
        return {
          approvalManagement: 'Approval Management',
          approval: 'Approval',
          leaveApprovals: 'Leave Approvals',
          timeLogApprovals: 'Time Log Approvals',
          overtimeApprovals: 'Overtime Approvals',
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
      count: counts.leave
    },
    {
      title: getLocalizedText('timeLogApprovals'),
      screen: 'ATPendingApplicationListing',
      icon: require('../../../../asset/img/icon/arrow-right.png'),
      count: counts.attendance
    },
    {
      title: getLocalizedText('overtimeApprovals'),
      screen: 'OTPendingApplicationListing',
      icon: require('../../../../asset/img/icon/arrow-right.png'),
      count: counts.overtime
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
            style={[styles.menuCard, { backgroundColor: theme.card }]}
            onPress={() => navigation.navigate(item.screen)}
          >
            <View style={styles.menuContent}>
              <View style={styles.menuTextContainer}>
                <Text style={[styles.menuText, { color: theme.text }]}>
                  {item.title}
                </Text>
                {item.count > 0 && (
                  <View style={[styles.badge, { backgroundColor: theme.primary }]}>
                    <Text style={styles.badgeText}>{item.count}</Text>
                  </View>
                )}
              </View>
              <Image
                source={item.icon}
                style={[styles.icon, { tintColor: theme.primary }]}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {showSwipeAnimation && (
        <SwipeLeftRightAnimation onDismiss={handleSwipeAnimationDismiss} />
      )}
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
  menuTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default ApproveManagement;
