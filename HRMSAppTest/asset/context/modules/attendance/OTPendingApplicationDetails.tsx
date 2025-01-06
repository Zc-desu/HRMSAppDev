import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Platform,
  Image,
} from 'react-native';
import { useTheme } from '../../modules/setting/ThemeContext';
import { useLanguage } from '../../modules/setting/LanguageContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../../modules/setting/CustomAlert';

// Translations
interface Translation {
  title: string;
  employee: string;
  department: string;
  division: string;
  costCenter: string;
  date: string;
  time: string;
  duration: string;
  reason: string;
  status: string;
  approve: string;
  reject: string;
  loading: string;
  confirmApprove: string;
  confirmReject: string;
  approveMessage: string;
  rejectMessage: string;
  yes: string;
  no: string;
  cancel: string;
  success: string;
  error: string;
  approveSuccess: string;
  rejectSuccess: string;
  enterReason: string;
  rejectReason: string;
  reasonRequired: string;
  languageInstruction: string;
  hours: string;
  ok: string;
  submitReject: string;
  cancelReject: string;
  failedToProcess: string;
  enterRejectReason: string;
  rejectReasonPlaceholder: string;
  onlyRequiredIfRejecting: string;
  confirm: string;
  approvalStatus: string;
  approver: string;
  level: string;
  decision: string;
  respondDate: string;
  pending: string;
  approved: string;
  rejected: string;
  cancelled: string;
}

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
  showInput?: boolean;
  inputValue?: string;
  onInputChange?: (value: string) => void;
}

interface OvertimeDetails {
  id: number;
  employeeId: number;
  employeeNo: string;
  employeeName: string;
  department: string;
  division: string;
  costCenter: string;
  dateTimeFrom: string;
  dateTimeTo: string;
  reason: string;
  approvalStatus: string;
  approvalStatusDisplay: string;
}

interface ApprovalStatus {
  approvalLevel: number;
  approval: string;
  respondDate: string | null;
  approvalDecision: string;
  reason: string | null;
}

interface DetailData {
  employeeId: number;
  employeeNo: string;
  employeeName: string;
  dateTimeFrom: string;
  dateTimeTo: string;
  overtimeDuration: number;
  reason: string;
  actionType: string;
  approvalStatus: ApprovalStatus[];
  department?: string;
  division?: string;
  costCenter?: string;
  approvalStatusDisplay?: string;
}

