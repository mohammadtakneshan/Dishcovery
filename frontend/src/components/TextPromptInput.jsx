import React from 'react';
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import Button from './Button';

const TextPromptInput = ({
  value,
  onChangeText,
  onGenerateImage,
  onGenerateRecipe,
  generatedImageUrl,
  generatingImage,
  generatingRecipe,
  error,
}) => {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {/* Text Input */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>{t('textPrompt.label')}</Text>
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={onChangeText}
          placeholder={t('textPrompt.placeholder')}
          placeholderTextColor="#999999"
          multiline
          numberOfLines={3}
          editable={!generatingImage && !generatingRecipe}
        />
      </View>

      {/* Generated Image Preview */}
      {generatedImageUrl && (
        <View style={styles.imagePreviewContainer}>
          <Text style={styles.imageLabel}>{t('textPrompt.generatedImage')}</Text>
          <Image
            source={{ uri: generatedImageUrl }}
            style={styles.imagePreview}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {!generatedImageUrl ? (
          <Button
            title={t('textPrompt.generateImage')}
            onPress={onGenerateImage}
            disabled={!value || value.trim().length < 3 || generatingImage}
            variant="primary"
          />
        ) : (
          <View style={styles.dualButtonContainer}>
            <TouchableOpacity
              style={styles.regenerateButton}
              onPress={onGenerateImage}
              disabled={generatingImage || generatingRecipe}
              activeOpacity={0.7}
            >
              {generatingImage ? (
                <ActivityIndicator color="#0ea5e9" size="small" />
              ) : (
                <Text style={styles.regenerateText}>
                  {t('textPrompt.regenerateImage')}
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.spacer} />

            <Button
              title={t('textPrompt.generateRecipe')}
              onPress={onGenerateRecipe}
              disabled={generatingRecipe || generatingImage}
              variant="primary"
            />
          </View>
        )}
      </View>

      {/* Loading Indicators */}
      {generatingImage && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.loadingText}>{t('textPrompt.generatingImage')}</Text>
        </View>
      )}

      {generatingRecipe && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0ea5e9" />
          <Text style={styles.loadingText}>{t('textPrompt.generatingRecipe')}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d1d6',
    borderRadius: 12,
    padding: 12,
    fontSize: 15,
    minHeight: 80,
    textAlignVertical: 'top',
    color: '#000000',
  },
  imagePreviewContainer: {
    marginBottom: 16,
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    marginBottom: 8,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    backgroundColor: '#f2f2f7',
  },
  buttonContainer: {
    marginTop: 8,
  },
  dualButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  regenerateButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#f2f2f7',
    borderWidth: 1,
    borderColor: '#d1d1d6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  regenerateText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0ea5e9',
  },
  spacer: {
    width: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },
});

export default TextPromptInput;
