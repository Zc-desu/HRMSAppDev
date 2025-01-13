import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Animated, Dimensions, ActivityIndicator, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../modules/setting/ThemeContext';
import { useLanguage } from '../modules/setting/LanguageContext';
import { useFocusEffect } from '@react-navigation/native';
import CustomAlert from '../modules/setting/CustomAlert';
import DateTimePicker from '@react-native-community/datetimepicker';

interface AlertConfig {
  visible: boolean;
  title: string;
  message: string;
  buttons?: Array<{
    text: string;
    style?: "default" | "cancel" | "destructive";
    onPress?: () => void;
  }>;
}

interface Allowance {
  allowanceCode: string;
  amount: number;
}

interface Overtime {
  overtimeCode: string;
  hourMinute: number;
}

interface Timesheet {
  scheduleCode: string;
  scheduleDescription: string;
  typeOfDay: string;
  timeLog: string;
  workHour: string;
  scheduleIn: string;
  scheduleOut: string;
  earlyIn: string;
  earlyOut: string;
  lateIn: string;
  lateOut: string;
  absent: boolean;
  outstation: boolean;
  oddClocking: boolean;
  leave: string | null;
  undefinedSchedule: boolean;
  totalOvertimeInMinutes: number;
  totalAllowance: number;
}

interface StatusIndicator {
  label: string;
  color: string;
}

const getTypeOfDayFullName = (type: string): string => {
  switch (type) {
    case 'W':
      return 'Working Day';
    case 'R':
      return 'Rest Day';
    case 'H':
      return 'Holiday';
    default:
      return type;
  }
};

