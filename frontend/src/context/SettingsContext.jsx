import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@dishcovery/settings/v1";
const DEFAULT_BASE_URL = trimTrailingSlash(
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:5001"
);

const PROVIDERS = [
  {
    id: "gemini",
    label: "Google Gemini",
    description: "Gemini Vision via Google AI Studio",
    defaultModel: "gemini-2.5-flash",
    keyHint: 'Keys start with "AI" and are generated in Google AI Studio.',
  },
  {
    id: "openai",
    label: "OpenAI GPT-4o",
    description: "Vision-enabled GPT models from OpenAI",
    defaultModel: "gpt-4o-mini",
    keyHint:
      'Keys begin with "sk-" or "sk-proj-" and are managed in the OpenAI dashboard.',
  },
  {
    id: "anthropic",
    label: "Anthropic Claude",
    description: "Claude 3 vision models",
    defaultModel: "claude-3-sonnet-20240229",
    keyHint:
      'Keys start with "sk-ant-" and are available in the Anthropic console.',
  },
];

const PROVIDER_MAP = PROVIDERS.reduce((acc, provider) => {
  acc[provider.id] = provider;
  return acc;
}, {});

const DEFAULT_SETTINGS = {
  provider: "gemini",
  apiKey: "",
  apiBaseUrl: DEFAULT_BASE_URL,
  model: PROVIDER_MAP.gemini.defaultModel,
};

export class SettingsValidationError extends Error {
  constructor(errors) {
    super("Settings validation failed");
    this.name = "SettingsValidationError";
    this.errors = errors;
  }
}

const SettingsContext = createContext(null);

/**
 * Provides application settings and related actions to descendant components via context.
 *
 * Exposes the current settings, available providers, validation state, loading status, and functions
 * to save, reset, and validate settings. On mount it hydrates settings from persistent storage and
 * keeps storage in sync when settings are saved or reset.
 *
 * @param {object} props
 * @param {import("react").ReactNode} props.children - Child elements that receive the settings context.
 * @returns {import("react").JSX.Element} The SettingsContext provider element.
 */
