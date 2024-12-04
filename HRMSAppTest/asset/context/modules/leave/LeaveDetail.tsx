import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LeaveDetail = ({ route, navigation }: any) => {
  const { applicationId } = route.params;
  const [leaveDetail, setLeaveDetail] = useState<any>(null);
  const [approvalDetails, setApprovalDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaveDetails = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const baseUrl = await AsyncStorage.getItem('baseUrl');
        const employeeId = await AsyncStorage.getItem('employeeId');
        if (token && baseUrl && employeeId) {
          const leaveUrl = `${baseUrl}/apps/api/v1/employees/${employeeId}/leaves/${applicationId}`;
          const leaveResponse = await fetch(leaveUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          const leaveData = await leaveResponse.json();
          if (leaveData.success) {
            setLeaveDetail(leaveData.data);
            await AsyncStorage.setItem('leaveDetail', JSON.stringify(leaveData.data)); // Save leave details
            const approvalAction = leaveData.data.approvalStatus;
            const approvalUrl = `${baseUrl}/apps/api/v1/employees/${employeeId}/leaves/${applicationId}/approval-status?ApprovalAction=${approvalAction}`;
            const approvalResponse = await fetch(approvalUrl, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
            });
            const approvalData = await approvalResponse.json();
            if (approvalData.success) {
              setApprovalDetails(approvalData.data);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching leave details or approval status:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaveDetails();
  }, [applicationId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'green';
      case 'Cancelled':
        return 'red';
      case 'Pending':
      case 'Pending Cancellation':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const mapApprovalDecision = (decision: string) => {
    switch (decision) {
      case 'A':
        return 'Approved';
      case 'R':
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString: string) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' } as const;
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleCancelLeave = () => {
    navigation.navigate('CancelLeaveApplication', { applicationId });
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
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.row}>
          <Text style={styles.title}>{leaveDetail.leaveCodeDesc}</Text>
          <View style={[styles.statusBox, { backgroundColor: getStatusColor(leaveDetail.approvalStatusDisplay) }]}>
            <Text style={styles.statusText}>{leaveDetail.approvalStatusDisplay}</Text>
          </View>
        </View>
        <Text style={styles.detailText}>Applied On: {formatDate(leaveDetail.createdDate)}</Text>
        <Text style={styles.detailText}>Start Date: {formatDate(leaveDetail.dateFrom)}</Text>
        <Text style={styles.detailText}>End Date: {formatDate(leaveDetail.dateTo)}</Text>
        <Text style={styles.detailText}>Reason: {leaveDetail.reason || '--'}</Text>
        <Text style={styles.detailText}>Backup Person: {leaveDetail.backupPersonEmployeeName || '--'}</Text>
        <Text style={styles.subTitle}>Approval Details:</Text>
        {approvalDetails && approvalDetails.length > 0 ? (
          approvalDetails.map((approval: any, index: number) => (
            <View key={index} style={styles.approvalRow}>
              <Text style={styles.approvalText}>Approver: {approval.approval}</Text>
              <Text style={styles.approvalText}>Decision: {mapApprovalDecision(approval.approvalDecision)}</Text>
              <Text style={styles.approvalText}>Respond Date: {formatDate(approval.respondDate)}</Text>
              <Text style={styles.approvalText}>Reason: {approval.reason || '--'}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noApprovalText}>No approval details available.</Text>
        )}
      </ScrollView>
      {(leaveDetail.approvalStatusDisplay === 'Approved' || leaveDetail.approvalStatusDisplay === 'Pending') && (
        <View style={styles.cancelLeaveButton}>
          <Button title="Cancel Leave" onPress={handleCancelLeave} color="red" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    paddingBottom: 100, // Add some padding to avoid content being hidden behind the button
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
  detailText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 12,
  },
  approvalRow: {
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  approvalText: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  noApprovalText: {
    fontSize: 16,
    color: 'gray',
    marginTop: 8,
  },
  cancelLeaveButton: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
});

export default LeaveDetail;