import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, layout, radius, spacing, typography } from '../theme';

// Labelled numeric input with a unit suffix and inline error message.
export default function NumberField({ label, value, onChangeText, unit, error, placeholder, onSubmitEditing }) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, error && styles.inputRowError]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSubmitEditing}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          keyboardType="decimal-pad"
          inputMode="decimal"
          returnKeyType="done"
          maxLength={7}
          selectionColor={colors.accent}
          cursorColor={colors.accent}
          accessibilityLabel={unit ? `${label} in ${unit}` : label}
          accessibilityHint={error ?? undefined}
          style={styles.input}
        />
        {unit ? <Text style={styles.unit}>{unit}</Text> : null}
      </View>
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
    flexGrow: 1,
    flexBasis: 140,
  },
  label: {
    ...typography.label,
  },
  inputRow: {
    minHeight: layout.minTouchTarget + 4,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.md,
  },
  inputRowError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    ...typography.subheading,
    fontVariant: ['tabular-nums'],
    paddingVertical: spacing.sm,
  },
  unit: {
    ...typography.bodyStrong,
    color: colors.textSecondary,
  },
  error: {
    ...typography.caption,
    color: colors.error,
  },
});
