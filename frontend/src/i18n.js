import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from './locales/languages';

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

const customBackend = {
  type: 'backend',
  init(services, backendOptions, i18nextOptions) {},
  read(language, namespace, callback) {
    fetch(`/locales/${language}/${namespace}.json`)
      .then(res => {
        if (!res.ok) {
          // If the locale JSON is not found, fallback to English
          return fetch(`/locales/en/${namespace}.json`).then(r => r.json());
        }
        return res.json();
      })
      .then(data => callback(null, data))
      .catch(err => {
        console.warn(`Failed to load namespace ${namespace} for ${language}:`, err);
        callback(null, {}); // fallback gracefully
      });
  }
};

i18n
  .use(customBackend)
  .use(initReactI18next)
  .init({
    lng: savedLang,
    fallbackLng: 'en',
    ns: namespaces,
    defaultNS: 'common',
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
