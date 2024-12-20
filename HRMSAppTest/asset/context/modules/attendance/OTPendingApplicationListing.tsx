import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
} from 'react-native';
import { useTheme } from '../setting/ThemeContext';
import { useLanguage } from '../setting/LanguageContext';
import CustomAlert from '../setting/CustomAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Swipeable } from 'react-native-gesture-handler';

// Translations
const translations = {
  'en': {
    title: 'Overtime Approvals',
    loading: 'Loading applications...',
    error: 'Error loading applications',
    retry: 'Retry',
    noApplications: 'No pending applications',
    employee: 'Employee',
    duration: 'Duration',
    date: 'Date',
    hours: 'hours',
    errorTitle: 'Error',
    ok: 'OK',
    approve: 'Approve',
    reject: 'Reject',
  },
  'ms': {
    title: 'Kelulusan Kerja Lebih Masa',
    loading: 'Memuat permohonan...',
    error: 'Ralat memuat permohonan',
    retry: 'Cuba semula',
    noApplications: 'Tiada permohonan tertunda',
    employee: 'Pekerja',
    duration: 'Tempoh',
    date: 'Tarikh',
    hours: 'jam',
    errorTitle: 'Ralat',
    ok: 'OK',
    approve: 'Lulus',
    reject: 'Tolak',
  },
  'zh-Hans': {
    title: '加班审批',
    loading: '加载申请中...',
    error: '加载申请时出错',
    retry: '重试',
    noApplications: '没有待处理的申请',
    employee: '员工',
    duration: '时长',
    date: '日期',
    hours: '小时',
    errorTitle: '错误',
    ok: '确定',
    approve: '批准',
    reject: '拒绝',
  },
  'zh-Hant': {
    title: '加班審批',
    loading: '載入申請中...',
    error: '載入申請時出錯',
    retry: '重試',
    noApplications: '沒有待處理的申請',
    employee: '員工',
    duration: '時長',
    date: '日期',
    hours: '小時',
    errorTitle: '錯誤',
    ok: '確定',
    approve: '批准',
    reject: '拒絕',
  },
};

interface Application {
  approvalActionId: number;
  employeeId: number;
  applicationId: number;
  employeeName: string;
  appDateTimeFrom: string;
  appDateTimeTo: string;
  overtimeDuration: number;
  applicationReason: string;
  actionType: string;
}

const OTPendingApplicationListing = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = translations[language];

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
  });
  const [baseUrl, setBaseUrl] = useState<string>('');

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

  useEffect(() => {
    AsyncStorage.getItem('baseUrl').then(url => {
      if (url) setBaseUrl(url);
    });
  }, []);

  const fetchApplications = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const baseUrl = await AsyncStorage.getItem('baseUrl');
      
      if (!token || !baseUrl) throw new Error('Authentication failed');

      const response = await fetch(
        `${baseUrl}/apps/api/v1/overtime/approvals/pending-applications`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        setApplications(result.data);
      } else {
        throw new Error(result.message || 'Failed to fetch applications');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      setAlertConfig({
        visible: true,
        title: t.errorTitle,
        message: t.error,
      });
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
    // Or for more control:
    // return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const renderRightActions = (item: Application, navigation: any, baseUrl: string) => {
    const handleApprove = () => {
      navigation.navigate('OTPendingApplicationDetails', {
        baseUrl,
        approvalActionId: item.approvalActionId,
        employeeId: item.employeeId,
        applicationId: item.applicationId,
        actionType: 'APPROVE'
      });
    };

    const handleReject = () => {
      navigation.navigate('OTPendingApplicationDetails', {
        baseUrl,
        approvalActionId: item.approvalActionId,
        employeeId: item.employeeId,
        applicationId: item.applicationId,
        actionType: 'REJECT'
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

  const renderItem = ({ item }: { item: Application }) => {
    const handlePress = async () => {
      try {
        const baseUrl = await AsyncStorage.getItem('baseUrl');
        navigation.navigate('OTPendingApplicationDetails', {
          baseUrl,
          approvalActionId: item.approvalActionId,
          employeeId: item.employeeId,
          applicationId: item.applicationId,
          actionType: item.actionType,
        });
      } catch (error) {
        console.error('Navigation error:', error);
        setAlertConfig({
          visible: true,
          title: t.errorTitle,
          message: t.error,
        });
      }
    };

    return (
      <Swipeable
        renderRightActions={() => renderRightActions(item, navigation, baseUrl)}
        rightThreshold={40}
        overshootRight={false}
        friction={2}
      >
        <TouchableOpacity
          style={[styles.card, { backgroundColor: theme.card }]}
          onPress={handlePress}
        >
          <View style={styles.cardContent}>
            <Text style={[styles.employeeName, { color: theme.text }]}>
              {item.employeeName}
            </Text>
            <Text style={[styles.dateText, { color: theme.subText }]}>
              {`${t.date}: ${formatDate(item.appDateTimeFrom)}`}
            </Text>
            <Text style={[styles.durationText, { color: theme.subText }]}>
              {`${t.duration}: ${item.overtimeDuration} ${t.hours}`}
            </Text>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
        <Text style={[styles.loadingText, { color: theme.text }]}>{t.loading}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={applications}
        renderItem={renderItem}
        keyExtractor={(item) => item.approvalActionId.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: theme.text }]}>
            {t.noApplications}
          </Text>
        }
      />
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={[
          {
            text: t.ok,
            onPress: () => setAlertConfig({ ...alertConfig, visible: false }),
          },
        ]}
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
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    height: 90,
    width: '100%',
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardContent: {
    gap: 4,
    width: '100%',
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#000000',
  },
  dateText: {
    fontSize: 14,
    color: '#666666',
  },
  durationText: {
    fontSize: 14,
    color: '#666666',
  },
  loadingText: {
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
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

export default OTPendingApplicationListing;
