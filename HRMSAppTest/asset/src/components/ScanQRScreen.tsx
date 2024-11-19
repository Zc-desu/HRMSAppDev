import React from 'react';
import { Alert } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

const ScanQRScreen = ({ navigation }: any) => {
  const onSuccess = (e: { data: string }) => {
    Alert.alert('Scanned Data', `Scanned data: ${e.data}`);
    navigation.navigate('Login', { scannedData: e.data });
  };

  return (
    <QRCodeScanner
      onRead={onSuccess}
      flashMode={RNCamera.Constants.FlashMode.torch}
      reactivate={true}
    />
  );
};

export default ScanQRScreen;
