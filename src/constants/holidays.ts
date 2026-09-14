/**
 * Türkiye Resmi Tatilleri (frontend gösterimi için)
 *
 * Yalnızca takvimde küçük bir marker ve gün detayında bir etiket göstermek
 * üzere tutulan sabit liste. Bu veri arka uç / iş mantığı için kaynak
 * değildir — vardiya planlamasına etki etmez.
 *
 * İslami bayram tarihleri (Ramazan / Kurban) her yıl değişir. Bu dosyada
 * yer alan 2026 tarihleri kullanıcının verdiği listeye göre eklenmiştir;
 * yayına almadan önce resmi (Diyanet / Resmi Gazete) kaynakla doğrulamak
 * gerekir. Yapı yıl bazında genişletilebilir.
 *
 * i18n (v2plan.md Bölüm 9 Faz 3): `name` stays the Turkish label (used as
 * the i18next `defaultValue` fallback and for any non-UI/debug use). Each
 * entry also carries a stable `id`, unrelated to the date, used to look up
 * the localized display name at `calendar.holidays.<id>` in the active UI
 * language — see `getHolidayDisplayName` below. Dates and this Turkish
 * holiday dataset itself are unchanged; only the rendered label is
 * localized. This is intentionally not a country/region system — Turkish
 * public holidays are shown, translated, to every UI language.
 */

import i18n from '../i18n';

export interface TurkeyHoliday {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
}

const HOLIDAYS_2026: TurkeyHoliday[] = [
  { id: 'newYear', date: '2026-01-01', name: 'Yılbaşı' },
  // Ramazan Bayramı — doğrulanmalı
  { id: 'ramadanEve', date: '2026-03-20', name: 'Ramazan Bayramı Arifesi' },
  { id: 'ramadanDay1', date: '2026-03-21', name: 'Ramazan Bayramı 1. Gün' },
  { id: 'ramadanDay2', date: '2026-03-22', name: 'Ramazan Bayramı 2. Gün' },
  { id: 'ramadanDay3', date: '2026-03-23', name: 'Ramazan Bayramı 3. Gün' },
  { id: 'nationalSovereigntyChildrensDay', date: '2026-04-23', name: 'Ulusal Egemenlik ve Çocuk Bayramı' },
  { id: 'labourDay', date: '2026-05-01', name: 'Emek ve Dayanışma Günü' },
  { id: 'commemorationYouthSportsDay', date: '2026-05-19', name: 'Atatürk’ü Anma, Gençlik ve Spor Bayramı' },
  // Kurban Bayramı — doğrulanmalı
  { id: 'sacrificeEve', date: '2026-05-26', name: 'Kurban Bayramı Arifesi' },
  { id: 'sacrificeDay1', date: '2026-05-27', name: 'Kurban Bayramı 1. Gün' },
  { id: 'sacrificeDay2', date: '2026-05-28', name: 'Kurban Bayramı 2. Gün' },
  { id: 'sacrificeDay3', date: '2026-05-29', name: 'Kurban Bayramı 3. Gün' },
  { id: 'sacrificeDay4', date: '2026-05-30', name: 'Kurban Bayramı 4. Gün' },
  { id: 'democracyNationalUnityDay', date: '2026-07-15', name: 'Demokrasi ve Millî Birlik Günü' },
  { id: 'victoryDay', date: '2026-08-30', name: 'Zafer Bayramı' },
  { id: 'republicDayEve', date: '2026-10-28', name: 'Cumhuriyet Bayramı Arifesi' },
  { id: 'republicDay', date: '2026-10-29', name: 'Cumhuriyet Bayramı' },
];

const HOLIDAY_INDEX: Record<string, TurkeyHoliday> = HOLIDAYS_2026.reduce(
  (acc, h) => {
    acc[h.date] = h;
    return acc;
  },
  {} as Record<string, TurkeyHoliday>,
);

/**
 * ISO tarihten (YYYY-MM-DD) resmi tatilin Türkçe adını döner; tatil değilse
 * null. Not: bu, `name` alanının ham (çevrilmemiş) halidir — ekranda
 * gösterilecek yerelleştirilmiş metin için `getHolidayDisplayName` kullanın.
 */
export function getHolidayName(dateISO: string): string | null {
  return HOLIDAY_INDEX[dateISO]?.name ?? null;
}

/**
 * ISO tarihten (YYYY-MM-DD) resmi tatilin stabil id'sini döner (tarihten
 * bağımsız, `calendar.holidays.<id>` çeviri anahtarlarıyla eşleşir); tatil
 * değilse null.
 */
export function getHolidayId(dateISO: string): string | null {
  return HOLIDAY_INDEX[dateISO]?.id ?? null;
}

/**
 * Verilen ISO tarihin resmi tatil olup olmadığını döner.
 */
export function isHoliday(dateISO: string): boolean {
  return dateISO in HOLIDAY_INDEX;
}

/**
 * ISO tarihten (YYYY-MM-DD) resmi tatilin, aktif UI dilinde yerelleştirilmiş
 * adını döner; tatil değilse null. Çeviri `calendar.holidays.<id>` anahtarı
 * üzerinden çözülür; eksik bir çeviri varsa Türkçe `name` alanına düşer.
 * Yalnızca görüntüleme metnini etkiler — tarih eşleştirme/iş mantığı
 * (`isHoliday`, `HOLIDAY_INDEX`) değişmez.
 */
export function getHolidayDisplayName(dateISO: string): string | null {
  const holiday = HOLIDAY_INDEX[dateISO];
  if (!holiday) return null;
  return i18n.t(`calendar:holidays.${holiday.id}`, { defaultValue: holiday.name });
}
