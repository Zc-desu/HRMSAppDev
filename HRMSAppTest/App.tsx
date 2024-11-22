import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './asset/context/src/LoginScreen';
import ScanQRScreen from './asset/context/src/ScanQRScreen';
import AppScreen from './asset/context/src/AppScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} options={{headerLeft: () => null,}} />
      <Stack.Screen name="ScanQR" component={ScanQRScreen} />
      <Stack.Screen name="App" component={AppScreen} options={{headerLeft: () => null,}} />
    </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
