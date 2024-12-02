import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, Image } from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativePdf from 'react-native-pdf';
import FileViewer from 'react-native-file-viewer';

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

  const [loading, setLoading] = useState(true); // Start with loading state
  const [error, setError] = useState<string | null>(null);
  const [pdfUri, setPdfUri] = useState<string | null>(null);

  const fileName = `payslip_${employeeId}_${payrollDate}.pdf`;
  const localPath = `${RNFS.DocumentDirectoryPath}/${fileName}`; // Temporary storage for the PDF

  // Format payrollDate into 'Month YYYY'
  const formatDate = (date: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
    return new Intl.DateTimeFormat('en-US', options).format(new Date(date));
  };

  const payslipTitle = formatDate(payrollDate);

  // Function to fetch and display the PDF automatically
  const fetchPdf = async () => {
    setLoading(true);
    setError(null);

    const fileUrl = `${baseUrl}/apps/api/v1/employees/${employeeId}/payslips/${payrollType}/${payrollDate}`;

    try {
      const userToken = await AsyncStorage.getItem('userToken');
      if (!userToken) throw new Error('User token is missing');

      const download = await RNFS.downloadFile({
        fromUrl: fileUrl,
        toFile: localPath,
        headers: { Authorization: `Bearer ${userToken}` },
      });

      const result = await download.promise;

      if (result.statusCode === 200) {
        setPdfUri(localPath); // Set the URI to display the PDF
      } else {
        throw new Error('Failed to download PDF.');
      }
    } catch (err) {
      console.error(err);
      setError('Error fetching payslip.');
    } finally {
      setLoading(false);
    }
  };

  // Check if the file already exists locally
  useEffect(() => {
    const checkFileExists = async () => {
      try {
        const exists = await RNFS.exists(localPath);
        if (exists) {
          setPdfUri(localPath); // Automatically set the PDF URI if the file exists
        } else {
          fetchPdf(); // Fetch PDF if not found locally
        }
      } catch (err) {
        console.error('Error checking file existence:', err);
        setError('Error checking file existence.');
      }
    };

    checkFileExists();
  }, []);

  // Download button handler (for manual download)
  const handleDownload = async () => {
    const downloadPath = `${RNFS.ExternalStorageDirectoryPath}/Download/${fileName}`;

    try {
      await RNFS.copyFile(localPath, downloadPath); // Copy file from temp to download folder
      Alert.alert(
        'Download Complete',
        `Payslip downloaded successfully.\nFile location: ${downloadPath}`,
        [{ text: 'OK' }]
      );

      // Optionally open the file automatically
      FileViewer.open(downloadPath)
        .then(() => console.log('File opened successfully'))
        .catch((error) => {
          console.error('Error opening file:', error);
          setError('Error opening file.');
        });
    } catch (err) {
      console.error(err);
      Alert.alert('Download Failed', 'Unable to save the file.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{payslipTitle}</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : pdfUri ? (
        <View style={styles.pdfContainer}>
          <ReactNativePdf
            source={{ uri: pdfUri, cache: true }}
            onLoadComplete={(numberOfPages, filePath) => {
              console.log(`Number of pages: ${numberOfPages}`);
            }}
            onPageChanged={(page, numberOfPages) => {
              console.log(`Current page: ${page}`);
            }}
            onError={(error) => {
              setError('Error opening PDF');
              console.error('PDF Error:', error);
            }}
            style={styles.pdf}
          />
        </View>
      ) : (
        <Text style={styles.errorText}>No PDF to display</Text>
      )}

      {/* Download Button */}
      <TouchableOpacity onPress={handleDownload} style={styles.downloadButton}>
        <Image
          source={require('../../../../asset/img/icon/a-download.png')}
          style={styles.downloadIcon}
        />
        <Text style={styles.downloadButtonText}>Download Payslip</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  pdfContainer: { flex: 1, width: '100%', marginTop: 20 },
  pdf: { flex: 1, width: '100%' },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
  },
  downloadIcon: {
    width: 20,
    height: 20,
    tintColor: 'white',
    marginRight: 10,
  },
  downloadButtonText: { color: 'white', fontSize: 18 },
  errorText: { color: 'red', marginTop: 20 },
});

export default ViewPayslip;
