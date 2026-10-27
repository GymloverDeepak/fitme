import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text } from 'react-native';

import { borders, colors, layout, radius, spacing, typography } from '../theme';

const TONES = {
  accent: { color: colors.accent, pressedBackground: colors.accentSoft },
  danger: { color: colors.error, pressedBackground: colors.errorSoft },
};

// Outlined button on a faint titanium fill for secondary actions. tone="danger" for destructive actions.
export default function SecondaryButton({
  title,
  onPress,
  icon,
  tone = 'accent',
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  style,
}) {
  const palette = TONES[tone] ?? TONES.accent;
  const contentColor = disabled ? colors.textSecondary : palette.color;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { borderColor: disabled ? colors.border : palette.color },
        pressed && { backgroundColor: palette.pressedBackground, transform: [{ scale: 0.98 }] },
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={20} color={contentColor} /> : null}
      <Text style={[styles.label, { color: contentColor }]} numberOfLines={2}>
        {title}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: layout.minTouchTarget + 4,
    borderRadius: radius.md,
    borderWidth: borders.thin,
    backgroundColor: colors.backgroundSecondary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  label: {
    ...typography.button,
    textAlign: 'center',
    flexShrink: 1,
  },
});
