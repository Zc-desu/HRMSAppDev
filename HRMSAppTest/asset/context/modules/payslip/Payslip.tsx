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

type PayslipNavigationProp = {
  navigate: (screen: string, params?: {
    baseUrl: string;
    employeeId: string;
    payrollType: string;
    payrollDate: string;
  }) => void;
};

const Payslip = ({ route, navigation }: any) => {
  const { baseUrl, employeeId } = route?.params || {};
  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [year, setYear] = useState<number>(new Date().getFullYear());

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
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const formattedDate = new Date(date);
    const month = months[formattedDate.getMonth()];
    const year = formattedDate.getFullYear();
    
    return `${month} ${year}`;
  };

  const renderPayslip = ({ item }: any) => (
    <TouchableOpacity
      style={styles.payslipCard}
      onPress={() => handleViewPayslip(item.payrollType, item.payrollDate)}
      activeOpacity={0.7}
    >
      <View style={styles.payslipContent}>
        <View style={styles.textContainer}>
          <Text style={styles.payrollDateText}>
            {formatDate(item.payrollDate)}
          </Text>
          <Text style={styles.descriptionText}>
            {item.payrollTypeDescription || 'N/A'}
          </Text>
        </View>
        <View style={styles.viewButtonContainer}>
          <Image
            source={require('../../../../asset/img/icon/sousuo.png')}
            style={styles.icon}
          />
          <Text style={styles.viewButtonText}>View</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerCard}>
        <Text style={styles.headerText}>Yearly Payslip</Text>
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
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <View style={styles.contentContainer}>
          <FlatList
            data={payslips}
            renderItem={renderPayslip}
            keyExtractor={(item: any) => item.payrollDate}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={
              !error ? (
                <View style={styles.messageContainer}>
                  <Text style={styles.messageText}>
                    No payslips available for {year}.
                  </Text>
                </View>
              ) : (
                <View style={styles.messageContainer}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )
            }
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  yearNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearButton: {
    padding: 12,
    borderRadius: 8,
  },
  yearText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 32,
  },
  arrowIcon: {
    width: 28,
    height: 28,
    tintColor: '#007AFF',
  },
  listContainer: {
    paddingBottom: 16,
  },
  payslipCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  payslipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  payrollDateText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
  },
  viewButtonContainer: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: 90,
    height: 90,
  },
  icon: {
    width: 32,
    height: 32,
    tintColor: '#FFFFFF',
    marginBottom: 8,
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageContainer: {
    padding: 24,
    alignItems: 'center',
  },
  messageText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
  },
  contentContainer: {
    flex: 1,
  },
});

export default Payslip;
