import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LeaveMenu = ({ navigation }: any) => {
  const [baseUrl, setBaseUrl] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const menuItems = [
    {
      title: 'View Leave Application',
      screen: 'LeaveApplicationListing',
      icon: require('../../../../asset/img/icon/arrow-right.png'),
    },
    {
      title: 'Create Leave Application',
      screen: 'CreateLeaveApplication',
      icon: require('../../../../asset/img/icon/arrow-right.png'),
    },
    {
      title: 'View Leave Entitlements',
      screen: 'LeaveEntitlementListing',
      icon: require('../../../../asset/img/icon/arrow-right.png'),
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Leave Management</Text>
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuCard}
            onPress={() => navigation.navigate(item.screen, { baseUrl, employeeId })}
          >
            <View style={styles.menuContent}>
              <Text style={styles.menuText}>{item.title}</Text>
              <Image
                source={item.icon}
                style={styles.icon}
              />
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    marginTop: 10,
  },
  menuContainer: {
    flex: 1,
    gap: 12,
  },
  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  icon: {
    width: 20,
    height: 20,
    tintColor: '#007AFF',
  },
});

export default LeaveMenu;
