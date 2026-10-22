import { Alert, StyleSheet, Text, View } from 'react-native';

import EmptyState from '../components/EmptyState';
import { ExerciseThumbnail } from '../components/ExerciseDemo';
import ExerciseRow from '../components/ExerciseRow';
import FitnessCard from '../components/FitnessCard';
import PrimaryButton from '../components/PrimaryButton';
import ProgressBar from '../components/ProgressBar';
import RestTimer from '../components/RestTimer';
import ScreenContainer, { STACK_EDGES } from '../components/ScreenContainer';
import SecondaryButton from '../components/SecondaryButton';
import SectionHeading from '../components/SectionHeading';
import SetTracker from '../components/SetTracker';
import { describeEntry, getPlanDay, resolveEntries } from '../data/workouts';
import { ROUTES, navigateSafely } from '../navigation/routes';
import { useAppState } from '../storage/AppStateContext';
import { getSessionProgress } from '../storage/workoutLogic';
import { colors, spacing, typography } from '../theme';
import { formatTime } from '../utils/date';

// The active session is kept in app state (and saved), so leaving this screen never loses progress.
// It uses its own copy of the day's exercises, so editing the plan mid-workout does not change it.
// The rest timer lives only on this screen and stops when you leave it.
export default function WorkoutSessionScreen({ navigation }) {
  const { activeSession, toggleSessionExercise, setSessionSetsDone, finishSession, discardSession } = useAppState();
  const { plan, day } = activeSession ? getPlanDay(activeSession.planId, activeSession.dayId) : {};

  if (!activeSession) {
    return (
      <ScreenContainer edges={STACK_EDGES}>
        <EmptyState
          icon="barbell-outline"
          title="No session in progress"
          message="Pick a workout day and tap Start Session to begin."
          actionLabel="Go to Workout"
          onAction={() => navigateSafely(navigation, ROUTES.WORKOUT)}
        />
      </ScreenContainer>
    );
  }

  if (!plan || !day) {
    return (
      <ScreenContainer edges={STACK_EDGES}>
        <EmptyState
          icon="alert-circle-outline"
          title="Workout no longer available"
          message="The workout for this session could not be found. Discard it to start a new one."
          actionLabel="Discard session"
          onAction={discardSession}
        />
      </ScreenContainer>
    );
  }

  const exercises = resolveEntries(activeSession.entries);
  const completedIds = activeSession.completedExerciseIds;
  const progress = getSessionProgress(activeSession);
  const completedCount = progress.completedExercises;
  const nextExercise = exercises.find((exercise) => !completedIds.includes(exercise.id));

  const finish = () => {
    const record = finishSession();
    if (record) navigation.replace(ROUTES.SESSION_SUMMARY, { sessionId: record.id });
  };

  const handleFinish = () => {
    if (completedCount === 0) {
      Alert.alert('Finish without exercises?', 'No exercises are marked as completed. Save this session anyway?', [
        { text: 'Keep training', style: 'cancel' },
        { text: 'Finish', onPress: finish },
      ]);
      return;
    }
    finish();
  };

  const handleDiscard = () => {
    Alert.alert('Discard session?', 'This session will not be saved to your history.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          discardSession();
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScreenContainer edges={STACK_EDGES}>
      <FitnessCard variant="highlight">
        <Text style={styles.label}>{plan.name}</Text>
        <Text style={styles.title} accessibilityRole="header">
          {day.title}
        </Text>
        <Text style={styles.caption}>Started at {formatTime(activeSession.startedAt)}</Text>
        <Text style={styles.count} accessibilityLiveRegion="polite">
          {completedCount} of {exercises.length} exercises · {progress.completedSets} of {progress.totalSets} working sets
        </Text>
        <ProgressBar
          progress={progress.totalSets ? progress.completedSets / progress.totalSets : 0}
          accessibilityLabel="Working sets completed"
        />
      </FitnessCard>

      <RestTimer
        suggestedSeconds={nextExercise?.restSeconds ?? 90}
        suggestionLabel={nextExercise ? `Suggested rest for ${nextExercise.name}` : 'All exercises done'}
      />

      <SectionHeading title="Exercises" subtitle="Tap set numbers as you finish them · tick = all sets · ⓘ form tips" />
      <View style={styles.list}>
        {exercises.map((exercise, index) => (
          <ExerciseRow
            key={exercise.id}
            index={index}
            thumbnail={<ExerciseThumbnail exerciseId={exercise.id} name={exercise.name} size={48} />}
            name={exercise.name}
            detail={describeEntry(exercise)}
            completed={completedIds.includes(exercise.id)}
            onToggle={() => toggleSessionExercise(exercise.id)}
            onInfoPress={() =>
              navigateSafely(navigation, ROUTES.EXERCISE_DETAILS, {
                exerciseId: exercise.id,
                sets: exercise.sets,
                reps: exercise.reps,
                restSeconds: exercise.restSeconds,
                warmupSets: exercise.warmupSets,
              })
            }
          >
            <SetTracker
              exerciseName={exercise.name}
              totalSets={exercise.sets}
              warmupSets={exercise.warmupSets}
              doneCount={activeSession.setsDone?.[exercise.id] ?? 0}
              onChange={(count) => setSessionSetsDone(exercise.id, count)}
            />
          </ExerciseRow>
        ))}
      </View>

      <PrimaryButton title="Finish Session" icon="checkmark" onPress={handleFinish} />
      <SecondaryButton title="Discard Session" icon="trash-outline" tone="danger" onPress={handleDiscard} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  label: {
    ...typography.label,
    color: colors.primary,
  },
  title: {
    ...typography.title,
  },
  caption: {
    ...typography.caption,
  },
  count: {
    ...typography.bodyStrong,
  },
  list: {
    gap: spacing.sm,
  },
});
