import { useLocalSearchParams, useRouter } from 'expo-router';
import RecipeScreen from '../../src/screens/RecipeScreen';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const recipe = router.params?.recipe;

  return (
    <RecipeScreen
      data={recipe}
      recipe={recipe?.recipe}
      onBack={() => router.back()}
    />
  );
}
