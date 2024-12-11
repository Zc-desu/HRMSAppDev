import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../modules/setting/ThemeContext';

const ATTimeLogPhoto = ({ route }: any) => {
  const { theme } = useTheme();
  const { timeLogId, employeeId, photoId, baseUrl } = route.params;
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (!userToken) throw new Error('Authentication token not found');

        const response = await fetch(
          `${baseUrl}/apps/api/v1/employees/${employeeId}/attendance/time-logs/${timeLogId}/photos/${photoId}`,
          {
            headers: {
              'Authorization': `Bearer ${userToken}`,
              'Accept': 'application/json',
            },
          }
        );

        if (response.ok) {
          setPhotoUrl(response.url);
        } else {
          throw new Error('Failed to load photo');
        }
      } catch (error) {
        console.error('Error fetching photo:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhoto();
  }, [baseUrl, employeeId, timeLogId, photoId]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {isLoading ? (
        <ActivityIndicator size="large" color={theme.primary} />
      ) : photoUrl ? (
        <Image
          source={{ uri: photoUrl }}
          style={styles.photo}
          resizeMode="contain"
        />
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
  photo: {
    width: '100%',
    height: '100%',
  },
});

export default ATTimeLogPhoto;
