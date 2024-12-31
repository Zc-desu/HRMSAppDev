import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Image, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../setting/ThemeContext';
import { useLanguage } from '../setting/LanguageContext';
import { useNavigation } from '@react-navigation/native';

interface EmployeeData {
  name: string;
  employeeNumber: string;
  departmentDesc: string;
  jobTitleDesc: string;
  dateJoin: string;
}

interface Entitlement {
  leaveCodeDesc: string;
  leaveCode: string;
  earnedDays: number;
  takenDays: number;
  balanceDays: number;
  carryForwardDays: number;
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

interface Translation {
  leaveEntitlement: string;
  employeeInfo: string;
  employeeId: string;
  department: string;
  position: string;
  joinDate: string;
  available: string;
  taken: string;
  total: string;
  carryForward: string;
  loading: string;
  error: string;
  loginRequired: string;
  fetchError: string;
  days: string;
  day: string;
}

const LeaveEntitlementListing = () => {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null);
  const [entitlements, setEntitlements] = useState<Entitlement[]>([]);
  const [loading, setLoading] = useState(true);

  const handlePreviousYear = () => {
    setSelectedYear(prev => prev - 1);
  };

  const handleNextYear = () => {
    const currentYear = new Date().getFullYear();
    if (selectedYear < currentYear) {
      setSelectedYear(prev => prev + 1);
    }
  };

