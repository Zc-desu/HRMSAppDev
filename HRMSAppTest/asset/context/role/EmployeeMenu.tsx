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
            <Image source={require('../../../asset/img/icon/a-avatar.png')} style={styles.avatarStyle}/>
          </View>
        </TouchableOpacity>

        {/* Button Rows */}
        <View style={styles.buttonRow}>
          {/* Payslip Button with Icon */}
          <TouchableOpacity
            style={styles.squareButton}
            onPress={() => navigation.navigate('Payslip', { baseUrl, employeeId })}
          >
            <View style={styles.iconTextContainer}>
              {/* Icon above text */}
              <Image source={require('../../../asset/img/icon/gongzidan.png')} style={styles.iconImage} />
              <Text style={styles.squareButtonText}>Payslip</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.squareButton}
            onPress={() => navigation.navigate('LeaveMenu', { baseUrl, employeeId })}
          >
            <View style={styles.iconTextContainer}>
              {/* Icon above text */}
              <Image source={require('../../../asset/img/icon/leave2.png')} style={styles.iconImage} />
              <Text style={styles.squareButtonText}>Leave</Text>
            </View>
          </TouchableOpacity>
        </View>
        {/* Other Button Rows */}
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
            <Image source={require('../../../asset/img/icon/tuichu.png')} style={styles.iconImage} />
            <Text style={styles.squareButtonText}>Log Out</Text>
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
    width: 80,
    height: 80,
    borderRadius: 40, // Makes it circular
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    right: 15,
    justifyContent: 'center', // Centers content
    alignItems: 'center', // Centers content
  },
  avatarStyle: {
    width: 60,
    height: 60,
    borderRadius: 30, // Make the image round
    position: 'absolute',
    top: '50%', // Centers the image vertically within the circle
    left: '50%', // Centers the image horizontally within the circle
    transform: [{ translateX: 100 }, { translateY: -30 }], // Offsets the image by half of its size to truly center it
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  iconTextContainer: {
    flexDirection: 'column',  // Stack icon above text
    alignItems: 'center',     // Center align the content horizontally
    justifyContent: 'center', // Center align the content vertically
  },  
  icon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  iconImage: {
    width: 60,
    height: 60,
    marginBottom: 10,
    tintColor: 'white',
  },
  logoutButtonStyle: {
    backgroundColor: '#FF4C4C',
  },
});

export default EmployeeMenu;
