import React, { useState, useEffect } from 'react';
import { Alert, Button, TextInput, View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import { useAuth } from '../auth/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }: any) => {
  const { authData, setAuth } = useAuth();
  const [loginId, setLoginId] = useState(authData.loginId || '');
  const [password, setPassword] = useState(authData.password || '');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const loadScannedData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('scannedData');
        if (savedData) {
          setAuth({ ...authData, scannedData: savedData });
        }
      } catch (error) {
        console.error('Failed to load scanned data:', error);
      }
    };
    loadScannedData();
  }, []);

  const handleLogin = () => {
    if (!authData.scannedData) {
      Alert.alert('Error', 'You must scan the QR code to authenticate. Please contact your HR Administrator');
      return;
    }

    if (!loginId || !password) {
      Alert.alert('Error', 'Please enter both login ID and password.');
      return;
    }

    const baseUrl = authData.scannedData.split('/apps/api')[0]; // Extract base URL from QR
    AsyncStorage.setItem('baseUrl', baseUrl); // Store baseUrl in AsyncStorage
    setAuth({ ...authData, baseUrl }); // Update AuthContext with baseUrl

    fetch(`${authData.scannedData}/v1/auth/credentials-login`, {
      method: 'POST',
      body: JSON.stringify({ username: loginId, password }),
      headers: { 'Content-Type': 'application/json' },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          const accessToken = AsyncStorage.setItem('accessToken', data.data.accessToken); // Store authToken in AsyncStorage
          const fetchUserRole = async () => {
            try {
              const accessToken = await AsyncStorage.getItem('accessToken');
              console.log('Access Token:', accessToken); // Log token to ensure it's correct
              if (!accessToken) {
                throw new Error('Access token is missing.');
              }
          
              const response = await fetch(`${baseUrl}/apps/api/v1/auth/user-profiles`, {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              });
          
              // Check for 401 error
              if (response.status === 401) {
                throw new Error('Unauthorized. Please check your login credentials or token.');
              }
              // Check for other status codes
              if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
              }
          
              const data = await response.json();
              if (data.success) {
                const userRole = data.data[0].userRole;
                await AsyncStorage.setItem('userRole', userRole);
                console.log("User role: " + userRole);
                if (userRole === 'Support')
                {
                  Alert.alert(
                    'Access Denied',
                    'HR Admin can only manage tasks via the browser.'
                  );
                  return;
                }
                else if (userRole === 'Employee')
                {
                  Alert.alert('Login Success', `Welcome, ${loginId}! Now you are login as ${userRole}`);
                  navigation.navigate('ProfileSwitch', {accessToken: accessToken});
                }
                else if (userRole === 'Approval')
                {
                  Alert.alert('Login Success', `Welcome, ${loginId}! Now you are login as ${userRole}`);
                  navigation.navigate('ProfileSwitch', {accessToken: accessToken});
                }
                else
                {
                  return;
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
      });
  };
  
  

  return (
    <View style={styles.container}>
      <Image source={require('../../img/logo/mcsb.png')} style={styles.image} />
      <TextInput style={styles.input} placeholder="Enter Login ID" value={loginId} onChangeText={setLoginId} />
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter Password"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordButton}>
          <Image source={showPassword ? require('../../img/icon/chakan.png') : require('../../img/icon/yincang(1).png')} style={styles.showPasswordIcon} />
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>LOGIN</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ScanQR', { username: loginId, password })}>
        <Text style={styles.buttonText}>SCAN QR CODE</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  input: { height: 45, width: '100%', borderColor: '#ccc', borderWidth: 1, borderRadius: 25, marginBottom: 10, paddingLeft: 15 },
  image: { width: 200, height: 100, marginBottom: 20, resizeMode: 'contain' },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', width: '100%' },
  showPasswordButton: { position: 'absolute', right: 15, top: '50%', transform: [{ translateY: -25 }], padding: 5 },
  showPasswordIcon: { width: 27, height: 27, resizeMode: 'contain' },
  button: { width: '80%', height: 45, borderRadius: 25, justifyContent: 'center', alignItems: 'center', backgroundColor: '#007BFF', marginBottom: 15 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});

export default LoginScreen;
