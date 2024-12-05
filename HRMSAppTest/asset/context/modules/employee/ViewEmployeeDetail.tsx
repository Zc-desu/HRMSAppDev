import React, { useEffect, useState } from 'react';
import { View, Text, Alert, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
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

  // Helper function to format date
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    
    return `${day} ${month} ${year}`;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!employeeDetails) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No employee details available.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Header Section */}
        <View style={styles.headerCard}>
          <Text style={styles.headerText}>Employee Details</Text>
        </View>

        {/* Details Section */}
        <View style={styles.detailsCard}>
          <DetailItem label="Employee Number" value={employeeDetails.employeeNumber} />
          <DetailItem label="Name" value={employeeDetails.name} />
          <DetailItem label="Title" value={employeeDetails.title} />
          <DetailItem label="Nationality" value={employeeDetails.nationality} />
          <DetailItem label="NRIC" value={employeeDetails.nric} />
          <DetailItem 
            label="Date of Birth" 
            value={formatDate(employeeDetails.dateOfBirth)} 
          />
          <DetailItem label="Age" value={employeeDetails.age?.toString()} />
          <DetailItem label="Gender" value={employeeDetails.gender} />
          <DetailItem label="Resident Status" value={employeeDetails.resident} />
          <DetailItem label="Marital Status" value={employeeDetails.maritalStatus} />
          <DetailItem label="Religion" value={employeeDetails.religion} />
          <DetailItem label="Ethnic" value={employeeDetails.ethnic} />
          <DetailItem label="Smoker" value={employeeDetails.smoker ? 'Yes' : 'No'} />
        </View>
      </View>
    </ScrollView>
  );
};

// Helper component for detail items
const DetailItem = ({ label, value }: { label: string; value: string | undefined }) => (
  <View style={styles.detailRow}>
    <Text style={styles.labelText}>{label}</Text>
    <Text style={styles.valueText}>{value || '-'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  contentContainer: {
    padding: 16,
  },
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  labelText: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  valueText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default ViewEmployeeDetail;
