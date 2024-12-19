import React, { useState, useLayoutEffect, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../setting/ThemeContext';
import { useLanguage } from '../setting/LanguageContext';
import CustomAlert from '../setting/CustomAlert';

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface OvertimeDetails {
  id: number;
  attendanceDate: string;
  dateTimeFrom: string;
  dateTimeTo: string;
  approvalStatus: string;
  reason: string | null;
  employeeNo: string;
  employeeName: string;
  approvalStatusDisplay: string;
  costCenter: string;
  department: string;
  division: string;
  approvedBy: string | null;
}

const translations = {
  'en': {
    title: 'Cancel Overtime',
    confirmTitle: 'Confirm Cancellation',
    confirmMessage: 'Are you sure you want to cancel this overtime application?',
    cancel: 'Cancel',
    confirm: 'Confirm',
    success: 'Success',
    error: 'Error',
    cancelSuccess: 'Overtime application cancelled successfully',
    cancelError: 'Failed to cancel overtime application',
    notAllowed: 'Cancellation is not allowed for this status',
    date: 'Date',
    time: 'Time',
    duration: 'Duration',
    employee: 'Employee',
    department: 'Department',
    costCenter: 'Cost Center',
    division: 'Division',
    approvedBy: 'Approved By',
    reason: 'Reason',
    hours: 'hours',
    notApplicable: 'N/A',
  },
  'ms': {
    title: 'Batal Kerja Lebih Masa',
    confirmTitle: 'Sahkan Pembatalan',
    confirmMessage: 'Adakah anda pasti mahu membatalkan permohonan kerja lebih masa ini?',
    cancel: 'Batal',
    confirm: 'Sahkan',
    success: 'Berjaya',
    error: 'Ralat',
    cancelSuccess: 'Permohonan kerja lebih masa berjaya dibatalkan',
    cancelError: 'Gagal membatalkan permohonan kerja lebih masa',
    notAllowed: 'Pembatalan tidak dibenarkan untuk status ini',
    date: 'Tarikh',
    time: 'Masa',
    duration: 'Tempoh',
    employee: 'Pekerja',
    department: 'Jabatan',
    costCenter: 'Pusat Kos',
    division: 'Bahagian',
    approvedBy: 'Diluluskan Oleh',
    reason: 'Sebab',
    hours: 'jam',
    notApplicable: 'N/A',
  },
  'zh-Hans': {
    title: '取消加班',
    confirmTitle: '确认取消',
    confirmMessage: '您确定要取消此加班申请吗？',
    cancel: '取消',
    confirm: '确认',
    success: '成功',
    error: '错误',
    cancelSuccess: '加班申请已成功取消',
    cancelError: '取消加班申请失败',
    notAllowed: '此状态不允许取消',
    date: '日期',
    time: '时间',
    duration: '时长',
    employee: '员工',
    department: '部门',
    costCenter: '成本中心',
    division: '部门',
    approvedBy: '批准人',
    reason: '原因',
    hours: '小时',
    notApplicable: '不适用',
  },
  'zh-Hant': {
    title: '取消加班',
    confirmTitle: '確認取消',
    confirmMessage: '您確定要取消此加班申請嗎？',
    cancel: '取消',
    confirm: '確認',
    success: '成功',
    error: '錯誤',
    cancelSuccess: '加班申請已成功取消',
    cancelError: '取消加班申請失敗',
    notAllowed: '此狀態不允許取消',
    date: '日期',
    time: '時間',
    duration: '時長',
    employee: '員工',
    department: '部門',
    costCenter: '成本中心',
    division: '部門',
    approvedBy: '批准人',
    reason: '原因',
    hours: '小時',
    notApplicable: '不適用',
  }
};

const OTCancelApplication = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [] as AlertButton[]
  });
  const [details, setDetails] = useState<OvertimeDetails | null>(null);

  const { applicationId, status } = route.params;
  const t = translations[language as keyof typeof translations];

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
      title: t.title,
    });
  }, [navigation, theme, language]);

  const handleCancel = async () => {
    if (!['P', 'A'].includes(status)) {
      setAlertConfig({
        visible: true,
        title: t.error,
        message: t.notAllowed,
        buttons: [{
          text: 'OK',
          onPress: () => {
            setAlertConfig(prev => ({ ...prev, visible: false }));
            navigation.goBack();
          }
        }]
      });
      return;
    }

    setAlertConfig({
      visible: true,
      title: t.confirmTitle,
      message: t.confirmMessage,
      buttons: [
        {
          text: t.cancel,
          style: 'cancel',
          onPress: () => setAlertConfig(prev => ({ ...prev, visible: false }))
        },
        {
          text: t.confirm,
          style: 'destructive',
          onPress: submitCancellation
        }
      ]
    });
  };

  const submitCancellation = async () => {
    setIsLoading(true);
    try {
      const baseUrl = await AsyncStorage.getItem('baseUrl');
      const userToken = await AsyncStorage.getItem('userToken');
      const employeeId = await AsyncStorage.getItem('employeeId');

      const response = await fetch(
        `${baseUrl}/apps/api/v1/employees/${employeeId}/overtime/${applicationId}/cancel`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        setAlertConfig({
          visible: true,
          title: t.success,
          message: t.cancelSuccess,
          buttons: [{
            text: 'OK',
            onPress: () => {
              setAlertConfig(prev => ({ ...prev, visible: false }));
              navigation.goBack();
            }
          }]
        });
      } else {
        throw new Error(result.message || t.cancelError);
      }
    } catch (error) {
      setAlertConfig({
        visible: true,
        title: t.error,
        message: t.cancelError,
        buttons: [{
          text: 'OK',
          onPress: () => setAlertConfig(prev => ({ ...prev, visible: false }))
        }]
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString(language, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const calculateDuration = (from: string, to: string) => {
    const start = new Date(from);
    const end = new Date(to);
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    return `${hours.toFixed(1)} ${t.hours}`;
  };

  const fetchDetails = async () => {
    try {
      const baseUrl = await AsyncStorage.getItem('baseUrl');
      const userToken = await AsyncStorage.getItem('userToken');
      const employeeId = await AsyncStorage.getItem('employeeId');

      const response = await fetch(
        `${baseUrl}/apps/api/v1/employees/${employeeId}/overtime/${applicationId}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        setDetails(result.data);
      }
    } catch (error) {
      console.error('Error fetching details:', error);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, []);

  const renderDetailItem = (label: string, value: string | null) => (
    <View style={styles.detailItem}>
      <Text style={[styles.label, { color: theme.subText }]}>{label}</Text>
      <Text style={[styles.value, { color: theme.text }]}>
        {value || t.notApplicable}
      </Text>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        {details && (
          <>
            <View style={[styles.header, { borderBottomColor: theme.border }]}>
              <Text style={[styles.dateText, { color: theme.text }]}>
                {formatDate(details.attendanceDate)}
              </Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: details.approvalStatus === 'P' ? '#FFB800' : '#34C759' }
              ]}>
                <Text style={[styles.statusText, { color: '#FFFFFF' }]}>
                  {details.approvalStatusDisplay}
                </Text>
              </View>
            </View>

            <View style={styles.content}>
              {renderDetailItem(t.time, 
                `${formatTime(details.dateTimeFrom)} - ${formatTime(details.dateTimeTo)}`)}
              {renderDetailItem(t.duration, 
                calculateDuration(details.dateTimeFrom, details.dateTimeTo))}
              {renderDetailItem(t.employee, 
                `${details.employeeNo} - ${details.employeeName}`)}
              {renderDetailItem(t.department, details.department)}
              {renderDetailItem(t.costCenter, details.costCenter)}
              {renderDetailItem(t.division, details.division)}
              {renderDetailItem(t.approvedBy, details.approvedBy)}
              {renderDetailItem(t.reason, details.reason)}
            </View>
          </>
        )}
      </View>

      <TouchableOpacity
        style={[styles.cancelButton, { backgroundColor: '#FF3B30' }]}
        onPress={handleCancel}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.cancelButtonText}>{t.title}</Text>
        )}
      </TouchableOpacity>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onDismiss={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    margin: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    padding: 16,
  },
  detailItem: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  cancelButton: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OTCancelApplication;
