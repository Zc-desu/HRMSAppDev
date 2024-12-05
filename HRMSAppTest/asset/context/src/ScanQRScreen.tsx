import React, { useState, useEffect } from 'react';
import { Alert, View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import RNQRGenerator from 'rn-qr-generator';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingAnimation from '../anim/loadingAnimation';

const ScanQRScreen = ({ navigation, route }: any) => {
  const [qrData, setQrData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Get login data from route.params (or set fallback values)
  const { username, password } = route.params || {};

  // Check if QR code data exists in AsyncStorage on mount
  useEffect(() => {
    const fetchScannedData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('scannedData');
        if (storedData) {
          setQrData(storedData);
        }
      } catch (error) {
        console.error('Error fetching stored QR data:', error);
      }
    };

    fetchScannedData();
  }, []);

  // Function to handle QR code scanning from the camera
  const onSuccess = async (e: any) => {
    setIsLoading(true); // Start loading animation
    const scannedData = e.data;

    if (!scannedData || !scannedData.includes('/apps/api')) {
      Alert.alert('Error', 'Invalid QR Code format.');
      setIsLoading(false); // Stop loading animation
      return;
    }

    try {
      await AsyncStorage.setItem('scannedData', scannedData);
      const baseUrl = scannedData.split('/apps/api')[0];
      await AsyncStorage.setItem('baseUrl', baseUrl);

      console.log('Saved scannedData:', scannedData);
      console.log('Saved baseUrl:', baseUrl);

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
      Alert.alert('Error', 'Failed to save scanned data. Please try again.');
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
              const detectedData = values[0];

              if (!detectedData.includes('/apps/api')) {
                setIsLoading(false);
                Alert.alert('Error', 'Invalid QR Code format.');
                return;
              }

              setQrData(detectedData);
              const baseUrl = detectedData.split('/apps/api')[0];
              await AsyncStorage.setItem('scannedData', detectedData);
              await AsyncStorage.setItem('baseUrl', baseUrl);

              console.log('Saved detectedData from image:', detectedData);

              Alert.alert(
                'QR Code Scanned',
                'QR Code was successfully scanned!',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      setIsLoading(false);
                      navigation.navigate('Login', { scannedData: detectedData, baseUrl });
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
      {/* Header Section */}
      <View style={styles.headerCard}>
        <Text style={styles.headerText}>Scan QR Code</Text>
        <Text style={styles.subHeaderText}>
          Please scan the QR code provided by your HR administrator
        </Text>
      </View>

      {/* Scanner Section - Now Larger and Square */}
      <View style={styles.scannerCard}>
        <QRCodeScanner
          onRead={onSuccess}
          flashMode={RNCamera.Constants.FlashMode.off}
          cameraStyle={styles.cameraStyle}
          containerStyle={styles.cameraContainer}
          reactivate={true}
          reactivateTimeout={3000}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={openQRCodeFromGallery}
        >
          <Image 
            source={require('../../../asset/img/icon/gallery.png')}
            style={styles.galleryIcon}
            resizeMode="contain"
          />
          <Text style={styles.buttonText}>Select from Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.goBack()}
        >
          <Image 
            source={require('../../../asset/img/icon/a-d-arrow-left.png')}
            style={styles.buttonIcon}
          />
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>

      {/* Loading Overlay */}
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
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subHeaderText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  scannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    aspectRatio: 1, // Makes it square
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cameraContainer: {
    backgroundColor: '#FFFFFF',
    padding: 0, // Removed padding to maximize camera view
  },
  cameraStyle: {
    height: '100%', // Takes full height of square container
    width: '100%', // Takes full width of square container
    alignSelf: 'center',
  },
  actionContainer: {
    gap: 12,
    marginTop: 'auto',
    marginBottom: 20,
  },
  actionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonIcon: {
    width: 24,
    height: 24,
    tintColor: '#007AFF',
    marginRight: 8,
  },
  galleryIcon: { // New style specifically for gallery icon
    width: 24,
    height: 24,
    tintColor: '#007AFF',
    marginRight: 8,
    resizeMode: 'contain', // Ensures the image fits within bounds
  },
  buttonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(245, 245, 245, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});

export default ScanQRScreen;
