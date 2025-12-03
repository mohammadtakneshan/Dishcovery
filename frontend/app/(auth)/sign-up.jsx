import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useSignUp } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import theme from '../../src/theme';

export default function SignUpScreen() {
  const { signUp, setActive, isLoaded } = useSignUp();
  const router = useRouter();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSignUpPress = async () => {
    if (!isLoaded) return;

    setLoading(true);
    setError('');

    try {
      await signUp.create({
        emailAddress: email,
        password,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err) {
      setError(err.errors?.[0]?.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  const onVerifyPress = async () => {
    if (!isLoaded) return;

    setLoading(true);
    setError('');

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      await setActive({ session: completeSignUp.createdSessionId });
      router.replace('/');
    } catch (err) {
      setError(err.errors?.[0]?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>{t('auth.verifyEmail')}</Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TextInput
            style={styles.input}
            placeholder={t('auth.verificationCode')}
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
          />

          <Pressable
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={onVerifyPress}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{t('auth.verify')}</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{t('auth.signUp')}</Text>

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
          onPress={onSignUpPress}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{t('auth.signUp')}</Text>
          )}
        </Pressable>

        <Pressable onPress={() => router.push('/sign-in')}>
          <Text style={styles.link}>{t('auth.haveAccount')}</Text>
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
