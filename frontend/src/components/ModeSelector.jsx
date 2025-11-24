import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

const ModeSelector = ({ mode, onModeChange }) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.modeButton,
          mode === 'upload' && styles.modeButtonActive,
        ]}
        onPress={() => onModeChange('upload')}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.modeText,
            mode === 'upload' && styles.modeTextActive,
          ]}
        >
          {t('modeSelector.uploadMode')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.modeButton,
          mode === 'text' && styles.modeButtonActive,
        ]}
        onPress={() => onModeChange('text')}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.modeText,
            mode === 'text' && styles.modeTextActive,
          ]}
        >
          {t('modeSelector.textMode')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#f2f2f7',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modeText: {
    fontSize: 15,
    fontWeight: '500',
    color: '#666666',
  },
  modeTextActive: {
    color: '#0ea5e9',
    fontWeight: '600',
  },
});

export default ModeSelector;
