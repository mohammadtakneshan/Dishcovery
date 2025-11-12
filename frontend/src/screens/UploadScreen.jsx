import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { ErrorBanner, ImageUpload, SettingsPanel } from "../components";
import { ApiError, generateRecipeFromImage } from "../api/index";
import theme from "../theme";
import { useSettings } from "../context/SettingsContext";
import { SettingsValidationError } from "../context/SettingsContext";

export default function UploadScreen({ onRecipe }) {
  const [imagePayload, setImagePayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const { settings, isReady, validate } = useSettings();

  useEffect(() => {
    if (!isReady) {
      setShowSettings(true);
    }
  }, [isReady]);

  const validationState = useMemo(() => validate(settings), [settings, validate]);

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

      if (Object.keys(validationState.errors).length > 0) {
        setError({
          code: "settings_incomplete",
          message: "Complete the provider settings before generating recipes.",
          hint:
            validationState.errors.apiKey ||
            validationState.errors.apiBaseUrl ||
            validationState.errors.provider,
        });
        setShowSettings(true);
        return;
      }

      const resp = await generateRecipeFromImage(
        imagePayload.file ? imagePayload : imagePayload,
        {
          provider: settings.provider,
          apiKey: settings.apiKey,
          baseUrl: settings.apiBaseUrl,
          model: settings.model,
        },
      );
      onRecipe && onRecipe(resp);
    } catch (err) {
      if (err instanceof SettingsValidationError) {
        setError({
          code: "settings_invalid",
          message: "Provider settings are invalid. Update and try again.",
          hint:
            err.errors.apiKey || err.errors.apiBaseUrl || err.errors.provider,
        });
        setShowSettings(true);
      } else if (err instanceof ApiError) {
        setError({
          code: err.code,
          message: err.message,
          hint: err.hint,
        });
      } else {
        setError(
          typeof err === "object"
            ? err
            : { code: "unexpected_error", message: err?.message ?? String(err) }
        );
      }
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
        <View style={styles.settingsRow}>
          <TouchableOpacity
            onPress={() => setShowSettings((prev) => !prev)}
            style={styles.settingsToggle}
            accessibilityRole="button"
          >
            <Text style={styles.settingsToggleText}>
              {showSettings ? "Hide" : "Show"} connection settings
            </Text>
          </TouchableOpacity>
          {!isReady ? (
            <Text style={styles.settingsWarning}>
              Configure your API key to enable recipe generation.
            </Text>
          ) : null}
        </View>

        {showSettings ? (
          <SettingsPanel onClose={() => setShowSettings(false)} />
        ) : null}

        <ImageUpload onImageSelected={handleImageSelected} />
        <ErrorBanner error={error} onDismiss={() => setError(null)} />

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
  header: {
    alignItems: "center",
    marginBottom: theme.spacing.md,
  },
  hint: {
    color: theme.colors.muted,
    fontSize: 13,
    marginTop: theme.spacing.lg,
  },
  settingsRow: {
    alignItems: "center",
    marginBottom: theme.spacing.md,
    width: "100%",
  },
  settingsToggle: {
    alignSelf: "flex-start",
    marginBottom: theme.spacing.xs,
  },
  settingsToggleText: {
    color: theme.colors.brand,
    fontSize: 13,
    fontWeight: "600",
  },
  settingsWarning: {
    color: theme.colors.danger,
    fontSize: 12,
    textAlign: "left",
    width: "100%",
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
