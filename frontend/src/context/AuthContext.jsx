import React, { createContext, useContext } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-expo';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerkAuth();

  const value = {
    user,
    isLoaded,
    isSignedIn,
    signOut,
    clerkId: user?.id,
    email: user?.primaryEmailAddress?.emailAddress,
    name: user?.fullName,
    imageUrl: user?.imageUrl,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
