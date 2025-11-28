import React from "react";
import { View, StyleSheet } from "react-native";
import theme from "../theme";

/**
 * Render a themed card container that wraps its children.
 *
 * The component applies base card styles derived from the app theme and merges any
 * provided `style` prop on top of those defaults.
 *
 * @param {Object} props
 * @param {import('react').ReactNode} props.children - Content to render inside the card.
 * @param {import('react-native').StyleProp<Object>} [props.style] - Additional style or style array to merge with the base card styles.
 * @returns {import('react').ReactElement} A React element representing the styled card container.
 */
export default function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor:
      theme.card?.backgroundColor ?? theme.colors.backgroundColor,
    borderRadius: theme.card?.borderRadius ?? 12,
    padding: theme.card?.padding ?? 16,
    shadowColor: theme.card?.shadowColor ?? "#000",
    shadowOffset: theme.card?.shadowOffset ?? { width: 0, height: 6 },
    shadowOpacity: theme.card?.shadowOpacity ?? 0.06,
    shadowRadius: theme.card?.shadowRadius ?? 12,
    elevation: theme.card?.elevation ?? 3,
  },
});