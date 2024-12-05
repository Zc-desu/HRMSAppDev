import React, { useState, useEffect } from 'react';
import { Alert, TextInput, View, StyleSheet, Image, TouchableOpacity, Text, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingAnimation from '../anim/loadingAnimation';

const LoginScreen = ({ navigation }: any) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleLogin = () => {
    if (!scannedData) {
      Alert.alert('Error', 'You must scan the QR code to authenticate. Please contact your HR Administrator');
      return;
    }

    if (!loginId || !password) {
      Alert.alert('Error', 'Please enter both login ID and password.');
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
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const accessToken = data.data.accessToken;
          const refreshToken = data.data.refreshToken; // Save the refresh token
          AsyncStorage.setItem('accessToken', accessToken);
          AsyncStorage.setItem('refreshToken', refreshToken); // Store refresh token in AsyncStorage

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
                const userId = roleData.data[0].userId; // Extract userId
                const companyId = roleData.data[0].companies[0]?.companyId; // Extract first companyId
                await AsyncStorage.setItem('userRole', userRole);

                if (userRole === 'Support') {
                  Alert.alert('Access Denied', 'HR Admin can only manage tasks via the browser.');
                } else if (['Employee', 'Approval'].includes(userRole)) {
                  Alert.alert('Login Success', `Welcome, ${loginId}! You are logged in as ${userRole}.`);
                  navigation.navigate('ProfileSwitch', { accessToken, userId, companyId }); // Pass userId and companyId
                }
              } else {
                Alert.alert('Error', 'Failed to fetch user profile.');
              }
            } catch (error) {
              console.error('Error during API call:', error);
              Alert.alert('Error', 'There was an issue fetching the user profile.');
            }
          };

          fetchUserRole();
        } else {
          Alert.alert('Login Failed', 'Invalid login ID or password.');
        }
      })
      .catch((error) => {
        console.error('Error during authentication:', error);
        Alert.alert('Error', 'Failed to authenticate. Please try again later.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.contentContainer}>
          {/* Logo Section */}
          <View style={styles.logoContainer}>
            <Image source={require('../../img/logo/mcsb.png')} style={styles.logo} />
          </View>

          {/* Login Form Section */}
          <View style={styles.formContainer}>
            {/* Input Fields Group */}
            <View style={styles.inputGroup}>
              <View style={styles.inputCard}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Login ID"
                  placeholderTextColor="#666"
                  value={loginId}
                  onChangeText={setLoginId}
                />
              </View>

              <View style={styles.inputCard}>
                <TextInput
                  style={styles.input}
                  placeholder="Enter Password"
                  placeholderTextColor="#666"
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
                    style={styles.iconStyle}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Action Buttons Group */}
            <View style={styles.actionGroup}>
              <TouchableOpacity style={styles.actionButton} onPress={handleLogin}>
                <Image 
                  source={require('../../img/icon/a-avatar.png')} 
                  style={styles.iconStyle} 
                />
                <Text style={styles.buttonText}>Login</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('ScanQR', { username: loginId, password })}
              >
                <Image 
                  source={require('../../img/icon/QR.png')} 
                  style={styles.iconStyle} 
                />
                <Text style={styles.buttonText}>Scan QR Code</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Settings Button at Bottom */}
          <View style={styles.settingsContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('Settings')}
            >
              <Image 
                source={require('../../img/icon/a-s-tools.png')} 
                style={styles.iconStyle} 
              />
              <Text style={styles.buttonText}>Settings</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {isLoading && (
        <View style={styles.loadingOverlay}>
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