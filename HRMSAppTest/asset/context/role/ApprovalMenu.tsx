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
}

const ApprovalMenu = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [loggedIn, setLoggedIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [baseUrl, setBaseUrl] = useState<string | null>(null);
  
  // Add states for employee data
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [employeeNumber, setEmployeeNumber] = useState<string | null>(null);
  const [employeeName, setEmployeeName] = useState<string | null>(null);

  // First define getLocalizedText
  const getLocalizedText = (key: string) => {
    const translations = {
      'en': {
        dashboard: 'Dashboard',
        schedule: 'Schedule',
        workHours: 'Work Hours',
        timeIn: 'Time In',
        timeOut: 'Time Out',
        status: 'Status',
        absent: 'Absent',
        present: 'Present',
        outstation: 'Outstation',
        oddClocking: 'Odd Clocking',
        onLeave: 'On Leave',
        loading: 'Loading...',
        errorLoading: 'Error loading timesheet',
        payslip: 'Payslip',
        leave: 'Leave',
        noticeBoard: 'Notice Board',
        attendance: 'Attendance',
        button5: 'Approvals',
        settings: 'Settings',
        logOut: 'Log Out',
        scheduleCode: 'Schedule Code',
        scheduleDesc: 'Description',
        typeOfDay: 'Type of Day',
        workingHours: 'Working Hours',
        lateIn: 'Late In',
        earlyIn: 'Early In',
        earlyOut: 'Early Out',
        lateOut: 'Late Out',
        logOutConfirm: 'Are you sure you want to log out?',
        cancel: 'Cancel',
        ok: 'OK',
        timesheet: 'Timesheet',
        Description: 'Description',
        clockInNow: 'Clock In Now',
      },
      'zh-Hans': {
        dashboard: '仪表板',
        schedule: '日程',
        workHours: '工作时间',
        timeIn: '上班时间',
        timeOut: '下班时间',
        status: '状态',
        absent: '缺勤',
        present: '出勤',
        outstation: '外勤',
        oddClocking: '加班',
        onLeave: '请假',
        loading: '加载中...',
        errorLoading: '加载时间表错误',
        payslip: '工资单',
        leave: '休假',
        noticeBoard: '公告栏',
        attendance: '考勤',
        button5: '审批',
        settings: '设置',
        logOut: '登出',
        scheduleCode: '班次代码',
        scheduleDesc: '描述',
        typeOfDay: '日期类型',
        workingHours: '工作时间',
        lateIn: '迟到',
        earlyIn: '提早到',
        earlyOut: '早退',
        lateOut: '迟退',
        logOutConfirm: '确定要登出吗？',
        cancel: '取消',
        ok: '确定',
        timesheet: '时间表',
        Description: '描述',
        clockInNow: '现在打卡',
      },
      'zh-Hant': {
        dashboard: '儀表板',
        schedule: '日程',
        workHours: '工作時間',
        timeIn: '上班時間',
        timeOut: '下班時間',
        status: '狀態',
        absent: '缺勤',
        present: '出勤',
        outstation: '外勤',
        oddClocking: '加班',
        onLeave: '請假',
        loading: '加載中...',
        errorLoading: '加載時間表錯誤',
        payslip: '工資單',
        leave: '休假',
        noticeBoard: '公告欄',
        attendance: '考勤',
        button5: '審批',
        settings: '設置',
        logOut: '登出',
        scheduleCode: '班次代碼',
        scheduleDesc: '描述',
        typeOfDay: '日期類型',
        workingHours: '工作時間',
        lateIn: '遲到',
        earlyIn: '提早到',
        earlyOut: '早退',
        lateOut: '遲退',
        logOutConfirm: '確定要登出嗎？',
        cancel: '取消',
        ok: '確定',
        timesheet: '時間表',
        Description: '描述',
        clockInNow: '現在打卡',
      },
      'ms': {
        dashboard: 'Papan Pemuka',
        schedule: '日程',
        workHours: 'Waktu Kerja',
        timeIn: 'Masa Masuk',
        timeOut: 'Masa Keluar',
        status: 'Status',
        absent: 'Tidak Hadir',
        present: 'Hadir',
        outstation: 'Luar Stesen',
        oddClocking: 'Perakaman Ganjil',
        onLeave: 'Cuti',
        loading: 'Memuat...',
        errorLoading: 'Ralat memuat jadual waktu',
        payslip: 'Slip Gaji',
        leave: 'Cuti',
        noticeBoard: 'Papan Notis',
        attendance: 'Kehadiran',
        button5: 'Kelulusan',
        settings: 'Tetapan',
        logOut: 'Log Keluar',
        scheduleCode: 'Kod Jadual',
        scheduleDesc: 'Keterangan',
        typeOfDay: 'Jenis Hari',
        workingHours: 'Waktu Kerja',
        lateIn: 'Lewat Masuk',
        earlyIn: 'Awal Masuk',
        earlyOut: 'Awal Keluar',
        lateOut: 'Lewat Keluar',
        logOutConfirm: 'Adakah anda pasti mahu log keluar?',
        cancel: 'Batal',
        ok: 'OK',
        timesheet: 'Jadual Waktu',
        Description: 'Keterangan',
        clockInNow: 'Daftar Masuk Sekarang',
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
  const [activeTab, setActiveTab] = useState('timesheet');
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
  const handleLogout = () => {
    showAlert(
      getLocalizedText('logOut'),
      getLocalizedText('logOutConfirm'),
      [
        {
          text: getLocalizedText('cancel'),
          style: 'cancel',
          onPress: () => setAlertConfig(prev => ({ ...prev, visible: false }))
        },
        {
          text: getLocalizedText('ok'),
          onPress: async () => {
            try {
              setIsLoading(true);
              const userToken = await AsyncStorage.getItem('userToken');
              const refreshToken = await AsyncStorage.getItem('refreshToken');
              const baseUrl = await AsyncStorage.getItem('baseUrl');

              if (baseUrl && userToken && refreshToken) {
                const response = await fetch(`${baseUrl}/apps/api/v1/auth/logout`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                  },
                  body: JSON.stringify({ refreshToken })
                });
              }

              const scannedData = await AsyncStorage.getItem('scannedData');
              const themePreference = await AsyncStorage.getItem('themePreference');
              
              const keys = await AsyncStorage.getAllKeys();
              const keysToRemove = keys.filter(key => 
                key !== 'baseUrl' && 
                key !== 'scannedData' &&
                key !== 'themePreference'
              );
              
              await AsyncStorage.multiRemove(keysToRemove);
              
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
              showAlert(getLocalizedText('error'), getLocalizedText('failedLogout'));
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timesheet, setTimesheet] = useState<Timesheet | null>(null);

  const fetchTimesheet = async () => {
    setIsLoading(true);
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      
      // Format date to YYYY-MM-DDT00:00:00Z
      const formattedDate = selectedDate.toISOString().split('T')[0] + 'T00:00:00Z';
      
      console.log('Fetching timesheet with formatted date:', formattedDate);

      const response = await fetch(
        `${baseUrl}/apps/api/v1/employees/${employeeId}/timesheet/${formattedDate}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      
      const data = await response.json();
      console.log('Timesheet API Response:', {
        success: data.success,
        timesheet: data.data?.timesheet,
        fullResponse: data
      });

      if (data.success) {
        setTimesheet(data.data.timesheet);
        console.log('Updated timesheet state:', data.data.timesheet);
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
    console.log('useEffect triggered with:', {
      hasBaseUrl: !!baseUrl,
      hasEmployeeId: !!employeeId,
      selectedDate: selectedDate.toISOString()
    });

    if (baseUrl && employeeId) {
      fetchTimesheet();
    }
  }, [selectedDate, baseUrl, employeeId]);

  const DashboardView = () => {
    console.log('Rendering DashboardView with timesheet:', timesheet);
    
    const [showDatePicker, setShowDatePicker] = useState(false);

    const onDateChange = (event: any, selectedDate?: Date) => {
      setShowDatePicker(false);
      if (selectedDate && event.type !== 'dismissed') {
        setSelectedDate(selectedDate);
        fetchTimesheet();
      }
    };

    return (
      <View style={[styles.dashboardCard, { backgroundColor: theme.card }]}>
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
            <View style={styles.scheduleCard}>
              <View style={styles.scheduleRow}>
                <Text style={[styles.scheduleLabel, { color: theme.subText }]}>
                  {getLocalizedText('scheduleCode')}
                </Text>
                <Text style={[styles.scheduleValue, { color: theme.text }]}>
                  {timesheet.scheduleCode || '--'}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.scheduleRow}>
                <Text style={[styles.scheduleLabel, { color: theme.subText }]}>
                  {getLocalizedText('Description')}
                </Text>
                <Text style={[styles.scheduleValue, { color: theme.text }]}>
                  {timesheet.scheduleDescription || '--'}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.scheduleRow}>
                <Text style={[styles.scheduleLabel, { color: theme.subText }]}>
                  {getLocalizedText('typeOfDay')}
                </Text>
                <Text style={[styles.scheduleValue, { color: theme.text }]}>
                  {getTypeOfDayText(timesheet.typeOfDay)}
                </Text>
              </View>
            </View>

            <View style={styles.timeContainer}>
              <View style={[styles.timeBox, { backgroundColor: theme.background }]}>
                <Text style={[styles.timeLabel, { color: theme.subText }]}>
                  {getLocalizedText('timeIn')}
                </Text>
                <Text style={[styles.timeValue, { color: theme.text }]}>
                  {timesheet.scheduleIn || '00:00:00'}
                </Text>
              </View>
              <View style={[styles.timeBox, { backgroundColor: theme.background }]}>
                <Text style={[styles.timeLabel, { color: theme.subText }]}>
                  {getLocalizedText('timeOut')}
                </Text>
                <Text style={[styles.timeValue, { color: theme.text }]}>
                  {timesheet.scheduleOut || '00:00:00'}
                </Text>
              </View>
            </View>

            <View style={styles.workingHoursSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {getLocalizedText('workingHours')}
              </Text>
              <View style={[styles.workingHoursBox, { backgroundColor: theme.background }]}>
                <Text style={[styles.hourValue, { color: theme.text }]}>
                  {timesheet?.workHour || '00:00:00'}
                </Text>
              </View>

              <View style={styles.statusContainer}>
                <View style={styles.timeRow}>
                  <View style={[styles.hourBox, { backgroundColor: theme.background }]}>
                    <Text style={[styles.hourLabel, { color: theme.subText }]}>
                      {getLocalizedText('earlyIn')}
                    </Text>
                    <Text style={[styles.hourValue, { color: '#4CAF50' }]}>
                      {timesheet?.earlyIn || '00:00:00'}
                    </Text>
                  </View>
                  <View style={[styles.hourBox, { backgroundColor: theme.background }]}>
                    <Text style={[styles.hourLabel, { color: theme.subText }]}>
                      {getLocalizedText('lateIn')}
                    </Text>
                    <Text style={[styles.hourValue, { color: '#F44336' }]}>
                      {timesheet?.lateIn || '00:00:00'}
                    </Text>
                  </View>
                </View>
                <View style={styles.timeRow}>
                  <View style={[styles.hourBox, { backgroundColor: theme.background }]}>
                    <Text style={[styles.hourLabel, { color: theme.subText }]}>
                      {getLocalizedText('earlyOut')}
                    </Text>
                    <Text style={[styles.hourValue, { color: '#FFC107' }]}>
                      {timesheet?.earlyOut || '00:00:00'}
                    </Text>
                  </View>
                  <View style={[styles.hourBox, { backgroundColor: theme.background }]}>
                    <Text style={[styles.hourLabel, { color: theme.subText }]}>
                      {getLocalizedText('lateOut')}
                    </Text>
                    <Text style={[styles.hourValue, { color: '#F44336' }]}>
                      {timesheet?.lateOut || '00:00:00'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {timesheet?.scheduleIn === '00:00:00' && timesheet?.scheduleOut === '00:00:00' && (
              <TouchableOpacity 
                style={styles.clockInButton}
                onPress={handleClockInPress}
              >
                <Text style={styles.clockInButtonText}>
                  {getLocalizedText('clockInNow')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <Text style={[styles.errorText, { color: theme.error }]}>
            {getLocalizedText('errorLoading')}
          </Text>
        )}
      </View>
    );
  };

  const getTypeOfDayText = (typeOfDay: string) => {
    switch (typeOfDay) {
      case 'P':
        return 'Public Holiday';
      case 'W':
        return 'Work Day';
      default:
        return typeOfDay || '--';
    }
  };

  const handleClockInPress = async () => {
    setIsLoading(true);
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const response = await fetch(
        `${baseUrl}/apps/api/v1/employees/${employeeId}/clock-in`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            date: selectedDate.toISOString(),
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        showAlert(
          getLocalizedText('success'),
          getLocalizedText('clockInSuccess')
        );
        // Refresh timesheet data after successful clock in
        fetchTimesheet();
      } else {
        showAlert(
          getLocalizedText('error'),
          data.message || getLocalizedText('clockInFailed')
        );
      }
    } catch (error) {
      console.error('Clock in error:', error);
      showAlert(
        getLocalizedText('error'),
        getLocalizedText('clockInFailed')
      );
    } finally {
      setIsLoading(false);
    }
  };

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
      marginBottom: 24,
    },
    dateArrowButton: {
      padding: 8,
    },
    dateArrow: {
      width: 24,
      height: 24,
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
      backgroundColor: 'rgba(255,255,255,0.05)',
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
    },
    scheduleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 6,
    },
    scheduleLabel: {
      fontSize: 13,
    },
    scheduleValue: {
      fontSize: 13,
      fontWeight: '500',
    },
    divider: {
      height: 1,
      backgroundColor: 'rgba(0,0,0,0.1)',
      marginVertical: 6,
    },
    timeContainer: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 12,
    },
    timeBox: {
      flex: 1,
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
    },
    timeLabel: {
      fontSize: 13,
      marginBottom: 6,
    },
    timeValue: {
      fontSize: 20,
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
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
      marginBottom: 12,
    },
    statusContainer: {
      gap: 8,
    },
    timeRow: {
      flexDirection: 'row',
      gap: 8,
    },
    hourBox: {
      flex: 1,
      borderRadius: 8,
      padding: 8,
      alignItems: 'center',
    },
    hourLabel: {
      fontSize: 11,
      marginBottom: 3,
    },
    hourValue: {
      fontSize: 14,
      fontWeight: '600',
    },
    errorText: {
      textAlign: 'center',
      fontSize: 14,
    },
    dateButton: {
      padding: 8,
      borderRadius: 8,
      backgroundColor: 'rgba(0,0,0,0.05)',
      minWidth: 100,
      alignItems: 'center',
    },
    datePicker: {
      backgroundColor: 'white',
    },
    bottomMenu: {
      flexDirection: 'row',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 60,
      borderTopWidth: 1,
      borderTopColor: 'rgba(0, 0, 0, 0.05)',
      backgroundColor: theme.card,
      elevation: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    menuItem: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 8,
    },
    activeMenuItem: {
      borderTopWidth: 2,
      borderTopColor: theme.primary,
    },
    menuIcon: {
      width: 24,
      height: 24,
      marginBottom: 4,
      resizeMode: 'contain',
    },
    menuText: {
      fontSize: 12,
      fontWeight: '500',
      textAlign: 'center',
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
  });

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
                  onPress={() => {
                    if (employeeId && baseUrl) {
                      navigation.navigate('Payslip', { baseUrl, employeeId });
                    }
                  }}
                >
                  <View style={styles.iconTextContainer}>
                    <Image source={require('../../img/icon/gongzidan.png')} style={[styles.iconImage, { tintColor: theme.primary }]} />
                    <Text style={[styles.squareButtonText, { color: theme.text }]}>{getLocalizedText('payslip')}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.squareButton, { backgroundColor: theme.card }]}
                  onPress={() => {
                    if (employeeId && baseUrl) {
                      navigation.navigate('LeaveMenu', { baseUrl, employeeId });
                    }
                  }}
                >
                  <View style={styles.iconTextContainer}>
                    <Image source={require('../../img/icon/leave2.png')} style={[styles.iconImage, { tintColor: theme.primary }]} />
                    <Text style={[styles.squareButtonText, { color: theme.text }]}>{getLocalizedText('leave')}</Text>
                  </View>
                </TouchableOpacity>
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[styles.squareButton, { backgroundColor: theme.card }]}
                  onPress={() => {
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
                  }}
                >
                  <View style={styles.iconTextContainer}>
                    <Image source={require('../../img/icon/noticeboard.png')} style={[styles.iconImage, { tintColor: theme.primary }]} />
                    <Text style={[styles.squareButtonText, { color: theme.text }]}>{getLocalizedText('noticeBoard')}</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.squareButton, { backgroundColor: theme.card }]}
                  onPress={() => {
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
                  }}
                >
                  <View style={styles.iconTextContainer}>
                    <Image source={require('../../img/icon/attendance.png')} style={[styles.iconImage, { tintColor: theme.primary }]} />
                    <Text style={[styles.squareButtonText, { color: theme.text }]}>{getLocalizedText('attendance')}</Text>
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
                      {getLocalizedText('button5')}
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

      <View style={[styles.bottomMenu, { backgroundColor: theme.card }]}>
        <TouchableOpacity 
          style={[styles.menuItem, activeTab === 'timesheet' && styles.activeMenuItem]}
          onPress={() => {
            setActiveTab('timesheet');
            scrollViewRef.current?.scrollTo({ x: 0, animated: true });
          }}
        >
          <Image
            source={require('../../../asset/img/icon/timesheet.png')}
            style={[styles.menuIcon, { tintColor: activeTab === 'timesheet' ? theme.primary : theme.subText }]}
          />
          <Text style={[styles.menuText, { color: activeTab === 'timesheet' ? theme.primary : theme.subText }]}>
            {getLocalizedText('timesheet')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.menuItem, activeTab === 'dashboard' && styles.activeMenuItem]}
          onPress={() => {
            setActiveTab('dashboard');
            scrollViewRef.current?.scrollTo({ x: screenWidth, animated: true });
          }}
        >
          <Image
            source={require('../../../asset/img/icon/dashboard.png')}
            style={[styles.menuIcon, { tintColor: activeTab === 'dashboard' ? theme.primary : theme.subText }]}
          />
          <Text style={[styles.menuText, { color: activeTab === 'dashboard' ? theme.primary : theme.subText }]}>
            {getLocalizedText('dashboard')}
          </Text>
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
