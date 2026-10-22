import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, layout, radius, spacing, typography } from '../theme';

// Single-choice selector. options: [{ id, name }]. Chips wrap onto new lines on narrow screens.
export default function ChipGroup({ options, selectedId, onSelect, accessibilityLabel }) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel={accessibilityLabel}>
      {options.map((option) => {
        const selected = option.id === selectedId;
        return (
          <Pressable
            key={option.id}
            accessibilityRole="radio"
            accessibilityState={{ checked: selected }}
            accessibilityLabel={option.name}
            onPress={() => onSelect(option.id)}
            style={({ pressed }) => [styles.chip, selected && styles.chipSelected, pressed && !selected && styles.pressed]}
          >
            <Text style={[styles.label, selected && styles.labelSelected]}>{option.name}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    minHeight: layout.minTouchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pressed: {
    backgroundColor: colors.cardPressed,
  },
  label: {
    ...typography.bodyStrong,
    color: colors.textPrimary,
  },
  labelSelected: {
    color: colors.onPrimary,
  },
});
