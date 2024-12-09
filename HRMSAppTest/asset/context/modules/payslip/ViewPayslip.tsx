import React, { useEffect, useState } from 'react';
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

export type RootStackParamList = {
  ViewPayslip: {
    baseUrl: string;
    employeeId: string;
    payrollType: string;
    payrollDate: string;
  };
};

const ViewPayslip = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'ViewPayslip'>>();
  const { baseUrl, employeeId, payrollType, payrollDate } = route.params;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pdfUri, setPdfUri] = useState<string | null>(null);
  const [userToken, setUserToken] = useState<string>('');

  const fileName = `payslip_${employeeId}_${payrollDate}.pdf`;

  // Format payrollDate into 'Month YYYY'
  const formatDate = (date: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
    return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
  };

  const payslipTitle = formatDate(payrollDate);

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
        'Download Complete',
        `Payslip downloaded successfully to Downloads folder`,
        [{ text: 'OK' }]
      );
    } catch (err) {
      console.error('Download error:', err);
      Alert.alert('Download Failed', 'Unable to save the file.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{payslipTitle}</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : pdfUri ? (
        <View style={styles.pdfContainer}>
          <Pdf
            trustAllCerts={false}
            source={{ uri: pdfUri, cache: true }}
            style={styles.pdf}
            onLoadComplete={(numberOfPages) => {
              console.log(`Loaded ${numberOfPages} pages`);
            }}
            onError={(error) => {
              console.error('PDF Error:', error);
              setError('Error opening PDF');
            }}
            enablePaging={true}
            renderActivityIndicator={() => (
              <ActivityIndicator size="large" color="#007AFF" />
            )}
          />
        </View>
      ) : (
        <Text style={styles.errorText}>No PDF to display</Text>
      )}

      {pdfUri && (
        <TouchableOpacity onPress={handleDownload} style={styles.downloadButton}>
          <Image
            source={require('../../../../asset/img/icon/a-download.png')}
            style={styles.downloadIcon}
          />
          <Text style={styles.downloadButtonText}>Download Payslip</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
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
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width - 40,
    backgroundColor: '#F5F5F5',
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  downloadIcon: {
    width: 20,
    height: 20,
    tintColor: 'white',
    marginRight: 10,
  },
  downloadButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default ViewPayslip;
