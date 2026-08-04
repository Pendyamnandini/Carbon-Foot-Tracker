import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';
import i18n from '../i18n';

const LanguageContext = createContext(null);

const namespaces = [
  'common', 'dashboard', 'analytics', 'profile', 'support',
  'admin', 'landing', 'auth', 'reports', 'settings'
];

export const LanguageProvider = ({ children }) => {
  const auth = useAuth();
  const user = auth ? auth.user : null;
  const updateProfileState = auth ? auth.updateProfileState : null;

  const [lang, setLang] = useState(i18n.language || 'en');

  // Sync with user language preference on login
  useEffect(() => {
    if (user && user.language && user.language !== i18n.language) {
      changeLanguage(user.language);
    }
  }, [user]);

  const changeLanguage = async (newLang) => {
    // Change language in i18next
    await i18n.changeLanguage(newLang);
    setLang(newLang);
    localStorage.setItem('app_lang', newLang);
    
    // Handle RTL
    const isRTL = ['ar', 'he', 'fa', 'ur'].includes(newLang);
    document.body.dir = isRTL ? 'rtl' : 'ltr';

    // Sync preference to server
    if (user) {
      try {
        const res = await api.put('/api/profile', { language: newLang });
        if (res.data.success && updateProfileState) {
          updateProfileState({ language: newLang });
        }
      } catch (err) {
        console.error('Failed to sync language preference to server', err);
      }
    }
  };

  // Custom multi-namespace literal lookup
  const t = (key) => {
    const currentLang = i18n.language || 'en';
    for (const ns of namespaces) {
      const bundle = i18n.getResourceBundle(currentLang, ns);
      if (bundle && bundle[key] !== undefined) {
        return bundle[key];
      }
    }
    if (currentLang !== 'en') {
      for (const ns of namespaces) {
        const bundle = i18n.getResourceBundle('en', ns);
        if (bundle && bundle[key] !== undefined) {
          return bundle[key];
        }
      }
    }
    return key;
  };

  return (
    <LanguageContext.Provider value={{ lang: i18n.language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  
  const customT = (key) => {
    const currentLang = i18n.language || 'en';
    for (const ns of namespaces) {
      const bundle = i18n.getResourceBundle(currentLang, ns);
      if (bundle && bundle[key] !== undefined) {
        return bundle[key];
      }
    }
    if (currentLang !== 'en') {
      for (const ns of namespaces) {
        const bundle = i18n.getResourceBundle('en', ns);
        if (bundle && bundle[key] !== undefined) {
          return bundle[key];
        }
      }
    }
    return key;
  };

  if (!context) {
    return {
      lang: i18n.language || 'en',
      changeLanguage: () => {},
      t: customT
    };
  }
  return context;
};
