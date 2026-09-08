/**
 * Root Layout
 *
 * Startup orchestration:
 *
 *   1. preventAutoHide() runs at module load, before React renders anything.
 *      This freezes the native splash so it won't disappear the moment the
 *      JS bundle is evaluated — which is what caused the 2–9s blank screen
 *      between the too-early splash hide and the first painted UI.
 *
 *   2. The schedule store has already hydrated synchronously from disk
 *      (see scheduleStore.ts — file.textSync read at module load), so the
 *      first render already has shifts / templates / planned days / settings.
 *
 *   3. The first visible screen calls notifyFirstScreenReady() from its
 *      onLayout. splashController waits one animation frame, then dismisses
 *      the native splash exactly once. User sees: splash → real UI.
 *
 *   4. A 4s watchdog runs from here so the user is never trapped behind a
 *      splash if the first screen fails to signal readiness.
 *
 * Local-first guarantee:
 *   Nothing in this file reads, writes, or transforms app data. Splash
 *   lifecycle is independent of persistence.
 */

import { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';
import { ThemeProvider, useTheme } from '../src/context';
import { useScheduleStore } from '../src/stores';
import { mark as startupMark } from '../src/utils/startupTimer';
import {
  preventAutoHide,
  startSplashWatchdog,
} from '../src/utils/splashController';
import { initI18n, changeLanguage } from '../src/i18n';

startupMark('root layout: module evaluated');
preventAutoHide();

// i18next must be initialized before the first render — the store is already
// hydrated synchronously from disk at module load (see scheduleStore.ts), so
// the persisted language preference is available here without an async wait.
// On a true first launch (no settings file yet), fileRepository.load() seeds
// `language` from the device locale before we ever read it here; on every
// later launch it's simply the user's saved choice.
initI18n(useScheduleStore.getState().settings.language);

function NavigationContent() {
  const { colors, isDark } = useTheme();
  const { t } = useTranslation(['dayEdit', 'generate', 'revise', 'templates', 'shiftTimes']);
  const shellLaidOutRef = useRef(false);

  startupMark('root layout: render');

  const onShellLayout = () => {
    if (shellLaidOutRef.current) return;
    shellLaidOutRef.current = true;
    startupMark('root layout: first shell layout');
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.background }}
      onLayout={onShellLayout}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary,
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTitleAlign: 'center',
          // iOS: hide the previous route's title next to the back chevron
          // (otherwise '(tabs)' from the parent group leaks into the UI).
          headerBackTitle: '',
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: {
            backgroundColor: colors.background,
          },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="day/[date]"
          options={{
            title: t('dayEdit:screenTitle'),
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="generate"
          options={{
            title: t('generate:screenTitle'),
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="revise"
          options={{
            title: t('revise:screenTitle'),
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="templates/index"
          options={{
            title: t('templates:listScreenTitle'),
          }}
        />
        <Stack.Screen
          name="templates/[id]"
          options={{
            title: t('templates:detailScreenTitle'),
          }}
        />
        <Stack.Screen
          name="shift-times"
          options={{
            title: t('shiftTimes:screenTitle'),
          }}
        />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  useEffect(() => startSplashWatchdog(4000), []);

  // Keep i18next in sync with the persisted language preference. Settings
  // screen updates AppSettings.language through the existing store action;
  // this effect is the single place that reacts to that change and swaps the
  // active i18next language — no other component needs to know about it.
  const language = useScheduleStore((state) => state.settings.language);
  useEffect(() => {
    changeLanguage(language);
  }, [language]);

  return (
    <ThemeProvider>
      <NavigationContent />
    </ThemeProvider>
  );
}
