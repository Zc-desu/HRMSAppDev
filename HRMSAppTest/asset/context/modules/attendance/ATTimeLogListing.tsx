import React, { useLayoutEffect, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../modules/setting/ThemeContext';
import { useLanguage } from '../../modules/setting/LanguageContext';
import { useNavigation } from '@react-navigation/native';
import CustomAlert from '../../modules/setting/CustomAlert';
import { StackNavigationProp } from '@react-navigation/stack';

const translations = {
  'en': {
    timeLogListing: 'Time Log Listing',
    error: 'Error',
    failedFetch: 'Failed to fetch time logs',
    ok: 'OK',
    approved: 'Approved',
    pending: 'Pending',
    rejected: 'Rejected',
    photos: 'photos',
    loading: 'Loading...',
    noRecords: 'No records for'
  },
  'ms': {
    timeLogListing: 'Sejarah Log Masa',
    error: 'Ralat',
    failedFetch: 'Gagal mendapatkan log masa',
    ok: 'OK',
    approved: 'Diluluskan',
    pending: 'Dalam Proses',
    rejected: 'Ditolak',
    photos: 'gambar',
    loading: 'Memuatkan...',
    noRecords: 'Tiada rekod untuk'
  },
  'zh-Hans': {
    timeLogListing: '打卡记录',
    error: '错误',
    failedFetch: '无法获取时间记录',
    ok: '确定',
    approved: '已批准',
    pending: '待处理',
    rejected: '已拒绝',
    photos: '张照片',
    loading: '加载中...',
    noRecords: '没有记录'
  },
  'zh-Hant': {
    timeLogListing: '打卡記錄',
    error: '錯誤',
    failedFetch: '無法獲取時間記錄',
    ok: '確定',
    approved: '已批准',
    pending: '待處理',
    rejected: '已拒絕',
    photos: '張照片',
    loading: '加載中...',
    noRecords: '沒有記錄'
  }
};

interface TimeLog {
  id: string;
  entryTime: string;
  approvalStatus: string;
  address?: string;
  photos: string[];
}

interface AlertButton {
  text: string;
  onPress: () => void;
}

interface AlertConfig {
  visible: boolean;
  title: string;
  message: string;
  buttons: AlertButton[];
}

type RootStackParamList = {
  ATTimeLogDetails: {
    timeLogId: string;
    employeeId: string;
    baseUrl: string;
    photos: string[];
  };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

const ATTimeLogListing = ({ route }: any) => {
  const navigation = useNavigation<NavigationProp>();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [timeLogs, setTimeLogs] = useState<TimeLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
  });

  const { employeeId, baseUrl } = route.params;

  const getLocalizedText = (key: string) => {
    return translations[language as keyof typeof translations]?.[key as keyof typeof translations[keyof typeof translations]] || key;
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
      title: getLocalizedText('timeLogListing'),
    });
  }, [navigation, theme]);

  const fetchTimeLogs = async () => {
    setIsLoading(true);
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      
      if (!userToken) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(
        `${baseUrl}/apps/api/v1/employees/${employeeId}/attendance/time-logs?Year=${year}&Month=${month}`,
        {
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Accept': 'application/json',
          },
        }
      );

      const data = await response.json();
      
      if (data.success) {
        setTimeLogs(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch time logs');
      }
    } catch (error) {
      console.error('Error fetching time logs:', error);
      setAlertConfig({
        visible: true,
        title: getLocalizedText('error'),
        message: getLocalizedText('failedFetch'),
        buttons: [{
          text: getLocalizedText('ok'),
          onPress: () => setAlertConfig(prev => ({ ...prev, visible: false }))
        }]
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeLogs();
  }, [year, month]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const timeFormat: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kuala_Lumpur'
    };

    const locales = {
      'ms': 'ms-MY',
      'zh-Hans': 'zh-CN', 
      'zh-Hant': 'zh-TW',
      'en': 'en-MY'
    };

    return new Intl.DateTimeFormat(locales[language as keyof typeof locales] || 'en-MY', timeFormat).format(date);
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'A': {
        backgroundColor: 'rgba(52, 199, 89, 0.1)',
        textColor: '#34C759'
      },
      'P': {
        backgroundColor: 'rgba(255, 204, 0, 0.1)',
        textColor: '#FFCC00'
      },
      'R': {
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
        textColor: '#FF3B30'
      },
      'default': {
        backgroundColor: 'rgba(142, 142, 147, 0.1)',
        textColor: '#8E8E93'
      }
    };
    return colors[status as keyof typeof colors] || colors.default;
  };

  const renderDateSelector = () => (
    <View style={[styles.selectorCard, { backgroundColor: theme.card }]}>
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

  const renderTimeLogItem = (log: TimeLog) => {
    const statusStyle = getStatusColor(log.approvalStatus);
    
    return (
      <TouchableOpacity
        key={log.id}
        style={[styles.logCard, { backgroundColor: theme.card }]}
        onPress={() => {
          console.log('Time Log ID:', log.id);
          console.log('Time Log Details:', {
            id: log.id,
            entryTime: log.entryTime,
            status: log.approvalStatus,
            address: log.address,
            photosCount: log.photos.length
          });
          navigation.navigate('ATTimeLogDetails', {
            timeLogId: log.id,
            employeeId,
            baseUrl,
            photos: log.photos
          });
        }}
      >
        <View style={styles.logHeader}>
          <View style={styles.timeContainer}>
            <Image
              source={require('../../../../asset/img/icon/shijian.png')}
              style={[styles.icon, { tintColor: theme.primary }]}
            />
            <Text style={[styles.timeText, { color: theme.text }]}>
              {formatDate(log.entryTime)}
            </Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusStyle.backgroundColor }]}>
            <Text style={[styles.statusText, { color: statusStyle.textColor }]}>
              {log.approvalStatus === 'A' ? getLocalizedText('approved') 
                : log.approvalStatus === 'R' ? getLocalizedText('rejected')
                : getLocalizedText('pending')}
            </Text>
          </View>
        </View>

        <View style={styles.locationContainer}>
          <Image
            source={require('../../../../asset/img/icon/a-map-location.png')}
            style={[styles.icon, { tintColor: theme.primary }]}
          />
          <Text style={[styles.locationText, { color: theme.text }]} numberOfLines={1}>
            {log.address || '--'}
          </Text>
        </View>

        <View style={styles.photosContainer}>
          <Image
            source={require('../../../../asset/img/icon/camera.png')}
            style={[styles.icon, { tintColor: theme.primary }]}
          />
          <Text style={[styles.photosText, { color: theme.text }]}>
            {log.photos.length > 0 ? `${log.photos.length} ${getLocalizedText('photos')}` : '--'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {renderDateSelector()}
      
      <ScrollView style={styles.scrollView}>
        {isLoading ? (
          <View style={styles.messageContainer}>
            <Text style={[styles.messageText, { color: theme.text }]}>
              {getLocalizedText('loading')}
            </Text>
          </View>
        ) : timeLogs.length > 0 ? (
          timeLogs.map(renderTimeLogItem)
        ) : (
          <View style={styles.messageContainer}>
            <Text style={[styles.messageText, { color: theme.text }]}>
              {`${getLocalizedText('noRecords')} ${year}/${month}`}
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
    padding: 16,
  },
  selectorCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
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
  scrollView: {
    flex: 1,
  },
  logCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  locationText: {
    fontSize: 14,
    flex: 1,
  },
  photosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  photosText: {
    fontSize: 14,
  },
  icon: {
    width: 20,
    height: 20,
  },
  messageContainer: {
    padding: 20,
    alignItems: 'center',
  },
  messageText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ATTimeLogListing;
