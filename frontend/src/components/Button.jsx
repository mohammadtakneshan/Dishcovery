import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const Button = ({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  icon = null,
}) => {
  const getButtonStyle = () => {
    if (disabled) return styles.buttonDisabled;
    return variant === "primary"
      ? styles.buttonPrimary
      : styles.buttonSecondary;
  };

  const getTextStyle = () => {
    if (disabled) return styles.textDisabled;
    return variant === "primary" ? styles.textPrimary : styles.textSecondary;
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle()]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={[styles.text, getTextStyle()]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    borderRadius: 12,
    elevation: 3,
    flexDirection: "row",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonDisabled: {
    backgroundColor: "#e0e0e0",
  },
  buttonPrimary: {
    backgroundColor: "#0ea5e9",
  },
  buttonSecondary: {
    backgroundColor: "#f2f2f7",
    borderColor: "#d1d1d6",
    borderWidth: 1,
  },
  icon: {
    marginRight: 8,
  },
  text: {
    fontFamily: "SF Pro Display",
    fontSize: 16,
    fontWeight: "600",
  },
  textDisabled: {
    color: "#999999",
  },
  textPrimary: {
    color: "#ffffff",
  },
  textSecondary: {
    color: "#000000",
  },
});

export default Button;
