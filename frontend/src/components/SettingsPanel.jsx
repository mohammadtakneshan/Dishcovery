import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import Input from './Input';
import theme from '../theme';
import {
  SettingsValidationError,
  useSettings,
} from '../context/SettingsContext';

const STATUS_TIMEOUT_MS = 3500;

export default function SettingsPanel({ onClose }) {
  const { t } = useTranslation();
  const {
    settings,
    providers,
    providerMap,
    saveSettings,
  resetSettings,
  validate,
    loading,
    lastSavedAt,
  } = useSettings();
  const [form, setForm] = useState(settings);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    setForm(settings);
  }, [settings]);

  useEffect(() => {
    if (!status) return;
    const timer = setTimeout(() => setStatus(null), STATUS_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [status]);

  const validationState = useMemo(() => validate(form), [form, validate]);
  const hasErrors = Object.keys(validationState.errors).length > 0;

  const currentProvider = useMemo(
    () => providerMap[form.provider] || providers[0],
    [form.provider, providerMap, providers],
  );

  const handleProviderSelect = (providerId) => {
    const providerConfig = providerMap[providerId];
    setForm((prev) => ({
      ...prev,
      provider: providerId,
      model: providerConfig?.defaultModel || prev.model,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus(null);
    try {
      await saveSettings(form);
      setStatus({ type: 'success', message: t('settingsPanel.saved') });
      if (onClose) {
        onClose();
      }
    } catch (error) {
      if (error instanceof SettingsValidationError) {
        setStatus({
          type: 'error',
          message: t('settingsPanel.fixFieldsError'),
        });
      } else {
        setStatus({
          type: 'error',
          message: t('settingsPanel.saveError'),
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    setSaving(true);
    setStatus(null);
    try {
      const defaults = await resetSettings();
      setForm(defaults);
      setStatus({ type: 'info', message: t('settingsPanel.resetSuccess') });
    } catch (error) {
      setStatus({
        type: 'error',
        message: t('settingsPanel.resetError'),
      });
    } finally {
      setSaving(false);
    }
  };

  const renderStatus = () => {
    if (!status) return null;
    const palette =
      status.type === 'success'
        ? styles.statusSuccess
        : status.type === 'error'
        ? styles.statusError
        : styles.statusInfo;

    return (
      <View style={[styles.status, palette]}>
        <Text style={styles.statusText}>{status.message}</Text>
      </View>
    );
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>{t('settingsPanel.title')}</Text>
        {onClose ? (
          <TouchableOpacity
            onPress={onClose}
            accessibilityRole="button"
            style={styles.closeButton}
          >
            <Text style={styles.closeText}>{t('settingsPanel.close')}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <Text style={styles.description}>
        {t('settingsPanel.description')}
      </Text>

      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={theme.colors.brand} size="small" />
          <Text style={styles.loadingText}>{t('settingsPanel.loading')}</Text>
        </View>
      ) : null}

      {renderStatus()}

      <Text style={styles.label}>{t('settingsPanel.provider')}</Text>
      <View style={styles.providerRow}>
        {providers.map((provider) => {
          const isActive = provider.id === form.provider;
          return (
            <TouchableOpacity
              key={provider.id}
              onPress={() => handleProviderSelect(provider.id)}
              style={[styles.providerChip, isActive && styles.providerChipActive]}
              accessibilityState={{ selected: isActive }}
            >
              <Text
                style={[styles.providerText, isActive && styles.providerTextActive]}
              >
                {provider.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {validationState.errors.provider ? (
        <Text style={styles.errorText}>{validationState.errors.provider}</Text>
      ) : null}

      <View style={styles.hintCard}>
     <Text style={styles.hintTitle}>{currentProvider.label}</Text> 
     <Text style={styles.hintCopy}> {t(`providers.${currentProvider.id}.description`, { defaultValue: currentProvider.description })} </Text>
      <Text style={styles.hintFootnote}> {t(`providers.${currentProvider.id}.keyHint`, { defaultValue: currentProvider.keyHint })} </Text>
      </View>

      <Input
label={t('settingsPanel.backendUrl')}
        value={form.apiBaseUrl}
        onChangeText={(value) => setForm((prev) => ({ ...prev, apiBaseUrl: value }))}
        placeholder="http://localhost:5001"
        autoCapitalize="none"
        keyboardType="url"
      />
      {validationState.errors.apiBaseUrl ? (
        <Text style={styles.errorText}>{validationState.errors.apiBaseUrl}</Text>
      ) : null}

      <Input
        label={t('settingsPanel.apiKey')}
        value={form.apiKey}
        onChangeText={(value) => setForm((prev) => ({ ...prev, apiKey: value }))}
        placeholder={t('settingsPanel.apiKeyPlaceholder')}
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry
        textContentType="password"
      />
      {validationState.errors.apiKey ? (
        <Text style={styles.errorText}>{validationState.errors.apiKey}</Text>
      ) : null}

      <Input
        label={t('settingsPanel.model')}
        value={form.model || ''}
        onChangeText={(value) => setForm((prev) => ({ ...prev, model: value }))}
        placeholder={currentProvider.defaultModel}
        autoCapitalize="none"
        autoCorrect={false}
      />

      <View style={styles.actionsRow}>
        <TouchableOpacity
          onPress={handleSave}
          style={[styles.primaryButton, (saving || hasErrors) && styles.disabledButton]}
          disabled={saving || hasErrors}
          accessibilityRole="button"
        >
          {saving ? (
            <ActivityIndicator color={theme.colors.surface} />
          ) : (
            <Text style={styles.primaryButtonText}>{t('settingsPanel.save')}</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleReset}
          style={styles.secondaryButton}
          disabled={saving}
          accessibilityRole="button"
        >
          <Text style={styles.secondaryButtonText}>{t('settingsPanel.reset')}</Text>
        </TouchableOpacity>
      </View>

      {lastSavedAt ? (
        <Text style={styles.savedText}>
          {t('settingsPanel.lastSaved')} {new Date(lastSavedAt).toLocaleString()}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: theme.spacing.md,
  },
  closeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  closeText: {
    color: theme.colors.brand,
    fontWeight: '600',
  },
  description: {
    color: theme.colors.muted,
    fontSize: 14,
    marginBottom: theme.spacing.md,
  },
  disabledButton: {
    opacity: 0.65,
  },
  errorText: {
    color: theme.colors.danger,
    marginBottom: theme.spacing.sm,
  },
  heading: {
    ...theme.typography.heading,
    fontSize: 20,
  },
  headerRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  hintCard: {
    backgroundColor: '#fff8f0',
    borderColor: '#f0d3b8',
    borderRadius: theme.radii.md,
    borderWidth: 1,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  hintCopy: {
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6,
  },
  hintFootnote: {
    color: theme.colors.muted,
    fontSize: 12,
    marginTop: 8,
  },
  hintTitle: {
    color: theme.colors.brandDark,
    fontSize: 16,
    fontWeight: '700',
  },
  label: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: theme.spacing.xs,
  },
  loadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: theme.spacing.sm,
  },
  loadingText: {
    color: theme.colors.muted,
    fontSize: 13,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: theme.colors.brand,
    borderRadius: theme.radii.sm,
    flex: 1,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: theme.colors.surface,
    fontSize: 15,
    fontWeight: '700',
  },
  providerChip: {
    backgroundColor: '#f6f6f6',
    borderRadius: theme.radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  providerChipActive: {
    backgroundColor: theme.colors.brand,
  },
  providerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: theme.spacing.sm,
  },
  providerText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  providerTextActive: {
    color: theme.colors.surface,
  },
  secondaryButton: {
    alignItems: 'center',
    borderColor: theme.colors.brand,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  secondaryButtonText: {
    color: theme.colors.brand,
    fontWeight: '600',
  },
  status: {
    borderRadius: theme.radii.sm,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  statusError: {
    backgroundColor: '#ffe8e6',
    borderColor: '#ffbdb6',
    borderWidth: 1,
  },
  statusInfo: {
    backgroundColor: '#edf3ff',
    borderColor: '#c7d7ff',
    borderWidth: 1,
  },
  statusSuccess: {
    backgroundColor: '#e8f9ef',
    borderColor: '#b5edcc',
    borderWidth: 1,
  },
  statusText: {
    color: theme.colors.text,
    fontSize: 13,
  },
  savedText: {
    color: theme.colors.muted,
    fontSize: 12,
    marginTop: theme.spacing.sm,
  },
  wrapper: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    padding: theme.spacing.md,
    width: '100%',
  },
});
