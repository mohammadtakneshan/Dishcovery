import React, { useState } from "react";
import {
  View,
  Image,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import theme from "../theme.js";

/**
 * Image upload component that provides platform-specific flows for selecting an image and exposing its data.
 *
 * On web, selection is done via a hidden file input and the selected File is passed to the callback.
 * On native (Expo), the component attempts to use `expo-image-picker` to obtain an image and requests media library permission when needed.
 *
 * @param {{ onImageSelected?: (image: { uri: string, name: string, type?: string, file?: File }) => void }} props
 * @param {Function} props.onImageSelected - Optional callback invoked when an image is selected. Receives an object containing:
 *   - `uri`: local URL or file URI for preview,
 *   - `name`: filename,
 *   - `type`: MIME type (web File only),
 *   - `file`: the original File object (web only).
 * @returns {JSX.Element} The image upload UI for the current platform.
 */
export default function ImageUpload({ onImageSelected }) {
  const { t } = useTranslation();
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
        <label htmlFor="dishcovery-file-input" style={webStyles.uploadArea}>
          {preview ? (
            <div style={webStyles.previewWrapper}>
              <img src={preview} alt="preview" style={webStyles.previewImage} />
            </div>
          ) : (
            <div style={webStyles.placeholderBox}>
              <View style={webStyles.iconPlaceholder}>
                <Text accessible={false} aria-hidden="true">
                  ⬆
                </Text>
              </View>
              <div style={webStyles.placeholderText}>
                {t("upload.selectImagePreview")}
              </div>
            </div>
          )}
        </label>

        {preview ? (
          <TouchableOpacity
            onPress={() =>
              document.getElementById("dishcovery-file-input").click()
            }
            style={styles.chooseButton}
          >
            <Text style={styles.buttonText}>{t("upload.changePhoto")}</Text>
          </TouchableOpacity>
        ) : null}
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
        mediaTypes: ["images"],
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
        <Text style={styles.buttonText}>{t("upload.pickPhoto")}</Text>
      </TouchableOpacity>

      {preview ? (
        <Image source={{ uri: preview }} style={styles.preview} />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            {t("upload.selectImagePreview")}
          </Text>
        </View>
      )}
    </View>
  );
}

const webStyles = {
  hiddenInput: { display: "none" },
  uploadArea: {
    display: "flex",
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    borderRadius: theme.radii.apple,
    padding: 28,
    backgroundColor: "#FBFBFB",
    height: 250,
    width: "100%",
    cursor: "pointer",
    textAlign: "center",
    boxSizing: "border-box",
    alignItems: "center",
    justifyContent: "center",
  },
  previewWrapper: {
    borderRadius: theme.radii.apple,
    overflow: "hidden",
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
  },
  previewImage: {
    width: "100%",
    height: 200,
    maxHeight: 420,
    objectFit: "cover",
    display: "block",
    borderRadius: 10,
  },
  placeholderBox: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  iconPlaceholder: {
    fontSize: 40,
    color: "#9CA3AF",
  },
  placeholderText: {
    color: "#6B7280",
    fontSize: 15,
  },
  emptyPreviewText: {
    color: theme.colors.muted,
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 8,
  },
  smallText: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 6,
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
    maxWidth: 720,
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
    borderRadius: theme.radii.apple,
    borderWidth: 2,
    height: 360,
    marginTop: theme.spacing.sm,
    resizeMode: "cover",
    width: "100%",
  },
});