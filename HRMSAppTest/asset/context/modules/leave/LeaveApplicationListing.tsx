import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, NavigationProp, useFocusEffect } from '@react-navigation/native';

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

const LeaveApplicationListing = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [leaveData, setLeaveData] = useState<Leave[]>([]);
  const [baseUrl, setBaseUrl] = useState<string>('');
  const [employeeId, setEmployeeId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const navigation = useNavigation<NavigationProp<NavigationParams>>(); // Initialize navigation

  useEffect(() => {
    const fetchData = async () => {
      try {
        const storedBaseUrl = await AsyncStorage.getItem('baseUrl');
        const storedEmployeeId = await AsyncStorage.getItem('employeeId');
        if (!storedBaseUrl || !storedEmployeeId) {
          Alert.alert('Error', 'Base URL or Employee ID is missing');
          return;
        }
        setBaseUrl(storedBaseUrl);
        setEmployeeId(storedEmployeeId);
        fetchLeaveData(storedBaseUrl, storedEmployeeId, year);
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch stored data.');
      }
    };
    fetchData();
  }, []);

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
        Alert.alert('Error', 'User token is missing');
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
          Alert.alert('Error', 'Failed to fetch leave data.');
        }
      } else {
        Alert.alert('Error', 'Failed to fetch leave data.');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch leave data.');
    } finally {
      setIsLoading(false);
    }
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
    switch (status) {
      case 'Approved':
        return '#34C759'; // iOS green
      case 'Cancelled':
        return '#FF3B30'; // iOS red
      case 'Pending':
        return '#FF9500'; // iOS orange
      case 'PendingCancellation':
        return '#FF9500'; // iOS orange
      default:
        return '#8E8E93'; // iOS gray
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.title}>Leave Applications</Text>
        <View style={styles.yearSelector}>
          <TouchableOpacity onPress={decrementYear} style={styles.yearButton}>
            <Image source={require('../../../../asset/img/icon/a-d-arrow-left.png')} style={styles.arrowIcon} />
          </TouchableOpacity>
          <Text style={styles.yearText}>{year}</Text>
          <TouchableOpacity onPress={incrementYear} style={styles.yearButton}>
            <Image source={require('../../../../asset/img/icon/a-d-arrow-right.png')} style={styles.arrowIcon} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.contentContainer}>
        <ScrollView contentContainerStyle={styles.leaveList}>
          {isLoading ? (
            <View style={styles.messageContainer}>
              <Text style={styles.messageText}>Loading leave data...</Text>
            </View>
          ) : leaveData.length > 0 ? (
            leaveData.map((leave: Leave, index) => {
              const fromDate = formatDate(leave.dateFrom);
              const toDate = formatDate(leave.dateTo);
              const displayStatus = leave.approvalStatusDisplay === 'PendingCancellation' 
                ? 'Pending\nCancellation' 
                : leave.approvalStatusDisplay;
              
              return (
                <TouchableOpacity 
                  key={index} 
                  style={styles.leaveCard} 
                  onPress={() => handleLeaveClick(leave)}
                >
                  <View style={styles.leaveHeader}>
                    <Text style={styles.leaveType}>{leave.leaveCodeDesc}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(leave.approvalStatusDisplay) }]}>
                      <Text style={styles.statusText}>{displayStatus}</Text>
                    </View>
                  </View>
                  <View style={styles.leaveDates}>
                    <Text style={styles.dateLabel}>Duration:</Text>
                    <Text style={styles.dateText}>{fromDate} - {toDate}</Text>
                    <Text style={styles.daysText}>({leave.totalDays} {leave.totalDays > 1 ? 'days' : 'day'})</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          ) : (
            <View style={styles.messageContainer}>
              <Text style={styles.messageText}>No leave applications found for {year}.</Text>
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
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
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
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
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