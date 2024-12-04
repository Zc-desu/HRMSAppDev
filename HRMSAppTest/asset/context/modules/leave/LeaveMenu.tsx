import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
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
    return <Text>Loading...</Text>; // Optionally, you can display a loading state until the data is fetched
  }

  return (
    <View style={styles.container}>
      {/* Actionable row for viewing leave application */}
      <TouchableOpacity
        style={styles.row}
        onPress={() => navigation.navigate('LeaveApplicationListing', { baseUrl, employeeId })}
      >
        <Text style={styles.rowText}>View Leave Application</Text>
        <Image
          source={require('../../../../asset/img/icon/arrow-right.png')}
          style={styles.icon}
        />
      </TouchableOpacity>

      {/* Actionable row for creating leave application */}
      <TouchableOpacity
        style={styles.row}
        onPress={() => navigation.navigate('CreateLeaveApplication', { baseUrl, employeeId })}
      >
        <Text style={styles.rowText}>Create Leave Application</Text>
        <Image
          source={require('../../../../asset/img/icon/arrow-right.png')}
          style={styles.icon}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  rowText: {
    fontSize: 16,
    color: '#333',
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: '#333', // Optional: to tint the icon
  },
});

export default LeaveMenu;