const translations: Record<string, Translation> = {
  'en': {
    title: 'Overtime Details',
    employee: 'Employee',
    department: 'Department',
    division: 'Division',
    costCenter: 'Cost Center',
    date: 'Date',
    time: 'Time',
    duration: 'Duration',
    reason: 'Reason',
    status: 'Status',
    approve: 'Approve',
    reject: 'Reject',
    loading: 'Loading...',
    confirmApprove: 'Confirm Approval',
    confirmReject: 'Confirm Rejection',
    approveMessage: 'Are you sure you want to approve this overtime application?',
    rejectMessage: 'Are you sure you want to reject this overtime application?',
    yes: 'Yes',
    no: 'No',
    cancel: 'Cancel',
    success: 'Success',
    error: 'Error',
    approveSuccess: 'Application approved successfully',
    rejectSuccess: 'Application rejected successfully',
    enterReason: 'Enter rejection reason',
    rejectReason: 'Rejection Reason',
    reasonRequired: 'Reason is required',
    languageInstruction: 'Only English and Malay languages are allowed',
    hours: 'hours',
    ok: 'OK',
    submitReject: 'Submit Rejection',
    cancelReject: 'Cancel Rejection',
    failedToProcess: 'Failed to process',
    enterRejectReason: 'Enter rejection reason',
    rejectReasonPlaceholder: 'Rejection Reason',
    onlyRequiredIfRejecting: 'Only required if rejecting',
    confirm: 'Confirm',
    approvalStatus: 'Approval Status',
    approver: 'Approver',
    level: 'Level',
    decision: 'Decision',
    respondDate: 'Respond Date',
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    cancelled: 'Cancelled',
  },
  'ms': {
    title: 'Butiran Kerja Lebih Masa',
    employee: 'Pekerja',
    department: 'Jabatan',
    division: 'Bahagian',
    costCenter: 'Pusat Kos',
    date: 'Tarikh',
    time: 'Masa',
    duration: 'Tempoh',
    reason: 'Sebab',
    status: 'Status',
    approve: 'Lulus',
    reject: 'Tolak',
    loading: 'Memuatkan...',
    confirmApprove: 'Sahkan Kelulusan',
    confirmReject: 'Sahkan Penolakan',
    approveMessage: 'Adakah anda pasti mahu meluluskan permohonan kerja lebih masa ini?',
    rejectMessage: 'Adakah anda pasti mahu menolak permohonan kerja lebih masa ini?',
    yes: 'Ya',
    no: 'Tidak',
    cancel: 'Batal',
    success: 'Berjaya',
    error: 'Ralat',
    approveSuccess: 'Permohonan berjaya diluluskan',
    rejectSuccess: 'Permohonan berjaya ditolak',
    enterReason: 'Masukkan sebab penolakan',
    rejectReason: 'Sebab Penolakan',
    reasonRequired: 'Sebab diperlukan',
    languageInstruction: 'Hanya bahasa Inggeris dan Melayu dibenarkan',
    hours: 'jam',
    ok: 'OK',
    submitReject: 'Hantar Penolakan',
    cancelReject: 'Batal Penolakan',
    failedToProcess: 'Gagal memproses',
    enterRejectReason: 'Masukkan sebab penolakan',
    rejectReasonPlaceholder: 'Sebab Penolakan',
    onlyRequiredIfRejecting: 'Hanya diperlukan jika menolak',
    confirm: 'Sahkan',
    approvalStatus: 'Status Kelulusan',
    approver: 'Pelulus',
    level: 'Peringkat',
    decision: 'Keputusan',
    respondDate: 'Tarikh Respons',
    pending: 'Dalam Proses',
    approved: 'Diluluskan',
    rejected: 'Ditolak',
    cancelled: 'Dibatalkan',
  },
  'zh-Hans': {
    title: '加班详情',
    employee: '员工',
    department: '部门',
    division: '分部',
    costCenter: '成本中心',
    date: '日期',
    time: '时间',
    duration: '时长',
    reason: '原因',
    status: '状态',
    approve: '批准',
    reject: '拒绝',
    loading: '加载中...',
    confirmApprove: '确认批准',
    confirmReject: '确认拒绝',
    approveMessage: '您确定要批准这份加班申请吗？',
    rejectMessage: '您确定要拒绝这份加班申请吗？',
    yes: '是',
    no: '否',
    cancel: '取消',
    success: '成功',
    error: '错误',
    approveSuccess: '申请已成功批准',
    rejectSuccess: '申请已成功拒绝',
    enterReason: '输入拒绝原因',
    rejectReason: '拒绝原因',
    reasonRequired: '必须填写原因',
    languageInstruction: '仅允许使用英文和马来文',
    hours: '小时',
    ok: '确定',
    submitReject: '提交拒绝',
    cancelReject: '取消拒绝',
    failedToProcess: '处理失败',
    enterRejectReason: '输入拒绝原因',
    rejectReasonPlaceholder: '拒绝原因',
    onlyRequiredIfRejecting: '仅在拒绝时需要',
    confirm: '确认',
    approvalStatus: '审批状态',
    approver: '审批人',
    level: '级别',
    decision: '决策',
    respondDate: '响应日期',
    pending: '待审批',
    approved: '已批准',
    rejected: '已拒绝',
    cancelled: '已取消',
  },
  'zh-Hant': {
    title: '加班詳情',
    employee: '員工',
    department: '部門',
    division: '分部',
    costCenter: '成本中心',
    date: '日期',
    time: '時間',
    duration: '時長',
    reason: '原因',
    status: '狀態',
    approve: '批准',
    reject: '拒絕',
    loading: '加載中...',
    confirmApprove: '確認批准',
    confirmReject: '確認拒絕',
    approveMessage: '您確定要批准這份加班申請嗎？',
    rejectMessage: '您確定要拒絕這份加班申請嗎？',
    yes: '是',
    no: '否',
    cancel: '取消',
    success: '成功',
    error: '錯誤',
    approveSuccess: '申請已成功批准',
    rejectSuccess: '申請已成功拒絕',
    enterReason: '輸入拒絕原因',
    rejectReason: '拒絕原因',
    reasonRequired: '必須填寫原因',
    languageInstruction: '僅允許使用英文和馬來文',
    hours: '小時',
    ok: '確定',
    submitReject: '提交拒絕',
    cancelReject: '取消拒絕',
    failedToProcess: '處理失敗',
    enterRejectReason: '輸入拒絕原因',
    rejectReasonPlaceholder: '拒絕原因',
    onlyRequiredIfRejecting: '僅在拒絕時需要',
    confirm: '確認',
    approvalStatus: '審批狀態',
    approver: '審批人',
    level: '級別',
    decision: '決策',
    respondDate: '回應日期',
    pending: '待審批',
    approved: '已批准',
    rejected: '已拒絕',
    cancelled: '已取消',
  },
};

