import React, { useState } from "react";
import { Text, Pressable, StyleSheet, Platform } from "react-native";
import theme from "../theme.js";

/**
 * Renders a themed Pressable button that displays the given children and handles presses.
 *
 * @param {import('react').ReactNode} children - Content rendered inside the button (usually text or icons).
 * @param {() => void} onPress - Callback invoked when the button is pressed.
 * @param {import('react-native').StyleProp<import('react-native').ViewStyle>} [style] - Additional style(s) merged into the button's container.
 * @param {boolean} [disabled=false] - If true, the button appears disabled and does not respond to presses.
 * @returns {import('react').JSX.Element} A Pressable button element that updates its background on web hover and applies disabled/pressed visual states.
 */
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
    shadowColor: theme.shadows?.soft?.shadowColor || "#000",
    shadowOffset: theme.shadows?.soft?.shadowOffset || { width: 0, height: 6 },
    shadowOpacity: theme.shadows?.soft?.shadowOpacity ?? 0.06,
    shadowRadius: theme.shadows?.soft?.shadowRadius ?? 12,
    ...(Platform.OS === "web"
      ? { boxShadow: "0 6px 18px rgba(0,0,0,0.06)" }
      : {}),
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