  const fetchLeaveEntitlements = async () => {
    try {
      const baseUrl = await AsyncStorage.getItem('baseUrl');
      const userToken = await AsyncStorage.getItem('userToken');
      const employeeId = await AsyncStorage.getItem('employeeId');

      if (!baseUrl || !userToken || !employeeId) {
        Alert.alert('Error', 'Missing required information. Please log in again.');
        return;
      }

      const url = `${baseUrl}/apps/api/v1/employees/${employeeId}/leaves/entitlements/year/${selectedYear}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success) {
          setEmployeeData(json.data.employee);
          // Filter out leaves with 0 earned days and sort by leave code description
          const relevantEntitlements = json.data.entitlements
            .filter((ent: Entitlement) => ent.earnedDays > 0 || ent.carryForwardDays > 0)
            .sort((a: Entitlement, b: Entitlement) => a.leaveCodeDesc.localeCompare(b.leaveCodeDesc));
          setEntitlements(relevantEntitlements);
        }
      } else {
        Alert.alert('Error', 'Failed to fetch leave entitlements.');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveEntitlements();
  }, [selectedYear]);

  const getLocalizedText = (key: keyof Translation): string => {
    switch (language) {
      case 'ms':
        return {
          leaveEntitlement: 'Baki Cuti',
          employeeInfo: 'Maklumat Pekerja',
          employeeId: 'ID Pekerja',
          department: 'Jabatan',
          position: 'Jawatan',
          joinDate: 'Tarikh Mula Kerja',
          available: 'Baki',
          taken: 'Diambil',
          total: 'Diperolehi',
          carryForward: 'B/H',
          loading: 'Memuat...',
          error: 'Ralat',
          loginRequired: 'Sila log masuk semula.',
          fetchError: 'Gagal mendapatkan kelayakan cuti.',
          days: 'hari',
          day: 'hari'
        }[key] || key;

      case 'zh-Hans':
        return {
          leaveEntitlement: '查看休假余额',
          employeeInfo: '员工信息',
          employeeId: '员工编号',
          department: '部门',
          position: '职位',
          joinDate: '入职日期',
          available: '可用',
          taken: '已用',
          total: '已获得',
          carryForward: '结转',
          loading: '加载中...',
          error: '错误',
          loginRequired: '请重新登录。',
          fetchError: '获取休假额度失败。',
          days: '天',
          day: '天'
        }[key] || key;

      case 'zh-Hant':
        return {
          leaveEntitlement: '查看休假餘額',
          employeeInfo: '員工信息',
          employeeId: '員工編號',
          department: '部門',
          position: '職位',
          joinDate: '入職日期',
          available: '可用',
          taken: '已用',
          total: '已獲得',
          carryForward: '結轉',
          loading: '載入中...',
          error: '錯誤',
          loginRequired: '請重新登入。',
          fetchError: '獲取休假額度失敗。',
          days: '天',
          day: '天'
        }[key] || key;

      default: // 'en'
        return {
          leaveEntitlement: 'Leave Balance',
          employeeInfo: 'Employee Information',
          employeeId: 'Employee ID',
          department: 'Department',
          position: 'Position',
          joinDate: 'Join Date',
          available: 'Available',
          taken: 'Taken',
          total: 'Earned',
          carryForward: 'C/F',
          loading: 'Loading...',
          error: 'Error',
          loginRequired: 'Please log in again.',
          fetchError: 'Failed to fetch leave entitlements.',
          days: 'days',
          day: 'day'
        }[key] || key;
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: theme.headerBackground,
        shadowColor: 'transparent',
        elevation: 0,
      },
      headerTintColor: theme.headerText,
      headerTitleStyle: {
        color: theme.headerText,
        fontSize: 17,
        fontWeight: '600',
      },
      headerShadowVisible: false,
      title: getLocalizedText('leaveEntitlement'),
    });
  }, [navigation, theme, language]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header Card */}
      <View style={[styles.headerCard, { 
        backgroundColor: theme.card,
        borderColor: theme.border,
        borderWidth: 1,
      }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {getLocalizedText('leaveEntitlement')}
        </Text>
        <View style={[styles.yearNavigation, { 
          backgroundColor: theme.buttonBackground,
        }]}>
          <TouchableOpacity onPress={handlePreviousYear} style={styles.yearButton}>
            <Image
              source={require('../../../../asset/img/icon/a-d-arrow-left.png')}
              style={[styles.arrowIcon, { tintColor: theme.primary }]}
            />
          </TouchableOpacity>
          
          <Text style={[styles.yearText, { color: theme.text }]}>
            {selectedYear}
          </Text>
          
          <TouchableOpacity 
            onPress={handleNextYear}
            style={[
              styles.yearButton,
              selectedYear === new Date().getFullYear() && { opacity: 0.5 }
            ]}
            disabled={selectedYear === new Date().getFullYear()}
          >
            <Image
              source={require('../../../../asset/img/icon/a-d-arrow-right.png')}
              style={[
                styles.arrowIcon,
                { tintColor: theme.primary },
                selectedYear === new Date().getFullYear() && { opacity: 0.5 }
              ]}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Employee Info Card */}
      {employeeData && (
        <View style={[styles.employeeCard, { 
          backgroundColor: theme.card,
          borderColor: theme.border,
          borderWidth: 1,
        }]}>
          <View style={[styles.employeeHeader, { 
            borderBottomColor: theme.divider
          }]}>
            <Text style={[styles.employeeName, { color: theme.text }]}>
              {employeeData.name}
            </Text>
            <Text style={[styles.employeeId, { color: theme.subText }]}>
              {getLocalizedText('employeeId')}: {employeeData.employeeNumber}
            </Text>
          </View>
          <View style={styles.employeeDetails}>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.subText }]}>
                {getLocalizedText('department')}
              </Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {employeeData.departmentDesc}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.subText }]}>
                {getLocalizedText('position')}
              </Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {employeeData.jobTitleDesc}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={[styles.detailLabel, { color: theme.subText }]}>
                {getLocalizedText('joinDate')}
              </Text>
              <Text style={[styles.detailValue, { color: theme.text }]}>
                {new Date(employeeData.dateJoin).toLocaleDateString('en-US', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Entitlements Section */}
      <View style={styles.entitlementsContainer}>
        {entitlements.map((item, index) => (
          <View key={index} style={[styles.entitlementCard, { 
            backgroundColor: theme.card,
            borderColor: theme.border,
            borderWidth: 1,
          }]}>
            <View style={[styles.leaveTypeHeader, { 
              borderBottomColor: theme.divider
            }]}>
              <Text style={[styles.leaveType, { color: theme.text }]}>
                {item.leaveCodeDesc}
              </Text>
              <Text style={[styles.leaveCode, { 
                color: theme.subText,
                backgroundColor: theme.buttonBackground,
              }]}>
                {item.leaveCode}
              </Text>
            </View>
            
            <View style={styles.leaveDetails}>
              <View style={styles.detailBox}>
                <Text style={[styles.detailBoxLabel, { color: theme.subText }]}>
                  {getLocalizedText('total')}
                </Text>
                <Text style={[styles.detailBoxValue, { color: theme.primary }]}>
                  {item.earnedDays.toFixed(1)}
                </Text>
              </View>

              {item.carryForwardDays > 0 && (
                <View style={styles.detailBox}>
                  <Text style={[styles.detailBoxLabel, { color: theme.subText }]}>
                    {getLocalizedText('carryForward')}
                  </Text>
                  <Text style={[styles.detailBoxValue, { color: theme.buttonText }]}>
                    {item.carryForwardDays.toFixed(1)}
                  </Text>
                </View>
              )}

              <View style={styles.detailBox}>
                <Text style={[styles.detailBoxLabel, { color: theme.subText }]}>
                  {getLocalizedText('taken')}
                </Text>
                <Text style={[styles.detailBoxValue, { color: '#FF9500' }]}>
                  {item.takenDays.toFixed(1)}
                </Text>
              </View>

              <View style={styles.detailBox}>
                <Text style={[styles.detailBoxLabel, { color: theme.subText }]}>
                  {getLocalizedText('available')}
                </Text>
                <Text style={[styles.detailBoxValue, { color: theme.success }]}>
                  {item.balanceDays.toFixed(1)}
                </Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginBottom: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  yearNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 8,
  },
  yearButton: {
    padding: 8,
    borderRadius: 8,
  },
  yearButtonDisabled: {
    opacity: 0.5,
  },
  yearText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 24,
  },
  arrowIcon: {
    width: 24,
    height: 24,
    tintColor: '#007AFF',
  },
  arrowIconDisabled: {
    tintColor: '#999',
  },
  employeeCard: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  employeeHeader: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    paddingBottom: 16,
  },
  employeeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  employeeId: {
    fontSize: 16,
    color: '#666',
  },
  employeeDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  entitlementsContainer: {
    padding: 16,
    paddingTop: 0,
  },
  entitlementCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  leaveTypeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  leaveType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  leaveCode: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  leaveDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailBox: {
    flex: 1,
    alignItems: 'center',
    padding: 8,
  },
  detailBoxLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailBoxValue: {
    fontSize: 20,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LeaveEntitlementListing;