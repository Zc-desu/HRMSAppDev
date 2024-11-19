import React, { useState } from 'react';
import { Alert, Button, TextInput, View, StyleSheet, Image } from 'react-native';

const LoginScreen = ({ navigation, route }: any) => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [scannedData, setScannedData] = useState<string | null>(route.params?.scannedData || null);

  const handleLogin = () => {
    if (!scannedData) {
      Alert.alert('Error', 'You must scan the QR code to authenticate.');
      return;
    }

    if (!loginId || !password) {
      Alert.alert('Error', 'Please enter both login ID and password.');
      return;
    }

    // Simulate API login
    Alert.alert('Login Success', `Welcome, ${loginId}!`);
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../img/mcsb.png')} 
        style={styles.image} 
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Login ID"
        value={loginId}
        onChangeText={setLoginId}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Button title="Scan QR Code" onPress={() => navigation.navigate('ScanQR')} />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', // Center items horizontally
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    width: '80%', // Optional: Make input fields a percentage of the screen width
  },
  image: {
    width: 200, // Set the desired width for the image
    height: 100, // Set the desired height for the image
    marginBottom: 20, // Add spacing below the image
    resizeMode: 'contain', // Maintain the aspect ratio of the image
  },
});


export default LoginScreen;
