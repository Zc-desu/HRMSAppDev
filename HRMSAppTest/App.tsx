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
import ApproveLeaveApplicationListing from './asset/context/modules/leave/ApproveLeaveApplicationListing';
import ApproveLeaveDetail from './asset/context/modules/leave/ApproveLeaveDetail';
// Import Noticeboard Module
import NBGetList from './asset/context/modules/noticeboard/NBGetList';
import NBDetails from './asset/context/modules/noticeboard/NBDetails';
import NBGetFileAttachment from './asset/context/modules/noticeboard/NBGetFileAttachment';
// Import Attendance and Overtime Module
import ATMenu from './asset/context/modules/attendance/ATMenu';
import ATShowMap from './asset/context/modules/attendance/ATShowMap';
import ATPhotoCapture from './asset/context/modules/attendance/ATPhotoCapture';
import ATTimeLogListing from './asset/context/modules/attendance/ATTimeLogListing';
import ATTimeLogDetails from './asset/context/modules/attendance/ATTimeLogDetails';
import ATTimeLogPhoto from './asset/context/modules/attendance/ATTimeLogPhoto';
import ATBackDateTLApplication from './asset/context/modules/attendance/ATBackDateTLApplication';
import ATPendingApplicationListing from './asset/context/modules/attendance/ATPendingApplicationListing';
import ATPendingApplicationDetails from './asset/context/modules/attendance/ATPendingApplicationDetails';
import OTApplicationListing from './asset/context/modules/attendance/OTApplicationListing';
import OTApplicationDetails from './asset/context/modules/attendance/OTApplicationDetails';
import OTCreateApplication from './asset/context/modules/attendance/OTCreateApplication';
import OTCancelApplication from './asset/context/modules/attendance/OTCancelApplication';
import OTPendingApplicationListing from './asset/context/modules/attendance/OTPendingApplicationListing';
import OTPendingApplicationDetails from './asset/context/modules/attendance/OTPendingApplicationDetails';
import ATDutyRoasterCalendar from './asset/context/modules/attendance/ATDutyRoasterCalendar';

// Import Approve Module
import ApproveManagement from './asset/context/modules/approve/ApproveManagement';

// Import Setting
import Settings from './asset/context/src/Settings';
import ChangeTheme from './asset/context/modules/setting/ChangeTheme';
import { ThemeProvider } from './asset/context/modules/setting/ThemeContext';
import { LanguageProvider } from './asset/context/modules/setting/LanguageContext';
import LanguageSelector from './asset/context/modules/setting/LanguageSelector';
import Help from './asset/context/modules/setting/Help';
const Stack = createStackNavigator();

