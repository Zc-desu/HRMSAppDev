import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';
import RNQRGenerator from 'rn-qr-generator';
import { launchImageLibrary } from 'react-native-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingAnimation from '../anim/loadingAnimation';
import { useTheme } from '../modules/setting/ThemeContext';
import { useLanguage } from '../modules/setting/LanguageContext';
import CustomAlert from '../modules/setting/CustomAlert';

interface AlertButton {
  text: string;
  onPress: () => void;
}

const ScanQRScreen = ({ navigation, route }: any) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const [qrData, setQrData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
  const [scannedUrl, setScannedUrl] = useState<string>('');

  // Get login data from route.params (or set fallback values)
  const { username, password } = route.params || {};

  // Check if QR code data exists in AsyncStorage on mount
  useEffect(() => {
    const fetchScannedData = async () => {
      try {
        const storedData = await AsyncStorage.getItem('scannedData');
        console.log('Fetched stored data:', storedData);
        if (storedData) {
          setQrData(storedData);
          setScannedUrl(storedData);
        }
      } catch (error) {
        console.error('Error fetching stored QR data:', error);
      }
    };

    fetchScannedData();
  }, []);

  // Replace Alert.alert with showAlert function
  const showAlert = (title: string, message: string, buttons: AlertButton[] = []) => {
    setAlertConfig({
      visible: true,
      title,
      message,
      buttons: buttons.length > 0 ? buttons : [
        { 
          text: getLocalizedText('ok'), 
          onPress: () => setAlertConfig(prev => ({ ...prev, visible: false }))
        }
      ],
    });
  };

  // Function to handle QR code scanning from the camera
  const onSuccess = async (e: any) => {
    setIsLoading(true);
    const scannedData = e.data;
    console.log('Scanned data:', scannedData);
    setScannedUrl(scannedData);

    if (!scannedData || !scannedData.includes('/apps/api')) {
      showAlert(getLocalizedText('error'), getLocalizedText('invalidQR'));
      setIsLoading(false);
      return;
    }

    try {
      await AsyncStorage.setItem('scannedData', scannedData);
      const baseUrl = scannedData.split('/apps/api')[0];
      await AsyncStorage.setItem('baseUrl', baseUrl);

      showAlert(
        getLocalizedText('qrScanned'),
        getLocalizedText('qrSuccess'),
        [
          {
            text: getLocalizedText('ok'),
            onPress: () => {
              setAlertConfig(prev => ({ ...prev, visible: false }));
              setIsLoading(false);
              navigation.navigate('Login', { scannedData, baseUrl });
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error saving QR data:', error);
      showAlert(getLocalizedText('error'), getLocalizedText('processingError'));
      setIsLoading(false);
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
              console.log('Detected data from image:', detectedData);
              setScannedUrl(detectedData);

              if (!detectedData.includes('/apps/api')) {
                setIsLoading(false);
                showAlert(getLocalizedText('error'), getLocalizedText('invalidQR'));
                return;
              }

              setQrData(detectedData);
              const baseUrl = detectedData.split('/apps/api')[0];
              await AsyncStorage.setItem('scannedData', detectedData);
              await AsyncStorage.setItem('baseUrl', baseUrl);

              console.log('Saved detectedData from image:', detectedData);

              showAlert(
                getLocalizedText('qrScanned'),
                getLocalizedText('qrSuccess'),
                [
                  {
                    text: getLocalizedText('ok'),
                    onPress: () => {
                      setAlertConfig(prev => ({ ...prev, visible: false }));
                      setIsLoading(false);
                      navigation.navigate('Login', { scannedData: detectedData, baseUrl });
                    },
                  },
                ]
              );
            } else {
              setQrData('QR code not found');
              setIsLoading(false);
              showAlert(getLocalizedText('error'), getLocalizedText('noQrFound'));
            }
          })
          .catch((error) => {
            console.error('QR detection error:', error);
            setQrData('Error decoding QR from image');
            setIsLoading(false);
            showAlert(getLocalizedText('error'), getLocalizedText('processingError'));
          });
      } else {
        setQrData('No base64 data available');
        setIsLoading(false);
        showAlert(getLocalizedText('error'), getLocalizedText('processingError'));
      }
    });
  };

  // Add this useLayoutEffect for header styling
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
      title: language === 'zh-Hans' ? '扫描二维码' :
             language === 'zh-Hant' ? '掃描二維碼' :
             language === 'ms' ? 'Imbas Kod QR' :
             'Scan QR',
      headerTitleAlign: 'center',
    });
  }, [navigation, theme, language]);

  const getLocalizedText = (key: string) => {
    switch (language) {
      case 'ms':
        return {
          scanQrCode: 'Imbas Kod QR',
          scanInstructions: 'Sila imbas kod QR yang disediakan oleh pentadbir HR anda',
          selectFromGallery: 'Pilih dari Galeri',
          goBack: 'Kembali',
          scannedUrl: 'URL Diimbas:',
          noUrlScanned: 'Tiada URL diimbas lagi',
          error: 'Ralat',
          success: 'Berjaya',
          invalidQR: 'Format kod QR tidak sah.',
          qrScanned: 'Kod QR Diimbas',
          qrSuccess: 'Kod QR berjaya diimbas!',
          noQrFound: 'Tiada kod QR dijumpai dalam imej',
          processingError: 'Gagal memproses imej',
          ok: 'OK',
        }[key] || key;
      
      case 'zh-Hans':
        return {
          scanQrCode: '扫描二维码',
          scanInstructions: '请扫描人力资源管理员提供的二维码',
          selectFromGallery: '从相册选择',
          goBack: '返回',
          scannedUrl: '扫描网址:',
          noUrlScanned: '尚未扫描网址',
          error: '错误',
          success: '成功',
          invalidQR: '无效的二维码格式。',
          qrScanned: '二维码已扫描',
          qrSuccess: '二维码扫描成功！',
          noQrFound: '图片中未找到二维码',
          processingError: '处理图片失败',
          ok: '确定',
        }[key] || key;
      
      case 'zh-Hant':
        return {
          scanQrCode: '掃描二維碼',
          scanInstructions: '請掃描人力資源管理員提供的二維碼',
          selectFromGallery: '從相冊選擇',
          goBack: '返回',
          scannedUrl: '掃描網址:',
          noUrlScanned: '尚未掃描網址',
          error: '錯誤',
          success: '成功',
          invalidQR: '無效的二維碼格式。',
          qrScanned: '二維碼已掃描',
          qrSuccess: '二維碼掃描成功！',
          noQrFound: '圖片中未找到二維碼',
          processingError: '處理圖片失敗',
          ok: '確定',
        }[key] || key;
      
      default: // 'en'
        return {
          scanQrCode: 'Scan QR Code',
          scanInstructions: 'Please scan the QR code provided by your HR administrator',
          selectFromGallery: 'Select from Gallery',
          goBack: 'Go Back',
          scannedUrl: 'Scanned URL:',
          noUrlScanned: 'No URL scanned yet',
          error: 'Error',
          success: 'Success',
          invalidQR: 'Invalid QR Code format.',
          qrScanned: 'QR Code Scanned',
          qrSuccess: 'QR Code was successfully scanned!',
          noQrFound: 'No QR code found in the image',
          processingError: 'Failed to process image',
          ok: 'OK',
        }[key] || key;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {/* Header Section */}
      <View style={[styles.headerCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.headerText, { color: theme.text }]}>
          {getLocalizedText('scanQrCode')}
        </Text>
        <Text style={[styles.subHeaderText, { color: theme.subText }]}>
          {getLocalizedText('scanInstructions')}
        </Text>
      </View>

      {/* Scanner Section - Updated styling */}
      <View style={[styles.scannerCard, { 
        backgroundColor: theme.card,
        borderColor: theme.border,
      }]}>
        <QRCodeScanner
          onRead={onSuccess}
          flashMode={RNCamera.Constants.FlashMode.off}
          cameraStyle={styles.cameraStyle}
          containerStyle={styles.cameraContainer}
          reactivate={true}
          reactivateTimeout={3000}
          cameraContainerStyle={styles.cameraContainerStyle}
        />
      </View>

      {/* URL Display Section */}
      <View style={[styles.urlCard, { backgroundColor: theme.card }]}>
        <Text style={[styles.urlLabel, { color: theme.subText }]}>
          {getLocalizedText('scannedUrl')}
        </Text>
        <Text style={[styles.urlText, { color: theme.text }]} numberOfLines={2} ellipsizeMode="tail">
          {qrData || scannedUrl || getLocalizedText('noUrlScanned')}
        </Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.card }]}
          onPress={openQRCodeFromGallery}
        >
          <Text style={[styles.buttonText, { color: theme.primary }]}>
            {getLocalizedText('selectFromGallery')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.card }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.buttonText, { color: theme.primary }]}>
            {getLocalizedText('goBack')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading Overlay */}
      {isLoading && (
        <View style={[styles.loadingOverlay, { 
          backgroundColor: theme.background + 'E6' // 90% opacity
        }]}>
          <LoadingAnimation />
        </View>
      )}

      {/* Add CustomAlert component */}
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
    padding: 16,
  },
  headerCard: {
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
    marginBottom: 8,
  },
  subHeaderText: {
    fontSize: 14,
    textAlign: 'center',
  },
  scannerCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    aspectRatio: 1,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    alignSelf: 'center',
    width: '100%',
    maxWidth: 300,
  },
  cameraContainer: {
    padding: 0,
    margin: 0,
  },
  cameraContainerStyle: {
    width: '100%',
    height: '100%',
    padding: 0,
    margin: 0,
  },
  cameraStyle: {
    width: '100%',
    height: '100%',
    alignSelf: 'center',
  },
  actionContainer: {
    gap: 12,
    marginTop: 12,
    marginBottom: 34,
    paddingHorizontal: 16,
  },
  actionButton: {
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  galleryIcon: { // New style specifically for gallery icon
    width: 24,
    height: 24,
    marginRight: 8,
    resizeMode: 'contain', // Ensures the image fits within bounds
  },
  buttonText: {
    fontSize: 16,
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
  urlCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  urlLabel: {
    fontSize: 16,
    marginBottom: 2,
    color: '#666',
    fontWeight: '600',
  },
  urlText: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 18,
  },
});

export default ScanQRScreen;
