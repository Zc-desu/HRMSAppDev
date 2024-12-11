import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Image, StyleSheet, ActivityIndicator, Text } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../modules/setting/ThemeContext';
import { useLanguage } from '../../modules/setting/LanguageContext';

const translations = {
  'en': {
    photo: 'Photo',
    loading: 'Loading...',
    error: 'Failed to load photo'
  },
  'ms': {
    photo: 'Gambar',
    loading: 'Memuatkan...',
    error: 'Gagal memuatkan gambar'
  },
  'zh-Hans': {
    photo: '照片',
    loading: '加载中...',
    error: '无法加载照片'
  },
  'zh-Hant': {
    photo: '照片',
    loading: '加載中...',
    error: '無法加載照片'
  }
};

const ATTimeLogPhoto = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { timeLogId, employeeId, photoId, baseUrl } = route.params;
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getLocalizedText = (key: string) => {
    return translations[language as keyof typeof translations]?.[key as keyof typeof translations[keyof typeof translations]] || key;
  };

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
      title: getLocalizedText('photo'),
    });
  }, [navigation, theme, language]);

  useEffect(() => {
    const setup = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (!userToken) throw new Error('Authentication token not found');
        
        setAuthToken(userToken);
        setImageUrl(`${baseUrl}/apps/api/v1/employees/${employeeId}/attendance/time-logs/${timeLogId}/photos/${photoId}`);
        setError(null);
      } catch (error) {
        console.error('Error setting up photo view:', error);
        setError(getLocalizedText('error'));
      } finally {
        setIsLoading(false);
      }
    };

    setup();
  }, [baseUrl, employeeId, timeLogId, photoId]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loadingText, { color: theme.text }]}>
            {getLocalizedText('loading')}
          </Text>
        </View>
      ) : error ? (
        <Text style={[styles.errorText, { color: theme.text }]}>{error}</Text>
      ) : imageUrl && authToken ? (
        <View style={styles.photoContainer}>
          <Image
            source={{
              uri: imageUrl,
              headers: {
                'Authorization': `Bearer ${authToken}`,
                'Accept': '*/*',
              },
            }}
            style={styles.photo}
            resizeMode="contain"
            onError={(error) => {
              console.error('Image loading error:', error.nativeEvent.error);
              setError(getLocalizedText('error'));
            }}
          />
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    padding: 20,
  },
  photoContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#000',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
});

export default ATTimeLogPhoto;
