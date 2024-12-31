import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, ImageStyle } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../setting/ThemeContext';
import { useLanguage } from '../setting/LanguageContext';
import CustomAlert from '../setting/CustomAlert';

interface Leave {
  id: number;
  employeeName: string;
  leaveCodeDesc: string;
  approvalStatusDisplay: string;
  totalDays: number;
  dateFrom: string;
  dateTo: string;
  reason: string;
}

// Define a simple navigation type
type NavigationParams = {
  LeaveDetail: { applicationId: number };
};

type TranslationKey = 'leaveApplications' | 'error' | 'failedFetch' | 'ok' | 'leaveOverview' | 'duration' | 'days' | 'day' | 'approved' | 'rejected' | 'cancelled' | 'pending' | 'pendingCancellation' | 'loading' | 'noApplications';

interface Translations {
  [key: string]: {
    [K in TranslationKey]: string;
  };
}

const LeaveApplicationListing = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [year, setYear] = useState(new Date().getFullYear());
  const [leaveData, setLeaveData] = useState<Leave[]>([]);
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [employeeId, setEmployeeId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    buttons: [] as Array<{text: string, onPress: () => void}>,
  });
  const navigation = useNavigation<NavigationProp<NavigationParams>>(); // Initialize navigation

  const translations: Translations = {
    en: {
      leaveOverview: 'Leave Overview',
      leaveApplications: 'Leave Applications',
      error: 'Error',
      failedFetch: 'Failed to fetch leave data',
      ok: 'OK',
      duration: 'Duration',
      days: 'days',
      day: 'day',
      approved: 'Approved',
      rejected: 'Rejected',
      cancelled: 'Cancelled',
      pending: 'Pending',
      pendingCancellation: 'Pending Cancellation',
      loading: 'Loading...',
      noApplications: 'No leave applications for',
    },
    ms: {
      leaveOverview: 'Lihat Permohonan Cuti',
      leaveApplications: 'Permohonan Cuti',
      error: 'Ralat',
      failedFetch: 'Gagal mendapatkan data cuti',
      ok: 'OK',
      duration: 'Tempoh',
      days: 'hari',
      day: 'hari',
      approved: 'Diluluskan',
      rejected: 'Ditolak',
      cancelled: 'Dibatalkan',
      pending: 'Tertunda',
      pendingCancellation: 'Pembatalan Tertunda',
      loading: 'Memuatkan...',
      noApplications: 'Tiada permohonan cuti untuk',
    },
    'zh-Hans': {
      leaveOverview: '查看请假申请',
      leaveApplications: '请假申请',
      error: '错误',
      failedFetch: '获取请假数据失败',
      ok: '确定',
      duration: '时段',
      days: '天',
      day: '天',
      approved: '已批准',
      rejected: '已拒绝',
      cancelled: '已取消',
      pending: '待审批',
      pendingCancellation: '待取消',
      loading: '加载中...',
      noApplications: '没有请假申请',
    },
    'zh-Hant': {
      leaveOverview: '查看請假申請',
      leaveApplications: '請假申請',
      error: '錯誤',
      failedFetch: '獲取請假數據失敗',
      ok: '確定',
      duration: '時段',
      days: '天',
      day: '天',
      approved: '已批准',
      rejected: '已拒絕',
      cancelled: '已取消',
      pending: '待審批',
      pendingCancellation: '待取消',
      loading: '加載中...',
      noApplications: '沒有請假申請',
    },
  };

  const getLocalizedText = (key: TranslationKey) => {
    return translations[language][key];
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: getLocalizedText('leaveOverview'),
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
    const fetchData = async () => {
      try {
        const storedBaseUrl = await AsyncStorage.getItem('baseUrl');
        const storedEmployeeId = await AsyncStorage.getItem('employeeId');
        if (!storedBaseUrl || !storedEmployeeId) {
          showAlert(getLocalizedText('error'), getLocalizedText('failedFetch'));
          return;
        }
        setBaseUrl(storedBaseUrl);
        setEmployeeId(storedEmployeeId);
        fetchLeaveData(storedBaseUrl, storedEmployeeId, year);
      } catch (error) {
        showAlert(getLocalizedText('error'), getLocalizedText('failedFetch'));
      }
    };
    fetchData();
  }, [year]);

  useFocusEffect(
    useCallback(() => {
      if (baseUrl && employeeId) {
        fetchLeaveData(baseUrl, employeeId, year);
      }
    }, [baseUrl, employeeId, year])
  );

  const fetchLeaveData = async (urlBase: string, empId: string, year: number) => {
    try {
      setIsLoading(true);
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        showAlert(getLocalizedText('error'), getLocalizedText('failedFetch'));
        return;
      }
      const url = `${urlBase}/apps/api/v1/employees/${empId}/leaves?Year=${year}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          const applicationIds = data.data.map((leave: Leave) => leave.id);
          await AsyncStorage.setItem('applicationIds', JSON.stringify(applicationIds));
          
          // Sort the leave data by date in ascending order
          const sortedData = data.data.sort((a: Leave, b: Leave) => {
            const dateA = new Date(a.dateFrom);
            const dateB = new Date(b.dateFrom);
            return dateA.getTime() - dateB.getTime();
          });
          
          setLeaveData(sortedData);
        } else {
          showAlert(getLocalizedText('error'), getLocalizedText('failedFetch'));
        }
      } else {
        showAlert(getLocalizedText('error'), getLocalizedText('failedFetch'));
      }
    } catch (error) {
      showAlert(getLocalizedText('error'), getLocalizedText('failedFetch'));
    } finally {
      setIsLoading(false);
    }
  };

  const showAlert = (title: string, message: string) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons: [
        { text: getLocalizedText('ok'), onPress: () => setAlertConfig(prev => ({ ...prev, visible: false })) }
      ],
    });
  };

  const incrementYear = () => setYear((prevYear) => prevYear + 1);
  const decrementYear = () => setYear((prevYear) => prevYear - 1);
  const handleLeaveClick = (leave: Leave) => {
    navigation.navigate('LeaveDetail', { applicationId: leave.id }); // Navigate to LeaveDetail
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
  const getStatusColor = (status: string) => {
    const statusColors = {
      [getLocalizedText('approved')]: {
        backgroundColor: '#34C759',  // Green
        textColor: '#FFFFFF'
      },
      [getLocalizedText('rejected')]: {
        backgroundColor: '#FF3B30',  // Red
        textColor: '#FFFFFF'
      },
      [getLocalizedText('cancelled')]: {
        backgroundColor: '#FF9500',  // Orange
        textColor: '#FFFFFF'
      },
      [getLocalizedText('pending')]: {
        backgroundColor: '#FFD60A',  // Yellow
        textColor: '#000000'
      },
      [getLocalizedText('pendingCancellation')]: {
        backgroundColor: '#FFD60A',  // Yellow
        textColor: '#000000'
      }
    };

    return statusColors[status] || {
      backgroundColor: theme.subText,
      textColor: theme.text
    };
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.headerCard, { 
        backgroundColor: theme.card,
        shadowColor: theme.shadowColor,
      }]}>
        <Text style={[styles.title, { color: theme.text }]}>
          {getLocalizedText('leaveApplications')}
        </Text>
        <View style={styles.yearSelector}>
          <TouchableOpacity onPress={decrementYear} style={styles.yearButton}>
            <Image 
              source={require('../../../../asset/img/icon/a-d-arrow-left.png')} 
              style={styles.arrowIcon as ImageStyle}
            />
          </TouchableOpacity>
          <Text style={[styles.yearText, { color: theme.text }]}>{year}</Text>
          <TouchableOpacity onPress={incrementYear} style={styles.yearButton}>
            <Image 
              source={require('../../../../asset/img/icon/a-d-arrow-right.png')} 
              style={[styles.arrowIcon as ImageStyle, { tintColor: theme.primary }]} 
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <ScrollView contentContainerStyle={styles.leaveList}>
          {isLoading ? (
            <View style={styles.messageContainer}>
              <Text style={[styles.messageText, { color: theme.subText }]}>
                {getLocalizedText('loading')}
              </Text>
            </View>
          ) : leaveData.length > 0 ? (
            leaveData.map((leave: Leave, index) => {
              const fromDate = formatDate(leave.dateFrom);
              const toDate = formatDate(leave.dateTo);
              const displayStatus = leave.approvalStatusDisplay === 'PendingCancellation' 
                ? getLocalizedText('pendingCancellation') 
                : getLocalizedText(leave.approvalStatusDisplay.toLowerCase() as TranslationKey);
              
              return (
                <TouchableOpacity 
                  key={index} 
                  style={[styles.leaveCard, { 
                    backgroundColor: theme.card,
                    shadowColor: theme.shadowColor,
                  }]} 
                  onPress={() => handleLeaveClick(leave)}
                >
                  <View style={styles.leaveHeader}>
                    <Text style={[styles.leaveType, { color: theme.text }]}>
                      {leave.leaveCodeDesc}
                    </Text>
                    <View style={[styles.statusBadge, { 
                      backgroundColor: getStatusColor(displayStatus).backgroundColor 
                    }]}>
                      <Text style={[styles.statusText, {
                        color: getStatusColor(displayStatus).textColor
                      }]}>{displayStatus}</Text>
                    </View>
                  </View>
                  <View style={styles.leaveDates}>
                    <Text style={[styles.dateLabel, { color: theme.subText }]}>
                      {getLocalizedText('duration')}:
                    </Text>
                    <Text style={[styles.dateText, { color: theme.text }]}>
                      {fromDate} - {toDate}
                    </Text>
                    <Text style={[styles.daysText, { color: theme.subText }]}>
                      ({leave.totalDays} {leave.totalDays > 1 ? getLocalizedText('days') : getLocalizedText('day')})
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.messageContainer}>
              <Text style={[styles.messageText, { color: theme.subText }]}>
                {getLocalizedText('noApplications')} {year}.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onDismiss={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
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
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearButton: {
    padding: 8,
  },
  yearText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 24,
  },
  arrowIcon: {
    width: 24,
    height: 24,
    tintColor: '#007AFF',
  },
  leaveList: {
    paddingBottom: 20,
  },
  leaveCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leaveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  leaveType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  leaveDates: {
    flexDirection: 'column',
    gap: 4,
  },
  dateLabel: {
    fontSize: 14,
    color: '#666',
  },
  dateText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  daysText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
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
  contentContainer: {
    flex: 1,
  },
});

export default LeaveApplicationListing;