const OTPendingApplicationDetails = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const t: Translation = translations[language] || translations['en'];
  const { baseUrl, approvalActionId, employeeId, applicationId, actionType } = route.params;

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<DetailData>({
    employeeId: 0,
    employeeNo: '',
    employeeName: '',
    dateTimeFrom: '',
    dateTimeTo: '',
    overtimeDuration: 0,
    reason: '',
    actionType: '',
    approvalStatus: [],
  });
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
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

  const fetchDetails = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(
        `${baseUrl}/apps/api/v1/employees/${employeeId}/overtime/${applicationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();
      if (result.success) {
        setDetails(result.data);
      }
    } catch (error) {
      console.error('Error fetching details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovalStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const response = await fetch(
        `${baseUrl}/apps/api/v1/employees/${route.params.employeeId}/overtime/${route.params.applicationId}/approval-status?ApprovalAction=${route.params.actionType}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const result = await response.json();
      if (result.success) {
        setDetails(prevDetails => ({
          ...prevDetails,
          approvalStatus: result.data || []
        }));
      }
    } catch (error) {
      console.error('Error fetching approval status:', error);
    }
  };

  useEffect(() => {
    fetchDetails();
    fetchApprovalStatus();
  }, []);

  const formatDateTime = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleAction = async (action: 'approve' | 'reject', reason?: string) => {
    try {
      setLoading(true);
      const userToken = await AsyncStorage.getItem('userToken');
      const baseUrl = await AsyncStorage.getItem('baseUrl');
      
      console.log('Action:', action);
      console.log('Application ID:', applicationId);
      console.log('Approval Action ID:', approvalActionId);

      if (!userToken || !baseUrl) throw new Error(t.failedToProcess);

      const endpoint = action === 'approve'
        ? `${baseUrl}/apps/api/v1/overtime/approvals/pending-applications/${applicationId}/approve/${approvalActionId}`
        : `${baseUrl}/apps/api/v1/overtime/approvals/pending-applications/${applicationId}/reject/${approvalActionId}`;
      
      console.log('Making request to:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: action === 'reject' ? JSON.stringify({ reason }) : undefined,
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Raw response:', responseText);

      if (response.ok) {
        setAlertConfig({
          visible: true,
          title: t.success,
          message: action === 'approve' ? t.approveSuccess : t.rejectSuccess,
          buttons: [{
            text: t.ok,
            onPress: () => {
              setAlertConfig(prev => ({ ...prev, visible: false }));
              navigation.goBack();
            }
          }]
        });
      } else {
        throw new Error(t.failedToProcess);
      }
    } catch (error) {
      console.error('Full error details:', error);
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
    }
  };

  const confirmAction = (action: 'approve' | 'reject') => {
    if (action === 'approve') {
      setAlertConfig({
        visible: true,
        title: t.approve,
        message: t.approveMessage,
        buttons: [
          {
            text: t.cancel,
            style: 'cancel',
            onPress: () => setAlertConfig({ ...alertConfig, visible: false })
          },
          {
            text: t.approve,
            onPress: () => {
              setAlertConfig({ ...alertConfig, visible: false });
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
        buttons: [{ text: t.ok, onPress: () => setAlertConfig({ ...alertConfig, visible: false }) }]
      });
      return;
    }

    setAlertConfig({
      visible: true,
      title: t.reject,
      message: t.rejectMessage,
      buttons: [
        {
          text: t.cancel,
          style: 'cancel',
          onPress: () => setAlertConfig({ ...alertConfig, visible: false })
        },
        {
          text: t.confirm,
          onPress: () => {
            setAlertConfig({ ...alertConfig, visible: false });
            handleAction('reject', rejectReason);
            setRejectReason('');
            setShowRejectInput(false);
          }
        }
      ]
    });
  };

  return (
    <>
      <ScrollView 
        style={[styles.container, { backgroundColor: theme.background }]}
        contentContainerStyle={styles.contentContainer}
      >
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          {/* Employee Information Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t.employee}</Text>
            <View style={styles.detailRow}>
              <Text style={[styles.label, { color: theme.text }]}>{t.employee}</Text>
              <Text style={[styles.value, { color: theme.text }]}>
                {details?.employeeName} ({details?.employeeNo})
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.label, { color: theme.text }]}>{t.department}</Text>
              <Text style={[styles.value, { color: theme.text }]}>{details?.department}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.label, { color: theme.text }]}>{t.division}</Text>
              <Text style={[styles.value, { color: theme.text }]}>{details?.division}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.label, { color: theme.text }]}>{t.costCenter}</Text>
              <Text style={[styles.value, { color: theme.text }]}>{details?.costCenter}</Text>
            </View>
          </View>

          {/* Overtime Details Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t.title}</Text>
            <View style={styles.detailRow}>
              <Text style={[styles.label, { color: theme.text }]}>{t.date}</Text>
              <Text style={[styles.value, { color: theme.text }]}>
                {formatDateTime(details?.dateTimeFrom || '')}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.label, { color: theme.text }]}>{t.time}</Text>
              <Text style={[styles.value, { color: theme.text }]}>
                {`${formatDateTime(details?.dateTimeFrom || '')} - ${formatDateTime(details?.dateTimeTo || '')}`}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.label, { color: theme.text }]}>{t.reason}</Text>
              <Text style={[styles.value, { color: theme.text }]}>{details?.reason || '-'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.label, { color: theme.text }]}>{t.status}</Text>
              <Text style={[styles.value, { color: theme.text }]}>{details?.approvalStatusDisplay}</Text>
            </View>
          </View>

          {/* Approval Status Section */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>{t.approvalStatus}</Text>
            {Array.isArray(details.approvalStatus) && details.approvalStatus.map((status: ApprovalStatus, index: number) => (
              <View key={index}>
                <View style={styles.detailRow}>
                  <Text style={[styles.label, { color: theme.subText }]}>{t.level}</Text>
                  <Text style={[styles.value, { color: theme.text }]}>{status.approvalLevel}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={[styles.label, { color: theme.subText }]}>{t.approver}</Text>
                  <Text style={[styles.value, { color: theme.text }]}>{status.approval}</Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={[styles.label, { color: theme.subText }]}>{t.decision}</Text>
                  <Text style={[styles.value, { color: theme.text }]}>
                    {status.approvalDecision === 'P' ? t.pending :
                     status.approvalDecision === 'A' ? t.approved :
                     status.approvalDecision === 'R' ? t.rejected :
                     status.approvalDecision === 'C' ? t.cancelled : status.approvalDecision}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {showRejectInput ? (
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
        ) : (
          !loading && (
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => confirmAction('reject')}
              >
                <Image
                  source={require('../../../../asset/img/icon/a-close.png')}
                  style={[styles.actionIcon, styles.rejectIcon]}
                />
                <Text style={[styles.actionButtonText, styles.rejectButtonText]}>
                  {t.reject}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.approveButton]}
                onPress={() => confirmAction('approve')}
              >
                <Image
                  source={require('../../../../asset/img/icon/a-check.png')}
                  style={[styles.actionIcon, styles.approveIcon]}
                />
                <Text style={[styles.actionButtonText, styles.approveButtonText]}>
                  {t.approve}
                </Text>
              </TouchableOpacity>
            </View>
          )
        )}

        {loading && (
          <ActivityIndicator size="large" color={theme.primary} style={styles.loading} />
        )}
      </ScrollView>
      
      <CustomAlert 
        visible={alertConfig.visible}
        title={alertConfig.title ?? ''}
        message={alertConfig.message ?? ''}
        buttons={alertConfig.buttons}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingBottom: 8,
  },
  detailRow: {
    marginBottom: 12,
    flexDirection: 'column',
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
    paddingVertical: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#34C759',
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    marginHorizontal: 6,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginHorizontal: 6,
  },
  approveActionButton: {
    backgroundColor: '#34C759',
  },
  rejectActionButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#FFFFFF',
  },
  approveButtonText: {
    color: '#FFFFFF',
  },
  rejectButtonText: {
    color: '#FFFFFF',
  },
  actionIcon: {
    width: 20,
    height: 20,
  },
  approveIcon: {
    tintColor: '#FFFFFF',
  },
  rejectIcon: {
    tintColor: '#FFFFFF',
  },
});

export default OTPendingApplicationDetails;