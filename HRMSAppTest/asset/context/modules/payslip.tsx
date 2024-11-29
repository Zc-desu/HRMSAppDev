import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Payslip = ({ route, navigation }: any) => {
  // Destructure baseUrl and employeeId from route.params
  const { baseUrl, employeeId } = route?.params || {}; 
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState<number>(new Date().getFullYear()); // Get the current year from the system date

  // Check if baseUrl and employeeId are available
  useEffect(() => {
    if (!baseUrl || !employeeId) {
      Alert.alert('Error', 'Base URL or Employee ID is missing.');
      setError('Missing required data (Base URL or Employee ID).');
      setLoading(false);
    } else {
      fetchPayslips(); // Call the function if data is available
    }
  }, [baseUrl, employeeId, year]);

  // Fetch Payslips based on the selected year
  const fetchPayslips = async () => {
    const userToken = await AsyncStorage.getItem('userToken');

    // Early return if userToken is missing
    if (!userToken) {
      setError('User token is missing.');
      setLoading(false);
      return;
    }

    const url = `${baseUrl}/apps/api/v1/employees/${employeeId}/payslips/${year}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${userToken}`,
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && result.success && result.data) {
        setPayslips(result.data); // Set payslips data
        setLoading(false);
      } else {
        setError(result.message || 'Failed to fetch payslips');
        setPayslips([]); // Reset payslips data if error
        setLoading(false);
      }
    } catch (err) {
      console.error('Error fetching payslips:', err); // Log error for debugging
      setError('Error fetching payslips');
      setPayslips([]); // Reset payslips data if error
      setLoading(false);
    }
  };

  const handlePrevYear = () => {
    setYear(prevYear => prevYear - 1); // Decrease the year by 1
  };

  const handleNextYear = () => {
    setYear(prevYear => prevYear + 1); // Increase the year by 1
  };

  const renderPayslip = ({ item }: any) => (
    <View style={styles.payslipItem}>
      <Text style={styles.payslipText}>Payroll Date: {item.payrollDate || 'N/A'}</Text>
      <Text style={styles.payslipText}>Description: {item.payrollTypeDescription || 'N/A'}</Text>
      <Text style={styles.payslipText}>File: {item.fileName || 'No file available'}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Payslip</Text>

      {/* Year Navigation */}
      <View style={styles.yearNavigation}>
        <TouchableOpacity onPress={handlePrevYear} style={styles.yearButton}>
          <Text style={styles.yearButtonText}>{'<'}</Text>
        </TouchableOpacity>
        <Text style={styles.yearText}>{year}</Text>
        <TouchableOpacity onPress={handleNextYear} style={styles.yearButton}>
          <Text style={styles.yearButtonText}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#0000ff" />}

      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={payslips}
        renderItem={renderPayslip}
        keyExtractor={(item: any) => item.payrollDate}
        ListEmptyComponent={<Text style={styles.noDataText}>No payslips available for this year.</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  yearNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Centering the year and buttons
    marginBottom: 20,
  },
  yearButton: {
    backgroundColor: '#243a84',
    borderRadius: 50, // Round buttons
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginHorizontal: 10, // Space between the buttons
  },
  yearButtonText: {
    color: 'white',
    fontSize: 24, // Larger text size for visibility
    textAlign: 'center',
  },
  yearText: {
    fontSize: 28, // Larger text for the year
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
  },
  noDataText: {
    fontSize: 16,
    color: 'gray',
    marginTop: 10,
    textAlign: 'center',
  },
  payslipItem: {
    marginBottom: 15,
  },
  payslipText: {
    fontSize: 16,
  },
});

export default Payslip;
