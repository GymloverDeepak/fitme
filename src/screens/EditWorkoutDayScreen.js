import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import EmptyState from '../components/EmptyState';
import FitnessCard from '../components/FitnessCard';
import Notice from '../components/Notice';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer, { STACK_EDGES } from '../components/ScreenContainer';
import SecondaryButton from '../components/SecondaryButton';
import Stepper from '../components/Stepper';
import { getPlanDay } from '../data/workouts';
import { ROUTES, navigateSafely } from '../navigation/routes';
import { useAppState } from '../storage/AppStateContext';
import { ENTRY_LIMITS, isValidReps } from '../storage/workoutLogic';
import { colors, layout, radius, spacing, typography } from '../theme';

// Edits a custom copy of a plan day. Changes save immediately; the built-in plan is never changed.
export default function EditWorkoutDayScreen({ navigation, route }) {
  const { planId, dayId } = route.params ?? {};
  const { plan, day } = getPlanDay(planId, dayId);
  const { getDayExercisesFor, updateDayEntry, removeExerciseFromDay, moveExerciseInDay, resetDayToDefault, isDayCustom, activeSession } =
    useAppState();

  if (!plan || !day) {
    return (
      <ScreenContainer edges={STACK_EDGES}>
        <EmptyState icon="alert-circle-outline" title="Workout not found" actionLabel="Go back" onAction={() => navigation.goBack()} />
      </ScreenContainer>
    );
  }

  const exercises = getDayExercisesFor(plan.id, day.id);
  const full = exercises.length >= ENTRY_LIMITS.entriesPerDay;
  const sessionUsesThisDay = activeSession?.planId === plan.id && activeSession?.dayId === day.id;

  const handleRemove = (exercise) => {
    Alert.alert('Remove exercise?', `Remove ${exercise.name} from ${day.title}? You can add it again later.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeExerciseFromDay(plan.id, day.id, exercise.id) },
    ]);
  };

  const handleReset = () => {
    Alert.alert('Reset to default?', `Restore the built-in exercises for ${day.title}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => resetDayToDefault(plan.id, day.id) },
    ]);
  };

  return (
    <ScreenContainer edges={STACK_EDGES} keyboardAware>
      <View style={styles.header}>
        <Text style={styles.label}>{plan.name}</Text>
        <Text style={styles.title} accessibilityRole="header">
          Edit {day.title}
        </Text>
        <Text style={styles.caption}>Changes are saved automatically on this phone.</Text>
      </View>

      {sessionUsesThisDay ? (
        <Notice message="Your session in progress keeps the exercises it started with. Changes apply to your next session." />
      ) : null}

      {exercises.length === 0 ? (
        <EmptyState title="No exercises yet" message="Add exercises from the library to build this workout." />
      ) : (
        exercises.map((exercise, index) => (
          <EntryEditor
            // Including reps re-creates the editor (and its text box) when reps change elsewhere, e.g. on reset.
            key={`${exercise.id}:${exercise.reps}`}
            exercise={exercise}
            isFirst={index === 0}
            isLast={index === exercises.length - 1}
            onChange={(changes) => updateDayEntry(plan.id, day.id, exercise.id, changes)}
            onMove={(direction) => moveExerciseInDay(plan.id, day.id, exercise.id, direction)}
            onRemove={() => handleRemove(exercise)}
          />
        ))
      )}

      <PrimaryButton
        title={full ? `Maximum ${ENTRY_LIMITS.entriesPerDay} exercises` : 'Add exercise'}
        icon="add"
        disabled={full}
        onPress={() => navigateSafely(navigation, ROUTES.EXERCISE_LIBRARY, { pickFor: { planId: plan.id, dayId: day.id } })}
      />
      {isDayCustom(plan.id, day.id) ? (
        <SecondaryButton title="Reset to default" icon="refresh" tone="danger" onPress={handleReset} />
      ) : null}
      <Notice message="Warm-up sets are lighter preparation sets and are not counted. Working sets should finish with 1–3 reps in reserve." />
    </ScreenContainer>
  );
}

