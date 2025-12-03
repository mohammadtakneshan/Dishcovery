import { useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../context/AuthContext';

/**
 * Hook to automatically sync Clerk user to Convex database
 * Syncs user data whenever they sign in or user info changes
 */
export function useSyncUserToConvex() {
  const { isLoaded, isSignedIn, clerkId, email, name, imageUrl } = useAuth();
  const syncUser = useMutation(api.users.syncUser);

  useEffect(() => {
    // Only sync if Clerk is loaded, user is signed in, and we have required data
    if (!isLoaded || !isSignedIn || !clerkId || !email) {
      return;
    }

    // Sync user to Convex
    syncUser({
      clerkId,
      email,
      name: name || '',
      imageUrl: imageUrl || '',
    }).catch((error) => {
      console.error('Failed to sync user to Convex:', error);
    });
  }, [isLoaded, isSignedIn, clerkId, email, name, imageUrl, syncUser]);
}
