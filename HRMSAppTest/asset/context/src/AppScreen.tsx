// AppScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Button, Alert, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AppScreen = ({ route, navigation }: any) => {
  const { accessToken, baseUrl } = route.params;  // Get accessToken from params passed by LoginScreen
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [employeeData, setEmployeeData] = useState<any>(null);

  useEffect(() => {
    // Set the accessToken to the state
    if (accessToken) {
      setAuthToken(accessToken);
      console.log('Received Auth Token:', accessToken);  // Log the token here
    } else {
      // Fallback to fetching the token from AsyncStorage if not passed directly
      const fetchAuthToken = async () => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          setAuthToken(token);
          console.log('Auth Token from AsyncStorage:', token);  // Log the token from AsyncStorage
        } else {
          console.log('No token found, please login again.');
        }
      };

      fetchAuthToken();
    }
  }, [accessToken]);  // Runs when accessToken changes or is passed

  useEffect(() => {
    // Fetch employee data if token is available
    if (authToken) {
      const fetchEmployeeProfile = async () => {
        try {
          const response = await fetch(`${baseUrl}/apps/api/v1/employees/193/profile`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });
          const data = await response.json();
          if (data.success) {
            setEmployeeData(data.data);
          } else {
            console.error(data.message);
          }
        } catch (error) {
          console.error('Error fetching employee profile:', error);
        }
      };

      fetchEmployeeProfile();
    }
  }, [authToken, baseUrl]);

  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { 
          text: "OK", 
          onPress: () => {
            // Navigate to login screen
            navigation.navigate('Login'); 
            console.log("Successfully Log out!");
          }
        }
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome to the App!</Text>
      <Button title="Log Out" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default AppScreen;
