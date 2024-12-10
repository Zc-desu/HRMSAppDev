import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../setting/ThemeContext';

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

const ApproveLeaveApplicationListing = () => {
  const { theme } = useTheme();
  const [pendingLeaves, setPendingLeaves] = useState<PendingLeave[]>([]);
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigation = useNavigation<NavigationProp<NavigationParams>>();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const storedBaseUrl = await AsyncStorage.getItem('baseUrl');
        if (!storedBaseUrl) {
          Alert.alert('Error', 'Base URL is missing');
          return;
        }
        setBaseUrl(storedBaseUrl);
        fetchPendingLeaves(storedBaseUrl);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch stored data.');
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
        Alert.alert('Error', 'User token is missing');
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
          Alert.alert('Error', 'Failed to fetch pending leaves.');
        }
      } else {
        Alert.alert('Error', 'Failed to fetch pending leaves.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch pending leaves.');
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

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.headerCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.title, { color: theme.text }]}>Pending Approvals</Text>
      </View>

      <View style={styles.contentContainer}>
        <ScrollView contentContainerStyle={styles.leaveList}>
          {isLoading ? (
            <View style={styles.messageContainer}>
              <Text style={[styles.messageText, { color: theme.subText }]}>
                Loading pending approvals...
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
                  <View style={styles.employeeInfo}>
                    <Text style={[styles.employeeNo, { color: theme.subText }]}>
                      {leave.employeeNo}
                    </Text>
                  </View>
                </View>

                <View style={styles.leaveDates}>
                  <Text style={[styles.dateText, { color: theme.text }]}>
                    {formatDate(leave.dateFrom)} - {formatDate(leave.dateTo)}
                    ({leave.totalDay} {leave.totalDay > 1 ? 'days' : 'day'})
                  </Text>
                </View>

                {leave.reason && (
                  <View style={styles.reasonContainer}>
                    <Text style={[styles.reasonLabel, { color: theme.subText }]}>
                      Reason:
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
                No pending approvals found.
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
    marginBottom: 8,
  },
  leaveType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  employeeInfo: {
    backgroundColor: '#E5E5EA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  employeeNo: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
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
