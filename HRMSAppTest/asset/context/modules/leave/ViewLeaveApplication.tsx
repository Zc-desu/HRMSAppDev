import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ViewLeaveApplication = () => {
  const [leaveData, setLeaveData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [baseUrl, setBaseUrl] = useState('');
  const [userToken, setUserToken] = useState('');

  useEffect(() => {
    const fetchLeaveData = async () => {
      try {
        const employeeId = await AsyncStorage.getItem('employeeId');
        const token = await AsyncStorage.getItem('userToken');
        const baseUrl = await AsyncStorage.getItem('baseUrl');
        
        if (employeeId && token && baseUrl) {
          setUserToken(token);
          setBaseUrl(baseUrl);

          const url = `${baseUrl}/apps/api/v1/employees/${employeeId}/leaves?Year=2024`;

          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          const data = await response.json();
          
          if (data.success) {
            setLeaveData(data.data);
          } else {
            console.error('Failed to fetch data:', data.message);
          }
        }
      } catch (error) {
        console.error('Error fetching leave data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaveData();
  }, []);

  const renderLeaveItem = ({ item }: { item: { 
    leaveCodeDesc: string;
    approvalStatusDisplay: string;
    dateFrom: string;
    dateTo: string;
    reason?: string;
  }}) => (
    <View style={styles.leaveItem}>
      <Text style={styles.leaveText}>{item.leaveCodeDesc} ({item.approvalStatusDisplay})</Text>
      <Text>{item.dateFrom} to {item.dateTo}</Text>
      <Text>Reason: {item.reason || 'N/A'}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={leaveData}
        renderItem={renderLeaveItem}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaveItem: {
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  leaveText: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
});

export default ViewLeaveApplication;
