import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, layout, radius, spacing, typography } from '../theme';
import { kgToUnit, unitToKg } from '../utils/units';
import { parseDecimal } from '../utils/validation';

function display(kg, unit) {
  if (!Number.isFinite(kg)) return '';
  return String(Number(kgToUnit(kg, unit).toFixed(unit === 'lb' ? 1 : 2)));
}

// Weight entry in the chosen display unit; always reports kilograms. Invalid input is rejected with a
// short message and the previous value is kept. Remount with a `key` to show an outside change.
export default function LoadInput({
  valueKg,
  unit = 'kg',
  minKg = 0,
  maxKg = 500,
  onCommit,
  label,
  accessibilityLabel,
  compact = false,
  allowEmpty = false,
  placeholder,
}) {
  const [text, setText] = useState(display(valueKg, unit));
  const [error, setError] = useState(null);

  const commit = () => {
    if (text.trim() === display(valueKg, unit)) return;
    if (allowEmpty && text.trim() === '') {
      setError(null);
      onCommit(null);
      return;
    }
    const value = parseDecimal(text);
    const kg = unitToKg(value, unit);
    if (!Number.isFinite(value) || kg < minKg || kg > maxKg) {
      setError(`Enter ${Math.ceil(kgToUnit(minKg, unit))}–${Math.floor(kgToUnit(maxKg, unit))} ${unit}`);
      setText(display(valueKg, unit));
      return;
    }
    setError(null);
    onCommit(Math.round(kg * 100) / 100);
  };

  return (
    <View style={[styles.container, compact && styles.compact]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={[styles.inputRow, error && styles.inputError]}>
        <TextInput
          value={text}
          onChangeText={(value) => {
            setText(value);
            if (error) setError(null);
          }}
          onEndEditing={commit}
          onSubmitEditing={commit}
          keyboardType="decimal-pad"
          inputMode="decimal"
          returnKeyType="done"
          maxLength={6}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          selectTextOnFocus
          selectionColor={colors.accent}
          cursorColor={colors.accent}
          accessibilityLabel={accessibilityLabel ?? `${label ?? 'Weight'} in ${unit}`}
          style={styles.input}
        />
        <Text style={styles.unit}>{unit}</Text>
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
    flexBasis: 120,
  },
  compact: {
    flexGrow: 0,
    flexBasis: 'auto',
    width: 104,
  },
  label: {
    ...typography.label,
  },
  inputRow: {
    minHeight: layout.minTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.sm,
  },
  inputError: {
    borderColor: colors.error,
  },
  input: {
    flex: 1,
    ...typography.metricSmall,
    paddingVertical: spacing.xs,
  },
  unit: {
    ...typography.caption,
  },
  error: {
    ...typography.caption,
    color: colors.error,
  },
});
