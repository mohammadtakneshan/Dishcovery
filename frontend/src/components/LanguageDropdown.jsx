import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from "react-native";
import { useTranslation } from "react-i18next";
import theme from "../theme";

const LANGUAGES = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "hu", name: "Hungarian", nativeName: "Magyar" },
  { code: "fa", name: "Persian", nativeName: "فارسی" },
  { code: "ja", name: "Japanese", nativeName: "日本語" },
  { code: "vi", name: "Vietnamese", nativeName: "Tiếng Việt" },
];

export default function LanguageDropdown() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const currentLanguage =
    LANGUAGES.find((lang) => lang.code === i18n.language) || LANGUAGES[0];

  const handleLanguageChange = (langCode) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.dropdownButton}
        onPress={() => setIsOpen(!isOpen)}
        accessibilityLabel="Change language"
        accessibilityRole="button"
      >
        <Text style={styles.dropdownButtonText}>
          {currentLanguage.nativeName}
        </Text>
        <Text style={styles.dropdownIcon}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.dropdownMenu}>
            <ScrollView bounces={false}>
              {LANGUAGES.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.dropdownItem,
                    lang.code === i18n.language && styles.dropdownItemActive,
                  ]}
                  onPress={() => handleLanguageChange(lang.code)}
                  accessibilityRole="button"
                >
                  <Text
                    style={[
                      styles.dropdownItemText,
                      lang.code === i18n.language &&
                        styles.dropdownItemTextActive,
                    ]}
                  >
                    {lang.nativeName}
                  </Text>
                  {lang.code === i18n.language && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    zIndex: 1000,
  },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: theme.radii.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 120,
  },
  dropdownButtonText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  dropdownIcon: {
    color: theme.colors.muted,
    fontSize: 10,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownMenu: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.md,
    minWidth: 200,
    maxHeight: 300,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  dropdownItemActive: {
    backgroundColor: "#FFF8F3",
  },
  dropdownItemText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: "500",
  },
  dropdownItemTextActive: {
    color: theme.colors.brand,
    fontWeight: "600",
  },
  checkmark: {
    color: theme.colors.brand,
    fontSize: 16,
    fontWeight: "700",
  },
});
