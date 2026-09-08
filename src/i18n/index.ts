/**
 * i18n Initialization
 *
 * Single i18next init point for the whole app. Language resources live in
 * src/i18n/locales/<lang>/<namespace>.json — adding a new language means
 * adding a new locale folder + registering its code in SUPPORTED_LANGUAGES,
 * no component changes required.
 *
 * Scope: this module only wires up translation strings. It does not read or
 * write app data — the active language itself is persisted through the
 * existing AppSettings/repository mechanism (see src/stores/scheduleStore.ts).
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import commonTR from './locales/tr/common.json';
import calendarTR from './locales/tr/calendar.json';
import shiftTR from './locales/tr/shift.json';
import homeTR from './locales/tr/home.json';
import generateTR from './locales/tr/generate.json';
import reviseTR from './locales/tr/revise.json';
import templatesTR from './locales/tr/templates.json';
import settingsTR from './locales/tr/settings.json';
import dayEditTR from './locales/tr/dayEdit.json';
import shiftTimesTR from './locales/tr/shiftTimes.json';
import durationTR from './locales/tr/duration.json';

import commonEN from './locales/en/common.json';
import calendarEN from './locales/en/calendar.json';
import shiftEN from './locales/en/shift.json';
import homeEN from './locales/en/home.json';
import generateEN from './locales/en/generate.json';
import reviseEN from './locales/en/revise.json';
import templatesEN from './locales/en/templates.json';
import settingsEN from './locales/en/settings.json';
import dayEditEN from './locales/en/dayEdit.json';
import shiftTimesEN from './locales/en/shiftTimes.json';
import durationEN from './locales/en/duration.json';

import commonPT from './locales/pt/common.json';
import calendarPT from './locales/pt/calendar.json';
import shiftPT from './locales/pt/shift.json';
import homePT from './locales/pt/home.json';
import generatePT from './locales/pt/generate.json';
import revisePT from './locales/pt/revise.json';
import templatesPT from './locales/pt/templates.json';
import settingsPT from './locales/pt/settings.json';
import dayEditPT from './locales/pt/dayEdit.json';
import shiftTimesPT from './locales/pt/shiftTimes.json';
import durationPT from './locales/pt/duration.json';

import commonES from './locales/es/common.json';
import calendarES from './locales/es/calendar.json';
import shiftES from './locales/es/shift.json';
import homeES from './locales/es/home.json';
import generateES from './locales/es/generate.json';
import reviseES from './locales/es/revise.json';
import templatesES from './locales/es/templates.json';
import settingsES from './locales/es/settings.json';
import dayEditES from './locales/es/dayEdit.json';
import shiftTimesES from './locales/es/shiftTimes.json';
import durationES from './locales/es/duration.json';

import commonID from './locales/id/common.json';
import calendarID from './locales/id/calendar.json';
import shiftID from './locales/id/shift.json';
import homeID from './locales/id/home.json';
import generateID from './locales/id/generate.json';
import reviseID from './locales/id/revise.json';
import templatesID from './locales/id/templates.json';
import settingsID from './locales/id/settings.json';
import dayEditID from './locales/id/dayEdit.json';
import shiftTimesID from './locales/id/shiftTimes.json';
import durationID from './locales/id/duration.json';

import commonHI from './locales/hi/common.json';
import calendarHI from './locales/hi/calendar.json';
import shiftHI from './locales/hi/shift.json';
import homeHI from './locales/hi/home.json';
import generateHI from './locales/hi/generate.json';
import reviseHI from './locales/hi/revise.json';
import templatesHI from './locales/hi/templates.json';
import settingsHI from './locales/hi/settings.json';
import dayEditHI from './locales/hi/dayEdit.json';
import shiftTimesHI from './locales/hi/shiftTimes.json';
import durationHI from './locales/hi/duration.json';

import commonAR from './locales/ar/common.json';
import calendarAR from './locales/ar/calendar.json';
import shiftAR from './locales/ar/shift.json';
import homeAR from './locales/ar/home.json';
import generateAR from './locales/ar/generate.json';
import reviseAR from './locales/ar/revise.json';
import templatesAR from './locales/ar/templates.json';
import settingsAR from './locales/ar/settings.json';
import dayEditAR from './locales/ar/dayEdit.json';
import shiftTimesAR from './locales/ar/shiftTimes.json';
import durationAR from './locales/ar/duration.json';

import commonRU from './locales/ru/common.json';
import calendarRU from './locales/ru/calendar.json';
import shiftRU from './locales/ru/shift.json';
import homeRU from './locales/ru/home.json';
import generateRU from './locales/ru/generate.json';
import reviseRU from './locales/ru/revise.json';
import templatesRU from './locales/ru/templates.json';
import settingsRU from './locales/ru/settings.json';
import dayEditRU from './locales/ru/dayEdit.json';
import shiftTimesRU from './locales/ru/shiftTimes.json';
import durationRU from './locales/ru/duration.json';

import commonVI from './locales/vi/common.json';
import calendarVI from './locales/vi/calendar.json';
import shiftVI from './locales/vi/shift.json';
import homeVI from './locales/vi/home.json';
import generateVI from './locales/vi/generate.json';
import reviseVI from './locales/vi/revise.json';
import templatesVI from './locales/vi/templates.json';
import settingsVI from './locales/vi/settings.json';
import dayEditVI from './locales/vi/dayEdit.json';
import shiftTimesVI from './locales/vi/shiftTimes.json';
import durationVI from './locales/vi/duration.json';

import commonFIL from './locales/fil/common.json';
import calendarFIL from './locales/fil/calendar.json';
import shiftFIL from './locales/fil/shift.json';
import homeFIL from './locales/fil/home.json';
import generateFIL from './locales/fil/generate.json';
import reviseFIL from './locales/fil/revise.json';
import templatesFIL from './locales/fil/templates.json';
import settingsFIL from './locales/fil/settings.json';
import dayEditFIL from './locales/fil/dayEdit.json';
import shiftTimesFIL from './locales/fil/shiftTimes.json';
import durationFIL from './locales/fil/duration.json';

import commonJA from './locales/ja/common.json';
import calendarJA from './locales/ja/calendar.json';
import shiftJA from './locales/ja/shift.json';
import homeJA from './locales/ja/home.json';
import generateJA from './locales/ja/generate.json';
import reviseJA from './locales/ja/revise.json';
import templatesJA from './locales/ja/templates.json';
import settingsJA from './locales/ja/settings.json';
import dayEditJA from './locales/ja/dayEdit.json';
import shiftTimesJA from './locales/ja/shiftTimes.json';
import durationJA from './locales/ja/duration.json';

import commonKO from './locales/ko/common.json';
import calendarKO from './locales/ko/calendar.json';
import shiftKO from './locales/ko/shift.json';
import homeKO from './locales/ko/home.json';
import generateKO from './locales/ko/generate.json';
import reviseKO from './locales/ko/revise.json';
import templatesKO from './locales/ko/templates.json';
import settingsKO from './locales/ko/settings.json';
import dayEditKO from './locales/ko/dayEdit.json';
import shiftTimesKO from './locales/ko/shiftTimes.json';
import durationKO from './locales/ko/duration.json';

import commonDE from './locales/de/common.json';
import calendarDE from './locales/de/calendar.json';
import shiftDE from './locales/de/shift.json';
import homeDE from './locales/de/home.json';
import generateDE from './locales/de/generate.json';
import reviseDE from './locales/de/revise.json';
import templatesDE from './locales/de/templates.json';
import settingsDE from './locales/de/settings.json';
import dayEditDE from './locales/de/dayEdit.json';
import shiftTimesDE from './locales/de/shiftTimes.json';
import durationDE from './locales/de/duration.json';

import commonFR from './locales/fr/common.json';
import calendarFR from './locales/fr/calendar.json';
import shiftFR from './locales/fr/shift.json';
import homeFR from './locales/fr/home.json';
import generateFR from './locales/fr/generate.json';
import reviseFR from './locales/fr/revise.json';
import templatesFR from './locales/fr/templates.json';
import settingsFR from './locales/fr/settings.json';
import dayEditFR from './locales/fr/dayEdit.json';
import shiftTimesFR from './locales/fr/shiftTimes.json';
import durationFR from './locales/fr/duration.json';

import commonTH from './locales/th/common.json';
import calendarTH from './locales/th/calendar.json';
import shiftTH from './locales/th/shift.json';
import homeTH from './locales/th/home.json';
import generateTH from './locales/th/generate.json';
import reviseTH from './locales/th/revise.json';
import templatesTH from './locales/th/templates.json';
import settingsTH from './locales/th/settings.json';
import dayEditTH from './locales/th/dayEdit.json';
import shiftTimesTH from './locales/th/shiftTimes.json';
import durationTH from './locales/th/duration.json';

import commonPL from './locales/pl/common.json';
import calendarPL from './locales/pl/calendar.json';
import shiftPL from './locales/pl/shift.json';
import homePL from './locales/pl/home.json';
import generatePL from './locales/pl/generate.json';
import revisePL from './locales/pl/revise.json';
import templatesPL from './locales/pl/templates.json';
import settingsPL from './locales/pl/settings.json';
import dayEditPL from './locales/pl/dayEdit.json';
import shiftTimesPL from './locales/pl/shiftTimes.json';
import durationPL from './locales/pl/duration.json';

import commonIT from './locales/it/common.json';
import calendarIT from './locales/it/calendar.json';
import shiftIT from './locales/it/shift.json';
import homeIT from './locales/it/home.json';
import generateIT from './locales/it/generate.json';
import reviseIT from './locales/it/revise.json';
import templatesIT from './locales/it/templates.json';
import settingsIT from './locales/it/settings.json';
import dayEditIT from './locales/it/dayEdit.json';
import shiftTimesIT from './locales/it/shiftTimes.json';
import durationIT from './locales/it/duration.json';

import commonMS from './locales/ms/common.json';
import calendarMS from './locales/ms/calendar.json';
import shiftMS from './locales/ms/shift.json';
import homeMS from './locales/ms/home.json';
import generateMS from './locales/ms/generate.json';
import reviseMS from './locales/ms/revise.json';
import templatesMS from './locales/ms/templates.json';
import settingsMS from './locales/ms/settings.json';
import dayEditMS from './locales/ms/dayEdit.json';
import shiftTimesMS from './locales/ms/shiftTimes.json';
import durationMS from './locales/ms/duration.json';

import commonFA from './locales/fa/common.json';
import calendarFA from './locales/fa/calendar.json';
import shiftFA from './locales/fa/shift.json';
import homeFA from './locales/fa/home.json';
import generateFA from './locales/fa/generate.json';
import reviseFA from './locales/fa/revise.json';
import templatesFA from './locales/fa/templates.json';
import settingsFA from './locales/fa/settings.json';
import dayEditFA from './locales/fa/dayEdit.json';
import shiftTimesFA from './locales/fa/shiftTimes.json';
import durationFA from './locales/fa/duration.json';

import commonUK from './locales/uk/common.json';
import calendarUK from './locales/uk/calendar.json';
import shiftUK from './locales/uk/shift.json';
import homeUK from './locales/uk/home.json';
import generateUK from './locales/uk/generate.json';
import reviseUK from './locales/uk/revise.json';
import templatesUK from './locales/uk/templates.json';
import settingsUK from './locales/uk/settings.json';
import dayEditUK from './locales/uk/dayEdit.json';
import shiftTimesUK from './locales/uk/shiftTimes.json';
import durationUK from './locales/uk/duration.json';

// Faz 1: tr, en. Faz 2 (v2plan.md Bölüm 5/9): pt, es, id, hi, ar.
// Faz 3 (dil sayısını 20'ye çıkarma): ru, vi, fil, ja, ko, de, fr, th, pl, it,
// ms, fa, uk — sıra ve liste kullanıcı talimatıyla sabittir, değiştirilmez.
export const SUPPORTED_LANGUAGES = [
  'tr', 'en', 'pt', 'es', 'id', 'hi', 'ar', 'ru', 'vi', 'fil', 'ja', 'ko', 'de', 'fr', 'th', 'pl', 'it', 'ms', 'fa', 'uk',
] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const FALLBACK_LANGUAGE: SupportedLanguage = 'tr';

// Languages that read right-to-left. Only registers the list for future use
// (e.g. a future RTL layout pass) — it does not trigger any layout change on
// its own; see the RTL note in v2plan.md Bölüm 6. 'fa' (Persian/Farsi) is
// RTL like 'ar'; registered here at the same depth as 'ar' (array membership
// only, no I18nManager/layout wiring — that remains a future phase).
export const RTL_LANGUAGES: readonly SupportedLanguage[] = ['ar', 'fa'];

export const NAMESPACES = [
  'common',
  'calendar',
  'shift',
  'home',
  'generate',
  'revise',
  'templates',
  'settings',
  'dayEdit',
  'shiftTimes',
  'duration',
] as const;

const resources = {
  tr: {
    common: commonTR,
    calendar: calendarTR,
    shift: shiftTR,
    home: homeTR,
    generate: generateTR,
    revise: reviseTR,
    templates: templatesTR,
    settings: settingsTR,
    dayEdit: dayEditTR,
    shiftTimes: shiftTimesTR,
    duration: durationTR,
  },
  en: {
    common: commonEN,
    calendar: calendarEN,
    shift: shiftEN,
    home: homeEN,
    generate: generateEN,
    revise: reviseEN,
    templates: templatesEN,
    settings: settingsEN,
    dayEdit: dayEditEN,
    shiftTimes: shiftTimesEN,
    duration: durationEN,
  },
  pt: {
    common: commonPT,
    calendar: calendarPT,
    shift: shiftPT,
    home: homePT,
    generate: generatePT,
    revise: revisePT,
    templates: templatesPT,
    settings: settingsPT,
    dayEdit: dayEditPT,
    shiftTimes: shiftTimesPT,
    duration: durationPT,
  },
  es: {
    common: commonES,
    calendar: calendarES,
    shift: shiftES,
    home: homeES,
    generate: generateES,
    revise: reviseES,
    templates: templatesES,
    settings: settingsES,
    dayEdit: dayEditES,
    shiftTimes: shiftTimesES,
    duration: durationES,
  },
  id: {
    common: commonID,
    calendar: calendarID,
    shift: shiftID,
    home: homeID,
    generate: generateID,
    revise: reviseID,
    templates: templatesID,
    settings: settingsID,
    dayEdit: dayEditID,
    shiftTimes: shiftTimesID,
    duration: durationID,
  },
  hi: {
    common: commonHI,
    calendar: calendarHI,
    shift: shiftHI,
    home: homeHI,
    generate: generateHI,
    revise: reviseHI,
    templates: templatesHI,
    settings: settingsHI,
    dayEdit: dayEditHI,
    shiftTimes: shiftTimesHI,
    duration: durationHI,
  },
  ar: {
    common: commonAR,
    calendar: calendarAR,
    shift: shiftAR,
    home: homeAR,
    generate: generateAR,
    revise: reviseAR,
    templates: templatesAR,
    settings: settingsAR,
    dayEdit: dayEditAR,
    shiftTimes: shiftTimesAR,
    duration: durationAR,
  },
  ru: {
    common: commonRU,
    calendar: calendarRU,
    shift: shiftRU,
    home: homeRU,
    generate: generateRU,
    revise: reviseRU,
    templates: templatesRU,
    settings: settingsRU,
    dayEdit: dayEditRU,
    shiftTimes: shiftTimesRU,
    duration: durationRU,
  },
  vi: {
    common: commonVI,
    calendar: calendarVI,
    shift: shiftVI,
    home: homeVI,
    generate: generateVI,
    revise: reviseVI,
    templates: templatesVI,
    settings: settingsVI,
    dayEdit: dayEditVI,
    shiftTimes: shiftTimesVI,
    duration: durationVI,
  },
  fil: {
    common: commonFIL,
    calendar: calendarFIL,
    shift: shiftFIL,
    home: homeFIL,
    generate: generateFIL,
    revise: reviseFIL,
    templates: templatesFIL,
    settings: settingsFIL,
    dayEdit: dayEditFIL,
    shiftTimes: shiftTimesFIL,
    duration: durationFIL,
  },
  ja: {
    common: commonJA,
    calendar: calendarJA,
    shift: shiftJA,
    home: homeJA,
    generate: generateJA,
    revise: reviseJA,
    templates: templatesJA,
    settings: settingsJA,
    dayEdit: dayEditJA,
    shiftTimes: shiftTimesJA,
    duration: durationJA,
  },
  ko: {
    common: commonKO,
    calendar: calendarKO,
    shift: shiftKO,
    home: homeKO,
    generate: generateKO,
    revise: reviseKO,
    templates: templatesKO,
    settings: settingsKO,
    dayEdit: dayEditKO,
    shiftTimes: shiftTimesKO,
    duration: durationKO,
  },
  de: {
    common: commonDE,
    calendar: calendarDE,
    shift: shiftDE,
    home: homeDE,
    generate: generateDE,
    revise: reviseDE,
    templates: templatesDE,
    settings: settingsDE,
    dayEdit: dayEditDE,
    shiftTimes: shiftTimesDE,
    duration: durationDE,
  },
  fr: {
    common: commonFR,
    calendar: calendarFR,
    shift: shiftFR,
    home: homeFR,
    generate: generateFR,
    revise: reviseFR,
    templates: templatesFR,
    settings: settingsFR,
    dayEdit: dayEditFR,
    shiftTimes: shiftTimesFR,
    duration: durationFR,
  },
  th: {
    common: commonTH,
    calendar: calendarTH,
    shift: shiftTH,
    home: homeTH,
    generate: generateTH,
    revise: reviseTH,
    templates: templatesTH,
    settings: settingsTH,
    dayEdit: dayEditTH,
    shiftTimes: shiftTimesTH,
    duration: durationTH,
  },
  pl: {
    common: commonPL,
    calendar: calendarPL,
    shift: shiftPL,
    home: homePL,
    generate: generatePL,
    revise: revisePL,
    templates: templatesPL,
    settings: settingsPL,
    dayEdit: dayEditPL,
    shiftTimes: shiftTimesPL,
    duration: durationPL,
  },
  it: {
    common: commonIT,
    calendar: calendarIT,
    shift: shiftIT,
    home: homeIT,
    generate: generateIT,
    revise: reviseIT,
    templates: templatesIT,
    settings: settingsIT,
    dayEdit: dayEditIT,
    shiftTimes: shiftTimesIT,
    duration: durationIT,
  },
  ms: {
    common: commonMS,
    calendar: calendarMS,
    shift: shiftMS,
    home: homeMS,
    generate: generateMS,
    revise: reviseMS,
    templates: templatesMS,
    settings: settingsMS,
    dayEdit: dayEditMS,
    shiftTimes: shiftTimesMS,
    duration: durationMS,
  },
  fa: {
    common: commonFA,
    calendar: calendarFA,
    shift: shiftFA,
    home: homeFA,
    generate: generateFA,
    revise: reviseFA,
    templates: templatesFA,
    settings: settingsFA,
    dayEdit: dayEditFA,
    shiftTimes: shiftTimesFA,
    duration: durationFA,
  },
  uk: {
    common: commonUK,
    calendar: calendarUK,
    shift: shiftUK,
    home: homeUK,
    generate: generateUK,
    revise: reviseUK,
    templates: templatesUK,
    settings: settingsUK,
    dayEdit: dayEditUK,
    shiftTimes: shiftTimesUK,
    duration: durationUK,
  },
};

/**
 * Detect the device's preferred language, mapped to one of our supported
 * languages. Falls back to Turkish for any unsupported/unrecognized locale.
 */
export function detectDeviceLanguage(): SupportedLanguage {
  try {
    const locales = Localization.getLocales();
    const primary = locales[0]?.languageCode;
    if (primary && (SUPPORTED_LANGUAGES as readonly string[]).includes(primary)) {
      return primary as SupportedLanguage;
    }
  } catch {
    // Localization API unavailable — safe fallback below.
  }
  return FALLBACK_LANGUAGE;
}

let initialized = false;

/**
 * Initialize i18next once. `initialLanguage` should come from persisted
 * AppSettings when available; callers pass the detected device language on
 * first-ever launch (no persisted preference yet).
 */
export function initI18n(initialLanguage: SupportedLanguage): typeof i18n {
  if (initialized) {
    return i18n;
  }
  initialized = true;

  i18n.use(initReactI18next).init({
    resources,
    lng: initialLanguage,
    fallbackLng: FALLBACK_LANGUAGE,
    ns: NAMESPACES,
    defaultNS: 'common',
    interpolation: {
      escapeValue: false, // React already escapes rendered text
    },
    compatibilityJSON: 'v4',
    returnNull: false,
  });

  return i18n;
}

export function changeLanguage(lang: SupportedLanguage): void {
  void i18n.changeLanguage(lang);
}

export default i18n;
