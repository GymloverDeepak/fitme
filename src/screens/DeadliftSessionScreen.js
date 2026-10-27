import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import CheckRow from '../components/CheckRow';
import ChipGroup from '../components/ChipGroup';
import EmptyState from '../components/EmptyState';
import ExerciseDemo from '../components/ExerciseDemo';
import FitnessCard from '../components/FitnessCard';
import LoadInput from '../components/LoadInput';
import Notice from '../components/Notice';
import PrimaryButton from '../components/PrimaryButton';
import RestTimer from '../components/RestTimer';
import ScreenContainer, { STACK_EDGES } from '../components/ScreenContainer';
import SecondaryButton from '../components/SecondaryButton';
import SectionHeading from '../components/SectionHeading';
import SetTracker from '../components/SetTracker';
import Stepper from '../components/Stepper';
import { GENERAL_WARMUP, NO_MAX_NOTICE, PRE_LIFT_CHECKLIST, RPE_OPTIONS, STOP_REASONS, TECHNIQUE_OPTIONS } from '../data/deadlift';
import { getExerciseById } from '../data/workouts';
import { ROUTES, navigateSafely } from '../navigation/routes';
import { useAppState } from '../storage/AppStateContext';
import { DEADLIFT_LIMITS, getVariation, plateBreakdown } from '../storage/deadliftLogic';
import { colors, layout, radius, spacing, typography } from '../theme';

const RPE_CHIPS = RPE_OPTIONS.map((value) => ({ id: value, name: value }));

