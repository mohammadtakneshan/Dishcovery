import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';

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

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
