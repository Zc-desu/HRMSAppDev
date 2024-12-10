import React, { useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { launchCamera, CameraOptions, MediaType } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../setting/ThemeContext';
import { useLanguage } from '../setting/LanguageContext';

interface PhotoData {
  uri: string;
  type: string;
  fileName: string;
}

const ATPhotoCapture = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const {
    timeEntry,
    latitude,
    latitudeDelta,
    longitude,
    longitudeDelta,
    address,
    authorizeZoneName,
    isOutOfFence,
    gpsNotAvailable,
    employeeId,
  } = route.params;

  const [frontPhoto, setFrontPhoto] = useState<PhotoData | null>(null);
  const [backPhoto, setBackPhoto] = useState<PhotoData | null>(null);
  const [isCameraBroken, setIsCameraBroken] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: theme.headerBackground,
        shadowColor: 'transparent',
        elevation: 0,
      },
      headerTintColor: theme.headerText,
      headerTitleStyle: {
        color: theme.headerText,
        fontSize: 17,
        fontWeight: '600',
      },
      headerShadowVisible: false,
      title: getLocalizedText('photoCapture'),
    });
  }, [navigation, theme]);

  const getLocalizedText = (key: string) => {
    switch (language) {
      case 'ms':
        return {
          photoCapture: 'Tangkap Gambar',
          frontPhoto: 'Gambar Hadapan',
          backPhoto: 'Gambar Belakang',
          takeFrontPhoto: 'Ambil Gambar Hadapan',
          takeBackPhoto: 'Ambil Gambar Belakang',
          retake: 'Ambil Semula',
          submit: 'Hantar',
          cameraError: 'Ralat Kamera',
          cameraPermissionDenied: 'Kebenaran kamera diperlukan',
          cameraNotWorking: 'Kamera Tidak Berfungsi',
          submitting: 'Menghantar...',
          success: 'Berjaya',
          error: 'Ralat',
          clockInOutSuccess: 'Masuk/Keluar berjaya',
          pleaseTakePhotos: 'Sila ambil kedua-dua gambar',
        }[key] || key;
      
      case 'zh-Hans':
        return {
          photoCapture: '拍照',
          frontPhoto: '正面照片',
          backPhoto: '背面照片',
          takeFrontPhoto: '拍摄正面照片',
          takeBackPhoto: '拍摄背面照片',
          retake: '重拍',
          submit: '提交',
          cameraError: '相机错误',
          cameraPermissionDenied: '需要相机权限',
          cameraNotWorking: '相机不可用',
          submitting: '提交中...',
          success: '成功',
          error: '错误',
          clockInOutSuccess: '打卡成功',
          pleaseTakePhotos: '请拍摄两张照片',
        }[key] || key;
      
      case 'zh-Hant':
        return {
          photoCapture: '拍照',
          frontPhoto: '正面照片',
          backPhoto: '背面照片',
          takeFrontPhoto: '拍攝正面照片',
          takeBackPhoto: '拍攝背面照片',
          retake: '重拍',
          submit: '提交',
          cameraError: '相機錯誤',
          cameraPermissionDenied: '需要相機權限',
          cameraNotWorking: '相機不可用',
          submitting: '提交中...',
          success: '成功',
          error: '錯誤',
          clockInOutSuccess: '打卡成功',
          pleaseTakePhotos: '請拍攝兩張照片',
        }[key] || key;
      
      default: // 'en'
        return {
          photoCapture: 'Photo Capture',
          frontPhoto: 'Front Photo',
          backPhoto: 'Back Photo',
          takeFrontPhoto: 'Take Front Photo',
          takeBackPhoto: 'Take Back Photo',
          retake: 'Retake',
          submit: 'Submit',
          cameraError: 'Camera Error',
          cameraPermissionDenied: 'Camera permission required',
          cameraNotWorking: 'Camera Not Working',
          submitting: 'Submitting...',
          success: 'Success',
          error: 'Error',
          clockInOutSuccess: 'Clock In/Out successful',
          pleaseTakePhotos: 'Please take both photos',
        }[key] || key;
    }
  };

  const takePhoto = async (isFront: boolean) => {
    const options: CameraOptions = {
      mediaType: 'photo' as MediaType,
      cameraType: isFront ? 'front' : 'back',
      quality: 0.8,
      saveToPhotos: false,
    };
    try {
      const result = await launchCamera(options);
      if (result.assets && result.assets[0]) {
        const photo = {
          uri: result.assets[0].uri || '',
          type: result.assets[0].type || 'image/jpeg',
          fileName: result.assets[0].fileName || 'photo.jpg',
        };
        if (isFront) {
          setFrontPhoto(photo);
        } else {
          setBackPhoto(photo);
        }
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert(
        getLocalizedText('cameraError'),
        getLocalizedText('cameraNotWorking')
      );
    }
  };

  const handleSubmit = async () => {
    if (!frontPhoto || !backPhoto) {
      Alert.alert(getLocalizedText('error'), getLocalizedText('pleaseTakePhotos'));
      return;
    }

    setIsSubmitting(true);

    try {
      const baseUrl = await AsyncStorage.getItem('baseUrl');
      const userToken = await AsyncStorage.getItem('userToken');

      const formData = new FormData();
      formData.append('EmployeeId', employeeId);
      formData.append('TimeEntry', timeEntry);
      formData.append('Latitude', latitude.toString());
      formData.append('LatitudeDelta', latitudeDelta.toString());
      formData.append('Longitude', longitude.toString());
      formData.append('LongitudeDelta', longitudeDelta.toString());
      formData.append('Address', address);
      formData.append('AuthorizeZoneName', authorizeZoneName);
      formData.append('IsOutOfFence', isOutOfFence.toString());
      formData.append('IsCameraBroken', isCameraBroken.toString());
      formData.append('GpsNotAvailable', gpsNotAvailable.toString());

      formData.append('FrontPhoto', {
        uri: frontPhoto.uri,
        type: frontPhoto.type,
        name: frontPhoto.fileName,
      });

      formData.append('BackPhoto', {
        uri: backPhoto.uri,
        type: backPhoto.type,
        name: backPhoto.fileName,
      });

      const response = await fetch(`${baseUrl}/apps/api/v1/attendance/time-logs`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userToken}`,
          'Accept': 'application/json',
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert(
          getLocalizedText('success'),
          getLocalizedText('clockInOutSuccess'),
          [{ text: 'OK', onPress: () => navigation.navigate('ATMenu') }]
        );
      } else {
        throw new Error(data.message);
      }
    } catch (error: unknown) {
      console.error('Submit error:', error);
      Alert.alert(getLocalizedText('error'), error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.photoContainer}>
        <View style={styles.photoSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {getLocalizedText('frontPhoto')}
          </Text>
          {frontPhoto ? (
            <View style={styles.photoPreview}>
              <Image source={{ uri: frontPhoto.uri }} style={styles.photo} />
              <TouchableOpacity
                style={[styles.retakeButton, { backgroundColor: theme.primary }]}
                onPress={() => takePhoto(true)}
              >
                <Text style={styles.buttonText}>{getLocalizedText('retake')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.takePhotoButton, { backgroundColor: theme.primary }]}
              onPress={() => takePhoto(true)}
            >
              <Text style={styles.buttonText}>
                {getLocalizedText('takeFrontPhoto')}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.photoSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            {getLocalizedText('backPhoto')}
          </Text>
          {backPhoto ? (
            <View style={styles.photoPreview}>
              <Image source={{ uri: backPhoto.uri }} style={styles.photo} />
              <TouchableOpacity
                style={[styles.retakeButton, { backgroundColor: theme.primary }]}
                onPress={() => takePhoto(false)}
              >
                <Text style={styles.buttonText}>{getLocalizedText('retake')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.takePhotoButton, { backgroundColor: theme.primary }]}
              onPress={() => takePhoto(false)}
            >
              <Text style={styles.buttonText}>
                {getLocalizedText('takeBackPhoto')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[styles.optionButton, { backgroundColor: theme.card }]}
          onPress={() => setIsCameraBroken(!isCameraBroken)}
        >
          <Text style={[styles.optionText, { color: theme.text }]}>
            {getLocalizedText('cameraNotWorking')}
          </Text>
          <View
            style={[
              styles.checkbox,
              { backgroundColor: isCameraBroken ? theme.primary : 'transparent' },
            ]}
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[
          styles.submitButton,
          { backgroundColor: theme.primary },
          isSubmitting && styles.disabledButton,
        ]}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.buttonText}>{getLocalizedText('submit')}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  photoContainer: {
    flex: 1,
  },
  photoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
  },
  photoPreview: {
    alignItems: 'center',
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  takePhotoButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  retakeButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    width: '50%',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  optionsContainer: {
    marginBottom: 24,
  },
  optionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  submitButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: Platform.OS === 'ios' ? 16 : 0,
  },
  disabledButton: {
    opacity: 0.7,
  },
});

export default ATPhotoCapture;
