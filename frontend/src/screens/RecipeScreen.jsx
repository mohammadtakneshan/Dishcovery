import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import theme from "../theme";

export default function RecipeScreen({ recipe, onBack }) {
  if (!recipe) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>No recipe to show.</Text>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { title, ingredients = [], steps = [] } = recipe;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
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

        <Text style={styles.sectionHeading}>Steps</Text>
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
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  card: { width: "100%", maxWidth: 760, ...theme.card },
  title: {
    ...theme.typography.heading,
    color: theme.colors.brandDark,
    marginBottom: theme.spacing.sm,
  },
  sectionHeading: {
    ...theme.typography.subheading,
    marginTop: theme.spacing.md,
    color: theme.colors.text,
  },
  listItem: { marginTop: 8, color: theme.colors.text },
  step: { marginTop: 10, color: theme.colors.text },
  muted: { color: theme.colors.muted },
  backBtn: {
    marginTop: theme.spacing.md,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: theme.radii.sm,
    alignSelf: "flex-start",
  },
  backText: { color: theme.colors.surface, fontWeight: "700" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.md,
  },
});
