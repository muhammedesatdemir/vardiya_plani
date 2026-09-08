/**
 * Date Utilities
 *
 * All date operations use date-fns with Turkish locale.
 * Dates are stored as ISO strings (YYYY-MM-DD).
 */

import {
  format,
  parse,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDaysInMonth,
  isValid,
  getYear,
  getMonth,
  getDate,
} from 'date-fns';
import {
  tr,
  enUS,
  pt,
  es,
  id as idLocale,
  hi,
  ar,
  ru,
  vi,
  ja,
  ko,
  de,
  fr,
  th,
  pl,
  it,
  ms,
  faIR,
  uk,
} from 'date-fns/locale';
import type { Locale } from 'date-fns';
import i18n from '../i18n';

// Maps the active UI language to its date-fns locale object. Adding a new
// supported language means adding one entry here (plus its date-fns locale
// package) — no changes needed in the formatting functions below.
//
// NOTE on 'fil' (Filipino): date-fns has no official `fil` locale package
// (verified against the installed version's node_modules/date-fns/locale
// directory listing — no fil/tl export exists). Filipino date conventions
// (Gregorian calendar, Latin month/weekday names, similar day-order habits)
// are closest to US English among the locales date-fns ships, so 'fil' falls
// back to `enUS` here rather than to Turkish — this only affects date-fns
// generated strings (e.g. calendar month/weekday names via `format()`);
// UI text itself is fully translated via the fil/*.json i18n resources.
const DATE_FNS_LOCALES: Record<string, Locale> = {
  tr,
  en: enUS,
  pt,
  es,
  id: idLocale,
  hi,
  ar,
  ru,
  vi,
  fil: enUS, // documented fallback — see NOTE above
  ja,
  ko,
  de,
  fr,
  th,
  pl,
  it,
  ms,
  fa: faIR,
  uk,
};

function getActiveDateLocale(): Locale {
  return DATE_FNS_LOCALES[i18n.language] ?? tr;
}

// ============================================
// DATE FORMAT CONSTANTS
// ============================================

export const ISO_DATE_FORMAT = 'yyyy-MM-dd';

// ============================================
// PARSING & FORMATTING
// ============================================

/**
 * Format Date to ISO string (YYYY-MM-DD)
 */
export function toISODateString(date: Date): string {
  return format(date, ISO_DATE_FORMAT);
}

/**
 * Parse ISO date string to Date object
 */
export function parseISODate(dateStr: string): Date {
  const parsed = parse(dateStr, ISO_DATE_FORMAT, new Date());
  if (!isValid(parsed)) {
    throw new Error(`Invalid date string: ${dateStr}`);
  }
  return parsed;
}

/**
 * Validate ISO date string format
 */
export function isValidISODate(dateStr: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return false;
  }
  try {
    const parsed = parseISODate(dateStr);
    return isValid(parsed);
  } catch {
    return false;
  }
}

// ============================================
// TURKISH FORMATTING
// ============================================

/**
 * Format date in the active UI language: "22 Mart 2026, Pazar" (tr) /
 * "March 22, 2026, Sunday" pattern (en). Locale is resolved dynamically from
 * i18n.language so this keeps following the user's language selection.
 */
export function formatDateTR(date: Date): string {
  return format(date, 'd MMMM yyyy, EEEE', { locale: getActiveDateLocale() });
}

/**
 * Format date short in the active UI language: "22 Mart" / "March 22"
 */
export function formatDateShortTR(date: Date): string {
  return format(date, 'd MMMM', { locale: getActiveDateLocale() });
}

/**
 * Format month and year in the active UI language: "Mart 2026" / "March 2026"
 */
export function formatMonthYearTR(date: Date): string {
  return format(date, 'MMMM yyyy', { locale: getActiveDateLocale() });
}

/**
 * Format weekday in the active UI language: "Pazar" / "Sunday"
 */
export function formatWeekdayTR(date: Date): string {
  return format(date, 'EEEE', { locale: getActiveDateLocale() });
}

/**
 * Format weekday short name in the active UI language: "Paz" / "Sun".
 * Equivalent to what Intl.DateTimeFormat(locale, { weekday: 'short' }) used
 * to produce, but resolved from the active i18n language instead of a
 * hardcoded locale string.
 */
export function formatWeekdayShort(date: Date): string {
  return format(date, 'EEE', { locale: getActiveDateLocale() });
}

// ============================================
// DATE CALCULATIONS
// ============================================

/**
 * Get all days in a month as ISO strings
 */
export function getDaysInMonthRange(year: number, month: number): string[] {
  const start = new Date(year, month - 1, 1);
  const end = endOfMonth(start);
  const days = eachDayOfInterval({ start, end });
  return days.map(toISODateString);
}

/**
 * Get all days in a date range as ISO strings
 * Returns empty array if end is before start
 */
export function getDaysInRange(startDate: string, endDate: string): string[] {
  const start = parseISODate(startDate);
  const end = parseISODate(endDate);

  // Handle invalid range (end before start)
  if (end < start) {
    return [];
  }

  const days = eachDayOfInterval({ start, end });
  return days.map(toISODateString);
}

/**
 * Get the last day of a month as ISO string
 */
export function getLastDayOfMonth(year: number, month: number): string {
  const date = new Date(year, month - 1, 1);
  return toISODateString(endOfMonth(date));
}

/**
 * Get the first day of a month as ISO string
 */
export function getFirstDayOfMonth(year: number, month: number): string {
  return toISODateString(new Date(year, month - 1, 1));
}

/**
 * Get number of days in a month
 */
export function getDayCount(year: number, month: number): number {
  return getDaysInMonth(new Date(year, month - 1, 1));
}

/**
 * Get previous month's last day as ISO string
 */
export function getPreviousMonthLastDay(year: number, month: number): string {
  const firstDay = new Date(year, month - 1, 1);
  const prevDay = subDays(firstDay, 1);
  return toISODateString(prevDay);
}

/**
 * Add days to an ISO date string
 */
export function addDaysToDate(dateStr: string, days: number): string {
  const date = parseISODate(dateStr);
  return toISODateString(addDays(date, days));
}

/**
 * Extract year, month, day from ISO date string
 */
export function extractDateParts(dateStr: string): {
  year: number;
  month: number;
  day: number;
} {
  const date = parseISODate(dateStr);
  return {
    year: getYear(date),
    month: getMonth(date) + 1, // 1-indexed
    day: getDate(date),
  };
}

// ============================================
// TODAY
// ============================================

/**
 * Get today's date as ISO string
 */
export function getTodayISO(): string {
  return toISODateString(new Date());
}

/**
 * Get current year and month
 */
export function getCurrentYearMonth(): { year: number; month: number } {
  const now = new Date();
  return {
    year: getYear(now),
    month: getMonth(now) + 1, // 1-indexed
  };
}
