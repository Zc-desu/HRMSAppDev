import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Button, Alert, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp, ParamListBase } from '@react-navigation/native';
import LoadingAnimation from '../../context/anim/loadingAnimation';  // Import the LoadingAnimation component

// Define the structure of the JWT payload (including the 'exp' property)
interface JWTDecodedPayload {
  exp: number;  // The expiration timestamp in Unix format
  employee_id: string;  // Include the employee_id from the payload
  [key: string]: any; // Other dynamic fields in the JWT payload
}

const ProfileSwitch = ({ route, navigation }: any) => {
  const { baseUrl: routeBaseUrl, accessToken: routeAccessToken } = route?.params || {};
  const [accessToken, setAccessToken] = useState<string | null>(routeAccessToken || null);
  const [baseUrl, setBaseUrl] = useState<string | null>(routeBaseUrl || null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false); // Add loading state

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
          const response = await fetch(`${baseUrl}/apps/api/v1/auth/user-profiles`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          });
          const data = await response.json();
          if (data.success) {
            setUserProfile(data.data[0]);

            const employeeId = data.data[0]?.employeeId;
            if (employeeId) {
              await AsyncStorage.setItem('employeeId', employeeId.toString());
            }
          } else {
            console.error('Error fetching user profile:', data.message);
            Alert.alert(
              'Error',
              'Failed to fetch user profile.',
              [
                {
                  text: 'OK',
                  onPress: () => {
                    navigation.navigate('Login');
                  },
                },
              ],
              { cancelable: false }
            );
          }
        } catch (error) {
          console.error('Error during API call:', error);
          Alert.alert(
            'Error',
            'There was an issue fetching the user profile.',
            [
              {
                text: 'OK',
                onPress: () => {
                  navigation.navigate('Login');
                },
              },
            ],
            { cancelable: false }
          );
        }
      };

      fetchUserProfile();
    } else {
      return;
    }
  }, [accessToken, baseUrl]);

  useLayoutEffect(() => {
    navigation.setOptions({ headerTitle: "" });
    navigation.setOptions({ headerShown: false });
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
            await AsyncStorage.removeItem('authToken');
            await AsyncStorage.removeItem('employeeId');
            navigation.navigate('Login');
          }
        }
      ],
      { cancelable: false }
    );
  };

  const handleCompanySelect = async (companyId: number, userId: number) => {
    setIsLoading(true);  // Show loading animation when button is clicked

    try {
      const response = await fetch(
        `${baseUrl}/apps/api/v1/auth/userId/${userId}/token?companyId=${companyId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        const userToken = data.data.token;
        await AsyncStorage.setItem('userToken', userToken);
        const decodedToken = decodeJWT(userToken);

        const employeeId = decodedToken?.decodedPayload?.employee_id;
        if (employeeId) {
          await AsyncStorage.setItem('employeeId', employeeId.toString());
        }

        if (decodedToken?.decodedPayload?.exp && Date.now() >= decodedToken.decodedPayload.exp * 1000) {
          Alert.alert('Session Expired', 'Your session has expired. Please log in again.');
          handleLogout();
          return;
        }

        const role = userProfile?.userRole;
        await AsyncStorage.setItem('userRole', role);

        if (role === 'Approval') {
          navigation.navigate('ApprovalMenu', { userToken, baseUrl, companyId, employeeId, decodedToken });
        } else if (role === 'Employee') {
          navigation.navigate('EmployeeMenu', { userToken, baseUrl, companyId, employeeId, decodedToken });
        } else {
          Alert.alert('Error', 'Unsupported user role.');
        }
      } else {
        Alert.alert('Error', data.message || 'Failed to fetch user token.');
      }
    } catch (error) {
      console.error('Error during profile switch:', error);
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setIsLoading(false);  // Hide loading animation after the process is complete
    }
  };

  function decodeBase64Url(base64Url: string): string {
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const paddedBase64 = base64 + '='.repeat((4 - base64.length % 4) % 4); 
    return atob(paddedBase64);
  }

  function decodeJWT(token: string) {
    const [headerB64, payloadB64, signatureB64] = token.split('.');
    const decodedHeader = JSON.parse(decodeBase64Url(headerB64));
    const decodedPayload: JWTDecodedPayload = JSON.parse(decodeBase64Url(payloadB64));

    return { decodedHeader, decodedPayload };
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {isLoading ? (
        <LoadingAnimation />  // Show loading animation when isLoading is true
      ) : (
        <>
          {userProfile ? (
            <>
              <Text style={styles.welcomeText}>Welcome! {userProfile.description}</Text>

              <View style={styles.userRoleContainer}>
                <Text style={styles.userRole}>{userProfile.userRole}</Text>
              </View>

              <Text style={styles.instructions}>Please select a company below:</Text>

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

              <View style={styles.logoutContainer}>
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                  <Text style={styles.logoutText}>Log Out</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <Text>Loading user profile...</Text>
          )}
        </>
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
    fontWeight: 'bold',
    color: '#333',
  },
  instructions: {
    fontSize: 18,
    marginBottom: 20,
  },
  buttonContainer: {
    marginBottom: 15,
  },
  companyButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 5,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  logoutContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    height: 60,  // Ensure consistent height
  },
  logoutButton: {
    backgroundColor: '#FF5733',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
  },
});

export default ProfileSwitch;
