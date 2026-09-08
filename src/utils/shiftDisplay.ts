/**
 * Shift Display Helpers (Localization Only)
 *
 * These functions translate a shift's persisted `code` into a display label
 * in the active UI language, using the `shift` i18n namespace. They do NOT
 * change the underlying ShiftType data (code/name/shortName), the scheduling
 * algorithm, or how shifts are stored — DEFAULT_SHIFT_TYPES in
 * src/constants/shifts.ts remains the single source of truth for shift data.
 *
 * Use these only where a shift needs to be shown to the user; anywhere the
 * code itself is compared or persisted, keep using ShiftType.code directly.
 */

import i18n from '../i18n';
import { isOffCode } from '../constants/shifts';
import type { ShiftType } from '../types';

const CODE_TO_KEY: Record<string, string> = {
  '0715': 'morning',
  '1523': 'afternoon',
  '2307': 'night',
};

/**
 * Translated full display name for a shift, resolved by its stable `code`.
 * Falls back to the shift's own `name` field (e.g. a user-defined template
 * name) if the code isn't one of the known defaults.
 */
export function getShiftDisplayName(shiftType: Pick<ShiftType, 'code' | 'name'> | null | undefined): string {
  if (!shiftType) return '';
  if (isOffCode(shiftType.code)) {
    return i18n.t('shift:off', { defaultValue: shiftType.name });
  }
  const key = CODE_TO_KEY[shiftType.code];
  if (key) {
    return i18n.t(`shift:${key}`, { defaultValue: shiftType.name });
  }
  return shiftType.name;
}

/**
 * Friendly display info (title, subtitle, pattern string) for a program
 * template — shown on template cards in generate.tsx and templates/index.tsx.
 *
 * Previously duplicated verbatim in both screens (pre-existing tech debt
 * flagged in v2plan.md Bölüm 8 item #3); consolidated here as a pure
 * display-layer helper. No behavior change — same lookup, same output.
 *
 * NOTE (i18n): the code-to-label matching below (checking substrings like
 * "öğle", "akşam", "gece" against the shift's internal `name` field) is
 * copied verbatim from the pre-existing duplicated `getShiftName()` in both
 * screens, unchanged in behavior. In practice a shift named "Öğle" matches
 * the "afternoon" branch (checked before "evening"), so "shift:evening" is
 * not reached by any of DEFAULT_SHIFT_TYPES's current names — the branch is
 * kept only for parity with the original logic, not because it fires today.
 */
export function getTemplateDisplayInfo(
  template: { name: string; steps: string[]; cycleLength: number; isDefault?: boolean },
  shiftTypes: Pick<ShiftType, 'code' | 'name' | 'shortName'>[]
): { title: string; subtitle: string; pattern: string } {
  const { name, steps, cycleLength } = template;

  const offDays = steps.filter((code) => isOffCode(code)).length;
  const workDays = cycleLength - offDays;

  const getStepShiftName = (code: string): string => {
    if (isOffCode(code)) return i18n.t('shift:leave');
    const shift = shiftTypes.find((s) => s.code === code);
    if (!shift) return code;
    const n = shift.name.toLowerCase();
    if (n.includes('sabah') || n.includes('morning')) return i18n.t('shift:morning');
    if (n.includes('öğle') || n.includes('ogle') || n.includes('afternoon')) return i18n.t('shift:afternoon');
    if (n.includes('akşam') || n.includes('aksam') || n.includes('evening')) return i18n.t('shift:evening');
    if (n.includes('gece') || n.includes('night')) return i18n.t('shift:night');
    return shift.shortName || code;
  };

  const groups: { name: string; count: number }[] = [];
  let currentShift = '';
  let currentCount = 0;

  for (const code of steps) {
    const shiftName = getStepShiftName(code);
    if (shiftName === currentShift) {
      currentCount++;
    } else {
      if (currentShift) {
        groups.push({ name: currentShift, count: currentCount });
      }
      currentShift = shiftName;
      currentCount = 1;
    }
  }
  if (currentShift) {
    groups.push({ name: currentShift, count: currentCount });
  }

  const pattern = groups
    .map((g) => `${g.count} ${g.name.toLowerCase()}`)
    .join(' → ');

  const trimmed = name.trim();
  let friendlyName = trimmed;
  if (trimmed.startsWith('BYG-') || /^[A-Z]+-[A-Z0-9]+$/.test(trimmed)) {
    friendlyName = i18n.t('shift:standardCycle', { count: cycleLength });
  } else if (!template.isDefault && trimmed.length < 2) {
    friendlyName = trimmed.length === 0
      ? i18n.t('shift:customPattern')
      : i18n.t('shift:customPatternNamed', { name: trimmed });
  }

  return {
    title: friendlyName,
    subtitle: i18n.t('generate:cycleSummary', { cycleLength, workDays, offDays }),
    pattern,
  };
}
