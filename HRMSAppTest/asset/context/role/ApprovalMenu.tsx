import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';  // Ensure AsyncStorage is imported

const ApprovalMenu = ({ route, navigation }: any) => {
  const { companyId, baseUrl } = route.params;
  const [loggedIn, setLoggedIn] = useState(true);  // Assuming the user is logged in initially

  const handleLogout = async () => {
    // Show a confirmation alert before logging out
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
            // Handle the actual logout process here
            await AsyncStorage.removeItem('authToken'); // Clear auth token
            navigation.navigate('Login'); // Navigate to login screen
          },
        },
      ],
      { cancelable: false }
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity style={styles.viewDetailButton}>
        <View style={styles.buttonContent}>
          <View style={styles.textContainer}>
            <Text style={styles.employeeNoText}>12345</Text>
            <Text style={styles.employeeNameText}>John Doe</Text>
          </View>
          <View style={styles.avatar} />
        </View>
      </TouchableOpacity>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.squareButton}>
          <Text style={styles.squareButtonText}>Button 1</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.squareButton}>
          <Text style={styles.squareButtonText}>Button 2</Text>
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
        <TouchableOpacity style={[styles.squareButton, styles.logoutButtonStyle]} onPress={handleLogout}>
        <Image source={require('../../img/icon/tuichu.png')} style={styles.logoutImage} />
        <Text style={styles.logoutTextStyle}>Log Out</Text>
      </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
  },
  viewDetailButton: {
    width: '100%',
    backgroundColor: '#007BFF',
    borderRadius: 15,
    paddingVertical: 40,
    marginTop: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  buttonContent: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    paddingLeft: 15,
  },
  employeeNoText: {
    color: 'white',
    fontSize: 22,
    marginBottom: 5,
  },
  employeeNameText: {
    color: 'white',
    fontSize: 26,
    marginBottom: 5,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    right: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  squareButton: {
    width: '48%',
    aspectRatio: 1,  // Ensures the button maintains a square aspect ratio
    backgroundColor: '#007BFF',
    borderRadius: 10,
    paddingVertical: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  squareButtonText: {
    color: 'white',
    fontSize: 16,
  },
  logoutButtonStyle: {
    backgroundColor: '#FF4C4C',  // Red to make it distinct as the log out button
  },  
  logoutImage: {
    width: 40,  // Adjust the width as per your image size
    height: 40, // Adjust the height as per your image size
    marginBottom: 10, // Space between image and text
  },
  logoutTextStyle: {
    color: 'black',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ApprovalMenu;
