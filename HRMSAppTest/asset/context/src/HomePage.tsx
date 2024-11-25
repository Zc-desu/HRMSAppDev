import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const HomePage = ({ navigation, route }: any) => {
  const { selectedCompanyName } = route.params; // Get the selected company's name from params

  return (
    <View style={styles.container}>
      <Text style={styles.welcomeText}>Welcome to {selectedCompanyName}!</Text>
      <Text style={styles.infoText}>This is your Home Page.</Text>

      {/* Button to navigate back */}
      <Button
        title="Back to Profile Selection"
        onPress={() => navigation.navigate('App')}

      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 20,
  },
});

export default HomePage;
