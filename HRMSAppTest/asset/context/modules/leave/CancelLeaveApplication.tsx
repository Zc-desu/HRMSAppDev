import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from '../setting/CustomAlert';
import { useTheme } from '../setting/ThemeContext';

interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface Theme {
  primary: string;
  background: string;
  card: string;
  text: string;
  subText: string;
  border: string;
  success: string;
  error: string;
  warning: string;
  buttonBackground: string;
  buttonText: string;
  shadowColor: string;
  headerBackground: string;
  divider: string;
  headerText: string;
  statusBarStyle: string;
  isDark?: boolean;
}

const CancelLeaveApplication = ({ route, navigation }: any) => {
  const { theme } = useTheme() as { theme: Theme };
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

  useLayoutEffect(() => {
    navigation.setOptions({
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
  }, [navigation, theme]);

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
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!leaveDetail) {
    return (
      <View style={[styles.messageContainer, { backgroundColor: theme.background }]}>
        <Text style={[styles.messageText, { color: theme.subText }]}>
          Leave details not found.
        </Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.contentContainer}>
          <View style={[styles.warningCard, {
            backgroundColor: theme.isDark 
              ? 'rgba(255, 69, 58, 0.1)' 
              : 'rgba(255, 59, 48, 0.1)',
            borderColor: theme.isDark 
              ? 'rgba(255, 69, 58, 0.2)' 
              : 'rgba(255, 59, 48, 0.2)',
            borderWidth: 1,
          }]}>
            <Text style={[styles.warningTitle, { 
              color: theme.isDark ? '#FF453A' : '#FF3B30' 
            }]}>
              Cancel Leave Application
            </Text>
            <Text style={[styles.warningText, { 
              color: theme.isDark ? '#FF453A' : '#FF3B30' 
            }]}>
              Are you sure you want to cancel this leave application?
            </Text>
          </View>

          <View style={[styles.detailsCard, { 
            backgroundColor: theme.card,
            borderColor: theme.border,
            borderWidth: 1,
          }]}>
            <DetailItem 
              label="Leave Type" 
              value={leaveDetail.leaveCodeDesc}
              theme={theme}
            />
            <DetailItem 
              label="Status" 
              value={leaveDetail.approvalStatusDisplay}
              theme={theme}
            />
            <DetailItem 
              label="Applied On" 
              value={formatDate(leaveDetail.createdDate)}
              theme={theme}
            />
            <DetailItem 
              label="Start Date" 
              value={formatDate(leaveDetail.dateFrom)}
              theme={theme}
            />
            <DetailItem 
              label="End Date" 
              value={formatDate(leaveDetail.dateTo)}
              theme={theme}
            />
            <DetailItem 
              label="Duration" 
              value={`${leaveDetail.totalDays} day(s)`}
              theme={theme}
            />
            <DetailItem 
              label="Reason" 
              value={leaveDetail.reason || '--'}
              theme={theme}
            />
            <DetailItem 
              label="Backup Person" 
              value={leaveDetail.backupPersonEmployeeName || '--'}
              theme={theme}
            />
          </View>

          <View style={[styles.inputCard, { 
            backgroundColor: theme.card,
            borderColor: theme.border,
            borderWidth: 1,
          }]}>
            <Text style={[styles.inputLabel, { color: theme.text }]}>
              Cancellation Reason
            </Text>
            <TextInput
              style={[styles.input, {
                backgroundColor: theme.isDark ? '#2C2C2E' : '#F2F2F7',
                borderColor: theme.border,
                color: theme.text,
              }]}
              placeholderTextColor={theme.subText}
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
              style={[styles.cancelButton, { 
                backgroundColor: theme.error,
              }]}
              onPress={handleCancelPress}
            >
              <Text style={[styles.cancelButtonText, { color: '#FFFFFF' }]}>
                Confirm Cancellation
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.backButton, { 
                backgroundColor: theme.isDark ? '#3A3A3C' : '#E5E5EA',
              }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={[styles.backButtonText, { 
                color: theme.isDark ? '#FFFFFF' : '#000000' 
              }]}>
                Go Back
              </Text>
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

const DetailItem = ({ label, value, theme }: { label: string; value: string; theme: Theme }) => (
  <View style={styles.detailRow}>
    <Text style={[styles.detailLabel, { color: theme.subText }]}>{label}</Text>
    <Text style={[styles.detailValue, { color: theme.text }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  warningCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  warningText: {
    fontSize: 14,
    lineHeight: 20,
  },
  detailsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  inputCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
  },
  buttonContainer: {
    gap: 12,
  },
  cancelButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  backButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
    fontWeight: '500',
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
    textAlign: 'center',
  },
});

export default CancelLeaveApplication;