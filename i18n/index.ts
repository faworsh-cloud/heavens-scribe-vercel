import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import en from './locales/en.json';
import ko from './locales/ko.json';

type Language = 'en' | 'ko';

const translations = { en, ko };

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, options?: Record<string, any>) => any;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const getNestedTranslation = (obj: any, key: string): any => {
  return key.split('.').reduce((acc, part) => acc && acc[part], obj);
};

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useLocalStorage<Language>('app-language', 'ko');

  const t = useCallback((key: string, options?: Record<string, any>): any => {
    let translation = getNestedTranslation(translations[language], key);

    if (translation === undefined || translation === null) {
      console.warn(`Translation key not found: ${key}, falling back to English.`);
      // Fallback to English if key not found in current language
      translation = getNestedTranslation(translations['en'], key);
      if (translation === undefined || translation === null) {
        console.error(`Translation key not found in English fallback: ${key}`);
        return key;
      }
    }
    
    if (options?.returnObjects) {
        return translation;
    }

    let effectiveTranslation = translation;
    if (typeof effectiveTranslation !== 'string') {
        // Fallback for cases where an object is returned but not explicitly requested.
        return key;
    }

    if (options) {
        Object.entries(options).forEach(([replaceKey, value]) => {
            if(replaceKey !== 'returnObjects'){
                effectiveTranslation = effectiveTranslation.replace(new RegExp(`\\{\\{${replaceKey}\\}\\}`, 'g'), String(value));
            }
        });
    }

    return effectiveTranslation;
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextType => {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
