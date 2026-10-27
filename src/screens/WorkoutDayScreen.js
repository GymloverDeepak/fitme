import { Alert, StyleSheet, Text, View } from 'react-native';

import EmptyState from '../components/EmptyState';
import { ExerciseThumbnail } from '../components/ExerciseDemo';
import ExerciseRow from '../components/ExerciseRow';
import FitnessCard from '../components/FitnessCard';
import Notice from '../components/Notice';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer, { STACK_EDGES } from '../components/ScreenContainer';
import SecondaryButton from '../components/SecondaryButton';
import SectionHeading from '../components/SectionHeading';
import StatCard from '../components/StatCard';
import StatRow from '../components/StatRow';
import { ADVANCED_NOTICE, WARMUP_GUIDANCE, WORKOUT_DISCLAIMER, describeEntry, getPlanDay } from '../data/workouts';
import { ROUTES, navigateSafely } from '../navigation/routes';
import { useAppState } from '../storage/AppStateContext';
import { colors, spacing, typography } from '../theme';

export default function WorkoutDayScreen({ navigation, route }) {
  const { planId, dayId } = route.params ?? {};
  const { plan, day } = getPlanDay(planId, dayId);
  const { activeSession, startSession, getDayExercisesFor, isDayCustom, resetDayToDefault } = useAppState();

  if (!plan || !day) {
    return (
      <ScreenContainer edges={STACK_EDGES}>
        <EmptyState
          icon="alert-circle-outline"
          title="Workout not found"
          message="This workout day is not available. It may belong to a plan that no longer exists."
          actionLabel="Back to Workout"
          onAction={() => navigateSafely(navigation, ROUTES.WORKOUT)}
        />
      </ScreenContainer>
    );
  }

  const exercises = getDayExercisesFor(plan.id, day.id);
  const customised = isDayCustom(plan.id, day.id);
  const isThisSessionActive = activeSession?.planId === plan.id && activeSession?.dayId === day.id;
  const workingSets = exercises.reduce((sum, exercise) => sum + exercise.sets, 0);
  const warmupSets = exercises.reduce((sum, exercise) => sum + exercise.warmupSets, 0);

  const begin = () => {
    if (startSession(plan.id, day.id)) navigateSafely(navigation, ROUTES.WORKOUT_SESSION);
  };

  const handleStart = () => {
    if (isThisSessionActive) {
      navigateSafely(navigation, ROUTES.WORKOUT_SESSION);
      return;
    }
    if (activeSession) {
      Alert.alert(
        'Replace current session?',
        'You already have a session in progress. Starting this workout will discard it without saving.',
        [
          { text: 'Keep current', style: 'cancel' },
          { text: 'Discard and start', style: 'destructive', onPress: begin },
        ],
      );
      return;
    }
    begin();
  };

  const handleReset = () => {
    Alert.alert('Reset to default?', `Undo all your changes to ${day.title} and restore the built-in exercises?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => resetDayToDefault(plan.id, day.id) },
    ]);
  };

  return (
    <ScreenContainer edges={STACK_EDGES}>
      <View style={styles.header}>
        <Text style={styles.label}>
          {plan.name}
          {customised ? ' · Customised' : ''}
        </Text>
        <Text style={styles.title} accessibilityRole="header">
          {day.title}
        </Text>
        <Text style={styles.caption}>{day.focus}</Text>
      </View>

      <StatRow>
        <StatCard label="Exercises" value={String(exercises.length)} />
        <StatCard label="Working sets" value={String(workingSets)} caption={warmupSets ? `+ ${warmupSets} warm-up` : undefined} />
        <StatCard label="Duration" value={`~${day.estimatedMinutes}`} unit="min" />
      </StatRow>

      {plan.level === 'Advanced' && plan.category === 'strength' ? (
        <Notice tone="warning" title="Advanced" message={ADVANCED_NOTICE} />
      ) : null}
      {plan.clearanceNotice ? <Notice {...plan.clearanceNotice} /> : null}
      {plan.safetyNotice ? <Notice {...plan.safetyNotice} /> : null}

      <PrimaryButton
        title={isThisSessionActive ? 'Resume Session' : 'Start Session'}
        icon="play"
        onPress={handleStart}
        disabled={exercises.length === 0}
      />
      <SecondaryButton
        title="Edit workout"
        icon="create-outline"
        onPress={() => navigateSafely(navigation, ROUTES.EDIT_WORKOUT_DAY, { planId: plan.id, dayId: day.id })}
        accessibilityHint="Add or remove exercises and change sets, reps and rest"
      />

      {day.format || day.warmup || day.cooldown || day.scaling ? (
        <>
          <SectionHeading title="Session guide" />
          <FitnessCard>
            <GuideItem label="How to do it" text={day.format} />
            <GuideItem label="Warm-up" text={day.warmup} />
            <GuideItem label="Cool-down" text={day.cooldown} />
            {day.scaling?.length ? (
              <View style={styles.guideItem}>
                <Text style={styles.label}>Easier options</Text>
                {day.scaling.map((tip) => (
                  <Text key={tip} style={styles.body}>
                    •  {tip}
                  </Text>
                ))}
              </View>
            ) : null}
          </FitnessCard>
        </>
      ) : null}

      <SectionHeading title="Exercises" subtitle="Tap an exercise for form and safety tips" />
      {exercises.length === 0 ? (
        <EmptyState
          title="No exercises"
          message="This workout day has no exercises. Add some to start a session."
          actionLabel="Add exercises"
          onAction={() => navigateSafely(navigation, ROUTES.EDIT_WORKOUT_DAY, { planId: plan.id, dayId: day.id })}
        />
      ) : (
        <View style={styles.list}>
          {exercises.map((exercise, index) => (
            <ExerciseRow
              key={exercise.id}
              thumbnail={<ExerciseThumbnail exerciseId={exercise.id} name={exercise.name} size={52} />}
              name={`${index + 1}. ${exercise.name}`}
              detail={describeEntry(exercise)}
              onPress={() =>
                navigateSafely(navigation, ROUTES.EXERCISE_DETAILS, {
                  exerciseId: exercise.id,
                  sets: exercise.sets,
                  reps: exercise.reps,
                  restSeconds: exercise.restSeconds,
                  warmupSets: exercise.warmupSets,
                })
              }
            />
          ))}
        </View>
      )}
      {warmupSets > 0 ? <Notice title="Warm-up vs working sets" message={WARMUP_GUIDANCE} /> : null}

      <FitnessCard>
        <Text style={styles.label}>Recovery</Text>
        <Text style={styles.body}>{plan.recoveryNote}</Text>
      </FitnessCard>

      {customised ? (
        <SecondaryButton title="Reset to default" icon="refresh" tone="danger" onPress={handleReset} />
      ) : null}
      <Notice tone="warning" message={WORKOUT_DISCLAIMER} />
    </ScreenContainer>
  );
}

function GuideItem({ label, text }) {
  if (!text) return null;
  return (
    <View style={styles.guideItem}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.body}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.accent,
  },
  title: {
    ...typography.title,
  },
  caption: {
    ...typography.caption,
  },
  body: {
    ...typography.body,
  },
  list: {
    gap: spacing.sm,
  },
  guideItem: {
    gap: 2,
  },
});
