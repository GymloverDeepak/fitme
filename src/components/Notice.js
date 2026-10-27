import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { borders, colors, layout, radius, spacing, typography } from '../theme';

const TONES = {
  info: { icon: 'information-circle-outline', color: colors.accent, background: colors.accentSoft },
  warning: { icon: 'warning-outline', color: colors.warning, background: colors.warningSoft },
  success: { icon: 'checkmark-circle-outline', color: colors.success, background: colors.successSoft },
  danger: { icon: 'alert-circle-outline', color: colors.error, background: colors.errorSoft },
};

// Inline message box for disclaimers, sample-data labels and storage warnings.
export default function Notice({ tone = 'info', title, message, onDismiss }) {
  const palette = TONES[tone] ?? TONES.info;
  return (
    <View
      style={[styles.container, { backgroundColor: palette.background, borderLeftColor: palette.color }]}
      accessibilityRole={tone === 'info' ? undefined : 'alert'}
    >
      <Ionicons name={palette.icon} size={20} color={palette.color} style={styles.icon} />
      <View style={styles.text}>
        {title ? <Text style={[styles.title, { color: palette.color }]}>{title}</Text> : null}
        <Text style={styles.message}>{message}</Text>
      </View>
      {onDismiss ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Dismiss message"
          onPress={onDismiss}
          style={styles.dismiss}
          hitSlop={4}
        >
          <Ionicons name="close" size={20} color={colors.textSecondary} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: borders.thin,
    borderColor: colors.border,
    borderLeftWidth: borders.marker,
  },
  icon: {
    marginTop: 1,
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.bodyStrong,
  },
  message: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  dismiss: {
    width: layout.minTouchTarget,
    height: layout.minTouchTarget,
    margin: -spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
