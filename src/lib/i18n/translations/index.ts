import { navEn, navRu } from './nav';
import { commonEn, commonRu } from './common';
import { settingsEn, settingsRu } from './settings';
import { authEn, authRu } from './auth';
import { dashboardEn, dashboardRu } from './dashboard';
import { pagesEn, pagesRu } from './pages';
import { landingEn, landingRu } from './landing';

export type Locale = 'en' | 'ru';

export interface TranslationDict {
  nav: Record<string, string>;
  common: Record<string, string>;
  settings: Record<string, string>;
  auth: Record<string, string>;
  dashboard: Record<string, string>;
  pages: Record<string, string>;
  landing: Record<string, string>;
}

export const translations: Record<Locale, TranslationDict> = {
  en: {
    nav: { ...navEn },
    common: { ...commonEn },
    settings: { ...settingsEn },
    auth: { ...authEn },
    dashboard: { ...dashboardEn },
    pages: { ...pagesEn },
    landing: { ...landingEn },
  },
  ru: {
    nav: { ...navRu },
    common: { ...commonRu },
    settings: { ...settingsRu },
    auth: { ...authRu },
    dashboard: { ...dashboardRu },
    pages: { ...pagesRu },
    landing: { ...landingRu },
  },
};
