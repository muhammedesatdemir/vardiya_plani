import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // expo-localization pulls in the native RN runtime, which can't load
      // under Vitest's plain Node environment. Only src/i18n imports it —
      // stub it here for tests; the real package is still used in the app.
      'expo-localization': path.resolve(__dirname, './src/test-mocks/expo-localization.ts'),
    },
  },
});