const App = () => {
  return (
    <LanguageProvider>
      <ThemeProvider>
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
            />
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
            <Stack.Screen
              name="ApproveLeaveApplicationListing"
              component={ApproveLeaveApplicationListing}
              options={{ 
                title: 'Approve Leave Application',
                headerTitleStyle: {
                  fontSize: 20,
                  fontWeight: '600',
                  color: '#333',
                },
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="ApproveLeaveDetail"
              component={ApproveLeaveDetail}
              options={{ 
                title: 'Approve Leave Application',
                headerTitleStyle: {
                  fontSize: 20,
                  fontWeight: '600',
                  color: '#333',
                },
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="NBGetList"
              component={NBGetList}
              options={{ 
                title: 'Notice Board',
                headerTitleStyle: {
                  fontSize: 20,
                  fontWeight: '600',
                  color: '#333',
                },
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="NBDetails"
              component={NBDetails}
              options={{
                title: 'Notice Details',
                headerTitleStyle: {
                  fontSize: 20,
                  fontWeight: '600',
                  color: '#333',
                },
                headerTitleAlign: 'center',
              }}
            />  
            <Stack.Screen 
              name="NBGetFileAttachment" 
              component={NBGetFileAttachment}
              options={{
                title: 'File Viewer',
                headerShown: true,
                headerTitleStyle: {
                  fontSize: 20,
                  fontWeight: '600',
                  color: '#333',
                },
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="ATMenu"
              component={ATMenu}
              options={{ 
                title: 'Attendance',
                headerTitleStyle: {
                  fontSize: 20,
                  fontWeight: '600',
                  color: '#333',
                },
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="ATShowMap"
              component={ATShowMap}
              options={{
                title: 'GPS Location',
                headerTitleStyle: {
                  fontSize: 20,
                  fontWeight: '600',
                  color: '#333',
                },
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="ATPhotoCapture"
              component={ATPhotoCapture}
              options={{
                title: 'Photo Capture',
                headerTitleStyle: {
                  fontSize: 20,
                  fontWeight: '600',
                  color: '#333',
                },
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="ATTimeLogListing"
              component={ATTimeLogListing}
              options={{
                title: 'Time Log Listing',
                headerTitleStyle: {
                  fontSize: 20,
                  fontWeight: '600',
                  color: '#333',
                },
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="ATTimeLogDetails"
              component={ATTimeLogDetails}
              options={{
                title: 'Time Log Details',
                headerTitleStyle: {
                  fontSize: 20,
                  fontWeight: '600',
                  color: '#333',
                },
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="ATTimeLogPhoto"
              component={ATTimeLogPhoto}
              options={{
                title: 'Photo',
                headerTitleStyle: {
                  fontSize: 20,
                  fontWeight: '600',
                  color: '#333',
                },
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="ATBackDateTLApplication"
              component={ATBackDateTLApplication}
              options={{
                title: 'Back Date Time Log Application',
                headerTitleStyle: {
                  fontSize: 20,
                  fontWeight: '600',
                  color: '#333',
                },
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="ATPendingApplicationListing"
              component={ATPendingApplicationListing}
              options={{
                title: 'Pending Application',
                headerTitleStyle: {
                  fontSize: 20,
                  fontWeight: '600',
                  color: '#333',
                },
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="ATPendingApplicationDetails"
              component={ATPendingApplicationDetails}
              options={{
                title: 'Pending Application Details',
                headerTitleStyle: {
                  fontSize: 20,
                  fontWeight: '600',
                  color: '#333',
                },
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="OTApplicationListing"
              component={OTApplicationListing}
              options={{
                title: 'Overtime Application',
                headerTitleStyle: {
                  fontSize: 20,
                  fontWeight: '600',
                  color: '#333',
                },
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="OTApplicationDetails"
              component={OTApplicationDetails}
              options={{
                title: 'Overtime Application Details',
                headerTitleStyle: {
                  fontSize: 20,
                  fontWeight: '600',
                  color: '#333',
                },
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="OTCreateApplication"
              component={OTCreateApplication}
              options={{
                title: 'Create Overtime',
                headerTitleStyle: {
                  fontSize: 20,
                  fontWeight: '600',
                  color: '#333',
                },
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="OTCancelApplication"
              component={OTCancelApplication}
              options={{
                title: 'Cancel Overtime Application',
                headerTitleStyle: {
                  fontSize: 20,
                  fontWeight: '600',
                  color: '#333',
                },
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="OTPendingApplicationListing"
              component={OTPendingApplicationListing}
              options={{
                title: 'Pending Overtime Application',
                headerTitleStyle: {
                  fontSize: 20,
                  fontWeight: '600',
                  color: '#333',
                },
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="OTPendingApplicationDetails"
              component={OTPendingApplicationDetails}
              options={{
                title: 'Pending Overtime Application Details',
                headerTitleStyle: {
                  fontSize: 20,
                  fontWeight: '600',
                  color: '#333',
                },
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="ATDutyRoasterCalendar"
              component={ATDutyRoasterCalendar}
              options={{
                title: 'Duty Roaster Calendar',
                headerTitleStyle: {
                  fontSize: 20,
                  fontWeight: '600',
                  color: '#333',
                },
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="ApproveManagement"
              component={ApproveManagement}
              options={{
                title: 'Approve Management',
                headerTitleStyle: {
                  fontSize: 20,
                  fontWeight: '600',
                  color: '#333',
                },
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="LanguageSelector"
              component={LanguageSelector}
              options={{
                title: 'Language',
                headerTitleStyle: {
                  fontSize: 17,
                  fontWeight: '600',
                },
                headerTitleAlign: 'center',
                headerShadowVisible: false,
              }}
            />
            <Stack.Screen
              name="ChangeTheme"
              component={ChangeTheme}
              options={{ 
                title: 'Change Theme',
                headerTitleStyle: {
                  fontSize: 20,
                  fontWeight: '600',
                  color: '#333',
                },
                headerTitleAlign: 'center',
              }}
            />
            <Stack.Screen
              name="Help"
              component={Help}
              options={{
                title: 'Help',
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
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default App;