const ApprovalMenu = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [loggedIn, setLoggedIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [baseUrl, setBaseUrl] = useState<string | null>(null);
  const { moduleAccess } = route.params;
  
  // Add states for employee data
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [employeeNumber, setEmployeeNumber] = useState<string | null>(null);
  const [employeeName, setEmployeeName] = useState<string | null>(null);

  // First define getLocalizedText
  const getLocalizedText = (key: string) => {
    const translations = {
      'en': {
        scheduleCode: 'Schedule Code',
        description: 'Description',
        typeOfDay: 'Type of Day',
        workHour: 'Work Hour',
        allowances: 'Allowances',
        overtimes: 'Overtimes',
        totalHours: 'Total Hours',
        total: 'Total',
        workingDay: 'Working Day',
        timesheet: 'Timesheet',
        dashboard: 'Dashboard',
        payslip: 'Payslip',
        leave: 'Leave',
        noticeBoard: 'Notice Board',
        attendance: 'Attendance',
        settings: 'Settings',
        logOut: 'Log Out',
        approvals: 'Approvals',
        timeLogs: 'Time Logs',
        earlyIn: 'Early In',
        earlyOut: 'Early Out',
        lateIn: 'Late In',
        lateOut: 'Late Out',
        logOutConfirm: 'Log Out',
        logOutMessage: 'Are you sure you want to log out?',
        accessDenied: 'Access Denied',
        noLeaveAccess: 'You do not have access to the leave module.',
        noPayslipAccess: 'You do not have access to the payslip module.',
        noAttendanceAccess: 'You do not have access to the attendance module.',
        noNoticeBoardAccess: 'You do not have access to the notice board.',
        cancel: 'Cancel',
        ok: 'OK'
      },
      'zh-Hans': {
        scheduleCode: '班次代码',
        description: '描述',
        typeOfDay: '日期类型',
        workHour: '工作时间',
        allowances: '津贴',
        overtimes: '加班',
        totalHours: '总时数',
        total: '总计',
        workingDay: '工作日',
        timesheet: '考勤表',
        dashboard: '仪表板',
        payslip: '工资单',
        leave: '请假',
        noticeBoard: '公告栏',
        attendance: '考勤',
        settings: '设置',
        logOut: '退出',
        approvals: '审批',
        timeLogs: '打卡记录',
        earlyIn: '提早到',
        earlyOut: '提早走',
        lateIn: '迟到',
        lateOut: '迟走',
        logOutConfirm: '退出登录',
        logOutMessage: '确定要退出登录吗？',
        accessDenied: '拒绝访问',
        noLeaveAccess: '您没有请假模块的访问权限。',
        noPayslipAccess: '您没有工资单模块的访问权限。',
        noAttendanceAccess: '您没有考勤模块的访问权限。',
        noNoticeBoardAccess: '您没有公告板的访问权限。',
        cancel: '取消',
        ok: '确定'
      },
      'zh-Hant': {
        scheduleCode: '班次代碼',
        description: '描述',
        typeOfDay: '日期類型',
        workHour: '工作時間',
        allowances: '津貼',
        overtimes: '加班',
        totalHours: '總時數',
        total: '總計',
        workingDay: '工作日',
        timesheet: '考勤表',
        dashboard: '儀表板',
        payslip: '工資單',
        leave: '請假',
        noticeBoard: '公告欄',
        attendance: '考勤',
        settings: '設置',
        logOut: '退出',
        approvals: '審批',
        timeLogs: '打卡記錄',
        earlyIn: '提早到',
        earlyOut: '提早走',
        lateIn: '遲到',
        lateOut: '遲走',
        logOutConfirm: '退出登錄',
        logOutMessage: '確定要退出登錄？',
        accessDenied: '拒絕訪問',
        noLeaveAccess: '您沒有請假模塊的訪問權限。',
        noPayslipAccess: '您沒有工資單模塊的訪問權限。',
        noAttendanceAccess: '您沒有考勤模塊的訪問權限。',
        noNoticeBoardAccess: '您沒有公告板的訪問權限。',
        cancel: '取消',
        ok: '確定'
      },
      'ms': {
        scheduleCode: 'Kod Jadual',
        description: 'Keterangan',
        typeOfDay: 'Jenis Hari',
        workHour: 'Waktu Kerja',
        allowances: 'Elaun',
        overtimes: 'Kerja Lebih Masa',
        totalHours: 'Jumlah Jam',
        total: 'Jumlah',
        workingDay: 'Hari Bekerja',
        timesheet: 'Jadual Waktu',
        dashboard: 'Papan Pemuka',
        payslip: 'Slip Gaji',
        leave: 'Cuti',
        noticeBoard: 'Papan Notis',
        attendance: 'Kehadiran',
        settings: 'Tetapan',
        logOut: 'Log Keluar',
        approvals: 'Kelulusan',
        timeLogs: 'Log Masa',
        earlyIn: 'Awal Masuk',
        earlyOut: 'Awal Keluar',
        lateIn: 'Lewat Masuk',
        lateOut: 'Lewat Keluar',
        logOutConfirm: 'Log Keluar',
        logOutMessage: 'Adakah anda pasti mahu log keluar?',
        accessDenied: 'Akses Ditolak',
        noLeaveAccess: 'Anda tidak mempunyai akses kepada modul cuti.',
        noPayslipAccess: 'Anda tidak mempunyai akses kepada modul slip gaji.',
        noAttendanceAccess: 'Anda tidak mempunyai akses kepada modul kehadiran.',
        noNoticeBoardAccess: 'Anda tidak mempunyai akses kepada papan notis.',
        cancel: 'Batal',
        ok: 'OK'
      }
    };
    return translations[language]?.[key] || key;
  };

  // Then use it in state initialization
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    visible: false,
    title: '',
    message: '',
    buttons: [{
      text: getLocalizedText('ok'),
      onPress: () => setAlertConfig(prev => ({ ...prev, visible: false }))
    }]
  });

  // Add state for userId
  const [userId, setUserId] = useState<string | null>(null);

  // Keep these declarations at the component level
  const [activeTab, setActiveTab] = useState('dashboard');
  const scrollViewRef = useRef<ScrollView>(null);
  const screenWidth = Dimensions.get('window').width;

  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    setActiveTab(contentOffset > screenWidth / 2 ? 'dashboard' : 'timesheet');
  };

  useEffect(() => {
    const loadBaseUrl = async () => {
      const url = await AsyncStorage.getItem('baseUrl');
      setBaseUrl(url);
    };
    loadBaseUrl();
  }, []);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Get from route params first
        if (route.params?.userId) {
          setUserId(route.params.userId.toString());
          await AsyncStorage.setItem('userId', route.params.userId.toString());
        } else {
          // Fallback to AsyncStorage
          const storedUserId = await AsyncStorage.getItem('userId');
          if (storedUserId) {
            setUserId(storedUserId);
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    loadUserData();
  }, [route.params?.userId]);

  const showAlert = (title: string, message: string, buttons?: Array<any>) => {
    setAlertConfig({
      visible: true,
      title: title || '',
      message: message || '',
      buttons: buttons || [{
        text: getLocalizedText('ok'),
        onPress: () => setAlertConfig(prev => ({ ...prev, visible: false }))
      }]
    });
  };

  // Add loadEmployeeData function
  const loadEmployeeData = async () => {
    try {
      // First try to get data from route params
      if (route.params?.employeeData) {
        const { employee_name, employee_number, employee_id } = route.params.employeeData;
        setEmployeeName(employee_name);
        setEmployeeNumber(employee_number);
        setEmployeeId(employee_id);
        return;
      }

      // Fallback to stored token
      const storedDecodedToken = await AsyncStorage.getItem('decodedToken');
      if (storedDecodedToken) {
        const decodedToken = JSON.parse(storedDecodedToken);
        if (decodedToken?.decodedPayload) {
          const { employee_name, employee_number, employee_id } = decodedToken.decodedPayload;
          setEmployeeName(employee_name);
          setEmployeeNumber(employee_number);
          setEmployeeId(employee_id);
        }
      }
    } catch (error) {
      console.error('Error loading employee data:', error);
      showAlert(getLocalizedText('error'), 'Failed to load employee data');
    }
  };

  // Use useFocusEffect to reload data when screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadEmployeeData();
    }, [route.params?.refresh])
  );

  // Update handleLogout
  const handleLogout = async () => {
    showAlert(
      getLocalizedText('logOutConfirm'),
      getLocalizedText('logOutMessage'),
      [
        {
          text: getLocalizedText('cancel'),
          style: 'cancel',
          onPress: () => setAlertConfig(prev => ({ ...prev, visible: false }))
        },
        {
          text: getLocalizedText('logOut'),
          style: 'default',
          onPress: async () => {
            try {
              // Only clear auth-related items
              await AsyncStorage.multiRemove([
                'userToken',
                'decodedToken',
                'userId',
                'baseUrl',
                'companyId'
              ]);
              
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Error during logout:', error);
              showAlert(getLocalizedText('error'), getLocalizedText('logoutError'));
            }
          }
        }
      ]
    );
  };

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timesheet, setTimesheet] = useState<Timesheet | null>(null);
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [overtimes, setOvertimes] = useState<Overtime[]>([]);

  const fetchTimesheet = async () => {
    setIsLoading(true);
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      
      // Format date to YYYY-MM-DDT00:00:00Z
      const formattedDate = selectedDate.toISOString().split('T')[0] + 'T00:00:00Z';

      const response = await fetch(
        `${baseUrl}/apps/api/v1/employees/${employeeId}/timesheet/${formattedDate}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      
      const data = await response.json();

      if (data.success) {
        setTimesheet(data.data.timesheet);
        setAllowances(data.data.allowances || []);
        setOvertimes(data.data.overtimes || []);
      } else {
        console.warn('Timesheet fetch failed:', data.message || 'No error message provided');
      }
    } catch (error) {
      console.error('Timesheet fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (baseUrl && employeeId) {
      fetchTimesheet();
    }
  }, [selectedDate, baseUrl, employeeId]);

  const DashboardView = () => {
    return (
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Date Selector */}
        <View style={styles.dateSelector}>
          <TouchableOpacity
            style={styles.dateArrowButton}
            onPress={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(selectedDate.getDate() - 1);
              setSelectedDate(newDate);
            }}
          >
            <Image
              source={require('../../../asset/img/icon/a-d-arrow-left.png')}
              style={[styles.dateArrow, { tintColor: theme.primary }]}
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => setShowDatePicker(true)}
            style={styles.dateButton}
          >
            <Text style={[styles.dateText, { color: theme.text }]}>
              {selectedDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.dateArrowButton}
            onPress={() => {
              const newDate = new Date(selectedDate);
              newDate.setDate(selectedDate.getDate() + 1);
              setSelectedDate(newDate);
            }}
          >
            <Image
              source={require('../../../asset/img/icon/a-d-arrow-right.png')}
              style={[styles.dateArrow, { tintColor: theme.primary }]}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={() => fetchTimesheet()}
          >
            <Image
              source={require('../../../asset/img/icon/shuaxin.png')}
              style={[styles.refreshIcon, { tintColor: theme.primary }]}
            />
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
          />
        )}

        <View style={styles.timesheetContainer}>
          {/* Schedule Info */}
          <View style={[styles.scheduleCard, { backgroundColor: theme.card }]}>
            <View style={styles.scheduleRow}>
              <Text style={[styles.scheduleLabel, { color: theme.text }]}>
                {getLocalizedText('scheduleCode')}
              </Text>
              <Text style={[styles.scheduleValue, { color: theme.text }]}>
                {timesheet?.scheduleCode || ''}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.scheduleRow}>
              <Text style={[styles.scheduleLabel, { color: theme.text }]}>
                {getLocalizedText('description')}
              </Text>
              <Text style={[styles.scheduleValue, { color: theme.text }]}>
                {timesheet?.scheduleDescription || ''}
              </Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.scheduleRow}>
              <Text style={[styles.scheduleLabel, { color: theme.text }]}>
                {getLocalizedText('typeOfDay')}
              </Text>
              <Text style={[styles.scheduleValue, { color: theme.text }]}>
                {getLocalizedText('workingDay')}
              </Text>
            </View>
          </View>

          {/* Status Indicators */}
          <View style={styles.statusContainer}>
            {timesheet && getStatusIndicators(timesheet).map((indicator, index) => (
              <View 
                key={index}
                style={[
                  styles.statusBadge,
                  { backgroundColor: indicator.color + '20' }
                ]}
              >
                <Text style={[styles.statusText, { color: indicator.color }]}>
                  {indicator.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Time Logs */}
          <View style={styles.timeLogsContainer}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              {getLocalizedText('timeLogs')}
            </Text>
            <View style={styles.timeLogsList}>
              {timesheet?.timeLog?.split(' ').map((time, index) => (
                <View 
                  key={index} 
                  style={[styles.timeLogItem, { backgroundColor: theme.card }]}
                >
                  <Text style={[styles.timeLogValue, { color: theme.text }]}>
                    {time}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Work Hour */}
          <View style={[styles.workingHoursBox, { backgroundColor: theme.card }]}>
            <Text style={[styles.workingHoursLabel, { color: theme.subText }]}>
              {getLocalizedText('workHour')}
            </Text>
            <Text style={[styles.workingHoursValue, { color: theme.text }]}>
              {timesheet?.workHour || '00:00:00'}
            </Text>
          </View>

          {/* Early/Late Times */}
          <View style={[styles.timingContainer, { marginBottom: 16 }]}>
            <View style={styles.timingGrid}>
              <View style={[styles.timingItem, { backgroundColor: theme.card }]}>
                <Text style={[styles.timingLabel, { color: theme.subText }]}>{getLocalizedText('earlyIn')}</Text>
                <Text style={[styles.timingValue, { color: '#4CAF50' }]}>
                  {timesheet?.earlyIn || '00:00:00'}
                </Text>
              </View>
              <View style={[styles.timingItem, { backgroundColor: theme.card }]}>
                <Text style={[styles.timingLabel, { color: theme.subText }]}>{getLocalizedText('earlyOut')}</Text>
                <Text style={[styles.timingValue, { color: '#FF3B30' }]}>
                  {timesheet?.earlyOut || '00:00:00'}
                </Text>
              </View>
            </View>
            
            <View style={styles.timingGrid}>
              <View style={[styles.timingItem, { backgroundColor: theme.card }]}>
                <Text style={[styles.timingLabel, { color: theme.subText }]}>{getLocalizedText('lateIn')}</Text>
                <Text style={[styles.timingValue, { color: '#FF3B30' }]}>
                  {timesheet?.lateIn || '00:00:00'}
                </Text>
              </View>
              <View style={[styles.timingItem, { backgroundColor: theme.card }]}>
                <Text style={[styles.timingLabel, { color: theme.subText }]}>{getLocalizedText('lateOut')}</Text>
                <Text style={[styles.timingValue, { color: '#4CAF50' }]}>
                  {timesheet?.lateOut || '00:00:00'}
                </Text>
              </View>
            </View>
          </View>

          {/* Allowances Section */}
          {allowances && allowances.length > 0 && (
            <View style={[styles.sectionContainer, { backgroundColor: theme.card }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>{getLocalizedText('allowances')}</Text>
              {allowances.map((allowance, index) => (
                <View key={index} style={styles.itemRow}>
                  <Text style={[styles.itemCode, { color: theme.text }]}>{allowance.allowanceCode}</Text>
                  <Text style={[styles.itemAmount, { color: theme.text }]}>
                    {allowance.amount.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* Overtimes Section */}
          {overtimes && overtimes.length > 0 && (
            <View style={[styles.sectionContainer, { backgroundColor: theme.card }]}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>{getLocalizedText('overtimes')}</Text>
              {overtimes.map((overtime, index) => (
                <View key={index} style={styles.itemRow}>
                  <Text style={[styles.itemCode, { color: theme.text }]}>{overtime.overtimeCode}</Text>
                  <Text style={[styles.itemAmount, { color: theme.text }]}>
                    {overtime.hourMinute.toFixed(2)}
                  </Text>
                </View>
              ))}
            </View>
          )}


          
        </View>
      </ScrollView>
    );
  };

  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);

  // Also add the date picker handler
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  const getStatusIndicators = (timesheet: Timesheet): StatusIndicator[] => {
    const indicators: StatusIndicator[] = [];
    
    if (timesheet.absent) {
      indicators.push({ label: 'Absent', color: '#FF3B30' });
    }
    if (timesheet.outstation) {
      indicators.push({ label: 'Outstation', color: '#007AFF' });
    }
    if (timesheet.oddClocking) {
      indicators.push({ label: 'Odd Clocking', color: '#FF9500' });
    }
    if (timesheet.undefinedSchedule) {
      indicators.push({ label: 'Undefined Schedule', color: '#FF2D55' });
    }
    if (timesheet.leave) {
      indicators.push({ label: timesheet.leave, color: '#5856D6' });
    }

    return indicators;
  };

  // Add useEffect to set initial scroll position to Dashboard when component mounts
  useEffect(() => {
    // Small delay to ensure the scroll happens after render
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({ 
        x: Dimensions.get('window').width, 
        animated: false 
      });
    }, 100);
  }, []); // Empty dependency array means this runs once on mount

  const styles = StyleSheet.create({
    containerWrapper: {
      flex: 1,
      backgroundColor: theme.background,
      paddingBottom: 60,
    },
    container: {
      flexGrow: 1,
      padding: 16,
    },
    viewDetailButton: {
      width: '92%',
      alignSelf: 'center',
      borderRadius: 12,
      paddingVertical: 12,
      marginVertical: 8,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    buttonContent: {
      flexDirection: 'row',
      width: '100%',
      alignItems: 'center',
      paddingHorizontal: 24,
    },
    textContainer: {
      flex: 1,
    },
    employeeNoText: {
      fontSize: 16,
      marginBottom: 8,
    },
    employeeNameText: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 4,
    },
    avatarStyle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      resizeMode: 'contain',
    },
    buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    squareButton: {
      width: '48%',
      aspectRatio: 1,
      borderRadius: 12,
      padding: 16,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    squareButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    iconTextContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconImage: {
      width: 40,
      height: 40,
      marginBottom: 8,
    },
    logoutButtonStyle: {
      marginBottom: 0,
    },
    scrollIndicator: {
      position: 'absolute',
      right: 16,
      top: '50%',
      transform: [{ translateY: -20 }],
      zIndex: 1000,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      borderRadius: 20,
      padding: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    scrollIcon: {
      width: 24,
      height: 24,
    },
    scrollView: {
      flex: 1,
    },
    scrollViewContent: {
      padding: 16,
      paddingBottom: 60,
    },
    buttonContainer: {
      flex: 1,
      marginTop: -16,
    },
    page: {
      width: Dimensions.get('window').width,
      height: '100%',
    },
    dashboardCard: {
      padding: 16,
      borderRadius: 12,
      backgroundColor: theme.card,
      marginHorizontal: 16,
      marginTop: -4,
      marginBottom: 8,
    },
    dashboardTitle: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 16,
    },
    pageIndicator: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'absolute',
      bottom: 16,
      left: 0,
      right: 0,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginHorizontal: 4,
    },
    dateSelector: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
    },
    dateArrowButton: {
      padding: 8,
    },
    dateArrow: {
      width: 24,
      height: 24,
    },
    dateButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: 'rgba(0,0,0,0.05)',
      minWidth: 100,
      alignItems: 'center',
    },
    dateText: {
      fontSize: 16,
      fontWeight: '500',
    },
    loader: {
      marginVertical: 20,
    },
    timesheetContainer: {
      paddingBottom: 12,
    },
    scheduleCard: {
      borderRadius: 16,
      padding: 12,
      marginBottom: 16,
    },
    scheduleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    scheduleLabel: {
      fontSize: 14,
      fontWeight: '500',
    },
    scheduleValue: {
      fontSize: 14,
      fontWeight: '600',
    },
    divider: {
      height: 1,
      opacity: 0.1,
    },
    timeContainer: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
    },
    timeBox: {
      flex: 1,
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
    },
    timeLabel: {
      fontSize: 14,
      marginBottom: 8,
    },
    timeValue: {
      fontSize: 24,
      fontWeight: '600',
    },
    workingHoursSection: {
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      marginBottom: 6,
    },
    workingHoursBox: {
      width: '100%',
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      alignItems: 'center',
    },
    workingHoursLabel: {
      fontSize: 14,
      marginBottom: 4,
    },
    workingHoursValue: {
      fontSize: 24,
      fontWeight: '600',
    },
    statusContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    timeLogsContainer: {
      marginTop: 16,
      marginBottom: 16,
    },
    timeLogsList: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    timeLogItem: {
      padding: 10,
      borderRadius: 8,
      alignItems: 'center',
      width: '22%',
    },
    timeLogValue: {
      fontSize: 14,
      fontWeight: '600',
    },
    timingContainer: {
      marginTop: 16,
      gap: 8,
    },
    timingGrid: {
      flexDirection: 'row',
      gap: 8,
    },
    timingItem: {
      flex: 1,
      borderRadius: 12,
      padding: 12,
      alignItems: 'flex-start',
    },
    timingLabel: {
      fontSize: 14,
      marginBottom: 4,
    },
    timingValue: {
      fontSize: 16,
      fontWeight: '600',
    },
    clockInButton: {
      backgroundColor: theme.primary,
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    clockInButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },
    sectionLabel: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 8,
    },
    refreshButton: {
      padding: 8,
      marginLeft: 8,
    },
    refreshIcon: {
      width: 24,
      height: 24,
    },
    bottomMenu: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor: theme.card,
      paddingVertical: 8,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
    },
    menuItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 8,
    },
    menuIcon: {
      width: 24,
      height: 24,
    },
    menuText: {
      fontSize: 12,
      marginTop: 4,
    },
    activeIndicator: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      height: 3,
      backgroundColor: '#007AFF',
    },
    sectionContainer: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    itemCode: {
      fontSize: 14,
    },
    itemAmount: {
      fontSize: 14,
      fontWeight: '500',
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: 'rgba(0,0,0,0.1)',
    },
    totalLabel: {
      fontSize: 14,
      fontWeight: '600',
    },
    totalAmount: {
      fontSize: 14,
      fontWeight: '600',
    },
    timeLogs: {
      fontSize: 14,
      fontWeight: '600',
    },
    earlyIn: {
      fontSize: 14,
      fontWeight: '600',
    },
    earlyOut: {
      fontSize: 14,
      fontWeight: '600',
    },
    lateIn: {
      fontSize: 14,
      fontWeight: '600',
    },
    lateOut: {
      fontSize: 14,
      fontWeight: '600',
    },
  });

  // Handle button press with access check
  const handleButtonPress = (module: string) => {
    switch (module) {
      case 'payslip':
        if (moduleAccess?.payslip) {
          navigation.navigate('Payslip', { baseUrl, employeeId });
        } else {
          showAlert(
            getLocalizedText('accessDenied'),
            getLocalizedText('noPayslipAccess')
          );
        }
        break;

      case 'leave':
        if (moduleAccess?.pendingLeave) {
          navigation.navigate('LeaveMenu', { baseUrl, employeeId });
        } else {
          showAlert(
            getLocalizedText('accessDenied'),
            getLocalizedText('noLeaveAccess')
          );
        }
        break;

      case 'noticeBoard':
        if (moduleAccess?.noticeBoard) {
          const companyIdToUse = route.params?.companyId || route.params?.employeeData?.company_id;
          if (!companyIdToUse || !baseUrl) {
            showAlert(getLocalizedText('error'), getLocalizedText('companyIdUnavailable'));
            return;
          }
          navigation.navigate('NBGetList', {
            employeeId,
            companyId: companyIdToUse,
            baseUrl
          });
        } else {
          showAlert(
            getLocalizedText('accessDenied'),
            getLocalizedText('noNoticeBoardAccess')
          );
        }
        break;

      case 'attendance':
        if (moduleAccess?.clockInOut || moduleAccess?.overtime) {
          const companyIdToUse = route.params?.companyId || route.params?.employeeData?.company_id;
          if (!companyIdToUse || !baseUrl) {
            showAlert(getLocalizedText('error'), getLocalizedText('companyIdUnavailable'));
            return;
          }
          navigation.navigate('ATMenu', {
            employeeId,
            companyId: companyIdToUse,
            baseUrl
          });
        } else {
          showAlert(
            getLocalizedText('accessDenied'),
            getLocalizedText('noAttendanceAccess')
          );
        }
        break;
    }
  };

  return (
    <View style={styles.containerWrapper}>
      <TouchableOpacity
        style={[styles.viewDetailButton, { backgroundColor: theme.card }]}
        onPress={() => {
          if (employeeId) {
            navigation.navigate('ViewEmployeeDetail', { employeeId });
          } else {
            showAlert(getLocalizedText('error'), getLocalizedText('employeeIdUnavailable'));
          }
        }}
      >
        <View style={styles.buttonContent}>
          <View style={styles.textContainer}>
            <Text style={[styles.employeeNoText, { color: theme.subText }]}>
              {employeeNumber}
            </Text>
            <Text style={[styles.employeeNameText, { color: theme.text }]}>
              {employeeName}
            </Text>
          </View>
          <Image
            source={require('../../../asset/img/icon/a-avatar.png')}
            style={[styles.avatarStyle, { tintColor: theme.background === '#000000' ? '#FFFFFF' : undefined }]}
          />
        </View>
      </TouchableOpacity>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        <View style={[styles.page]}>
          <DashboardView />
        </View>

        <View style={[styles.page]}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.buttonContainer}>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.squareButton, { backgroundColor: theme.card }]}
                  onPress={() => handleButtonPress('payslip')}
                >
                  <View style={styles.iconTextContainer}>
                    <Image source={require('../../img/icon/gongzidan.png')} style={[styles.iconImage, { tintColor: theme.primary }]} />
                    <Text style={[styles.squareButtonText, { color: theme.text }]}>
                      {getLocalizedText('payslip')}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.squareButton, { backgroundColor: theme.card }]}
                  onPress={() => handleButtonPress('leave')}
                >
                  <View style={styles.iconTextContainer}>
                    <Image source={require('../../img/icon/leave2.png')} style={[styles.iconImage, { tintColor: theme.primary }]} />
                    <Text style={[styles.squareButtonText, { color: theme.text }]}>
                      {getLocalizedText('leave')}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.squareButton, { backgroundColor: theme.card }]}
                  onPress={() => handleButtonPress('noticeBoard')}
                >
                  <View style={styles.iconTextContainer}>
                    <Image source={require('../../img/icon/noticeboard.png')} style={[styles.iconImage, { tintColor: theme.primary }]} />
                    <Text style={[styles.squareButtonText, { color: theme.text }]}>
                      {getLocalizedText('noticeBoard')}
                    </Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.squareButton, { backgroundColor: theme.card }]}
                  onPress={() => handleButtonPress('attendance')}
                >
                  <View style={styles.iconTextContainer}>
                    <Image source={require('../../img/icon/attendance.png')} style={[styles.iconImage, { tintColor: theme.primary }]} />
                    <Text style={[styles.squareButtonText, { color: theme.text }]}>
                      {getLocalizedText('attendance')}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[styles.squareButton, { backgroundColor: theme.card }]}
                  onPress={() => navigation.navigate('ApproveManagement')}
                >
                  <View style={styles.iconTextContainer}>
                    <Image 
                      source={require('../../img/icon/a-circle-check.png')} 
                      style={[styles.iconImage, { tintColor: theme.primary }]} 
                    />
                    <Text style={[styles.squareButtonText, { color: theme.text }]}>
                      {getLocalizedText('approvals')}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.squareButton, { backgroundColor: theme.card }]}
                  onPress={() => navigation.navigate('Settings')}
                >
                  <View style={styles.iconTextContainer}>
                    <Image 
                      source={require('../../../asset/img/icon/shezhi.png')} 
                      style={[styles.iconImage, { tintColor: theme.primary }]} 
                    />
                    <Text style={[styles.squareButtonText, { color: theme.text }]}>
                      {getLocalizedText('settings')}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.squareButton, { backgroundColor: theme.card }]}
                  onPress={handleLogout}
                >
                  <View style={styles.iconTextContainer}>
                    <Image 
                      source={require('../../img/icon/tuichu.png')} 
                      style={[styles.iconImage, { tintColor: theme.error }]} 
                    />
                    <Text style={[styles.squareButtonText, { color: theme.error }]}>
                      {getLocalizedText('logOut')}
                    </Text>
                  </View>
                </TouchableOpacity>
                <View style={[styles.squareButton, { opacity: 0 }]} />
              </View>
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      <View style={styles.pageIndicator}>
        {[0, 1].map((index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: activeTab === (index === 0 ? 'timesheet' : 'dashboard') ? theme.primary : theme.border,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.bottomMenu}>
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => {
            setActiveTab('timesheet');
            scrollViewRef.current?.scrollTo({ x: 0, animated: true });
          }}
        >
          <Image
            source={require('../../../asset/img/icon/timesheet.png')}
            style={[styles.menuIcon, { tintColor: activeTab === 'timesheet' ? '#007AFF' : '#8E8E93' }]}
          />
          <Text style={[styles.menuText, { color: activeTab === 'timesheet' ? '#007AFF' : '#8E8E93' }]}>
            {getLocalizedText('timesheet')}
          </Text>
          {activeTab === 'timesheet' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => {
            setActiveTab('dashboard');
            scrollViewRef.current?.scrollTo({ x: Dimensions.get('window').width, animated: true });
          }}
        >
          <Image
            source={require('../../../asset/img/icon/dashboard.png')}
            style={[styles.menuIcon, { tintColor: activeTab === 'dashboard' ? '#007AFF' : '#8E8E93' }]}
          />
          <Text style={[styles.menuText, { color: activeTab === 'dashboard' ? '#007AFF' : '#8E8E93' }]}>
            {getLocalizedText('dashboard')}
          </Text>
          {activeTab === 'dashboard' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
      </View>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
      />
    </View>
  );
};

export default ApprovalMenu;
