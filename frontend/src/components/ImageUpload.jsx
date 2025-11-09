import React, { useState } from "react";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import theme from "../theme";

/**
 * Minimal image picker component.
 * - Web: uses a hidden <input type="file"> and passes a File object to onImageSelected
 * - Native/Expo: gracefully informs user
 *
 * onImageSelected receives: { uri, name, type, file }
 */
export default function ImageUpload({ onImageSelected }) {
  const [preview, setPreview] = useState(null);

  if (Platform.OS === "web") {
    const handleFile = (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      setPreview(url);
      onImageSelected &&
        onImageSelected({ uri: url, name: file.name, type: file.type, file });
    };

    return (
      <View style={styles.container}>
        <input
          id="dishcovery-file-input"
          type="file"
          accept="image/*"
          onChange={handleFile}
          style={{ display: "none" }}
        />
        <label htmlFor="dishcovery-file-input" style={webStyles.label}>
          <Text style={styles.buttonText}>Choose photo</Text>
        </label>

        {preview ? (
          <Image source={{ uri: preview }} style={styles.preview} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              Select an image to preview
            </Text>
          </View>
        )}
      </View>
    );
  }

  // Native - Expo image picker (loaded at runtime)
  let ImagePicker = null;
  try {
    ImagePicker = require("expo-image-picker");
  } catch (e) {
    ImagePicker = null;
  }

  const pickImage = async () => {
    if (!ImagePicker) {
      alert(
        "Image picker not available. Make sure expo-image-picker is installed."
      );
      return;
    }
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert("Permission to access media library is required.");
        return;
      }

      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        base64: false,
      });

      if (res.cancelled) return;

      const asset = res.assets ? res.assets[0] : res;
      const uri = asset.uri;
      const name = asset.fileName || uri.split("/").pop() || "photo.jpg";
      const type = asset.type || "image/jpeg";

      setPreview(uri);
      onImageSelected && onImageSelected({ uri, name, type });
    } catch (err) {
      console.error("Image pick error", err);
      alert("Could not pick image");
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickImage} style={styles.button}>
        <Text style={styles.buttonText}>Pick photo (native)</Text>
      </TouchableOpacity>

      {preview ? (
        <Image source={{ uri: preview }} style={styles.preview} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>Select an image to preview</Text>
        </View>
      )}
    </View>
  );
}

const webStyles = {
  label: {
    display: "inline-block",
    padding: "10px 16px",
    backgroundColor: theme.colors.accent,
    color: theme.colors.surface,
    borderRadius: theme.radii.sm,
    cursor: "pointer",
    textDecoration: "none",
  },
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: "100%",
    maxWidth: 640,
    marginVertical: theme.spacing.md,
  },
  button: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radii.sm,
  },
  buttonText: { color: theme.colors.surface, fontWeight: "700" },
  preview: {
    width: 360,
    height: 260,
    resizeMode: "cover",
    borderRadius: theme.radii.md,
    marginTop: theme.spacing.sm,
    borderWidth: 2,
    borderColor: theme.colors.muted,
  },
  placeholder: {
    width: 360,
    height: 260,
    borderWidth: 1,
    borderColor: "#f0e6e0",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: theme.radii.md,
    marginTop: theme.spacing.sm,
    backgroundColor: "#fffefc",
  },
  placeholderText: { color: theme.colors.muted },
});
