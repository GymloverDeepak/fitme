import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { borders, colors, layout, radius, spacing, typography } from '../theme';

// Tappable chips for working sets. Warm-up sets are listed separately and are not tracked.
// Tapping set N marks sets 1…N done; tapping the last done set again un-marks it.
// States: completed (green with a tick), current (the next set, electric-blue outline), pending (plain).
export default function SetTracker({ exerciseName, totalSets, warmupSets = 0, doneCount, onChange }) {
  const handlePress = (setNumber) => {
    onChange(setNumber === doneCount ? setNumber - 1 : setNumber);
  };

  return (
    <View style={styles.container}>
      {warmupSets > 0 ? (
        <View style={styles.warmupRow}>
          <Ionicons name="flame-outline" size={14} color={colors.warning} />
          <Text style={styles.warmup}>
            Warm-up first: {warmupSets} lighter set{warmupSets > 1 ? 's' : ''} (not counted)
          </Text>
        </View>
      ) : null}
      <View style={styles.row}>
        <Text style={styles.label}>
          Sets {doneCount}/{totalSets}
        </Text>
        {Array.from({ length: totalSets }, (_, index) => {
          const setNumber = index + 1;
          const done = setNumber <= doneCount;
          const current = setNumber === doneCount + 1;
          const stateText = done ? 'completed' : current ? 'current' : 'pending';
          return (
            <Pressable
              key={setNumber}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: done }}
              accessibilityLabel={`${exerciseName}, working set ${setNumber} of ${totalSets}, ${stateText}`}
              onPress={() => handlePress(setNumber)}
              hitSlop={4}
              style={({ pressed }) => [
                styles.chip,
                done && styles.chipDone,
                current && styles.chipCurrent,
                pressed && styles.pressed,
              ]}
            >
              {done ? <Ionicons name="checkmark" size={14} color={colors.onSuccess} /> : null}
              <Text style={[styles.chipText, done && styles.chipTextDone, current && styles.chipTextCurrent]}>
                {setNumber}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
  },
  warmupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  warmup: {
    ...typography.caption,
    color: colors.warning,
    flexShrink: 1,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
    fontVariant: ['tabular-nums'],
    marginRight: spacing.xs,
  },
  chip: {
    minWidth: layout.minTouchTarget - 4,
    height: layout.minTouchTarget - 4,
    flexDirection: 'row',
    gap: 2,
    borderRadius: radius.md,
    borderWidth: borders.thin,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  chipDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  chipCurrent: {
    borderWidth: 2,
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  pressed: {
    opacity: 0.7,
  },
  chipText: {
    ...typography.metricSmall,
    color: colors.textSecondary,
  },
  chipTextDone: {
    color: colors.onSuccess,
  },
  chipTextCurrent: {
    color: colors.accent,
  },
});
