import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const EmployeeMenu = ({ route }: any) => {
  const { companyId, baseUrl } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Employee Menu</Text>
      <Text>Company ID: {companyId}</Text>
      <Text>Base URL: {baseUrl}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default EmployeeMenu;
