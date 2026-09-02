import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { SUPPORTED_LANGUAGES } from './locales/languages';

const savedLang = localStorage.getItem('language') || 'en';

const customBackend = {
  type: 'backend',
  init(services, backendOptions, i18nextOptions) {},
  read(language, namespace, callback) {
    fetch(`/locales/${language}/translation.json`)
      .then(res => {
        if (!res.ok) {
          return fetch(`/locales/en/translation.json`).then(r => r.json());
        }
        return res.json();
      })
      .then(data => callback(null, data))
      .catch(err => {
        console.warn(`Failed to load translations for ${language}:`, err);
        callback(null, {});
      });
  }
};

i18n
  .use(customBackend)
  .use(initReactI18next)
  .init({
    lng: savedLang,
    fallbackLng: 'en',
    ns: ['translation'],
    defaultNS: 'translation',
    nsSeparator: false,
    keySeparator: false,
    react: {
      useSuspense: false
    },
    interpolation: {
      escapeValue: false
    }
  });

const isRTL = ['ar', 'he', 'fa', 'ur'].includes(savedLang);
document.body.dir = isRTL ? 'rtl' : 'ltr';

export default i18n;
export { SUPPORTED_LANGUAGES };
