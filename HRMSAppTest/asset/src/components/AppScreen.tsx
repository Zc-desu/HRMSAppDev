// AppScreen.tsx (Assuming this is your main screen after login)
import React from 'react';
import { View, Button, Alert, Text, StyleSheet } from 'react-native';

const AppScreen = ({ navigation }: any) => {
  
  const handleLogout = () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel",
        },
        { 
          text: "OK", 
          onPress: () => {
            // Navigate to login screen
            navigation.navigate('Login'); 
            console.log("Successfully Log out!");
          }
        }
      ],
      { cancelable: false }
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome to the App!</Text>
      <Button title="Log Out" onPress={handleLogout} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    marginBottom: 20,
  },
});

export default AppScreen;
