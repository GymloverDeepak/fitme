import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, layout, radius, spacing, typography } from '../theme';

// Main call-to-action: solid neon green with dark text.
export default function PrimaryButton({
  title,
  onPress,
  icon,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  style,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed, disabled && styles.disabled, style]}
    >
      {icon ? (
        <Ionicons name={icon} size={20} color={disabled ? colors.textSecondary : colors.onPrimary} />
      ) : null}
      <Text style={[styles.label, disabled && styles.labelDisabled]} numberOfLines={2}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: layout.minTouchTarget + 4,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  pressed: {
    backgroundColor: colors.primaryPressed,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    backgroundColor: colors.disabled,
  },
  label: {
    ...typography.button,
    color: colors.onPrimary,
    textAlign: 'center',
    flexShrink: 1,
  },
  labelDisabled: {
    color: colors.textSecondary,
  },
});
