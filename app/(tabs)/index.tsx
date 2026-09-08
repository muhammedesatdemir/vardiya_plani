/**
 * Home Screen (Ana Sayfa)
 *
 * Shows today's shift prominently with smart context.
 * Optimized for quick glance - minimal scroll needed.
 *
 * UX Goals:
 * - 1 saniyede okunmalı
 * - Minimum etkileşimle bilgi alınmalı
 * - Ekran dolu ama kalabalık değil hissetmeli
 * - "İyi tasarlanmış" ürün hissi vermeli
 */

import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useScheduleStore, selectTodayShift } from '../../src/stores';
import {
  formatDateTR,
  formatWeekdayShort,
  formatWeekdayTR,
  getTodayISO,
  addDaysToDate,
  parseISODate,
} from '../../src/utils/date';
import { useTheme } from '../../src/context';
import { getShiftDisplayName } from '../../src/utils/shiftDisplay';
import { mark as startupMark } from '../../src/utils/startupTimer';
import { notifyFirstScreenReady } from '../../src/utils/splashController';
import {
  TodayShiftCard,
  UpcomingDays,
  QuickActions,
  SmartInsight,
  HomeBottomActions,
  SummarySheet,
  NotesSheet,
} from '../../src/components/home';

export default function HomeScreen() {
  startupMark('home screen: mount');
  const router = useRouter();
  const { colors } = useTheme();
  const { t } = useTranslation(['home', 'calendar']);
  const today = getTodayISO();
  const [summaryVisible, setSummaryVisible] = useState(false);
  const [notesVisible, setNotesVisible] = useState(false);

  const todayShift = useScheduleStore(selectTodayShift);
  const plannedDays = useScheduleStore((state) => state.plannedDays);
  const shiftTypes = useScheduleStore((state) => state.shiftTypes);

  // Get shift type details for today
  const todayShiftType = todayShift
    ? shiftTypes.find((st) => st.code === todayShift.shiftCode) ?? null
    : null;

  // Prepare upcoming 7 days data
  const upcomingDays = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const dateStr = addDaysToDate(today, i);
      const day = plannedDays[dateStr];
      const st = day ? shiftTypes.find((s) => s.code === day.shiftCode) : null;
      const dateObj = parseISODate(dateStr);
      const dayName = formatWeekdayShort(dateObj);

      days.push({
        date: dateStr,
        dayName,
        dayNum: dateObj.getDate(),
        plannedDay: day ?? null,
        shiftType: st ?? null,
        isToday: i === 0,
        isTomorrow: i === 1,
      });
    }
    return days;
  }, [today, plannedDays, shiftTypes]);

  // Calculate next working shift info (for context line)
  const nextWorkingShift = useMemo(() => {
    // Skip today, look for next working shift
    for (let i = 1; i <= 14; i++) {
      const dateStr = addDaysToDate(today, i);
      const day = plannedDays[dateStr];
      if (day) {
        const st = shiftTypes.find((s) => s.code === day.shiftCode);
        if (st?.isWorking) {
          const dateObj = parseISODate(dateStr);
          const dayLabel = i === 1
            ? t('calendar:tomorrow')
            : formatWeekdayTR(dateObj);
          return {
            dayLabel,
            shiftName: getShiftDisplayName(st),
            time: st.startTime ?? undefined,
            daysAway: i,
          };
        }
      }
    }
    return null;
  }, [today, plannedDays, shiftTypes]);

  // Calculate smart insight message
  const smartInsight = useMemo(() => {
    if (!todayShift) return null;

    const todaySt = shiftTypes.find((s) => s.code === todayShift.shiftCode);

    // The "X gün üst üste çalışıyorsun" headline counts the total streak —
    // every consecutive working day around today, both backward and forward.
    // The motivation line, however, asks a different question: "what day of
    // this streak is *today*?" — so we also track how far back the streak
    // already extends. With both, day 1 = first day of the streak, day N =
    // last day before the next off.
    let daysBefore = 0;
    if (todaySt?.isWorking) {
      for (let i = 1; i <= 14; i++) {
        const dateStr = addDaysToDate(today, -i);
        const day = plannedDays[dateStr];
        const st = day ? shiftTypes.find((s) => s.code === day.shiftCode) : null;
        if (st?.isWorking) {
          daysBefore++;
        } else {
          break;
        }
      }
    }

    let daysForward = 0;
    if (todaySt?.isWorking) {
      for (let i = 1; i <= 14; i++) {
        const dateStr = addDaysToDate(today, i);
        const day = plannedDays[dateStr];
        const st = day ? shiftTypes.find((s) => s.code === day.shiftCode) : null;
        if (st?.isWorking) {
          daysForward++;
        } else {
          break;
        }
      }
    }

    // Total streak length (used for the headline) and today's position in it
    // (used for the motivation line, 1-indexed).
    const consecutiveWork = todaySt?.isWorking
      ? daysBefore + 1 + daysForward
      : 0;
    const dayInStreak = todaySt?.isWorking ? daysBefore + 1 : 0;

    // Find next off day
    let nextOffDays = 0;
    for (let i = 1; i <= 14; i++) {
      const dateStr = addDaysToDate(today, i);
      const day = plannedDays[dateStr];
      const st = day ? shiftTypes.find((s) => s.code === day.shiftCode) : null;
      if (st && !st.isWorking) {
        nextOffDays = i;
        break;
      }
    }

    // Day-of-streak → motivational sentence. Indexed by where today falls in
    // the current working streak (1-based). If the streak is longer than the
    // map (rare — most rotations are <= 6 working days), fall back to a
    // generic line so we don't repeat the "son gün" message inappropriately.
    const motivationByDay: Record<number, string> = {
      1: t('home:motivation.day1'),
      2: t('home:motivation.day2'),
      3: t('home:motivation.day3'),
      4: t('home:motivation.day4'),
      5: t('home:motivation.day5'),
      6: t('home:motivation.lastDay'),
    };
    // Special case: today is the last working day of the streak (next day
    // is off). Override with the "son gün" line regardless of day index,
    // so a 3-day streak ending today still reads naturally.
    const isLastDayOfStreak =
      todaySt?.isWorking === true && daysForward === 0;
    const motivation =
      todaySt?.isWorking && dayInStreak > 0
        ? isLastDayOfStreak && dayInStreak >= 2
          ? t('home:motivation.lastDay')
          : motivationByDay[dayInStreak] ?? t('home:motivation.fallback')
        : undefined;

    // Decide which insight to show
    if (consecutiveWork >= 3) {
      return {
        message: t('home:consecutiveWorkDays', { count: consecutiveWork }),
        icon: '💪',
        subMessage: motivation,
      };
    } else if (nextOffDays > 0 && nextOffDays <= 7) {
      const label = nextOffDays === 1
        ? t('calendar:tomorrow')
        : t('home:daysUntilOff', { count: nextOffDays });
      return {
        message: t('home:nextOffTomorrow', { label }),
        icon: '🌴',
        subMessage: motivation,
      };
    } else if (todaySt && !todaySt.isWorking && nextWorkingShift) {
      return {
        message: t('home:nextShiftLabel', { day: nextWorkingShift.dayLabel }),
        icon: '📅',
        subMessage: undefined,
      };
    }

    return null;
  }, [today, todayShift, plannedDays, shiftTypes, nextWorkingShift, t]);

  // Quick actions - only 2 essential actions
  const quickActions = [
    {
      id: 'calendar',
      icon: '📅',
      label: t('home:calendarAction'),
      subtitle: t('home:calendarActionSubtitle'),
      onPress: () => router.push('/calendar'),
    },
    {
      id: 'generate',
      icon: '✨',
      label: t('home:generateAction'),
      subtitle: t('home:generateActionSubtitle'),
      onPress: () => router.push('/generate'),
    },
  ];

  const handleFirstLayout = () => {
    startupMark('home screen: first paint (onLayout)');
    // Signal the splash controller that real UI is painted — it will
    // dismiss the native splash after one rAF tick.
    notifyFirstScreenReady();
  };

  return (
    <View
      style={[styles.container, { backgroundColor: colors.background }]}
      onLayout={handleFirstLayout}
    >
      {/* Today's Shift - Hero Card with context */}
      <TodayShiftCard
        date={today}
        formattedDate={formatDateTR(parseISODate(today))}
        plannedDay={todayShift}
        shiftType={todayShiftType}
        nextWorkingShift={nextWorkingShift}
        onCreatePlan={() => router.push('/generate')}
      />

      {/* Smart Insight - Micro info line */}
      {smartInsight && (
        <SmartInsight
          message={smartInsight.message}
          icon={smartInsight.icon}
          subMessage={smartInsight.subMessage}
        />
      )}

      {/* Upcoming 7 Days Preview */}
      <UpcomingDays days={upcomingDays} />

      {/* Quick Actions - 2 buttons (Takvim + Plan Oluştur) */}
      <QuickActions actions={quickActions} />

      {/* Alt sıra: Mesai Özeti + Aylık Notlar yan yana */}
      <HomeBottomActions
        onPressSummary={() => setSummaryVisible(true)}
        onPressNotes={() => setNotesVisible(true)}
      />

      <SummarySheet
        visible={summaryVisible}
        onClose={() => setSummaryVisible(false)}
      />
      <NotesSheet
        visible={notesVisible}
        onClose={() => setNotesVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 12,
  },
});
