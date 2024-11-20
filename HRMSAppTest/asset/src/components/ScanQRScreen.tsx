import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import RNQRGenerator from 'rn-qr-generator';
import { launchImageLibrary } from 'react-native-image-picker';

const ScanQRScreen = () => {
  const [qrData, setQrData] = useState<string | null>(null);

  // Function to handle QR code scanning from the camera
  const onSuccess = (e: any) => {
    setQrData(e.data); // Successfully decoded QR code using camera scan
  };

  // Function to open gallery and pick an image to detect QR code
  const openQRCodeFromGallery = () => {
    const galleryOptions = {
      mediaType: 'photo', // Use the string 'photo' instead of MediaType
      includeBase64: true, // Include base64 data for the selected image
    };

    launchImageLibrary(galleryOptions, (response) => {
      if (!response || response.didCancel) {
        return;
      }

      // Type assertion to make sure we have an image with base64 data
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
            } else {
              setQrData('QR code not found');
            }
          })
          .catch((error) => {
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
    width: 300,  // Set width for camera box (smaller square)
    height: 300, // Set height to match the width for a square shape
    marginTop: -100,  // Move the camera view up
    alignSelf: 'center',  // Ensure the camera box is centered horizontally
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
