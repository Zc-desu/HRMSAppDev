import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, BackHandler, ActivityIndicator, Platform, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../modules/setting/ThemeContext';
import { useLanguage } from '../modules/setting/LanguageContext';
import CustomAlert from '../modules/setting/CustomAlert';
import DateTimePicker from '@react-native-community/datetimepicker';

// Add interfaces for alert config
interface CustomAlertButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertConfig {
  visible: boolean;
  title: string;
  message: string;
  buttons: CustomAlertButton[];
}

// Add Timesheet interface
interface Timesheet {
  scheduleCode: string;
  scheduleDescription: string;
  typeOfDay: string;
  scheduleDate: string;
  workHour: string;
  scheduleIn: string;
  scheduleOut: string;
  lateIn: string;
  earlyIn: string;
  earlyOut: string;
  lateOut: string;
  absent: boolean;
  outstation: boolean;
  oddClocking: boolean;
  leave: string | null;
  undefinedSchedule: boolean;
  timeLog: string;
  employeeId: number;
  employeeNumber: string;
  employeeName: string;
  jobTitleCode: string;
  jobTitleDesc: string;
  jobGradeCode: string;
  jobGradeDesc: string;
  categoryCode: string;
  categoryDesc: string;
  costCenterCode: string;
  costCenterDesc: string;
  departmentCode: string;
  departmentDesc: string;
  timeSheetId: string;
  workHourInMinutes: number;
  earlyInInMinutes: number;
  lateInInMinutes: number;
  breakHourInMinutes: number;
  overBreakHourInMinutes: number;
  earlyOutInMinutes: number;
  lateOutInMinutes: number;
  scheduleInInMinutes: number;
  scheduleOutInMinutes: number;
  absentDay: number;
  leaveDay: any;
  timeOffDurationInMinutes: number;
  remarks: string | null;
  isManual: boolean;
  isManualTimeLog: string;
  totalOvertimeInMinutes: number;
  totalAllowance: number;
}

// Add this interface
interface StatusIndicator {
  label: string;
  color: string;
}

// Add these interfaces at the top
interface Allowance {
  allowanceCode: string;
  amount: number;
}

interface Overtime {
  overtimeCode: string;
  hourMinute: number;
}

