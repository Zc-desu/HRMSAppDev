import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './asset/context/auth/AuthContext';
import LoginScreen from './asset/context/src/LoginScreen';
import ScanQRScreen from './asset/context/src/ScanQRScreen';
import ProfileSwitch from './asset/context/src/ProfileSwitch';
import HomePage from './asset/context/src/HomePage';
import ShowEmployeeDetail from './asset/context/src/ShowEmployeeDetail';

const Stack = createStackNavigator();

const App = () => {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerLeft: () => null }} 
          />
          <Stack.Screen name="ScanQR" component={ScanQRScreen} />
          <Stack.Screen 
            name="ProfileSwitch" 
            component={ProfileSwitch} 
            options={{ headerLeft: () => null }} 
          />
          <Stack.Screen name="HomePage" component={HomePage} />
          <Stack.Screen name="Profile" component={ShowEmployeeDetail} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
