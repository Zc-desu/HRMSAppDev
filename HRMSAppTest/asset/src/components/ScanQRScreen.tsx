import React, { useState } from 'react';
import { Alert, View, Text, Button, StyleSheet } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import RNQRGenerator from 'rn-qr-generator';
import { launchImageLibrary } from 'react-native-image-picker';

const ScanQRScreen = ({ navigation, route }: any) => {
  const [qrData, setQrData] = useState<string | null>(null);

  // Get login data from route.params (or set fallback values)
  const { username, password } = route.params || {}; 

  // Function to handle QR code scanning from the camera
  const onSuccess = (e: any) => {
    setQrData(e.data); // Successfully decoded QR code
    if (!username || !password) {
      Alert.alert(
        'Error',
        'Missing login credentials. Please return to the login screen and try again.'
      );
      return;
    }

    // Show an alert when QR code is successfully scanned
    Alert.alert(
      'QR Code Scanned',
      'QR Code was successfully scanned!',
      [
        {
          text: 'OK',
          onPress: () => {
            // Navigate back to the login screen with the scanned data
            navigation.navigate('Login', { scannedData: e.data });
          },
        },
      ]
    );
  };

  // Function to open gallery and pick an image to detect QR code
  const openQRCodeFromGallery = () => {
    const galleryOptions = {
      mediaType: 'photo',
      includeBase64: true,
    };

    launchImageLibrary(galleryOptions, (response) => {
      if (!response || response.didCancel) {
        return;
      }

      const { assets } = response;
      if (assets && assets[0] && assets[0].base64) {
        const base64 = assets[0].base64;

        RNQRGenerator.detect({
          base64: base64,
        })
          .then((detectedQRCodes) => {
            const { values } = detectedQRCodes;
            if (values && values.length > 0) {
              setQrData(values[0]); // Display the first detected QR code value

              // Show an alert when QR code is successfully scanned from gallery
              Alert.alert(
                'QR Code Scanned',
                'QR Code was successfully scanned!',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Navigate back to the login screen with the scanned data
                      navigation.navigate('Login', { scannedData: values[0] });
                    },
                  },
                ]
              );
            } else {
              setQrData('QR code not found');
            }
          })
          .catch(() => {
            setQrData('Error decoding QR from image');
          });
      } else {
        setQrData('No base64 data available');
      }
    });
  };

  return (
    <View style={styles.container}>
      <QRCodeScanner
        onRead={onSuccess}
        flashMode={RNCamera.Constants.FlashMode.on}
        topContent={<Text style={styles.centerText}>Scan a QR Code</Text>}
        cameraStyle={styles.cameraStyle}
      />

      {/* Displaying the decoded QR data */}
      {qrData && <Text style={styles.qrData}>{qrData}</Text>}

      {/* Button for picking an image from the gallery */}
      <Button title="Pick an image from gallery" onPress={openQRCodeFromGallery} />
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
  cameraStyle: {
    width: 300,
    height: 300,
    marginTop: -100,
    alignSelf: 'center',
  },
  centerText: {
    fontSize: 18,
    padding: 10,
    color: '#000',
  },
  qrData: {
    marginTop: 20,
    fontSize: 16,
    color: 'green',
  },
});

export default ScanQRScreen;
