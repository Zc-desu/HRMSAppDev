import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ScrollView, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../setting/ThemeContext';
import { useLanguage } from '../setting/LanguageContext';

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
}

const ApproveLeaveApplicationListing = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [pendingLeaves, setPendingLeaves] = useState<PendingLeave[]>([]);
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<NavigationProp<NavigationParams>>();

  const getLocalizedText = (key: keyof Translation): string => {
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
          Alert.alert(getLocalizedText('error'), getLocalizedText('baseUrlMissing'));
          return;
        }
        setBaseUrl(storedBaseUrl);
        fetchPendingLeaves(storedBaseUrl);
      } catch (error) {
        Alert.alert(getLocalizedText('error'), getLocalizedText('fetchError'));
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

  const fetchPendingLeaves = async (urlBase: string) => {
    try {
      setIsLoading(true);
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        Alert.alert(getLocalizedText('error'), getLocalizedText('tokenMissing'));
        return;
      }

      const url = `${urlBase}/apps/api/v1/leaves/approvals/pending-applications`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Sort by created date in descending order
          const sortedData = data.data.sort((a: PendingLeave, b: PendingLeave) => {
            return new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime();
          });
          setPendingLeaves(sortedData);
        } else {
          Alert.alert(getLocalizedText('error'), getLocalizedText('failedToFetch'));
        }
      } else {
        Alert.alert(getLocalizedText('error'), getLocalizedText('failedToFetch'));
      }
    } catch (error) {
      Alert.alert(getLocalizedText('error'), getLocalizedText('failedToFetch'));
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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.headerCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.title, { color: theme.text }]}>
          {getLocalizedText('pendingApprovals')}
        </Text>
      </View>

      <View style={styles.contentContainer}>
        <ScrollView 
          contentContainerStyle={styles.leaveList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
              colors={[theme.primary]}
              progressBackgroundColor={theme.card}
              progressViewOffset={20}
            />
          }
        >
          {isLoading && !refreshing ? (
            <View style={styles.messageContainer}>
              <Text style={[styles.messageText, { color: theme.subText }]}>
                {getLocalizedText('loading')}
              </Text>
            </View>
          ) : pendingLeaves.length > 0 ? (
            pendingLeaves.map((leave: PendingLeave, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.leaveCard, { backgroundColor: theme.card }]} 
                onPress={() => handleLeaveClick(leave)}
              >
                <View style={styles.leaveHeader}>
                  <Text style={[styles.leaveType, { color: theme.text }]}>
                    {leave.leaveDescription}
                  </Text>
                  <View style={[styles.employeeInfo, { 
                    backgroundColor: theme.primary + '20',
                    borderWidth: 1,
                    borderColor: theme.primary + '40'
                  }]}>
                    <Text style={[styles.employeeNo, { 
                      color: theme.text,
                      fontWeight: '600'
                    }]}>
                      {leave.employeeNo}
                    </Text>
                  </View>
                </View>

                <View style={styles.leaveDates}>
                  <Text style={[styles.dateText, { color: theme.text }]}>
                    {formatDate(leave.dateFrom)} - {formatDate(leave.dateTo)}
                    ({leave.totalDay} {leave.totalDay > 1 ? 
                      getLocalizedText('days') : 
                      getLocalizedText('day')})
                  </Text>
                </View>

                {leave.reason && (
                  <View style={styles.reasonContainer}>
                    <Text style={[styles.reasonLabel, { color: theme.subText }]}>
                      {getLocalizedText('reason')}
                    </Text>
                    <Text style={[styles.reasonText, { color: theme.text }]}>
                      {leave.reason}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.messageContainer}>
              <Text style={[styles.messageText, { color: theme.subText }]}>
                {getLocalizedText('noApprovals')}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
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
    color: '#333',
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
  },
  leaveList: {
    padding: 16,
    flexGrow: 1,
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
    marginBottom: 8,
  },
  leaveType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  employeeInfo: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  employeeNo: {
    fontSize: 14,
  },
  employeeName: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  leaveDates: {
    flexDirection: 'column',
    gap: 4,
    marginBottom: 12,
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
  reasonContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    paddingTop: 12,
    marginTop: 8,
  },
  reasonLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    color: '#333',
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
});

export default ApproveLeaveApplicationListing;
