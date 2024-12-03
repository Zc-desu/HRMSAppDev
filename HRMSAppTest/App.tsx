import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './asset/context/src/LoginScreen';
import ScanQRScreen from './asset/context/src/ScanQRScreen';
import ProfileSwitch from './asset/context/src/ProfileSwitch';
import ApprovalMenu from './asset/context/role/ApprovalMenu';
import EmployeeMenu from './asset/context/role/EmployeeMenu';
import ViewEmployeeDetail from './asset/context/modules/employee/ViewEmployeeDetail';
import Payslip from './asset/context/modules/payslip/Payslip';
import ViewPayslip from './asset/context/modules/payslip/ViewPayslip';
import LeaveMenu from './asset/context/modules/leave/LeaveMenu';
import LeaveApplicationListing from './asset/context/modules/leave/LeaveApplicationListing';
import LeaveDetail from './asset/context/modules/leave/LeaveDetail';
import Settings from './asset/context/src/Settings';

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
        <Stack.Screen
          name="Settings"
          component={Settings}
          // //options={{ 
          //   //headerLeft: () => null,
          //   //headerShown: false 
          // //}}
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
        <Stack.Screen
          name="ViewPayslip"
          component={ViewPayslip}
          // //options={{ 
          //   //headerLeft: () => null,
          //   //headerShown: false 
          // //}}
        />
        <Stack.Screen
          name="LeaveMenu"
          component={LeaveMenu}
          // //options={{ 
          //   //headerLeft: () => null,
          //   //headerShown: false 
          // //}}
        />
        <Stack.Screen
          name="LeaveApplicationListing"
          component={LeaveApplicationListing}
          // //options={{ 
          //   //headerLeft: () => null,
          //   //headerShown: false 
          // //}}
        />
        <Stack.Screen
          name="LeaveDetail"
          component={LeaveDetail}
          // //options={{ 
          //   //headerLeft: () => null,
          //   //headerShown: false 
          // //}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
