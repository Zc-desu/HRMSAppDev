import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ApprovalMenu = ({ route, navigation }: any) => {
  const { companyId, baseUrl, decodedToken } = route.params;
  const [loggedIn, setLoggedIn] = useState(true);
  const [scrollOffset, setScrollOffset] = useState(0);
  const fadeAnim = new Animated.Value(0); // Initial opacity 0

  const handleScroll = (event: any) => {
    const currentOffset = event.nativeEvent.contentOffset.y;
    setScrollOffset(currentOffset);
    
    // Show indicator when scrolling
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Hide indicator after scrolling stops
    if (currentOffset > 0) {
      const timeoutId = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }, 1000);

      return () => clearTimeout(timeoutId);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      setLoggedIn(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to logout');
    }
  };

  const employeeId = decodedToken?.decodedPayload?.employee_id;
  const employeeNumber = decodedToken?.decodedPayload?.employee_no || 'N/A';
  const employeeName = decodedToken?.decodedPayload?.employee_name || 'N/A';

  return (
    <View style={styles.containerWrapper}>
      <ScrollView 
        contentContainerStyle={styles.container}
        onScroll={handleScroll}
        scrollEventThrottle={16} // For smooth scroll tracking
      >
        <View>
          <TouchableOpacity 
            style={styles.viewDetailButton}
            onPress={() => {
              if (employeeId) {
                navigation.navigate('ViewEmployeeDetail', { employeeId });
              } else {
                Alert.alert('Error', 'Employee ID is unavailable');
              }
            }}
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
              onPress={() => {
                if (employeeId) {
                  navigation.navigate('Payslip', { baseUrl, employeeId });
                } else {
                  Alert.alert('Error', 'Employee ID is unavailable');
                }
              }}
            >
              <View style={styles.iconTextContainer}>
                <Image source={require('../../img/icon/gongzidan.png')} style={styles.iconImage} />
                <Text style={styles.squareButtonText}>Payslip</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.squareButton}
              onPress={() => {
                if (employeeId) {
                  navigation.navigate('LeaveMenu', { baseUrl, employeeId });
                } else {
                  Alert.alert('Error', 'Employee ID is unavailable');
                }
              }}
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

      <Animated.View 
        style={[
          styles.scrollIndicator,
          {
            opacity: fadeAnim,
          }
        ]}
      >
        <Image 
          source={require('../../img/icon/a-d-caret.png')} 
          style={styles.scrollIcon}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  containerWrapper: {
    flex: 1,
    position: 'relative',
  },
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
  scrollIndicator: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -20 }], // Center the icon vertically
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scrollIcon: {
    width: 24,
    height: 24,
    tintColor: '#333',
  },
});

export default ApprovalMenu;
