import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

const Button = ({ 
  title, 
  onPress, 
  variant = 'primary', 
  disabled = false,
  icon = null 
}) => {
  const { t } = useTranslation();

  const getButtonStyle = () => {
    if (disabled) return styles.buttonDisabled;
    return variant === 'primary' ? styles.buttonPrimary : styles.buttonSecondary;
  };

  const getTextStyle = () => {
    if (disabled) return styles.textDisabled;
    return variant === 'primary' ? styles.textPrimary : styles.textSecondary;
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
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonPrimary: {
    backgroundColor: '#0ea5e9',
  },
  buttonSecondary: {
    backgroundColor: '#f2f2f7',
    borderWidth: 1,
    borderColor: '#d1d1d6',
  },
  buttonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'SF Pro Display',
  },
  textPrimary: {
    color: '#ffffff',
  },
  textSecondary: {
    color: '#000000',
  },
  textDisabled: {
    color: '#999999',
  },
  icon: {
    marginRight: 8,
  },
});

export default Button;
