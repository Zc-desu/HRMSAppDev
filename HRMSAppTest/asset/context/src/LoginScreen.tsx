import React, { useState, useEffect } from 'react';
import { Alert, Button, TextInput, View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }: any) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Effect to load saved QR code data when app reopens
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

    const baseUrl = scannedData.split('/apps/api')[0];  // Extract base URL from QR

    // Store baseUrl in AsyncStorage
    AsyncStorage.setItem('baseUrl', baseUrl);

    // Authenticate with API
    fetch(`${scannedData}/v1/auth/credentials-login`, {
      method: 'POST',
      body: JSON.stringify({ username: loginId, password }),
      headers: { 'Content-Type': 'application/json' },
    })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        AsyncStorage.setItem('authToken', data.data.accessToken);
        Alert.alert('Login Success', `Welcome, ${loginId}!`);
        navigation.navigate('App', { baseUrl });  // Pass baseUrl to AppScreen
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
      <Image source={require('../../img/mcsb.png')} style={styles.image} />
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
          <Image source={showPassword ? require('../../img/chakan.png') : require('../../img/yincang(1).png')} style={styles.showPasswordIcon} />
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
