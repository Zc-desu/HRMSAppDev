import React, { useLayoutEffect, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
  TextInput,
  Image,
} from 'react-native';
import { useTheme } from '../setting/ThemeContext';
import { useLanguage } from '../setting/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../setting/CustomAlert';

type Translation = {
  title: string;
  employeeName: string;
  dateTime: string;
  reason: string;
  approve: string;
  reject: string;
  loading: string;
  success: string;
  error: string;
  approveSuccess: string;
  rejectSuccess: string;
  confirmApprove: string;
  confirmReject: string;
  cancel: string;
  ok: string;
  failedToProcess: string;
  enterRejectReason: string;
  confirm: string;
  reasonRequired: string;
  rejectReasonPlaceholder: string;
  onlyRequiredIfRejecting: string;
  approvalStatus: string;
  level: string;
  approver: string;
  decision: string;
  respondDate: string;
  pending: string;
  approved: string;
  rejected: string;
  cancelled: string;
};

const translations: Record<string, Translation> = {
  'en': {
    title: 'Application Details',
    employeeName: 'Employee Name',
    dateTime: 'Date & Time',
    reason: 'Reason',
    approve: 'Approve',
    reject: 'Reject',
    loading: 'Processing...',
    success: 'Success',
    error: 'Error',
    approveSuccess: 'Application approved successfully',
    rejectSuccess: 'Application rejected successfully',
    confirmApprove: 'Are you sure you want to approve this application?',
    confirmReject: 'Are you sure you want to reject this application?',
    cancel: 'Cancel',
    ok: 'OK',
    failedToProcess: 'Failed to process application',
    enterRejectReason: 'Please enter rejection reason',
    confirm: 'Confirm',
    reasonRequired: 'Reason is required',
    rejectReasonPlaceholder: 'Enter reason for rejection',
    onlyRequiredIfRejecting: '(Only required if rejecting)',
    approvalStatus: 'Approval Status',
    level: 'Level',
    approver: 'Approver',
    decision: 'Decision',
    respondDate: 'Respond Date',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
  },
  'ms': {
    title: 'Butiran Permohonan',
    employeeName: 'Nama Pekerja',
    dateTime: 'Tarikh & Masa',
    reason: 'Sebab',
    approve: 'Lulus',
    reject: 'Tolak',
    loading: 'Memproses...',
    success: 'Berjaya',
    error: 'Ralat',
    approveSuccess: 'Permohonan berjaya diluluskan',
    rejectSuccess: 'Permohonan berjaya ditolak',
    confirmApprove: 'Adakah anda pasti mahu meluluskan permohonan ini?',
    confirmReject: 'Adakah anda pasti mahu menolak permohonan ini?',
    cancel: 'Batal',
    ok: 'OK',
    failedToProcess: 'Gagal memproses permohonan',
    enterRejectReason: 'Sila masukkan sebab penolakan',
    confirm: 'Sahkan',
    reasonRequired: 'Sebab diperlukan',
    rejectReasonPlaceholder: 'Masukkan sebab penolakan',
    onlyRequiredIfRejecting: '(Hanya diperlukan jika menolak)',
    approvalStatus: 'Status Kelulusan',
    level: 'Peringkat',
    approver: 'Pelulus',
    decision: 'Keputusan',
    respondDate: 'Tarikh Respons',
    pending: 'Dalam Proses',
    approved: 'Diluluskan',
    rejected: 'Ditolak',
    cancelled: 'Dibatalkan',
  },
  'zh-Hans': {
    title: '申请详情',
    employeeName: '员工姓名',
    dateTime: '日期和时间',
    reason: '原因',
    approve: '批准',
    reject: '拒绝',
    loading: '处理中...',
    success: '成功',
    error: '错误',
    approveSuccess: '申请已成功批准',
    rejectSuccess: '申请已成功拒绝',
    confirmApprove: '您确定要批准此申请吗？',
    confirmReject: '您确定要拒绝此申请吗？',
    cancel: '取消',
    ok: '确定',
    failedToProcess: '处理申请失败',
    enterRejectReason: '请输入拒绝原因',
    confirm: '确认',
    reasonRequired: '请输入原因',
    rejectReasonPlaceholder: '请输入拒绝原因',
    onlyRequiredIfRejecting: '(仅在拒绝时需要)',
    approvalStatus: '审批状态',
    level: '级别',
    approver: '审批人',
    decision: '决策',
    respondDate: '响应日期',
    pending: '待审批',
    approved: '已批准',
    rejected: '已拒绝',
    cancelled: '已取消',
  },
  'zh-Hant': {
    title: '申請詳情',
    employeeName: '員工姓名',
    dateTime: '日期和時間',
    reason: '原因',
    approve: '批准',
    reject: '拒絕',
    loading: '處理中...',
    success: '成功',
    error: '錯誤',
    approveSuccess: '申請已成功批准',
    rejectSuccess: '申請已成功拒絕',
    confirmApprove: '您確定要批准此申請嗎？',
    confirmReject: '您確定要拒絕此申請嗎？',
    cancel: '取消',
    ok: '確定',
    failedToProcess: '處理申請失敗',
    enterRejectReason: '請輸入拒絕原因',
    confirm: '確認',
    reasonRequired: '請輸入原因',
    rejectReasonPlaceholder: '請輸入拒絕原因',
    onlyRequiredIfRejecting: '(僅在拒絕時需要)',
    approvalStatus: '審批狀態',
    level: '級別',
    approver: '審批人',
    decision: '決策',
    respondDate: '回應日期',
    pending: '待審批',
    approved: '已批准',
    rejected: '已拒絕',
    cancelled: '已取消',
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

// Add new interface for approval status
interface ApprovalStatus {
  approvalLevel: number;
  approval: string;
  respondDate: string | null;
  approvalDecision: string;
  reason: string | null;
}

const ATPendingApplicationDetails = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t = translations[language];
  const { application } = route.params;
  const [loading, setLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState<string>('');
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title?: string;
    message?: string;
    buttons?: Array<{
      text: string;
      style?: "default" | "cancel" | "destructive";
      onPress?: () => void;
    }>;
    showInput?: boolean;
    inputValue?: string;
    onInputChange?: (text: string) => void;
  }>({ visible: false });
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus[]>([]);

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

  const handleAction = async (action: 'approve' | 'reject', reason?: string) => {
    try {
      setLoading(true);
      const userToken = await AsyncStorage.getItem('userToken');
      const baseUrl = await AsyncStorage.getItem('baseUrl');
      
      if (!userToken || !baseUrl) throw new Error(t.failedToProcess);

      const endpoint = action === 'approve' 
        ? `${baseUrl}/apps/api/v1/time-logs/${application.applicationId}/approve/${application.approvalActionId}`
        : `${baseUrl}/apps/api/v1/time-logs/${application.applicationId}/reject/${application.approvalActionId}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: action === 'reject' ? JSON.stringify({ reason }) : undefined,
      });

      const result = await response.json();
      if (result.success) {
        setAlertConfig({
          visible: true,
          title: t.success,
          message: action === 'approve' ? t.approveSuccess : t.rejectSuccess,
          buttons: [
            {
              text: t.ok,
              onPress: () => {
                setAlertConfig(prev => ({ ...prev, visible: false }));
                navigation.goBack();
              }
            }
          ]
        });
      } else {
        throw new Error(result.message || t.failedToProcess);
      }
    } catch (error) {
      setAlertConfig({
        visible: true,
        title: t.error,
        message: error instanceof Error ? error.message : t.failedToProcess,
        buttons: [
          {
            text: t.ok,
            onPress: () => setAlertConfig(prev => ({ ...prev, visible: false }))
          }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmAction = (action: 'approve' | 'reject') => {
    if (action === 'approve') {
      setAlertConfig({
        visible: true,
        title: t.approve,
        message: t.confirmApprove,
        buttons: [
          {
            text: t.cancel,
            style: 'cancel',
            onPress: () => setAlertConfig(prev => ({ ...prev, visible: false }))
          },
          {
            text: t.approve,
            onPress: () => {
              setAlertConfig(prev => ({ ...prev, visible: false }));
              handleAction('approve');
            }
          }
        ]
      });
    } else {
      setShowRejectInput(true);
    }
  };

  const handleRejectSubmit = () => {
    if (!rejectReason.trim()) {
      setAlertConfig({
        visible: true,
        title: t.error,
        message: t.reasonRequired,
        buttons: [
          {
            text: t.ok,
            onPress: () => setAlertConfig(prev => ({ ...prev, visible: false }))
          }
        ]
      });
      return;
    }

    setAlertConfig({
      visible: true,
      title: t.reject,
      message: t.confirmReject,
      buttons: [
        {
          text: t.cancel,
          style: 'cancel',
          onPress: () => setAlertConfig(prev => ({ ...prev, visible: false }))
        },
        {
          text: t.confirm,
          onPress: () => {
            setAlertConfig(prev => ({ ...prev, visible: false }));
            handleAction('reject', rejectReason);
            setRejectReason('');
            setShowRejectInput(false);
          }
        }
      ]
    });
  };

  // Add function to fetch approval status
  const fetchApprovalStatus = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const baseUrl = await AsyncStorage.getItem('baseUrl');
      
      if (!userToken || !baseUrl) throw new Error('Authentication failed');

      const response = await fetch(
        `${baseUrl}/apps/api/v1/employees/${application.employeeId}/attendance/time-logs/${application.applicationId}/approval-status?ApprovalAction=${application.actionType || 'A'}`,
        {
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Accept': 'application/json',
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        setApprovalStatus(result.data || []);
      }
    } catch (error) {
      console.error('Error fetching approval status:', error);
    }
  };

  // Add useEffect to fetch approval status
  useEffect(() => {
    fetchApprovalStatus();
  }, [application]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Details Container */}
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          Details
        </Text>
        <View style={styles.divider} />
        
        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.subText }]}>Employee Name</Text>
            <Text style={[styles.value, { color: theme.text }]}>{application.employeeName}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.subText }]}>Date & Time</Text>
            <Text style={[styles.value, { color: theme.text }]}>
              {formatDateTime(application.attendanceDateTime)}
            </Text>
          </View>

          <View style={styles.lastInfoRow}>
            <Text style={[styles.label, { color: theme.subText }]}>Reason</Text>
            <Text style={[styles.value, { color: theme.text }]}>{application.reason || '--'}</Text>
          </View>
        </View>
      </View>

      {/* Approval Status Container */}
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          {t.approvalStatus}
        </Text>
        <View style={styles.divider} />

        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.subText }]}>Level</Text>
            <Text style={[styles.value, { color: theme.text }]}>
              {approvalStatus[0]?.approvalLevel || '--'}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={[styles.label, { color: theme.subText }]}>Approver</Text>
            <Text style={[styles.value, { color: theme.text }]}>
              {approvalStatus[0]?.approval || '--'}
            </Text>
          </View>

          <View style={styles.lastInfoRow}>
            <Text style={[styles.label, { color: theme.subText }]}>Decision</Text>
            <Text style={[styles.value, { color: theme.text }]}>
              {approvalStatus[0]?.approvalDecision === 'P' ? 'Pending' :
               approvalStatus[0]?.approvalDecision === 'A' ? 'Approved' :
               approvalStatus[0]?.approvalDecision === 'R' ? 'Rejected' :
               approvalStatus[0]?.approvalDecision === 'C' ? 'Cancelled' : '--'}
            </Text>
          </View>
        </View>
      </View>

      {/* Action Buttons */}
      {!showRejectInput && !loading && (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => confirmAction('reject')}
          >
            <Image source={require('../../../../asset/img/icon/a-close.png')} 
              style={[styles.actionIcon, styles.rejectIcon]} />
            <Text style={[styles.actionButtonText, styles.rejectButtonText]}>
              {t.reject}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => confirmAction('approve')}
          >
            <Image source={require('../../../../asset/img/icon/a-check.png')} 
              style={[styles.actionIcon, styles.approveIcon]} />
            <Text style={[styles.actionButtonText, styles.approveButtonText]}>
              {t.approve}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {loading && (
        <ActivityIndicator size="large" color={theme.primary} style={styles.loading} />
      )}

      {/* Rejection Reason Input - Only show when needed */}
      {showRejectInput && (
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <Text style={[styles.instruction, { color: theme.subText }]}>
            {t.enterRejectReason}
          </Text>
          <TextInput
            style={[styles.input, { 
              backgroundColor: theme.background,
              color: theme.text,
              borderColor: theme.border
            }]}
            value={rejectReason}
            onChangeText={setRejectReason}
            placeholder={t.rejectReasonPlaceholder}
            placeholderTextColor={theme.subText}
            multiline
          />
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.border }]}
              onPress={() => {
                setShowRejectInput(false);
                setRejectReason('');
              }}
            >
              <Text style={[styles.buttonText, { color: theme.text }]}>{t.cancel}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: theme.error }]}
              onPress={handleRejectSubmit}
            >
              <Text style={styles.buttonText}>{t.confirm}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <CustomAlert 
        visible={alertConfig.visible}
        title={alertConfig.title ?? ''}
        message={alertConfig.message ?? ''}
        buttons={alertConfig.buttons}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 16,
    padding: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginBottom: 16,
  },
  cardContent: {
    paddingTop: 4,
  },
  infoRow: {
    marginBottom: 16,
  },
  lastInfoRow: {
    marginBottom: 0,
  },
  label: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#000000',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 6,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 6,
  },
  approveButton: {
    backgroundColor: '#34C759',
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#FFFFFF',
  },
  actionIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
  },
  loading: {
    marginTop: 20,
  },
  instruction: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    marginTop: 8,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 8,
    paddingBottom: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  approveButtonText: {
    color: '#FFFFFF',
  },
  rejectButtonText: {
    color: '#FFFFFF',
  },
  approveIcon: {
    tintColor: '#FFFFFF',
  },
  rejectIcon: {
    tintColor: '#FFFFFF',
  },
});

export default ATPendingApplicationDetails;
