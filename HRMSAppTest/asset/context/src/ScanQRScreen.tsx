// screens/ScanQRScreen.tsx
import React, { useState, useEffect } from 'react';
import { Alert, View, Text, Button, StyleSheet } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import RNQRGenerator from 'rn-qr-generator';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../auth/AuthContext';

const ScanQRScreen = ({ navigation, route }: any) => {
  const { setAuth } = useAuth(); // AuthContext to manage authentication
  const [qrData, setQrData] = useState<string | null>(null);

  // Get login data from route.params (or set fallback values)
  const { username, password } = route.params || {};

  // Check if QR code data exists in AsyncStorage on mount
  useEffect(() => {
    const fetchScannedData = async () => {
      const storedData = await AsyncStorage.getItem('scannedData');
      if (storedData) {
        setQrData(storedData);
      }
    };

    fetchScannedData();
  }, []);

  // Function to handle QR code scanning from the camera
  const onSuccess = async (e: any) => {
    const scannedData = e.data;
    setQrData(scannedData); // Successfully decoded QR code

    try {
      // Save the scanned data to AsyncStorage for future use
      await AsyncStorage.setItem('scannedData', scannedData);

      // Extract baseUrl from scanned QR data (assuming it's the first part of the URL)
      const baseUrl = scannedData.split('/apps/api')[0];

      // Save baseUrl to AsyncStorage
      await AsyncStorage.setItem('baseUrl', baseUrl);

      // Update AuthContext with the scanned data
      setAuth({ scannedData, baseUrl });

      // Show an alert when QR code is successfully scanned
      Alert.alert(
        'QR Code Scanned',
        'QR Code was successfully scanned!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to the login screen with the scanned data
              navigation.navigate('Login', { scannedData, baseUrl });
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error saving QR data to AsyncStorage:', error);
    }
  };

  // Function to open gallery and pick an image to detect QR code
  const openQRCodeFromGallery = () => {
    const galleryOptions = {
      mediaType: 'photo',
      includeBase64: true,
    } as const;

    launchImageLibrary(galleryOptions, (response: any) => {
      if (!response || response.didCancel) {
        return;
      }

      const { assets } = response;
      if (assets && assets[0] && assets[0].base64) {
        const base64 = assets[0].base64;

        RNQRGenerator.detect({
          base64: base64,
        })
          .then(async (detectedQRCodes) => {
            const { values } = detectedQRCodes;
            if (values && values.length > 0) {
              setQrData(values[0]); // Display the first detected QR code value

              // Extract baseUrl from scanned QR data (assuming it's the first part of the URL)
              const baseUrl = values[0].split('/apps/api')[0];

              // Save baseUrl to AsyncStorage
              await AsyncStorage.setItem('baseUrl', baseUrl);

              // Update AuthContext with the scanned data
              setAuth({ scannedData: values[0], baseUrl });

              // Show an alert when QR code is successfully scanned from gallery
              Alert.alert(
                'QR Code Scanned',
                'QR Code was successfully scanned!',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // Navigate back to the login screen with the scanned data
                      navigation.navigate('Login', { scannedData: values[0], baseUrl });
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
      {/* QR Code Scanner */}
      <QRCodeScanner
        onRead={onSuccess}
        flashMode={RNCamera.Constants.FlashMode.off}
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
