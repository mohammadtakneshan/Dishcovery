import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Image, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import theme from '../theme';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isSignedIn, email, name, imageUrl, signOut } = useAuth();
  const { settings } = useSettings();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace('/');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  if (!isSignedIn) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>{t('profile.title')}</Text>
          <Text style={styles.notSignedIn}>{t('profile.notSignedIn')}</Text>

          <Pressable
            onPress={() => router.push('/sign-in')}
            style={({ pressed }) => [
              styles.button,
              { opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={styles.buttonText}>{t('auth.signIn')}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{t('profile.title')}</Text>

        {/* Profile Image */}
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarText}>
              {name?.charAt(0)?.toUpperCase() || email?.charAt(0)?.toUpperCase() || '?'}
            </Text>
          </View>
        )}

        {/* User Info */}
        {name && <Text style={styles.name}>{name}</Text>}

        <View style={styles.infoSection}>
          <Text style={styles.label}>{t('profile.email')}</Text>
          <Text style={styles.value}>{email}</Text>
        </View>

        <View style={styles.separator} />

        {/* AI Provider Settings */}
        <View style={styles.infoSection}>
          <Text style={styles.label}>{t('profile.aiProvider')}</Text>
          <Text style={styles.value}>
            {settings?.provider ? capitalise(settings.provider) : t('settings.provider')}
          </Text>
        </View>

        {settings?.model && (
          <View style={styles.infoSection}>
            <Text style={styles.label}>{t('profile.model')}</Text>
            <Text style={styles.value}>{settings.model}</Text>
          </View>
        )}

        <View style={styles.separator} />

        {/* Sign Out Button */}
        <Pressable
          onPress={handleSignOut}
          style={({ pressed }) => [
            styles.button,
            styles.signOutButton,
            { opacity: pressed ? 0.8 : 1 },
          ]}
        >
          <Text style={[styles.buttonText, styles.signOutText]}>
            {t('auth.signOut')}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function capitalise(value) {
  if (!value || typeof value !== 'string') return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#fff',
    borderRadius: theme.radii.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        }),
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: theme.colors.headerBlue,
    marginBottom: theme.spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: theme.spacing.md,
  },
  avatarPlaceholder: {
    backgroundColor: theme.colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '600',
    color: '#fff',
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoSection: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.muted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: theme.colors.text,
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: '#E6E6E6',
    marginVertical: theme.spacing.md,
  },
  button: {
    backgroundColor: theme.colors.buttonBg,
    borderRadius: theme.radii.md,
    paddingHorizontal: 24,
    paddingVertical: 12,
    width: '100%',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  signOutButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  signOutText: {
    color: '#EF4444',
  },
  notSignedIn: {
    fontSize: 16,
    color: theme.colors.muted,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
});
