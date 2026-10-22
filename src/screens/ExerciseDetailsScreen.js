import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import EmptyState from '../components/EmptyState';
import ExerciseDemo from '../components/ExerciseDemo';
import FitnessCard from '../components/FitnessCard';
import Notice from '../components/Notice';
import ScreenContainer, { STACK_EDGES } from '../components/ScreenContainer';
import SectionHeading from '../components/SectionHeading';
import StatCard from '../components/StatCard';
import StatRow from '../components/StatRow';
import {
  ADVANCED_NOTICE,
  WARMUP_GUIDANCE,
  WORKOUT_DISCLAIMER,
  getExerciseById,
  getLevelNames,
  getMuscleGroupById,
} from '../data/workouts';
import { colors, radius, spacing, typography } from '../theme';

export default function ExerciseDetailsScreen({ navigation, route }) {
  const params = route.params ?? {};
  const exercise = getExerciseById(params.exerciseId);
  const { width } = useWindowDimensions();
  const demoSize = Math.min(320, Math.round(width - 2 * spacing.xl));

  if (!exercise) {
    return (
      <ScreenContainer edges={STACK_EDGES}>
        <EmptyState
          icon="alert-circle-outline"
          title="Exercise not found"
          message="This exercise is not in the FITME library."
          actionLabel="Go back"
          onAction={() => navigation.goBack()}
        />
      </ScreenContainer>
    );
  }

  // Values from a plan day override the library defaults.
  const sets = params.sets ?? exercise.sets;
  const reps = params.reps ?? exercise.reps;
  const restSeconds = params.restSeconds ?? exercise.restSeconds;
  const warmupSets = params.warmupSets ?? 0;
  const groupName = getMuscleGroupById(exercise.muscle)?.name ?? 'Exercise';
  const levels = getLevelNames(exercise);
  const advancedOnly = exercise.levels.length === 1 && exercise.levels[0] === 'advanced';

  return (
    <ScreenContainer edges={STACK_EDGES}>
      <View style={styles.header}>
        <Text style={styles.label}>
          {groupName} · {exercise.type === 'compound' ? 'Compound' : 'Isolation'}
        </Text>
        <Text style={styles.title} accessibilityRole="header">
          {exercise.name}
        </Text>
        <View style={styles.badges}>
          {levels.map((level) => (
            <View key={level} style={styles.badge}>
              <Text style={styles.badgeText}>{level}</Text>
            </View>
          ))}
        </View>
      </View>

      <ExerciseDemo exerciseId={exercise.id} name={exercise.name} size={demoSize} />

      <FitnessCard>
        <InfoRow label="Primary" value={exercise.primaryFocus ?? groupName} />
        {exercise.secondaryMuscles.length > 0 ? (
          <InfoRow label="Also works" value={exercise.secondaryMuscles.join(', ')} />
        ) : null}
        <InfoRow label="Equipment" value={exercise.equipment} />
      </FitnessCard>

      <StatRow>
        <StatCard label="Working sets" value={String(sets)} style={styles.stat} />
        <StatCard label="Reps" value={String(reps)} style={styles.stat} />
        <StatCard label="Rest" value={String(restSeconds)} unit="sec" style={styles.stat} />
      </StatRow>
      {warmupSets > 0 || exercise.type === 'compound' ? (
        <Notice
          title={warmupSets > 0 ? `${warmupSets} warm-up set${warmupSets > 1 ? 's' : ''} first` : 'Warm-up sets'}
          message={WARMUP_GUIDANCE}
        />
      ) : null}

      <SectionHeading title="How to do it" />
      <FitnessCard>
        {exercise.instructions.map((step, index) => (
          <View key={step} style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </FitnessCard>

      <Notice tone="warning" title="Safety" message={exercise.safety} />
      {exercise.needsSpotter ? (
        <Notice
          tone="warning"
          title="Spotter or safety bars recommended"
          message="For heavy sets, use a spotter, the rack's safety bars/arms, or train under suitable supervision."
        />
      ) : null}
      {advancedOnly ? <Notice tone="warning" title="Advanced exercise" message={ADVANCED_NOTICE} /> : null}
      <Notice message={WORKOUT_DISCLAIMER} />
    </ScreenContainer>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.primary,
  },
  title: {
    ...typography.title,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  badgeText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  infoLabel: {
    ...typography.label,
    width: 92,
    paddingTop: 2,
  },
  infoValue: {
    ...typography.body,
    flex: 1,
  },
  stat: {
    minWidth: 96,
  },
  step: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    ...typography.caption,
    fontWeight: '800',
    color: colors.onPrimary,
  },
  stepText: {
    ...typography.body,
    flex: 1,
  },
});
