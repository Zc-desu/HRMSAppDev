import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
// Basic screen flow process
import LoginScreen from './asset/context/src/LoginScreen';
import ScanQRScreen from './asset/context/src/ScanQRScreen';
import ProfileSwitch from './asset/context/src/ProfileSwitch';
// Import role
import ApprovalMenu from './asset/context/role/ApprovalMenu';
import EmployeeMenu from './asset/context/role/EmployeeMenu';
// Import Employee Module
import ViewEmployeeDetail from './asset/context/modules/employee/ViewEmployeeDetail';
// Import Payslip Module
import Payslip from './asset/context/modules/payslip/Payslip';
import ViewPayslip from './asset/context/modules/payslip/ViewPayslip';
// Import Leave Module
import LeaveMenu from './asset/context/modules/leave/LeaveMenu';
import LeaveApplicationListing from './asset/context/modules/leave/LeaveApplicationListing';
import LeaveDetail from './asset/context/modules/leave/LeaveDetail';
import CancelLeaveApplication from './asset/context/modules/leave/CancelLeaveApplication';
import CreateLeaveApplication from './asset/context/modules/leave/CreateLeaveApplication';
import LeaveEntitlementListing from './asset/context/modules/leave/LeaveEntitlementListing';
// Import Setting
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
          options={{ 
            title: 'Payslip',
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: '600',
              color: '#333',
            },
            headerTitleAlign: 'center',
          }}
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
          options={{ 
            title: 'Leave',
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: '600',
              color: '#333',
            },
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="LeaveApplicationListing"
          component={LeaveApplicationListing}
          options={{ 
            title: 'List of Leave Application',
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: '600',
              color: '#333',
            },
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="LeaveDetail"
          component={LeaveDetail}
          options={{ 
            title: 'Detail',
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: '600',
              color: '#333',
            },
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="CancelLeaveApplication"
          component={CancelLeaveApplication}
          options={{ 
            title: 'Cancel Leave Application',
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: '600',
              color: '#333',
            },
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="CreateLeaveApplication"
          component={CreateLeaveApplication}
          options={{ 
            title: 'Create Leave Application',
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: '600',
              color: '#333',
            },
            headerTitleAlign: 'center',
          }}
        />
        <Stack.Screen
          name="LeaveEntitlementListing"
          component={LeaveEntitlementListing}
          options={{ 
            title: 'Leave Entitlement',
            headerTitleStyle: {
              fontSize: 20,
              fontWeight: '600',
              color: '#333',
            },
            headerTitleAlign: 'center',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
