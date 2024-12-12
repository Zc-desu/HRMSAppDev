import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Alert, Text, StyleSheet, ScrollView, TouchableOpacity, Image, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import LoadingAnimation from '../../context/anim/loadingAnimation';
import { useTheme } from '../modules/setting/ThemeContext';
import { useLanguage } from '../modules/setting/LanguageContext';
import CustomAlert from '../modules/setting/CustomAlert';

// Define the structure of the JWT payload (including the 'exp' property)
interface JWTDecodedPayload {
  exp: number;  // The expiration timestamp in Unix format
  employee_id: string;  // Include the employee_id from the payload
  [key: string]: any; // Other dynamic fields in the JWT payload
}

interface AlertConfig {
  visible: boolean;
  title?: string;
  message?: string;
  buttons?: Array<{
    text: string;
    style?: "default" | "cancel" | "destructive";
    onPress?: () => void;
  }>;
}

const ProfileSwitch = ({ route, navigation }: any) => {
  const { baseUrl: routeBaseUrl, accessToken: routeAccessToken } = route?.params || {};
  const [accessToken, setAccessToken] = useState<string | null>(routeAccessToken || null);
  const [baseUrl, setBaseUrl] = useState<string | null>(routeBaseUrl || null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false); // Add loading state
  const [loggedIn, setLoggedIn] = useState(true);
  const [alertConfig, setAlertConfig] = useState<AlertConfig>({ visible: false });
  const { theme } = useTheme();
  const { language } = useLanguage();

  const showAlert = (title: string, message: string, buttons: Array<any>) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons
    });
  };

  const getLocalizedText = (key: string) => {
    switch (language) {
      case 'ms':
        return {
          welcome: 'Selamat datang!',
          selectCompany: 'Pilih Syarikat:',
          logOut: 'Log Keluar',
          logOutConfirm: 'Adakah anda pasti mahu log keluar?',
          cancel: 'Batal',
          ok: 'OK',
          error: 'Ralat',
          sessionExpired: 'Sesi anda telah tamat. Sila log masuk semula.',
          unsupportedRole: 'Peranan pengguna tidak disokong.',
          somethingWrong: 'Sesuatu tidak kena.',
          loadingProfile: 'Memuat profil pengguna...',
          failedLogout: 'Gagal log keluar dengan betul',
          failedFetchProfile: 'Gagal mendapatkan profil pengguna.',
          failedUserToken: 'Gagal mendapatkan token pengguna.',
          Employee: 'Pekerja',
          Approval: 'Kelulusan',
        }[key] || key;
      
      case 'zh-Hans':
        return {
          welcome: '欢迎！',
          selectCompany: '选择公司：',
          logOut: '登出',
          logOutConfirm: '您确定要登出吗？',
          cancel: '取消',
          ok: '确定',
          error: '错误',
          sessionExpired: '您的会话已过期。请重新登录。',
          unsupportedRole: '不支持的用户角色。',
          somethingWrong: '出现错误。',
          loadingProfile: '加载用户资料...',
          failedLogout: '登出失败',
          failedFetchProfile: '获取用户资料失败。',
          failedUserToken: '获取用户令牌失败。',
          Employee: '员工',
          Approval: '审批',
        }[key] || key;
      
      case 'zh-Hant':
        return {
          welcome: '歡迎！',
          selectCompany: '選擇公司：',
          logOut: '登出',
          logOutConfirm: '您確定要登出嗎？',
          cancel: '取消',
          ok: '確定',
          error: '錯誤',
          sessionExpired: '您的會話已過期。請重新登錄。',
          unsupportedRole: '不支持的用戶角色。',
          somethingWrong: '出現錯誤。',
          loadingProfile: '加載用戶資料...',
          failedLogout: '登出失敗',
          failedFetchProfile: '獲取用戶資料失敗。',
          failedUserToken: '獲取用戶令牌失敗。',
          Employee: '員工',
          Approval: '審批',
        }[key] || key;
      
      default: // 'en'
        return {
          welcome: 'Welcome!',
          selectCompany: 'Select Company:',
          logOut: 'Log Out',
          logOutConfirm: 'Are you sure you want to log out?',
          cancel: 'Cancel',
          ok: 'OK',
          error: 'Error',
          sessionExpired: 'Your session has expired. Please log in again.',
          unsupportedRole: 'Unsupported user role.',
          somethingWrong: 'Something went wrong.',
          loadingProfile: 'Loading user profile...',
          failedLogout: 'Failed to log out properly',
          failedFetchProfile: 'Failed to fetch user profile.',
          failedUserToken: 'Failed to fetch user token.',
          Employee: 'Employee',
          Approval: 'Approval',
        }[key] || key;
    }
  };

  useEffect(() => {
    const fetchAuthData = async () => {
      try {
        if (!accessToken) {
          const token = await AsyncStorage.getItem('authToken');
          if (token) setAccessToken(token);
        }
        
        if (!baseUrl) {
          const storedBaseUrl = await AsyncStorage.getItem('scannedData');
          if (storedBaseUrl) {
            const extractedBaseUrl = storedBaseUrl.split('/apps/api')[0];
            setBaseUrl(extractedBaseUrl);
            navigation.setParams({ baseUrl: extractedBaseUrl });
          } else {
            console.error('No base URL found in storage');
            Alert.alert('Error', 'Please scan QR code again');
            navigation.navigate('Login');
          }
        }
      } catch (error) {
        console.error('Error fetching auth data:', error);
        Alert.alert('Error', 'Authentication failed. Please login again.');
        navigation.navigate('Login');
      }
    };

    fetchAuthData();
  }, [navigation, accessToken, baseUrl]);

  useEffect(() => {
    if (accessToken && baseUrl) {
      const fetchUserProfile = async () => {
        try {
          const response = await fetch(`${baseUrl}/apps/api/v1/auth/user-profiles`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          const data = await response.json();
          if (data.success) {
            setUserProfile(data.data[0]);

            const employeeId = data.data[0]?.employeeId;
            if (employeeId) {
              await AsyncStorage.setItem('employeeId', employeeId.toString());
            }
          } else {
            console.error('Error fetching user profile:', data.message);
            Alert.alert(
              getLocalizedText('error'),
              getLocalizedText('failedFetchProfile'),
              [
                {
                  text: getLocalizedText('ok'),
                  onPress: () => {
                    navigation.navigate('Login');
                  },
                },
              ],
              { cancelable: false }
            );
          }
        } catch (error) {
          console.error('Error during API call:', error);
          Alert.alert(
            getLocalizedText('error'),
            getLocalizedText('failedFetchProfile'),
            [
              {
                text: getLocalizedText('ok'),
                onPress: () => {
                  navigation.navigate('Login');
                },
              },
            ],
            { cancelable: false }
          );
        }
      };

      fetchUserProfile();
    } else {
      return;
    }
  }, [accessToken, baseUrl]);

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
      headerShown: false,
    });
  }, [navigation, theme]);

  // Add back button handler
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
          style: 'default',
          onPress: async () => {
            try {
              setLoggedIn(false);
              setIsLoading(true);
              
              const refreshToken = await AsyncStorage.getItem('refreshToken');
              const accessToken = await AsyncStorage.getItem('accessToken');
              const baseUrl = await AsyncStorage.getItem('baseUrl');

              if (baseUrl && accessToken && refreshToken) {
                const response = await fetch(`${baseUrl}/apps/api/v1/auth/logout`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                  },
                  body: JSON.stringify({ refreshToken })
                });

                if (!response.ok) {
                  console.warn('Logout API call failed:', await response.text());
                }
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
              showAlert(getLocalizedText('error'), getLocalizedText('failedLogout'), [
                { text: getLocalizedText('ok'), style: 'default' }
              ]);
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleCompanySelect = async (companyId: number, userId: number) => {
    setIsLoading(true);

    try {
      const response = await fetch(
        `${baseUrl}/apps/api/v1/auth/userId/${userId}/token?companyId=${companyId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        const userToken = data.data.token;
        await AsyncStorage.setItem('userToken', userToken);
        const decodedToken = decodeJWT(userToken);

        // Store the decoded token in AsyncStorage
        await AsyncStorage.setItem('decodedToken', JSON.stringify(decodedToken));

        const employeeId = decodedToken?.decodedPayload?.employee_id;
        if (employeeId) {
          await AsyncStorage.setItem('employeeId', employeeId.toString());
        }

        // Get refresh token to pass to menu
        const refreshToken = await AsyncStorage.getItem('refreshToken');

        if (decodedToken?.decodedPayload?.exp && Date.now() >= decodedToken.decodedPayload.exp * 1000) {
          Alert.alert(getLocalizedText('error'), getLocalizedText('sessionExpired'));
          handleLogout();
          return;
        }

        const role = userProfile?.userRole;
        await AsyncStorage.setItem('userRole', role);

        if (role === 'Approval') {
          navigation.reset({
            index: 0,
            routes: [{ 
              name: 'ApprovalMenu', 
              params: { userToken, baseUrl, companyId, employeeId, decodedToken, refreshToken }
            }],
          });
        } else if (role === 'Employee') {
          navigation.reset({
            index: 0,
            routes: [{ 
              name: 'EmployeeMenu', 
              params: { userToken, baseUrl, companyId, employeeId, decodedToken, refreshToken }
            }],
          });
        } else {
          Alert.alert(getLocalizedText('error'), getLocalizedText('unsupportedRole'));
        }
      } else {
        Alert.alert(getLocalizedText('error'), data.message || getLocalizedText('failedUserToken'));
      }
    } catch (error) {
      console.error('Error during profile switch:', error);
      Alert.alert(getLocalizedText('error'), getLocalizedText('somethingWrong'));
    } finally {
      setIsLoading(false);
    }
  };

  function decodeBase64Url(base64Url: string): string {
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64 + '='.repeat((4 - base64.length % 4) % 4); 
    return atob(paddedBase64);
  }

  function decodeJWT(token: string) {
    const [headerB64, payloadB64, signatureB64] = token.split('.');
    const decodedHeader = JSON.parse(decodeBase64Url(headerB64));
    const decodedPayload: JWTDecodedPayload = JSON.parse(decodeBase64Url(payloadB64));

    return { decodedHeader, decodedPayload };
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {isLoading ? (
        <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
          <LoadingAnimation />
        </View>
      ) : (
        <>
          {userProfile ? (
            <View style={styles.contentContainer}>
              <View style={[styles.welcomeCard, { backgroundColor: theme.card }]}>
                <Text style={[styles.welcomeText, { color: theme.text }]}>
                  {getLocalizedText('welcome')}
                </Text>
                <Text style={[styles.userDescription, { color: theme.subText }]}>
                  {userProfile.description}
                </Text>
                <View style={[styles.roleContainer, { backgroundColor: theme.divider }]}>
                  <Text style={[styles.roleText, { color: theme.text }]}>
                    {getLocalizedText(userProfile.userRole)}
                  </Text>
                </View>
              </View>

              <View style={[styles.sectionCard, { backgroundColor: theme.card }]}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  {getLocalizedText('selectCompany')}
                </Text>
                <View style={styles.companiesContainer}>
                  {userProfile.companies.map((company: any) => (
                    <TouchableOpacity
                      key={company.companyId}
                      style={[
                        styles.companyCard, 
                        { 
                          backgroundColor: theme.card,
                          borderColor: theme.border 
                        }
                      ]}
                      onPress={() => handleCompanySelect(company.companyId, userProfile.userId)}
                    >
                      <Text style={[styles.companyName, { color: theme.primary }]}>
                        {company.name}
                      </Text>
                      <Image 
                        source={require('../../../asset/img/icon/arrow-right.png')}
                        style={[styles.arrowIcon, { tintColor: theme.primary }]}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.logoutButton, { backgroundColor: theme.card }]}
                onPress={handleLogout}
              >
                <Image 
                  source={require('../../../asset/img/icon/tuichu.png')}
                  style={[styles.logoutIcon, { tintColor: theme.error }]}
                />
                <Text style={[styles.logoutText, { color: theme.error }]}>
                  {getLocalizedText('logOut')}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
              <Text style={[styles.loadingText, { color: theme.subText }]}>
                {getLocalizedText('loadingProfile')}
              </Text>
            </View>
          )}
        </>
      )}
      
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title || ''}
        message={alertConfig.message || ''}
        buttons={alertConfig.buttons || []}
        onDismiss={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  contentContainer: {
    flex: 1,
    gap: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  userDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  roleContainer: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  companiesContainer: {
    gap: 12,
  },
  companyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  companyName: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  arrowIcon: {
    width: 24,
    height: 24,
    tintColor: '#007AFF',
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutIcon: {
    width: 24,
    height: 24,
    tintColor: '#FF3B30',
    marginRight: 8,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
  },
});

export default ProfileSwitch;