import React from 'react';
import { Alert, TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

const ScanQRScreen = ({ navigation }: any) => {
  const onSuccess = (e: { data: string }) => {
    Alert.alert('Scanned Data', `Scanned data: ${e.data}`);
    navigation.navigate('Login', { scannedData: e.data });
  };

  return (
    <View style={styles.container}>
      {/* QR Code Scanner */}
      <QRCodeScanner
        onRead={onSuccess}
        flashMode={RNCamera.Constants.FlashMode.torch}
        reactivate={true}
      />

      {/* Button to navigate to Image Picker */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('ImagePicker')}
      >
        <Text style={styles.buttonText}>Scan QR From Gallery</Text>
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
  button: {
    marginTop: 20, // Adjust if needed
    position: 'absolute',
    bottom: 40, // Adjust to move it upwards
    backgroundColor: '#6200ee', // Add some color
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default ScanQRScreen;
