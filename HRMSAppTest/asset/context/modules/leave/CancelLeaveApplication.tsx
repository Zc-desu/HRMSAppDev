import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../setting/CustomAlert';
import { useTheme } from '../setting/ThemeContext';
import { useLanguage } from '../setting/LanguageContext';

interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface Theme {
  primary: string;
  background: string;
  card: string;
  text: string;
  subText: string;
  border: string;
  success: string;
  error: string;
  warning: string;
  buttonBackground: string;
  buttonText: string;
  shadowColor: string;
  headerBackground: string;
  divider: string;
  headerText: string;
  statusBarStyle: string;
  isDark?: boolean;
}

const CancelLeaveApplication = ({ route, navigation }: any) => {
  const { theme } = useTheme() as { theme: Theme };
  const { applicationId } = route.params;
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [leaveDetail, setLeaveDetail] = useState<any>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message: string;
    buttons: AlertButton[];
  }>({
    title: '',
    message: '',
    buttons: [],
  });
  const { language } = useLanguage();

  useEffect(() => {
    const getLeaveDetail = async () => {
      const detail = await AsyncStorage.getItem('leaveDetail');
      if (detail) {
        setLeaveDetail(JSON.parse(detail));
      }
    };
    getLeaveDetail();
  }, []);

  useLayoutEffect(() => {
    navigation.setOptions({
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
      title: getLocalizedText('cancelLeave'),
    });
  }, [navigation, theme, language]);

  const formatDate = (dateString: string) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const date = new Date(dateString);
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
  };

  const showCustomAlert = (title: string, message: string, buttons: AlertButton[] = []) => {
    setAlertConfig({
      title,
      message,
      buttons: buttons.map(btn => ({
        ...btn,
        onPress: () => {
          setAlertVisible(false);
          btn.onPress?.();
        },
      })),
    });
    setAlertVisible(true);
  };

  const cancelLeave = async () => {
    if (!reason.trim()) {
      showCustomAlert(
        getLocalizedText('required'),
        getLocalizedText('pleaseProvideReason'),
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }

    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const baseUrl = await AsyncStorage.getItem('baseUrl');
      const employeeId = await AsyncStorage.getItem('employeeId');
      
      if (token && baseUrl && employeeId) {
        const url = `${baseUrl}/apps/api/v1/employees/${employeeId}/leaves/${applicationId}/cancel`;
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reason: reason }),
        });
        
        const data = await response.json();
        if (data.success) {
          showCustomAlert(
            getLocalizedText('success'),
            getLocalizedText('cancelSuccess'),
            [{ 
              text: 'OK',
              style: 'default',
              onPress: () => navigation.goBack()
            }]
          );
        } else {
          showCustomAlert(
            'Error',
            data.message || 'Failed to cancel the leave.',
            [{ 
              text: 'OK',
              style: 'default'
            }]
          );
        }
      }
    } catch (error) {
      showCustomAlert(
        'Error',
        'An error occurred while cancelling the leave.',
        [{ 
          text: 'OK',
          style: 'default'
        }]
      );
      console.error('Cancel Leave Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPress = () => {
    showCustomAlert(
      getLocalizedText('confirmCancellation'),
      getLocalizedText('confirmCancel'),
      [
        {
          text: getLocalizedText('no'),
          style: 'cancel'
        },
        {
          text: getLocalizedText('yes'),
          style: 'destructive',
          onPress: cancelLeave
        }
      ]
    );
  };

  const getLocalizedText = (key: string) => {
    switch (language) {
      case 'ms':
        return {
          cancelLeave: 'Batal Cuti',
          cancelApplication: 'Pembatalan Permohonan Cuti',
          confirmCancel: 'Adakah anda pasti mahu membatalkan permohonan cuti ini?',
          leaveType: 'Jenis Cuti',
          status: 'Status',
          appliedOn: 'Tarikh Permohonan',
          startDate: 'Tarikh Mula',
          endDate: 'Tarikh Tamat',
          duration: 'Tempoh',
          reason: 'Sebab',
          backupPerson: 'Orang Ganti',
          days: 'hari',
          cancelReason: 'Sebab Pembatalan*',
          languageInstruction: 'Sila masukkan sebab dalam Bahasa Melayu atau Bahasa Inggeris sahaja',
          required: 'Diperlukan',
          pleaseProvideReason: 'Sila berikan sebab pembatalan.',
          success: 'Berjaya',
          cancelSuccess: 'Cuti telah dibatalkan dengan jayanya.',
          error: 'Ralat',
          cancelError: 'Gagal membatalkan cuti.',
          systemError: 'Ralat sistem semasa membatalkan cuti.',
          confirmCancellation: 'Sahkan Pembatalan',
          yes: 'Ya',
          no: 'Tidak',
          goBack: 'Kembali',
          detailsNotFound: 'Butiran cuti tidak dijumpai.',
          enterCancelReason: {
            'en': 'Enter your reason for cancellation',
            'ms': 'Masukkan sebab pembatalan',
            'zh-Hans': '请输入取消原因',
            'zh-Hant': '請輸入取消原因'
          }[language] || 'Enter your reason for cancellation'
        }[key] || key;

      case 'zh-Hans':
        return {
          cancelLeave: '取消请假',
          cancelApplication: '取消请假申请',
          confirmCancel: '您确定要取消此请假申请吗？',
          leaveType: '请假类型',
          status: '状态',
          appliedOn: '申请日期',
          startDate: '开始日期',
          endDate: '结束日期',
          duration: '时长',
          reason: '原因',
          backupPerson: '替班人',
          days: '天',
          cancelReason: '取消原因*',
          languageInstruction: '请用马来语或英语填写原因',
          required: '必填',
          pleaseProvideReason: '请提供取消原因。',
          success: '成功',
          cancelSuccess: '请假已成功取消。',
          error: '错误',
          cancelError: '取消请假失败。',
          systemError: '取消请假时发生系统错误。',
          confirmCancellation: '确认取消',
          yes: '是',
          no: '否',
          goBack: '返回',
          detailsNotFound: '未找到请假详情。',
          enterCancelReason: {
            'en': 'Enter your reason for cancellation',
            'ms': 'Masukkan sebab pembatalan',
            'zh-Hans': '请输入取消原因',
            'zh-Hant': '請輸入取消原因'
          }[language] || 'Enter your reason for cancellation'
        }[key] || key;

      case 'zh-Hant':
        return {
          cancelLeave: '取消請假',
          cancelApplication: '取消請假申請',
          confirmCancel: '您確定要取消此請假申請嗎？',
          leaveType: '請假類型',
          status: '狀態',
          appliedOn: '申請日期',
          startDate: '開始日期',
          endDate: '結束日期',
          duration: '時長',
          reason: '原因',
          backupPerson: '替班人',
          days: '天',
          cancelReason: '取消原因*',
          languageInstruction: '請用馬來語或英語填寫原因',
          required: '必填',
          pleaseProvideReason: '請提供取消原因。',
          success: '成功',
          cancelSuccess: '請假已成功取消。',
          error: '錯誤',
          cancelError: '取消請假失敗。',
          systemError: '取消請假時發生系統錯誤。',
          confirmCancellation: '確認取消',
          yes: '是',
          no: '否',
          goBack: '返回',
          detailsNotFound: '未找到請假詳情。',
          enterCancelReason: {
            'en': 'Enter your reason for cancellation',
            'ms': 'Masukkan sebab pembatalan',
            'zh-Hans': '请输入取消原因',
            'zh-Hant': '請輸入取消原因'
          }[language] || 'Enter your reason for cancellation'
        }[key] || key;

      default: // 'en'
        return {
          cancelLeave: 'Cancel Leave',
          cancelApplication: 'Cancel Leave Application',
          confirmCancel: 'Are you sure you want to cancel this leave application?',
          leaveType: 'Leave Type',
          status: 'Status',
          appliedOn: 'Applied On',
          startDate: 'Start Date',
          endDate: 'End Date',
          duration: 'Duration',
          reason: 'Reason',
          backupPerson: 'Backup Person',
          days: 'day(s)',
          cancelReason: 'Cancellation Reason*',
          languageInstruction: 'Please enter your reason in Bahasa Melayu or English only',
          required: 'Required',
          pleaseProvideReason: 'Please provide a reason for cancellation.',
          success: 'Success',
          cancelSuccess: 'Leave has been cancelled successfully.',
          error: 'Error',
          cancelError: 'Failed to cancel the leave.',
          systemError: 'An error occurred while cancelling the leave.',
          confirmCancellation: 'Confirm Cancellation',
          yes: 'Yes',
          no: 'No',
          goBack: 'Go Back',
          detailsNotFound: 'Leave details not found.',
          enterCancelReason: {
            'en': 'Enter your reason for cancellation',
            'ms': 'Masukkan sebab pembatalan',
            'zh-Hans': '请输入取消原因',
            'zh-Hant': '請輸入取消原因'
          }[language] || 'Enter your reason for cancellation'
        }[key] || key;
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!leaveDetail) {
    return (
      <View style={[styles.messageContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.messageText, { color: theme.subText }]}>
          Leave details not found.
        </Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.contentContainer}>
          <View style={[styles.warningCard, {
            backgroundColor: theme.isDark 
              ? 'rgba(255, 69, 58, 0.15)' 
              : 'rgba(255, 59, 48, 0.1)',
            borderColor: theme.isDark 
              ? 'rgba(255, 69, 58, 0.3)' 
              : 'rgba(255, 59, 48, 0.2)',
          }]}>
            <Text style={[styles.warningTitle, { 
              color: theme.isDark ? '#FF453A' : '#FF3B30' 
            }]}>
              {getLocalizedText('cancelApplication')}
            </Text>
            <Text style={[styles.warningText, { 
              color: theme.isDark ? '#FF453A' : '#FF3B30' 
            }]}>
              {getLocalizedText('confirmCancel')}
            </Text>
          </View>

          <View style={[styles.detailsCard, { 
            backgroundColor: theme.card,
            borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : theme.border,
          }]}>
            <DetailItem 
              label={getLocalizedText('leaveType')} 
              value={leaveDetail.leaveCodeDesc}
              theme={theme}
            />
            <DetailItem 
              label={getLocalizedText('status')} 
              value={leaveDetail.approvalStatusDisplay}
              theme={theme}
            />
            <DetailItem 
              label={getLocalizedText('appliedOn')} 
              value={formatDate(leaveDetail.createdDate)}
              theme={theme}
            />
            <DetailItem 
              label={getLocalizedText('startDate')} 
              value={formatDate(leaveDetail.dateFrom)}
              theme={theme}
            />
            <DetailItem 
              label={getLocalizedText('endDate')} 
              value={formatDate(leaveDetail.dateTo)}
              theme={theme}
            />
            <DetailItem 
              label={getLocalizedText('duration')} 
              value={`${leaveDetail.totalDays} ${getLocalizedText('days')}`}
              theme={theme}
            />
            <DetailItem 
              label={getLocalizedText('reason')} 
              value={leaveDetail.reason || '--'}
              theme={theme}
            />
            <DetailItem 
              label={getLocalizedText('backupPerson')} 
              value={leaveDetail.backupPersonEmployeeName || '--'}
              theme={theme}
            />
          </View>

          <View style={[styles.inputCard, { 
            backgroundColor: theme.card,
            borderColor: theme.isDark ? 'rgba(255, 255, 255, 0.1)' : theme.border,
          }]}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>
              {getLocalizedText('cancelReason')}
            </Text>
            <Text style={[styles.inputInstruction, { color: theme.subText }]}>
              {getLocalizedText('languageInstruction')}
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: theme.background,
                color: theme.text,
                borderColor: theme.isDark ? '#3C3C3E' : '#E5E5EA',
              }]}
              placeholder={getLocalizedText('enterCancelReason')}
              placeholderTextColor={theme.subText}
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.cancelButton, { 
                backgroundColor: theme.error 
              }]}
              onPress={handleCancelPress}
            >
              <Text style={[styles.cancelButtonText, { color: '#FFFFFF' }]}>
                {getLocalizedText('cancelLeave')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.backButton, { 
                backgroundColor: theme.isDark ? '#3A3A3C' : '#E5E5E5'
              }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={[styles.backButtonText, { 
                color: theme.isDark ? '#FFFFFF' : theme.text 
              }]}>
                {getLocalizedText('goBack')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onDismiss={() => setAlertVisible(false)}
      />
    </>
  );
};

const DetailItem = ({ label, value, theme }: { label: string; value: string; theme: Theme }) => (
  <View style={styles.detailRow}>
    <Text style={[styles.detailLabel, { color: theme.subText }]}>{label}</Text>
    <Text style={[styles.detailValue, { color: theme.text }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  warningCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
  },
  detailsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  inputCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  inputInstruction: {
    fontSize: 13,
    marginBottom: 12,
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 15,
  },
  buttonContainer: {
    gap: 12,
  },
  cancelButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
    fontWeight: '500',
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
    textAlign: 'center',
  },
});

export default CancelLeaveApplication;