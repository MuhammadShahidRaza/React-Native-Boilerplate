import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { arabic, dutch, english, german, portuguese, spanish } from './languages';

const resources = {
  english: {
    translation: english,
  },
  spanish: {
    translation: spanish,
  },
  arabic: {
    translation: arabic,
  },
  german: {
    translation: german,
  },
  dutch: {
    translation: dutch,
  },
  portuguese: {
    translation: portuguese,
  },
};

i18n.use(initReactI18next).init({
  resources,
  compatibilityJSON: 'v3',
  fallbackLng: 'english',
  lng: 'english',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
