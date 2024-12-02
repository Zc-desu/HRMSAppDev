import React, { useState, useEffect } from 'react';
import { Alert, TextInput, View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
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
          AsyncStorage.setItem('accessToken', accessToken);
  
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
    <View style={styles.container}>
      <Image source={require('../../img/logo/mcsb.png')} style={styles.image} />
      <TextInput
        style={styles.input}
        placeholder="Enter Login ID"
        value={loginId}
        onChangeText={setLoginId}
      />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordButton}>
          <Image
            source={showPassword ? require('../../img/icon/chakan.png') : require('../../img/icon/yincang(1).png')}
            style={styles.showPasswordIcon}
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Image source={require('../../img/icon/a-avatar.png')} style={styles.buttonIcon} />
        <Text style={styles.buttonText}>LOGIN</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ScanQR', { username: loginId, password })}
      >
        <Image source={require('../../img/icon/QR.png')} style={styles.buttonIcon} />
        <Text style={styles.buttonText}>SCAN QR CODE</Text>
      </TouchableOpacity>

      {/* Settings Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Settings')}  // Navigates to the Settings page
      >
        <Image source={require('../../img/icon/a-s-tools.png')} style={styles.buttonIcon} />
        <Text style={styles.buttonText}>SETTINGS</Text>
      </TouchableOpacity>

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <LoadingAnimation />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    padding: 20 
  },
  
  input: { 
    height: 45, 
    width: '100%', 
    borderColor: '#ccc', 
    borderWidth: 1, 
    borderRadius: 25, 
    marginBottom: 10, 
    paddingLeft: 15 
  },

  image: { 
    width: 200, 
    height: 100, 
    marginBottom: 20, 
    resizeMode: 'contain' 
  },

  passwordContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    width: '100%' 
  },

  showPasswordButton: { 
    position: 'absolute', 
    right: 15, 
    top: '50%', 
    transform: [{ translateY: -25 }], 
    padding: 5 
  },

  showPasswordIcon: { 
    width: 27, 
    height: 27, 
    resizeMode: 'contain' 
  },

  button: { 
    width: '80%', 
    height: 45, 
    borderRadius: 25, 
    justifyContent: 'center', 
    alignItems: 'center', 
    backgroundColor: '#007BFF', 
    marginBottom: 15, 
    flexDirection: 'row' 
  },

  buttonText: { 
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold' 
  },

  buttonIcon: {
    tintColor: 'white',
    width: 30, 
    height: 30, 
    marginRight: 20,
    resizeMode: 'contain' 
  },

  loadingOverlay: { 
    position: 'absolute', 
    left: 0, 
    right: 0, 
    top: 0, 
    bottom: 0, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
    zIndex: 1000 
  },
});


export default LoginScreen;
