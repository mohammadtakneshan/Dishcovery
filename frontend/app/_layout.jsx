import { Stack } from 'expo-router';
import { ClerkProvider } from '@clerk/clerk-expo';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { AuthProvider } from '../src/context/AuthContext';
import { SettingsProvider } from '../src/context/SettingsContext';
import { useSyncUserToConvex } from '../src/hooks/useSyncUserToConvex';
import * as SecureStore from 'expo-secure-store';
import '../src/config/i18n';

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL || '');

const tokenCache = {
  async getToken(key) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key, value) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

// Component that syncs user to Convex
function AppContent() {
  useSyncUserToConvex();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="recipe/[id]" options={{ presentation: 'card' }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || ''}
      tokenCache={tokenCache}
    >
      <ConvexProvider client={convex}>
        <AuthProvider>
          <SettingsProvider>
            <AppContent />
          </SettingsProvider>
        </AuthProvider>
      </ConvexProvider>
    </ClerkProvider>
  );
}
