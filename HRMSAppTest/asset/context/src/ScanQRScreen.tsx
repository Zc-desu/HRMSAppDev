// screens/ScanQRScreen.tsx
import React, { useState, useEffect } from 'react';
import { Alert, View, Text, Button, StyleSheet } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import RNQRGenerator from 'rn-qr-generator';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../auth/AuthContext';
import LoadingAnimation from '../anim/loadingAnimation';

const ScanQRScreen = ({ navigation, route }: any) => {
  const { setAuth } = useAuth();
  const [qrData, setQrData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

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
    setIsLoading(true); // Start loading animation
    const scannedData = e.data;
    setQrData(scannedData);

    try {
      await AsyncStorage.setItem('scannedData', scannedData);
      const baseUrl = scannedData.split('/apps/api')[0];
      await AsyncStorage.setItem('baseUrl', baseUrl);
      setAuth({ scannedData, baseUrl });

      Alert.alert(
        'QR Code Scanned',
        'QR Code was successfully scanned!',
        [
          {
            text: 'OK',
            onPress: () => {
              setIsLoading(false); // Stop loading animation
              navigation.navigate('Login', { scannedData, baseUrl });
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error saving QR data:', error);
      setIsLoading(false); // Stop loading animation
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
        return; // User cancelled image picker
      }

      // Start loading animation AFTER image is selected
      setIsLoading(true);

      const { assets } = response;
      if (assets && assets[0] && assets[0].base64) {
        const base64 = assets[0].base64;

        RNQRGenerator.detect({
          base64: base64,
        })
          .then(async (detectedQRCodes) => {
            const { values } = detectedQRCodes;
            if (values && values.length > 0) {
              setQrData(values[0]);
              const baseUrl = values[0].split('/apps/api')[0];
              await AsyncStorage.setItem('baseUrl', baseUrl);
              setAuth({ scannedData: values[0], baseUrl });

              Alert.alert(
                'QR Code Scanned',
                'QR Code was successfully scanned!',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      setIsLoading(false);
                      navigation.navigate('Login', { scannedData: values[0], baseUrl });
                    },
                  },
                ]
              );
            } else {
              setQrData('QR code not found');
              setIsLoading(false);
              Alert.alert('Error', 'No QR code found in the image');
            }
          })
          .catch((error) => {
            console.error('QR detection error:', error);
            setQrData('Error decoding QR from image');
            setIsLoading(false);
            Alert.alert('Error', 'Failed to decode QR code from image');
          });
      } else {
        setQrData('No base64 data available');
        setIsLoading(false);
        Alert.alert('Error', 'Failed to process image');
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

      {/* Loading Animation Overlay */}
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
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    zIndex: 1000,
  }
});

export default ScanQRScreen;
