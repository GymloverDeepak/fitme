import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import AppFooter from '../components/AppFooter';
import BrandLogo from '../components/BrandLogo';
import FitnessCard from '../components/FitnessCard';
import Notice from '../components/Notice';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer from '../components/ScreenContainer';
import SecondaryButton from '../components/SecondaryButton';
import SectionHeading from '../components/SectionHeading';
import StatCard from '../components/StatCard';
import StatRow from '../components/StatRow';
import WaterTracker from '../components/WaterTracker';
import { FITNESS_TIPS, MOTIVATION_QUOTES, getDailyItem } from '../data/tips';
import { REST_DAY_TIPS, describeEntry, getPlanDay, getScheduledDay } from '../data/workouts';
import { getSessionProgress } from '../storage/workoutLogic';
import { ROUTES, navigateSafely } from '../navigation/routes';
import { useAppState } from '../storage/AppStateContext';
import { colors, radius, spacing, typography } from '../theme';
import { dateFromKey, formatDateKey, getGreeting, getStartOfWeek } from '../utils/date';

const QUICK_LINKS = [
  { route: ROUTES.WORKOUT, label: 'Workout', caption: 'Plans & exercises', icon: 'barbell-outline' },
  { route: ROUTES.DIET, label: 'Diet', caption: 'Indian meal plans', icon: 'restaurant-outline' },
  { route: ROUTES.PROGRESS, label: 'Progress', caption: 'Weight & history', icon: 'stats-chart-outline' },
  { route: ROUTES.SETTINGS, label: 'Settings', caption: 'Units & data', icon: 'settings-outline' },
];

