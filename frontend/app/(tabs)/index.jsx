import { useRouter } from 'expo-router';
import UploadScreen from '../../src/screens/UploadScreen';

export default function UploadTab() {
  const router = useRouter();

  return (
    <UploadScreen
      onRecipeGenerated={(_recipe) => {
        router.push(`/recipe/temp-${Date.now()}`);
      }}
    />
  );
}
