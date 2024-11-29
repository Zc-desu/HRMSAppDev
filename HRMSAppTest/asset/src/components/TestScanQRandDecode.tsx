import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import * as ImagePicker from 'react-native-image-picker';

const ImagePickerComponent = () => {
  const [image, setImage] = useState<string | null>(null);
  const [qrData, setQrData] = useState<string | null>(null);

  const pickImage = () => {
    ImagePicker.launchImageLibrary({ mediaType: 'photo' }, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } else if (response.errorCode) {
        console.log('ImagePicker Error: ', response.errorCode);
      } else if (response.assets && response.assets.length > 0) {
        const uri = response.assets[0].uri;
        setImage(uri || null);
        if (uri) {
          decodeQRCode(uri);
        }
      } else {
        setImage(null);
      }
    });
  };

  const decodeQRCode = (uri: string) => {
    // Simulating QR code decoding for now
    setTimeout(() => {
      setQrData('Decoded QR Code Data');
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <Button title="Pick an Image" onPress={pickImage} />
      {image && <Text style={styles.text}>Image URI: {image}</Text>}
      {qrData && <Text style={styles.text}>QR Code Data: {qrData}</Text>}
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
  text: {
    marginTop: 10,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ImagePickerComponent;
