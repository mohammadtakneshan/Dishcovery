import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function RecipeScreen({ recipe, onBack }) {
  if (!recipe) {
    return (
      <View style={styles.center}>
        <Text>No recipe to show.</Text>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { title, ingredients = [], steps = [] } = recipe;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{title || "Generated Recipe"}</Text>

      <Text style={styles.sectionHeading}>Ingredients</Text>
      {ingredients.length === 0 ? (
        <Text style={styles.muted}>No ingredients returned.</Text>
      ) : (
        ingredients.map((ing, i) => (
          <Text key={i} style={styles.listItem}>
            • {ing}
          </Text>
        ))
      )}

      <Text style={[styles.sectionHeading, { marginTop: 16 }]}>Steps</Text>
      {steps.length === 0 ? (
        <Text style={styles.muted}>No steps returned.</Text>
      ) : (
        steps.map((s, i) => (
          <Text key={i} style={styles.step}>
            {i + 1}. {s}
          </Text>
        ))
      )}

      <TouchableOpacity onPress={onBack} style={styles.backBtn}>
        <Text style={styles.backText}>Back</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, alignItems: "flex-start" },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  title: { fontSize: 22, fontWeight: "800", marginBottom: 12 },
  sectionHeading: { fontSize: 16, fontWeight: "700", marginTop: 8 },
  listItem: { marginTop: 6 },
  step: { marginTop: 8 },
  muted: { color: "#666", marginTop: 6 },
  backBtn: {
    marginTop: 22,
    backgroundColor: "#718096",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  backText: { color: "#fff" },
});
