import React, { useState, useEffect, useCallback, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ScrollView, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../setting/ThemeContext';
import { useLanguage } from '../setting/LanguageContext';
import { Swipeable } from 'react-native-gesture-handler';

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
  approve: string;
  reject: string;
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
          approve: 'Lulus',
          reject: 'Tolak'
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
          approve: '批准',
          reject: '拒绝'
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
          approve: '批准',
          reject: '拒絕'
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
          approve: 'Approve',
          reject: 'Reject'
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

  const renderRightActions = (leave: PendingLeave) => {
    const handleReject = () => {
      navigation.navigate('ApproveLeaveDetail', { 
        leaveDetail: {
          ...leave,
          actionType: 'REJECT'
        }
      });
    };

    return (
      <View style={styles.rightActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.rejectButton]}
          onPress={handleReject}
        >
          <Image
            source={require('../../../../asset/img/icon/a-close.png')}
            style={[styles.actionIcon, styles.rejectIcon]}
          />
          <Text style={[styles.actionButtonText, styles.rejectButtonText]}>
            {getLocalizedText('reject')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderLeftActions = (leave: PendingLeave) => {
    const handleApprove = () => {
      navigation.navigate('ApproveLeaveDetail', { 
        leaveDetail: {
          ...leave,
          actionType: 'APPROVE'
        }
      });
    };

    return (
      <View style={styles.leftActions}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.approveButton]}
          onPress={handleApprove}
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
    );
  };

  const renderLeaveItem = (leave: PendingLeave, index: number) => {
    return (
      <Swipeable
        key={leave.approvalActionId || index}
        renderRightActions={() => renderRightActions(leave)}
        renderLeftActions={() => renderLeftActions(leave)}
        rightThreshold={40}
        leftThreshold={40}
        overshootRight={false}
        overshootLeft={false}
        friction={2}
      >
        <TouchableOpacity 
          style={[styles.leaveCard, { backgroundColor: theme.card }]} 
          onPress={() => handleLeaveClick(leave)}
        >
          <View style={styles.cardContainer}>
            <View style={styles.leaveContent}>
              <Text style={[styles.leaveType, { color: theme.text }]} numberOfLines={1}>
                {leave.leaveDescription}
              </Text>

              <Text style={[styles.dateText, { color: theme.subText }]}>
                {formatDate(leave.dateFrom)} - {formatDate(leave.dateTo)}
                {leave.totalDay && ` (${leave.totalDay} ${
                  leave.totalDay > 1 ? getLocalizedText('days') : getLocalizedText('day')
                })`}
              </Text>
            </View>

            <View style={[styles.employeeInfo, { 
              backgroundColor: theme.primary + '20',
              borderColor: theme.primary + '40'
            }]}>
              <Text style={[styles.employeeNo, { color: theme.text }]}>
                {leave.employeeNo}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Swipeable>
    );
  };

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
            pendingLeaves.map((leave: PendingLeave, index) => 
              renderLeaveItem(leave, index)
            )
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
    paddingHorizontal: 0,
  },
  leaveList: {
    paddingTop: 8,
  },
  leaveCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 8,
    borderRadius: 12,
    elevation: 2,
    marginHorizontal: 16,
    height: 90,
  },
  cardContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leaveContent: {
    flex: 1,
    marginRight: 12,
  },
  leaveType: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    width: '100%',
  },
  dateText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  employeeInfo: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  employeeNo: {
    fontSize: 14,
    fontWeight: '500',
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
  leftActions: {
    flexDirection: 'row',
    height: 90,
    marginLeft: 16,
  },
  rightActions: {
    flexDirection: 'row',
    height: 90,
    marginRight: 16,
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 90,
    height: '100%',
  },
  approveButton: {
    backgroundColor: '#34C759',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  actionIcon: {
    width: 24,
    height: 24,
    marginBottom: 4,
  },
  approveIcon: {
    tintColor: '#FFFFFF',
  },
  rejectIcon: {
    tintColor: '#FFFFFF',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  approveButtonText: {
    color: '#FFFFFF',
  },
  rejectButtonText: {
    color: '#FFFFFF',
  },
});

export default ApproveLeaveApplicationListing;
