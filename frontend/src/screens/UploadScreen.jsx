import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import ImageUpload from "../components/ImageUpload";
import { generateRecipeFromImage } from "../api/index";

export default function UploadScreen({ onRecipe }) {
  const [imagePayload, setImagePayload] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleImageSelected = (payload) => {
    setImagePayload(payload);
    setError(null);
  };

  const handleGenerate = async () => {
    if (!imagePayload) {
      setError("Please select an image first.");
      return;
    }
    try {
      setLoading(true);
      setError(null);

      const resp = await generateRecipeFromImage(
        imagePayload.file ? imagePayload : imagePayload
      );
      onRecipe && onRecipe(resp);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to generate recipe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Upload a food photo</Text>

      <ImageUpload onImageSelected={handleImageSelected} />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        onPress={handleGenerate}
        style={[styles.button, loading && styles.disabled]}
        disabled={loading}
        accessibilityLabel="Generate Recipe"
      >
        {loading ? (
          <ActivityIndicator />
        ) : (
          <Text style={styles.buttonText}>Generate Recipe</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, alignItems: "center", paddingTop: 24 },
  heading: { fontSize: 18, fontWeight: "700", marginBottom: 12 },
  button: {
    marginTop: 14,
    backgroundColor: "#2b6cb0",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: { color: "#fff", fontWeight: "700" },
  disabled: { opacity: 0.6 },
  error: { color: "#e53e3e", marginTop: 10 },
});
