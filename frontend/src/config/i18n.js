import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';

import en from '../locales/en/translation.json';
import hu from '../locales/hu/translation.json';
import fa from '../locales/fa/translation.json';
import ar from '../locales/ar/translation.json';
import ja from '../locales/ja/translation.json';
import vi from '../locales/vi/translation.json';

const resources = {
  en: { translation: en },
  hu: { translation: hu },
  fa: { translation: fa },
  ar: { translation: ar },
  ja: { translation: ja },
  vi: { translation: vi },
};

// Language detector plugin for React Native/Expo
const languageDetector = {
  type: 'languageDetector',
  async: true,
  detect: async (callback) => {
    try {
      // Try to get the language from AsyncStorage
      const language = await AsyncStorage.getItem('user-language');
      if (language) {
        return callback(language);
      }
      // Fall back to device locale
      const deviceLocale = Localization.getLocales()[0]?.languageCode || 'en';
      return callback(deviceLocale);
    } catch (error) {
      console.error('Error detecting language:', error);
      return callback('en');
    }
  },
  init: () => {},
  cacheUserLanguage: async (language) => {
    try {
      await AsyncStorage.setItem('user-language', language);
    } catch (error) {
      console.error('Error caching language:', error);
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    compatibilityJSON: 'v3',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
