import React from 'react';
import { View, Text, TextInput, StyleSheet } from 'react-native';

const Input = ({ 
  label, 
  value, 
  onChangeText, 
  placeholder,
  multiline = false,
  numberOfLines = 1,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  isDarkMode = false
}) => {
  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, isDarkMode && styles.labelDark]}>
          {label}
        </Text>
      )}
      <TextInput
        style={[
          styles.input,
          isDarkMode ? styles.inputDark : styles.inputLight,
          multiline && styles.multiline
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={isDarkMode ? '#8e8e93' : '#999999'}
        multiline={multiline}
        numberOfLines={numberOfLines}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    fontFamily: 'SF Pro Text',
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputDark: {
    backgroundColor: '#1c1c1e',
    borderColor: '#38383a',
    color: '#ffffff',
  },
  inputLight: {
    backgroundColor: '#ffffff',
    borderColor: '#d1d1d6',
    color: '#000000',
  },
  label: {
    fontFamily: 'SF Pro Text',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  labelDark: {
    color: '#ffffff',
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
});

export default Input;
