import React, { useState, useEffect, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Animated, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../modules/setting/ThemeContext';
import { useLanguage } from '../modules/setting/LanguageContext';

const ApprovalMenu = ({ route, navigation }: any) => {
  const { theme } = useTheme();
  const { language } = useLanguage();
  const { companyId, baseUrl, decodedToken } = route.params;
  const [loggedIn, setLoggedIn] = useState(true);
  const [scrollOffset, setScrollOffset] = useState(0);
  const fadeAnim = new Animated.Value(0);

  const employeeId = decodedToken?.decodedPayload?.employee_id;
  const employeeNumber = decodedToken?.decodedPayload?.employee_no || 'N/A';
  const employeeName = decodedToken?.decodedPayload?.employee_name || 'N/A';

  const getLocalizedText = (key: string) => {
    const translations = {
      en: {
        payslip: 'Payslip',
        leave: 'Leave',
        logOut: 'Log Out',
        error: 'Error',
        employeeIdUnavailable: 'Employee ID is unavailable',
        companyIdUnavailable: 'Company ID is unavailable',
      },
      ms: {
        payslip: 'Slip Gaji',
        leave: 'Cuti',
        logOut: 'Log Keluar',
        error: 'Ralat',
        employeeIdUnavailable: 'ID Pekerja tidak tersedia',
        companyIdUnavailable: 'ID Syarikat tidak tersedia',
      },
    };
    return translations[language as keyof typeof translations]?.[key as keyof typeof translations[keyof typeof translations]] || key;
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: {
        backgroundColor: theme.headerBackground,
        shadowColor: 'transparent',
        elevation: 0,
      },
      headerTintColor: theme.text,
      headerTitleStyle: {
        color: theme.text,
      },
      headerShadowVisible: false,
    });
  }, [navigation, theme]);

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      setLoggedIn(false);
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      Alert.alert(getLocalizedText('error'), 'Failed to logout');
    }
  };

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

  return (
    <View style={styles.containerWrapper}>
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: theme.background }]}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        <View>
          <TouchableOpacity
            style={[styles.viewDetailButton, { backgroundColor: theme.card }]}
            onPress={() => {
              if (employeeId) {
                navigation.navigate('ViewEmployeeDetail', { employeeId });
              } else {
                Alert.alert(getLocalizedText('error'), getLocalizedText('employeeIdUnavailable'));
              }
            }}
          >
            <View style={styles.buttonContent}>
              <View style={styles.textContainer}>
                <Text style={[styles.employeeNoText, { color: theme.subText }]}>{employeeNumber}</Text>
                <Text style={[styles.employeeNameText, { color: theme.text }]}>{employeeName}</Text>
              </View>
              <Image
                source={require('../../img/icon/a-avatar.png')}
                style={styles.avatarStyle}
              />
            </View>
          </TouchableOpacity>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.squareButton, { backgroundColor: theme.card }]}
              onPress={() => {
                if (employeeId) {
                  navigation.navigate('Payslip', { baseUrl, employeeId });
                } else {
                  Alert.alert(getLocalizedText('error'), getLocalizedText('employeeIdUnavailable'));
                }
              }}
            >
              <View style={styles.iconTextContainer}>
                <Image source={require('../../img/icon/gongzidan.png')} style={[styles.iconImage, { tintColor: theme.primary }]} />
                <Text style={[styles.squareButtonText, { color: theme.text }]}>{getLocalizedText('payslip')}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.squareButton, { backgroundColor: theme.card }]}
              onPress={() => {
                if (employeeId) {
                  navigation.navigate('LeaveMenu', { baseUrl, employeeId });
                } else {
                  Alert.alert(getLocalizedText('error'), getLocalizedText('employeeIdUnavailable'));
                }
              }}
            >
              <View style={styles.iconTextContainer}>
                <Image source={require('../../img/icon/leave2.png')} style={[styles.iconImage, { tintColor: theme.primary }]} />
                <Text style={[styles.squareButtonText, { color: theme.text }]}>{getLocalizedText('leave')}</Text>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.squareButton, styles.logoutButtonStyle, { backgroundColor: theme.card }]}
              onPress={handleLogout}
            >
              <View style={styles.iconTextContainer}>
                <Image source={require('../../img/icon/tuichu.png')} style={[styles.iconImage, { tintColor: theme.error }]} />
                <Text style={[styles.squareButtonText, { color: theme.error }]}>{getLocalizedText('logOut')}</Text>
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
    padding: 16,
  },
  viewDetailButton: {
    width: '100%',
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
    marginBottom: 8,
  },
  employeeNameText: {
    fontSize: 24,
    fontWeight: 'bold',
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
  },
  logoutButtonStyle: {
    backgroundColor: '#FFF0F0',
  },
  scrollIndicator: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -20 }],
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
  },
});

export default ApprovalMenu;
