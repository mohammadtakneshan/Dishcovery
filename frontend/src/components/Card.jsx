import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

const Card = ({ 
  title, 
  children, 
  onPress,
  isDarkMode = false,
  style = {} 
}) => {
  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      style={[
        styles.card,
        isDarkMode ? styles.cardDark : styles.cardLight,
        style
      ]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {title && (
        <Text style={[styles.title, isDarkMode && styles.titleDark]}>
          {title}
        </Text>
      )}
      {children}
    </CardWrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    elevation: 3,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardDark: {
    backgroundColor: '#1c1c1e',
  },
  cardLight: {
    backgroundColor: '#ffffff',
  },
  title: {
    color: '#000000',
    fontFamily: 'SF Pro Display',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  titleDark: {
    color: '#ffffff',
  },
});

export default Card;
