import { StyleSheet, View } from 'react-native';

import { colors, radius } from '../theme';

// Horizontal bar. progress is a fraction from 0 to 1.
export default function ProgressBar({ progress, accessibilityLabel }) {
  const clamped = Math.min(1, Math.max(0, Number(progress) || 0));
  return (
    <View
      style={styles.track}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
    >
      <View style={[styles.fill, { width: `${clamped * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
  },
});
