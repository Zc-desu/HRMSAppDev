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
  Modal,
  TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../setting/ThemeContext';
import { useLanguage } from '../setting/LanguageContext';
import CustomAlert from '../setting/CustomAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Swipeable from 'react-native-gesture-handler/Swipeable';

// Add these interfaces
interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertConfig {
  visible: boolean;
  title: string;
  message: string;
  buttons: AlertButton[];
}

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
    success: 'Success',
    approveSuccess: 'Approve Success',
    rejectSuccess: 'Reject Success',
    failedToProcess: 'Failed to process',
    rejectReasonLanguage: 'Please enter reason in English or Bahasa Melayu only',
    remarksPlaceholder: 'Enter your reason here...',
    remarksRequired: 'Please enter a reason for rejection',
    confirm: 'Confirm',
    enterRejectReason: 'Enter Reject Reason',
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
    success: 'Berjaya',
    approveSuccess: 'Lulus Berjaya',
    rejectSuccess: 'Tolak Berjaya',
    failedToProcess: 'Gagal memproses',
    rejectReasonLanguage: 'Sila masukkan sebab dalam Bahasa Inggeris atau Bahasa Melayu sahaja',
    remarksPlaceholder: 'Masukkan sebab anda di sini...',
    remarksRequired: 'Sila masukkan sebab penolakan',
    confirm: 'Sahkan',
    enterRejectReason: 'Masukkan Sebab Penolakan',
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
    success: '成功',
    approveSuccess: '批准成功',
    rejectSuccess: '拒绝成功',
    failedToProcess: '处理失败',
    rejectReasonLanguage: '请用英文或马来文输入原因',
    remarksPlaceholder: '在此输入原因...',
    remarksRequired: '请输入拒绝原因',
    confirm: '确认',
    enterRejectReason: '输入拒绝原因',
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
    success: '成功',
    approveSuccess: '批准成功',
    rejectSuccess: '拒絕成功',
    failedToProcess: '處理請求失敗',
    rejectReasonLanguage: '請用英文或馬來文輸入原因',
    remarksPlaceholder: '在此輸入原因...',
    remarksRequired: '請輸入拒絕原因',
    confirm: '確認',
    enterRejectReason: '輸入拒絕原因',
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

interface Translation {
  title: string;
  loading: string;
  error: string;
  retry: string;
  noApplications: string;
  employee: string;
  duration: string;
  date: string;
  hours: string;
  errorTitle: string;
  ok: string;
  approve: string;
  reject: string;
  confirmAction: string;
  approveConfirm: string;
  rejectConfirm: string;
  cancel: string;
  confirm: string;
  success: string;
  approveSuccess: string;
  rejectSuccess: string;
  failedToProcess: string;
  rejectReasonLanguage: string;
  remarksPlaceholder: string;
  remarksRequired: string;
  enterRejectReason: string;
}

const OTPendingApplicationListing = ({ navigation }: any) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = translations[language];

  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    visible: false,
    title: '',
    message: '',
    buttons: []
  });
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);
  const [actionType, setActionType] = useState<'APPROVE' | 'REJECT' | null>(null);
  const swipeableRefs = useRef<{ [key: number]: Swipeable | null }>({});
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

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
    modalOverlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: '#FFFFFF',
      padding: 20,
      borderRadius: 12,
      width: '80%',
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    instruction: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 10,
      color: '#000000',
    },
    input: {
      width: '100%',
      height: 100,
      borderWidth: 1,
      padding: 10,
      marginBottom: 10,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
    },
    button: {
      padding: 10,
      borderRadius: 5,
      marginHorizontal: 5,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
      textAlign: 'center',
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 8,
      textAlign: 'center',
    },
    modalSubtitle: {
      fontSize: 14,
      marginBottom: 16,
      textAlign: 'center',
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
        const years = [...new Set(result.data.map((app: Application) => 
          new Date(app.appDateTimeFrom).getFullYear()
        ))].sort() as number[];
        setAvailableYears(years);

        const filteredApplications = result.data.filter((app: Application) => 
          new Date(app.appDateTimeFrom).getFullYear() === selectedYear
        );

        const sortedApplications = filteredApplications.sort((a: Application, b: Application) => 
          new Date(b.appDateTimeFrom).getTime() - new Date(a.appDateTimeFrom).getTime()
        );

        setApplications(sortedApplications);
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
        buttons: [{ text: t.ok, onPress: () => setAlertConfig(prev => ({ ...prev, visible: false })) }]
      });
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
    setSelectedApplication(application);
    
    if (direction === 'left') {
      setAlertConfig({
        visible: true,
        title: t.confirmAction,
        message: t.approveConfirm,
        buttons: [
          {
            text: t.cancel,
            style: 'cancel',
            onPress: () => {
              ref.close();
              setAlertConfig(prev => ({ ...prev, visible: false }));
            }
          },
          {
            text: t.approve,
            onPress: () => {
              setAlertConfig(prev => ({ ...prev, visible: false }));
              handleAction(application, 'APPROVE');
            }
          }
        ]
      });
    } else {
      ref.close();
      setShowRejectInput(true);
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

  const handleAction = async (application: Application, action: 'APPROVE' | 'REJECT', reason?: string) => {
    try {
      setLoading(true);
      const userToken = await AsyncStorage.getItem('userToken');
      const baseUrl = await AsyncStorage.getItem('baseUrl');
      
      if (!userToken || !baseUrl) throw new Error(t.failedToProcess);

      const endpoint = action === 'APPROVE'
        ? `${baseUrl}/apps/api/v1/overtime/approvals/pending-applications/${application.applicationId}/approve/${application.approvalActionId}`
        : `${baseUrl}/apps/api/v1/overtime/approvals/pending-applications/${application.applicationId}/reject/${application.approvalActionId}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: action === 'REJECT' ? JSON.stringify({ reason }) : undefined,
      });

      if (response.ok) {
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
        throw new Error(t.failedToProcess);
      }
    } catch (error) {
      setAlertConfig({
        visible: true,
        title: t.error,
        message: t.failedToProcess,
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

  const closeSwipeable = () => {
    if (selectedApplication && swipeableRefs.current[selectedApplication.approvalActionId]) {
      swipeableRefs.current[selectedApplication.approvalActionId]?.close();
    }
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
      {renderYearSelector()}
      <FlatList
        data={applications}
        renderItem={renderItem}
        keyExtractor={(item) => item.approvalActionId.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
          />
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
        buttons={alertConfig.buttons}
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
                    setAlertConfig({
                      visible: true,
                      title: t.error,
                      message: t.remarksRequired,
                      buttons: [{ text: t.ok, onPress: () => setAlertConfig(prev => ({ ...prev, visible: false })) }]
                    });
                    return;
                  }
                  setShowRejectInput(false);
                  setAlertConfig({
                    visible: true,
                    title: t.confirmAction,
                    message: t.rejectConfirm,
                    buttons: [
                      {
                        text: t.cancel,
                        style: 'cancel',
                        onPress: () => {
                          setAlertConfig(prev => ({ ...prev, visible: false }));
                          closeSwipeable();
                        }
                      },
                      {
                        text: t.confirm,
                        onPress: () => {
                          setAlertConfig(prev => ({ ...prev, visible: false }));
                          if (selectedApplication) {
                            handleAction(selectedApplication, 'REJECT', remarks);
                          }
                          setRemarks('');
                        }
                      }
                    ]
                  });
                }}
              >
                <Text style={styles.buttonText}>{t.confirm}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default OTPendingApplicationListing;
