import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../modules/setting/ThemeContext';
import { useLanguage } from '../modules/setting/LanguageContext';
import { useFocusEffect } from '@react-navigation/native';
import CustomAlert from '../modules/setting/CustomAlert';

const ApprovalMenu = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [loggedIn, setLoggedIn] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const fadeAnim = new Animated.Value(0);
  const [baseUrl, setBaseUrl] = useState<string | null>(null);
  
  // Add states for employee data
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [employeeNumber, setEmployeeNumber] = useState<string | null>(null);
  const [employeeName, setEmployeeName] = useState<string | null>(null);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title?: string;
    message?: string;
    buttons?: Array<{
      text: string;
      style?: "default" | "cancel" | "destructive";
      onPress?: () => void;
    }>;
  }>({ visible: false });

  useEffect(() => {
    const loadBaseUrl = async () => {
      const url = await AsyncStorage.getItem('baseUrl');
      setBaseUrl(url);
    };
    loadBaseUrl();
  }, []);

  const showAlert = (title: string, message: string, buttons?: Array<any>) => {
    setAlertConfig({
      visible: true,
      title,
      message,
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

  // Update translations first
  const getLocalizedText = (key: string) => {
    const translations: {[key: string]: {[key: string]: string}} = {
      en: {
        ok: 'OK',
        cancel: 'Cancel',
        error: 'Error',
        logOut: 'Log Out',
        logOutConfirm: 'Are you sure you want to log out?',
        failedLogout: 'Failed to log out',
        employeeIdUnavailable: 'Employee ID not available',
        companyIdUnavailable: 'Company ID not available',
        payslip: 'Payslip',
        leave: 'Leave',
        noticeBoard: 'Notice Board',
        attendance: 'Attendance',
        button5: 'Approval'
      },
      'zh-Hans': {
        ok: '确定',
        cancel: '取消',
        error: '错误',
        logOut: '退出登录',
        logOutConfirm: '确定要退出登录吗？',
        failedLogout: '退出登录失败',
        employeeIdUnavailable: '员工ID不可用',
        companyIdUnavailable: '公司ID不可用',
        payslip: '工资单',
        leave: '请假',
        noticeBoard: '公告栏',
        attendance: '考勤',
        button5: '审批'
      },
      'zh-Hant': {
        ok: '確定',
        cancel: '取消',
        error: '錯誤',
        logOut: '退出登錄',
        logOutConfirm: '確定要退出登錄嗎？',
        failedLogout: '退出登錄失敗',
        employeeIdUnavailable: '員工ID不可用',
        companyIdUnavailable: '公司ID不可用',
        payslip: '工資單',
        leave: '請假',
        noticeBoard: '公告欄',
        attendance: '考勤',
        button5: '審批'
      },
      ms: {
        ok: 'OK',
        cancel: 'Batal',
        error: 'Ralat',
        logOut: 'Log Keluar',
        logOutConfirm: 'Adakah anda pasti mahu log keluar?',
        failedLogout: 'Gagal log keluar',
        employeeIdUnavailable: 'ID Pekerja tidak tersedia',
        companyIdUnavailable: 'ID Syarikat tidak tersedia',
        payslip: 'Slip Gaji',
        leave: 'Cuti',
        noticeBoard: 'Papan Notis',
        attendance: 'Kehadiran',
        button5: 'Kelulusan'
      }
    };
    return translations[language]?.[key] || key;
  };

  // Update the return JSX
  return (
    <View style={styles.containerWrapper}>
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
        scrollEventThrottle={16}
      >
        <View>
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

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.squareButton, { backgroundColor: theme.card }]}
              onPress={() => {
                if (employeeId && baseUrl) {
                  navigation.navigate('Payslip', { baseUrl, employeeId });
                } else {
                  showAlert(getLocalizedText('error'), getLocalizedText('employeeIdUnavailable'));
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
                } else {
                  showAlert(getLocalizedText('error'), getLocalizedText('employeeIdUnavailable'));
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
              style={[styles.squareButton, styles.logoutButtonStyle, { backgroundColor: theme.card }]}
              onPress={handleLogout}
            >
              <View style={styles.iconTextContainer}>
                <Image 
                  source={require('../../img/icon/tuichu.png')} 
                  style={[styles.iconImage, { tintColor: theme.error }]} 
                />
                <Text style={[styles.squareButtonText, { color: theme.error }]}>{getLocalizedText('logOut')}</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title || ''}
        message={alertConfig.message || ''}
        buttons={alertConfig.buttons || []}
        onDismiss={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  containerWrapper: {
    flex: 1,
    position: 'relative',
  },
  container: {
    flexGrow: 1,
    padding: 16,
  },
  viewDetailButton: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 28,
    marginBottom: 20,
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
    width: 64,
    height: 64,
    borderRadius: 32,
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
    backgroundColor: '#FFF0F0',
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
});

export default ApprovalMenu;