export default function DeadliftSessionScreen({ navigation }) {
  const {
    deadliftSession: session,
    deadliftPlan: plan,
    updateDeadliftSet,
    addDeadliftSet,
    removeDeadliftSet,
    updateDeadliftAccessory,
    setDeadliftSessionField,
    finishDeadliftSession,
    discardDeadliftSession,
  } = useAppState();

  if (!session) {
    return (
      <ScreenContainer edges={STACK_EDGES}>
        <EmptyState
          icon="barbell-outline"
          title="No deadlift session in progress"
          message="Start a session from the Deadlift Planner."
          actionLabel="Open Deadlift Planner"
          onAction={() => navigateSafely(navigation, ROUTES.DEADLIFT)}
        />
      </ScreenContainer>
    );
  }

  const unit = plan.displayUnit;
  const variation = getVariation(session.variation);
  const checked = PRE_LIFT_CHECKLIST.filter((item) => session.checklist[item.id]).length;
  const doneWorking = session.working.filter((set) => set.done).length;
  const plates = (kg) => plateBreakdown(kg, plan.barKg, plan.plates).perSide.join(' + ') || 'bar only';

  const finish = (stopReason = null) => {
    const record = finishDeadliftSession(stopReason);
    if (!record) return;
    if (stopReason === 'pain') {
      Alert.alert(
        'Session stopped',
        'Stopping was the right call. Do not continue heavy deadlifts while you have pain. If it persists or is severe, consult a qualified professional.',
      );
    }
    navigation.replace(ROUTES.DEADLIFT_SUMMARY, { recordId: record.id });
  };

  const handleFinish = () => {
    if (doneWorking === 0) {
      Alert.alert('No working sets completed', 'Save this session anyway?', [
        { text: 'Keep going', style: 'cancel' },
        { text: 'Save', onPress: () => finish() },
      ]);
      return;
    }
    finish();
  };

  const handleStop = () => {
    Alert.alert('Stop the session early?', 'Choose why you are stopping. Stopping early is always fine.', [
      ...STOP_REASONS.map((reason) => ({ text: reason.name, onPress: () => finish(reason.id) })),
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const handleDiscard = () => {
    Alert.alert('Discard session?', 'This session will not be saved.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Discard',
        style: 'destructive',
        onPress: () => {
          discardDeadliftSession();
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScreenContainer edges={STACK_EDGES} keyboardAware>
      <FitnessCard variant="highlight">
        <Text style={styles.label}>{session.type === 'light' ? 'Light / technique session' : 'Deadlift session'}</Text>
        <Text style={styles.title} accessibilityRole="header">
          {variation.name} deadlift
        </Text>
        <Text style={styles.caption}>
          Target RPE {session.targetRpe} · rest about {Math.round(session.restSeconds / 60)} min between working sets
        </Text>
        <Text style={styles.count} accessibilityLiveRegion="polite">
          {doneWorking} of {session.working.length} working sets done
        </Text>
      </FitnessCard>

      <Notice
        tone="danger"
        title="No failed reps, grinding or max attempts"
        message="If warm-ups feel unusually heavy, technique breaks down, fatigue is high or you feel pain, reduce the weight or stop the session."
      />

      <ExerciseDemo exerciseId={variation.exerciseId} name={`${variation.name} deadlift`} size={220} />

      <SectionHeading title="Pre-lift checklist" subtitle={`${checked} of ${PRE_LIFT_CHECKLIST.length} checked`} />
      <FitnessCard>
        {PRE_LIFT_CHECKLIST.map((item) => (
          <CheckRow
            key={item.id}
            label={item.text}
            checked={Boolean(session.checklist[item.id])}
            onToggle={() => setDeadliftSessionField('checklist', { [item.id]: !session.checklist[item.id] })}
          />
        ))}
      </FitnessCard>

      <SectionHeading title="Warm-up" subtitle="Not counted as working sets" />
      <FitnessCard>
        <Text style={styles.caption}>{GENERAL_WARMUP}</Text>
        {session.warmups.length === 0 ? <Text style={styles.caption}>No warm-up sets for this session.</Text> : null}
        {session.warmups.map((set, index) => (
          <View key={index} style={styles.setBlock}>
            <View style={styles.setRow}>
              <Text style={styles.setLabel}>W{index + 1}</Text>
              <LoadInput
                key={`w-${index}-${set.weightKg}-${unit}`}
                compact
                valueKg={set.weightKg}
                unit={unit}
                minKg={0}
                maxKg={DEADLIFT_LIMITS.weightKg.max}
                accessibilityLabel={`Warm-up ${index + 1} weight`}
                onCommit={(weightKg) => updateDeadliftSet('warmups', index, { weightKg })}
              />
              <Text style={styles.times}>× {set.reps}</Text>
              <DoneBox done={set.done} label={`Warm-up ${index + 1} done`} onToggle={() => updateDeadliftSet('warmups', index, { done: !set.done })} />
            </View>
            <Text style={styles.plates}>Plates per side: {plates(set.weightKg)}</Text>
          </View>
        ))}
      </FitnessCard>

      <SectionHeading title="Working sets" subtitle="Edit weight or reps if you need to — log RPE after each set" />
      <FitnessCard>
        {session.working.map((set, index) => (
          <View key={index} style={styles.setBlock}>
            <View style={styles.setRow}>
              <Text style={styles.setLabel}>S{index + 1}</Text>
              <LoadInput
                key={`s-${index}-${set.weightKg}-${unit}`}
                compact
                valueKg={set.weightKg}
                unit={unit}
                minKg={0}
                maxKg={DEADLIFT_LIMITS.weightKg.max}
                accessibilityLabel={`Working set ${index + 1} weight`}
                onCommit={(weightKg) => updateDeadliftSet('working', index, { weightKg })}
              />
              <Stepper label="Reps" value={set.reps} min={1} max={DEADLIFT_LIMITS.workingReps.max} onChange={(reps) => updateDeadliftSet('working', index, { reps })} />
              <DoneBox done={set.done} label={`Working set ${index + 1} done`} onToggle={() => updateDeadliftSet('working', index, { done: !set.done })} />
            </View>
            <Text style={styles.plates}>Plates per side: {plates(set.weightKg)}</Text>
            {set.done ? (
              <View style={styles.rpe}>
                <Text style={styles.label}>How hard was it? (RPE)</Text>
                <ChipGroup
                  options={RPE_CHIPS}
                  selectedId={set.rpe === null ? null : String(set.rpe)}
                  onSelect={(id) => updateDeadliftSet('working', index, { rpe: Number(id) })}
                  accessibilityLabel={`RPE for set ${index + 1}`}
                />
                {set.rpe >= 8 ? (
                  <Text style={styles.warn}>
                    That was harder than the RPE {session.targetRpe} target. Consider reducing the weight or stopping — do not grind reps.
                  </Text>
                ) : null}
              </View>
            ) : null}
          </View>
        ))}
        <View style={styles.row}>
          <SecondaryButton title="Add set" icon="add" onPress={addDeadliftSet} disabled={session.working.length >= DEADLIFT_LIMITS.workingSets.max} style={styles.flexButton} />
          <SecondaryButton title="Remove set" icon="remove" onPress={removeDeadliftSet} disabled={session.working.length <= 1} style={styles.flexButton} />
        </View>
      </FitnessCard>

      <RestTimer suggestedSeconds={session.restSeconds} suggestionLabel="Rest 3–5 minutes between working sets" />

      {session.accessories.length > 0 ? (
        <>
          <SectionHeading title="Optional accessories" subtitle="Moderate effort — skip any of them" />
          {session.accessories.map((item, index) => {
            const exercise = getExerciseById(item.exerciseId);
            return (
              <FitnessCard key={item.exerciseId}>
                <View style={styles.rowBetween}>
                  <View style={styles.flex}>
                    <Text style={[styles.body, item.skipped && styles.skipped]}>{exercise?.name}</Text>
                    <Text style={styles.caption}>
                      {item.sets} × {item.reps}
                      {item.skipped ? ' · skipped' : ''}
                    </Text>
                  </View>
                  <SecondaryButton
                    title={item.skipped ? 'Undo skip' : 'Skip'}
                    onPress={() => updateDeadliftAccessory(index, { skipped: !item.skipped })}
                    style={styles.skipButton}
                  />
                </View>
                {item.skipped ? null : (
                  <SetTracker
                    exerciseName={exercise?.name ?? 'Accessory'}
                    totalSets={item.sets}
                    doneCount={item.setsDone}
                    onChange={(setsDone) => updateDeadliftAccessory(index, { setsDone })}
                  />
                )}
              </FitnessCard>
            );
          })}
        </>
      ) : null}

      <SectionHeading title="How did it go?" />
      <FitnessCard>
        <Text style={styles.label}>Technique today</Text>
        <ChipGroup options={TECHNIQUE_OPTIONS} selectedId={session.technique} onSelect={(technique) => setDeadliftSessionField('technique', technique)} accessibilityLabel="Technique rating" />
        <Text style={styles.label}>Session notes</Text>
        <TextInput
          value={session.notes}
          onChangeText={(text) => setDeadliftSessionField('notes', text)}
          placeholder="Sleep, energy, how warm-ups felt, cues that helped…"
          placeholderTextColor={colors.textSecondary}
          multiline
          maxLength={DEADLIFT_LIMITS.notesLength}
          selectionColor={colors.accent}
          accessibilityLabel="Session notes"
          style={styles.textArea}
        />
      </FitnessCard>

      <Notice message={NO_MAX_NOTICE} />
      <PrimaryButton title="Finish & save session" icon="checkmark" onPress={handleFinish} />
      <SecondaryButton title="Stop session early" icon="hand-left-outline" tone="danger" onPress={handleStop} />
      <SecondaryButton title="Discard session" icon="trash-outline" tone="danger" onPress={handleDiscard} />
    </ScreenContainer>
  );
}

function DoneBox({ done, label, onToggle }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done }}
      accessibilityLabel={label}
      onPress={onToggle}
      style={[styles.doneBox, done && styles.doneBoxOn]}
    >
      <Text style={[styles.doneText, done && styles.doneTextOn]}>{done ? '✓' : ''}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
    ...typography.bodyStrong,
  },
  count: {
    ...typography.bodyStrong,
  },
  warn: {
    ...typography.caption,
    color: colors.warning,
  },
  setBlock: {
    gap: spacing.xs,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  setRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  setLabel: {
    ...typography.bodyStrong,
    width: 28,
    paddingBottom: spacing.md,
  },
  times: {
    ...typography.subheading,
    paddingBottom: spacing.md,
  },
  plates: {
    ...typography.caption,
    marginLeft: 36,
  },
  rpe: {
    gap: spacing.xs,
    marginLeft: 36,
  },
  doneBox: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  doneBoxOn: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  doneText: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  doneTextOn: {
    color: colors.onAccent,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  flex: {
    flex: 1,
    gap: 2,
  },
  flexButton: {
    flex: 1,
    minWidth: 140,
  },
  skipButton: {
    minHeight: layout.minTouchTarget,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  skipped: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  textArea: {
    minHeight: 88,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    textAlignVertical: 'top',
    ...typography.body,
  },
});