const EmployeeMenu = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [employeeName, setEmployeeName] = useState<string | null>(null);
  const [employeeNumber, setEmployeeNumber] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(true);
  const [baseUrl, setBaseUrl] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timesheet, setTimesheet] = useState<Timesheet | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const screenWidth = Dimensions.get('window').width;
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const [overtimes, setOvertimes] = useState<Overtime[]>([]);

  // Extract companyId, baseUrl, and decodedToken from route params
  const { companyId, baseUrl: passedBaseUrl, decodedToken, moduleAccess } = route.params;

  const showAlert = (title: string, message: string, buttons: CustomAlertButton[] = []) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons: buttons.length > 0 ? buttons : [
        { text: getLocalizedText('ok'), onPress: () => setAlertConfig(prev => ({ ...prev, visible: false })) }
      ],
    });
  };

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
        timeLogs: '打卡記錄',
        earlyIn: '提早到',
        earlyOut: '提早走',
        lateIn: '遲到',
        lateOut: '遲走',
        logOutConfirm: '退出登錄',
        logOutMessage: '確定要退出登錄嗎？',
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

  // Ensure baseUrl and employeeId are set properly
  useEffect(() => {
    const getBaseUrlAndEmployeeId = async () => {
      if (passedBaseUrl) {
        setBaseUrl(passedBaseUrl);
      } else {
        const storedBaseUrl = await AsyncStorage.getItem('baseUrl');
        if (storedBaseUrl) {
          setBaseUrl(storedBaseUrl);
        } else {
          showAlert(getLocalizedText('error'), getLocalizedText('baseUrlUnavailable'));
        }
      }

      if (decodedToken?.decodedPayload) {
        setEmployeeId(decodedToken.decodedPayload.employee_id);
        setEmployeeName(decodedToken.decodedPayload.employee_name);
        setEmployeeNumber(decodedToken.decodedPayload.employee_number);
      } else {
        const storedEmployeeId = await AsyncStorage.getItem('employeeId');
        if (storedEmployeeId) {
          setEmployeeId(storedEmployeeId);
        } else {
          showAlert(getLocalizedText('error'), getLocalizedText('employeeIdUnavailable'));
        }
      }
    };

    getBaseUrlAndEmployeeId();
  }, [passedBaseUrl, decodedToken]);

  // Modify checkAuth to check for userToken instead of authToken
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (!userToken) {
          setLoggedIn(false);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        } else {
          setLoggedIn(true);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };
    checkAuth();
  }, [navigation]);

  // Handle hardware back button
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (!loggedIn) {
          return true; // Prevent going back if logged out
        }
        return false;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [loggedIn])
  );

  // Add header styling
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

  // Modified handleLogout
  const handleLogout = async () => {
    // Show confirmation dialog first
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
              
              // Navigate back to login
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

  // Add this near the top of your component
  const { refresh } = route.params || {};

  useEffect(() => {
    if (refresh) {
      // Refresh your data here if needed
      const getBaseUrlAndEmployeeId = async () => {
        // ... existing code ...
      };
      getBaseUrlAndEmployeeId();
    }
  }, [refresh]);

  // Auto refresh when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      const refreshData = async () => {
        try {
          const storedDecodedToken = await AsyncStorage.getItem('decodedToken');
          const parsedToken = storedDecodedToken ? JSON.parse(storedDecodedToken) : null;

          if (parsedToken?.decodedPayload) {
            setEmployeeId(parsedToken.decodedPayload.employee_id);
            setEmployeeName(parsedToken.decodedPayload.employee_name);
            setEmployeeNumber(parsedToken.decodedPayload.employee_number);
          }
        } catch (error) {
          console.error('Refresh error:', error);
        }
      };

      refreshData();
    }, [])
  );

  // Consolidated all data loading logic into one function
  const loadEmployeeData = async () => {
    try {
      // First try to get data from route params
      if (route.params?.employeeData) {
        const { employee_name, employee_number, employee_id } = route.params.employeeData;
        setEmployeeName(employee_name);
        setEmployeeNumber(employee_number);
        setEmployeeId(employee_id);
        return; // Exit if we got data from params
      }

      // Fallback to stored token if no route params
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
    }, [route.params?.refresh]) // Depend on refresh param
  );

  // Add to useEffect for loading user data
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

        // ... rest of existing loadUserData logic ...
      } catch (error) {
        console.error('EmployeeMenu - Error loading user data:', error);
      }
    };

    loadUserData();
  }, [route.params?.userId]);

  // Add fetchTimesheet function
  const fetchTimesheet = async () => {
    
    // Format date to always use 00:00:00Z
    const formattedDate = new Date(selectedDate)
      .toISOString()
      .split('T')[0] + 'T00:00:00Z';

    setIsLoading(true);
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const requestUrl = `${baseUrl}/apps/api/v1/employees/${employeeId}/timesheet/${formattedDate}`;
      

      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });
      
      const data = await response.json();
      

      if (data.success && data.data?.timesheet) {
        const timesheetData = data.data.timesheet;

        
        setTimesheet(timesheetData);
        setAllowances(data.data.allowances || []);
        setOvertimes(data.data.overtimes || []);
      } else {
        console.warn('API Success but no timesheet data:', {
          success: data.success,
          message: data.message,
          hasData: !!data.data
        });
      }
    } catch (error) {
      console.error('Fetch Error Details:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add useEffect for timesheet
  useEffect(() => {
    if (baseUrl && employeeId) {
      fetchTimesheet();
    }
  }, [selectedDate, baseUrl, employeeId]);

  // Add the getTypeOfDayText function
  const getTypeOfDayText = (type?: string) => {
    switch (type) {
      case 'P':
        return 'Public Holiday';
      case 'W':
        return 'Work Day';
      default:
        return type || '--';
    }
  };

  // Add handleClockInPress function
  const handleClockInPress = () => {
    const companyIdToUse = companyId || decodedToken?.decodedPayload?.company_id;
    if (!companyIdToUse) {
      showAlert(getLocalizedText('error'), getLocalizedText('companyIdUnavailable'));
      return;
    }
    navigation.navigate('ATShowMap', {
      employeeId: employeeId,
      companyId: companyIdToUse,
      baseUrl: baseUrl
    });
  };

  // Add this helper function
  const getTypeOfDayFullName = (type: string) => {
    switch (type) {
      case 'O': return 'Off Day';
      case 'P': return 'Public Holiday';
      case 'R': return 'Rest Day';
      case 'W': return 'Working Day';
      default: return '';
    }
  };

  // Update the helper function with proper typing
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

  // Add DashboardView component
  const DashboardView = () => {
    return (
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile section */}
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
            style={styles.datePicker}
          />
        )}

        {isLoading ? (
          <ActivityIndicator size="large" color={theme.primary} style={styles.loader} />
        ) : timesheet ? (
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
                  {getTypeOfDayFullName(timesheet?.typeOfDay || '')}
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
                    { backgroundColor: indicator.color + '20' } // 20% opacity version of the color
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
                {getLocalizedText('timeLogs')}:
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

            {/* Working Hours */}
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
          </View>
        ) : null}

        {/* Allowances Section */}
        {allowances && allowances.length > 0 && (
              <View style={[styles.sectionBox, { backgroundColor: theme.card }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  {getLocalizedText('allowances')}
                </Text>
                {allowances.map((allowance, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Text style={[styles.itemCode, { color: theme.text }]}>
                      {allowance.allowanceCode}
                    </Text>
                    <Text style={[styles.itemValue, { color: theme.text }]}>
                      {allowance.amount.toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Overtimes Section */}
            {overtimes && overtimes.length > 0 && (
              <View style={[styles.sectionBox, { backgroundColor: theme.card }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  {getLocalizedText('overtimes')}
                </Text>
                {overtimes.map((overtime, index) => (
                  <View key={index} style={styles.itemRow}>
                    <Text style={[styles.itemCode, { color: theme.text }]}>
                      {overtime.overtimeCode}
                    </Text>
                    <Text style={[styles.itemValue, { color: theme.text }]}>
                      {overtime.hourMinute.toFixed(2)}
                    </Text>
                  </View>
                ))}
              </View>
            )}

        {/* Add bottom padding to ensure content isn't covered by menu */}
        <View style={{ height: 80 }} />
      </ScrollView>
    );
  };

  // Add swipe handler
  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    setActiveTab(contentOffset > screenWidth / 2 ? 'dashboard' : 'timesheet');
  };

  // Add the onDateChange handler
  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setSelectedDate(selectedDate);
    }
  };

  // Add the renderTimeLogs function
  const renderTimeLogs = (timeLog: string) => {
    const times = timeLog.split(' ');
    
    return (
      <View style={styles.timeLogsList}>
        {times.map((time, index) => (
          <View 
            key={index} 
            style={styles.timeLogItem}
          >
            <Text style={[styles.timeLogValue, { color: theme.text }]}>
              {time}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  // Handle button presses with access check
  const handleButtonPress = (module: string) => {
    switch (module) {
      case 'leave':
        if (moduleAccess?.applyLeave || moduleAccess?.leaveApplication || moduleAccess?.leaveBalance) {
          navigation.navigate('LeaveMenu', { baseUrl, employeeId, userId });
        } else {
          showAlert(
            getLocalizedText('accessDenied'),
            getLocalizedText('noLeaveAccess')
          );
        }
        break;

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

      case 'attendance':
        if (moduleAccess?.clockInOut || moduleAccess?.overtime) {
          const companyIdToUse = companyId || decodedToken?.decodedPayload?.company_id;
          if (!companyIdToUse || !baseUrl) {
            showAlert(
              getLocalizedText('error'),
              getLocalizedText('companyIdUnavailable')
            );
            return;
          }
          navigation.navigate('ATMenu', {
            employeeId: employeeId,
            companyId: companyIdToUse,
            baseUrl: baseUrl
          });
        } else {
          showAlert(
            getLocalizedText('accessDenied'),
            getLocalizedText('noAttendanceAccess')
          );
        }
        break;

      case 'noticeBoard':
        if (moduleAccess?.noticeBoard) {
          const companyIdToUse = companyId || decodedToken?.decodedPayload?.company_id;
          if (!companyIdToUse) {
            showAlert(getLocalizedText('error'), getLocalizedText('companyIdUnavailable'));
            return;
          }
          navigation.navigate('NBGetList', {
            employeeId: employeeId,
            companyId: companyIdToUse,
            baseUrl: baseUrl
          });
        } else {
          showAlert(
            getLocalizedText('accessDenied'),
            getLocalizedText('noNoticeBoardAccess')
          );
        }
        break;
    }
  };

  const styles = StyleSheet.create({
    containerWrapper: {
      flex: 1,
      backgroundColor: theme.background,
    },
    viewDetailButton: {
      width: '92%',
      alignSelf: 'center',
      borderRadius: 12,
      paddingVertical: 12,
      marginVertical: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    scrollView: {
      flex: 1,
    },
    scrollViewContent: {
      paddingHorizontal: 16,
    },
    buttonContainer: {
      flex: 1,
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
    iconTextContainer: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconImage: {
      width: 40,
      height: 40,
      marginBottom: 8,
    },
    squareButtonText: {
      fontSize: 16,
      fontWeight: '600',
    },
    logoutButtonStyle: {
      backgroundColor: theme.card,
    },
    dashboardCard: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
      margin: 16,
      marginTop: 0,
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
      gap: 12,
      marginBottom: 12,
    },
    timeBox: {
      flex: 1,
      borderRadius: 16,
      padding: 16,
      alignItems: 'center',
    },
    timeLabel: {
      fontSize: 14,
      marginBottom: 8,
    },
    timeValue: {
      fontSize: 24,
      fontWeight: '700',
    },
    workingHoursSection: {
      gap: 8,
      marginBottom: 0,
    },
    timeRow: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 4,
    },
    hourBox: {
      flex: 1,
      backgroundColor: theme.background,
      borderRadius: 12,
      padding: 10,
    },
    hourLabel: {
      fontSize: 12,
      color: theme.subText,
      marginBottom: 4,
    },
    hourValue: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
    },
    loader: {
      marginVertical: 20,
    },
    errorText: {
      textAlign: 'center',
      fontSize: 14,
    },
    datePicker: {
      backgroundColor: 'white',
    },
    timesheetContainer: {
      gap: 8,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '500',
      marginBottom: 8,
    },
    page: {
      width: Dimensions.get('window').width,
      height: '100%',
      paddingBottom: 70,
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
    workingHoursBox: {
      width: '100%',
      backgroundColor: 'rgba(0,0,0,0.05)',
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
    timeStatusSection: {
      gap: 12,
    },
    timeStatusRow: {
      flexDirection: 'row',
      gap: 12,
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
    oddClockingWarning: {
      fontSize: 12,
      marginTop: 8,
      fontStyle: 'italic',
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
    activeMenuItem: {
      backgroundColor: theme.primary + '10',
    },
    menuIcon: {
      width: 24,
      height: 24,
    },
    menuText: {
      fontSize: 12,
      marginTop: 4,
    },
    refreshButton: {
      padding: 8,
      marginLeft: 8,
    },
    refreshIcon: {
      width: 20,
      height: 20,
    },
    activeIndicator: {
      position: 'absolute',
      bottom: 0,
      width: '100%',
      height: 3,
      backgroundColor: '#007AFF',
    },
    sectionBox: {
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    itemRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 8,
    },
    itemCode: {
      fontSize: 14,
      fontWeight: '500',
    },
    itemValue: {
      fontSize: 14,
      fontWeight: '600',
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingTop: 12,
      marginTop: 8,
      borderTopWidth: 1,
    },
    totalLabel: {
      fontSize: 14,
      fontWeight: '600',
    },
    totalValue: {
      fontSize: 14,
      fontWeight: '700',
    },
  });

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

  return (
    <View style={styles.containerWrapper}>
      {/* Profile Button */}
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
              {employeeNumber || ''}
            </Text>
            <Text style={[styles.employeeNameText, { color: theme.text }]}>
              {employeeName || ''}
            </Text>
          </View>
          <Image
            source={require('../../../asset/img/icon/a-avatar.png')}
            style={[
              styles.avatarStyle,
              { 
                tintColor: theme.text,
                backgroundColor: theme.border,
                padding: 8,
              }
            ]}
          />
        </View>
      </TouchableOpacity>

      {/* Main Content with Horizontal Scroll */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Timesheet Page */}
        <View style={[styles.page]}>
          <DashboardView />
        </View>

        {/* Dashboard Page */}
        <View style={[styles.page]}>
          <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.buttonContainer}>
              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.squareButton, { backgroundColor: theme.card }]}
                  onPress={() => handleButtonPress('payslip')}
                >
                  <View style={styles.iconTextContainer}>
                    <Image 
                      source={require('../../../asset/img/icon/gongzidan.png')} 
                      style={[styles.iconImage, { tintColor: theme.primary }]} 
                    />
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
                    <Image 
                      source={require('../../../asset/img/icon/leave2.png')} 
                      style={[styles.iconImage, { tintColor: theme.primary }]} 
                    />
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
                    <Image 
                      source={require('../../../asset/img/icon/noticeboard.png')} 
                      style={[styles.iconImage, { tintColor: theme.primary }]} 
                    />
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
                    <Image 
                      source={require('../../../asset/img/icon/attendance.png')} 
                      style={[styles.iconImage, { tintColor: theme.primary }]} 
                    />
                    <Text style={[styles.squareButtonText, { color: theme.text }]}>
                      {getLocalizedText('attendance')}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.buttonRow}>
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
                <TouchableOpacity
                  style={[styles.squareButton, styles.logoutButtonStyle, { backgroundColor: theme.card }]}
                  onPress={handleLogout}
                >
                  <View style={styles.iconTextContainer}>
                    <Image 
                      source={require('../../../asset/img/icon/tuichu.png')} 
                      style={[styles.iconImage, { tintColor: theme.error }]} 
                    />
                    <Text style={[styles.squareButtonText, { color: theme.error }]}>{getLocalizedText('logOut')}</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Page Indicator */}
      <View style={styles.pageIndicator}>
        {[0, 1].map((index) => (
          <View
            key={index}
            style={[
              styles.dot,
              {
                backgroundColor: activeIndex === index ? theme.primary : theme.border,
              },
            ]}
          />
        ))}
      </View>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onDismiss={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />

      {/* Bottom Menu Bar */}
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
    </View>
  );
};

export default EmployeeMenu;