import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from './locales/languages';
import { TRANSLATIONS_BUNDLE } from './locales/translations_bundle';

const savedLang = localStorage.getItem('app_lang') || 'en';

const namespaces = [
  'common',
  'dashboard',
  'analytics',
  'profile',
  'support',
  'admin',
  'landing',
  'auth',
  'reports',
  'settings'
];

i18n
  .use(initReactI18next)
  .init({
    resources: TRANSLATIONS_BUNDLE,
    lng: savedLang,
    fallbackLng: 'en',
    ns: namespaces,
    defaultNS: namespaces,
    nsSeparator: false,
    keySeparator: false,
    react: {
      useSuspense: false
    },
    interpolation: {
      escapeValue: false
    }
  });

// Apply RTL direction for Arabic, Hebrew, Persian, Urdu on document body
const isRTL = ['ar', 'he', 'fa', 'ur'].includes(savedLang);
document.body.dir = isRTL ? 'rtl' : 'ltr';

export default i18n;
export { SUPPORTED_LANGUAGES };
