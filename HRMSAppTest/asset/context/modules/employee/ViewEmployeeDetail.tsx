import React, { useEffect, useState } from 'react';
import { View, Text, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ViewEmployeeDetail = ({ navigation }: any) => {
  const [userToken, setUserToken] = useState<string | null>(null);
  const [baseUrl, setBaseUrl] = useState<string | null>(null);
  const [employeeDetails, setEmployeeDetails] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchAuthData = async () => {
      try {
        const token = await AsyncStorage.getItem('userToken');
        const storedBaseUrl = await AsyncStorage.getItem('scannedData');
        
        if (token && storedBaseUrl) {
          setUserToken(token);
          const extractedBaseUrl = storedBaseUrl.split('/apps/api')[0];
          setBaseUrl(extractedBaseUrl);
        } else {
          Alert.alert('Error', 'No user token or base URL found. Please log in again.', [
            { text: 'OK', onPress: () => navigation.navigate('Login') },
          ]);
        }
      } catch (error) {
        console.error('Error retrieving user token or base URL:', error);
        Alert.alert('Error', 'Unable to fetch user token or base URL.', [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      }
    };

    fetchAuthData();
  }, [navigation]);

  useEffect(() => {
    if (userToken && baseUrl) {
      const fetchEmployeeDetails = async () => {
        try {
          // Get the employeeId from AsyncStorage (already stored in ProfileSwitch)
          const employeeId = await AsyncStorage.getItem('employeeId');
          if (!employeeId) {
            Alert.alert('Error', 'Employee ID not found.');
            return;
          }

          const response = await fetch(`${baseUrl}/apps/api/v1/employees/${employeeId}/profile`, {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${userToken}`,
            },
          });

          const data = await response.json();
          if (data.success) {
            setEmployeeDetails(data.data);
          } else {
            Alert.alert('Error', 'Failed to fetch employee details.');
          }
        } catch (error) {
          console.error('Error fetching employee details:', error);
          Alert.alert('Error', 'Unable to fetch employee details.');
        } finally {
          setLoading(false);
        }
      };

      fetchEmployeeDetails();
    }
  }, [userToken, baseUrl]);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (!employeeDetails) {
    return <Text>No employee details available.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Employee Details</Text>
      <Text style={styles.detailText}>
        <Text style={styles.boldText}>Employee Number:</Text> {employeeDetails.employeeNumber}
      </Text>
      <Text style={styles.detailText}>
        <Text style={styles.boldText}>Name:</Text> {employeeDetails.name}
      </Text>
      <Text style={styles.detailText}>
        <Text style={styles.boldText}>Title:</Text> {employeeDetails.title}
      </Text>
      <Text style={styles.detailText}>
        <Text style={styles.boldText}>Nationality:</Text> {employeeDetails.nationality}
      </Text>
      <Text style={styles.detailText}>
        <Text style={styles.boldText}>NRIC:</Text> {employeeDetails.nric}
      </Text>
      <Text style={styles.detailText}>
        <Text style={styles.boldText}>Date of Birth:</Text> {employeeDetails.dateOfBirth}
      </Text>
      <Text style={styles.detailText}>
        <Text style={styles.boldText}>Age:</Text> {employeeDetails.age}
      </Text>
      <Text style={styles.detailText}>
        <Text style={styles.boldText}>Gender:</Text> {employeeDetails.gender}
      </Text>
      <Text style={styles.detailText}>
        <Text style={styles.boldText}>Resident Status:</Text> {employeeDetails.resident}
      </Text>
      <Text style={styles.detailText}>
        <Text style={styles.boldText}>Marital Status:</Text> {employeeDetails.maritalStatus}
      </Text>
      <Text style={styles.detailText}>
        <Text style={styles.boldText}>Religion:</Text> {employeeDetails.religion}
      </Text>
      <Text style={styles.detailText}>
        <Text style={styles.boldText}>Ethnic:</Text> {employeeDetails.ethnic}
      </Text>
      <Text style={styles.detailText}>
        <Text style={styles.boldText}>Smoker:</Text> {employeeDetails.smoker ? 'Yes' : 'No'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  detailText: {
    fontSize: 16,
    marginVertical: 5,
  },
  boldText: {
    fontWeight: 'bold',
  },
});

export default ViewEmployeeDetail;
