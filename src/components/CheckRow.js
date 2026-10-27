import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, layout, radius, spacing, typography } from '../theme';

// Full-width tappable checkbox with a label (checklists, set completion…).
export default function CheckRow({ label, detail, checked, onToggle, accessibilityLabel }) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      accessibilityLabel={accessibilityLabel ?? label}
      onPress={onToggle}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked ? <Ionicons name="checkmark" size={18} color={colors.onAccent} /> : null}
      </View>
      <View style={styles.text}>
        <Text style={[styles.label, checked && styles.labelChecked]}>{label}</Text>
        {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: layout.minTouchTarget,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  pressed: {
    backgroundColor: colors.surfacePressed,
  },
  box: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  label: {
    ...typography.body,
  },
  labelChecked: {
    color: colors.textSecondary,
  },
  detail: {
    ...typography.caption,
  },
});
