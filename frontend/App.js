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
  container: {
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
});
