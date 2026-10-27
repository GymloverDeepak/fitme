import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import ChipGroup from '../components/ChipGroup';
import FitnessCard from '../components/FitnessCard';
import LoadInput from '../components/LoadInput';
import Notice from '../components/Notice';
import PrimaryButton from '../components/PrimaryButton';
import ScreenContainer, { STACK_EDGES } from '../components/ScreenContainer';
import SecondaryButton from '../components/SecondaryButton';
import SectionHeading from '../components/SectionHeading';
import Stepper from '../components/Stepper';
import {
  BAR_OPTIONS,
  COACH_NOTICE,
  DEADLIFT_VARIATIONS,
  EXPERIENCE_LEVELS,
  FREQUENCIES,
  PLATE_SIZES_KG,
  RIR_OPTIONS,
  SPLITS,
  WEEKDAYS_SHORT,
} from '../data/deadlift';
import { getExerciseById } from '../data/workouts';
import { useAppState } from '../storage/AppStateContext';
import { DEADLIFT_LIMITS, generateWarmups, scheduleWarnings, suggestPlan } from '../storage/deadliftLogic';
import { colors, layout, radius, spacing, typography } from '../theme';
import { formatLoad } from '../utils/units';

const YES_NO = [
  { id: 'no', name: 'No' },
  { id: 'yes', name: 'Yes' },
];
const UNITS = [
  { id: 'kg', name: 'kg' },
  { id: 'lb', name: 'lb' },
];
const TARGET_RPES = [
  { id: '4-5', name: 'RPE 4–5' },
  { id: '5-6', name: 'RPE 5–6' },
  { id: '6-7', name: 'RPE 6–7' },
];

