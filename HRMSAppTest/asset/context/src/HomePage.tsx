import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const HomePage = ({ navigation, route }: any) => {
  const { baseUrl, authToken: routeAuthToken } = route?.params || {};
  const { selectedCompanyName } = route.params;
  const [employeeNumber, setEmployeeNumber] = useState('');
  const [employeeName, setEmployeeName] = useState('');
  const [userId, setUserId] = useState(null); // Store userId dynamically

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // Step 1: Fetch the user profile to get the userId
        const authToken = await AsyncStorage.getItem('authToken');
        if (!authToken) {
          Alert.alert('Error', 'Authentication token is missing.');
          return;
        }

        const response = await fetch(`${baseUrl}/apps/api/v1/auth/user-profiles`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        if (!response.ok) {
          Alert.alert('Error', 'Failed to fetch user profiles.');
          return;
        }

        const data = await response.json();
        if (!data?.data || !data.data[0]?.userId) {
          Alert.alert('Error', 'User profile data is invalid or missing.');
          return;
        }

        const fetchedUserId = data.data[0].userId;
        setUserId(fetchedUserId);

        // Step 2: Use the userId to fetch the employee profile
        const profileResponse = await fetch(`${baseUrl}/apps/api/v1/employees/${fetchedUserId}/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authToken}`,
          },
        });

        if (!profileResponse.ok) {
          Alert.alert('Error', 'Failed to fetch employee profile.');
          return;
        }

        const profileData = await profileResponse.json();
        setEmployeeNumber(profileData?.data?.employeeNumber || 'N/A');
        setEmployeeName(profileData?.data?.name || 'N/A');
      } catch (error) {
        console.error('Error fetching profile data:', error);
        Alert.alert('Error', 'An unexpected error occurred while fetching profile data.');
      }
    };

    fetchProfileData();
  }, []);

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
              await AsyncStorage.removeItem('authToken');
              Alert.alert('Logged Out', 'You have been logged out successfully.');
              navigation.navigate('Login');
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'There was an issue logging out.');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const handleViewEmployeeDetails = () => {
    if (userId) {
      navigation.navigate("Profile", { userId }); // Use the dynamic userId
    } else {
      Alert.alert("Error", "User ID is not available.");
    }
  };

  return (
    <View style={styles.container}>
      {/* Only the rounded button with circle is above everything else */}
      <TouchableOpacity style={styles.roundedButton} onPress={handleViewEmployeeDetails}>
        <View style={styles.buttonContent}>
          <Text style={styles.buttonText}>{employeeNumber}</Text>
          <Text style={styles.buttonText}>{employeeName}</Text>
        </View>
        <View style={styles.circle}></View>
      </TouchableOpacity>

      <View style={styles.welcomeWrapper}>
        <Text style={styles.welcomeText}>Welcome to {selectedCompanyName}!</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    position: 'relative',
  },
  welcomeWrapper: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  roundedButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 30,
    paddingHorizontal: 70,
    borderRadius: 18,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',  // Make the button position absolute
    top: 60,               // Position it 60 pixels from the top
  },  
  buttonContent: {
    flexDirection: 'column',   // Stacks the text vertically
    alignItems: 'flex-start',  // Aligns text to the left
    width: '100%',             // Ensures the content takes up full width inside the button
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    width: '100%',             // Ensure text is allowed to wrap to the next line
    textAlign: 'left',         // Aligns the text to the left within the button
    flexWrap: 'wrap',          // Allows the text to break into multiple lines if needed
    marginHorizontal: -50,
  },  
  circle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    right: 20,
  },
  logoutButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 10,
    width: '90%',
    alignItems: 'center',
    position: 'absolute',  // Make the button position absolute
    bottom: 20,               // Position it 20 pixels from bottom
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 18,
  },
});

export default HomePage;
