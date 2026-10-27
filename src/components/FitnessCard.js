import { Pressable, StyleSheet, View } from 'react-native';

import { borders, colors, radius, spacing } from '../theme';

// Titanium surface for grouping content. Pass onPress to make the whole card tappable.
// variant: 'default' | 'elevated' (lighter surface) | 'highlight' (electric-blue edge, for the
// current / selected item) | 'accent' (solid electric blue, use colors.onAccent text inside)
export default function FitnessCard({
  children,
  onPress,
  variant = 'default',
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
  accessibilityState,
  style,
}) {
  const cardStyle = [styles.card, VARIANT_STYLES[variant]];

  if (!onPress) {
    return <View style={[...cardStyle, style]}>{children}</View>;
  }

  return (
    <Pressable
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={accessibilityState}
      onPress={onPress}
      style={({ pressed }) => [
        ...cardStyle,
        pressed && (variant === 'accent' ? styles.accentPressed : styles.pressed),
        style,
      ]}
    >
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: borders.thin,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  elevated: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.borderStrong,
  },
  highlight: {
    backgroundColor: colors.surfaceElevated,
    borderColor: colors.accentMuted,
    borderLeftWidth: borders.marker,
    borderLeftColor: colors.accent,
  },
  accent: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  pressed: {
    backgroundColor: colors.surfacePressed,
  },
  accentPressed: {
    backgroundColor: colors.accentPressed,
  },
});

const VARIANT_STYLES = {
  default: null,
  elevated: styles.elevated,
  highlight: styles.highlight,
  accent: styles.accent,
};
