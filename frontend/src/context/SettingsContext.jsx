import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { validateApiKey as validateApiKeyRemote } from "../api";

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
    label: "OpenAI",
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
  model: "",
  availableModels: [],
  isKeyValidated: false,
};

export class SettingsValidationError extends Error {
  constructor(errors) {
    super("Settings validation failed");
    this.name = "SettingsValidationError";
    this.errors = errors;
  }
}

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState(null);

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

      try {
        // Write to storage FIRST before updating state
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));

        // Only update state after successful write
        setSettings(sanitized);
        setLastSavedAt(new Date().toISOString());

        return sanitized;
      } catch (storageError) {
        console.error('Failed to save settings to storage:', storageError);
        throw new Error(
          'Failed to save settings. Please check storage permissions and try again.'
        );
      }
    },
    [settings]
  );

  const resetSettings = useCallback(async () => {
    try {
      // Remove from storage FIRST before updating state
      await AsyncStorage.removeItem(STORAGE_KEY);

      // Only update state after successful removal
      setSettings(DEFAULT_SETTINGS);
      setValidationErrors({});
      setLastSavedAt(new Date().toISOString());

      return DEFAULT_SETTINGS;
    } catch (storageError) {
      console.error('Failed to reset settings:', storageError);
      throw new Error('Failed to reset settings. Please try again.');
    }
  }, []);

  const validate = useCallback(
    (candidate) => validateSettings({ ...settings, ...candidate }),
    [settings]
  );

  const validateRemoteApiKey = useCallback(async (baseUrl, provider, apiKey) => {
    // Use provided parameters or fall back to settings
    const urlToUse = baseUrl || settings.apiBaseUrl;
    const providerToUse = provider || settings.provider;
    const keyToUse = apiKey || settings.apiKey;

    if (!keyToUse || !providerToUse) {
      setValidationError('API key and provider required');
      return;
    }

    setIsValidating(true);
    setValidationError(null);

    try {
      const result = await validateApiKeyRemote(
        urlToUse,
        providerToUse,
        keyToUse
      );

      if (result.valid) {
        const updatedSettings = {
          ...settings,
          apiBaseUrl: urlToUse,
          provider: providerToUse,
          apiKey: keyToUse,
          availableModels: result.models || [],
          isKeyValidated: true,
          model: result.models && result.models.length > 0 ? result.models[0].id : settings.model
        };

        // Persist to AsyncStorage
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));
        setSettings(updatedSettings);
        setValidationError(null);
      } else {
        setSettings(prev => ({
          ...prev,
          isKeyValidated: false,
          availableModels: []
        }));
        setValidationError(result.error || 'Validation failed');
      }
    } catch (error) {
      setSettings(prev => ({
        ...prev,
        isKeyValidated: false,
        availableModels: []
      }));
      setValidationError(error.message || 'Failed to validate API key');
    } finally {
      setIsValidating(false);
    }
  }, [settings]);

  // Reset validation when provider or API key changes
  useEffect(() => {
    setSettings(prev => ({
      ...prev,
      isKeyValidated: false,
      availableModels: [],
    }));
    setValidationError(null);
  }, [settings.provider, settings.apiKey]);

  const value = useMemo(
    () => ({
      settings,
      providers: PROVIDERS,
      providerMap: PROVIDER_MAP,
      saveSettings,
      resetSettings,
      validate,
      validateRemoteApiKey,
      validationErrors,
      validationError,
      isValidating,
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
      validationError,
      isValidating,
      validate,
      validateRemoteApiKey,
      lastSavedAt,
    ]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}

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
    model: normalizeModel(candidate.model),
    availableModels: candidate.availableModels || [],
    isKeyValidated: candidate.isKeyValidated || false,
  };

  return { sanitized, errors };
}

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

function normalizeModel(model) {
  const trimmed = typeof model === "string" ? model.trim() : "";
  return trimmed;
}

function safeParseSettings(raw) {
  try {
    return JSON.parse(raw);
  } catch (error) {
    return {};
  }
}

function trimTrailingSlash(value) {
  if (typeof value !== "string") {
    return value;
  }
  return value.replace(/\/$/, "");
}
