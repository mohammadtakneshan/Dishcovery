import React, { useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import UploadScreen from "./src/screens/UploadScreen";
import RecipeScreen from "./src/screens/RecipeScreen";

export default function App() {
  const [recipe, setRecipe] = useState(null);

  const handleRecipe = (r) => {
    setRecipe(r);
  };

  const handleBack = () => {
    setRecipe(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      {recipe ? (
        <RecipeScreen recipe={recipe} onBack={handleBack} />
      ) : (
        <UploadScreen onRecipe={handleRecipe} />
      )}
    </SafeAreaView>
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
