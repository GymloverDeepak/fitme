import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, layout, spacing, typography } from '../theme';

// Section title with optional subtitle and a text action on the right (e.g. "See all").
export default function SectionHeading({ title, subtitle, actionLabel, onActionPress, actionAccessibilityLabel }) {
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {actionLabel && onActionPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={actionAccessibilityLabel ?? actionLabel}
          onPress={onActionPress}
          hitSlop={8}
          style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
        >
          <Text style={styles.actionLabel}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: -spacing.sm,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.heading,
  },
  subtitle: {
    ...typography.caption,
  },
  action: {
    minHeight: layout.minTouchTarget,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: 8,
  },
  actionPressed: {
    backgroundColor: colors.primarySoft,
  },
  actionLabel: {
    ...typography.bodyStrong,
    color: colors.primary,
  },
});
