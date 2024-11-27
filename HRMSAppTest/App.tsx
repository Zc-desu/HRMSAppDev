import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './asset/context/auth/AuthContext';
import LoginScreen from './asset/context/src/LoginScreen';
import ScanQRScreen from './asset/context/src/ScanQRScreen';
import ProfileSwitch from './asset/context/src/ProfileSwitch';
import ApprovalMenu from './asset/context/role/ApprovalMenu';
import EmployeeMenu from './asset/context/role/EmployeeMenu';
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
            options={{ 
              headerLeft: () => null, 
              headerShown: false
            }} 
          />
          <Stack.Screen name="ScanQR" component={ScanQRScreen} />
          <Stack.Screen 
            name="ProfileSwitch" 
            component={ProfileSwitch} 
            options={{ 
              headerLeft: () => null, 
              headerShown: false 
            }} 
          />
          <Stack.Screen 
            name="ApprovalMenu" 
            component={ApprovalMenu} 
            options={{ 
              headerLeft: () => null, 
              headerShown: false 
            }} 
          />
          <Stack.Screen name="EmployeeMenu" component={EmployeeMenu} />
          <Stack.Screen name="Profile" component={ShowEmployeeDetail} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
};

export default App;
