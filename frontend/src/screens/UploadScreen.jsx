import React, { useEffect, useMemo, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import {
  ErrorBanner,
  ImageUpload,
  SettingsPanel,
  LanguageDropdown,
  ModeSelector,
  TextPromptInput
} from "../components";
import { ApiError, generateRecipeFromImage, generateFoodImage } from "../api/index";
import theme from "../theme";
import { useSettings } from "../context/SettingsContext";
import { SettingsValidationError } from "../context/SettingsContext";
import { useTranslation } from 'react-i18next';

export default function UploadScreen({ onRecipe }) {
  const { t, i18n } = useTranslation();
  const [imagePayload, setImagePayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  // New state for text-to-image feature
  const [mode, setMode] = useState('upload');
  const [textPrompt, setTextPrompt] = useState('');
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null);
  const [generatingImage, setGeneratingImage] = useState(false);
  const [postActionNotice, setPostActionNotice] = useState(null);

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
      setError(t('errors.noImage'));
      return;
    }
    try {
      setLoading(true);
      setError(null);

      if (Object.keys(validationState.errors).length > 0) {
        setError({
          code: "settings_incomplete",
          message: t('errors.settingsIncomplete'),
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
          language: i18n.language,
        },
      );
      onRecipe && onRecipe(resp);
    } catch (err) {
      if (err instanceof SettingsValidationError) {
        setError({
          code: "settings_invalid",
          message: t('errors.settingsInvalid'),
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

  // Handle image generation (OpenAI only)
  const handleGenerateImage = useCallback(async () => {
    if (!textPrompt || textPrompt.trim().length < 3) {
      setError({
        message: t('errors.promptTooShort'),
        hint: t('errors.promptTooShortHint')
      });
      return;
    }

    setGeneratingImage(true);
    setError(null);

    try {
      const result = await generateFoodImage(textPrompt, {
        provider: settings.provider,
        apiKey: settings.apiKey,
        baseUrl: settings.apiBaseUrl
      });

      setGeneratedImageUrl(result.imageUrl);
    } catch (err) {
      setError({
        message: err.message,
        hint: err.hint,
        code: err.code
      });
    } finally {
      setGeneratingImage(false);
    }
  }, [textPrompt, settings, t]);

  // Handle recipe generation from text
  const handleGenerateRecipeFromText = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPostActionNotice(null);

    const isOpenAI = settings.provider === 'openai';

    try {
      // For OpenAI: use generated image URL
      // For others: use text prompt directly
      const result = await generateRecipeFromImage(null, {
        textPrompt: !isOpenAI ? textPrompt : undefined,
        imageUrl: isOpenAI ? generatedImageUrl : undefined,
        provider: settings.provider,
        apiKey: settings.apiKey,
        model: settings.model,
        language: i18n.language,
        baseUrl: settings.apiBaseUrl
      });

      // Pass full result to onRecipe (not just result.recipe)
      onRecipe && onRecipe(result);

      // Show post-action notice for non-OpenAI (will be shown after returning from recipe screen)
      if (!isOpenAI) {
        setPostActionNotice(t('textPrompt.recipeGeneratedWithoutImage'));
      }

    } catch (err) {
      setError({
        message: err.message,
        hint: err.hint,
        code: err.code
      });
    } finally {
      setLoading(false);
    }
  }, [textPrompt, generatedImageUrl, settings, onRecipe, t, i18n]);

  // Mode change handler
  const handleModeChange = useCallback((newMode) => {
    setMode(newMode);
    setError(null);
    setPostActionNotice(null);
    setTextPrompt('');
    setGeneratedImageUrl(null);
    setImagePayload(null);
  }, []);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('app.name')}</Text>
        <Text style={styles.subtitle}>
          {t('home.subtitle')}
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.settingsColumn}>
            <TouchableOpacity
              onPress={() => setShowSettings((prev) => !prev)}
              style={styles.settingsToggle}
              accessibilityRole="button"
            >
              <Text style={styles.settingsToggleText}>
                {showSettings ? t('settings.hide') : t('settings.show')} {t('settings.connectionSettings')}
              </Text>
            </TouchableOpacity>
            {!isReady ? (
              <Text style={styles.settingsWarning}>
                {t('settings.configureApiKey')}
              </Text>
            ) : null}
          </View>
          <LanguageDropdown />
        </View>

        {showSettings ? (
          <SettingsPanel onClose={() => setShowSettings(false)} />
        ) : null}

        {/* Mode selector */}
        <ModeSelector mode={mode} onModeChange={handleModeChange} />

        {/* Post-action notice banner */}
        {postActionNotice && (
          <View style={styles.successNotice}>
            <Text style={styles.successNoticeText}>{postActionNotice}</Text>
            <TouchableOpacity onPress={() => setPostActionNotice(null)}>
              <Text style={styles.dismissText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Conditional rendering based on mode */}
        {mode === 'upload' ? (
          <>
            <ImageUpload onImageSelected={handleImageSelected} />
            <ErrorBanner error={error} onDismiss={() => setError(null)} />

            <TouchableOpacity
              onPress={handleGenerate}
              style={[styles.button, loading && styles.buttonDisabled]}
              disabled={loading}
              accessibilityLabel={t('actions.generate')}
            >
              {loading ? (
                <ActivityIndicator color={theme.colors.surface} />
              ) : (
                <Text style={styles.buttonText}>{t('actions.generate')}</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TextPromptInput
              value={textPrompt}
              onChangeText={setTextPrompt}
              onGenerateImage={handleGenerateImage}
              onGenerateRecipe={handleGenerateRecipeFromText}
              generatedImageUrl={generatedImageUrl}
              generatingImage={generatingImage}
              generatingRecipe={loading}
              error={error?.message}
            />
            {error && <ErrorBanner error={error} onDismiss={() => setError(null)} />}
          </>
        )}
      </View>

      <Text style={styles.hint}>
        {t('upload.hint')}
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.md,
    width: "100%",
  },
  settingsColumn: {
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  settingsToggle: {
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
  successNotice: {
    backgroundColor: '#D4EDDA',
    borderLeftWidth: 4,
    borderLeftColor: '#28A745',
    padding: 12,
    marginBottom: 16,
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  successNoticeText: {
    fontSize: 14,
    color: '#155724',
    lineHeight: 20,
    flex: 1,
  },
  dismissText: {
    fontSize: 18,
    color: '#155724',
    fontWeight: 'bold',
    paddingLeft: 12,
  },
});
