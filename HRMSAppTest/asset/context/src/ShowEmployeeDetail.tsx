import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage to handle logout

const ShowEmployeeDetail = ({ route }: any) => {
  const { userId } = route.params; // Get the userId passed from HomePage
  const [employeeDetails, setEmployeeDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        const response = await fetch(`http://training.mcsb-pg.com/apps/api/v1/employees/${userId}/profile`, {
          method: 'GET',
          headers: {
            'Authorization': 'Bearer ' + (await AsyncStorage.getItem('authToken')),
          },
        });
        const data = await response.json();
        setEmployeeDetails(data?.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching employee details:', error);
        setLoading(false);
      }
    };

    fetchEmployeeDetails();
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF6347" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {employeeDetails ? (
        <View>
          <Text style={styles.detailText}>Name: {employeeDetails.name}</Text>
          <Text style={styles.detailText}>Employee Number: {employeeDetails.employeeNumber}</Text>
          <Text style={styles.detailText}>Title: {employeeDetails.title}</Text>
          <Text style={styles.detailText}>Nationality: {employeeDetails.nationality}</Text>
          <Text style={styles.detailText}>Date of Birth: {employeeDetails.dateOfBirth}</Text>
          <Text style={styles.detailText}>Age: {employeeDetails.age}</Text>
          <Text style={styles.detailText}>Gender: {employeeDetails.gender}</Text>
          <Text style={styles.detailText}>Resident: {employeeDetails.resident}</Text>
          <Text style={styles.detailText}>Marital Status: {employeeDetails.maritalStatus}</Text>
          <Text style={styles.detailText}>Religion: {employeeDetails.religion}</Text>
          <Text style={styles.detailText}>Ethnic: {employeeDetails.ethnic}</Text>
          <Text style={styles.detailText}>Smoker: {employeeDetails.smoker ? 'Yes' : 'No'}</Text>
        </View>
      ) : (
        <Text style={styles.errorText}>Failed to load employee details.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  detailText: {
    fontSize: 18,
    marginVertical: 5,
  },
  errorText: {
    color: 'red',
    fontSize: 18,
  },
});

export default ShowEmployeeDetail;
