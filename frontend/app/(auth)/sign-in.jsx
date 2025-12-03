import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useSignIn } from '@clerk/clerk-expo';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import theme from '../../src/theme';

export default function SignInScreen() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();
  const { redirect } = useLocalSearchParams();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSignInPress = async () => {
    if (!isLoaded) return;

    setLoading(true);
    setError('');

    try {
      const completeSignIn = await signIn.create({
        identifier: email,
        password,
      });

      await setActive({ session: completeSignIn.createdSessionId });
      router.replace(redirect || '/');
    } catch (err) {
      setError(err.errors?.[0]?.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{t('auth.signIn')}</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          placeholder={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={styles.input}
          placeholder={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={onSignInPress}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{t('auth.signIn')}</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.push('/sign-up')}>
          <Text style={styles.link}>{t('auth.noAccount')}</Text>
        </Pressable>

        <Pressable onPress={() => router.back()}>
          <Text style={styles.link}>{t('auth.continueAsGuest')}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.headerBlue,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.outline,
    borderRadius: theme.radii.md,
    padding: 12,
    marginBottom: theme.spacing.md,
    fontSize: 16,
  },
  button: {
    backgroundColor: theme.colors.buttonBg,
    padding: 12,
    borderRadius: theme.radii.md,
    alignItems: 'center',
    marginTop: theme.spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    color: theme.colors.brand,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    fontSize: 14,
  },
  error: {
    color: 'red',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
});
