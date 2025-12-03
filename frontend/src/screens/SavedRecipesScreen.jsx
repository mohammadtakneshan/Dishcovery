import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useAuth } from '../context/AuthContext';
import theme from '../theme';

export default function SavedRecipesScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { isSignedIn, clerkId } = useAuth();
  const recipes = useQuery(api.recipes.getUserRecipes, isSignedIn ? { clerkId } : 'skip');
  const deleteRecipe = useMutation(api.recipes.deleteRecipe);
  const toggleFavorite = useMutation(api.recipes.toggleFavorite);

  const [deletingId, setDeletingId] = useState(null);

  if (!isSignedIn) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{t('saved.signInRequired')}</Text>
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

  if (recipes === undefined) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={theme.colors.brand} />
      </View>
    );
  }

  if (!recipes || recipes.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>{t('saved.empty')}</Text>
          <Text style={styles.emptyText}>
            Start saving recipes to see them here!
          </Text>
          <Pressable
            onPress={() => router.push('/')}
            style={({ pressed }) => [
              styles.button,
              { opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={styles.buttonText}>{t('actions.generate')}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const handleDelete = (recipeId) => {
    if (Platform.OS === 'web') {
      if (window.confirm(t('saved.confirmDelete'))) {
        performDelete(recipeId);
      }
    } else {
      Alert.alert(
        t('saved.confirmDelete'),
        '',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => performDelete(recipeId) },
        ]
      );
    }
  };

  const performDelete = async (recipeId) => {
    setDeletingId(recipeId);
    try {
      await deleteRecipe({ recipeId });
    } catch (error) {
      console.error('Failed to delete recipe:', error);
      Alert.alert('Error', 'Failed to delete recipe. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleFavorite = async (recipeId) => {
    try {
      await toggleFavorite({ recipeId });
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const handleViewRecipe = (recipe) => {
    router.push({
      pathname: `/recipe/${recipe._id}`,
      params: {
        recipe: JSON.stringify({
          recipe: {
            title: recipe.title,
            prep_time: recipe.prepTime,
            cook_time: recipe.cookTime,
            servings: recipe.servings,
            difficulty: recipe.difficulty,
            ingredients: recipe.ingredients,
            steps: recipe.steps,
            nutrition: recipe.nutrition,
            tips: recipe.tips,
          },
          meta: {
            provider: recipe.provider,
            model: recipe.model,
            language: recipe.language,
          },
        }),
      },
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('saved.title')}</Text>
        <Text style={styles.subtitle}>
          {recipes.length} {recipes.length === 1 ? 'recipe' : 'recipes'}
        </Text>
      </View>

      <View style={styles.recipeList}>
        {recipes.map((recipe) => (
          <View key={recipe._id} style={styles.recipeCard}>
            <Pressable
              onPress={() => handleViewRecipe(recipe)}
              style={({ pressed }) => [
                styles.recipeContent,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <View style={styles.recipeHeader}>
                <Text style={styles.recipeTitle} numberOfLines={2}>
                  {recipe.title}
                </Text>
                <Pressable
                  onPress={() => handleToggleFavorite(recipe._id)}
                  style={styles.favoriteButton}
                >
                  <Text style={styles.favoriteIcon}>
                    {recipe.isFavorite ? '★' : '☆'}
                  </Text>
                </Pressable>
              </View>

              <View style={styles.recipeMeta}>
                {recipe.prepTime && (
                  <Text style={styles.metaText}>⏱ {recipe.prepTime}</Text>
                )}
                {recipe.servings && (
                  <Text style={styles.metaText}>🍽 {recipe.servings}</Text>
                )}
              </View>

              <Text style={styles.recipeDate}>
                Saved {new Date(recipe._creationTime).toLocaleDateString()}
              </Text>
            </Pressable>

            <View style={styles.recipeActions}>
              <Pressable
                onPress={() => handleDelete(recipe._id)}
                disabled={deletingId === recipe._id}
                style={({ pressed }) => [
                  styles.deleteButton,
                  { opacity: pressed || deletingId === recipe._id ? 0.7 : 1 },
                ]}
              >
                {deletingId === recipe._id ? (
                  <ActivityIndicator size="small" color="#EF4444" />
                ) : (
                  <Text style={styles.deleteText}>Delete</Text>
                )}
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  scrollContainer: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: theme.colors.headerBlue,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: theme.colors.muted,
  },
  recipeList: {
    gap: theme.spacing.md,
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: theme.radii.lg,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.08,
          shadowRadius: 6,
        }),
  },
  recipeContent: {
    padding: theme.spacing.md,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
  },
  recipeTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
  },
  favoriteButton: {
    padding: 4,
  },
  favoriteIcon: {
    fontSize: 24,
    color: '#F59E0B',
  },
  recipeMeta: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  metaText: {
    fontSize: 14,
    color: theme.colors.muted,
  },
  recipeDate: {
    fontSize: 12,
    color: theme.colors.muted,
  },
  recipeActions: {
    borderTopWidth: 1,
    borderTopColor: '#E6E6E6',
    padding: theme.spacing.sm,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deleteButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.radii.sm,
    minWidth: 80,
    alignItems: 'center',
  },
  deleteText: {
    color: '#EF4444',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    maxWidth: 400,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.muted,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  button: {
    backgroundColor: theme.colors.buttonBg,
    borderRadius: theme.radii.md,
    paddingHorizontal: 24,
    paddingVertical: 12,
    minWidth: 150,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
