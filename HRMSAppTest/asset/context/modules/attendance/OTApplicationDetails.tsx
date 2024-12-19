import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../setting/ThemeContext';
import { useLanguage } from '../setting/LanguageContext';
import CustomAlert from '../setting/CustomAlert';

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

interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

const translations = {
  'en': {
    title: 'Overtime Details',
    loading: 'Loading details...',
    error: 'Error',
    fetchError: 'Failed to fetch overtime details',
    date: 'Date',
    time: 'Time',
    duration: 'Duration',
    status: 'Status',
    employee: 'Employee',
    department: 'Department',
    costCenter: 'Cost Center',
    division: 'Division',
    approvedBy: 'Approved By',
    reason: 'Reason',
    hours: 'hours',
    notApplicable: 'N/A',
    cancel: 'Cancel Application',
    pendingCancellation: 'Pending Cancellation',
  },
  'ms': {
    title: 'Butiran Kerja Lebih Masa',
    loading: 'Memuat butiran...',
    error: 'Ralat',
    fetchError: 'Gagal mendapatkan butiran kerja lebih masa',
    date: 'Tarikh',
    time: 'Masa',
    duration: 'Tempoh',
    status: 'Status',
    employee: 'Pekerja',
    department: 'Jabatan',
    costCenter: 'Pusat Kos',
    division: 'Bahagian',
    approvedBy: 'Diluluskan Oleh',
    reason: 'Sebab',
    hours: 'jam',
    notApplicable: 'N/A',
    cancel: 'Batal Permohonan',
    pendingCancellation: 'Menunggu Pembatalan',
  },
  'zh-Hans': {
    title: '加班详情',
    loading: '加载详情中...',
    error: '错误',
    fetchError: '无法获取加班详情',
    date: '日期',
    time: '时间',
    duration: '时长',
    status: '状态',
    employee: '员工',
    department: '部门',
    costCenter: '成本中心',
    division: '部门',
    approvedBy: '审批人',
    reason: '原因',
    hours: '小时',
    notApplicable: '不适用',
    cancel: '取消申请',
    pendingCancellation: '等待取消',
  },
  'zh-Hant': {
    title: '加班詳情',
    loading: '載入詳情中...',
    error: '錯誤',
    fetchError: '無法獲取加班詳情',
    date: '日期',
    time: '時間',
    duration: '時長',
    status: '狀態',
    employee: '員工',
    department: '部門',
    costCenter: '成本中心',
    division: '部門',
    approvedBy: '審批人',
    reason: '原因',
    hours: '小時',
    notApplicable: '不適用',
    cancel: '取消申請',
    pendingCancellation: '等待取消',
  }
};

const OTApplicationDetails = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [details, setDetails] = useState<OvertimeDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [] as AlertButton[]
  });

  const { applicationId } = route.params;
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

      if (!baseUrl || !userToken || !employeeId) {
        throw new Error('Missing required information');
      }

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
      } else {
        throw new Error(result.message || t.fetchError);
      }
    } catch (error) {
      setAlertConfig({
        visible: true,
        title: t.error,
        message: t.fetchError,
        buttons: [{
          text: 'OK',
          onPress: () => setAlertConfig(prev => ({ ...prev, visible: false }))
        }]
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [applicationId]);

  const renderDetailItem = (label: string, value: string | null) => (
    <View style={styles.detailItem}>
      <Text style={[styles.label, { color: theme.subText }]}>{label}</Text>
      <Text style={[styles.value, { color: theme.text }]}>
        {value || t.notApplicable}
      </Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

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
                { 
                  backgroundColor: details.approvalStatus === 'P' ? '#FFB800' : // Yellow/Orange for Pending
                    details.approvalStatus === 'A' ? '#34C759' : // Green for Approved
                    details.approvalStatus === 'C' ? '#FF9500' : // Orange for Pending Cancellation
                    '#FF4444'  // Red for Rejected
                }
              ]}>
                <Text style={[
                  styles.statusText, 
                  { color: '#FFFFFF' }  // Always white text for all statuses
                ]}>
                  {details.approvalStatusDisplay === 'PendingCancellation' 
                    ? t.pendingCancellation 
                    : details.approvalStatusDisplay}
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

      {details && ['P', 'A', 'C'].includes(details.approvalStatus) && (
        <TouchableOpacity
          style={[styles.cancelButton, { backgroundColor: theme.error }]}
          onPress={() => navigation.navigate('OTCancelApplication', {
            applicationId: details.id,
            status: details.approvalStatus
          })}
        >
          <Text style={styles.cancelButtonText}>{t.cancel}</Text>
        </TouchableOpacity>
      )}

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

export default OTApplicationDetails;
