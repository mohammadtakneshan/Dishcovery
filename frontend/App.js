import React from "react";
import { SafeAreaView, StatusBar, StyleSheet } from "react-native";
import UploadScreen from "./src/screens/UploadScreen";
import { SettingsProvider } from "./src/context/SettingsContext";
import "./src/config/i18n";
import theme from "./src/theme.js";

function RootApp() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar />
      <UploadScreen />
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
    alignItems: "center",
    backgroundColor: theme.colors.background || "#FBF7F5",
    justifyContent: "flex-start",
    padding: 20,
  },
});
