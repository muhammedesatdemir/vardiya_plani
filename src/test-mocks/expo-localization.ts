/**
 * Test-only stub for expo-localization.
 *
 * Vitest runs in a plain Node environment (see vitest.config.ts) with no
 * React Native runtime, so the real native module can't load there. This
 * stub is aliased in for tests only (see vitest.config.ts resolve.alias) —
 * it has no effect on the actual app build, which still uses the real
 * expo-localization package.
 */
export function getLocales() {
  return [{ languageCode: 'tr', languageTag: 'tr-TR' }];
}
