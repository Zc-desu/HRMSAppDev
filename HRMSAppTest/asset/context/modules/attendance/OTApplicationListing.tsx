import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../setting/ThemeContext';
import { useLanguage } from '../setting/LanguageContext';
import { StackNavigationProp } from '@react-navigation/stack';
import CustomAlert from '../setting/CustomAlert';

interface OvertimeApplication {
  id: number;
  attendanceDate: string;
  dateTimeFrom: string;
  dateTimeTo: string;
  approvalStatus: string;
  reason: string | null;
  employeeNo: string;
  employeeName: string;
  approvalStatusDisplay: string;
}

// Translations
const translations = {
  'en': {
    title: 'Overtime History',
    loading: 'Loading overtime records...',
    noApplications: 'No overtime records found',
    error: 'Error loading overtime records',
    date: 'Date',
    time: 'Time',
    status: 'Status',
    approved: 'Approved',
    pending: 'Pending',
    rejected: 'Rejected',
    hours: 'hours',
    fetchError: 'Failed to fetch overtime records',
    pendingCancellation: 'Pending Cancellation',
  },
  'ms': {
    title: 'Sejarah Kerja Lebih Masa',
    loading: 'Memuat rekod kerja lebih masa...',
    noApplications: 'Tiada rekod kerja lebih masa',
    error: 'Ralat memuat rekod',
    date: 'Tarikh',
    time: 'Masa',
    status: 'Status',
    approved: 'Diluluskan',
    pending: 'Menunggu',
    rejected: 'Ditolak',
    hours: 'jam',
    fetchError: 'Gagal mendapatkan rekod kerja lebih masa',
    pendingCancellation: 'Menunggu Pembatalan',
  },
  'zh-Hans': {
    title: '加班记录',
    loading: '加载加班记录中...',
    noApplications: '没有加班记录',
    error: '加载记录时出错',
    date: '日期',
    time: '时间',
    status: '状态',
    approved: '已批准',
    pending: '待处理',
    rejected: '已拒绝',
    hours: '小时',
    fetchError: '获取加班记录失败',
    pendingCancellation: '等待取消',
  },
  'zh-Hant': {
    title: '加班紀錄',
    loading: '載入加班紀錄中...',
    noApplications: '沒有加班紀錄',
    error: '載入紀錄時出錯',
    date: '日期',
    time: '時間',
    status: '狀態',
    approved: '已批准',
    pending: '待處理',
    rejected: '已拒絕',
    hours: '小時',
    fetchError: '獲取加班紀錄失敗',
    pendingCancellation: '等待取消',
  }
};

