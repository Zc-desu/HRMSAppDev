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
      <Button title="Login" onPress={handleLogin} />
      <Button title="Scan QR Code" onPress={() => navigation.navigate('ScanQR')} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', // Add this to center the content horizontally
    padding: 20,
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 10,
    paddingLeft: 10,
    width: '100%', // Ensures the inputs take full width
  },
  image: {
    width: 200,
    height: 100,
    marginBottom: 20,
    resizeMode: 'contain',
    alignSelf: 'center', // This centers the image within its parent view
  },
});

export default LoginScreen;
