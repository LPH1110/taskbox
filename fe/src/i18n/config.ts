import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import enTranslation from './locales/en.json';
import viTranslation from './locales/vi.json';

// Define the structure of your resources for TypeScript safety
export const defaultNS = 'common';
export const resources = {
  en: {
    common: enTranslation.common,
    landing: enTranslation.landing,
    sidebar: enTranslation.sidebar,
    auth: enTranslation.auth,
    profile: enTranslation.profile,
    settings: enTranslation.settings,
    workspaces: enTranslation.workspaces,
    planner: enTranslation.planner,
    header: enTranslation.header,
    boards: enTranslation.boards,
  },
  vi: {
    common: viTranslation.common,
    landing: viTranslation.landing,
    sidebar: viTranslation.sidebar,
    auth: viTranslation.auth,
    profile: viTranslation.profile,
    settings: viTranslation.settings,
    workspaces: viTranslation.workspaces,
    planner: viTranslation.planner,
    header: viTranslation.header,
    boards: viTranslation.boards,
  },
} as const;

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next.
  .use(initReactI18next)
  // Init i18next
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS,
    
    interpolation: {
      escapeValue: false, // React already does escaping
    },
  });

export default i18n;
