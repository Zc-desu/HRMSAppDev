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
  const [activeTab, setActiveTab] = useState('timesheet');
  const screenWidth = Dimensions.get('window').width;

  // Extract companyId, baseUrl, and decodedToken from route params
  const { companyId, baseUrl: passedBaseUrl, decodedToken } = route.params;

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
    switch (language) {
      case 'ms':
        return {
          error: 'Ralat',
          baseUrlUnavailable: 'URL asas tidak tersedia',
          employeeIdUnavailable: 'ID pekerja tidak tersedia',
          logOut: 'Log Keluar',
          logOutConfirm: 'Adakah anda pasti mahu log keluar?',
          cancel: 'Batal',
          ok: 'OK',
          payslip: 'Slip Gaji',
          leave: 'Cuti',
          noticeBoard: 'Papan Notis',
          failedLogout: 'Gagal log keluar',
          companyIdUnavailable: 'ID syarikat tidak tersedia',
          attendance: 'Kehadiran',
          settings: 'Tetapan',
          dashboard: 'Papan Pemuka',
          scheduleCode: 'Kod Jadual',
          scheduleDesc: 'Keterangan',
          typeOfDay: 'Jenis Hari',
          workingHours: 'Waktu Kerja',
          timeIn: 'Masa Masuk',
          timeOut: 'Masa Keluar',
          earlyIn: 'Awal Masuk',
          lateIn: 'Lewat Masuk',
          earlyOut: 'Awal Keluar',
          lateOut: 'Lewat Keluar',
          errorLoading: 'Ralat memuatkan jadual waktu',
          timesheet: 'Jadual Waktu',
          clockInNow: 'Daftar Masuk Sekarang',
          description: 'Keterangan',
        }[key] || key;
      
      case 'zh-Hans':
        return {
          error: '错误',
          baseUrlUnavailable: '基本URL不可用',
          employeeIdUnavailable: '员工ID不可用',
          logOut: '登出',
          logOutConfirm: '您确定要登出吗？',
          cancel: '取消',
          ok: '确定',
          payslip: '工资单',
          leave: '请假',
          noticeBoard: '公告板',
          failedLogout: '登出失败',
          companyIdUnavailable: '公司ID不可用',
          attendance: '考勤',
          settings: '设置',
          dashboard: '仪表板',
          scheduleCode: '班次代码',
          scheduleDesc: '描述',
          typeOfDay: '日期类型',
          workingHours: '工作时间',
          timeIn: '上班时间',
          timeOut: '下班时间',
          earlyIn: '提早到达',
          lateIn: '迟到',
          earlyOut: '提早离开',
          lateOut: '迟离',
          errorLoading: '加载时间表错误',
          timesheet: '时间表',
          clockInNow: '立即打卡',
          description: '描述',
        }[key] || key;
      
      case 'zh-Hant':
        return {
          error: '錯誤',
          baseUrlUnavailable: '基本URL不可用',
          employeeIdUnavailable: '員工ID不可用',
          logOut: '登出',
          logOutConfirm: '您確定要登出嗎？',
          cancel: '取消',
          ok: '確定',
          payslip: '工資單',
          leave: '請假',
          noticeBoard: '公告板',
          failedLogout: '登出失敗',
          companyIdUnavailable: '公司ID不可用',
          attendance: '考勤',
          settings: '設置',
          dashboard: '儀表板',
          scheduleCode: '班次代碼',
          scheduleDesc: '描述',
          typeOfDay: '日期類型',
          workingHours: '工作時間',
          timeIn: '上班時間',
          timeOut: '下班時間',
          earlyIn: '提早到達',
          lateIn: '遲到',
          earlyOut: '提早離開',
          lateOut: '遲離',
          errorLoading: '加載時間表錯誤',
          timesheet: '時間表',
          clockInNow: '立即打卡',
          description: '描述',
        }[key] || key;
      
      default: // 'en'
        return {
          error: 'Error',
          baseUrlUnavailable: 'Base URL is not available',
          employeeIdUnavailable: 'Employee ID is not available',
          logOut: 'Log Out',
          logOutConfirm: 'Are you sure you want to log out?',
          cancel: 'Cancel',
          ok: 'OK',
          payslip: 'Payslip',
          leave: 'Leave',
          noticeBoard: 'Notice Board',
          failedLogout: 'Failed to log out',
          companyIdUnavailable: 'Company ID is not available',
          attendance: 'Attendance',
          settings: 'Settings',
          dashboard: 'Dashboard',
          scheduleCode: 'Schedule Code',
          scheduleDesc: 'Description',
          typeOfDay: 'Type of Day',
          workingHours: 'Working Hours',
          timeIn: 'Time In',
          timeOut: 'Time Out',
          earlyIn: 'Early In',
          lateIn: 'Late In',
          earlyOut: 'Early Out',
          lateOut: 'Late Out',
          errorLoading: 'Error loading timesheet',
          timesheet: 'Timesheet',
          clockInNow: 'Clock In Now',
          description: 'Description',
        }[key] || key;
    }
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

              // Call logout API
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

              // Store necessary data
              const scannedData = await AsyncStorage.getItem('scannedData');
              const themePreference = await AsyncStorage.getItem('themePreference');
              
              // Get all keys and filter out the ones we want to keep
              const keys = await AsyncStorage.getAllKeys();
              const keysToRemove = keys.filter(key => 
                key !== 'baseUrl' && 
                key !== 'scannedData' &&
                key !== 'themePreference'
              );
              
              // Remove auth-related items including decodedToken
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
        console.log('EmployeeMenu - Route params userId:', route.params?.userId);
        if (route.params?.userId) {
          setUserId(route.params.userId.toString());
          await AsyncStorage.setItem('userId', route.params.userId.toString());
          console.log('EmployeeMenu - Stored userId from params:', route.params.userId);
        } else {
          // Fallback to AsyncStorage
          const storedUserId = await AsyncStorage.getItem('userId');
          console.log('EmployeeMenu - Retrieved userId from storage:', storedUserId);
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
    console.log('\n=== Dashboard Debug Info ===');
    
    // Format date to always use 00:00:00Z
    const formattedDate = new Date(selectedDate)
      .toISOString()
      .split('T')[0] + 'T00:00:00Z';

    console.log('Request Parameters:', {
      baseUrl,
      employeeId,
      originalDate: selectedDate.toISOString(),
      formattedDate: formattedDate // This should now always end with T00:00:00Z
    });

    setIsLoading(true);
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const requestUrl = `${baseUrl}/apps/api/v1/employees/${employeeId}/timesheet/${formattedDate}`;
      
      console.log('Request URL:', requestUrl);
      console.log('Auth Token Status:', userToken ? 'Present' : 'Missing');

      const response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
      });
      
      const data = await response.json();
      
      // Add detailed response logging
      console.log('Raw API Response:', JSON.stringify(data, null, 2));
      console.log('Response Status:', response.status);
      console.log('Timesheet Data Check:', {
        hasData: !!data.data,
        hasTimesheet: !!data.data?.timesheet,
        scheduleIn: data.data?.timesheet?.scheduleIn,
        scheduleOut: data.data?.timesheet?.scheduleOut,
        workHour: data.data?.timesheet?.workHour
      });

      if (data.success && data.data?.timesheet) {
        const timesheetData = data.data.timesheet;
        console.log('Setting Timesheet State:', {
          scheduleIn: timesheetData.scheduleIn,
          scheduleOut: timesheetData.scheduleOut,
          workHour: timesheetData.workHour,
          scheduleCode: timesheetData.scheduleCode,
          typeOfDay: timesheetData.typeOfDay
        });
        
        setTimesheet(timesheetData);
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
      // Add final state check
      console.log('Final Timesheet State:', {
        hasTimesheet: !!timesheet,
        scheduleIn: timesheet?.scheduleIn || '00:00:00',
        scheduleOut: timesheet?.scheduleOut || '00:00:00',
        workHour: timesheet?.workHour || '00:00:00'
      });
      console.log('=== End Dashboard Debug Info ===\n');
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

  // Add DashboardView component
  const DashboardView = () => {
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
                  {getLocalizedText('description')}
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
                  {timesheet.typeOfDay || '--'}
                </Text>
              </View>
            </View>

            {/* Time In/Out */}
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

            {/* Working Hours */}
            <View style={styles.workingHoursSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {getLocalizedText('workingHours')}
              </Text>
              <View style={[styles.workingHoursBox, { backgroundColor: theme.background }]}>
                <Text style={[styles.hourValue, { color: theme.text }]}>
                  {timesheet?.workHour || '00:00:00'}
                </Text>
              </View>

              {/* Status Times with reduced spacing */}
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

            {/* Clock In Button */}
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

  // Add swipe handler
  const handleScroll = (event: any) => {
    const contentOffset = event.nativeEvent.contentOffset.x;
    setActiveTab(contentOffset > screenWidth / 2 ? 'dashboard' : 'timesheet');
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
      padding: 16,
      paddingTop: 0,
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
      backgroundColor: theme.background,
      borderRadius: 16,
      padding: 12,
      marginBottom: 8,
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
      backgroundColor: 'rgba(255,255,255,0.1)',
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
      fontWeight: '600',
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
      backgroundColor: theme.background,
      borderRadius: 12,
      padding: 10,
      marginBottom: 8,
      alignItems: 'center',
    },
    workingHoursLabel: {
      fontSize: 14,
      marginBottom: 8,
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
      gap: 4,
      marginBottom: 0,
    },
    statusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 8,
    },
    statusBox: {
      flex: 1,
      backgroundColor: '#1E1E1E',
      borderRadius: 8,
      padding: 8,
      marginVertical: 4,
      alignItems: 'center',
    },
    statusLabel: {
      fontSize: 12,
      marginBottom: 4,
    },
    statusValue: {
      fontSize: 16,
      fontWeight: '600',
    },
    bottomMenu: {
      flexDirection: 'row',
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: 60,
      borderTopWidth: 1,
      borderTopColor: 'rgba(0,0,0,0.1)',
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
    },
    menuText: {
      fontSize: 12,
      fontWeight: '500',
    },
    clockInButton: {
      backgroundColor: '#007AFF',
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
      marginTop: 0,
      width: '100%',
    },
    clockInButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    bottomTabContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      paddingVertical: 10,
      backgroundColor: theme.card,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    scheduleSection: {
      backgroundColor: '#1E1E1E',
      borderRadius: 8,
      padding: 12,
      marginBottom: 16,
    },
    hoursGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 16,
    },
  });

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
                  onPress={() => navigation.navigate('Payslip', { baseUrl, employeeId })}
                >
                  <View style={styles.iconTextContainer}>
                    <Image 
                      source={require('../../../asset/img/icon/gongzidan.png')} 
                      style={[styles.iconImage, { tintColor: theme.primary }]} 
                    />
                    <Text style={[styles.squareButtonText, { color: theme.text }]}>{getLocalizedText('payslip')}</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.squareButton, { backgroundColor: theme.card }]}
                  onPress={() => {
                    console.log('EmployeeMenu - Navigating to LeaveMenu with userId:', userId);
                    navigation.navigate('LeaveMenu', { 
                      baseUrl, 
                      employeeId,
                      userId 
                    });
                  }}
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
                  onPress={() => {
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
                  }}
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
                  onPress={() => {
                    const companyIdToUse = companyId || decodedToken?.decodedPayload?.company_id;
                    if (!companyIdToUse) {
                      showAlert(getLocalizedText('error'), getLocalizedText('companyIdUnavailable'));
                      return;
                    }
                    navigation.navigate('ATMenu', {
                      employeeId: employeeId,
                      companyId: companyIdToUse,
                      baseUrl: baseUrl
                    });
                  }}
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
    </View>
  );
};

export default EmployeeMenu;