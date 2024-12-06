import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
  ActivityIndicator,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface LeaveDate {
  date: string;
  sessionId: number;
  session: string;
}

interface LeaveDetail {
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

const ApproveLeaveDetail = ({ route, navigation }: any) => {
  const { leaveDetail: initialLeaveDetail } = route.params;
  const [leaveDetail, setLeaveDetail] = useState<LeaveDetail>(initialLeaveDetail);
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [baseUrl, setBaseUrl] = useState<string>('');

  useEffect(() => {
    const initializeData = async () => {
      const storedBaseUrl = await AsyncStorage.getItem('baseUrl');
      if (storedBaseUrl) {
        setBaseUrl(storedBaseUrl);
      } else {
        Alert.alert('Error', 'Base URL is missing');
      }
    };
    initializeData();
  }, []);

  const handleApprovalAction = async (action: 'approve' | 'reject') => {
    if (!remarks.trim() && action === 'reject') {
      Alert.alert('Error', 'Please provide remarks for rejection');
      return;
    }

    const confirmationMessage = action === 'approve' 
      ? 'Are you sure you want to approve this leave application?'
      : 'Are you sure you want to reject this leave application?';

    Alert.alert(
      'Confirm Action',
      confirmationMessage,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => submitApprovalAction(action) }
      ]
    );
  };

  const submitApprovalAction = async (action: 'approve' | 'reject') => {
    setIsSubmitting(true);
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) {
        Alert.alert('Error', 'User token is missing');
        return;
      }

      const url = `${baseUrl}/apps/api/v1/leaves/approvals/pending-applications/${leaveDetail.applicationId}/${action}/${leaveDetail.approvalActionId}`;
      
      const requestBody = action === 'reject' 
        ? { reason: remarks.trim() }  // For reject: use "reason" as the key
        : { remarks: remarks.trim() }; // For approve: use "remarks" as the key

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert(
          'Success',
          `Leave application ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } else {
        Alert.alert('Error', data.message || `Failed to ${action} leave application`);
      }
    } catch (error) {
      Alert.alert('Error', `An error occurred while ${action}ing the leave application`);
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  if (!leaveDetail) {
    return (
      <View style={styles.messageContainer}>
        <Text style={styles.messageText}>Leave detail not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView>
        {/* Employee Information Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Employee Information</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Employee No:</Text>
              <Text style={styles.value}>{leaveDetail.employeeNo}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name:</Text>
              <Text style={styles.value}>{leaveDetail.employeeName}</Text>
            </View>
          </View>
        </View>

        {/* Leave Details Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Leave Details</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Leave Type:</Text>
              <Text style={styles.value}>{leaveDetail.leaveDescription}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Duration:</Text>
              <Text style={styles.value}>
                {formatDate(leaveDetail.dateFrom)} - {formatDate(leaveDetail.dateTo)}
                {'\n'}({leaveDetail.totalDay} {leaveDetail.totalDay > 1 ? 'days' : 'day'})
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Leave Sessions:</Text>
              {leaveDetail.leaveDateList.map((leaveDate, index) => (
                <Text key={index} style={styles.value}>
                  {formatDate(leaveDate.date)} - {leaveDate.session}
                </Text>
              ))}
            </View>
            {leaveDetail.reason && (
              <View style={styles.infoRow}>
                <Text style={styles.label}>Reason:</Text>
                <Text style={styles.value}>{leaveDetail.reason}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Remarks Input */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Approval Remarks</Text>
          </View>
          <View style={styles.cardContent}>
            <TextInput
              style={styles.remarksInput}
              placeholder="Enter remarks (required for rejection)"
              value={remarks}
              onChangeText={setRemarks}
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.rejectButton]}
            onPress={() => handleApprovalAction('reject')}
            disabled={isSubmitting}
          >
            <Image
              source={require('../../../../asset/img/icon/a-close.png')}
              style={[styles.actionIcon, styles.rejectIcon]}
            />
            <Text style={[styles.actionButtonText, styles.rejectButtonText]}>
              Reject
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.approveButton]}
            onPress={() => handleApprovalAction('approve')}
            disabled={isSubmitting}
          >
            <Image
              source={require('../../../../asset/img/icon/a-check.png')}
              style={[styles.actionIcon, styles.approveIcon]}
            />
            <Text style={[styles.actionButtonText, styles.approveButtonText]}>
              Approve
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {isSubmitting && (
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  remarksInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'top',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  approveButton: {
    backgroundColor: '#34C759',
  },
  rejectButton: {
    backgroundColor: '#FF3B30',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  approveButtonText: {
    color: '#FFFFFF',
  },
  rejectButtonText: {
    color: '#FFFFFF',
  },
  actionIcon: {
    width: 20,
    height: 20,
  },
  approveIcon: {
    tintColor: '#FFFFFF',
  },
  rejectIcon: {
    tintColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  messageText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ApproveLeaveDetail;
