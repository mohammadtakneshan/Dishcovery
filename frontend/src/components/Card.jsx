import React from "react";
import { View, StyleSheet } from "react-native";
import theme from "../theme";

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
