import { StyleSheet, View } from 'react-native';

import { spacing } from '../theme';

// Lays StatCards side by side; they wrap onto a new line when the screen is too narrow.
export default function StatRow({ children }) {
  return <View style={styles.row}>{children}</View>;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
});
