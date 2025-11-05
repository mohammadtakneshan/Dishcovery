import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.title}>🍽️ Dishcovery</Text>
      <Text style={styles.subtitle}>AI-Powered Recipe Discovery</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>✅ Frontend Ready!</Text>
        <Text style={styles.text}>Your React Native app is running</Text>
      </View>
      <View style={styles.infoBox}>
        <Text style={styles.infoTitle}>📋 Next Steps:</Text>
        <Text style={styles.infoText}>• Add your screens in src/screens/</Text>
        <Text style={styles.infoText}>• Use components from src/components/</Text>
        <Text style={styles.infoText}>• Connect to backend at localhost:5001</Text>
      </View>
      <Text style={styles.footer}>v1.0.0-beta1</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 18,
    color: '#666',
    marginBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    width: '100%',
    maxWidth: 400,
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
    color: '#0ea5e9',
  },
  text: {
    fontSize: 16,
    color: '#666',
  },
  infoBox: {
    backgroundColor: '#e0f2fe',
    padding: 20,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#0369a1',
  },
  infoText: {
    fontSize: 14,
    color: '#075985',
    marginBottom: 8,
  },
  footer: {
    marginTop: 32,
    fontSize: 12,
    color: '#999',
  },
});