type RootStackParamList = {
  OTApplicationDetails: {
    applicationId: number;
    baseUrl: string;
  };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const OTApplicationListing = ({ navigation }: { navigation: NavigationProp }) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [applications, setApplications] = useState<OvertimeApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: Array<{ text: string; onPress: () => void; }>;
  }>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
  });

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

  const fetchApplications = async () => {
    try {
      const baseUrl = await AsyncStorage.getItem('baseUrl');
      const userToken = await AsyncStorage.getItem('userToken');
      const employeeId = await AsyncStorage.getItem('employeeId');

      if (!baseUrl || !userToken || !employeeId) {
        throw new Error('Missing required information');
      }

      const response = await fetch(
        `${baseUrl}/apps/api/v1/employees/${employeeId}/overtime?Month=${month}&Year=${year}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      const result = await response.json();
      if (result.success) {
        setApplications(result.data);
      } else {
        throw new Error(result.message || t.fetchError);
      }
    } catch (error) {
      setAlertConfig({
        visible: true,
        title: t.error,
        message: t.fetchError,
        buttons: [
          {
            text: 'OK',
            onPress: () => setAlertConfig(prev => ({ ...prev, visible: false }))
          }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [year, month]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'A':
        return theme.success;
      case 'P':
        return theme.warning;
      case 'R':
        return theme.error;
      case 'C':
        return '#FF9500';
      default:
        return theme.subText;
    }
  };

  const formatDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const calculateDuration = (from: string, to: string) => {
    const fromTime = new Date(from);
    const toTime = new Date(to);
    const diffHours = (toTime.getTime() - fromTime.getTime()) / (1000 * 60 * 60);
    return `${diffHours.toFixed(1)} ${t.hours}`;
  };

  const renderDateSelector = () => (
    <View style={[styles.selectorCard, { 
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderWidth: 1,
    }]}>
      <View style={styles.yearMonthSelector}>
        <TouchableOpacity 
          style={styles.arrowButton}
          onPress={() => setYear(year - 1)}
        >
          <Image
            source={require('../../../../asset/img/icon/a-d-arrow-left.png')}
            style={[styles.icon, { tintColor: theme.primary }]}
          />
        </TouchableOpacity>
        <Text style={[styles.yearText, { color: theme.text }]}>{year}</Text>
        <TouchableOpacity 
          style={styles.arrowButton}
          onPress={() => setYear(year + 1)}
        >
          <Image
            source={require('../../../../asset/img/icon/a-d-arrow-right.png')}
            style={[styles.icon, { tintColor: theme.primary }]}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.monthSelector}>
        {[...Array(12)].map((_, i) => (
          <TouchableOpacity
            key={i + 1}
            style={[
              styles.monthButton,
              month === i + 1 && { backgroundColor: theme.primary }
            ]}
            onPress={() => setMonth(i + 1)}
          >
            <Text style={[
              styles.monthText,
              { color: month === i + 1 ? '#FFFFFF' : theme.text }
            ]}>
              {i + 1}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const handleApplicationPress = async (applicationId: number) => {
    const baseUrl = await AsyncStorage.getItem('baseUrl');
    if (!baseUrl) {
      setAlertConfig({
        visible: true,
        title: t.error,
        message: 'Missing base URL',
        buttons: [
          {
            text: 'OK',
            onPress: () => setAlertConfig(prev => ({ ...prev, visible: false }))
          }
        ]
      });
      return;
    }
    
    navigation.navigate('OTApplicationDetails', {
      applicationId,
      baseUrl,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {renderDateSelector()}
      
      <ScrollView style={styles.scrollView}>
        {isLoading ? (
          <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
        ) : applications.length > 0 ? (
          applications.map((app) => (
            <TouchableOpacity
              key={app.id}
              style={[styles.card, { 
                backgroundColor: theme.background === '#000000' ? '#1C1C1E' : '#FFFFFF',
                borderColor: theme.border,
                borderWidth: 1,
              }]}
              onPress={() => handleApplicationPress(app.id)}
              activeOpacity={0.7}
            >
              <View style={styles.dateContainer}>
                <Text style={[styles.dateText, { color: theme.text }]}>
                  {formatDate(app.attendanceDate)}
                </Text>
                <View style={[
                  styles.statusBadge, 
                  { backgroundColor: getStatusColor(app.approvalStatus) }
                ]}>
                  <Text style={styles.statusText}>
                    {app.approvalStatusDisplay === 'PendingCancellation' 
                      ? t.pendingCancellation 
                      : app.approvalStatusDisplay}
                  </Text>
                </View>
              </View>
              <View style={styles.timeRow}>
                <Text style={[styles.timeText, { color: theme.subText }]}>
                  {`Time: ${formatDateTime(app.dateTimeFrom)} - ${formatDateTime(app.dateTimeTo)}`}
                </Text>
                <Text style={[styles.durationText, { color: theme.primary }]}>
                  {calculateDuration(app.dateTimeFrom, app.dateTimeTo)}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.subText }]}>
              {`${t.noApplications} ${year}/${month}`}
            </Text>
          </View>
        )}
      </ScrollView>

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
  },
  selectorCard: {
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  yearMonthSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  arrowButton: {
    padding: 8,
  },
  yearText: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
  },
  monthSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 8,
  },
  monthButton: {
    width: '23%',
    padding: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '500',
  },
  icon: {
    width: 20,
    height: 20,
  },
  scrollView: {
    flex: 1,
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    color: '#FFFFFF99',
  },
  durationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: '#FFFFFF99',
    textAlign: 'center',
  },
  loader: {
    marginTop: 32,
  },
});

export default OTApplicationListing;
