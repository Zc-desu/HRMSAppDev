import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ApprovalMenu = ({ route, navigation }: any) => {
  const { companyId, baseUrl, decodedToken } = route.params;
  const [loggedIn, setLoggedIn] = useState(true);
  const employeeId = decodedToken?.decodedPayload?.employee_id;

  // Destructure employee details from the decoded token
  const employeeName = decodedToken?.decodedPayload?.employee_name;
  const employeeNumber = decodedToken?.decodedPayload?.employee_number;

  const handleLogout = async () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Log out canceled'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: async () => {
            setLoggedIn(false);
            await AsyncStorage.removeItem('authToken');
            navigation.navigate('Login');
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View>
        <TouchableOpacity 
          style={styles.viewDetailButton}
          onPress={() => navigation.navigate('ViewEmployeeDetail', 
            { employeeId: decodedToken.decodedPayload.employee_id })}
        >
          <View style={styles.buttonContent}>
            <View style={styles.textContainer}>
              <Text style={styles.employeeNoText}>{employeeNumber}</Text>
              <Text style={styles.employeeNameText}>{employeeName}</Text>
            </View>
            <Image 
              source={require('../../img/icon/a-avatar.png')} 
              style={styles.avatarStyle}
            />
          </View>
        </TouchableOpacity>

        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.squareButton}
            onPress={() => navigation.navigate('Payslip', { baseUrl, employeeId })}
          >
            <View style={styles.iconTextContainer}>
              <Image source={require('../../img/icon/gongzidan.png')} style={styles.iconImage} />
              <Text style={styles.squareButtonText}>Payslip</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.squareButton}
            onPress={() => navigation.navigate('LeaveMenu', { baseUrl, employeeId })}
          >
            <View style={styles.iconTextContainer}>
              <Image source={require('../../img/icon/leave2.png')} style={styles.iconImage} />
              <Text style={styles.squareButtonText}>Leave</Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.squareButton}>
            <Text style={styles.squareButtonText}>Button 3</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.squareButton}>
            <Text style={styles.squareButtonText}>Button 4</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.squareButton}>
            <Text style={styles.squareButtonText}>Button 5</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.squareButton}>
            <Text style={styles.squareButtonText}>Button 6</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.squareButton}>
            <Text style={styles.squareButtonText}>Button 7</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.squareButton, styles.logoutButtonStyle]} 
            onPress={handleLogout}
          >
            <View style={styles.iconTextContainer}>
              <Image source={require('../../img/icon/tuichu.png')} style={styles.iconImage} />
              <Text style={styles.squareButtonText}>Log Out</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  viewDetailButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 28,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContent: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  textContainer: {
    flex: 1,
  },
  employeeNoText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  employeeNameText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  avatarStyle: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  squareButton: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  squareButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  iconTextContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconImage: {
    width: 40,
    height: 40,
    marginBottom: 8,
    tintColor: '#007AFF',
  },
  logoutButtonStyle: {
    backgroundColor: '#FFF0F0',
  },
});

export default ApprovalMenu;
