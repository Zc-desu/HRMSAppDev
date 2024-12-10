import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Pdf from 'react-native-pdf';
import RNFetchBlob from 'react-native-blob-util';
import { useTheme } from '../setting/ThemeContext';

const NBGetFileAttachment = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const [fileUrl, setFileUrl] = useState<string>('');
  const [userToken, setUserToken] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [mimeType, setMimeType] = useState<string>('');
  const { noticeId, fileId, employeeId, companyId, mimeType: routeMimeType } = route.params;

  useEffect(() => {
    loadFile();
    if (routeMimeType) {
      setMimeType(routeMimeType);
    }
    // Cleanup on unmount
    return () => {
      if (fileUrl.startsWith('file://')) {
        RNFetchBlob.fs.unlink(fileUrl.replace('file://', ''))
          .catch(err => console.error('Error cleaning up temp file:', err));
      }
    };
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
    });
  }, [navigation, theme]);

  const loadFile = async () => {
    try {
      const baseUrl = await AsyncStorage.getItem('baseUrl');
      const token = await AsyncStorage.getItem('userToken');

      if (!baseUrl || !token || !employeeId || !companyId) {
        throw new Error('Missing required configuration');
      }

      setUserToken(token);

      if (routeMimeType === 'application/pdf') {
        const tempPath = `${RNFetchBlob.fs.dirs.CacheDir}/temp_${fileId}.pdf`;
        
        // Download PDF file
        const response = await RNFetchBlob.config({
          fileCache: true,
          path: tempPath,
          appendExt: 'pdf',
        }).fetch(
          'GET',
          `${baseUrl}/apps/api/v1/notice-board/${noticeId}/files/${fileId}`,
          {
            'Authorization': `Bearer ${token}`,
            'X-Employee-Id': employeeId.toString(),
            'X-Company-Id': companyId.toString(),
            'X-Requested-With': 'XMLHttpRequest',
            'Accept': 'application/pdf',
          }
        );

        if (response.info().status === 200) {
          const path = Platform.OS === 'ios' 
            ? `file://${response.path()}`
            : response.path();
          setFileUrl(path);
        } else {
          throw new Error('Failed to download PDF');
        }
      } else {
        // For non-PDF files (like images)
        setFileUrl(`${baseUrl}/apps/api/v1/notice-board/${noticeId}/files/${fileId}`);
      }
    } catch (error: any) {
      console.error('File loading error:', error);
      Alert.alert(
        'Error',
        error.message === 'Missing required configuration'
          ? 'Please login again to refresh your session.'
          : 'Unable to load file. Please try again later.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderContent = () => {
    if (mimeType.startsWith('image/')) {
      return (
        <Image
          source={{
            uri: fileUrl,
            headers: {
              'Authorization': `Bearer ${userToken}`,
              'X-Employee-Id': employeeId.toString(),
              'X-Company-Id': companyId.toString(),
              'X-Requested-With': 'XMLHttpRequest',
            }
          }}
          style={styles.image}
          resizeMode="contain"
        />
      );
    } else if (mimeType === 'application/pdf') {
      return (
        <Pdf
          trustAllCerts={false}
          source={{ uri: fileUrl, cache: true }}
          style={[styles.pdf, { backgroundColor: theme.background }]}
          onLoadComplete={(numberOfPages, filePath) => {
            console.log(`PDF loaded with ${numberOfPages} pages`);
          }}
          onError={(error) => {
            console.error('PDF Error:', error);
            Alert.alert('Error', 'Unable to load PDF file');
          }}
          enablePaging={true}
          renderActivityIndicator={() => (
            <ActivityIndicator size="large" color={theme.primary} />
          )}
        />
      );
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  image: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  pdf: {
    flex: 1,
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: '#F5F5F5',
  },
});

export default NBGetFileAttachment;
