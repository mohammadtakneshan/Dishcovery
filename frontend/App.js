import React, { useState } from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import UploadScreen from "./src/screens/UploadScreen";
import RecipeScreen from "./src/screens/RecipeScreen";
import { SettingsProvider } from "./src/context/SettingsContext";
import "./src/config/i18n";
import theme from "./src/theme.js";

function RootApp() {
  const [recipeResult, setRecipeResult] = useState(null);

  const handleRecipe = (result) => {
    setRecipeResult(result);
  };

  const handleBack = () => {
    setRecipeResult(null);
  };

  const recipePayload = recipeResult?.recipe ?? recipeResult;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      {recipeResult ? (
        <RecipeScreen
          data={recipeResult}
          recipe={recipePayload}
          onBack={handleBack}
        />
      ) : (
        <UploadScreen onRecipe={handleRecipe} />
      )}
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <RootApp />
    </SettingsProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    minHeight: "100vh",
    alignItems: "center",
    backgroundColor: theme.colors.background || "#FBF7F5",
    justifyContent: "flex-start",
    padding: 20,
  },
});