function EntryEditor({ exercise, isFirst, isLast, onChange, onMove, onRemove }) {
  const [repsText, setRepsText] = useState(exercise.reps);
  const [repsError, setRepsError] = useState(null);

  const commitReps = () => {
    if (repsText.trim() === exercise.reps) return;
    if (!isValidReps(repsText)) {
      setRepsError('Use e.g. 8-12, 10 per leg or 30 sec (max 20 characters).');
      return;
    }
    setRepsError(null);
    onChange({ reps: repsText });
  };

  return (
    <FitnessCard>
      <View style={styles.entryHeader}>
        <Text style={styles.entryName}>{exercise.name}</Text>
        <IconButton icon="arrow-up" label={`Move ${exercise.name} up`} disabled={isFirst} onPress={() => onMove(-1)} />
        <IconButton icon="arrow-down" label={`Move ${exercise.name} down`} disabled={isLast} onPress={() => onMove(1)} />
        <IconButton icon="trash-outline" label={`Remove ${exercise.name}`} danger onPress={onRemove} />
      </View>

      <View style={styles.controls}>
        <Stepper
          label="Working sets"
          value={exercise.sets}
          min={ENTRY_LIMITS.sets.min}
          max={ENTRY_LIMITS.sets.max}
          onChange={(sets) => onChange({ sets })}
        />
        <Stepper
          label="Warm-up sets"
          value={exercise.warmupSets}
          min={ENTRY_LIMITS.warmupSets.min}
          max={ENTRY_LIMITS.warmupSets.max}
          onChange={(warmupSets) => onChange({ warmupSets })}
        />
        <Stepper
          label="Rest"
          value={exercise.restSeconds}
          min={ENTRY_LIMITS.restSeconds.min}
          max={ENTRY_LIMITS.restSeconds.max}
          step={ENTRY_LIMITS.restSeconds.step}
          format={(seconds) => `${seconds}s`}
          unitLabel="seconds"
          onChange={(restSeconds) => onChange({ restSeconds })}
        />
      </View>

      <View style={styles.repsField}>
        <Text style={styles.fieldLabel}>Reps</Text>
        <TextInput
          value={repsText}
          onChangeText={(text) => {
            setRepsText(text);
            if (repsError) setRepsError(null);
          }}
          onEndEditing={commitReps}
          onSubmitEditing={commitReps}
          returnKeyType="done"
          maxLength={ENTRY_LIMITS.repsMaxLength}
          placeholder="e.g. 8-12"
          placeholderTextColor={colors.textSecondary}
          selectionColor={colors.primary}
          cursorColor={colors.primary}
          accessibilityLabel={`Reps for ${exercise.name}`}
          style={[styles.repsInput, repsError && styles.repsInputError]}
        />
        {repsError ? (
          <Text style={styles.error} accessibilityLiveRegion="polite">
            {repsError}
          </Text>
        ) : null}
      </View>
    </FitnessCard>
  );
}

function IconButton({ icon, label, onPress, disabled = false, danger = false }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, pressed && styles.iconPressed, disabled && styles.iconDisabled]}
    >
      <Ionicons name={icon} size={20} color={danger ? colors.danger : colors.primary} />
    </Pressable>
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
  caption: {
    ...typography.caption,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  entryName: {
    ...typography.subheading,
    flex: 1,
  },
  controls: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  repsField: {
    gap: spacing.xs,
  },
  fieldLabel: {
    ...typography.label,
  },
  repsInput: {
    minHeight: layout.minTouchTarget,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    ...typography.subheading,
  },
  repsInputError: {
    borderColor: colors.danger,
  },
  error: {
    ...typography.caption,
    color: colors.danger,
  },
  iconButton: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  iconPressed: {
    backgroundColor: colors.primarySoft,
  },
  iconDisabled: {
    opacity: 0.35,
  },
});
