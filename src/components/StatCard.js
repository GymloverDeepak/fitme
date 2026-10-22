import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../theme';

// Compact number tile. Place several in a row; each one flexes to share the width.
export default function StatCard({ label, value, unit, caption, style }) {
  const spokenValue = [value, unit].filter(Boolean).join(' ');
  return (
    <View
      style={[styles.card, style]}
      accessible
      accessibilityLabel={`${label}: ${spokenValue}${caption ? `. ${caption}` : ''}`}
    >
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <View style={styles.valueRow}>
        <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
          {value}
        </Text>
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
      {caption ? <Text style={styles.caption}>{caption}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  value: {
    ...typography.title,
    color: colors.primary,
    flexShrink: 1,
  },
  unit: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  caption: {
    ...typography.caption,
  },
});
