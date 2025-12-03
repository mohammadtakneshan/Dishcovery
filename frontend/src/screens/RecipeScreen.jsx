import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import theme from "../theme";
import SaveRecipeButton from "../components/SaveRecipeButton";

export default function RecipeScreen({ data, recipe, onBack }) {
  const { t } = useTranslation();
  const recipeData = recipe || data?.recipe;
  const meta = data?.meta;
  const warning = data?.warning;

  if (!recipeData) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>{t("recipe.noRecipe")}</Text>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>{t("actions.back")}</Text>
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
    tips = "",
  } = recipeData;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{title || t("recipe.generatedRecipe")}</Text>

        {meta ? (
          <View style={styles.metaSummary}>
            <Text style={styles.metaSummaryText}>
              {t("recipe.provider")}:{" "}
              {meta.provider_label || capitalise(meta.provider)}
            </Text>
            {meta.model ? (
              <Text style={styles.metaSummaryText}>
                {t("recipe.model")}: {meta.model}
              </Text>
            ) : null}
            {meta.language ? (
              <Text style={styles.metaSummaryText}>
                {t("recipe.language")}: {meta.language}
              </Text>
            ) : null}
          </View>
        ) : null}

        {warning ? (
          <View style={styles.warningBox}>
            <Text style={styles.warningTitle}>{t("recipe.headsUp")}</Text>
            <Text style={styles.warningText}>{warning}</Text>
          </View>
        ) : null}

        {/* Save Recipe Button */}
        <SaveRecipeButton recipe={recipeData} meta={meta} />

        {/* Recipe metadata */}
        <View style={styles.metaRow}>
          {prep_time && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>{t("recipe.prep")}:</Text>
              <Text style={styles.metaValue}>{prep_time}</Text>
            </View>
          )}
          {cook_time && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>{t("recipe.cook")}:</Text>
              <Text style={styles.metaValue}>{cook_time}</Text>
            </View>
          )}
          {servings && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>{t("recipe.servingsLabel")}:</Text>
              <Text style={styles.metaValue}>{servings}</Text>
            </View>
          )}
        </View>

        {/* Ingredients section */}
        <Text style={styles.sectionHeading}>{t("recipe.ingredients")}</Text>
        {ingredients.length === 0 ? (
          <Text style={styles.muted}>{t("recipe.noIngredients")}</Text>
        ) : (
          ingredients.map((ing, i) => (
            <Text key={i} style={styles.listItem}>
              • {ing}
            </Text>
          ))
        )}

        <View style={styles.separator} />

        {/* Instructions section */}
        <Text style={styles.sectionHeading}>{t("recipe.instructions")}</Text>
        {steps.length === 0 ? (
          <Text style={styles.muted}>{t("recipe.noSteps")}</Text>
        ) : (
          steps.map((s, i) => (
            <Text key={i} style={styles.step}>
              {i + 1}. {s}
            </Text>
          ))
        )}

        <View style={styles.separator} />

        {/* Nutrition section */}
        {nutrition && Object.keys(nutrition).length > 0 && (
          <>
            <Text style={styles.sectionHeading}>
              {t("recipe.nutritionPerServing")}
            </Text>
            <View style={styles.nutritionGrid}>
              {nutrition.calories && (
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>
                    {t("recipe.calories")}
                  </Text>
                  <Text style={styles.nutritionValue}>
                    {nutrition.calories}
                  </Text>
                </View>
              )}
              {nutrition.protein && (
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>
                    {t("recipe.protein")}
                  </Text>
                  <Text style={styles.nutritionValue}>{nutrition.protein}</Text>
                </View>
              )}
              {nutrition.fat && (
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>{t("recipe.fat")}</Text>
                  <Text style={styles.nutritionValue}>{nutrition.fat}</Text>
                </View>
              )}
              {nutrition.carbs && (
                <View style={styles.nutritionItem}>
                  <Text style={styles.nutritionLabel}>{t("recipe.carbs")}</Text>
                  <Text style={styles.nutritionValue}>{nutrition.carbs}</Text>
                </View>
              )}
            </View>
          </>
        )}

        <View style={styles.separator} />

        {tips && (
          <>
            <Text style={styles.sectionHeading}>{t("recipe.tipsServing")}</Text>
            <Text style={styles.tipsText}>{tips}</Text>
          </>
        )}
      </View>
    </ScrollView>
  );
}

function capitalise(value) {
  if (!value || typeof value !== "string") return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
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
  card: {
    maxWidth: 760,
    width: "100%",
    borderRadius: theme.card?.borderRadius ?? 12,
    padding: theme.card?.padding ?? 16,
    elevation: theme.card?.elevation ?? 3,
    backgroundColor: theme.colors.background,
    ...(Platform.OS === "web"
      ? { boxShadow: "none" }
      : {
          shadowColor: theme.card?.shadowColor ?? "#000",
          shadowOffset: theme.card?.shadowOffset ?? { width: 0, height: 6 },
          shadowOpacity: theme.card?.shadowOpacity ?? 0.06,
          shadowRadius: theme.card?.shadowRadius ?? 12,
        }),
  },
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
    marginRight: 100,
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
  metaSummary: {
    backgroundColor: "#f7f7f7",
    borderRadius: theme.radii.sm,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: theme.spacing.md,
    padding: 12,
  },
  metaSummaryText: {
    color: theme.colors.muted,
    fontSize: 13,
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
    backgroundColor: theme.colors.infoBg,
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
    color: theme.colors.headerBlue,
    fontSize: 24,
    fontWeight: "500",
    marginBottom: theme.spacing.sm,
  },
  warningBox: {
    backgroundColor: theme.colors.infoBg,
    borderColor: theme.colors.infoBorder,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    marginBottom: theme.spacing.md,
    padding: 12,
  },
  warningText: {
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 20,
  },
  warningTitle: {
    color: theme.colors.brand,
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 4,
  },
  separator: {
    height: 1,
    marginVertical: 18,
    backgroundColor: "#E6E6E6",
  },
});
