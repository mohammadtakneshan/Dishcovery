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

  const { 
    title, 
    prep_time, 
    cook_time, 
    servings, 
    ingredients = [], 
    steps = [],
    nutrition = {},
    tips = ""
  } = recipe;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{title || "Generated Recipe"}</Text>

        {/* Recipe metadata */}
        <View style={styles.metaRow}>
          {prep_time && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Prep:</Text>
              <Text style={styles.metaValue}>{prep_time}</Text>
            </View>
          )}
          {cook_time && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Cook:</Text>
              <Text style={styles.metaValue}>{cook_time}</Text>
            </View>
          )}
          {servings && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Servings:</Text>
              <Text style={styles.metaValue}>{servings}</Text>
            </View>
          )}
        </View>

        {/* Ingredients section */}
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

        {/* Instructions section */}
        <Text style={styles.sectionHeading}>Instructions</Text>
        {steps.length === 0 ? (
          <Text style={styles.muted}>No steps returned.</Text>
        ) : (
          steps.map((s, i) => (
            <Text key={i} style={styles.step}>
              {i + 1}. {s}
            </Text>
          ))
        )}

        {/* Nutrition section */}
        {nutrition && Object.keys(nutrition).length > 0 && (
          <>
            <Text style={styles.sectionHeading}>Nutrition (per serving)</Text>
            <View style={styles.nutritionGrid}>
              {nutrition.calories && (
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>Calories</Text>
                  <Text style={styles.nutritionValue}>{nutrition.calories}</Text>
                </View>
              )}
              {nutrition.protein && (
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>Protein</Text>
                  <Text style={styles.nutritionValue}>{nutrition.protein}</Text>
                </View>
              )}
              {nutrition.fat && (
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>Fat</Text>
                  <Text style={styles.nutritionValue}>{nutrition.fat}</Text>
                </View>
              )}
              {nutrition.carbs && (
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>Carbs</Text>
                  <Text style={styles.nutritionValue}>{nutrition.carbs}</Text>
                </View>
              )}
            </View>
          </>
        )}

        {/* Tips section */}
        {tips && (
          <>
            <Text style={styles.sectionHeading}>Tips & Serving</Text>
            <Text style={styles.tipsText}>{tips}</Text>
          </>
        )}

        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back to Upload</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    alignSelf: "center",
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radii.sm,
    marginTop: theme.spacing.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backText: { 
    color: theme.colors.surface, 
    fontSize: 14,
    fontWeight: "700",
  },
  card: { maxWidth: 760, width: "100%", ...theme.card },
  center: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: theme.spacing.md,
  },
  container: {
    alignItems: "center",
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  listItem: { 
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8, 
  },
  metaItem: {
    alignItems: "center",
    flexDirection: "row",
  },
  metaLabel: {
    color: theme.colors.muted,
    fontSize: 13,
    fontWeight: "600",
    marginRight: 4,
  },
  metaRow: {
    borderBottomColor: "#f0e6e0",
    borderBottomWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  metaValue: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: "700",
  },
  muted: { color: theme.colors.muted },
  nutritionGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: theme.spacing.sm,
  },
  nutritionItem: {
    backgroundColor: "#f8f9fa",
    borderRadius: theme.radii.sm,
    minWidth: 100,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  nutritionLabel: {
    color: theme.colors.muted,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  nutritionValue: {
    color: theme.colors.brand,
    fontSize: 16,
    fontWeight: "700",
    marginTop: 2,
  },
  sectionHeading: {
    ...theme.typography.subheading,
    color: theme.colors.text,
    fontSize: 18,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  step: { 
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10, 
  },
  tipsText: {
    backgroundColor: "#fffaf6",
    borderLeftColor: theme.colors.accent,
    borderLeftWidth: 3,
    borderRadius: theme.radii.sm,
    color: theme.colors.text,
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 22,
    marginTop: theme.spacing.sm,
    padding: 12,
  },
  title: {
    ...theme.typography.heading,
    color: theme.colors.brandDark,
    fontSize: 24,
    marginBottom: theme.spacing.sm,
  },
});
