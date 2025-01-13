import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../setting/ThemeContext';
import { useLanguage } from '../setting/LanguageContext';

const LeaveDetail = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const { applicationId } = route.params;
  const [leaveDetail, setLeaveDetail] = useState<any>(null);
  const [approvalDetails, setApprovalDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

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
      title: language === 'zh-Hans' ? '请假详情' :
             language === 'zh-Hant' ? '請假詳情' :
             language === 'ms' ? 'Butiran Cuti' :
             'Leave Detail',
    });
  }, [navigation, theme, language]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return '#34C759';  // Bright green
      case 'Rejected':
        return '#FF453A';  // Bright red
      case 'Cancelled':
        return '#FF9500';  // Orange
      case 'Pending':
      case 'PendingCancellation':
        return '#FFD60A';  // Yellow
      default:
        return theme.subText;
    }
  };

  const mapApprovalDecision = (decision: string) => {
    switch (decision) {
      case 'A':
        return 'Approved';
      case 'P':
        return 'Pending';
      case 'C':
        return 'Pending Cancellation';
      case 'L':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

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

  const handleCancelLeave = () => {
    navigation.navigate('CancelLeaveApplication', { applicationId });
  };

  const getSessionIcon = (session: string) => {
    switch (session) {
      case 'Full':
        return require('../../../../asset/img/icon/full.png');
      case 'First Half':
        return require('../../../../asset/img/icon/first-half.png');
      case 'Second Half':
        return require('../../../../asset/img/icon/second-half.png');
      default:
        return require('../../../../asset/img/icon/full.png');
    }
  };

  const renderLeaveSession = (leaveDates: any[]) => {
    return leaveDates.map((date, index) => (
      <View key={index} style={styles.sessionContainer}>
        <View style={styles.sessionRow}>
          <View style={styles.sessionInfo}>
            <Text style={styles.sessionDate}>
              {formatDate(date.date)}
            </Text>
            <View style={styles.sessionDetails}>
              <Image 
                source={getSessionIcon(date.session)}
                style={styles.sessionIcon}
              />
              <Text style={styles.sessionText}>
                {date.session} ({date.day} day)
              </Text>
            </View>
          </View>
          {date.detail && (
            <Text style={styles.sessionDetail}>{date.detail}</Text>
          )}
        </View>
      </View>
    ));
  };

  const getLocalizedText = (key: string) => {
    switch (language) {
      case 'ms':
        return {
          leaveDetails: 'Butiran Cuti',
          appliedOn: 'Tarikh Permohonan',
          department: 'Jabatan',
          position: 'Jawatan',
          totalDays: 'Jumlah Hari',
          reason: 'Sebab',
          backupPerson: 'Orang Ganti',
          leaveSessions: 'Sesi Cuti',
          approvalDetails: 'Butiran Kelulusan',
          approver: 'Pelulus',
          decision: 'Keputusan',
          respondDate: 'Tarikh Respons',
          noSessionDetails: 'Tiada butiran sesi.',
          noApprovalDetails: 'Tiada butiran kelulusan tersedia.',
          cancelLeave: 'Batal Cuti',
          days: 'hari',
          leaveDetailsNotFound: 'Butiran cuti tidak dijumpai.',
        }[key] || key;

      case 'zh-Hans':
        return {
          leaveDetails: '请假详情',
          appliedOn: '申请日期',
          department: '部门',
          position: '职位',
          totalDays: '总天数',
          reason: '原因',
          backupPerson: '替班人',
          leaveSessions: '请假时段',
          approvalDetails: '审批详情',
          approver: '审批人',
          decision: '决定',
          respondDate: '回复日期',
          noSessionDetails: '没有时段详情。',
          noApprovalDetails: '暂无审批详情。',
          cancelLeave: '取消请假',
          days: '天',
          leaveDetailsNotFound: '未找到请假详情。',
        }[key] || key;

      case 'zh-Hant':
        return {
          leaveDetails: '請假詳情',
          appliedOn: '申請日期',
          department: '部門',
          position: '職位',
          totalDays: '總天數',
          reason: '原因',
          backupPerson: '替班人',
          leaveSessions: '請假時段',
          approvalDetails: '審批詳情',
          approver: '審批人',
          decision: '決定',
          respondDate: '回覆日期',
          noSessionDetails: '沒有時段詳情。',
          noApprovalDetails: '暫無審批詳情。',
          cancelLeave: '取消請假',
          days: '天',
          leaveDetailsNotFound: '未找到請假詳情。',
        }[key] || key;

      default: // 'en'
        return {
          leaveDetails: 'Leave Details',
          appliedOn: 'Applied On',
          department: 'Department',
          position: 'Position',
          totalDays: 'Total Days',
          reason: 'Reason',
          backupPerson: 'Backup Person',
          leaveSessions: 'Leave Sessions',
          approvalDetails: 'Approval Details',
          approver: 'Approver',
          decision: 'Decision',
          respondDate: 'Respond Date',
          noSessionDetails: 'No session details available.',
          noApprovalDetails: 'No approval details available.',
          cancelLeave: 'Cancel Leave',
          days: 'day(s)',
          leaveDetailsNotFound: 'Leave details not found.',
        }[key] || key;
    }
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
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={[styles.headerCard, { 
          backgroundColor: theme.card,
          shadowColor: theme.shadowColor,
        }]}>
          <View style={styles.row}>
            <Text style={[styles.title, { color: theme.text }]}>
              {leaveDetail.leaveCodeDesc}
            </Text>
            <View style={[styles.statusBadge, { 
              backgroundColor: getStatusColor(leaveDetail.approvalStatusDisplay)
            }]}>
              <Text style={[styles.statusText, { 
                color: leaveDetail.approvalStatusDisplay === 'Pending' || 
                       leaveDetail.approvalStatusDisplay === 'PendingCancellation' 
                       ? '#000000' : '#FFFFFF'
              }]}>
                {leaveDetail.approvalStatusDisplay}
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.detailsCard, { 
          backgroundColor: theme.card,
          shadowColor: theme.shadowColor,
        }]}>
          <DetailItem 
            label={getLocalizedText('appliedOn')} 
            value={formatDate(leaveDetail.createdDate)}
            theme={theme}
          />
          <DetailItem label={getLocalizedText('department')} value={leaveDetail.departmentDesc} theme={theme} />
          <DetailItem label={getLocalizedText('position')} value={leaveDetail.jobTitleDesc} theme={theme} />
          <DetailItem label={getLocalizedText('totalDays')} value={`${leaveDetail.totalDays} ${getLocalizedText('days')}`} theme={theme} />
          <DetailItem label={getLocalizedText('reason')} value={leaveDetail.reason || '--'} theme={theme} />
          <DetailItem label={getLocalizedText('backupPerson')} value={leaveDetail.backupPersonEmployeeName || '--'} theme={theme} />
        </View>

        <View style={[styles.sessionCard, { 
          backgroundColor: theme.card,
          shadowColor: theme.shadowColor,
        }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {getLocalizedText('leaveSessions')}
          </Text>
          {leaveDetail.leaveDates && leaveDetail.leaveDates.length > 0 ? (
            renderLeaveSession(leaveDetail.leaveDates)
          ) : (
            <Text style={[styles.messageText, { color: theme.subText }]}>
              {getLocalizedText('noSessionDetails')}
            </Text>
          )}
        </View>

        <View style={[styles.approvalCard, { 
          backgroundColor: theme.card,
          shadowColor: theme.shadowColor,
        }]}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {getLocalizedText('approvalDetails')}
          </Text>
          {approvalDetails && approvalDetails.length > 0 ? (
            approvalDetails.map((approval: any, index: number) => (
              <View key={index} style={styles.approvalItem}>
                <DetailItem label="Approver" value={approval.approval} theme={theme} />
                <DetailItem label="Decision" value={mapApprovalDecision(approval.approvalDecision)} theme={theme} />
                <DetailItem label="Respond Date" value={formatDate(approval.respondDate)} theme={theme} />
                <DetailItem label="Reason" value={approval.reason || '--'} theme={theme} />
              </View>
            ))
          ) : (
            <Text style={[styles.messageText, { color: theme.subText }]}>
              {getLocalizedText('noApprovalDetails')}
            </Text>
          )}
        </View>
      </ScrollView>

      {(leaveDetail.approvalStatusDisplay === 'Approved' || 
        leaveDetail.approvalStatusDisplay === 'Pending' ||
        leaveDetail.approvalStatusDisplay === 'PendingCancellation') && (
        <View style={[styles.buttonContainer, { 
          backgroundColor: theme.background,
          borderTopColor: theme.border,
        }]}>
          <TouchableOpacity 
            style={[styles.cancelButton, { backgroundColor: theme.error }]}
            onPress={handleCancelLeave}
          >
            <Text style={styles.cancelButtonText}>{getLocalizedText('cancelLeave')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

// Update DetailItem component to use theme
const DetailItem = ({ label, value, theme }: { label: string; value: string; theme: any }) => (
  <View style={[styles.detailRow, { borderBottomColor: theme.border }]}>
    <Text style={[styles.detailLabel, { color: theme.subText }]}>{label}</Text>
    <Text style={[styles.detailValue, { color: theme.text }]}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 100,
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
  approvalCard: {
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  statusText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
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
  approvalItem: {
    marginBottom: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#F5F5F5',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
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
  sessionCard: {
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
  sessionContainer: {
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 12,
  },
  sessionRow: {
    flexDirection: 'column',
    gap: 8,
  },
  sessionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionDate: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  sessionDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sessionIcon: {
    width: 24,
    height: 24,
    tintColor: '#007AFF',
  },
  sessionText: {
    fontSize: 16,
    color: '#666',
  },
  sessionDetail: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 4,
  },
});

export default LeaveDetail;