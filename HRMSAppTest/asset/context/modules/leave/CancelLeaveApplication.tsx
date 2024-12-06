import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../setting/CustomAlert';

interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

const CancelLeaveApplication = ({ route, navigation }: any) => {
  const { applicationId } = route.params;
  const [loading, setLoading] = useState(false);
  const [reason, setReason] = useState('');
  const [leaveDetail, setLeaveDetail] = useState<any>(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message: string;
    buttons: AlertButton[];
  }>({
    title: '',
    message: '',
    buttons: [],
  });

  useEffect(() => {
    const getLeaveDetail = async () => {
      const detail = await AsyncStorage.getItem('leaveDetail');
      if (detail) {
        setLeaveDetail(JSON.parse(detail));
      }
    };
    getLeaveDetail();
  }, []);

  const formatDate = (dateString: string) => {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const date = new Date(dateString);
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
  };

  const showCustomAlert = (title: string, message: string, buttons: AlertButton[] = []) => {
    setAlertConfig({
      title,
      message,
      buttons: buttons.map(btn => ({
        ...btn,
        onPress: () => {
          setAlertVisible(false);
          btn.onPress?.();
        },
      })),
    });
    setAlertVisible(true);
  };

  const cancelLeave = async () => {
    if (!reason.trim()) {
      showCustomAlert(
        'Required',
        'Please provide a reason for cancellation.',
        [{ 
          text: 'OK',
          style: 'default'
        }]
      );
      return;
    }

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
          body: JSON.stringify({ reason: reason }),
        });
        
        const data = await response.json();
        if (data.success) {
          showCustomAlert(
            'Success',
            'Leave has been cancelled successfully.',
            [{ 
              text: 'OK',
              style: 'default',
              onPress: () => navigation.goBack()
            }]
          );
        } else {
          showCustomAlert(
            'Error',
            data.message || 'Failed to cancel the leave.',
            [{ 
              text: 'OK',
              style: 'default'
            }]
          );
        }
      }
    } catch (error) {
      showCustomAlert(
        'Error',
        'An error occurred while cancelling the leave.',
        [{ 
          text: 'OK',
          style: 'default'
        }]
      );
      console.error('Cancel Leave Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPress = () => {
    showCustomAlert(
      'Confirm Cancellation',
      'Are you sure you want to cancel this leave application?',
      [
        {
          text: 'No',
          style: 'cancel'
        },
        {
          text: 'Yes',
          style: 'destructive',
          onPress: cancelLeave
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!leaveDetail) {
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>Leave details not found.</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container}>
        <View style={styles.contentContainer}>
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>Cancel Leave Application</Text>
            <Text style={styles.warningText}>
              Are you sure you want to cancel this leave application?
            </Text>
          </View>

          <View style={styles.detailsCard}>
            <DetailItem label="Leave Type" value={leaveDetail.leaveCodeDesc} />
            <DetailItem label="Status" value={leaveDetail.approvalStatusDisplay} />
            <DetailItem label="Applied On" value={formatDate(leaveDetail.createdDate)} />
            <DetailItem label="Start Date" value={formatDate(leaveDetail.dateFrom)} />
            <DetailItem label="End Date" value={formatDate(leaveDetail.dateTo)} />
            <DetailItem label="Duration" value={`${leaveDetail.totalDays} day(s)`} />
            <DetailItem label="Reason" value={leaveDetail.reason || '--'} />
            <DetailItem label="Backup Person" value={leaveDetail.backupPersonEmployeeName || '--'} />
          </View>

          <View style={styles.inputCard}>
            <Text style={styles.inputLabel}>Cancellation Reason</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your reason for cancellation"
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={handleCancelPress}
            >
              <Text style={styles.cancelButtonText}>Confirm Cancellation</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <CustomAlert
        visible={alertVisible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onDismiss={() => setAlertVisible(false)}
      />
    </>
  );
};

const DetailItem = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    padding: 16,
  },
  warningCard: {
    backgroundColor: '#FFF3F3',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFE5E5',
  },
  warningTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FF3B30',
    marginBottom: 8,
    textAlign: 'center',
  },
  warningText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  detailsCard: {
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
  inputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FAFAFA',
    minHeight: 100,
  },
  buttonContainer: {
    gap: 12,
    marginBottom: 24,
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  backButton: {
    backgroundColor: '#E5E5E5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#333',
    fontSize: 18,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    flex: 1,
    textAlign: 'right',
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  messageText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default CancelLeaveApplication;