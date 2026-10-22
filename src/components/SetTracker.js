import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, layout, radius, spacing, typography } from '../theme';

// Tappable chips for working sets. Warm-up sets are listed separately and are not tracked.
// Tapping set N marks sets 1…N done; tapping the last done set again un-marks it.
export default function SetTracker({ exerciseName, totalSets, warmupSets = 0, doneCount, onChange }) {
  const handlePress = (setNumber) => {
    onChange(setNumber === doneCount ? setNumber - 1 : setNumber);
  };

  return (
    <View style={styles.container}>
      {warmupSets > 0 ? (
        <Text style={styles.warmup}>
          Warm-up first: {warmupSets} lighter set{warmupSets > 1 ? 's' : ''} (not counted)
        </Text>
      ) : null}
      <View style={styles.row}>
        <Text style={styles.label}>Working sets</Text>
        {Array.from({ length: totalSets }, (_, index) => {
          const setNumber = index + 1;
          const done = setNumber <= doneCount;
          return (
            <Pressable
              key={setNumber}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: done }}
              accessibilityLabel={`${exerciseName}, working set ${setNumber} of ${totalSets}`}
              onPress={() => handlePress(setNumber)}
              hitSlop={4}
              style={({ pressed }) => [styles.chip, done && styles.chipDone, pressed && styles.pressed]}
            >
              <Text style={[styles.chipText, done && styles.chipTextDone]}>{setNumber}</Text>
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
  warmup: {
    ...typography.caption,
    color: colors.warning,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
    marginRight: spacing.xs,
  },
  chip: {
    minWidth: layout.minTouchTarget - 4,
    height: layout.minTouchTarget - 4,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  chipDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pressed: {
    opacity: 0.7,
  },
  chipText: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  chipTextDone: {
    color: colors.onPrimary,
  },
});
