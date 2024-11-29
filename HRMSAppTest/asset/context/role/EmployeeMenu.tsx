import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const EmployeeMenu = ({ route, navigation }: any) => {
  // Extract companyId, baseUrl, and decodedToken from route params
  const { companyId, baseUrl: passedBaseUrl, decodedToken } = route.params;
  const [loggedIn, setLoggedIn] = useState(true);
  const [baseUrl, setBaseUrl] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);

  // Destructure employee details from the decoded token if available
  const employeeName = decodedToken?.decodedPayload?.employee_name;
  const employeeNumber = decodedToken?.decodedPayload?.employee_number;

  // Ensure baseUrl and employeeId are set properly
  useEffect(() => {
    const getBaseUrlAndEmployeeId = async () => {
      // First, check if baseUrl is passed in route params
      if (passedBaseUrl) {
        setBaseUrl(passedBaseUrl);
      } else {
        // If not, attempt to fetch it from AsyncStorage
        const storedBaseUrl = await AsyncStorage.getItem('baseUrl');
        if (storedBaseUrl) {
          setBaseUrl(storedBaseUrl);
        } else {
          Alert.alert('Error', 'Base URL is not available');
        }
      }

      // Check if employeeId is available in the decoded token or AsyncStorage
      const storedEmployeeId = decodedToken?.decodedPayload?.employee_id
        || await AsyncStorage.getItem('employeeId');

      if (storedEmployeeId) {
        setEmployeeId(storedEmployeeId);
      } else {
        Alert.alert('Error', 'Employee ID is not available');
      }
    };

    getBaseUrlAndEmployeeId();
  }, [passedBaseUrl, decodedToken]);

  // Handle logout functionality
  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Log out canceled'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            setLoggedIn(false);
            await AsyncStorage.removeItem('authToken');
            navigation.navigate('Login');
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Wrapper View */}
      <View>
        <TouchableOpacity
          style={styles.viewDetailButton}
          onPress={() => {
            if (employeeId) {
              navigation.navigate('ViewEmployeeDetail', { employeeId });
            } else {
              Alert.alert('Error', 'Employee ID is unavailable');
            }
          }}
        >
          <View style={styles.buttonContent}>
            <View style={styles.textContainer}>
              <Text style={styles.employeeNoText}>{employeeNumber}</Text>
              <Text style={styles.employeeNameText}>{employeeName}</Text>
            </View>
            <View style={styles.avatar} />
          </View>
        </TouchableOpacity>

        {/* Button Rows */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.squareButton}
            onPress={() => navigation.navigate('Payslip', { baseUrl, employeeId })}
          >
            <Text style={styles.squareButtonText}>Payslip</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.squareButton}>
            <Text style={styles.squareButtonText}>Button 2</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.squareButton}>
            <Text style={styles.squareButtonText}>Button 3</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.squareButton}>
            <Text style={styles.squareButtonText}>Button 4</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.squareButton}>
            <Text style={styles.squareButtonText}>Button 5</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.squareButton}>
            <Text style={styles.squareButtonText}>Button 6</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.squareButton}>
            <Text style={styles.squareButtonText}>Button 7</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.squareButton, styles.logoutButtonStyle]}
            onPress={handleLogout}
          >
            <Image source={require('../../img/icon/tuichu.png')} style={styles.logoutImage} />
            <Text style={styles.logoutTextStyle}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
  },
  viewDetailButton: {
    width: '100%',
    backgroundColor: '#243a84',
    borderRadius: 15,
    paddingVertical: 40,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  buttonContent: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    paddingLeft: 15,
  },
  employeeNoText: {
    color: 'white',
    fontSize: 20,
    marginBottom: 5,
  },
  employeeNameText: {
    color: 'white',
    fontSize: 24,
    marginBottom: 5,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    right: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  squareButton: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#243a84',
    borderRadius: 10,
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  squareButtonText: {
    color: 'white',
    fontSize: 16,
  },
  logoutButtonStyle: {
    backgroundColor: '#FF4C4C',
  },
  logoutImage: {
    width: 40,
    height: 40,
    marginBottom: 10,
  },
  logoutTextStyle: {
    color: 'black',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default EmployeeMenu;
