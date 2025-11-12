import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import theme from '../theme';

export default function ErrorBanner({ error, onDismiss }) {
  if (!error) {
    return null;
  }

  const { message, code, hint } = normaliseError(error);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.title}>Something went wrong</Text>
        {onDismiss ? (
          <TouchableOpacity
            onPress={onDismiss}
            accessibilityRole="button"
            style={styles.closeBtn}
          >
            <Text style={styles.closeText}>Dismiss</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {code ? (
        <Text style={styles.code}>Error code: {code}</Text>
      ) : null}
      <Text style={styles.message}>{message}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

function normaliseError(error) {
  if (typeof error === 'string') {
    return { message: error };
  }

  if (typeof error === 'object') {
    return {
      message: error.message || 'Unexpected error encountered.',
      code: error.code,
      hint: error.hint,
    };
  }

  return { message: 'Unexpected error encountered.' };
}

const styles = StyleSheet.create({
  closeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  closeText: {
    color: theme.colors.brand,
    fontWeight: '600',
  },
  code: {
    color: theme.colors.muted,
    fontSize: 12,
    marginBottom: 6,
  },
  container: {
    backgroundColor: '#fff1f0',
    borderColor: theme.colors.danger,
    borderRadius: theme.radii.sm,
    borderWidth: 1,
    marginTop: theme.spacing.sm,
    padding: theme.spacing.md,
    width: '100%',
  },
  hint: {
    color: theme.colors.text,
    fontSize: 13,
    marginTop: 6,
  },
  message: {
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    color: theme.colors.danger,
    fontSize: 15,
    fontWeight: '700',
  },
});