export default function HomeScreen({ navigation }) {
  const { todayKey, settings, sessions, activeSession, startSession, getDayExercisesFor } = useAppState();
  const [tipOffset, setTipOffset] = useState(0);

  const { plan, day, weekdayName } = getScheduledDay(settings.planId, dateFromKey(todayKey));
  const exercises = day ? getDayExercisesFor(plan.id, day.id) : [];
  const activeDay = activeSession ? getPlanDay(activeSession.planId, activeSession.dayId).day : null;

  const todaysSessions = sessions.filter((session) => session.dateKey === todayKey);
  const exercisesDoneToday = todaysSessions.reduce((sum, session) => sum + session.completedExerciseIds.length, 0);
  const weekStart = getStartOfWeek(dateFromKey(todayKey));
  const sessionsThisWeek = sessions.filter((session) => session.finishedAt >= weekStart).length;

  const handleStartWorkout = () => {
    if (startSession(plan.id, day.id)) navigateSafely(navigation, ROUTES.WORKOUT_SESSION);
  };

  return (
    <ScreenContainer>
      {/* 1. Logo and greeting */}
      <View style={styles.header}>
        <BrandLogo size={72} />
        <View style={styles.headerText}>
          <Text style={styles.logo} accessibilityRole="header" accessibilityLabel="FITME">
            FIT<Text style={styles.logoAccent}>ME</Text>
          </Text>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.date}>{formatDateKey(todayKey)}</Text>
        </View>
      </View>

      {/* 2. Motivational hero */}
      <FitnessCard variant="accent">
        <Text style={styles.heroLabel}>Today’s motivation</Text>
        <Text style={styles.heroQuote}>{getDailyItem(MOTIVATION_QUOTES, todayKey)}</Text>
      </FitnessCard>

      {/* Session in progress */}
      {activeSession && activeDay ? (
        <FitnessCard variant="highlight">
          <Text style={styles.cardLabel}>Session in progress</Text>
          <Text style={styles.cardTitle}>{activeDay.title}</Text>
          <Text style={styles.caption}>
            {getSessionProgress(activeSession).completedSets} of {getSessionProgress(activeSession).totalSets} working sets completed
          </Text>
          <PrimaryButton
            title="Resume Session"
            icon="play"
            onPress={() => navigateSafely(navigation, ROUTES.WORKOUT_SESSION)}
          />
        </FitnessCard>
      ) : null}

      {/* 3 & 4. Today's workout + Start Workout */}
      <SectionHeading
        title="Today’s workout"
        subtitle={`Sample plan · ${plan.name} · ${weekdayName}`}
        actionLabel="Change plan"
        actionAccessibilityLabel="Change workout plan"
        onActionPress={() => navigateSafely(navigation, ROUTES.WORKOUT)}
      />
      {day ? (
        <FitnessCard>
          <Text style={styles.cardTitle}>{day.title}</Text>
          <Text style={styles.caption}>
            {day.focus} · {exercises.length} exercises · about {day.estimatedMinutes} min
          </Text>
          <View style={styles.exerciseList}>
            {exercises.slice(0, 4).map((exercise) => (
              <Text key={exercise.id} style={styles.exerciseItem}>
                •  {exercise.name} — {describeEntry(exercise)}
              </Text>
            ))}
            {exercises.length > 4 ? <Text style={styles.caption}>+ {exercises.length - 4} more</Text> : null}
          </View>
          {activeSession ? null : (
            <PrimaryButton
              title="Start Workout"
              icon="play"
              onPress={handleStartWorkout}
              accessibilityHint={`Starts the ${day.title} session`}
            />
          )}
          <SecondaryButton
            title="View workout details"
            onPress={() => navigateSafely(navigation, ROUTES.WORKOUT_DAY, { planId: plan.id, dayId: day.id })}
          />
        </FitnessCard>
      ) : (
        <FitnessCard>
          <Text style={styles.cardTitle}>Rest & recovery day</Text>
          <Text style={styles.body}>{getDailyItem(REST_DAY_TIPS, todayKey)}</Text>
          <SecondaryButton title="Browse this week’s plan" onPress={() => navigateSafely(navigation, ROUTES.WORKOUT)} />
        </FitnessCard>
      )}

      {/* 5 & 6. Water and workout completion — real data saved on this device */}
      <SectionHeading title="Today’s progress" subtitle="Saved on this device" />
      <StatRow>
        <StatCard
          label="Sessions today"
          value={String(todaysSessions.length)}
          caption={`${exercisesDoneToday} exercises completed`}
        />
        <StatCard label="This week" value={String(sessionsThisWeek)} unit="sessions" caption="Since Monday" />
      </StatRow>
      <WaterTracker />

      {/* 7. Quick access */}
      <SectionHeading title="Quick access" />
      <View style={styles.grid}>
        {QUICK_LINKS.map((link) => (
          <Pressable
            key={link.route}
            accessibilityRole="button"
            accessibilityLabel={`Open ${link.label}`}
            onPress={() => navigateSafely(navigation, link.route)}
            style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
          >
            <Ionicons name={link.icon} size={26} color={colors.primary} />
            <Text style={styles.tileLabel}>{link.label}</Text>
            <Text style={styles.caption}>{link.caption}</Text>
          </Pressable>
        ))}
      </View>

      {/* 8. Tips */}
      <SectionHeading title="Fitness tip" />
      <FitnessCard>
        <View style={styles.tipRow}>
          <Ionicons name="bulb-outline" size={22} color={colors.primary} />
          <Text style={[styles.body, styles.tipText]}>{getDailyItem(FITNESS_TIPS, todayKey, tipOffset)}</Text>
        </View>
        <SecondaryButton title="Next tip" onPress={() => setTipOffset((offset) => offset + 1)} />
      </FitnessCard>

      <Notice message="Workout and diet plans in FITME are general samples, not personalised or medical advice." />

      <AppFooter />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  logo: {
    ...typography.display,
    letterSpacing: 3,
  },
  logoAccent: {
    color: colors.primary,
  },
  greeting: {
    ...typography.heading,
  },
  date: {
    ...typography.caption,
  },
  heroLabel: {
    ...typography.label,
    color: colors.onPrimary,
  },
  heroQuote: {
    ...typography.heading,
    color: colors.onPrimary,
  },
  cardLabel: {
    ...typography.label,
    color: colors.primary,
  },
  cardTitle: {
    ...typography.subheading,
  },
  caption: {
    ...typography.caption,
  },
  body: {
    ...typography.body,
  },
  exerciseList: {
    gap: spacing.xs,
  },
  exerciseItem: {
    ...typography.body,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  tile: {
    flexGrow: 1,
    flexBasis: '45%',
    minHeight: 112,
    minWidth: 140,
    padding: spacing.lg,
    gap: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    justifyContent: 'center',
  },
  tilePressed: {
    backgroundColor: colors.cardPressed,
    borderColor: colors.primary,
  },
  tileLabel: {
    ...typography.subheading,
  },
  tipRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  tipText: {
    flex: 1,
  },
});
