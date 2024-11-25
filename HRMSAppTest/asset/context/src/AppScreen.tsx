import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Button, Alert, Text, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppScreen = ({ route, navigation }: any) => {
  const baseUrl = route?.params?.baseUrl; // Safely access baseUrl from route params with optional chaining
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    // Retrieve the authToken from AsyncStorage
    const fetchAuthToken = async () => {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        setAuthToken(token);
        console.log('Auth Token:', token);
      } else {
        console.log('No auth token found. Please log in again.');
      }
    };

    fetchAuthToken();
  }, []);

  useEffect(() => {
    // Fetch user profile when authToken is available and baseUrl is not undefined
    if (authToken && baseUrl) {
      const fetchUserProfile = async () => {
        try {
          console.log(`Fetching from: ${baseUrl}/apps/api/v1/auth/user-profiles`);
          const response = await fetch(`${baseUrl}/apps/api/v1/auth/user-profiles`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });
          const data = await response.json();
          console.log('User Profile Data:', data);
          if (data.success) {
            setUserProfile(data.data[0]);
          } else {
            console.error('Error fetching user profile:', data.message);
          }
        } catch (error) {
          console.error('Error during API call:', error);
          Alert.alert('Error', 'There was an issue fetching the user profile.');
        }
      };

      fetchUserProfile();
    } else {
      Alert.alert('Error', 'Base URL is not defined.');
    }
  }, [authToken, baseUrl]);

  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: "" }); // Set header title to an empty string
    navigation.setOptions({ headerShown: false }); // Hide the title bar
  }, [navigation]);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            await AsyncStorage.removeItem('authToken'); // Clear auth token
            navigation.navigate('Login'); // Navigate to login screen
            console.log('Successfully logged out!');
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleCompanySelect = async (companyId: number, userId: number) => {
    try {
      const response = await fetch(`${baseUrl}/apps/api/v1/auth/profile-switch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          companyId: companyId,
          userId: userId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Profile switched successfully!');
        navigation.navigate('HomePage', { selectedCompanyName: data.companyName });
      } else {
        Alert.alert('Error', data.message || 'Failed to switch profile.');
      }
    } catch (error) {
      console.error('Error during profile switch:', error);
      Alert.alert('Error', 'Something went wrong.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {userProfile ? (
        <>
          {/* Title and User Info */}
          <Text style={styles.welcomeText}>Welcome! {userProfile.description}</Text>
          <Text style={styles.userInfo}>{`User Role: ${userProfile.userRole}`}</Text>
          <Text style={styles.userInfo}>{`User ID: ${userProfile.userId}`}</Text>

          {/* Instructions */}
          <Text style={styles.instructions}>Please select a company below:</Text>

          {/* Company Selection Buttons */}
          {userProfile.companies.map((company: any) => (
            <View key={company.companyId} style={styles.buttonContainer}>
              <Button
                title={`${company.name}`}
                onPress={() => handleCompanySelect(company.companyId, userProfile.userId)}
              />
            </View>
          ))}

          {/* Logout Button */}
          <View style={styles.buttonContainer}>
            <Button title="Log Out" onPress={handleLogout} />
          </View>
        </>
      ) : (
        <Text>Loading user profile...</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    marginBottom: 10,
    fontWeight: 'bold',
  },
  userInfo: {
    fontSize: 16,
    marginBottom: 5,
  },
  instructions: {
    fontSize: 18,
    marginVertical: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    marginVertical: 10,
    width: '100%',
  },
});

export default AppScreen;
