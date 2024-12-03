import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LeaveDetail = ({ route }: any) => {
    const { applicationId } = route.params;
    const [leaveDetail, setLeaveDetail] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeaveDetail = async () => {
            try {
                const token = await AsyncStorage.getItem('userToken');
                const baseUrl = await AsyncStorage.getItem('baseUrl');
                const employeeId = await AsyncStorage.getItem('employeeId'); // Fetch employeeId

                if (token && baseUrl && employeeId) {
                    const url = `${baseUrl}/apps/api/v1/employees/${employeeId}/leaves/${applicationId}`;
                    const response = await fetch(url, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    });
                    const data = await response.json();
                    if (data.success) {
                        setLeaveDetail(data.data);
                    } else {
                        console.error('Failed to fetch leave details:', data.message);
                    }
                }
            } catch (error) {
                console.error('Error fetching leave details:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaveDetail();
    }, [applicationId]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Approved':
                return 'green';
            case 'Cancelled':
                return 'red';
            case 'Pending':
                return 'orange';
            case 'PendingCancellation': // Add a case for PendingCancellation
                return 'orange';
            default:
                return 'gray'; // Default for unknown statuses
        }
    };

    const getFormattedStatus = (status: string) => {
        if (status === 'PendingCancellation') {
            return 'Pending Cancellation'; // Format the text for PendingCancellation
        }
        return status; // Return other statuses as is
    };

    if (loading) {
        return <ActivityIndicator size="large" color="#0000ff" />;
    }

    if (!leaveDetail) {
        return (
            <View style={styles.container}>
                <Text>Leave details not found.</Text>
            </View>
        );
    }

    return (
      <View style={styles.container}>
      {/* Row for leaveCodeDesc and approvalStatusDisplay */}
      <View style={styles.row}>
          <Text style={styles.title}>{leaveDetail.leaveCodeDesc}</Text>
          <View
              style={[
                  styles.statusBox,
                  { backgroundColor: getStatusColor(leaveDetail.approvalStatusDisplay) },
              ]}
          >
              <Text style={styles.statusText}>{getFormattedStatus(leaveDetail.approvalStatusDisplay)}</Text>
          </View>
      </View>
      
      {/* Larger "Applied On" text */}
      <Text style={styles.appliedOnText}>
          Applied On: {new Date(leaveDetail.createdDate).toLocaleDateString()}
      </Text>
  
      {/* Other leave details */}
      <Text style={styles.detailText}>
          Start Date: {new Date(leaveDetail.dateFrom).toLocaleDateString()}
      </Text>
      <Text style={styles.detailText}>
          End Date: {new Date(leaveDetail.dateTo).toLocaleDateString()}
      </Text>
      <Text style={styles.detailText}>
          Reason: {leaveDetail.reason || '--'}
      </Text>
      <Text style={styles.detailText}>
          Backup Person: {leaveDetail.backupPersonEmployeeName || '--'}
      </Text>
      <Text style={styles.detailText}>
          Session: {leaveDetail.leaveDates?.length > 0 ? leaveDetail.leaveDates[0].session : '--'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
      flex: 1,
      padding: 16,
      backgroundColor: '#fff',
  },
  row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
  },
  title: {
      fontSize: 25,
      fontWeight: 'bold',
      flex: 1,
  },
  statusBox: {
      paddingVertical: 10,
      paddingHorizontal: 10,
      borderRadius: 8,
  },
  statusText: {
      color: '#fff',
      fontWeight: 'bold',
      fontSize: 14,
  },
  appliedOnText: {
      fontSize: 18, // Larger font size for "Applied On"
      fontWeight: '600',
      marginBottom: 12,
  },
  detailText: {
      fontSize: 16, // Default font size for details
      marginBottom: 8, // Spacing between text lines
      color: '#333', // Default text color
  },
});


export default LeaveDetail;
