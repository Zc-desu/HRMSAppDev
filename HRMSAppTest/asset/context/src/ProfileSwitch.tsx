import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Alert, Text, StyleSheet, ScrollView, TouchableOpacity, Image, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import LoadingAnimation from '../../context/anim/loadingAnimation';

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
  const [loggedIn, setLoggedIn] = useState(true);

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

  // Add back button handler
  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        if (!loggedIn) {
          return true; // Prevent going back if logged out
        }
        return false;
      };

      BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => BackHandler.removeEventListener('hardwareBackPress', onBackPress);
    }, [loggedIn])
  );

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'OK', 
          onPress: async () => {
            try {
              setLoggedIn(false);
              
              // Store necessary data
              const baseUrl = await AsyncStorage.getItem('baseUrl');
              const scannedData = await AsyncStorage.getItem('scannedData');
              
              // Get all keys and filter out the ones we want to keep
              const keys = await AsyncStorage.getAllKeys();
              const keysToRemove = keys.filter(key => 
                key !== 'baseUrl' && 
                key !== 'scannedData'
              );
              
              // Remove only auth-related items
              await AsyncStorage.multiRemove(keysToRemove);
              
              // Reset navigation stack
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to log out properly');
            }
          }
        }
      ],
      { cancelable: false }
    );
  };

  const handleCompanySelect = async (companyId: number, userId: number) => {
    setIsLoading(true);

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
          navigation.reset({
            index: 0,
            routes: [{ 
              name: 'ApprovalMenu', 
              params: { userToken, baseUrl, companyId, employeeId, decodedToken }
            }],
          });
        } else if (role === 'Employee') {
          navigation.reset({
            index: 0,
            routes: [{ 
              name: 'EmployeeMenu', 
              params: { userToken, baseUrl, companyId, employeeId, decodedToken }
            }],
          });
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
      setIsLoading(false);
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
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <LoadingAnimation />
        </View>
      ) : (
        <>
          {userProfile ? (
            <View style={styles.contentContainer}>
              {/* Welcome Section */}
              <View style={styles.welcomeCard}>
                <Text style={styles.welcomeText}>Welcome!</Text>
                <Text style={styles.userDescription}>{userProfile.description}</Text>
                <View style={styles.roleContainer}>
                  <Text style={styles.roleText}>{userProfile.userRole}</Text>
                </View>
              </View>

              {/* Company Selection Section */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Select Company:</Text>
                <View style={styles.companiesContainer}>
                  {userProfile.companies.map((company: any) => (
                    <TouchableOpacity
                      key={company.companyId}
                      style={styles.companyCard}
                      onPress={() => handleCompanySelect(company.companyId, userProfile.userId)}
                    >
                      <Text style={styles.companyName}>{company.name}</Text>
                      <Image 
                        source={require('../../../asset/img/icon/arrow-right.png')}
                        style={styles.arrowIcon}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Logout Section */}
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={handleLogout}
              >
                <Image 
                  source={require('../../../asset/img/icon/tuichu.png')}
                  style={styles.logoutIcon}
                />
                <Text style={styles.logoutText}>Log Out</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading user profile...</Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  contentContainer: {
    flex: 1,
    gap: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  userDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    textAlign: 'center',
  },
  roleContainer: {
    backgroundColor: '#F0F0F0',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  companiesContainer: {
    gap: 12,
  },
  companyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  companyName: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  arrowIcon: {
    width: 24,
    height: 24,
    tintColor: '#007AFF',
  },
  logoutButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 'auto',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoutIcon: {
    width: 24,
    height: 24,
    tintColor: '#FF3B30',
    marginRight: 8,
  },
  logoutText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
  },
});

export default ProfileSwitch;