import React, { useState, useEffect } from 'react';
import { 
  Alert, 
  TextInput, 
  View, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  Text, 
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  useColorScheme,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingAnimation from '../anim/loadingAnimation';
import { lightTheme, darkTheme } from '../modules/setting/ChangeTheme';
import { useLanguage } from '../modules/setting/LanguageContext';
import CustomAlert from '../modules/setting/CustomAlert';

interface AlertButton {
  text: string;
  onPress: () => void;
}

interface AlertConfig {
  visible: boolean;
  title: string;
  message: string;
  buttons: AlertButton[];
}

const LoginScreen = ({ navigation }: any) => {
  const systemTheme = useColorScheme();
  const [currentTheme, setCurrentTheme] = useState<string>('system');
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { language } = useLanguage();
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
  });

  useEffect(() => {
    const loadScannedData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('scannedData');
        if (savedData) {
          setScannedData(savedData);
        }
      } catch (error) {
        console.error('Failed to load scanned data:', error);
      }
    };
    loadScannedData();
  }, []);

  useEffect(() => {
    loadThemePreference();
    const unsubscribe = navigation.addListener('focus', () => {
      loadThemePreference();
    });

    return unsubscribe;
  }, [navigation]);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('themePreference');
      if (savedTheme) {
        setCurrentTheme(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const getActiveTheme = () => {
    if (currentTheme === 'system') {
      return systemTheme === 'dark' ? darkTheme : lightTheme;
    }
    return currentTheme === 'dark' ? darkTheme : lightTheme;
  };

  const theme = getActiveTheme();

  useEffect(() => {
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
  }, [currentTheme, systemTheme]);

  const showAlert = (title: string, message: string, buttons: AlertButton[] = []) => {
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
          enterLoginId: 'Masukkan ID Log Masuk',
          enterPassword: 'Masukkan Kata Laluan',
          login: 'Log Masuk',
          scanQrCode: 'Imbas Kod QR',
          settings: 'Tetapan',
          error: 'Ralat',
          loginFailed: 'ID log masuk atau kata laluan tidak sah.',
          accessDenied: 'Akses Ditolak',
          loginSuccess: 'Log Masuk Berjaya',
          welcome: 'Selamat datang',
          qrRequired: 'Anda mesti mengimbas kod QR untuk mengesahkan. Sila hubungi Pentadbir HR anda',
          enterBoth: 'Sila masukkan kedua-dua ID log masuk dan kata laluan.',
          hrAdminBrowser: 'HR Admin hanya boleh menguruskan tugas melalui pelayar web.',
          youAreLoggedInAs: 'Anda log masuk sebagai',
          Employee: 'Pekerja',
          Approval: 'Kelulusan',
          ok: 'OK',
          somethingWrong: 'Sesuatu tidak kena. Sila cuba lagi.',
          failedFetchProfile: 'Gagal mendapatkan profil pengguna.',
        }[key] || key;
      
      case 'zh-Hans':
        return {
          enterLoginId: '输入登录ID',
          enterPassword: '输入密码',
          login: '登录',
          scanQrCode: '扫描二维码',
          settings: '设置',
          error: '错误',
          loginFailed: '登录ID或密码无效。',
          accessDenied: '拒绝访问',
          loginSuccess: '登录成功',
          welcome: '欢迎',
          qrRequired: '您必须扫描二维码进行身份验证。请联系您的人力资源管理员',
          enterBoth: '请输入登录ID和密码。',
          hrAdminBrowser: '人力资源管理员只能通过浏览器管理任务。',
          youAreLoggedInAs: '您已登录为',
          Employee: '员工',
          Approval: '审批',
          ok: '确定',
          somethingWrong: '出现错误。请重试。',
          failedFetchProfile: '获取用户资料失败。',
        }[key] || key;
      
      case 'zh-Hant':
        return {
          enterLoginId: '輸入登錄ID',
          enterPassword: '輸入密碼',
          login: '登錄',
          scanQrCode: '掃描二維碼',
          settings: '設置',
          error: '錯誤',
          loginFailed: '登錄ID或密碼無效。',
          accessDenied: '拒絕訪問',
          loginSuccess: '登錄成功',
          welcome: '歡迎',
          qrRequired: '您必須掃描二維碼進行身份驗證。請聯繫您的人力資源管理員',
          enterBoth: '請輸入登錄ID和密碼。',
          hrAdminBrowser: '人力資源管理員只能通過瀏覽器管理任務。',
          youAreLoggedInAs: '您已登錄為',
          Employee: '員工',
          Approval: '審批',
          ok: '確定',
          somethingWrong: '出現錯誤。請重試。',
          failedFetchProfile: '獲取用戶資料失敗。',
        }[key] || key;
      
      default: // 'en'
        return {
          enterLoginId: 'Enter Login ID',
          enterPassword: 'Enter Password',
          login: 'Login',
          scanQrCode: 'Scan QR Code',
          settings: 'Settings',
          error: 'Error',
          loginFailed: 'Invalid login ID or password.',
          accessDenied: 'Access Denied',
          loginSuccess: 'Login Success',
          welcome: 'Welcome',
          qrRequired: 'You must scan the QR code to authenticate. Please contact your HR Administrator',
          enterBoth: 'Please enter both login ID and password.',
          hrAdminBrowser: 'HR Admin can only manage tasks via the browser.',
          youAreLoggedInAs: 'You are logged in as',
          Employee: 'Employee',
          Approval: 'Approval',
          ok: 'OK',
          somethingWrong: 'Something went wrong. Please try again.',
          failedFetchProfile: 'Failed to fetch user profile.',
        }[key] || key;
    }
  };

  const handleLogin = () => {
    if (!scannedData) {
      showAlert(getLocalizedText('error'), getLocalizedText('qrRequired'));
      return;
    }

    if (!loginId || !password) {
      showAlert(getLocalizedText('error'), getLocalizedText('enterBoth'));
      return;
    }

    const baseUrl = scannedData.split('/apps/api')[0];
    AsyncStorage.setItem('baseUrl', baseUrl);

    setIsLoading(true);

    fetch(`${scannedData}/v1/auth/credentials-login`, {
      method: 'POST',
      body: JSON.stringify({ username: loginId, password }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText || 'Login failed');
        }
        return response.json();
      })
      .then((data) => {
        if (data.success) {
          const accessToken = data.data.accessToken;
          const refreshToken = data.data.refreshToken;
          AsyncStorage.setItem('accessToken', accessToken);
          AsyncStorage.setItem('refreshToken', refreshToken);

          const fetchUserRole = async () => {
            try {
              const response = await fetch(`${baseUrl}/apps/api/v1/auth/user-profiles`, {
                method: 'GET',
                headers: { Authorization: `Bearer ${accessToken}` },
              });

              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }

              const roleData = await response.json();
              if (roleData.success) {
                const userRole = roleData.data[0].userRole;
                const userId = roleData.data[0].userId;
                const companyId = roleData.data[0].companies[0]?.companyId;
                await AsyncStorage.setItem('userRole', userRole);
                await AsyncStorage.setItem('userId', userId.toString());

                if (userRole === 'Support') {
                  showAlert(getLocalizedText('accessDenied'), getLocalizedText('hrAdminBrowser'));
                } else if (['Employee', 'Approval'].includes(userRole)) {
                  showAlert(
                    getLocalizedText('loginSuccess'),
                    `${getLocalizedText('welcome')}, ${loginId}! ${getLocalizedText('youAreLoggedInAs')} ${getLocalizedText(userRole)}.`,
                    [
                      {
                        text: getLocalizedText('ok'),
                        onPress: () => {
                          setAlertConfig(prev => ({ ...prev, visible: false }));
                          navigation.navigate('ProfileSwitch', { accessToken, userId, companyId });
                        }
                      }
                    ]
                  );
                }
              } else {
                showAlert(getLocalizedText('error'), getLocalizedText('failedFetchProfile'));
              }
            } catch (error) {
              console.error('Error during API call:', error);
              showAlert(getLocalizedText('error'), getLocalizedText('somethingWrong'));
            }
          };

          fetchUserRole();
        } else {
          showAlert(getLocalizedText('loginFailed'), getLocalizedText('loginFailed'));
        }
      })
      .catch((error) => {
        console.error('Login Error:', error);
        showAlert(getLocalizedText('error'), error.message || getLocalizedText('somethingWrong'));
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <KeyboardAvoidingView 
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollViewContent, { backgroundColor: theme.background }]}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.contentContainer, { backgroundColor: theme.background }]}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <Image source={require('../../img/logo/mcsb.png')} style={styles.logo} />
            <Text style={[styles.logoTitle, { color: theme.text }]}>MCSB</Text>
          </View>

          {/* Login Form Section */}
          <View style={styles.formContainer}>
            {/* Input Fields Group */}
            <View style={styles.inputGroup}>
              <View style={[styles.inputCard, { backgroundColor: theme.card }]}>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder={getLocalizedText('enterLoginId')}
                  placeholderTextColor={theme.subText}
                  value={loginId}
                  onChangeText={setLoginId}
                />
              </View>

              <View style={[styles.inputCard, { backgroundColor: theme.card }]}>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  placeholder={getLocalizedText('enterPassword')}
                  placeholderTextColor={theme.subText}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity 
                  onPress={() => setShowPassword(!showPassword)} 
                  style={styles.showPasswordButton}
                >
                  <Image
                    source={showPassword ? require('../../img/icon/chakan.png') : require('../../img/icon/yincang(1).png')}
                    style={[styles.iconStyle, { tintColor: theme.primary }]}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Action Buttons Group */}
            <View style={styles.actionGroup}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: theme.card }]} 
                onPress={handleLogin}
              >
                <Image 
                  source={require('../../img/icon/a-avatar.png')} 
                  style={[styles.iconStyle, { tintColor: theme.primary }]} 
                />
                <Text style={[styles.buttonText, { color: theme.primary }]}>{getLocalizedText('login')}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: theme.card }]}
                onPress={() => navigation.navigate('ScanQR', { username: loginId, password })}
              >
                <Image 
                  source={require('../../img/icon/QR.png')} 
                  style={[styles.iconStyle, { tintColor: theme.primary }]} 
                />
                <Text style={[styles.buttonText, { color: theme.primary }]}>{getLocalizedText('scanQrCode')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Settings Button at Bottom */}
          <View style={styles.settingsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: theme.card }]}
              onPress={() => navigation.navigate('Settings')}
            >
              <Image 
                source={require('../../img/icon/a-s-tools.png')} 
                style={[styles.iconStyle, { tintColor: theme.primary }]} 
              />
              <Text style={[styles.buttonText, { color: theme.primary }]}>{getLocalizedText('settings')}</Text>
            </TouchableOpacity>

            <CustomAlert
              visible={alertConfig.visible}
              title={alertConfig.title}
              message={alertConfig.message}
              buttons={alertConfig.buttons}
              onDismiss={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
            />
          </View>
        </View>
      </ScrollView>

      {isLoading && (
        <View style={[styles.loadingOverlay, { backgroundColor: `${theme.background}E6` }]}>
          <LoadingAnimation />
        </View>
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
    minHeight: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logo: {
    width: 200,
    height: 100,
    resizeMode: 'contain',
  },
  logoTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  formContainer: {
    width: '100%',
    flex: 1,
  },
  inputGroup: {
    marginBottom: 40,
  },
  actionGroup: {
    gap: 16,
  },
  inputCard: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333',
  },
  showPasswordButton: {
    padding: 12,
    marginRight: 4,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsContainer: {
    marginTop: 'auto',
    marginBottom: 20,
    paddingTop: 20,
  },
  buttonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginLeft: 12,
  },
  iconStyle: {
    width: 24,
    height: 24,
    tintColor: '#007AFF',
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(245, 245, 245, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});

export default LoginScreen;