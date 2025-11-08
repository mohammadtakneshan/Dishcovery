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
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 3,
    marginBottom: 24,
    maxWidth: 400,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    width: '100%',
  },
  cardTitle: {
    color: '#0ea5e9',
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 12,
  },
  container: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  footer: {
    color: '#999',
    fontSize: 12,
    marginTop: 32,
  },
  infoBox: {
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    maxWidth: 400,
    padding: 20,
    width: '100%',
  },
  infoText: {
    color: '#075985',
    fontSize: 14,
    marginBottom: 8,
  },
  infoTitle: {
    color: '#0369a1',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  subtitle: {
    color: '#666',
    fontSize: 18,
    marginBottom: 40,
  },
  text: {
    color: '#666',
    fontSize: 16,
  },
  title: {
    color: '#1a1a1a',
    fontSize: 48,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
