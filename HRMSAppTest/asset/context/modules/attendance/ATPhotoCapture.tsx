import React, { useState, useLayoutEffect, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
  TextInput,
} from 'react-native';
import { launchCamera, CameraOptions, MediaType } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../setting/ThemeContext';
import { useLanguage } from '../setting/LanguageContext';
import CustomAlert from '../setting/CustomAlert';

interface PhotoData {
  uri: string;
  type: string;
  fileName: string;
}

interface AlertButton {
  text: string;
  onPress: () => void;
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
    companyId,
    baseUrl
  } = route.params;

  const [frontPhoto, setFrontPhoto] = useState<PhotoData | null>(null);
  const [backPhoto, setBackPhoto] = useState<PhotoData | null>(null);
  const [isCameraBroken, setIsCameraBroken] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message: string;
    buttons: AlertButton[];
  }>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
  });
  const [userToken, setUserToken] = useState<string>('');
  const [reason, setReason] = useState<string>('');

  useEffect(() => {
    const getData = async () => {
      try {
        const storedUserToken = await AsyncStorage.getItem('userToken');

        if (!storedUserToken) {
          console.error('Missing userToken');
          showAlert(
            getLocalizedText('error'),
            'Missing authentication token. Please login again.'
          );
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
          return;
        }

        setUserToken(storedUserToken);

        console.log('Using Data:', {
          baseUrl,
          companyId,
          userToken: 'exists',
          employeeId
        });

      } catch (error) {
        console.error('Error getting stored data:', error);
        showAlert(
          getLocalizedText('error'),
          'Failed to get authentication data'
        );
      }
    };

    getData();
  }, []);

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
          clockInOutSuccess: 'Permohonan telah dihantar untuk kelulusan',
          pleaseTakePhotos: 'Sila ambil kedua-dua gambar',
          instruction: 'Sila ambil gambar hadapan dan belakang untuk meneruskan',
          sessionExpired: 'Sesi log masuk telah tamat. Sila log masuk semula.',
          reasonPlaceholder: 'Masukkan sebab (pilihan) - Bahasa Inggeris/Melayu sahaja',
          reasonError: 'Sila gunakan Bahasa Inggeris atau Bahasa Melayu sahaja',
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
          clockInOutSuccess: '申请已提交等待审批',
          pleaseTakePhotos: '请拍摄两张照片',
          instruction: '请拍摄正面和背面照片以继续',
          sessionExpired: '登录会话已过期，请重新登录。',
          reasonPlaceholder: '输入原因（可选）- 仅限英文/马来文',
          reasonError: '请使用英文或马来文',
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
          clockInOutSuccess: '申請已提交等待審批',
          pleaseTakePhotos: '請拍攝兩張照片',
          instruction: '請拍攝正面和背面照片以繼續',
          sessionExpired: '登入會話已過期，請重新登入。',
          reasonPlaceholder: '輸入原因（可選）- 僅限英文/馬來文',
          reasonError: '請使用英文或馬來文',
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
          clockInOutSuccess: 'Request has been submitted for approval',
          pleaseTakePhotos: 'Please take both photos',
          instruction: 'Please take front and back photos to proceed',
          sessionExpired: 'Login session has expired. Please login again.',
          reasonPlaceholder: 'Enter reason (optional) - English/Malay only',
          reasonError: 'Please use English or Malay only',
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
      showAlert(
        getLocalizedText('cameraError'),
        getLocalizedText('cameraNotWorking')
      );
    }
  };

  const showAlert = (title: string, message: string, buttons?: AlertButton[]) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons: buttons ?? [{
        text: 'OK',
        onPress: () => setAlertConfig(prev => ({ ...prev, visible: false }))
      }]
    });
  };

  const handleSubmit = async () => {
    // Start submission immediately if camera is broken
    if (isCameraBroken) {
      submitForm();
      return;
    }

    // Only validate photos if camera is NOT broken
    if (!frontPhoto || !backPhoto) {
      showAlert(getLocalizedText('error'), getLocalizedText('pleaseTakePhotos'));
      return;
    }

    submitForm();
  };

  const handleLogout = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const baseUrl = await AsyncStorage.getItem('baseUrl');

      // Call logout API
      if (baseUrl && userToken && refreshToken) {
        await fetch(`${baseUrl}/apps/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
          },
          body: JSON.stringify({ refreshToken })
        });
      }

      // Clear all auth-related storage
      const keys = await AsyncStorage.getAllKeys();
      const keysToRemove = keys.filter(key => 
        key !== 'baseUrl' && 
        key !== 'scannedData' &&
        key !== 'themePreference'
      );
      await AsyncStorage.multiRemove(keysToRemove);

      // Navigate to Login
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    }
  };

  const submitForm = async () => {
    try {
      if (!frontPhoto && !backPhoto && !isCameraBroken) {
        showAlert(
          getLocalizedText('error'),
          getLocalizedText('pleaseTakePhotos')
        );
        return;
      }

      setIsSubmitting(true);

      try {
        if (!userToken || !companyId) {
          throw new Error('Missing required data: userToken or companyId');
        }

        const formData = new FormData();
        
        // Required fields
        formData.append('EmployeeId', employeeId);
        formData.append('TimeEntry', timeEntry);
        
        // Location data
        formData.append('Latitude', latitude.toString());
        formData.append('LatitudeDelta', '0.0018');  // Add fixed LatitudeDelta
        formData.append('Longitude', longitude.toString());
        formData.append('LongitudeDelta', '0.0018'); // Add fixed LongitudeDelta
        formData.append('Address', `${latitude},${longitude},17z`); // Format address properly
        formData.append('AuthorizeZoneName', authorizeZoneName);

        // Boolean flags - send as boolean values
        formData.append('IsOutOfFence', isOutOfFence);
        formData.append('IsCameraBroken', isCameraBroken);
        formData.append('GpsNotAvailable', gpsNotAvailable);

        // Optional reason field
        if (reason) {
          formData.append('Reason', reason);
        }

        // Append photos if camera is not broken
        if (!isCameraBroken) {
          if (frontPhoto) {
            formData.append('FrontPhoto', {
              uri: frontPhoto.uri,
              type: 'image/jpeg',
              name: 'front_photo.jpg'
            });
          }
          if (backPhoto) {
            formData.append('BackPhoto', {
              uri: backPhoto.uri,
              type: 'image/jpeg',
              name: 'back_photo.jpg'
            });
          }
        }

        console.log('Submitting form data:', {
          employeeId,
          timeEntry,
          latitude,
          longitude,
          authorizeZoneName,
          isOutOfFence,
          isCameraBroken,
          gpsNotAvailable,
          hasFrontPhoto: !!frontPhoto,
          hasBackPhoto: !!backPhoto
        });

        const response = await fetch(`${baseUrl}/apps/api/v1/attendance/time-logs/submit-for-approval`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${userToken}`,
            'Accept': 'application/json',
          },
          body: formData,
        });

        const data = await response.json();
        
        if (!response.ok) {
          console.error('Submit failed:', {
            status: response.status,
            statusText: response.statusText,
            data: data,
            headers: response.headers
          });
          
          // Handle validation errors specifically
          if (response.status === 400 && data.errors) {
            const errorMessages = Object.values(data.errors)
              .flat()
              .join('\n');
            throw new Error(errorMessages);
          }
          
          throw new Error(data.message || 'Server returned unsuccessful response');
        }

        // Success handling
        showAlert(
          getLocalizedText('success'),
          getLocalizedText('clockInOutSuccess'),
          [{
            text: 'OK',
            onPress: () => navigation.goBack()
          }]
        );

      } catch (error: any) {
        throw error;
      }
    } catch (error: any) {
      console.error('Submit error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response,
        baseUrl,
        hasUserToken: !!userToken,
        hasCompanyId: !!companyId
      });
      
      showAlert(
        getLocalizedText('error'),
        error.message || getLocalizedText('unknownError')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    console.log('Received params:', {
      employeeId,
      companyId,
      baseUrl,
      timeEntry
    });

    if (!employeeId || !companyId || !baseUrl || !timeEntry) {
      console.error('Missing required params:', { employeeId, companyId, baseUrl, timeEntry });
      showAlert(
        getLocalizedText('error'),
        'Missing required data',
        [{
          text: 'OK',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }]
      );
    }
  }, [employeeId, companyId, baseUrl, timeEntry]);

  const isEnglishOrMalay = (text: string) => {
    // Regular expression for English and Malay characters
    const englishMalayRegex = /^[a-zA-Z0-9\s.,!?@#$%&*()-_+=;:"'\/\\\s]*$/;
    return englishMalayRegex.test(text);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[
          styles.instructionText, 
          { 
            color: theme.text,
            backgroundColor: theme.card,
            padding: 16,
            borderRadius: 12,
            marginBottom: 24,
          }
        ]}>
          {getLocalizedText('instruction')}
        </Text>

        {!isCameraBroken && (
          <View style={styles.photoContainer}>
            <View style={styles.photoSection}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>
                {getLocalizedText('frontPhoto')}
              </Text>
              {frontPhoto ? (
                <View style={styles.photoPreview}>
                  <Image 
                    source={{ uri: frontPhoto.uri }} 
                    style={styles.photo}
                    resizeMode="cover"
                  />
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
                  <Image 
                    source={{ uri: backPhoto.uri }} 
                    style={styles.photo}
                    resizeMode="cover"
                  />
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
        )}

        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[styles.optionButton, { backgroundColor: theme.card }]}
            onPress={() => setIsCameraBroken(!isCameraBroken)}
          >
            <Text style={[styles.buttonText, { color: theme.text }]}>
              {getLocalizedText('cameraNotWorking')}
            </Text>
            <View style={[styles.checkbox, { borderColor: theme.primary }]}>
              {isCameraBroken && <View style={[styles.innerCircle, { backgroundColor: theme.primary }]} />}
            </View>
          </TouchableOpacity>
        </View>

        <View style={[styles.inputContainer, { backgroundColor: theme.card }]}>
          <TextInput
            style={[
              styles.reasonInput,
              { 
                backgroundColor: theme.card,
                color: theme.text,
              }
            ]}
            placeholder={getLocalizedText('reasonPlaceholder')}
            placeholderTextColor={'#666'}
            value={reason}
            onChangeText={(text) => {
              if (text === '' || isEnglishOrMalay(text)) {
                setReason(text);
              } else {
                showAlert(
                  getLocalizedText('error'),
                  getLocalizedText('reasonError')
                );
              }
            }}
            multiline
            numberOfLines={3}
          />
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
      </ScrollView>

      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onDismiss={() => setAlertConfig(prev => ({ ...prev, visible: false }))}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32, // Extra padding at bottom
  },
  photoContainer: {
    marginBottom: 24,
  },
  photoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  photoPreview: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  takePhotoButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  retakeButton: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
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
  },
  submitButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  instructionText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
    lineHeight: 24,
    color: '#333333',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  inputContainer: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  reasonInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
  },
});

export default ATPhotoCapture;
