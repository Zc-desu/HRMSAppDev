import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Button, Alert, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp, ParamListBase } from '@react-navigation/native';

const ProfileSwitch = ({ route, navigation }: any) => {
  const { baseUrl: routeBaseUrl, accessToken: routeAccessToken } = route?.params || {};
  const [accessToken, setAccessToken] = useState<string | null>(routeAccessToken || null);
  const [baseUrl, setBaseUrl] = useState<string | null>(routeBaseUrl || null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchAuthData = async () => {
      try {
        if (!accessToken) {
          const token = await AsyncStorage.getItem('authToken');
          if (token) setAccessToken(token);
        }
        
        if (!baseUrl) {
          const storedBaseUrl = await AsyncStorage.getItem('scannedData');
          if (storedBaseUrl) {
            // Extract base URL from scanned data
            const extractedBaseUrl = storedBaseUrl.split('/apps/api')[0];
            setBaseUrl(extractedBaseUrl);
            navigation.setParams({ baseUrl: extractedBaseUrl });
          } else {
            console.error('No base URL found in storage');
            Alert.alert('Error', 'Please scan QR code again');
            navigation.navigate('Login');
          }
        }
      } catch (error) {
        console.error('Error fetching auth data:', error);
        Alert.alert('Error', 'Authentication failed. Please login again.');
        navigation.navigate('Login');
      }
    };

    fetchAuthData();
  }, [navigation, accessToken, baseUrl]);

  useEffect(() => {
    if (accessToken && baseUrl) {
      const fetchUserProfile = async () => {
        try {
          console.log(`Fetching from: ${baseUrl}/apps/api/v1/auth/user-profiles`);
          const response = await fetch(`${baseUrl}/apps/api/v1/auth/user-profiles`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          const data = await response.json();
          if (data.success) {
            setUserProfile(data.data[0]);
          } else {
            console.error('Error fetching user profile:', data.message);
            Alert.alert('Error', 'Failed to fetch user profile.');
          }
        } catch (error) {
          console.error('Error during API call:', error);
          Alert.alert('Error', 'There was an issue fetching the user profile.');
        }
      };

      fetchUserProfile();
    } else {
      console.log("Base URL:", baseUrl);
      console.log("Auth Token:", accessToken);
    }
  }, [accessToken, baseUrl]);

  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: "" }); // Set header title to an empty string
    navigation.setOptions({ headerShown: false }); // Hide the title bar
  }, [navigation]);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'OK', 
          onPress: async () => {
            await AsyncStorage.removeItem('authToken'); // Clear auth token
            navigation.navigate('Login'); // Navigate to login screen
          }
        }
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
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          companyId: companyId,
          userId: userId,
        }),
      });

      const data = await response.json();

      // Log the full response to inspect the structure
      console.log('Profile Switch Response:', data);

      if (data.success) {
        // Access the company name from the first company in the array
        const companyName = userProfile?.companies?.[0]?.name || 'Unknown Company';
        console.log('Company Name:', companyName); // Log the company name
        
        // Navigate to HomePage with selected company name
        navigation.navigate('HomePage', { 
          selectedCompanyName: companyName, 
          baseUrl,
          accessToken
        });
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

          {/* User Role with rounded rectangle */}
          <View style={styles.userRoleContainer}>
            <Text style={styles.userRole}>{userProfile.userRole}</Text>
          </View>

          {/* Instructions */}
          <Text style={styles.instructions}>Please select a company below:</Text>

          {/* Company Selection Buttons */}
          {userProfile.companies.map((company: any) => (
            <View key={company.companyId} style={styles.buttonContainer}>
              <TouchableOpacity
                style={styles.companyButton}
                onPress={() => handleCompanySelect(company.companyId, userProfile.userId)}
              >
                <Text style={styles.buttonText}>{company.name}</Text>
              </TouchableOpacity>
            </View>
          ))}

          {/* Log out button moved to bottom */}
          <View style={styles.logoutContainer}>
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutText}>Log Out</Text>
            </TouchableOpacity>
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
  userRoleContainer: {
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  userRole: {
    fontSize: 16,
    color: '#000',
  },
  instructions: {
    fontSize: 18,
    marginVertical: 20,
    textAlign: 'center',
  },
  buttonContainer: {
    marginVertical: 10,
    width: '100%',
    alignItems: 'center', // Ensures the buttons are centered horizontally
  },
  companyButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    width: '80%',
    alignSelf: 'center', // Ensures the button is centered within the container
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    textAlign: 'center'
  },
  logoutContainer: {
    position: 'absolute',
    bottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    width: '70%',
    alignItems: 'center',
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
});

export default ProfileSwitch;
