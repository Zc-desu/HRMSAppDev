import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LeaveMenu = ({ navigation }: any) => {
  const [baseUrl, setBaseUrl] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch baseUrl and employeeId from AsyncStorage
        const storedBaseUrl = await AsyncStorage.getItem('baseUrl');
        const storedEmployeeId = await AsyncStorage.getItem('employeeId');
        
        if (storedBaseUrl) {
          setBaseUrl(storedBaseUrl);
        } else {
          Alert.alert('Error', 'Base URL is not available');
        }

        if (storedEmployeeId) {
          setEmployeeId(storedEmployeeId);
        } else {
          Alert.alert('Error', 'Employee ID is not available');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to fetch data from AsyncStorage');
      }
    };

    fetchData();
  }, []);

  if (!baseUrl || !employeeId) {
    return <Text>Loading...</Text>;  // Optionally, you can display a loading state until the data is fetched
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('LeaveApplicationListing', { baseUrl, employeeId })}
      >
        <Text style={styles.buttonText}>View Leave Application</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#243a84',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
  },
});

export default LeaveMenu;
