import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import theme from '../theme';

export default function SaveRecipeButton({ recipe, meta }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { isSignedIn, clerkId } = useAuth();
  const saveRecipe = useMutation(api.recipes.saveRecipe);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!isSignedIn) {
      // Redirect to sign-in with redirect back
      router.push('/sign-in?redirect=/');
      return;
    }

    if (!recipe) {
      setError(t('recipe.noRecipe'));
      return;
    }

    setSaving(true);
    setError('');

    try {
      await saveRecipe({
        clerkId,
        title: recipe.title || t('recipe.generatedRecipe'),
        prepTime: recipe.prep_time || '',
        cookTime: recipe.cook_time || '',
        servings: recipe.servings || '',
        difficulty: recipe.difficulty || 'medium',
        ingredients: recipe.ingredients || [],
        steps: recipe.steps || [],
        nutrition: recipe.nutrition || {},
        tips: recipe.tips || '',
        provider: meta?.provider || 'unknown',
        model: meta?.model || '',
        language: meta?.language || 'en',
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save recipe:', err);
      setError(t('errors.unexpected'));
    } finally {
      setSaving(false);
    }
  };

  if (!isSignedIn) {
    return (
      <Pressable
        onPress={handleSave}
        style={({ pressed }) => [
          styles.button,
          styles.signInButton,
          { opacity: pressed ? 0.8 : 1 },
        ]}
      >
        <Text style={styles.buttonText}>{t('auth.signInToSaveRecipes')}</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable
        onPress={handleSave}
        disabled={saving || saved}
        style={({ pressed }) => [
          styles.button,
          saved && styles.savedButton,
          { opacity: pressed || saving || saved ? 0.8 : 1 },
        ]}
      >
        {saving ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {saved ? t('actions.saved') : t('actions.save')}
          </Text>
        )}
      </Pressable>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: theme.spacing.md,
  },
  button: {
    backgroundColor: theme.colors.buttonBg,
    borderRadius: theme.radii.md,
    paddingHorizontal: 24,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 8,
        }),
  },
  signInButton: {
    backgroundColor: theme.colors.brand,
  },
  savedButton: {
    backgroundColor: '#10B981',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});
