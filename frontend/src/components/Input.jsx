import React from "react";
import { View, Text, TextInput, StyleSheet } from "react-native";
import theme from "../theme.js";

const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  numberOfLines = 1,
  keyboardType = "default",
  autoCapitalize = "sentences",
  isDarkMode = false,
  style,
  ...rest
}) => (
  <View style={styles.container}>
    {label ? (
      <Text style={[styles.label, isDarkMode && styles.labelDark]}>
        {label}
      </Text>
    ) : null}
    <TextInput
      style={[
        styles.input,
        isDarkMode ? styles.inputDark : styles.inputLight,
        multiline && styles.multiline,
        style,
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={isDarkMode ? "#8e8e93" : "#999999"}
      multiline={multiline}
      numberOfLines={numberOfLines}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
      {...rest}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    borderRadius: theme.radii.apple,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontFamily: "SF Pro Text",
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: theme.colors.surface,
  },
  multiline: {
    minHeight: 120,
    textAlignVertical: "top",
  },
  inputDark: {
    backgroundColor: "#1c1c1e",
    borderColor: "#38383a",
    color: "#ffffff",
  },
  inputLight: {
    backgroundColor: "#ffffff",
    borderColor: "#d1d1d6",
    color: "#000000",
  },
  label: {
    fontFamily: "SF Pro Text",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  labelDark: {
    color: "#ffffff",
  },
});

export default Input;
