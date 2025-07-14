import React from 'react';
import { View, Text, StyleSheet} from 'react-native';

export default function HomeScreen() {
  return (
    <View>
      <Text style={styles.text}>Welcome Home!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0', // light background for visibility
  },
  text: {
    fontSize: 20,
    color: '#333',
  },
});