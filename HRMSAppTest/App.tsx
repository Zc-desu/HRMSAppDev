import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './asset/context/src/LoginScreen';
import ScanQRScreen from './asset/context/src/ScanQRScreen';
import ProfileSwitch from './asset/context/src/ProfileSwitch';
import ApprovalMenu from './asset/context/role/ApprovalMenu';
import EmployeeMenu from './asset/context/role/EmployeeMenu';
import ViewEmployeeDetail from './asset/context/modules/ViewEmployeeDetail';
import Payslip from './asset/context/modules/Payslip';

const Stack = createStackNavigator();

const App = () => {
  return (
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
        {/* Add ApprovalMenu and EmployeeMenu */}
        <Stack.Screen
          name="ApprovalMenu"
          component={ApprovalMenu}
          options={{ 
            headerLeft: () => null,
            headerShown: false 
          }}
        />
        <Stack.Screen
          name="EmployeeMenu"
          component={EmployeeMenu}
          options={{ 
            headerLeft: () => null,
            headerShown: false 
          }}
        />
        <Stack.Screen
          name="ViewEmployeeDetail"
          component={ViewEmployeeDetail}
          //options={{ 
            //headerLeft: () => null,
            //headerShown: false 
          //}}
        />
        <Stack.Screen
          name="Payslip"
          component={Payslip}
          //options={{ 
            //headerLeft: () => null,
            //headerShown: false 
          //}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
