import { StyleSheet, Text, View } from 'react-native';

import EmptyState from '../components/EmptyState';
import ExerciseRow from '../components/ExerciseRow';
import FitnessCard from '../components/FitnessCard';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer, { STACK_EDGES } from '../components/ScreenContainer';
import SecondaryButton from '../components/SecondaryButton';
import SectionHeading from '../components/SectionHeading';
import StatCard from '../components/StatCard';
import StatRow from '../components/StatRow';
import { RECOVERY_GUIDANCE, getDayExercises, getExerciseById, getPlanDay } from '../data/workouts';
import { ROUTES, navigateSafely } from '../navigation/routes';
import { useAppState } from '../storage/AppStateContext';
import { colors, spacing, typography } from '../theme';
import { formatDateKey, formatDuration } from '../utils/date';

export default function SessionSummaryScreen({ navigation, route }) {
  const { sessions } = useAppState();
  const session = sessions.find((item) => item.id === route.params?.sessionId);

  if (!session) {
    return (
      <ScreenContainer edges={STACK_EDGES}>
        <EmptyState
          icon="alert-circle-outline"
          title="Session not found"
          message="This session summary is not available. It may have been cleared from this device."
          actionLabel="Back to Home"
          onAction={() => navigateSafely(navigation, ROUTES.HOME)}
        />
      </ScreenContainer>
    );
  }

  // Newer records store exactly which exercises the session had; older ones fall back to the plan day.
  const exercises = Array.isArray(session.exerciseIds)
    ? session.exerciseIds.map(getExerciseById).filter(Boolean)
    : getDayExercises(getPlanDay(session.planId, session.dayId).day);
  const completed = exercises.filter((exercise) => session.completedExerciseIds.includes(exercise.id));
  const skipped = exercises.filter((exercise) => !session.completedExerciseIds.includes(exercise.id));
  const allDone = session.totalExercises > 0 && completed.length === session.totalExercises;

  return (
    <ScreenContainer edges={STACK_EDGES}>
      <FitnessCard variant="accent">
        <Text style={styles.heroLabel}>{allDone ? 'Workout complete' : 'Session saved'}</Text>
        <Text style={styles.heroTitle} accessibilityRole="header">
          {session.dayTitle}
        </Text>
        <Text style={styles.heroCaption}>{formatDateKey(session.dateKey)}</Text>
      </FitnessCard>

      <StatRow>
        <StatCard
          label="Completed"
          value={`${session.completedExerciseIds.length}/${session.totalExercises}`}
          unit="exercises"
        />
        {typeof session.totalSets === 'number' ? (
          <StatCard label="Working sets" value={`${session.completedSets}/${session.totalSets}`} />
        ) : null}
        <StatCard label="Duration" value={formatDuration((session.finishedAt - session.startedAt) / 1000)} />
      </StatRow>

      {completed.length > 0 ? (
        <>
          <SectionHeading title="Completed" />
          <View style={styles.list}>
            {completed.map((exercise) => (
              <ExerciseRow key={exercise.id} name={exercise.name} detail={`${exercise.sets} × ${exercise.reps}`} completed />
            ))}
          </View>
        </>
      ) : null}

      {skipped.length > 0 ? (
        <>
          <SectionHeading title="Not completed" subtitle="No problem — consistency over perfection." />
          <View style={styles.list}>
            {skipped.map((exercise) => (
              <ExerciseRow key={exercise.id} name={exercise.name} detail={`${exercise.sets} × ${exercise.reps}`} completed={false} />
            ))}
          </View>
        </>
      ) : null}

      <FitnessCard>
        <Text style={styles.label}>Recover well</Text>
        {RECOVERY_GUIDANCE.slice(2, 5).map((tip) => (
          <Text key={tip} style={styles.body}>
            •  {tip}
          </Text>
        ))}
      </FitnessCard>

      <PrimaryButton title="Back to Home" icon="home-outline" onPress={() => navigateSafely(navigation, ROUTES.HOME)} />
      <SecondaryButton
        title="View Progress"
        icon="stats-chart-outline"
        onPress={() => navigateSafely(navigation, ROUTES.PROGRESS)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroLabel: {
    ...typography.label,
    color: colors.onAccent,
  },
  heroTitle: {
    ...typography.title,
    color: colors.onAccent,
  },
  heroCaption: {
    ...typography.caption,
    color: colors.onAccent,
  },
  label: {
    ...typography.label,
    color: colors.accent,
  },
  body: {
    ...typography.body,
  },
  list: {
    gap: spacing.sm,
  },
});
