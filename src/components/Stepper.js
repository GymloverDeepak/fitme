import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, layout, radius, spacing, typography } from '../theme';

// Compact − value + control for small whole numbers (sets, rest seconds…).
export default function Stepper({ label, value, min, max, step = 1, onChange, format = String, unitLabel }) {
  const canDecrease = value - step >= min;
  const canIncrease = value + step <= max;
  const spoken = `${label}: ${format(value)}${unitLabel ? ` ${unitLabel}` : ''}`;

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row} accessible={false}>
        <StepButton
          icon="remove"
          disabled={!canDecrease}
          onPress={() => onChange(value - step)}
          accessibilityLabel={`Decrease ${label}`}
        />
        <Text style={styles.value} accessibilityLabel={spoken} accessibilityLiveRegion="polite">
          {format(value)}
        </Text>
        <StepButton
          icon="add"
          disabled={!canIncrease}
          onPress={() => onChange(value + step)}
          accessibilityLabel={`Increase ${label}`}
        />
      </View>
    </View>
  );
}

function StepButton({ icon, disabled, onPress, accessibilityLabel }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, disabled && styles.disabled]}
    >
      <Ionicons name={icon} size={20} color={disabled ? colors.textSecondary : colors.accent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    flexBasis: 130,
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  button: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    backgroundColor: colors.accentSoft,
  },
  disabled: {
    opacity: 0.5,
  },
  value: {
    ...typography.metricSmall,
    fontSize: 18,
    minWidth: 40,
    textAlign: 'center',
    fontVariant: ['tabular-nums'],
  },
});
