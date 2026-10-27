import { StyleSheet, View } from 'react-native';

import { colors, radius } from '../theme';

const TONE_COLORS = {
  accent: colors.accent,
  success: colors.success,
  warning: colors.warning,
};

// Horizontal bar. progress is a fraction from 0 to 1. tone="success" once a goal is complete.
export default function ProgressBar({ progress, accessibilityLabel, tone = 'accent', thin = false }) {
  const clamped = Math.min(1, Math.max(0, Number(progress) || 0));
  return (
    <View
      style={[styles.track, thin && styles.thin]}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
    >
      <View
        style={[styles.fill, { width: `${clamped * 100}%`, backgroundColor: TONE_COLORS[tone] ?? colors.accent }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.backgroundSecondary,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  thin: {
    height: 4,
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
  },
});
