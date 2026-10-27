import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '../theme';

// Compact number tile. Place several in a row; each one flexes to share the width.
// Optional icon sits beside the label; the value uses tabular figures so numbers line up.
export default function StatCard({ label, value, unit, caption, icon, style }) {
  const spokenValue = [value, unit].filter(Boolean).join(' ');
  return (
    <View
      style={[styles.card, style]}
      accessible
      accessibilityLabel={`${label}: ${spokenValue}${caption ? `. ${caption}` : ''}`}
    >
      <View style={styles.labelRow}>
        {icon ? <Ionicons name={icon} size={14} color={colors.accent} /> : null}
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
      </View>
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
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: {
    ...typography.label,
    flexShrink: 1,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
  },
  value: {
    ...typography.metric,
    flexShrink: 1,
  },
  unit: {
    ...typography.caption,
    fontWeight: '600',
  },
  caption: {
    ...typography.caption,
  },
});
