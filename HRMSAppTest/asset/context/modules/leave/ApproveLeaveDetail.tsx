import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../setting/ThemeContext';
import { useLanguage } from '../setting/LanguageContext';

interface LeaveDate {
  date: string;
  sessionId: number;
  session: string;
}

interface LeaveDetail {
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

interface Translation {
  employeeInfo: string;
  employeeNo: string;
  name: string;
  leaveDetails: string;
  leaveType: string;
  duration: string;
  leaveSessions: string;
  reason: string;
  approvalRemarks: string;
  remarksPlaceholder: string;
  reject: string;
  approve: string;
  confirmAction: string;
  approveConfirm: string;
  rejectConfirm: string;
  success: string;
  approveSuccess: string;
  rejectSuccess: string;
  error: string;
  remarksRequired: string;
  days: string;
  day: string;
  cancel: string;
  confirm: string;
  leaveNotFound: string;
}

const ApproveLeaveDetail = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { leaveDetail: initialLeaveDetail } = route.params;
  const [leaveDetail, setLeaveDetail] = useState<LeaveDetail>(initialLeaveDetail);
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [baseUrl, setBaseUrl] = useState<string>('');

  useEffect(() => {
    const initializeData = async () => {
      const storedBaseUrl = await AsyncStorage.getItem('baseUrl');
      if (storedBaseUrl) {
        setBaseUrl(storedBaseUrl);
      } else {
        Alert.alert('Error', 'Base URL is missing');
      }
    };
    initializeData();
  }, []);

  const getLocalizedText = (key: keyof Translation): string => {
    switch (language) {
      case 'ms':
        return {
          employeeInfo: 'Maklumat Pekerja',
          employeeNo: 'No. Pekerja:',
          name: 'Nama:',
          leaveDetails: 'Butiran Cuti',
          leaveType: 'Jenis Cuti:',
          duration: 'Tempoh:',
          leaveSessions: 'Sesi Cuti:',
          reason: 'Sebab:',
          approvalRemarks: 'Catatan Kelulusan',
          remarksPlaceholder: 'Masukkan catatan (diperlukan untuk penolakan)',
          reject: 'Tolak',
          approve: 'Lulus',
          confirmAction: 'Sahkan Tindakan',
          approveConfirm: 'Adakah anda pasti mahu meluluskan permohonan cuti ini?',
          rejectConfirm: 'Adakah anda pasti mahu menolak permohonan cuti ini?',
          success: 'Berjaya',
          approveSuccess: 'Permohonan cuti berjaya diluluskan',
          rejectSuccess: 'Permohonan cuti berjaya ditolak',
          error: 'Ralat',
          remarksRequired: 'Sila berikan catatan untuk penolakan',
          days: 'hari',
          day: 'hari',
          cancel: 'Batal',
          confirm: 'Sahkan',
          leaveNotFound: 'Butiran cuti tidak dijumpai',
        }[key] || key;

      case 'zh-Hans':
        return {
          employeeInfo: '员工信息',
          employeeNo: '员工编号：',
          name: '姓名：',
          leaveDetails: '请假详情',
          leaveType: '请假类型：',
          duration: '时长：',
          leaveSessions: '请假时段：',
          reason: '原因：',
          approvalRemarks: '审批备注',
          remarksPlaceholder: '输入备注（拒绝时必填）',
          reject: '拒绝',
          approve: '批准',
          confirmAction: '确认操作',
          approveConfirm: '确定要批准这个请假申请吗？',
          rejectConfirm: '确定要拒绝这个请假申请吗？',
          success: '成功',
          approveSuccess: '请假申请已成功批准',
          rejectSuccess: '请假申请已成功拒绝',
          error: '错误',
          remarksRequired: '请提供拒绝原因',
          days: '天',
          day: '天',
          cancel: '取消',
          confirm: '确认',
          leaveNotFound: '未找到请假详情',
        }[key] || key;

      case 'zh-Hant':
        return {
          employeeInfo: '員工資訊',
          employeeNo: '員工編號：',
          name: '姓名：',
          leaveDetails: '請假詳情',
          leaveType: '請假類型：',
          duration: '時長：',
          leaveSessions: '請假時段：',
          reason: '原因：',
          approvalRemarks: '審批備註',
          remarksPlaceholder: '輸入備註（拒絕時必填）',
          reject: '拒絕',
          approve: '批准',
          confirmAction: '確認操作',
          approveConfirm: '確定要批准這個��假申請嗎？',
          rejectConfirm: '確定要拒絕這個請假申請嗎？',
          success: '成功',
          approveSuccess: '請假申請已成功批准',
          rejectSuccess: '請假申請已成功拒絕',
          error: '錯誤',
          remarksRequired: '請提供拒絕原因',
          days: '天',
          day: '天',
          cancel: '取消',
          confirm: '確認',
          leaveNotFound: '未找到請假詳情',
        }[key] || key;

      default: // 'en'
        return {
          employeeInfo: 'Employee Information',
          employeeNo: 'Employee No:',
          name: 'Name:',
          leaveDetails: 'Leave Details',
          leaveType: 'Leave Type:',
          duration: 'Duration:',
          leaveSessions: 'Leave Sessions:',
          reason: 'Reason:',
          approvalRemarks: 'Approval Remarks',
          remarksPlaceholder: 'Enter remarks (required for rejection)',
          reject: 'Reject',
          approve: 'Approve',
          confirmAction: 'Confirm Action',
          approveConfirm: 'Are you sure you want to approve this leave application?',
          rejectConfirm: 'Are you sure you want to reject this leave application?',
          success: 'Success',
          approveSuccess: 'Leave application approved successfully',
          rejectSuccess: 'Leave application rejected successfully',
          error: 'Error',
          remarksRequired: 'Please provide remarks for rejection',
          days: 'days',
          day: 'day',
          cancel: 'Cancel',
          confirm: 'Confirm',
          leaveNotFound: 'Leave detail not found',
        }[key] || key;
    }
  };

