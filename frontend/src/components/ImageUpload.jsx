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
          style={webStyles.hiddenInput}
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
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: false,
      });

      if (res.cancelled) return;

      const asset = res.assets ? res.assets[0] : res;
      const uri = asset.uri;
      const name = asset.fileName || uri.split("/").pop() || "photo.jpg";

      setPreview(uri);
      onImageSelected && onImageSelected({ uri, name });
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
  hiddenInput: {
    display: "none",
  },
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
  button: {
    backgroundColor: theme.colors.accent,
    borderRadius: theme.radii.sm,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  buttonText: { color: theme.colors.surface, fontWeight: "700" },
  container: {
    alignItems: "center",
    marginVertical: theme.spacing.md,
    maxWidth: 640,
    width: "100%",
  },
  placeholder: {
    alignItems: "center",
    backgroundColor: "#fffefc",
    borderColor: "#f0e6e0",
    borderRadius: theme.radii.md,
    borderStyle: "dashed",
    borderWidth: 1,
    height: 260,
    justifyContent: "center",
    marginTop: theme.spacing.sm,
    width: 360,
  },
  placeholderText: { color: theme.colors.muted },
  preview: {
    borderColor: theme.colors.muted,
    borderRadius: theme.radii.md,
    borderWidth: 2,
    height: 260,
    marginTop: theme.spacing.sm,
    resizeMode: "cover",
    width: 360,
  },
});
