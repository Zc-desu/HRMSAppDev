import React, { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
  Modal,
  TextInput,
} from 'react-native';
import { useTheme } from '../setting/ThemeContext';
import { useLanguage } from '../setting/LanguageContext';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import CustomAlert from '../setting/CustomAlert';

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
  confirmAction: string;
  enterRejectReason: string;
  remarksPlaceholder: string;
  remarksRequired: string;
  rejectConfirm: string;
  approveConfirm: string;
  cancel: string;
  confirm: string;
  success: string;
  rejectSuccess: string;
  approveSuccess: string;
  failedToProcess: string;
  rejectReasonLanguage: string;
  ok: string;
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
    confirmAction: 'Confirm',
    enterRejectReason: 'Enter reject reason',
    remarksPlaceholder: 'Enter your remarks here',
    remarksRequired: 'Remarks are required',
    rejectConfirm: 'Are you sure you want to reject this application?',
    approveConfirm: 'Are you sure you want to approve this application?',
    cancel: 'Cancel',
    confirm: 'Confirm',
    success: 'Success',
    rejectSuccess: 'Rejection successful',
    approveSuccess: 'Approval successful',
    failedToProcess: 'Failed to process',
    rejectReasonLanguage: 'Please enter reason in English or Bahasa Melayu only',
    ok: 'OK',
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
    confirmAction: 'Konfirmasi',
    enterRejectReason: 'Masukkan alasan penolakan',
    remarksPlaceholder: 'Masukkan sebab anda di sini...',
    remarksRequired: 'Sila masukkan sebab penolakan',
    rejectConfirm: 'Adakah anda pasti mahu menolak permohonan ini?',
    approveConfirm: 'Adakah anda pasti mahu lulus permohonan ini?',
    cancel: 'Batal',
    confirm: 'Konfirmasi',
    success: 'Berjaya',
    rejectSuccess: 'Penolakan berjaya',
    approveSuccess: 'Kelulusan berjaya',
    failedToProcess: 'Gagal memproses permintaan',
    rejectReasonLanguage: 'Sila masukkan sebab dalam Bahasa Inggeris atau Bahasa Melayu sahaja',
    ok: 'OK',
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
    confirmAction: '确认',
    enterRejectReason: '输入拒绝理由',
    remarksPlaceholder: '在这里输入你的备注',
    remarksRequired: '备注是必需的',
    rejectConfirm: '你确定要拒绝这个申请吗？',
    approveConfirm: '你确定要批准这个申请吗？',
    cancel: '取消',
    confirm: '确认',
    success: '成功',
    rejectSuccess: '拒绝成功',
    approveSuccess: '批准成功',
    failedToProcess: '处理失败',
    rejectReasonLanguage: '在这里输入你的拒绝理由',
    ok: '确定',
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
    confirmAction: '確認',
    enterRejectReason: '輸入拒絕理由',
    remarksPlaceholder: '在此輸入你的備註',
    remarksRequired: '備註是必需的',
    rejectConfirm: '你確定要拒絕這個申請嗎？',
    approveConfirm: '你確定要批准這個申請嗎？',
    cancel: '取消',
    confirm: '確認',
    success: '成功',
    rejectSuccess: '拒絕成功',
    approveSuccess: '批准成功',
    failedToProcess: '處理失敗',
    rejectReasonLanguage: '在此輸入你的拒絕理由',
    ok: '確定',
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

interface AlertButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertConfig {
  visible: boolean;
  title: string;
  message: string;
  buttons: AlertButton[];
}

