import { StyleSheet, Text, View } from 'react-native';

import { useAppState } from '../storage/AppStateContext';
import { GLASS_SIZE_ML } from '../storage/sanitize';
import { colors, spacing, typography } from '../theme';
import FitnessCard from './FitnessCard';
import PrimaryButton from './PrimaryButton';
import ProgressBar from './ProgressBar';
import SecondaryButton from './SecondaryButton';

// Today's water intake with +/- controls. Saved on this device and reset each new day.
export default function WaterTracker() {
  const { waterToday, settings, changeWater } = useAppState();
  const goal = settings.waterGoalGlasses;
  const reachedGoal = waterToday >= goal;

  return (
    <FitnessCard variant={reachedGoal ? 'highlight' : 'default'}>
      <View style={styles.header}>
        <Text style={styles.label}>Water today</Text>
        {reachedGoal ? <Text style={styles.goalReached}>Goal reached</Text> : null}
      </View>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{waterToday}</Text>
        <Text style={styles.unit}>
          of {goal} glasses · {waterToday * GLASS_SIZE_ML} / {goal * GLASS_SIZE_ML} ml
        </Text>
      </View>
      <ProgressBar
        progress={waterToday / goal}
        tone={reachedGoal ? 'success' : 'accent'}
        accessibilityLabel="Water goal progress"
      />
      <View style={styles.buttons}>
        <SecondaryButton
          title="Glass"
          icon="remove"
          onPress={() => changeWater(-1)}
          disabled={waterToday === 0}
          accessibilityLabel="Remove one glass of water"
          style={styles.button}
        />
        <PrimaryButton
          title="Glass"
          icon="add"
          onPress={() => changeWater(1)}
          accessibilityLabel={`Add one glass of water, ${GLASS_SIZE_ML} millilitres`}
          style={styles.button}
        />
      </View>
      <Text style={styles.note}>1 glass = {GLASS_SIZE_ML} ml. Change your goal in Settings.</Text>
    </FitnessCard>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    ...typography.label,
  },
  goalReached: {
    ...typography.label,
    color: colors.success,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  value: {
    ...typography.metric,
    fontSize: 32,
    lineHeight: 38,
    color: colors.accent,
  },
  unit: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  buttons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  button: {
    flex: 1,
  },
  note: {
    ...typography.caption,
  },
});
