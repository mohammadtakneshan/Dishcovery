import React, { useState } from "react";
import { Text, Pressable, StyleSheet, Platform } from "react-native";
import theme from "../theme.js";

export default function Button({ children, onPress, style, disabled }) {
  const [hovered, setHovered] = useState(false);

  const bgColor =
    Platform.OS === "web" && hovered
      ? theme.colors.headerBlue
      : theme.colors.buttonBg;

  return (
    <Pressable
      onPress={onPress}
      onHoverIn={() => Platform.OS === "web" && setHovered(true)}
      onHoverOut={() => Platform.OS === "web" && setHovered(false)}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bgColor, opacity: pressed || disabled ? 0.9 : 1 },
        style,
      ]}
      disabled={disabled}
    >
      <Text style={[styles.text, disabled && styles.textDisabled]}>
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 12,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 6px 18px rgba(0,0,0,0.06)" }
      : {
          shadowColor: theme.shadows?.soft?.shadowColor || "#000",
          shadowOffset: theme.shadows?.soft?.shadowOffset || { width: 0, height: 6 },
          shadowOpacity: theme.shadows?.soft?.shadowOpacity ?? 0.06,
          shadowRadius: theme.shadows?.soft?.shadowRadius ?? 12,
        }),
  },
  text: {
    color: theme.colors.buttonText || "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  textDisabled: {
    color: "#9CA3AF",
  },
});