const ATPendingApplicationListing = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = translations[language];
  const [applications, setApplications] = useState<PendingApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<PendingApplication | null>(null);
  const [remarks, setRemarks] = useState('');
  const swipeableRefs = useRef<{ [key: number]: Swipeable | null }>({});
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    visible: false,
    title: '',
    message: '',
    buttons: []
  });

  const styles = StyleSheet.create({
    container: {
      flex: 1,
    },
    yearSelectorContainer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 12,
      backgroundColor: theme.card,
      marginHorizontal: 16,
      marginVertical: 8,
      borderRadius: 12,
    },
    yearButton: {
      padding: 8,
      width: 40,
      height: 40,
      alignItems: 'center',
      justifyContent: 'center',
    },
    arrowIcon: {
      width: 24,
      height: 24,
      resizeMode: 'contain',
    },
    yearText: {
      fontSize: 18,
      fontWeight: '600',
      marginHorizontal: 16,
      color: theme.text,
    },
    listContainer: {
      padding: 16,
    },
    card: {
      padding: 16,
      borderRadius: 12,
      height: 80,
      justifyContent: 'center',
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    employeeName: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 4,
    },
    date: {
      fontSize: 14,
      color: '#666',
    },
    reason: {
      fontSize: 14,
      color: '#666',
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
      height: 80,
      marginRight: 16,
    },
    actionButton: {
      justifyContent: 'center',
      alignItems: 'center',
      width: 80,
      height: '100%',
    },
    approveButton: {
      backgroundColor: '#34C759',
      borderTopLeftRadius: 12,
      borderBottomLeftRadius: 12,
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
    leftActions: {
      width: 80,
      height: '100%',
      position: 'absolute',
      left: 0,
    },
    gradientContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderTopLeftRadius: 12,
      borderBottomLeftRadius: 12,
      padding: 8,
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
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '80%',
      padding: 20,
      borderRadius: 12,
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: '600',
      marginBottom: 16,
    },
    modalSubtitle: {
      fontSize: 14,
      color: '#666',
      marginBottom: 16,
    },
    input: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      height: 100,
      textAlignVertical: 'top',
      marginBottom: 16,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    button: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      marginLeft: 8,
    },
    buttonText: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
    leftActionGradient: {
      width: 80,
      height: 80,
      justifyContent: 'center',
      alignItems: 'center',
      borderTopLeftRadius: 12,
      borderBottomLeftRadius: 12,
    },
    rightActionGradient: {
      width: 80,
      height: 80,
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
  });

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
        const years = [...new Set(result.data.map((app: PendingApplication) => 
          new Date(app.createDate).getFullYear()
        ))].sort() as number[];
        setAvailableYears(years);

        const filteredApplications = result.data.filter((app: PendingApplication) => 
          new Date(app.createDate).getFullYear() === selectedYear
        );

        const sortedApplications = filteredApplications.sort((a: PendingApplication, b: PendingApplication) => 
          new Date(b.createDate).getTime() - new Date(a.createDate).getTime()
        );

        setApplications(sortedApplications);
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
  }, [selectedYear]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchApplications();
  };

  const closeOtherSwipeables = useCallback((currentId: number) => {
    Object.entries(swipeableRefs.current).forEach(([key, ref]) => {
      if (ref && Number(key) !== currentId) {
        ref.close();
      }
    });
  }, []);

  const handleSwipeAction = useCallback((application: PendingApplication, direction: 'left' | 'right', ref: Swipeable) => {
    closeOtherSwipeables(application.applicationId);
    
    setTimeout(() => {
      if (direction === 'left') {
        setSelectedApplication(application);
        setShowConfirmAlert(true);
      } else {
        setSelectedApplication(application);
        setShowRejectInput(true);
      }
    }, 100);
  }, [closeOtherSwipeables]);

  const renderItem = ({ item }: { item: PendingApplication }) => (
    <View style={styles.cardWrapper}>
      <Swipeable
        ref={(ref) => {
          if (ref) {
            swipeableRefs.current[item.applicationId] = ref;
          } else {
            delete swipeableRefs.current[item.applicationId];
          }
        }}
        renderLeftActions={(progress, dragX) => (
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
        )}
        renderRightActions={(progress, dragX) => (
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
        )}
        friction={2}
        leftThreshold={80}
        rightThreshold={80}
        overshootLeft={false}
        overshootRight={false}
        onSwipeableWillOpen={(direction) => {
          const currentRef = swipeableRefs.current[item.applicationId];
          if (currentRef) {
            handleSwipeAction(item, direction as 'left' | 'right', currentRef);
          }
        }}
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
    </View>
  );

  const closeSwipeable = useCallback(() => {
    Object.values(swipeableRefs.current).forEach(ref => {
      if (ref) {
        ref.close();
      }
    });
  }, []);

  useEffect(() => {
    return () => {
      swipeableRefs.current = {};
    };
  }, []);

  const renderYearSelector = () => {
    return (
      <View style={styles.yearSelectorContainer}>
        <TouchableOpacity 
          style={styles.yearButton}
          onPress={() => {
            const prevYear = selectedYear - 1;
            if (availableYears.includes(prevYear)) {
              setSelectedYear(prevYear);
            }
          }}
        >
          <Image 
            source={require('../../../../asset/img/icon/a-d-arrow-left.png')}
            style={[styles.arrowIcon, { tintColor: theme.primary }]}
          />
        </TouchableOpacity>
        
        <Text style={styles.yearText}>{selectedYear}</Text>
        
        <TouchableOpacity 
          style={styles.yearButton}
          onPress={() => {
            const nextYear = selectedYear + 1;
            if (availableYears.includes(nextYear)) {
              setSelectedYear(nextYear);
            }
          }}
        >
          <Image 
            source={require('../../../../asset/img/icon/a-d-arrow-right.png')}
            style={[styles.arrowIcon, { tintColor: theme.primary }]}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const handleAction = async (application: PendingApplication, action: 'APPROVE' | 'REJECT', reason?: string) => {
    try {
      setLoading(true);
      const userToken = await AsyncStorage.getItem('userToken');
      const baseUrl = await AsyncStorage.getItem('baseUrl');
      
      if (!userToken || !baseUrl) throw new Error('Authentication failed');

      const endpoint = action === 'APPROVE'
        ? `${baseUrl}/apps/api/v1/time-logs/${application.applicationId}/approve/${application.approvalActionId}`
        : `${baseUrl}/apps/api/v1/time-logs/${application.applicationId}/reject/${application.approvalActionId}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: action === 'REJECT' ? JSON.stringify({ reason }) : undefined,
      });

      const result = await response.json();
      if (result.success) {
        setAlertConfig({
          visible: true,
          title: t.success,
          message: action === 'APPROVE' ? t.approveSuccess : t.rejectSuccess,
          buttons: [{
            text: t.ok,
            onPress: () => {
              setAlertConfig(prev => ({ ...prev, visible: false }));
              fetchApplications();
            }
          }]
        });
      } else {
        throw new Error(result.message || t.failedToProcess);
      }
    } catch (error) {
      setAlertConfig({
        visible: true,
        title: t.error,
        message: error instanceof Error ? error.message : t.failedToProcess,
        buttons: [{
          text: t.ok,
          onPress: () => setAlertConfig(prev => ({ ...prev, visible: false }))
        }]
      });
    } finally {
      setLoading(false);
      closeSwipeable();
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {renderYearSelector()}
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
      <CustomAlert
        visible={showConfirmAlert}
        title={t.confirmAction}
        message={t.approveConfirm}
        buttons={[
          {
            text: t.cancel,
            style: 'cancel',
            onPress: () => {
              closeSwipeable();
              setShowConfirmAlert(false);
            }
          },
          {
            text: t.confirm,
            onPress: () => {
              closeSwipeable();
              setShowConfirmAlert(false);
              if (selectedApplication) {
                handleAction(selectedApplication, 'APPROVE');
              }
            }
          }
        ]}
        onDismiss={() => {
          closeSwipeable();
          setShowConfirmAlert(false);
        }}
      />

      <Modal
        visible={showRejectInput}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          closeSwipeable();
          setShowRejectInput(false);
          setRemarks('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {t.enterRejectReason}
            </Text>
            <Text style={[styles.modalSubtitle, { color: theme.subText }]}>
              {t.rejectReasonLanguage}
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.border
              }]}
              value={remarks}
              onChangeText={setRemarks}
              placeholder={t.remarksPlaceholder}
              placeholderTextColor={theme.subText}
              multiline
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.border }]}
                onPress={() => {
                  closeSwipeable();
                  setShowRejectInput(false);
                  setRemarks('');
                }}
              >
                <Text style={[styles.buttonText, { color: theme.text }]}>
                  {t.cancel}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.error }]}
                onPress={() => {
                  if (!remarks.trim()) {
                    Alert.alert(t.error, t.remarksRequired);
                    return;
                  }
                  setShowRejectInput(false);
                  setShowRejectConfirm(true);
                }}
              >
                <Text style={styles.buttonText}>{t.confirm}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <CustomAlert
        visible={showRejectConfirm}
        title={t.confirmAction}
        message={t.rejectConfirm}
        buttons={[
          {
            text: t.cancel,
            style: 'cancel',
            onPress: () => {
              closeSwipeable();
              setShowRejectConfirm(false);
              setRemarks('');
            }
          },
          {
            text: t.confirm,
            onPress: () => {
              closeSwipeable();
              setShowRejectConfirm(false);
              if (selectedApplication) {
                handleAction(selectedApplication, 'REJECT', remarks);
              }
              setRemarks('');
            }
          }
        ]}
        onDismiss={() => {
          closeSwipeable();
          setShowRejectConfirm(false);
          setRemarks('');
        }}
      />
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
      />
    </View>
  );
};

export default ATPendingApplicationListing;