export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [lastSavedAt, setLastSavedAt] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function hydrate() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!isMounted) return;

        if (raw) {
          const parsed = safeParseSettings(raw);
          const candidate = {
            ...DEFAULT_SETTINGS,
            ...parsed,
          };
          const { sanitized, errors } = validateSettings(candidate);
          setSettings(sanitized);
          setValidationErrors(errors);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(error);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    hydrate();

    return () => {
      isMounted = false;
    };
  }, []);

  const saveSettings = useCallback(
    async (partial) => {
      const candidate = {
        ...settings,
        ...partial,
      };

      const { sanitized, errors } = validateSettings(candidate);
      setValidationErrors(errors);

      if (Object.keys(errors).length > 0) {
        throw new SettingsValidationError(errors);
      }

      setSettings(sanitized);

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
      setLastSavedAt(new Date().toISOString());

      return sanitized;
    },
    [settings]
  );

  const resetSettings = useCallback(async () => {
    setSettings(DEFAULT_SETTINGS);
    setValidationErrors({});
    setLastSavedAt(new Date().toISOString());
    await AsyncStorage.removeItem(STORAGE_KEY);
    return DEFAULT_SETTINGS;
  }, []);

  const validate = useCallback(
    (candidate) => validateSettings({ ...settings, ...candidate }),
    [settings]
  );

  const value = useMemo(
    () => ({
      settings,
      providers: PROVIDERS,
      providerMap: PROVIDER_MAP,
      saveSettings,
      resetSettings,
      validate,
      validationErrors,
      loading,
      loadError,
      lastSavedAt,
      isReady:
        !loading &&
        settings.apiKey.trim().length > 0 &&
        Object.keys(validationErrors).length === 0,
    }),
    [
      loadError,
      loading,
      resetSettings,
      saveSettings,
      settings,
      validationErrors,
      validate,
      lastSavedAt,
    ]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * Access the current settings context value.
 * @returns {import("./path").SettingsContextValue} The value supplied by a surrounding SettingsProvider.
 * @throws {Error} If called outside of a SettingsProvider.
 */
export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

/**
 * Validate and sanitize a candidate settings object for AI provider configuration.
 *
 * @param {Object} candidate - Partial or complete settings to validate.
 * @param {string} [candidate.provider] - Provider id or label (case-insensitive).
 * @param {string} [candidate.apiKey] - API key for the selected provider.
 * @param {string} [candidate.apiBaseUrl] - Base URL for provider API requests.
 * @param {string} [candidate.model] - Preferred model identifier.
 * @returns {{ sanitized: { provider: string, apiKey: string, apiBaseUrl: string, model: string }, errors: Object }} 
 * An object containing:
 *  - `sanitized`: the normalized settings (provider id when known, trimmed apiKey, validated apiBaseUrl, and resolved model).
 *  - `errors`: a map of field names to error messages for any validation failures (fields with no errors are omitted).
 */
function validateSettings(candidate) {
  const errors = {};
  const normalizedProvider = (candidate.provider || "").toLowerCase().trim();
  const providerConfig = PROVIDER_MAP[normalizedProvider];

  if (!providerConfig) {
    errors.provider = "Select a supported AI provider.";
  }

  const apiKey = (candidate.apiKey || "").trim();
  const keyError = providerConfig
    ? validateApiKey(providerConfig.id, apiKey)
    : "API key is required for the selected provider.";

  if (keyError) {
    errors.apiKey = keyError;
  }

  const baseUrlResult = validateApiBaseUrl(candidate.apiBaseUrl);
  if (baseUrlResult.error) {
    errors.apiBaseUrl = baseUrlResult.error;
  }

  const sanitized = {
    provider: providerConfig ? providerConfig.id : candidate.provider,
    apiKey,
    apiBaseUrl: baseUrlResult.value,
    model: normalizeModel(candidate.model, providerConfig),
  };

  return { sanitized, errors };
}

/**
 * Validate an API key for a given provider.
 * @param {string} providerId - Provider identifier (e.g., "gemini", "openai", "anthropic").
 * @param {string} key - The API key to validate.
 * @returns {string|null} An error message describing the validation failure, or `null` if the key is valid.
 */
function validateApiKey(providerId, key) {
  if (!key) {
    return "Enter an API key for this provider.";
  }

  if (providerId === "gemini" && !key.startsWith("AI")) {
    return 'Gemini keys should start with "AI" (Google AI Studio).';
  }

  if (
    providerId === "openai" &&
    !(key.startsWith("sk-") || key.startsWith("sk-proj-"))
  ) {
    return 'OpenAI keys typically start with "sk-" or "sk-proj-".';
  }

  if (providerId === "anthropic" && !key.startsWith("sk-ant-")) {
    return 'Anthropic keys should start with "sk-ant-".';
  }

  if (key.length < 12) {
    return "API key looks too short. Double-check and paste the full value.";
  }

  return null;
}

/**
 * Ensures a candidate API base URL is valid and returns a sanitized version or an error.
 * @param {unknown} value - Candidate API base URL; typically a string.
 * @returns {{value: string, error: string|null}} Sanitized base URL in `value` or empty string on error; `error` contains a human-facing message when invalid, otherwise `null`.
 */
function validateApiBaseUrl(value) {
  const trimmed = typeof value === "string" ? value.trim() : "";
  if (!trimmed) {
    return { value: "", error: "API base URL is required." };
  }

  try {
    const url = new URL(trimmed);
    if (!(url.protocol === "http:" || url.protocol === "https:")) {
      return {
        value: "",
        error: "API URL must start with http:// or https://.",
      };
    }

    const sanitized = `${url.origin}${url.pathname.replace(/\/$/, "")}`;
    return { value: sanitized, error: null };
  } catch (error) {
    return {
      value: "",
      error: "Enter a valid API URL (e.g., http://localhost:5001).",
    };
  }
}

/**
 * Selects the model to use based on an explicit model string or the provider's default.
 * @param {string|any} model - Candidate model; trimmed before evaluation.
 * @param {{defaultModel: string}|null|undefined} providerConfig - Provider configuration whose `defaultModel` will be returned when `model` is empty.
 * @returns {string} The trimmed `model` if non-empty; otherwise the provider's `defaultModel`, or an empty string if neither is available.
 */
function normalizeModel(model, providerConfig) {
  const trimmed = typeof model === "string" ? model.trim() : "";
  if (trimmed) {
    return trimmed;
  }
  return providerConfig ? providerConfig.defaultModel : trimmed;
}

/**
 * Parse a JSON settings string into an object, falling back to an empty object on parse failure.
 * @param {string} raw - The raw JSON string to parse.
 * @returns {Object} The parsed settings object, or an empty object if parsing fails.
 */
function safeParseSettings(raw) {
  try {
    return JSON.parse(raw);
  } catch (error) {
    return {};
  }
}

/**
 * Remove a single trailing slash from a string value.
 * @param {any} value - The value to normalize; if a string, a trailing '/' will be removed.
 * @returns {string|any} The string without a trailing slash, or the original value if it was not a string.
 */
function trimTrailingSlash(value) {
  if (typeof value !== "string") {
    return value;
  }
  return value.replace(/\/$/, "");
}