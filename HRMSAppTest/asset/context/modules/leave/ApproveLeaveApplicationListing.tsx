import React, { useState, useEffect, useCallback, useLayoutEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ScrollView, RefreshControl, Animated, Modal, TextInput, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../setting/ThemeContext';
import { useLanguage } from '../setting/LanguageContext';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import LinearGradient from 'react-native-linear-gradient';
import CustomAlert from '../setting/CustomAlert';

interface LeaveDate {
  date: string;
  sessionId: number;
  session: string;
}

interface PendingLeave {
  approvalActionId: number;
  actionType: string;
  applicationId: number;
  leaveCode: string;
  leaveDescription: string;
  employeeId: number;
  employeeNo: string;
  employeeName: string;
  createdDate: string;
  dateFrom: string;
  dateTo: string;
  totalDay: number;
  reason: string | null;
  attachmentList: any[];
  isRequireHrApproval: boolean;
  leaveDateList: LeaveDate[];
}

type NavigationParams = {
  ApproveLeaveDetail: { leaveDetail: PendingLeave };
};

interface Translation {
  pendingApprovals: string;
  loading: string;
  error: string;
  noApprovals: string;
  reason: string;
  days: string;
  day: string;
  baseUrlMissing: string;
  tokenMissing: string;
  fetchError: string;
  failedToFetch: string;
  approve: string;
  reject: string;
  confirmAction: string;
  approveConfirm: string;
  approveSuccess: string;
  cancel: string;
  confirm: string;
  success: string;
  enterRejectReason: string;
  remarksPlaceholder: string;
  remarksRequired: string;
  rejectConfirm: string;
  title: string;
}

const ApproveLeaveApplicationListing = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [pendingLeaves, setPendingLeaves] = useState<PendingLeave[]>([]);
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<NavigationProp<NavigationParams>>();
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<PendingLeave | null>(null);
  const swipeableRefs = useRef<{ [key: number]: Swipeable | null }>({});
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [activeSwipeable, setActiveSwipeable] = useState<Swipeable | null>(null);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: any[];
  }>({
    visible: false,
    title: '',
    message: '',
    buttons: []
  });
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [years, setYears] = useState<number[]>([]);

  const getLocalizedText = (key: string): string => {
    switch (language) {
      case 'ms':
        return {
          pendingApprovals: 'Kelulusan Cuti',
          loading: 'Memuatkan kelulusan tertunda...',
          error: 'Ralat',
          noApprovals: 'Tiada kelulusan tertunda.',
          reason: 'Sebab:',
          days: 'hari',
          day: 'hari',
          baseUrlMissing: 'URL asas tiada',
          tokenMissing: 'Token pengguna tiada',
          fetchError: 'Gagal mendapatkan data.',
          failedToFetch: 'Gagal mendapatkan kelulusan tertunda.',
          approve: 'Lulus',
          reject: 'Tolak',
          confirmAction: 'Pengesahan',
          approveConfirm: 'Adakah anda pasti untuk meluluskan permohonan cuti ini?',
          approveSuccess: 'Permohonan cuti telah diluluskan',
          cancel: 'Batal',
          confirm: 'Sahkan',
          success: 'Berjaya',
          enterRejectReason: 'Masukkan alasan penolakan',
          remarksPlaceholder: 'Masukkan alasan penolakan...',
          remarksRequired: 'Masukkan alasan penolakan',
          rejectConfirm: 'Adakah anda pasti untuk menolak permohonan cuti ini?',
          title: 'Kelulusan Cuti',
        }[key] || key;

      case 'zh-Hans':
        return {
          pendingApprovals: '请假审批',
          loading: '正在加载待处理审批...',
          error: '错误',
          noApprovals: '没有待处理的审批。',
          reason: '原因：',
          days: '天',
          day: '天',
          baseUrlMissing: '基础URL缺失',
          tokenMissing: '用户令牌缺失',
          fetchError: '获取数据失败。',
          failedToFetch: '获取待处理审批失败。',
          approve: '批准',
          reject: '拒绝',
          confirmAction: '确认操作',
          approveConfirm: '您确定要批准这个休假申请吗？',
          approveSuccess: '休假申请已获批准',
          cancel: '取消',
          confirm: '确认',
          success: '成功',
          enterRejectReason: '输入拒绝理由',
          remarksPlaceholder: '输入拒绝理由...',
          remarksRequired: '输入拒绝理由',
          rejectConfirm: '您确定要拒绝这个休假申请吗？',
          title: '休假审批',
        }[key] || key;

      case 'zh-Hant':
        return {
          pendingApprovals: '請假審批',
          loading: '正在加載待處理審批...',
          error: '錯誤',
          noApprovals: '沒有待處理的審批。',
          reason: '原因：',
          days: '天',
          day: '天',
          baseUrlMissing: '基礎URL缺失',
          tokenMissing: '用戶令牌缺失',
          fetchError: '獲取數據失敗。',
          failedToFetch: '獲取待處理審批失敗。',
          approve: '批准',
          reject: '拒絕',
          confirmAction: '確認操作',
          approveConfirm: '您確定要批准這個休假申請嗎？',
          approveSuccess: '休假申請已獲批准',
          cancel: '取消',
          confirm: '確認',
          success: '成功',
          enterRejectReason: '輸入拒絕理由',
          remarksPlaceholder: '輸入拒絕理由...',
          remarksRequired: '輸入拒絕理由',
          rejectConfirm: '您確定要拒絕這個休假申請嗎？',
          title: '休假審批',
        }[key] || key;

      default: // 'en'
        return {
          pendingApprovals: 'Leave Approvals',
          loading: 'Loading pending approvals...',
          error: 'Error',
          noApprovals: 'No pending approvals found.',
          reason: 'Reason:',
          days: 'days',
          day: 'day',
          baseUrlMissing: 'Base URL is missing',
          tokenMissing: 'User token is missing',
          fetchError: 'Failed to fetch data.',
          failedToFetch: 'Failed to fetch pending leaves.',
          approve: 'Approve',
          reject: 'Reject',
          confirmAction: 'Confirmation',
          approveConfirm: 'Are you sure you want to approve this leave application?',
          approveSuccess: 'Leave application has been approved',
          cancel: 'Cancel',
          confirm: 'Confirm',
          success: 'Success',
          enterRejectReason: 'Enter reject reason',
          remarksPlaceholder: 'Enter reject reason...',
          remarksRequired: 'Enter reject reason',
          rejectConfirm: 'Are you sure you want to reject this leave application?',
          title: 'Leave Approvals',
        }[key] || key;
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: getLocalizedText('pendingApprovals'),
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
    const fetchInitialData = async () => {
      try {
        const storedBaseUrl = await AsyncStorage.getItem('baseUrl');
        if (!storedBaseUrl) {
          setAlertConfig({
            visible: true,
            title: getLocalizedText('error'),
            message: getLocalizedText('baseUrlMissing'),
            buttons: [{ text: getLocalizedText('ok'), onPress: () => setAlertConfig(prev => ({ ...prev, visible: false })) }]
          });
          return;
        }
        setBaseUrl(storedBaseUrl);
        fetchPendingLeaves(storedBaseUrl);
      } catch (error) {
        setAlertConfig({
          visible: true,
          title: getLocalizedText('error'),
          message: getLocalizedText('fetchError'),
          buttons: [{ text: getLocalizedText('ok'), onPress: () => setAlertConfig(prev => ({ ...prev, visible: false })) }]
        });
      }
    };
    fetchInitialData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (baseUrl) {
        fetchPendingLeaves(baseUrl);
      }
    }, [baseUrl])
  );

  const getUniqueYears = (leaves: PendingLeave[]) => {
    const uniqueYears = [...new Set(leaves.map(leave => 
      new Date(leave.createdDate).getFullYear()
    ))];
    return uniqueYears.sort((a, b) => b - a); // Sort descending
  };

  const fetchPendingLeaves = async (urlBase: string) => {
    try {
      setIsLoading(true);
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        setAlertConfig({
          visible: true,
          title: getLocalizedText('error'),
          message: getLocalizedText('tokenMissing'),
          buttons: [{ text: getLocalizedText('ok'), onPress: () => setAlertConfig(prev => ({ ...prev, visible: false })) }]
        });
        return;
      }

      const response = await fetch(`${urlBase}/apps/api/v1/leaves/approvals/pending-applications`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const sortedData = data.data.sort((a: PendingLeave, b: PendingLeave) => {
            return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
          });
          setPendingLeaves(sortedData);
          
          // Update years list
          const yearsFromData = getUniqueYears(sortedData);
          setYears(yearsFromData);
          
          // Set selected year to most recent if not already set
          if (!selectedYear && yearsFromData.length > 0) {
            setSelectedYear(yearsFromData[0]);
          }
        }
      }
    } catch (error) {
      setAlertConfig({
        visible: true,
        title: getLocalizedText('error'),
        message: getLocalizedText('fetchError'),
        buttons: [{ text: getLocalizedText('ok'), onPress: () => setAlertConfig(prev => ({ ...prev, visible: false })) }]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateTime: string) => {
    const date = new Date(dateTime);
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
  };

  const handleLeaveClick = (leave: PendingLeave) => {
    navigation.navigate('ApproveLeaveDetail', { 
      leaveDetail: {
        approvalActionId: leave.approvalActionId,
        actionType: leave.actionType,
        applicationId: leave.applicationId,
        leaveCode: leave.leaveCode,
        leaveDescription: leave.leaveDescription,
        employeeId: leave.employeeId,
        employeeNo: leave.employeeNo,
        employeeName: leave.employeeName,
        createdDate: leave.createdDate,
        dateFrom: leave.dateFrom,
        dateTo: leave.dateTo,
        totalDay: leave.totalDay,
        reason: leave.reason,
        attachmentList: leave.attachmentList,
        isRequireHrApproval: leave.isRequireHrApproval,
        leaveDateList: leave.leaveDateList
      }
    });
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    if (baseUrl) {
      fetchPendingLeaves(baseUrl).finally(() => {
        setRefreshing(false);
      });
    } else {
      setRefreshing(false);
    }
  }, [baseUrl]);

  const handleApprove = async (leave: PendingLeave) => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken || !baseUrl) {
        setAlertConfig({
          visible: true,
          title: getLocalizedText('error'),
          message: getLocalizedText('missingData'),
          buttons: [{ text: getLocalizedText('ok'), onPress: () => setAlertConfig(prev => ({ ...prev, visible: false })) }]
        });
        return;
      }

      const url = `${baseUrl}/apps/api/v1/leaves/approvals/pending-applications/${leave.applicationId}/approve/${leave.approvalActionId}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ remarks: '' }),
      });

      const data = await response.json();
      if (data.success) {
        setAlertConfig({
          visible: true,
          title: getLocalizedText('success'),
          message: getLocalizedText('approveSuccess'),
          buttons: [{
            text: getLocalizedText('confirm'),
            onPress: () => {
              setAlertConfig(prev => ({ ...prev, visible: false }));
              fetchPendingLeaves(baseUrl);
            }
          }]
        });
      } else {
        throw new Error(data.message || getLocalizedText('approveError'));
      }
    } catch (error) {
      setAlertConfig({
        visible: true,
        title: getLocalizedText('error'),
        message: getLocalizedText('approveError'),
        buttons: [{ text: getLocalizedText('ok'), onPress: () => setAlertConfig(prev => ({ ...prev, visible: false })) }]
      });
    }
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
          <Text style={styles.rejectText}>{getLocalizedText('reject')}</Text>
        </View>
      </LinearGradient>
    );
  };

  const renderLeftActions = (progress: any, dragX: any, leave: PendingLeave) => {
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
          <Text style={styles.approveText}>{getLocalizedText('approve')}</Text>
        </View>
      </LinearGradient>
    );
  };

  // Close all other swipeables except the current one
  const closeOtherSwipeables = useCallback((currentId: number) => {
    Object.entries(swipeableRefs.current).forEach(([key, ref]) => {
      if (ref && Number(key) !== currentId) {
        ref.close();
      }
    });
  }, []);

  const handleSwipeAction = useCallback((leave: PendingLeave, direction: 'left' | 'right', ref: Swipeable) => {
    // Remove the immediate close
    closeOtherSwipeables(leave.approvalActionId);
    
    if (direction === 'left') {
      setSelectedLeave(leave);
      setShowConfirmAlert(true);
    } else {
      setSelectedLeave(leave);
      setShowRejectInput(true);
    }
  }, [closeOtherSwipeables]);

  // Update renderLeaveItem to properly manage refs
  const renderLeaveItem = (leave: PendingLeave, index: number) => {
    return (
      <View key={leave.approvalActionId || index} style={styles.cardWrapper}>
        <Swipeable
          ref={(ref) => {
            if (ref) {
              swipeableRefs.current[leave.approvalActionId] = ref;
            } else {
              // Cleanup ref when component unmounts
              delete swipeableRefs.current[leave.approvalActionId];
            }
          }}
          renderLeftActions={(progress, dragX) => renderLeftActions(progress, dragX, leave)}
          renderRightActions={renderRightActions}
          friction={2}
          leftThreshold={80}
          rightThreshold={80}
          overshootLeft={false}
          overshootRight={false}
          onSwipeableWillOpen={(direction) => {
            const currentRef = swipeableRefs.current[leave.approvalActionId];
            if (currentRef) {
              handleSwipeAction(leave, direction as 'left' | 'right', currentRef);
            }
          }}
        >
          <TouchableOpacity 
            style={[styles.leaveCard, { backgroundColor: theme.card }]}
            onPress={() => handleLeaveClick(leave)}
          >
            <View style={styles.cardContainer}>
              <View style={styles.leaveContent}>
                <Text style={[styles.leaveType, { color: theme.text }]} numberOfLines={1}>
                  {leave.leaveDescription}
                </Text>

                <Text style={[styles.dateText, { color: theme.subText }]}>
                  {formatDate(leave.dateFrom)} - {formatDate(leave.dateTo)}
                  {leave.totalDay && ` (${leave.totalDay} ${
                    leave.totalDay > 1 ? getLocalizedText('days') : getLocalizedText('day')
                  })`}
                </Text>
              </View>

              <View style={[styles.employeeInfo, { 
                backgroundColor: theme.primary + '20',
                borderColor: theme.primary + '40'
              }]}>
                <Text style={[styles.employeeNo, { color: theme.text }]}>
                  {leave.employeeNo}
                </Text>
              </View>
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

  const YearSelector = () => (
    <View style={[styles.yearSelectorCard, { backgroundColor: theme.card }]}>
      <TouchableOpacity
        onPress={() => setSelectedYear(prev => {
          const currentIndex = years.indexOf(prev);
          if (currentIndex < years.length - 1) {
            return years[currentIndex + 1];
          }
          return prev;
        })}
      >
        <Image
          source={require('../../../../asset/img/icon/a-d-arrow-left.png')}
          style={[styles.yearArrow, { tintColor: theme.primary }]}
        />
      </TouchableOpacity>
      
      <Text style={[styles.yearText, { color: theme.text }]}>{selectedYear}</Text>
      
      <TouchableOpacity
        onPress={() => setSelectedYear(prev => {
          const currentIndex = years.indexOf(prev);
          if (currentIndex > 0) {
            return years[currentIndex - 1];
          }
          return prev;
        })}
      >
        <Image
          source={require('../../../../asset/img/icon/a-d-arrow-right.png')}
          style={[styles.yearArrow, { tintColor: theme.primary }]}
        />
      </TouchableOpacity>
    </View>
  );

  const filteredLeaves = pendingLeaves.filter(leave => 
    new Date(leave.createdDate).getFullYear() === selectedYear
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.headerCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.title, { color: theme.text }]}>
          {getLocalizedText('title')}
        </Text>
        
        <View style={styles.yearSelectorContainer}>
          <TouchableOpacity
            onPress={() => setSelectedYear(prev => {
              const currentIndex = years.indexOf(prev);
              if (currentIndex < years.length - 1) {
                return years[currentIndex + 1];
              }
              return prev;
            })}
          >
            <Image
              source={require('../../../../asset/img/icon/a-d-arrow-left.png')}
              style={[styles.yearArrow, { tintColor: theme.primary }]}
            />
          </TouchableOpacity>
          
          <Text style={[styles.yearText, { color: theme.text }]}>{selectedYear}</Text>
          
          <TouchableOpacity
            onPress={() => setSelectedYear(prev => {
              const currentIndex = years.indexOf(prev);
              if (currentIndex > 0) {
                return years[currentIndex - 1];
              }
              return prev;
            })}
          >
            <Image
              source={require('../../../../asset/img/icon/a-d-arrow-right.png')}
              style={[styles.yearArrow, { tintColor: theme.primary }]}
            />
          </TouchableOpacity>
        </View>
      </View>
      
      {isLoading ? (
        <ActivityIndicator style={styles.loader} size="large" color={theme.primary} />
      ) : filteredLeaves.length === 0 ? (
        <Text style={[styles.noData, { color: theme.text }]}>
          {getLocalizedText('noApprovals')}
        </Text>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {filteredLeaves.map((leave: PendingLeave, index) => 
            renderLeaveItem(leave, index)
          )}
        </ScrollView>
      )}

      <CustomAlert
        visible={showConfirmAlert}
        title={getLocalizedText('confirmAction')}
        message={getLocalizedText('approveConfirm')}
        buttons={[
          {
            text: getLocalizedText('cancel'),
            style: 'cancel',
            onPress: () => {
              // Close swipeable when cancel is clicked
              const ref = selectedLeave && swipeableRefs.current[selectedLeave.approvalActionId];
              if (ref) {
                ref.close();
              }
              setShowConfirmAlert(false);
              setSelectedLeave(null);
            }
          },
          {
            text: getLocalizedText('confirm'),
            onPress: () => {
              // Close swipeable when confirm is clicked
              const ref = selectedLeave && swipeableRefs.current[selectedLeave.approvalActionId];
              if (ref) {
                ref.close();
              }
              setShowConfirmAlert(false);
              if (selectedLeave) {
                handleApprove(selectedLeave);
              }
              setSelectedLeave(null);
            }
          }
        ]}
        onDismiss={() => {
          // Close swipeable when alert is dismissed
          const ref = selectedLeave && swipeableRefs.current[selectedLeave.approvalActionId];
          if (ref) {
            ref.close();
          }
          setShowConfirmAlert(false);
          setSelectedLeave(null);
        }}
      />

      <Modal
        visible={showRejectInput}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          // Close swipeable when modal is dismissed
          const ref = selectedLeave && swipeableRefs.current[selectedLeave.approvalActionId];
          if (ref) {
            ref.close();
          }
          setShowRejectInput(false);
          setSelectedLeave(null);
          setRemarks('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              {getLocalizedText('enterRejectReason')}
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.border
              }]}
              value={remarks}
              onChangeText={setRemarks}
              placeholder={getLocalizedText('remarksPlaceholder')}
              placeholderTextColor={theme.subText}
              multiline
            />
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.border }]}
                onPress={() => {
                  // Close swipeable when cancel is clicked
                  const ref = selectedLeave && swipeableRefs.current[selectedLeave.approvalActionId];
                  if (ref) {
                    ref.close();
                  }
                  setShowRejectInput(false);
                  setRemarks('');
                  setSelectedLeave(null);
                }}
              >
                <Text style={[styles.buttonText, { color: theme.text }]}>
                  {getLocalizedText('cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: theme.error }]}
                onPress={() => {
                  if (!remarks.trim()) {
                    Alert.alert(getLocalizedText('error'), getLocalizedText('remarksRequired'));
                    return;
                  }
                  setShowRejectInput(false);
                  setShowRejectConfirm(true);
                }}
              >
                <Text style={styles.buttonText}>
                  {getLocalizedText('confirm')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <CustomAlert
        visible={showRejectConfirm}
        title={getLocalizedText('confirmAction')}
        message={getLocalizedText('rejectConfirm')}
        buttons={[
          {
            text: getLocalizedText('cancel'),
            style: 'cancel',
            onPress: () => {
              setShowRejectConfirm(false);
              setRemarks('');
            }
          },
          {
            text: getLocalizedText('confirm'),
            onPress: () => {
              setShowRejectConfirm(false);
              if (selectedLeave) {
                navigation.navigate('ApproveLeaveDetail', { 
                  leaveDetail: {
                    ...selectedLeave
                  }
                });
              }
              setRemarks('');
            }
          }
        ]}
        onDismiss={() => {
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  headerCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  contentContainer: {
    flex: 1,
  },
  leaveList: {
    paddingTop: 8,
    paddingHorizontal: 16,
  },
  leaveCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 2,
    height: 90,
    width: '100%',
    overflow: 'hidden',
  },
  cardContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leaveContent: {
    flex: 1,
    marginRight: 12,
  },
  leaveType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    width: '100%',
  },
  dateText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  employeeInfo: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  employeeNo: {
    fontSize: 14,
    fontWeight: '500',
  },
  messageContainer: {
    padding: 20,
    alignItems: 'center',
  },
  messageText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  leftActions: {
    width: 80,
    height: '100%',
    position: 'absolute',
    left: 0,
  },
  rightActions: {
    flexDirection: 'row',
    height: 90,
    marginRight: 16,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
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
  rejectIcon: {
    tintColor: '#FFFFFF',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  approveButtonText: {
    color: '#FFFFFF',
  },
  rejectButtonText: {
    color: '#FFFFFF',
  },
  approveAction: {
    width: 80,
    height: '100%',
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
  swipeableContainer: {
    width: '100%',
    marginHorizontal: 16,
  },
  leftActionGradient: {
    width: 80,
    height: 90,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  leftActionContent: {
    alignItems: 'center',
  },
  leftActionIcon: {
    width: 24,
    height: 24,
    tintColor: '#FFFFFF',
    marginBottom: 4,
  },
  leftActionText: {
    color: '#FFFFFF', 
    fontSize: 12,
    fontWeight: '600',
  },
  cardWrapper: {
    marginBottom: 8,
    width: '100%',
  },
  rightActionGradient: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  rightActionContent: {
    alignItems: 'center',
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
  yearSelectorCard: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  yearArrow: {
    width: 24,
    height: 24,
    marginHorizontal: 20,
    tintColor: '#007AFF', // Default color, will be overridden by theme.primary
  },
  yearText: {
    fontSize: 18,
    fontWeight: '600',
    minWidth: 70,
    textAlign: 'center',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noData: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 20,
  },
  yearSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ApproveLeaveApplicationListing;
