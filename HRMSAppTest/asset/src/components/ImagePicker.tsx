import React, { useState } from 'react';
import { Image, Button, View, StyleSheet, Alert } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

const ImagePickerScreen = () => {
  const [imageUri, setImageUri] = useState<string | null>(null);

  // Function to launch the image picker and select an image from the gallery
  const pickImage = () => {
    launchImageLibrary(
      {
        mediaType: 'photo', // Only allow photo media type
        selectionLimit: 1,  // Limit to one image selection
      },
      (response) => {
        if (response.didCancel) {
          console.log('User canceled image picker');
        } else if (response.errorCode) {
          Alert.alert('Error', 'ImagePicker Error: ' + response.errorMessage);
        } else {
          // If the user selects an image, store its URI
          const uri = response.assets?.[0]?.uri;
          if (uri) {
            setImageUri(uri);
          }
        }
      }
    );
  };

  return (
    <View style={styles.container}>
      {/* Button to trigger image picker */}
      <Button title="Select Image From Gallery" onPress={pickImage} />
      
      {/* Display the selected image */}
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
    </View>
  );
};

// Styling for the ImagePicker screen
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,  // Add some top padding to move the content down
  },
  image: {
    width: 200,
    height: 200,
    marginTop: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
  },
});

export default ImagePickerScreen;
