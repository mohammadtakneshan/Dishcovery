import React, { useState } from "react";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";

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
            <Text>Select an image to preview</Text>
          </View>
        )}
      </View>
    );
  }

  const pickPlaceholder = () => {
    alert(
      "Image picker not set up for native yet. Use web or request native picker setup."
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={pickPlaceholder} style={styles.button}>
        <Text style={styles.buttonText}>Pick photo (native)</Text>
      </TouchableOpacity>

      {preview ? (
        <Image source={{ uri: preview }} style={styles.preview} />
      ) : (
        <View style={styles.placeholder}>
          <Text>Select an image to preview</Text>
        </View>
      )}
    </View>
  );
}

const webStyles = {
  label: {
    display: "inline-block",
    padding: "8px 14px",
    backgroundColor: "#2b6cb0",
    color: "#fff",
    borderRadius: 6,
    cursor: "pointer",
    textDecoration: "none",
  },
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    width: "100%",
    maxWidth: 640,
    marginVertical: 12,
  },
  button: {
    backgroundColor: "#2b6cb0",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 6,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  preview: {
    width: 320,
    height: 240,
    resizeMode: "cover",
    borderRadius: 8,
    marginTop: 8,
  },
  placeholder: {
    width: 320,
    height: 240,
    borderWidth: 1,
    borderColor: "#ddd",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginTop: 8,
  },
});
