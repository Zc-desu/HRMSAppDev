import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useTheme } from '../setting/ThemeContext';
import { useLanguage } from '../setting/LanguageContext';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import AsyncStorage from '@react-native-async-storage/async-storage';

type PendingApplication = {
  employeeId: number;
  employeeName: string;
  createDate: string;
  approvalActionId: number;
  applicationId: number;
  attendanceDateTime: string;
  reason: string | null;
};

type Translation = {
  title: string;
  noApplications: string;
  loading: string;
  error: string;
  retry: string;
  clockIn: string;
  clockOut: string;
  approve: string;
  reject: string;
};

const translations: Record<string, Translation> = {
  'en': {
    title: 'Attendance Approvals',
    noApplications: 'No pending applications',
    loading: 'Loading...',
    error: 'Failed to load applications',
    retry: 'Retry',
    clockIn: 'Clock In',
    clockOut: 'Clock Out',
    approve: 'Approve',
    reject: 'Reject',
  },
  'ms': {
    title: 'Kelulusan Kehadiran',
    noApplications: 'Tiada permohonan tertunda',
    loading: 'Memuatkan...',
    error: 'Gagal memuat permohonan',
    retry: 'Cuba semula',
    clockIn: 'Daftar Masuk',
    clockOut: 'Daftar Keluar',
    approve: 'Lulus',
    reject: 'Tolak',
  },
  'zh-Hans': {
    title: '考勤审批',
    noApplications: '没有待处理的申请',
    loading: '加载中...',
    error: '加载申请失败',
    retry: '重试',
    clockIn: '签到',
    clockOut: '签退',
    approve: '批准',
    reject: '拒绝',
  },
  'zh-Hant': {
    title: '考勤審批',
    noApplications: '沒有待處理的申請',
    loading: '載入中...',
    error: '載入申請失敗',
    retry: '重試',
    clockIn: '簽到',
    clockOut: '簽退',
    approve: '批准',
    reject: '拒絕',
  },
};

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${day}/${month}/${year} ${hours}:${minutes}`;
};

const ATPendingApplicationListing = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = translations[language];
  const [applications, setApplications] = useState<PendingApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: theme.headerBackground,
      },
      headerTintColor: theme.headerText,
      headerTitleStyle: {
        color: theme.headerText,
      },
      title: t.title,
    });
  }, [navigation, theme, language]);

  const fetchApplications = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const baseUrl = await AsyncStorage.getItem('baseUrl');
      
      if (!userToken || !baseUrl) throw new Error('Authentication failed');

      const response = await fetch(
        `${baseUrl}/apps/api/v1/attendance/time-logs/pending-applications`,
        {
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Accept': 'application/json',
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        setApplications(result.data);
        setError(null);
      } else {
        setError(result.message || t.error);
      }
    } catch (err) {
      setError(t.error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchApplications();
  };

  const renderRightActions = (application: PendingApplication) => {
    const handleApprove = () => {
      navigation.navigate('ATPendingApplicationDetails', { 
        application: {
          ...application,
          actionType: 'APPROVE'
        }
      });
    };

    const handleReject = () => {
      navigation.navigate('ATPendingApplicationDetails', { 
        application: {
          ...application,
          actionType: 'REJECT'
        }
      });
    };

    return (
      <View style={styles.rightActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.approveButton]}
          onPress={handleApprove}
        >
          <Image
            source={require('../../../../asset/img/icon/a-check.png')}
            style={[styles.actionIcon, styles.approveIcon]}
          />
          <Text style={[styles.actionButtonText, styles.approveButtonText]}>
            {t.approve}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.rejectButton]}
          onPress={handleReject}
        >
          <Image
            source={require('../../../../asset/img/icon/a-close.png')}
            style={[styles.actionIcon, styles.rejectIcon]}
          />
          <Text style={[styles.actionButtonText, styles.rejectButtonText]}>
            {t.reject}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderItem = ({ item }: { item: PendingApplication }) => (
    <Swipeable
      renderRightActions={() => renderRightActions(item)}
      rightThreshold={40}
      overshootRight={false}
      friction={2}
    >
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.card }]}
        onPress={() => navigation.navigate('ATPendingApplicationDetails', { application: item })}
      >
        <View style={styles.cardHeader}>
          <Text style={[styles.employeeName, { color: theme.text }]}>
            {item.employeeName}
          </Text>
          <Text style={[styles.date, { color: theme.subText }]}>
            {formatDateTime(item.createDate)}
          </Text>
        </View>
        <Text style={[styles.reason, { color: theme.subText }]}>
          {item.reason || '-'}
        </Text>
      </TouchableOpacity>
    </Swipeable>
  );

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={applications}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.applicationId}`}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.subText }]}>
              {error || t.noApplications}
            </Text>
            {error && (
              <TouchableOpacity
                style={[styles.retryButton, { backgroundColor: theme.primary }]}
                onPress={fetchApplications}
              >
                <Text style={styles.retryButtonText}>{t.retry}</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    marginLeft: 16,
    marginRight: 8,
    height: 90,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
  },
  date: {
    fontSize: 14,
  },
  reason: {
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  rightActions: {
    flexDirection: 'row',
    height: 90,
    marginRight: 0,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 65,
    height: '100%',
  },
  approveButton: {
    backgroundColor: '#34C759',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    marginRight: 1,
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  actionIcon: {
    width: 20,
    height: 20,
    marginBottom: 4,
    tintColor: '#FFFFFF',
  },
  approveIcon: {
    tintColor: '#FFFFFF',
  },
  rejectIcon: {
    tintColor: '#FFFFFF',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  approveButtonText: {
    color: '#FFFFFF',
  },
  rejectButtonText: {
    color: '#FFFFFF',
  },
});

export default ATPendingApplicationListing;
