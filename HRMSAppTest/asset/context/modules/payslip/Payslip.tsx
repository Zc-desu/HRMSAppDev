import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

type PayslipNavigationProp = {
  navigate: (screen: string, params?: {
    baseUrl: string;
    employeeId: string;
    payrollType: string;
    payrollDate: string;
  }) => void;
};

const Payslip = ({ route }: any) => {
  const { baseUrl, employeeId } = route?.params || {};
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const navigation = useNavigation<PayslipNavigationProp>();

  useEffect(() => {
    if (!baseUrl || !employeeId) {
      Alert.alert('Error', 'Base URL or Employee ID is missing.');
      setError('Missing required data (Base URL or Employee ID).');
      setLoading(false);
    } else {
      fetchPayslips();
    }
  }, [baseUrl, employeeId, year]);

  const fetchPayslips = async () => {
    setLoading(true);
    const userToken = await AsyncStorage.getItem('userToken');

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
        setPayslips(result.data);
      } else {
        setError(result.message || 'Failed to fetch payslips');
        setPayslips([]);
      }
    } catch (err) {
      console.error('Error fetching payslips:', err);

      // Check if the error is due to session expiration or invalid JSON
      if (err instanceof SyntaxError) {
        Alert.alert(
          'Session Expired',
          'Login session expired! Please login again.',
          [
            {
              text: 'OK',
              onPress: async () => {
                // Remove user token and navigate to login screen
                await AsyncStorage.removeItem('userToken');
                navigation.navigate('Login');
                },
            },
          ],
          { cancelable: false }
        );
      } else {
        setError('Error fetching payslips');
      }

      setPayslips([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPayslip = async (payrollType: string, payrollDate: string) => {
    const formattedDate = new Date(payrollDate).toISOString().split('T')[0];

    try {
      await AsyncStorage.setItem('payrollType', payrollType);
      await AsyncStorage.setItem('payrollDate', formattedDate);

      navigation.navigate('ViewPayslip', {
        baseUrl,
        employeeId,
        payrollType,
        payrollDate: formattedDate,
      });
    } catch (error) {
      console.error('Error saving to AsyncStorage:', error);
    }
  };

  const formatDate = (date: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long' };
    const formattedDate = new Date(date);
    return new Intl.DateTimeFormat('en-US', options).format(formattedDate);
  };

  const renderPayslip = ({ item }: any) => (
    <View style={styles.payslipItem}>
      <View style={styles.dateContainer}>
        <View style={styles.textContainer}>
          <Text style={styles.payrollDateText}>
            {formatDate(item.payrollDate) || 'N/A'}
          </Text>
          <Text style={styles.descriptionText}>
            {item.payrollTypeDescription || 'N/A'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => handleViewPayslip(item.payrollType, item.payrollDate)}
          style={styles.viewButton}
        >
          <Image
            source={require('../../../../asset/img/icon/sousuo.png')}
            style={styles.icon}
          />
          <Text style={styles.viewButtonText}>View</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Payslip</Text>

      <View style={styles.yearNavigation}>
        <TouchableOpacity
          onPress={() => setYear((prev) => prev - 1)}
          style={styles.yearButton}
        >
          <Image
            source={require('../../../../asset/img/icon/a-d-arrow-left.png')}
            style={styles.arrowIcon}
          />
        </TouchableOpacity>
        <Text style={styles.yearText}>{year}</Text>
        <TouchableOpacity
          onPress={() => setYear((prev) => prev + 1)}
          style={styles.yearButton}
        >
          <Image
            source={require('../../../../asset/img/icon/a-d-arrow-right.png')}
            style={styles.arrowIcon}
          />
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#0000ff" />}
      {error && <Text style={styles.errorText}>{error}</Text>}

      <FlatList
        data={payslips}
        renderItem={renderPayslip}
        keyExtractor={(item: any) => item.payrollDate}
        ListEmptyComponent={
          <Text style={styles.noDataText}>
            No payslips available for this year.
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  yearNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  yearButton: {
    paddingHorizontal: 15,
    paddingVertical: 15,
    marginHorizontal: 10,
  },
  arrowIcon: {
    width: 30,
    height: 30,
    tintColor: 'black', // Optional: change the color of the arrow icon
  },
  yearText: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: 'gray',
    marginTop: 10,
    textAlign: 'center',
  },
  payslipItem: {
    marginBottom: 15,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
  },
  payrollDateText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  descriptionText: {
    fontSize: 18,
    color: '#555',
    marginTop: 5,
  },
  viewButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007bff',
    width: 80,
    height: 80,
    borderRadius: 20,
  },
  icon: {
    width: 30,
    height: 30,
    tintColor: 'white',
  },
  viewButtonText: {
    fontSize: 14,
    color: 'white',
    marginTop: 5,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },  
});

export default Payslip;
