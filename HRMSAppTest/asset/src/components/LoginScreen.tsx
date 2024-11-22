import React, { useState, useEffect } from 'react';
import { Alert, Button, TextInput, View, StyleSheet, Image, TouchableOpacity, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation, route }: any) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [scannedData, setScannedData] = useState<string | null>(null); // Get scanned data (API URL)
  const [showPassword, setShowPassword] = useState(false);

  // Effect to load saved QR code data when the app is reopened
  useEffect(() => {
    const loadScannedData = async () => {
      try {
        const savedData = await AsyncStorage.getItem('scannedData');
        if (savedData) {
          setScannedData(savedData); // Set scanned data if found in AsyncStorage
        }
      } catch (error) {
        console.error('Failed to load scanned data:', error);
      }
    };

    loadScannedData();
  }, []);

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

  // Function to handle saving scanned QR data to AsyncStorage
  const handleSaveScannedData = async (data: string) => {
    try {
      await AsyncStorage.setItem('scannedData', data); // Save QR data to AsyncStorage
      setScannedData(data); // Update state with the saved data
    } catch (error) {
      console.error('Failed to save scanned data:', error);
    }
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
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter Password"
          secureTextEntry={!showPassword}  // Toggle password visibility
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.showPasswordButton}>
          <Image 
            source={showPassword ? require('../../img/chakan.png') : require('../../img/yincang(1).png')}
            style={styles.showPasswordIcon}
          />
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  input: {
    height: 45,
    width: '100%',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 25,
    marginBottom: 10,
    paddingLeft: 15,
    fontSize: 16,
  },
  image: {
    width: 200,
    height: 100,
    marginBottom: 20,
    resizeMode: 'contain',
    alignSelf: 'center',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
  },
  showPasswordButton: {
    position: 'absolute',
    right: 15,
    top: '50%',
    transform: [{ translateY: -25 }],
    padding: 5,
  },
  showPasswordIcon: {
    width: 27,
    height: 27,
    resizeMode: 'contain',
  },
  button: {
    width: '80%', // Adjust to your preferred width
    height: 45, // Set the height of both buttons the same
    borderRadius: 25, // Rounded corners
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007BFF', // Button color
    marginBottom: 15, // Space between buttons
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default LoginScreen;
