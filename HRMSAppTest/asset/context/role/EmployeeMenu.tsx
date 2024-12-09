import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image, BackHandler } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

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

  // Modify checkAuth to check for userToken instead of authToken
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userToken = await AsyncStorage.getItem('userToken');
        if (!userToken) {
          setLoggedIn(false);
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          });
        } else {
          setLoggedIn(true);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      }
    };
    checkAuth();
  }, [navigation]);

  // Handle hardware back button
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

  // Modified handleLogout
  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            try {
              setLoggedIn(false);
              
              // Store necessary data temporarily
              const baseUrl = await AsyncStorage.getItem('baseUrl');
              const scannedData = await AsyncStorage.getItem('scannedData');
              
              // Get all keys and filter out the ones we want to keep
              const keys = await AsyncStorage.getAllKeys();
              const keysToRemove = keys.filter(key => 
                key !== 'baseUrl' && 
                key !== 'scannedData'
              );
              
              // Remove only the authentication-related items
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
              <Image source={require('../../../asset/img/icon/gongzidan.png')} style={styles.iconImage} />
              <Text style={styles.squareButtonText}>Payslip</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.squareButton}
            onPress={() => navigation.navigate('LeaveMenu', { baseUrl, employeeId })}
          >
            <View style={styles.iconTextContainer}>
              <Image source={require('../../../asset/img/icon/leave2.png')} style={styles.iconImage} />
              <Text style={styles.squareButtonText}>Leave</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Other Button Rows */}
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.squareButton}
            onPress={() => {
              const companyIdToUse = companyId || decodedToken?.decodedPayload?.company_id;
              
              if (!companyIdToUse) {
                Alert.alert('Error', 'Company ID is not available');
                return;
              }

              navigation.navigate('NBGetList', {
                employeeId: employeeId,
                companyId: companyIdToUse,
                baseUrl: baseUrl
              });
            }}
          >
            <View style={styles.iconTextContainer}>
              <Image source={require('../../../asset/img/icon/noticeboard.png')} style={styles.iconImage} />
              <Text style={styles.squareButtonText}>Notice Board</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.squareButton}>
            <Text style={styles.squareButtonText}>Button 4</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.squareButton}>
            <Text style={styles.squareButtonText}>Button 5</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.squareButton, styles.logoutButtonStyle]}
            onPress={handleLogout}
          >
            <View style={styles.iconTextContainer}>
              <Image source={require('../../../asset/img/icon/tuichu.png')} style={styles.iconImage} />
              <Text style={styles.squareButtonText}>Log Out</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  viewDetailButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 28,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContent: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  textContainer: {
    flex: 1,
  },
  employeeNoText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  employeeNameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  avatarStyle: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  squareButton: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  squareButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  iconTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImage: {
    width: 40,
    height: 40,
    marginBottom: 8,
    tintColor: '#007AFF',
  },
  logoutButtonStyle: {
    backgroundColor: '#FFF0F0', // Light red background
  },
});

export default EmployeeMenu;