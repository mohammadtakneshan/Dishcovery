import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import ImageUpload from "../components/ImageUpload";
import { generateRecipeFromImage } from "../api/index";
import theme from "../theme";

export default function UploadScreen({ onRecipe }) {
  const [imagePayload, setImagePayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageSelected = (payload) => {
    setImagePayload(payload);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!imagePayload) {
      setError("Please select an image first.");
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const resp = await generateRecipeFromImage(
        imagePayload.file ? imagePayload : imagePayload
      );
      onRecipe && onRecipe(resp);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to generate recipe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Dishcovery</Text>
        <Text style={styles.subtitle}>
          Upload a food photo to get a recipe!
        </Text>
      </View>

      <View style={styles.card}>
        <ImageUpload onImageSelected={handleImageSelected} />
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity
          onPress={handleGenerate}
          style={[styles.button, loading && styles.buttonDisabled]}
          disabled={loading}
          accessibilityLabel="Generate Recipe"
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.surface} />
          ) : (
            <Text style={styles.buttonText}>Generate Recipe</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>
        Tip: Use clear photos of a single dish for best results.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    ...theme.button,
    alignItems: "center",
    backgroundColor: theme.colors.brand,
    marginTop: theme.spacing.md,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: theme.colors.surface,
    fontWeight: "700",
  },
  card: {
    ...theme.card,
    alignItems: "center",
    maxWidth: 760,
    width: "100%",
  },
  error: {
    color: theme.colors.danger,
    marginTop: theme.spacing.sm,
  },
  header: {
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  hint: {
    color: theme.colors.muted,
    fontSize: 13,
    marginTop: theme.spacing.lg,
  },
  root: {
    alignItems: "center",
    backgroundColor: theme.colors.background,
    flex: 1,
    padding: theme.spacing.md,
  },
  subtitle: {
    ...theme.typography.subheading,
    color: theme.colors.muted,
    fontWeight: "600",
    marginTop: 6,
  },
  title: {
    ...theme.typography.heading,
    color: theme.colors.brandDark,
  },
});
