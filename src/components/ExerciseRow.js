import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, layout, radius, spacing, typography } from '../theme';

// One exercise in a list.
// - Checklist mode: pass `completed` (true/false) and `onToggle`; an optional `onInfoPress` opens details.
// - Link mode: leave `completed` undefined and pass `onPress` to open details.
// Optional: `thumbnail` (e.g. a demonstration), a side action button (`actionIcon`, `actionLabel`,
// `onActionPress`) and `children` rendered under the row inside the same card (e.g. a set tracker).
export default function ExerciseRow({
  name,
  detail,
  completed,
  onToggle,
  onPress,
  onInfoPress,
  index,
  thumbnail,
  actionIcon,
  actionLabel,
  onActionPress,
  actionDisabled = false,
  children,
}) {
  const isChecklist = typeof completed === 'boolean';
  const prefix = typeof index === 'number' ? `${index + 1}. ` : '';

  const body = (
    <>
      {isChecklist ? (
        <View style={[styles.check, completed && styles.checkDone]}>
          {completed ? <Ionicons name="checkmark" size={18} color={colors.onPrimary} /> : null}
        </View>
      ) : typeof index === 'number' && !thumbnail ? (
        <View style={styles.indexBadge}>
          <Text style={styles.indexText}>{index + 1}</Text>
        </View>
      ) : null}
      {thumbnail}
      <View style={styles.text}>
        <Text style={[styles.name, completed && styles.nameDone]}>{name}</Text>
        {detail ? <Text style={styles.detail}>{detail}</Text> : null}
      </View>
      {!isChecklist && onPress && !onActionPress ? (
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      ) : null}
    </>
  );

  const rowPress = isChecklist ? onToggle : onPress;
  const sideButton = onActionPress
    ? { icon: actionIcon ?? 'add', label: actionLabel ?? 'Action', onPress: onActionPress, disabled: actionDisabled }
    : isChecklist && onInfoPress
      ? { icon: 'information-circle-outline', label: `How to do ${name}`, onPress: onInfoPress, disabled: false }
      : null;

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        {rowPress ? (
          <Pressable
            accessibilityRole={isChecklist ? 'checkbox' : 'button'}
            accessibilityState={isChecklist ? { checked: completed } : undefined}
            accessibilityLabel={`${prefix}${name}${detail ? `, ${detail}` : ''}`}
            accessibilityHint={isChecklist ? 'Marks all sets of this exercise as done or not done' : 'Opens exercise details'}
            onPress={rowPress}
            style={({ pressed }) => [styles.row, pressed && styles.pressed]}
          >
            {body}
          </Pressable>
        ) : (
          <View style={styles.row}>{body}</View>
        )}
        {sideButton ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={sideButton.label}
            accessibilityState={{ disabled: sideButton.disabled }}
            disabled={sideButton.disabled}
            onPress={sideButton.onPress}
            style={({ pressed }) => [styles.sideButton, pressed && styles.pressed]}
          >
            <Ionicons
              name={sideButton.icon}
              size={24}
              color={sideButton.disabled ? colors.textSecondary : colors.primary}
            />
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  top: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  row: {
    flex: 1,
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  pressed: {
    backgroundColor: colors.cardPressed,
  },
  check: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkDone: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  indexBadge: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  text: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.bodyStrong,
  },
  nameDone: {
    color: colors.textSecondary,
    textDecorationLine: 'line-through',
  },
  detail: {
    ...typography.caption,
  },
  sideButton: {
    width: layout.minTouchTarget + 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
  },
});
