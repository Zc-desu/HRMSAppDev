import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../modules/setting/ThemeContext';
import { useLanguage } from '../modules/setting/LanguageContext';
import CustomAlert from '../modules/setting/CustomAlert';

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
        }[key] || key;
    }
  };

  // Extract companyId, baseUrl, and decodedToken from route params
  const { companyId, baseUrl: passedBaseUrl, decodedToken } = route.params;
  const [loggedIn, setLoggedIn] = useState(true);
  const [baseUrl, setBaseUrl] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);

  // Destructure employee details from the decoded token if available
  const employeeName = decodedToken?.decodedPayload?.employee_name;
  const employeeNumber = decodedToken?.decodedPayload?.employee_number;

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

      const storedEmployeeId = decodedToken?.decodedPayload?.employee_id
        || await AsyncStorage.getItem('employeeId');

      if (storedEmployeeId) {
        setEmployeeId(storedEmployeeId);
      } else {
        showAlert(getLocalizedText('error'), getLocalizedText('employeeIdUnavailable'));
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
          onPress: () => setAlertConfig(prev => ({ ...prev, visible: false })),
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
              const response = await fetch(`${baseUrl}/apps/api/v1/auth/logout`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify({ refreshToken })
              });

              // Proceed with logout regardless of API response
              setLoggedIn(false);
              
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
              
              // Remove auth-related items
              await AsyncStorage.multiRemove(keysToRemove);
              
              // Reset navigation stack
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

  return (
    <ScrollView 
      contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
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
              <Text style={[styles.employeeNoText, { color: theme.subText }]}>{employeeNumber}</Text>
              <Text style={[styles.employeeNameText, { color: theme.text }]}>{employeeName}</Text>
            </View>
            <Image 
              source={require('../../../asset/img/icon/a-avatar.png')} 
              style={[
                styles.avatarStyle,
                { tintColor: theme.background === '#000000' ? '#FFFFFF' : undefined }
              ]}
            />
          </View>
        </TouchableOpacity>

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
            onPress={() => navigation.navigate('LeaveMenu', { baseUrl, employeeId })}
          >
            <View style={styles.iconTextContainer}>
              <Image 
                source={require('../../../asset/img/icon/leave2.png')} 
                style={[styles.iconImage, { tintColor: theme.primary }]} 
              />
              <Text style={[styles.squareButtonText, { color: theme.text }]}>{getLocalizedText('leave')}</Text>
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
          <TouchableOpacity style={[styles.squareButton, { backgroundColor: theme.card }]}>
            <Text style={[styles.squareButtonText, { color: theme.text }]}>Button 5</Text>
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

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onDismiss={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  viewDetailButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
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
    color: '#666',
    marginBottom: 8,
  },
  employeeNameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
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
    backgroundColor: '#FFFFFF',
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
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  iconTextContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  iconImage: {
    width: 40,
    height: 40,
    marginBottom: 8,
    tintColor: '#007AFF',
  },
  logoutButtonStyle: {
    backgroundColor: '#FFF0F0', // Light red background
  },
});

export default EmployeeMenu;