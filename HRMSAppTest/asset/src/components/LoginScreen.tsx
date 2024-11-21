import React, { useState } from 'react';
import { Alert, Button, TextInput, View, StyleSheet, Image } from 'react-native';

const LoginScreen = ({ navigation, route }: any) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [scannedData, setScannedData] = useState<string | null>(route.params?.scannedData || null); // Get scanned data (API URL)

  // Handle login and API authentication
  const handleLogin = () => {
    if (!scannedData) {
      Alert.alert('Error', 'You must scan the QR code to authenticate. Please contact your HR Administrator');
      return;
    }
  
    if (!loginId || !password) {
      Alert.alert('Error', 'Please enter both login ID and password.');
      return;
    }
  
    // Log the scanned data (URL) and the payload
    console.log('Scanned Data (URL):', scannedData);
    console.log('Username:', loginId + ' Password:', password);

  
    // API Authentication using the scanned API URL and the correct login endpoint
    fetch(`${scannedData}/v1/auth/credentials-login`, {  // Using the QR code base URL + the credentials-login endpoint
      method: 'POST',
      body: JSON.stringify({
        username: loginId, // Ensure these fields match what the API expects
        password,
      }),
      headers: {
        'Content-Type': 'application/json', // Make sure this matches the API's expected content type
      },
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          Alert.alert('Login Success', `Welcome, ${loginId}!`);
          // Navigate to the main app screen if authentication is successful
          navigation.navigate('App');  // Modify with your app screen name
        } else {
          Alert.alert('Login Failed', 'Invalid login ID or password.');
        }
      })
      .catch(error => {
        console.log('Error occurred during authentication:', error);
        Alert.alert('Error', 'Failed to authenticate. Please try again later.');
      });
  };
  

  return (
    <View style={styles.container}>
      {/* Company logo */}
      <Image 
        source={require('../../img/mcsb.png')} // Ensure this path points to your image correctly
        style={styles.image} 
      />

      {/* Login ID input */}
      <TextInput
        style={styles.input}
        placeholder="Enter Login ID"
        value={loginId}
        onChangeText={setLoginId}
      />

      {/* Password input */}
      <TextInput
        style={styles.input}
        placeholder="Enter Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Login button */}
      <Button title="Login" onPress={handleLogin} />

      {/* Navigate to Scan QR page */}
      <Button title="Scan QR Code" onPress={() => navigation.navigate('ScanQR', { username: loginId, password })}/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    width: '100%',
  },
  image: {
    width: 200,
    height: 100,
    marginBottom: 20,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
});

export default LoginScreen;
