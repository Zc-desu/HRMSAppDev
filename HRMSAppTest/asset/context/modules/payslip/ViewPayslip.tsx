import React, { useEffect, useState, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Pdf from 'react-native-pdf';
import RNFetchBlob from 'react-native-blob-util';
import { useTheme } from '../../modules/setting/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../../modules/setting/LanguageContext';

export type RootStackParamList = {
  ViewPayslip: {
    baseUrl: string;
    employeeId: string;
    payrollType: string;
    payrollDate: string;
  };
};

// Add translations interface
interface Translation {
  downloadPayslip: string;
  downloadComplete: string;
  downloadSuccess: string;
  downloadFailed: string;
  unableToSave: string;
  ok: string;
  loading: string;
  noPdf: string;
  error: string;
  pdfError: string;
  viewPayslip: string;
}

const ViewPayslip = () => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'ViewPayslip'>>();
  const { baseUrl, employeeId, payrollType, payrollDate } = route.params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [userToken, setUserToken] = useState<string>('');

  const fileName = `payslip_${employeeId}_${payrollDate}.pdf`;

  const getLocalizedText = (key: keyof Translation): string => {
    switch (language) {
      case 'ms':
        return {
          downloadPayslip: 'Muat Turun Slip Gaji',
          downloadComplete: 'Muat Turun Selesai',
          downloadSuccess: 'Slip gaji berjaya dimuat turun ke folder Muat Turun',
          downloadFailed: 'Muat Turun Gagal',
          unableToSave: 'Tidak dapat menyimpan fail.',
          ok: 'OK',
          loading: 'Memuatkan',
          noPdf: 'Tiada PDF untuk dipaparkan',
          error: 'Ralat',
          pdfError: 'Ralat membuka PDF',
          viewPayslip: 'Lihat Slip Gaji',
        }[key] || key;

      case 'zh-Hans':
        return {
          downloadPayslip: '下载工资单',
          downloadComplete: '下载完成',
          downloadSuccess: '工资单已成功下载到下载文件夹',
          downloadFailed: '下载失败',
          unableToSave: '无法保存文件。',
          ok: '确定',
          loading: '加载中',
          noPdf: '没有可显示的PDF',
          error: '错误',
          pdfError: '打开PDF时出错',
          viewPayslip: '查看工资单',
        }[key] || key;

      case 'zh-Hant':
        return {
          downloadPayslip: '下載工資單',
          downloadComplete: '下載完成',
          downloadSuccess: '工資單已成功下載到下載文件夾',
          downloadFailed: '下載失敗',
          unableToSave: '無法保存文件。',
          ok: '確定',
          loading: '加載中',
          noPdf: '沒有可顯示的PDF',
          error: '錯誤',
          pdfError: '打開PDF時出錯',
          viewPayslip: '查看工資單',
        }[key] || key;

      default: // 'en'
        return {
          downloadPayslip: 'Download Payslip',
          downloadComplete: 'Download Complete',
          downloadSuccess: 'Payslip downloaded successfully to Downloads folder',
          downloadFailed: 'Download Failed',
          unableToSave: 'Unable to save the file.',
          ok: 'OK',
          loading: 'Loading',
          noPdf: 'No PDF to display',
          error: 'Error',
          pdfError: 'Error opening PDF',
          viewPayslip: 'View Payslip',
        }[key] || key;
    }
  };

  // Update formatDate function
  const formatDate = (date: string) => {
    const formattedDate = new Date(date);
    const year = formattedDate.getFullYear();
    const month = formattedDate.getMonth() + 1;

    switch (language) {
      case 'zh-Hans':
        return `${year}年${month}月`;
      case 'zh-Hant':
        return `${year}年${month}月`;
      default:
        const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
        return new Intl.DateTimeFormat('en-US', options).format(formattedDate);
    }
  };

  // Function to fetch and display the PDF
  const fetchPdf = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) throw new Error('User token is missing');
      setUserToken(token);

      const fileUrl = `${baseUrl}/apps/api/v1/employees/${employeeId}/payslips/${payrollType}/${payrollDate}`;
      const tempPath = `${RNFetchBlob.fs.dirs.CacheDir}/temp_${fileName}`;

      // Download PDF file
      const response = await RNFetchBlob.config({
        fileCache: true,
        path: tempPath,
        appendExt: 'pdf',
      }).fetch('GET', fileUrl, {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/pdf',
      });

      if (response.info().status === 200) {
        const path = Platform.OS === 'ios'
          ? `file://${response.path()}`
          : response.path();
        setPdfUri(path);
      } else {
        throw new Error('Failed to download payslip');
      }
    } catch (err) {
      console.error('Payslip fetch error:', err);
      setError('Error fetching payslip.');
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchPdf();
    // Cleanup on unmount
    return () => {
      if (pdfUri?.startsWith('file://')) {
        RNFetchBlob.fs.unlink(pdfUri.replace('file://', ''))
          .catch(err => console.error('Error cleaning up temp file:', err));
      }
    };
  }, []);

  // Download button handler
  const handleDownload = async () => {
    try {
      if (!pdfUri) throw new Error('PDF not loaded');

      const downloadPath = Platform.OS === 'ios'
        ? `${RNFetchBlob.fs.dirs.DocumentDir}/${fileName}`
        : `${RNFetchBlob.fs.dirs.DownloadDir}/${fileName}`;

      await RNFetchBlob.fs.cp(pdfUri.replace('file://', ''), downloadPath);

      Alert.alert(
        getLocalizedText('downloadComplete'),
        getLocalizedText('downloadSuccess'),
        [{ text: getLocalizedText('ok') }]
      );
    } catch (err) {
      console.error('Download error:', err);
      Alert.alert(
        getLocalizedText('downloadFailed'), 
        getLocalizedText('unableToSave')
      );
    }
  };

  // Add header styling
  useLayoutEffect(() => {
    navigation.setOptions({
      title: getLocalizedText('viewPayslip'),
      headerStyle: {
        backgroundColor: theme.headerBackground,
        shadowColor: 'transparent',
        elevation: 0,
      },
      headerTintColor: theme.text,
      headerTitleStyle: {
        color: theme.text,
      },
      headerShadowVisible: false,
    });
  }, [navigation, theme, language]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.header, { color: theme.text }]}>{formatDate(payrollDate)}</Text>

      {loading ? (
        <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : error ? (
        <Text style={[styles.errorText, { color: theme.error }]}>{error}</Text>
      ) : pdfUri ? (
        <View style={[styles.pdfContainer, { backgroundColor: theme.background }]}>
          <Pdf
            trustAllCerts={false}
            source={{ uri: pdfUri, cache: true }}
            style={[styles.pdf, { backgroundColor: theme.background }]}
            onLoadComplete={(numberOfPages) => {
              console.log(`Loaded ${numberOfPages} pages`);
            }}
            onError={(error) => {
              console.error('PDF Error:', error);
              setError('Error opening PDF');
            }}
            enablePaging={true}
            renderActivityIndicator={() => (
              <ActivityIndicator size="large" color={theme.primary} />
            )}
          />
        </View>
      ) : (
        <Text style={[styles.errorText, { color: theme.error }]}>
          {getLocalizedText('noPdf')}
        </Text>
      )}

      {pdfUri && (
        <TouchableOpacity 
          onPress={handleDownload} 
          style={[styles.downloadButton, { 
            backgroundColor: theme.primary,
            shadowColor: theme.shadowColor,
          }]}
        >
          <Image
            source={require('../../../../asset/img/icon/a-download.png')}
            style={[styles.downloadIcon, { tintColor: theme.card }]}
          />
          <Text style={[styles.downloadButtonText, { color: theme.card }]}>
            {getLocalizedText('downloadPayslip')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pdfContainer: {
    flex: 1,
    width: '100%',
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width - 40,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  downloadIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  downloadButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ViewPayslip;
