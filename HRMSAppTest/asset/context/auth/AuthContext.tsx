import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext<any>(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: any) => {
  const [authData, setAuthData] = useState({ loginId: '', password: '', scannedData: null, baseUrl: '' });

  const setAuth = (data: any) => setAuthData(data);

  useEffect(() => {
    const checkBaseUrl = async () => {
      const storedBaseUrl = await AsyncStorage.getItem('baseUrl');
      console.log("Base URL: " + storedBaseUrl);  // Corrected this line to use storedBaseUrl

      if (!storedBaseUrl) {
        Alert.alert('Error', 'Base URL is not defined. Please login again.');
        // Navigate to Login if baseUrl is missing
        // You can also handle redirection to the login page here
      }
    };
    checkBaseUrl();
  }, []);

  return (
    <AuthContext.Provider value={{ authData, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};
