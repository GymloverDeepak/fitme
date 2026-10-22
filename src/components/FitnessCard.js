import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radius, spacing } from '../theme';

// Rounded surface for grouping content. Pass onPress to make the whole card tappable.
// variant: 'default' | 'highlight' (neon border) | 'accent' (neon background, use dark text inside)
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
  const cardStyle = [styles.card, variant === 'highlight' && styles.highlight, variant === 'accent' && styles.accent];

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
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  highlight: {
    borderColor: colors.primary,
  },
  accent: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  pressed: {
    backgroundColor: colors.cardPressed,
  },
  accentPressed: {
    backgroundColor: colors.primaryPressed,
  },
});
