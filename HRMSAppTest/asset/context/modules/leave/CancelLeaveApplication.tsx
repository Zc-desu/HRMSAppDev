import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, Button, TextInput, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CancelLeaveApplication = ({ route, navigation }: any) => {
  const { applicationId } = route.params;
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [leaveDetail, setLeaveDetail] = useState<any>(null);

  useEffect(() => {
    const getLeaveDetail = async () => {
      const detail = await AsyncStorage.getItem('leaveDetail');
      if (detail) {
        setLeaveDetail(JSON.parse(detail));
      }
    };
    getLeaveDetail();
  }, []);

  const cancelLeave = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('userToken');
      const baseUrl = await AsyncStorage.getItem('baseUrl');
      const employeeId = await AsyncStorage.getItem('employeeId');
      if (token && baseUrl && employeeId) {
        const url = `${baseUrl}/apps/api/v1/employees/${employeeId}/leaves/${applicationId}/cancel`;
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ reason: reason || 'No reason provided' }), // Include the request body
        });
        const data = await response.json();
        console.log("Employee ID: ", employeeId);
        console.log("Application ID: ", applicationId);
        console.log("Data: ", data);
        if (data.success) {
          Alert.alert('Success', 'Leave has been cancelled successfully.', [
            { text: 'OK', onPress: () => navigation.goBack() },
          ]);
        } else {
          Alert.alert('Error', data.message || 'Failed to cancel the leave.');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred while cancelling the leave.');
      console.error('Cancel Leave Error:', error);
    } finally {
      setLoading(false);
    }
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
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Are you sure you want to cancel this leave?</Text>
      <Text style={styles.detailText}>Leave Code: {leaveDetail.leaveCodeDesc}</Text>
      <Text style={styles.detailText}>Approval Status: {leaveDetail.approvalStatusDisplay}</Text>
      <Text style={styles.detailText}>Applied On: {new Date(leaveDetail.createdDate).toLocaleDateString()}</Text>
      <Text style={styles.detailText}>Start Date: {new Date(leaveDetail.dateFrom).toLocaleDateString()}</Text>
      <Text style={styles.detailText}>End Date: {new Date(leaveDetail.dateTo).toLocaleDateString()}</Text>
      <Text style={styles.detailText}>Reason: {leaveDetail.reason || '--'}</Text>
      <Text style={styles.detailText}>Backup Person: {leaveDetail.backupPersonEmployeeName || '--'}</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter cancellation reason (optional)"
        value={reason}
        onChangeText={setReason}
      />
      <View style={styles.buttonRow}>
        <View style={styles.buttonContainer}>
          <Button title="Yes, Cancel Leave" onPress={cancelLeave} color="red" />
        </View>
        <View style={styles.buttonContainer}>
          <Button title="No, Go Back" onPress={() => navigation.goBack()} />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 8,
    overflow: 'hidden',
  },
});

export default CancelLeaveApplication;