import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
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
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../setting/ThemeContext';
import { useLanguage } from '../setting/LanguageContext';
import CustomAlert from '../setting/CustomAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Swipeable from 'react-native-gesture-handler/Swipeable';

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
    confirmAction: 'Confirm Action',
    approveConfirm: 'Are you sure you want to approve this application?',
    rejectConfirm: 'Are you sure you want to reject this application?',
    cancel: 'Cancel',
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
    confirmAction: 'Konfirmasi Aksi',
    approveConfirm: 'Adakah anda pasti ingin menyetujui permohonan ini?',
    rejectConfirm: 'Adakah anda pasti ingin menolak permohonan ini?',
    cancel: 'Batal',
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
    confirmAction: '确认操作',
    approveConfirm: '您确定要批准此申请吗？',
    rejectConfirm: '您确定要拒绝此申请吗？',
    cancel: '取消',
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
    confirmAction: '確認操作',
    approveConfirm: '您確定要批准此申請嗎？',
    rejectConfirm: '您確定要拒絕此申請嗎？',
    cancel: '取消',
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
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const swipeableRefs = useRef<{ [key: number]: Swipeable | null }>({});

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

  const renderLeftActions = (progress: any, dragX: any, application: Application) => {
    return (
      <LinearGradient
        colors={['#34C759', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.leftActionGradient}
      >
        <View style={styles.leftActionContent}>
          <Image
            source={require('../../../../asset/img/icon/a-check.png')}
            style={styles.actionIcon}
          />
          <Text style={styles.approveText}>{t.approve}</Text>
        </View>
      </LinearGradient>
    );
  };

  const renderRightActions = (progress: any, dragX: any) => {
    return (
      <LinearGradient
        colors={['transparent', '#FF3B30']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.rightActionGradient}
      >
        <View style={styles.rightActionContent}>
          <Image
            source={require('../../../../asset/img/icon/a-close.png')}
            style={styles.actionIcon}
          />
          <Text style={styles.rejectText}>{t.reject}</Text>
        </View>
      </LinearGradient>
    );
  };

  const closeOtherSwipeables = useCallback((currentId: number) => {
    Object.entries(swipeableRefs.current).forEach(([key, ref]) => {
      if (ref && Number(key) !== currentId) {
        ref.close();
      }
    });
  }, []);

  const handleSwipeAction = useCallback((application: Application, direction: 'left' | 'right', ref: Swipeable) => {
    closeOtherSwipeables(application.approvalActionId);
    
    if (direction === 'left') {
      setSelectedApplication(application);
      setActionType('APPROVE');
      setShowConfirmAlert(true);
    } else {
      setSelectedApplication(application);
      setActionType('REJECT');
      setShowConfirmAlert(true);
    }
  }, [closeOtherSwipeables]);

  const renderItem = ({ item }: { item: Application }) => {
    return (
      <View style={styles.cardWrapper}>
        <Swipeable
          ref={(ref) => {
            if (ref) {
              swipeableRefs.current[item.approvalActionId] = ref;
            } else {
              delete swipeableRefs.current[item.approvalActionId];
            }
          }}
          renderLeftActions={(progress, dragX) => renderLeftActions(progress, dragX, item)}
          renderRightActions={renderRightActions}
          friction={2}
          leftThreshold={80}
          rightThreshold={80}
          overshootLeft={false}
          overshootRight={false}
          onSwipeableWillOpen={(direction) => {
            const currentRef = swipeableRefs.current[item.approvalActionId];
            if (currentRef) {
              handleSwipeAction(item, direction as 'left' | 'right', currentRef);
            }
          }}
        >
          <TouchableOpacity
            style={[styles.card, { backgroundColor: theme.card }]}
            onPress={() => navigation.navigate('OTPendingApplicationDetails', {
              baseUrl,
              approvalActionId: item.approvalActionId,
              employeeId: item.employeeId,
              applicationId: item.applicationId,
              actionType: null
            })}
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
      </View>
    );
  };

  // Clean up refs when component unmounts
  useEffect(() => {
    return () => {
      swipeableRefs.current = {};
    };
  }, []);

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
        visible={showConfirmAlert}
        title={t.confirmAction}
        message={actionType === 'APPROVE' ? t.approveConfirm : t.rejectConfirm}
        buttons={[
          {
            text: t.cancel,
            style: 'cancel',
            onPress: () => {
              const ref = selectedApplication && swipeableRefs.current[selectedApplication.approvalActionId];
              if (ref) {
                ref.close();
              }
              setShowConfirmAlert(false);
              setSelectedApplication(null);
              setActionType(null);
            }
          },
          {
            text: t.ok,
            onPress: () => {
              if (selectedApplication && actionType) {
                const ref = swipeableRefs.current[selectedApplication.approvalActionId];
                if (ref) {
                  ref.close();
                }
                console.debug('Navigating with params:', {
                  baseUrl,
                  approvalActionId: selectedApplication.approvalActionId,
                  employeeId: selectedApplication.employeeId,
                  applicationId: selectedApplication.applicationId,
                  actionType
                });
                
                navigation.navigate('OTPendingApplicationDetails', {
                  baseUrl,
                  approvalActionId: selectedApplication.approvalActionId,
                  employeeId: selectedApplication.employeeId,
                  applicationId: selectedApplication.applicationId,
                  actionType
                });
              }
              setShowConfirmAlert(false);
              setSelectedApplication(null);
              setActionType(null);
            }
          }
        ]}
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
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
    marginBottom: 4,
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
  cardWrapper: {
    marginBottom: 8,
    width: '100%',
  },
  actionIconStyle: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
    marginBottom: 4,
  },
  leftActionGradient: {
    width: 80,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  rightActionGradient: {
    width: 80,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  leftActionContent: {
    alignItems: 'center',
  },
  rightActionContent: {
    alignItems: 'center',
  },
  approveText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  rejectText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default OTPendingApplicationListing;
