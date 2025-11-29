import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  useWindowDimensions,
  ScrollView,
  Platform,
  TextInput,
} from "react-native";
import {
  ErrorBanner,
  ImageUpload,
  SettingsPanel,
  LanguageDropdown,
  Card,
} from "../components";
import { ApiError, generateRecipeFromImage } from "../api/index";
import theme from "../theme";
import { useSettings } from "../context/SettingsContext";
import { SettingsValidationError } from "../context/SettingsContext";
import { useTranslation } from "react-i18next";
import RecipeScreen from "./RecipeScreen";

export default function UploadScreen() {
  const { t, i18n } = useTranslation();

  const [imagePayload, setImagePayload] = useState(null);
  const [previewRecipe, setPreviewRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const [activeTab, setActiveTab] = useState("photo");
  const [foodPrompt, setFoodPrompt] = useState("");

  const [hoveredPrompt, setHoveredPrompt] = useState(false);
  const [hoveredMain, setHoveredMain] = useState(false);

  const handleGenerateFromPrompt = async () => {
    setLoading(true);

    try {
      // TODO: Implement prompt→recipe generation
      // For OpenAI: Call DALL-E API for image generation
      // For other providers: Generate recipe only
      console.warn('Prompt to recipe generation not yet implemented');
    } finally {
      setLoading(false);
    }
  };

  const { settings, isReady, validate } = useSettings();
  const { width } = useWindowDimensions();
  const isWide = Platform.OS === "web" ? width >= 1024 : false;

  useEffect(() => {
    if (!isReady) {
      setShowSettings(true);
    }
  }, [isReady]);

  const validationState = useMemo(
    () => validate(settings),
    [settings, validate]
  );

  const handleImageSelected = (payload) => {
    setImagePayload(payload);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!imagePayload) {
      setError(t("errors.noImage"));
      return;
    }
    try {
      setLoading(true);
      setError(null);

      if (Object.keys(validationState.errors).length > 0) {
        setError({
          code: "settings_incomplete",
          message: t("errors.settingsIncomplete"),
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
        }
      );
      setPreviewRecipe(resp);
    } catch (err) {
      if (err instanceof SettingsValidationError) {
        setError({
          code: "settings_invalid",
          message: t("errors.settingsInvalid"),
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
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.root,
        styles.rootScrollContent,
        isWide && styles.rootWide,
      ]}
    >
      {/* Top white header strip - full viewport wide; uses global override to neutralize lib padding */}
      <View
        style={[
          styles.topHeaderStrip,
          {
            /* make sure it uses full viewport */
          },
        ]}
        className="top-full-header"
      >
        <View style={styles.headerRowTop}>
          <View style={styles.headerLeftEdge}>
            <Text
              style={[styles.title, { color: theme.colors.headerBlue }]}
              accessible={true}
            >
              Dishcovery
            </Text>
          </View>

          <View style={styles.headerRightTop}>
            <LanguageDropdown />
          </View>
        </View>
      </View>

      <View style={styles.headerGap} />

      <View style={[styles.columns, isWide && styles.columnsWide]}>
        <View style={[styles.cardColumn, isWide && styles.leftColumn]}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.settingsColumn}>
                <TouchableOpacity
                  onPress={() => setShowSettings((prev) => !prev)}
                  style={styles.settingsToggle}
                  accessibilityRole="button"
                >
                  <Text style={styles.settingsToggleText}>
                    {showSettings ? t("settings.hide") : t("settings.show")}{" "}
                    {t("settings.connectionSettings")}
                  </Text>
                </TouchableOpacity>
                {!isReady ? (
                  <Text style={styles.settingsWarning}>
                    {t("settings.configureApiKey")}
                  </Text>
                ) : null}
              </View>
              <View style={styles.thinLine} />
            </View>

            {showSettings ? (
              <SettingsPanel onClose={() => setShowSettings(false)} />
            ) : null}

            <View style={styles.segmentedWrapper}>
              <View style={styles.segmentedTrack}>
                <View
                  style={[
                    styles.segmentedPill,
                    activeTab === "photo"
                      ? styles.leftOffset4
                      : styles.leftHalf,
                  ]}
                  pointerEvents="none"
                />
                <TouchableOpacity
                  style={styles.segmentedOption}
                  onPress={() => setActiveTab("photo")}
                >
                  <Text
                    style={[
                      styles.segmentedText,
                      activeTab === "photo" && styles.segmentedTextActive,
                    ]}
                  >
                    {t("upload.photoToRecipe")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.segmentedOption}
                  onPress={() => setActiveTab("prompt")}
                >
                  <Text
                    style={[
                      styles.segmentedText,
                      activeTab === "prompt" && styles.segmentedTextActive,
                    ]}
                  >
                    {t("upload.promptToFood")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {activeTab === "photo" ? (
              <>
                <Text style={styles.tabSubtitle}>{t("upload.uploadPhoto")}</Text>
                <Text style={styles.tabSubtitleSmall}>
                  {t("upload.uploadPhotoDescription")}
                </Text>
                <ImageUpload
                  onImageSelected={handleImageSelected}
                  preview={imagePayload?.uri || imagePayload?.url}
                />
              </>
            ) : (
              <>
                <Text style={styles.tabSubtitle}>{t("upload.describeADish")}</Text>
                <Text style={styles.tabSubtitleSmall}>
                  {t("upload.describeADishDescription")}
                </Text>
                <View style={styles.promptBlock}>
                  <TextInput
                    multiline
                    value={foodPrompt}
                    onChangeText={setFoodPrompt}
                    placeholder={t("upload.promptPlaceholder")}
                    style={styles.promptInput}
                  />
                  <Pressable
                    onPress={handleGenerateFromPrompt}
                    onHoverIn={() =>
                      Platform.OS === "web" && setHoveredPrompt(true)
                    }
                    onHoverOut={() =>
                      Platform.OS === "web" && setHoveredPrompt(false)
                    }
                    style={({ pressed }) => [
                      styles.button,
                      {
                        backgroundColor:
                          Platform.OS === "web" && hoveredPrompt
                            ? theme.colors.headerBlue
                            : theme.colors.buttonBg,
                        opacity: pressed || loading ? 0.9 : 1,
                      },
                      loading && styles.buttonDisabled,
                    ]}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color={theme.colors.buttonText} />
                    ) : (
                      <Text style={styles.buttonText}>
                        {settings?.provider === "openai"
                          ? t("upload.generateImageAndRecipe")
                          : t("upload.generateRecipe")}
                      </Text>
                    )}
                  </Pressable>

                  {/* Image generation coming soon for OpenAI */}
                  {activeTab === "prompt" &&
                    settings?.provider === "openai" && (
                      <View style={styles.generatedImageContainer}>
                        <Text style={styles.generatedImagePlaceholder}>
                          {t("upload.imageGenerationComingSoon")}
                        </Text>
                      </View>
                    )}
                </View>
              </>
            )}

            <ErrorBanner error={error} onDismiss={() => setError(null)} />

            {activeTab === "photo" && (
              <Pressable
                onPress={handleGenerate}
                onHoverIn={() => Platform.OS === "web" && setHoveredMain(true)}
                onHoverOut={() =>
                  Platform.OS === "web" && setHoveredMain(false)
                }
                style={({ pressed }) => [
                  styles.button,
                  {
                    backgroundColor:
                      Platform.OS === "web" && hoveredMain
                        ? theme.colors.headerBlue
                        : theme.colors.buttonBg,
                    opacity: pressed || loading ? 0.9 : 1,
                  },
                  loading && styles.buttonDisabled,
                ]}
                disabled={loading}
                accessibilityLabel={t("actions.generate")}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.surface} />
                ) : (
                  <Text style={styles.buttonText}>{t("upload.generateRecipe")}</Text>
                )}
              </Pressable>
            )}
          </View>
        </View>

        <View
          style={[
            styles.previewColumn,
            isWide ? styles.rightColumn : styles.previewStack,
          ]}
        >
          {previewRecipe ? (
            <RecipeScreen
              data={previewRecipe}
              recipe={previewRecipe.recipe || previewRecipe}
              onBack={() => setPreviewRecipe(null)}
            />
          ) : (
            <Card style={styles.placeholderCard}>
              <Text style={styles.placeholderTitle}>{t("upload.noRecipeYet")}</Text>
              <Text style={styles.placeholderText}>
                {t("upload.noRecipeYetDescription")}
              </Text>
            </Card>
          )}
        </View>
      </View>

      <View style={styles.spacerBottom} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  button: {
    ...theme.button,
    alignItems: "center",
    backgroundColor: theme.colors.buttonBg || "#0B0B0B",
    marginTop: theme.spacing.md,
    borderRadius: theme.radii.apple,
    width: "100%",
    ...(Platform.OS === "web"
      ? {
          transition: "background-color 180ms ease, box-shadow 180ms ease",
          boxShadow: "0 6px 18px rgba(0,0,0,0.04)",
          cursor: "pointer",
        }
      : {}),
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: theme.colors.buttonText || "#ffffff",
    fontWeight: "700",
  },
  card: {
    backgroundColor: theme.colors.pageBg || theme.colors.surface,
    borderRadius: theme.radii.apple,
    padding: theme.spacing.lg,
    borderWidth: 0,
    borderColor: theme.colors.subtleBorder,
    ...(Platform.OS === "web" ? { boxShadow: "none" } : {}),
  },
  placeholderCard: {
    padding: theme.spacing.lg,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 1,
    maxWidth: "90%",
  },
  placeholderTitle: {
    ...theme.typography.subheading,
    fontSize: 18,
    color: theme.colors.muted,
    marginBottom: 6,
  },
  placeholderText: {
    color: theme.colors.muted,
    fontSize: 13,
    textAlign: "center",
    flexWrap: "wrap",
    maxWidth: 400,
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
    backgroundColor: theme.colors.pageBg || theme.colors.background,
    width: "100%",
    paddingHorizontal: 18,
    alignItems: "stretch",
  },
  rootScrollContent: {
    flexGrow: 1,
    alignItems: "center",
    padding: theme.spacing.md,
  },
  rootWide: {
    alignItems: "stretch",
    paddingHorizontal: theme.spacing.lg,
  },
  title: {
    ...theme.typography.heading,
    fontSize: 24,
    fontWeight: "600",
    color: theme.colors.headerBlue || theme.colors.brand,
    marginBottom: 6,
  },
  columns: {
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: 0,
  },
  columnsWide: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "flex-start",
  },
  cardColumn: {
    width: "100%",
    alignItems: "stretch",
  },
  leftColumn: {
    width: "50%",
    paddingRight: 12,
    marginLeft: 60,
  },
  rightColumn: {
    width: "50%",
    paddingLeft: 12,
    marginRight: 60,
  },
  previewColumn: {
    width: "100%",
    marginTop: theme.spacing.md,
  },
  previewStack: {
    width: "100%",
  },
  scrollView: {
    flex: 1,
    width: "100%",
    ...(Platform.OS === "web" ? { overflow: "auto" } : {}),
  },
  promptBlock: {
    marginTop: 12,
  },
  promptInput: {
    borderRadius: theme.radii.apple || 12,
    borderWidth: 1,
    borderColor: theme.colors.outline,
    padding: 12,
    minHeight: 120,
    backgroundColor: "#ffffff",
    textAlignVertical: "top",
  },
  spacerBottom: {
    height: 64,
  },
  topHeaderStrip: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    width: '100%',
    backgroundColor: "#FFFFFF",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.subtleBorder,
    alignItems: "stretch",
    paddingHorizontal: 70,
    zIndex: 100,
  },
  headerRowTop: {
    width: "100%",
    maxWidth: 1600,
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 0,
    paddingRight: 0,
  },
  headerLeftEdge: {
    paddingLeft: 6,
  },
  headerRightTop: {
    width: 200,
    alignItems: "flex-end",
  },
  headerGap: {
    height: 70,
  },
  segmentedWrapper: {
    marginVertical: theme.spacing.sm,
  },
  segmentedTrack: {
    width: "100%",
    backgroundColor: "#e1e1e3",
    borderRadius: 999,
    height: 42,
    position: "relative",
    flexDirection: "row",
    overflow: "hidden",
    alignItems: "center",
  },
  segmentedOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    height: "100%",
  },
  segmentedText: {
    color: theme.colors.muted,
    fontWeight: "600",
  },
  segmentedTextActive: {
    color: theme.colors.headerBlue,
    fontWeight: "700",
  },
  segmentedPill: {
    position: "absolute",
    top: 4,
    width: "48%",
    height: 34,
    borderRadius: 999,
    backgroundColor: "#FFFFFF",
    zIndex: 1,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 6px 18px rgba(0,0,0,0.04)" }
      : {}),
  },
  tabSubtitle: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: theme.spacing.sm,
    marginBottom: 8,
    color: theme.colors.text,
  },
  tabSubtitleSmall: {
    fontSize: 13,
    color: theme.colors.muted,
    marginBottom: theme.spacing.md,
  },
  thinLine: {
    width: 1,
  },
  leftOffset4: {
    left: 4,
  },
  leftHalf: {
    left: "50%",
  },
  generatedImageContainer: {
    marginTop: theme.spacing.md,
    width: "100%",
    height: 240,
    backgroundColor: "#FFFFFF",
    borderRadius: theme.radii.apple,
    borderWidth: 1,
    borderColor: theme.colors.subtleBorder,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  generatedImagePlaceholder: {
    color: theme.colors.muted,
    fontSize: 14,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