export default function DeadliftSetupScreen() {
  const { deadliftPlan: plan, updateDeadliftPlan, settings } = useAppState();
  const unit = plan.displayUnit;
  const suggestion = suggestPlan(plan);
  const warnings = scheduleWarnings(plan, settings.planId);
  const split = SPLITS.find((item) => item.id === plan.split);
  const variations = DEADLIFT_VARIATIONS.filter((variation) => !variation.needsTrapBar || plan.trapBarAvailable);
  const setWorking = (changes) => updateDeadliftPlan({ working: { ...plan.working, ...changes } });
  const setWarmup = (index, changes) =>
    updateDeadliftPlan({ warmups: plan.warmups.map((warmup, i) => (i === index ? { ...warmup, ...changes } : warmup)) });

  const applySuggestion = () => {
    Alert.alert(
      'Use calculator suggestions?',
      `Replace your working sets with ${formatLoad(suggestion.working.weightKg, unit)} × ${suggestion.working.reps} × ${suggestion.working.sets} and regenerate warm-ups? You can still edit everything afterwards.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Use suggestions', onPress: () => updateDeadliftPlan({ working: suggestion.working, warmups: suggestion.warmups }) },
      ],
    );
  };

  const togglePlate = (plate) => {
    const has = plan.plates.includes(plate);
    if (has && plan.plates.length === 1) return; // keep at least one plate size
    updateDeadliftPlan({ plates: has ? plan.plates.filter((item) => item !== plate) : [...plan.plates, plate] });
  };

  return (
    <ScreenContainer edges={STACK_EDGES} keyboardAware>
      <Text style={styles.caption}>Everything here is saved automatically on this phone. All values are editable.</Text>

      {/* ---------- Profile ---------- */}
      <SectionHeading title="Your deadlift profile" />
      <FitnessCard>
        <Text style={styles.label}>Experience</Text>
        <ChipGroup options={EXPERIENCE_LEVELS} selectedId={plan.experience} onSelect={(experience) => updateDeadliftPlan({ experience })} accessibilityLabel="Experience level" />
        <Text style={styles.label}>Variation</Text>
        <ChipGroup options={variations} selectedId={plan.variation} onSelect={(variation) => updateDeadliftPlan({ variation })} accessibilityLabel="Deadlift variation" />
        <Text style={styles.caption}>Enter strength numbers for the variation you will train.</Text>
        <Text style={styles.label}>Display unit</Text>
        <ChipGroup options={UNITS} selectedId={unit} onSelect={(displayUnit) => updateDeadliftPlan({ displayUnit })} accessibilityLabel="Weight unit" />
      </FitnessCard>

      <SectionHeading title="Recent comfortable working set" subtitle="No max test needed" />
      <FitnessCard>
        <View style={styles.row}>
          <LoadInput
            key={`recent-${unit}-${plan.recentWeightKg}`}
            label="Weight"
            valueKg={plan.recentWeightKg}
            unit={unit}
            minKg={DEADLIFT_LIMITS.weightKg.min}
            maxKg={DEADLIFT_LIMITS.weightKg.max}
            allowEmpty
            placeholder="e.g. 100"
            onCommit={(recentWeightKg) => updateDeadliftPlan({ recentWeightKg })}
          />
          <Stepper
            label="Reps completed"
            value={plan.recentReps ?? 5}
            min={DEADLIFT_LIMITS.recentReps.min}
            max={DEADLIFT_LIMITS.recentReps.max}
            onChange={(recentReps) => updateDeadliftPlan({ recentReps })}
          />
        </View>
        <Text style={styles.label}>Reps you had left (reps in reserve)</Text>
        <ChipGroup options={RIR_OPTIONS} selectedId={plan.recentRir} onSelect={(recentRir) => updateDeadliftPlan({ recentRir })} accessibilityLabel="Reps in reserve" />
        <LoadInput
          key={`known-${unit}-${plan.knownOneRmKg}`}
          label="Known 1-rep max (optional — leave empty if unknown)"
          valueKg={plan.knownOneRmKg}
          unit={unit}
          minKg={DEADLIFT_LIMITS.weightKg.min}
          maxKg={DEADLIFT_LIMITS.weightKg.max}
          allowEmpty
          placeholder="Optional"
          onCommit={(knownOneRmKg) => updateDeadliftPlan({ knownOneRmKg })}
        />
        {plan.knownOneRmKg && plan.recentWeightKg && plan.knownOneRmKg < plan.recentWeightKg ? (
          <Text style={styles.error}>Your 1-rep max is lower than your recent working weight, so it is ignored.</Text>
        ) : null}
      </FitnessCard>

      <SectionHeading title="Pain or limitations" />
      <FitnessCard>
        <Text style={styles.label}>Any current pain when lifting?</Text>
        <ChipGroup options={YES_NO} selectedId={plan.painNow ? 'yes' : 'no'} onSelect={(id) => updateDeadliftPlan({ painNow: id === 'yes' })} accessibilityLabel="Current pain" />
        <TextInput
          value={plan.limitationNote}
          onChangeText={(limitationNote) => updateDeadliftPlan({ limitationNote })}
          placeholder="Optional note, e.g. old lower-back strain, mobility limits"
          placeholderTextColor={colors.textSecondary}
          maxLength={200}
          multiline
          selectionColor={colors.accent}
          accessibilityLabel="Lifting limitation note"
          style={styles.textArea}
        />
        {plan.painNow ? (
          <Notice tone="danger" message="With current pain, heavy sessions are disabled and only light, pain-free technique work is suggested. Please consider a qualified professional." />
        ) : null}
      </FitnessCard>

      {/* ---------- Calculator ---------- */}
      <SectionHeading title="Weight calculator" subtitle="Transparent and conservative" />
      <FitnessCard variant="highlight">
        {suggestion.estimate.reliable ? (
          <>
            <Text style={styles.label}>{suggestion.estimate.source === 'known' ? 'Using your known 1-rep max' : 'Estimated strength'}</Text>
            <Text style={styles.big}>≈ {formatLoad(suggestion.estimate.value, unit)}</Text>
            {suggestion.estimate.source === 'estimate' ? (
              <Text style={styles.caption}>
                From {formatLoad(plan.recentWeightKg, unit)} × {plan.recentReps} with {RIR_OPTIONS.find((o) => o.id === plan.recentRir)?.name} reps
                left: Epley ≈ {formatLoad(suggestion.estimate.epley, unit)}, Brzycki ≈ {formatLoad(suggestion.estimate.brzycki, unit)}. FITME uses the
                lower value. Estimates are uncertain and are never a target to test.
              </Text>
            ) : null}
          </>
        ) : (
          <Text style={styles.body}>{suggestion.estimate.reason ?? 'Not enough data.'} A light technique plan is suggested.</Text>
        )}
        <Text style={[styles.label, styles.spaced]}>Suggested working sets</Text>
        <Text style={styles.bigSmall}>
          {formatLoad(suggestion.working.weightKg, unit)} × {suggestion.working.reps} reps × {suggestion.working.sets} sets
        </Text>
        <Text style={styles.caption}>
          {suggestion.percent ? `${suggestion.percent}% of estimate, rounded down to your plates · ` : ''}rest {suggestion.working.restSeconds}s · RPE{' '}
          {suggestion.working.targetRpe}
        </Text>
        <Text style={styles.caption}>
          Warm-ups: {suggestion.warmups.map((warmup) => `${formatLoad(warmup.weightKg, unit)}×${warmup.reps}`).join(', ') || 'none'}
        </Text>
        {suggestion.notes.map((note) => (
          <Text key={note} style={styles.caption}>
            •  {note}
          </Text>
        ))}
        <PrimaryButton title="Use these suggestions" icon="calculator-outline" onPress={applySuggestion} />
      </FitnessCard>
      {plan.experience === 'beginner' ? <Notice title="Coaching" message={COACH_NOTICE} /> : null}

      {/* ---------- Manual targets ---------- */}
      <SectionHeading title="Working sets (manual override)" subtitle="Strength: typically 2–4 sets of 3–6 reps" />
      <FitnessCard>
        <LoadInput
          key={`work-${unit}-${plan.working.weightKg}`}
          label="Working weight"
          valueKg={plan.working.weightKg}
          unit={unit}
          minKg={DEADLIFT_LIMITS.weightKg.min}
          maxKg={DEADLIFT_LIMITS.weightKg.max}
          onCommit={(weightKg) => setWorking({ weightKg })}
        />
        <View style={styles.row}>
          <Stepper label="Sets" value={plan.working.sets} min={DEADLIFT_LIMITS.workingSets.min} max={DEADLIFT_LIMITS.workingSets.max} onChange={(sets) => setWorking({ sets })} />
          <Stepper label="Reps" value={plan.working.reps} min={DEADLIFT_LIMITS.workingReps.min} max={DEADLIFT_LIMITS.workingReps.max} onChange={(reps) => setWorking({ reps })} />
          <Stepper
            label="Rest"
            value={plan.working.restSeconds}
            min={DEADLIFT_LIMITS.restSeconds.min}
            max={DEADLIFT_LIMITS.restSeconds.max}
            step={DEADLIFT_LIMITS.restSeconds.step}
            format={(seconds) => `${seconds}s`}
            unitLabel="seconds"
            onChange={(restSeconds) => setWorking({ restSeconds })}
          />
        </View>
        <Text style={styles.label}>Target effort</Text>
        <ChipGroup options={TARGET_RPES} selectedId={plan.working.targetRpe} onSelect={(targetRpe) => setWorking({ targetRpe })} accessibilityLabel="Target RPE" />
      </FitnessCard>

      <SectionHeading title="Warm-up sets" subtitle="Lighter preparation sets — not counted" />
      <FitnessCard>
        {plan.warmups.map((warmup, index) => (
          <View key={`${index}-${warmup.weightKg}-${unit}`} style={styles.warmupRow}>
            <Text style={styles.warmupLabel}>W{index + 1}</Text>
            <LoadInput compact valueKg={warmup.weightKg} unit={unit} minKg={plan.barKg} maxKg={DEADLIFT_LIMITS.weightKg.max} accessibilityLabel={`Warm-up ${index + 1} weight`} onCommit={(weightKg) => setWarmup(index, { weightKg })} />
            <Stepper label="Reps" value={warmup.reps} min={1} max={DEADLIFT_LIMITS.warmupReps.max} onChange={(reps) => setWarmup(index, { reps })} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={`Remove warm-up ${index + 1}`}
              onPress={() => updateDeadliftPlan({ warmups: plan.warmups.filter((_, i) => i !== index) })}
              style={styles.remove}
            >
              <Text style={styles.removeText}>✕</Text>
            </Pressable>
          </View>
        ))}
        <View style={styles.row}>
          <SecondaryButton
            title="Add warm-up"
            icon="add"
            disabled={plan.warmups.length >= DEADLIFT_LIMITS.maxWarmups}
            onPress={() => updateDeadliftPlan({ warmups: [...plan.warmups, { weightKg: plan.barKg, reps: 5 }].sort((a, b) => a.weightKg - b.weightKg) })}
            style={styles.flexButton}
          />
          <SecondaryButton
            title="Regenerate"
            icon="refresh"
            onPress={() => updateDeadliftPlan({ warmups: generateWarmups(plan.working.weightKg, plan.barKg, plan.plates) })}
            style={styles.flexButton}
          />
        </View>
        <Text style={styles.caption}>Adjust warm-ups to your plates and how you feel. Stop if they feel unusually heavy.</Text>
      </FitnessCard>

      {/* ---------- Equipment ---------- */}
      <SectionHeading title="Equipment" />
      <FitnessCard>
        <Text style={styles.label}>Bar</Text>
        <ChipGroup options={BAR_OPTIONS} selectedId={String(plan.barKg)} onSelect={(id) => updateDeadliftPlan({ barKg: Number(id) })} accessibilityLabel="Bar weight" />
        <Text style={styles.label}>Plates available (kg)</Text>
        <View style={styles.chips}>
          {PLATE_SIZES_KG.map((plate) => {
            const on = plan.plates.includes(plate);
            return (
              <Pressable
                key={plate}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                accessibilityLabel={`${plate} kilogram plates`}
                onPress={() => togglePlate(plate)}
                style={[styles.chip, on && styles.chipOn]}
              >
                <Text style={[styles.chipText, on && styles.chipTextOn]}>{plate}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={styles.label}>Trap bar available?</Text>
        <ChipGroup options={YES_NO} selectedId={plan.trapBarAvailable ? 'yes' : 'no'} onSelect={(id) => updateDeadliftPlan({ trapBarAvailable: id === 'yes' })} accessibilityLabel="Trap bar available" />
      </FitnessCard>

      {/* ---------- Schedule ---------- */}
      <SectionHeading title="Schedule" />
      <FitnessCard>
        <Text style={styles.label}>Training split</Text>
        <ChipGroup
          options={SPLITS}
          selectedId={plan.split}
          onSelect={(id) => {
            const next = SPLITS.find((item) => item.id === id);
            updateDeadliftPlan({ split: id, ...(next.recommendedWeekday !== null ? { deadliftWeekday: next.recommendedWeekday } : {}) });
          }}
          accessibilityLabel="Training split"
        />
        <Text style={styles.caption}>
          {split.recommendedWeekday !== null
            ? `Recommended: ${split.dayLabel} on ${WEEKDAYS_SHORT[split.recommendedWeekday].name} (matches the FITME advanced ${split.name} plan).`
            : 'Custom: checked against your currently selected workout plan.'}
        </Text>
        <Text style={styles.label}>Deadlift day</Text>
        <ChipGroup options={WEEKDAYS_SHORT} selectedId={String(plan.deadliftWeekday)} onSelect={(id) => updateDeadliftPlan({ deadliftWeekday: Number(id) })} accessibilityLabel="Deadlift day" />
        <Text style={styles.label}>How often to go heavy</Text>
        <ChipGroup options={FREQUENCIES} selectedId={plan.frequency} onSelect={(frequency) => updateDeadliftPlan({ frequency })} accessibilityLabel="Heavy frequency" />
        {warnings.length === 0 ? (
          <Text style={styles.ok}>No back-to-back heavy posterior-chain days found.</Text>
        ) : (
          warnings.map((warning) => <Notice key={warning} tone="warning" message={warning} />)
        )}
      </FitnessCard>

      {/* ---------- Accessories ---------- */}
      <SectionHeading title="Optional accessories" subtitle="Moderate work after deadlifts — skip any time" />
      <FitnessCard>
        {plan.accessories.map((item, index) => {
          const exercise = getExerciseById(item.exerciseId);
          const setAccessory = (changes) =>
            updateDeadliftPlan({ accessories: plan.accessories.map((acc, i) => (i === index ? { ...acc, ...changes } : acc)) });
          return (
            <View key={item.exerciseId} style={styles.accessory}>
              <View style={styles.rowBetween}>
                <Text style={[styles.body, styles.flex]}>{exercise?.name}</Text>
                <ChipGroup options={YES_NO} selectedId={item.enabled ? 'yes' : 'no'} onSelect={(id) => setAccessory({ enabled: id === 'yes' })} accessibilityLabel={`Include ${exercise?.name}`} />
              </View>
              {item.enabled ? (
                <Stepper label={`Sets (${item.reps} reps)`} value={item.sets} min={2} max={3} onChange={(sets) => setAccessory({ sets })} />
              ) : null}
            </View>
          );
        })}
        <Text style={styles.caption}>Heavy rack pulls or heavy bent-over rows are not recommended after a deadlift session.</Text>
      </FitnessCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  caption: {
    ...typography.caption,
  },
  body: {
    ...typography.body,
  },
  label: {
    ...typography.label,
    color: colors.accent,
  },
  spaced: {
    marginTop: spacing.sm,
  },
  big: {
    ...typography.title,
    color: colors.accent,
  },
  bigSmall: {
    ...typography.subheading,
    color: colors.accent,
  },
  error: {
    ...typography.caption,
    color: colors.error,
  },
  ok: {
    ...typography.caption,
    color: colors.accent,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    alignItems: 'flex-end',
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  flex: {
    flex: 1,
    minWidth: 140,
  },
  flexButton: {
    flex: 1,
    minWidth: 140,
  },
  textArea: {
    minHeight: 72,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.md,
    textAlignVertical: 'top',
    ...typography.body,
  },
  warmupRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    gap: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  warmupLabel: {
    ...typography.bodyStrong,
    width: 28,
    paddingBottom: spacing.md,
  },
  remove: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    ...typography.subheading,
    color: colors.error,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    minWidth: layout.minTouchTarget,
    minHeight: layout.minTouchTarget,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipOn: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  chipText: {
    ...typography.bodyStrong,
  },
  chipTextOn: {
    color: colors.onAccent,
  },
  accessory: {
    gap: spacing.sm,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