  const getTitle = (): string => {
    switch (language) {
      case 'ms':
        return 'Lulus Permohonan Cuti';
      case 'zh-Hans':
        return '审批请假申请';
      case 'zh-Hant':
        return '審批請假申請';
      default: // 'en'
        return 'Approve Leave Application';
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: theme.headerBackground,
        shadowColor: 'transparent',
        elevation: 0,
      },
      headerTintColor: theme.headerText,
      headerTitleStyle: {
        color: theme.headerText,
        fontSize: 17,
        fontWeight: '600',
      },
      headerShadowVisible: false,
      title: getTitle(),
    });
  }, [navigation, theme, language]);

  const handleApprovalAction = async (action: 'approve' | 'reject') => {
    if (!remarks.trim() && action === 'reject') {
      Alert.alert(getLocalizedText('error'), getLocalizedText('remarksRequired'));
      return;
    }

    Alert.alert(
      getLocalizedText('confirmAction'),
      action === 'approve' ? getLocalizedText('approveConfirm') : getLocalizedText('rejectConfirm'),
      [
        { text: getLocalizedText('cancel'), style: 'cancel' },
        { text: getLocalizedText('confirm'), onPress: () => submitApprovalAction(action) }
      ]
    );
  };

  const submitApprovalAction = async (action: 'approve' | 'reject') => {
    setIsSubmitting(true);
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        Alert.alert('Error', 'User token is missing');
        return;
      }

      const url = `${baseUrl}/apps/api/v1/leaves/approvals/pending-applications/${leaveDetail.applicationId}/${action}/${leaveDetail.approvalActionId}`;
      
      const requestBody = action === 'reject' 
        ? { reason: remarks.trim() }  // For reject: use "reason" as the key
        : { remarks: remarks.trim() }; // For approve: use "remarks" as the key

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert(
          getLocalizedText('success'),
          action === 'approve' ? getLocalizedText('approveSuccess') : getLocalizedText('rejectSuccess'),
          [{ text: getLocalizedText('confirm'), onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert(getLocalizedText('error'), data.message || `Failed to ${action} leave application`);
      }
    } catch (error) {
      Alert.alert(getLocalizedText('error'), `An error occurred while ${action}ing the leave application`);
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  if (!leaveDetail) {
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>{getLocalizedText('leaveNotFound')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView>
        {/* Employee Information Card */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={[styles.cardHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              {getLocalizedText('employeeInfo')}
            </Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: theme.subText }]}>
                {getLocalizedText('employeeNo')}
              </Text>
              <Text style={[styles.value, { color: theme.text }]}>{leaveDetail.employeeNo}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: theme.subText }]}>
                {getLocalizedText('name')}
              </Text>
              <Text style={[styles.value, { color: theme.text }]}>{leaveDetail.employeeName}</Text>
            </View>
          </View>
        </View>

        {/* Leave Details Card */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={[styles.cardHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              {getLocalizedText('leaveDetails')}
            </Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: theme.subText }]}>
                {getLocalizedText('leaveType')}
              </Text>
              <Text style={[styles.value, { color: theme.text }]}>{leaveDetail.leaveDescription}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: theme.subText }]}>
                {getLocalizedText('duration')}
              </Text>
              <Text style={[styles.value, { color: theme.text }]}>
                {formatDate(leaveDetail.dateFrom)} - {formatDate(leaveDetail.dateTo)}
                {'\n'}({leaveDetail.totalDay} {leaveDetail.totalDay > 1 ? getLocalizedText('days') : getLocalizedText('day')})
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={[styles.label, { color: theme.subText }]}>
                {getLocalizedText('leaveSessions')}
              </Text>
              {leaveDetail.leaveDateList.map((leaveDate, index) => (
                <Text key={index} style={[styles.value, { color: theme.text }]}>
                  {formatDate(leaveDate.date)} - {leaveDate.session}
                </Text>
              ))}
            </View>
            {leaveDetail.reason && (
              <View style={styles.infoRow}>
                <Text style={[styles.label, { color: theme.subText }]}>
                  {getLocalizedText('reason')}
                </Text>
                <Text style={[styles.value, { color: theme.text }]}>{leaveDetail.reason}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Remarks Input */}
        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <View style={[styles.cardHeader, { borderBottomColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>
              {getLocalizedText('approvalRemarks')}
            </Text>
          </View>
          <View style={styles.cardContent}>
            <TextInput
              style={[
                styles.remarksInput, 
                { 
                  borderColor: theme.border,
                  backgroundColor: theme.background,
                  color: theme.text
                }
              ]}
              placeholder={getLocalizedText('remarksPlaceholder')}
              placeholderTextColor={theme.subText}
              value={remarks}
              onChangeText={setRemarks}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleApprovalAction('reject')}
            disabled={isSubmitting}
          >
            <Image
              source={require('../../../../asset/img/icon/a-close.png')}
              style={[styles.actionIcon, styles.rejectIcon]}
            />
            <Text style={[styles.actionButtonText, styles.rejectButtonText]}>
              {getLocalizedText('reject')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApprovalAction('approve')}
            disabled={isSubmitting}
          >
            <Image
              source={require('../../../../asset/img/icon/a-check.png')}
              style={[styles.actionIcon, styles.approveIcon]}
            />
            <Text style={[styles.actionButtonText, styles.approveButtonText]}>
              {getLocalizedText('approve')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {isSubmitting && (
        <View style={[styles.overlay, { backgroundColor: theme.background + '80' }]}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  remarksInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ApproveLeaveDetail;
